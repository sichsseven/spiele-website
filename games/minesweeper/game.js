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

// ── Stubs – werden in späteren Tasks implementiert ────────────────────────────
function spielfeldRendern() {}
function hudAktualisieren() {}
function timerStoppen() { clearInterval(timerInterval); timerInterval = null; }
