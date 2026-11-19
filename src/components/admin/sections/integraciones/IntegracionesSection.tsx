import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as QRCode from 'qrcode';
import {
  BookOpen, Copy, KeyRound, Link2, Plug, Plus, QrCode, RefreshCcw, Send, Trash2, Webhook,
} from 'lucide-react';
import {
  integracionesApi,
  LlaveApi,
  ResumenIntegraciones,
  WebhookFila,
} from '../../../../api/endpoints/integraciones';
import { mensajeDeError } from '../academico/errores';

/**
 * Panel "Integraciones" (§13.6): enlaces y QR, generador del widget con su
 * lista blanca, llaves de API (se ven completas UNA sola vez), webhooks con
 * prueba y registro de entregas, y la documentación de /public/docs.
 */
export function IntegracionesSection() {
  const [tab, setTab] = useState<'enlaces' | 'widget' | 'llaves' | 'webhooks' | 'docs'>('enlaces');
  const { data: resumen, isLoading } = useQuery({ queryKey: ['integraciones'], queryFn: integracionesApi.resumen });

  if (isLoading || !resumen) return <p className="p-6 text-sm text-gray-500">Cargando integraciones…</p>;

  const boton = (id: typeof tab, etiqueta: string, Icono: typeof Plug) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${tab === id ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
    >
      <Icono size={15} /> {etiqueta}
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Plug className="text-emerald-600" /> Integraciones
        </h2>
        <p className="text-sm text-gray-500">
          Conecta la web o el CRM propios de la institución con las inscripciones de VirtualUni.
        </p>
        {!resumen.tenant.enablePublicApi && !resumen.tenant.enableEmbed && (
          <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2.5">
            El widget y la API pública están desactivados en el plan actual; los enlaces siempre funcionan.
          </p>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {boton('enlaces', 'Enlaces y QR', Link2)}
        {boton('widget', 'Widget', QrCode)}
        {boton('llaves', 'Llaves de API', KeyRound)}
        {boton('webhooks', 'Webhooks', Webhook)}
        {boton('docs', 'Documentación', BookOpen)}
      </div>
      {tab === 'enlaces' && <EnlacesTab resumen={resumen} />}
      {tab === 'widget' && <WidgetTab resumen={resumen} />}
      {tab === 'llaves' && <LlavesTab resumen={resumen} />}
      {tab === 'webhooks' && <WebhooksTab resumen={resumen} />}
      {tab === 'docs' && <DocsTab />}
    </div>
  );
}

const copiar = (texto: string) => {
  navigator.clipboard?.writeText(texto).then(
    () => undefined,
    () => window.prompt('Copia el texto:', texto),
  );
};

function Qr({ texto }: { texto: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) QRCode.toCanvas(ref.current, texto, { width: 112, margin: 1 }).catch(() => undefined);
  }, [texto]);
  return <canvas ref={ref} className="rounded border border-gray-200" />;
}

/* ------------------------------------------------------- Enlaces y QR */

