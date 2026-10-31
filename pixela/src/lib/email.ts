import { logger } from "@/lib/logger";

/**
 * Envío de correo transaccional con Resend (https://resend.com).
 *
 * Se llama a su API REST con `fetch` en vez de añadir el SDK: es una sola
 * petición y así no entra otra dependencia. Necesita dos variables de entorno:
 *
 * - `RESEND_API_KEY`: la clave de la API.
 * - `RESEND_FROM`: el remitente verificado en Resend, p. ej.
 *   `Pixela <no-reply@tudominio.es>`.
 *
 * Sin ellas el envío está desactivado (`isEmailEnabled() === false`) y la
 * recuperación de contraseña lo dice en vez de fingir que manda algo.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!isEmailEnabled()) return false;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.RESEND_FROM, ...message }),
      cache: "no-store",
    });

    if (!response.ok) {
      // El cuerpo de error de Resend no lleva datos personales: se registra
      // para poder diagnosticar un remitente sin verificar o una clave mala.
      logger.error("Resend rejected the email", new Error(await response.text()), {
        status: response.status,
      });
      return false;
    }
    return true;
  } catch (error) {
    logger.error("Failed to reach Resend", error);
    return false;
  }
}

/** Escapa texto para meterlo en el HTML del correo. */
export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
