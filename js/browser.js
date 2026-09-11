/* ============================================================
   browser.js — fake browser with sites, navigation, games
   ============================================================ */

/* ---------- browser chrome ---------- */
function browserShell() {
  return `<div class="browser">
    <div class="browser-top">
      <button class="navbtn" data-act="home" title="Home">⌂</button>
      <button class="navbtn" data-act="back" title="Back">←</button>
      <button class="navbtn" data-act="forward" title="Forward">→</button>
      <button class="navbtn" data-act="reload" title="Reload">↻</button>
      <div class="address" id="address">https://useless.com</div>
    </div>
    <div class="browser-content" id="browserContent">${homePage()}</div>
  </div>`;
}

function bindBrowser(w) {
  w.querySelector("[data-act='home']")?.addEventListener("click", () => route(w, "home"));
  w.querySelector("[data-act='back']")?.addEventListener("click", () => browserBack(w));
  w.querySelector("[data-act='forward']")?.addEventListener("click", () => browserForward(w));
  w.querySelector("[data-act='reload']")?.addEventListener("click", () => { act(); renderBrowser(w, currentRoute(), false); });
  bindHomeInteractions(w);
}

/* ---------- navigation ---------- */
function currentRoute() { return state.browser.history[state.browser.index] || "home"; }

function route(w, next) {
  state.browser.history = state.browser.history.slice(0, state.browser.index + 1);
  state.browser.history.push(next);
  state.browser.index++;
  renderBrowser(w, next, true);
}

function browserBack(w) {
  if (state.browser.index > 0) { state.browser.index--; renderBrowser(w, currentRoute(), false); act(); }
  else toast("Browser", "There is nowhere to go back to.", "system");
}

function browserForward(w) {
  if (state.browser.index < state.browser.history.length - 1) {
    state.browser.index++; renderBrowser(w, currentRoute(), false); act();
  } else toast("Browser", "Forward? Absolutely not.", "system");
}

function renderBrowser(w, r, push) {
  const c = w.querySelector("#browserContent");
  const addr = w.querySelector("#address");
  if (addr) addr.textContent = "https://useless.com/" + (r === "home" ? "" : r);

  let html = "";
  if (r === "home")    html = homePage();
  if (r === "tube")    html = tubePage();
  if (r === "study")   html = studyPage();
  if (r === "cats")    html = catsPage();
  if (r === "shop")    html = shopPage();
  if (r === "mail")    html = mailPage();
  if (r === "wiki")    html = wikiPage();
  if (r === "games")   html = gamesPage();
  if (r === "weather") html = weatherPage();
  if (r === "search")  html = searchPage(w._lastSearch || "");

  c.innerHTML = html;
  if (r === "home")    bindHomeInteractions(w, c);
  if (r === "tube")    bindTubeInteractions(w, c);
  if (r === "study")   bindStudyInteractions(c);
  if (r === "cats")    bindCatsInteractions(c);
  if (r === "shop")    bindShopInteractions(c);
  if (r === "mail")    bindMailInteractions(c);
  if (r === "wiki")    bindWikiInteractions(c);
  if (r === "games")   bindGames(w, c);
  if (r === "weather") bindWeatherInteractions(c);
  if (r === "search")  bindSearchInteractions(c, w);
}

/* ---------- home ---------- */
function homePage() {
  return `<div class="site">
    <div class="browser-note">🔒 Secure connection · 47 cookies · 0 useful websites</div>
    <h1>The Internet.</h1><p>Everything you need. None of it works.</p>
    <div class="fake-search"><input id="searchInput" placeholder="Search for literally anything..."><button class="site-btn primary" id="searchBtn">SEARCH</button></div>
    <div class="browser-cards">
      <div class="web-card" data-site="tube">▶️ <b>UselessTube</b><small>Videos that absolutely should not be watched.</small><button class="ad-x" data-ad>×</button></div>
      <div class="web-card" data-site="shop">🛒 <b>UselessMart</b><small>Buy things you don't need with money you don't have.</small><button class="ad-x" data-ad>×</button></div>
      <div class="web-card" data-site="mail">✉️ <b>UselessMail</b><small>You've got mail. It wishes it hadn't arrived.</small><button class="ad-x" data-ad>×</button></div>
      <div class="web-card" data-site="wiki">📚 <b>UselessWiki</b><small>All knowledge. None of the answers.</small><button class="ad-x" data-ad>×</button></div>
      <div class="web-card" data-site="games">🎮 <b>Games</b><small>Four games. One spawns towers.</small><button class="ad-x" data-ad>×</button></div>
      <div class="web-card" data-site="weather">☁️ <b>Weather</b><small>Forecast: probably weather. Go touch grass.</small><button class="ad-x" data-ad>×</button></div>
    </div>
    <div class="rage-zone"><button class="site-btn primary runaway" id="rageButton">CLICK TO ACCEPT COOKIES</button></div>
    <div class="cookie"><span>By continuing, you agree to let UselessOS waste your time.</span><button class="btn" id="rejectCookies">Reject</button><button class="site-btn primary" id="acceptCookies">Accept All</button></div>
  </div>`;
}

function bindHomeInteractions(w, c) {
  c = c || w.querySelector("#browserContent");
  c.querySelector("#searchBtn")?.addEventListener("click", () => browserSearch(w, c.querySelector("#searchInput").value));
  c.querySelector("#searchInput")?.addEventListener("keydown", e => { if (e.key === "Enter") browserSearch(w, e.target.value); });
  c.querySelectorAll("[data-site]").forEach(x => x.addEventListener("click", e => {
    if (e.target.closest("[data-ad]")) return;
    route(w, x.dataset.site);
  }));
  c.querySelectorAll("[data-ad]").forEach(x => x.addEventListener("click", e => {
    e.stopPropagation(); act(); evade(x.currentTarget);
    toast("Advertisement", "You cannot close this ad. The ad has closed you.", "rage");
  }));
  c.querySelector("#rejectCookies")?.addEventListener("click", () => {
    act(); toast("Cookies", "Rejecting cookies requires accepting cookies.", "rage");
    setTimeout(() => toast("Cookies", "Thank you for accepting cookies.", "success"), 900);
  });

  c.querySelector("#acceptCookies")?.addEventListener("click", () => {
    act();
    toast("Cookies", "Cookies accepted. A reward is on its way... it is you. You are the reward.", "success");
    setTimeout(youWin, 800);
  });

  /* hard-mode runaway cookie button */
  const zone = c.querySelector(".rage-zone");
  const rb = c.querySelector("#rageButton");
  if (zone && rb) {
    zone.addEventListener("pointermove", e => {
      const r = rb.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < 120) {
        evade(rb);
        state.evadeMisses++;
        if (state.evadeMisses % 5 === 0)
          toast("COOKIE", `Attempt #${state.evadeMisses}. The cookie is faster than you.`, "rage");
      }
    });
    rb.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      youWin();
      act();
    });
  }
}

