"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ALLOWED_DIRS = ["app", "design"];

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

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  if (urlPath === "/") {
    res.writeHead(302, { Location: "/app/index.html" });
    res.end();
    return;
  }

  const topDir = urlPath.split("/").filter(Boolean)[0];
  if (!ALLOWED_DIRS.includes(topDir)) {
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
});

server.listen(PORT, () => {
  console.log("Đập Chuột đang chạy tại http://localhost:" + PORT);
});
