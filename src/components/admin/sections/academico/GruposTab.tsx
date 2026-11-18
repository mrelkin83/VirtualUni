import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X, Search, ClipboardCheck, FolderOpen } from 'lucide-react';
import { CierreDeNotasModal } from './CierreDeNotasModal';
import { MaterialesModal } from './MaterialesModal';
import { coursesAdminApi, teachersApi } from '../../../../api/endpoints/courses';
import {
  asignaturasApi,
  periodosApi,
  Modality,
} from '../../../../api/endpoints/academico';
import { MODALIDADES } from './etiquetas';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { comoArreglo } from '../../../../utils/respuestaApi';
import { mensajeDeError } from './errores';

interface GrupoFila {
  id: string;
  code: string;
  name: string;
  status: string;
  semester?: string | null;
  groupCode?: string | null;
  capacity?: number | null;
  subject?: { id: string; code: string; name: string } | null;
  academicPeriod?: { id: string; code: string } | null;
  teacher?: { user?: { firstName?: string; lastName?: string } } | null;
  _count?: { enrollments: number };
}

/**
 * Grupos: una asignatura dictada en un periodo por un docente (la antigua
 * pestaña "Cursos"). Crear un grupo = Periodo + Asignatura + Docente + código
 * de grupo + cupo; el nombre lo arma el backend como
 * "Asignatura – Grupo A – 2027-1".
 */
export function GruposTab() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cierreDeNotas, setCierreDeNotas] = useState<string | null>(null);
  const [materialesDe, setMaterialesDe] = useState<GrupoFila | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['grupos', busqueda],
    queryFn: () => coursesAdminApi.getAll({ limit: 100, search: busqueda || undefined }),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => coursesAdminApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grupos'] }),
    onError: (e) => alert(mensajeDeError(e)),
  });

  const grupos: GrupoFila[] = comoArreglo((data as any)?.data?.data ?? (data as any)?.data);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar grupo por código o nombre..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Crear grupo
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Cargando grupos...</p>}
      {error != null && <p className="text-red-600 text-sm">{mensajeDeError(error)}</p>}

      <div className="grid grid-cols-1 gap-3">
        {grupos.map((grupo) => {
          const docente = [grupo.teacher?.user?.firstName, grupo.teacher?.user?.lastName]
            .filter(Boolean)
            .join(' ');
          return (
            <div key={grupo.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{grupo.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        grupo.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {grupo.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    {!grupo.subject && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                        Sin asignatura de catálogo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {grupo.code}
                    {docente ? ` · Docente: ${docente}` : ''}
                    {grupo.semester ? ` · Periodo: ${grupo.semester}` : ''}
                    {` · ${grupo._count?.enrollments ?? 0}${grupo.capacity ? `/${grupo.capacity}` : ''} estudiantes`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setMaterialesDe(grupo)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Materiales del grupo: videos, PDF, Word, Excel, guías y enlaces"
                    aria-label={`Materiales de ${grupo.name}`}
                  >
                    <FolderOpen size={17} />
                  </button>
                  {/* El cierre de notas necesita la asignatura del catálogo:
                      el historial académico se guarda por Subject. */}
                  {grupo.subject && (
                    <button
                      onClick={() => setCierreDeNotas(grupo.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Cerrar o reabrir notas del grupo"
                      aria-label={`Cierre de notas de ${grupo.name}`}
                    >
                      <ClipboardCheck size={17} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el grupo "${grupo.name}"?`)) {
                        eliminar.mutate(grupo.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar grupo"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!isLoading && grupos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="font-medium">No hay grupos</p>
            <p className="text-sm">Cree uno eligiendo periodo, asignatura y docente.</p>
          </div>
        )}
      </div>

      {modalAbierto && <CrearGrupoModal onClose={() => setModalAbierto(false)} />}

      {cierreDeNotas && (
        <CierreDeNotasModal
          courseId={cierreDeNotas}
          nombreGrupo={
            grupos.find((g) => g.id === cierreDeNotas)?.name ?? 'Grupo'
          }
          onCerrar={() => setCierreDeNotas(null)}
        />
      )}

      {materialesDe && (
        <MaterialesModal
          destino={{ tipo: 'grupo', id: materialesDe.id, nombre: materialesDe.name }}
          onClose={() => setMaterialesDe(null)}
        />
      )}
    </div>
  );
}

function CrearGrupoModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const [subjectId, setSubjectId] = useState('');
  const [academicPeriodId, setAcademicPeriodId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [groupCode, setGroupCode] = useState('A');
  const [capacity, setCapacity] = useState('30');
  const [modality, setModality] = useState<Modality>('VIRTUAL');

  const { data: asignaturas } = useQuery({
    queryKey: ['asignaturas', '', ''],
    queryFn: () => asignaturasApi.getAll({ limit: 100 }),
  });
  const { data: periodos } = useQuery({
    queryKey: ['periodos'],
    queryFn: () => periodosApi.getAll({ limit: 100 }),
  });
  const { data: docentes } = useQuery({
    queryKey: ['docentes'],
    queryFn: () => teachersApi.getAll(),
  });

  const crear = useMutation({
    mutationFn: () =>
      coursesAdminApi.create({
        teacherId,
        subjectId,
        academicPeriodId,
        groupCode: groupCode.trim() || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        modality,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
      onClose();
    },
    onError: (e) => alert(mensajeDeError(e)),
  });

  const listaDocentes = comoArreglo((docentes as any)?.data?.data ?? (docentes as any)?.data);
  const campo = 'w-full p-2 border border-gray-300 rounded-lg text-sm';
  const etiqueta = 'block text-sm font-semibold mb-1 text-gray-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Crear grupo"
        tabIndex={-1}
        className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Crear grupo</h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!subjectId || !academicPeriodId || !teacherId) {
              alert('Asignatura, periodo y docente son obligatorios');
              return;
            }
            crear.mutate();
          }}
        >
          <div>
            <label className={etiqueta}>Periodo académico *</label>
            <select value={academicPeriodId} onChange={(e) => setAcademicPeriodId(e.target.value)} className={campo}>
              <option value="">Seleccionar...</option>
              {(periodos?.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={etiqueta}>Asignatura *</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={campo}>
              <option value="">Seleccionar...</option>
              {(asignaturas?.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={etiqueta}>Docente *</label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={campo}>
              <option value="">Seleccionar...</option>
              {listaDocentes.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {[d.user?.firstName, d.user?.lastName].filter(Boolean).join(' ') || d.employeeCode}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={etiqueta}>Código de grupo</label>
              <input value={groupCode} onChange={(e) => setGroupCode(e.target.value)} placeholder="A" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Cupo</label>
              <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Modalidad</label>
              <select value={modality} onChange={(e) => setModality(e.target.value as Modality)} className={campo}>
                {Object.entries(MODALIDADES).map(([valor, texto]) => (
                  <option key={valor} value={valor}>{texto}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            El nombre del grupo se genera solo: “Asignatura – Grupo {groupCode || 'A'} – periodo”.
          </p>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={crear.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              Crear grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