function EnlacesTab({ resumen }: { resumen: ResumenIntegraciones }) {
  const origen = window.location.origin;
  const enlaces = [
    { nombre: 'Oferta completa', url: `${origen}/programas?utm_source=sitio-institucional` },
    { nombre: 'Consulta de estado del aspirante', url: `${origen}/aspirante` },
    { nombre: 'Validación de certificados', url: `${origen}/validar` },
  ];
  return (
    <div className="grid gap-3">
      <p className="text-xs text-gray-500">
        Nivel 1 (§13.1): pega estos enlaces en la web actual, en afiches o en redes. Llevan utm_source
        para que el embudo muestre de dónde vino cada matriculado. Modo del sitio: {resumen.siteMode}.
      </p>
      {enlaces.map((e) => (
        <div key={e.nombre} className="bg-white rounded-lg shadow p-4 flex items-center gap-4 flex-wrap">
          <Qr texto={e.url} />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900">{e.nombre}</p>
            <p className="text-xs text-gray-500 break-all">{e.url}</p>
          </div>
          <button onClick={() => copiar(e.url)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold flex items-center gap-2">
            <Copy size={14} /> Copiar
          </button>
        </div>
      ))}
      <p className="text-xs text-gray-400">
        Los enlaces de un programa o convocatoria concretos se copian desde su ficha (/programas/…slug… e /inscripcion/…slug…).
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ Widget */

function WidgetTab({ resumen }: { resumen: ResumenIntegraciones }) {
  const queryClient = useQueryClient();
  const [tipo, setTipo] = useState('inscripcion');
  const [slug, setSlug] = useState('');
  const [origins, setOrigins] = useState(resumen.embedAllowedOrigins.join('\n'));

  const guardarOrigins = useMutation({
    mutationFn: () =>
      integracionesApi.embedOrigins(
        origins.split(/\s+/).map((o) => o.trim().replace(/\/$/, '')).filter(Boolean),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integraciones'] }),
    onError: (e) => alert(mensajeDeError(e)),
  });

  const origen = window.location.origin;
  const atributo = tipo === 'programa' ? ` data-slug="${slug || 'slug-del-programa'}"` : tipo === 'inscripcion' ? ` data-convocatoria="${slug || 'slug-de-la-convocatoria'}"` : '';
  const fragmento = `<div data-virtualuni="${tipo}"${atributo}></div>\n<script src="${origen}/embed.js" async></script>`;

  return (
    <div className="grid gap-4">
      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-bold text-gray-900">Generador del fragmento (nivel 2, §13.2)</h3>
        <div className="flex gap-2 flex-wrap">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="oferta">Catálogo de la oferta</option>
            <option value="programa">Ficha de un programa</option>
            <option value="inscripcion">Formulario de inscripción</option>
            <option value="estado">Consulta del aspirante</option>
            <option value="validar">Validación de certificados</option>
          </select>
          {(tipo === 'programa' || tipo === 'inscripcion') && (
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={tipo === 'programa' ? 'slug del programa' : 'slug de la convocatoria'} className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48" />
          )}
        </div>
        <pre className="bg-gray-900 text-emerald-300 text-xs rounded-lg p-4 overflow-x-auto">{fragmento}</pre>
        <div className="flex gap-2">
          <button onClick={() => copiar(fragmento)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold flex items-center gap-2"><Copy size={14} /> Copiar código</button>
        </div>
        <p className="text-xs text-gray-500">
          La página madre puede escuchar <code>virtualuni:application_submitted</code> (CustomEvent con el código)
          para disparar sus propias conversiones de GA4/Ads/Meta.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-bold text-gray-900">Dominios autorizados a incrustar</h3>
        <p className="text-xs text-gray-500">
          Uno por línea (https://www.sucolegio.edu.co). Fuera de esta lista el navegador no pinta el widget.
        </p>
        <textarea rows={3} value={origins} onChange={(e) => setOrigins(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
        <button onClick={() => guardarOrigins.mutate()} disabled={guardarOrigins.isPending} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50">Guardar dominios</button>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="font-bold text-gray-900 mb-2">Vista previa en vivo</h3>
        {resumen.embedAllowedOrigins.length === 0 ? (
          <p className="text-sm text-gray-500">Agrega al menos un dominio para activar los widgets.</p>
        ) : (
          <iframe
            title="Vista previa del widget"
            src={`${origen}/embed/${tipo === 'programa' ? `programa/${slug}` : tipo === 'inscripcion' ? `inscripcion/${slug}` : tipo}`}
            className="w-full h-96 rounded-lg border border-gray-200"
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Llaves */

function LlavesTab({ resumen }: { resumen: ResumenIntegraciones }) {
  const queryClient = useQueryClient();
  const { data: llaves } = useQuery({ queryKey: ['integraciones-llaves'], queryFn: integracionesApi.llaves });
  const [recienCreada, setRecienCreada] = useState<LlaveApi | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'PUBLISHABLE' | 'SECRET'>('SECRET');
  const [testMode, setTestMode] = useState(false);
  const [origins, setOrigins] = useState('');

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['integraciones-llaves'] });
  const crear = useMutation({
    mutationFn: () =>
      integracionesApi.crearLlave({
        name, type, testMode,
        allowedOrigins: type === 'PUBLISHABLE' ? origins.split(/\s+/).filter(Boolean) : undefined,
      }),
    onSuccess: (r) => { setRecienCreada(r); setName(''); invalidar(); },
    onError: (e) => alert(mensajeDeError(e)),
  });
  const rotar = useMutation({
    mutationFn: (id: string) => integracionesApi.rotarLlave(id),
    onSuccess: (r) => { setRecienCreada(r); invalidar(); },
    onError: (e) => alert(mensajeDeError(e)),
  });
  const revocar = useMutation({
    mutationFn: (id: string) => integracionesApi.revocarLlave(id),
    onSuccess: invalidar,
    onError: (e) => alert(mensajeDeError(e)),
  });

  return (
    <div className="grid gap-4">
      {recienCreada?.llave && (
        <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50 p-4">
          <p className="font-bold text-emerald-900">Guarda esta llave AHORA: no se volverá a mostrar.</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <code className="bg-white rounded px-3 py-2 text-sm break-all">{recienCreada.llave}</code>
            <button onClick={() => copiar(recienCreada.llave as string)} className="px-3 py-2 rounded-lg border border-emerald-400 text-sm font-semibold flex items-center gap-2"><Copy size={14} /> Copiar</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-bold text-gray-900">Nueva llave (nivel 3, §13.3)</h3>
        <div className="flex gap-2 flex-wrap">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (CRM, Web nueva…)" maxLength={80} className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-44" />
          <select value={type} onChange={(e) => setType(e.target.value as 'PUBLISHABLE' | 'SECRET')} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="SECRET">Secreta (sk_, servidor a servidor)</option>
            <option value="PUBLISHABLE">Publicable (pk_, navegador, solo lectura)</option>
          </select>
          <label className="flex items-center gap-1.5 text-sm text-gray-700">
            <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} /> modo prueba
          </label>
          <button onClick={() => name.trim() && crear.mutate()} disabled={crear.isPending || !name.trim()} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"><Plus size={14} /> Crear</button>
        </div>
        {type === 'PUBLISHABLE' && (
          <input value={origins} onChange={(e) => setOrigins(e.target.value)} placeholder="Orígenes autorizados separados por espacio (https://www.sitio.edu.co)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        )}
        <p className="text-xs text-gray-500">
          Scopes publicables: {resumen.scopes.publishable.join(', ')} · Scopes secretos: {resumen.scopes.secret.join(', ')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Llave</th><th className="px-4 py-2.5">Tipo</th><th className="px-4 py-2.5">Último uso</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(llaves ?? []).map((k) => (
              <tr key={k.id} className={k.revokedAt ? 'opacity-50' : ''}>
                <td className="px-4 py-2.5 font-semibold text-gray-800">{k.name}{k.testMode && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">TEST</span>}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{k.prefix}…</td>
                <td className="px-4 py-2.5 text-xs">{k.type === 'SECRET' ? 'Secreta' : 'Publicable'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{k.revokedAt ? 'REVOCADA' : k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('es-CO') : 'nunca'}</td>
                <td className="px-4 py-2.5 text-right">
                  {!k.revokedAt && (
                    <>
                      <button onClick={() => confirm('¿Rotar? La llave actual deja de funcionar y se emite una nueva.') && rotar.mutate(k.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Rotar"><RefreshCcw size={15} /></button>
                      <button onClick={() => confirm('¿Revocar esta llave? Las integraciones que la usen fallarán.') && revocar.mutate(k.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Revocar"><Trash2 size={15} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {(llaves ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Sin llaves todavía.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Webhooks */

function WebhooksTab({ resumen }: { resumen: ResumenIntegraciones }) {
  const queryClient = useQueryClient();
  const { data: webhooks } = useQuery({ queryKey: ['integraciones-webhooks'], queryFn: integracionesApi.webhooks });
  const [url, setUrl] = useState('');
  const [eventos, setEventos] = useState<string[]>(['application.submitted']);
  const [secretoNuevo, setSecretoNuevo] = useState<string | null>(null);
  const [verEntregas, setVerEntregas] = useState<string | null>(null);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['integraciones-webhooks'] });
  const crear = useMutation({
    mutationFn: () => integracionesApi.crearWebhook({ url, events: eventos }),
    onSuccess: (r) => { setSecretoNuevo(r.secreto ?? null); setUrl(''); invalidar(); },
    onError: (e) => alert(mensajeDeError(e)),
  });
  const accion = useMutation({
    mutationFn: async ({ id, que }: { id: string; que: 'activar' | 'desactivar' | 'eliminar' | 'prueba' }): Promise<unknown> => {
      if (que === 'eliminar') return integracionesApi.eliminarWebhook(id);
      if (que === 'prueba') return integracionesApi.prueba(id);
      return integracionesApi.actualizarWebhook(id, { active: que === 'activar' });
    },
    onSuccess: () => { invalidar(); queryClient.invalidateQueries({ queryKey: ['integraciones-entregas'] }); },
    onError: (e) => alert(mensajeDeError(e)),
  });

  return (
    <div className="grid gap-4">
      {secretoNuevo && (
        <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50 p-4">
          <p className="font-bold text-emerald-900">Secreto HMAC del webhook (verifica la cabecera VirtualUni-Signature): guárdalo, no se repite.</p>
          <code className="mt-1 inline-block bg-white rounded px-3 py-2 text-sm break-all">{secretoNuevo}</code>
          <button onClick={() => copiar(secretoNuevo)} className="ml-2 px-3 py-2 rounded-lg border border-emerald-400 text-sm font-semibold"><Copy size={13} className="inline mr-1" />Copiar</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-bold text-gray-900">Nuevo webhook (§13.4)</h3>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://su-servidor.edu.co/virtualuni/webhook" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <div className="flex gap-x-4 gap-y-1.5 flex-wrap">
          {resumen.eventos.map((ev) => (
            <label key={ev} className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={eventos.includes(ev)}
                onChange={(e) => setEventos(e.target.checked ? [...eventos, ev] : eventos.filter((x) => x !== ev))}
              />
              {ev}
            </label>
          ))}
        </div>
        <button onClick={() => url.trim() && eventos.length && crear.mutate()} disabled={crear.isPending || !url.trim() || !eventos.length} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"><Plus size={14} /> Crear webhook</button>
      </div>

      <div className="grid gap-3">
        {(webhooks ?? []).map((w: WebhookFila) => (
          <div key={w.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-mono text-sm text-gray-900 break-all">{w.url}</p>
                <p className="text-xs text-gray-500 mt-0.5">{w.events.join(' · ')}</p>
                {w.failureCount > 0 && <p className="text-xs text-red-600 mt-0.5">{w.failureCount} fallo(s) seguidos{!w.active && ' — desactivado automáticamente'}</p>}
              </div>
              <div className="flex gap-1.5 items-center shrink-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${w.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{w.active ? 'Activo' : 'Inactivo'}</span>
                <button onClick={() => accion.mutate({ id: w.id, que: 'prueba' })} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Enviar evento de prueba"><Send size={15} /></button>
                <button onClick={() => accion.mutate({ id: w.id, que: w.active ? 'desactivar' : 'activar' })} className="px-2.5 py-1 rounded border border-gray-300 text-xs font-semibold">{w.active ? 'Pausar' : 'Activar'}</button>
                <button onClick={() => setVerEntregas(verEntregas === w.id ? null : w.id)} className="px-2.5 py-1 rounded border border-gray-300 text-xs font-semibold">Entregas</button>
                <button onClick={() => confirm('¿Eliminar el webhook?') && accion.mutate({ id: w.id, que: 'eliminar' })} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
              </div>
            </div>
            {verEntregas === w.id && <Entregas endpointId={w.id} />}
          </div>
        ))}
        {(webhooks ?? []).length === 0 && <p className="text-center text-gray-500 py-8">Sin webhooks configurados.</p>}
      </div>
    </div>
  );
}

function Entregas({ endpointId }: { endpointId: string }) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['integraciones-entregas', endpointId],
    queryFn: () => integracionesApi.entregas(endpointId),
  });
  const reenviar = useMutation({
    mutationFn: (id: string) => integracionesApi.reenviar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integraciones-entregas', endpointId] }),
    onError: (e) => alert(mensajeDeError(e)),
  });
  return (
    <div className="mt-3 border-t border-gray-100 pt-2 text-xs">
      {(data ?? []).map((d) => (
        <div key={d.id} className="flex items-center justify-between gap-2 py-1.5">
          <span className="font-mono">{d.eventType}</span>
          <span className="text-gray-500">{new Date(d.createdAt).toLocaleString('es-CO')}</span>
          <span className={d.deliveredAt ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
            {d.deliveredAt ? `entregado (HTTP ${d.responseCode})` : `intento ${d.attempt}${d.lastError ? ` · ${d.lastError.slice(0, 40)}` : ''}`}
          </span>
          <button onClick={() => reenviar.mutate(d.id)} className="px-2 py-0.5 rounded border border-gray-300 font-semibold">Reenviar</button>
        </div>
      ))}
      {(data ?? []).length === 0 && <p className="text-gray-400 py-2">Sin entregas aún.</p>}
    </div>
  );
}

/* ----------------------------------------------------------------- Docs */

function DocsTab() {
  const origen = window.location.origin;
  return (
    <div className="bg-white rounded-lg shadow p-5 space-y-4 max-w-2xl">
      <h3 className="font-bold text-gray-900">Documentación para desarrolladores</h3>
      <a href={`${origen}/public/docs`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-bold">
        <BookOpen size={16} /> Abrir la referencia de /public/v1 (OpenAPI)
      </a>
      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-semibold text-gray-800">Guía rápida para WordPress (y cualquier web):</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>En la pestaña <strong>Widget</strong>, agrega el dominio del sitio y copia el fragmento.</li>
          <li>Pégalo en un bloque "HTML personalizado" de la página de admisiones.</li>
          <li>Opcional: escucha <code>virtualuni:application_submitted</code> para tus conversiones.</li>
        </ol>
        <p className="font-semibold text-gray-800 pt-2">Para el equipo de desarrollo:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Llave <code>sk_</code> solo en el servidor; con <code>pk_</code> el navegador puede leer el catálogo.</li>
          <li>Todos los POST llevan <code>Idempotency-Key</code>.</li>
          <li>Verifica los webhooks con la cabecera <code>VirtualUni-Signature</code> (HMAC-SHA256 de <code>t.cuerpo</code>).</li>
        </ul>
      </div>
    </div>
  );
}
