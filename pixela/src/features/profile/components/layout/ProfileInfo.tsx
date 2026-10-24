'use client';

import { useState, useEffect } from 'react';
import type { UserResponse } from '@/api/auth/types';
import { FiUser, FiMail, FiCalendar, FiShield, FiEdit } from 'react-icons/fi';
import clsx from 'clsx';
import { ProfileInfoProps } from '@/features/profile/types/layout';
/**
 * Estilos constantes para el componente ProfileInfo
 */
const STYLES = {
  container: 'p-6 lg:p-8 bg-pixela-surface rounded-2xl',
  header: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8',
  title: 'font-display text-3xl md:text-4xl tracking-[-0.02em] text-white',
  editButton: clsx(
    'flex items-center gap-2',
    'bg-pixela-accent text-pixela-dark',
    'px-6 py-2 rounded-full',
    'hover:bg-pixela-accent/80',
    'transition-colors duration-300',
    'w-full sm:w-auto justify-center'
  ),
  content: 'flex flex-col gap-6',
  field: 'pb-4 border-b border-white/10 last:border-b-0',
  label: 'text-sm text-gray-400 mb-2',
  value: clsx(
    'flex items-center gap-2',
    'text-base text-white'
  ),
  icon: 'text-pixela-accent w-5 h-5 flex-shrink-0'
} as const;


/**
 * Componente que muestra la información del perfil del usuario
 * @param {ProfileInfoProps} props - Props del componente
 * @returns {JSX.Element} Componente ProfileInfo
 */
export const ProfileInfo = ({ user: initialUser, onEdit, refreshTrigger }: ProfileInfoProps) => {
  const [user, setUser] = useState<UserResponse>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, refreshTrigger]);

  /**
   * Formatea una fecha en formato localizado
   * @param {string} [date] - Fecha a formatear
   * @returns {string} Fecha formateada o mensaje de no disponible
   */
  const formatDate = (date?: string): string => {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className={STYLES.container}>
      <div className={STYLES.header}>
        <h2 className={STYLES.title}>
          Detalles de la cuenta
        </h2>
        <button 
          onClick={onEdit}
          className={STYLES.editButton}
          title="Editar perfil"
        >
          <FiEdit />
          <span>Editar</span>
        </button>
      </div>

      <div className={STYLES.content}>
        <div className={STYLES.field}>
          <p className={STYLES.label}>Username</p>
          <div className={STYLES.value}>
            <FiUser className={STYLES.icon} />
            <span>{user.name}</span>
          </div>
        </div>
        
        <div className={STYLES.field}>
          <p className={STYLES.label}>Correo electrónico</p>
          <div className={STYLES.value}>
            <FiMail className={STYLES.icon} />
            <span>{user.email}</span>
          </div>
        </div>
        
        <div className={STYLES.field}>
          <p className={STYLES.label}>Fecha de registro</p>
          <div className={STYLES.value}>
            <FiCalendar className={STYLES.icon} />
            <span>{formatDate(user.created_at)}</span>
          </div>
        </div>
        
        {user.is_admin !== undefined && (
          <div className={STYLES.field}>
            <p className={STYLES.label}>Tipo de cuenta</p>
            <div className={STYLES.value}>
              <FiShield className={STYLES.icon} />
              <span>{user.is_admin ? 'Administrador' : 'Usuario'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 