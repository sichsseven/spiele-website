# NOTES.md — Fortschrittsprotokoll

## Heutiger Stand (2026-04-02)

### Was heute gemacht wurde
- `doodle-jump` überall in `pixel-jump` umbenannt:
  - Ordner `games/doodle-jump/` → `games/pixel-jump/`
  - `index.html`: Kommentar, onclick-Pfad, Kartentitel
  - `style.css`: `.t-doodle` → `.t-pixel`
  - `games/pixel-jump/index.html`: `<title>`, Anzeige-Titel, alle 4 Spiel-Namen in PZ-Aufrufen
- Login-Design (`login.html`) auf helles Theme umgestellt:
  - Hintergrund `#f0f7ff`, weiße Card, dunkler Text — passend zur Hauptseite
  - Kein dunkles `#0d0d12` mehr
  - Input-Fokus jetzt blau statt orange
- Alle 6 Spieldateien aufgeteilt in `index.html` + `game.js` + `style.css`

### Früherer Stand (2026-04-01)

#### Was damals gemacht wurde
- CLAUDE.md aktualisiert mit Design-Richtlinien und Ordnerstruktur-Standard
- Alle 6 Spieldateien in `games/[name]/index.html` verschoben
- Back-Links in den Spielen auf `../../index.html` angepasst
- Startseite komplett neu gestaltet: Hellblau-Theme statt Dark-Theme
- CSS in externe `style.css` ausgelagert
- `.gitignore` angelegt
- **Task 6: Alte flache .html-Dateien gelöscht** (doodle-jump.html, blockfall.html, arkanoid.html, space-blaster.html, neon-runner.html, memory-match.html)
- Commit `152c4dc` gepusht

#### Startseiten-Redesign (2026-04-01, zweite Runde)
- Hero-Bereich, Suchleiste, Kategorie-Filter und Statistik-Leiste entfernt
- Header zeigt nur noch Logo + orangener „Anmelden"-Button
- Spielegrid folgt direkt nach dem Header
- Thumbnail-Hintergründe: dunkel → helle Pastellfarben
- style.css: alle ungenutzten Sektionen bereinigt (~340 Zeilen entfernt)
- Commit `1d6d59a` gepusht

#### Supabase-Datensynchronisation (2026-04-01)
- auth.js: neue `saveGameData()` Funktion — Highscore nur bei Verbesserung, extra_daten immer
- Alle 6 Spiele: JSONBin entfernt, Supabase eingebunden
- Alle 6 Spiele: `initPlayer()` lädt Coins/Skins/Upgrades aus Supabase beim Start
- Alle 6 Spiele: `endGame()` speichert via `PZ.saveGameData()` (asynchron, nicht-blockierend)
- Alle 6 Spiele: Rangliste aus `PZ.getLeaderboard()`
- Alle 6 Spiele: Namenseingabe entfernt — Benutzername kommt vom Login
- Alle 6 Spiele: Login-Hinweis bei Game Over wenn nicht angemeldet
- Pixel Jump (ehem. Doodle Jump): Upgrades in extra_daten, direkter Spielstart ohne Name-Screen
- Neon Runner: bestDist in extra_daten
- Commit `5901f9f` gepusht

**Supabase `get_leaderboard` RPC:** Bereits in `supabase/migrations/20260101000000_initial.sql` definiert und deployed. Kein weiterer Handlungsbedarf.

### Was als nächstes zu tun ist
- Neues Spiel hinzufügen (nach Bedarf)

### Veränderte Dateien (2026-04-02)
- `index.html` — Pixel Jump statt Doodle Jump, CSS-Klasse `.t-pixel`
- `style.css` — `.t-doodle` → `.t-pixel`
- `login.html` — komplett neues helles Design
- `games/pixel-jump/` — umbenannt aus `games/doodle-jump/`
- `games/pixel-jump/index.html` — Titel + spiel_name auf `pixel-jump`
- `games/pixel-jump/style.css` — neu extrahiert
- `games/pixel-jump/game.js` — neu extrahiert
- `games/space-blaster/style.css` — neu extrahiert
- `games/space-blaster/game.js` — neu extrahiert
- `games/blockfall/style.css` — neu extrahiert
- `games/blockfall/game.js` — neu extrahiert
- `games/memory-match/style.css` — neu extrahiert
- `games/memory-match/game.js` — neu extrahiert
- `games/arkanoid/style.css` — neu extrahiert
- `games/arkanoid/game.js` — neu extrahiert
- `games/neon-runner/style.css` — neu extrahiert
- `games/neon-runner/game.js` — neu extrahiert
- `NOTES.md` — aktualisiert