function evade(b) {
  act();
  const p = b.parentElement;
  const speed = 26 + Math.min(state.evadeMisses, 30) * 3;
  const maxX = Math.max(10, p.clientWidth - b.offsetWidth - 5);
  const maxY = Math.max(10, p.clientHeight - b.offsetHeight - 5);
  let nx = b.offsetLeft + (Math.random() < 0.5 ? -1 : 1) * speed * (2 + Math.random());
  let ny = b.offsetTop + (Math.random() < 0.5 ? -1 : 1) * speed * (2 + Math.random());
  b.style.left = Math.min(maxX, Math.max(0, nx)) + "px";
  b.style.top = Math.min(maxY, Math.max(0, ny)) + "px";
}

/* ---------- UselessTube ---------- */
function tubePage() {
  return `<div class="site">
    <div class="browser-note">▶️ UselessTube · 1,000,000,000 viewers · 0 useful videos</div>
    <h1>Trending</h1>
    <div class="video-box" id="tubeStage">
      <div class="play" id="playRick">▶</div>
      <div class="video-controls">
        <button class="btn" data-tube="pause">⏸ Pause</button>
        <button class="btn" data-tube="skip">⏭ Skip</button>
        <button class="btn" data-tube="volume">🔊 100%</button>
      </div>
    </div>
    <h2 id="videoTitle">How to become productive in 5 minutes</h2>
    <p>12 views · uploaded 7 years ago · comments disabled for your safety.</p>
    <div class="video-desc">
      <p>In this video: absolute silence, a clickbait box, and a certified Rick Astley intern.</p>
    </div>
    <div class="browser-cards">
      <div class="web-card" data-site="study"><b>🎧 Study Music</b><small>47 hours of silence, scientifically proven to do nothing.</small></div>
      <div class="web-card" data-site="cats"><b>😺 Funny Cats</b><small>Definitely cats. Probably. Click to check.</small></div>
    </div>
  </div>`;
}

function bindTubeInteractions(w, c) {
  c.querySelector("#playRick")?.addEventListener("click", () => {
    state.ricks++; act(); sfxOk();
    const stage = c.querySelector("#tubeStage");
    stage.innerHTML = "";
    embedTube(stage, RICK_ID, { onReady: () => toast("UselessTube", "You have been successfully rickrolled. The video is now real.", "rage") });
    c.querySelector("#videoTitle").textContent = "Rick Astley — Never Gonna Give You Up (LIVE)";
  });
  c.querySelectorAll("[data-tube]").forEach(b => b.addEventListener("click", () => {
    act();
    const btn = b.dataset.tube;
    if (btn === "pause") toast("UselessTube", "Pause failed. The video is emotionally stronger than you.", "rage");
    else if (btn === "skip") toast("UselessTube", "Skipping... direct to Rick Astley. There is no other content.", "rage");
    else toast("UselessTube", "Volume raised to 200%. Your speakers are filing a complaint.", "rage");
  }));
  c.querySelectorAll("[data-site]").forEach(x => x.addEventListener("click", () => route(w, x.dataset.site)));
}

/* study: 47 hours of silence */
function studyPage() {
  return `<div class="site">
    <div class="browser-note">🎧 Study Music · 47 hours of silence · optimized to do literally nothing</div>
    <h1>Lo-fi Silence Beats to Study To</h1>
    <div class="video-box">
      <div class="play" id="playSilence">🔇</div>
      <div class="video-controls">
        <button class="btn" id="silencePause">⏸ Pause Silence</button>
        <button class="btn" id="silenceSkip">⏭ Skip</button>
      </div>
    </div>
    <h2 id="silenceTitle">47 hours of pure silence</h2>
    <p>Time you wasted listening to nothing: <b id="silenceTimer" class="green">00:00:00</b></p>
    <div class="browser-note">🔊 Headphones recommended. Silence is loud when you're this unproductive.</div>
  </div>`;
}

function bindStudyInteractions(c) {
  let seconds = 0, playing = false, t;
  const timerEl = c.querySelector("#silenceTimer");
  c.querySelector("#playSilence")?.addEventListener("click", () => {
    act(); sfxOk();
    if (!playing) {
      playing = true;
      c.querySelector("#playSilence").textContent = "🔇";
      c.querySelector("#silenceTitle").textContent = "47 hours of pure silence (now playing)";
      t = setInterval(() => {
        seconds++;
        const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        timerEl.textContent = `${h}:${m}:${s}`;
        if (seconds === 120) toast("Study Music", "2 minutes of silence achieved. You are unstoppable.", "success");
      }, 1000);
    }
  });
  c.querySelector("#silencePause")?.addEventListener("click", () => {
    act(); clearInterval(t);
    toast("Study Music", "Silence cannot be paused. It was never making sound.", "rage");
  });
  c.querySelector("#silenceSkip")?.addEventListener("click", () => {
    act(); clearInterval(t);
    timerEl.textContent = "00:00:00"; seconds = 0;
    toast("Study Music", "Skipped to the next hour of silence (still silence).", "system");
  });
}

/* cats — real photos (with attitude) */
const CATS = [
  { code: 200, text: "OK (this cat is fine)" },
  { code: 201, text: "Created (a mess)" },
  { code: 206, text: "Partial Content (cat only ate part of the plant)" },
  { code: 301, text: "Moved Permanently (to the fridge)" },
  { code: 404, text: "Cat Not Found (hiding)" },
  { code: 418, text: "I'm a Teapot (and a cat)" },
  { code: 500, text: "Internal Server Error (cat is judging you)" },
  { code: 599, text: "Network Connect Timeout (cat refused)" },
];

