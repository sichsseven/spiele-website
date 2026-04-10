'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║  PIXEL FACTORY – Spielkonstanten                        ║
// ╚══════════════════════════════════════════════════════════╝

// === GEBÄUDE ===
// basisPPS verdoppelt sich bei jedem Gebäude-Typ (Typ 1=1, Typ 2=2, Typ 3=4, ...)
// Pro gekauftem Stück: basisPPS × anzahl (linear)
const GEBAEUDE = [
  { id: 'maschine',      name: 'Einfache Maschine',          basisPreis: 15,           basisPPS: 1,       farbe: '#94a3b8' },
  { id: 'foerderband',   name: 'Förderband',                 basisPreis: 100,          basisPPS: 2,       farbe: '#60a5fa' },
  { id: 'drucker',       name: 'Pixel-Drucker',              basisPreis: 500,          basisPPS: 4,       farbe: '#34d399' },
  { id: 'sortieranlage', name: 'Automatische Sortieranlage', basisPreis: 2000,         basisPPS: 8,       farbe: '#f472b6' },
  { id: 'labor',         name: 'Pixel-Labor',                basisPreis: 10000,        basisPPS: 16,      farbe: '#a78bfa' },
  { id: 'quantencomp',   name: 'Quantencomputer',            basisPreis: 50000,        basisPPS: 32,      farbe: '#38bdf8' },
  { id: 'reaktor',       name: 'Pixel-Reaktor',              basisPreis: 200000,       basisPPS: 64,      farbe: '#fb923c' },
  { id: 'portal',        name: 'Dimensionsportal',           basisPreis: 1000000,      basisPPS: 128,     farbe: '#818cf8' },
  { id: 'universum',     name: 'Pixel-Universum',            basisPreis: 10000000,     basisPPS: 256,     farbe: '#2dd4bf' },
  { id: 'zeitmaschine',  name: 'Zeitmaschine',               basisPreis: 100000000,    basisPPS: 512,     farbe: '#fbbf24' },
  { id: 'nanofabrik',    name: 'Nano-Fabrik',                basisPreis: 500000000,    basisPPS: 1024,    farbe: '#06b6d4', minPrestige: 5  },
  { id: 'biomatrix',     name: 'Bio-Matrix',                 basisPreis: 5000000000,   basisPPS: 2048,    farbe: '#84cc16', minPrestige: 10 },
  { id: 'warpgenerator', name: 'Warp-Generator',             basisPreis: 50000000000,  basisPPS: 4096,    farbe: '#ec4899', minPrestige: 15 },
  { id: 'singularitaet', name: 'Pixel-Singularität',         basisPreis: 500000000000, basisPPS: 8192,    farbe: '#f43f5e', minPrestige: 20 },
  { id: 'goettlich',     name: 'Göttliche Fabrik',           basisPreis: 5000000000000,basisPPS: 16384,   farbe: '#d946ef', minPrestige: 25 },
];

// Preis eines Gebäudes bei aktueller Anzahl
function gebaeudePreis(g, anzahl) {
  let preis = g.basisPreis * Math.pow(1.15, anzahl);
  // Talent: Gebäude-Rabatt
  const rabatt = talentLevel('tal_prod_rabatt');
  if (rabatt > 0) preis *= Math.pow(1 - 0.08, rabatt);
  return Math.ceil(preis);
}

// === UPGRADES (Normale Upgrades) ===

// Klick-Upgrades: glatte Preiskurve, viele additive Stufen dann Multiplikatoren
const KLICK_UPGRADES = [
  { id: 'klick_1',  name: 'Verbesserter Klick',      beschreibung: '+1 Pixel pro Klick',       preis: 50,         typ: 'klick_add',  wert: 1,   bedingung: (z) => z.gesamtKlicks >= 5 },
  { id: 'klick_2',  name: 'Doppelklick-System',      beschreibung: '+2 Pixel pro Klick',       preis: 200,        typ: 'klick_add',  wert: 2,   bedingung: (z) => z.gesamtKlicks >= 25 },
  { id: 'klick_3',  name: 'Klick-Turbo I',           beschreibung: '+3 Pixel pro Klick',       preis: 700,        typ: 'klick_add',  wert: 3,   bedingung: (z) => z.gesamtKlicks >= 75 },
  { id: 'klick_4',  name: 'Klick-Turbo II',          beschreibung: '+4 Pixel pro Klick',       preis: 2500,       typ: 'klick_add',  wert: 4,   bedingung: (z) => z.gesamtKlicks >= 200 },
  { id: 'klick_5',  name: 'Klick-Turbo III',         beschreibung: '+6 Pixel pro Klick',       preis: 8000,       typ: 'klick_add',  wert: 6,   bedingung: (z) => z.gesamtKlicks >= 500 },
  { id: 'klick_6',  name: 'Klick-Turbo IV',          beschreibung: '+8 Pixel pro Klick',       preis: 25000,      typ: 'klick_add',  wert: 8,   bedingung: (z) => z.gesamtKlicks >= 1500 },
  { id: 'klick_7',  name: 'Klick-Turbo V',           beschreibung: '+12 Pixel pro Klick',      preis: 80000,      typ: 'klick_add',  wert: 12,  bedingung: (z) => z.gesamtKlicks >= 4000 },
  { id: 'klick_8',  name: 'Klick-Turbo VI',          beschreibung: '+16 Pixel pro Klick',      preis: 250000,     typ: 'klick_add',  wert: 16,  bedingung: (z) => z.gesamtKlicks >= 10000 },
  { id: 'klick_9',  name: 'Klick-Turbo VII',         beschreibung: '+24 Pixel pro Klick',      preis: 800000,     typ: 'klick_add',  wert: 24,  bedingung: (z) => z.gesamtKlicks >= 25000 },
  { id: 'klick_10', name: 'Klick-Turbo VIII',        beschreibung: '+32 Pixel pro Klick',      preis: 2500000,    typ: 'klick_add',  wert: 32,  bedingung: (z) => z.gesamtKlicks >= 60000 },
  { id: 'klick_11', name: 'Klick-Turbo IX',          beschreibung: '+48 Pixel pro Klick',      preis: 8000000,    typ: 'klick_add',  wert: 48,  bedingung: (z) => z.gesamtKlicks >= 150000 },
  { id: 'klick_12', name: 'Klick-Turbo X',           beschreibung: '+64 Pixel pro Klick',      preis: 25000000,   typ: 'klick_add',  wert: 64,  bedingung: (z) => z.gesamtKlicks >= 400000 },
  { id: 'klick_13', name: 'Klick-Turbo XI',          beschreibung: '+100 Pixel pro Klick',     preis: 80000000,   typ: 'klick_add',  wert: 100, bedingung: (z) => z.gesamtKlicks >= 1000000 },
  { id: 'klick_14', name: 'Klick-Turbo XII',         beschreibung: '+150 Pixel pro Klick',     preis: 250000000,  typ: 'klick_add',  wert: 150, bedingung: (z) => z.gesamtKlicks >= 3000000 },
  { id: 'klick_15', name: 'Klick-Verstärker I',      beschreibung: '×2 Klick-Leistung',        preis: 800000000,  typ: 'klick_mult', wert: 2,   bedingung: (z) => z.gesamtKlicks >= 8000000 },
  { id: 'klick_16', name: 'Klick-Verstärker II',     beschreibung: '×3 Klick-Leistung',        preis: 3000000000, typ: 'klick_mult', wert: 3,   bedingung: (z) => z.gesamtKlicks >= 20000000 },
  { id: 'klick_17', name: 'Klick-Verstärker III',    beschreibung: '×5 Klick-Leistung',        preis: 1e10,       typ: 'klick_mult', wert: 5,   bedingung: (z) => z.gesamtKlicks >= 50000000 },
  { id: 'klick_18', name: 'Mega-Klick',              beschreibung: '×10 Klick-Leistung',       preis: 4e10,       typ: 'klick_mult', wert: 10,  bedingung: (z) => z.gesamtKlicks >= 100000000 },
  { id: 'klick_19', name: 'Hyper-Klick',             beschreibung: '×20 Klick-Leistung',       preis: 2e11,       typ: 'klick_mult', wert: 20,  bedingung: (z) => z.gesamtKlicks >= 300000000 },
  { id: 'klick_20', name: 'Giga-Klick',              beschreibung: '×50 Klick-Leistung',       preis: 1e12,       typ: 'klick_mult', wert: 50,  bedingung: (z) => z.gesamtKlicks >= 800000000 },
  { id: 'klick_21', name: 'Klick-Singularität',      beschreibung: '×100 Klick-Leistung',      preis: 5e12,       typ: 'klick_mult', wert: 100, bedingung: (z) => z.gesamtKlicks >= 2000000000 },
  { id: 'klick_22', name: 'Göttlicher Klick',        beschreibung: '×250 Klick-Leistung',      preis: 3e13,       typ: 'klick_mult', wert: 250, bedingung: (z) => z.gesamtKlicks >= 5000000000 },
];

// Globale PPS-Upgrades: mehr Stufen, glattere Preiskurve
const PPS_UPGRADES = [
  { id: 'pps_1',  name: 'Effizienz I',      beschreibung: '+2 Pixel/s global',     preis: 100,         typ: 'pps_add',  wert: 2,     bedingung: (z) => z.lifetimePixel >= 20 },
  { id: 'pps_2',  name: 'Effizienz II',     beschreibung: '+5 Pixel/s global',     preis: 500,         typ: 'pps_add',  wert: 5,     bedingung: (z) => z.lifetimePixel >= 150 },
  { id: 'pps_3',  name: 'Effizienz III',    beschreibung: '+10 Pixel/s global',    preis: 2000,        typ: 'pps_add',  wert: 10,    bedingung: (z) => z.lifetimePixel >= 800 },
  { id: 'pps_4',  name: 'Effizienz IV',     beschreibung: '+20 Pixel/s global',    preis: 8000,        typ: 'pps_add',  wert: 20,    bedingung: (z) => z.lifetimePixel >= 4000 },
  { id: 'pps_5',  name: 'Effizienz V',      beschreibung: '+40 Pixel/s global',    preis: 30000,       typ: 'pps_add',  wert: 40,    bedingung: (z) => z.lifetimePixel >= 20000 },
  { id: 'pps_6',  name: 'Effizienz VI',     beschreibung: '+80 Pixel/s global',    preis: 100000,      typ: 'pps_add',  wert: 80,    bedingung: (z) => z.lifetimePixel >= 80000 },
  { id: 'pps_7',  name: 'Effizienz VII',    beschreibung: '+150 Pixel/s global',   preis: 350000,      typ: 'pps_add',  wert: 150,   bedingung: (z) => z.lifetimePixel >= 300000 },
  { id: 'pps_8',  name: 'Effizienz VIII',   beschreibung: '+300 Pixel/s global',   preis: 1200000,     typ: 'pps_add',  wert: 300,   bedingung: (z) => z.lifetimePixel >= 1000000 },
  { id: 'pps_9',  name: 'Effizienz IX',     beschreibung: '+600 Pixel/s global',   preis: 4000000,     typ: 'pps_add',  wert: 600,   bedingung: (z) => z.lifetimePixel >= 4000000 },
  { id: 'pps_10', name: 'Effizienz X',      beschreibung: '+1.200 Pixel/s global', preis: 15000000,    typ: 'pps_add',  wert: 1200,  bedingung: (z) => z.lifetimePixel >= 15000000 },
  { id: 'pps_11', name: 'Effizienz XI',     beschreibung: '+2.500 Pixel/s global', preis: 50000000,    typ: 'pps_add',  wert: 2500,  bedingung: (z) => z.lifetimePixel >= 50000000 },
  { id: 'pps_12', name: 'Effizienz XII',    beschreibung: '+5.000 Pixel/s global', preis: 180000000,   typ: 'pps_add',  wert: 5000,  bedingung: (z) => z.lifetimePixel >= 180000000 },
  { id: 'pps_13', name: 'Effizienz XIII',   beschreibung: '+10K Pixel/s global',   preis: 600000000,   typ: 'pps_add',  wert: 10000, bedingung: (z) => z.lifetimePixel >= 600000000 },
  { id: 'pps_14', name: 'Effizienz XIV',    beschreibung: '+25K Pixel/s global',   preis: 2000000000,  typ: 'pps_add',  wert: 25000, bedingung: (z) => z.lifetimePixel >= 2000000000 },
  { id: 'pps_15', name: 'Produktion ×2',    beschreibung: '×2 globale PPS',        preis: 8000000000,  typ: 'pps_mult', wert: 2,     bedingung: (z) => z.lifetimePixel >= 8000000000 },
  { id: 'pps_16', name: 'Produktion ×3',    beschreibung: '×3 globale PPS',        preis: 4e10,        typ: 'pps_mult', wert: 3,     bedingung: (z) => z.lifetimePixel >= 4e10 },
  { id: 'pps_17', name: 'Produktion ×5',    beschreibung: '×5 globale PPS',        preis: 2e11,        typ: 'pps_mult', wert: 5,     bedingung: (z) => z.lifetimePixel >= 2e11 },
  { id: 'pps_18', name: 'Produktion ×10',   beschreibung: '×10 globale PPS',       preis: 1e12,        typ: 'pps_mult', wert: 10,    bedingung: (z) => z.lifetimePixel >= 1e12 },
  { id: 'pps_19', name: 'Produktion ×25',   beschreibung: '×25 globale PPS',       preis: 6e12,        typ: 'pps_mult', wert: 25,    bedingung: (z) => z.lifetimePixel >= 6e12 },
  { id: 'pps_20', name: 'Produktion ×100',  beschreibung: '×100 globale PPS',      preis: 5e13,        typ: 'pps_mult', wert: 100,   bedingung: (z) => z.lifetimePixel >= 5e13 },
];

// Automatisch 3 Upgrades pro Gebäude (nur die 10 Basis-Gebäude, nicht Prestige-exklusive)
const GEBAEUDE_UPGRADES = GEBAEUDE.filter(g => !g.minPrestige).flatMap(g => [
  {
    id: `${g.id}_up1`,
    name: `${g.name} Mk.II`,
    beschreibung: `${g.name} produzieren doppelt so viele Pixel`,
    preis: Math.ceil(g.basisPreis * 10),
    typ: 'gebaeude_mult', gebaeude: g.id, wert: 2,
    bedingung: (z) => (z.gebaeude[g.id] || 0) >= 10,
  },
  {
    id: `${g.id}_up2`,
    name: `${g.name} Mk.III`,
    beschreibung: `${g.name} produzieren nochmals doppelt so viele Pixel`,
    preis: Math.ceil(g.basisPreis * 50),
    typ: 'gebaeude_mult', gebaeude: g.id, wert: 2,
    bedingung: (z) => (z.gebaeude[g.id] || 0) >= 25,
  },
  {
    id: `${g.id}_up3`,
    name: `${g.name} Mk.IV`,
    beschreibung: `${g.name} produzieren dreimal so viele Pixel`,
    preis: Math.ceil(g.basisPreis * 200),
    typ: 'gebaeude_mult', gebaeude: g.id, wert: 3,
    bedingung: (z) => (z.gebaeude[g.id] || 0) >= 50,
  },
]);

// Offline-Speicher Upgrades (5 Stück)
const OFFLINE_UPGRADES = [
  { id: 'offline_1', name: 'Offline-Speicher I',   beschreibung: 'Offline-Produktion bis zu 2 Stunden',  preis: 5000,     typ: 'offline_stunden', stunden: 2,  bedingung: (z) => z.lifetimePixel >= 1000 },
  { id: 'offline_2', name: 'Offline-Speicher II',  beschreibung: 'Offline-Produktion bis zu 4 Stunden',  preis: 50000,    typ: 'offline_stunden', stunden: 4,  bedingung: (z) => z.lifetimePixel >= 25000 },
  { id: 'offline_3', name: 'Offline-Speicher III', beschreibung: 'Offline-Produktion bis zu 8 Stunden',  preis: 500000,   typ: 'offline_stunden', stunden: 8,  bedingung: (z) => z.lifetimePixel >= 500000 },
  { id: 'offline_4', name: 'Offline-Speicher IV',  beschreibung: 'Offline-Produktion bis zu 16 Stunden', preis: 5000000,  typ: 'offline_stunden', stunden: 16, bedingung: (z) => z.lifetimePixel >= 10000000 },
  { id: 'offline_5', name: 'Offline-Speicher V',   beschreibung: 'Offline-Produktion bis zu 24 Stunden', preis: 50000000, typ: 'offline_stunden', stunden: 24, bedingung: (z) => z.lifetimePixel >= 100000000 },
];

// Synergie-Upgrades (5 Stück)
const SYNERGIE_UPGRADES = [
  { id: 'syn_1', name: 'Fließband-Synergie',    beschreibung: 'Förderband erhält +1% PpS pro Einfache Maschine',    preis: 500000,     typ: 'synergie', von: 'maschine',   auf: 'foerderband',  faktor: 0.01, bedingung: (z) => (z.gebaeude.maschine || 0) >= 15 && (z.gebaeude.foerderband || 0) >= 15 },
  { id: 'syn_2', name: 'Labor-Synergie',         beschreibung: 'Pixel-Labor erhält +1% PpS pro Pixel-Drucker',       preis: 5000000,    typ: 'synergie', von: 'drucker',    auf: 'labor',        faktor: 0.01, bedingung: (z) => (z.gebaeude.drucker || 0) >= 15 && (z.gebaeude.labor || 0) >= 15 },
  { id: 'syn_3', name: 'Quanten-Synergie',       beschreibung: 'Quantencomputer erhält +1% PpS pro Pixel-Labor',     preis: 50000000,   typ: 'synergie', von: 'labor',      auf: 'quantencomp',  faktor: 0.01, bedingung: (z) => (z.gebaeude.labor || 0) >= 15 && (z.gebaeude.quantencomp || 0) >= 15 },
  { id: 'syn_4', name: 'Portal-Synergie',        beschreibung: 'Dimensionsportal erhält +1% PpS pro Reaktor',        preis: 500000000,  typ: 'synergie', von: 'reaktor',    auf: 'portal',       faktor: 0.01, bedingung: (z) => (z.gebaeude.reaktor || 0) >= 15 && (z.gebaeude.portal || 0) >= 15 },
  { id: 'syn_5', name: 'Zeitmaschinen-Synergie', beschreibung: 'Zeitmaschine erhält +1% PpS pro Pixel-Universum',    preis: 5000000000, typ: 'synergie', von: 'universum',  auf: 'zeitmaschine', faktor: 0.01, bedingung: (z) => (z.gebaeude.universum || 0) >= 15 && (z.gebaeude.zeitmaschine || 0) >= 15 },
];

// Alle normalen Upgrades zusammenführen
// Typ-Felder Referenz:
//   klick_add, klick_mult, gebaeude_mult  → wert (Zahl)
//   pps_add                               → wert (Zahl, globale additive PPS)
//   offline_stunden                        → stunden (Zahl, kein wert-Feld)
//   synergie                               → faktor (Zahl, kein wert-Feld)
const UPGRADES = [...KLICK_UPGRADES, ...PPS_UPGRADES, ...GEBAEUDE_UPGRADES, ...OFFLINE_UPGRADES, ...SYNERGIE_UPGRADES];

// === PRESTIGE-UPGRADES (mit Quantum-Pixel kaufbar) ===
// Kein 'bedingung'-Feld – sie sind immer sichtbar (nur QP-Preis entscheidet)
const PRESTIGE_UPGRADES = [
  // Globale Multiplikatoren (10 Stück)
  { id: 'qp_global_1',  name: 'Quanten-Fabrik I',    beschreibung: 'Alle Produktion ×1,5',   preisQP: 1,    typ: 'qp_global_mult', wert: 1.5  },
  { id: 'qp_global_2',  name: 'Quanten-Fabrik II',   beschreibung: 'Alle Produktion ×2',     preisQP: 3,    typ: 'qp_global_mult', wert: 2    },
  { id: 'qp_global_3',  name: 'Quanten-Fabrik III',  beschreibung: 'Alle Produktion ×3',     preisQP: 8,    typ: 'qp_global_mult', wert: 3    },
  { id: 'qp_global_4',  name: 'Quanten-Fabrik IV',   beschreibung: 'Alle Produktion ×5',     preisQP: 20,   typ: 'qp_global_mult', wert: 5    },
  { id: 'qp_global_5',  name: 'Quanten-Fabrik V',    beschreibung: 'Alle Produktion ×10',    preisQP: 50,   typ: 'qp_global_mult', wert: 10   },
  { id: 'qp_global_6',  name: 'Quanten-Fabrik VI',   beschreibung: 'Alle Produktion ×25',    preisQP: 100,  typ: 'qp_global_mult', wert: 25   },
  { id: 'qp_global_7',  name: 'Quanten-Fabrik VII',  beschreibung: 'Alle Produktion ×50',    preisQP: 200,  typ: 'qp_global_mult', wert: 50   },
  { id: 'qp_global_8',  name: 'Quanten-Fabrik VIII', beschreibung: 'Alle Produktion ×100',   preisQP: 500,  typ: 'qp_global_mult', wert: 100  },
  { id: 'qp_global_9',  name: 'Quanten-Fabrik IX',   beschreibung: 'Alle Produktion ×250',   preisQP: 1000, typ: 'qp_global_mult', wert: 250  },
  { id: 'qp_global_10', name: 'Quanten-Fabrik X',    beschreibung: 'Alle Produktion ×1000',  preisQP: 2500, typ: 'qp_global_mult', wert: 1000 },
  // Klick-Multiplikatoren (5 Stück)
  { id: 'qp_klick_1', name: 'Quanten-Klick I',   beschreibung: 'Klick-Leistung ×2',   preisQP: 2,   typ: 'qp_klick_mult', wert: 2   },
  { id: 'qp_klick_2', name: 'Quanten-Klick II',  beschreibung: 'Klick-Leistung ×5',   preisQP: 10,  typ: 'qp_klick_mult', wert: 5   },
  { id: 'qp_klick_3', name: 'Quanten-Klick III', beschreibung: 'Klick-Leistung ×20',  preisQP: 40,  typ: 'qp_klick_mult', wert: 20  },
  { id: 'qp_klick_4', name: 'Quanten-Klick IV',  beschreibung: 'Klick-Leistung ×100', preisQP: 150, typ: 'qp_klick_mult', wert: 100 },
  { id: 'qp_klick_5', name: 'Quanten-Klick V',   beschreibung: 'Klick-Leistung ×500', preisQP: 500, typ: 'qp_klick_mult', wert: 500 },
  // Goldene Pixel (3 Stück)
  { id: 'qp_golden_1', name: 'Goldene Augen I',   beschreibung: 'Goldene Pixel erscheinen 2× häufiger', preisQP: 5,  typ: 'qp_golden_freq',  wert: 2 },
  { id: 'qp_golden_2', name: 'Goldene Augen II',  beschreibung: 'Goldene Pixel geben 3× mehr Bonus',    preisQP: 15, typ: 'qp_golden_bonus', wert: 3 },
  { id: 'qp_golden_3', name: 'Goldene Augen III', beschreibung: 'Goldene Pixel erscheinen 5× häufiger', preisQP: 50, typ: 'qp_golden_freq',  wert: 5 },
  // Besondere (2 Stück)
  { id: 'qp_pps_base', name: 'Quanten-Effizienz', beschreibung: 'PpS ×5 als globaler Bonus',          preisQP: 30, typ: 'qp_global_mult',  wert: 5   },
  { id: 'qp_start',    name: 'Quantum-Start',      beschreibung: 'Starte nach Prestige mit 100 Pixel', preisQP: 25, typ: 'qp_start_bonus',  wert: 100 },
  // ✦ Meilenstein-Upgrades (jede 10. Prestige-Stufe)
  { id: 'ms_10', name: '✦ Meilenstein: Dekade I',    beschreibung: 'Alle Produktion ×8 (dauerhaft)',  preisQP: 8,   typ: 'qp_global_mult', wert: 8,   minPrestige: 10, meilenstein: true },
  { id: 'ms_20', name: '✦ Meilenstein: Dekade II',   beschreibung: 'Alle Produktion ×20 (dauerhaft)', preisQP: 25,  typ: 'qp_global_mult', wert: 20,  minPrestige: 20, meilenstein: true },
  { id: 'ms_30', name: '✦ Meilenstein: Dekade III',  beschreibung: 'Klick-Leistung ×500 (dauerhaft)', preisQP: 75,  typ: 'qp_klick_mult',  wert: 500, minPrestige: 30, meilenstein: true },
  { id: 'ms_40', name: '✦ Meilenstein: Dekade IV',   beschreibung: 'Alle Produktion ×75 (dauerhaft)', preisQP: 200, typ: 'qp_global_mult', wert: 75,  minPrestige: 40, meilenstein: true },
  { id: 'ms_50', name: '✦ Meilenstein: Dekade V',    beschreibung: 'Alle Produktion ×300 (dauerhaft)',preisQP: 500, typ: 'qp_global_mult', wert: 300, minPrestige: 50, meilenstein: true },
];

