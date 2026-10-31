import { ReactNode } from "react";

/**
 * Tipos de pestañas
 * @type {TabType}
 */
export type TabType = "profile" | "reviews" | "favorites" | "users" | "library" | "lists";

/**
 * Props para el componente ProfileTabs
 * @interface ProfileTabsProps
 * @property {TabType} activeTab - Pestaña activa
 * @property {function} onTabChange - Función para cambiar la pestaña
 * @property {boolean} isAdmin - Indica si el usuario es administrador
 */
export interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAdmin: boolean;
}

/**
 * Props para el componente TabNavigationButton
 * @interface TabNavigationButtonProps
 * @property {string} label - Etiqueta de la pestaña
 * @property {ReactNode} icon - Icono de la pestaña
 * @property {boolean} isActive - Indica si la pestaña está activa
 * @property {function} onClick - Función para cambiar la pestaña
 */
export interface TabNavigationButtonProps {
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
}
