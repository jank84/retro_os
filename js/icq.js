/* ==========================================================================
   icq.js — ICQ 2003 "float" window, contact tree with UINs, messaging
   ========================================================================== */
'use strict';

APPS.icq = (() => {
  const el = WM.el;
  const now = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const rnd = a => a[Math.floor(Math.random() * a.length)];

  /* ICQ flavour: UINs, nicknames, status messages, "Invisible"-era charm */
  const CONTACTS = [
    { cat: 'Friends', uin: '284-092-117', nick: 'xX_DarkAngel_Xx', real: 'Kevin M.', status: 'online', msg: '~*~ nothing is real, nothing is true ~*~',
      replies: ['sup', 'ur icq status is cringe sorry', 'brb downloading, 56k life', 'add me on msn too, everyone is migrating there :('],
      greets: ['yo', 'hey u'] },
    { cat: 'Friends', uin: '412-778-301', nick: 'Jessica ♡', real: 'Jess P.', status: 'online', msg: '♂♀ just me against the world ♀♂',
      replies: ['hii!! :))', 'did u get my mail??', 'kiss my a*** :P jk', 'i would PM u but my internet died'],
      greets: ['heyyyy', 'hi :))'] },
    { cat: 'Friends', uin: '150-334-880', nick: 'CS_Master2003', real: 'Dave K.', status: 'away', msg: 'AWAY: eating, do not disturb',
      replies: ['im afk, mom is cooking', 'DONT KILL MY FLOWER, that is the sound of my soul', 'de_dust2 24/7'] },
    { cat: 'Friends', uin: '908-115-642', nick: 'sk8er_boi_tt', real: 'Timo S.', status: 'na', msg: 'do not ask me for warez, ask later',
      replies: ['hehe', 'u got the new demo? send it', 'my modem says brrrr'] },
    { cat: 'Work', uin: '771-204-536', nick: 'Herr Maier', real: 'R. Maier', status: 'online', msg: 'Reports bis Freitag!!!',
      replies: ['Where is the report?', 'We will discuss this on monday.', 'Do not message me after 18:00.'] },
    { cat: 'Work', uin: '664-908-221', nick: 'Sabine (HR)', real: 'S. Weber', status: 'invisible', msg: '', replies: ['HR is aware of your activity.'] },
    { cat: 'Family', uin: '330-471-909', nick: 'Oma Erna', real: 'Grandma', status: 'online', msg: 'grtgv',
      replies: ['grtgv', 'wie gehts dir?', 'dein mutter sagt du sollst anrufen'] },
    { cat: 'Other', uin: '552-310-774', nick: 'flower_power_gal', real: 'Anna W.', status: 'dnd', msg: 'busy, ICQ says so', replies: ['make me a flower in paint? :'] },
    { cat: 'Other', uin: '118-662-004', nick: '[ICQ] Team', real: 'ICQ Inc.', status: 'offline', msg: '', offlineNote: 'ICQ Team is offline.' },
    { cat: 'Other', uin: '845-770-312', nick: 'nullbyt3', real: 'unknown', status: 'offline', msg: '' }
  ];
  CONTACTS.forEach(c => { if (c.replies) { c.replyIdx = 0; c.greetIdx = 0; } });

  const STATUS = {
    online:    { c: '#009900', t: 'Online', visible: true },
    away:      { c: '#ffcc00', t: 'Away', visible: true },
    na:        { c: '#ff8000', t: 'N/A', visible: true },
    dnd:       { c: '#ff0000', t: 'DND', visible: true },
    occupied:  { c: '#990099', t: 'Occupied', visible: true },
    invisible: { c: '#999999', t: 'Invisible', visible: true },
    offline:   { c: '#bbbbbb', t: 'Offline', visible: false }
  };

  let online = false, floatWin = null, trayRef = null;
  let convos = {}, unread = {}, timers = [];
  const ME = { uin: '688-200-314', nick: 'user2003', status: 'online' };

  function flower(status) {
    const st = STATUS[status] || STATUS.offline;
    return '<span class="icq-fl" style="background:' + st.c + ';"></span>';
  }
  function setTray() {
    if (!trayRef) return;
    const n = Object.values(unread).reduce((a, b) => a + b, 0);
    trayRef.setBadge(n || 0);
    trayRef.setBlink(n > 0);
  }

  APPS.icq = {
    isOnline() { return online; },
    signOff() { signOff(); },
    launch() { if (online) showFloat(); else signInFlow(); }
  };

  /* ---------------- sign in ---------------- */
  function signInFlow() {
    const body = el('div');
    body.className = 'msn-signin';
    body.innerHTML = `
      <div class="msn-sign-hero" style="height:86px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${ICQ_FLOWER}" width="52" height="52" alt="ICQ">
          <div style="font:bold 26px 'Arial Black',Arial;color:#ff0000;text-shadow:1px 1px 0 #900;">ICQ<span style="font:11px Tahoma;color:#555;">&nbsp;2003b</span></div>
        </div>
      </div>
      <div class="msn-sign-form">
        <div class="msn-sign-title">Connect to ICQ</div>
        <label>UIN:</label>
        <input class="xp-input" id="icq-uin" value="688-200-314">
        <label>Password:</label>
        <input class="xp-input" type="password" id="icq-pass" value="••••••••">
        <div style="height:6px"></div>
        <label class="msn-ck"><input type="checkbox" checked> Auto-status: Online</label>
        <div class="msn-sign-status" id="icq-stat">&nbsp;</div>
        <div style="text-align:right;margin-top:8px;">
          <button class="xp-btn" id="icq-cancel">Cancel</button>
          <button class="xp-btn default" id="icq-ok">Connect</button>
        </div>
        <div style="margin-top:10px;font-size:10px;color:#777;">
          Hint: your contact list is stored on the ICQ server, just like in 2003.
        </div>
      </div>`;
    const win = WM.openWindow({ title: 'ICQ 2003', icon: ICQ_FLOWER, width: 330, height: 372, minimizable: false, maximizable: false, resizable: false, body });
    body.querySelector('#icq-cancel').addEventListener('click', () => win.close());
    body.querySelector('#icq-ok').addEventListener('click', () => {
      const stat = body.querySelector('#icq-stat');
      const btn = body.querySelector('#icq-ok'); btn.disabled = true;
      const steps = ['Contacting ICQ server...', 'Authorizing...', 'Retrieving contact list from server...', 'Contact list received. Connected.'];
      let i = 0;
      const tick = () => {
        if (!win.el.isConnected) return;
        stat.textContent = steps[i]; i++;
        if (i < steps.length) setTimeout(tick, 600 + Math.random() * 400);
        else setTimeout(() => { win.close(); doSignIn(); }, 650);
      };
      tick();
    });
  }

  function doSignIn() {
    online = true;
    Sound.play('icqConnect', { vol: .7 });
    showFloat();
    WM.balloon('ICQ', 'You are now online as ' + ME.nick + ' (' + ME.uin + ')', ICQ_FLOWER);
    scheduleScripted();
  }

  function signOff() {
    online = false;
    timers.forEach(clearTimeout); timers = [];
    Object.values(convos).forEach(c => c.win && c.win.close());
    convos = {}; unread = {};
    if (floatWin) { floatWin.close(); floatWin = null; }
    if (trayRef) { trayRef.setBlink(false); trayRef.setBadge(0); }
    Sound.play('icqDisconnect', { vol: .7 });
    WM.balloon('ICQ', 'You are now disconnected.', ICQ_FLOWER);
  }

  /* ---------------- float window ---------------- */
  function showFloat() {
    if (floatWin && floatWin.el.isConnected) { WM.focusWin(floatWin); return; }
    const body = el('div'); body.className = 'icq-float';
    floatWin = WM.openWindow({ title: 'ICQ 2003', icon: ICQ_FLOWER, width: 258, height: 430, cls: 'icq-win', app: 'icq', body });
    render();
    return floatWin;
  }

  function render() {
    if (!floatWin || !floatWin.el.isConnected) return;
    const body = floatWin.body;
    body.innerHTML = '';
    const head = el('div', 'icq-head');
    head.innerHTML = `<img src="${ICQ_FLOWER}" alt=""><div><b>${ME.nick}</b><div class="icq-uin">UIN: ${ME.uin}</div></div>`;
    body.append(head);

    const row = el('div', 'icq-status-row');
    row.innerHTML = `<label>Status:</label><select id="icq-st">${Object.keys(STATUS).map(k => '<option value="' + k + '"' + (k === ME.status ? ' selected' : '') + '>' + STATUS[k].t + '</option>').join('')}</select>`;
    body.append(row);
    row.querySelector('#icq-st').addEventListener('change', e => {
      ME.status = e.target.value;
      Sound.play('icqStatus', { vol: .5 });
      WM.balloon('ICQ', 'Your status changed to "' + STATUS[ME.status].t + '".', ICQ_FLOWER);
      render();
    });

    const tree = el('div', 'icq-tree');
    const cats = [...new Set(CONTACTS.map(c => c.cat))];
    cats.forEach(cat => {
      const list = CONTACTS.filter(c => c.cat === cat);
      const onlineN = list.filter(c => STATUS[c.status].visible).length;
      const h = el('div', 'icq-cat');
      h.innerHTML = '&#9662; ' + cat + ' (' + onlineN + '/' + list.length + ')';
      tree.append(h);
      list.forEach(c => {
        const r = el('div', 'icq-contact');
        r.style.paddingLeft = '20px';
        const shown = STATUS[c.status].visible ? c.nick : c.nick.split('_')[0];
        r.innerHTML = flower(c.status) +
          '<span>' + shown + (unread[c.uin] ? ' <b style="color:#c00">(' + unread[c.uin] + ')</b>' : '') + '</span>' +
          '<span class="uin" style="margin-left:auto;">' + c.uin + '</span>';
        r.title = c.real + ' — ' + (STATUS[c.status].t) + (c.msg ? '\n"' + c.msg + '"' : '');
        r.addEventListener('dblclick', () => openConvo(c));
        r.addEventListener('contextmenu', e => {
          e.preventDefault(); e.stopPropagation();
          WM.contextMenu(e.clientX, e.clientY, [
            { label: 'Send ICQ # message', icon: ICQ_FLOWER, action: () => openConvo(c) },
            { label: 'View full info', action: () => WM.msg('ICQ User Info', 'Nickname: ' + c.nick + '\nUIN: ' + c.uin + '\nStatus: ' + STATUS[c.status].t + '\nAge: secret\nEmail: undisclosed@icq.com', { type: 'info' }) },
            '-',
            { label: 'Add to contacts', disabled: true },
            { label: 'Block user', action: () => WM.msg('ICQ', c.nick + ' will keep messaging you anyway. It is 2003.', { type: 'info' }) }
          ]);
        });
        tree.append(r);
      });
    });
    body.append(tree);

    const foot = el('div', 'icq-foot');
    foot.innerHTML = '<button class="xp-btn" id="icq-add">Add</button><button class="xp-btn" id="icq-find">Find</button><button class="xp-btn" id="icq-menu">Menu</button>';
    body.append(foot);
    foot.querySelector('#icq-add').addEventListener('click', () =>
      WM.msg('Add a Contact', 'Enter the UIN of the person you want to add.\n\nTip: try 118-662-004 to add the ICQ Team again.', { type: 'info' }));
    foot.querySelector('#icq-find').addEventListener('click', () =>
      WM.msg('Search for a User', 'The white pages of ICQ found 4 people named "Bill Gates" and 1 goat.', { type: 'info' }));
    foot.querySelector('#icq-menu').addEventListener('click', e => {
      WM.contextMenu(e.clientX, e.clientY - 4, [
        { label: 'Preferences...', action: () => WM.msg('ICQ Preferences', 'Sound scheme: ICQ 2003b\n☑ Play "Uh-oh!" for incoming messages\n☑ Flower animation\nAnti-spam: maximum (still got spam)', { type: 'info' }) },
        '-',
        { label: 'Disconnect', action: () => signOff() }
      ]);
    });
    setTray();
  }

  /* ---------------- conversations ---------------- */
  function openConvo(c) {
    const key = c.uin;
    if (convos[key] && convos[key].win.el.isConnected) { WM.focusWin(convos[key].win); return; }
    const body = el('div'); body.className = 'icq-msg-win';
    body.innerHTML = `
      <div class="icq-msg-head">${flower(c.status)} <b>${c.nick}</b> &lt;${c.uin}&gt; <span style="color:#777;font-style:italic;">— ${c.msg || 'no status message'}</span></div>
      <div class="icq-msg-log"></div>
      <div class="icq-msg-in"><textarea placeholder="Type your ICQ # message..." spellcheck="false"></textarea></div>
      <div class="icq-msg-bar">
        <button class="xp-btn" data-x="contact">Contact info</button>
        <button class="xp-btn" data-x="file">Send file</button>
        <div class="right">
          <button class="xp-btn" data-x="reject">Reject</button>
          <button class="xp-btn default" data-x="send">Send</button>
        </div>
      </div>`;
    const win = WM.openWindow({ title: 'ICQ # message to ' + c.nick, icon: ICQ_FLOWER, width: 420, height: 380, app: 'icq', body });
    const log = body.querySelector('.icq-msg-log');
    const ta = body.querySelector('textarea');
    const convo = { win, c, log };

    function add(who, txt) {
      const e = el('div');
      e.style.marginBottom = '6px';
      e.innerHTML = '<b style="color:' + (who === 'me' ? '#b03060' : '#0a499f') + ';">' +
        (who === 'me' ? ME.nick : c.nick) + ' &middot; ' + now() + ':</b> ' +
        txt.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      log.append(e); log.scrollTop = log.scrollHeight;
    }
    convo.add = add;
    convos[key] = convo;
    unread[key] = 0; setTray(); render();

    function buddyReply(text) {
      setTimeout(() => {
        if (!win.el.isConnected) return;
        add('buddy', text);
        Sound.play('icqRecv', { vol: .8 });
        if (WM.active !== win.el._win) win.flash(true);
      }, 1000 + Math.random() * 1500);
    }
    convo.reply = buddyReply;

    ta.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const v = ta.value.trim(); if (!v) return;
        ta.value = '';
        add('me', v);
        Sound.play('icqSent', { vol: .5 });
        if (c.status === 'offline') {
          setTimeout(() => { if (win.el.isConnected) { add('sys', 'Message not delivered: ' + c.nick + ' is offline.'); } }, 600);
          Sound.play('icqError', { vol: .5 });
        } else if (/^(hi|hey|yo|hii+)\b/i.test(v)) buddyReply(rnd(c.greets || ['hey']));
        else buddyReply(c.replies ? c.replies[c.replyIdx++ % c.replies.length] : '...');
      }
    });
    body.querySelector('[data-x=send]').addEventListener('click', () => {
      const v = ta.value.trim(); if (!v) return;
      ta.value = ''; add('me', v); Sound.play('icqSent', { vol: .5 });
    });
    body.querySelector('[data-x=reject]').addEventListener('click', () => {
      add('sys', 'You rejected this conversation. Very 2003.');
      Sound.play('icqError', { vol: .5 });
      setTimeout(() => win.close(), 1200);
    });
    body.querySelector('[data-x=contact]').addEventListener('click', () =>
      WM.msg('ICQ Contact Info', 'Nickname: ' + c.nick + '\nName: ' + c.real + '\nUIN: ' + c.uin + '\nStatus: ' + STATUS[c.status].t + '\nIP: hidden (privacy!)', { type: 'info' }));
    body.querySelector('[data-x=file]').addEventListener('click', () => {
      WM.msg('Send File', 'Connecting to ' + c.nick + ' to transfer file...\n\nTransfer speed: 4.2 KB/s\nEstimated time: 3 hours 41 minutes', { type: 'info' });
    });

    if (c.firstWaiting) add('sys', c.nick + ' tried to reach you while you were away!');
    else if (c.greets && STATUS[c.status].visible) buddyReply(rnd(c.greets));
    return win;
  }

  function incoming(c, text, sysNote) {
    const conv = convos[c.uin];
    if (!conv || !conv.win.el.isConnected) {
      unread[c.uin] = (unread[c.uin] || 0) + 1;
      c.firstWaiting = true;
      setTray(); render();
      WM.balloon('ICQ message from ' + c.nick + ' <' + c.uin + '>', text, ICQ_FLOWER);
      Sound.play('icqRecv');
      showFloat();
      if (floatWin) floatWin.flash(true);
      return;
    }
    if (sysNote) conv.add('sys', sysNote);
    conv.add('buddy', text);
    Sound.play('icqRecv');
    if (WM.active !== conv.win) conv.win.flash(true);
  }

  /* ---------------- scripted life ---------------- */
  const S = (fn, ms) => timers.push(setTimeout(fn, ms));
  function scheduleScripted() {
    const jess = CONTACTS[1], kevin = CONTACTS[0], oma = CONTACTS[6], maier = CONTACTS[4];
    S(() => incoming(jess, 'hiiiii!! finally ur online :)) i sent u 3 messages earlier, did u get them??'), 18000);
    S(() => incoming(jess, 'anyway... do u remember what happened at the party on saturday? tell me EVERYTHING'), 30000);
    S(() => incoming(kevin, 'psst. ur icq flower made a sound. i think ur online. deal with it.'), 48000);
    S(() => { oma.status = 'away'; render(); Sound.play('icqStatus', { vol: .4 }); }, 60000);
    S(() => incoming(oma, 'dein mutter sagt du sollst anrufen'), 76000);
    S(() => incoming(maier, 'Reminder: the report was due yesterday. This message has been read by HR.'), 102000);
    S(() => {
      const cs = CONTACTS[2]; cs.status = 'online'; render();
      Sound.play('icqStatus', { vol: .4 });
      WM.balloon('ICQ', 'CS_Master2003 is now Online.', ICQ_FLOWER);
      S(() => incoming(cs, 'who touched my flower?! that was MY icq sound!'), 6000);
    }, 126000);
  }

  APPS.icq.initTray = function () {
    trayRef = WM.addTray('icq', ICQ_FLOWER, 'ICQ — click to connect', () => APPS.icq.launch());
  };
  return APPS.icq;
})();
