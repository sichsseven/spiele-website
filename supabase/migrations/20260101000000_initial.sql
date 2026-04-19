-- ══════════════════════════════════════════════════════════
--  PIXELZONE — Initiale Datenbankstruktur
-- ══════════════════════════════════════════════════════════

-- ─── PROFILES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  benutzername TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── SPIELSTÄNDE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.spielstaende (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spiel_name  TEXT NOT NULL,
  punkte      INTEGER NOT NULL DEFAULT 0,
  level       INTEGER NOT NULL DEFAULT 1,
  extra_daten JSONB DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, spiel_name)
);

ALTER TABLE public.spielstaende ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spielstaende_select_all"
  ON public.spielstaende FOR SELECT USING (true);

CREATE POLICY "spielstaende_insert_own"
  ON public.spielstaende FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "spielstaende_update_own"
  ON public.spielstaende FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "spielstaende_delete_own"
  ON public.spielstaende FOR DELETE
  USING (auth.uid() = user_id);

-- ─── AUTO updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_spielstaende_updated_at
  BEFORE UPDATE ON public.spielstaende
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── HILFSFUNKTION: Rangliste ─────────────────────────────
-- Gibt Top-N Einträge für ein Spiel zurück (mit Benutzername)
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_spiel TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  rang        BIGINT,
  benutzername TEXT,
  punkte      INTEGER,
  level       INTEGER,
  updated_at  TIMESTAMPTZ
) LANGUAGE sql STABLE AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY s.punkte DESC) AS rang,
    p.benutzername,
    s.punkte,
    s.level,
    s.updated_at
  FROM public.spielstaende s
  JOIN public.profiles p ON p.user_id = s.user_id
  WHERE s.spiel_name = p_spiel
  ORDER BY s.punkte DESC
  LIMIT p_limit;
$$;
