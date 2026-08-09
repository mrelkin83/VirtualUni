import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';
import { assetsApi, AssetCreateDto } from '../../../api/endpoints/assets';
import type { Asset } from '../../../types/admin.types';

export const ActivosSection: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AssetCreateDto>({
    nombre: '',
    categoria: 'tecnologia',
    descripcion: '',
    valorCompra: 0,
    fechaCompra: new Date().toISOString().split('T')[0],
    estado: 'excelente',
    ubicacion: '',
    responsable: '',
  });

  // Cargar activos
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setError(null);
      const response = await assetsApi.getAll({
        search: searchTerm || undefined,
        categoria: categoryFilter || undefined,
      });
      setAssets((response as any).data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar activos');
      console.error('Error loading assets:', err);
    } finally {
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAssets();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  const handleOpenModal = (asset?: Asset) => {
    if (asset) {
      setEditingId(asset.id as any);
      setFormData({
        nombre: asset.nombre,
        categoria: asset.categoria,
        descripcion: asset.descripcion,
        valorCompra: asset.valorCompra,
        valorActual: asset.valorActual,
        fechaCompra: asset.fechaCompra,
        estado: asset.estado,
        ubicacion: asset.ubicacion,
        responsable: asset.responsable,
        numeroSerie: asset.numeroSerie,
        proveedor: asset.proveedor,
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        categoria: 'tecnologia',
        descripcion: '',
        valorCompra: 0,
        fechaCompra: new Date().toISOString().split('T')[0],
        estado: 'excelente',
        ubicacion: '',
        responsable: '',
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
        await assetsApi.update(editingId, formData);
      } else {
        await assetsApi.create(formData);
      }
      await loadAssets();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar activo');
      console.error('Error saving asset:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este activo?')) return;

    try {
      await assetsApi.delete(id);
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar activo');
      console.error('Error deleting asset:', err);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const categories: Record<string, string> = {
      tecnologia: 'Tecnología',
      mobiliario: 'Mobiliario',
      equipamiento: 'Equipamiento',
      vehiculo: 'Vehículo',
      otro: 'Otro',
    };
    return categories[cat] || cat;
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      excelente: 'bg-green-100 text-green-800',
      bueno: 'bg-blue-100 text-blue-800',
      regular: 'bg-yellow-100 text-yellow-800',
      malo: 'bg-orange-100 text-orange-800',
      danado: 'bg-red-100 text-red-800',
    };
    return colors[state] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Activos</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Activo
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar activos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          <option value="tecnologia">Tecnología</option>
          <option value="mobiliario">Mobiliario</option>
          <option value="equipamiento">Equipamiento</option>
          <option value="vehiculo">Vehículo</option>
          <option value="otro">Otro</option>
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
                  Código
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Valor
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay activos registrados
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {asset.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{asset.nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {getCategoryLabel(asset.categoria)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{asset.ubicacion}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(asset.estado)}`}>
                        {asset.estado.charAt(0).toUpperCase() + asset.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${asset.valorCompra.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(asset)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id as any)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                {editingId ? 'Editar Activo' : 'Nuevo Activo'}
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
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoria: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tecnologia">Tecnología</option>
                    <option value="mobiliario">Mobiliario</option>
                    <option value="equipamiento">Equipamiento</option>
                    <option value="vehiculo">Vehículo</option>
                    <option value="otro">Otro</option>
                  </select>
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
                    <option value="excelente">Excelente</option>
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                    <option value="malo">Malo</option>
                    <option value="danado">Dañado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ubicacion}
                    onChange={(e) =>
                      setFormData({ ...formData, ubicacion: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor de Compra *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.valorCompra}
                    onChange={(e) =>
                      setFormData({ ...formData, valorCompra: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Compra *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaCompra}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaCompra: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsable *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.responsable}
                    onChange={(e) =>
                      setFormData({ ...formData, responsable: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    value={formData.numeroSerie || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroSerie: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    rows={3}
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

export default ActivosSection;
