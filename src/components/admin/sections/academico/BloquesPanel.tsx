import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Plus, Trash2 } from 'lucide-react';
import { bloquesApi, BloqueCreateDto } from '../../../../api/endpoints/homologacion';
import { mensajeDeError } from './errores';

interface AsignaturaDelPensum {
  id: string;
  blockId: string | null;
  level: number;
  subject: { code: string; name: string };
}

/**
 * Bloques de competencia del pensum: agrupan asignaturas y, cuando el
 * estudiante aprueba todas las de un bloque `certifiable`, habilitan el
 * certificado intermedio (lo emite la administración, no se dispara solo).
 *
 * La asignación se hace con casillas en vez de arrastre: funciona con teclado
 * y lector de pantalla, que el arrastre no.
 */
export function BloquesPanel({
  pensumId,
  editable,
  asignaturas,
}: {
  pensumId: string;
  editable: boolean;
  asignaturas: AsignaturaDelPensum[];
}) {
  const queryClient = useQueryClient();
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [enEdicion, setEnEdicion] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bloques-pensum', pensumId],
    queryFn: () => bloquesApi.getByPensum(pensumId),
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['bloques-pensum', pensumId] });
    queryClient.invalidateQueries({ queryKey: ['pensum-detalle'] });
  };

  const crear = useMutation({
    mutationFn: (dto: BloqueCreateDto) => bloquesApi.create(pensumId, dto),
    onSuccess: () => {
      setNuevoNombre('');
      invalidar();
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => bloquesApi.remove(id),
    onSuccess: invalidar,
  });

  const asignar = useMutation({
    mutationFn: ({ id, ids }: { id: string; ids: string[] }) =>
      bloquesApi.setAsignaturas(id, ids),
    onSuccess: () => {
      setEnEdicion(null);
      invalidar();
    },
  });

  const bloques = data ?? [];
  const sinBloque = asignaturas.filter((a) => !a.blockId);

  return (
    <section className="space-y-3 border border-gray-200 rounded-lg p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 font-semibold text-gray-800">
          <Award size={16} className="text-blue-600" />
          Bloques de competencia
        </h4>
        {sinBloque.length > 0 && (
          <span className="text-xs text-gray-500">
            {sinBloque.length} asignatura(s) sin bloque
          </span>
        )}
      </header>

      <p className="text-sm text-gray-600">
        Al aprobar todas las asignaturas de un bloque certificable, el
        estudiante queda elegible para su certificado intermedio.
      </p>

      {isLoading && <p className="text-sm text-gray-500">Cargando bloques…</p>}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {mensajeDeError(error)}
        </div>
      )}

      {bloques.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">
          Este pensum no tiene bloques todavía.
        </p>
      )}

      <ul className="space-y-2">
        {bloques.map((bloque) => (
          <li key={bloque.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-medium text-gray-900">
                  {bloque.name}
                  {!bloque.certifiable && (
                    <span className="ml-2 text-xs text-gray-500">
                      (no certificable)
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {bloque.asignaturas.length} asignaturas · {bloque.totalCredits}{' '}
                  créditos · {bloque.totalHours} h
                  {bloque.competencyStandardCode
                    ? ` · norma ${bloque.competencyStandardCode}`
                    : ''}
                </div>
              </div>
              {editable && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEnEdicion(enEdicion === bloque.id ? null : bloque.id)
                    }
                    className="text-sm text-blue-600 hover:underline"
                    aria-expanded={enEdicion === bloque.id}
                  >
                    {enEdicion === bloque.id ? 'Cerrar' : 'Asignaturas'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar el bloque "${bloque.name}"?`)) {
                        eliminar.mutate(bloque.id);
                      }
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    aria-label={`Eliminar bloque ${bloque.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {bloque.asignaturas.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {bloque.asignaturas.map((a) => (
                  <li
                    key={a.studyPlanSubjectId}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {a.code}
                  </li>
                ))}
              </ul>
            )}

            {enEdicion === bloque.id && editable && (
              <SelectorDeAsignaturas
                asignaturas={asignaturas}
                seleccionadasIniciales={bloque.asignaturas.map(
                  (a) => a.studyPlanSubjectId,
                )}
                guardando={asignar.isPending}
                onGuardar={(ids) => asignar.mutate({ id: bloque.id, ids })}
              />
            )}
          </li>
        ))}
      </ul>

      {editable && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nuevoNombre.trim()) crear.mutate({ name: nuevoNombre.trim() });
          }}
          className="flex flex-wrap gap-2"
        >
          <label htmlFor="nuevo-bloque" className="sr-only">
            Nombre del bloque
          </label>
          <input
            id="nuevo-bloque"
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre del bloque (p. ej. Contable-Financiero)"
            className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!nuevoNombre.trim() || crear.isPending}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={14} />
            {crear.isPending ? 'Creando…' : 'Agregar bloque'}
          </button>
        </form>
      )}

      {(crear.error || eliminar.error || asignar.error) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {mensajeDeError(crear.error ?? eliminar.error ?? asignar.error)}
        </div>
      )}
    </section>
  );
}

function SelectorDeAsignaturas({
  asignaturas,
  seleccionadasIniciales,
  guardando,
  onGuardar,
}: {
  asignaturas: AsignaturaDelPensum[];
  seleccionadasIniciales: string[];
  guardando: boolean;
  onGuardar: (ids: string[]) => void;
}) {
  const [seleccionadas, setSeleccionadas] = useState<string[]>(
    seleccionadasIniciales,
  );

  const alternar = (id: string) =>
    setSeleccionadas((previas) =>
      previas.includes(id) ? previas.filter((x) => x !== id) : [...previas, id],
    );

  return (
    <div className="mt-3 space-y-2">
      <fieldset className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
        <legend className="sr-only">Asignaturas del bloque</legend>
        {asignaturas.map((a) => (
          <label key={a.id} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={seleccionadas.includes(a.id)}
              onChange={() => alternar(a.id)}
            />
            <span>
              {a.subject.code} — {a.subject.name}
              <span className="text-xs text-gray-500"> (nivel {a.level})</span>
            </span>
          </label>
        ))}
      </fieldset>
      <button
        onClick={() => onGuardar(seleccionadas)}
        disabled={guardando}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {guardando ? 'Guardando…' : `Guardar ${seleccionadas.length} asignaturas`}
      </button>
    </div>
  );
}
