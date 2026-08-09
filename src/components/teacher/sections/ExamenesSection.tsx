import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  Search,
  Image as ImageIcon,
  AlertCircle,
  Book,
  Send,
  X,
  Save,
  Paperclip
} from 'lucide-react';
import { Exam, Question, ExamDetalle } from '../../../types/teacher.types';

interface ExamenesSectionProps {
  examenes: Exam[];
  bancoPreguntas: Question[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  crearExamen: (examenData: Partial<ExamDetalle>) => void;
  editarExamen: (examenId: number, examenData: Partial<ExamDetalle>) => void;
  eliminarExamen: (examenId: number) => void;
  publicarExamen: (examenId: number) => void;
  agregarPregunta: (pregunta: Omit<Question, 'id'>) => void;
  verResultadosExamen: (examenId: number) => void;
  obtenerExamenDetallado: (examenId: number) => ExamDetalle | null;
  editarPregunta: (preguntaId: number, preguntaData?: Partial<Question>) => void;
  eliminarPregunta: (preguntaId: number, confirmar?: boolean) => void;
  cursos?: any[];
}

export const ExamenesSection: React.FC<ExamenesSectionProps> = ({
  examenes,
  bancoPreguntas,
  card,
  text,
  border,
  crearExamen,
  editarExamen,
  eliminarExamen,
  publicarExamen,
  agregarPregunta,
  verResultadosExamen,
  obtenerExamenDetallado,
  editarPregunta,
  eliminarPregunta,
  cursos = []
}) => {
  const [filtro, setFiltro] = useState<'todos' | 'programado' | 'activo' | 'finalizado'>('todos');
  const [modalCrearExamen, setModalCrearExamen] = useState(false);
  const [modalBancoPreguntas, setModalBancoPreguntas] = useState(false);
  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);
  const [examenParaVistaPrevia, setExamenParaVistaPrevia] = useState<Partial<ExamDetalle> | null>(null);
  const [examenEnEdicion, setExamenEnEdicion] = useState<Partial<ExamDetalle> | null>(null);
  const [tabActiva, setTabActiva] = useState<'info' | 'preguntas' | 'config'>('info');

  // Estado para nuevo examen
  const [nuevoExamen, setNuevoExamen] = useState<Partial<ExamDetalle>>({
    titulo: '',
    curso: '',
    fecha: '',
    duracion: '',
    estado: 'programado',
    participantes: 0,
    preguntas: [],
    instrucciones: '',
    puntajeTotal: 0,
    notaMinima: 6,
    intentosPermitidos: 1,
    mostrarResultados: true,
    mezclarPreguntas: false
  });

  // Estado para banco de preguntas
  const [busquedaPregunta, setBusquedaPregunta] = useState('');
  const [filtroCategoriaPreguntas, setFiltroCategoriaPreguntas] = useState('todas');
  const [filtroTipoPregunta, setFiltroTipoPregunta] = useState('todos');
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState<number[]>([]);

  // Estado para nueva pregunta
  const [modalNuevaPregunta, setModalNuevaPregunta] = useState(false);
  const [preguntaEnEdicion, setPreguntaEnEdicion] = useState<Question | null>(null);
  const [nuevaPregunta, setNuevaPregunta] = useState<Omit<Question, 'id'>>({
    tipo: 'multiple',
    pregunta: '',
    opciones: ['', '', '', ''],
    respuestaCorrecta: 0,
    puntos: 1,
    categoria: 'General',
    explicacion: ''
  });
  const [archivoAdjuntoPregunta, setArchivoAdjuntoPregunta] = useState<File | null>(null);

  const examenesFiltrados = examenes.filter(examen => {
    if (filtro === 'todos') return true;
    return examen.estado === filtro;
  });

  const preguntasFiltradas = bancoPreguntas.filter(pregunta => {
    const matchBusqueda = pregunta.pregunta.toLowerCase().includes(busquedaPregunta.toLowerCase());
    const matchCategoria = filtroCategoriaPreguntas === 'todas' || pregunta.categoria === filtroCategoriaPreguntas;
    const matchTipo = filtroTipoPregunta === 'todos' || pregunta.tipo === filtroTipoPregunta;
    return matchBusqueda && matchCategoria && matchTipo;
  });

