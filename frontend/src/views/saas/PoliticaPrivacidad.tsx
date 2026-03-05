import { useState } from "react";

/**
 * Política de Privacidad - Ley 25.326
 * Formato legal tradicional - Fondo blanco, letras negras
 */
export default function PoliticaPrivacidad() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: "1",
      title: "1. Responsable del Tratamiento de Datos",
      content: (
        <>
          <p>
            El <strong>Responsable del Tratamiento</strong> de los datos personales es:
          </p>
          <ul>
            <li><strong>Denominación:</strong> Zinnia</li>
            <li><strong>Domicilio:</strong> Ciudad Autónoma de Buenos Aires, Argentina</li>
          </ul>
          <p className="mt-3">
            Zinnia garantiza el cumplimiento de la Ley 25.326 de Protección de Datos Personales
            y sus normas reglamentarias, así como de la normativa nacional e internacional
            aplicable en materia de protección de datos.
          </p>
        </>
      ),
    },
    {
      id: "2",
      title: "2. Datos Personales que Recopilamos",
      content: (
        <>
          <p>
            Zinnia recopila y trata los siguientes datos personales de <strong>dos categorías</strong> de sujetos:
          </p>

          <h6 className="fw-bold mt-4">Datos del Cliente (Administrador del Negocio)</h6>
          <ul>
            <li><strong>Datos de identificación:</strong> Nombre completo, DNI/CUIT, email, teléfono</li>
            <li><strong>Datos de facturación:</strong> Dirección, datos fiscales, información de pago</li>
            <li><strong>Datos de acceso:</strong> Usuario, contraseña (encriptada), historial de sesiones</li>
            <li><strong>Datos de uso:</strong> IP, navegador, dispositivo, fecha y hora de acceso</li>
          </ul>

          <h6 className="fw-bold mt-4">Datos de los Clientes (miembros de los negocios)</h6>
          <p className="text-muted">
            <em>Estos datos son proporcionados por el Cliente y están bajo su responsabilidad.</em>
          </p>
          <ul>
            <li><strong>Datos de identificación:</strong> Nombre, apellido, DNI, fecha de nacimiento</li>
            <li><strong>Datos de contacto:</strong> Email, teléfono, dirección</li>
            <li><strong>Datos de salud:</strong> Peso, altura, condiciones médicas declaradas</li>
            <li><strong>Datos de pago:</strong> Tarjeta de crédito, débito, suscripciones</li>
            <li><strong>Datos de actividad:</strong> Asistencias, rutinas, evolución física</li>
          </ul>

          <div className="alert alert-warning mt-3">
            <small>
              <strong>Importante:</strong> Zinnia actúa solo como <strong>encargado del tratamiento</strong>
              de los datos de los clientes. El Cliente (negocio) es el <strong>responsable</strong> de haber
              obtenido el consentimiento correspondiente de sus clientes.
            </small>
          </div>
        </>
      ),
    },
    {
      id: "3",
      title: "3. Finalidad del Tratamiento de Datos",
      content: (
        <>
          <p>
            Los datos personales recopilados serán utilizados para las siguientes finalidades:
          </p>

          <h6 className="fw-bold mt-3">Finalidades Principales</h6>
          <ul>
            <li><strong>Prestación del servicio:</strong> Gestionar la plataforma de negocios</li>
            <li><strong>Gestión de clientes:</strong> Control de accesos, membresías, pagos</li>
            <li><strong>Facturación:</strong> Emitir comprobantes y cobrar servicios</li>
            <li><strong>Soporte técnico:</strong> Resolver problemas y consultas</li>
            <li><strong>Mejora del servicio:</strong> Analizar uso para optimizar funcionalidades</li>
          </ul>

          <h6 className="fw-bold mt-4">Finalidades Secundarias (con consentimiento separado)</h6>
          <ul>
            <li><strong>Marketing:</strong> Envío de novedades, promociones (solo si el Cliente lo acepta)</li>
            <li><strong>Analytics:</strong> Estadísticas de uso agregadas (datos anónimos)</li>
            <li><strong>Segmentación:</strong> Personalización de experiencia (datos anonimizados)</li>
          </ul>

          <div className="alert alert-info mt-3">
            <small>
              <strong>Base Legal:</strong> El tratamiento se basa en el consentimiento del titular (art. 5, inc. a)
              y en la relación contractual (art. 5, inc. e) de la Ley 25.326.
            </small>
          </div>
        </>
      ),
    },
    {
      id: "4",
      title: "4. Destinatarios de los Datos",
      content: (
        <>
          <p>Los datos personales podrán ser compartidos con los siguientes destinatarios:</p>

          <h6 className="fw-bold mt-3">Proveedores de Servicios</h6>
          <ul>
            <li><strong>MercadoPago:</strong> Procesamiento de pagos - Argentina</li>
            <li><strong>Servicios de hosting:</strong> Infraestructura técnica - Argentina</li>
            <li><strong>Servicios de email:</strong> Comunicaciones - Argentina</li>
            <li><strong>Servicios de analytics:</strong> Google Analytics - EE.UU. (cookies con consentimiento)</li>
          </ul>

          <h6 className="fw-bold mt-4">Autoridades</h6>
          <ul>
            <li><strong>AFIP:</strong> Administración Federal de Ingresos Públicos (obligación fiscal)</li>
            <li><strong>AAIP:</strong> Agencia de Acceso a la Información Pública (en caso de denuncias)</li>
            <li><strong>Tribunales:</strong> En caso de litigios (cuando sea requerido por orden judicial)</li>
          </ul>

          <p className="mt-3"><strong>No se venden datos a terceros.</strong></p>
        </>
      ),
    },
    {
      id: "5",
      title: "5. Medidas de Seguridad",
      content: (
        <>
          <p>Zinnia implementa las siguientes medidas de seguridad para proteger los datos personales:</p>

          <h6 className="fw-bold mt-3">Medidas Técnicas</h6>
          <ul>
            <li><strong>Encriptación SSL/TLS:</strong> Todos los datos se transmiten encriptados</li>
            <li><strong>Hash de contraseñas:</strong> Las contraseñas se almacenan encriptadas con bcrypt</li>
            <li><strong>Firewalls:</strong> Protección contra accesos no autorizados</li>
            <li><strong>Backups diarios:</strong> Copias de seguridad automatizadas</li>
            <li><strong>Autenticación de dos factores:</strong> Disponible para planes Enterprise</li>
          </ul>

          <h6 className="fw-bold mt-4">Medidas Organizativas</h6>
          <ul>
            <li><strong>Control de accesos:</strong> Solo personal autorizado puede acceder a datos personales</li>
            <li><strong>Capacitación:</strong> Formación del personal en protección de datos</li>
            <li><strong>Protocolos de respuesta:</strong> Procedimientos ante incidentes de seguridad</li>
            <li><strong>Confidencialidad:</strong> Acuerdos de secreto con empleados</li>
          </ul>

          <p className="mt-3">
            A pesar de estas medidas, ningún sistema es 100% seguro. En caso de brecha de seguridad,
            Zinnia notificará a los afectados y a la Agencia de Acceso a la Información Pública
            dentro de las 72hs, según lo establece la Ley 25.326.
          </p>
        </>
      ),
    },
    {
      id: "6",
      title: "6. Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)",
      content: (
        <>
          <p>
            Según la <strong>Ley 25.326</strong>, el titular de los datos personales tiene los siguientes derechos:
          </p>

          <h6 className="fw-bold mt-3">Derecho de Acceso</h6>
          <p>
            El Cliente puede solicitar <strong>acceso a sus datos personales</strong> para conocer qué información
            tenemos sobre él y su negocio.
          </p>

          <h6 className="fw-bold mt-3">Derecho de Rectificación</h6>
          <p>
            El Cliente puede solicitar la <strong>corrección de datos inexactos</strong> o incompletos.
          </p>

          <h6 className="fw-bold mt-3">Derecho de Cancelación/Supresión</h6>
          <p>El Cliente puede solicitar la <strong>eliminación de sus datos</strong> cuando:</p>
          <ul>
            <li>Ya no son necesarios para la finalidad por la que fueron recopilados</li>
            <li>Retira el consentimiento (si el tratamiento se basa en él)</li>
            <li>Se opone al tratamiento y no hay motivo legítimo prevalente</li>
          </ul>

          <h6 className="fw-bold mt-3">Derecho de Oposición</h6>
          <p>
            El Cliente puede <strong>oponerse al tratamiento</strong> de sus datos por motivos legítimos.
          </p>

          <h6 className="fw-bold mt-3">Derecho de Portabilidad</h6>
          <p>
            El Cliente puede solicitar recibir sus datos en un formato estructurado de uso común para
            transferirlos a otro servicio.
          </p>

          <hr className="my-3" />

          <h6 className="fw-bold">Como Ejercer estos Derechos</h6>
          <p><strong>Formulario:</strong> Disponible en "Configuración SaaS &gt; Solicitar Eliminación de Cuenta"</p>
          <p><strong>Documentación requerida:</strong> DNI/CUIT y constancia de identidad del titular</p>
          <p><strong>Plazo de respuesta:</strong> 15 días hábiles (según Ley 25.326)</p>
          <p><strong>Costo:</strong> Gratuito</p>
        </>
      ),
    },
    {
      id: "7",
      title: "7. Cookies y Tecnologías Similares",
      content: (
        <>
          <p><strong>Flow Manager</strong> (por Zinnia) utiliza cookies y tecnologías similares para mejorar la experiencia del usuario:</p>

          <h6 className="fw-bold mt-3">Tipos de Cookies Utilizadas</h6>
          <ul>
            <li><strong>Cookies técnicas:</strong> Necesarias para el funcionamiento del sitio (sesión, autenticación)</li>
            <li><strong>Cookies de funcionalidad:</strong> Recuerdan preferencias del usuario (idioma, tema)</li>
            <li><strong>Cookies analíticas:</strong> Analizan el uso del sitio (Google Analytics)</li>
          </ul>

          <p className="mt-3">
            Para más información, consulte nuestra <a href="#cookies" style={{ color: "#0066cc" }}>Política de Cookies</a>.
          </p>
        </>
      ),
    },
    {
      id: "8",
      title: "8. Tiempo de Conservación de los Datos",
      content: (
        <>
          <p>Los datos personales se conservarán por:</p>

          <h6 className="fw-bold mt-3">Durante la relación contractual</h6>
          <p>Mientras el Cliente utilice el Servicio, todos los datos se mantendrán activos en el sistema.</p>

          <h6 className="fw-bold mt-4">Post cancelación/baja</h6>
          <p>Los datos serán eliminados después de 30 días de la cancelación, excepto aquellos que deban conservarse
          por obligaciones legales (ej: registros fiscales por 10 años).</p>

          <h6 className="fw-bold mt-4">Obligaciones legales</h6>
          <p>Ciertos datos deben conservarse por períodos específicos según la legislación vigente:
          </p>
          <ul>
            <li><strong>Registros fiscales:</strong> 10 años (Código Fiscal)</li>
            <li><strong>Documentación laboral:</strong> 5 años posteriores a la relación laboral</li>
            <li><strong>Historial de transacciones:</strong> 10 años (Ley Anti Lavado</li>
          </ul>

          <p className="mt-3">Una vez transcurrido el periodo de conservación, los datos serán eliminados o anonimizados permanentemente.</p>
        </>
      ),
    },
    {
      id: "9",
      title: "9. Datos de Menores de Edad",
      content: (
        <>
          <p><strong>Edad mínima:</strong> 13 años</p>
          <p><strong>Consentimiento parental:</strong> Para menores de 16 años se requiere consentimiento expreso de los padres/tutores</p>
          <p><strong>Recopilación de datos de menores:</strong> Solo se recopilan datos de menores cuando son proporcionados
          por los padres o tutores legales en el contexto de la membresía del negocio.</p>
          <p><strong>Medidas de protección:</strong> Zinnia no procesa datos de menores para marketing ni profiling.</p>
          <p><strong>Verificación de edad:</strong> Zinnia no verifica activamente la edad, asumiendo que el Cliente
          (propietario del negocio) obtiene el consentimiento correspondiente.</p>
        </>
      ),
    },
    {
      id: "10",
      title: "10. Transferencias Internacionales de Datos",
      content: (
        <>
          <p><strong>Transferencias internacionales:</strong> Zinnia no realiza transferencias internacionales de datos personales
          a terceros ubicados fuera de Argentina.</p>
          <p><strong>Proveedores internacionales:</strong> Algunos proveedores de servicios (ej: Google Analytics) pueden
          procesar datos desde Estados Unidos u otros países.</p>
          <p><strong>Garantías aplicadas:</strong> Se utilizan Cláusulas Contractuales Tipo según las aprobaciones de la UE
          para transferencias internacionales.</p>
          <p><strong>Países con nivel adecuado:</strong> Estados Unidos (a través de Privacy Shield o cláusulas contractuales)</p>
          <p><strong>Derechos ARCO en transferencias:</strong> Los titulares pueden ejercer sus derechos ARCO
          incluso sobre datos transferidos internacionalmente.</p>
        </>
      ),
    },
    {
      id: "11",
      title: "11. Contacto y Denuncias",
      content: (
        <>
          <h6 className="fw-bold">Para consultas o ejercer derechos ARCO:</h6>
          <p><strong>Empresa:</strong> Zinnia</p>
          <p><strong>Formulario:</strong> Disponible en "Configuración SaaS &gt; Contacto"</p>
          <p><strong>Sitio web:</strong> https://www.zinnia-code.com</p>
          <p><strong>Domicilio legal:</strong> Ciudad de San Luis, Provincia de San Luis, Argentina</p>

          <hr className="my-3" />

          <h6 className="fw-bold">Para denuncias ante la Autoridad de Control (AAIP):</h6>
          <p><strong>Agencia de Acceso a la Información Pública (AAIP)</strong></p>
          <p><strong>Dirección:</strong> Moreno 750, Ciudad Autónoma de Buenos Aires</p>
          <p><strong>Email:</strong> denuncias@aaip.gob.ar</p>
          <p><strong>Teléfono:</strong> +54 11 5555-5555</p>
          <p><strong>Web:</strong> https://www.argentina.gob.ar/aaip</p>

          <hr className="my-3" />

          <h6 className="fw-bold">Para denuncias judiciales:</h6>
          <p><strong>Juzgado Nacional en lo Contencioso Administrativo Federal</strong></p>
          <p><strong>Domicilio:</strong> Ciudad Autónoma de Buenos Aires</p>
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
        <div className="alert alert-info mb-4" role="alert">
          <h5 className="alert-heading">POLÍTICA DE PRIVACIDAD - VERSIÓN BETA</h5>
          <p className="mb-2">
            <strong>Aviso:</strong> El servicio <strong>Flow Manager</strong> se encuentra en fase de desarrollo/testing.
            <strong>Zinnia</strong> es un nombre comercial de un proyecto aún no constituido legalmente.
          </p>
          <p className="mb-0" style={{ fontSize: "12px" }}>
            Este documento refleja el compromiso de cumplimiento con la Ley 25.326 para cuando el servicio sea lanzado formalmente.
            Última actualización: Febrero 2026
          </p>
        </div>

        <h1 className="text-center mb-4">POLÍTICA DE PRIVACIDAD</h1>

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
        .alert-info {
          background-color: #d1ecf1 !important;
          color: #0c5460 !important;
        }
        a {
          color: #0066cc;
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
