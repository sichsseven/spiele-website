import Phaser from 'phaser';
import { GameScene } from './GameScene.js';
import {
  GameState,
  collectPendingOfflineProgress,
  loadGameAsync,
  getPendingOfflineProgress,
  saveGame,
  setNecromancerAdminSandbox,
  startPassiveLoop,
} from './GameState.js';
import { initNecromantUI } from './NecromantUI.js';

function initOfflineProgressModal() {
  const modal = document.getElementById('offline-modal');
  const bonesEl = document.getElementById('offline-modal-bones');
  const textEl = document.getElementById('offline-modal-text');
  const collectBtn = document.getElementById('offline-modal-collect');
  if (!modal || !bonesEl || !collectBtn || !textEl) return;

  const pending = getPendingOfflineProgress();
  if (!pending || pending.bones <= 0) return;

  bonesEl.textContent = Intl.NumberFormat('de-DE', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(pending.bones);
  textEl.innerHTML = `Eure Armee hat in eurer Abwesenheit geschuftet und <strong>${bonesEl.textContent}</strong> Knochen gesammelt.`;
  modal.hidden = false;

  collectBtn.addEventListener(
    'click',
    () => {
      const gained = collectPendingOfflineProgress();
      modal.hidden = true;
      if (gained > 0) {
        void saveGame();
      }
    },
    { once: true },
  );
}

const mount = document.getElementById('phaser-mount');
if (!mount) {
  throw new Error('#phaser-mount fehlt in necromancer-idle.html');
}

const config = {
  type: Phaser.AUTO,
  parent: mount,
  backgroundColor: '#0d0d12',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  scene: [GameScene],
};

void (async function bootstrap() {
  const adminTest =
    typeof URLSearchParams !== 'undefined' &&
    new URLSearchParams(window.location.search).has('admin');
  setNecromancerAdminSandbox(adminTest);

  const PZ = globalThis.PZ;
  if (PZ && typeof PZ.pruefeSpielStatus === 'function') {
    await PZ.pruefeSpielStatus('necromancer-idle');
  }

  await loadGameAsync();

  new Phaser.Game(config);

  startPassiveLoop();
  initNecromantUI();
  initOfflineProgressModal();

  let saveToastTimer = 0;
  document.addEventListener('necro-game-saved', () => {
    const el = document.getElementById('save-toast');
    if (!el) return;
    el.textContent = 'Fortschritt gespeichert';
    el.classList.add('visible');
    window.clearTimeout(saveToastTimer);
    saveToastTimer = window.setTimeout(() => {
      el.classList.remove('visible');
    }, 2200);
  });

  window.setInterval(() => {
    saveGame();
  }, 30000);
})();

export { GameState };
