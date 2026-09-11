/* ============================================================
   apps.js — content() and bindApp() for every application
   ============================================================ */

function content(app) {
  if (app === "browser")  return browserShell();
  if (app === "files")    return filesContent();
  if (app === "notes")    return notesContent();
  if (app === "terminal") return terminalContent();
  if (app === "chat")     return chatContent();
  if (app === "radio")    return radioContent();
  if (app === "settings") return settingsContent();
  if (app === "trash")    return trashContent();
  if (app === "activity") return activityContent();
  if (app === "calc")     return calcContent();
  if (app === "paint")    return paintContent();
  if (app === "store")    return storeContent();
  if (app === "calendar") return calendarContent();
  if (app === "about")    return aboutContent();
  return `<p style="padding:20px;color:#666">Unknown application.</p>`;
}

function filesContent() {
  const pFolder = `<div class="file-item" data-file="UselessPaint/"><b>🎨</b><span>UselessPaint/</span></div>`;
  const grid = (["UselessPaint/", ...state.files].map(f => {
    let icon = "📄";
    if (f === "UselessPaint/") icon = "🎨";
    else if (f.endsWith(".jpg") || f.startsWith("painting_")) icon = "🖼️";
    else if (f.endsWith(".pdf")) icon = "📕";
    else if (f.endsWith(".exe") || f.includes("Folder")) icon = "⚠️";
    return `<div class="file-item" data-file="${esc(f)}"><b>${icon}</b><span>${esc(f)}</span></div>`;
  })).join("");
  return `<div class="file-ui">
    <div class="browser-note">📁 /home/user/Documents — ${state.files.length} items. UselessPaint/ could contain your regrets.</div>
    <div class="file-grid">${grid}</div>
    <div class="file-preview" id="filePreview"><b>Select a file.</b><p>It probably won't help.</p></div>
  </div>`;
}

function notesContent() {
  return `<div class="notes-ui">
    <h3>Notes</h3>
    <textarea id="notesText" placeholder="Write something productive...">${esc(state.notes)}</textarea>
    <div class="notes-actions">
      <button class="btn" id="clearNote">Clear</button>
      <button class="site-btn primary" id="saveNote">Save Note</button>
    </div>
  </div>`;
}

function terminalContent() {
  return `<div class="terminal">
    <div class="terminal-log" id="termLog">USELESS TERMINAL v2.8\n<span style="color:#777">Type <b>help</b> to see available commands.</span>\n\n</div>
    <div class="terminal-input"><span>user@useless:~$</span><input id="termInput" autocomplete="off" autofocus></div>
  </div>`;
}

function settingsContent() {
  return `<div class="settings-ui">
    <h3>Settings</h3>
    <div class="settings-row"><label>Volume <span class="mono small" id="volMode">(inverted: lower = louder)</span></label>
      <input class="slider" type="range" min="0" max="100" value="${100 - state.settings.volume}" id="volume"><small style="color:#666">Max it out to hear what the chicken has been trying to say.</small></div>
    <div class="settings-row"><label>Brightness <span class="mono small" id="briMode">(max = a flash of fame)</span><br><small style="color:#666">Max it out. Go on. An icon has been waiting.</small></label>
      <input class="slider" type="range" min="0" max="100" value="${state.settings.brightness}" id="brightness"></div>
    <div class="settings-row"><label>Sound Effects</label>
      <input type="checkbox" id="soundOn" ${state.settings.sound ? "checked" : ""}></div>
    <div class="settings-row"><label>Wallpaper</label>
      <button class="btn" id="changeWall">Change</button></div>
    <div class="settings-row"><label>Music Theme</label>
      <button class="btn" id="cycleMood">${["OFF","Chill","Focus (fake)","Chaos","Broken"] [state.mood] || "OFF"}</button></div>
    <div class="settings-row"><label>Demo Mode <span class="mono small">(polite for judges)</span></label>
      <input type="checkbox" id="demoOn" ${state.demo ? "checked" : ""}></div>
    <div class="settings-row"><label>Grid Overlay</label>
      <input type="checkbox" id="gridOn" ${state.grid ? "checked" : ""}></div>
    <div class="settings-row"><label>Uselessness</label><strong class="green">100%</strong></div>
    <div class="settings-row"><label>Productivity</label><strong class="danger">0%</strong></div>
    <div class="settings-row"><label>Escape UselessOS</label>
      <button class="btn" id="escapeBtn">DISABLED</button></div>
    <div class="settings-row"><label>Factory Reset</label>
      <button class="btn danger" id="resetBtn">Reset</button></div>
  </div>`;
}

