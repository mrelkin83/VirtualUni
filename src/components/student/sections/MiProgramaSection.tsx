import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap,
  Layers,
  CheckCircle2,
  Clock,
  Circle,
  Lock,
  Repeat,
} from 'lucide-react';
import {
  inscripcionesApi,
  progresoApi,
  AsignaturaDeProgreso,
  EstadoAsignatura,
} from '../../../api/endpoints/academico';
import {
  NIVELES,
  MODALIDADES,
  PERIODICIDADES,
  UNIDADES,
  TIPOS_ASIGNATURA,
  ESTADOS_INSCRIPCION,
  colorDeNivel,
  etiquetaNivelDePrograma,
} from '../../admin/sections/academico/etiquetas';
import { mensajeDeError } from '../../admin/sections/academico/errores';

const ESTADOS: Record<
  EstadoAsignatura,
  { texto: string; icono: React.ElementType; clase: string }
> = {
  APROBADA: { texto: 'Aprobada', icono: CheckCircle2, clase: 'text-green-600' },
  EN_CURSO: { texto: 'En curso', icono: Clock, clase: 'text-blue-600' },
  PENDIENTE: { texto: 'Pendiente', icono: Circle, clase: 'text-gray-400' },
  BLOQUEADA_POR_PRERREQUISITO: {
    texto: 'Bloqueada',
    icono: Lock,
    clase: 'text-amber-600',
  },
};

/**
 * "Mi programa": el programa (o programas) del estudiante, su nivel actual, la
 * versión de pensum a la que está anclado y el plan de estudios con el avance
 * por nivel.
 *
 * El avance NO se calcula aquí: viene de `academic-records`, que lo deriva del
 * historial académico (incluye homologaciones y reconocimientos). Calcularlo
 * desde las notas daría una cifra distinta de la oficial.
 */
