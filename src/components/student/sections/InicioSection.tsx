import React, { useState } from 'react';
import { BookOpen, FileText, Video, Award, Calendar, ChevronRight, CircleDot, Clock, AlertCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { StudentCourse, StudentTask, Clase } from '../../../types/student.types';
import { useAuthStore } from '../../../store/authStore';
import { RutaSegundoTitulo } from './RutaSegundoTitulo';
import { Button } from '../../ui/Button';
import { Card, StatCard, StatusPill } from '../../ui/Surface';
import { EmptyState } from '../../ui/Feedback';
import { pulsable } from '../../../utils/pulsable';

interface InicioSectionProps {
  cursos: StudentCourse[];
  tareas: StudentTask[];
  anuncios: any[];
  calificaciones: any[];
  clases?: Clase[];
  setCursoDetalle: (curso: StudentCourse) => void;
  setActiveSection: (section: any) => void;
  unirseClase?: (claseId: string | number) => void;
}

export const InicioSection: React.FC<InicioSectionProps> = ({
  cursos,
  tareas,
  anuncios,
  calificaciones,
  clases = [],
  setCursoDetalle,
  setActiveSection,
  unirseClase
}) => {
  const nombrePila = useAuthStore((s) => s.user?.firstName);
  const [anunciosExpandidos, setAnunciosExpandidos] = useState<(string | number)[]>([]);

  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
  const promedioGeneral = calificaciones.reduce((sum, c) => sum + c.promedio, 0) / calificaciones.length;
  const cursosActivos = cursos.length;

  /**
   * Lo pendiente, recortado a cinco. Ordenar por fecha límite sería lo
   * correcto, pero `fechaLimite` es una cadena ya formateada y no un dato
   * comparable; se respeta el orden en que llega hasta que el campo venga como
   * fecha real.
   */
  const proximasEntregas = tareas.filter((t) => t.estado === 'pendiente').slice(0, 5);

  // Filtrar clases en vivo y próximas
  const clasesEnVivo = clases.filter(c => c.estado === 'en_curso');
  const clasesProximas = clases.filter(c => c.estado === 'programada').slice(0, 3);

  // Función para toggle de anuncios
  const toggleAnuncio = (id: string | number) => {
    setAnunciosExpandidos(prev =>
      prev.includes(id) ? prev.filter(anuncioId => anuncioId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        {/* El saludo estaba fijo a "Bienvenida, Dayla" para todo el mundo.
            Se usa una forma neutra porque el modelo no guarda el genero. */}
        <h2 className={`text-2xl font-bold text-pn-ink mb-2`}>
          Hola{nombrePila ? `, ${nombrePila}` : ''}
        </h2>
        <p className={`text-pn-ink-2`}>
          Aquí está tu resumen académico
        </p>
      </div>

      {/* --- Franja de métricas ---
          Antes eran cuatro tarjetas con un icono en círculo saturado que
          ocupaba un tercio del ancho y no aportaba ningún dato. La cifra pasa
          a mandar y el icono queda como marca junto a la etiqueta. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          indice={0}
          etiqueta="Cursos activos"
          valor={cursosActivos}
          icono={BookOpen}
        />
        <StatCard
          indice={1}
          etiqueta="Por entregar"
          valor={tareasPendientes}
          icono={FileText}
          nota={tareasPendientes === 1 ? 'tarea' : 'tareas'}
          destacada={tareasPendientes > 0}
        />
        <StatCard
          indice={2}
          etiqueta="Promedio general"
          valor={
            Number.isFinite(promedioGeneral) ? promedioGeneral.toFixed(2) : '—'
          }
          icono={Award}
        />
        <StatCard
          indice={3}
          etiqueta="Clases en vivo"
          valor={clasesEnVivo.length}
          icono={Video}
          nota={clasesEnVivo.length > 0 ? 'ahora mismo' : 'ninguna ahora'}
        />
      </div>

      {/* --- Lo que tienes que hacer ---
          El bloque principal del portal. Antes las tareas pendientes estaban
          en el quinto bloque, por debajo del pliegue: para saber qué tenía que
          entregar, el estudiante debía recorrer media pantalla. */}
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pn-line px-4 py-3.5">
          <h3 className="font-display text-base font-bold text-pn-ink">
            Lo que tienes que hacer
          </h3>
          {proximasEntregas.length > 0 && (
            <Button
              variante="ghost"
              tamano="sm"
              icono={ChevronRight}
              iconoAlFinal
              onClick={() => setActiveSection('tareas')}
            >
              Todas las tareas
            </Button>
          )}
        </div>

        {proximasEntregas.length === 0 ? (
          <EmptyState
            icono={CheckCircle}
            titulo="Estás al día"
            descripcion="No tienes entregas pendientes. Cuando tus docentes publiquen una tarea, aparecerá aquí."
          />
        ) : (
          <ul className="list-none p-0">
            {proximasEntregas.map((tarea) => (
              <li key={tarea.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection('tareas')}
                  className="flex w-full items-center gap-4 border-b border-pn-line px-4 py-3 text-left transition-colors duration-pn-fast last:border-b-0 hover:bg-pn-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pn-accent"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-body text-sm font-semibold text-pn-ink">
                      {tarea.titulo}
                    </span>
                    <span className="block truncate font-body text-[12.5px] text-pn-muted">
                      {tarea.curso}
                    </span>
                  </span>
                  <StatusPill tono="warn" className="shrink-0">
                    {tarea.fechaLimite}
                  </StatusPill>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Clases en Vivo y Próximas */}
      {(clasesEnVivo.length > 0 || clasesProximas.length > 0) && (
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className={`text-lg font-bold text-pn-ink flex items-center gap-2`}>
              <Video size={20} />
              Clases en Vivo y Próximas
            </h3>
            <button
              onClick={() => setActiveSection('clases')}
              className="text-pn-accent-text hover:text-pn-accent-text text-sm font-semibold"
            >
              Ver todas
            </button>
          </div>

          {/* Clases en vivo ahora */}
          {clasesEnVivo.length > 0 && (
            <div className="mb-4 bg-pn-danger-soft border border-pn-danger rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <CircleDot className="text-pn-danger animate-pulse" size={24} />
                <h4 className={`font-bold text-pn-ink`}>
                  {clasesEnVivo.length} clase{clasesEnVivo.length > 1 ? 's' : ''} en vivo ahora
                </h4>
              </div>
              <div className="space-y-2">
                {clasesEnVivo.map(clase => (
                  <div
                    key={clase.id}
                    className={`bg-pn-surface border border-pn-line rounded-lg p-3 cursor-pointer hover:shadow-md transition`}
                    {...pulsable(() => unirseClase && unirseClase(clase.id))}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1">
                        <h5 className={`font-semibold text-pn-ink`}>{clase.titulo}</h5>
                        <p className={`text-sm text-pn-ink-2`}>{clase.curso}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unirseClase?.(clase.id);
                        }}
                        className="bg-pn-danger hover:bg-pn-danger text-pn-surface px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition"
                      >
                        <Video size={16} />
                        Unirse ahora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximas clases */}
          {clasesProximas.length > 0 && (
            <div className="space-y-2">
              {clasesProximas.map(clase => (
                <div
                  key={clase.id}
                  className={`border border-pn-line rounded-lg p-3 hover:shadow-md transition cursor-pointer`}
                  {...pulsable(() => setActiveSection('clases'))}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1">
                      <h5 className={`font-semibold text-pn-ink`}>{clase.titulo}</h5>
                      <p className={`text-sm text-pn-ink-2`}>{clase.curso}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-pn-accent-text">
                        <Clock size={14} />
                        {clase.fecha}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-pn-accent-soft text-pn-accent-text">
                        Programada
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h3 className={`text-lg font-bold text-pn-ink flex items-center gap-2`}>
            <Calendar size={20} />
            Anuncios Importantes
          </h3>
        </div>
        <div className="space-y-3">
          {anuncios.map(anuncio => {
            const isExpanded = anunciosExpandidos.includes(anuncio.id);
            return (
              <div
                key={anuncio.id}
                className={`border-l-4 ${anuncio.color} bg-pn-surface-2 p-4 rounded transition`}
              >
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  {...pulsable(() => toggleAnuncio(anuncio.id))}
                >
                  <span className="text-2xl">{anuncio.icono}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-pn-ink`}>{anuncio.titulo}</h4>
                    <p className={`text-sm text-pn-ink-2`}>{anuncio.descripcion}</p>
                    <p className="text-xs text-pn-muted mt-1">{anuncio.fecha}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className={'text-pn-muted'} size={20} />
                  ) : (
                    <ChevronDown className={'text-pn-muted'} size={20} />
                  )}
                </div>
                {isExpanded && anuncio.contenido && (
                  <div className={`mt-3 pt-3 border-t border-pn-line pl-11`}>
                    <p className={`text-sm text-pn-ink-2 leading-relaxed`}>
                      {anuncio.contenido}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className={`text-lg font-bold text-pn-ink`}>Mis Cursos</h3>
            <button
              onClick={() => setActiveSection('cursos')}
              className="text-pn-accent-text hover:text-pn-accent-text text-sm font-semibold"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {cursos.slice(0, 3).map(curso => (
              <div
                key={curso.id}
                className={`border border-pn-line rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                {...pulsable(() => {
                  setCursoDetalle(curso);
                  setActiveSection('cursos');
                })}
              >
                <div className="flex flex-wrap items-center justify-between mb-2 gap-4">
                  <h4 className={`font-semibold text-pn-ink`}>{curso.nombre}</h4>
                  <span className={`text-sm font-bold text-pn-ink`}>{curso.progreso}%</span>
                </div>
                <div className={`w-full bg-pn-surface-3 rounded-full h-2 mb-2`}>
                  <div className={`${curso.color} h-2 rounded-full`} style={{ width: `${curso.progreso}%` }}></div>
                </div>
                <div className="flex flex-wrap items-center justify-between text-sm gap-4">
                  <span className={'text-pn-ink-2'}>{curso.profesor}</span>
                  <span className="text-pn-accent-text">{curso.tareasPendientes} tareas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className={`text-lg font-bold text-pn-ink`}>Tareas Pendientes</h3>
            <button
              onClick={() => setActiveSection('tareas')}
              className="text-pn-accent-text hover:text-pn-accent-text text-sm font-semibold"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {tareas.filter(t => t.estado === 'pendiente').slice(0, 3).map(tarea => (
              <div
                key={tarea.id}
                className={`border border-pn-line rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                {...pulsable(() => setActiveSection('tareas'))}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className={`font-semibold text-pn-ink mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm text-pn-ink-2 mb-2`}>{tarea.curso}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-pn-warn flex items-center gap-1">
                        <AlertCircle size={14} />
                        {tarea.fechaLimite}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        tarea.estado === 'pendiente' ? 'bg-pn-warn-soft text-pn-warn' :
                        tarea.estado === 'entregada' ? 'bg-pn-accent-soft text-pn-accent-text' :
                        'bg-pn-ok-soft text-pn-ok'
                      }`}>
                        {tarea.estado}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={'text-pn-muted'} size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submitted Tasks */}
      {tareas.filter(t => t.estado === 'entregada' || t.estado === 'calificada').length > 0 && (
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className={`text-lg font-bold text-pn-ink`}>Tareas Entregadas</h3>
            <button
              onClick={() => setActiveSection('tareas')}
              className="text-pn-accent-text hover:text-pn-accent-text text-sm font-semibold"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {tareas.filter(t => t.estado === 'entregada' || t.estado === 'calificada').slice(0, 3).map(tarea => (
              <div
                key={tarea.id}
                className={`border border-pn-line rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                {...pulsable(() => setActiveSection('tareas'))}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className={`font-semibold text-pn-ink mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm text-pn-ink-2 mb-2`}>{tarea.curso}</p>
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      {tarea.fechaEntrega && (
                        <span className="text-pn-ok flex items-center gap-1">
                          <CheckCircle size={14} />
                          Entregada: {tarea.fechaEntrega}
                        </span>
                      )}
                      {tarea.estado === 'calificada' && tarea.calificacion && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold bg-pn-ok-soft text-pn-ok`}>
                          Calificación: {tarea.calificacion}/5.0
                        </span>
                      )}
                      {tarea.estado === 'entregada' && (
                        <span className={`px-2 py-1 rounded text-xs bg-pn-accent-soft text-pn-accent-text`}>
                          En revisión
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={'text-pn-muted'} size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Se oculta sola si el estudiante no tiene asignaturas aprobadas que
          otro programa le reconozca. */}
      <RutaSegundoTitulo />
    </div>
  );
};
