# audit: every asset path referenced in JS must exist under assets/
import re, os

ROOT = r'D:\dateien\programmierung\retro_os\assets'
files = ['js/assets.js', 'js/sounds.js', 'js/main.js', 'js/apps.js', 'js/msn.js', 'js/icq.js', 'js/games.js', 'js/wm.js', 'js/boot.js']
js = ''
for f in files:
    js += open(os.path.join(os.path.dirname(os.path.abspath(__file__)), f), encoding='utf-8').read()

prefix = {
    'I': 'w32/images/xp/icons/',
    'CDN.w32': 'w32/', 'CDN.shiz': 'shiz/', 'CDN.msnr': 'msnr/', 'CDN.ia': 'ia/', 'CDN.wiki': 'wiki/',
    'S.w32': 'w32/', 'S.ia': 'ia/', 'S.msnr': 'msnr/',
}
pat = re.compile(r"(I|CDN\.w32|CDN\.shiz|CDN\.msnr|CDN\.ia|CDN\.wiki|S\.w32|S\.ia|S\.msnr)\s*\+\s*'([^']+)'")
missing = []
for k, v in pat.findall(js):
    p = os.path.join(ROOT, *prefix[k].split('/'), *v.split('/'))
    if not os.path.exists(p):
        missing.append(prefix[k] + v)

# dynamic: MSW.d(i) -> digit0-9, MSW.open(i) -> open1-8, AVA(n) -> avatars used in msn.js
for i in range(10):
    p = os.path.join(ROOT, 'shiz', 'minesweeper', 'digit%d.png' % i)
    if not os.path.exists(p): missing.append('shiz/minesweeper/digit%d.png' % i)
for i in range(1, 9):
    p = os.path.join(ROOT, 'shiz', 'minesweeper', 'open%d.png' % i)
    if not os.path.exists(p): missing.append('shiz/minesweeper/open%d.png' % i)
for n in re.findall(r"ava: '(\w+)'|AVA\('(\w+)'\)", js):
    name = n[0] or n[1]
    p = os.path.join(ROOT, 'msnr', 'avatars', name + '.png')
    if not os.path.exists(p): missing.append('msnr/avatars/%s.png' % name)
# 'assets/...' literal paths (game art/screens)
for v in re.findall(r"'(assets/[^']+)'", js):
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), *v.split('/'))
    if not os.path.exists(p): missing.append(v)

print('MISSING:', missing if missing else 'NONE — all referenced assets are on disk')
