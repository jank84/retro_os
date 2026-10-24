/* ==========================================================================
   main.js — desktop, start menu, quick launch, tray, screensaver, session
   ========================================================================== */
'use strict';

const Main = (() => {
  const $ = id => document.getElementById(id);
  const el = WM.el;

  let user = 'User';
  let wired = false;
  let wallpaperUrl = WALLP.bliss;

  /* ================================================================
     WALLPAPER
  ================================================================ */
  function applyWallpaper(url) {
    const desk = $('desktop');
    const paint = u => {
      wallpaperUrl = u;
      desk.style.background = '#3a6ea5 url("' + u + '") center / cover no-repeat fixed';
    };
    const probe = new Image();
    probe.onerror = () => { if (url !== WALLP.blissHQ) paint(WALLP.blissHQ); };
    probe.onload = () => paint(url);
    probe.src = url;
  }
  function setWallpaper(url) { applyWallpaper(url); }

  /* ================================================================
     DESKTOP ICONS
  ================================================================ */
  const SLOT_W = 84, SLOT_H = 96, OX = 4, OY = 2;
  let icons = [];            /* { node, def, slot, deleted } */
  let rubber = null;
  let recycleIcon = null;    /* the recycle-bin desktop icon entry */

  const DEFS = [
    { id: 'mycomputer', label: 'My Computer', icon: ICON.myComputer, app: 'explorer-mycomputer' },
    { id: 'mydocuments', label: 'My Documents', icon: ICON.myDocuments, app: 'explorer-documents' },
    { id: 'mypictures', label: 'My Pictures', icon: ICON.myPictures, app: 'explorer-pictures' },
    { id: 'recyclebin', label: 'Recycle Bin', icon: ICON.recycleEmpty, app: 'explorer-recyclebin', recycle: true },
    { id: 'ie', label: 'Internet Explorer', icon: ICON.ie, app: 'iexplore' },
    { id: 'email', label: 'E-mail', icon: ICON.email, act: () => WM.launch('iexplore', 'http://www.msn.com') },
    { id: 'msn', label: 'MSN Messenger', icon: ICON.msn, app: 'msn' },
    { id: 'icq', label: 'ICQ 2003', icon: ICQ_FLOWER, app: 'icq' },
    { id: 'cmd', label: 'Command Prompt', icon: ICON.cmd, app: 'cmd' },
    { id: 'notepad', label: 'Notepad', icon: ICON.notepad, app: 'notepad' },
    { id: 'paint', label: 'Paint', icon: ICON.paint, app: 'paint' },
    { id: 'mines', label: 'Minesweeper', icon: ICON.mines, app: 'mines' },
    { id: 'wmp', label: 'Windows Media Player', icon: ICON.wmp, app: 'wmp' }
  ];

  function deskSize() {
    const r = $('desktop').getBoundingClientRect();
    return { w: r.width, h: r.height };
  }
  function rowsPerCol() {
    return Math.max(3, Math.floor((deskSize().h - OY * 2) / SLOT_H));
  }
  function slotPos(i) {
    const rc = rowsPerCol();
    return { x: OX + Math.floor(i / rc) * SLOT_W, y: OY + (i % rc) * SLOT_H };
  }
  function usedSlotSet() {
    const s = new Set();
    icons.forEach(ic => { if (!ic.deleted && ic.slot != null) s.add(ic.slot); });
    return s;
  }
  function firstFreeSlot() {
    const used = usedSlotSet();
    let i = 0; while (used.has(i)) i++;
    return i;
  }

  function buildDesktopIcons() {
    const desk = $('desktop');
    desk.querySelectorAll('.desktop-icon').forEach(n => n.remove());
    icons = [];
    DEFS.forEach((def, i) => addIcon(def, i));
    recycleIcon = icons.find(ic => ic.def.recycle) || null;
    refreshRecycleIcon();
    if (!rubber) { rubber = el('div'); rubber.id = 'rubber'; rubber.style.cssText = 'left:-30px;top:-30px;width:0;height:0;'; desk.append(rubber); }
  }

  /* desktop background interactions — attached only once */
  function wireDesktop() {
    const desk = $('desktop');
    desk.addEventListener('mousedown', e => {
      if (e.target !== desk) return;
      if (e.button !== 0) return;
      select(null);
      WM.closeStartMenu();
      const sr = { x: e.clientX, y: e.clientY };
      const dr = desk.getBoundingClientRect();
      let moved = false;
      rubber.style.display = 'block';
      const mv = ev => {
        const x = Math.min(ev.clientX, sr.x) - dr.left, y = Math.min(ev.clientY, sr.y) - dr.top;
        const w = Math.abs(ev.clientX - sr.x), h = Math.abs(ev.clientY - sr.y);
        if (w + h > 6) moved = true;
        if (!moved) return;
        rubber.style.left = x + 'px'; rubber.style.top = y + 'px';
        rubber.style.width = w + 'px'; rubber.style.height = h + 'px';
        const box = { l: x, t: y, r: x + w, b: y + h };
        icons.forEach(ic => {
          if (ic.deleted) return;
          const r = { l: ic.node.offsetLeft, t: ic.node.offsetTop, r: ic.node.offsetLeft + ic.node.offsetWidth, b: ic.node.offsetTop + ic.node.offsetHeight };
          ic.node.classList.toggle('sel', r.l < box.r && r.r > box.l && r.t < box.b && r.b > box.t);
        });
      };
      const up = () => {
        document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up);
        rubber.style.display = 'none';
        if (!moved) { rubber.style.left = '-10px'; rubber.style.top = '-10px'; }
      };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    });

    desk.addEventListener('contextmenu', e => {
      if (e.target !== desk) return;
      e.preventDefault();
      WM.contextMenu(e.clientX, e.clientY, [
        { label: 'Arrange Icons', action: () => { DEFS.forEach((d, i) => { const ic = icons.find(x => x.def === d); if (ic) { ic.slot = i; position(ic, slotPos(i)); } }); } },
        { label: 'Refresh', action: () => { applyWallpaper(wallpaperUrl); flashDesktop(); } },
        '-',
        {
          label: 'New', sub: [
            { label: 'Text Document', icon: ICON.txt, action: newTextDocument }
          ]
        },
        '-',
        { label: 'Properties', icon: ICON.display, action: () => WM.launch('display') }
      ]);
    });

    /* Delete key removes selected user files */
    document.addEventListener('keydown', e => {
      if (e.key !== 'Delete') return;
      if ($('desktop-root').classList.contains('hidden')) return;
      const t = document.activeElement;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      icons.filter(ic => ic.node.classList.contains('sel') && ic.def.deletable && !ic.deleted).forEach(ic => deleteIcon(ic));
    });
  }

  function flashDesktop() {
    const d = $('desktop');
    d.style.filter = 'brightness(.2)';
    setTimeout(() => { d.style.filter = ''; }, 90);
  }

  function newTextDocument() {
    let n = 1;
    while (icons.some(ic => ic.def.label === (n === 1 ? 'New Text Document.txt' : 'New Text Document (' + n + ').txt'))) n++;
    const label = n === 1 ? 'New Text Document.txt' : 'New Text Document (' + n + ').txt';
    const def = { id: 'txt' + Date.now(), label, icon: ICON.txt, deletable: true, act: () => WM.launch('notepad', label.replace(/\.txt$/i, '')) };
    addIcon(def, firstFreeSlot());
    /* XP selects the new file ready to rename — select it here */
    select(icons[icons.length - 1]);
  }

  function addIcon(def, slot) {
    const desk = $('desktop');
    const node = el('div', 'desktop-icon');
    node.style.position = 'absolute';
    const img = el('img', 'ic'); img.src = def.icon; img.dataset.fb = def.recycle ? ICON.recycleEmpty : GENERIC_APP_ICON;
    img.draggable = false;
    const lbl = el('div', 'lbl'); lbl.textContent = def.label;
    node.append(img, lbl);
    desk.append(node);
    const entry = { node, def, slot, deleted: false };
    icons.push(entry);
    position(entry, slotPos(slot));

    node.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      startIconDrag(entry, e);
    });
    node.addEventListener('dblclick', e => {
      e.stopPropagation();
      openIcon(entry);
    });
    node.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation();
      select(entry);
      const items = [
        { label: 'Open', strong: true, action: () => openIcon(entry) }
      ];
      if (entry.def.recycle) {
        items.push({ label: 'Empty Recycle Bin', icon: ICON.critical, disabled: !Shell.binFull(), action: () => WM.launch('explorer-recyclebin') });
        items.push({ label: 'Restore All Items', disabled: !Shell.binFull(), action: () => { Shell.restoreAll(); reAddDeleted(); } });
      }
      items.push('-');
      items.push({ label: 'Delete', disabled: !entry.def.deletable, action: () => deleteIcon(entry) });
      items.push({ label: 'Properties', action: () => WM.msg(entry.def.label, 'Type: ' + (entry.def.deletable ? 'Text Document' : 'System Folder') + '\nLocation: Desktop\nCreated: ' + new Date(Date.now() - 86400e3 * 365).toDateString(), { type: 'info' }) });
      WM.contextMenu(e.clientX, e.clientY, items);
    });
    return entry;
  }

  function position(ic, p) { ic.node.style.left = p.x + 'px'; ic.node.style.top = p.y + 'px'; }

  function startIconDrag(ic, e) {
    const desk = $('desktop');
    const dr = desk.getBoundingClientRect();
    const ox = e.clientX - ic.node.offsetLeft - dr.left;
    const oy = e.clientY - ic.node.offsetTop - dr.top;
    const sx = e.clientX, sy = e.clientY;
    let dragging = false, clicked = false;
    const mv = ev => {
      if (!dragging && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 6) dragging = true;
      if (dragging) {
        ic.node.style.zIndex = 5;
        ic.node.style.left = Math.max(0, Math.min(dr.width - ic.node.offsetWidth, ev.clientX - ox - dr.left)) + 'px';
        ic.node.style.top = Math.max(0, Math.min(dr.height - ic.node.offsetHeight, ev.clientY - oy - dr.top)) + 'px';
      }
    };
    const up = ev => {
      document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up);
      if (dragging) {
        ic.node.style.zIndex = '';
        /* snap to nearest free slot */
        const cx = ic.node.offsetLeft + ic.node.offsetWidth / 2, cy = ic.node.offsetTop + ic.node.offsetHeight / 2;
        const rc = rowsPerCol();
        let best = null, bestD = 1e9;
        const maxSlots = rc * 20;
        const used = usedSlotSet();
        for (let i = 0; i < maxSlots; i++) {
          if (used.has(i) && i !== ic.slot) continue;
          const p = slotPos(i);
          const d = Math.hypot(p.x + SLOT_W / 2 - cx, p.y + SLOT_H / 2 - cy);
          if (d < bestD) { bestD = d; best = i; }
        }
        if (best != null) { ic.slot = best; position(ic, slotPos(best)); }
      } else {
        select(ic, ev.ctrlKey);
        clicked = true;
      }
    };
    document.addEventListener('mousemove', mv);
    document.addEventListener('mouseup', up);
  }

  function select(ic, additive) {
    icons.forEach(x => { if (x !== ic) x.node.classList.remove('sel'); });
    if (ic) ic.node.classList.add('sel');
  }

  function openIcon(ic) {
    if (ic.def.act) return ic.def.act();
    if (ic.def.app) return WM.launch(ic.def.app);
  }

  function deleteIcon(ic) {
    ic.deleted = true;
    ic.node.remove();
    Shell.addToBin({ name: ic.def.label, icon: ic.def.icon, from: 'desktop', ref: ic });
    refreshRecycleIcon();
  }
  function reAddDeleted() {
    icons.forEach(ic => {
      if (ic.deleted && ic.def.deletable) {
        ic.deleted = false;
        $('desktop').append(ic.node);
        position(ic, slotPos(firstFreeSlot()));
      }
    });
    refreshRecycleIcon();
  }

  function refreshRecycleIcon() {
    if (!recycleIcon) return;
    const full = Shell.binFull();
    recycleIcon.node.querySelector('img.ic').src = full ? ICON.recycleFull : ICON.recycleEmpty;
  }

  /* keep the recycle icon + desktop in sync with bin changes */
  function hookShell() {
    ['addToBin', 'emptyBin', 'restoreAll'].forEach(m => {
      if (Shell['_' + m]) return;
      Shell['_' + m] = Shell[m];
      Shell[m] = function () { const r = Shell['_' + m].apply(Shell, arguments); refreshRecycleIcon(); if (m === 'restoreAll') reAddDeleted(); return r; };
    });
  }

  /* ================================================================
     START MENU
  ================================================================ */
  function buildStartMenu() {
    $('sm-avatar').src = ICON.userTile; $('sm-avatar').dataset.fb = ICON.myComputer;
    $('sm-user').textContent = user;
    $('sm-logoff').querySelector('img').src = ICON.logoff;
    $('sm-shutdown').querySelector('img').src = ICON.power;

    const pinned = $('sm-pinned'); pinned.innerHTML = '';
    pinned.append(
      WM.smItem(ICON.ie, 'Internet Explorer', { action: () => WM.launch('iexplore') }, true),
      WM.smItem(ICON.email, 'E-mail', { action: () => WM.launch('iexplore', 'http://www.msn.com') }, true)
    );

    const freq = $('sm-frequent'); freq.innerHTML = '';
    [
      [ICON.msn, 'MSN Messenger', () => WM.launch('msn')],
      [ICQ_FLOWER, 'ICQ 2003', () => WM.launch('icq')],
      [ICON.wmp, 'Windows Media Player', () => WM.launch('wmp')],
      [ICON.notepad, 'Notepad', () => WM.launch('notepad')],
      [ICON.paint, 'Paint', () => WM.launch('paint')],
      [ICON.mines, 'Minesweeper', () => WM.launch('mines')],
      [ICON.cmd, 'Command Prompt', () => WM.launch('cmd')]
    ].forEach(([i, l, a]) => freq.append(WM.smItem(i, l, { action: a })));

    const rt = $('sm-right-top'); rt.innerHTML = '';
    rt.append(
      WM.smItem(ICON.myDocuments, 'My Documents', { action: () => WM.launch('explorer-documents') }, false, true),
      WM.smItem(ICON.myPictures, 'My Pictures', { action: () => WM.launch('explorer-pictures') }, false, true),
      WM.smItem(ICON.myMusic, 'My Music', { action: () => WM.msg('My Music', 'My Music contains 1 file:\n\nlinkin_park_in_the_end.wma (3.9 MB)\nLast synced to your MP3 player: 2 weeks ago', { type: 'info' }) }, false, true),
      WM.smItem(ICON.myComputer, 'My Computer', { action: () => WM.launch('explorer-mycomputer') }, false, true)
    );
    const rm = $('sm-right-mid'); rm.innerHTML = '';
    rm.append(
      WM.smItem(ICON.folder, 'Recent Documents', { action: () => WM.msg('Recent Documents', 'You have no recent documents. Well... you have Notepad, go write something.', { type: 'info' }) }, false, true),
      WM.smItem(ICON.controlPanel, 'Control Panel', { action: () => WM.launch('control') }, false, true),
      WM.smItem(ICON.appWindow, 'Set Program Access and Defaults', { action: () => WM.msg('Set Program Access and Defaults', 'Choose a configuration:\n\n\u25CF Use default Microsoft programs\n\u25CB Enable all available programs (for power users...)\n\nNothing here has ever been changed by anyone.', { type: 'info' }) }, false, true)
    );
    const rb = $('sm-right-bottom'); rb.innerHTML = '';
    rb.append(
      WM.smItem(ICON.help, 'Help and Support', { action: () => WM.launch('help') }, false, true),
      WM.smItem(ICON.search, 'Search', { action: () => WM.launch('search') }, false, true),
      WM.smItem(ICON.run, 'Run...', { action: () => WM.runDialog() }, false, true)
    );

    buildProgramsFlyout();

    const ap = $('sm-allprograms');
    ap.querySelector('img').src = ICON.programs;
    ap.onclick = showFlyout;
    ap.onmouseenter = showFlyout;

    if (!wired) {
      $('sm-logoff').addEventListener('click', () => { WM.closeStartMenu(); Boot.logoff(); });
      $('sm-shutdown').addEventListener('click', () => { WM.closeStartMenu(); Boot.turnOffDialog(); });
    }
  }

  const PROGRAMS = [
    {
      label: 'Accessories', icon: ICON.folder, sub: [
        { label: 'Notepad', icon: ICON.notepad, action: () => WM.launch('notepad') },
        { label: 'Calculator', icon: ICON.calc, action: () => WM.launch('calc') },
        { label: 'Paint', icon: ICON.paint, action: () => WM.launch('paint') },
        { label: 'Command Prompt', icon: ICON.cmd, action: () => WM.launch('cmd') },
        '-',
        {
          label: 'Entertainment', icon: ICON.folder, sub: [
            { label: 'Windows Media Player', icon: ICON.wmp, action: () => WM.launch('wmp') },
            { label: 'Sound Recorder', icon: ICON.volume, action: () => WM.msg('Sound Recorder', 'No sound recorder hardware was detected.\n\n(Try humming into the microphone you do not have.)', { type: 'info' }) }
          ]
        }
      ]
    },
    {
      label: 'Games', icon: ICON.folder, sub: [
        { label: 'Minesweeper', icon: ICON.mines, action: () => WM.launch('mines') },
        { label: 'Solitaire', icon: ICON.solitaire, action: () => WM.msg('Solitaire', 'Solitaire is starting...\n\nError: too many solitaires. You already played 347 games this year. Go outside.', { type: 'error' }) },
        { label: '3D Pinball for Windows - Space Cadet', icon: ICON.catalog, action: () => WM.msg('3D Pinball', 'Cannot start 3D Pinball.\n\nThe 1990s called, they want their graphics card back.', { type: 'error' }) }
      ]
    },
    {
      label: 'Communications', icon: ICON.folder, sub: [
        { label: 'MSN Messenger', icon: ICON.msn, action: () => WM.launch('msn') },
        { label: 'ICQ 2003', icon: ICQ_FLOWER, action: () => WM.launch('icq') }
      ]
    },
    '-',
    { label: 'Internet Explorer', icon: ICON.ie, action: () => WM.launch('iexplore'), strong: true },
    { label: 'Windows Catalog', icon: ICON.catalog, action: () => WM.launch('iexplore', 'http://catalog.microsoft.com') },
    {
      label: 'Windows Update', icon: ICON.update, action: () => WM.msg('Windows Update', 'Scanning for updates...\n\n127 important updates are available.\nYour last visit: January 2003.\n\nNobody visits anymore, not even you.', { type: 'info' })
    }
  ];

  function buildProgramsFlyout() {
    const fly = $('sm-programs-flyout');
    fly.innerHTML = '';
    fillFlyout(fly, PROGRAMS);
    /* clean submenus whenever the start menu hides */
    const obs = new MutationObserver(() => {
      if ($('start-menu').classList.contains('hidden')) {
        fly.classList.add('hidden');
        fly.querySelectorAll('.sm-sub').forEach(s => s.remove());
      }
    });
    if (!fly._obs) { fly._obs = obs; obs.observe($('start-menu'), { attributes: true, attributeFilter: ['class'] }); }
  }

  function fillFlyout(container, tree) {
    tree.forEach(it => {
      if (it === '-') { container.append(el('div', 'ctx-sep')); return; }
      const row = WM.smItem(it.icon || ICON.appWindow, it.label, {
        arrow: it.sub ? 1 : 0,
        action: it.sub ? null : () => { WM.closeStartMenu(); it.action(); }
      }, it.strong, true);
      row.style.position = 'relative';
      if (it.sub) {
        row.addEventListener('mouseenter', () => {
          container.querySelectorAll(':scope > .sm-sub').forEach(s => s.remove());
          const sub = el('div', 'ctx-menu sm-sub');
          sub.style.position = 'absolute';
          sub.style.left = 'calc(100% - 6px)';
          sub.style.top = '-4px';
          fillFlyout(sub, it.sub);
          container.append(sub);
          /* keep inside viewport bottom */
          const b = sub.getBoundingClientRect();
          if (b.bottom > window.innerHeight - 34) sub.style.top = (parseInt(sub.style.top || 0) - (b.bottom - window.innerHeight + 34)) + 'px';
        });
        row.addEventListener('mouseleave', e => {
          const related = e.relatedTarget;
          const sub = container.querySelector(':scope > .sm-sub');
          if (sub && related && !sub.contains(related) && related !== row) setTimeout(() => {
            const s2 = container.querySelector(':scope > .sm-sub');
            if (s2 && !s2.matches(':hover') && !row.matches(':hover')) s2.remove();
          }, 350);
        });
      }
      container.append(row);
    });
  }

  function showFlyout() {
    const fly = $('sm-programs-flyout');
    fly.classList.remove('hidden');
    fly.style.maxHeight = (window.innerHeight - 130) + 'px';
    fly.style.overflowY = 'auto';
  }

  /* ================================================================
     QUICK LAUNCH
  ================================================================ */
  function buildQuickLaunch() {
    const ql = $('quick-launch');
    ql.innerHTML = '';
    const mk = (icon, title, fb, fn) => {
      const b = el('div', 'ql-btn');
      const i = el('img'); i.src = icon; i.dataset.fb = fb || GENERIC_APP_ICON; i.draggable = false;
      b.append(i); b.title = title;
      b.addEventListener('click', fn);
      ql.append(b);
    };
    mk(ICON.desktop, 'Show Desktop', ICON.appWindow, () => {
      WM.wins.forEach(w => { if (!w.isMin) w.minimize(); });
    });
    mk(ICON.ie, 'Internet Explorer', ICON.ieAlt, () => WM.launch('iexplore'));
    mk(ICON.wmp9, 'Windows Media Player', ICON.wmp, () => WM.launch('wmp'));
    mk(ICON.msnTray, 'MSN Messenger', ICON.msn, () => WM.launch('msn'));
    mk(ICQ_FLOWER, 'ICQ 2003', ICQ_FLOWER, () => WM.launch('icq'));
  }

  /* ================================================================
     TRAY
  ================================================================ */
  function buildTray() {
    const tray = $('tray-icons');
    tray.innerHTML = '';

    WM.addTray('network', ICON.network, 'Local Area Connection — Status: Connected', () => {
      WM.msg('Local Area Connection Status',
        'Connection\n\nStatus:\t\tConnected\nDuration:\t3 days, 4:12:09\nSpeed:\t\t100.0 Mbps\n\nActivity\nSent:     12,482 packets     14,208,771 bytes\nReceived: 11,970 packets     8,932,104 bytes', { type: 'info' });
    });

    const vol = WM.addTray('volume', ICON.volume, 'Volume — click: mute / unmute   double-click: mixer', () => {
      Sound.setMuted(!Sound.muted);
      vol.el.title = Sound.muted ? 'Volume — MUTED (click to unmute)' : 'Volume — click: mute / unmute   double-click: mixer';
      vol.img.style.filter = Sound.muted ? 'grayscale(1) brightness(1.6)' : '';
      if (!Sound.muted) Sound.play('ding', { vol: .5 });
    });
    vol.el.addEventListener('dblclick', () => {
      const body = el('div');
      body.style.cssText = 'padding:14px;font-size:11px;';
      body.innerHTML = '<div style="text-align:center;font-weight:bold;margin-bottom:12px;">Volume</div>' +
        '<div style="display:flex;align-items:center;gap:8px;"><span>Volume</span><input type="range" min="0" max="100" id="vol-slider" style="flex:1;"></div>' +
        '<label style="display:flex;align-items:center;gap:6px;margin-top:10px;"><input type="checkbox" id="vol-mute"> Mute all</label>';
      const w = WM.openWindow({ title: 'Volume', icon: ICON.volume, width: 260, height: 170, minimizable: false, maximizable: false, resizable: false, body });
      const sl = body.querySelector('#vol-slider'), ck = body.querySelector('#vol-mute');
      sl.value = Math.round(Sound.volume * 100);
      ck.checked = Sound.muted;
      sl.addEventListener('input', () => { Sound.setVolume(sl.value / 100); Sound.play('click'); });
      ck.addEventListener('change', () => { Sound.setMuted(ck.checked); vol.img.style.filter = ck.checked ? 'grayscale(1) brightness(1.6)' : ''; });
    });

    WM.addTray('security', ICON.alert, 'Windows Security Center — your computer might be at risk', () => {
      WM.dialog({
        title: 'Windows Security Center',
        icon: ICON.critical,
        text: 'Your computer might be at risk.\n\n\u2022 Windows Firewall: OFF\n\u2022 Antivirus: NAV 2003 (virus definitions from 1998)\n\u2022 Automatic Updates: "Notify me, but don\'t do anything" (recommended by nobody)\n\nFix them all now?',
        buttons: [{ label: 'Fix', value: true, def: true }, { label: 'Later', value: false }]
      }).then(v => {
        if (v) WM.balloon('Windows Security Center', 'Problem fixed! Everything is now pretend-fine.', ICON.success);
      });
    });

    APPS.msn.initTray();
    APPS.icq.initTray();
  }

  /* ================================================================
     SCREENSAVER (Mystify-style)
  ================================================================ */
  const SS = { on: false, raf: 0, idleT: 0, shapes: [], IDLE: 180000 };
  function resetIdle() {
    clearTimeout(SS.idleT);
    if (SS.on) ssStop();
    SS.idleT = setTimeout(ssStart, SS.IDLE);
  }
  function ssStart() {
    if (SS.on) return;
    SS.on = true;
    const scr = $('screensaver'), cv = $('screensaver-canvas');
    scr.classList.add('on');
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#000'; cx.fillRect(0, 0, cv.width, cv.height);
    SS.shapes = [];
    for (let s = 0; s < 3; s++) {
      const pts = [];
      for (let i = 0; i < 4; i++) pts.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, vx: (Math.random() - .5) * 4, vy: (Math.random() - .5) * 4 });
      SS.shapes.push({ pts, hue: Math.random() * 360 });
    }
    let last = 0;
    const step = t => {
      if (!SS.on) return;
      if (t - last > 33) {
        last = t;
        cx.fillStyle = 'rgba(0,0,0,0.08)';
        cx.fillRect(0, 0, cv.width, cv.height);
        SS.shapes.forEach(sh => {
          sh.hue = (sh.hue + 1.4) % 360;
          cx.strokeStyle = 'hsl(' + sh.hue + ', 90%, 60%)';
          cx.beginPath();
          sh.pts.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > cv.width) p.vx *= -1;
            if (p.y < 0 || p.y > cv.height) p.vy *= -1;
            p.x = Math.max(0, Math.min(cv.width, p.x));
            p.y = Math.max(0, Math.min(cv.height, p.y));
            i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y);
          });
          cx.closePath(); cx.stroke();
        });
      }
      SS.raf = requestAnimationFrame(step);
    };
    SS.raf = requestAnimationFrame(step);
  }
  function ssStop() {
    if (!SS.on) return;
    SS.on = false;
    cancelAnimationFrame(SS.raf);
    $('screensaver').classList.remove('on');
    resetIdle();
  }

  /* ================================================================
     GLOBAL WIRING
  ================================================================ */
  function wireGlobals() {
    wireDesktop();
    $('start-button').addEventListener('click', e => {
      e.stopPropagation();
      WM.toggleStartMenu();
    });
    document.addEventListener('mousedown', e => {
      const sm = $('start-menu');
      if (!sm.classList.contains('hidden') && !sm.contains(e.target) && !document.getElementById('start-button').contains(e.target)) {
        WM.closeStartMenu();
      }
    });
    document.addEventListener('mousemove', resetIdle);
    document.addEventListener('mousedown', resetIdle);
    document.addEventListener('keydown', e => {
      resetIdle();
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement && document.activeElement.tagName);
      if (e.key === 'Meta' && !e.repeat && !typing) { e.preventDefault(); WM.toggleStartMenu(); }
      if (e.key === 'Escape') WM.closeStartMenu();
      if (e.key === 'd' && e.metaKey) { e.preventDefault(); WM.wins.forEach(w => { if (!w.isMin) w.minimize(); }); }
    });
    window.addEventListener('resize', () => {
      if ($('desktop-root').classList.contains('hidden')) return;
      icons.forEach(ic => { if (!ic.deleted && ic.slot != null) position(ic, slotPos(ic.slot)); });
    });
  }

  /* ================================================================
     LOGIN BALLOONS
  ================================================================ */
  function scheduleBalloons() {
    setTimeout(() => WM.balloon('MSN Messenger', 'jess88 <3, Dave [GfG] and 3 more friends are online. Double-click the MSN Messenger icon — they are waiting for you!', ICON.msn), 6000);
    setTimeout(() => WM.balloon('ICQ', '2 people tried to reach you while you were offline. Connect your ICQ number 688-200-314.', ICQ_FLOWER), 11000);
    setTimeout(() => WM.balloon('Your computer might be at risk', 'Windows Firewall is turned off. Click the shield icon in the notification area to fix this.', ICON.critical), 18000);
    setTimeout(() => WM.balloon('Windows Update', 'It looks like you have notifications waiting. 127 updates available since January 2003.', ICON.update), 34000);
  }

  /* ================================================================
     SESSION
  ================================================================ */
  function onLogin(u) {
    user = u || 'User';
    hookShell();
    applyWallpaper(wallpaperUrl);
    buildDesktopIcons();
    buildStartMenu();
    buildQuickLaunch();
    buildTray();
    if (!wired) { wireGlobals(); wired = true; }
    scheduleBalloons();
    resetIdle();
    Sound.play('nav', { vol: .3 });
  }

  function closeAllWindows() {
    WM.closeAllMenus();
    WM.closeStartMenu();
    try { if (APPS.msn.isOnline()) APPS.msn.signOff(); } catch (e) { }
    try { if (APPS.icq.isOnline()) APPS.icq.signOff(); } catch (e) { }
    WM.wins.forEach(w => { w.onBeforeClose = null; w.close(); });
  }

  return { onLogin, setWallpaper, closeAllWindows, get user() { return user; } };
})();

/* ================= kick off the whole thing ================= */
Boot.bootSequence();
