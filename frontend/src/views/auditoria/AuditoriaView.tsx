import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faList,
  faFilter,
  faEye,
  faEraser,
  faFilePdf,
  faPrint,
  faCalendarDay,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import html2pdf from "html2pdf.js";
import auditoriaApi, {
  AuditoriaOperacion,
  AuditoriaFilter,
} from "@/api/auditoriaApi";
import cajaApi, { MovimientoCaja, TipoMovimientoCaja, MetodoPagoCaja } from "@/api/cajaApi";
import Pagination from "@/components/Pagination";
import gymApi from "@/api/gymApi";
import Swal from "sweetalert2";

const EXPORT_BASE_CSS = `
  .export-clean, .export-clean * {
    background: #ffffff !important;
    color: #111111 !important;
    box-shadow: none !important;
  }
  .export-clean [style*="linear-gradient"] { background: #ffffff !important; }
  .export-clean .card {
    border: 1px solid #e5e5e5 !important;
    background: #ffffff !important;
  }
  .export-clean .card-body {
    background: #ffffff !important;
  }
  .export-clean .gradient-bg,
  .export-clean .gradient-card {
    background: #ffffff !important;
  }
  .export-clean .text-white { color: #111111 !important; }
  .export-clean .btn,
  .export-clean .no-print { display: none !important; }
  .export-clean table { border: 1px solid #d9d9d9 !important; border-collapse: collapse !important; }
  .export-clean th { background: #f3f3f3 !important; }
  .export-clean th, .export-clean td { border: 1px solid #e0e0e0 !important; color: #111111 !important; }
`;

// Estilos para filas de auditoría por tipo de operación
const AUDITORIA_ROW_STYLES = `
  .tabla-gestion tbody tr.auditoria-row-create td {
    background-color: rgba(34, 197, 94, 0.25) !important;
  }
  .tabla-gestion tbody tr.auditoria-row-create {
    border-bottom: 1px solid #198754 !important;
  }
  .tabla-gestion tbody tr.auditoria-row-create:hover td {
    background-color: rgba(34, 197, 94, 0.35) !important;
  }

  .tabla-gestion tbody tr.auditoria-row-update td {
    background-color: rgba(234, 179, 8, 0.25) !important;
  }
  .tabla-gestion tbody tr.auditoria-row-update {
    border-bottom: 1px solid #eab308 !important;
  }
  .tabla-gestion tbody tr.auditoria-row-update:hover td {
    background-color: rgba(234, 179, 8, 0.35) !important;
  }

  .tabla-gestion tbody tr.auditoria-row-delete td {
    background-color: rgba(239, 68, 68, 0.25) !important;
  }
  .tabla-gestion tbody tr.auditoria-row-delete {
    border-bottom: 1px solid #ef4444 !important;
  }
  .tabla-gestion tbody tr.auditoria-row-delete:hover td {
    background-color: rgba(239, 68, 68, 0.35) !important;
  }

  .tabla-gestion tbody tr.auditoria-row-default td {
    background-color: rgba(148, 163, 184, 0.15) !important;
  }
  .tabla-gestion tbody tr.auditoria-row-default {
    border-bottom: 1px solid #64748b !important;
  }
  .tabla-gestion tbody tr.auditoria-row-default:hover td {
    background-color: rgba(148, 163, 184, 0.25) !important;
  }
`;

const dailyReportButtonStyle = (disabled: boolean): React.CSSProperties => ({
  borderRadius: "10px",
  background: "linear-gradient(135deg, var(--tenant-primary-color), #1e59d9)",
  color: "#f8f9fa",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: disabled ? "none" : "0 12px 26px rgba(0, 0, 0, 0.32)",
  padding: "10px 14px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 650,
  letterSpacing: "0.2px",
  transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
  opacity: disabled ? 0.75 : 1,
  cursor: disabled ? "not-allowed" : "pointer",
});

const actionButtonDimensions: React.CSSProperties = {
  minWidth: "140px",
  height: "38px",
};

interface Usuario {
  id: number;
  alias: string;
  email: string;
  rol: string; // Viene en camelCase desde el JSON
  estado: boolean;
}

// Componente para mostrar el reporte diario
interface ReporteDiarioViewProps {
  datos: any;
  fechaInicio: string;
  fechaFin: string;
  onCerrar: () => void;
  onImprimir: () => void;
  onGenerarPDF: () => void;
  esAdmin?: boolean;
}

