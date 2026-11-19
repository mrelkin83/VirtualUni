import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Eye, FileText, Inbox, MailWarning, X, XCircle } from 'lucide-react';
import {
  admisionesApi,
  SolicitudDetalle,
  SolicitudFila,
} from '../../../../api/endpoints/admisiones';
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
 * Bandeja de aspirantes (§5, Fase 3): filtros, tablero por estado, detalle
 * con documentos (aprobar/rechazar con nota), línea de tiempo y petición de
 * corrección. Admitir/No admitir y el embudo llegan con la Fase 4.
 */
export function AdmisionesSection() {
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
