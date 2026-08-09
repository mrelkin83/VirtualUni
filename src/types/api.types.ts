// User and Auth Types
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
}

// Tenant Types
export enum Plan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum TenantStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  plan: Plan;
  status: TenantStatus;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  enableMessaging: boolean;
  enableVideoConf: boolean;
  enablePayments: boolean;
  enableCertificates: boolean;
  maxStudents: number;
  maxTeachers: number;
  maxCourses: number;
  storageGB: number;
  currentStudents: number;
  currentTeachers: number;
  currentCourses: number;
  currentStorageGB: number;
  createdAt: string;
  updatedAt: string;
  trialEndsAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Notification Types
export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  icono?: string;
  leida: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateNotificationDto {
  userId: string;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  icono?: string;
}
