import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  TrendingDown,
  X,
} from 'lucide-react';
import {
  inventoryApi,
  InventoryItemCreateDto,
} from '../../../api/endpoints/inventory';
import type { InventoryItem } from '../../../types/admin.types';

export const InventarioSection: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InventoryItemCreateDto>({
    nombre: '',
    categoria: '',
    cantidad: 0,
    cantidadMinima: 0,
    unidadMedida: 'unidades',
    precioUnitario: 0,
    ubicacion: '',
    proveedor: '',
    fechaUltimaCompra: new Date().toISOString().split('T')[0],
  });

  // Cargar inventario
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setError(null);
      const response = await inventoryApi.items.getAll({
        search: searchTerm || undefined,
        categoria: categoryFilter || undefined,
      });
      setItems((response as any).data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inventario');
      console.error('Error loading inventory:', err);
    } finally {
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInventory();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingId(item.id as any);
      setFormData({
        nombre: item.nombre,
        categoria: item.categoria,
        cantidad: item.cantidad,
        cantidadMinima: item.cantidadMinima,
        unidadMedida: item.unidadMedida,
        precioUnitario: item.precioUnitario,
        ubicacion: item.ubicacion,
        proveedor: item.proveedor,
        fechaUltimaCompra: item.fechaUltimaCompra,
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        categoria: '',
        cantidad: 0,
        cantidadMinima: 0,
        unidadMedida: 'unidades',
        precioUnitario: 0,
        ubicacion: '',
        proveedor: '',
        fechaUltimaCompra: new Date().toISOString().split('T')[0],
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
        await inventoryApi.items.update(editingId, formData);
      } else {
        await inventoryApi.items.create(formData);
      }
      await loadInventory();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar artículo');
      console.error('Error saving inventory:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) return;

    try {
      await inventoryApi.items.delete(id);
      await loadInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar artículo');
      console.error('Error deleting item:', err);
    }
  };

  const getStockStatus = (cantidad: number, cantidadMinima: number) => {
    if (cantidad === 0) return { label: 'Agotado', color: 'bg-red-100 text-red-800' };
    if (cantidad <= cantidadMinima)
      return { label: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Disponible', color: 'bg-green-100 text-green-800' };
  };

  const calculateInventoryValue = (item: InventoryItem) => {
    return item.cantidad * item.precioUnitario;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Artículo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total de Artículos</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{items.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Stock Bajo</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {items.filter((i) => i.cantidad <= i.cantidadMinima && i.cantidad > 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Agotados</div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {items.filter((i) => i.cantidad === 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Valor Total</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            ${items.reduce((acc, item) => acc + calculateInventoryValue(item), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <input
          type="text"
          placeholder="Filtrar por categoría..."
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Mín. Req.
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Precio Unit.
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No hay artículos en el inventario
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const status = getStockStatus(item.cantidad, item.cantidadMinima);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.codigo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.categoria}</td>
                      <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                        {item.cantidad} {item.unidadMedida}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">
                        {item.cantidadMinima}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {item.cantidad <= item.cantidadMinima && item.cantidad > 0 && (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        ${item.precioUnitario.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id as any)}
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
                {editingId ? 'Editar Artículo' : 'Nuevo Artículo'}
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
                  <input
                    type="text"
                    required
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.cantidad}
                    onChange={(e) =>
                      setFormData({ ...formData, cantidad: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad Mínima *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.cantidadMinima}
                    onChange={(e) =>
                      setFormData({ ...formData, cantidadMinima: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad de Medida *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unidadMedida}
                    onChange={(e) =>
                      setFormData({ ...formData, unidadMedida: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.precioUnitario}
                    onChange={(e) =>
                      setFormData({ ...formData, precioUnitario: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                    Proveedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.proveedor}
                    onChange={(e) =>
                      setFormData({ ...formData, proveedor: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Última Compra *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaUltimaCompra}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaUltimaCompra: e.target.value })
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

export default InventarioSection;
