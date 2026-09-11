/* ============================================================
   terminal.js — useless terminal commands
   ============================================================ */

const HELP = [
  "help        — show this list",
  "ls          — list useless files",
  "open [f]    — inspect a file",
  "cat [f]     — read a file's disappointment",
  "mkdir [name]  — create a folder of nothing",
  "touch [name]  — create a file of nothing",
  "rm [f]      — delete something (or get deleted)",
  "sudo [cmd]  — ask for permission you won't get",
  "escape      — attempt to escape UselessOS",
  "delete      — attempt to delete UselessOS",
  "exit        — attempt to leave",
  "productivity — try to enable productivity",
  "install [x] — install from the void",
  "uninstall   — uninstall your hope",
  "ssh [host]  — connect to a server that hates you",
  "matrix      — take the red pill, it's just green",
  "bomb        — disarm a bomb you deserve",
  "rick        — summon Rick Astley (again to stop)",
  "hack        — hack the mainframe",
  "neofetch    — system information",
  "cowsay [x]  — a cow says something",
  "ping        — ping an unreachable server",
  "wifi        — list available networks",
  "calc        — 42. It's always 42",
  "date        — current date (probably wrong)",
  "time        — time wasted",
  "weather     — the forecast you asked for",
  "ip          — your useless IP address",
  "whoami      — a philosophical question",
  "echo [x]    — echo your words into the void",
  "npm install [x] — install nothing, slowly, then fail",
  "whereis [x] — find things in /nope",
  "unzip [f]   — unzip 0 files, gain 1 mystery ZIP",
  "bringBack   — restore the potato (you monster)",
  "moon        — lunar phase (non-consultative)",
  "systeminfo  — prove that this never helps",
  "chrome      — open a better browser (impossible)",
  "crypto      — check your crypto",
  "clear       — clear terminal history",
];

