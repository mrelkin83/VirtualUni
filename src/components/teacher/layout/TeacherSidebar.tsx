import React from 'react';
import {
  Home,
  BookOpen,
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  BarChart3,
  Mail,
  Upload,
  Settings,
  UsersRound,
  X,
  Video,
  LogOut
} from 'lucide-react';
import { SectionType } from '../../../types/teacher.types';

interface TeacherSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
  mensajesNoLeidos?: number;
  tareasNoRevisadas?: number;
  onLogout?: () => void;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeSection,
  setActiveSection,
  mensajesNoLeidos = 0,
  tareasNoRevisadas = 0,
  onLogout
}) => {
  const menuItems = [
    { id: 'inicio' as SectionType, icon: Home, label: 'Inicio' },
    { id: 'cursos' as SectionType, icon: BookOpen, label: 'Mis Cursos' },
    { id: 'grupos' as SectionType, icon: UsersRound, label: 'Grupos' },
    { id: 'estudiantes' as SectionType, icon: Users, label: 'Estudiantes' },
    { id: 'tareas' as SectionType, icon: ClipboardCheck, label: 'Tareas', badge: tareasNoRevisadas },
    { id: 'examenes' as SectionType, icon: FileText, label: 'Exámenes' },
    { id: 'calificaciones' as SectionType, icon: BarChart3, label: 'Calificaciones' },
    { id: 'asistencia' as SectionType, icon: ClipboardCheck, label: 'Asistencia' },
    { id: 'mensajes' as SectionType, icon: Mail, label: 'Mensajes', badge: mensajesNoLeidos },
    { id: 'materiales' as SectionType, icon: Upload, label: 'Materiales' },
    { id: 'clases' as SectionType, icon: Video, label: 'Clases en Vivo' },
    { id: 'calendario' as SectionType, icon: Calendar, label: 'Calendario' },
    { id: 'analiticas' as SectionType, icon: BarChart3, label: 'Analíticas' },
    { id: 'configuracion' as SectionType, icon: Settings, label: 'Configuración' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-blue-700">
          <div>
            <h1 className="text-2xl font-bold">VirtualUni</h1>
            <p className="text-blue-200 text-sm">Panel Docente</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-blue-700 p-2 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-100px)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === item.id
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'hover:bg-blue-700 text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition text-white"
          >
            <LogOut size={20} />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        )}
      </div>
    </>
  );
};