// === TALENTE ===
// Baumstruktur: col/row = Position im Talent-Baum, requires = Voraussetzung (ID)
// tal_root wird automatisch beim ersten Prestige freigeschaltet (kostet keinen Punkt)
const TALENTE = [
  // WURZEL (automatisch freigeschaltet beim ersten Prestige)
  { id: 'tal_root',          name: 'Fabrik-Lehrling',    beschr: 'Fundament aller Talente',                         maxLevel: 1, wert: 0,    typ: 'root',        col: 6,    row: 0, requires: null },

  // EBENE 1 – Kategorie-Wurzeln (alle brauchen tal_root)
  { id: 'tal_klick_speed',   name: 'Schnelle Finger',    beschr: '+25% Klick-Produktion pro Stufe',                 maxLevel: 5, wert: 0.25, typ: 'ppk_mult_add', col: 1.5,  row: 1, requires: 'tal_root' },
  { id: 'tal_prod_eff',      name: 'Fabrik-Effizienz',   beschr: '+10% PPS global pro Stufe',                       maxLevel: 5, wert: 0.10, typ: 'pps_mult_add', col: 4.0,  row: 1, requires: 'tal_root' },
  { id: 'tal_pre_qp',        name: 'QP-Bonus',           beschr: '+1 QP pro Prestige pro Stufe',                    maxLevel: 5, wert: 1,    typ: 'qp_bonus',     col: 6.0,  row: 1, requires: 'tal_root' },
  { id: 'tal_start_pixel',   name: 'Pixel-Magnet',       beschr: '+200 Startpixel nach Prestige/Stufe',             maxLevel: 5, wert: 200,  typ: 'start_pixel',  col: 8.5,  row: 1, requires: 'tal_root' },
  { id: 'tal_sp_pps_klick',  name: 'Synergieeffekt',     beschr: '+1% PPK basierend auf PPS/Stufe',                 maxLevel: 5, wert: 0.01, typ: 'pps_zu_ppk',  col: 11.5, row: 1, requires: 'tal_root' },

  // EBENE 2 – Zweige
  { id: 'tal_klick_krit',    name: 'Kritischer Treffer', beschr: '+5% Chance auf Krit-Klick pro Stufe',             maxLevel: 5, wert: 0.05, typ: 'krit_chance',  col: 1.0,  row: 2, requires: 'tal_klick_speed' },
  { id: 'tal_klick_pps',     name: 'Klick-Synergie',     beschr: 'Klicks geben +1% der PPS/Stufe extra',           maxLevel: 3, wert: 0.01, typ: 'klick_pps',    col: 2.0,  row: 2, requires: 'tal_klick_speed' },
  { id: 'tal_prod_rabatt',   name: 'Gebäude-Rabatt',     beschr: 'Gebäude 8% günstiger pro Stufe',                  maxLevel: 3, wert: 0.08, typ: 'gebaeude_rab', col: 3.5,  row: 2, requires: 'tal_prod_eff' },
  { id: 'tal_prod_gold',     name: 'Goldener Sinn',      beschr: 'Goldene Pixel 2× häufiger/Stufe',                 maxLevel: 3, wert: 2,    typ: 'golden_freq',  col: 4.5,  row: 2, requires: 'tal_prod_eff' },
  { id: 'tal_pre_mult',      name: 'Prestige-Kraft',     beschr: 'Prestige-Multiplikator ×1,3/Stufe',               maxLevel: 3, wert: 1.30, typ: 'pre_mult',     col: 5.5,  row: 2, requires: 'tal_pre_qp' },
  { id: 'tal_pre_schwelle',  name: 'Frühes Prestige',    beschr: 'Prestige-Schwelle −10% pro Stufe',                maxLevel: 3, wert: 0.10, typ: 'pre_schwelle', col: 6.5,  row: 2, requires: 'tal_pre_qp' },
  { id: 'tal_start_geb',     name: 'Schnellstart',       beschr: '+2 Einfache Maschinen zu Beginn/Stufe',           maxLevel: 3, wert: 2,    typ: 'start_geb',    col: 8.0,  row: 2, requires: 'tal_start_pixel' },
  { id: 'tal_start_upg',     name: 'Vorbereitung',       beschr: 'Erstes Klick-Upgrade gratis',                     maxLevel: 1, wert: 1,    typ: 'start_upg',    col: 9.0,  row: 2, requires: 'tal_start_pixel' },
  { id: 'tal_sp_golden',     name: 'Goldgier',           beschr: 'Goldene Pixel +50% Bonus/Stufe',                  maxLevel: 3, wert: 0.50, typ: 'golden_bonus', col: 11.0, row: 2, requires: 'tal_sp_pps_klick' },
  { id: 'tal_sp_err',        name: 'Ehrgeiz',            beschr: '+0,5% PPS pro Errungenschaft',                    maxLevel: 1, wert: 0.005,typ: 'err_bonus',    col: 12.0, row: 2, requires: 'tal_sp_pps_klick' },

  // EBENE 3 – Blätter
  { id: 'tal_klick_kombo',   name: 'Kombomeister',       beschr: 'Kombo verfällt 30% langsamer/Stufe',              maxLevel: 3, wert: 0.30, typ: 'kombo_dauer',  col: 0.5,  row: 3, requires: 'tal_klick_krit' },
  { id: 'tal_klick_krit_mult',name:'Krit. Multiplikator',beschr: 'Krit-Klick gibt ×0,5 mehr/Stufe (Standard ×3)',  maxLevel: 4, wert: 0.5,  typ: 'krit_mult',    col: 1.5,  row: 3, requires: 'tal_klick_krit' },
  { id: 'tal_sp_alle_geb',   name: 'Generalfabrik',      beschr: 'Alle Gebäude ×1,1 effektiver/Stufe',              maxLevel: 3, wert: 1.10, typ: 'alle_geb_mult',col: 3.5,  row: 3, requires: 'tal_prod_rabatt' },
  { id: 'tal_prod_offline',  name: 'Nachtschicht',       beschr: 'Offline-Zeit ×2 pro Stufe',                       maxLevel: 2, wert: 2,    typ: 'offline_mult', col: 4.5,  row: 3, requires: 'tal_prod_gold' },
  { id: 'tal_pre_upgrade',   name: 'Upgrade-Kenner',     beschr: 'Upgrades 10% günstiger pro Stufe',                maxLevel: 2, wert: 0.10, typ: 'upgrade_rab',  col: 6.5,  row: 3, requires: 'tal_pre_schwelle' },
  { id: 'tal_start_kombo',   name: 'Kombo-Start',        beschr: 'Starte mit ×2-Kombo aktiv',                       maxLevel: 1, wert: 1,    typ: 'start_kombo',  col: 9.0,  row: 3, requires: 'tal_start_upg' },
];

// === SKINS ===
// Jeder Skin hat farben (Canvas-Pixel), theme (CSS-Variablen), canvasBg (Canvas-Hintergrund)
const SKIN_DEFAULTS = {
  '--bg': '#f0f7ff', '--surface': '#ffffff', '--primary': '#3a86ff',
  '--primary-dark': '#2563eb', '--amber': '#f59e0b', '--amber-dark': '#d97706',
  '--amber-light': '#fef3c7', '--emerald': '#10b981', '--emerald-light': '#d1fae5',
  '--prestige': '#8b5cf6', '--prestige-dark': '#7c3aed', '--prestige-light': '#ede9fe',
  '--border': '#dde6f5', '--text': '#1e293b', '--text-muted': '#64748b',
};

const SKINS = [
  // ORIGINALE SKINS
  { id: 'standard',     name: 'Standard',       minPrestige: 0,
    farben: ['#cbd5e1','#94a3b8','#64748b','#e2e8f0'],
    canvasBg: 'linear-gradient(145deg, #f8faff 0%, #eef2ff 100%)' },

  { id: 'blau',         name: 'Blau',            minPrestige: 1,
    farben: ['#60a5fa','#3b82f6','#2563eb','#bfdbfe'],
    canvasBg: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
    theme: { '--primary': '#2563eb', '--primary-dark': '#1d4ed8', '--bg': '#eff6ff', '--border': '#bfdbfe' } },

  { id: 'gruen',        name: 'Grün',             minPrestige: 3,
    farben: ['#34d399','#10b981','#059669','#a7f3d0'],
    canvasBg: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
    theme: { '--primary': '#10b981', '--primary-dark': '#059669', '--bg': '#f0fdf4', '--border': '#a7f3d0', '--text-muted': '#4b7c68' } },

  { id: 'lila',         name: 'Lila ✦',          minPrestige: 5,  glitzer: true,
    farben: ['#a78bfa','#8b5cf6','#7c3aed','#ede9fe'],
    canvasBg: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)',
    theme: { '--primary': '#8b5cf6', '--primary-dark': '#7c3aed', '--bg': '#f5f3ff', '--border': '#ddd6fe', '--text-muted': '#6b5b8a' } },

  { id: 'gold',         name: 'Gold ✦',          minPrestige: 10, glitzer: true,
    farben: ['#fbbf24','#f59e0b','#d97706','#fef3c7'],
    canvasBg: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
    theme: { '--primary': '#d97706', '--primary-dark': '#b45309', '--bg': '#fffbeb', '--border': '#fde68a', '--text-muted': '#78610a' } },

  { id: 'regenbogen',   name: 'Regenbogen',       minPrestige: 15, animiert: true,
    farben: ['#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa'],
    canvasBg: 'linear-gradient(145deg, #fff1f2 0%, #fdf4ff 100%)',
    bodyClass: 'skin-regenbogen' },

  { id: 'kristall',     name: 'Kristall',          minPrestige: 20, kristall: true,
    farben: ['rgba(148,163,184,0.6)','rgba(203,213,225,0.8)','rgba(226,232,240,0.9)','rgba(241,245,249,0.7)'],
    canvasBg: 'linear-gradient(145deg, rgba(241,245,249,0.95) 0%, rgba(226,232,240,0.98) 100%)',
    theme: { '--bg': '#f8fafc', '--border': '#e2e8f0', '--primary': '#64748b' } },

  { id: 'plasma',       name: 'Plasma ✦',         minPrestige: 25, pulsierend: true, glitzer: true,
    farben: ['#f0abfc','#e879f9','#d946ef','#a21caf'],
    canvasBg: 'linear-gradient(145deg, #fdf4ff 0%, #fae8ff 100%)',
    bodyClass: 'skin-plasma',
    theme: { '--primary': '#d946ef', '--primary-dark': '#a21caf', '--bg': '#fdf4ff', '--border': '#f5d0fe', '--prestige': '#a21caf', '--text-muted': '#7e3a8a' } },

  // NEUE THEME-SKINS
  { id: 'wald',         name: 'Wald',             minPrestige: 6,
    farben: ['#4ade80','#22c55e','#15803d','#86efac','#713f12'],
    canvasBg: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
    bgAnim: bgAnimWald,
    theme: { '--primary': '#16a34a', '--primary-dark': '#15803d', '--bg': '#f0fdf4', '--surface': '#ffffff',
             '--border': '#bbf7d0', '--text-muted': '#3f6b4a', '--amber': '#a16207', '--amber-dark': '#854d0e' } },

  { id: 'ozean',        name: 'Ozean',            minPrestige: 8,
    farben: ['#22d3ee','#06b6d4','#0891b2','#a5f3fc','#164e63'],
    canvasBg: 'linear-gradient(145deg, #ecfeff 0%, #cffafe 100%)',
    bodyClass: 'skin-ozean', bgAnim: bgAnimOzean,
    theme: { '--primary': '#0891b2', '--primary-dark': '#0e7490', '--bg': '#ecfeff', '--surface': '#f0ffff',
             '--border': '#a5f3fc', '--text-muted': '#164e63' } },

  { id: 'wueste',       name: 'Wüste',            minPrestige: 12,
    farben: ['#fb923c','#f97316','#ea580c','#fed7aa','#c2410c'],
    canvasBg: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)',
    bgAnim: bgAnimWueste,
    theme: { '--primary': '#ea580c', '--primary-dark': '#c2410c', '--bg': '#fff7ed', '--surface': '#fffbf5',
             '--border': '#fed7aa', '--text-muted': '#7c2d12', '--amber': '#ea580c', '--amber-dark': '#c2410c',
             '--amber-light': '#ffedd5' } },

  { id: 'winter',       name: 'Winter',           minPrestige: 14, kristall: true,
    farben: ['#7dd3fc','#38bdf8','#0ea5e9','#e0f2fe','#bfdbfe'],
    canvasBg: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
    bodyClass: 'skin-winter', bgAnim: bgAnimWinter,
    theme: { '--primary': '#0ea5e9', '--primary-dark': '#0284c7', '--bg': '#f0f9ff', '--surface': '#f8fafc',
             '--border': '#bae6fd', '--text-muted': '#1e4c6b' } },

  { id: 'sonnenschein', name: 'Sonnenschein',     minPrestige: 18, glitzer: true,
    farben: ['#fde047','#facc15','#eab308','#fef9c3','#ca8a04'],
    canvasBg: 'linear-gradient(145deg, #1a0800 0%, #2d1200 100%)',
    bodyClass: 'skin-sonnenschein', bgAnim: bgAnimSonnenschein,
    theme: { '--primary': '#ca8a04', '--primary-dark': '#a16207', '--bg': '#fefce8', '--surface': '#fffdf0',
             '--border': '#fde68a', '--text-muted': '#713f12', '--amber': '#ca8a04', '--amber-dark': '#a16207' } },

  { id: 'kirschbluete', name: 'Kirschblüte ✦',  minPrestige: 22, glitzer: true,
    farben: ['#f9a8d4','#f472b6','#ec4899','#fce7f3','#db2777'],
    canvasBg: 'linear-gradient(145deg, #fdf2f8 0%, #fce7f3 100%)',
    bgAnim: bgAnimKirschbluete,
    theme: { '--primary': '#ec4899', '--primary-dark': '#db2777', '--bg': '#fdf2f8', '--surface': '#fff9fb',
             '--border': '#fbcfe8', '--text-muted': '#831843', '--prestige': '#db2777', '--prestige-dark': '#be185d' } },

  { id: 'retro',        name: 'Retro',            minPrestige: 28,
    farben: ['#e879f9','#a21caf','#06b6d4','#c084fc','#0891b2'],
    canvasBg: 'linear-gradient(145deg, #1a0a2e 0%, #0d0818 100%)',
    bodyClass: 'skin-retro', bgAnim: bgAnimRetro,
    theme: { '--primary': '#9333ea', '--primary-dark': '#7e22ce', '--bg': '#fdf4ff', '--surface': '#fef9ff',
             '--border': '#e9d5ff', '--text-muted': '#6b21a8', '--radius': '4px', '--radius-sm': '2px' } },

  { id: 'herbst',       name: 'Herbst',           minPrestige: 35,
    farben: ['#ef4444','#f97316','#b45309','#fbbf24','#991b1b'],
    canvasBg: 'linear-gradient(145deg, #1a0a04 0%, #2d1205 100%)',
    bgAnim: bgAnimHerbst,
    theme: { '--primary': '#c2410c', '--primary-dark': '#9a3412', '--bg': '#fff7f0', '--surface': '#fffcf7',
             '--border': '#fcd34d', '--text-muted': '#7c2d12' } },

  { id: 'maerchen',     name: 'Märchen ✦',        minPrestige: 38, animiert: true,
    farben: ['#f9a8d4','#c4b5fd','#86efac','#fde68a','#67e8f9'],
    canvasBg: 'linear-gradient(145deg, #fdf4ff 0%, #f0f9ff 100%)',
    bgAnim: bgAnimMaerchen,
    theme: { '--primary': '#9333ea', '--primary-dark': '#7e22ce', '--bg': '#fdf8ff', '--surface': '#fefcff',
             '--border': '#e9d5ff', '--text-muted': '#6b21a8' } },

  { id: 'weltraum',     name: 'Weltraum ✦',       minPrestige: 42, pulsierend: true, glitzer: true,
    farben: ['#818cf8','#6366f1','#4f46e5','#c7d2fe','#a5b4fc'],
    canvasBg: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #1a0533 100%)',
    bodyClass: 'skin-weltraum', bgAnim: bgAnimWeltraum,
    theme: { '--primary': '#4f46e5', '--primary-dark': '#4338ca', '--bg': '#eef2ff', '--surface': '#f5f3ff',
             '--border': '#c7d2fe', '--text-muted': '#312e81', '--prestige': '#4f46e5' } },

  { id: 'glitzergold',  name: 'Glitter-Gold ✦✦', minPrestige: 50, glitzer: true, animiert: true,
    farben: ['#fbbf24','#f59e0b','#ffffff','#fef3c7','#d97706'],
    canvasBg: 'linear-gradient(145deg, #1c1408 0%, #2a1d00 100%)',
    bgAnim: bgAnimGlitzergold,
    theme: { '--primary': '#b45309', '--primary-dark': '#92400e', '--bg': '#fffbeb', '--surface': '#fffef5',
             '--border': '#fde68a', '--text-muted': '#78350f', '--amber': '#b45309' } },

  { id: 'midnight',     name: 'Midnight Drive',  minPrestige: 55, animiert: true,
    farben: ['#e879f9','#a21caf','#06b6d4','#1e1b4b','#0891b2'],
    canvasBg: 'linear-gradient(145deg, #0f0a1e 0%, #1a1035 100%)',
    bodyClass: 'skin-midnight', bgAnim: bgAnimMidnight,
    theme: { '--primary': '#7c3aed', '--primary-dark': '#6d28d9', '--bg': '#f5f3ff', '--surface': '#fefcff',
             '--border': '#ddd6fe', '--text-muted': '#4c1d95' } },

  { id: 'darkcity',     name: 'Dark City',        minPrestige: 60,
    farben: ['#475569','#334155','#1e293b','#94a3b8','#64748b'],
    canvasBg: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
    bodyClass: 'skin-darkcity', bgAnim: bgAnimDarkCity,
    theme: { '--primary': '#475569', '--primary-dark': '#334155', '--bg': '#f8fafc', '--surface': '#ffffff',
             '--border': '#e2e8f0', '--text-muted': '#1e293b' } },

  { id: 'chrome',       name: 'Chrome ✦',         minPrestige: 65, glitzer: true,
    farben: ['#e2e8f0','#94a3b8','#475569','#f1f5f9','#cbd5e1'],
    canvasBg: 'linear-gradient(145deg, #0f172a 0%, #0a0a0a 100%)',
    bodyClass: 'skin-chrome', bgAnim: bgAnimChrome,
    theme: { '--primary': '#475569', '--primary-dark': '#1e293b', '--bg': '#f8fafc', '--surface': '#ffffff',
             '--border': '#e2e8f0', '--text-muted': '#334155' } },
];

