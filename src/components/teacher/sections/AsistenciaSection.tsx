import React, { useState } from 'react';
import { Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { attendanceApi } from '../../../api/endpoints/attendance';

interface AsistenciaSectionProps {
  estudiantes: any[];
  cursos: any[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const AsistenciaSection: React.FC<AsistenciaSectionProps> = ({
  estudiantes,
  cursos,
  darkMode,
  card,
  text,
  border
}) => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('todos');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [asistencia, setAsistencia] = useState<Record<string | number, 'presente' | 'ausente' | 'tarde'>>({});
  const [guardando, setGuardando] = useState(false);

  const handleMarcarAsistencia = (estudianteId: string | number, estado: 'presente' | 'ausente' | 'tarde') => {
    setAsistencia({ ...asistencia, [estudianteId]: estado });
  };

  // Los ids reales del API son uuids; los del mock son numéricos
  const esUuid = (v: unknown) => typeof v === 'string' && v.includes('-') && v.length >= 32;

  const handleGuardarAsistencia = async () => {
    const entradas = Object.entries(asistencia);
    if (entradas.length === 0) {
      alert('Marca la asistencia de al menos un estudiante.');
      return;
    }

    if (cursoSeleccionado === 'todos') {
      alert('Selecciona un curso específico para guardar la asistencia.');
      return;
    }

    const estadoMap = { presente: 'PRESENTE', ausente: 'AUSENTE', tarde: 'TARDE' } as const;
    const registros = entradas
      .filter(([studentId]) => esUuid(studentId))
      .map(([studentId, estado]) => ({ studentId, estado: estadoMap[estado] }));

    if (esUuid(cursoSeleccionado) && registros.length > 0) {
      setGuardando(true);
      try {
        const { data } = await attendanceApi.registerBulk({
          courseId: cursoSeleccionado,
          fecha: fechaSeleccionada,
          registros,
        });
        alert(`Asistencia guardada en el servidor: ${data?.registrados ?? registros.length} estudiantes (${fechaSeleccionada})`);
        return;
      } catch (err: any) {
        console.error('Error guardando asistencia:', err);
        alert(`No se pudo guardar en el servidor (${err?.message || 'error de conexión'}).`);
        return;
      } finally {
        setGuardando(false);
      }
    }

    alert(`Asistencia guardada para ${entradas.length} estudiantes`);
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado) {
      case 'presente': return 'bg-green-100 text-green-800';
      case 'ausente': return 'bg-red-100 text-red-800';
      case 'tarde': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${text}`}>Control de Asistencia</h2>
          <p className="text-gray-500 mt-1">Registra y consulta la asistencia de tus estudiantes</p>
        </div>
        <button
          onClick={() => alert('Exportar asistencia')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Curso</label>
            <select
              value={cursoSeleccionado}
              onChange={(e) => setCursoSeleccionado(e.target.value)}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            >
              <option value="todos">Todos los Cursos</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>{curso.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Fecha</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className={`w-full px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGuardarAsistencia}
              disabled={guardando}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
            >
              {guardando ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Asistencia */}
      <div className={`${card} rounded-lg shadow overflow-hidden`}>
        <div className="p-6 border-b ${border}">
          <h3 className={`text-lg font-bold ${text}`}>Registro de Asistencia</h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(fechaSeleccionada).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider`}>Estudiante</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider`}>Curso</th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${text} uppercase tracking-wider`}>Estado</th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${text} uppercase tracking-wider`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y ${border}">
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{estudiante.nombre}</div>
                    <div className="text-sm text-gray-500">{estudiante.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{estudiante.curso}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(asistencia[estudiante.id])}`}>
                      {asistencia[estudiante.id] ? asistencia[estudiante.id] : 'Sin marcar'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleMarcarAsistencia(estudiante.id, 'presente')}
                        className={`p-2 rounded hover:bg-green-100 ${asistencia[estudiante.id] === 'presente' ? 'bg-green-200' : ''}`}
                        title="Presente"
                      >
                        <CheckCircle size={18} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => handleMarcarAsistencia(estudiante.id, 'tarde')}
                        className={`p-2 rounded hover:bg-yellow-100 ${asistencia[estudiante.id] === 'tarde' ? 'bg-yellow-200' : ''}`}
                        title="Tarde"
                      >
                        <Clock size={18} className="text-yellow-600" />
                      </button>
                      <button
                        onClick={() => handleMarcarAsistencia(estudiante.id, 'ausente')}
                        className={`p-2 rounded hover:bg-red-100 ${asistencia[estudiante.id] === 'ausente' ? 'bg-red-200' : ''}`}
                        title="Ausente"
                      >
                        <XCircle size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <CheckCircle className="text-green-600" size={32} />
            <span className="text-3xl font-bold text-green-600">
              {Object.values(asistencia).filter(a => a === 'presente').length}
            </span>
          </div>
          <h3 className={`font-semibold ${text} mt-2`}>Presentes</h3>
        </div>
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <Clock className="text-yellow-600" size={32} />
            <span className="text-3xl font-bold text-yellow-600">
              {Object.values(asistencia).filter(a => a === 'tarde').length}
            </span>
          </div>
          <h3 className={`font-semibold ${text} mt-2`}>Tardanzas</h3>
        </div>
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <XCircle className="text-red-600" size={32} />
            <span className="text-3xl font-bold text-red-600">
              {Object.values(asistencia).filter(a => a === 'ausente').length}
            </span>
          </div>
          <h3 className={`font-semibold ${text} mt-2`}>Ausentes</h3>
        </div>
      </div>
    </div>
  );
};
