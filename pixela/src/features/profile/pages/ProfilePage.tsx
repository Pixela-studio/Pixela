"use client";

import { useState, useEffect } from "react";
import { UserResponse } from "@/api/auth/types";
import { authAPI } from "@/api/auth/auth";
import { ProfileError } from "@/features/profile/components";
import { FiLoader } from "react-icons/fi";
import { ProfileClient } from "../components/ProfileClient";

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
      .catch(() => setError("Error de carga"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-pixela-ink flex items-center justify-center">
        <FiLoader className="w-10 h-10 text-pixela-accent animate-spin" />
      </div>
    );
  if (error) return <ProfileError message={error || "Error desconocido"} />;
  if (!user) return <ProfileError message="No hay datos" />;

  return <ProfileClient user={user} />;
}
