import React from 'react';
import { FileText, Upload, CheckCircle, Clock, X } from 'lucide-react';
import { StudentTask } from '../../../types/student.types';

interface TareasSectionProps {
  tareas: StudentTask[];
  modalTarea: StudentTask | null;
  archivoTarea: File | null;
  comentarioTarea: string;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  setModalTarea: (tarea: StudentTask | null) => void;
  setArchivoTarea: (archivo: File | null) => void;
  setComentarioTarea: (comentario: string) => void;
  entregarTarea: (tareaId: number) => void;
}

export const TareasSection: React.FC<TareasSectionProps> = ({
  tareas,
  modalTarea,
  archivoTarea,
  comentarioTarea,
  darkMode,
  card,
  text,
  border,
  setModalTarea,
  setArchivoTarea,
  setComentarioTarea,
  entregarTarea
}) => {
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente');
  const tareasEntregadas = tareas.filter(t => t.estado === 'entregada');
  const tareasCalificadas = tareas.filter(t => t.estado === 'calificada');

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Mis Tareas</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{tareasPendientes.length}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{tareasEntregadas.length}</p>
              <p className="text-sm text-gray-500">Entregadas</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{tareasCalificadas.length}</p>
              <p className="text-sm text-gray-500">Calificadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      {tareasPendientes.length > 0 && (
        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold ${text} mb-4 flex items-center gap-2`}>
            <Clock className="text-orange-600" size={20} />
            Tareas Pendientes
          </h3>
          <div className="space-y-3">
            {tareasPendientes.map(tarea => (
              <div key={tarea.id} className={`border ${border} rounded-lg p-4`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className={`font-bold ${text} mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tarea.curso}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    Pendiente
                  </span>
                </div>
                {tarea.descripcion && (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    {tarea.descripcion}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-600">📅 Límite: {tarea.fechaLimite}</span>
                  <button
                    onClick={() => setModalTarea(tarea)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Entregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Tasks */}
      {tareasEntregadas.length > 0 && (
        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold ${text} mb-4 flex items-center gap-2`}>
            <FileText className="text-blue-600" size={20} />
            Tareas Entregadas
          </h3>
          <div className="space-y-3">
            {tareasEntregadas.map(tarea => (
              <div key={tarea.id} className={`border ${border} rounded-lg p-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold ${text} mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tarea.curso}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Entregada
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graded Tasks */}
      {tareasCalificadas.length > 0 && (
        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold ${text} mb-4 flex items-center gap-2`}>
            <CheckCircle className="text-green-600" size={20} />
            Tareas Calificadas
          </h3>
          <div className="space-y-3">
            {tareasCalificadas.map(tarea => (
              <div key={tarea.id} className={`border ${border} rounded-lg p-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold ${text} mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tarea.curso}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      Calificada
                    </span>
                    {tarea.calificacion && (
                      <p className="text-lg font-bold text-green-600 mt-1">{tarea.calificacion}/10</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {modalTarea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg max-w-md w-full p-6`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Entregar Tarea</h3>
              <button
                onClick={() => setModalTarea(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <h4 className={`font-semibold ${text} mb-2`}>{modalTarea.titulo}</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {modalTarea.curso}
              </p>
              <p className="text-sm text-orange-600">Límite: {modalTarea.fechaLimite}</p>
            </div>

            {modalTarea.descripcion && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-3 mb-4`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {modalTarea.descripcion}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className={`block font-semibold ${text} mb-2`}>Archivo</label>
              <input
                type="file"
                onChange={(e) => setArchivoTarea(e.target.files?.[0] || null)}
                className={`w-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} border ${border} rounded p-2`}
              />
              {archivoTarea && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Archivo seleccionado: {archivoTarea.name}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className={`block font-semibold ${text} mb-2`}>
                Comentarios adicionales <span className="text-sm text-gray-500">(opcional)</span>
              </label>
              <textarea
                value={comentarioTarea}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setComentarioTarea(value);
                  }
                }}
                placeholder="Agrega notas o comentarios sobre tu entrega..."
                className={`w-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} border ${border} rounded p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                rows={4}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">
                  Máximo 500 caracteres
                </p>
                <p className={`text-sm ${comentarioTarea.length > 450 ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                  {comentarioTarea.length}/500
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => entregarTarea(modalTarea.id)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Entregar Tarea
              </button>
              <button
                onClick={() => {
                  setModalTarea(null);
                  setArchivoTarea(null);
                  setComentarioTarea('');
                }}
                className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
