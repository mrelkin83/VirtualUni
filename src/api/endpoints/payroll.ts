import { apiClient } from '../client';

export interface PayrollEmployeeCreateDto {
  nombre: string;
  identificacion: string;
  cargo: string;
  departamento: string;
  salarioBase: number;
  cuentaBancaria: string;
  banco: string;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'incapacidad';
  fechaIngreso: string;
}

export interface PayrollRecordCreateDto {
  empleadoId: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaPago: string;
  salarioBase: number;
  bonificaciones?: number;
  deducciones?: number;
  estado: 'borrador' | 'procesado' | 'pagado';
}

export interface ProcessPayrollDto {
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaPago: string;
  bonificacionPorcentaje?: number;
  empleadosIds?: string[];
}

export const payrollApi = {
  employees: {
    getAll: async (params?: any) => {
      const response = await apiClient.get('/api/v1/payroll/employees', { params });
      return { data: response.data };
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/api/v1/payroll/employees/${id}`);
      return { data: response.data };
    },
    create: async (data: PayrollEmployeeCreateDto) => {
      const response = await apiClient.post('/api/v1/payroll/employees', data);
      return { data: response.data };
    },
    update: async (id: string, data: Partial<PayrollEmployeeCreateDto>) => {
      const response = await apiClient.patch(`/api/v1/payroll/employees/${id}`, data);
      return { data: response.data };
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/payroll/employees/${id}`);
      return { data: response.data };
    },
    getHistory: async (id: string) => {
      const response = await apiClient.get(`/api/v1/payroll/employees/${id}/history`);
      return { data: response.data };
    },
  },

  records: {
    getAll: async (params?: any) => {
      const response = await apiClient.get('/api/v1/payroll/records', { params });
      return { data: response.data };
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/api/v1/payroll/records/${id}`);
      return { data: response.data };
    },
    create: async (data: PayrollRecordCreateDto) => {
      const response = await apiClient.post('/api/v1/payroll/records', data);
      return { data: response.data };
    },
    update: async (id: string, data: Partial<PayrollRecordCreateDto>) => {
      const response = await apiClient.patch(`/api/v1/payroll/records/${id}`, data);
      return { data: response.data };
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/payroll/records/${id}`);
      return { data: response.data };
    },
  },

  processPayroll: async (data: ProcessPayrollDto) => {
    const response = await apiClient.post('/api/v1/payroll/process', data);
    return { data: response.data };
  },

  getStats: async (params?: { periodo?: string }) => {
    const response = await apiClient.get('/api/v1/payroll/stats', { params });
    return { data: response.data };
  },

  exportToPDF: async (periodo: string) => {
    const response = await apiClient.get(`/api/v1/payroll/export/${periodo}`);
    return { data: response.data };
  },
};
