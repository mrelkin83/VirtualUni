import React, { useEffect } from 'react';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { useAuthStore } from '../store/authStore';
import { StudentSidebar } from '../components/student/layout/StudentSidebar';
import { StudentHeader } from '../components/student/layout/StudentHeader';
import { InicioSection } from '../components/student/sections/InicioSection';
import { CursosSection } from '../components/student/sections/CursosSection';
import { TareasSection } from '../components/student/sections/TareasSection';
import { CalificacionesSection } from '../components/student/sections/CalificacionesSection';
import { MensajesSection } from '../components/student/sections/MensajesSection';
import { TramitesSection } from '../components/student/sections/TramitesSection';
import { PerfilSection } from '../components/student/sections/PerfilSection';
import { FinancieroSection } from '../components/student/sections/FinancieroSection';
import { BibliotecaSection } from '../components/student/sections/BibliotecaSection';
import { HorariosSection } from '../components/student/sections/HorariosSection';
import { CertificadosSection } from '../components/student/sections/CertificadosSection';
import { ClasesSection } from '../components/student/sections/ClasesSection';
import { ExamenesSection } from '../components/student/sections/ExamenesSection';
import { ComunidadYForosSection } from '../components/student/sections/ComunidadYForosSection';
import { NuevoMensajeModal } from '../components/student/modals/NuevoMensajeModal';
import { NotificacionesDropdown } from '../components/student/dropdowns/NotificacionesDropdown';
import { MensajesDropdown } from '../components/student/dropdowns/MensajesDropdown';

