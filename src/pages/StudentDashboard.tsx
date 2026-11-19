import React, { useEffect } from 'react';
import { Bell, Mail, Moon, Sun } from 'lucide-react';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { useSeccionEnUrl } from '../hooks/useSeccionEnUrl';
import { AppShell } from '../components/layout/AppShell';
import { NAV_ESTUDIANTE, esSeccionEstudiante } from '../components/layout/navegacion';
import { IconButton } from '../components/ui/Button';
import { useTheme } from '../theme';
import type { StudentSectionType } from '../types/student.types';
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';
// StudentSidebar y StudentHeader quedan sin usar: los sustituye AppShell, que
// es común a los tres roles. Los archivos siguen ahí; se retiran cuando el
// docente y el administrador también hayan migrado.
import { InicioSection } from '../components/student/sections/InicioSection';
import { MiProgramaSection } from '../components/student/sections/MiProgramaSection';
import { CursosSection } from '../components/student/sections/CursosSection';
import { MaterialesSection } from '../components/student/sections/MaterialesSection';
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
import { RendirExamenSection } from '../components/student/sections/RendirExamenSection';
import { ComunidadYForosSection } from '../components/student/sections/ComunidadYForosSection';
import { NuevoMensajeModal } from '../components/student/modals/NuevoMensajeModal';
import { MensajeDetalleModal } from '../components/teacher/modals/MensajeDetalleModal';
import { NotificacionesDropdown } from '../components/student/dropdowns/NotificacionesDropdown';
import { MensajesDropdown } from '../components/student/dropdowns/MensajesDropdown';

