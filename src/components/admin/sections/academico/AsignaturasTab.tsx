import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, X, UserCog, FolderOpen } from 'lucide-react';
import {
  asignaturasApi,
  editoresApi,
  Asignatura,
  AsignaturaCreateDto,
} from '../../../../api/endpoints/academico';
import { teachersApi } from '../../../../api/endpoints/courses';
import { comoArreglo } from '../../../../utils/respuestaApi';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { MaterialesModal } from './MaterialesModal';
import { mensajeDeError } from './errores';
import { avisar, confirmar } from '../../../ui';

export function AsignaturasTab() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState('');
  const [modal, setModal] = useState<{ abierta: boolean; asignatura: Asignatura | null }>({
    abierta: false,
    asignatura: null,
  });
  const [usoVisible, setUsoVisible] = useState<Asignatura | null>(null);
  const [editoresDe, setEditoresDe] = useState<Asignatura | null>(null);
  const [contenidoDe, setContenidoDe] = useState<Asignatura | null>(null);

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
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  const asignaturas = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pn-muted" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, nombre o área..."
            className="w-full pl-9 pr-3 py-2 border border-pn-line rounded-lg text-sm"
          />
        </div>
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Filtrar por área"
          className="border border-pn-line rounded-lg px-3 py-2 text-sm w-44"
        />
        <button
          onClick={() => setModal({ abierta: true, asignatura: null })}
          className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg hover:bg-pn-accent-hover flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Nueva asignatura
        </button>
      </div>

      {isLoading && <p className="text-pn-muted text-sm">Cargando catálogo...</p>}
      {error != null && <p className="text-pn-danger text-sm">{mensajeDeError(error)}</p>}

      <div className="bg-pn-surface rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pn-line text-left text-pn-muted">
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
              <tr key={asignatura.id} className="border-b border-pn-line hover:bg-pn-surface-2">
                <td className="px-4 py-2 text-pn-muted">{asignatura.code}</td>
                <td className="px-4 py-2 font-medium text-pn-ink">{asignatura.name}</td>
                <td className="px-4 py-2 text-pn-ink-2">{asignatura.area ?? '—'}</td>
                <td className="px-4 py-2">{asignatura.credits ?? '—'}</td>
                <td className="px-4 py-2">{asignatura.hours ?? '—'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setUsoVisible(asignatura)}
                    className="text-pn-accent-text hover:underline"
                    title="Ver en qué programas y grupos se usa"
                  >
                    {asignatura._count?.planEntries ?? 0} pensum(s) · {asignatura._count?.courses ?? 0} grupo(s)
                  </button>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => setContenidoDe(asignatura)}
                    className="p-1.5 text-pn-ok hover:bg-pn-ok-soft rounded"
                    title="Contenido maestro: videos, PDF y enlaces que heredan todos sus grupos"
                  >
                    <FolderOpen size={15} />
                  </button>
                  <button
                    onClick={() => setEditoresDe(asignatura)}
                    className="p-1.5 text-pn-accent-2-text hover:bg-pn-accent-2-soft rounded"
                    title="Docentes que pueden editar su contenido maestro"
                  >
                    <UserCog size={15} />
                  </button>
                  <button
                    onClick={() => setModal({ abierta: true, asignatura })}
                    className="p-1.5 text-pn-accent-text hover:bg-pn-accent-soft rounded"
                    title="Editar"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={async () => {
                      if (await confirmar(`¿Eliminar la asignatura "${asignatura.name}"?`)) {
                        eliminar.mutate(asignatura.id);
                      }
                    }}
                    className="p-1.5 text-pn-danger hover:bg-pn-danger-soft rounded"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && asignaturas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-pn-muted">
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

      {editoresDe && (
        <EditoresModal asignatura={editoresDe} onClose={() => setEditoresDe(null)} />
      )}

      {contenidoDe && (
        <MaterialesModal
          destino={{ tipo: 'asignatura', id: contenidoDe.id, nombre: contenidoDe.name }}
          onClose={() => setContenidoDe(null)}
        />
      )}
    </div>
  );
}

/**
 * Docentes habilitados para editar el contenido maestro de la asignatura.
 * Sin esto el permiso existía en el backend pero no había forma de concederlo,
 * así que ningún docente podía promover contenido a la asignatura.
 */
