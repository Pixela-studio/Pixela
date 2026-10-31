import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/api/rateLimit"

/**
 * Intentos de inicio de sesión por IP y email cada 15 minutos. Sin límite, el
 * formulario admitía fuerza bruta sin freno. Se cuenta por pareja IP + email
 * para que un aula entera detrás de la misma IP no se bloquee entre sí.
 */
const LOGIN_LIMIT = { name: "login", limit: 10, windowMs: 15 * 60 * 1000 }

/** Llega al cliente como `code` en el resultado de `signIn`. */
class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited"
}

// Extender tipos de NextAuth correctamente
declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
    tokenVersion?: number;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    tokenVersion?: number;
  }
}

const CREDENTIALS_SCHEMA = z.object({ 
  email: z.string().email(), 
  password: z.string().min(6) 
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        const parsedCredentials = CREDENTIALS_SCHEMA.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const attempt = checkRateLimit(`${getClientIp(request)}:${email.toLowerCase()}`, LOGIN_LIMIT);
        if (!attempt.allowed) throw new RateLimitedSignin();
        
        const user = await prisma.user.findUnique({
          where: { email }
        });

        // Guard clauses: validaciones tempranas
        if (!user) return null;
        if (!user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        // Evitar que imágenes en Base64 revienten el tamaño de la cookie (HTTP 431)
        const isBase64Image = user.photoUrl?.startsWith('data:');
        const isTooLong = user.photoUrl && user.photoUrl.length > 1000;
        
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          image: (isBase64Image || isTooLong) ? null : user.photoUrl,
          isAdmin: user.isAdmin,
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],
  callbacks: {
    /*
     * La sesión es un JWT: sin esta comprobación no se podía revocar. Cambiar la
     * contraseña no cerraba los otros dispositivos, quitar el rol de admin no
     * surtía efecto hasta que caducaba el token (30 días) y una cuenta borrada
     * seguía pasando `requireUser`.
     *
     * Ahora cada lectura de la sesión con token consulta al usuario por clave
     * primaria: si ya no existe o su `tokenVersion` ha cambiado, la sesión se
     * anula; si sigue, el rol se toma de la base de datos y no del token. Solo
     * cuesta en peticiones con sesión: el visitante anónimo no lleva token y
     * `providers.tsx` ni siquiera pregunta por la sesión.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.tokenVersion = user.tokenVersion ?? 0;
        return token;
      }

      const id = Number.parseInt(token.id ?? "", 10);
      if (!Number.isInteger(id) || id <= 0) return null;

      const current = await prisma.user.findUnique({
        where: { id },
        select: { name: true, email: true, isAdmin: true, tokenVersion: true },
      });

      if (!current || current.tokenVersion !== (token.tokenVersion ?? 0)) {
        return null;
      }

      // Ya que se consulta, el nombre y el email también salen de la base de
      // datos: tras renombrarse, la barra seguía mostrando el nombre del token.
      token.isAdmin = current.isAdmin;
      token.name = current.name;
      token.email = current.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean | undefined;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  secret: process.env.AUTH_SECRET
})
