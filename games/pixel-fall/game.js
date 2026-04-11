'use strict';

// ══════════════════════════════════════════════════════
//  PIXEL FALL — Konstanten
// ══════════════════════════════════════════════════════
const ZEILEN_HOEHE    = 40;
const SPIELER_GROESSE = 16;
const SPIELER_Y_RATIO = 0.35;
const COIN_RADIUS     = 6;
const COIN_CHANCE     = 0.15;
const TRAIL_LENGTH    = 12;

// ══════════════════════════════════════════════════════
//  SKIN-DEFINITIONEN
// ══════════════════════════════════════════════════════
const SKINS = {
  'default':           { name: 'Default',       quelle: 'standard',    seltenheit: null,           effekt: 'keins'          },
  'neon-glow':         { name: 'Neon Glow',      quelle: 'meilenstein', seltenheit: 'meilenstein',  effekt: 'aura-cyan',     meilenstein: 25  },
  'fire-trail':        { name: 'Fire Trail',     quelle: 'meilenstein', seltenheit: 'meilenstein',  effekt: 'trail-feuer',   meilenstein: 50  },
  'storm':             { name: 'Storm',           quelle: 'meilenstein', seltenheit: 'meilenstein',  effekt: 'blitze',        meilenstein: 100 },
  'galaxy':            { name: 'Galaxy',          quelle: 'meilenstein', seltenheit: 'meilenstein',  effekt: 'galaxy',        meilenstein: 200 },
  'god-mode':          { name: 'God Mode',        quelle: 'meilenstein', seltenheit: 'meilenstein',  effekt: 'god',           meilenstein: 500 },
  'common-stardust':   { name: 'Stardust',        quelle: 'lootbox',     seltenheit: 'common',       effekt: 'partikel-weiss' },
  'common-sparkle':    { name: 'Sparkle',         quelle: 'lootbox',     seltenheit: 'common',       effekt: 'partikel-gelb'  },
  'common-bubbles':    { name: 'Bubbles',         quelle: 'lootbox',     seltenheit: 'common',       effekt: 'partikel-blau'  },
  'common-leaves':     { name: 'Leaves',          quelle: 'lootbox',     seltenheit: 'common',       effekt: 'partikel-gruen' },
  'rare-blue-trail':   { name: 'Blue Trail',      quelle: 'lootbox',     seltenheit: 'rare',         effekt: 'trail-blau'     },
  'rare-green-trail':  { name: 'Green Trail',     quelle: 'lootbox',     seltenheit: 'rare',         effekt: 'trail-gruen'    },
  'rare-purple-trail': { name: 'Purple Trail',    quelle: 'lootbox',     seltenheit: 'rare',         effekt: 'trail-lila'     },
  'epic-inferno':      { name: 'Inferno',         quelle: 'lootbox',     seltenheit: 'epic',         effekt: 'partikel-feuer' },
  'epic-blizzard':     { name: 'Blizzard',        quelle: 'lootbox',     seltenheit: 'epic',         effekt: 'partikel-eis'   },
  'legendary-prism':   { name: 'Prism',           quelle: 'lootbox',     seltenheit: 'legendary',    effekt: 'prism'          },
};

const MEILENSTEIN_SKINS = [
  { score: 25,  id: 'neon-glow'  },
  { score: 50,  id: 'fire-trail' },
  { score: 100, id: 'storm'      },
  { score: 200, id: 'galaxy'     },
  { score: 500, id: 'god-mode'   },
];

const LOOTBOX_POOL = {
  common:    ['common-stardust','common-sparkle','common-bubbles','common-leaves'],
  rare:      ['rare-blue-trail','rare-green-trail','rare-purple-trail'],
  epic:      ['epic-inferno','epic-blizzard'],
  legendary: ['legendary-prism'],
};

// ══════════════════════════════════════════════════════
//  SPIELZUSTAND
// ══════════════════════════════════════════════════════
let canvas, ctx, CW, CH;
let animFrameId  = null;
let running      = false;
let score        = 0;
let gameCoins    = 0;
let scrollOffset = 0;
let zeit         = 0;
let bannerTimer  = 0;
let bannerText   = '';

const spieler = { x: 0, targetX: 0 };
let trail     = [];
let zeilen    = [];
let letzteGapX     = 0;
let naechsteZeileY = 0;
let coinItems = [];
let partikel  = [];

// ══════════════════════════════════════════════════════
//  SPIELERDATEN
// ══════════════════════════════════════════════════════
let pdata = {
  coins: 0,
  active_skin: 'default',
  unlocked_skins: ['default'],
  best_score: 0,
};
let currentUsername = null;
const LS_KEY = 'pixelfall_pdata';

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  PZ.init();

  const session = await PZ.getSession();
  if (!session) { window.location.href = '../../login.html'; return; }
  currentUsername = await PZ.currentUsername();

  canvas = document.getElementById('canvas');
  ctx    = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  canvasGroesseAnpassen();
  window.addEventListener('resize', canvasGroesseAnpassen);

  await spielerDatenLaden();
  verdrahteButtons();
  verdrahteInput();

  zeigeScreen('screen-menu');
  menuAktualisieren();
});

function canvasGroesseAnpassen() {
  CW = canvas.width  = window.innerWidth;
  CH = canvas.height = window.innerHeight;
}

function zeigeScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('versteckt'));
  if (id) document.getElementById(id).classList.remove('versteckt');
}

function menuAktualisieren() {
  document.getElementById('menu-username').textContent   = currentUsername || 'Spieler';
  document.getElementById('menu-best-score').textContent = pdata.best_score;
  document.getElementById('menu-coins').textContent      = pdata.coins;
}

// Platzhalter — werden in späteren Tasks implementiert
function spielerDatenLaden()     { return Promise.resolve(); }
function spielerDatenSpeichern() { return Promise.resolve(false); }
function spielStarten()          {}
function verdrahteButtons()      {}
function verdrahteInput()        {}
function shopRendern()           {}
function ranglisteRendern()      {}
function lootboxOeffnen()        {}
