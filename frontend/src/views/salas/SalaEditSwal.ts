import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-ejercicio.css"; 

export async function SalaEditSwal(id: string, onSuccess: () => void) {
  try {
    const { data } = await gymApi.get(`/salas/${id}`);

    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-pen-to-square"></i> Editar Sala',
      html: `
        <form class="swal-form-ejercicio">
          <div>
            <label class="swal-label">Nombre de la sala</label>
            <input
              id="nombre"
              type="text"
              placeholder="Nombre de la sala"
              value="${data.nombre || ""}"
            >
          </div>
          <div>
            <label class="swal-label">Cupo máximo</label>
            <input
              id="cupo"
              type="number"
              min="1"
              placeholder="Cupo máximo"
              value="${data.cupo || 0}"
            >
          </div>
          <div class="checkbox-group">
            <input
              type="checkbox"
              id="activa"
              class="swal-checkbox"
              ${data.activa ? "checked" : ""}
            >
            <label for="activa" class="swal-label">Activa</label>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: " Guardar cambios",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      customClass: {
        popup: "swal2-card-ejercicio",      // fondo naranja suave
        confirmButton: "btn btn-orange",    // botón guardar
        cancelButton: "btn btn-secondary",  // botón cancelar
      },
      buttonsStyling: false,

      preConfirm: () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
        const cupoStr = (document.getElementById("cupo") as HTMLInputElement)?.value;
        const activa = (document.getElementById("activa") as HTMLInputElement)?.checked;

        if (!nombre || !cupoStr) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Todos los campos son obligatorios');
          return false;
        }

        const cupo = Number(cupoStr);
        if (!Number.isFinite(cupo) || cupo < 1) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El cupo debe ser un número mayor a 0');
          return false;
        }

        return { nombre, cupo, activa };
      },
    });

    if (!formValues) return; // usuario canceló

    //  Payload para enviar al backend
    const payload = {
      nombre: formValues.nombre,
      cupo: Number(formValues.cupo),
      activa: !!formValues.activa,
    };

    await gymApi.put(`/salas/${id}`, payload);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Sala actualizada',
      text: "Los cambios fueron guardados correctamente.",
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
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo actualizar la sala.",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}




