import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faCalendar,
  faFilter,
  faChartPie,
  faEye,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import cajaApi, {
  CajaRecepcionista,
  CajaFilter,
  EstadoCaja,
  ResumenCaja,
  ReporteCajas,
} from "@/api/cajaApi";
import Pagination from "@/components/Pagination";
import Swal from "sweetalert2";

export default function CajaHistorialView() {
  const [activeTab, setActiveTab] = useState<"historial" | "reportes">("historial");

  // Estados para historial
  const [cajas, setCajas] = useState<CajaRecepcionista[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Estados para reportes
  const [reporte, setReporte] = useState<ReporteCajas | null>(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  // Estados para resumen de caja seleccionada
  const [cajaSeleccionada, setCajaSeleccionada] = useState<CajaRecepcionista | null>(null);
  const [resumenCaja, setResumenCaja] = useState<ResumenCaja | null>(null);
  const [showResumen, setShowResumen] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState<CajaFilter>({
    pageNumber: 1,
    pageSize: 50,
  });
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split("T")[0]);
  const [filtroRecepcionista, setFiltroRecepcionista] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);

  // Cargar historial
  const cargarHistorial = async () => {
    try {
      setLoadingHistorial(true);
      const params: CajaFilter = {
        ...filtros,
        desde: fechaInicio,
        hasta: fechaFin,
        estado: filtroEstado ? parseInt(filtroEstado) as EstadoCaja : undefined,
      };
      const response = await cajaApi.getHistorial(params);
      setCajas(response.items);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "Error al cargar historial de cajas",
      });
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Cargar reporte
  const cargarReporte = async () => {
    try {
      setLoadingReporte(true);
      const data = await cajaApi.getReporte(fechaInicio, fechaFin);
      setReporte(data);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "Error al cargar reporte de cajas",
      });
    } finally {
      setLoadingReporte(false);
    }
  };

  // Ver resumen de una caja
  const verResumen = async (caja: CajaRecepcionista) => {
    try {
      setCajaSeleccionada(caja);
      setShowResumen(true);
      const resumen = await cajaApi.getResumen(caja.id);
      setResumenCaja(resumen);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "Error al cargar resumen de caja",
      });
    }
  };

  // Cerrar modal de resumen
  const cerrarResumen = () => {
    setShowResumen(false);
    setCajaSeleccionada(null);
    setResumenCaja(null);
  };

  // Cargar datos según pestaña activa
  useEffect(() => {
    if (activeTab === "historial") {
      cargarHistorial();
    } else {
      cargarReporte();
    }
  }, [activeTab, filtros, fechaInicio, fechaFin, filtroEstado]);

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formatear monto
  const formatMonto = (monto: number) => {
    return `$${monto.toFixed(2)}`;
  };

  // Obtener clase para estado
  const getEstadoBadgeClass = (estado: EstadoCaja) => {
    switch (estado) {
      case EstadoCaja.Abierta:
        return "bg-success";
      case EstadoCaja.Cerrada:
        return "bg-secondary";
      case EstadoCaja.EnArqueo:
        return "bg-warning";
      case EstadoCaja.Anulada:
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Obtener nombre del estado
  const getEstadoNombre = (estado: EstadoCaja) => {
    switch (estado) {
      case EstadoCaja.Abierta:
        return "Abierta";
      case EstadoCaja.Cerrada:
        return "Cerrada";
      case EstadoCaja.EnArqueo:
        return "En Arqueo";
      case EstadoCaja.Anulada:
        return "Anulada";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo-modulo">
          <FontAwesomeIcon icon={faCashRegister} className="me-2" />
          HISTORIAL DE CAJAS
        </h2>
      </div>

      {/* Pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "historial" ? "active" : ""}`}
            onClick={() => setActiveTab("historial")}
          >
            <FontAwesomeIcon icon={faCashRegister} className="me-2" />
            Historial de Cajas
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "reportes" ? "active" : ""}`}
            onClick={() => setActiveTab("reportes")}
          >
            <FontAwesomeIcon icon={faChartPie} className="me-2" />
            Reportes y Estadísticas
          </button>
        </li>
      </ul>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Filtros de Búsqueda
          </h6>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />
          </button>
        </div>
        {showFilters && (
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Fecha Desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha Hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="1">Abierta</option>
                  <option value="2">Cerrada</option>
                  <option value="3">En Arqueo</option>
                  <option value="4">Anulada</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido según pestaña activa */}
      {activeTab === "historial" ? (
        /* Historial */
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Historial de Cajas ({totalCount} registros)
            </h5>
          </div>
          <div className="card-body">
            {loadingHistorial ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : cajas.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FontAwesomeIcon icon={faCashRegister} className="fs-1 d-block mb-3" />
                <p>No se encontraron cajas para los filtros aplicados.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table tabla-gestion table-hover">
                    <thead>
                      <tr>
                        <th>Recepcionista</th>
                        <th>Apertura</th>
                        <th>Cierre</th>
                        <th>Dotación Inicial</th>
                        <th>Ventas</th>
                        <th>Estado</th>
                        <th>Diferencia</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cajas.map((caja) => (
                        <tr key={caja.id}>
                          <td>{caja.recepcionistaNombre}</td>
                          <td>
                            <FontAwesomeIcon icon={faCalendar} className="me-1 text-muted" />
                            {formatFecha(caja.apertura)}
                          </td>
                          <td>
                            {caja.cierre ? (
                              <>
                                <FontAwesomeIcon icon={faCalendar} className="me-1 text-muted" />
                                {formatFecha(caja.cierre)}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{formatMonto(caja.dotacionInicial)}</td>
                          <td>
                            <strong>{formatMonto(caja.montoEsperado - caja.dotacionInicial)}</strong>
                          </td>
                          <td>
                            <span className={`badge ${getEstadoBadgeClass(caja.estado)}`}>
                              {getEstadoNombre(caja.estado)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={
                                caja.diferencia > 0
                                  ? "text-success"
                                  : caja.diferencia < 0
                                  ? "text-danger"
                                  : ""
                              }
                            >
                              {formatMonto(caja.diferencia)}
                            </span>
                          </td>
                          <td>
                            <div className="acciones-botones">
                              <button
                                className="btn-accion"
                                style={{ backgroundColor: "#17a2b8", color: "#fff" }}
                                onClick={() => verResumen(caja)}
                                title="Ver detalle"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={filtros.pageNumber!}
                  totalPages={Math.ceil(totalCount / filtros.pageSize!)}
                  totalItems={totalCount}
                  pageSize={filtros.pageSize!}
                  onPageChange={(newPage) =>
                    setFiltros({
                      ...filtros,
                      pageNumber: newPage,
                    })
                  }
                />
              </>
            )}
          </div>
        </div>
      ) : (
        /* Reportes */
        <div>
          {loadingReporte ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : reporte ? (
            <div className="row">
              {/* Tarjeta de resumen */}
              <div className="col-md-12 mb-4">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">Total de Ventas del Período</h5>
                        <p className="card-text display-4 mb-0">
                          {formatMonto(reporte.totalVentasPeriodo)}
                        </p>
                      </div>
                      <FontAwesomeIcon icon={faChartPie} className="fs-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="col-md-4 mb-4">
                <div className="card text-center">
                  <div className="card-body">
                    <h6 className="card-title">Cantidad de Cajas</h6>
                    <p className="card-text display-6 mb-0">{reporte.cajas.length}</p>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className={`card text-center ${reporte.totalSobrantes > 0 ? 'border-success' : ''}`}>
                  <div className="card-body">
                    <h6 className="card-title">Total Sobrantes</h6>
                    <p className="card-text display-6 mb-0 text-success">
                      {formatMonto(reporte.totalSobrantes)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className={`card text-center ${reporte.totalFaltantes < 0 ? 'border-danger' : ''}`}>
                  <div className="card-body">
                    <h6 className="card-title">Total Faltantes</h6>
                    <p className="card-text display-6 mb-0 text-danger">
                      {formatMonto(Math.abs(reporte.totalFaltantes))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de cajas */}
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Detalle de Cajas</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table tabla-gestion table-sm">
                        <thead>
                          <tr>
                            <th>Recepcionista</th>
                            <th>Apertura</th>
                            <th>Cierre</th>
                            <th>Ventas</th>
                            <th>Diferencia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.cajas.map((caja) => (
                            <tr key={caja.id}>
                              <td>{caja.recepcionistaNombre}</td>
                              <td>{formatFecha(caja.apertura)}</td>
                              <td>{caja.cierre ? formatFecha(caja.cierre) : "-"}</td>
                              <td>
                                <strong>{formatMonto(caja.montoEsperado - caja.dotacionInicial)}</strong>
                              </td>
                              <td>
                                <span
                                  className={
                                    caja.diferencia > 0
                                      ? "text-success"
                                      : caja.diferencia < 0
                                      ? "text-danger"
                                      : ""
                                  }
                                >
                                  {formatMonto(caja.diferencia)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <FontAwesomeIcon icon={faChartPie} className="fs-1 d-block mb-3" />
              <p>No hay datos para mostrar en el reporte.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Resumen de Caja */}
      {showResumen && cajaSeleccionada && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Resumen de Caja - {cajaSeleccionada.recepcionistaNombre}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarResumen}
                ></button>
              </div>
              <div className="modal-body">
                {resumenCaja ? (
                  <>
                    <h6 className="mb-3">Resumen de Ventas</h6>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="card mb-2">
                          <div className="card-body py-2">
                            <small className="text-muted">Efectivo</small>
                            <h5 className="mb-0">{formatMonto(resumenCaja.ventasEfectivo)}</h5>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card mb-2">
                          <div className="card-body py-2">
                            <small className="text-muted">Transferencia</small>
                            <h5 className="mb-0">{formatMonto(resumenCaja.ventasTransferencia)}</h5>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card mb-2">
                          <div className="card-body py-2">
                            <small className="text-muted">MercadoPago</small>
                            <h5 className="mb-0">{formatMonto(resumenCaja.ventasMercadoPago)}</h5>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card mb-2">
                          <div className="card-body py-2">
                            <small className="text-muted">Otros Métodos</small>
                            <h5 className="mb-0">{formatMonto(resumenCaja.ventasOtros)}</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="card bg-primary text-white">
                          <div className="card-body py-2">
                            <small>Total Ventas</small>
                            <h4 className="mb-0">{formatMonto(resumenCaja.totalVentas)}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card bg-info text-white">
                          <div className="card-body py-2">
                            <small>Transacciones</small>
                            <h4 className="mb-0">{resumenCaja.totalTransacciones}</h4>
                          </div>
                        </div>
                      </div>
                    </div>

                    {resumenCaja.totalRetiros > 0 && (
                      <div className="row mt-3">
                        <div className="col-md-12">
                          <div className="card bg-warning text-dark">
                            <div className="card-body py-2">
                              <small>Total Retiros</small>
                              <h5 className="mb-0">{formatMonto(resumenCaja.totalRetiros)}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {resumenCaja.totalIngresosExtra > 0 && (
                      <div className="row mt-2">
                        <div className="col-md-12">
                          <div className="card bg-success text-white">
                            <div className="card-body py-2">
                              <small>Ingresos Extra</small>
                              <h5 className="mb-0">{formatMonto(resumenCaja.totalIngresosExtra)}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cerrarResumen}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
}