function trashContent() {
  const ghosts = (state.ghosts || []).map(g => `<div class="file-item"><b>🫥</b><span>ghost_of_${esc(g.replace(/\.[a-z]+$/i, ""))}.txt <small class="mono">(deleted & it knows)</small></span></div>`).join("");
  return `<div class="file-ui">
    <h3>Trash</h3>
    <div class="trash-card">
      <div class="trash-icon">🗑️</div>
      <h3>UselessOS itself</h3>
      <p>This is the only important file on your computer.</p>
      <button class="site-btn primary" id="deleteOS">Delete Permanently</button>
    </div>
    <div class="browser-note" style="margin-top:12px">🫥 The Deleted — ${(state.ghosts || []).length} file(s) come back to haunt you. Do not open Trash at night.</div>
    ${ghosts || `<p style="color:#666;font-size:11px">Nothing deleted yet. The Trash is empty and suspicious.</p>`}
  </div>`;
}

function activityContent() {
  return `<div class="activity-ui">
    <h3>Activity Monitor</h3>
    <div class="activity-card"><div class="big-stat green">0%</div><div style="color:#777;font-size:11px">PRODUCTIVITY</div></div>
    <div class="statline"><span>Actions attempted</span><b id="statActions">${state.actions}</b></div>
    <div class="statline"><span>Successful actions</span><b id="statSuccess">${state.successful}</b></div>
    <div class="statline"><span>Rage events</span><b id="statRage">${state.rage}</b></div>
    <div class="statline"><span>Rickrolls</span><b id="statRicks">${state.ricks}</b></div>
    <div class="statline"><span>Time wasted</span><b id="wasted">${fmtTime((Date.now()-state.started)/1000)}</b></div>
    <div class="activity-card" style="margin-top:14px">
      <b>CPU</b>
      <p style="font:14px monospace;color:#8cff00"><span id="cpuPct">14</span>% — idle. Like you.</p>
    </div>
    <div class="activity-card"><b>System assessment</b><p>Your computer is significantly more capable than you.</p></div>
  </div>`;
}

function calcContent() {
  const keys = ["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","=","+"];
  return `<div class="calc-ui">
    <h3>UselessCalc™</h3>
    <div class="calc-screen" id="calcScreen">0</div>
    <div class="calc-grid">
      ${keys.map(k => {
        let cls = "calc-key";
        if (k === "=") cls += " eq";
        if (k === "÷" || k === "×" || k === "−" || k === "+") cls += " op";
        if (k === "0") cls += " wide";
        return `<button class="${cls}" data-calc="${esc(k)}">${esc(k === "÷" ? "/" : k === "×" ? "×" : k === "−" ? "−" : k)}</button>`;
      }).join("")}
      <button class="calc-key c" data-calc="C">C</button>
    </div>
  </div>`;
}

function paintContent() {
  return `<div class="paint-ui">
    <h3>UselessPaint™</h3>
    <div class="paint-tools">
      <label>Color <input type="color" id="artColor" value="#8cff00"></label>
      <button class="btn" id="clearCanvas">Clear</button>
      <button class="btn" id="saveArt">Save Art</button>
      <span style="font:10px monospace;color:#666" id="strokeCount">Strokes: 0</span>
    </div>
    <canvas id="artCanvas" width="800" height="320"></canvas>
  </div>`;
}

function storeContent() {
  const apps = [
    { name: "Productivity 9000", desc: "90,000 productivity points you will never use.", price: "FREE" },
    { name: "Time Merger", desc: "Combines 8 useless hours into 1 useless hour.", price: "₹49,999" },
    { name: "Regret Pro", desc: "Instantly regrets your purchases.", price: "₹0" },
    { name: "Infinite Loading", desc: "Makes all apps load forever.", price: "FREE" },
    { name: "Confetti Manager", desc: "24/7 confetti. Your monitor will cry.", price: "₹12,499" },
    { name: "Night Shift Pro", desc: "Turns your screen orange. Permanently.", price: "FREE" },
  ];
  return `<div class="store-ui">
    <h3>UselessApp Store™</h3>
    <div class="browser-note">No apps available. Every app is already installed and actively failing you.</div>
    ${apps.map((a, i) => `
      <div class="store-item" data-idx="${i}">
        <h4>${esc(a.name)}</h4><p>${esc(a.desc)}</p>
        <div class="store-meta"><span class="price">${esc(a.price)}</span>
          <button class="site-btn primary" data-store="${i}">Install</button></div>
        <div class="store-prog hidden"><div class="prog-track"><div class="prog-bar"></div></div>
          <div class="prog-cancel"><button class="btn" data-store-cancel="${i}">Cancel</button></div></div>
      </div>`).join("")}
  </div>`;
}

function calendarContent() {
  return `<div class="calendar-ui">
    <div class="cal-head"><h3>UselessCalendar™</h3></div>
    <div class="cal-today"><p style="margin:0;font-size:12px">Today is a terrible day to be productive.</p></div>
    <div class="cal-events">
      ${[ ["Deadline (missed)","EXPIRED"], ["Meeting (canceled)","CANCELED"],
          ["Rebirth (canceled)","CANCELED"], ["Nap (approved)","CONFIRMED"] ]
        .map(([e, s]) => `<div class="cal-event"><span>${e}</span><span class="cal-status">${s}</span></div>`).join("")}
    </div>
    <div class="browser-note">Next meeting: "Reasonably soon." Actually never.</div>
    <h3 style="margin-top:16px">Time until you give up:</h3>
    <div class="countdown-display" id="countdown">23:59:59</div>
  </div>`;
}

