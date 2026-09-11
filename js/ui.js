/* ============================================================
   ui.js — toasts, windows, drag, context menu, dialogs,
           sounds, lock screen, BSOD, ads
   ============================================================ */

/* ---------- tiny sound engine (with envelopes & chords) ---------- */
let audioCtx = null;
function beep(freq = 440, dur = 0.1, vol = 0.05, type = "square", opts = {}) {
  if (!state.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const play = () => {
      const t0 = audioCtx.currentTime + (opts.when || 0);
      const v = clamp((state.settings.volume || 80) / 100 * vol, 0.001, 0.9);
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (opts.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slide), t0 + dur);
      if (opts.vibrato) {
        const lfo = audioCtx.createOscillator();
        const lg = audioCtx.createGain();
        lfo.frequency.value = opts.vibrato;
        lg.gain.value = freq * 0.012;
        lfo.connect(lg); lg.connect(osc.frequency);
        lfo.start(t0); lfo.stop(t0 + dur);
      }
      const attack = opts.attack ?? 0.008;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(v, t0 + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    };
    /* if the context is still suspended (started before the first user
       gesture), wait for resume so the note isn't scheduled in the past */
    if (audioCtx.state === "suspended") audioCtx.resume().then(play).catch(() => {});
    else play();
  } catch (e) { /* no audio available */ }
}

const sfxClick = () => beep(720, 0.05, 0.04, "triangle", { slide: 1150 });
const sfxOpen  = () => { beep(430, 0.09, 0.05, "sine", { when: 0, slide: 300 }); beep(620, 0.08, 0.035, "triangle", { when: 0.04 }); };
const sfxError = () => { beep(220, 0.4, 0.09, "sawtooth", { slide: 70, vibrato: 30 }); beep(115, 0.5, 0.07, "square", { when: 0.03, slide: 60, vibrato: 22 }); };
const sfxOk    = () => {
  beep(523.25, 0.16, 0.06, "sine", { when: 0 });
  beep(659.25, 0.16, 0.06, "sine", { when: 0.06 });
  beep(783.99, 0.24, 0.06, "sine", { when: 0.12 });
  beep(1046.5, 0.34, 0.05, "triangle", { when: 0.2 });
};
const playNote = (f, dur = 0.3, vol = 0.07, type = "triangle") =>
  beep(f, dur, vol, type, { attack: 0.012, vibrato: 6 });
function sfxWin() {
  [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
    beep(f, 0.3 - i * 0.03, 0.06, "triangle", { when: i * 0.09, attack: 0.01 }));
  beep(1567.98, 0.6, 0.05, "sine", { when: 0.45, vibrato: 8, slide: 1960 });
}
function sfxAd() { beep(1046, 0.09, 0.04, "triangle"); beep(1318, 0.12, 0.045, "triangle", { when: 0.07 }); }
function sfxWhoosh() { beep(300, 0.25, 0.05, "sawtooth", { slide: 950, attack: 0.05 }); }

/* Windows-style "ding" tune — loud, over-dramatic, nostalgic */
function sfxWinChime() {
  beep(659.25, 0.2, 0.32, "triangle", { when: 0, attack: 0.015, vibrato: 7 });
  beep(987.77, 0.3, 0.3, "triangle", { when: 0.16, attack: 0.015, vibrato: 7 });
  beep(1318.51, 0.45, 0.3, "sine", { when: 0.42, attack: 0.02, vibrato: 9 });
  beep(659.25, 0.12, 0.22, "square", { when: 0.9, attack: 0.01, vibrato: 9 });
  beep(988, 0.5, 0.2, "sine", { when: 1.0, vibrato: 7 });
}

/* ---------- wallpaper music themes (generative, Web Audio) ---------- */
let musicTimer = null;
const MOOD_SCALES = {
  2: [261.63, 329.63, 392.0, 493.88],      // Chill: C E G B
  3: [261.63, 261.63, 293.66, 329.63, 349.23, 392.0], // Focus (fake): a drone that lies
  4: [110.0, 233.08, 466.16, 932.33],      // Chaos: get lower and faster
  5: [196.0, 185.0, 174.61, 164.81],       // Broken: detuned and sad
};
function startWallpaperMusic() {
  if (!state.settings.sound || !MOOD_SCALES[state.mood]) return;
  if (musicTimer) clearInterval(musicTimer);
  const scale = MOOD_SCALES[state.mood];
  const tickMs = state.mood === 4 ? 320 : state.mood === 5 ? 700 : 520;
  let step = 0;
  const playBar = () => {
    if (!state.settings.sound) return;
    const f = scale[Math.floor(Math.random() * scale.length)];
    const isChaos = state.mood === 4;
    playNote(f * (isChaos ? 2 : 1), 0.22, isChaos ? 0.055 : 0.04, isChaos ? "sawtooth" : "sine");
    if (Math.random() < 0.3) playNote(f * 1.5, 0.18, 0.02, "sine");
    step++;
  };
  playBar();
  musicTimer = setInterval(playBar, tickMs);
}
function stopWallpaperMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

