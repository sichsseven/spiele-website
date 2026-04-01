// ══════════════════════════════════════════════════════════
//  PIXELZONE — Auth & Spielstand System
//  Einbinden: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
//             <script src="auth.js"></script>
// ══════════════════════════════════════════════════════════

const PZ_URL = 'https://mgvcxszzhxrvftqnizjm.supabase.co';
const PZ_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndmN4c3p6aHhydmZ0cW5pemptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjYzMjIsImV4cCI6MjA5MDM0MjMyMn0.ccuwZQxMyuJC69i4rzFE2FyxvhcHQdAC5T9w0HhD2bg';

const PZ = {
  db: null,

  // ── Init ────────────────────────────────────────────────
  init() {
    this.db = supabase.createClient(PZ_URL, PZ_KEY);
    return this;
  },

  // ── Helpers ─────────────────────────────────────────────
  emailFrom(username) {
    return `${username.trim().toLowerCase()}@pixelzone.gg`;
  },

  // ── Auth ────────────────────────────────────────────────

  /**
   * Neuen Account erstellen.
   * @param {string} username  3-20 Zeichen, a-z A-Z 0-9 _
   * @param {string} password  Min. 6 Zeichen
   * @returns {{ error?: string, username?: string }}
   */
  async register(username, password) {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return { error: 'Benutzername: 3–20 Zeichen, nur Buchstaben, Zahlen und _' };
    }
    if (password.length < 6) {
      return { error: 'Passwort muss mindestens 6 Zeichen haben.' };
    }

    const email = this.emailFrom(username);

    // Sign up
    const { data, error } = await this.db.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'Benutzername bereits vergeben.' };
      }
      return { error: error.message };
    }

    // Create profile
    const { error: profErr } = await this.db
      .from('profiles')
      .insert({ user_id: data.user.id, benutzername: username });

    if (profErr) {
      if (profErr.code === '23505') return { error: 'Benutzername bereits vergeben.' };
      return { error: 'Profil konnte nicht erstellt werden.' };
    }

    return { username };
  },

  /**
   * Einloggen.
   * @returns {{ error?: string, session?: object }}
   */
  async login(username, password) {
    const email = this.emailFrom(username);
    const { data, error } = await this.db.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Falscher Benutzername oder Passwort.' };
    return { session: data.session };
  },

  /**
   * Ausloggen.
   */
  async logout() {
    await this.db.auth.signOut();
  },

  /**
   * Aktuelle Session holen.
   * @returns {object|null}
   */
  async getSession() {
    const { data } = await this.db.auth.getSession();
    return data?.session || null;
  },

  /**
   * Eingeloggten User holen.
   * @returns {object|null}
   */
  async getUser() {
    const session = await this.getSession();
    return session?.user || null;
  },

  /**
   * Benutzername aus Profil laden.
   * @param {string} userId
   * @returns {string|null}
   */
  async getUsername(userId) {
    const { data } = await this.db
      .from('profiles')
      .select('benutzername')
      .eq('user_id', userId)
      .single();
    return data?.benutzername || null;
  },

  /**
   * Schnell: Benutzername des aktuellen Users.
   * @returns {string|null}
   */
  async currentUsername() {
    const user = await this.getUser();
    if (!user) return null;
    return this.getUsername(user.id);
  },

  // ── Spielstände ─────────────────────────────────────────

  /**
   * Spielstand + alle Spieldaten speichern.
   * Highscore (punkte) wird nur aktualisiert wenn der neue Wert HÖHER ist.
   * extra_daten (Coins, Skins, Upgrades usw.) wird IMMER gespeichert.
   * @param {string} spielName  z.B. 'space-blaster', 'blockfall'
   * @param {number} punkte     Punktzahl dieser Runde
   * @param {number} level      Level dieser Runde
   * @param {object} extraDaten Coins, Skins, Upgrades etc. als JSON
   * @returns {{ error?: string, isNewRecord?: boolean }}
   */
  async saveGameData(spielName, punkte, level = 1, extraDaten = {}) {
    const user = await this.getUser();
    if (!user) return { error: 'Nicht eingeloggt.' };

    const existing = await this.loadScore(spielName);
    const isNewRecord = !existing || punkte > (existing.punkte || 0);

    // Highscore nur anheben, nie senken
    const finalPunkte = isNewRecord ? punkte : (existing?.punkte || 0);
    const finalLevel  = isNewRecord ? level  : (existing?.level  || level);

    const { error } = await this.db
      .from('spielstaende')
      .upsert(
        {
          user_id:     user.id,
          spiel_name:  spielName,
          punkte:      finalPunkte,
          level:       finalLevel,
          extra_daten: extraDaten,
          updated_at:  new Date().toISOString(),
        },
        { onConflict: 'user_id,spiel_name' }
      );

    return { error: error?.message, isNewRecord };
  },

  /**
   * Spielstand speichern (Upsert — überschreibt nur wenn punkte HÖHER).
   * @deprecated Bitte saveGameData() verwenden.
   */
  async saveScore(spielName, punkte, level = 1, extraDaten = {}) {
    return this.saveGameData(spielName, punkte, level, extraDaten);
  },

  /**
   * Eigenen Spielstand laden.
   * @param {string} spielName
   * @returns {object|null}
   */
  async loadScore(spielName) {
    const user = await this.getUser();
    if (!user) return null;

    const { data } = await this.db
      .from('spielstaende')
      .select('*')
      .eq('user_id', user.id)
      .eq('spiel_name', spielName)
      .single();

    return data || null;
  },

  /**
   * Rangliste für ein Spiel (Top 10).
   * @param {string} spielName
   * @param {number} limit
   * @returns {Array}
   */
  async getLeaderboard(spielName, limit = 10) {
    const { data } = await this.db.rpc('get_leaderboard', {
      p_spiel: spielName,
      p_limit: limit,
    });
    return data || [];
  },

  // ── Navbar Integration ───────────────────────────────────

  /**
   * Navbar-Auth-Bereich aktualisieren.
   * Erwartet ein Element mit id="navAuth" in der Seite.
   */
  async updateNavbar() {
    const el = document.getElementById('navAuth');
    if (!el) return;

    const session = await this.getSession();

    if (session) {
      const username = await this.getUsername(session.user.id);
      el.innerHTML = `
        <div class="nav-user">
          <span class="nav-avatar">👾</span>
          <span class="nav-username">${this._esc(username || 'Spieler')}</span>
          <button class="nav-logout-btn" id="pzLogoutBtn">Abmelden</button>
        </div>`;
      document.getElementById('pzLogoutBtn').addEventListener('click', () => this._logoutFlow());
    } else {
      el.innerHTML = `<a href="login.html" class="nav-login-btn">Anmelden</a>`;
    }
  },

  async _logoutFlow() {
    await this.logout();
    window.location.href = 'index.html';
  },

  _esc(str) {
    return String(str).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  },

  /**
   * Weiterleitung zu login.html wenn nicht eingeloggt.
   * In geschützten Seiten aufrufen.
   */
  async requireAuth(redirectTo = 'login.html') {
    const session = await this.getSession();
    if (!session) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },
};

// Auto-Init
(function () {
  if (typeof supabase !== 'undefined') {
    PZ.init();
  } else {
    console.error('[PIXELZONE] Supabase JS nicht geladen. Bitte CDN-Script vor auth.js einbinden.');
  }
})();
