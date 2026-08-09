import React, { useState } from 'react';
import { X, Save, Calendar, Users, BookOpen, Settings } from 'lucide-react';

interface ConfiguracionCursoModalProps {
  curso: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (configuracion: any) => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const ConfiguracionCursoModal: React.FC<ConfiguracionCursoModalProps> = ({
  curso,
  isOpen,
  onClose,
  onSave,
  darkMode,
  card,
  text,
  border
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
      <div className={`${card} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-inherit p-6 border-b ${border} flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="text-blue-500" size={24} />
            <h2 className={`text-2xl font-bold ${text}`}>Configuración del Curso</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <section>
            <h3 className={`text-lg font-bold ${text} mb-4 flex items-center gap-2`}>
              <BookOpen size={20} />
              Información Básica
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Nombre del Curso *
                </label>
                <input
                  type="text"
                  value={config.nombre}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Código del Curso *
                </label>
                <input
                  type="text"
                  value={config.codigo}
                  onChange={(e) => setConfig({ ...config, codigo: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Descripción
                </label>
                <textarea
                  value={config.descripcion}
                  onChange={(e) => setConfig({ ...config, descripcion: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Describe el curso, sus objetivos y contenido..."
                />
              </div>
            </div>
          </section>

          {/* Configuración Académica */}
          <section>
            <h3 className={`text-lg font-bold ${text} mb-4 flex items-center gap-2`}>
              <Calendar size={20} />
              Configuración Académica
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Duración
                </label>
                <input
                  type="text"
                  value={config.duracion}
                  onChange={(e) => setConfig({ ...config, duracion: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Ej: 16 semanas"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Créditos
                </label>
                <input
                  type="number"
                  value={config.creditos}
                  onChange={(e) => setConfig({ ...config, creditos: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Nota Mínima
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.notaMinima}
                  onChange={(e) => setConfig({ ...config, notaMinima: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
              </div>
            </div>
          </section>

          {/* Configuración de Inscripción */}
          <section>
            <h3 className={`text-lg font-bold ${text} mb-4 flex items-center gap-2`}>
              <Users size={20} />
              Inscripción y Modalidad
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Cupo Máximo
                </label>
                <input
                  type="number"
                  value={config.cupoMaximo}
                  onChange={(e) => setConfig({ ...config, cupoMaximo: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Modalidad
                </label>
                <select
                  value={config.modalidad}
                  onChange={(e) => setConfig({ ...config, modalidad: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Horario
                </label>
                <input
                  type="text"
                  value={config.horario}
                  onChange={(e) => setConfig({ ...config, horario: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Ej: Lun-Mie 14:00-16:00"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Aula/Salón
                </label>
                <input
                  type="text"
                  value={config.aula}
                  onChange={(e) => setConfig({ ...config, aula: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
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
                <span className={text}>Permitir inscripción de estudiantes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarEnCatalogo}
                  onChange={(e) => setConfig({ ...config, mostrarEnCatalogo: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className={text}>Mostrar en catálogo de cursos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.requiereAprobacion}
                  onChange={(e) => setConfig({ ...config, requiereAprobacion: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className={text}>Requiere aprobación del docente para inscribirse</span>
              </label>
            </div>
          </section>

          {/* Información Adicional */}
          <section>
            <h3 className={`text-lg font-bold ${text} mb-4`}>Información Adicional</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Prerequisitos
                </label>
                <textarea
                  value={config.prerequisitos}
                  onChange={(e) => setConfig({ ...config, prerequisitos: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Cursos o conocimientos previos requeridos..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Objetivos del Curso
                </label>
                <textarea
                  value={config.objetivos}
                  onChange={(e) => setConfig({ ...config, objetivos: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Objetivos de aprendizaje del curso..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Metodología
                </label>
                <textarea
                  value={config.metodologia}
                  onChange={(e) => setConfig({ ...config, metodologia: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Metodología de enseñanza..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Sistema de Evaluación
                </label>
                <textarea
                  value={config.evaluacion}
                  onChange={(e) => setConfig({ ...config, evaluacion: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Criterios y porcentajes de evaluación..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Bibliografía
                </label>
                <textarea
                  value={config.bibliografia}
                  onChange={(e) => setConfig({ ...config, bibliografia: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Referencias bibliográficas..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-inherit border-t ${border} p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
