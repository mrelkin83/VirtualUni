import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Star,
  Eye,
  AlertCircle,
  FileText,
  Palette,
} from 'lucide-react';
import { cardTemplatesApi, CardTemplate } from '../../../api/endpoints/card-templates';
import { CreateTemplateModal } from './CreateTemplateModal';
import { comoArreglo } from '../../../utils/respuestaApi';
import { confirmar } from '../../ui';
import { aHex, parsearHex, tintaSobre } from '../../../theme';

/**
 * Texto legible encima del color primario de una plantilla. Los dos colores
 * los elige quien la diseña, asi que el blanco solo se lee si le toca un fondo
 * oscuro; es la misma cuenta que hace el tema para --pn-accent-ink.
 */
function tintaDe(color: string): string | undefined {
  const rgb = parsearHex(color);
  return rgb ? aHex(tintaSobre(rgb)) : undefined;
}

export const PlantillasTab: React.FC = () => {
  const [plantillas, setPlantillas] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadPlantillas();
    loadStats();
  }, []);

  const loadPlantillas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cardTemplatesApi.getAll({
        search: searchTerm || undefined,
      });
      // El backend pagina (`{ data, meta }`), no devuelve un array plano;
      // mismo problema confirmado en ExpedicionesTab.tsx.
      setPlantillas(comoArreglo(response));
    } catch (err: any) {
      setError(err.message || 'Error al cargar plantillas');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await cardTemplatesApi.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmar('¿Estás seguro de eliminar esta plantilla?')) return;

    try {
      await cardTemplatesApi.delete(id);
      await loadPlantillas();
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar plantilla');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await cardTemplatesApi.duplicate(id);
      await loadPlantillas();
    } catch (err: any) {
      setError(err.message || 'Error al duplicar plantilla');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await cardTemplatesApi.setAsDefault(id);
      await loadPlantillas();
    } catch (err: any) {
      setError(err.message || 'Error al establecer como predeterminada');
    }
  };

  const handlePreview = async (id: string) => {
    try {
      const response = await cardTemplatesApi.generatePreview(id);
      const blob = (response as any).data;
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      setError(err.message || 'Error al generar vista previa');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-pn-accent-soft rounded-lg p-4 border border-pn-accent-line">
            <div className="text-sm text-pn-accent-text font-medium">Total Plantillas</div>
            <div className="text-3xl font-bold text-pn-accent-text mt-2">{stats.total}</div>
          </div>

          <div className="bg-pn-ok-soft rounded-lg p-4 border border-pn-ok">
            <div className="text-sm text-pn-ok font-medium">Activas</div>
            <div className="text-3xl font-bold text-pn-ok mt-2">{stats.activas}</div>
          </div>

          <div className="bg-pn-warn-soft rounded-lg p-4 border border-pn-warn">
            <div className="text-sm text-pn-warn font-medium">Predeterminadas</div>
            <div className="text-3xl font-bold text-pn-warn mt-2">{stats.predeterminadas}</div>
          </div>

          <div className="bg-pn-accent-2-soft rounded-lg p-4 border border-pn-accent-2">
            <div className="text-sm text-pn-accent-2-text font-medium">En Uso</div>
            <div className="text-3xl font-bold text-pn-accent-2-text mt-2">{stats.conCarnets}</div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadPlantillas()}
            className="w-full px-4 py-2 pl-10 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
          />
          <FileText className="absolute left-3 top-3 w-5 h-5 text-pn-muted" />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
        >
          <Plus className="w-5 h-5" />
          Nueva Plantilla
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-pn-danger-soft border border-pn-danger rounded-lg text-pn-danger">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pn-accent-line"></div>
          <p className="text-pn-ink-2 mt-2">Cargando plantillas...</p>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map((plantilla) => (
            <div
              key={plantilla.id}
              className="bg-pn-surface rounded-lg border-2 border-pn-line hover:border-pn-accent-line transition-all overflow-hidden group"
            >
              {/* Preview Area */}
              <div
                className="h-48 flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, ${plantilla.colorPrimario} 0%, ${plantilla.colorSecundario} 100%)`,
                }}
              >
                <div
                  className="text-center"
                  style={{ color: tintaDe(plantilla.colorPrimario) }}
                >
                  <Palette className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <div className="text-sm font-medium opacity-75">
                    {plantilla.orientacion === 'horizontal' ? 'Horizontal' : 'Vertical'}
                  </div>
                  <div className="text-xs opacity-50">
                    {plantilla.ancho} x {plantilla.alto} mm
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {plantilla.esPredeterminada && (
                    <span className="px-2 py-1 bg-pn-warn text-pn-surface text-xs font-bold rounded">
                      PREDETERMINADA
                    </span>
                  )}
                  {plantilla.esActiva ? (
                    <span className="px-2 py-1 bg-pn-ok text-pn-surface text-xs font-bold rounded">
                      ACTIVA
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-pn-muted text-pn-surface text-xs font-bold rounded">
                      INACTIVA
                    </span>
                  )}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-pn-ink mb-1">{plantilla.nombre}</h3>
                {plantilla.descripcion && (
                  <p className="text-sm text-pn-ink-2 mb-3 line-clamp-2">{plantilla.descripcion}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {plantilla.tiposUsuario.map((tipo) => (
                    <span
                      key={tipo}
                      className="px-2 py-1 bg-pn-accent-soft text-pn-accent-text text-xs font-medium rounded"
                    >
                      {tipo}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                {plantilla._count && (
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="text-pn-ink-2">
                      <span className="font-semibold">{plantilla._count.carnets}</span> carnets
                    </div>
                    <div className="text-pn-ink-2">
                      <span className="font-semibold">{plantilla._count.expediciones}</span> expediciones
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePreview(plantilla.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-pn-surface-3 text-pn-ink-2 rounded hover:bg-pn-surface-3 transition text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Vista Previa
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(plantilla.id);
                      setShowModal(true);
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-pn-accent-2-soft text-pn-accent-2-text rounded hover:bg-pn-accent-2-soft transition text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDuplicate(plantilla.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-pn-accent-soft text-pn-accent-text rounded hover:bg-pn-accent-soft transition text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </button>

                  {!plantilla.esPredeterminada && (
                    <button
                      onClick={() => handleSetDefault(plantilla.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-pn-warn-soft text-pn-warn rounded hover:bg-pn-warn-soft transition text-sm"
                    >
                      <Star className="w-4 h-4" />
                      Predeterminar
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(plantilla.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-pn-danger-soft text-pn-danger rounded hover:bg-pn-danger-soft transition text-sm"
                    disabled={plantilla._count && plantilla._count.carnets > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && plantillas.length === 0 && (
        <div className="text-center py-12 bg-pn-surface-2 rounded-lg border-2 border-dashed border-pn-line">
          <FileText className="w-16 h-16 text-pn-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-pn-ink mb-2">No hay plantillas</h3>
          <p className="text-pn-ink-2 mb-4">Crea tu primera plantilla para empezar</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
          >
            Crear Plantilla
          </button>
        </div>
      )}

      {/* Modal for creating/editing templates */}
      {showModal && (
        <CreateTemplateModal
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
          }}
          onSuccess={() => {
            loadPlantillas();
            loadStats();
          }}
          templateToEdit={editingId ? plantillas.find((p) => p.id === editingId) : undefined}
        />
      )}
    </div>
  );
};
