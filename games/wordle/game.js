'use strict';

// Lösungs- und Gültigkeitslisten: wordlists.js (generiert aus Hunspell + Korpus)

// ── Spielzustand ─────────────────────────────────────────────────────────────
let zielwort    = '';   // aktuelles Zielwort (Großbuchstaben)
let versuche    = [];   // abgeschlossene Versuche als Strings
let eingabe     = '';   // laufende Eingabe (max. 5 Zeichen)
let beendet     = false;
let animiert    = false; // während Flip-Animation: keine Eingabe
let tastaturMap = {};    // { 'A': 'richtig'|'vorhanden'|'abwesend' }

// Statistiken – werden aus Supabase geladen
let stats = {
  gespielt:    0,
  gewonnen:    0,
  aktSerie:    0,
  maxSerie:    0,
  verteilung:  [0, 0, 0, 0, 0, 0], // Index i = Sieg im (i+1). Versuch
};

// ── Admin-Modus ───────────────────────────────────────────────────────────────
let adminModus = false;

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  adminModus = await PZ.adminPanelErstellen([
    {label:'💡 Wort anzeigen', onClick:() => { alert('Lösung: ' + zielwort); }},
  ]);
  PZ.updateNavbar();
  neuesSpiel();
  document.addEventListener('keydown', tastaturHandler);
  if (!adminModus) statsLaden();
});

// ── Neues Spiel ───────────────────────────────────────────────────────────────
function neuesSpiel() {
  zielwort    = LOESUNGSWOERTER[Math.floor(Math.random() * LOESUNGSWOERTER.length)];
  versuche    = [];
  eingabe     = '';
  beendet     = false;
  animiert    = false;
  tastaturMap = {};

  document.getElementById('endscreen').classList.add('versteckt');
  meldungVerstecken();
  boardRendern();
  tastaturRendern();
}

// ── Board rendern ─────────────────────────────────────────────────────────────
function boardRendern() {
  const feld = document.getElementById('spielfeld');
  feld.innerHTML = '';

  for (let r = 0; r < 6; r++) {
    const reihe = document.createElement('div');
    reihe.className = 'reihe';
    reihe.id = `reihe-${r}`;

    for (let k = 0; k < 5; k++) {
      const kachel = document.createElement('div');
      kachel.className = 'kachel';
      kachel.id = `kachel-${r}-${k}`;
      reihe.appendChild(kachel);
    }
    feld.appendChild(reihe);
  }
}

// ── Tastatur rendern ──────────────────────────────────────────────────────────
function tastaturRendern() {
  const layout = [
    ['Q','W','E','R','T','Z','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Y','X','C','V','B','N','M','⌫'],
  ];

  const tastatur = document.getElementById('tastatur');
  tastatur.innerHTML = '';

  for (const reihe of layout) {
    const div = document.createElement('div');
    div.className = 'taste-reihe';

    for (const key of reihe) {
      const btn = document.createElement('button');
      const breit = key === 'ENTER' || key === '⌫';
      btn.className = 'taste' + (breit ? ' breit' : '');
      btn.textContent = key;
      btn.dataset.key = key;
      btn.type = 'button';

      const status = tastaturMap[key];
      if (status) btn.classList.add(status);

      btn.addEventListener('click', () => tasteTippen(key));
      div.appendChild(btn);
    }
    tastatur.appendChild(div);
  }
}

// ── Eingabe ───────────────────────────────────────────────────────────────────
function tastaturHandler(e) {
  if (beendet || animiert) return;
  const key = e.key.toUpperCase();
  if (key === 'ENTER')     { e.preventDefault(); tasteTippen('ENTER'); return; }
  if (key === 'BACKSPACE') { e.preventDefault(); tasteTippen('⌫');     return; }
  if (/^[A-Z]$/.test(key)) tasteTippen(key);
}

function tasteTippen(key) {
  if (beendet || animiert) return;

  if (key === 'ENTER') {
    bestaetigen();
  } else if (key === '⌫') {
    if (eingabe.length > 0) {
      eingabe = eingabe.slice(0, -1);
      eingabeAnzeigen();
    }
  } else {
    if (eingabe.length < 5) {
      eingabe += key;
      eingabeAnzeigen();
    }
  }
}

// Aktuelle Eingabe ins Board schreiben
function eingabeAnzeigen() {
  const reihe = versuche.length;
  for (let k = 0; k < 5; k++) {
    const kachel = document.getElementById(`kachel-${reihe}-${k}`);
    if (!kachel) return;
    const b = eingabe[k] || '';
    kachel.textContent = b;
    kachel.classList.toggle('gefuellt', b !== '');
  }
}

// ── Meldungszeile ─────────────────────────────────────────────────────────────
let meldungTimer = null;

function meldungAnzeigen(text, dauer = 1500) {
  const el = document.getElementById('meldung');
  el.textContent = text;
  el.classList.add('sichtbar');
  clearTimeout(meldungTimer);
  meldungTimer = setTimeout(() => el.classList.remove('sichtbar'), dauer);
}

