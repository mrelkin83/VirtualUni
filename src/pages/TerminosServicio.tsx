import { LegalLayout } from '../components/legal/LegalLayout';

/**
 * Borrador de términos de servicio. Los datos entre corchetes son
 * placeholders a completar con la información real de la empresa; conviene
 * revisión legal antes de usarlo con instituciones reales.
 */
export default function TerminosServicio() {
  return (
    <LegalLayout titulo="Términos de Servicio" actualizado="25 de agosto de 2026">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Aceptación</h2>
        <p>
          Estos términos rigen el uso de VirtualUni, una plataforma educativa ofrecida por{' '}
          <strong>[NOMBRE LEGAL DE LA EMPRESA]</strong> (NIT <strong>[NIT]</strong>). Al crear una
          cuenta o usar la plataforma, aceptas estos términos. Si actúas en representación de una
          institución educativa, declaras tener autorización para contratar el servicio en su
          nombre.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Qué es el servicio</h2>
        <p>
          VirtualUni es una plataforma de gestión educativa (cursos, calificaciones, asistencia,
          mensajería, biblioteca, carnetización, trámites administrativos y facturación) que se
          contrata por institución. Cada institución (un "tenant") administra sus propios
          estudiantes, docentes y personal administrativo dentro de un espacio aislado del de
          otras instituciones.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Planes y precios</h2>
        <p>
          Ofrecemos los planes Free, Basic, Professional y Enterprise, con límites de estudiantes,
          docentes, cursos y almacenamiento según el plan (ver <code>/billing/plans</code> para el
          detalle vigente). Los precios se muestran y cobran en pesos colombianos (COP).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Pagos y renovación</h2>
        <p>
          Los pagos se procesan a través de <strong>Wompi</strong>. Cada pago cubre un periodo de
          un mes desde su aprobación. <strong>La renovación no es automática</strong>: la
          institución debe volver a pagar antes de que termine el periodo vigente para seguir
          disfrutando de un plan pago; si no renueva, el plan vuelve a las condiciones del plan
          Free al finalizar el periodo. No fraccionamos ni reembolsamos periodos ya pagados, salvo
          que la ley aplicable lo exija.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Responsabilidades de la institución</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cargar información veraz sobre sus estudiantes, docentes y administrativos.</li>
          <li>Contar con la autorización necesaria para tratar los datos de sus estudiantes (incluyendo menores de edad) conforme a la <a href="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</a>.</li>
          <li>Administrar el acceso de sus propios usuarios (crear, desactivar y asignar roles correctamente).</li>
          <li>Mantener la confidencialidad de las credenciales de sus administradores.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Uso aceptable</h2>
        <p>No está permitido usar VirtualUni para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Intentar vulnerar la seguridad de la plataforma o acceder a datos de otra institución.</li>
          <li>Subir contenido ilegal, difamatorio o que infrinja derechos de terceros.</li>
          <li>Usar el servicio para fines distintos a la gestión educativa de la institución contratante.</li>
        </ul>
        <p>Podemos suspender cuentas que incumplan esto, notificando a la institución cuando sea razonablemente posible.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Propiedad intelectual</h2>
        <p>
          El contenido académico que una institución carga (materiales, exámenes, calificaciones)
          sigue siendo propiedad de esa institución o de sus autores. VirtualUni y su
          funcionamiento como software son propiedad de{' '}
          <strong>[NOMBRE LEGAL DE LA EMPRESA]</strong>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Disponibilidad del servicio</h2>
        <p>
          Nos esforzamos por mantener la plataforma disponible de forma continua, pero no
          garantizamos un porcentaje específico de disponibilidad salvo que se pacte por escrito
          en un acuerdo de nivel de servicio (SLA) aparte. Podemos realizar mantenimientos
          programados, que intentaremos avisar con antelación razonable.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Suspensión y terminación</h2>
        <p>
          Podemos suspender el acceso de una institución por falta de pago (al vencer el periodo
          pagado, según la sección 4) o por incumplimiento grave de estos términos. La institución
          puede dejar de renovar su plan en cualquier momento para terminar la relación; sus datos
          se manejan conforme a la sección 7 de la Política de Privacidad tras la terminación.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Limitación de responsabilidad</h2>
        <p>
          En la medida permitida por la ley, VirtualUni no será responsable por daños indirectos,
          lucro cesante, o pérdida de datos causada por un uso indebido de la plataforma por parte
          de la institución o sus usuarios. Nada en esta sección limita responsabilidades que no
          puedan excluirse por ley.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">11. Cambios a estos términos</h2>
        <p>
          Podemos actualizar estos términos; publicaremos la versión vigente en esta página con su
          fecha de actualización. El uso continuado del servicio tras un cambio implica su
          aceptación.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">12. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Cualquier
          controversia se someterá a los jueces competentes de <strong>[CIUDAD]</strong>, Colombia,
          salvo que la ley disponga un fuero distinto de forma imperativa.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">13. Contacto</h2>
        <p>Para preguntas sobre estos términos: <strong>[CORREO DE CONTACTO]</strong>.</p>
      </section>
    </LegalLayout>
  );
}
