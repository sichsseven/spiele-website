/**
 * Welten-Essenz-Skilltree: Knoten, Abhängigkeiten, Positionen (Prozent).
 */

/** @typedef {{ id: string; name: string; cost: number; requires: string[]; x: number; y: number; path: string }} SkillNodeDef */

/** @param {string} id */
export function getSkillNodeById(id) {
  return SKILL_TREE_NODES.find((n) => n.id === id);
}

export const SKILL_TREE_NODES = /** @type {SkillNodeDef[]} */ ([
  {
    id: 'center_node',
    name: 'Das Erwachen',
    cost: 0,
    requires: [],
    x: 50,
    y: 50,
    path: 'Zentrum',
  },
  // Pfad des Blutes (Klicks) — oben links
  {
    id: 'blood_1',
    name: 'Puls der Fingerknochen',
    cost: 8,
    requires: ['center_node'],
    x: 38,
    y: 38,
    path: 'Blut',
  },
  {
    id: 'blood_2',
    name: 'Ader des Altars',
    cost: 20,
    requires: ['blood_1'],
    x: 28,
    y: 28,
    path: 'Blut',
  },
  {
    id: 'blood_3',
    name: 'Herzklopfen der Toten',
    cost: 45,
    requires: ['blood_2'],
    x: 18,
    y: 18,
    path: 'Blut',
  },
  {
    id: 'blood_4',
    name: 'Blutpakt der Sieben Siegel',
    cost: 95,
    requires: ['blood_3'],
    x: 10,
    y: 12,
    path: 'Blut',
  },
  {
    id: 'blood_5',
    name: 'Schlag des Knochensturms',
    cost: 180,
    requires: ['blood_4'],
    x: 6,
    y: 6,
    path: 'Blut',
  },
  // Pfad der Schatten (Passiv / Generatoren) — oben rechts
  {
    id: 'shadow_1',
    name: 'Flüstern der Gruft',
    cost: 8,
    requires: ['center_node'],
    x: 62,
    y: 38,
    path: 'Schatten',
  },
  {
    id: 'shadow_2',
    name: 'Nebel der endlosen Schichten',
    cost: 20,
    requires: ['shadow_1'],
    x: 72,
    y: 28,
    path: 'Schatten',
  },
  {
    id: 'shadow_3',
    name: 'Schatten-Webwerk',
    cost: 45,
    requires: ['shadow_2'],
    x: 82,
    y: 18,
    path: 'Schatten',
  },
  {
    id: 'shadow_4',
    name: 'Kern der schweigenden Fabrik',
    cost: 95,
    requires: ['shadow_3'],
    x: 90,
    y: 12,
    path: 'Schatten',
  },
  {
    id: 'shadow_5',
    name: 'Thron aus nächtlicher Arbeit',
    cost: 180,
    requires: ['shadow_4'],
    x: 94,
    y: 6,
    path: 'Schatten',
  },
  // Pfad der Eroberer (Expedition / Beute) — unten
  {
    id: 'war_1',
    name: 'Erster Tritt ins Dorf',
    cost: 8,
    requires: ['center_node'],
    x: 44,
    y: 62,
    path: 'Eroberer',
  },
  {
    id: 'war_2',
    name: 'Banner aus Rippen',
    cost: 20,
    requires: ['war_1'],
    x: 38,
    y: 74,
    path: 'Eroberer',
  },
  {
    id: 'war_3',
    name: 'Beute-Katalog der Angst',
    cost: 45,
    requires: ['war_2'],
    x: 32,
    y: 84,
    path: 'Eroberer',
  },
  {
    id: 'war_4',
    name: 'Heerlager der Leere',
    cost: 95,
    requires: ['war_3'],
    x: 50,
    y: 90,
    path: 'Eroberer',
  },
  {
    id: 'war_5',
    name: 'Krone der verwüsteten Felder',
    cost: 180,
    requires: ['war_4'],
    x: 62,
    y: 94,
    path: 'Eroberer',
  },
]);

/** Kanten für SVG: jedes requires-Eintrag erzeugt Kante parent -> node */
export function getSkillTreeEdges() {
  /** @type {{ from: string; to: string }[]} */
  const edges = [];
  for (const node of SKILL_TREE_NODES) {
    for (const req of node.requires) {
      edges.push({ from: req, to: node.id });
    }
  }
  return edges;
}
