import React, { useState } from 'react';
import { X, Send, User, Mail } from 'lucide-react';

interface NuevoMensajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  enviarMensaje: (destinatario: string, asunto: string, mensaje: string) => void;
}

export const NuevoMensajeModal: React.FC<NuevoMensajeModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  card,
  text,
  border,
  enviarMensaje
}) => {
  const [destinatario, setDestinatario] = useState('');
  const [tipoDestinatario, setTipoDestinatario] = useState<'profesor' | 'administrador'>('profesor');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destinatario.trim() || !asunto.trim() || !mensaje.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (mensaje.length > 1000) {
      alert('El mensaje no puede exceder 1000 caracteres');
      return;
    }

    enviarMensaje(destinatario, asunto, mensaje);

    // Limpiar formulario
    setDestinatario('');
    setAsunto('');
    setMensaje('');
    onClose();
  };

  const handleClose = () => {
    setDestinatario('');
    setAsunto('');
    setMensaje('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className={`${card} rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Mail className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${text}`}>Nuevo Mensaje</h3>
              <p className="text-sm text-gray-500">Envía un mensaje a tu profesor o administrador</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de destinatario */}
          <div>
            <label className={`block text-sm font-semibold ${text} mb-2`}>
              Enviar a *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="profesor"
                  checked={tipoDestinatario === 'profesor'}
                  onChange={(e) => setTipoDestinatario(e.target.value as 'profesor')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className={text}>Profesor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="administrador"
                  checked={tipoDestinatario === 'administrador'}
                  onChange={(e) => setTipoDestinatario(e.target.value as 'administrador')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className={text}>Administrador</span>
              </label>
            </div>
          </div>

          {/* Destinatario */}
          <div>
            <label className={`block text-sm font-semibold ${text} mb-2`}>
              {tipoDestinatario === 'profesor' ? 'Nombre del Profesor' : 'Nombre del Administrador'} *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder={`Escribe el nombre del ${tipoDestinatario}...`}
                className={`w-full pl-10 pr-4 py-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className={`block text-sm font-semibold ${text} mb-2`}>
              Asunto *
            </label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Escribe el asunto del mensaje..."
              maxLength={100}
              className={`w-full px-4 py-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">{asunto.length}/100 caracteres</p>
          </div>

          {/* Mensaje */}
          <div>
            <label className={`block text-sm font-semibold ${text} mb-2`}>
              Mensaje *
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setMensaje(e.target.value);
                }
              }}
              placeholder="Escribe tu mensaje..."
              rows={6}
              className={`w-full px-4 py-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Máximo 1000 caracteres</p>
              <p className={`text-xs ${mensaje.length > 900 ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                {mensaje.length}/1000
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Nota:</strong> Tu mensaje será enviado al {tipoDestinatario} seleccionado.
              Recibirás una respuesta en tu bandeja de entrada del sistema.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Enviar Mensaje
            </button>
            <button
              type="button"
              onClick={handleClose}
              className={`px-6 py-3 rounded-lg transition font-semibold ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
