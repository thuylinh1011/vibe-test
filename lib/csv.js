"use strict";

function escapeCsvField(value) {
  const str = String(value === null || value === undefined ? "" : value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function playersToCsv(players) {
  const header = ["id", "ho_ten", "email", "so_dien_thoai", "thoi_diem_dang_ky"];
  const lines = [header.join(",")];
  players.forEach((p) => {
    lines.push(
      [
        escapeCsvField(p.id),
        escapeCsvField(p.full_name),
        escapeCsvField(p.email),
        escapeCsvField(p.phone),
        escapeCsvField(new Date(p.created_at).toISOString()),
      ].join(",")
    );
  });
  // Thêm BOM để Excel đọc đúng dấu tiếng Việt khi mở file UTF-8.
  return "﻿" + lines.join("\r\n") + "\r\n";
}

module.exports = { playersToCsv };
