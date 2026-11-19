import React, { useState } from 'react';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Link as LinkIcon,
  Play,
  Square,
  Upload,
  Trash2,
  Edit,
  Eye,
  Search,
  Download,
  Share2
} from 'lucide-react';
import { ClaseVivo } from '../../../types/teacher.types';
import { uploadsApi } from '../../../api/endpoints/uploads';
import { avisar } from '../../ui';

interface ClasesSectionProps {
  clasesVivo: ClaseVivo[];
  programarClase: (claseData: any) => void;
  subirClasePregrabada: (claseData: any) => void;
  iniciarClaseEnVivo: (claseId: number) => void;
  finalizarClase: (claseId: number) => void;
  compartirEnlaceClase: (claseId: number) => void;
  verParticipacionClase: (claseId: number) => void;
  eliminarClase: (claseId: number) => void;
  editarClase: (claseId: number, claseData: any) => void;
}

export const ClasesSection: React.FC<ClasesSectionProps> = ({
  clasesVivo,
  programarClase,
  subirClasePregrabada,
  iniciarClaseEnVivo,
  finalizarClase,
  compartirEnlaceClase,
  verParticipacionClase,
  eliminarClase,
  editarClase
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [filtroCurso, setFiltroCurso] = useState<string>('todos');
  const [modalProgramar, setModalProgramar] = useState(false);
  const [modalSubirPregrabada, setModalSubirPregrabada] = useState(false);
  const [modalDetalleClase, setModalDetalleClase] = useState<ClaseVivo | null>(null);
  const [claseEditando, setClaseEditando] = useState<ClaseVivo | null>(null);

  const [nuevaClase, setNuevaClase] = useState<{
    titulo: string;
    curso: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    duracion: string;
    enlaceReunion: string;
    plataforma: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Otra';
    descripcion: string;
  }>({
    titulo: '',
    curso: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    duracion: '',
    enlaceReunion: '',
    plataforma: 'Zoom',
    descripcion: ''
  });

  const [clasePregrabada, setClasePregrabada] = useState({
    titulo: '',
    curso: '',
    fecha: '',
    duracion: '',
    descripcion: '',
    grabacionUrl: ''
  });

  // Filtrar clases
  const clasesFiltradas = clasesVivo.filter(clase => {
    const matchBusqueda = clase.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          clase.curso.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = filtroTipo === 'todas' || clase.tipo === filtroTipo;
    const matchCurso = filtroCurso === 'todos' || clase.curso === filtroCurso;
    return matchBusqueda && matchTipo && matchCurso;
  });

  // Obtener cursos únicos
  const cursosUnicos = Array.from(new Set(clasesVivo.map(c => c.curso)));

  // Estadísticas
  const estadisticas = {
    total: clasesVivo.length,
    enCurso: clasesVivo.filter(c => c.tipo === 'en_curso').length,
    programadas: clasesVivo.filter(c => c.tipo === 'programada').length,
    finalizadas: clasesVivo.filter(c => c.tipo === 'finalizada').length,
    pregrabadas: clasesVivo.filter(c => c.tipo === 'pregrabada').length
  };

  const handleProgramarClase = () => {
    if (!nuevaClase.titulo || !nuevaClase.curso || !nuevaClase.fecha || !nuevaClase.horaInicio || !nuevaClase.horaFin) {
      avisar.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (claseEditando) {
      editarClase(claseEditando.id, nuevaClase);
      setClaseEditando(null);
    } else {
      programarClase(nuevaClase);
    }

    setModalProgramar(false);
    setNuevaClase({
      titulo: '',
      curso: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      duracion: '',
      enlaceReunion: '',
      plataforma: 'Zoom',
      descripcion: ''
    });
  };

  const handleSubirPregrabada = () => {
    if (!clasePregrabada.titulo || !clasePregrabada.curso || !clasePregrabada.grabacionUrl) {
      avisar.error('Por favor completa todos los campos obligatorios');
      return;
    }

    subirClasePregrabada(clasePregrabada);
    setModalSubirPregrabada(false);
    setClasePregrabada({
      titulo: '',
      curso: '',
      fecha: '',
      duracion: '',
      descripcion: '',
      grabacionUrl: ''
    });
  };

  const abrirEditar = (clase: ClaseVivo) => {
    setClaseEditando(clase);
    setNuevaClase({
      titulo: clase.titulo,
      curso: clase.curso,
      fecha: clase.fecha,
      horaInicio: clase.horaInicio,
      horaFin: clase.horaFin,
      duracion: clase.duracion,
      enlaceReunion: clase.enlaceReunion || '',
      plataforma: clase.plataforma,
      descripcion: clase.descripcion || ''
    });
    setModalProgramar(true);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'en_curso': return 'bg-pn-ok-soft text-pn-ok';
      case 'programada': return 'bg-pn-accent-soft text-pn-accent-text';
      case 'finalizada': return 'bg-pn-surface-3 text-pn-ink';
      case 'pregrabada': return 'bg-pn-accent-2-soft text-pn-accent-2-text';
      default: return 'bg-pn-surface-3 text-pn-ink';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'en_curso': return 'En Curso';
      case 'programada': return 'Programada';
      case 'finalizada': return 'Finalizada';
      case 'pregrabada': return 'Pregrabada';
      default: return tipo;
    }
  };

  const getPlataformaIcon = (plataforma: string) => {
    return <Video size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={`bg-pn-surface p-4 rounded-lg shadow-sm border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>
                Total
              </p>
              <p className={`text-2xl font-bold text-pn-ink`}>{estadisticas.total}</p>
            </div>
            <Video className="text-pn-accent-text" size={32} />
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg shadow-sm border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>
                En Curso
              </p>
              <p className={`text-2xl font-bold text-pn-ok`}>{estadisticas.enCurso}</p>
            </div>
            <Play className="text-pn-ok" size={32} />
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg shadow-sm border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>
                Programadas
              </p>
              <p className={`text-2xl font-bold text-pn-accent-text`}>{estadisticas.programadas}</p>
            </div>
            <Calendar className="text-pn-accent-text" size={32} />
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg shadow-sm border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>
                Finalizadas
              </p>
              <p className={`text-2xl font-bold text-pn-ink-2`}>{estadisticas.finalizadas}</p>
            </div>
            <Square className="text-pn-muted" size={32} />
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg shadow-sm border border-pn-line`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-pn-ink-2`}>
                Pregrabadas
              </p>
              <p className={`text-2xl font-bold text-pn-accent-2-text`}>{estadisticas.pregrabadas}</p>
            </div>
            <Upload className="text-pn-accent-2-text" size={32} />
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className={`bg-pn-surface p-4 rounded-lg shadow-sm border border-pn-line`}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted" size={20} />
              <input
                type="text"
                placeholder="Buscar clases..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className={`px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
            >
              <option value="todas">Todas</option>
              <option value="en_curso">En Curso</option>
              <option value="programada">Programadas</option>
              <option value="finalizada">Finalizadas</option>
              <option value="pregrabada">Pregrabadas</option>
            </select>

            <select
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
              className={`px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
            >
              <option value="todos">Todos los cursos</option>
              {cursosUnicos.map(curso => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>

            <button
              onClick={() => setModalProgramar(true)}
              className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Calendar size={20} />
              Programar Clase
            </button>

            <button
              onClick={() => setModalSubirPregrabada(true)}
              className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Upload size={20} />
              Subir Pregrabada
            </button>
          </div>
        </div>
      </div>

      {/* Lista de clases */}
      <div className="grid grid-cols-1 gap-4">
        {clasesFiltradas.length === 0 ? (
          <div className={`bg-pn-surface p-8 rounded-lg shadow-sm border border-pn-line text-center`}>
            <Video className="mx-auto text-pn-muted mb-4" size={48} />
            <p className={`text-pn-ink text-lg font-semibold mb-2`}>No hay clases</p>
            <p className={`text-pn-ink-2`}>
              Programa una clase o sube contenido pregrabado para comenzar
            </p>
          </div>
        ) : (
          clasesFiltradas.map(clase => (
            <div key={clase.id} className={`bg-pn-surface p-6 rounded-lg shadow-sm border border-pn-line hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-xl font-semibold text-pn-ink`}>{clase.titulo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTipoColor(clase.tipo)}`}>
                      {getTipoLabel(clase.tipo)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Video className="text-pn-muted" size={18} />
                      <span className={`text-sm text-pn-ink-2`}>
                        {clase.curso}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="text-pn-muted" size={18} />
                      <span className={`text-sm text-pn-ink-2`}>
                        {clase.fecha}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="text-pn-muted" size={18} />
                      <span className={`text-sm text-pn-ink-2`}>
                        {clase.horaInicio} - {clase.horaFin}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getPlataformaIcon(clase.plataforma)}
                      <span className={`text-sm text-pn-ink-2`}>
                        {clase.plataforma}
                      </span>
                    </div>
                  </div>

                  {clase.descripcion && (
                    <p className={`mt-3 text-sm text-pn-ink-2`}>
                      {clase.descripcion}
                    </p>
                  )}

                  {clase.participantes && clase.participantes.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <Users className="text-pn-muted" size={18} />
                      <span className={`text-sm text-pn-ink-2`}>
                        {clase.participantes.filter(p => p.asistio).length} / {clase.participantes.length} estudiantes asistieron
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {clase.tipo === 'programada' && (
                    <button
                      onClick={() => iniciarClaseEnVivo(clase.id)}
                      className="bg-pn-ok hover:bg-pn-ok text-pn-surface px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <Play size={18} />
                      Iniciar
                    </button>
                  )}

                  {clase.tipo === 'en_curso' && (
                    <button
                      onClick={() => finalizarClase(clase.id)}
                      className="bg-pn-danger hover:bg-pn-danger text-pn-surface px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <Square size={18} />
                      Finalizar
                    </button>
                  )}

                  {clase.enlaceReunion && (
                    <button
                      onClick={() => compartirEnlaceClase(clase.id)}
                      className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <Share2 size={18} />
                      Compartir
                    </button>
                  )}

                  {(clase.tipo === 'finalizada' || clase.tipo === 'pregrabada') && clase.participantes && (
                    <button
                      onClick={() => verParticipacionClase(clase.id)}
                      className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <Eye size={18} />
                      Ver Participación
                    </button>
                  )}

                  {clase.grabacionDisponible && (
                    <button
                      onClick={() => setModalDetalleClase(clase)}
                      className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <Download size={18} />
                      Grabación
                    </button>
                  )}

                  <button
                    onClick={() => abrirEditar(clase)}
                    className={`bg-pn-surface-3 hover:bg-pn-line text-pn-ink px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap`}
                  >
                    <Edit size={18} />
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarClase(clase.id)}
                    className="bg-pn-danger hover:bg-pn-danger text-pn-surface px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                  >
                    <Trash2 size={18} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Programar Clase */}
      {modalProgramar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="{claseEditando ? 'Editar Clase' : 'Programar Clase en Vivo'}" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold text-pn-ink mb-6`}>
                {claseEditando ? 'Editar Clase' : 'Programar Clase en Vivo'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Título *
                  </label>
                  <input
                    type="text"
                    value={nuevaClase.titulo}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, titulo: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="Ej: Introducción a React Hooks"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Curso *
                  </label>
                  <select
                    value={nuevaClase.curso}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, curso: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursosUnicos.map(curso => (
                      <option key={curso} value={curso}>{curso}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={nuevaClase.fecha}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, fecha: e.target.value })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Hora Inicio *
                    </label>
                    <input
                      type="time"
                      value={nuevaClase.horaInicio}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, horaInicio: e.target.value })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                      Hora Fin *
                    </label>
                    <input
                      type="time"
                      value={nuevaClase.horaFin}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, horaFin: e.target.value })}
                      className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Plataforma
                  </label>
                  <select
                    value={nuevaClase.plataforma}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, plataforma: e.target.value as any })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Enlace de Reunión
                  </label>
                  <input
                    type="url"
                    value={nuevaClase.enlaceReunion}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, enlaceReunion: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Descripción
                  </label>
                  <textarea
                    value={nuevaClase.descripcion}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, descripcion: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    rows={3}
                    placeholder="Descripción de la clase..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setModalProgramar(false);
                    setClaseEditando(null);
                    setNuevaClase({
                      titulo: '',
                      curso: '',
                      fecha: '',
                      horaInicio: '',
                      horaFin: '',
                      duracion: '',
                      enlaceReunion: '',
                      plataforma: 'Zoom',
                      descripcion: ''
                    });
                  }}
                  className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProgramarClase}
                  className="bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-6 py-2 rounded-lg"
                >
                  {claseEditando ? 'Actualizar' : 'Programar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Subir Clase Pregrabada */}
      {modalSubirPregrabada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Subir Clase Pregrabada" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold text-pn-ink mb-6`}>
                Subir Clase Pregrabada
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Título *
                  </label>
                  <input
                    type="text"
                    value={clasePregrabada.titulo}
                    onChange={(e) => setClasePregrabada({ ...clasePregrabada, titulo: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="Ej: Clase sobre Componentes"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Curso *
                  </label>
                  <select
                    value={clasePregrabada.curso}
                    onChange={(e) => setClasePregrabada({ ...clasePregrabada, curso: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursosUnicos.map(curso => (
                      <option key={curso} value={curso}>{curso}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    URL de la Grabación *
                  </label>
                  <input
                    type="url"
                    value={clasePregrabada.grabacionUrl}
                    onChange={(e) => setClasePregrabada({ ...clasePregrabada, grabacionUrl: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="https://youtube.com/..."
                  />
                  <p className={`text-xs mt-1 text-pn-ink-2`}>
                    URL del video en YouTube, Vimeo, o tu plataforma de almacenamiento
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Duración
                  </label>
                  <input
                    type="text"
                    value={clasePregrabada.duracion}
                    onChange={(e) => setClasePregrabada({ ...clasePregrabada, duracion: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="Ej: 1 hora 30 minutos"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Descripción
                  </label>
                  <textarea
                    value={clasePregrabada.descripcion}
                    onChange={(e) => setClasePregrabada({ ...clasePregrabada, descripcion: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    rows={3}
                    placeholder="Descripción del contenido..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setModalSubirPregrabada(false);
                    setClasePregrabada({
                      titulo: '',
                      curso: '',
                      fecha: '',
                      duracion: '',
                      descripcion: '',
                      grabacionUrl: ''
                    });
                  }}
                  className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubirPregrabada}
                  className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-6 py-2 rounded-lg"
                >
                  Subir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Clase (Ver grabación) */}
      {modalDetalleClase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="{modalDetalleClase.titulo}" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold text-pn-ink mb-6`}>
                {modalDetalleClase.titulo}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTipoColor(modalDetalleClase.tipo)}`}>
                    {getTipoLabel(modalDetalleClase.tipo)}
                  </span>
                  <span className={`text-sm text-pn-ink-2`}>
                    {modalDetalleClase.curso}
                  </span>
                </div>

                {modalDetalleClase.descripcion && (
                  <p className={`text-pn-ink-2`}>
                    {modalDetalleClase.descripcion}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm text-pn-ink-2`}>Fecha</p>
                    <p className={`font-semibold text-pn-ink`}>{modalDetalleClase.fecha}</p>
                  </div>
                  <div>
                    <p className={`text-sm text-pn-ink-2`}>Duración</p>
                    <p className={`font-semibold text-pn-ink`}>{modalDetalleClase.duracion}</p>
                  </div>
                </div>

                {modalDetalleClase.grabacionUrl && (
                  <div>
                    <p className={`text-sm text-pn-ink-2 mb-2`}>
                      Grabación Disponible
                    </p>
                    <button
                      onClick={() =>
                        uploadsApi
                          .abrir(modalDetalleClase.grabacionUrl)
                          .catch(() => avisar.error('No se pudo abrir la grabación.'))
                      }
                      className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                      <Download size={18} />
                      Ver Grabación
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setModalDetalleClase(null)}
                  className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
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