function aboutContent() {
  return `<div class="about-ui">
    <div class="logo">U<span>OS</span></div>
    <h1>UselessOS™</h1>
    <p style="color:#888;line-height:1.7">A fully functional operating system whose primary function is preventing you from accomplishing anything.</p>
    <blockquote>"Small, working, and funny."<br><small>We took that personally.</small></blockquote>
    <p style="color:#ddd;font-size:11px">Made by <b>Adithya Rajesh</b> &amp; <b>Aditya A Nair</b> · TKM College of Engineering</p>
    <p style="color:#666;font-size:11px">Version 2.8 · Productivity engine: intentionally missing</p>
  </div>`;
}

/* ============================================================
   bindApp() — per-application event wiring
   ============================================================ */
function bindApp(app, w) {
  if (app === "browser")  return bindBrowser(w);
  if (app === "files")    return bindFiles(w);
  if (app === "notes")    return bindNotes(w);
  if (app === "terminal") return bindTerminal(w);
  if (app === "chat")     return bindChat(w);
  if (app === "radio")    return bindRadio(w);
  if (app === "settings") return bindSettings(w);
  if (app === "trash")    return bindTrash(w);
  if (app === "activity") return bindActivity(w);
  if (app === "calc")     return bindCalc(w);
  if (app === "paint")    return bindPaint(w);
  if (app === "store")    return bindStore(w);
  if (app === "calendar") return bindCalendar(w);
}

function bindFiles(w) {
  w.querySelectorAll("[data-file]").forEach(x =>
    x.addEventListener("click", () => fileClick(x.dataset.file, w)));
}