// === ERRUNGENSCHAFTEN ===
const ERRUNGENSCHAFTEN = [
  // Pixel-Meilensteine (8)
  { id: 'px_100',    name: 'Erste Schritte',    icon: '🔹', text: '100 Lifetime-Pixel produziert',        pruefe: (z) => z.lifetimePixel >= 100 },
  { id: 'px_1k',     name: 'Pixel-Starter',      icon: '⬛', text: '1.000 Lifetime-Pixel produziert',      pruefe: (z) => z.lifetimePixel >= 1000 },
  { id: 'px_10k',    name: 'Pixel-Sammler',       icon: '🟦', text: '10.000 Lifetime-Pixel produziert',     pruefe: (z) => z.lifetimePixel >= 10000 },
  { id: 'px_100k',   name: 'Pixel-Enthusiast',    icon: '💎', text: '100.000 Lifetime-Pixel produziert',    pruefe: (z) => z.lifetimePixel >= 100000 },
  { id: 'px_1m',     name: 'Pixel-Millionär',     icon: '🏭', text: '1 Million Pixel produziert',           pruefe: (z) => z.lifetimePixel >= 1000000 },
  { id: 'px_1b',     name: 'Pixel-Magnat',        icon: '🌐', text: '1 Milliarde Pixel produziert',         pruefe: (z) => z.lifetimePixel >= 1000000000 },
  { id: 'px_1t',     name: 'Pixel-Kaiser',        icon: '🌌', text: '1 Billion Pixel produziert',           pruefe: (z) => z.lifetimePixel >= 1e12 },
  { id: 'px_1qd',    name: 'Pixel-Gott',          icon: '✨', text: '1 Quadrillion Pixel produziert',       pruefe: (z) => z.lifetimePixel >= 1e15 },
  // Gebäude-Meilensteine (6)
  { id: 'geb_erst',  name: 'Erste Fabrik',        icon: '⚙️', text: 'Erstes Gebäude gekauft',               pruefe: (z) => Object.values(z.gebaeude).some(n => n >= 1) },
  { id: 'geb_10',    name: 'Kleine Fabrik',        icon: '🏗️', text: '10 Gebäude gekauft',                   pruefe: (z) => gesamtGebaeude(z) >= 10 },
  { id: 'geb_50',    name: 'Mittlere Fabrik',      icon: '🏭', text: '50 Gebäude gekauft',                   pruefe: (z) => gesamtGebaeude(z) >= 50 },
  { id: 'geb_100',   name: 'Großfabrik',           icon: '🌆', text: '100 Gebäude gekauft',                  pruefe: (z) => gesamtGebaeude(z) >= 100 },
  { id: 'geb_alle',  name: 'Sammler',              icon: '🎯', text: 'Alle Basis-Gebäudetypen besitzen',     pruefe: (z) => GEBAEUDE.filter(g => !g.minPrestige).every(g => (z.gebaeude[g.id] || 0) >= 1) },
  { id: 'geb_250',   name: 'Mega-Fabrik',          icon: '🌇', text: '250 Gebäude insgesamt',                pruefe: (z) => gesamtGebaeude(z) >= 250 },
  // Prestige-Meilensteine (5)
  { id: 'pre_1',     name: 'Neustart',             icon: '♻️', text: 'Erstes Prestige gemacht',              pruefe: (z) => z.prestige >= 1 },
  { id: 'pre_5',     name: 'Serienrestart',         icon: '🔄', text: '5× Prestige gemacht',                  pruefe: (z) => z.prestige >= 5 },
  { id: 'pre_10',    name: 'Prestige-Meister',      icon: '🏅', text: '10× Prestige gemacht',                 pruefe: (z) => z.prestige >= 10 },
  { id: 'pre_25',    name: 'Prestige-Legende',      icon: '🥇', text: '25× Prestige gemacht',                 pruefe: (z) => z.prestige >= 25 },
  { id: 'pre_50',    name: 'Prestige-Gott',         icon: '👑', text: '50× Prestige gemacht',                 pruefe: (z) => z.prestige >= 50 },
  // Klick-Meilensteine (4)
  { id: 'kl_100',    name: 'Klick-Starter',         icon: '👆', text: '100 Mal geklickt',                     pruefe: (z) => z.gesamtKlicks >= 100 },
  { id: 'kl_1k',     name: 'Klick-Sammler',         icon: '✌️', text: '1.000 Mal geklickt',                   pruefe: (z) => z.gesamtKlicks >= 1000 },
  { id: 'kl_10k',    name: 'Klick-Profi',           icon: '🖐️', text: '10.000 Mal geklickt',                  pruefe: (z) => z.gesamtKlicks >= 10000 },
  { id: 'kl_100k',   name: 'Klick-Legende',         icon: '💪', text: '100.000 Mal geklickt',                 pruefe: (z) => z.gesamtKlicks >= 100000 },
  // Goldene Pixel (3)
  { id: 'gld_1',     name: 'Goldfieber',            icon: '⭐', text: 'Ersten goldenen Pixel angeklickt',     pruefe: (z) => z.goldenPixelKlicks >= 1 },
  { id: 'gld_10',    name: 'Goldsucher',            icon: '🌟', text: '10 goldene Pixel angeklickt',          pruefe: (z) => z.goldenPixelKlicks >= 10 },
  { id: 'gld_100',   name: 'Goldmeister',           icon: '💫', text: '100 goldene Pixel angeklickt',         pruefe: (z) => z.goldenPixelKlicks >= 100 },
  // Skins (2)
  { id: 'skin_1',    name: 'Modebewusst',           icon: '🎨', text: 'Ersten Skin freigeschaltet',           pruefe: (z) => (z.skins?.freigeschaltet?.length || 0) >= 2 },
  { id: 'skin_alle', name: 'Skin-Sammler',          icon: '🌈', text: 'Alle Skins freigeschaltet',            pruefe: (z) => (z.skins?.freigeschaltet?.length || 0) >= SKINS.length },
  // Sonstiges (3)
  { id: 'offline',   name: 'Fleißige Fabrik',       icon: '💤', text: 'Offline-Bonus erhalten',               pruefe: (z) => z._offlineBonusErhalten },
  { id: 'speedrun',  name: 'Speedrunner',           icon: '⚡', text: '1.000 Pixel in unter 60 Sekunden',     pruefe: (z) => z._speedrunOk },
  { id: 'reich',     name: 'Wohlstand',             icon: '💰', text: '1.000 Quantum-Pixel gesammelt (gesamt)', pruefe: (z) => z._gesamtQP >= 1000 },

  // PPS-Meilensteine (8)
  { id: 'pps_01',   name: 'Erste Automatisierung', icon: '⚙️', text: '0,1 Pixel/s erreicht',          pruefe: (z) => (z._maxPPS||0) >= 0.1 },
  { id: 'pps_1',    name: 'Fabrikant',             icon: '🏭', text: '1 Pixel/s erreicht',            pruefe: (z) => (z._maxPPS||0) >= 1 },
  { id: 'pps_10',   name: 'Fließbandmeister',      icon: '🔧', text: '10 Pixel/s erreicht',           pruefe: (z) => (z._maxPPS||0) >= 10 },
  { id: 'pps_100',  name: 'Pixel-Ingenieur',       icon: '🛠️', text: '100 Pixel/s erreicht',          pruefe: (z) => (z._maxPPS||0) >= 100 },
  { id: 'pps_1k',   name: 'Industrie-König',       icon: '👑', text: '1.000 Pixel/s erreicht',        pruefe: (z) => (z._maxPPS||0) >= 1000 },
  { id: 'pps_10k',  name: 'Pixel-Imperium',        icon: '🌐', text: '10.000 Pixel/s erreicht',       pruefe: (z) => (z._maxPPS||0) >= 10000 },
  { id: 'pps_1m',   name: 'Unstoppbar',            icon: '🌌', text: '1 Million Pixel/s erreicht',    pruefe: (z) => (z._maxPPS||0) >= 1000000 },
  { id: 'pps_1b',   name: 'Gottgleich',            icon: '✨', text: '1 Milliarde Pixel/s erreicht',  pruefe: (z) => (z._maxPPS||0) >= 1000000000 },

  // Mehr Klick-Meilensteine (2)
  { id: 'kl_1m',    name: 'Klick-Maschine',        icon: '🤖', text: '1 Million Mal geklickt',        pruefe: (z) => z.gesamtKlicks >= 1000000 },
  { id: 'kl_10m',   name: 'Klick-Gott',            icon: '🌩️', text: '10 Millionen Mal geklickt',     pruefe: (z) => z.gesamtKlicks >= 10000000 },

  // Mehr Gebäude-Meilensteine (5)
  { id: 'geb_500',  name: 'Fabrik-Imperium',       icon: '🏙️', text: '500 Gebäude insgesamt',         pruefe: (z) => gesamtGebaeude(z) >= 500 },
  { id: 'geb_1k',   name: 'Mega-Konzern',          icon: '🌆', text: '1.000 Gebäude insgesamt',       pruefe: (z) => gesamtGebaeude(z) >= 1000 },
  { id: 'geb_10e',  name: 'Serie I',               icon: '🔢', text: '10× eines Gebäudetyps',         pruefe: (z) => Object.values(z.gebaeude).some(n => n >= 10) },
  { id: 'geb_100e', name: 'Serie II',              icon: '💯', text: '100× eines Gebäudetyps',        pruefe: (z) => Object.values(z.gebaeude).some(n => n >= 100) },
  { id: 'geb_200e', name: 'Serie III',             icon: '🌟', text: '200× eines Gebäudetyps',        pruefe: (z) => Object.values(z.gebaeude).some(n => n >= 200) },

  // Mehr Prestige (2)
  { id: 'pre_75',   name: 'Prestige-Unsterblich',  icon: '♾️', text: '75× Prestige gemacht',          pruefe: (z) => z.prestige >= 75 },
  { id: 'pre_100',  name: 'Prestige-Leere',        icon: '🌀', text: '100× Prestige gemacht',         pruefe: (z) => z.prestige >= 100 },

  // Upgrade-Meilensteine (4)
  { id: 'upg_1',    name: 'Aufgerüstet',           icon: '🔩', text: 'Erstes Upgrade gekauft',        pruefe: (z) => (z.upgrades||[]).length >= 1 },
  { id: 'upg_10',   name: 'Upgrade-Sammler',       icon: '🛠️', text: '10 Upgrades gekauft',           pruefe: (z) => (z.upgrades||[]).length >= 10 },
  { id: 'upg_25',   name: 'Upgrade-Experte',       icon: '⚙️', text: '25 Upgrades gekauft',           pruefe: (z) => (z.upgrades||[]).length >= 25 },
  { id: 'upg_50',   name: 'Upgrade-Meister',       icon: '🏅', text: '50 Upgrades gekauft',           pruefe: (z) => (z.upgrades||[]).length >= 50 },

  // QP-Meilensteine (4)
  { id: 'qp_10',    name: 'Quanten-Einsteiger',    icon: '⬡',  text: '10 QP gesammelt (gesamt)',      pruefe: (z) => (z._gesamtQP||0) >= 10 },
  { id: 'qp_100',   name: 'Quanten-Forscher',      icon: '🔬', text: '100 QP gesammelt (gesamt)',     pruefe: (z) => (z._gesamtQP||0) >= 100 },
  { id: 'qp_500',   name: 'Quanten-Meister',       icon: '💎', text: '500 QP gesammelt (gesamt)',     pruefe: (z) => (z._gesamtQP||0) >= 500 },
  { id: 'qp_5k',    name: 'Quanten-Kaiser',        icon: '✦',  text: '5.000 QP gesammelt (gesamt)',   pruefe: (z) => (z._gesamtQP||0) >= 5000 },

  // Kombo-Errungenschaften (2)
  { id: 'kombo_x2', name: 'Kombo!',                icon: '🔥', text: '×2-Kombo-Multiplikator erreicht', pruefe: (z) => z._komboReached2 },
  { id: 'kombo_x3', name: 'Mega-Kombo',            icon: '💥', text: '×3-Kombo-Multiplikator erreicht', pruefe: (z) => z._komboReached3 },

  // Talent-Errungenschaften
  { id: 'tal_erst', name: 'Talentiert',             icon: '⭐', text: 'Erstes Talent freigeschaltet',  pruefe: (z) => Object.values(z.talente || {}).some(v => v >= 1) },
  { id: 'tal_voll', name: 'Voll aufgeladen',        icon: '🌟', text: '5 verschiedene Talente gekauft', pruefe: (z) => Object.keys(z.talente || {}).length >= 5 },

  // Mehr Pixel-Meilensteine (3)
  { id: 'px_100t',  name: 'Pixel-Titan',           icon: '🌟', text: '100 Billionen Pixel produziert', pruefe: (z) => z.lifetimePixel >= 1e14 },
  { id: 'px_1pq',   name: 'Pixel-Übermensch',      icon: '🌀', text: '1 Quintillion Pixel produziert', pruefe: (z) => z.lifetimePixel >= 1e18 },
  { id: 'px_1oc',   name: 'Pixel-Schöpfer',        icon: '∞',  text: '1 Oktillion Pixel produziert',   pruefe: (z) => z.lifetimePixel >= 1e27 },

  // Goldene Pixel (1 mehr)
  { id: 'gld_1k',   name: 'Goldmeister Pro',       icon: '🌠', text: '1.000 goldene Pixel angeklickt', pruefe: (z) => (z.goldenPixelKlicks||0) >= 1000 },
];

// ╔══════════════════════════════════════════════════════════╗
// ║  TUTORIAL                                               ║
// ╚══════════════════════════════════════════════════════════╝

const TUTORIAL_SCHRITTE = [
  {
    icon:  '🏭',
    titel: 'Willkommen!',
    text:  'Klicke auf den <strong>Pixel-Haufen</strong> in der Mitte, um Pixel zu produzieren!',
  },
  {
    icon:  '🏗',
    titel: 'Gebäude kaufen',
    text:  'Mit Pixeln kannst du im <strong>Shop rechts</strong> Gebäude kaufen, die automatisch Pixel produzieren.',
  },
  {
    icon:  '✦',
    titel: 'Prestige',
    text:  'Wenn du genug Pixel hast, mache <strong>Prestige</strong> für Quantum-Pixel – damit kaufst du dauerhafte Upgrades!',
  },
  {
    icon:  '🎯',
    titel: "Los geht's!",
    text:  "Das war's! Baue die größte Pixel-Fabrik der Welt. <em>Viel Erfolg!</em>",
  },
];

let tutorialSchritt = 0;

function tutorialZeigen() {
  const overlay = document.getElementById('tutorialOverlay');
  if (!overlay) return;
  // Nicht zeigen wenn bereits gesehen ODER Spieler hat schon Fortschritt (altes Savegame ohne _tutorialGesehen)
  if (zustand._tutorialGesehen || zustand.lifetimePixel > 0 || zustand.prestige > 0 || zustand.gesamtKlicks > 0) return;
  tutorialSchritt = 0;
  tutorialSchrittRendern();
  overlay.classList.remove('versteckt');
}

function tutorialSchrittRendern() {
  const s = TUTORIAL_SCHRITTE[tutorialSchritt];
  document.getElementById('tutorialIcon').textContent  = s.icon;
  document.getElementById('tutorialTitel').textContent = s.titel;
  document.getElementById('tutorialText').innerHTML    = s.text;

  document.querySelectorAll('.tut-punkt').forEach((p, i) => {
    p.classList.toggle('aktiv', i === tutorialSchritt);
  });

  const isLast = tutorialSchritt === TUTORIAL_SCHRITTE.length - 1;
  document.getElementById('tutWeiter').textContent = isLast ? 'Spielen! 🎮' : 'Weiter →';
}

function tutorialSchliessen() {
  zustand._tutorialGesehen = true;
  document.getElementById('tutorialOverlay').classList.add('versteckt');
}

