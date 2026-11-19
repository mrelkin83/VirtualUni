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
import { comoArreglo } from '../../../utils/respuestaApi';
import type { Procedure } from '../../../types/admin.types';
import { confirmar } from '../../ui';

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
      // El endpoint responde con sobre de paginación, `{ data, pagination }`,
      // y el cliente lo envuelve otra vez en `{ data }`. Quedarse en el primer
      // nivel dejaba un objeto donde el componente esperaba un arreglo:
      // `procedures.map is not a function` tumbaba el panel de administración
      // entero y dejaba en blanco las otras 19 secciones.
      setProcedures(comoArreglo(response));
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
    if (!await confirmar('Confirmar eliminación de trámite')) return;
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
        return 'bg-pn-surface-3 text-pn-ink';
      case 'EN_PROCESO':
        return 'bg-pn-warn-soft text-pn-warn';
      case 'COMPLETADO':
        return 'bg-pn-ok-soft text-pn-ok';
      case 'RECHAZADO':
        return 'bg-pn-danger-soft text-pn-danger';
      default:
        return 'bg-pn-surface-3 text-pn-ink';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA':
        return 'bg-pn-danger-soft text-pn-danger';
      case 'MEDIA':
        return 'bg-pn-warn-soft text-pn-warn';
      case 'BAJA':
        return 'bg-pn-ok-soft text-pn-ok';
      default:
        return 'bg-pn-surface-3 text-pn-ink';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-pn-ink">Trámites</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
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
            className="w-full px-4 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
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
          className="px-4 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
        >
          <option value="">Todas las prioridades</option>
          <option value="ALTA">Prioridad Alta</option>
          <option value="MEDIA">Prioridad Media</option>
          <option value="BAJA">Prioridad Baja</option>
        </select>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-pn-danger-soft border border-pn-danger text-pn-danger px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tabla de trámites */}
      <div className="bg-pn-surface rounded-lg shadow overflow-hidden">
        {procedures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-pn-muted">No hay trámites</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pn-surface-2 border-b border-pn-line">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pn-line">
                {procedures.map((procedure) => (
                  <tr key={procedure.id} className="hover:bg-pn-surface-2">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-pn-ink">
                        {procedure.tipo}
                      </div>
                      <div className="text-sm text-pn-muted truncate">
                        {procedure.descripcion.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-pn-ink">
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
                            className="inline-flex items-center gap-1 text-pn-accent-text hover:text-pn-accent-text"
                            title="Responder"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      {procedure.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => handleOpenModal(procedure)}
                          className="inline-flex items-center gap-1 text-pn-ok hover:text-pn-ok"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(procedure.id)}
                        className="inline-flex items-center gap-1 text-pn-danger hover:text-pn-danger"
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
          <div role="dialog" aria-modal="true" aria-label="{editingId ? 'Editar Trámite' : 'Nuevo Trámite'}" className="bg-pn-surface rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex flex-wrap justify-between items-center p-6 border-b border-pn-line gap-4">
              <h2 className="text-xl font-bold text-pn-ink">
                {editingId ? 'Editar Trámite' : 'Nuevo Trámite'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-pn-muted hover:text-pn-ink-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                  Tipo de Trámite
                </label>
                <input
                  type="text"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
                  required
                  minLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
                  rows={5}
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">
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
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
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
                  className="px-4 py-2 border border-pn-line rounded-lg text-pn-ink-2 hover:bg-pn-surface-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover"
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
          <div role="dialog" aria-modal="true" aria-label="Responder Trámite" className="bg-pn-surface rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex flex-wrap justify-between items-center p-6 border-b border-pn-line gap-4">
              <h2 className="text-xl font-bold text-pn-ink">Responder Trámite</h2>
              <button
                onClick={handleCloseRespondModal}
                className="text-pn-muted hover:text-pn-ink-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRespond} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                  Respuesta
                </label>
                <textarea
                  value={respondData.respuesta}
                  onChange={(e) =>
                    setRespondData({ ...respondData, respuesta: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
                  rows={5}
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">
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
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
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
                  className="px-4 py-2 border border-pn-line rounded-lg text-pn-ink-2 hover:bg-pn-surface-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pn-ok text-pn-surface rounded-lg hover:bg-pn-ok"
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
