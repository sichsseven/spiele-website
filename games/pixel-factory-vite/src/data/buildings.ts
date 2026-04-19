/** Gebäude- und Shop-Definitionen aus game-rework-v2.js. */

export interface BuildingDef {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  /** Preisfaktor pro gekauftem Stück (wie v2 `growth`). */
  growth: number;
  pps: number;
  unlockAt: number;
}

export const BUILDINGS: BuildingDef[] = [
  { id: "worker", name: "Pixel-Arbeiter", icon: "🧑‍🏭", baseCost: 15, growth: 1.128, pps: 0.4, unlockAt: 0 },
  { id: "intern", name: "Praktikant", icon: "🧢", baseCost: 70, growth: 1.136, pps: 1.4, unlockAt: 50 },
  { id: "printer", name: "Nano-Drucker", icon: "🖨️", baseCost: 260, growth: 1.145, pps: 5.6, unlockAt: 170 },
  { id: "assembler", name: "Assembler", icon: "⚙️", baseCost: 980, growth: 1.154, pps: 16, unlockAt: 650 },
  { id: "robot", name: "Roboterarm", icon: "🤖", baseCost: 3900, growth: 1.162, pps: 49, unlockAt: 2200 },
  { id: "reactor", name: "Fusion-Reaktor", icon: "⚡", baseCost: 15000, growth: 1.171, pps: 170, unlockAt: 8800 },
  { id: "cluster", name: "Chip-Cluster", icon: "🧠", baseCost: 54000, growth: 1.18, pps: 610, unlockAt: 30000 },
  { id: "satellite", name: "Satelliten-Linie", icon: "🛰️", baseCost: 190000, growth: 1.188, pps: 2100, unlockAt: 110000 },
  { id: "laserFab", name: "Laser-Fabrik", icon: "🔴", baseCost: 680000, growth: 1.197, pps: 7000, unlockAt: 420000 },
  { id: "quantumCore", name: "Line-Core", icon: "🌀", baseCost: 2400000, growth: 1.206, pps: 21000, unlockAt: 1500000 },
  { id: "matrix", name: "Matrix-Fabrik", icon: "🏭", baseCost: 8500000, growth: 1.215, pps: 68000, unlockAt: 5000000 },
  { id: "arcology", name: "Pixel-Arcology", icon: "🏙️", baseCost: 31000000, growth: 1.224, pps: 210000, unlockAt: 18000000 },
  { id: "orbitalDock", name: "Orbital-Dock", icon: "🛸", baseCost: 115000000, growth: 1.232, pps: 690000, unlockAt: 70000000 },
];

/**
 * Kosten für den **nächsten** Kauf, wenn bereits `ownedLevel` Stufen dieser Linie gekauft sind
 * (0 = noch keiner). Preis = floor(costBase × 1.15^(tier + ownedLevel)).
 */
export const SHOP_COST_GROWTH = 1.15;

export interface PpsShopUpgradeDef {
  id: string;
  name: string;
  /** Kurzbeschreibung (fx. Bonus). */
  desc: string;
  pps: number;
  /** Stufe 0–4 für Kostenformel und UI. */
  tier: number;
  costBase: number;
  unlockAt: number;
}

/**
 * Preis = floor(costBase × 1.15^tier). `costBase` so gewählt, dass die effektiven Preise
 * der vorherigen Balance nahe bleiben (Zielwerte ca. 580 / 4.800 / 39.500 / 365k / 2,95M).
 */
export const PPS_SHOP_UPGRADES: PpsShopUpgradeDef[] = [
  { id: "ps_1", name: "Schichtplan", desc: "+18 px/s", pps: 18, tier: 0, costBase: 580, unlockAt: 280 },
  { id: "ps_2", name: "Qualitätskette", desc: "+85 px/s", pps: 85, tier: 1, costBase: 4174, unlockAt: 2600 },
  { id: "ps_3", name: "Fließband-KI", desc: "+420 px/s", pps: 420, tier: 2, costBase: 29868, unlockAt: 20000 },
  { id: "ps_4", name: "Takt-Optimierung", desc: "+3.800 px/s", pps: 3800, tier: 3, costBase: 239993, unlockAt: 180000 },
  { id: "ps_5", name: "Parallel-Layer", desc: "+32.000 px/s", pps: 32000, tier: 4, costBase: 1686677, unlockAt: 1900000 },
];

