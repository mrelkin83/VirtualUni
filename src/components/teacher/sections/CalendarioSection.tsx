import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Edit3, Trash2, X } from 'lucide-react';

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
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  cursos?: any[];
}

export const CalendarioSection: React.FC<CalendarioSectionProps> = ({
  darkMode,
  card,
  text,
  border,
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
      case 'clase': return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'examen': return 'bg-red-100 text-red-800 border-red-500';
      case 'entrega': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'reunion': return 'bg-purple-100 text-purple-800 border-purple-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const handleCrearEvento = () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) {
      alert('Por favor completa los campos obligatorios');
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

  const handleEliminarEvento = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
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
          <h2 className={`text-2xl font-bold ${text}`}>Calendario Académico</h2>
          <p className="text-gray-500 mt-1">Planifica clases, exámenes y actividades</p>
        </div>
        <button
          onClick={() => setModalEvento(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Evento
        </button>
      </div>

      {/* Controles del Calendario */}
      <div className={`${card} rounded-lg shadow p-4`}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={mesAnterior}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className={`text-lg font-bold ${text} capitalize min-w-[200px] text-center`}>
              {nombreMes}
            </h3>
            <button
              onClick={mesSiguiente}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={hoy}
              className="ml-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Hoy
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setVistaActual('dia')}
              className={`px-4 py-2 rounded ${vistaActual === 'dia' ? 'bg-blue-600 text-white' : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}`}
            >
              Día
            </button>
            <button
              onClick={() => setVistaActual('semana')}
              className={`px-4 py-2 rounded ${vistaActual === 'semana' ? 'bg-blue-600 text-white' : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}`}
            >
              Semana
            </button>
            <button
              onClick={() => setVistaActual('mes')}
              className={`px-4 py-2 rounded ${vistaActual === 'mes' ? 'bg-blue-600 text-white' : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}`}
            >
              Mes
            </button>
          </div>
        </div>
      </div>

      {/* Vista de Calendario */}
      {vistaActual === 'mes' && (
        <div className={`${card} rounded-lg shadow overflow-hidden`}>
          {/* Días de la semana */}
          <div className={`grid grid-cols-7 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
              <div key={dia} className="p-3 text-center font-semibold border-r border-b ${border}">
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
                  className={`min-h-[120px] p-2 border-r border-b ${border} ${
                    dia.esOtroMes ? 'opacity-40' : ''
                  } ${esHoy ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className={`text-sm mb-1 ${esHoy ? 'font-bold text-blue-600' : text}`}>
                    {dia.fecha.getDate()}
                  </div>
                  <div className="space-y-1">
                    {eventosDelDia.slice(0, 3).map((evento) => (
                      <div
                        key={evento.id}
                        className={`text-xs p-1 rounded border-l-2 ${getTipoColor(evento.tipo)} cursor-pointer hover:opacity-80`}
                        onClick={() => setEventoSeleccionado(evento)}
                        title={evento.titulo}
                      >
                        <div className="font-semibold truncate">{evento.horaInicio}</div>
                        <div className="truncate">{evento.titulo}</div>
                      </div>
                    ))}
                    {eventosDelDia.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{eventosDelDia.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Eventos Próximos */}
      <div className={`${card} rounded-lg shadow`}>
        <div className="p-6 border-b ${border}">
          <h3 className={`text-lg font-bold ${text}`}>Próximos Eventos</h3>
        </div>
        <div className="divide-y ${border}">
          {eventos
            .filter(e => new Date(e.fecha) >= new Date())
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
            .slice(0, 10)
            .map((evento) => (
              <div key={evento.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 px-2 py-1 rounded text-xs font-semibold ${getTipoColor(evento.tipo)}`}>
                        {evento.tipo}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${text}`}>{evento.titulo}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
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
                          <p className="text-sm text-gray-600 mt-1">{evento.curso}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNuevoEvento(evento);
                        setModalEvento(true);
                      }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleEliminarEvento(evento.id)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-600"
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
          <div className={`${card} rounded-lg shadow-xl w-full max-w-2xl`}>
            <div className="p-6 border-b ${border} flex justify-between items-center">
              <h2 className={`text-xl font-bold ${text}`}>
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
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Título *</label>
                <input
                  type="text"
                  value={nuevoEvento.titulo}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Ej: Clase de Patrones de Diseño"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Tipo *</label>
                  <select
                    value={nuevoEvento.tipo}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, tipo: e.target.value as any })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  >
                    <option value="clase">Clase</option>
                    <option value="examen">Examen</option>
                    <option value="entrega">Entrega</option>
                    <option value="reunion">Reunión</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Fecha *</label>
                  <input
                    type="date"
                    value={nuevoEvento.fecha}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Hora Inicio *</label>
                  <input
                    type="time"
                    value={nuevoEvento.horaInicio}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, horaInicio: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Hora Fin *</label>
                  <input
                    type="time"
                    value={nuevoEvento.horaFin}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, horaFin: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Curso</label>
                <select
                  value={nuevoEvento.curso}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, curso: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
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
                <label className={`block text-sm font-medium ${text} mb-2`}>Ubicación</label>
                <input
                  type="text"
                  value={nuevoEvento.ubicacion}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, ubicacion: e.target.value })}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Ej: Aula 302"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Descripción</label>
                <textarea
                  value={nuevoEvento.descripcion}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>

            <div className="p-6 border-t ${border} flex justify-end gap-3">
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
                className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearEvento}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
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
