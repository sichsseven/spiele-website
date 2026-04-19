import {
  BUILDINGS,
  PPC_SHOP_UPGRADES,
  PPS_SHOP_UPGRADES,
  SHOP_TIER_COUNT,
  shopUpgradePriceAtLevel,
} from "../../data/buildings";
import { gameState } from "../../core/GameState";
import { fmtNumber, fmtPps } from "../../core/format";

let shopTimer: number | null = null;

function renderBuildings(container: HTMLElement): void {
  const s = gameState.snapshot;
  const bulk = s.economy.bulk === 0 ? 9999 : s.economy.bulk;
  container.innerHTML = `<div class="pf-card-grid pf-card-grid--shop">${BUILDINGS.map((b) => {
    const discovered = !!s.session.discoveredBuildings[b.id];
    if (!discovered) {
      return `
        <button type="button" class="pf-game-card pf-game-card--building pf-game-card--locked" disabled>
          <div class="pf-card-icon pf-card-icon--muted">?</div>
          <div class="pf-card-main">
            <h3 class="pf-card-title">???</h3>
            <p class="pf-card-meta">Noch nicht entdeckt</p>
          </div>
          <span class="pf-card-buy pf-card-buy--disabled">???</span>
        </button>`;
    }
    const can = gameState.canBuyBuildingAmount(b, bulk) > 0;
    const cost = gameState.buildingCost(b, 0);
    const cnt = s.economy.buildings[b.id] || 0;
    return `
      <button type="button" class="pf-game-card pf-game-card--building ${can ? "pf-game-card--afford" : "pf-game-card--expensive"}" data-buy-building="${b.id}">
        <div class="pf-card-icon pf-card-icon--building">${b.icon}</div>
        <div class="pf-card-main">
          <h3 class="pf-card-title">${b.name} <span class="pf-card-badge">${cnt}</span></h3>
          <p class="pf-card-effect pf-card-effect--pps">+${fmtPps(b.pps)} <span class="pf-effect-label">PPS</span> <small>pro Stück</small></p>
        </div>
        <span class="pf-card-buy">${fmtNumber(cost)} <span class="pf-pixel-unit">Pixel</span></span>
      </button>`;
  }).join("")}</div>`;

  container.querySelectorAll<HTMLButtonElement>("[data-buy-building]").forEach((btn) => {
    btn.addEventListener("click", () => {
      gameState.buyBuilding(btn.dataset.buyBuilding!);
      gameState.saveToLocalStorage();
      renderBuildings(container);
      renderUpgrades(document.getElementById("shopUpgradesRoot")!);
    });
  });
}

function sumLevels(defs: { id: string }[], levels: Record<string, number>): number {
  return defs.reduce((acc, u) => acc + Math.max(0, Math.floor(levels[u.id] ?? 0)), 0);
}

function columnProgressHtml(totalLevels: number): string {
  const pct = Math.min(100, totalLevels === 0 ? 0 : 8 + Math.min(92, totalLevels * 4));
  return `
    <div class="pf-shop-col__progress" aria-hidden="true">
      <div class="pf-shop-col__progress-label">Σ Stufen: ${totalLevels}</div>
      <div class="pf-shop-col__track">
        <div class="pf-shop-col__fill" style="width:${pct}%"></div>
      </div>
    </div>`;
}