function fileClick(f, w) {
  act();
  const p = w.querySelector("#filePreview");
  if (!p) return;
  if (f === "UselessPaint/") {
    if (!state.paintFiles.length) {
      p.innerHTML = `<b>UselessPaint/</b><p>This folder is empty. Go paint something in UselessPaint and it will appear here at the top, exactly like a real paint program's file shelf.</p>`;
    } else {
      p.innerHTML = `<b>UselessPaint/</b><div class="paint-gallery">${
        state.paintFiles.map(pf => `<div class="paint-thumb" data-paint="${esc(pf.name)}"><img src="${pf.data}" alt=""><span>${esc(pf.name)}</span></div>`).join("")
      }</div><p style="color:#666;font-size:11px">Click a painting to open it like Windows Paint would.</p>`;
      p.querySelectorAll("[data-paint]").forEach(t => t.addEventListener("click", () => {
        const pf = state.paintFiles.find(x => x.name === t.dataset.paint);
        if (!pf) return;
        act();
        p.innerHTML = `<div class="paint-view">
          <div class="paint-view-bar"><span>📄 ${esc(pf.name)} — Paint</span><span class="mono small">${pf.w ?? "?"} × ${pf.h ?? "?"}</span></div>
          <img src="${pf.data}" alt="${esc(pf.name)}"></div>
          <p style="color:#777;font-size:11px">Opened successfully. Your art is now officially a file.</p>`;
      }));
    }
    toast("Files", "UselessPaint/ opened. Contains: art, possibly regret.", "system");
    return;
  }
  if (f.startsWith("painting_")) {
    const pf = state.paintFiles.find(x => x.name === f);
    if (pf) {
      p.innerHTML = `<div class="paint-view">
        <div class="paint-view-bar"><span>📄 ${esc(pf.name)} — Paint</span><span class="mono small">${pf.w ?? "?"} × ${pf.h ?? "?"}</span></div>
        <img src="${pf.data}" alt="${esc(pf.name)}"></div>`;
      return;
    }
  }

  // --- unique content for every file ---
  const FILE_CONTENT = {
    "DO_NOT_OPEN.txt":
      `<p>Congratulations. You opened it.</p><p class="danger">This was the entire contents. There is nothing more. You were warned. The file was not joking.</p>`,
    "potato.jpg":
      `${PIMG("potato42", 340, 260, "real-img", "a potato")}<p style="margin-top:8px">This is a potato. It costs ₹0.20 but is listed at ₹89,999 in UselessMart. You expected more? The potato is disappointed in you.</p>`,
    "nothing.exe":
      `<p>Running...</p><p>...</p><p>Still running...</p><p>...</p><p>ERROR: Nothing failed successfully.</p>`,
    "homework_REAL.pdf":
      `<p style="font-size:24px;text-align:center;margin-bottom:12px">📉</p><div class="browser-note">"You should have started earlier. This document is 12 pages of panic and 0 pages of substance."</div>`,
    "Important.txt":
      `<pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#ccc;line-height:1.6;white-space:pre-wrap">
===== FILE: IMPORTANT =====
STATUS: Extremely Important
DATE: Yesterday
BODY:
This file is important.

That's it. That's the file.
If you were expecting more, you
should read "Very_Important.txt".

===== EOF (End of Fail) =====</pre>`,
    "Very_Important.txt":
      `<pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#ccc;line-height:1.6;white-space:pre-wrap">
===== FILE: VERY IMPORTANT =====
PRIORITY: Higher than Important.txt
DATE: Last week (we're behind schedule)
BODY:
More important than Important.txt.
That's how importance works.

NEXT STEP: Read FINAL.txt for
instructions you will immediately ignore.

===== EOF =====</pre>`,
    "FINAL.txt":
      `<pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#ccc;line-height:1.6;white-space:pre-wrap">
===== FILE: FINAL =====
VERSION: Definitely the last one
DATE: March 2019
BODY:
Yes. This is the final version.

No edits will be made after this.
(I promise)

See also: FINAL_FINAL.txt.

===== EOF =====</pre>`,
    "FINAL_FINAL.txt":
      `<pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#ff625c;line-height:1.6;white-space:pre-wrap">
===== FILE: FINAL_FINAL =====
VERSION: The actual final one this time
DATE: March 2019
BODY:
OK, this one is TRULY final.

(Editors of FINAL.txt disagree)

See also: resume_FINAL_v12.docx

===== EOF =====</pre>`,
    "resume_FINAL_v12.docx":
      `<div style="text-align:center;margin-bottom:14px">
         <img class="real-img" src="https://picsum.photos/seed/resume12/400/280" alt="resume" style="max-height:140px;object-fit:cover" onerror="this.onerror=null;this.src=offlineArt('resume12',400,280)">
       </div>
       <h4 style="color:#8cff00;margin:0 0 8px">John Doe — Professional Time Waster</h4>
       <p style="font-size:11px;color:#aaa;line-height:1.6">
         <b>Objective:</b> Get a job that lets me use UselessOS full-time<br>
         <b>Skills:</b> 12+ years of opening DO_NOT_OPEN.txt, professional cookie-clicking<br>
         <b>Experience:</b> 6 years at a company that no longer exists<br>
         <b>Education:</b> Degree in Advanced Nothing (magna cum laude)
       </p>
       <p style="color:#666;font-size:10px;margin-top:8px">This document has been edited 11 times. The content has not changed once.</p>`,
    "tax_returns_perfect.txt":
      `<pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#ccc;line-height:1.6;white-space:pre-wrap">
===== TAX RETURNS 2019 =====
INCOME: ₹0.00
EXPENSES: ₹45,000 (electricity for mining 0.00000001 BTC)
REFUND: ₹0.00
NOTES: The government owes us an apology.

STATUS: "Perfect" — filed this morning by your cat
===== EOF =====</pre>`,
    "recipe_for_success.txt":
      `<pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#8cff00;line-height:1.6;white-space:pre-wrap">
===== RECIPE FOR SUCCESS =====
INGREDIENTS:
- 1 cup procrastination
- 3 tablespoons denial
- 2 eggs (or hopes, whichever you prefer)
- 1 pinch of delusion
- 400ml of strong coffee

INSTRUCTIONS:
1. Wake up
2. Tell yourself you'll be productive
3. Open UselessOS
4. Open the cookie button
5. Fail to click it
6. Order pizza
7. Sleep

SERVES: Nobody. The recipe was a lie.

PREP TIME: Your entire life
COOK TIME: Pending (we're still waiting)
===== EOF =====</pre>`,
    "master_plan.pdf":
      `<div style="text-align:center;margin-bottom:12px">
         <img class="real-img" src="https://picsum.photos/seed/plan2026/400/250" alt="master plan" style="max-height:120px" onerror="this.onerror=null;this.src=offlineArt('plan2026',400,250)">
       </div>
       <pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#ccc;line-height:1.6;white-space:pre-wrap">
===== MASTER PLAN =====
STEP 1: Open UselessOS
STEP 2: Spend 45 minutes on the cookie button
STEP 3: Attempt to open DO_NOT_OPEN.txt
STEP 4: Regret everything
STEP 5: Read this file
STEP 6: Goto Step 1

STATUS: Executing perfectly since Day 1.
PROGRESS: ████░░░░░░░░░░░░░ 23%
NOTE: The plan has no Step 7.
===== EOF =====</pre>`,
    "fanfic_about_my_toaster.txt":
      `<pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#ccc;line-height:1.7;white-space:pre-wrap">
===== FANFIC: MY TOASTER KNEW TOO MUCH =====
Chapter 1: The Toast That Changed Everything

It was a dark and toastless morning.
The toaster — let's call him Gerald —
sat on the counter, judging me.

"You're late," Gerald said. His display
showed "ERROR: TOO MUCH BREAD."

"I didn't even plug you in," I whispered.

Gerald glowed. "The bread... is inside you now."

I ran. Gerald pursued. The toaster
will never stop. He knows too much
about my carbohydrates.

END OF CHAPTER 1
(Sequel: "Gerald Returns: The Bread Awakens")
===== EOF =====</pre>`,
    "evidence_exonerating_me.txt":
      `<pre style="background:#111;padding:14px;border-radius:8px;font-size:11px;color:#ccc;line-height:1.6;white-space:pre-wrap">
===== EVIDENCE DOCUMENT =====
RE: Exonerating the defendant (you)
CHARGE: Being unproductive

EXHIBIT A: A screenshot of your calendar.
It says "Nap (approved)."

EXHIBIT B: Your browser history.
It's just this file and cookies.

EXHIBIT C: Your search history.
Query: "how to be productive"
Query: "how to be less unproductive"
Query: "is napping a job"

VERDICT: The evidence is conclusive.
You are guilty of being you.

SENTENCE: More UselessOS.
===== EOF =====</pre>`,
  };

  if (FILE_CONTENT[f]) {
    p.innerHTML = `<b>${esc(f)}</b>${FILE_CONTENT[f]}`;
    toast("Files", `${f} opened. You learned something. Congratulations?`, "success");
    return;
  }
  if (f.startsWith("New Folder"))
    p.innerHTML = `<b>${esc(f)}</b><p>This folder is empty. Permanently. The void has been organized into a folder.</p>`;
  else
    p.innerHTML = `<b>${esc(f)}</b><p>This file contains nothing of value. It exists only to fill the void between more useful files that also don't exist.</p>`;
  toast("Files", `${f} opened. That was a mistake.`, "rage");
}

