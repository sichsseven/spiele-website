'use strict';

const RASTER_SIZE = 8;

const FARBEN = {
  rot: '#e84040',
  orange: '#f07020',
  gelb: '#f0c030',
  gruen: '#30b870',
  blau: '#3880e0',
  lila: '#8855d0',
  rosa: '#d04090',
  tuerkis: '#20b8b0',
};
const F = FARBEN;

const FORMEN_LEICHT = [
  { z: [[0, 0]], f: F.rot },
  { z: [[0, 0], [0, 1]], f: F.orange },
  { z: [[0, 0], [1, 0]], f: F.gelb },
  { z: [[0, 0], [0, 1], [0, 2]], f: F.gruen },
  { z: [[0, 0], [1, 0], [2, 0]], f: F.blau },
  { z: [[0, 0], [0, 1], [1, 0], [1, 1]], f: F.lila },
  { z: [[0, 0], [0, 1], [1, 0]], f: F.rosa },
  { z: [[0, 0], [0, 1], [1, 1]], f: F.tuerkis },
  { z: [[0, 0], [1, 0], [1, 1]], f: F.orange },
  { z: [[0, 1], [1, 0], [1, 1]], f: F.rot },
];

const FORMEN_MITTEL = [
  { z: [[0, 0], [1, 0], [2, 0], [2, 1]], f: F.rot },
  { z: [[0, 1], [1, 1], [2, 0], [2, 1]], f: F.blau },
  { z: [[0, 0], [0, 1], [0, 2], [1, 0]], f: F.gruen },
  { z: [[0, 0], [0, 1], [0, 2], [1, 2]], f: F.orange },
  { z: [[0, 0], [1, 0], [1, 1], [1, 2]], f: F.lila },
  { z: [[0, 2], [1, 0], [1, 1], [1, 2]], f: F.rosa },
  { z: [[0, 0], [0, 1], [0, 2], [1, 1]], f: F.tuerkis },
  { z: [[0, 1], [1, 0], [1, 1], [2, 1]], f: F.gelb },
  { z: [[0, 1], [1, 0], [1, 1], [1, 2]], f: F.rot },
  { z: [[0, 0], [1, 0], [1, 1], [2, 0]], f: F.blau },
  { z: [[0, 1], [0, 2], [1, 0], [1, 1]], f: F.orange },
  { z: [[0, 0], [0, 1], [1, 1], [1, 2]], f: F.gruen },
  { z: [[0, 0], [1, 0], [1, 1], [2, 1]], f: F.lila },
  { z: [[0, 1], [1, 0], [1, 1], [2, 0]], f: F.rosa },
];

const FORMEN_SCHWER = [
  { z: [[0, 0], [0, 1], [0, 2], [0, 3]], f: F.blau },
  { z: [[0, 0], [1, 0], [2, 0], [3, 0]], f: F.tuerkis },
  { z: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], f: F.lila },
  { z: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], f: F.rosa },
  { z: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], f: F.gruen },
  { z: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]], f: F.orange },
  { z: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], f: F.rot },
];

let raster = [];
let zellen = [];
let stuecke = [null, null, null];
let punkte = 0;
let highscore = 0;
let istAnimiert = false;
let istGameOver = false;

const gridEl = document.getElementById('grid');
const goScreen = document.getElementById('gameOverScreen');
const ghost = document.getElementById('ghost');

function aktuelleFormen() {
  if (punkte < 50) return FORMEN_LEICHT;
  if (punkte < 150) return [...FORMEN_LEICHT, ...FORMEN_LEICHT, ...FORMEN_MITTEL];
  if (punkte < 400) return [...FORMEN_LEICHT, ...FORMEN_MITTEL, ...FORMEN_MITTEL];
  return [...FORMEN_LEICHT, ...FORMEN_MITTEL, ...FORMEN_MITTEL, ...FORMEN_SCHWER];
}

