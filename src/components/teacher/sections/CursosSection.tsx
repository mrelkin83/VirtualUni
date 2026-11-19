import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Settings, Plus, Edit3, Trash2, Upload, Eye, FileText, Video, ClipboardCheck, X } from 'lucide-react';
import { GestionMaterialesModal } from '../modals/GestionMaterialesModal';
import { MisGruposPanel } from './MisGruposPanel';
import { uploadsApi } from '../../../api/endpoints/uploads';
import { materialsApi, MaterialType } from '../../../api/endpoints/materials';
import { ETIQUETA_TIPO, formatearKb, marcaDeTema } from '../../../utils/materiales';
import { comoArreglo } from '../../../utils/respuestaApi';
import { avisar } from '../../ui';
import { tintaDeRelleno } from '../../../utils/tintas';
import { pulsable } from '../../../utils/pulsable';

interface MaterialDeTema {
  id: string;
  nombre: string;
  descripcion?: string | null;
  tipo: MaterialType;
  url: string;
  tamanioKb?: number | null;
}

interface CursosSectionProps {
  cursos: any[];
  cursoDetalle: any;
  setCursoDetalle: (curso: any) => void;
  modulosCurso: any[];
  setModalConfigCurso: (curso: any) => void;
  crearModulo?: (moduloData: any) => void;
  editarModulo?: (moduloId: number, moduloData: any) => void;
  eliminarModulo?: (moduloId: number) => void;
  crearTema?: (moduloId: number, temaData: any) => void;
  editarTema?: (temaId: number, temaData: any) => void;
  eliminarTema?: (temaId: number) => void;
}