  const categorias = Array.from(new Set(bancoPreguntas.map(p => p.categoria)));

  const abrirModalCrearExamen = () => {
    setNuevoExamen({
      titulo: '',
      curso: '',
      fecha: '',
      duracion: '',
      estado: 'programado',
      participantes: 0,
      preguntas: [],
      instrucciones: '',
      puntajeTotal: 0,
      notaMinima: 6,
      intentosPermitidos: 1,
      mostrarResultados: true,
      mezclarPreguntas: false
    });
    setTabActiva('info');
    setModalCrearExamen(true);
  };

  const abrirModalEditarExamen = (examen: Exam) => {
    // En un caso real, cargaríamos el examen completo con preguntas
    setNuevoExamen({
      ...examen,
      preguntas: [],
      instrucciones: '',
      puntajeTotal: 0,
      notaMinima: 6,
      intentosPermitidos: 1,
      mostrarResultados: true,
      mezclarPreguntas: false
    });
    setExamenEnEdicion(examen);
    setTabActiva('info');
    setModalCrearExamen(true);
  };

  const guardarExamen = () => {
    if (!nuevoExamen.titulo || !nuevoExamen.curso || !nuevoExamen.fecha || !nuevoExamen.duracion) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (nuevoExamen.preguntas && nuevoExamen.preguntas.length === 0) {
      alert('El examen debe tener al menos una pregunta');
      return;
    }

    const puntajeTotal = nuevoExamen.preguntas?.reduce((sum, p) => sum + p.puntos, 0) || 0;
    const examenCompleto = { ...nuevoExamen, puntajeTotal };

    if (examenEnEdicion) {
      editarExamen(examenEnEdicion.id!, examenCompleto);
    } else {
      crearExamen(examenCompleto);
    }

    setModalCrearExamen(false);
    setExamenEnEdicion(null);
  };

  const agregarPreguntasDesdebanco = () => {
    const preguntasAAgregar = bancoPreguntas.filter(p => preguntasSeleccionadas.includes(p.id));
    setNuevoExamen({
      ...nuevoExamen,
      preguntas: [...(nuevoExamen.preguntas || []), ...preguntasAAgregar]
    });
    setPreguntasSeleccionadas([]);
    setModalBancoPreguntas(false);
  };

  const toggleSeleccionPregunta = (preguntaId: number) => {
    if (preguntasSeleccionadas.includes(preguntaId)) {
      setPreguntasSeleccionadas(preguntasSeleccionadas.filter(id => id !== preguntaId));
    } else {
      setPreguntasSeleccionadas([...preguntasSeleccionadas, preguntaId]);
    }
  };

  const eliminarPreguntaDelExamen = (index: number) => {
    const nuevasPreguntas = [...(nuevoExamen.preguntas || [])];
    nuevasPreguntas.splice(index, 1);
    setNuevoExamen({ ...nuevoExamen, preguntas: nuevasPreguntas });
  };

  const crearNuevaPregunta = () => {
    if (!nuevaPregunta.pregunta.trim()) {
      alert('La pregunta no puede estar vacía');
      return;
    }

    if (nuevaPregunta.tipo === 'multiple' && nuevaPregunta.opciones) {
      const opcionesValidas = nuevaPregunta.opciones.filter(o => o.trim());
      if (opcionesValidas.length < 2) {
        alert('Debes proporcionar al menos 2 opciones');
        return;
      }
    }

    // Agregar archivo adjunto si existe
    const preguntaConArchivo = {
      ...nuevaPregunta,
      archivoAdjunto: archivoAdjuntoPregunta?.name || undefined
    };

    // Si hay preguntaEnEdicion, editar; sino, crear nueva
    if (preguntaEnEdicion) {
      editarPregunta(preguntaEnEdicion.id, preguntaConArchivo as any);
      setPreguntaEnEdicion(null);
      alert('Pregunta actualizada exitosamente!');
    } else {
      agregarPregunta(preguntaConArchivo as any);
      alert('Pregunta agregada al banco exitosamente!');
    }

    // Resetear formulario
    setNuevaPregunta({
      tipo: 'multiple',
      pregunta: '',
      opciones: ['', '', '', ''],
      respuestaCorrecta: 0,
      puntos: 1,
      categoria: 'General',
      explicacion: ''
    });
    setArchivoAdjuntoPregunta(null);

    setModalNuevaPregunta(false);
  };

