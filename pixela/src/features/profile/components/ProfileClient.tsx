"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { UserResponse } from "@/api/auth/types";
import { User } from "@/api/users/types";
import { ProfileFormData } from "@/features/profile/types/profileTypes";
import { usersAPI } from "@/api/users/users";
import { ApiError, parseApiErrorMessage } from "@/api/shared/apiHelpers";
import { logger } from "@/lib/logger";
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
import type { IconType } from "react-icons";
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
  pageWrapper: "min-h-screen bg-pixela-ink relative overflow-x-hidden",

  // Main Content Area
  mainContent: "max-w-7xl mx-auto px-4 md:px-8 pb-20",

  // Tabs (Premium Style)
  tabsContainer:
    "grid grid-cols-2 sm:flex sm:flex-wrap justify-center md:justify-start gap-2 mb-10 border-b border-white/10",
  tabButton: (isActive: boolean) =>
    clsx(
      "px-2 sm:px-6 py-4 sm:py-3 text-[13px] sm:text-sm font-medium transition-colors duration-300 relative flex flex-col sm:flex-row items-center justify-center gap-2",
      isActive ? "text-white" : "text-gray-400 hover:text-white",
    ),
  tabIndicator: (isActive: boolean) =>
    clsx(
      "absolute bottom-0 left-0 w-full h-0.5 bg-pixela-accent transition-transform duration-300 ease-out-expo",
      isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0",
    ),
  tabIcon: "text-2xl sm:text-lg relative",

  // Content Layout
  contentWrapper: "min-h-[400px] animate-fade-in",

  // Botones Generales
  primaryButton:
    "btn btn-primary btn-sm",

  // Notificaciones
  notification:
    "fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right backdrop-blur-md border border-white/10",
  notificationSuccess: "bg-green-500/10 border-green-500/20 text-green-400",
  notificationError: "bg-red-500/10 border-red-500/20 text-red-400",

  // Loading/Redirect Overlay
  loadingOverlay:
    "fixed inset-0 bg-pixela-ink/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center",
} as const;

type ProfileTab = { id: TabType; label: string; icon: IconType };

const BASE_TABS: ProfileTab[] = [
  { id: "profile", label: "General", icon: FiSettings },
  { id: "library", label: "Biblioteca", icon: FiGrid },
  { id: "reviews", label: "Reseñas", icon: FaRegComments },
  { id: "favorites", label: "Favoritos", icon: FaRegBookmark },
];

const ADMIN_TAB: ProfileTab = { id: "users", label: "Usuarios", icon: FiUsers };

const DEFAULT_TAB: TabType = "profile";

const tabId = (id: TabType) => `profile-tab-${id}`;
const panelId = (id: TabType) => `profile-panel-${id}`;

/** Pestaña pedida en `?tab=`; si no existe (o es de admin sin serlo), la general. */
const resolveTab = (param: string | null, tabs: ProfileTab[]): TabType =>
  tabs.find((tab) => tab.id === param)?.id ?? DEFAULT_TAB;

