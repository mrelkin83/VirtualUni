import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Edit3, Trash2, X } from 'lucide-react';
import { avisar, confirmar } from '../../ui';
import { pulsable } from '../../../utils/pulsable';

interface Evento {
  id: number;
  titulo: string;
  tipo: 'clase' | 'examen' | 'entrega' | 'reunion' | 'otro';
  fecha: string;
  horaInicio: string;
  horaFin: string;
  curso?: string;
  descripcion?: string;
  ubicacion?: string;
}

interface CalendarioSectionProps {
  cursos?: any[];
}

export const CalendarioSection: React.FC<CalendarioSectionProps> = ({
  cursos = []
}) => {
  const [vistaActual, setVistaActual] = useState<'mes' | 'semana' | 'dia'>('mes');
  const [fechaActual, setFechaActual] = useState(new Date());
  const [modalEvento, setModalEvento] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: 1,
      titulo: 'Clase: Patrones de Diseño',
      tipo: 'clase',
      fecha: '2025-11-29',
      horaInicio: '14:00',
      horaFin: '16:00',
      curso: 'Programación Avanzada',
      ubicacion: 'Aula 302'
    },
    {
      id: 2,
      titulo: 'Examen Parcial 2',
      tipo: 'examen',
      fecha: '2025-11-30',
      horaInicio: '10:00',
      horaFin: '12:00',
      curso: 'Base de Datos',
      ubicacion: 'Aula 205'
    },
    {
      id: 3,
      titulo: 'Entrega: Proyecto Final',
      tipo: 'entrega',
      fecha: '2025-12-05',
      horaInicio: '23:59',
      horaFin: '23:59',
      curso: 'Inteligencia Artificial'
    }
  ]);

  const [nuevoEvento, setNuevoEvento] = useState<Partial<Evento>>({
    titulo: '',
    tipo: 'clase',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    horaFin: '10:00',
    curso: '',
    descripcion: '',
    ubicacion: ''
  });

  const getDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasPrevios = primerDia.getDay();

    const dias = [];

    // Días del mes anterior
    for (let i = diasPrevios - 1; i >= 0; i--) {
      const fecha = new Date(año, mes, -i);
      dias.push({ fecha, esOtroMes: true });
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const fecha = new Date(año, mes, i);
      dias.push({ fecha, esOtroMes: false });
    }

    // Días del siguiente mes para completar la cuadrícula
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(año, mes + 1, i);
      dias.push({ fecha, esOtroMes: true });
    }

    return dias;
  };

  const getEventosPorFecha = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return eventos.filter(e => e.fecha === fechaStr);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'clase': return 'bg-pn-accent-soft text-pn-accent-text border-pn-accent-line';
      case 'examen': return 'bg-pn-danger-soft text-pn-danger border-pn-danger';
      case 'entrega': return 'bg-pn-warn-soft text-pn-warn border-pn-warn';
      case 'reunion': return 'bg-pn-accent-2-soft text-pn-accent-2-text border-pn-accent-2';
      default: return 'bg-pn-surface-3 text-pn-ink border-pn-line-strong';
    }
  };

  const handleCrearEvento = () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) {
      avisar.error('Por favor completa los campos obligatorios');
      return;
    }

    const evento: Evento = {
      id: Date.now(),
      titulo: nuevoEvento.titulo!,
      tipo: nuevoEvento.tipo!,
      fecha: nuevoEvento.fecha!,
      horaInicio: nuevoEvento.horaInicio!,
      horaFin: nuevoEvento.horaFin!,
      curso: nuevoEvento.curso,
      descripcion: nuevoEvento.descripcion,
      ubicacion: nuevoEvento.ubicacion
    };

    setEventos([...eventos, evento]);
    setModalEvento(false);
    setNuevoEvento({
      titulo: '',
      tipo: 'clase',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '08:00',
      horaFin: '10:00',
      curso: '',
      descripcion: '',
      ubicacion: ''
    });
  };

  const handleEliminarEvento = async (id: number) => {
    if (await confirmar('¿Estás seguro de eliminar este evento?')) {
      setEventos(eventos.filter(e => e.id !== id));
    }
  };

  const mesAnterior = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1));
  };

  const mesSiguiente = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1));
  };

  const hoy = () => {
    setFechaActual(new Date());
  };

  const nombreMes = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold text-pn-ink`}>Calendario Académico</h2>
          <p className="text-pn-muted mt-1">Planifica clases, exámenes y actividades</p>
        </div>
        <button
          onClick={() => setModalEvento(true)}
          className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Evento
        </button>
      </div>

      {/* Controles del Calendario */}
      <div className={`bg-pn-surface rounded-lg shadow p-4`}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Envuelve y el título cede ancho: con 200 px fijos, a 390 px el
              botón «Hoy» se salía 32 px y el shell lo recortaba. */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={mesAnterior}
              className={`p-2 hover:bg-pn-surface-3 rounded`}
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className={`text-lg font-bold text-pn-ink capitalize min-w-[140px] sm:min-w-[200px] text-center`}>
              {nombreMes}
            </h3>
            <button
              onClick={mesSiguiente}
              className={`p-2 hover:bg-pn-surface-3 rounded`}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={hoy}
              className="ml-2 px-4 py-2 bg-pn-accent-soft text-pn-accent-text rounded-lg text-sm font-semibold hover:bg-pn-accent-soft"
            >
              Hoy
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVistaActual('dia')}
              className={`px-4 py-2 rounded ${vistaActual === 'dia' ? 'bg-pn-accent text-pn-accent-ink' : `bg-pn-surface-3`}`}
            >
              Día
            </button>
            <button
              onClick={() => setVistaActual('semana')}
              className={`px-4 py-2 rounded ${vistaActual === 'semana' ? 'bg-pn-accent text-pn-accent-ink' : `bg-pn-surface-3`}`}
            >
              Semana
            </button>
            <button
              onClick={() => setVistaActual('mes')}
              className={`px-4 py-2 rounded ${vistaActual === 'mes' ? 'bg-pn-accent text-pn-accent-ink' : `bg-pn-surface-3`}`}
            >
              Mes
            </button>
          </div>
        </div>
      </div>

      {/* Vista de Calendario */}
      {vistaActual === 'mes' && (
        <div className={`bg-pn-surface rounded-lg shadow overflow-hidden`}>
          {/* Encabezado y celdas comparten un solo scroll: separados, a 390 px
              la cabecera se encogía a la pantalla y dejaba de cuadrar con los días. */}
          <div className="pn-scroll overflow-x-auto">
          <div className="min-w-[640px]">
          {/* Días de la semana */}
          <div className={`grid grid-cols-7 bg-pn-surface-3`}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
              <div key={dia} className="p-3 text-center font-semibold border-r border-b border-pn-line">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7">
            {getDiasDelMes().map((dia, index) => {
              const eventosDelDia = getEventosPorFecha(dia.fecha);
              const esHoy = dia.fecha.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b border-pn-line ${
                    dia.esOtroMes ? 'opacity-40' : ''
                  } ${esHoy ? 'bg-pn-accent-soft' : ''}`}
                >
                  <div className={`text-sm mb-1 ${esHoy ? 'font-bold text-pn-accent-text' : 'text-pn-ink'}`}>
                    {dia.fecha.getDate()}
                  </div>
                  <div className="space-y-1">
                    {eventosDelDia.slice(0, 3).map((evento) => (
                      <div
                        key={evento.id}
                        className={`text-xs p-1 rounded border-l-2 ${getTipoColor(evento.tipo)} cursor-pointer hover:opacity-80`}
                        {...pulsable(() => setEventoSeleccionado(evento))}
                        title={evento.titulo}
                      >
                        <div className="font-semibold truncate">{evento.horaInicio}</div>
                        <div className="truncate">{evento.titulo}</div>
                      </div>
                    ))}
                    {eventosDelDia.length > 3 && (
                      <div className="text-xs text-pn-muted text-center">
                        +{eventosDelDia.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
          </div>
        </div>
      )}

      {/* Lista de Eventos Próximos */}
      <div className={`bg-pn-surface rounded-lg shadow`}>
        <div className="p-6 border-b border-pn-line">
          <h3 className={`text-lg font-bold text-pn-ink`}>Próximos Eventos</h3>
        </div>
        <div className="divide-y border-pn-line">
          {eventos
            .filter(e => new Date(e.fecha) >= new Date())
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
            .slice(0, 10)
            .map((evento) => (
              <div key={evento.id} className="p-4 hover:bg-pn-surface-2">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 px-2 py-1 rounded text-xs font-semibold ${getTipoColor(evento.tipo)}`}>
                        {evento.tipo}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-pn-ink`}>{evento.titulo}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-pn-muted">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {evento.horaInicio} - {evento.horaFin}
                          </span>
                          {evento.ubicacion && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {evento.ubicacion}
                            </span>
                          )}
                        </div>
                        {evento.curso && (
                          <p className="text-sm text-pn-ink-2 mt-1">{evento.curso}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setNuevoEvento(evento);
                        setModalEvento(true);
                      }}
                      className="p-2 hover:bg-pn-surface-3 rounded"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleEliminarEvento(evento.id)}
                      className="p-2 hover:bg-pn-surface-3 rounded text-pn-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal Crear/Editar Evento */}
      {modalEvento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="{nuevoEvento.id ? 'Editar Evento' : 'Nuevo Evento'}" className={`bg-pn-surface rounded-lg shadow-xl w-full max-w-2xl`}>
            <div className="p-6 border-b border-pn-line flex flex-wrap justify-between items-center gap-4">
              <h2 className={`text-xl font-bold text-pn-ink`}>
                {nuevoEvento.id ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <button
                onClick={() => {
                  setModalEvento(false);
                  setNuevoEvento({
                    titulo: '',
                    tipo: 'clase',
                    fecha: new Date().toISOString().split('T')[0],
                    horaInicio: '08:00',
                    horaFin: '10:00',
                    curso: '',
                    descripcion: '',
                    ubicacion: ''
                  });
                }}
                className="text-pn-muted hover:text-pn-ink-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Título *</label>
                <input
                  type="text"
                  value={nuevoEvento.titulo}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Ej: Clase de Patrones de Diseño"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Tipo *</label>
                  <select
                    value={nuevoEvento.tipo}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, tipo: e.target.value as any })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  >
                    <option value="clase">Clase</option>
                    <option value="examen">Examen</option>
                    <option value="entrega">Entrega</option>
                    <option value="reunion">Reunión</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Fecha *</label>
                  <input
                    type="date"
                    value={nuevoEvento.fecha}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Hora Inicio *</label>
                  <input
                    type="time"
                    value={nuevoEvento.horaInicio}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, horaInicio: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-pn-ink mb-2`}>Hora Fin *</label>
                  <input
                    type="time"
                    value={nuevoEvento.horaFin}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, horaFin: e.target.value })}
                    className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Curso</label>
                <select
                  value={nuevoEvento.curso}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, curso: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
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
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Ubicación</label>
                <input
                  type="text"
                  value={nuevoEvento.ubicacion}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, ubicacion: e.target.value })}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Ej: Aula 302"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>Descripción</label>
                <textarea
                  value={nuevoEvento.descripcion}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-pn-line flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalEvento(false);
                  setNuevoEvento({
                    titulo: '',
                    tipo: 'clase',
                    fecha: new Date().toISOString().split('T')[0],
                    horaInicio: '08:00',
                    horaFin: '10:00',
                    curso: '',
                    descripcion: '',
                    ubicacion: ''
                  });
                }}
                className={`px-6 py-2 rounded-lg bg-pn-surface-3 hover:bg-pn-line`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearEvento}
                className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-6 py-2 rounded-lg"
              >
                {nuevoEvento.id ? 'Actualizar' : 'Crear Evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
