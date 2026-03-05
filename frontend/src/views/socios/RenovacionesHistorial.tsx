import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faCreditCard, faCalendar, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import gymApi from "../../api/gymApi";

interface RenovacionItem {
  id: number;
  fechaRenovacion: string;
  planAnterior: string;
  planNuevo: string;
  monto: number;
  metodoPago: string;
  estado: number;
}

const RenovacionesHistorial: React.FC = () => {
  const [renovaciones, setRenovaciones] = useState<RenovacionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const socioId = sessionStorage.getItem("socioId");
        if (!socioId) {
          setLoading(false);
          return;
        }

        const res = await gymApi.get("/renovaciones/historial");
        setRenovaciones(res.data.items || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p className="text-lg animate-pulse">Cargando historial...</p>
      </div>
    );
  }

  const estadoNombre: Record<number, string> = {
    1: "Iniciada",
    2: "Pagada",
    3: "Fallida",
    4: "Cancelada",
    5: "Completada",
  };

  const estadoColor: Record<number, string> = {
    1: "#ffc107",
    2: "#28a745",
    3: "#dc3545",
    4: "#6c757d",
    5: "#17a2b8",
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", color: "white" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
          <button
            onClick={() => window.location.href = "/socio/suscripciones"}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--tenant-primary-color)",
              fontSize: "1.2rem",
              cursor: "pointer",
              marginRight: "1rem"
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2 style={{ color: "var(--tenant-secondary-color)", fontSize: "2rem", margin: 0, fontWeight: "bold" }}>
            <FontAwesomeIcon icon={faHistory} /> Historial de Renovaciones
          </h2>
        </div>

        {!renovaciones.length ? (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "3rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "1.2rem", color: "#888" }}>
              No hay renovaciones registradas.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,107,0,0.2)" }}>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <FontAwesomeIcon icon={faCalendar} /> Fecha
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    Plan Anterior
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    Plan Nuevo
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    Monto
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <FontAwesomeIcon icon={faCreditCard} /> Método
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {renovaciones.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "1rem" }}>
                      {new Date(r.fechaRenovacion).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "1rem" }}>{r.planAnterior}</td>
                    <td style={{ padding: "1rem" }}>{r.planNuevo}</td>
                    <td style={{ padding: "1rem" }}>${r.monto.toFixed(2)}</td>
                    <td style={{ padding: "1rem" }}>
                      {r.metodoPago === "Manual" ? <><i className="fas fa-credit-card"></i> Manual</> : <><i className="fa-solid fa-gem"></i> Mercado Pago</>}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.3rem 0.8rem",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          background: estadoColor[r.estado],
                          color: "white",
                        }}
                      >
                        {estadoNombre[r.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenovacionesHistorial;


