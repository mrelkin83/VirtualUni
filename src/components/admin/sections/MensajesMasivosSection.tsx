import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader,
  X,
  Send,
  Clock,
  BarChart3,
} from 'lucide-react';
import { massMessagesApi } from '../../../api/endpoints/mass-messages';
import type { MassMessage } from '../../../types/admin.types';

interface MessageFormData {
  asunto: string;
  contenido: string;
  targetRoles: string[];
  targetUsers: string[];
  adjuntos: string[];
  programado?: string;
}

export const MensajesMasivosSection: React.FC = () => {
  const [messages, setMessages] = useState<MassMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState<MessageFormData>({
    asunto: '',
    contenido: '',
    targetRoles: [],
    targetUsers: [],
    adjuntos: [],
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await massMessagesApi.getAll({
        search: searchTerm || undefined,
        estado: statusFilter || undefined,
      });
      setMessages((response as any).data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMessages();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleOpenModal = (message?: MassMessage) => {
    if (message) {
      setEditingId(message.id);
      setFormData({
        asunto: message.asunto,
        contenido: message.contenido,
        targetRoles: message.targetRoles,
        targetUsers: message.targetUsers,
        adjuntos: message.adjuntos,
        programado: message.programado
          ? new Date(message.programado).toISOString().slice(0, 16)
          : undefined,
      });
    } else {
      setEditingId(null);
      setFormData({
        asunto: '',
        contenido: '',
        targetRoles: [],
        targetUsers: [],
        adjuntos: [],
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
        await massMessagesApi.update(editingId, formData);
      } else {
        await massMessagesApi.create(formData);
      }
      await loadMessages();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleSend = async (id: string) => {
    if (!window.confirm('Enviar mensaje masivo a todos los destinatarios?')) return;
    try {
      await massMessagesApi.send(id);
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirmar eliminación de mensaje')) return;
    try {
      await massMessagesApi.delete(id);
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleShowStats = async () => {
    try {
      const statsData = await massMessagesApi.getStats();
      setStats(statsData);
      setShowStatsModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BORRADOR':
        return 'bg-gray-100 text-gray-800';
      case 'PROGRAMADO':
        return 'bg-blue-100 text-blue-800';
      case 'ENVIADO':
        return 'bg-green-100 text-green-800';
      case 'FALLIDO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mensajes Masivos</h1>
        <div className="flex gap-2">
          <button
            onClick={handleShowStats}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Estadísticas
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Mensaje
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Buscar mensajes..."
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
          <option value="BORRADOR">Borrador</option>
          <option value="PROGRAMADO">Programado</option>
          <option value="ENVIADO">Enviado</option>
          <option value="FALLIDO">Fallido</option>
        </select>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tabla de mensajes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay mensajes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Asunto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Destinatarios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Programado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {message.asunto}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {message.contenido.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>
                          {message.targetRoles?.length > 0 &&
                            `Roles: ${message.targetRoles.join(', ')}`}
                        </div>
                        {message.targetUsers?.length > 0 && (
                          <div className="text-gray-500">
                            {message.targetUsers.length} usuarios específicos
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(message.estado)}`}>
                        {message.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {message.programado ? (
                          <>
                            <Clock className="w-4 h-4 inline mr-1" />
                            {new Date(message.programado).toLocaleDateString()}
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {(message.estado === 'BORRADOR' ||
                        message.estado === 'PROGRAMADO') && (
                        <>
                          <button
                            onClick={() => handleSend(message.id)}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
                            title="Enviar"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(message)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {message.estado !== 'ENVIADO' && (
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar Mensaje' : 'Nuevo Mensaje Masivo'}
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
                  Asunto
                </label>
                <input
                  type="text"
                  value={formData.asunto}
                  onChange={(e) =>
                    setFormData({ ...formData, asunto: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido
                </label>
                <textarea
                  value={formData.contenido}
                  onChange={(e) =>
                    setFormData({ ...formData, contenido: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  required
                  minLength={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roles Objetivo
                  </label>
                  <div className="space-y-2">
                    {['STUDENT', 'TEACHER', 'ADMIN'].map((role) => (
                      <label key={role} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.targetRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                targetRoles: [...formData.targetRoles, role],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targetRoles: formData.targetRoles.filter(
                                  (r) => r !== role
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Programar Envío (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.programado || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        programado: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si no se especifica, se envía inmediatamente
                  </p>
                </div>
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
                  {editingId ? 'Guardar Cambios' : 'Crear y Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de estadísticas */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Estadísticas de Mensajes
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Borradores</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.borradores}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Programados</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.programados}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Enviados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.enviados}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Fallidos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.fallidos}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Destinatarios Promedio
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.destinatariosPromedio}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
