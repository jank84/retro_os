/* ==========================================================================
   games.js — Steam (2003), Counter-Strike 1.5, StarCraft / Battle.net,
              Total Annihilation, Command & Conquer
   ========================================================================== */
'use strict';

/* ---------- shared helpers ---------- */
const Gameware = (() => {
  const el = WM.el;
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  function timers(win) {
    const ids = [];
    const add = (fn, ms, ...a) => ids.push(setTimeout(fn, ms, ...a));
    const loop = (fn, ms) => ids.push(setInterval(fn, ms));
    win.onClose = ((oc) => () => { ids.forEach(i => { clearTimeout(i); clearInterval(i); }); if (oc) oc(); })(win.onClose);
    return { add, loop };
  }
  /* black loading screen with console-style lines, then done() */
  function loadLines(host, lines, done, msPerLine, green) {
    host.innerHTML = '';
    host.style.background = '#000';
    const pre = el('pre');
    pre.style.cssText = 'color:' + (green ? '#39e639' : '#c8c8c8') + ';font:12px/1.5 "Courier New",monospace;padding:18px;margin:0;white-space:pre-wrap;';
    host.append(pre);
    let i = 0;
    const step = () => {
      if (i >= lines.length) { done(); return; }
      pre.textContent += lines[i] + '\n';
      i++;
      setTimeout(step, msPerLine || 320);
    };
    step();
  }
  /* ---- "require CD" mode (js/config.js) — borderless splash + insert-CD error ---- */
  const NOCD = {
    cs: { title: 'Counter-Strike 1.5', icon: ICON.cs, img: SCREENS.csMenu,
      err: 'Steam was unable to launch Counter-Strike 1.5.\n\nPlease insert the Counter-Strike CD-ROM into drive D: and click OK.\n\nOr download the 62 MB patch over ISDN.\nEstimated time remaining: long weekend.' },
    starcraft: { title: 'StarCraft', icon: ICON.starcraft, img: SCREENS.scLoading,
      err: 'Battle.net could not start StarCraft.\n\nPlease insert the StarCraft CD into drive D:.\n\nIf a CD is already in the drive, it is the wrong CD. It is always the wrong CD.' },
    ta: { title: 'Total Annihilation', icon: ICON.ta,   /* no splash art — straight to the error */
      err: 'Total Annihilation failed to start.\n\nPlease insert Total Annihilation CD 1 of 2 into drive D:.\n\nHave your CD key ready. It is on the inside of the manual, next to where the cat sleeps.' },
    cnc: { title: 'Command & Conquer', icon: ICON.cnc,  /* no splash art — straight to the error */
      err: 'A required .DLL file, VQA.DLL, was not found.\n\nPlease insert the Tiberian Dawn CD into drive D: and restart Windows.\n\n(Yes, restart Windows. It is 1996.)' },
    wow: { title: 'World of Warcraft', icon: ICON.wow, img: SCREENS.wowSplash,
      err: 'World of Warcraft could not connect to the logon server.\n\nPlease insert the World of Warcraft CD into drive D:.\n\nYou have been in the queue for 47 minutes.\nCurrent position: 3,812. Do not press Alt+F4.' }
  };
  const noCdWins = {};
  /* returns a truthy value when requireCd is on (splash overlay or direct error),
     null when full games are enabled */
  function splashOnly(key) {
    if (!(window.RETRO && RETRO.games && RETRO.games.requireCd)) return null;
    const g = NOCD[key];
    if (!g.img) {  /* no splash for this game — show the error dialog right away */
      if (noCdWins[key]) return 'open';
      noCdWins[key] = true;
      Sound.play('error');
      return WM.msg(g.title + ' - CD Required', g.err, { type: 'error', width: 430 })
        .then(() => { noCdWins[key] = false; });
    }
    if (noCdWins[key] && noCdWins[key].isConnected) return noCdWins[key];
    const layer = document.getElementById('windows-layer');
    const ov = el('div', 'nocd-splash');
    const img = el('img'); img.src = g.img; img.dataset.fb = g.icon; img.alt = '';
    ov.append(img);
    let top = 100;
    layer.querySelectorAll('.xp-win').forEach(w => { top = Math.max(top, parseInt(w.style.zIndex, 10) || 100); });
    ov.style.zIndex = top + 1;
    let t = null;
    const err = () => {
      if (!ov.isConnected) return;
      clearTimeout(t);
      Sound.play('error');
      WM.msg(g.title + ' - CD Required', g.err, { type: 'error', width: 430 }).then(() => ov.remove());
    };
    ov.addEventListener('click', err);  /* click skips the splash, like the real thing */
    layer.append(ov);
    noCdWins[key] = ov;
    t = setTimeout(err, 1700);
    return ov;
  }
  return { el, rnd, timers, loadLines, splashOnly };
})();

