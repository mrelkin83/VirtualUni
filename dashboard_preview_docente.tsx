import React, { useState } from 'react';
import { Calendar, BookOpen, Video, FileText, Bell, Award, MessageSquare, TrendingUp, User, Menu, X, Play, CheckCircle, Search, Moon, Sun, Users, BarChart3, Send, Eye, ClipboardCheck, Plus, Edit3, Mail } from 'lucide-react';

export default function DashboardDocente() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [tareaEnRevision, setTareaEnRevision] = useState(null);
  const [calificacionModal, setCalificacionModal] = useState(null);
  const [crearTareaModal, setCrearTareaModal] = useState(false);
  const [crearExamenModal, setCrearExamenModal] = useState(false);
  const [estudianteDetalle, setEstudianteDetalle] = useState(null);
  const [cursoDetalle, setCursoDetalle] = useState(null);
  const [nuevoMensajeModal, setNuevoMensajeModal] = useState(false);
  const [conversacionActiva, setConversacionActiva] = useState(null);

  const [cursosDocente] = useState([
    { id: 1, nombre: 'Programación Avanzada', codigo: 'CS301', estudiantes: 45, tareasPendientesRevision: 12, progresoGeneral: 68, color: 'bg-blue-500' },
    { id: 2, nombre: 'Base de Datos', codigo: 'CS302', estudiantes: 38, tareasPendientesRevision: 5, progresoGeneral: 75, color: 'bg-green-500' },
    { id: 3, nombre: 'Inteligencia Artificial', codigo: 'CS401', estudiantes: 52, tareasPendientesRevision: 18, progresoGeneral: 55, color: 'bg-orange-500' },
    { id: 4, nombre: 'Diseño de Interfaces', codigo: 'CS303', estudiantes: 42, tareasPendientesRevision: 10, progresoGeneral: 72, color: 'bg-purple-500' }
  ]);

  const [estudiantes] = useState([
    { id: 1, nombre: 'Ana García', email: 'ana@univ.edu', curso: 'Programación Avanzada', progreso: 85, calificacionActual: 9.2, tareasPendientes: 1, ultimaActividad: 'Hace 2h' },
    { id: 2, nombre: 'Carlos López', email: 'carlos@univ.edu', curso: 'Programación Avanzada', progreso: 62, calificacionActual: 7.8, tareasPendientes: 3, ultimaActividad: 'Hace 1d' },
    { id: 3, nombre: 'María Rodríguez', email: 'maria@univ.edu', curso: 'Base de Datos', progreso: 78, calificacionActual: 8.5, tareasPendientes: 0, ultimaActividad: 'Hace 3h' },
    { id: 4, nombre: 'Juan Martínez', email: 'juan@univ.edu', curso: 'Inteligencia Artificial', progreso: 45, calificacionActual: 6.5, tareasPendientes: 5, ultimaActividad: 'Hace 2d' }
  ]);

  const [tareasDocente, setTareasDocente] = useState([
    { id: 1, titulo: 'Proyecto Final IA', curso: 'Inteligencia Artificial', fechaLimite: '2025-10-05', entregasTotales: 15, entregasRevisadas: 0 },
    { id: 2, titulo: 'Taller JavaScript', curso: 'Programación Avanzada', fechaLimite: '2025-10-03', entregasTotales: 28, entregasRevisadas: 16 },
    { id: 3, titulo: 'Consultas SQL', curso: 'Base de Datos', fechaLimite: '2025-10-04', entregasTotales: 35, entregasRevisadas: 30 }
  ]);

  const [examenes] = useState([
    { id: 1, titulo: 'Parcial 2', curso: 'Programación Avanzada', fecha: '2025-10-08', estudiantes: 45, estado: 'programado' },
    { id: 2, titulo: 'Quiz Redes', curso: 'Inteligencia Artificial', fecha: '2025-10-06', estudiantes: 52, estado: 'programado' },
    { id: 3, titulo: 'Parcial 1 BD', curso: 'Base de Datos', fecha: '2025-09-28', estudiantes: 38, estado: 'calificado', promedio: 8.3 }
  ]);

  const [mensajes] = useState([
    { 
      id: 1, 
      remitente: 'Ana García', 
      asunto: 'Consulta sobre el Proyecto Final', 
      preview: 'Profesor, tengo una duda sobre los requisitos del proyecto...', 
      fecha: '2025-10-03 09:30', 
      leido: false,
      tipo: 'recibido',
      avatar: 'A'
    },
    { 
      id: 2, 
      remitente: 'Carlos López', 
      asunto: 'Solicitud de prórroga', 
      preview: 'Buenos días profesor, le escribo para solicitar una extensión...', 
      fecha: '2025-10-02 16:45', 
      leido: false,
      tipo: 'recibido',
      avatar: 'C'
    },
    { 
      id: 3, 
      remitente: 'María Rodríguez', 
      asunto: 'Gracias por la retroalimentación', 
      preview: 'Muchas gracias por sus comentarios en la última tarea...', 
      fecha: '2025-10-02 14:20', 
      leido: true,
      tipo: 'recibido',
      avatar: 'M'
    },
    { 
      id: 4, 
      remitente: 'Coordinación Académica', 
      asunto: 'Reunión de profesores', 
      preview: 'Se convoca a reunión para el día viernes...', 
      fecha: '2025-10-01 10:00', 
      leido: true,
      tipo: 'recibido',
      avatar: 'CA'
    },
    { 
      id: 5, 
      remitente: 'Juan Martínez', 
      asunto: 'Re: Material de clase', 
      preview: 'Profesor, ya revisé el material que compartió...', 
      fecha: '2025-09-30 18:30', 
      leido: true,
      tipo: 'recibido',
      avatar: 'J'
    }
  ]);

  const menuItems = [
    { id: 'inicio', icon: TrendingUp, label: 'Dashboard' },
    { id: 'cursos', icon: BookOpen, label: 'Mis Cursos' },
    { id: 'estudiantes', icon: Users, label: 'Estudiantes' },
    { id: 'tareas', icon: FileText, label: 'Tareas' },
    { id: 'examenes', icon: ClipboardCheck, label: 'Exámenes' },
    { id: 'calificaciones', icon: Award, label: 'Calificaciones' },
    { id: 'mensajes', icon: Mail, label: 'Mensajes', badge: mensajes.filter(m => !m.leido).length },
    { id: 'clases', icon: Video, label: 'Clases' },
    { id: 'foros', icon: MessageSquare, label: 'Foros' },
    { id: 'reportes', icon: BarChart3, label: 'Reportes' }
  ];

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-gray-100' : 'text-gray-800';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const renderInicio = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Bienvenido, Prof. García</h2>
        <p className="opacity-90">45 tareas por revisar • 3 exámenes programados • {mensajes.filter(m => !m.leido).length} mensajes nuevos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Estudiantes', value: '177', color: 'border-blue-500', icon: Users },
          { label: 'Por Revisar', value: '45', color: 'border-orange-500', icon: FileText },
          { label: 'Mensajes', value: mensajes.filter(m => !m.leido).length.toString(), color: 'border-red-500', icon: Mail },
          { label: 'Promedio', value: '8.2', color: 'border-purple-500', icon: Award }
        ].map((s, i) => (
          <div key={i} className={`${card} rounded-lg shadow p-4 border-l-4 ${s.color} cursor-pointer hover:shadow-lg transition`} onClick={() => s.label === 'Mensajes' && setActiveSection('mensajes')}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{s.label}</p>
                <p className={`text-2xl font-bold ${text}`}>{s.value}</p>
              </div>
              <s.icon className={s.color.replace('border-', 'text-')} size={32} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Mis Cursos</h3>
          <div className="space-y-4">
            {cursosDocente.map(curso => (
              <div key={curso.id} className={`border ${border} rounded-lg p-4 hover:shadow-md transition cursor-pointer`} onClick={() => setCursoDetalle(curso)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className={`font-semibold ${text}`}>{curso.nombre}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{curso.codigo} • {curso.estudiantes} estudiantes</p>
                  </div>
                  <span className={`${curso.tareasPendientesRevision > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'} px-3 py-1 rounded text-xs`}>
                    {curso.tareasPendientesRevision} por revisar
                  </span>
                </div>
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                  <div className={`${curso.color} h-2 rounded-full`} style={{ width: `${curso.progresoGeneral}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${card} rounded-lg shadow p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${text}`}>Pendientes</h3>
            <div className="space-y-3">
              {tareasDocente.filter(t => t.entregasRevisadas < t.entregasTotales).map(tarea => (
                <div key={tarea.id} className={`border-l-4 border-orange-500 ${darkMode ? 'bg-orange-900' : 'bg-orange-50'} p-3 rounded cursor-pointer`} onClick={() => setTareaEnRevision(tarea)}>
                  <p className={`font-semibold text-sm ${darkMode ? 'text-orange-100' : 'text-gray-800'}`}>{tarea.titulo}</p>
                  <p className="text-xs text-orange-600">{tarea.entregasRevisadas}/{tarea.entregasTotales} revisadas</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Mensajes</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {mensajes.filter(m => !m.leido).length} nuevos
              </span>
            </div>
            <div className="space-y-2">
              {mensajes.filter(m => !m.leido).slice(0, 3).map(mensaje => (
                <div 
                  key={mensaje.id} 
                  className={`border-l-4 border-blue-500 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-3 rounded cursor-pointer hover:shadow-md transition`}
                  onClick={() => setActiveSection('mensajes')}
                >
                  <p className={`font-semibold text-sm ${darkMode ? 'text-blue-100' : 'text-gray-800'}`}>{mensaje.remitente}</p>
                  <p className="text-xs text-blue-600 truncate">{mensaje.asunto}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveSection('mensajes')} 
              className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Ver todos los mensajes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCursos = () => (
    <div className="space-y-6">
      {cursoDetalle ? (
        <>
          <button onClick={() => setCursoDetalle(null)} className="text-blue-600 hover:text-blue-700">← Volver</button>
          <div className={`${card} rounded-lg shadow p-6`}>
            <div className={`${cursoDetalle.color} -m-6 mb-4 p-6 rounded-t-lg text-white`}>
              <h2 className="text-2xl font-bold">{cursoDetalle.nombre}</h2>
              <p>{cursoDetalle.codigo} • {cursoDetalle.estudiantes} estudiantes</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-2xl font-bold text-blue-600">{cursoDetalle.progresoGeneral}%</p>
                <p className="text-sm">Progreso</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-2xl font-bold text-green-600">{cursoDetalle.estudiantes}</p>
                <p className="text-sm">Estudiantes</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-2xl font-bold text-orange-600">{cursoDetalle.tareasPendientesRevision}</p>
                <p className="text-sm">Por revisar</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cursosDocente.map(curso => (
            <div key={curso.id} className={`${card} rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition`}>
              <div className={`${curso.color} h-32 flex items-center justify-center`}>
                <BookOpen size={48} className="text-white" />
              </div>
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 ${text}`}>{curso.nombre}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{curso.codigo}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Estudiantes</p>
                    <p className={`text-xl font-bold ${text}`}>{curso.estudiantes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Por revisar</p>
                    <p className="text-xl font-bold text-orange-600">{curso.tareasPendientesRevision}</p>
                  </div>
                </div>
                <button onClick={() => setCursoDetalle(curso)} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Ver Curso</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEstudiantes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Estudiantes</h2>
        <select className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
          <option>Todos los cursos</option>
          {cursosDocente.map(c => <option key={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {estudiantes.map(est => (
          <div key={est.id} className={`${card} rounded-lg shadow p-4`}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {est.nombre.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className={`font-bold ${text}`}>{est.nombre}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{est.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs ${est.calificacionActual >= 8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {est.calificacionActual}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Progreso</p>
                    <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-1`}>
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${est.progreso}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pendientes</p>
                    <p className={`text-lg font-bold ${text}`}>{est.tareasPendientes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Última actividad</p>
                    <p className="text-sm">{est.ultimaActividad}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEstudianteDetalle(est)} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1">
                    <Eye size={16} />Ver
                  </button>
                  <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 text-sm flex items-center justify-center gap-1">
                    <Send size={16} />Contactar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {estudianteDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEstudianteDetalle(null)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className={`text-2xl font-bold ${text}`}>{estudianteDetalle.nombre}</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{estudianteDetalle.email}</p>
              </div>
              <button onClick={() => setEstudianteDetalle(null)}><X size={24} /></button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-3xl font-bold text-blue-600">{estudianteDetalle.calificacionActual}</p>
                <p className="text-sm">Calificación</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-3xl font-bold text-green-600">{estudianteDetalle.progreso}%</p>
                <p className="text-sm">Progreso</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-3xl font-bold text-orange-600">{estudianteDetalle.tareasPendientes}</p>
                <p className="text-sm">Pendientes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTareas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Tareas</h2>
        <button onClick={() => setCrearTareaModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear
        </button>
      </div>

      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-orange-600">Pendientes de Revisión</h3>
        <div className="space-y-3">
          {tareasDocente.map(tarea => (
            <div key={tarea.id} className={`border ${border} rounded-lg p-4`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className={`font-bold ${text}`}>{tarea.titulo}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tarea.curso} • Vence: {tarea.fechaLimite}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Revisadas: {tarea.entregasRevisadas}/{tarea.entregasTotales}</span>
                      <span>{Math.round((tarea.entregasRevisadas/tarea.entregasTotales)*100)}%</span>
                    </div>
                    <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(tarea.entregasRevisadas/tarea.entregasTotales)*100}%` }}></div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setTareaEnRevision(tarea)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4">Revisar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {tareaEnRevision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setTareaEnRevision(null)}>
          <div className={`${card} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-2xl font-bold ${text}`}>Revisar: {tareaEnRevision.titulo}</h3>
              <button onClick={() => setTareaEnRevision(null)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`border ${border} rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className={`font-semibold ${text}`}>Estudiante {i}</p>
                      <p className="text-sm text-gray-500">Entregado hace 2 días</p>
                      <p className="text-sm text-gray-500">Archivo: tarea_estudiante{i}.pdf</p>
                    </div>
                    <button onClick={() => setCalificacionModal({ tarea: tareaEnRevision, estudiante: i })} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Calificar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {calificacionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setCalificacionModal(null)}>
          <div className={`${card} rounded-lg p-6 max-w-md w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 ${text}`}>Calificar Tarea</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm">Calificación (0-10)</label>
                <input type="number" min="0" max="10" step="0.1" id="nota" className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} />
              </div>
              <div>
                <label className="block mb-2 text-sm">Feedback</label>
                <textarea id="feedback" rows="4" className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}></textarea>
              </div>
              <div className="flex gap-3">
                <button onClick={() => {
                  alert(`Calificación guardada: ${document.getElementById('nota').value}`);
                  setCalificacionModal(null);
                  setTareaEnRevision(null);
                }} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Guardar</button>
                <button onClick={() => setCalificacionModal(null)} className={`flex-1 border ${border} py-2 rounded`}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {crearTareaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setCrearTareaModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-2xl font-bold mb-4 ${text}`}>Crear Nueva Tarea</h3>
            <div className="space-y-4">
              <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                {cursosDocente.map(c => <option key={c.id}>{c.nombre}</option>)}
              </select>
              <input type="text" placeholder="Título" className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} />
              <textarea rows="6" placeholder="Instrucciones" className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}></textarea>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} />
                <input type="number" placeholder="Puntos" className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { alert('Tarea creada'); setCrearTareaModal(false); }} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Publicar</button>
                <button onClick={() => setCrearTareaModal(false)} className={`flex-1 border ${border} py-2 rounded`}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderExamenes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Exámenes</h2>
        <button onClick={() => setCrearExamenModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examenes.map(ex => (
          <div key={ex.id} className={`${card} rounded-lg shadow p-6`}>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className={`font-bold text-lg ${text}`}>{ex.titulo}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ex.curso}</p>
                <p className="text-sm text-gray-500">Fecha: {ex.fecha}</p>
              </div>
              <span className={`px-3 py-1 rounded text-xs h-fit ${ex.estado === 'programado' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {ex.estado === 'programado' ? 'Programado' : 'Calificado'}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-sm">Estudiantes: {ex.estudiantes}</span>
              {ex.promedio && <span className="text-lg font-bold text-green-600">Promedio: {ex.promedio}</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">
                {ex.estado === 'programado' ? 'Editar' : 'Resultados'}
              </button>
              <button className={`border ${border} py-2 rounded text-sm`}>Detalles</button>
            </div>
          </div>
        ))}
      </div>

      {crearExamenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setCrearExamenModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-auto`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-2xl font-bold mb-4 ${text}`}>Crear Examen</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Título" className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} />
                <select className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  {cursosDocente.map(c => <option key={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input type="date" className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} />
                <input type="number" placeholder="Duración (min)" className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} />
                <input type="number" placeholder="Intentos" className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} />
              </div>
              <textarea rows="3" placeholder="Instrucciones" className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}></textarea>
              <div className="flex gap-3">
                <button onClick={() => { alert('Examen creado'); setCrearExamenModal(false); }} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Publicar</button>
                <button onClick={() => setCrearExamenModal(false)} className={`flex-1 border ${border} py-2 rounded`}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCalificaciones = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Calificaciones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cursosDocente.map(curso => (
          <div key={curso.id} className={`${card} rounded-lg shadow p-6`}>
            <h3 className={`font-bold text-lg mb-4 ${text}`}>{curso.nombre}</h3>
            <div className="space-y-3">
              <div className={`flex justify-between py-2 border-b ${border}`}>
                <span>Promedio</span>
                <span className="font-bold text-green-600 text-xl">8.2</span>
              </div>
              <div className={`flex justify-between py-2 border-b ${border}`}>
                <span>Aprobados</span>
                <span className="font-bold text-blue-600">38/{curso.estudiantes}</span>
              </div>
              <div className={`flex justify-between py-2 border-b ${border}`}>
                <span>En riesgo</span>
                <span className="font-bold text-red-600">5</span>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Ver Libro</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClases = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Clases</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Programar
        </button>
      </div>

      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className="text-xl font-semibold mb-4 text-blue-600">Próximas</h3>
        <div className="space-y-3">
          {[
            { curso: 'Programación Avanzada', fecha: 'Hoy 14:00', tema: 'Patrones' },
            { curso: 'Inteligencia Artificial', fecha: 'Hoy 18:00', tema: 'Redes Neuronales' }
          ].map((c, i) => (
            <div key={i} className={`border ${border} rounded-lg p-4 flex justify-between items-center`}>
              <div>
                <h4 className={`font-bold ${text}`}>{c.curso}</h4>
                <p className="text-sm text-gray-500">{c.fecha} • {c.tema}</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                <Play size={16} />Iniciar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderForos = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Foros</h2>
      <div className="grid grid-cols-1 gap-6">
        {cursosDocente.map(curso => (
          <div key={curso.id} className={`${card} rounded-lg shadow p-6`}>
            <h3 className={`font-bold text-lg mb-3 ${text}`}>{curso.nombre}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Mensajes nuevos</p>
                <p className="text-2xl font-bold text-blue-600">23</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Participación</p>
                <p className="text-2xl font-bold text-green-600">85%</p>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Ver Foro</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReportes = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Reportes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { titulo: 'Rendimiento', desc: 'Estadísticas por curso', icon: BarChart3, color: 'blue' },
          { titulo: 'Participación', desc: 'Métricas de engagement', icon: Users, color: 'green' },
          { titulo: 'Progreso', desc: 'Análisis de avance', icon: Award, color: 'purple' }
        ].map((r, i) => (
          <div key={i} className={`${card} rounded-lg shadow p-6`}>
            <r.icon className={`text-${r.color}-600 mb-3`} size={32} />
            <h3 className={`font-bold mb-2 ${text}`}>{r.titulo}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{r.desc}</p>
            <button className={`w-full bg-${r.color}-600 text-white py-2 rounded hover:bg-${r.color}-700`}>Generar</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMensajes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Mensajes</h2>
        <button onClick={() => setNuevoMensajeModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Send size={18} />Nuevo Mensaje
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 ${card} rounded-lg shadow p-4`}>
          <div className="flex gap-2 mb-4">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">
              Recibidos ({mensajes.filter(m => !m.leido).length})
            </button>
            <button className={`flex-1 border ${border} py-2 rounded text-sm`}>
              Enviados
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {mensajes.map(mensaje => (
              <div 
                key={mensaje.id} 
                className={`p-3 rounded-lg cursor-pointer transition ${
                  conversacionActiva?.id === mensaje.id 
                    ? 'bg-blue-100 border-l-4 border-blue-600' 
                    : mensaje.leido 
                      ? `border ${border} hover:bg-gray-50` 
                      : `${darkMode ? 'bg-blue-900' : 'bg-blue-50'} border-l-4 border-blue-600`
                }`}
                onClick={() => setConversacionActiva(mensaje)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {mensaje.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`font-semibold text-sm truncate ${!mensaje.leido ? 'font-bold' : ''}`}>
                        {mensaje.remitente}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(mensaje.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${!mensaje.leido ? 'font-semibold' : ''} truncate`}>
                      {mensaje.asunto}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{mensaje.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 ${card} rounded-lg shadow p-6`}>
          {conversacionActiva ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {conversacionActiva.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${text}`}>{conversacionActiva.remitente}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conversacionActiva.fecha}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                    <Send size={16} />Responder
                  </button>
                </div>
                <h4 className={`text-lg font-semibold ${text}`}>{conversacionActiva.asunto}</h4>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <p className={text}>
                  {conversacionActiva.preview}
                  <br /><br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  <br /><br />
                  Espero su respuesta. Saludos cordiales.
                </p>
              </div>

              <div className="pt-4 border-t">
                <textarea 
                  placeholder="Escribe tu respuesta..." 
                  rows="4" 
                  className={`w-full p-3 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                ></textarea>
                <div className="flex justify-end gap-2 mt-3">
                  <button className={`px-4 py-2 border ${border} rounded hover:bg-gray-50`}>
                    Cancelar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                    <Send size={16} />Enviar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
                <p>Selecciona un mensaje para ver su contenido</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {nuevoMensajeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setNuevoMensajeModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-2xl font-bold ${text}`}>Nuevo Mensaje</h3>
              <button onClick={() => setNuevoMensajeModal(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold">Destinatario</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option>Seleccionar estudiante...</option>
                  {estudiantes.map(est => (
                    <option key={est.id}>{est.nombre} - {est.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Asunto</label>
                <input 
                  type="text" 
                  placeholder="Asunto del mensaje" 
                  className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Mensaje</label>
                <textarea 
                  rows="8" 
                  placeholder="Escribe tu mensaje aquí..." 
                  className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { alert('Mensaje enviado'); setNuevoMensajeModal(false); }} 
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Send size={18} />Enviar
                </button>
                <button 
                  onClick={() => setNuevoMensajeModal(false)} 
                  className={`flex-1 border ${border} py-2 rounded`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'inicio': return renderInicio();
      case 'cursos': return renderCursos();
      case 'estudiantes': return renderEstudiantes();
      case 'tareas': return renderTareas();
      case 'examenes': return renderExamenes();
      case 'calificaciones': return renderCalificaciones();
      case 'mensajes': return renderMensajes();
      case 'clases': return renderClases();
      case 'foros': return renderForos();
      case 'reportes': return renderReportes();
      default: return renderInicio();
    }
  };

  return (
    <div className={`flex h-screen ${bg}`}>
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-700 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-600">
          {sidebarOpen && <h1 className="text-xl font-bold">UniVirtual Prof</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-600 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition relative ${activeSection === item.id ? 'bg-blue-600' : 'hover:bg-blue-800'}`}>
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
                {item.badge > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-600">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800">
            <User size={20} />
            {sidebarOpen && <span className="text-sm">Mi Perfil</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={`${card} shadow-sm p-4 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${text}`}>{menuItems.find(i => i.id === activeSection)?.label || 'Dashboard'}</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full`}>
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <div className="relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">PG</div>
              <div className="hidden md:block">
                <p className={`text-sm font-semibold ${text}`}>Prof. García</p>
                <p className="text-xs text-gray-500">profesor@univ.edu</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}