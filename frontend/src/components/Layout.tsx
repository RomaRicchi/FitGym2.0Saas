import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { BarraNotificacionSaaS } from "@/components/BarraNotificacionSaaS";
import { BarraAlertaSocio } from "@/components/BarraAlertaSocio";
import { usePagoNotifications } from "@/hooks/useSignalR";
import "@/styles/Layout.css";

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );
  const [userRole, setUserRole] = useState<string | null>(null);

  // Inicializar notificaciones de SignalR para admins y recepcionistas
  usePagoNotifications();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("token");
      const usuario = sessionStorage.getItem("usuario");

      if (!token || !usuario) {
        // Redirigir al login del panel React
        window.location.href = "/login";
        return;
      }

      setIsLoggedIn(true);

      // Obtener el rol del usuario
      try {
        const usuarioObj = JSON.parse(usuario);
        const rol = usuarioObj?.rol || usuarioObj?.Rol;
        setUserRole(rol);
      } catch {
        setUserRole(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  return (
    <div
      className="layout"
      style={{
        backgroundImage: 'url("/pesas.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      {/* Barra de alerta para socios (solo cuando el rol es Socio) */}
      {userRole === "Socio" && <BarraAlertaSocio />}

      {/* Barra de notificación SaaS para administradores del gimnasio */}
      {userRole !== "Socio" && <BarraNotificacionSaaS />}

      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="d-flex">
        {isLoggedIn && (
          <div
            className={`sidebar-container ${isSidebarOpen ? "open" : "closed"}`}
          >
            <Sidebar />
          </div>
        )}

        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>

      {isLoggedIn && isSidebarOpen && (
        <div
          className="sidebar-overlay d-md-none"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}
