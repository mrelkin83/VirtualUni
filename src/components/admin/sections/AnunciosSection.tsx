import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader,
  X,
  Archive,
  CheckCircle,
} from 'lucide-react';
import { announcementsApi } from '../../../api/endpoints/announcements';
import type { Announcement } from '../../../types/admin.types';
import { comoArreglo } from '../../../utils/respuestaApi';
import { confirmar } from '../../ui';

interface AnnouncementFormData {
  titulo: string;
  contenido: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  targetRoles: string[];
  adjuntos: string[];
}

export const AnunciosSection: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    titulo: '',
    contenido: '',
    prioridad: 'MEDIA',
    targetRoles: ['STUDENT', 'TEACHER'],
    adjuntos: [],
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await announcementsApi.getAll({
        search: searchTerm || undefined,
        prioridad: priorityFilter || undefined,
        estado: statusFilter || undefined,
      });
      setAnnouncements(comoArreglo(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar anuncios');
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnnouncements();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, priorityFilter, statusFilter]);

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData({
        titulo: announcement.titulo,
        contenido: announcement.contenido,
        prioridad: announcement.prioridad,
        targetRoles: announcement.targetRoles,
        adjuntos: announcement.adjuntos,
      });
    } else {
      setEditingId(null);
      setFormData({
        titulo: '',
        contenido: '',
        prioridad: 'MEDIA',
        targetRoles: ['STUDENT', 'TEACHER'],
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
        await announcementsApi.update(editingId, formData);
      } else {
        await announcementsApi.create(formData);
      }
      await loadAnnouncements();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await announcementsApi.publish(id);
      await loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await announcementsApi.archive(id);
      await loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al archivar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmar('Confirmar eliminación de anuncio')) return;
    try {
      await announcementsApi.delete(id);
      await loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLICADO':
        return 'bg-pn-accent-soft text-pn-accent-text';
      case 'BORRADOR':
        return 'bg-pn-surface-3 text-pn-ink';
      case 'ARCHIVADO':
        return 'bg-pn-muted text-pn-surface';
      default:
        return 'bg-pn-surface-3 text-pn-ink';
    }
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-pn-accent-text" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-pn-ink">Anuncios</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Anuncio
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Buscar anuncios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
          />
        </div>
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
        >
          <option value="">Todos los estados</option>
          <option value="BORRADOR">Borrador</option>
          <option value="PUBLICADO">Publicado</option>
          <option value="ARCHIVADO">Archivado</option>
        </select>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-pn-danger-soft border border-pn-danger text-pn-danger px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tabla de anuncios */}
      <div className="bg-pn-surface rounded-lg shadow overflow-hidden">
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-pn-muted">No hay anuncios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pn-surface-2 border-b border-pn-line">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Titulo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-pn-ink-2 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pn-line">
                {announcements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-pn-surface-2">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-pn-ink">
                        {announcement.titulo}
                      </div>
                      <div className="text-sm text-pn-muted truncate">
                        {announcement.contenido.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(announcement.prioridad)}`}>
                        {announcement.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(announcement.estado)}`}>
                        {announcement.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-pn-muted">
                        {announcement.targetRoles.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {announcement.estado === 'BORRADOR' && (
                        <>
                          <button
                            onClick={() => handlePublish(announcement.id)}
                            className="inline-flex items-center gap-1 text-pn-ok hover:text-pn-ok"
                            title="Publicar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(announcement)}
                            className="inline-flex items-center gap-1 text-pn-accent-text hover:text-pn-accent-text"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {announcement.estado === 'PUBLICADO' && (
                        <button
                          onClick={() => handleArchive(announcement.id)}
                          className="inline-flex items-center gap-1 text-pn-ink-2 hover:text-pn-ink"
                          title="Archivar"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(announcement.id)}
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
          <div role="dialog" aria-modal="true" aria-label="{editingId ? 'Editar Anuncio' : 'Nuevo Anuncio'}" className="bg-pn-surface rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-pn-line">
              <h2 className="text-xl font-bold text-pn-ink">
                {editingId ? 'Editar Anuncio' : 'Nuevo Anuncio'}
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
                  Titulo
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
                  required
                  minLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                  Contenido
                </label>
                <textarea
                  value={formData.contenido}
                  onChange={(e) =>
                    setFormData({ ...formData, contenido: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-pn-line rounded-lg focus:outline-none focus:ring-2 focus:ring-pn-accent"
                  rows={5}
                  required
                  minLength={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
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
                        <span className="text-sm text-pn-ink-2">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
                  {editingId ? 'Guardar Cambios' : 'Crear Anuncio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