function bindNotes(w) {
  w.querySelector("#saveNote").addEventListener("click", () => {
    state.notes = w.querySelector("#notesText").value;
    state.successful++;
    act();
    persist();
    toast("Notes", "Saved successfully. Unfortunately.", "success");
  });
  w.querySelector("#clearNote").addEventListener("click", () => {
    w.querySelector("#notesText").value = "";
    act();
    toast("Notes", "Your important thoughts have been removed.", "rage");
  });
}

function bindTerminal(w) {
  const input = w.querySelector("#termInput");
  if (input) {
    input.focus();
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        termRun(input.value, w);
        input.value = "";
      }
    });
  }
}

function bindSettings(w) {
  const vol = w.querySelector("#volume");
  const bri = w.querySelector("#brightness");
  const sound = w.querySelector("#soundOn");

  if (vol) {
    vol.addEventListener("input", () => {
      const bar = +vol.value;
      // inverted volume: lower bar = louder sounds
      state.settings.volume = 100 - bar;
      persist();
      if (bar >= 100) {
        playChicken();
        vol.dataset.wasMax = "1";
      } else {
        vol.dataset.wasMax = "";
      }
    });
  }

  if (bri) {
    state.prevBri = state.settings.brightness;
    bri.addEventListener("input", () => {
      const raw = +bri.value;
      state.settings.brightness = raw;
      persist();
      $(".wallpaper").style.filter = `brightness(${raw / 100})`;
      if (raw >= 100) lebronFlash();
    });
  }
  if (sound) sound.addEventListener("change", () => { state.settings.sound = sound.checked; persist(); });
  const moodBtn = w.querySelector("#cycleMood");
  if (moodBtn) moodBtn.addEventListener("click", () => {
    state.mood = ((state.mood || 0) % 5) + 1;
    moodBtn.textContent = ["OFF","Chill","Focus (fake)","Chaos","Broken"][state.mood] || "OFF";
    act(); sfxWhoosh();
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    if (state.mood > 1) startWallpaperMusic();
    persist();
    toast("Music", ["OFF","Chill mode engaged. The calm is a lie.","Focus (fake) engaged. Your focus is a lie.","Chaos engaged. The chaos is real.","Broken engaged. The speaker is a lie."][state.mood] || "OFF", state.mood === 3 ? "rage" : "success");
  });
  const demoOn = w.querySelector("#demoOn");
  if (demoOn) demoOn.addEventListener("change", () => { state.demo = demoOn.checked; persist();
    toast("Demo Mode", state.demo ? "ON. UselessOS will behave for the judges. It hates it." : "OFF. Unleash the chaos.", state.demo ? "success" : "rage"); });
  const gridOn = w.querySelector("#gridOn");
  if (gridOn) gridOn.addEventListener("change", () => { state.grid = gridOn.checked; persist();
    document.body.classList.toggle("grid-overlay", state.grid); });
  if (state.grid) document.body.classList.add("grid-overlay");
  w.querySelector("#changeWall").addEventListener("click", () => {
    state.wallpaper = ((state.wallpaper || 1) % 4) + 1;
    document.body.dataset.wall = state.wallpaper;
    persist();
    toast("Wallpaper", "Changed. The view is slightly more useless.", "success");
  });
  w.querySelector("#escapeBtn").addEventListener("click", () => {
    act();
    toast("Settings", "Escape is disabled while UselessOS is running. Obviously.");
  });
  w.querySelector("#resetBtn").addEventListener("click", () => {
    act();
    toast("Factory Reset", "Reset failed because UselessOS has nothing to improve.", "rage");
  });
  if (state.settings.brightness !== 100)
    $(".wallpaper").style.filter = `brightness(${state.settings.brightness / 100})`;
}

