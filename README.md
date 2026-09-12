<img width="1280" height="640" alt="UselessOS V2.5" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# UselessOS™ V2.9.2 🎯


## Basic Details
### Team Name: Shallbeuseless


### Team Members
- Member 1: Adithya Rajesh - TKM College of Engineering
- Member 2: Aditya A Nair - TKM College of Engineering

### Project Description
A fully functional operating system whose primary function is preventing you from accomplishing anything. Featuring 14 useless apps, a fake browser with fake sites, a terminal that answers nothing, a productivity score that never rises above 0%, and real media files shipped inside the OS just to make it worse.

### The Problem (that doesn't exist)
The modern world expects you to be productive. What if your operating system actively resisted that expectation? What if every click, every keystroke, every interaction was designed to waste exactly as much time as possible?

### The Solution (that nobody asked for)
UselessOS™ — a browser-based fake operating system with draggable windows, a fake web browser, a calculator that always returns 42, paint that deletes your art, an app store stuck at 99%, an inverted volume slider whose max setting summons a furious chicken, and a brightness slider whose max setting plays a 144P Lebron James video. All wrapped in a dark-mode UI that looks suspiciously professional for something so fundamentally useless.

Live demo: **https://flogduse.github.io/useless/**

Project demo video: **https://drive.google.com/drive/folders/1Ta7UIuw-gwYBPFTtDbYvgS4eUuTgRySO?usp=sharing**

## Technical Details
### Technologies/Components Used
For Software:
- **Languages:** HTML5, CSS3, vanilla JavaScript (ES2020+)
- **Libraries:** Google Fonts (Inter + Space Grotesk) and Font Awesome 6 via CDN for icons. Everything else is zero-dependency, pure DOM manipulation.
- **Tools:** Web Audio API for sounds, localStorage for persisting regrets, Pointer Events API for window dragging, Canvas API for UselessPaint, HTMLVideoElement/AudioElement for local media playback (rickroll, Lebron song, radio files).

For Hardware:
- A computer. That's it. Literally just a computer with a browser. Plus some MP3/MP4 files you downloaded.

### Implementation
The project is a single-page application built almost entirely with vanilla HTML, CSS, and JavaScript. A small PowerShell build script inlines all JS/CSS into one `dist/index.html`; a deploy script pushes it to GitHub Pages. No npm, no servers required.

**Architecture:**
```
index.html          → DOM shell: boot screen, desktop, taskbar, overlays
style.css           → All styles, organized by component (~760 lines, unminified)
js/state.js         → Shared state, constants (APPS, files), localStorage persistence
js/ui.js            → Window management, toasts, drag, sounds, BSOD, the Lebron flash
js/apps.js          → 14 applications: content templates + event bindings
js/browser.js       → Fake browser with 6 sites, UselessMart, UselessMail, games, cat art
js/terminal.js      → Terminal commands with useless outputs
js/main.js          → Boot sequence, clock, start menu, Konami code, global listeners
assets/             → Local media: rickroll.mp4, lebron-sunshine.mp4, chicken-scream.webm, lofi/*.mp3/.mp4
build.ps1           → Inlines JS/CSS + copies assets into dist/
deploy-gh.ps1       → Publishes dist/ to the gh-pages branch
```

**Build & deploy:**
```powershell
powershell -ExecutionPolicy Bypass -File build.ps1     # produces dist/index.html + dist/assets/
powershell -ExecutionPolicy Bypass -File deploy-gh.ps1 # force-pushes to gh-pages → live site
```

**Key features:**
- Draggable, resizable windows with traffic-light controls (default 640×470; auto-size on small screens that clears the toast strip)
- Pointer Events-based drag (no global mousemove handler)
- localStorage persistence for rage count, scores, notes, settings
- Context menu with desktop/window/taskbar variants
- Keyboard shortcuts: Alt+F4 (IT department dialog), Ctrl+Alt+Del (lock screen), Ctrl+C (clipboard hijack)
- Konami code → God Mode wallpaper
- BSOD after 5 consecutive window closes
- Fake update ads every 50 seconds
- Real local media: every rickroll is `assets/rickroll.mp4` (click-to-play poster), the Lebron flash plays his 144P "You Are My Sunshine" video
- Font Awesome icons + Google Fonts (falls back gracefully when offline)

# Installation
No installation required. Just open `index.html` in your browser, or visit the live demo.

```bash
git clone https://github.com/flogduse/useless.git
cd useless
# Open index.html in Chrome/Edge/Firefox, or: powershell -File build.ps1 && powershell -File deploy-gh.ps1
```

# Run
Open `index.html` in any modern browser. No server needed — it works from `file://`. Fonts/icons require internet; the media playback is fully local.

# screenshot

Project screenshots: **https://docs.google.com/document/d/1c6t5t0flFQn_8G4KPGqSen6I4aeM6--whIfE5yOZ6Pc/edit?usp=sharing**

