/* ==========================================================================
   media.js — real playback support for Winamp and Windows Media Player.
   Songs declared in js/config.js (RETRO.media.sources) with a src — a file
   in assets/media/ or any mp3/mp4 URL — are played for real; without a src
   the players simulate playback (LED timer + visualizer).
   ========================================================================== */
'use strict';

const Media = (() => {
  /* resolve a src for a title: exact key first (case-insensitive), then substring */
  function srcFor(title) {
    const sources = (window.RETRO && RETRO.media && RETRO.media.sources) || {};
    const t = String(title || '').toLowerCase();
    if (!t) return null;
    for (const k in sources) if (k.toLowerCase() === t) return sources[k];
    for (const k in sources) if (k.length > 2 && t.includes(k.toLowerCase())) return sources[k];
    return null;
  }

  /* "Add Local / Öffnen…" — a file picker that hands back (objectURL, fileName) */
  function pickFile(accept, cb) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept || 'audio/*,video/*';
    inp.addEventListener('change', () => {
      const f = inp.files && inp.files[0];
      if (f) cb(URL.createObjectURL(f), f.name);
    });
    inp.click();
  }

  const fmt = s => Math.floor((s || 0) / 60) + ':' + String(Math.floor((s || 0) % 60)).padStart(2, '0');
  return { srcFor, pickFile, fmt };
})();
