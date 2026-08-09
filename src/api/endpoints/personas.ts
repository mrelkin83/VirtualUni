import { apiClient } from '../client';

/**
 * Alta de personas desde el panel de administración.
 *
 * No existe un `POST /users`: el alta de una cuenta pasa por crear su ficha.
 * `POST /students` y `POST /teachers` crean el usuario y su perfil en una sola
 * operación, y ambas exigen ser TENANT_ADMIN. El registro público
 * (`/auth/register`) quedó restringido a crear alumnado, porque aceptaba el rol
 * en el cuerpo sin autenticación alguna.
 */
export interface AltaPersonaDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const personasApi = {
  crearEstudiante: async (data: AltaPersonaDto & { program?: string; semester?: string }) => {
    const response = await apiClient.post('/api/v1/students', data);
    return { data: response.data };
  },
  crearDocente: async (data: AltaPersonaDto & { department?: string; specialization?: string }) => {
    const response = await apiClient.post('/api/v1/teachers', data);
    return { data: response.data };
  },
  listarUsuarios: async () => {
    const response = await apiClient.get('/api/v1/users');
    return { data: response.data };
  },
  actualizarUsuario: async (
    id: string,
    data: { firstName?: string; lastName?: string; isActive?: boolean },
  ) => {
    const response = await apiClient.patch(`/api/v1/users/${id}`, data);
    return { data: response.data };
  },
  desactivarUsuario: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/users/${id}`);
    return { data: response.data };
  },
};
