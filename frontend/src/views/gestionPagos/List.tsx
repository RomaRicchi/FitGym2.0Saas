import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import { editarOrden } from "@/views/gestionPagos/OrdenPagoEdit";
import { resetPagosPendientesCounter } from "@/hooks/useSignalR";
import $ from "jquery";
import DataTable from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "@/styles/orden.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

export default function OrdenesList() {
  const [allOrdenes, setAllOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroSocio, setFiltroSocio] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tableRef = useRef<HTMLTableElement | null>(null);
  const dtInstance = useRef<any>(null);
  const fechaInicioRef = useRef("");
  const fechaFinRef = useRef("");

  // Obtener rol del usuario para determinar si puede eliminar
  const usuario = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("usuario");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);
  const rol = usuario?.rol || usuario?.Rol;
  const esAdmin = rol === "Administrador";

  const ordenes = useMemo(() => {
    let filtradas = allOrdenes;

    // Filtro por socio
    if (filtroSocio) {
      const filtroLower = filtroSocio.toLowerCase();
      filtradas = filtradas.filter(o =>
        (o.socio?.nombre || "").toLowerCase().includes(filtroLower)
      );
    }

    return filtradas;
  }, [allOrdenes, filtroSocio]);

  useEffect(() => {
    fechaInicioRef.current = fechaInicio;
    fechaFinRef.current = fechaFin;
    if (dtInstance.current) dtInstance.current.draw();
  }, [fechaInicio, fechaFin]);

  // Cargar datos
  const fetchOrdenes = async () => {
    try {
      const res = await gymApi.get("/ordenes");
      const data = res.data || [];

      // Validar que los datos tengan el formato correcto
      const ordenesValidas = Array.isArray(data)
        ? data.filter(o => o && typeof o === 'object')
        : [];

      setAllOrdenes(ordenesValidas);

      // Mostrar mensaje si no hay órdenes (solo una vez)
      if (ordenesValidas.length === 0 && !sessionStorage.getItem('ordenesVaciasMostrado')) {
        sessionStorage.setItem('ordenesVaciasMostrado', 'true');
        // No mostrar error, es normal que no hayan órdenes después de borrar datos de prueba
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las órdenes de pago",
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
  useEffect(() => { fetchOrdenes(); }, []);

  // Reiniciar contador de pagos pendientes al entrar a la página
  useEffect(() => {
    resetPagosPendientesCounter();
  }, []);

  // Generar PDF con las órdenes filtradas
  const generarPDF = () => {
    try {
      const doc = new jsPDF();

      // Colores del tenant
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--tenant-primary-color').trim() || '#ff8800';

      // Título
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("Reporte de Órdenes de Pago", 14, 20);

      // Información de filtros
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      let filtrosTexto = [];
      if (fechaInicio) filtrosTexto.push(`Desde: ${fechaInicio}`);
      if (fechaFin) filtrosTexto.push(`Hasta: ${fechaFin}`);
      if (filtroSocio) filtrosTexto.push(`Socio: ${filtroSocio}`);

      if (filtrosTexto.length > 0) {
        doc.text("Filtros aplicados:", 14, 28);
        filtrosTexto.forEach((filtro, idx) => {
          doc.text(`  • ${filtro}`, 14, 34 + (idx * 5));
        });
      }

      // Fecha de generación
      doc.text(
        `Generado: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`,
        14,
        filtrosTexto.length > 0 ? 50 : 30
      );

      // Obtener datos actuales de la tabla (ya filtrados)
      const filteredData: any[] = [];
      if (dtInstance.current) {
        dtInstance.current.rows({ search: 'applied' }).every(function () {
          const data = (this as any).data();
          filteredData.push(data);
        });
      }

      if (filteredData.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No hay órdenes para mostrar con los filtros actuales',
          customClass: {
            popup: 'swal2-card-style',
            confirmButton: 'btn btn-orange',
          },
          buttonsStyling: false,
        });
        return;
      }

      // Preparar datos para la tabla
      const tableData = filteredData.map(orden => {
        // Limpiar medio de pago: eliminar HTML y emojis
        let medioPagoLimpio = '—';
        if (orden.medioPago) {
          medioPagoLimpio = orden.medioPago
            .replace(/<[^>]*>/g, '') // Eliminar tags HTML
            .replace(/\s+/g, ' ') // Eliminar espacios extra
            .trim();
          // Si quedó vacío después de limpiar, usar valor por defecto
          if (!medioPagoLimpio) {
            medioPagoLimpio = '—';
          }
        }

        return [
          orden.socio || '—',
          orden.plan || 'Sin plan',
          orden.monto || '$0.00',
          medioPagoLimpio,
          orden.fechaPago || '—',
          orden.vence || '—',
          orden.estado?.replace(/<[^>]*>/g, '').trim() || 'Sin estado'
        ];
      });

      // Generar tabla
      autoTable(doc, {
        startY: filtrosTexto.length > 0 ? 58 : 38,
        head: [['Socio', 'Plan', 'Monto', 'Medio Pago', 'Fecha Pago', 'Vence', 'Estado']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [primaryColor === '#ff8800' ? 255 : 0, primaryColor === '#ff8800' ? 136 : 0, primaryColor === '#ff8800' ? 0 : 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Total de montos (solo estados verificados/aprobados)
      const totalMonto = filteredData.reduce((sum, orden) => {
        // Solo sumar si el estado es "verificado" o "aprobada"
        const estadoLimpio = (orden.estado || '')
          .replace(/<[^>]*>/g, '')
          .toLowerCase()
          .trim();

        if (estadoLimpio !== 'verificado' && estadoLimpio !== 'aprobada') {
          return sum; // No sumar este monto
        }

        const monto = parseFloat(orden.monto?.replace(/[$,]/g, '') || '0');
        return sum + monto;
      }, 0);

      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Total: $${totalMonto.toFixed(2)}`, 14, finalY + 10);
      doc.setFont(undefined, 'normal');

      // Guardar PDF
      const fileName = `ordenes_pago_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      Swal.fire({
        icon: 'success',
        title: 'PDF Generado',
        text: `Se generó el reporte con ${filteredData.length} órdenes`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-card-style',
        },
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el PDF',
        customClass: {
          popup: 'swal2-card-style',
          confirmButton: 'btn btn-orange',
        },
        buttonsStyling: false,
      });
    }
  };

  //  Inicializar DataTable (una sola vez)
  useEffect(() => {
    if (!loading && tableRef.current && !dtInstance.current) {
      // Configurar DataTables para silenciar warnings
      $.fn.dataTable.ext.errMode = 'none';

      dtInstance.current = new DataTable(tableRef.current, {
        // Desactivar responsive para que todas las columnas estén visibles
        // responsive: true,
        scrollX: true,
        deferRender: true,
        autoWidth: false,
        pageLength: 10, // cantidad inicial
        lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"] ],
        destroy: true,
      // Mostrar primero las más recientes usando la columna ISO oculta de fecha de pago (columna 9)
      order: [[9, "desc"]],
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
          emptyTable: "No hay órdenes de pago registradas",
          zeroRecords: "No se encontraron órdenes de pago",
        },
        columns: [
          { data: "socio", defaultContent: "—" },
          { data: "plan", defaultContent: "Sin plan" },
          { data: "monto", defaultContent: "$0.00" },
          { data: "medioPago", defaultContent: '<span class="badge bg-secondary">—</span>' },
          { data: "fechaPago", defaultContent: "—" },
          { data: "vence", defaultContent: "—" },
          { data: "estado", defaultContent: '<span class="badge bg-secondary">Sin estado</span>' },
          { data: "acciones", defaultContent: "" },
          { data: "venceISO", defaultContent: "" },
          { data: "pagoISO", defaultContent: "" }
        ],
        columnDefs: [
          { visible: false, targets: [8, 9] }, // Ocultar columnas ISO auxiliares
          { orderable: false, targets: [7] }, // No ordenar por Acciones (7)
          { searchable: false, targets: [7] } // No buscar en Acciones
        ],
      });

      // Filtro personalizado (se registra una sola vez)
      const searchFilter = (_settings: any, data: string[], dataIndex: number) => {
        const desde = fechaInicioRef.current || "0000-01-01";
        const hasta = fechaFinRef.current || "9999-12-31";

        // Validar que data tenga suficientes elementos antes de acceder
        if (!data || data.length < 9) return true;

        // Acceder a los datos internos de la fila usando dataIndex
        const rowData = dtInstance.current.row(dataIndex).data();
        const pagoISO = rowData?.pagoISO || "";

        if (!pagoISO) return true;
        return pagoISO >= desde && pagoISO <= hasta;
      };
      $.fn.dataTable.ext.search.push(searchFilter);

      // Guardar referencia para limpieza
      return () => {
        const idx = $.fn.dataTable.ext.search.indexOf(searchFilter);
        if (idx > -1) {
          $.fn.dataTable.ext.search.splice(idx, 1);
        }
        if (dtInstance.current) {
          dtInstance.current.destroy(true);
          dtInstance.current = null;
        }
      };
    }
  }, [loading]);

  // Formateo seguro
  const parseFecha = (fecha: any) => {
    try {
      const d = new Date(fecha);
      if (isNaN(d.getTime())) return { iso: "", local: "" };
      const iso = d.toISOString().split("T")[0];
      const local = d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return { iso, local };
    } catch {
      return { iso: "", local: "" };
    }
  };

  //  Cargar / refrescar filas
  useEffect(() => {
    if (dtInstance.current) {
      const rows = ordenes.map((o) => {
        // Validar que el objeto exista y tenga la estructura mínima
        if (!o || typeof o !== 'object') {
          return {
            socio: "—",
            plan: "Sin plan",
            monto: "$0.00",
            medioPago: `<span class="badge bg-secondary"><i class="fa-solid fa-money-bill-wave me-1"></i>Efectivo</span>`,
            fechaPago: "—",
            pagoISO: "",
            vence: "—",
            venceISO: "",
            estado: `<span class="badge bg-secondary">Sin estado</span>`,
            acciones: ``
          };
        }

        // Asegurar que todas las propiedades necesarias existan
        const socio = o.socio && typeof o.socio === 'object' ? o.socio : null;
        const plan = o.plan && typeof o.plan === 'object' ? o.plan : null;
        const estado = o.estado && typeof o.estado === 'object' ? o.estado : null;

        const { iso: venceIso, local: venceLocal } = parseFecha(o.venceEn || o.venceISO || null);
        const { iso: pagoIso, local: pagoLocal } = parseFecha(o.createdAt || null);

        // Determinar medio de pago según si tiene comprobante
        const medioPago = o.comprobante?.id || o.comprobante?.fileUrl
          ? `<span class="badge bg-info"><i class="fa-solid fa-money-check-dollar me-1"></i>Transferencia</span>`
          : `<span class="badge bg-success"><i class="fa-solid fa-money-bill-wave me-1"></i>Efectivo</span>`;

        return {
          socio: socio?.nombre || "—",
          plan: plan?.nombre || "Sin plan",
          monto: o.monto != null ? `$${o.monto.toFixed(2)}` : "$0.00",
          medioPago: medioPago,
          fechaPago: pagoLocal || "—",
          vence: venceLocal || "—",
          estado: `
            <span class="badge ${
              estado?.nombre?.toLowerCase() === "verificado" || estado?.nombre?.toLowerCase() === "aprobada"
                ? "bg-success"
                : estado?.nombre?.toLowerCase() === "pendiente"
                ? "bg-warning text-dark"
                : estado?.nombre?.toLowerCase() === "rechazado" || estado?.nombre?.toLowerCase() === "rechazada"
                ? "bg-danger"
                : estado?.nombre?.toLowerCase() === "con error" || estado?.nombre?.toLowerCase().includes("error")
                ? ""
                : "bg-secondary"
            }" ${
              estado?.nombre?.toLowerCase() === "con error" || estado?.nombre?.toLowerCase().includes("error")
                ? 'style="background-color: var(--tenant-primary-color) !important; color: white !important;"'
                : ""
            }">${estado?.nombre || "Sin estado"}</span>
          `,
          acciones: !o.id ? "" : `
             <div class="d-flex justify-content-center gap-2 acciones-cell">
                ${
                  o.comprobante && (o.comprobante.id || o.comprobante.fileUrl)
                    ? `
                    <button class="btn btn-primary btn-accion ver"
                            data-id="${o.id}" title="Comprobantes"><i class="fa-solid fa-paperclip"></i></button>
                    `
                    : `
                    <button class="btn btn-accion btn-accion--disabled"
                            data-id="${o.id}" title="Sin comprobante" disabled><i class="fa-solid fa-paperclip"></i></button>
                    `
                }
              <button class="btn btn-warning btn-accion editar" data-id="${o.id}" title="Cambiar estado">
                <i class="fas fa-edit"></i>
              </button>
              ${esAdmin ? `
              <button class="btn btn-danger btn-accion eliminar" data-id="${o.id}" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
              ` : ''}
            </div>
          `,
          venceISO: venceIso ?? "",
          pagoISO: pagoIso ?? ""
        };
      });

      dtInstance.current.clear();
      dtInstance.current.rows.add(rows).draw();
      dtInstance.current.page(0).draw();

      $(tableRef.current!).off("click");

      $(tableRef.current!).on("click", ".editar", async function () {
        const id = $(this).data("id");
        const ok = await editarOrden(id);
        if (ok) fetchOrdenes();
      });

      $(tableRef.current!).on("click", ".eliminar", function () {
        const id = $(this).data("id");
        eliminarOrden(id);
      });

      $(tableRef.current!).on("click", ".ver", async function () {
        const id = $(this).data("id");

        try {
          const { data } = await gymApi.get(`/ordenes/${id}`);
          const fileUrl = data?.comprobante?.fileUrl;

          if (!fileUrl) {
            Swal.fire({
              icon: "info",
              title: "Sin comprobante",
              text: "Esta orden no tiene archivo cargado.",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
              },
              buttonsStyling: false,
            });
            return;
          }

          //  Construi la URL completa con el backend
          const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5144";
          const fullUrl = `${baseUrl}/${fileUrl}`;
          if (fileUrl.toLowerCase().endsWith(".pdf")) {
            Swal.fire({
              title: "Comprobante PDF",
              html: `<iframe src="${fullUrl}" width="100%" height="500px"></iframe>`,
              width: "80%",
              confirmButtonText: "Cerrar",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
              },
              buttonsStyling: false,
            });
          } else {
            Swal.fire({
              title: "Comprobante",
              imageUrl: fullUrl,
              imageAlt: "Comprobante de pago",
              width: "60%",
              confirmButtonText: "Cerrar",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
              },
              buttonsStyling: false,
            });
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar el comprobante.",
            customClass: {
              popup: "swal2-card-style",
              confirmButton: "btn btn-orange",
            },
            buttonsStyling: false,
          });
        }
      });


    }
  }, [ordenes]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Cargando órdenes...</p>
      </div>
    );

  return (
    <div className="container mt-3">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        ORDENES DE PAGO
      </h1>

      {/* <i className="fa-solid fa-diamond"></i> Filtro */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-12 col-md-4">
          <input
            ref={searchInputRef}
            type="text"
            className="form-control"
            placeholder="Buscar por nombre de socio..."
            value={filtroSocio}
            onChange={(e) => setFiltroSocio(e.target.value)}
            style={{
              borderColor: "var(--tenant-primary-color)",
              borderWidth: "2px",
              outline: "2px solid var(--tenant-primary-color)",
              outlineColor: "var(--tenant-primary-color)",
              boxShadow: "0 0 0 2px var(--tenant-primary-color)",
              height: "38px",
            }}
          />
        </div>
        <div className="col-6 col-md-2">
          <label className="fw-bold small">Desde (fecha pago)</label>
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={{ height: "38px" }}
          />
        </div>
        <div className="col-6 col-md-2">
          <label className="fw-bold small">Hasta (fecha pago)</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={{ height: "38px" }}
          />
        </div>
        <div className="col-6 col-md-2">
          <label className="fw-bold small">&nbsp;</label>
          <Button
            className="btn btn-warning fw-semibold w-100"
            style={{
              backgroundColor: "var(--tenant-primary-color)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              transition: "filter 0.2s ease",
              height: "38px",
            }}
            onClick={() => {
              setFiltroSocio("");
              setFechaInicio("");
              setFechaFin("");
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
        {esAdmin && (
          <div className="col-6 col-md-2">
            <label className="fw-bold small">&nbsp;</label>
            <Button
              className="btn btn-danger fw-semibold w-100"
              style={{
                backgroundColor: "#dc3545",
                border: "none",
                borderRadius: "8px",
                color: "white",
                transition: "filter 0.2s ease",
                height: "38px",
              }}
              onClick={generarPDF}
            >
              <i class="fa-solid fa-file-pdf me-1"></i>PDF
            </Button>
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table
          ref={tableRef}
          className="display table table-striped table-bordered align-middle text-center nowrap"
          style={{ width: "100%" }}
        >
          <thead className="table-dark">
            <tr>
              <th>Socio</th>
              <th>Plan</th>
              <th>Monto</th>
              <th>Medio de Pago</th>
              <th>Fecha de Pago</th>
              <th>Vence</th>
              <th>Estado</th>
              <th data-priority="1">Acciones</th>
              <th style={{display: 'none'}}>VenceISO</th>
              <th style={{display: 'none'}}>PagoISO</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  );

  async function eliminarOrden(id: number) {
    const result = await Swal.fire({
      title: "¿Eliminar orden?",
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
      await gymApi.delete(`/ordenes/${id}`);
      await Swal.fire({
        icon: "success",
        title: "Eliminada",
        text: "La orden fue eliminada correctamente.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      await fetchOrdenes();
      await resetPagosPendientesCounter();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la orden.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  }
}



