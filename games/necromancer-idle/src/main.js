import {
  GameState,
  cheatGrantResources,
  collectPendingOfflineProgress,
  formatGameNumber,
  getPendingOfflineProgress,
  loadGameAsync,
  performPrestige,
  saveGame,
  saveGameLocal,
  saveToSupabase,
  setNecromancerAdminSandbox,
  startPassiveLoop,
  canPrestigeNow,
} from './GameState.js';
import { initShopUI } from './ShopUI.js';
import { initExpeditionSystem } from './ExpeditionSystem.js';
import { initSkillTreeUI } from './SkillTreeUI.js';
import { AudioManager } from './AudioManager.js';
import { initLeaderboardTab, refreshLeaderboard } from './leaderboard.js';

function initOfflineProgressModal() {
  const modal = document.getElementById('offline-modal');
  const bonesEl = document.getElementById('offline-modal-bones');
  if (!modal || !bonesEl) return;

  const pending = getPendingOfflineProgress();
  if (!pending || pending.bones <= 0) return;

  bonesEl.textContent = Intl.NumberFormat('de-DE', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(pending.bones);
  modal.hidden = false;

  const collectBtn = document.getElementById('offline-modal-collect');
  if (!collectBtn) return;

  collectBtn.onclick = () => {
    const offlineBones = getPendingOfflineProgress().bones;
    if (offlineBones <= 0) {
      modal.remove();
      return;
    }
    console.log('Offline Knochen eingesammelt:', offlineBones);
    collectPendingOfflineProgress();

    const statBones = document.getElementById('stat-bones');
    if (statBones) statBones.textContent = formatGameNumber(GameState.bones);

    void (async () => {
      const cloud = await saveToSupabase();
      saveGameLocal({ silent: true });
      document.dispatchEvent(
        new CustomEvent('necro-game-saved', {
          detail: { source: cloud ? 'cloud' : 'local' },
        }),
      );
      modal.remove();
    })();
  };
}

function initTabNavigation() {
  const tabs = [
    { btn: document.getElementById('tab-friedhof'), panel: document.getElementById('panel-friedhof') },
    { btn: document.getElementById('tab-expedition'), panel: document.getElementById('panel-expedition') },
    { btn: document.getElementById('tab-unterwelt'), panel: document.getElementById('panel-unterwelt') },
    { btn: document.getElementById('tab-leaderboard'), panel: document.getElementById('panel-leaderboard') },
  ];

  const activate = (index) => {
    tabs.forEach((t, i) => {
      const on = i === index;
      if (!t.btn || !t.panel) return;
      t.btn.setAttribute('aria-selected', on ? 'true' : 'false');
      t.btn.classList.toggle('tab-btn--active', on);
      t.btn.tabIndex = on ? 0 : -1;
      t.panel.hidden = !on;
      t.panel.classList.toggle('tab-panel--hidden', !on);
    });
    if (index === 3) void refreshLeaderboard();
  };

  tabs.forEach((t, i) => {
    t.btn?.addEventListener('click', () => activate(i));
  });
}

void (async function bootstrap() {
  const adminTest =
    typeof URLSearchParams !== 'undefined' && new URLSearchParams(window.location.search).has('admin');
  setNecromancerAdminSandbox(adminTest);

  const PZ = globalThis.PZ;
  if (PZ && typeof PZ.pruefeSpielStatus === 'function') {
    await PZ.pruefeSpielStatus('necromancer-idle');
  }

  await loadGameAsync();

  const audio = new AudioManager();

  startPassiveLoop();
  initShopUI(audio);
  initExpeditionSystem();
  initSkillTreeUI();
  initLeaderboardTab();
  initTabNavigation();
  initOfflineProgressModal();

  let saveToastTimer = 0;
  document.addEventListener('necro-game-saved', (e) => {
    const el = document.getElementById('save-toast');
    if (!el) return;
    const src = e.detail?.source;
    if (src === 'cloud') {
      el.textContent = 'In der Cloud gespeichert';
    } else if (src === 'local') {
      el.textContent = 'Nur lokal — für Rangliste bitte auf PIXELZONE einloggen';
    } else {
      el.textContent = 'Fortschritt gespeichert';
    }
    el.classList.add('visible');
    window.clearTimeout(saveToastTimer);
    saveToastTimer = window.setTimeout(() => {
      el.classList.remove('visible');
    }, 3200);
  });

  let prestigeBusy = false;
  document.addEventListener('necro-prestige-start', () => {
    if (prestigeBusy || !canPrestigeNow()) return;
    prestigeBusy = true;
    const ov = document.getElementById('prestige-overlay');
    document.body.style.transition = 'opacity 0.55s ease, filter 0.55s ease';
    document.body.style.filter = 'brightness(0.08)';
    ov?.classList.add('prestige-overlay--visible');

    window.setTimeout(() => {
      void (async () => {
        try {
          if (canPrestigeNow()) {
            performPrestige();
          }
        } catch (err) {
          console.error('[Necro] performPrestige', err);
        }
        try {
          await saveGame();
        } catch (err) {
          console.error('[Necro] saveGame', err);
        } finally {
          document.body.style.filter = '';
          document.body.style.transition = '';
          ov?.classList.remove('prestige-overlay--visible');
          prestigeBusy = false;
        }
      })();
    }, 780);
  });

  window.setInterval(() => {
    void saveGame({ silentToast: true });
  }, 30000);

  if (PZ && typeof PZ.adminPanelErstellen === 'function') {
    await PZ.adminPanelErstellen([
      {
        label: '+100.000 Knochen',
        onClick: () => {
          cheatGrantResources({ bones: 100000 });
          void saveGame();
        },
      },
      {
        label: '+1 Mio. Knochen',
        onClick: () => {
          cheatGrantResources({ bones: 1_000_000 });
          void saveGame();
        },
      },
      {
        label: '+500 Welten-Essenz',
        onClick: () => {
          cheatGrantResources({ worldEssence: 500 });
          void saveGame();
        },
      },
    ]);
  }
})();

export { GameState };
