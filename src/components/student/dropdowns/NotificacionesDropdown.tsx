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
      info: 'border-pn-accent-line bg-pn-accent-soft',
      warning: 'border-pn-warn bg-pn-warn-soft',
      success: 'border-pn-ok bg-pn-ok-soft',
      error: 'border-pn-danger bg-pn-danger-soft'
    };
    return colores[tipo as keyof typeof colores] || colores.info;
  };

  const getTipoIconColor = (tipo: string) => {
    const colores = {
      info: 'text-pn-accent-text',
      warning: 'text-pn-warn',
      success: 'text-pn-ok',
      error: 'text-pn-danger'
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
        className={`fixed top-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-pn-surface rounded-lg shadow-2xl z-50 max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b border-pn-line flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Bell className="text-pn-accent-text" size={20} />
            <h3 className={`font-bold text-pn-ink`}>
              Notificaciones
              {notificacionesNoLeidas > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-pn-danger text-pn-surface text-xs rounded-full">
                  {notificacionesNoLeidas}
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-pn-muted hover:text-pn-ink-2 p-1 rounded hover:bg-pn-surface-3"
          >
            <X size={20} />
          </button>
        </div>

        {/* Acciones rápidas */}
        {notificacionesNoLeidas > 0 && (
          <div className={`px-4 py-2 border-b border-pn-line flex justify-end`}>
            <button
              onClick={marcarTodasComoLeidas}
              className="text-sm text-pn-accent-text hover:text-pn-accent-text flex items-center gap-1 font-semibold"
            >
              <CheckCheck size={16} />
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {notificacionesPaginadas.length > 0 ? (
            <div className="divide-y divide-pn-line">
              {notificacionesPaginadas.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-pn-surface-2 transition ${
                    !notif.leida ? 'border-l-4 ' + getTipoColor(notif.tipo) : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 ${getTipoIconColor(notif.tipo)}`}>
                      <Bell size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold text-sm text-pn-ink ${!notif.leida ? 'font-bold' : ''}`}>
                          {notif.titulo}
                        </h4>
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-pn-accent rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className={`text-sm text-pn-ink-2 mb-2 line-clamp-2`}>
                        {notif.mensaje}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-pn-muted">{notif.fecha}</span>
                        <div className="flex gap-1">
                          {!notif.leida && (
                            <button
                              onClick={() => marcarComoLeida(notif.id)}
                              className="p-1 text-pn-accent-text hover:bg-pn-accent-soft rounded transition"
                              title="Marcar como leída"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => eliminarNotificacion(notif.id)}
                            className="p-1 text-pn-danger hover:bg-pn-danger-soft rounded transition"
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
              <Bell size={48} className={`mx-auto mb-3 text-pn-muted`} />
              <p className={`font-semibold text-pn-ink mb-1`}>No hay notificaciones</p>
              <p className="text-sm text-pn-muted">Estás al día con tus notificaciones</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className={`p-3 border-t border-pn-line flex items-center justify-between`}>
            <p className="text-sm text-pn-muted">
              Página {paginaActual} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className={`p-2 rounded transition ${
                  paginaActual === 1
                    ? 'text-pn-muted cursor-not-allowed'
                    : 'text-pn-accent-text hover:bg-pn-accent-soft'
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className={`p-2 rounded transition ${
                  paginaActual === totalPaginas
                    ? 'text-pn-muted cursor-not-allowed'
                    : 'text-pn-accent-text hover:bg-pn-accent-soft'
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
