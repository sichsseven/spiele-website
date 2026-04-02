'use strict';

// ── Konstanten ────────────────────────────────────────────────────────────────
const FPS_TARGET = 60;
const HUD_H      = 48;   // Höhe des HUD-Bereichs in Pixel
const PW_H       = 34;   // Höhe des Power-Up-Timer-Bereichs

// ── Spielzustand ──────────────────────────────────────────────────────────────
let canvas, ctx, CW, CH;
let player        = null;
let bullets       = [];
let enemies       = [];
let boss          = null;
let powerups      = [];
let coins         = [];
let particles     = [];
let formation     = { dx: 1, dy: 0, speed: 1, enemies: [], diagonalDy: 0 };
let activePw      = { fastFire: 0, laser: 0, shield: 0 };

let score         = 0;
let wave          = 1;
let lives         = 3;
let gameCoins     = 0;
let running       = false;
let waveClearing  = false;
let bossWave      = false;
let bossDeathAnim = 0;
let loopId        = null;
let bannerTimer   = 0;
let bannerText    = '';

// Spielerdaten (aus Supabase, persistent)
let pdata = { coins: 0, upgrades: { pwDuration: 0, maxLives: 0 } };

// Permanente Upgrade-Definitionen
const UPGRADE_DEFS = {
  pwDuration: [
    { label: 'Power-Up Dauer +5s',  cost: 50,  bonus: 5  * FPS_TARGET },
    { label: 'Power-Up Dauer +10s', cost: 150, bonus: 10 * FPS_TARGET },
    { label: 'Power-Up Dauer +20s', cost: 400, bonus: 20 * FPS_TARGET },
  ],
  maxLives: [
    { label: '+1 Extra-Leben', cost: 300  },
    { label: '+1 Extra-Leben', cost: 800  },
    { label: '+1 Extra-Leben', cost: 2000 },
  ],
};

// Basis-Dauer zeitlicher Power-Ups (10 Sekunden in Frames)
const PW_BASE_DURATION = 10 * FPS_TARGET;

// ── Input ──────────────────────────────────────────────────────────────────────
const keys  = {};
let touchX  = null;

document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

document.addEventListener('touchstart', e => {
  touchX = e.touches[0].clientX;
}, { passive: true });
document.addEventListener('touchmove', e => {
  touchX = e.touches[0].clientX;
}, { passive: true });
document.addEventListener('touchend', () => { touchX = null; });

// ── Canvas & Resize ────────────────────────────────────────────────────────────
function canvasAufbauen() {
  canvas        = document.getElementById('c');
  CW            = window.innerWidth;
  CH            = window.innerHeight;
  canvas.width  = CW;
  canvas.height = CH;
  ctx           = canvas.getContext('2d');
}

window.addEventListener('resize', () => {
  if (!running || !canvas) return;
  CW            = window.innerWidth;
  CH            = window.innerHeight;
  canvas.width  = CW;
  canvas.height = CH;
  if (player) player.y = CH - 80;
});

// ── Spieler ────────────────────────────────────────────────────────────────────
function spielerErstellen() {
  player = {
    x: CW / 2,
    y: CH - 80,
    w: 40, h: 40,
    speed: 5,
    shootTimer: 0,
    shootRate: 18,
    shotLevel: 1,
  };
}

function spielerBewegen() {
  if (!player) return;
  const goLeft  = keys['ArrowLeft']  || keys['a'] || (touchX !== null && touchX < CW / 2);
  const goRight = keys['ArrowRight'] || keys['d'] || (touchX !== null && touchX >= CW / 2);
  if (goLeft)  player.x = Math.max(player.w / 2,       player.x - player.speed);
  if (goRight) player.x = Math.min(CW - player.w / 2,  player.x + player.speed);
}

// ── Game Loop ──────────────────────────────────────────────────────────────────
function tick() {
  if (!running) return;
  loopId = requestAnimationFrame(tick);
  update();
  draw();
}

function update() {
  spielerBewegen();
}

function draw() {
  ctx.fillStyle = '#05050f';
  ctx.fillRect(0, 0, CW, CH);
  sternZeichnen();
  spielerZeichnen();
}

// ── Sternenhintergrund ─────────────────────────────────────────────────────────
const STERNE = Array.from({ length: 80 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 1.5 + 0.3,
  a: Math.random() * 0.6 + 0.2,
}));

