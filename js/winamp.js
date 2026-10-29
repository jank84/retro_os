/* ==========================================================================
   winamp.js — Winamp 2.91 "it really whips the llama's ass" (2004 era).
   The classic skin: main window (LED time, scrolling title, spectrum
   analyzer, VU meters, transport, ZUFALL) + playlist window with the exact
   playlist from a real 2006 desktop screenshot.
   Real playback: any track that has a src via RETRO.media.sources
   (js/config.js) or "Add Local…" / a pasted mp3 link plays FOR REAL;
   everything else is simulated (LED timer + visualizer).
   ========================================================================== */
'use strict';

APPS.winamp = (() => {
  const el = WM.el;

  /* the playlist as seen on the desktop screenshot (oldieparty) */
  const TRACKS = [
    { t: 'Elton John - Are You Ready For Love', len: 261, c: 0 },
    { t: 'Godsmack - Straight Out Of Line', len: 255, c: 1 },
    { t: 'Godsmack - I Stand Alone', len: 246, c: 0 },
    { t: 'Xavier Naidoo - Sie sieht mich nicht', len: 264, c: 0 },
    { t: 'Bobby Vee - Take Good Care Of My Baby', len: 157, c: 0 },
    { t: 'Robbie Williams - Beyond The Sea', len: 271, c: 0 },
    { t: 'The Tea Party - Watching You Would Stay', len: 251, c: 0 },
    { t: "Shakira - Don't Bother", len: 259, c: 0 },
    { t: 'The Tea Party - Decade', len: 232, c: 0 },
    { t: '3 doors down - Here without you', len: 245, c: 3 },
    { t: 'Counting Crows - Colorblind', len: 204, c: 2 },
    { t: 'Aimes Mann - You Could Make A Killing', len: 215, c: 2 },
    { t: 'Red Hot Chili Peppers - Under The Bridge', len: 273, c: 3 },
    { t: 'Matt Uelmen - tristram.mp3', len: 460, c: 2 },
    { t: 'Pearl Jam - Man Of The Hour', len: 225, c: 2 }
  ];

  let mainWin = null, plWin = null;
  let cur = 7 /* screenshot: row 8 selected */, playing = false, pos = 0, shuffle = false;
  let audio = null, ticker = null, raf = null;
  let ledEl, metaEl, marqEl, led2El, vizCv, vuL, vuR, plListEl, totalEl;
  let vuLv = 0, vuRv = 0;

  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const srcOf = tr => tr.src || Media.srcFor(tr.t);

  /* ---------------- windows ---------------- */
  function bar(cap, onCloseX) {
    const b = el('div', 'wa-bar');
    b.innerHTML = '<span class="wa-grip"></span><span class="wa-bartext">' + cap + '</span>';
    const mk = (t, title, fn) => { const x = el('b', 'wa-xb'); x.textContent = t; x.title = title; x.addEventListener('click', fn); b.append(x); };
    mk('\u2013', 'Shade', () => WM.msg('Winamp', 'Shade mode ist in dieser Simulation leider echte Winamp-Geheimwissenschaft.', { type: 'info' }));
    mk('\u25A1', 'Windowshade', () => WM.msg('Winamp', 'Der Listshades-Modus wurde durch zu viele MP3s im Playlist-Ordner besch\u00E4digt.', { type: 'error' }));
    mk('\u00D7', 'Close', onCloseX);
    b.addEventListener('mousedown', () => { if (mainWin) mainWin.focus(); });
    return b;
  }

  function buildMain() {
    const body = el('div', 'wa-main');
    body.append(bar('WINAMP', () => closeAll()));
    const mid = el('div', 'wa-mid');
    ledEl = el('div', 'wa-led'); ledEl.textContent = '00:00';
    const info = el('div', 'wa-info');
    const wrap = el('div', 'wa-scrollwrap');
    marqEl = el('span'); marqEl.textContent = cur >= 0 ? TRACKS[cur].t : '*** Winamp 2.91 \u2014 it really whips the llama\u0027s ass ***';
    wrap.append(marqEl);
    metaEl = el('div', 'wa-meta'); metaEl.textContent = '128 kb/s \u00B7 44 kHz \u00B7 stereo \u00B7 simuliert';
    info.append(wrap, metaEl);
    mid.append(ledEl, info);
    const low = el('div', 'wa-low');
    vizCv = el('canvas'); vizCv.width = 150; vizCv.height = 26; vizCv.className = 'wa-viz';
    const meters = el('div', 'wa-meters');
    vuL = el('i'); vuR = el('i'); vuL.title = 'L'; vuR.title = 'R';
    meters.append(vuL, vuR);
    const btns = el('div', 'wa-btns');
    const mk = (g, title, a) => { const b = el('b'); b.innerHTML = g; b.title = title; b.dataset.a = a; btns.append(b); };
    mk('&#9198;', 'Vorheriger', 'prev'); mk('&#9654;', 'Play (L)', 'play'); mk('&#10074;&#10074;', 'Pause', 'pause');
    mk('&#9632;', 'Stop (S)', 'stop'); mk('&#9197;', 'N\u00E4chster', 'next'); mk('&#9211;', 'Eject', 'eject');
    const shuf = el('b', 'wa-shuf'); shuf.textContent = 'ZUFALL'; shuf.dataset.a = 'shuf'; shuf.title = 'Zufallswiedergabe';
    btns.append(shuf);
    low.append(vizCv, meters, btns);
    btns.addEventListener('click', e => { const b = e.target.closest('b[data-a]'); if (b) act(b.dataset.a); });
    const foot = el('div', 'wa-foot');
    foot.innerHTML = '<span>WINAMP</span><span class="wa-kb"></span><i data-joke>Gleich hier: Ihr MP3-Regal, 2 GB</i>';
    body.append(mid, low, foot);

    mainWin = WM.openWindow({ title: 'Winamp', icon: WINAMP_ICON, app: 'winamp',
      width: 282, height: 190, cls: 'wa-outer', body, appContext: true, resizable: false });
    mainWin.body.style.padding = '0';
    mainWin.body.innerHTML = '';
    mainWin.body.append(body);
    mainWin.el.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation();
      WM.contextMenu(e.clientX, e.clientY, ctxItems(), 230);
    });
    mainWin.onClose = () => { stopAudio(); playing = false; cancelAnimationFrame(raf); clearInterval(ticker);
      if (plWin && plWin.el.isConnected) plWin.close();
      mainWin = null; };
  }

  function buildPl() {
    const body = el('div', 'wa-pl');
    body.append(bar('WINAMP PLAYLIST', () => { if (plWin) plWin.close(); }));
    plListEl = el('div', 'wa-pl-list');
    drawRows();
    const foot = el('div', 'wa-pl-foot');
    totalEl = el('span', 'wa-total');
    totalEl.textContent = fmt(TRACKS.reduce((a, t) => a + (t.len || 0), 0)) + '/TOTAL ' + TRACKS.length;
    const mk = (label, title, a) => { const b = el('b', 'wa-pb' + (a === 'shuf' ? ' wa-shuf' : '')); b.textContent = label; b.title = title || label; if (a) b.dataset.a = a; foot.append(b); };
    mk('SHUF', 'Zufallswiedergabe', 'shuf');
    mk('AMPL', 'Amplify \u2014 \u00FCberteuerter Skin-Knopf', () => WM.msg('Winamp', 'AMPL: +3 dB. Mehr warne nicht drin.', { type: 'info' }));
    mk('MARSH', 'Marsh \u2014 mysteri\u00F6ser Skin-Knopf', () => WM.msg('Winamp', 'MARSH wurde nicht gefunden. Er ist auch nicht auf der Rechnung.', { type: 'info' }));
    mk('MELIE', 'Melie \u2014 ebenso mysteri\u00F6s', () => WM.msg('Winamp', 'MELIE? K\u00F6nnte ein Plug-in sein. K\u00F6nnte auch Kaffeebohnenmeanen.', { type: 'info' }));
    mk('DLLs', 'Plug-ins', () => WM.msg('Winamp', 'Geladene DLLs:\n\nin_mp3.dll  \u2014 MPEG Layer-3\nin_ogg.dll  \u2014 Ogg Vorbis\nout_wave.dll \u2014 Dein Realtek AC\u009697\nvis_avs.dll \u2014 "es wird einfach nicht weniger RAM"', { type: 'info' }));
    led2El = el('span', 'wa-led small'); led2El.textContent = '00:00';
    foot.append(totalEl, document.createTextNode(' '), led2El);
    const mk2 = (g, a) => { const b = el('b', 'wa-pb'); b.innerHTML = g; b.dataset.a = a; foot.append(b); };
    mk2('&#9654;', 'play'); mk2('&#9632;', 'stop'); mk2('&#9197;', 'next');
    const plb = el('b', 'wa-pb hide'); plb.textContent = 'PLAY LIST'; plb.title = 'Playlist-Fenster schlie\u00DFen';
    plb.addEventListener('click', () => { if (plWin) plWin.close(); });
    foot.append(plb);
    foot.addEventListener('click', e => { const b = e.target.closest('b[data-a]'); if (b) act(b.dataset.a); });
    body.append(plListEl, foot);

    plWin = WM.openWindow({ title: 'Winamp Playlist', icon: WINAMP_ICON, app: 'winamp',
      width: 282, height: 300, cls: 'wa-pl-outer', body, appContext: true });
    plWin.body.style.padding = '0';
    plWin.body.innerHTML = '';
    plWin.body.append(body);
    plWin.el.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation();
      WM.contextMenu(e.clientX, e.clientY, ctxItems(), 230);
    });
    plWin.onClose = () => { plWin = null; };
    plWin.el.style.left = (parseInt(mainWin.el.style.left, 10) || 80) + 12 + 'px';
    plWin.el.style.top = (parseInt(mainWin.el.style.top, 10) || 80) + 178 + 'px';
  }

  function drawRows() {
    if (!plListEl) return;
    plListEl.innerHTML = '';
    TRACKS.forEach((tr, i) => {
      const r = el('div', 'wa-row c' + tr.c + (i === cur ? ' sel' : ''));
      const nm = el('span'); nm.textContent = (i + 1) + '. ' + tr.t + (srcOf(tr) ? ' \u25CF' : '');
      nm.title = tr.t + (srcOf(tr) ? '  \u2014 echte Audiodatei' : '  \u2014 simuliert (kein src in config.js)');
      const d = el('span'); d.textContent = fmt(tr.len);
      r.append(nm, d);
      r.addEventListener('click', () => { cur = i; drawRows(); updateInfo(); });
      r.addEventListener('dblclick', () => play(i));
      plListEl.append(r);
    });
  }

  /* ---------------- playback ---------------- */
  function act(a) {
    if (a === 'play') { if (playing) pauseIt(); else play(cur < 0 ? 0 : cur); }
    else if (a === 'pause') pauseIt();
    else if (a === 'stop') stopIt();
    else if (a === 'next') play(shuffle ? randNext() : (cur + 1) % TRACKS.length);
    else if (a === 'prev') play(shuffle ? randNext() : (cur + TRACKS.length - 1) % TRACKS.length);
    else if (a === 'eject') { stopIt(); cur = -1; drawRows(); updateInfo(); }
    else if (a === 'shuf') {
      shuffle = !shuffle;
      document.querySelectorAll('.wa-shuf').forEach(x => x.classList.toggle('on', shuffle));
      Sound.play('click');
    }
  }
  const randNext = () => { let n; do { n = Math.floor(Math.random() * TRACKS.length); } while (TRACKS.length > 1 && n === cur); return n; };

  function updateInfo() {
    const tr = cur >= 0 ? TRACKS[cur] : null;
    marqEl.textContent = tr ? tr.t : '*** Winamp 2.91 \u2014 it really whips the llama\u0027s ass ***';
    marqEl.classList.toggle('go', playing && !!tr);
    metaEl.textContent = tr ? '128 kb/s \u00B7 44 kHz \u00B7 stereo \u00B7 ' + (srcOf(tr) ? 'MP3' : 'simuliert') : '128 kb/s \u00B7 44 kHz \u00B7 stereo \u00B7 simuliert';
    if (mainWin) mainWin.setTitle(tr && playing ? tr.t + ' - Winamp' : 'Winamp');
  }
  function play(i) {
    cur = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    pos = 0; playing = true;
    const src = srcOf(TRACKS[cur]);
    stopAudio();
    if (src) {
      audio = new Audio(src);
      audio.onended = () => act('next');
      audio.onerror = () => { WM.msg('Winamp', 'Winamp konnte "' + TRACKS[cur].t + '" nicht \u00F6ffnen.\n\nDatei nicht gefunden \u2014 PR\u00DCFEN SIE DEN PFAD IN js/config.js (RETRO.media.sources).', { type: 'error', width: 440 }); stopIt(); };
      audio.play().catch(() => {});
    }
    drawRows(); updateInfo(); vizLoop();
    clearInterval(ticker);
    ticker = setInterval(() => {
      if (!playing) return;
      pos = audio ? audio.currentTime : pos + .25;
      const len = TRACKS[cur] ? TRACKS[cur].len : 0;
      if (!audio && pos >= len) { act('next'); return; }
      ledEl.textContent = fmt(pos); led2El.textContent = fmt(pos);
    }, 250);
    Sound.play('click');
  }
  function pauseIt() { playing = false; if (audio) audio.pause(); marqEl.classList.remove('go'); updateInfo(); }
  function stopIt() {
    playing = false; pos = 0; stopAudio();
    ledEl.textContent = '00:00'; led2El.textContent = '00:00';
    drawRows(); updateInfo();
  }
  function stopAudio() { if (audio) { audio.onended = null; audio.pause(); audio = null; } }

  function vizLoop() {
    cancelAnimationFrame(raf);
    const cx = vizCv.getContext('2d');
    const N = 30, vals = Array.from({ length: N }, () => playing ? Math.random() : 0);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      cx.clearRect(0, 0, 150, 26);
      for (let i = 0; i < N; i++) {
        vals[i] += (Math.random() - .5) * (playing ? .5 : .12);
        vals[i] = Math.max(playing ? .08 : .02, Math.min(1, vals[i]));
        if (Math.random() < (playing ? .015 : .004)) vals[i] = playing ? .4 + Math.random() * .6 : .02;
        const h = Math.max(1, vals[i] * 22), x = i * 5;
        cx.fillStyle = h > 18 ? '#ff5030' : h > 11 ? '#ffd020' : '#30ff40';
        for (let y = 26 - h; y < 26; y += 2) cx.fillRect(x, y, 4, 1.4);
      }
      vuLv = Math.max(vuLv - .028, playing ? .35 + Math.random() * .6 : .02);
      vuRv = Math.max(vuRv - .028, playing ? .35 + Math.random() * .6 : .02);
      if (vuL) { vuL.style.width = Math.round(vuLv * 100) + '%'; vuR.style.width = Math.round(vuRv * 100) + '%'; }
    };
    tick();
  }

  function ctxItems() {
    return [
      { label: 'Play', action: () => act('play') },
      { label: 'Stop', action: () => act('stop') },
      '-',
      { label: 'Add Local\u2026  (MP3-Datei w\u00E4hlen)', action: () => Media.pickFile('audio/*', (url, name) => {
        TRACKS.push({ t: name.replace(/\.[^.]+$/, ''), len: 210, c: TRACKS.length % 4, src: url });
        drawRows();
        if (totalEl) totalEl.textContent = fmt(TRACKS.reduce((a, t) => a + (t.len || 0), 0)) + '/TOTAL ' + TRACKS.length;
        WM.balloon('Winamp', name + ' wurde zur Playlist hinzuf\u00FCgt.', WINAMP_ICON);
      }) },
      { label: 'Add URL\u2026  (mp3-Link einf\u00FCgen)', action: () => {
        const inp = el('input', 'xp-input');
        inp.value = 'http://'; inp.style.cssText = 'width:100%;margin-top:6px;';
        const txt = el('div'); txt.style.cssText = 'flex:1;';
        txt.append('URL der MP3-Datei (z.\u202FB. http://…/song.mp3):', inp);
        WM.dialog({ title: 'Add URL', icon: WINAMP_ICON, width: 440, height: 'auto', text: txt,
          buttons: [{ label: 'OK', value: 'ok', def: true }, { label: 'Abbrechen', value: null }] })
          .then(r => {
            const u = (inp.value || '').trim();
            if (r === 'ok' && u && u !== 'http://') {
              TRACKS.push({ t: decodeURIComponent(u.replace(/^https?:\/\/[^/]*\//, '').replace(/\?.*$/, '')) || 'URL-Track', len: 210, c: TRACKS.length % 4, src: u });
              drawRows();
              if (totalEl) totalEl.textContent = fmt(TRACKS.reduce((a, t) => a + (t.len || 0), 0)) + '/TOTAL ' + TRACKS.length;
              WM.balloon('Winamp', 'Track wurde zur Playlist hinzuf\u00FCgt.', WINAMP_ICON);
            }
          });
      } },
      '-',
      { label: '\u00DCber Winamp', action: () => WM.msg('\u00DCber Winamp', 'Winamp 2.91 "Radio Edit"\n\n(c) 1997\u20132006 Nullsoft, Inc.\n\nIt really whips the llama\u0027s ass!\n\nTipp: Rechtsklick auf die Fenster \u2014 "Add Local\u2026" spielt echte MP3s.\nTipp 2: js/config.js \u2192 RETRO.media.sources verbindet Playlist-Titel mit echten Dateien.', { type: 'info', width: 400 }) }
    ];
  }

  function closeAll() { if (plWin) plWin.close(); if (mainWin) mainWin.close(); }

  function launch() {
    if (mainWin && mainWin.el.isConnected) { mainWin.focus(); return mainWin; }
    buildMain();
    buildPl();
    drawRows(); updateInfo(); vizLoop();
    ledEl.textContent = '00:00';
    return mainWin;
  }
  return { launch };
})();
