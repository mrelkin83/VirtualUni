import React, { useState } from 'react';
import { X, Save, Calendar, Users, BookOpen, Settings } from 'lucide-react';
import { useModalA11y } from '../../../hooks/useModalA11y';

interface ConfiguracionCursoModalProps {
  curso: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (configuracion: any) => void;
}

export const ConfiguracionCursoModal: React.FC<ConfiguracionCursoModalProps> = ({
  curso,
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState({
    nombre: curso?.nombre || '',
    codigo: curso?.codigo || '',
    descripcion: curso?.descripcion || '',
    duracion: curso?.duracion || '16 semanas',
    creditos: curso?.creditos || 3,
    cupoMaximo: curso?.cupoMaximo || 30,
    modalidad: curso?.modalidad || 'presencial',
    horario: curso?.horario || '',
    aula: curso?.aula || '',
    prerequisitos: curso?.prerequisitos || '',
    objetivos: curso?.objetivos || '',
    metodologia: curso?.metodologia || '',
    evaluacion: curso?.evaluacion || '',
    bibliografia: curso?.bibliografia || '',
    notaMinima: curso?.notaMinima || 3.0,
    permitirInscripcion: curso?.permitirInscripcion !== false,
    mostrarEnCatalogo: curso?.mostrarEnCatalogo !== false,
    requiereAprobacion: curso?.requiereAprobacion || false,
  });

  const dialogRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...curso,
      ...config
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-configuracion-curso"
        tabIndex={-1}
        className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="sticky top-0 bg-inherit p-6 border-b border-pn-line flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="text-pn-accent-text" size={24} />
            <h2 id="titulo-configuracion-curso" className={`text-2xl font-bold text-pn-ink`}>Configuración del Curso</h2>
          </div>
          <button
            onClick={onClose}
            className="text-pn-muted hover:text-pn-ink-2 p-2 -m-2 rounded"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <section>
            <h3 className={`text-lg font-bold text-pn-ink mb-4 flex items-center gap-2`}>
              <BookOpen size={20} />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Nombre del Curso *
                </label>
                <input
                  type="text"
                  value={config.nombre}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Código del Curso *
                </label>
                <input
                  type="text"
                  value={config.codigo}
                  onChange={(e) => setConfig({ ...config, codigo: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                />
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Descripción
                </label>
                <textarea
                  value={config.descripcion}
                  onChange={(e) => setConfig({ ...config, descripcion: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Describe el curso, sus objetivos y contenido..."
                />
              </div>
            </div>
          </section>

          {/* Configuración Académica */}
          <section>
            <h3 className={`text-lg font-bold text-pn-ink mb-4 flex items-center gap-2`}>
              <Calendar size={20} />
              Configuración Académica
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Duración
                </label>
                <input
                  type="text"
                  value={config.duracion}
                  onChange={(e) => setConfig({ ...config, duracion: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Ej: 16 semanas"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Créditos
                </label>
                <input
                  type="number"
                  value={config.creditos}
                  onChange={(e) => setConfig({ ...config, creditos: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Nota Mínima
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.notaMinima}
                  onChange={(e) => setConfig({ ...config, notaMinima: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                />
              </div>
            </div>
          </section>

          {/* Configuración de Inscripción */}
          <section>
            <h3 className={`text-lg font-bold text-pn-ink mb-4 flex items-center gap-2`}>
              <Users size={20} />
              Inscripción y Modalidad
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Cupo Máximo
                </label>
                <input
                  type="number"
                  value={config.cupoMaximo}
                  onChange={(e) => setConfig({ ...config, cupoMaximo: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Modalidad
                </label>
                <select
                  value={config.modalidad}
                  onChange={(e) => setConfig({ ...config, modalidad: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Horario
                </label>
                <input
                  type="text"
                  value={config.horario}
                  onChange={(e) => setConfig({ ...config, horario: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Ej: Lun-Mie 14:00-16:00"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Aula/Salón
                </label>
                <input
                  type="text"
                  value={config.aula}
                  onChange={(e) => setConfig({ ...config, aula: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Ej: Aula 302"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.permitirInscripcion}
                  onChange={(e) => setConfig({ ...config, permitirInscripcion: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-pn-ink">Permitir inscripción de estudiantes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarEnCatalogo}
                  onChange={(e) => setConfig({ ...config, mostrarEnCatalogo: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-pn-ink">Mostrar en catálogo de cursos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.requiereAprobacion}
                  onChange={(e) => setConfig({ ...config, requiereAprobacion: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-pn-ink">Requiere aprobación del docente para inscribirse</span>
              </label>
            </div>
          </section>

          {/* Información Adicional */}
          <section>
            <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Información Adicional</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Prerequisitos
                </label>
                <textarea
                  value={config.prerequisitos}
                  onChange={(e) => setConfig({ ...config, prerequisitos: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Cursos o conocimientos previos requeridos..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Objetivos del Curso
                </label>
                <textarea
                  value={config.objetivos}
                  onChange={(e) => setConfig({ ...config, objetivos: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Objetivos de aprendizaje del curso..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Metodología
                </label>
                <textarea
                  value={config.metodologia}
                  onChange={(e) => setConfig({ ...config, metodologia: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Metodología de enseñanza..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Sistema de Evaluación
                </label>
                <textarea
                  value={config.evaluacion}
                  onChange={(e) => setConfig({ ...config, evaluacion: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Criterios y porcentajes de evaluación..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Bibliografía
                </label>
                <textarea
                  value={config.bibliografia}
                  onChange={(e) => setConfig({ ...config, bibliografia: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Referencias bibliográficas..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-inherit border-t border-pn-line p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
