/* ==========================================================================
   assets.js — original Windows XP / MSN / ICQ assets, bundled locally
   (offline) in /assets, mirrored from jsDelivr XP repos, archive.org,
   Wikimedia Commons, Steam CDN and game wikis. Run download_assets.py /
   download_screens.py to refresh.
   ========================================================================== */
'use strict';

const CDN = {
  w32:  'assets/w32/',
  shiz: 'assets/shiz/',
  msnr: 'assets/msnr/',
  ia:   'assets/ia/',
  wiki: 'assets/wiki/'
};

const I = CDN.w32 + 'images/xp/icons/';

/* ---- inline SVG fallback icons (used if a hotlink ever fails) ---- */
function svgIcon(inner) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' + inner + '</svg>');
}
const GENERIC_APP_ICON = svgIcon(
  '<rect x="4" y="3" width="24" height="26" rx="2" fill="#fff" stroke="#7a7a7a"/>' +
  '<rect x="4" y="3" width="24" height="6" rx="2" fill="#0a54dd"/>' +
  '<rect x="7" y="12" width="18" height="2" fill="#c9c9c9"/>' +
  '<rect x="7" y="16" width="18" height="2" fill="#c9c9c9"/>' +
  '<rect x="7" y="20" width="12" height="2" fill="#c9c9c9"/>');

/* Classic ICQ flower — drawn by hand, white petals on ICQ green */
const ICQ_FLOWER = svgIcon(
  '<circle cx="16" cy="16" r="15" fill="#4cb050" stroke="#2e7d32" stroke-width="1"/>' +
  '<g fill="#fff">' +
  '<circle cx="16" cy="8.6" r="4.6"/><circle cx="23.1" cy="13.8" r="4.6"/>' +
  '<circle cx="20.4" cy="22.4" r="4.6"/><circle cx="11.6" cy="22.4" r="4.6"/>' +
  '<circle cx="8.9" cy="13.8" r="4.6"/>' +
  '<circle cx="16" cy="16.6" r="4.2"/></g>' +
  '<circle cx="16" cy="16.6" r="2.2" fill="#4cb050"/>');

const ICQ_FLOWER_BW = svgIcon(
  '<circle cx="16" cy="16" r="15" fill="#9db8a0" stroke="#5c7a60" stroke-width="1"/>' +
  '<g fill="#d9e6da">' +
  '<circle cx="16" cy="8.6" r="4.6"/><circle cx="23.1" cy="13.8" r="4.6"/>' +
  '<circle cx="20.4" cy="22.4" r="4.6"/><circle cx="11.6" cy="22.4" r="4.6"/>' +
  '<circle cx="8.9" cy="13.8" r="4.6"/>' +
  '<circle cx="16" cy="16.6" r="4.2"/></g>' +
  '<circle cx="16" cy="16.6" r="2.2" fill="#9db8a0"/>');

const MSN_WINGED = svgIcon(
  '<circle cx="16" cy="16" r="15" fill="#0a8fd4"/>' +
  '<path d="M16 4c-5 6-8 10-8 14a8 8 0 0 0 16 0c0-4-3-8-8-14z" fill="#ffd23f" stroke="#e6a800"/>' +
  '<circle cx="16" cy="17" r="3" fill="#0a8fd4"/>');

/* ---- game art (official Steam CDN artwork, bundled) + wordmark fallbacks ---- */
const GAPP = 'assets/steam/';
const GAMEART = {
  csBanner:   GAPP + '10/header.jpg',
  hlBanner:   GAPP + '70/header.jpg',
  dodBanner:  GAPP + '30/header.jpg',
  tfcBanner:  GAPP + '40/header.jpg'
};
/* real menu/briefing screenshots + original shortcut icons */
const SCREENS = {
  csMenu:      'assets/screens/cs_menu.webp',
  csMenuItaly: 'assets/screens/cs_menu_italy.webp',
  scBriefing:  'assets/screens/sc_briefing.png',
  scLoading:   'assets/screens/sc_loading.webp',
  wowSplash:   'assets/screens/wow_splash.webp',
  wowLogin:    'assets/screens/wow_login.mp4',
  wowLoginPoster: 'assets/screens/wow_login_poster.jpg',
  taBattle:    'assets/screens/ta_battle.jpg',
  cncSplash:   'assets/screens/cnc_splash.webp',
  cncBriefGdi: 'assets/screens/cnc_brief_gdi.webp',
  cncBriefNod: 'assets/screens/cnc_brief_nod.webp'
};
const WORDMARK = (text, sub, bg, fg, sub2) => svgIcon(
  '<rect width="32" height="32" rx="3" fill="' + bg + '"/>' +
  '<text x="16" y="15" font-family="Arial Black,Arial" font-size="10" font-weight="900" fill="' + fg + '" text-anchor="middle">' + text + '</text>' +
  '<text x="16" y="25" font-family="Arial" font-size="5.5" fill="' + (sub2 || fg) + '" text-anchor="middle">' + (sub || '') + '</text>');

