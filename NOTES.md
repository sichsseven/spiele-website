# NOTES.md — Fortschrittsprotokoll

## Heutiger Stand (2026-04-01)

### Was heute gemacht wurde
- CLAUDE.md aktualisiert mit Design-Richtlinien und Ordnerstruktur-Standard
- Alle 6 Spieldateien in `games/[name]/index.html` verschoben
- Back-Links in den Spielen auf `../../index.html` angepasst
- Startseite komplett neu gestaltet: Hellblau-Theme statt Dark-Theme
- CSS in externe `style.css` ausgelagert
- `.gitignore` angelegt
- **Task 6: Alte flache .html-Dateien gelöscht** (doodle-jump.html, blockfall.html, arkanoid.html, space-blaster.html, neon-runner.html, memory-match.html)
- Commit `152c4dc` gepusht

### Startseiten-Redesign (2026-04-01, zweite Runde)
- Hero-Bereich, Suchleiste, Kategorie-Filter und Statistik-Leiste entfernt
- Header zeigt nur noch Logo + orangener „Anmelden"-Button
- Spielegrid folgt direkt nach dem Header
- Thumbnail-Hintergründe: dunkel → helle Pastellfarben
- style.css: alle ungenutzten Sektionen bereinigt (~340 Zeilen entfernt)
- Commit `1d6d59a` gepusht

### Supabase-Datensynchronisation (2026-04-01)
- auth.js: neue `saveGameData()` Funktion — Highscore nur bei Verbesserung, extra_daten immer
- Alle 6 Spiele: JSONBin entfernt, Supabase eingebunden
- Alle 6 Spiele: `initPlayer()` lädt Coins/Skins/Upgrades aus Supabase beim Start
- Alle 6 Spiele: `endGame()` speichert via `PZ.saveGameData()` (asynchron, nicht-blockierend)
- Alle 6 Spiele: Rangliste aus `PZ.getLeaderboard()`
- Alle 6 Spiele: Namenseingabe entfernt — Benutzername kommt vom Login
- Alle 6 Spiele: Login-Hinweis bei Game Over wenn nicht angemeldet
- Doodle Jump: Upgrades in extra_daten, direkter Spielstart ohne Name-Screen
- Neon Runner: bestDist in extra_daten
- Commit `5901f9f` gepusht

**Voraussetzung Supabase:** Die RPC-Funktion `get_leaderboard(p_spiel, p_limit)` muss in der Supabase-Datenbank existieren und die Felder `benutzername` + `punkte` zurückgeben.

### Was als nächstes zu tun ist
- Supabase: `get_leaderboard` RPC-Funktion prüfen/anlegen falls noch nicht vorhanden
- Spieldateien in `index.html` + `game.js` + `style.css` aufteilen (CLAUDE.md-Ziel)
- Neues Spiel hinzufügen (Snake steht noch aus)

### Veränderte Dateien
- `index.html` — komplett neu (zweimal: erst Hellblau-Redesign, dann Vereinfachung)
- `style.css` — neu erstellt, dann bereinigt
- `NOTES.md` — neu erstellt
- `.gitignore` — neu erstellt
- `games/doodle-jump/index.html` — neu (verschoben)
- `games/blockfall/index.html` — neu (verschoben, Back-Link gefixt)
- `games/arkanoid/index.html` — neu (verschoben, Back-Link gefixt)
- `games/space-blaster/index.html` — neu (verschoben, Back-Link gefixt)
- `games/neon-runner/index.html` — neu (verschoben, Back-Link gefixt)
- `games/memory-match/index.html` — neu (verschoben, Back-Link gefixt)
