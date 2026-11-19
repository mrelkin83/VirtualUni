import React, { useState, useRef } from 'react';
import { User, Save, X, Camera, Upload } from 'lucide-react';
import { StudentProfile } from '../../../types/student.types';
import { avisar } from '../../ui';

interface PerfilSectionProps {
  datosPerfil: StudentProfile;
  editandoPerfil: boolean;
  fotoPerfil: string | null;
  setDatosPerfil: (datos: StudentProfile) => void;
  setEditandoPerfil: (editando: boolean) => void;
  actualizarPerfil: () => void;
  subirFotoPerfil: (archivo: File) => void;
}

export const PerfilSection: React.FC<PerfilSectionProps> = ({
  datosPerfil,
  editandoPerfil,
  fotoPerfil,
  setDatosPerfil,
  setEditandoPerfil,
  actualizarPerfil,
  subirFotoPerfil
}) => {
  const [previewFoto, setPreviewFoto] = useState<string | null>(fotoPerfil);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof StudentProfile, value: string) => {
    setDatosPerfil({ ...datosPerfil, [field]: value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      avisar.error('Solo se permiten archivos JPG y PNG');
      return;
    }

    // Validar tamaño (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      avisar.info('El archivo no debe superar los 2MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewFoto(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir foto (simulación de redimensionamiento a 300x300 se hará en el hook)
    subirFotoPerfil(file);
  };

  const inputClass = `w-full p-2 border border-pn-line rounded bg-pn-surface text-pn-ink`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Mi Perfil</h2>
        <div className="text-sm text-pn-muted">Última actualización: 12/07/2025</div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Foto de Perfil */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold text-pn-ink mb-6`}>Foto de Perfil</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar actual */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pn-line bg-gradient-to-br from-pn-accent to-pn-accent-hover">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-pn-accent-ink">
                    <User size={64} />
                  </div>
                )}
              </div>
              {/* Botón de cámara superpuesto */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink p-3 rounded-full shadow-lg transition"
                title="Cambiar foto"
              >
                <Camera size={20} />
              </button>
            </div>

            {/* Información y controles */}
            <div className="flex-1">
              <h4 className={`font-semibold text-pn-ink mb-2`}>Actualizar foto de perfil</h4>
              <p className="text-sm text-pn-muted mb-4">
                Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB.
                La imagen se redimensionará automáticamente a 300x300 píxeles.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-6 py-3 rounded-lg transition font-semibold flex items-center gap-2"
              >
                <Upload size={20} />
                Seleccionar Archivo
              </button>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h3 className={`text-xl font-bold text-pn-ink`}>Información Personal</h3>
            {!editandoPerfil && (
              <button
                onClick={() => setEditandoPerfil(true)}
                className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2"
              >
                <User size={18} />
                Editar Perfil
              </button>
            )}
          </div>

          {editandoPerfil ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Primer nombre *</label>
                <input
                  type="text"
                  value={datosPerfil.primerNombre}
                  onChange={(e) => handleInputChange('primerNombre', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Segundo nombre</label>
                <input
                  type="text"
                  value={datosPerfil.segundoNombre}
                  onChange={(e) => handleInputChange('segundoNombre', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Primer apellido *</label>
                <input
                  type="text"
                  value={datosPerfil.primerApellido}
                  onChange={(e) => handleInputChange('primerApellido', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Segundo apellido</label>
                <input
                  type="text"
                  value={datosPerfil.segundoApellido}
                  onChange={(e) => handleInputChange('segundoApellido', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Tipo de identificación *</label>
                <select
                  value={datosPerfil.tipoIdentificacion}
                  onChange={(e) => handleInputChange('tipoIdentificacion', e.target.value)}
                  className={inputClass}
                >
                  <option>C.C.</option>
                  <option>T.I.</option>
                  <option>C.E.</option>
                  <option>Pasaporte</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Número de identificación *</label>
                <input
                  type="text"
                  value={datosPerfil.numeroIdentificacion}
                  onChange={(e) => handleInputChange('numeroIdentificacion', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Sexo *</label>
                <select
                  value={datosPerfil.sexo}
                  onChange={(e) => handleInputChange('sexo', e.target.value)}
                  className={inputClass}
                >
                  <option>Masculino</option>
                  <option>Femenino</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Correo electrónico *</label>
                <input
                  type="email"
                  value={datosPerfil.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Teléfono *</label>
                <input
                  type="tel"
                  value={datosPerfil.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Celular *</label>
                <input
                  type="tel"
                  value={datosPerfil.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Fecha de nacimiento *</label>
                <input
                  type="date"
                  value={datosPerfil.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Lugar de nacimiento</label>
                <input
                  type="text"
                  value={datosPerfil.lugarNacimiento}
                  onChange={(e) => handleInputChange('lugarNacimiento', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Dirección</label>
                <input
                  type="text"
                  value={datosPerfil.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Lugar de residencia</label>
                <input
                  type="text"
                  value={datosPerfil.lugarResidencia}
                  onChange={(e) => handleInputChange('lugarResidencia', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Barrio</label>
                <input
                  type="text"
                  value={datosPerfil.barrio}
                  onChange={(e) => handleInputChange('barrio', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><p className="text-sm text-pn-muted mb-1">Primer nombre *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.primerNombre}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Segundo nombre</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.segundoNombre}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Primer apellido *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.primerApellido}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Segundo apellido</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.segundoApellido}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Tipo de identificación *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.tipoIdentificacion}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Número de identificación *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.numeroIdentificacion}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Sexo *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.sexo}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Correo electrónico *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.email}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Teléfono *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.telefono}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Celular *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.celular}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Fecha de nacimiento *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.fechaNacimiento}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Lugar de nacimiento</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.lugarNacimiento}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Dirección</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.direccion}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Lugar de residencia</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.lugarResidencia}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Barrio</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.barrio}</p></div>
            </div>
          )}
        </div>

        {/* Información Adicional SNIES */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-6 text-pn-ink`}>Información Adicional (SNIES)</h3>

          {editandoPerfil ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Zona</label>
                <select value={datosPerfil.zona} onChange={(e) => handleInputChange('zona', e.target.value)} className={inputClass}>
                  <option>Urbana</option>
                  <option>Rural</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Estrato</label>
                <select value={datosPerfil.estrato} onChange={(e) => handleInputChange('estrato', e.target.value)} className={inputClass}>
                  <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Medio de transporte</label>
                <select value={datosPerfil.medioTransporte} onChange={(e) => handleInputChange('medioTransporte', e.target.value)} className={inputClass}>
                  <option>Seleccione</option>
                  <option>Transporte público</option>
                  <option>Vehículo particular</option>
                  <option>Bicicleta</option>
                  <option>A pie</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Grupo Sisbén</label>
                <select value={datosPerfil.grupoSisben} onChange={(e) => handleInputChange('grupoSisben', e.target.value)} className={inputClass}>
                  <option>Seleccione</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Subgrupo Sisbén</label>
                <select value={datosPerfil.subgrupoSisben} onChange={(e) => handleInputChange('subgrupoSisben', e.target.value)} className={inputClass}>
                  <option>Seleccione</option>
                  <option>A1</option>
                  <option>A2</option>
                  <option>B1</option>
                  <option>B2</option>
                  <option>C1</option>
                  <option>C2</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Fecha de expedición de documento *</label>
                <input
                  type="date"
                  value={datosPerfil.fechaExpedicionDoc}
                  onChange={(e) => handleInputChange('fechaExpedicionDoc', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Expedición documento</label>
                <input
                  type="text"
                  value={datosPerfil.expedicionDocumento}
                  onChange={(e) => handleInputChange('expedicionDocumento', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Tipo de sangre</label>
                <select value={datosPerfil.tipoSangre} onChange={(e) => handleInputChange('tipoSangre', e.target.value)} className={inputClass}>
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Estado civil</label>
                <select value={datosPerfil.estadoCivil} onChange={(e) => handleInputChange('estadoCivil', e.target.value)} className={inputClass}>
                  <option>Unión libre</option>
                  <option>Soltero(a)</option>
                  <option>Casado(a)</option>
                  <option>Divorciado(a)</option>
                  <option>Viudo(a)</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Número de hijos</label>
                <input
                  type="number"
                  value={datosPerfil.numeroHijos}
                  onChange={(e) => handleInputChange('numeroHijos', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>EPS</label>
                <select value={datosPerfil.eps} onChange={(e) => handleInputChange('eps', e.target.value)} className={inputClass}>
                  <option>36) Sanitas EPS</option>
                  <option>Sura</option>
                  <option>Compensar</option>
                  <option>Salud Total</option>
                  <option>Nueva EPS</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>ARS</label>
                <select value={datosPerfil.ars} onChange={(e) => handleInputChange('ars', e.target.value)} className={inputClass}>
                  <option>Seleccione</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Aseguradora</label>
                <select value={datosPerfil.aseguradora} onChange={(e) => handleInputChange('aseguradora', e.target.value)} className={inputClass}>
                  <option>Seleccione</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Número libreta militar</label>
                <input
                  type="text"
                  value={datosPerfil.numeroLibretaMilitar}
                  onChange={(e) => handleInputChange('numeroLibretaMilitar', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Nivel de formación</label>
                <select value={datosPerfil.nivelFormacion} onChange={(e) => handleInputChange('nivelFormacion', e.target.value)} className={inputClass}>
                  <option>Seleccione</option>
                  <option>Pregrado</option>
                  <option>Posgrado</option>
                  <option>Maestría</option>
                  <option>Doctorado</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Ocupación</label>
                <select value={datosPerfil.ocupacion} onChange={(e) => handleInputChange('ocupacion', e.target.value)} className={inputClass}>
                  <option>Seleccione</option>
                  <option>Estudiante</option>
                  <option>Empleado</option>
                  <option>Independiente</option>
                  <option>Desempleado</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Discapacidad</label>
                <select value={datosPerfil.discapacidad} onChange={(e) => handleInputChange('discapacidad', e.target.value)} className={inputClass}>
                  <option>No Aplica</option>
                  <option>Visual</option>
                  <option>Auditiva</option>
                  <option>Motriz</option>
                  <option>Cognitiva</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Capacidad excepcional</label>
                <select value={datosPerfil.capacidadExcepcional} onChange={(e) => handleInputChange('capacidadExcepcional', e.target.value)} className={inputClass}>
                  <option>No aplica</option>
                  <option>Sí aplica</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Grupo étnico</label>
                <select value={datosPerfil.grupoEtnico} onChange={(e) => handleInputChange('grupoEtnico', e.target.value)} className={inputClass}>
                  <option>No Informa</option>
                  <option>Indígena</option>
                  <option>Afrodescendiente</option>
                  <option>Raizal</option>
                  <option>ROM</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Pueblo indígena</label>
                <select value={datosPerfil.puebloIndigena} onChange={(e) => handleInputChange('puebloIndigena', e.target.value)} className={inputClass}>
                  <option>No informa</option>
                  <option>Wayúu</option>
                  <option>Emberá</option>
                  <option>Nasa</option>
                  <option>Zenú</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Comunidad negra</label>
                <select value={datosPerfil.comunidadNegra} onChange={(e) => handleInputChange('comunidadNegra', e.target.value)} className={inputClass}>
                  <option>No Aplica</option>
                  <option>Sí Aplica</option>
                </select>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Código PRUEBA SABER 11</label>
                <input
                  type="text"
                  value={datosPerfil.codigoPruebaSaber}
                  onChange={(e) => handleInputChange('codigoPruebaSaber', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold text-pn-ink`}>Colegio</label>
                <input
                  type="text"
                  value={datosPerfil.colegio}
                  onChange={(e) => handleInputChange('colegio', e.target.value)}
                  placeholder="Seleccione colegio"
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><p className="text-sm text-pn-muted mb-1">Zona</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.zona}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Estrato</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.estrato}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Medio de transporte</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.medioTransporte}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Grupo Sisbén</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.grupoSisben}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Subgrupo Sisbén</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.subgrupoSisben}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Fecha de expedición de documento *</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.fechaExpedicionDoc}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Expedición documento</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.expedicionDocumento}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Tipo de sangre</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.tipoSangre}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Estado civil</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.estadoCivil}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Número de hijos</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.numeroHijos}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">EPS</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.eps}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">ARS</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.ars}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Aseguradora</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.aseguradora}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Número libreta militar</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.numeroLibretaMilitar || 'N/A'}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Nivel de formación</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.nivelFormacion}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Ocupación</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.ocupacion}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Discapacidad</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.discapacidad}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Capacidad excepcional</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.capacidadExcepcional}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Grupo étnico</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.grupoEtnico}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Pueblo indígena</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.puebloIndigena}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Comunidad negra</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.comunidadNegra}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Código PRUEBA SABER 11</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.codigoPruebaSaber}</p></div>
              <div><p className="text-sm text-pn-muted mb-1">Colegio</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.colegio || 'No especificado'}</p></div>
            </div>
          )}
        </div>

        {/* Información Académica */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-6 text-pn-ink`}>Información Académica</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><p className="text-sm text-pn-muted mb-1">Programa</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.programa}</p></div>
            <div><p className="text-sm text-pn-muted mb-1">Semestre</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.semestre}</p></div>
            <div><p className="text-sm text-pn-muted mb-1">Código estudiante</p><p className={`font-semibold text-pn-ink`}>{datosPerfil.codigo}</p></div>
          </div>
        </div>

        {/* Action Buttons */}
        {editandoPerfil && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={actualizarPerfil}
              className="flex-1 bg-pn-accent text-pn-accent-ink py-3 rounded hover:bg-pn-accent-hover font-semibold flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Guardar Cambios
            </button>
            <button
              onClick={() => setEditandoPerfil(false)}
              className={`flex-1 border border-pn-line py-3 rounded hover:bg-pn-surface-2 hover:bg-pn-surface-2 font-semibold flex items-center justify-center gap-2`}
            >
              <X size={20} />
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