/* ---------- counters ---------- */
const CATCHY = [
  "Error 429: Too many fucks given. Slow down.",
  "You tried. We noticed. Nobody cared.",
  "404: Motivation not found on this device.",
  "This computer RAN the marathon you keep saying you will.",
  "Your keyword is 'maybe later'. Progress: 0%.",
  "Windows has stopped. UselessOS has just begun.",
  "The system detected YOUR dedication. It is: undefined.",
  "Please drink a verification tea to continue.",
  "Your productivity is being delivered to a different zip code.",
  "This notification was sponsored by your wasted time.",
  "Your computer needs therapy. You are the trigger.",
  "Optimizing system for maximum procrastination...",
  "UselessOS v2.8: now with 2.8 times more uselessness.",
  "Your search history has been judged. Verdict: hilarious.",
  "Tip: Close UselessOS. Actually, never mind.",
  "Your file system is crying. Can you hear it?",
  "System update: fixed the bug that allowed productivity.",
  "Your keyboard is filing a complaint.",
  "Congratulations, you've wasted another minute reading this.",
  "This toast was generated by an AI that hates you.",
];

function act(n = 1) {
  state.actions += n;
  state.rage = Math.max(0, state.rage + n);
  refreshStats();
  persist();
  if (state.actions > 0 && state.actions % 7 === 0) {
    toast("UselessOS", `You've attempted ${state.actions} actions. Successful: ${state.successful}. Keep going.`, "system");
  }
  if (state.actions > 2 && state.actions % 5 === 0 && Math.random() < 0.45) {
    toast("System", CATCHY[Math.floor(Math.random() * CATCHY.length)], "rage");
  }
}

function refreshStats() {
  const set = (id, val) => { const el = id && $(id); if (el) el.textContent = val; };
  set("#statActions", state.actions);
  set("#statSuccess", state.successful);
  set("#statRage", state.rage);
  set("#statRicks", state.ricks);
  set("#rageStart", state.rage);
  const wasted = fmtTime((Date.now() - state.started) / 1000);
  set("#wasted", wasted);
  set("#startTime", wasted);
  if (state.rage >= 20) $(".taskbar").classList.add("statusbar-rage");
}

