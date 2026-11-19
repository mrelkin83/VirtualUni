import React from 'react';
import { Mail, Inbox, Send, Circle } from 'lucide-react';
import { StudentMessage } from '../../../types/student.types';
import { pulsable } from '../../../utils/pulsable';

interface MensajesSectionProps {
  mensajes: StudentMessage[];
  setConversacionActiva: (mensaje: StudentMessage) => void;
  setNuevoMensajeModal: (open: boolean) => void;
}

export const MensajesSection: React.FC<MensajesSectionProps> = ({
  mensajes,
  setConversacionActiva,
  setNuevoMensajeModal
}) => {
  const mensajesRecibidos = mensajes.filter(m => m.tipo === 'recibido');
  const noLeidos = mensajesRecibidos.filter(m => !m.leido).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Mensajes</h2>
        <button
          onClick={() => setNuevoMensajeModal(true)}
          className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2"
        >
          <Send size={18} />
          Nuevo Mensaje
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-accent-soft p-3 rounded-full">
              <Inbox className="text-pn-accent-text" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-accent-text">{mensajesRecibidos.length}</p>
              <p className="text-sm text-pn-muted">Recibidos</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-warn-soft p-3 rounded-full">
              <Mail className="text-pn-warn" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-warn">{noLeidos}</p>
              <p className="text-sm text-pn-muted">No leídos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className={`bg-pn-surface rounded-lg shadow`}>
        <div className="p-6">
          <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Bandeja de Entrada</h3>
          <div className="space-y-2">
            {mensajesRecibidos.map(mensaje => (
              <div
                key={mensaje.id}
                className={`border border-pn-line rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                  !mensaje.leido ? ('bg-pn-accent-soft') : ''
                }`}
                {...pulsable(() => setConversacionActiva(mensaje))}
              >
                <div className="flex items-start gap-3">
                  {!mensaje.leido && (
                    <Circle className="text-pn-accent-text fill-blue-600 flex-shrink-0 mt-1" size={8} />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-pn-accent to-pn-accent-hover rounded-full flex items-center justify-center text-pn-accent-ink text-sm font-bold">
                          {mensaje.avatar}
                        </div>
                        <h4 className={`font-bold text-pn-ink ${!mensaje.leido ? 'text-pn-accent-text' : ''}`}>
                          {mensaje.remitente}
                        </h4>
                      </div>
                      <span className="text-xs text-pn-muted">{mensaje.fecha}</span>
                    </div>
                    <p className={`font-semibold text-pn-ink-2 text-sm mb-1 ml-12`}>
                      {mensaje.asunto}
                    </p>
                    <p className={`text-sm text-pn-ink-2 line-clamp-1 ml-12`}>
                      {mensaje.preview}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
