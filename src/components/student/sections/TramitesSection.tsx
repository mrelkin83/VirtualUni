import React from 'react';
import { FileCheck, Plus, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

interface TramitesSectionProps {
  tramites: any[];
  tramitesDisponibles: any[];
  modalTramite: boolean;
  tipoTramite: string;
  observacionesTramite: string;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
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
  darkMode,
  card,
  text,
  border,
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
        return 'bg-green-100 text-green-700';
      case 'En proceso':
        return 'bg-blue-100 text-blue-700';
      case 'Pendiente':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'En proceso':
        return <Clock className="text-blue-600" size={20} />;
      case 'Pendiente':
        return <AlertCircle className="text-orange-600" size={20} />;
      default:
        return <FileCheck className="text-gray-600" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Trámites</h2>
        <button
          onClick={() => setModalTramite(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Solicitud
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertCircle className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{tramitesPendientes.length}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{tramitesEnProceso.length}</p>
              <p className="text-sm text-gray-500">En Proceso</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{tramitesCompletados.length}</p>
              <p className="text-sm text-gray-500">Completados</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Requests */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold ${text} mb-4`}>Mis Solicitudes</h3>
        <div className="space-y-3">
          {tramites.length > 0 ? (
            tramites.map(tramite => (
              <div key={tramite.id} className={`border ${border} rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    {getEstadoIcon(tramite.estado)}
                    <div className="flex-1">
                      <h4 className={`font-bold ${text} mb-1`}>{tramite.tipo}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {tramite.descripcion}
                      </p>
                      {tramite.observaciones && (
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} italic`}>
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
                  <span className="text-xs text-gray-500">Fecha: {tramite.fecha}</span>
                  {tramite.estado !== 'Completado' && (
                    <button
                      onClick={() => cancelarTramite(tramite.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No tienes trámites registrados
            </p>
          )}
        </div>
      </div>

      {/* Available Requests */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold ${text} mb-4`}>Trámites Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tramitesDisponibles.map(tramite => (
            <div
              key={tramite.id}
              className={`border ${border} rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
              onClick={() => {
                setTipoTramite(tramite.nombre);
                setModalTramite(true);
              }}
            >
              <div className="flex items-start gap-3">
                <FileCheck className="text-blue-600 flex-shrink-0" size={20} />
                <div>
                  <h4 className={`font-semibold ${text} mb-1`}>{tramite.nombre}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
          <div className={`${card} rounded-lg max-w-md w-full p-6`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Nueva Solicitud de Trámite</h3>
              <button
                onClick={() => {
                  setModalTramite(false);
                  setTipoTramite('');
                  setObservacionesTramite('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block font-semibold ${text} mb-2`}>Tipo de Trámite</label>
                <select
                  value={tipoTramite}
                  onChange={(e) => setTipoTramite(e.target.value)}
                  className={`w-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} border ${border} rounded p-2`}
                >
                  <option value="">Selecciona un trámite</option>
                  {tramitesDisponibles.map(t => (
                    <option key={t.id} value={t.nombre}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-semibold ${text} mb-2`}>Observaciones</label>
                <textarea
                  value={observacionesTramite}
                  onChange={(e) => setObservacionesTramite(e.target.value)}
                  className={`w-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} border ${border} rounded p-2 h-24`}
                  placeholder="Describe detalles adicionales sobre tu solicitud..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={enviarTramite}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Enviar Solicitud
                </button>
                <button
                  onClick={() => {
                    setModalTramite(false);
                    setTipoTramite('');
                    setObservacionesTramite('');
                  }}
                  className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80`}
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
