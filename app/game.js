(function () {
  "use strict";

  // ---- Hằng số (theo docs/04-quy-tac-du-lieu.html §4.1, §4.9) ----
  var ROUND_DURATION_MS = 30000;
  var STAGE_DURATION_MS = 5000;
  // Tốc độ nhanh dần theo 6 chặng 5 giây (YEU-CAU-UPDATE-2.md §2.1) — đặt chung một
  // chỗ để dễ chỉnh sau khi chơi thử.
  var STAGES = [
    { visibleMs: 1600, gapMs: 600 },
    { visibleMs: 1450, gapMs: 550 },
    { visibleMs: 1300, gapMs: 500 },
    { visibleMs: 1150, gapMs: 450 },
    { visibleMs: 1000, gapMs: 400 },
    { visibleMs: 900, gapMs: 350 },
  ];
  var STAGE_UP_LINE = "Chợ đông rồi, tăng tốc!";
  var GRID_SIZE = 9;
  var LOW_TIME_THRESHOLD_S = 5;
  var HIGH_SCORE_KEY = "dap-chuot:highScore"; // cố tình giữ tiền tố cũ, xem §4.5
  var PLAYER_ID_KEY = "dap-chuot:playerId";
  var TICK_INTERVAL_MS = 100;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[0-9]{9,11}$/;
  var HALF_FLY_MS = 500;
  var HIT_BUBBLE_MS = 800;

  // ---- Dữ liệu loại quả (§4.9) ----
  var FRUITS = [
    { id: "watermelon", name: "Dưa hấu", hitLine: "Đỏ au như má em lúc ngại!", seeds: true },
    { id: "orange", name: "Cam", hitLine: "Cam ơi, cam chịu đi!", segments: true },
    { id: "apple", name: "Táo", hitLine: "Táo bạo đấy!" },
    { id: "banana", name: "Chuối", hitLine: "Chuối này giờ là của bạn!" },
    { id: "pineapple", name: "Dứa", hitLine: "Dứa nhiều mắt mà vẫn không thoát!" },
    { id: "mango", name: "Xoài", hitLine: "Xoài cát Hòa Lộc, chém là phải sang!" },
  ];

  // ---- Lời thoại (§4.10) — đặt chung một chỗ để dễ sửa/thêm ----
  var HIT_LINES = [
    "Đẳng cấp! Tuyệt vời! Tinh hoa hội tụ!",
    "Dao nhanh hơn người yêu cũ trở mặt!",
    "Chém một phát, ngọt như đường phèn!",
    "Đỉnh của chóp!",
    "Thợ chém hoa quả số 1 chợ Bến Thành!",
    "Ơ kìa, ai cho chém đẹp vậy?",
  ];
  var DROP_LINES = ["Ối, quả chạy mất rồi!", "Chậm một nhịp thôi, không sao!", "Quả này hôm nay may mắn ghê."];
  var GREETING_LINES = ["Chợ mở cửa rồi, mài dao đi nào!", "Hôm nay hoa quả tươi lắm, chém thả ga!"];
  var LOW_TIME_LINE = "Sắp đóng cửa chợ, nhanh tay lên!";
  var COMBO_LINES = { 3: "Combo x3! Tay này là tay vàng!", 5: "Combo x5! Cả chợ đứng hình!", 10: "Combo x10! Huyền thoại sạp hoa quả!" };
  var RECORD_LINE = "🏆 Kỷ lục mới! Cả chợ vỗ tay!";
  var TITLES = [
    { min: 0, max: 5, title: "Khách đi chợ dạo", comment: "Mới cầm dao lần đầu à? Thử lại nào!" },
    { min: 6, max: 12, title: "Phụ bán sạp", comment: "Có tiềm năng đấy, chủ sạp để ý rồi!" },
    { min: 13, max: 20, title: "Chủ sạp lành nghề", comment: "Tay dao chắc nịch, cả dãy hàng nể!" },
    { min: 21, max: 27, title: "Bậc thầy dao kéo", comment: "Đẳng cấp, tuyệt vời, tinh hoa!" },
    { min: 28, max: Infinity, title: "Huyền thoại chợ hoa quả", comment: "Truyền nhân đời thứ 9 của dao phay!" },
  ];

  // ---- DOM ----
  var gameEl = document.getElementById("game");
  var gridEl = document.getElementById("grid");
  var scoreValueEl = document.getElementById("scoreValue");
  var scoreStrongEl = scoreValueEl; // <strong id="scoreValue">, dùng để nảy HUD
  var timeValueEl = document.getElementById("timeValue");
  var startHighScoreEl = document.getElementById("startHighScore");
  var startGreetingEl = document.getElementById("startGreeting");
  var lowTimeLineEl = document.getElementById("lowTimeLine");
  var comboBannerEl = document.getElementById("comboBanner");
  var endScoreEl = document.getElementById("endScore");
  var endTitleEl = document.getElementById("endTitle");
  var endCommentEl = document.getElementById("endComment");
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
  var currentFruit = null;
  var currentMouseId = null;
  var caughtMouseIds = new Set();
  var mouseIdCounter = 0;
  var comboCount = 0;
  var lowTimeAnnounced = false;
  var lastStageIndex = 0;
  var highScore = loadHighScore();

  var lastHitLine = null;
  var lastDropLine = null;
  var lastGreetingLine = null;

  var mouseTimer = null;
  var gapTimer = null;
  var tickHandle = null;

  var cells = [];

  function cellTemplate(index) {
    return (
      '<button class="cell" type="button" data-index="' + index + '" aria-label="Sọt ' + (index + 1) + '">' +
      '<div class="fruit-slot"></div>' +
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

  // ---- Chọn ngẫu nhiên không lặp lại giá trị vừa chọn (§4.3, §4.10) ----
  function pickCellIndex(exclude) {
    var idx;
    do {
      idx = Math.floor(Math.random() * GRID_SIZE);
    } while (exclude !== null && idx === exclude);
    return idx;
  }

  function pickFruit() {
    return FRUITS[Math.floor(Math.random() * FRUITS.length)];
  }

  // ---- Tốc độ nhanh dần theo chặng (§2.1 YEU-CAU-UPDATE-2.md) ----
  function getStageIndex() {
    var elapsedMs = Date.now() - startTime;
    var idx = Math.floor(elapsedMs / STAGE_DURATION_MS);
    if (idx < 0) idx = 0;
    if (idx > STAGES.length - 1) idx = STAGES.length - 1;
    return idx;
  }

  function getStageParams() {
    return STAGES[getStageIndex()];
  }

  function checkStageTransition() {
    var idx = getStageIndex();
    if (idx !== lastStageIndex) {
      lastStageIndex = idx;
      if (idx > 0) showBanner(STAGE_UP_LINE);
    }
  }

  function pickRandomExcept(list, exclude) {
    if (list.length <= 1) return list[0];
    var choice;
    do {
      choice = list[Math.floor(Math.random() * list.length)];
    } while (choice === exclude);
    return choice;
  }

  function getHitLine(fruit) {
    var useSpecific = fruit.hitLine && Math.random() < 0.35;
    var line = useSpecific ? fruit.hitLine : pickRandomExcept(HIT_LINES, lastHitLine);
    lastHitLine = line;
    return line;
  }

  function getDropLine() {
    var line = pickRandomExcept(DROP_LINES, lastDropLine);
    lastDropLine = line;
    return line;
  }

  function getTitleFor(finalScore) {
    for (var i = 0; i < TITLES.length; i++) {
      if (finalScore >= TITLES[i].min && finalScore <= TITLES[i].max) return TITLES[i];
    }
    return TITLES[TITLES.length - 1];
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- Render ----
  function renderHighScoreOnStart() {
    startHighScoreEl.textContent = highScore === null ? "Chưa có điểm" : "Điểm cao nhất: " + highScore;
  }

  function renderScore() {
    scoreValueEl.textContent = String(score);
    scoreStrongEl.classList.remove("bump");
    // Buộc reflow để animation chạy lại mỗi lần cộng điểm.
    void scoreStrongEl.offsetWidth;
    scoreStrongEl.classList.add("bump");
  }

  function renderTime(remainingS) {
    timeValueEl.textContent = remainingS + "s";
    timeValueEl.classList.toggle("low-time", remainingS <= LOW_TIME_THRESHOLD_S);
    if (remainingS <= LOW_TIME_THRESHOLD_S && !lowTimeAnnounced) {
      lowTimeAnnounced = true;
      lowTimeLineEl.textContent = LOW_TIME_LINE;
      lowTimeLineEl.hidden = false;
    }
  }

  function fruitWholeMarkup(fruit) {
    return (
      '<div class="fruit-whole" data-fruit="' + fruit.id + '">' +
      '<div class="fruit-body">' +
      '<span class="fruit-eye eye-l"></span><span class="fruit-eye eye-r"></span>' +
      '<span class="fruit-mouth"></span>' +
      '<span class="fruit-blush blush-l"></span><span class="fruit-blush blush-r"></span>' +
      '<span class="fruit-shine"></span>' +
      "</div></div>"
    );
  }

  function fruitDetailMarkup(fruit) {
    if (fruit.seeds) {
      return (
        '<span class="seed" style="top:35%;left:40%;"></span>' +
        '<span class="seed" style="top:55%;left:60%;"></span>' +
        '<span class="seed" style="top:65%;left:35%;"></span>'
      );
    }
    if (fruit.segments) {
      return (
        '<span class="segment-line" style="transform:rotate(0deg);"></span>' +
        '<span class="segment-line" style="transform:rotate(60deg);"></span>' +
        '<span class="segment-line" style="transform:rotate(120deg);"></span>'
      );
    }
    return "";
  }

  function slicedMarkup(fruit, hitText) {
    return (
      '<div class="slice-wrap" data-fruit="' + fruit.id + '">' +
      '<div class="fruit-half half-a">' + fruitDetailMarkup(fruit) + "</div>" +
      '<div class="fruit-half half-b">' + fruitDetailMarkup(fruit) + "</div>" +
      '<div class="blade"></div>' +
      '<div class="juice j1"></div><div class="juice j2"></div><div class="juice j3"></div><div class="juice j4"></div>' +
      '<div class="plus-one">+1</div>' +
      (hitText ? '<div class="hit-bubble">' + escapeHtml(hitText) + "</div>" : "") +
      "</div>"
    );
  }

  function renderFruitAt(index, fruit) {
    var cell = cells[index];
    if (!cell) return;
    var slot = cell.querySelector(".fruit-slot");
    if (fruit) {
      slot.innerHTML = fruitWholeMarkup(fruit);
      cell.classList.add("has-fruit");
    } else {
      cell.classList.remove("has-fruit");
      slot.innerHTML = "";
    }
  }

  function renderHitEffect(index, fruit) {
    var cell = cells[index];
    if (!cell) return;
    cell.classList.remove("has-fruit");
    var slot = cell.querySelector(".fruit-slot");
    slot.innerHTML = slicedMarkup(fruit, getHitLine(fruit));
    setTimeout(function () {
      if (slot) slot.innerHTML = "";
    }, Math.max(HALF_FLY_MS, HIT_BUBBLE_MS) + 50);
  }

  function renderDropEffect(index) {
    var cell = cells[index];
    if (!cell) return;
    var slot = cell.querySelector(".fruit-slot");
    var bubble = document.createElement("div");
    bubble.className = "drop-bubble";
    bubble.textContent = getDropLine();
    slot.appendChild(bubble);
    setTimeout(function () {
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    }, HIT_BUBBLE_MS + 50);
  }

  function clearAllFruitVisuals() {
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove("has-fruit");
      var slot = cells[i].querySelector(".fruit-slot");
      if (slot) slot.innerHTML = "";
    }
  }

  function showBanner(text) {
    comboBannerEl.textContent = text;
    comboBannerEl.hidden = false;
    comboBannerEl.classList.remove("combo-banner"); // reflow trick để restart animation
    void comboBannerEl.offsetWidth;
    comboBannerEl.classList.add("combo-banner");
    setTimeout(function () {
      comboBannerEl.hidden = true;
    }, 1200);
  }

  function showComboBannerIfMilestone(count) {
    var line = COMBO_LINES[count];
    if (line) showBanner(line);
  }

  // ---- Quả xuất hiện / lăn xuống (§2.1, §4.3) ----
  function spawnFruit() {
    if (gameState !== "playing") return;
    var idx = pickCellIndex(lastCellIndex);
    lastCellIndex = idx;
    activeCellIndex = idx;
    currentFruit = pickFruit();
    mouseIdCounter += 1;
    currentMouseId = mouseIdCounter;
    renderFruitAt(idx, currentFruit);

    var fruitId = currentMouseId;
    mouseTimer = setTimeout(function () {
      onFruitTimeout(fruitId);
    }, getStageParams().visibleMs);
  }

  function onFruitTimeout(fruitId) {
    if (gameState !== "playing") return;
    if (fruitId !== currentMouseId || activeCellIndex === null) return;
    // Tự lăn xuống: không trừ/cộng điểm, mất combo.
    var idx = activeCellIndex;
    renderFruitAt(idx, null);
    renderDropEffect(idx);
    comboCount = 0;
    activeCellIndex = null;
    scheduleNextFruit();
  }

  function scheduleNextFruit() {
    gapTimer = setTimeout(function () {
      if (gameState === "playing") spawnFruit();
    }, getStageParams().gapMs);
  }

  function handleCellActivate(index) {
    if (gameState !== "playing") return;
    if (activeCellIndex === null || index !== activeCellIndex) return; // sọt trống: không đổi điểm
    if (caughtMouseIds.has(currentMouseId)) return; // phòng hờ: quả này đã tính điểm rồi

    caughtMouseIds.add(currentMouseId);
    clearTimeout(mouseTimer);
    score += 1;
    comboCount += 1;
    renderScore();
    renderHitEffect(index, currentFruit);
    showComboBannerIfMilestone(comboCount);
    activeCellIndex = null;
    scheduleNextFruit();
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
    checkStageTransition();
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
    comboCount = 0;
    lowTimeAnnounced = false;
    lastStageIndex = 0;
    startTime = Date.now();
    activeCellIndex = null;
    lastCellIndex = null;
    currentFruit = null;
    currentMouseId = null;
    caughtMouseIds = new Set();
    mouseIdCounter = 0;

    renderScore();
    renderTime(30);
    lowTimeLineEl.hidden = true;
    comboBannerEl.hidden = true;
    clearAllFruitVisuals();
    gameEl.dataset.state = "playing";

    spawnFruit();
    tickHandle = setInterval(tick, TICK_INTERVAL_MS);

    if (cells[0]) cells[0].focus();
  }

  function finishRound() {
    clearTimers();
    gameState = "finished";
    activeCellIndex = null;
    clearAllFruitVisuals();

    var isRecord = saveHighScoreIfNeeded(score);
    var titleInfo = getTitleFor(score);
    endScoreEl.textContent = score + " quả";
    endTitleEl.textContent = titleInfo.title;
    endCommentEl.textContent = titleInfo.comment;
    endHighScoreEl.textContent = "Điểm cao nhất: " + highScore;
    endRecordEl.textContent = RECORD_LINE;
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

  // ---- Đăng ký người chơi (§2.10, §4.7) ----
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
    startGreetingEl.textContent = pickRandomExcept(GREETING_LINES, lastGreetingLine);
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
