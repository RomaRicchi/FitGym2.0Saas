import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";  // estilos de formularios (naranja)
import "@/styles/orden.css";   // limpia inputs/selects fantasmas en alertas simples

const ESTADO_APROBADA_ID = 3; // id del estado "Aprobada"

export async function crearOrdenDePago(socio: { id: number; nombre: string }): Promise<boolean> {
  try {
    // 0) Verificar límite de suscripciones ANTES de abrir el modal
    try {
      const { data: limiteCheck } = await gymApi.get(`/suscripciones/verificar-limite-socio/${socio.id}`);
      if (!limiteCheck.puedeSuscribirse) {
        await Swal.fire({
          icon: "warning",
          title: "Límite de suscripciones alcanzado",
          text: limiteCheck.message || "El socio ya tiene 2 suscripciones activas.",
          confirmButtonColor: "var(--tenant-primary-color)",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return false;
      }
    } catch (error: any) {
      // Si falla la verificación, continuar con el flujo normal (el backend validará de nuevo)
      console.warn("No se pudo verificar el límite de suscripciones:", error);
    }

    // 1) Traer planes y estados
    const [{ data: planesResponse }, { data: estados }] = await Promise.all([
      gymApi.get("/planes"),
      gymApi.get("/estadoOrdenPago"),
    ]);

    const planes = planesResponse.items || planesResponse;

    // 2) Opciones para selects
    const opcionesPlanes = planes
      .map(
        (p: any) =>
          `<option value="${p.id}">
            ${p.nombre} (${p.diasPorSemana}x semana) — $${p.precio.toLocaleString()}
          </option>`
      )
      .join("");

    const opcionesEstados = estados
      .map(
        (e: any) =>
          `<option value="${e.id}" ${
            String(e.nombre).toLowerCase() === "aprobada" ? "selected" : ""
          }>${e.nombre}</option>`
      )
      .join("");

    // 3) Formulario (usamos clases propias .swal-field / .swal-select / .swal-textarea)
    const { value: formValues } = await Swal.fire<{
      planId: number;
      inicio: string;
      estadoId: number;
      file?: File;
    }>({
      title:
        '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-file-invoice me-2"></i>Nueva orden de pago</h2>',
      html: `
        <div class="swal-form">
          <p><strong>Socio:</strong> ${socio.nombre}</p>
          <hr style="margin:4px 0 8px 0;">

          <label class="swal-label">Seleccionar plan</label>
          <select id="plan" class="swal-select">${opcionesPlanes}</select>

          <label class="swal-label">Fecha de inicio</label>
          <input id="inicio" type="date" class="swal-field"/>

          <label class="swal-label">Estado</label>
          <select id="estado" class="swal-select">${opcionesEstados}</select>

          <label class="swal-label">Comprobante (PDF o imagen)</label>
          <input id="comprobante" type="file" accept=".pdf,image/*" class="swal-field"/>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Crear orden",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style has-custom-form",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const planId = Number((document.getElementById("plan") as HTMLSelectElement)?.value);
        const inicio = (document.getElementById("inicio") as HTMLInputElement)?.value;
        const estadoId = Number((document.getElementById("estado") as HTMLSelectElement)?.value);
        const file = (document.getElementById("comprobante") as HTMLInputElement)?.files?.[0];

        if (!planId || !inicio || !estadoId) {
          Swal.showValidationMessage(`<i class="fa-solid fa-triangle-exclamation"></i> Debe completar Plan, Fecha de inicio y Estado.`);
          return false;
        }
        return { planId, inicio, estadoId, file };
      },
    });

    if (!formValues) return false;

    const { planId, inicio, estadoId, file } = formValues;

    // 4) FormData (fecha ISO para .NET)
    const formData = new FormData();
    formData.append("SocioId", String(socio.id));
    formData.append("PlanId", String(planId));
    formData.append("EstadoId", String(estadoId));
    formData.append("FechaInicio", new Date(inicio).toISOString());
    if (file) formData.append("file", file);

    // 5) Crear orden
    const { data: orden } = await gymApi.post("/ordenes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((response) => {
      return response?.data;
    }).catch(async (error: any) => {
      // Manejar específicamente el error de caja no abierta
      if (error.response?.data?.error === "CAJA_NO_ABIERTA") {
        await Swal.fire({
          icon: "info",
          title: '<i class="fa-solid fa-cash-register me-2"></i>Caja no abierta',
          html: `
            <div style="text-align:left;">
              <p style="margin-bottom:1rem;">${error.response.data.message}</p>
              <div style="background:#f0f9ff;padding:1rem;border-radius:8px;border-left:4px solid #0ea5e9;">
                <p style="margin:0;font-weight:600;color:#0369a1;">
                  <i class="fa-solid fa-clipboard-list me-1"></i>Pasos a seguir:
                </p>
                <ol style="margin:0.5rem 0 0 0;padding-left:1.5rem;color:#334155;">
                  <li>Ve a la sección <strong>Gestión → Mi Caja</strong></li>
                  <li>Haz clic en <strong>"Abrir Caja"</strong></li>
                  <li>Ingresa la dotación inicial</li>
                  <li>Vuelve a intentar crear la orden</li>
                </ol>
              </div>
            </div>
          `,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#0ea5e9",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false,
        });
        return null;
      }
      // Manejar específicamente el error de límite de suscripciones
      if (error.response?.status === 409) {
        const mensaje = error.response?.data?.message || "El socio ya tiene 2 suscripciones activas.";
        await Swal.fire({
          icon: "warning",
          title: "No se puede crear la orden",
          text: mensaje,
          confirmButtonColor: "var(--tenant-primary-color)",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return null;
      }
      // Para otros errores, lanzar para que los capture el catch general
      throw error;
    });

    // Si la orden es null (por error de caja o límite), retornar false
    if (!orden) {
      return false;
    }

    // 6) Confirmación con preview
    const planSel = planes.find((p: any) => p.id === planId);
    const estadoSel = estados.find((e: any) => e.id === estadoId);
    const comprobanteUrl = orden?.comprobante?.fileUrl || null;
    const baseUrl = (import.meta.env.VITE_API_URL || "").replace("/api", "") || "http://localhost:5144";
    const fullUrl = comprobanteUrl ? `${baseUrl}/${comprobanteUrl}` : null;

    let contenidoHtml = `
      <div class="orden-confirmacion-container">
        <p><strong>Socio:</strong> ${socio.nombre}</p>
        <p><strong>Plan:</strong> ${planSel?.nombre}</p>
        <p><strong>Monto:</strong> <i class="fa-solid fa-money-bill-wave me-1"></i>$${planSel?.precio?.toLocaleString?.() ?? planSel?.precio}</p>
        <p><strong>Estado:</strong> ${estadoSel?.nombre}</p>
    `;

    if (fullUrl) {
      if (fullUrl.toLowerCase().endsWith(".pdf")) {
        contenidoHtml += `
          <hr style="margin: 12px 0;">
          <p><strong>Comprobante (PDF):</strong></p>
          <div class="comprobante-pdf-container">
            <iframe src="${fullUrl}" class="comprobante-iframe"></iframe>
          </div>
        `;
      } else {
        contenidoHtml += `
          <hr style="margin: 12px 0;">
          <p><strong>Comprobante (imagen):</strong></p>
          <div class="comprobante-imagen-container">
            <img src="${fullUrl}" alt="Comprobante" class="comprobante-imagen">
          </div>
        `;
      }
    } else {
      contenidoHtml += `<p><em>Pago sin comprobante (efectivo)</em></p>`;
    }

    contenidoHtml += `</div>`; // Cerrar contenedor

    await Swal.fire({
      icon: "success",
      title: "Orden creada correctamente",
      html: contenidoHtml,
      width: window.innerWidth < 768 ? "95%" : "600px",
      confirmButtonText: "Cerrar",
      customClass: {
        popup: "swal2-card-style swal-alert-simple orden-creada-popup"
      },
    });

    // Nota: La suscripción se crea automáticamente en el backend cuando estadoId === ESTADO_APROBADA_ID (3)
    if (estadoId === ESTADO_APROBADA_ID) {
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Suscripción activa creada",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        background: "#198754",
        color: "#fff",
        customClass: { popup: "swal-alert-simple" },
      });
    }

    return true;
  } catch (err) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo crear la orden de pago.",
      customClass: { popup: "swal2-card-style swal-alert-simple" },
    });
    return false;
  }
}
