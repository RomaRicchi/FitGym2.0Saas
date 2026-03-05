import { useState } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

interface CheckoutResponse {
  init_point: string;
  preference_id: string;
  total: number;
  application_fee: number;
}

export default function PaymentsTest() {
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<CheckoutResponse | null>(null);

  const handleSimpleCheckout = async () => {
    try {
      setLoading(true);
      const res = await gymApi.post<CheckoutResponse>("/payments/test-checkout/simple");

      setLastResponse(res.data);
      setCheckoutUrl(res.data.init_point);

      Swal.fire({
        icon: "success",
        title: "Checkout Creado",
        html: `
          <p>Se creó la preferencia de pago exitosamente:</p>
          <ul class="text-start">
            <li><strong>Total:</strong> $${res.data.total}</li>
            <li><strong>Commission:</strong> $${res.data.application_fee}</li>
            <li><strong>Preference ID:</strong> ${res.data.preference_id}</li>
          </ul>
          <p class="mt-3">Haz clic en "Abrir Checkout" para pagar</p>
        `,
        confirmButtonText: "Abrir Checkout",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed && res.data.init_point) {
          window.open(res.data.init_point, "_blank");
        }
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo crear el checkout",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
    }
  };

  const handleReset = () => {
    setCheckoutUrl(null);
    setLastResponse(null);
  };

  return (
    <div
      className="container mt-4"
      style={{
        backgroundColor: "#121212",
        color: "#f5f5f5",
        padding: "1.5rem",
        borderRadius: "12px",
      }}
    >
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="fa fa-credit-card me-2" aria-hidden="true"></i>
            Test Checkout Pro
          </h2>
          <div
            className="alert alert-info bg-opacity-10 border-0"
            style={{ backgroundColor: "rgba(0,123,255,0.15)", color: "#eaf4ff" }}
          >
            <strong>
              <i className="fa fa-info-circle me-1" aria-hidden="true"></i>
              Info:
            </strong>{" "}
            Este es un endpoint de prueba para verificar que el flujo de pagos
            funciona correctamente con la cuenta de Mercado Pago del gimnasio.
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4" style={{ backgroundColor: "#1e1e1e", color: "#f5f5f5", border: "1px solid var(--tenant-primary-color)" }}>
            <div className="card-header text-white" style={{ backgroundColor: "var(--tenant-primary-color)" }}>
              <h5 className="mb-0">Crear Checkout de Prueba</h5>
            </div>
            <div className="card-body" style={{ color: "#f5f5f5" }}>
              <p style={{ color: "#ddd" }}>
                Este endpoint crea una preferencia de pago con los siguientes valores:
              </p>
              <ul style={{ color: "#f5f5f5" }}>
                <li><strong>Ítem:</strong> Suscripción Mensual - Gym Test</li>
                <li><strong>Monto:</strong> $1000 ARS</li>
                <li><strong>Comisión:</strong> 10% ($100 ARS)</li>
                <li><strong>Método de pago:</strong> Tarjeta (efectivo excluido)</li>
                <li><strong>Cuotas:</strong> 1 pago</li>
              </ul>

              <div className="d-grid gap-2 mt-3">
                <button
                  onClick={handleSimpleCheckout}
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-cart-arrow-down me-2" aria-hidden="true"></i>
                      Crear Checkout ($1000 ARS)
                    </>
                  )}
                </button>

                {checkoutUrl && (
                  <>
                    <button onClick={handleOpenCheckout} className="btn btn-success">
                      <i className="fa fa-external-link me-2" aria-hidden="true"></i>
                      Abrir Checkout Pro
                    </button>
                    <button onClick={handleReset} className="btn btn-secondary">
                      <i className="fa fa-undo me-2" aria-hidden="true"></i>
                      Reiniciar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Explicación del flujo */}
          <div className="card bg-light" style={{ backgroundColor: "#1e1e1e", color: "#f5f5f5", border: "1px solid #333" }}>
            <div className="card-body" style={{ color: "#f5f5f5" }}>
              <h6 className="fw-bold mb-2">
                <i className="fa fa-list-ol me-2" aria-hidden="true"></i>
                Flujo del pago:
              </h6>
              <ol className="small mb-0">
                <li>Click en "Crear Checkout"</li>
                <li>Se crea preferencia en Mercado Pago con application_fee</li>
                <li>Click en "Abrir Checkout Pro"</li>
                <li>Completar el pago con tarjeta de prueba</li>
                <li>Verificar en dashboard de Mercado Pago que:
                  <ul className="mt-1">
                    <li>El pago está acreditado</li>
                    <li>La Comisión fue descontada</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {lastResponse && (
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fa fa-check-circle me-2" aria-hidden="true"></i>
                  Última Respuesta
                </h5>
              </div>
              <div className="card-body">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th>Total:</th>
                      <td>${lastResponse.total}</td>
                    </tr>
                    <tr>
                      <th>Commission (10%):</th>
                      <td className="text-warning">${lastResponse.application_fee}</td>
                    </tr>
                    <tr>
                      <th>Monto neto gym:</th>
                      <td className="text-success">${lastResponse.total - lastResponse.application_fee}</td>
                    </tr>
                    <tr>
                      <th>Preference ID:</th>
                      <td>
                        <code>{lastResponse.preference_id}</code>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-3">
                  <p className="small text-muted mb-2">
                    <strong>Init Point:</strong>
                  </p>
                  <p className="small text-break mb-0">
                    <a
                      href={lastResponse.init_point}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-truncate d-block"
                    >
                      {lastResponse.init_point}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card mt-3 bg-warning bg-opacity-10" style={{ backgroundColor: "rgba(255,193,7,0.12)", color: "#f5f5f5", border: "1px solid #8a6d3b" }}>
            <div className="card-body">
              <h6 className="fw-bold mb-2">
                <i className="fa fa-exclamation-triangle me-2 text-warning"></i>
                Importante - Tarjetas de Prueba
              </h6>
              <p className="small mb-1" style={{ color: "#f5f5f5" }}>
                Para probar el pago, usa estas tarjetas de Mercado Pago:
              </p>
              <ul className="small mb-0" style={{ color: "#f5f5f5" }}>
                <li><strong>Aprobado:</strong> 5031 7557 3453 0604</li>
                <li><strong>Rechazado:</strong> 5115 4174 9357 0893</li>
                <li><strong>Cualquier fecha de vencimiento futura</strong></li>
                <li><strong>Cualquier código de seguridad (3 dígitos)</strong></li>
              </ul>
            </div>
          </div>

          <div className="card mt-3 bg-info bg-opacity-10" style={{ backgroundColor: "rgba(13,110,253,0.12)", color: "#f5f5f5", border: "1px solid #0d6efd" }}>
            <div className="card-body">
              <h6 className="fw-bold mb-2">
                <i className="fa fa-search me-2"></i>
                Verificar el Dinero
              </h6>
              <p className="small mb-0" style={{ color: "#e0e0e0" }}>
                Después del pago, verifica en tu dashboard de Mercado Pago:
                <br />
                <a
                  href="https://www.mercadopago.com.ar/checkout/payments"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#c6dcff" }}
                >
                  <i className="fa fa-money-bill me-2"></i>
                  Ver movimientos en Mercado Pago →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


