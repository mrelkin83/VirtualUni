import React from 'react';
import { Award, TrendingUp } from 'lucide-react';

interface CalificacionesSectionProps {
  calificaciones: any[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const CalificacionesSection: React.FC<CalificacionesSectionProps> = ({
  calificaciones,
  darkMode,
  card,
  text,
  border
}) => {
  const promedioGeneral = calificaciones.reduce((sum, c) => sum + c.promedio, 0) / calificaciones.length;

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Calificaciones</h2>

      {/* General Average */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Award className="text-green-600" size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Promedio General</p>
            <p className={`text-4xl font-bold ${text}`}>{promedioGeneral.toFixed(2)}</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp size={20} />
              <span className="font-semibold">Excelente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className={`${card} rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`text-left p-4 ${text} font-semibold`}>Curso</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Parcial 1</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Parcial 2</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Talleres</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Proyecto</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {calificaciones.map((cal, idx) => (
                <tr key={idx} className={`border-t ${border}`}>
                  <td className={`p-4 ${text} font-semibold`}>{cal.curso}</td>
                  <td className="text-center p-4">
                    {cal.parcial1 !== null ? (
                      <span className={`inline-block px-3 py-1 rounded ${
                        cal.parcial1 >= 9 ? 'bg-green-100 text-green-700' :
                        cal.parcial1 >= 7 ? 'bg-blue-100 text-blue-700' :
                        cal.parcial1 >= 6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {cal.parcial1.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {cal.parcial2 !== null ? (
                      <span className={`inline-block px-3 py-1 rounded ${
                        cal.parcial2 >= 9 ? 'bg-green-100 text-green-700' :
                        cal.parcial2 >= 7 ? 'bg-blue-100 text-blue-700' :
                        cal.parcial2 >= 6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {cal.parcial2.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {cal.talleres !== null ? (
                      <span className={`inline-block px-3 py-1 rounded ${
                        cal.talleres >= 9 ? 'bg-green-100 text-green-700' :
                        cal.talleres >= 7 ? 'bg-blue-100 text-blue-700' :
                        cal.talleres >= 6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {cal.talleres.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {cal.proyecto !== null ? (
                      <span className={`inline-block px-3 py-1 rounded ${
                        cal.proyecto >= 9 ? 'bg-green-100 text-green-700' :
                        cal.proyecto >= 7 ? 'bg-blue-100 text-blue-700' :
                        cal.proyecto >= 6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {cal.proyecto.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    <span className={`inline-block px-4 py-2 rounded font-bold ${
                      cal.promedio >= 9 ? 'bg-green-100 text-green-700' :
                      cal.promedio >= 7 ? 'bg-blue-100 text-blue-700' :
                      cal.promedio >= 6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {cal.promedio.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Legend */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`font-bold ${text} mb-4`}>Escala de Calificación</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Excelente (9.0 - 10.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bueno (7.0 - 8.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Aceptable (6.0 - 6.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Insuficiente (&lt; 6.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