function renderUpgrades(container: HTMLElement): void {
  const s = gameState.snapshot;
  const lv = s.economy.shopUpgradeLevels;
  const basePps = gameState.baseProductionPps();

  const ppsCard = (u: (typeof PPS_SHOP_UPGRADES)[number]): string => {
    const discovered = !!s.session.discoveredUpgrades[u.id];
    const level = Math.max(0, Math.floor(lv[u.id] ?? 0));
    const cost = shopUpgradePriceAtLevel(u, level);
    const canAfford = s.economy.pixel >= cost;
    if (!discovered) {
      return `
        <div class="pf-shop-card pf-shop-card--pps pf-shop-card--locked" aria-disabled="true">
          <div class="pf-shop-card__head">
            <span class="pf-shop-card__step">Linie ${u.tier + 1}/${SHOP_TIER_COUNT}</span>
            <span class="pf-shop-card__tag pf-shop-card__tag--pps">PPS</span>
          </div>
          <h3 class="pf-shop-card__title">???</h3>
          <p class="pf-shop-card__meta">Noch nicht entdeckt</p>
          <div class="pf-shop-card__meter"><div class="pf-shop-card__meter-fill pf-shop-card__meter-fill--pps" style="width:0%"></div></div>
          <button type="button" class="pf-shop-card__btn" disabled>???</button>
        </div>`;
    }
    const stateClass = canAfford ? "pf-shop-card--afford" : "pf-shop-card--blocked";
    const barPct = Math.min(100, level === 0 ? 0 : 12 + Math.min(88, level * 10));
    const totalPps = level * u.pps;
    const detail =
      level > 0
        ? `<p class="pf-shop-card__detail">Stufe <b>${level}</b> · gesamt <span class="pf-shop-card__effect pf-shop-card__effect--pps">+${fmtPps(totalPps)} PPS</span> <span class="pf-shop-card__hint">(pro Stufe ${u.desc.replace("+", "")})</span></p>`
        : `<p class="pf-shop-card__detail">Noch nicht gekauft · ${u.desc} pro Stufe</p>`;
    const btnDisabled = !canAfford;
    return `
      <div class="pf-shop-card pf-shop-card--pps ${stateClass}">
        <div class="pf-shop-card__head">
          <span class="pf-shop-card__step">Linie ${u.tier + 1}/${SHOP_TIER_COUNT}</span>
          <span class="pf-shop-card__tag pf-shop-card__tag--pps">PPS</span>
        </div>
        <h3 class="pf-shop-card__title">${u.name}</h3>
        <p class="pf-shop-card__effect pf-shop-card__effect--pps">${u.desc} <small>pro Stufe</small></p>
        ${detail}
        <div class="pf-shop-card__meter" role="presentation">
          <div class="pf-shop-card__meter-fill pf-shop-card__meter-fill--pps" style="width:${barPct}%"></div>
        </div>
        <button type="button" class="pf-shop-card__btn" data-buy-upgrade="${u.id}" ${btnDisabled ? "disabled" : ""}>
          Nächster Kauf: ${fmtNumber(cost)} Pixel
        </button>
      </div>`;
  };

  const ppcCard = (u: (typeof PPC_SHOP_UPGRADES)[number]): string => {
    const discovered = !!s.session.discoveredUpgrades[u.id];
    const level = Math.max(0, Math.floor(lv[u.id] ?? 0));
    const cost = shopUpgradePriceAtLevel(u, level);
    const canAfford = s.economy.pixel >= cost;
    const chunk = Math.floor(u.ppcShare * basePps);
    const totalFlat = level * chunk;
    if (!discovered) {
      return `
        <div class="pf-shop-card pf-shop-card--ppc pf-shop-card--locked" aria-disabled="true">
          <div class="pf-shop-card__head">
            <span class="pf-shop-card__step">Linie ${u.tier + 1}/${SHOP_TIER_COUNT}</span>
            <span class="pf-shop-card__tag pf-shop-card__tag--ppc">PPC</span>
          </div>
          <h3 class="pf-shop-card__title">???</h3>
          <p class="pf-shop-card__meta">Noch nicht entdeckt</p>
          <div class="pf-shop-card__meter"><div class="pf-shop-card__meter-fill pf-shop-card__meter-fill--ppc" style="width:0%"></div></div>
          <button type="button" class="pf-shop-card__btn" disabled>???</button>
        </div>`;
    }
    const stateClass = canAfford ? "pf-shop-card--afford" : "pf-shop-card--blocked";
    const barPct = Math.min(100, level === 0 ? 0 : 12 + Math.min(88, level * 10));
    const detail =
      level > 0
        ? `<p class="pf-shop-card__detail">Stufe <b>${level}</b> · gesamt <b>+${fmtNumber(totalFlat)}</b> Klickkraft <span class="pf-shop-card__hint">(Basis-PPS · ${u.desc})</span></p>`
        : `<p class="pf-shop-card__detail">Nächste Stufe ≈ <b>+${fmtNumber(chunk)}</b> Klickkraft · ${u.desc} pro Stufe</p>`;
    const btnDisabled = !canAfford;
    return `
      <div class="pf-shop-card pf-shop-card--ppc ${stateClass}">
        <div class="pf-shop-card__head">
          <span class="pf-shop-card__step">Linie ${u.tier + 1}/${SHOP_TIER_COUNT}</span>
          <span class="pf-shop-card__tag pf-shop-card__tag--ppc">PPC</span>
        </div>
        <h3 class="pf-shop-card__title">${u.name}</h3>
        <p class="pf-shop-card__effect pf-shop-card__effect--ppc">${u.desc} <small>pro Stufe</small></p>
        ${detail}
        <div class="pf-shop-card__meter" role="presentation">
          <div class="pf-shop-card__meter-fill pf-shop-card__meter-fill--ppc" style="width:${barPct}%"></div>
        </div>
        <button type="button" class="pf-shop-card__btn" data-buy-upgrade="${u.id}" ${btnDisabled ? "disabled" : ""}>
          Nächster Kauf: ${fmtNumber(cost)} Pixel
        </button>
      </div>`;
  };

  const ppsTotal = sumLevels(PPS_SHOP_UPGRADES, lv);
  const ppcTotal = sumLevels(PPC_SHOP_UPGRADES, lv);

  const colPps = PPS_SHOP_UPGRADES.map((u) => ppsCard(u)).join("");
  const colPpc = PPC_SHOP_UPGRADES.map((u) => ppcCard(u)).join("");

  container.innerHTML = `
    <div class="pf-shop-upgrades-dark">
      <div class="pf-shop-upgrades-grid">
        <section class="pf-shop-col pf-shop-col--pps" aria-labelledby="pf-shop-prod-title">
          <header class="pf-shop-col__header">
            <h4 id="pf-shop-prod-title" class="pf-shop-col__title">Produktion</h4>
            <p class="pf-shop-col__subtitle">Pixel pro Sekunde (PPS) · mehrfach kaufbar</p>
            ${columnProgressHtml(ppsTotal)}
          </header>
          <div class="pf-shop-col__cards">${colPps}</div>
        </section>
        <section class="pf-shop-col pf-shop-col--ppc" aria-labelledby="pf-shop-click-title">
          <header class="pf-shop-col__header">
            <h4 id="pf-shop-click-title" class="pf-shop-col__title">Manuelle Kraft</h4>
            <p class="pf-shop-col__subtitle">Pixel pro Klick (PPC) · mehrfach kaufbar</p>
            ${columnProgressHtml(ppcTotal)}
          </header>
          <div class="pf-shop-col__cards">${colPpc}</div>
        </section>
      </div>
    </div>`;

  container.querySelectorAll<HTMLButtonElement>("[data-buy-upgrade]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.buyUpgrade!;
      const snap = gameState.snapshot;
      const u = [...PPS_SHOP_UPGRADES, ...PPC_SHOP_UPGRADES].find((x) => x.id === id);
      if (!u || !snap.session.discoveredUpgrades[id]) return;
      const cur = Math.max(0, Math.floor(snap.economy.shopUpgradeLevels[id] ?? 0));
      if (snap.economy.pixel < shopUpgradePriceAtLevel(u, cur)) return;
      gameState.buyShopUpgrade(id);
      gameState.saveToLocalStorage();
      renderUpgrades(container);
      renderBuildings(document.getElementById("shopBuildingsRoot")!);
    });
  });
}

