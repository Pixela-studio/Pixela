import { useCallback, useState } from "react";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { User } from "@/api/users/types";
import { usersAPI } from "@/api/users/users";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { FiLoader, FiAlertCircle, FiEdit, FiCheck, FiX } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { UserAvatar } from "@/features/profile/components/avatar/UserAvatar";
import clsx from "clsx";
import { ProfileUsersProps } from "@/features/profile/types/layout";

/**
 * Mensajes de error constantes
 */
const ERROR_MESSAGES = {
  LOAD: "No se pudieron cargar los usuarios.",
  DELETE: "No se pudo eliminar el usuario",
  UPDATE: "No se pudo actualizar el usuario",
} as const;

/**
 * Estilos constantes para el componente ProfileUsers
 */
const STYLES = {
  // Layout base
  container: "space-y-1",

  // Estados de carga y error
  loadingContainer: "flex items-center justify-center p-8",
  loadingIcon: "w-8 h-8 text-pixela-primary animate-spin",
  errorContainer: "flex items-center justify-center p-8 text-red-500",
  errorIcon: "w-6 h-6 mr-2",

  // Estado vacío
  emptyContainer: "flex flex-col items-center justify-center p-8 text-gray-400",
  emptyIcon: "w-12 h-12 mb-4",
  emptyText: "text-lg",

  // Item de usuario
  userItem:
    "flex items-center bg-dark-opacity pt-2 px-4 rounded gap-4",
  avatarContainer: "min-w-[32px] max-w-[32px] flex justify-center",
  contentContainer: "flex flex-col justify-center flex-2 pl-5",

  // Formulario de edición
  editForm:
    "grid grid-cols-1 sm:grid-cols-3 gap-4 gap-y-2 w-full max-w-lg mx-auto mb-8",
  formGroup: "flex flex-col",
  label: "mb-1 block pl-4 text-xs font-medium text-white/70",

  // Inputs y controles
  // Patrón de input de DESIGN.md en tamaño compacto: `surface`, borde
  // `white/10`, foco con borde de acento y anillo `focus-visible`.
  input: clsx(
    "w-full h-10 rounded-full border border-white/10 bg-pixela-surface px-4 text-sm text-white",
    "placeholder:text-white/40 hover:border-white/20 focus:border-pixela-accent/60",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30",
    "transition-[border-color,box-shadow] duration-200 ease-out-expo",
  ),
  select: clsx(
    "w-full h-10 rounded-full border border-white/10 bg-pixela-surface pl-4 pr-10 text-sm text-white",
    "hover:border-white/20 focus:border-pixela-accent/60",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30",
    "transition-[border-color,box-shadow] duration-200 ease-out-expo appearance-none cursor-pointer",
  ),
  selectIcon: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ec1b69' stroke-opacity='0.4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundSize: "1rem",
    backgroundPosition: "right 0.75rem center",
    backgroundRepeat: "no-repeat",
  },

  // Información del usuario
  userName: "font-semibold text-white",
  userEmail: "text-gray-400",
  userRole: (isAdmin: boolean) =>
    clsx(
      "text-xs py-1 px-3 rounded-md w-fit font-medium mt-1",
      isAdmin
        ? "bg-pixela-accent/10 text-pixela-accent border border-pixela-accent/20"
        : "bg-pixela-raised/60 text-gray-400 border border-white/10",
    ),

  // Acciones
  actionsContainer: "flex items-center gap-2 ml-auto",
  actionButton: (color: string) =>
    clsx("p-2 transition-colors duration-200", color),
  actionIcon: "w-5 h-5",
} as const;

/**
 * Componente que muestra la lista de usuarios
 * @param {ProfileUsersProps} props - Props del componente
 * @returns {JSX.Element} Componente ProfileUsers
 */
const EMPTY_USERS: User[] = [];

