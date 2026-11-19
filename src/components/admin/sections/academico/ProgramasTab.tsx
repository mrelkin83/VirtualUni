import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Network, Search, Globe } from 'lucide-react';
import {
  programasApi,
  Programa,
  EducationLevel,
  ProgramStatus,
} from '../../../../api/endpoints/academico';
import {
  NIVELES,
  ESTADOS_PROGRAMA,
  MODALIDADES,
  PERIODICIDADES,
  UNIDADES,
  colorDeNivel,
  colorDeEstadoPrograma,
} from './etiquetas';
import { ProgramaFormModal } from './ProgramaFormModal';
import { PublicacionProgramaModal } from './PublicacionProgramaModal';
import { PensumEditor } from './PensumEditor';
import { mensajeDeError } from './errores';

export function ProgramasTab() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [nivel, setNivel] = useState<EducationLevel | ''>('');
  const [estado, setEstado] = useState<ProgramStatus | ''>('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [programaEnEdicion, setProgramaEnEdicion] = useState<Programa | null>(null);
  const [programaEnPensum, setProgramaEnPensum] = useState<Programa | null>(null);
  const [programaEnPublicacion, setProgramaEnPublicacion] = useState<Programa | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['programas', busqueda, nivel, estado],
    queryFn: () =>
      programasApi.getAll({
        limit: 100,
        search: busqueda || undefined,
        educationLevel: nivel || undefined,
        status: estado || undefined,
      }),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => programasApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programas'] }),
    onError: (err) => alert(mensajeDeError(err)),
  });

  if (programaEnPensum) {
    return (
      <PensumEditor
        programa={programaEnPensum}
        onVolver={() => setProgramaEnPensum(null)}
      />
    );
  }

  const programas = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, nombre o título..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value as EducationLevel | '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          aria-label="Filtrar por nivel"
        >
          <option value="">Todos los niveles</option>
          {Object.entries(NIVELES).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>{etiqueta}</option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as ProgramStatus | '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_PROGRAMA).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>{etiqueta}</option>
          ))}
        </select>
        <button
          onClick={() => { setProgramaEnEdicion(null); setModalAbierto(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Nuevo programa
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Cargando programas...</p>}
      {error != null && <p className="text-red-600 text-sm">{mensajeDeError(error)}</p>}

      {!isLoading && programas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="font-medium">Aún no hay programas</p>
          <p className="text-sm">Cree el primero: Tecnólogo, Técnico laboral, Bachillerato, Diplomado…</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {programas.map((programa) => (
          <div key={programa.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900 truncate">{programa.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorDeNivel(programa.educationLevel)}`}>
                    {NIVELES[programa.educationLevel]}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorDeEstadoPrograma(programa.status)}`}>
                    {ESTADOS_PROGRAMA[programa.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {programa.code} · {MODALIDADES[programa.modality]} · {PERIODICIDADES[programa.periodStructure]} · {UNIDADES[programa.academicUnit]}
                  {programa.durationPeriods ? ` · ${programa.durationPeriods} periodos` : ''}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {programa._count?.studyPlans ?? 0} versión(es) de pensum · {programa._count?.programEnrollments ?? 0} estudiante(s)
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setProgramaEnPensum(programa)}
                  title="Editor de pensum"
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Network size={17} />
                </button>
                <button
                  onClick={() => setProgramaEnPublicacion(programa)}
                  title="Publicación en el sitio web"
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Globe size={17} />
                </button>
                <button
                  onClick={() => { setProgramaEnEdicion(programa); setModalAbierto(true); }}
                  title="Editar programa"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={17} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el programa "${programa.name}"?`)) {
                      eliminar.mutate(programa.id);
                    }
                  }}
                  title="Eliminar programa"
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <ProgramaFormModal
          programa={programaEnEdicion}
          onClose={() => setModalAbierto(false)}
        />
      )}

      {programaEnPublicacion && (
        <PublicacionProgramaModal
          programa={programaEnPublicacion}
          onClose={() => setProgramaEnPublicacion(null)}
        />
      )}
    </div>
  );
}
