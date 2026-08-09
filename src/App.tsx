import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types/api.types';
import Login from './pages/Login';

// Cada panel se carga bajo demanda: un usuario sólo descarga el suyo, en lugar
// de arrastrar los tres dashboards en el bundle inicial.
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function PantallaCarga() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
        <p className="text-gray-600 mt-4">Cargando...</p>
      </div>
    </div>
  );
}

function App() {
  const { initializeAuth } = useAuthStore();

  // Initialize authentication state from localStorage on app mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Suspense fallback={<PantallaCarga />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
            <Route path="/estudiante" element={<StudentDashboard />} />
            <Route path="/estudiante/*" element={<StudentDashboard />} />
          </Route>

          {/* Protected Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.TEACHER]} />}>
            <Route path="/docente" element={<TeacherDashboard />} />
            <Route path="/docente/*" element={<TeacherDashboard />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
