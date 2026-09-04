import { z } from "zod";

export const CheckoutSchema = z.object({
  planId: z.enum(["plano_essencial", "plano_avancado"], {
    required_error: "O plano é obrigatório.",
  }),
  billingCycle: z.enum(["mensal", "anual"]).default("mensal"),
  perfisUsuario: z.number().int().min(1).max(2).optional(),
  metodoPagamento: z.enum(["cartao", "pix", "boleto"]).default("cartao"),
  paymentToken: z.string().optional(),
  cpfCnpj: z.string().trim().optional(),
  cartao: z
    .object({
      numero: z.string().min(13, "Número do cartão inválido"),
      nomeTitular: z.string().min(3, "Nome impresso no cartão é obrigatório"),
      validade: z.string().regex(/^\d{2}\/\d{2}$/, "Validade no formato MM/AA"),
      cvv: z.string().min(3).max(4, "CVV inválido"),
    })
    .optional(),
});

export const CreateProfileSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome do perfil deve ter no mínimo 2 caracteres.")
    .max(80, "O nome deve ter no máximo 80 caracteres."),
  email: z.string().trim().email("E-mail do perfil inválido.").toLowerCase(),
  role: z.enum(["medico", "recepcionista", "crm_admin"], {
    required_error: "A função do perfil é obrigatória.",
  }),
  tipo: z.enum(["usuario", "crm"]).default("usuario"),
  crm: z.string().trim().optional(),
  avatarColor: z.string().default("#2563EB"),
  avatarIcon: z.string().default("stethoscope"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  pin: z
    .string()
    .regex(/^\d{4}$/, "O PIN deve conter exatamente 4 dígitos numéricos.")
    .optional()
    .or(z.literal("")),
});

export const UpdateProfileSchema = CreateProfileSchema.partial();

export const SelectProfileSchema = z.object({
  pin: z.string().optional(),
});
