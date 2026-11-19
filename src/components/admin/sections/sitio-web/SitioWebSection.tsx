import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Globe, Plus, Save, Trash2, Upload } from 'lucide-react';
import { sitioWebApi, wompiTenantApi, SitioConfig, HeroSlide } from '../../../../api/endpoints/sitio-web';
import { uploadsApi } from '../../../../api/endpoints/uploads';
import { mensajeDeError } from '../academico/errores';

/**
 * Formulario del sitio web público (Fase 2: secciones esenciales). Cada
 * tarjeta edita una parte de TenantSite; Guardar manda solo los campos del
 * DTO. La vista previa abre la raíz del host con ?preview=<token-firmado>,
 * que funciona aunque el sitio no esté publicado (en desarrollo requiere el
 * nginx de producción: la SPA de Vite no enruta la raíz al backend).
 */
export function SitioWebSection() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['sitio-web-config'],
    queryFn: sitioWebApi.obtener,
  });

  const [form, setForm] = useState<Partial<SitioConfig> | null>(null);
  useEffect(() => {
    if (data && !form) setForm(data.site);
  }, [data, form]);

  const guardar = useMutation({
    mutationFn: (cambios: Partial<SitioConfig>) => sitioWebApi.guardar(cambios),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sitio-web-config'] }),
    onError: (e) => alert(mensajeDeError(e)),
  });

  if (isLoading || !form) return <p className="text-gray-500 text-sm p-6">Cargando configuración…</p>;
  if (error != null) return <p className="text-red-600 text-sm p-6">{mensajeDeError(error)}</p>;
  const { programas, previewToken } = data!;

  const slide: HeroSlide = form.heroSlides?.[0] ?? { title: '' };
  const setSlide = (c: Partial<HeroSlide>) =>
    setForm({ ...form, heroSlides: [{ ...slide, ...c }] });

  const enviar = () => {
    const {
      institutionType, published, siteMode, externalWebsiteUrl, heroSlides,
      showHeroSearch, sections, benefits, stats, featuredProgramIds, levelLabels,
      contact, whatsappNumber, whatsappMessage, seoTitle, seoDescription,
      analytics, paymentInstructions, privacyPolicy, privacyPolicyUrl, privacyVersion, dataControllerName,
    } = form;
    guardar.mutate({
      institutionType, published, siteMode,
      externalWebsiteUrl: externalWebsiteUrl || undefined,
      heroSlides, showHeroSearch, sections,
      benefits: benefits ?? undefined,
      stats: stats ?? undefined,
      featuredProgramIds, levelLabels: levelLabels ?? undefined,
      contact: contact ?? undefined,
      whatsappNumber: whatsappNumber || undefined,
      whatsappMessage: whatsappMessage || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      analytics: analytics ?? undefined,
      paymentInstructions: paymentInstructions || undefined,
      privacyPolicy: privacyPolicy || undefined,
      privacyPolicyUrl: privacyPolicyUrl || undefined,
      privacyVersion, dataControllerName: dataControllerName || undefined,
    });
  };

  const subirImagenHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Solo imágenes.');
    if (file.size > 2 * 1024 * 1024) return alert('La imagen del hero debe pesar 2 MB o menos.');
    try {
      const { data: subido } = await uploadsApi.subir(file, 'portadas');
      setSlide({ imageUrl: subido.url });
    } catch (err) {
      alert(mensajeDeError(err));
    }
  };

  const campo = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm';
  const etiqueta = 'block text-xs font-medium text-gray-700 mb-1';

  const lista = <T,>(arr: T[] | null | undefined): T[] => arr ?? [];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* ------------------------------------------------ cabecera */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="text-emerald-600" /> Sitio web público
          </h2>
          <p className="text-sm text-gray-500">
            La página que ven los aspirantes en el dominio de la institución.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`${window.location.origin}/?preview=${previewToken}`}
            target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold flex items-center gap-2 hover:border-emerald-500"
          >
            <Eye size={16} /> Vista previa
          </a>
          <button
            onClick={() => guardar.mutate({ published: !form.published })}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${form.published ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {form.published ? 'Despublicar' : 'Publicar sitio'}
          </button>
          <button
            onClick={enviar}
            disabled={guardar.isPending}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} /> {guardar.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      {!form.published && (
        <p className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
          El sitio está <strong>despublicado</strong>: los visitantes ven un 404. Usa la vista previa para revisarlo antes de publicar.
        </p>
      )}

      {/* ------------------------------------------------ general */}
      <section className="bg-white rounded-lg shadow p-5 space-y-4">
        <h3 className="font-bold text-gray-900">General</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={etiqueta}>Tipo de institución</label>
            <select
              value={form.institutionType}
              onChange={(e) => setForm({ ...form, institutionType: e.target.value })}
              className={campo}
            >
              <option value="COLEGIO">Colegio</option>
              <option value="ETDH">ETDH (formación laboral)</option>
              <option value="TECNICA_PROFESIONAL">Institución técnica profesional</option>
              <option value="TECNOLOGICA">Institución tecnológica</option>
              <option value="UNIVERSITARIA">Institución universitaria</option>
              <option value="UNIVERSIDAD">Universidad</option>
              <option value="MIXTA">Mixta (ofrece varios tipos)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Solo cambia los textos por defecto; lo que otorga cada programa sale de su nivel.
            </p>
          </div>
          <div>
            <label className={etiqueta}>Modo del sitio</label>
            <select
              value={form.siteMode}
              onChange={(e) => setForm({ ...form, siteMode: e.target.value as SitioConfig['siteMode'] })}
              className={campo}
            >
              <option value="FULL">Sitio completo (portada + oferta + inscripción)</option>
              <option value="ADMISSIONS_ONLY">Solo admisiones (ya tenemos web propia)</option>
              <option value="OFF">Apagado</option>
            </select>
            {form.siteMode === 'ADMISSIONS_ONLY' && (
              <input
                value={form.externalWebsiteUrl ?? ''}
                onChange={(e) => setForm({ ...form, externalWebsiteUrl: e.target.value })}
                placeholder="https://www.nuestrocolegio.edu.co"
                className={`${campo} mt-2`}
              />
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ hero */}
      <section className="bg-white rounded-lg shadow p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Hero de la portada</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={etiqueta}>Título *</label>
            <input value={slide.title} onChange={(e) => setSlide({ title: e.target.value })} maxLength={120} className={campo} />
          </div>
          <div>
            <label className={etiqueta}>Subtítulo</label>
            <input value={slide.subtitle ?? ''} onChange={(e) => setSlide({ subtitle: e.target.value })} maxLength={220} className={campo} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className={etiqueta}>Imagen de fondo (≤ 2 MB)</label>
            <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-emerald-500">
              <Upload size={15} /> {slide.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
              <input type="file" accept="image/*" onChange={subirImagenHero} className="hidden" />
            </label>
            {slide.imageUrl && (
              <button onClick={() => setSlide({ imageUrl: null })} className="text-xs text-red-600 hover:underline mt-1">
                Quitar imagen
              </button>
            )}
          </div>
          <div>
            <label className={etiqueta}>Oscurecido de la imagen ({Math.round(((slide.overlay ?? 0.5) as number) * 100)}%)</label>
            <input
              type="range" min={0} max={0.85} step={0.05}
              value={slide.overlay ?? 0.5}
              onChange={(e) => setSlide({ overlay: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.showHeroSearch ?? true}
              onChange={(e) => setForm({ ...form, showHeroSearch: e.target.checked })}
            />
            Mostrar buscador "¿Qué quieres estudiar?"
          </label>
        </div>
      </section>

      {/* ------------------------------------------------ destacados */}
      <section className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-bold text-gray-900">Programas destacados en la portada</h3>
        <p className="text-xs text-gray-500">Si no eliges ninguno, se muestran los primeros publicados.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {programas.filter((p) => p.isPublished).map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={(form.featuredProgramIds ?? []).includes(p.id)}
                onChange={(e) => {
                  const actual = form.featuredProgramIds ?? [];
                  setForm({
                    ...form,
                    featuredProgramIds: e.target.checked
                      ? [...actual, p.id]
                      : actual.filter((id) => id !== p.id),
                  });
                }}
              />
              {p.name}
            </label>
          ))}
          {programas.filter((p) => p.isPublished).length === 0 && (
            <p className="text-sm text-gray-500 col-span-2">
              Aún no hay programas publicados: publícalos desde Gestión académica → Programas (icono 🌐).
            </p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ beneficios y cifras */}
      <section className="bg-white rounded-lg shadow p-5 space-y-4">
        <h3 className="font-bold text-gray-900">"Por qué estudiar aquí" y cifras</h3>
        <div className="space-y-2">
          {lista(form.benefits).map((b, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={b.title} maxLength={60} placeholder="Título"
                onChange={(e) => {
                  const arr = [...lista(form.benefits)]; arr[i] = { ...b, title: e.target.value };
                  setForm({ ...form, benefits: arr });
                }}
                className={`${campo} w-56`}
              />
              <input
                value={b.text} maxLength={220} placeholder="Texto corto"
                onChange={(e) => {
                  const arr = [...lista(form.benefits)]; arr[i] = { ...b, text: e.target.value };
                  setForm({ ...form, benefits: arr });
                }}
                className={campo}
              />
              <button
                onClick={() => setForm({ ...form, benefits: lista(form.benefits).filter((_, j) => j !== i) })}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              ><Trash2 size={15} /></button>
            </div>
          ))}
          {lista(form.benefits).length < 6 && (
            <button
              onClick={() => setForm({ ...form, benefits: [...lista(form.benefits), { title: '', text: '' }] })}
              className="text-sm text-emerald-700 font-semibold flex items-center gap-1"
            ><Plus size={15} /> Agregar beneficio</button>
          )}
        </div>
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {lista(form.stats).map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s.value} maxLength={12} placeholder="2.500+"
                onChange={(e) => {
                  const arr = [...lista(form.stats)]; arr[i] = { ...s, value: e.target.value };
                  setForm({ ...form, stats: arr });
                }}
                className={`${campo} w-32`}
              />
              <input
                value={s.label} maxLength={40} placeholder="egresados"
                onChange={(e) => {
                  const arr = [...lista(form.stats)]; arr[i] = { ...s, label: e.target.value };
                  setForm({ ...form, stats: arr });
                }}
                className={campo}
              />
              <button
                onClick={() => setForm({ ...form, stats: lista(form.stats).filter((_, j) => j !== i) })}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              ><Trash2 size={15} /></button>
            </div>
          ))}
          {lista(form.stats).length < 6 && (
            <button
              onClick={() => setForm({ ...form, stats: [...lista(form.stats), { value: '', label: '' }] })}
              className="text-sm text-emerald-700 font-semibold flex items-center gap-1"
            ><Plus size={15} /> Agregar cifra</button>
          )}
          <p className="text-xs text-gray-500">Las cifras las escribe la institución; el sistema no las inventa.</p>
        </div>
      </section>

      {/* ------------------------------------------------ categorías públicas */}
      <section className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-bold text-gray-900">Categorías de la oferta</h3>
        <p className="text-xs text-gray-500">
          Renombra u oculta las categorías del filtro de nivel. Solo aparecen las que tienen programas publicados.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {Object.entries(data!.categorias).map(([slugCat, etiquetaBase]) => {
            const actual = form.levelLabels?.[slugCat] ?? {};
            return (
              <div key={slugCat} className="flex items-center gap-2">
                <input
                  placeholder={etiquetaBase}
                  value={actual.label ?? ''}
                  maxLength={40}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      levelLabels: { ...form.levelLabels, [slugCat]: { ...actual, label: e.target.value || undefined } },
                    })
                  }
                  className={campo}
                />
                <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                  <input
                    type="checkbox"
                    checked={!!actual.hidden}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        levelLabels: { ...form.levelLabels, [slugCat]: { ...actual, hidden: e.target.checked || undefined } },
                      })
                    }
                  />
                  ocultar
                </label>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------ contacto */}
      <section className="bg-white rounded-lg shadow p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Contacto y WhatsApp</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <input placeholder="Dirección" value={form.contact?.direccion ?? ''} maxLength={160}
            onChange={(e) => setForm({ ...form, contact: { ...form.contact, direccion: e.target.value } })} className={campo} />
          <input placeholder="Teléfono fijo" value={form.contact?.telefono ?? ''} maxLength={40}
            onChange={(e) => setForm({ ...form, contact: { ...form.contact, telefono: e.target.value } })} className={campo} />
          <input placeholder="Correo de admisiones" value={form.contact?.email ?? ''} maxLength={160}
            onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} className={campo} />
          <input placeholder="Horario de atención" value={form.contact?.horario ?? ''} maxLength={120}
            onChange={(e) => setForm({ ...form, contact: { ...form.contact, horario: e.target.value } })} className={campo} />
          <input placeholder="WhatsApp (solo dígitos, con indicativo: 573001112233)" value={form.whatsappNumber ?? ''} maxLength={15}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value.replace(/\D/g, '') })} className={campo} />
          <input placeholder="Mensaje prellenado de WhatsApp" value={form.whatsappMessage ?? ''} maxLength={300}
            onChange={(e) => setForm({ ...form, whatsappMessage: e.target.value })} className={campo} />
        </div>
      </section>

      {/* ------------------------------------------------ SEO y medición */}
      <section className="bg-white rounded-lg shadow p-5 space-y-4">
        <h3 className="font-bold text-gray-900">SEO y medición</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={etiqueta}>Título para Google (≤ 70)</label>
            <input value={form.seoTitle ?? ''} maxLength={70}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className={campo} />
          </div>
          <div>
            <label className={etiqueta}>Descripción para Google (≤ 170)</label>
            <input value={form.seoDescription ?? ''} maxLength={170}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className={campo} />
          </div>
          <input placeholder="Google Analytics 4 (G-XXXXXXX)" value={form.analytics?.ga4 ?? ''}
            onChange={(e) => setForm({ ...form, analytics: { ...form.analytics, ga4: e.target.value || undefined } })} className={campo} />
          <input placeholder="Google Tag Manager (GTM-XXXXXX)" value={form.analytics?.gtm ?? ''}
            onChange={(e) => setForm({ ...form, analytics: { ...form.analytics, gtm: e.target.value || undefined } })} className={campo} />
          <input placeholder="Meta Pixel (solo números)" value={form.analytics?.metaPixel ?? ''}
            onChange={(e) => setForm({ ...form, analytics: { ...form.analytics, metaPixel: e.target.value || undefined } })} className={campo} />
          <input placeholder="Conversión Google Ads (AW-XXXXXXX)" value={form.analytics?.adsConversion ?? ''}
            onChange={(e) => setForm({ ...form, analytics: { ...form.analytics, adsConversion: e.target.value || undefined } })} className={campo} />
        </div>
        <p className="text-xs text-gray-500">Sin identificador configurado no se carga ningún script de terceros.</p>
      </section>

      {/* ------------------------------------------------ pago manual */}
      <section className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-bold text-gray-900">Instrucciones de pago de inscripción</h3>
        <p className="text-xs text-gray-500">
          Lo que ve el aspirante cuando su solicitud queda en "Pago pendiente": cuenta bancaria,
          Nequi, Daviplata… El dinero va directo a la institución.
        </p>
        <textarea
          rows={4} maxLength={5000}
          placeholder={'Ej:\nBancolombia Ahorros 123-456789-00 a nombre de la institución.\nNequi: 300 111 2233.\nEnvía el comprobante desde tu página de aspirante.'}
          value={form.paymentInstructions ?? ''}
          onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
          className={campo}
        />
      </section>

      <TarjetaWompi />

      {/* ------------------------------------------------ política de datos */}
      <section className="bg-white rounded-lg shadow p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Política de tratamiento de datos</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <input placeholder="Responsable del tratamiento (razón social)" value={form.dataControllerName ?? ''} maxLength={120}
            onChange={(e) => setForm({ ...form, dataControllerName: e.target.value })} className={campo} />
          <input placeholder="Versión (súbela al cambiar el texto)" value={form.privacyVersion ?? '1'} maxLength={10}
            onChange={(e) => setForm({ ...form, privacyVersion: e.target.value })} className={campo} />
        </div>
        <textarea
          rows={6} maxLength={30000}
          placeholder="Texto completo de la política (o deja la URL de abajo)"
          value={form.privacyPolicy ?? ''}
          onChange={(e) => setForm({ ...form, privacyPolicy: e.target.value })}
          className={campo}
        />
        <input placeholder="…o URL donde ya está publicada (https://)" value={form.privacyPolicyUrl ?? ''} maxLength={300}
          onChange={(e) => setForm({ ...form, privacyPolicyUrl: e.target.value })} className={campo} />
        <p className="text-xs text-gray-500">
          El aspirante acepta esta política (con fecha, IP y versión) al enviar su inscripción.
        </p>
      </section>
    </div>
  );
}