/* ================================================================
   STEAM — the 2003 client
================================================================ */
APPS.steam = (() => {
  const el = Gameware.el;
  let win = null;

  const GAMES = [
    { name: 'Counter-Strike 1.5', icon: ICON.cs, status: 'Ready', banner: GAMEART.csBanner, fb: ICON.csTile,
      desc: 'Terrorists vs Counter-Terrorists. The most played game on Steam. de_dust2 forever.',
      play: () => APPS.cs.launch() },
    { name: 'Half-Life', icon: ICON.hl, status: 'Ready', banner: GAMEART.hlBanner, fb: ICON.hlTile,
      desc: 'Resonance cascade at Black Mesa. Gordon Freeman, 0.7 seconds of destruction.',
      play: () => WM.msg('Half-Life', 'Please insert the Half-Life CD into drive D:.\n\n...You only own the "Greatest Hits" DVD, and it is in the car. Again.', { type: 'error' }) },
    { name: 'Day of Defeat', icon: ICON.dod, status: 'Not installed', banner: GAMEART.dodBanner, fb: ICON.csTile,
      desc: 'World War II multiplayer. Normandy never looked this pixelated.',
      play: () => WM.msg('Day of Defeat', 'Day of Defeat must be downloaded (612 MB).\n\nOver your ISDN line the estimated time is:\n\u2022 now: until Thursday\n\u2022 after your sister gets on the phone: until November', { type: 'info' }) },
    { name: 'Team Fortress Classic', icon: ICON.tfc, status: 'Not installed', banner: GAMEART.tfcBanner, fb: ICON.csTile,
      desc: 'Nine classes. One engineer sentry that wins every round. Pyro does not count.',
      play: () => WM.msg('Team Fortress Classic', 'Install requires 340 MB.\n\nWould you like to queue this download behind your 96 MB of Hotmail attachments? [Yes]', { type: 'info' }) }
  ];
  const FRIENDS = [
    ['bobby_nades', 'In-Game: cs_italy', 1], ['xX_DarkAngel_Xx', 'In-Game: de_dust2', 1],
    ['Sk3BoOl', 'Online', 1], ['moomin_99', 'In-Game: cs_assault', 1],
    ['frag_hound', 'Away', 0], ['Ice', 'Online', 1], ['Dr.Professor', 'Offline', 0],
    ['t VanqUish t', 'Offline', 0]
  ];
  const SERVERS = [
    ['Valve DS #2 (EU)', 'de_dust2', '24/32', '46 ms'], ['awwp only (no scoping)', 'de_dust2', '12/16', '89 ms'],
    ['PUG | competitive | 10man', 'cs_italy', '10/10', '23 ms'], ['aim_botz practice', 'cs_office', '3/10', '15 ms'],
    ['NOOB SAFE ZONE v:)",', 'de_aztec', '7/32', '310 ms'], ['User\u2019s Computer (LAN)', 'cs_assault', '2/16', '0 ms']
  ];

  function launch() {
    if (win && win.el.isConnected) { win.focus(); return win; }
    const body = el('div');
    body.className = 'steam-win';
    win = WM.openWindow({ title: 'Steam', icon: ICON.steam, app: 'steam', width: 590, height: 430, cls: 'steam-outer', body,
      menubar: [
        { label: '<u>G</u>ames', items: () => [
          { label: 'Play Counter-Strike 1.5', icon: ICON.cs, action: () => APPS.cs.launch() },
          '-',
          { label: 'Scan for games...', action: () => WM.msg('Steam', 'Game Scan complete.\n\nFound:\n\u2022 4 Steam games\n\u2022 1 cracked demo of Descent 3\n\u2022 471 files in C:\\ that are "not important"\n\u2022 StarCraft somewhere on a CD-RW labeled "DO NOT FORMAT"\n\u2022 A World of Warcraft retail box (unused, subscription too expensive)', { type: 'info' }) },
          '-',
          { label: 'Exit', action: () => win.close() }
        ]},
        { label: '<u>V</u>iew', items: () => [
          { label: 'Compact Mode', disabled: true },
          { label: 'Big Picture Mode', action: () => WM.msg('Steam', 'Big Picture Mode will be invented in 2012. You have proven you can time travel. Go back.', { type: 'info' }) }
        ]},
        { label: '<u>F</u>riends', items: () => [
          { label: 'Add a Friend...', action: () => WM.msg('Add a Friend', 'Enter your friend\u2019s Steam account name:\n\n(invite sent to billgates — he has not accepted. He never will.)', { type: 'info' }) },
          { label: 'Block a Cheater...', action: () => WM.msg('Report Player', 'Report submitted: "aim = cheat".\n\nVAC ban wave scheduled for next Tuesday. bobby_nades is worried.', { type: 'info' }) }
        ]},
        { label: '<u>H</u>elp', items: () => [
          { label: 'About Steam', action: () => WM.msg('Steam', 'Steam Beta 1.2\nThe universal download and game management system.\n\nSteam needs an Internet connection.\nYour modem has been detected. Please hold for 12 minutes.\n\n\u00a9 2003 Valve Corporation', { type: 'info' }) },
          { label: 'Steam Support', action: () => WM.msg('Steam Support', 'All support agents are currently helping someone whose download is "stuck at 99%".\n\nIt is not stuck. It is at 99%.', { type: 'info' }) }
        ]}
      ],
      status: 'Ready \u2014 Connected: valve-se-atl1 \u2014 Downloads: none' });

    const tabs = el('div', 'steam-tabs');
    ['GAMES', 'FRIENDS', 'SERVERS'].forEach((t, i) => {
      const tb = el('button', 'steam-tab' + (i === 0 ? ' on' : ''));
      tb.textContent = t;
      tb.addEventListener('click', () => {
        tabs.querySelectorAll('.steam-tab').forEach(x => x.classList.remove('on'));
        tb.classList.add('on');
        show(t.toLowerCase());
      });
      tabs.append(tb);
    });
    const content = el('div', 'steam-content');
    body.append(tabs, content);

    let sel = 0;
    function show(tab) {
      content.innerHTML = '';
      if (tab === 'games') {
        const list = el('div', 'steam-list');
        const detail = el('div', 'steam-detail');
        GAMES.forEach((g, i) => {
          const r = el('div', 'steam-item' + (i === sel ? ' on' : ''));
          r.innerHTML = '<img src="' + g.icon + '" data-fb="' + ICON.steam + '"><span>' + g.name + '</span><b class="st-' + (g.status === 'Ready' ? 'ok' : 'off') + '">' + g.status + '</b>';
          r.addEventListener('click', () => { sel = i; show('games'); });
          list.append(r);
        });
        const g = GAMES[sel];
        detail.innerHTML = '<img class="steam-banner" src="' + g.banner + '" data-fb="' + g.fb + '"><div class="steam-desc"><b>' + g.name + '</b><br>' + g.desc + '</div>' +
          '<div class="steam-actions"><button class="xp-btn steam-play">' + (g.status === 'Ready' ? 'Play' : 'Install Game...') + '</button></div>';
        detail.querySelector('.steam-play').addEventListener('click', g.play);
        content.append(list, detail);
      } else if (tab === 'friends') {
        const list = el('div', 'steam-list wide');
        FRIENDS.forEach(([n, s, on]) => {
          const r = el('div', 'steam-item');
          r.innerHTML = '<span class="fr-dot' + (on ? ' on' : '') + '"></span><span>' + n + '</span><b class="st-' + (on ? 'ok' : 'off') + '">' + s + '</b>';
          r.addEventListener('dblclick', () => WM.msg(n, 'Status: ' + s + '\nLast heard of: ' + (on ? 'shouting in cs_italy' : '2 weeks ago') + '\n\nUse Games \u203a to invite them to a private server.', { type: 'info' }));
          list.append(r);
        });
        content.append(list);
      } else {
        const t = el('table', 'steam-srv');
        t.innerHTML = '<tr><th>Server</th><th>Map</th><th>Players</th><th>Ping</th></tr>' +
          SERVERS.map(s => '<tr><td>' + s[0] + '</td><td>' + s[1] + '</td><td>' + s[2] + '</td><td>' + s[3] + '</td></tr>').join('');
        t.addEventListener('dblclick', e => {
          const row = e.target.closest('tr');
          if (!row || !row.children.length || row.children.length < 4) return;
          win.setStatus('Connecting to ' + row.children[0].textContent + '...');
          Gameware.timers(win).add(() => { APPS.cs.launch(); }, 900);
        });
        content.append(t);
      }
    }
    show('games');
    win.setStatus('Ready \u2014 Connected: valve-se-atl1 \u2014 4 friends in-game');
    Sound.play('nav', { vol: .4 });
    return win;
  }
  return { launch };
})();

