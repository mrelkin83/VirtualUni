import React, { useState } from 'react';
import { Mail, X, Check, Trash2, ChevronLeft, ChevronRight, Eye, Send } from 'lucide-react';
import { StudentMessage } from '../../../types/student.types';
import { pulsable } from '../../../utils/pulsable';

interface MensajesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  mensajes: StudentMessage[];
  marcarComoLeido: (id: number) => void;
  eliminarMensaje: (id: number) => void;
  onVerMensaje: (mensaje: StudentMessage) => void;
  onNuevoMensaje: () => void;
}

export const MensajesDropdown: React.FC<MensajesDropdownProps> = ({
  isOpen,
  onClose,
  mensajes,
  marcarComoLeido,
  eliminarMensaje,
  onVerMensaje,
  onNuevoMensaje
}) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const mensajesPorPagina = 10;

  if (!isOpen) return null;

  // Filtrar solo mensajes recibidos
  const mensajesRecibidos = mensajes.filter(m => m.tipo === 'recibido');
  const noLeidos = mensajesRecibidos.filter(m => !m.leido).length;

  // Paginación
  const totalPaginas = Math.ceil(mensajesRecibidos.length / mensajesPorPagina);
  const indiceInicio = (paginaActual - 1) * mensajesPorPagina;
  const indiceFin = indiceInicio + mensajesPorPagina;
  const mensajesPaginados = mensajesRecibidos.slice(indiceInicio, indiceFin);

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div
        className={`fixed top-20 right-4 w-[480px] max-w-[calc(100vw-2rem)] bg-pn-surface rounded-lg shadow-2xl z-50 border border-pn-line max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b border-pn-line flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Mail className="text-pn-accent-text" size={20} />
            <h3 className={`font-bold text-pn-ink`}>
              Mensajes
              {noLeidos > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-pn-accent text-pn-accent-ink text-xs rounded-full">
                  {noLeidos} nuevos
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

        {/* Botón Nuevo Mensaje */}
        <div className={`px-4 py-2 border-b border-pn-line`}>
          <button
            onClick={() => {
              onNuevoMensaje();
              onClose();
            }}
            className="w-full bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition"
          >
            <Send size={16} />
            Nuevo Mensaje
          </button>
        </div>

        {/* Lista de Mensajes */}
        <div className="flex-1 overflow-y-auto">
          {mensajesRecibidos.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={48} className={`mx-auto mb-3 text-pn-muted`} />
              <p className={`font-semibold text-pn-ink mb-1`}>No tienes mensajes</p>
              <p className="text-sm text-pn-muted">Tu bandeja de entrada está vacía</p>
            </div>
          ) : (
            <div className={`divide-y divide-pn-line`}>
              {mensajesPaginados.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`p-4 hover:bg-pn-surface-2 transition cursor-pointer ${
                    !mensaje.leido ? `border-l-4 border-pn-accent-line bg-pn-accent-soft` : ''
                  }`}
                  {...pulsable(() => {
                    if (!mensaje.leido) {
                      marcarComoLeido(mensaje.id);
                    }
                    onVerMensaje(mensaje);
                  })}
                >
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold text-pn-ink text-sm ${!mensaje.leido ? 'font-bold' : ''}`}>
                              {mensaje.remitente}
                            </p>
                            {!mensaje.leido && (
                              <div className="w-2 h-2 bg-pn-accent rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className={`text-sm text-pn-ink ${!mensaje.leido ? 'font-semibold' : ''} mt-1`}>
                            {truncateText(mensaje.asunto, 50)}
                          </p>
                        </div>
                        <p className="text-xs text-pn-muted flex-shrink-0">{mensaje.fecha}</p>
                      </div>
                      <p className={`text-sm text-pn-ink-2 mt-1 line-clamp-2`}>
                        {truncateText(mensaje.preview, 100)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerMensaje(mensaje);
                          }}
                          className="text-xs text-pn-accent-text hover:bg-pn-accent-soft px-2 py-1 rounded transition flex items-center gap-1"
                          title="Ver mensaje completo"
                        >
                          <Eye size={14} />
                          Ver
                        </button>
                        {!mensaje.leido && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarComoLeido(mensaje.id);
                            }}
                            className="text-xs text-pn-ok hover:bg-pn-ok-soft px-2 py-1 rounded transition flex items-center gap-1"
                            title="Marcar como leído"
                          >
                            <Check size={14} />
                            Leído
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarMensaje(mensaje.id);
                          }}
                          className="text-xs text-pn-danger hover:bg-pn-danger-soft px-2 py-1 rounded transition flex items-center gap-1"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                onClick={() => irAPagina(paginaActual - 1)}
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
                onClick={() => irAPagina(paginaActual + 1)}
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
