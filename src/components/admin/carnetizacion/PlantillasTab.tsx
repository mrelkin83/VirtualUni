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
      setPlantillas((response as any).data || []);
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
    if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) return;

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
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Plantillas</div>
            <div className="text-3xl font-bold text-blue-700 mt-2">{stats.total}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium">Activas</div>
            <div className="text-3xl font-bold text-green-700 mt-2">{stats.activas}</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium">Predeterminadas</div>
            <div className="text-3xl font-bold text-yellow-700 mt-2">{stats.predeterminadas}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">En Uso</div>
            <div className="text-3xl font-bold text-purple-700 mt-2">{stats.conCarnets}</div>
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
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nueva Plantilla
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
          <p className="text-gray-600 mt-2">Cargando plantillas...</p>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map((plantilla) => (
            <div
              key={plantilla.id}
              className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all overflow-hidden group"
            >
              {/* Preview Area */}
              <div
                className="h-48 flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, ${plantilla.colorPrimario} 0%, ${plantilla.colorSecundario} 100%)`,
                }}
              >
                <div className="text-center text-white">
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
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                      PREDETERMINADA
                    </span>
                  )}
                  {plantilla.esActiva ? (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                      ACTIVA
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded">
                      INACTIVA
                    </span>
                  )}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{plantilla.nombre}</h3>
                {plantilla.descripcion && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plantilla.descripcion}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {plantilla.tiposUsuario.map((tipo) => (
                    <span
                      key={tipo}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                    >
                      {tipo}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                {plantilla._count && (
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="text-gray-600">
                      <span className="font-semibold">{plantilla._count.carnets}</span> carnets
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold">{plantilla._count.expediciones}</span> expediciones
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePreview(plantilla.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Vista Previa
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(plantilla.id);
                      setShowModal(true);
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDuplicate(plantilla.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </button>

                  {!plantilla.esPredeterminada && (
                    <button
                      onClick={() => handleSetDefault(plantilla.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition text-sm"
                    >
                      <Star className="w-4 h-4" />
                      Predeterminar
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(plantilla.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
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
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay plantillas</h3>
          <p className="text-gray-600 mb-4">Crea tu primera plantilla para empezar</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