function fmtTime(s) {
  s = Math.max(0, Math.floor(s));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/* ---------- toasts ---------- */
function toast(title, msg, type = "normal") {
  const wrap = $("#toast");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "toast-item" + (type === "rage" || type === "error" ? " rage" : "") +
    (type === "success" ? " success" : "");
  el.innerHTML = `<b></b><span></span><div class="toast-progress"><i></i></div>`;
  el.children[0].textContent = title;
  el.children[1].textContent = msg;
  wrap.append(el);
  if (type === "rage" || type === "error") sfxError();
  else if (type === "success") sfxOk();
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .4s"; }, 5000);
  setTimeout(() => el.remove(), 5600);
  while (wrap.children.length > 5) wrap.firstChild.remove();
}

/* ---------- window management ---------- */
function openApp(app) {
  const menu = $("#startMenu");
  if (menu && !menu.classList.contains("hidden")) menu.classList.add("hidden");
  if (app === "about" && !state.windows.about) storeToggleRage();
  act();
  sfxOpen();
  if (state.windows[app]) {
    const w = state.windows[app];
    w.classList.remove("minimized");
    activate(w);
    return;
  }
  const w = document.createElement("section");
  w.className = "window";
  w.dataset.app = app;
  w.setAttribute("role", "dialog");
  w.setAttribute("aria-label", NAMES[app]);
  w.style.zIndex = ++state.z;
  const cascade = Object.keys(state.windows).length % 6;
  w.innerHTML = `
    <div class="titlebar">
      <div class="traffic"><i></i><i></i><i></i></div>
      <div class="window-title">${esc(NAMES[app])}</div>
      <div class="win-controls">
        <button title="Maximize" data-max>□</button>
        <button title="Minimize" data-min>−</button>
        <button title="Close" data-close>×</button>
      </div>
    </div>
    <div class="window-body">${content(app)}</div>`;
  $("#windows").append(w);
  if (cascade) w.style.top = `calc(50% + ${cascade * 26}px)`;
  state.windows[app] = w;
  addTask(app, w);
  drag(w);

  w.addEventListener("pointerdown", () => activate(w));
  w.querySelector("[data-close]").addEventListener("click", e => { e.stopPropagation(); closeApp(app); });
  w.querySelector("[data-min]").addEventListener("click", e => { e.stopPropagation(); minimizeApp(app); });
  w.querySelector("[data-max]").addEventListener("click", e => { e.stopPropagation(); toggleMax(app); });

  bindApp(app, w);
  activate(w);
  refreshStats();
}

function activate(w) {
  if (!w || w.classList.contains("minimized")) return;
  w.style.zIndex = ++state.z;
  w.classList.add("active");
  $$(".window").forEach(x => { if (x !== w) x.classList.remove("active"); });
  const task = document.querySelector(`[data-task="${w.dataset.app}"]`);
  if (task) {
    $$(".task-app").forEach(t => t.classList.remove("active"));
    task.classList.add("active");
  }
}

function closeApp(app) {
  const w = state.windows[app];
  if (!w) return;
  if (state.rickLock && state.rickLock.app === app) {
    toast("Close Blocked", "Cannot close a window while Rick is playing. This is the law.", "rage");
    state.consecutiveCloses++;
    sfxError();
    if (state.consecutiveCloses >= 5) { state.consecutiveCloses = 0; bsod("You tried to close Rick's window. Rick is disappointed."); }
    return;
  }
  state.consecutiveCloses++;
  w.remove();
  delete state.windows[app];
  const task = document.querySelector(`[data-task="${app}"]`);
  if (task) task.remove();
  if (typeof w._cleanup === "function") { try { w._cleanup(); } catch (e) {} }
  toast(NAMES[app], "Closed. Your data was not reset.", "system");
  sfxClick();
  persist();
  if (state.consecutiveCloses >= 5) {
    state.consecutiveCloses = 0;
    bsod("You closed five windows in a row. UselessOS considers this suspicious behavior.");
  }
}

function minimizeApp(app) {
  const w = state.windows[app];
  if (!w) return;
  w.classList.add("minimized");
  sfxClick();
}

function toggleMax(app) {
  const w = state.windows[app];
  if (!w) return;
  act();
  if (w.classList.contains("maximized")) {
    w.classList.remove("maximized");
    toast("Window", "Restored. It missed being wasteful.", "system");
    return;
  }
  sfxOk();
  w.classList.add("maximized");
  toast("Window", "Maximized. Enjoy the extra space for nothing.", "success");
  setTimeout(() => {
    if (state.windows[app]) {
      minimizeApp(app);
      toast("Maximize", "Denied. This window has trust issues.", "rage");
    }
  }, 1500);
}

function addTask(app, w) {
  const b = document.createElement("button");
  b.className = "task-app";
  b.dataset.task = app;
  b.textContent = NAMES[app];
  b.addEventListener("click", () => {
    if (state.windows[app]) {
      state.windows[app].classList.remove("minimized");
      activate(state.windows[app]);
    } else openApp(app);
  });
  $("#taskApps").append(b);
}

/* ---------- drag (with occasional "stick" prank) ---------- */
function drag(w) {
  const bar = w.querySelector(".titlebar");
  let startFlag = false;

  bar.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return;
    if (w.classList.contains("maximized")) return;
    const r = w.getBoundingClientRect();
    w.style.transform = "none";
    w.style.left = r.left + "px";
    w.style.top = r.top + "px";
    w.dataset.ox = e.clientX - r.left;
    w.dataset.oy = e.clientY - r.top;
    w.dataset.dragging = "1";
    w.dataset.wasactive = w.classList.contains("active") ? "1" : "0";
    bar.setPointerCapture(e.pointerId);
    activate(w);
    startFlag = true;
  });

  const move = e => {
    if (w.dataset.dragging !== "1") return;
    const ox = +w.dataset.ox, oy = +w.dataset.oy;
    w.style.left = clamp(e.clientX - ox, 0, innerWidth - Math.min(w.offsetWidth, 640)) + "px";
    w.style.top = clamp(e.clientY - oy, 0, innerHeight - 52 - 40) + "px";
  };

  bar.addEventListener("pointermove", move);

  const end = e => {
    if (w.dataset.dragging !== "1") return;
    // stick prank: 12% chance the window follows you for a moment
    if (Math.random() < 0.12) {
      const follow = ev => {
        const ox = +w.dataset.ox, oy = +w.dataset.oy;
        w.style.left = clamp(ev.clientX - ox, 0, innerWidth - w.offsetWidth) + "px";
        w.style.top = clamp(ev.clientY - oy, 0, innerHeight - 52 - 40) + "px";
      };
      document.addEventListener("pointermove", follow);
      setTimeout(() => document.removeEventListener("pointermove", follow), 650);
      toast("Window", "This window prefers to follow you. Normal.", "rage");
    }
    delete w.dataset.dragging;
  };
  bar.addEventListener("pointerup", end);
  bar.addEventListener("pointercancel", () => delete w.dataset.dragging);
}

