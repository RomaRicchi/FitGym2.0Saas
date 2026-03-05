import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

/**
 * Vista de Administración de Documentos Legales
 * Permite descargar y editar los Términos y Condiciones, Política de Privacidad y Política de Cookies
 */
export default function AdminDocumentosLegales() {
  const navigate = useNavigate();
  const [editando, setEditando] = useState<string | null>(null);
  const [contenidoEditado, setContenidoEditado] = useState<string>("");

  const documentos = [
    {
      id: "terminos",
      titulo: "Términos y Condiciones",
      descripcion: "Contrato de servicio con 19 secciones completas",
      secciones: 19,
      ultimoActualizacion: new Date().toLocaleDateString("es-AR"),
      archivo: "TerminosCondiciones.tsx",
      icono: ""
    },
    {
      id: "privacidad",
      titulo: "Política de Privacidad",
      descripcion: "Cumplimiento Ley 25.326 - Derechos ARCO",
      secciones: 11,
      ultimoActualizacion: new Date().toLocaleDateString("es-AR"),
      archivo: "PoliticaPrivacidad.tsx",
      icono: ""
    },
    {
      id: "cookies",
      titulo: "Política de Cookies",
      descripcion: "Uso de cookies, Analytics y MercadoPago",
      secciones: 8,
      ultimoActualizacion: new Date().toLocaleDateString("es-AR"),
      archivo: "PoliticaCookies.tsx",
      icono: ""
    },
    {
      id: "indice",
      titulo: "Índice de Documentos",
      descripcion: "Portal de navegación de todos los documentos legales",
      secciones: 0,
      ultimoActualizacion: new Date().toLocaleDateString("es-AR"),
      archivo: "index.html",
      icono: ""
    }
  ];

  const handleDescargar = (doc: typeof documentos[0]) => {
    // Navegar a la página del documento legal para imprimir/guardar como PDF
    const rutas: Record<string, string> = {
      terminos: "/legal/terminos",
      privacidad: "/legal/privacidad",
      cookies: "/legal/cookies",
      indice: "/legal"
    };

    const ruta = rutas[doc.id];
    if (ruta) {
      navigate(ruta);
    } else {
      Swal.fire({
        title: "Error",
        text: "No se encontró la página del documento.",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }
  };

  const handleEditar = (doc: typeof documentos[0]) => {
    setEditando(doc.id);
    const archivoReact = doc.id === "terminos" ? "TerminosCondiciones.tsx" :
                        doc.id === "privacidad" ? "PoliticaPrivacidad.tsx" :
                        doc.id === "cookies" ? "PoliticaCookies.tsx" : null;

    if (!archivoReact) {
      Swal.fire({
        title: "Índice",
        text: "El índice es solo un archivo HTML de navegación. No tiene componente React.",
        icon: "info",
      });
      setEditando(null);
      return;
    }

    Swal.fire({
      title: `Editar ${doc.titulo}`,
      html: `
        <div class="text-start">
          <p>Para editar este documento legal:</p>

          <div class="alert alert-info">
            <p class="mb-2"><strong>Pasos:</strong></p>
            <ol class="mb-0 small">
              <li>Editar: <code>/frontend/src/views/saas/${archivoReact}</code></li>
              <li>Los cambios se reflejarán automáticamente en el panel y al imprimir</li>
              <li>Los clientes verán la versión actualizada</li>
            </ol>
          </div>

          <p class="mt-3"><strong>Importante:</strong></p>
          <ul class="small">
            <li>Cualquier cambio en los documentos legales debe ser notificado a los clientes</li>
            <li>Se recomienda revisión de un abogado antes de aplicar cambios</li>
            <li>Mantener un registro de las versiones anteriores</li>
          </ul>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Entendido",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
    setEditando(null);
  };

  const handleVistaPrevia = (doc: typeof documentos[0]) => {
    // Navegar a la página del documento legal para vista previa
    const rutas: Record<string, string> = {
      terminos: "/legal/terminos",
      privacidad: "/legal/privacidad",
      cookies: "/legal/cookies",
      indice: "/legal"
    };

    const ruta = rutas[doc.id];
    if (ruta) {
      window.open(ruta, "_blank");
    }
  };

  const handleVerCodigo = (doc: typeof documentos[0]) => {
    const archivoReact = doc.id === "terminos" ? "TerminosCondiciones.tsx" :
                        doc.id === "privacidad" ? "PoliticaPrivacidad.tsx" :
                        doc.id === "cookies" ? "PoliticaCookies.tsx" : null;

    if (!archivoReact) {
      Swal.fire({
        title: "Índice",
        text: "El índice es solo un archivo HTML de navegación. No tiene componente React.",
        icon: "info",
      });
      return;
    }

    Swal.fire({
      title: `Ruta del archivo`,
      html: `
        <div class="text-start">
          <p><strong>Archivo:</strong></p>
          <code style="display: block; background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
            /frontend/src/views/saas/${archivoReact}
          </code>

          <p class="mt-3"><strong>Instrucciones:</strong></p>
          <ol class="small">
            <li>Abre el archivo en tu editor de código</li>
            <li>Busca la sección que deseas modificar</li>
            <li>Edita el contenido dentro de <code>content: (...)</code></li>
            <li>Guarda los cambios</li>
            <li>Recarga la página para ver los cambios reflejados</li>
          </ol>

          <div class="alert alert-warning mt-3">
            <small>
              <strong>Recuerda:</strong> Los cambios legales deben ser revisados por un abogado.
            </small>
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Entendido",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  };

  const handleActualizarTodos = () => {
    Swal.fire({
      title: "Generar PDF de Documentos",
      html: `
        <div class="text-start">
          <p>Los documentos legales se generan directamente desde los componentes React. No es necesario sincronizar archivos.</p>

          <div class="alert alert-info">
            <p class="mb-2"><strong>Para generar PDF:</strong></p>
            <ol class="mb-0 small">
              <li>Haz clic en "Imprimir / Guardar PDF" en el documento deseado</li>
              <li>Usa la función de impresión del navegador</li>
              <li>Selecciona "Guardar como PDF" como destino</li>
              <li>Los cambios en los componentes React se reflejan automáticamente</li>
            </ol>
          </div>

          <p class="mt-3"><strong>Ventaja:</strong></p>
          <p class="small">Al editar los componentes React, los cambios se aplican automáticamente tanto en la vista del panel como al generar PDF. No hay duplicación de contenido.</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Entendido",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  };

  const handleVersiones = () => {
    Swal.fire({
      title: "Versiones de Documentos",
      html: `
        <div class="text-start">
          <p><strong>Versión Actual:</strong> v2.0 (Febrero 2026)</p>

          <h6 class="mt-4">Cambios en esta versión:</h6>
          <ul class="small">
            <li>Agregada Sección 11: Protección de Datos Personales y Derechos ARCO</li>
            <li>Agregada Sección 16: Renovación Automática de Planes</li>
            <li>Agregada Sección 17: Período de Prueba (Trial)</li>
            <li>Actualizada Ley 25.326 de Argentina</li>
            <li>Cumplimiento GDPR para Europa</li>
            <li>Política de Cookies con detalles de Google Analytics</li>
          </ul>

          <h6 class="mt-4">Versiones anteriores:</h6>
          <ul class="small">
            <li>v1.0 (Enero 2026) - Versión inicial con 16 secciones</li>
          </ul>

          <div class="alert alert-info mt-3">
            <small>
              <strong>Historial:</strong> Se recomienda mantener un backup de las versiones anteriores
              en caso de disputas legales o auditorías.
            </small>
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  };

  return (
    <div className="container mt-4">
      <div
        className="card shadow-lg"
        style={{
          backgroundColor: "#222",
          border: "1px solid var(--tenant-primary-color)",
          borderRadius: "12px",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2
                className="fw-bold mb-1"
                style={{ color: "var(--tenant-primary-color)" }}
              >
                Administración de Documentos Legales
              </h2>
              <p className="mb-0" style={{ color: "#fff" }}>
                Gestiona Términos y Condiciones, Política de Privacidad y Política de Cookies
              </p>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-info"
                onClick={handleActualizarTodos}
                title="Generar PDF de documentos"
              >
                Generar PDF
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleVersiones}
                title="Ver historial de versiones"
              >
                Versiones
              </button>
            </div>
          </div>

          <div className="alert alert-warning mb-4">
            <p className="mb-1">
              <strong>Importante:</strong> Los cambios en los documentos legales deben ser revisados por un abogado.
            </p>
            <p className="mb-0 small">
              Las modificaciones afectan directamente a todos los clientes de la plataforma.
            </p>
          </div>

          {/* Grid de documentos */}
          <div className="row">
            {documentos.map((doc) => (
              <div key={doc.id} className="col-md-6 mb-4">
                <div
                  className="card h-100"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid var(--tenant-primary-color)",
                    borderRadius: "8px",
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-start mb-3">
                      <span
                        className="fs-1 me-3"
                        style={{ fontSize: "3rem" }}
                      >
                        {doc.icono}
                      </span>
                      <div className="flex-grow-1">
                        <h5 className="card-title fw-bold mb-2" style={{ color: "#fff" }}>{doc.titulo}</h5>
                        <p className="small mb-2" style={{ color: "#fff" }}>{doc.descripcion}</p>
                        {doc.secciones > 0 && (
                          <span className="badge bg-secondary">
                            {doc.secciones} secciones
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="small mb-1" style={{ color: "#fff" }}>
                        <strong style={{ color: "#fff" }}>Última actualización:</strong> {doc.ultimoActualizacion}
                      </p>
                      <p className="small mb-0" style={{ color: "#fff" }}>
                        <strong style={{ color: "#fff" }}>Componente:</strong> <code className="small" style={{ color: "#fff" }}>{doc.archivo}</code>
                      </p>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-orange btn-sm"
                        onClick={() => handleDescargar(doc)}
                      >
                        Imprimir / Guardar PDF
                      </button>
                      <div className="btn-group">
                        <button
                          className="btn btn-outline-secondary btn-sm flex-grow-1"
                          onClick={() => handleVistaPrevia(doc)}
                        >
                          Vista Previa
                        </button>
                        <button
                          className="btn btn-outline-warning btn-sm flex-grow-1"
                          onClick={() => handleEditar(doc)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-outline-info btn-sm flex-grow-1"
                          onClick={() => handleVerCodigo(doc)}
                        >
                          Ver Código
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sección de ayuda */}
          <div className="card mt-4" style={{ backgroundColor: "#1a1a1a", border: "1px solid #444" }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: "#fff" }}>Guía de Uso</h6>
              <div className="row">
                <div className="col-md-4">
                  <h6 style={{ color: "#fff" }}>Editar Contenido</h6>
                  <p className="small mb-0" style={{ color: "#fff" }}>
                    Modifica los componentes React en <code style={{ color: "#fff" }}> /views/saas/ </code>.
                    Los cambios se reflejan automáticamente en la vista y al imprimir.
                  </p>
                </div>
                <div className="col-md-4">
                  <h6 style={{ color: "#fff" }}>Generar PDF</h6>
                  <p className="small mb-0" style={{ color: "#fff" }}>
                    Usa "Imprimir / Guardar PDF" para generar un PDF directamente
                    desde el contenido actualizado.
                  </p>
                </div>
                <div className="col-md-4">
                  <h6 style={{ color: "#fff" }}>Vista Previa</h6>
                  <p className="small mb-0" style={{ color: "#fff" }}>
                    Verifica cómo se ve el documento antes de imprimir.
                  </p>
                </div>
              </div>

              <hr className="my-3" style={{ borderColor: "#444" }} />

              <div className="alert alert-info mb-0" style={{ backgroundColor: "#0d6efd", color: "#fff" }}>
                <h6 className="fw-bold">Ventajas del Nuevo Sistema</h6>
                <ul className="small mb-0" style={{ color: "#fff" }}>
                  <li>No hay duplicación de contenido - Solo editas los componentes React</li>
                  <li>Los cambios se reflejan automáticamente en la vista y al generar PDF</li>
                  <li>Estilos consistentes entre vista en pantalla y documento impreso</li>
                  <li>Los PDFs siempre tendrán el contenido más actualizado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
