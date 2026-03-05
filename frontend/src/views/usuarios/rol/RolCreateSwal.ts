import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-ejercicio.css"; 

export async function RolCreateSwal(onSuccess?: () => void) {
  const { value: formValues } = await Swal.fire({
    title: '<i class="fas fa-plus"></i> Nuevo Rol',
    width: 500,
    customClass: {
      popup: "swal2-card-ejercicio",       // fondo naranja
      confirmButton: "btn btn-orange",   // botón naranja
      cancelButton: "btn btn-secondary", // botón blanco
    },
    buttonsStyling: false,
    html: `
      <form class="swal-form-ejercicio">
        <div>
          <label class="swal-label">Nombre del rol</label>
          <input id="nombre" type="text" placeholder="Ej: Administrador, Profesor..." />
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
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

  try {
    await gymApi.post("/roles", { nombre: formValues.nombre });

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Guardado',
      text: "Rol creado correctamente",
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
      text: "No se pudo crear el rol",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
