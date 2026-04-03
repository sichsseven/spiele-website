'use strict';

// ── Konstanten ────────────────────────────────────────────────────────────────
const GRID_BREITE   = 10;
const GRID_HOEHE    = 20;
const PANEL_B       = 144;   // Breite des Block-Panels in Canvas-Pixeln
const GEFAHREN_Z    = 2;     // Zeilen von oben bis Gefahrenlinie
const FARBEN_NAMEN  = ['rot', 'gruen', 'blau', 'orange'];
const FARBEN_HEX    = {
  rot:    '#ef4444',
  gruen:  '#22c55e',
  blau:   '#3b82f6',
  orange: '#f97316',
};
const MEILENSTEINE  = [500, 1500, 3000, 5000, 10000];

// ── Spielzustand ──────────────────────────────────────────────────────────────
let gitter = [];          // gitter[zeile][spalte] = null | farbname
let panelBloecke  = [];   // Array mit 3 Block-Objekten
let gesetzteAnzahl = 0;   // Wie viele der aktuellen 3 Blöcke platziert wurden
let score         = 0;
let highscore     = 0;
let running       = false;
let pruefeGerade  = false; // true während BFS läuft
let loopId        = null;

// ── Drag-Zustand ──────────────────────────────────────────────────────────────
let drag = {
  aktiv:       false,
  panelIdx:    -1,
  zellen:      [],   // [[zeile, spalte], ...]
  farbe:       '',
  mausX:       0,
  mausY:       0,
  ghostSpalte: -1,   // eingerastete Zielspalte (-1 = außerhalb)
};

// ── Canvas / Layout ───────────────────────────────────────────────────────────
let canvas, ctx;
let CW, CH;           // Canvas-Abmessungen in px
let zellenGr = 32;    // Zellengröße in Canvas-px
let gitOffX  = 0;     // X-Offset Spielfeld auf Canvas
let gitOffY  = 0;     // Y-Offset Spielfeld auf Canvas
let panOffX  = 0;     // X-Offset Panel auf Canvas

// ── Layout berechnen ──────────────────────────────────────────────────────────
function layoutBerechnen() {
  const hudH      = 52;
  const verfBreite = window.innerWidth  - PANEL_B - 8;
  const verfHoehe  = window.innerHeight - hudH    - 8;

  const ausB = Math.floor(verfBreite / GRID_BREITE);
  const ausH = Math.floor(verfHoehe  / GRID_HOEHE);
  zellenGr = Math.max(16, Math.min(ausB, ausH, 40));

  const gitBreitePx = GRID_BREITE * zellenGr;
  const gitHoehePx  = GRID_HOEHE  * zellenGr;

  CW = gitBreitePx + PANEL_B;
  CH = gitHoehePx;

  canvas.width  = CW;
  canvas.height = CH;

  gitOffX = 0;
  gitOffY = 0;
  panOffX = gitBreitePx + 4;
}

// ── Grid initialisieren ───────────────────────────────────────────────────────
function gitterInit() {
  gitter = Array.from({ length: GRID_HOEHE }, () => new Array(GRID_BREITE).fill(null));
}

// ── Spielfeld zeichnen ────────────────────────────────────────────────────────
function spielfeldZeichnen() {
  const gW = GRID_BREITE * zellenGr;
  const gH = GRID_HOEHE  * zellenGr;

  // Spielfeld-Hintergrund
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(gitOffX, gitOffY, gW, gH);

  // Gitter-Linien
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth   = 0.5;
  for (let z = 0; z <= GRID_HOEHE; z++) {
    ctx.beginPath();
    ctx.moveTo(gitOffX,      gitOffY + z * zellenGr);
    ctx.lineTo(gitOffX + gW, gitOffY + z * zellenGr);
    ctx.stroke();
  }
  for (let s = 0; s <= GRID_BREITE; s++) {
    ctx.beginPath();
    ctx.moveTo(gitOffX + s * zellenGr, gitOffY);
    ctx.lineTo(gitOffX + s * zellenGr, gitOffY + gH);
    ctx.stroke();
  }

  // Gefahren-Zone (obere GEFAHREN_Z Zeilen)
  ctx.fillStyle = 'rgba(239,68,68,0.12)';
  ctx.fillRect(gitOffX, gitOffY, gW, GEFAHREN_Z * zellenGr);
  ctx.strokeStyle = 'rgba(239,68,68,0.7)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(gitOffX,      gitOffY + GEFAHREN_Z * zellenGr);
  ctx.lineTo(gitOffX + gW, gitOffY + GEFAHREN_Z * zellenGr);
  ctx.stroke();

  // Pixel zeichnen
  for (let z = 0; z < GRID_HOEHE; z++) {
    for (let s = 0; s < GRID_BREITE; s++) {
      if (gitter[z][s]) pixelZeichnen(s, z, gitter[z][s]);
    }
  }
}

