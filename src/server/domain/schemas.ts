import { z } from "zod";

export const AppointmentStatusSchema = z.enum([
  "agendado",
  "aguardando",
  "confirmado",
  "recusado",
  "falha_envio",
  "concluido",
  "falta",
  "remarcado",
]);

export const TipoAtendimentoSchema = z.enum([
  "Consulta",
  "Retorno",
  "Eletrocardiograma",
  "Ecocardiograma",
  "Teste ergométrico",
  "Holter 24h",
  "MAPA",
]);

export const EtiquetaCorSchema = z.enum(["ambar", "verde", "azul", "vermelho", "roxo", "cinza"]);

export const EtiquetaSchema = z.object({
  id: z.string().min(1),
  texto: z.string().min(1, "Texto da etiqueta é obrigatório").max(50),
  cor: EtiquetaCorSchema,
});

// Regex para formato ISO YYYY-MM-DD
export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD");

// Regex para horário HH:MM
export const TimeSlotSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário deve estar no formato HH:MM");

export const CreatePatientSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  idade: z.number().int().min(0, "Idade inválida").max(130),
  telefone: z.string().trim().min(10, "Telefone deve conter no mínimo 10 dígitos com DDD"),
  convenio: z.string().trim().min(2, "Convênio é obrigatório"),
  cpf: z.string().trim().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  observacoes: z.string().trim().max(500).optional(),
});

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const CreateAppointmentSchema = z
  .object({
    data: IsoDateSchema,
    hora: TimeSlotSchema,
    tipo: TipoAtendimentoSchema.optional(),
    tipos: z.array(TipoAtendimentoSchema).min(1, "Selecione ao menos um procedimento").optional(),
    duracaoMin: z.number().int().min(15).max(300).optional(),
    medico: z.string().trim().min(2).default("Dr. Carlos Mendes"),
    paciente: z.union([
      z.object({
        id: z.string().min(1),
      }),
      CreatePatientSchema,
    ]),
    observacoes: z.string().trim().max(500).optional(),
    etiquetas: z.array(EtiquetaSchema).optional(),
  })
  .refine((data) => data.tipo !== undefined || (data.tipos && data.tipos.length > 0), {
    message: "É obrigatório informar ao menos um tipo de atendimento (tipo ou tipos).",
    path: ["tipos"],
  });

export const UpdateAppointmentStatusSchema = z.object({
  status: AppointmentStatusSchema,
  motivo: z.string().trim().max(300).optional(),
  observacoes: z.string().trim().max(500).optional(),
});

export const RescheduleAppointmentSchema = z.object({
  novaData: IsoDateSchema,
  novaHora: TimeSlotSchema,
  motivo: z.string().trim().max(300).optional(),
});

export const AddAppointmentNoteSchema = z.object({
  nota: z.string().trim().min(1, "Texto da nota não pode ser vazio").max(500),
});

export const UpdateAppointmentLabelsSchema = z.object({
  etiquetas: z.array(EtiquetaSchema),
});

export const SimulateWhatsAppReplySchema = z.object({
  appointmentId: z.string().min(1),
  resposta: z.enum(["SIM", "NAO", "REMARCAR", "FALHA_ENVIO"]),
  mensagemAdicional: z.string().max(300).optional(),
});

export const GetAgendaQuerySchema = z.object({
  date: IsoDateSchema.optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  tipo: z.string().optional(),
  categoria: z.enum(["consulta", "exame"]).optional(),
});
