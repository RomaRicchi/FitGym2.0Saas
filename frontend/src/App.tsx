import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/main.css";

/* === Vistas administrativas === */
import Dashboard from "@/views/Dashboard";
import DashboardProfesor from "@/views/DashboardProfesor";
import DashboardRecepcion from "@/views/DashboardRecepcion";
import Login from "@/views/usuarios/Login";
import PerfilView from "@/views/usuarios/perfil/PerfilView";
import SociosList from "@/views/socios/List";
import PersonalList from "@/views/personal/List";
import SuscripcionesList from "@/views/suscripciones/List";
import PlanesList from "@/views/suscripciones/planes/List";
import SalasList from "@/views/salas/List";
import TurnosPlantillaList from "@/views/agenda/turnoPlantilla/List";
import TurnosList from "@/views/agenda/suscripcionTurno/TurnosList";
import AgendaCalendar from "@/views/agenda/AgendaCalendar";
import OrdenesList from "@/views/gestionPagos/List";
import ComprobantesList from "@/views/gestionPagos/comprobantes/List";
import ComprobanteUpload from "@/views/gestionPagos/comprobantes/Upload";
// import RolesList from "@/views/usuarios/rol/List"; // OCULTO - NO ACCESIBLE
import UsuariosList from "@/views/usuarios/List";
import ResetPassword from "@/views/usuarios/ResetPassword";
import EjerciciosList from "@/views/rutinas/ejercicios/EjerciciosList";
import RutinaPlantillaList from "@/views/rutinas/rutina-plantilla/RutinaPlantillaList";
import RutinaPlantillaEjercicioList from "@/views/rutinas/rutina-ejercicios/RutinaPlantillaEjercicioList";
import RutinaCardsList from "@/views/rutinas/rutina-plantilla/RutinaCardsList";
import GruposMuscularesList from "@/views/rutinas/grupoMuscular/GruposMuscularesList";
import Finanzas from "@/views/finanzas/Finanzas";
import EstadisticasCheckin from "@/views/agenda/checkin/EstadisticasCheckin";
import CheckinQR from "@/views/agenda/checkin/CheckinQR";
import ClasesDelDia from "@/views/agenda/checkin/ClasesDelDia";
import MercadoPagoConfig from "@/views/integraciones/MercadoPagoConfig";
import PaymentsTest from "@/views/payments/PaymentsTest";
import ConfiguracionSaaS from "@/views/saas/ConfiguracionSaaS";
import DashboardAdminSaaS from "@/views/saas/DashboardAdminSaaS";
import AdminDocumentosLegales from "@/views/saas/AdminDocumentosLegales";
import Branding from "@/views/configuracion/Branding";
import AuditoriaView from "@/views/auditoria/AuditoriaView";
import CajaView from "@/views/caja/CajaView";
import CajaHistorialView from "@/views/caja/CajaHistorialView";
import HistorialPagos from "@/views/saas/HistorialPagos";
import TerminosCondiciones from "@/views/saas/TerminosCondiciones";
import PoliticaPrivacidad from "@/views/saas/PoliticaPrivacidad";
import PoliticaCookies from "@/views/saas/PoliticaCookies";


/* === Vistas del SOCIO === */
import DashboardSocio from "@/views/DashboardSocio";
import PerfilSocio from "@/views/usuarios/perfil/PerfilSocio";
import PlanesSocio from "@/views/socios/PlanesSocio";
import SuscripcionesSocio from "@/views/socios/SuscripcionesSocio";
import TurnosSocio from "@/views/socios/TurnosSocio";
import RutinasSocio from "@/views/socios/RutinasSocio";
import LayoutSocio from "./components/LayoutSocio";
import TurnosSocioCalendar from "@/views/socios/TurnosSocioCalendar";
import EvolucionFisicaSocio from "@/views/socios/EvolucionFisicaSocio";
import RenovacionesHistorial from "@/views/socios/RenovacionesHistorial";
import AsistenciaSocio from "@/views/socios/AsistenciaSocio";

