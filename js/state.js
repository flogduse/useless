/* ============================================================
   state.js — shared state + localStorage persistence
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const STORE_KEY = "uselessos_v28";
const RICK = "https://upload.wikimedia.org/wikipedia/commons/e/e5/Rick_Astley-cropped.jpg";
const RICK_ID = "local"; /* all rickrolls now play from assets/rickroll.mp4 */

const IMG = (seed, txt = "") =>
  `<img class="real-img" loading="lazy" alt="${esc(txt)}" src="https://picsum.photos/seed/${seed}/640/420"
   onerror="this.onerror=null;this.src=offlineArt('${seed}',640,420)">`;

const PIMG = (seed, w = 640, h = 420, cls = "real-img", alt = "") =>
  `<img class="${cls}" alt="${esc(alt)}" loading="lazy" src="https://picsum.photos/seed/${seed}/${w}/${h}"
   onerror="this.onerror=null;this.src=offlineArt('${seed}',${w},${h})">`;

/* offline fallback art — generated SVG data URLs so the demo survives no internet */
function offlineArt(seed = "x", w = 640, h = 420) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = n % 360;
  const hue2 = (hue + 60) % 360;
  const shapes = [];
  for (let i = 0; i < 5; i++) {
    const cx = (n >> (i * 3)) % w;
    const cy = (n >> (i * 5 + 1)) % h;
    const r = 12 + ((n >> (i * 7)) % 40);
    shapes.push(`<rect x="${cx}" y="${cy}" width="${r}" height="${r}" fill="hsla(${hue2},70%,60%,.25)" transform="rotate(${i * 23} ${cx} ${cy})"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="hsl(${hue},45%,22%)"/><stop offset="100%" stop-color="hsl(${hue2},55%,12%)"/>` +
    `</linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>` +
    shapes.join("") +
    `<text x="${w/2}" y="${h/2-8}" font-size="30" fill="hsla(${hue2},80%,80%,.7)" text-anchor="middle" font-family="monospace">offline art :(</text>` +
    `<text x="${w/2}" y="${h/2+28}" font-size="14" fill="hsla(${hue2},80%,80%,.5)" text-anchor="middle" font-family="monospace">internet not found · seed ${seed}</text>` +
    `</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const APPS = [
  { id: "browser",  icon: "🌐", label: "Useless Browser" },
  { id: "files",    icon: "📁", label: "Files" },
  { id: "notes",    icon: "📝", label: "Notes" },
  { id: "terminal", icon: "▣",  label: "Terminal" },
  { id: "chat",     icon: "💬", label: "Bill" },
  { id: "radio",    icon: "📻", label: "Lo-Fi Radio" },
  { id: "settings", icon: "⚙️",  label: "Settings" },
  { id: "trash",    icon: "🗑️",  label: "Trash" },
  { id: "activity", icon: "📊",  label: "Activity" },
  { id: "calc",     icon: "🧮",  label: "Calculator" },
  { id: "paint",    icon: "🎨",  label: "UselessPaint" },
  { id: "store",    icon: "🛍️",  label: "App Store" },
  { id: "calendar", icon: "📅",  label: "Calendar" },
  { id: "about",    icon: "❓",  label: "About" },
];

const NAMES = Object.fromEntries(APPS.map(a => [a.id, a.label]));

const DEFAULT_FILES = [
  "Important.txt", "Very_Important.txt", "FINAL.txt",
  "FINAL_FINAL.txt", "DO_NOT_OPEN.txt", "potato.jpg",
  "homework_REAL.pdf", "nothing.exe",
  "resume_FINAL_v12.docx", "tax_returns_perfect.txt",
  "recipe_for_success.txt",
  "master_plan.pdf", "fanfic_about_my_toaster.txt",
  "evidence_exonerating_me.txt",
];

const DEFAULTS = {
  actions: 0, rage: 0, ricks: 0, successful: 0,
  started: Date.now(),
  notes: "",
  files: [...DEFAULT_FILES],
  paintFiles: [],
  paintCount: 0,
  settings: { volume: 83, brightness: 91, sound: true },
  wallpaper: 1,
  storeAttempts: 0,
  powerAttempts: 0,
  konami: false,
  konamiArmed: false,
  cookieWon: false,
  flappyBest: 0,
  demo: false,
  demoShown: false,
  mood: 0,
  grid: false,
  gravity: false,
  captchaDone: false,
  ghosts: [],
};

function loadState() {
  const base = {
    ...structuredClone(DEFAULTS),
    windows: {}, z: 100,
    browser: { history: [], index: -1 },
    _lastSearch: "",
    consecutiveCloses: 0,
    pendingFolder: 0,
    lastAction: 0,
    rickLock: null,
    evadeMisses: 0,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    for (const k of Object.keys(DEFAULTS)) {
      if (saved[k] !== undefined) {
        if (k === "settings") base.settings = { ...base.settings, ...saved[k] };
        else base[k] = saved[k];
      }
    }
  } catch (e) { /* corrupt save. start fresh. */ }
  return base;
}

const state = loadState();

function persist() {
  try {
    const dump = {};
    for (const k of Object.keys(DEFAULTS)) dump[k] = state[k];
    localStorage.setItem(STORE_KEY, JSON.stringify(dump));
  } catch (e) { /* storage full or blocked; nothing to do */ }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }