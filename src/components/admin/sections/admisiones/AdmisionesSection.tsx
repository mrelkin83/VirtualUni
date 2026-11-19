import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Banknote, BarChart3, CalendarRange, CheckCheck, CheckCircle2, Download, Eye,
  FileText, Inbox, MailWarning, Plus, UserCheck, UserX, X, XCircle,
} from 'lucide-react';
import {
  admisionesApi,
  ConvocatoriaDetallada,
  SolicitudFila,
} from '../../../../api/endpoints/admisiones';
import { programasApi, periodosApi } from '../../../../api/endpoints/academico';
import { comoArreglo } from '../../../../utils/respuestaApi';
import { generateAdmisionesExcel } from '../../../../utils/excelExport';
import { apiClient } from '../../../../api/client';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from '../academico/errores';

const ETIQUETA: Record<string, [string, string]> = {
  INTERESADO: ['Interesado', 'bg-gray-100 text-gray-700'],
  BORRADOR: ['Borrador', 'bg-gray-100 text-gray-600'],
  ENVIADA: ['Enviada', 'bg-blue-100 text-blue-800'],
  PAGO_PENDIENTE: ['Pago pendiente', 'bg-amber-100 text-amber-800'],
  PAGO_EN_VERIFICACION: ['Pago en verificación', 'bg-amber-100 text-amber-900'],
  PAGADA: ['Pagada', 'bg-emerald-100 text-emerald-800'],
  EN_REVISION: ['En revisión', 'bg-indigo-100 text-indigo-800'],
  DOCUMENTOS_INCOMPLETOS: ['Docs. incompletos', 'bg-red-100 text-red-800'],
  ADMITIDA: ['Admitida', 'bg-emerald-200 text-emerald-900'],
  NO_ADMITIDA: ['No admitida', 'bg-gray-200 text-gray-700'],
  MATRICULADA: ['Matriculada', 'bg-emerald-300 text-emerald-950'],
  DESISTIO: ['Desistió', 'bg-gray-200 text-gray-600'],
};

