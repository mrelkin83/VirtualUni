import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Plus, Trash2, X } from 'lucide-react';
import { programasApi, Programa } from '../../../../api/endpoints/academico';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';
import { avisar } from '../../../ui';

/** Campos públicos que el tipo Programa del cliente aún no declara. */
type ProgramaPublicable = Programa & {
  slug?: string | null;
  isPublished?: boolean;
  shortDescription?: string | null;
  publicDescription?: string | null;
  graduateProfile?: string | null;
  occupationalProfile?: string | null;
  area?: string | null;
  schedule?: string | null;
  tuitionDisplay?: string | null;
  isNewUntil?: string | null;
  faq?: { q: string; a: string }[] | null;
};

const slugificar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

/**
 * Pestaña "Publicación" del programa: lo que se ve en el sitio web público.
 * Publicar exige slug + descripción corta + programa ACTIVO (lo valida el
 * backend; aquí solo se guía).
 */
export function PublicacionProgramaModal({
  programa,
  onClose,
}: {
  programa: ProgramaPublicable;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);

  const [slug, setSlug] = useState(programa.slug ?? slugificar(programa.name));
  const [publicado, setPublicado] = useState(!!programa.isPublished);
  const [shortDescription, setShortDescription] = useState(programa.shortDescription ?? '');
  const [publicDescription, setPublicDescription] = useState(programa.publicDescription ?? '');
  const [occupationalProfile, setOccupationalProfile] = useState(programa.occupationalProfile ?? '');
  const [graduateProfile, setGraduateProfile] = useState(programa.graduateProfile ?? '');
  const [area, setArea] = useState(programa.area ?? '');
  const [schedule, setSchedule] = useState(programa.schedule ?? '');
  const [tuitionDisplay, setTuitionDisplay] = useState(programa.tuitionDisplay ?? '');
  const [isNewUntil, setIsNewUntil] = useState(
    programa.isNewUntil ? String(programa.isNewUntil).slice(0, 10) : '',
  );
  const [faq, setFaq] = useState<{ q: string; a: string }[]>(programa.faq ?? []);

  const guardar = useMutation({
    mutationFn: () =>
      programasApi.actualizarPublicacion(programa.id, {
        slug: slug || undefined,
        isPublished: publicado,
        shortDescription,
        publicDescription: publicDescription || undefined,
        occupationalProfile: occupationalProfile || undefined,
        graduateProfile: graduateProfile || undefined,
        area: area || undefined,
        schedule: schedule || undefined,
        tuitionDisplay: tuitionDisplay || undefined,
        isNewUntil: isNewUntil ? new Date(isNewUntil).toISOString() : null,
        faq,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      queryClient.invalidateQueries({ queryKey: ['sitio-web-config'] });
      onClose();
    },
    onError: (e) => avisar.error(mensajeDeError(e)),
  });

  const campo = 'w-full border border-pn-line rounded-lg px-3 py-2 text-sm';
  const etiqueta = 'block text-xs font-medium text-pn-ink-2 mb-1';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Publicación de ${programa.name}`}
        tabIndex={-1}
        className="bg-pn-surface rounded-lg p-6 max-w-2xl w-full max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap justify-between items-center mb-1 gap-4">
          <h3 className="text-lg font-bold text-pn-ink flex items-center gap-2">
            <Globe size={18} className="text-pn-ok" /> Publicación en el sitio web
          </h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <p className="text-sm text-pn-ink-2 mb-5">{programa.name}</p>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={etiqueta}>Slug (URL pública) *</label>
              <input value={slug} onChange={(e) => setSlug(slugificar(e.target.value))} className={campo} />
              <p className="text-xs text-pn-muted mt-1 truncate">/programas/{slug || '…'}</p>
            </div>
            <div>
              <label className={etiqueta}>Área o facultad (directorio)</label>
              <input value={area} onChange={(e) => setArea(e.target.value)} maxLength={80} className={campo}
                placeholder="Contable y financiera" />
            </div>
          </div>

          <div>
            <label className={etiqueta}>
              Descripción corta (tarjeta) * — {shortDescription.length}/200
            </label>
            <textarea value={shortDescription} maxLength={200} rows={2}
              onChange={(e) => setShortDescription(e.target.value)} className={campo} />
          </div>

          <div>
            <label className={etiqueta}>Descripción completa (ficha)</label>
            <textarea value={publicDescription} maxLength={10000} rows={4}
              onChange={(e) => setPublicDescription(e.target.value)} className={campo} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={etiqueta}>Perfil ocupacional</label>
              <textarea value={occupationalProfile} maxLength={5000} rows={2}
                onChange={(e) => setOccupationalProfile(e.target.value)} className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Perfil de egreso</label>
              <textarea value={graduateProfile} maxLength={5000} rows={2}
                onChange={(e) => setGraduateProfile(e.target.value)} className={campo} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={etiqueta}>Jornada visible</label>
              <input value={schedule} onChange={(e) => setSchedule(e.target.value)} maxLength={120}
                placeholder="Nocturna / Fines de semana" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Valor (texto libre)</label>
              <input value={tuitionDisplay} onChange={(e) => setTuitionDisplay(e.target.value)} maxLength={80}
                placeholder="Desde $X por periodo" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Etiqueta NUEVO hasta</label>
              <input type="date" value={isNewUntil} onChange={(e) => setIsNewUntil(e.target.value)} className={campo} />
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-2">
            <label className={etiqueta}>Preguntas frecuentes</label>
            {faq.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input value={f.q} maxLength={200} placeholder="Pregunta"
                  onChange={(e) => setFaq(faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))}
                  className={`${campo} w-64`} />
                <input value={f.a} maxLength={1000} placeholder="Respuesta"
                  onChange={(e) => setFaq(faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))}
                  className={campo} />
                <button onClick={() => setFaq(faq.filter((_, j) => j !== i))}
                  className="p-2 text-pn-danger hover:bg-pn-danger-soft rounded"><Trash2 size={15} /></button>
              </div>
            ))}
            {faq.length < 10 && (
              <button onClick={() => setFaq([...faq, { q: '', a: '' }])}
                className="text-sm text-pn-ok font-semibold flex items-center gap-1">
                <Plus size={15} /> Agregar pregunta
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-pn-line">
            <label className="flex items-center gap-2 text-sm text-pn-ink-2">
              <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
              Visible en el sitio público
            </label>
            <button
              onClick={() => guardar.mutate()}
              disabled={guardar.isPending || (publicado && (!slug || !shortDescription.trim()))}
              className="bg-pn-ok text-pn-surface px-5 py-2 rounded-lg hover:bg-pn-ok disabled:opacity-50 text-sm font-semibold"
            >
              {guardar.isPending ? 'Guardando…' : 'Guardar publicación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