/* ---------- context menu ---------- */
let ctxCleanup = null;
function hideCtx() {
  const m = $("#ctxMenu");
  if (m) m.classList.add("hidden");
  if (ctxCleanup) { ctxCleanup(); ctxCleanup = null; }
}

function showCtx(x, y, items) {
  const m = $("#ctxMenu");
  m.innerHTML = "";
  items.forEach((it, i) => {
    if (it.sep) {
      const s = document.createElement("div");
      s.className = "ctx-sep";
      m.append(s);
      return;
    }
    const b = document.createElement("button");
    b.className = "ctx-item" + (it.danger ? " danger" : "");
    b.textContent = it.label;
    b.addEventListener("click", () => { hideCtx(); it.fn(); });
    m.append(b);
  });
  m.classList.remove("hidden");
  m.style.left = clamp(x, 4, innerWidth - m.offsetWidth - 4) + "px";
  m.style.top = clamp(y, 4, innerHeight - 52 - m.offsetHeight - 4) + "px";
  ctxCleanup = () => document.removeEventListener("pointerdown", ctxClick, true);
  document.addEventListener("pointerdown", ctxClick, true);
}
function ctxClick(e) {
  if (!e.target.closest("#ctxMenu")) hideCtx();
}

function desktopCtxItems() {
  return [
    { label: "New Folder", fn: newFolder },
    { label: "Refresh (do not wait)", fn: fakeRefresh },
    { label: "Verify you're human", fn: showCaptcha },
    { label: "Paste (no clipboard available)", fn: () => toast("Paste", "Clipboard is empty. It has been empty since 2019.", "system") },
    { sep: true },
    { label: "Display: 8K upscaled", fn: () => toast("Display", "Expanded to 8K. You cannot see the difference.", "system") },
    { label: "Delete desktop", danger: true, fn: () => toast("ACCESS DENIED", "The desktop is load-bearing. Leave it alone.", "rage") },
  ];
}

function windowCtxItems(app) {
  const w = state.windows[app];
  return [
    { label: "Maximize (recommended by nobody)", fn: () => toggleMax(app) },
    { label: "Minimize", fn: () => minimizeApp(app) },
    { label: "Pin this window", fn: () => pinWindow(app) },
    { label: "Close", fn: () => closeApp(app) },
    { sep: true },
    { label: "Copy window contents", fn: () => toast("Clipboard", "Copied 0 bytes. The window is protecting itself.", "rage") },
    { label: "Rage quit", danger: true, fn: () => { closeApp(app); toast("Rage quit", "Your rage has been logged for training purposes.", "rage"); } },
  ];
}

function pinWindow(app) {
  const w = state.windows[app];
  if (!w) return;
  act();
  const wasPinned = w.classList.contains("pinned");
  w.classList.toggle("pinned");
  if (!wasPinned) {
    Object.keys(state.windows).forEach(k => {
      if (k !== app) minimizeApp(k);
    });
    toast("Pin", "Pinned. Every other window was unpinned and ejected.", "success");
  } else {
    toast("Pin", "Unpinned. Chaos may resume.", "system");
  }
}

