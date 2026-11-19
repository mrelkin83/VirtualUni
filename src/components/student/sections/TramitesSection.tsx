import React from 'react';
import { FileCheck, Plus, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { pulsable } from '../../../utils/pulsable';

interface TramitesSectionProps {
  tramites: any[];
  tramitesDisponibles: any[];
  modalTramite: boolean;
  tipoTramite: string;
  observacionesTramite: string;
  setModalTramite: (open: boolean) => void;
  setTipoTramite: (tipo: string) => void;
  setObservacionesTramite: (obs: string) => void;
  setTramiteDetalle: (tramite: any) => void;
  enviarTramite: () => void;
  cancelarTramite: (id: number) => void;
}

export const TramitesSection: React.FC<TramitesSectionProps> = ({
  tramites,
  tramitesDisponibles,
  modalTramite,
  tipoTramite,
  observacionesTramite,
  setModalTramite,
  setTipoTramite,
  setObservacionesTramite,
  enviarTramite,
  cancelarTramite
}) => {
  const tramitesCompletados = tramites.filter(t => t.estado === 'Completado');
  const tramitesEnProceso = tramites.filter(t => t.estado === 'En proceso');
  const tramitesPendientes = tramites.filter(t => t.estado === 'Pendiente');

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return 'bg-pn-ok-soft text-pn-ok';
      case 'En proceso':
        return 'bg-pn-accent-soft text-pn-accent-text';
      case 'Pendiente':
        return 'bg-pn-warn-soft text-pn-warn';
      default:
        return 'bg-pn-surface-3 text-pn-ink-2';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return <CheckCircle className="text-pn-ok" size={20} />;
      case 'En proceso':
        return <Clock className="text-pn-accent-text" size={20} />;
      case 'Pendiente':
        return <AlertCircle className="text-pn-warn" size={20} />;
      default:
        return <FileCheck className="text-pn-ink-2" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Trámites</h2>
        <button
          onClick={() => setModalTramite(true)}
          className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Solicitud
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-warn-soft p-3 rounded-full">
              <AlertCircle className="text-pn-warn" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-warn">{tramitesPendientes.length}</p>
              <p className="text-sm text-pn-muted">Pendientes</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-accent-soft p-3 rounded-full">
              <Clock className="text-pn-accent-text" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-accent-text">{tramitesEnProceso.length}</p>
              <p className="text-sm text-pn-muted">En Proceso</p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-pn-ok-soft p-3 rounded-full">
              <CheckCircle className="text-pn-ok" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-pn-ok">{tramitesCompletados.length}</p>
              <p className="text-sm text-pn-muted">Completados</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Requests */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Mis Solicitudes</h3>
        <div className="space-y-3">
          {tramites.length > 0 ? (
            tramites.map(tramite => (
              <div key={tramite.id} className={`border border-pn-line rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    {getEstadoIcon(tramite.estado)}
                    <div className="flex-1">
                      <h4 className={`font-bold text-pn-ink mb-1`}>{tramite.tipo}</h4>
                      <p className={`text-sm text-pn-ink-2 mb-2`}>
                        {tramite.descripcion}
                      </p>
                      {tramite.observaciones && (
                        <p className={`text-sm text-pn-muted italic`}>
                          Observaciones: {tramite.observaciones}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(tramite.estado)}`}>
                    {tramite.estado}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-pn-muted">Fecha: {tramite.fecha}</span>
                  {tramite.estado !== 'Completado' && (
                    <button
                      onClick={() => cancelarTramite(tramite.id)}
                      className="text-sm text-pn-danger hover:text-pn-danger"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className={`text-center py-8 text-pn-ink-2`}>
              No tienes trámites registrados
            </p>
          )}
        </div>
      </div>

      {/* Available Requests */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Trámites Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tramitesDisponibles.map(tramite => (
            <div
              key={tramite.id}
              className={`border border-pn-line rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
              {...pulsable(() => {
                setTipoTramite(tramite.nombre);
                setModalTramite(true);
              })}
            >
              <div className="flex items-start gap-3">
                <FileCheck className="text-pn-accent-text flex-shrink-0" size={20} />
                <div>
                  <h4 className={`font-semibold text-pn-ink mb-1`}>{tramite.nombre}</h4>
                  <p className={`text-sm text-pn-ink-2`}>
                    {tramite.descripcion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Request Modal */}
      {modalTramite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Nueva Solicitud de Trámite" className={`bg-pn-surface rounded-lg max-w-md w-full p-6`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Nueva Solicitud de Trámite</h3>
              <button
                onClick={() => {
                  setModalTramite(false);
                  setTipoTramite('');
                  setObservacionesTramite('');
                }}
                className="text-pn-muted hover:text-pn-ink-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block font-semibold text-pn-ink mb-2`}>Tipo de Trámite</label>
                <select
                  value={tipoTramite}
                  onChange={(e) => setTipoTramite(e.target.value)}
                  className={`w-full bg-pn-surface text-pn-ink-2 border border-pn-line rounded p-2`}
                >
                  <option value="">Selecciona un trámite</option>
                  {tramitesDisponibles.map(t => (
                    <option key={t.id} value={t.nombre}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-semibold text-pn-ink mb-2`}>Observaciones</label>
                <textarea
                  value={observacionesTramite}
                  onChange={(e) => setObservacionesTramite(e.target.value)}
                  className={`w-full bg-pn-surface text-pn-ink-2 border border-pn-line rounded p-2 h-24`}
                  placeholder="Describe detalles adicionales sobre tu solicitud..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={enviarTramite}
                  className="flex-1 bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover"
                >
                  Enviar Solicitud
                </button>
                <button
                  onClick={() => {
                    setModalTramite(false);
                    setTipoTramite('');
                    setObservacionesTramite('');
                  }}
                  className={`px-4 py-2 rounded bg-pn-surface-3 text-pn-ink-2 hover:opacity-80`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