document.addEventListener('DOMContentLoaded', async () => {
  PZ.updateNavbar();
  try {
    const stored = await PZ.loadScore('block-blast');
    highscore = Number(stored?.punkte || 0);
  } catch (err) {
    console.error('[Block Blast] Highscore laden fehlgeschlagen:', err);
  }
  document.getElementById('highscoreDisp').textContent = highscore;
  spielStart();
});

function spielStart() {
  raster = Array.from({ length: RASTER_SIZE }, () => Array(RASTER_SIZE).fill(null));
  stuecke = [null, null, null];
  punkte = 0;
  istGameOver = false;
  istAnimiert = false;
  goScreen.classList.remove('show');
  punkteRendern();
  rasterRendern();
  neuePiecesGenerieren();
}

function rasterRendern() {
  gridEl.innerHTML = '';
  zellen = Array.from({ length: RASTER_SIZE }, () => Array(RASTER_SIZE).fill(null));
  for (let r = 0; r < RASTER_SIZE; r += 1) {
    for (let c = 0; c < RASTER_SIZE; c += 1) {
      const div = document.createElement('div');
      div.className = 'cell';
      gridEl.appendChild(div);
      zellen[r][c] = div;
    }
  }
}

function zellFarbeSetzen(el, block) {
  if (block) {
    el.classList.add('filled');
    el.style.background = block.farbe;
    el.style.boxShadow = 'inset 0 3px 0 rgba(255,255,255,.28), inset 0 -2px 0 rgba(0,0,0,.25)';
  } else {
    el.classList.remove('filled');
    el.style.background = '#e2e8f0';
    el.style.boxShadow = 'none';
  }
}

function zufaelligesStueckPassend(maxVersuche = 80) {
  const formen = aktuelleFormen();
  for (let i = 0; i < maxVersuche; i += 1) {
    const f = formen[Math.floor(Math.random() * formen.length)];
    const s = { zellen: f.z, farbe: f.f };
    if (kannPassen(s)) return s;
  }
  for (const f of FORMEN_LEICHT.sort((a, b) => a.z.length - b.z.length)) {
    const s = { zellen: f.z, farbe: f.f };
    if (kannPassen(s)) return s;
  }
  return null;
}

function neuePiecesGenerieren() {
  for (let i = 0; i < 3; i += 1) stuecke[i] = zufaelligesStueckPassend();
  if (stuecke.every((s) => s === null)) { setTimeout(() => spielEnde(), 300); return; }
  trayRendern();
}

function trayRendern() {
  for (let i = 0; i < 3; i += 1) {
    const slot = document.getElementById(`slot${i}`);
    slot.innerHTML = '';
    slot.classList.remove('used', 'cant-fit');
    const s = stuecke[i];
    if (!s) { slot.classList.add('used'); continue; }
    const rows = Math.max(...s.zellen.map(([r]) => r)) + 1;
    const cols = Math.max(...s.zellen.map(([, c]) => c)) + 1;
    const mg = document.createElement('div');
    mg.className = 'mini-piece';
    mg.style.gridTemplateColumns = `repeat(${cols}, 15px)`;
    mg.style.gridTemplateRows = `repeat(${rows}, 15px)`;
    const occupied = new Set(s.zellen.map(([r, c]) => `${r},${c}`));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const mc = document.createElement('div');
        mc.className = 'mini-cell';
        if (occupied.has(`${r},${c}`)) {
          mc.style.background = s.farbe;
          mc.style.boxShadow = 'inset 0 2px 0 rgba(255,255,255,.28), inset 0 -2px 0 rgba(0,0,0,.25)';
        } else mc.style.background = 'transparent';
        mg.appendChild(mc);
      }
    }
    slot.appendChild(mg);
    slot.onpointerdown = (e) => dragStart(e, i);
  }
}

function kannPassen(s) {
  for (let r0 = 0; r0 < RASTER_SIZE; r0 += 1) {
    for (let c0 = 0; c0 < RASTER_SIZE; c0 += 1) {
      if (s.zellen.every(([dr, dc]) => {
        const r = r0 + dr;
        const c = c0 + dc;
        return r >= 0 && r < RASTER_SIZE && c >= 0 && c < RASTER_SIZE && !raster[r][c];
      })) return true;
    }
  }
  return false;
}

