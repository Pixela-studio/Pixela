import { API_ENDPOINTS } from "../shared/apiEndpoints";
import { fetchFromAPI } from "../shared/apiHelpers";
import { User } from "./types";

/**
 * API para usuarios
 * Esta funcion se encarga de realizar las operaciones CRUD para los usuarios
 * @namespace usersAPI
 * @description API para usuarios
 * @author Pixela
 * @version 1.0.0
 * @requires API_ENDPOINTS
 * @requires fetchFromAPI
 * @requires User
 */
export const usersAPI = {
    /**
     * Obtiene la lista de usuarios
     * @returns {Promise<User[]>} - Lista de usuarios
     */
    async list(): Promise<User[]> {
        const response = await fetchFromAPI<{ message: string; users: User[] }>(API_ENDPOINTS.USERS.LIST);
        return response.users;
    },

    /**
     * Crea un nuevo usuario
     * @param {User} user - Usuario a crear
     * @returns {Promise<User>} - Usuario creado
     */
    async create(user: User): Promise<User> {
        return fetchFromAPI<User>(API_ENDPOINTS.USERS.CREATE, {
            method: 'POST',
            body: JSON.stringify(user),
        });
    },

    /**
     * Actualiza un usuario
     * @param {User} user - Usuario a actualizar
     * @returns {Promise<User>} - Usuario actualizado
     */
    async update(user: User): Promise<User> {
        return fetchFromAPI<User>(API_ENDPOINTS.USERS.UPDATE.replace(':id', String(user.user_id)), {
            method: 'PUT',
            body: JSON.stringify(user),
        });
    },

    /**
     * Elimina un usuario
     * @param {number} userId - ID del usuario a eliminar
     */
    async delete(userId: number, currentPassword?: string): Promise<void> {
        await fetchFromAPI(API_ENDPOINTS.USERS.DELETE.replace(':id', String(userId)), {
            method: 'DELETE',
            // Borrar la propia cuenta exige la contraseña; un admin borrando a
            // otro usuario no manda cuerpo.
            ...(currentPassword !== undefined && {
                body: JSON.stringify({ current_password: currentPassword }),
            }),
        });
    },

    /** Cierra la sesión en todos los dispositivos (incluido este). */
    async revokeSessions(): Promise<void> {
        await fetchFromAPI(API_ENDPOINTS.USERS.SESSIONS, { method: 'DELETE' });
    },

    /** URL de descarga del JSON con todos los datos de la cuenta. */
    exportUrl: API_ENDPOINTS.USERS.EXPORT,
};