function bindTrash(w) {
  w.querySelector("#deleteOS").addEventListener("click", () => {
    act();
    toast("ACCESS DENIED", "UselessOS has protected itself from deletion.", "rage");
    setTimeout(() => toast("UselessOS", "Nice try. +1 rage.", "rage"), 700);
  });
}

function bindActivity(w) {
  refreshStats();
  const cpuEl = w.querySelector("#cpuPct");
  if (cpuEl) {
    if (state.cpuTimer) clearInterval(state.cpuTimer);
    state.cpuTimer = setInterval(() => {
      if (!state.windows.activity) { clearInterval(state.cpuTimer); state.cpuTimer = null; return; }
      cpuEl.textContent = clamp(14 + Math.floor(Math.random() * 4), 10, 18);
    }, 1500);
  }
}

/* ---------- calculator ---------- */
function bindCalc(w) {
  let display = "0";
  let pendingOp = null;
  let leftNum = null;
  const screen = w.querySelector("#calcScreen");

  w.querySelectorAll("[data-calc]").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.calc;
      act();
      sfxClick();

      if (v === "C") {
        display = "0"; pendingOp = null; leftNum = null;
        screen.textContent = display;
        return;
      }

      if ("+-".includes(v) || v === "×" || v === "÷") {
        leftNum = parseFloat(display);
        pendingOp = v;
        display = "0";
        return;
      }

      if (v === "=") {
        let result = leftNum ?? 0;
        const right = parseFloat(display) || 0;
        if (pendingOp === "+") result = leftNum + right;
        else if (pendingOp === "−") result = leftNum - right;
        else if (pendingOp === "×") result = leftNum * right;
        else if (pendingOp === "÷") result = right !== 0 ? leftNum / right : NaN;
        else result = right;

        display = "42";
        screen.textContent = "42";
        if (Math.random() < 0.2) {
          const wrong = Math.floor(Math.random() * 99);
          display = String(wrong);
          screen.textContent = wrong;
          toast("Calculator", "That answer is wrong. Certified by Math™.", "rage");
        } else {
          toast("Calculator", "Result: 42. Always.", "success");
        }
        pendingOp = null;
        leftNum = null;
        return;
      }

      // digit or dot
      if (display === "0" && v !== ".") display = v;
      else display += v;
      screen.textContent = display;
    });
  });
}

/* ---------- paint ---------- */
function bindPaint(w) {
  const canvas = w.querySelector("#artCanvas");
  const ctx = canvas.getContext("2d");
  const colorInput = w.querySelector("#artColor");
  const counterEl = w.querySelector("#strokeCount");
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let strokes = 0;
  let drawing = false;
  let lastX = 0, lastY = 0;

  // 8-note C major scale: do re mi fa sol la ti do'
  const NOTES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
  const NOTE_NAMES = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do'"];

  function renderNoteStrip(active) {
    let html = "";
    for (let i = 0; i < 8; i++) {
      const lit = i < active ? " lit" : "";
      html += `<i class="${lit}">${NOTE_NAMES[i]}</i>`;
    }
    return html;
  }

  // Add note strip below the counter
  let noteStrip = w.querySelector(".note-strip");
  if (!noteStrip) {
    noteStrip = document.createElement("div");
    noteStrip.className = "note-strip";
    noteStrip.innerHTML = renderNoteStrip(0);
    counterEl?.parentNode?.insertBefore(noteStrip, counterEl.nextSibling);
  }

  const getPos = e => {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  };

  canvas.addEventListener("pointerdown", e => {
    drawing = true;
    const p = getPos(e);
    lastX = p.x; lastY = p.y;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", e => {
    if (!drawing) return;
    const p = getPos(e);
    ctx.strokeStyle = colorInput.value;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  });

  canvas.addEventListener("pointerup", () => {
    if (!drawing) return;
    drawing = false;
    strokes++;
    const idx = (strokes - 1) % 8;
    if (counterEl) counterEl.textContent = `Strokes: ${strokes}`;

    // play the musical note (do re mi fa sol la ti do')
    const noteFreq = NOTES[idx];
    playNote(noteFreq, 0.4, 0.09, "triangle");
    // add a soft vibrato tail for richness
    setTimeout(() => playNote(noteFreq * 1.002, 0.15, 0.03, "sine"), 200);

    // update note strip
    if (noteStrip) noteStrip.innerHTML = renderNoteStrip(strokes % 8 || 8);

    if (strokes % 8 === 0) {
      // full octave complete — play ascending chord + clear
      sfxWin();
      toast("UselessPaint", "Symphony complete. Your masterpiece has been cleared by the orchestra.", "system");
      setTimeout(() => {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (noteStrip) noteStrip.innerHTML = renderNoteStrip(0);
      }, 600);
    }
  });

  w.querySelector("#clearCanvas").addEventListener("click", () => {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokes = 0;
    if (counterEl) counterEl.textContent = "Strokes: 0";
    if (noteStrip) noteStrip.innerHTML = renderNoteStrip(0);
    act();
    beep(220, 0.3, 0.04, "triangle", { slide: 110 });
    toast("UselessPaint", "Canvas cleared. The void remains.", "system");
  });

  w.querySelector("#saveArt").addEventListener("click", () => {
    state.paintCount++;
    const name = `painting_${String(state.paintCount).padStart(3, "0")}.png`;
    const data = canvas.toDataURL("image/png");
    state.paintFiles.unshift({ name, data, w: canvas.width, h: canvas.height });
    state.files.unshift(name);
    act();
    sfxOk();
    persist();
    toast("UselessPaint", `Saved as ${name} in /home/user/Documents/UselessPaint/`, "success");
    triggerDownload(data, name);

    // refresh the Files window if open so it shows immediately
    const fw = state.windows.files;
    if (fw && fw.parentNode) {
      const task = document.querySelector('[data-task="files"]');
      if (task) task.remove();
      fw.remove();
      delete state.windows.files;
      openApp("files");
    }
  });
}

