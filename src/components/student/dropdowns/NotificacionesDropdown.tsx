import React, { useState } from 'react';
import { X, Check, CheckCheck, Bell, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: 'info' | 'warning' | 'success' | 'error';
  icono?: string;
}

interface NotificacionesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notificaciones: Notificacion[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  marcarComoLeida: (id: number) => void;
  marcarTodasComoLeidas: () => void;
  eliminarNotificacion: (id: number) => void;
}

export const NotificacionesDropdown: React.FC<NotificacionesDropdownProps> = ({
  isOpen,
  onClose,
  notificaciones,
  darkMode,
  card,
  text,
  border,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion
}) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const notificacionesPorPagina = 10;

  // Calcular notificaciones para la página actual
  const indexUltima = paginaActual * notificacionesPorPagina;
  const indexPrimera = indexUltima - notificacionesPorPagina;
  const notificacionesPaginadas = notificaciones.slice(indexPrimera, indexUltima);
  const totalPaginas = Math.ceil(notificaciones.length / notificacionesPorPagina);

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const getTipoColor = (tipo: string) => {
    const colores = {
      info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      warning: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
      success: 'border-green-500 bg-green-50 dark:bg-green-900/20',
      error: 'border-red-500 bg-red-50 dark:bg-red-900/20'
    };
    return colores[tipo as keyof typeof colores] || colores.info;
  };

  const getTipoIconColor = (tipo: string) => {
    const colores = {
      info: 'text-blue-600',
      warning: 'text-orange-600',
      success: 'text-green-600',
      error: 'text-red-600'
    };
    return colores[tipo as keyof typeof colores] || colores.info;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay para cerrar al hacer clic fuera */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div
        className={`fixed top-20 right-4 w-96 max-w-[calc(100vw-2rem)] ${card} rounded-lg shadow-2xl z-50 max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${border} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Bell className="text-blue-600" size={20} />
            <h3 className={`font-bold ${text}`}>
              Notificaciones
              {notificacionesNoLeidas > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {notificacionesNoLeidas}
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Acciones rápidas */}
        {notificacionesNoLeidas > 0 && (
          <div className={`px-4 py-2 border-b ${border} flex justify-end`}>
            <button
              onClick={marcarTodasComoLeidas}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              <CheckCheck size={16} />
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {notificacionesPaginadas.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notificacionesPaginadas.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                    !notif.leida ? 'border-l-4 ' + getTipoColor(notif.tipo) : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 ${getTipoIconColor(notif.tipo)}`}>
                      <Bell size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${text} ${!notif.leida ? 'font-bold' : ''}`}>
                          {notif.titulo}
                        </h4>
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 line-clamp-2`}>
                        {notif.mensaje}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{notif.fecha}</span>
                        <div className="flex gap-1">
                          {!notif.leida && (
                            <button
                              onClick={() => marcarComoLeida(notif.id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition"
                              title="Marcar como leída"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => eliminarNotificacion(notif.id)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell size={48} className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`font-semibold ${text} mb-1`}>No hay notificaciones</p>
              <p className="text-sm text-gray-500">Estás al día con tus notificaciones</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className={`p-3 border-t ${border} flex items-center justify-between`}>
            <p className="text-sm text-gray-500">
              Página {paginaActual} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className={`p-2 rounded transition ${
                  paginaActual === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className={`p-2 rounded transition ${
                  paginaActual === totalPaginas
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