function syncBulkUi(overlay: HTMLElement): void {
  const b = gameState.snapshot.economy.bulk;
  overlay.querySelectorAll<HTMLButtonElement>(".pf-bulk-btn").forEach((btn) => {
    const m = Number(btn.dataset.menge);
    const active = m === 0 ? b === 0 : b === m;
    btn.classList.toggle("pf-bulk-btn--active", active);
  });
}

export function initShopView(): void {
  const overlay = document.getElementById("shopOverlay");
  const openBtn = document.getElementById("btnOpenShop");
  const buildingsRoot = document.getElementById("shopBuildingsRoot");
  const upgradesRoot = document.getElementById("shopUpgradesRoot");
  if (!overlay || !openBtn || !buildingsRoot || !upgradesRoot) return;

  const close = () => {
    overlay.classList.add("pf-overlay--hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("pf-modal-open");
    if (shopTimer !== null) {
      window.clearInterval(shopTimer);
      shopTimer = null;
    }
  };

  const open = () => {
    overlay.classList.remove("pf-overlay--hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("pf-modal-open");
    const activeTab = overlay.querySelector<HTMLButtonElement>(".pf-shop-tab--active");
    if (activeTab?.dataset.tab === "upgrades") overlay.classList.add("pf-overlay--shop-dark");
    else overlay.classList.remove("pf-overlay--shop-dark");
    syncBulkUi(overlay);
    renderBuildings(buildingsRoot);
    renderUpgrades(upgradesRoot);
    if (shopTimer !== null) window.clearInterval(shopTimer);
    shopTimer = window.setInterval(() => {
      if (!overlay.classList.contains("pf-overlay--hidden")) {
        renderBuildings(buildingsRoot);
        renderUpgrades(upgradesRoot);
      }
    }, 320);
  };

  openBtn.addEventListener("click", open);

  overlay.querySelectorAll("[data-close-overlay]").forEach((el) => {
    el.addEventListener("click", close);
  });

  overlay.querySelectorAll<HTMLButtonElement>(".pf-shop-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.tab;
      overlay.querySelectorAll(".pf-shop-tab").forEach((t) => t.classList.remove("pf-shop-tab--active"));
      tab.classList.add("pf-shop-tab--active");
      const geo = document.getElementById("shopGebaeudePane");
      const up = document.getElementById("shopUpgradesPane");
      const bulk = document.getElementById("shopBulkRow");
      if (name === "gebaeude") {
        geo?.classList.remove("pf-hidden");
        up?.classList.add("pf-hidden");
        bulk?.classList.remove("pf-hidden");
        overlay.classList.remove("pf-overlay--shop-dark");
      } else {
        geo?.classList.add("pf-hidden");
        up?.classList.remove("pf-hidden");
        bulk?.classList.add("pf-hidden");
        overlay.classList.add("pf-overlay--shop-dark");
      }
    });
  });

  overlay.querySelectorAll<HTMLButtonElement>(".pf-bulk-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      gameState.setBulk(Number(btn.dataset.menge));
      gameState.saveToLocalStorage();
      syncBulkUi(overlay);
      renderBuildings(buildingsRoot);
    });
  });
}
