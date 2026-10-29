/* ==========================================================================
   firefox.js — Mozilla Firefox 2 (2007): the default browser.
   Reuses the shared fake-web registry (buildSites in apps.js, the same one
   Internet Explorer uses) and adds period-correct extras: the German
   World-of-Warcraft-Europe portal (www.wow-europe.com) from a real desktop
   screenshot of Feb 2007. Tabs, Lesezeichen toolbar, ABF ad-filter and all.
   ========================================================================== */
'use strict';

APPS.firefox = (() => {
  const el = WM.el;
  const HOME = 'http://www.google.com';
  const wins = [];

  /* toolbar bookmarks — the "WOW" / "World of Warcraft Europe" entries are the
     recreated wow-europe.com portal (desktop_31-08-06_wowhex.bmp) */
  const BOOKMARKS = [
    { label: 'Half-Life Portal', url: 'http://www.geocities.com/siliconvalley/8821' },
    { label: 'FileFront - The Most G...', url: 'http://www.google.com/search?q=filefront' },
    { label: 'WOW', url: 'http://www.wow-europe.com/de' },
    { label: 'FUN', url: 'http://www.geocities.com/area51/6776' },
    { label: 'Email', url: 'http://www.msn.com' },
    { label: 'NewsFox', url: 'http://www.google.com/search?q=newsfox+rss+reader' },
    { sep: true },
    { label: 'World of Warcraft Europe', url: 'http://www.wow-europe.com/de' }
  ];

  function favFor(u) {
    if (/wow-europe|wowpro|thottbot/.test(u)) return ICON.wow;
    if (/msn|hotmail/.test(u)) return ICON.email;
    return ICON.url;
  }

  /* ---------- the recreated wow-europe.com portal (Patch 1.12, Aug 2006) ---------- */
  const NAV = [
    ['NEWS', ['Aktuelle News', 'Archiv', 'Patchdetails']],
    ['INFOS ZUM SPIEL', ['Game Guide', 'Erfahrung', 'Der Charakter', 'Spielvoraussetzungen', 'Zusammen spielen', 'Spieler vs. Spieler', 'Die Welt', 'Sonstiges']],
    ['INTERAKTIV', []],
    ['COMMUNITY', ['Foren', 'Community-Bereich', 'Community Events', "Im Axt Europe", 'Fanseite des Tages']],
    ['ACCOUNT', []],
    ['SUPPORT', []],
    ['MEDIEN', []]
  ];
  const NEWS = [
    ['Neues Forum für den Gamesmaster-Kundendienst', 'Tuktok', '30.08.2006'],
    ['The Burning Crusade: Talente und Fähigkeiten', '', '28.08.2006'],
    ['Naxxramas Live auf der Games Convention', 'Nyriah', '25.08.2006'],
    ['Die neuen World of Warcraft Foren sind da!', 'Nyriah', '24.08.2006'],
    ['Donner des Krieges: Patch 1.12', 'Nyriah &amp; Tuatara', '22.08.2006']
  ];
  function weuPage() {
    const L = t => '<a class="weu-l" data-go="http://www.google.com/search?q=' + encodeURIComponent('world of warcraft ' + t.replace(/&amp;/g, '&')) + '">' + t + '</a>';
    const side = NAV.map(([h, items]) =>
      '<div class="weu-h"><span>' + h + '</span></div>' +
      items.map(i => '<div class="weu-li">' + L(i) + '</div>').join('')).join('');
    const news = NEWS.map(([t, a, d], i) =>
      '<div class="weu-news"><span class="weu-ni">' + (i === 0 ? '\u2693' : '\u25A3') + '</span> ' +
      '<a class="weu-nl" data-go="http://www.google.com/search?q=' + encodeURIComponent('wow ' + t.replace(/&amp;/g, '&')) + '">' + t + '</a>' +
      (a ? ' <span class="weu-na">' + a + '</span>' : '') +
      ' <span class="weu-nd">' + d + '</span></div>' +
      (i === 1 ? '<p class="weu-p">Wir haben soeben einen Teil der neuen Talente und Zauber der kommenden Erweiterung<br>' +
        '<a class="weu-l" data-go="http://www.google.com/search?q=the+burning+crusade">The Burning Crusade</a> ver\u00F6ffentlicht. Auf den Seiten ' +
        '<a class="weu-l" data-go="http://www.google.com/search?q=talent+%C3%BCbersicht+wrath+of+the+lich+king">Talent-</a> und ' +
        '<a class="weu-l" data-go="http://www.google.com/search?q=f%C3%A4higkeitsbersicht+bc">F\u00E4higkeitsbersicht</a> k\u00F6nnt ihr schon jetzt neue Zauber, F\u00E4higkeiten und ' +
        'Talente der Magier, Paladin, Schurken, Schamanen, Hexenmeister und Krieger in der Erweiterung sehen. Wir werden die Liste in Zukunft erweitern, so ' +
        'dass dort auch die Talente und Zauber der restlichen drei Klassen zu finden sind; es lohnt sich also immer erneut vorbei zu schauen.</p>' : '')
    ).join('');
    return `<div class="weu">
  <div class="weu-top">
    <div class="weu-logo">WORLD OF <b>WARCRAFT</b></div>
    <div class="weu-topr"><span class="weu-goldbtn">JETZT SPIELEN!</span></div>
  </div>
  <div class="weu-grid">
    <div class="weu-side">${side}</div>
    <div class="weu-main">
      <img class="weu-banner" data-go="http://www.google.com/search?q=donner+des+krieges+patch+1.12" src="assets/art/weu_banner.png" data-fb="${ICON.wow}" alt="Patch 1.12 - Donner des Krieges">
      <div class="weu-h big"><span>AKTUELLES</span></div>
      ${news}
      <div class="weu-duo">
        <div class="weu-boxhead">KUNDENDIENST</div>
        <div class="weu-boxbody"><b>Fragen zum Support?</b><br>Beantwortet direkt von<br>euren Supportservern.</div>
        <div class="weu-boxhead jobs">JOBS</div>
        <div class="weu-boxbody"><b>BEWERBT EUCH JETZT!</b><br>Wolltet Ihr schon immer<br>bei Blizzard Europe?</div>
      </div>
    </div>
    <div class="weu-right">
      <div class="weu-h big"><span>WICHTIGE LINKS</span></div>
      <div class="weu-li">Kontakt</div>
      <div class="weu-li">Realmstatus</div>
      <div class="weu-li">Accouterstellung</div>
      <div class="weu-li">Accountverwaltung</div>
      <div class="weu-li">Passwort vergessen?</div>
      <div class="weu-ad"><span>NEUE</span><b>FOREN</b></div>
      <div class="weu-ad armor"><span>R\u00DCSTUNGS</span><b>SETS</b></div>
      <div class="weu-h big"><span>EINGELOGGT</span></div>
      <div class="weu-p small"><b>Neu in Azeroth?</b><br>Alles Wichtige f\u00FCr Spieleinsteiger:<br>
        <a class="weu-l" data-go="http://www.google.com/search?q=world+of+warcraft+kostenlose+probierversion">Kostenlose Probierversion</a><br>
        <a class="weu-l" data-go="http://www.google.com/search?q=infos+zum+spiel+wow">Infos zum Spiel</a></div>
    </div>
  </div>
  <div class="weu-foot">\u00A9 2004\u20132006 Blizzard Entertainment, Inc. Alle Rechte vorbehalten.<br>World of Warcraft\u00AE und Blizzard\u00AE sind Marken oder eingetragene Marken von Blizzard Entertainment, Inc.</div>
</div>`;
  }

  function launch(startUrl) {
    const root = el('div', 'ff-root');
    let statusEl;
    /* toolbar */
    const nav = el('div', 'ff-nav');
    const mkB = (t, title, fn) => { const b = el('button', 'ff-b'); b.innerHTML = t; b.title = title; if (fn) b.addEventListener('click', fn); nav.append(b); return b; };
    mkB('\u25C0', 'Zur\u00FCck', () => backN());
    mkB('\u25B6', 'Vor', () => fwdN());
    mkB('\u21BA', 'Neuer Tab', () => newTab());
    mkB('\u2715', 'Stopp', () => statusEl.textContent = 'Fertig');
    mkB('\u21BB', 'Aktualisieren', () => go(addrIn.value, true));
    mkB('\u2302', 'Startseite', () => go(HOME));
    const abf = el('span', 'ff-abf'); abf.innerHTML = '<b>ABF</b> Webads filtern:';
    const abfIn = el('input'); abfIn.placeholder = 'http://www.nervende-werbung.de/banner.html';
    abf.append(abfIn); nav.append(abf);
    const addr = el('div', 'ff-addr');
    const favIco = el('img'); favIco.src = ICON.url;
    const addrIn = el('input'); addrIn.spellcheck = false;
    const goB = el('button', 'ff-go'); goB.innerHTML = '\u2192';
    addr.append(favIco, addrIn, goB);
    nav.append(addr);
    const ggl = el('div', 'ff-ggl');
    ggl.innerHTML = '<span>Google</span>';
    const gglIn = el('input'); gglIn.placeholder = 'Suche';
    ggl.append(gglIn); nav.append(ggl);
    /* bookmark toolbar */
    const marks = el('div', 'ff-marks');
    function buildMarks() {
      marks.innerHTML = '';
      BOOKMARKS.forEach(bm => {
        if (bm.sep) { const s = el('span', 'ff-msep'); marks.append(s); return; }
        const b = el('button', 'ff-mark');
        const im = el('img'); im.src = favFor(bm.url); im.dataset.fb = ICON.url;
        b.append(im, document.createTextNode(bm.label));
        b.title = bm.url;
        b.addEventListener('click', () => go(bm.url));
        marks.append(b);
      });
    }
    buildMarks();
    /* tab bar + view + status */
    const tabbar = el('div', 'ff-tabbar');
    const tAdd = el('button', 'ff-tadd'); tAdd.innerHTML = '+'; tAdd.title = 'Neuer Tab (Strg+T)';
    const tabList = el('div', 'ff-tabs');
    tabbar.append(tabList, tAdd);
    const view = el('div', 'ff-view');
    statusEl = el('div', 'xp-status ff-status'); statusEl.textContent = 'Fertig';
    root.append(nav, marks, tabbar, view, statusEl);

    const win = WM.openWindow({ title: 'Mozilla Firefox', icon: ICON.firefox, app: 'firefox',
      width: 880, height: 620, cls: 'ff-outer', body: root });
    win.body.style.padding = '0';
    win.body.innerHTML = '';
    win.body.append(root);
    wins.push(win);
    win.el.addEventListener('contextmenu', e => e.stopPropagation());

    /* ---------------- tabs ---------------- */
    let tabs = [], cur = 0, loading = null;
    function newTab(url) {
      tabs.push({ url: '', hist: [], idx: -1, title: 'Neuer Tab' });
      cur = tabs.length - 1;
      drawTabs();
      go(url || HOME);
    }
    function killTab(i, ev) {
      if (ev) ev.stopPropagation();
      tabs.splice(i, 1);
      if (!tabs.length) { win.close(); return; }
      cur = Math.min(cur, tabs.length - 1);
      drawTabs(); go(tabs[cur].url, true);
    }
    function drawTabs() {
      tabList.innerHTML = '';
      tabs.forEach((t, i) => {
        const d = el('div', 'ff-tab' + (i === cur ? ' on' : ''));
        const im = el('img'); im.src = favFor(t.url); im.dataset.fb = ICON.url;
        const sp = el('span'); sp.textContent = t.title || 'Neuer Tab';
        const x = el('b', 'ff-tx'); x.textContent = '\u00D7';
        x.addEventListener('click', e => killTab(i, e));
        d.append(im, sp, x);
        d.addEventListener('click', () => { if (i !== cur) { cur = i; drawTabs(); go(t.url, true); } });
        tabList.append(d);
      });
    }
    tAdd.addEventListener('click', () => newTab());

    /* ---------------- navigation ---------------- */
    const SITES = Object.assign(APPS.buildSites(
      u => go(u),                       /* nav   — page links navigate this window */
      () => addrIn.value,               /* curUrl */
      t => { tabs[cur].title = t; win.setTitle(t + ' - Mozilla Firefox'); } /* setPageTitle */
    ), {
      'www.wow-europe.com': { title: 'World of Warcraft Europe', html: weuPage() },
      'www.wow-europe.com/de': { title: 'World of Warcraft Europe', html: weuPage() }
    });

    function norm(u) {
      u = (u || '').trim();
      if (!u) return HOME;
      if (/^https?:\/\//i.test(u)) return u.toLowerCase();
      if (/^www\./i.test(u) || /\.[a-z]{2,}/i.test(u)) return 'http://' + u.toLowerCase();
      return 'http://www.google.com/search?q=' + encodeURIComponent(u);
    }
    function backN() { const t = tabs[cur]; if (t.idx > 0) { t.idx--; go(t.hist[t.idx], true); } }
    function fwdN() { const t = tabs[cur]; if (t.idx < t.hist.length - 1) { t.idx++; go(t.hist[t.idx], true); } }

    function go(u, noHist) {
      u = norm(u);
      addrIn.value = u;
      favIco.src = favFor(u);
      statusEl.textContent = 'Wird geladen: ' + u + ' ...';
      clearTimeout(loading);
      view.innerHTML = '<div class="ff-loading">Ladevorgang wird gestartet\u2026</div>';
      loading = setTimeout(() => {
        const key = u.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '') || 'google.com';
        const site = SITES[key] || SITES[key + '/'] || SITES[u] || SITES[key.replace(/\?.*$/, '')];
        const t = tabs[cur];
        if (site) {
          render(site);
          t.url = u; t.title = site.title;
          win.setTitle(site.title + ' - Mozilla Firefox');
          if (!noHist) { t.hist = t.hist.slice(0, t.idx + 1); t.hist.push(u); t.idx = t.hist.length - 1; }
          statusEl.textContent = 'Fertig';
          drawTabs();
        } else if (/^javascript:/i.test(u)) { WM.msg('Firefox', 'Diese Seite wurde zu Ihrer Sicherheit nicht geladen:\nSch\u00F6ner Versuch.', { type: 'error' }); }
        else notFound(u);
      }, 300 + Math.random() * 450);
    }
    function render(site) {
      view.innerHTML = '';
      const pg = el('div', 'ie-page ff-page');
      pg.innerHTML = site.html;
      view.append(pg);
      pg.addEventListener('click', e => { const x = e.target.closest('[data-go]'); if (x) { e.preventDefault(); go(x.getAttribute('data-go')); } });
      if (site.after) site.after(pg);
      pg.querySelectorAll('form').forEach(f => { if (f.hasAttribute('data-custom')) return; f.addEventListener('submit', e => {
        e.preventDefault();
        go('http://www.google.com/search?q=' + encodeURIComponent(f.querySelector('input').value || 'windows xp'));
      }); });
    }
    function notFound(u) {
      view.innerHTML = `<div class="ff-404">
        <h2>Firefox kann die angeforderte Seite nicht laden</h2>
        <p><b>${u}</b> gefunden werden. \u2013 Der Server konnte nicht kontaktiert werden.</p>
        <ul>
          <li>Pr\u00FCfen Sie, ob alle Buchstaben des Namens korrekt geschrieben sind.</li>
          <li>Wenn Sie der Meinung sind, dass das Problem beim Server liegt, versuchen Sie es sp\u00E4ter noch einmal \u2013 der ist n\u00E4mlich weg. Endg\u00FCltig. 2003.</li>
        </ul>
        <p><a data-go="${HOME}">Weiter zu Google</a></p>
      </div>`;
      win.setTitle('Server nicht gefunden - Mozilla Firefox');
      statusEl.textContent = 'Fertig';
      view.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => go(a.getAttribute('data-go'))));
    }

    /* ---------------- menus ---------------- */
    WM.setMenu(win, [
      { label: '<u>D</u>atei', items: () => [
        { label: 'Neuer Tab', action: () => newTab() }, '-',
        { label: 'Seite schlie\u00DFen', action: () => killTab(cur) },
        { label: 'Fenster schlie\u00DFen', action: () => win.close() }]},
      { label: '<u>B</u>earbeiten', items: () => [{ label: 'Alles ausw\u00E4hlen', action: () => document.execCommand('selectAll') }] },
      { label: '<u>A</u>nsicht', items: () => [
        { label: 'Verkleinern', action: () => WM.msg('Ansicht', 'Vergr\u00F6\u00DFern/Verkleinern: 96%. Die einzige Stufe, die es gibt.', { type: 'info' }) },
        { label: 'Vollbild', action: () => WM.msg('Ansicht', 'F11? Hier ist F11 kaputt. Wie im Jahr 2007 \u00FCblich.', { type: 'error' }) }]},
      { label: '<u>C</u>hronik', items: () => [{ label: 'K\u00FCrzlich besuchte Seiten', action: () => {
        const h = tabs.flatMap(t => t.hist);
        WM.msg('Chronik', h.length ? h.slice(-12).join('\n') : 'Sie haben noch keine Chronik.', { type: 'info' }); } }] },
      { label: '<u>L</u>esezeichen', items: () => BOOKMARKS.filter(b => !b.sep).map(bm =>
        ({ label: bm.label, action: () => go(bm.url) })).concat(['-',
        { label: 'Lesezeichen hinzuf\u00FCgen\u2026', action: () => {
          const t = tabs[cur];
          if (!t.url) return;
          if (!BOOKMARKS.some(b => b.url === t.url)) {
            BOOKMARKS.push({ label: t.title.slice(0, 30), url: t.url });
            buildMarks();
            WM.balloon('Firefox', 'Lesezeichen "' + t.title.slice(0, 40) + '" wurde hinzugef\u00FCgt.', ICON.firefox);
          }
        } }])},
      { label: 'E<u>x</u>tras', items: () => [
        { label: 'Add-Ons', action: () => WM.msg('Add-Ons', 'Aktivierte Add-Ons:\n\n\u2022 ABF \u2014 Anti-Banner 0.9.9\n\u2022 Tab Mix Plus 0.1.6\n\u2022 FlashPlayer 9 r47\n\u2022 Java Plug-in 1.5.0_06 (2 Updates hinterher)\n\nABF hat heute bereits 37 nervende Banner entfernt.', { type: 'info' }) }]},
      { label: '<u>H</u>ilfe', items: () => [{ label: '\u00DCber Firefox', action: () =>
        WM.msg('\u00DCber Firefox', 'Mozilla Firefox\nVersion 2.0.0.06\n\nDer Browser, der schneller ist als der Rest.\n(Bezieht sich auf das \u00D6ffnen von 3 Tabs.)', { type: 'info' }) }]}
    ]);

    /* keybindings: Strg+T new tab */
    win.el.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 't') { e.preventDefault(); newTab(); } });
    addrIn.addEventListener('keydown', e => { if (e.key === 'Enter') go(addrIn.value); });
    goB.addEventListener('click', () => go(addrIn.value));
    gglIn.addEventListener('keydown', e => { if (e.key === 'Enter') go('http://www.google.com/search?q=' + encodeURIComponent(gglIn.value || 'world of warcraft')); });

    const i = wins.indexOf(win);
    win.onClose = () => { wins.splice(i, 1); };

    newTab(startUrl && /^https?:|^www\.|^[a-z0-9.-]+\.[a-z]{2}/i.test(startUrl) ? startUrl : HOME);
    return win;
  }

  return { launch };
})();
