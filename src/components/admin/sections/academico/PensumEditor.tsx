import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Plus, Trash2, Link2, Copy, CheckCircle2, X, Search, AlertTriangle,
} from 'lucide-react';
import { BloquesPanel } from './BloquesPanel';
import {
  programasApi,
  pensumApi,
  asignaturasApi,
  Programa,
  Pensum,
  FilaPensum,
  AsignaturaCreateDto,
  SubjectType,
} from '../../../../api/endpoints/academico';
import {
  ESTADOS_PENSUM,
  TIPOS_ASIGNATURA,
  colorDeEstadoPensum,
  etiquetaNivelDePrograma,
} from './etiquetas';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';
import { avisar, confirmar } from '../../../ui';

/**
 * Editor de pensum: columnas por nivel, asignaturas del catálogo compartido,
 * versiones (duplicar/activar) y prerrequisitos por tarjeta.
 */
export function PensumEditor({
  programa,
  onVolver,
}: {
  programa: Programa;
  onVolver: () => void;
}) {
  const queryClient = useQueryClient();
  const [pensumId, setPensumId] = useState<string | null>(null);
  const [agregarEnNivel, setAgregarEnNivel] = useState<number | null>(null);
  const [filaPrerrequisitos, setFilaPrerrequisitos] = useState<FilaPensum | null>(null);
  const [versionNueva, setVersionNueva] = useState('');
  const [accionVersion, setAccionVersion] = useState<'duplicar' | 'crear' | null>(null);

  const { data: pensums } = useQuery({
    queryKey: ['pensums', programa.id],
    queryFn: () => programasApi.pensums(programa.id),
  });

  // Por defecto la versión VIGENTE; si no hay, la más reciente.
  useEffect(() => {
    if (!pensumId && pensums?.length) {
      const vigente = pensums.find((p) => p.status === 'VIGENTE');
      setPensumId((vigente ?? pensums[0]).id);
    }
  }, [pensums, pensumId]);

  const pensumActual: Pensum | undefined = pensums?.find((p) => p.id === pensumId);

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['pensum-detalle', pensumId],
    queryFn: () => pensumApi.detalle(pensumId!),
    enabled: !!pensumId,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['pensums', programa.id] });
    queryClient.invalidateQueries({ queryKey: ['pensum-detalle'] });
  };

  const activar = useMutation({
    mutationFn: () => pensumApi.activate(pensumId!),
    onSuccess: invalidar,
    onError: (e) => avisar.error(mensajeDeError(e)),
  });
  const duplicar = useMutation({
    mutationFn: (version: string) => pensumApi.duplicate(pensumId!, version),
    onSuccess: (nuevo) => {
      invalidar();
      setAccionVersion(null);
      setVersionNueva('');
      if (nuevo?.id) setPensumId(nuevo.id);
    },
    onError: (e) => avisar.error(mensajeDeError(e)),
  });
  const crearVersion = useMutation({
    mutationFn: (version: string) => programasApi.crearPensum(programa.id, { version }),
    onSuccess: (nuevo) => {
      invalidar();
      setAccionVersion(null);
      setVersionNueva('');
      if (nuevo?.id) setPensumId(nuevo.id);
    },
    onError: (e) => avisar.error(mensajeDeError(e)),
  });
  const retirarFila = useMutation({
    mutationFn: (filaId: string) => pensumApi.retirarFila(filaId),
    onSuccess: invalidar,
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  // Regla del backend: VIGENTE con inscritos y CERRADO no se editan en sitio
  const inscritos = pensumActual?._count?.programEnrollments ?? 0;
  const editable =
    !!pensumActual &&
    pensumActual.status !== 'CERRADO' &&
    !(pensumActual.status === 'VIGENTE' && inscritos > 0);

  const etiquetaNivel = etiquetaNivelDePrograma(programa.periodStructure);

  // Columnas: hasta la duración del programa, o el mayor nivel con filas
  const niveles = useMemo(() => {
    const conFilas = detalle?.niveles ?? [];
    const maxConFilas = conFilas.reduce((m, n) => Math.max(m, n.level), 0);
    const total = Math.max(programa.durationPeriods ?? 0, maxConFilas, 1);
    return Array.from({ length: total }, (_, i) => {
      const nivel = i + 1;
      return (
        conFilas.find((n) => n.level === nivel) ?? {
          level: nivel,
          subjects: [] as FilaPensum[],
          totalCredits: 0,
          totalHours: 0,
        }
      );
    });
  }, [detalle, programa.durationPeriods]);

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onVolver}
          className="flex items-center gap-1 text-sm text-pn-ink-2 hover:text-pn-ink p-2 -m-2 rounded"
        >
          <ArrowLeft size={16} /> Programas
        </button>
        <h3 className="text-lg font-bold text-pn-ink">{programa.name} — Pensum</h3>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-pn-ink-2" htmlFor="selector-version">Versión</label>
          <select
            id="selector-version"
            value={pensumId ?? ''}
            onChange={(e) => setPensumId(e.target.value)}
            className="border border-pn-line rounded-lg px-2 py-1.5 text-sm"
          >
            {(pensums ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.version} — {ESTADOS_PENSUM[p.status]}
              </option>
            ))}
          </select>

          {pensumActual && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorDeEstadoPensum(pensumActual.status)}`}>
              {ESTADOS_PENSUM[pensumActual.status]}
            </span>
          )}

          {pensumActual && pensumActual.status !== 'VIGENTE' && (
            <button
              onClick={() => activar.mutate()}
              className="flex items-center gap-1 text-sm bg-pn-ok text-pn-surface px-3 py-1.5 rounded-lg hover:bg-pn-ok"
            >
              <CheckCircle2 size={15} /> Activar
            </button>
          )}
          <button
            onClick={() => { setAccionVersion('duplicar'); setVersionNueva(''); }}
            disabled={!pensumActual}
            className="flex items-center gap-1 text-sm border border-pn-line px-3 py-1.5 rounded-lg hover:bg-pn-surface-2"
          >
            <Copy size={15} /> Duplicar como nueva versión
          </button>
          <button
            onClick={() => { setAccionVersion('crear'); setVersionNueva(''); }}
            className="flex items-center gap-1 text-sm border border-pn-line px-3 py-1.5 rounded-lg hover:bg-pn-surface-2"
          >
            <Plus size={15} /> Nueva versión vacía
          </button>
        </div>
      </div>

      {accionVersion && (
        <form
          className="flex items-center gap-2 bg-pn-accent-soft border border-pn-accent-line rounded-lg p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!versionNueva.trim()) return;
            (accionVersion === 'duplicar' ? duplicar : crearVersion).mutate(versionNueva.trim());
          }}
        >
          <span className="text-sm text-pn-accent-text">
            {accionVersion === 'duplicar'
              ? 'Nombre de la versión copia (ej. v2, 2027-1):'
              : 'Nombre de la versión nueva:'}
          </span>
          <input
            autoFocus
            value={versionNueva}
            onChange={(e) => setVersionNueva(e.target.value)}
            className="border border-pn-line rounded px-2 py-1 text-sm"
            placeholder="v2"
          />
          <button type="submit" className="text-sm bg-pn-accent text-pn-accent-ink px-3 py-1 rounded hover:bg-pn-accent-hover">
            Crear
          </button>
          <button type="button" onClick={() => setAccionVersion(null)} className="text-sm text-pn-ink-2">
            Cancelar
          </button>
        </form>
      )}

      {pensumActual && !editable && (
        <p className="text-sm bg-pn-warn-soft border border-pn-warn text-pn-warn rounded-lg p-3">
          {pensumActual.status === 'CERRADO'
            ? 'Esta versión está cerrada (histórica): es de solo lectura.'
            : `Esta versión está vigente y tiene ${inscritos} estudiante(s): duplíquela como nueva versión para modificarla.`}
        </p>
      )}

      {/* Totales del programa. Las horas se derivan de los créditos cuando la
          asignatura no las trae (créditos × hoursPerCredit del programa). */}
      {detalle && (
        <div className="flex flex-wrap gap-4 text-sm text-pn-ink-2">
          <span>
            <strong>{detalle.totalCredits}</strong> créditos
            {programa.totalCredits ? ` de ${programa.totalCredits} previstos` : ''}
          </span>
          <span>
            <strong>{detalle.totalHours}</strong> horas
            {programa.totalHours ? ` de ${programa.totalHours} previstas` : ''}
          </span>
          {detalle.totalPracticalHours != null && (
            <span>
              <strong>{detalle.totalPracticalHours}</strong> h prácticas ·{' '}
              <strong>{detalle.totalTheoreticalHours ?? 0}</strong> h teóricas
            </span>
          )}
        </div>
      )}

      {/* Advertencias normativas: avisan, no bloquean */}
      {detalle?.advertencias && detalle.advertencias.length > 0 && (
        <ul className="space-y-2">
          {detalle.advertencias.map((advertencia) => (
            <li
              key={advertencia.codigo}
              className="flex items-start gap-2 p-3 bg-pn-warn-soft border border-pn-warn rounded-lg text-sm text-pn-warn"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {advertencia.mensaje}
            </li>
          ))}
        </ul>
      )}

      {/* Bloques de competencia certificables */}
      {detalle && pensumId && (
        <BloquesPanel
          pensumId={pensumId}
          editable={editable}
          asignaturas={detalle.niveles.flatMap((nivel) =>
            nivel.subjects.map((fila) => ({
              id: fila.id,
              blockId: fila.blockId ?? null,
              level: fila.level,
              subject: { code: fila.subject.code, name: fila.subject.name },
            })),
          )}
        />
      )}

      {isLoading && <p className="text-sm text-pn-muted">Cargando pensum...</p>}

      {/* Columnas por nivel */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {niveles.map((nivel) => (
          <div key={nivel.level} className="min-w-64 w-64 shrink-0 bg-pn-surface-2 rounded-lg border border-pn-line">
            <div className="px-3 py-2 border-b border-pn-line flex items-center justify-between">
              <h4 className="font-semibold text-sm text-pn-ink">
                {etiquetaNivel} {nivel.level}
              </h4>
              <span className="text-xs text-pn-muted">
                {nivel.totalCredits > 0 ? `${nivel.totalCredits} cr` : ''}
                {nivel.totalCredits > 0 && nivel.totalHours > 0 ? ' · ' : ''}
                {nivel.totalHours > 0 ? `${nivel.totalHours} h` : ''}
              </span>
            </div>

            <div className="p-2 space-y-2">
              {nivel.subjects.map((fila) => (
                <TarjetaAsignatura
                  key={fila.id}
                  fila={fila}
                  editable={editable}
                  onRetirar={async () => {
                    if (await confirmar(`¿Retirar ${fila.subject.name} del pensum?`)) {
                      retirarFila.mutate(fila.id);
                    }
                  }}
                  onPrerrequisitos={() => setFilaPrerrequisitos(fila)}
                />
              ))}

              {editable && (
                <button
                  onClick={() => setAgregarEnNivel(nivel.level)}
                  className="w-full border-2 border-dashed border-pn-line rounded-lg py-2 text-sm text-pn-muted hover:border-pn-accent-line hover:text-pn-accent-text flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Agregar asignatura
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {agregarEnNivel !== null && pensumId && (
        <AgregarAsignaturaModal
          pensumId={pensumId}
          nivel={agregarEnNivel}
          etiquetaNivel={etiquetaNivel}
          onClose={() => setAgregarEnNivel(null)}
          onAgregada={invalidar}
        />
      )}

      {filaPrerrequisitos && detalle && (
        <PrerrequisitosModal
          fila={filaPrerrequisitos}
          candidatas={detalle.niveles
            .filter((n) => n.level < filaPrerrequisitos.level)
            .flatMap((n) => n.subjects)}
          editable={editable}
          onClose={() => setFilaPrerrequisitos(null)}
          onGuardado={invalidar}
        />
      )}
    </div>
  );
}

function TarjetaAsignatura({
  fila,
  editable,
  onRetirar,
  onPrerrequisitos,
}: {
  fila: FilaPensum;
  editable: boolean;
  onRetirar: () => void;
  onPrerrequisitos: () => void;
}) {
  const creditos = fila.credits ?? fila.subject.credits;
  const horas = fila.hours ?? fila.subject.hours;
  // planEntries cuenta en cuántos pensums aparece la Subject: >1 = compartida
  const entradas = fila.subject._count?.planEntries ?? 0;
  const prerrequisitos = fila.prerequisites ?? [];

  return (
    <div className="bg-pn-surface rounded-lg border border-pn-line p-3 shadow-sm">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-xs text-pn-muted">{fila.subject.code}</p>
          <p className="font-medium text-sm text-pn-ink">{fila.subject.name}</p>
        </div>
        {editable && (
          <div className="flex shrink-0">
            <button
              onClick={onPrerrequisitos}
              title="Prerrequisitos"
              className="p-2 text-pn-accent-2-text hover:bg-pn-accent-2-soft rounded"
            >
              <Link2 size={14} />
            </button>
            <button
              onClick={onRetirar}
              title="Retirar del pensum"
              className="p-2 text-pn-danger hover:bg-pn-danger-soft rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        <span className="px-1.5 py-0.5 rounded text-[11px] bg-pn-surface-3 text-pn-ink-2">
          {TIPOS_ASIGNATURA[fila.subjectType]}
        </span>
        {creditos != null && (
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-pn-accent-soft text-pn-accent-text">
            {creditos} cr
          </span>
        )}
        {horas != null && (
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-pn-accent-soft text-pn-accent-text">
            {horas} h
          </span>
        )}
        {entradas > 1 && (
          <span
            className="px-1.5 py-0.5 rounded text-[11px] bg-pn-accent-2-soft text-pn-accent-2-text"
            title={`La asignatura aparece en ${entradas} pensums (contenido compartido)`}
          >
            Transversal · {entradas}
          </span>
        )}
      </div>

      {prerrequisitos.length > 0 && (
        <p className="text-[11px] text-pn-muted mt-2">
          Requiere: {prerrequisitos.map((p) => p.required.subject.code).join(', ')}
        </p>
      )}
    </div>
  );
}

function AgregarAsignaturaModal({
  pensumId,
  nivel,
  etiquetaNivel,
  onClose,
  onAgregada,
}: {
  pensumId: string;
  nivel: number;
  etiquetaNivel: string;
  onClose: () => void;
  onAgregada: () => void;
}) {
  const dialogRef = useModalA11y(true, onClose);
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState<SubjectType>('OBLIGATORIA');
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [nueva, setNueva] = useState<AsignaturaCreateDto>({ code: '', name: '' });

  const { data } = useQuery({
    queryKey: ['asignaturas-buscar', busqueda],
    queryFn: () => asignaturasApi.getAll({ limit: 20, search: busqueda || undefined }),
  });

  const agregar = useMutation({
    mutationFn: (subjectId: string) =>
      pensumApi.agregarFila(pensumId, { subjectId, level: nivel, subjectType: tipo }),
    onSuccess: () => { onAgregada(); onClose(); },
    onError: (e) => avisar.ok(mensajeDeError(e)),
  });

  const crearYAgregar = useMutation({
    mutationFn: async () => {
      const creada = await asignaturasApi.create({
        ...nueva,
        area: nueva.area || undefined,
        credits: nueva.credits || undefined,
        hours: nueva.hours || undefined,
      });
      return pensumApi.agregarFila(pensumId, {
        subjectId: creada.id,
        level: nivel,
        subjectType: tipo,
      });
    },
    onSuccess: () => { onAgregada(); onClose(); },
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  const campo = 'w-full p-2 border border-pn-line rounded-lg text-sm';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Agregar asignatura al pensum"
        tabIndex={-1}
        className="bg-pn-surface rounded-lg p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-pn-ink">
            Agregar asignatura — {etiquetaNivel} {nivel}
          </h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-pn-ink-2">Tipo en el pensum</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as SubjectType)} className={campo}>
            {Object.entries(TIPOS_ASIGNATURA).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </div>

        {!creandoNueva ? (
          <>
            <div className="relative mb-2">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-pn-muted" />
              <input
                autoFocus
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en el catálogo..."
                className="w-full pl-8 pr-3 py-2 border border-pn-line rounded-lg text-sm"
              />
            </div>

            <ul className="divide-y divide-pn-line max-h-64 overflow-y-auto border border-pn-line rounded-lg">
              {(data?.data ?? []).map((asignatura) => (
                <li key={asignatura.id}>
                  <button
                    onClick={() => agregar.mutate(asignatura.id)}
                    disabled={agregar.isPending}
                    className="w-full text-left px-3 py-2 hover:bg-pn-accent-soft"
                  >
                    <span className="text-xs text-pn-muted mr-2">{asignatura.code}</span>
                    <span className="text-sm text-pn-ink">{asignatura.name}</span>
                    {(asignatura._count?.planEntries ?? 0) > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] bg-pn-accent-2-soft text-pn-accent-2-text">
                        En {asignatura._count!.planEntries} pensum(s)
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {(data?.data ?? []).length === 0 && (
                <li className="px-3 py-4 text-sm text-pn-muted text-center">Sin resultados</li>
              )}
            </ul>

            <button
              onClick={() => setCreandoNueva(true)}
              className="mt-3 text-sm text-pn-accent-text hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Crear una asignatura nueva
            </button>
          </>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nueva.code.trim() || !nueva.name.trim()) return;
              crearYAgregar.mutate();
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1 text-pn-ink-2">Código *</label>
                <input
                  value={nueva.code}
                  onChange={(e) => setNueva({ ...nueva, code: e.target.value })}
                  placeholder="MAT-BAS"
                  className={campo}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-pn-ink-2">Área</label>
                <input
                  value={nueva.area ?? ''}
                  onChange={(e) => setNueva({ ...nueva, area: e.target.value })}
                  placeholder="Matemáticas"
                  className={campo}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-pn-ink-2">Nombre *</label>
              <input
                value={nueva.name}
                onChange={(e) => setNueva({ ...nueva, name: e.target.value })}
                placeholder="Matemáticas Básicas"
                className={campo}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1 text-pn-ink-2">Créditos</label>
                <input
                  type="number"
                  min={0}
                  value={nueva.credits ?? ''}
                  onChange={(e) =>
                    setNueva({ ...nueva, credits: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className={campo}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-pn-ink-2">Horas</label>
                <input
                  type="number"
                  min={0}
                  value={nueva.hours ?? ''}
                  onChange={(e) =>
                    setNueva({ ...nueva, hours: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className={campo}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setCreandoNueva(false)} className="text-sm text-pn-ink-2">
                ← Volver al catálogo
              </button>
              <button
                type="submit"
                disabled={crearYAgregar.isPending}
                className="text-sm bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg hover:bg-pn-accent-hover disabled:opacity-60"
              >
                Crear y agregar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PrerrequisitosModal({
  fila,
  candidatas,
  editable,
  onClose,
  onGuardado,
}: {
  fila: FilaPensum;
  candidatas: FilaPensum[];
  editable: boolean;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const dialogRef = useModalA11y(true, onClose);
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(
    new Set((fila.prerequisites ?? []).map((p) => p.required.id)),
  );

  const guardar = useMutation({
    mutationFn: () => pensumApi.fijarPrerrequisitos(fila.id, [...seleccionadas]),
    onSuccess: () => { onGuardado(); onClose(); },
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Prerrequisitos de ${fila.subject.name}`}
        tabIndex={-1}
        className="bg-pn-surface rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-pn-ink">Prerrequisitos</h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <p className="text-sm text-pn-ink-2 mb-4">
          Para cursar <strong>{fila.subject.name}</strong> hay que aprobar antes (solo
          asignaturas de niveles anteriores):
        </p>

        {candidatas.length === 0 ? (
          <p className="text-sm text-pn-muted">No hay asignaturas en niveles anteriores.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {candidatas.map((candidata) => (
              <li key={candidata.id}>
                <label className="flex items-center gap-2 text-sm text-pn-ink">
                  <input
                    type="checkbox"
                    disabled={!editable}
                    checked={seleccionadas.has(candidata.id)}
                    onChange={(e) => {
                      const copia = new Set(seleccionadas);
                      if (e.target.checked) copia.add(candidata.id);
                      else copia.delete(candidata.id);
                      setSeleccionadas(copia);
                    }}
                  />
                  <span className="text-xs text-pn-muted">{candidata.subject.code}</span>
                  {candidata.subject.name}
                  <span className="text-xs text-pn-muted">· nivel {candidata.level}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {editable && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => guardar.mutate()}
              disabled={guardar.isPending}
              className="text-sm bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg hover:bg-pn-accent-hover disabled:opacity-60"
            >
              Guardar prerrequisitos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
