/* ==========================================================================
   msn.js — MSN Messenger 7.5 experience: signin, buddy list, chats, nudges
   ========================================================================== */
'use strict';

APPS.msn = (() => {
  const el = WM.el;
  const ADS = [
    { t: 'Windows XP SP2', s: 'Get the security update everyone is talking about.', c: '#0a499f' },
    { t: 'MSN Music Club', s: 'Download the top 40 now. From 99c per track!', c: '#a0164a' },
    { t: 'MySpace', s: 'Your Top 8 is waiting. Add photos today!', c: '#003399' },
    { t: 'Encarta 2004', s: 'The world\u2019s knowledge on 2 CDs.', c: '#146b3a' }
  ];
  const EMO = {
    ':)': '🙂', ':-)': '🙂', ':d': '😃', ':D': '😃', ';)': '😉', ':(': '🙁', ':P': '😛', ':p': '😛',
    '<3': '💕', '(y)': '👍', '(n)': '👎', '(6)': '❤️', '(a)': '😇', '(b)': '👿', '(h)': '😎',
    '(8)': '🕶️', '(s)': '😴', '(o)': '😮', '(x)': '😘', '(l)': '🌹', '(u)': '🌙', '(*)': '⭐',
    '8)': '😎', ':\'(': '😢', '(ppr)': '🎂', '(ii)': '💤'
  };
  function emotify(t) {
    let h = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    Object.keys(EMO).sort((a, b) => b.length - a.length).forEach(k => {
      h = h.split(k).join('<span class="emo">' + EMO[k] + '</span>');
    });
    return h;
  }
  const now = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const rnd = a => a[Math.floor(Math.random() * a.length)];

  /* ---------------- buddy roster ---------------- */
  const BUDDIES = [
    { id: 'jess',  name: 'jess88 <3',        disp: '~*~summers here~*~',        status: 'online', ava: 'skate',  uin: 'cutie_jess88@hotmail.com',
      replies: ['omg hii', 'brb mom needs the phone lol', 'did u see dave\'s top8?? so random XD', 'a/s/l? jk haha', 'i luv ur display name!!!', 'g2g dinner, k? later!! xoxo', 'u up? ;)', 'this song is sooo good rn 🎵'],
      greets: ['hiii :)', 'omg hey!! :d', 'heey :)) what r u up to?'] },
    { id: 'dave',  name: 'Dave [GfG]',       disp: 'GfG | www.gamingforelife.net', status: 'online', ava: 'chess',
      replies: ['yo', 'u seen cs 1.6? insane', 'brb pizza guy at the door', 'gg', 'tell jess to stop spamming nudges lol', 'nah we cant lan at my place, dad needs the pc'],
      greets: ['yo', 'sup', 'hey man'] },
    { id: 'kevin', name: 'Kévin ✞ goth92', disp: 'tombs forever // -life-',  status: 'busy',   ava: 'flower',
      replies: ['the night speaks to me', 'u use msn like it is a toy', 'hmm.', 'i shall allow this conversation', 'f7 is my heart, grey and still'],
      greets: ['...', 'you dare disturb me?', 'hey.'] },
    { id: 'anna',  name: 'Anna',             disp: 'to be or not to be =)',     status: 'online', ava: 'duck',
      replies: ['heyy', 'just finished my diary... i mean journal :P', 'msn ads are so funny lol', 'do u have mspaint? draw me a house', 'i vote we nudge dave. on 3. 1 2—'],
      greets: ['hi :)', 'hellooo'] },
    { id: 'mom',   name: 'Mom',              disp: 'call your grandmother',     status: 'online', ava: 'beach',
      replies: ['Did you eat something?', 'Who is jess88??', 'Come downstairs, dinner in 10', 'Tell Anna hi if you see her', 'Don\'t talk to strangers!!'],
      greets: ['Hi sweetie', 'hello dear'] },
    { id: 'stefan',name: 'Stefan',           disp: 'BRB pizza',                 status: 'away',   ava: 'soccer',
      replies: ['eh', 'pizzas here, back in 5', 'ur mic sounds like a tractor', 'cool display name'],
      greets: ['yo', 'he'] },
    { id: 'yusuf', name: 'yusuf_007', disp: 'ASL? (just kidding... or not)', status: 'away', ava: 'moto',
      replies: ['asl?', 'hahaha jk man', 'from turkey, u?', 'my internet is 56k, sry for lag', 'do u have cs keygen? jk jk'],
      greets: ['hi', 'hey'] },
    { id: 'tommy', name: 'Tommy (work)',     disp: 'Not at desk',               status: 'offline', ava: 'rocket' },
    { id: 'lara',  name: 'lara ♡', disp: '~*~ la la life ~*~',        status: 'offline', ava: 'palm' },
    { id: 'mike',  name: 'Big Mike',         disp: 'I heart you!',              status: 'offline', ava: 'horses' },
    { id: 'daniel',name: 'daniel',           disp: 'www.geocities.com/danielspage', status: 'offline', ava: 'dog' }
  ];
  BUDDIES.forEach(b => { if (b.replies) { b.replyIdx = 0; b.greetIdx = 0; } });

  let online = false, me = { name: 'User', disp: '♫ now playing: In The End - Linkin Park ♫', status: 'online' };
  let listWin = null, trayRef = null, unread = {}, convos = {};
  let scriptedTimers = [];

  function setTray() {
    const n = Object.values(unread).reduce((a, b) => a + b, 0);
    if (!trayRef) return;
    trayRef.setBadge(n || 0);
    trayRef.setBlink(n > 0);
  }

  /* ---------------- sign in ---------------- */
  APPS.msn = {
    get isOnline() { return online; },
    isOnline() { return online; },
    signOff() { signOff(); },
    launch(arg) {
      if (online) { showList(); return; }
      signInFlow();
    }
  };

  function signInFlow() {
    const body = el('div');
    body.className = 'msn-signin';
    body.innerHTML = `
      <div class="msn-sign-hero"><img src="${ICON.msnLogo}" data-fb="${ICON.msn}" alt="MSN Messenger"></div>
      <div class="msn-sign-form">
        <div class="msn-sign-title">Sign in to Messenger</div>
        <label>Passport e-mail address:</label>
        <input class="xp-input msn-in" id="msn-mail" value="user2003@hotmail.com">
        <label>Passphrase:</label>
        <input class="xp-input msn-in" id="msn-pass" type="password" value="********">
        <div style="height:6px"></div>
        <label class="msn-ck"><input type="checkbox" checked> Sign in automatically</label>
        <label class="msn-ck"><input type="checkbox"> Remember my passphrase</label>
        <div class="msn-sign-status" id="msn-stat">&nbsp;</div>
        <div style="text-align:right;margin-top:8px;"><button class="xp-btn" id="msn-cancel">Cancel</button> <button class="xp-btn default" id="msn-ok">Sign In</button></div>
      </div>`;
    const win = WM.openWindow({ title: 'MSN Messenger', icon: ICON.msn, width: 342, height: 430, minimizable: false, maximizable: false, resizable: false, cls: 'msn-win', body });

    body.querySelector('#msn-cancel').addEventListener('click', () => win.close());
    body.querySelector('#msn-ok').addEventListener('click', () => {
      const stat = body.querySelector('#msn-stat');
      const steps = ['Connecting to Internet...', 'Connecting to Messenger Service...', 'Getting your list of contacts...', 'Your address book is being synchronized...', 'Now online.'];
      const btn = body.querySelector('#msn-ok'); btn.disabled = true;
      let i = 0;
      const tick = () => {
        if (!win.el.isConnected) return;
        if (i < steps.length) {
          stat.textContent = steps[i]; i++;
          if (i === steps.length) { setTimeout(() => { win.close(); doSignIn(); }, 700); return; }
          setTimeout(tick, 520 + Math.random() * 350);
        }
      };
      tick();
    });
  }

  function doSignIn() {
    online = true;
    Sound.play('msnOnline', { vol: .8 });
    showList();
    WM.balloon('MSN Messenger', 'You are now online. ' + BUDDIES.filter(b => b.status !== 'offline').length + ' of your friends are on right now!', ICON.msn);
    scheduleScripted();
  }
  function signOff() {
    online = false;
    scriptedTimers.forEach(clearTimeout); scriptedTimers = [];
    Object.values(convos).forEach(c => c.win && c.win.close());
    convos = {};
    if (listWin) { listWin.close(); listWin = null; }
    if (trayRef) { trayRef.setBlink(false); trayRef.setBadge(0); }
    Sound.play('msnOffline', { vol: .7 });
    WM.balloon('MSN Messenger', 'You are now offline.', ICON.msn);
  }

  /* ---------------- contact list ---------------- */
  const STATUS_META = {
    online: { c: '#31a031', t: 'Online' }, away: { c: '#d8b900', t: 'Away' }, busy: { c: '#d24a4a', t: 'Busy' },
    brb: { c: '#e08a00', t: 'Be Right There' }, offline: { c: '#999', t: 'Appear Offline' }
  };
  function statusDot(st) { return '<span class="msn-dot" style="background:' + STATUS_META[st].c + ';"></span>'; }

  function showList() {
    if (listWin && listWin.el.isConnected) { WM.focusWin(listWin); return; }
    const body = el('div'); body.className = 'msn-list';
    listWin = WM.openWindow({ title: 'MSN Messenger', icon: ICON.msn, width: 292, height: 520, cls: 'msn-win', app: 'msn', body,
      menubar: [
        { label: '<u>M</u>essenger', items: () => [
          { label: 'My Status', sub: ['Online', 'Busy', 'Away', 'Be Right There', 'Appear Offline'].map(s => ({ label: s, action: () => { me.status = s.toLowerCase().replace(/ .*/, ''); render(); WM.msg('MSN Messenger', 'Your status changed to ' + s + '. (nobody notices anything)', { type: 'info' }); } })) },
          '-',
          { label: 'Sign Out', action: () => signOff() }
        ]},
        { label: '<u>C</u>ontacts', items: () => [
          { label: 'Add a Contact', action: () => WM.msg('Add a Contact', 'To add someone you need their e-mail address. Try searching for "billgates@hotmail.com"... he won\'t accept.', { type: 'info' }) },
          { label: 'Refresh', action: () => { Sound.play('msnOnline', { vol: .4 }); WM.msg('MSN Messenger', 'Your contact list has been refreshed.', { type: 'info' }); } }
        ]},
        { label: '<u>T</u>ools', items: () => [
          { label: 'Options...', action: () => WM.msg('Options', 'Alerts: ☑ Sounds  ☑ Animation\nFont: Comic Sans MS... just kidding, Verdana.\n☑ Enable Nudge (obviously)', { type: 'info' }) }
        ]}
      ] });
    listWin.onClose = () => { if (online) { listWin = null; } };
    function render() {
      const groups = [['Online buddies', ['online', 'busy', 'away', 'brb']], ['Offline', ['offline']]];
      body.innerHTML = '';
      const head = el('div', 'msn-me');
      head.innerHTML = `
        <img class="msn-me-ava" src="${AVA('rocket')}" data-fb="${ICON.msn}">
        <div class="msn-me-info">
          <div class="msn-me-name">${statusDot(me.status)} <b>${me.name}</b></div>
          <div class="msn-me-msg">${me.disp}</div>
        </div>`;
      head.addEventListener('dblclick', () => {
        const v = prompt('Your personal message:', me.disp);
        if (v != null) { me.disp = v; render(); }
      });
      body.append(head);
      groups.forEach(([title, sts]) => {
        const inG = BUDDIES.filter(b => sts.includes(b.status));
        if (!inG.length && title === 'Online buddies') return;
        const g = el('div', 'msn-group');
        g.innerHTML = '<span class="msn-caret">' + (title === 'Offline' ? '&#9662;' : '&#9656;') + '</span> ' + title + ' (' + inG.length + ')';
        body.append(g);
        inG.forEach(b => {
          const r = el('div', 'msn-bud' + (unread[b.id] ? ' newmsg' : ''));
          r.innerHTML = statusDot(b.status) +
            '<img src="' + AVA(b.ava) + '" data-fb="' + ICON.msnGeneric + '">' +
            '<div class="msn-bud-info"><div class="msn-bud-name">' + b.name + (unread[b.id] ? ' <b style="color:#0a499f;">(' + unread[b.id] + ')</b>' : '') + '</div>' +
            '<div class="msn-bud-msg">' + (b.status === 'offline' ? '<i>' + b.name.split(' ')[0] + ' is offline.</i>' : b.disp) + '</div></div>';
          r.addEventListener('dblclick', () => openConvo(b));
          r.addEventListener('contextmenu', e => {
            e.preventDefault(); e.stopPropagation();
            WM.contextMenu(e.clientX, e.clientY, [
              { label: 'Send Instant Message', icon: ICON.msn, disabled: b.status === 'offline', action: () => openConvo(b) },
              { label: 'Block Contact', action: () => WM.msg('Block Contact', 'You cannot block ' + b.name + ': they would notice.', { type: 'info' }) },
              { label: 'View Profile', icon: ICON.ie, action: () => APPS.iexplore.launch('http://www.myspace.com/jess88') },
              '-',
              { label: b.status === 'offline' ? 'This person is offline.' : 'Pointlessly hover this menu.', disabled: true }
            ]);
          });
          body.append(r);
        });
      });
      const ad = el('div', 'msn-ad');
      const a = rnd(ADS);
      ad.innerHTML = '<div class="msn-ad-l"><b>Advertisement</b><br>' + a.t + '<br><span>' + a.s + '</span></div><div class="msn-ad-r" style="background:' + a.c + '">' + a.t[0] + '</div>';
      ad.addEventListener('click', () => WM.msg('Advertisement', 'You clicked the ad! Redirecting to msn.com... (just kidding, this is a simulation)', { type: 'info' }));
      body.append(ad);
    }
    render();
    listWin._render = render;
    setTray();
    return listWin;
  }

  /* ---------------- conversations ---------------- */
  function openConvo(b) {
    if (convos[b.id] && convos[b.id].win.el.isConnected) { WM.focusWin(convos[b.id].win); return; }
    const body = el('div'); body.className = 'msn-convo';
    body.innerHTML = `
      <div class="msn-conv-head"><img src="${AVA(b.ava)}" data-fb="${ICON.msnGeneric}"><b>${b.name}</b> <span class="msn-conv-disp">${b.disp}</span></div>
      <div class="msn-conv-menu"><span>File</span><span>Edit</span><span>Actions</span><span>Tools</span><span>Help</span></div>
      <div class="msn-log" id="msn-log"></div>
      <div class="msn-typing hidden" id="msn-typing">${b.name.split(' ')[0]} is typing a message...</div>
      <div class="msn-input-row">
        <div class="msn-conv-toolbar">
          <button title="Change font">A</button><button title="Set your display name">👤</button>
          <button id="msn-emo-btn" title="Emoticons">☺</button>
          <button title="Background color">🎨</button>
          <button title="Invite someone to this conversation">✉</button>
          <button title="Stop sharing">🚫</button>
          <button class="msn-nudge" id="msn-nudge-btn" title="Nudge!">✋ Nudge</button>
        </div>
        <div class="msn-input-wrap"><textarea id="msn-in" spellcheck="false"></textarea></div>
      </div>
      <div class="msn-ad msn-ad-bottom"><div class="msn-ad-l"><b>Advertisement</b><br>Windows Catalog<br><span>Find real hardware for your virtual PC.</span></div><div class="msn-ad-r" style="background:#146b3a;">W</div></div>`;
    const win = WM.openWindow({ title: 'Conversation with ' + b.name, icon: ICON.msn, width: 470, height: 500, cls: 'msn-win msn-convo-win', app: 'msn', body });

    const log = body.querySelector('#msn-log');
    const typing = body.querySelector('#msn-typing');
    const input = body.querySelector('#msn-in');
    const convo = { win, b, log, unread: 0 };
    convos[b.id] = convo;
    unread[b.id] = 0; setTray();
    if (listWin && listWin._render) listWin._render();

    body.querySelector('#msn-nudge-btn').addEventListener('click', () => sendNudge(convo));
    body.querySelector('#msn-emo-btn').addEventListener('click', () => {
      WM.contextMenu(window.innerWidth / 2 - 60, window.innerHeight / 2, Object.keys(EMO).slice(0, 12).map(k => ({ label: k + '  ' + EMO[k], action: () => { input.value += k + ' '; input.focus(); } })));
    });
    body.querySelectorAll('.msn-conv-menu span').forEach(s => s.addEventListener('click', () => WM.msg(s.textContent, 'Nothing interesting here, like in real MSN.', { type: 'info' })));

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const v = input.value.trim();
        if (!v) return;
        input.value = '';
        addMsg(convo, 'me', v);
        Sound.play('msnSent', { vol: .5 });
        if (/^(hi|hii+|hello|hey|yo|sup|hola)\b/i.test(v)) setTimeout(() => reply(convo, rnd(b.greets || ['hey'])), 900 + Math.random() * 800);
        else setTimeout(() => reply(convo, nextReply(b)), 1200 + Math.random() * 1600);
        if (Math.random() < .18) setTimeout(() => { const c2 = convo; addMsg(c2, 'sys', b.name.split(' ')[0] + ' has sent you a nudge!'); nudgeShake(c2); Sound.play('msnNudge'); }, 2600);
      }
    });

    function addMsg(c, who, txt) {
      const e = el('div', 'msn-msg ' + who);
      if (who === 'sys') e.innerHTML = '<span class="msn-sys">🔔 ' + txt + '</span>';
      else e.innerHTML = '<span class="msn-who">' + (who === 'me' ? 'Me' : c.b.name) + ' - ' + now() + ':</span> ' + emotify(txt);
      log.append(e); log.scrollTop = log.scrollHeight;
      return e;
    }
    convo.addMsg = addMsg;
    function reply(c, text) {
      if (!win.el.isConnected) return;
      typing.classList.remove('hidden');
      setTimeout(() => {
        typing.classList.add('hidden');
        addMsg(c, 'buddy', text);
        if (document.activeElement !== win.el) c.win.flash(true);
        if (WM.active !== win.el._win) { Sound.play('msnRecv', { vol: .8 }); }
        else Sound.play('msnRecv', { vol: .45 });
      }, 900 + Math.random() * 1400);
    }
    convo.reply = reply;
    function nextReply(bb) { const r = bb.replies[bb.replyIdx++ % bb.replies.length]; return r; }
    convo.nextReply = nextReply;
    function sendNudge(c) {
      addMsg(c, 'sys', 'You have sent a nudge!');
      Sound.play('msnNudge');
      setTimeout(() => {
        nudgeShake(c);
        Sound.play('msnNudge');
        addMsg(c, 'buddy', rnd(['AAAAA!! :O', 'STOP THE NUDGE XD', 'lol wtf', 'u nearly dropped me off the screen!!', 'nuke u later :P']));
      }, 700);
    }
    convo.sendNudge = sendNudge;

    /* opening greeting if they were waiting */
    if (b.firstWaiting) {
      addMsg(convo, 'sys', b.name + ' has been waiting to talk to you!');
    } else {
      setTimeout(() => reply(convo, rnd(b.greets || ['hey', 'hi!'])), 1200);
    }
    return win;
  }

  function nudgeShake(convo) {
    const e = convo.win.el;
    e.classList.remove('nudge'); void e.offsetWidth; e.classList.add('nudge');
    setTimeout(() => e.classList.remove('nudge'), 1700);
  }

  function incoming(b, text, sysNote) {
    let c = convos[b.id];
    if (!c || !c.win.el.isConnected) {
      unread[b.id] = (unread[b.id] || 0) + 1;
      b.firstWaiting = true;
      setTray();
      if (listWin && listWin._render) listWin._render();
      WM.balloon('MSN Messenger', b.name + ' says: "' + text + '"', ICON.msn);
      Sound.play('msnRecv');
      showList();
      if (listWin) listWin.flash(true);
      return;
    }
    if (sysNote) c.addMsg(c, 'sys', sysNote);
    c.addMsg(c, 'buddy', text);
    Sound.play('msnRecv', { vol: .8 });
    if (WM.active !== c.win) c.win.flash(true);
  }

  /* ---------------- scripted life ---------------- */
  const S = (fn, ms) => scriptedTimers.push(setTimeout(fn, ms));
  function scheduleScripted() {
    const jess = BUDDIES[0], dave = BUDDIES[1], kevin = BUDDIES[2], mom = BUDDIES[4], stefan = BUDDIES[5];

    S(() => incoming(jess, 'hiii :) u there?? i have been waiting foreverrrr'), 14000);
    S(() => incoming(jess, 'anyway my mom made me come off at 9 so if i stop replying i literally died lol'), 24000);
    S(() => incoming(dave, 'yo. did u see the new cs demo? INSANE'), 38000);
    S(() => { kevin.status = 'offline'; Sound.play('msnOffline', { vol: .5 }); if (listWin && listWin._render) listWin._render(); WM.balloon('MSN Messenger', 'Kévin ✞ goth92 has just signed out. The void grows.', ICON.msn); }, 52000);
    S(() => incoming(mom, 'Are you on that messenger again? Homework first, then internet. I can hear the dialup from the kitchen.'), 66000);
    S(() => {
      stefan.status = 'online';
      Sound.play('msnOnline', { vol: .5 });
      if (listWin && listWin._render) listWin._render();
      WM.balloon('MSN Messenger', 'Stefan is now online.', ICON.msn);
      S(() => incoming(stefan, 'eh. my pizza arrived 2h late. worst day of my life'), 4000);
    }, 92000);
    S(() => incoming(jess, 'ps: add me on myspace: myspace.com/jess88 <3 tell me my top8 is fire'), 110000);
    S(() => {
      dave.status = 'away'; if (listWin && listWin._render) listWin._render();
      const c = convos[dave.id];
      if (c && c.win.el.isConnected) c.addMsg(c, 'sys', 'Dave [GfG] has changed their status to Away.');
    }, 130000);

    /* random ambient nudges from dave if you ignored him */
    S(() => {
      const c = convos[dave.id];
      if (c && c.win.el.isConnected && Math.random() < .5) {
        addMsgAmbient(c);
      }
    }, 150000);
    function addMsgAmbient(c) {
      c.addMsg(c, 'sys', 'Dave [GfG] has sent you a nudge!');
      Sound.play('msnNudge'); nudgeShake(c);
    }
  }

  /* tray icon (registered by main.js on demand) */
  APPS.msn.initTray = function () {
    trayRef = WM.addTray('msn', ICON.msnTray, 'MSN Messenger', () => {
      if (!online) return APPS.msn.launch();
      showList();
    });
  };
  return APPS.msn;
})();