// Hilfsfunktion: Gesamtgebäude zählen
function gesamtGebaeude(z) {
  return Object.values(z.gebaeude).reduce((s, n) => s + n, 0);
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SPIELZUSTAND                                           ║
// ╚══════════════════════════════════════════════════════════╝

// Standard-Zustand (wird beim ersten Start verwendet)
function standardZustand() {
  return {
    pixel: 0,
    lifetimePixel: 0,
    quantumPixel: 0,
    prestige: 0,
    gesamtKlicks: 0,
    goldenPixelKlicks: 0,
    letzterBesuch: Date.now(),
    maxOfflineStunden: 1,
    gebaeude: Object.fromEntries(GEBAEUDE.map(g => [g.id, 0])),
    upgrades: [],
    prestigeUpgrades: [],
    skins: { freigeschaltet: ['standard'], aktiv: 'standard' },
    errungenschaften: [],
    _offlineBonusErhalten: false,
    _speedrunOk: false,
    _speedrunStart: Date.now(),
    _gesamtQP: 0,
    _tutorialGesehen: false,
    _maxPPS: 0,
    _komboReached2: false,
    _komboReached3: false,
    talentPunkte: 0,
    talente: {},
  };
}

let zustand = standardZustand();

// Abgeleitete Stats (werden laufend neu berechnet)
let berechneteStats = { pps: 0, ppk: 1 };

let bulkMenge = 1; // 0 = Max

// Kombo-Klick-Multiplikator
let komboTimer = 0;       // Sekunden durchgehend geklickt
let komboLetzterKlick = 0; // Timestamp des letzten Klicks
const KOMBO_TIMEOUT_MS = 2000; // Pause > 2s bricht Kombo ab

function komboMultiplikator() {
  if (komboTimer >= 30) return 3;
  if (komboTimer >= 6) return 2;
  return 1;
}

function gebaeudeGesamtPreis(g, menge) {
  const anzahl = zustand.gebaeude[g.id] || 0;
  let total = 0;
  for (let i = 0; i < menge; i++) {
    total += gebaeudePreis(g, anzahl + i);
  }
  return total;
}

function gebaeudeMaxMenge(g) {
  let n = 0;
  let tempPixel = zustand.pixel;
  let tempAnzahl = zustand.gebaeude[g.id] || 0;
  while (n < 10000) { // Sicherheitsgrenze gegen Endlosschleife
    const p = gebaeudePreis(g, tempAnzahl + n);
    if (p <= 0 || tempPixel < p) break;
    tempPixel -= p;
    n++;
  }
  return n;
}


// === ZAHLENFORMATIERUNG ===
const EINHEITEN = ['', 'K', 'M', 'B', 'T', 'Qd', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  if (n > 0 && n < 1) return n.toFixed(1).replace('.', ',');
  if (n < 1000) return Math.floor(n).toString();
  const exp = Math.min(Math.floor(Math.log10(n) / 3), EINHEITEN.length - 1);
  const wert = n / Math.pow(1000, exp);
  const nachkomma = wert >= 100 ? 0 : wert >= 10 ? 1 : 2;
  return wert.toFixed(nachkomma).replace('.', ',') + EINHEITEN[exp];
}

// ╔══════════════════════════════════════════════════════════╗
// ║  BERECHNUNGEN                                           ║
// ╚══════════════════════════════════════════════════════════╝

function berechnePrestigeMultiplikator() {
  const p = zustand.prestige;
  if (p === 0) return 1;
  let mult = 1 + p * 0.05;
  if (p >= 25) mult *= Math.pow(p, 0.5);
  // Talent: Prestige-Kraft (×1,3 pro Stufe)
  const preMult = talentLevel('tal_pre_mult');
  if (preMult > 0) mult *= Math.pow(1.30, preMult);
  return mult;
}

function berechnePPS() {
  let pps = 0;

  for (const g of GEBAEUDE) {
    const anzahl = zustand.gebaeude[g.id] || 0;
    if (anzahl === 0) continue;

    // Jeder Gebäude-Typ ist doppelt so stark wie der vorherige; Anzahl zählt linear
    let basePPS = g.basisPPS * anzahl;
    let mult = 1;

    for (const upId of zustand.upgrades) {
      const up = UPGRADES.find(u => u.id === upId);
      if (!up) continue;
      if (up.typ === 'gebaeude_mult' && up.gebaeude === g.id) mult *= up.wert;
    }

    for (const upId of zustand.upgrades) {
      const up = UPGRADES.find(u => u.id === upId);
      if (!up || up.typ !== 'synergie' || up.auf !== g.id) continue;
      const vonAnzahl = zustand.gebaeude[up.von] || 0;
      mult += vonAnzahl * up.faktor;
    }

    pps += basePPS * mult;
  }

  // Globale additive PPS-Upgrades
  for (const upId of zustand.upgrades) {
    const up = UPGRADES.find(u => u.id === upId);
    if (up?.typ === 'pps_add') pps += up.wert;
  }

  // Globale multiplikative PPS-Upgrades (aus normalen Upgrades)
  for (const upId of zustand.upgrades) {
    const up = UPGRADES.find(u => u.id === upId);
    if (up?.typ === 'pps_mult') pps *= up.wert;
  }

  for (const upId of zustand.prestigeUpgrades) {
    const up = PRESTIGE_UPGRADES.find(u => u.id === upId);
    if (up?.typ === 'qp_global_mult') pps *= up.wert;
  }

  pps *= berechnePrestigeMultiplikator();

  // Talent-Boni
  const prodEff = talentLevel('tal_prod_eff');
  if (prodEff > 0) pps *= (1 + prodEff * 0.10);

  const alleGebMult = talentLevel('tal_sp_alle_geb');
  if (alleGebMult > 0) {
    // Bereits in Gebäude-Schleife eingerechnet? Nein – hier global nochmal
    // Wir addieren hier stattdessen als separaten PPS-Bonus
    pps *= Math.pow(1.10, alleGebMult);
  }

  const errBonus = talentLevel('tal_sp_err');
  if (errBonus > 0) {
    const anzahlErr = (zustand.errungenschaften || []).length;
    pps *= (1 + anzahlErr * 0.005);
  }

  return pps;
}

function berechnePPK() {
  let additiv = 0;
  let mult = 1;

  for (const upId of zustand.upgrades) {
    const up = UPGRADES.find(u => u.id === upId);
    if (!up) continue;
    if (up.typ === 'klick_add') additiv += up.wert;
    if (up.typ === 'klick_mult') mult *= up.wert;
  }

  for (const upId of zustand.prestigeUpgrades) {
    const up = PRESTIGE_UPGRADES.find(u => u.id === upId);
    if (up?.typ === 'qp_klick_mult') mult *= up.wert;
  }

  let ppk = (1 + additiv) * mult * berechnePrestigeMultiplikator();

  // Talent: Schnelle Finger (+25% PPK pro Stufe)
  const klickSpeed = talentLevel('tal_klick_speed');
  if (klickSpeed > 0) ppk *= (1 + klickSpeed * 0.25);

  // Talent: PPS-zu-PPK Synergie (+1% der PPS als PPK pro Stufe)
  const ppsToPpk = talentLevel('tal_sp_pps_klick');
  if (ppsToPpk > 0) ppk += berechneteStats.pps * ppsToPpk * 0.01;

  return ppk;
}

function maxOfflineStunden() {
  let stunden = 1;
  for (const upId of zustand.upgrades) {
    const up = UPGRADES.find(u => u.id === upId);
    if (up?.typ === 'offline_stunden') stunden = Math.max(stunden, up.stunden);
  }
  if (zustand.prestige >= 10) stunden *= 2;
  // Talent: Nachtschicht (×2 pro Stufe)
  const offlineMult = talentLevel('tal_prod_offline');
  if (offlineMult > 0) stunden *= Math.pow(2, offlineMult);
  return stunden;
}

function berechneQPGewinn() {
  // Basis: Wurzel aus lifetime-Pixel + Prestige-Bonus (je 5 Prestige +1 QP)
  const basisQP = Math.max(1, Math.floor(Math.sqrt(zustand.lifetimePixel / 1e8)) + 1);
  const prestigeBonus = Math.floor(zustand.prestige / 5);
  // Talent: QP-Bonus (+1 pro Prestige pro Stufe)
  const talentBonus = talentLevel('tal_pre_qp');
  return basisQP + prestigeBonus + talentBonus;
}

function statsNeuBerechnen() {
  berechneteStats.pps = berechnePPS();
  berechneteStats.ppk = berechnePPK();
}

// === TALENT-HILFSFUNKTIONEN ===
function talentLevel(id) { return (zustand.talente && zustand.talente[id]) || 0; }
function talentWert(id) {
  const t = TALENTE.find(t => t.id === id);
  return t ? talentLevel(id) * t.wert : 0;
}

function talentKaufen(tal) {
  if (tal.id === 'tal_root') return; // auto-freigeschaltet
  const aktuell = talentLevel(tal.id);
  if (aktuell >= tal.maxLevel) return;
  if ((zustand.talentPunkte || 0) < 1) return;
  // Voraussetzung prüfen
  if (tal.requires && talentLevel(tal.requires) < 1) return;
  if (!zustand.talente) zustand.talente = {};
  zustand.talentPunkte = (zustand.talentPunkte || 0) - 1;
  zustand.talente[tal.id] = aktuell + 1;
  statsNeuBerechnen();
  talentModalRendern();
  talentBadgeAktualisieren();
  toastZeigen(`⭐ ${tal.name} Stufe ${aktuell + 1}`);
  spielstandSpeichern(false);
}

function talentBadgeAktualisieren() {
  const badge = document.getElementById('talentBadge');
  if (!badge) return;
  const punkte = zustand.talentPunkte || 0;
  badge.textContent = punkte;
  badge.classList.toggle('versteckt', punkte === 0);
}

function talentModalRendern() {
  const grid = document.getElementById('talentGrid');
  if (!grid) return;
  const punkte = zustand.talentPunkte || 0;

  const badge = document.getElementById('talentPunkteBadge');
  if (badge) {
    badge.innerHTML = punkte > 0
      ? `<div class="talent-punkte-anzeige">⭐ ${punkte} Talentpunkt${punkte !== 1 ? 'e' : ''} verfügbar</div>`
      : `<div class="talent-punkte-anzeige keine">Nächster Punkt beim nächsten Prestige</div>`;
  }

  // Baum-Layout Konstanten
  const COL_W  = 126;  // Pixel pro Spalte
  const ROW_H  = 130;  // Pixel pro Zeile
  const NW     = 114;  // Node-Breite
  const NH     = 68;   // Node-Höhe
  const PAD    = 12;   // Rand

  const maxCol = Math.max(...TALENTE.map(t => t.col));
  const maxRow = Math.max(...TALENTE.map(t => t.row));
  const canvasW = (maxCol + 1.5) * COL_W + PAD * 2;
  const canvasH = (maxRow + 1)   * ROW_H + PAD * 2;

  // SVG Verbindungslinien
  let svgLines = '';
  for (const tal of TALENTE) {
    if (!tal.requires) continue;
    const parent = TALENTE.find(t => t.id === tal.requires);
    if (!parent) continue;

    const px = parent.col * COL_W + NW / 2 + PAD;
    const py = parent.row * ROW_H + NH + PAD;
    const cx = tal.col   * COL_W + NW / 2 + PAD;
    const cy = tal.row   * ROW_H + PAD;
    const mid = (py + cy) / 2;

    const freigeschaltet = talentLevel(tal.requires) >= 1;
    const farbe = freigeschaltet ? 'var(--primary)' : '#cbd5e1';
    const dash  = freigeschaltet ? '' : 'stroke-dasharray="5 4"';
    const opacity = freigeschaltet ? '0.8' : '0.4';

    svgLines += `<path d="M${px},${py} C${px},${mid} ${cx},${mid} ${cx},${cy}"
      fill="none" stroke="${farbe}" stroke-width="2" ${dash} opacity="${opacity}"/>`;
  }

  // Talent-Knoten HTML
  let nodesHTML = '';
  for (const tal of TALENTE) {
    const lvl      = talentLevel(tal.id);
    const isRoot   = tal.id === 'tal_root';
    const prereqOk = !tal.requires || talentLevel(tal.requires) >= 1;
    const maxed    = lvl >= tal.maxLevel;
    const kaufbar  = !isRoot && prereqOk && punkte >= 1 && !maxed;

    const x = tal.col * COL_W + PAD;
    const y = tal.row * ROW_H + PAD;

    let klass = 'talent-karte';
    if (isRoot && lvl >= 1)  klass += ' root-freigeschaltet';
    if (maxed)               klass += ' maxlevel';
    else if (!prereqOk)      klass += ' gesperrt';
    else if (kaufbar)        klass += ' kaufbar';

    const dots = tal.maxLevel > 1
      ? `<div class="talent-level">${Array.from({length: tal.maxLevel}, (_, i) =>
          `<span class="talent-dot${i < lvl ? ' aktiv' : ''}">◆</span>`).join('')}</div>`
      : '';

    const info = isRoot
      ? (lvl >= 1 ? '✓ Freigeschaltet' : 'Wird automatisch freigeschaltet')
      : (maxed ? '✓ Maximal' : kaufbar ? '1 Punkt' : !prereqOk ? '🔒 Gesperrt' : `Stufe ${lvl}/${tal.maxLevel}`);

    nodesHTML += `<div class="${klass}" data-id="${tal.id}"
      style="position:absolute;left:${x}px;top:${y}px;width:${NW}px;min-height:${NH}px">
      <div class="talent-name">${tal.name}</div>
      <div class="talent-beschr">${tal.beschr}</div>
      ${dots}
      <div class="talent-info">${info}</div>
    </div>`;
  }

  grid.innerHTML = `
    <div class="talent-tree-scroll">
      <div style="position:relative;width:${canvasW}px;height:${canvasH}px">
        <svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" pointer-events="none">
          ${svgLines}
        </svg>
        ${nodesHTML}
      </div>
    </div>`;

  // Klick-Handler auf Knoten setzen
  grid.querySelectorAll('.talent-karte').forEach(el => {
    const tal = TALENTE.find(t => t.id === el.dataset.id);
    if (tal) el.addEventListener('click', () => talentKaufen(tal));
  });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  GAME LOOP                                              ║
// ╚══════════════════════════════════════════════════════════╝

let letzterFrame = 0;
let loopId = null;
let hintergrundInterval = null;
let spielGestartet = false;
let letzteShopAktualisierung = 0; // Timestamp letzte Shop-Render

let aktiveBoosts = { ppsMultiplikator: 1, ppkMultiplikator: 1, endeMs: 0 };

function boostAktualisieren() {
  if (Date.now() > aktiveBoosts.endeMs) {
    aktiveBoosts.ppsMultiplikator = 1;
    aktiveBoosts.ppkMultiplikator = 1;
  }
}

function gameLoop(timestamp) {
  if (!letzterFrame) letzterFrame = timestamp;
  const delta = Math.min(timestamp - letzterFrame, 1000);
  letzterFrame = timestamp;

  boostAktualisieren();

  const produktion = berechneteStats.pps * aktiveBoosts.ppsMultiplikator * (delta / 1000);
  zustand.pixel += produktion;
  zustand.lifetimePixel += produktion;

  if (typeof skinsPruefen === 'function') skinsPruefen();

  // Pro-Sekunde-Aufgaben
  if (Math.floor(timestamp / 1000) !== Math.floor((timestamp - delta) / 1000)) {
    // Kombo-Decay: wenn > 2s kein Klick, Kombo zurücksetzen (Talent verlängert Zeit)
    const komboTimeout = KOMBO_TIMEOUT_MS * (1 + talentLevel('tal_klick_kombo') * 0.30);
    if (komboLetzterKlick > 0 && Date.now() - komboLetzterKlick > komboTimeout) {
      komboTimer = 0;
    }
    // maxPPS tracken
    if (berechneteStats.pps > (zustand._maxPPS || 0)) {
      zustand._maxPPS = berechneteStats.pps;
    }
    if (typeof errungenschaftenPruefen === 'function') errungenschaftenPruefen();
    // Kombo-Balken aktualisieren
    if (typeof komboBalkenRendern === 'function') komboBalkenRendern();
  }

  // Shop alle 2 Sekunden aktualisieren (Leistbarkeit)
  if (timestamp - letzteShopAktualisierung > 2000) {
    letzteShopAktualisierung = timestamp;
    if (typeof shopRendern === 'function') shopRendern();
  }

  if (typeof prestigeBtnAktualisieren === 'function') prestigeBtnAktualisieren();

  if (!zustand._speedrunOk && zustand.pixel >= 1000) {
    if ((Date.now() - zustand._speedrunStart) < 60000) zustand._speedrunOk = true;
  }

  if (typeof renderStats === 'function') renderStats();
  if (typeof renderHaufen === 'function') renderHaufen();

  loopId = requestAnimationFrame(gameLoop);
}

function hintergrundTick() {
  const now = Date.now();
  const delta = Math.min(now - (zustand.letzterBesuch || now), 2000);
  zustand.letzterBesuch = now;

  const offlineMult = (zustand.prestige >= 10 ? 2 : 1) * Math.pow(2, talentLevel('tal_prod_offline'));
  const produktion = berechneteStats.pps * (delta / 1000) * offlineMult;
  zustand.pixel += produktion;
  zustand.lifetimePixel += produktion;
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (loopId) { cancelAnimationFrame(loopId); loopId = null; }
    zustand.letzterBesuch = Date.now();
    hintergrundInterval = setInterval(hintergrundTick, 1000);
  } else {
    if (hintergrundInterval) { clearInterval(hintergrundInterval); hintergrundInterval = null; }
    letzterFrame = 0;
    if (spielGestartet) loopId = requestAnimationFrame(gameLoop);
  }
});

// ╔══════════════════════════════════════════════════════════╗
// ║  PIXEL-HAUFEN CANVAS                                    ║
// ╚══════════════════════════════════════════════════════════╝

const HAUFEN_STUFEN = [
  { schwelle: 0,          anzahl: 1   },
  { schwelle: 100,        anzahl: 10  },
  { schwelle: 1000,       anzahl: 30  },
  { schwelle: 10000,      anzahl: 60  },
  { schwelle: 100000,     anzahl: 100 },
  { schwelle: 1000000,    anzahl: 150 },
  { schwelle: 1000000000, anzahl: 200 },
];

let haufenPartikel = [];
let animationsWinkel = 0;

function haufeInitialisieren() {
  haufenPartikel = [];
  const ziel = haufenZielAnzahl();
  const canvas = document.getElementById('pixelHaufen');
  const w = canvas.width, h = canvas.height;
  for (let i = 0; i < ziel; i++) {
    haufenPartikel.push(zufaelligerHaufenPixel(w, h));
  }
}

function haufenZielAnzahl() {
  const lp = zustand.lifetimePixel;
  let stufe = HAUFEN_STUFEN[0];
  for (const s of HAUFEN_STUFEN) {
    if (lp >= s.schwelle) stufe = s;
    else break;
  }
  return stufe.anzahl;
}

function zufaelligerHaufenPixel(w, h) {
  const cx = w / 2, cy = h * 0.58;
  const rx = w * 0.38, ry = h * 0.28;
  let x, y;
  do {
    x = cx + (Math.random() * 2 - 1) * rx;
    y = cy + (Math.random() * 2 - 1) * ry;
  } while (Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2) > 1);
  const groesse = 4 + Math.random() * 8;
  return { x, y, groesse, farbIndex: Math.floor(Math.random() * 4), dy: Math.random() * 0.3 - 0.15, phase: Math.random() * Math.PI * 2 };
}

function renderHaufen() {
  const canvas = document.getElementById('pixelHaufen');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const skin = SKINS.find(s => s.id === (zustand.skins?.aktiv || 'standard')) || SKINS[0];
  animationsWinkel += 0.02;

  // Haufen-Partikel auffüllen wenn Schwelle überschritten
  const ziel = haufenZielAnzahl();
  while (haufenPartikel.length < ziel) {
    haufenPartikel.push(zufaelligerHaufenPixel(w, h));
  }

  // Leichte Bewegung der Partikel
  for (const p of haufenPartikel) {
    p.y += p.dy;
    const cx = w / 2, cy = h * 0.58, rx = w * 0.38, ry = h * 0.28;
    if (Math.pow((p.x - cx) / rx, 2) + Math.pow((p.y - cy) / ry, 2) > 1.1) {
      Object.assign(p, zufaelligerHaufenPixel(w, h));
    }
  }

  // Pixel zeichnen
  for (const p of haufenPartikel) {
    let farbe;
    if (skin.animiert) {
      const idx = Math.floor((animationsWinkel + p.x / 30) % skin.farben.length);
      farbe = skin.farben[Math.abs(idx) % skin.farben.length];
    } else if (skin.pulsierend) {
      farbe = skin.farben[p.farbIndex % skin.farben.length];
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(animationsWinkel + p.x / 20);
    } else if (skin.kristall) {
      farbe = skin.farben[p.farbIndex % skin.farben.length];
      ctx.globalAlpha = 0.5 + 0.4 * Math.sin(animationsWinkel * 0.8 + p.phase);
    } else {
      farbe = skin.farben[p.farbIndex % skin.farben.length];
    }

    ctx.fillStyle = farbe;
    ctx.fillRect(Math.round(p.x - p.groesse / 2), Math.round(p.y - p.groesse / 2), Math.round(p.groesse), Math.round(p.groesse));
    ctx.globalAlpha = 1;

    // Glitzer-Effekt
    if (skin.glitzer && Math.random() < 0.002) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - 1), 2, 2);
    }
  }

  // Rahmen
  ctx.strokeStyle = 'rgba(148,163,184,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, w - 4, h - 4);
}

