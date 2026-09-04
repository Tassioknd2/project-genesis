import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "medico", "recepcionista"]);

export const RegisterUserSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .trim()
    .email("E-mail com formato inválido")
    .toLowerCase()
    .max(150, "E-mail muito longo"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(100, "A senha deve ter no máximo 100 caracteres")
    .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter ao menos um número"),
  role: UserRoleSchema.optional().default("recepcionista"),
  telefone: z.string().trim().optional(),
  crm: z.string().trim().optional(),
});

export const LoginSchema = z.object({
  email: z.string().trim().email("E-mail com formato inválido").toLowerCase(),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const GoogleAuthSchema = z.object({
  credential: z.string().min(1, "O token de credencial do Google é obrigatório"),
  role: UserRoleSchema.optional().default("recepcionista"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email("E-mail com formato inválido").toLowerCase(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "O token de recuperação é obrigatório"),
  newPassword: z
    .string()
    .min(8, "A nova senha deve ter no mínimo 8 caracteres")
    .max(100, "A nova senha deve ter no máximo 100 caracteres")
    .regex(/[A-Z]/, "A nova senha deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "A nova senha deve conter ao menos um número"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória"),
  newPassword: z
    .string()
    .min(8, "A nova senha deve ter no mínimo 8 caracteres")
    .max(100, "A nova senha deve ter no máximo 100 caracteres")
    .regex(/[A-Z]/, "A nova senha deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "A nova senha deve conter ao menos um número"),
});

export const UpdateProfileSchema = z.object({
  nome: z.string().trim().min(2).max(100).optional(),
  telefone: z.string().trim().optional(),
  avatarUrl: z.string().url("URL de avatar inválida").optional().or(z.literal("")),
  crm: z.string().trim().optional(),
});

export const VerifyEmailSchema = z.object({
  code: z.string().trim().min(4, "O código de verificação deve ter 6 dígitos").max(10),
  email: z.string().trim().email("E-mail com formato inválido").optional(),
});

export const SendVerificationCodeSchema = z.object({
  email: z.string().trim().email("E-mail com formato inválido").optional(),
});
