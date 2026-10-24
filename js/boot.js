/* ==========================================================================
   boot.js — BIOS POST, XP boot loader, welcome/logon screen, shutdown, BSOD
   ========================================================================== */
'use strict';

const Boot = (() => {
  const $ = id => document.getElementById(id);
  const el = WM.el;
  let welcomeTimer = null;

  /* ---------------- BIOS ---------------- */
  const BIOS_LINES = [
    'Award Modular BIOS v6.00PG, An Energy Star Ally',
    'Copyright (C) 1984-2003, Award Software, Inc.',
    '',
    'Intel(r) Pentium(r) 4 CPU 2.40GHz',
    'Memory Test : 0522252K OK',
    '',
    'Award Plug and Play BIOS Extension v1.1A',
    'Copyright (C) 1984-2003, Award Technologies, Inc.',
    '',
    'Press DEL to enter SETUP',
    '05/20/2003-i845PE-ALC650-686B-2A6MKPCBC-00',
    '',
    'Detecting IDE Primary Master ... WDC WD400BB-00DEA0',
    'Detecting IDE Secondary Master ... CD-RW WDCM-SVR-208B',
    'Detecting IDE Secondary Slave  ... None',
    '',
    'Primary Master  : WDC WD400BB-00DEA0      UDMA-100',
    'Secondary Master: WDCM-SVR-208B           UDMA-33',
    '',
    'Loading SCSI BIOS ........ OK',
    'Loading PXE ROM ........... skipped',
    '',
    'STARTING WINDOWS XP...'
  ];

  function typeBios() {
    return new Promise(res => {
      const scr = $('bios');
      scr.classList.remove('hidden');
      scr.textContent = '';
      let i = 0, done = false;
      const finish = () => { if (done) return; done = true; clearTimeout(t); scr.classList.add('hidden'); res(); };
      const step = () => {
        if (done) return;
        if (i < BIOS_LINES.length) {
          scr.textContent += BIOS_LINES[i] + '\n';
          i++;
          t = setTimeout(step, i === 4 ? 420 : 70);
        } else { t = setTimeout(finish, 700); }
      };
      let t = setTimeout(step, 250);
      scr.addEventListener('click', finish);
      document.addEventListener('keydown', finish, { once: true });
    });
  }

  /* ---------------- BOOT LOADER ---------------- */
  function bootLoader(ms) {
    return new Promise(res => {
      const scr = $('boot');
      scr.classList.remove('hidden');
      setTimeout(() => {
        scr.classList.add('hidden');
        res();
      }, ms || 4200);
    });
  }

  /* ---------------- WELCOME ---------------- */
  function showWelcome(autoplayHint) {
    return new Promise(res => {
      const scr = $('welcome');
      scr.classList.remove('hidden');
      const users = $('welcome-users');
      users.innerHTML = '';

      const mk = (name, sub, icon, admin) => {
        const tile = el('div', 'wu-tile');
        const im = el('img'); im.src = icon; im.dataset.fb = icon;
        const tx = el('div');
        tx.innerHTML = '<div class="wu-name">' + name + '</div><div class="wu-sub">' + sub + '</div>';
        tile.append(im, tx);
        tile.addEventListener('click', () => {
          Sound.unlock();
          Sound.play('startup');
          scr.classList.add('hidden');
          if (welcomeTimer) clearInterval(welcomeTimer);
          res(name === 'User' ? 'User' : name);
        });
        return tile;
      };
      users.append(
        mk('User', 'Administrator', ICON.userTile, true),
        mk('Guest', 'Guest', ICON.userAccounts, false)
      );

      const clock = $('welcome-clock');
      const tick = () => {
        const n = new Date();
        clock.textContent = ((n.getHours() % 12) || 12) + ':' + String(n.getMinutes()).padStart(2, '0') + ' ' +
          (n.getHours() >= 12 ? 'PM' : 'AM') + '\n' +
          n.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      };
      tick(); welcomeTimer = setInterval(tick, 1000);
    });
  }

  /* ---------------- SESSION FLOW ---------------- */
  function enterDesktop(user) {
    $('desktop-root').classList.remove('hidden');
    Main.onLogin(user);
  }

  async function bootSequence() {
    await typeBios();
    await bootLoader(4200);
    const user = await showWelcome();
    enterDesktop(user);
  }

  /* ---------------- LOG OFF / SHUT DOWN / RESTART ---------------- */
  function logoff() {
    WM.closeAllMenus();
    document.getElementById('start-menu').classList.add('hidden');
    Main.closeAllWindows();
    const scr = $('logoff-screen');
    Sound.play('logoff');
    scr.classList.remove('hidden');
    setTimeout(() => {
      scr.classList.add('hidden');
      $('desktop-root').classList.add('hidden');
      showWelcome().then(user => enterDesktop(user));
    }, 1800);
  }

  function shutdownFlow(restart) {
    WM.closeAllMenus();
    Main.closeAllWindows();
    const scr = $('shutdown-screen');
    const txt = $('shutdown-text');
    Sound.play('shutdown');
    txt.innerHTML = 'Windows is shutting down...<span class="sd-bar"><i></i></span>';
    scr.classList.remove('hidden');
    setTimeout(() => {
      scr.classList.add('hidden');
      if (restart) {
        $('desktop-root').classList.add('hidden');
        bootSequence();
      } else {
        const safe = $('safe-screen');
        safe.classList.remove('hidden');
        const re = () => { safe.removeEventListener('click', re); location.reload(); };
        safe.addEventListener('click', re);
      }
    }, 2600);
  }

  function standby() {
    const scr = $('shutdown-screen');
    const txt = $('shutdown-text');
    txt.innerHTML = 'Entering stand by mode...';
    scr.classList.remove('hidden');
    setTimeout(() => {
      txt.innerHTML = '';
      scr.style.background = '#000';
      const wake = () => {
        document.removeEventListener('keydown', wake);
        document.removeEventListener('click', wake);
        scr.classList.add('hidden');
        scr.style.background = '#000';
        showWelcome().then(user => enterDesktop(user));
      };
      document.addEventListener('keydown', wake);
      document.addEventListener('click', wake);
    }, 1400);
  }

  /* ---------------- BSOD ---------------- */
  function bsod(stopCode) {
    const scr = $('bsod');
    $('bsod-text').innerHTML =
      '<span class="bsod-tag">STOP: 0x000000D1 (0x0000000C, 0x00000002, 0x00000000, 0xF7568A95)</span><br><br>' +
      'A problem has been detected and Windows has been shut down to prevent damage to your computer.<br><br>' +
      'DRIVER_IRQL_NOT_LESS_OR_EQUAL<br><br>' +
      'If this is the first time you\'ve seen this stop error screen,<br>' +
      'restart your computer. If this screen appears again, follow<br>' +
      'these steps:<br><br>' +
      'Check to make sure any new hardware or software is properly installed.<br>' +
      'If this is a new installation, ask your hardware or software manufacturer<br>' +
      'for any Windows updates you might need.<br><br>' +
      'If problems continue, disable or remove any newly installed hardware<br>' +
      'or software. Disable BIOS memory options such as caching or shadowing.<br>' +
      'If you need to use safe mode to remove or disable components, restart<br>' +
      'your computer, press F8 to select Advanced startup options, and then<br>' +
      'select safe mode.<br><br>' +
      'Technical information:<br><br>' +
      '***&nbsp;&nbsp;&nbsp;&nbsp;STOP: 0x000000D1 (0x0000000C, 0x00000002, 0x00000000, 0xF7568A95)<br>' +
      '***&nbsp;&nbsp;&nbsp;&nbsp;NETSVC.SYS - Address F7568A95 base at F7560000, DateStamp 3e6dd67f<br><br>' +
      'Beginning dump of physical memory<br>' +
      'Physical memory dump complete.<br>' +
      'Press any key to restart your computer&nbsp;&nbsp;&nbsp;(click here)&nbsp;';
    scr.classList.remove('hidden');
    Sound.play('error');
    const re = () => {
      document.removeEventListener('keydown', re);
      scr.removeEventListener('click', re);
      scr.classList.add('hidden');
      $('desktop-root').classList.add('hidden');
      bootSequence();
    };
    document.addEventListener('keydown', re);
    scr.addEventListener('click', re);
  }

  function turnOffDialog() {
    const d = document.getElementById('turnoff-dialog');
    d.classList.remove('hidden');
    const hide = () => d.classList.add('hidden');
    $('btn-turnoff').onclick = () => { hide(); shutdownFlow(false); };
    $('btn-restart').onclick = () => { hide(); shutdownFlow(true); };
    $('btn-standby').onclick = () => { hide(); standby(); };
    $('btn-turncancel').onclick = hide;
  }

  return { bootSequence, logoff, shutdownFlow, standby, bsod, showWelcome, turnOffDialog };
})();
