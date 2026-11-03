import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import {
  asignaturasApi,
  Asignatura,
  AsignaturaCreateDto,
} from '../../../../api/endpoints/academico';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';

export function AsignaturasTab() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState('');
  const [modal, setModal] = useState<{ abierta: boolean; asignatura: Asignatura | null }>({
    abierta: false,
    asignatura: null,
  });
  const [usoVisible, setUsoVisible] = useState<Asignatura | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['asignaturas', busqueda, area],
    queryFn: () =>
      asignaturasApi.getAll({
        limit: 100,
        search: busqueda || undefined,
        area: area || undefined,
      }),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => asignaturasApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asignaturas'] }),
    onError: (e) => alert(mensajeDeError(e)),
  });

  const asignaturas = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, nombre o área..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Filtrar por área"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-44"
        />
        <button
          onClick={() => setModal({ abierta: true, asignatura: null })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Nueva asignatura
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Cargando catálogo...</p>}
      {error != null && <p className="text-red-600 text-sm">{mensajeDeError(error)}</p>}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Área</th>
              <th className="px-4 py-3 font-medium">Créditos</th>
              <th className="px-4 py-3 font-medium">Horas</th>
              <th className="px-4 py-3 font-medium">Usada en</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.map((asignatura) => (
              <tr key={asignatura.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">{asignatura.code}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{asignatura.name}</td>
                <td className="px-4 py-2 text-gray-600">{asignatura.area ?? '—'}</td>
                <td className="px-4 py-2">{asignatura.credits ?? '—'}</td>
                <td className="px-4 py-2">{asignatura.hours ?? '—'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setUsoVisible(asignatura)}
                    className="text-blue-600 hover:underline"
                    title="Ver en qué programas y grupos se usa"
                  >
                    {asignatura._count?.planEntries ?? 0} pensum(s) · {asignatura._count?.courses ?? 0} grupo(s)
                  </button>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => setModal({ abierta: true, asignatura })}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la asignatura "${asignatura.name}"?`)) {
                        eliminar.mutate(asignatura.id);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && asignaturas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  El catálogo está vacío. Las asignaturas son transversales: se crean una vez y
                  se reutilizan en todos los programas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.abierta && (
        <AsignaturaFormModal
          asignatura={modal.asignatura}
          onClose={() => setModal({ abierta: false, asignatura: null })}
        />
      )}

      {usoVisible && <UsoModal asignatura={usoVisible} onClose={() => setUsoVisible(null)} />}
    </div>
  );
}

function AsignaturaFormModal({
  asignatura,
  onClose,
}: {
  asignatura: Asignatura | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const [valores, setValores] = useState<AsignaturaCreateDto>({
    code: asignatura?.code ?? '',
    name: asignatura?.name ?? '',
    description: asignatura?.description ?? '',
    area: asignatura?.area ?? '',
    credits: asignatura?.credits ?? undefined,
    hours: asignatura?.hours ?? undefined,
    weeklyHours: asignatura?.weeklyHours ?? undefined,
  });

  const guardar = useMutation({
    mutationFn: () => {
      const datos = {
        ...valores,
        description: valores.description || undefined,
        area: valores.area || undefined,
      };
      return asignatura
        ? asignaturasApi.update(asignatura.id, datos)
        : asignaturasApi.create(datos);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaturas'] });
      onClose();
    },
    onError: (e) => alert(mensajeDeError(e)),
  });

  const campo = 'w-full p-2 border border-gray-300 rounded-lg text-sm';
  const etiqueta = 'block text-sm font-semibold mb-1 text-gray-700';
  const numero = (v: string) => (v === '' ? undefined : Number(v));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={asignatura ? 'Editar asignatura' : 'Nueva asignatura'}
        tabIndex={-1}
        className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {asignatura ? 'Editar asignatura' : 'Nueva asignatura'}
          </h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valores.code.trim() || !valores.name.trim()) {
              alert('Código y nombre son obligatorios');
              return;
            }
            guardar.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={etiqueta}>Código *</label>
              <input value={valores.code} onChange={(e) => setValores({ ...valores, code: e.target.value })} className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Área</label>
              <input value={valores.area ?? ''} onChange={(e) => setValores({ ...valores, area: e.target.value })} className={campo} />
            </div>
          </div>
          <div>
            <label className={etiqueta}>Nombre *</label>
            <input value={valores.name} onChange={(e) => setValores({ ...valores, name: e.target.value })} className={campo} />
          </div>
          <div>
            <label className={etiqueta}>Descripción</label>
            <textarea
              value={valores.description ?? ''}
              onChange={(e) => setValores({ ...valores, description: e.target.value })}
              rows={2}
              className={campo}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={etiqueta}>Créditos</label>
              <input type="number" min={0} value={valores.credits ?? ''} onChange={(e) => setValores({ ...valores, credits: numero(e.target.value) })} className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Horas totales</label>
              <input type="number" min={0} value={valores.hours ?? ''} onChange={(e) => setValores({ ...valores, hours: numero(e.target.value) })} className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Horas semanales</label>
              <input type="number" min={0} value={valores.weeklyHours ?? ''} onChange={(e) => setValores({ ...valores, weeklyHours: numero(e.target.value) })} className={campo} />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardar.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {asignatura ? 'Guardar cambios' : 'Crear asignatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsoModal({ asignatura, onClose }: { asignatura: Asignatura; onClose: () => void }) {
  const dialogRef = useModalA11y(true, onClose);
  const { data, isLoading } = useQuery({
    queryKey: ['asignatura-uso', asignatura.id],
    queryFn: () => asignaturasApi.usage(asignatura.id),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Uso de ${asignatura.name}`}
        tabIndex={-1}
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-900">{asignatura.name}</h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        {isLoading && <p className="text-sm text-gray-500">Consultando uso...</p>}

        {data && (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Transversal: usada en <strong>{data.totalProgramas}</strong> programa(s) y
              dictada en <strong>{data.totalGrupos}</strong> grupo(s).
            </p>
            <ul className="space-y-2">
              {data.programas.map((programa) => (
                <li key={programa.id} className="border border-gray-100 rounded-lg p-2">
                  <p className="text-sm font-medium text-gray-900">{programa.name}</p>
                  <p className="text-xs text-gray-500">
                    {programa.pensums
                      .map((p) => `versión ${p.version} (nivel ${p.level})`)
                      .join(' · ')}
                  </p>
                </li>
              ))}
              {data.programas.length === 0 && (
                <li className="text-sm text-gray-500">No está en ningún pensum todavía.</li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
