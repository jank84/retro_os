/* ==========================================================================
   teamspeak.js — TeamSpeak 2 client (2006/2007 era), recreated from the real
   desktop screenshot screen_15-05-06.bmp: server "FilesMania-WOW-Private",
   the exact channel tree, periwinkle panes, log + status bar.
   ========================================================================== */
'use strict';

APPS.teamspeak = (() => {
  const el = WM.el;

  /* hand-drawn period bits */
  const SVR_ICO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
    '<circle cx="8" cy="3.6" r="2.2" fill="#1746c8"/><path d="M8 5.6 L4.6 13.8 L7 13.8 L8 10.4 L9 13.8 L11.4 13.8 Z" fill="#1746c8"/>' +
    '<rect x="2.4" y="5.4" width="11.2" height="1.7" rx=".8" fill="#1746c8"/><rect x="2.4" y="5.4" width="11.2" height=".8" fill="#4f7cf0"/></svg>');
  const CH_ICO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
    '<rect x="1.5" y="2" width="13" height="12" fill="#dcdcdc" stroke="#6b6b6b"/>' +
    '<rect x="1.5" y="2" width="13" height="2.6" fill="#a8b6e8" stroke="#6b6b6b"/>' +
    '<g stroke="#4a4a4a" stroke-width="1"><path d="M3.6 7h8.8M3.6 9.4h8.8M3.6 11.8h6"/></g></svg>');
  const USR_ICO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
    '<circle cx="8" cy="8" r="6.4" fill="#20e020" stroke="#0a7a0a"/>' +
    '<ellipse cx="6" cy="5.4" rx="2.6" ry="1.7" fill="#9dff9d" opacity=".85"/></svg>');

  /* ---- the exact tree from the screenshot ---- */
  const TREE = {
    name: 'FilesMania-WOW-Private', server: true,
    chans: [
      { name: 'Apocalypse Imperialis', flags: 'RD', users: [
        { name: 'Goldhuhnprophet', flags: 'R CA' },
        { name: 'Van Helsing der Unken Killer', flags: 'R CA' },
        { name: 'Lt_Jam', flags: 'R' } ] },
      { name: 'Warten auf BG-Teilnehmer', flags: 'R' },
      { name: 'AFK', flags: 'RS', open: true, chans: [
        { name: 'Was fuddern' }, { name: '< 5 Min' }, { name: '> 5 Min < 30 Min' },
        { name: '> 30 Min < 2 Std' }, { name: '> 2 Std' } ] },
      { name: 'PASSWORT', flags: 'R' },
      { name: 'Privater Chat', flags: 'RS', open: true, chans: [
        { name: '2 Personen, Nummer 1' }, { name: '2 Personen, Nummer 2' }, { name: '2 Personen, Nummer 3' },
        { name: '3 Personen, Nummer 1' }, { name: '3 Personen, Nummer 2' },
        { name: '4 Personen, Nummer 1' }, { name: '4 Personen, Nummer 2' } ] },
      { name: 'WOW - Regeln :: Version 1.3', flags: 'R' }
    ]
  };

  let win = null, tray = null;
  let nick = 'Lt_Jam', away = false, muted = false;

  function clock(off) {
    const d = new Date(Date.now() - (off || 0));
    return '[' + [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':') + ']';
  }

  function launch() {
    if (win && win.el.isConnected) { win.focus(); return win; }

    const body = el('div', 'ts-root');
    body.innerHTML =
      '<div class="ts-mid"><div class="ts-tree" id="ts-tree"></div>' +
      '<div class="ts-sep"></div><div class="ts-info" id="ts-info"></div></div>' +
      '<div class="ts-log" id="ts-log"></div>';
    win = WM.openWindow({ title: 'TeamSpeak 2', icon: TS_ICON, app: 'teamspeak',
      width: 640, height: 470, cls: 'ts-outer', body, appContext: true });
    win.body.style.padding = '0';
    win.body.innerHTML = '';
    win.body.append(body);
    win.el.addEventListener('contextmenu', e => e.stopPropagation());

    const treeEl = body.querySelector('#ts-tree');
    const infoEl = body.querySelector('#ts-info');
    const logEl = body.querySelector('#ts-log');

    /* ---------------- log + status ---------------- */
    function log(html, off) {
      const d = el('div', 'ts-lline');
      d.innerHTML = '<span class="ts-ts">' + clock(off) + '</span> ' + html;
      logEl.append(d); logEl.scrollTop = logEl.scrollHeight;
    }
    const status = el('div', 'xp-status ts-status');
    status.innerHTML = '<span id="ts-status-txt">Connected as ' + nick + '</span>' +
      '<span class="ts-st-r">Up: 0.0 kB/s \u00B7 Down: 0.0 kB/s \u00B7 Ping: 34 ms \u00B7 Packets loss: 0%</span>';
    win.body.append(status);

    log('Connecting to <b>www.filesmania.de</b>:8767', 9000);
    log('Connected to server <b>FilesMania-WOW-Private</b>', 7000);
    log('<span class="ts-welcome">Willkommen auf dem Laberserver!</span>', 5000);
    log('You joined channel <b>Apocalypse Imperialis</b>', 4000);

    /* ---------------- tree ---------------- */
    let sel = null;                       /* {kind:'user'|'chan'|'server', node} */
    function nodeRow(kind, label, flags, depth, extra) {
      const r = el('div', 'ts-row' + (depth === 0 ? ' srv' : ''));
      r.style.paddingLeft = (depth * 16 + 4) + 'px';
      if (extra) r.append(extra);
      const im = el('img');
      im.src = kind === 'server' ? SVR_ICO : kind === 'chan' ? CH_ICO : USR_ICO;
      im.dataset.fb = ICON.appWindow;
      const tx = el('span'); tx.textContent = label + (flags ? '  (' + flags + ')' : '');
      r.append(im, tx);
      r.addEventListener('click', ev => { ev.stopPropagation(); select(kind, label, r); });
      return r;
    }
    function toggle(open, fn) {
      const b = el('b', 'ts-tog'); b.textContent = open ? '\u2212' : '+';
      b.addEventListener('click', ev => { ev.stopPropagation(); fn(); });
      return b;
    }
    function drawTree() {
      treeEl.innerHTML = '';
      treeEl.append(nodeRow('server', TREE.name, null, 0));
      TREE.chans.forEach(c => drawChan(c, 1));
      if (!sel) select('user', 'Goldhuhnprophet', treeEl.querySelector('.ts-row:nth-child(3)') || treeEl.firstChild);
    }
    function drawChan(c, depth) {
      const hasKids = (c.chans && c.chans.length) || (c.users && c.users.length);
      const holder = el('div');
      c._open = c.open || c._open || false;
      const row = nodeRow('chan', c.name, c.flags, depth,
        hasKids ? toggle(c._open, () => { c._open = !c._open; drawTree(); refocusRow(row); }) : null);
      holder.append(row);
      if (c._open) {
        (c.users || []).forEach(u => holder.append(nodeRow('user', u.name, u.flags, depth + 1)));
        (c.chans || []).forEach(s => drawChan(s, depth + 1).forEach(n => holder.append(n)));
      }
      treeEl.append(holder);
      return [holder];
    }
    function refocusRow(row) {
      const t = treeEl.querySelector('.ts-sel'); if (t) t.classList.remove('ts-sel');
    }

    function select(kind, name, row) {
      treeEl.querySelectorAll('.ts-sel').forEach(x => x.classList.remove('ts-sel'));
      if (row) row.classList.add('ts-sel');
      sel = { kind, name };
      drawInfo(kind, name);
    }
    function findChan(name, list) {
      for (const c of (list || TREE.chans)) {
        if (c.name === name) return c;
        const f = c.chans && findChan(name, c.chans);
        if (f) return f;
      }
      return null;
    }
    function drawInfo(kind, name) {
      infoEl.innerHTML = '';
      const blk = (h, v) => {
        infoEl.append(el('div', 'ts-ih', h), el('div', 'ts-iv', v));
      };
      if (kind === 'user') {
        let flags = '';
        for (const c of [TREE, ...collectChans()]) for (const u of (c.users || [])) if (u.name === name) flags = u.flags || '';
        blk('Player:', name);
        blk('Global flags:', /R/.test(flags) ? 'Registered' : 'Unregistered');
        blk('Channel Privileges:', /CA/.test(flags) ? 'Channel Admin' : 'None');
        blk('Player Attributes:', 'None');
      } else if (kind === 'chan') {
        blk('Channel:', name);
        blk('Description:', name === 'Apocalypse Imperialis' ? 'Gilden-Channel \u2014 Apocalypse (Allianz)' : name.indexOf('Personen') === 0 ? 'Privater Chat-Raum' : '\u2014');
        blk('Clients:', name === 'Apocalypse Imperialis' ? '3' : '0');
        blk('Maximum clients:', 'unlimited');
        blk('Codec:', 'Speex \u00B7 16 kHz \u00B7 Voice');
        blk('Needed privileges:', 'None');
      } else {
        blk('Server:', TREE.name);
        blk('Welcome message:', 'Willkommen auf dem Laberserver!');
        blk('Platform:', 'win_32_x86');
        blk('Version:', 'TeamSpeak 2 Server \u00B7 2.0.12 (20060320)');
        blk('Clients:', '3 / 128');
        blk('Uptime:', '12 days, 3:14:09');
      }
    }
    function collectChans(list, out) {
      out = out || [];
      (list || TREE.chans).forEach(c => { out.push(c); if (c.chans) collectChans(c.chans, out); });
      return out;
    }
    drawTree();
    /* preselect Goldhuhnprophet like the screenshot */
    (function () {
      const rows = treeEl.querySelectorAll('.ts-row');
      for (const r of rows) if (/Goldhuhnprophet/.test(r.textContent)) { select('user', 'Goldhuhnprophet', r); break; }
    })();

    /* double-click a channel = join it */
    treeEl.addEventListener('dblclick', e => {
      const r = e.target.closest('.ts-row');
      if (!r) return;
      const nm = r.textContent.trim();
      if (findChan(nm.replace(/\s+\(.*\)$/, ''))) {
        log('You joined channel <b>' + nm.replace(/\s+\(.*\)$/, '') + '</b>');
        Sound.play('click');
      }
    });

    /* ---------------- menus ---------------- */
    function nickPrompt(title, cb) {
      const inp = el('input', 'xp-input'); inp.value = nick;
      inp.style.cssText = 'width:100%;margin-top:6px;';
      const t = el('div'); t.style.cssText = 'flex:1;';
      t.append(title, inp);
      WM.dialog({ title: 'TeamSpeak 2', icon: TS_ICON, width: 400, height: 'auto', text: t,
        buttons: [{ label: 'OK', value: 'ok', def: true }, { label: 'Abbrechen', value: null }] })
        .then(r => { if (r === 'ok') cb((inp.value || '').trim()); });
    }
    WM.setMenu(win, [
      { label: 'Connection', items: () => [
        { label: 'Connect\u2026', action: () => {
          const inp = el('input', 'xp-input'); inp.value = 'www.filesmania.de';
          inp.style.cssText = 'width:100%;margin-top:6px;';
          const t = el('div'); t.style.cssText = 'flex:1;'; t.append('Server address:', inp);
          WM.dialog({ title: 'Connect to Server', icon: TS_ICON, width: 420, height: 'auto', text: t,
            buttons: [{ label: 'Connect', value: 'ok', def: true }, { label: 'Cancel', value: null }] })
            .then(r => {
              const h = (inp.value || '').trim();
              if (r !== 'ok' || !h) return;
              if (/filesmania/i.test(h)) log('Already connected to <b>FilesMania-WOW-Private</b>. This is your home server.');
              else { log('Connecting to <b>' + h + '</b>:8767'); setTimeout(() =>
                log('<span class="ts-err">Connection failed: Es wurde kein Server namens \u201E' + h + '\u201C gefunden. (2007 hier, bitte.)</span>'), 900); }
            });
        } },
        { label: 'Disconnect', action: () => {
          log('<span class="ts-err">Disconnected: Sie wurden nicht gekickt \u2014 Sie gehen freiwillig. Respekt.</span>');
          setTimeout(() => { log('Reconnecting\u2026'); setTimeout(() => {
            log('Connected to server <b>FilesMania-WOW-Private</b>');
            log('<span class="ts-welcome">Willkommen zur\u00FCck auf dem Laberserver!</span>'); }, 1200); }, 1500);
        } }, '-',
        { label: 'Exit', action: () => win.close() } ] },
      { label: 'Channels', items: () => [
        { label: 'Join Channel\u2026', action: () => WM.msg('Join Channel', 'Channel name:\n\nApocalypse Imperialis\n\n\u2026sind Sie schon drin. Willkommen zurück!', { type: 'info' }) },
        { label: 'Create Channel\u2026', action: () => WM.msg('Create Channel', 'You do not have the privilege to create channels.\n\nFragen Sie Goldhuhnprophet. Der ist Channel Admin.', { type: 'error' }) }, '-',
        { label: 'Channel List', action: () => {
          const names = []; collectChans().forEach(c => names.push(c.name + (c.flags ? '  (' + c.flags + ')' : '')));
          WM.msg('Channels on FilesMania-WOW-Private', names.join('\n'), { type: 'info', width: 340 });
        } } ] },
      { label: 'Players', items: () => {
        const selUser = sel && sel.kind === 'user' ? sel.name : null;
        return [
          selUser ? { label: 'View User Info \u2014 ' + selUser, action: () => drawInfo('user', selUser) } : { label: 'View User Info', action: null },
          selUser ? { label: 'Whisper Message to\u2026', action: () => WM.msg('Whisper', 'Nachricht an ' + selUser + ':\n\n"Ihhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh!"', { type: 'info' }) } : { label: 'Whisper Message to\u2026', action: null }, '-',
          { label: muted ? 'Unmute' : 'Mute', checked: muted, action: () => { muted = !muted; log(muted ? 'You muted yourself. Niemand merkt es.' : 'You are audible again.'); } }, '-',
          { label: 'Kick Player', action: () => WM.msg('Kick', 'You do not have the privileges to kick players.\n\nVersuchen Sie es in 6 Monaten mit mehr Channel-Rang wieder.', { type: 'error' }) } ];
      } },
      { label: 'Self', items: () => [
        { label: 'Change Nick\u2026', action: () => nickPrompt('New nickname:', n => { if (n && n !== nick) {
          log('<b>' + nick + '</b> changed his nickname to <b>' + n + '</b>'); nick = n;
          const s = document.getElementById('ts-status-txt'); if (s) s.textContent = 'Connected as ' + nick;
          if (tray) tray.el.title = 'TeamSpeak 2 \u2014 Connected as ' + nick; } }) },
        { label: away ? 'Set Online' : 'Set Away', checked: away, action: () => {
          away = !away; log(away ? 'You are now <i>Away</i>: "Bin gleich wieder da, Verschnitt machen."' : 'You are no longer Away. Willkommen zurück!'); } }, '-',
        { label: 'Toggle Microphone', action: () => WM.msg('Sound Capture', 'Mikrofon: Realtek AC\u201997 Audio Input\n\nKalibrierung: Pegel zu leise. Bitte 47x "Aaah" in das Mikrofon rufen, während der Nachbarn schläft.', { type: 'info' }) } ] },
      { label: 'Recording', items: () => [
        { label: 'Record Current Voice Stream', action: () => WM.msg('Recording', 'Es wird gerade niemand \u00FCbertragen.\n\nAufnahme gestoppt: 0 Bytes. (rec_2007-02-15_22-41.tsrec)', { type: 'info' }) },
        { label: 'Open Recording Folder', action: () => WM.msg('Recording', 'C:\\Dokumente und Einstellungen\\User\\Eigene Dateien\\TeamSpeak 2\\recordings\\\n\n\u2014 3 Dateien \u2014\nraid_fuhrung_2006-11-02.tsrec\nmc_welt_rekord.tsrec\ngesangseinlage_van_helsing.tsrec', { type: 'info', width: 460 }) } ] },
      { label: 'Info', items: () => [
        { label: 'Server Information', action: () => WM.msg('Server Information',
          'Server:\tFilesMania-WOW-Private\nHost:\twww.filesmania.de:8767\nVersion:\tTeamSpeak 2 Server \u00B7 2.0.12\nClients:\t3 / 128\nUptime:\t12 days, 3:14:09\nOS:\twin_32_x86', { type: 'info', width: 420 }) }, '-',
        { label: 'About TeamSpeak', action: () => WM.msg('About TeamSpeak',
          'TeamSpeak Client 2.0.3 (20061218 0256)\n\n(c) 2005-2006 TeamSpeak Development Team\n\nSound: SPEEX-16 kHz \u00B7 Connected since 3 days', { type: 'info', width: 380 }) } ] },
      { label: 'Settings', items: () => [
        { label: 'Options\u2026', action: () => WM.msg('Options', 'Register:\tLt_Jam\nNickname:\t' + nick + '\n\u2022 Ident-Server: nicht gefunden\n\u2022 Hotkey "Push-to-Talk": C\n\u2022 Voice-Codec: SPEEX 16 kHz\n\u2022 Abonnement "filesmania-newsletter": ja', { type: 'info', width: 420 }) },
        { label: 'Select Style\u2026', action: () => WM.msg('Styles', 'Aktiver Style:\n\n\u25CF TeamSpeak 2 \u201EClassic\u201C\n\nWeitere Styles: 0. (Wie auch immer.)', { type: 'info' }) } ] },
      { label: 'Help', items: () => [
        { label: 'Help', action: () => WM.msg('TeamSpeak 2 Help', 'index.htm konnte nicht ge\u00F6ffnet werden.\n\nTipp: Links klick zum anh\u00F6ren, Doppelklick auf einen Channel zum beitreten.', { type: 'error' }) }, '-',
        { label: 'Order Now!', action: () => WM.msg('Order', 'TeamSpeak wurde am 15.05.2006 von FilesMania lizenziert. Eine Bestellung ist nicht mehr n\u00F6tig.', { type: 'info' }) } ] }
    ]);

    /* ---------------- tray icon ---------------- */
    tray = WM.addTray('teamspeak', TS_ICON, 'TeamSpeak 2 \u2014 Connected as ' + nick, () => {
      if (win && win.el.isConnected) win.focus(); else launch();
    });

    win.onClose = () => { win = null; if (tray) { tray.el.remove(); tray = null; } };
    return win;
  }

  return { launch };
})();
