import { useState } from "react";
import Swal from "sweetalert2";
import saasApi, { CuentaSaaSDto, CancelarServicioRequest } from "@/api/saasApi";

interface Props {
  cuenta: CuentaSaaSDto;
  onCanceled: () => void;
}

/**
 * Componente para cancelar el servicio SaaS
 */
export default function CancelarServicio({ cuenta, onCanceled }: Props) {
  const [motivo, setMotivo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [cancelacionInmediata, setCancelacionInmediata] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const motivos = [
    "El servicio no cumple con mis expectativas",
    "Problemas técnicos frecuentes",
    "El precio es muy alto",
    "Encontré una alternativa mejor",
    "Necesidad temporal del servicio",
    "Cierre del negocio",
    "Servicio al cliente insatisfactorio",
    "Falta de funcionalidades necesarias",
    "Otros",
  ];

  const handleCancelar = async () => {
    if (!motivo) {
      Swal.fire({
        icon: "warning",
        title: "Motivo requerido",
        text: "Por favor, selecciona el motivo de la cancelación",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    const mensajeCancelacion = cancelacionInmediata
      ? "¿Estás seguro de que deseas CANCELAR INMEDIATAMENTE tu servicio? Perderás acceso a todos los datos y funcionalidades de inmediato."
      : `Tu servicio continuará activo hasta el ${cuenta.planActual?.planVenceEn
          ? new Date(cuenta.planActual.planVenceEn).toLocaleDateString("es-AR")
          : "la fecha de vencimiento"
        }. Luego será cancelado automáticamente.`;

    const confirm = await Swal.fire({
      title: "¿Cancelar servicio?",
      html: `
        <div class="text-start">
          <p>${mensajeCancelacion}</p>
          <p class="text-danger fw-bold">
            <i className="fa-solid fa-triangle-exclamation"></i> Esta acción no se puede deshacer
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: '&lt;i class="fa-solid fa-circle-check"&gt;&lt;/i&gt; Sí, cancelar servicio',
      cancelButtonText: '&lt;i class="fa-solid fa-circle-xmark"&gt;&lt;/i&gt; Volver',
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (confirm.isConfirmed) {
      setProcesando(true);
      try {
        const request: CancelarServicioRequest = {
          motivo,
          comentarios,
          cancelacionInmediata,
        };

        const response = await saasApi.cancelarServicio(request);

        Swal.fire({
          icon: "success",
          title: "Servicio cancelado",
          html: `
            <div class="text-start">
              <p>${response.mensaje}</p>
              <p><strong>Fecha de finalización:</strong> ${new Date(response.fechaFin).toLocaleDateString("es-AR")}</p>
              ${response.cancelacionInmediata
                ? '<p class="text-danger">Tu acceso ha sido terminado inmediatamente.</p>'
                : '<p class="text-info">Seguirás teniendo acceso hasta la fecha mencionada.</p>'
              }
            </div>
          `,
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        }).then(() => {
          onCanceled();
        });
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo procesar la cancelación",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
            cancelButton: "btn btn-secondary",
          },
          buttonsStyling: false,
        });
      } finally {
        setProcesando(false);
      }
    }
  };

  const handleContactarSoporte = () => {
    Swal.fire({
      title: "¿Problemas con el servicio?",
      html: `
        <div class="text-start">
          <p>Antes de irte, queremos ayudarte. Si tienes algún problema o sugerencia, contáctanos:</p>
          <ul>
            <li><strong>Formulario:</strong> Disponible en "Ayuda &gt; Contacto"</li>
            <li><strong>Sitio web:</strong> https://www.zinnia-code.com</li>
          </ul>
        </div>
      `,
      icon: "question",
      confirmButtonText: "Entendido",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  };

  return (
    <div>
      {!cuenta.activo ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-3">
              <span style={{ fontSize: "4rem" }}><i className="fa-solid fa-circle-xmark"></i></span>
            </div>
            <h4 className="mb-3">Servicio Cancelado</h4>
            <p className="text-muted mb-4">
              Tu servicio ya ha sido cancelado. Si deseas reactivarlo, contacta a nuestro equipo de soporte.
            </p>
            <button
              className="btn btn-orange"
              onClick={handleContactarSoporte}
              style={{
                backgroundColor: "var(--tenant-primary-color)",
                borderColor: "var(--tenant-primary-color)",
              }}
            >
              <i className="fa-solid fa-comments"></i> Contactar Soporte
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Advertencia */}
          <div className="alert alert-danger mb-4">
            <strong><i className="fa-solid fa-triangle-exclamation"></i> ADVERTENCIA:</strong>
            <ul className="mb-0 mt-2">
              <li>Esta acción no se puede deshacer</li>
              <li>Perderás acceso a todos tus datos al finalizar el servicio</li>
              <li>No hay penalizaciones por cancelación</li>
              <li>Puedes reactivar tu servicio en cualquier momento</li>
            </ul>
          </div>

          {/* Formulario de cancelación */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0"><i className="fa-solid fa-circle-xmark"></i> Cancelar Servicio</h5>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => { e.preventDefault(); handleCancelar(); }}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Motivo de la cancelación <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    disabled={procesando}
                    required
                    style={{
                      borderColor: "var(--tenant-primary-color)",
                    }}
                  >
                    <option value="">Selecciona un motivo...</option>
                    {motivos.map((m, index) => (
                      <option key={index} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Comentarios adicionales
                  </label>
                  <textarea
                    className="form-control"
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    disabled={procesando}
                    rows={4}
                    placeholder="Cuéntanos más sobre por qué te vas (opcional)..."
                    style={{
                      borderColor: "var(--tenant-primary-color)",
                    }}
                  />
                  <small className="text-muted">
                    Tus comentarios nos ayudan a mejorar el servicio
                  </small>
                </div>

                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cancelacionInmediata"
                      checked={cancelacionInmediata}
                      onChange={(e) => setCancelacionInmediata(e.target.checked)}
                      disabled={procesando}
                    />
                    <label className="form-check-label" htmlFor="cancelacionInmediata">
                      <strong>Cancelar inmediatamente</strong> (perderás acceso ya mismo)
                    </label>
                  </div>
                  <small className="text-muted d-block ms-4">
                    Si no marcas esta opción, el servicio continuará activo hasta que termine tu período de facturación actual
                    {cuenta.planActual?.planVenceEn && ` (${new Date(cuenta.planActual.planVenceEn).toLocaleDateString("es-AR")})`}
                  </small>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleContactarSoporte}
                    disabled={procesando}
                  >
                    <i className="fa-solid fa-comments"></i> Contactar Soporte
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={procesando}
                  >
                    {procesando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      <><i className="fa-solid fa-circle-xmark"></i> Cancelar Servicio</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Información sobre exportación de datos */}
          <div className="alert alert-info">
            <strong><i className="fa-solid fa-lightbulb"></i> ¿Qué pasa con mis datos?</strong>
            <p className="mb-2 mt-2">
              Antes de cancelar, te recomendamos:
            </p>
            <ul className="mb-0">
              <li>Exportar tus datos de socios, personal y configuraciones</li>
              <li>Descargar tus reportes financieros</li>
              <li>Guardar un respaldo de tu información</li>
            </ul>
            <button
              className="btn btn-sm btn-outline-info mt-2"
              onClick={() => Swal.fire({
                title: "Exportar datos",
                text: "Esta funcionalidad estará disponible próximamente. Por ahora, contacta a soporte para solicitar una exportación de tus datos.",
                icon: "info",
                customClass: {
                  popup: "swal2-card-style",
                  confirmButton: "btn btn-orange",
                },
                buttonsStyling: false,
              })}
            >
              <i className="fa-solid fa-download"></i> Solicitar exportación de datos
            </button>
          </div>

          {/* Oferta de retención */}
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="fw-bold mb-2"><i className="fa-solid fa-face-thinking"></i> ¿Tenemos una segunda oportunidad?</h6>
              <p className="mb-2">
                Si cancelas por el precio o funcionalidades, podemos ofrecerte:
              </p>
              <ul className="mb-3">
                <li>Un mes gratis de cualquier plan superior</li>
                <li>Descuentos especiales por lealtad</li>
                <li>Funcionalidades personalizadas</li>
              </ul>
              <button
                className="btn btn-sm btn-orange"
                onClick={handleContactarSoporte}
                style={{
                  backgroundColor: "var(--tenant-primary-color)",
                  borderColor: "var(--tenant-primary-color)",
                }}
              >
                <i className="fa-solid fa-comments"></i> Hablar con un asesor
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