const ReporteDiarioView: React.FC<ReporteDiarioViewProps> = ({
  datos,
  fechaInicio,
  fechaFin,
  onCerrar,
  onImprimir,
  onGenerarPDF,
  esAdmin = false,
}) => {
  const printStyles = `
    ${EXPORT_BASE_CSS}
    @media print {
      body { background: white !important; color: #111 !important; }
      #reporte-diario { background: white !important; color: #111 !important; }
      #reporte-diario .btn,
      #reporte-diario .no-print { display: none !important; }
    }
  `;

  const formatearFecha = (fecha: string) => {
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [año, mes, dia] = fecha.split('-');
      return `${dia}/${mes}/${año}`;
    }
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatearHora = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fmtMonto = (n: number | undefined) =>
    typeof n === "number" ? n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";

  const getTipoMovimientoBadge = (tipo: number) => {
    const badges: Record<number, { text: string; class: string }> = {
      1: { text: "Venta", class: "bg-success" },
      2: { text: "Retiro", class: "bg-danger" },
      3: { text: "Ingreso Extra", class: "bg-info" },
      4: { text: "Devolución", class: "bg-warning" },
      5: { text: "Apertura", class: "bg-primary" },
      6: { text: "Ajuste", class: "bg-secondary" },
    };
    return badges[tipo] || { text: String(tipo), class: "bg-secondary" };
  };

  const getMetodoPagoBadge = (metodo: number) => {
    const badges: Record<number, { text: string; class: string }> = {
      1: { text: '<i class="fa-solid fa-money-bill"></i> Efectivo', class: "bg-success" },
      2: { text: '<i class="fa-solid fa-credit-card"></i> Transferencia', class: "bg-primary" },
      3: { text: '<i class="fa-solid fa-mobile-screen"></i> MercadoPago', class: "bg-info" },
      4: { text: '<i class="fa-solid fa-file"></i> Cheque', class: "bg-secondary" },
      5: { text: '<i class="fa-solid fa-credit-card"></i> Débito', class: "bg-dark" },
      6: { text: '<i class="fa-solid fa-credit-card"></i> Crédito', class: "bg-dark" },
    };
    return badges[metodo] || null;
  };

  return (
    <div
      id="reporte-diario"
      className="reporte-diario-container"
      style={{ fontFamily: 'var(--bs-body-font-family)', padding: '0', width: '100%' }}
    >
      <style>{printStyles}</style>
      {/* Header con botones de acción */}
      <div className="card mb-4" style={{ border: 'none', borderRadius: '12px 12px 0 0' }}>
        <div className="card-body p-4 gradient-bg" style={{ background: 'linear-gradient(135deg, var(--tenant-primary-color) 0%, rgba(13, 110, 253, 0.8) 100%)', borderRadius: '12px 12px 0 0' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-center flex-grow-1">
              <h2 className="text-white mb-1" style={{ fontSize: '1.5rem' }}><i className="fa-solid fa-chart-pie"></i> REPORTE DIARIO DE MOVIMIENTOS DE CAJA</h2>
              <p className="text-white mb-0" style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                {formatearFecha(fechaInicio)}
                {fechaInicio !== fechaFin && ` - ${formatearFecha(fechaFin)}`}
              </p>
            </div>
            <div className="d-flex gap-2">
              {esAdmin && (
                <>
                  <button className="btn btn-danger no-print" onClick={onGenerarPDF} style={{ borderRadius: '6px', padding: '8px 16px', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-file-pdf me-2"></i>PDF
                  </button>
                  <button className="btn btn-light no-print" onClick={onImprimir} style={{ borderRadius: '6px', padding: '8px 16px', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-print me-2"></i>Imprimir
                  </button>
                </>
              )}
              <button className="btn btn-outline-light no-print" onClick={onCerrar} style={{ borderRadius: '6px', padding: '8px 16px', fontSize: '0.9rem', borderColor: 'white' }}>
                <i className="fa-solid fa-arrow-left me-2"></i>Volver
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen General */}
      <div className="card mb-4" style={{ border: 'none', borderRadius: '12px' }}>
        <div className="card-body p-4 gradient-card" style={{ background: 'linear-gradient(135deg, var(--tenant-primary-color) 0%, rgba(13, 110, 253, 0.85) 100%)', borderRadius: '12px', color: 'white' }}>
          <h3 className="mb-4" style={{ fontSize: '1.2rem' }}><i className="fa-solid fa-money-bill-wave"></i> RESUMEN DE CAJA - CUENTAS CLARAS</h3>

          {/* Primera fila: Operaciones en efectivo */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                <div className="card-body p-3">
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}><i className="fa-solid fa-money-bill"></i> Dotación Inicial</div>
                  <div className="fs-5 fw-bold">$ {fmtMonto(datos.totalDotacion)}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                <div className="card-body p-3">
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}><i class="fas fa-plus"></i> Ventas Efectivo</div>
                  <div className="fs-5 fw-bold text-success">+$ {fmtMonto(datos.totalVentasEfectivo)}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                <div className="card-body p-3">
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}><i className="fa-solid fa-money-bill-wave"></i> Ingresos Extra</div>
                  <div className="fs-5 fw-bold text-success">+$ {fmtMonto(datos.totalIngresosExtrasEfectivo)}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                <div className="card-body p-3">
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}><i className="fa-solid fa-arrow-trend-down"></i> Retiros</div>
                  <div className="fs-5 fw-bold text-danger">-$ {fmtMonto(datos.totalRetirosEfectivo)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Segunda fila: Transferencias y MercadoPago */}
          {(datos.totalTransferencias + datos.totalMercadoPago) > 0 && (
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <div className="card text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                  <div className="card-body p-3">
                    <div style={{ fontSize: '0.8rem', opacity: 0.85 }}><i className="fa-solid fa-credit-card"></i> Transferencias</div>
                    <div className="fs-5 fw-bold text-success">+$ {fmtMonto(datos.totalTransferencias)}</div>
                  </div>
                </div>
              </div>
              {datos.totalMercadoPago > 0 && (
                <div className="col-12 col-md-6">
                  <div className="card text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                    <div className="card-body p-3">
                      <div style={{ fontSize: '0.8rem', opacity: 0.85 }}><i className="fa-solid fa-mobile-screen"></i> MercadoPago</div>
                      <div className="fs-5 fw-bold text-success">+$ {fmtMonto(datos.totalMercadoPago)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tercera fila: Comparativa */}
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card text-center" style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px' }}>
                <div className="card-body p-3">
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}><i className="fa-solid fa-chart-line"></i> Monto Esperado (según operaciones)</div>
                  <div className="fs-4 fw-bold">$ {fmtMonto(datos.montoEsperado)}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card text-center" style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px' }}>
                <div className="card-body p-3">
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}><i className="fa-solid fa-circle-check"></i> Monto Real (entregado por recepción)</div>
                  <div className="fs-4 fw-bold">$ {fmtMonto(datos.montoReal)}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card text-center" style={{ background: datos.diferencia >= 0 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(220, 53, 69, 0.25)', border: `2px solid ${datos.diferencia >= 0 ? '#198754' : '#dc3545'}`, borderRadius: '8px' }}>
                <div className="card-body p-3">
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{datos.diferencia >= 0 ? <i className="fa-solid fa-sparkles"></i> : <i className="fa-solid fa-triangle-exclamation"></i>} Diferencia</div>
                  <div className={`fs-4 fw-bold ${datos.diferencia >= 0 ? 'text-success' : 'text-danger'}`}>
                    {datos.diferencia >= 0 ? '+' : ''}$ {fmtMonto(datos.diferencia)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cajas Cerradas del Período */}
      {datos.cajasCerradas.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'var(--tenant-secondary-color)', margin: '0 0 15px 0', fontSize: '1.3rem', fontWeight: 'bold' }}><i className="fa-solid fa-cash-register"></i> Cajas Cerradas ({datos.cajasCerradas.length})</h3>
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '3px solid #198754' }}>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#198754', color: 'white' }}>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid #145a3a' }}>Recepcionista</th>
                <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid #145a3a' }}>Apertura</th>
                <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid #145a3a' }}>Cierre</th>
                <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid #145a3a' }}>Dotación</th>
                <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid #145a3a' }}>Monto Real</th>
                <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid #145a3a' }}>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {datos.cajasCerradas.map((c: any) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e0e0e0', background: c.diferencia < 0 ? '#fff5f5' : 'inherit' }}>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#333' }}>{c.recepcionistaNombre || '-'}</div>
                    <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '3px' }}>Caja #{c.id}</div>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#333' }}>{formatearFecha(c.apertura)}</div>
                    <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '3px' }}>{formatearHora(c.apertura)}</div>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#333' }}>{formatearFecha(c.cierre)}</div>
                    <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '3px' }}>{formatearHora(c.cierre)}</div>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.95rem', color: '#333' }}>$ {fmtMonto(c.dotacionInicial || 0)}</td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 'bold', color: '#198754', whiteSpace: 'nowrap', fontSize: '1rem' }}>$ {fmtMonto(c.montoReal || 0)}</td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 'bold', color: c.diferencia >= 0 ? '#198754' : '#dc3545', whiteSpace: 'nowrap', fontSize: '1rem' }}>
                    {c.diferencia >= 0 ? '+' : ''}$ {fmtMonto(c.diferencia || 0)}
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', fontWeight: 'bold', borderTop: '3px solid #198754' }}>
                <td colSpan={4} style={{ padding: '14px 12px', textAlign: 'right', fontSize: '1rem', color: '#333' }}>Total Cajas Cerradas:</td>
                <td style={{ padding: '14px 12px', textAlign: 'right', color: '#198754', whiteSpace: 'nowrap', fontSize: '1.2rem', fontWeight: 'bold' }}>$ {fmtMonto(datos.totalCajasCerradas)}</td>
                <td style={{ padding: '14px 12px' }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla de Movimientos */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: 'var(--tenant-secondary-color)', margin: '0 0 15px 0', fontSize: '1.3rem', fontWeight: 'bold' }}><i class="fa-solid fa-clipboard-list"></i> Listado de Movimientos ({datos.todosMovimientos.length})</h3>
        {datos.todosMovimientos.length > 0 ? (
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '3px solid var(--tenant-primary-color)' }}>
            <colgroup>
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'var(--tenant-primary-color)', color: 'white' }}>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid rgba(0,0,0,0.2)' }}>Fecha/Hora</th>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid rgba(0,0,0,0.2)' }}>Operación</th>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid rgba(0,0,0,0.2)' }}>Descripción</th>
                <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid rgba(0,0,0,0.2)' }}>Método</th>
                <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '2px solid rgba(0,0,0,0.2)' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {datos.todosMovimientos.map((m: any, index: number) => {
                const tipoBadge = getTipoMovimientoBadge(m.tipo);
                const metodoBadge = getMetodoPagoBadge(m.metodoPago);
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #e0e0e0', background: m.tipo === 2 ? '#fff5f5' : m.tipo === 5 ? '#f0f9ff' : 'inherit' }}>
                    <td style={{ padding: '12px 12px', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#333' }}>{formatearFecha(m.timestamp)}</div>
                      <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '3px' }}>{formatearHora(m.timestamp)}</div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span className={`badge ${tipoBadge.class}`} style={{ fontSize: '0.85rem', padding: '6px 10px', fontWeight: 500 }}>{tipoBadge.text}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#333' }}>{m.descripcion || "-"}</div>
                      {m.recepcionista && <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '3px' }}>{m.recepcionista}</div>}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                      {metodoBadge ? <span className={`badge ${metodoBadge.class}`} style={{ fontSize: '0.85rem', padding: '6px 10px', fontWeight: 500 }}>{metodoBadge.text}</span> : <span style={{ color: '#666', fontWeight: 500 }}>-</span>}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 'bold', color: m.tipo === 2 ? '#dc3545' : '#198754', whiteSpace: 'nowrap', fontSize: '1rem' }}>
                      {m.tipo === 2 ? '-' : ''}$ {fmtMonto(m.monto)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', margin: '20px 0', fontSize: '1rem' }}>No hay movimientos en este período.</p>
        )}
      </div>
    </div>
  );
};


