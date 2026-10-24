import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/api/rateLimit"

// Extender tipos de NextAuth correctamente
declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
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
  }
}

const CREDENTIALS_SCHEMA = z.object({ 
  email: z.string().email(), 
  password: z.string().min(6) 
});

/**
 * Intentos de login permitidos.
 *
 * Cada intento con un email existente cuesta un `bcrypt.compare` de coste 12:
 * del orden de 200-300 ms de CPU pura en bcryptjs. Sin límite, un script de
 * fuerza bruta no solo prueba contraseñas, también se come la CPU del servidor
 * (que en un VPS compartido es la de todos). Se limita por IP y, aparte, por
 * cuenta, para que repartir el ataque entre IPs no sirva contra un usuario.
 */
const LOGIN_IP_LIMIT = { name: "login-ip", limit: 10, windowMs: 60_000 };
const LOGIN_ACCOUNT_LIMIT = { name: "login-account", limit: 10, windowMs: 15 * 60_000 };

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

        // Se rechaza antes de tocar la base de datos y bcrypt, que es lo caro.
        if (
          !checkRateLimit(getClientIp(request), LOGIN_IP_LIMIT).allowed ||
          !checkRateLimit(email.toLowerCase(), LOGIN_ACCOUNT_LIMIT).allowed
        ) {
          return null;
        }
        
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
          isAdmin: user.isAdmin
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
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
