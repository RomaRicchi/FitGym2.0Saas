import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { BarraNotificacionSaaS } from "@/components/BarraNotificacionSaaS";
import "@/styles/Layout.css";

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const checkAuth = () => {
      const newToken = sessionStorage.getItem("token");
      setIsLoggedIn(!!newToken);
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
      <BarraNotificacionSaaS />
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
