import React, { useState } from 'react';
import { X, Send, User, Mail, AlertCircle } from 'lucide-react';
import { useModalA11y } from '../../../hooks/useModalA11y';

interface NuevoMensajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  enviarMensaje: (destinatario: string, asunto: string, mensaje: string) => void;
}

export const NuevoMensajeModal: React.FC<NuevoMensajeModalProps> = ({
  isOpen,
  onClose,
  enviarMensaje
}) => {
  const [destinatario, setDestinatario] = useState('');
  const [tipoDestinatario, setTipoDestinatario] = useState<'profesor' | 'administrador'>('profesor');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setDestinatario('');
    setAsunto('');
    setMensaje('');
    setError(null);
    onClose();
  };

  const dialogRef = useModalA11y(isOpen, handleClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destinatario.trim() || !asunto.trim() || !mensaje.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (mensaje.length > 1000) {
      setError('El mensaje no puede exceder 1000 caracteres');
      return;
    }

    enviarMensaje(destinatario, asunto, mensaje);

    // Limpiar formulario
    setDestinatario('');
    setAsunto('');
    setMensaje('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-nuevo-mensaje-estudiante"
        tabIndex={-1}
        className={`bg-pn-surface rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pn-accent-soft rounded-lg">
              <Mail className="text-pn-accent-text" size={24} />
            </div>
            <div>
              <h3 id="titulo-nuevo-mensaje-estudiante" className={`text-xl font-bold text-pn-ink`}>Nuevo Mensaje</h3>
              <p className="text-sm text-pn-muted">Envía un mensaje a tu profesor o administrador</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-pn-muted hover:text-pn-ink-2 p-2 rounded-lg hover:bg-pn-surface-3"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-pn-danger-soft border border-pn-danger text-pn-danger text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de destinatario */}
          <div>
            <label className={`block text-sm font-semibold text-pn-ink mb-2`}>
              Enviar a *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="profesor"
                  checked={tipoDestinatario === 'profesor'}
                  onChange={(e) => setTipoDestinatario(e.target.value as 'profesor')}
                  className="w-4 h-4 text-pn-accent-text"
                />
                <span className="text-pn-ink">Profesor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="administrador"
                  checked={tipoDestinatario === 'administrador'}
                  onChange={(e) => setTipoDestinatario(e.target.value as 'administrador')}
                  className="w-4 h-4 text-pn-accent-text"
                />
                <span className="text-pn-ink">Administrador</span>
              </label>
            </div>
          </div>

          {/* Destinatario */}
          <div>
            <label htmlFor="nm-estudiante-destinatario" className={`block text-sm font-semibold text-pn-ink mb-2`}>
              {tipoDestinatario === 'profesor' ? 'Nombre del Profesor' : 'Nombre del Administrador'} *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted" size={20} />
              <input
                id="nm-estudiante-destinatario"
                type="text"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder={`Escribe el nombre del ${tipoDestinatario}...`}
                className={`w-full pl-10 pr-4 py-3 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${
                  'bg-pn-surface text-pn-ink'
                }`}
              />
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label htmlFor="nm-estudiante-asunto" className={`block text-sm font-semibold text-pn-ink mb-2`}>
              Asunto *
            </label>
            <input
              id="nm-estudiante-asunto"
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Escribe el asunto del mensaje..."
              maxLength={100}
              className={`w-full px-4 py-3 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none ${
                'bg-pn-surface text-pn-ink'
              }`}
            />
            <p className="text-xs text-pn-muted mt-1">{asunto.length}/100 caracteres</p>
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="nm-estudiante-mensaje" className={`block text-sm font-semibold text-pn-ink mb-2`}>
              Mensaje *
            </label>
            <textarea
              id="nm-estudiante-mensaje"
              value={mensaje}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setMensaje(e.target.value);
                }
              }}
              placeholder="Escribe tu mensaje..."
              rows={6}
              className={`w-full px-4 py-3 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none resize-none ${
                'bg-pn-surface text-pn-ink'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-pn-muted">Máximo 1000 caracteres</p>
              <p className={`text-xs ${mensaje.length > 900 ? 'text-pn-warn font-semibold' : 'text-pn-muted'}`}>
                {mensaje.length}/1000
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className={`p-4 rounded-lg bg-pn-accent-soft border border-pn-accent-line`}>
            <p className="text-sm text-pn-accent-text">
              <strong>Nota:</strong> Tu mensaje será enviado al {tipoDestinatario} seleccionado.
              Recibirás una respuesta en tu bandeja de entrada del sistema.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-pn-accent text-pn-accent-ink px-6 py-3 rounded-lg hover:bg-pn-accent-hover transition font-semibold flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Enviar Mensaje
            </button>
            <button
              type="button"
              onClick={handleClose}
              className={`px-6 py-3 rounded-lg transition font-semibold bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line`}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
