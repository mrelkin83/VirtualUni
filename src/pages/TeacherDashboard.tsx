import React from 'react';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { useAuthStore } from '../store/authStore';
import { TeacherSidebar } from '../components/teacher/layout/TeacherSidebar';
import { TeacherHeader } from '../components/teacher/layout/TeacherHeader';
import { InicioSection } from '../components/teacher/sections/InicioSection';
import { CursosSection } from '../components/teacher/sections/CursosSection';
import { EstudiantesSection } from '../components/teacher/sections/EstudiantesSection';
import { TareasSection } from '../components/teacher/sections/TareasSection';
import { MensajesSection } from '../components/teacher/sections/MensajesSection';
import { GruposSection } from '../components/teacher/sections/GruposSection';
import { ExamenesSection } from '../components/teacher/sections/ExamenesSection';
import { MaterialesSection } from '../components/teacher/sections/MaterialesSection';
import { ClasesSection } from '../components/teacher/sections/ClasesSection';
import { AnaliticasSection } from '../components/teacher/sections/AnaliticasSection';
import { CalendarioSection } from '../components/teacher/sections/CalendarioSection';
import { AsistenciaSection } from '../components/teacher/sections/AsistenciaSection';
import { CalificacionesSection } from '../components/teacher/sections/CalificacionesSection';
import { ConfiguracionSection } from '../components/teacher/sections/ConfiguracionSection';
import { ConfiguracionCursoModal } from '../components/teacher/modals/ConfiguracionCursoModal';
import { RevisionTareaModal } from '../components/teacher/modals/RevisionTareaModal';
import { PerfilEstudianteModal } from '../components/teacher/modals/PerfilEstudianteModal';
import { MensajeDetalleModal } from '../components/teacher/modals/MensajeDetalleModal';
import { NuevoMensajeModal } from '../components/teacher/modals/NuevoMensajeModal';