// Einen einzelnen Pixel im Spielfeld zeichnen
function pixelZeichnen(spalte, zeile, farbe, alpha) {
  const x   = gitOffX + spalte * zellenGr;
  const y   = gitOffY + zeile  * zellenGr;
  const pad = 1;
  const gr  = zellenGr - 2 * pad;

  ctx.save();
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.fillStyle = FARBEN_HEX[farbe];
  ctx.fillRect(x + pad, y + pad, gr, gr);
  // Glanz
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(x + pad, y + pad, gr, Math.max(2, gr * 0.18));
  ctx.restore();
}

// ── Panel-Hintergrund zeichnen (ohne Blöcke) ─────────────────────────────────
function panelHintergrundZeichnen() {
  ctx.fillStyle = '#f0f4f8';
  ctx.fillRect(panOffX - 4, 0, CW - panOffX + 4, CH);

  // Trennlinie
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(panOffX - 4, 0);
  ctx.lineTo(panOffX - 4, CH);
  ctx.stroke();
}

// ── Haupt-Draw ────────────────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, CW, CH);
  panelHintergrundZeichnen();
  spielfeldZeichnen();
}

// ── Game Loop ─────────────────────────────────────────────────────────────────
function tick() {
  if (!running) return;
  loopId = requestAnimationFrame(tick);
  draw();
}

// ── Screens ────────────────────────────────────────────────────────────────────
function screenZeigen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── Spiel starten ─────────────────────────────────────────────────────────────
function spielStarten() {
  screenZeigen('screen-game');
  canvas       = document.getElementById('c');
  ctx          = canvas.getContext('2d');
  layoutBerechnen();
  gitterInit();
  score         = 0;
  pruefeGerade  = false;
  drag.aktiv    = false;
  running       = true;

  hudAktualisieren();

  if (loopId) cancelAnimationFrame(loopId);
  tick();
}

// ── Resize ─────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (!running || !canvas) return;
  layoutBerechnen();
});

// ── DOMContentLoaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Highscore laden
  try {
    const data = await PZ.loadScore('pixel-drop');
    if (data?.score) highscore = data.score;
  } catch (_) {}

  document.getElementById('btn-play').addEventListener('click', spielStarten);
  document.getElementById('btn-lb-title').addEventListener('click', () => rangliste_zeigen('screen-title'));
  document.getElementById('btn-neustart').addEventListener('click', spielStarten);
  document.getElementById('btn-retry').addEventListener('click', spielStarten);
  document.getElementById('btn-lb-go').addEventListener('click', () => rangliste_zeigen('screen-gameover'));
  document.getElementById('btn-lb-back').addEventListener('click', () => screenZeigen(lbVorher));
  document.getElementById('btn-settings').addEventListener('click', () => {/* Platzhalter */});
});

// ── HUD ────────────────────────────────────────────────────────────────────────
function hudAktualisieren() {
  document.getElementById('hud-score').textContent = score;

  // Fortschrittsleiste
  const naechster = MEILENSTEINE.find(m => m > score) || MEILENSTEINE[MEILENSTEINE.length - 1];
  const vorheriger = [...MEILENSTEINE].reverse().find(m => m <= score) || 0;
  const pct = naechster === vorheriger ? 100
    : Math.min(100, ((score - vorheriger) / (naechster - vorheriger)) * 100);
  document.getElementById('fortschritt-bar').style.width = pct + '%';
  document.getElementById('fortschritt-label').textContent = `${score} / ${naechster}`;
}

// ── Rangliste (Platzhalter, Task 10 füllt sie aus) ────────────────────────────
let lbVorher = 'screen-title';
function rangliste_zeigen(vorher) {
  lbVorher = vorher;
  screenZeigen('screen-lb');
  document.getElementById('lb-content').innerHTML =
    '<p class="lb-empty">Wird geladen…</p>';
}

// ── Spiel Ende (Platzhalter, Task 9 füllt aus) ────────────────────────────────
function spielEnde() {
  running = false;
  if (loopId) cancelAnimationFrame(loopId);
  screenZeigen('screen-gameover');
  document.getElementById('res-score').textContent     = score;
  document.getElementById('res-highscore').textContent = Math.max(score, highscore);
}
