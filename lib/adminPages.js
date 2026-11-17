"use strict";

const BASE_STYLE = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    padding: var(--space-5);
  }
  h1 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-2xl);
    margin: 0 0 var(--space-4);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--control-height-md);
    padding: 0 var(--space-4);
    border: 1px solid transparent;
    border-radius: var(--radius-pill);
    font-family: var(--font-display);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
    cursor: pointer;
    text-decoration: none;
    background: var(--color-accent);
    color: var(--color-accent-text);
  }
  .btn:hover { background: var(--color-accent-hover); }
  .btn-outline { background: transparent; color: var(--color-text); border-color: var(--color-border-strong); }
  .btn-outline:hover { background: var(--color-surface-strong); }
  .btn-danger { background: transparent; color: var(--color-danger); border-color: var(--color-danger); height: var(--control-height-sm); padding: 0 var(--space-3); }
  .btn-danger:hover { background: var(--color-danger); color: var(--color-inverse-text); }
  .btn:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
  input {
    height: var(--control-height-md);
    padding: 0 var(--space-3);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: var(--font-size-md);
  }
  input:focus { outline: none; border-color: var(--color-accent); }
`;

function loginPage() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Đăng nhập quản trị — Đập Chuột</title>
<link rel="stylesheet" href="/design/tokens.css">
<style>
  ${BASE_STYLE}
  body { display: flex; align-items: center; justify-content: center; }
  .panel {
    width: 100%;
    max-width: 360px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--space-6) var(--space-5);
  }
  label { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); margin-bottom: var(--space-4); }
  label input { display: block; width: 100%; margin-top: var(--space-2); }
  .error { color: var(--color-danger); font-size: var(--font-size-sm); margin: 0 0 var(--space-4); }
  .panel .btn { width: 100%; height: var(--control-height-lg); }
</style>
</head>
<body>
  <div class="panel">
    <h1>Đăng nhập quản trị</h1>
    <form id="loginForm">
      <label>Tài khoản<input name="username" autocomplete="username" required></label>
      <label>Mật khẩu<input name="password" type="password" autocomplete="current-password" required></label>
      <p class="error" id="errorMsg" hidden></p>
      <button type="submit" class="btn">Đăng nhập</button>
    </form>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var errorEl = document.getElementById('errorMsg');
      errorEl.hidden = true;
      try {
        var res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') })
        });
        if (res.ok) {
          window.location.href = '/admin';
          return;
        }
        var data = await res.json().catch(function () { return {}; });
        errorEl.textContent = data.message || 'Sai tài khoản hoặc mật khẩu.';
        errorEl.hidden = false;
      } catch (err) {
        errorEl.textContent = 'Không kết nối được tới server, thử lại sau.';
        errorEl.hidden = false;
      }
    });
  </script>
</body>
</html>`;
}

function dashboardPage() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Quản trị người chơi — Đập Chuột</title>
<link rel="stylesheet" href="/design/tokens.css">
<style>
  ${BASE_STYLE}
  .toolbar { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; margin-bottom: var(--space-5); }
  #searchInput { flex: 1; min-width: 200px; }
  table { width: 100%; border-collapse: collapse; background: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; }
  th, td { text-align: left; padding: var(--space-3); border-bottom: 1px solid var(--color-border); font-size: var(--font-size-sm); }
  th { color: var(--color-text-muted); font-weight: var(--font-weight-medium); }
  #emptyMsg { color: var(--color-text-muted); margin-top: var(--space-4); }
  .top-row { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
</style>
</head>
<body>
  <div class="top-row">
    <h1>Người chơi đã đăng ký</h1>
    <button id="logoutBtn" class="btn btn-outline">Đăng xuất</button>
  </div>
  <div class="toolbar">
    <input id="searchInput" placeholder="Tìm theo họ tên / email / số điện thoại">
    <button id="searchBtn" class="btn btn-outline">Tìm</button>
    <a id="exportLink" class="btn" href="/api/admin/players/export.csv">Xuất CSV</a>
  </div>
  <table>
    <thead>
      <tr><th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Đăng ký lúc</th><th></th></tr>
    </thead>
    <tbody id="playersBody"></tbody>
  </table>
  <p id="emptyMsg" hidden>Chưa có người chơi nào.</p>
  <script>
    function renderPlayers(players) {
      var tbody = document.getElementById('playersBody');
      tbody.innerHTML = '';
      document.getElementById('emptyMsg').hidden = players.length !== 0;
      players.forEach(function (p) {
        var tr = document.createElement('tr');
        [p.full_name, p.email, p.phone, new Date(p.created_at).toLocaleString('vi-VN')].forEach(function (text) {
          var td = document.createElement('td');
          td.textContent = text;
          tr.appendChild(td);
        });
        var tdAction = document.createElement('td');
        var delBtn = document.createElement('button');
        delBtn.textContent = 'Xoá';
        delBtn.className = 'btn btn-danger';
        delBtn.addEventListener('click', async function () {
          if (!window.confirm('Xoá "' + p.full_name + '"? Không thể hoàn tác.')) return;
          var res = await fetch('/api/admin/players/' + p.id, { method: 'DELETE' });
          if (res.ok) loadPlayers();
          else window.alert('Xoá thất bại.');
        });
        tdAction.appendChild(delBtn);
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
      });
    }

    async function loadPlayers() {
      var q = document.getElementById('searchInput').value.trim();
      var qs = q ? ('?search=' + encodeURIComponent(q)) : '';
      var res = await fetch('/api/admin/players' + qs);
      if (res.status === 401) {
        window.location.href = '/admin';
        return;
      }
      var data = await res.json();
      renderPlayers(data.players || []);
      document.getElementById('exportLink').href = '/api/admin/players/export.csv' + qs;
    }

    document.getElementById('searchBtn').addEventListener('click', loadPlayers);
    document.getElementById('searchInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') loadPlayers();
    });
    document.getElementById('logoutBtn').addEventListener('click', async function () {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin';
    });

    loadPlayers();
  </script>
</body>
</html>`;
}

module.exports = { loginPage, dashboardPage };
