import { UserResponse } from "@/api/auth/types";
/**
 * Interfaz para los datos del formulario de perfil
 * @interface ProfileFormData
 * @property {string} name - Nombre del usuario
 * @property {string} email - Email del usuario
 * @property {string} password - Contraseña del usuario
 * @property {string} password_confirmation - Confirmación de la contraseña del usuario
 * @property {string} created_at - Fecha de creación del usuario
 * @property {boolean} is_admin - Si es administrador
 * @property {string} photo_url - URL de la imagen del usuario
 */
export interface ProfileFormData {
  name: string;
  email: string;
  /** Contraseña nueva. Solo se envía si el usuario la rellena. */
  password?: string;
  password_confirmation?: string;
  /** Contraseña actual: la API la exige para cambiar la propia contraseña. */
  current_password?: string;
  cover_url?: string;
  created_at: string;
  is_admin: boolean;
  photo_url?: string;
}

/**
 * Interfaz para el formulario de perfil
 * @interface UpdateProfileFormProps
 * @property {Object} initialData - Datos iniciales del formulario
 * @property {string} initialData.name - Nombre del usuario
 * @property {string} initialData.email - Email del usuario
 * @property {string} initialData.password - Contraseña del usuario
 * @property {string} initialData.photo_url - URL de la imagen del usuario
 * @property {function} onCancel - Función para cancelar el formulario
 * @property {function} onSubmit - Función para enviar el formulario
 */
export interface UpdateProfileFormProps {
  initialData: {
    name: string;
    email: string;
    password?: string;
    photo_url?: string;
    cover_url?: string;
  };
  onCancel: () => void;
  onSubmit: (data: ProfileFormData) => void;
}

/**
 * Interfaz para el error del formulario de perfil
 * @interface ProfileErrorProps
 * @property {string} message - Mensaje de error
 */
export interface ProfileErrorProps {
  message?: string;
}

/**
 * Props para el componente ProfileClient
 * @interface ProfileClientProps
 * @property {UserResponse} user - Usuario
 */
export interface ProfileClientProps {
  user: UserResponse;
}
