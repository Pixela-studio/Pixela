'use client';

import { create } from 'zustand';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { UserResponse } from '@/api/auth/types';

const CLEANUP_DELAY_MS = 2000;
const FORCE_LOGOUT_KEY = 'forceLogout';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FORCE_LOGOUT_KEY);
    }

    if (session?.user) {
      const sessionUser = session.user as Session['user'] & { id?: string; isAdmin?: boolean };
      const now = new Date().toISOString();
      const user: UserResponse = {
        user_id: parseInt(sessionUser.id ?? '0'),
        name: sessionUser.name || '',
        email: sessionUser.email || '',
        is_admin: sessionUser.isAdmin ?? false,
        photo_url: sessionUser.image || undefined,
        password: '',
        created_at: now,
        updated_at: now,
      };
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  },

  checkAuth: async () => {
    // Ahora solo sincroniza con la sesión de NextAuth
    // La llamada real se hace desde el componente con useSession
    set({ isLoading: false, error: null });
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await signOut({ redirect: false });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

      if (typeof window !== 'undefined') {
        setTimeout(() => {
          localStorage.removeItem(FORCE_LOGOUT_KEY);
        }, CLEANUP_DELAY_MS);
      }
    }
  },
}));
