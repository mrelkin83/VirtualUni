import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import {
  inscripcionesApi,
  programasApi,
  estudiantesApi,
  Inscripcion,
  ProgramEnrollmentStatus,
} from '../../../../api/endpoints/academico';
import { ESTADOS_INSCRIPCION, NIVELES, defaultsPorNivel } from './etiquetas';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';
import { formatearFecha } from '../../../../utils/formato';
import { avisar } from '../../../ui';

/**
 * Inscripción de estudiantes a PROGRAMAS. Reemplaza los inputs de texto libre
 * de programa/semestre: la inscripción real es un ProgramEnrollment con
 * programa + versión de pensum (la vigente por defecto) + nivel.
 */
export function InscripcionesProgramaSection() {
  const queryClient = useQueryClient();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroPrograma, setFiltroPrograma] = useState('');

  const { data: programas } = useQuery({
    queryKey: ['programas', '', '', ''],
    queryFn: () => programasApi.getAll({ limit: 100 }),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['inscripciones', filtroPrograma],
    queryFn: () =>
      inscripcionesApi.getAll({ limit: 100, programId: filtroPrograma || undefined }),
  });

  const actualizarEstado = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProgramEnrollmentStatus }) =>
      inscripcionesApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inscripciones'] }),
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  const inscripciones = data?.data ?? [];

  const colorEstado = (estado: ProgramEnrollmentStatus) =>
    estado === 'ACTIVO' ? 'bg-pn-ok-soft text-pn-ok'
    : estado === 'GRADUADO' ? 'bg-pn-accent-soft text-pn-accent-text'
    : estado === 'APLAZADO' ? 'bg-pn-warn-soft text-pn-warn'
    : 'bg-pn-surface-3 text-pn-ink-2';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-pn-ink">Inscripción a programas</h2>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto [&>select]:min-w-0 [&>select]:flex-1">
          <select
            value={filtroPrograma}
            onChange={(e) => setFiltroPrograma(e.target.value)}
            className="border border-pn-line rounded-lg px-3 py-2 text-sm"
            aria-label="Filtrar por programa"
          >
            <option value="">Todos los programas</option>
            {(programas?.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg hover:bg-pn-accent-hover flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Inscribir estudiante
          </button>
        </div>
      </div>

      {isLoading && <p className="text-pn-muted text-sm">Cargando inscripciones...</p>}
      {error != null && <p className="text-pn-danger text-sm">{mensajeDeError(error)}</p>}

      <div className="bg-pn-surface rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pn-line text-left text-pn-muted">
              <th className="px-4 py-3 font-medium">Estudiante</th>
              <th className="px-4 py-3 font-medium">Programa</th>
              <th className="px-4 py-3 font-medium">Pensum</th>
              <th className="px-4 py-3 font-medium">Nivel</th>
              <th className="px-4 py-3 font-medium">Inicio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.map((inscripcion: Inscripcion) => (
              <tr key={inscripcion.id} className="border-b border-pn-line hover:bg-pn-surface-2">
                <td className="px-4 py-2">
                  <p className="font-medium text-pn-ink">
                    {inscripcion.student
                      ? `${inscripcion.student.user.firstName} ${inscripcion.student.user.lastName}`
                      : '—'}
                  </p>
                  <p className="text-xs text-pn-muted">{inscripcion.student?.studentCode}</p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-pn-ink">{inscripcion.program?.name ?? '—'}</p>
                  <p className="text-xs text-pn-muted">
                    {inscripcion.program ? NIVELES[inscripcion.program.educationLevel] : ''}
                  </p>
                </td>
                <td className="px-4 py-2 text-pn-ink-2">
                  {inscripcion.studyPlan ? `v. ${inscripcion.studyPlan.version}` : '—'}
                </td>
                <td className="px-4 py-2">{inscripcion.currentLevel}</td>
                <td className="px-4 py-2 text-pn-ink-2">{formatearFecha(inscripcion.startDate)}</td>
                <td className="px-4 py-2">
                  <select
                    value={inscripcion.status}
                    onChange={(e) =>
                      actualizarEstado.mutate({
                        id: inscripcion.id,
                        status: e.target.value as ProgramEnrollmentStatus,
                      })
                    }
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${colorEstado(inscripcion.status)}`}
                    aria-label="Cambiar estado de la inscripción"
                  >
                    {Object.entries(ESTADOS_INSCRIPCION).map(([valor, texto]) => (
                      <option key={valor} value={valor}>{texto}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!isLoading && inscripciones.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-pn-muted">
                  No hay inscripciones{filtroPrograma ? ' para este programa' : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && <InscribirModal onClose={() => setModalAbierto(false)} />}
    </div>
  );
}

function InscribirModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const [studentId, setStudentId] = useState('');
  const [programId, setProgramId] = useState('');
  const [currentLevel, setCurrentLevel] = useState('1');

  const { data: estudiantes } = useQuery({
    queryKey: ['estudiantes'],
    queryFn: () => estudiantesApi.getAll({ limit: 200 }),
  });
  const { data: programas } = useQuery({
    queryKey: ['programas', '', '', ''],
    queryFn: () => programasApi.getAll({ limit: 100 }),
  });

  const programaElegido = (programas?.data ?? []).find((p) => p.id === programId);
  const etiquetaNivel = programaElegido
    ? defaultsPorNivel(programaElegido.educationLevel).etiquetaNivel
    : 'Nivel';

  const inscribir = useMutation({
    // studyPlanId se omite: el backend usa el pensum VIGENTE del programa
    mutationFn: () =>
      inscripcionesApi.create({
        studentId,
        programId,
        currentLevel: currentLevel ? Number(currentLevel) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] });
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
        aria-label="Inscribir estudiante a un programa"
        tabIndex={-1}
        className="bg-pn-surface rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-bold text-pn-ink">Inscribir estudiante a un programa</h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!studentId || !programId) {
              avisar.error('Estudiante y programa son obligatorios');
              return;
            }
            inscribir.mutate();
          }}
        >
          <div>
            <label className={etiqueta}>Estudiante *</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={campo}>
              <option value="">Seleccionar...</option>
              {(estudiantes?.data ?? []).map((estudiante) => (
                <option key={estudiante.id} value={estudiante.id}>
                  {estudiante.user.firstName} {estudiante.user.lastName} — {estudiante.user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={etiqueta}>Programa *</label>
            <select value={programId} onChange={(e) => setProgramId(e.target.value)} className={campo}>
              <option value="">Seleccionar...</option>
              {(programas?.data ?? []).map((programa) => (
                <option key={programa.id} value={programa.id}>
                  {programa.name} ({NIVELES[programa.educationLevel]})
                </option>
              ))}
            </select>
            <p className="text-xs text-pn-muted mt-1">
              Se usa la versión de pensum vigente del programa.
            </p>
          </div>
          <div>
            <label className={etiqueta}>{etiquetaNivel} actual</label>
            <input
              type="number"
              min={1}
              max={programaElegido?.durationPeriods ?? undefined}
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              className={campo}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={inscribir.isPending}
              className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg text-sm hover:bg-pn-accent-hover disabled:opacity-60"
            >
              Inscribir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
