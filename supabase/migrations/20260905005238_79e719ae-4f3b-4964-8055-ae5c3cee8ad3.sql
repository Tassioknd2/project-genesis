CREATE TABLE public.patients (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL,
  telefone TEXT NOT NULL,
  convenio TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  data_nascimento TEXT,
  ultima_visita TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.appointments (
  id TEXT PRIMARY KEY,
  data DATE NOT NULL,
  hora TEXT NOT NULL,
  duracao_min INTEGER NOT NULL DEFAULT 30,
  paciente_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  tipos TEXT[],
  medico TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado',
  pendencia TEXT,
  observacoes TEXT,
  notas TEXT[],
  etiquetas JSONB,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pacientes de demonstração
INSERT INTO public.patients (id, nome, idade, telefone, convenio, ultima_visita, observacoes, criado_em) VALUES
  ('p1', 'Marta Nogueira', 62, '(11) 98812-4450', 'Unimed', '03/01/2026', 'Hipertensa; traz último exame de sangue.', '2025-10-12T08:00:00.000Z'),
  ('p2', 'Roberto Lima', 58, '(11) 97123-8801', 'Particular', '18/12/2025', NULL, '2025-11-05T09:30:00.000Z'),
  ('p3', 'Cláudia Ferraz', 71, '(11) 96540-2213', 'SulAmérica', '22/12/2025', 'Mobilidade reduzida; preferir sala térrea.', '2025-08-20T14:15:00.000Z'),
  ('p4', 'Henrique Prado', 66, '(11) 98777-5540', 'Bradesco Saúde', '10/01/2026', NULL, '2025-09-14T11:00:00.000Z'),
  ('p5', 'Solange Ribeiro', 74, '(11) 99901-3345', 'Porto Seguro', '05/01/2026', NULL, '2025-07-30T16:45:00.000Z'),
  ('p6', 'Eduardo Sanches', 59, '(11) 91234-7789', 'Amil', '15/01/2026', NULL, '2025-12-01T10:20:00.000Z'),
  ('p7', 'Tereza Campos', 80, '(11) 98321-0012', 'SulAmérica', '28/11/2025', 'Acompanhada pela filha.', '2025-06-18T13:10:00.000Z'),
  ('p8', 'Fernando Alcântara', 64, '(11) 97456-1188', 'Particular', '09/01/2026', NULL, '2025-10-25T08:50:00.000Z'),
  ('p9', 'Beatriz Hoffmann', 53, '(11) 96610-9034', 'Bradesco Saúde', '20/01/2026', NULL, '2025-11-19T15:30:00.000Z'),
  ('p10', 'Amélia Corrêa', 69, '(11) 98877-6621', 'Amil', '12/01/2026', NULL, '2025-05-11T17:00:00.000Z');

-- Atendimentos de demonstração do dia atual
INSERT INTO public.appointments (id, data, hora, duracao_min, paciente_id, tipo, tipos, medico, status, pendencia) VALUES
  ('a1',  CURRENT_DATE, '08:00', 30, 'p1',  'Eletrocardiograma', NULL, 'Dr. Carlos Mendes', 'concluido', NULL),
  ('a2',  CURRENT_DATE, '08:30', 45, 'p8',  'Ecocardiograma', NULL, 'Dr. Carlos Mendes', 'confirmado', NULL),
  ('a3',  CURRENT_DATE, '09:15', 60, 'p9',  'Consulta', ARRAY['Consulta','Eletrocardiograma'], 'Dr. Carlos Mendes', 'confirmado', NULL),
  ('a4',  CURRENT_DATE, '09:45', 30, 'p2',  'Teste ergométrico', NULL, 'Dr. Carlos Mendes', 'aguardando', 'sem_resposta'),
  ('a5',  CURRENT_DATE, '10:30', 50, 'p3',  'Teste ergométrico', NULL, 'Dr. Carlos Mendes', 'agendado', NULL),
  ('a6',  CURRENT_DATE, '11:00', 30, 'p4',  'Retorno', NULL, 'Dr. Carlos Mendes', 'recusado', 'recusado'),
  ('a7',  CURRENT_DATE, '13:30', 40, 'p5',  'Holter 24h', NULL, 'Dr. Carlos Mendes', 'falha_envio', 'falha_envio'),
  ('a8',  CURRENT_DATE, '14:30', 30, 'p10', 'MAPA', NULL, 'Dr. Carlos Mendes', 'aguardando', 'sem_resposta'),
  ('a9',  CURRENT_DATE, '15:00', 30, 'p6',  'Consulta', NULL, 'Dr. Carlos Mendes', 'confirmado', NULL),
  ('a10', CURRENT_DATE, '16:30', 30, 'p7',  'Consulta', NULL, 'Dr. Carlos Mendes', 'falta', NULL);