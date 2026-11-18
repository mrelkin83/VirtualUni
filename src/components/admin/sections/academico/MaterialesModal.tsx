import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Music,
  File,
  Lock,
} from 'lucide-react';
import { materialsApi, MaterialType } from '../../../../api/endpoints/materials';
import { uploadsApi, TAMANIO_MAXIMO_MB } from '../../../../api/endpoints/uploads';
import {
  ACCEPT_MATERIALES,
  COLOR_TIPO,
  ETIQUETA_TIPO,
  formatearKb,
  tipoDeMaterialPorMime,
} from '../../../../utils/materiales';
import { comoArreglo } from '../../../../utils/respuestaApi';
import { useModalA11y } from '../../../../hooks/useModalA11y';
import { mensajeDeError } from './errores';

const iconoDe = (tipo: MaterialType) => {
  switch (tipo) {
    case 'VIDEO':
      return <Video size={18} className="text-purple-500" />;
    case 'IMAGEN':
      return <ImageIcon size={18} className="text-green-500" />;
    case 'ENLACE':
      return <LinkIcon size={18} className="text-indigo-500" />;
    case 'AUDIO':
      return <Music size={18} className="text-pink-500" />;
    case 'PRESENTACION':
      return <FileText size={18} className="text-orange-500" />;
    case 'DOCUMENTO':
      return <FileText size={18} className="text-blue-500" />;
    default:
      return <File size={18} className="text-gray-500" />;
  }
};

interface MaterialListado {
  id: string;
  nombre: string;
  descripcion?: string | null;
  tipo: MaterialType;
  url: string;
  formato?: string | null;
  tamanioKb?: number | null;
  visible: boolean;
  descargas: number;
  /** Lo calcula el backend: 'asignatura' = contenido maestro heredado. */
  origen?: 'asignatura' | 'grupo';
}

/**
 * Un material cuelga de la asignatura (contenido maestro, lo heredan todos sus
 * grupos en cualquier periodo) o de un grupo concreto (solo lo ven sus
 * matriculados). El backend exige exactamente uno de los dos, así que el
 * destino es la única diferencia real entre los dos modos de este modal.
 */
export type DestinoMaterial =
  | { tipo: 'asignatura'; id: string; nombre: string }
  | { tipo: 'grupo'; id: string; nombre: string };

/**
 * Alta y gestión de materiales (videos, PDF, Word, Excel, presentaciones,
 * guías, enlaces) desde el panel de administración.
 *
 * El backend ya aceptaba estos materiales y exigía ser editor de la asignatura
 * para el contenido maestro — un TENANT_ADMIN siempre lo es — pero no había
 * forma de crearlos desde la interfaz del administrador: solo se llegaba a
 * ellos promoviendo un material ya subido por un docente.
 */
