import {
  BUILDINGS,
  PPC_SHOP_UPGRADES,
  PPS_SHOP_UPGRADES,
  SHOP_TIER_COUNT,
  shopUpgradePrice,
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

/** 0 = nicht gekauft, 1 = einmal gekauft (einmalige Upgrades). */
function levelBadgeHtml(count: 0 | 1, kind: "pps" | "ppc", locked: boolean): string {
  const cls = kind === "pps" ? "pf-shop-card__lvl-badge--pps" : "pf-shop-card__lvl-badge--ppc";
  const label = locked ? "?" : String(count);
  return `<span class="pf-shop-card__lvl-badge ${cls}" aria-label="${locked ? "Gesperrt" : count === 1 ? "Gekauft" : "Verfügbar"}">${label}</span>`;
}

function renderUpgrades(container: HTMLElement): void {
  const s = gameState.snapshot;
  const bought = s.economy.boughtUpgrades;
  const basePps = gameState.baseProductionPps();

  const ppsCard = (u: (typeof PPS_SHOP_UPGRADES)[number]): string => {
    const discovered = !!s.session.discoveredUpgrades[u.id];
    const own = bought.includes(u.id);
    const cost = shopUpgradePrice(u);
    const canAfford = s.economy.pixel >= cost;
    if (!discovered) {
      return `
        <div class="pf-shop-card pf-shop-card--pps pf-shop-card--locked" aria-disabled="true">
          ${levelBadgeHtml(0, "pps", true)}
          <div class="pf-shop-card__head">
            <span class="pf-shop-card__step">PPS</span>
            <span class="pf-shop-card__tag pf-shop-card__tag--pps">Linie ${u.tier + 1}/${SHOP_TIER_COUNT}</span>
          </div>
          <h3 class="pf-shop-card__title">???</h3>
          <p class="pf-shop-card__meta">Noch nicht entdeckt</p>
          <div class="pf-shop-card__meter"><div class="pf-shop-card__meter-fill pf-shop-card__meter-fill--pps" style="width:0%"></div></div>
          <button type="button" class="pf-shop-card__btn" disabled>???</button>
        </div>`;
    }
    const stateClass = own ? "pf-shop-card--bought" : canAfford ? "pf-shop-card--afford" : "pf-shop-card--blocked";
    const barPct = own ? 100 : 0;
    const btnDisabled = own || !canAfford;
    const detail = own
      ? `<p class="pf-shop-card__detail">Aktiv: <span class="pf-shop-card__effect pf-shop-card__effect--pps">+${fmtPps(u.pps)} PPS</span></p>`
      : `<p class="pf-shop-card__detail">${u.desc}</p>`;
    return `
      <div class="pf-shop-card pf-shop-card--pps ${stateClass}">
        ${levelBadgeHtml(own ? 1 : 0, "pps", false)}
        <div class="pf-shop-card__head">
          <span class="pf-shop-card__step">PPS</span>
          <span class="pf-shop-card__tag pf-shop-card__tag--pps">Linie ${u.tier + 1}/${SHOP_TIER_COUNT}</span>
        </div>
        <h3 class="pf-shop-card__title">${u.name}</h3>
        <p class="pf-shop-card__effect pf-shop-card__effect--pps">${u.desc}</p>
        ${detail}
        <div class="pf-shop-card__meter" role="presentation">
          <div class="pf-shop-card__meter-fill pf-shop-card__meter-fill--pps" style="width:${barPct}%"></div>
        </div>
        <button type="button" class="pf-shop-card__btn" data-buy-upgrade="${u.id}" ${btnDisabled ? "disabled" : ""}>
          ${own ? "Gekauft" : `${fmtNumber(cost)} <span class="pf-shop-card__btn-pixel">Pixel</span>`}
        </button>
      </div>`;
  };

  const ppcCard = (u: (typeof PPC_SHOP_UPGRADES)[number]): string => {
    const discovered = !!s.session.discoveredUpgrades[u.id];
    const own = bought.includes(u.id);
    const cost = shopUpgradePrice(u);
    const canAfford = s.economy.pixel >= cost;
    const chunk = Math.floor(u.ppcShare * basePps);
    if (!discovered) {
      return `
        <div class="pf-shop-card pf-shop-card--ppc pf-shop-card--locked" aria-disabled="true">
          ${levelBadgeHtml(0, "ppc", true)}
          <div class="pf-shop-card__head">
            <span class="pf-shop-card__step">PPC</span>
            <span class="pf-shop-card__tag pf-shop-card__tag--ppc">Linie ${u.tier + 1}/${SHOP_TIER_COUNT}</span>
          </div>
          <h3 class="pf-shop-card__title">???</h3>
          <p class="pf-shop-card__meta">Noch nicht entdeckt</p>
          <div class="pf-shop-card__meter"><div class="pf-shop-card__meter-fill pf-shop-card__meter-fill--ppc" style="width:0%"></div></div>
          <button type="button" class="pf-shop-card__btn" disabled>???</button>
        </div>`;
    }
    const stateClass = own ? "pf-shop-card--bought" : canAfford ? "pf-shop-card--afford" : "pf-shop-card--blocked";
    const barPct = own ? 100 : 0;
    const btnDisabled = own || !canAfford;
    const detail = own
      ? `<p class="pf-shop-card__detail">Aktiv: <b>+${fmtNumber(chunk)}</b> Klickkraft <span class="pf-shop-card__hint">(${u.desc})</span></p>`
      : `<p class="pf-shop-card__detail">ca. <b>+${fmtNumber(chunk)}</b> Klickkraft · ${u.desc}</p>`;
    return `
      <div class="pf-shop-card pf-shop-card--ppc ${stateClass}">
        ${levelBadgeHtml(own ? 1 : 0, "ppc", false)}
        <div class="pf-shop-card__head">
          <span class="pf-shop-card__step">PPC</span>
          <span class="pf-shop-card__tag pf-shop-card__tag--ppc">Linie ${u.tier + 1}/${SHOP_TIER_COUNT}</span>
        </div>
        <h3 class="pf-shop-card__title">${u.name}</h3>
        <p class="pf-shop-card__effect pf-shop-card__effect--ppc">${u.desc}</p>
        ${detail}
        <div class="pf-shop-card__meter" role="presentation">
          <div class="pf-shop-card__meter-fill pf-shop-card__meter-fill--ppc" style="width:${barPct}%"></div>
        </div>
        <button type="button" class="pf-shop-card__btn" data-buy-upgrade="${u.id}" ${btnDisabled ? "disabled" : ""}>
          ${own ? "Gekauft" : `${fmtNumber(cost)} <span class="pf-shop-card__btn-pixel">Pixel</span>`}
        </button>
      </div>`;
  };

  const rows: string[] = [];
  for (let i = 0; i < SHOP_TIER_COUNT; i += 1) {
    rows.push(ppsCard(PPS_SHOP_UPGRADES[i]!));
    rows.push(ppcCard(PPC_SHOP_UPGRADES[i]!));
  }

  const n = bought.length;
  const max = SHOP_TIER_COUNT * 2;

  container.innerHTML = `
    <div class="pf-shop-upgrades-dark">
      <header class="pf-shop-upgrades-list__head">
        <h4 class="pf-shop-upgrades-list__title">Upgrades</h4>
        <p class="pf-shop-upgrades-list__sub">Abwechselnd: PPS → PPC · einmalig kaufbar</p>
        <p class="pf-shop-upgrades-list__meta" aria-hidden="true">${n}/${max} gekauft</p>
      </header>
      <div class="pf-shop-upgrades-list">${rows.join("")}</div>
    </div>`;

  container.querySelectorAll<HTMLButtonElement>("[data-buy-upgrade]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.buyUpgrade!;
      const snap = gameState.snapshot;
      const u = [...PPS_SHOP_UPGRADES, ...PPC_SHOP_UPGRADES].find((x) => x.id === id);
      if (!u || !snap.session.discoveredUpgrades[id]) return;
      if (snap.economy.boughtUpgrades.includes(id)) return;
      if (snap.economy.pixel < shopUpgradePrice(u)) return;
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
