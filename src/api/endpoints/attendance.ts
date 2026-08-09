import { apiClient } from '../client';

export type AttendanceState = 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'JUSTIFICADO';

// Debe coincidir con backend/src/modules/attendance/dto (ValidationPipe con forbidNonWhitelisted)
export interface AttendanceRecordDto {
  studentId: string;
  estado: AttendanceState;
  observacion?: string;
}

export interface BulkAttendanceDto {
  courseId: string;
  fecha: string; // YYYY-MM-DD
  registros: AttendanceRecordDto[];
}

export const attendanceApi = {
  registerBulk: async (data: BulkAttendanceDto) => {
    const response = await apiClient.post<any>('/api/v1/attendance/bulk', data);
    return { data: response.data };
  },
  getAll: async (params?: { courseId?: string; fecha?: string; from?: string; to?: string }) => {
    const response = await apiClient.get<any>('/api/v1/attendance', { params });
    return { data: response.data };
  },
  getMy: async (params?: { courseId?: string }) => {
    const response = await apiClient.get<any>('/api/v1/attendance/my', { params });
    return { data: response.data };
  },
  getCourseStats: async (courseId: string) => {
    const response = await apiClient.get<any>(`/api/v1/attendance/course/${courseId}/stats`);
    return { data: response.data };
  },
};