const Badge = ({ status }: { status: string }) => {
  const [texto, color] = ETIQUETA[status] ?? [status, 'bg-gray-100 text-gray-700'];
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${color}`}>{texto}</span>;
};

/**
 * Admisiones (§5): bandeja de aspirantes con decisión completa (pago manual,
 * admitir/no admitir/matricular), CRUD de convocatorias y embudo por fuente.
 */
export function AdmisionesSection() {
  const [tab, setTab] = useState<'bandeja' | 'convocatorias' | 'embudo'>('bandeja');
  const boton = (id: typeof tab, etiqueta: string, Icono: typeof Inbox) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${tab === id ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
    >
      <Icono size={15} /> {etiqueta}
    </button>
  );
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {boton('bandeja', 'Bandeja de aspirantes', Inbox)}
        {boton('convocatorias', 'Convocatorias', CalendarRange)}
        {boton('embudo', 'Embudo', BarChart3)}
      </div>
      {tab === 'bandeja' && <BandejaTab />}
      {tab === 'convocatorias' && <ConvocatoriasTab />}
      {tab === 'embudo' && <EmbudoTab />}
    </div>
  );
}

function BandejaTab() {
  const [filtros, setFiltros] = useState<{ callId?: string; status?: string; q?: string; desde?: string; hasta?: string }>({});
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const { data: convocatorias } = useQuery({
    queryKey: ['admisiones-calls'],
    queryFn: admisionesApi.convocatorias,
  });
  const { data: solicitudes, isLoading, error } = useQuery({
    queryKey: ['admisiones-solicitudes', filtros],
    queryFn: () => admisionesApi.solicitudes(filtros),
  });

  const filas: SolicitudFila[] = solicitudes ?? [];
  const porEstado = filas.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  const campo = 'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Inbox className="text-emerald-600" /> Admisiones
        </h2>
        <p className="text-sm text-gray-500">Solicitudes de inscripción que llegan del sitio público.</p>
      </div>

      {/* Tablero por estado: clic filtra */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(porEstado).map(([estado, n]) => (
          <button
            key={estado}
            onClick={() => setFiltros((f) => ({ ...f, status: f.status === estado ? undefined : estado }))}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold flex items-center gap-2 ${filtros.status === estado ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
          >
            <Badge status={estado} /> {n}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Buscar nombre, documento o correo…"
          value={filtros.q ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, q: e.target.value || undefined }))}
          className={`${campo} flex-1 min-w-52`}
        />
        <select
          value={filtros.callId ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, callId: e.target.value || undefined }))}
          className={campo}
        >
          <option value="">Todas las convocatorias</option>
          {(convocatorias ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input type="date" value={filtros.desde ?? ''} onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value || undefined }))} className={campo} />
        <input type="date" value={filtros.hasta ?? ''} onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value || undefined }))} className={campo} />
        <button
          onClick={() => filas.length && generateAdmisionesExcel(filas)}
          disabled={!filas.length}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold flex items-center gap-2 bg-white hover:border-emerald-500 disabled:opacity-50"
          title="Exportar lo filtrado a Excel"
        >
          <Download size={15} /> Excel
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Cargando solicitudes…</p>}
      {error != null && <p className="text-sm text-red-600">{mensajeDeError(error)}</p>}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2.5">Código</th>
              <th className="px-4 py-2.5">Aspirante</th>
              <th className="px-4 py-2.5">Programa / Convocatoria</th>
              <th className="px-4 py-2.5">Estado</th>
              <th className="px-4 py-2.5">Fuente</th>
              <th className="px-4 py-2.5">Fecha</th>
              <th className="px-4 py-2.5 text-right">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filas.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-mono text-xs">{s.code}</td>
                <td className="px-4 py-2.5">
                  <p className="font-semibold text-gray-900">{s.applicant.firstName} {s.applicant.lastName}</p>
                  <p className="text-xs text-gray-500">{s.applicant.documentType} {s.applicant.documentNumber}</p>
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {s.call ? (
                    <>
                      <p>{s.call.program.name}</p>
                      {s.targetLevel != null && <p className="text-xs text-gray-400">Grado {s.targetLevel === 0 ? 'Transición' : s.targetLevel}</p>}
                    </>
                  ) : (
                    <span className="text-gray-400">Contacto / interesado</span>
                  )}
                </td>
                <td className="px-4 py-2.5"><Badge status={s.status} /></td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{s.applicant.utm?.utm_source ?? (s.applicant.utm?.gclid ? 'google ads' : '—')}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('es-CO')}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setDetalleId(s.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Ver detalle">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && filas.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No hay solicitudes con esos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detalleId && <DetalleSolicitudModal id={detalleId} onClose={() => setDetalleId(null)} />}
    </div>
  );
}

const EVENTO_ES: Record<string, string> = {
  created: 'Solicitud iniciada',
  submitted: 'Solicitud enviada',
  doc_uploaded: 'Documento subido',
  doc_approved: 'Documento aprobado',
  doc_rejected: 'Documento rechazado',
  docs_resubmitted: 'Documentos corregidos por el aspirante',
  docs_complete: 'Documentos completos',
  correction_requested: 'Corrección solicitada',
  lead: 'Contacto recibido',
};

function DetalleSolicitudModal({ id, onClose }: { id: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const [nota, setNota] = useState('');
  const [notaRechazo, setNotaRechazo] = useState<Record<string, string>>({});

  const { data: s, isLoading } = useQuery({
    queryKey: ['admisiones-detalle', id],
    queryFn: () => admisionesApi.detalle(id),
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['admisiones-detalle', id] });
    queryClient.invalidateQueries({ queryKey: ['admisiones-solicitudes'] });
  };

  const revisar = useMutation({
    mutationFn: ({ docId, status }: { docId: string; status: 'APROBADO' | 'RECHAZADO' }) =>
      admisionesApi.revisarDocumento(docId, { status, reviewNote: notaRechazo[docId] || undefined }),
    onSuccess: invalidar,
    onError: (e) => alert(mensajeDeError(e)),
  });

  const corregir = useMutation({
    mutationFn: () => admisionesApi.pedirCorreccion(id, nota),
    onSuccess: () => { setNota(''); invalidar(); },
    onError: (e) => alert(mensajeDeError(e)),
  });

  const decision = useMutation({
    mutationFn: ({ accion, nota: n }: { accion: 'confirmarPago' | 'rechazarPago' | 'admitir' | 'noAdmitir' | 'desistir' | 'matricular'; nota?: string }) => {
      switch (accion) {
        case 'confirmarPago': return admisionesApi.confirmarPago(id);
        case 'rechazarPago': return admisionesApi.rechazarPago(id, n as string);
        case 'admitir': return admisionesApi.admitir(id);
        case 'noAdmitir': return admisionesApi.noAdmitir(id, n as string);
        case 'desistir': return admisionesApi.desistir(id);
        case 'matricular': return admisionesApi.matricular(id);
      }
    },
    onSuccess: invalidar,
    onError: (e) => alert(mensajeDeError(e)),
  });

  const abrirDoc = async (docId: string) => {
    try {
      const r = await apiClient.get<Blob>(admisionesApi.rutaArchivo(docId), { responseType: 'blob' });
      const url = URL.createObjectURL(r.data as unknown as Blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert('No se pudo abrir el documento.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label="Detalle de la solicitud" tabIndex={-1}
        className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !s ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="font-mono text-base">{s.code}</span> <Badge status={s.status} />
                </h3>
                <p className="text-sm text-gray-600">{s.call?.program.name ?? 'Contacto'} {s.call ? `· ${s.call.name}` : ''}</p>
              </div>
              <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-gray-200 p-4 space-y-1">
                <h4 className="font-bold text-gray-900 mb-1">Aspirante</h4>
                <p>{s.applicant.firstName} {s.applicant.lastName}</p>
                <p className="text-gray-500">{s.applicant.documentType} {s.applicant.documentNumber}</p>
                <p className="text-gray-500">{s.applicant.email} · {s.applicant.phone}</p>
                {s.applicant.birthDate && <p className="text-gray-500">Nac.: {new Date(s.applicant.birthDate).toLocaleDateString('es-CO')}</p>}
                {s.applicant.previousEducation && <p className="text-gray-500">Formación: {s.applicant.previousEducation}</p>}
                {s.applicant.guardian?.nombre && (
                  <p className="text-gray-500">Acudiente: {s.applicant.guardian.nombre} ({s.applicant.guardian.parentesco}) · {s.applicant.guardian.telefono}</p>
                )}
                <p className="text-xs text-gray-400 pt-1">
                  Autorización de datos: {new Date(s.applicant.consentAt).toLocaleString('es-CO')} · v{s.applicant.consentVersion}
                </p>
                {s.applicant.utm && (
                  <p className="text-xs text-gray-400">
                    Campaña: {Object.entries(s.applicant.utm).filter(([k]) => k !== 'landing').map(([k, v]) => `${k}=${v}`).join(' · ')}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-bold text-gray-900 mb-2">Línea de tiempo</h4>
                <ol className="space-y-1.5 text-xs">
                  {s.events.map((e) => (
                    <li key={e.id} className="flex gap-2">
                      <span className="text-gray-400 shrink-0">{new Date(e.createdAt).toLocaleString('es-CO')}</span>
                      <span className="text-gray-700">{EVENTO_ES[e.type] ?? e.type}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Documentos */}
            <div className="mt-4 rounded-lg border border-gray-200 p-4">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16} /> Documentos</h4>
              <ul className="divide-y divide-gray-100">
                {s.documents.map((d) => (
                  <li key={d.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{d.requiredDoc?.name ?? d.originalName}</p>
                        <p className="text-xs text-gray-400">{d.originalName} · {d.sizeKb} KB</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge status={d.status === 'PENDIENTE' ? 'EN_REVISION' : d.status === 'APROBADO' ? 'ADMITIDA' : 'DOCUMENTOS_INCOMPLETOS'} />
                        <button onClick={() => abrirDoc(d.id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Ver documento"><Eye size={15} /></button>
                        <button
                          onClick={() => revisar.mutate({ docId: d.id, status: 'APROBADO' })}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Aprobar"
                        ><CheckCircle2 size={15} /></button>
                        <button
                          onClick={() => {
                            if (!notaRechazo[d.id]) return alert('Escribe la nota del rechazo (el aspirante la verá).');
                            revisar.mutate({ docId: d.id, status: 'RECHAZADO' });
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Rechazar"
                        ><XCircle size={15} /></button>
                      </div>
                    </div>
                    <input
                      placeholder="Nota de rechazo (va al correo del aspirante)"
                      value={notaRechazo[d.id] ?? d.reviewNote ?? ''}
                      onChange={(e) => setNotaRechazo((n) => ({ ...n, [d.id]: e.target.value }))}
                      className="mt-1.5 w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs"
                    />
                  </li>
                ))}
                {s.documents.length === 0 && <li className="py-3 text-sm text-gray-500">Sin documentos subidos.</li>}
              </ul>
            </div>

            {/* Pago manual */}
            {(s.status === 'PAGO_PENDIENTE' || s.status === 'PAGO_EN_VERIFICACION') && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-amber-900 font-semibold flex items-center gap-2">
                  <Banknote size={16} />
                  {s.status === 'PAGO_EN_VERIFICACION' ? 'Comprobante recibido: verifícalo arriba y decide.' : 'Esperando el pago del aspirante.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => decision.mutate({ accion: 'confirmarPago' })}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
                  >Confirmar pago</button>
                  {s.status === 'PAGO_EN_VERIFICACION' && (
                    <button
                      onClick={() => {
                        const n = prompt('¿Por qué se rechaza el comprobante? (va al correo del aspirante)');
                        if (n) decision.mutate({ accion: 'rechazarPago', nota: n });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold"
                    >Rechazar comprobante</button>
                  )}
                </div>
              </div>
            )}

            {/* Decisión final */}
            {!['ADMITIDA', 'NO_ADMITIDA', 'MATRICULADA', 'DESISTIO', 'INTERESADO'].includes(s.status) && (
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => decision.mutate({ accion: 'admitir' })}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2"
                ><UserCheck size={15} /> Admitir</button>
                <button
                  onClick={() => {
                    const n = prompt('Motivo de la no admisión (va al correo del aspirante):');
                    if (n) decision.mutate({ accion: 'noAdmitir', nota: n });
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-sm font-bold flex items-center gap-2"
                ><UserX size={15} /> No admitir</button>
                <button
                  onClick={() => confirm('¿Marcar que el aspirante desistió?') && decision.mutate({ accion: 'desistir' })}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold"
                >Desistió</button>
              </div>
            )}
            {s.status === 'ADMITIDA' && (
              <div className="mt-4">
                <button
                  onClick={() => decision.mutate({ accion: 'matricular' })}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold flex items-center gap-2"
                ><CheckCheck size={15} /> Marcar matriculada</button>
              </div>
            )}

            {/* Pedir corrección general */}
            <div className="mt-4 flex gap-2">
              <input
                placeholder="Pedir una corrección general (correo + enlace al aspirante)…"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={() => nota.trim() && corregir.mutate()}
                disabled={corregir.isPending || !nota.trim()}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <MailWarning size={15} /> Pedir corrección
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ====================================================== Convocatorias */

function ConvocatoriasTab() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ConvocatoriaDetallada | 'nueva' | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admisiones-calls-detallado'],
    queryFn: admisionesApi.callsDetallado,
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => admisionesApi.actualizarCall(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admisiones-calls-detallado'] }),
    onError: (e) => alert(mensajeDeError(e)),
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setModal('nueva')}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2"
        ><Plus size={15} /> Nueva convocatoria</button>
      </div>
      {isLoading && <p className="text-sm text-gray-500">Cargando…</p>}
      {error != null && <p className="text-sm text-red-600">{mensajeDeError(error)}</p>}
      <div className="grid gap-3">
        {(data ?? []).map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow p-4 flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-gray-900">{c.name}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.abierta ? 'bg-emerald-100 text-emerald-800' : c.status === 'BORRADOR' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                  {c.abierta ? 'Abierta' : c.status === 'BORRADOR' ? 'Borrador' : 'Cerrada'}
                </span>
                {c.rolling && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Permanente</span>}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {c.program.name} · {c.academicPeriod.code} · pensum {c.studyPlan.version}
                {c.applicationFee > 0 && <> · Inscripción ${c.applicationFee.toLocaleString('es-CO')}</>}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Cupo: {c.cupoUsado}{c.capacity ? `/${c.capacity}` : ''} · {c._count.applications} solicitud(es)
                {c.targetLevels?.length ? ` · ${c.targetLevels.length} grado(s) con cupo propio` : ''}
                · Docs: {c.requiredDocuments.map((d) => d.name).join(', ') || '—'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {c.status !== 'ABIERTA' ? (
                <button onClick={() => cambiarEstado.mutate({ id: c.id, status: 'ABIERTA' })} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">Abrir</button>
              ) : (
                <button onClick={() => cambiarEstado.mutate({ id: c.id, status: 'CERRADA' })} className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-bold">Cerrar</button>
              )}
              <button onClick={() => setModal(c)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700">Editar</button>
            </div>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="text-center text-gray-500 py-10">Aún no hay convocatorias. Crea la primera para recibir inscripciones.</p>
        )}
      </div>
      {modal && <ConvocatoriaModal convocatoria={modal === 'nueva' ? null : modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function ConvocatoriaModal({ convocatoria, onClose }: { convocatoria: ConvocatoriaDetallada | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const c = convocatoria;

  const [programId, setProgramId] = useState(c?.program.id ?? '');
  const [studyPlanId, setStudyPlanId] = useState(c?.studyPlan.id ?? '');
  const [academicPeriodId, setAcademicPeriodId] = useState(c?.academicPeriod.id ?? '');
  const [name, setName] = useState(c?.name ?? '');
  const [slug, setSlug] = useState(c?.slug ?? '');
  const [opensAt, setOpensAt] = useState(c?.opensAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [closesAt, setClosesAt] = useState(c?.closesAt?.slice(0, 10) ?? '');
  const [rolling, setRolling] = useState(c?.rolling ?? false);
  const [startsAt, setStartsAt] = useState(c?.startsAt?.slice(0, 10) ?? '');
  const [capacity, setCapacity] = useState(c?.capacity ? String(c.capacity) : '');
  const [applicationFee, setApplicationFee] = useState(c ? String(c.applicationFee) : '0');
  const [minAge, setMinAge] = useState(c?.minAge ? String(c.minAge) : '');
  const [minEducation, setMinEducation] = useState(c?.minEducation ?? '');
  const [documentos, setDocumentos] = useState<{ name: string; required: boolean }[]>(
    c?.requiredDocuments.map((d) => ({ name: d.name, required: d.required })) ?? [{ name: 'Documento de identidad', required: true }],
  );

  const { data: programasRes } = useQuery({ queryKey: ['programas', '', ''], queryFn: () => programasApi.getAll({ limit: 100 }) });
  const programas = comoArreglo<{ id: string; name: string }>(programasRes);
  const { data: pensums } = useQuery({
    queryKey: ['pensums-de', programId],
    queryFn: () => programasApi.pensums(programId),
    enabled: !!programId,
  });
  const { data: periodosRes } = useQuery({ queryKey: ['periodos'], queryFn: () => periodosApi.getAll({ limit: 100 }) });
  const periodos = comoArreglo<{ id: string; code: string }>(periodosRes);

  const guardar = useMutation({
    mutationFn: () => {
      const cuerpo = {
        programId, studyPlanId, academicPeriodId, name,
        slug: slug || name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120),
        opensAt: new Date(opensAt).toISOString(),
        closesAt: rolling ? null : closesAt ? new Date(closesAt).toISOString() : null,
        rolling,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        capacity: capacity ? Number(capacity) : null,
        applicationFee: Number(applicationFee) || 0,
        minAge: minAge ? Number(minAge) : null,
        minEducation: minEducation || null,
        documentos,
      };
      return c ? admisionesApi.actualizarCall(c.id, cuerpo) : admisionesApi.crearCall(cuerpo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-calls-detallado'] });
      onClose();
    },
    onError: (e) => alert(mensajeDeError(e)),
  });

  const campo = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label="Convocatoria" tabIndex={-1}
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">{c ? 'Editar convocatoria' : 'Nueva convocatoria'}</h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <select value={programId} onChange={(e) => { setProgramId(e.target.value); setStudyPlanId(''); }} className={campo}>
            <option value="">Programa *</option>
            {programas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={studyPlanId} onChange={(e) => setStudyPlanId(e.target.value)} className={campo} disabled={!programId}>
            <option value="">Pensum *</option>
            {(pensums ?? []).map((p: { id: string; version: string }) => <option key={p.id} value={p.id}>{p.version}</option>)}
          </select>
          <select value={academicPeriodId} onChange={(e) => setAcademicPeriodId(e.target.value)} className={campo}>
            <option value="">Periodo *</option>
            {periodos.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre * (Inscripciones 2027-1 — Nocturna)" maxLength={160} className={campo} />
          <div className="sm:col-span-2">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
              placeholder="Slug de la URL (vacío = se genera del nombre)"
              maxLength={120}
              className={campo}
            />
            <p className="text-xs text-gray-400 mt-0.5">/inscripcion/{slug || '…'}</p>
          </div>
          <div><label className="text-xs text-gray-500">Abre *</label><input type="date" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} className={campo} /></div>
          <div>
            <label className="text-xs text-gray-500">Cierra {rolling ? '(permanente)' : '*'}</label>
            <input type="date" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} disabled={rolling} className={`${campo} disabled:opacity-50`} />
          </div>
          <div><label className="text-xs text-gray-500">Inicio de clases</label><input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={campo} /></div>
          <input value={capacity} onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ''))} placeholder="Cupo total (vacío = sin tope)" className={campo} />
          <input value={applicationFee} onChange={(e) => setApplicationFee(e.target.value.replace(/\D/g, ''))} placeholder="Valor inscripción COP (0 = gratis)" className={campo} />
          <input value={minAge} onChange={(e) => setMinAge(e.target.value.replace(/\D/g, ''))} placeholder="Edad mínima" className={campo} />
          <select value={minEducation} onChange={(e) => setMinEducation(e.target.value)} className={campo}>
            <option value="">Escolaridad mínima (ninguna)</option>
            <option>Primaria</option><option>9° aprobado</option><option>Bachiller</option>
            <option>Técnico</option><option>Tecnólogo</option><option>Profesional</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={rolling} onChange={(e) => setRolling(e.target.checked)} />
            Inscripción permanente (rolling)
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Documentos requeridos</p>
          {documentos.map((d, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={d.name} maxLength={120} onChange={(e) => setDocumentos(documentos.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} className={campo} />
              <label className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                <input type="checkbox" checked={d.required} onChange={(e) => setDocumentos(documentos.map((x, j) => j === i ? { ...x, required: e.target.checked } : x))} />
                obligatorio
              </label>
              <button onClick={() => setDocumentos(documentos.filter((_, j) => j !== i))} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><X size={14} /></button>
            </div>
          ))}
          <button onClick={() => setDocumentos([...documentos, { name: '', required: true }])} className="text-sm text-emerald-700 font-semibold flex items-center gap-1"><Plus size={14} /> Agregar documento</button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => guardar.mutate()}
            disabled={guardar.isPending || !programId || !studyPlanId || !academicPeriodId || !name.trim() || (!rolling && !closesAt)}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50"
          >{guardar.isPending ? 'Guardando…' : 'Guardar convocatoria'}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ Embudo */

function EmbudoTab() {
  const [callId, setCallId] = useState('');
  const { data: convocatorias } = useQuery({ queryKey: ['admisiones-calls'], queryFn: admisionesApi.convocatorias });
  const { data, isLoading } = useQuery({
    queryKey: ['admisiones-embudo', callId],
    queryFn: () => admisionesApi.embudo(callId || undefined),
  });

  const pasos = data
    ? [
        ['Interesados', data.totales.interesados],
        ['Enviadas', data.totales.enviadas],
        ['Pagadas', data.totales.pagadas],
        ['Admitidas', data.totales.admitidas],
        ['Matriculadas', data.totales.matriculadas],
      ] as [string, number][]
    : [];
  const max = Math.max(1, ...pasos.map(([, n]) => n));

  return (
    <div className="space-y-4">
      <select value={callId} onChange={(e) => setCallId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
        <option value="">Todas las convocatorias</option>
        {(convocatorias ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {isLoading && <p className="text-sm text-gray-500">Calculando…</p>}
      {data && (
        <>
          <div className="bg-white rounded-lg shadow p-5 space-y-2">
            {pasos.map(([nombre, n]) => (
              <div key={nombre} className="flex items-center gap-3">
                <span className="w-28 text-sm text-gray-600">{nombre}</span>
                <div className="flex-1 bg-gray-100 rounded h-7 overflow-hidden">
                  <div className="h-full rounded bg-emerald-500/80 text-white text-xs font-bold flex items-center px-2" style={{ width: `${Math.max(4, (n / max) * 100)}%` }}>{n}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2.5">Fuente</th>
                  <th className="px-4 py-2.5 text-right">Solicitudes</th>
                  <th className="px-4 py-2.5 text-right">Enviadas</th>
                  <th className="px-4 py-2.5 text-right">Admitidas</th>
                  <th className="px-4 py-2.5 text-right">Matriculadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.fuentes.map((f) => (
                  <tr key={f.fuente}>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{f.fuente}</td>
                    <td className="px-4 py-2.5 text-right">{f.total}</td>
                    <td className="px-4 py-2.5 text-right">{f.enviadas}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-700 font-bold">{f.admitidas}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-800 font-black">{f.matriculadas}</td>
                  </tr>
                ))}
                {data.fuentes.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Sin datos todavía.</td></tr>
                )}
              </tbody>
            </table>
            <p className="px-4 py-2 text-xs text-gray-400">La fuente sale del utm_source (o gclid/fbclid) con el que llegó el aspirante: campañas que matriculan, no solo que hacen clic.</p>
          </div>
        </>
      )}
    </div>
  );
}
