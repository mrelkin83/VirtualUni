import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  ChevronRight,
  BarChart3,
  UserCheck,
  Clock,
  Search,
  Filter,
  Download,
  Mail,
  Plus,
  X,
  Edit,
  Trash2,
  UserPlus,
  ClipboardCheck,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { Grupo } from '../../../types/teacher.types';
import { avisar, confirmar } from '../../ui';
import { tintaDeRelleno } from '../../../utils/tintas';
import { pulsable } from '../../../utils/pulsable';

interface GruposSectionProps {
  grupos: Grupo[];
  estudiantes: any[];
  cursos: any[];
  crearGrupo?: (grupoData: any) => void;
  editarGrupo?: (grupoId: number, grupoData: any) => void;
  eliminarGrupo?: (grupoId: number) => void;
  asignarEstudiantes?: (grupoId: number, estudianteIds: number[]) => void;
  eliminarEstudiante?: (grupoId: number, estudianteId: number) => void;
  crearTareaGrupal?: (grupoId: number, tareaData: any) => void;
  enviarMensajeGrupo?: (grupoId: number) => void;
  verDetalleGrupo?: (grupoId: number) => void;
}

// Componente de tarjeta de grupo
const GrupoCard: React.FC<{
  grupo: Grupo & { estudiantes?: any[]; tareas?: any[] };
  onVerDetalle: (id: number) => void;
  onAsignarEstudiantes: (id: number) => void;
  onEnviarMensaje: (id: number) => void;
  onEditar: (grupo: any) => void;
  onEliminar: (id: number) => void;
}> = ({
  grupo,
  onVerDetalle,
  onAsignarEstudiantes,
  onEnviarMensaje,
  onEditar,
  onEliminar
}) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);

  return (
    <div className={`bg-pn-surface rounded-lg shadow-md p-5 border border-pn-line hover:shadow-lg transition-shadow`}>
      {/* Header del grupo */}
      <div className="flex flex-wrap items-start justify-between mb-4 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-12 h-12 rounded-lg ${grupo.color} ${tintaDeRelleno(grupo.color)} flex items-center justify-center font-bold text-lg`}>
              {grupo.codigo}
            </div>
            <div>
              <h3 className={`font-bold text-pn-ink text-lg`}>{grupo.nombre}</h3>
              <p className={`text-sm text-pn-ink-2`}>{grupo.curso}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onEditar(grupo)}
            className={`p-2 rounded-lg hover:bg-pn-surface-3 transition`}
            title="Editar grupo"
          >
            <Edit size={16} className="text-pn-accent-text" />
          </button>
          <button
            onClick={async () => {
              if (await confirmar('¿Estás seguro de eliminar este grupo?')) {
                onEliminar(grupo.id);
              }
            }}
            className={`p-2 rounded-lg hover:bg-pn-surface-3 transition`}
            title="Eliminar grupo"
          >
            <Trash2 size={16} className="text-pn-danger" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-lg bg-pn-surface-2`}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-pn-accent-text" />
            <span className={`text-xs text-pn-ink-2`}>Estudiantes</span>
          </div>
          <p className={`text-lg font-bold text-pn-ink`}>
            {grupo.estudiantesActivos}/{grupo.estudiantesTotales}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-pn-surface-2`}>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck size={16} className="text-pn-accent-2-text" />
            <span className={`text-xs text-pn-ink-2`}>Tareas</span>
          </div>
          <p className={`text-lg font-bold text-pn-ink`}>{grupo.tareas?.length || 0}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex flex-wrap justify-between items-center mb-1 gap-4">
          <span className={`text-xs text-pn-ink-2`}>Progreso del grupo</span>
          <span className={`text-xs font-semibold text-pn-ink`}>{grupo.progreso}%</span>
        </div>
        <div className={`w-full h-2 rounded-full bg-pn-surface-3`}>
          <div
            className={`h-full rounded-full ${
              grupo.progreso >= 75
                ? 'bg-pn-ok'
                : grupo.progreso >= 50
                ? 'bg-pn-warn'
                : 'bg-pn-danger'
            }`}
            style={{ width: `${grupo.progreso}%` }}
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className={`space-y-2 mb-4 text-sm text-pn-ink-2`}>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{grupo.horario}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>{grupo.aula}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>Próxima clase: {grupo.proximaClase}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onVerDetalle(grupo.id)}
          className="flex-1 min-w-[120px] bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm"
        >
          <ChevronRight size={16} />
          Ver detalles
        </button>
        <button
          onClick={() => onAsignarEstudiantes(grupo.id)}
          className="px-3 py-2 rounded-lg bg-pn-ok hover:bg-pn-ok text-pn-surface transition flex items-center gap-2 text-sm"
          title="Asignar estudiantes"
        >
          <UserPlus size={16} />
          Estudiantes
        </button>
        <button
          onClick={() => onEnviarMensaje(grupo.id)}
          className={`px-3 py-2 rounded-lg border border-pn-line ${
            'hover:bg-pn-surface-3'
          } transition flex items-center gap-2`}
          title="Enviar mensaje al grupo"
        >
          <Mail size={16} />
        </button>
      </div>
    </div>
  );
};

