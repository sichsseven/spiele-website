-- Host darf nach einer Runde alle Einreichungen des Raums löschen (neues Spiel / zurück zur Lobby)
CREATE POLICY "pp_submissions_delete_host"
  ON public.pixel_phone_submissions FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pixel_phone_rooms r
      WHERE r.id = pixel_phone_submissions.room_id AND r.host_user_id = auth.uid()
    )
  );
