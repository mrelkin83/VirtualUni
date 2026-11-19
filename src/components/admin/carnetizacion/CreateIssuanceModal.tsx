import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { cardIssuancesApi, CreateCardIssuanceDto, UserDataDto } from '../../../api/endpoints/card-issuances';
import { cardTemplatesApi, CardTemplate } from '../../../api/endpoints/card-templates';
import { useModalA11y } from '../../../hooks/useModalA11y';
import { comoArreglo } from '../../../utils/respuestaApi';

/** Busca una columna por varios nombres posibles (sin distinguir mayúsculas/acentos). */
function columnaFila(fila: Record<string, unknown>, ...alias: string[]): string {
  for (const key of Object.keys(fila)) {
    if (alias.includes(key.trim().toLowerCase())) {
      return String(fila[key] ?? '').trim();
    }
  }
  return '';
}

interface CreateIssuanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateIssuanceModal: React.FC<CreateIssuanceModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importInfo, setImportInfo] = useState<string | null>(null);

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

  // El padre monta/desmonta este modal condicionalmente (no recibe `isOpen`):
  // mientras está montado, siempre está "abierto".
  const dialogRef = useModalA11y(true, onClose);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await cardTemplatesApi.getAll({ esActiva: true });
      // El backend pagina (`{ data: [...], meta }`), no devuelve un array
      // plano: ver el mismo problema en ExpedicionesTab.tsx.
      setTemplates(comoArreglo(response));
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
    event.target.value = ''; // permite volver a elegir el mismo archivo si se corrige
    if (!file) return;

    setError(null);
    setImportInfo(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: '' });

      const nuevos: UserDataDto[] = [];
      let omitidas = 0;

      for (const fila of filas) {
        const usuarioId = columnaFila(fila, 'usuarioid', 'usuario_id', 'id');
        const nombre = columnaFila(fila, 'nombre', 'name');
        const identificacion = columnaFila(fila, 'identificacion', 'identificación', 'cedula', 'cédula', 'documento');
        const tipoUsuario = columnaFila(fila, 'tipousuario', 'tipo_usuario', 'tipo') || 'ESTUDIANTE';
        const fotoUrl = columnaFila(fila, 'fotourl', 'foto_url', 'foto');

        if (!usuarioId || !nombre || !identificacion) {
          omitidas++;
          continue;
        }

        nuevos.push({ usuarioId, nombre, identificacion, tipoUsuario: tipoUsuario.toUpperCase(), fotoUrl });
      }

      if (nuevos.length === 0) {
        setError(
          'No se encontraron filas válidas en el archivo. Se esperan columnas usuarioId, nombre e identificacion (tipoUsuario y fotoUrl son opcionales).',
        );
        return;
      }

      setUsuarios((prev) => [...prev, ...nuevos]);
      setImportInfo(
        omitidas > 0
          ? `Se importaron ${nuevos.length} usuario(s). Se omitieron ${omitidas} fila(s) por falta de usuarioId, nombre o identificación.`
          : `Se importaron ${nuevos.length} usuario(s) correctamente.`,
      );
    } catch (err: any) {
      setError('No se pudo leer el archivo: ' + (err?.message || 'formato no soportado'));
    }
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
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-nueva-expedicion"
        tabIndex={-1}
        className="bg-pn-surface rounded-lg shadow-xl max-w-4xl w-full my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pn-line">
          <h3 id="titulo-nueva-expedicion" className="text-2xl font-bold text-pn-ink">Nueva Expedición de Carnets</h3>
          <button
            onClick={onClose}
            className="text-pn-muted hover:text-pn-ink-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-pn-danger-soft border border-pn-danger rounded-lg text-pn-danger">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-pn-ok-soft border border-pn-ok rounded-lg text-pn-ok">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>¡Expedición creada exitosamente!</span>
            </div>
          )}

          {/* Import Info Message */}
          {importInfo && !success && (
            <div className="flex items-center gap-3 p-4 bg-pn-ok-soft border border-pn-ok rounded-lg text-pn-ok">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{importInfo}</span>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-pn-accent-text' : 'text-pn-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-pn-accent-line bg-pn-accent-soft' : 'border-pn-line'}`}>
                1
              </div>
              <span className="font-medium">Configuración</span>
            </div>
            <div className="w-12 h-0.5 bg-pn-surface-3"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-pn-accent-text' : 'text-pn-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-pn-accent-line bg-pn-accent-soft' : 'border-pn-line'}`}>
                2
              </div>
              <span className="font-medium">Usuarios</span>
            </div>
            <div className="w-12 h-0.5 bg-pn-surface-3"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-pn-accent-text' : 'text-pn-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-pn-accent-line bg-pn-accent-soft' : 'border-pn-line'}`}>
                3
              </div>
              <span className="font-medium">Revisión</span>
            </div>
          </div>

          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-2">
                  Tipo de Expedición *
                </label>
                <select
                  value={tipoExpedicion}
                  onChange={(e) => setTipoExpedicion(e.target.value as any)}
                  className="w-full px-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
                >
                  <option value="NUEVA_EMISION">Nueva Emisión</option>
                  <option value="RENOVACION">Renovación</option>
                  <option value="REEMPLAZO">Reemplazo</option>
                  <option value="MASIVA">Masiva</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-2">
                  Plantilla (Opcional)
                </label>
                {loadingTemplates ? (
                  <div className="text-pn-muted">Cargando plantillas...</div>
                ) : (
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full px-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
                  >
                    <option value="">Usar plantilla predeterminada</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.nombre} - {template.tiposUsuario.join(', ')}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-pn-muted mt-1">
                  Si no seleccionas una plantilla, se usará la predeterminada para cada tipo de usuario
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-2">
                  Motivo
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Inicio de semestre 2024-1"
                  className="w-full px-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pn-ink-2 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales sobre esta expedición..."
                  rows={3}
                  className="w-full px-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Users */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Upload CSV */}
              <div className="border-2 border-dashed border-pn-line rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-pn-muted mx-auto mb-3" />
                <h4 className="font-semibold text-pn-ink mb-2">Cargar desde archivo</h4>
                <p className="text-sm text-pn-ink-2 mb-4">
                  Sube un archivo CSV o Excel con los datos de los usuarios
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-pn-accent-soft text-pn-accent-text rounded-lg hover:bg-pn-accent-soft cursor-pointer transition">
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
                  <div className="w-full border-t border-pn-line"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-pn-surface text-pn-muted">O agregar manualmente</span>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="bg-pn-surface-2 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-pn-ink flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Agregar Usuario
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ID de Usuario *"
                    value={manualUser.usuarioId}
                    onChange={(e) => setManualUser({ ...manualUser, usuarioId: e.target.value })}
                    className="px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                  <input
                    type="text"
                    placeholder="Nombre Completo *"
                    value={manualUser.nombre}
                    onChange={(e) => setManualUser({ ...manualUser, nombre: e.target.value })}
                    className="px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                  <input
                    type="text"
                    placeholder="Identificación *"
                    value={manualUser.identificacion}
                    onChange={(e) => setManualUser({ ...manualUser, identificacion: e.target.value })}
                    className="px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                  <select
                    value={manualUser.tipoUsuario}
                    onChange={(e) => setManualUser({ ...manualUser, tipoUsuario: e.target.value })}
                    className="px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
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
                    className="col-span-2 px-3 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
                  />
                </div>

                <button
                  onClick={handleAddManualUser}
                  className="w-full px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
                >
                  Agregar Usuario
                </button>
              </div>

              {/* Users List */}
              {usuarios.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-pn-ink">
                    Usuarios agregados ({usuarios.length})
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {usuarios.map((usuario, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-pn-surface border border-pn-line rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-pn-ink">{usuario.nombre}</div>
                          <div className="text-sm text-pn-ink-2">
                            {usuario.identificacion} - {usuario.tipoUsuario}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(index)}
                          className="text-pn-danger hover:text-pn-danger transition"
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
              <div className="bg-pn-accent-soft border border-pn-accent-line rounded-lg p-4">
                <h4 className="font-semibold text-pn-accent-text mb-3">Resumen de la Expedición</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-pn-accent-text">Tipo:</span>
                    <span className="font-medium text-pn-accent-text">
                      {tipoExpedicion === 'NUEVA_EMISION' && 'Nueva Emisión'}
                      {tipoExpedicion === 'RENOVACION' && 'Renovación'}
                      {tipoExpedicion === 'REEMPLAZO' && 'Reemplazo'}
                      {tipoExpedicion === 'MASIVA' && 'Masiva'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pn-accent-text">Plantilla:</span>
                    <span className="font-medium text-pn-accent-text">
                      {templateId
                        ? templates.find((t) => t.id === templateId)?.nombre
                        : 'Predeterminada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pn-accent-text">Total de usuarios:</span>
                    <span className="font-medium text-pn-accent-text">{usuarios.length}</span>
                  </div>
                  {motivo && (
                    <div className="flex justify-between">
                      <span className="text-pn-accent-text">Motivo:</span>
                      <span className="font-medium text-pn-accent-text">{motivo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-pn-warn-soft border border-pn-warn rounded-lg p-4">
                <p className="text-sm text-pn-warn">
                  <strong>Nota:</strong> Una vez creada, la expedición comenzará a procesarse
                  automáticamente. Podrás ver el progreso en la lista de expediciones.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-pn-line bg-pn-surface-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-pn-ink-2 hover:text-pn-ink transition disabled:opacity-50"
          >
            Cancelar
          </button>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-4 py-2 border border-pn-line text-pn-ink-2 rounded-lg hover:bg-pn-surface-2 transition disabled:opacity-50"
              >
                Anterior
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 2 && usuarios.length === 0}
                className="px-6 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || usuarios.length === 0}
                className="px-6 py-2 bg-pn-ok text-pn-surface rounded-lg hover:bg-pn-ok transition disabled:opacity-50 flex items-center gap-2"
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