# Diagrams

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  index.html  │───▶│  state.js    │───▶│    ui.js     │
│  (DOM shell) │    │  (shared     │    │  (windows,   │
│              │    │   state +    │    │   toasts,    │
│  style.css   │    │   persist)   │    │   drag,      │
│  (all styles)│    └──────────────┘    │   context    │
├──────────────┤           │            │   menu,      │
│  assets/     │           ▼            │   BSOD,ads)  │
│  (local      │    ┌──────────────┐    └──────┬───────┘
│   media)     │    │   apps.js    │           │
└──────────────┘    │ (14 apps)    │           │
                    └──────┬───────┘           │
                           ▼                   │
                    ┌──────────────┐           │
                    │ browser.js   │◀──────────┘
                    │ (6 fake      │
                    │  sites,      │
                    │  games,      │
                    │  rickrolls)  │
                    └──────┬───────┘
                           │
                    ┌──────────────┐
                    │ terminal.js  │
                    │ (20+ cmds)   │
                    └──────────────┘
```

### Project documentation

## Feature List

| App | What it does |
|-----|-------------|
| **UselessBrowser** | Fake internet with 6 sites: UselessTube, UselessMart, UselessMail, UselessWiki, Games, Weather |
| **Files** | Useless files. DO_NOT_OPEN.txt contains the words "DO_NOT_OPEN.txt". |
| **Notes** | Write notes. They save. Nothing else happens. |
| **Terminal** | Many commands: `neofetch`, `cowsay`, `hack`, `ping`, `wifi`, `rick`, and more. |
| **Bill** | A chat assistant with strong opinions and no help to offer. |
| **Lo-Fi Radio** | 4 stations. 3 play real files from `assets/lofi/` (ning, Chinese rap, shimy). 1 is lies. |
| **Settings** | Inverted volume (lower = louder; maxing it summons the screaming chicken), brightness (maxing it triggers the Lebron flash), sound toggle, mood, wallpaper, demo mode. |
| **Trash** | Delete UselessOS. Access denied. |
| **Activity Monitor** | Tracks: actions attempted, successful actions (low), rage, rickrolls, time wasted. |
| **Calculator** | Always returns 42. Sometimes returns wrong numbers. |
| **UselessPaint** | Draw freely. Every 8 strokes, your art is deleted. |
| **App Store** | Apps stuck at 99% installing forever. |
| **Calendar** | Countdown to nothing. Resets at 00:00:00. |
| **About** | Version info and a meaningless quote. |

## Terminal Commands
```
help, ls, open, cat, sudo, escape, delete, productivity,
rick, hack, neofetch, cowsay, ping, wifi, calc, date,
time, weather, ip, whoami, echo, clear, npm, whereis, unzip
```

## Rage-Bait Features
- 🍪 Cookie button that runs away when you hover
- ✖ Ad close buttons that do nothing
- 📧 Emails that disappear when opened
- 🎬 Every video is Rick Astley — now served from a local `rickroll.mp4`
- 🧮 Calculator that returns 42
- 🎨 Paint that deletes your art every 8 strokes
- 📦 App store stuck at 99% forever
- 📅 Calendar counting down to nothing
- 🔒 Ctrl+Alt+Del lock screen
- 🔵 Blue Screen after 5 window closes
- ⌨️ Konami code God Mode
- 📢 Auto popup ads every 50 seconds
- 🪟 Windows that stick to your cursor
- 🔊 Inverted volume slider — the chicken awaits at 100%
- 🏀 Brightness at 100% → the King gets flashbanged in 144P
- 📻 "Lo-Fi" radio that mostly plays meme files you downloaded yourself

## Media Assets
| File | Role |
|------|------|
| `assets/rickroll.mp4` | Every rickroll in the OS (UselessTube, clicker, terminal `rick`) |
| `assets/lebron-sunshine.mp4` | Plays during the brightness-max Lebron flash |
| `assets/chicken-scream.webm` | The sound at volume-bar maximum |
| `assets/lofi/chill-ning.mp3` | Lo-Fi Radio — station 1 |
| `assets/lofi/focus-chinese-rap.mp3` | Lo-Fi Radio — station 2 |
| `assets/lofi/tax-shimy.mp4` | Lo-Fi Radio — station 3 |

## Demo Route
1. Boot → watch the progress bar fill
2. Browser opens automatically → hover the green "ACCEPT COOKIES" button
3. Try the ad × buttons on UselessTube, UselessMart, etc.
4. Open UselessTube → click Play → local-video rickroll
5. Open Lo-Fi Radio → pick a station → real audio plays
6. Open Settings → drag the volume bar to max → screaming chicken
7. Drag brightness to 100% → flashbanged Lebron, 144P, with song
8. Open UselessMart → buy a premium potato (₹89,999)
9. UselessMail → open an email → watch it disappear
10. Open Files → DO_NOT_OPEN.txt / potato.jpg / nothing.exe
11. Open Calculator → press some numbers → = → 42
12. Open UselessPaint → draw something → watch it get deleted
13. Open App Store → try to install anything
14. Open Terminal → `help`, `neofetch`, `rick`, `escape`
15. Right-click the desktop → New Folder → Refresh
16. Open Activity Monitor → show the stats
17. Press Ctrl+Alt+Del → lock screen
18. Press the power button 4 times → BSOD

## Team Contributions
- **Adithya Rajesh:** Core OS — window management, state/persistence, boot sequence, start menu, taskbar, UI chrome, deploy scripts.
- **Aditya A Nair:** Apps & media — UselessBrowser sites, Lo-Fi Radio (real files), local rickroll/Lebron/chicken integration, meme layer, documentation.

---

Made with ❤️ at TinkerHub Useless Projects

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
