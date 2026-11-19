import React, { useState } from 'react';
import { formatearCop } from '../../../utils/formato';
import { FileText, Download, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, X, Eye } from 'lucide-react';
import { Certificate, CertificateRequest } from '../../../types/student.types';

interface CertificadosSectionProps {
  certificadosDisponibles: Certificate[];
  solicitudes: CertificateRequest[];
  solicitarCertificado: (certificadoId: string | number, observaciones: string) => void;
  descargarCertificado: (solicitudId: string | number) => void;
}

// Componente de tarjeta de certificado disponible
const CertificateCard: React.FC<{
  certificado: Certificate;
  onSolicitar: () => void;
}> = ({ certificado, onSolicitar }) => {
  const getEstadoColor = () => {
    switch (certificado.estado) {
      case 'disponible':
        return 'text-pn-ok';
      case 'en_proceso':
        return 'text-pn-warn';
      case 'rechazado':
        return 'text-pn-danger';
      default:
        return 'text-pn-muted';
    }
  };


  return (
    <div className={`bg-pn-surface rounded-lg shadow p-6 border border-pn-line hover:shadow-lg transition`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-pn-accent-soft`}>
          <FileText className="text-pn-accent-text" size={32} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold text-pn-ink mb-2`}>{certificado.tipo}</h3>
          <p className={`text-sm text-pn-ink-2 mb-3`}>
            {certificado.descripcion}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className={'text-pn-ink-2'} />
              <span className="text-pn-ink">{formatearCop(certificado.costo, { gratisSiCero: true })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className={'text-pn-ink-2'} />
              <span className="text-pn-ink">{certificado.tiempoEstimado}</span>
            </div>
            {certificado.requiereAprobacion && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-pn-warn" />
                <span className={'text-pn-ink-2'}>Requiere aprobación</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className={`text-sm ${getEstadoColor()} font-semibold`}>
              {certificado.estado === 'disponible' && 'Disponible'}
              {certificado.estado === 'en_proceso' && 'En proceso'}
              {certificado.estado === 'rechazado' && 'No disponible'}
            </span>
            <button
              onClick={onSolicitar}
              disabled={certificado.estado !== 'disponible'}
              className={`px-4 py-2 rounded-lg transition font-semibold ${
                certificado.estado === 'disponible'
                  ? 'bg-pn-accent text-pn-accent-ink hover:bg-pn-accent'
                  : 'bg-pn-surface-3 text-pn-muted cursor-not-allowed'
              }`}
            >
              Solicitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de solicitud
const RequestCard: React.FC<{
  solicitud: CertificateRequest;
  onDescargar?: () => void;
  onVerDetalle: () => void;
}> = ({ solicitud, onDescargar, onVerDetalle }) => {
  const getEstadoConfig = () => {
    const configs = {
      pendiente: {
        color: 'border-pn-warn bg-pn-warn-soft',
        icon: <Clock className="text-pn-warn" size={24} />,
        badge: 'bg-pn-warn-soft text-pn-warn',
        text: 'Pendiente'
      },
      aprobado: {
        color: 'border-pn-ok bg-pn-ok-soft',
        icon: <CheckCircle className="text-pn-ok" size={24} />,
        badge: 'bg-pn-ok-soft text-pn-ok',
        text: 'Aprobado'
      },
      rechazado: {
        color: 'border-pn-danger bg-pn-danger-soft',
        icon: <XCircle className="text-pn-danger" size={24} />,
        badge: 'bg-pn-danger-soft text-pn-danger',
        text: 'Rechazado'
      },
      completado: {
        color: 'border-pn-accent-line bg-pn-accent-soft',
        icon: <CheckCircle className="text-pn-accent-text" size={24} />,
        badge: 'bg-pn-accent-soft text-pn-accent-text',
        text: 'Completado'
      }
    };
    return configs[solicitud.estado];
  };

  const config = getEstadoConfig();

  return (
    <div className={`bg-pn-surface rounded-lg shadow p-4 border-l-4 ${config.color}`}>
      <div className="flex items-start gap-4">
        {config.icon}
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between mb-2 gap-4">
            <h4 className={`font-bold text-pn-ink`}>{solicitud.tipoCertificado}</h4>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${config.badge}`}>
              {config.text}
            </span>
          </div>

          {solicitud.observaciones && (
            <p className={`text-sm text-pn-ink-2 mb-3`}>
              {solicitud.observaciones}
            </p>
          )}

          <div className={`flex flex-wrap gap-4 text-sm text-pn-ink-2 mb-3`}>
            <span>Solicitado: {new Date(solicitud.fechaSolicitud).toLocaleDateString()}</span>
            {solicitud.fechaEstimada && (
              <span>Estimado: {new Date(solicitud.fechaEstimada).toLocaleDateString()}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onVerDetalle}
              className="text-pn-accent-text hover:text-pn-accent-text text-sm flex items-center gap-1 font-semibold p-2 -m-2 rounded"
            >
              <Eye size={16} />
              Ver detalle
            </button>
            {solicitud.estado === 'completado' && solicitud.archivoUrl && onDescargar && (
              <button
                onClick={onDescargar}
                className="text-pn-ok hover:text-pn-ok text-sm flex items-center gap-1 font-semibold p-2 -m-2 rounded"
              >
                <Download size={16} />
                Descargar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
export const CertificadosSection: React.FC<CertificadosSectionProps> = ({
  certificadosDisponibles,
  solicitudes,
  solicitarCertificado,
  descargarCertificado
}) => {
  const [modalSolicitud, setModalSolicitud] = useState<Certificate | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [detalleModal, setDetalleModal] = useState<CertificateRequest | null>(null);
  const [vistaActual, setVistaActual] = useState<'disponibles' | 'solicitudes'>('disponibles');

  const handleSolicitar = () => {
    if (!modalSolicitud) return;
    solicitarCertificado(modalSolicitud.id, observaciones);
    setModalSolicitud(null);
    setObservaciones('');
  };

  // Estadísticas
  const stats = {
    totalDisponibles: certificadosDisponibles.filter(c => c.estado === 'disponible').length,
    solicitudesPendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
    solicitudesCompletadas: solicitudes.filter(s => s.estado === 'completado').length,
    solicitudesAprobadas: solicitudes.filter(s => s.estado === 'aprobado').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Certificados y Constancias</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setVistaActual('disponibles')}
            className={`px-4 py-2 rounded-lg transition ${
              vistaActual === 'disponibles'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            Disponibles
          </button>
          <button
            onClick={() => setVistaActual('solicitudes')}
            className={`px-4 py-2 rounded-lg transition relative ${
              vistaActual === 'solicitudes'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            Mis Solicitudes
            {stats.solicitudesPendientes > 0 && (
              <span className="absolute -top-1 -right-1 bg-pn-warn text-pn-surface text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {stats.solicitudesPendientes}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <FileText className="text-pn-accent-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Disponibles</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.totalDisponibles}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Clock className="text-pn-warn mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Pendientes</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.solicitudesPendientes}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <CheckCircle className="text-pn-ok mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Aprobadas</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.solicitudesAprobadas}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Download className="text-pn-accent-2-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Completadas</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.solicitudesCompletadas}</p>
        </div>
      </div>

      {/* Vista de Certificados Disponibles */}
      {vistaActual === 'disponibles' && (
        <div className="space-y-4">
          <h3 className={`text-lg font-bold text-pn-ink`}>Certificados Disponibles para Solicitar</h3>
          {certificadosDisponibles.map(certificado => (
            <CertificateCard
              key={certificado.id}
              certificado={certificado}
              onSolicitar={() => setModalSolicitud(certificado)}
            />
          ))}
        </div>
      )}

      {/* Vista de Solicitudes */}
      {vistaActual === 'solicitudes' && (
        <div className="space-y-4">
          <h3 className={`text-lg font-bold text-pn-ink`}>Mis Solicitudes de Certificados</h3>
          {solicitudes.length > 0 ? (
            solicitudes.map(solicitud => (
              <RequestCard
                key={solicitud.id}
                solicitud={solicitud}
                onDescargar={() => descargarCertificado(solicitud.id)}
                onVerDetalle={() => setDetalleModal(solicitud)}
              />
            ))
          ) : (
            <div className={`bg-pn-surface rounded-lg shadow p-12 text-center border border-pn-line`}>
              <FileText size={64} className={`mx-auto mb-4 text-pn-muted`} />
              <p className={`text-pn-ink font-bold mb-2`}>No tienes solicitudes de certificados</p>
              <p className={'text-pn-ink-2'}>
                Solicita certificados desde la pestaña "Disponibles"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Solicitud */}
      {modalSolicitud && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setModalSolicitud(null)}
        >
          <div role="dialog" aria-modal="true" aria-label="Solicitar certificado"
            className={`bg-pn-surface rounded-lg max-w-md w-full p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Solicitar Certificado</h3>
              <button
                onClick={() => setModalSolicitud(null)}
                className="text-pn-muted hover:text-pn-ink-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-pn-muted">Tipo de Certificado</p>
                <p className={`font-semibold text-pn-ink`}>{modalSolicitud.tipo}</p>
              </div>

              <div>
                <p className="text-sm text-pn-muted">Descripción</p>
                <p className={`text-sm text-pn-ink-2`}>
                  {modalSolicitud.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-pn-muted">Costo</p>
                  <p className={`font-semibold text-pn-ink`}>
                    {modalSolicitud.costo === 0 ? 'Gratis' : `$${modalSolicitud.costo.toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-pn-muted">Tiempo Estimado</p>
                  <p className={`font-semibold text-pn-ink`}>{modalSolicitud.tiempoEstimado}</p>
                </div>
              </div>

              {modalSolicitud.requiereAprobacion && (
                <div className="bg-pn-warn-soft p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-pn-warn" size={20} />
                    <p className="text-sm text-pn-warn">
                      Este certificado requiere aprobación institucional
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium text-pn-ink mb-2`}>
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Indica el motivo o uso del certificado..."
                  className={`w-full p-3 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:outline-none bg-pn-surface text-pn-ink`}
                  rows={3}
                />
              </div>

              <button
                onClick={handleSolicitar}
                className="w-full bg-pn-accent text-pn-accent-ink py-3 rounded hover:bg-pn-accent-hover font-semibold"
              >
                Confirmar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {detalleModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setDetalleModal(null)}
        >
          <div role="dialog" aria-modal="true" aria-label="Detalle del certificado"
            className={`bg-pn-surface rounded-lg max-w-md w-full p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Detalle de Solicitud</h3>
              <button
                onClick={() => setDetalleModal(null)}
                className="text-pn-muted hover:text-pn-ink-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-pn-muted">Tipo de Certificado</p>
                <p className={`font-semibold text-pn-ink`}>{detalleModal.tipoCertificado}</p>
              </div>

              <div>
                <p className="text-sm text-pn-muted">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  detalleModal.estado === 'completado' ? 'bg-pn-accent-soft text-pn-accent-text' :
                  detalleModal.estado === 'aprobado' ? 'bg-pn-ok-soft text-pn-ok' :
                  detalleModal.estado === 'pendiente' ? 'bg-pn-warn-soft text-pn-warn' :
                  'bg-pn-danger-soft text-pn-danger'
                }`}>
                  {detalleModal.estado}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-pn-muted">Fecha de Solicitud</p>
                  <p className={`font-semibold text-pn-ink`}>
                    {new Date(detalleModal.fechaSolicitud).toLocaleDateString()}
                  </p>
                </div>
                {detalleModal.fechaEstimada && (
                  <div>
                    <p className="text-sm text-pn-muted">Fecha Estimada</p>
                    <p className={`font-semibold text-pn-ink`}>
                      {new Date(detalleModal.fechaEstimada).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {detalleModal.observaciones && (
                <div>
                  <p className="text-sm text-pn-muted">Observaciones</p>
                  <p className={`text-sm text-pn-ink-2`}>
                    {detalleModal.observaciones}
                  </p>
                </div>
              )}

              {detalleModal.estado === 'completado' && detalleModal.archivoUrl && (
                <button
                  onClick={() => descargarCertificado(detalleModal.id)}
                  className="w-full bg-pn-ok text-pn-surface py-3 rounded hover:bg-pn-ok font-semibold flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Descargar Certificado
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
