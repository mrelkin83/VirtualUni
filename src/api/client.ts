import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/api.config';
import { ApiError } from '../types/api.types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Add JWT token and Tenant ID
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
        const tenantId = localStorage.getItem(AUTH_CONFIG.tenantKey);

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (tenantId && config.headers) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        // La instancia se crea con `Content-Type: application/json` por
        // defecto, y ese valor pisaba el multipart de las subidas: el
        // navegador ya no añadía el boundary y el backend respondía "No se
        // recibió ningún archivo en el campo file". Ninguna subida de archivo
        // podía funcionar. Se retira la cabecera cuando el cuerpo es
        // FormData para que el navegador la genere él.
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type'];
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle errors and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for token refresh
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenKey);

          if (!refreshToken) {
            this.handleLogout();
            return Promise.reject(error);
          }

          try {
            const response = await axios.post(
              `${API_CONFIG.baseURL}/api/v1/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem(AUTH_CONFIG.tokenKey, accessToken);
            localStorage.setItem(AUTH_CONFIG.refreshTokenKey, newRefreshToken);

            // Retry all failed requests
            this.processQueue(null);
            this.isRefreshing = false;

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.isRefreshing = false;
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });

    this.failedQueue = [];
  }

  private handleLogout() {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
    localStorage.removeItem(AUTH_CONFIG.tenantKey);
    localStorage.removeItem(AUTH_CONFIG.userKey);

    // Redirect to login
    window.location.href = '/login';
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data?.message || 'An error occurred',
        statusCode: error.response.status,
        error: error.response.data?.error,
      };
    } else if (error.request) {
      // No response from server
      return {
        message: 'No response from server. Please check your connection.',
        statusCode: 0,
      };
    } else {
      // Request setup error
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0,
      };
    }
  }

  // Public methods
  public get<T>(url: string, config = {}) {
    return this.client.get<T>(url, config);
  }

  public post<T>(url: string, data?: unknown, config = {}) {
    return this.client.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: unknown, config = {}) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T>(url: string, data?: unknown, config = {}) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config);
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
