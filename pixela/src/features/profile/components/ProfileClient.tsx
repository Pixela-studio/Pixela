"use client";

import { useState, useEffect } from "react";
import { UserResponse } from "@/api/auth/types";
import { User } from "@/api/users/types";
import { ProfileFormData } from "@/features/profile/types/profileTypes";
import { usersAPI } from "@/api/users/users";
import { useAuthStore } from "@/stores/useAuthStore";
import { ProfileFavorites } from "./layout/ProfileFavorites";
import { ProfileReviews } from "./layout/ProfileReviews";
import { ProfileUsers } from "./layout/ProfileUsers";
import { ProfileLibrary } from "./layout/ProfileLibrary";
import { ContentPanel } from "@/features/profile/components/layout/ContentPanel";
import { ProfileInfo } from "@/features/profile/components/layout/ProfileInfo";
import { UpdateProfileForm } from "@/features/profile/components/form/UpdateProfileForm";
import {
  FiLoader,
  FiSettings,
  FiUsers,
  FiActivity,
  FiGrid,
  FiStar,
} from "react-icons/fi";
import { FaRegBookmark, FaRegComments } from "react-icons/fa";
import { UserCreateModal } from "./form/UserCreateModal";
import { clsx } from "clsx";
import { TabType } from "@/features/profile/types/tabs";
import { ProfileClientProps } from "@/features/profile/types/profileTypes";
import { useProfileStats } from "@/features/profile/hooks/useProfileStats";
import { ProfileHero } from "./layout/ProfileHero";
import { ProfileStatsBar } from "./layout/ProfileStatsBar";

const STYLES = {
  // Contenedores principales
  pageWrapper: "min-h-screen bg-[#0F0F0F] relative overflow-x-hidden",

  // Main Content Area
  mainContent: "max-w-7xl mx-auto px-4 md:px-8 pb-20",

  // Tabs (Premium Style)
  tabsContainer:
    "grid grid-cols-2 sm:flex sm:flex-wrap justify-center md:justify-start gap-2 mb-10 border-b border-white/10",
  tabButton: (isActive: boolean) =>
    clsx(
      "px-2 sm:px-6 py-4 sm:py-3 text-[13px] sm:text-sm font-medium transition-all duration-300 relative flex flex-col sm:flex-row items-center justify-center gap-2",
      isActive ? "text-white" : "text-gray-400 hover:text-white",
    ),
  tabIndicator: (isActive: boolean) =>
    clsx(
      "absolute bottom-0 left-0 w-full h-0.5 bg-pixela-accent shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-300",
      isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0",
    ),
  tabIcon: "text-2xl sm:text-lg relative",

  // Content Layout
  contentWrapper: "min-h-[400px] animate-fade-in",

  // Botones Generales
  primaryButton:
    "bg-pixela-accent text-white hover:bg-pixela-accent/90 shadow-lg shadow-pixela-accent/20 px-5 py-2 rounded-lg font-medium transition-all duration-300 transform active:scale-95 flex items-center gap-2",

  // Notificaciones
  notification:
    "fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in backdrop-blur-md border border-white/10",
  notificationSuccess: "bg-green-500/10 border-green-500/20 text-green-400",
  notificationError: "bg-red-500/10 border-red-500/20 text-red-400",

  // Loading/Redirect Overlay
  loadingOverlay:
    "fixed inset-0 bg-[#0F0F0F]/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center",
} as const;