// Klick-Partikel erzeugen
function partikelErzeugen(x, y, text) {
  const el = document.createElement('div');
  el.className = 'partikel';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ╔══════════════════════════════════════════════════════════╗
// ║  KLICK-MECHANIK + UI-RENDERING                          ║
// ╚══════════════════════════════════════════════════════════╝

function klickHandler(event) {
  // Kombo aktualisieren
  const jetzt = Date.now();
  if (komboLetzterKlick > 0 && jetzt - komboLetzterKlick <= KOMBO_TIMEOUT_MS * (1 + talentLevel('tal_klick_kombo') * 0.30)) {
    komboTimer += (jetzt - komboLetzterKlick) / 1000;
  } else {
    komboTimer = 0;
  }
  komboLetzterKlick = jetzt;

  // Kombo-Errungenschaften tracken
  const mult = komboMultiplikator();
  if (mult >= 2 && !zustand._komboReached2) zustand._komboReached2 = true;
  if (mult >= 3 && !zustand._komboReached3) zustand._komboReached3 = true;

  let ppk = berechneteStats.ppk * aktiveBoosts.ppkMultiplikator * mult;
  // Talent: Kritischer Treffer (+5% Chance auf Krit-Klick pro Stufe)
  const kritChance = talentLevel('tal_klick_krit') * 0.05;
  if (kritChance > 0 && Math.random() < kritChance) {
    const kritMult = 3 + talentLevel('tal_klick_krit_mult') * 0.5; // ×3 bis ×5
    ppk *= kritMult;
    partikelErzeugen(
      event.clientX || 0,
      (event.clientY || 0) - 20,
      '💥 KRIT!'
    );
  }
  // Talent: Klick-Synergie (+1% der PPS pro Stufe)
  const klickPps = talentLevel('tal_klick_pps');
  if (klickPps > 0) ppk += berechneteStats.pps * klickPps * 0.01;
  zustand.pixel += ppk;
  zustand.lifetimePixel += ppk;
  zustand.gesamtKlicks++;

  // Klick-Ring pulsieren
  const ring = document.getElementById('klickRing');
  if (ring) {
    ring.classList.remove('puls');
    void ring.offsetWidth; // Reflow um Animation neu zu starten
    ring.classList.add('puls');
  }

  const rect = event.currentTarget.getBoundingClientRect();
  partikelErzeugen(
    event.clientX || rect.left + rect.width / 2,
    event.clientY || rect.top + rect.height / 2,
    '+' + fmt(ppk)
  );

  document.getElementById('klickInfo').textContent = '+' + fmt(ppk) + ' Pixel';
  if (typeof errungenschaftenPruefen === 'function') errungenschaftenPruefen();
}

function komboBalkenRendern() {
  const fill = document.getElementById('komboFill');
  const label = document.getElementById('komboLabel');
  if (!fill || !label) return;

  const mult = komboMultiplikator();

  if (komboTimer <= 0 || (Date.now() - komboLetzterKlick > KOMBO_TIMEOUT_MS * (1 + talentLevel('tal_klick_kombo') * 0.30))) {
    fill.style.width = '0%';
    fill.className = 'kombo-fill';
    label.textContent = 'Kombo';
    label.className = 'kombo-label';
    return;
  }

  let progress, klasse, labelText;
  if (komboTimer >= 30) {
    progress = 100;
    klasse = 'stufe-3';
    labelText = '×3 Mega-Kombo!';
  } else if (komboTimer >= 6) {
    progress = 50 + ((komboTimer - 6) / 24) * 50;
    klasse = 'stufe-2';
    labelText = '×2 Kombo!';
  } else {
    progress = (komboTimer / 6) * 50;
    klasse = '';
    labelText = 'Kombo aufbauen…';
  }

  fill.style.width = progress + '%';
  fill.className = 'kombo-fill ' + klasse;
  label.textContent = labelText;
  label.className = 'kombo-label' + (mult >= 3 ? ' aktiv-3' : mult >= 2 ? ' aktiv-2' : '');
}

function renderStats() {
  const statPixel = document.getElementById('statPixel');
  if (!statPixel) return;
  statPixel.textContent = fmt(zustand.pixel) + ' Pixel';
  document.getElementById('statPPS').textContent = fmt(berechneteStats.pps) + '/s';
  document.getElementById('statPPK').textContent = fmt(berechneteStats.ppk);
  document.getElementById('statQP').textContent = fmt(zustand.quantumPixel) + ' QP';
  document.getElementById('statPrestige').textContent = zustand.prestige;
}

function prestigeBtnAktualisieren() {
  const btn = document.getElementById('prestigeBtn');
  const info = document.getElementById('prestigeInfo');
  const schwelle = berechnePrestizeSchwelle();
  // Nur aktuelle Pixel zählen – man muss die Pixel JETZT haben
  if (zustand.pixel >= schwelle) {
    btn.disabled = false;
    const qp = berechneQPGewinn();
    info.textContent = `+${fmt(qp)} Quantum-Pixel`;
  } else {
    btn.disabled = true;
    info.textContent = `Brauche ${fmt(schwelle)} Pixel`;
  }
}

function shopTabAktivieren(tabName) {
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.toggle('aktiv', t.dataset.tab === tabName));
  document.getElementById('shopGebaeude').classList.toggle('versteckt', tabName !== 'gebaeude');
  document.getElementById('shopUpgrades').classList.toggle('versteckt', tabName !== 'upgrades');
  document.getElementById('shopPrestige').classList.toggle('versteckt', tabName !== 'prestige');
  document.getElementById('bulkLeiste').classList.toggle('versteckt', tabName !== 'gebaeude');
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SHOP                                                   ║
// ╚══════════════════════════════════════════════════════════╝

function shopRendern() {
  shopGebaeudeRendern();
  shopUpgradesRendern();
  shopPrestigeRendern();
}

function gebaeudeIconZeichen(id) {
  const icons = {
    maschine: '⚙', foerderband: '⇒', drucker: '▤', sortieranlage: '⊞',
    labor: '⌬', quantencomp: '◈', reaktor: '⊕', portal: '⊗',
    universum: '✦', zeitmaschine: '↻', nanofabrik: '◆', biomatrix: '⬡',
    warpgenerator: '⊜', singularitaet: '◉', goettlich: '✧',
  };
  return icons[id] || '?';
}

function shopGebaeudeRendern() {
  const container = document.getElementById('shopGebaeude');
  container.innerHTML = '';

  for (const g of GEBAEUDE) {
    if (g.minPrestige && zustand.prestige < g.minPrestige) {
      const el = document.createElement('div');
      el.className = 'gebaeude-eintrag gesperrt';
      el.innerHTML = `
        <div class="gebaeude-icon" style="background:${g.farbe}22">🔒</div>
        <div class="gebaeude-info">
          <div class="gebaeude-name">${g.name}</div>
          <div class="gebaeude-pps">Ab Prestige ${g.minPrestige}</div>
        </div>
        <div class="gebaeude-preis-block"></div>`;
      container.appendChild(el);
      continue;
    }

    const anzahl = zustand.gebaeude[g.id] || 0;
    const menge = bulkMenge === 0 ? gebaeudeMaxMenge(g) : bulkMenge;
    const preis = menge <= 1 ? gebaeudePreis(g, anzahl) : gebaeudeGesamtPreis(g, menge);
    const kannKaufen = zustand.pixel >= gebaeudePreis(g, anzahl);
    const el = document.createElement('div');
    el.className = `gebaeude-eintrag${kannKaufen ? ' leistbar' : ' zu-teuer'}`;

    const bulkInfo = menge > 1 && kannKaufen
      ? `<div class="gebaeude-bulk-info">×${menge} = ${fmt(preis)}</div>`
      : (menge > 1 ? `<div class="gebaeude-bulk-info">×${menge}</div>` : '');

    el.innerHTML = `
      <div class="gebaeude-icon" style="background:${g.farbe}22; color:${g.farbe}">
        ${gebaeudeIconZeichen(g.id)}
      </div>
      <div class="gebaeude-info">
        <div class="gebaeude-name">${g.name}</div>
        <div class="gebaeude-pps">+${fmt(g.basisPPS)}/s pro Stück</div>
      </div>
      <div class="gebaeude-preis-block">
        <div class="gebaeude-preis">${fmt(menge <= 1 ? preis : gebaeudePreis(g, anzahl))}</div>
        ${anzahl > 0 ? `<div class="gebaeude-anzahl-badge">${anzahl}</div>` : ''}
        ${bulkInfo}
      </div>`;

    el.addEventListener('click', () => gebaeudeKaufen(g));
    container.appendChild(el);
  }
}

function gebaeudeKaufen(g) {
  const menge = bulkMenge === 0 ? gebaeudeMaxMenge(g) : bulkMenge;
  if (menge <= 0) return;
  for (let i = 0; i < menge; i++) {
    const anzahl = zustand.gebaeude[g.id] || 0;
    const preis = gebaeudePreis(g, anzahl);
    if (zustand.pixel < preis) break;
    zustand.pixel -= preis;
    zustand.gebaeude[g.id] = anzahl + 1;
  }
  statsNeuBerechnen();
  shopRendern();
}

function shopUpgradesRendern() {
  const container = document.getElementById('shopUpgrades');
  container.innerHTML = '';

  const verfuegbar = UPGRADES.filter(up =>
    !zustand.upgrades.includes(up.id) && up.bedingung(zustand)
  );

  if (verfuegbar.length === 0) {
    container.innerHTML = '<div style="padding:16px;color:var(--text-muted);font-size:0.85rem;text-align:center">Noch keine Upgrades verfügbar</div>';
    return;
  }

  // Aufsteigend nach Preis sortieren
  verfuegbar.sort((a, b) => a.preis - b.preis);

  // Upgrade-Rabatt (Talent: Upgrade-Kenner)
  const upgradeRab = talentLevel('tal_pre_upgrade');
  const klickTypen = ['klick_add', 'klick_mult'];
  for (const up of verfuegbar) {
    const istKlick = klickTypen.includes(up.typ);
    let angezeigterPreis = up.preis;
    if (upgradeRab > 0) angezeigterPreis = Math.ceil(up.preis * Math.pow(1 - 0.10, upgradeRab));
    const kannKaufen = zustand.pixel >= angezeigterPreis;
    const el = document.createElement('div');
    const kategorieKlasse = istKlick ? 'ppk-upgrade' : 'pps-upgrade';
    el.className = `upgrade-eintrag ${kategorieKlasse}${kannKaufen ? ' leistbar' : ' zu-teuer'}`;
    el.innerHTML = `
      <div class="upgrade-name">${up.name}</div>
      <div class="upgrade-beschreibung">${up.beschreibung}</div>
      <div class="upgrade-preis">${fmt(angezeigterPreis)} Pixel</div>`;
    el.addEventListener('click', () => upgradeKaufen(up));
    container.appendChild(el);
  }
}

function upgradeKaufen(up) {
  if (zustand.upgrades.includes(up.id)) return;
  let preis = up.preis;
  // Talent: Upgrade-Kenner (−10% pro Stufe)
  const upgradeRab = talentLevel('tal_pre_upgrade');
  if (upgradeRab > 0) preis = Math.ceil(preis * Math.pow(1 - 0.10, upgradeRab));
  if (zustand.pixel < preis) return;
  zustand.pixel -= preis;
  zustand.upgrades.push(up.id);
  statsNeuBerechnen();
  shopRendern();
}

function shopPrestigeRendern() {
  const container = document.getElementById('shopPrestige');
  container.innerHTML = '';

  // Nur Upgrades die noch nicht gekauft sind und deren Prestige-Voraussetzung erfüllt ist
  const verfuegbar = PRESTIGE_UPGRADES.filter(up =>
    !zustand.prestigeUpgrades.includes(up.id) &&
    (!up.minPrestige || zustand.prestige >= up.minPrestige)
  );

  // Gesperrte Meilenstein-Upgrades als Vorschau anzeigen
  const gesperrteMeilensteine = PRESTIGE_UPGRADES.filter(up =>
    !zustand.prestigeUpgrades.includes(up.id) &&
    up.meilenstein &&
    up.minPrestige && zustand.prestige < up.minPrestige
  );

  if (verfuegbar.length === 0 && gesperrteMeilensteine.length === 0) {
    container.innerHTML = '<div style="padding:16px;color:var(--text-muted);font-size:0.85rem;text-align:center">Alle Quantum-Upgrades gekauft!</div>';
    return;
  }

  // Aufsteigend nach QP-Preis sortieren
  verfuegbar.sort((a, b) => a.preisQP - b.preisQP);

  for (const up of verfuegbar) {
    const kannKaufen = zustand.quantumPixel >= up.preisQP;
    const el = document.createElement('div');
    el.className = `upgrade-eintrag prestige-up${up.meilenstein ? ' meilenstein-up' : ''}${kannKaufen ? ' leistbar' : ' zu-teuer'}`;
    el.innerHTML = `
      <div class="upgrade-name">${up.name}</div>
      <div class="upgrade-beschreibung">${up.beschreibung}</div>
      <div class="upgrade-preis">⬡ ${fmt(up.preisQP)} Quantum-Pixel</div>`;
    el.addEventListener('click', () => prestigeUpgradeKaufen(up));
    container.appendChild(el);
  }

  // Gesperrte Meilensteine als Ausblick zeigen
  for (const up of gesperrteMeilensteine) {
    const el = document.createElement('div');
    el.className = 'upgrade-eintrag prestige-up meilenstein-up gesperrt';
    el.innerHTML = `
      <div class="upgrade-name">${up.name}</div>
      <div class="upgrade-beschreibung">Ab Prestige ${up.minPrestige} verfügbar</div>
      <div class="upgrade-preis">⬡ ${fmt(up.preisQP)} Quantum-Pixel</div>`;
    container.appendChild(el);
  }
}


function prestigeUpgradeKaufen(up) {
  if (zustand.prestigeUpgrades.includes(up.id)) return;
  if (zustand.quantumPixel < up.preisQP) return;
  zustand.quantumPixel -= up.preisQP;
  zustand.prestigeUpgrades.push(up.id);
  if (up.typ === 'qp_start_bonus') zustand.pixel += up.wert;
  statsNeuBerechnen();
  shopRendern();
}

// ╔══════════════════════════════════════════════════════════╗
// ║  PRESTIGE                                               ║
// ╚══════════════════════════════════════════════════════════╝

function berechnePrestizeSchwelle() {
  let schwelle = zustand.prestige === 0 ? 1000 : 1000 * Math.pow(10, zustand.prestige);
  // Talent: Frühes Prestige (−10% pro Stufe)
  const schwell = talentLevel('tal_pre_schwelle');
  if (schwell > 0) schwelle *= Math.pow(1 - 0.10, schwell);
  return schwelle;
}

function prestigeDurchfuehren() {
  const schwelle = berechnePrestizeSchwelle();
  // Nur aktuelle Pixel zählen
  if (zustand.pixel < schwelle) return;

  const qpGewinn = berechneQPGewinn();
  document.getElementById('pcQP').textContent = `+${fmt(qpGewinn)} Quantum-Pixel`;
  document.getElementById('prestigeConfirmModal').classList.remove('versteckt');
  document.getElementById('prestigeConfirmModal').dataset.qp = qpGewinn;
}

function prestigeAusfuehren(qpGewinn) {
  zustand.quantumPixel += qpGewinn;
  zustand._gesamtQP += qpGewinn;
  zustand.prestige += 1;
  zustand.pixel = 0;
  zustand.gebaeude = Object.fromEntries(GEBAEUDE.map(g => [g.id, 0]));
  zustand.upgrades = [];
  zustand._speedrunStart = Date.now();
  zustand._speedrunOk = false;

  // Talent-Punkte vergeben (1 pro Prestige, bleiben dauerhaft)
  zustand.talentPunkte = (zustand.talentPunkte || 0) + 1;
  // Wurzel-Talent automatisch freischalten (kein Punkt)
  if (!zustand.talente) zustand.talente = {};
  if (!zustand.talente['tal_root']) zustand.talente['tal_root'] = 1;

  // Talent: Pixel-Magnet (+200 Startpixel pro Stufe)
  const pixelMagnet = talentLevel('tal_start_pixel');
  if (pixelMagnet > 0) zustand.pixel += pixelMagnet * 200;

  // Talent: Schnellstart (+2 Maschinen pro Stufe)
  const schnellstart = talentLevel('tal_start_geb');
  if (schnellstart > 0) {
    zustand.gebaeude['maschine'] = schnellstart * 2;
  }

  // Talent: Kombo-Start (×2-Kombo aktiv)
  if (talentLevel('tal_start_kombo') > 0) {
    komboTimer = 6;
    komboLetzterKlick = Date.now();
  }

  // Talent: Vorbereitung (erstes Klick-Upgrade gratis)
  if (talentLevel('tal_start_upg') > 0) {
    const erstesKlickUpg = KLICK_UPGRADES[0];
    if (erstesKlickUpg && !zustand.upgrades.includes(erstesKlickUpg.id)) {
      zustand.upgrades.push(erstesKlickUpg.id);
    }
  }

  const startBonusGekauft = zustand.prestigeUpgrades.includes('qp_start');
  if (startBonusGekauft) {
    const startBonus = PRESTIGE_UPGRADES.find(u => u.id === 'qp_start');
    if (startBonus) zustand.pixel += startBonus.wert;
  }

  skinsPruefen();
  statsNeuBerechnen();
  haufeInitialisieren();
  shopRendern();
  errungenschaftenPruefen();
  talentBadgeAktualisieren();
  toastZeigen(`✦ Prestige ${zustand.prestige}! +${fmt(qpGewinn)} Quantum-Pixel`);
  spielstandSpeichern();
}

function prestigeAnimationZeigen(qpGewinn, callback) {
  const overlay = document.getElementById('prestigeAnimOverlay');
  const canvas  = document.getElementById('prestigePartikelCanvas');
  document.getElementById('paQPText').textContent = `+${fmt(qpGewinn)} Quantum-Pixel`;

  overlay.hidden = false;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  const farben = ['#8b5cf6','#a78bfa','#fbbf24','#60a5fa','#34d399','#f472b6'];
  const partikel = [];

  for (let i = 0; i < 130; i++) {
    partikel.push({
      x:    Math.random() * canvas.width,
      y:    canvas.height + Math.random() * 60,
      vx:   (Math.random() - 0.5) * 5,
      vy:   -(3 + Math.random() * 6),
      size: 5 + Math.random() * 9,
      farbe: farben[Math.floor(Math.random() * farben.length)],
    });
  }

  const start = performance.now();
  const dauer = 2600;

  function frame(now) {
    const t = (now - start) / dauer;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of partikel) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.06; // leichte Schwerkraft
      const alpha = Math.max(0, 1 - t * 1.1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.farbe;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      overlay.hidden = true;
      callback();
    }
  }

  requestAnimationFrame(frame);
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SKINS                                                  ║
// ╚══════════════════════════════════════════════════════════╝

function skinAnwenden(skin) {
  const root = document.documentElement;
  // Erst auf Defaults zurücksetzen
  Object.entries(SKIN_DEFAULTS).forEach(([k, v]) => root.style.setProperty(k, v));
  // Theme-Overrides anwenden
  if (skin && skin.theme) {
    Object.entries(skin.theme).forEach(([k, v]) => root.style.setProperty(k, v));
  }
  // Canvas-Hintergrund
  const canvas = document.getElementById('pixelHaufen');
  if (canvas) {
    canvas.style.background = (skin && skin.canvasBg) ? skin.canvasBg : SKIN_DEFAULTS_CANVAS;
    canvas.style.borderColor = skin?.theme?.['--border'] || '';
  }
  // Hintergrund-Animation
  bgAnimStoppen();
  if (skin?.bgAnim) skin.bgAnim();
  if (skin?.bodyClass) document.body.classList.add(skin.bodyClass);
}

let _bgAnimInterval = null;

function bgAnimStoppen() {
  // Body-Klassen entfernen
  [...document.body.classList].filter(c => c.startsWith('skin-')).forEach(c => document.body.classList.remove(c));
  // Interval stoppen
  if (_bgAnimInterval) { clearInterval(_bgAnimInterval); _bgAnimInterval = null; }
  // Container leeren + Hintergrund zurücksetzen
  const c = document.getElementById('bgAnimContainer');
  if (c) { c.innerHTML = ''; c.style.background = ''; }
}

// Hilfsfunktion: einfaches Element erstellen und anhängen
function _bgEl(c, css, html) {
  const el = document.createElement('div');
  el.style.cssText = css || '';
  if (html) el.innerHTML = html;
  c.appendChild(el);
  return el;
}

// ── Weltraum: Spiralgalaxie (Andromeda) ─────────────────────
function bgAnimWeltraum() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  c.style.background = 'radial-gradient(ellipse at 50% 50%,#0d0a2e 0%,#050215 60%,#000000 100%)';
  // Tiefer Nebel-Hintergrund
  _bgEl(c,'position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%,rgba(30,20,100,0.5) 0%,transparent 60%)');
  _bgEl(c,'position:absolute;inset:0;background:radial-gradient(ellipse at 75% 65%,rgba(80,20,120,0.35) 0%,transparent 55%)');
  // Galaxie-Halo (äußeres Leuchten)
  _bgEl(c,'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:320px;height:160px;border-radius:50%;background:radial-gradient(ellipse,rgba(60,40,180,0.22) 0%,rgba(120,60,200,0.12) 40%,transparent 75%);filter:blur(18px)');
  // Galaxie-Spiralkern (leuchtendes Zentrum)
  _bgEl(c,'position:absolute;top:50%;left:50%;transform:translate(-50%,-52%);width:80px;height:50px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,220,255,0.95) 0%,rgba(220,160,255,0.7) 35%,rgba(150,80,230,0.3) 65%,transparent 100%);filter:blur(6px)');
  // Spiral-Arme (blaue, angewinkelte Ellipsen)
  _bgEl(c,'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);width:280px;height:90px;border-radius:50%;background:linear-gradient(90deg,transparent 5%,rgba(80,120,255,0.18) 30%,rgba(100,150,255,0.28) 50%,rgba(80,120,255,0.18) 70%,transparent 95%);filter:blur(10px)');
  _bgEl(c,'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(150deg);width:240px;height:70px;border-radius:50%;background:linear-gradient(90deg,transparent 5%,rgba(60,100,220,0.15) 30%,rgba(80,130,240,0.22) 50%,rgba(60,100,220,0.15) 70%,transparent 95%);filter:blur(12px)');
  _bgEl(c,'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(60deg);width:200px;height:55px;border-radius:50%;background:linear-gradient(90deg,transparent 10%,rgba(120,80,200,0.12) 40%,rgba(140,100,220,0.18) 50%,transparent 90%);filter:blur(14px)');
  // Äußere Sternwolke
  _bgEl(c,'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:380px;height:200px;border-radius:50%;background:radial-gradient(ellipse,transparent 40%,rgba(100,120,200,0.08) 65%,transparent 85%);filter:blur(6px)');
  // 160 Sterne
  for (let i = 0; i < 160; i++) {
    const sz = Math.random() < 0.08 ? 2.5 + Math.random() : 0.7 + Math.random() * 1.6;
    const glow = sz > 2 ? `;box-shadow:0 0 ${Math.round(sz*3)}px rgba(200,200,255,0.8)` : '';
    const col = Math.random() < 0.15 ? `rgba(200,180,255,0.9)` : Math.random() < 0.1 ? `rgba(180,210,255,0.9)` : 'rgba(255,255,255,0.9)';
    _bgEl(c,`position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px;background:${col};border-radius:50%${glow};animation:sternFunkeln ${(2+Math.random()*5).toFixed(1)}s ease-in-out ${(Math.random()*7).toFixed(1)}s infinite`);
  }
  // Sternschnuppen
  _bgAnimInterval = setInterval(() => {
    if (!document.getElementById('bgAnimContainer')) return;
    const ss = document.createElement('div');
    ss.className = 'bg-sternschnuppe';
    ss.style.cssText = `left:${5+Math.random()*65}%;top:${3+Math.random()*40}%;animation-duration:${(0.5+Math.random()*0.8).toFixed(2)}s`;
    c.appendChild(ss);
    setTimeout(() => ss.remove(), 2000);
  }, 3500);
}