function termRun(raw, w) {
  const log = w.querySelector("#termLog");
  if (!log) return;
  const parts = (raw || "").trim().split(/\s+/);
  const cmd = (parts[0] || "").toLowerCase();
  const arg = parts.slice(1).join(" ");
  const prompt = `<span style="color:#8cff00">user@useless:~$</span>`;
  let out = "";
  act();

  if (!cmd) { log.innerHTML += prompt + `\n\n`; log.scrollTop = log.scrollHeight; return; }

  if (cmd === "help")           out = HELP.map(x => "• " + x).join("\n");
  else if (cmd === "ls")        out = state.files.map((f, i) => `${i + 1}. ${f}`).join("\n") + "\nTotal: " + state.files.length + " files, all of them useless.";
  else if (cmd === "open" || cmd === "cat") {
    const target = arg || state.files[0];
    if (target.toLowerCase().includes("potato")) {
      out = "🥔\nIt's a potato.\nYou expected art or life advice. It's a potato.";
    } else {
      openApp("files");
      fileClick(target, state.windows.files || { querySelector: () => null });
      out = `Opening ${target}...\nIt was a bad idea.`;
    }
  }
  else if (cmd === "touch") {
    const name = arg || "untitled.txt";
    if (!state.files.includes(name)) state.files.push(name);
    persist();
    refreshFilesWindow();
    out = `Created ${name}. It contains nothing, exactly as planned.`;
  }
  else if (cmd === "mkdir") {
    if (arg) { newFolder(); out = `Created folder "${arg}" (published as "New Folder (${state.pendingFolder})"). It contains nothing.`; }
    else out = "mkdir: missing operand. A folder needs a name, even a fake one.";
  }
  else if (cmd === "rm") {
    const target = arg || "";
    const found = state.files.findIndex(f => f.toLowerCase() === target.toLowerCase());
    if (found >= 0) {
      const gone = state.files.splice(found, 1)[0];
      state.ghosts = state.ghosts || [];
      state.ghosts.unshift(gone);
      persist(); refreshFilesWindow();
      out = `rm: removed '${gone}'\nIt has been sent to the Trash dimension. It will haunt you as ghost_of_${gone.replace(/\.[a-z]+$/i, "")}.txt.`;
    }
    else if (target.toLowerCase().includes("potato")) {
      const i = state.files.findIndex(f => f.toLowerCase().includes("potato"));
      if (i >= 0) { state.files.splice(i, 1); persist(); refreshFilesWindow(); out = "rm: removed potato.jpg\nYou monster. The potato had a future in soup."; }
      else out = "rm: potato.jpg not found. It escaped before you arrived.";
    }
    else if (target === "-rf" || target === "-rf /" || target.includes("/")) out = "rm: permission denied.\nYou would like to delete the world. Not today.";
    else if (target) out = `rm: cannot remove '${target}': it is the only thing you have left.`;
    else out = "rm: missing operand. Try 'rm potato.jpg' and regret it.";
  }
  else if (cmd === "sudo") {
    if (!arg) out = "sudo: what exactly?\nPermission will be denied regardless.";
    else if (arg === "everything" || arg === "rm -rf /") out = "Permission denied.\nYou are not that guy, pal.";
    else out = "permission denied: " + esc(arg) + "\nThe castle has no king. The king was never born.";
  }
  else if (cmd === "npm") {
    if (parts[1] === "install") { npmInstall(w, arg); return; }
    else if (parts[1] === "run") out = "npm run dev\n> useless@1.0.0 dev\n> echo 'nothing'\n\n'Nothing' is currently running as expected.\nnpm error code 0 (there are no other codes)";
    else out = "npm: an unhandled error occurred (handling errors is your job).";
  }
  else if (cmd === "whereis") {
    const who = arg || "my_motivation";
    if (who.toLowerCase().includes("motivation")) out = "whereis my_motivation\nmy_motivation: /dev/null/motivation (deleted by guilt)";
    else out = `whereis ${esc(who)}\n${esc(who)}: it's in the place you'll look last. Usually /nope.`;
  }
  else if (cmd === "unzip" || cmd === "zip") {
    out = "unzip: extracting...\nExtracted 0 files. 1 new ZIP mysteriously appeared.\nThe zip crisis deepens. This is a known economical issue.";
  }
  else if (cmd === "bringBack" || cmd === "restore") {
    if (!state.files.some(f => f.toLowerCase().includes("potato"))) {
      state.files.unshift("potato.jpg"); persist(); refreshFilesWindow();
      out = "The potato has been restored.\nIt never forgives, but it is once again present. That's the arrangement.";
    } else out = "The potato is already here. It knows what you did.";
  }
  else if (cmd === "moon" || cmd === "horoscope") {
    const ph = ["full", "half, crying", "new (bankrupt)", "waxing angry", "blocked by clouds (busy)"][Math.floor(Math.random() * 5)];
    out = `Moon phase: ${ph}\nIt is not influencing your life. Your life influences your life. Poorly.`;
  }
  else if (cmd === "systeminfo") {
    out = "System info:\n- This exact command has run " + (state.actions + 1) + " times.\n- It has never helped.\n- Nothing else to disclose.";
  }
  else if (cmd === "escape")    out = "Attempting escape...\n[████████████████████] 100%\n\nEscape successful!\n\nJust kidding. This echo chamber has no exit.";
  else if (cmd === "delete")    out = "Deleting UselessOS...\n\nERROR: UselessOS has protected itself.\nYou have been reported for attempted deletion.";
  else if (cmd === "exit")      out = "You cannot exit. You were born here.\nThere is no 'logout'. There is only 'less'.";
  else if (cmd === "productivity") out = "Productivity module not installed.\nReason: nobody asked for that.\nInstalling productivity...\n[████████████████████] 100%\n\nUninstalled automatically. It never belonged on this machine.";
  else if (cmd === "install") {
    const pkg = arg || "nothing";
    if (pkg === "productivity") out = "apt: package 'productivity' is not available.\nDid you mean: 'procrastinate'? [Y/n] y\nProcrastinate is already installed and running all your apps.";
    else if (pkg === "brain" || pkg === "motivation") out = "apt: package '" + esc(pkg) + "' requires a payment of 2 focus years.\nPayment failed: focus not found.";
    else if (pkg === "rick") out = "apt: package 'rick' is a vandal. Installing it would give away the plot.\nTry: rick";
    else out = `apt: package '${esc(pkg)}' was installed.\nIt took 3 hours. It does nothing. This is the ecosystem.`;
  }
  else if (cmd === "uninstall") out = "Uninstalling hope...\nError in unpacking: hope was never installed.\nUninstalling realism...\nDone. It hurts, doesn't it.";
  else if (cmd === "ssh") {
    const host = arg || "127.0.0.1";
    out = `Connecting to ${esc(host)}...\nPermission denied (publickey, password, vibes).\nThe server does not trust you. The server does not trust anyone.`;
  }
  else if (cmd === "matrix") {
    let cols = "", R = Math.random;
    for (let c = 0; c < 14; c++) cols += String(Math.floor(R() * 10));
    out = "Entering the Matrix...\n" + Array.from({ length: 12 }, () =>
      Array.from({ length: 40 }, () => Math.random() < 0.35 ? "1" : Math.random() < 0.35 ? "0" : " ").join("")).join("\n") +
      "\nYou chose the green pill. There was no red pill. There is never a red pill.";
  }
  else if (cmd === "bomb") {
    out = "Bomb disarmed.\nWait.\nIt was a bomb made of procrastination.\nIt has been deferred. It will explode later. Much later. Probably never.";
  }
  else if (cmd === "rick")      { rickVideo(w); return; }
  else if (cmd === "hack")      out = "Mining bitcoin...\n\nTotal gained: 0.00000001 BTC.\nYou now owe ₹45,000 in electricity.\nMainframe hacked. It turns out it was a toaster.";
  else if (cmd === "neofetch")  out = nfoFetch();
  else if (cmd === "cowsay")    out = cowSay(arg || "I have nothing useful to say.");
  else if (cmd === "ping")      out = "PING useless.os (127.0.0.1): 56 data bytes\nRequest timeout for icmp_seq 1\nRequest timeout for icmp_seq 2\n\n--- useless.os ping statistics ---\n0 packets transmitted, 2 received, 100% packet loss.\nYou are more connected to nothing than anyone.";
  else if (cmd === "wifi")      out = "* SSID: Free_Public_WiFi_Do_Not_Trust  SIGNAL: ▪▫▫▫  SECURITY: none\n  SSID: Neighbor_WiFi_Pls_Stop_Standing_Outside  SIGNAL: ▪▪▪▫  SECURITY: WPA2\n  SSID: FBI Surveillance Van  SIGNAL: ▪▪▪▪  SECURITY: classified";
  else if (cmd === "calc")      out = "Result: 42. It's always 42.\nNo matter what you type, the universe has decided.";
  else if (cmd === "date")      out = new Date().toLocaleString() + "\nThis date is, per company policy, wrong.\nAnd even if it were right, what would you do with it?";
  else if (cmd === "time")      out = "Time wasted since boot: " + fmtTime((Date.now() - state.started) / 1000) + "\nTime you will never get back: all of it.";
  else if (cmd === "weather")   out = "Forecast: ⛅ confusing.\nYou asked for weather. Weather answered: GO TOUCH GRASS AND FIND IT YOURSELF.";
  else if (cmd === "ip")        out = "Your IP address: 127.0.0.1\nCongratulations. Your entire network is yourself.\nIPv6: ::(you). IPv9: coming never.";
  else if (cmd === "whoami")    out = "A confused user of UselessOS.\nWe are all confused users of UselessOS.";
  else if (cmd === "echo")      out = arg || "[void returns your words]";
  else if (cmd === "chrome" || cmd === "firefox" || cmd === "edge") {
    out = "Browser detected.\nResult: UselessOS browser is better.\nThis is not a joke. It's just that bad.";
  }
  else if (cmd === "crypto") {
    out = "Wallet: you\nBalance: 0.00000001 BTC (≈ ₹0.07)\nValue: went down since you asked.\nElectricity bill: ₹45,000. Profit: -₹44,999.93. This is your retirement plan.";
  }
  else if (cmd === "clear")     { log.innerHTML = ""; return; }
  else out = `command not found: ${esc(cmd)}\nTry "help". The help list is also useless; we know.`;

  log.innerHTML += prompt + ` ${esc(raw)}\n${esc(out)}\n\n`;
  log.scrollTop = log.scrollHeight;
}

