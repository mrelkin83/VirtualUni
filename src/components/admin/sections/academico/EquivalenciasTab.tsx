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
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-600 max-w-2xl">
          Una equivalencia sirve cuando la asignatura aprobada y la del pensum
          destino <strong>no son la misma</strong> (otro código, otro nombre).
          Si los dos programas comparten la misma asignatura, el reconocimiento
          ya es automático y no hace falta declarar nada.
        </p>
        <button
          onClick={() => setModalAbierta(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shrink-0"
        >
          <Plus size={16} />
          Nueva equivalencia
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Cargando…</p>}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {mensajeDeError(error)}
        </div>
      )}

      {!isLoading && equivalencias.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no hay equivalencias declaradas.
        </p>
      )}

      {equivalencias.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
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
            <tbody className="divide-y divide-gray-200">
              {equivalencias.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">
                      {e.sourceSubject.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {e.sourceSubject.code}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center text-gray-400">
                    {e.bidirectional ? (
                      <span title="Vale en los dos sentidos">
                        <ArrowLeftRight size={16} />
                      </span>
                    ) : (
                      <ArrowRight size={16} />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">
                      {e.targetSubject.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {e.targetSubject.code}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{e.notes ?? '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar la equivalencia ${e.sourceSubject.code} → ${e.targetSubject.code}?`,
                          )
                        ) {
                          eliminar.mutate(e.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
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
        className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Asignatura aprobada (origen)
          </label>
          <select
            id="equiv-origen"
            value={form.sourceSubjectId}
            onChange={(e) => setForm({ ...form, sourceSubjectId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Se da por aprobada (destino)
          </label>
          <select
            id="equiv-destino"
            value={form.targetSubjectId}
            onChange={(e) => setForm({ ...form, targetSubjectId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Seleccione…</option>
            {lista.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notas (opcional)
          </label>
          <input
            id="equiv-notas"
            type="text"
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Acta o criterio que sustenta la equivalencia"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {form.sourceSubjectId && form.sourceSubjectId === form.targetSubjectId && (
          <p className="text-sm text-red-600">
            Una asignatura no puede ser equivalente a sí misma.
          </p>
        )}

        {crear.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {mensajeDeError(crear.error)}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCerrar}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {crear.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