// ── Kirschblüte: Japanische Minimalszene ────────────────────
function bgAnimKirschbluete() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Himmel: dunkleres Pink/Lila oben, heller am Horizont (wie Screenshot)
  c.style.background = 'linear-gradient(180deg,#6b2d5e 0%,#a0406e 25%,#c85a7a 50%,#d4708a 72%,#e8909a 88%,#f0b0a8 100%)';
  // Wasser/See in der Mitte
  _bgEl(c,'position:absolute;bottom:18%;left:0;right:0;height:10%;background:linear-gradient(180deg,rgba(140,60,100,0.6) 0%,rgba(100,40,80,0.8) 100%)');
  _bgEl(c,'position:absolute;bottom:18%;left:0;right:0;height:10%;background:linear-gradient(180deg,rgba(200,130,160,0.2) 0%,transparent 100%);filter:blur(2px)');
  // Horizont-Leiste
  _bgEl(c,'position:absolute;bottom:26%;left:0;right:0;height:3%;background:rgba(180,80,110,0.4);filter:blur(4px)');
  // Vulkan links (dunkle Silhouette)
  _bgEl(c,'position:absolute;bottom:18%;left:-2%;width:0;height:0;border-left:60px solid transparent;border-right:60px solid transparent;border-bottom:140px solid rgba(50,15,35,0.85)');
  _bgEl(c,'position:absolute;bottom:18%;left:10px;width:0;height:0;border-left:25px solid transparent;border-right:25px solid transparent;border-bottom:55px solid rgba(50,15,35,0.85)');
  // Vulkan-Rauch
  _bgEl(c,'position:absolute;bottom:50%;left:1%;width:18px;height:35px;background:radial-gradient(ellipse,rgba(220,200,220,0.4) 0%,transparent 70%);filter:blur(5px)');
  // Pinke Sonne am Horizont rechts
  _bgEl(c,'position:absolute;bottom:19%;right:12%;width:52px;height:52px;border-radius:50%;background:radial-gradient(circle,rgba(255,160,160,0.95) 0%,rgba(230,100,130,0.7) 50%,transparent 100%);box-shadow:0 0 30px rgba(230,100,130,0.5)');
  // Kirschbaum rechts
  _bgEl(c,'position:absolute;bottom:18%;right:8%;width:12px;height:35%;background:linear-gradient(180deg,#2d1a0e,#3d2010);border-radius:4px 4px 2px 2px');
  // Äste rechts-Baum
  _bgEl(c,'position:absolute;bottom:42%;right:12%;width:35px;height:7px;background:#3d2010;border-radius:4px;transform:rotate(-50deg);transform-origin:100% 50%');
  _bgEl(c,'position:absolute;bottom:46%;right:19%;width:30px;height:7px;background:#3d2010;border-radius:4px;transform:rotate(-20deg);transform-origin:100% 50%');
  _bgEl(c,'position:absolute;bottom:48%;right:6%;width:28px;height:6px;background:#3d2010;border-radius:4px;transform:rotate(40deg);transform-origin:0% 50%');
  _bgEl(c,'position:absolute;bottom:38%;right:5%;width:22px;height:6px;background:#3d2010;border-radius:4px;transform:rotate(65deg);transform-origin:0% 50%');
  // Blütenwolken am Baum (rechts)
  [['60%','8%','22%','18%','rgba(220,140,180,0.9)'],
   ['72%','3%','20%','16%','rgba(200,110,160,0.85)'],
   ['65%','18%','18%','15%','rgba(230,160,190,0.82)'],
   ['55%','14%','16%','14%','rgba(210,130,170,0.78)'],
   ['76%','14%','18%','15%','rgba(220,145,175,0.80)'],
   ['68%','28%','14%','12%','rgba(200,120,160,0.75)'],
  ].forEach(([l,t,w,h,bg]) => _bgEl(c,`position:absolute;left:${l};top:${t};width:${w};height:${h};background:${bg};border-radius:50%;filter:blur(10px)`));
  // Fallende Blütenblätter
  for (let i = 0; i < 35; i++) {
    const sz = 5 + Math.random() * 9;
    const el = document.createElement('div');
    el.className = 'bg-bluete';
    el.style.cssText = `left:${Math.random()*100}%;top:${-Math.random()*100}%;width:${sz}px;height:${sz}px;background:hsla(330,70%,${70+Math.random()*20}%,0.85);animation-delay:${(Math.random()*10).toFixed(2)}s;animation-duration:${(6+Math.random()*10).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Winter: Pixelart-Hütte bei Nacht ────────────────────────
function bgAnimWinter() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Dunkle Nacht (wie Screenshot: sehr dunkelblaues Nacht-Ambiente)
  c.style.background = 'linear-gradient(180deg,#0a1628 0%,#0f1e35 40%,#142240 75%,#1a2a4a 100%)';
  // Sterne (klein, statisch)
  for (let i = 0; i < 35; i++) {
    _bgEl(c,`position:absolute;left:${Math.random()*100}%;top:${Math.random()*55}%;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;background:rgba(200,220,255,${0.3+Math.random()*0.5});border-radius:50%`);
  }
  // Schneeboden
  _bgEl(c,'position:absolute;bottom:0;left:0;right:0;height:18%;background:linear-gradient(180deg,#c8d8f0 0%,#dce8f8 100%)');
  // Schneeglanz auf Boden
  _bgEl(c,'position:absolute;bottom:16%;left:10%;width:80%;height:4%;background:rgba(220,235,255,0.3);filter:blur(5px);border-radius:50%');
  // Dunkle Tannenbäume links
  [{l:'0%',b:18,s:1.1},{l:'7%',b:18,s:0.75},{l:'13%',b:18,s:0.9}].forEach(({l,b,s}) => {
    const h=160*s, w=68*s;
    _bgEl(c,`position:absolute;bottom:${b}%;left:${l};width:0;height:0;border-left:${w*0.45}px solid transparent;border-right:${w*0.45}px solid transparent;border-bottom:${h*0.55}px solid rgba(15,35,20,0.95)`);
    _bgEl(c,`position:absolute;bottom:${b+19*s}%;left:${l};width:0;height:0;border-left:${w*0.38}px solid transparent;border-right:${w*0.38}px solid transparent;border-bottom:${h*0.45}px solid rgba(18,42,25,0.95)`);
    _bgEl(c,`position:absolute;bottom:${b+32*s}%;left:${l};width:0;height:0;border-left:${w*0.28}px solid transparent;border-right:${w*0.28}px solid transparent;border-bottom:${h*0.32}px solid rgba(20,48,28,0.95)`);
    // Schnee auf Baum
    _bgEl(c,`position:absolute;bottom:${b+52*s}%;left:calc(${l} + ${(w*0.28-w*0.16).toFixed(0)}px);width:${(w*0.32).toFixed(0)}px;height:${(h*0.06).toFixed(0)}px;background:rgba(210,228,248,0.85);border-radius:50%;filter:blur(2px)`);
  });
  // Dunkle Tannenbäume rechts
  [{l:'78%',b:18,s:0.85},{l:'85%',b:18,s:1},{l:'91%',b:18,s:0.7}].forEach(({l,b,s}) => {
    const h=160*s, w=68*s;
    _bgEl(c,`position:absolute;bottom:${b}%;left:${l};width:0;height:0;border-left:${w*0.45}px solid transparent;border-right:${w*0.45}px solid transparent;border-bottom:${h*0.55}px solid rgba(15,35,20,0.95)`);
    _bgEl(c,`position:absolute;bottom:${b+19*s}%;left:${l};width:0;height:0;border-left:${w*0.38}px solid transparent;border-right:${w*0.38}px solid transparent;border-bottom:${h*0.45}px solid rgba(18,42,25,0.95)`);
    _bgEl(c,`position:absolute;bottom:${b+32*s}%;left:${l};width:0;height:0;border-left:${w*0.28}px solid transparent;border-right:${w*0.28}px solid transparent;border-bottom:${h*0.32}px solid rgba(20,48,28,0.95)`);
    _bgEl(c,`position:absolute;bottom:${b+52*s}%;left:calc(${l} + ${(w*0.28-w*0.16).toFixed(0)}px);width:${(w*0.32).toFixed(0)}px;height:${(h*0.06).toFixed(0)}px;background:rgba(210,228,248,0.85);border-radius:50%;filter:blur(2px)`);
  });
  // Hütte – Grundkörper (dunkelbraun/Holz)
  _bgEl(c,'position:absolute;bottom:18%;left:50%;transform:translateX(-50%);width:120px;height:70px;background:linear-gradient(180deg,#3d1f0a 0%,#2d1608 100%);border-radius:2px');
  // Hütte – Dach
  _bgEl(c,'position:absolute;bottom:37%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:75px solid transparent;border-right:75px solid transparent;border-bottom:48px solid #1a0c05');
  // Schnee auf Dach
  _bgEl(c,'position:absolute;bottom:56%;left:50%;transform:translateX(-50%);width:120px;height:12px;background:rgba(210,228,248,0.9);border-radius:50%;filter:blur(3px)');
  // Schornstein
  _bgEl(c,'position:absolute;bottom:55%;left:calc(50% + 20px);width:14px;height:28px;background:#1a0c05;border-radius:2px 2px 0 0');
  // Rauch aus Schornstein
  _bgEl(c,'position:absolute;bottom:70%;left:calc(50% + 18px);width:20px;height:30px;background:radial-gradient(ellipse,rgba(140,140,160,0.4) 0%,transparent 70%);filter:blur(5px)');
  // Fenster links (warm leuchtendes Licht)
  _bgEl(c,'position:absolute;bottom:23%;left:calc(50% - 40px);width:24px;height:20px;background:linear-gradient(135deg,#fde68a,#fbbf24,#f59e0b);border-radius:2px;box-shadow:0 0 18px 6px rgba(251,191,36,0.5),0 0 35px 10px rgba(251,191,36,0.2)');
  // Fenster rechts
  _bgEl(c,'position:absolute;bottom:23%;left:calc(50% + 16px);width:24px;height:20px;background:linear-gradient(135deg,#fde68a,#fbbf24,#f59e0b);border-radius:2px;box-shadow:0 0 18px 6px rgba(251,191,36,0.5),0 0 35px 10px rgba(251,191,36,0.2)');
  // Lichtschein auf Schnee vor Hütte
  _bgEl(c,'position:absolute;bottom:18%;left:50%;transform:translateX(-50%);width:160px;height:30px;background:radial-gradient(ellipse,rgba(251,191,36,0.18) 0%,transparent 70%);filter:blur(8px)');
  // Person in der Tür (Silhouette)
  _bgEl(c,'position:absolute;bottom:18%;left:calc(50% + 2px);width:10px;height:26px;background:rgba(10,5,2,0.9);border-radius:3px 3px 0 0');
  // Schneeflocken (angepasste Farbe für dunklen Hintergrund)
  const sym = ['❄','❅','·','*'];
  for (let i = 0; i < 48; i++) {
    const el = document.createElement('div');
    el.className = 'bg-schnee';
    el.textContent = sym[Math.floor(Math.random()*sym.length)];
    el.style.cssText = `left:${Math.random()*100}%;top:${-Math.random()*100}%;font-size:${8+Math.random()*16}px;color:rgba(200,225,255,0.75);animation-delay:${(Math.random()*12).toFixed(2)}s;animation-duration:${(7+Math.random()*11).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Wald: Üppiger Wald mit Lichtstrahlen ────────────────────
function bgAnimWald() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Sattes Grün, hell oben (Licht), dunkel unten (Waldboden)
  c.style.background = 'linear-gradient(180deg,#a8e6a0 0%,#5abf5a 22%,#2d8b35 50%,#1a5c20 75%,#0f3d14 100%)';
  // Atmosphärisches Himmelslicht von oben
  _bgEl(c,'position:absolute;top:0;left:50%;transform:translateX(-50%);width:100%;height:55%;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,200,0.2) 0%,rgba(180,255,160,0.08) 50%,transparent 80%)');
  // Lichtstrahlen (schräge angewinkelte Streifen)
  [[-25,8,42],[10,22,38],[-15,58,35],[20,78,30],[-30,30,32],[15,50,28],[-10,70,25],[25,15,22]].forEach(([ang,left,op]) => {
    _bgEl(c,`position:absolute;top:-10%;left:${left}%;width:22px;height:150%;background:linear-gradient(180deg,rgba(255,255,180,0.${op}) 0%,rgba(255,255,180,0.0${Math.round(op/3)}) 60%,transparent 100%);transform:rotate(${ang}deg);transform-origin:50% 0%;filter:blur(8px);animation:lichtStrahl ${(3+Math.random()*4).toFixed(1)}s ease-in-out ${(Math.random()*4).toFixed(1)}s infinite`);
  });
  // Waldboden (dunkel mit Gras-Anmutung)
  _bgEl(c,'position:absolute;bottom:0;left:0;right:0;height:22%;background:linear-gradient(180deg,#1a5c20 0%,#0d3a12 100%)');
  // Grashalme-Andeutung
  _bgEl(c,'position:absolute;bottom:18%;left:0;right:0;height:8%;background:linear-gradient(180deg,rgba(80,180,60,0.4) 0%,transparent 100%);filter:blur(3px)');
  // Bäume hinten (hell, weit weg)
  [{x:'2%',w:'10%',h:'62%'},{x:'14%',w:'12%',h:'68%'},{x:'30%',w:'10%',h:'58%'},
   {x:'46%',w:'11%',h:'65%'},{x:'62%',w:'12%',h:'60%'},{x:'76%',w:'10%',h:'63%'},{x:'90%',w:'9%',h:'55%'}
  ].forEach(({x,w,h}) => _bgEl(c,`position:absolute;bottom:20%;left:${x};width:${w};height:${h};background:rgba(40,140,50,0.45);border-radius:48% 52% 18% 18% / 55% 55% 15% 15%;filter:blur(3px)`));
  // Bäume vorne (dunkel, nah)
  [{x:'-2%',w:'14%',h:'55%'},{x:'12%',w:'13%',h:'60%'},{x:'28%',w:'12%',h:'52%'},
   {x:'44%',w:'12%',h:'56%'},{x:'60%',w:'13%',h:'58%'},{x:'76%',w:'12%',h:'50%'},{x:'90%',w:'11%',h:'48%'}
  ].forEach(({x,w,h}) => _bgEl(c,`position:absolute;bottom:20%;left:${x};width:${w};height:${h};background:rgba(15,65,20,0.92);border-radius:45% 55% 10% 10% / 50% 50% 8% 8%`));
  // Schwebende Pollen/Lichtpunkte
  for (let i = 0; i < 30; i++) {
    const sz = 2 + Math.random() * 4;
    _bgEl(c,`position:absolute;left:${Math.random()*100}%;top:${5+Math.random()*70}%;width:${sz}px;height:${sz}px;background:rgba(255,255,200,${0.3+Math.random()*0.4});border-radius:50%;filter:blur(1px);animation:blattFallen ${(8+Math.random()*12).toFixed(1)}s ease-in-out ${(Math.random()*8).toFixed(1)}s infinite`);
  }
  // Blumen am Boden
  ['rgba(255,255,255,0.8)','rgba(255,200,200,0.8)','rgba(255,240,150,0.8)'].forEach(col => {
    for (let i = 0; i < 6; i++) {
      _bgEl(c,`position:absolute;bottom:${18+Math.random()*5}%;left:${Math.random()*100}%;width:4px;height:4px;background:${col};border-radius:50%`);
    }
  });
}

// ── Ozean: Unterwasser von unten ────────────────────────────
function bgAnimOzean() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Unterwasser: dunkel unten, helles Licht von oben (Sonnenlicht durch Wasser)
  c.style.background = 'linear-gradient(180deg,#e0f7ff 0%,#7ad8f0 12%,#2aadce 30%,#0e7a9e 55%,#064d6e 78%,#032838 100%)';
  // Helles Lichtbündel von oben (Sonnenlicht durch Wasser)
  _bgEl(c,'position:absolute;top:0;left:50%;transform:translateX(-50%);width:200px;height:65%;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.85) 0%,rgba(140,230,255,0.4) 30%,rgba(0,180,220,0.1) 65%,transparent 100%);filter:blur(8px)');
  // Kaustik-Lichtflecken (helle Flecken wie Wasserspiegelungen)
  [['38%','18%',40,28],['55%','22%',32,22],['28%','28%',28,20],['65%','15%',35,24],['45%','35%',22,16]].forEach(([l,t,w,h]) => {
    _bgEl(c,`position:absolute;left:${l};top:${t};width:${w}px;height:${h}px;background:rgba(255,255,255,0.15);border-radius:50%;filter:blur(6px)`);
  });
  // Fische in verschiedenen Tiefen/Bahnen
  const fischTiefen = [
    {top:'22%',delay:0,dur:10,sz:1.0,col:'rgba(160,210,240,0.6)'},
    {top:'28%',delay:2,dur:13,sz:0.8,col:'rgba(140,190,220,0.55)'},
    {top:'18%',delay:4,dur:11,sz:1.2,col:'rgba(180,225,250,0.65)'},
    {top:'35%',delay:1,dur:15,sz:0.7,col:'rgba(120,170,200,0.5)'},
    {top:'25%',delay:5,dur:12,sz:0.9,col:'rgba(150,200,235,0.58)'},
    {top:'32%',delay:3,dur:14,sz:1.1,col:'rgba(170,215,245,0.62)'},
  ];
  fischTiefen.forEach(({top,delay,dur,sz,col}) => {
    for (let i = 0; i < 4; i++) {
      const el = document.createElement('div');
      el.className = 'bg-fisch';
      el.style.cssText = `top:calc(${top} + ${i*2}%);width:${14*sz}px;height:${5*sz}px;background:${col};animation-duration:${dur+(i*1.5)}s;animation-delay:${delay+(i*2.5)}s`;
      c.appendChild(el);
    }
  });
  // Aufsteigende Blasen
  for (let i = 0; i < 22; i++) {
    const sz = 4 + Math.random() * 14;
    const el = document.createElement('div');
    el.className = 'bg-blase';
    el.style.cssText = `left:${Math.random()*100}%;width:${sz}px;height:${sz}px;animation-delay:${(Math.random()*10).toFixed(2)}s;animation-duration:${(6+Math.random()*10).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Märchen: Bunte Märchenlandschaft mit Regenbogen ─────────
function bgAnimMaerchen() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Heller blauer Himmel
  c.style.background = 'linear-gradient(180deg,#38bdf8 0%,#7dd3fc 35%,#bae6fd 65%,#e0f7d4 85%,#b8ebb8 100%)';
  // Wolken (weiße blur-Ellipsen)
  [['5%','8%','120px','55px'],['55%','5%','140px','50px'],['30%','15%','90px','40px'],['75%','12%','110px','45px']].forEach(([l,t,w,h]) => {
    _bgEl(c,`position:absolute;left:${l};top:${t};width:${w};height:${h};background:rgba(255,255,255,0.88);border-radius:50%;filter:blur(12px);animation:wolkeDriften ${(8+Math.random()*6).toFixed(1)}s ease-in-out ${(Math.random()*4).toFixed(1)}s infinite`);
  });
  // Regenbogen (konzentrische Halbkreise)
  const regenbogenFarben = [
    ['rgba(239,68,68,0.55)',260],['rgba(249,115,22,0.5)',240],['rgba(234,179,8,0.5)',220],
    ['rgba(34,197,94,0.5)',200],['rgba(59,130,246,0.5)',180],['rgba(139,92,246,0.48)',160]
  ];
  regenbogenFarben.forEach(([col,sz]) => {
    _bgEl(c,`position:absolute;top:5%;right:-${sz/2-60}px;width:${sz}px;height:${sz/2}px;border-radius:${sz/2}px ${sz/2}px 0 0;border:12px solid ${col};border-bottom:none;filter:blur(3px)`);
  });
  // Grüne Hügel
  _bgEl(c,'position:absolute;bottom:0;left:-8%;width:55%;height:35%;background:linear-gradient(180deg,#4ade80 0%,#16a34a 100%);border-radius:65% 75% 0 0/80% 80% 0 0');
  _bgEl(c,'position:absolute;bottom:0;right:-8%;width:50%;height:28%;background:linear-gradient(180deg,#22c55e 0%,#15803d 100%);border-radius:75% 65% 0 0/80% 80% 0 0');
  _bgEl(c,'position:absolute;bottom:0;left:25%;width:52%;height:22%;background:linear-gradient(180deg,#4ade80 0%,#166534 100%);border-radius:50% 55% 0 0/70% 70% 0 0');
  // Rapunzel-Turm (CSS-Rechtecke, kein SVG)
  _bgEl(c,'position:absolute;bottom:20%;left:calc(50% - 16px);width:32px;height:90px;background:linear-gradient(90deg,#d6bfa0,#c4a882,#d6bfa0)');
  _bgEl(c,'position:absolute;bottom:56%;left:calc(50% - 22px);width:44px;height:38px;background:linear-gradient(180deg,#8b6a3e,#6b4e2e);border-radius:50% 50% 0 0/55% 55% 0 0');
  _bgEl(c,'position:absolute;bottom:62%;left:calc(50% + 14px);width:8px;height:24px;background:#6b4e2e;border-radius:2px 2px 0 0');
  _bgEl(c,'position:absolute;bottom:64%;left:calc(50% - 24px);width:8px;height:20px;background:#6b4e2e;border-radius:2px 2px 0 0');
  // Turmfenster
  _bgEl(c,'position:absolute;bottom:35%;left:calc(50% - 8px);width:16px;height:18px;background:rgba(254,240,138,0.9);border-radius:50% 50% 0 0;box-shadow:0 0 10px rgba(253,224,71,0.5)');
  // Rote Blumen am Boden
  for (let i = 0; i < 18; i++) {
    _bgEl(c,`position:absolute;bottom:${18+Math.random()*8}%;left:${Math.random()*100}%;width:${5+Math.random()*5}px;height:${5+Math.random()*5}px;background:hsla(${Math.random()<0.6?0:320},90%,60%,0.8);border-radius:50%`);
  }
  // Glitzer/Funken
  const farben = ['#67e8f9','#86efac','#fde68a','#f9a8d4','#c4b5fd','#fff'];
  for (let i = 0; i < 40; i++) {
    const sz = 2 + Math.random() * 5;
    const el = document.createElement('div');
    el.className = 'bg-funke';
    el.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*80}%;width:${sz}px;height:${sz}px;background:${farben[Math.floor(Math.random()*farben.length)]};animation-delay:${(Math.random()*7).toFixed(2)}s;animation-duration:${(1.5+Math.random()*3).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Glitzer-Gold: Schwarzer Marmor mit Gold-Fluss ───────────
function bgAnimGlitzergold() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Sehr dunkler Marmor-Hintergrund
  c.style.background = 'linear-gradient(135deg,#0a0800 0%,#1a1200 35%,#0d0a00 60%,#150f00 100%)';
  // Dunkel-Marmorstruktur
  _bgEl(c,'position:absolute;inset:0;background:radial-gradient(ellipse at 30% 70%,rgba(40,30,0,0.6) 0%,transparent 55%)');
  _bgEl(c,'position:absolute;inset:0;background:radial-gradient(ellipse at 75% 20%,rgba(25,18,0,0.5) 0%,transparent 50%)');
  // Goldene Haupt-Bänder (diagonal)
  _bgEl(c,'position:absolute;top:-20%;left:20%;width:35%;height:160%;background:linear-gradient(90deg,transparent 0%,rgba(180,130,10,0.12) 20%,rgba(251,191,36,0.55) 45%,rgba(253,224,71,0.65) 50%,rgba(251,191,36,0.55) 55%,rgba(180,130,10,0.12) 80%,transparent 100%);transform:rotate(-20deg);filter:blur(6px)');
  _bgEl(c,'position:absolute;top:-20%;left:48%;width:22%;height:160%;background:linear-gradient(90deg,transparent 0%,rgba(200,150,20,0.08) 15%,rgba(245,158,11,0.35) 40%,rgba(251,191,36,0.45) 50%,rgba(245,158,11,0.35) 60%,transparent 100%);transform:rotate(-18deg);filter:blur(8px)');
  _bgEl(c,'position:absolute;top:-20%;left:5%;width:18%;height:160%;background:linear-gradient(90deg,transparent 5%,rgba(217,119,6,0.2) 35%,rgba(245,158,11,0.38) 50%,rgba(217,119,6,0.2) 65%,transparent 95%);transform:rotate(-22deg);filter:blur(10px)');
  // Silber-Schimmer neben den Goldbändern
  _bgEl(c,'position:absolute;top:-10%;left:18%;width:4%;height:140%;background:linear-gradient(90deg,transparent,rgba(220,220,220,0.18),transparent);transform:rotate(-20deg);filter:blur(4px)');
  _bgEl(c,'position:absolute;top:-10%;left:55%;width:3%;height:140%;background:linear-gradient(90deg,transparent,rgba(200,200,200,0.15),transparent);transform:rotate(-18deg);filter:blur(5px)');
  // Gold-Glitzer-Partikel
  const farben = ['#fbbf24','#f59e0b','#fef9c3','#fde68a','#fff8dc','#fcd34d','#ffffff'];
  for (let i = 0; i < 80; i++) {
    const sz = 1.5 + Math.random() * 5, f = farben[Math.floor(Math.random()*farben.length)];
    const el = document.createElement('div');
    el.className = 'bg-glitzer';
    el.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;background:${f};box-shadow:0 0 ${(sz*2.5).toFixed(0)}px ${f};animation-delay:${(Math.random()*7).toFixed(2)}s;animation-duration:${(0.8+Math.random()*2.5).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Wüste: Wüstenlandschaft mit Mesas ───────────────────────
function bgAnimWueste() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Himmel oben blau/weiß, Wüstenboden orange/rot unten
  c.style.background = 'linear-gradient(180deg,#e8f4fc 0%,#b8daf0 20%,#8bc4e8 38%,#f5c87a 60%,#e8a04a 80%,#d4804a 100%)';
  // Sonne (hell, oben rechts)
  _bgEl(c,'position:absolute;top:3%;right:8%;width:65px;height:65px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.98) 0%,rgba(255,240,180,0.7) 35%,transparent 70%);box-shadow:0 0 50px 15px rgba(255,220,100,0.45),0 0 100px 30px rgba(255,200,80,0.2)');
  // Himmel-Haze
  _bgEl(c,'position:absolute;top:35%;left:0;right:0;height:8%;background:rgba(245,200,120,0.25);filter:blur(8px)');
  // Mesas/Felsformationen – verschiedene Formen
  [
    {l:'-2%',w:'18%',h:'52%',b:12,col:'#8b3d1a'},
    {l:'8%',w:'12%',h:'40%',b:12,col:'#a04820'},
    {l:'68%',w:'16%',h:'48%',b:12,col:'#8b3d1a'},
    {l:'80%',w:'14%',h:'38%',b:12,col:'#963d18'},
    {l:'90%',w:'12%',h:'55%',b:12,col:'#7a3015'},
  ].forEach(({l,w,h,b,col}) => {
    _bgEl(c,`position:absolute;bottom:${b}%;left:${l};width:${w};height:${h};background:linear-gradient(90deg,${col}dd,${col} 30%,${col}bb 70%,${col}99);border-radius:6px 6px 0 0`);
    // Schattierung oben
    _bgEl(c,`position:absolute;bottom:calc(${b}% + ${h});left:${l};width:${w};height:8px;background:rgba(0,0,0,0.2);border-radius:4px 4px 0 0;transform:translateY(100%)`);
  });
  // Sandboden
  _bgEl(c,'position:absolute;bottom:0;left:0;right:0;height:14%;background:linear-gradient(180deg,#d4804a 0%,#c06830 100%)');
  // Sandkörner-Textur (kleine Punkte)
  for (let i = 0; i < 8; i++) {
    _bgEl(c,`position:absolute;bottom:${2+Math.random()*10}%;left:${Math.random()*100}%;width:${20+Math.random()*30}px;height:3px;background:rgba(180,100,50,0.3);border-radius:50%;filter:blur(2px)`);
  }
  // Kakteen
  [{l:'22%'},{l:'38%'},{l:'55%'},{l:'42%'}].forEach(({l},i) => {
    const h = 35 + i*8;
    // Kaktus-Stamm
    _bgEl(c,`position:absolute;bottom:12%;left:${l};width:8px;height:${h}px;background:linear-gradient(90deg,#2d6b2d,#3a8a3a,#2d6b2d);border-radius:3px`);
    // Linker Arm
    _bgEl(c,`position:absolute;bottom:calc(12% + ${h*0.45}px);left:calc(${l} - 14px);width:14px;height:7px;background:#3a8a3a;border-radius:3px 0 0 3px`);
    _bgEl(c,`position:absolute;bottom:calc(12% + ${h*0.45+7}px);left:calc(${l} - 14px);width:7px;height:${h*0.28}px;background:#3a8a3a;border-radius:3px 3px 0 0`);
    // Rechter Arm
    _bgEl(c,`position:absolute;bottom:calc(12% + ${h*0.55}px);left:calc(${l} + 8px);width:14px;height:7px;background:#3a8a3a;border-radius:0 3px 3px 0`);
    _bgEl(c,`position:absolute;bottom:calc(12% + ${h*0.55+7}px);left:calc(${l} + 8px);width:7px;height:${h*0.22}px;background:#3a8a3a;border-radius:3px 3px 0 0`);
  });
  // Hitzeflimmern am Boden
  _bgEl(c,'position:absolute;bottom:12%;left:0;right:0;height:5%;background:rgba(255,200,100,0.08);filter:blur(6px);animation:lichtStrahl 2.5s ease-in-out infinite');
}

