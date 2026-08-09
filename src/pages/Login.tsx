import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';
import { getSubdomainFromUrl, isValidSubdomain } from '../utils/tenantDetection';
import { UserRole } from '../types/api.types';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, clearError, user, isAuthenticated } = useAuthStore();
  const { tenant, loadTenantBySubdomain, error: tenantError } = useTenantStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: '', password: '' });
  const [tenantLoadError, setTenantLoadError] = useState<string | null>(null);

  // Load tenant on mount
  useEffect(() => {
    const subdomain = getSubdomainFromUrl();

    if (!subdomain) {
      setTenantLoadError('No se pudo detectar el tenant. Por favor, accede desde un subdominio válido.');
      return;
    }

    if (!isValidSubdomain(subdomain)) {
      setTenantLoadError('El subdominio no es válido.');
      return;
    }

    // Load tenant data
    loadTenantBySubdomain(subdomain).catch(() => {
      setTenantLoadError('No se pudo cargar la información del tenant.');
    });
  }, [loadTenantBySubdomain]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const route = getDefaultRouteForRole(user.role);
      navigate(route, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors when user types
  useEffect(() => {
    clearError();
  }, [email, password, clearError]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors({ email: '', password: '' });

    // Validate inputs
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setValidationErrors(newErrors);

    // If validation fails, stop
    if (newErrors.email || newErrors.password) {
      return;
    }

    // Check tenant is loaded
    if (!tenant) {
      setTenantLoadError('No se ha cargado la información del tenant. Recarga la página.');
      return;
    }

    try {
      // Call login from authStore
      await login(email, password, tenant.id);

      // Redirect will happen automatically via useEffect when user is set
    } catch (error: any) {
      // Error is already set in authStore
      console.error('Login error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Show tenant loading error
  if (tenantLoadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Configuración</h2>
          <p className="text-gray-600 mb-4">{tenantLoadError}</p>
          <p className="text-sm text-gray-500">
            Asegúrate de acceder desde un subdominio válido (ej: universidad.localhost:3000)
          </p>
        </div>
      </div>
    );
  }

  // Show loading while tenant loads
  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(to bottom right, ${tenant.primaryColor}, ${tenant.secondaryColor})`
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with tenant branding */}
          <div
            className="p-8 text-center"
            style={{
              background: `linear-gradient(to right, ${tenant.primaryColor}, ${tenant.secondaryColor})`
            }}
          >
            <div className="flex justify-center mb-4">
              {tenant.logo ? (
                <img src={tenant.logo} alt={tenant.name} className="h-16 w-auto" />
              ) : (
                <div className="bg-white rounded-full p-4">
                  <GraduationCap className="w-12 h-12" style={{ color: tenant.primaryColor }} />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{tenant.name}</h1>
            <p className="text-blue-100">Plataforma Educativa Virtual</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>

            {/* API Error Message */}
            {authError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}

            {tenantError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{tenantError}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="estudiante@example.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-12 py-3 border ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Recordar sesión</span>
                </label>
                <button
                  onClick={() => alert('Funcionalidad de recuperación de contraseña próximamente')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                style={{
                  background: isLoading
                    ? undefined
                    : `linear-gradient(to right, ${tenant.primaryColor}, ${tenant.secondaryColor})`
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Al iniciar sesión, aceptas los Términos de Servicio y Política de Privacidad
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center text-white text-sm">
          <p>© 2025 {tenant.name} - Educación Virtual de Calidad</p>
        </div>
      </div>
    </div>
  );
}

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
