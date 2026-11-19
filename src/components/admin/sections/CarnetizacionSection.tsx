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
import { confirmar } from '../../ui';

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
    if (!await confirmar('¿Estás seguro de que deseas eliminar este carné?')) return;

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
      estudiante: 'bg-pn-accent-soft text-pn-accent-text',
      docente: 'bg-pn-accent-2-soft text-pn-accent-2-text',
      administrativo: 'bg-pn-ok-soft text-pn-ok',
    };
    return colors[type] || 'bg-pn-surface-3 text-pn-ink';
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      activo: 'bg-pn-ok-soft text-pn-ok',
      vencido: 'bg-pn-danger-soft text-pn-danger',
      bloqueado: 'bg-pn-warn-soft text-pn-warn',
      perdido: 'bg-pn-surface-3 text-pn-ink',
    };
    return colors[state] || 'bg-pn-surface-3 text-pn-ink';
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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-pn-ink">Carnetización</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Carné
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-pn-surface rounded-lg shadow p-4">
          <div className="text-sm text-pn-ink-2">Total de Carnés</div>
          <div className="text-3xl font-bold text-pn-ink mt-2">{idCards.length}</div>
        </div>

        <div className="bg-pn-surface rounded-lg shadow p-4 border-l-4 border-pn-danger">
          <div className="text-sm text-pn-ink-2">Vencidos</div>
          <div className="text-3xl font-bold text-pn-danger mt-2">{expiredCount}</div>
        </div>

        <div className="bg-pn-surface rounded-lg shadow p-4 border-l-4 border-pn-warn">
          <div className="text-sm text-pn-ink-2">Por Vencer (30 días)</div>
          <div className="text-3xl font-bold text-pn-warn mt-2">{expiringCount}</div>
        </div>

        <div className="bg-pn-surface rounded-lg shadow p-4 border-l-4 border-pn-warn">
          <div className="text-sm text-pn-ink-2">Bloqueados</div>
          <div className="text-3xl font-bold text-pn-warn mt-2">{blockedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-pn-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
        >
          <option value="">Todos los tipos</option>
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
          <option value="administrativo">Administrativo</option>
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
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
        <div className="flex items-center gap-3 p-4 bg-pn-danger-soft border border-pn-danger rounded-lg text-pn-danger">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-pn-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pn-surface-2 border-b border-pn-line">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-pn-ink">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-pn-ink">
                  Carné
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-pn-ink">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-pn-ink">
                  Emisión
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-pn-ink">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-pn-ink">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-pn-ink">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pn-line">
              {idCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-pn-muted">
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
                      className={`hover:bg-pn-surface-2 transition ${
                        expired || expiringSoon ? 'bg-pn-warn-soft' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-pn-ink">
                        {card.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-pn-ink-2">
                        {card.numeroCarnet || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(card.tipoUsuario)}`}>
                          {getTypeLabel(card.tipoUsuario)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-pn-ink-2">
                        {new Date(card.fechaEmision).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {new Date(card.fechaVencimiento).toLocaleDateString('es-ES')}
                          {expiringSoon && !expired && (
                            <AlertTriangle className="w-4 h-4 text-pn-warn" />
                          )}
                          {expired && (
                            <AlertTriangle className="w-4 h-4 text-pn-danger" />
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
                            className="p-2 text-pn-accent-text hover:bg-pn-accent-soft rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          {expired && (
                            <button
                              onClick={() => handleRenew(card.id as any)}
                              className="p-2 text-pn-ok hover:bg-pn-ok-soft rounded-lg transition"
                              title="Renovar"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          )}
                          {card.estado !== 'bloqueado' && (
                            <button
                              onClick={() => handleBlock(card.id as any)}
                              className="p-2 text-pn-warn hover:bg-pn-warn-soft rounded-lg transition"
                              title="Bloquear"
                            >
                              <Lock className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(card.id as any)}
                            className="p-2 text-pn-danger hover:bg-pn-danger-soft rounded-lg transition"
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
          <div role="dialog" aria-modal="true" aria-label="{editingId ? 'Editar Carné' : 'Nuevo Carné'}" className="bg-pn-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-wrap justify-between items-center p-6 border-b border-pn-line gap-4">
              <h3 className="text-xl font-bold text-pn-ink">
                {editingId ? 'Editar Carné' : 'Nuevo Carné'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-pn-muted hover:text-pn-ink-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                    ID Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.usuarioId}
                    onChange={(e) =>
                      setFormData({ ...formData, usuarioId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                    Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.identificacion}
                    onChange={(e) =>
                      setFormData({ ...formData, identificacion: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
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
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                    Número de Carné
                  </label>
                  <input
                    type="text"
                    value={formData.numeroCarnet || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroCarnet: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                    Estado *
                  </label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  >
                    <option value="activo">Activo</option>
                    <option value="vencido">Vencido</option>
                    <option value="bloqueado">Bloqueado</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                    Fecha de Emisión *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaEmision}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaEmision: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaVencimiento}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaVencimiento: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-pn-ink-2 mb-1">
                    URL de Foto *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.fotoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, fotoUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-pn-line">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-pn-ink-2 border border-pn-line rounded-lg hover:bg-pn-surface-2 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
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