/* ================================================================
   COUNTER-STRIKE 1.5 — Half-Life menu \u2192 server browser \u2192 HUD
================================================================ */
APPS.cs = (() => {
  const el = Gameware.el, rnd = Gameware.rnd;
  let win = null;

  const MAPS = ['de_dust2', 'cs_italy', 'de_aztec', 'cs_assault', 'de_nuke', 'cs_office'];
  const SRV = [
    ['Valve DS #2 (US)', 'de_dust2', '24/32', '46'],
    ['awwp only (no scoping!!)', 'de_dust2', '12/16', '89'],
    ['PUG | competitive | 10man', 'cs_italy', '10/10', '23'],
    ['aim_botz practice', 'cs_office', '3/10', '15'],
    ['de_aztec NO TEENS', 'de_aztec', '7/32', '310'],
    ['User\u2019s Computer (LAN)', 'cs_assault', '2/16', '0']
  ];
  const KILLS = ['bobby_nades', 'xX_DarkAngel_Xx', 'moomin_99', 'AWP_Dave', 'noScopeNancy', 'Kip', 't VanqUish t'];
  const NPC = ['headshot', 'fired his own HE grenade', 'fell off the map', 'the floor', 'a flashbang and dignity'];

  function launch() {
    const s = Gameware.splashOnly('cs'); if (s) return s;
    if (win && win.el.isConnected) { win.focus(); return win; }
    const body = el('div');
    body.className = 'cs-win';
    win = WM.openWindow({ title: 'Half-Life', icon: ICON.cs, app: 'cs', width: 500, height: 400, cls: 'cs-outer', body });
    menu();
    return win;
  }

  function menu() {
    win.setTitle('Half-Life');
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cs-menu');
    scr.innerHTML = '<img class="cs-bg" src="' + SCREENS.csMenu + '" data-fb="' + ICON.csTile + '" alt="">' +
      '<div class="cs-logo">COUNTER<span>-</span>STRIKE <i>1.5</i></div>';
    const btns = el('div', 'cs-btns');
    const mk = (label, fn) => { const x = el('button', 'cs-btn'); x.innerHTML = label; x.addEventListener('click', fn); btns.append(x); };
    mk('New Game', () => createGame());
    mk('Load Game', () => WM.msg('Load Game', 'No saved games found.\n\nCounter-Strike does not have a single player mode. This has not stopped anyone from trying.', { type: 'info' }));
    mk('Configuration', () => WM.msg('Configuration', 'Model: _GIGN_terrorist.mdl (obviously)\nRate: 25000\nSensitivity: 3 (everyone uses 3)\nRadar: on (still get flanked)', { type: 'info' }));
    mk('Join Game', () => browser());
    mk('Exit', () => win.close());
    scr.append(btns);
    b.append(scr);
  }

  function createGame() {
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cs-panel');
    scr.innerHTML = '<h3>Create Game</h3>' +
      '<label>Map:</label><select id="cs-map">' + MAPS.map(m => '<option>' + m + '</option>').join('') + '</select>' +
      '<label>Max players:</label><select id="cs-max"><option>16</option><option>32</option></select>' +
      '<div class="cs-tip">Server password: (leave empty, or nobody joins)</div>';
    const row = el('div', 'cs-row');
    const start = el('button', 'cs-btn wide'); start.textContent = 'Start';
    const back = el('button', 'cs-btn wide'); back.textContent = 'Back'; back.addEventListener('click', menu);
    start.addEventListener('click', () => loading('User\u2019s Computer (LAN)', scr.querySelector('#cs-map').value));
    row.append(back, start); scr.append(row);
    b.append(scr);
  }

  function browser() {
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cs-panel');
    scr.innerHTML = '<h3>Join Game \u2014 Internet Servers</h3>';
    const tbl = el('table', 'cs-srv');
    tbl.innerHTML = '<tr><th>Server</th><th>Map</th><th>Players</th><th>Ping</th></tr>';
    let chosen = 0;
    SRV.forEach((s, i) => {
      const tr = el('tr');
      tr.innerHTML = '<td>' + s[0] + '</td><td>' + s[1] + '</td><td>' + s[2] + '</td><td>' + s[3] + '</td>';
      tr.addEventListener('click', () => { tbl.querySelectorAll('tr').forEach(x => x.classList.remove('on')); tr.classList.add('on'); chosen = i; });
      tbl.append(tr);
    });
    scr.append(tbl);
    const row = el('div', 'cs-row');
    const back = el('button', 'cs-btn wide'); back.textContent = 'Back'; back.addEventListener('click', menu);
    const join = el('button', 'cs-btn wide default'); join.textContent = 'Join Game';
    join.addEventListener('click', () => {
      const s = SRV[chosen];
      if (+s[2].split('/')[0] === +s[2].split('/')[1]) { Sound.play('error'); return WM.msg('Join Game', 'Cannot connect to ' + s[0] + ': server is full. It is ALWAYS full.', { type: 'error' }); }
      loading(s[0], s[1]);
    });
    row.append(back, join); scr.append(row);
    b.append(scr);
  }

  function loading(server, map) {
    win.setTitle('Half-Life \u2014 ' + map);
    const b = win.body;
    Gameware.loadLines(b, [
      'Connecting to ' + (server.startsWith('User') ? 'loopback' : '207.173.195.' + (20 + Math.floor(Math.random() * 90))) + ':27015...',
      'VAC: secure server',
      'Downloading ' + map + '.bsp ... done (3.2 MB)',
      'Precaching models: 100%',
      'Spawning... done',
      '\n*** "Gang war in hell town, yo." ***\n'
    ], () => hud(server, map), 400);
  }

  function hud(server, map) {
    win.setTitle('Half-Life \u2014 ' + map + ' @ ' + server);
    const b = win.body; b.innerHTML = '';
    const T = Gameware.timers(win);
    const scr = el('div', 'cs-hud');
    scr.innerHTML = `
      <div class="cs-sky"></div><div class="cs-ground"></div>
      <div class="cs-cross">+</div>
      <div class="cs-radar"></div>
      <div class="cs-score"><span class="ct">CT 7</span> : <span class="t">9 T</span><div class="cs-map">${map}</div></div>
      <div class="cs-timer">1:45</div>
      <div class="cs-feed"></div>
      <div class="cs-msg">You picked up Kevlar + Helmet.</div>
      <div class="cs-nums">
        <div class="cs-n"><b id="hp">100</b><i>HEALTH</i></div>
        <div class="cs-n"><b id="ar">100</b><i>BATTERY</i></div>
        <div class="cs-n"><b id="ammo">30</b><i>7.62mm &mdash; 90</i></div>
      </div>
      <div class="cs-flash hidden"></div>
      <button class="cs-btn cs-disc">Disconnect</button>`;
    b.append(scr);
    scr.querySelector('.cs-disc').addEventListener('click', () => { win.setTitle('Half-Life'); menu(); });

    const feed = scr.querySelector('.cs-feed');
    const msg = scr.querySelector('.cs-msg');
    const hpEl = scr.querySelector('#hp'), ammoEl = scr.querySelector('#ammo');
    let hp = 100, ammo = 30;

    /* round timer */
    let secs = 105;
    T.loop(() => {
      secs = Math.max(0, secs - 1);
      scr.querySelector('.cs-timer').textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    }, 1000);

    /* kill feed */
    T.loop(() => {
      const v = rnd(KILLS), k = rnd(KILLS.filter(x => x !== v));
      const line = el('div', 'cs-kill');
      line.innerHTML = '<b class="ctn">' + (Math.random() < .5 ? 'CT' : 'T') + '</b> ' + k +
        ' <span class="wep">\u2020</span> ' + v + (Math.random() < .3 ? ' <span class="hs">HEADSHOT</span>' : '');
      feed.append(line);
      while (feed.children.length > 5) feed.firstChild.remove();
    }, 3800);

    /* ambient chatter */
    const CHAT = ['cover me, pushing B!', 'rush B no stop', "nice flash, i couldn't see the game or my future",
      'anyone got a deagle??', 'sniper in awp, as usual', 'shout A! shout A!!', 'omw omw', 'defusing... cover!!', 'go go go go'];
    T.loop(() => { msg.textContent = rnd(KILLS) + ': ' + rnd(CHAT); Sound.play('click'); }, 7000);

    /* you can shoot */
    scr.addEventListener('mousedown', e => {
      if (e.target.closest('.cs-disc')) return;
      ammo = Math.max(0, ammo - 1); ammoEl.textContent = ammo;
      Sound.play('icqError', { vol: .25 });
      if (!ammo) { ammo = 30; msg.textContent = 'You reloaded the M4A1.'; setTimeout(() => ammoEl.textContent = ammo, 900); }
      if (Math.random() < .16) {
        const v = rnd(KILLS);
        const line = el('div', 'cs-kill');
        line.innerHTML = '<b class="ctn">CT</b> You <span class="wep">\u2020</span> ' + v;
        feed.append(line);
        msg.textContent = 'You killed ' + v + '.';
      }
    });
    /* F = flashbang */
    document.addEventListener('keydown', function fk(e) {
      if (!win || !win.el.isConnected) { document.removeEventListener('keydown', fk); return; }
      if (e.key !== 'f' || document.activeElement !== document.body && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (!scr.isConnected) return;
      const fl = scr.querySelector('.cs-flash');
      fl.classList.remove('hidden'); fl.style.opacity = 1;
      let o = 1;
      const fade = setInterval(() => { o -= .08; fl.style.opacity = o; if (o <= 0) { clearInterval(fade); fl.classList.add('hidden'); } }, 60);
    });
    /* you will die. it is dust2. */
    T.add(() => {
      hp = 0; hpEl.textContent = '0';
      scr.querySelector('.cs-hud-dead') || (() => {
        const d = el('div', 'cs-dead');
        d.innerHTML = 'You were killed by <b>' + rnd(KILLS) + '</b> (' + rnd(NPC) + ')<br><small>RESPAWNING IN 3...</small>';
        scr.append(d);
      })();
      Sound.play('error', { vol: .5 });
      T.add(() => {
        const d = scr.querySelector('.cs-dead'); if (d) d.remove();
        hp = 100; hpEl.textContent = '100';
        msg.textContent = 'You spawned at Counter-Terrorist spawn. Do not rush alone.';
      }, 3200);
    }, 16000);
  }
  return { launch };
})();

/* ================================================================
   STARCRAFT — menu + Battle.net chat + fake mission
================================================================ */
APPS.starcraft = (() => {
  const el = Gameware.el, rnd = Gameware.rnd;
  let win = null;

  function launch() {
    const s = Gameware.splashOnly('starcraft'); if (s) return s;
    if (win && win.el.isConnected) { win.focus(); return win; }
    const body = el('div');
    body.className = 'sc-win';
    win = WM.openWindow({ title: 'StarCraft', icon: ICON.starcraft, app: 'starcraft', width: 520, height: 420, cls: 'sc-outer', body });
    menu();
    return win;
  }

  function menu() {
    win.setTitle('StarCraft');
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'sc-menu');
    scr.innerHTML = '<img class="sc-logo" src="' + ICON.scCover + '" data-fb="' + ICON.scTile + '"><div class="sc-sub">Remastered... in your heart.</div>';
    const btns = el('div', 'cs-btns');
    const mk = (label, fn) => { const x = el('button', 'cs-btn'); x.innerHTML = label; x.addEventListener('click', fn); btns.append(x); };
    mk('Single Player', single);
    mk('Battle.net', battleNet);
    mk('Exit', () => win.close());
    scr.append(btns);
    b.append(scr);
  }

  const MISSIONS = [
    ['Mission 1: The Hunt', 'Terran', 'Investigate the colony of Char. Build a base. Do not step on the creep. There is so much creep.'],
    ['Mission 2: Dust', 'Terran', 'Clear the zerg presence from Mar Sara with four marines and optimism.'],
    ['Mission 3: Automation', 'Terran', 'The enemy has vultures. You have a diary full of regrets.']
  ];
  function single() {
    win.setTitle('StarCraft \u2014 Campaign');
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cs-panel');
    scr.innerHTML = '<h3>Select Mission</h3><img class="sc-brief" src="' + SCREENS.scBriefing + '" data-fb="' + ICON.scTile + '" alt="briefing">';
    let sel = 0;
    const list = el('div');
    MISSIONS.forEach((m, i) => {
      const r = el('div', 'sc-mis' + (i === 0 ? ' on' : ''));
      r.innerHTML = '<b>' + m[0] + '</b><br><small>' + m[2] + '</small>';
      r.addEventListener('click', () => { sel = i; list.querySelectorAll('.sc-mis').forEach(x => x.classList.remove('on')); r.classList.add('on'); });
      list.append(r);
    });
    scr.append(list);
    const row = el('div', 'cs-row');
    const back = el('button', 'cs-btn wide'); back.textContent = 'Back'; back.addEventListener('click', menu);
    const go = el('button', 'cs-btn wide default'); go.textContent = 'Launch Mission';
    go.addEventListener('click', () => {
      const T = Gameware.timers(win);
      Gameware.loadLines(win.body, [
        'Loading mission: ' + MISSIONS[sel][0] + '...',
        'loading intro.avi',
        'loading units.dat ... 347 units, 0 of them friendly to your build order',
        'placing start location... found: next to the enemy.',
        'Unit Supply: 12/15',
        '\nMission failed - 12 Zerglings found your Command Center at 0:42.',
        '(Tip: a bunker is cheaper than grief.)'
      ], () => {
        const done = el('div', 'sc-fail');
        done.innerHTML = '<b>MISSION FAILED</b><br><small>"The enemies came from all sides." \u2014 your own logs</small>';
        const ok = el('button', 'cs-btn wide'); ok.textContent = 'Return to Menu'; ok.addEventListener('click', menu);
        done.append(el('br'), ok);
        win.body.append(done);
        Sound.play('error', { vol: .5 });
      }, 420);
    });
    back.addEventListener('click', menu);
    row.append(back, go); scr.append(row);
    b.append(scr);
  }

  const CHATTER = [
    ['[LoST]zPr0tos', 'anyone 2v2?'],
    ['CptObrien', 'brb mom needs the phone'],
    ['xX_DarkAngel_Xx', 'gg no re'],
    ['kerrigan_fan_99', 'the star is calling'],
    ['CptObrien', 'user2003: ur build order was beautiful. also: what is it'],
    ['[LoST]zPr0tos', 'dark templar is a state of mind'],
    ['CptObrien', 'my vulture got microed by a SCV lol'],
    ['kerrigan_fan_99', 'PSI location located']
  ];
  function battleNet() {
    win.setTitle('Battle.net');
    const b = win.body;
    const T = Gameware.timers(win);
    Gameware.loadLines(b, [
      'Connecting to useast.battle.net...',
      'Negotiating encryption... done',
      'Authoring character "user2003"... done',
      'Entering chat channel: StarCraft (1) ... done',
      '\nYou have joined the channel.'
    ], () => {
      b.innerHTML = '';
      const scr = el('div', 'sc-bn');
      scr.innerHTML = `
        <div class="sc-bn-head"><b>StarCraft (1)</b> \u2014 214 users online <span class="sc-you">user2003</span></div>
        <div class="sc-bn-body"><div class="sc-bn-log"></div>
          <div class="sc-bn-users"><b>Channel: StarCraft (1)</b><br>xX_DarkAngel_Xx<br>[LoST]zPr0tos<br>CptObrien<br>kerrigan_fan_99<br>user2003 (you)</div></div>
        <div class="sc-bn-in"><input class="xp-input" id="bn-in" placeholder="Say something..." maxlength="90"><button class="cs-btn" id="bn-send">Say</button><button class="cs-btn" id="bn-leave">Leave</button></div>`;
      b.append(scr);
      const log = scr.querySelector('.sc-bn-log');
      const line = (w, txt, me) => {
        const l = el('div', 'bn-line' + (me ? ' me' : ''));
        l.innerHTML = '<b>' + w + '</b> ' + txt.replace(/</g, '&lt;');
        log.append(l); log.scrollTop = log.scrollHeight;
      };
      line('***', 'Welcome to Battle.net, user2003. Be nice, or be banned. (banned: 3 times)', false);
      let ci = 0;
      T.loop(() => {
        if (ci < CHATTER.length) { line(CHATTER[ci][0], CHATTER[ci][1]); ci++; }
        else line(rnd(CHATTER.map(c => c[0])), rnd(['gg', 'wp', 'brb', '12 marine push?', 'reaver drop is the answer', 'lag!!', 'my modem just barked']));
      }, 4200);
      const inp = scr.querySelector('#bn-in');
      const send = () => {
        const v = inp.value.trim(); if (!v) return;
        line('user2003', v, true); inp.value = '';
        T.add(() => line(rnd(['[LoST]zPr0tos', 'CptObrien', 'xX_DarkAngel_Xx']), rnd(['lol true', 'agreed', 'what??', 'AFK? i was right here', 're']))
          , 1400);
      };
      scr.querySelector('#bn-send').addEventListener('click', send);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
      scr.querySelector('#bn-leave').addEventListener('click', menu);
      Sound.play('icqConnect', { vol: .5 });
    }, 500);
  }
  return { launch };
})();

