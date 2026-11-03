import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import {
  programasApi,
  Programa,
  ProgramaCreateDto,
  EducationLevel,
} from '../../../../api/endpoints/academico';
import {
  NIVELES,
  MODALIDADES,
  PERIODICIDADES,
  UNIDADES,
  ESTADOS_PROGRAMA,
  defaultsPorNivel,
} from './etiquetas';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';

// Los numéricos viajan como string del <input>; se convierten al enviar.
const enteroOpcional = z
  .string()
  .optional()
  .refine((v) => !v || /^\d+$/.test(v), 'Debe ser un número entero');

const esquema = z.object({
  code: z.string().min(1, 'El código es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  educationLevel: z.string().min(1, 'Seleccione el nivel'),
  modality: z.string().min(1, 'Seleccione la modalidad'),
  periodStructure: z.string().min(1, 'Seleccione la periodicidad'),
  academicUnit: z.string().min(1, 'Seleccione la unidad'),
  durationPeriods: enteroOpcional,
  totalCredits: enteroOpcional,
  totalHours: enteroOpcional,
  degreeTitle: z.string().optional(),
  officialCode: z.string().optional(),
  approvalAct: z.string().optional(),
  status: z.string().optional(),
});

type Valores = z.infer<typeof esquema>;

const PASOS = ['Datos generales', 'Estructura', 'Datos oficiales'] as const;
const CAMPOS_POR_PASO: (keyof Valores)[][] = [
  ['code', 'name', 'description'],
  ['educationLevel', 'modality', 'periodStructure', 'academicUnit', 'durationPeriods', 'totalCredits', 'totalHours'],
  ['degreeTitle', 'officialCode', 'approvalAct', 'status'],
];

export function ProgramaFormModal({
  programa,
  onClose,
}: {
  programa: Programa | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const [paso, setPaso] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: programa
      ? {
          code: programa.code,
          name: programa.name,
          description: programa.description ?? '',
          educationLevel: programa.educationLevel,
          modality: programa.modality,
          periodStructure: programa.periodStructure,
          academicUnit: programa.academicUnit,
          durationPeriods: programa.durationPeriods != null ? String(programa.durationPeriods) : '',
          totalCredits: programa.totalCredits != null ? String(programa.totalCredits) : '',
          totalHours: programa.totalHours != null ? String(programa.totalHours) : '',
          degreeTitle: programa.degreeTitle ?? '',
          officialCode: programa.officialCode ?? '',
          approvalAct: programa.approvalAct ?? '',
          status: programa.status,
        }
      : { status: 'BORRADOR' },
  });

  const nivelElegido = watch('educationLevel') as EducationLevel | undefined;
  const etiquetaNivel = nivelElegido ? defaultsPorNivel(nivelElegido).etiquetaNivel : 'Periodo';

  const guardar = useMutation({
    mutationFn: (datos: ProgramaCreateDto) =>
      programa ? programasApi.update(programa.id, datos) : programasApi.create(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      onClose();
    },
    onError: (err) => alert(mensajeDeError(err)),
  });

  const enviar = handleSubmit((valores) => {
    // Los opcionales vacíos no viajan: forbidNonWhitelisted no los rechaza,
    // pero un '' rompería las validaciones de longitud del backend.
    const limpio = (s?: string) => (s && s.trim() !== '' ? s : undefined);
    const aNumero = (s?: string) => (s && s.trim() !== '' ? Number(s) : undefined);
    guardar.mutate({
      code: valores.code,
      name: valores.name,
      description: limpio(valores.description),
      educationLevel: valores.educationLevel as ProgramaCreateDto['educationLevel'],
      modality: valores.modality as ProgramaCreateDto['modality'],
      periodStructure: valores.periodStructure as ProgramaCreateDto['periodStructure'],
      academicUnit: valores.academicUnit as ProgramaCreateDto['academicUnit'],
      durationPeriods: aNumero(valores.durationPeriods),
      totalCredits: aNumero(valores.totalCredits),
      totalHours: aNumero(valores.totalHours),
      degreeTitle: limpio(valores.degreeTitle),
      officialCode: limpio(valores.officialCode),
      approvalAct: limpio(valores.approvalAct),
      status: (limpio(valores.status) as ProgramaCreateDto['status']) ?? undefined,
    });
  });

  const siguiente = async () => {
    const valido = await trigger(CAMPOS_POR_PASO[paso]);
    if (valido) setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  };

  const campo = 'w-full p-2 border border-gray-300 rounded-lg text-sm';
  const etiqueta = 'block text-sm font-semibold mb-1 text-gray-700';
  const errorDe = (nombre: keyof Valores) =>
    errors[nombre] ? <p className="text-xs text-red-600 mt-1">{String(errors[nombre]?.message)}</p> : null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={programa ? 'Editar programa' : 'Nuevo programa'}
        tabIndex={-1}
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {programa ? 'Editar programa' : 'Nuevo programa'}
          </h3>
          <button onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
        </div>

        {/* Indicador de pasos */}
        <ol className="flex items-center gap-2 mb-6">
          {PASOS.map((nombre, i) => (
            <li key={nombre} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  i === paso ? 'bg-blue-600 text-white'
                  : i < paso ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-sm ${i === paso ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                {nombre}
              </span>
              {i < PASOS.length - 1 && <span className="text-gray-300">—</span>}
            </li>
          ))}
        </ol>

        <form onSubmit={enviar} className="space-y-4">
          {paso === 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={etiqueta}>Código *</label>
                  <input {...register('code')} placeholder="TEC-SOFT" className={campo} />
                  {errorDe('code')}
                </div>
                <div>
                  <label className={etiqueta}>Nombre *</label>
                  <input {...register('name')} placeholder="Tecnólogo en Desarrollo de Software" className={campo} />
                  {errorDe('name')}
                </div>
              </div>
              <div>
                <label className={etiqueta}>Descripción</label>
                <textarea {...register('description')} rows={3} className={campo} />
              </div>
            </>
          )}

          {paso === 1 && (
            <>
              <div>
                <label className={etiqueta}>Nivel de formación *</label>
                <select
                  {...register('educationLevel')}
                  className={campo}
                  onChange={(e) => {
                    const nivel = e.target.value as EducationLevel;
                    setValue('educationLevel', nivel, { shouldValidate: true });
                    // Precarga estructura sensata para el nivel elegido;
                    // el admin puede cambiarla después.
                    const defaults = defaultsPorNivel(nivel);
                    setValue('periodStructure', defaults.periodStructure);
                    setValue('academicUnit', defaults.academicUnit);
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {Object.entries(NIVELES).map(([valor, texto]) => (
                    <option key={valor} value={valor}>{texto}</option>
                  ))}
                </select>
                {errorDe('educationLevel')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={etiqueta}>Modalidad *</label>
                  <select {...register('modality')} className={campo}>
                    <option value="">Seleccionar...</option>
                    {Object.entries(MODALIDADES).map(([valor, texto]) => (
                      <option key={valor} value={valor}>{texto}</option>
                    ))}
                  </select>
                  {errorDe('modality')}
                </div>
                <div>
                  <label className={etiqueta}>Periodicidad *</label>
                  <select {...register('periodStructure')} className={campo}>
                    <option value="">Seleccionar...</option>
                    {Object.entries(PERIODICIDADES).map(([valor, texto]) => (
                      <option key={valor} value={valor}>{texto}</option>
                    ))}
                  </select>
                  {errorDe('periodStructure')}
                </div>
                <div>
                  <label className={etiqueta}>Unidad de medida *</label>
                  <select {...register('academicUnit')} className={campo}>
                    <option value="">Seleccionar...</option>
                    {Object.entries(UNIDADES).map(([valor, texto]) => (
                      <option key={valor} value={valor}>{texto}</option>
                    ))}
                  </select>
                  {errorDe('academicUnit')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={etiqueta}>Duración ({etiquetaNivel.toLowerCase()}s)</label>
                  <input type="number" min={1} {...register('durationPeriods')} className={campo} />
                  {errorDe('durationPeriods')}
                </div>
                <div>
                  <label className={etiqueta}>Total de créditos</label>
                  <input type="number" min={0} {...register('totalCredits')} className={campo} />
                  {errorDe('totalCredits')}
                </div>
                <div>
                  <label className={etiqueta}>Total de horas</label>
                  <input type="number" min={0} {...register('totalHours')} className={campo} />
                  {errorDe('totalHours')}
                </div>
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <div>
                <label className={etiqueta}>Título que otorga</label>
                <input {...register('degreeTitle')} placeholder="Tecnólogo en Desarrollo de Software" className={campo} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={etiqueta}>Código oficial (SNIES / registro ETDH)</label>
                  <input {...register('officialCode')} className={campo} />
                </div>
                <div>
                  <label className={etiqueta}>Acto de aprobación</label>
                  <input {...register('approvalAct')} placeholder="Resolución 1234 de 2026" className={campo} />
                </div>
              </div>
              <div>
                <label className={etiqueta}>Estado</label>
                <select {...register('status')} className={campo}>
                  {Object.entries(ESTADOS_PROGRAMA).map(([valor, texto]) => (
                    <option key={valor} value={valor}>{texto}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setPaso((p) => Math.max(p - 1, 0))}
              disabled={paso === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
            >
              Atrás
            </button>
            {paso < PASOS.length - 1 ? (
              <button
                type="button"
                onClick={siguiente}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || guardar.isPending}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {programa ? 'Guardar cambios' : 'Crear programa'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