export function MiProgramaSection({ darkMode = false }: { darkMode?: boolean }) {
  const [inscripcionId, setInscripcionId] = useState<string | null>(null);

  const {
    data: inscripciones,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mis-programas'],
    queryFn: () => inscripcionesApi.misProgramas(),
  });

  // Por defecto, el primer programa activo (o el primero que haya)
  useEffect(() => {
    if (!inscripcionId && inscripciones?.length) {
      const activa = inscripciones.find((i) => i.status === 'ACTIVO');
      setInscripcionId((activa ?? inscripciones[0]).id);
    }
  }, [inscripciones, inscripcionId]);

  const inscripcion = inscripciones?.find((i) => i.id === inscripcionId);

  const {
    data: progreso,
    isLoading: cargandoProgreso,
    error: errorProgreso,
  } = useQuery({
    queryKey: ['progreso-programa', inscripcionId],
    queryFn: () => progresoApi.dePrograma(inscripcionId!),
    enabled: !!inscripcionId,
  });

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const texto = darkMode ? 'text-gray-100' : 'text-gray-900';
  const suave = darkMode ? 'text-gray-400' : 'text-gray-600';

  if (isLoading) {
    return <p className={`text-sm ${suave}`}>Cargando tu programa...</p>;
  }

  if (error != null) {
    return <p className="text-sm text-red-600">{mensajeDeError(error)}</p>;
  }

  if (!inscripciones || inscripciones.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold ${texto}`}>Mi programa</h2>
        <div className={`${card} border rounded-lg p-8 text-center`}>
          <GraduationCap size={32} className="mx-auto mb-2 text-gray-400" />
          <p className={`font-medium ${texto}`}>Todavía no estás inscrito a un programa</p>
          <p className={`text-sm mt-1 ${suave}`}>
            La institución registra tu inscripción al programa y su plan de estudios;
            cuando lo haga, aquí verás tu pensum y el nivel en que vas.
          </p>
        </div>
      </div>
    );
  }

  const programa = inscripcion?.program;
  const etiquetaNivel = programa
    ? etiquetaNivelDePrograma(programa.periodStructure)
    : 'Nivel';
  const resumen = progreso?.resumen;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`text-2xl font-bold ${texto}`}>Mi programa</h2>

        {/* Un estudiante puede cursar varios programas a la vez */}
        {inscripciones.length > 1 && (
          <select
            value={inscripcionId ?? ''}
            onChange={(e) => setInscripcionId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            aria-label="Elegir programa"
          >
            {inscripciones.map((i) => (
              <option key={i.id} value={i.id}>
                {i.program?.name ?? 'Programa'}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tarjeta del programa */}
      {inscripcion && programa && (
        <section className={`${card} border rounded-lg p-5`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-lg font-bold ${texto}`}>{programa.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorDeNivel(
                    programa.educationLevel,
                  )}`}
                >
                  {NIVELES[programa.educationLevel]}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {ESTADOS_INSCRIPCION[inscripcion.status]}
                </span>
              </div>
              {programa.degreeTitle && (
                <p className={`text-sm mt-1 ${suave}`}>Título: {programa.degreeTitle}</p>
              )}
              <p className={`text-sm mt-1 ${suave}`}>
                {MODALIDADES[programa.modality]} · {PERIODICIDADES[programa.periodStructure]} ·{' '}
                {UNIDADES[programa.academicUnit]}
              </p>
            </div>

            <dl className="flex gap-6 shrink-0">
              <div>
                <dt className={`text-xs ${suave}`}>{etiquetaNivel} actual</dt>
                <dd className={`text-2xl font-bold ${texto}`}>
                  {inscripcion.currentLevel}
                  {programa.durationPeriods ? (
                    <span className={`text-sm font-normal ${suave}`}>
                      {' '}
                      de {programa.durationPeriods}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className={`text-xs ${suave}`}>Versión de pensum</dt>
                <dd className={`text-2xl font-bold ${texto}`}>
                  {inscripcion.studyPlan?.version ?? '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Avance oficial del pensum */}
          {resumen && (
            <div className="mt-5">
              <div className="flex items-end justify-between mb-1">
                <span className={`text-sm font-medium ${texto}`}>Avance del plan</span>
                <span className={`text-sm font-bold ${texto}`}>
                  {resumen.porcentajeAvance}%
                </span>
              </div>
              <div
                className="w-full bg-gray-200 rounded-full h-2.5"
                role="progressbar"
                aria-valuenow={resumen.porcentajeAvance}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Avance del plan de estudios"
              >
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, resumen.porcentajeAvance)}%` }}
                />
              </div>
              <p className={`text-xs mt-2 ${suave}`}>
                {resumen.asignaturasAprobadas} de {resumen.asignaturasTotales} asignaturas
                aprobadas
                {resumen.asignaturasReconocidas > 0 &&
                  ` (${resumen.asignaturasReconocidas} reconocidas)`}
                {' · '}
                {programa.academicUnit === 'CREDITOS'
                  ? `${resumen.creditosAprobados} de ${resumen.creditosTotales} créditos`
                  : `${resumen.horasAprobadas} de ${resumen.horasTotales} horas`}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Plan de estudios por niveles, con el estado de cada asignatura */}
      <section className="space-y-3">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${texto}`}>
          <Layers size={18} /> Mi plan de estudios
        </h3>

        {cargandoProgreso && <p className={`text-sm ${suave}`}>Cargando tu avance...</p>}

        {errorProgreso != null && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            No pudimos cargar tu avance: {mensajeDeError(errorProgreso)}
          </p>
        )}

        {progreso && progreso.niveles.length === 0 && (
          <p className={`text-sm ${suave}`}>
            Tu plan de estudios todavía no tiene asignaturas registradas.
          </p>
        )}

        {progreso && progreso.niveles.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-3">
            {progreso.niveles.map((nivel) => {
              const esActual = nivel.level === progreso.currentLevel;
              return (
                <div
                  key={nivel.level}
                  className={`min-w-64 w-64 shrink-0 rounded-lg border ${
                    esActual
                      ? 'border-blue-500 bg-blue-50/60'
                      : darkMode
                        ? 'border-gray-700 bg-gray-800/60'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="px-3 py-2 border-b border-inherit flex items-center justify-between">
                    <h4 className={`font-semibold text-sm ${texto}`}>
                      {etiquetaNivel} {nivel.level}
                    </h4>
                    {esActual && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                        Vas aquí
                      </span>
                    )}
                  </div>

                  <ul className="p-2 space-y-2">
                    {nivel.asignaturas.map((asignatura) => (
                      <li key={asignatura.studyPlanSubjectId}>
                        <TarjetaAsignatura asignatura={asignatura} darkMode={darkMode} />
                      </li>
                    ))}
                    {nivel.asignaturas.length === 0 && (
                      <li className={`text-xs text-center py-3 ${suave}`}>Sin asignaturas</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function TarjetaAsignatura({
  asignatura,
  darkMode,
}: {
  asignatura: AsignaturaDeProgreso;
  darkMode: boolean;
}) {
  const estado = ESTADOS[asignatura.estado];
  const Icono = estado.icono;
  const texto = darkMode ? 'text-gray-100' : 'text-gray-900';
  const suave = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div
      className={`rounded-lg border p-2 ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-xs ${suave}`}>{asignatura.code}</p>
          <p className={`text-sm font-medium ${texto}`}>{asignatura.name}</p>
        </div>
        <span
          className={`shrink-0 flex items-center gap-1 text-[11px] font-medium ${estado.clase}`}
          title={
            asignatura.estado === 'BLOQUEADA_POR_PRERREQUISITO' &&
            asignatura.prerrequisitosPendientes.length > 0
              ? `Te falta aprobar: ${asignatura.prerrequisitosPendientes.join(', ')}`
              : estado.texto
          }
        >
          <Icono size={13} />
          {estado.texto}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mt-1">
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
          {TIPOS_ASIGNATURA[asignatura.subjectType]}
        </span>
        {asignatura.credits != null && (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
            {asignatura.credits} cr
          </span>
        )}
        {asignatura.finalGrade != null && (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-green-50 text-green-700">
            Nota {asignatura.finalGrade}
          </span>
        )}
        {asignatura.reconocida && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 flex items-center gap-1"
            title="No la cursaste en este programa: se te reconoció"
          >
            <Repeat size={10} /> Reconocida
          </span>
        )}
      </div>

      {asignatura.estado === 'BLOQUEADA_POR_PRERREQUISITO' &&
        asignatura.prerrequisitosPendientes.length > 0 && (
          <p className="text-[11px] mt-1 text-amber-700">
            Te falta: {asignatura.prerrequisitosPendientes.join(', ')}
          </p>
        )}
    </div>
  );
}
