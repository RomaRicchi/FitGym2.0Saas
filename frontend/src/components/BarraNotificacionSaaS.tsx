import { useEffect, useState } from "react";
import { pagosSaaSApi, EstadoCuentaSaaS } from "../api/pagosSaaSApi";

export const BarraNotificacionSaaS = () => {
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaSaaS | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchEstadoCuenta = async () => {
      try {
        const estado = await pagosSaaSApi.getEstadoCuenta();
        setEstadoCuenta(estado);
      } catch (error) {
        console.error("Error al obtener estado de cuenta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadoCuenta();
  }, []);

  // Si no hay mensaje o está oculto, no mostrar nada
  if (loading || !visible || !estadoCuenta?.mensaje) {
    return null;
  }

  // Determinar las clases CSS según el estado
  const getAlertClasses = (): string => {
    const baseClasses = "alert m-0 rounded-0 d-flex align-items-center justify-content-center";
    switch (estadoCuenta.estado) {
      case 1: // Trial
        return estadoCuenta.diasRestantesTrial <= 3
          ? `${baseClasses} alert-warning`
          : `${baseClasses} alert-info`;
      case 2: // Activo
        return `${baseClasses} alert-success`;
      case 3: // EnGracia
        return `${baseClasses} alert-warning`;
      case 4: // Suspendido
        return `${baseClasses} alert-danger`;
      default:
        return `${baseClasses} alert-secondary`;
    }
  };

  const getButtonText = (): string => {
    switch (estadoCuenta.tipoAccion) {
      case "actualizar_pago":
        return "Actualizar Pago";
      case "agregar_metodo_pago":
        return "Agregar Método de Pago";
      case "reactivar_cuenta":
        return "Reactivar Cuenta";
      default:
        return "";
    }
  };

  return (
    <div
      className={getAlertClasses()}
      role="alert"
      style={{
        position: "sticky" as const,
        top: 0,
        zIndex: 9999,
        fontSize: "0.95rem",
      }}
    >
      <div className="d-flex align-items-center justify-content-center w-100">
        <span className="me-2">{estadoCuenta.mensaje}</span>
        {estadoCuenta.requiereAccion && estadoCuenta.tipoAccion && (
          <button
            className="btn btn-sm btn-light ms-2"
            onClick={() => {
              // TODO: Mostrar modal para actualizar método de pago
              console.log("Acción requerida:", estadoCuenta.tipoAccion);
            }}
          >
            {getButtonText()}
          </button>
        )}
        <button
          type="button"
          className="btn-close ms-2"
          onClick={() => setVisible(false)}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
};
