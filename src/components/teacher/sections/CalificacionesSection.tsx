import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { avisar } from '../../ui';

interface CalificacionesSectionProps {
  estudiantes: any[];
  cursos: any[];
}

export const CalificacionesSection: React.FC<CalificacionesSectionProps> = ({
  estudiantes,
  cursos,
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
    if (nota >= 4.5) return 'text-pn-ok font-semibold';
    if (nota >= 4.0) return 'text-pn-accent-text font-semibold';
    if (nota >= 3.5) return 'text-pn-warn font-semibold';
    if (nota >= 3.0) return 'text-pn-warn font-semibold';
    return 'text-pn-danger font-semibold';
  };

  const estudiantesFiltrados = estudiantes.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    (cursoSeleccionado === 'todos' || e.curso === cursos.find(c => c.id.toString() === cursoSeleccionado)?.nombre)
  );

  /** Descarga filas como CSV (UTF-8 con BOM para que Excel lea tildes). */
  const descargarCsv = (nombre: string, filas: (string | number)[][]) => {
    const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const contenido = filas.map((f) => f.map(esc).join(';')).join('\r\n');
    const blob = new Blob(['\ufeff' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Exporta el libro visible; antes el boton era avisar.error('Exportar calificaciones'). */
  const exportarCalificacionesCsv = () => {
    if (!estudiantesFiltrados.length) {
      avisar.error('No hay estudiantes para exportar.');
      return;
    }
    descargarCsv('calificaciones.csv', [
 ['Estudiante', 'Curso', 'Parcial 1', 'Parcial 2', 'Talleres', 'Proyecto', 'Promedio'],
      ...estudiantesFiltrados.map((e: any) => [
        e.nombre,
        e.curso ?? '',
        e.parcial1 ?? '',
        e.parcial2 ?? '',
        e.talleres ?? '',
        e.proyecto ?? '',
        calcularPromedio(e.id),
      ]),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold text-pn-ink`}>Libro de Calificaciones</h2>
          <p className="text-pn-muted mt-1">Gestiona las calificaciones de tus estudiantes</p>
        </div>
        <button
          onClick={exportarCalificacionesCsv}
          className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium text-pn-ink mb-2`}>Buscar Estudiante</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted" size={20} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
                placeholder="Nombre del estudiante..."
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium text-pn-ink mb-2`}>Filtrar por Curso</label>
            <select
              value={cursoSeleccionado}
              onChange={(e) => setCursoSeleccionado(e.target.value)}
              className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
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
      <div className={`bg-pn-surface rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={'bg-pn-surface-2'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider sticky left-0 bg-pn-surface-2`}>
                  Estudiante
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium text-pn-ink uppercase tracking-wider`}>
                  Parcial 1<br/><span className="text-xs font-normal">(30%)</span>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium text-pn-ink uppercase tracking-wider`}>
                  Parcial 2<br/><span className="text-xs font-normal">(30%)</span>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium text-pn-ink uppercase tracking-wider`}>
                  Talleres<br/><span className="text-xs font-normal">(20%)</span>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium text-pn-ink uppercase tracking-wider`}>
                  Proyecto<br/><span className="text-xs font-normal">(20%)</span>
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium text-pn-ink uppercase tracking-wider bg-pn-accent-soft`}>
                  Promedio Final
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium text-pn-ink uppercase tracking-wider`}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y border-pn-line">
              {estudiantesFiltrados.map((estudiante) => {
                const promedio = parseFloat(calcularPromedio(estudiante.id));
                return (
                  <tr key={estudiante.id} className="hover:bg-pn-surface-2">
                    <td className={`px-6 py-4 whitespace-nowrap sticky left-0 bg-pn-surface`}>
                      <div className="font-medium">{estudiante.nombre}</div>
                      <div className="text-sm text-pn-muted">{estudiante.curso}</div>
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
                            className={`hover:bg-pn-surface-3 px-3 py-1 rounded ${getColorNota(parseFloat(getCalificacion(estudiante.id, campo)))}`}
                          >
                            {getCalificacion(estudiante.id, campo)}
                          </button>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-center bg-pn-accent-soft">
                      <span className={`text-lg ${getColorNota(promedio)}`}>
                        {promedio}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        promedio >= 3.0 ? 'bg-pn-ok-soft text-pn-ok' : 'bg-pn-danger-soft text-pn-danger'
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
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-pn-accent-text">
              {(estudiantesFiltrados.reduce((acc, e) => acc + parseFloat(calcularPromedio(e.id)), 0) / estudiantesFiltrados.length || 0).toFixed(1)}
            </p>
            <p className={`text-sm text-pn-ink mt-2`}>Promedio General</p>
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-pn-ok">
              {estudiantesFiltrados.filter(e => parseFloat(calcularPromedio(e.id)) >= 3.0).length}
            </p>
            <p className={`text-sm text-pn-ink mt-2`}>Aprobados</p>
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-pn-danger">
              {estudiantesFiltrados.filter(e => parseFloat(calcularPromedio(e.id)) < 3.0).length}
            </p>
            <p className={`text-sm text-pn-ink mt-2`}>Reprobados</p>
          </div>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-pn-accent-2-text">
              {Math.max(...estudiantesFiltrados.map(e => parseFloat(calcularPromedio(e.id)))).toFixed(1)}
            </p>
            <p className={`text-sm text-pn-ink mt-2`}>Nota Más Alta</p>
          </div>
        </div>
      </div>
    </div>
  );
};
