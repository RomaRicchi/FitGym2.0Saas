import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

interface MercadoPagoEstado {
  conectado: boolean;
  publicKey?: string;
  tokenExpiraEn?: string;
  tokenExpirado: boolean;
  fechaAutorizacion?: string;
}

interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

export default function MercadoPagoConfig() {
  const [estado, setEstado] = useState<MercadoPagoEstado | null>(null);
  const [loading, setLoading] = useState(true);
  const [autorizando, setAutorizando] = useState(false);

  const fetchEstado = async () => {
    try {
      const res = await gymApi.get<MercadoPagoEstado>("/mercadopago/oauth/estado");
      setEstado(res.data);
    } catch (err) {
      console.error("Error al obtener estado:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstado();
  }, []);

  const handleConectar = async () => {
    try {
      setAutorizando(true);
      const res = await gymApi.get<AuthUrlResponse>("/mercadopago/oauth/auth-url");

      // Redirigir a Mercado Pago para autorización
      window.location.href = res.data.authUrl;
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo generar la URL de autorización",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } finally {
      setAutorizando(false);
    }
  };

  const handleRevocar = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Â¿Desconectar Mercado Pago?",
      text: "Esta acción revocará el acceso a Mercado Pago y no podrás procesar pagos hasta volver a conectar.",
      showCancelButton: true,
      confirmButtonText: "Sí, desconectar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await gymApi.post("/mercadopago/oauth/revocar");
      await Swal.fire({
        icon: "success",
        title: "Desconectado",
        text: "La conexión con Mercado Pago ha sido revocada",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      await fetchEstado();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo revocar la conexión",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  const handleRefrescarToken = async () => {
    try {
      await gymApi.post("/mercadopago/oauth/refrescar-token");
      await Swal.fire({
        icon: "success",
        title: "Token Actualizado",
        text: "El token de acceso ha sido refrescado exitosamente",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      await fetchEstado();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo refrescar el token",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  // Verificar si venimos de un redirect de autorización exitosa
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const exito = urlParams.get("exito");

    if (exito === "true") {
      Swal.fire({
        icon: "success",
        title: "Conexión Exitosa",
        text: "Tu gimnasio ha sido conectado con Mercado Pago correctamente",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      // Limpiar el query param
      window.history.replaceState({}, "", window.location.pathname);
      fetchEstado();
    } else if (exito === "false") {
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "Hubo un problema al conectar con Mercado Pago. Por favor intenta nuevamente.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

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
            <i className="fa fa-plug me-2" aria-hidden="true"></i>
            Integración con Mercado Pago
          </h2>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Estado de conexión */}
          <div className="card mb-4" style={{ backgroundColor: "#1e1e1e", color: "#f5f5f5", border: "1px solid var(--tenant-primary-color)" }}>
            <div className="card-header text-white" style={{ backgroundColor: "var(--tenant-primary-color)" }}>
              <h5 className="mb-0">Estado de Conexión</h5>
            </div>
            <div className="card-body" style={{ color: "#f5f5f5" }}>
              {estado?.conectado ? (
                <>
                  <div className="alert alert-success d-flex align-items-center">
                    <div className="me-3">
                      <i className="fa fa-check-circle text-success" style={{ fontSize: "2rem" }} aria-hidden="true"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Conectado con Mercado Pago</h6>
                      <p className="mb-0 small">
                        Tu gimnasio está conectado y puedes procesar pagos
                      </p>
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Fecha de autorización:</strong>
                      </p>
                      <p style={{ color: "#ddd" }}>
                        {estado.fechaAutorizacion
                          ? new Date(estado.fechaAutorizacion).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Token expira:</strong>
                      </p>
                      <p style={{ color: "#ddd" }}>
                        {estado.tokenExpiraEn
                          ? new Date(estado.tokenExpiraEn).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {estado.tokenExpirado && (
                    <div className="alert alert-warning mt-3">
                      <strong><i className="fa fa-exclamation-triangle me-1 text-warning" aria-hidden="true"></i>Atención:</strong> Tu token de acceso ha expirado.
                      Por favor refresca el token para continuar procesando pagos.
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    <button
                      onClick={handleRefrescarToken}
                      className="btn btn-outline-primary"
                    >
                      <i className="fa fa-sync-alt me-2" aria-hidden="true"></i>Refrescar Token
                    </button>
                    <button
                      onClick={handleRevocar}
                      className="btn btn-outline-danger"
                    >
                      <i className="fa fa-unlink me-2" aria-hidden="true"></i>Desconectar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="alert alert-warning d-flex align-items-center">
                    <div className="me-3">
                      <span style={{ fontSize: "2rem" }}><i className="fa fa-exclamation-circle text-warning" aria-hidden="true"></i></span>
                    </div>
                    <div>
                      <h6 className="mb-1">No conectado</h6>
                      <p className="mb-0 small">
                        Tu gimnasio no está conectado con Mercado Pago
                      </p>
                    </div>
                  </div>

                  <div className="d-grid gap-2 mt-3">
                    <button
                      onClick={handleConectar}
                      disabled={autorizando}
                      className="btn btn-primary btn-lg"
                    >
                      {autorizando ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Redirigiendo...
                        </>
                      ) : (
                        <><i className="fa fa-plug me-2" aria-hidden="true"></i>Conectar con Mercado Pago</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="card" style={{ backgroundColor: "#1e1e1e", color: "#f5f5f5", border: "1px solid #333" }}>
            <div className="card-header" style={{ backgroundColor: "#444", color: "#f5f5f5" }}>
              <h5 className="mb-0">
                <i className="fa fa-info-circle me-2" aria-hidden="true"></i>
                ¿Cómo funciona?
              </h5>
            </div>
            <div className="card-body" style={{ color: "#f5f5f5" }}>
              <h6>Configuración en Mercado Pago</h6>
              <ol className="mb-3">
                <li>
                  Ve a{" "}
                  <a
                    href="https://www.mercadopago.com.ar/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mercado Pago para Desarrolladores
                  </a>{" "}
                  y crea tu aplicación
                </li>
<li>
                  Configura la URL de redirección:{" "}
                  <code>
                    {window.location.origin}/api/mercadopago/oauth/callback
                  </code>
                </li>
                <li>Copia el App ID y App Secret</li>
                <li>
                  Configura estas credenciales en el servidor (contacta al
                  soporte)
                </li>
                <li>
                  Haz clic en "Conectar con Mercado Pago" y autoriza la
                  aplicación
                </li>
              </ol>

              <h6>Beneficios</h6>
              <ul className="mb-0">
                <li>Procesa pagos de suscripciones automáticamente</li>
                <li>Recibe notificaciones de pagos en tiempo real</li>
                <li>Gestiona reembolsos y cancelaciones</li>
                <li>Accede al historial completo de transacciones</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Card de ayuda */}
          <div className="card bg-light" style={{ backgroundColor: "#1e1e1e", color: "#f5f5f5", border: "1px solid #333" }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3">ðŸ“ž Â¿Necesitas ayuda?</h6>
              <p className="small mb-2" style={{ color: "#e0e0e0" }}>
                Si tienes problemas para conectar con Mercado Pago:
              </p>
              <ul className="small mb-0" style={{ color: "#f5f5f5" }}>
                <li>Verifica que las credenciales sean correctas</li>
                <li>
                  Confirma que la URL de redirección esté configurada correctamente
                </li>
                <li>Revisa que la aplicación esté activa en Mercado Pago</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}















