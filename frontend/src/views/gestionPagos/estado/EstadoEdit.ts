import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/orden.css"; // tu CSS naranja global

export async function editarEstado(id: number): Promise<void> {
  try {
    const { data: estado } = await gymApi.get(`/estadoOrdenPago/${id}`);

    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-pen-to-square me-1"></i> Editar Estado de Pago',
      width: 650,
      customClass: {
        popup: "swal2-card-style",       // fondo naranja redondeado
        confirmButton: "btn btn-orange", // botón naranja
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      html: `
        <form class="swal-form">
          <div class="swal-input-group">
            <label class="swal-label">Nombre</label>
            <input id="nombreInput" type="text" class="swal-field" placeholder="Nombre del estado" value="${estado.nombre || ""}">
          </div>

          <div class="swal-input-group">
            <label class="swal-label">Descripción</label>
            <textarea id="descInput" class="swal-textarea" placeholder="Descripción...">${estado.descripcion || ""}</textarea>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Guardar cambios',
      cancelButtonText: "Cancelar",
      focusConfirm: false,

      preConfirm: () => {
        const nombre = (document.getElementById("nombreInput") as HTMLInputElement)?.value.trim();
        const descripcion = (document.getElementById("descInput") as HTMLTextAreaElement)?.value.trim();

        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation me-2"></i>El nombre es obligatorio');
          const msg = document.querySelector(".swal2-validation-message");
          if (msg) {
            msg.setAttribute(
              "style",
              "background:var(--tenant-primary-color);color:#fff;border-radius:6px;padding:6px 12px;font-weight:600;"
            );
          }
          return false;
        }

        return { nombre, descripcion };
      },
    });

    if (!formValues) return;

    await gymApi.put(`/estadoOrdenPago/${id}`, formValues);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check me-2"></i>Estado actualizado',
      text: "Los cambios fueron guardados correctamente.",
      timer: 2500,
      showConfirmButton: false,
      customClass: { popup: "swal2-card-style swal-alert-simple" },
    });

    window.location.reload();
  } catch (_err: unknown) {
    Swal.fire({
      icon: "error",
      title: '<i class="fa-solid fa-circle-xmark me-2"></i>Error',
      text: "No se pudo actualizar el estado.",
      customClass: { popup: "swal2-card-style swal-alert-simple" },
    });
  }
}
