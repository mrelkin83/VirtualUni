import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Upload, Save, Eye, EyeOff } from 'lucide-react';

interface ConfiguracionSectionProps {
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const ConfiguracionSection: React.FC<ConfiguracionSectionProps> = ({
  darkMode,
  card,
  text,
  border
}) => {
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [perfil, setPerfil] = useState({
    nombre: 'Dr. Carlos Martínez',
    email: 'carlos.martinez@university.edu',
    telefono: '+57 300 123 4567',
    especialidad: 'Ingeniería de Software',
    departamento: 'Ciencias de la Computación',
    oficina: 'Edificio A - Oficina 302',
    horarioAtencion: 'Lunes a Viernes 14:00 - 16:00',
    biografia: 'Doctor en Ciencias de la Computación con más de 10 años de experiencia en docencia universitaria.',
    titulos: 'PhD en Computer Science, MSc en Software Engineering'
  });

  const [seguridad, setSeguridad] = useState({
    passwordActual: '',
    passwordNuevo: '',
    passwordConfirmar: ''
  });

  const [mostrarPassword, setMostrarPassword] = useState({
    actual: false,
    nuevo: false,
    confirmar: false
  });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfil(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarPerfil = () => {
    alert('Perfil actualizado exitosamente');
  };

  const handleCambiarPassword = () => {
    if (seguridad.passwordNuevo !== seguridad.passwordConfirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (seguridad.passwordNuevo.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    alert('Contraseña actualizada exitosamente');
    setSeguridad({ passwordActual: '', passwordNuevo: '', passwordConfirmar: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${text}`}>Configuración de Perfil</h2>
        <p className="text-gray-500 mt-1">Personaliza tu perfil y preferencias</p>
      </div>

      {/* Foto de Perfil */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold ${text} mb-6`}>Foto de Perfil</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            {fotoPerfil ? (
              <img
                src={fotoPerfil}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {perfil.nombre.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <label
              htmlFor="foto-perfil"
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg"
            >
              <Upload size={20} />
              <input
                id="foto-perfil"
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h4 className={`font-semibold ${text} text-lg`}>{perfil.nombre}</h4>
            <p className="text-gray-500">{perfil.especialidad}</p>
            <p className="text-sm text-gray-400 mt-1">{perfil.departamento}</p>
            <button
              onClick={() => setFotoPerfil(null)}
              className="mt-3 text-sm text-red-600 hover:text-red-700"
            >
              Eliminar foto
            </button>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold ${text} mb-6`}>Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${text} mb-2 flex items-center gap-2`}>
              <User size={16} />
              Nombre Completo
            </label>
            <input
              type="text"
              value={perfil.nombre}
              onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2 flex items-center gap-2`}>
              <Mail size={16} />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={perfil.email}
              onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2 flex items-center gap-2`}>
              <Phone size={16} />
              Teléfono
            </label>
            <input
              type="tel"
              value={perfil.telefono}
              onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Especialidad</label>
            <input
              type="text"
              value={perfil.especialidad}
              onChange={(e) => setPerfil({ ...perfil, especialidad: e.target.value })}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Departamento</label>
            <input
              type="text"
              value={perfil.departamento}
              onChange={(e) => setPerfil({ ...perfil, departamento: e.target.value })}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2 flex items-center gap-2`}>
              <MapPin size={16} />
              Oficina
            </label>
            <input
              type="text"
              value={perfil.oficina}
              onChange={(e) => setPerfil({ ...perfil, oficina: e.target.value })}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${text} mb-2 flex items-center gap-2`}>
              <Calendar size={16} />
              Horario de Atención
            </label>
            <input
              type="text"
              value={perfil.horarioAtencion}
              onChange={(e) => setPerfil({ ...perfil, horarioAtencion: e.target.value })}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
              placeholder="Ej: Lunes a Viernes 14:00 - 16:00"
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${text} mb-2`}>Títulos y Formación</label>
            <textarea
              value={perfil.titulos}
              onChange={(e) => setPerfil({ ...perfil, titulos: e.target.value })}
              rows={2}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
              placeholder="Ej: PhD en Computer Science, MSc en Software Engineering"
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${text} mb-2`}>Biografía</label>
            <textarea
              value={perfil.biografia}
              onChange={(e) => setPerfil({ ...perfil, biografia: e.target.value })}
              rows={4}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
              placeholder="Cuéntanos sobre tu experiencia y áreas de interés..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGuardarPerfil}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Seguridad */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold ${text} mb-6`}>Cambiar Contraseña</h3>
        <div className="max-w-md space-y-4">
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Contraseña Actual</label>
            <div className="relative">
              <input
                type={mostrarPassword.actual ? 'text' : 'password'}
                value={seguridad.passwordActual}
                onChange={(e) => setSeguridad({ ...seguridad, passwordActual: e.target.value })}
                className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} pr-10`}
              />
              <button
                onClick={() => setMostrarPassword({ ...mostrarPassword, actual: !mostrarPassword.actual })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {mostrarPassword.actual ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Nueva Contraseña</label>
            <div className="relative">
              <input
                type={mostrarPassword.nuevo ? 'text' : 'password'}
                value={seguridad.passwordNuevo}
                onChange={(e) => setSeguridad({ ...seguridad, passwordNuevo: e.target.value })}
                className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} pr-10`}
              />
              <button
                onClick={() => setMostrarPassword({ ...mostrarPassword, nuevo: !mostrarPassword.nuevo })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {mostrarPassword.nuevo ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Confirmar Nueva Contraseña</label>
            <div className="relative">
              <input
                type={mostrarPassword.confirmar ? 'text' : 'password'}
                value={seguridad.passwordConfirmar}
                onChange={(e) => setSeguridad({ ...seguridad, passwordConfirmar: e.target.value })}
                className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} pr-10`}
              />
              <button
                onClick={() => setMostrarPassword({ ...mostrarPassword, confirmar: !mostrarPassword.confirmar })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {mostrarPassword.confirmar ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            onClick={handleCambiarPassword}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
};
