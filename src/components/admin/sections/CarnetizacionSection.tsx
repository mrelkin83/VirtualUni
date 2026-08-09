import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  RefreshCw,
  Lock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { idCardsApi, IDCardCreateDto } from '../../../api/endpoints/idcards';
import type { IDCard } from '../../../types/admin.types';
import { comoArreglo } from '../../../utils/respuestaApi';

export const CarnetizacionSection: React.FC = () => {
  const [idCards, setIdCards] = useState<IDCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IDCardCreateDto>({
    usuarioId: '',
    nombre: '',
    identificacion: '',
    tipoUsuario: 'estudiante',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    estado: 'activo',
    fotoUrl: '',
  });

  // Cargar carnés
  useEffect(() => {
    loadIDCards();
  }, []);

  const loadIDCards = async () => {
    try {
      setError(null);
      const response = await idCardsApi.getAll({
        search: searchTerm || undefined,
        tipoUsuario: typeFilter || undefined,
        estado: stateFilter || undefined,
      });
      setIdCards(comoArreglo(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar carnés');
      console.error('Error loading ID cards:', err);
    } finally {
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadIDCards();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, typeFilter, stateFilter]);

  const handleOpenModal = (card?: IDCard) => {
    if (card) {
      setEditingId(card.id as any);
      setFormData({
        usuarioId: card.usuarioId as any,
        nombre: card.nombre,
        identificacion: card.identificacion,
        tipoUsuario: card.tipoUsuario,
        numeroCarnet: card.numeroCarnet,
        fechaEmision: card.fechaEmision,
        fechaVencimiento: card.fechaVencimiento,
        estado: card.estado,
        fotoUrl: card.fotoUrl,
      });
    } else {
      setEditingId(null);
      setFormData({
        usuarioId: '',
        nombre: '',
        identificacion: '',
        tipoUsuario: 'estudiante',
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        estado: 'activo',
        fotoUrl: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await idCardsApi.update(editingId, formData);
      } else {
        await idCardsApi.create(formData);
      }
      await loadIDCards();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar carné');
      console.error('Error saving ID card:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este carné?')) return;

    try {
      await idCardsApi.delete(id);
      await loadIDCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar carné');
      console.error('Error deleting ID card:', err);
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await idCardsApi.block(id, { motivo: 'Bloqueado por administrador' });
      await loadIDCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al bloquear carné');
      console.error('Error blocking ID card:', err);
    }
  };

  const handleRenew = async (id: string) => {
    try {
      await idCardsApi.renew(id, { meses: 12 });
      await loadIDCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al renovar carné');
      console.error('Error renewing ID card:', err);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      estudiante: 'Estudiante',
      docente: 'Docente',
      administrativo: 'Administrativo',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      estudiante: 'bg-blue-100 text-blue-800',
      docente: 'bg-purple-100 text-purple-800',
      administrativo: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      activo: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      bloqueado: 'bg-orange-100 text-orange-800',
      perdido: 'bg-gray-100 text-gray-800',
    };
    return colors[state] || 'bg-gray-100 text-gray-800';
  };

  const isExpired = (fecha: string) => {
    return new Date(fecha) < new Date();
  };

  const isExpiringSoon = (fecha: string) => {
    const daysUntilExpiry =
      (new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const expiredCount = idCards.filter((c) => isExpired(c.fechaVencimiento)).length;
  const expiringCount = idCards.filter((c) => isExpiringSoon(c.fechaVencimiento)).length;
  const blockedCount = idCards.filter((c) => c.estado === 'bloqueado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Carnetización</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Carné
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total de Carnés</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{idCards.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600">Vencidos</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{expiredCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600">Por Vencer (30 días)</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{expiringCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600">Bloqueados</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">{blockedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los tipos</option>
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
          <option value="administrativo">Administrativo</option>
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="vencido">Vencido</option>
          <option value="bloqueado">Bloqueado</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Carné
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Emisión
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {idCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay carnés registrados
                  </td>
                </tr>
              ) : (
                idCards.map((card) => {
                  const expired = isExpired(card.fechaVencimiento);
                  const expiringSoon = isExpiringSoon(card.fechaVencimiento);

                  return (
                    <tr
                      key={card.id}
                      className={`hover:bg-gray-50 transition ${
                        expired || expiringSoon ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {card.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {card.numeroCarnet || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(card.tipoUsuario)}`}>
                          {getTypeLabel(card.tipoUsuario)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(card.fechaEmision).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {new Date(card.fechaVencimiento).toLocaleDateString('es-ES')}
                          {expiringSoon && !expired && (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                          {expired && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(card.estado)}`}>
                          {card.estado.charAt(0).toUpperCase() + card.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(card)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          {expired && (
                            <button
                              onClick={() => handleRenew(card.id as any)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Renovar"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          )}
                          {card.estado !== 'bloqueado' && (
                            <button
                              onClick={() => handleBlock(card.id as any)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Bloquear"
                            >
                              <Lock className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(card.id as any)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar Carné' : 'Nuevo Carné'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.usuarioId}
                    onChange={(e) =>
                      setFormData({ ...formData, usuarioId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.identificacion}
                    onChange={(e) =>
                      setFormData({ ...formData, identificacion: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Usuario *
                  </label>
                  <select
                    required
                    value={formData.tipoUsuario}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoUsuario: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Carné
                  </label>
                  <input
                    type="text"
                    value={formData.numeroCarnet || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroCarnet: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="vencido">Vencido</option>
                    <option value="bloqueado">Bloqueado</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Emisión *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaEmision}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaEmision: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaVencimiento}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaVencimiento: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Foto *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.fotoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, fotoUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarnetizacionSection;
