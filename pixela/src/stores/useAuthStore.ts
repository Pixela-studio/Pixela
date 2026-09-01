'use client';

import { create } from 'zustand';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { UserResponse } from '@/api/auth/types';

/**
 * Store de sesión.
 *
 * Se ha eliminado el mecanismo `forceLogout` en `localStorage`: lo escribían y
 * lo borraban cuatro sitios distintos (Navbar, este store dos veces y
 * ProtectedRoute) con temporizadores de 1 s y 2 s que competían entre sí, de
 * modo que el resultado dependía del orden de ejecución. La sesión ya la
 * gobierna Auth.js; el estado local solo la refleja.
 */

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  updateUser: (user: UserResponse) => void;
  syncWithSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  updateUser: (user: UserResponse) => {
    set({ user, isAuthenticated: true });
  },

  syncWithSession: (session: Session | null) => {
    if (!session?.user) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return;
    }

    const sessionUser = session.user;
    const now = new Date().toISOString();

    set({
      user: {
        user_id: Number.parseInt(sessionUser.id ?? '0', 10) || 0,
        name: sessionUser.name || '',
        email: sessionUser.email || '',
        is_admin: sessionUser.isAdmin ?? false,
        photo_url: sessionUser.image || undefined,
        password: '',
        created_at: now,
        updated_at: now,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      // `redirect: false` para que quien llame decida a dónde ir; el await es
      // importante: antes se navegaba primero y se cerraba sesión "en segundo
      // plano", dejando la cookie viva si la petición fallaba.
      await signOut({ redirect: false });
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },
}));
