/* ==========================================================================
   config.js — user settings. Edit the values and refresh; no build step.
   ========================================================================== */
'use strict';

window.RETRO = {
  boot: {
    /* true = go straight to the desktop, skipping BIOS POST, the XP boot
       loader and the welcome screen. The Restart / BSOD flows skip too;
       Log Off still shows the welcome screen. */
    skipToDesktop: true
  },
  games: {
    /* true  = games "need a CD": clicking Counter-Strike 1.5, StarCraft,
       Total Annihilation or Command & Conquer only opens the splash screen,
       followed by a period-correct "insert CD" error.
       false = the full game-window simulations open.
       Minesweeper and the Steam client itself always work. */
    requireCd: true
  }
};
