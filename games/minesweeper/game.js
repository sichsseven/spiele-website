'use strict';

// ── Schwierigkeitsgrade ────────────────────────────────────────────────────────
const SCHWIERIGKEIT = {
  einfach:  { spalten: 9,  reihen: 9,  minen: 10 },
  mittel:   { spalten: 16, reihen: 16, minen: 40 },
  schwierig:{ spalten: 30, reihen: 16, minen: 99 },
};

// ── Spielzustand ───────────────────────────────────────────────────────────────
let brett          = [];        // flaches Array [reihe * spalten + spalte]
let config         = null;      // aktuelles SCHWIERIGKEIT-Objekt
let schwierigkeitKey = 'einfach';
let ersterKlick    = true;
let spielLaeuft    = false;
let beendet        = false;
let timerInterval  = null;
let sekunden       = 0;
let flaggenGesetzt = 0;

// ── Init ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  PZ.updateNavbar();
  document.getElementById('schwierigkeit-select')
    .addEventListener('change', schwierigkeitWechseln);
  document.getElementById('neustart-btn')
    .addEventListener('click', neuesSpiel);
  document.getElementById('modal-neustart')
    .addEventListener('click', neuesSpiel);
  document.getElementById('modal-neustart-sieg')
    .addEventListener('click', neuesSpiel);
  neuesSpiel();
});

// ── Schwierigkeit wechseln ─────────────────────────────────────────────────────
function schwierigkeitWechseln() {
  schwierigkeitKey = document.getElementById('schwierigkeit-select').value;
  neuesSpiel();
}

// ── Neues Spiel ────────────────────────────────────────────────────────────────
function neuesSpiel() {
  config         = SCHWIERIGKEIT[schwierigkeitKey];
  ersterKlick    = true;
  spielLaeuft    = false;
  beendet        = false;
  sekunden       = 0;
  flaggenGesetzt = 0;

  timerStoppen();

  // Brett mit leeren Zellen initialisieren
  brett = Array.from({ length: config.reihen * config.spalten }, () => ({
    mine:      false,
    aufgedeckt: false,
    flagge:    false,
    nachbarn:  0,
  }));

  document.getElementById('modal-gameover').classList.add('versteckt');
  document.getElementById('modal-sieg').classList.add('versteckt');

  hudAktualisieren();
  spielfeldRendern();
}

// ── Brett-Hilfsfunktionen ──────────────────────────────────────────────────────
function idx(r, s)       { return r * config.spalten + s; }
function gueltig(r, s)   { return r >= 0 && r < config.reihen && s >= 0 && s < config.spalten; }

function nachbarPositionen(r, s) {
  const pos = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let ds = -1; ds <= 1; ds++)
      if ((dr !== 0 || ds !== 0) && gueltig(r + dr, s + ds))
        pos.push([r + dr, s + ds]);
  return pos;
}

// ── Spielfeld komplett rendern ─────────────────────────────────────────────────
function spielfeldRendern() {
  const feld = document.getElementById('spielfeld');
  feld.style.gridTemplateColumns = `repeat(${config.spalten}, var(--zell-groesse))`;
  feld.innerHTML = '';

  for (let r = 0; r < config.reihen; r++) {
    for (let s = 0; s < config.spalten; s++) {
      const zelle = document.createElement('div');
      zelle.className = 'zelle verdeckt ' + ((r + s) % 2 === 0 ? 'hell' : 'dunkel');
      zelle.dataset.r = r;
      zelle.dataset.s = s;

      // Long Press für Mobile (Flagge)
      let longPressTimer = null;
      zelle.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
          e.preventDefault();
          flaggeToggle(r, s);
        }, 500);
      }, { passive: false });
      zelle.addEventListener('touchend',  () => clearTimeout(longPressTimer));
      zelle.addEventListener('touchmove', () => clearTimeout(longPressTimer));

      // Klick und Rechtsklick
      zelle.addEventListener('click',        () => zelleKlick(r, s));
      zelle.addEventListener('contextmenu',  (e) => { e.preventDefault(); flaggeToggle(r, s); });

      feld.appendChild(zelle);
    }
  }
}

// ── Einzelne Zelle neu zeichnen ────────────────────────────────────────────────
function zelleRendern(r, s) {
  const el = document.querySelector(`#spielfeld [data-r="${r}"][data-s="${s}"]`);
  if (!el) return;
  const z = brett[idx(r, s)];

  el.className = 'zelle';
  el.textContent = '';

  if (!z.aufgedeckt) {
    el.classList.add('verdeckt', (r + s) % 2 === 0 ? 'hell' : 'dunkel');
    if (z.flagge) el.textContent = '🚩';
    return;
  }

  // Aufgedeckt
  el.classList.add('aufgedeckt', (r + s) % 2 === 0 ? 'aufgedeckt-hell' : 'aufgedeckt-dunkel');
  if (z.mine) {
    el.classList.add('mine');
    el.textContent = '💣';
  } else if (z.nachbarn > 0) {
    el.textContent = z.nachbarn;
    el.classList.add(`zahl-${z.nachbarn}`);
  }
}

// ── Stubs – werden in späteren Tasks implementiert ────────────────────────────
function hudAktualisieren() {}
function timerStoppen() { clearInterval(timerInterval); timerInterval = null; }
