import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Users, CalendarDays } from 'lucide-react';
import { gruposDocenteApi } from '../../../api/endpoints/academico';
import {
  ESTADOS_PERIODO,
  MODALIDADES,
} from '../../admin/sections/academico/etiquetas';
import { mensajeDeError } from '../../admin/sections/academico/errores';

/**
 * Contexto académico de los grupos del docente: qué asignatura del catálogo
 * dicta cada grupo, en qué periodo, con qué código de grupo y cupo, y de qué
 * PROGRAMAS vienen sus alumnos (un grupo puede mezclar estudiantes de varios
 * programas, y eso cambia cómo se enfoca la clase).
 *
 * Es autónomo: trae sus propios datos con react-query en vez de pasar por el
 * hook gigante del panel docente.
 */
export function MisGruposPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mis-grupos-docente'],
    queryFn: () => gruposDocenteApi.mios(),
  });

  const texto = 'text-pn-ink';
  const suave = 'text-pn-ink-2';

  if (isLoading) {
    return <p className={`text-sm ${suave}`}>Cargando el contexto académico de tus grupos...</p>;
  }

  if (error != null) {
    return <p className="text-sm text-pn-danger">{mensajeDeError(error)}</p>;
  }

  const grupos = data ?? [];
  if (grupos.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className={`text-lg font-bold ${texto}`}>Mis grupos este periodo</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {grupos.map((grupo) => (
          <article key={grupo.id} className={`bg-pn-surface border rounded-lg p-4 shadow-sm`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className={`font-semibold ${texto}`}>
                  {grupo.subject?.name ?? grupo.name}
                </h4>
                <p className={`text-sm ${suave}`}>
                  {grupo.subject ? (
                    <>
                      {grupo.subject.code}
                      {grupo.groupCode ? ` · Grupo ${grupo.groupCode}` : ''}
                    </>
                  ) : (
                    // Grupo legado: sin asignatura de catálogo todavía
                    <span className="text-pn-warn">
                      Sin asignatura de catálogo ({grupo.code})
                    </span>
                  )}
                </p>
              </div>

              <span
                className={`shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  grupo.academicPeriod?.status === 'EN_CURSO'
                    ? 'bg-pn-ok-soft text-pn-ok'
                    : 'bg-pn-surface-3 text-pn-ink-2'
                }`}
              >
                <CalendarDays size={13} />
                {grupo.academicPeriod
                  ? `${grupo.academicPeriod.code} · ${ESTADOS_PERIODO[grupo.academicPeriod.status]}`
                  : (grupo.semester ?? 'Sin periodo')}
              </span>
            </div>

            <p className={`text-sm mt-2 flex items-center gap-1 ${suave}`}>
              <Users size={14} />
              {grupo.estudiantes}
              {grupo.capacity ? `/${grupo.capacity}` : ''} estudiantes
              {grupo.modality ? ` · ${MODALIDADES[grupo.modality]}` : ''}
            </p>

            {grupo.programasDeOrigen.length > 0 && (
              <div className="mt-3">
                <p className={`text-xs font-medium mb-1 flex items-center gap-1 ${suave}`}>
                  <GraduationCap size={13} />
                  Programas de origen de tus alumnos
                </p>
                <ul className="flex flex-wrap gap-1">
                  {grupo.programasDeOrigen.map((programa) => (
                    <li
                      key={programa.id}
                      className="text-xs px-2 py-0.5 rounded-full bg-pn-accent-soft text-pn-accent-text"
                      title={programa.code}
                    >
                      {programa.name} · {programa.estudiantes}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