/* ================================================================
   TOTAL ANNIHILATION — green menu, skirmish, loading quotes
================================================================ */
APPS.ta = (() => {
  const el = Gameware.el, rnd = Gameware.rnd;
  let win = null;

  const MAPS = ['Calyx', 'Mach2', 'WarCloud', 'Canyons', 'Welter'];
  const QUOTES = [
    'The clock is ticking, Commander.',
    'You can never have too many engineers.',
    'Your unit is ready. Your enemy\u2019s was ready ten minutes ago.',
    'Commander, our Kbot factory is under attack. Again.',
    'Radar: something big is moving in the fog. Probably a fatboy. Definitely a fatboy.',
    'Feature support: OFF. Cursed user detected.',
    'A core, a commander, and a bad plan are all you need.',
    'Build more metal extractors. No, more than that.'
  ];

  function launch() {
    const s = Gameware.splashOnly('ta'); if (s) return s;
    if (win && win.el.isConnected) { win.focus(); return win; }
    const body = el('div');
    body.className = 'ta-win';
    win = WM.openWindow({ title: 'Total Annihilation', icon: ICON.ta, app: 'ta', width: 480, height: 380, cls: 'ta-outer', body,
      menubar: [
        { label: '<u>F</u>ile', items: () => [{ label: 'Exit', action: () => win.close() }] },
        { label: '<u>O</u>ptions', items: () => [
          { label: 'Feature support', action: () => WM.msg('Options', 'Feature support: OFF\n\n(Cursed user. The cursor will now judge your decisions.)', { type: 'info' }) },
          { label: 'Sound: Digital', disabled: true }
        ]},
        { label: '<u>H</u>elp', items: () => [{ label: 'About', action: () => WM.msg('Total Annihilation', 'Total Annihilation\n(c) 1997 Cavedog Entertainment\n\nThe war between the Core and the Arm. You are somewhere in between, holding a megalaser and no plan.', { type: 'info' }) }] }
      ] });
    menu();
    return win;
  }

  function menu() {
    win.setTitle('Total Annihilation');
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'ta-menu');
    scr.innerHTML = '<div class="ta-logo">TOTAL<br>ANNIHILATION</div><div class="ta-sub">Core vs Arm \u2014 the eternal war</div>' +
      '<img class="ta-shot" src="' + SCREENS.taBattle + '" data-fb="' + ICON.taTile + '" alt="">';
    const btns = el('div', 'ta-btns');
    const mk = (label, fn) => { const x = el('button', 'ta-btn'); x.textContent = label; x.addEventListener('click', fn); btns.append(x); };
    mk('TUTORIAL', () => WM.msg('Tutorial', 'Tutorial 1: Build a constructor. Tutorial 2: It dies. Tutorial 3: Build another. Welcome to Total Annihilation.', { type: 'info' }));
    mk('SKIRMISH', skirmish);
    mk('CAMPAIGN', () => WM.msg('Campaign', 'The Core awaits, Commander.\n\nWarning: your last campaign save is from 1998 and the save file has since achieved sentience and refuses contact.', { type: 'info' }));
    mk('QUIT', () => win.close());
    scr.append(btns);
    b.append(scr);
  }

  function skirmish() {
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'ta-scr');
    scr.innerHTML = '<h3>SKIRMISH SETUP</h3><div class="ta-lbl">Map:</div>';
    let map = MAPS[0];
    const list = el('div', 'ta-maps');
    MAPS.forEach((m, i) => {
      const x = el('button', 'ta-btn' + (i === 0 ? ' on' : ''));
      x.textContent = m;
      x.addEventListener('click', () => { map = m; list.querySelectorAll('.ta-btn').forEach(y => y.classList.remove('on')); x.classList.add('on'); });
      list.append(x);
    });
    scr.append(list);
    scr.innerHTML += '<div class="ta-lbl">Start units: Medium \u2014 Enemies: 3 \u2014 Allies: 0 (as is tradition)</div>';
    const row = el('div', 'cs-row');
    const back = el('button', 'ta-btn'); back.textContent = 'BACK'; back.addEventListener('click', menu);
    const go = el('button', 'ta-btn on'); go.textContent = 'START BATTLE';
    go.addEventListener('click', () => battle(map));
    row.append(back, go); scr.append(row);
    b.append(scr);
  }

  function battle(map) {
    win.setTitle('Total Annihilation \u2014 ' + map);
    const b = win.body;
    Gameware.loadLines(b, [
      'Loading map: ' + map + '...',
      'Loading units: 600+ (all of them yours, theoretically)',
      QUOTES[0], QUOTES[7], QUOTES[1],
      'Placing commanders... yours is at the edge. Classic.',
      QUOTES[4],
      'INIT BATTLE'
    ], () => {
      b.innerHTML = '';
      const scr = el('div', 'ta-scr ta-battle');
      scr.innerHTML = '<div class="ta-green">[ LIVE BATTLE \u2014 ' + map + ' ]</div><div class="ta-log"></div>';
      b.append(scr);
      const log = scr.querySelector('.ta-log');
      const T = Gameware.timers(win);
      const put = t => { const l = el('div'); l.textContent = t; log.append(l); log.scrollTop = log.scrollHeight; };
      put('Commander online. Feature support: OFF.');
      T.add(() => put('Commander, we need an engineer, three tanks and a panic.'), 1600);
      T.add(() => put('Radar contact: 40 enemy units heading for your mass extractor.'), 3600);
      T.add(() => put('Radar contact: 41 enemy units heading for YOUR COMMANDER.'), 5600);
      T.add(() => {
        put('');
        const d = el('div', 'ta-defeat');
        d.innerHTML = 'DEFEAT<br><small>Your commander self-destructed. Statistically, this was you.</small><br>';
        const ok = el('button', 'ta-btn on'); ok.textContent = 'REBOOT CORE'; ok.addEventListener('click', menu);
        d.append(ok);
        log.append(d);
        Sound.play('error', { vol: .55 });
      }, 8000);
    }, 430, true);
  }
  return { launch };
})();

