import React from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, Trash2 } from 'lucide-react';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: 'info' | 'success' | 'warning' | 'error';
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
  if (!isOpen) return null;

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className={`absolute right-0 mt-2 w-96 ${card} rounded-lg shadow-xl z-50 border ${border}`}>
        {/* Header */}
        <div className={`p-4 border-b ${border} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <h3 className={`font-bold ${text}`}>Notificaciones</h3>
            {noLeidas > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {noLeidas}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Acciones */}
        {notificaciones.length > 0 && (
          <div className={`px-4 py-2 border-b ${border} flex justify-between`}>
            <button
              onClick={marcarTodasComoLeidas}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Check size={14} />
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Lista de Notificaciones */}
        <div className="max-h-[400px] overflow-y-auto">
          {notificaciones.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y ${border}">
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    !notif.leida ? `${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}` : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcono(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`font-semibold ${text} text-sm`}>
                          {notif.titulo}
                        </p>
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notif.mensaje}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400">{notif.fecha}</p>
                        <div className="flex gap-2">
                          {!notif.leida && (
                            <button
                              onClick={() => marcarComoLeida(notif.id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                              title="Marcar como leída"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => eliminarNotificacion(notif.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
