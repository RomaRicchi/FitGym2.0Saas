import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import { Button } from "react-bootstrap";
import saasApi, { CuentaSaaSDto, PlanSaaSDto, CambioPlanApiResponse } from "@/api/saasApi";
import ModalPagoSaaS from "./ModalPagoSaaS";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faBan, faListCheck, faScroll, faFloppyDisk, faRotate } from "@fortawesome/free-solid-svg-icons";

interface Props {
  cuenta: CuentaSaaSDto;
  planes: PlanSaaSDto[];
  onChanged: () => void;
}

/**
 * Componente para cambiar el plan SaaS con integración de pago MercadoPago
 */
export default function CambiarPlan({ cuenta, planes, onChanged }: Props) {
  const navigate = useNavigate();
  const [planSeleccionado, setPlanSeleccionado] = useState<number | null>(null);
  const [esAnual, setEsAnual] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mostrarPagoModal, setMostrarPagoModal] = useState(false);
  const [planParaPagar, setPlanParaPagar] = useState<{plan: PlanSaaSDto; esAnual: boolean} | null>(null);

  const planActualId = cuenta.planActual?.id;

  const handleSeleccionarPlan = (planId: number) => {
    setPlanSeleccionado(planId);
  };

  const handleConfirmarCambio = async () => {
    if (!planSeleccionado) {
      Swal.fire({
        icon: "warning",
        title: `<div style="display:flex;align-items:center;gap:8px;justify-content:center;"><i className="fa-solid fa-triangle-exclamation"></i> Selecciona un plan</div>`,
        text: "Debes seleccionar un plan para continuar",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    const plan = planes.find(p => p.id === planSeleccionado);
    if (!plan) return;

    const planActual = planes.find(p => p.id === planActualId);
    if (!planActual) return;

    // VALIDACIÓN: No permitir bajar de plan si hay exceso de socios
    const esBajarDePlan = plan.maxSocios < planActual.maxSocios;
    const sociosActivos = cuenta.estadisticasUso?.sociosActivos || 0;
    const excedeLimite = sociosActivos > plan.maxSocios;

    if (esBajarDePlan && excedeLimite && plan.maxSocios > 0) {
      Swal.fire({
        title: `<div style="display:flex;align-items:center;gap:8px;justify-content:center;"><i className="fa-solid fa-ban"></i> No puedes bajar a este plan</div>`,
        html: `
          <div class="text-start">
            <p>Tienes <strong>${sociosActivos} socios activos</strong> actualmente.</p>
            <p>El plan <strong>${plan.nombre}</strong> permite máximo <strong>${plan.maxSocios} socios</strong>.</p>
            <hr>
            <p class="text-danger fw-bold"><i className="fa-solid fa-triangle-exclamation"></i> Según nuestros Términos y Condiciones (Sección 5):</p>
            <p><em>"NO se permite bajar de plan si la cantidad actual de socios activos supera el límite del plan inferior."</em></p>
            <hr>
            <p><strong><i className="fa-solid fa-list-check"></i> Para poder cambiar a este plan, debes:</strong></p>
            <ol>
              <li>Ir a la sección <strong>"Socios"</strong></li>
              <li>Dar de baja a <strong>${sociosActivos - plan.maxSocios} socios</strong> (cambiarlos a estado "inactivo")</li>
              <li>Volver aquí y seleccionar el plan nuevamente</li>
            </ol>
            <div class="alert alert-info mt-3 mb-0">
              <small><strong><i className="fa-solid fa-floppy-disk"></i> Los socios dados de baja NO se borran.</strong> Se mantienen en el historial con estado "inactivo" y puedes reactivarlos cuando quieras, respetando el límite de tu plan.</small>
            </div>
            <hr>
            <p class="small text-muted mb-0">
              <a href="#" onclick="window.location.hash='terminos'; return false;"><i className="fa-solid fa-scroll"></i> Ver Términos y Condiciones completos (Sección 5)</a>
            </p>
          </div>
        `,
        icon: "error",
        confirmButtonText: "Entendido",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    const precio = esAnual ? plan.precioAnual : plan.precioMensual;
    const periodo = esAnual ? "año" : "mes";

    const confirm = await Swal.fire({
      title: `<div style="display:flex;align-items:center;gap:8px;justify-content:center;"><i className="fa-solid fa-rotate"></i> ¿Confirmar cambio de plan?</div>`,
      html: `
        <div class="text-start">
          <p>Vas a cambiar tu plan a:</p>
          <ul>
            <li><strong>Plan:</strong> ${plan.nombre}</li>
            <li><strong>Precio:</strong> $${precio} ARS/${periodo}</li>
            <li><strong>Facturación:</strong> ${esAnual ? "Anual (ahorras 17%)" : "Mensual"}</li>
          </ul>
          <p class="text-warning">
            ${planActualId === planSeleccionado
              ? "<i class='fa-solid fa-triangle-exclamation'></i> Estás seleccionando el mismo plan que tienes."
              : "<i class='fa-solid fa-check'></i> Serás redirigido a MercadoPago para completar el pago."}
          </p>
          <div class="mt-3 p-3" style="background: #f0f0f0; border-radius: 8px;">
            <p class="mb-1"><strong><i className="fa-solid fa-credit-card"></i> Pago seguro</strong></p>
            <p class="small text-muted mb-0">Serás redirigido a MercadoPago para completar el pago de forma segura.</p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: '&lt;i class="fa-solid fa-credit-card"&gt;&lt;/i&gt; Ir a Pagar',
      cancelButtonText: '&lt;i class="fa-solid fa-circle-xmark"&gt;&lt;/i&gt; Cancelar',
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn-mercadopago",
        cancelButton: "btn-secondary",
      },
      buttonsStyling: false,
    });

    if (confirm.isConfirmed) {
      // Llamar al backend para cambiar el plan con PreApproval
      setProcesando(true);

      try {
        const response = await saasApi.cambiarPlan({
          planSaasId: planSeleccionado!,
          esAnual
        });

        setProcesando(false);

        if (response.success && response.data) {
          // Verificar si es un CambioPlanResponseDto (tiene preapprovalUrl)
          if ('preapprovalUrl' in response.data) {
            const preapprovalUrl = response.data.preapprovalUrl;

            // CASO A: Respuesta exitosa con preapprovalUrl
            const result = await Swal.fire({
              icon: "info",
              title: "Autorizar nuevo plan",
              html: "Tu plan cambiará al siguiente ciclo de facturación.<br><br>" +
                     "Necesitás autorizar el nuevo cobro automático en MercadoPago.",
              showCancelButton: true,
              confirmButtonText: "Autorizar en MercadoPago",
              cancelButtonText: "Cancelar",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn-mercadopago",
                cancelButton: "btn-secondary",
              },
              buttonsStyling: false,
            });

            if (result.isConfirmed) {
              window.open(preapprovalUrl, '_blank');
            }
          }
          // Verificar si es un CambioPlanErrorResponseDto (tiene sociosADarDeBaja)
          else if ('sociosADarDeBaja' in response.data) {
            const errorData = response.data;

            // CASO B: Error por límite de socios
            const result = await Swal.fire({
              icon: "warning",
              title: "No podés bajar de plan",
              html: errorData.mensajeError,
              showCancelButton: true,
              confirmButtonText: "Ir a Socios",
              cancelButtonText: "Entendido",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
                cancelButton: "btn-secondary",
              },
              buttonsStyling: false,
            });

            if (result.isConfirmed) {
              navigate('/socios');
            }
          }
        }
      } catch (error: any) {
        setProcesando(false);

        // Manejar errores HTTP
        if (error.response?.status === 400 && error.response?.data?.data) {
          const errorData = error.response.data.data;

          // Verificar si es un error por límite de socios
          if ('sociosADarDeBaja' in errorData) {
            // CASO B: Error por límite de socios (desde el error handler)
            const result = await Swal.fire({
              icon: "warning",
              title: "No podés bajar de plan",
              html: errorData.mensajeError,
              showCancelButton: true,
              confirmButtonText: "Ir a Socios",
              cancelButtonText: "Entendido",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
                cancelButton: "btn-secondary",
              },
              buttonsStyling: false,
            });

            if (result.isConfirmed) {
              navigate('/socios');
            }
          } else {
            // Otro error 400
            await Swal.fire({
              icon: "error",
              title: "Error al cambiar plan",
              text: error.response.data.message || "Ocurrió un error al procesar tu solicitud",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
              },
              buttonsStyling: false,
            });
          }
        } else {
          // Error genérico
          await Swal.fire({
            icon: "error",
            title: "Error al cambiar plan",
            text: error.message || "Ocurrió un error al procesar tu solicitud",
            customClass: {
              popup: "swal2-card-style",
              confirmButton: "btn btn-orange",
            },
            buttonsStyling: false,
          });
        }
      }
    }
  };

  const handlePagoCompletado = () => {
    setMostrarPagoModal(false);
    setPlanParaPagar(null);
    setPlanSeleccionado(null);
    onChanged(); // Refrescar datos
    Swal.fire({
      icon: "success",
      title: "¡Plan cambiado!",
      text: "Tu suscripción ha sido activada correctamente",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  const handleCancelarPago = () => {
    setMostrarPagoModal(false);
    setPlanParaPagar(null);
  };

  return (
    <div>
      {/* Toggle mensual/anual */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body text-center">
          <div className="d-flex justify-content-center align-items-center gap-3">
            <span className={`fw-bold fs-5 ${!esAnual ? "text-orange" : "text-muted"}`}>
              Mensual
            </span>

            {/* Switch toggle mejorado */}
            <div
              className="rounded-pill position-relative cursor-pointer"
              style={{
                width: "70px",
                height: "36px",
                backgroundColor: esAnual ? "var(--tenant-primary-color)" : "#e0e0e0",
                border: `2px solid ${esAnual ? "var(--tenant-primary-color)" : "#ccc"}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={() => setEsAnual(!esAnual)}
              role="switch"
              aria-checked={esAnual}
              tabIndex={0}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: esAnual ? "35px" : "3px",
                  transition: "left 0.3s ease",
                  display: "block",
                  width: "24px",
                  height: "24px",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </div>

            <span className={`fw-bold fs-5 ${esAnual ? "text-orange" : "text-muted"}`}>
              Anual
            </span>
            <span className="badge bg-success ms-1 fs-6">Ahorras 17%</span>
          </div>
        </div>
      </div>

      {/* Grid de planes */}
      <div className="row">
        {planes.map((plan) => {
          const precio = esAnual ? plan.precioAnual : plan.precioMensual;
          const esPlanActual = plan.id === planActualId;
          const estaSeleccionado = planSeleccionado === plan.id;

          // <i className="fa-solid fa-triangle-exclamation"></i> Verificar si es un plan inferior con menos socios de los activos
          const planActual2 = planes.find((p: PlanSaaSDto) => p.id === planActualId);
          const esPlanInferior = planActual2 && plan.maxSocios < planActual2.maxSocios;
          const sociosActivos = cuenta.estadisticasUso?.sociosActivos || 0;
          const noPermitidoPorExceso = esPlanInferior && sociosActivos > plan.maxSocios && plan.maxSocios > 0;

          return (
            <div key={plan.id} className="col-md-4 mb-4">
              <div
                className={`card h-100 shadow position-relative ${estaSeleccionado ? "border-warning" : ""} ${esPlanActual ? "border-success" : ""} ${noPermitidoPorExceso ? "opacity-75" : ""}`}
                style={{
                  borderWidth: estaSeleccionado ? "3px" : "1px",
                  cursor: noPermitidoPorExceso ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => !noPermitidoPorExceso && handleSeleccionarPlan(plan.id)}
              >
                {esPlanActual && (
                  <div className="card-header bg-success text-white text-center py-2">
                    <strong><i className="fa-solid fa-circle-check"></i> Plan Actual</strong>
                  </div>
                )}
                {noPermitidoPorExceso && !esPlanActual && (
                  <div className="card-header bg-danger text-white text-center py-2">
                    <strong><i className="fa-solid fa-triangle-exclamation"></i> No Disponible</strong>
                  </div>
                )}
                {estaSeleccionado && !esPlanActual && !noPermitidoPorExceso && (
                  <div
                    className="card-header text-white text-center py-2"
                    style={{ backgroundColor: "var(--tenant-primary-color)" }}
                  >
                    <strong><i className='fa-solid fa-hand-point-up'></i> Seleccionado</strong>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title text-center fw-bold mb-3">
                    {plan.nombre}
                  </h5>
                  <div className="text-center mb-3">
                    <h3 className="fw-bold text-orange">
                      ${precio}
                      <small className="text-muted fs-6">/mes</small>
                    </h3>
                    {esAnual && (
                      <p className="text-success mb-0 fw-semibold">
                        ${plan.precioAnual}/año (ahorras ${(plan.precioMensual * 12 - plan.precioAnual).toFixed(0)})
                      </p>
                    )}
                  </div>
                  <hr />
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="fa-solid fa-users"></i> <strong>{plan.maxSocios === 0 ? "Ilimitados" : plan.maxSocios}</strong> socios
                    </li>
                    <li className="mb-2">
                      <i className="fa-solid fa-dumbbell"></i> <strong>{plan.maxPersonal === 0 ? "Ilimitados" : plan.maxPersonal}</strong> instructores
                    </li>
                    <li className="mb-2">
                      <i className="fa-solid fa-building"></i> <strong>{plan.maxSalas === 0 ? "Ilimitadas" : plan.maxSalas}</strong> salas
                    </li>
                    <li className="mb-2">
                      <i className="fa-solid fa-clock"></i> <strong>{plan.maxTurnosPorDia === 0 ? "Ilimitados" : plan.maxTurnosPorDia}</strong> turnos/día
                    </li>
                  </ul>
                </div>
                <div className="card-footer bg-transparent border-0">
                  <button
                    className={`btn w-100 ${
                      noPermitidoPorExceso
                        ? "btn-secondary"
                        : estaSeleccionado
                        ? "btn-orange"
                        : esPlanActual
                        ? "btn-success"
                        : "btn-outline-orange"
                    }`}
                    disabled={procesando || noPermitidoPorExceso}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!noPermitidoPorExceso) {
                        handleSeleccionarPlan(plan.id);
                      }
                    }}
                    title={noPermitidoPorExceso ? `Tienes ${sociosActivos} socios, este plan permite solo ${plan.maxSocios}` : undefined}
                  >
                    {noPermitidoPorExceso
                      ? <><i className="fa-solid fa-triangle-exclamation"></i> Excedes el límite ({sociosActivos}/{plan.maxSocios})</>
                      : esPlanActual
                      ? "Plan Actual"
                      : estaSeleccionado
                      ? <><i className='fa-solid fa-check'></i> Seleccionado</>
                      : "Seleccionar"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de confirmación */}
      {planSeleccionado && planSeleccionado !== planActualId && (
        <div className="card mt-4 border-0 shadow-lg">
          <div className="card-body text-center" style={{ backgroundColor: "#fff8f0" }}>
            <h5 className="mb-3" style={{ color: "var(--tenant-primary-color)" }}>¿Listo para cambiar tu plan?</h5>
            <p className="text-muted mb-4">
              Serás redirigido a MercadoPago para completar el pago de forma segura.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-secondary btn-lg px-4"
                onClick={() => {
                  setPlanSeleccionado(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-mercadopago btn-lg px-4"
                onClick={handleConfirmarCambio}
                disabled={procesando}
                title="Pagar con MercadoPago"
              >
                <img src="/Mercado-Pago-Logo-Vector.svg-1-1.png" alt="MercadoPago" style={{ height: "32px" }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      <ModalPagoSaaS
        show={mostrarPagoModal}
        plan={planParaPagar?.plan ?? null}
        esAnual={planParaPagar?.esAnual || false}
        onCancelar={handleCancelarPago}
        onPagoCompletado={handlePagoCompletado}
      />

      {/* Información adicional */}
      <div className="alert alert-info mt-4">
        <strong><i className="fa-solid fa-circle-info"></i> Información importante:</strong>
        <ul className="mb-0 mt-2">
          <li><i className="fa-solid fa-credit-card"></i> Los pagos se procesan de forma segura a través de MercadoPago</li>
          <li><i className="fa-solid fa-circle-check"></i> Podrás pagar con tarjeta de crédito, débito, dinero en cuenta, etc.</li>
          <li><i className="fa-solid fa-chart-line"></i> Puedes <strong>subir</strong> de plan en cualquier momento sin penalizaciones</li>
          <li><i className="fa-solid fa-arrow-trend-down"></i> Para <strong>bajar</strong> de plan, debes tener menos socios que el límite del plan inferior</li>
          <li><i className="fa-solid fa-calendar-days"></i> Los planes anuales tienen un 17% de descuento</li>
          <li><i className="fa-solid fa-scroll"></i> Revisa nuestros <a href="#terminos" className="alert-link">Términos y Condiciones</a> (Sección 5) sobre cambios de plan</li>
        </ul>
      </div>
    </div>
  );
}
