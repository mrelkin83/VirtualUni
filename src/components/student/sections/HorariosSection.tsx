import React, { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Video, Users, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { ScheduleClass, ScheduleEvent } from '../../../types/student.types';

interface HorariosSectionProps {
  clases: ScheduleClass[];
  eventos: ScheduleEvent[];
}

// Componente de celda de horario
const ScheduleCell: React.FC<{
  clase?: ScheduleClass;
}> = ({ clase }) => {
  if (!clase) {
    return <div className={`p-2 min-h-[80px] border border-pn-line`}></div>;
  }

  const getTipoIcon = () => {
    switch (clase.tipo) {
      case 'virtual':
        return <Video size={12} />;
      case 'presencial':
        return <MapPin size={12} />;
      case 'hibrido':
        return <Users size={12} />;
    }
  };

  return (
    <div className={`p-2 min-h-[80px] border border-pn-line ${clase.color} bg-opacity-20 rounded`}>
      <div className={`text-xs font-bold text-pn-ink mb-1 line-clamp-2`}>{clase.curso}</div>
      <div className={`text-xs text-pn-ink-2 space-y-1`}>
        <div className="flex items-center gap-1">
          <Clock size={10} />
          {clase.horaInicio} - {clase.horaFin}
        </div>
        <div className="flex items-center gap-1">
          {getTipoIcon()}
          {clase.aula}
        </div>
        <div className="text-xs font-medium">{clase.profesor}</div>
      </div>
    </div>
  );
};

// Componente de tarjeta de evento
const EventCard: React.FC<{
  evento: ScheduleEvent;
}> = ({ evento }) => {
  const getTipoColor = () => {
    const colors = {
      examen: 'border-pn-danger bg-pn-danger-soft',
      entrega: 'border-pn-warn bg-pn-warn-soft',
      evento: 'border-pn-accent-line bg-pn-accent-soft',
      reunion: 'border-pn-accent-2 bg-pn-accent-2-soft'
    };
    return colors[evento.tipo];
  };

  const getPrioridadIcon = () => {
    if (evento.prioridad === 'alta') {
      return <AlertCircle className="text-pn-danger" size={20} />;
    }
    return <CheckCircle className="text-pn-accent-text" size={20} />;
  };

  return (
    <div className={`bg-pn-surface rounded-lg shadow p-4 border-l-4 ${getTipoColor()}`}>
      <div className="flex items-start gap-3">
        {getPrioridadIcon()}
        <div className="flex-1">
          <h4 className={`font-bold text-pn-ink mb-1`}>{evento.titulo}</h4>
          <p className={`text-sm text-pn-ink-2 mb-2`}>
            {evento.descripcion}
          </p>
          <div className={`flex flex-wrap gap-3 text-sm text-pn-ink-2`}>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(evento.fecha).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {evento.hora}
            </span>
            {evento.curso && (
              <span className="text-xs px-2 py-1 bg-pn-accent-soft text-pn-accent-text rounded">
                {evento.curso}
              </span>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          evento.prioridad === 'alta'
            ? 'bg-pn-danger-soft text-pn-danger'
            : evento.prioridad === 'media'
            ? 'bg-pn-warn-soft text-pn-warn'
            : 'bg-pn-ok-soft text-pn-ok'
        }`}>
          {evento.prioridad}
        </span>
      </div>
    </div>
  );
};

// Componente Principal
export const HorariosSection: React.FC<HorariosSectionProps> = ({
  clases,
  eventos,
}) => {
  const [vistaActual, setVistaActual] = useState<'semanal' | 'lista' | 'eventos'>('semanal');

  const dias: ('Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado')[] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ];

  // Obtener rango de horas
  const horasRango = useMemo(() => {
    const horas = clases.map(c => {
      const inicio = parseInt(c.horaInicio.split(':')[0]);
      const fin = parseInt(c.horaFin.split(':')[0]);
      return { inicio, fin };
    });

    const minHora = Math.min(...horas.map(h => h.inicio), 8);
    const maxHora = Math.max(...horas.map(h => h.fin), 20);

    const rango = [];
    for (let i = minHora; i <= maxHora; i += 2) {
      rango.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return rango;
  }, [clases]);

  // Organizar clases por día y hora
  const clasesOrganizadas = useMemo(() => {
    const organizadas: Record<string, Record<string, ScheduleClass>> = {};

    dias.forEach(dia => {
      organizadas[dia] = {};
    });

    clases.forEach(clase => {
      if (!organizadas[clase.dia]) organizadas[clase.dia] = {};
      organizadas[clase.dia][clase.horaInicio] = clase;
    });

    return organizadas;
  }, [clases, dias]);

  // Eventos próximos (próximos 7 días)
  const eventosProximos = useMemo(() => {
    const hoy = new Date();
    const proximos7Dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

    return eventos.filter(evento => {
      const fechaEvento = new Date(evento.fecha);
      return fechaEvento >= hoy && fechaEvento <= proximos7Dias;
    }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [eventos]);

  // Estadísticas
  const stats = {
    totalClases: clases.length,
    clasesVirtuales: clases.filter(c => c.tipo === 'virtual').length,
    clasesPresenciales: clases.filter(c => c.tipo === 'presencial').length,
    eventosProximos: eventosProximos.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Mi Horario</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setVistaActual('semanal')}
            className={`px-4 py-2 rounded-lg transition ${
              vistaActual === 'semanal'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            Vista Semanal
          </button>
          <button
            onClick={() => setVistaActual('lista')}
            className={`px-4 py-2 rounded-lg transition ${
              vistaActual === 'lista'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setVistaActual('eventos')}
            className={`px-4 py-2 rounded-lg transition relative ${
              vistaActual === 'eventos'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            Eventos
            {eventosProximos.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pn-danger text-pn-surface text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {eventosProximos.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Calendar className="text-pn-accent-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Total Clases</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.totalClases}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Video className="text-pn-accent-2-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Virtuales</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.clasesVirtuales}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <MapPin className="text-pn-ok mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Presenciales</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.clasesPresenciales}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <AlertCircle className="text-pn-warn mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Eventos Próximos</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.eventosProximos}</p>
        </div>
      </div>

      {/* Vista Semanal */}
      {vistaActual === 'semanal' && (
        <div className={`bg-pn-surface rounded-lg shadow overflow-x-auto`}>
          <div className="p-4">
            <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Horario Semanal</h3>
            <div className="min-w-[800px]">
              <div className="pn-scroll -mx-2 overflow-x-auto px-2">
              <div className="grid min-w-[640px] grid-cols-7 gap-1">
                <div className={`p-2 font-bold text-center text-pn-ink`}>Hora</div>
                {dias.map(dia => (
                  <div key={dia} className={`p-2 font-bold text-center text-pn-ink`}>
                    {dia}
                  </div>
                ))}

                {horasRango.map(hora => (
                  <React.Fragment key={hora}>
                    <div className={`p-2 text-sm text-center text-pn-ink-2 flex items-center justify-center border border-pn-line`}>
                      {hora}
                    </div>
                    {dias.map(dia => (
                      <ScheduleCell
                        key={`${dia}-${hora}`}
                        clase={clasesOrganizadas[dia]?.[hora]}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Lista */}
      {vistaActual === 'lista' && (
        <div className="space-y-3">
          {dias.map(dia => {
            const clasesDelDia = clases.filter(c => c.dia === dia);
            if (clasesDelDia.length === 0) return null;

            return (
              <div key={dia} className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
                <h3 className={`text-lg font-bold text-pn-ink mb-3`}>{dia}</h3>
                <div className="space-y-2">
                  {clasesDelDia.map(clase => (
                    <div
                      key={clase.id}
                      className={`p-3 border border-pn-line rounded-lg flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-2 h-12 ${clase.color} rounded`}></div>
                        <div>
                          <h4 className={`font-bold text-pn-ink`}>{clase.curso}</h4>
                          <p className={`text-sm text-pn-ink-2`}>
                            {clase.profesor}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-pn-ink`}>
                          {clase.horaInicio} - {clase.horaFin}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          {clase.tipo === 'virtual' ? <Video size={14} /> : <MapPin size={14} />}
                          <span className={'text-pn-ink-2'}>
                            {clase.aula}
                          </span>
                          {clase.enlaceVirtual && (
                            <a
                              href={clase.enlaceVirtual}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pn-accent-text hover:text-pn-accent-text"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista de Eventos */}
      {vistaActual === 'eventos' && (
        <div className="space-y-4">
          <h3 className={`text-lg font-bold text-pn-ink`}>Eventos Próximos</h3>
          {eventosProximos.length > 0 ? (
            eventosProximos.map(evento => (
              <EventCard
                key={evento.id}
                evento={evento}
              />
            ))
          ) : (
            <div className={`bg-pn-surface rounded-lg shadow p-12 text-center border border-pn-line`}>
              <Calendar size={64} className={`mx-auto mb-4 text-pn-muted`} />
              <p className={`text-pn-ink font-bold mb-2`}>No hay eventos próximos</p>
              <p className={'text-pn-ink-2'}>
                No tienes eventos programados para los próximos 7 días
              </p>
            </div>
          )}

          {/* Todos los Eventos */}
          <div className="pt-6">
            <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Todos los Eventos</h3>
            <div className="space-y-3">
              {eventos.map(evento => (
                <EventCard
                  key={evento.id}
                  evento={evento}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
