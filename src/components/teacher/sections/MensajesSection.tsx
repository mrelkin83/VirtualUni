import React, { useState } from 'react';
import {
  Mail, Send, Inbox, Circle, Users, Megaphone, FileText,
  Paperclip, X, Trash2, Search, Filter, Plus
} from 'lucide-react';

interface MensajesSectionProps {
  mensajes: any[];
  cursos: any[];
  setConversacionActiva: (mensaje: any) => void;
  setNuevoMensajeModal: (open: boolean) => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  enviarMensajeMasivo?: (mensajeData: any) => void;
  crearAnuncio?: (anuncioData: any) => void;
  guardarPlantilla?: (plantillaData: any) => void;
  eliminarPlantilla?: (plantillaId: number) => void;
  plantillas?: any[];
}

export const MensajesSection: React.FC<MensajesSectionProps> = ({
  mensajes,
  cursos,
  setConversacionActiva,
  setNuevoMensajeModal,
  darkMode,
  card,
  text,
  border,
  enviarMensajeMasivo,
  crearAnuncio,
  guardarPlantilla,
  eliminarPlantilla,
  plantillas = []
}) => {
  const [vistaActiva, setVistaActiva] = useState<'mensajes' | 'anuncios' | 'plantillas'>('mensajes');
  const [modalMasivo, setModalMasivo] = useState(false);
  const [modalAnuncio, setModalAnuncio] = useState(false);
  const [modalPlantilla, setModalPlantilla] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [mensajeMasivo, setMensajeMasivo] = useState({
    cursoId: '',
    asunto: '',
    mensaje: '',
    adjuntos: [] as File[]
  });

  const [anuncio, setAnuncio] = useState({
    cursoId: '',
    titulo: '',
    contenido: '',
    prioridad: 'normal' as 'baja' | 'normal' | 'alta',
    adjuntos: [] as File[]
  });

  const [plantilla, setPlantilla] = useState({
    nombre: '',
    asunto: '',
    contenido: '',
    categoria: 'general' as 'general' | 'recordatorio' | 'felicitacion' | 'informativo'
  });

  const mensajesRecibidos = mensajes.filter(m => m.tipo === 'recibido');
  const mensajesEnviados = mensajes.filter(m => m.tipo === 'enviado');
  const anuncios = mensajes.filter(m => m.tipo === 'anuncio');
  const noLeidos = mensajesRecibidos.filter(m => !m.leido).length;

  const handleEnviarMasivo = () => {
    if (!mensajeMasivo.cursoId || !mensajeMasivo.asunto || !mensajeMasivo.mensaje) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const curso = cursos.find(c => c.id === parseInt(mensajeMasivo.cursoId));
    if (!curso) {
      alert('Curso no encontrado');
      return;
    }

    enviarMensajeMasivo?.({
      ...mensajeMasivo,
      curso: curso.nombre,
      destinatarios: curso.estudiantes
    });

    setModalMasivo(false);
    setMensajeMasivo({ cursoId: '', asunto: '', mensaje: '', adjuntos: [] });
  };

  const handleCrearAnuncio = () => {
    if (!anuncio.cursoId || !anuncio.titulo || !anuncio.contenido) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const curso = cursos.find(c => c.id === parseInt(anuncio.cursoId));
    if (!curso) {
      alert('Curso no encontrado');
      return;
    }

    crearAnuncio?.({
      ...anuncio,
      curso: curso.nombre
    });

    setModalAnuncio(false);
    setAnuncio({ cursoId: '', titulo: '', contenido: '', prioridad: 'normal', adjuntos: [] });
  };

  const handleGuardarPlantilla = () => {
    if (!plantilla.nombre || !plantilla.asunto || !plantilla.contenido) {
      alert('Por favor completa todos los campos');
      return;
    }

    guardarPlantilla?.(plantilla);
    setModalPlantilla(false);
    setPlantilla({ nombre: '', asunto: '', contenido: '', categoria: 'general' });
  };

  const handleAdjuntarArchivo = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'masivo' | 'anuncio') => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      if (tipo === 'masivo') {
        setMensajeMasivo({ ...mensajeMasivo, adjuntos: [...mensajeMasivo.adjuntos, ...newFiles] });
      } else {
        setAnuncio({ ...anuncio, adjuntos: [...anuncio.adjuntos, ...newFiles] });
      }
    }
  };

  const handleEliminarAdjunto = (index: number, tipo: 'masivo' | 'anuncio') => {
    if (tipo === 'masivo') {
      setMensajeMasivo({
        ...mensajeMasivo,
        adjuntos: mensajeMasivo.adjuntos.filter((_, i) => i !== index)
      });
    } else {
      setAnuncio({
        ...anuncio,
        adjuntos: anuncio.adjuntos.filter((_, i) => i !== index)
      });
    }
  };

  const usarPlantilla = (plantillaItem: any) => {
    setMensajeMasivo({
      ...mensajeMasivo,
      asunto: plantillaItem.asunto,
      mensaje: plantillaItem.contenido
    });
    setModalMasivo(true);
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'baja': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'recordatorio': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'felicitacion': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'informativo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Comunicación</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setModalMasivo(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Users size={18} />
            Mensaje Masivo
          </button>
          <button
            onClick={() => setModalAnuncio(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Megaphone size={18} />
            Nuevo Anuncio
          </button>
          <button
            onClick={() => setNuevoMensajeModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Send size={18} />
            Mensaje Individual
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow-sm border ${border} p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Inbox className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{mensajesRecibidos.length}</p>
              <p className="text-sm text-gray-500">Recibidos</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow-sm border ${border} p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <Mail className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{noLeidos}</p>
              <p className="text-sm text-gray-500">No leídos</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow-sm border ${border} p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <Send className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{mensajesEnviados.length}</p>
              <p className="text-sm text-gray-500">Enviados</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow-sm border ${border} p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <Megaphone className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{anuncios.length}</p>
              <p className="text-sm text-gray-500">Anuncios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${card} rounded-lg shadow-sm border ${border} p-2`}>
        <div className="flex gap-2">
          <button
            onClick={() => setVistaActiva('mensajes')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              vistaActiva === 'mensajes'
                ? 'bg-blue-600 text-white'
                : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Mail className="inline mr-2" size={18} />
            Mensajes
          </button>
          <button
            onClick={() => setVistaActiva('anuncios')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              vistaActiva === 'anuncios'
                ? 'bg-orange-600 text-white'
                : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Megaphone className="inline mr-2" size={18} />
            Anuncios
          </button>
          <button
            onClick={() => setVistaActiva('plantillas')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              vistaActiva === 'plantillas'
                ? 'bg-purple-600 text-white'
                : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FileText className="inline mr-2" size={18} />
            Plantillas
          </button>
        </div>
      </div>

      {/* Vista de Mensajes */}
      {vistaActiva === 'mensajes' && (
        <div className="space-y-6">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar mensajes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>

          {/* Bandeja de Entrada */}
          <div className={`${card} rounded-lg shadow-sm border ${border}`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold ${text} mb-4`}>Bandeja de Entrada</h3>
              <div className="space-y-2">
                {mensajesRecibidos.length === 0 ? (
                  <div className="text-center py-8">
                    <Inbox className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">No hay mensajes recibidos</p>
                  </div>
                ) : (
                  mensajesRecibidos
                    .filter(m =>
                      m.de.toLowerCase().includes(busqueda.toLowerCase()) ||
                      m.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
                      m.mensaje.toLowerCase().includes(busqueda.toLowerCase())
                    )
                    .map((mensaje) => (
                      <div
                        key={mensaje.id}
                        className={`border ${border} rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                          !mensaje.leido ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                        }`}
                        onClick={() => setConversacionActiva(mensaje)}
                      >
                        <div className="flex items-start gap-3">
                          {!mensaje.leido && (
                            <Circle className="text-blue-600 fill-blue-600 flex-shrink-0 mt-1" size={8} />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`font-bold ${text} ${!mensaje.leido ? 'text-blue-600' : ''}`}>
                                {mensaje.de}
                              </h4>
                              <span className="text-xs text-gray-500">{mensaje.fecha}</span>
                            </div>
                            <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm mb-1`}>
                              {mensaje.asunto}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
                              {mensaje.mensaje}
                            </p>
                            {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Paperclip size={14} className="text-gray-500" />
                                <span className="text-xs text-gray-500">{mensaje.adjuntos.length} adjunto(s)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Mensajes Enviados */}
          <div className={`${card} rounded-lg shadow-sm border ${border}`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold ${text} mb-4`}>Mensajes Enviados</h3>
              <div className="space-y-2">
                {mensajesEnviados.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">No hay mensajes enviados</p>
                  </div>
                ) : (
                  mensajesEnviados
                    .filter(m =>
                      m.para.toLowerCase().includes(busqueda.toLowerCase()) ||
                      m.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
                      m.mensaje.toLowerCase().includes(busqueda.toLowerCase())
                    )
                    .map((mensaje) => (
                      <div
                        key={mensaje.id}
                        className={`border ${border} rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                        onClick={() => setConversacionActiva(mensaje)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-bold ${text}`}>Para: {mensaje.para}</h4>
                          <span className="text-xs text-gray-500">{mensaje.fecha}</span>
                        </div>
                        <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm mb-1`}>
                          {mensaje.asunto}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
                          {mensaje.mensaje}
                        </p>
                        {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Paperclip size={14} className="text-gray-500" />
                            <span className="text-xs text-gray-500">{mensaje.adjuntos.length} adjunto(s)</span>
                          </div>
                        )}
                        {mensaje.destinatarios && (
                          <div className="mt-2">
                            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                              Masivo: {mensaje.destinatarios} destinatarios
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Anuncios */}
      {vistaActiva === 'anuncios' && (
        <div className={`${card} rounded-lg shadow-sm border ${border}`}>
          <div className="p-6">
            <h3 className={`text-lg font-bold ${text} mb-4`}>Anuncios del Curso</h3>
            <div className="space-y-4">
              {anuncios.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500 mb-4">No hay anuncios publicados</p>
                  <button
                    onClick={() => setModalAnuncio(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Crear Primer Anuncio
                  </button>
                </div>
              ) : (
                anuncios.map((anuncioItem) => (
                  <div key={anuncioItem.id} className={`border ${border} rounded-lg p-6`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Megaphone className="text-orange-600" size={24} />
                        <h4 className={`text-xl font-bold ${text}`}>{anuncioItem.titulo}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadColor(anuncioItem.prioridad || 'normal')}`}>
                          {anuncioItem.prioridad === 'alta' ? 'Alta Prioridad' : anuncioItem.prioridad === 'baja' ? 'Baja Prioridad' : 'Normal'}
                        </span>
                        <span className="text-xs text-gray-500">{anuncioItem.fecha}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Curso: {anuncioItem.curso}</span>
                    </div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                      {anuncioItem.contenido || anuncioItem.mensaje}
                    </p>
                    {anuncioItem.adjuntos && anuncioItem.adjuntos.length > 0 && (
                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-3 mt-3`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Paperclip size={16} className="text-gray-500" />
                          <span className="text-sm font-semibold">Archivos adjuntos:</span>
                        </div>
                        <div className="space-y-1">
                          {anuncioItem.adjuntos.map((adjunto: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                              <FileText size={14} />
                              <span>{adjunto}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Plantillas */}
      {vistaActiva === 'plantillas' && (
        <div className={`${card} rounded-lg shadow-sm border ${border}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${text}`}>Plantillas de Mensajes</h3>
              <button
                onClick={() => setModalPlantilla(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={18} />
                Nueva Plantilla
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plantillas.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <FileText className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500 mb-4">No hay plantillas guardadas</p>
                  <button
                    onClick={() => setModalPlantilla(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Crear Primera Plantilla
                  </button>
                </div>
              ) : (
                plantillas.map((plantillaItem) => (
                  <div key={plantillaItem.id} className={`border ${border} rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold ${text}`}>{plantillaItem.nombre}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoriaColor(plantillaItem.categoria)}`}>
                        {plantillaItem.categoria}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {plantillaItem.asunto}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 mb-3`}>
                      {plantillaItem.contenido}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => usarPlantilla(plantillaItem)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                      >
                        Usar Plantilla
                      </button>
                      <button
                        onClick={() => eliminarPlantilla?.(plantillaItem.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Mensaje Masivo */}
      {modalMasivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${text}`}>Enviar Mensaje Masivo</h2>
                <button
                  onClick={() => {
                    setModalMasivo(false);
                    setMensajeMasivo({ cursoId: '', asunto: '', mensaje: '', adjuntos: [] });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Curso Destinatario *
                  </label>
                  <select
                    value={mensajeMasivo.cursoId}
                    onChange={(e) => setMensajeMasivo({ ...mensajeMasivo, cursoId: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nombre} ({curso.estudiantes} estudiantes)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={mensajeMasivo.asunto}
                    onChange={(e) => setMensajeMasivo({ ...mensajeMasivo, asunto: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="Asunto del mensaje"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Mensaje *
                  </label>
                  <textarea
                    value={mensajeMasivo.mensaje}
                    onChange={(e) => setMensajeMasivo({ ...mensajeMasivo, mensaje: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    rows={6}
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Archivos Adjuntos
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleAdjuntarArchivo(e, 'masivo')}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                  {mensajeMasivo.adjuntos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {mensajeMasivo.adjuntos.map((file, index) => (
                        <div key={index} className={`flex items-center justify-between p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
                          <div className="flex items-center gap-2">
                            <Paperclip size={16} />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                          </div>
                          <button
                            onClick={() => handleEliminarAdjunto(index, 'masivo')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setModalMasivo(false);
                    setMensajeMasivo({ cursoId: '', asunto: '', mensaje: '', adjuntos: [] });
                  }}
                  className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarMasivo}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  <Send size={18} />
                  Enviar a Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Anuncio */}
      {modalAnuncio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${text}`}>Crear Anuncio</h2>
                <button
                  onClick={() => {
                    setModalAnuncio(false);
                    setAnuncio({ cursoId: '', titulo: '', contenido: '', prioridad: 'normal', adjuntos: [] });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Curso *
                  </label>
                  <select
                    value={anuncio.cursoId}
                    onChange={(e) => setAnuncio({ ...anuncio, cursoId: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Título del Anuncio *
                  </label>
                  <input
                    type="text"
                    value={anuncio.titulo}
                    onChange={(e) => setAnuncio({ ...anuncio, titulo: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="Título del anuncio"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Prioridad
                  </label>
                  <select
                    value={anuncio.prioridad}
                    onChange={(e) => setAnuncio({ ...anuncio, prioridad: e.target.value as any })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Contenido *
                  </label>
                  <textarea
                    value={anuncio.contenido}
                    onChange={(e) => setAnuncio({ ...anuncio, contenido: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    rows={6}
                    placeholder="Contenido del anuncio..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Archivos Adjuntos
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleAdjuntarArchivo(e, 'anuncio')}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                  {anuncio.adjuntos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {anuncio.adjuntos.map((file, index) => (
                        <div key={index} className={`flex items-center justify-between p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
                          <div className="flex items-center gap-2">
                            <Paperclip size={16} />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                          </div>
                          <button
                            onClick={() => handleEliminarAdjunto(index, 'anuncio')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setModalAnuncio(false);
                    setAnuncio({ cursoId: '', titulo: '', contenido: '', prioridad: 'normal', adjuntos: [] });
                  }}
                  className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearAnuncio}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  <Megaphone size={18} />
                  Publicar Anuncio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Plantilla */}
      {modalPlantilla && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${text}`}>Nueva Plantilla</h2>
                <button
                  onClick={() => {
                    setModalPlantilla(false);
                    setPlantilla({ nombre: '', asunto: '', contenido: '', categoria: 'general' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Nombre de la Plantilla *
                  </label>
                  <input
                    type="text"
                    value={plantilla.nombre}
                    onChange={(e) => setPlantilla({ ...plantilla, nombre: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="Ej: Recordatorio de Entrega"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Categoría
                  </label>
                  <select
                    value={plantilla.categoria}
                    onChange={(e) => setPlantilla({ ...plantilla, categoria: e.target.value as any })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  >
                    <option value="general">General</option>
                    <option value="recordatorio">Recordatorio</option>
                    <option value="felicitacion">Felicitación</option>
                    <option value="informativo">Informativo</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={plantilla.asunto}
                    onChange={(e) => setPlantilla({ ...plantilla, asunto: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="Asunto del mensaje"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Contenido *
                  </label>
                  <textarea
                    value={plantilla.contenido}
                    onChange={(e) => setPlantilla({ ...plantilla, contenido: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    rows={6}
                    placeholder="Contenido del mensaje..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setModalPlantilla(false);
                    setPlantilla({ nombre: '', asunto: '', contenido: '', categoria: 'general' });
                  }}
                  className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarPlantilla}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                >
                  Guardar Plantilla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
