import React, { useState } from 'react';
import { X, Upload, FileText, Video, File, Image, Link as LinkIcon, Trash2, Download, Eye } from 'lucide-react';

interface Material {
  id: number;
  nombre: string;
  tipo: 'pdf' | 'video' | 'documento' | 'imagen' | 'enlace';
  url: string;
  tamaño?: string;
  archivo?: File;
}

interface GestionMaterialesModalProps {
  tema: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (temaId: number, materiales: Material[]) => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const GestionMaterialesModal: React.FC<GestionMaterialesModalProps> = ({
  tema,
  isOpen,
  onClose,
  onSave,
  darkMode,
  card,
  text,
  border
}) => {
  const [materiales, setMateriales] = useState<Material[]>(tema?.materiales || []);
  const [nuevoMaterial, setNuevoMaterial] = useState({
    nombre: '',
    tipo: 'pdf' as 'pdf' | 'video' | 'documento' | 'imagen' | 'enlace',
    url: '',
    archivo: null as File | null
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detectar tipo basado en extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    let tipo: 'pdf' | 'video' | 'documento' | 'imagen' = 'documento';

    if (extension === 'pdf') tipo = 'pdf';
    else if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension || '')) tipo = 'video';
    else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) tipo = 'imagen';
    else if (['doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension || '')) tipo = 'documento';

    setNuevoMaterial({
      ...nuevoMaterial,
      nombre: file.name,
      tipo,
      archivo: file,
      url: URL.createObjectURL(file)
    });
  };

  const handleAgregarMaterial = () => {
    if (!nuevoMaterial.nombre) {
      alert('Por favor ingresa un nombre para el material');
      return;
    }

    if (nuevoMaterial.tipo === 'enlace' && !nuevoMaterial.url) {
      alert('Por favor ingresa una URL válida');
      return;
    }

    if (nuevoMaterial.tipo !== 'enlace' && !nuevoMaterial.archivo) {
      alert('Por favor selecciona un archivo');
      return;
    }

    const tamaño = nuevoMaterial.archivo
      ? `${(nuevoMaterial.archivo.size / 1024 / 1024).toFixed(2)} MB`
      : undefined;

    const material: Material = {
      id: Date.now(),
      nombre: nuevoMaterial.nombre,
      tipo: nuevoMaterial.tipo,
      url: nuevoMaterial.url,
      tamaño,
      archivo: nuevoMaterial.archivo || undefined
    };

    setMateriales([...materiales, material]);
    setNuevoMaterial({
      nombre: '',
      tipo: 'pdf',
      url: '',
      archivo: null
    });
  };

  const handleEliminarMaterial = (id: number) => {
    setMateriales(materiales.filter(m => m.id !== id));
  };

  const handleGuardar = () => {
    onSave(tema.id, materiales);
    onClose();
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="text-red-600" size={20} />;
      case 'video':
        return <Video className="text-purple-600" size={20} />;
      case 'documento':
        return <File className="text-blue-600" size={20} />;
      case 'imagen':
        return <Image className="text-green-600" size={20} />;
      case 'enlace':
        return <LinkIcon className="text-orange-600" size={20} />;
      default:
        return <File className="text-gray-600" size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${card} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-inherit p-6 border-b ${border} flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${text}`}>Gestión de Materiales</h2>
            <p className="text-sm text-gray-500 mt-1">Tema: {tema?.titulo}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Formulario para agregar material */}
          <section className={`border ${border} rounded-lg p-4`}>
            <h3 className={`text-lg font-bold ${text} mb-4`}>Agregar Nuevo Material</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Tipo de Material
                  </label>
                  <select
                    value={nuevoMaterial.tipo}
                    onChange={(e) => setNuevoMaterial({
                      ...nuevoMaterial,
                      tipo: e.target.value as any,
                      archivo: null,
                      url: ''
                    })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  >
                    <option value="pdf">📄 PDF</option>
                    <option value="video">🎥 Video</option>
                    <option value="documento">📝 Documento</option>
                    <option value="imagen">🖼️ Imagen</option>
                    <option value="enlace">🔗 Enlace Web</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Nombre del Material
                  </label>
                  <input
                    type="text"
                    value={nuevoMaterial.nombre}
                    onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, nombre: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="Ej: Presentación Tema 1"
                  />
                </div>
              </div>

              {nuevoMaterial.tipo === 'enlace' ? (
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    URL del Enlace
                  </label>
                  <input
                    type="url"
                    value={nuevoMaterial.url}
                    onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, url: e.target.value })}
                    className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="https://..."
                  />
                </div>
              ) : (
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>
                    Seleccionar Archivo
                  </label>
                  <div className="flex items-center gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${border} rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition`}>
                      <Upload size={20} />
                      <span>{nuevoMaterial.archivo ? nuevoMaterial.archivo.name : 'Click para seleccionar archivo'}</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept={
                          nuevoMaterial.tipo === 'pdf' ? '.pdf' :
                          nuevoMaterial.tipo === 'video' ? '.mp4,.avi,.mov,.wmv,.webm' :
                          nuevoMaterial.tipo === 'imagen' ? '.jpg,.jpeg,.png,.gif,.svg' :
                          '.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx'
                        }
                      />
                    </label>
                    <button
                      onClick={handleAgregarMaterial}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg whitespace-nowrap"
                    >
                      Agregar
                    </button>
                  </div>
                  {nuevoMaterial.archivo && (
                    <p className="text-sm text-gray-500 mt-2">
                      Tamaño: {(nuevoMaterial.archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Lista de materiales */}
          <section>
            <h3 className={`text-lg font-bold ${text} mb-4`}>
              Materiales del Tema ({materiales.length})
            </h3>

            {materiales.length === 0 ? (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-8 text-center`}>
                <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500">No hay materiales agregados</p>
                <p className="text-sm text-gray-400 mt-1">Agrega archivos, videos o enlaces para este tema</p>
              </div>
            ) : (
              <div className="space-y-2">
                {materiales.map((material) => (
                  <div
                    key={material.id}
                    className={`flex items-center justify-between p-4 border ${border} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getIconoTipo(material.tipo)}
                      <div className="flex-1">
                        <p className={`font-medium ${text}`}>{material.nombre}</p>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          <span className="capitalize">{material.tipo}</span>
                          {material.tamaño && <span>• {material.tamaño}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {material.tipo !== 'enlace' && (
                        <>
                          <button
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="Vista previa"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="Descargar"
                          >
                            <Download size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEliminarMaterial(material.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="sticky bottom-0 bg-inherit border-t ${border} p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Guardar Materiales
          </button>
        </div>
      </div>
    </div>
  );
};
