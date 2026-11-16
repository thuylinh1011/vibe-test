(function () {
  "use strict";

  // ---- Hằng số (theo docs/04-quy-tac-du-lieu.html §4.1) ----
  var ROUND_DURATION_MS = 30000;
  var MOUSE_VISIBLE_MS = 800;
  var GAP_AFTER_MOUSE_MS = 300;
  var GRID_SIZE = 9;
  var LOW_TIME_THRESHOLD_S = 5;
  var HIGH_SCORE_KEY = "dap-chuot:highScore";
  var TICK_INTERVAL_MS = 100;

  // ---- DOM ----
  var gameEl = document.getElementById("game");
  var gridEl = document.getElementById("grid");
  var scoreValueEl = document.getElementById("scoreValue");
  var timeValueEl = document.getElementById("timeValue");
  var startHighScoreEl = document.getElementById("startHighScore");
  var endScoreEl = document.getElementById("endScore");
  var endHighScoreEl = document.getElementById("endHighScore");
  var endRecordEl = document.getElementById("endRecord");
  var btnStart = document.getElementById("btnStart");
  var btnRestart = document.getElementById("btnRestart");

  // ---- Trạng thái trong bộ nhớ (theo §4.6) ----
  var gameState = "idle"; // idle | playing | finished
  var score = 0;
  var startTime = 0;
  var activeCellIndex = null;
  var lastCellIndex = null;
  var currentMouseId = null;
  var caughtMouseIds = new Set();
  var mouseIdCounter = 0;
  var highScore = loadHighScore();

  var mouseTimer = null;
  var gapTimer = null;
  var tickHandle = null;

  var cells = [];

  function cellTemplate(index) {
    return (
      '<button class="cell" type="button" data-index="' + index + '" aria-label="Ô ' + (index + 1) + '">' +
      '<svg class="cell-hole" viewBox="0 0 100 50" aria-hidden="true" focusable="false">' +
      '<ellipse cx="50" cy="25" rx="48" ry="22"></ellipse>' +
      "</svg>" +
      '<svg class="cell-mouse" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<circle class="mouse-ear" cx="16" cy="16" r="9"></circle>' +
      '<circle class="mouse-ear" cx="48" cy="16" r="9"></circle>' +
      '<circle class="mouse-body" cx="32" cy="36" r="22"></circle>' +
      '<circle class="mouse-eye" cx="24" cy="32" r="3"></circle>' +
      '<circle class="mouse-eye" cx="40" cy="32" r="3"></circle>' +
      '<circle class="mouse-nose" cx="32" cy="42" r="3.5"></circle>' +
      "</svg>" +
      "</button>"
    );
  }

  function buildGrid() {
    var html = "";
    for (var i = 0; i < GRID_SIZE; i++) {
      html += cellTemplate(i);
    }
    gridEl.innerHTML = html;
    cells = Array.prototype.slice.call(gridEl.querySelectorAll(".cell"));
    gridEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".cell");
      if (!btn) return;
      handleCellActivate(Number(btn.dataset.index));
    });
  }

  // ---- localStorage điểm cao nhất (§4.5) ----
  function loadHighScore() {
    try {
      var raw = localStorage.getItem(HIGH_SCORE_KEY);
      var n = parseInt(raw, 10);
      return Number.isFinite(n) && n >= 0 ? n : null;
    } catch (e) {
      return null;
    }
  }

  function saveHighScoreIfNeeded(finalScore) {
    if (highScore === null || finalScore > highScore) {
      highScore = finalScore;
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
      } catch (e) {
        // Storage bị chặn/lỗi: bỏ qua lặng lẽ, không chặn luồng chơi.
      }
      return true;
    }
    return false;
  }

  // ---- Quy tắc chọn ô (§4.3) ----
  function pickCellIndex(exclude) {
    var idx;
    do {
      idx = Math.floor(Math.random() * GRID_SIZE);
    } while (exclude !== null && idx === exclude);
    return idx;
  }

  // ---- Render ----
  function renderHighScoreOnStart() {
    startHighScoreEl.textContent = highScore === null ? "Chưa có điểm" : "Điểm cao nhất: " + highScore;
  }

  function renderScore() {
    scoreValueEl.textContent = String(score);
  }

  function renderTime(remainingS) {
    timeValueEl.textContent = remainingS + "s";
    timeValueEl.classList.toggle("low-time", remainingS <= LOW_TIME_THRESHOLD_S);
  }

  function renderMouseAt(index, hasMouse) {
    var cell = cells[index];
    if (!cell) return;
    cell.classList.toggle("has-mouse", hasMouse);
  }

  function renderCaughtEffect(index) {
    var cell = cells[index];
    if (!cell) return;
    cell.classList.remove("has-mouse");
    cell.classList.add("caught");
    setTimeout(function () {
      cell.classList.remove("caught");
    }, 200);
  }

  function clearAllMiceVisuals() {
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove("has-mouse", "caught");
    }
  }

  // ---- Chuột xuất hiện / lặn (§2.1, §4.3) ----
  function spawnMouse() {
    if (gameState !== "playing") return;
    var idx = pickCellIndex(lastCellIndex);
    lastCellIndex = idx;
    activeCellIndex = idx;
    mouseIdCounter += 1;
    currentMouseId = mouseIdCounter;
    renderMouseAt(idx, true);

    var mouseId = currentMouseId;
    mouseTimer = setTimeout(function () {
      onMouseTimeout(mouseId);
    }, MOUSE_VISIBLE_MS);
  }

  function onMouseTimeout(mouseId) {
    if (gameState !== "playing") return;
    if (mouseId !== currentMouseId || activeCellIndex === null) return;
    // Tự lặn xuống: không trừ/cộng điểm.
    renderMouseAt(activeCellIndex, false);
    activeCellIndex = null;
    scheduleNextMouse();
  }

  function scheduleNextMouse() {
    gapTimer = setTimeout(function () {
      if (gameState === "playing") spawnMouse();
    }, GAP_AFTER_MOUSE_MS);
  }

  function handleCellActivate(index) {
    if (gameState !== "playing") return;
    if (activeCellIndex === null || index !== activeCellIndex) return; // ô trống: không đổi điểm
    if (caughtMouseIds.has(currentMouseId)) return; // phòng hờ: con này đã tính điểm rồi

    caughtMouseIds.add(currentMouseId);
    clearTimeout(mouseTimer);
    score += 1;
    renderScore();
    renderCaughtEffect(index);
    activeCellIndex = null;
    scheduleNextMouse();
  }

  // ---- Đồng hồ theo thời gian thực (§4.4) ----
  function tick() {
    if (gameState !== "playing") return;
    var remainingMs = ROUND_DURATION_MS - (Date.now() - startTime);
    if (remainingMs <= 0) {
      finishRound();
      return;
    }
    renderTime(Math.ceil(remainingMs / 1000));
  }

  function clearTimers() {
    clearTimeout(mouseTimer);
    clearTimeout(gapTimer);
    clearInterval(tickHandle);
    mouseTimer = null;
    gapTimer = null;
    tickHandle = null;
  }

  // ---- Máy trạng thái (§4.2) ----
  function startRound() {
    clearTimers();
    gameState = "playing";
    score = 0;
    startTime = Date.now();
    activeCellIndex = null;
    lastCellIndex = null;
    currentMouseId = null;
    caughtMouseIds = new Set();
    mouseIdCounter = 0;

    renderScore();
    renderTime(30);
    clearAllMiceVisuals();
    gameEl.dataset.state = "playing";

    spawnMouse();
    tickHandle = setInterval(tick, TICK_INTERVAL_MS);

    if (cells[0]) cells[0].focus();
  }

  function finishRound() {
    clearTimers();
    gameState = "finished";
    activeCellIndex = null;
    clearAllMiceVisuals();

    var isRecord = saveHighScoreIfNeeded(score);
    endScoreEl.textContent = score + " điểm";
    endHighScoreEl.textContent = "Điểm cao nhất: " + highScore;
    endRecordEl.hidden = !isRecord;

    gameEl.dataset.state = "finished";
    btnRestart.focus();
  }

  // ---- Xử lý rời/quay lại tab (§2.5, §4.4) ----
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && gameState === "playing") {
      tick();
    }
  });

  // ---- Khởi tạo ----
  buildGrid();
  renderHighScoreOnStart();
  btnStart.addEventListener("click", startRound);
  btnRestart.addEventListener("click", startRound);
})();