function passFormPruefen() {
  const verbleibend = stuecke.filter((s) => s !== null);
  if (verbleibend.length === 0) return;
  let nochMoeglich = false;
  for (let i = 0; i < 3; i += 1) {
    if (!stuecke[i]) continue;
    if (kannPassen(stuecke[i])) {
      nochMoeglich = true;
      document.getElementById(`slot${i}`).classList.remove('cant-fit');
    } else {
      document.getElementById(`slot${i}`).classList.add('cant-fit');
    }
  }
  if (!nochMoeglich) setTimeout(() => spielEnde(), 400);
}

function effZellGroesse() {
  const r0 = zellen[0][0].getBoundingClientRect();
  const r1 = zellen[0][1].getBoundingClientRect();
  return r1.left - r0.left;
}

let dragIdx = -1;
let dragStueck = null;
let dragCS = 0;
let vorschauZellen = [];

function dragStart(e, idx) {
  if (istAnimiert || istGameOver) return;
  const slot = document.getElementById(`slot${idx}`);
  if (slot.classList.contains('cant-fit') || slot.classList.contains('used')) return;
  e.preventDefault();
  dragIdx = idx;
  dragStueck = stuecke[idx];
  dragCS = effZellGroesse();
  const s = dragStueck;
  const rows = Math.max(...s.zellen.map(([r]) => r)) + 1;
  const cols = Math.max(...s.zellen.map(([, c]) => c)) + 1;
  ghost.innerHTML = '';
  ghost.style.display = 'grid';
  ghost.style.gridTemplateColumns = `repeat(${cols}, ${dragCS}px)`;
  ghost.style.gridTemplateRows = `repeat(${rows}, ${dragCS}px)`;
  ghost.style.gap = '2px';
  ghost.style.width = `${cols * dragCS + (cols - 1) * 2}px`;
  ghost.style.height = `${rows * dragCS + (rows - 1) * 2}px`;
  const occupied = new Set(s.zellen.map(([r, c]) => `${r},${c}`));
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const gc = document.createElement('div');
      gc.className = 'ghost-cell';
      gc.style.width = `${dragCS}px`;
      gc.style.height = `${dragCS}px`;
      if (occupied.has(`${r},${c}`)) {
        gc.style.background = s.farbe;
        gc.style.boxShadow = 'inset 0 3px 0 rgba(255,255,255,.28), inset 0 -2px 0 rgba(0,0,0,.25)';
      } else gc.style.background = 'transparent';
      ghost.appendChild(gc);
    }
  }
  ghostPositionieren(e.clientX, e.clientY);
  document.addEventListener('pointermove', dragMove);
  document.addEventListener('pointerup', dragEnd);
  document.addEventListener('pointercancel', dragAbort);
}

function ghostPositionieren(cx, cy) {
  const s = dragStueck;
  const rows = Math.max(...s.zellen.map(([r]) => r)) + 1;
  const cols = Math.max(...s.zellen.map(([, c]) => c)) + 1;
  const w = cols * dragCS + (cols - 1) * 2;
  const h = rows * dragCS + (rows - 1) * 2;
  ghost.style.left = `${cx - w / 2}px`;
  ghost.style.top = `${cy - h - dragCS * 1.5}px`;
}

function vorschauLoeschen() {
  vorschauZellen.forEach(([r, c]) => {
    const el = zellen[r][c];
    el.classList.remove('preview-ok', 'preview-bad');
    zellFarbeSetzen(el, raster[r][c]);
  });
  vorschauZellen = [];
}

function rasterPosBerechnen(cx, cy) {
  const ref = zellen[0][0].getBoundingClientRect();
  const cs = dragCS;
  const s = dragStueck;
  const rows = Math.max(...s.zellen.map(([r]) => r)) + 1;
  const cols = Math.max(...s.zellen.map(([, c]) => c)) + 1;
  const w = cols * cs + (cols - 1) * 2;
  const pieceLeft = cx - w / 2;
  const pieceTop = cy - (rows * cs + (rows - 1) * 2) - cs * 1.5;
  return {
    r0: Math.round((pieceTop - ref.top) / cs),
    c0: Math.round((pieceLeft - ref.left) / cs),
  };
}

