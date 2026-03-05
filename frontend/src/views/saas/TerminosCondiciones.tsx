/**
 * Términos y Condiciones del Servicio SaaS
 * Formato legal tradicional - Fondo blanco, letras negras, sin emojis
 */
export default function TerminosCondiciones() {
  const sections = [
    {
      id: "1",
      title: "1. Aceptación de los Términos",
      content: (
        <>
          <p>
            Al acceder y utilizar el servicio de gestión de negocios proporcionado por <strong>Zinnia</strong> (en adelante, el "Proveedor"),
            el Cliente (el negocio o entidad que contrata el Servicio) acepta quedar obligado por los presentes Términos y
            Condiciones de Uso del servicio <strong>Flow Manager</strong> (en adelante, "el Servicio").
          </p>
          <p>
            Si el Cliente no está de acuerdo con estos Términos, no debe utilizar el Servicio. El uso continuado
            del Servicio después de cualquier modificación constituirá la aceptación de dichos modificaciones.
          </p>
        </>
      ),
    },
    {
      id: "2",
      title: "2. Descripción del Servicio",
      content: (
        <>
          <p>
            <strong>Flow Manager</strong> es una plataforma de software como servicio (SaaS) proporcionada por <strong>Zinnia</strong>
            para la gestión integral de negocios, que incluye:
          </p>
          <ul>
            <li>Gestión de clientes y membresías</li>
            <li>Control de accesos y check-ins</li>
            <li>Gestión de pagos y suscripciones</li>
            <li>Planificación de rutinas y clases</li>
            <li>Reportes y estadísticas</li>
            <li>Configuración de personal y usuarios</li>
          </ul>
          <p className="mt-3">
            El Servicio se proporciona "tal cual", sin garantías de ningún tipo, expresas o implícitas.
          </p>
        </>
      ),
    },
    {
      id: "3",
      title: "3. Planes y Límites de Uso",
      content: (
        <>
          <p>
            Flow Manager ofrece <strong>4 planes de suscripción</strong> con límites y características específicas:
          </p>

          <h6 className="fw-bold mt-4">1. Plan Basic - $14.995 ARS/mes ($149.950 ARS/año)</h6>
          <p><strong>Ideal para:</strong> Negocios pequeños que están comenzando</p>
          <ul>
            <li><strong>Límite de clientes:</strong> 50 clientes activos máximos</li>
            <li><strong>Personal:</strong> 5 instructores/empleados</li>
            <li><strong>Salas:</strong> 2 salas de entrenamiento</li>
            <li><strong>Características:</strong> Rutinas personalizadas, sistema de check-in</li>
            <li><strong>No incluye:</strong> Evolución física, reportes avanzados, app personalizada, soporte prioritario, API, integraciones</li>
          </ul>

          <h6 className="fw-bold mt-4">2. Plan Standard - $29.990 ARS/mes ($299.900 ARS/año)</h6>
          <p><strong>Ideal para:</strong> Negocios en crecimiento</p>
          <ul>
            <li><strong>Límite de clientes:</strong> 200 clientes activos máximos</li>
            <li><strong>Personal:</strong> 15 instructores/empleados</li>
            <li><strong>Salas:</strong> 5 salas de entrenamiento</li>
            <li><strong>Características:</strong> Todo lo de Basic + evolución física, reportes avanzados, integraciones (MercadoPago)</li>
            <li><strong>No incluye:</strong> App personalizada, soporte prioritario, API</li>
          </ul>

          <h6 className="fw-bold mt-4">3. Plan Premium - $79.990 ARS/mes ($799.900 ARS/año)</h6>
          <p><strong>Ideal para:</strong> Negocios grandes</p>
          <ul>
            <li><strong>Límite de clientes:</strong> 500 clientes activos máximos</li>
            <li><strong>Personal:</strong> ILIMITADO</li>
            <li><strong>Salas:</strong> ILIMITADAS</li>
            <li><strong>Características:</strong> Todo lo de Standard + app personalizada (white-label), soporte prioritario, integraciones</li>
            <li><strong>No incluye:</strong> Acceso a API</li>
          </ul>

          <h6 className="fw-bold mt-4">4. Plan Enterprise - $199.990 ARS/mes ($1.999.900 ARS/año)</h6>
          <p><strong>Ideal para:</strong> Grandes cadenas de negocios</p>
          <ul>
            <li><strong>Límite de clientes:</strong> ILIMITADOS</li>
            <li><strong>Personal:</strong> ILIMITADO</li>
            <li><strong>Salas:</strong> ILIMITADAS</li>
            <li><strong>Características:</strong> Todo lo de Premium + acceso a API completa, soporte VIP, integraciones avanzadas</li>
          </ul>

          <div className="alert alert-warning mt-3">
            <strong>Importante:</strong> El Cliente es responsable de monitorear su uso y asegurarse de no exceder
            los límites de su plan. Los clientes dados de baja (estado "inactivo") se mantienen en el historial
            pero <strong>no cuentan</strong> hacia el límite del plan. Más información en <strong>www.zinnia-code.com</strong>.
          </div>
        </>
      ),
    },
    {
      id: "4",
      title: "4. Cambios de Plan - Subir de Nivel",
      content: (
        <>
          <p>
            <strong>El Cliente puede solicitar subir de plan en cualquier momento.</strong>
          </p>
          <p>
            El cambio solicitado <strong>NO es inmediato</strong>. El nuevo plan se activará automáticamente
            el <strong>primer día del siguiente mes</strong> de facturación.
          </p>
          <p>
            <strong>Sin prorrateo:</strong> No se aplican ajustes prorrateados. El Cliente continuará con el plan actual
            hasta el último día del mes en curso y será cobrado el precio completo del nuevo plan a partir del día 1 del mes siguiente.
          </p>
          <div className="alert alert-info mt-3">
            <strong>Ejemplo:</strong> Si el Cliente solicita subir de plan el día 15 de marzo, el cambio se aplicará
            el 1 de abril. Seguirá pagando el plan actual durante todo marzo y el nuevo plan se cobrará a partir de abril.
          </div>
          <div className="alert alert-success mt-3">
            <strong>Sin restricciones:</strong> No hay límite de veces que el Cliente puede solicitar subir de plan.
          </div>
        </>
      ),
    },
    {
      id: "5",
      title: "5. Cambios de Plan - Bajar de Nivel",
      content: (
        <>
          <h6 className="fw-bold mt-3">Restricción Importante</h6>
          <div className="alert alert-danger">
            <strong>NO se permite solicitar bajar de plan si la cantidad actual de clientes activos supera el límite del plan inferior.</strong>
          </div>
          <p>
            <strong>Ejemplo:</strong> Si el negocio tiene <strong>500 clientes activos</strong> y desea cambiar al
            plan "Básico" que permite solo <strong>50 clientes</strong>, el sistema <strong>no permitirá</strong>
            la solicitud directa.
          </p>

          <h6 className="fw-bold mt-4">Fecha de Aplicación del Cambio</h6>
          <p>
            <strong>Cambio programado al inicio del mes:</strong> Al igual que al subir de plan, los cambios a un plan
            inferior <strong>NO son inmediatos</strong>. El nuevo plan se activará el <strong>primer día del siguiente mes</strong> de facturación.
          </p>
          <p>
            <strong>Sin prorrateo:</strong> No se aplican ajustes prorrateados. El Cliente continuará con el plan actual
            hasta el último día del mes en curso y el nuevo plan (inferior) se cobrará a partir del día 1 del mes siguiente.
          </p>
          <div className="alert alert-info mt-3">
            <strong>Ejemplo:</strong> Si el Cliente solicita bajar de plan el 20 de marzo, el cambio se aplicará
            el 1 de abril. Seguirá pagando el plan actual durante todo marzo y el plan inferior se cobrará a partir de abril.
          </div>

          <h6 className="fw-bold mt-4">Procedimiento para Solicitar Bajar de Plan</h6>
          <p>Para poder solicitar cambiar a un plan inferior, el Cliente debe:</p>
          <ol>
            <li>
              <strong>Dar de baja clientes excedentes:</strong> Acceder a la sección "Clientes" y cambiar el estado
              a "inactivo" de los clientes sobrantes hasta alcanzar el límite del nuevo plan deseado.
            </li>
            <li>
              <strong>Verificar el límite:</strong> Asegurarse de que el número de clientes activos sea igual o
              inferior al límite del plan inferior solicitado.
            </li>
            <li>
              <strong>Solicitar el cambio:</strong> Una vez cumplido el requisito anterior, el Cliente podrá
              solicitar el cambio de plan desde la sección "Configuración SaaS &gt; Cambiar Plan".
            </li>
            <li>
              <strong>Confirmar la fecha:</strong> El sistema mostrará la fecha en que se aplicará el cambio
              (primer día del mes siguiente).
            </li>
          </ol>

          <h6 className="fw-bold mt-4">Política de Datos Históricos</h6>
          <p>
            Los clientes dados de baja <strong>NO se eliminan</strong> de la base de datos. Se mantienen en el
            sistema con estado "inactivo" para preservar el historial de:
          </p>
          <ul>
            <li>Pagos realizados</li>
            <li>Asistencias registradas</li>
            <li>Actividades asignadas</li>
            <li>Evolución</li>
            <li>Historial de comunicaciones</li>
          </ul>
          <p className="mt-3">
            El Cliente puede reactivar clientes en cualquier momento, siempre que no supere el límite de su plan actual.
            Si al reactivar se excede el límite, deberá subir de plan o dar de baja otros clientes.
          </p>

          <h6 className="fw-bold mt-4">Prohibición de Abuso</h6>
          <div className="alert alert-warning">
            <p className="mb-0">
              <strong>Está expresamente prohibido:</strong> Contratar un plan superior para cargar masivamente
              datos de clientes y posteriormente bajar a un plan inferior intentando mantener dicha capacidad.
            </p>
          </div>
          <p className="mt-3"><strong>Sanciones por abuso:</strong> Zinnia se reserva el derecho de suspender
          o cancelar cuentas que intenten eludir los límites del plan.</p>
        </>
      ),
    },
    {
      id: "6",
      title: "6. Obligaciones del Cliente",
      content: (
        <>
          <p>El Cliente se compromete a:</p>
          <ul>
            <li>Proporcionar información veraz y actualizada en todo momento</li>
            <li>Mantener la confidencialidad de sus credenciales de acceso</li>
            <li>No compartir su cuenta con terceros</li>
            <li>Utilizar el Servicio únicamente para fines legales</li>
            <li>No intentar interferir con el funcionamiento del Servicio</li>
            <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
          </ul>
          <div className="alert alert-warning mt-3">
            <strong>Incumplimiento:</strong> El incumplimiento de estas obligaciones podrá dar lugar a la
            suspensión o cancelación inmediata del Servicio por parte de <strong>Zinnia</strong>.
          </div>
        </>
      ),
    },
    {
      id: "7",
      title: "7. Propiedad Intelectual",
      content: (
        <>
          <p><strong>Derechos del Proveedor:</strong> Zinnia y sus licenciantes son titulares exclusivos de todos
          los derechos, títulos e intereses sobre el Servicio, incluyendo el software, la tecnología, los
          diseños, las marcas y demás contenido.</p>
          <p><strong>Licencia otorgada al Cliente:</strong> Zinnia otorga al Cliente una licencia limitada,
          no exclusiva, intransferible y revocable para utilizar el Servicio exclusivamente para su uso interno
          en el marco de la relación contractual.</p>
          <p><strong>Restricciones:</strong> El Cliente no podrá:</p>
          <ul>
            <li>Copiar, modificar o crear obras derivadas del Servicio</li>
            <li>Reverse engineer, desensamblar o intentar obtener el código fuente</li>
            <li>Vender, revender, alquilar o sublicenciar el Servicio</li>
            <li>Utilizar el Servicio para competir con Zinnia</li>
          </ul>
          <p><strong>Datos del Cliente:</strong> El Cliente conserva la propiedad de todos los datos que carga en la
          plataforma y otorga a Zinnia una licencia para utilizar dichos datos únicamente para prestar el Servicio.</p>
        </>
      ),
    },
    {
      id: "8",
      title: "8. Protección de Datos Personales y Derechos ARCO",
      content: (
        <>
          <p><strong>Zinnia</strong> cumple con la Ley 25.326 de Protección de Datos Personales y normativa vigente.</p>
          <h6 className="fw-bold mt-3">Derechos ARCO del Titular</h6>
          <p>Según la Ley 25.326, el titular de los datos personales tiene los siguientes derechos:</p>
          <ul>
            <li><strong>Derecho de Acceso:</strong> Conocer qué datos personales tenemos y para qué se utilizan</li>
            <li><strong>Derecho de Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos</li>
            <li><strong>Derecho de Cancelación (Supresión):</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios</li>
            <li><strong>Derecho de Oposición:</strong> Oponerse al tratamiento de sus datos por motivos legítimos</li>
            <li><strong>Derecho de Portabilidad:</strong> Recibir sus datos en un formato estructurado de uso común</li>
          </ul>
          <h6 className="fw-bold mt-3">Procedimiento para Ejercer Derechos</h6>
          <p>El titular puede ejercer sus derechos desde
          la sección "Configuración SaaS &gt; Solicitar Eliminación de Cuenta".</p>
          <p><strong>Plazo de respuesta:</strong> Zinnia responderá dentro de los 15 días hábiles según lo establece
          la Ley 25.326. En caso de denegatoria, se fundamentarán las razones.</p>
        </>
      ),
    },
    {
      id: "9",
      title: "9. Renovación Automática de Planes",
      content: (
        <>
          <p><strong>Periodo de facturación:</strong> Mensual. Los planes se renuevan automáticamente al finalizar
          cada período de facturación.</p>
          <p><strong>Renovación automática:</strong> El Cliente autoriza a Zinnia a cargar automáticamente el
          monto correspondiente a su plan seleccionado mediante el método de pago registrado.</p>
          <p><strong>Notificación previa:</strong> El Cliente será notificado por email con al menos 7 días de antelación
          antes de cada renovación.</p>
          <p><strong>Si el pago falla:</strong> Zinnia intentará procesar el pago nuevamente durante los próximos 7 días.
          Si persiste el fallo, el Servicio podrá ser suspendido hasta regularizar la situación.</p>
          <p><strong>Actualizaciones de plan:</strong> El Cliente puede cambiar o cancelar su plan en cualquier momento
          desde la sección "Configuración SaaS &gt; Cambiar Plan". Los cambios se aplican al siguiente período de facturación.</p>
          <p className="mt-3"><strong>Información adicional:</strong> Visita <strong>www.zinnia-code.com</strong> para más información sobre nuestros planes y servicios.</p>
        </>
      ),
    },
    {
      id: "10",
      title: "10. Período de Prueba (Trial)",
      content: (
        <>
          <p><strong>Duración del trial:</strong> 14 días gratuitos desde el registro</p>
          <p><strong>Funcionalidades incluidas:</strong> Acceso completo a todas las funcionalidades del plan seleccionado</p>
          <p><strong>Limitaciones:</strong> No hay límite de clientes durante el período de prueba</p>
          <p><strong>Requiere datos de pago:</strong> No. Se requiere agregar un método de pago al finalizar el trial</p>
          <p><strong>Al finalizar el trial:</strong> Si no se agrega un método de pago, la cuenta será suspendida
          pero los datos serán conservados por 30 días antes de proceder a su eliminación.</p>
          <p><strong>Cancelación durante el trial:</strong> El Cliente puede cancelar en cualquier momento durante los
          14 días sin incurrir en ningún cargo.</p>
        </>
      ),
    },
    {
      id: "11",
      title: "11. Pagos y Facturación",
      content: (
        <>
          <p><strong>Métodos de pago aceptados:</strong> Tarjetas de crédito, débito y MercadoPago</p>
          <p><strong>Facturación:</strong> Las facturas electrónicas serán generadas automáticamente y estarán
          disponibles en la sección "Finanzas &gt; Facturas" del panel de administración.</p>
          <p><strong>Comprobantes:</strong> Se emitirá factura electrónica "A" o "B" según corresponda a la situación fiscal
          del Cliente.</p>
          <p><strong>Impuestos:</strong> Todos los precios incluyen impuestos según la legislación vigente en Argentina.</p>
          <p><strong>Política de precios:</strong> Zinnia se reserva el derecho de modificar los precios en cualquier momento.
          Los cambios serán notificados con al menos 30 días de antelación y se aplicarán al siguiente período de facturación.</p>
          <p><strong>Devoluciones:</strong> No se realizan devoluciones parciales de períodos ya facturados. En caso de
          cancelación, el Servicio permanecerá activo hasta el final del período facturado.</p>
        </>
      ),
    },
    {
      id: "12",
      title: "12. Cancelación del Servicio",
      content: (
        <>
          <p><strong>Preaviso requerido:</strong> No se requiere preaviso para cancelar el Servicio. El Cliente puede
          cancelar en cualquier momento desde el panel de administración.</p>
          <p><strong>Método para solicitar cancelación:</strong> Desde
          "Configuración SaaS &gt; Cancelar Servicio".</p>
          <p><strong>Efecto de la cancelación:</strong> El Servicio será suspendido inmediatamente y el acceso al panel
          será revocado al finalizar el período de facturación vigente.</p>
          <p><strong>Reembolsos:</strong> No se otorgan reembolsos por períodos no utilizados.</p>
          <p><strong>Exportación de datos:</strong> Antes de cancelar, el Cliente puede exportar todos sus datos desde
          la sección "Finanzas &gt; Exportar Datos". Zinnia proporcionará los datos en formato CSV dentro de las
          24 horas siguientes.</p>
          <p><strong>Conservación de datos:</strong> Post cancelación, los datos serán eliminados definitivamente después
          de 30 días, excepto aquellos que deban conservarse por obligaciones legales (ej: registros fiscales por 10 años).</p>
        </>
      ),
    },
    {
      id: "13",
      title: "13. Limitación de Responsabilidad",
      content: (
        <>
          <p><strong>Responsabilidad máxima:</strong> En ningún caso Zinnia será responsable por daños indirectos,
          incidentales, especiales o consecuentes, incluyendo pero no limitado a pérdida de ganancias, pérdida
          de datos, interrupción del negocio, o cualquier otro daño comercial.</p>
          <p><strong>Exclusiones de responsabilidad:</strong> Flow Manager no será responsable por:</p>
          <ul>
            <li>Fallas en el servicio causadas por problemas de internet, infraestructura del Cliente o terceros</li>
            <li>Pérdida de datos resultante de acciones del Cliente o terceros</li>
            <li>Daños causados por virus u otros componentes dañinos que lleguen al sistema del Cliente</li>
            <li>Indisponibilidad temporal del Servicio por mantenimiento o actualizaciones</li>
          </ul>
          <p><strong>Pérdida de datos:</strong> Zinnia realiza backups diarios de los datos, pero no garantiza la
          recuperación total en caso de pérdida de datos. El Cliente es responsable de realizar sus propias copias
          de seguridad.</p>
          <p><strong>Daños indirectos:</strong> La responsabilidad total de Zinnia en cualquier caso no superará el
          monto pagado por el Cliente en los últimos 3 meses.</p>
        </>
      ),
    },
    {
      id: "14",
      title: "14. Fuerza Mayor",
      content: (
        <>
          <p><strong>Se consideran casos de fuerza mayor:</strong> Desastres naturales, guerras, actos de terrorismo,
          huelgas, disturbios civiles, acciones gubernamentales, fallas en proveedores de servicios esenciales,
          o cualquier otra causa fuera del control razonable de Zinnia.</p>
          <p><strong>Consecuencias:</strong> En caso de fuerza mayor, Zinnia queda eximido de cumplir con sus obligaciones
          mientras persista la causa que impide el cumplimiento.</p>
          <p><strong>Notificaciones:</strong> Zinnia notificará al Cliente sobre la situación de fuerza mayor dentro de las
          48 horas de haberla conocido, cuando sea posible.</p>
          <p><strong>Suspensiones:</strong> Zinnia podrá suspender total o parcialmente el Servicio sin derecho a
          reembolso durante el período de fuerza mayor.</p>
        </>
      ),
    },
    {
      id: "15",
      title: "15. Jurisdicción y Ley Aplicable",
      content: (
        <>
          <p><strong>País:</strong> Argentina</p>
          <p><strong>Provincia:</strong> Provincia de San Luis</p>
          <p><strong>Ciudad:</strong> Ciudad de San Luis</p>
          <p><strong>Tribunales competentes:</strong> Los tribunales ordinarios de la Ciudad de San Luis,
          renunciando el Cliente a cualquier otro fuero que pudiera corresponderle.</p>
          <p><strong>Ley aplicable:</strong> Leyes de la República Argentina, incluyendo el Código Civil y
          Comercial de la Nación, Ley 25.326 de Protección de Datos Personales, Ley de Defensa del Consumidor, y
          demás normas aplicables.</p>
          <p><strong>Arbitraje:</strong> Cualquier controversia podrá ser sometida a mediación o arbitraje de común
          acuerdo entre las partes.</p>
        </>
      ),
    },
    {
      id: "16",
      title: "16. Contacto y Soporte",
      content: (
        <>
          <p><strong>Empresa:</strong> Zinnia</p>
          <p><strong>Sitio web:</strong> https://www.zinnia-code.com</p>
          <p><strong>Domicilio legal:</strong> Ciudad de San Luis, Provincia de San Luis, Argentina</p>
          <p><strong>Horario de atención:</strong> Lunes a viernes de 9:00 a 18:00hs (hora argentina), excluyendo feriados</p>
          <p><strong>Formulario de contacto:</strong> Disponible en la sección "Ayuda &gt; Contacto" del panel</p>
          <p><strong>Documentación:</strong> https://docs.zinnia-code.com</p>
        </>
      ),
    },
    {
      id: "17",
      title: "17. Modificaciones de los Términos",
      content: (
        <>
          <p><strong>Zinnia</strong> se reserva el derecho de modificar estos Términos en cualquier momento para
          reflejar cambios en el Servicio, legislación aplicable o mejores prácticas de la industria.</p>
          <p><strong>Notificación de cambios:</strong> Los cambios serán notificados por email con al menos 30 días de
          antelación a su entrada en vigencia. Cambios menores o correcciones podrán notificarse con 7 días
          de antelación.</p>
          <p><strong>Vigencia de modificaciones:</strong> Los cambios entrarán en vigencia a la fecha indicada en
          la notificación. El uso continuado del Servicio después de dicha fecha constituirá aceptación de los
          nuevos términos.</p>
          <p><strong>Oposición a cambios:</strong> Si el Cliente no está de acuerdo con las modificaciones, puede
          cancelar el Servicio antes de la fecha de vigencia sin penalidad.</p>
        </>
      ),
    },
    {
      id: "18",
      title: "18. Acuerdo Completo",
      content: (
        <>
          <p>Estos Términos constituyen el acuerdo completo entre el Cliente y <strong>Zinnia</strong> en relación con el Servicio <strong>Flow Manager</strong>,
          reemplazando cualquier acuerdo anterior verbal o escrito sobre el mismo tema.</p>
          <p><strong>Acuerdos anteriores:</strong> Quedan sin efecto todos los acuerdos, propuestas o representaciones
          previas relacionados con el objeto de estos Términos.</p>
          <p><strong>Renuncias:</strong> El hecho de que Zinnia no exija o haga cumplir estrictamente cualquiera de
          los términos de estos Términos no constituirá una renuncia a dicho derecho o remedio.</p>
          <p><strong>Divisibilidad:</strong> Si cualquier disposición de estos Términos es declarada nula o inaplicable,
          las demás disposiciones continuarán siendo válidas y ejecutables en la mayor medida permitida por la ley.</p>
          <p><strong>Cesión:</strong> Zinnia puede ceder estos Términos sin restricciones. El Cliente no puede ceder sus
          derechos u obligaciones bajo estos Términos sin el consentimiento previo por escrito de Zinnia.</p>
        </>
      ),
    },
    {
      id: "19",
      title: "19. Aceptación",
      content: (
        <>
          <p>El uso del Servicio <strong>Flow Manager</strong> constituye la aceptación de estos Términos y Condiciones por parte del Cliente.</p>
          <p><strong>Mecanismo de aceptación:</strong> Al completar el formulario de registro y hacer clic en "Registrarse",
          el Cliente declara haber leído, entendido y aceptado estos Términos.</p>
          <p><strong>Consentimiento explícito:</strong> El Cliente presta su consentimiento libre, informado, inequívoco
          y específico para los términos aquí contenidos.</p>
          <p><strong>Registro:</strong> La creación de una cuenta implica la aceptación de estos Términos y de la Política
          de Privacidad de <strong>Zinnia</strong>.</p>
          <p><strong>Uso continuado:</strong> El uso continuado del Servicio después de cualquier modificación constituirá
          la aceptación de dichas modificaciones.</p>
          <div className="mt-3" style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "5px" }}>
            <p className="mb-0"><strong>Última actualización:</strong> Febrero 2026 - Versión 2.0</p>
          </div>
        </>
      ),
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="no-print mb-3 d-flex justify-content-end">
        <button className="btn btn-secondary" onClick={handlePrint}>
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="container mt-4 legal-document" style={{ backgroundColor: "#fff", color: "#000", padding: "30px", borderRadius: "5px" }}>
        <div className="alert alert-warning mb-4" role="alert">
          <h5 className="alert-heading">AVISO LEGAL IMPORTANTE</h5>
          <p className="mb-2">
            <strong>Versión Beta / Desarrollo:</strong> El servicio <strong>Flow Manager</strong> se encuentra actualmente
            en fase de desarrollo y testing. <strong>Zinnia</strong> es un nombre comercial utilizado para este proyecto
            que aún no ha sido constituido legalmente como persona jurídica.
          </p>
          <p className="mb-2">
            <strong>Estos términos y condiciones constituyen un borrador preliminar</strong> que refleja la intención
            de las partes para cuando el servicio sea lanzado formalmente. El uso del servicio durante esta fase beta
            implica la aceptación de estos términos como documento de trabajo.
          </p>
          <p className="mb-0" style={{ fontSize: "12px" }}>
            Última actualización: Febrero 2026 - Servicio proporcionado por <strong>Zinnia</strong> (proyecto en desarrollo) - www.zinnia-code.com
          </p>
        </div>

        <h1 className="text-center mb-4">TÉRMINOS Y CONDICIONES DE USO</h1>

        {sections.map((section) => (
          <div key={section.id} className="mb-4" style={{ borderBottom: "1px solid #ddd", paddingBottom: "20px" }}>
            <h3 className="mb-3">{section.title}</h3>
            <div style={{ lineHeight: "1.8", textAlign: "justify" }}>
              {section.content}
            </div>
          </div>
        ))}

        <div className="mt-5 pt-4" style={{ borderTop: "2px solid #000", textAlign: "center" }}>
          <p><strong>Flow Manager</strong> por <strong>Zinnia</strong> © {new Date().getFullYear()} - Todos los derechos reservados</p>
          <p style={{ fontSize: "12px" }}>
            Ciudad de San Luis, Provincia de San Luis, Argentina - www.zinnia-code.com
          </p>
        </div>
      </div>

      <style>{`
        ul, ol {
          margin-left: 20px;
        }
        li {
          margin-bottom: 5px;
        }
        .alert {
          border: 1px solid #ddd !important;
        }
        .alert-warning {
          background-color: #fff3cd !important;
          color: #856404 !important;
        }
        .alert-danger {
          background-color: #f8d7da !important;
          color: #721c24 !important;
        }
        .alert-success {
          background-color: #d4edda !important;
          color: #155724 !important;
        }
        .alert-info {
          background-color: #d1ecf1 !important;
          color: #0c5460 !important;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .legal-document {
            padding: 20px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #000 !important;
          }
          p, li, td, th, span, div {
            color: #000 !important;
          }
          a {
            color: #000 !important;
            text-decoration: underline;
          }
          .alert {
            border: 1px solid #000 !important;
            background-color: #f5f5f5 !important;
            color: #000 !important;
          }
          .alert-warning {
            border-left: 4px solid #000 !important;
            background-color: #f5f5f5 !important;
            color: #000 !important;
          }
          .alert-danger {
            border-left: 4px solid #000 !important;
            background-color: #f5f5f5 !important;
            color: #000 !important;
          }
          .alert-success {
            border-left: 4px solid #000 !important;
            background-color: #f5f5f5 !important;
            color: #000 !important;
          }
          .alert-info {
            border-left: 4px solid #000 !important;
            background-color: #f5f5f5 !important;
            color: #000 !important;
          }
          table {
            background-color: #fff !important;
            color: #000 !important;
            border: 1px solid #000 !important;
          }
          table th {
            background-color: #f5f5f5 !important;
            color: #000 !important;
            border: 1px solid #000 !important;
          }
          table td {
            color: #000 !important;
            border: 1px solid #000 !important;
          }
        }
      `}</style>
    </>
  );
}
