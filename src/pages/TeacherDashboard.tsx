import React from 'react';
import { Bell, Mail, Moon, Sun } from 'lucide-react';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { useSeccionEnUrl } from '../hooks/useSeccionEnUrl';
import { AppShell } from '../components/layout/AppShell';
import { NAV_DOCENTE, esSeccionDocente } from '../components/layout/navegacion';
import { IconButton } from '../components/ui/Button';
import { NotificacionesDropdown } from '../components/teacher/dropdowns/NotificacionesDropdown';
import { MensajesDropdown } from '../components/teacher/dropdowns/MensajesDropdown';
import { useTheme } from '../theme';
import type { SectionType } from '../types/teacher.types';
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';
// TeacherSidebar y TeacherHeader quedan sin usar: los sustituye AppShell, que
// es común a los tres roles. Los archivos siguen ahí hasta que el
// administrador también haya migrado.
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
import { coursesAdminApi } from '../api/endpoints/courses';
import { avisar } from '../components/ui';

export default function TeacherDashboard() {
  const { logout } = useAuthStore();
  const tenant = useTenantStore((s) => s.tenant);
  const { resuelto, establecerTema } = useTheme();
  // Vivía dentro de TeacherHeader; al pasar las acciones a la cabecera de
  // AppShell, el estado sube aquí.
  const [mensajesAbiertas, setMensajesAbiertas] = React.useState(false);
  const state = useTeacherDashboard();

  const {
    activeSection,
    cursos,
    estudiantes,
    tareas,
    examenes,
    modulosCurso,
    mensajes,
    // `bg` y sidebarOpen/setSidebarOpen ya no hacen falta: el fondo lo pone
    // AppShell con los tokens y el cajón móvil lo gestiona él.
    cursoDetalle,
    tareaEnRevision,
    estudianteDetalle,
    setActiveSection,
    setNotificacionesAbiertas,
    setNuevoMensajeModal,
    setCursoDetalle,
    setCursos,
    setEstudianteDetalle,
    setTareaEnRevision,
    setModalConfigCurso,
    setConversacionActiva,
    setCrearTareaModal,
    calificarEntrega,
    abrirRevisionTarea,
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

  // Mantiene /docente/<seccion> en la barra de direcciones. Ver el hook: la
  // sección sigue siendo useState, aquí solo se refleja.
  useSeccionEnUrl<SectionType>({
    base: '/docente',
    seccion: activeSection,
    setSeccion: setActiveSection,
    esValida: esSeccionDocente,
  });

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
            setTareaEnRevision={abrirRevisionTarea}
            setActiveSection={setActiveSection}
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
          />
        );
      case 'tareas':
        return (
          <TareasSection
            tareas={tareas}
            setTareaEnRevision={abrirRevisionTarea}
            setCrearTareaModal={setCrearTareaModal}
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
          />
        );
      case 'asistencia':
        return (
          <AsistenciaSection
            estudiantes={estudiantes}
            cursos={cursos}
          />
        );
      case 'mensajes':
        return (
          <MensajesSection
            mensajes={mensajes}
            cursos={cursos}
            setConversacionActiva={setConversacionActiva}
            setNuevoMensajeModal={setNuevoMensajeModal}
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
          />
        );
      case 'configuracion':
        return (
          <ConfiguracionSection
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
            setTareaEnRevision={abrirRevisionTarea}
            setActiveSection={setActiveSection}
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

  const mensajesNoLeidos = (mensajes || []).filter((m: any) => !m.leido).length;
  const notificacionesNoLeidas = (state.notificaciones || []).filter(
    (n: any) => !n.leida,
  ).length;

  const alternarTema = () => establecerTema(resuelto === 'dark' ? 'light' : 'dark');

  return (
    <>
      <AppShell<SectionType>
        grupos={NAV_DOCENTE}
        seccionActiva={activeSection}
        onCambiarSeccion={setActiveSection}
        titulo={getSectionTitle()}
        marca={tenant?.name ?? 'VirtualUni'}
        subtitulo="Panel docente"
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

            {/* `relative` ancla el desplegable justo debajo de su botón. */}
            <span className="relative inline-flex">
              <IconButton
                icono={Mail}
                etiqueta="Mensajes"
                onClick={() => setMensajesAbiertas(!mensajesAbiertas)}
              />
              {mensajesNoLeidos > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-[17px] rounded-full bg-pn-accent-2 px-1 text-center font-mono text-[10px] font-semibold leading-[17px] text-pn-accent-2-ink">
                  {mensajesNoLeidos > 99 ? '99+' : mensajesNoLeidos}
                  <span className="sr-only"> mensajes sin leer</span>
                </span>
              )}
              {/* Los dos `as` no son pereza: TeacherHeader declaraba estas
                  props como `any[]` y `(id, leido?) => void`, así que pasaba
                  exactamente los mismos datos al desplegable sin que el
                  compilador pudiera verlo. Al sacar las acciones de ahí el
                  desajuste queda a la vista: los mensajes de ejemplo no traen
                  `remitente` y marcarMensajeLeido pide dos argumentos. Es
                  deuda previa, de datos, no de presentación; se arregla al
                  unificar la forma de Mensaje, no aquí. */}
              <MensajesDropdown
                isOpen={mensajesAbiertas}
                onClose={() => setMensajesAbiertas(false)}
                mensajes={mensajes as unknown as React.ComponentProps<typeof MensajesDropdown>['mensajes']}
                marcarComoLeido={(id: number) => marcarMensajeLeido(id, true)}
                eliminarMensaje={eliminarMensaje}
                onVerMensaje={(mensaje: any) => {
                  setMensajesAbiertas(false);
                  setConversacionActiva(mensaje);
                }}
              />
            </span>

            <span className="relative inline-flex">
              <IconButton
                icono={Bell}
                etiqueta="Notificaciones"
                onClick={() =>
                  setNotificacionesAbiertas(!state.notificacionesAbiertas)
                }
              />
              {notificacionesNoLeidas > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-[17px] rounded-full bg-pn-danger px-1 text-center font-mono text-[10px] font-semibold leading-[17px] text-pn-surface">
                  {notificacionesNoLeidas > 99 ? '99+' : notificacionesNoLeidas}
                  <span className="sr-only"> notificaciones sin leer</span>
                </span>
              )}
              <NotificacionesDropdown
                isOpen={state.notificacionesAbiertas}
                onClose={() => setNotificacionesAbiertas(false)}
                notificaciones={state.notificaciones || []}
                marcarComoLeida={state.marcarComoLeida}
                marcarTodasComoLeidas={state.marcarTodasComoLeidas}
                eliminarNotificacion={state.eliminarNotificacion}
              />
            </span>
          </>
        }
      >
        {renderContent()}
      </AppShell>

      {/* Modales Globales */}
      {state.modalConfigCurso && (
        <ConfiguracionCursoModal
          curso={state.modalConfigCurso}
          isOpen={!!state.modalConfigCurso}
          onClose={() => setModalConfigCurso(null)}
          onSave={async (config: any) => {
            // El modelo Course del backend sólo persiste name/code/description
            // /credits/semester/color/status; el resto de campos del modal
            // (duración, cupo, modalidad, horario, prerequisitos, ...) no
            // tiene columna todavía y sólo se refleja en el estado local,
            // igual que el resto del panel cuando el servidor no cubre algo.
            setCursos(cursos.map((c: any) => (c.id === config.id ? { ...c, ...config } : c)));
            setCursoDetalle((prev: any) => (prev ? { ...prev, ...config } : prev));
            setModalConfigCurso(null);

            if (!config.id) return;
            try {
              await coursesAdminApi.update(String(config.id), {
                name: config.nombre,
                code: config.codigo,
                description: config.descripcion,
                credits: config.creditos,
              });
            } catch (err: any) {
              avisar.error('La configuración se guardó localmente pero no se pudo sincronizar con el servidor: ' + (err?.message || 'error de conexión'));
            }
          }}
        />
      )}

      <RevisionTareaModal
        tarea={tareaEnRevision}
        isOpen={!!tareaEnRevision}
        onClose={() => setTareaEnRevision(null)}
        onSaveGrade={calificarEntrega}
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
      />

      <NuevoMensajeModal
        isOpen={nuevoMensajeModal}
        onClose={() => setNuevoMensajeModal(false)}
        onEnviar={(dest, asunto, mensaje, adj) => {
          enviarMensajeIndividual(dest, asunto, mensaje, adj);
          setNuevoMensajeModal(false);
        }}
        estudiantes={estudiantes}
      />
    </>
  );
}