export const ProfileClient = ({ user: initialUser }: ProfileClientProps) => {
  const updateUser = useAuthStore((state) => state.updateUser);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserResponse>(initialUser);
  const [redirecting, setRedirecting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshUsers, setRefreshUsers] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tabs = user.is_admin ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS;
  const tabRefs = useRef<Partial<Record<TabType, HTMLButtonElement | null>>>({});

  // La pestaña vive en la URL (`/profile?tab=library`) para que el footer y
  // cualquier enlace puedan abrir una concreta. El estado local da respuesta
  // inmediata al pulsar y se reajusta si la URL cambia por fuera (por ejemplo,
  // al pulsar "Mi biblioteca" en el footer estando ya en el perfil).
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    resolveTab(tabParam, tabs),
  );
  const [lastTabParam, setLastTabParam] = useState(tabParam);
  if (tabParam !== lastTabParam) {
    setLastTabParam(tabParam);
    setActiveTab(resolveTab(tabParam, tabs));
  }

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === DEFAULT_TAB) params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Patrón de pestañas de WAI-ARIA: solo la activa está en el orden de Tab y
  // las flechas (más Inicio y Fin) mueven el foco y activan la pestaña.
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = tabs.findIndex((tab) => tab.id === activeTab);
    let next: number | null = null;

    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;

    event.preventDefault();
    const target = tabs[next].id;
    changeTab(target);
    tabRefs.current[target]?.focus();
  };

  // Use the extracted hook for stats
  const { stats, refreshStats } = useProfileStats();

  // Auto-hide notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Tras cambiar la contraseña cerramos la sesión y llevamos al login.
  //
  // Antes esto hacía `window.location.replace("http://localhost:3000")`: una URL
  // absoluta de desarrollo que en producción sacaba al usuario de la aplicación.
  // Además la sesión anterior seguía viva, así que el cambio de contraseña no
  // invalidaba nada.
  useEffect(() => {
    if (!redirecting) return;

    const timer = setTimeout(() => {
      void signOut({ callbackUrl: "/login" });
    }, 1500);

    return () => clearTimeout(timer);
  }, [redirecting]);

  const handleSubmitProfile = async (data: ProfileFormData) => {
    const isChangingPassword = Boolean(data.password?.trim());

    try {
      const payload: Partial<UserResponse> & { current_password?: string } = {
        user_id: user.user_id,
        name: data.name,
        email: data.email,
        photo_url:
          data.photo_url !== undefined ? data.photo_url : user.photo_url,
        cover_url:
          data.cover_url !== undefined ? data.cover_url : user.cover_url,
      };

      if (isChangingPassword) {
        payload.password = data.password;
        // La API exige la contraseña actual para cambiar la propia.
        payload.current_password = data.current_password;
      }

      const updatedUser = await usersAPI.update(payload as UserResponse);
      const userToSet = "user" in updatedUser ? updatedUser.user : updatedUser;

      if (isChangingPassword) {
        setRedirecting(true);
        return;
      }

      setUser(userToSet as UserResponse);
      updateUser(userToSet as UserResponse);
      setIsEditing(false);
      setSuccessMessage("¡Perfil actualizado correctamente!");
    } catch (error) {
      logger.error("Error updating profile", error);
      setSuccessMessage(
        error instanceof ApiError
          ? `Error: ${parseApiErrorMessage(error)}`
          : "Error al actualizar el perfil",
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
      <ProfileStatsBar stats={stats} onTabChange={changeTab} />

      {/* Main Content */}
      <div className={STYLES.mainContent}>
        {/* Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Secciones del perfil"
          className={STYLES.tabsContainer}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                type="button"
                role="tab"
                id={tabId(tab.id)}
                aria-selected={isActive}
                aria-controls={panelId(tab.id)}
                tabIndex={isActive ? 0 : -1}
                onClick={() => changeTab(tab.id)}
                onKeyDown={handleTabKeyDown}
                className={STYLES.tabButton(isActive)}
              >
                <tab.icon aria-hidden="true" className={STYLES.tabIcon} />
                {tab.label}
                <div aria-hidden="true" className={STYLES.tabIndicator(isActive)} />
              </button>
            );
          })}
        </div>

        {/* Dynamic Content */}
        <div
          role="tabpanel"
          id={panelId(activeTab)}
          aria-labelledby={tabId(activeTab)}
          tabIndex={0}
          className={STYLES.contentWrapper}
        >
          {/* "Actividad Reciente" se quitó: mostraba siempre el mismo texto
              vacío, sin datos detrás. Vuelve cuando haya actividad real. */}
          {activeTab === "profile" && !isEditing && (
            <div className="max-w-3xl animate-fade-in">
              <ProfileInfo
                user={{ ...user, user_id: user.user_id }}
                onEdit={() => setIsEditing(true)}
              />
            </div>
          )}

          {activeTab === "profile" && isEditing && (
            <div className="w-full animate-fade-in">
              <UpdateProfileForm
                initialData={{
                  name: user.name,
                  email: user.email,
                  photo_url: user.photo_url,
                  // Faltaba: el formulario abría siempre sin la portada actual,
                  // así que la vista previa aparecía vacía aunque hubiera una.
                  cover_url: user.cover_url,
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
