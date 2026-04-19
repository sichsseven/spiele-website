# Pixel Drop — Design-Dokument
**Datum:** 2026-04-03  
**Status:** Genehmigt

---

## Übersicht

Pixel Drop ist ein Browser-Puzzle-Spiel: Mischung aus Block Blast und Tetris mit Pixel-Physik. Blöcke werden per Drag & Drop ins Spielfeld gezogen, zerfallen beim Aufprall in Einzel-Pixel, die physikalisch fallen und rutschen. Wenn eine Farbe eine durchgehende Verbindung von links nach rechts bildet, verschwinden diese Pixel.

---

## 1. Dateien & Architektur

```
games/pixel-drop/
├── index.html   ← Screens, HUD, Block-Panel
├── game.js      ← Spiellogik, Physik, Rendering
└── style.css    ← Layout, HUD, Screens
```

**Technologie:** Vanilla HTML/CSS/JS (ES6+), kein Framework, kein Build-Tool.  
**Rendering:** Ein `<canvas>` für das Spielfeld. HUD und Block-Panel sind normales HTML.  
**Game Loop:** `requestAnimationFrame`, Kommentare auf Deutsch.

### Layout

```
┌────────────────────────────────────────┐
│   HUD: 👑 Score | Fortschritt | 🔄 ⚙  │
├───────────────────────┬────────────────┤
│                       │   [ Block 1 ]  │
│   Spielfeld-Canvas    │   [ Block 2 ]  │
│   (10 × 20)           │   [ Block 3 ]  │
│                       │                │
└───────────────────────┴────────────────┘
```

Hintergrund außerhalb des Spielfelds: cremeweiß `#fafaf8`.  
Spielfeld-Hintergrund: dunkles Blau `#1a1a2e` mit sichtbarem Gitter.

---

## 2. Spielfeld-Grid & Pixel-Physik

### Grid
- 2D-Array: `gitter[zeile][spalte]`, 20 Zeilen × 10 Spalten
- Jede Zelle: `null` (leer) oder Farbstring (`'rot'` | `'gruen'` | `'blau'` | `'orange'`)
- Zellgröße: dynamisch berechnet (~30–36px), passt sich an Bildschirmgröße an

### Pixel-Farben
| Name    | Hex       |
|---------|-----------|
| rot     | `#ef4444` |
| gruen   | `#22c55e` |
| blau    | `#3b82f6` |
| orange  | `#f97316` |

### Physik-Schritt (pro Frame, 3–4 Durchläufe, von unten nach oben)
1. Hat die Zelle einen Pixel?
2. Zelle darunter frei → Pixel fällt eine Zeile
3. Sonst: diagonal-unten-links **oder** diagonal-unten-rechts frei → Pixel rutscht (zufällig bei zwei freien Seiten)
4. Sonst: Pixel liegt fest

`physikLaeuft()` gibt `true` zurück solange noch Pixel in Bewegung sind.

### Gefahrenlinie
- Zeile 1 (zweite Zeile von oben) = rote Markierung
- Nach Physik-Ende: Pixel in Zeile 0 → Game Over

---

## 3. Block-System

### Formen (17 gesamt)
**Tetris-Tetrominoes (7):** I, O, T, S, Z, J, L  
**Extra-Formen (10):** 1×1, 1×2, 1×3, 2×2, 3×3, kleines L (3 Zellen), kleines T, Plus-Form, Diagonal-L, 2×3-Rechteck

Jeder Block hat eine zufällige der 4 Farben.

### Block-Panel
- Immer 3 Blöcke sichtbar (rechts neben dem Spielfeld)
- Neue 3 kommen sobald alle 3 platzierten Blöcke ins Grid eingetragen wurden
- Panel-Blöcke sind mini-Vorschauen (~3× kleiner als Grid-Zellen)

### Drag & Drop
1. Spieler drückt auf Block im Panel → Block klebt am Cursor/Finger
2. Während Ziehen: halbtransparenter Ghost im Grid (eingerastet auf Spalten)
3. Loslassen über Spielfeld: Block wird oben an Ghost-Spalte ins Grid eingetragen
4. Loslassen außerhalb: Block springt zurück ins Panel
5. Spalten-Einrastung: Block schiebt sich automatisch nach links wenn er über den rechten Rand ragt

### Block-Zerfall
Beim Platzieren werden alle Zellen des Blocks direkt ins `gitter` eingetragen (oben, an der Drop-Spalte). Ab dann läuft die normale Pixel-Physik — kein separater Animations-Layer.

---

## 4. Farben-Verbindungs-Check

**Timing:** Läuft nach jedem Physik-Schritt sobald `physikLaeuft() === false`.

**Algorithmus (BFS) für jede Farbe:**
1. Startpunkte: alle Pixel dieser Farbe in Spalte 0
2. BFS mit 8-er Nachbarschaft (horizontal, vertikal, diagonal)
3. Erreicht ein Pixel aus dieser Gruppe Spalte 9 → Verbindung gefunden
4. Nur die Pixel dieser verbundenen Gruppe werden entfernt
5. Isolierte Pixel derselben Farbe (kein Kontakt zur Verbindung) bleiben

**Nach dem Entfernen:**
- Physik startet erneut
- Nach Physik-Ende: erneuter Verbindungs-Check (Kettenreaktionen möglich)
- Erst wenn kein Check mehr auslöst: Spieler darf neuen Block ziehen

---

## 5. Punkte-System

| Ereignis | Punkte |
|----------|--------|
| Pixel verschwinden | Anzahl × 10 |
| 2 Farben gleichzeitig | × 1.5 Multiplikator |
| 3 Farben gleichzeitig | × 2.0 Multiplikator |
| 4 Farben gleichzeitig | × 3.0 Multiplikator |

**Fortschritts-Meilensteine:** 500 / 1.500 / 3.000 / 5.000 / 10.000 Punkte  
Fortschrittsleiste im HUD zeigt aktuellen Stand zum nächsten Meilenstein.

---

## 6. HUD

| Position | Inhalt |
|----------|--------|
| Links | 👑 + Score (groß) |
| Mitte | Fortschrittsleiste + „X / Y"-Anzeige |
| Rechts | 🔄 Neustart-Button, ⚙ Einstellungen-Button |

---

## 7. Game Over

**Bedingungen:**
1. Ein Pixel landet in Zeile 0 (über der Gefahrenlinie)
2. Keiner der 3 aktuellen Blöcke passt mehr ins Spielfeld

**Game-Over-Overlay:**
- Titel „GAME OVER"
- Aktueller Score + persönlicher Highscore
- Button „Nochmal spielen"
- Button „🏆 Rangliste"

---

## 8. Rangliste

- Eigener Screen (wie andere Spiele)
- Laden: `PZ.getLeaderboard('pixel-drop', 10)` → Top 10
- Speichern: `PZ.saveGameData('pixel-drop', score, wave, extra_daten)`
- Benutzername automatisch aus Login (kein Name-Prompt)
- Spalten: Platz / Name / Punkte
- Login-Hinweis wenn nicht angemeldet

---

## 9. Technische Randbedingungen

- Kein `var`, nur `const`/`let`
- Game Loop mit `requestAnimationFrame`, nie `setInterval`
- Mobile-first, Touch + Mouse Events
- `user-select: none` + `touch-action: none` auf Canvas
- Supabase via `PZ.*`-Wrapper (bereits in `../../auth.js`)
- Keine externen Libraries