/* ---- icon map (48px originals, browser scales down) ---- */
const ICON = {
  myComputer:    I + 'MyComputer.png',
  myDocuments:   I + 'MyDocuments.png',
  myPictures:    I + 'MyPictures.png',
  myMusic:       I + 'MyMusic.png',
  networkPlaces: I + 'MyNetworkPlaces.png',
  recycleEmpty:  I + 'RecycleBinempty.png',
  recycleFull:   I + 'RecycleBinfull.png',
  ie:            I + 'InternetExplorer6.png',
  ieAlt:         CDN.shiz + 'windowsIcons/ie.png',
  msn:           I + 'MSNMessenger.png',
  msnTray:       I + 'WindowsMessenger.png',
  msnLogo:       CDN.wiki + 'en/e/ed/MSN_Messenger_logo.png',
  icq:           ICQ_FLOWER,
  icqGray:       ICQ_FLOWER_BW,
  msnGeneric:    MSN_WINGED,
  notepad:       I + 'Notepad.png',
  wordpad:       I + 'Wordpad.png',
  paint:         I + 'Paint.png',
  mines:         I + 'Minesweeper.png',
  solitaire:     I + 'Solitaire.png',
  spider:        I + 'SpiderSolitaire.png',
  freecell:      I + 'Freecell.png',
  wmp:           I + 'WindowsMediaPlayer10.png',
  wmp9:          I + 'WindowsMediaPlayer9.png',
  cmd:           I + 'CommandPrompt.png',
  calc:          I + 'Calculator.png',
  explorer:      I + 'Explorer.png',
  folder:        I + 'FolderClosed.png',
  folderOpen:    I + 'FolderOpened.png',
  txt:           I + 'TXT.png',
  doc:           I + 'DOC.png',
  zip:           I + 'Zipfolder.png',
  html:          I + 'HTML.png',
  url:           I + 'InternetShortcut.png',
  shortcut:      I + 'URL.png',
  controlPanel:  I + 'ControlPanel.png',
  display:       I + 'DisplayProperties.png',
  sysprops:      I + 'SystemProperties.png',
  help:          I + 'HelpandSupport.png',
  search:        I + 'Search.png',
  run:           I + 'Run.png',
  taskmgr:       I + 'TaskManager.png',
  userAccounts:  I + 'UserAccounts.png',
  power:         I + 'Power.png',
  restart:       I + 'Restart.png',
  standby:       I + 'Standby.png',
  logoff:        I + 'Logout.png',
  switchUser:    I + 'SwitchUser.png',
  volume:        I + 'Volume.png',
  network:       I + 'NetworkConnection.png',
  localDisk:     I + 'LocalDisk.png',
  floppy:        I + 'FloppyDisk.png',
  cdrom:         I + 'CD-R.png',
  cdromRom:      I + 'CD-ROM.png',
  audioCD:       I + 'AudioCD.png',
  desktop:       I + 'Desktop.png',
  printer:       I + 'Printer.png',
  info:          I + 'Information.png',
  delete:        I + 'Delete.png',
  restore:       I + 'Restore.png',
  alert:         I + 'Alert.png',
  critical:      I + 'Critical.png',
  question:      I + 'Question.png',
  success:       I + 'Success.png',
  programs:      I + 'StartMenuPrograms.png',
  favorites:     I + 'Favorites.png',
  catalog:       I + 'WindowsCatalog.png',
  update:        I + 'WindowsUpdate.png',
  email:         I + 'MSNEmail.png',
  mail:          CDN.shiz + 'windowsIcons/mail.png',
  winamp:        CDN.shiz + 'windowsIcons/winamp.png',
  heart:         CDN.shiz + 'windowsIcons/heart.png',
  earth:         CDN.shiz + 'windowsIcons/earth.png',
  userTile:      CDN.shiz + 'windowsIcons/user.png',
  startFlag:     CDN.shiz + 'windowsIcons/start.png',
  windowsLogo:   CDN.w32 + 'images/ms.png',
  appWindow:     I + 'ApplicationWindow.png',
  /* retro games — original shortcut icons / box art (bundled in assets/) */
  steam: svgIcon(
    '<rect x="1" y="1" width="30" height="30" rx="4" fill="#1b2838"/>' +
    '<rect x="2" y="2" width="28" height="28" rx="3" fill="#2a475e"/>' +
    '<circle cx="21" cy="11" r="4.6" fill="#c6d4df" stroke="#8fa3b0" stroke-width="1"/>' +
    '<circle cx="21" cy="11" r="1.9" fill="#2a475e"/>' +
    '<circle cx="11" cy="22" r="3.4" fill="#a8b8c4" stroke="#8fa3b0" stroke-width="1"/>' +
    '<circle cx="11" cy="22" r="1.4" fill="#2a475e"/>' +
    '<path d="M19.5 14.6 L12.4 19.4" stroke="#bfccd6" stroke-width="2.4" stroke-linecap="round"/>'),
  cs:        'assets/art/cs15.webp',
  hl:        'assets/steam/icons/70.jpg',
  dod:       'assets/steam/icons/30.jpg',
  tfc:       'assets/steam/icons/40.jpg',
  starcraft: 'assets/art/starcraft.png',
  wow:       'assets/art/wow.png',
  scCover:   'assets/art/starcraft_cover.png',
  ta:        'assets/art/ta.png',
  cnc:       'assets/art/cncicon.webp',
  steamTile: WORDMARK('STEAM', '', '#2a475e', '#c6d4df'),
  taTile: WORDMARK('TA', 'ANNIHILATION', '#000', '#39e639', '#9fdf9f'),
  cncTile: WORDMARK('C&amp;C', 'TIBERIAN', '#000', '#ffd23f', '#c9a520'),
  csTile: WORDMARK('CS', '1.5', '#3b3427', '#e8a33d', '#cbb98a'),
  scTile: WORDMARK('SC', 'BROOD WAR', '#0d1b2e', '#f2c14e', '#b9964a'),
  hlTile: WORDMARK('HL', '', '#263238', '#ff6d00')
};