/* offline fallback: a hand-drawn cat SVG, so no placeholder text shows */
function catArt(code, w, h) {
  let n = 0;
  const s = String(code);
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
  const body = n % 2 ? "#dba366" : "#93887c";
  const inner = n % 3 === 0 ? "#e6b88f" : "#a99b8c";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#1b1b22"/>
      <circle cx="150" cy="175" r="92" fill="${body}"/>
      <path d="M58 120 L36 58 L110 108 Z" fill="${body}"/>
      <path d="M242 120 L264 58 L190 108 Z" fill="${body}"/>
      <path d="M70 128 L36 68 L110 112 Z" fill="${inner}"/>
      <path d="M230 128 L264 68 L190 112 Z" fill="${inner}"/>
      <circle cx="118" cy="160" r="9" fill="#0c0c10"/>
      <circle cx="182" cy="160" r="9" fill="#0c0c10"/>
      <circle cx="121" cy="157" r="3.4" fill="#fff"/>
      <circle cx="185" cy="157" r="3.4" fill="#fff"/>
      <path d="M150 178 Q150 186 143 188" stroke="#20160a" stroke-width="3.6" fill="none"/>
      <circle cx="150" cy="185" r="6.5" fill="#ffb3c1"/>
      <path d="M150 150 L102 172 M150 150 L198 172 M150 192 L96 212 M150 192 L204 212"
        stroke="#0006" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <text x="150" y="258" font-size="22" fill="#ffd166" text-anchor="middle" font-family="monospace" font-weight="bold">#${s}</text>
      ${code === 404 ? `<ellipse cx="220" cy="120" rx="30" ry="16" fill="#0006" transform="rotate(-8 220 120)"/>
        <path d="M197 120 L243 120" stroke="#0009" stroke-width="10" stroke-linecap="round"/>` : ""}
    </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function catsPage() {
  return `<div class="site">
    <div class="browser-note">😺 Funny Cats · 8 photos · 0 of them will load on first try (probably)</div>
    <h1>Funny Cats</h1>
    <p>Actual cat photos. Delivered with an HTTP status code, because we respect the internet.</p>
    <div class="cat-grid">${CATS.map((x, i) => `
      <button class="cat-item" data-cat="${i}">
        <img class="cat-photo" src="https://http.cat/${x.code}" alt="cat ${x.code}" onerror="this.onerror=null;this.src=catArt(${x.code},300,300)">
        <span>${x.code} — ${esc(x.text)}</span>
      </button>`).join("")}</div>
    <div class="cat-result" id="catResult"></div>
  </div>`;
}

function bindCatsInteractions(c) {
  c.querySelectorAll("[data-cat]").forEach(x => x.addEventListener("click", () => {
    const code = CATS[+x.dataset.cat].code;
    act();
    const r = c.querySelector("#catResult");
    if (code === 404) {
      sfxError();
      r.innerHTML = `<div class="browser-note">404: Cat not found.</div>
        <p style="color:#777">This cat is hiding. It has seen your search history and does not wish to be seen.</p>
        <div class="cat-flee">🐈‍⬛ <span>running...</span></div>`;
      toast("Funny Cats", "A cat escaped your click. There are now fewer cats.", "rage");
    } else {
      sfxOk();
      r.innerHTML = `<div class="browser-note">Cat ${code} responded within 1ms. A new record.</div>
        <img class="cat-photo" src="https://http.cat/${code}" alt="cat ${code}" onerror="this.onerror=null;this.src=catArt(${code},400,300)">
        <p style="text-align:center;color:#888;font-size:11px">${esc(CATS[+x.dataset.cat].text)}. The cat requires treats immediately.</p>`;
      toast("Funny Cats", "Cat downloaded successfully. It has been printed.", "success");
    }
  }));
}

/* ---------- UselessMart ---------- */
const SHOP_ITEMS = [
  { icon: "🥔", name: "Premium Potato", price: "₹89,999", seed: "spud", popup: "The legendary ₹89,999 potato is actually an egg. It has always been an egg. It spins now, forever, for you.", fun: `<div class="egg-spin"><span>🥔</span><span>🥚</span></div>` },
  { icon: "🪑", name: "Chair (slightly used)", price: "₹1", seed: "chair", popup: "Assembly required. 45 minutes and a relationship crisis not included. Screws missing: all of them. One screw added: for you.", fun: `<div class="egg-spin"><span>🪑</span><span>🔧</span></div>` },
  { icon: "📦", name: "Empty Box", price: "₹14,999", seed: "box", popup: "Contains: anticipation, air, and the ghost of a product you deserved but never received.", fun: `<div class="egg-spin"><span>📦</span><span>💨</span></div>` },
  { icon: "🧱", name: "Single Brick", price: "₹6,500", seed: "brickwall", popup: "Brick. Found near a window. Use responsibly. Or don't. It's yours now. Also: you can't return it.", fun: `<div class="egg-spin"><span>🧱</span><span>💥</span></div>` },
];

function shopPage() {
  return `<div class="site">
    <div class="browser-note">🛒 UselessMart · Free shipping on everything that shouldn't be shipped</div>
    <h1>Recommended for you</h1><p>Based on your extremely questionable browsing history.</p>
    ${SHOP_ITEMS.map(x => `<div class="shop-item"><span class="mart-thumb" title="${esc(x.name)}">${x.icon}</span><span><b>${esc(x.name)}</b></span><span style="flex:none">${esc(x.price)} <button class="btn buy" data-item="${esc(x.name)}">BUY NOW</button></span></div>`).join("")}
    <div class="browser-note">⚠️ Checkout currently unavailable because we don't want you to have nice things.</div>
  </div>`;
}

function bindShopInteractions(c) {
  const items = Object.fromEntries(SHOP_ITEMS.map(x => [x.name, x]));
  c.querySelectorAll(".buy").forEach(b => b.addEventListener("click", () => {
    act();
    const it = items[b.dataset.item];
    if (it) {
      toast("UselessMart", it.icon + " added to cart. Cart is a concept.", "system");
      setTimeout(() => memePopup(it.popup, it.fun, it.icon), 350);
    } else {
      toast("UselessMart", "Item not in stock. Item was never in stock. Item is not real.", "rage");
    }
  }));
}

function memePopup(text, fun, icon) {
  const m = $("#modal");
  if (!m) return toast("UselessMart", "Payment failed. Your bank account is too useful.", "rage");
  $("#modalTitle").textContent = `${icon} UselessMart`;
  $("#modalBody").innerHTML = `${fun}
    <p style="margin-top:10px;line-height:1.6">${esc(text)}</p>
    <div class="browser-note" style="margin-top:10px">Payment method: NONE. Checkout has failed before you even tried.</div>`;
  const acts = $("#modalActions");
  acts.innerHTML = "";
  const ok = document.createElement("button");
  ok.className = "btn site-btn primary";
  ok.textContent = "I understand the scam";
  ok.addEventListener("click", () => {
    m.classList.add("hidden");
    act();
    toast("Checkout", "Payment failed. Your bank account is too useful.", "rage");
  });
  acts.append(ok);
  m.classList.remove("hidden");
  sfxError();
}

/* ---------- UselessMail ---------- */
const EMAILS = [
  { from: "Professor", subject: "IMPORTANT", icon: "📚", seed: "assignment",
    body: "Your assignment is worth 12% of your grade. It is now worth my attention. Attend class or perish.",
    attach: "assignment_grading_checklist.xlsx", fun: "<div class='mail-anim'>📚</div>" },
  { from: "Your bank", subject: "URGENT", icon: "🏦", seed: "bank",
    body: "We noticed a suspicious purchase: EVERYTHING. Balance removed for your protection. You may appeal. You won't.",
    attach: "balance_statement_finally_zero.pdf", fun: "<div class='mail-anim'>🔥🏦</div>" },
  { from: "Mom", subject: "call me", icon: "👁️", seed: "mom",
    body: "Call me. I know you opened this email instead of calling. I know everything. I have always known.",
    attach: "family_tree_mystery.png", fun: "<div class='mail-anim'>👁️📍</div>" },
  { from: "You", subject: "draft", icon: "🫥", seed: "void",
    body: "Hello it's me, you. This draft is empty because we both know you weren't going to do anything with it.",
    attach: null, fun: "<div class='mail-anim'>🫥</div>" },
];

function mailPage() {
  return `<div class="site">
    <div class="browser-note">✉️ UselessMail · Inbox (4) · Spam (everything)</div>
    <h1>Inbox</h1>
    <div class="mail">
      <div class="mail-list">${EMAILS.map((x, i) => `<div class="mail-item" data-mail="${i}"><b>${x.icon} ${esc(x.from)}</b><small>${esc(x.subject)}</small></div>`).join("")}</div>
      <div class="mail-view" id="mailView"><b>Click an email.</b><p style="color:#777;font-size:11px">Opening it may make it worse.</p></div>
    </div>
  </div>`;
}

function bindMailInteractions(c) {
  c.querySelectorAll("[data-mail]").forEach(m => m.addEventListener("click", () => {
    act();
    const mail = EMAILS[+m.dataset.mail];
    const view = c.querySelector("#mailView");
    view.innerHTML = `<div class="mail-in"><div class="mail-in-icon">${mail.fun}</div>
      <h3>${esc(mail.from)} — ${esc(mail.subject)}</h3>
      <p>${esc(mail.body)}</p>
      ${mail.attach ? `<div class="mail-att" data-att="1">${PIMG(mail.seed, 120, 120, "small-img", "attachment")}<b>📎 ${esc(mail.attach)}</b><button class="btn" data-dl="${esc(mail.attach)}">Download</button></div>` : ""}
      <div class="mail-foot">Sent: 5 minutes ago · Read: by you, regrettably.</div></div>`;
    view.querySelectorAll("[data-att]").forEach(a => a.addEventListener("click", () => {
      const dl = a.querySelector("[data-dl]");
      if (!dl) return;
      act();
      const fname = dl.dataset.dl;
      triggerDownload(fileBlob(fname, `This is ${fname}.\nIt contains everything you asked for, minus the request and the thing.\n\nLove,\n${mail.from}`), fname);
      toast("UselessMail", `${fname} downloaded successfully. It is useless, as promised.`, "success");
      sfxOk();
    }));
    sfxClick();
  }));
}

/* ---------- UselessWiki ---------- */
function wikiPage() {
  return `<div class="site">
    <div class="browser-note">📚 UselessWiki · The free encyclopedia that cites absolutely nothing</div>
    <h1>Banana</h1>
    <div class="wiki-infobox">
      <img class="small-img" style="width:90px;height:90px" src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg" alt="A banana" onerror="this.onerror=null;this.src=offlineArt('banana',120,120)">
      <div><b>Kingdom:</b> Plantæ<br><b>Class:</b> Fruit<br><b>Certification:</b> yes<br><b>Ripeness:</b> debatable</div>
    </div>
    <div class="wiki-toc"><b>Contents</b><ol><li>Biology</li><li>History</li><li>Controversy</li><li>See also</li></ol></div>
    <h2>Biology</h2><p>A banana is a banana. It is yellow when ripe and black when guilty.</p>
    <p>A scientific fact: bananas are berries, and strawberries are not berries. This fact angers everyone involved.</p>
    <h2>History</h2><p>The first banana was discovered by whoever was hungry first.</p>
    <p><i>bananus uselessus</i> was ceremonially named by a committee that never met.</p>
    <h2>Controversy</h2><p>Sources disagree on whether peeling from the stem or the tip is legal. Both parties are wrong.</p>
    <div class="wiki-didyouknow"><b>Did you know?</b> A banana ghost walks the produce aisle. It haunts indecisive shoppers.</div>
    <p><button class="site-btn primary" id="editWiki">[edit]</button> <button class="btn" id="citation">citation needed</button></p>
    <h2>See also</h2>
    <div class="browser-note">• The onion that judged you<br>• Gravitational produce<br>• Nothing else</div>
  </div>`;
}

function bindWikiInteractions(c) {
  c.querySelector("#editWiki")?.addEventListener("click", () => {
    act(); toast("UselessWiki", "Editing disabled because the article is already perfect.", "system");
  });
  c.querySelector("#citation")?.addEventListener("click", () => {
    act(); toast("UselessWiki", "Citation needed. Also, courage.", "rage");
  });
}

/* ---------- weather ---------- */
function weatherPage() {
  return `<div class="site">
    <div class="browser-note">☁️ UselessWeather · Forecasting the obvious since 2026</div>
    <h1>Today's weather</h1>
    <div class="activity-card">
      <div class="big-stat">☀️ 27°C</div>
      <p>Chance of weather: 100%</p>
      <p>Wind: moving air</p>
      <p>Humidity: probably</p>
      <button class="site-btn primary" id="refreshWeather">Check forecast</button>
      <button class="btn" id="whatWear">What should I wear?</button>
    </div>
  </div>`;
}

function bindWeatherInteractions(c) {
  c.querySelector("#refreshWeather")?.addEventListener("click", () => {
    act(); sfxError();
    const m = $("#modal");
    if (!m) return;
    $("#modalTitle").textContent = "🌤️ UselessWeather";
    $("#modalBody").innerHTML = `<div class="grass-msg">🌱<h2>GO TOUCH GRASS<br>AND FIND IT YOURSELF.</h2><p style="color:#888">The grass is 27°C. The forecast is: you outside, finally.</p></div>`;
    const acts = $("#modalActions");
    acts.innerHTML = "";
    const ok = document.createElement("button");
    ok.className = "btn site-btn primary";
    ok.textContent = "I am inside. Thank you.";
    ok.addEventListener("click", () => {
      m.classList.add("hidden");
      toast("Weather", "Forecast updated: still weather, still inside.", "system");
    });
    acts.append(ok);
    m.classList.remove("hidden");
  });
  c.querySelector("#whatWear")?.addEventListener("click", () => {
    act();
    toast("Weather", "You shouldn't be outside. Stay in. Keep wasting time.", "rage");
  });
}

/* ---------- search ---------- */
function searchPage(q) {
  let cards = [
    ["Rick Astley — Never Gonna Give You Up", "Top result. Obviously."],
    ["How to stop wasting time", "You are currently on the wrong website."],
    ["Useful website", "404: Useful not found."],
  ];
  const l = (q || "").toLowerCase();
  if (l.includes("cat") || l.includes("image") || l.includes("photo"))
    cards = [["Rick Astley image", "We found exactly what you didn't ask for."], ["More Rick Astley", "Yes, more."], ["Cat.jpg", "We couldn't find it."]];
  return `<div class="site">
    <h1>Search results for "${esc(q)}"</h1>
    ${cards.map(([t, s]) => `<div class="result" data-searchresult><b>${esc(t)}</b><small>${esc(s)}</small></div>`).join("")}
    <div id="searchImage"></div>
  </div>`;
}

function bindSearchInteractions(c, w) {
  c.querySelectorAll("[data-searchresult]").forEach(x => x.addEventListener("click", () => {
    state.ricks++;
    const img = c.querySelector("#searchImage");
    img.innerHTML = `<img class="rick" src="${RICK}" alt="Rick Astley"><div class="image-credit">Image: choo chin nian / Wikimedia Commons · CC BY-SA 2.0</div><h2>Rick Astley</h2><p>You searched for "${esc(w._lastSearch || "")}". We found this.</p>`;
    toast("Image Search", "Your search has been optimized.", "rage");
  }));
}

function browserSearch(w, q) {
  q = (q || "").trim();
  act();
  if (!q) { toast("Search", "You searched for nothing. Bold.", "system"); return; }
  w._lastSearch = q;
  state.browser.history = state.browser.history.slice(0, state.browser.index + 1);
  state.browser.history.push("search");
  state.browser.index++;
  renderBrowser(w, "search", false);
}

/* ---------- games ---------- */
function gamesPage() {
  return `<div class="site">
    <div class="browser-note">🎮 Games · Please enjoy responsibly</div>
    <h1>Choose a game</h1>
    <div class="browser-cards">
      <div class="web-card" data-game="reaction"><b>⚡ Reaction Test</b><small>Human benchmark. See how slow you really are.</small></div>
      <div class="web-card" data-game="guess"><b>🎯 Guess the Number</b><small>It is between 1 and 1. You get one try. It ends in the trash.</small></div>
      <div class="web-card" data-game="clicker"><b>🔘 Clicker</b><small>Reach 100 clicks. Reward: a surprise. Not a good one.</small></div>
      <div class="web-card" data-game="porsche"><b>✈️ Porsche 9-11</b><small>Non-stop flight, inbound to downtown. The aircraft has been cleared to proceed. By everyone.</small></div>
    </div>
    <div id="gameArea"></div>
  </div>`;
}

function bindGames(w, c) {
  const area = c.querySelector("#gameArea");
  c.querySelector("[data-game='reaction']")?.addEventListener("click", () => bootReaction(area));
  c.querySelector("[data-game='guess']")?.addEventListener("click", () => bootGuess(area));
  c.querySelector("[data-game='clicker']")?.addEventListener("click", () => bootClicker(area));
  c.querySelector("[data-game='porsche']")?.addEventListener("click", () => bootPorsche(area));
}

/* reaction: real human benchmark */
function bootReaction(area) {
  act(); sfxClick();
  const times = [];
  area.innerHTML = `<div class="reaction" id="reactionBox">CLICK TO START</div>
    <div class="reaction-stats" id="reactionStats">Last 5: — · Avg: — · Best: —</div>`;
  const box = area.querySelector("#reactionBox");
  const stats = area.querySelector("#reactionStats");
  let stateR = "idle", startT = 0, timer = null;

  const renderStats = () => {
    if (!times.length) stats.innerHTML = "Last 5: — · Avg: — · Best: —";
    else {
      const last5 = times.slice(-5).map(t => t + "ms").join(", ");
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const best = Math.min(...times);
      stats.innerHTML = `Last 5: ${last5} · Avg: <b class="green">${avg}ms</b> · Best: <b class="green">${best}ms</b> · Attempts: ${times.length}`;
    }
  };

  box.addEventListener("click", () => {
    if (stateR === "idle") {
      stateR = "waiting";
      box.classList.remove("go", "early");
      box.textContent = "WAIT...";
      box.classList.add("wait");
      timer = setTimeout(() => {
        if (stateR !== "waiting") return;
        stateR = "go";
        box.classList.remove("wait");
        box.classList.add("go");
        box.textContent = "CLICK NOW!";
        startT = performance.now();
      }, 1000 + Math.random() * 4000);
    } else if (stateR === "waiting") {
      clearTimeout(timer);
      stateR = "idle";
      box.classList.remove("wait");
      box.classList.add("early");
      box.textContent = "TOO SOON. You are eager and wrong.";
      act();
      setTimeout(() => { if (box.isConnected) { box.textContent = "CLICK TO START"; box.classList.remove("early"); } }, 800);
    } else if (stateR === "go") {
      const ms = Math.round(performance.now() - startT);
      times.push(ms);
      stateR = "idle";
      box.classList.remove("go");
      box.textContent = `Click again... (${ms}ms)`;
      act();
      state.successful++;
      sfxOk();
      if (ms < 150) toast("Reaction Test", "Under 150ms. Either fast or predictive. We're watching you.", "system");
      else if (ms > 600) toast("Reaction Test", "Over 600ms. Is your cursor on another monitor?", "rage");
      setTimeout(() => { if (box.isConnected) { box.textContent = "CLICK TO START"; } }, 900);
      renderStats();
    }
  });
}

/* guess: 1 to 1 → KABOOM IN THE TRASH */
function bootGuess(area) {
  act(); sfxClick();
  area.innerHTML = `<div class="browser-note">Guess the number from 1 to 1.</div>
    <input id="guessInput" style="background:#171717;border:1px solid #333;color:#fff;padding:10px;border-radius:7px" value="1">
    <button class="site-btn primary" id="guessBtn">GUESS</button>
    <div class="kaboom-scene hidden" id="kaboomScene">
      <div class="kaboom-throw"><span class="kaboom-num">1</span><span class="kaboom-trash">🗑️</span></div>
      <div class="kaboom-boom">💥</div>
      <div class="kaboom-text">KABOOM IN THE TRASH</div>
    </div>`;
  const scene = area.querySelector("#kaboomScene");
  const go = () => {
    act();
    const val = parseInt(area.querySelector("#guessInput").value, 10);
    if (val === 0) {
      sfxWin();
      area.querySelector("#guessBtn").disabled = true;
      scene.querySelector(".kaboom-num").textContent = "0";
      scene.querySelector(".kaboom-throw").classList.add("hidden");
      scene.querySelector(".kaboom-boom").textContent = "🏆";
      scene.querySelector(".kaboom-text").innerHTML = "YOU WON! 🎉<small>Guessing 0 of the only valid number is a 100% miss. That's a jackpot by lottery standards.</small>";
      scene.classList.remove("hidden");
      scene.querySelector(".kaboom-boom").classList.add("pop", "win");
      spamConfetti();
      toast("Guessing Game", "YOU WON by guessing 0. The number 1 is now jealous and might cry in the trash.", "success");
      setTimeout(() => {
        area.querySelector("#guessBtn").disabled = false;
        scene.classList.add("hidden");
        scene.querySelector(".kaboom-throw").classList.remove("hidden");
        scene.querySelector(".kaboom-num").textContent = "1";
        scene.querySelector(".kaboom-boom").textContent = "💥";
        scene.querySelector(".kaboom-boom").classList.remove("pop", "win");
        scene.querySelector(".kaboom-text").innerHTML = "KABOOM IN THE TRASH";
      }, 3200);
      return;
    }
    sfxError();
    area.querySelector("#guessBtn").disabled = true;
    scene.classList.remove("hidden");
    setTimeout(() => {
      toast("Guessing Game", "KABOOM. The number 1 has been disposed of in the trash. It is now the number 0.", "rage");
      scene.querySelector(".kaboom-boom").classList.add("pop");
      setTimeout(() => {
        area.querySelector("#guessBtn").disabled = false;
        scene.classList.add("hidden");
        scene.querySelector(".kaboom-boom").classList.remove("pop");
      }, 2600);
    }, 900);
  };
  area.querySelector("#guessBtn").onclick = go;
  area.querySelector("#guessInput").onkeydown = e => { if (e.key === "Enter") go(); };
}

/* clicker: 100 clicks → rickroll */
function bootClicker(area) {
  act(); sfxClick();
  let n = 0;
  area.innerHTML = `<div class="browser-note">Clicks: <b id="clickCount">0</b>/100</div>
    <div class="clicker-zone"><button class="site-btn primary runaway" id="clicker">CLICK ME</button></div>
    <div id="clickerReward"></div>`;
  const btn = area.querySelector("#clicker");
  const count = area.querySelector("#clickCount");
  const zone = area.querySelector(".clicker-zone");

  zone.addEventListener("pointermove", e => {
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < 55 && n < 30) {
      const mx = Math.max(10, zone.clientWidth - btn.offsetWidth - 6);
      const my = Math.max(10, zone.clientHeight - btn.offsetHeight - 6);
      btn.style.left = Math.random() * mx + "px";
      btn.style.top = Math.random() * my + "px";
    }
  });

  btn.addEventListener("click", () => {
    n++; act(); sfxClick();
    count.textContent = n;
    if (n === 100) {
      btn.disabled = true;
      state.successful++;
      sfxOk();
      const rw = area.querySelector("#clickerReward");
      rw.innerHTML = `<div class="browser-note">Achievement unlocked: clicked 100 times for no reason.</div>`;
      embedTube(rw, RICK_ID, { onReady: () => toast("Achievement", "100 clicks. Your reward is Rick Astley. You earned this.", "rage") });
      state.ricks++;
    }
  });
}

