
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/orden.css"; //  Estilo unificado con fondo naranja

export async function crearEstado() {
  try {
    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-plus me-1"></i> Nuevo Estado de Pago',
      width: 650,
      customClass: {
        popup: "swal2-card-style",       // fondo naranja redondeado
        confirmButton: "btn btn-orange", // botón naranja coherente
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      html: `
        <form class="swal-form">
          <div class="swal-input-group">
            <label class="swal-label">Nombre</label>
            <input 
              id="nombreInput"
              type="text"
              class="swal-field"
              placeholder="Ej: Pagado, Pendiente, Rechazado"
            >
          </div>

          <div class="swal-input-group">
            <label class="swal-label">Descripción</label>
            <textarea 
              id="descripcionInput"
              class="swal-textarea"
              placeholder="Descripción opcional..."
            ></textarea>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Guardar',
      cancelButtonText: "Cancelar",
      focusConfirm: false,

      preConfirm: () => {
        const nombre = (document.getElementById("nombreInput") as HTMLInputElement)?.value.trim();
        const descripcion = (document.getElementById("descripcionInput") as HTMLTextAreaElement)?.value.trim();

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

    // Guardar en backend
    await gymApi.post("/estadoOrdenPago", formValues);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check me-2"></i>Guardado',
      text: "Estado creado correctamente.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });

    window.location.reload();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: '<i class="fa-solid fa-circle-xmark me-2"></i>Error',
      text: "No se pudo crear el estado.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
