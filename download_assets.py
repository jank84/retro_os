# Download all hot-linked assets into local assets/ (offline support).
# Sources mirror the CDN constants in js/assets.js + js/sounds.js.
import os, sys, time, urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
W32  = 'https://cdn.jsdelivr.net/gh/ducbao414/win32.run@main/static/'
SHIZ = 'https://cdn.jsdelivr.net/gh/ShizukuIchi/winXP@master/src/assets/'
MSNR = 'https://cdn.jsdelivr.net/gh/ManzDev/twitch-msn-messenger@main/public/'
IA   = 'https://archive.org/download/'
WIKI = 'https://upload.wikimedia.org/wikipedia/'
STMT = 'https://cdn.cloudflare.steamstatic.com/steam/apps/'
COMM = 'https://shared.fastly.steamstatic.com/community_assets/images/apps/'
UA   = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

ICONS = ['MyComputer','MyDocuments','MyPictures','MyMusic','MyNetworkPlaces','RecycleBinempty','RecycleBinfull',
 'InternetExplorer6','MSNMessenger','Notepad','Wordpad','Paint','Minesweeper','Solitaire','SpiderSolitaire',
 'Freecell','WindowsMediaPlayer10','WindowsMediaPlayer9','CommandPrompt','Calculator','Explorer','FolderClosed',
 'FolderOpened','TXT','DOC','Zipfolder','HTML','InternetShortcut','URL','ControlPanel','DisplayProperties',
 'SystemProperties','HelpandSupport','Search','Run','TaskManager','UserAccounts','Power','Restart','Standby',
 'Logout','SwitchUser','Volume','NetworkConnection','LocalDisk','FloppyDisk','CD-R','CD-ROM','AudioCD','Desktop',
 'Printer','Information','Delete','Restore','Alert','Critical','Question','Success','StartMenuPrograms',
 'Favorites','WindowsCatalog','WindowsUpdate','MSNEmail','ApplicationWindow','WindowsMessenger']

pairs = []
for i in ICONS:
    pairs.append((W32 + 'images/xp/icons/' + i + '.png', 'w32/images/xp/icons/' + i + '.png'))
for m in ['images/ms.png','images/xp_loading_mslogo.jpg','images/xp_loading_logo.jpg','images/xp_logo.png']:
    pairs.append((W32 + m, 'w32/' + m))
for a in ['xp_startup.mp3','XPStartup.mp3','XPLogonSound.mp3','XPLogoffSound.mp3','xp_shutdown.mp3',
 'XPCriticalStop.mp3','XPDing.mp3','XPExclamation.mp3','XPBalloon.mp3','XPRecycle.mp3','XPRestore.mp3',
 'XPMinimize.mp3','XPMenuCommand.mp3','NavigationStart.mp3','XPHardwareInsert.mp3','chimes.mp3','chord.mp3',
 'ding.mp3','notify.mp3','ringin.mp3','ringout.mp3','tada.mp3']:
    pairs.append((W32 + 'audio/' + a, 'w32/audio/' + a))
for w in ['Bliss','Azul','Autumn','Tulips','Follow','Friend','Moonflower','Radiance','Wind','Redmoondesert','Ascent']:
    pairs.append((W32 + 'files/wallpapers/' + w + '.jpg', 'w32/files/wallpapers/' + w + '.jpg'))
for i in ['ie','mail','winamp','heart','earth','user','start']:
    pairs.append((SHIZ + 'windowsIcons/' + i + '.png', 'shiz/windowsIcons/' + i + '.png'))
for d in range(10):
    pairs.append((SHIZ + 'minesweeper/digit%d.png' % d, 'shiz/minesweeper/digit%d.png' % d))
for d in range(9):
    pairs.append((SHIZ + 'minesweeper/open%d.png' % (d + 1), 'shiz/minesweeper/open%d.png' % (d + 1)))
for s in ['smile','ohh','win','dead','flag','question','mine-ceil','mine-death','misflagged','checked']:
    pairs.append((SHIZ + 'minesweeper/' + s + '.png', 'shiz/minesweeper/' + s + '.png'))
for a in ['skate','chess','flower','duck','beach','soccer','moto','rocket','palm','horses','dog']:
    pairs.append((MSNR + 'avatars/' + a + '.png', 'msnr/avatars/' + a + '.png'))
pairs.append((MSNR + 'sounds/nudge.mp3', 'msnr/sounds/nudge.mp3'))
for m in ['newalert','newemail','online']:
    pairs.append((IA + 'newemail/' + m + '.mp3', 'ia/newemail/' + m + '.mp3'))
pairs.append((WIKI + 'en/e/ed/MSN_Messenger_logo.png', 'wiki/en/e/ed/MSN_Messenger_logo.png'))
pairs.append((WIKI + 'commons/c/cf/Bliss.jpg', 'wiki/commons/c/cf/Bliss.jpg'))
pairs.append((WIKI + 'en/3/34/Command_%26_Conquer_1995_cover.jpg', 'art/cnc.jpg'))
for gid in [10, 70, 30, 40]:
    pairs.append((STMT + str(gid) + '/header.jpg', 'steam/%d/header.jpg' % gid))
for gid, h in [(10,'6b0312cda02f5f777efa2f3318c307ff9acafbb5'),(70,'95be6d131fc61f145797317ca437c9765f24b41c'),
               (30,'aadc0ce51ff6ba2042d633f8ec033b0de62091d0'),(40,'c525f76c8bc7353db4fd74b128c4ae2028426c2a')]:
    pairs.append((COMM + str(gid) + '/' + h + '.jpg', 'steam/icons/%d.jpg' % gid))
pairs.append(('https://images.pcgamingwiki.com/9/90/StarCraft_Cover.png', 'art/starcraft_cover.png'))
pairs.append(('https://images.pcgamingwiki.com/6/6c/Total_Annihilation_Coverart.png', 'art/ta.png'))

# extra game screenshots/menu art filled in by download_screens.py — placeholder list stays empty here

def fetch(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    tmp = dest + '.part'
    with urllib.request.urlopen(req, timeout=90) as r, open(tmp, 'wb') as f:
        f.write(r.read())
    os.replace(tmp, dest)

ok = skip = fail = 0
failed = []
for url, rel in pairs:
    dest = os.path.join(ROOT, *rel.split('/'))
    if os.path.exists(dest) and os.path.getsize(dest) > 100:
        skip += 1
        continue
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    err = None
    for attempt in range(4):
        try:
            fetch(url, dest)
            err = None
            break
        except Exception as e:
            err = e
            time.sleep(1 + attempt)
    if err:
        fail += 1
        failed.append((rel, str(err)))
        print('FAIL', rel, err)
    else:
        ok += 1
print('DONE ok=%d skip=%d fail=%d total=%d' % (ok, skip, fail, len(pairs)))
sys.exit(0)
