import React, { useState } from 'react';
import { Mail, X, Check, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

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
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  marcarComoLeido: (id: number) => void;
  eliminarMensaje: (id: number) => void;
  onVerMensaje: (mensaje: Mensaje) => void;
}

export const MensajesDropdown: React.FC<MensajesDropdownProps> = ({
  isOpen,
  onClose,
  mensajes,
  darkMode,
  card,
  text,
  border,
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
      <div className={`absolute right-0 mt-2 w-[480px] ${card} rounded-lg shadow-xl z-50 border ${border}`}>
        {/* Header */}
        <div className={`p-4 border-b ${border} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Mail size={20} />
            <h3 className={`font-bold ${text}`}>Mensajes</h3>
            {noLeidos > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {noLeidos} nuevos
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

        {/* Lista de Mensajes */}
        <div className="max-h-[450px] overflow-y-auto">
          {mensajesRecibidos.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No tienes mensajes</p>
            </div>
          ) : (
            <div className={`divide-y ${border}`}>
              {mensajesPaginados.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                    !mensaje.leido ? `${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}` : ''
                  }`}
                  onClick={() => {
                    if (!mensaje.leido) {
                      marcarComoLeido(mensaje.id);
                    }
                    onVerMensaje(mensaje);
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${text} text-sm`}>
                              {mensaje.remitente}
                            </p>
                            {!mensaje.leido && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className={`text-sm ${text} font-medium mt-1`}>
                            {truncateText(mensaje.asunto, 50)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 flex-shrink-0">{mensaje.fecha}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {truncateText(mensaje.mensaje, 80)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerMensaje(mensaje);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
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
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
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
          <div className={`p-3 border-t ${border} flex justify-between items-center`}>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Página {paginaActual} de {totalPaginas} ({mensajesRecibidos.length} mensajes)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => irAPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className={`p-1 rounded ${
                  paginaActual === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => irAPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className={`p-1 rounded ${
                  paginaActual === totalPaginas
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900'
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
