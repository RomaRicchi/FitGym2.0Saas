import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Tab, Tabs } from "react-bootstrap";
import saasApi, { CuentaSaaSDto, PlanSaaSDto } from "@/api/saasApi";
import InformacionCuenta from "./InformacionCuenta";
import PlanActual from "./PlanActual";
import CambiarPlan from "./CambiarPlan";
import CambiarPassword from "./CambiarPassword";
import CancelarServicio from "./CancelarServicio";
import HistorialPagos from "./HistorialPagos";
import TerminosCondiciones from "./TerminosCondiciones";
import PoliticaPrivacidad from "./PoliticaPrivacidad";
import PoliticaCookies from "./PoliticaCookies";

type LegalTabKey = "terminos" | "privacidad" | "cookies";

/**
 * Vista principal de Configuración de Cuenta SaaS
 * Permite al administrador gestionar su suscripción, plan y cuenta
 */
export default function ConfiguracionSaaS() {
  const [cuenta, setCuenta] = useState<CuentaSaaSDto | null>(null);
  const [planes, setPlanes] = useState<PlanSaaSDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [legalTabActive, setLegalTabActive] = useState<LegalTabKey>("terminos");

  // Cargar datos iniciales
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [cuentaData, planesData] = await Promise.all([
        saasApi.getCuentaSaaS(),
        saasApi.getPlanesSaaS(),
      ]);
      setCuenta(cuentaData);
      setPlanes(planesData);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo cargar la información de la cuenta",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [refreshKey]);

  // Refrescar datos
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-orange" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!cuenta) {
    return (
      <div className="alert alert-danger mt-4">
        No se pudo cargar la información de la cuenta.
      </div>
    );
  }

  return (
    <div
      className="mt-4 saas-dark"
      style={{
        backgroundColor: "#1a1a1a",
        color: "#f5f5f5",
        padding: "1.5rem",
        borderRadius: "12px",
      }}
    >
      <h1
        className="text-center fw-bold mb-4"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: "2.5rem",
          letterSpacing: "2px"
        }}
      >
        CONFIGURACIÓN DE CUENTA SaaS
      </h1>

      {/* Alerta de estado del servicio */}
      {!cuenta.activo && (
        <div className="alert alert-danger mb-4">
          <strong><i className="fa-solid fa-triangle-exclamation"></i> Tu servicio está cancelado.</strong> Contacta a soporte si deseas reactivarlo.
        </div>
      )}

      {cuenta.planActual?.estaVigente === false && cuenta.activo && (
        <div className="alert alert-warning mb-4">
          <strong><i className="fa-solid fa-triangle-exclamation"></i> Tu suscripción ha vencido.</strong> Actualiza tu plan para continuar usando el servicio.
        </div>
      )}

      {/* Info principal de la cuenta */}
      <div
        className="card mb-4 shadow-sm"
        style={{
          backgroundColor: "#222",
          border: "1px solid var(--tenant-primary-color)",
          color: "#f5f5f5",
        }}
      >
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="card-title mb-2">
                <strong>{cuenta.nombreGimnasio}</strong>
              </h5>
              <p className="mb-1">
                <strong>Email:</strong> {cuenta.email}
              </p>
              <p className="mb-1">
                <strong>Plan actual:</strong> {cuenta.planActual?.nombre || "No asignado"}
              </p>
              <p className="mb-0">
                <strong>Miembro desde:</strong> {new Date(cuenta.fechaRegistro).toLocaleDateString("es-AR")}
              </p>
            </div>
            <div className="col-md-4 text-end">
              {cuenta.activo ? (
                <span className="badge bg-success fs-6">Activo</span>
              ) : (
                <span className="badge bg-danger fs-6">Cancelado</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de configuración */}
      <Tabs
        defaultActiveKey="cuenta"
        id="saas-config-tabs"
        className="mb-4"
        fill
        style={{
          borderBottom: "2px solid var(--tenant-primary-color)",
          color: "#f5f5f5",
        }}
      >
        <Tab eventKey="cuenta" title={<><i className="fa-solid fa-clipboard-list"></i> Información de Cuenta</>}>
          <InformacionCuenta
            cuenta={cuenta}
            onUpdated={handleRefresh}
          />
        </Tab>

        <Tab eventKey="plan" title={<><i className="fa-solid fa-chart-line"></i> Mi Plan</>}>
          <PlanActual
            cuenta={cuenta}
          />
        </Tab>

        <Tab eventKey="cambiar-plan" title={<><i className="fa-solid fa-rotate"></i> Cambiar Plan</>}>
          <CambiarPlan
            cuenta={cuenta}
            planes={planes}
            onChanged={handleRefresh}
          />
        </Tab>

        <Tab eventKey="password" title={<><i className="fa-solid fa-lock"></i> Cambiar Contraseña</>}>
          <CambiarPassword />
        </Tab>

        <Tab eventKey="historial" title={<><i className="fa-solid fa-receipt"></i> Historial de Pagos</>}>
          <HistorialPagos />
        </Tab>

        <Tab eventKey="cancelar" title={<><i className="fa-solid fa-circle-xmark"></i> Cancelar Servicio</>}>
          <CancelarServicio
            cuenta={cuenta}
            onCanceled={handleRefresh}
          />
        </Tab>

        <Tab eventKey="legal" title={<><i className="fa-solid fa-file-contract"></i> Documentación Legal</>}>
          <div className="mt-3">
            {/* Sub-navegación para documentos legales */}
            <Tabs
              activeKey={legalTabActive}
              onSelect={(k) => setLegalTabActive(k as LegalTabKey)}
              className="mb-3"
              fill
            >
              <Tab eventKey="terminos" title={<><i className="fa-solid fa-scroll"></i> Términos y Condiciones</>}>
                <TerminosCondiciones />
              </Tab>
              <Tab eventKey="privacidad" title={<><i className="fa-solid fa-lock"></i> Política de Privacidad</>}>
                <PoliticaPrivacidad />
              </Tab>
              <Tab eventKey="cookies" title={<><i className="fa-solid fa-cookie-bite"></i> Política de Cookies</>}>
                <PoliticaCookies />
              </Tab>
            </Tabs>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}