function newFolder() {
  act();
  state.pendingFolder++;
  state.files.unshift(`New Folder (${state.pendingFolder})`);
  const fw = state.windows.files;
  if (fw && fw.parentNode) fw.remove(); // force re-render with new file
  delete state.windows.files;
  const task = document.querySelector('[data-task="files"]');
  if (task) task.remove();
  openApp("files");
  toast("Folder", "Created successfully. It contains nothing.", "success");
  persist();
}

function fakeRefresh() {
  const spin = document.createElement("div");
  spin.className = "spinner";
  spin.innerHTML = `<svg width="46" height="46" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="#333" stroke-width="5"/><circle cx="25" cy="25" r="20" fill="none" stroke="#8cff00" stroke-width="5" stroke-linecap="round" stroke-dasharray="90 40"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur=".7s" repeatCount="indefinite"/></circle></svg>`;
  document.body.append(spin);
  setTimeout(() => {
    spin.remove();
    toast("Desktop", "Refreshed. Still completely useless.", "system");
  }, 1800);
}

/* ---------- fake modal dialog ---------- */
function fakeDialog(title, body, buttons) {
  const m = $("#modal");
  $("#modalTitle").textContent = title;
  $("#modalBody").textContent = body;
  const acts = $("#modalActions");
  acts.innerHTML = "";
  (buttons || []).forEach(b => {
    const el = document.createElement("button");
    el.className = "btn" + (b.primary ? " site-btn primary" : "");
    el.textContent = b.label;
    el.addEventListener("click", () => { m.classList.add("hidden"); b.fn(); });
    acts.append(el);
  });
  m.classList.remove("hidden");
  sfxError();
}

/* ---------- ad popups ---------- */
const ADS = [
  ["URGENT UPDATE", "Your computer has been selected to receive more computer. Click Update to never receive it."],
  ["⚠️ WARNING: RAGE", "Your rage level is dangerously low. Click a cookie to raise it immediately."],
  ["Special Offer", "Buy 0 productivity points for ₹99. Load is non-existent."],
  ["IMPORTANT: YOU", "There is an urgent notification about you. It is this notification."],
  ["News Flash 📰", "UselessOS has been rated #1 in the category: Useless."],
  ["Install MORE UselessOS", "Congratulations. Double the uselessness. Half the value."],
  ["HOT SINGLES IN YOUR AREA", "They are your keyboard and mouse. They keep fighting."],
  ["YOU WON! 🎉", "You won a free uselessness upgrade. Claim by wasting more time."],
  ["BREAKING NEWS", "UselessOS is still running. Local man still confused."],
  ["Battery 0% 🔋", "Your phone is fine. This is a test. You failed."],
  ["FREE RAM 💾", "Download 500GB of free RAM! It's very productive."],
  ["EMERGENCY", "Your next click may be your last. It won't be."],
  ["SECURITY ALERT", "Someone is trying to make you productive. Blocked."],
  ["90% OFF", "On absolutely nothing. What a deal."],
  ["Congratulations", "You reached the end of this ad. Here's another ad."],
  ["WINDOWS 2000 UPDATE", "Your Windows will now update. For the next 6 years."],
];
function spawnAd() {
  const [t, b] = ADS[Math.floor(Math.random() * ADS.length)];
  const el = document.createElement("div");
  el.className = "ad-pop";
  el.innerHTML = `<button class="ad-x" title="Close">×</button><h4></h4><p></p>
    <div class="ad-btns"><button class="btn ad-later">Later</button><button class="btn site-btn primary ad-now">Update</button></div>
    <div class="store-prog hidden" style="margin-top:10px"><div class="prog-track"><div class="prog-bar"></div></div></div>`;
  el.querySelector("h4").textContent = t;
  el.querySelector("p").textContent = b;
  el.querySelector(".ad-x").addEventListener("click", () => {
    act();
    el.querySelector(".ad-x").style.opacity = ".2";
    toast("Advertisement", "You cannot close this ad. The ad has closed you.", "rage");
  });
  el.querySelector(".ad-now").addEventListener("click", () => {
    const barBox = el.querySelector(".store-prog");
    const btn = el.querySelector(".ad-now");
    btn.disabled = true;
    el.querySelectorAll(".ad-later, .ad-x").forEach(b2 => b2.disabled = true);
    barBox.classList.remove("hidden");
    btn.textContent = "Updating…";
    act();
    toast("Update", "Downloading 0 pixels of progress…", "system");
    setTimeout(() => { btn.textContent = "It will always be 99%."; }, 2600);
  });
  el.querySelector(".ad-later").addEventListener("click", () => {
    act();
    toast("Later", "Later has arrived. It is now.", "rage");
    el.remove();
  });
  sfxAd();
  $("#adLayer").append(el);
  setTimeout(() => el.remove(), 12000);
}

