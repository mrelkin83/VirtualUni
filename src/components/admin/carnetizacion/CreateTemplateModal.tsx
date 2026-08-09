import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Palette, Layout, Settings } from 'lucide-react';
import { cardTemplatesApi, CreateCardTemplateDto } from '../../../api/endpoints/card-templates';

interface CreateTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
  templateToEdit?: any;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  onClose,
  onSuccess,
  templateToEdit,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Basic Info
  const [nombre, setNombre] = useState(templateToEdit?.nombre || '');
  const [descripcion, setDescripcion] = useState(templateToEdit?.descripcion || '');
  const [tiposUsuario, setTiposUsuario] = useState<string[]>(templateToEdit?.tiposUsuario || ['ESTUDIANTE']);

  // Dimensions
  const [orientacion, setOrientacion] = useState(templateToEdit?.orientacion || 'horizontal');
  const [ancho, setAncho] = useState(templateToEdit?.ancho || 85.6);
  const [alto, setAlto] = useState(templateToEdit?.alto || 53.98);

  // Design
  const [colorPrimario, setColorPrimario] = useState(templateToEdit?.colorPrimario || '#1E40AF');
  const [colorSecundario, setColorSecundario] = useState(templateToEdit?.colorSecundario || '#3B82F6');
  const [colorTexto, setColorTexto] = useState(templateToEdit?.colorTexto || '#FFFFFF');
  const [fuentePrincipal, setFuentePrincipal] = useState(templateToEdit?.fuentePrincipal || 'Arial');
  const [fuenteSecundaria, setFuenteSecundaria] = useState(templateToEdit?.fuenteSecundaria || 'Arial');

  // Assets
  const [logoUrl, setLogoUrl] = useState(templateToEdit?.logoUrl || '');
  const [fondoFrontalUrl, setFondoFrontalUrl] = useState(templateToEdit?.fondoFrontalUrl || '');
  const [fondoPosteriorUrl, setFondoPosteriorUrl] = useState(templateToEdit?.fondoPosteriorUrl || '');

  // Options
  const [esActiva, setEsActiva] = useState(templateToEdit?.esActiva ?? true);
  const [esPredeterminada, setEsPredeterminada] = useState(templateToEdit?.esPredeterminada ?? false);
  const [incluirQR, setIncluirQR] = useState(templateToEdit?.incluirQR ?? true);
  const [incluirCodigoBarras, setIncluirCodigoBarras] = useState(templateToEdit?.incluirCodigoBarras ?? true);
  const [doblesCara, setDoblesCara] = useState(templateToEdit?.doblesCara ?? true);

  const handleTipoUsuarioToggle = (tipo: string) => {
    if (tiposUsuario.includes(tipo)) {
      setTiposUsuario(tiposUsuario.filter((t) => t !== tipo));
    } else {
      setTiposUsuario([...tiposUsuario, tipo]);
    }
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre de la plantilla es requerido');
      return;
    }

    if (tiposUsuario.length === 0) {
      setError('Debes seleccionar al menos un tipo de usuario');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Layout config básico
      const layoutConfig = {
        frontal: {
          elementos: [
            { tipo: 'logo', x: 10, y: 10, ancho: 30, alto: 30 },
            { tipo: 'foto', x: 10, y: 45, ancho: 25, alto: 30 },
            { tipo: 'nombre', x: 40, y: 45, fuente: fuentePrincipal, tamano: 14, color: colorTexto },
            { tipo: 'identificacion', x: 40, y: 60, fuente: fuenteSecundaria, tamano: 12, color: colorTexto },
            { tipo: 'tipoUsuario', x: 40, y: 70, fuente: fuenteSecundaria, tamano: 10, color: colorTexto },
          ],
        },
        posterior: doblesCara
          ? {
              elementos: [
                { tipo: 'qr', x: 60, y: 20, ancho: 25, alto: 25 },
                { tipo: 'codigoBarras', x: 10, y: 70, ancho: 65, alto: 15 },
                { tipo: 'texto', contenido: 'Válido hasta: {fechaExpiracion}', x: 10, y: 50 },
              ],
            }
          : null,
      };

      // Campos que se mostrarán en el carnet
      const campos = {
        nombre: { visible: true, etiqueta: 'Nombre' },
        identificacion: { visible: true, etiqueta: 'ID' },
        tipoUsuario: { visible: true, etiqueta: 'Tipo' },
        foto: { visible: true, tamano: 'mediano' },
        qr: { visible: incluirQR, contenido: 'numeroCarnet' },
        codigoBarras: { visible: incluirCodigoBarras, formato: 'CODE128' },
      };

      const data: CreateCardTemplateDto = {
        nombre,
        descripcion: descripcion || undefined,
        tiposUsuario,
        layoutConfig,
        campos,
        ancho,
        alto,
        orientacion,
        colorPrimario,
        colorSecundario,
        colorTexto,
        fuentePrincipal,
        fuenteSecundaria,
        logoUrl: logoUrl || undefined,
        fondoFrontalUrl: fondoFrontalUrl || undefined,
        fondoPosteriorUrl: fondoPosteriorUrl || undefined,
        esActiva,
        esPredeterminada,
        incluirQR,
        incluirCodigoBarras,
        doblesCara,
      };

      if (templateToEdit) {
        await cardTemplatesApi.update(templateToEdit.id, data);
      } else {
        await cardTemplatesApi.create(data);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const STANDARD_SIZES = {
    cr80: { name: 'CR80 (Estándar)', ancho: 85.6, alto: 53.98 },
    cr79: { name: 'CR79', ancho: 79.0, alto: 50.0 },
    custom: { name: 'Personalizado', ancho: 0, alto: 0 },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {templateToEdit ? 'Editar Plantilla' : 'Nueva Plantilla de Carnet'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>¡Plantilla guardada exitosamente!</span>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-medium">Información</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <Layout className="w-4 h-4" />
              </div>
              <span className="font-medium">Dimensiones</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <Palette className="w-4 h-4" />
              </div>
              <span className="font-medium">Diseño</span>
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carnet Estudiantil 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe esta plantilla..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipos de Usuario *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['ESTUDIANTE', 'DOCENTE', 'EMPLEADO', 'FUNCIONARIO'].map((tipo) => (
                    <label
                      key={tipo}
                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                        tiposUsuario.includes(tipo)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={tiposUsuario.includes(tipo)}
                        onChange={() => handleTipoUsuarioToggle(tipo)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={esActiva}
                    onChange={(e) => setEsActiva(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Plantilla activa</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={esPredeterminada}
                    onChange={(e) => setEsPredeterminada(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Plantilla predeterminada</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Dimensions */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orientación</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition ${
                      orientacion === 'horizontal'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orientacion"
                      value="horizontal"
                      checked={orientacion === 'horizontal'}
                      onChange={(e) => setOrientacion(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Horizontal (Paisaje)</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition ${
                      orientacion === 'vertical'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orientacion"
                      value="vertical"
                      checked={orientacion === 'vertical'}
                      onChange={(e) => setOrientacion(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Vertical (Retrato)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño Estándar
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(STANDARD_SIZES).map(([key, size]) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key !== 'custom') {
                          setAncho(size.ancho);
                          setAlto(size.alto);
                        }
                      }}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      <div className="font-medium">{size.name}</div>
                      {key !== 'custom' && (
                        <div className="text-xs text-gray-600 mt-1">
                          {size.ancho} x {size.alto} mm
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ancho (mm)
                  </label>
                  <input
                    type="number"
                    value={ancho}
                    onChange={(e) => setAncho(Number(e.target.value))}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alto (mm)</label>
                  <input
                    type="number"
                    value={alto}
                    onChange={(e) => setAlto(Number(e.target.value))}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={doblesCara}
                    onChange={(e) => setDoblesCara(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Doble cara</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={incluirQR}
                    onChange={(e) => setIncluirQR(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Incluir QR</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={incluirCodigoBarras}
                    onChange={(e) => setIncluirCodigoBarras(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Código de barras</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Design */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Colores</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Primario
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colorPrimario}
                        onChange={(e) => setColorPrimario(e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={colorPrimario}
                        onChange={(e) => setColorPrimario(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Secundario
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colorSecundario}
                        onChange={(e) => setColorSecundario(e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={colorSecundario}
                        onChange={(e) => setColorSecundario(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color de Texto
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colorTexto}
                        onChange={(e) => setColorTexto(e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={colorTexto}
                        onChange={(e) => setColorTexto(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Fuentes</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuente Principal
                    </label>
                    <select
                      value={fuentePrincipal}
                      onChange={(e) => setFuentePrincipal(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuente Secundaria
                    </label>
                    <select
                      value={fuenteSecundaria}
                      onChange={(e) => setFuenteSecundaria(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recursos (URLs)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del Logo
                    </label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/logo.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Fondo Frontal
                    </label>
                    <input
                      type="text"
                      value={fondoFrontalUrl}
                      onChange={(e) => setFondoFrontalUrl(e.target.value)}
                      placeholder="https://ejemplo.com/fondo-frontal.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {doblesCara && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Fondo Posterior
                      </label>
                      <input
                        type="text"
                        value={fondoPosteriorUrl}
                        onChange={(e) => setFondoPosteriorUrl(e.target.value)}
                        placeholder="https://ejemplo.com/fondo-posterior.png"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Vista Previa</h4>
                <div
                  className="mx-auto rounded-lg overflow-hidden shadow-lg"
                  style={{
                    width: orientacion === 'horizontal' ? '320px' : '200px',
                    height: orientacion === 'horizontal' ? '200px' : '320px',
                    background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`,
                  }}
                >
                  <div className="p-4 h-full flex flex-col justify-between" style={{ color: colorTexto }}>
                    <div style={{ fontFamily: fuentePrincipal }} className="text-sm font-bold">
                      {nombre || 'Nombre de Plantilla'}
                    </div>
                    <div className="space-y-1">
                      <div style={{ fontFamily: fuentePrincipal }} className="font-bold">
                        Nombre del Usuario
                      </div>
                      <div style={{ fontFamily: fuenteSecundaria }} className="text-xs">
                        ID: 123456789
                      </div>
                      <div style={{ fontFamily: fuenteSecundaria }} className="text-xs">
                        {tiposUsuario[0] || 'TIPO'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition disabled:opacity-50"
          >
            Cancelar
          </button>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Anterior
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!nombre.trim() || tiposUsuario.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !nombre.trim() || tiposUsuario.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {templateToEdit ? 'Actualizar' : 'Crear'} Plantilla
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
