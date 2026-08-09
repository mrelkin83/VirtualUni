import { apiClient } from '../client';

export interface EmployeeCreateDto {
  nombre: string;
  identificacion: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  fechaIngreso: string;
  tipoContrato: 'indefinido' | 'fijo' | 'prestacion' | 'pasantia';
  salario: number;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'incapacidad';
  direccion: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  estadoCivil: 'soltero' | 'casado' | 'union_libre' | 'divorciado' | 'viudo';
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  contactoEmergenciaRelacion: string;
}

export interface VacationRequestCreateDto {
  empleadoId: string;
  fechaInicio: string;
  fechaFin: string;
  diasSolicitados: number;
  motivo: string;
  estado?: 'pendiente' | 'aprobada' | 'rechazada';
}

export interface ApproveVacationDto {
  approved: boolean;
  comentario?: string;
}

export const hrApi = {
  employees: {
    getAll: async (params?: any) => {
      const response = await apiClient.get('/api/v1/hr/employees', { params });
      return { data: response.data };
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/api/v1/hr/employees/${id}`);
      return { data: response.data };
    },
    create: async (data: EmployeeCreateDto) => {
      const response = await apiClient.post('/api/v1/hr/employees', data);
      return { data: response.data };
    },
    update: async (id: string, data: Partial<EmployeeCreateDto>) => {
      const response = await apiClient.patch(`/api/v1/hr/employees/${id}`, data);
      return { data: response.data };
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/hr/employees/${id}`);
      return { data: response.data };
    },
    getStats: async () => {
      const response = await apiClient.get('/api/v1/hr/employees/stats');
      return { data: response.data };
    },
    getByDepartment: async (departamento: string) => {
      const response = await apiClient.get(`/api/v1/hr/employees/by-department/${departamento}`);
      return { data: response.data };
    },
    getVacationBalance: async (id: string) => {
      const response = await apiClient.get(`/api/v1/hr/employees/${id}/vacation-balance`);
      return { data: response.data };
    },
  },

  vacations: {
    getAll: async (params?: any) => {
      const response = await apiClient.get('/api/v1/hr/vacations', { params });
      return { data: response.data };
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/api/v1/hr/vacations/${id}`);
      return { data: response.data };
    },
    create: async (data: VacationRequestCreateDto) => {
      const response = await apiClient.post('/api/v1/hr/vacations', data);
      return { data: response.data };
    },
    update: async (id: string, data: Partial<VacationRequestCreateDto>) => {
      const response = await apiClient.patch(`/api/v1/hr/vacations/${id}`, data);
      return { data: response.data };
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/hr/vacations/${id}`);
      return { data: response.data };
    },
    approve: async (id: string, data: ApproveVacationDto) => {
      const response = await apiClient.post(`/api/v1/hr/vacations/${id}/approve`, data);
      return { data: response.data };
    },
    getPending: async () => {
      const response = await apiClient.get('/api/v1/hr/vacations/pending');
      return { data: response.data };
    },
    getUpcoming: async () => {
      const response = await apiClient.get('/api/v1/hr/vacations/upcoming');
      return { data: response.data };
    },
  },
};
