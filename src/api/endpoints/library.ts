import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/library/dto
export type LoanStatus = 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';

export interface BookCreateDto {
  titulo: string;
  autor: string;
  isbn?: string;
  categoria: string;
  editorial?: string;
  anio?: number;
  descripcion?: string;
  portadaUrl?: string;
  ubicacion?: string;
  ejemplaresTotal?: number;
}

export type BookUpdateDto = Partial<BookCreateDto>;

export interface QueryBooksParams {
  search?: string;
  categoria?: string;
  soloDisponibles?: string;
}

export const libraryApi = {
  getBooks: async (params?: QueryBooksParams) => {
    const response = await apiClient.get<any>('/api/v1/library/books', { params });
    return { data: response.data };
  },
  getBookById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/library/books/${id}`);
    return { data: response.data };
  },
  createBook: async (data: BookCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/library/books', data);
    return { data: response.data };
  },
  updateBook: async (id: string, data: BookUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/library/books/${id}`, data);
    return { data: response.data };
  },
  deleteBook: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/library/books/${id}`);
    return { data: response.data };
  },
  getCategories: async () => {
    const response = await apiClient.get<any>('/api/v1/library/categories');
    return { data: response.data };
  },
  getStats: async () => {
    const response = await apiClient.get<any>('/api/v1/library/stats');
    return { data: response.data };
  },
  // Prestamos
  getMyLoans: async () => {
    const response = await apiClient.get<any>('/api/v1/library/loans/my');
    return { data: response.data };
  },
  getAllLoans: async (params?: { estado?: LoanStatus; studentId?: string }) => {
    const response = await apiClient.get<any>('/api/v1/library/loans', { params });
    return { data: response.data };
  },
  createLoan: async (bookId: string, options?: { studentId?: string; dias?: number }) => {
    const response = await apiClient.post<any>('/api/v1/library/loans', {
      bookId,
      ...options,
    });
    return { data: response.data };
  },
  returnLoan: async (id: string) => {
    const response = await apiClient.post<any>(`/api/v1/library/loans/${id}/return`);
    return { data: response.data };
  },
  renewLoan: async (id: string, dias?: number) => {
    const response = await apiClient.post<any>(`/api/v1/library/loans/${id}/renew`, {
      dias,
    });
    return { data: response.data };
  },
  // Reservas
  getMyReservations: async () => {
    const response = await apiClient.get<any>('/api/v1/library/reservations/my');
    return { data: response.data };
  },
  getAllReservations: async () => {
    const response = await apiClient.get<any>('/api/v1/library/reservations');
    return { data: response.data };
  },
  createReservation: async (bookId: string, fechaExpiracion?: string) => {
    const response = await apiClient.post<any>('/api/v1/library/reservations', {
      bookId,
      fechaExpiracion,
    });
    return { data: response.data };
  },
  cancelReservation: async (id: string) => {
    const response = await apiClient.post<any>(
      `/api/v1/library/reservations/${id}/cancel`
    );
    return { data: response.data };
  },
};
