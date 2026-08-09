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

interface GruposSectionProps {
  grupos: Grupo[];
  estudiantes: any[];
  cursos: any[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
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
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  onVerDetalle: (id: number) => void;
  onAsignarEstudiantes: (id: number) => void;
  onEnviarMensaje: (id: number) => void;
  onEditar: (grupo: any) => void;
  onEliminar: (id: number) => void;
}> = ({
  grupo,
  darkMode,
  card,
  text,
  border,
  onVerDetalle,
  onAsignarEstudiantes,
  onEnviarMensaje,
  onEditar,
  onEliminar
}) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);

  return (
    <div className={`${card} rounded-lg shadow-md p-5 border ${border} hover:shadow-lg transition-shadow`}>
      {/* Header del grupo */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-12 h-12 rounded-lg ${grupo.color} flex items-center justify-center text-white font-bold text-lg`}>
              {grupo.codigo}
            </div>
            <div>
              <h3 className={`font-bold ${text} text-lg`}>{grupo.nombre}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{grupo.curso}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEditar(grupo)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}
            title="Editar grupo"
          >
            <Edit size={16} className="text-blue-500" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de eliminar este grupo?')) {
                onEliminar(grupo.id);
              }
            }}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}
            title="Eliminar grupo"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-blue-500" />
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estudiantes</span>
          </div>
          <p className={`text-lg font-bold ${text}`}>
            {grupo.estudiantesActivos}/{grupo.estudiantesTotales}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck size={16} className="text-purple-500" />
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tareas</span>
          </div>
          <p className={`text-lg font-bold ${text}`}>{grupo.tareas?.length || 0}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progreso del grupo</span>
          <span className={`text-xs font-semibold ${text}`}>{grupo.progreso}%</span>
        </div>
        <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full rounded-full ${
              grupo.progreso >= 75
                ? 'bg-green-500'
                : grupo.progreso >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${grupo.progreso}%` }}
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className={`space-y-2 mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
          className="flex-1 min-w-[120px] bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm"
        >
          <ChevronRight size={16} />
          Ver detalles
        </button>
        <button
          onClick={() => onAsignarEstudiantes(grupo.id)}
          className="px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition flex items-center gap-2 text-sm"
          title="Asignar estudiantes"
        >
          <UserPlus size={16} />
          Estudiantes
        </button>
        <button
          onClick={() => onEnviarMensaje(grupo.id)}
          className={`px-3 py-2 rounded-lg border ${border} ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
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
  darkMode,
  card,
  text,
  border,
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
    color: 'bg-blue-500',
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
      alert('Por favor completa todos los campos obligatorios');
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
      color: 'bg-blue-500',
      proximaClase: ''
    });
  };

  const handleAsignarEstudiantes = () => {
    if (!grupoSeleccionado || estudiantesSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un estudiante');
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
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-orange-500'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className={`text-2xl font-bold ${text}`}>Mis Grupos</h2>
        <button
          onClick={() => setModalCrearGrupo(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Crear Grupo
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Users className="text-blue-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Grupos</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.totalGrupos}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <UserCheck className="text-green-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Estudiantes</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.totalEstudiantes}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <TrendingUp className="text-purple-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progreso Promedio</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.progresoPromedio.toFixed(1)}%</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <BarChart3 className="text-orange-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Grupos Activos</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.gruposActivos}</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${border} ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          <select
            value={filtroOrden}
            onChange={(e) => setFiltroOrden(e.target.value as any)}
            className={`px-4 py-2 rounded-lg border ${border} ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="nombre">Ordenar por nombre</option>
            <option value="progreso">Ordenar por progreso</option>
            <option value="estudiantes">Ordenar por estudiantes</option>
          </select>
        </div>

        <button
          className={`px-4 py-2 rounded-lg border ${border} ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
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
              darkMode={darkMode}
              card={card}
              text={text}
              border={border}
              onVerDetalle={abrirModalDetalle}
              onAsignarEstudiantes={abrirModalAsignar}
              onEnviarMensaje={(id) => enviarMensajeGrupo?.(id)}
              onEditar={abrirModalEditar}
              onEliminar={(id) => eliminarGrupo?.(id)}
            />
          ))}
        </div>
      ) : (
        <div className={`${card} rounded-lg shadow p-12 text-center border ${border}`}>
          <Users size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`${text} font-bold mb-2`}>No se encontraron grupos</p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {grupos.length === 0 ? 'Crea tu primer grupo para comenzar' : 'Intenta ajustar los filtros de búsqueda'}
          </p>
        </div>
      )}

      {/* Resumen de grupos por curso */}
      {grupos.length > 0 && (
        <div className={`${card} rounded-lg shadow p-6 border ${border}`}>
          <h3 className={`text-lg font-bold ${text} mb-4`}>Resumen por Curso</h3>
          <div className="space-y-3">
            {Array.from(new Set(grupos.map(g => g.curso))).map(curso => {
              const gruposCurso = grupos.filter(g => g.curso === curso);
              const totalEstudiantes = gruposCurso.reduce((acc, g) => acc + g.estudiantesActivos, 0);
              const progresoPromedio = gruposCurso.reduce((acc, g) => acc + g.progreso, 0) / gruposCurso.length;

              return (
                <div key={curso} className={`p-4 rounded-lg border ${border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${text}`}>{curso}</h4>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {gruposCurso.length} grupo{gruposCurso.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Estudiantes: </span>
                      <span className={`font-semibold ${text}`}>{totalEstudiantes}</span>
                    </div>
                    <div>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progreso: </span>
                      <span className={`font-semibold ${text}`}>{progresoPromedio.toFixed(1)}%</span>
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
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>
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
                    color: 'bg-blue-500',
                    proximaClase: ''
                  });
                }}
                className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${text}`}>
                    Nombre del Grupo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nuevoGrupo.nombre}
                    onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, nombre: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${border} ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ej: Grupo A"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${text}`}>
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nuevoGrupo.codigo}
                    onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, codigo: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 rounded-lg border ${border} ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ej: GA"
                    maxLength={3}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${text}`}>
                  Curso <span className="text-red-500">*</span>
                </label>
                <select
                  value={nuevoGrupo.curso}
                  onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, curso: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${border} ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  <label className={`block text-sm font-medium mb-2 ${text}`}>
                    Horario
                  </label>
                  <input
                    type="text"
                    value={nuevoGrupo.horario}
                    onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, horario: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${border} ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ej: Lun-Mié 10:00-12:00"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${text}`}>
                    Aula
                  </label>
                  <input
                    type="text"
                    value={nuevoGrupo.aula}
                    onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, aula: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${border} ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ej: Aula 301"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${text}`}>
                  Próxima Clase
                </label>
                <input
                  type="date"
                  value={nuevoGrupo.proximaClase}
                  onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, proximaClase: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${border} ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${text}`}>
                  Color del Grupo
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNuevoGrupo({ ...nuevoGrupo, color })}
                      className={`w-10 h-10 rounded-lg ${color} ${
                        nuevoGrupo.color === color
                          ? 'ring-4 ring-offset-2 ring-blue-500'
                          : 'hover:opacity-80'
                      } transition`}
                    />
                  ))}
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
                    color: 'bg-blue-500',
                    proximaClase: ''
                  });
                }}
                className={`px-4 py-2 rounded-lg border ${border} ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } transition`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearGrupo}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
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
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className={`text-xl font-bold ${text}`}>Asignar Estudiantes</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Grupo: {grupoSeleccionado.nombre}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalAsignarEstudiantes(false);
                  setGrupoSeleccionado(null);
                  setEstudiantesSeleccionados([]);
                }}
                className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} flex items-start gap-2`}>
              <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Selecciona los estudiantes que deseas asignar a este grupo. Los estudiantes ya asignados aparecen marcados.
              </p>
            </div>

            <div className="mb-4">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Estudiantes seleccionados: <span className="font-bold">{estudiantesSeleccionados.length}</span>
              </p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
              {estudiantes.length > 0 ? (
                estudiantes.map((estudiante) => (
                  <div
                    key={estudiante.id}
                    onClick={() => toggleEstudiante(estudiante.id)}
                    className={`p-4 rounded-lg border ${border} cursor-pointer transition ${
                      estudiantesSeleccionados.includes(estudiante.id)
                        ? 'bg-blue-500 bg-opacity-10 border-blue-500'
                        : darkMode
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                          estudiantesSeleccionados.includes(estudiante.id)
                            ? 'bg-blue-500 border-blue-500'
                            : border
                        }`}
                      >
                        {estudiantesSeleccionados.includes(estudiante.id) && (
                          <CheckSquare size={16} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${text}`}>{estudiante.nombre}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {estudiante.email}
                        </p>
                      </div>
                      {estudiante.curso && (
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {estudiante.curso}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users size={48} className={`mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
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
                className={`px-4 py-2 rounded-lg border ${border} ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } transition`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignarEstudiantes}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
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
          <div className={`${card} rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={`text-2xl font-bold ${text}`}>{grupoSeleccionado.nombre}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {grupoSeleccionado.curso} • Código: {grupoSeleccionado.codigo}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalDetalleGrupo(false);
                  setGrupoSeleccionado(null);
                }}
                className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Users className="text-blue-500 mb-2" size={24} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estudiantes</p>
                <p className={`text-xl font-bold ${text}`}>
                  {grupoSeleccionado.estudiantesActivos}/{grupoSeleccionado.estudiantesTotales}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <TrendingUp className="text-green-500 mb-2" size={24} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progreso</p>
                <p className={`text-xl font-bold ${text}`}>{grupoSeleccionado.progreso}%</p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <ClipboardCheck className="text-purple-500 mb-2" size={24} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tareas</p>
                <p className={`text-xl font-bold ${text}`}>{grupoSeleccionado.tareas?.length || 0}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className={`font-bold ${text} mb-3`}>Información del Grupo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {grupoSeleccionado.horario}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-400" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {grupoSeleccionado.aula}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Próxima clase: {grupoSeleccionado.proximaClase}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className={`font-bold ${text}`}>Miembros del Grupo</h4>
                  <button
                    onClick={() => {
                      setModalDetalleGrupo(false);
                      abrirModalAsignar(grupoSeleccionado);
                    }}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
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
                        className={`p-3 rounded-lg border ${border} flex items-center justify-between`}
                      >
                        <div>
                          <p className={`font-medium ${text}`}>{estudiante.nombre}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {estudiante.email}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar a ${estudiante.nombre} del grupo?`)) {
                              eliminarEstudiante?.(grupoSeleccionado.id, estudiante.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-600 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-6 rounded-lg border ${border} text-center`}>
                    <Users size={32} className={`mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      No hay estudiantes asignados a este grupo
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className={`font-bold ${text} mb-3`}>Tareas Grupales</h4>
                {grupoSeleccionado.tareas && grupoSeleccionado.tareas.length > 0 ? (
                  <div className="space-y-2">
                    {grupoSeleccionado.tareas.map((tarea: any) => (
                      <div
                        key={tarea.id}
                        className={`p-3 rounded-lg border ${border}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-medium ${text}`}>{tarea.titulo}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Entrega: {tarea.fechaEntrega} • {tarea.puntos} puntos
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            tarea.estado === 'pendiente'
                              ? 'bg-yellow-500/20 text-yellow-600'
                              : tarea.estado === 'entregada'
                              ? 'bg-blue-500/20 text-blue-600'
                              : 'bg-green-500/20 text-green-600'
                          }`}>
                            {tarea.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-6 rounded-lg border ${border} text-center`}>
                    <ClipboardCheck size={32} className={`mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
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
