import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faDumbbell, faPersonRunning } from "@fortawesome/free-solid-svg-icons";

interface Usuario {
  rol: string;
  alias?: string;
  nombre?: string;
  email: string;
  personalId?: number;
}

export default function DashboardProfesor() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioStr = sessionStorage.getItem("usuario");
    if (usuarioStr) {
      setUsuario(JSON.parse(usuarioStr));
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const accesosRapidos = [
    { titulo: "Mis Turnos", icono: faCalendarDays, ruta: "/suscripciones/turnos" },
    { titulo: "Rutinas", icono: faDumbbell, ruta: "/rutinas/plantillas" },
    { titulo: "Clases de Hoy", icono: faPersonRunning, ruta: "/checkins/clases-dia" },
  ];

  return (
    <div className="container mt-4" style={{ padding: isMobile ? "0 10px" : "" }}>
      {/* Header */}
      <div className="text-center mb-5">
        <h1
          className="fw-bold"
          style={{
            color: "var(--tenant-primary-color)",
            fontSize: isMobile ? "1.8rem" : "2.5rem",
          }}
        >
          ¡Hola, {usuario?.alias || usuario?.nombre || "Profesor"}!
        </h1>
        <p
          className="lead"
          style={{
            color: "#fff",
            fontSize: isMobile ? "1rem" : "1.2rem",
          }}
        >
          Bienvenido a tu panel de control
        </p>
      </div>

      {/* Accesos Rápidos */}
      <div
        className="card"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "12px",
          border: "2px solid var(--tenant-primary-color)",
          maxWidth: isMobile ? "100%" : "800px",
          margin: "0 auto",
        }}
      >
        <div
          className="card-header"
          style={{ backgroundColor: "transparent", borderBottom: "1px solid var(--tenant-primary-color)" }}
        >
          <h5 className="mb-0" style={{ color: "var(--tenant-primary-color)", fontSize: isMobile ? "1.1rem" : "1.25rem" }}>
            Accesos Rápidos
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {accesosRapidos.map((acceso) => (
              <div className="col-6 col-md-3" key={acceso.ruta}>
                <button
                  className="btn w-100"
                  onClick={() => navigate(acceso.ruta)}
                  style={{
                    backgroundColor: "var(--tenant-primary-color)",
                    border: "none",
                    color: "white",
                    padding: isMobile ? "0.8rem" : "1rem",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    borderRadius: "8px",
                    transition: "filter 0.2s ease",
                  }}
                  >
                  <FontAwesomeIcon icon={acceso.icono} style={{ fontSize: isMobile ? "1.5rem" : "2rem" }} />
                  <span style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>{acceso.titulo}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


