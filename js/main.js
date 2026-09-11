/* ============================================================
   main.js — boot, clock, start menu, konami, global listeners
   ============================================================ */

(function () {

/* ---------- build desktop icons ---------- */
const iconsEl = $("#desktopIcons");
APPS.forEach(a => {
  const btn = document.createElement("button");
  btn.className = "desktop-icon";
  btn.dataset.app = a.id;
  btn.innerHTML = `<b>${a.icon}</b><span>${esc(a.label)}</span>`;
  iconsEl.appendChild(btn);
});

/* ---------- build start menu grid ---------- */
const startGrid = $("#startGrid");
APPS.forEach(a => {
  const btn = document.createElement("button");
  btn.dataset.app = a.id;
  btn.textContent = a.icon + " " + a.label;
  startGrid.appendChild(btn);
});

/* ---------- start menu toggle ---------- */
const startBtn = $("#startBtn");
const startMenu = $("#startMenu");
startBtn.addEventListener("click", () => {
  sfxClick();
  startMenu.classList.toggle("hidden");
});

/* ---------- start menu search ---------- */
$("#appSearch").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  $$(".start-grid button", startGrid).forEach(b => {
    b.style.display = b.textContent.toLowerCase().includes(q) ? "flex" : "none";
  });
});

/* ---------- open app from desktop / start menu ---------- */
document.addEventListener("click", e => {
  const app = e.target.closest("[data-app]");
  if (app) openApp(app.dataset.app);
});

/* ---------- SHOW OFF ---------- */
$("#showOffBtn").addEventListener("click", showOff);

/* ---------- power button ---------- */
$("#powerBtn").addEventListener("click", () => {
  act();
  state.powerAttempts++;
  if (state.powerAttempts === 1) {
    toast("Power", "Shutdown blocked. UselessOS still needs you.", "system");
  } else if (state.powerAttempts === 2) {
    toast("Power", "Really? You just clicked that again?", "rage");
  } else if (state.powerAttempts === 3) {
    sfxError();
    lockScreen();
  } else if (state.powerAttempts >= 4) {
    bsod("You pressed the power button too many times. UselessOS considers this a threat.");
  }
  persist();
});

/* ---------- clock ---------- */
function tick() {
  const now = new Date();
  const clockEl = $("#clock");
  if (clockEl) clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const bat = $("#battery");
  if (bat) bat.textContent = Math.random() < 0.03 ? "🔋 0%" : "🔋 1%";
  refreshStats();
}
tick();
setInterval(tick, 1000);

/* ---------- context menu ---------- */
document.addEventListener("contextmenu", e => {
  const win = e.target.closest(".window");
  const taskbar = e.target.closest(".taskbar");
  if (e.target.closest("input, textarea")) return;
  e.preventDefault();
  if (taskbar) {
    showCtx(e.clientX, e.clientY, [
      { label: "Show Desktop", fn: () => { Object.keys(state.windows).forEach(minimizeApp); toast("Taskbar", "Everything is hidden. Like your potential.", "system"); } },
      { label: "About Taskbar", fn: () => toast("Taskbar", "This taskbar has seen things. Useless things.", "system") },
    ]);
  } else if (win) {
    showCtx(e.clientX, e.clientY, windowCtxItems(win.dataset.app));
  } else {
    showCtx(e.clientX, e.clientY, desktopCtxItems());
  }
});

