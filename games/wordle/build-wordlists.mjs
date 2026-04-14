/**
 * Einmaliges Skript: erzeugt wordlists.js aus Hunspell + Häufigkeitsliste.
 * Aufruf: node build-wordlists.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIC_FILES = [
  '_de_DE_frami.dic',
  '_de_AT_frami.dic',
  '_de_CH_frami.dic',
].map((f) => path.join(__dirname, f));

const FREQ = path.join(__dirname, '_de_50k.txt');
const BLOCK_FILE = path.join(__dirname, 'block-loesung.txt');

function loadBlockLoesung() {
  if (!fs.existsSync(BLOCK_FILE)) return new Set();
  const raw = fs.readFileSync(BLOCK_FILE, 'utf8');
  const s = new Set();
  for (const line of raw.split(/\r?\n/)) {
    const w = line.split('#')[0].trim();
    if (!w || w.startsWith('#')) continue;
    if (w.length !== 5) continue;
    if (!/^[A-Za-z]{5}$/.test(w)) continue;
    s.add(w.toUpperCase());
  }
  return s;
}

function parseHunspell5AsciiFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const found = new Set();
  const re5 = /^[A-Za-z]{5}$/;
  for (let i = 1; i < lines.length; i++) {
    let w = lines[i].split('/')[0].split('\t')[0].trim();
    if (!w || w.length !== 5) continue;
    if (!re5.test(w)) continue;
    if (/[äöüÄÖÜß]/.test(w)) continue;
    found.add(w.toUpperCase());
  }
  return found;
}

function parseHunspell5AsciiAll() {
  const valid = new Set();
  for (const f of DIC_FILES) {
    if (!fs.existsSync(f)) continue;
    for (const w of parseHunspell5AsciiFile(f)) valid.add(w);
  }
  return valid;
}

function loadFrequencyOrder() {
  const raw = fs.readFileSync(FREQ, 'utf8');
  const words = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const w = line.split(/\s+/)[0].toLowerCase();
    if (w) words.push(w);
  }
  return words;
}

const BLOCK_LOESUNG = loadBlockLoesung();

const valid = parseHunspell5AsciiAll();
valid.add('LEGAT');

const freq = loadFrequencyOrder();
const loesung = [];
const seenL = new Set();

for (const w of freq) {
  if (w.length !== 5) continue;
  if (!/^[a-z]{5}$/.test(w)) continue;
  if (/[äöüß]/.test(w)) continue;
  const W = w.toUpperCase();
  if (!valid.has(W)) continue;
  if (BLOCK_LOESUNG.has(W)) continue;
  if (seenL.has(W)) continue;
  seenL.add(W);
  loesung.push(W);
  if (loesung.length >= 680) break;
}

if (!loesung.includes('LEGAT')) loesung.push('LEGAT');

const gueltigArr = [...valid].sort();

let out = `'use strict';
// Automatisch generiert (build-wordlists.mjs): Hunspell de_DE_frami, nur 5 Buchstaben A–Z
// LOESUNGSWOERTER: häufige Alltagswörter (Reihenfolge Korpus), mind. 600 Einträge
// GUELTIGE_WOERTER: erweiterte gültige deutsche Rätselformen

const LOESUNGSWOERTER = ${JSON.stringify(loesung)};

const GUELTIGE_WOERTER_ARRAY = ${JSON.stringify(gueltigArr)};

const GUELTIGE_WOERTER = new Set(GUELTIGE_WOERTER_ARRAY);
`;

fs.writeFileSync(path.join(__dirname, 'wordlists.js'), out, 'utf8');
console.log('Hunspell 5-buchstabig A–Z:', valid.size);
console.log('Lösungswörter:', loesung.length);
console.log('wordlists.js geschrieben.');