export const ProfileClient = ({ user: initialUser }: ProfileClientProps) => {
  const updateUser = useAuthStore((state) => state.updateUser);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserResponse>(initialUser);
  const [redirecting, setRedirecting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshUsers, setRefreshUsers] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use the extracted hook for stats
  const { stats, refreshStats } = useProfileStats();

  // Auto-hide notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle redirect
  useEffect(() => {
    if (redirecting) {
      const timer = setTimeout(() => {
        window.location.replace("http://localhost:3000");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [redirecting]);

  const handleSubmitProfile = async (data: ProfileFormData) => {
    try {
      const payload: Partial<UserResponse> = {
        user_id: user.user_id,
        name: data.name,
        email: data.email,
        photo_url:
          data.photo_url !== undefined ? data.photo_url : user.photo_url,
        cover_url:
          data.cover_url !== undefined ? data.cover_url : user.cover_url,
      };

      if (data.password && data.password.trim()) {
        payload.password = data.password;
      }

      const updatedUser = await usersAPI.update(payload as UserResponse);
      const userToSet = "user" in updatedUser ? updatedUser.user : updatedUser;

      if (data.password && data.password.trim()) {
        setRedirecting(true);
        return;
      }

      setUser(userToSet as UserResponse);
      updateUser(userToSet as UserResponse);
      setIsEditing(false);
      setSuccessMessage("¡Perfil actualizado correctamente!");
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setSuccessMessage(
        error instanceof Error ? error.message : "Error al actualizar",
      );
    }
  };

  const handleUserUpdated = (updatedUser: User) => {
    if (updatedUser.user_id === user.user_id) {
      const userResponse: UserResponse = {
        ...user,
        ...updatedUser,
        password: updatedUser.password || "",
      };
      setUser(userResponse);
      updateUser(userResponse);
    }
    setRefreshUsers((r) => !r);
  };

  if (redirecting) {
    return (
      <div className={STYLES.loadingOverlay}>
        <FiLoader className="w-12 h-12 text-pixela-accent animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Actualizando seguridad...
        </h2>
        <p className="text-gray-400">
          Te estamos redirigiendo para iniciar sesión.
        </p>
      </div>
    );
  }

  return (
    <main className={STYLES.pageWrapper}>
      {/* Toast Notification */}
      {successMessage && (
        <div
          className={clsx(
            STYLES.notification,
            successMessage.includes("Error")
              ? STYLES.notificationError
              : STYLES.notificationSuccess,
          )}
        >
          {successMessage.includes("Error") ? (
            <FiActivity className="w-5 h-5" />
          ) : (
            <FiStar className="w-5 h-5" />
          )}
          <span>{successMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <ProfileHero user={user} />

      {/* Quick Stats */}
      <ProfileStatsBar stats={stats} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className={STYLES.mainContent}>
        {/* Navigation Tabs */}
        <div className={STYLES.tabsContainer}>
          {[
            { id: "profile", label: "General", icon: FiSettings },
            { id: "library", label: "Biblioteca", icon: FiGrid },
            { id: "reviews", label: "Reseñas", icon: FaRegComments },
            { id: "favorites", label: "Favoritos", icon: FaRegBookmark },
            ...(user.is_admin
              ? [{ id: "users", label: "Usuarios", icon: FiUsers }]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={STYLES.tabButton(activeTab === tab.id)}
            >
              <tab.icon className={STYLES.tabIcon} />
              {tab.label}
              <div className={STYLES.tabIndicator(activeTab === tab.id)} />
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className={STYLES.contentWrapper}>
          {activeTab === "profile" && !isEditing && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="lg:col-span-2">
                <ProfileInfo
                  user={{ ...user, user_id: user.user_id }}
                  onEdit={() => setIsEditing(true)}
                />
              </div>
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5">
                  <h3 className="text-xl font-bold text-white mb-4 font-outfit">
                    Actividad Reciente
                  </h3>
                  <p className="text-gray-500 text-sm">
                    No hay actividad reciente para mostrar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && isEditing && (
            <div className="w-full animate-fade-in">
              <UpdateProfileForm
                initialData={{
                  name: user.name,
                  email: user.email,
                  photo_url: user.photo_url,
                }}
                onCancel={() => setIsEditing(false)}
                onSubmit={handleSubmitProfile}
              />
            </div>
          )}

          {activeTab === "library" && (
            <ContentPanel title="Tu Biblioteca">
              <ProfileLibrary />
            </ContentPanel>
          )}

          {activeTab === "reviews" && (
            <ContentPanel title="Tus Reseñas">
              <ProfileReviews onStatsUpdate={refreshStats} />
            </ContentPanel>
          )}

          {activeTab === "favorites" && (
            <ContentPanel title="Lista de Favoritos">
              <ProfileFavorites onStatsUpdate={refreshStats} />
            </ContentPanel>
          )}

          {activeTab === "users" && user.is_admin && (
            <ContentPanel
              title="Gestión de Usuarios"
              headerAction={
                <button
                  className={STYLES.primaryButton}
                  onClick={() => setShowCreateModal(true)}
                >
                  <FiUsers className="w-5 h-5" />
                  Nuevo Usuario
                </button>
              }
            >
              <UserCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={() => {
                  setRefreshUsers((r) => !r);
                  setShowCreateModal(false);
                }}
              />
              <ProfileUsers
                refresh={refreshUsers}
                onUserUpdated={handleUserUpdated}
              />
            </ContentPanel>
          )}
        </div>
      </div>
    </main>
  );
};
