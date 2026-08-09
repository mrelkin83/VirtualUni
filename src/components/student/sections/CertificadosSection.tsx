import React, { useState } from 'react';
import { FileText, Download, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, X, Eye } from 'lucide-react';
import { Certificate, CertificateRequest } from '../../../types/student.types';

interface CertificadosSectionProps {
  certificadosDisponibles: Certificate[];
  solicitudes: CertificateRequest[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  solicitarCertificado: (certificadoId: string | number, observaciones: string) => void;
  descargarCertificado: (solicitudId: string | number) => void;
}

// Componente de tarjeta de certificado disponible
const CertificateCard: React.FC<{
  certificado: Certificate;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  onSolicitar: () => void;
}> = ({ certificado, darkMode, card, text, border, onSolicitar }) => {
  const getEstadoColor = () => {
    switch (certificado.estado) {
      case 'disponible':
        return 'text-green-500';
      case 'en_proceso':
        return 'text-orange-500';
      case 'rechazado':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatMoney = (amount: number) => {
    if (amount === 0) return 'Gratis';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`${card} rounded-lg shadow p-6 border ${border} hover:shadow-lg transition`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
          <FileText className="text-blue-500" size={32} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${text} mb-2`}>{certificado.tipo}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
            {certificado.descripcion}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              <span className={text}>{formatMoney(certificado.costo)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              <span className={text}>{certificado.tiempoEstimado}</span>
            </div>
            {certificado.requiereAprobacion && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-orange-500" />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Requiere aprobación</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
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
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  onDescargar?: () => void;
  onVerDetalle: () => void;
}> = ({ solicitud, darkMode, card, text, border, onDescargar, onVerDetalle }) => {
  const getEstadoConfig = () => {
    const configs = {
      pendiente: {
        color: 'border-orange-500 bg-orange-50 dark:bg-orange-900/10',
        icon: <Clock className="text-orange-500" size={24} />,
        badge: 'bg-orange-100 text-orange-700',
        text: 'Pendiente'
      },
      aprobado: {
        color: 'border-green-500 bg-green-50 dark:bg-green-900/10',
        icon: <CheckCircle className="text-green-500" size={24} />,
        badge: 'bg-green-100 text-green-700',
        text: 'Aprobado'
      },
      rechazado: {
        color: 'border-red-500 bg-red-50 dark:bg-red-900/10',
        icon: <XCircle className="text-red-500" size={24} />,
        badge: 'bg-red-100 text-red-700',
        text: 'Rechazado'
      },
      completado: {
        color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
        icon: <CheckCircle className="text-blue-500" size={24} />,
        badge: 'bg-blue-100 text-blue-700',
        text: 'Completado'
      }
    };
    return configs[solicitud.estado];
  };

  const config = getEstadoConfig();

  return (
    <div className={`${card} rounded-lg shadow p-4 border-l-4 ${config.color}`}>
      <div className="flex items-start gap-4">
        {config.icon}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className={`font-bold ${text}`}>{solicitud.tipoCertificado}</h4>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${config.badge}`}>
              {config.text}
            </span>
          </div>

          {solicitud.observaciones && (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              {solicitud.observaciones}
            </p>
          )}

          <div className={`flex flex-wrap gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
            <span>Solicitado: {new Date(solicitud.fechaSolicitud).toLocaleDateString()}</span>
            {solicitud.fechaEstimada && (
              <span>Estimado: {new Date(solicitud.fechaEstimada).toLocaleDateString()}</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onVerDetalle}
              className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 font-semibold"
            >
              <Eye size={16} />
              Ver detalle
            </button>
            {solicitud.estado === 'completado' && solicitud.archivoUrl && onDescargar && (
              <button
                onClick={onDescargar}
                className="text-green-500 hover:text-green-600 text-sm flex items-center gap-1 font-semibold"
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
  darkMode,
  card,
  text,
  border,
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
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${text}`}>Certificados y Constancias</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setVistaActual('disponibles')}
            className={`px-4 py-2 rounded-lg transition ${
              vistaActual === 'disponibles'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Disponibles
          </button>
          <button
            onClick={() => setVistaActual('solicitudes')}
            className={`px-4 py-2 rounded-lg transition relative ${
              vistaActual === 'solicitudes'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mis Solicitudes
            {stats.solicitudesPendientes > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {stats.solicitudesPendientes}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <FileText className="text-blue-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disponibles</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.totalDisponibles}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Clock className="text-orange-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pendientes</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.solicitudesPendientes}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <CheckCircle className="text-green-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aprobadas</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.solicitudesAprobadas}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Download className="text-purple-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completadas</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.solicitudesCompletadas}</p>
        </div>
      </div>

      {/* Vista de Certificados Disponibles */}
      {vistaActual === 'disponibles' && (
        <div className="space-y-4">
          <h3 className={`text-lg font-bold ${text}`}>Certificados Disponibles para Solicitar</h3>
          {certificadosDisponibles.map(certificado => (
            <CertificateCard
              key={certificado.id}
              certificado={certificado}
              darkMode={darkMode}
              card={card}
              text={text}
              border={border}
              onSolicitar={() => setModalSolicitud(certificado)}
            />
          ))}
        </div>
      )}

      {/* Vista de Solicitudes */}
      {vistaActual === 'solicitudes' && (
        <div className="space-y-4">
          <h3 className={`text-lg font-bold ${text}`}>Mis Solicitudes de Certificados</h3>
          {solicitudes.length > 0 ? (
            solicitudes.map(solicitud => (
              <RequestCard
                key={solicitud.id}
                solicitud={solicitud}
                darkMode={darkMode}
                card={card}
                text={text}
                border={border}
                onDescargar={() => descargarCertificado(solicitud.id)}
                onVerDetalle={() => setDetalleModal(solicitud)}
              />
            ))
          ) : (
            <div className={`${card} rounded-lg shadow p-12 text-center border ${border}`}>
              <FileText size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`${text} font-bold mb-2`}>No tienes solicitudes de certificados</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
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
          <div
            className={`${card} rounded-lg max-w-md w-full p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Solicitar Certificado</h3>
              <button
                onClick={() => setModalSolicitud(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Certificado</p>
                <p className={`font-semibold ${text}`}>{modalSolicitud.tipo}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {modalSolicitud.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Costo</p>
                  <p className={`font-semibold ${text}`}>
                    {modalSolicitud.costo === 0 ? 'Gratis' : `$${modalSolicitud.costo.toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tiempo Estimado</p>
                  <p className={`font-semibold ${text}`}>{modalSolicitud.tiempoEstimado}</p>
                </div>
              </div>

              {modalSolicitud.requiereAprobacion && (
                <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-orange-500" size={20} />
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      Este certificado requiere aprobación institucional
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Indica el motivo o uso del certificado..."
                  className={`w-full p-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  rows={3}
                />
              </div>

              <button
                onClick={handleSolicitar}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold"
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
          <div
            className={`${card} rounded-lg max-w-md w-full p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Detalle de Solicitud</h3>
              <button
                onClick={() => setDetalleModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Certificado</p>
                <p className={`font-semibold ${text}`}>{detalleModal.tipoCertificado}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  detalleModal.estado === 'completado' ? 'bg-blue-100 text-blue-700' :
                  detalleModal.estado === 'aprobado' ? 'bg-green-100 text-green-700' :
                  detalleModal.estado === 'pendiente' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {detalleModal.estado}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha de Solicitud</p>
                  <p className={`font-semibold ${text}`}>
                    {new Date(detalleModal.fechaSolicitud).toLocaleDateString()}
                  </p>
                </div>
                {detalleModal.fechaEstimada && (
                  <div>
                    <p className="text-sm text-gray-500">Fecha Estimada</p>
                    <p className={`font-semibold ${text}`}>
                      {new Date(detalleModal.fechaEstimada).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {detalleModal.observaciones && (
                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {detalleModal.observaciones}
                  </p>
                </div>
              )}

              {detalleModal.estado === 'completado' && detalleModal.archivoUrl && (
                <button
                  onClick={() => descargarCertificado(detalleModal.id)}
                  className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
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