function dragMove(e) {
  if (!dragStueck) return;
  ghostPositionieren(e.clientX, e.clientY);
  vorschauLoeschen();
  const { r0, c0 } = rasterPosBerechnen(e.clientX, e.clientY);
  const s = dragStueck;
  const gueltig = s.zellen.every(([dr, dc]) => {
    const r = r0 + dr;
    const c = c0 + dc;
    return r >= 0 && r < RASTER_SIZE && c >= 0 && c < RASTER_SIZE && !raster[r][c];
  });
  s.zellen.forEach(([dr, dc]) => {
    const r = r0 + dr;
    const c = c0 + dc;
    if (r < 0 || r >= RASTER_SIZE || c < 0 || c >= RASTER_SIZE) return;
    const el = zellen[r][c];
    if (gueltig) {
      el.classList.add('preview-ok');
      el.style.background = s.farbe;
      el.style.boxShadow = 'inset 0 3px 0 rgba(255,255,255,.28), inset 0 -2px 0 rgba(0,0,0,.25)';
    } else {
      el.classList.add('preview-bad');
      el.style.background = 'rgba(220,60,60,.5)';
      el.style.boxShadow = 'none';
    }
    vorschauZellen.push([r, c]);
  });
}

async function dragEnd(e) {
  if (!dragStueck) return;
  document.removeEventListener('pointermove', dragMove);
  document.removeEventListener('pointerup', dragEnd);
  document.removeEventListener('pointercancel', dragAbort);
  vorschauLoeschen();
  ghost.style.display = 'none';
  const { r0, c0 } = rasterPosBerechnen(e.clientX, e.clientY);
  const s = dragStueck;
  const gueltig = s.zellen.every(([dr, dc]) => {
    const r = r0 + dr;
    const c = c0 + dc;
    return r >= 0 && r < RASTER_SIZE && c >= 0 && c < RASTER_SIZE && !raster[r][c];
  });
  const idx = dragIdx;
  dragIdx = -1;
  dragStueck = null;
  if (gueltig) await steinSetzen(idx, r0, c0);
}

function dragAbort() {
  document.removeEventListener('pointermove', dragMove);
  document.removeEventListener('pointerup', dragEnd);
  document.removeEventListener('pointercancel', dragAbort);
  vorschauLoeschen();
  ghost.style.display = 'none';
  dragIdx = -1;
  dragStueck = null;
}

async function steinSetzen(idx, r0, c0) {
  if (istAnimiert) return;
  const s = stuecke[idx];
  s.zellen.forEach(([dr, dc]) => {
    const r = r0 + dr;
    const c = c0 + dc;
    raster[r][c] = { farbe: s.farbe };
    zellFarbeSetzen(zellen[r][c], raster[r][c]);
  });
  punkte += s.zellen.length;
  scorePopup(s.zellen.length, r0, c0);
  stuecke[idx] = null;
  document.getElementById(`slot${idx}`).classList.add('used');
  await linienLoeschen(r0, c0, s.farbe);
  if (stuecke.every((piece) => piece === null)) neuePiecesGenerieren();
  else passFormPruefen();
  punkteRendern();
}