/* Porsche 9-11: flappy plane vs twin towers */
let porscheKeyCleanup = null;
function bootPorsche(area) {
  act(); sfxClick();
  area.innerHTML = `<div class="browser-note">✈️ PORSCHE 9-11 — NON-STOP. Inbound to downtown. The towers are expecting you and they are two of the tallest buildings in the city. Tap/spc to flap. History needs a pilot. It has you.</div>
    <div class="flappy-wrap">
      <canvas class="flappy-canvas" id="flappyCanvas" width="640" height="360"></canvas>
      <div class="flappy-start"><button class="site-btn primary" id="flappyStart">▶ BOARD THE FLIGHT (no clearance)</button></div>
      <div class="flappy-over hidden"><h2>✈️ TWO STRUCTURES ACHIEVED</h2><p>Flight score: <b id="flappyScoreEnd">0</b></p><button class="site-btn primary" id="flappyRestart">Fly again (a sequel nobody asked for)</button></div>
    </div>
    <div class="browser-note">Towers unimpeded: <b id="flappyScore">0</b> · Best flight: <b id="flappyBest">${state.flappyBest || 0}</b> · Praise: none</div>`;

  const canvas = area.querySelector("#flappyCanvas");
  const ctx = canvas.getContext("2d");
  const startBtn = area.querySelector("#flappyStart");
  const over = area.querySelector(".flappy-over");
  const scoreEl = area.querySelector("#flappyScore");
  const bestEl = area.querySelector("#flappyBest");

  let plane = { y: 160, vy: 0, r: 12 };
  let obs = [], dist = 0, score = 0, playing = false, dead = false, raf = 0, frame = 0;

  const reset = () => {
    plane.y = 160; plane.vy = 0; obs = []; dist = 0; score = 0; playing = true; dead = false;
    over.classList.add("hidden");
    scoreEl.textContent = "0";
    obs.push(makeObs());
  };

  const makeObs = () => {
    const g = Math.max(130, 152 - score * 2);
    const maxTop = canvas.height - 70 - g;
    return { x: canvas.width + 50, gapY: 50 + Math.random() * Math.max(40, maxTop), gapH: g, passed: false, sway: Math.random() > 0.5 ? 1 : -1 };
  };

  const flap = () => { if (playing && !dead) { plane.vy = -6.9; sfxClick(); } };
  canvas.addEventListener("pointerdown", e => { e.preventDefault(); flap(); });
  if (porscheKeyCleanup) porscheKeyCleanup();
  document.addEventListener("keydown", onKey);
  porscheKeyCleanup = () => document.removeEventListener("keydown", onKey);

  function onKey(e) {
    if ((e.code === "Space" || e.key.toLowerCase() === "w") && area.isConnected) {
      if (playing) flap();
      e.preventDefault();
    }
  }

  startBtn.addEventListener("click", () => { reset(); startBtn.parentElement.classList.add("hidden"); });
  area.querySelector("#flappyRestart")?.addEventListener("click", () => { reset(); });

  const CRASH_QUOTES = [
    "Never forget: you clicked BOARD. The towers had two meetings that day. They were good meetings.",
    "The flight has reached its destination. Everyone on board is fine. That sentence has never been said about this flight.",
    "Cleared for takeoff. Not cleared for flying into things. Yet here we are. The towers send their regards.",
    "The NTSB would like a word. The towers would like one too. Make it quick.",
    "Porsche 9-11: the car never lies, but the flight numbers made a humble suggestion.",
    "Impact verified. Drew Barrymore has not been contacted and would prefer to keep it that way.",
  ];

  const loop = () => {
    if (!area.isConnected) return;
    frame++;
    if (playing && !dead) {
      plane.vy = Math.min(plane.vy + 0.42, 8.6);
      plane.y += plane.vy;
      if (plane.y < 10) plane.y = 10;
      if (plane.y > canvas.height - 14) { crash(); }

      const speed = 1.7 + Math.min(score * 0.018, 0.6);
      dist += speed;
      const spacing = Math.max(280, 330 - score * 4);
      if (dist > 140 && (obs[obs.length - 1].x < canvas.width - spacing)) { obs.push(makeObs()); dist = 0; }

      obs.forEach(o => { o.x -= speed; });

      obs.forEach(o => {
        const top = { x: o.x, y: 0, w: 48, h: o.gapY };
        const bot = { x: o.x, y: o.gapY + o.gapH, w: 48, h: canvas.height - o.gapY - o.gapH };
        if (!o.passed && o.x + 48 < 90) { o.passed = true; score++; sfxClick(); scoreEl.textContent = score;
          if (score % 3 === 0) toast("PORSCHE 9-11", ["Tower unimpeded. It exhales in relief.", "+1 structure successfully not involved.", "Still airborne. Historians are taking notes."][(score / 3) % 3], "system");
        }
        if (hit(plane, top) || hit(plane, bot)) crash();
      });
      obs = obs.filter(o => o.x > -60);
    }

    draw(frame, area, ctx, canvas, plane, obs, dead, playing);
    raf = requestAnimationFrame(loop);
  };

  function hit(p, r) {
    const px = 90, py = p.y;
    return px + p.r > r.x && px - p.r < r.x + r.w && py + p.r > r.y && py - p.r < r.y + r.h;
  }

  function crash() {
    if (dead) return;
    dead = true;
    sfxError();
    state.flappyBest = Math.max(state.flappyBest || 0, score);
    bestEl.textContent = state.flappyBest;
    over.classList.remove("hidden");
    over.querySelector("#flappyScoreEnd").textContent = score;
    act();
    state.successful++;
    toast("PORSCHE 9-11", CRASH_QUOTES[Math.floor(Math.random() * CRASH_QUOTES.length)], "rage");
  }

  raf = requestAnimationFrame(loop);
}

