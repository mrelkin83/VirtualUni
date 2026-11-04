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
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={16} />
            Exportar a PDF
          </button>
        )}
      </div>

      {!programId && (
        <p className="text-sm text-gray-500">
          Elija un programa para ver a qué otros programas se articula y cuánto
          se le reconocería a un egresado suyo.
        </p>
      )}

      {isLoading && <p className="text-sm text-gray-500">Calculando…</p>}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {mensajeDeError(error)}
        </div>
      )}

      {matriz && (
        <>
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              {matriz.nota} El egresado de{' '}
              <strong>{matriz.origen.programName}</strong> (pensum{' '}
              {matriz.origen.studyPlanVersion}, {matriz.origen.asignaturas}{' '}
              asignaturas) se articula así:
            </span>
          </div>

          {matriz.destinos.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay otros programas ACTIVO con pensum VIGENTE para comparar.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Diagrama sencillo origen → destinos */}
              <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  {matriz.origen.programCode}
                </span>
                <ArrowRight size={18} className="text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {matriz.destinos.map((d) => (
                    <span
                      key={d.programId}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm"
                    >
                      {d.programCode}
                      <span className="ml-2 text-blue-600 font-semibold">
                        {d.porcentajeAvance} %
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
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
                  <tbody className="divide-y divide-gray-200">
                    {matriz.destinos.map((d) => (
                      <React.Fragment key={d.programId}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <div className="font-medium text-gray-900">
                              {d.programName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {d.programCode} · pensum {d.studyPlanVersion}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-gray-600">
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
                          <td className="px-4 py-2 text-right font-semibold text-blue-600">
                            {d.porcentajeAvance} %
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() =>
                                setExpandido(
                                  expandido === d.programId ? null : d.programId,
                                )
                              }
                              className="text-sm text-blue-600 hover:underline"
                              aria-expanded={expandido === d.programId}
                            >
                              {expandido === d.programId ? 'Ocultar' : 'Detalle'}
                            </button>
                          </td>
                        </tr>

                        {expandido === d.programId && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="px-4 py-3">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <h4 className="text-sm font-semibold text-green-700 mb-1">
                                    Se le reconocen ({d.reconocidas.length})
                                  </h4>
                                  <ul className="text-sm text-gray-700 space-y-0.5">
                                    {d.reconocidas.map((a) => (
                                      <li key={a.subjectId}>
                                        {a.code} — {a.name}
                                        {a.viaSubjectId && (
                                          <span className="ml-1 text-xs text-amber-700">
                                            (por equivalencia)
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                    {d.reconocidas.length === 0 && (
                                      <li className="text-gray-500">Ninguna</li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                    Le faltaría cursar ({d.faltantes.length})
                                  </h4>
                                  <ul className="text-sm text-gray-700 space-y-0.5">
                                    {d.faltantes.map((a) => (
                                      <li key={a.subjectId}>
                                        {a.code} — {a.name}
                                      </li>
                                    ))}
                                    {d.faltantes.length === 0 && (
                                      <li className="text-gray-500">
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
