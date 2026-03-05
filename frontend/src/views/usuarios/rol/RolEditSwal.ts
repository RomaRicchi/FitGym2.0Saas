import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-ejercicio.css"; 

export async function RolEditSwal(id: string, onSuccess?: () => void) {
  try {
    const { data } = await gymApi.get(`/roles/${id}`);

    const { value: formValues } = await Swal.fire({
      title: '<i class="fas fa-edit"></i> Editar Rol',
      width: 500,
      customClass: {
        popup: "swal2-card-ejercicio",       // fondo naranja
        confirmButton: "btn btn-orange",   // botón guardar
        cancelButton: "btn btn-secondary", // botón cancelar
      },
      buttonsStyling: false,
      html: `
        <form class="swal-form-ejercicio">
          <div>
            <label class="swal-label">Nombre del rol</label>
            <input id="nombre" type="text" value="${data.nombre || ""}" placeholder="Ej: Profesor, Socio..." />
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar cambios",
      cancelButtonText: "Cancelar",
      focusConfirm: false,

      preConfirm: () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debe ingresar un nombre para el rol');
          return;
        }
        return { nombre };
      },
    });

    if (!formValues) return;

    await gymApi.put(`/roles/${id}`, { nombre: formValues.nombre });

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Actualizado',
      text: "Rol modificado correctamente",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });

    onSuccess?.();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: '<i class="fa-solid fa-circle-xmark"></i> Error',
      text: "No se pudo cargar o actualizar el rol",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