/* Scroll automático */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RedirectByRole() {
  const storedUser = sessionStorage.getItem("usuario");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const rol = user?.rol || user?.Rol;

  // Si no hay usuario logueado o no tiene rol, mandarlo al login
  if (!rol) return <Navigate to="/login" replace />;

  // Redirigir según el rol base
  if (rol === "Socio") return <Navigate to="/socio/dashboardSocio" replace />;
  else return <Navigate to="/dashboard" replace />;
}


export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* 🔒 Panel Administrativo */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profesor" element={<DashboardProfesor />} />
          <Route path="/dashboard/recepcion" element={<DashboardRecepcion />} />
          <Route path="/perfil" element={<PerfilView />} />
          <Route path="/socios" element={<SociosList />} />
          <Route path="/personal" element={<PersonalList />} />
          <Route path="/suscripciones" element={<SuscripcionesList />} />
          <Route path="/planes" element={<PlanesList />} />
          <Route path="/salas" element={<SalasList />} />
          <Route path="/agenda/calendario" element={<AgendaCalendar />} />
          <Route path="/turnos" element={<TurnosPlantillaList />} />
          <Route path="/suscripciones/turnos" element={<TurnosList />} />
          <Route path="/ordenes" element={<OrdenesList />} />
          <Route path="/comprobantes" element={<ComprobantesList />} />
          <Route path="/ordenes/:id/comprobantes" element={<ComprobantesList />} />
          <Route path="/ordenes/:id/subir-comprobante" element={<ComprobanteUpload />} />
          {/* <Route path="/roles" element={<RolesList />} /> */}
          <Route path="/usuarios" element={<UsuariosList />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/auditoria" element={<AuditoriaView />} />
          <Route path="/caja" element={<CajaView />} />
          <Route path="/caja/historial" element={<CajaHistorialView />} />
          <Route path="/rutinas/ejercicios" element={<EjerciciosList />} />
          <Route path="/rutinas/plantillas" element={<RutinaPlantillaList />} />
          <Route path="/rutinas/plantilla-ejercicios" element={<RutinaPlantillaEjercicioList />} />
          <Route path="/rutinas/cards" element={<RutinaCardsList />} />
          <Route path="/rutinas/grupoMuscular" element={<GruposMuscularesList />} />
          <Route path="/checkins/estadisticas" element={<EstadisticasCheckin />} />
          <Route path="/checkins/qr" element={<CheckinQR />} />
          <Route path="/checkins/clases-dia" element={<ClasesDelDia />} />
          <Route path="/integraciones/mercadopago" element={<MercadoPagoConfig />} />
          <Route path="/payments/test" element={<PaymentsTest />} />
          <Route path="/saas/configuracion" element={<ConfiguracionSaaS />} />
          <Route path="/saas/historial-pagos" element={<HistorialPagos />} />
          <Route path="/saas/admin/dashboard" element={<DashboardAdminSaaS />} />
          <Route path="/saas/admin/documentos-legales" element={<AdminDocumentosLegales />} />
          <Route path="/configuracion/branding" element={<Branding />} />
          {/* Documentos Legales */}
          <Route path="/legal/terminos" element={<TerminosCondiciones />} />
          <Route path="/legal/privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/legal/cookies" element={<PoliticaCookies />} />
        </Route>
        {/* 🧡 Panel del Socio */}
        <Route element={<LayoutSocio />}>
          <Route path="/dashboardSocio" element={<DashboardSocio />} />
          <Route path="/socio/planesSocio" element={<PlanesSocio />} />
          <Route path="/socio/suscripcionesSocio" element={<SuscripcionesSocio />} />
          <Route path="/socio/suscripciones" element={<SuscripcionesSocio />} />
          <Route path="/socio/turnosSocio" element={<TurnosSocio />} />
          <Route path="/socio/rutinasSocio" element={<RutinasSocio />} />
          <Route path="/socio/turnos" element={<TurnosSocioCalendar />} />
          <Route path="/socio/renovaciones/historial" element={<RenovacionesHistorial />} />
          <Route path="/evolucionfisica" element={<EvolucionFisicaSocio />} />
          <Route path="/socio/asistencia" element={<AsistenciaSocio />} />
          <Route path="/perfil-socio" element={<PerfilSocio />} />
        </Route>
        {/* 🌐 Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Redirección general */}
        <Route path="*" element={<RedirectByRole />} />
      </Routes>
    </Router>
  );
}