function draw(frame, area, ctx, canvas, plane, obs, dead, playing) {
  // dusk sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#0b1020");
  sky.addColorStop(0.7, "#1a1430");
  sky.addColorStop(1, "#3a1e33");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // distant city silhouette
  ctx.fillStyle = "#14101f";
  for (let i = 0; i < 7; i++) {
    const bx = (i * 97 - frame * 0.4) % (canvas.width + 120) - 60;
    const bh = 30 + (i % 3) * 26;
    ctx.fillRect(bx, canvas.height - 8 - bh, 46, bh);
  }

  // parallax clouds (they drift more slowly than towers)
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  for (let i = 0; i < 5; i++) {
    const cx = (i * 173 - frame * 0.6) % (canvas.width + 160) - 80;
    const cy = 40 + (i % 3) * 55;
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.arc(cx + 15, cy + 4, 11, 0, 7); ctx.arc(cx - 15, cy + 4, 10, 0, 7); ctx.fill();
  }

  // twin towers
  obs.forEach(o => {
    const topH = o.gapY, botY = o.gapY + o.gapH;
    drawTower(ctx, o.x, 0, topH, true, frame);
    drawTower(ctx, o.x, botY, canvas.height - botY, false, frame);
  });

  // ground strip
  ctx.fillStyle = "#1c1c2a";
  roundRect(ctx, 0, canvas.height - 8, canvas.width, 8, 0); ctx.fill();
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(0, canvas.height - 8, 90, 2);
  ctx.fillRect(canvas.width - 90, canvas.height - 8, 90, 2);

  // plane (side view)
  drawPlane(ctx, plane, frame, playing, dead);

  if (dead) {
    const scale = (frame % 30) / 30;
    ctx.fillStyle = `rgba(255,150,40,${1 - scale})`;
    ctx.beginPath(); ctx.arc(90, plane.y, 20 + scale * 55, 0, 7); ctx.fill();
    ctx.font = "24px sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.fillText("TARGET OBTAINED ✈️", 90, plane.y - 42);
  }

  ctx.font = "16px monospace"; ctx.fillStyle = "#ffd166"; ctx.textAlign = "left";
  ctx.fillText("FLT 911 · NONSTOP · INBOUND", 8, 22);
}

