CREATE POLICY "Acesso apenas via servidor" ON public.patients
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE POLICY "Acesso apenas via servidor" ON public.appointments
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);