function logHTML(w, html) {
  const log = w.querySelector("#termLog");
  if (!log) return;
  log.innerHTML += html;
  log.scrollTop = log.scrollHeight;
}

/* npm install — installs for exactly 4 seconds, then fails */
function npmInstall(w, arg) {
  const log = w.querySelector("#termLog");
  if (!log) return;
  const pkg = arg.replace(/^install\s*/, "") || "nothing";
  const line = document.createElement("div");
  line.innerHTML = `<span style="color:#8cff00">user@useless:~$</span> npm install ${esc(pkg)}
src.${esc(pkg) || "<void>"}: doing nothing at 14MB/s...<span class="npm-spin">⠋</span>`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0, n = 0;
  const spinner = setInterval(() => {
    i++; n++;
    const s = line.querySelector(".npm-spin");
    if (s) s.textContent = frames[i % frames.length];
    if (n % 6 === 0) line.innerHTML += ".";  // growing ellipsis of despair
    log.scrollTop = log.scrollHeight;
    if (i >= 40) {
      clearInterval(spinner);
      line.innerHTML += `
  > resolved nothing in 4.0s
  > audit: 0 packages expressed emotion
  npm error code ELIFECYCLE
  npm error ` + pkg + `@999.0.0 install: \`echo nothing && true\`
  npm error Exit status 0 (failure is structural)
  npm error This is a feature, not a bug. The entire ecosystem has agreed.`;
      sfxError();
      log.scrollTop = log.scrollHeight;
    }
  }, 100);
}