/* ---------- lock screen ---------- */
let lockArmed = false;
function lockScreen() {
  const lk = $("#lockScreen");
  lk.classList.remove("hidden");
  sfxError();
  if (lockArmed) return;
  lockArmed = true;
  $("#lockCancel").addEventListener("click", () => {
    act();
    toast("Lock Screen", "Cancellation not recognized.", "rage");
  });
  $("#lockGiveUp").addEventListener("click", () => {
    act();
    toast("UselessOS", "There is no giving up in UselessOS.", "system");
  });
  lk.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return;
    toast("Lock Screen", "You cannot click your way out of nothing.", "system");
  });
}
function unlock() {
  const lk = $("#lockScreen");
  if (lk.classList.contains("hidden")) return;
  lk.classList.add("hidden");
  toast("Lock Screen", "Unlocked. It was never locked though.", "system");
}

/* ---------- BSOD ---------- */
function bsod(reason, force) {
  if (state.demo && !force) {
    toast("UselessOS", "BSOD suppressed by Demo Mode. The crash was real though.", "rage");
    return;
  }
  const b = $("#bsod");
  $("#bsodPct").textContent = "0%";
  $("#bsodBar").style.width = "0%";
  const body = b.querySelector(".bsod-body h1");
  body.textContent = "USELESS_OS_BSOD";
  b.querySelector(".bsod-body p").textContent = reason || "Nothing was protected because there was nothing to protect.";
  drawFakeQr($("#bsodQr"));
  b.classList.remove("hidden");
  sfxError();
  setTimeout(sfxError, 900);
  let pct = 0;
  const timer = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 100) pct = 100;
    $("#bsodPct").textContent = Math.floor(pct) + "%";
    $("#bsodBar").style.width = pct + "%";
    if (pct >= 100) clearInterval(timer);
  }, 320);
  b.onclick = () => {
    b.classList.add("hidden");
    toast("UselessOS", "Just kidding. Please continue being unproductive.", "system");
  };
  setTimeout(() => {
    if (!b.classList.contains("hidden")) {
      b.classList.add("hidden");
      toast("UselessOS", "Blue screens are for people with things to lose.", "system");
    }
  }, 9000);
}

/* ---------- brightness boom effects ---------- */
function boomDark() {
  const el = $("#boomDark");
  if (!el) return;
  el.classList.remove("hidden");
  el.classList.remove("active");
  void el.offsetWidth;
  el.classList.add("active");
  document.body.classList.add("fx-live");
  sfxError();
  setTimeout(() => sfxWhoosh(), 200);
  setTimeout(() => { el.classList.remove("active"); el.classList.add("hidden"); document.body.classList.remove("fx-live"); }, 1800);
}

function boomWhite() {
  const el = $("#boomWhite");
  if (!el) return;
  el.classList.remove("hidden");
  el.classList.remove("active");
  void el.offsetWidth;
  el.classList.add("active");
  document.body.classList.add("fx-bright");
  sfxError();
  setTimeout(() => beep(300, 0.3, 0.07, "sawtooth", { slide: 900 }), 80);
  setTimeout(() => { el.classList.remove("active"); el.classList.add("hidden"); document.body.classList.remove("fx-bright"); }, 1200);
}

