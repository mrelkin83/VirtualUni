import React from 'react';
import { FileText, Upload, CheckCircle, Clock, X } from 'lucide-react';
import { StudentTask } from '../../../types/student.types';

interface TareasSectionProps {
  tareas: StudentTask[];
  modalTarea: StudentTask | null;
  archivoTarea: File | null;
  comentarioTarea: string;
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
      <h2 className={`text-2xl font-bold text-pn-ink`}>Mis Tareas</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-warn-soft p-3 rounded-full">
              <Clock className="text-pn-warn" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-warn">{tareasPendientes.length}</p>
              <p className="text-sm text-pn-muted">Pendientes</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-accent-soft p-3 rounded-full">
              <FileText className="text-pn-accent-text" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-accent-text">{tareasEntregadas.length}</p>
              <p className="text-sm text-pn-muted">Entregadas</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-ok-soft p-3 rounded-full">
              <CheckCircle className="text-pn-ok" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-ok">{tareasCalificadas.length}</p>
              <p className="text-sm text-pn-muted">Calificadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      {tareasPendientes.length > 0 && (
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold text-pn-ink mb-4 flex items-center gap-2`}>
            <Clock className="text-pn-warn" size={20} />
            Tareas Pendientes
          </h3>
          <div className="space-y-3">
            {tareasPendientes.map(tarea => (
              <div key={tarea.id} className={`border border-pn-line rounded-lg p-4`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className={`font-bold text-pn-ink mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm text-pn-ink-2`}>{tarea.curso}</p>
                  </div>
                  <span className="px-3 py-1 bg-pn-warn-soft text-pn-warn text-sm rounded-full">
                    Pendiente
                  </span>
                </div>
                {tarea.descripcion && (
                  <p className={`text-sm text-pn-ink-2 mb-3`}>
                    {tarea.descripcion}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pn-warn">📅 Límite: {tarea.fechaLimite}</span>
                  <button
                    onClick={() => setModalTarea(tarea)}
                    className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover text-sm flex items-center gap-2"
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
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold text-pn-ink mb-4 flex items-center gap-2`}>
            <FileText className="text-pn-accent-text" size={20} />
            Tareas Entregadas
          </h3>
          <div className="space-y-3">
            {tareasEntregadas.map(tarea => (
              <div key={tarea.id} className={`border border-pn-line rounded-lg p-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold text-pn-ink mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm text-pn-ink-2`}>{tarea.curso}</p>
                  </div>
                  <span className="px-3 py-1 bg-pn-accent-soft text-pn-accent-text text-sm rounded-full">
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
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold text-pn-ink mb-4 flex items-center gap-2`}>
            <CheckCircle className="text-pn-ok" size={20} />
            Tareas Calificadas
          </h3>
          <div className="space-y-3">
            {tareasCalificadas.map(tarea => (
              <div key={tarea.id} className={`border border-pn-line rounded-lg p-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold text-pn-ink mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm text-pn-ink-2`}>{tarea.curso}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-pn-ok-soft text-pn-ok text-sm rounded-full">
                      Calificada
                    </span>
                    {tarea.calificacion != null && (
                      // La escala real de las notas es 0-100, igual que en
                      // Exámenes; el "/10" venía de los datos de ejemplo y
                      // producía marcadores imposibles como "90.4/10".
                      <p className="text-lg font-bold text-pn-ok mt-1">{tarea.calificacion}/100</p>
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
          <div role="dialog" aria-modal="true" aria-label="Entregar Tarea" className={`bg-pn-surface rounded-lg max-w-md w-full p-6`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Entregar Tarea</h3>
              <button
                onClick={() => setModalTarea(null)}
                className="text-pn-muted hover:text-pn-ink-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <h4 className={`font-semibold text-pn-ink mb-2`}>{modalTarea.titulo}</h4>
              <p className={`text-sm text-pn-ink-2 mb-1`}>
                {modalTarea.curso}
              </p>
              <p className="text-sm text-pn-warn">Límite: {modalTarea.fechaLimite}</p>
            </div>

            {modalTarea.descripcion && (
              <div className={`bg-pn-surface-2 rounded p-3 mb-4`}>
                <p className={`text-sm text-pn-ink-2`}>
                  {modalTarea.descripcion}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className={`block font-semibold text-pn-ink mb-2`}>Archivo</label>
              <input
                type="file"
                onChange={(e) => setArchivoTarea(e.target.files?.[0] || null)}
                className={`w-full bg-pn-surface text-pn-ink-2 border border-pn-line rounded p-2`}
              />
              {archivoTarea && (
                <p className="text-sm text-pn-ok mt-2">
                  ✓ Archivo seleccionado: {archivoTarea.name}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className={`block font-semibold text-pn-ink mb-2`}>
                Comentarios adicionales <span className="text-sm text-pn-muted">(opcional)</span>
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
                className={`w-full bg-pn-surface text-pn-ink-2 border border-pn-line rounded p-3 min-h-[100px] focus:ring-2 focus:ring-pn-accent focus:outline-none`}
                rows={4}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-pn-muted">
                  Máximo 500 caracteres
                </p>
                <p className={`text-sm ${comentarioTarea.length > 450 ? 'text-pn-warn font-semibold' : 'text-pn-muted'}`}>
                  {comentarioTarea.length}/500
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => entregarTarea(modalTarea.id)}
                className="flex-1 bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover"
              >
                Entregar Tarea
              </button>
              <button
                onClick={() => {
                  setModalTarea(null);
                  setArchivoTarea(null);
                  setComentarioTarea('');
                }}
                className={`px-4 py-2 rounded bg-pn-surface-3 text-pn-ink-2 hover:opacity-80`}
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
