import { apiClient } from '../client';

export interface TransactionCreateDto {
  tipo: 'INGRESO' | 'EGRESO';
  categoria: string;
  concepto: string;
  monto: number;
  fecha: string;
  metodoPago?: string;
  referencia?: string;
  estudiante?: string;
  descripcion?: string;
  comprobante?: string;
  estado: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'RECHAZADO';
  creadoPor: string;
}

export const financeApi = {
  // Vista del estudiante
  getMyInvoices: async () => {
    const response = await apiClient.get('/api/v1/finance/my-invoices');
    return { data: response.data };
  },
  getMyFinancialSummary: async () => {
    const response = await apiClient.get('/api/v1/finance/my-summary');
    return { data: response.data };
  },
  getAllTransactions: async (params?: any) => {
    const response = await apiClient.get('/api/v1/finance/transactions', { params });
    return { data: response.data };
  },
  getTransactionById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/finance/transactions/${id}`);
    return { data: response.data };
  },
  createTransaction: async (data: TransactionCreateDto) => {
    const response = await apiClient.post('/api/v1/finance/transactions', data);
    return { data: response.data };
  },
  updateTransaction: async (id: string, data: Partial<TransactionCreateDto>) => {
    const response = await apiClient.patch(`/api/v1/finance/transactions/${id}`, data);
    return { data: response.data };
  },
  deleteTransaction: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/finance/transactions/${id}`);
    return { data: response.data };
  },
  getTransactionStats: async () => {
    const response = await apiClient.get('/api/v1/finance/transactions/stats');
    return { data: response.data };
  },
  getAllAccounts: async (params?: any) => {
    const response = await apiClient.get('/api/v1/finance/accounts', { params });
    return { data: response.data };
  },
  createAccount: async (data: any) => {
    const response = await apiClient.post('/api/v1/finance/accounts', data);
    return { data: response.data };
  },
  updateAccount: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/v1/finance/accounts/${id}`, data);
    return { data: response.data };
  },
  deleteAccount: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/finance/accounts/${id}`);
    return { data: response.data };
  },
  getAllBudgets: async (params?: any) => {
    const response = await apiClient.get('/api/v1/finance/budgets', { params });
    return { data: response.data };
  },
  createBudget: async (data: any) => {
    const response = await apiClient.post('/api/v1/finance/budgets', data);
    return { data: response.data };
  },
  updateBudget: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/v1/finance/budgets/${id}`, data);
    return { data: response.data };
  },
  deleteBudget: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/finance/budgets/${id}`);
    return { data: response.data };
  },
};
