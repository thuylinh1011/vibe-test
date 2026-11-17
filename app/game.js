(function () {
  "use strict";

  // ---- Hằng số (theo docs/04-quy-tac-du-lieu.html §4.1) ----
  var ROUND_DURATION_MS = 30000;
  var MOUSE_VISIBLE_MS = 800;
  var GAP_AFTER_MOUSE_MS = 300;
  var GRID_SIZE = 9;
  var LOW_TIME_THRESHOLD_S = 5;
  var HIGH_SCORE_KEY = "dap-chuot:highScore";
  var PLAYER_ID_KEY = "dap-chuot:playerId";
  var TICK_INTERVAL_MS = 100;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[0-9]{9,11}$/;

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
  var registerForm = document.getElementById("registerForm");
  var fullNameInput = document.getElementById("fullNameInput");
  var emailInput = document.getElementById("emailInput");
  var phoneInput = document.getElementById("phoneInput");
  var fullNameError = document.getElementById("fullNameError");
  var emailError = document.getElementById("emailError");
  var phoneError = document.getElementById("phoneError");
  var registerFormError = document.getElementById("registerFormError");
  var btnRegister = document.getElementById("btnRegister");

  // ---- Trạng thái trong bộ nhớ (theo §4.6) ----
  var gameState = "registering"; // registering | idle | playing | finished
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

  // ---- Đăng ký người chơi (§2.7, §4.7) ----
  function hasRegisteredPlayer() {
    try {
      return !!localStorage.getItem(PLAYER_ID_KEY);
    } catch (e) {
      return false;
    }
  }

  function savePlayerId(id) {
    try {
      localStorage.setItem(PLAYER_ID_KEY, String(id));
    } catch (e) {
      // Storage bị chặn/lỗi: bỏ qua lặng lẽ, không chặn luồng chơi.
    }
  }

  function goToIdle() {
    gameState = "idle";
    gameEl.dataset.state = "idle";
  }

  function setFieldError(el, message, inputEl) {
    el.textContent = message || "";
    if (inputEl) inputEl.classList.toggle("input-error", !!message);
  }

  function clearRegisterErrors() {
    setFieldError(fullNameError, "", fullNameInput);
    setFieldError(emailError, "", emailInput);
    setFieldError(phoneError, "", phoneInput);
    setFieldError(registerFormError, "");
  }

  function validateRegisterForm(fullName, email, phone) {
    var errors = {};
    if (fullName.length < 2) errors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
    if (!EMAIL_RE.test(email)) errors.email = "Email không đúng định dạng.";
    if (!PHONE_RE.test(phone)) errors.phone = "Số điện thoại không hợp lệ (9–11 chữ số, có thể bắt đầu bằng +).";
    return errors;
  }

  function submitRegister(e) {
    e.preventDefault();
    clearRegisterErrors();
    var fullName = fullNameInput.value.trim();
    var email = emailInput.value.trim();
    var phone = phoneInput.value.trim();

    var errors = validateRegisterForm(fullName, email, phone);
    if (Object.keys(errors).length > 0) {
      if (errors.fullName) setFieldError(fullNameError, errors.fullName, fullNameInput);
      if (errors.email) setFieldError(emailError, errors.email, emailInput);
      if (errors.phone) setFieldError(phoneError, errors.phone, phoneInput);
      return;
    }

    btnRegister.disabled = true;
    fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: fullName, email: email, phone: phone }),
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (result.status === 201) {
          savePlayerId(result.data.id);
          goToIdle();
          return;
        }
        if (result.status === 409) {
          setFieldError(emailError, result.data.message || "Email này đã được đăng ký.", emailInput);
          return;
        }
        if (result.status === 400 && result.data.fields) {
          if (result.data.fields.fullName) setFieldError(fullNameError, result.data.fields.fullName, fullNameInput);
          if (result.data.fields.email) setFieldError(emailError, result.data.fields.email, emailInput);
          if (result.data.fields.phone) setFieldError(phoneError, result.data.fields.phone, phoneInput);
          return;
        }
        setFieldError(registerFormError, result.data.message || "Có lỗi xảy ra, thử lại sau.");
      })
      .catch(function () {
        setFieldError(registerFormError, "Không kết nối được tới server, thử lại sau.");
      })
      .finally(function () {
        btnRegister.disabled = false;
      });
  }

  // ---- Khởi tạo ----
  buildGrid();
  renderHighScoreOnStart();
  btnStart.addEventListener("click", startRound);
  btnRestart.addEventListener("click", startRound);
  registerForm.addEventListener("submit", submitRegister);

  if (hasRegisteredPlayer()) {
    goToIdle();
  }
})();
