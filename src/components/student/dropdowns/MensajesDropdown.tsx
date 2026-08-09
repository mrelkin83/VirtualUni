import React, { useState } from 'react';
import { Mail, X, Check, Trash2, ChevronLeft, ChevronRight, Eye, Send } from 'lucide-react';
import { StudentMessage } from '../../../types/student.types';

interface MensajesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  mensajes: StudentMessage[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  marcarComoLeido: (id: number) => void;
  eliminarMensaje: (id: number) => void;
  onVerMensaje: (mensaje: StudentMessage) => void;
  onNuevoMensaje: () => void;
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
        className={`fixed top-20 right-4 w-[480px] max-w-[calc(100vw-2rem)] ${card} rounded-lg shadow-2xl z-50 border ${border} max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${border} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Mail className="text-blue-600" size={20} />
            <h3 className={`font-bold ${text}`}>
              Mensajes
              {noLeidos > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {noLeidos} nuevos
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

        {/* Botón Nuevo Mensaje */}
        <div className={`px-4 py-2 border-b ${border}`}>
          <button
            onClick={() => {
              onNuevoMensaje();
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition"
          >
            <Send size={16} />
            Nuevo Mensaje
          </button>
        </div>

        {/* Lista de Mensajes */}
        <div className="flex-1 overflow-y-auto">
          {mensajesRecibidos.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={48} className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`font-semibold ${text} mb-1`}>No tienes mensajes</p>
              <p className="text-sm text-gray-500">Tu bandeja de entrada está vacía</p>
            </div>
          ) : (
            <div className={`divide-y divide-gray-200 dark:divide-gray-700`}>
              {mensajesPaginados.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer ${
                    !mensaje.leido ? `border-l-4 border-blue-500 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}` : ''
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
                            <p className={`font-semibold ${text} text-sm ${!mensaje.leido ? 'font-bold' : ''}`}>
                              {mensaje.remitente}
                            </p>
                            {!mensaje.leido && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className={`text-sm ${text} ${!mensaje.leido ? 'font-semibold' : ''} mt-1`}>
                            {truncateText(mensaje.asunto, 50)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 flex-shrink-0">{mensaje.fecha}</p>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 line-clamp-2`}>
                        {truncateText(mensaje.preview, 100)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerMensaje(mensaje);
                          }}
                          className="text-xs text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition flex items-center gap-1"
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
                            className="text-xs text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 px-2 py-1 rounded transition flex items-center gap-1"
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
                          className="text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 px-2 py-1 rounded transition flex items-center gap-1"
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
          <div className={`p-3 border-t ${border} flex items-center justify-between`}>
            <p className="text-sm text-gray-500">
              Página {paginaActual} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => irAPagina(paginaActual - 1)}
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
                onClick={() => irAPagina(paginaActual + 1)}
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
