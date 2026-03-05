import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import Swal from "sweetalert2";
import { ActionButton } from "@/components/ActionButton";
import { mostrarFormNuevoEgreso } from "./EgresoCreateSwal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface DashboardFinancieroData {
  ingresosTotales: number;
  egresosTotales: number;
  balance: number;
  ingresosPorMes: Array<{
    mes: number;
    mesNombre: string;
    anio: number;
    monto: number;
    cantidadSuscripciones: number;
  }>;
  egresosPorMes: Array<{
    mes: number;
    mesNombre: string;
    anio: number;
    monto: number;
    cantidad: number;
  }>;
  ingresosPorPlan: Array<{
    planId: number;
    planNombre: string;
    precio: number;
    cantidadSuscripciones: number;
    total: number;
  }>;
  ingresosPorMedioPago: Array<{
    medio: string;
    monto: number;
    cantidad: number;
    porcentaje: number;
  }>;
}

interface Egreso {
  id: number;
  concepto: string;
  monto: number;
  fecha: string;
  categoria?: string;
  notas?: string;
}

const COLORS = ["var(--tenant-primary-color)", "#00c49f", "#ffc658", "#8884d8", "#82ca9d"];

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

type TipoFiltro = "mes" | "rango" | "anio";

export default function FinanzasMensuales() {
  const [dashboard, setDashboard] = useState<DashboardFinancieroData | null>(null);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Filtros
  const currentDate = new Date();
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("mes");
  const [mesSeleccionado, setMesSeleccionado] = useState(currentDate.getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(currentDate.getFullYear());
  const [mesInicio, setMesInicio] = useState(currentDate.getMonth() + 1);
  const [mesFin, setMesFin] = useState(currentDate.getMonth() + 1);
  const [anioParaFiltro, setAnioParaFiltro] = useState(currentDate.getFullYear());

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobile);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchData();
  }, [tipoFiltro, mesSeleccionado, anioSeleccionado, mesInicio, mesFin, anioParaFiltro]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let fechaInicio: string;
      let fechaFin: string;

      if (tipoFiltro === "mes") {
        // Filtrar por un mes específico
        fechaInicio = new Date(anioSeleccionado, mesSeleccionado - 1, 1)
          .toISOString()
          .split("T")[0];
        const ultimoDiaMes = new Date(anioSeleccionado, mesSeleccionado, 0).getDate();
        fechaFin = new Date(anioSeleccionado, mesSeleccionado - 1, ultimoDiaMes)
          .toISOString()
          .split("T")[0];
      } else if (tipoFiltro === "anio") {
        // Filtrar por todo el año
        fechaInicio = new Date(anioParaFiltro, 0, 1)
          .toISOString()
          .split("T")[0];
        fechaFin = new Date(anioParaFiltro, 11, 31)
          .toISOString()
          .split("T")[0];
      } else {
        // Filtrar por rango de meses
        const mesInicioNum = Math.min(mesInicio, mesFin);
        const mesFinNum = Math.max(mesInicio, mesFin);
        fechaInicio = new Date(anioSeleccionado, mesInicioNum - 1, 1)
          .toISOString()
          .split("T")[0];
        const ultimoDiaMesFin = new Date(anioSeleccionado, mesFinNum, 0).getDate();
        fechaFin = new Date(anioSeleccionado, mesFinNum - 1, ultimoDiaMesFin)
          .toISOString()
          .split("T")[0];
      }

      const [dashboardRes, egresosRes] = await Promise.all([
        gymApi.get(`/finanzas/dashboard?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
        gymApi.get(`/finanzas/egresos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
      ]);

      setDashboard(dashboardRes.data);
      setEgresos(egresosRes.data || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Error al cargar datos financieros";
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("No tienes permiso para ver esta información. Rol requerido: Administrador");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEgreso = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar egreso?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      await gymApi.delete(`/finanzas/egresos/${id}`);
      fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "Error al eliminar egreso",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // Función para exportar a PDF
  const exportarPDF = () => {
    if (!dashboard) return;

    try {
      const doc = new jsPDF();
      const periodo = getPeriodoTexto();

      // Título
      doc.setFontSize(18);
      doc.text(`Reporte de Finanzas`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Periodo: ${periodo}`, 14, 30);

      let yPos = 45;

      // Resumen financiero
      doc.setFontSize(14);
      doc.text("Resumen Financiero", 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.text(`Ingresos Totales: ${formatCurrency(dashboard.ingresosTotales)}`, 20, yPos);
      yPos += 7;
      doc.text(`Egresos Totales: ${formatCurrency(dashboard.egresosTotales)}`, 20, yPos);
      yPos += 7;
      doc.text(`Balance: ${formatCurrency(dashboard.balance)}`, 20, yPos);
      yPos += 15;

      // Tabla de ingresos por plan
      if (dashboard.ingresosPorPlan && dashboard.ingresosPorPlan.length > 0) {
        doc.setFontSize(14);
        doc.text("Ingresos por Plan", 14, yPos);
        yPos += 10;

        const datosPlan = dashboard.ingresosPorPlan.map(p => ({
          plan: p.planNombre,
          cantidad: p.cantidadSuscripciones,
          total: formatCurrency(p.total)
        }));

        autoTable(doc, {
          head: [["Plan", "Cantidad", "Total"]],
          body: datosPlan.map(p => [p.plan, p.cantidad.toString(), p.total]),
          startY: yPos,
          theme: "grid",
          styles: { fontSize: 10 },
          headStyles: { fillColor: varToRGB("var(--tenant-primary-color)") }
        });
      }

      // Calcular posición para la siguiente tabla
      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Tabla de egresos
      if (egresos && egresos.length > 0) {
        doc.setFontSize(14);
        doc.text("Egresos Registrados", 14, yPos);
        yPos += 10;

        const datosEgresos = egresos.map(e => ({
          fecha: new Date(e.fecha).toLocaleDateString("es-AR"),
          concepto: e.concepto,
          categoria: e.categoria || "-",
          monto: formatCurrency(e.monto)
        }));

        autoTable(doc, {
          head: [["Fecha", "Concepto", "Categoría", "Monto"]],
          body: datosEgresos.map(e => [e.fecha, e.concepto, e.categoria, e.monto]),
          startY: yPos,
          theme: "grid",
          styles: { fontSize: 10 },
          headStyles: { fillColor: [220, 53, 69] }
        });
      }

      // Guardar PDF
      doc.save(`Finanzas_${periodo.replace(/\s+/g, "_")}.pdf`);

      Swal.fire({
        icon: "success",
        title: "PDF exportado",
        text: "El reporte se ha descargado correctamente",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el PDF",
      });
    }
  };

  // Función para exportar a Excel
  const exportarExcel = () => {
    if (!dashboard) return;

    try {
      const periodo = getPeriodoTexto();

      // Crear workbook
      const wb = XLSX.utils.book_new();

      // Hoja de Resumen
      const resumenData = [
        ["REPORTE DE FINANZAS"],
        ["Periodo:", periodo],
        [],
        ["RESUMEN FINANCIERO"],
        ["Ingresos Totales", dashboard.ingresosTotales],
        ["Egresos Totales", dashboard.egresosTotales],
        ["Balance", dashboard.balance],
        [],
        ["INGRESOS POR PLAN"]
      ];

      // Agregar datos de planes
      if (dashboard.ingresosPorPlan) {
        dashboard.ingresosPorPlan.forEach(p => {
          resumenData.push([p.planNombre, p.cantidadSuscripciones, p.total]);
        });
      }

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

      // Hoja de Egresos
      if (egresos && egresos.length > 0) {
        const egresosData = [["EGRESOS REGISTRADOS"], ["Fecha", "Concepto", "Categoría", "Monto"]];
        egresos.forEach(e => {
          egresosData.push([
            new Date(e.fecha).toLocaleDateString("es-AR"),
            e.concepto,
            e.categoria || "-",
            e.monto.toString()
          ]);
        });

        const wsEgresos = XLSX.utils.aoa_to_sheet(egresosData);
        XLSX.utils.book_append_sheet(wb, wsEgresos, "Egresos");
      }

      // Generar archivo
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Finanzas_${periodo.replace(/\s+/g, "_")}.xlsx`);

      Swal.fire({
        icon: "success",
        title: "Excel exportado",
        text: "El reporte se ha descargado correctamente",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el archivo Excel",
      });
    }
  };

  // Función auxiliar para convertir color CSS a RGB
  const varToRGB = (cssVar: string): [number, number, number] => {
    // Color primario por defecto (naranja)
    return [255, 102, 0];
  };

  const getPeriodoTexto = () => {
    if (tipoFiltro === "mes") {
      return `${MESES.find((m) => m.value === mesSeleccionado)?.label} ${anioSeleccionado}`;
    } else if (tipoFiltro === "anio") {
      return `Año ${anioParaFiltro}`;
    } else {
      const mesInicioNum = Math.min(mesInicio, mesFin);
      const mesFinNum = Math.max(mesInicio, mesFin);
      if (mesInicioNum === mesFinNum) {
        return `${MESES.find((m) => m.value === mesInicioNum)?.label} ${anioSeleccionado}`;
      }
      return `${MESES.find((m) => m.value === mesInicioNum)?.label} - ${MESES.find((m) => m.value === mesFinNum)?.label} ${anioSeleccionado}`;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando datos financieros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading"><i className="fa-solid fa-triangle-exclamation"></i> Error</h5>
          <p>{error}</p>
          <hr />
          <p className="mb-0 small">Por favor, intenta recargar la página o contacta al administrador.</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  // Combinar datos para gráfico de ingresos vs egresos por mes
  const datosComparativos = dashboard.ingresosPorMes.map((ingreso) => {
    const egresoMes = dashboard.egresosPorMes.find(
      (e) => e.mes === ingreso.mes && e.anio === ingreso.anio
    );
    return {
      mes: ingreso.mesNombre,
      ingresos: ingreso.monto,
      egresos: egresoMes?.monto || 0,
    };
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="titulo-modulo" style={{ textAlign: "left", margin: 0 }}>
          <i className="fa-solid fa-money-bill-wave"></i> Finanzas
        </h1>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-danger"
            onClick={exportarPDF}
          >
            <i className="fa-solid fa-file-pdf"></i> PDF
          </button>
          <button
            className="btn btn-success"
            onClick={exportarExcel}
          >
          <i className="fa-solid fa-file-excel"></i> Excel
          </button>
          <button
            className="btn btn-primary"
            onClick={async () => {
              const creado = await mostrarFormNuevoEgreso();
              if (creado) {
                fetchData();
              }
            }}
            style={{ backgroundColor: "var(--tenant-primary-color)", border: "none" }}
          >
            + Nuevo Egreso
          </button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="card mb-4" style={{ backgroundColor: "rgba(0,0,0,0.3)", border: "none" }}>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-12">
              <label className="form-label text-white fw-bold"><i className="fa-solid fa-magnifying-glass"></i> Tipo de Filtro</label>
              <div className="btn-group w-100" role="group">
                <button
                  className={`btn ${tipoFiltro === "mes" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setTipoFiltro("mes")}
                  style={tipoFiltro === "mes" ? { backgroundColor: "var(--tenant-primary-color)", border: "none" } : {}}
                >
                  Por Mes
                </button>
                <button
                  className={`btn ${tipoFiltro === "rango" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setTipoFiltro("rango")}
                  style={tipoFiltro === "rango" ? { backgroundColor: "var(--tenant-primary-color)", border: "none" } : {}}
                >
                  Por Rango de Meses
                </button>
                <button
                  className={`btn ${tipoFiltro === "anio" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setTipoFiltro("anio")}
                  style={tipoFiltro === "anio" ? { backgroundColor: "var(--tenant-primary-color)", border: "none" } : {}}
                >
                  Por Año Completo
                </button>
              </div>
            </div>
          </div>

          {tipoFiltro === "mes" && (
            <div className="row align-items-end g-2">
              <div className="col-12 col-sm-6 col-md-5">
                <label className="form-label text-white"><i className="fa-solid fa-calendar-days"></i> Mes</label>
                <select
                  className="form-select"
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  {MESES.map((mes) => (
                    <option key={mes.value} value={mes.value} style={{ backgroundColor: "#000", color: "#fff" }}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6 col-md-5">
                <label className="form-label text-white"><i className="fa-solid fa-calendar"></i> Año</label>
                <select
                  className="form-select"
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = currentDate.getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year} style={{ backgroundColor: "#000", color: "#fff" }}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="col-12 col-md-2">
                <div
                  className="card h-100 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  <div className="card-body text-center py-2">
                    <small className="text-light d-block" style={{ fontSize: "0.7rem" }}>Periodo</small>
                    <span className="fw-bold d-block" style={{ color: "var(--tenant-primary-color)", fontSize: "0.85rem" }}>
                      {getPeriodoTexto()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tipoFiltro === "rango" && (
            <div className="row align-items-end g-2">
              <div className="col-6 col-sm-4 col-md-3">
                <label className="form-label text-white text-nowrap"><i className="fa-solid fa-calendar-days"></i> Desde</label>
                <select
                  className="form-select"
                  value={mesInicio}
                  onChange={(e) => setMesInicio(Number(e.target.value))}
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  {MESES.map((mes) => (
                    <option key={mes.value} value={mes.value} style={{ backgroundColor: "#000", color: "#fff" }}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-sm-4 col-md-3">
                <label className="form-label text-white text-nowrap"><i className="fa-solid fa-calendar"></i> Hasta</label>
                <select
                  className="form-select"
                  value={mesFin}
                  onChange={(e) => setMesFin(Number(e.target.value))}
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  {MESES.map((mes) => (
                    <option key={mes.value} value={mes.value} style={{ backgroundColor: "#000", color: "#fff" }}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-4 col-md-4">
                <label className="form-label text-white"><i className="fa-solid fa-calendar-days"></i> Año</label>
                <select
                  className="form-select"
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = currentDate.getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year} style={{ backgroundColor: "#000", color: "#fff" }}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="col-12 col-md-2">
                <div
                  className="card h-100 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  <div className="card-body text-center py-2">
                    <small className="text-light d-block" style={{ fontSize: "0.7rem" }}>Periodo</small>
                    <span className="fw-bold d-block" style={{ color: "var(--tenant-primary-color)", fontSize: "0.8rem" }}>
                      {getPeriodoTexto()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tipoFiltro === "anio" && (
            <div className="row align-items-end g-2">
              <div className="col-12 col-sm-6 col-md-6">
                <label className="form-label text-white"><i className="fa-solid fa-calendar"></i> Año</label>
                <select
                  className="form-select"
                  value={anioParaFiltro}
                  onChange={(e) => setAnioParaFiltro(Number(e.target.value))}
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = currentDate.getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year} style={{ backgroundColor: "#000", color: "#fff" }}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <div
                  className="card h-100 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  <div className="card-body text-center py-2">
                    <small className="text-light d-block" style={{ fontSize: "0.7rem" }}>Periodo</small>
                    <span className="fw-bold" style={{ color: "var(--tenant-primary-color)", fontSize: "1rem" }}>
                      {getPeriodoTexto()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-sm-6 col-md-3">
          <div
            className="card"
            style={{
              backgroundColor: "rgba(0, 255, 0, 0.1)",
              border: "2px solid #00ff00",
              borderRadius: "12px",
            }}
          >
            <div className="card-body text-center">
              <h5 className="card-title text-white mb-2" style={{ fontSize: "1rem" }}><i className="fa-solid fa-money-bill-1"></i> Ingresos</h5>
              <h3 className="text-success fw-bold no-titulo-modulo" style={{ fontSize: "1.5rem" }}>
                {formatCurrency(dashboard.ingresosTotales)}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div
            className="card"
            style={{
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              border: "2px solid #ff0000",
              borderRadius: "12px",
            }}
          >
            <div className="card-body text-center">
              <h5 className="card-title text-white mb-2" style={{ fontSize: "1rem" }}><i className="fa-solid fa-money-bill-transfer"></i> Egresos</h5>
              <h3 className="text-danger fw-bold no-titulo-modulo" style={{ fontSize: "1.5rem" }}>
                {formatCurrency(dashboard.egresosTotales)}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div
            className="card"
            style={{
              backgroundColor: dashboard.balance >= 0 ? "rgba(0, 200, 255, 0.1)" : "rgba(255, 100, 0, 0.1)",
              border: `2px solid ${dashboard.balance >= 0 ? "#00c8ff" : "#ff6400"}`,
              borderRadius: "12px",
            }}
          >
            <div className="card-body text-center">
              <h5 className="card-title text-white mb-2" style={{ fontSize: "1rem" }}><i className="fa-solid fa-scale-balanced"></i> Balance</h5>
              <h3
                className={`${dashboard.balance >= 0 ? "text-info" : "text-warning"} fw-bold no-titulo-modulo`}
                style={{ fontSize: "1.5rem" }}
              >
                {formatCurrency(dashboard.balance)}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div
            className="card"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderRadius: "12px",
              border: "2px solid var(--tenant-primary-color)",
            }}
          >
            <div className="card-body text-center">
              <h5 className="card-title text-white mb-2" style={{ fontSize: "1rem" }}><i className="fa-solid fa-money-bill-wave"></i> Total Periodo</h5>
              <h3
                className="no-titulo-modulo"
                style={{ color: "var(--tenant-secondary-color)", fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {formatCurrency(dashboard.ingresosTotales)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de ingresos por plan y tendencia */}
      {dashboard && (
        <div className="row mb-4 g-3">
          {/* Ingresos por Plan */}
          <div className="col-12 col-lg-6">
            <div className="card h-100" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", borderRadius: "12px", border: "none" }}>
              <div className="card-body">
                <h5 className="card-title text-white mb-4 text-center text-lg-start"><i className="fa-solid fa-chart-pie"></i> Ingresos por Plan</h5>
                {dashboard.ingresosPorPlan && dashboard.ingresosPorPlan.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={dashboard.ingresosPorPlan}
                        dataKey="total"
                        nameKey="planNombre"
                        cx="50%"
                        cy="50%"
                        outerRadius={isMobile ? 60 : 80}
                        label={isMobile ? false : (entry: any) => `${entry.planNombre}: ${formatCurrency(entry.total)}`}
                      >
                        {dashboard.ingresosPorPlan.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white text-center mt-5">No hay datos de ingresos por plan</p>
                )}
              </div>
            </div>
          </div>

          {/* Tendencia de Ingresos */}
          <div className="col-12 col-lg-6">
            <div className="card h-100" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", borderRadius: "12px", border: "none" }}>
              <div className="card-body">
                <h5 className="card-title text-white mb-4 text-center text-lg-start"><i className="fa-solid fa-arrow-trend-down"></i> Tendencia de Ingresos</h5>
                {dashboard.ingresosPorMes && dashboard.ingresosPorMes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dashboard.ingresosPorMes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="mesNombre" stroke="#fff" fontSize={isMobile ? 10 : 12} />
                      <YAxis stroke="#fff" fontSize={isMobile ? 10 : 12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend wrapperStyle={{ color: "#fff", fontSize: isMobile ? 10 : 12 }} />
                      <Line
                        type="monotone"
                        dataKey="monto"
                        stroke="var(--tenant-primary-color)"
                        strokeWidth={3}
                        name="Ingresos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white text-center mt-5">No hay datos de tendencia de ingresos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Ingresos vs Egresos */}
      <div className="card mb-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", borderRadius: "12px", border: "none" }}>
        <div className="card-body">
          <h5 className="card-title text-white mb-4 text-center text-md-start"><i className="fa-solid fa-chart-line"></i> Ingresos vs Egresos</h5>
          {datosComparativos.length === 0 ? (
            <div className="text-center text-white py-5">
              <p className="mb-0">No hay datos para el periodo seleccionado</p>
              <small className="text-muted">Intenta con un rango de fechas diferente</small>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={datosComparativos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="mes" stroke="#fff" fontSize={isMobile ? 10 : 12} />
                <YAxis stroke="#fff" fontSize={isMobile ? 10 : 12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ color: "#fff", fontSize: isMobile ? 10 : 12 }} />
                <Bar dataKey="ingresos" fill="#00c49f" name="Ingresos" />
                <Bar dataKey="egresos" fill="var(--tenant-primary-color)" name="Egresos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gráfico de Medios de Pago */}
      <div className="row mb-4 g-3">
        <div className="col-12">
          <div
            className="card"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderRadius: "12px",
              border: "2px solid var(--tenant-primary-color)",
              boxShadow: "0 0 10px rgba(255, 102, 0, 0.3)",
            }}
          >
            <div className="card-body">
              <h5 className="card-title text-white mb-4 text-center text-md-start"><i className="fa-solid fa-credit-card"></i> Medios de Pago</h5>

              {!dashboard.ingresosPorMedioPago || dashboard.ingresosPorMedioPago.length === 0 ? (
                <div className="text-center text-white py-5">
                  <p className="mb-0">No hay datos de medios de pago para el periodo seleccionado</p>
                  <small className="text-muted">Se requieren órdenes de pago aprobadas para mostrar esta información</small>
                </div>
              ) : (
                <div className="row align-items-center">
                  <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={dashboard.ingresosPorMedioPago}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={isMobile ? ({ porcentaje }) => `${porcentaje}%` : ({ medio, porcentaje }) => `${medio} (${porcentaje}%)`}
                          outerRadius={isMobile ? 70 : 100}
                          fill="#8884d8"
                          dataKey="monto"
                        >
                          {dashboard.ingresosPorMedioPago.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.medio === "Transferencia" ? "#00c49f" : "var(--tenant-primary-color)"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#000",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="table-responsive">
                      <table className="table table-dark table-hover table-sm">
                        <thead>
                          <tr>
                            <th>Medio</th>
                            <th>Monto</th>
                            <th>Cant.</th>
                            <th>%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.ingresosPorMedioPago.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <span
                                  className="badge me-2"
                                  style={{
                                    backgroundColor: item.medio === "Transferencia" ? "#00c49f" : "var(--tenant-primary-color)",
                                  }}
                                ></span>
                                {item.medio}
                              </td>
                              <td className="fw-bold">{formatCurrency(item.monto)}</td>
                              <td>{item.cantidad}</td>
                              <td>{item.porcentaje}%</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="table-light">
                            <th>Total</th>
                            <th>{formatCurrency(dashboard.ingresosTotales)}</th>
                            <th>{dashboard.ingresosPorMedioPago.reduce((acc, item) => acc + item.cantidad, 0)}</th>
                            <th>100%</th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <small className="text-muted d-block text-center text-lg-start">
                      * Basado en órdenes aprobadas
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Egresos */}
      <div className="card mb-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", borderRadius: "12px", border: "none" }}>
        <div className="card-body">
          <h5 className="card-title text-white mb-4 text-center text-md-start"><i className="fa-solid fa-credit-card"></i> Egresos</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover table-sm">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Cat.</th>
                  <th>Monto</th>
                  <th className="d-none d-md-table-cell">Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {egresos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">No hay egresos registrados en este periodo</td>
                  </tr>
                ) : (
                  egresos.map((egreso) => (
                    <tr key={egreso.id}>
                      <td>{new Date(egreso.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })}</td>
                      <td>{egreso.concepto}</td>
                      <td>
                        {egreso.categoria && <span className="badge bg-secondary">{egreso.categoria}</span>}
                      </td>
                      <td className="text-danger fw-bold">{formatCurrency(egreso.monto)}</td>
                      <td className="d-none d-md-table-cell">{egreso.notas || "-"}</td>
                      <td>
                        <ActionButton
                          action="delete"
                          tooltip="Eliminar egreso"
                          variant="danger"
                          onClick={() => handleDeleteEgreso(egreso.id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </ActionButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
