'use client';
import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Error403 from '@/app/errors/error-403';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const STYLES = {
  loadingContainer: "min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F] flex flex-col items-center justify-center pt-20",
  loadingContent: "text-center",
  loadingSpinner: "animate-spin rounded-full h-12 w-12 border-b-2 border-pixela-accent mx-auto mb-4",
  loadingText: "text-gray-300"
} as const;

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Verificar si hay un logout forzado pendiente
    if (typeof window !== 'undefined' && localStorage.getItem('forceLogout')) {
      setIsLoggingOut(true);
      localStorage.removeItem('forceLogout');
      setTimeout(() => router.push('/'), 500);
    }
  }, [router]);

  // 1. Estado de carga inicial (Session aun verificando o Logout en progreso)
  if (status === 'loading' || isLoggingOut) {
    return (
      <div className={STYLES.loadingContainer}>
        <div className={STYLES.loadingContent}>
          <div className={STYLES.loadingSpinner}></div>
          <p className={STYLES.loadingText}>
            {isLoggingOut ? 'Cerrando sesión...' : 'Verificando autenticación...'}
          </p>
        </div>
      </div>
    );
  }

  // 2. Verificaciones de seguridad UNA VEZ que tenemos session definitiva
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.isAdmin; // Asegúrate que isAdmin viene en tu sesión

  // Validar Autenticación
  if (requireAuth && !isAuthenticated) {
    return <Error403 />;
  }

  // Validar Rol Admin
  if (requireAdmin && !isAdmin) {
    return <Error403 />;
  }

  // 3. Todo OK
  return <>{children}</>;
} 