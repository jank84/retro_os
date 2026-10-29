# Real menu / briefing / splash screenshots + original game icons for the game windows.
import os, time, urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

pairs = [
    # CS 1.5 — real main menu backgrounds + original desktop icon (Counter Strike wiki; fandom serves WebP)
    ('https://static.wikia.nocookie.net/cswikia/images/7/7d/Cstrike15background.png/revision/latest?cb=20240622163423', 'screens/cs_menu.webp'),
    ('https://static.wikia.nocookie.net/cswikia/images/8/82/Cstrike15italy.png/revision/latest?cb=20240622163513', 'screens/cs_menu_italy.webp'),
    ('https://static.wikia.nocookie.net/cswikia/images/2/2e/Cstrike15_icon.png/revision/latest?cb=20240622162514', 'art/cs15.webp'),
    # StarCraft — real briefing-room screenshot (Wikipedia)
    ('https://upload.wikimedia.org/wikipedia/en/c/c3/Briefing_room_%28StarCraft%29.png', 'screens/sc_briefing.png'),
    # StarCraft — original loading screen (MobyGames CDN)
    ('https://cdn.mobygames.com/267a2694-ac0e-11ed-902e-02420a00012d.webp', 'screens/sc_loading.webp'),
    # StarCraft desktop icon source (needs white-bg removal, see below):
    #   https://images.launchbox-app.com/r2_49ee86f0-c5b9-455d-b44b-499f8779d56f.png
    #   magick icon.png -alpha set -bordercolor none -border 2 -fuzz 7% -fill none \
    #     -draw 'color 0,0 floodfill' -trim +repage -background none -gravity center \
    #     -extent '%[fx:max(w,h)]x%[fx:max(w,h)]' -resize 128x128 assets/art/starcraft.png
    # Total Annihilation — real gameplay screenshot (Wikipedia)
    ('https://upload.wikimedia.org/wikipedia/en/9/9a/Total_annihilation_screenie_3.1415926.jpg', 'screens/ta_battle.jpg'),
    # C&C Tiberian Dawn — real mission briefing screens + in-engine splash + original game icon (CNC wiki)
    ('https://static.wikia.nocookie.net/cnc_gamepedia_en/images/8/88/GDI1.png/revision/latest?cb=20180801164530', 'screens/cnc_brief_gdi.webp'),
    ('https://static.wikia.nocookie.net/cnc_gamepedia_en/images/a/a9/Nod1.png/revision/latest?cb=20180801164524', 'screens/cnc_brief_nod.webp'),
    ('https://static.wikia.nocookie.net/cnc_gamepedia_en/images/e/e4/CNCTD_Promo_Art.jpg/revision/latest?cb=20180801163843', 'screens/cnc_splash.webp'),
    ('https://static.wikia.nocookie.net/cnc_gamepedia_en/images/6/61/TD_Gameicon.png/revision/latest?cb=20180801164149', 'art/cncicon.webp'),
]

import os, subprocess, sys

def fetch(url, dest):
    ref = 'https://www.fandom.com/'
    if '/cswikia/' in url:
        ref = 'https://counterstrike.fandom.com/wiki/Counter-Strike_1.5/Gallery'
    elif '/cnc_gamepedia_en/' in url:
        ref = 'https://cnc.fandom.com/wiki/File:GDI1.png'
    args = ['curl.exe', '-s', '--fail', '-L', '--retry', '3', '--max-time', '90',
            '-A', UA,
            '-H', 'Referer: ' + ref,
            '-H', 'Accept: image/png,image/jpeg;q=0.9,*/*;q=0.5',
            url, '-o', dest]
    r = subprocess.run(args)
    if r.returncode != 0 or not os.path.exists(dest) or os.path.getsize(dest) < 500:
        raise RuntimeError('curl exit %s' % r.returncode)

ok = skip = fail = 0
for url, rel in pairs:
    dest = os.path.join(ROOT, *rel.split('/'))
    if os.path.exists(dest) and os.path.getsize(dest) > 500:
        skip += 1; continue
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    try:
        fetch(url, dest); ok += 1; print('ok  ', rel, os.path.getsize(dest))
    except Exception as e:
        fail += 1; print('FAIL', rel, e)
print('DONE ok=%d skip=%d fail=%d' % (ok, skip, fail))
sys.exit(1 if fail else 0)