function rickVideo(w, forceStop) {
  const log = w.querySelector("#termLog");
  const closeBtn = w.querySelector("[data-close]");
  if (state.rickLock && state.rickLock.app === "terminal") {
    log.querySelectorAll(".term-rick").forEach(e => e.remove());
    state.rickLock = null;
    if (closeBtn) { closeBtn.disabled = false; closeBtn.textContent = "×"; }
    logHTML(w, `<span style="color:#8cff00">user@useless:~$</span> rick stop\nRick has left the building.\n0 emotional scars remain. 0 lies told.\n\n`);
    toast("Terminal", "Rick has left the building. You were brave.", "system");
    return;
  }
  state.ricks++;
  state.rickLock = { app: "terminal" };
  if (closeBtn) { closeBtn.disabled = true; closeBtn.textContent = "🔒"; }
  logHTML(w, `<span style="color:#8cff00">user@useless:~$</span> rick\nBuffering Rick Astley...\n[████████████████████] 100%\nHe is here. The close button has been retired. The law is the law.\n<div class="term-rick" id="termRick"></div>\n<span style="color:#888">(Type <b>rick</b> again to stop the suffering)</span>\n\n`);
  const host = w.querySelector("#termRick");
  if (host) embedTube(host, RICK_ID, { width: "100%", height: "170", ratio: "" });
  toast("TERMINAL", "Rick has entered the system. There is no escape.", "rage");
}

function refreshFilesWindow() {
  const fw = state.windows.files;
  if (fw && fw.parentNode) {
    const task = document.querySelector('[data-task="files"]');
    if (task) task.remove();
    fw.remove();
    delete state.windows.files;
    openApp("files");
  }
}

function nfoFetch() {
  return [
    "        ╔══════════╗",
    "        ║  U  O  S  ║",
    "        ╚══════════╝",
    `OS:     UselessOS 2.8`,
    `Host:   ${navigator.userAgent.split(") ")[0]})`,
    "Kernel: Useless 0.1.1-void",
    "Team:   Adithya Rajesh · Aditya A Nair (TKM, Kollam)",
    "Shell:  uselessh 1.0",
    `Uptime: ${fmtTime((Date.now() - state.started) / 1000)}`,
    `Actions: ${state.actions}`,
    `Rage:   ${state.rage}`,
    `Rickrolls: ${state.ricks}`,
    `Paintings: ${state.paintFiles.length}`,
    "CPU:    Useless Core™ (14% idle)",
    "Memory: ∞ MB / ∞ MB (none of it is useful)",
    "",
    "█████████████████  Uselessness: 100%",
  ].join("\n");
}

function cowSay(text) {
  const t = esc(text);
  const line = "-".repeat(Math.min(t.length + 2, 50));
  return [
    ` ${line}`,
    `< ${t} >`,
    ` ${line}`,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n");
}