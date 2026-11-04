import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { articulacionApi } from '../../../api/endpoints/homologacion';
import { inscripcionesApi } from '../../../api/endpoints/academico';

/**
 * "Tu ruta a un segundo título": programas a los que el estudiante podría
 * pasar, ordenados por lo que ya trae aprobado y con lo que le faltaría.
 *
 * Se calcula desde su historial real, no desde el pensum completo de su
 * programa, y los porcentajes van sobre el pensum DESTINO. Si el endpoint no
 * responde la tarjeta simplemente no se muestra: es informativa.
 *
 * Resuelve su propia ficha de estudiante desde `mis-programas` para poder
 * montarse con una sola línea, sin props.
 */
export function RutaSegundoTitulo() {
  const [expandido, setExpandido] = useState<string | null>(null);

  const { data: misProgramas } = useQuery({
    queryKey: ['mis-programas'],
    queryFn: () => inscripcionesApi.misProgramas(),
  });
  const studentId = misProgramas?.[0]?.studentId;

  const { data, isLoading, error } = useQuery({
    queryKey: ['doble-titulacion', studentId],
    queryFn: () => articulacionApi.dobleTitulacion(studentId as string),
    enabled: !!studentId,
  });

  if (!studentId || isLoading || error) return null;

  const opciones = (data?.opciones ?? []).filter(
    (o) => o.resumen.asignaturasAprobadas > 0,
  );
  if (opciones.length === 0) return null;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <header className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <GraduationCap size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tu ruta a un segundo título
          </h3>
          <p className="text-sm text-gray-600">
            Con lo que ya aprobaste, estos programas te reconocerían parte del
            plan de estudios. Los porcentajes son sobre el total del programa al
            que entrarías.
          </p>
        </div>
      </header>

      <ul className="space-y-3">
        {opciones.map((o) => (
          <li key={o.programId} className="border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="font-medium text-gray-900">{o.programName}</h4>
                <p className="text-sm text-gray-600">
                  {o.degreeTitle ?? o.programCode} · te reconocen{' '}
                  {o.resumen.asignaturasAprobadas} de{' '}
                  {o.resumen.asignaturasTotales} asignaturas
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {o.resumen.porcentajeAvance} %
                </div>
                <div className="text-xs text-gray-500">ya cursado</div>
              </div>
            </div>

            <div
              className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={o.resumen.porcentajeAvance}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Avance en ${o.programName}`}
            >
              <div
                className="h-full bg-blue-600"
                style={{ width: `${Math.min(100, o.resumen.porcentajeAvance)}%` }}
              />
            </div>

            <button
              onClick={() =>
                setExpandido(expandido === o.programId ? null : o.programId)
              }
              className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:underline"
              aria-expanded={expandido === o.programId}
            >
              {expandido === o.programId ? (
                <>
                  <ChevronUp size={14} /> Ocultar detalle
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Ver qué te faltaría cursar
                </>
              )}
            </button>

            {expandido === o.programId && (
              <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <h5 className="font-semibold text-green-700 mb-1">
                    Ya aprobadas ({o.reconocidas.length})
                  </h5>
                  <ul className="space-y-0.5 text-gray-700">
                    {o.reconocidas.map((a) => (
                      <li key={a.subjectId}>
                        {a.code} — {a.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-700 mb-1">
                    Te faltaría ({o.faltantes.length})
                  </h5>
                  <ul className="space-y-0.5 text-gray-700">
                    {o.faltantes.map((a) => (
                      <li key={a.subjectId}>
                        {a.code} — {a.name}
                        {a.credits != null && (
                          <span className="text-xs text-gray-500">
                            {' '}
                            ({a.credits} créditos
                            {a.hours != null ? ` · ${a.hours} h` : ''})
                          </span>
                        )}
                      </li>
                    ))}
                    {o.faltantes.length === 0 && (
                      <li className="text-gray-500">
                        Nada: el plan te queda cubierto por completo
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-500">
        Es una estimación con tu historial de hoy. La institución confirma el
        reconocimiento al momento de inscribirte.
      </p>
    </section>
  );
}
