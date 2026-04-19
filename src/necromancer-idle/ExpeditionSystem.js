import {
  GameState,
  emitExpeditionSyncNow,
  formatGameNumber,
  getCombatPower,
  recruitEliteUnit,
  startExpedition,
} from './GameState.js';
import { ARTIFACT_DEFS, ELITE_UNITS } from './expeditionData.js';
import { createExpeditionPhaserGame } from './expeditionPhaser.js';

function renderArtifacts(listEl) {
  if (!listEl) return;
  listEl.replaceChildren();
  const owned = GameState.artifactsOwned;
  let any = false;
  for (const def of ARTIFACT_DEFS) {
    const n = Math.max(0, Math.floor(owned[def.id] ?? 0));
    if (n <= 0) continue;
    any = true;
    const li = document.createElement('li');
    li.className = 'artifact-row';
    li.innerHTML = `<span class="artifact-name">${def.name}</span><span class="artifact-meta">×${n}</span><span class="artifact-desc">${def.description}</span>`;
    listEl.appendChild(li);
  }
  if (!any) {
    const li = document.createElement('li');
    li.className = 'artifact-empty';
    li.textContent = 'Noch keine Artefakte.';
    listEl.appendChild(li);
  }
}

function refreshExpeditionUi({
  mapLineEl,
  statusEl,
  barFill,
  barWrap,
  kpEl,
  unitCountEl,
  btnRecruit,
  btnStart,
}) {
  const mapName =
    GameState.expeditionState.currentMap === 'menschendorf' ? 'Menschendorf' : GameState.expeditionState.currentMap;
  const running = GameState.expeditionState.running;
  const p = Math.max(0, Math.min(100, GameState.expeditionState.explorationProgress));
  const u = ELITE_UNITS[0];
  const count = Math.max(0, Math.floor(GameState.expeditionState.activeUnits[u.id] ?? 0));
  const kp = getCombatPower();

  if (mapLineEl) {
    const strong = mapLineEl.querySelector('strong');
    if (strong) strong.textContent = mapName;
  }
  if (barWrap) {
    barWrap.setAttribute('aria-valuenow', String(Math.round(p)));
  }
  if (barFill) barFill.style.width = `${p}%`;
  if (kpEl) kpEl.textContent = String(kp);
  if (unitCountEl) unitCountEl.textContent = `${u.name}: ${count}`;

  if (statusEl) {
    if (running) {
      statusEl.textContent = `Plünderung des Dorfes (${mapName})… ${p.toFixed(0)} %`;
    } else {
      statusEl.textContent = `Bereit — ${mapName}`;
    }
  }

  if (btnRecruit) {
    const afford = GameState.bones >= u.boneCost;
    btnRecruit.disabled = !afford;
    btnRecruit.textContent = `${u.name} — ${formatGameNumber(u.boneCost)} 🦴`;
  }
  if (btnStart) {
    btnStart.disabled = running || kp <= 0;
    btnStart.textContent = running ? 'Expedition läuft…' : 'Plünderung starten';
  }
}

/**
 * Expedition / Auto-Battler UI + Mini-Phaser.
 */
export function initExpeditionSystem() {
  const host = document.getElementById('expedition-phaser-host');
  const mapLineEl = document.getElementById('expedition-map-line');
  const statusEl = document.getElementById('expedition-status-text');
  const barFill = document.getElementById('expedition-bar-fill');
  const barWrap = document.getElementById('expedition-bar-wrap');
  const kpEl = document.getElementById('expedition-kp');
  const unitCountEl = document.getElementById('expedition-unit-count');
  const btnRecruit = document.getElementById('btn-recruit-elite');
  const btnStart = document.getElementById('btn-expedition-start');
  const listEl = document.getElementById('artifact-list');

  if (host) {
    void createExpeditionPhaserGame(host);
  }

  const els = { mapLineEl, statusEl, barFill, barWrap, kpEl, unitCountEl, btnRecruit, btnStart };

  const sync = () => {
    refreshExpeditionUi(els);
    renderArtifacts(listEl);
  };

  sync();
  emitExpeditionSyncNow();

  document.addEventListener('necro-state-changed', sync);
  document.addEventListener('necro-expedition-sync', sync);

  btnRecruit?.addEventListener('click', () => {
    const u = ELITE_UNITS[0];
    if (u) recruitEliteUnit(u.id);
  });

  btnStart?.addEventListener('click', () => {
    startExpedition();
  });
}