export default function AuditoriaView() {
  // Estados para historial
  const [auditorias, setAuditorias] = useState<AuditoriaOperacion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  // Estado para usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Filtros
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState<number | "">("");

  // Estado para reporte diario
  const [loadingReporteDiario, setLoadingReporteDiario] = useState(false);
  const [mostrandoReporteDiario, setMostrandoReporteDiario] = useState(false);
  const [datosReporteDiario, setDatosReporteDiario] = useState<any[] | null>(null);

  // Obtener rol del usuario
  const [usuarioRol, setUsuarioRol] = useState<string>("");
  useEffect(() => {
    const storedUser = sessionStorage.getItem("usuario");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsuarioRol(user.rol || user.Rol || "");
      } catch {
        // Error silencioso
      }
    }
  }, []);

  const esAdmin = usuarioRol === "Administrador";

  // Filtrar usuarios para solo Admin y Recepcionistas
  const usuariosPermitidos = usuarios.filter((u) => {
    const rol = u.rol?.toUpperCase() || "";
    return rol === "ADMINISTRADOR" || rol === "RECEPCION";
  });

  // Acceso rápido por id
  const usuarioMap = useMemo(() => {
    const m = new Map<number, Usuario>();
    usuarios.forEach((u) => m.set(u.id, u));
    return m;
  }, [usuarios]);

  // Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const res = await gymApi.get("/usuarios?page=1&pageSize=1000");
      const items = res.data.items || res.data || [];
      console.log("🔍 Usuarios cargados:", items.map((u: any) => ({ id: u.id, alias: u.alias, rol: u.rol })));
      setUsuarios(items);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Cargar historial
  const cargarHistorial = async () => {
    try {
      setLoadingHistorial(true);

      // Construir filtros
      const params: any = {
        pageNumber: page,
        pageSize: pageSize,
      };

      // Solo agregar fechas si están definidas
      if (fechaInicio) {
        params.desde = fechaInicio;
      }
      if (fechaFin) {
        params.hasta = fechaFin;
      }

      // Agregar filtro de usuario si está seleccionado
      if (filtroUsuario) {
        params.usuarioId = filtroUsuario;
      }

      const response = await auditoriaApi.getHistorial(params);
      setAuditorias(response.items);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "Error al cargar historial de auditoría",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
      });
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setFiltroUsuario("");
    setPage(1);
  };

  const hoyISO = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 10);
  };

  // Generar reporte diario
  const generarReporteDiario = async () => {
    // Validar que se hayan seleccionado fechas
    if (!fechaInicio || !fechaFin) {
      Swal.fire({
        icon: "info",
        title: "Fechas requeridas",
        html: `
          <div style="text-align:center;">
            <div style="font-size:2rem;margin-bottom:8px;"><i class="fa-solid fa-calendar"></i></div>
            <p style="margin:0;color:#777;">Selecciona un rango</p>
            <p style="margin:2px 0 0 0; font-weight:600;">Desde y Hasta</p>
          </div>
        `,
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
      });
      return;
    }

    try {
      setLoadingReporteDiario(true);

      // Obtener las cajas con movimientos del periodo
      const params: any = {
        desde: fechaInicio,
        hasta: fechaFin,
      };

      // Si ambas fechas son iguales, forzar reporte del día actual
      if (fechaInicio === fechaFin) {
        const hoy = hoyISO();
        params.desde = hoy;
        params.hasta = hoy;
      }

      // Agregar filtro de usuario si se seleccionó
      if (filtroUsuario) {
        params.usuarioId = filtroUsuario;
      }

      const res = await gymApi.get("/caja/mis-cajas", { params });

      const cajas = res.data.items || [];

      if (cajas.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin datos en el período",
          html: `
            <div style="text-align:center;">
              <div style="font-size:2rem;margin-bottom:8px;">🗂️</div>
              <p style="margin:0;color:#777;">No hay cajas registradas</p>
              <p style="margin:2px 0 0 0; font-weight:600;">en el rango seleccionado</p>
            </div>
          `,
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
        return;
      }

      // Guardar los datos y mostrar la vista
      setDatosReporteDiario(cajas);
      setMostrandoReporteDiario(true);
    } catch (err: any) {
      console.error("Error al generar reporte:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.response?.data?.error || "Error al generar reporte diario",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
      });
    } finally {
      setLoadingReporteDiario(false);
    }
  };

  // Cerrar vista del reporte diario
  const cerrarReporteDiario = () => {
    setMostrandoReporteDiario(false);
    setDatosReporteDiario(null);
  };

  // Imprimir reporte
  const imprimirReporte = () => {
    const contenido = document.getElementById("reporte-diario");
    if (contenido) {
      const ventana = window.open("", "_blank");
      if (ventana) {
        ventana.document.write(`
          <html>
          <head>
            <title>Reporte Diario de Caja</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 16px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 0.85rem; }
              th { background: #f0f0f0; }
              .badge { padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; }
              .bg-success { background: #198754; color: white; }
              .bg-danger { background: #dc3545; color: white; }
              .bg-primary { background: #0d6efd; color: white; }
              .bg-info { background: #0dcaf0; color: white; }
              .bg-warning { background: #ffc107; color: black; }
              .bg-secondary { background: #6c757d; color: white; }
              ${EXPORT_BASE_CSS}
              .no-print { display: none !important; }
            </style>
          </head>
          <body class="export-clean">${contenido.innerHTML}</body>
          </html>
        `);
        ventana.document.close();
        ventana.print();
      }
    }
  };

  // Generar PDF del reporte
  const generarPDF = () => {
    const elemento = document.getElementById("reporte-diario");

    if (!elemento) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo encontrar el contenido del reporte",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
      });
      return;
    }

    // Configuración del PDF
    const opt = {
      margin: [12, 12, 12, 12],
      filename: `Reporte_Diario_${fechaInicio}_${fechaFin}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "landscape" as const,
      },
      pagebreak: { mode: ["css", "legacy"] as const },
    };

    // Mostrar loading
    Swal.fire({
      title: "Generando PDF...",
      text: "Por favor, espere un momento",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    elemento.classList.add("export-clean");

    // Generar el PDF
    html2pdf()
      .set(opt)
      .from(elemento)
      .save()
      .then(() => {
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "PDF Generado",
          text: "El reporte se ha descargado correctamente",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
      })
      .catch((error: any) => {
        Swal.close();
        console.error("Error al generar PDF:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo generar el PDF. Por favor, intente nuevamente.",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
      })
      .finally(() => {
        elemento.classList.remove("export-clean");
      });
  };

  // Funciones de utilidad para formateo
  const formatearFechaReporte = (fecha: string) => {
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [año, mes, dia] = fecha.split('-');
      return `${dia}/${mes}/${año}`;
    }
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatearHoraReporte = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipoMovimientoBadge = (tipo: number) => {
    const badges: Record<number, { text: string; class: string }> = {
      1: { text: "Venta", class: "bg-success" },
      2: { text: "Retiro", class: "bg-danger" },
      3: { text: "Ingreso Extra", class: "bg-info" },
      4: { text: "Devolución", class: "bg-warning" },
      5: { text: "Apertura", class: "bg-primary" },
      6: { text: "Ajuste", class: "bg-secondary" },
    };
    const badge = badges[tipo] || { text: String(tipo), class: "bg-secondary" };
    return { text: badge.text, className: badge.class };
  };

  const getMetodoPagoBadge = (metodo: number) => {
    const badges: Record<number, { text: string; class: string }> = {
      1: { text: '<i class="fa-solid fa-money-bill"></i> Efectivo', class: "bg-success" },
      2: { text: '<i class="fa-solid fa-credit-card"></i> Transferencia', class: "bg-primary" },
      3: { text: '<i class="fa-solid fa-mobile-screen"></i> MercadoPago', class: "bg-info" },
      4: { text: '<i class="fa-solid fa-file"></i> Cheque', class: "bg-secondary" },
      5: { text: '<i class="fa-solid fa-credit-card"></i> Débito', class: "bg-dark" },
      6: { text: '<i class="fa-solid fa-credit-card"></i> Crédito', class: "bg-dark" },
    };
    return badges[metodo] || null;
  };

  // Calcular datos del reporte
  const calcularDatosReporte = (cajas: any[]) => {
    let totalVentas = 0;
    let totalRetiros = 0;
    let totalIngresosExtra = 0;
    let totalEfectivo = 0;
    let totalTransferencias = 0;
    let totalMercadoPago = 0;
    let totalVentasCajasAbiertas = 0;
    let totalRetirosCajasAbiertas = 0;
    let totalIngresosExtraCajasAbiertas = 0;
    let totalDotacion = 0;
    let totalVentasEfectivo = 0;
    let totalIngresosExtrasEfectivo = 0;
    let totalRetirosEfectivo = 0;

    const todosMovimientos: any[] = [];
    const cajasCerradas: any[] = [];
    const cajasAbiertas: any[] = [];

    cajas.forEach(caja => {
      if (caja.estado === 2) {
        cajasCerradas.push(caja);
      } else {
        cajasAbiertas.push(caja);
      }

      if (caja.movimientos && Array.isArray(caja.movimientos)) {
        caja.movimientos.forEach((m: any) => {
          m.cajaId = caja.id;
          m.cajaApertura = caja.apertura;
          m.cajaEstado = caja.estado;
          m.cajaCierre = caja.cierre;
          m.recepcionista = caja.recepcionistaNombre;
          todosMovimientos.push(m);

          if (m.tipo === 1) {
            totalVentas += m.monto;
            if (m.metodoPago === 1) {
              totalEfectivo += m.monto;
              totalVentasEfectivo += m.monto;
            }
            if (m.metodoPago === 2) totalTransferencias += m.monto;
            if (m.metodoPago === 3) totalMercadoPago += m.monto;
            if (caja.estado !== 2) {
              totalVentasCajasAbiertas += m.monto;
            }
          } else if (m.tipo === 2) {
            totalRetiros += m.monto;
            if (m.metodoPago === 1) {
              totalRetirosEfectivo += m.monto;
            }
            if (caja.estado !== 2) {
              totalRetirosCajasAbiertas += m.monto;
            }
          } else if (m.tipo === 3) {
            totalIngresosExtra += m.monto;
            if (m.metodoPago === 1) {
              totalEfectivo += m.monto;
              totalIngresosExtrasEfectivo += m.monto;
            }
            if (m.metodoPago === 2) totalTransferencias += m.monto;
            if (m.metodoPago === 3) totalMercadoPago += m.monto;
            if (caja.estado !== 2) {
              totalIngresosExtraCajasAbiertas += m.monto;
            }
          } else if (m.tipo === 5) {
            totalDotacion += m.monto;
            if (m.metodoPago === 1) {
              totalEfectivo += m.monto;
            }
          }
        });
      }
    });

    let totalCajasCerradas = 0;
    cajasCerradas.forEach(caja => {
      totalCajasCerradas += caja.montoReal || 0;
    });

    const montoEsperado = totalDotacion + totalVentasEfectivo + totalIngresosExtrasEfectivo - totalRetirosEfectivo;
    const montoReal = totalCajasCerradas;
    const diferencia = montoReal - montoEsperado;

    todosMovimientos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      todosMovimientos,
      cajasCerradas,
      cajasAbiertas,
      totalVentas,
      totalRetiros,
      totalIngresosExtra,
      totalEfectivo,
      totalTransferencias,
      totalMercadoPago,
      totalDotacion,
      totalVentasEfectivo,
      totalIngresosExtrasEfectivo,
      totalRetirosEfectivo,
      totalCajasCerradas,
      montoEsperado,
      montoReal,
      diferencia,
    };
  };

  // Cargar historial con filtros
  useEffect(() => {
    cargarHistorial();
  }, [page, fechaInicio, fechaFin, filtroUsuario]);

  // Cargar usuarios al montar
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Ver detalles de auditoría
  const verDetalles = async (id: number) => {
    try {
      const aud = await auditoriaApi.getById(id);
      const parseData = (data?: string) => {
        try {
          if (!data) return null;
          const parsed = JSON.parse(data);
          return parsed && typeof parsed === "object" ? parsed : null;
        } catch {
          return null;
        }
      };

      const hiddenKeys = [
        "CajaId",
        "cajaId",
        "CajaID",
        "caja_id",
        "entidadId",
        "MetodoPagoCaja",
        "metodoPagoCaja",
        "metodoPago",
        "Monto",
        "monto",
      ];

      const labelMap: Record<string, string> = {
        OrdenPagoId: "Orden de Pago",
        ordenPagoId: "Orden de Pago",
        Monto: "Monto",
        monto: "Monto",
        MetodoPagoCaja: "Método de Pago",
        metodoPago: "Método de Pago",
        metodoPagoCaja: "Método de Pago",
        recepcionista: "Recepcionista",
      };

      const formatLabel = (key: string) =>
        labelMap[key] ||
        key
          .replace(/([A-Z])/g, " $1")
          .replace(/_/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/^\w/, (c) => c.toUpperCase());

      const formatValue = (value: any) => {
        if (value === null || value === undefined || value === "") return "-";
        if (typeof value === "boolean") return value ? "Si" : "No";
        if (typeof value === "number") return value.toLocaleString("es-AR");
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object") return JSON.stringify(value, null, 2);
        return String(value);
      };

      const buildList = (data: any) => {
        if (!data || Object.keys(data).length === 0) {
          return `<div class="empty">Sin datos</div>`;
        }
        const rows = Object.entries(data).filter(([k]) => !hiddenKeys.includes(k));
        if (rows.length === 0) {
          return `<div class="empty">Sin datos</div>`;
        }
        return rows
          .map(
            ([k, v]) => `
              <div class="kv-row">
                <span class="kv-label">${formatLabel(k)}</span>
                <span class="kv-value">${formatValue(v)}</span>
              </div>`
          )
          .join("");
      };

      const datosAntiguos = parseData(aud.datosAntiguos);
      const datosNuevos = parseData(aud.datosNuevos);
      const rolDisplay = aud.tipoOperacion || "";
      const montoHeader = datosNuevos?.Monto ?? datosNuevos?.monto;
      const metodoRaw =
        datosNuevos?.MetodoPagoCaja ??
        datosNuevos?.metodoPagoCaja ??
        datosNuevos?.metodoPago;

      const metodoLabel = (() => {
        switch (metodoRaw) {
          case 1:
            return "Efectivo";
          case 2:
            return "Transferencia";
          case 3:
            return "Mercado Pago";
          case 4:
            return "Cheque";
          case 5:
            return "Tarjeta Débito";
          case 6:
            return "Tarjeta Crédito";
          default:
            return metodoRaw !== undefined ? String(metodoRaw) : null;
        }
      })();

      Swal.fire({
        title: `Detalle de operación`,
        width: 860,
        html: `
          <style>
            .detalle-header{background:#1f2430;border-radius:12px;padding:14px;color:#f8f9fa;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;border:1px solid #2f3644;}
            .pill{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;background:#101420;font-weight:700;}
            .pill.badge{background:#f5f5f5;color:#111;}
            .data-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:14px;}
            .data-section{background:rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;}
            .data-title{margin:0 0 8px 0;font-weight:700;color:#fff;}
            .kv-row{display:flex;justify-content:space-between;gap:12px;padding:7px 10px;margin-bottom:6px;background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.06);border-radius:8px;font-size:0.92rem;}
            .kv-label{color:#d1d5db;}
            .kv-value{font-weight:700;color:#fff;text-align:right;white-space:pre-wrap;}
            .empty{padding:10px;border:1px dashed rgba(255,255,255,0.2);border-radius:8px;color:#e5e7eb;background:rgba(0,0,0,0.14);}
          </style>
          <div style="background: linear-gradient(135deg, var(--tenant-primary-color), #1e59d9); padding: 14px; border-radius: 10px; color: #fff; margin-bottom: 14px;">
            <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
              <div><div style="opacity:0.8; font-size:0.85rem;">Nombre</div><div style="font-weight:700;">${aud.usuarioNombre}</div></div>
              <div><div style="opacity:0.8; font-size:0.85rem;">Alias</div><div style="font-weight:700;">${usuarioMap.get(aud.usuarioId || 0)?.alias || aud.usuarioNombre}</div></div>
              ${usuarioMap.get(aud.usuarioId || 0)?.rol ? `<div><div style="opacity:0.8; font-size:0.85rem;">Rol</div><div style="font-weight:700;">${usuarioMap.get(aud.usuarioId || 0)?.rol}</div></div>` : ""}
              <div><div style="opacity:0.8; font-size:0.85rem;">Email</div><div style="font-weight:700;">${aud.usuarioEmail}</div></div>
              <div><div style="opacity:0.8; font-size:0.85rem;">Tipo</div><span class="badge bg-light text-dark" style="font-size:0.9rem; padding:7px 12px;">${rolDisplay}</span></div>
              ${montoHeader ? `<div><div style="opacity:0.8; font-size:0.85rem;">Monto</div><div style="font-weight:700;">$ ${Number(montoHeader).toLocaleString("es-AR")}</div></div>` : ""}
              ${metodoLabel ? `<div><div style="opacity:0.8; font-size:0.85rem;">Método</div><div style="font-weight:700;">${metodoLabel}</div></div>` : ""}
              <div><div style="opacity:0.8; font-size:0.85rem;">Fecha</div><div style="font-weight:700;">${new Date(aud.timestamp).toLocaleString()}</div></div>
            </div>
            ${aud.comentarios ? `<div style="margin-top:10px; font-size:0.95rem;"><span style="opacity:0.8;">Comentarios: </span><strong>${aud.comentarios}</strong></div>` : ""}
            <div class="data-grid">
              ${datosNuevos ? `
                <div class="data-section">
                  <p class="data-title">Datos Nuevos</p>
                  ${buildList(datosNuevos)}
                </div>` : ""}
              ${datosAntiguos ? `
                <div class="data-section">
                  <p class="data-title">Datos Anteriores</p>
                  ${buildList(datosAntiguos)}
                </div>` : ""}
            </div>
          </div>
        `,
        confirmButtonText: "Cerrar",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cargar detalles de auditoría",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
      });
    }
  };

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener clase para tipo de operación
  const getTipoBadgeClass = (tipo: string) => {
    const tipoUpper = tipo?.toUpperCase() || "";
    switch (tipoUpper) {
      case "ALTA":
      case "CREATE":
        return "bg-success";
      case "MODIFICACION":
      case "UPDATE":
        return "bg-warning";
      case "BAJA":
      case "DELETE":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Obtener clase CSS para fila según tipo de operación
  const getTipoRowClass = (tipo: string): string => {
    const tipoUpper = tipo?.toUpperCase() || "";
    switch (tipoUpper) {
      case "ALTA":
      case "CREATE":
        return "auditoria-row-create";
      case "MODIFICACION":
      case "UPDATE":
        return "auditoria-row-update";
      case "BAJA":
      case "DELETE":
        return "auditoria-row-delete";
      default:
        return "auditoria-row-default";
    }
  };

  const faltanFechas = !fechaInicio || !fechaFin;
  const reporteDiarioDisabled = loadingReporteDiario;

  return (
    <div
      className="container-fluid p-4"
      style={{
        backgroundColor: "#1a1a1a",
        color: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <style>{AUDITORIA_ROW_STYLES}</style>
      {/* Título */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1
          className="fw-bold mb-0"
          style={{
            color: "var(--tenant-primary-color)",
            fontSize: "2.5rem",
            letterSpacing: "2px",
          }}
        >
          <FontAwesomeIcon icon={faShield} className="me-3" />
          AUDITORÍA DE CAJAS
        </h1>
      </div>

      {/* Vista de Reporte Diario */}
      {mostrandoReporteDiario && datosReporteDiario ? (
        <ReporteDiarioView
          datos={calcularDatosReporte(datosReporteDiario)}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onCerrar={cerrarReporteDiario}
          onImprimir={imprimirReporte}
          onGenerarPDF={generarPDF}
          esAdmin={esAdmin}
        />
      ) : (
        <>
      {/* Filtros */}
      <div
        className="card mb-4"
        style={{
          backgroundColor: "#222",
          border: "1px solid #444",
          borderRadius: "12px",
        }}
      >
        <div
          className="card-header"
          style={{
            backgroundColor: "#333",
            borderBottom: "1px solid #444",
            color: "#f5f5f5",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              Filtros de Búsqueda
            </h6>
            <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end">
              {faltanFechas && (
                <span className="text-warning fw-semibold" style={{ fontSize: "0.82rem" }}>
                  Selecciona rango Desde / Hasta
                </span>
              )}
              <button
                className="btn btn-sm"
                onClick={generarReporteDiario}
                disabled={reporteDiarioDisabled}
                style={{ ...dailyReportButtonStyle(reporteDiarioDisabled), ...actionButtonDimensions }}
                title="Generar reporte diario del período seleccionado"
              >
                {loadingReporteDiario ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                      style={{ borderWidth: "0.15rem" }}
                    />
                    Generando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCalendarDay} className="me-1" />
                    Reporte
                  </>
                )}
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={limpiarFiltros}
                style={{ borderRadius: "10px", ...actionButtonDimensions }}
                title="Limpiar todos los filtros"
              >
                <FontAwesomeIcon icon={faEraser} className="me-1" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
              <label className="form-label" style={{ color: "#f5f5f5" }}>
                Fecha Desde (opcional)
              </label>
              <input
                type="date"
                className="form-control text-center"
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #555",
                  color: "#f5f5f5",
                  height: "42px",
                  textAlign: "center",
                }}
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ color: "#f5f5f5" }}>
                Fecha Hasta (opcional)
              </label>
              <input
                type="date"
                className="form-control text-center"
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #555",
                  color: "#f5f5f5",
                  height: "42px",
                  textAlign: "center",
                }}
                value={fechaFin}
                onChange={(e) => {
                  setFechaFin(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ color: "#f5f5f5" }}>
                Filtrar por Personal
              </label>
              <select
                className="form-select text-center"
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #555",
                  color: "#f5f5f5",
                  height: "42px",
                  textAlign: "center",
                }}
                value={filtroUsuario}
                onChange={(e) => {
                  setFiltroUsuario(e.target.value === "" ? "" : parseInt(e.target.value));
                  setPage(1);
                }}
                disabled={loadingUsuarios}
              >
                <option value="">Todos los usuarios</option>
                {usuariosPermitidos.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.alias} ({u.rol || "Sin rol"})
                  </option>
                ))}
              </select>
              {loadingUsuarios && (
                <small style={{ color: "#999" }}>Cargando usuarios...</small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div
        className="card"
        style={{
          backgroundColor: "#222",
          border: "1px solid #444",
          borderRadius: "12px",
        }}
      >
        <div
          className="card-header d-flex justify-content-between align-items-center"
          style={{
            backgroundColor: "#333",
            borderBottom: "1px solid #444",
            color: "#f5f5f5",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faList} className="me-2" />
            Historial de Operaciones ({totalCount} registros)
          </h5>
        </div>
        <div className="card-body">
          {loadingHistorial ? (
            <div className="text-center py-5">
              <div
                className="spinner-border"
                style={{ color: "var(--tenant-primary-color)" }}
                role="status"
              >
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : auditorias.length === 0 ? (
            <div className="text-center py-5" style={{ color: "#999" }}>
              <FontAwesomeIcon icon={faList} className="fs-1 d-block mb-3" />
              <p>
                {(fechaInicio || fechaFin || filtroUsuario)
                  ? "No se encontraron registros de auditoría para los filtros aplicados."
                  : "No hay registros de auditoría disponibles."}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table tabla-gestion table-hover" style={{ color: "#f5f5f5" }}>
                    <thead style={{ backgroundColor: "#333" }}>
                      <tr>
                        <th>Fecha/Hora</th>
                        <th>Tipo</th>
                        <th>Usuario</th>
                        <th style={{ textAlign: "center" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditorias.map((aud) => (
                        <tr key={aud.id} className={getTipoRowClass(aud.tipoOperacion)}>
                          <td>{formatFecha(aud.timestamp)}</td>
                        <td>
                          <span
                            className={`badge ${getTipoBadgeClass(aud.tipoOperacion)}`}
                            style={{ fontSize: "0.85rem" }}
                            >
                              {aud.tipoOperacion}
                            </span>
                          </td>
                          <td>{aud.usuarioNombre}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="btn-accion"
                              style={{ backgroundColor: "#17a2b8", color: "#fff" }}
                              onClick={() => verDetalles(aud.id)}
                              title="Ver detalles"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={page}
                totalPages={Math.ceil(totalCount / pageSize)}
                totalItems={totalCount}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
