import React, { useState } from 'react';
import { Bell, Mail, Moon, Sun } from 'lucide-react';
import { NotificacionesDropdown } from '../dropdowns/NotificacionesDropdown';
import { MensajesDropdown } from '../dropdowns/MensajesDropdown';

interface TeacherHeaderProps {
  title: string;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  notificacionesAbiertas?: boolean;
  setNotificacionesAbiertas: (open: boolean) => void;
  setNuevoMensajeModal: (open: boolean) => void;
  notificaciones?: any[];
  mensajes?: any[];
  marcarComoLeida?: (id: number) => void;
  marcarTodasComoLeidas?: () => void;
  eliminarNotificacion?: (id: number) => void;
  marcarMensajeLeido?: (id: number, leido?: boolean) => void;
  eliminarMensaje?: (id: number) => void;
  setConversacionActiva?: (mensaje: any) => void;
  card: string;
  text: string;
  border?: string;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  title,
  darkMode,
  setDarkMode,
  notificacionesAbiertas = false,
  setNotificacionesAbiertas,
  notificaciones = [],
  mensajes = [],
  marcarComoLeida = () => {},
  marcarTodasComoLeidas = () => {},
  eliminarNotificacion = () => {},
  marcarMensajeLeido = () => {},
  eliminarMensaje = () => {},
  setConversacionActiva = () => {},
  card,
  text,
  border = ''
}) => {
  const [mensajesAbiertas, setMensajesAbiertas] = useState(false);

  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const mensajesNoLeidos = (mensajes || []).filter(
    m => m.tipo === 'recibido' && !m.leido
  ).length;

  return (
    <div className={`${card} shadow-sm p-4 flex justify-between items-center`}>
      <h2 className={`text-2xl font-bold ${text}`}>{title}</h2>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setMensajesAbiertas(!mensajesAbiertas)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <Mail size={24} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            {mensajesNoLeidos > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {mensajesNoLeidos}
              </span>
            )}
          </button>

          <MensajesDropdown
            isOpen={mensajesAbiertas}
            onClose={() => setMensajesAbiertas(false)}
            mensajes={mensajes}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            marcarComoLeido={marcarMensajeLeido}
            eliminarMensaje={eliminarMensaje}
            onVerMensaje={(mensaje) => {
              setMensajesAbiertas(false);
              setConversacionActiva(mensaje);
            }}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <Bell size={24} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            {noLeidas > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {noLeidas}
              </span>
            )}
          </button>

          <NotificacionesDropdown
            isOpen={notificacionesAbiertas}
            onClose={() => setNotificacionesAbiertas(false)}
            notificaciones={notificaciones}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            marcarComoLeida={marcarComoLeida}
            marcarTodasComoLeidas={marcarTodasComoLeidas}
            eliminarNotificacion={eliminarNotificacion}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            CM
          </div>
          <div className="hidden md:block">
            <p className={`text-sm font-semibold ${text}`}>Prof. Carlos Martínez</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              carlos.martinez@university.edu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