export const CursosSection: React.FC<CursosSectionProps> = ({
  cursos,
  cursoDetalle,
  setCursoDetalle,
  modulosCurso,
  setModalConfigCurso,
  crearModulo,
  editarModulo,
  eliminarModulo,
  crearTema,
  editarTema,
  eliminarTema
}) => {
  const [modalModulo, setModalModulo] = useState(false);
  const [modalTema, setModalTema] = useState(false);
  const [modalMateriales, setModalMateriales] = useState<any>(null);
  const [moduloEditando, setModuloEditando] = useState<any>(null);
  const [temaEditando, setTemaEditando] = useState<any>(null);
  const [moduloActual, setModuloActual] = useState<number | null>(null);

  const [nuevoModulo, setNuevoModulo] = useState({
    titulo: '',
    descripcion: '',
    orden: 1
  });

  const [nuevoTema, setNuevoTema] = useState({
    titulo: '',
    tipo: 'teoria' as 'teoria' | 'practica',
    duracion: '',
    descripcion: ''
  });

  // Los materiales viven en el backend, no en el temario: `tema.materiales`
  // siempre llegaba vacio (useTeacherDashboard lo fija a [] al mapear los
  // blocks), asi que el contador decia 0 aunque el docente ya hubiera subido.
  const courseId = cursoDetalle?.id ? String(cursoDetalle.id) : '';
  const { data: materialesRes } = useQuery({
    queryKey: ['materiales-grupo', courseId],
    queryFn: () => materialsApi.getAll({ courseId }),
    enabled: !!courseId,
  });
  const materialesDelCurso: MaterialDeTema[] = comoArreglo((materialesRes as any)?.data);
  const materialesDeTema = (titulo: string) =>
    materialesDelCurso.filter((m) => (m.descripcion ?? '') === marcaDeTema(titulo));

  const handleCrearModulo = () => {
    if (!nuevoModulo.titulo || !nuevoModulo.descripcion) {
      avisar.error('Por favor completa todos los campos');
      return;
    }

    if (moduloEditando) {
      editarModulo?.(moduloEditando.id, {
        ...nuevoModulo,
        cursoId: cursoDetalle.id
      });
      setModuloEditando(null);
    } else {
      crearModulo?.({
        ...nuevoModulo,
        cursoId: cursoDetalle.id
      });
    }

    setModalModulo(false);
    setNuevoModulo({
      titulo: '',
      descripcion: '',
      orden: 1
    });
  };

  const handleCrearTema = () => {
    if (!nuevoTema.titulo || !nuevoTema.duracion) {
      avisar.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!moduloActual) {
      avisar.error('Error: No se ha seleccionado un módulo');
      return;
    }

    if (temaEditando) {
      editarTema?.(temaEditando.id, nuevoTema);
      setTemaEditando(null);
    } else {
      crearTema?.(moduloActual, nuevoTema);
    }

    setModalTema(false);
    setNuevoTema({
      titulo: '',
      tipo: 'teoria',
      duracion: '',
      descripcion: ''
    });
    setModuloActual(null);
  };

  const abrirModalEditarModulo = (modulo: any) => {
    setModuloEditando(modulo);
    setNuevoModulo({
      titulo: modulo.titulo,
      descripcion: modulo.descripcion,
      orden: modulo.orden || 1
    });
    setModalModulo(true);
  };

  const abrirModalCrearTema = (moduloId: number) => {
    setModuloActual(moduloId);
    setModalTema(true);
  };

  const abrirModalEditarTema = (tema: any) => {
    setTemaEditando(tema);
    setNuevoTema({
      titulo: tema.titulo,
      tipo: tema.tipo,
      duracion: tema.duracion,
      descripcion: tema.descripcion || ''
    });
    setModalTema(true);
  };

  if (cursoDetalle) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCursoDetalle(null)}
          className="text-pn-accent-text hover:text-pn-accent-text flex items-center gap-2 mb-4"
        >
          ← Volver a cursos
        </button>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className={`${cursoDetalle.color} ${tintaDeRelleno(cursoDetalle.color)} -m-6 mb-4 p-6 rounded-t-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{cursoDetalle.nombre}</h2>
                <p>{cursoDetalle.codigo} • {cursoDetalle.estudiantes} estudiantes</p>
              </div>
              <button
                onClick={() => setModalConfigCurso(cursoDetalle)}
                className="bg-pn-surface text-pn-accent-text hover:bg-pn-surface-3 px-4 py-2 rounded flex items-center gap-2 font-semibold"
              >
                <Settings size={18} />
                Configurar Curso
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className={`bg-pn-surface-3 p-4 rounded text-center`}>
              <p className="text-2xl font-bold text-pn-accent-text">{cursoDetalle.progresoGeneral}%</p>
              <p className="text-sm">Progreso General</p>
            </div>
            <div className={`bg-pn-surface-3 p-4 rounded text-center`}>
              <p className="text-2xl font-bold text-pn-ok">{cursoDetalle.estudiantes}</p>
              <p className="text-sm">Estudiantes</p>
            </div>
            <div className={`bg-pn-surface-3 p-4 rounded text-center`}>
              <p className="text-2xl font-bold text-pn-warn">{cursoDetalle.tareasPendientesRevision}</p>
              <p className="text-sm">Por Revisar</p>
            </div>
          </div>

          {/* Contenido del Curso */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Contenido del Curso</h3>
              <button
                onClick={() => setModalModulo(true)}
                className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2"
              >
                <Plus size={18} />
                Nuevo Módulo
              </button>
            </div>

            <div className="space-y-4">
              {modulosCurso
                .filter((m) => m.cursoId === cursoDetalle.id)
                .map((modulo, index) => (
                  <div key={modulo.id} className={`border border-pn-line rounded-lg overflow-hidden`}>
                    <div className={`bg-pn-surface-2 p-4`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-pn-accent text-pn-accent-ink rounded px-2 py-1 text-xs font-bold">
                              Módulo {index + 1}
                            </span>
                            <h4 className={`font-bold text-pn-ink`}>{modulo.titulo}</h4>
                          </div>
                          <p className="text-sm text-pn-muted">{modulo.descripcion}</p>
                          <div className="flex gap-4 mt-2 text-sm text-pn-muted">
                            <span>{modulo.temas.length} tema{modulo.temas.length !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>
                              {modulo.temas.reduce((acc: number, t: any) => acc + materialesDeTema(t.titulo).length, 0)} material{modulo.temas.reduce((acc: number, t: any) => acc + materialesDeTema(t.titulo).length, 0) !== 1 ? 'es' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModalCrearTema(modulo.id)}
                            className="p-2 hover:bg-pn-surface-3 rounded text-pn-ok"
                            title="Agregar tema"
                          >
                            <Plus size={18} />
                          </button>
                          <button
                            onClick={() => abrirModalEditarModulo(modulo)}
                            className="p-2 hover:bg-pn-surface-3 rounded text-pn-accent-text"
                            title="Editar módulo"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => eliminarModulo?.(modulo.id)}
                            className="p-2 hover:bg-pn-surface-3 rounded text-pn-danger"
                            title="Eliminar módulo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Temas del Módulo */}
                    {modulo.temas.length > 0 && (
                      <div className="p-4 space-y-3">
                        {modulo.temas.map((tema: any, temaIndex: number) => (
                          <div key={tema.id} className={`border border-pn-line rounded-lg p-3`}>
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                                  tema.tipo === 'teoria'
                                    ? 'bg-pn-accent-soft text-pn-accent-text'
                                    : 'bg-pn-ok-soft text-pn-ok'
                                }`}
                              >
                                {tema.tipo === 'teoria' ? <BookOpen size={16} /> : <ClipboardCheck size={16} />}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-pn-muted">Tema {temaIndex + 1}</span>
                                      <h5 className={`font-semibold text-pn-ink`}>{tema.titulo}</h5>
                                    </div>
                                    <div className="flex gap-3 text-xs text-pn-muted mt-1">
                                      <span>{tema.tipo === 'teoria' ? '📚 Teoría' : '💻 Práctica'}</span>
                                      <span>⏱️ {tema.duracion}</span>
                                      <span>{materialesDeTema(tema.titulo).length} material{materialesDeTema(tema.titulo).length !== 1 ? 'es' : ''}</span>
                                    </div>
                                    {tema.descripcion && (
                                      <p className="text-xs text-pn-muted mt-1">{tema.descripcion}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => abrirModalEditarTema(tema)}
                                      className="p-1 hover:bg-pn-surface-3 rounded text-pn-accent-text"
                                      title="Editar tema"
                                    >
                                      <Edit3 size={16} />
                                    </button>
                                    <button
                                      onClick={() => setModalMateriales(tema)}
                                      className="p-1 hover:bg-pn-surface-3 rounded text-pn-ok"
                                      title="Gestionar materiales"
                                    >
                                      <Upload size={16} />
                                    </button>
                                    <button
                                      onClick={() => eliminarTema?.(tema.id)}
                                      className="p-1 hover:bg-pn-surface-3 rounded text-pn-danger"
                                      title="Eliminar tema"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>

                                {/* Materiales del Tema */}
                                {materialesDeTema(tema.titulo).length > 0 && (
                                  <div className={`bg-pn-surface-2 rounded p-2 mt-2 space-y-1`}>
                                    {materialesDeTema(tema.titulo).map((material) => (
                                      <div key={material.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                          {material.tipo === 'VIDEO' ? (
                                            <Video className="text-pn-accent-2-text shrink-0" size={14} />
                                          ) : (
                                            <FileText className="text-pn-accent-text shrink-0" size={14} />
                                          )}
                                          <span className="truncate">{material.nombre}</span>
                                          <span className="text-xs text-pn-muted shrink-0">
                                            ({ETIQUETA_TIPO[material.tipo]} · {formatearKb(material.tamanioKb)})
                                          </span>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                          <button
                                            onClick={() =>
                                              uploadsApi
                                                .abrir(material.url)
                                                .catch(() => avisar.error('No se pudo abrir el material.'))
                                            }
                                            className="p-1 hover:bg-pn-surface-3 rounded"
                                            title="Abrir"
                                          >
                                            <Eye size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {modulo.temas.length === 0 && (
                      <div className="p-8 text-center">
                        <BookOpen className="mx-auto text-pn-muted mb-2" size={32} />
                        <p className="text-pn-muted text-sm">No hay temas en este módulo</p>
                        <button
                          onClick={() => abrirModalCrearTema(modulo.id)}
                          className="mt-2 text-pn-accent-text hover:text-pn-accent-text text-sm font-semibold"
                        >
                          + Agregar primer tema
                        </button>
                      </div>
                    )}
                  </div>
                ))}

              {modulosCurso.filter((m) => m.cursoId === cursoDetalle.id).length === 0 && (
                <div className={`bg-pn-surface p-8 rounded-lg border border-pn-line text-center`}>
                  <BookOpen className="mx-auto text-pn-muted mb-4" size={48} />
                  <p className={`text-pn-ink text-lg font-semibold mb-2`}>No hay módulos en este curso</p>
                  <p className="text-pn-muted mb-4">Comienza creando el primer módulo del curso</p>
                  <button
                    onClick={() => setModalModulo(true)}
                    className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Crear Primer Módulo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Crear/Editar Módulo */}
        {modalModulo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div role="dialog" aria-modal="true" aria-label="{moduloEditando ? 'Editar Módulo' : 'Nuevo Módulo'}" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold text-pn-ink`}>
                    {moduloEditando ? 'Editar Módulo' : 'Nuevo Módulo'}
                  </h2>
                  <button
                    onClick={() => {
                      setModalModulo(false);
                      setModuloEditando(null);
                      setNuevoModulo({ titulo: '', descripcion: '', orden: 1 });
                    }}
                    className="text-pn-muted hover:text-pn-ink-2"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Título del Módulo *
                    </label>
                    <input
                      type="text"
                      value={nuevoModulo.titulo}
                      onChange={(e) => setNuevoModulo({ ...nuevoModulo, titulo: e.target.value })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                      placeholder="Ej: Introducción a React"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Descripción *
                    </label>
                    <textarea
                      value={nuevoModulo.descripcion}
                      onChange={(e) => setNuevoModulo({ ...nuevoModulo, descripcion: e.target.value })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                      rows={3}
                      placeholder="Describe el contenido y objetivos de este módulo..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Orden
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={nuevoModulo.orden}
                      onChange={(e) => setNuevoModulo({ ...nuevoModulo, orden: parseInt(e.target.value) || 1 })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setModalModulo(false);
                      setModuloEditando(null);
                      setNuevoModulo({ titulo: '', descripcion: '', orden: 1 });
                    }}
                    className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCrearModulo}
                    className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-6 py-2 rounded-lg"
                  >
                    {moduloEditando ? 'Actualizar' : 'Crear Módulo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear/Editar Tema */}
        {modalTema && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div role="dialog" aria-modal="true" aria-label="{temaEditando ? 'Editar Tema' : 'Nuevo Tema'}" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold text-pn-ink`}>
                    {temaEditando ? 'Editar Tema' : 'Nuevo Tema'}
                  </h2>
                  <button
                    onClick={() => {
                      setModalTema(false);
                      setTemaEditando(null);
                      setNuevoTema({ titulo: '', tipo: 'teoria', duracion: '', descripcion: '' });
                      setModuloActual(null);
                    }}
                    className="text-pn-muted hover:text-pn-ink-2"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Título del Tema *
                    </label>
                    <input
                      type="text"
                      value={nuevoTema.titulo}
                      onChange={(e) => setNuevoTema({ ...nuevoTema, titulo: e.target.value })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                      placeholder="Ej: Componentes y Props"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Tipo de Tema *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipo"
                          value="teoria"
                          checked={nuevoTema.tipo === 'teoria'}
                          onChange={(e) => setNuevoTema({ ...nuevoTema, tipo: e.target.value as 'teoria' | 'practica' })}
                          className="w-4 h-4"
                        />
                        <span className="text-pn-ink">📚 Teoría</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipo"
                          value="practica"
                          checked={nuevoTema.tipo === 'practica'}
                          onChange={(e) => setNuevoTema({ ...nuevoTema, tipo: e.target.value as 'teoria' | 'practica' })}
                          className="w-4 h-4"
                        />
                        <span className="text-pn-ink">💻 Práctica</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Duración Estimada *
                    </label>
                    <input
                      type="text"
                      value={nuevoTema.duracion}
                      onChange={(e) => setNuevoTema({ ...nuevoTema, duracion: e.target.value })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                      placeholder="Ej: 45 min, 1 hora, 2 horas"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={nuevoTema.descripcion}
                      onChange={(e) => setNuevoTema({ ...nuevoTema, descripcion: e.target.value })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                      rows={3}
                      placeholder="Describe los objetivos y contenido de este tema..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setModalTema(false);
                      setTemaEditando(null);
                      setNuevoTema({ titulo: '', tipo: 'teoria', duracion: '', descripcion: '' });
                      setModuloActual(null);
                    }}
                    className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCrearTema}
                    className="bg-pn-ok hover:bg-pn-ok text-pn-surface px-6 py-2 rounded-lg"
                  >
                    {temaEditando ? 'Actualizar' : 'Crear Tema'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gestión de Materiales */}
        {modalMateriales && (
          <GestionMaterialesModal
            tema={modalMateriales}
            isOpen={!!modalMateriales}
            onClose={() => setModalMateriales(null)}
            courseId={courseId}
          />
        )}
      </div>
    );
  }

  // Vista de lista de cursos
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Mis Cursos</h2>
      </div>

      {/* Contexto académico de cada grupo: asignatura, periodo y de qué
          programas vienen sus alumnos. Autónomo: trae sus propios datos. */}
      <MisGruposPanel />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className={`bg-pn-surface rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer`}
            {...pulsable(() => setCursoDetalle(curso))}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`text-xl font-bold text-pn-ink`}>{curso.nombre}</h3>
                <p className={`text-sm text-pn-ink-2`}>{curso.codigo}</p>
              </div>
              <div className={`${curso.color} w-4 h-4 rounded-full`}></div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={'text-pn-ink-2'}>Estudiantes</span>
                <span className={`font-semibold text-pn-ink`}>{curso.estudiantes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={'text-pn-ink-2'}>Por revisar</span>
                <span className="font-semibold text-pn-warn">{curso.tareasPendientesRevision}</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={'text-pn-ink-2'}>Progreso</span>
                  <span className={`font-semibold text-pn-ink`}>{curso.progresoGeneral}%</span>
                </div>
                <div className="w-full bg-pn-surface-3 rounded-full h-2">
                  <div
                    className="bg-pn-accent h-2 rounded-full transition-all"
                    style={{ width: `${curso.progresoGeneral}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
