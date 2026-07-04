/**
 * Respuesta de autenticación
 * @interface AuthResponse
 * @property {string} token - Token de autenticación
 * @property {Object} user - Usuario autenticado
 * @property {number} user.id - ID del usuario
 * @property {string} user.name - Nombre del usuario
 * @property {string} user.surname - Apellido del usuario
 */
export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    photo_url?: string;
    is_admin: boolean;
    password: string;
    created_at: string;
  };
}

/**
 * Respuesta de usuario
 * @interface UserResponse
 * @property {number} user_id - ID del usuario
 * @property {string} name - Nombre del usuario
 * @property {string} email - Email del usuario
 * @property {string | undefined} photo_url - URL de la imagen del usuario
 * @property {boolean} is_admin - Si es administrador
 */
export interface UserResponse {
  user_id: number;
  name: string;
  email: string;
  photo_url?: string;
  cover_url?: string;
  is_admin: boolean;
  password: string;
  created_at: string;
  updated_at: string;
}
