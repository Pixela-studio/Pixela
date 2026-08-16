import { auth } from "@/auth";

/**
 * Sesión ya validada: el id viene parseado y garantizado como entero.
 */
export interface AuthedUser {
  id: number;
  email: string | null;
  isAdmin: boolean;
}

/**
 * Resultado de un guard: o hay usuario, o hay una respuesta de error lista para devolver.
 */
export type GuardResult =
  | { ok: true; user: AuthedUser }
  | { ok: false; response: Response };

const unauthorized = () =>
  Response.json({ error: "No autorizado" }, { status: 401 });

const forbidden = () =>
  Response.json({ error: "No tienes permiso para realizar esta acción" }, { status: 403 });

/**
 * Exige una sesión válida.
 *
 * Centraliza el `parseInt(session.user.id)` que estaba repetido en ~10 rutas sin
 * radix ni comprobación de NaN: un id no numérico llegaba a Prisma y reventaba
 * con un 500 en lugar de un 401 limpio.
 */
export async function requireUser(): Promise<GuardResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, response: unauthorized() };
  }

  const id = Number.parseInt(session.user.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, response: unauthorized() };
  }

  return {
    ok: true,
    user: {
      id,
      email: session.user.email ?? null,
      isAdmin: session.user.isAdmin === true,
    },
  };
}

/**
 * Exige una sesión válida **y** rol de administrador.
 */
export async function requireAdmin(): Promise<GuardResult> {
  const result = await requireUser();
  if (!result.ok) return result;

  if (!result.user.isAdmin) {
    return { ok: false, response: forbidden() };
  }

  return result;
}
