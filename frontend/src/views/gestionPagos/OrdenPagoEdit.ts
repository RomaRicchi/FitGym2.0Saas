import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/orden.css";

export async function editarOrden(id: number) {
  try {
    // 1. Obtener datos de la orden
    const { data: orden } = await gymApi.get(`/ordenes/${id}`);

    if (!orden) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la orden de pago.",
        customClass: { popup: "swal2-card-style" },
      });
      return false;
    }

    // 2. Obtener los estados disponibles
    const { data: estados } = await gymApi.get("/estadoOrdenPago");

    if (!Array.isArray(estados) || estados.length === 0) {
      await Swal.fire({
        icon: "info",
        title: "Sin estados disponibles",
        text: "No se encontraron estados de orden de pago.",
        customClass: { popup: "swal2-card-style" },
      });
      return false;
    }

    // Formatear fechas
    const formatFecha = (fecha: string) => {
      if (!fecha) return "—";
      const d = new Date(fecha);
      return d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const estadoActual = estados.find((e: any) => e.id === orden.estado?.Id);

    // 3. Armar opciones del select
    const opciones: Record<string, string> = {};
    estados.forEach((e: any) => {
      opciones[String(e.id)] = e.nombre;
    });

    // 4. Mostrar formulario con información de la orden
    const { value: nuevoEstadoId } = await Swal.fire({
      title:
        '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-pen me-2"></i>Cambiar estado</h2>',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid var(--tenant-primary-color);">
            <h6 style="margin: 0 0 10px 0; color: #333; font-weight: 600;">
              <i class="fa-solid fa-clipboard-list me-1"></i> Detalles de la orden
            </h6>
            <p style="margin: 5px 0;"><strong>Socio:</strong> ${orden.socio?.nombre || "—"}</p>
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${orden.plan?.nombre || "Sin plan"}</p>
            <p style="margin: 5px 0;"><strong>Monto:</strong> $${orden.monto?.toFixed(2) || "0.00"}</p>
            <p style="margin: 5px 0;"><strong>Fecha de pago:</strong> ${formatFecha(orden.createdAt)}</p>
            <p style="margin: 5px 0;"><strong>Vence:</strong> ${formatFecha(orden.venceEn)}</p>
            <p style="margin: 5px 0;">
              <strong>Estado actual:</strong>
              <span class="badge ${
                orden.estado?.nombre?.toLowerCase() === "aprobada"
                  ? "bg-success"
                  : orden.estado?.nombre?.toLowerCase() === "pendiente"
                  ? "bg-warning text-dark"
                  : orden.estado?.nombre?.toLowerCase() === "rechazada"
                  ? "bg-danger"
                  : "bg-secondary"
              }">${orden.estado?.nombre || "Sin estado"}</span>
            </p>
          </div>

          <div style="margin-top: 15px;">
            <label style="display:block; font-weight: 600; margin-bottom: 8px;">Nuevo estado:</label>
            <select id="nuevo-estado" class="swal2-input" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ccc;">
              <option value="">Seleccione un estado...</option>
              ${estados.map((e: any) =>
                `<option value="${e.id}" ${e.id === orden.estado?.Id ? 'selected' : ''}>${e.nombre}</option>`
              ).join("")}
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText:
        '<i class="fa-solid fa-floppy-disk me-1"></i> Guardar cambios',
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      didOpen: () => {
        const select = document.getElementById("nuevo-estado") as HTMLSelectElement;
        if (select) {
          select.value = String(orden.estado?.Id || "");
        }
      },
      preConfirm: () => {
        const select = document.getElementById("nuevo-estado") as HTMLSelectElement;
        const nuevoEstado = select?.value;
        if (!nuevoEstado) {
          Swal.showValidationMessage("Debe seleccionar un estado");
          return false;
        }
        return Number(nuevoEstado);
      }
    });

    if (!nuevoEstadoId) return false;

    // 5. Actualizar estado de la orden
    await gymApi.put(`/ordenes/${id}/estado/simple`, {
      estadoId: Number(nuevoEstadoId),
    });

    // 6. Mostrar confirmación
    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check me-2"></i>Estado actualizado',
      text: "El estado de la orden fue actualizado correctamente.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: { popup: "swal2-card-style swal-alert-simple" },
    });

    // 7. Verificar si el nuevo estado es "Aprobada" (ID = 3)
    // Nota: La suscripción se crea automáticamente en el backend cuando estadoId === 3
    if (nuevoEstadoId === 3) {
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title:
          '<i class="fa-solid fa-circle-check me-2"></i>Suscripción creada automáticamente',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#198754",
        color: "#fff",
        customClass: { popup: "swal-alert-simple" },
        didOpen: (toast) => {
          toast.style.opacity = "0";
          setTimeout(() => (toast.style.opacity = "1"), 100);
          setTimeout(() => (toast.style.opacity = "0"), 2800);
        },
      });
    }

    return true;
  } catch (err: any) {
    // Manejar específicamente el error de caja no abierta
    if (err?.response?.data?.error === "CAJA_NO_ABIERTA") {
      await Swal.fire({
        icon: "info",
        title: '<i class="fa-solid fa-cash-register me-2"></i>Caja no abierta',
        html: `
          <div style="text-align:left;">
            <p style="margin-bottom:1rem;">${err.response.data.message}</p>
            <div style="background:#f0f9ff;padding:1rem;border-radius:8px;border-left:4px solid #0ea5e9;">
              <p style="margin:0;font-weight:600;color:#0369a1;">
                <i class="fa-solid fa-clipboard-list me-1"></i>Pasos a seguir:
              </p>
              <ol style="margin:0.5rem 0 0 0;padding-left:1.5rem;color:#334155;">
                <li>Ve a la sección <strong>Gestión → Mi Caja</strong></li>
                <li>Haz clic en <strong>"Abrir Caja"</strong></li>
                <li>Ingresa la dotación inicial</li>
                <li>Vuelve a intentar aprobar la orden</li>
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
      return false;
    }

    // Extraer mensaje de error del backend
    const errorMessage = err?.response?.data?.message || err?.message || "No se pudo actualizar el estado de la orden.";

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
      customClass: {
        popup: "swal2-card-style swal-alert-simple",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
    return false;
  }
}
