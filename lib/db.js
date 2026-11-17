"use strict";

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Postgres có thể chưa sẵn sàng nhận kết nối ngay khi container app khởi động
// (dù đã có healthcheck ở docker-compose) — thử lại vài lần cho chắc.
async function initSchema(retries) {
  const maxRetries = retries || 10;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS players (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      console.log("Đã kết nối database và sẵn sàng bảng players.");
      return;
    } catch (err) {
      console.log(
        "Chưa kết nối được database (lần " + attempt + "/" + maxRetries + "): " + err.message
      );
      if (attempt === maxRetries) throw err;
      await sleep(2000);
    }
  }
}

async function findPlayerByEmail(email) {
  const result = await pool.query("SELECT id FROM players WHERE email = $1", [email]);
  return result.rows[0] || null;
}

async function insertPlayer(fullName, email, phone) {
  const result = await pool.query(
    "INSERT INTO players (full_name, email, phone) VALUES ($1, $2, $3) RETURNING id, full_name, email, phone, created_at",
    [fullName, email, phone]
  );
  return result.rows[0];
}

async function listPlayers(search) {
  if (search) {
    const like = "%" + search + "%";
    const result = await pool.query(
      `SELECT id, full_name, email, phone, created_at FROM players
       WHERE full_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
       ORDER BY created_at DESC`,
      [like]
    );
    return result.rows;
  }
  const result = await pool.query(
    "SELECT id, full_name, email, phone, created_at FROM players ORDER BY created_at DESC"
  );
  return result.rows;
}

async function deletePlayer(id) {
  const result = await pool.query("DELETE FROM players WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  initSchema,
  findPlayerByEmail,
  insertPlayer,
  listPlayers,
  deletePlayer,
};