/* ---------- mini toast (small, bottom-right, used sparingly) ---------- */
function miniToast(title, msg) {
  const wrap = $("#miniToast");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "mini-toast";
  el.innerHTML = `<b></b><span></span>`;
  el.children[0].textContent = title;
  el.children[1].textContent = msg;
  wrap.append(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .6s"; }, 3200);
  setTimeout(() => el.remove(), 4000);
  while (wrap.children.length > 2) wrap.firstChild.remove();
}

/* ---------- LEBRON flash (brightness max — his 144P video overexposed) ---------- */
let lebronFlashTimer = null;
let lebronFlashCount = 0;

/* the chicken that lives at the top of the volume bar */
let chickenAudio = null;
function playChicken() {
  if (chickenAudio && !chickenAudio.paused && chickenAudio.currentTime > 0) {
    chickenAudio.currentTime = 0;
    return;
  }
  chickenAudio = new Audio("assets/chicken-scream.webm");
  chickenAudio.volume = 1;
  chickenAudio.play().catch(() => {});
  chickenAudio.addEventListener("ended", () => { chickenAudio.pause(); chickenAudio.currentTime = 0; chickenAudio = null; }, { once: true });
  miniToast("Volume", "100%. A chicken on a tree has been summoned and it is furious.");
}

function lebronFlash() {
  const el = $("#lebronFlash");
  if (!el) return;
  ++lebronFlashCount;
  sfxWin();
  document.body.classList.add("fx-bright");
  el.classList.remove("hidden");
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
  /* the King's 144P video actually plays, singing his own theme song */
  const v = $("#lebronVid");
  if (v) {
    v.currentTime = 0;
    v.volume = clamp((state.settings.volume || 80) / 100, 0, 1);
    v.play().catch(() => {});
  }
  /* noticeably rarer toasts: only ~1 in 4 flashes */
  if (lebronFlashCount % 4 === 1) {
    miniToast("LeBron", [
      "Brightness 100%. He absorbed all of it. The camera kept recording anyway.",
      "His face is officially just an overexposure warning now.",
      "The lens surrendered. The teeth negotiated a stay.",
      "Somewhere a photographer whispered: 'perfect.'"
    ][Math.floor(Math.random() * 4)]);
  }
  if (lebronFlashTimer) clearTimeout(lebronFlashTimer);
  lebronFlashTimer = setTimeout(() => {
    el.classList.add("hidden");
    el.classList.remove("show");
    document.body.classList.remove("fx-bright");
    const v = $("#lebronVid");
    if (v) { v.pause(); v.currentTime = 0; }
  }, 4500);
}

/* ---------- YOU WIN overlay (cookie button) ---------- */
function youWin() {
  const el = $("#youWin");
  if (!el) return;
  sfxWin();
  el.classList.remove("hidden");
  el.classList.add("show");
  toast("CONGRATULATIONS", "You clicked a button that ran away from you for years.", "success");
  state.cookieWon = true;
  setTimeout(() => { el.classList.remove("show"); el.classList.add("hidden"); }, 7000);
}

/* ---------- SHOW OFF auto-demo ---------- */
let showOffTimer = null;
function showOff() {
  const menu = $("#startMenu");
  if (menu) menu.classList.add("hidden");
  if (showOffTimer) return;
  sfxOk();
  toast("SHOW OFF", "UselessOS is now performing. Please contain your confusion.", "success");

  showOffTimer = setTimeout(() => {
    openApp("terminal");
    const t = state.windows.terminal;
    if (t) { termRun("neofetch", t); termRun("sudo make me useful", t); }
  }, 700);

  showOffTimer = setTimeout(() => {
    openApp("browser");
  }, 1900);

  showOffTimer = setTimeout(() => {
    const w = state.windows.browser;
    if (w) { renderBrowser(w, "shop", false); }
    boomWhite();
  }, 2800);

  showOffTimer = setTimeout(() => {
    youWin();
    spamConfetti();
  }, 4200);

  showOffTimer = setTimeout(() => {
    toast("SHOW OFF", "Effects budget exhausted. Crashing for applause…", "rage");
  }, 5600);

  showOffTimer = setTimeout(() => {
    bsod("This demo was too powerful. UselessOS has crashed for your entertainment.", true);
    showOffTimer = null;
  }, 6800);
}

/* ---------- fake QR for the BSOD ---------- */
function drawFakeQr(cv) {
  if (!cv || !cv.getContext) return;
  const x = cv.getContext("2d");
  const N = 12, S = Math.floor(cv.width / N);
  x.fillStyle = "#fff"; x.fillRect(0, 0, cv.width, cv.height);
  x.fillStyle = "#000";
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const inCorner = (i < 4 && j < 4) || (i >= N - 4 && j < 4) || (i < 4 && j >= N - 4);
    if (inCorner && !(i >= 1 && i <= 2 && j >= 1 && j <= 2) && !(i >= N-3 && i <= N-2 && j >= 1 && j <= 2) && !(i >= 1 && i <= 2 && j >= N-3 && j <= N-2)) { x.fillRect(i*S, j*S, S, S); }
    else if (!inCorner && ((i * 7 + j * 11 + Math.floor(i * j / 2)) % 3 === 0)) x.fillRect(i*S, j*S, S, S);
  }
}

