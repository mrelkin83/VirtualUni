import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';

interface CalificacionesSectionProps {
  estudiantes: any[];
  cursos: any[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const CalificacionesSection: React.FC<CalificacionesSectionProps> = ({
  estudiantes,
  cursos,
  darkMode,
  card,
  text,
  border
}) => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('todos');
  const [editando, setEditando] = useState<{id: number, campo: string} | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [calificaciones, setCalificaciones] = useState<Record<number, any>>({});

  const handleEditarCalificacion = (estudianteId: number, campo: string, valor: string) => {
    setCalificaciones({
      ...calificaciones,
      [estudianteId]: {
        ...calificaciones[estudianteId],
        [campo]: parseFloat(valor) || 0
      }
    });
    setEditando(null);
  };

  const getCalificacion = (estudianteId: number, campo: string) => {
    return calificaciones[estudianteId]?.[campo] ?? (Math.random() * 2 + 3).toFixed(1);
  };

  const calcularPromedio = (estudianteId: number) => {
    const parcial1 = parseFloat(getCalificacion(estudianteId, 'parcial1'));
    const parcial2 = parseFloat(getCalificacion(estudianteId, 'parcial2'));
    const talleres = parseFloat(getCalificacion(estudianteId, 'talleres'));
    const proyecto = parseFloat(getCalificacion(estudianteId, 'proyecto'));

    return ((parcial1 * 0.3) + (parcial2 * 0.3) + (talleres * 0.2) + (proyecto * 0.2)).toFixed(1);
  };

  const getColorNota = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600 font-semibold';
    if (nota >= 4.0) return 'text-blue-600 font-semibold';
    if (nota >= 3.5) return 'text-yellow-600 font-semibold';
    if (nota >= 3.0) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const estudiantesFiltrados = estudiantes.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    (cursoSeleccionado === 'todos' || e.curso === cursos.find(c => c.id.toString() === cursoSeleccionado)?.nombre)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${text}`}>Libro de Calificaciones</h2>
          <p className="text-gray-500 mt-1">Gestiona las calificaciones de tus estudiantes</p>
        </div>
        <button
          onClick={() => alert('Exportar calificaciones')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Buscar Estudiante</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                placeholder="Nombre del estudiante..."
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Filtrar por Curso</label>
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
        </div>
      </div>

      {/* Tabla de Calificaciones */}
      <div className={`${card} rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider sticky left-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  Estudiante
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${text} uppercase tracking-wider`}>
                  Parcial 1<br/><span className="text-xs font-normal">(30%)</span>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${text} uppercase tracking-wider`}>
                  Parcial 2<br/><span className="text-xs font-normal">(30%)</span>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${text} uppercase tracking-wider`}>
                  Talleres<br/><span className="text-xs font-normal">(20%)</span>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${text} uppercase tracking-wider`}>
                  Proyecto<br/><span className="text-xs font-normal">(20%)</span>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${text} uppercase tracking-wider bg-blue-50 dark:bg-blue-900`}>
                  Promedio Final
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${text} uppercase tracking-wider`}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y ${border}">
              {estudiantesFiltrados.map((estudiante) => {
                const promedio = parseFloat(calcularPromedio(estudiante.id));
                return (
                  <tr key={estudiante.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className={`px-6 py-4 whitespace-nowrap sticky left-0 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="font-medium">{estudiante.nombre}</div>
                      <div className="text-sm text-gray-500">{estudiante.curso}</div>
                    </td>
                    {['parcial1', 'parcial2', 'talleres', 'proyecto'].map(campo => (
                      <td key={campo} className="px-6 py-4 whitespace-nowrap text-center">
                        {editando?.id === estudiante.id && editando?.campo === campo ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              defaultValue={getCalificacion(estudiante.id, campo)}
                              onBlur={(e) => handleEditarCalificacion(estudiante.id, campo, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditarCalificacion(estudiante.id, campo, (e.target as HTMLInputElement).value);
                                } else if (e.key === 'Escape') {
                                  setEditando(null);
                                }
                              }}
                              className="w-16 px-2 py-1 text-center border rounded"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditando({ id: estudiante.id, campo })}
                            className={`hover:bg-gray-100 dark:hover:bg-gray-600 px-3 py-1 rounded ${getColorNota(parseFloat(getCalificacion(estudiante.id, campo)))}`}
                          >
                            {getCalificacion(estudiante.id, campo)}
                          </button>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50 dark:bg-blue-900">
                      <span className={`text-lg ${getColorNota(promedio)}`}>
                        {promedio}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        promedio >= 3.0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {promedio >= 3.0 ? 'Aprobado' : 'Reprobado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {(estudiantesFiltrados.reduce((acc, e) => acc + parseFloat(calcularPromedio(e.id)), 0) / estudiantesFiltrados.length || 0).toFixed(1)}
            </p>
            <p className={`text-sm ${text} mt-2`}>Promedio General</p>
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {estudiantesFiltrados.filter(e => parseFloat(calcularPromedio(e.id)) >= 3.0).length}
            </p>
            <p className={`text-sm ${text} mt-2`}>Aprobados</p>
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">
              {estudiantesFiltrados.filter(e => parseFloat(calcularPromedio(e.id)) < 3.0).length}
            </p>
            <p className={`text-sm ${text} mt-2`}>Reprobados</p>
          </div>
        </div>
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {Math.max(...estudiantesFiltrados.map(e => parseFloat(calcularPromedio(e.id)))).toFixed(1)}
            </p>
            <p className={`text-sm ${text} mt-2`}>Nota Más Alta</p>
          </div>
        </div>
      </div>
    </div>
  );
};
