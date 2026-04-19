-- Schrecken der Krypta (Necromancer Idle) in games (Admin-Panel / pruefeSpielStatus)
INSERT INTO public.games (id, name, is_active, disabled_message)
VALUES ('necromancer-idle', 'Schrecken der Krypta', true, '')
ON CONFLICT (id) DO NOTHING;
