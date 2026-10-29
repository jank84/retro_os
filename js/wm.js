/* ==========================================================================
   wm.js — window manager, taskbar, menus, dialogs, balloons, tray, run-box
   ========================================================================== */
'use strict';

/* app registry — filled by apps.js / msn.js / icq.js */
const APPS = {};

const WM = (() => {
  const deskLayer = () => document.getElementById('windows-layer');
  const menusLayer = () => document.getElementById('menus-layer');
  let zTop = 100;
  let activeWin = null;
  const wins = [];
  const trayItems = {};

  /* -------------------------------------------------- helpers */
  function el(tag, cls, attrs) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function iconImg(url, size, fb) {
    const i = el('img');
    i.src = url || ICON.appWindow;
    if (fb) i.dataset.fb = fb;
    if (size) { i.width = size; i.height = size; }
    i.draggable = false;
    return i;
  }
  function desktopRect() {
    const r = deskLayer().getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  /* -------------------------------------------------- windows */
  function openWindow(cfg) {
    cfg = cfg || {};
    const d = desktopRect();
    const w = Math.min(cfg.width || 460, d.w - 8);
    const h = Math.min(cfg.height || 340, d.h - 8);
    const x = cfg.x != null ? cfg.x : Math.max(0, Math.round((d.w - w) / 2) + (wins.length % 6) * 18 - 40);
    const y = cfg.y != null ? cfg.y : Math.max(0, Math.round((d.h - h) / 2.4) + (wins.length % 6) * 16 - 30);

    const we = el('div', 'xp-win' + (cfg.cls ? ' ' + cfg.cls : ''));
    we.style.width = w + 'px'; we.style.height = h + 'px';
    we.style.left = x + 'px'; we.style.top = y + 'px';
    we.style.zIndex = ++zTop;

    /* title bar */
    const tb = el('div', 'xp-title');
    const tIcon = iconImg(cfg.icon, 16); tIcon.className = 'xp-title-icon';
    const tText = el('span', 'xp-title-text'); tText.textContent = cfg.title || 'Application';
    const btns = el('div', 'xp-title-btns');
    const bMin = el('button', 'xp-tb min', { title: 'Minimize' }); bMin.innerHTML = '&#8211;';
    const bMax = el('button', 'xp-tb max', { title: 'Maximize' }); bMax.innerHTML = '&#9633;';
    const bCls = el('button', 'xp-tb close', { title: 'Close' }); bCls.innerHTML = '&#10005;';
    if (cfg.minimizable === false) bMin.style.display = 'none';
    if (cfg.maximizable === false) bMax.style.display = 'none';
    if (cfg.closable === false) bCls.style.display = 'none';
    btns.append(bMin, bMax, bCls);
    tb.append(tIcon, tText, btns);
    we.append(tb);

    /* menu bar */
    let mbEl = null;
    if (cfg.menubar) {
      mbEl = el('div', 'xp-menubar');
      buildMenubar(mbEl, cfg.menubar, we);
      we.append(mbEl);
    }

    /* toolbar */
    if (cfg.toolbar) we.append(cfg.toolbar);

    /* body */
    const body = el('div', 'xp-body');
    if (typeof cfg.body === 'string') body.innerHTML = cfg.body;
    else if (cfg.body) body.append(cfg.body);
    we.append(body);

    /* status bar */
    let statusEl = null;
    if (cfg.status) {
      statusEl = el('div', 'xp-status');
      if (typeof cfg.status === 'string') statusEl.textContent = cfg.status;
      else statusEl.append(cfg.status);
      we.append(statusEl);
    }

    deskLayer().append(we);

    const win = {
      id: 'w' + Date.now() + Math.floor(Math.random() * 1e5),
      el: we, body, name: cfg.app || '', data: {},
      title: tText, tIconEl: tIcon, statusEl,
      setTitle(t) { tText.textContent = t; if (win.tkBtn) win.tkBtn.querySelector('span').textContent = t; },
      setIcon(u) { tIcon.src = u; if (win.tkBtn) win.tkBtn.querySelector('img').src = u; },
      setStatus(t) { if (win.statusEl) { if (typeof t === 'string') win.statusEl.textContent = t; else { win.statusEl.innerHTML = ''; win.statusEl.append(t); } } },
      focus() { focusWin(win); },
      close() { doClose(win); },
      minimize() { doMin(win); },
      maximize() { toggleMax(win); },
      flash(on) { if (win.tkBtn) win.tkBtn.classList.toggle('flash', on !== false); },
      isMin: false, isMax: false
    };
    we._win = win;
    wins.push(win);

    /* resize handle (needs the win object, so created here) */
    if (cfg.resizable !== false) {
      const rz = el('div', 'xp-resizer');
      we.append(rz);
      attachResize(win, rz);
    }

    /* taskbar button */
    const tk = el('div', 'tk-btn');
    tk.append(iconImg(cfg.icon, 16), Object.assign(el('span'), { textContent: cfg.title || 'Application' }));
    tk.addEventListener('click', () => {
      if (win.isMin) { restoreWin(win); }
      else if (activeWin === win) { doMin(win); }
      else { focusWin(win); }
    });
    document.getElementById('task-buttons').append(tk);
    win.tkBtn = tk;
    win.setTitle(cfg.title || 'Application');

    bMin.addEventListener('click', e => { e.stopPropagation(); doMin(win); });
    bMax.addEventListener('click', e => { e.stopPropagation(); toggleMax(win); });
    bCls.addEventListener('click', e => { e.stopPropagation(); doClose(win); });
    tb.addEventListener('dblclick', e => { if (e.target === bMin || e.target === bMax || e.target === bCls) return; if (cfg.maximizable !== false) toggleMax(win); });
    tb.addEventListener('mousedown', () => focusWin(win));
    we.addEventListener('mousedown', () => focusWin(win));
    we.addEventListener('contextmenu', e => { if (!cfg.appContext) e.stopPropagation(); });

    attachDrag(win);
    focusWin(win);
    return win;
  }

  function focusWin(win) {
    if (!win) return;
    wins.forEach(w => w.el.classList.toggle('inactive', w !== win));
    wins.forEach(w => w.tkBtn && w.tkBtn.classList.remove('active'));
    win.el.style.zIndex = ++zTop;
    activeWin = win;
    win.el.classList.remove('inactive');
    if (win.tkBtn) { win.tkBtn.classList.add('active'); win.tkBtn.classList.remove('flash'); }
    deskLayer().style.pointerEvents = 'none';
  }

  function doMin(win) {
    if (win.isMin) return;
    Sound.play('minimize', { vol: .5 });
    win._rect = { left: win.el.style.left, top: win.el.style.top, width: win.el.style.width, height: win.el.style.height };
    win.el.classList.add('minning');
    setTimeout(() => { win.el.style.display = 'none'; win.el.classList.remove('minning'); }, 180);
    win.isMin = true;
    if (win.tkBtn) win.tkBtn.classList.remove('active');
    if (activeWin === win) { activeWin = null; const nx = wins.filter(w => !w.isMin).pop(); if (nx) focusWin(nx); }
    if (win.onMin) win.onMin();
  }

  function restoreWin(win) {
    win.el.style.display = '';
    win.el.style.animation = 'win-pop .12s ease-out';
    win.isMin = false;
    focusWin(win);
    if (win.onRestore) win.onRestore();
  }

  function toggleMax(win) {
    if (win.isMax) {
      const r = win._rect || {};
      win.el.style.left = r.left; win.el.style.top = r.top;
      win.el.style.width = r.width; win.el.style.height = r.height;
      win.isMax = false;
      win.el.querySelector('.xp-tb.max').innerHTML = '&#9633;';
    } else {
      win._rect = { left: win.el.style.left, top: win.el.style.top, width: win.el.style.width, height: win.el.style.height };
      win.el.style.left = '0px'; win.el.style.top = '0px';
      const d = desktopRect();
      win.el.style.width = d.w + 'px'; win.el.style.height = d.h + 'px';
      win.isMax = true;
      win.el.querySelector('.xp-tb.max').innerHTML = '&#9633;'; /* same box glyph, XP-like */
    }
    Sound.play('restore', { vol: .4 });
    if (win.onResize) win.onResize();
  }

  function doClose(win) {
    if (win.onBeforeClose) { const r = win.onBeforeClose(); if (r && r.then) { r.then(v => { if (v) hardClose(win); }); return; } else if (!r) return; }
    hardClose(win);
  }
  function hardClose(win) {
    win.el.classList.add('closing');
    setTimeout(() => win.el.remove(), 110);
    if (win.tkBtn) win.tkBtn.remove();
    wins.splice(wins.indexOf(win), 1);
    if (activeWin === win) { activeWin = null; const nx = wins.filter(w => !w.isMin).pop(); if (nx) focusWin(nx); }
    if (win.onClose) win.onClose();
  }

  /* -------------------------------------------------- drag & resize */
  function attachDrag(win) {
    const tb = win.el.querySelector('.xp-title');
    tb.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      if (e.target.closest('.xp-tb')) return;
      const we = win.el;
      let sx = e.clientX, sy = e.clientY;
      let ox = we.offsetLeft, oy = we.offsetTop;
      let moved = false;
      const move = ev => {
        moved = true;
        if (win.isMax) {
          const rect = win._rect || {};
          const w = parseFloat(rect.width) || 400;
          win.isMax = false;
          we.style.width = w + 'px'; we.style.height = (parseFloat(rect.height) || 300) + 'px';
          ox = ev.clientX - w / 2; we.style.left = ox + 'px';
          oy = ev.clientY - 12; we.style.top = oy + 'px';
          sx = ev.clientX; sy = ev.clientY;
          ox = 0; oy = 0;
          const nx = ev.clientX - sx, ny = ev.clientY - sy;
          we.style.left = Math.max(0, Math.min(desktopRect().w - w, nx)) + 'px';
          we.style.top = Math.max(0, Math.min(desktopRect().h - 28, ny)) + 'px';
          return;
        }
        const d = desktopRect();
        let nx = ox + ev.clientX - sx, ny = oy + ev.clientY - sy;
        nx = Math.max(-we.offsetWidth + 60, Math.min(d.w - 40, nx));
        ny = Math.max(0, Math.min(d.h - 28, ny));
        we.style.left = nx + 'px'; we.style.top = ny + 'px';
      };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  function attachResize(win, handle) {
    handle.addEventListener('mousedown', e => {
      if (e.button !== 0 || win.isMax) return;
      e.stopPropagation();
      const we = win.el;
      const sx = e.clientX, sy = e.clientY;
      const sw = we.offsetWidth, sh = we.offsetHeight;
      const move = ev => {
        const d = desktopRect();
        we.style.width = Math.max(160, Math.min(d.w - we.offsetLeft, sw + ev.clientX - sx)) + 'px';
        we.style.height = Math.max(60, Math.min(d.h - we.offsetTop, sh + ev.clientY - sy)) + 'px';
        if (win.onResize) win.onResize();
      };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  /* -------------------------------------------------- menus */
  let menuOpen = false;
  function closeAllMenus() {
    menusLayer().querySelectorAll('.ctx-menu').forEach(m => m.remove());
    document.querySelectorAll('.mb-item.open').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.ctx-item.open').forEach(m => m.classList.remove('open'));
    menuOpen = false;
  }
  function buildMenuTree(items, opts) {
    opts = opts || {};
    const m = el('div', 'ctx-menu');
    if (opts.width) m.style.minWidth = opts.width + 'px';
    let hoverSub = null;
    items.forEach(it => {
      if (it === '-' || (it && it.sep)) { m.append(el('div', 'ctx-sep')); return; }
      const row = el('div', 'ctx-item' + (it.disabled ? ' disabled' : ''));
      const g = el('span', 'ci-gutter');
      if (it.icon) g.append(iconImg(it.icon, 16));
      else if (it.checked) g.innerHTML = '&#10004;';
      const lbl = el('span', 'ci-label'); lbl.innerHTML = it.label;
      row.append(g, lbl);
      if (it.sub) { const a = el('span', 'ci-arrow'); a.innerHTML = '&#9654;'; row.append(a); }
      m.append(row);
      row.addEventListener('mouseenter', () => {
        m.querySelectorAll('.ctx-item.open').forEach(r => r.classList.remove('open'));
        if (hoverSub) { hoverSub.remove(); hoverSub = null; }
        if (it.sub) {
          row.classList.add('open');
          hoverSub = buildMenuTree(it.sub);
          const r = row.getBoundingClientRect();
          hoverSub.style.left = (m.getBoundingClientRect().right - 2) + 'px';
          hoverSub.style.top = (r.top - 4) + 'px';
          menusLayer().append(hoverSub);
        }
      });
      row.addEventListener('click', e => {
        e.stopPropagation();
        if (it.sub) return;
        closeAllMenus();
        Sound.play('menu', { vol: .3 });
        if (it.action) it.action();
      });
    });
    return m;
  }
  function contextMenu(x, y, items, width) {
    closeAllMenus();
    const m = buildMenuTree(items, { width });
    menusLayer().append(m);
    const r = m.getBoundingClientRect();
    if (r.right > innerWidth) m.style.left = (x - r.width) + 'px'; else m.style.left = x + 'px';
    if (r.bottom > innerHeight - 30) m.style.top = Math.max(0, y - r.height) + 'px'; else m.style.top = y + 'px';
    menuOpen = true;
    return m;
  }
  function buildMenubar(mb, def, win) {
    def.forEach(item => {
      const mi = el('div', 'mb-item');
      mi.innerHTML = item.label;
      mb.append(mi);
      const open = () => {
        if (menuOpen && mi.classList.contains('open')) { closeAllMenus(); return; }
        closeAllMenus();
        menuOpen = true; mi.classList.add('open');
        Sound.play('menu', { vol: .25 });
        const tree = typeof item.items === 'function' ? item.items(win) : item.items;
        const m = buildMenuTree(tree, {});
        const r = mi.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = r.bottom + 'px';
        menusLayer().append(m);
      };
      mi.addEventListener('mousedown', e => { e.stopPropagation(); open(); });
      mi.addEventListener('mouseenter', () => { if (menuOpen && document.querySelector('#menus-layer .ctx-menu')) { closeAllMenus(); mi.classList.add('open'); menuOpen = true; const tree = typeof item.items === 'function' ? item.items(win) : item.items; const m = buildMenuTree(tree, {}); const r = mi.getBoundingClientRect(); m.style.left = r.left + 'px'; m.style.top = r.bottom + 'px'; menusLayer().append(m); } });
    });
  }
  document.addEventListener('mousedown', () => { if (menuOpen) closeAllMenus(); });

  /* -------------------------------------------------- dialogs */
  function dialog(cfg) {
    return new Promise(resolve => {
      const box = el('div', 'dlg-flex');
      const ic = el('img', 'dlg-ico'); ic.src = cfg.icon || ICON.info; ic.dataset.fb = ICON.info;
      const txt = el('div', 'dlg-text');
      if (typeof cfg.text === 'string') txt.textContent = cfg.text; else if (cfg.text) txt.append(cfg.text);
      box.append(ic, txt);
      const btns = el('div', 'dlg-btns');
      const win = openWindow({
        title: cfg.title || 'Message', icon: cfg.icon || ICON.appWindow,
        width: cfg.width || 380, height: 'auto',
        minimizable: false, maximizable: false, resizable: false, cls: 'xp-dialog',
        body: (() => { const b = el('div'); b.style.padding = '14px 14px 10px'; b.append(box, btns); return b; })()
      });
      if (cfg.height === 'auto' || !cfg.height) { win.el.style.height = (win.el.scrollHeight + 40) + 'px'; win.el.style.maxHeight = ''; }
      const buttons = cfg.buttons || [{ label: 'OK', value: 'ok', def: true }];
      buttons.forEach(b => {
        const btn = el('button', 'xp-btn' + (b.def ? ' default' : ''));
        btn.textContent = b.label;
        btn.addEventListener('click', () => { resolve(b.value); win.close(); });
        btns.append(btn);
        if (b.def) setTimeout(() => btn.focus(), 30);
      });
      win.onClose = () => resolve(buttons.length === 1 ? buttons[0].value : null);
    });
  }
  function msg(title, text, opts) {
    opts = opts || {};
    const icon = opts.type === 'error' ? ICON.critical : opts.type === 'question' ? ICON.question : opts.type === 'warn' ? ICON.alert : ICON.info;
    return dialog({ title, text, icon, width: opts.width, buttons: opts.buttons });
  }

  /* -------------------------------------------------- balloons */
  function balloon(title, text, icon, ms) {
    const layer = document.getElementById('balloons');
    const b = el('div', 'balloon');
    const i = el('img'); i.src = icon || ICON.info; i.dataset.fb = ICON.info;
    const t = el('div', 'bal-title'); t.textContent = title;
    const x = el('div', 'bal-x'); x.textContent = 'X';
    const p = document.createElement('div'); p.textContent = text;
    b.append(i, x, t, p);
    layer.append(b);
    Sound.play('balloon', { vol: .7 });
    const kill = () => { b.style.transition = 'opacity .3s'; b.style.opacity = 0; setTimeout(() => b.remove(), 320); };
    x.addEventListener('click', kill);
    setTimeout(kill, ms || 9000);
    return b;
  }

  /* -------------------------------------------------- tray */
  function addTray(id, iconUrl, title, onclick) {
    const d = el('div', 'tray-ico');
    d.title = title || '';
    const im = el('img'); im.src = iconUrl; im.dataset.fb = iconUrl;
    d.append(im);
    d.addEventListener('click', () => onclick && onclick(d));
    document.getElementById('tray-icons').append(d);
    const api = trayItems[id] = {
      el: d, img: im,
      setBlink(v) { d.classList.toggle('blink', !!v); },
      setBadge(n) {
        let b = d.querySelector('.badge');
        if (!n) { if (b) b.remove(); return; }
        if (!b) { b = el('div', 'badge'); d.append(b); }
        b.textContent = n;
      },
      setIcon(u) { im.src = u; }
    };
    return api;
  }

  /* -------------------------------------------------- clock */
  function startClock() {
    const c = document.getElementById('clock');
    const tick = () => {
      const now = new Date();
      let h = now.getHours(); const ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const m = String(now.getMinutes()).padStart(2, '0');
      c.textContent = h + ':' + m + ' ' + ap;
      c.title = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '\n' + now.toLocaleTimeString();
    };
    tick(); setInterval(tick, 1000);
  }

  /* -------------------------------------------------- RUN */
  function runDialog() {
    const body = el('div');
    body.style.cssText = 'display:flex;gap:12px;padding:14px 14px 8px;background:#ECE9D8;';
    const ic = el('img'); ic.src = ICON.run; ic.style.cssText = 'width:32px;height:32px;';
    const col = el('div'); col.style.flex = '1';
    col.innerHTML = '<div style="margin-bottom:10px;">Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</div>';
    const row = el('div'); row.style.cssText = 'display:flex;gap:8px;align-items:center;';
    row.innerHTML = '<span>Open:</span>';
    const inp = el('input', 'xp-input'); inp.style.flex = '1'; inp.setAttribute('spellcheck', 'false');
    row.append(inp); col.append(row); body.append(ic, col);
    const win = openWindow({ title: 'Run', icon: ICON.run, width: 380, height: 168, minimizable: false, maximizable: false, resizable: false, body });
    const bar = el('div', 'dlg-btns'); bar.style.cssText = 'position:absolute;right:12px;bottom:10px;margin:0;';
    const bOK = el('button', 'xp-btn default'); bOK.textContent = 'OK';
    const bCancel = el('button', 'xp-btn'); bCancel.textContent = 'Cancel';
    const brw = el('button', 'xp-btn'); brw.textContent = 'Browse...'; brw.style.marginRight = 'auto';
    bar.append(brw, bOK, bCancel);
    win.body.append(bar);
    bCancel.addEventListener('click', () => win.close());
    brw.addEventListener('click', () => msg('Run', 'Browse is not available in this simulation.', { type: 'info' }));
    const go = () => { const v = inp.value.trim(); win.close(); if (v) run(v); };
    bOK.addEventListener('click', go);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); if (e.key === 'Escape') win.close(); });
    setTimeout(() => inp.focus(), 40);
  }

  function run(cmdline) {
    cmdline = String(cmdline || '').trim();
    if (!cmdline) return;
    const parts = cmdline.split(/\s+/);
    const cmd = parts[0].toLowerCase().replace(/\.exe$/, '');
    const arg = parts.slice(1).join(' ');
    const map = {
      notepad: 'notepad', mspaint: 'paint', paint: 'paint', calc: 'calc', 'command': 'cmd', cmd: 'cmd',
      winmine: 'mines', minesweeper: 'mines', iexplore: 'iexplore', explorer: 'explorer-mycomputer',
      wmplayer: 'wmp', winver: 'winver', taskmgr: 'taskmgr', control: 'control',
      'appwiz.cpl': 'control', 'desk.cpl': 'display', timedate: 'timedate',
      msnmsgr: 'msn', msnmessenger: 'msn', icq: 'icq', icqpro: 'icq',
      steam: 'steam', cstrike: 'cs', cs: 'cs', halflife: 'cs', 'hl.exe': 'cs', hl: 'cs',
      starcraft: 'starcraft', sc: 'starcraft', broodwar: 'starcraft', battleline: 'starcraft',
      ta: 'ta', 'total-annihilation': 'ta', cnc: 'cnc', conquer: 'cnc', 'c&c': 'cnc',
      wow: 'wow', 'world-of-warcraft': 'wow',
      winamp: 'winamp', winamp2: 'winamp',
      teamspeak: 'teamspeak', ts2: 'teamspeak', teamspeak2: 'teamspeak',
      firefox: 'firefox', ff: 'firefox', firebird: 'firefox',
      'logoff': '__logoff', 'chkdsk': '__chkdsk', 'format': '__format', 'fdisk': '__fdisk'
    };
    if (cmd === 'shutdown') {
      if (/-s/.test(arg)) return Boot.turnOff();
      if (/-r/.test(arg)) return Boot.restart();
      if (/-l/.test(arg)) return Boot.logoff();
      return msg('Shutdown', 'Invalid parameter. Usage: shutdown -s | -r | -l', { type: 'error' });
    }
    const id = map[cmd];
    if (id === '__logoff') return Boot.logoff();
    if (id === '__chkdsk') return WM.msg('chkdsk', 'Chkdsk is not supported in this simulation.', { type: 'error' });
    if (id === '__format') return WM.msg('Format', 'Cannot format. This drive is protected by the System Administrator.', { type: 'error' });
    if (id === '__fdisk') return WM.msg('FDISK', 'FDISK is not supported in this simulation.', { type: 'error' });
    if (id === 'explorer-mycomputer') return launch('explorer-mycomputer');
    if (id === 'iexplore') return launch('iexplore', arg || undefined);
    if (id === 'control') return launch('control');
    if (id && APPS[id]) return launch(id);
    if (/^https?:\/\//.test(cmdline) || /\./.test(cmd) && !cmd.includes(' ')) return openWeb(cmdline);
    Sound.play('error');
    msg('Run', 'Windows cannot find \'' + cmdline + '\'. Make sure you typed the name correctly, and then try again. To search for a file, click the Start button, and then click Search.',
      { type: 'error', width: 420 });
  }

  /* -------------------------------------------------- default browser
     config.js RETRO.browser.default picks which app owns "the web":
     URLs from Run, cmd start, desktop links etc. all end up here. */
  function defaultBrowser() {
    const d = (window.RETRO && RETRO.browser && RETRO.browser.default) || 'firefox';
    return APPS[d] ? d : 'iexplore';
  }
  function openWeb(url) { return launch(defaultBrowser(), url || undefined); }

  /* -------------------------------------------------- launch */
  function launch(name, arg) {
    const app = APPS[name];
    if (!app) {
      Sound.play('error');
      msg('Windows - Cannot Find Application', 'Windows cannot find \'' + name + '\'. This problem may have been caused by a virus infection on your computer. If the problem persists, contact your system administrator.', { type: 'error' });
      return;
    }
    Sound.play('nav', { vol: .35 });
    return app.launch(arg);
  }

  /* -------------------------------------------------- start menu wiring */
  function smItem(icon, label, opts, strong, small) {
    const d = el('div', 'sm-item' + (strong ? ' sm-strong' : '') + (small ? ' sm-sm' : ''));
    const i = iconImg(icon, small ? 16 : 24);
    d.append(i, Object.assign(el('span'), { textContent: label }));
    if (opts && opts.arrow) { const a = el('b', 'sm-arrow'); a.innerHTML = '&#9654;'; d.append(a); }
    if (opts && opts.action) d.addEventListener('click', () => { closeStartMenu(); Sound.play('menu', { vol: .3 }); opts.action(); });
    return d;
  }
  function closeStartMenu() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('sm-programs-flyout').classList.add('hidden');
    document.getElementById('start-button').classList.remove('active');
  }
  function toggleStartMenu() {
    const sm = document.getElementById('start-menu');
    if (sm.classList.contains('hidden')) {
      closeAllMenus();
      sm.classList.remove('hidden');
      document.getElementById('start-button').classList.add('active');
      Sound.play('nav', { vol: .5 });
    } else closeStartMenu();
  }

  /* -------------------------------------------------- globals */
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllMenus();
    if (e.ctrlKey && e.altKey && e.key === 'Delete') { e.preventDefault(); launch('taskmgr'); }
  });

  startClock();

  return {
    openWindow, dialog, msg, balloon, run, runDialog, launch,
    contextMenu, closeAllMenus, addTray, smItem,
    toggleStartMenu, closeStartMenu,
    el, iconImg, desktopRect,
    focusWin, openWeb, defaultBrowser,
    get wins() { return wins.slice(); },
    get active() { return activeWin; },
    setMenu(win, def) {
      const old = win.el.querySelector('.xp-menubar'); if (old) old.remove();
      const mb = el('div', 'xp-menubar'); buildMenubar(mb, def, win);
      win.el.insertBefore(mb, win.body);
    }
  };
})();
