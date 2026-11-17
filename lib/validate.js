"use strict";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{9,11}$/;

function validatePlayer(body) {
  const errors = {};
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (fullName.length < 2) {
    errors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
  }
  if (!EMAIL_RE.test(email)) {
    errors.email = "Email không đúng định dạng.";
  }
  if (!PHONE_RE.test(phone)) {
    errors.phone = "Số điện thoại không hợp lệ (chỉ gồm chữ số, 9–11 số, có thể bắt đầu bằng +).";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: { fullName, email, phone },
  };
}

module.exports = { validatePlayer };
