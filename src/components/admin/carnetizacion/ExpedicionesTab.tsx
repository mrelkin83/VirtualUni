import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Download,
  XCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Filter,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { cardIssuancesApi, CardIssuance } from '../../../api/endpoints/card-issuances';
import { CreateIssuanceModal } from './CreateIssuanceModal';

const TIPO_EXPEDICION_LABELS: Record<string, string> = {
  NUEVA_EMISION: 'Nueva Emisión',
  RENOVACION: 'Renovación',
  REEMPLAZO: 'Reemplazo',
  MASIVA: 'Masiva',
};

const ESTADO_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  PROCESANDO: { label: 'Procesando', color: 'blue', icon: Clock },
  COMPLETADO: { label: 'Completado', color: 'green', icon: CheckCircle },
  COMPLETADO_CON_ERRORES: { label: 'Completado con errores', color: 'yellow', icon: AlertCircle },
  FALLIDO: { label: 'Fallido', color: 'red', icon: XCircle },
  CANCELADO: { label: 'Cancelado', color: 'gray', icon: XCircle },
};

export const ExpedicionesTab: React.FC = () => {
  const [expediciones, setExpediciones] = useState<CardIssuance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadExpediciones();
    loadStats();
  }, []);

  const loadExpediciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cardIssuancesApi.getAll({
        search: searchTerm || undefined,
        estado: filterEstado || undefined,
        tipoExpedicion: filterTipo || undefined,
        sortBy: 'fechaExpedicion',
        sortOrder: 'desc',
      });
      setExpediciones((response as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar expediciones');
      console.error('Error loading issuances:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await cardIssuancesApi.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('¿Estás seguro de cancelar esta expedición?')) return;

    try {
      await cardIssuancesApi.cancel(id);
      await loadExpediciones();
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al cancelar expedición');
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await cardIssuancesApi.downloadPDF(id);
      const blob = (response as any).data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expedicion-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al descargar PDF');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Expediciones</div>
            <div className="text-3xl font-bold text-blue-700 mt-2">{stats.total}</div>
            <div className="text-xs text-blue-600 mt-1">
              {stats.totalCarnets} carnets expedidos
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium">Completadas</div>
            <div className="text-3xl font-bold text-green-700 mt-2">{stats.completadas}</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.exitosas} carnets exitosos
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium">En Proceso</div>
            <div className="text-3xl font-bold text-yellow-700 mt-2">{stats.procesando}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Este Mes</div>
            <div className="text-3xl font-bold text-purple-700 mt-2">{stats.esteMes}</div>
            <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stats.carnetsEsteMes} carnets
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por lote, expedidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadExpediciones()}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_LABELS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(TIPO_EXPEDICION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={loadExpediciones}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Nueva Expedición
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Cargando expediciones...</p>
        </div>
      )}

      {/* Expediciones List */}
      {!loading && (
        <div className="space-y-4">
          {expediciones.map((expedicion) => {
            const estadoInfo = ESTADO_LABELS[expedicion.estado];
            const EstadoIcon = estadoInfo.icon;

            return (
              <div
                key={expedicion.id}
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all overflow-hidden"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{expedicion.lote}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700`}
                        >
                          <EstadoIcon className="w-3 h-3 inline mr-1" />
                          {estadoInfo.label}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {TIPO_EXPEDICION_LABELS[expedicion.tipoExpedicion]}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(expedicion.fechaExpedicion)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Por: {expedicion.expedidoPorNombre}
                        </div>
                        {expedicion.template && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Plantilla: {expedicion.template.nombre}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{expedicion.cantidad}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{expedicion.cantidadExitosa}</div>
                      <div className="text-xs text-gray-600">Exitosos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{expedicion.cantidadFallida}</div>
                      <div className="text-xs text-gray-600">Fallidos</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(expedicion.motivo || expedicion.observaciones) && (
                    <div className="mb-4 space-y-2">
                      {expedicion.motivo && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Motivo:</span>
                          <span className="text-gray-600 ml-2">{expedicion.motivo}</span>
                        </div>
                      )}
                      {expedicion.observaciones && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Observaciones:</span>
                          <span className="text-gray-600 ml-2">{expedicion.observaciones}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {expedicion.estado === 'COMPLETADO' && (
                      <button
                        onClick={() => handleDownloadPDF(expedicion.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </button>
                    )}

                    {expedicion.estado === 'PROCESANDO' && (
                      <button
                        onClick={() => handleCancel(expedicion.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                      </button>
                    )}

                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && expediciones.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay expediciones</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterEstado || filterTipo
              ? 'No se encontraron expediciones con los filtros aplicados'
              : 'Crea tu primera expedición para empezar'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Nueva Expedición
          </button>
        </div>
      )}

      {/* Modal for creating issuances */}
      {showModal && (
        <CreateIssuanceModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            loadExpediciones();
            loadStats();
          }}
        />
      )}
    </div>
  );
};