// ── Sonnenschein: Riesige Nahaufnahme der Sonne ──────────────
function bgAnimSonnenschein() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Dunkler Weltraum
  c.style.background = 'radial-gradient(ellipse at 70% 50%,#1a0800 0%,#0d0400 50%,#000000 100%)';
  // Sonnen-Korona-Glow (mehrere konzentrische Leucht-Ringe)
  _bgEl(c,'position:absolute;bottom:-40%;left:-30%;width:200%;height:200%;border-radius:50%;background:radial-gradient(circle,rgba(255,120,0,0.04) 0%,rgba(255,80,0,0.08) 30%,rgba(200,50,0,0.06) 55%,transparent 75%)');
  // Sonnen-Hauptkörper (riesig, links-mitte bis raus)
  _bgEl(c,'position:absolute;bottom:-20%;left:-35%;width:180%;height:180%;border-radius:50%;background:radial-gradient(circle at 45% 45%,rgba(255,255,200,0.95) 0%,rgba(255,220,80,0.9) 10%,rgba(255,160,20,0.85) 22%,rgba(240,100,10,0.8) 38%,rgba(200,60,5,0.75) 55%,rgba(140,30,0,0.5) 70%,transparent 85%);animation:sonnePulse 5s ease-in-out infinite');
  // Sonnenoberfläche – helle Granulations-Flecken
  [['40%','35%',40,35,'rgba(255,240,120,0.55)'],['55%','48%',55,45,'rgba(255,200,60,0.4)'],
   ['25%','50%',38,30,'rgba(255,220,100,0.45)'],['38%','60%',45,35,'rgba(255,180,40,0.38)'],
   ['50%','38%',30,25,'rgba(255,250,180,0.5)'],['30%','42%',35,28,'rgba(255,210,80,0.42)'],
   ['46%','55%',42,33,'rgba(255,195,50,0.38)'],['35%','50%',50,40,'rgba(255,230,100,0.35)']
  ].forEach(([l,t,w,h,col]) => _bgEl(c,`position:absolute;left:${l};top:${t};width:${w}px;height:${h}px;background:${col};border-radius:50%;filter:blur(14px);animation:sonnePulse ${(3+Math.random()*4).toFixed(1)}s ease-in-out ${(Math.random()*3).toFixed(1)}s infinite`));
  // Solar-Flare rechts oben
  _bgEl(c,'position:absolute;top:5%;left:35%;width:80px;height:30px;background:rgba(255,180,30,0.35);border-radius:0 50% 50% 0;filter:blur(10px);transform:rotate(-30deg)');
}