function scoreFromObs(obs) { return obs.reduce((n, o) => n + (o.passed ? 1 : 0), 0); }

function drawTower(ctx, x, y, h, hanging, frame) {
  const w = 52;
  const roofY = hanging ? y + h : y;
  const bodyGrad = ctx.createLinearGradient(x, 0, x + w, 0);
  bodyGrad.addColorStop(0, "#2b2f45");
  bodyGrad.addColorStop(0.35, "#454b6b");
  bodyGrad.addColorStop(1, "#232741");
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(x, y, w, h);

  // cap on the side facing the plane (the "roof" edge of the obstacle)
  ctx.fillStyle = "#5a6189";
  if (hanging) {
    roundRect(ctx, x - 3, y + h - 8, w + 6, 8, 4); ctx.fill();
  } else {
    roundRect(ctx, x - 3, y, w + 6, 8, 4); ctx.fill();
  }

  // antenna (tall buildings have one)
  if (hanging) {
    ctx.fillStyle = "#8a90b5";
    ctx.fillRect(x + w / 2 - 1, y + h - 26, 2, 15);
    ctx.fillStyle = "#ff625c";
    ctx.fillRect(x + w / 2 - 2, y + h - 28, 4, 4);
    const blink = (frame % 40) < 20;
    ctx.fillStyle = blink ? "#ff625c" : "#7a2b28";
    ctx.fillRect(x + w / 2 - 1, y + h - 28, 3, 3);
  } else {
    ctx.fillStyle = "#8a90b5";
    ctx.fillRect(x + w / 2 - 1, y + 14, 2, 12);
    ctx.fillStyle = (frame % 40) < 20 ? "#ff625c" : "#7a2b28";
    ctx.fillRect(x + w / 2 - 1, y + 14, 3, 3);
  }

  // lit window grid (horizontally compressed so towers look real)
  for (let wy = y + 12; wy < y + h - 10; wy += 15) {
    for (let wx = x + 5; wx < x + w - 6; wx += 10) {
      const on = ((wx * 7 + wy * 13) % 5) !== 0;
      ctx.fillStyle = on ? (frame % 12 === 0 ? "#ffe08a" : "#ffd166") : "#151a2e";
      ctx.globalAlpha = on ? 0.85 : 1;
      ctx.fillRect(wx, wy, 5, 8);
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ff625c";
  ctx.fillRect(x + 4, hanging ? y + 14 : y + 15, 4, 4);
  ctx.fillRect(x + w - 8, hanging ? y + 14 : y + 15, 4, 4);
}

function drawPlane(ctx, plane, frame, playing, dead) {
  const py = plane.y;
  ctx.save();
  ctx.translate(90, py);
  const tilt = Math.min(Math.max(plane.vy / 12, -1), 1);
  ctx.rotate(tilt * 0.45);

  // tail fin
  ctx.fillStyle = "#3d4b63";
  ctx.beginPath();
  ctx.moveTo(-17, -2);
  ctx.lineTo(-24, -16);
  ctx.lineTo(-12, -14);
  ctx.closePath(); ctx.fill();
  // horizontal stabilizer
  ctx.fillStyle = "#e63c3c";
  ctx.beginPath();
  ctx.moveTo(-20, 1);
  ctx.lineTo(-14, 3);
  ctx.lineTo(-15, 8);
  ctx.lineTo(-21, 6);
  ctx.closePath(); ctx.fill();

  // fuselage
  const fg = ctx.createLinearGradient(0, -4, 0, 6);
  fg.addColorStop(0, "#ffffff");
  fg.addColorStop(1, "#ccd2de");
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(-17, -2);
  ctx.quadraticCurveTo(0, -6, 15, -1);
  ctx.quadraticCurveTo(19, 3, 15, 5);
  ctx.quadraticCurveTo(0, 8, -17, 4);
  ctx.closePath(); ctx.fill();

  // nose cowling + spinner
  ctx.fillStyle = "#e63c3c";
  ctx.beginPath(); ctx.arc(16, 2, 4, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffd166";
  ctx.beginPath(); ctx.arc(18.5, 2, 1.6, 0, 7); ctx.fill();

  // windshield
  ctx.fillStyle = "#5cc8ff";
  ctx.beginPath();
  ctx.moveTo(10, -3);
  ctx.lineTo(14, -1);
  ctx.lineTo(11, 1);
  ctx.lineTo(8, 1);
  ctx.closePath(); ctx.fill();

  // main wing (side view, drawn mostly above fuselage)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(8, -1);
  ctx.lineTo(7, -13);
  ctx.lineTo(-3, -10);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#3d4b63";
  ctx.lineWidth = 1;
  ctx.stroke();

  // wheel poking below
  ctx.fillStyle = "#2b2f45";
  ctx.beginPath(); ctx.arc(-2, 6, 2.5, 0, 7); ctx.fill();
  ctx.strokeStyle = "#565d7d"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-2, 3.5); ctx.lineTo(-2, 4.8); ctx.stroke();

  // propeller (spins)
  if (!dead) {
    const spins = playing ? 9 : 1;
    const ang = (frame / 3) * spins;
    ctx.save();
    ctx.translate(20, 2);
    ctx.rotate(ang);
    ctx.fillStyle = "rgba(230,60,60,0.85)";
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 2, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, 7); ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}