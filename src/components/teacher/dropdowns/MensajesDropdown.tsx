import React, { useState } from 'react';
import { Mail, X, Check, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { pulsable } from '../../../utils/pulsable';

interface Mensaje {
  id: number;
  remitente: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
  tipo: 'recibido' | 'enviado';
}

interface MensajesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  mensajes: Mensaje[];
  marcarComoLeido: (id: number) => void;
  eliminarMensaje: (id: number) => void;
  onVerMensaje: (mensaje: Mensaje) => void;
}

export const MensajesDropdown: React.FC<MensajesDropdownProps> = ({
  isOpen,
  onClose,
  mensajes,
  marcarComoLeido,
  eliminarMensaje,
  onVerMensaje
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
      <div className={`absolute right-0 mt-2 w-[480px] max-w-[calc(100vw-2rem)] bg-pn-surface rounded-lg shadow-xl z-50 border border-pn-line`}>
        {/* Header */}
        <div className={`p-4 border-b border-pn-line flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Mail size={20} />
            <h3 className={`font-bold text-pn-ink`}>Mensajes</h3>
            {noLeidos > 0 && (
              <span className="bg-pn-danger text-pn-surface text-xs px-2 py-1 rounded-full">
                {noLeidos} nuevos
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

        {/* Lista de Mensajes */}
        <div className="max-h-[450px] overflow-y-auto">
          {mensajesRecibidos.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={48} className="mx-auto text-pn-muted mb-3" />
              <p className="text-pn-muted">No tienes mensajes</p>
            </div>
          ) : (
            <div className={`divide-y border-pn-line`}>
              {mensajesPaginados.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`p-4 hover:bg-pn-surface-2 transition cursor-pointer ${
                    !mensaje.leido ? `bg-pn-accent-soft` : ''
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
                            <p className={`font-semibold text-pn-ink text-sm`}>
                              {mensaje.remitente}
                            </p>
                            {!mensaje.leido && (
                              <div className="w-2 h-2 bg-pn-accent rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className={`text-sm text-pn-ink font-medium mt-1`}>
                            {truncateText(mensaje.asunto, 50)}
                          </p>
                        </div>
                        <p className="text-xs text-pn-muted flex-shrink-0">{mensaje.fecha}</p>
                      </div>
                      <p className="text-sm text-pn-ink-2 mt-1">
                        {truncateText(mensaje.mensaje, 80)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerMensaje(mensaje);
                          }}
                          className="text-xs text-pn-accent-text hover:text-pn-accent-text flex items-center gap-1"
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
                            className="text-xs text-pn-ok hover:text-pn-ok flex items-center gap-1"
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
                          className="text-xs text-pn-danger hover:text-pn-danger flex items-center gap-1"
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
          <div className={`p-3 border-t border-pn-line flex justify-between items-center`}>
            <p className="text-sm text-pn-ink-2">
              Página {paginaActual} de {totalPaginas} ({mensajesRecibidos.length} mensajes)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => irAPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className={`p-1 rounded ${
                  paginaActual === 1
                    ? 'text-pn-muted cursor-not-allowed'
                    : 'text-pn-accent-text hover:bg-pn-accent-soft'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => irAPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className={`p-1 rounded ${
                  paginaActual === totalPaginas
                    ? 'text-pn-muted cursor-not-allowed'
                    : 'text-pn-accent-text hover:bg-pn-accent-soft'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
