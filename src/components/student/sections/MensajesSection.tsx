import React from 'react';
import { Mail, Inbox, Send, Circle } from 'lucide-react';
import { StudentMessage } from '../../../types/student.types';

interface MensajesSectionProps {
  mensajes: StudentMessage[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  setConversacionActiva: (mensaje: StudentMessage) => void;
  setNuevoMensajeModal: (open: boolean) => void;
}

export const MensajesSection: React.FC<MensajesSectionProps> = ({
  mensajes,
  darkMode,
  card,
  text,
  border,
  setConversacionActiva,
  setNuevoMensajeModal
}) => {
  const mensajesRecibidos = mensajes.filter(m => m.tipo === 'recibido');
  const noLeidos = mensajesRecibidos.filter(m => !m.leido).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Mensajes</h2>
        <button
          onClick={() => setNuevoMensajeModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Send size={18} />
          Nuevo Mensaje
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Inbox className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{mensajesRecibidos.length}</p>
              <p className="text-sm text-gray-500">Recibidos</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Mail className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{noLeidos}</p>
              <p className="text-sm text-gray-500">No leídos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className={`${card} rounded-lg shadow`}>
        <div className="p-6">
          <h3 className={`text-lg font-bold ${text} mb-4`}>Bandeja de Entrada</h3>
          <div className="space-y-2">
            {mensajesRecibidos.map(mensaje => (
              <div
                key={mensaje.id}
                className={`border ${border} rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                  !mensaje.leido ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                }`}
                onClick={() => setConversacionActiva(mensaje)}
              >
                <div className="flex items-start gap-3">
                  {!mensaje.leido && (
                    <Circle className="text-blue-600 fill-blue-600 flex-shrink-0 mt-1" size={8} />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {mensaje.avatar}
                        </div>
                        <h4 className={`font-bold ${text} ${!mensaje.leido ? 'text-blue-600' : ''}`}>
                          {mensaje.remitente}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-500">{mensaje.fecha}</span>
                    </div>
                    <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm mb-1 ml-12`}>
                      {mensaje.asunto}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-1 ml-12`}>
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