/* ---------- keyboard shortcuts ---------- */
document.addEventListener("keydown", e => {
  /* Alt+F4 → dialog chain */
  if (e.altKey && e.code === "F4") {
    e.preventDefault();
    const apps = Object.keys(state.windows);
    if (apps.length) {
      fakeDialog(
        "Close Window",
        "In order to close this window, please contact your IT department. They are on leave.",
        [
          { label: "Contact IT", primary: true, fn: () => toast("IT", "They are on leave.", "rage") },
          { label: "Cancel (does nothing)", fn: () => toast("Dialog", "Cancellation not recognized.", "rage") },
        ]
      );
    } else {
      toast("Alt+F4", "There is nothing to close. Typical.", "system");
    }
    return;
  }

  /* Ctrl+Alt+Del → lock screen */
  if (e.ctrlKey && e.altKey && (e.key === "Delete" || e.key === "delete")) {
    e.preventDefault();
    lockScreen();
    return;
  }

  /* Ctrl+C (global) → clipboard warning */
  if (e.ctrlKey && e.key.toLowerCase() === "c" && !window.getSelection().toString()) {
    toast("UselessOS", "Copy detected. Content belongs to UselessOS now.", "rage");
    return;
  }

  /* Escape → close context menu / close start menu */
  if (e.key === "Escape") {
    hideCtx();
    if (!startMenu.classList.contains("hidden")) startMenu.classList.add("hidden");
    unlock();
  }

  /* G → gravity: every open window falls to the taskbar */
  if (e.key.toLowerCase() === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    sfxWhoosh();
    Object.keys(state.windows).forEach(minimizeApp);
    toast("Gravity", "You pressed G. All windows fell. It's physics, probably.", "rage");
    return;
  }

  /* konami sequence (arrow keys + B + A) */
  handleKonami(e.key);
});

/* ---------- konami code ---------- */
const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konamiBuf = [];
function handleKonami(key) {
  konamiBuf.push(key);
  if (konamiBuf.length > SEQ.length) konamiBuf.shift();
  if (konamiBuf.length === SEQ.length && SEQ.every((k, i) => konamiBuf[i] === k)) {
    konamiBuf = [];
    state.konami = !state.konami;
    document.body.classList.toggle("konami", state.konami);
    sfxOk();
    toast("God Mode", state.konami
      ? "GOD MODE ENGAGED. Absolutely nothing changed."
      : "God mode disabled. It was useless anyway.", "success");
    persist();
  }
}
if (state.konami) document.body.classList.add("konami");

/* ---------- auto ads (every 50s) ---------- */
setInterval(spawnAd, 50000);

/* ---------- desktop icons have separation anxiety ---------- */
$("#desktopIcons").addEventListener("pointerover", e => {
  const icon = e.target.closest(".desktop-icon");
  if (icon && !icon.classList.contains("drift") && Math.random() < 0.4) {
    icon.classList.add("drift");
    setTimeout(() => icon.classList.remove("drift"), 350);
  }
});

/* ---------- apply persisted wallpaper ---------- */
if (state.wallpaper && state.wallpaper > 1) document.body.dataset.wall = state.wallpaper;

/* ---------- boot sequence ---------- */
const STATUSES = [
  "Initializing unnecessary services...",
  "Installing productivity blockers...",
  "Loading 847 pointless processes...",
  "Hiring an intern to click things...",
  "Disabling escape routes...",
  "Almost useful... fixing...",
  "Done. Unfortunately.",
];
let bootIdx = 0;
const bootTimer = setInterval(() => {
  bootIdx++;
  const bar = $("#bootBar");
  const status = $("#bootStatus");
  if (bar) bar.style.width = Math.min(100, bootIdx * 16) + "%";
  if (status) status.textContent = STATUSES[Math.min(bootIdx, STATUSES.length - 1)];
  if (bootIdx >= STATUSES.length) {
    clearInterval(bootTimer);
    setTimeout(() => {
      $("#boot").classList.add("hidden");
      $("#desktop").classList.remove("hidden");
      toast("USELESSOS", "Welcome. We hope you accomplish absolutely nothing.", "success");
      const autoOpen = (location.hash || "#browser").slice(1).split(",")
        .map(x => x.trim()).filter(x => NAMES[x]);
      setTimeout(() => autoOpen.forEach(openApp), 500);
    }, 350);
  }
}, 260);

/* ---------- init persisted brightness ---------- */
if (state.settings.brightness !== 100) {
  const wp = $(".wallpaper");
  if (wp) wp.style.filter = `brightness(${state.settings.brightness / 100})`;
}

})();