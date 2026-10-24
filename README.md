# Windows XP — Web Desktop Simulation

A single-page, dependency-free recreation of a Windows XP desktop — complete with BIOS POST,
boot loader, welcome/logon screen, Luna-themed window manager, classic apps, and two fully
simulated messengers: **MSN Messenger 7** and **ICQ 2003**, with filled buddy lists and
friends waiting to chat the moment you sign in.

## Run it

Any static file server works (the page hot-links its assets, so an http:// origin is
recommended — autoplay and CORS behave better):

```sh
# Python
python -m http.server 8123
# then open http://127.0.0.1:8123/

# or Node
npx serve .
```

Or just open `index.html` directly — everything except a couple of sound files will work.

## What's inside

| Area | Details |
|---|---|
| Boot | Award BIOS POST typewriter → XP boot loader (animated bar) → welcome screen (User / Guest tiles) |
| Session | Log off, Turn Off Computer dialog, standby, shutdown → "It's now safe…" screen, BSOD (try ending `lsass.exe` in Task Manager, or `taskkill lsass.exe` in CMD) |
| Window manager | Drag, resize, minimize-to-taskbar animation, maximize, taskbar buttons with flash, z-order focus, modal dialogs, context menus, balloons, tray with blink/badge |
| Start menu | Pinned IE + E-mail, frequent list, All Programs flyout with nested submenus, right column, Log Off / Turn Off footer |
| Desktop | 13 icons, rubber-band selection, drag & snap-to-grid, delete to Recycle Bin (restorable), New → Text Document, right-click menu |
| Messengers | MSN 7.5 sign-in progress, buddy list with avatars/statuses/personal messages, chats with typing indicators, keyword auto-replies, **Nudge** (window shakes!), fake ad bar, scripted friends who message you after sign-in; ICQ 2003 float window with UINs, status tree, ICQ # message windows |
| Apps | Notepad, Paint (flood fill, undo, save PNG), Calculator, Minesweeper (authentic sprites, first-click safe, flags/?), Command Prompt (help/dir/tree/ping/ipconfig/start/taskkill/shutdown…), Internet Explorer 6 (MSN, Google + search, MySpace with Top 8), Windows Media Player (visualizer, 2003 playlist), Explorer windows (My Computer / Documents / Pictures / Recycle Bin), Control Panel, Display Properties (live wallpaper switcher), Date & Time, Search, Help, Run, winver |
| Extras | Quick launch, tray (network status, volume mixer with master volume, security-center joke, blinking messengers), Mystify-style screensaver after 3 min idle, login balloons, Ctrl+Alt+Del, Win key, Win+D |
| Sounds | Authentic XP scheme sounds, real MSN sounds (`newalert`, `online`, nudge), ICQ-flavored legacy sounds — all hot-linked, WebAudio synth fallback if offline |

## Authentic assets (hot-linked, nothing bundled)

- Icons / sounds / wallpapers / boot logos: [`ducbao414/win32.run`](https://github.com/ducbao414/win32.run) via jsDelivr CDN
- Minesweeper sprites + misc 16px icons: [`ShizukuIchi/winXP`](https://github.com/ShizukuIchi/winXP) via jsDelivr
- MSN avatars + nudge sound: [`ManzDev/twitch-msn-messenger`](https://github.com/ManzDev/twitch-msn-messenger) via jsDelivr
- MSN notification sounds: archive.org (`newemail` item)
- Bliss wallpaper + MSN logo: Wikimedia Commons

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
js/msn.js       MSN Messenger simulation
js/icq.js       ICQ 2003 simulation
js/main.js      desktop, start menu, tray, screensaver, session glue
```

No build step, no dependencies, no frameworks. Vanilla JS loaded in dependency order.
