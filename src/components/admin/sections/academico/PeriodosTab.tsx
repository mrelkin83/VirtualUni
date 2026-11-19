import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, X, CircleDot } from 'lucide-react';
import {
  periodosApi,
  Periodo,
  PeriodoCreateDto,
  PeriodStatus,
} from '../../../../api/endpoints/academico';
import { ESTADOS_PERIODO } from './etiquetas';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';
import { formatearFecha } from '../../../../utils/formato';
import { avisar } from '../../../ui';

export function PeriodosTab() {
  const [modal, setModal] = useState<{ abierta: boolean; periodo: Periodo | null }>({
    abierta: false,
    periodo: null,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['periodos'],
    queryFn: () => periodosApi.getAll({ limit: 100 }),
  });
  const { data: enCurso } = useQuery({
    queryKey: ['periodo-actual'],
    queryFn: () => periodosApi.current(),
  });

  const periodos = data?.data ?? [];

  const colorEstado = (estado: PeriodStatus) =>
    estado === 'EN_CURSO'
      ? 'bg-pn-ok-soft text-pn-ok'
      : estado === 'PLANEADO'
        ? 'bg-pn-accent-soft text-pn-accent-text'
        : 'bg-pn-surface-3 text-pn-ink-2';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pn-ink-2">
          Periodo en curso:{' '}
          {enCurso ? (
            <strong className="text-pn-ink">{enCurso.name} ({enCurso.code})</strong>
          ) : (
            'ninguno'
          )}
        </p>
        <button
          onClick={() => setModal({ abierta: true, periodo: null })}
          className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg hover:bg-pn-accent-hover flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Nuevo periodo
        </button>
      </div>

      {isLoading && <p className="text-pn-muted text-sm">Cargando periodos...</p>}
      {error != null && <p className="text-pn-danger text-sm">{mensajeDeError(error)}</p>}

      <div className="bg-pn-surface rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pn-line text-left text-pn-muted">
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Inicio</th>
              <th className="px-4 py-3 font-medium">Fin</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Grupos</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((periodo) => (
              <tr key={periodo.id} className="border-b border-pn-line hover:bg-pn-surface-2">
                <td className="px-4 py-2 font-medium text-pn-ink">
                  <span className="flex items-center gap-1">
                    {enCurso?.id === periodo.id && (
                      <CircleDot size={14} className="text-pn-ok" aria-label="Periodo en curso" />
                    )}
                    {periodo.code}
                  </span>
                </td>
                <td className="px-4 py-2 text-pn-ink-2">{periodo.name}</td>
                <td className="px-4 py-2 text-pn-ink-2">{formatearFecha(periodo.startDate)}</td>
                <td className="px-4 py-2 text-pn-ink-2">{formatearFecha(periodo.endDate)}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorEstado(periodo.status)}`}>
                    {ESTADOS_PERIODO[periodo.status]}
                  </span>
                </td>
                <td className="px-4 py-2">{periodo._count?.courses ?? 0}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => setModal({ abierta: true, periodo })}
                    className="p-1.5 text-pn-accent-text hover:bg-pn-accent-soft rounded"
                    title="Editar"
                  >
                    <Edit size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && periodos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-pn-muted">
                  No hay periodos. Cree el primero, por ejemplo "2027-1".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.abierta && (
        <PeriodoFormModal
          periodo={modal.periodo}
          onClose={() => setModal({ abierta: false, periodo: null })}
        />
      )}
    </div>
  );
}

function PeriodoFormModal({
  periodo,
  onClose,
}: {
  periodo: Periodo | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const [valores, setValores] = useState<PeriodoCreateDto>({
    code: periodo?.code ?? '',
    name: periodo?.name ?? '',
    startDate: periodo?.startDate?.slice(0, 10) ?? '',
    endDate: periodo?.endDate?.slice(0, 10) ?? '',
    status: periodo?.status,
  });

  const guardar = useMutation({
    mutationFn: () =>
      periodo ? periodosApi.update(periodo.id, valores) : periodosApi.create(valores),
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      queryClient.invalidateQueries({ queryKey: ['periodo-actual'] });
      // El backend advierte solapamientos sin bloquear
      if (resultado.advertencias?.length) {
        avisar.error(resultado.advertencias.join('\n'));
      }
      onClose();
    },
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  const campo = 'w-full p-2 border border-pn-line rounded-lg text-sm';
  const etiqueta = 'block text-sm font-semibold mb-1 text-pn-ink-2';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={periodo ? 'Editar periodo' : 'Nuevo periodo'}
        tabIndex={-1}
        className="bg-pn-surface rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-pn-ink">
            {periodo ? 'Editar periodo' : 'Nuevo periodo'}
          </h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valores.code.trim() || !valores.name.trim() || !valores.startDate || !valores.endDate) {
              avisar.error('Todos los campos son obligatorios');
              return;
            }
            guardar.mutate();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={etiqueta}>Código *</label>
              <input
                value={valores.code}
                onChange={(e) => setValores({ ...valores, code: e.target.value })}
                placeholder="2027-1"
                className={campo}
              />
            </div>
            <div>
              <label className={etiqueta}>Estado</label>
              <select
                value={valores.status ?? 'PLANEADO'}
                onChange={(e) => setValores({ ...valores, status: e.target.value as PeriodStatus })}
                className={campo}
              >
                {Object.entries(ESTADOS_PERIODO).map(([valor, texto]) => (
                  <option key={valor} value={valor}>{texto}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={etiqueta}>Nombre *</label>
            <input
              value={valores.name}
              onChange={(e) => setValores({ ...valores, name: e.target.value })}
              placeholder="Primer semestre 2027"
              className={campo}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={etiqueta}>Fecha de inicio *</label>
              <input
                type="date"
                value={valores.startDate}
                onChange={(e) => setValores({ ...valores, startDate: e.target.value })}
                className={campo}
              />
            </div>
            <div>
              <label className={etiqueta}>Fecha de fin *</label>
              <input
                type="date"
                value={valores.endDate}
                onChange={(e) => setValores({ ...valores, endDate: e.target.value })}
                className={campo}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardar.isPending}
              className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg text-sm hover:bg-pn-accent-hover disabled:opacity-60"
            >
              {periodo ? 'Guardar cambios' : 'Crear periodo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