/* ================================================================
   COMMAND & CONQUER — Tiberian Dawn side select, briefing, sidebar
================================================================ */
APPS.cnc = (() => {
  const el = Gameware.el, rnd = Gameware.rnd;
  let win = null;

  const MISSIONS = {
    GDI: [
      ['Mission 1: Retake Tract 5', 'Recover the Tiberium field from Nod insurgents. Intelligence estimates: light resistance, heavy opinions.'],
      ['Mission 2: Attack on Temple Prime', 'The temple is a trap. The temple is ALWAYS a trap. Go anyway.']
    ],
    NOD: [
      ['Mission 1: Night of a Thousand Cans', 'Sabotage the GDI base. Stealth tanks: approved by nobody, used by everyone.'],
      ['Mission 2: Kane\u2019s Decapitation Strike', 'Bring down the GDI command center. Kane will be watching. He is always watching.']
    ]
  };
  const BRIEF = {
    GDI: 'General: Nod forces have entrenched on the Tiberium field. You are cleared for full engagement. Rules of engagement: whatever is in the sidebar. Good hunting.',
    NOD: 'Imagine... no more hunger. No more want. One future, forged in green crystal. Brotherhood: your temple needs one more brick. Bring a rocket buggy.'
  };

  function launch() {
    const s = Gameware.splashOnly('cnc'); if (s) return s;
    if (win && win.el.isConnected) { win.focus(); return win; }
    const body = el('div');
    body.className = 'cnc-win';
    win = WM.openWindow({ title: 'Command & Conquer', icon: ICON.cnc, app: 'cnc', width: 520, height: 410, cls: 'cnc-outer', body });
    menu();
    return win;
  }

  function menu() {
    win.setTitle('Command & Conquer');
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cnc-menu');
    scr.innerHTML = '<img class="cnc-shot" src="' + SCREENS.cncSplash + '" data-fb="' + ICON.cncTile + '" alt="">' +
      '<div class="cnc-logo">COMMAND &amp; CONQUER</div><div class="cnc-sub">TIBERIAN DAWN</div>';
    const btns = el('div', 'cs-btns');
    const mk = (label, fn) => { const x = el('button', 'cs-btn'); x.textContent = label; x.addEventListener('click', fn); btns.append(x); };
    mk('New Mission', () => select());
    mk('Skirmish', () => WM.msg('Skirmish', 'Skirmish mode: you vs 3 CPU allies who will beg for units and then lose them. Choose your suffering.', { type: 'info' }));
    mk('Exit', () => win.close());
    scr.append(btns);
    b.append(scr);
  }

  function select() {
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cs-panel cnc-panel');
    scr.innerHTML = '<h3>Choose your side</h3>';
    const sides = el('div', 'cnc-sides');
    const gdi = el('button', 'cnc-side'); gdi.innerHTML = '<b>GDI</b><br>Global Defense Initiative<br><small>lots of tanks, few ideas</small>';
    const nod = el('button', 'cnc-side nod'); nod.innerHTML = '<b>NOD</b><br>The Brotherhood<br><small>lasers, secrecy, temples</small>';
    let side = null;
    gdi.addEventListener('click', () => { side = 'GDI'; go.disabled = false; go.classList.add('default'); gdi.classList.add('on'); nod.classList.remove('on'); });
    nod.addEventListener('click', () => { side = 'NOD'; go.disabled = false; go.classList.add('default'); nod.classList.add('on'); gdi.classList.remove('on'); });
    sides.append(gdi, nod); scr.append(sides);
    const row = el('div', 'cs-row');
    const back = el('button', 'cs-btn wide'); back.textContent = 'Back'; back.addEventListener('click', menu);
    const go = el('button', 'cs-btn wide'); go.textContent = 'Continue'; go.disabled = true;
    go.addEventListener('click', () => missions(side));
    row.append(back, go); scr.append(row);
    b.append(scr);
  }

  function missions(side) {
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cs-panel cnc-panel');
    scr.innerHTML = '<h3>' + side + ' Missions</h3>';
    let sel = 0;
    const list = el('div');
    MISSIONS[side].forEach((m, i) => {
      const r = el('div', 'sc-mis' + (i === 0 ? ' on' : ''));
      r.innerHTML = '<b>' + m[0] + '</b><br><small>' + m[1] + '</small>';
      r.addEventListener('click', () => { sel = i; list.querySelectorAll('.sc-mis').forEach(x => x.classList.remove('on')); r.classList.add('on'); });
      list.append(r);
    });
    scr.append(list);
    const row = el('div', 'cs-row');
    const back = el('button', 'cs-btn wide'); back.textContent = 'Back'; back.addEventListener('click', select);
    const go = el('button', 'cs-btn wide default'); go.textContent = 'View Briefing';
    go.addEventListener('click', () => briefing(side, MISSIONS[side][sel]));
    row.append(back, go); scr.append(row);
    b.append(scr);
  }

  function briefing(side, m) {
    win.setTitle('Command & Conquer \u2014 ' + m[0]);
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cnc-brief');
    scr.innerHTML = '<img class="cnc-brief-img" src="' + (side === 'NOD' ? SCREENS.cncBriefNod : SCREENS.cncBriefGdi) + '" data-fb="' + ICON.cncTile + '" alt="">' +
      '<h3>' + m[0] + '</h3><div class="cnc-txt"></div>';
    const row = el('div', 'cs-row');
    const skip = el('button', 'cs-btn wide'); skip.textContent = 'Skip';
    const go = el('button', 'cs-btn wide default'); go.textContent = 'Accept Mission'; go.style.visibility = 'hidden';
    row.append(skip, go); scr.append(row);
    b.append(scr);
    const txt = scr.querySelector('.cnc-txt');
    const full = (side === 'NOD' ? 'Kane speaks:\n\n' : 'Command briefing:\n\n') + BRIEF[side] +
      '\n\nObjective: ' + m[1] + '\n\n' + (side === 'NOD' ? 'The future is green. Bring earplugs for the temple music.' : 'Tiberium is worth more than your base. Farm it. Regret nothing.');
    let i = 0;
    const typer = setInterval(() => {
      txt.textContent = full.slice(0, i += 3);
      if (i >= full.length) { clearInterval(typer); go.style.visibility = 'visible'; }
    }, 16);
    skip.addEventListener('click', () => { clearInterval(typer); txt.textContent = full; go.style.visibility = 'visible'; });
    go.addEventListener('click', () => play(side, m));
  }

  function play(side, m) {
    win.setTitle('C&C \u2014 LIVE: ' + m[0]);
    const b = win.body; b.innerHTML = '';
    const T = Gameware.timers(win);
    const scr = el('div', 'cnc-play');
    scr.innerHTML = `
      <div class="cnc-map"><div class="cnc-obj">Objective: ${m[1].replace(/</g, '&lt;')}</div><div class="cnc-units"></div></div>
      <div class="cnc-sidebar">
        <div class="cnc-pow"><b>POWER</b><div class="cnc-bar"><i></i></div></div>
        <div class="cnc-ready blink">UNIT READY.</div>
        <button class="cnc-dep">DEPLOY</button>
        <div class="cnc-cr">CREDITS<br><b id="cr">2450</b></div>
        <div class="cnc-mini"><b>UNIT</b><div id="u1">MGG</div><div id="u2">RF</div><div id="u3">GW</div></div>
        <button class="cs-btn cnc-flee">Withdraw</button>
      </div>`;
    b.append(scr);
    let credits = 2450;
    const map = scr.querySelector('.cnc-map');
    const crEl = scr.querySelector('#cr');
    scr.querySelector('.cnc-dep').addEventListener('click', () => {
      const u = el('div', 'cnc-unit');
      u.textContent = side === 'NOD' ? '\u25B2' : '\u25A0';
      u.style.left = (10 + Math.random() * 75) + '%';
      u.style.top = (15 + Math.random() * 65) + '%';
      map.append(u);
      credits -= 300; crEl.textContent = credits;
      Sound.play('ding', { vol: .4 });
    });
    map.addEventListener('click', e => {
      if (!e.target.closest('.cnc-unit')) return;
      const u = e.target.closest('.cnc-unit');
      u.classList.add('boom'); credits += 50; crEl.textContent = credits;
      T.add(() => u.remove(), 400);
    });
    scr.querySelector('.cnc-flee').addEventListener('click', menu);
    let n = 0;
    T.loop(() => { credits += 45; crEl.textContent = credits; if (++n % 6 === 0) Sound.play('click'); }, 2500);
    /* nuke event */
    T.add(() => {
      const fl = el('div', 'cnc-nuke');
      fl.textContent = 'NUCLEAR STRIKE LAUNCHED';
      scr.append(fl);
      Sound.play('icqError', { vol: .5 });
      T.add(() => {
        scr.innerHTML = '';
        const f = el('div', 'cnc-fail');
        f.innerHTML = '<b>MISSION FAILED</b><br><small>Your base was vaporized. The cleanup crew sends regards.</small><br>';
        const ok = el('button', 'cs-btn default'); ok.textContent = 'Return to Menu'; ok.addEventListener('click', menu);
        f.append(ok); scr.append(f);
        Sound.play('error', { vol: .55 });
      }, 2600);
    }, 40000);
  }
  return { launch };
})();

