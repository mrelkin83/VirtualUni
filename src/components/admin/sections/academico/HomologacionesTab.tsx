import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check, FileText, X } from 'lucide-react';
import {
  homologacionesApi,
  DecisionDeItemDto,
  HomologationStatus,
  SolicitudDeHomologacion,
} from '../../../../api/endpoints/homologacion';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';
import { formatearFecha } from '../../../../utils/formato';

const ESTADOS: Record<HomologationStatus, { label: string; clase: string }> = {
  SOLICITADA: { label: 'Solicitada', clase: 'bg-blue-100 text-blue-700' },
  EN_REVISION: { label: 'En revisión', clase: 'bg-amber-100 text-amber-700' },
  APROBADA: { label: 'Aprobada', clase: 'bg-green-100 text-green-700' },
  APROBADA_PARCIAL: {
    label: 'Aprobada parcial',
    clase: 'bg-emerald-100 text-emerald-700',
  },
  RECHAZADA: { label: 'Rechazada', clase: 'bg-red-100 text-red-700' },
};

const TIPOS: Record<string, string> = {
  EQUIVALENCIA_INTERNA: 'Equivalencia interna',
  EXTERNA: 'Externa (otra institución)',
  VALIDACION_SUFICIENCIA: 'Validación por suficiencia',
};

