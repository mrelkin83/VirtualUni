import React from 'react';
import { Menu, Bell, Mail, Moon, Sun, User } from 'lucide-react';

interface StudentHeaderProps {
  title: string;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setNotificacionesAbiertas: (open: boolean) => void;
  setMensajesAbiertas: (open: boolean) => void;
  setNuevoMensajeModal: (open: boolean) => void;
  mensajesNoLeidos: number;
  notificacionesNoLeidas: number;
  card: string;
  text: string;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  title,
  darkMode,
  setDarkMode,
  setSidebarOpen,
  setNotificacionesAbiertas,
  setMensajesAbiertas,
  mensajesNoLeidos,
  notificacionesNoLeidas,
  card,
  text
}) => {
  return (
    <div className={`${card} shadow-md p-4 flex justify-between items-center sticky top-0 z-30`}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-600 hover:text-gray-800"
        >
          <Menu size={24} />
        </button>
        <h2 className={`text-xl font-bold ${text}`}>{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-600'} hover:opacity-80`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Messages */}
        <button
          onClick={() => setMensajesAbiertas(true)}
          className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Mensajes"
        >
          <Mail size={20} className={text} />
          {mensajesNoLeidos > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
              {mensajesNoLeidos}
            </span>
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotificacionesAbiertas(true)}
          className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Notificaciones"
        >
          <Bell size={20} className={text} />
          {notificacionesNoLeidas > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
              {notificacionesNoLeidas}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            <User size={20} />
          </div>
          <div className="hidden md:block">
            <p className={`font-semibold text-sm ${text}`}>Dayla Otalvaro</p>
            <p className="text-xs text-gray-500">Estudiante</p>
          </div>
        </div>
      </div>
    </div>
  );
};
