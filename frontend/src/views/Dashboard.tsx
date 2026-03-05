import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import gymApi from "@/api/gymApi";

interface Usuario {
  rol: string;
  alias?: string;
  email: string;
}

export default function Dashboard() {
  const [suscripciones, setSuscripciones] = useState([]);
  const [salas, setSalas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const usuarioStr = sessionStorage.getItem("usuario");
    if (usuarioStr) {
      try {
        setUsuario(JSON.parse(usuarioStr));
      } catch (e) {
      }
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Solo cargar datos si es Admin
    if ((usuario?.rol) !== "Administrador") {
      return;
    }

    const fetchData = async () => {
      try {
        const [suscRes, salasRes, plansRes] = await Promise.all([
          gymApi.get("/dashboard/suscripciones-por-mes"),
          gymApi.get("/dashboard/salas-mas-reservadas"),
          gymApi.get("/dashboard/planes-mas-elegidos"),
        ]);
        setSuscripciones(suscRes.data || []);
        setSalas(salasRes.data || []);
        setPlanes(plansRes.data || []);
      } catch (error: any) {
      }
    };
    fetchData();
  }, [usuario]);

  if ((usuario?.rol) === "Profesor") {
    return <Navigate to="/dashboard/profesor" replace />;
  }

  if ((usuario?.rol) === "Recepcion") {
    return <Navigate to="/dashboard/recepcion" replace />;
  }

  const getChartHeight = (defaultHeight: number) => {
    return isMobile ? defaultHeight * 0.7 : defaultHeight;
  };

  return (
    <div className="container mt-5" style={{ padding: isMobile ? "0 1rem" : "" }}>
      <h1
        className="text-center fw-bold mb-4"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: isMobile ? "1.5rem" : "2rem",
        }}
      >
        Panel de Administración
      </h1>

      <h4
        className="mb-3"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: isMobile ? "1.1rem" : "1.25rem",
        }}
      >
        Suscripciones activas por mes
      </h4>
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          padding: isMobile ? "0.75rem" : "1rem",
          marginBottom: "2rem",
        }}
      >
        {suscripciones.length === 0 ? (
          <div className="text-center text-white py-5">
            <p className="mb-0" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
              No hay datos de suscripciones para mostrar
            </p>
            <small className="text-muted" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
              Se requieren suscripciones activas para ver las estadísticas
            </small>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={getChartHeight(300)}>
            <LineChart data={suscripciones}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="nombreMes"
                stroke="#fff"
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis stroke="#fff" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Line
                type="monotone"
                dataKey="cantidad"
                stroke="var(--tenant-primary-color)"
                strokeWidth={isMobile ? 2 : 3}
                name="Suscripciones"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <h4
        className="mb-3"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: isMobile ? "1.1rem" : "1.25rem",
        }}
      >
        Salas con más reservas
      </h4>
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          padding: isMobile ? "0.75rem" : "1rem",
          marginBottom: "2rem",
        }}
      >
        {salas.length === 0 ? (
          <div className="text-center text-white py-5">
            <p className="mb-0" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
              No hay datos de salas para mostrar
            </p>
            <small className="text-muted" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
              Se requieren turnos asignados con reservas para ver las estadísticas
            </small>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={getChartHeight(300)}>
            <BarChart data={salas}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="sala"
                stroke="#fff"
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis stroke="#fff" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="reservas" fill="var(--tenant-primary-color)" name="Reservas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <h4
        className="mb-3"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: isMobile ? "1.1rem" : "1.25rem",
        }}
      >
        Planes más elegidos
      </h4>
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          padding: isMobile ? "0.75rem" : "1rem",
          minHeight: isMobile ? "300px" : "400px",
        }}
      >
        {planes.length === 0 ? (
          <div className="text-center text-white py-5">
            <p className="mb-0" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
              No hay datos de planes para mostrar
            </p>
            <small className="text-muted" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
              Se requieren suscripciones activas para ver las estadísticas
            </small>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={getChartHeight(400)}>
            <PieChart>
              <Pie
                data={planes}
                dataKey="cantidad"
                nameKey="plan"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 80 : 120}
                label={isMobile ? false : ({ plan, cantidad }: any) => `${plan}: ${cantidad}`}
                labelLine={{ stroke: "#fff", strokeWidth: 1 }}
              >
                {planes.map((_: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={[
                      "var(--tenant-primary-color)",
                      "#00d4ff",
                      "#00ff88",
                      "#ffcc00",
                      "#ff4444",
                      "#aa44ff",
                    ][index % 6]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  color: "#fff",
                  border: "1px solid var(--tenant-primary-color)",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value: number, name: string) => [
                  `${value} suscripciones`,
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{
                  color: "#fff",
                  fontSize: isMobile ? "10px" : "12px",
                }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}


