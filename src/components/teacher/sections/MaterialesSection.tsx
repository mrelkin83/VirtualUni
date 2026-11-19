import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Music,
  File,
  Folder,
  FolderOpen,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Grid,
  List,
  X,
  Share2,
  BarChart3,
  Clock
} from 'lucide-react';
import { Material, CarpetaMaterial } from '../../../types/teacher.types';
import { useToast } from '../../ui';
import { uploadsApi, TAMANIO_MAXIMO_MB } from '../../../api/endpoints/uploads';
import { ACCEPT_MATERIALES, TIPO_UI_POR_API, tipoDeMaterialPorMime } from '../../../utils/materiales';
import { ContenidoDelGrupoPanel } from './ContenidoDelGrupoPanel';
import { pulsable } from '../../../utils/pulsable';

/** Lo que el modal entrega: un archivo a subir o, si no, una URL externa. */
export type MaterialNuevo = Omit<Material, 'id'> & { archivo?: File | null };

interface MaterialesSectionProps {
  materiales: Material[];
  carpetas: CarpetaMaterial[];
  subirMaterial: (material: MaterialNuevo) => void;
  eliminarMaterial: (materialId: number) => void;
  editarMaterial: (materialId: number, material: Partial<Material>) => void;
  crearCarpeta: (carpeta: Omit<CarpetaMaterial, 'id'>) => void;
  eliminarCarpeta: (carpetaId: number) => void;
  editarCarpeta: (carpetaId: number, carpetaData: Partial<CarpetaMaterial>) => void;
  agregarMaterialCarpeta: (carpetaId: number, materialId: number) => void;
  removerMaterialCarpeta: (carpetaId: number, materialId: number) => void;
  moverMaterial: (materialId: number, carpetaIdOrigen: number | null, carpetaIdDestino: number | null) => void;
  cursosDisponibles?: any[];
}

