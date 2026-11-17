"use strict";

const crypto = require("crypto");

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 giờ

// Lưu phiên trong bộ nhớ: đủ dùng cho 1 admin duy nhất (mục 4.8 trong docs).
// Mất khi restart server — admin chỉ cần đăng nhập lại.
const sessions = new Map();

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function checkCredentials(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME || "";
  const expectedPass = process.env.ADMIN_PASSWORD || "";
  if (!expectedUser || !expectedPass) return false;
  return timingSafeEqual(username || "", expectedUser) && timingSafeEqual(password || "", expectedPass);
}

function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function destroySession(token) {
  sessions.delete(token);
}

function isValidSession(token) {
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function getSessionTokenFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE];
}

function sessionCookieHeader(token) {
  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  return SESSION_COOKIE + "=" + token + "; HttpOnly; Path=/; SameSite=Lax; Max-Age=" + maxAgeSec;
}

function clearSessionCookieHeader() {
  return SESSION_COOKIE + "=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0";
}

module.exports = {
  checkCredentials,
  createSession,
  destroySession,
  isValidSession,
  getSessionTokenFromRequest,
  sessionCookieHeader,
  clearSessionCookieHeader,
};