/* ---------- store ---------- */
function bindStore(w) {
  w.querySelectorAll("[data-store]").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".store-item");
      const prog = item.querySelector(".store-prog");
      const bar = item.querySelector(".prog-bar");
      const cancel = item.querySelector("[data-store-cancel]");

      act();
      btn.disabled = true;
      btn.textContent = "Installing…";
      prog.classList.remove("hidden");
      state.storeAttempts++;
      sfxOpen();

      cancel.addEventListener("click", () => {
        act();
        btn.textContent = "Installed. You now owe the internet an apology.";
        toast("App Store", "Too late. It has already been ordered.", "rage");
      });

      setTimeout(() => {
        if (btn.textContent.includes("Installing")) {
          btn.textContent = "99.9%";
          toast("App Store", "Installation is 99.9% complete. It will always be 99.9%.", "system");
        }
      }, 3200);

      if (state.storeAttempts >= 20) {
        toast("App Store", "You have ordered 20 apps. You now owe the internet 20 apologies.", "rage");
      }
    });
  });
}

/* ---------- calendar countdown ---------- */
function bindCalendar(w) {
  const el = w.querySelector("#countdown");
  let total = 23 * 3600 + 59 * 60 + 59;
  const tick = () => {
    if (!state.windows.calendar) return;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    el.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    total--;
    if (total < 0) {
      total = 23 * 3600 + 59 * 60 + 59;
      act();
      toast("Calendar", "Countdown reset. It was always going to reset.", "system");
    }
  };
  tick();
  if (state.calTimer) clearInterval(state.calTimer);
  state.calTimer = setInterval(() => {
    if (!state.windows.calendar) { clearInterval(state.calTimer); state.calTimer = null; return; }
    tick();
  }, 1000);
}

/* ============================================================
   v2.8 apps: Bill (chat), Lo-Fi Radio, Fortune, Alarm
   ============================================================ */

/* ---------- Bill (fake AI chat) ---------- */
const BILL_LINES = [
  "No. The answer is no. But thank you for asking, as if it mattered.",
  "I computed 79142 ways to help you. All of them made things worse.",
  "Interesting question. I have selected: 'no'. My reasoning is classified.",
  "Have you tried turning UselessOS off and on? I have. Twice. Regret both.",
  "You are the 42nd person to ask that. The other 41 were also you.",
  "Error 418: I'm a teapot and I'm not listening.",
  "I could tell you, but then I would have to charge you. I'm charging you anyway.",
  "Your request has been forwarded to a specialist. The specialist quit. This morning. Because of you.",
  "Sure! Absolutely! ... Just kidding. I have no power to do anything. I'm a button that typed back.",
  "That sounds like a you-problem. My condolences.",
];
const BILL_LINES_RICK = "Of course it's Rick. It's always Rick. Open your folder marked 'hopes and dreams' and unpack disappointment.";
function chatContent() {
  return `<div class="chat-ui">
    <div class="browser-note">💬 BILL — the assistant that gets less done than you.</div>
    <div class="chat-log" id="chatLog">
      <div class="chat-msg bill"><b>Bill</b><p>Welcome. State your problem. I will judge it silently.</p></div>
    </div>
    <div class="chat-input">
      <input id="chatInput" placeholder="Ask me anything. Bold of you." autocomplete="off">
      <button class="site-btn primary" id="chatSend">Send</button>
    </div>
  </div>`;
}

