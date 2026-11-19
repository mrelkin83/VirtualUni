import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Lock, Unlock, X } from 'lucide-react';
import { cierreDeNotasApi } from '../../../../api/endpoints/homologacion';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';
import { formatearFecha } from '../../../../utils/formato';

/**
 * Cierre de notas de un grupo: previsualiza la definitiva de cada matriculado
 * y, al confirmar, la pasa al historial académico y bloquea la edición de
 * notas. La reapertura exige motivo y anula los registros del cierre anterior.
 */
export function CierreDeNotasModal({
  courseId,
  nombreGrupo,
  onCerrar,
}: {
  courseId: string;
  nombreGrupo: string;
  onCerrar: () => void;
}) {
  const queryClient = useQueryClient();
  const ref = useModalA11y(true, onCerrar);
  const [observaciones, setObservaciones] = useState('');
  const [motivo, setMotivo] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['cierre-notas', courseId],
    queryFn: () => cierreDeNotasApi.previsualizar(courseId),
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['cierre-notas', courseId] });
    queryClient.invalidateQueries({ queryKey: ['grupos'] });
  };

  const cerrar = useMutation({
    mutationFn: () => cierreDeNotasApi.cerrar(courseId, observaciones || undefined),
    onSuccess: invalidar,
  });

  const reabrir = useMutation({
    mutationFn: () => cierreDeNotasApi.reabrir(courseId, motivo),
    onSuccess: invalidar,
  });

  const cerrado = !!data?.course.gradesClosedAt;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-cierre"
        className="bg-pn-surface rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 id="titulo-cierre" className="text-lg font-semibold">
              Cierre de notas · {nombreGrupo}
            </h3>
            {data && (
              <p className="text-sm text-pn-ink-2">
                {data.subject.code} — {data.subject.name}
                {data.academicPeriod ? ` · ${data.academicPeriod.code}` : ''} ·
                captura {data.escalaDeCaptura}
              </p>
            )}
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className="p-1">
            <X size={20} />
          </button>
        </div>

        {isLoading && <p className="text-sm text-pn-muted">Calculando…</p>}
        {error && (
          <div className="p-3 bg-pn-danger-soft border border-pn-danger rounded-lg text-sm text-pn-danger">
            {mensajeDeError(error)}
          </div>
        )}

        {data && (
          <>
            {cerrado && (
              <div className="flex items-start gap-2 p-3 bg-pn-surface-2 border border-pn-line rounded-lg text-sm text-pn-ink-2">
                <Lock size={16} className="mt-0.5 shrink-0" />
                <span>
                  Las notas se cerraron el{' '}
                  {formatearFecha(data.course.gradesClosedAt as string)}. Mientras
                  estén cerradas no se pueden registrar ni corregir notas del
                  grupo.
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-pn-ink-2">
              <span>
                <strong>{data.totales.matriculados}</strong> matriculados
              </span>
              <span>
                <strong>{data.totales.calculables}</strong> con nota calculable
              </span>
              <span className="text-pn-ok">
                <strong>{data.totales.aprobados}</strong> aprobarían
              </span>
              <span className="text-pn-danger">
                <strong>{data.totales.reprobados}</strong> reprobarían
              </span>
            </div>

            <div className="overflow-x-auto border border-pn-line rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-pn-surface-2 text-pn-ink-2">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Estudiante</th>
                    <th className="text-right px-3 py-2 font-medium">Parciales</th>
                    <th className="text-right px-3 py-2 font-medium">
                      Promedio (0–100)
                    </th>
                    <th className="text-right px-3 py-2 font-medium">Definitiva</th>
                    <th className="text-left px-3 py-2 font-medium">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pn-line">
                  {data.filas.map((fila) => (
                    <tr key={fila.studentId} className="align-top">
                      <td className="px-3 py-2">
                        <div className="font-medium text-pn-ink">{fila.nombre}</div>
                        <div className="text-xs text-pn-muted">
                          {fila.studentCode}
                          {fila.politica.programName
                            ? ` · ${fila.politica.programName}`
                            : ''}
                        </div>
                        {fila.avisos.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {fila.avisos.map((aviso) => (
                              <li
                                key={aviso}
                                className="flex items-start gap-1 text-xs text-pn-warn"
                              >
                                <AlertTriangle
                                  size={12}
                                  className="mt-0.5 shrink-0"
                                />
                                {aviso}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">{fila.parciales}</td>
                      <td className="px-3 py-2 text-right">
                        {fila.promedio100 ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {fila.finalGrade ?? '—'}
                        <span className="text-xs text-pn-muted">
                          {' '}
                          / {fila.politica.gradeScaleMax}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {fila.passed === null ? (
                          <span className="text-pn-muted">Sin calcular</span>
                        ) : fila.passed ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pn-ok-soft text-pn-ok">
                            Aprueba
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pn-danger-soft text-pn-danger">
                            Reprueba
                          </span>
                        )}
                        <div className="text-xs text-pn-muted mt-0.5">
                          mínimo {fila.politica.passingGrade}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!cerrado ? (
              <>
                <div>
                  <label
                    htmlFor="obs-cierre"
                    className="block text-sm font-medium text-pn-ink-2 mb-1"
                  >
                    Observaciones del acta (opcional)
                  </label>
                  <input
                    id="obs-cierre"
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full border border-pn-line rounded-lg px-3 py-2"
                  />
                </div>

                {cerrar.error && (
                  <div className="p-3 bg-pn-danger-soft border border-pn-danger rounded-lg text-sm text-pn-danger">
                    {mensajeDeError(cerrar.error)}
                  </div>
                )}
                {cerrar.data && (
                  <div className="p-3 bg-pn-ok-soft border border-pn-ok rounded-lg text-sm text-pn-ok">
                    {cerrar.data.message}
                    {cerrar.data.sinCalcular.length > 0 && (
                      <ul className="mt-1 list-disc list-inside">
                        {cerrar.data.sinCalcular.map((s) => (
                          <li key={s.studentId}>
                            {s.nombre}: {s.avisos.join('; ')}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={onCerrar}
                    className="px-4 py-2 border border-pn-line rounded-lg text-pn-ink-2 hover:bg-pn-surface-2"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => cerrar.mutate()}
                    disabled={data.totales.calculables === 0 || cerrar.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover disabled:opacity-50"
                  >
                    <Lock size={16} />
                    {cerrar.isPending
                      ? 'Cerrando…'
                      : `Cerrar notas (${data.totales.calculables})`}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="motivo-reapertura"
                    className="block text-sm font-medium text-pn-ink-2 mb-1"
                  >
                    Motivo de la reapertura (queda auditado)
                  </label>
                  <input
                    id="motivo-reapertura"
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej.: se corrigió el parcial 2 de dos estudiantes"
                    className="w-full border border-pn-line rounded-lg px-3 py-2"
                  />
                </div>

                {reabrir.error && (
                  <div className="p-3 bg-pn-danger-soft border border-pn-danger rounded-lg text-sm text-pn-danger">
                    {mensajeDeError(reabrir.error)}
                  </div>
                )}
                {reabrir.data && (
                  <div className="p-3 bg-pn-ok-soft border border-pn-ok rounded-lg text-sm text-pn-ok">
                    {reabrir.data.message}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={onCerrar}
                    className="px-4 py-2 border border-pn-line rounded-lg text-pn-ink-2 hover:bg-pn-surface-2"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => reabrir.mutate()}
                    disabled={motivo.trim().length < 5 || reabrir.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-pn-warn text-pn-surface rounded-lg hover:bg-pn-warn disabled:opacity-50"
                  >
                    <Unlock size={16} />
                    {reabrir.isPending ? 'Reabriendo…' : 'Reabrir notas'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
