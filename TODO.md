# TODO — retro_os feature queue

(Working notes — delete when done.)

## 1. Winamp (classic Winamp 2/5 skin) — music player
- [x] Winamp 2 "Classic" main window: LED display (green seven-seg look), song-info scroller, kbps/khz/stereo line, spectrum/VU visualizer, transport buttons (⏮ ▶ ⏸ ⏹ ⏭ ⏏), ZUFALL (shuffle) etc.
- [x] Winamp playlist window: 15 songs from desktop_vor_oldieparty.jpg screenshot, colored rows, current row highlighted (Shakira - Don't Bother), footer time/count + SHUF/AMPL/MARSH/MELIE/DLLs buttons, PLAY LIST toggle
- [x] Play/pause/next/prev actually drive LED time + visualizer (fake playback)
- [x] Desktop icon + Start menu + Run `winamp` (ICON.winamp already exists in assets/shiz/windowsIcons)

## 2. Real music playback (Winamp + Windows Media Player)
- [x] config.js: `media` section — playlist entries can have optional `src` (local files or mp3 URLs); default = the Winamp screenshot playlist w/ empty src (simulated playback)
- [x] Shared audio engine: if entry has src → HTMLAudioElement for real play/pause/seek; else simulated timer playback
- [x] Winamp: double-click playlist entry → play (real if src given)
- [x] WMP: same — accepts file/URL from config + opening "media files" (see #6)
- [x] README + config docs: how to drop mp3s / paste links

## 3. TeamSpeak 2 client
- [x] Window per screen_15-05-06.bmp: title "TeamSpeak 2", menus Connection/Channels/Players/Self/Recording/Info/Settings/Help
- [x] Channel tree (VERIFIED from ts_tree.png): FilesMania-WOW-Private > Apocalypse Imperialis (RD) > [users: Goldhuhnprophet (R CA) selected, Van Helsing der Unken Killer (R CA), Lt_Jam (R)], Warten auf BG-Teilnehmer (R), AFK (RS) > Was fuddern / < 5 Min / > 5 Min < 30 Min / > 30 Min < 2 Std / > 2 Std, PASSWORT (R), Privater Chat (RS) > 2 Personen Nummer 1-3, 3 Personen Nummer 1-2, 4 Personen Nummer 1-2, WOW - Regeln :: Version 1.3 (R)
- [x] Right info pane: Player: Goldhuhnprophet / Global flags: Registered / Channel Privileges: Channel Admin / Player Attributes: None (updates on selection)
- [x] Log pane: "Connecting to www.filesmania.de / Connected to server FilesMania-WOW-Private / Willkommen auf dem Laberserver"; status bar "Connected as Lt_Jam"
- [x] Desktop icon + Start menu + Run `teamspeak` / `ts2`

## 4. Firefox as default browser
- [x] Firefox 2-era window: XP chrome "… - Mozilla Firefox", tab bar (tabs + [+] + list), menu Datei Bearbeiten Ansicht Chronik Lesezeichen Extras Hilfe, nav toolbar (back/fwd/stop/reload/home, ABF/ad-filter, address bar, Google box), bookmark toolbar (Half-Life Portal, FileServer, WOW, FUN, Email, NewsFox)
- [x] Reuse the fake-site registry from IE (SITES in apps.js) — refactor into shared registry; IE keeps working
- [x] config.js `boot/defaultBrowser: 'firefox'` — desktop icon, Start menu, quick launch, Run URLs + cmd start + Run `firefox` all go through default browser
- [x] Keep IE on desktop as "old" icon (2007 switch-time vibe) but Firefox gets the "Internet" role

## 5. Recreate WoW webpage = www.wow-europe.com/de/ (German WoW Europe portal, Patch 1.12 era) — from wowhex bmp
- [x] Fake site "World of Warcraft Europe" in Firefox: WoW logo header, left nav (NEWS/INFOS ZUM SPIEL/INTERAKTIV/COMMUNITY/ACCOUNT/SUPPORT/MEDIEN), banner "PATCH 1.12 DONNER DES KRIEGES", AKTUELLES news list (Neues Forum für den Gamesmaster-Kundendienst 30.08.2006, The Burning Crusade: Talente und Fähigkeiten 28.08.2006, Naxxramas Live auf der Games Convention 25.08.2006, Die neuen WoW Foren sind da! 24.08.2006, Donner des Krieges Patch 1.12 22.08.2006), WICHTIGE LINKS box (Kontakt/Realmstatus/Accouterstellung/Accountverwaltung/Passwort vergessen?), NEUE FOREN + RÜSTUNGSSETS banners, EINGELOGGT/Neu in Azeroth panel, KUNDENDIENST + JOBS boxes
- [x] Add as Firefox BOOKMARK (bookmark toolbar "WOW"/star + Lesezeichen menu)
- [x] Desktop shortcut icon → opens Firefox at wow-europe.com/de
- [ ] (nice-to-have: wowpro "Jane's Alliance leveling guide" site as in firefox_ref tabs)

## 6. "Star Wars Kid" video file on desktop
- [x] Download https://www.youtube.com/watch?v=kR3PT5E0XDo (yt-dlp? check availability; keep small ≤ ~20 MB, 480p mp4)
- [x] assets/media/star_wars_kid.mp4 (+ poster frame?)
- [x] Desktop file icon "Star Wars Kid.avi" (WMP file icon via svgIcon) → WM.launch('wmp', {file}) plays the real video WITH SOUND in WMP
- [x] WMP: video rendering mode (black canvas area showing <video>), keep music skin for mp3s

## 7. BUG: "the try icon" = system TRAY icons in a weird vertical stack
- [x] Investigate #tray-icons layout (xp.css tray CSS + main.js buildTray 480-522 + WM.addTray wm.js 391-410): tray icons must line up horizontally
- [x] Also check main.js rowsPerCol()/slotPos() cap (~64-70) as secondary suspect

## 8. Wrap-up
- [x] checkjs.ps1 + check_assets.py + HTTP smoke test
- [ ] README (features, config: defaultBrowser, media/mp3, credits: Jane's guide © WowPro/Thottbot-era sites, Star Wars Kid is a 2005 viral video)
- [x] Commits (one per feature ideally)

## Ref images (converted)
- C:\Users\jkost\AppData\Local\Temp\opencode\winamp_ref.png  (desktop_vor_oldieparty.jpg)
- C:\Users\jkost\AppData\Local\Temp\opencode\teamspeak_ref.png (screen_15-05-06.bmp)
- C:\Users\jkost\AppData\Local\Temp\opencode\firefox_ref.png (desktop_28-02-07_wow_lvln.bmp)
- C:\Users\jkost\AppData\Local\Temp\opencode\wowhex_ref.png (desktop_31-08-06_wowhex.bmp) — NOT YET INSPECTED
