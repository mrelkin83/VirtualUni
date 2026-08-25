import { LegalLayout } from '../components/legal/LegalLayout';

/**
 * Borrador de política de privacidad. Los datos marcados entre corchetes
 * ([ENTRE CORCHETES]) son placeholders: hay que reemplazarlos por los datos
 * reales de la empresa/entidad que opera VirtualUni antes de publicarla, y
 * conviene que un abogado la revise antes de usarla con instituciones
 * reales — esto es un punto de partida serio, no una versión final.
 */
export default function PoliticaPrivacidad() {
  return (
    <LegalLayout titulo="Política de Privacidad" actualizado="25 de agosto de 2026">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Quién trata tus datos</h2>
        <p>
          VirtualUni es operada por <strong>[NOMBRE LEGAL DE LA EMPRESA]</strong>, identificada con
          NIT <strong>[NIT]</strong>, con domicilio en <strong>[CIUDAD, PAÍS]</strong> (en
          adelante, "VirtualUni" o "nosotros"). Esta política aplica al tratamiento de los datos
          personales de estudiantes, docentes y administradores de las instituciones educativas
          que usan la plataforma.
        </p>
        <p>
          Cada institución educativa que contrata VirtualUni (un "tenant") es responsable de los
          datos que carga sobre sus propios estudiantes y docentes; VirtualUni actúa como
          encargado del tratamiento de esos datos en nombre de la institución, además de
          responsable de los datos de las cuentas de administración de cada institución.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Qué datos recogemos</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Identificación:</strong> nombre completo, correo electrónico, número de documento de identidad, fotografía (para carnetización).</li>
          <li><strong>Académicos:</strong> cursos matriculados, calificaciones, asistencia, entregas de tareas, resultados de exámenes, certificados emitidos.</li>
          <li><strong>De uso de la plataforma:</strong> mensajes internos, publicaciones en foros y comunidad, historial de inicio de sesión, preferencias de la cuenta.</li>
          <li><strong>Financieros (sólo administradores de la institución):</strong> historial de pagos del plan contratado, procesados por Wompi — VirtualUni no almacena números de tarjeta ni credenciales bancarias.</li>
          <li><strong>De empleados (para instituciones que usan los módulos de RRHH/nómina):</strong> datos laborales y de nómina del personal administrativo, cargados y administrados por la propia institución.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Para qué usamos tus datos</h2>
        <p>Los datos se usan exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Prestar el servicio educativo: matrícula, calificación, asistencia, comunicación entre estudiantes y docentes.</li>
          <li>Generar carnés estudiantiles/docentes y certificados académicos.</li>
          <li>Procesar el pago de la suscripción de la institución a través de Wompi.</li>
          <li>Enviar notificaciones operativas de la plataforma (mensajes, tareas, cambios de estado).</li>
          <li>Cumplir obligaciones legales aplicables a instituciones educativas.</li>
        </ul>
        <p>No usamos los datos de estudiantes ni docentes con fines publicitarios, ni los vendemos a terceros.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Con quién compartimos tus datos</h2>
        <p>
          Sólo compartimos datos con terceros cuando es estrictamente necesario para operar el
          servicio:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Wompi</strong> (pasarela de pagos), para procesar el cobro de la suscripción de la institución. Wompi trata esos datos bajo su propia política de privacidad.</li>
          <li><strong>Proveedor de infraestructura/hosting</strong> ([NOMBRE DEL PROVEEDOR]), donde se almacenan los datos de forma cifrada.</li>
        </ul>
        <p>No compartimos datos con anunciantes ni los usamos para entrenar modelos de terceros ajenos a la operación del servicio.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Menores de edad</h2>
        <p>
          Cuando un estudiante es menor de edad, el tratamiento de sus datos se realiza bajo la
          autorización de la institución educativa en representación de los padres o acudientes,
          conforme al artículo 7 de la Ley 1581 de 2012. La institución es responsable de contar
          con esa autorización antes de matricular al estudiante en la plataforma.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Tus derechos (Ley 1581 de 2012 — Habeas Data)</h2>
        <p>Como titular de tus datos personales, en Colombia tienes derecho a:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Solicitar prueba de la autorización otorgada para el tratamiento.</li>
          <li>Ser informado sobre el uso que se le ha dado a tus datos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
          <li>Revocar la autorización y/o solicitar la supresión de tus datos, cuando no exista un deber legal o contractual de conservarlos.</li>
          <li>Acceder de forma gratuita a tus datos personales.</li>
        </ul>
        <p>
          Para ejercer estos derechos, escribe a <strong>[CORREO DE CONTACTO PARA DATOS]</strong>.
          Si eres estudiante o docente, también puedes solicitarlo a través del administrador de tu
          institución.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Cuánto tiempo conservamos tus datos</h2>
        <p>
          Conservamos los datos académicos mientras dure la relación del estudiante o docente con
          la institución y por el tiempo adicional que exija la normativa educativa aplicable.
          Cuando una institución cancela su suscripción, sus datos se conservan hasta
          <strong> [PERIODO, ej. 90 días]</strong> por si desea reactivar el servicio, y luego se
          eliminan de forma permanente, salvo obligación legal de conservarlos por más tiempo.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Seguridad</h2>
        <p>
          Protegemos tus datos con medidas técnicas razonables: acceso restringido por rol
          (estudiante, docente, administrador), cifrado de la conexión entre tu navegador y
          nuestros servidores, y contraseñas almacenadas de forma irreversible (nunca en texto
          plano). Ningún sistema es invulnerable; si detectamos un incidente que comprometa tus
          datos, lo notificaremos conforme a la ley aplicable.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política cuando cambie la forma en que tratamos los datos.
          Publicaremos la versión vigente en esta misma página con la fecha de la última
          actualización.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Contacto</h2>
        <p>
          Para preguntas sobre esta política o el tratamiento de tus datos:{' '}
          <strong>[CORREO DE CONTACTO]</strong>.
        </p>
      </section>
    </LegalLayout>
  );
}
