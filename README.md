# Windows XP — Web Desktop Simulation

A single-page, dependency-free recreation of a Windows XP desktop — complete with BIOS POST,
boot loader, welcome/logon screen, Luna-themed window manager, classic apps, and two fully
simulated messengers: **MSN Messenger 7** and **ICQ 2003**, with filled buddy lists and
friends waiting to chat the moment you sign in.

## Run it

Any static file server works (an http:// origin is recommended — audio autoplay
behaves better). All assets are bundled locally in `/assets`, so the desktop also
works fully **offline**:

```sh
# Python
python -m http.server 8123
# then open http://127.0.0.1:8123/

# or Node
npx serve .
```

Or just open `index.html` directly — everything runs from the local files.

## What's inside

| Area | Details |
|---|---|
| Boot | Award BIOS POST typewriter → XP boot loader (animated bar) → welcome screen (User / Guest tiles) |
| Session | Log off, Turn Off Computer dialog, standby, shutdown → "It's now safe…" screen, BSOD (try ending `lsass.exe` in Task Manager, or `taskkill lsass.exe` in CMD) |
| Window manager | Drag, resize, minimize-to-taskbar animation, maximize, taskbar buttons with flash, z-order focus, modal dialogs, context menus, balloons, tray with blink/badge |
| Start menu | Pinned IE + E-mail, frequent list, All Programs flyout with nested submenus, right column, Log Off / Turn Off footer |
| Desktop | 19 icons incl. Steam + game shortcuts (original CS/StarCraft/TA/C&C/WoW icons & box art), rubber-band selection, drag & snap-to-grid, delete to Recycle Bin (restorable), New → Text Document, right-click menu |
| Messengers | MSN 7.5 sign-in progress, buddy list with avatars/statuses/personal messages, chats with typing indicators, keyword auto-replies, **Nudge** (window shakes!), fake ad bar, scripted friends who message you after sign-in; ICQ 2003 float window with UINs, status tree, ICQ # message windows |
| Apps | Notepad, Paint (flood fill, undo, save PNG), Calculator, Minesweeper (authentic sprites, first-click safe, flags/?), Command Prompt (help/dir/tree/ping/ipconfig/start/taskkill/shutdown…), Internet Explorer 6 (MSN, Google + search, MySpace with Top 8, **YouTube 2005 beta**, **Wikipedia 2001**, **GeoCities** — see Retro web), Windows Media Player (visualizer, 2003 playlist), Explorer windows (My Computer / Documents / Pictures / Recycle Bin), Control Panel, Display Properties (live wallpaper switcher), Date & Time, Search, Help, Run, winver |
| Retro games | **Steam (2003 client)** with real game banners, tabs (Games/Friends/Servers), status bar — launches the games below. **Counter-Strike 1.5** via the Half-Life menu: create/join game, server browser (de_dust2 forever), console loading sequence, live HUD (killfeed, round timer, HP/ammo, F = flashbang, you will get AWP'd). **StarCraft** with Battle.net logon + chat channel chatter you can reply to, and a campaign that ends badly. **Total Annihilation**: green vector menu, skirmish setup, loading quotes ("The clock is ticking, Commander."), live battle log, DEFEAT. **Command & Conquer**: GDI/Nod side select, typed briefing, sidebar with POWER/UNIT READY/DEPLOY — and a nuclear strike if you linger |
| Retro web | **YouTube (2005 beta)**: Broadcast Yourself™, video grid, search → results, watch page with buffering bar, view counts and MySpace embed code. **Wikipedia (2001)**: UseMod-style article pages, CamelCase links, "very small server in Florida". **GeoCities**: blinking UNDER CONSTRUCTION, marquee, LCD visitor counter, guestbook, webring, X-Files truth page, and of course **the Hamster Dance** (with PARTY MODE) |
| Extras | Quick launch, tray (network status, volume mixer with master volume, security-center joke, blinking messengers), Mystify-style screensaver after 3 min idle, login balloons, Ctrl+Alt+Del, Win key, Win+D |
| Sounds | Authentic XP scheme sounds, real MSN sounds (`newalert`, `online`, nudge), ICQ-flavored legacy sounds — bundled, WebAudio synth fallback if a file is missing |

## Config (`js/config.js`)

Plain JS settings file, edit & refresh — no build step.

| Setting | Default | Effect |
|---|---|---|
| `boot.skipToDesktop` | `true` | Start straight at the desktop — skips BIOS POST, the XP boot loader and the welcome screen (Restart / BSOD flows skip too; Log Off still shows the welcome screen). Set `false` for the full boot. |
| `games.requireCd` | `true` | Clicking Counter-Strike / StarCraft shows the game's borderless splash (click to skip) followed by a period-correct "insert CD" error; Total Annihilation and Command & Conquer show the error dialog right away; World of Warcraft plays the vanilla login screen on a loop under an eternal "You are queued for your server" dialog. Set `false` to open the full game-window simulations. Minesweeper and the Steam client always work. |

## Authentic assets (bundled in `/assets`, works offline)

Everything was hot-linked from the original sources during development and is now
downloaded into `/assets` (run `python download_assets.py` / `python download_screens.py`
to refresh). Sources:

- Icons / sounds / wallpapers / boot logos: [`ducbao414/win32.run`](https://github.com/ducbao414/win32.run)
- Minesweeper sprites + misc 16px icons: [`ShizukuIchi/winXP`](https://github.com/ShizukuIchi/winXP)
- MSN avatars + nudge sound: [`ManzDev/twitch-msn-messenger`](https://github.com/ManzDev/twitch-msn-messenger)
- MSN notification sounds: archive.org (`newemail` item)
- Bliss wallpaper, MSN logo, StarCraft briefing + TA gameplay screenshots: Wikimedia
- Steam game banners + original app icons (CS, Half-Life, DoD, TFC): official Steam CDN
- World of Warcraft vanilla logo emblem (desktop icon + splash): ClipartKey
- World of Warcraft login-screen video loop (`assets/screens/wow_login.mp4`, silent 12 s cut via ffmpeg): archive.org item `world-of-warcraft-login-screen`; queue dialog look referenced from a classic vanilla error screenshot
- CS 1.5 menu background + original icon: [Counter Strike wiki](https://counterstrike.fandom.com)
- C&C Tiberian Dawn briefing screens, splash + original icon: [CnC wiki](https://cnc.fandom.com)
- StarCraft / Total Annihilation box art: [PCGamingWiki](https://www.pcgamingwiki.com)

Every hot-link has an inline-SVG or alternate fallback (`data-fb` + global `onerror` handler),
so a dead CDN degrades to generic icons instead of broken images.

## Files

```
index.html      DOM skeleton (boot screens, desktop, start menu, overlays)
css/xp.css      full Luna theme
css/apps.css    messenger/ICQ/IE/WMP looks
js/assets.js    asset URL maps + SVG fallbacks
js/sounds.js    Sound engine (URLs + WebAudio synth fallback, master volume)
js/wm.js        window manager, taskbar, menus, dialogs, tray, Run
js/boot.js      BIOS → boot → welcome → session flows, BSOD
js/apps.js      all classic apps + Shell (Recycle Bin)
js/games.js     Steam 2003 + CS 1.5, StarCraft, Total Annihilation, Command & Conquer
js/msn.js       MSN Messenger simulation
js/icq.js       ICQ 2003 simulation
js/main.js      desktop, start menu, tray, screensaver, session glue
```

No build step, no dependencies, no frameworks. Vanilla JS loaded in dependency order.
