import React, { useState } from 'react';
import {
  X,
  Mail,
  Reply,
  Trash2,
  MailOpen,
  Archive,
  Paperclip,
  FileText,
  Send,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Mensaje {
  id: number;
  de?: string;
  para?: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  tipo: 'recibido' | 'enviado';
  leido?: boolean;
  adjuntos?: string[];
  respuestas?: {
    id: number;
    de: string;
    mensaje: string;
    fecha: string;
  }[];
}

interface MensajeDetalleModalProps {
  mensaje: Mensaje | null;
  isOpen: boolean;
  onClose: () => void;
  onMarcarLeido: (mensajeId: number, leido: boolean) => void;
  onEliminar: (mensajeId: number) => void;
  onResponder: (mensajeId: number, respuesta: string) => void;
  onArchivar?: (mensajeId: number) => void;
  onSiguiente?: () => void;
  onAnterior?: () => void;
  hayMensajesAnteriores?: boolean;
  hayMensajesSiguientes?: boolean;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const MensajeDetalleModal: React.FC<MensajeDetalleModalProps> = ({
  mensaje,
  isOpen,
  onClose,
  onMarcarLeido,
  onEliminar,
  onResponder,
  onArchivar,
  onSiguiente,
  onAnterior,
  hayMensajesAnteriores = false,
  hayMensajesSiguientes = false,
  darkMode,
  card,
  text,
  border,
}) => {
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [adjuntosRespuesta, setAdjuntosRespuesta] = useState<File[]>([]);

  if (!isOpen || !mensaje) return null;

  const handleEnviarRespuesta = () => {
    if (!respuesta.trim()) {
      alert('Por favor escribe una respuesta');
      return;
    }

    onResponder(mensaje.id, respuesta);
    setRespuesta('');
    setAdjuntosRespuesta([]);
    setMostrarRespuesta(false);
    alert('Respuesta enviada exitosamente');
  };

  const handleEliminar = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      onEliminar(mensaje.id);
      onClose();
    }
  };

  const handleMarcarLeido = () => {
    const nuevoEstado = !mensaje.leido;
    onMarcarLeido(mensaje.id, nuevoEstado);
  };

  const handleAdjuntarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAdjuntosRespuesta([...adjuntosRespuesta, ...Array.from(files)]);
    }
  };

  const handleEliminarAdjunto = (index: number) => {
    setAdjuntosRespuesta(adjuntosRespuesta.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${card} rounded-lg w-full max-w-4xl h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`p-6 ${border} border-b`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`${text} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition`}
                title="Cerrar"
              >
                <X size={24} />
              </button>
              <h3 className={`text-xl font-bold ${text}`}>
                {mensaje.tipo === 'recibido' ? 'Mensaje Recibido' : 'Mensaje Enviado'}
              </h3>
            </div>

            {/* Navegación entre mensajes */}
            <div className="flex items-center gap-2">
              <button
                onClick={onAnterior}
                disabled={!hayMensajesAnteriores}
                className={`p-2 rounded-lg transition ${
                  hayMensajesAnteriores
                    ? `${text} hover:bg-gray-200 dark:hover:bg-gray-700`
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="Mensaje anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={onSiguiente}
                disabled={!hayMensajesSiguientes}
                className={`p-2 rounded-lg transition ${
                  hayMensajesSiguientes
                    ? `${text} hover:bg-gray-200 dark:hover:bg-gray-700`
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="Mensaje siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 mt-4">
            {mensaje.tipo === 'recibido' && (
              <>
                <button
                  onClick={() => setMostrarRespuesta(!mostrarRespuesta)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Reply size={18} />
                  Responder
                </button>
                <button
                  onClick={handleMarcarLeido}
                  className={`flex items-center gap-2 px-4 py-2 ${border} border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${text}`}
                >
                  {mensaje.leido ? <Mail size={18} /> : <MailOpen size={18} />}
                  {mensaje.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                </button>
              </>
            )}
            {onArchivar && (
              <button
                onClick={() => onArchivar(mensaje.id)}
                className={`flex items-center gap-2 px-4 py-2 ${border} border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${text}`}
              >
                <Archive size={18} />
                Archivar
              </button>
            )}
            <button
              onClick={handleEliminar}
              className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition ml-auto"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Información del mensaje */}
          <div className={`${card} p-4 rounded-lg ${border} border`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <User className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold ${text}`}>
                        {mensaje.tipo === 'recibido' ? mensaje.de : `Para: ${mensaje.para}`}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {mensaje.tipo === 'recibido' ? 'Remitente' : 'Destinatario'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={16} />
                      {mensaje.fecha}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`pt-3 ${border} border-t`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Asunto:
                </p>
                <p className={`font-semibold ${text}`}>{mensaje.asunto}</p>
              </div>
            </div>
          </div>

          {/* Contenido del mensaje */}
          <div className={`${card} p-6 rounded-lg ${border} border`}>
            <h4 className={`font-bold ${text} mb-3`}>Mensaje</h4>
            <p className={`${text} whitespace-pre-wrap leading-relaxed`}>{mensaje.mensaje}</p>
          </div>

          {/* Archivos adjuntos */}
          {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
            <div className={`${card} p-4 rounded-lg ${border} border`}>
              <h4 className={`font-bold ${text} mb-3 flex items-center gap-2`}>
                <Paperclip size={18} />
                Archivos Adjuntos ({mensaje.adjuntos.length})
              </h4>
              <div className="space-y-2">
                {mensaje.adjuntos.map((adjunto, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-600" size={20} />
                      <span className={`text-sm ${text}`}>{adjunto}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Respuestas previas */}
          {mensaje.respuestas && mensaje.respuestas.length > 0 && (
            <div className={`${card} p-4 rounded-lg ${border} border`}>
              <h4 className={`font-bold ${text} mb-3`}>Conversación ({mensaje.respuestas.length})</h4>
              <div className="space-y-3">
                {mensaje.respuestas.map((resp) => (
                  <div
                    key={resp.id}
                    className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`font-semibold ${text} text-sm`}>{resp.de}</p>
                      <p className="text-xs text-gray-500">{resp.fecha}</p>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {resp.mensaje}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de respuesta */}
          {mostrarRespuesta && mensaje.tipo === 'recibido' && (
            <div className={`${card} p-4 rounded-lg ${border} border bg-blue-50 dark:bg-blue-900/20`}>
              <h4 className={`font-bold ${text} mb-3 flex items-center gap-2`}>
                <Reply size={18} className="text-blue-600" />
                Escribir Respuesta
              </h4>
              <textarea
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 rounded-lg ${border} border ${card} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Escribe tu respuesta aquí..."
              />

              <div className="mt-3">
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Adjuntar Archivos
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleAdjuntarArchivo}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${card} ${text}`}
                />
                {adjuntosRespuesta.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {adjuntosRespuesta.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        } rounded`}
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip size={16} />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => handleEliminarAdjunto(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setMostrarRespuesta(false);
                    setRespuesta('');
                    setAdjuntosRespuesta([]);
                  }}
                  className={`px-4 py-2 rounded-lg ${text} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarRespuesta}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Send size={18} />
                  Enviar Respuesta
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 ${border} border-t flex justify-between items-center`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Mensaje #{mensaje.id}
          </div>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${text} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
