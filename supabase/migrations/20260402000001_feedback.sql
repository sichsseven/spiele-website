-- ══════════════════════════════════════════════════════════
--  PIXELZONE — Feedback-System
-- ══════════════════════════════════════════════════════════

-- ─── FEEDBACK-TABELLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  benutzername   TEXT,
  kategorie      TEXT        NOT NULL
                             CHECK (kategorie IN ('bug','verbesserung','spielwunsch','allgemein')),
  nachricht      TEXT        NOT NULL,
  spiel_name     TEXT,
  screenshot_url TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Jeder kann Feedback einreichen (auch ohne Login)
CREATE POLICY "feedback_insert_all"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

-- Eingeloggte Nutzer sehen nur ihr eigenes Feedback
CREATE POLICY "feedback_select_own"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

-- ─── STORAGE: Screenshot-Bucket ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-screenshots', 'feedback-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Jeder darf hochladen
CREATE POLICY "screenshots_insert_all"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'feedback-screenshots');

-- Öffentlich lesbar (für die gespeicherten URLs)
CREATE POLICY "screenshots_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'feedback-screenshots');
