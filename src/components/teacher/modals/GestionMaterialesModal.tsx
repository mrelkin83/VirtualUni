import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Upload,
  FileText,
  Video,
  File,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Eye,
  Lock,
  Music,
} from 'lucide-react';
import { useModalA11y } from '../../../hooks/useModalA11y';
import { materialsApi, MaterialType } from '../../../api/endpoints/materials';
import { uploadsApi, TAMANIO_MAXIMO_MB } from '../../../api/endpoints/uploads';
import {
  ACCEPT_MATERIALES,
  ETIQUETA_TIPO,
  formatearKb,
  marcaDeTema,
  tipoDeMaterialPorMime,
} from '../../../utils/materiales';
import { comoArreglo } from '../../../utils/respuestaApi';

interface MaterialDelTema {
  id: string;
  nombre: string;
  descripcion?: string | null;
  tipo: MaterialType;
  url: string;
  tamanioKb?: number | null;
  descargas: number;
  origen?: 'asignatura' | 'grupo';
}

interface GestionMaterialesModalProps {
  tema: { id: string | number; titulo: string } | null;
  /** Grupo al que se suben los materiales (uuid del Course). */
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

const iconoDe = (tipo: MaterialType) => {
  switch (tipo) {
    case 'VIDEO':
      return <Video className="text-purple-600" size={20} />;
    case 'IMAGEN':
      return <ImageIcon className="text-green-600" size={20} />;
    case 'ENLACE':
      return <LinkIcon className="text-orange-600" size={20} />;
    case 'AUDIO':
      return <Music className="text-pink-600" size={20} />;
    case 'PRESENTACION':
      return <FileText className="text-orange-600" size={20} />;
    case 'DOCUMENTO':
      return <FileText className="text-blue-600" size={20} />;
    default:
      return <File className="text-gray-600" size={20} />;
  }
};

/**
 * Materiales de un tema del temario. Cada alta viaja al servidor en el momento
 * (subida + POST /materials); antes se acumulaban en memoria y se mandaban
 * todas juntas al cerrar, lo que reenviaba las ya existentes como duplicados y
 * cerraba el modal sin esperar la subida.
 */
export const GestionMaterialesModal: React.FC<GestionMaterialesModalProps> = ({
  tema,
  courseId,
  isOpen,
  onClose,
  darkMode,
  card,
  text,
  border,
}) => {
  const queryClient = useQueryClient();
  const dialogRef = useModalA11y(isOpen, onClose);

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<MaterialType>('DOCUMENTO');
  const [url, setUrl] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  // Un `<input type="file">` no se controla por valor: para que olvide el
  // archivo descartado hay que remontarlo.
  const [claveInputArchivo, setClaveInputArchivo] = useState(0);

  const marca = tema ? marcaDeTema(tema.titulo) : '';

  // Comparte clave con ContenidoDelGrupoPanel: lo que se suba aquí refresca
  // también el panel de contenido del grupo sin pedirlo dos veces.
  const { data, isLoading, error } = useQuery({
    queryKey: ['materiales-grupo', courseId],
    queryFn: () => materialsApi.getAll({ courseId }),
    enabled: isOpen && !!courseId,
  });

  const todos: MaterialDelTema[] = comoArreglo((data as any)?.data);
  const materiales = todos.filter((m) => (m.descripcion ?? '') === marca);

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['materiales-grupo', courseId] });
    queryClient.invalidateQueries({ queryKey: ['materiales-admin'] });
  };

  const limpiar = () => {
    setNombre('');
    setTipo('DOCUMENTO');
    setUrl('');
    setArchivo(null);
    setClaveInputArchivo((n) => n + 1);
  };

  const agregar = useMutation({
    mutationFn: async () => {
      let urlFinal = url.trim();
      let formato: string | undefined;
      let tamanioKb: number | undefined;

      // El archivo se sube primero y se guarda la URL que devuelve el
      // servidor, nunca un blob local del navegador (se perdía al recargar).
      if (archivo) {
        const { data: subido } = await uploadsApi.subir(archivo, 'materiales');
        urlFinal = subido.url;
        formato = subido.formato;
        tamanioKb = subido.tamanioKb;
      }

      await materialsApi.create({
        courseId,
        nombre: nombre.trim(),
        descripcion: marca,
        tipo,
        url: urlFinal,
        formato,
        tamanioKb,
      });
    },
    onSuccess: () => {
      limpiar();
      invalidar();
    },
    onError: (e: any) =>
      alert(
        'No se pudo agregar el material: ' +
          (e?.response?.data?.message || e?.message || 'error de conexión'),
      ),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => materialsApi.delete(id),
    onSuccess: invalidar,
    onError: (e: any) =>
      alert(
        'No se pudo eliminar: ' +
          (e?.response?.data?.message || e?.message || 'error de conexión'),
      ),
  });

  if (!isOpen || !tema) return null;

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

  const puedeAgregar = !!nombre.trim() && (!!archivo || !!url.trim()) && !agregar.isPending;
  const campo = `w-full px-4 py-2 border ${border} rounded-lg ${
    darkMode ? 'bg-gray-700 text-white' : 'bg-white'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-gestion-materiales"
        tabIndex={-1}
        className={`${card} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
      >
        <div
          className={`sticky top-0 bg-inherit p-6 border-b ${border} flex justify-between items-center`}
        >
          <div>
            <h2 id="titulo-gestion-materiales" className={`text-2xl font-bold ${text}`}>
              Gestión de Materiales
            </h2>
            <p className="text-sm text-gray-500 mt-1">Tema: {tema.titulo}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Formulario para agregar material */}
          <section className={`border ${border} rounded-lg p-4`}>
            <h3 className={`text-lg font-bold ${text} mb-4`}>Agregar Nuevo Material</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`} htmlFor="gm-tipo">
                    Tipo de Material
                  </label>
                  <select
                    id="gm-tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as MaterialType)}
                    className={campo}
                  >
                    {(Object.keys(ETIQUETA_TIPO) as MaterialType[]).map((t) => (
                      <option key={t} value={t}>
                        {ETIQUETA_TIPO[t]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`} htmlFor="gm-nombre">
                    Nombre del Material
                  </label>
                  <input
                    id="gm-nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={campo}
                    placeholder="Ej: Presentación Tema 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`} htmlFor="gm-archivo">
                    Archivo
                  </label>
                  <input
                    id="gm-archivo"
                    key={claveInputArchivo}
                    type="file"
                    accept={ACCEPT_MATERIALES}
                    onChange={elegirArchivo}
                    className={campo}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {archivo
                      ? `${archivo.name} · ${(archivo.size / 1024 / 1024).toFixed(2)} MB`
                      : `PDF, Word, Excel, PowerPoint, imagen, video o audio. Hasta ${TAMANIO_MAXIMO_MB} MB.`}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`} htmlFor="gm-url">
                    ...o enlace externo
                  </label>
                  <input
                    id="gm-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={!!archivo}
                    className={`${campo} disabled:opacity-50`}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    YouTube, Drive o cualquier recurso ya publicado fuera.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => agregar.mutate()}
                  disabled={!puedeAgregar}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Upload size={18} />
                  {agregar.isPending ? 'Subiendo...' : 'Agregar'}
                </button>
              </div>
            </div>
          </section>

          {/* Lista de materiales */}
          <section>
            <h3 className={`text-lg font-bold ${text} mb-4`}>
              Materiales del Tema ({materiales.length})
            </h3>

            {isLoading && <p className="text-sm text-gray-500">Cargando materiales...</p>}
            {error != null && (
              <p className="text-sm text-red-600">No se pudieron cargar los materiales.</p>
            )}

            {!isLoading && materiales.length === 0 ? (
              <div
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-8 text-center`}
              >
                <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500">No hay materiales agregados</p>
                <p className="text-sm text-gray-400 mt-1">
                  Agrega archivos, videos o enlaces para este tema
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {materiales.map((material) => {
                  // El contenido heredado de la asignatura se ve pero no se
                  // toca desde aquí: borrarlo afectaría a todos sus grupos.
                  const heredado = material.origen === 'asignatura';
                  return (
                    <div
                      key={material.id}
                      className={`flex items-center justify-between p-4 border ${border} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {iconoDe(material.tipo)}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${text} truncate`}>{material.nombre}</p>
                          <div className="flex gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                            <span>{ETIQUETA_TIPO[material.tipo]}</span>
                            <span>• {formatearKb(material.tamanioKb)}</span>
                            <span>• {material.descargas} descarga(s)</span>
                            {heredado && (
                              <span className="text-emerald-600">• Heredado de la asignatura</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() =>
                            uploadsApi
                              .abrir(material.url)
                              .catch(() => alert('No se pudo abrir el material.'))
                          }
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Abrir"
                        >
                          <Eye size={16} />
                        </button>
                        {heredado ? (
                          <span
                            className="p-2 text-gray-400"
                            title="Se gestiona en la asignatura: cambiarlo aquí afectaría a todos sus grupos"
                          >
                            <Lock size={16} />
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar "${material.nombre}"?`)) {
                                eliminar.mutate(material.id);
                              }
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className={`sticky bottom-0 bg-inherit border-t ${border} p-6 flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
