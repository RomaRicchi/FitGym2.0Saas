import { useState } from "react";

/**
 * Política de Cookies
 * Formato legal tradicional - Fondo blanco, letras negras
 */
export default function PoliticaCookies() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: "1",
      title: "1. Que son las Cookies",
      content: (
        <>
          <p>Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando visita un sitio web.
          Sirven para recordar información sobre el usuario y facilitar su experiencia de navegación.</p>
          <p><strong>Propósito:</strong> Mejorar la funcionalidad del sitio, personalizar el contenido y analizar el uso.</p>
          <p><strong>Tipos de datos que almacenan:</strong> Preferencias, sesión de autenticación, información de navegación.</p>
          <p><strong>Duración:</strong> Pueden ser temporales (sesión) o persistentes (meses/anios).</p>
        </>
      ),
    },
    {
      id: "2",
      title: "2. Tipos de Cookies que Utilizamos",
      content: (
        <>
          <p><strong>Flow Manager</strong> (por Zinnia) utiliza los siguientes tipos de cookies:</p>

          <h6 className="fw-bold mt-3">Cookies Tecnicas</h6>
          <p><strong>Propósito:</strong> Son esenciales para el funcionamiento del sitio web.</p>
          <p><strong>Ejemplos:</strong> Mantener la sesión del usuario, recordar preferencias básicas.</p>
          <p><strong>Esenciales?</strong> Si. El sitio no funciona correctamente sin ellas.</p>

          <h6 className="fw-bold mt-4">Cookies de Funcionalidad</h6>
          <p><strong>Propósito:</strong> Recuerdan las preferencias del usuario para mejorar su experiencia.</p>
          <p><strong>Ejemplos:</strong> Idioma seleccionado, tema visual, configuraciones de pantalla.</p>
          <p><strong>Esenciales?</strong> No. El sitio funciona pero con experiencia degradada.</p>

          <h6 className="fw-bold mt-4">Cookies Analiticas</h6>
          <p><strong>Propósito:</strong> Analizan como los usuarios utilizan el sitio para mejorarlo.</p>
          <p><strong>Ejemplos:</strong> Páginas visitadas, tiempo en el sitio, errores encontrados.</p>
          <p><strong>Esenciales?</strong> No. Sirven para estadísticas anónimas.</p>

          <h6 className="fw-bold mt-4">Cookies de Terceros</h6>
          <p><strong>Propósito:</strong> Cookies instaladas por servicios externos integrados en el sitio.</p>
          <p><strong>Ejemplos:</strong> Google Analytics, MercadoPago, integraciones con redes sociales.</p>
          <p><strong>Esenciales?</strong> No. Dependen de terceros.</p>
        </>
      ),
    },
    {
      id: "3",
      title: "3. Lista Especifica de Cookies",
      content: (
        <>
          <p>A continuacion, detallamos todas las cookies utilizadas en www.zinnia-code.com:</p>

          <table className="table table-bordered mt-3">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Duración</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>connect.sid</td>
                <td>Técnica</td>
                <td>Sesión</td>
                <td>Mantiene la sesión del usuario autenticado</td>
              </tr>
              <tr>
                <td>token</td>
                <td>Técnica</td>
                <td>30 días</td>
                <td>Token de autenticación persistente</td>
              </tr>
              <tr>
                <td>_ga</td>
                <td>Analítica</td>
                <td>2 años</td>
                <td>Google Analytics - ID único del usuario</td>
              </tr>
              <tr>
                <td>_gid</td>
                <td>Analítica</td>
                <td>24 horas</td>
                <td>Google Analytics - ID de sesión</td>
              </tr>
              <tr>
                <td>_gat</td>
                <td>Analítica</td>
                <td>1 minuto</td>
                <td>Google Analytics - Limitación de tasa de solicitudes</td>
              </tr>
              <tr>
                <td>MP</td>
                <td>Terceros</td>
                <td>Variable</td>
                <td>MercadoPago - Datos de sesión de pago</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: "4",
      title: "4. Cookies de Terceros",
      content: (
        <>
          <p><strong>Zinnia</strong> utiliza servicios de terceros que pueden instalar cookies:</p>

          <h6 className="fw-bold mt-3">Google Analytics</h6>
          <p><strong>Finalidad:</strong> Analizar el tráfico del sitio web y mejorar el servicio.</p>
          <p><strong>Política de privacidad:</strong> https://policies.google.com/privacy</p>
          <p><strong>Cookies utilizadas:</strong> _ga, _gid, _gat</p>
          <p><strong>Configuración:</strong> https://tools.google.com/dlpage/gaoptout</p>

          <h6 className="fw-bold mt-4">MercadoPago</h6>
          <p><strong>Finalidad:</strong> Procesamiento de pagos online.</p>
          <p><strong>Política de privacidad:</strong> https://www.mercadopago.com.ar/terminos-y-condiciones</p>
          <p><strong>Cookies utilizadas:</strong> MP (datos de sesión y preferencias)</p>

          <div className="alert alert-warning mt-3">
            <small>
              <strong>Nota:</strong> Zinnia no controla las cookies de terceros. Consulte las políticas de
              privacidad de dichos terceros para más información sobre sus cookies y cómo desactivarlas.
            </small>
          </div>
        </>
      ),
    },
    {
      id: "5",
      title: "5. Como Administrar o Rechazar Cookies",
      content: (
        <>
          <p>El usuario puede configurar, administrar o rechazar cookies:</p>

          <h6 className="fw-bold mt-3">Desde el Sitio Web</h6>
          <p><strong>Banner de cookies:</strong> Al acceder por primera vez, se muestra un banner donde el usuario
          puede aceptar o rechazar cookies no esenciales.</p>
          <p><strong>Panel de configuración:</strong> Disponible en "Configuración &gt; Privacidad &gt; Cookies".</p>
          <p><strong>Botón de cookie settings:</strong> Ubicado en el pie de página del sitio web.</p>

          <h6 className="fw-bold mt-4">Desde el Navegador</h6>
          <p><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios &gt; Ver y eliminar cookies de sitios específicos.</p>
          <p><strong>Mozilla Firefox:</strong> Opciones &gt; Privacidad y seguridad &gt; Cookies y datos de sitios &gt; Eliminar cookies y datos del sitio.</p>
          <p><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Administrar datos de sitios web &gt; Eliminar todo el historial.</p>
          <p><strong>Microsoft Edge:</strong> Configuración &gt; Cookies y permisos de sitios &gt; Ver y eliminar cookies.</p>

          <h6 className="fw-bold mt-4">Consecuencias de Desactivar Cookies</h6>
          <ul>
            <li>Algunas funcionalidades pueden no estar disponibles.</li>
            <li>El usuario deberá iniciar sesión nuevamente en cada visita.</li>
            <li>Las preferencias personalizados se perderán.</li>
            <li>El análisis de uso del sitio para mejoras será limitado.</li>
          </ul>
        </>
      ),
    },
    {
      id: "6",
      title: "6. Actualizaciones de esta Politica",
      content: (
        <>
          <p><strong>Fecha de ultima actualización:</strong> Febrero 2026</p>
          <p><strong>Versión:</strong> 2.0</p>

          <p><strong>Frecuencia de revision:</strong> Esta política se revisará anualmente o cuando se realicen cambios
          significativos en el sitio web.</p>

          <p><strong>Notificación de cambios:</strong></p>
          <ul>
            <li>Email a los usuarios registrados</li>
            <li>Aviso en el sitio web (banner)</li>
            <li>Actualización de la fecha de "última modificación"</li>
          </ul>

          <p><strong>Vigencia:</strong> Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>

          <p><strong>Historial de versiones:</strong></p>
          <ul>
            <li>Versión 2.0 - Febrero 2026 - Actualización completa de la política</li>
            <li>Versión 1.0 - Enero 2025 - Versión inicial</li>
          </ul>
        </>
      ),
    },
    {
      id: "7",
      title: "7. Contacto",
      content: (
        <>
          <p>Para cualquier consulta sobre esta Política de Cookies:</p>

          <p><strong>Empresa:</strong> Zinnia</p>
          <p><strong>Formulario:</strong> Disponible en "Configuración &gt; Contacto" del panel</p>
          <p><strong>Sitio web:</strong> https://www.zinnia-code.com</p>
          <p><strong>Domicilio legal:</strong> Ciudad de San Luis, Provincia de San Luis, Argentina</p>

          <hr className="my-3" />

          <h6 className="fw-bold">Documentos Relacionados</h6>
          <ul>
            <li><a href="#privacidad" style={{ color: "#0066cc" }}>Política de Privacidad</a></li>
            <li><a href="#terminos" style={{ color: "#0066cc" }}>Términos y Condiciones</a></li>
          </ul>
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
          <h5 className="alert-heading">POLÍTICA DE COOKIES - VERSIÓN BETA</h5>
          <p className="mb-2">
            <strong>Aviso:</strong> El servicio <strong>Flow Manager</strong> se encuentra en fase de desarrollo/testing.
            <strong>Zinnia</strong> es un nombre comercial de un proyecto aún no constituido legalmente.
          </p>
          <p className="mb-0" style={{ fontSize: "12px" }}>
            Este documento refleja el compromiso de cumplimiento normativo para cuando el servicio sea lanzado formalmente.
            Última actualización: Febrero 2026
          </p>
        </div>

        <h1 className="text-center mb-4">POLÍTICA DE COOKIES</h1>

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
        .alert-info {
          background-color: #d1ecf1 !important;
          color: #0c5460 !important;
        }
        .alert-warning {
          background-color: #fff3cd !important;
          color: #856404 !important;
        }
        table {
          background-color: #fff !important;
          color: #000 !important;
        }
        table th {
          background-color: #f8f9fa !important;
          color: #000 !important;
        }
        table td {
          color: #000 !important;
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
