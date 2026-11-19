import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle, Clock, X, Save, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import { avisar } from '../../ui';
import { pulsable } from '../../../utils/pulsable';

/** Devuelve el valor solo si es un número utilizable; si no, null. */
const numero = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

/**
 * Porcentaje revisado, o null cuando el dato no está disponible. Las tareas que
 * llegan de la API no traen `entregasRevisadas`, y la división directa
 * producía NaN.
 */
const porcentajeRevisado = (t: any): number | null => {
  const rev = numero(t?.entregasRevisadas);
  const tot = numero(t?.entregasTotales);
  if (rev === null || tot === null || tot <= 0) return null;
  return (rev / tot) * 100;
};

const porRevisar = (t: any): number => {
  const rev = numero(t?.entregasRevisadas);
  const tot = numero(t?.entregasTotales);
  if (rev === null || tot === null) return 0;
  return Math.max(0, tot - rev);
};

interface TareasSectionProps {
  tareas: any[];
  setTareaEnRevision: (tarea: any) => void;
  setCrearTareaModal: (open: boolean) => void;
  crearTarea?: (tareaData: any) => void;
  cursos?: any[];
  estudiantes?: any[];
}

export const TareasSection: React.FC<TareasSectionProps> = ({
  tareas,
  setTareaEnRevision,
  crearTarea,
  cursos = [],
  estudiantes = []
}) => {
  const [modalNuevaTarea, setModalNuevaTarea] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    curso: '',
    fechaLimite: '',
    descripcion: '',
    puntaje: 10,
    archivoAdjunto: null as File | null
  });
  const [modoGrupal, setModoGrupal] = useState(false);
  const [configGrupo, setConfigGrupo] = useState({
    cantidadGrupos: 1,
    estudiantesPorGrupo: 2,
    tipoAsignacion: 'manual' as 'manual' | 'aleatorio',
    grupos: [] as Array<{ nombre: string; estudiantes: number[] }>
  });
  const [modalAsignacionGrupos, setModalAsignacionGrupos] = useState(false);
  const [grupoEnEdicion, setGrupoEnEdicion] = useState<number | null>(null);

  const abrirModalNuevaTarea = () => {
    setNuevaTarea({
      titulo: '',
      curso: '',
      fechaLimite: '',
      descripcion: '',
      puntaje: 10,
      archivoAdjunto: null
    });
    setModoGrupal(false);
    setConfigGrupo({
      cantidadGrupos: 1,
      estudiantesPorGrupo: 2,
      tipoAsignacion: 'manual',
      grupos: []
    });
    setModalNuevaTarea(true);
  };

  const guardarNuevaTarea = () => {
    if (!nuevaTarea.titulo.trim()) {
      avisar.info('Por favor ingresa un título para la tarea');
      return;
    }
    if (!nuevaTarea.curso.trim()) {
      avisar.error('Por favor selecciona un curso');
      return;
    }
    if (!nuevaTarea.fechaLimite) {
      avisar.error('Por favor selecciona una fecha límite');
      return;
    }

    // Validación de tarea grupal
    if (modoGrupal) {
      if (configGrupo.tipoAsignacion === 'manual') {
        const todosValidos = configGrupo.grupos.every(g => g.estudiantes.length >= 2);
        if (!todosValidos || configGrupo.grupos.length === 0) {
          avisar.error('Debes configurar los grupos manualmente con al menos 2 estudiantes cada uno');
          return;
        }
      }
    }

    const tareaData = {
      ...nuevaTarea,
      esGrupal: modoGrupal,
      configGrupo: modoGrupal ? configGrupo : null
    };

    if (crearTarea) {
      crearTarea(tareaData);
    }

    setModalNuevaTarea(false);

    // Reset estados
    setModoGrupal(false);
    setConfigGrupo({
      cantidadGrupos: 1,
      estudiantesPorGrupo: 2,
      tipoAsignacion: 'manual',
      grupos: []
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNuevaTarea({ ...nuevaTarea, archivoAdjunto: e.target.files[0] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Gestión de Tareas</h2>
        <button
          onClick={abrirModalNuevaTarea}
          className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Tarea
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-warn-soft p-3 rounded-full">
              <AlertCircle className="text-pn-warn" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-warn">
                {tareas.reduce((sum, t) => sum + porRevisar(t), 0)}
              </p>
              <p className="text-sm text-pn-muted">Por revisar</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-ok-soft p-3 rounded-full">
              <CheckCircle className="text-pn-ok" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-ok">
                {tareas.reduce((sum, t) => sum + (numero(t.entregasRevisadas) ?? 0), 0)}
              </p>
              <p className="text-sm text-pn-muted">Revisadas</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-accent-soft p-3 rounded-full">
              <Clock className="text-pn-accent-text" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-accent-text">{tareas.length}</p>
              <p className="text-sm text-pn-muted">Tareas activas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Tareas */}
      <div className={`bg-pn-surface rounded-lg shadow`}>
        <div className="p-6">
          <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Tareas Activas</h3>
          <div className="space-y-3">
            {tareas.map((tarea) => (
              <div
                key={tarea.id}
                className={`border border-pn-line rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                {...pulsable(() => setTareaEnRevision(tarea))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-bold text-pn-ink mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm text-pn-ink-2 mb-2`}>{tarea.curso}</p>
                    <div className="flex gap-4 text-sm">
                      <span className={'text-pn-ink-2'}>
                        📅 Límite: {tarea.fechaLimite}
                      </span>
                      <span className={'text-pn-ink-2'}>
                        📊 Entregas: {numero(tarea.entregasTotales) ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-pn-muted mb-1">Progreso de revisión</p>
                    <div className="flex items-center gap-3">
                      {/* Con datos de la API `entregasRevisadas` puede no venir:
                          la division daba NaN y llegaba al atributo `width`. */}
                      <div className="w-32 bg-pn-surface-3 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            porcentajeRevisado(tarea) === 100 ? 'bg-pn-ok' : 'bg-pn-accent'
                          }`}
                          style={{ width: `${porcentajeRevisado(tarea) ?? 0}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-bold ${
                        porcentajeRevisado(tarea) === 100 ? 'text-pn-ok' : 'text-pn-warn'
                      }`}>
                        {numero(tarea.entregasRevisadas) ?? '—'}/{numero(tarea.entregasTotales) ?? '—'}
                      </span>
                    </div>
                    {porRevisar(tarea) > 0 && (
                      <p className="text-xs text-pn-warn mt-1">
                        {porRevisar(tarea)} por revisar
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Nueva Tarea */}
      {modalNuevaTarea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Crear Nueva Tarea" className={`bg-pn-surface rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className={`p-6 border-pn-line border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold text-pn-ink`}>Crear Nueva Tarea</h3>
              <button
                onClick={() => setModalNuevaTarea(false)}
                className={`text-pn-ink hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>
                  Título de la Tarea *
                </label>
                <input
                  type="text"
                  value={nuevaTarea.titulo}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  placeholder="Ej: Taller de Programación Orientada a Objetos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-pn-ink mb-2 font-medium`}>
                    Curso *
                  </label>
                  <select
                    value={nuevaTarea.curso}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, curso: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursos.map((curso) => (
                      <option key={curso.id} value={curso.nombre}>
                        {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-pn-ink mb-2 font-medium`}>
                    Fecha Límite *
                  </label>
                  <input
                    type="date"
                    value={nuevaTarea.fechaLimite}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaLimite: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>
                  Puntaje Máximo
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={nuevaTarea.puntaje}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, puntaje: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                />
              </div>

              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>
                  Descripción
                </label>
                <textarea
                  value={nuevaTarea.descripcion}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  placeholder="Descripción detallada de la tarea, instrucciones, criterios de evaluación..."
                />
              </div>

              <div className={`p-4 rounded-lg border-pn-line border`}>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-pn-ink font-medium`}>
                    Tarea Grupal
                  </label>
                  <button
                    type="button"
                    onClick={() => setModoGrupal(!modoGrupal)}
                    className={`px-4 py-2 rounded-lg transition ${
                      modoGrupal
                        ? 'bg-pn-accent-2 text-pn-accent-2-ink'
                        : 'bg-pn-surface-3 text-pn-ink-2'
                    }`}
                  >
                    {modoGrupal ? 'Activado' : 'Desactivado'}
                  </button>
                </div>
                <p className={`text-sm text-pn-ink opacity-70`}>
                  Activa esta opción para crear una tarea grupal
                </p>
              </div>

              {modoGrupal && (
                <div className={`p-4 rounded-lg bg-pn-info-soft space-y-4`}>
                  <h4 className={`font-bold text-pn-ink`}>Configuración de Grupos</h4>

                  <div>
                    <label className={`block text-pn-ink mb-2 font-medium`}>
                      Tipo de Asignación
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfigGrupo({ ...configGrupo, tipoAsignacion: 'manual' })}
                        className={`flex-1 px-4 py-2 rounded-lg transition ${
                          configGrupo.tipoAsignacion === 'manual'
                            ? 'bg-pn-accent-2 text-pn-accent-2-ink'
                            : 'bg-pn-surface-3 text-pn-ink-2'
                        }`}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfigGrupo({ ...configGrupo, tipoAsignacion: 'aleatorio' })}
                        className={`flex-1 px-4 py-2 rounded-lg transition ${
                          configGrupo.tipoAsignacion === 'aleatorio'
                            ? 'bg-pn-accent-2 text-pn-accent-2-ink'
                            : 'bg-pn-surface-3 text-pn-ink-2'
                        }`}
                      >
                        Aleatorio
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-pn-ink mb-2 font-medium`}>
                        Cantidad de Grupos
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={configGrupo.cantidadGrupos}
                        onChange={(e) => setConfigGrupo({ ...configGrupo, cantidadGrupos: parseInt(e.target.value) || 1 })}
                        className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                      />
                    </div>
                    <div>
                      <label className={`block text-pn-ink mb-2 font-medium`}>
                        Estudiantes por Grupo (2-6)
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="6"
                        value={configGrupo.estudiantesPorGrupo}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 2;
                          setConfigGrupo({ ...configGrupo, estudiantesPorGrupo: Math.min(Math.max(val, 2), 6) });
                        }}
                        className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                      />
                    </div>
                  </div>

                  {configGrupo.tipoAsignacion === 'manual' && (
                    <div>
                      <label className={`block text-pn-ink mb-2 font-medium`}>
                        Asignación Manual de Estudiantes
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const gruposIniciales = Array.from({ length: configGrupo.cantidadGrupos }, (_, i) => ({
                            nombre: `Grupo ${i + 1}`,
                            estudiantes: []
                          }));
                          setConfigGrupo({ ...configGrupo, grupos: gruposIniciales });
                          setModalAsignacionGrupos(true);
                        }}
                        className="bg-pn-accent-2 text-pn-accent-2-ink px-4 py-2 rounded-lg hover:bg-pn-accent-2"
                      >
                        Configurar Grupos Manualmente
                      </button>
                    </div>
                  )}

                  {configGrupo.tipoAsignacion === 'aleatorio' && (
                    <div className={`p-3 rounded-lg bg-pn-accent-soft`}>
                      <p className={`text-sm text-pn-accent-text`}>
                        Los estudiantes serán asignados aleatoriamente a {configGrupo.cantidadGrupos} grupos de {configGrupo.estudiantesPorGrupo} estudiantes cada uno.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>
                  Archivo Adjunto (opcional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  accept=".pdf,.doc,.docx,.txt,.zip"
                />
                {nuevaTarea.archivoAdjunto && (
                  <p className={`text-pn-ink text-sm mt-2`}>
                    Archivo seleccionado: {nuevaTarea.archivoAdjunto.name}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`p-6 border-pn-line border-t flex justify-end gap-3`}>
              <button
                onClick={() => setModalNuevaTarea(false)}
                className={`px-4 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3 transition`}
              >
                Cancelar
              </button>
              <button
                onClick={guardarNuevaTarea}
                className="bg-pn-accent text-pn-accent-ink px-6 py-2 rounded-lg hover:bg-pn-accent-hover transition flex items-center gap-2"
              >
                <Save size={18} />
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignación Manual de Grupos */}
      {modalAsignacionGrupos && modoGrupal && configGrupo.tipoAsignacion === 'manual' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Asignación Manual de Grupos" className={`bg-pn-surface rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className={`p-6 border-pn-line border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold text-pn-ink`}>Asignación Manual de Grupos</h3>
              <button
                onClick={() => setModalAsignacionGrupos(false)}
                className={`text-pn-ink hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-pn-ink font-bold mb-3`}>Grupos</h4>
                  <div className="space-y-2">
                    {configGrupo.grupos.map((grupo, index) => (
                      <button
                        key={index}
                        onClick={() => setGrupoEnEdicion(index)}
                        className={`w-full p-4 rounded-lg border-pn-line border text-left transition ${
                          grupoEnEdicion === index
                            ? 'bg-pn-accent-2 bg-opacity-10 border-pn-accent-2'
                            : 'hover:bg-pn-surface-2'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-pn-ink`}>{grupo.nombre}</span>
                          <span className={`text-sm text-pn-ink opacity-70`}>
                            {grupo.estudiantes.length}/{configGrupo.estudiantesPorGrupo} estudiantes
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className={`text-pn-ink font-bold mb-3`}>
                    {grupoEnEdicion !== null
                      ? `Asignar a ${configGrupo.grupos[grupoEnEdicion]?.nombre}`
                      : 'Selecciona un grupo'}
                  </h4>
                  {grupoEnEdicion !== null && (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {estudiantes && estudiantes.map((estudiante) => {
                        const yaAsignado = configGrupo.grupos[grupoEnEdicion].estudiantes.includes(estudiante.id);
                        const grupoLleno = configGrupo.grupos[grupoEnEdicion].estudiantes.length >= configGrupo.estudiantesPorGrupo;

                        return (
                          <div
                            key={estudiante.id}
                            {...pulsable(() => {
                              if (yaAsignado) {
                                const nuevosGrupos = [...configGrupo.grupos];
                                nuevosGrupos[grupoEnEdicion].estudiantes = nuevosGrupos[grupoEnEdicion].estudiantes.filter(id => id !== estudiante.id);
                                setConfigGrupo({ ...configGrupo, grupos: nuevosGrupos });
                              } else if (!grupoLleno) {
                                const nuevosGrupos = [...configGrupo.grupos];
                                nuevosGrupos[grupoEnEdicion].estudiantes.push(estudiante.id);
                                setConfigGrupo({ ...configGrupo, grupos: nuevosGrupos });
                              }
                            })}
                            className={`p-3 rounded-lg border-pn-line border cursor-pointer transition ${
                              yaAsignado
                                ? 'bg-pn-ok bg-opacity-10 border-pn-ok'
                                : grupoLleno
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-pn-surface-2'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`font-medium text-pn-ink`}>{estudiante.nombre}</p>
                                <p className={`text-sm text-pn-ink opacity-70`}>{estudiante.email}</p>
                              </div>
                              {yaAsignado && <CheckSquare size={20} className="text-pn-ok" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-6 border-pn-line border-t flex justify-end gap-3`}>
              <button
                onClick={() => setModalAsignacionGrupos(false)}
                className={`px-4 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3 transition`}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const todosValidos = configGrupo.grupos.every(g => g.estudiantes.length >= 2);
                  if (!todosValidos) {
                    avisar.info('Todos los grupos deben tener al menos 2 estudiantes');
                    return;
                  }
                  setModalAsignacionGrupos(false);
                  avisar.ok('Grupos configurados correctamente');
                }}
                className="bg-pn-accent-2 text-pn-accent-2-ink px-6 py-2 rounded-lg hover:bg-pn-accent-2 transition"
              >
                Confirmar Asignación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