/**
 * Pagos en línea con la cuenta Wompi DE LA INSTITUCIÓN (§7). Las llaves son
 * write-only: se cifran en el servidor y aquí solo se ve "configurada".
 */
function TarjetaWompi() {
  const queryClient = useQueryClient();
  const { data: estado } = useQuery({ queryKey: ['wompi-tenant'], queryFn: wompiTenantApi.estado });
  const [publicKey, setPublicKey] = useState('');
  const [integrityKey, setIntegrityKey] = useState('');
  const [eventsKey, setEventsKey] = useState('');

  const guardar = useMutation({
    mutationFn: (extra: { active?: boolean } = {}) =>
      wompiTenantApi.guardar({
        publicKey: publicKey || undefined,
        integrityKey: integrityKey || undefined,
        eventsKey: eventsKey || undefined,
        ...extra,
      }),
    onSuccess: () => {
      setIntegrityKey(''); setEventsKey('');
      queryClient.invalidateQueries({ queryKey: ['wompi-tenant'] });
    },
    onError: (e) => alert(mensajeDeError(e)),
  });

  const campo = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm';

  return (
    <section className="bg-white rounded-lg shadow p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-gray-900">Pagos en línea (Wompi de la institución)</h3>
        {estado && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${estado.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {estado.active ? 'Activo' : 'Inactivo'}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500">
        El dinero de la inscripción llega directo a la cuenta Wompi de la institución. Las llaves
        secretas se cifran en el servidor y nunca se vuelven a mostrar.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          placeholder={estado?.publicKey ? `Pública: ${estado.publicKey.slice(0, 18)}…` : 'Llave pública (pub_test_/pub_prod_)'}
          value={publicKey} onChange={(e) => setPublicKey(e.target.value.trim())} className={campo}
        />
        <input
          type="password"
          placeholder={estado?.integrityConfigurada ? 'Integridad: configurada ✔' : 'Llave de integridad'}
          value={integrityKey} onChange={(e) => setIntegrityKey(e.target.value.trim())} className={campo}
        />
        <input
          type="password"
          placeholder={estado?.eventsConfigurada ? 'Eventos: configurada ✔' : 'Llave de eventos (webhook)'}
          value={eventsKey} onChange={(e) => setEventsKey(e.target.value.trim())} className={campo}
        />
      </div>
      <p className="text-xs text-gray-500">
        URL del webhook para el panel de Wompi:
        <code className="bg-gray-100 rounded px-1.5 py-0.5 ml-1">{window.location.origin}/public/payments/wompi/&lt;slug-institución&gt;</code>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => guardar.mutate({})}
          disabled={guardar.isPending || (!publicKey && !integrityKey && !eventsKey)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
        >Guardar llaves</button>
        {estado && (
          <button
            onClick={() => guardar.mutate({ active: !estado.active })}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${estado.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >{estado.active ? 'Desactivar' : 'Activar pagos en línea'}</button>
        )}
      </div>
    </section>
  );
}