async function linienLoeschen(platzR, platzC, platzFarbe) {
  const volleReihen = [];
  const volleSpalten = [];
  for (let r = 0; r < RASTER_SIZE; r += 1) if (raster[r].every((b) => b !== null)) volleReihen.push(r);
  for (let c = 0; c < RASTER_SIZE; c += 1) if (raster.every((row) => row[c] !== null)) volleSpalten.push(c);
  if (volleReihen.length === 0 && volleSpalten.length === 0) return;
  istAnimiert = true;
  const betroffen = new Set();
  volleReihen.forEach((r) => { for (let c = 0; c < RASTER_SIZE; c += 1) betroffen.add(`${r},${c}`); });
  volleSpalten.forEach((c) => { for (let r = 0; r < RASTER_SIZE; r += 1) betroffen.add(`${r},${c}`); });
  betroffen.forEach((key) => {
    const [r, c] = key.split(',').map(Number);
    const el = zellen[r][c];
    el.style.background = platzFarbe;
    el.style.boxShadow = 'inset 0 3px 0 rgba(255,255,255,.28), inset 0 -2px 0 rgba(0,0,0,.25)';
    el.classList.add('flash-line');
  });
  await new Promise((res) => setTimeout(res, 350));
  betroffen.forEach((key) => {
    const [r, c] = key.split(',').map(Number);
    zellen[r][c].classList.remove('flash-line');
    raster[r][c] = null;
    zellFarbeSetzen(zellen[r][c], null);
  });
  const gesamtLinien = volleReihen.length + volleSpalten.length;
  let liniePunkte = betroffen.size * 2;
  if (gesamtLinien >= 4) liniePunkte += gesamtLinien * 40;
  else if (gesamtLinien >= 2) liniePunkte += gesamtLinien * 20;
  punkte += liniePunkte;
  scorePopup(liniePunkte, platzR, platzC, true);
  punkteRendern();
  istAnimiert = false;
}

function punkteRendern() {
  document.getElementById('scoreDisp').textContent = punkte;
  if (punkte > highscore) highscore = punkte;
  document.getElementById('highscoreDisp').textContent = highscore;
}

function scorePopup(n, r, c, linie = false) {
  const ref = zellen[Math.min(r, RASTER_SIZE - 1)][Math.min(c, RASTER_SIZE - 1)].getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = `+${n}`;
  popup.style.left = `${ref.left + ref.width / 2}px`;
  popup.style.top = `${ref.top + window.scrollY}px`;
  if (linie) popup.style.color = '#d97706';
  document.body.appendChild(popup);
  popup.addEventListener('animationend', () => popup.remove());
}

async function spielEnde() {
  istGameOver = true;
  goScreen.classList.add('show');
  document.getElementById('goScore').textContent = punkte;
  const isNeu = punkte > 0 && punkte >= highscore;
  const hsEl = document.getElementById('goHs');
  hsEl.textContent = isNeu ? '🎉 Neue Bestleistung!' : `Bestleistung: ${highscore}`;
  hsEl.className = `go-hs${isNeu ? ' new-record' : ''}`;
  let nutzername = null;
  try {
    const user = await PZ.getUser().catch(() => null);
    if (user) {
      const saveResult = await PZ.saveGameData('block-blast', punkte, 1, {});
      if (saveResult?.error) console.error('[Block Blast] Speichern fehlgeschlagen:', saveResult.error);
      nutzername = await PZ.getUsername(user.id).catch((err) => {
        console.error('[Block Blast] Benutzername laden fehlgeschlagen:', err);
        return null;
      });
    }
  } catch (err) {
    console.error('[Block Blast] spielEnde Fehler:', err);
  }
  const lbEl = document.getElementById('goLbList');
  try {
    const lb = await PZ.getLeaderboard('block-blast', 5);
    if (!lb || lb.length === 0) {
      lbEl.innerHTML = '<div class="lb-empty">Noch keine Einträge</div>';
    } else {
      lbEl.innerHTML = lb.map((e, i) => {
        const istIch = nutzername && e.benutzername === nutzername;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        return `<div class="lb-row${istIch ? ' me' : ''}">
          <span class="lb-rank">${medal}</span>
          <span class="lb-name">${e.benutzername || 'Unbekannt'}</span>
          <span class="lb-score">${e.punkte ?? 0}</span>
        </div>`;
      }).join('');
    }
  } catch (err) {
    console.error('[Block Blast] Rangliste laden fehlgeschlagen:', err);
    lbEl.innerHTML = '<div class="lb-empty">Keine Verbindung</div>';
  }
}
