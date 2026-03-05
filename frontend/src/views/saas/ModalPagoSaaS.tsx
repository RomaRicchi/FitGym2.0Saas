import { useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import { Button } from "react-bootstrap";
import saasApi, { PlanSaaSDto } from "@/api/saasApi";

interface Props {
  show: boolean;
  plan: PlanSaaSDto | null;
  esAnual: boolean;
  onCancelar: () => void;
  onPagoCompletado: () => void;
}

/**
 * Modal de pago para suscripciones SaaS con MercadoPago
 */
export default function ModalPagoSaaS({ show, plan, esAnual, onCancelar, onPagoCompletado }: Props) {
  const [procesando, setProcesando] = useState(false);

  const handleIniciarPago = async () => {
    if (!plan) return;

    setProcesando(true);
    try {
      // Llamar al endpoint para generar preferencia de pago
      const response = await saasApi.iniciarPagoSaaS({
        planSaasId: plan.id,
        esAnual,
      });

      // Redirigir a MercadoPago
      if (response.initPoint) {
        window.location.href = response.initPoint;
      } else {
        throw new Error("No se recibió el link de pago");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo iniciar el pago. Por favor intenta nuevamente.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      setProcesando(false);
    }
  };

  if (!plan) return null;

  const precio = esAnual ? plan.precioAnual : plan.precioMensual;
  const periodo = esAnual ? "año" : "mes";
  const ahorro = esAnual ? (plan.precioMensual * 12 - plan.precioAnual).toFixed(0) : "0";
  const footerBtnStyle = { minWidth: "150px", height: "42px" };

  return (
    <Modal show={show} onHide={onCancelar} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faCreditCard} className="me-2" />
          Pagar Suscripción
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <div className="mb-4">
            <h4 className="fw-bold mb-2">{plan.nombre}</h4>
            <div className="display-6 fw-bold text-orange mb-2">
              ${precio}
              <small className="text-muted fs-6"> ARS</small>
            </div>
            <p className="text-muted mb-0">por {periodo}</p>

            {esAnual && (
              <div className="alert alert-success mt-3 mb-0">
                <strong><i className="fa-solid fa-sparkles"></i> Ahorras ${ahorro}!</strong>
                <div className="small">Precio mensual: ${(plan.precioAnual / 12).toFixed(0)}/mes</div>
              </div>
            )}
          </div>

          <hr />

          <div className="mb-4">
            <h6 className="fw-bold">Incluye:</h6>
            <ul className="list-unstyled text-start d-inline-block">
              <li className="mb-1">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                <strong>{plan.maxSocios === 0 ? "Ilimitados" : plan.maxSocios}</strong> socios
              </li>
              <li className="mb-1">
                <FontAwesomeIcon icon={faDumbbell} className="me-2" />
                <strong>{plan.maxPersonal === 0 ? "Ilimitados" : plan.maxPersonal}</strong> instructores
              </li>
              <li className="mb-1">
                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                <strong>{plan.maxSalas === 0 ? "Ilimitadas" : plan.maxSalas}</strong> salas
              </li>
              <li className="mb-0">
                <i className="fa-solid fa-clock"></i> <strong>{plan.maxTurnosPorDia === 0 ? "Ilimitados" : plan.maxTurnosPorDia}</strong> turnos/día
              </li>
            </ul>
          </div>

          <div className="p-3" style={{ background: "#f0f0f0", borderRadius: "8px" }}>
            <p className="mb-1 fw-semibold">
              <img src="/Mercado-Pago-Logo-Vector.svg-1-1.png" alt="MercadoPago" style={{ height: "20px", marginRight: "8px" }} />
              <FontAwesomeIcon icon={faLock} className="me-2" />
              Pago seguro procesado por MercadoPago
            </p>
            <p className="small text-muted mb-0">
              Serás redirigido a MercadoPago para completar el pago de forma segura.
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onCancelar}
          disabled={procesando}
          style={footerBtnStyle}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          className="btn-mercadopago"
          onClick={handleIniciarPago}
          disabled={procesando}
          title="Pagar con MercadoPago"
          style={footerBtnStyle}
        >
          {procesando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Procesando...
            </>
          ) : (
            <>
              <img
                src="/Mercado-Pago-Logo-Vector.svg-1-1.png"
                alt="MercadoPago"
                className="mp-logo"
                style={{ height: "20px", width: "auto", display: "block", margin: "0 auto" }}
              />
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
