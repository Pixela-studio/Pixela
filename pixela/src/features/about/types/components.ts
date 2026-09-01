import { ReactNode } from 'react';

/**
 * Interfaz que define la estructura de una tarjeta de característica
 * @interface FeatureCard
 */
export interface FeatureCard {
  icon: ReactNode;
  title: string;
  description: string;
  isComingSoon?: boolean;
} 