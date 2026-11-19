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
  marcarComoLeida: (id: number) => void;
  marcarTodasComoLeidas: () => void;
  eliminarNotificacion: (id: number) => void;
}

export const NotificacionesDropdown: React.FC<NotificacionesDropdownProps> = ({
  isOpen,
  onClose,
  notificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion
}) => {
  if (!isOpen) return null;

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle size={20} className="text-pn-ok" />;
      case 'warning':
        return <AlertCircle size={20} className="text-pn-warn" />;
      case 'error':
        return <AlertCircle size={20} className="text-pn-danger" />;
      default:
        return <Info size={20} className="text-pn-accent-text" />;
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
      <div className={`absolute right-0 mt-2 w-96 bg-pn-surface rounded-lg shadow-xl z-50 border border-pn-line`}>
        {/* Header */}
        <div className={`p-4 border-b border-pn-line flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <h3 className={`font-bold text-pn-ink`}>Notificaciones</h3>
            {noLeidas > 0 && (
              <span className="bg-pn-danger text-pn-surface text-xs px-2 py-1 rounded-full">
                {noLeidas}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-pn-muted hover:text-pn-ink-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Acciones */}
        {notificaciones.length > 0 && (
          <div className={`px-4 py-2 border-b border-pn-line flex justify-between`}>
            <button
              onClick={marcarTodasComoLeidas}
              className="text-sm text-pn-accent-text hover:text-pn-accent-text flex items-center gap-1"
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
              <Bell size={48} className="mx-auto text-pn-muted mb-3" />
              <p className="text-pn-muted">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y border-pn-line">
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-pn-surface-2 transition ${
                    !notif.leida ? `bg-pn-accent-soft` : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcono(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`font-semibold text-pn-ink text-sm`}>
                          {notif.titulo}
                        </p>
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-pn-accent rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-pn-ink-2 mt-1">
                        {notif.mensaje}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-pn-muted">{notif.fecha}</p>
                        <div className="flex gap-2">
                          {!notif.leida && (
                            <button
                              onClick={() => marcarComoLeida(notif.id)}
                              className="text-xs text-pn-accent-text hover:text-pn-accent-text"
                              title="Marcar como leída"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => eliminarNotificacion(notif.id)}
                            className="text-xs text-pn-danger hover:text-pn-danger"
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