function EditoresModal({
  asignatura,
  onClose,
}: {
  asignatura: Asignatura;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const [seleccionados, setSeleccionados] = useState<Set<string> | null>(null);

  const { data: editores, isLoading } = useQuery({
    queryKey: ['editores-asignatura', asignatura.id],
    queryFn: () => editoresApi.deAsignatura(asignatura.id),
  });
  const { data: docentesRes } = useQuery({
    queryKey: ['docentes'],
    queryFn: () => teachersApi.getAll(),
  });

  const docentes = comoArreglo((docentesRes as any)?.data?.data ?? (docentesRes as any)?.data);

  // La selección arranca con los editores actuales en cuanto llegan
  const actuales = seleccionados ?? new Set((editores ?? []).map((e) => e.teacherId));

  const guardar = useMutation({
    mutationFn: () => editoresApi.fijar(asignatura.id, [...actuales]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editores-asignatura', asignatura.id] });
      onClose();
    },
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Editores de ${asignatura.name}`}
        tabIndex={-1}
        className="bg-pn-surface rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-pn-ink">Editores del contenido</h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <p className="text-sm text-pn-ink-2 mb-4">
          Quién puede editar y promover el contenido maestro de{' '}
          <strong>{asignatura.name}</strong>. Los demás docentes solo lo ven desde
          sus grupos, en modo lectura.
        </p>

        {isLoading && <p className="text-sm text-pn-muted">Cargando...</p>}

        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {docentes.map((docente: any) => {
            const nombre =
              [docente.user?.firstName, docente.user?.lastName].filter(Boolean).join(' ') ||
              docente.employeeCode;
            return (
              <li key={docente.id}>
                <label className="flex items-center gap-2 text-sm text-pn-ink">
                  <input
                    type="checkbox"
                    checked={actuales.has(docente.id)}
                    onChange={(e) => {
                      const copia = new Set(actuales);
                      if (e.target.checked) copia.add(docente.id);
                      else copia.delete(docente.id);
                      setSeleccionados(copia);
                    }}
                  />
                  {nombre}
                  {docente.user?.email && (
                    <span className="text-xs text-pn-muted">{docente.user.email}</span>
                  )}
                </label>
              </li>
            );
          })}
          {docentes.length === 0 && (
            <li className="text-sm text-pn-muted">No hay docentes registrados.</li>
          )}
        </ul>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => guardar.mutate()}
            disabled={guardar.isPending}
            className="text-sm bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg hover:bg-pn-accent-hover disabled:opacity-60"
          >
            Guardar editores
          </button>
        </div>
      </div>
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
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  const campo = 'w-full p-2 border border-pn-line rounded-lg text-sm';
  const etiqueta = 'block text-sm font-semibold mb-1 text-pn-ink-2';
  const numero = (v: string) => (v === '' ? undefined : Number(v));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={asignatura ? 'Editar asignatura' : 'Nueva asignatura'}
        tabIndex={-1}
        className="bg-pn-surface rounded-lg p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-pn-ink">
            {asignatura ? 'Editar asignatura' : 'Nueva asignatura'}
          </h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valores.code.trim() || !valores.name.trim()) {
              avisar.error('Código y nombre son obligatorios');
              return;
            }
            guardar.mutate();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg text-sm hover:bg-pn-accent-hover disabled:opacity-60"
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
        className="bg-pn-surface rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-pn-ink">{asignatura.name}</h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        {isLoading && <p className="text-sm text-pn-muted">Consultando uso...</p>}

        {data && (
          <>
            <p className="text-sm text-pn-ink-2 mb-3">
              Transversal: usada en <strong>{data.totalProgramas}</strong> programa(s) y
              dictada en <strong>{data.totalGrupos}</strong> grupo(s).
            </p>
            <ul className="space-y-2">
              {data.programas.map((programa) => (
                <li key={programa.id} className="border border-pn-line rounded-lg p-2">
                  <p className="text-sm font-medium text-pn-ink">{programa.name}</p>
                  <p className="text-xs text-pn-muted">
                    {programa.pensums
                      .map((p) => `versión ${p.version} (nivel ${p.level})`)
                      .join(' · ')}
                  </p>
                </li>
              ))}
              {data.programas.length === 0 && (
                <li className="text-sm text-pn-muted">No está en ningún pensum todavía.</li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