/* ---------- "I'm not a robot" captcha ---------- */
let captchaTries = 0;
function showCaptcha() {
  const modal = $("#modal");
  const m = captchaTries;
  $("#modalTitle").textContent = "⚠️ Verify you're human";
  $("#modalBody").innerHTML = `<p style="color:#ccc;line-height:1.6">Prove you are not a robot by ticking this box.<br>
    <span style="font-size:11px;color:#888">The box knows you. The box is judging you.</span></p>
    <div style="display:grid;place-items:center;padding:14px">
      <button class="btn" id="captchaBox" style="width:auto;font-size:13px;padding:10px 16px">☐ I'm not a robot</button>
    </div>`;
  const acts = $("#modalActions");
  acts.innerHTML = "";
  const cancel = document.createElement("button");
  cancel.className = "btn";
  cancel.textContent = "I am, in fact, a robot";
  cancel.addEventListener("click", () => { modal.classList.add("hidden"); toast("Captcha", "Acknowledged. Filing you under 'robots'.", "rage"); });
  acts.append(cancel);
  modal.classList.remove("hidden");
  const box = $("#captchaBox");
  box.addEventListener("pointerover", () => {
    if (Math.random() < 0.55) {
      box.style.transform = `translate(${(Math.random() * 2 - 1) * 60}px, ${(Math.random() * 2 - 1) * 40}px)`;
      box.style.transition = "transform .18s ease";
    } else {
      box.style.transform = "translate(0,0)";
    }
  });
  box.addEventListener("click", () => {
    act();
    captchaTries++;
    if (captchaTries >= 3) {
      captchaTries = 0;
      modal.classList.add("hidden");
      sfxWin();
      spamConfetti();
      toast("Captcha", "CONFIRMED. You are a robot. You have always been a robot. Celebrate.", "success");
      state.captchaDone = true;
    } else {
      sfxError();
      box.textContent = "☐ still not a robot (try " + (3 - captchaTries) + " left)";
      toast("Captcha", "Please tap the picture of a stop sign. There is no picture. Keep trying.", "rage");
    }
  });
}

/* ---------- confetti burst ---------- */
function spamConfetti() {
  const host = $("#youWin");
  if (!host) return;
  for (let i = 0; i < 20; i++) {
    const c = document.createElement("i");
    const colors = ["#8cff00", "#ff625c", "#ffd166", "#5cc8ff", "#fff"];
    c.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-8px;width:7px;height:14px;z-index:99999;background:${colors[i%5]};pointer-events:none;animation:confettiFly ${.9+Math.random()*1.4}s linear ${Math.random()*0.6}s forwards;`;
    document.body.append(c);
    setTimeout(() => c.remove(), 3000);
  }
}

/* ---------- local rickroll player ---------- */
async function embedTube(container, videoId, opts = {}) {
  // Click-to-play poster: the local Rick video only starts after a real user
  // gesture, which satisfies autoplay policies and works fully offline.
  container.classList.add("yt-embed");
  container.innerHTML = `
    <div class="yt-poster" title="Click to play">
      <span class="yt-playbtn">▶</span>
      <span class="yt-poster-hint">click → roll the real Rick (lives on this device)</span>
    </div>`;
  container.querySelector(".yt-poster").addEventListener("click", () => {
    container.innerHTML = `<video src="assets/rickroll.mp4" autoplay controls playsinline preload="metadata"
      style="position:absolute;inset:0;width:100%;height:100%;border:0;background:#000"></video>`;
    const v = container.querySelector("video");
    if (v) v.play().catch(() => {});
    if (opts.onReady) opts.onReady();
  });
  if (opts.onInsert) opts.onInsert();
}

/* ---------- download helper ---------- */
function triggerDownload(dataUrl, filename) {
  try {
    const a = document.createElement("a");
    a.href = dataUrl; a.download = filename;
    document.body.append(a); a.click(); a.remove();
  } catch (e) {}
}

function fileBlob(name, text) {
  return URL.createObjectURL(new Blob([text], { type: "text/plain" }));
}

function storeToggleRage() {
  const w = state.windows.store;
  if (w && w.parentNode) {
    w.remove();
    delete state.windows.store;
  }
  const task = document.querySelector('[data-task="store"]');
  if (task) task.remove();
}