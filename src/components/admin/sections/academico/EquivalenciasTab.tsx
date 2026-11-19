import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, ArrowRight, Plus, Trash2, X } from 'lucide-react';
import { asignaturasApi } from '../../../../api/endpoints/academico';
import {
  equivalenciasApi,
  EquivalenciaCreateDto,
} from '../../../../api/endpoints/homologacion';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';
import { confirmar } from '../../../ui';

/**
 * Equivalencias entre asignaturas: "aprobar X equivale a aprobar Y" cuando no
 * son la misma asignatura. La homologación entre programas que COMPARTEN la
 * misma asignatura es automática y no se declara aquí.
 */
export function EquivalenciasTab() {
  const [modalAbierta, setModalAbierta] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['equivalencias'],
    queryFn: () => equivalenciasApi.getAll(),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => equivalenciasApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equivalencias'] }),
  });

  const equivalencias = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-pn-ink-2 max-w-2xl">
          Una equivalencia sirve cuando la asignatura aprobada y la del pensum
          destino <strong>no son la misma</strong> (otro código, otro nombre).
          Si los dos programas comparten la misma asignatura, el reconocimiento
          ya es automático y no hace falta declarar nada.
        </p>
        <button
          onClick={() => setModalAbierta(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover shrink-0"
        >
          <Plus size={16} />
          Nueva equivalencia
        </button>
      </div>

      {isLoading && <p className="text-sm text-pn-muted">Cargando…</p>}
      {error && (
        <div className="p-4 bg-pn-danger-soft border border-pn-danger rounded-lg text-sm text-pn-danger">
          {mensajeDeError(error)}
        </div>
      )}

      {!isLoading && equivalencias.length === 0 && (
        <p className="text-sm text-pn-muted">
          Todavía no hay equivalencias declaradas.
        </p>
      )}

      {equivalencias.length > 0 && (
        <div className="overflow-x-auto border border-pn-line rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-pn-surface-2 text-pn-ink-2">
              <tr>
                <th className="text-left px-4 py-2 font-medium">
                  Asignatura aprobada
                </th>
                <th className="px-4 py-2" />
                <th className="text-left px-4 py-2 font-medium">
                  Se da por aprobada
                </th>
                <th className="text-left px-4 py-2 font-medium">Notas</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-pn-line">
              {equivalencias.map((e) => (
                <tr key={e.id} className="hover:bg-pn-surface-2">
                  <td className="px-4 py-2">
                    <div className="font-medium text-pn-ink">
                      {e.sourceSubject.name}
                    </div>
                    <div className="text-xs text-pn-muted">
                      {e.sourceSubject.code}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center text-pn-muted">
                    {e.bidirectional ? (
                      <span title="Vale en los dos sentidos">
                        <ArrowLeftRight size={16} />
                      </span>
                    ) : (
                      <ArrowRight size={16} />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-pn-ink">
                      {e.targetSubject.name}
                    </div>
                    <div className="text-xs text-pn-muted">
                      {e.targetSubject.code}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-pn-ink-2">{e.notes ?? '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={async () => {
                        if (
                          await confirmar(
                            `¿Eliminar la equivalencia ${e.sourceSubject.code} → ${e.targetSubject.code}?`,
                          )
                        ) {
                          eliminar.mutate(e.id);
                        }
                      }}
                      className="p-1.5 text-pn-danger hover:bg-pn-danger-soft rounded"
                      aria-label={`Eliminar equivalencia ${e.sourceSubject.code} a ${e.targetSubject.code}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {eliminar.error && (
        <div className="p-3 bg-pn-danger-soft border border-pn-danger rounded-lg text-sm text-pn-danger">
          {mensajeDeError(eliminar.error)}
        </div>
      )}

      {modalAbierta && <ModalEquivalencia onCerrar={() => setModalAbierta(false)} />}
    </div>
  );
}

function ModalEquivalencia({ onCerrar }: { onCerrar: () => void }) {
  const queryClient = useQueryClient();
  const ref = useModalA11y(true, onCerrar);
  const [form, setForm] = useState<EquivalenciaCreateDto>({
    sourceSubjectId: '',
    targetSubjectId: '',
    bidirectional: false,
    notes: '',
  });

  const { data: asignaturas } = useQuery({
    queryKey: ['asignaturas', 'equivalencias'],
    queryFn: () => asignaturasApi.getAll({ limit: 200 }),
  });

  const crear = useMutation({
    mutationFn: (dto: EquivalenciaCreateDto) => equivalenciasApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equivalencias'] });
      onCerrar();
    },
  });

  const lista = asignaturas?.data ?? [];
  const puedeGuardar =
    form.sourceSubjectId &&
    form.targetSubjectId &&
    form.sourceSubjectId !== form.targetSubjectId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-equivalencia"
        className="bg-pn-surface rounded-xl w-full max-w-lg p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 id="titulo-equivalencia" className="text-lg font-semibold">
            Nueva equivalencia
          </h3>
          <button onClick={onCerrar} aria-label="Cerrar" className="p-1">
            <X size={20} />
          </button>
        </div>

        <div>
          <label
            htmlFor="equiv-origen"
            className="block text-sm font-medium text-pn-ink-2 mb-1"
          >
            Asignatura aprobada (origen)
          </label>
          <select
            id="equiv-origen"
            value={form.sourceSubjectId}
            onChange={(e) => setForm({ ...form, sourceSubjectId: e.target.value })}
            className="w-full border border-pn-line rounded-lg px-3 py-2"
          >
            <option value="">Seleccione…</option>
            {lista.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="equiv-destino"
            className="block text-sm font-medium text-pn-ink-2 mb-1"
          >
            Se da por aprobada (destino)
          </label>
          <select
            id="equiv-destino"
            value={form.targetSubjectId}
            onChange={(e) => setForm({ ...form, targetSubjectId: e.target.value })}
            className="w-full border border-pn-line rounded-lg px-3 py-2"
          >
            <option value="">Seleccione…</option>
            {lista.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-pn-ink-2">
          <input
            type="checkbox"
            checked={form.bidirectional ?? false}
            onChange={(e) => setForm({ ...form, bidirectional: e.target.checked })}
          />
          Vale en los dos sentidos
        </label>

        <div>
          <label
            htmlFor="equiv-notas"
            className="block text-sm font-medium text-pn-ink-2 mb-1"
          >
            Notas (opcional)
          </label>
          <input
            id="equiv-notas"
            type="text"
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Acta o criterio que sustenta la equivalencia"
            className="w-full border border-pn-line rounded-lg px-3 py-2"
          />
        </div>

        {form.sourceSubjectId && form.sourceSubjectId === form.targetSubjectId && (
          <p className="text-sm text-pn-danger">
            Una asignatura no puede ser equivalente a sí misma.
          </p>
        )}

        {crear.error && (
          <div className="p-3 bg-pn-danger-soft border border-pn-danger rounded-lg text-sm text-pn-danger">
            {mensajeDeError(crear.error)}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCerrar}
            className="px-4 py-2 border border-pn-line rounded-lg text-pn-ink-2 hover:bg-pn-surface-2"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              crear.mutate({
                sourceSubjectId: form.sourceSubjectId,
                targetSubjectId: form.targetSubjectId,
                bidirectional: form.bidirectional,
                ...(form.notes ? { notes: form.notes } : {}),
              })
            }
            disabled={!puedeGuardar || crear.isPending}
            className="px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover disabled:opacity-50"
          >
            {crear.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