export default function StudentDashboard() {
  const { logout } = useAuthStore();
  const state = useStudentDashboard();

  const {
    activeSection,
    sidebarOpen,
    darkMode,
    mensajes,
    cursos,
    tareas,
    examenes,
    calificacionesData,
    cursoDetalle,
    temaSeleccionado,
    bloqueActivo,
    expandirIdeasClave,
    modalTarea,
    archivoTarea,
    comentarioTarea,
    anunciosData,
    tramitesData,
    tramitesDisponiblesData,
    modalTramite,
    tipoTramite,
    observacionesTramite,
    tiempoRestante,
    editandoPerfil,
    datosPerfil,
    historialPagosData,
    deudasPendientesData,
    resumenFinancieroData,
    librosData,
    prestamosData,
    reservasData,
    topicosData,
    respuestasData,
    clasesHorario,
    eventosHorario,
    certificadosData,
    solicitudesCertificadosData,
    bg,
    card,
    text,
    border,
    setSidebarOpen,
    setActiveSection,
    setDarkMode,
    setNotificacionesAbiertas,
    setNuevoMensajeModal,
    setCursoDetalle,
    setTemaSeleccionado,
    setBloqueActivo,
    setExpandirIdeasClave,
    setModalTarea,
    setArchivoTarea,
    setComentarioTarea,
    entregarTarea,
    setConversacionActiva,
    setModalTramite,
    setTipoTramite,
    setObservacionesTramite,
    setTramiteDetalle,
    enviarTramite,
    cancelarTramite,
    finalizarExamen,
    setTiempoRestante,
    setEditandoPerfil,
    setDatosPerfil,
    actualizarPerfil,
    solicitarPrestamo,
    devolverLibro,
    reservarLibro,
    crearTopico,
    crearRespuesta,
    solicitarCertificado,
    descargarCertificado,
    nuevoMensajeModal,
    mensajesAbiertas,
    setMensajesAbiertas,
    notificacionesAbiertas,
    notificaciones,
    enviarMensaje,
    verMensaje,
    marcarMensajeComoLeido,
    eliminarMensaje,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    fotoPerfil,
    subirFotoPerfil
  } = state;

  // Exam timer effect
  useEffect(() => {
    if (tiempoRestante && tiempoRestante > 0) {
      const timer = setTimeout(() => setTiempoRestante(tiempoRestante - 1), 1000);
      return () => clearTimeout(timer);
    } else if (tiempoRestante === 0) {
      finalizarExamen();
    }
  }, [tiempoRestante, finalizarExamen, setTiempoRestante]);

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <InicioSection
            cursos={cursos}
            tareas={tareas}
            anuncios={anunciosData}
            calificaciones={calificacionesData}
            clases={state.clases || []}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            setCursoDetalle={setCursoDetalle}
            setActiveSection={setActiveSection}
            unirseClase={state.unirseClase}
          />
        );

      case 'cursos':
        return (
          <CursosSection
            cursos={cursos}
            cursoDetalle={cursoDetalle}
            temaSeleccionado={temaSeleccionado}
            bloqueActivo={bloqueActivo}
            expandirIdeasClave={expandirIdeasClave}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            setCursoDetalle={setCursoDetalle}
            setTemaSeleccionado={setTemaSeleccionado}
            setBloqueActivo={setBloqueActivo}
            setExpandirIdeasClave={setExpandirIdeasClave}
            generarCertificadoCurso={state.generarCertificadoCurso}
          />
        );

      case 'tareas':
        return (
          <TareasSection
            tareas={tareas}
            modalTarea={modalTarea}
            archivoTarea={archivoTarea}
            comentarioTarea={comentarioTarea}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            setModalTarea={setModalTarea}
            setArchivoTarea={setArchivoTarea}
            setComentarioTarea={setComentarioTarea}
            entregarTarea={entregarTarea}
          />
        );

      case 'calificaciones':
        return (
          <CalificacionesSection
            calificaciones={calificacionesData}
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
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            setConversacionActiva={setConversacionActiva}
            setNuevoMensajeModal={setNuevoMensajeModal}
          />
        );

      case 'tramites':
        return (
          <TramitesSection
            tramites={tramitesData}
            tramitesDisponibles={tramitesDisponiblesData}
            modalTramite={modalTramite}
            tipoTramite={tipoTramite}
            observacionesTramite={observacionesTramite}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            setModalTramite={setModalTramite}
            setTipoTramite={setTipoTramite}
            setObservacionesTramite={setObservacionesTramite}
            setTramiteDetalle={setTramiteDetalle}
            enviarTramite={enviarTramite}
            cancelarTramite={cancelarTramite}
          />
        );

      case 'biblioteca':
        return (
          <BibliotecaSection
            libros={librosData}
            prestamos={prestamosData}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            solicitarPrestamo={solicitarPrestamo}
            devolverLibro={devolverLibro}
            reservarLibro={reservarLibro}
          />
        );

      case 'horarios':
        return (
          <HorariosSection
            clases={clasesHorario}
            eventos={eventosHorario}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );

      case 'certificados':
        return (
          <CertificadosSection
            certificadosDisponibles={certificadosData}
            solicitudes={solicitudesCertificadosData}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            solicitarCertificado={solicitarCertificado}
            descargarCertificado={descargarCertificado}
          />
        );

      case 'clases':
        return (
          <ClasesSection
            clases={state.clases || []}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            unirseClase={state.unirseClase}
            verGrabacion={state.verGrabacion}
          />
        );

      case 'examenes':
        return (
          <ExamenesSection
            examenes={state.examenesData || []}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            iniciarExamen={state.iniciarExamenNuevo}
            verResultados={state.verResultadosExamen}
          />
        );

      case 'comunidad':
        return (
          <ComunidadYForosSection
            // Props para Foros
            topicos={topicosData}
            respuestas={respuestasData}
            crearTopico={crearTopico}
            crearRespuesta={crearRespuesta}
            // Props para Comunidad
            posts={state.comunidadPosts || []}
            darLike={state.darLike}
            comentar={state.comentar}
            compartir={state.compartir}
            crearPost={state.crearPost}
            // Props comunes
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
          />
        );

      case 'financiero':
        return (
          <FinancieroSection
            historialPagos={historialPagosData}
            deudasPendientes={deudasPendientesData}
            resumen={resumenFinancieroData}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            realizarPago={state.realizarPago}
          />
        );

      case 'perfil':
        return (
          <PerfilSection
            datosPerfil={datosPerfil}
            editandoPerfil={editandoPerfil}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            fotoPerfil={fotoPerfil}
            setDatosPerfil={setDatosPerfil}
            setEditandoPerfil={setEditandoPerfil}
            actualizarPerfil={actualizarPerfil}
            subirFotoPerfil={subirFotoPerfil}
          />
        );

      default:
        return (
          <InicioSection
            cursos={cursos}
            tareas={tareas}
            anuncios={anunciosData}
            calificaciones={calificacionesData}
            clases={state.clases || []}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            setCursoDetalle={setCursoDetalle}
            setActiveSection={setActiveSection}
            unirseClase={state.unirseClase}
          />
        );
    }
  };

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      inicio: 'Dashboard',
      cursos: 'Mis Cursos',
      clases: 'Clases',
      tareas: 'Tareas',
      examenes: 'Exámenes',
      calificaciones: 'Calificaciones',
      mensajes: 'Mensajes',
      biblioteca: 'Biblioteca',
      foros: 'Foros',
      comunidad: 'Comunidad',
      horarios: 'Mi Horario',
      certificados: 'Certificados',
      tramites: 'Trámites',
      financiero: 'Estado de Cuenta',
      perfil: 'Mi Perfil'
    };
    return titles[activeSection] || 'Dashboard';
  };

  const mensajesNoLeidos = mensajes.filter(m => !m.leido).length;

  return (
    <div className={`flex h-screen ${bg}`}>
      <StudentSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mensajesNoLeidos={mensajesNoLeidos}
        onLogout={logout}
      />

      <div className="flex-1 overflow-y-auto">
        <StudentHeader
          title={getSectionTitle()}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setSidebarOpen={setSidebarOpen}
          setNotificacionesAbiertas={setNotificacionesAbiertas}
          setMensajesAbiertas={setMensajesAbiertas}
          setNuevoMensajeModal={setNuevoMensajeModal}
          mensajesNoLeidos={mensajesNoLeidos}
          notificacionesNoLeidas={notificaciones.filter(n => !n.leida).length}
          card={card}
          text={text}
        />

        <div className="p-6">{renderContent()}</div>
      </div>

      {/* Modals y Dropdowns */}
      <NuevoMensajeModal
        isOpen={nuevoMensajeModal}
        onClose={() => setNuevoMensajeModal(false)}
        darkMode={darkMode}
        card={card}
        text={text}
        border={border}
        enviarMensaje={enviarMensaje}
      />

      <NotificacionesDropdown
        isOpen={notificacionesAbiertas}
        onClose={() => setNotificacionesAbiertas(false)}
        notificaciones={notificaciones}
        darkMode={darkMode}
        card={card}
        text={text}
        border={border}
        marcarComoLeida={marcarComoLeida}
        marcarTodasComoLeidas={marcarTodasComoLeidas}
        eliminarNotificacion={eliminarNotificacion}
      />

      <MensajesDropdown
        isOpen={mensajesAbiertas}
        onClose={() => setMensajesAbiertas(false)}
        mensajes={mensajes}
        darkMode={darkMode}
        card={card}
        text={text}
        border={border}
        marcarComoLeido={marcarMensajeComoLeido}
        eliminarMensaje={eliminarMensaje}
        onVerMensaje={verMensaje}
        onNuevoMensaje={() => setNuevoMensajeModal(true)}
      />
    </div>
  );
}
