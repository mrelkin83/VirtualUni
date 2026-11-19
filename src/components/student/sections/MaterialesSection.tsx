import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Music,
  File,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { materialsApi, MaterialType } from '../../../api/endpoints/materials';
import { uploadsApi } from '../../../api/endpoints/uploads';
import { COLOR_TIPO, ETIQUETA_TIPO, formatearKb } from '../../../utils/materiales';
import { comoArreglo } from '../../../utils/respuestaApi';
import { avisar } from '../../ui';

interface MaterialEstudiante {
  id: string;
  nombre: string;
  descripcion?: string | null;
  tipo: MaterialType;
  url: string;
  tamanioKb?: number | null;
  origen?: 'asignatura' | 'grupo';
  course?: { id: string; name: string; code: string } | null;
  subject?: { id: string; name: string; code: string } | null;
}

const iconoDe = (tipo: MaterialType) => {
  switch (tipo) {
    case 'VIDEO':
      return <Video className="text-pn-accent-2-text" size={20} />;
    case 'IMAGEN':
      return <ImageIcon className="text-pn-ok" size={20} />;
    case 'ENLACE':
      return <LinkIcon className="text-pn-accent-2-text" size={20} />;
    case 'AUDIO':
      return <Music className="text-pn-accent-2-text" size={20} />;
    case 'PRESENTACION':
      return <FileText className="text-pn-warn" size={20} />;
    case 'DOCUMENTO':
      return <FileText className="text-pn-accent-text" size={20} />;
    default:
      return <File className="text-pn-muted" size={20} />;
  }
};

/**
 * Materiales del estudiante. Tira de GET /materials/my, que el backend ya
 * limita a los cursos matriculados y al contenido maestro de sus asignaturas,
 * y solo a lo marcado visible (findForStudent en materials.service.ts): aquí
 * no hace falta filtrar nada por seguridad.
 *
 * Autónomo: trae sus propios datos con react-query, igual que los paneles del
 * docente. El endpoint existía desde el principio pero no lo llamaba nadie, así
 * que el alumno nunca veía lo que subían sus profesores.
 */
