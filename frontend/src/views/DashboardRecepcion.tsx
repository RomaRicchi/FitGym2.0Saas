import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gymApi from "@/api/gymApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faUsers, faClipboardList, faCalendarDays, faCreditCard, faBolt } from "@fortawesome/free-solid-svg-icons";

interface Usuario {
  rol: string;
  alias?: string;
  nombre?: string;
  email: string;
}  

export default function DashboardRecepcion() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stats, setStats] = useState({
    checkinsHoy: 0,
    turnosHoy: 0,
    sociosActivos: 0,
  });
  const navigate = useNavigate();

  const accesosRapidos = [
    { titulo: "Escáner QR", icono: faQrcode, ruta: "/checkins/qr?camara=true" },
    { titulo: "Socios", icono: faUsers, ruta: "/socios" },
    { titulo: "Suscripciones", icono: faClipboardList, ruta: "/suscripciones" },
    { titulo: "Agenda", icono: faCalendarDays, ruta: "/agenda/calendario" },
    { titulo: "Pagos", icono: faCreditCard, ruta: "/ordenes" },
  ];

  useEffect(() => {
    const usuarioStr = sessionStorage.getItem("usuario");
    if (usuarioStr) {
      setUsuario(JSON.parse(usuarioStr));
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener socios con suscripción vigente (que pueden venir al gym hoy)
        const suscripcionesRes = await gymApi.get("/suscripciones?pageSize=10000");
        const suscripciones = suscripcionesRes.data?.items || [];
        const hoy = new Date();
        const suscripcionesVigentes = suscripciones.filter((s: any) =>
          s.estado === true && new Date(s.fin) >= hoy
        );
        const sociosConSuscripcionVigente = new Set(suscripcionesVigentes.map((s: any) => s.socioId)).size;

        setStats({
          checkinsHoy: 0,
          turnosHoy: 0,
          sociosActivos: sociosConSuscripcionVigente,
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-white">Cargando tu panel...</p>
      </div>
    );
  }

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
          ¡Hola, {usuario?.alias || usuario?.nombre || "Recepcion"}!
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
        className="card mb-4"
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
            <FontAwesomeIcon icon={faBolt} /> Accesos Rápidos
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {accesosRapidos.map((acceso, index) => (
              <div className={index === 0 ? "col-12 col-md-4" : "col-6 col-md-4"} key={acceso.ruta}>
                <button
                  className="btn w-100"
                  onClick={() => navigate(acceso.ruta)}
                  style={{
                    backgroundColor: index === 0 ? "#28a745" : "var(--tenant-primary-color)",
                    border: "none",
                    color: "white",
                    padding: isMobile ? "0.8rem" : "1rem",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
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

      {/* Stats Cards */}
      <div className="row g-3">
        <div className="col-12">
          <div
            className="card text-center"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderRadius: "12px",
              border: "2px solid var(--tenant-primary-color)",
              padding: isMobile ? "1rem" : "1.5rem",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            <FontAwesomeIcon icon={faUsers} style={{ fontSize: isMobile ? "2rem" : "2.5rem", color: "var(--tenant-primary-color)" }} />
            <h3 className="fw-bold mt-2" style={{ color: "#fff", fontSize: isMobile ? "1.5rem" : "2rem" }}>
              {stats.sociosActivos}
            </h3>
            <p className="mb-0" style={{ color: "#ccc", fontSize: isMobile ? "0.85rem" : "1rem" }}>Socios con suscripción vigente</p>
          </div>
        </div>
      </div>
    </div>
  );
}