// ── Herbst: Roter Herbstbaum beim Sonnenuntergang ────────────
function bgAnimHerbst() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Dramatischer Himmel: gelb/weiß links (Sonne), blau Mitte, orange/rot rechts
  c.style.background = 'linear-gradient(90deg,rgba(255,230,80,0.9) 0%,rgba(255,200,60,0.7) 12%,rgba(200,150,40,0.8) 28%,rgba(50,50,100,0.85) 50%,rgba(120,60,20,0.8) 70%,rgba(180,60,20,0.85) 85%,rgba(140,30,10,0.9) 100%)';
  // Sonne-Aura links
  _bgEl(c,'position:absolute;top:0;left:-5%;width:55%;height:100%;background:radial-gradient(ellipse at 15% 50%,rgba(255,220,60,0.35) 0%,rgba(255,180,40,0.12) 40%,transparent 65%)');
  // Dramatische Wolken (dunkle Streifen)
  _bgEl(c,'position:absolute;top:8%;left:20%;width:60%;height:18%;background:rgba(80,50,20,0.35);border-radius:50%;filter:blur(12px)');
  _bgEl(c,'position:absolute;top:20%;left:5%;width:40%;height:12%;background:rgba(60,40,10,0.25);border-radius:50%;filter:blur(10px)');
  // Dunkler Boden/Feld
  _bgEl(c,'position:absolute;bottom:0;left:0;right:0;height:14%;background:linear-gradient(180deg,#1a0c05 0%,#0d0602 100%)');
  _bgEl(c,'position:absolute;bottom:12%;left:0;right:0;height:4%;background:rgba(60,25,10,0.5);filter:blur(4px)');
  // Baum-Stamm rechts
  _bgEl(c,'position:absolute;bottom:14%;left:calc(65% - 10px);width:20px;height:55%;background:linear-gradient(180deg,#2d1505,#1a0c03);border-radius:6px 6px 2px 2px');
  // Äste
  _bgEl(c,'position:absolute;bottom:52%;left:calc(65% - 50px);width:45px;height:8px;background:#2d1505;border-radius:4px;transform:rotate(-40deg);transform-origin:100% 50%');
  _bgEl(c,'position:absolute;bottom:58%;left:calc(65% - 30px);width:35px;height:7px;background:#2d1505;border-radius:4px;transform:rotate(-20deg);transform-origin:100% 50%');
  _bgEl(c,'position:absolute;bottom:62%;left:calc(65% + 10px);width:40px;height:7px;background:#2d1505;border-radius:4px;transform:rotate(25deg);transform-origin:0% 50%');
  _bgEl(c,'position:absolute;bottom:56%;left:calc(65% + 8px);width:30px;height:7px;background:#2d1505;border-radius:4px;transform:rotate(50deg);transform-origin:0% 50%');
  // Baumkrone (dichte rote Ellipsen, malerisch durch Überlappung)
  [['38%','8%','36%','28%','rgba(180,20,10,0.92)'],
   ['55%','5%','30%','26%','rgba(200,30,10,0.88)'],
   ['44%','22%','32%','24%','rgba(160,15,8,0.85)'],
   ['62%','18%','28%','22%','rgba(190,25,10,0.82)'],
   ['36%','2%','26%','20%','rgba(140,10,5,0.78)'],
   ['66%','8%','24%','20%','rgba(170,20,8,0.80)'],
   ['48%','30%','26%','18%','rgba(150,12,6,0.75)'],
  ].forEach(([l,t,w,h,col]) => _bgEl(c,`position:absolute;left:${l};top:${t};width:${w};height:${h};background:${col};border-radius:50%;filter:blur(11px)`));
  // Menschliche Silhouetten am Fuß des Baums
  _bgEl(c,'position:absolute;bottom:14%;left:calc(60% - 14px);width:8px;height:22px;background:rgba(5,2,0,0.95);border-radius:4px 4px 0 0');
  _bgEl(c,'position:absolute;bottom:14%;left:calc(70% + 6px);width:8px;height:18px;background:rgba(5,2,0,0.9);border-radius:4px 4px 0 0');
  // Fallende rote/orange Blätter
  const herbstFarben = ['rgba(200,40,10,0.85)','rgba(220,80,10,0.8)','rgba(180,120,15,0.8)','rgba(230,50,10,0.75)','rgba(200,30,5,0.85)'];
  for (let i = 0; i < 45; i++) {
    const sz = 6 + Math.random() * 10;
    const el = document.createElement('div');
    el.className = 'bg-blatt';
    el.style.cssText = `left:${Math.random()*100}%;top:${-Math.random()*80}%;width:${sz}px;height:${sz}px;background:${herbstFarben[Math.floor(Math.random()*herbstFarben.length)]};border-radius:${Math.random()<0.5?'50% 0 50% 0':'30% 70% 30% 70%'};animation-delay:${(Math.random()*10).toFixed(2)}s;animation-duration:${(5+Math.random()*9).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Retro: Retrowave Neon-Gaming-Atmosphäre ─────────────────
function bgAnimRetro() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Dunkles Violett/Navy
  c.style.background = 'linear-gradient(180deg,#0d0818 0%,#130a22 50%,#1a0a2e 100%)';
  // Neon-Glows an Rändern
  _bgEl(c,'position:absolute;top:-20%;left:-20%;width:60%;height:60%;background:radial-gradient(circle,rgba(180,40,220,0.2) 0%,transparent 65%)');
  _bgEl(c,'position:absolute;bottom:-20%;right:-20%;width:55%;height:55%;background:radial-gradient(circle,rgba(220,20,180,0.18) 0%,transparent 65%)');
  _bgEl(c,'position:absolute;top:20%;right:-10%;width:40%;height:40%;background:radial-gradient(circle,rgba(0,220,255,0.12) 0%,transparent 65%)');
  // Retrowave-Grid (Boden-Perspektive)
  _bgEl(c,'position:absolute;bottom:0;left:0;right:0;height:35%;overflow:hidden;perspective:200px', `
    <div style="position:absolute;bottom:0;left:-20%;right:-20%;height:100%;background:repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(180,0,220,0.18) 20px,rgba(180,0,220,0.18) 21px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(180,0,220,0.15) 30px,rgba(180,0,220,0.15) 31px);transform:rotateX(55deg);transform-origin:50% 100%"></div>`);
  // Horizont-Linie
  _bgEl(c,'position:absolute;bottom:33%;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(220,0,255,0.7) 20%,rgba(0,220,255,0.7) 80%,transparent);box-shadow:0 0 10px rgba(200,0,255,0.5)');
  // CRT-Bildschirm in der Mitte oben
  _bgEl(c,'position:absolute;top:6%;left:50%;transform:translateX(-50%);width:90px;height:70px;background:#0a0a14;border:3px solid rgba(50,50,80,0.8);border-radius:8px;box-shadow:0 0 20px rgba(0,255,0,0.15)',
    '<div style="position:absolute;inset:4px;background:rgba(0,80,0,0.6);border-radius:4px;box-shadow:inset 0 0 20px rgba(0,200,0,0.3)"><div style="position:absolute;top:25%;left:10%;right:10%;height:2px;background:rgba(0,255,0,0.5);box-shadow:0 8px 0 rgba(0,255,0,0.3),0 16px 0 rgba(0,255,0,0.2)"></div></div>');
  // Scanlines
  _bgEl(c,'position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0px,rgba(0,0,0,0) 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px);pointer-events:none');
  // Schwebende Pixel-Blöcke
  const pixelFarben = ['rgba(255,0,200,0.7)','rgba(0,220,255,0.65)','rgba(180,0,255,0.6)','rgba(0,255,160,0.55)'];
  for (let i = 0; i < 20; i++) {
    const sz = 4 + Math.random() * 8;
    const el = document.createElement('div');
    el.className = 'bg-pixel';
    el.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*70}%;width:${sz}px;height:${sz}px;background:${pixelFarben[Math.floor(Math.random()*pixelFarben.length)]};box-shadow:0 0 6px currentColor;animation-delay:${(Math.random()*6).toFixed(2)}s;animation-duration:${(1.5+Math.random()*3).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Midnight Drive: Tokio Nacht Anime-Szene ──────────────────
function bgAnimMidnight() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Dunkles Nacht-Navy
  c.style.background = 'linear-gradient(180deg,#060c1a 0%,#0a1228 45%,#0d1530 75%,#101830 100%)';
  // Sterne
  for (let i = 0; i < 55; i++) {
    _bgEl(c,`position:absolute;left:${Math.random()*100}%;top:${Math.random()*45}%;width:${1+Math.random()*1.5}px;height:${1+Math.random()*1.5}px;background:rgba(220,230,255,${0.3+Math.random()*0.5});border-radius:50%`);
  }
  // Gebäude-Silhouetten (Hintergrund, verschieden hoch)
  [{l:'0%',w:'14%',h:'45%'},{l:'10%',w:'10%',h:'38%'},{l:'18%',w:'12%',h:'52%'},{l:'28%',w:'8%',h:'35%'},
   {l:'55%',w:'12%',h:'48%'},{l:'65%',w:'10%',h:'40%'},{l:'74%',w:'13%',h:'55%'},{l:'85%',w:'10%',h:'37%'},{l:'93%',w:'9%',h:'44%'}
  ].forEach(({l,w,h}) => {
    _bgEl(c,`position:absolute;bottom:22%;left:${l};width:${w};height:${h};background:rgba(10,15,30,0.92);border-radius:2px 2px 0 0`);
    // Leuchtendes Fenster
    for (let i = 0; i < 3+Math.floor(Math.random()*4); i++) {
      _bgEl(c,`position:absolute;bottom:calc(22% + ${5+Math.random()*40}%);left:calc(${l} + ${Math.random()*8}%);width:${3+Math.random()*4}px;height:${3+Math.random()*4}px;background:rgba(${Math.random()<0.5?'255,220,120':'200,220,255'},0.8);animation:gebaeudeLicht ${(2+Math.random()*4).toFixed(1)}s ease-in-out ${(Math.random()*3).toFixed(1)}s infinite`);
    }
  });
  // Neon-Glows (pink und cyan, wie die Schilder im Bild)
  _bgEl(c,'position:absolute;top:8%;left:48%;width:100px;height:22px;background:rgba(180,0,220,0.6);border-radius:4px;box-shadow:0 0 20px 5px rgba(180,0,220,0.4),0 0 40px rgba(180,0,220,0.2)');
  _bgEl(c,'position:absolute;top:14%;left:50%;width:80px;height:14px;background:rgba(0,200,220,0.55);border-radius:3px;box-shadow:0 0 16px 4px rgba(0,200,220,0.35)');
  _bgEl(c,'position:absolute;top:22%;left:20%;width:65px;height:18px;background:rgba(220,30,80,0.6);border-radius:3px;box-shadow:0 0 18px 4px rgba(220,30,80,0.35)');
  // Neon-Reflektionen auf der Straße
  _bgEl(c,'position:absolute;bottom:14%;left:45%;width:90px;height:6px;background:rgba(180,0,220,0.3);filter:blur(4px);border-radius:50%');
  _bgEl(c,'position:absolute;bottom:12%;left:18%;width:60px;height:4px;background:rgba(220,30,80,0.25);filter:blur(5px);border-radius:50%');
  // Straße
  _bgEl(c,'position:absolute;bottom:0;left:0;right:0;height:23%;background:linear-gradient(180deg,#1a1e2e 0%,#141828 100%)');
  // Straßenmitte-Linie
  _bgEl(c,'position:absolute;bottom:10%;left:0;right:0;height:2px;background:repeating-linear-gradient(90deg,rgba(255,220,100,0.5) 0px,rgba(255,220,100,0.5) 30px,transparent 30px,transparent 55px)');
  // Auto-Scheinwerfer-Glow
  _bgEl(c,'position:absolute;bottom:22%;left:25%;width:50px;height:18px;background:rgba(255,230,100,0.5);border-radius:50%;filter:blur(8px)');
  _bgEl(c,'position:absolute;bottom:22%;left:30%;width:50px;height:18px;background:rgba(255,230,100,0.5);border-radius:50%;filter:blur(8px)');
  // Regen
  for (let i = 0; i < 38; i++) {
    const el = document.createElement('div');
    el.className = 'bg-regen';
    el.style.cssText = `left:${Math.random()*100}%;top:${-Math.random()*100}%;height:${12+Math.random()*14}px;animation-delay:${(Math.random()*2).toFixed(2)}s;animation-duration:${(0.6+Math.random()*0.5).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Dark City: Dunkle Stadt von unten ───────────────────────
function bgAnimDarkCity() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Fast schwarz
  c.style.background = 'radial-gradient(ellipse at 50% 30%,#1a1a1a 0%,#080808 50%,#020202 100%)';
  // Zentrales Licht (helles Weiß oben-mitte, wie Vanishing Point)
  _bgEl(c,'position:absolute;top:0;left:50%;transform:translateX(-50%);width:200px;height:60%;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.35) 0%,rgba(200,200,200,0.12) 30%,transparent 70%);filter:blur(12px)');
  _bgEl(c,'position:absolute;top:0;left:50%;transform:translateX(-50%);width:80px;height:40%;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.6) 0%,transparent 70%)');
  // Gebäude links (konvergieren nach oben = clip-path Trapeze)
  [{l:'0%',br:'38%',h:'88%',col:'rgba(18,18,18,0.98)'},{l:'8%',br:'28%',h:'82%',col:'rgba(22,22,22,0.95)'},
   {l:'16%',br:'20%',h:'75%',col:'rgba(26,26,26,0.92)'},{l:'23%',br:'14%',h:'68%',col:'rgba(30,30,30,0.9)'}
  ].forEach(({l,br,h,col},i) => {
    const w = 10 - i*1.5;
    _bgEl(c,`position:absolute;bottom:0;left:${l};width:${w}%;height:${h};background:${col};clip-path:polygon(${8+i*5}% 0%,${100-8-i*5}% 0%,100% 100%,0% 100%)`);
  });
  // Gebäude rechts (gespiegelt)
  [{r:'0%',h:'85%',col:'rgba(18,18,18,0.98)'},{r:'8%',h:'78%',col:'rgba(22,22,22,0.95)'},
   {r:'16%',h:'72%',col:'rgba(26,26,26,0.92)'},{r:'23%',h:'65%',col:'rgba(30,30,30,0.9)'}
  ].forEach(({r,h,col},i) => {
    const w = 10 - i*1.5;
    _bgEl(c,`position:absolute;bottom:0;right:${r};width:${w}%;height:${h};background:${col};clip-path:polygon(${8+i*5}% 0%,${100-8-i*5}% 0%,100% 100%,0% 100%)`);
  });
  // Fenster in Gebäuden
  for (let i = 0; i < 30; i++) {
    const side = Math.random() < 0.5;
    const col = Math.random() < 0.3 ? 'rgba(255,200,100,0.7)' : 'rgba(220,230,255,0.55)';
    _bgEl(c,`position:absolute;bottom:${10+Math.random()*75}%;${side?'left':'right'}:${Math.random()*25}%;width:${2+Math.random()*3}px;height:${2+Math.random()*4}px;background:${col};animation:gebaeudeLicht ${(3+Math.random()*5).toFixed(1)}s ease-in-out ${(Math.random()*4).toFixed(1)}s infinite`);
  }
  // Nebel-Band in der Mitte
  _bgEl(c,'position:absolute;top:45%;left:0;right:0;height:12%;background:rgba(40,40,40,0.35);filter:blur(15px)');
  // Regen (dichter als bei Midnight)
  for (let i = 0; i < 55; i++) {
    const el = document.createElement('div');
    el.className = 'bg-regen';
    el.style.cssText = `left:${Math.random()*100}%;top:${-Math.random()*100}%;height:${10+Math.random()*12}px;background:linear-gradient(180deg,transparent,rgba(180,190,200,0.45));animation-delay:${(Math.random()*2).toFixed(2)}s;animation-duration:${(0.5+Math.random()*0.4).toFixed(2)}s`;
    c.appendChild(el);
  }
}

// ── Chrome: Silberne Metallflammen ───────────────────────────
function bgAnimChrome() {
  const c = document.getElementById('bgAnimContainer');
  if (!c) return;
  // Reines Schwarz
  c.style.background = '#000000';
  // Subtiler Hintergrundglow
  _bgEl(c,'position:absolute;inset:0;background:radial-gradient(ellipse at 40% 55%,rgba(50,50,60,0.4) 0%,transparent 65%)');
  // Chrome-Flammen (große blob-artige Formen mit clip-path)
  const flammen = [
    // [left, top, width, height, gradientFrom, gradientTo, rotation, delay, duration]
    ['5%','20%','38%','65%','#e2e8f0','#64748b','-15deg',0,9],
    ['30%','5%','42%','70%','#ffffff','#94a3b8','10deg',1.5,11],
    ['55%','25%','35%','60%','#cbd5e1','#475569','-8deg',0.5,8],
    ['18%','55%','40%','50%','#f1f5f9','#7c8ea6','12deg',2,10],
    ['62%','10%','30%','55%','#e8edf2','#5a6b7d','-20deg',1,12],
  ];
  flammen.forEach(([l,t,w,h,c1,c2,rot,del,dur]) => {
    _bgEl(c,`position:absolute;left:${l};top:${t};width:${w};height:${h};background:linear-gradient(135deg,${c1} 0%,${c2} 45%,rgba(200,210,220,0.3) 75%,transparent 100%);clip-path:polygon(50% 0%,90% 15%,100% 40%,85% 70%,95% 90%,60% 100%,30% 95%,10% 75%,0% 50%,15% 20%);filter:blur(2px);transform:rotate(${rot});animation:chromBewegen ${dur}s ease-in-out ${del}s infinite`);
    // Metallic Highlight
    _bgEl(c,`position:absolute;left:${l};top:${t};width:calc(${w} * 0.3);height:calc(${h} * 0.4);background:linear-gradient(135deg,rgba(255,255,255,0.65) 0%,rgba(255,255,255,0.1) 60%,transparent 100%);clip-path:polygon(40% 5%,90% 20%,80% 55%,20% 40%);filter:blur(4px);transform:rotate(${rot});animation:chromBewegen ${dur}s ease-in-out ${del}s infinite`);
  });
  // Glitzer-Partikel (silber/weiß)
  for (let i = 0; i < 35; i++) {
    const sz = 1.5 + Math.random() * 4;
    const el = document.createElement('div');
    el.className = 'bg-glitzer';
    el.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;background:rgba(255,255,255,0.9);box-shadow:0 0 ${(sz*2.5).toFixed(0)}px rgba(255,255,255,0.7);animation-delay:${(Math.random()*6).toFixed(2)}s;animation-duration:${(0.8+Math.random()*2).toFixed(2)}s`;
    c.appendChild(el);
  }
}

const SKIN_DEFAULTS_CANVAS = 'linear-gradient(145deg, #f8faff 0%, #eef2ff 100%)';

function skinsPruefen() {
  const p = zustand.prestige;
  for (const skin of SKINS) {
    if (p >= skin.minPrestige && !zustand.skins.freigeschaltet.includes(skin.id)) {
      zustand.skins.freigeschaltet.push(skin.id);
      if (typeof toastZeigen === 'function') toastZeigen(`🎨 Skin freigeschaltet: ${skin.name}!`);
    }
  }
  // Aktiven Skin anwenden
  const aktiverSkin = SKINS.find(s => s.id === (zustand.skins?.aktiv || 'standard')) || SKINS[0];
  skinAnwenden(aktiverSkin);
}

function skinModalRendern() {
  const grid = document.getElementById('skinGrid');
  grid.innerHTML = '';

  for (const skin of SKINS) {
    const freigeschaltet = zustand.skins.freigeschaltet.includes(skin.id);
    const aktiv = zustand.skins.aktiv === skin.id;
    const el = document.createElement('div');
    el.className = `skin-karte${aktiv ? ' aktiv' : ''}${freigeschaltet ? '' : ' gesperrt'}`;

    const vorschau = document.createElement('div');
    vorschau.className = 'skin-vorschau';
    if (freigeschaltet) {
      // Hintergrund zeigt Theme-Farbe + Pixel-Farbe als Gradient
      const themeBg = skin.theme?.['--bg'] || '#f0f7ff';
      const pixelFarbe = skin.farben[0];
      vorschau.style.background = `linear-gradient(135deg, ${themeBg} 50%, ${pixelFarbe} 50%)`;
      vorschau.style.border = `2px solid ${skin.theme?.['--border'] || '#dde6f5'}`;
    } else {
      vorschau.style.background = '#e2e8f0';
    }
    el.appendChild(vorschau);

    el.innerHTML += `
      <div class="skin-name">${skin.name}</div>
      <div class="skin-anforderung">${freigeschaltet ? (aktiv ? '✓ Aktiv' : 'Klicken zum Aktivieren') : `Prestige ${skin.minPrestige}`}</div>`;

    if (freigeschaltet) {
      el.addEventListener('click', () => {
        zustand.skins.aktiv = skin.id;
        skinAnwenden(skin);
        skinModalRendern();
        haufeInitialisieren();
        spielstandSpeichern(false);
      });
    }

    grid.appendChild(el);
  }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  GOLDENE PIXEL + EREIGNISSE                             ║
// ╚══════════════════════════════════════════════════════════╝

let goldenTimerId = null;
let ereignisTimerId = null;
let aktivesGoldElement = null;

function goldenIntervallMs() {
  let ms = 240000; // 4 Minuten Basis
  for (const upId of zustand.prestigeUpgrades) {
    const up = PRESTIGE_UPGRADES.find(u => u.id === upId);
    if (up?.typ === 'qp_golden_freq') ms /= up.wert;
  }
  if (zustand.prestige >= 5) ms *= 0.8;
  // Talent: Goldener Sinn (2× häufiger pro Stufe)
  const goldFreq = talentLevel('tal_prod_gold');
  if (goldFreq > 0) ms /= Math.pow(2, goldFreq);
  return Math.max(ms, 30000);
}

function goldenPixelSpawnen() {
  if (aktivesGoldElement) return;

  const el = document.createElement('div');
  el.className = 'goldener-pixel';

  const x = 60 + Math.random() * (window.innerWidth - 120);
  const y = 80 + Math.random() * (window.innerHeight - 160);
  el.style.left = x + 'px';
  el.style.top = y + 'px';

  el.addEventListener('click', () => goldenPixelKlicken(el));
  document.getElementById('goldenLayer').appendChild(el);
  aktivesGoldElement = el;

  setTimeout(() => {
    if (aktivesGoldElement === el) {
      el.remove();
      aktivesGoldElement = null;
    }
  }, 30000);

  goldenTimerId = setTimeout(goldenPixelSpawnen, goldenIntervallMs());
}

function goldenPixelKlicken(el) {
  el.remove();
  aktivesGoldElement = null;
  zustand.goldenPixelKlicks++;

  let bonus = berechneteStats.pps * 15 * 60; // 15 Minuten Produktion
  if (zustand.prestige >= 15) bonus *= 2;
  for (const upId of zustand.prestigeUpgrades) {
    const up = PRESTIGE_UPGRADES.find(u => u.id === upId);
    if (up?.typ === 'qp_golden_bonus') bonus *= up.wert;
  }
  // Talent: Goldgier (+50% pro Stufe)
  const goldBonus = talentLevel('tal_sp_golden');
  if (goldBonus > 0) bonus *= (1 + goldBonus * 0.50);

  zustand.pixel += bonus;
  zustand.lifetimePixel += bonus;
  if (typeof toastZeigen === 'function') toastZeigen(`⭐ Goldener Pixel! +${fmt(bonus)} Pixel`);
  errungenschaftenPruefen();
}

const EREIGNISSE = [
  { name: 'Produktionsboost', text: '⚡ Produktionsboost! 2× PpS für 60 Sek.', dauer: 60000, ppsM: 2, ppkM: 1 },
  { name: 'Klick-Boost',      text: '👆 Klick-Boost! 10× PpK für 30 Sek.',     dauer: 30000, ppsM: 1, ppkM: 10 },
  { name: 'Pixel-Regen',      text: '🌧 Pixel-Regen! +5% Pixel sofort.',         dauer: 0,     ppsM: 1, ppkM: 1, sofort: (z) => { const b = z.pixel * 0.05; z.pixel += b; z.lifetimePixel += b; } },
];

function ereignisIntervallMs() {
  let ms = 420000; // 7 Minuten
  if (zustand.prestige >= 5)  ms *= 0.7;
  if (zustand.prestige >= 10) ms *= 0.7;
  return Math.max(ms, 60000);
}

function zufaelligesEreignis() {
  const e = EREIGNISSE[Math.floor(Math.random() * EREIGNISSE.length)];
  const banner = document.getElementById('ereignisBanner');

  if (e.sofort) {
    e.sofort(zustand);
  } else if (e.dauer > 0) {
    aktiveBoosts.ppsMultiplikator = e.ppsM;
    aktiveBoosts.ppkMultiplikator = e.ppkM;
    aktiveBoosts.endeMs = Date.now() + e.dauer;
  }

  banner.textContent = e.text;
  banner.hidden = false;
  setTimeout(() => { banner.hidden = true; }, 5000);
  if (typeof toastZeigen === 'function') toastZeigen(e.text);

  ereignisTimerId = setTimeout(zufaelligesEreignis, ereignisIntervallMs());
}

function ereignisseStarten() {
  goldenTimerId = setTimeout(goldenPixelSpawnen, goldenIntervallMs());
  ereignisTimerId = setTimeout(zufaelligesEreignis, ereignisIntervallMs());
}

// ╔══════════════════════════════════════════════════════════╗
// ║  ERRUNGENSCHAFTEN + TOAST                               ║
// ╚══════════════════════════════════════════════════════════╝

function errungenschaftenPruefen() {
  for (const e of ERRUNGENSCHAFTEN) {
    if (zustand.errungenschaften.includes(e.id)) continue;
    try {
      if (e.pruefe(zustand)) {
        zustand.errungenschaften.push(e.id);
        toastZeigen(`${e.icon} Errungenschaft: ${e.name}`);
      }
    } catch (_) { /* Prüfung schlägt still fehl */ }
  }
}

function toastZeigen(text) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function errungenschaftenModalRendern() {
  const grid = document.getElementById('errungenschaftenGrid');
  grid.innerHTML = '';

  const gesamt = ERRUNGENSCHAFTEN.length;
  const erreicht = zustand.errungenschaften.length;
  const header = document.createElement('div');
  header.style.cssText = 'grid-column:1/-1;margin-bottom:8px;font-size:0.85rem;color:var(--text-muted)';
  header.textContent = `${erreicht} / ${gesamt} freigeschaltet`;
  grid.appendChild(header);

  for (const e of ERRUNGENSCHAFTEN) {
    const freigeschaltet = zustand.errungenschaften.includes(e.id);
    const el = document.createElement('div');
    el.className = `errungenschaft-karte ${freigeschaltet ? 'freigeschaltet' : 'gesperrt'}`;
    el.innerHTML = `
      <div class="errungenschaft-icon">${e.icon}</div>
      <div class="errungenschaft-name">${freigeschaltet ? e.name : '???'}</div>
      <div class="errungenschaft-text">${e.text}</div>`;
    grid.appendChild(el);
  }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  SUPABASE SPEICHERN / LADEN                             ║
// ╚══════════════════════════════════════════════════════════╝

async function spielstandSpeichern(mitToast = true) {
  if (adminModus) { if (mitToast) toastZeigen('⚙ Test-Modus – kein Speichern'); return; }
  const user = await PZ.getUser();
  if (!user) {
    if (mitToast) toastZeigen('⚠ Nicht eingeloggt – Spielstand nicht gespeichert');
    return;
  }

  zustand.letzterBesuch = Date.now();

  // _speedrunStart ist nur Laufzeit, nicht speichern
  const { _speedrunStart, ...zustandZumSpeichern } = zustand;

  await PZ.saveGameData(
    'pixel-factory',
    Math.floor(zustand.lifetimePixel),
    zustand.prestige,
    zustandZumSpeichern
  );

  if (mitToast) toastZeigen('💾 Gespeichert!');
}

async function spielstandLaden() {
  const daten = await PZ.loadScore('pixel-factory');
  if (!daten || !daten.extra_daten) return false;

  // Gespeicherten Zustand mit Standard zusammenführen (neue Felder ergänzen)
  const standard = standardZustand();
  zustand = { ...standard, ...daten.extra_daten, _speedrunStart: Date.now() };

  // Offline-Bonus berechnen
  const jetzt = Date.now();
  const deltaMs = Math.max(0, jetzt - (zustand.letzterBesuch || jetzt));
  const maxMs = maxOfflineStunden() * 3600 * 1000;
  const bonusMs = Math.min(deltaMs, maxMs);

  if (bonusMs > 60000) {
    statsNeuBerechnen();
    const bonus = berechneteStats.pps * (bonusMs / 1000) * 0.5; // 50 % Offline-Effizienz
    if (bonus > 0) {
      zustand.pixel += bonus;
      zustand.lifetimePixel += bonus;
      zustand._offlineBonusErhalten = true;

      const minuten = Math.floor(bonusMs / 60000);
      const banner = document.getElementById('offlineBonus');
      banner.textContent = `💤 Offline-Bonus: +${fmt(bonus)} Pixel (${minuten} Minuten)`;
      banner.hidden = false;
      setTimeout(() => { banner.hidden = true; }, 8000);
    }
  }

  zustand.letzterBesuch = jetzt;
  return true;
}

// ╔══════════════════════════════════════════════════════════╗
// ║  RANGLISTE                                              ║
// ╚══════════════════════════════════════════════════════════╝

let ranglisteAktivTab = 'pixel';

async function ranglisteRendern() {
  const inhalt = document.getElementById('ranglisteInhalt');
  inhalt.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted)">Lade…</div>';

  const eintraege = await PZ.getLeaderboard('pixel-factory', 10);
  const eigenerUser = await PZ.getUser();
  const eigenerId = eigenerUser?.id;

  if (!eintraege.length) {
    inhalt.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted)">Noch keine Einträge</div>';
    return;
  }

  // Prestige-Tab: client-seitig nach level sortieren
  let sortiert = [...eintraege];
  if (ranglisteAktivTab === 'prestige') {
    sortiert.sort((a, b) => (b.level || 0) - (a.level || 0));
  }

  const hauptSpalte = ranglisteAktivTab === 'prestige' ? 'Prestige' : 'Pixel';
  const nebenSpalte = ranglisteAktivTab === 'prestige' ? 'Pixel' : 'Prestige';

  let html = `<table class="rangliste-tabelle">
    <thead><tr>
      <th>#</th><th>Spieler</th><th>${hauptSpalte}</th><th>${nebenSpalte}</th>
    </tr></thead><tbody>`;

  sortiert.forEach((e, i) => {
    const rang = i + 1;
    const klasse = rang === 1 ? 'rang-1' : rang === 2 ? 'rang-2' : rang === 3 ? 'rang-3' : '';
    const eigenKlasse = e.user_id === eigenerId ? ' rang-eigen' : '';
    const hauptwert = ranglisteAktivTab === 'prestige'
      ? (e.level || 0)
      : fmt(e.punkte || 0);
    const nebenwert = ranglisteAktivTab === 'prestige'
      ? fmt(e.punkte || 0)
      : (e.level || 0);
    const medal = rang === 1 ? '🥇' : rang === 2 ? '🥈' : rang === 3 ? '🥉' : rang;
    html += `<tr class="${klasse}${eigenKlasse}">
      <td>${medal}</td>
      <td>${e.username || 'Anonym'}</td>
      <td>${hauptwert}</td>
      <td>${nebenwert}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  inhalt.innerHTML = html;
}

// ╔══════════════════════════════════════════════════════════╗
// ║  INITIALISIERUNG                                        ║
// ╚══════════════════════════════════════════════════════════╝

// ╔══════════════════════════════════════════════════════════╗
// ║  ADMIN-PANEL (nur für Admin im Test-Modus)              ║
// ╚══════════════════════════════════════════════════════════╝

let adminModus = false;

function adminPanelZeigen() {
  const panel = document.getElementById('adminPanel');
  if (panel) panel.style.display = 'block';
}

function adminPanelInit() {
  const panel = document.getElementById('adminPanel');
  if (!panel) return;

  panel.querySelector('#adm-pixel-btn').addEventListener('click', () => {
    const v = Number(panel.querySelector('#adm-pixel').value);
    if (!isNaN(v)) { zustand.pixel = v; zustand.lifetimePixel = Math.max(zustand.lifetimePixel, v); renderStats(); }
  });
  panel.querySelector('#adm-prestige-btn').addEventListener('click', () => {
    const v = Number(panel.querySelector('#adm-prestige').value);
    if (!isNaN(v)) { zustand.prestige = v; skinsPruefen(); statsNeuBerechnen(); shopRendern(); prestigeBtnAktualisieren(); }
  });
  panel.querySelector('#adm-qp-btn').addEventListener('click', () => {
    const v = Number(panel.querySelector('#adm-qp').value);
    if (!isNaN(v)) { zustand.quantumPixel = v; renderStats(); }
  });
  panel.querySelector('#adm-talente-btn').addEventListener('click', () => {
    const v = Number(panel.querySelector('#adm-talente').value);
    if (!isNaN(v)) { zustand.talentPunkte = v; talentBadgeAktualisieren(); }
  });
  panel.querySelector('#adm-alle-upgrades').addEventListener('click', () => {
    UPGRADES.forEach(u => { if (!zustand.upgrades.includes(u.id)) zustand.upgrades.push(u.id); });
    statsNeuBerechnen(); shopRendern(); toastZeigen('✓ Alle Upgrades freigeschaltet');
  });
  panel.querySelector('#adm-alle-skins').addEventListener('click', () => {
    SKINS.forEach(s => { if (!zustand.skins.freigeschaltet.includes(s.id)) zustand.skins.freigeschaltet.push(s.id); });
    toastZeigen('✓ Alle Skins freigeschaltet');
  });
  panel.querySelector('#adm-alle-err').addEventListener('click', () => {
    ERRUNGENSCHAFTEN.forEach(e => { if (!zustand.errungenschaften.includes(e.id)) zustand.errungenschaften.push(e.id); });
    toastZeigen('✓ Alle Errungenschaften freigeschaltet');
  });
  panel.querySelector('#adm-alle-talente').addEventListener('click', () => {
    TALENTE.forEach(t => { zustand.talente[t.id] = t.maxLevel; });
    statsNeuBerechnen(); talentBadgeAktualisieren(); toastZeigen('✓ Alle Talente auf Maximum');
  });
  panel.querySelector('#adm-vorspulen-btn').addEventListener('click', () => {
    const stunden = Number(panel.querySelector('#adm-vorspulen').value) || 1;
    const bonus = berechneteStats.pps * stunden * 3600;
    zustand.pixel += bonus; zustand.lifetimePixel += bonus;
    renderStats(); toastZeigen(`⏩ +${fmt(bonus)} Pixel (${stunden}h)`);
  });
  panel.querySelector('#adm-toggle').addEventListener('click', () => {
    const body = panel.querySelector('.adm-body');
    body.style.display = body.style.display === 'none' ? 'block' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await PZ.updateNavbar();

  // Tutorial-Buttons
  document.getElementById('tutWeiter').addEventListener('click', () => {
    if (tutorialSchritt < TUTORIAL_SCHRITTE.length - 1) {
      tutorialSchritt++;
      tutorialSchrittRendern();
    } else {
      tutorialSchliessen();
    }
  });
  document.getElementById('tutSkip').addEventListener('click', tutorialSchliessen);

  // Admin-Modus prüfen
  const adminUser = await PZ.getUser();
  adminModus = !!(adminUser?.id === '1dcb3181-9132-4cd0-b3ef-550742a5309d' && new URLSearchParams(location.search).has('admin'));
  if (adminModus) { adminPanelZeigen(); }

  // Spielstand laden (im Admin-Modus frischen Zustand, kein echtes Speichern)
  if (adminModus) {
    zustand = standardZustand();
    zustand.pixel = 1e9;
    zustand.lifetimePixel = 1e12;
    zustand.quantumPixel = 100;
    zustand.prestige = 5;
    zustand.talentPunkte = 20;
    if (!zustand.talente) zustand.talente = {};
    zustand.talente['tal_root'] = 1;
  } else {
    const geladen = await spielstandLaden();
    if (!geladen) zustand = standardZustand();
  }

  statsNeuBerechnen();
  skinsPruefen(); // skinsPruefen ruft auch skinAnwenden auf
  haufeInitialisieren();
  shopRendern();
  errungenschaftenPruefen();
  prestigeBtnAktualisieren();
  talentBadgeAktualisieren();

  // Canvas – Klick + Touch
  const canvas = document.getElementById('pixelHaufen');
  canvas.addEventListener('click', klickHandler);
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    klickHandler(e.changedTouches?.[0] || e);
  }, { passive: false });

  // Prestige
  document.getElementById('prestigeBtn').addEventListener('click', prestigeDurchfuehren);

  // Prestige Bestätigungs-Modal
  document.getElementById('prestigeConfirmJa').addEventListener('click', () => {
    const qpGewinn = Number(document.getElementById('prestigeConfirmModal').dataset.qp);
    document.getElementById('prestigeConfirmModal').classList.add('versteckt');
    prestigeAnimationZeigen(qpGewinn, () => prestigeAusfuehren(qpGewinn));
  });
  document.getElementById('prestigeConfirmNein').addEventListener('click', () => {
    document.getElementById('prestigeConfirmModal').classList.add('versteckt');
  });

  // Rangliste
  document.getElementById('ranglisteBtn').addEventListener('click', () => {
    document.getElementById('ranglisteModal').classList.remove('versteckt');
    ranglisteRendern();
  });
  document.getElementById('ranglisteSchliessen').addEventListener('click', () => {
    document.getElementById('ranglisteModal').classList.add('versteckt');
  });
  document.querySelectorAll('.rl-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.rl-tab').forEach(t => t.classList.remove('aktiv'));
      tab.classList.add('aktiv');
      ranglisteAktivTab = tab.dataset.rl;
      ranglisteRendern();
    });
  });

  // Errungenschaften
  document.getElementById('errungenschaftenBtn').addEventListener('click', () => {
    errungenschaftenModalRendern();
    document.getElementById('errungenschaftenModal').classList.remove('versteckt');
  });
  document.getElementById('errungenschaftenSchliessen').addEventListener('click', () => {
    document.getElementById('errungenschaftenModal').classList.add('versteckt');
  });

  // Talente
  document.getElementById('talentBtn').addEventListener('click', () => {
    talentModalRendern();
    document.getElementById('talentModal').classList.remove('versteckt');
  });
  document.getElementById('talentSchliessen').addEventListener('click', () => {
    document.getElementById('talentModal').classList.add('versteckt');
  });

  // Skins
  document.getElementById('skinBtn').addEventListener('click', () => {
    skinModalRendern();
    document.getElementById('skinModal').classList.remove('versteckt');
  });
  document.getElementById('skinSchliessen').addEventListener('click', () => {
    document.getElementById('skinModal').classList.add('versteckt');
  });

  // Modal-Hintergrund klick schließt Modal
  document.querySelectorAll('.modal-hintergrund').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.add('versteckt');
    });
  });

  // Shop-Tabs
  document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', () => shopTabAktivieren(tab.dataset.tab));
  });

  // Bulk-Kauf Buttons
  document.querySelectorAll('.bulk-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bulk-btn').forEach(b => b.classList.remove('aktiv'));
      btn.classList.add('aktiv');
      bulkMenge = Number(btn.dataset.menge);
      shopGebaeudeRendern();
    });
  });

  // Game Loop starten
  spielGestartet = true;
  loopId = requestAnimationFrame(gameLoop);

  // Ereignisse starten
  ereignisseStarten();

  // Tutorial bei erstem Start zeigen
  tutorialZeigen();

  // Admin-Panel Buttons initialisieren (falls Admin-Modus)
  if (adminModus) adminPanelInit();

  // Autosave alle 30 Sekunden (nicht im Admin-Modus)
  if (!adminModus) {
    setInterval(async () => {
      await spielstandSpeichern(false);
      const ind = document.getElementById('autosaveInd');
      if (ind) {
        ind.classList.add('sichtbar');
        setTimeout(() => ind.classList.remove('sichtbar'), 2000);
      }
    }, 30000);
  }

  // Beim Verlassen: letzterBesuch aktualisieren damit Offline-Bonus stimmt
  window.addEventListener('beforeunload', () => {
    zustand.letzterBesuch = Date.now();
  });
});