export const ProfileUsers = ({ refresh, onUserUpdated }: ProfileUsersProps) => {
  // `refresh` es un booleano que el padre invierte para forzar una recarga; se
  // incluye en las dependencias del fetcher para que el hook vuelva a pedir.
  const fetchUsers = useCallback(async () => {
    void refresh;
    const data = await usersAPI.list();
    return Array.isArray(data) ? data : EMPTY_USERS;
  }, [refresh]);

  const {
    data: users,
    loading,
    error,
    reload: reloadUsers,
    setError,
  } = useAsyncResource(fetchUsers, EMPTY_USERS, {
    errorMessage: ERROR_MESSAGES.LOAD,
    label: "users",
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  /** Usuario pendiente de confirmar su borrado. */
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  /**
   * Maneja la eliminación de un usuario
   * @param {number} userId - ID del usuario a eliminar
   */
  const handleDelete = async (userId: number) => {
    setDeletingId(userId);
    try {
      await usersAPI.delete(userId);
      setUserToDelete(null);
      await reloadUsers();
    } catch {
      setUserToDelete(null);
      setError(ERROR_MESSAGES.DELETE);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Inicia la edición de un usuario
   * @param {User} user - Usuario a editar
   */
  const handleStartEdit = (user: User) => {
    setEditingId(user.user_id);
    setEditingUser({ ...user });
  };

  /**
   * Cancela la edición de un usuario
   */
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingUser(null);
  };

  /**
   * Guarda los cambios de un usuario
   */
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const userToUpdate = { ...editingUser };
      delete userToUpdate.password;

      await usersAPI.update(userToUpdate);
      await reloadUsers();

      // Notificar al componente padre sobre la actualización
      onUserUpdated?.(editingUser);

      setEditingId(null);
      setEditingUser(null);
    } catch {
      setError(ERROR_MESSAGES.UPDATE);
    }
  };

  /**
   * Maneja los cambios en los campos de edición
   * @param {keyof User} field - Campo a actualizar
   * @param {string | boolean} value - Nuevo valor
   */
  const handleEditChange = (field: keyof User, value: string | boolean) => {
    if (!editingUser) return;
    setEditingUser((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (loading) {
    return (
      <div className={STYLES.loadingContainer}>
        <FiLoader className={STYLES.loadingIcon} />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className={STYLES.errorContainer}>
        <FiAlertCircle className={STYLES.errorIcon} />
        <span>{error}</span>
      </div>
    );
  }

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className={STYLES.emptyContainer}>
        <FiAlertCircle className={STYLES.emptyIcon} />
        <p className={STYLES.emptyText}>No hay usuarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.user_id}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5 transition-colors duration-200 hover:bg-white/10 hover:border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Avatar - Siempre visible */}
            <div className="flex-shrink-0">
              <UserAvatar
                profileImage={user.photo_url}
                name={user.name}
                size="md"
                className="w-12 h-12 md:w-16 md:h-16 text-lg"
              />
            </div>

            {/* Contenido Principal */}
            <div className="flex-grow w-full md:w-auto">
              {editingId === user.user_id ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
                  <div>
                    <label htmlFor={`user-${user.user_id}-name`} className={STYLES.label}>
                      Nombre
                    </label>
                    <input
                      id={`user-${user.user_id}-name`}
                      type="text"
                      value={editingUser?.name || ""}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      className={STYLES.input}
                    />
                  </div>
                  <div>
                    <label htmlFor={`user-${user.user_id}-email`} className={STYLES.label}>
                      Email
                    </label>
                    <input
                      id={`user-${user.user_id}-email`}
                      type="email"
                      value={editingUser?.email || ""}
                      onChange={(e) =>
                        handleEditChange("email", e.target.value)
                      }
                      className={STYLES.input}
                    />
                  </div>
                  <div>
                    <label htmlFor={`user-${user.user_id}-role`} className={STYLES.label}>
                      Rol
                    </label>
                    <select
                      id={`user-${user.user_id}-role`}
                      value={editingUser?.is_admin ? "true" : "false"}
                      onChange={(e) =>
                        handleEditChange("is_admin", e.target.value === "true")
                      }
                      className={STYLES.select}
                      style={STYLES.selectIcon}
                    >
                      <option value="true">Administrador</option>
                      <option value="false">Usuario</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-lg">
                      {user.name}
                    </span>
                    <span className="text-sm text-gray-400">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-end gap-3">
                    <span
                      className={clsx(
                        "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border",
                        user.is_admin
                          ? "bg-pixela-accent/10 border-pixela-accent/30 text-pixela-accent"
                          : "bg-white/5 border-white/10 text-gray-400",
                      )}
                    >
                      {user.is_admin ? "Admin" : "Miembro"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 pt-4 md:pt-0 border-t border-white/10 md:border-0 w-full md:w-auto justify-center md:justify-end">
              {editingId === user.user_id ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit()}
                    aria-label={`Guardar los cambios de ${user.name}`}
                    className="rounded-full p-2 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors duration-200"
                  >
                    <FiCheck className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelEdit()}
                    aria-label={`Descartar los cambios de ${user.name}`}
                    className="rounded-full p-2 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(user)}
                    aria-label={`Editar a ${user.name}`}
                    className="rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    <FiEdit className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserToDelete(user)}
                    disabled={deletingId === user.user_id}
                    aria-label={`Borrar a ${user.name}`}
                    className="rounded-full p-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                  >
                    {deletingId === user.user_id ? (
                      <FiLoader className="w-5 h-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <FaTrash className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Confirmación y no "deshacer": borrar una cuenta arrastra sus reseñas,
          favoritos y biblioteca, y afecta a otra persona. */}
      <ConfirmDialog
        isOpen={userToDelete !== null}
        title={`¿Borrar a ${userToDelete?.name ?? "este usuario"}?`}
        description="Se borrarán su cuenta, sus reseñas, sus favoritos y su biblioteca. No se puede deshacer."
        confirmLabel="Borrar usuario"
        busy={userToDelete !== null && deletingId === userToDelete.user_id}
        onConfirm={() => {
          if (userToDelete) void handleDelete(userToDelete.user_id);
        }}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
