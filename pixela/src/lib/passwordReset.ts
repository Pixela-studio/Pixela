import { createHash, randomBytes } from "node:crypto";

/**
 * Tokens de «He olvidado mi contraseña».
 *
 * El enlace lleva un token aleatorio de 256 bits; en la base de datos solo se
 * guarda su SHA-256. Caduca en una hora y sirve una sola vez.
 */

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function newResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Forma válida de un token: 43 caracteres base64url. */
export const isWellFormedResetToken = (token: string) => /^[A-Za-z0-9_-]{43}$/.test(token);
