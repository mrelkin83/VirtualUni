import React from 'react';
import {
  Home,
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  Award,
  Mail,
  DollarSign,
  Send,
  FileCheck,
  User,
  X,
  Library,
  Clock,
  UsersRound,
  LogOut
} from 'lucide-react';
import { StudentSectionType } from '../../../types/student.types';

interface StudentSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSection: StudentSectionType;
  setActiveSection: (section: StudentSectionType) => void;
  mensajesNoLeidos: number;
  onLogout?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeSection,
  setActiveSection,
  mensajesNoLeidos,
  onLogout
}) => {
  const menuItems = [
    { id: 'inicio' as StudentSectionType, icon: Home, label: 'Inicio' },
    { id: 'cursos' as StudentSectionType, icon: BookOpen, label: 'Mis Cursos' },
    { id: 'clases' as StudentSectionType, icon: Video, label: 'Clases' },
    { id: 'tareas' as StudentSectionType, icon: FileText, label: 'Tareas' },
    { id: 'examenes' as StudentSectionType, icon: ClipboardList, label: 'Exámenes' },
    { id: 'calificaciones' as StudentSectionType, icon: Award, label: 'Calificaciones' },
    { id: 'horarios' as StudentSectionType, icon: Clock, label: 'Horarios' },
    { id: 'biblioteca' as StudentSectionType, icon: Library, label: 'Biblioteca' },
    { id: 'comunidad' as StudentSectionType, icon: UsersRound, label: 'Comunidad' },
    { id: 'mensajes' as StudentSectionType, icon: Mail, label: 'Mensajes', badge: mensajesNoLeidos },
    { id: 'certificados' as StudentSectionType, icon: FileCheck, label: 'Certificados' },
    { id: 'tramites' as StudentSectionType, icon: Send, label: 'Trámites' },
    { id: 'financiero' as StudentSectionType, icon: DollarSign, label: 'Estado de Cuenta' },
    { id: 'perfil' as StudentSectionType, icon: User, label: 'Mi Perfil' }
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
            <p className="text-blue-200 text-sm">Portal Estudiante</p>
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