export default function StudentDashboard() {
  const { logout } = useAuthStore();
  const tenant = useTenantStore((s) => s.tenant);
  const { resuelto, establecerTema } = useTheme();
  const state = useStudentDashboard();

  const {
    activeSection,
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
    // `bg` y el par sidebarOpen/setSidebarOpen ya no hacen falta: el fondo lo
    // pone AppShell con los tokens y el cajón móvil lo gestiona él.
    setActiveSection,
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
    conversacionActiva,
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

  // La sección vive en useState, así que la URL no cambiaba al navegar: no se
  // podían compartir enlaces y el botón «atrás» sacaba del portal. Esto la
  // mantiene en paralelo sin tocar cómo se pintan las secciones.
  useSeccionEnUrl<StudentSectionType>({
    base: '/estudiante',
    seccion: activeSection,
    setSeccion: setActiveSection,
    esValida: esSeccionEstudiante,
  });

  // Exam timer effect
  useEffect(() => {
    if (tiempoRestante && tiempoRestante > 0) {
      const timer = setTimeout(() => setTiempoRestante(tiempoRestante - 1), 1000);
      return () => clearTimeout(timer);
    } else if (tiempoRestante === 0) {
      finalizarExamen();
    }
  }, [tiempoRestante, finalizarExamen, setTiempoRestante]);

  // `conversacionActiva` puede venir de los datos de ejemplo (StudentMessage:
  // remitente/preview) o de la respuesta cruda del API (contenido/de); se
  // normaliza a la forma que espera MensajeDetalleModal.
  const mensajeDetalle = conversacionActiva
    ? {
        id: conversacionActiva.id,
        de: conversacionActiva.remitente ?? conversacionActiva.de ?? 'Desconocido',
        para: conversacionActiva.para,
        asunto: conversacionActiva.asunto ?? '(sin asunto)',
        mensaje:
          conversacionActiva.mensaje ??
          conversacionActiva.contenido ??
          conversacionActiva.preview ??
          '',
        fecha: conversacionActiva.fecha ?? '',
        tipo: conversacionActiva.tipo ?? 'recibido',
        leido: conversacionActiva.leido,
      }
    : null;

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
            setCursoDetalle={setCursoDetalle}
            setActiveSection={setActiveSection}
            unirseClase={state.unirseClase}
          />
        );

      // Autónoma: trae sus propios datos, no pasa por el hook del panel
      case 'miprograma':
        return <MiProgramaSection />;

      case 'cursos':
        return (
          <CursosSection
            cursos={cursos}
            cursoDetalle={cursoDetalle}
            temaSeleccionado={temaSeleccionado}
            bloqueActivo={bloqueActivo}
            expandirIdeasClave={expandirIdeasClave}
            setCursoDetalle={setCursoDetalle}
            setTemaSeleccionado={setTemaSeleccionado}
            setBloqueActivo={setBloqueActivo}
            setExpandirIdeasClave={setExpandirIdeasClave}
            generarCertificadoCurso={state.generarCertificadoCurso}
          />
        );

      // Autónoma, igual que MiProgramaSection: pide GET /materials/my
      case 'materiales':
        return (
          <MaterialesSection />
        );

      case 'tareas':
        return (
          <TareasSection
            tareas={tareas}
            modalTarea={modalTarea}
            archivoTarea={archivoTarea}
            comentarioTarea={comentarioTarea}
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
          />
        );

      case 'mensajes':
        return (
          <MensajesSection
            mensajes={mensajes}
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
          />
        );

      case 'certificados':
        return (
          <CertificadosSection
            certificadosDisponibles={certificadosData}
            solicitudes={solicitudesCertificadosData}
            solicitarCertificado={solicitarCertificado}
            descargarCertificado={descargarCertificado}
          />
        );

      case 'clases':
        return (
          <ClasesSection
            clases={state.clases || []}
            unirseClase={state.unirseClase}
            verGrabacion={state.verGrabacion}
          />
        );

      case 'examenes':
        // Mientras haya un examen en curso, esta sección muestra la pantalla
        // para rendirlo en lugar del listado. Antes no existía tal pantalla:
        // el intento se creaba en el servidor y el alumno se quedaba viendo
        // la misma lista.
        if (state.examenActivo) {
          return (
            <RendirExamenSection
              examen={state.examenActivo}
              respuestas={state.respuestasExamen}
              setRespuestas={state.setRespuestasExamen}
              preguntaActual={state.preguntaActual}
              setPreguntaActual={state.setPreguntaActual}
              tiempoRestante={state.tiempoRestante}
              finalizarExamen={state.finalizarExamen}
              abandonar={() => state.setExamenActivo(null)}
            />
          );
        }
        return (
          <ExamenesSection
            examenes={state.examenesData || []}
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
          />
        );

      case 'financiero':
        return (
          <FinancieroSection
            historialPagos={historialPagosData}
            deudasPendientes={deudasPendientesData}
            resumen={resumenFinancieroData}
            realizarPago={state.realizarPago}
          />
        );

      case 'perfil':
        return (
          <PerfilSection
            datosPerfil={datosPerfil}
            editandoPerfil={editandoPerfil}
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
      miprograma: 'Mi Programa',
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
  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const alternarTema = () => establecerTema(resuelto === 'dark' ? 'light' : 'dark');

  return (
    <>
      <AppShell<StudentSectionType>
        grupos={NAV_ESTUDIANTE}
        seccionActiva={activeSection}
        onCambiarSeccion={setActiveSection}
        titulo={getSectionTitle()}
        marca={tenant?.name ?? 'VirtualUni'}
        subtitulo="Portal del estudiante"
        logo={tenant?.logo}
        contadores={{ mensajes: mensajesNoLeidos }}
        onSalir={logout}
        accionesCabecera={
          <>
            <IconButton
              icono={resuelto === 'dark' ? Sun : Moon}
              etiqueta={resuelto === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
              onClick={alternarTema}
            />

            <span className="relative inline-flex">
              <IconButton
                icono={Mail}
                etiqueta="Mensajes"
                onClick={() => setMensajesAbiertas(true)}
              />
              {mensajesNoLeidos > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-[17px] rounded-full bg-pn-accent px-1 text-center font-mono text-[10px] font-semibold leading-[17px] text-pn-accent-ink">
                  {mensajesNoLeidos > 99 ? '99+' : mensajesNoLeidos}
                  <span className="sr-only"> mensajes sin leer</span>
                </span>
              )}
            </span>

            <span className="relative inline-flex">
              <IconButton
                icono={Bell}
                etiqueta="Notificaciones"
                onClick={() => setNotificacionesAbiertas(true)}
              />
              {notificacionesNoLeidas > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-[17px] rounded-full bg-pn-danger px-1 text-center font-mono text-[10px] font-semibold leading-[17px] text-pn-surface">
                  {notificacionesNoLeidas > 99 ? '99+' : notificacionesNoLeidas}
                  <span className="sr-only"> notificaciones sin leer</span>
                </span>
              )}
            </span>
          </>
        }
      >
        {renderContent()}
      </AppShell>

      {/* Modals y Dropdowns */}
      <NuevoMensajeModal
        isOpen={nuevoMensajeModal}
        onClose={() => setNuevoMensajeModal(false)}
        enviarMensaje={enviarMensaje}
      />

      <NotificacionesDropdown
        isOpen={notificacionesAbiertas}
        onClose={() => setNotificacionesAbiertas(false)}
        notificaciones={notificaciones}
        marcarComoLeida={marcarComoLeida}
        marcarTodasComoLeidas={marcarTodasComoLeidas}
        eliminarNotificacion={eliminarNotificacion}
      />

      <MensajesDropdown
        isOpen={mensajesAbiertas}
        onClose={() => setMensajesAbiertas(false)}
        mensajes={mensajes}
        marcarComoLeido={marcarMensajeComoLeido}
        eliminarMensaje={eliminarMensaje}
        onVerMensaje={verMensaje}
        onNuevoMensaje={() => setNuevoMensajeModal(true)}
      />

      <MensajeDetalleModal
        mensaje={mensajeDetalle}
        isOpen={!!conversacionActiva}
        onClose={() => setConversacionActiva(null)}
        onMarcarLeido={(id) => marcarMensajeComoLeido(id)}
        onEliminar={(id) => {
          eliminarMensaje(id);
          setConversacionActiva(null);
        }}
        onResponder={(_id, respuesta) =>
          enviarMensaje(mensajeDetalle?.de || '', `Re: ${mensajeDetalle?.asunto || ''}`, respuesta)
        }
      />
    </>
  );
}
