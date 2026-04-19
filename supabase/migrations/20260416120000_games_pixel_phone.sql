-- Eintrag in games (Admin-Panel / pruefeSpielStatus)
INSERT INTO public.games (id, name, is_active, disabled_message)
VALUES ('pixel-phone', 'Pixel Phone', true, '')
ON CONFLICT (id) DO NOTHING;