// Componente Principal
export const GruposSection: React.FC<GruposSectionProps> = ({
  grupos,
  estudiantes = [],
  cursos = [],
  crearGrupo,
  editarGrupo,
  eliminarGrupo,
  asignarEstudiantes,
  eliminarEstudiante,
  enviarMensajeGrupo,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroOrden, setFiltroOrden] = useState<'nombre' | 'progreso' | 'estudiantes'>('nombre');
  const [modalCrearGrupo, setModalCrearGrupo] = useState(false);
  const [modalAsignarEstudiantes, setModalAsignarEstudiantes] = useState(false);
  const [modalDetalleGrupo, setModalDetalleGrupo] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null);
  const [grupoEditando, setGrupoEditando] = useState<any>(null);

  const [nuevoGrupo, setNuevoGrupo] = useState({
    nombre: '',
    curso: '',
    codigo: '',
    horario: '',
    aula: '',
    color: 'bg-pn-accent',
    proximaClase: ''
  });

  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<number[]>([]);

  // Filtrar y ordenar grupos
  let gruposFiltrados = grupos.filter(grupo =>
    grupo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    grupo.curso.toLowerCase().includes(busqueda.toLowerCase()) ||
    grupo.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Ordenar
  gruposFiltrados = [...gruposFiltrados].sort((a, b) => {
    switch (filtroOrden) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      case 'progreso':
        return b.progreso - a.progreso;
      case 'estudiantes':
        return b.estudiantesActivos - a.estudiantesActivos;
      default:
        return 0;
    }
  });

  // Estadísticas generales
  const stats = {
    totalGrupos: grupos.length,
    totalEstudiantes: grupos.reduce((acc, g) => acc + g.estudiantesActivos, 0),
    progresoPromedio: grupos.reduce((acc, g) => acc + g.progreso, 0) / grupos.length || 0,
    gruposActivos: grupos.filter(g => g.estudiantesActivos > 0).length,
  };

  // Handlers
  const handleCrearGrupo = () => {
    if (!nuevoGrupo.nombre || !nuevoGrupo.curso || !nuevoGrupo.codigo) {
      avisar.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (grupoEditando) {
      editarGrupo?.(grupoEditando.id, nuevoGrupo);
      setGrupoEditando(null);
    } else {
      crearGrupo?.(nuevoGrupo);
    }

    setModalCrearGrupo(false);
    setNuevoGrupo({
      nombre: '',
      curso: '',
      codigo: '',
      horario: '',
      aula: '',
      color: 'bg-pn-accent',
      proximaClase: ''
    });
  };

  const handleAsignarEstudiantes = () => {
    if (!grupoSeleccionado || estudiantesSeleccionados.length === 0) {
      avisar.info('Por favor selecciona al menos un estudiante');
      return;
    }

    asignarEstudiantes?.(grupoSeleccionado.id, estudiantesSeleccionados);
    setModalAsignarEstudiantes(false);
    setEstudiantesSeleccionados([]);
    setGrupoSeleccionado(null);
  };

  const abrirModalAsignar = (grupo: any) => {
    setGrupoSeleccionado(grupo);
    // Pre-seleccionar estudiantes ya asignados
    const estudiantesGrupo = grupo.estudiantes?.map((e: any) => e.id) || [];
    setEstudiantesSeleccionados(estudiantesGrupo);
    setModalAsignarEstudiantes(true);
  };

  const abrirModalDetalle = (grupoId: number) => {
    const grupo = grupos.find(g => g.id === grupoId);
    setGrupoSeleccionado(grupo);
    setModalDetalleGrupo(true);
  };

  const abrirModalEditar = (grupo: any) => {
    setGrupoEditando(grupo);
    setNuevoGrupo({
      nombre: grupo.nombre,
      curso: grupo.curso,
      codigo: grupo.codigo,
      horario: grupo.horario,
      aula: grupo.aula,
      color: grupo.color,
      proximaClase: grupo.proximaClase
    });
    setModalCrearGrupo(true);
  };

  const toggleEstudiante = (estudianteId: number) => {
    if (estudiantesSeleccionados.includes(estudianteId)) {
      setEstudiantesSeleccionados(estudiantesSeleccionados.filter(id => id !== estudianteId));
    } else {
      setEstudiantesSeleccionados([...estudiantesSeleccionados, estudianteId]);
    }
  };

  const coloresDisponibles = [
    'bg-pn-accent',
    'bg-pn-ok',
    'bg-pn-accent-2',
    'bg-pn-danger',
    'bg-pn-warn',
    'bg-pn-accent-2',
    'bg-pn-accent-2',
    'bg-pn-warn'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Mis Grupos</h2>
        <button
          onClick={() => setModalCrearGrupo(true)}
          className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Crear Grupo
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Users className="text-pn-accent-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Total Grupos</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.totalGrupos}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <UserCheck className="text-pn-ok mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Total Estudiantes</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.totalEstudiantes}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <TrendingUp className="text-pn-accent-2-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Progreso Promedio</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.progresoPromedio.toFixed(1)}%</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <BarChart3 className="text-pn-warn mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Grupos Activos</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.gruposActivos}</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted" size={20} />
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border border-pn-line ${
                'bg-pn-surface text-pn-ink'
              } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className={'text-pn-ink-2'} />
          <select
            value={filtroOrden}
            onChange={(e) => setFiltroOrden(e.target.value as any)}
            className={`px-4 py-2 rounded-lg border border-pn-line ${
              'bg-pn-surface text-pn-ink'
            } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
          >
            <option value="nombre">Ordenar por nombre</option>
            <option value="progreso">Ordenar por progreso</option>
            <option value="estudiantes">Ordenar por estudiantes</option>
          </select>
        </div>

        <button
          className={`px-4 py-2 rounded-lg border border-pn-line ${
            'hover:bg-pn-surface-3'
          } transition flex items-center gap-2`}
        >
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Lista de grupos */}
      {gruposFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {gruposFiltrados.map(grupo => (
            <GrupoCard
              key={grupo.id}
              grupo={grupo}
              onVerDetalle={abrirModalDetalle}
              onAsignarEstudiantes={abrirModalAsignar}
              onEnviarMensaje={(id) => enviarMensajeGrupo?.(id)}
              onEditar={abrirModalEditar}
              onEliminar={(id) => eliminarGrupo?.(id)}
            />
          ))}
        </div>
      ) : (
        <div className={`bg-pn-surface rounded-lg shadow p-12 text-center border border-pn-line`}>
          <Users size={64} className={`mx-auto mb-4 text-pn-muted`} />
          <p className={`text-pn-ink font-bold mb-2`}>No se encontraron grupos</p>
          <p className={'text-pn-ink-2'}>
            {grupos.length === 0 ? 'Crea tu primer grupo para comenzar' : 'Intenta ajustar los filtros de búsqueda'}
          </p>
        </div>
      )}

      {/* Resumen de grupos por curso */}
      {grupos.length > 0 && (
        <div className={`bg-pn-surface rounded-lg shadow p-6 border border-pn-line`}>
          <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Resumen por Curso</h3>
          <div className="space-y-3">
            {Array.from(new Set(grupos.map(g => g.curso))).map(curso => {
              const gruposCurso = grupos.filter(g => g.curso === curso);
              const totalEstudiantes = gruposCurso.reduce((acc, g) => acc + g.estudiantesActivos, 0);
              const progresoPromedio = gruposCurso.reduce((acc, g) => acc + g.progreso, 0) / gruposCurso.length;

              return (
                <div key={curso} className={`p-4 rounded-lg border border-pn-line`}>
                  <div className="flex flex-wrap items-center justify-between mb-2 gap-4">
                    <h4 className={`font-semibold text-pn-ink`}>{curso}</h4>
                    <span className={`text-sm text-pn-ink-2`}>
                      {gruposCurso.length} grupo{gruposCurso.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={'text-pn-ink-2'}>Estudiantes: </span>
                      <span className={`font-semibold text-pn-ink`}>{totalEstudiantes}</span>
                    </div>
                    <div>
                      <span className={'text-pn-ink-2'}>Progreso: </span>
                      <span className={`font-semibold text-pn-ink`}>{progresoPromedio.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Grupo */}
      {modalCrearGrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="{grupoEditando ? 'Editar Grupo' : 'Crear Nuevo Grupo'}" className={`bg-pn-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>
                {grupoEditando ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
              </h3>
              <button
                onClick={() => {
                  setModalCrearGrupo(false);
                  setGrupoEditando(null);
                  setNuevoGrupo({
                    nombre: '',
                    curso: '',
                    codigo: '',
                    horario: '',
                    aula: '',
                    color: 'bg-pn-accent',
                    proximaClase: ''
                  });
                }}
                className={`hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                    Nombre del Grupo <span className="text-pn-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={nuevoGrupo.nombre}
                    onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, nombre: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                      'bg-pn-surface text-pn-ink'
                    } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                    placeholder="Ej: Grupo A"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                    Código <span className="text-pn-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={nuevoGrupo.codigo}
                    onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, codigo: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                      'bg-pn-surface text-pn-ink'
                    } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                    placeholder="Ej: GA"
                    maxLength={3}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                  Curso <span className="text-pn-danger">*</span>
                </label>
                <select
                  value={nuevoGrupo.curso}
                  onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, curso: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                    'bg-pn-surface text-pn-ink'
                  } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.nombre}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                    Horario
                  </label>
                  <input
                    type="text"
                    value={nuevoGrupo.horario}
                    onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, horario: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                      'bg-pn-surface text-pn-ink'
                    } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                    placeholder="Ej: Lun-Mié 10:00-12:00"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                    Aula
                  </label>
                  <input
                    type="text"
                    value={nuevoGrupo.aula}
                    onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, aula: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                      'bg-pn-surface text-pn-ink'
                    } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                    placeholder="Ej: Aula 301"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 text-pn-ink`}>
                  Próxima Clase
                </label>
                <input
                  type="date"
                  value={nuevoGrupo.proximaClase}
                  onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, proximaClase: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border border-pn-line ${
                    'bg-pn-surface text-pn-ink'
                  } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 text-pn-ink`}>
                  Color del Grupo
                </label>
                <div className="pn-scroll -mx-2 overflow-x-auto px-2">
                <div className="grid min-w-[560px] grid-cols-8 gap-2">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNuevoGrupo({ ...nuevoGrupo, color })}
                      className={`w-10 h-10 rounded-lg ${color} ${
                        nuevoGrupo.color === color
                          ? 'ring-4 ring-offset-2 ring-pn-accent'
                          : 'hover:opacity-80'
                      } transition`}
                    />
                  ))}
                </div>
              </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setModalCrearGrupo(false);
                  setGrupoEditando(null);
                  setNuevoGrupo({
                    nombre: '',
                    curso: '',
                    codigo: '',
                    horario: '',
                    aula: '',
                    color: 'bg-pn-accent',
                    proximaClase: ''
                  });
                }}
                className={`px-4 py-2 rounded-lg border border-pn-line ${
                  'hover:bg-pn-surface-3'
                } transition`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearGrupo}
                className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg font-medium transition"
              >
                {grupoEditando ? 'Guardar Cambios' : 'Crear Grupo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Estudiantes */}
      {modalAsignarEstudiantes && grupoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Asignar Estudiantes" className={`bg-pn-surface rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
              <div>
                <h3 className={`text-xl font-bold text-pn-ink`}>Asignar Estudiantes</h3>
                <p className={`text-sm text-pn-ink-2`}>
                  Grupo: {grupoSeleccionado.nombre}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalAsignarEstudiantes(false);
                  setGrupoSeleccionado(null);
                  setEstudiantesSeleccionados([]);
                }}
                className={`hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className={`mb-4 p-3 rounded-lg bg-pn-accent-soft flex items-start gap-2`}>
              <AlertCircle size={20} className="text-pn-accent-text flex-shrink-0 mt-0.5" />
              <p className={`text-sm text-pn-accent-text`}>
                Selecciona los estudiantes que deseas asignar a este grupo. Los estudiantes ya asignados aparecen marcados.
              </p>
            </div>

            <div className="mb-4">
              <p className={`text-sm text-pn-ink-2`}>
                Estudiantes seleccionados: <span className="font-bold">{estudiantesSeleccionados.length}</span>
              </p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
              {estudiantes.length > 0 ? (
                estudiantes.map((estudiante) => (
                  <div
                    key={estudiante.id}
                    {...pulsable(() => toggleEstudiante(estudiante.id))}
                    className={`p-4 rounded-lg border border-pn-line cursor-pointer transition ${
                      estudiantesSeleccionados.includes(estudiante.id)
                        ? 'bg-pn-accent bg-opacity-10 border-pn-accent-line'
                        : 'hover:bg-pn-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                          estudiantesSeleccionados.includes(estudiante.id)
                            ? 'bg-pn-accent border-pn-accent-line'
                            : 'border-pn-line'
                        }`}
                      >
                        {estudiantesSeleccionados.includes(estudiante.id) && (
                          <CheckSquare size={16} className="text-pn-accent-ink" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-pn-ink`}>{estudiante.nombre}</p>
                        <p className={`text-sm text-pn-ink-2`}>
                          {estudiante.email}
                        </p>
                      </div>
                      {estudiante.curso && (
                        <span className={`text-xs px-2 py-1 rounded bg-pn-surface-3`}>
                          {estudiante.curso}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users size={48} className={`mx-auto mb-2 text-pn-muted`} />
                  <p className={'text-pn-ink-2'}>
                    No hay estudiantes disponibles
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalAsignarEstudiantes(false);
                  setGrupoSeleccionado(null);
                  setEstudiantesSeleccionados([]);
                }}
                className={`px-4 py-2 rounded-lg border border-pn-line ${
                  'hover:bg-pn-surface-3'
                } transition`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignarEstudiantes}
                className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg font-medium transition"
              >
                Asignar {estudiantesSeleccionados.length} Estudiante{estudiantesSeleccionados.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Grupo */}
      {modalDetalleGrupo && grupoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" className={`bg-pn-surface rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div>
                <h3 className={`text-2xl font-bold text-pn-ink`}>{grupoSeleccionado.nombre}</h3>
                <p className={`text-sm text-pn-ink-2`}>
                  {grupoSeleccionado.curso} • Código: {grupoSeleccionado.codigo}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalDetalleGrupo(false);
                  setGrupoSeleccionado(null);
                }}
                className={`hover:bg-pn-surface-3 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg bg-pn-surface-2`}>
                <Users className="text-pn-accent-text mb-2" size={24} />
                <p className={`text-sm text-pn-ink-2`}>Estudiantes</p>
                <p className={`text-xl font-bold text-pn-ink`}>
                  {grupoSeleccionado.estudiantesActivos}/{grupoSeleccionado.estudiantesTotales}
                </p>
              </div>
              <div className={`p-4 rounded-lg bg-pn-surface-2`}>
                <TrendingUp className="text-pn-ok mb-2" size={24} />
                <p className={`text-sm text-pn-ink-2`}>Progreso</p>
                <p className={`text-xl font-bold text-pn-ink`}>{grupoSeleccionado.progreso}%</p>
              </div>
              <div className={`p-4 rounded-lg bg-pn-surface-2`}>
                <ClipboardCheck className="text-pn-accent-2-text mb-2" size={24} />
                <p className={`text-sm text-pn-ink-2`}>Tareas</p>
                <p className={`text-xl font-bold text-pn-ink`}>{grupoSeleccionado.tareas?.length || 0}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className={`font-bold text-pn-ink mb-3`}>Información del Grupo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-pn-muted" />
                    <span className={'text-pn-ink-2'}>
                      {grupoSeleccionado.horario}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-pn-muted" />
                    <span className={'text-pn-ink-2'}>
                      {grupoSeleccionado.aula}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-pn-muted" />
                    <span className={'text-pn-ink-2'}>
                      Próxima clase: {grupoSeleccionado.proximaClase}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
                  <h4 className={`font-bold text-pn-ink`}>Miembros del Grupo</h4>
                  <button
                    onClick={() => {
                      setModalDetalleGrupo(false);
                      abrirModalAsignar(grupoSeleccionado);
                    }}
                    className="text-pn-accent-text hover:text-pn-accent-text text-sm font-medium flex items-center gap-1"
                  >
                    <UserPlus size={16} />
                    Asignar Estudiantes
                  </button>
                </div>
                {grupoSeleccionado.estudiantes && grupoSeleccionado.estudiantes.length > 0 ? (
                  <div className="space-y-2">
                    {grupoSeleccionado.estudiantes.map((estudiante: any) => (
                      <div
                        key={estudiante.id}
                        className={`p-3 rounded-lg border border-pn-line flex items-center justify-between`}
                      >
                        <div>
                          <p className={`font-medium text-pn-ink`}>{estudiante.nombre}</p>
                          <p className={`text-sm text-pn-ink-2`}>
                            {estudiante.email}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (await confirmar(`¿Eliminar a ${estudiante.nombre} del grupo?`)) {
                              eliminarEstudiante?.(grupoSeleccionado.id, estudiante.id);
                            }
                          }}
                          className="text-pn-danger hover:text-pn-danger p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-6 rounded-lg border border-pn-line text-center`}>
                    <Users size={32} className={`mx-auto mb-2 text-pn-muted`} />
                    <p className={'text-pn-ink-2'}>
                      No hay estudiantes asignados a este grupo
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className={`font-bold text-pn-ink mb-3`}>Tareas Grupales</h4>
                {grupoSeleccionado.tareas && grupoSeleccionado.tareas.length > 0 ? (
                  <div className="space-y-2">
                    {grupoSeleccionado.tareas.map((tarea: any) => (
                      <div
                        key={tarea.id}
                        className={`p-3 rounded-lg border border-pn-line`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <p className={`font-medium text-pn-ink`}>{tarea.titulo}</p>
                            <p className={`text-sm text-pn-ink-2`}>
                              Entrega: {tarea.fechaEntrega} • {tarea.puntos} puntos
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            tarea.estado === 'pendiente'
                              ? 'bg-pn-warn-soft text-pn-warn'
                              : tarea.estado === 'entregada'
                              ? 'bg-pn-accent-soft text-pn-accent-text'
                              : 'bg-pn-ok-soft text-pn-ok'
                          }`}>
                            {tarea.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-6 rounded-lg border border-pn-line text-center`}>
                    <ClipboardCheck size={32} className={`mx-auto mb-2 text-pn-muted`} />
                    <p className={'text-pn-ink-2'}>
                      No hay tareas asignadas a este grupo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
