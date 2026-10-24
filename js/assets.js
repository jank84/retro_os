/* ==========================================================================
   assets.js — hot-linked original Windows XP / MSN / ICQ assets
   Sources: jsDelivr CDN mirrors of open-source XP web recreations,
   archive.org sound archive, Wikimedia Commons.
   ========================================================================== */
'use strict';

const CDN = {
  w32:  'https://cdn.jsdelivr.net/gh/ducbao414/win32.run@main/static/',
  shiz: 'https://cdn.jsdelivr.net/gh/ShizukuIchi/winXP@master/src/assets/',
  msnr: 'https://cdn.jsdelivr.net/gh/ManzDev/twitch-msn-messenger@main/public/',
  ia:   'https://archive.org/download/',
  wiki: 'https://upload.wikimedia.org/wikipedia/'
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
  appWindow:     I + 'ApplicationWindow.png'
};

/* ---- wallpapers ---- */
const WALLP = {
  bliss:  CDN.w32 + 'files/wallpapers/Bliss.jpg',
  blissHQ:'https://upload.wikimedia.org/wikipedia/commons/c/cf/Bliss.jpg',
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