export const MaterialesSection: React.FC = ({
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | MaterialType>('todos');
  const [abriendo, setAbriendo] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['materiales-estudiante'],
    queryFn: () => materialsApi.getMy(),
  });

  const materiales: MaterialEstudiante[] = comoArreglo((data as any)?.data);
  const suave = 'text-pn-ink-2';

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return materiales.filter((material) => {
      const coincideTipo = filtroTipo === 'todos' || material.tipo === filtroTipo;
      if (!termino) return coincideTipo;
      const texto = [
        material.nombre,
        material.descripcion ?? '',
        material.course?.name ?? '',
        material.subject?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return coincideTipo && texto.includes(termino);
    });
  }, [materiales, busqueda, filtroTipo]);

  /** Agrupa por grupo/asignatura para que no sea una lista plana sin contexto. */
  const grupos = useMemo(() => {
    const mapa = new Map<string, { titulo: string; items: MaterialEstudiante[] }>();
    for (const material of filtrados) {
      const titulo =
        material.course?.name ??
        (material.subject?.name
          ? `${material.subject.name} (todas las secciones)`
          : 'Sin curso');
      const clave = material.course?.id ?? material.subject?.id ?? 'sin-curso';
      if (!mapa.has(clave)) mapa.set(clave, { titulo, items: [] });
      mapa.get(clave)!.items.push(material);
    }
    return [...mapa.values()].sort((a, b) => a.titulo.localeCompare(b.titulo));
  }, [filtrados]);

  /**
   * Registrar la descarga no debe impedir abrir el material: si ese POST
   * falla, el contador se queda corto pero el alumno igual accede al archivo.
   */
  const abrir = async (material: MaterialEstudiante) => {
    setAbriendo(material.id);
    try {
      await materialsApi.download(material.id).catch(() => undefined);
      await uploadsApi.abrir(material.url);
    } catch {
      avisar.error('No se pudo abrir el material. Inténtalo de nuevo.');
    } finally {
      setAbriendo(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold text-pn-ink`}>Materiales</h2>
        <p className={`text-sm ${suave}`}>
          Todo lo que tus profesores publicaron en los cursos en los que estás matriculado.
        </p>
      </div>

      <div className={`bg-pn-surface rounded-lg shadow p-4 flex flex-wrap gap-3`}>
        <div className="relative flex-1 min-w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pn-muted" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, curso o asignatura..."
            aria-label="Buscar material"
            className={`w-full pl-9 pr-3 py-2 rounded-lg border border-pn-line bg-pn-surface text-pn-ink text-sm`}
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as 'todos' | MaterialType)}
          aria-label="Filtrar por tipo"
          className={`px-3 py-2 rounded-lg border border-pn-line bg-pn-surface text-pn-ink text-sm`}
        >
          <option value="todos">Todos los tipos</option>
          {(Object.keys(ETIQUETA_TIPO) as MaterialType[]).map((t) => (
            <option key={t} value={t}>
              {ETIQUETA_TIPO[t]}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className={`text-sm ${suave}`}>Cargando materiales...</p>}
      {error != null && (
        <p className="text-sm text-pn-danger">
          No se pudieron cargar los materiales. Revisa tu conexión y vuelve a intentarlo.
        </p>
      )}

      {!isLoading && materiales.length === 0 && (
        <div className={`bg-pn-surface rounded-lg shadow p-10 text-center`}>
          <BookOpen className="mx-auto mb-3 text-pn-muted" size={40} />
          <p className={`font-medium text-pn-ink`}>Todavía no hay materiales publicados</p>
          <p className={`text-sm ${suave} mt-1`}>
            Cuando tus profesores suban guías, videos o lecturas, aparecerán aquí.
          </p>
        </div>
      )}

      {!isLoading && materiales.length > 0 && filtrados.length === 0 && (
        <p className={`text-sm ${suave}`}>Ningún material coincide con la búsqueda.</p>
      )}

      {grupos.map((grupo) => (
        <div key={grupo.titulo} className={`bg-pn-surface rounded-lg shadow overflow-hidden`}>
          <div className={`px-4 py-3 border-b border-pn-line flex items-center justify-between`}>
            <h3 className={`font-semibold text-pn-ink`}>{grupo.titulo}</h3>
            <span className={`text-xs ${suave}`}>{grupo.items.length} material(es)</span>
          </div>
          <ul className={`divide-y divide-pn-line`}>
            {grupo.items.map((material) => (
              <li key={material.id} className="p-4 flex items-start gap-3">
                <span className="mt-0.5">{iconoDe(material.tipo)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-pn-ink truncate`}>{material.nombre}</p>
                  {material.descripcion && (
                    <p className={`text-sm ${suave} truncate`}>{material.descripcion}</p>
                  )}
                  <p className={`text-xs ${suave} mt-1 flex items-center gap-2 flex-wrap`}>
                    <span className={`px-2 py-0.5 rounded ${COLOR_TIPO[material.tipo]}`}>
                      {ETIQUETA_TIPO[material.tipo]}
                    </span>
                    <span>{formatearKb(material.tamanioKb)}</span>
                    {material.origen === 'asignatura' && (
                      <span title="Contenido común de la asignatura, no solo de tu grupo">
                        De la asignatura
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => abrir(material)}
                  disabled={abriendo === material.id}
                  className="bg-pn-accent text-pn-accent-ink px-3 py-2 rounded-lg hover:bg-pn-accent-hover disabled:opacity-50 flex items-center gap-2 text-sm shrink-0"
                >
                  <ExternalLink size={16} />
                  {abriendo === material.id ? 'Abriendo...' : 'Abrir'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
