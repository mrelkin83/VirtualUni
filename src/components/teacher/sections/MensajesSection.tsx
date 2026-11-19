import React, { useState } from 'react';
import { avisar } from '../../ui';
import { pulsable } from '../../../utils/pulsable';
import {
  Mail, Send, Inbox, Circle, Users, Megaphone, FileText,
  Paperclip, X, Trash2, Search, Filter, Plus
} from 'lucide-react';

interface MensajesSectionProps {
  mensajes: any[];
  cursos: any[];
  setConversacionActiva: (mensaje: any) => void;
  setNuevoMensajeModal: (open: boolean) => void;
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
      avisar.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const curso = cursos.find(c => c.id === parseInt(mensajeMasivo.cursoId));
    if (!curso) {
      avisar.info('Curso no encontrado');
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
      avisar.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const curso = cursos.find(c => c.id === parseInt(anuncio.cursoId));
    if (!curso) {
      avisar.info('Curso no encontrado');
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
      avisar.error('Por favor completa todos los campos');
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
      case 'alta': return 'bg-pn-danger-soft text-pn-danger';
      case 'normal': return 'bg-pn-accent-soft text-pn-accent-text';
      case 'baja': return 'bg-pn-surface-3 text-pn-ink';
      default: return 'bg-pn-surface-3 text-pn-ink';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'recordatorio': return 'bg-pn-warn-soft text-pn-warn';
      case 'felicitacion': return 'bg-pn-ok-soft text-pn-ok';
      case 'informativo': return 'bg-pn-accent-soft text-pn-accent-text';
      default: return 'bg-pn-surface-3 text-pn-ink';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Comunicación</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModalMasivo(true)}
            className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Users size={18} />
            Mensaje Masivo
          </button>
          <button
            onClick={() => setModalAnuncio(true)}
            className="bg-pn-warn hover:bg-pn-warn text-pn-surface px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Megaphone size={18} />
            Nuevo Anuncio
          </button>
          <button
            onClick={() => setNuevoMensajeModal(true)}
            className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Send size={18} />
            Mensaje Individual
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-accent-soft p-3 rounded-full">
              <Inbox className="text-pn-accent-text" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-accent-text">{mensajesRecibidos.length}</p>
              <p className="text-sm text-pn-muted">Recibidos</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-warn-soft p-3 rounded-full">
              <Mail className="text-pn-warn" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-warn">{noLeidos}</p>
              <p className="text-sm text-pn-muted">No leídos</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-ok-soft p-3 rounded-full">
              <Send className="text-pn-ok" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-ok">{mensajesEnviados.length}</p>
              <p className="text-sm text-pn-muted">Enviados</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line p-4`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-accent-2-soft p-3 rounded-full">
              <Megaphone className="text-pn-accent-2-text" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-accent-2-text">{anuncios.length}</p>
              <p className="text-sm text-pn-muted">Anuncios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line p-2`}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setVistaActiva('mensajes')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              vistaActiva === 'mensajes'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'hover:bg-pn-surface-3 text-pn-ink-2'
            }`}
          >
            <Mail className="inline mr-2" size={18} />
            Mensajes
          </button>
          <button
            onClick={() => setVistaActiva('anuncios')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              vistaActiva === 'anuncios'
                ? 'bg-pn-warn text-pn-surface'
                : 'hover:bg-pn-surface-3 text-pn-ink-2'
            }`}
          >
            <Megaphone className="inline mr-2" size={18} />
            Anuncios
          </button>
          <button
            onClick={() => setVistaActiva('plantillas')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              vistaActiva === 'plantillas'
                ? 'bg-pn-accent-2 text-pn-accent-2-ink'
                : 'hover:bg-pn-surface-3 text-pn-ink-2'
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted" size={20} />
            <input
              type="text"
              placeholder="Buscar mensajes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
            />
          </div>

          {/* Bandeja de Entrada */}
          <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Bandeja de Entrada</h3>
              <div className="space-y-2">
                {mensajesRecibidos.length === 0 ? (
                  <div className="text-center py-8">
                    <Inbox className="mx-auto text-pn-muted mb-2" size={48} />
                    <p className="text-pn-muted">No hay mensajes recibidos</p>
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
                        className={`border border-pn-line rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                          !mensaje.leido ? ('bg-pn-accent-soft') : ''
                        }`}
                        {...pulsable(() => setConversacionActiva(mensaje))}
                      >
                        <div className="flex items-start gap-3">
                          {!mensaje.leido && (
                            <Circle className="text-pn-accent-text fill-blue-600 flex-shrink-0 mt-1" size={8} />
                          )}
                          <div className="flex-1">
                            <div className="flex flex-wrap justify-between items-start mb-1 gap-4">
                              <h4 className={`font-bold text-pn-ink ${!mensaje.leido ? 'text-pn-accent-text' : ''}`}>
                                {mensaje.de}
                              </h4>
                              <span className="text-xs text-pn-muted">{mensaje.fecha}</span>
                            </div>
                            <p className={`font-semibold text-pn-ink-2 text-sm mb-1`}>
                              {mensaje.asunto}
                            </p>
                            <p className={`text-sm text-pn-ink-2 line-clamp-1`}>
                              {mensaje.mensaje}
                            </p>
                            {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Paperclip size={14} className="text-pn-muted" />
                                <span className="text-xs text-pn-muted">{mensaje.adjuntos.length} adjunto(s)</span>
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
          <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Mensajes Enviados</h3>
              <div className="space-y-2">
                {mensajesEnviados.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="mx-auto text-pn-muted mb-2" size={48} />
                    <p className="text-pn-muted">No hay mensajes enviados</p>
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
                        className={`border border-pn-line rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                        {...pulsable(() => setConversacionActiva(mensaje))}
                      >
                        <div className="flex flex-wrap justify-between items-start mb-1 gap-4">
                          <h4 className={`font-bold text-pn-ink`}>Para: {mensaje.para}</h4>
                          <span className="text-xs text-pn-muted">{mensaje.fecha}</span>
                        </div>
                        <p className={`font-semibold text-pn-ink-2 text-sm mb-1`}>
                          {mensaje.asunto}
                        </p>
                        <p className={`text-sm text-pn-ink-2 line-clamp-1`}>
                          {mensaje.mensaje}
                        </p>
                        {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Paperclip size={14} className="text-pn-muted" />
                            <span className="text-xs text-pn-muted">{mensaje.adjuntos.length} adjunto(s)</span>
                          </div>
                        )}
                        {mensaje.destinatarios && (
                          <div className="mt-2">
                            <span className="text-xs bg-pn-accent-2-soft text-pn-accent-2-text px-2 py-1 rounded">
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
        <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line`}>
          <div className="p-6">
            <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Anuncios del Curso</h3>
            <div className="space-y-4">
              {anuncios.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="mx-auto text-pn-muted mb-2" size={48} />
                  <p className="text-pn-muted mb-4">No hay anuncios publicados</p>
                  <button
                    onClick={() => setModalAnuncio(true)}
                    className="bg-pn-warn hover:bg-pn-warn text-pn-surface px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Crear Primer Anuncio
                  </button>
                </div>
              ) : (
                anuncios.map((anuncioItem) => (
                  <div key={anuncioItem.id} className={`border border-pn-line rounded-lg p-6`}>
                    <div className="flex flex-wrap justify-between items-start mb-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Megaphone className="text-pn-warn" size={24} />
                        <h4 className={`text-xl font-bold text-pn-ink`}>{anuncioItem.titulo}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadColor(anuncioItem.prioridad || 'normal')}`}>
                          {anuncioItem.prioridad === 'alta' ? 'Alta Prioridad' : anuncioItem.prioridad === 'baja' ? 'Baja Prioridad' : 'Normal'}
                        </span>
                        <span className="text-xs text-pn-muted">{anuncioItem.fecha}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm text-pn-muted">Curso: {anuncioItem.curso}</span>
                    </div>
                    <p className={`text-pn-ink-2 mb-3`}>
                      {anuncioItem.contenido || anuncioItem.mensaje}
                    </p>
                    {anuncioItem.adjuntos && anuncioItem.adjuntos.length > 0 && (
                      <div className={`bg-pn-surface-2 rounded p-3 mt-3`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Paperclip size={16} className="text-pn-muted" />
                          <span className="text-sm font-semibold">Archivos adjuntos:</span>
                        </div>
                        <div className="space-y-1">
                          {anuncioItem.adjuntos.map((adjunto: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-pn-accent-text">
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
        <div className={`bg-pn-surface rounded-lg shadow-sm border border-pn-line`}>
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
              <h3 className={`text-lg font-bold text-pn-ink`}>Plantillas de Mensajes</h3>
              <button
                onClick={() => setModalPlantilla(true)}
                className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={18} />
                Nueva Plantilla
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plantillas.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <FileText className="mx-auto text-pn-muted mb-2" size={48} />
                  <p className="text-pn-muted mb-4">No hay plantillas guardadas</p>
                  <button
                    onClick={() => setModalPlantilla(true)}
                    className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Crear Primera Plantilla
                  </button>
                </div>
              ) : (
                plantillas.map((plantillaItem) => (
                  <div key={plantillaItem.id} className={`border border-pn-line rounded-lg p-4`}>
                    <div className="flex flex-wrap justify-between items-start mb-2 gap-4">
                      <h4 className={`font-bold text-pn-ink`}>{plantillaItem.nombre}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoriaColor(plantillaItem.categoria)}`}>
                        {plantillaItem.categoria}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold text-pn-ink-2 mb-2`}>
                      {plantillaItem.asunto}
                    </p>
                    <p className={`text-sm text-pn-ink-2 line-clamp-2 mb-3`}>
                      {plantillaItem.contenido}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => usarPlantilla(plantillaItem)}
                        className="flex-1 bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-3 py-2 rounded text-sm"
                      >
                        Usar Plantilla
                      </button>
                      <button
                        onClick={() => eliminarPlantilla?.(plantillaItem.id)}
                        className="bg-pn-danger hover:bg-pn-danger text-pn-surface px-3 py-2 rounded"
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
          <div role="dialog" aria-modal="true" aria-label="Enviar Mensaje Masivo" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className={`text-2xl font-bold text-pn-ink`}>Enviar Mensaje Masivo</h2>
                <button
                  onClick={() => {
                    setModalMasivo(false);
                    setMensajeMasivo({ cursoId: '', asunto: '', mensaje: '', adjuntos: [] });
                  }}
                  className="text-pn-muted hover:text-pn-ink-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Curso Destinatario *
                  </label>
                  <select
                    value={mensajeMasivo.cursoId}
                    onChange={(e) => setMensajeMasivo({ ...mensajeMasivo, cursoId: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
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
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={mensajeMasivo.asunto}
                    onChange={(e) => setMensajeMasivo({ ...mensajeMasivo, asunto: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="Asunto del mensaje"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Mensaje *
                  </label>
                  <textarea
                    value={mensajeMasivo.mensaje}
                    onChange={(e) => setMensajeMasivo({ ...mensajeMasivo, mensaje: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    rows={6}
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Archivos Adjuntos
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleAdjuntarArchivo(e, 'masivo')}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  />
                  {mensajeMasivo.adjuntos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {mensajeMasivo.adjuntos.map((file, index) => (
                        <div key={index} className={`flex items-center justify-between p-2 bg-pn-surface-3 rounded`}>
                          <div className="flex items-center gap-2">
                            <Paperclip size={16} />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-pn-muted">({(file.size / 1024).toFixed(2)} KB)</span>
                          </div>
                          <button
                            onClick={() => handleEliminarAdjunto(index, 'masivo')}
                            className="text-pn-danger hover:text-pn-danger"
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
                  className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarMasivo}
                  className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-6 py-2 rounded-lg flex items-center gap-2"
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
          <div role="dialog" aria-modal="true" aria-label="Crear Anuncio" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className={`text-2xl font-bold text-pn-ink`}>Crear Anuncio</h2>
                <button
                  onClick={() => {
                    setModalAnuncio(false);
                    setAnuncio({ cursoId: '', titulo: '', contenido: '', prioridad: 'normal', adjuntos: [] });
                  }}
                  className="text-pn-muted hover:text-pn-ink-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Curso *
                  </label>
                  <select
                    value={anuncio.cursoId}
                    onChange={(e) => setAnuncio({ ...anuncio, cursoId: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Título del Anuncio *
                  </label>
                  <input
                    type="text"
                    value={anuncio.titulo}
                    onChange={(e) => setAnuncio({ ...anuncio, titulo: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="Título del anuncio"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Prioridad
                  </label>
                  <select
                    value={anuncio.prioridad}
                    onChange={(e) => setAnuncio({ ...anuncio, prioridad: e.target.value as any })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Contenido *
                  </label>
                  <textarea
                    value={anuncio.contenido}
                    onChange={(e) => setAnuncio({ ...anuncio, contenido: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    rows={6}
                    placeholder="Contenido del anuncio..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Archivos Adjuntos
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleAdjuntarArchivo(e, 'anuncio')}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  />
                  {anuncio.adjuntos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {anuncio.adjuntos.map((file, index) => (
                        <div key={index} className={`flex items-center justify-between p-2 bg-pn-surface-3 rounded`}>
                          <div className="flex items-center gap-2">
                            <Paperclip size={16} />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-pn-muted">({(file.size / 1024).toFixed(2)} KB)</span>
                          </div>
                          <button
                            onClick={() => handleEliminarAdjunto(index, 'anuncio')}
                            className="text-pn-danger hover:text-pn-danger"
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
                  className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearAnuncio}
                  className="bg-pn-warn hover:bg-pn-warn text-pn-surface px-6 py-2 rounded-lg flex items-center gap-2"
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
          <div role="dialog" aria-modal="true" aria-label="Nueva Plantilla" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className={`text-2xl font-bold text-pn-ink`}>Nueva Plantilla</h2>
                <button
                  onClick={() => {
                    setModalPlantilla(false);
                    setPlantilla({ nombre: '', asunto: '', contenido: '', categoria: 'general' });
                  }}
                  className="text-pn-muted hover:text-pn-ink-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Nombre de la Plantilla *
                  </label>
                  <input
                    type="text"
                    value={plantilla.nombre}
                    onChange={(e) => setPlantilla({ ...plantilla, nombre: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="Ej: Recordatorio de Entrega"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Categoría
                  </label>
                  <select
                    value={plantilla.categoria}
                    onChange={(e) => setPlantilla({ ...plantilla, categoria: e.target.value as any })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  >
                    <option value="general">General</option>
                    <option value="recordatorio">Recordatorio</option>
                    <option value="felicitacion">Felicitación</option>
                    <option value="informativo">Informativo</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={plantilla.asunto}
                    onChange={(e) => setPlantilla({ ...plantilla, asunto: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                    placeholder="Asunto del mensaje"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                    Contenido *
                  </label>
                  <textarea
                    value={plantilla.contenido}
                    onChange={(e) => setPlantilla({ ...plantilla, contenido: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
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
                  className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarPlantilla}
                  className="bg-pn-accent-2 hover:bg-pn-accent-2 text-pn-accent-2-ink px-6 py-2 rounded-lg"
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
