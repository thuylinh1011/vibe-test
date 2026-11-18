"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const db = require("./lib/db");
const auth = require("./lib/auth");
const { validatePlayer } = require("./lib/validate");
const { playersToCsv } = require("./lib/csv");
const adminPages = require("./lib/adminPages");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ALLOWED_STATIC_DIRS = ["app", "design"];
const MAX_BODY_BYTES = 1024 * 1024; // 1MB, đủ cho form đăng ký

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function send(res, status, body, headers) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), { "Content-Type": "application/json; charset=utf-8" });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload quá lớn"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(Object.assign(new Error("JSON không hợp lệ"), { statusCode: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function requireAdmin(req) {
  const token = auth.getSessionTokenFromRequest(req);
  return auth.isValidSession(token);
}

// ---- Static file serving (app/, design/) ----
function serveStatic(req, res, urlPath) {
  const topDir = urlPath.split("/").filter(Boolean)[0];
  if (!ALLOWED_STATIC_DIRS.includes(topDir)) {
    send(res, 404, "Không tìm thấy", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(path.join(ROOT, topDir))) {
    send(res, 403, "Cấm truy cập", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, "Không tìm thấy", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
  });
}

// ---- API: đăng ký người chơi ----
async function handleCreatePlayer(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, err.statusCode || 400, { error: "BAD_REQUEST", message: err.message });
    return;
  }

  const { valid, errors, value } = validatePlayer(body);
  if (!valid) {
    sendJson(res, 400, { error: "VALIDATION_ERROR", fields: errors });
    return;
  }

  try {
    const existing = await db.findPlayerByEmail(value.email);
    if (existing) {
      sendJson(res, 409, { error: "EMAIL_EXISTS", message: "Email này đã được đăng ký." });
      return;
    }
    const player = await db.insertPlayer(value.fullName, value.email, value.phone);
    sendJson(res, 201, {
      id: player.id,
      fullName: player.full_name,
      email: player.email,
      phone: player.phone,
      createdAt: player.created_at,
    });
  } catch (err) {
    if (err.code === "23505") {
      // Trùng do race condition giữa 2 yêu cầu gần như đồng thời — ràng buộc UNIQUE ở DB chặn lại.
      sendJson(res, 409, { error: "EMAIL_EXISTS", message: "Email này đã được đăng ký." });
      return;
    }
    console.error("Lỗi lưu người chơi:", err);
    sendJson(res, 500, { error: "SERVER_ERROR", message: "Không lưu được, thử lại sau." });
  }
}

// ---- API: admin ----
async function handleAdminLogin(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, err.statusCode || 400, { error: "BAD_REQUEST", message: err.message });
    return;
  }
  if (!auth.checkCredentials(body.username, body.password)) {
    sendJson(res, 401, { error: "INVALID_CREDENTIALS", message: "Sai tài khoản hoặc mật khẩu." });
    return;
  }
  const token = auth.createSession();
  res.setHeader("Set-Cookie", auth.sessionCookieHeader(token));
  sendJson(res, 200, { ok: true });
}

function handleAdminLogout(req, res) {
  const token = auth.getSessionTokenFromRequest(req);
  auth.destroySession(token);
  res.setHeader("Set-Cookie", auth.clearSessionCookieHeader());
  sendJson(res, 200, { ok: true });
}

async function handleAdminListPlayers(req, res, query) {
  if (!requireAdmin(req)) {
    sendJson(res, 401, { error: "UNAUTHORIZED", message: "Chưa đăng nhập." });
    return;
  }
  try {
    const players = await db.listPlayers(query.get("search") || "");
    sendJson(res, 200, { players });
  } catch (err) {
    console.error("Lỗi lấy danh sách người chơi:", err);
    sendJson(res, 500, { error: "SERVER_ERROR", message: "Không lấy được danh sách." });
  }
}

async function handleAdminDeletePlayer(req, res, id) {
  if (!requireAdmin(req)) {
    sendJson(res, 401, { error: "UNAUTHORIZED", message: "Chưa đăng nhập." });
    return;
  }
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    sendJson(res, 400, { error: "BAD_REQUEST", message: "Id không hợp lệ." });
    return;
  }
  try {
    const deleted = await db.deletePlayer(numericId);
    if (!deleted) {
      sendJson(res, 404, { error: "NOT_FOUND", message: "Không tìm thấy." });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error("Lỗi xoá người chơi:", err);
    sendJson(res, 500, { error: "SERVER_ERROR", message: "Không xoá được." });
  }
}

async function handleAdminExportCsv(req, res, query) {
  if (!requireAdmin(req)) {
    send(res, 401, "Chưa đăng nhập", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  try {
    const players = await db.listPlayers(query.get("search") || "");
    const csv = playersToCsv(players);
    send(res, 200, csv, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"players.csv\"",
    });
  } catch (err) {
    console.error("Lỗi xuất CSV:", err);
    send(res, 500, "Không xuất được CSV", { "Content-Type": "text/plain; charset=utf-8" });
  }
}

// ---- /admin: trang quản trị, tự chuyển giữa đăng nhập/danh sách theo phiên ----
function handleAdminPage(req, res) {
  const html = requireAdmin(req) ? adminPages.dashboardPage() : adminPages.loginPage();
  send(res, 200, html, { "Content-Type": "text/html; charset=utf-8" });
}

const server = http.createServer(async (req, res) => {
  const fullUrl = new URL(req.url, "http://localhost");
  const urlPath = decodeURIComponent(fullUrl.pathname);

  try {
    if (urlPath === "/") {
      res.writeHead(302, { Location: "/app/index.html" });
      res.end();
      return;
    }

    if (urlPath === "/admin" || urlPath === "/admin/") {
      handleAdminPage(req, res);
      return;
    }

    if (urlPath === "/api/players" && req.method === "POST") {
      await handleCreatePlayer(req, res);
      return;
    }

    if (urlPath === "/api/admin/login" && req.method === "POST") {
      await handleAdminLogin(req, res);
      return;
    }

    if (urlPath === "/api/admin/logout" && req.method === "POST") {
      handleAdminLogout(req, res);
      return;
    }

    if (urlPath === "/api/admin/players" && req.method === "GET") {
      await handleAdminListPlayers(req, res, fullUrl.searchParams);
      return;
    }

    if (urlPath === "/api/admin/players/export.csv" && req.method === "GET") {
      await handleAdminExportCsv(req, res, fullUrl.searchParams);
      return;
    }

    const deleteMatch = urlPath.match(/^\/api\/admin\/players\/([^/]+)$/);
    if (deleteMatch && req.method === "DELETE") {
      await handleAdminDeletePlayer(req, res, deleteMatch[1]);
      return;
    }

    if (urlPath.startsWith("/api/")) {
      sendJson(res, 404, { error: "NOT_FOUND", message: "Không tìm thấy API." });
      return;
    }

    serveStatic(req, res, urlPath);
  } catch (err) {
    console.error("Lỗi không mong muốn:", err);
    sendJson(res, 500, { error: "SERVER_ERROR", message: "Có lỗi xảy ra." });
  }
});

db.initSchema()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Chém Hoa Quả đang chạy tại http://localhost:" + PORT);
    });
  })
  .catch((err) => {
    console.error("Không kết nối được database, dừng server:", err.message);
    process.exit(1);
  });
