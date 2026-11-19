import React, { useState } from 'react';
import { Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { attendanceApi } from '../../../api/endpoints/attendance';
import { avisar } from '../../ui';

interface AsistenciaSectionProps {
  estudiantes: any[];
  cursos: any[];
}

export const AsistenciaSection: React.FC<AsistenciaSectionProps> = ({
  estudiantes,
  cursos,
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
      avisar.info('Marca la asistencia de al menos un estudiante.');
      return;
    }

    if (cursoSeleccionado === 'todos') {
      avisar.info('Selecciona un curso específico para guardar la asistencia.');
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
        avisar.ok(`Asistencia guardada en el servidor: ${data?.registrados ?? registros.length} estudiantes (${fechaSeleccionada})`);
        return;
      } catch (err: any) {
        console.error('Error guardando asistencia:', err);
        avisar.error(`No se pudo guardar en el servidor (${err?.message || 'error de conexión'}).`);
        return;
      } finally {
        setGuardando(false);
      }
    }

    avisar.ok(`Asistencia guardada para ${entradas.length} estudiantes`);
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado) {
      case 'presente': return 'bg-pn-ok-soft text-pn-ok';
      case 'ausente': return 'bg-pn-danger-soft text-pn-danger';
      case 'tarde': return 'bg-pn-warn-soft text-pn-warn';
      default: return 'bg-pn-surface-3 text-pn-ink';
    }
  };

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

  /** Exporta lo que la tabla muestra; antes el boton era avisar.error('Exportar asistencia'). */
  const exportarAsistenciaCsv = () => {
    if (!estudiantes.length) {
      avisar.error('No hay estudiantes para exportar.');
      return;
    }
    descargarCsv(`asistencia-${fechaSeleccionada || 'hoy'}.csv`, [
 ['Estudiante', 'Email', 'Curso', 'Estado'],
      ...estudiantes.map((e: any) => [e.nombre, e.email ?? '', e.curso ?? '', asistencia[e.id] ?? 'sin marcar']),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold text-pn-ink`}>Control de Asistencia</h2>
          <p className="text-pn-muted mt-1">Registra y consulta la asistencia de tus estudiantes</p>
        </div>
        <button
          onClick={exportarAsistenciaCsv}
          className="bg-pn-accent hover:bg-pn-accent-hover text-pn-accent-ink px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium text-pn-ink mb-2`}>Curso</label>
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
          <div>
            <label className={`block text-sm font-medium text-pn-ink mb-2`}>Fecha</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className={`w-full px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGuardarAsistencia}
              disabled={guardando}
              className="w-full bg-pn-ok hover:bg-pn-ok disabled:opacity-50 text-pn-surface px-4 py-2 rounded-lg"
            >
              {guardando ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Asistencia */}
      <div className={`bg-pn-surface rounded-lg shadow overflow-hidden`}>
        <div className="p-6 border-b border-pn-line">
          <h3 className={`text-lg font-bold text-pn-ink`}>Registro de Asistencia</h3>
          <p className="text-sm text-pn-muted mt-1">
            {new Date(fechaSeleccionada).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={'bg-pn-surface-2'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider`}>Estudiante</th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider`}>Curso</th>
                <th className={`px-6 py-3 text-center text-xs font-medium text-pn-ink uppercase tracking-wider`}>Estado</th>
                <th className={`px-6 py-3 text-center text-xs font-medium text-pn-ink uppercase tracking-wider`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y border-pn-line">
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.id} className="hover:bg-pn-surface-2">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{estudiante.nombre}</div>
                    <div className="text-sm text-pn-muted">{estudiante.email}</div>
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
                        className={`p-2 rounded hover:bg-pn-ok-soft ${asistencia[estudiante.id] === 'presente' ? 'bg-pn-ok-soft' : ''}`}
                        title="Presente"
                      >
                        <CheckCircle size={18} className="text-pn-ok" />
                      </button>
                      <button
                        onClick={() => handleMarcarAsistencia(estudiante.id, 'tarde')}
                        className={`p-2 rounded hover:bg-pn-warn-soft ${asistencia[estudiante.id] === 'tarde' ? 'bg-pn-warn-soft' : ''}`}
                        title="Tarde"
                      >
                        <Clock size={18} className="text-pn-warn" />
                      </button>
                      <button
                        onClick={() => handleMarcarAsistencia(estudiante.id, 'ausente')}
                        className={`p-2 rounded hover:bg-pn-danger-soft ${asistencia[estudiante.id] === 'ausente' ? 'bg-pn-danger-soft' : ''}`}
                        title="Ausente"
                      >
                        <XCircle size={18} className="text-pn-danger" />
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
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <CheckCircle className="text-pn-ok" size={32} />
            <span className="text-3xl font-bold text-pn-ok">
              {Object.values(asistencia).filter(a => a === 'presente').length}
            </span>
          </div>
          <h3 className={`font-semibold text-pn-ink mt-2`}>Presentes</h3>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <Clock className="text-pn-warn" size={32} />
            <span className="text-3xl font-bold text-pn-warn">
              {Object.values(asistencia).filter(a => a === 'tarde').length}
            </span>
          </div>
          <h3 className={`font-semibold text-pn-ink mt-2`}>Tardanzas</h3>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <XCircle className="text-pn-danger" size={32} />
            <span className="text-3xl font-bold text-pn-danger">
              {Object.values(asistencia).filter(a => a === 'ausente').length}
            </span>
          </div>
          <h3 className={`font-semibold text-pn-ink mt-2`}>Ausentes</h3>
        </div>
      </div>
    </div>
  );
};
