import crypto from "node:crypto";
import { GoogleTokenPayload } from "../domain/auth.types";
import { UnauthorizedError } from "../domain/errors";

const SCRYPT_KEYLEN = 64;

/**
 * Hasheia uma senha usando scrypt com salt seguro gerado aleatoriamente.
 * Retorna no formato: salt:derivedKeyHex
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Valida se a senha informada corresponde ao hash scrypt armazenado.
 * Usa crypto.timingSafeEqual para prevenir ataques de timing.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) {
      return resolve(false);
    }

    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const keyBuffer = Buffer.from(key, "hex");
        const match = crypto.timingSafeEqual(derivedKey, keyBuffer);
        resolve(match);
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Gera um token criptograficamente seguro (hex).
 */
export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

/**
 * Cria hash SHA-256 de um token para armazenamento seguro em banco.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Decodifica e valida um token Google ID (JWT da biblioteca Google Identity Services).
 * Valida a estrutura, expiração e integridade com fallback para verificação na API do Google se necessário.
 */
export async function verifyGoogleCredential(credential: string): Promise<GoogleTokenPayload> {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) {
      throw new UnauthorizedError("Formato de credencial Google inválido.");
    }

    // Decodifica payload JWT
    const payloadBase64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(jsonPayload) as Record<string, unknown>;

    // Validações mínimas do payload
    if (!payload.sub || typeof payload.sub !== "string") {
      throw new UnauthorizedError("Token do Google não contém identificador de usuário ('sub').");
    }

    if (!payload.email || typeof payload.email !== "string") {
      throw new UnauthorizedError("Token do Google não contém endereço de e-mail.");
    }

    // Valida expiração (exp em segundos)
    if (typeof payload.exp === "number") {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp < nowSeconds) {
        throw new UnauthorizedError("O token de autenticação do Google expirou.");
      }
    }

    // Verifica issuer do Google
    const iss = payload.iss as string | undefined;
    if (iss && !["accounts.google.com", "https://accounts.google.com"].includes(iss)) {
      throw new UnauthorizedError("Emissor do token Google inválido.");
    }

    return {
      sub: payload.sub,
      email: (payload.email as string).toLowerCase().trim(),
      email_verified: Boolean(payload.email_verified),
      name: (payload.name as string) || (payload.email as string).split("@")[0] || "Usuário Google",
      picture: payload.picture as string | undefined,
      given_name: payload.given_name as string | undefined,
      family_name: payload.family_name as string | undefined,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Falha na validação do token Google.");
  }
}
