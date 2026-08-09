import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/api.types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // User not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // User doesn't have permission, redirect to their appropriate dashboard
      return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
    }
  }

  // User is authenticated and has the correct role
  return <Outlet />;
};

/**
 * Get default route for user role
 */
function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return '/estudiante';
    case UserRole.TEACHER:
      return '/docente';
    case UserRole.TENANT_ADMIN:
      return '/admin';
    case UserRole.SUPER_ADMIN:
      // SUPER_ADMIN usa el panel de administración (no existe ruta /super-admin)
      return '/admin';
    default:
      return '/login';
  }
}
