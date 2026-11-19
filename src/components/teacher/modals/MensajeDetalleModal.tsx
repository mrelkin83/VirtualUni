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
import { useModalA11y } from '../../../hooks/useModalA11y';
import { avisar, confirmar } from '../../ui';

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
}) => {
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [adjuntosRespuesta, setAdjuntosRespuesta] = useState<File[]>([]);

  const dialogRef = useModalA11y(isOpen && !!mensaje, onClose);

  if (!isOpen || !mensaje) return null;

  const handleEnviarRespuesta = () => {
    if (!respuesta.trim()) {
      avisar.info('Por favor escribe una respuesta');
      return;
    }

    onResponder(mensaje.id, respuesta);
    setRespuesta('');
    setAdjuntosRespuesta([]);
    setMostrarRespuesta(false);
    avisar.ok('Respuesta enviada exitosamente');
  };

  const handleEliminar = async () => {
    if (await confirmar('¿Estás seguro de que deseas eliminar este mensaje?')) {
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
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-mensaje-detalle"
        tabIndex={-1}
        className={`bg-pn-surface rounded-lg w-full max-w-4xl h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className={`p-6 border-pn-line border-b`}>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`text-pn-ink hover:bg-pn-surface-3 p-2 rounded-lg transition`}
                title="Cerrar"
              >
                <X size={24} />
              </button>
              <h3 id="titulo-mensaje-detalle" className={`text-xl font-bold text-pn-ink`}>
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
                    ? `text-pn-ink hover:bg-pn-surface-3`
                    : 'text-pn-muted cursor-not-allowed'
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
                    ? `text-pn-ink hover:bg-pn-surface-3`
                    : 'text-pn-muted cursor-not-allowed'
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
                  className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
                >
                  <Reply size={18} />
                  Responder
                </button>
                <button
                  onClick={handleMarcarLeido}
                  className={`flex items-center gap-2 px-4 py-2 border-pn-line border rounded-lg hover:bg-pn-surface-3 transition text-pn-ink`}
                >
                  {mensaje.leido ? <Mail size={18} /> : <MailOpen size={18} />}
                  {mensaje.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                </button>
              </>
            )}
            {onArchivar && (
              <button
                onClick={() => onArchivar(mensaje.id)}
                className={`flex items-center gap-2 px-4 py-2 border-pn-line border rounded-lg hover:bg-pn-surface-3 transition text-pn-ink`}
              >
                <Archive size={18} />
                Archivar
              </button>
            )}
            <button
              onClick={handleEliminar}
              className="flex items-center gap-2 px-4 py-2 border border-pn-danger text-pn-danger rounded-lg hover:bg-pn-danger-soft transition ml-auto"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Información del mensaje */}
          <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pn-accent-soft rounded-full">
                  <User className="text-pn-accent-text" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className={`font-bold text-pn-ink`}>
                        {mensaje.tipo === 'recibido' ? mensaje.de : `Para: ${mensaje.para}`}
                      </p>
                      <p className={`text-sm text-pn-ink-2`}>
                        {mensaje.tipo === 'recibido' ? 'Remitente' : 'Destinatario'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-pn-muted">
                      <Calendar size={16} />
                      {mensaje.fecha}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`pt-3 border-pn-line border-t`}>
                <p className={`text-sm text-pn-ink-2 mb-1`}>
                  Asunto:
                </p>
                <p className={`font-semibold text-pn-ink`}>{mensaje.asunto}</p>
              </div>
            </div>
          </div>

          {/* Contenido del mensaje */}
          <div className={`bg-pn-surface p-6 rounded-lg border-pn-line border`}>
            <h4 className={`font-bold text-pn-ink mb-3`}>Mensaje</h4>
            <p className={`text-pn-ink whitespace-pre-wrap leading-relaxed`}>{mensaje.mensaje}</p>
          </div>

          {/* Archivos adjuntos */}
          {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
            <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
              <h4 className={`font-bold text-pn-ink mb-3 flex items-center gap-2`}>
                <Paperclip size={18} />
                Archivos Adjuntos ({mensaje.adjuntos.length})
              </h4>
              <div className="space-y-2">
                {mensaje.adjuntos.map((adjunto, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      'bg-pn-surface-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-pn-accent-text" size={20} />
                      <span className={`text-sm text-pn-ink`}>{adjunto}</span>
                    </div>
                    <button className="text-pn-accent-text hover:text-pn-accent-text text-sm font-medium">
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Respuestas previas */}
          {mensaje.respuestas && mensaje.respuestas.length > 0 && (
            <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
              <h4 className={`font-bold text-pn-ink mb-3`}>Conversación ({mensaje.respuestas.length})</h4>
              <div className="space-y-3">
                {mensaje.respuestas.map((resp) => (
                  <div
                    key={resp.id}
                    className={`p-3 rounded-lg bg-pn-surface-3`}
                  >
                    <div className="flex flex-wrap items-center justify-between mb-2 gap-4">
                      <p className={`font-semibold text-pn-ink text-sm`}>{resp.de}</p>
                      <p className="text-xs text-pn-muted">{resp.fecha}</p>
                    </div>
                    <p className={`text-sm text-pn-ink-2`}>
                      {resp.mensaje}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de respuesta */}
          {mostrarRespuesta && mensaje.tipo === 'recibido' && (
            <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border bg-pn-accent-soft`}>
              <h4 className={`font-bold text-pn-ink mb-3 flex items-center gap-2`}>
                <Reply size={18} className="text-pn-accent-text" />
                Escribir Respuesta
              </h4>
              <textarea
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border-pn-line border bg-pn-surface text-pn-ink focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                placeholder="Escribe tu respuesta aquí..."
              />

              <div className="mt-3">
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Adjuntar Archivos
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleAdjuntarArchivo}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                />
                {adjuntosRespuesta.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {adjuntosRespuesta.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 ${
                          'bg-pn-surface-3'
                        } rounded`}
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip size={16} />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-pn-muted">
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => handleEliminarAdjunto(index)}
                          className="text-pn-danger hover:text-pn-danger"
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
                  className={`px-4 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3 transition`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarRespuesta}
                  className="bg-pn-accent text-pn-accent-ink px-6 py-2 rounded-lg hover:bg-pn-accent-hover transition flex items-center gap-2"
                >
                  <Send size={18} />
                  Enviar Respuesta
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-pn-line border-t flex justify-between items-center`}>
          <div className={`text-sm text-pn-ink-2`}>
            Mensaje #{mensaje.id}
          </div>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3 transition`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
