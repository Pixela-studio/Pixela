import { API_ENDPOINTS } from "../shared/apiEndpoints";
import { fetchFromAPI } from "../shared/apiHelpers";
import { UserResponse } from "./types";

/**
 * API de autenticación.
 *
 * El login, el registro y el logout los gestiona Auth.js (`signIn` / `signOut`
 * de `next-auth/react`); aquí solo queda la lectura del perfil.
 *
 * Se han eliminado los métodos heredados del backend Laravel: `login()` apuntaba
 * a `/api/auth/login`, una ruta que no existe; `register()` enviaba un payload
 * con `surname` y `password_confirmation` que el handler actual ignora, y
 * `logout()` borraba las cookies `XSRF-TOKEN` y `pixela_session` —ninguna de las
 * cuales usa Auth.js—, así que daba por cerrada una sesión que seguía viva.
 * Los tres guardaban además un token en `localStorage` que nadie leía.
 */
export const authAPI = {
  async getUser(): Promise<UserResponse> {
    return fetchFromAPI<UserResponse>(API_ENDPOINTS.AUTH.USER);
  },
};
