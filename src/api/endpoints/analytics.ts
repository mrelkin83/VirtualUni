import { apiClient } from '../client';

export const analyticsApi = {
  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats() {
    const response = await apiClient.get('/api/v1/analytics/dashboard');
    return response.data;
  },

  /**
   * Obtener analíticas de estudiantes
   */
  async getStudentAnalytics() {
    const response = await apiClient.get('/api/v1/analytics/students');
    return response.data;
  },

  /**
   * Obtener analíticas de cursos
   */
  async getCourseAnalytics() {
    const response = await apiClient.get('/api/v1/analytics/courses');
    return response.data;
  },

  /**
   * Obtener analíticas de tareas
   */
  async getAssignmentAnalytics() {
    const response = await apiClient.get('/api/v1/analytics/assignments');
    return response.data;
  },

  /**
   * Obtener analíticas financieras
   */
  async getFinancialAnalytics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/api/v1/analytics/financial?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener tendencias mensuales
   */
  async getMonthlyTrends(months: number = 6) {
    const response = await apiClient.get(`/api/v1/analytics/trends?months=${months}`);
    return response.data;
  },

  /**
   * Obtener reporte completo
   */
  async getCompleteReport() {
    const response = await apiClient.get('/api/v1/analytics/report');
    return response.data;
  },
};
