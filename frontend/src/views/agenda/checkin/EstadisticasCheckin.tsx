import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import gymApi from "@/api/gymApi";
import Swal from "sweetalert2";

interface Estadisticas {
  periodo: {
    desde: string;
    hasta: string;
    dias: number;
  };
  totalCheckins: number;
  promedioDiario: number;
  checkinsPorDia: { dia: number; cantidad: number }[];
  checkinsPorProfesor: { profesorId: number; profesorNombre: string; cantidad: number }[];
  topSocios: { socioId: number; socioNombre: string; cantidad: number }[];
}

const COLORS = ["var(--tenant-primary-color)", "#ff9f40", "#ffc107", "#00e676", "#2979ff", "#e040fb", "#ff1744"];

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function EstadisticasCheckin() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [diasFiltro, setDiasFiltro] = useState(7);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      const { data } = await gymApi.get(`/checkins/estadisticas?dias=${diasFiltro}`);
      setEstadisticas(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las estadísticas",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [diasFiltro]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3">Cargando estadísticas...</p>
      </div>
    );
  }

  if (!estadisticas) {
    return <p className="text-center mt-5">No hay datos disponibles</p>;
  }

  // Preparar datos para gráficos
  const datosDias = estadisticas.checkinsPorDia.map(d => ({
    name: DIAS_SEMANA[d.dia % 7] || `Día ${d.dia}`,
    value: d.cantidad,
  }));

  const datosProfesores = estadisticas.checkinsPorProfesor.map(p => ({
    name: p.profesorNombre,
    value: p.cantidad,
  }));

  const datosSocios = estadisticas.topSocios.map(s => ({
    name: s.socioNombre,
    checkins: s.cantidad,
  }));

  return (
    <div className="container mt-4">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "1px", textShadow: "0 0 10px rgba(255, 102, 0, 0.5)" }}
      >
        ESTADÍSTICAS DE ASISTENCIA
      </h1>

      {/* Filtro de días */}
      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group" role="group">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              type="button"
              className={`btn ${diasFiltro === d ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setDiasFiltro(d)}
              style={{
                backgroundColor: diasFiltro === d ? "var(--tenant-primary-color)" : "transparent",
                borderColor: "var(--tenant-primary-color)",
                color: diasFiltro === d ? "#000" : "var(--tenant-primary-color)",
                fontWeight: "600",
                transition: "all 0.3s ease"
              }}
            >
              Últimos {d} días
            </button>
          ))}
        </div>
      </div>

      {/* Resumen */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
            <div className="card-body">
              <h5 className="card-title" style={{ color: "#bbb" }}>Total Check-ins</h5>
              <h2 className="fw-bold" style={{ color: "var(--tenant-secondary-color)", fontSize: "3rem" }}>{estadisticas.totalCheckins}</h2>
              <p className="card-text" style={{ color: "#888" }}>
                Últimos {estadisticas.periodo.dias} días
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
            <div className="card-body">
              <h5 className="card-title" style={{ color: "#bbb" }}>Promedio Diario</h5>
              <h2 className="fw-bold" style={{ color: "#00e676", fontSize: "3rem" }}>{estadisticas.promedioDiario}</h2>
              <p className="card-text" style={{ color: "#888" }}>Check-ins por día</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
            <div className="card-body" style={{ paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
              <h5 className="card-title" style={{ color: "#bbb" }}>Periodo</h5>
              <h2 className="fw-bold" style={{ color: "#2979ff", fontSize: "2.2rem" }}>
                {new Date(estadisticas.periodo.desde).toLocaleDateString()}
              </h2>
              <p className="card-text mb-0 mt-3" style={{ color: "#fff", fontSize: "1rem" }}>
                hasta {new Date(estadisticas.periodo.hasta).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
            <div className="card-header" style={{ backgroundColor: "var(--tenant-primary-color)", borderBottom: "none" }}>
              <h5 className="mb-0 text-dark fw-bold"><i className="fa-solid fa-calendar-days"></i> Check-ins por Día</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosDias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#bbb" />
                  <YAxis stroke="#bbb" />
                  <Tooltip contentStyle={{ backgroundColor: "#2a2a2a", border: "1px solid var(--tenant-primary-color)", borderRadius: "8px" }} itemStyle={{ color: "#fff" }} />
                  <Legend wrapperStyle={{ color: "#bbb" }} />
                  <Bar dataKey="value" fill="var(--tenant-primary-color)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
            <div className="card-header" style={{ backgroundColor: "var(--tenant-primary-color)", borderBottom: "none" }}>
              <h5 className="mb-0 text-dark fw-bold"><i className="fa-solid fa-chalkboard-user"></i> Check-ins por Profesor</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosProfesores}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosProfesores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#2a2a2a", border: "1px solid var(--tenant-primary-color)", borderRadius: "8px" }} itemStyle={{ color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Socios */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
            <div className="card-header" style={{ backgroundColor: "var(--tenant-primary-color)", borderBottom: "none" }}>
              <h5 className="mb-0 text-dark fw-bold"><i className="fa-solid fa-trophy"></i> Top 5 Socios con Mayor Asistencia</h5>
            </div>
            <div className="card-body">
              <div className="row align-items-start">
                {datosSocios.length === 0 ? (
                  <p className="text-center text-muted w-100">No hay datos disponibles</p>
                ) : (
                  datosSocios.map((socio, index) => {
                    const medals = [
                      <i className="fa-solid fa-medal" style={{color: "#ffd700"}}></i>,
                      <i className="fa-solid fa-medal" style={{color: "#c0c0c0"}}></i>,
                      <i className="fa-solid fa-medal" style={{color: "#cd7f32"}}></i>
                    ];
                    const medal = medals[index] || `#${index + 1}`;
                    const colors = ["#ffd700", "#c0c0c0", "#cd7f32", "var(--tenant-primary-color)", "var(--tenant-primary-color)"];
                    const bgColors = ["rgba(255, 215, 0, 0.2)", "rgba(192, 192, 192, 0.2)", "rgba(205, 127, 50, 0.2)", "rgba(255, 102, 0, 0.1)", "rgba(255, 102, 0, 0.1)"];

                    return (
                      <div key={index} className="col-md-2 col-sm-4 col-6 mb-3">
                        <div
                          className="card h-100 text-center"
                          style={{
                            backgroundColor: bgColors[index] || "rgba(255, 102, 0, 0.1)",
                            borderColor: colors[index] || "var(--tenant-primary-color)",
                            borderWidth: "2px",
                            borderRadius: "12px",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            cursor: "pointer"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-5px)";
                            e.currentTarget.style.boxShadow = `0 8px 20px ${colors[index] || "var(--tenant-primary-color)"}40`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div className="card-body d-flex flex-column justify-content-center">
                            <div style={{ fontSize: "2.5rem", lineHeight: 1 }}>{medal}</div>
                            <h6
                              className="fw-bold mt-2 mb-1"
                              style={{
                                color: "#fff",
                                fontSize: "0.9rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical"
                              }}
                            >
                              {socio.name}
                            </h6>
                            <div
                              className="fw-bold"
                              style={{
                                color: colors[index] || "var(--tenant-primary-color)",
                                fontSize: "1.8rem",
                                textShadow: "0 0 10px rgba(255, 102, 0, 0.5)"
                              }}
                            >
                              {socio.checkins}
                            </div>
                            <small className="text-muted">check-ins</small>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