function meldungVerstecken() {
  clearTimeout(meldungTimer);
  document.getElementById('meldung').classList.remove('sichtbar');
}

// ── Schüttel-Animation ────────────────────────────────────────────────────────
function reiheSchütteln(reihe) {
  const el = document.getElementById(`reihe-${reihe}`);
  if (!el) return;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

// ── Versuch bestätigen ────────────────────────────────────────────────────────
async function bestaetigen() {
  if (eingabe.length < 5) {
    meldungAnzeigen('Zu kurz!');
    reiheSchütteln(versuche.length);
    return;
  }

  // Nur A–Z (keine Umlaute)
  if (!/^[A-Z]{5}$/.test(eingabe)) {
    meldungAnzeigen('Nur Buchstaben A–Z erlaubt');
    reiheSchütteln(versuche.length);
    return;
  }

  // Nur bekannte deutsche Wörter erlauben (größere Validierungsliste)
  if (!GUELTIGE_WOERTER.has(eingabe)) {
    meldungAnzeigen('Kein bekanntes deutsches Wort');
    reiheSchütteln(versuche.length);
    return;
  }

  const ergebnis = auswerten(eingabe, zielwort);
  const reihenIdx = versuche.length;
  versuche.push(eingabe);
  eingabe = '';

  // Flip-Animation abspielen
  animiert = true;
  await flipAnimation(reihenIdx, ergebnis);
  animiert = false;

  // Tastatur-Status aktualisieren
  tastaturAktualisieren(ergebnis);
  tastaturRendern();

  const gewonnen = ergebnis.every(e => e.status === 'richtig');
  if (gewonnen) {
    await bounceAnimation(reihenIdx);
    await statsSpeichern(true, versuche.length);
    beendet = true;
    setTimeout(() => endscreenAnzeigen(true), 350);
  } else if (versuche.length === 6) {
    await statsSpeichern(false, 0);
    beendet = true;
    setTimeout(() => endscreenAnzeigen(false), 350);
  }
}

// ── Auswertungslogik ──────────────────────────────────────────────────────────
// Korrekte Wordle-Logik: grün hat Vorrang, gelb nur so oft wie Buchstabe vorkommt
function auswerten(versuch, ziel) {
  const v = [...versuch];
  const z = [...ziel];
  const ergebnis = v.map(b => ({ b, status: 'abwesend' }));
  const restZiel = [...z];

  // 1. Durchlauf: exakte Treffer (grün)
  for (let i = 0; i < 5; i++) {
    if (v[i] === z[i]) {
      ergebnis[i].status = 'richtig';
      restZiel[i] = null; // verbraucht
    }
  }

  // 2. Durchlauf: vorhanden aber falsche Position (gelb)
  for (let i = 0; i < 5; i++) {
    if (ergebnis[i].status !== 'richtig') {
      const idx = restZiel.indexOf(v[i]);
      if (idx !== -1) {
        ergebnis[i].status = 'vorhanden';
        restZiel[idx] = null;
      }
    }
  }

  return ergebnis; // Array von { b: Buchstabe, status: 'richtig'|'vorhanden'|'abwesend' }
}

// ── Flip-Animation ────────────────────────────────────────────────────────────
function flipAnimation(reihe, ergebnis) {
  return new Promise(resolve => {
    const FLIP_MS   = 500; // Dauer pro Kachel
    const PAUSE_MS  = 250; // Abstand zwischen Kacheln

    ergebnis.forEach(({ status }, k) => {
      setTimeout(() => {
        const kachel = document.getElementById(`kachel-${reihe}-${k}`);
        kachel.classList.add('flipt');

        // Bei ~50% der Animation: Farbe setzen
        setTimeout(() => {
          kachel.classList.remove('gefuellt');
          kachel.classList.add(status);
        }, FLIP_MS * 0.45);

        kachel.addEventListener('animationend', () => {
          kachel.classList.remove('flipt');
          if (k === 4) setTimeout(resolve, 50);
        }, { once: true });

      }, k * PAUSE_MS);
    });

    // Fallback: falls animationend nicht feuert (z.B. Browser-Bug)
    setTimeout(resolve, PAUSE_MS * 4 + FLIP_MS + 100);
  });
}

// Bounce-Animation bei Sieg
function bounceAnimation(reihe) {
  return new Promise(resolve => {
    for (let k = 0; k < 5; k++) {
      setTimeout(() => {
        const kachel = document.getElementById(`kachel-${reihe}-${k}`);
        kachel.classList.add('bounced');
        kachel.addEventListener('animationend', () => kachel.classList.remove('bounced'), { once: true });
        if (k === 4) setTimeout(resolve, 400);
      }, k * 80);
    }
  });
}

// ── Tastatur-Statusverwaltung ─────────────────────────────────────────────────
function tastaturAktualisieren(ergebnis) {
  const prio = { richtig: 3, vorhanden: 2, abwesend: 1 };
  for (const { b, status } of ergebnis) {
    if (!tastaturMap[b] || prio[status] > prio[tastaturMap[b]]) {
      tastaturMap[b] = status;
    }
  }
}

// ── Statistiken laden (Supabase) ──────────────────────────────────────────────
async function statsLaden() {
  try {
    const eintrag = await PZ.loadScore('wordle');
    if (eintrag?.extra_daten) {
      const d = eintrag.extra_daten;
      stats.gespielt   = d.gespielt   ?? 0;
      stats.gewonnen   = d.gewonnen   ?? 0;
      stats.aktSerie   = d.aktSerie   ?? 0;
      stats.maxSerie   = d.maxSerie   ?? 0;
      stats.verteilung = Array.isArray(d.verteilung) ? d.verteilung : [0,0,0,0,0,0];
    }
  } catch (err) {
    console.warn('[Wordle] Statistiken konnten nicht geladen werden:', err);
  }
}

// ── Statistiken speichern (Supabase) ─────────────────────────────────────────
async function statsSpeichern(gewonnen, versuchsAnzahl) {
  stats.gespielt++;
  if (gewonnen) {
    stats.gewonnen++;
    stats.aktSerie++;
    if (stats.aktSerie > stats.maxSerie) stats.maxSerie = stats.aktSerie;
    if (versuchsAnzahl >= 1 && versuchsAnzahl <= 6) {
      stats.verteilung[versuchsAnzahl - 1]++;
    }
  } else {
    stats.aktSerie = 0;
  }

  if (adminModus) return;
  try {
    const user = await PZ.getUser();
    if (user) {
      await PZ.saveGameData('wordle', stats.gewonnen, 1, { ...stats });
    }
  } catch (err) {
    console.warn('[Wordle] Statistiken konnten nicht gespeichert werden:', err);
  }
}

// ── Endscreen ─────────────────────────────────────────────────────────────────
async function endscreenAnzeigen(gewonnen) {
  beendet = true;

  document.getElementById('endscreen-titel').textContent =
    gewonnen ? '🎉 Gewonnen!' : '😔 Verloren';

  document.getElementById('endscreen-untertitel').textContent =
    gewonnen
      ? `In ${versuche.length} Versuch${versuche.length === 1 ? '' : 'en'}!`
      : `Das Wort war: ${zielwort}`;

  document.getElementById('endscreen-stats').innerHTML = statsHTML(gewonnen);

  const rlEl = document.getElementById('endscreen-rangliste');
  rlEl.innerHTML = await ranglisteHTML();

  // Login-Hinweis für Gäste
  const user = await PZ.getUser();
  document.getElementById('endscreen-login').style.display = user ? 'none' : 'block';

  // "Nächstes Wort"-Button verdrahten
  document.getElementById('naechstes-btn').onclick = neuesSpiel;

  document.getElementById('endscreen').classList.remove('versteckt');
}

// HTML für Statistik-Panel
function statsHTML(gewonnen) {
  const gewinnrate = stats.gespielt > 0
    ? Math.round((stats.gewonnen / stats.gespielt) * 100)
    : 0;

  const maxVal = Math.max(...stats.verteilung, 1);

  const verteilungZeilen = stats.verteilung.map((n, i) => {
    const breite = Math.max(Math.round((n / maxVal) * 100), 8);
    // Aktuellen Versuch hervorheben (falls gewonnen)
    const aktuell = gewonnen && versuche.length === i + 1 ? 'aktuell' : '';
    return `
      <div class="v-reihe">
        <div class="v-label">${i + 1}</div>
        <div class="v-balken-wrap">
          <div class="v-balken ${aktuell}" style="width:${breite}%">${Number(n)}</div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="stats-raster">
      <div class="stat-box">
        <div class="stat-zahl">${stats.gespielt}</div>
        <div class="stat-label">Gespielt</div>
      </div>
      <div class="stat-box">
        <div class="stat-zahl">${gewinnrate}%</div>
        <div class="stat-label">Gewinnrate</div>
      </div>
      <div class="stat-box">
        <div class="stat-zahl">${stats.aktSerie}</div>
        <div class="stat-label">Serie</div>
      </div>
      <div class="stat-box">
        <div class="stat-zahl">${stats.maxSerie}</div>
        <div class="stat-label">Beste<br>Serie</div>
      </div>
    </div>
    <div class="verteilung-titel">Versuchsverteilung</div>
    <div class="verteilung">${verteilungZeilen}</div>`;
}

// HTML für Rangliste
async function ranglisteHTML() {
  let eintraege = [];
  try {
    eintraege = await PZ.getLeaderboard('wordle', 10) || [];
  } catch (err) {
    console.warn('[Wordle] Rangliste konnte nicht geladen werden:', err);
    return '';
  }
  if (!eintraege.length) return '';

  const zeilen = eintraege.map(e => `
    <div class="rang-eintrag">
      <span class="rang-num">${Number(e.rang)}</span>
      <span class="rang-name">${esc(e.benutzername)}</span>
      <span class="rang-punkte">${Number(e.punkte)} ✓</span>
    </div>`).join('');

  return `<div class="rangliste-titel">Top 10 – Meiste Siege</div>
          <div class="rangliste-liste">${zeilen}</div>`;
}

// XSS-Schutz
function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
}
