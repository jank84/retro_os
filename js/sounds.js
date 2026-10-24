/* ==========================================================================
   sounds.js — system sound engine (authentic XP + MSN sounds, hot-linked)
   ========================================================================== */
'use strict';

const Sound = (() => {
  const S = CDN;
  const FILES = {
    startup:      S.w32 + 'audio/xp_startup.mp3',
    startupLong:  S.w32 + 'audio/XPStartup.mp3',
    logon:        S.w32 + 'audio/XPLogonSound.mp3',
    logoff:       S.w32 + 'audio/XPLogoffSound.mp3',
    shutdown:     S.w32 + 'audio/xp_shutdown.mp3',
    error:        S.w32 + 'audio/XPCriticalStop.mp3',
    ding:         S.w32 + 'audio/XPDing.mp3',
    exclaim:      S.w32 + 'audio/XPExclamation.mp3',
    balloon:      S.w32 + 'audio/XPBalloon.mp3',
    recycle:      S.w32 + 'audio/XPRecycle.mp3',
    restore:      S.w32 + 'audio/XPRestore.mp3',
    minimize:     S.w32 + 'audio/XPMinimize.mp3',
    menu:         S.w32 + 'audio/XPMenuCommand.mp3',
    nav:          S.w32 + 'audio/NavigationStart.mp3',
    hardware:     S.w32 + 'audio/XPHardwareInsert.mp3',
    // legacy scheme sounds (win98/2000 era, also used by ICQ vibes)
    chimes:       S.w32 + 'audio/chimes.mp3',
    chord:        S.w32 + 'audio/chord.mp3',
    dingLegacy:   S.w32 + 'audio/ding.mp3',
    notifyLegacy: S.w32 + 'audio/notify.mp3',
    ringin:       S.w32 + 'audio/ringin.mp3',
    ringout:      S.w32 + 'audio/ringout.mp3',
    tada:         S.w32 + 'audio/tada.mp3',
    // MSN Messenger sounds (authentic rips)
    msnRecv:      S.ia + 'newemail/newalert.mp3',
    msnEmail:     S.ia + 'newemail/newemail.mp3',
    msnOnline:    S.ia + 'newemail/online.mp3',
    msnNudge:     S.msnr + 'sounds/nudge.mp3',
    // ICQ flavor (distinct from MSN)
    icqRecv:       S.w32 + 'audio/chord.mp3',
    icqLogin:      S.w32 + 'audio/ringin.mp3',
    icqSent:       S.w32 + 'audio/ding.mp3',
    icqConnect:    S.w32 + 'audio/ringout.mp3',
    icqDisconnect: S.w32 + 'audio/chimes.mp3',
    icqStatus:     S.w32 + 'audio/notify.mp3'
  };

  const cache = {};
  let muted = false;
  let master = 1;
  let ctx = null;

  function audioCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function synth(kind) {
    const ac = audioCtx();
    if (!ac || muted || master === 0) return;
    const t = ac.currentTime;
    const M = master;
    const tone = (freq, start, dur, type, vol, slide) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t + start);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + start + dur);
      g.gain.setValueAtTime(0.0001, t + start);
      g.gain.exponentialRampToValueAtTime((vol || 0.15) * M, t + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      o.connect(g).connect(ac.destination);
      o.start(t + start); o.stop(t + start + dur + 0.05);
    };
    switch (kind) {
      case 'msnSent':   tone(760, 0, 0.09, 'sine', 0.12); tone(1150, 0.07, 0.12, 'sine', 0.12); break;
      case 'msnOffline':tone(520, 0, 0.16, 'sine', 0.12, 300); break;
      case 'click':     tone(1400, 0, 0.03, 'square', 0.05); break;
      case 'icqError':  tone(220, 0, 0.14, 'sawtooth', 0.12); tone(180, 0.16, 0.18, 'sawtooth', 0.12); break;
      case 'nudgeSynth':tone(160, 0, 0.25, 'sawtooth', 0.2, 60); break;
      default:          tone(880, 0, 0.08, 'sine', 0.1);
    }
  }

  function play(name, opts) {
    opts = opts || {};
    if (muted || master === 0) return;
    const url = FILES[name];
    const vol = (opts.vol != null ? opts.vol : 0.9) * master;
    if (!url) { synth(name); return; }
    try {
      let a = cache[name];
      if (!a) {
        a = new Audio(url); a.preload = 'auto'; a.volume = vol;
        a.addEventListener('error', () => {
          delete cache[name];
          if (a._retried) { synth(name === 'msnSent' ? 'msnSent' : 'click'); return; }
          /* the browser may have cached a stale 404 from the CDN — retry bypassing cache */
          const b = new Audio(url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now());
          b.preload = 'auto'; b.volume = vol; b._retried = 1;
          b.addEventListener('error', () => { delete cache[name]; synth(name === 'msnSent' ? 'msnSent' : 'click'); });
          cache[name] = b;
          b.play().catch(() => {});
        });
        cache[name] = a;
      }
      const c = a.cloneNode(true);
      c.volume = vol;
      c.play().catch(() => { /* autoplay policy or offline — stay silent */ });
    } catch (e) { synth('click'); }
  }

  /* unlock: called from the very first user gesture (the boot click) */
  function unlock() { audioCtx(); }

  return {
    play, unlock,
    get muted() { return muted; },
    setMuted(v) { muted = v; },
    get volume() { return master; },
    setVolume(v) { master = Math.max(0, Math.min(1, v)); }
  };
})();