  const actualizarOpcionNuevaPregunta = (index: number, valor: string) => {
    const nuevasOpciones = [...(nuevaPregunta.opciones || [])];
    nuevasOpciones[index] = valor;
    setNuevaPregunta({ ...nuevaPregunta, opciones: nuevasOpciones });
  };

  const agregarOpcionNuevaPregunta = () => {
    setNuevaPregunta({
      ...nuevaPregunta,
      opciones: [...(nuevaPregunta.opciones || []), '']
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'activo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${text}`}>Gestión de Exámenes</h2>
          <p className={`${text} opacity-70 mt-1`}>
            Crea, administra y califica exámenes de tus cursos
          </p>
        </div>
        <button
          onClick={abrirModalCrearExamen}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Crear Examen
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} p-4 rounded-lg ${border} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${text} opacity-70 text-sm`}>Total Exámenes</p>
              <p className={`text-2xl font-bold ${text}`}>{examenes.length}</p>
            </div>
            <FileText className="text-blue-500" size={32} />
          </div>
        </div>

        <div className={`${card} p-4 rounded-lg ${border} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${text} opacity-70 text-sm`}>Programados</p>
              <p className={`text-2xl font-bold ${text}`}>
                {examenes.filter(e => e.estado === 'programado').length}
              </p>
            </div>
            <Calendar className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className={`${card} p-4 rounded-lg ${border} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${text} opacity-70 text-sm`}>Activos</p>
              <p className={`text-2xl font-bold ${text}`}>
                {examenes.filter(e => e.estado === 'activo').length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className={`${card} p-4 rounded-lg ${border} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${text} opacity-70 text-sm`}>Banco Preguntas</p>
              <p className={`text-2xl font-bold ${text}`}>{bancoPreguntas.length}</p>
            </div>
            <Book className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'todos'
              ? 'bg-blue-600 text-white'
              : `${card} ${text} hover:bg-gray-200 dark:hover:bg-gray-700`
          }`}
        >
          Todos ({examenes.length})
        </button>
        <button
          onClick={() => setFiltro('programado')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'programado'
              ? 'bg-blue-600 text-white'
              : `${card} ${text} hover:bg-gray-200 dark:hover:bg-gray-700`
          }`}
        >
          Programados ({examenes.filter(e => e.estado === 'programado').length})
        </button>
        <button
          onClick={() => setFiltro('activo')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'activo'
              ? 'bg-blue-600 text-white'
              : `${card} ${text} hover:bg-gray-200 dark:hover:bg-gray-700`
          }`}
        >
          Activos ({examenes.filter(e => e.estado === 'activo').length})
        </button>
        <button
          onClick={() => setFiltro('finalizado')}
          className={`px-4 py-2 rounded-lg transition ${
            filtro === 'finalizado'
              ? 'bg-blue-600 text-white'
              : `${card} ${text} hover:bg-gray-200 dark:hover:bg-gray-700`
          }`}
        >
          Finalizados ({examenes.filter(e => e.estado === 'finalizado').length})
        </button>
      </div>