export function MaterialesModal({
  destino,
  onClose,
}: {
  destino: DestinoMaterial;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(true, onClose);
  const esAsignatura = destino.tipo === 'asignatura';

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<MaterialType>('DOCUMENTO');
  const [url, setUrl] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [visible, setVisible] = useState(true);
  // Un `<input type="file">` no se controla por valor: para que deje de
  // mostrar el nombre del archivo descartado hay que remontarlo.
  const [claveInputArchivo, setClaveInputArchivo] = useState(0);

  const quitarArchivo = () => {
    setArchivo(null);
    setClaveInputArchivo((n) => n + 1);
  };

  const claveLista = ['materiales-admin', destino.tipo, destino.id];

  const { data, isLoading, error } = useQuery({
    queryKey: claveLista,
    queryFn: () =>
      materialsApi.getAll(esAsignatura ? { subjectId: destino.id } : { courseId: destino.id }),
  });

  const materiales: MaterialListado[] = comoArreglo((data as any)?.data);

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['materiales-admin'] });
    // El panel del docente lista el contenido del grupo incluyendo el maestro
    // de su asignatura, así que también se queda obsoleto.
    queryClient.invalidateQueries({ queryKey: ['materiales-grupo'] });
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setTipo('DOCUMENTO');
    setUrl('');
    setVisible(true);
    quitarArchivo();
  };

  const crear = useMutation({
    mutationFn: async () => {
      let urlFinal = url.trim();
      let formato: string | undefined;
      let tamanioKb: number | undefined;

      // Si hay archivo manda el archivo: se sube primero y se guarda la URL
      // que devuelve el servidor, nunca una ruta local del navegador.
      if (archivo) {
        const { data: subido } = await uploadsApi.subir(archivo, 'materiales');
        urlFinal = subido.url;
        formato = subido.formato;
        tamanioKb = subido.tamanioKb;
      }

      await materialsApi.create({
        ...(esAsignatura ? { subjectId: destino.id } : { courseId: destino.id }),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        tipo,
        url: urlFinal,
        formato,
        tamanioKb,
        visible,
      });
    },
    onSuccess: () => {
      limpiarFormulario();
      invalidar();
    },
    onError: (e) => alert(mensajeDeError(e)),
  });

  const alternarVisible = useMutation({
    mutationFn: (material: MaterialListado) =>
      materialsApi.update(material.id, { visible: !material.visible }),
    onSuccess: invalidar,
    onError: (e) => alert(mensajeDeError(e)),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => materialsApi.delete(id),
    onSuccess: invalidar,
    onError: (e) => alert(mensajeDeError(e)),
  });

  const elegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > TAMANIO_MAXIMO_MB * 1024 * 1024) {
      alert(
        `"${file.name}" pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo es ` +
          `${TAMANIO_MAXIMO_MB} MB. Para un video grande, súbelo a un hosting y agrégalo como enlace.`,
      );
      e.target.value = '';
      return;
    }

    setArchivo(file);
    setUrl('');
    setTipo(tipoDeMaterialPorMime(file.type));
    if (!nombre) setNombre(file.name.replace(/\.[^.]+$/, ''));
  };

  const puedeGuardar = !!nombre.trim() && (!!archivo || !!url.trim()) && !crear.isPending;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Materiales de ${destino.nombre}`}
        tabIndex={-1}
        className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-gray-900">
            {esAsignatura ? 'Contenido de la asignatura' : 'Materiales del grupo'}
          </h3>
          <button onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          {esAsignatura ? (
            <>
              Material maestro de <strong>{destino.nombre}</strong>: lo heredan todos los grupos
              que la dictan, en cualquier periodo. Lo que suba un docente para su grupo no
              aparece aquí hasta que lo promueva.
            </>
          ) : (
            <>
              Material propio de <strong>{destino.nombre}</strong>: solo lo ven sus matriculados.
              Abajo también se lista el contenido heredado de la asignatura, que se gestiona
              desde la pestaña Asignaturas.
            </>
          )}
        </p>

        {/* ---------------------------------------------------- Alta */}
        <div className="border border-gray-200 rounded-lg p-4 mb-5 space-y-3 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="cm-nombre">
                Nombre *
              </label>
              <input
                id="cm-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Guía de laboratorio 1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="cm-tipo">
                Tipo *
              </label>
              <select
                id="cm-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as MaterialType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {(Object.keys(ETIQUETA_TIPO) as MaterialType[]).map((t) => (
                  <option key={t} value={t}>
                    {ETIQUETA_TIPO[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="cm-desc">
              Descripción
            </label>
            <input
              id="cm-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Opcional: unidad, tema o indicaciones"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="cm-archivo">
                Archivo
              </label>
              <input
                id="cm-archivo"
                key={claveInputArchivo}
                type="file"
                accept={ACCEPT_MATERIALES}
                onChange={elegirArchivo}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              />
              {archivo ? (
                <p className="text-xs text-green-600 mt-1">
                  {archivo.name} · {(archivo.size / 1024 / 1024).toFixed(2)} MB{' '}
                  <button
                    type="button"
                    onClick={quitarArchivo}
                    className="text-red-600 hover:underline"
                  >
                    quitar
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  PDF, Word, Excel, PowerPoint, imagen, video o audio. Hasta {TAMANIO_MAXIMO_MB} MB.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="cm-url">
                ...o enlace externo
              </label>
              <input
                id="cm-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={!!archivo}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                YouTube, Drive o cualquier recurso ya publicado fuera.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
              />
              Visible para los estudiantes
            </label>
            <button
              onClick={() => crear.mutate()}
              disabled={!puedeGuardar}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              <Upload size={16} />
              {crear.isPending ? 'Guardando...' : 'Agregar material'}
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- Listado */}
        {isLoading && <p className="text-sm text-gray-500">Cargando contenido...</p>}
        {error != null && <p className="text-sm text-red-600">{mensajeDeError(error)}</p>}

        <ul className="divide-y divide-gray-100">
          {materiales.map((material) => {
            // En la vista de un grupo, el contenido heredado se muestra pero no
            // se toca: ocultarlo o borrarlo desde aquí lo cambiaría para todos
            // los demás grupos de la asignatura sin avisar.
            const heredado = !esAsignatura && material.origen === 'asignatura';
            return (
              <li key={material.id} className="py-3 flex items-start gap-3">
                <span className="mt-0.5">{iconoDe(material.tipo)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{material.nombre}</p>
                  {material.descripcion && (
                    <p className="text-xs text-gray-500 truncate">{material.descripcion}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded ${COLOR_TIPO[material.tipo]}`}>
                      {ETIQUETA_TIPO[material.tipo]}
                    </span>
                    <span>{formatearKb(material.tamanioKb)}</span>
                    <span>{material.descargas} descarga(s)</span>
                    {!material.visible && <span className="text-amber-600 font-medium">Oculto</span>}
                    {heredado && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Heredado de la asignatura
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      uploadsApi
                        .abrir(material.url)
                        .catch(() => alert('No se pudo abrir el material.'))
                    }
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                    title="Abrir"
                  >
                    <Eye size={15} />
                  </button>
                  {heredado ? (
                    <span
                      className="p-1.5 text-gray-400"
                      title="Se gestiona en la asignatura: cambiarlo aquí afectaría a todos sus grupos"
                    >
                      <Lock size={15} />
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => alternarVisible.mutate(material)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                        title={
                          material.visible
                            ? 'Ocultar a los estudiantes'
                            : 'Mostrar a los estudiantes'
                        }
                      >
                        {material.visible ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${material.nombre}"?`)) {
                            eliminar.mutate(material.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
          {!isLoading && materiales.length === 0 && (
            <li className="py-8 text-center text-sm text-gray-500">
              {esAsignatura
                ? 'La asignatura todavía no tiene contenido maestro.'
                : 'El grupo todavía no tiene materiales.'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