export default function TeacherDashboard() {
  const { logout } = useAuthStore();
  const state = useTeacherDashboard();

  const {
    activeSection,
    sidebarOpen,
    darkMode,
    cursos,
    estudiantes,
    tareas,
    examenes,
    modulosCurso,
    mensajes,
    bg,
    card,
    text,
    border,
    cursoDetalle,
    tareaEnRevision,
    estudianteDetalle,
    setSidebarOpen,
    setActiveSection,
    setDarkMode,
    setNotificacionesAbiertas,
    setNuevoMensajeModal,
    setCursoDetalle,
    setEstudianteDetalle,
    setTareaEnRevision,
    setModalConfigCurso,
    setConversacionActiva,
    setCrearTareaModal,
    calificarEntrega,
    verPerfilEstudiante,
    enviarMensajeEstudiante,
    exportarDatosEstudiante,
    conversacionActiva,
    nuevoMensajeModal,
    marcarMensajeLeido,
    eliminarMensaje,
    responderMensaje,
    archivarMensaje,
    enviarMensajeIndividual,
  } = state;

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <InicioSection
            cursos={cursos}
            estudiantes={estudiantes}
            tareas={tareas}
            setCursoDetalle={setCursoDetalle}
            setEstudianteDetalle={setEstudianteDetalle}
            setTareaEnRevision={setTareaEnRevision}
            setActiveSection={setActiveSection}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );
      case 'cursos':
        return (
          <CursosSection
            cursos={cursos}
            cursoDetalle={cursoDetalle}
            setCursoDetalle={setCursoDetalle}
            modulosCurso={modulosCurso}
            setModalConfigCurso={setModalConfigCurso}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            crearModulo={state.crearModulo}
            editarModulo={state.editarModulo}
            eliminarModulo={state.eliminarModulo}
            crearTema={state.crearTema}
            editarTema={state.editarTema}
            eliminarTema={state.eliminarTema}
          />
        );
      case 'estudiantes':
        return (
          <EstudiantesSection
            estudiantes={estudiantes}
            setEstudianteDetalle={setEstudianteDetalle}
            verPerfilEstudiante={verPerfilEstudiante}
            enviarMensajeEstudiante={enviarMensajeEstudiante}
            exportarDatosEstudiante={exportarDatosEstudiante}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );
      case 'tareas':
        return (
          <TareasSection
            tareas={tareas}
            setTareaEnRevision={setTareaEnRevision}
            setCrearTareaModal={setCrearTareaModal}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            crearTarea={state.crearTarea}
            cursos={cursos}
            estudiantes={estudiantes}
          />
        );
      case 'grupos':
        return (
          <GruposSection
            grupos={state.grupos || []}
            estudiantes={estudiantes}
            cursos={cursos}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            crearGrupo={state.crearGrupo}
            editarGrupo={state.editarGrupo}
            eliminarGrupo={state.eliminarGrupo}
            asignarEstudiantes={state.asignarEstudiantes}
            eliminarEstudiante={state.eliminarEstudianteGrupo}
            crearTareaGrupal={state.crearTareaGrupal}
            enviarMensajeGrupo={state.enviarMensajeGrupo}
            verDetalleGrupo={state.verDetalleGrupo}
          />
        );
      case 'examenes':
        return (
          <ExamenesSection
            examenes={examenes}
            bancoPreguntas={state.bancoPreguntas}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            crearExamen={state.crearExamen}
            editarExamen={state.editarExamen}
            eliminarExamen={state.eliminarExamen}
            publicarExamen={state.publicarExamen}
            agregarPregunta={state.agregarPregunta}
            verResultadosExamen={state.verResultadosExamen}
            obtenerExamenDetallado={state.obtenerExamenDetallado}
            editarPregunta={state.editarPregunta}
            eliminarPregunta={state.eliminarPregunta}
            cursos={cursos}
          />
        );
      case 'calificaciones':
        return (
          <CalificacionesSection
            estudiantes={estudiantes}
            cursos={cursos}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );
      case 'asistencia':
        return (
          <AsistenciaSection
            estudiantes={estudiantes}
            cursos={cursos}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );
      case 'mensajes':
        return (
          <MensajesSection
            mensajes={mensajes}
            cursos={cursos}
            setConversacionActiva={setConversacionActiva}
            setNuevoMensajeModal={setNuevoMensajeModal}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            enviarMensajeMasivo={state.enviarMensajeMasivo}
            crearAnuncio={state.crearAnuncio}
            guardarPlantilla={state.guardarPlantilla}
            eliminarPlantilla={state.eliminarPlantilla}
            plantillas={state.plantillas}
          />
        );
      case 'materiales':
        return (
          <MaterialesSection
            materiales={state.materiales || []}
            carpetas={state.carpetas || []}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            subirMaterial={state.subirMaterial}
            eliminarMaterial={state.eliminarMaterial}
            editarMaterial={state.editarMaterial}
            crearCarpeta={state.crearCarpeta}
            eliminarCarpeta={state.eliminarCarpeta}
            editarCarpeta={state.editarCarpeta}
            agregarMaterialCarpeta={state.agregarMaterialCarpeta}
            removerMaterialCarpeta={state.removerMaterialCarpeta}
            moverMaterial={state.moverMaterial}
            cursosDisponibles={cursos}
          />
        );
      case 'clases':
        return (
          <ClasesSection
            clasesVivo={state.clasesVivo || []}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            programarClase={state.programarClase}
            subirClasePregrabada={state.subirClasePregrabada}
            iniciarClaseEnVivo={state.iniciarClaseEnVivo}
            finalizarClase={state.finalizarClase}
            compartirEnlaceClase={state.compartirEnlaceClase}
            verParticipacionClase={state.verParticipacionClase}
            eliminarClase={state.eliminarClase}
            editarClase={state.editarClase}
          />
        );
      case 'calendario':
        return (
          <CalendarioSection
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            cursos={cursos}
          />
        );
      case 'analiticas':
        return (
          <AnaliticasSection
            cursos={cursos}
            estudiantes={estudiantes}
            tareas={tareas}
            examenes={examenes}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );
      case 'configuracion':
        return (
          <ConfiguracionSection
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );
      default:
        return (
          <InicioSection
            cursos={cursos}
            estudiantes={estudiantes}
            tareas={tareas}
            setCursoDetalle={setCursoDetalle}
            setEstudianteDetalle={setEstudianteDetalle}
            setTareaEnRevision={setTareaEnRevision}
            setActiveSection={setActiveSection}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );
    }
  };

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      inicio: 'Dashboard',
      cursos: 'Mis Cursos',
      grupos: 'Mis Grupos',
      estudiantes: 'Estudiantes',
      tareas: 'Tareas',
      examenes: 'Exámenes',
      calificaciones: 'Calificaciones',
      asistencia: 'Asistencia',
      mensajes: 'Mensajes',
      materiales: 'Materiales',
      clases: 'Clases en Vivo',
      calendario: 'Calendario',
      analiticas: 'Analíticas',
      configuracion: 'Configuración',
    };
    return titles[activeSection] || 'Dashboard';
  };

  // Navegación entre mensajes
  const navegarMensaje = (direccion: 'siguiente' | 'anterior') => {
    if (!conversacionActiva) return;

    const mensajesRecibidos = mensajes.filter((m: any) => m.tipo === 'recibido');
    const indexActual = mensajesRecibidos.findIndex((m: any) => m.id === conversacionActiva.id);

    let nuevoIndex;
    if (direccion === 'siguiente') {
      nuevoIndex = indexActual + 1;
    } else {
      nuevoIndex = indexActual - 1;
    }

    if (nuevoIndex >= 0 && nuevoIndex < mensajesRecibidos.length) {
      setConversacionActiva(mensajesRecibidos[nuevoIndex]);
    }
  };

  // Calcular si hay mensajes anteriores/siguientes
  const getMensajesNavegacion = () => {
    if (!conversacionActiva) return { hayAnteriores: false, haySiguientes: false };

    const mensajesRecibidos = mensajes.filter((m: any) => m.tipo === 'recibido');
    const indexActual = mensajesRecibidos.findIndex((m: any) => m.id === conversacionActiva.id);

    return {
      hayAnteriores: indexActual > 0,
      haySiguientes: indexActual < mensajesRecibidos.length - 1,
    };
  };

  const { hayAnteriores, haySiguientes } = getMensajesNavegacion();

  return (
    <div className={`flex h-screen ${bg}`}>
      <TeacherSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={logout}
      />

      <div className="flex-1 overflow-y-auto">
        <TeacherHeader
          title={getSectionTitle()}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          notificacionesAbiertas={state.notificacionesAbiertas}
          setNotificacionesAbiertas={setNotificacionesAbiertas}
          setNuevoMensajeModal={setNuevoMensajeModal}
          notificaciones={state.notificaciones || []}
          mensajes={mensajes}
          marcarComoLeida={state.marcarComoLeida}
          marcarTodasComoLeidas={state.marcarTodasComoLeidas}
          eliminarNotificacion={state.eliminarNotificacion}
          marcarMensajeLeido={marcarMensajeLeido}
          eliminarMensaje={eliminarMensaje}
          setConversacionActiva={setConversacionActiva}
          card={card}
          text={text}
          border={border}
        />

        <div className="p-6">{renderContent()}</div>
      </div>

      {/* Modales Globales */}
      {state.modalConfigCurso && (
        <ConfiguracionCursoModal
          curso={state.modalConfigCurso}
          isOpen={!!state.modalConfigCurso}
          onClose={() => setModalConfigCurso(null)}
          onSave={(config: any) => {
            console.log('Configuración guardada:', config);
            setModalConfigCurso(null);
          }}
          darkMode={darkMode}
          card={card}
          text={text}
          border={border}
        />
      )}

      <RevisionTareaModal
        tarea={tareaEnRevision}
        isOpen={!!tareaEnRevision}
        onClose={() => setTareaEnRevision(null)}
        onSaveGrade={calificarEntrega}
        darkMode={darkMode}
        card={card}
        text={text}
        border={border}
      />

      <PerfilEstudianteModal
        estudiante={estudianteDetalle}
        isOpen={!!estudianteDetalle}
        onClose={() => setEstudianteDetalle(null)}
        onEnviarMensaje={(id) => {
          setEstudianteDetalle(null);
          enviarMensajeEstudiante(id);
        }}
        onExportarDatos={(id) => {
          exportarDatosEstudiante(id);
        }}
        darkMode={darkMode}
        card={card}
        text={text}
        border={border}
      />

      <MensajeDetalleModal
        mensaje={conversacionActiva}
        isOpen={!!conversacionActiva}
        onClose={() => setConversacionActiva(null)}
        onMarcarLeido={marcarMensajeLeido}
        onEliminar={eliminarMensaje}
        onResponder={responderMensaje}
        onArchivar={archivarMensaje}
        onSiguiente={() => navegarMensaje('siguiente')}
        onAnterior={() => navegarMensaje('anterior')}
        hayMensajesAnteriores={hayAnteriores}
        hayMensajesSiguientes={haySiguientes}
        darkMode={darkMode}
        card={card}
        text={text}
        border={border}
      />

      <NuevoMensajeModal
        isOpen={nuevoMensajeModal}
        onClose={() => setNuevoMensajeModal(false)}
        onEnviar={(dest, asunto, mensaje, adj) => {
          enviarMensajeIndividual(dest, asunto, mensaje, adj);
          setNuevoMensajeModal(false);
        }}
        estudiantes={estudiantes}
        darkMode={darkMode}
        card={card}
        text={text}
        border={border}
      />
    </div>
  );
}
