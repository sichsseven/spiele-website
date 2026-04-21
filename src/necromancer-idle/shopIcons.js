import { UPGRADE_DEFINITIONS } from './upgrades.js';

/** Basis-URL (absolut, wie andere Assets im Spiel) */
export const SHOP_ASSET_BASE = '/src/necromancer-idle/assets';

const PPS_POOL = [
  'sceleton.png',
  'icon-bone-blades.png',
  'icon-ghoul-head.png',
  'icon-golem-head.png',
  'skull-top.png',
  'skull-bottom.png',
  'runestone-texture.png',
];

const PPC_POOL = [
  'icon-bone-blades.png',
  'icon-bone-blades1.png',
  'icon-bone.png',
  'icon-confirm.png',
  'icon-ghoul-head.png',
  'icon-golem-head.png',
  'skull-top.png',
];

/** Feste Zuordnung für die Kern-Gebäude / erste Klicks */
const OVERRIDES = {
  skeletonScraper: 'sceleton.png',
  ghoul: 'icon-ghoul-head.png',
  boneGolem: 'icon-golem-head.png',
  boneBlade: 'icon-bone-blades.png',
  soulFocus: 'icon-bone.png',
  ritualDagger: 'icon-bone-blades1.png',
};

function buildUpgradeIconPaths() {
  const map = { ...OVERRIDES };
  let pi = 0;
  let qi = 0;
  for (const def of UPGRADE_DEFINITIONS) {
    if (map[def.id]) continue;
    if (def.type === 'PPS') {
      map[def.id] = PPS_POOL[pi % PPS_POOL.length];
      pi++;
    } else {
      map[def.id] = PPC_POOL[qi % PPC_POOL.length];
      qi++;
    }
  }
  return map;
}

export const UPGRADE_ICON_PATHS = buildUpgradeIconPaths();
