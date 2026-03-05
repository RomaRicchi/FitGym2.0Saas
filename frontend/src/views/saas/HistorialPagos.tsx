import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import saasApi, { HistorialPagoSaaSDto, EstadoPagoSaaS } from "@/api/saasApi";

export default function HistorialPagos() {
  const [pagos, setPagos] = useState<HistorialPagoSaaSDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    setLoading(true);
    try {
      const data = await saasApi.getHistorialPagosSaaS();
      setPagos(data);
    } catch (error: any) {
      console.error("Error al cargar historial:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo cargar el historial de pagos",
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

  const getEstadoBadge = (estado: EstadoPagoSaaS) => {
    switch (estado) {
      case EstadoPagoSaaS.Exitoso:
        return { text: "Exitoso", color: "success", icon: "fa-check-circle" };
      case EstadoPagoSaaS.Fallido:
        return { text: "Fallido", color: "danger", icon: "fa-times-circle" };
      case EstadoPagoSaaS.Pendiente:
        return { text: "Pendiente", color: "warning", icon: "fa-clock" };
      default:
        return { text: estado.toString(), color: "secondary", icon: "fa-question-circle" };
    }
  };

  const getTipoBadge = (esAutomatico: boolean) => {
    return esAutomatico
      ? { text: "Renovación automática", color: "info", icon: "fa-sync" }
      : { text: "Manual", color: "primary", icon: "fa-hand-pointer" };
  };

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const formatearFecha = (fecha: Date | null | undefined) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncarTransaccionId = (id: string) => {
    if (!id) return "-";
    if (id.length <= 20) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };

  const pagosFiltrados = filtroEstado === "todos"
    ? pagos
    : pagos.filter(p => p.EstadoStr.toLowerCase() === filtroEstado.toLowerCase());

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-orange" role="status"></div>
        <p className="mt-2">Cargando historial de pagos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-orange text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i class="fa-solid fa-receipt"></i> Historial de Pagos</h5>
          <span className="badge bg-white text-orange">{pagos.length} pagos</span>
        </div>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="fw-semibold me-2">Filtrar por estado:</label>
              <select
                className="form-select form-select-sm d-inline-block w-auto"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="exitoso">Exitosos</option>
                <option value="fallido">Fallidos</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>
            <div className="col-md-6 text-end">
              <small className="text-muted">
                Mostrando {pagosFiltrados.length} de {pagos.length} pagos
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Historial */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {pagosFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa-solid fa-receipt fa-3x text-muted mb-3"></i>
              <p className="text-muted">No hay pagos registrados</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Plan</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Tipo</th>
                    <th>Transacción</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map((pago, index) => {
                    const estadoBadge = getEstadoBadge(pago.Estado);
                    const tipoBadge = getTipoBadge(pago.EsRenovacionAutomatica);

                    return (
                      <tr key={index}>
                        <td>
                          <div className="fw-semibold">{formatearFecha(pago.FechaIntento)}</div>
                          {pago.FechaProcesamiento && (
                            <small className="text-muted d-block">
                              Procesado: {formatearFecha(pago.FechaProcesamiento)}
                            </small>
                          )}
                        </td>
                        <td>{pago.PlanNombre}</td>
                        <td className="fw-semibold">{formatearMonto(pago.Monto)}</td>
                        <td>
                          <span className={`badge bg-${estadoBadge.color}`}>
                            <i className={`fa-solid ${estadoBadge.icon}`}></i> {estadoBadge.text}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${tipoBadge.color}`}>
                            <i className={`fa-solid ${tipoBadge.icon}`}></i> {tipoBadge.text}
                          </span>
                          {pago.IntentosRealizados > 1 && (
                            <span className="badge bg-secondary ms-1">
                              {pago.IntentosRealizados} intentos
                            </span>
                          )}
                        </td>
                        <td>
                          <code className="text-muted small">{truncarTransaccionId(pago.TransaccionId)}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