export const MaterialesSection: React.FC<MaterialesSectionProps> = ({
  materiales,
  carpetas,
  subirMaterial,
  eliminarMaterial,
  crearCarpeta,
  eliminarCarpeta,
  editarCarpeta,
  cursosDisponibles = []
}) => {
  // Sustituye a los avisar.info() del navegador: no bloquean el hilo, se pueden
  // diseñar y viven en una región aria-live, así que un lector de pantalla
  // también se entera de que algo salió bien o mal.
  const avisos = useToast();
  const [vista, setVista] = useState<'grid' | 'lista'>('grid');
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroCurso, setFiltroCurso] = useState<string>('todos');
  const [modalSubir, setModalSubir] = useState(false);
  const [modalCarpeta, setModalCarpeta] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [carpetaAbierta, setCarpetaAbierta] = useState<CarpetaMaterial | null>(null);
  const [carpetaEnEdicion, setCarpetaEnEdicion] = useState<CarpetaMaterial | null>(null);
  const [modalEditarCarpeta, setModalEditarCarpeta] = useState(false);
  const [modalVerCarpeta, setModalVerCarpeta] = useState(false);

  const obtenerMaterialesCarpeta = (carpeta: CarpetaMaterial) => {
    return materiales.filter(m => carpeta.materiales.includes(m.id));
  };

  const [nuevoMaterial, setNuevoMaterial] = useState<MaterialNuevo>({
    nombre: '',
    tipo: 'documento',
    url: '',
    fechaSubida: new Date().toISOString().split('T')[0],
    curso: '',
    modulo: '',
    tema: '',
    tamaño: '',
    duracion: '',
    descargas: 0,
    vistas: 0,
    archivo: null
  });

  // Un `<input type="file">` no se puede controlar por valor: para que al
  // quitar el archivo deje de mostrar su nombre hay que remontarlo, y esta
  // clave es lo que lo fuerza.
  const [claveInputArchivo, setClaveInputArchivo] = useState(0);

  const quitarArchivo = () => {
    setNuevoMaterial((prev) => ({ ...prev, archivo: null, tamaño: '' }));
    setClaveInputArchivo((n) => n + 1);
  };

  /**
   * Al elegir un archivo se deduce el tipo de su MIME y se rellena el nombre
   * si estaba vacío. La URL queda en blanco a propósito: la definitiva es la
   * que devuelve el servidor al subirlo, no una ruta local.
   */
  const handleElegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > TAMANIO_MAXIMO_MB * 1024 * 1024) {
      avisos.error(
        `"${file.name}" pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo es ` +
          `${TAMANIO_MAXIMO_MB} MB. Para un video grande, súbelo a un hosting y agrégalo como enlace.`
      );
      e.target.value = '';
      return;
    }

    setNuevoMaterial((prev) => ({
      ...prev,
      archivo: file,
      url: '',
      nombre: prev.nombre || file.name.replace(/\.[^.]+$/, ''),
      tipo: (TIPO_UI_POR_API[tipoDeMaterialPorMime(file.type)] || 'otro') as Material['tipo'],
      tamaño: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    }));
  };

  const [nuevaCarpeta, setNuevaCarpeta] = useState({
    nombre: '',
    curso: '',
    materiales: []
  });

  const materialesFiltrados = materiales.filter(material => {
    const matchBusqueda = material.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         material.curso.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || material.tipo === filtroTipo;
    const matchCurso = filtroCurso === 'todos' || material.curso === filtroCurso;
    return matchBusqueda && matchTipo && matchCurso;
  });

  const cursos = Array.from(new Set(materiales.map(m => m.curso)));

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="text-pn-danger" size={24} />;
      case 'video':
        return <Video className="text-pn-accent-2-text" size={24} />;
      case 'documento':
        return <File className="text-pn-accent-text" size={24} />;
      case 'presentacion':
        return <FileText className="text-pn-warn" size={24} />;
      case 'imagen':
        return <ImageIcon className="text-pn-ok" size={24} />;
      case 'audio':
        return <Music className="text-pn-accent-2-text" size={24} />;
      case 'enlace':
        return <LinkIcon className="text-pn-accent-2-text" size={24} />;
      default:
        return <File className="text-pn-muted" size={24} />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return 'bg-pn-danger-soft text-pn-danger';
      case 'video':
        return 'bg-pn-accent-2-soft text-pn-accent-2-text';
      case 'documento':
        return 'bg-pn-accent-soft text-pn-accent-text';
      case 'presentacion':
        return 'bg-pn-warn-soft text-pn-warn';
      case 'imagen':
        return 'bg-pn-ok-soft text-pn-ok';
      case 'audio':
        return 'bg-pn-accent-2-soft text-pn-accent-2-text';
      case 'enlace':
        return 'bg-pn-accent-2-soft text-pn-accent-2-text';
      default:
        return 'bg-pn-surface-3 text-pn-ink';
    }
  };

  const handleSubirMaterial = () => {
    if (!nuevoMaterial.nombre || !nuevoMaterial.curso) {
      avisos.error('Completa el nombre y el curso para poder subir el material.');
      return;
    }

    // Un archivo o un enlace, cualquiera de los dos sirve; ninguno, no.
    if (!nuevoMaterial.archivo && !nuevoMaterial.url) {
      avisos.error('Elige un archivo para subir o indica el enlace del material.');
      return;
    }

    subirMaterial(nuevoMaterial);
    setModalSubir(false);
    setNuevoMaterial({
      nombre: '',
      tipo: 'documento',
      url: '',
      fechaSubida: new Date().toISOString().split('T')[0],
      curso: '',
      modulo: '',
      tema: '',
      tamaño: '',
      duracion: '',
      descargas: 0,
      vistas: 0,
      archivo: null
    });
    setClaveInputArchivo((n) => n + 1);
  };

  const handleCrearCarpeta = () => {
    if (!nuevaCarpeta.nombre || !nuevaCarpeta.curso) {
      avisos.error('Completa todos los campos obligatorios.');
      return;
    }

    crearCarpeta(nuevaCarpeta as any);
    setModalCarpeta(false);
    setNuevaCarpeta({
      nombre: '',
      curso: '',
      materiales: []
    });
  };

  const abrirDetalleMaterial = (material: Material) => {
    setMaterialSeleccionado(material);
    setModalDetalle(true);
  };

  const compartirMaterial = (material: Material) => {
    const textoCompartir = `${material.nombre}\n\nCurso: ${material.curso}\nURL: ${material.url}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(material.url);
      avisos.ok('Enlace copiado al portapapeles.');
    } else {
      avisos.info(textoCompartir);
    }
  };

  const estadisticas = {
    total: materiales.length,
    videos: materiales.filter(m => m.tipo === 'video').length,
    documentos: materiales.filter(m => m.tipo === 'documento' || m.tipo === 'pdf').length,
    otros: materiales.filter(m => !['video', 'documento', 'pdf'].includes(m.tipo)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold text-pn-ink`}>Gestión de Materiales</h2>
          <p className={`text-pn-ink opacity-70 mt-1`}>
            Sube, organiza y comparte recursos educativos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalCarpeta(true)}
            className="bg-pn-ok text-pn-surface px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pn-ok transition"
          >
            <Folder size={20} />
            Nueva Carpeta
          </button>
          <button
            onClick={() => setModalSubir(true)}
            className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pn-accent-hover transition"
          >
            <Upload size={20} />
            Subir Material
          </button>
        </div>
      </div>

      {/* Contenido maestro de la asignatura vs. propio del grupo, con las
          acciones de promover y copiar del grupo anterior. Autónomo. */}
      <ContenidoDelGrupoPanel />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-pn-ink opacity-70 text-sm`}>Total Materiales</p>
              <p className={`text-2xl font-bold text-pn-ink`}>{estadisticas.total}</p>
            </div>
            <File className="text-pn-accent-text" size={32} />
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-pn-ink opacity-70 text-sm`}>Videos</p>
              <p className={`text-2xl font-bold text-pn-ink`}>{estadisticas.videos}</p>
            </div>
            <Video className="text-pn-accent-2-text" size={32} />
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-pn-ink opacity-70 text-sm`}>Documentos</p>
              <p className={`text-2xl font-bold text-pn-ink`}>{estadisticas.documentos}</p>
            </div>
            <FileText className="text-pn-danger" size={32} />
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-pn-ink opacity-70 text-sm`}>Carpetas</p>
              <p className={`text-2xl font-bold text-pn-ink`}>{carpetas.length}</p>
            </div>
            <Folder className="text-pn-warn" size={32} />
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted" size={20} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar materiales..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
            />
          </div>

          {/* Filtros */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className={`px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
          >
            <option value="todos">Todos los tipos</option>
            <option value="pdf">PDF</option>
            <option value="video">Videos</option>
            <option value="documento">Documentos</option>
            <option value="presentacion">Presentaciones</option>
            <option value="imagen">Imágenes</option>
            <option value="enlace">Enlaces</option>
          </select>

          <select
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
            className={`px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
          >
            <option value="todos">Todos los cursos</option>
            {cursos.map(curso => (
              <option key={curso} value={curso}>{curso}</option>
            ))}
          </select>

          {/* Vista */}
          <div className="flex gap-2">
            <button
              onClick={() => setVista('grid')}
              className={`p-2 rounded-lg transition ${
                vista === 'grid'
                  ? 'bg-pn-accent text-pn-accent-ink'
                  : `text-pn-ink hover:bg-pn-surface-3`
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setVista('lista')}
              className={`p-2 rounded-lg transition ${
                vista === 'lista'
                  ? 'bg-pn-accent text-pn-accent-ink'
                  : `text-pn-ink hover:bg-pn-surface-3`
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Carpetas */}
      {carpetas.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold text-pn-ink mb-3`}>Carpetas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {carpetas.map(carpeta => (
              <div
                key={carpeta.id}
                {...pulsable(() => {
                  setCarpetaAbierta(carpeta);
                  setModalVerCarpeta(true);
                })}
                className={`bg-pn-surface p-4 rounded-lg border-pn-line border hover:shadow-lg transition cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <Folder className="text-pn-warn" size={32} />
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarpetaEnEdicion(carpeta);
                        setModalEditarCarpeta(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-pn-accent-soft rounded"
                    >
                      <Edit size={16} className="text-pn-accent-text" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarCarpeta(carpeta.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-pn-danger-soft rounded"
                    >
                      <Trash2 size={16} className="text-pn-danger" />
                    </button>
                  </div>
                </div>
                <h4 className={`text-pn-ink font-medium mb-1`}>{carpeta.nombre}</h4>
                <p className={`text-pn-ink opacity-70 text-sm`}>
                  {carpeta.materiales.length} {carpeta.materiales.length === 1 ? 'archivo' : 'archivos'}
                </p>
                <p className={`text-pn-ink opacity-60 text-xs mt-1`}>{carpeta.curso}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materiales */}
      <div>
        <h3 className={`text-lg font-semibold text-pn-ink mb-3`}>
          Materiales ({materialesFiltrados.length})
        </h3>

        {materialesFiltrados.length === 0 ? (
          <div className={`bg-pn-surface p-12 rounded-lg border-pn-line border text-center`}>
            <File size={64} className={`text-pn-ink opacity-20 mx-auto mb-4`} />
            <p className={`text-pn-ink opacity-70 mb-4`}>
              No se encontraron materiales
            </p>
            <button
              onClick={() => setModalSubir(true)}
              className="text-pn-accent-text hover:underline"
            >
              Subir tu primer material
            </button>
          </div>
        ) : vista === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {materialesFiltrados.map(material => (
              <div
                key={material.id}
                className={`bg-pn-surface p-4 rounded-lg border-pn-line border hover:shadow-lg transition group cursor-pointer`}
                {...pulsable(() => abrirDetalleMaterial(material))}
              >
                <div className="flex items-start justify-between mb-3">
                  {getTipoIcon(material.tipo)}
                  <span className={`px-2 py-1 rounded text-xs ${getTipoColor(material.tipo)}`}>
                    {material.tipo}
                  </span>
                </div>

                <h4 className={`text-pn-ink font-medium mb-2 line-clamp-2`}>
                  {material.nombre}
                </h4>

                <div className="space-y-1 mb-3">
                  <p className={`text-pn-ink opacity-70 text-xs`}>{material.curso}</p>
                  {material.modulo && (
                    <p className={`text-pn-ink opacity-60 text-xs`}>Módulo: {material.modulo}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    {material.tamaño && (
                      <span className={`text-pn-ink opacity-60`}>{material.tamaño}</span>
                    )}
                    {material.duracion && (
                      <span className={`text-pn-ink opacity-60 flex items-center gap-1`}>
                        <Clock size={12} />
                        {material.duracion}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      uploadsApi.abrir(material.url).catch(() => avisos.error('No se pudo abrir el material.'));
                    }}
                    className="flex-1 p-2 hover:bg-pn-accent-soft rounded transition"
                    title="Ver"
                  >
                    <Eye size={16} className="text-pn-accent-text mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      compartirMaterial(material);
                    }}
                    className="flex-1 p-2 hover:bg-pn-ok-soft rounded transition"
                    title="Compartir"
                  >
                    <Share2 size={16} className="text-pn-ok mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarMaterial(material.id);
                    }}
                    className="flex-1 p-2 hover:bg-pn-danger-soft rounded transition"
                    title="Eliminar"
                  >
                    <Trash2 size={16} className="text-pn-danger mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`bg-pn-surface rounded-lg border-pn-line border overflow-hidden`}>
            <div className="pn-scroll overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className={`border-pn-line border-b`}>
                <tr>
                  <th className={`text-pn-ink text-left p-4 font-medium`}>Nombre</th>
                  <th className={`text-pn-ink text-left p-4 font-medium`}>Tipo</th>
                  <th className={`text-pn-ink text-left p-4 font-medium`}>Curso</th>
                  <th className={`text-pn-ink text-left p-4 font-medium`}>Fecha</th>
                  <th className={`text-pn-ink text-left p-4 font-medium`}>Estadísticas</th>
                  <th className={`text-pn-ink text-left p-4 font-medium`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materialesFiltrados.map(material => (
                  <tr key={material.id} className={`border-pn-line border-b hover:bg-pn-surface-2`}>
                    <td className={`text-pn-ink p-4`}>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(material.tipo)}
                        <span>{material.nombre}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${getTipoColor(material.tipo)}`}>
                        {material.tipo}
                      </span>
                    </td>
                    <td className={`text-pn-ink p-4`}>{material.curso}</td>
                    <td className={`text-pn-ink opacity-70 p-4 text-sm`}>{material.fechaSubida}</td>
                    <td className={`text-pn-ink opacity-70 p-4 text-sm`}>
                      {material.vistas || 0} vistas · {material.descargas || 0} descargas
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => uploadsApi.abrir(material.url).catch(() => avisos.error('No se pudo abrir el material.'))}
                          className="p-1 hover:bg-pn-accent-soft rounded"
                          title="Ver"
                        >
                          <Eye size={16} className="text-pn-accent-text" />
                        </button>
                        <button
                          onClick={() => compartirMaterial(material)}
                          className="p-1 hover:bg-pn-ok-soft rounded"
                          title="Compartir"
                        >
                          <Share2 size={16} className="text-pn-ok" />
                        </button>
                        <button
                          onClick={() => eliminarMaterial(material.id)}
                          className="p-1 hover:bg-pn-danger-soft rounded"
                          title="Eliminar"
                        >
                          <Trash2 size={16} className="text-pn-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Subir Material */}
      {modalSubir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Subir Nuevo Material" className={`bg-pn-surface rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className={`p-6 border-pn-line border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold text-pn-ink`}>Subir Nuevo Material</h3>
              <button
                onClick={() => setModalSubir(false)}
                className={`text-pn-ink hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>Nombre del Material *</label>
                <input
                  type="text"
                  value={nuevoMaterial.nombre}
                  onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, nombre: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  placeholder="Ej: Introducción a React - Presentación"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-pn-ink mb-2 font-medium`}>Tipo de Material *</label>
                  <select
                    value={nuevoMaterial.tipo}
                    onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, tipo: e.target.value as any })}
                    className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="documento">Documento</option>
                    <option value="presentacion">Presentación</option>
                    <option value="imagen">Imagen</option>
                    <option value="audio">Audio</option>
                    <option value="enlace">Enlace externo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-pn-ink mb-2 font-medium`}>Curso *</label>
                  <select
                    value={nuevoMaterial.curso}
                    onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, curso: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursosDisponibles.map((curso) => (
                      <option key={curso.id} value={curso.nombre}>
                        {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>Archivo</label>
                <input
                  key={claveInputArchivo}
                  type="file"
                  accept={ACCEPT_MATERIALES}
                  onChange={handleElegirArchivo}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink text-sm`}
                />
                {nuevoMaterial.archivo ? (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-pn-ok text-xs">
                      Se subirá <strong>{nuevoMaterial.archivo.name}</strong> ({nuevoMaterial.tamaño})
                    </p>
                    <button
                      type="button"
                      onClick={quitarArchivo}
                      className="text-xs text-pn-danger hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <p className={`text-pn-ink opacity-60 text-xs mt-1`}>
                    PDF, Word, PowerPoint, Excel, imagen, audio o video, hasta {TAMANIO_MAXIMO_MB} MB.
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>
                  ...o enlace externo {!nuevoMaterial.archivo && '*'}
                </label>
                <input
                  type="url"
                  value={nuevoMaterial.url}
                  onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, url: e.target.value })}
                  disabled={!!nuevoMaterial.archivo}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink disabled:opacity-50`}
                  placeholder="https://..."
                />
                <p className={`text-pn-ink opacity-60 text-xs mt-1`}>
                  Para YouTube, Vimeo, Drive o cualquier material que ya viva fuera de la
                  plataforma. Si subes un archivo, este campo se ignora.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-pn-ink mb-2 font-medium`}>Módulo (opcional)</label>
                  <input
                    type="text"
                    value={nuevoMaterial.modulo || ''}
                    onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, modulo: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                    placeholder="Ej: Módulo 1"
                  />
                </div>

                <div>
                  <label className={`block text-pn-ink mb-2 font-medium`}>Tema (opcional)</label>
                  <input
                    type="text"
                    value={nuevoMaterial.tema || ''}
                    onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, tema: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                    placeholder="Ej: Hooks de React"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-pn-ink mb-2 font-medium`}>Tamaño (opcional)</label>
                  <input
                    type="text"
                    value={nuevoMaterial.tamaño || ''}
                    onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, tamaño: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                    placeholder="Ej: 2.5 MB"
                  />
                </div>

                <div>
                  <label className={`block text-pn-ink mb-2 font-medium`}>Duración (opcional)</label>
                  <input
                    type="text"
                    value={nuevoMaterial.duracion || ''}
                    onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, duracion: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                    placeholder="Ej: 15:30 o 1h 20min"
                  />
                </div>
              </div>
            </div>

            <div className={`p-6 border-pn-line border-t flex justify-end gap-3`}>
              <button
                onClick={() => setModalSubir(false)}
                className={`px-4 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3 transition`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubirMaterial}
                className="bg-pn-accent text-pn-accent-ink px-6 py-2 rounded-lg hover:bg-pn-accent-hover transition flex items-center gap-2"
              >
                <Upload size={18} />
                Subir Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Carpeta */}
      {modalCarpeta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Nueva Carpeta" className={`bg-pn-surface rounded-lg w-full max-w-md`}>
            <div className={`p-6 border-pn-line border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold text-pn-ink`}>Nueva Carpeta</h3>
              <button
                onClick={() => setModalCarpeta(false)}
                className={`text-pn-ink hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>Nombre de la Carpeta *</label>
                <input
                  type="text"
                  value={nuevaCarpeta.nombre}
                  onChange={(e) => setNuevaCarpeta({ ...nuevaCarpeta, nombre: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  placeholder="Ej: Material del Módulo 1"
                />
              </div>

              <div>
                <label className={`block text-pn-ink mb-2 font-medium`}>Curso *</label>
                <input
                  type="text"
                  value={nuevaCarpeta.curso}
                  onChange={(e) => setNuevaCarpeta({ ...nuevaCarpeta, curso: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                  placeholder="Nombre del curso"
                />
              </div>
            </div>

            <div className={`p-6 border-pn-line border-t flex justify-end gap-3`}>
              <button
                onClick={() => setModalCarpeta(false)}
                className={`px-4 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3 transition`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearCarpeta}
                className="bg-pn-ok text-pn-surface px-6 py-2 rounded-lg hover:bg-pn-ok transition flex items-center gap-2"
              >
                <Folder size={18} />
                Crear Carpeta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Carpeta */}
      {modalEditarCarpeta && carpetaEnEdicion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Editar Carpeta" className={`bg-pn-surface rounded-lg w-full max-w-md`}>
            <div className={`p-6 border-pn-line border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold text-pn-ink`}>Editar Carpeta</h3>
              <button onClick={() => {
                setModalEditarCarpeta(false);
                setCarpetaEnEdicion(null);
              }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-pn-ink mb-2`}>Nombre de la Carpeta *</label>
                <input
                  type="text"
                  value={carpetaEnEdicion.nombre}
                  onChange={(e) => setCarpetaEnEdicion({...carpetaEnEdicion, nombre: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                />
              </div>

              <div>
                <label className={`block text-pn-ink mb-2`}>Curso *</label>
                <input
                  type="text"
                  value={carpetaEnEdicion.curso}
                  onChange={(e) => setCarpetaEnEdicion({...carpetaEnEdicion, curso: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink`}
                />
              </div>
            </div>

            <div className={`p-6 border-pn-line border-t flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setModalEditarCarpeta(false);
                  setCarpetaEnEdicion(null);
                }}
                className={`px-4 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3`}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!carpetaEnEdicion.nombre || !carpetaEnEdicion.curso) {
                    avisos.error('Completa todos los campos.');
                    return;
                  }
                  editarCarpeta(carpetaEnEdicion.id, {
                    nombre: carpetaEnEdicion.nombre,
                    curso: carpetaEnEdicion.curso
                  });
                  setModalEditarCarpeta(false);
                  setCarpetaEnEdicion(null);
                }}
                className="bg-pn-accent text-pn-accent-ink px-6 py-2 rounded-lg hover:bg-pn-accent-hover"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Material */}
      {modalDetalle && materialSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Detalles del Material" className={`bg-pn-surface rounded-lg w-full max-w-2xl`}>
            <div className={`p-6 border-pn-line border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold text-pn-ink`}>Detalles del Material</h3>
              <button
                onClick={() => setModalDetalle(false)}
                className={`text-pn-ink hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                {getTipoIcon(materialSeleccionado.tipo)}
                <div className="flex-1">
                  <h4 className={`text-pn-ink text-lg font-semibold mb-2`}>
                    {materialSeleccionado.nombre}
                  </h4>
                  <div className="space-y-2">
                    <p className={`text-pn-ink opacity-70 text-sm`}>
                      <strong>Tipo:</strong> {materialSeleccionado.tipo}
                    </p>
                    <p className={`text-pn-ink opacity-70 text-sm`}>
                      <strong>Curso:</strong> {materialSeleccionado.curso}
                    </p>
                    {materialSeleccionado.modulo && (
                      <p className={`text-pn-ink opacity-70 text-sm`}>
                        <strong>Módulo:</strong> {materialSeleccionado.modulo}
                      </p>
                    )}
                    {materialSeleccionado.tema && (
                      <p className={`text-pn-ink opacity-70 text-sm`}>
                        <strong>Tema:</strong> {materialSeleccionado.tema}
                      </p>
                    )}
                    <p className={`text-pn-ink opacity-70 text-sm`}>
                      <strong>Fecha de subida:</strong> {materialSeleccionado.fechaSubida}
                    </p>
                    {materialSeleccionado.tamaño && (
                      <p className={`text-pn-ink opacity-70 text-sm`}>
                        <strong>Tamaño:</strong> {materialSeleccionado.tamaño}
                      </p>
                    )}
                    {materialSeleccionado.duracion && (
                      <p className={`text-pn-ink opacity-70 text-sm`}>
                        <strong>Duración:</strong> {materialSeleccionado.duracion}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={`border-pn-line border-t pt-4`}>
                <h5 className={`text-pn-ink font-medium mb-2`}>Estadísticas</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`border-pn-line border rounded-lg p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Eye size={16} className="text-pn-accent-text" />
                      <span className={`text-pn-ink opacity-70 text-sm`}>Vistas</span>
                    </div>
                    <p className={`text-pn-ink text-xl font-bold`}>{materialSeleccionado.vistas || 0}</p>
                  </div>
                  <div className={`border-pn-line border rounded-lg p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Download size={16} className="text-pn-ok" />
                      <span className={`text-pn-ink opacity-70 text-sm`}>Descargas</span>
                    </div>
                    <p className={`text-pn-ink text-xl font-bold`}>{materialSeleccionado.descargas || 0}</p>
                  </div>
                </div>
              </div>

              <div className={`border-pn-line border-t pt-4`}>
                <button
                  onClick={() =>
                    uploadsApi.abrir(materialSeleccionado.url).catch(() => avisos.error('No se pudo abrir el material.'))
                  }
                  className={`text-pn-ink opacity-70 text-sm break-all hover:text-pn-accent-text text-left`}
                >
                  {materialSeleccionado.url}
                </button>
              </div>
            </div>

            <div className={`p-6 border-pn-line border-t flex justify-end gap-3`}>
              <button
                onClick={() => compartirMaterial(materialSeleccionado)}
                className="bg-pn-ok text-pn-surface px-6 py-2 rounded-lg hover:bg-pn-ok transition flex items-center gap-2"
              >
                <Share2 size={18} />
                Compartir
              </button>
              <button
                onClick={() => uploadsApi.abrir(materialSeleccionado.url).catch(() => avisos.error('No se pudo abrir el material.'))}
                className="bg-pn-accent text-pn-accent-ink px-6 py-2 rounded-lg hover:bg-pn-accent-hover transition flex items-center gap-2"
              >
                <Eye size={18} />
                Ver Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Carpeta */}
      {modalVerCarpeta && carpetaAbierta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" className={`bg-pn-surface rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className={`p-6 border-pn-line border-b flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <FolderOpen className="text-pn-warn" size={32} />
                <div>
                  <h3 className={`text-xl font-bold text-pn-ink`}>{carpetaAbierta.nombre}</h3>
                  <p className={`text-sm text-pn-ink opacity-70`}>
                    {carpetaAbierta.curso} • {carpetaAbierta.materiales.length} {carpetaAbierta.materiales.length === 1 ? 'archivo' : 'archivos'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalVerCarpeta(false);
                  setCarpetaAbierta(null);
                }}
                className={`text-pn-ink hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {obtenerMaterialesCarpeta(carpetaAbierta).length === 0 ? (
                <div className="text-center py-12">
                  <Folder size={64} className={`text-pn-ink opacity-20 mx-auto mb-4`} />
                  <p className={`text-pn-ink opacity-70 mb-2`}>
                    Esta carpeta está vacía
                  </p>
                  <p className={`text-sm text-pn-ink opacity-50`}>
                    No hay archivos en esta carpeta
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {obtenerMaterialesCarpeta(carpetaAbierta).map((material) => (
                    <div
                      key={material.id}
                      className={`border-pn-line border rounded-lg p-4 hover:shadow-md transition`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icono del tipo de archivo */}
                        <div className="flex-shrink-0">
                          {getTipoIcon(material.tipo)}
                        </div>

                        {/* Información del material */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-pn-ink font-medium mb-1 truncate`}>
                            {material.nombre}
                          </h4>
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${getTipoColor(material.tipo)}`}>
                              {material.tipo}
                            </span>
                            {material.tamaño && (
                              <span className={`text-pn-ink opacity-60`}>{material.tamaño}</span>
                            )}
                            {material.duracion && (
                              <span className={`text-pn-ink opacity-60 flex items-center gap-1`}>
                                <Clock size={12} />
                                {material.duracion}
                              </span>
                            )}
                            <span className={`text-pn-ink opacity-60`}>{material.fechaSubida}</span>
                          </div>
                          {material.modulo && (
                            <p className={`text-xs text-pn-ink opacity-50 mt-1`}>
                              Módulo: {material.modulo}
                            </p>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => uploadsApi.abrir(material.url).catch(() => avisos.error('No se pudo abrir el material.'))}
                            className="p-2 hover:bg-pn-accent-soft rounded-lg transition"
                            title="Ver material"
                          >
                            <Eye size={20} className="text-pn-accent-text" />
                          </button>
                          <button
                            onClick={() => {
                              // Simular descarga
                              const link = document.createElement('a');
                              link.href = material.url;
                              link.download = material.nombre;
                              link.target = '_blank';
                              link.click();
                            }}
                            className="p-2 hover:bg-pn-ok-soft rounded-lg transition"
                            title="Descargar"
                          >
                            <Download size={20} className="text-pn-ok" />
                          </button>
                          <button
                            onClick={() => abrirDetalleMaterial(material)}
                            className="p-2 hover:bg-pn-accent-2-soft rounded-lg transition"
                            title="Ver detalles"
                          >
                            <BarChart3 size={20} className="text-pn-accent-2-text" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-pn-line border-t flex justify-between items-center`}>
              <div className={`text-sm text-pn-ink opacity-70`}>
                Total: {obtenerMaterialesCarpeta(carpetaAbierta).length} {obtenerMaterialesCarpeta(carpetaAbierta).length === 1 ? 'archivo' : 'archivos'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Compartir carpeta - copiar lista de URLs
                    const urls = obtenerMaterialesCarpeta(carpetaAbierta).map(m => m.url).join('\n');
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(urls);
                      avisos.ok('Enlaces de la carpeta copiados al portapapeles.');
                    }
                  }}
                  className="bg-pn-ok text-pn-surface px-4 py-2 rounded-lg hover:bg-pn-ok transition flex items-center gap-2"
                >
                  <Share2 size={18} />
                  Compartir Carpeta
                </button>
                <button
                  onClick={() => {
                    setModalVerCarpeta(false);
                    setCarpetaAbierta(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3 transition`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