/* ================================================================
   WORLD OF WARCRAFT — 2004 launcher + login-queue gag
   (only reachable as a full window when config games.requireCd=false)
   ================================================================ */
APPS.wow = (() => {
  const el = Gameware.el;
  let win = null;

  function launch() {
    const s = Gameware.splashOnly('wow'); if (s) return s;
    if (win && win.el.isConnected) { win.focus(); return win; }
    const body = el('div');
    body.className = 'wow-win';
    win = WM.openWindow({ title: 'World of Warcraft', icon: ICON.wow, app: 'wow', width: 470, height: 410, cls: 'wow-outer', body });
    menu();
    return win;
  }

  function menu() {
    win.setTitle('World of Warcraft');
    const b = win.body; b.innerHTML = '';
    const scr = el('div', 'cs-panel wow-menu');
    scr.innerHTML = '<img class="wow-logo" src="' + SCREENS.wowSplash + '" data-fb="' + ICON.wow + '" alt="">' +
      '<div class="sc-sub">Patch 1.12.1 — Drums of War</div>';
    const btns = el('div', 'cs-btns');
    const mk = (label, fn) => { const x = el('button', 'cs-btn'); x.textContent = label; x.addEventListener('click', fn); btns.append(x); };
    mk('Enter Azeroth', () => login());
    mk('Options', () => WM.msg('Options', 'Graphics: Low (the fan sounds like a 747 either way)\nAddons: 47 installed, 3 updated this decade\nDistance clip: far enough', { type: 'info' }));
    scr.append(btns); b.append(scr);
  }

  function login() {
    const b = win.body; b.innerHTML = '';
    const T = Gameware.timers(win);
    const scr = el('div', 'cs-panel');
    scr.innerHTML = '<h3>Logging in — Durotar (PvP)</h3>';
    const bar = el('div'); bar.style.cssText = 'width:80%;height:14px;border:1px solid #555;background:#111;margin:6px auto 0';
    const fill = el('div'); fill.style.cssText = 'height:100%;width:3%;background:#7a5c1e;transition:width 1.2s';
    bar.append(fill);
    const pos = el('div', 'sc-sub'); pos.style.marginTop = '10px';
    scr.append(bar, pos);
    b.append(scr);
    let n = 0;
    T.loop(() => {
      n++;
      fill.style.width = Math.min(3 + n * 4, 100) + '%';
      pos.textContent = 'Queue position: ' + Math.max(4313 - n * 187, 1) + ' of 4,313';
      if (n === 6) {
        Sound.play('error');
        WM.msg('World of Warcraft', 'You have been disconnected from the World of Warcraft logon server.\n\nReason: DB30 — Your product key is already in use.\n\nSomewhere, in another time zone, is another you. And they got to Elwynn first.', { type: 'error', width: 440 });
      }
    }, 1400);
  }
  return { launch };
})();
