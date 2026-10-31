import { z } from "zod";

/**
 * Reglas de cuenta compartidas por los formularios y la API.
 *
 * Antes cada sitio tenía las suyas: el registro aceptaba cualquier contraseña de
 * 8 caracteres, el perfil exigía mayúscula, minúscula, número y uno de siete
 * símbolos concretos (`#`, `.` o `-` no valían), y el nombre rechazaba tildes,
 * eñes y espacios en los dos. Este módulo no importa nada de servidor, así que
 * lo pueden usar también los componentes de cliente.
 */

export const NAME_MIN = 2;
export const NAME_MAX = 50;

/**
 * Letras y números de cualquier alfabeto, con espacios, puntos, guiones,
 * guiones bajos o apóstrofos entre ellos (nunca al principio, al final ni
 * repetidos). Admite «María José», «Nuria_Profe» o «O'Brien»; rechaza nombres
 * hechos solo de símbolos o con dobles espacios.
 */
export const NAME_PATTERN = /^[\p{L}\p{N}]+(?:[ ._'-][\p{L}\p{N}]+)*$/u;

export const NAME_HINT = "Es el que se verá en tus reseñas. Puede llevar tildes y espacios.";

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export const PASSWORD_HINT = `Al menos ${PASSWORD_MIN} caracteres. Una frase larga es más segura que una palabra con símbolos.`;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Edad mínima para consentir el tratamiento de datos en España (art. 7 LOPDGDD). */
export const MIN_AGE = 14;

const MESSAGES = {
  nameEmpty: "Escribe tu nombre.",
  nameShort: `El nombre debe tener al menos ${NAME_MIN} caracteres.`,
  nameLong: `El nombre no puede pasar de ${NAME_MAX} caracteres.`,
  namePattern: "Usa letras y números; puedes separarlos con un espacio, punto, guion o apóstrofo.",
  emailEmpty: "Escribe tu email.",
  emailInvalid: "Ese email no parece válido.",
  passwordShort: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`,
  passwordLong: "La contraseña es demasiado larga.",
} as const;

/** Colapsa espacios repetidos: «Ana  María» se guarda como «Ana María». */
const normalizeName = (value: string) => value.trim().replace(/\s+/g, " ");

export const nameSchema = z
  .string()
  .transform(normalizeName)
  .pipe(
    z
      .string()
      .min(NAME_MIN, MESSAGES.nameShort)
      .max(NAME_MAX, MESSAGES.nameLong)
      .regex(NAME_PATTERN, MESSAGES.namePattern),
  );

export const emailSchema = z.string().trim().toLowerCase().email(MESSAGES.emailInvalid);

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, MESSAGES.passwordShort)
  .max(PASSWORD_MAX, MESSAGES.passwordLong);

/* Validadores de campo para formularios: devuelven el mensaje o `undefined`. */

export function validateName(raw: string): string | undefined {
  const name = normalizeName(raw);
  if (!name) return MESSAGES.nameEmpty;
  if (name.length < NAME_MIN) return MESSAGES.nameShort;
  if (name.length > NAME_MAX) return MESSAGES.nameLong;
  if (!NAME_PATTERN.test(name)) return MESSAGES.namePattern;
  return undefined;
}

export function validateEmail(raw: string): string | undefined {
  const email = raw.trim();
  if (!email) return MESSAGES.emailEmpty;
  if (!EMAIL_PATTERN.test(email)) return MESSAGES.emailInvalid;
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (value.length < PASSWORD_MIN) return MESSAGES.passwordShort;
  if (value.length > PASSWORD_MAX) return MESSAGES.passwordLong;
  return undefined;
}
