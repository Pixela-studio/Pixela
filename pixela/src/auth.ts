import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsedCredentials = CREDENTIALS_SCHEMA.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;
        
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