/* ---- wallpapers ---- */
const WALLP = {
  bliss:  CDN.w32 + 'files/wallpapers/Bliss.jpg',
  blissHQ:CDN.wiki + 'commons/c/cf/Bliss.jpg',
  azul:   CDN.w32 + 'files/wallpapers/Azul.jpg',
  autumn: CDN.w32 + 'files/wallpapers/Autumn.jpg',
  tulips: CDN.w32 + 'files/wallpapers/Tulips.jpg',
  follow: CDN.w32 + 'files/wallpapers/Follow.jpg',
  friend: CDN.w32 + 'files/wallpapers/Friend.jpg',
  moonflower: CDN.w32 + 'files/wallpapers/Moonflower.jpg',
  radiance: CDN.w32 + 'files/wallpapers/Radiance.jpg',
  wind:   CDN.w32 + 'files/wallpapers/Wind.jpg',
  desert: CDN.w32 + 'files/wallpapers/Redmoondesert.jpg',
  ascent: CDN.w32 + 'files/wallpapers/Ascent.jpg'
};

/* ---- boot / branding ---- */
const BOOT = {
  logo:    CDN.w32 + 'images/xp_loading_mslogo.jpg',
  logoAlt: CDN.w32 + 'images/xp_loading_logo.jpg',
  xpLogo:  CDN.w32 + 'images/xp_logo.png'
};

/* ---- minesweeper sprites (authentic) ---- */
const MS = CDN.shiz + 'minesweeper/';
const MSW = {
  d: i => MS + 'digit' + i + '.png',
  smile:      MS + 'smile.png',
  ohh:        MS + 'ohh.png',
  win:        MS + 'win.png',
  dead:       MS + 'dead.png',
  flag:       MS + 'flag.png',
  question:   MS + 'question.png',
  mine:       MS + 'mine-ceil.png',
  mineDeath:  MS + 'mine-death.png',
  misflag:    MS + 'misflagged.png',
  open:       i => MS + 'open' + i + '.png',
  checked:    MS + 'checked.png'
};

/* ---- MSN buddy avatars ---- */
const AVA = n => CDN.msnr + 'avatars/' + n + '.png';

/* ---- fake "My Documents" / My Pictures content ---- */
const PHOTOS = [
  { f: WALLP.bliss,   name: 'summer_2003_001.jpg' },
  { f: WALLP.tulips,  name: 'garden.jpg' },
  { f: WALLP.autumn,  name: 'autumn_hike.jpg' },
  { f: WALLP.wind,    name: 'clouds.jpg' },
  { f: WALLP.friend,  name: 'me_and_dave.jpg' },
  { f: WALLP.desert,  name: 'roadtrip_nevada.jpg' },
  { f: WALLP.moonflower, name: 'moonflower.jpg' },
  { f: WALLP.ascent,  name: 'foggy_morning.jpg' }
];

/* attach a graceful fallback to every <img> icon via event delegation */
document.addEventListener('error', e => {
  const t = e.target;
  if (t && t.tagName === 'IMG' && t.dataset.fallback !== '1') {
    t.dataset.fallback = '1';
    if (t.dataset.fb) t.src = t.dataset.fb; else t.src = GENERIC_APP_ICON;
  }
}, true);
