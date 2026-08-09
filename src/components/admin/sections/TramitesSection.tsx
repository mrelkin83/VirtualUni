import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import { proceduresApi } from '../../../api/endpoints/procedures';
import type { Procedure } from '../../../types/admin.types';

interface ProcedureFormData {
  tipo: string;
  descripcion: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  adjuntos: string[];
}

interface RespondFormData {
  respuesta: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO';
  adjuntosRespuesta: string[];
}

export const TramitesSection: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProcedureFormData>({
    tipo: '',
    descripcion: '',
    prioridad: 'MEDIA',
    adjuntos: [],
  });

  const [respondData, setRespondData] = useState<RespondFormData>({
    respuesta: '',
    estado: 'EN_PROCESO',
    adjuntosRespuesta: [],
  });

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    try {
      setError(null);
      const response = await proceduresApi.getAll({
        search: searchTerm || undefined,
        estado: statusFilter || undefined,
        prioridad: priorityFilter || undefined,
      });
      setProcedures((response as any).data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar trámites');
      console.error('Error loading procedures:', err);
    } finally {
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProcedures();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, priorityFilter]);

  const handleOpenModal = (procedure?: Procedure) => {
    if (procedure) {
      setEditingId(procedure.id);
      setFormData({
        tipo: procedure.tipo,
        descripcion: procedure.descripcion,
        prioridad: procedure.prioridad,
        adjuntos: procedure.adjuntos,
      });
    } else {
      setEditingId(null);
      setFormData({
        tipo: '',
        descripcion: '',
        prioridad: 'MEDIA',
        adjuntos: [],
      });
    }
    setShowModal(true);
  };

  const handleOpenRespondModal = (procedureId: string) => {
    setRespondingId(procedureId);
    setRespondData({
      respuesta: '',
      estado: 'EN_PROCESO',
      adjuntosRespuesta: [],
    });
    setShowRespondModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleCloseRespondModal = () => {
    setShowRespondModal(false);
    setRespondingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await proceduresApi.update(editingId, formData);
      } else {
        await proceduresApi.create(formData);
      }
      await loadProcedures();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingId) return;
    try {
      await proceduresApi.respond(respondingId, respondData.respuesta, respondData.adjuntosRespuesta);
      await loadProcedures();
      handleCloseRespondModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al responder');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirmar eliminación de trámite')) return;
    try {
      await proceduresApi.delete(id);
      await loadProcedures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-gray-100 text-gray-800';
      case 'EN_PROCESO':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA':
        return 'bg-red-100 text-red-800';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800';
      case 'BAJA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trámites</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Trámite
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Buscar trámites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En Proceso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="RECHAZADO">Rechazado</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las prioridades</option>
          <option value="ALTA">Prioridad Alta</option>
          <option value="MEDIA">Prioridad Media</option>
          <option value="BAJA">Prioridad Baja</option>
        </select>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tabla de trámites */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {procedures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay trámites</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {procedures.map((procedure) => (
                  <tr key={procedure.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {procedure.tipo}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {procedure.descripcion.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {procedure.solicitante}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(procedure.estado)}`}>
                        {procedure.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(procedure.prioridad)}`}>
                        {procedure.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {procedure.estado !== 'COMPLETADO' &&
                        procedure.estado !== 'RECHAZADO' && (
                          <button
                            onClick={() => handleOpenRespondModal(procedure.id)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            title="Responder"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      {procedure.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => handleOpenModal(procedure)}
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(procedure.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar Trámite' : 'Nuevo Trámite'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Trámite
                </label>
                <input
                  type="text"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={formData.prioridad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prioridad: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Media</option>
                  <option value="BAJA">Baja</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Trámite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de respuesta */}
      {showRespondModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Responder Trámite</h2>
              <button
                onClick={handleCloseRespondModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRespond} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respuesta
                </label>
                <textarea
                  value={respondData.respuesta}
                  onChange={(e) =>
                    setRespondData({ ...respondData, respuesta: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Trámite
                </label>
                <select
                  value={respondData.estado}
                  onChange={(e) =>
                    setRespondData({
                      ...respondData,
                      estado: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseRespondModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Enviar Respuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
