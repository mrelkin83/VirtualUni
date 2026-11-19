import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Download, Info } from 'lucide-react';
import { programasApi } from '../../../../api/endpoints/academico';
import { articulacionApi } from '../../../../api/endpoints/homologacion';
import { NIVELES } from './etiquetas';
import { mensajeDeError } from './errores';
import { generateArticulationPDF } from '../../../../utils/pdfExport';

/**
 * Matriz de articulación: para un programa origen, qué le reconocería cada
 * otro programa ACTIVO a un egresado suyo. Reemplaza la tabla escrita a mano:
 * todo sale de los pensums reales y los porcentajes van sobre el DESTINO.
 */
export function ArticulacionTab() {
  const [programId, setProgramId] = useState('');
  const [expandido, setExpandido] = useState<string | null>(null);

  const { data: programas } = useQuery({
    queryKey: ['programas', 'articulacion'],
    queryFn: () => programasApi.getAll({ limit: 100, status: 'ACTIVO' }),
  });

  const {
    data: matriz,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['articulacion', programId],
    queryFn: () => articulacionApi.matriz(programId),
    enabled: !!programId,
  });

  const lista = programas?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[260px]">
          <label
            htmlFor="programa-origen"
            className="block text-sm font-medium text-pn-ink-2 mb-1"
          >
            Programa de origen
          </label>
          <select
            id="programa-origen"
            value={programId}
            onChange={(e) => {
              setProgramId(e.target.value);
              setExpandido(null);
            }}
            className="w-full border border-pn-line rounded-lg px-3 py-2"
          >
            <option value="">Seleccione un programa…</option>
            {lista.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </div>

        {matriz && matriz.destinos.length > 0 && (
          <button
            onClick={() => generateArticulationPDF(matriz)}
            className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover"
          >
            <Download size={16} />
            Exportar a PDF
          </button>
        )}
      </div>

      {!programId && (
        <p className="text-sm text-pn-muted">
          Elija un programa para ver a qué otros programas se articula y cuánto
          se le reconocería a un egresado suyo.
        </p>
      )}

      {isLoading && <p className="text-sm text-pn-muted">Calculando…</p>}

      {error && (
        <div className="p-4 bg-pn-danger-soft border border-pn-danger rounded-lg text-sm text-pn-danger">
          {mensajeDeError(error)}
        </div>
      )}

      {matriz && (
        <>
          <div className="flex items-start gap-2 p-3 bg-pn-accent-soft border border-pn-accent-line rounded-lg text-sm text-pn-accent-text">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              {matriz.nota} El egresado de{' '}
              <strong>{matriz.origen.programName}</strong> (pensum{' '}
              {matriz.origen.studyPlanVersion}, {matriz.origen.asignaturas}{' '}
              asignaturas) se articula así:
            </span>
          </div>

          {matriz.destinos.length === 0 ? (
            <p className="text-sm text-pn-muted">
              No hay otros programas ACTIVO con pensum VIGENTE para comparar.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Diagrama sencillo origen → destinos */}
              <div className="flex flex-wrap items-center gap-2 p-4 bg-pn-surface-2 border border-pn-line rounded-lg">
                <span className="px-3 py-1.5 bg-pn-accent text-pn-accent-ink rounded-lg text-sm font-medium">
                  {matriz.origen.programCode}
                </span>
                <ArrowRight size={18} className="text-pn-muted" />
                <div className="flex flex-wrap gap-2">
                  {matriz.destinos.map((d) => (
                    <span
                      key={d.programId}
                      className="px-3 py-1.5 bg-pn-surface border border-pn-line rounded-lg text-sm"
                    >
                      {d.programCode}
                      <span className="ml-2 text-pn-accent-text font-semibold">
                        {d.porcentajeAvance} %
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border border-pn-line rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-pn-surface-2 text-pn-ink-2">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">
                        Programa destino
                      </th>
                      <th className="text-left px-4 py-2 font-medium">Nivel</th>
                      <th className="text-right px-4 py-2 font-medium">
                        Asignaturas
                      </th>
                      <th className="text-right px-4 py-2 font-medium">Créditos</th>
                      <th className="text-right px-4 py-2 font-medium">Horas</th>
                      <th className="text-right px-4 py-2 font-medium">Avance</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pn-line">
                    {matriz.destinos.map((d) => (
                      <React.Fragment key={d.programId}>
                        <tr className="hover:bg-pn-surface-2">
                          <td className="px-4 py-2">
                            <div className="font-medium text-pn-ink">
                              {d.programName}
                            </div>
                            <div className="text-xs text-pn-muted">
                              {d.programCode} · pensum {d.studyPlanVersion}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-pn-ink-2">
                            {NIVELES[d.educationLevel] ?? d.educationLevel}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {d.asignaturasReconocidas} de {d.asignaturasTotales}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {d.creditosReconocidos} de {d.creditosTotales}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {d.horasReconocidas} de {d.horasTotales}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-pn-accent-text">
                            {d.porcentajeAvance} %
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() =>
                                setExpandido(
                                  expandido === d.programId ? null : d.programId,
                                )
                              }
                              className="text-sm text-pn-accent-text hover:underline"
                              aria-expanded={expandido === d.programId}
                            >
                              {expandido === d.programId ? 'Ocultar' : 'Detalle'}
                            </button>
                          </td>
                        </tr>

                        {expandido === d.programId && (
                          <tr className="bg-pn-surface-2">
                            <td colSpan={7} className="px-4 py-3">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <h4 className="text-sm font-semibold text-pn-ok mb-1">
                                    Se le reconocen ({d.reconocidas.length})
                                  </h4>
                                  <ul className="text-sm text-pn-ink-2 space-y-0.5">
                                    {d.reconocidas.map((a) => (
                                      <li key={a.subjectId}>
                                        {a.code} — {a.name}
                                        {a.viaSubjectId && (
                                          <span className="ml-1 text-xs text-pn-warn">
                                            (por equivalencia)
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                    {d.reconocidas.length === 0 && (
                                      <li className="text-pn-muted">Ninguna</li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-pn-ink-2 mb-1">
                                    Le faltaría cursar ({d.faltantes.length})
                                  </h4>
                                  <ul className="text-sm text-pn-ink-2 space-y-0.5">
                                    {d.faltantes.map((a) => (
                                      <li key={a.subjectId}>
                                        {a.code} — {a.name}
                                      </li>
                                    ))}
                                    {d.faltantes.length === 0 && (
                                      <li className="text-pn-muted">
                                        Nada: el pensum queda cubierto
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
