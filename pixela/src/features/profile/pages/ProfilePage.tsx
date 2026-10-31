"use client";

import { useState, useEffect, Suspense } from "react";
import { UserResponse } from "@/api/auth/types";
import { authAPI } from "@/api/auth/auth";
import { ProfileError } from "@/features/profile/components";
import { FiLoader } from "react-icons/fi";
import { ProfileClient } from "../components/ProfileClient";
import { ApiError } from "@/api/shared/apiHelpers";

/**
 * Qué decir según por qué falló. «Error de carga» no ayudaba a decidir si
 * reintentar, volver a entrar o esperar.
 */
function describeLoadError(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return "Tu sesión ha caducado o se cerró en otro dispositivo. Vuelve a iniciar sesión.";
  }
  if (error instanceof ApiError && error.status >= 500) {
    return "Nuestro servidor no ha podido leer tu perfil. Suele arreglarse en unos minutos: prueba a reintentar.";
  }
  if (error instanceof TypeError) {
    return "No hay conexión con Pixela. Comprueba tu conexión y reintenta.";
  }
  return "No se pudo cargar tu perfil. Prueba a reintentar.";
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authAPI
      .getUser()
      .then((response: UserResponse | { user: UserResponse }) => {
        interface UserWithId {
          user_id?: string | number;
          id?: string | number;
          name?: string;
          email?: string;
          photo_url?: string;
          cover_url?: string;
          image?: string;
          is_admin?: boolean;
          password?: string;
          created_at?: string;
          updated_at?: string;
        }
        const userData = ("user" in response
          ? response.user
          : response) as unknown as UserWithId;
        setUser({
          user_id: Number(userData.user_id || userData.id) || 0,
          name: userData.name || "Usuario",
          email: userData.email || "",
          photo_url: userData.photo_url || userData.image || "",
          cover_url: userData.cover_url || "",
          is_admin: userData.is_admin || false,
          password: userData.password || "",
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
        });
      })
      .catch((err: unknown) => setError(describeLoadError(err)))
      .finally(() => setLoading(false));
  }, []);

  const loader = (
    <div className="min-h-screen bg-pixela-ink flex items-center justify-center">
      <FiLoader className="w-10 h-10 text-pixela-accent animate-spin" />
    </div>
  );

  if (loading) return loader;
  if (error) return <ProfileError message={error} />;
  if (!user) return <ProfileError />;

  // ProfileClient lee `?tab=` con useSearchParams; el App Router exige un
  // límite de Suspense alrededor para no forzar el renderizado en cliente de
  // toda la ruta.
  return (
    <Suspense fallback={loader}>
      <ProfileClient user={user} />
    </Suspense>
  );
}