/** Bandeja de solicitudes de homologación: revisión y decisión por ítem. */
export function HomologacionesTab() {
  const [filtro, setFiltro] = useState<HomologationStatus | ''>('');
  const [enDetalle, setEnDetalle] = useState<SolicitudDeHomologacion | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['homologaciones', filtro],
    queryFn: () => homologacionesApi.getAll(filtro ? { status: filtro } : {}),
  });

  const solicitudes = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-gray-600 max-w-2xl">
          Las solicitudes llegan del estudiante o se crean desde la ficha. La
          decisión se toma <strong>asignatura por asignatura</strong>: al
          aprobar un ítem se escribe en el historial académico y el estudiante
          recibe la notificación.
        </p>
        <div>
          <label
            htmlFor="filtro-estado"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Estado
          </label>
          <select
            id="filtro-estado"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as HomologationStatus | '')}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Todas</option>
            {Object.entries(ESTADOS).map(([valor, { label }]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Cargando…</p>}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {mensajeDeError(error)}
        </div>
      )}

      {!isLoading && solicitudes.length === 0 && (
        <p className="text-sm text-gray-500">No hay solicitudes con ese filtro.</p>
      )}

      {solicitudes.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Estudiante</th>
                <th className="text-left px-4 py-2 font-medium">Programa destino</th>
                <th className="text-left px-4 py-2 font-medium">Tipo</th>
                <th className="text-right px-4 py-2 font-medium">Asignaturas</th>
                <th className="text-left px-4 py-2 font-medium">Estado</th>
                <th className="text-left px-4 py-2 font-medium">Solicitada</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitudes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">
                      {s.student.user.firstName} {s.student.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.student.studentCode}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {s.programEnrollment.program.name}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {TIPOS[s.type] ?? s.type}
                    {s.originInstitution && (
                      <div className="text-xs text-gray-500">
                        {s.originInstitution}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">{s.items.length}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADOS[s.status].clase}`}
                    >
                      {ESTADOS[s.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {formatearFecha(s.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setEnDetalle(s)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {enDetalle && (
        <ModalRevision solicitud={enDetalle} onCerrar={() => setEnDetalle(null)} />
      )}
    </div>
  );
}

interface DecisionLocal {
  aprobado: boolean | null;
  justificacion: string;
  forzar: boolean;
}

function ModalRevision({
  solicitud,
  onCerrar,
}: {
  solicitud: SolicitudDeHomologacion;
  onCerrar: () => void;
}) {
  const queryClient = useQueryClient();
  const ref = useModalA11y(true, onCerrar);
  const [decisiones, setDecisiones] = useState<Record<string, DecisionLocal>>(
    Object.fromEntries(
      solicitud.items.map((i) => [
        i.id,
        { aprobado: null, justificacion: '', forzar: false },
      ]),
    ),
  );
  const [observaciones, setObservaciones] = useState('');

  const resuelta =
    solicitud.status === 'APROBADA' ||
    solicitud.status === 'APROBADA_PARCIAL' ||
    solicitud.status === 'RECHAZADA';

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['homologaciones'] });
  };

  const enRevision = useMutation({
    mutationFn: () =>
      homologacionesApi.cambiarEstado(solicitud.id, { status: 'EN_REVISION' }),
    onSuccess: invalidar,
  });

  const resolver = useMutation({
    mutationFn: (payload: {
      decisiones: DecisionDeItemDto[];
      decisionNotes?: string;
    }) => homologacionesApi.resolver(solicitud.id, payload),
    onSuccess: () => {
      invalidar();
      onCerrar();
    },
  });

  const decididos = Object.values(decisiones).filter((d) => d.aprobado !== null);
  const puedeResolver = decididos.length > 0 && !resuelta;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-revision"
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="titulo-revision" className="text-lg font-semibold">
              Solicitud de {solicitud.student.user.firstName}{' '}
              {solicitud.student.user.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              {TIPOS[solicitud.type] ?? solicitud.type} ·{' '}
              {solicitud.programEnrollment.program.name}
              {solicitud.originInstitution && ` · ${solicitud.originInstitution}`}
            </p>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className="p-1">
            <X size={20} />
          </button>
        </div>

        {solicitud.supportFiles.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700">Soportes</h4>
            <ul className="text-sm space-y-0.5">
              {solicitud.supportFiles.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:underline"
                  >
                    <FileText size={14} />
                    {url.split('/').pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {solicitud.status === 'SOLICITADA' && (
          <button
            onClick={() => enRevision.mutate()}
            disabled={enRevision.isPending}
            className="px-4 py-2 border border-amber-300 bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 disabled:opacity-50"
          >
            {enRevision.isPending ? 'Marcando…' : 'Marcar en revisión'}
          </button>
        )}

        {resuelta && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
            Esta solicitud ya fue resuelta ({ESTADOS[solicitud.status].label}).
            {solicitud.decisionNotes && ` ${solicitud.decisionNotes}`}
          </div>
        )}

        <div className="space-y-3">
          {solicitud.items.map((item) => {
            const local = decisiones[item.id];
            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-3 space-y-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.targetSubject.code} — {item.targetSubject.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Destino: {item.targetSubject.credits ?? '—'} créditos ·{' '}
                      {item.targetSubject.hours ?? '—'} h · Origen:{' '}
                      {item.originName ?? 'sin nombre'} · {item.originHours ?? '—'}{' '}
                      h · nota {item.originGrade ?? '—'}
                    </div>
                  </div>
                  {item.decision && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.decision === 'APROBADO'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.decision}
                    </span>
                  )}
                </div>

                {item.decisionNotes && (
                  <p className="text-xs text-gray-600">{item.decisionNotes}</p>
                )}

                {!resuelta && (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setDecisiones({
                            ...decisiones,
                            [item.id]: { ...local, aprobado: true },
                          })
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${
                          local.aprobado === true
                            ? 'bg-green-600 text-white border-green-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Check size={14} />
                        Aprobar
                      </button>
                      <button
                        onClick={() =>
                          setDecisiones({
                            ...decisiones,
                            [item.id]: { ...local, aprobado: false },
                          })
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${
                          local.aprobado === false
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <X size={14} />
                        Rechazar
                      </button>
                    </div>

                    {local.aprobado === true && (
                      <label className="flex items-start gap-2 text-sm text-amber-800">
                        <input
                          type="checkbox"
                          checked={local.forzar}
                          onChange={(e) =>
                            setDecisiones({
                              ...decisiones,
                              [item.id]: { ...local, forzar: e.target.checked },
                            })
                          }
                          className="mt-1"
                        />
                        <span className="flex items-start gap-1.5">
                          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                          Forzar aunque falle una validación (nota mínima, horas o
                          tope del pensum). Exige justificación y queda auditado.
                        </span>
                      </label>
                    )}

                    {local.aprobado !== null && (
                      <input
                        type="text"
                        value={local.justificacion}
                        onChange={(e) =>
                          setDecisiones({
                            ...decisiones,
                            [item.id]: { ...local, justificacion: e.target.value },
                          })
                        }
                        placeholder={
                          local.forzar
                            ? 'Justificación obligatoria (acta, concepto del consejo…)'
                            : 'Observación de la decisión (opcional)'
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!resuelta && (
          <div>
            <label
              htmlFor="obs-decision"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Observaciones de la decisión (opcional)
            </label>
            <input
              id="obs-decision"
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        )}

        {resolver.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {mensajeDeError(resolver.error)}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCerrar}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
          {!resuelta && (
            <button
              onClick={() =>
                resolver.mutate({
                  decisiones: Object.entries(decisiones)
                    .filter(([, d]) => d.aprobado !== null)
                    .map(([itemId, d]) => ({
                      itemId,
                      aprobado: d.aprobado as boolean,
                      ...(d.forzar ? { forzar: true } : {}),
                      ...(d.justificacion ? { justificacion: d.justificacion } : {}),
                    })),
                  ...(observaciones ? { decisionNotes: observaciones } : {}),
                })
              }
              disabled={!puedeResolver || resolver.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {resolver.isPending
                ? 'Guardando…'
                : `Resolver ${decididos.length} de ${solicitud.items.length}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
