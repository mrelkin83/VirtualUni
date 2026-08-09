import React, { useState, useEffect } from 'react';
import { X, Upload, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { cardIssuancesApi, CreateCardIssuanceDto, UserDataDto } from '../../../api/endpoints/card-issuances';
import { cardTemplatesApi, CardTemplate } from '../../../api/endpoints/card-templates';

interface CreateIssuanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateIssuanceModal: React.FC<CreateIssuanceModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [templateId, setTemplateId] = useState<string>('');
  const [tipoExpedicion, setTipoExpedicion] = useState<'NUEVA_EMISION' | 'RENOVACION' | 'REEMPLAZO' | 'MASIVA'>('NUEVA_EMISION');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [usuarios, setUsuarios] = useState<UserDataDto[]>([]);

  // Templates list
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Manual user entry
  const [manualUser, setManualUser] = useState<Partial<UserDataDto>>({
    usuarioId: '',
    nombre: '',
    identificacion: '',
    tipoUsuario: 'ESTUDIANTE',
    fotoUrl: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await cardTemplatesApi.getAll({ esActiva: true });
      setTemplates((response as any).data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleAddManualUser = () => {
    if (!manualUser.usuarioId || !manualUser.nombre || !manualUser.identificacion) {
      setError('Por favor completa todos los campos requeridos del usuario');
      return;
    }

    setUsuarios([...usuarios, manualUser as UserDataDto]);
    setManualUser({
      usuarioId: '',
      nombre: '',
      identificacion: '',
      tipoUsuario: 'ESTUDIANTE',
      fotoUrl: '',
    });
    setError(null);
  };

  const handleRemoveUser = (index: number) => {
    setUsuarios(usuarios.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: Implement CSV/Excel parsing
    setError('La carga de archivos CSV/Excel estará disponible próximamente. Por ahora usa la entrada manual.');
  };

  const handleSubmit = async () => {
    if (usuarios.length === 0) {
      setError('Debes agregar al menos un usuario');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: CreateCardIssuanceDto = {
        templateId: templateId || undefined,
        tipoExpedicion,
        usuarios,
        motivo: motivo || undefined,
        observaciones: observaciones || undefined,
      };

      await cardIssuancesApi.create(data);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al crear la expedición');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Nueva Expedición de Carnets</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>¡Expedición creada exitosamente!</span>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                1
              </div>
              <span className="font-medium">Configuración</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                2
              </div>
              <span className="font-medium">Usuarios</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                3
              </div>
              <span className="font-medium">Revisión</span>
            </div>
          </div>

          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Expedición *
                </label>
                <select
                  value={tipoExpedicion}
                  onChange={(e) => setTipoExpedicion(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="NUEVA_EMISION">Nueva Emisión</option>
                  <option value="RENOVACION">Renovación</option>
                  <option value="REEMPLAZO">Reemplazo</option>
                  <option value="MASIVA">Masiva</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plantilla (Opcional)
                </label>
                {loadingTemplates ? (
                  <div className="text-gray-500">Cargando plantillas...</div>
                ) : (
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Usar plantilla predeterminada</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.nombre} - {template.tiposUsuario.join(', ')}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Si no seleccionas una plantilla, se usará la predeterminada para cada tipo de usuario
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Inicio de semestre 2024-1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales sobre esta expedición..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Users */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Upload CSV */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Cargar desde archivo</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Sube un archivo CSV o Excel con los datos de los usuarios
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer transition">
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar archivo
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">O agregar manualmente</span>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Agregar Usuario
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ID de Usuario *"
                    value={manualUser.usuarioId}
                    onChange={(e) => setManualUser({ ...manualUser, usuarioId: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Nombre Completo *"
                    value={manualUser.nombre}
                    onChange={(e) => setManualUser({ ...manualUser, nombre: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Identificación *"
                    value={manualUser.identificacion}
                    onChange={(e) => setManualUser({ ...manualUser, identificacion: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={manualUser.tipoUsuario}
                    onChange={(e) => setManualUser({ ...manualUser, tipoUsuario: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ESTUDIANTE">Estudiante</option>
                    <option value="DOCENTE">Docente</option>
                    <option value="EMPLEADO">Empleado</option>
                    <option value="FUNCIONARIO">Funcionario</option>
                  </select>
                  <input
                    type="text"
                    placeholder="URL de Foto (opcional)"
                    value={manualUser.fotoUrl}
                    onChange={(e) => setManualUser({ ...manualUser, fotoUrl: e.target.value })}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleAddManualUser}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Agregar Usuario
                </button>
              </div>

              {/* Users List */}
              {usuarios.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">
                    Usuarios agregados ({usuarios.length})
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {usuarios.map((usuario, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{usuario.nombre}</div>
                          <div className="text-sm text-gray-600">
                            {usuario.identificacion} - {usuario.tipoUsuario}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(index)}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Resumen de la Expedición</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Tipo:</span>
                    <span className="font-medium text-blue-900">
                      {tipoExpedicion === 'NUEVA_EMISION' && 'Nueva Emisión'}
                      {tipoExpedicion === 'RENOVACION' && 'Renovación'}
                      {tipoExpedicion === 'REEMPLAZO' && 'Reemplazo'}
                      {tipoExpedicion === 'MASIVA' && 'Masiva'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Plantilla:</span>
                    <span className="font-medium text-blue-900">
                      {templateId
                        ? templates.find((t) => t.id === templateId)?.nombre
                        : 'Predeterminada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total de usuarios:</span>
                    <span className="font-medium text-blue-900">{usuarios.length}</span>
                  </div>
                  {motivo && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Motivo:</span>
                      <span className="font-medium text-blue-900">{motivo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Una vez creada, la expedición comenzará a procesarse
                  automáticamente. Podrás ver el progreso en la lista de expediciones.
                </p>
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
                disabled={step === 2 && usuarios.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || usuarios.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Crear Expedición
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