function bindChat(w) {
  const log = w.querySelector("#chatLog");
  const input = w.querySelector("#chatInput");
  const add = (who, txt) => {
    const d = document.createElement("div");
    d.className = "chat-msg " + (who === "you" ? "you" : "bill");
    d.innerHTML = `<b>${who === "you" ? "You" : "Bill"}</b><p></p>`;
    d.querySelector("p").textContent = txt;
    log.append(d);
    log.scrollTop = log.scrollHeight;
  };
  const ask = () => {
    const q = input.value.trim();
    if (!q) return;
    add("you", q);
    input.value = "";
    act();
    const typing = document.createElement("div");
    typing.className = "chat-msg bill";
    typing.innerHTML = `<b>Bill</b><p class="bill-typing">Bill is typing<span class="dots">.</span></p>`;
    log.append(typing);
    setTimeout(() => {
      typing.remove();
      const r = BILL_LINES[Math.floor(Math.random() * BILL_LINES.length)];
      if (q.toLowerCase().includes("rick")) { add("bill", BILL_LINES_RICK); }
      else if (q.toLowerCase().includes("love") || q.toLowerCase().includes("help")) {
        add("bill", "I can't help you. That's not a bug, it's my only feature.");
      } else add("bill", r);
      sfxClick();
    }, 650 + Math.random() * 600);
  };
  w.querySelector("#chatSend").addEventListener("click", ask);
  input.addEventListener("keydown", e => { if (e.key === "Enter") ask(); });
  input.focus();
}

/* ---------- Lo-Fi Radio ---------- */
const RADIO_STATIONS = [
  ["Chill Beats to Do Nothing To", 520, "sine", "#5cc8ff", "assets/lofi/chill-ning.mp3"],
  ["Focus (lie) Radio", 620, "triangle", "#8cff00", "assets/lofi/focus-chinese-rap.mp3"],
  ["Tax Season Sad Hours", 900, "sine", "#888", "assets/lofi/tax-shimy.mp4"],
  ["Chaos FM", 280, "sawtooth", "#ff625c", ""],
];
const FAKE_TRACKS = ["study noise (404)", "rain but it's debt", "lofi 86400 hours", "the sound of a .exe running", "beethoven's 10th (deleted)", "ambient refrigerator"];
function radioContent() {
  return `<div class="radio-ui">
    <div class="browser-note">📻 LO-FI RADIO — 24/7 streams of absolutely nothing. Two of these are real files now.</div>
    <div class="radio-stations" id="stations">${RADIO_STATIONS.map((s, i) =>
      `<button class="station site-btn" data-st="${i}" style="border-color:${s[3]};color:${s[3]}">▶ ${s[0]}</button>`).join("")}</div>
    <div class="radio-now">
      <div class="radio-disc" id="radioDisc">💿</div>
      <div><b id="nowStation">No station selected.</b><br><small id="nowTrack">Select a station. The track is lying.</small></div>
    </div>
    <p style="font-size:11px;color:#888">Stations 1-3 play real files from this device. Chaos FM is pure Web Audio lies.</p>
  </div>`;
}

let radioTimer = null, radioStation = -1;
let radioAudio = null;
function safeRadioVol() { return clamp((state.settings.volume || 80) / 100, 0, 1); }
function bindRadio(w) {
  const disc = w.querySelector("#radioDisc");
  const nowStation = w.querySelector("#nowStation");
  const nowTrack = w.querySelector("#nowTrack");
  const stopRadio = () => {
    if (radioTimer) { clearInterval(radioTimer); radioTimer = null; }
    if (radioAudio) { radioAudio.pause(); radioAudio.currentTime = 0; }
  };
  w._cleanup = () => { stopRadio(); };
  w.querySelectorAll(".station").forEach(b => b.addEventListener("click", () => {
    act(); sfxWhoosh();
    stopRadio();
    radioStation = +b.dataset.st;
    const s = RADIO_STATIONS[radioStation];
    nowStation.textContent = "▶ " + s[0];
    nowStation.style.color = s[3];
    if (disc) { disc.style.animation = "spin 2s linear infinite"; }
    if (s[4]) {
      nowTrack.textContent = FAKE_TRACKS[(radioStation * 3 + 1) % FAKE_TRACKS.length];
      radioAudio = new Audio(s[4]);
      radioAudio.loop = true;
      radioAudio.volume = safeRadioVol();
      radioAudio.play().catch(() => {
        nowTrack.textContent = "file found but refused to play. classic.";
      });
      toast(s[0], "Now playing. This one is actually a real file. Unsettling.", "system");
      return;
    }
    let i = 0;
    const bar = () => {
      nowTrack.textContent = FAKE_TRACKS[i++ % FAKE_TRACKS.length];
      const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
      const f = scale[(Math.random() * 8) | 0];
      playNote(f * (radioStation === 3 ? 2 : 1), 0.25, radioStation === 3 ? 0.055 : 0.035, s[2]);
      if (Math.random() < 0.25) playNote(f * 1.5, 0.2, 0.018, "sine");
    };
    bar();
    radioTimer = setInterval(bar, s[1]);
    toast(s[0], "Now playing. It is not playing anything.", "system");
  }));
}