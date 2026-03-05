import { useEffect, useState } from "react";
import { getAllTenantsAdmin, TenantAdminDto, EstadoCuentaSaaS } from "@/api/saasApi";
import Swal from "sweetalert2";

export default function DashboardAdminSaaS() {
  const [tenants, setTenants] = useState<TenantAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "activos" | "trial" | "suspendidos">("todos");

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await getAllTenantsAdmin();
      setTenants(data);
    } catch (error: any) {
      console.error("Error al cargar tenants:", error);
      if (error.response?.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Acceso Denegado",
          text: "No tienes permisos para acceder a esta sección. Solo el super tenant puede acceder.",
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los tenants",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: EstadoCuentaSaaS) => {
    switch (estado) {
      case EstadoCuentaSaaS.Trial:
        return { text: '<i class="fa-solid fa-star"></i> Trial', color: "info" };
      case EstadoCuentaSaaS.Activo:
        return { text: "Activo", color: "success" };
      case EstadoCuentaSaaS.EnGracia:
        return { text: '<i class="fa-solid fa-triangle-exclamation"></i> Gracia', color: "warning" };
      case EstadoCuentaSaaS.Suspendido:
        return { text: '<i class="fa-solid fa-ban"></i> Suspendido', color: "danger" };
      case EstadoCuentaSaaS.Cancelado:
        return { text: "Cancelado", color: "secondary" };
      default:
        return { text: "Desconocido", color: "secondary" };
    }
  };

  const getPlanBadge = (plan?: { nombre: string; esAnual: boolean }) => {
    if (!plan) return { text: "Sin plan", color: "secondary" };
    return {
      text: `${plan.nombre} (${plan.esAnual ? "Anual" : "Mensual"})`,
      color: plan.esAnual ? "success" : "primary"
    };
  };

  const getPorcentajeBarColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "danger";
    if (porcentaje >= 70) return "warning";
    return "success";
  };

  const tenantsFiltrados = tenants.filter(t => {
    if (filtro === "todos") return true;
    if (filtro === "activos") return t.activo && t.estadoCuenta === EstadoCuentaSaaS.Activo;
    if (filtro === "trial") return t.estadoCuenta === EstadoCuentaSaaS.Trial;
    if (filtro === "suspendidos") return t.estadoCuenta === EstadoCuentaSaaS.Suspendido;
    return true;
  });

  // Estadísticas generales
  const stats = {
    total: tenants.length,
    activos: tenants.filter(t => t.activo).length,
    trial: tenants.filter(t => t.estadoCuenta === EstadoCuentaSaaS.Trial).length,
    suspendidos: tenants.filter(t => t.estadoCuenta === EstadoCuentaSaaS.Suspendido).length,
    ingresosMensuales: tenants.reduce((acc, t) => {
      if (!t.planSaas) return acc;
      const plan = t.planSaas;
      // Precio aproximado (hardcoded por ahora, debería venir del DTO)
      const precios: Record<string, number> = {
        "Basic": 10000,
        "Standard": 25000,
        "Premium": 50000,
        "Enterprise": 100000
      };
      const precio = precios[plan.nombre] || 0;
      return acc + (plan.esAnual ? (precio * 0.83) / 12 : precio);
    }, 0)
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando dashboard administrativo...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="titulo-modulo" style={{ textAlign: "left", margin: 0 }}>
          <i class="fa-solid fa-building"></i> Dashboard Administrativo SaaS
        </h1>
        <button className="btn btn-outline-warning" onClick={fetchTenants}>
          <i class="fa-solid fa-rotate"></i> Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body text-center">
              <h3 className="card-title display-6 fw-bold">{stats.total}</h3>
              <p className="card-text mb-0">Total Tenants</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 bg-success text-white">
            <div className="card-body text-center">
              <h3 className="card-title display-6 fw-bold">{stats.activos}</h3>
              <p className="card-text mb-0">Activos</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 bg-info text-white">
            <div className="card-body text-center">
              <h3 className="card-title display-6 fw-bold">{stats.trial}</h3>
              <p className="card-text mb-0">En Trial</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 bg-warning text-white">
            <div className="card-body text-center">
              <h3 className="card-title display-6 fw-bold">
                ${stats.ingresosMensuales.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </h3>
              <p className="card-text mb-0">Ingreso Mensual Est.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm bg-dark text-white">
        <div className="card-body">
          <div className="btn-group flex-wrap" role="group">
            <button
              className={`btn ${filtro === "todos" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFiltro("todos")}
            >
              Todos ({stats.total})
            </button>
            <button
              className={`btn ${filtro === "activos" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setFiltro("activos")}
            >
              Activos ({stats.activos})
            </button>
            <button
              className={`btn ${filtro === "trial" ? "btn-info" : "btn-outline-info"}`}
              onClick={() => setFiltro("trial")}
            >
              Trial ({stats.trial})
            </button>
            <button
              className={`btn ${filtro === "suspendidos" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => setFiltro("suspendidos")}
            >
              Suspendidos ({stats.suspendidos})
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de tenants */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0"><i class="fa-solid fa-clipboard-list"></i> Listado de Tenants</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Gimnasio</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Socios</th>
                  <th>Personal</th>
                  <th>Admin</th>
                  <th>Email</th>
                  <th>Vence</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {tenantsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4">
                      No se encontraron tenants
                    </td>
                  </tr>
                ) : (
                  tenantsFiltrados.map((t) => (
                    <tr key={t.tenantId} style={{ opacity: t.activo ? 1 : 0.5 }}>
                      <td>{t.tenantId}</td>
                      <td>
                        <div>
                          <strong>{t.nombreGimnasio}</strong>
                          {!t.activo && <span className="badge bg-danger ms-2">Inactivo</span>}
                        </div>
                        {t.slug && <small className="text-muted">{t.slug}</small>}
                      </td>
                      <td>
                        <span className={`badge bg-${getPlanBadge(t.planSaas).color}`}>
                          {getPlanBadge(t.planSaas).text}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${getEstadoBadge(t.estadoCuenta).color}`}
                          dangerouslySetInnerHTML={{ __html: getEstadoBadge(t.estadoCuenta).text }}
                        />
                        {t.estadoCuenta === EstadoCuentaSaaS.Trial && t.diasRestantesTrial <= 3 && (
                          <div>
                            <small className="text-danger"><i class="fa-solid fa-triangle-exclamation"></i> {t.diasRestantesTrial} días</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{t.estadisticasUso.sociosActivos}</strong>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar bg-${getPorcentajeBarColor(t.estadisticasUso.porcentajeUsoSocios)}`}
                              role="progressbar"
                              style={{ width: `${Math.min(t.estadisticasUso.porcentajeUsoSocios, 100)}%` }}
                            />
                          </div>
                          <small className="text-muted">{t.estadisticasUso.porcentajeUsoSocios.toFixed(2)}% usado</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{t.estadisticasUso.personalActivo}</strong>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar bg-${getPorcentajeBarColor(t.estadisticasUso.porcentajeUsoPersonal)}`}
                              role="progressbar"
                              style={{ width: `${Math.min(t.estadisticasUso.porcentajeUsoPersonal, 100)}%` }}
                            />
                          </div>
                          <small className="text-muted">{t.estadisticasUso.porcentajeUsoPersonal.toFixed(2)}% usado</small>
                        </div>
                      </td>
                      <td>{t.adminNombre || "—"}</td>
                      <td>
                        <small>{t.adminEmail || t.email}</small>
                      </td>
                      <td>
                        {t.planVenceEn ? (
                          <span className={`text-${t.diasRestantes <= 7 ? "danger" : t.diasRestantes <= 30 ? "warning" : "success"}`}>
                            {new Date(t.planVenceEn).toLocaleDateString("es-AR")}
                            <br />
                            <small>{t.diasRestantes} días</small>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <small>{new Date(t.fechaRegistro).toLocaleDateString("es-AR")}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="card mt-3 shadow-sm bg-dark text-white">
        <div className="card-body">
          <h6 className="fw-bold mb-3"><i class="fa-solid fa-book-open"></i> Leyenda de Estados</h6>
          <div className="row g-2">
            <div className="col-6 col-md-2">
              <span className="badge bg-info fs-6"><i class="fa-solid fa-star"></i> Trial</span>
              <p className="small text-white mb-0">Período de prueba</p>
            </div>
            <div className="col-6 col-md-2">
              <span className="badge bg-success fs-6"><i className="fa-solid fa-circle-check"></i> Activo</span>
              <p className="small text-white mb-0">Pagando normalmente</p>
            </div>
            <div className="col-6 col-md-2">
              <span className="badge bg-warning fs-6"><i class="fa-solid fa-triangle-exclamation"></i> Gracia</span>
              <p className="small text-white mb-0">Período de gracia</p>
            </div>
            <div className="col-6 col-md-2">
              <span className="badge bg-danger fs-6"><i class="fa-solid fa-ban"></i> Suspendido</span>
              <p className="small text-white mb-0">Pagos fallidos</p>
            </div>
            <div className="col-6 col-md-2">
              <span className="badge bg-secondary fs-6"><i class="fa-solid fa-circle-xmark"></i> Cancelado</span>
              <p className="small text-white mb-0">Cancelación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
