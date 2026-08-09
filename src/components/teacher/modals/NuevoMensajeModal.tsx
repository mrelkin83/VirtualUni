import React, { useState } from 'react';
import { X, Send, Paperclip, User, FileText } from 'lucide-react';

interface Student {
  id: number;
  nombre: string;
  email: string;
  curso: string;
}

interface NuevoMensajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnviar: (destinatario: string, asunto: string, mensaje: string, adjuntos: string[]) => void;
  estudiantes: Student[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const NuevoMensajeModal: React.FC<NuevoMensajeModalProps> = ({
  isOpen,
  onClose,
  onEnviar,
  estudiantes,
  darkMode,
  card,
  text,
  border,
}) => {
  const [destinatario, setDestinatario] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [busqueda, setBusqueda] = useState('');

  if (!isOpen) return null;

  const handleEnviar = () => {
    if (!destinatario.trim()) {
      alert('Por favor selecciona un destinatario');
      return;
    }
    if (!asunto.trim()) {
      alert('Por favor ingresa un asunto');
      return;
    }
    if (!mensaje.trim()) {
      alert('Por favor escribe un mensaje');
      return;
    }

    const adjuntosNombres = adjuntos.map(f => f.name);
    onEnviar(destinatario, asunto, mensaje, adjuntosNombres);

    // Limpiar formulario
    setDestinatario('');
    setAsunto('');
    setMensaje('');
    setAdjuntos([]);
    setBusqueda('');
  };

  const handleAdjuntarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAdjuntos([...adjuntos, ...Array.from(files)]);
    }
  };

  const handleEliminarAdjunto = (index: number) => {
    setAdjuntos(adjuntos.filter((_, i) => i !== index));
  };

  const estudiantesFiltrados = estudiantes.filter(est =>
    est.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    est.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    est.curso.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${card} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${text} flex items-center gap-2`}>
              <Send size={24} className="text-blue-600" />
              Nuevo Mensaje Individual
            </h2>
            <button
              onClick={onClose}
              className={`${text} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition`}
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Destinatario */}
            <div>
              <label className={`block text-sm font-medium ${text} mb-2`}>
                Destinatario *
              </label>

              {/* Búsqueda de estudiante */}
              <input
                type="text"
                placeholder="Buscar estudiante por nombre, email o curso..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text} mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />

              {/* Selector de estudiante */}
              <select
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Seleccionar estudiante</option>
                {estudiantesFiltrados.map(est => (
                  <option key={est.id} value={est.nombre}>
                    {est.nombre} ({est.email}) - {est.curso}
                  </option>
                ))}
              </select>

              {destinatario && (
                <div className={`mt-2 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} flex items-center gap-2`}>
                  <User size={18} className="text-blue-600" />
                  <span className={`text-sm ${text}`}>
                    Enviando a: <strong>{destinatario}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Asunto */}
            <div>
              <label className={`block text-sm font-medium ${text} mb-2`}>
                Asunto *
              </label>
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Asunto del mensaje"
              />
            </div>

            {/* Mensaje */}
            <div>
              <label className={`block text-sm font-medium ${text} mb-2`}>
                Mensaje *
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={8}
                className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Escribe tu mensaje aquí..."
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {mensaje.length} caracteres
                </span>
              </div>
            </div>

            {/* Archivos Adjuntos */}
            <div>
              <label className={`block text-sm font-medium ${text} mb-2 flex items-center gap-2`}>
                <Paperclip size={16} />
                Archivos Adjuntos (Opcional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleAdjuntarArchivo}
                className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
              />

              {adjuntos.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className={`text-sm font-medium ${text}`}>
                    Archivos seleccionados ({adjuntos.length}):
                  </p>
                  {adjuntos.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        <div>
                          <p className={`text-sm font-medium ${text}`}>{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEliminarAdjunto(index)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => {
                onClose();
                setDestinatario('');
                setAsunto('');
                setMensaje('');
                setAdjuntos([]);
                setBusqueda('');
              }}
              className={`px-6 py-2 rounded-lg ${text} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
            >
              Cancelar
            </button>
            <button
              onClick={handleEnviar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Send size={18} />
              Enviar Mensaje
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
