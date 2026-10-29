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
  },
  browser: {
    /* Which browser "the web" opens with: 'firefox' or 'iexplore'.
       Affects the Start menu, quick launch, Run-dialog URLs, cmd `start`,
       desktop links and every in-app "open in browser" link. */
    default: 'firefox'
  },
  media: {
    /* Real playback for Winamp and Windows Media Player.
       Key   = (part of a) track title, matched case-insensitively.
       Value = audio/video file in assets/media/ or any direct mp3/mp4 URL.
       Tracks without a source stay simulated (LED timer + visualizer).

         'In The End': 'assets/media/in_the_end.mp3',
         'under the bridge': 'https://example.com/track.mp3',

       The desktop file "Star Wars Kid.avi" plays through this: */
    sources: {
      'star wars kid': 'assets/media/star_wars_kid.mp4'
    }
  }
};
