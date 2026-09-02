export type UserRole = "admin" | "medico" | "recepcionista";

export type UserStatus = "ativo" | "inativo" | "bloqueado";

export type AuthProvider = "local" | "google";

export interface User {
  id: string;
  nome: string;
  email: string;
  passwordHash?: string | undefined;
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  googleId?: string | undefined;
  avatarUrl?: string | undefined;
  telefone?: string | undefined;
  crm?: string | undefined;
  ultimoLoginEm?: string | undefined;
  criadoEm: string;
  atualizadoEm: string;
}

export type UserSafeProfile = Omit<User, "passwordHash">;

export interface SessionToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  userAgent?: string | undefined;
  ip?: string | undefined;
  criadoEm: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usado: boolean;
  criadoEm: string;
}

export interface AuthSessionResponse {
  user: UserSafeProfile;
  token: string;
  expiresAt: string;
}

export interface GoogleTokenPayload {
  sub: string; // Google User ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}
