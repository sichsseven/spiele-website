import { formatGameNumber } from './GameState.js';
import { fetchLeaderboard, getCurrentUserId } from './necroSupabase.js';

/** @type {'bones' | 'clicks'} */
let currentCategory = 'bones';

/**
 * @param {HTMLElement} row
 * @param {number} rank
 */
function applyRankStyle(row, rank) {
  row.classList.remove(
    'leaderboard-row--gold',
    'leaderboard-row--silver',
    'leaderboard-row--bronze',
  );
  if (rank === 1) row.classList.add('leaderboard-row--gold');
  else if (rank === 2) row.classList.add('leaderboard-row--silver');
  else if (rank === 3) row.classList.add('leaderboard-row--bronze');
}

export async function refreshLeaderboard() {
  const listEl = document.getElementById('leaderboard-list');
  const hintEl = document.getElementById('leaderboard-login-hint');
  const uiEl = document.getElementById('leaderboard-ui');
  if (!listEl || !hintEl || !uiEl) return;

  const session = await getCurrentUserId();
  if (!session) {
    hintEl.hidden = false;
    uiEl.hidden = true;
    listEl.innerHTML = '';
    return;
  }

  hintEl.hidden = true;
  uiEl.hidden = false;

  listEl.innerHTML = '<p class="leaderboard-loading">Lade Ruhmeshalle…</p>';

  const rows = await fetchLeaderboard(currentCategory);
  const selfId = session.userId;

  listEl.innerHTML = '';
  if (rows.length === 0) {
    listEl.innerHTML = '<p class="leaderboard-empty">Noch keine Einträge.</p>';
    return;
  }

  for (const row of rows) {
    const el = document.createElement('div');
    el.className = 'leaderboard-row';
    el.dataset.userId = row.user_id;
    if (row.user_id === selfId) el.classList.add('leaderboard-row--self');

    applyRankStyle(el, row.rank);

    const rankSpan = document.createElement('span');
    rankSpan.className = 'leaderboard-rank';
    rankSpan.textContent = `#${row.rank}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'leaderboard-name';
    nameSpan.textContent = row.benutzername || '?';

    const valSpan = document.createElement('span');
    valSpan.className = 'leaderboard-value';
    const val =
      currentCategory === 'clicks'
        ? formatGameNumber(row.lifetime_clicks)
        : formatGameNumber(row.bones);
    valSpan.textContent = val;

    el.appendChild(rankSpan);
    el.appendChild(nameSpan);
    el.appendChild(valSpan);
    listEl.appendChild(el);
  }
}

export function initLeaderboardTab() {
  const buttons = document.querySelectorAll('.leaderboard-cat-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat === 'clicks' ? 'clicks' : 'bones';
      currentCategory = cat;
      buttons.forEach((b) => {
        b.classList.toggle('leaderboard-cat-btn--active', b.dataset.cat === cat);
      });
      void refreshLeaderboard();
    });
  });
}
