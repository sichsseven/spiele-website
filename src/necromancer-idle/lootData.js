/**
 * Expedition-Loot: Raritäten-RNG (Platzhalter-Namen, keine Gameplay-Effekte vorerst).
 */

/** @typedef {'common' | 'rare' | 'epic' | 'legendary'} LootRarityKey */

export const LOOT_RARITY = {
  common: {
    id: 'common',
    label: 'Gewöhnlich',
    color: '#d4d4d4',
  },
  rare: {
    id: 'rare',
    label: 'Selten',
    color: '#5eb3ff',
  },
  epic: {
    id: 'epic',
    label: 'Episch',
    color: '#c084fc',
  },
  legendary: {
    id: 'legendary',
    label: 'Legendär',
    color: '#f0c850',
  },
};

/** Platzhalter-Beute pro Rarität */
export const LOOT_PLACEHOLDER_NAMES = {
  common: [
    'Zerbrochener Knochen',
    'Abgenutzter Nagel',
    'Rostiges Eisenstück',
    'Splitter eines Grabsteins',
  ],
  rare: [
    'Verzierter Phalanger',
    'Silberner Schlüsselbein-Ring',
    'Grabkerze der Stille',
  ],
  epic: [
    'Seelenperle der Krypta',
    'Knochenkrone des Verrats',
    'Blut-Siegel der Ahnen',
  ],
  legendary: [
    'Krone des Lichkönigs',
    'Herz der Endlosen Nacht',
  ],
};

/**
 * Eine Plünderung = ein Loot-Wurf (Verteilung in %).
 * @returns {{ rarityKey: LootRarityKey; itemName: string; color: string; label: string }}
 */
export function rollExpeditionLoot() {
  const r = Math.random() * 100;
  /** @type {LootRarityKey} */
  let rarityKey;
  if (r < 60) rarityKey = 'common';
  else if (r < 85) rarityKey = 'rare';
  else if (r < 99) rarityKey = 'epic';
  else rarityKey = 'legendary';

  const names = LOOT_PLACEHOLDER_NAMES[rarityKey];
  const itemName = names[Math.floor(Math.random() * names.length)] ?? '?';
  const meta = LOOT_RARITY[rarityKey];
  return {
    rarityKey,
    itemName,
    color: meta.color,
    label: meta.label,
  };
}
