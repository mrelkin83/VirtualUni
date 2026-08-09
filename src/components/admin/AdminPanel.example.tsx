/**
 * ARCHIVO DE EJEMPLO - Cómo usar los 5 componentes de administración
 * Este archivo muestra cómo integrar los componentes en un panel administrativo
 *
 * Ubicación: src/components/admin/AdminPanel.example.tsx
 *
 * Para usar en producción:
 * 1. Copiar este archivo como AdminPanel.tsx
 * 2. Importar los componentes de sections
 * 3. Agregar a tu router
 */

import React, { useState } from 'react';
import {
  Building2,
  Package,
  DollarSign,
  Users,
  Laptop,
  ChevronDown,
} from 'lucide-react';

// Importar los componentes de secciones
import {
  ActivosSection,
  InventarioSection,
  NominaSection,
  RecursosHumanosSection,
  CarnetizacionSection,
} from './sections';
import type { AdminSectionType } from '../../types/admin.types';

interface NavItem {
  id: AdminSectionType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export const AdminPanel: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AdminSectionType>('activos');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems: NavItem[] = [
    {
      id: 'activos',
      label: 'Activos',
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-blue-600',
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: <Package className="w-5 h-5" />,
      color: 'text-purple-600',
    },
    {
      id: 'nomina',
      label: 'Nómina',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
    },
    {
      id: 'recursoshumanos',
      label: 'Recursos Humanos',
      icon: <Users className="w-5 h-5" />,
      color: 'text-orange-600',
    },
    {
      id: 'carnetizacion',
      label: 'Carnetización',
      icon: <Laptop className="w-5 h-5" />,
      color: 'text-red-600',
    },
  ];

  const renderSection = () => {
    switch (currentSection) {
      case 'activos':
        return <ActivosSection />;
      case 'inventario':
        return <InventarioSection />;
      case 'nomina':
        return <NominaSection />;
      case 'recursoshumanos':
        return <RecursosHumanosSection />;
      case 'carnetizacion':
        return <CarnetizacionSection />;
      default:
        return <ActivosSection />;
    }
  };

  const currentNav = navItems.find((item) => item.id === currentSection);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 shadow-lg overflow-hidden`}
      >
        <div className="p-6">
          <h1 className={`font-bold ${sidebarOpen ? 'text-2xl' : 'text-xs text-center'}`}>
            {sidebarOpen ? 'Panel Admin' : 'PA'}
          </h1>
        </div>

        <nav className="mt-8 space-y-2 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentSection === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              title={item.label}
            >
              <span className={item.color}>{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition"
            title="Minimizar/Expandir"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                sidebarOpen ? 'rotate-90' : '-rotate-90'
              }`}
            />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-md p-6 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentNav && <div className={`${currentNav.color}`}>{currentNav.icon}</div>}
              <h2 className="text-2xl font-bold text-gray-900">
                {currentNav?.label || 'Panel Administrativo'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
                Ayuda
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Section Content */}
        <div className="p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;

/**
 * INSTRUCCIONES DE INTEGRACIÓN
 * ================================
 *
 * 1. En tu archivo de router (ej: App.tsx o routes.ts), agrega:
 *
 *    import { AdminPanel } from 'src/components/admin/AdminPanel';
 *
 *    // En tus rutas:
 *    {
 *      path: '/admin',
 *      element: <AdminPanel />,
 *      // Agregar ProtectedRoute si tienes protección
 *    }
 *
 * 2. Asegúrate que las APIs estén disponibles:
 *    - assetsApi
 *    - inventoryApi
 *    - payrollApi
 *    - hrApi
 *    - idCardsApi
 *
 * 3. El componente es completamente autónomo y no requiere props
 *
 * CARACTERÍSTICAS:
 * - Navegación lateral con iconos
 * - Compresión/expansión del sidebar
 * - Indicadores de color por sección
 * - Barra superior con información
 * - Secciones intercambiables
 * - Responsive (se adapta a móvil)
 *
 * PERSONALIZACIÓN:
 * - Cambiar colores: Modificar className de los items
 * - Agregar más secciones: Agregar nuevo item a navItems y case en renderSection
 * - Cambiar layout: Modificar estructura de grid/flex
 * - Agregar autenticación: Envolver con ProtectedRoute
 */
