import { SessionToken, PasswordResetToken } from "../domain/auth.types";
import { generateSecureToken, hashToken } from "../utils/crypto";

export interface ISessionRepository {
  createSession(
    userId: string,
    ttlDays?: number,
    metadata?: { userAgent?: string | undefined; ip?: string | undefined },
  ): Promise<{ token: string; expiresAt: string }>;
  findSession(token: string): Promise<SessionToken | null>;
  deleteSession(token: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
}

export interface IPasswordResetRepository {
  createResetToken(
    userId: string,
    ttlHours?: number,
  ): Promise<{ rawToken: string; expiresAt: string }>;
  findValidResetToken(rawToken: string): Promise<PasswordResetToken | null>;
  markAsUsed(id: string): Promise<void>;
  invalidateUserTokens(userId: string): Promise<void>;
}

export class AuthTokenRepository implements ISessionRepository, IPasswordResetRepository {
  // Mapa de Sessões: token -> SessionToken
  private sessions: Map<string, SessionToken> = new Map();

  // Mapa de Recuperação: tokenHash -> PasswordResetToken
  private resetTokens: Map<string, PasswordResetToken> = new Map();

  // Rate limiting simples em memória: key (ip/email) -> { count, expiresAt }
  private rateLimits: Map<string, { count: number; expiresAt: number }> = new Map();

  // ==================== SESSÕES ====================

  async createSession(
    userId: string,
    ttlDays = 7,
    metadata?: { userAgent?: string | undefined; ip?: string | undefined },
  ): Promise<{ token: string; expiresAt: string }> {
    const rawToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
    const id = `sess_${Date.now()}_${generateSecureToken(4)}`;

    const session: SessionToken = {
      id,
      userId,
      token: rawToken,
      expiresAt,
      userAgent: metadata?.userAgent,
      ip: metadata?.ip,
      criadoEm: new Date().toISOString(),
    };

    this.sessions.set(rawToken, session);
    return { token: rawToken, expiresAt };
  }

  async findSession(token: string): Promise<SessionToken | null> {
    const session = this.sessions.get(token);
    if (!session) return null;

    // Checa expiração
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      return null;
    }

    return { ...session };
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }

  // ==================== RECUPERAÇÃO DE SENHA ====================

  async createResetToken(
    userId: string,
    ttlHours = 1,
  ): Promise<{ rawToken: string; expiresAt: string }> {
    // Invalida tokens anteriores do usuário
    await this.invalidateUserTokens(userId);

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
    const id = `rst_${Date.now()}_${generateSecureToken(4)}`;

    const resetToken: PasswordResetToken = {
      id,
      userId,
      tokenHash,
      expiresAt,
      usado: false,
      criadoEm: new Date().toISOString(),
    };

    this.resetTokens.set(tokenHash, resetToken);
    return { rawToken, expiresAt };
  }

  async findValidResetToken(rawToken: string): Promise<PasswordResetToken | null> {
    const tokenHash = hashToken(rawToken);
    const record = this.resetTokens.get(tokenHash);
    if (!record) return null;

    if (record.usado) return null;

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      this.resetTokens.delete(tokenHash);
      return null;
    }

    return { ...record };
  }

  async markAsUsed(id: string): Promise<void> {
    for (const [hash, record] of this.resetTokens.entries()) {
      if (record.id === id) {
        record.usado = true;
        this.resetTokens.set(hash, record);
        break;
      }
    }
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    for (const [hash, record] of this.resetTokens.entries()) {
      if (record.userId === userId) {
        this.resetTokens.delete(hash);
      }
    }
  }

  // ==================== RATE LIMITING ====================

  /**
   * Verifica e incrementa o contador de tentativas para mitigar ataques de força bruta.
   * Retorna true se permitido, false se excedeu o limite.
   */
  checkRateLimit(
    key: string,
    maxAttempts = 5,
    windowSeconds = 300,
  ): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const current = this.rateLimits.get(key);

    if (!current || current.expiresAt < now) {
      this.rateLimits.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (current.count >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    current.count += 1;
    this.rateLimits.set(key, current);
    return { allowed: true, remaining: maxAttempts - current.count };
  }

  resetRateLimit(key: string): void {
    this.rateLimits.delete(key);
  }
}

export const authTokenRepository = new AuthTokenRepository();