/**
 * Klick-Bonus pro Stufe: Anteil der Basis-PPS (Gebäude + PPS-Shop, ohne Multiplikatoren).
 * Stufen 10–14 %, im Mittel ~12 %.
 */
export interface PpcShopUpgradeDef {
  id: string;
  name: string;
  desc: string;
  ppcShare: number;
  tier: number;
  costBase: number;
  unlockAt: number;
}

export const PPC_SHOP_UPGRADES: PpcShopUpgradeDef[] = [
  { id: "pc_1", name: "Präzisions-Klick", desc: "+10% der Basis-PPS", ppcShare: 0.1, tier: 0, costBase: 52, unlockAt: 32 },
  { id: "pc_2", name: "Servo-Hand", desc: "+11% der Basis-PPS", ppcShare: 0.11, tier: 1, costBase: 365, unlockAt: 200 },
  { id: "pc_3", name: "Impuls-Handschuh", desc: "+12% der Basis-PPS", ppcShare: 0.12, tier: 2, costBase: 2420, unlockAt: 1500 },
  { id: "pc_4", name: "Hyperfinger", desc: "+13% der Basis-PPS", ppcShare: 0.13, tier: 3, costBase: 14465, unlockAt: 10000 },
  { id: "pc_5", name: "Neural-Link", desc: "+14% der Basis-PPS", ppcShare: 0.14, tier: 4, costBase: 111493, unlockAt: 120000 },
];

export const SHOP_TIER_COUNT = 5;

export type ShopUpgradeDef = PpsShopUpgradeDef | PpcShopUpgradeDef;

export const SHOP_UPGRADES_ALL: ShopUpgradeDef[] = [...PPS_SHOP_UPGRADES, ...PPC_SHOP_UPGRADES];

export const SHOP_UPGRADE_IDS = new Set(SHOP_UPGRADES_ALL.map((u) => u.id));

export function shopPpsUpgradeCostAtLevel(u: PpsShopUpgradeDef, ownedLevel: number): number {
  return Math.floor(u.costBase * Math.pow(SHOP_COST_GROWTH, u.tier + Math.max(0, ownedLevel)));
}

export function shopPpcUpgradeCostAtLevel(u: PpcShopUpgradeDef, ownedLevel: number): number {
  return Math.floor(u.costBase * Math.pow(SHOP_COST_GROWTH, u.tier + Math.max(0, ownedLevel)));
}

export function shopUpgradePriceAtLevel(u: ShopUpgradeDef, ownedLevel: number): number {
  if ("pps" in u) return shopPpsUpgradeCostAtLevel(u, ownedLevel);
  return shopPpcUpgradeCostAtLevel(u, ownedLevel);
}

export interface MissionDef {
  id: string;
  type: "produce" | "clicks" | "combo";
  name: string;
  desc: string;
  baseTarget: number;
  reward: {
    pixel?: number;
    timedClick?: number;
    timedProd?: number;
  };
}

export const MISSIONS: MissionDef[] = [
  { id: "m_prod_short", type: "produce", name: "Schichtziel", desc: "Produziere {target} Pixel", baseTarget: 24000, reward: { pixel: 9000 } },
  { id: "m_prod_long", type: "produce", name: "Fokuslauf", desc: "Produziere {target} Pixel", baseTarget: 140000, reward: { pixel: 65000 } },
  { id: "m_click", type: "clicks", name: "Handarbeit", desc: "Mache {target} Klicks", baseTarget: 380, reward: { pixel: 18000, timedClick: 1.55 } },
  { id: "m_combo", type: "combo", name: "Flow-Kette", desc: "Erreiche eine Kombo von {target}", baseTarget: 20, reward: { pixel: 12000, timedProd: 1.45 } },
];
