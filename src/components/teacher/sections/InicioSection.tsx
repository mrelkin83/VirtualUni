import { useMemo, type CSSProperties } from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Course, Student, Assignment } from '../../../types/teacher.types';
import { Button } from '../../ui/Button';
import { Card, StatCard, StatusPill } from '../../ui/Surface';
import { EmptyState } from '../../ui/Feedback';
import { cn } from '../../ui/cn';

/**
 * Inicio del docente.
 *
 * Qué cambia respecto a la versión anterior: abría con cuatro tarjetas de
 * métrica idénticas en peso, y lo que el docente realmente viene a hacer —ver
 * qué tiene sin calificar— quedaba en el tercer bloque, por debajo del
 * pliegue.
 *
 * Ahora las métricas van en franja compacta, con la de «por calificar»
 * destacada en el acento secundario, y el bloque principal es la lista de
 * entregas pendientes con acceso directo a la revisión.
 */

interface InicioSectionProps {
  cursos: Course[];
  estudiantes: Student[];
  tareas: Assignment[];
  setCursoDetalle: (curso: any) => void;
  setEstudianteDetalle: (estudiante: any) => void;
  setTareaEnRevision: (tarea: any) => void;
  setActiveSection?: (section: any) => void;
}

export const InicioSection: React.FC<InicioSectionProps> = ({
  cursos,
  estudiantes,
  tareas,
  setCursoDetalle,
  setTareaEnRevision,
  setActiveSection,
}) => {
  const totalEstudiantes = cursos.reduce((acc, c) => acc + c.estudiantes, 0);
  const tareasPendientes = cursos.reduce(
    (acc, c) => acc + c.tareasPendientesRevision,
    0,
  );
  // Sin cursos, la media sería una división por cero y saldría NaN en pantalla.
  const promedioProgreso = cursos.length
    ? Math.round(
        cursos.reduce((acc, c) => acc + c.progresoGeneral, 0) / cursos.length,
      )
    : 0;

  /**
   * Las entregas sin revisar, de más a menos carga. Ordenar por fecha límite
   * sería mejor, pero `fechaLimite` es una cadena ya formateada y no un dato
   * comparable: eso se arregla cuando el campo venga como fecha real.
   */
  const porCalificar = useMemo(
    () =>
      tareas
        .filter((t) => t.entregasRevisadas < t.entregasTotales)
        .map((t) => ({
          ...t,
          pendientes: t.entregasTotales - t.entregasRevisadas,
        }))
        .sort((a, b) => b.pendientes - a.pendientes),
    [tareas],
  );

  return (
    <div className="space-y-5">
      {/* --- Franja de métricas --- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          indice={0}
          etiqueta="Cursos activos"
          valor={cursos.length}
          icono={BookOpen}
        />
        <StatCard
          indice={1}
          etiqueta="Estudiantes"
          valor={totalEstudiantes}
          icono={Users}
        />
        <StatCard
          indice={2}
          etiqueta="Por calificar"
          valor={tareasPendientes}
          icono={ClipboardCheck}
          nota={tareasPendientes === 1 ? 'entrega' : 'entregas'}
          // La única destacada: es la acción que el docente tiene pendiente.
          destacada={tareasPendientes > 0}
        />
        <StatCard
          indice={3}
          etiqueta="Progreso promedio"
          valor={`${promedioProgreso}%`}
          icono={TrendingUp}
        />
      </div>

      {/* --- Bloque principal: lo que hay sin calificar --- */}
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pn-line px-4 py-3.5">
          <h2 className="font-display text-base font-bold text-pn-ink">
            Por calificar
          </h2>
          {porCalificar.length > 0 && setActiveSection && (
            <Button
              variante="ghost"
              tamano="sm"
              icono={ArrowRight}
              iconoAlFinal
              onClick={() => setActiveSection('tareas')}
            >
              Todas las tareas
            </Button>
          )}
        </div>

        {porCalificar.length === 0 ? (
          <EmptyState
            icono={ClipboardCheck}
            titulo="No tienes nada por calificar"
            descripcion="Cuando tus estudiantes entreguen, las entregas aparecerán aquí ordenadas por carga."
          />
        ) : (
          <ul className="list-none p-0">
            {porCalificar.map((tarea) => (
              <li key={tarea.id}>
                <button
                  type="button"
                  onClick={() => setTareaEnRevision(tarea)}
                  className={cn(
                    'flex w-full items-center gap-4 border-b border-pn-line px-4 py-3 text-left',
                    'transition-colors duration-pn-fast last:border-b-0 hover:bg-pn-surface-2',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                    'focus-visible:ring-pn-accent',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-body text-sm font-semibold text-pn-ink">
                      {tarea.titulo}
                    </span>
                    <span className="block truncate font-body text-[12.5px] text-pn-muted">
                      {tarea.curso} · límite {tarea.fechaLimite}
                    </span>
                  </span>

                  <StatusPill tono="warn" className="shrink-0">
                    {tarea.pendientes} sin revisar
                  </StatusPill>

                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-pn-muted">
                    {tarea.entregasRevisadas}/{tarea.entregasTotales}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* --- Mis cursos --- */}
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pn-line px-4 py-3.5">
          <h2 className="font-display text-base font-bold text-pn-ink">
            Mis cursos
          </h2>
          {setActiveSection && (
            <Button
              variante="ghost"
              tamano="sm"
              icono={ArrowRight}
              iconoAlFinal
              onClick={() => setActiveSection('cursos')}
            >
              Ver todos
            </Button>
          )}
        </div>

        {cursos.length === 0 ? (
          <EmptyState
            icono={BookOpen}
            titulo="Todavía no tienes cursos asignados"
            descripcion="En cuanto la institución te asigne un grupo, aparecerá aquí."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
            {cursos.map((curso, i) => (
              <button
                key={curso.id}
                type="button"
                style={{ '--pn-i': i } as CSSProperties}
                onClick={() => {
                  if (setActiveSection) setActiveSection('cursos');
                  setCursoDetalle(curso);
                }}
                className={cn(
                  'pn-rv rounded-pn-md border border-pn-line p-3.5 text-left',
                  'transition-colors duration-pn-fast hover:bg-pn-surface-2',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pn-accent',
                )}
              >
                <span className="flex flex-wrap items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate font-body text-sm font-semibold text-pn-ink">
                      {curso.nombre}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-pn-muted">
                      {curso.codigo}
                    </span>
                  </span>
                  {curso.tareasPendientesRevision > 0 && (
                    <StatusPill tono="warn" className="shrink-0">
                      {curso.tareasPendientesRevision}
                    </StatusPill>
                  )}
                </span>

                <span className="mt-3 flex items-baseline justify-between font-body text-[12.5px]">
                  <span className="text-pn-muted">Estudiantes</span>
                  <span className="font-mono tabular-nums text-pn-ink">
                    {curso.estudiantes}
                  </span>
                </span>

                <span className="mt-1.5 flex items-baseline justify-between font-body text-[12.5px]">
                  <span className="text-pn-muted">Progreso</span>
                  <span className="font-mono tabular-nums text-pn-ink">
                    {curso.progresoGeneral}%
                  </span>
                </span>
                <span
                  className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-pn-surface-3"
                  role="img"
                  aria-label={`Progreso del curso: ${curso.progresoGeneral} por ciento`}
                >
                  <span
                    className="block h-full rounded-full bg-pn-accent"
                    style={{ width: `${curso.progresoGeneral}%` }}
                  />
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* --- Actividad reciente --- */}
      {estudiantes.length > 0 && (
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pn-line px-4 py-3.5">
            <h2 className="font-display text-base font-bold text-pn-ink">
              Actividad reciente
            </h2>
            {setActiveSection && (
              <Button
                variante="ghost"
                tamano="sm"
                icono={ArrowRight}
                iconoAlFinal
                onClick={() => setActiveSection('estudiantes')}
              >
                Ver estudiantes
              </Button>
            )}
          </div>

          <ul className="list-none p-0">
            {estudiantes.slice(0, 4).map((estudiante) => (
              <li
                key={estudiante.id}
                className="flex items-center gap-3 border-b border-pn-line px-4 py-3 last:border-b-0"
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pn-accent-soft font-display text-[13px] font-bold text-pn-accent-text"
                  aria-hidden="true"
                >
                  {estudiante.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-body text-sm font-medium text-pn-ink">
                    {estudiante.nombre}
                  </span>
                  <span className="block truncate font-body text-[12.5px] text-pn-muted">
                    {estudiante.curso} · {estudiante.ultimaActividad}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums text-pn-ink">
                  {estudiante.calificacionActual}
                  <span className="text-pn-muted">/10</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
