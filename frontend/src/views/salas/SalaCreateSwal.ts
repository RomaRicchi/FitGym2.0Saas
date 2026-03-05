import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-ejercicio.css"; 

export async function SalaCreateSwal(onSuccess?: () => void) {
  const { value: formValues } = await Swal.fire({
    title: '<i class="fa-solid fa-plus"></i> Nueva Sala',
    html: `
      <form class="swal-form-ejercicio">
        <div>
          <label class="swal-label">Nombre de la sala</label>
          <input
            id="nombre"
            type="text"
            placeholder="Ej: Sala de pesas"
          >
        </div>
        <div>
          <label class="swal-label">Cupo máximo</label>
          <input
            id="cupo"
            type="number"
            min="1"
            placeholder="Ej: 10"
          >
        </div>
        <div class="checkbox-group">
          <input
            type="checkbox"
            id="activa"
            class="swal-checkbox"
            checked
          >
          <label for="activa" class="swal-label">Activa</label>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-floppy-disk"></i> Guardar',
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    customClass: {
      popup: "swal2-card-ejercicio",      //fondo naranja suave
      confirmButton: "btn btn-orange",    // botón principal
      cancelButton: "btn btn-secondary",  // botón secundario
    },
    buttonsStyling: false,

    preConfirm: () => {
      const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
      const cupoStr = (document.getElementById("cupo") as HTMLInputElement)?.value;
      const activa = (document.getElementById("activa") as HTMLInputElement)?.checked;

      if (!nombre) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El nombre es obligatorio');
        return null;
      }

      const cupo = Number(cupoStr);
      if (!Number.isFinite(cupo) || cupo < 1) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El cupo debe ser un número mayor a 0');
        return null;
      }

      return { nombre, cupo, activa };
    },
  });

  if (!formValues) return;

  try {
    await gymApi.post("/salas", formValues);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Sala creada',
      text: "La sala fue registrada correctamente.",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    onSuccess?.();
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "No se pudo crear la sala";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}