      {/* Lista de Exámenes */}
      <div className="grid grid-cols-1 gap-4">
        {examenesFiltrados.length === 0 ? (
          <div className={`${card} p-8 rounded-lg ${border} border text-center`}>
            <FileText size={48} className={`${text} opacity-30 mx-auto mb-4`} />
            <p className={`${text} opacity-70`}>
              No hay exámenes {filtro !== 'todos' ? filtro + 's' : ''} para mostrar
            </p>
          </div>
        ) : (
          examenesFiltrados.map(examen => (
            <div key={examen.id} className={`${card} p-6 rounded-lg ${border} border`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${text}`}>{examen.titulo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(examen.estado)}`}>
                      {examen.estado.charAt(0).toUpperCase() + examen.estado.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Book size={16} className={`${text} opacity-70`} />
                      <span className={`${text} text-sm`}>{examen.curso}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={`${text} opacity-70`} />
                      <span className={`${text} text-sm`}>{examen.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={`${text} opacity-70`} />
                      <span className={`${text} text-sm`}>{examen.duracion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className={`${text} opacity-70`} />
                      <span className={`${text} text-sm`}>{examen.participantes} estudiantes</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => abrirModalEditarExamen(examen)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      const examenDetallado = obtenerExamenDetallado(examen.id);
                      if (examenDetallado) {
                        setExamenParaVistaPrevia(examenDetallado);
                        setModalVistaPrevia(true);
                      } else {
                        alert('No se pudo cargar el examen detallado');
                      }
                    }}
                    className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition"
                    title="Vista previa"
                  >
                    <Eye size={18} className="text-green-600" />
                  </button>
                  {examen.estado === 'programado' && (
                    <button
                      onClick={() => publicarExamen(examen.id)}
                      className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition"
                      title="Publicar"
                    >
                      <Send size={18} className="text-purple-600" />
                    </button>
                  )}
                  {examen.estado === 'finalizado' && (
                    <button
                      onClick={() => verResultadosExamen(examen.id)}
                      className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition"
                      title="Ver resultados"
                    >
                      <FileText size={18} className="text-indigo-600" />
                    </button>
                  )}
                  <button
                    onClick={() => eliminarExamen(examen.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear/Editar Examen */}
      {modalCrearExamen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* Header del Modal */}
            <div className={`p-6 ${border} border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${text}`}>
                {examenEnEdicion ? 'Editar Examen' : 'Crear Nuevo Examen'}
              </h3>
              <button
                onClick={() => {
                  setModalCrearExamen(false);
                  setExamenEnEdicion(null);
                }}
                className={`${text} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex gap-1 px-6 pt-4 ${border} border-b`}>
              <button
                onClick={() => setTabActiva('info')}
                className={`px-4 py-2 rounded-t-lg transition ${
                  tabActiva === 'info'
                    ? 'bg-blue-600 text-white'
                    : `${text} hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                Información Básica
              </button>
              <button
                onClick={() => setTabActiva('preguntas')}
                className={`px-4 py-2 rounded-t-lg transition ${
                  tabActiva === 'preguntas'
                    ? 'bg-blue-600 text-white'
                    : `${text} hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                Preguntas ({nuevoExamen.preguntas?.length || 0})
              </button>
              <button
                onClick={() => setTabActiva('config')}
                className={`px-4 py-2 rounded-t-lg transition ${
                  tabActiva === 'config'
                    ? 'bg-blue-600 text-white'
                    : `${text} hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                Configuración
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {tabActiva === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block ${text} mb-2 font-medium`}>
                      Título del Examen *
                    </label>
                    <input
                      type="text"
                      value={nuevoExamen.titulo || ''}
                      onChange={(e) => setNuevoExamen({ ...nuevoExamen, titulo: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      placeholder="Ej: Examen Parcial 1 - Programación"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block ${text} mb-2 font-medium`}>
                        Curso *
                      </label>
                      <select
                        value={nuevoExamen.curso || ''}
                        onChange={(e) => setNuevoExamen({ ...nuevoExamen, curso: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      >
                        <option value="">Seleccionar curso</option>
                        {cursos.map((curso) => (
                          <option key={curso.id} value={curso.nombre}>
                            {curso.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block ${text} mb-2 font-medium`}>
                        Fecha del Examen *
                      </label>
                      <input
                        type="date"
                        value={nuevoExamen.fecha || ''}
                        onChange={(e) => setNuevoExamen({ ...nuevoExamen, fecha: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block ${text} mb-2 font-medium`}>
                      Duración *
                    </label>
                    <input
                      type="text"
                      value={nuevoExamen.duracion || ''}
                      onChange={(e) => setNuevoExamen({ ...nuevoExamen, duracion: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      placeholder="Ej: 2h o 90 minutos"
                    />
                  </div>

                  <div>
                    <label className={`block ${text} mb-2 font-medium`}>
                      Instrucciones del Examen
                    </label>
                    <textarea
                      value={nuevoExamen.instrucciones || ''}
                      onChange={(e) => setNuevoExamen({ ...nuevoExamen, instrucciones: e.target.value })}
                      rows={4}
                      className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      placeholder="Instrucciones generales para los estudiantes..."
                    />
                  </div>
                </div>
              )}

              {tabActiva === 'preguntas' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className={`${text} font-medium`}>
                        Preguntas del Examen: {nuevoExamen.preguntas?.length || 0}
                      </p>
                      <p className={`${text} opacity-70 text-sm`}>
                        Puntaje total: {nuevoExamen.preguntas?.reduce((sum, p) => sum + p.puntos, 0) || 0} puntos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModalNuevaPregunta(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
                      >
                        <Plus size={18} />
                        Crear Pregunta
                      </button>
                      <button
                        onClick={() => setModalBancoPreguntas(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                      >
                        <Book size={18} />
                        Banco de Preguntas
                      </button>
                    </div>
                  </div>

                  {nuevoExamen.preguntas && nuevoExamen.preguntas.length > 0 ? (
                    <div className="space-y-3">
                      {nuevoExamen.preguntas.map((pregunta, index) => (
                        <div key={index} className={`${border} border rounded-lg p-4`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`${text} font-medium`}>#{index + 1}</span>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                                  {pregunta.tipo}
                                </span>
                                <span className={`${text} opacity-70 text-sm`}>
                                  {pregunta.puntos} {pregunta.puntos === 1 ? 'punto' : 'puntos'}
                                </span>
                              </div>
                              <p className={`${text} mb-2`}>{pregunta.pregunta}</p>

                              {pregunta.tipo === 'multiple' && pregunta.opciones && (
                                <div className="ml-4 space-y-1">
                                  {pregunta.opciones.map((opcion, i) => (
                                    <div key={i} className={`${text} opacity-70 text-sm flex items-center gap-2`}>
                                      {i === pregunta.respuestaCorrecta && (
                                        <CheckCircle size={14} className="text-green-500" />
                                      )}
                                      {String.fromCharCode(65 + i)}. {opcion}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {pregunta.tipo === 'verdadero-falso' && (
                                <p className={`${text} opacity-70 text-sm ml-4`}>
                                  Respuesta correcta: {pregunta.respuestaCorrecta ? 'Verdadero' : 'Falso'}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => eliminarPreguntaDelExamen(index)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText size={48} className={`${text} opacity-30 mx-auto mb-4`} />
                      <p className={`${text} opacity-70 mb-4`}>
                        No hay preguntas agregadas al examen
                      </p>
                      <button
                        onClick={() => setModalBancoPreguntas(true)}
                        className="text-blue-600 hover:underline"
                      >
                        Agregar preguntas desde el banco
                      </button>
                    </div>
                  )}
                </div>
              )}

              {tabActiva === 'config' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block ${text} mb-2 font-medium`}>
                        Nota Mínima Aprobatoria
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={nuevoExamen.notaMinima || 6}
                        onChange={(e) => setNuevoExamen({ ...nuevoExamen, notaMinima: parseFloat(e.target.value) })}
                        className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      />
                    </div>

                    <div>
                      <label className={`block ${text} mb-2 font-medium`}>
                        Intentos Permitidos
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={nuevoExamen.intentosPermitidos || 1}
                        onChange={(e) => setNuevoExamen({ ...nuevoExamen, intentosPermitidos: parseInt(e.target.value) })}
                        className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nuevoExamen.mostrarResultados || false}
                        onChange={(e) => setNuevoExamen({ ...nuevoExamen, mostrarResultados: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <div>
                        <p className={`${text} font-medium`}>Mostrar resultados inmediatos</p>
                        <p className={`${text} opacity-70 text-sm`}>
                          Los estudiantes verán su calificación al finalizar
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nuevoExamen.mezclarPreguntas || false}
                        onChange={(e) => setNuevoExamen({ ...nuevoExamen, mezclarPreguntas: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <div>
                        <p className={`${text} font-medium`}>Mezclar preguntas</p>
                        <p className={`${text} opacity-70 text-sm`}>
                          Las preguntas aparecerán en orden aleatorio para cada estudiante
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className={`p-6 ${border} border-t flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setModalCrearExamen(false);
                  setExamenEnEdicion(null);
                }}
                className={`px-4 py-2 rounded-lg ${text} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
              >
                Cancelar
              </button>
              <button
                onClick={guardarExamen}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save size={18} />
                {examenEnEdicion ? 'Guardar Cambios' : 'Crear Examen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Banco de Preguntas */}
      {modalBancoPreguntas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className={`p-6 ${border} border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${text}`}>
                Banco de Preguntas ({preguntasSeleccionadas.length} seleccionadas)
              </h3>
              <button
                onClick={() => setModalBancoPreguntas(false)}
                className={`${text} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className={`p-4 ${border} border-b space-y-3`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={busquedaPregunta}
                  onChange={(e) => setBusquedaPregunta(e.target.value)}
                  placeholder="Buscar preguntas..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filtroCategoriaPreguntas}
                  onChange={(e) => setFiltroCategoriaPreguntas(e.target.value)}
                  className={`px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filtroTipoPregunta}
                  onChange={(e) => setFiltroTipoPregunta(e.target.value)}
                  className={`px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="multiple">Opción Múltiple</option>
                  <option value="verdadero-falso">Verdadero/Falso</option>
                  <option value="abierta">Pregunta Abierta</option>
                </select>
              </div>
            </div>

            {/* Lista de Preguntas */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {preguntasFiltradas.length === 0 ? (
                <div className="text-center py-8">
                  <Book size={48} className={`${text} opacity-30 mx-auto mb-4`} />
                  <p className={`${text} opacity-70`}>No se encontraron preguntas</p>
                </div>
              ) : (
                preguntasFiltradas.map(pregunta => (
                  <div
                    key={pregunta.id}
                    className={`${border} border rounded-lg p-4 ${
                      preguntasSeleccionadas.includes(pregunta.id) ? 'bg-blue-50 dark:bg-blue-900 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={preguntasSeleccionadas.includes(pregunta.id)}
                        onChange={() => toggleSeleccionPregunta(pregunta.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                            {pregunta.categoria}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                            {pregunta.tipo}
                          </span>
                          <span className={`${text} opacity-70 text-xs`}>
                            {pregunta.puntos} pts
                          </span>
                        </div>
                        <p className={`${text} font-medium mb-2`}>{pregunta.pregunta}</p>
                        {pregunta.tipo === 'multiple' && pregunta.opciones && (
                          <div className="ml-4 space-y-1">
                            {pregunta.opciones.slice(0, 2).map((opcion, i) => (
                              <p key={i} className={`${text} opacity-70 text-sm`}>
                                {String.fromCharCode(65 + i)}. {opcion}
                              </p>
                            ))}
                            {pregunta.opciones.length > 2 && (
                              <p className={`${text} opacity-50 text-xs`}>
                                ... y {pregunta.opciones.length - 2} opciones más
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreguntaEnEdicion(pregunta);
                            setNuevaPregunta({
                              tipo: pregunta.tipo,
                              pregunta: pregunta.pregunta,
                              opciones: pregunta.opciones || ['', '', '', ''],
                              respuestaCorrecta: pregunta.respuestaCorrecta,
                              puntos: pregunta.puntos,
                              categoria: pregunta.categoria,
                              explicacion: pregunta.explicacion || ''
                            });
                            setModalNuevaPregunta(true);
                          }}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
                          title="Editar pregunta"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Estás seguro de que deseas eliminar esta pregunta del banco?\n\n"${pregunta.pregunta}"`)) {
                              eliminarPregunta(pregunta.id, false);
                            }
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
                          title="Eliminar pregunta"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className={`p-6 ${border} border-t flex justify-between items-center`}>
              <p className={`${text} opacity-70`}>
                {preguntasSeleccionadas.length} {preguntasSeleccionadas.length === 1 ? 'pregunta seleccionada' : 'preguntas seleccionadas'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalBancoPreguntas(false)}
                  className={`px-4 py-2 rounded-lg ${text} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
                >
                  Cancelar
                </button>
                <button
                  onClick={agregarPreguntasDesdebanco}
                  disabled={preguntasSeleccionadas.length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar Preguntas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Pregunta */}
      {modalNuevaPregunta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className={`p-6 ${border} border-b flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${text}`}>
                {preguntaEnEdicion ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
              </h3>
              <button
                onClick={() => {
                  setModalNuevaPregunta(false);
                  setPreguntaEnEdicion(null);
                }}
                className={`${text} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${text} mb-2 font-medium`}>Tipo de Pregunta</label>
                  <select
                    value={nuevaPregunta.tipo}
                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, tipo: e.target.value as any })}
                    className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                  >
                    <option value="multiple">Opción Múltiple</option>
                    <option value="verdadero-falso">Verdadero/Falso</option>
                    <option value="abierta">Pregunta Abierta</option>
                  </select>
                </div>

                <div>
                  <label className={`block ${text} mb-2 font-medium`}>Categoría</label>
                  <input
                    type="text"
                    value={nuevaPregunta.categoria}
                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, categoria: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                    placeholder="Ej: Conceptos básicos"
                  />
                </div>
              </div>

              <div>
                <label className={`block ${text} mb-2 font-medium`}>Pregunta *</label>
                <textarea
                  value={nuevaPregunta.pregunta}
                  onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                  placeholder="Escribe la pregunta..."
                />
              </div>

              {nuevaPregunta.tipo === 'multiple' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`${text} font-medium`}>Opciones de Respuesta</label>
                    <button
                      onClick={agregarOpcionNuevaPregunta}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Agregar opción
                    </button>
                  </div>
                  <div className="space-y-2">
                    {nuevaPregunta.opciones?.map((opcion, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="respuesta-correcta"
                          checked={nuevaPregunta.respuestaCorrecta === index}
                          onChange={() => setNuevaPregunta({ ...nuevaPregunta, respuestaCorrecta: index })}
                        />
                        <input
                          type="text"
                          value={opcion}
                          onChange={(e) => actualizarOpcionNuevaPregunta(index, e.target.value)}
                          className={`flex-1 px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                          placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className={`${text} opacity-70 text-sm mt-2`}>
                    Marca la opción correcta
                  </p>
                </div>
              )}

              {nuevaPregunta.tipo === 'verdadero-falso' && (
                <div>
                  <label className={`block ${text} mb-2 font-medium`}>Respuesta Correcta</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={nuevaPregunta.respuestaCorrecta === true}
                        onChange={() => setNuevaPregunta({ ...nuevaPregunta, respuestaCorrecta: true })}
                      />
                      <span className={text}>Verdadero</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={nuevaPregunta.respuestaCorrecta === false}
                        onChange={() => setNuevaPregunta({ ...nuevaPregunta, respuestaCorrecta: false })}
                      />
                      <span className={text}>Falso</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${text} mb-2 font-medium`}>Puntos</label>
                  <input
                    type="number"
                    min="1"
                    value={nuevaPregunta.puntos}
                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, puntos: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                  />
                </div>

                <div>
                  <label className={`block ${text} mb-2 font-medium`}>Adjuntar Archivo</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="archivo-pregunta"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setArchivoAdjuntoPregunta(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                    <label
                      htmlFor="archivo-pregunta"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg ${border} border ${card} ${text} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                    >
                      <Paperclip size={18} />
                      {archivoAdjuntoPregunta ? (
                        <span className="text-sm truncate">{archivoAdjuntoPregunta.name}</span>
                      ) : (
                        <span className="text-sm">Seleccionar archivo</span>
                      )}
                    </label>
                  </div>
                  {archivoAdjuntoPregunta && (
                    <button
                      onClick={() => setArchivoAdjuntoPregunta(null)}
                      className="text-red-500 text-xs mt-1 hover:underline"
                    >
                      Eliminar archivo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className={`block ${text} mb-2 font-medium`}>Explicación (opcional)</label>
                <textarea
                  value={nuevaPregunta.explicacion || ''}
                  onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, explicacion: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                  placeholder="Explicación de la respuesta correcta..."
                />
              </div>
            </div>

            <div className={`p-6 ${border} border-t flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setModalNuevaPregunta(false);
                  setPreguntaEnEdicion(null);
                }}
                className={`px-4 py-2 rounded-lg ${text} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
              >
                Cancelar
              </button>
              <button
                onClick={crearNuevaPregunta}
                className={`${preguntaEnEdicion ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg transition flex items-center gap-2`}
              >
                {preguntaEnEdicion ? (
                  <>
                    <Save size={18} />
                    Guardar Cambios
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Crear Pregunta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa */}
      {modalVistaPrevia && examenParaVistaPrevia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className={`p-6 ${border} border-b flex justify-between items-center`}>
              <div>
                <h3 className={`text-xl font-bold ${text}`}>Vista Previa del Examen</h3>
                <p className={`${text} opacity-70 text-sm mt-1`}>
                  Así verán el examen los estudiantes
                </p>
              </div>
              <button
                onClick={() => {
                  setModalVistaPrevia(false);
                  setExamenParaVistaPrevia(null);
                }}
                className={`${text} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Header del Examen */}
              <div className={`${border} border rounded-lg p-6 mb-6`}>
                <h2 className={`text-2xl font-bold ${text} mb-2`}>{examenParaVistaPrevia.titulo}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className={`${text} opacity-70 text-sm`}>Curso</p>
                    <p className={`${text} font-medium`}>{examenParaVistaPrevia.curso}</p>
                  </div>
                  <div>
                    <p className={`${text} opacity-70 text-sm`}>Duración</p>
                    <p className={`${text} font-medium`}>{examenParaVistaPrevia.duracion}</p>
                  </div>
                  <div>
                    <p className={`${text} opacity-70 text-sm`}>Puntaje Total</p>
                    <p className={`${text} font-medium`}>{examenParaVistaPrevia.puntajeTotal || 0} puntos</p>
                  </div>
                  <div>
                    <p className={`${text} opacity-70 text-sm`}>Nota Mínima</p>
                    <p className={`${text} font-medium`}>{examenParaVistaPrevia.notaMinima || 6}</p>
                  </div>
                </div>

                {examenParaVistaPrevia.instrucciones && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                      <div>
                        <p className={`${text} font-medium mb-1`}>Instrucciones:</p>
                        <p className={`${text} opacity-80 text-sm whitespace-pre-line`}>
                          {examenParaVistaPrevia.instrucciones}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preguntas */}
              {examenParaVistaPrevia.preguntas && examenParaVistaPrevia.preguntas.length > 0 ? (
                <div className="space-y-6">
                  {examenParaVistaPrevia.preguntas.map((pregunta, index) => (
                    <div key={index} className={`${border} border rounded-lg p-6`}>
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className={`${text} text-lg font-medium mb-2`}>{pregunta.pregunta}</p>
                          <span className={`${text} opacity-70 text-sm`}>
                            {pregunta.puntos} {pregunta.puntos === 1 ? 'punto' : 'puntos'}
                          </span>
                        </div>
                      </div>

                      {pregunta.imagenUrl && (
                        <div className="mb-4">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                            <ImageIcon size={48} className={`${text} opacity-30`} />
                            <span className={`${text} opacity-70 ml-2 text-sm`}>Imagen: {pregunta.imagenUrl}</span>
                          </div>
                        </div>
                      )}

                      {pregunta.tipo === 'multiple' && pregunta.opciones && (
                        <div className="space-y-2 ml-11">
                          {pregunta.opciones.map((opcion, i) => (
                            <label key={i} className={`flex items-center gap-3 p-3 ${border} border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition`}>
                              <input type="radio" name={`pregunta-${index}`} />
                              <span className={text}>{String.fromCharCode(65 + i)}. {opcion}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {pregunta.tipo === 'verdadero-falso' && (
                        <div className="space-y-2 ml-11">
                          <label className={`flex items-center gap-3 p-3 ${border} border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition`}>
                            <input type="radio" name={`pregunta-${index}`} />
                            <span className={text}>Verdadero</span>
                          </label>
                          <label className={`flex items-center gap-3 p-3 ${border} border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition`}>
                            <input type="radio" name={`pregunta-${index}`} />
                            <span className={text}>Falso</span>
                          </label>
                        </div>
                      )}

                      {pregunta.tipo === 'abierta' && (
                        <div className="ml-11">
                          <textarea
                            rows={4}
                            placeholder="Escribe tu respuesta aquí..."
                            className={`w-full px-4 py-3 rounded-lg ${border} border ${card} ${text}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className={`${text} opacity-20 mx-auto mb-4`} />
                  <p className={`${text} opacity-70`}>
                    No hay preguntas para previsualizar
                  </p>
                </div>
              )}
            </div>

            <div className={`p-6 ${border} border-t flex justify-end`}>
              <button
                onClick={() => {
                  setModalVistaPrevia(false);
                  setExamenParaVistaPrevia(null);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