function sternZeichnen() {
  STERNE.forEach(s => {
    ctx.globalAlpha = s.a;
    ctx.fillStyle   = '#fff';
    ctx.beginPath();
    ctx.arc(s.x * CW, s.y * CH, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ── Spieler zeichnen ───────────────────────────────────────────────────────────
function spielerZeichnen() {
  if (!player) return;
  const { x, y, w, h } = player;
  const schildAktiv = activePw.shield > 0;

  ctx.save();
  ctx.fillStyle   = schildAktiv ? '#34d399' : '#3af';
  ctx.shadowColor = schildAktiv ? '#34d399' : '#3af';
  ctx.shadowBlur  = 14;

  // Raumschiff-Form: Dreieck mit Flügeln
  ctx.beginPath();
  ctx.moveTo(x,           y - h / 2);
  ctx.lineTo(x + w / 2,   y + h / 2);
  ctx.lineTo(x + w * 0.28, y + h * 0.2);
  ctx.lineTo(x - w * 0.28, y + h * 0.2);
  ctx.lineTo(x - w / 2,   y + h / 2);
  ctx.closePath();
  ctx.fill();

  // Schild-Ring
  if (schildAktiv) {
    ctx.strokeStyle = 'rgba(52,211,153,.6)';
    ctx.lineWidth   = 2;
    ctx.shadowBlur  = 18;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ── XSS-Schutz ────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ── Screens ────────────────────────────────────────────────────────────────────
function screenZeigen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── Spiel starten ──────────────────────────────────────────────────────────────
function spielStarten() {
  screenZeigen('screen-game');
  canvasAufbauen();
  spielerErstellen();

  bullets      = [];
  enemies      = [];
  powerups     = [];
  coins        = [];
  particles    = [];
  formation    = { dx: 1, dy: 0, speed: 1, enemies: [], diagonalDy: 0 };
  activePw     = { fastFire: 0, laser: 0, shield: 0 };
  score        = 0;
  wave         = 1;
  lives        = 3 + (pdata.upgrades?.maxLives || 0);
  gameCoins    = 0;
  running      = true;
  waveClearing = false;
  boss         = null;
  bossWave     = false;
  bossDeathAnim = 0;
  bannerTimer  = 0;

  if (loopId) cancelAnimationFrame(loopId);
  tick();
  welleSpawnen();   // wird in Task 4 implementiert
}

// ── Spielerdaten laden (Supabase) ──────────────────────────────────────────────
async function spielerDatenLaden() {
  try {
    const data = await PZ.loadScore('space-blaster');
    if (data?.extra_daten) {
      pdata.coins    = data.extra_daten.coins    || 0;
      pdata.upgrades = data.extra_daten.upgrades || { pwDuration: 0, maxLives: 0 };
    }
  } catch (_) {}
}

async function spielerDatenSpeichern() {
  try {
    await PZ.saveGameData('space-blaster', score, wave, {
      coins:    pdata.coins,
      upgrades: pdata.upgrades,
    });
  } catch (_) {}
}

// ── Titel-Münzen anzeigen ──────────────────────────────────────────────────────
function titelMuenzenZeigen() {
  const el = document.getElementById('title-coins');
  if (el) el.textContent = pdata.coins;
}

// Platzhalter-Funktionen (werden in späteren Tasks implementiert)
function welleSpawnen() {}
function hudAktualisieren() {}
function rangliste_zeigen() { screenZeigen('screen-lb'); }
function shop_zeigen()      { screenZeigen('screen-shop'); }
function spielEnde()        { running = false; if (loopId) cancelAnimationFrame(loopId); screenZeigen('screen-gameover'); }

// ── Init ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await spielerDatenLaden();
  titelMuenzenZeigen();

  document.getElementById('btn-play').addEventListener('click', spielStarten);
  document.getElementById('btn-retry').addEventListener('click', spielStarten);
  document.getElementById('btn-lb').addEventListener('click', rangliste_zeigen);
  document.getElementById('btn-lb-go').addEventListener('click', rangliste_zeigen);
  document.getElementById('btn-lb-back').addEventListener('click', () => screenZeigen('screen-title'));
  document.getElementById('btn-shop-title').addEventListener('click', shop_zeigen);
  document.getElementById('btn-shop-go').addEventListener('click', shop_zeigen);
  document.getElementById('btn-shop-back').addEventListener('click', () => screenZeigen('screen-title'));
});
