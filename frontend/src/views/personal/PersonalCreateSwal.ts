import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-ejercicio.css";

export async function PersonalCreateSwal(onSuccess?: () => void) {
  let roles: { id: number; nombre: string }[] = [];
  try {
    const res = await gymApi.get("/roles");
    roles = res.data.items || res.data;
  } catch {
    // Error silencioso al cargar roles
  }

  const { value: formValues } = await Swal.fire({
    title: '<i class="fas fa-plus"></i> Nuevo Personal',
    html: `
      <form class="swal-form-ejercicio">
        <h6 class="fw-bold" style="color:#000;">Datos personales</h6>

        <div>
          <label class="swal-label">Nombre completo</label>
          <input
            id="nombre"
            type="text"
            placeholder="Nombre completo"
            required
          >
        </div>
        <div>
          <label class="swal-label">Teléfono</label>
          <input
            id="telefono"
            type="text"
            placeholder="Ej: 2664123456"
          >
        </div>
        <div>
          <label class="swal-label">Especialidad</label>
          <input
            id="especialidad"
            type="text"
            placeholder="Ej: Yoga, Spinning..."
          >
        </div>
        <div>
          <label class="swal-label">Fecha de nacimiento</label>
          <input
            id="fechaNacimiento"
            type="date"
            class="swal-input"
          >
        </div>
        <div>
          <label class="swal-label">Dirección</label>
          <input
            id="direccion"
            type="text"
            placeholder="Ej: Av. Mitre 1234"
          >
        </div>

        <div class="checkbox-group">
          <input
            id="activo"
            type="checkbox"
            class="swal-checkbox"
            checked
          >
          <label for="activo" class="swal-label">Activo</label>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-save"></i> Guardar',
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    customClass: {
      popup: "swal2-card-ejercicio",      // 🧡 fondo naranja suave
      confirmButton: "btn btn-orange",    // 🟠 botón principal
      cancelButton: "btn btn-secondary",  // ⚪ botón secundario
    },
    buttonsStyling: false,

    preConfirm: () => {
      const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
      const telefono = (document.getElementById("telefono") as HTMLInputElement).value.trim();
      const especialidad = (document.getElementById("especialidad") as HTMLInputElement).value.trim();
      const direccion = (document.getElementById("direccion") as HTMLInputElement).value.trim();
      const fechaNacimiento = (document.getElementById("fechaNacimiento") as HTMLInputElement).value;
      const activo = (document.getElementById("activo") as HTMLInputElement).checked;

      if (!nombre) {
        Swal.showValidationMessage('<i class="fas fa-exclamation-triangle"></i> El nombre es obligatorio');
        return;
      }

      return { nombre, telefono, especialidad, direccion, fechaNacimiento, activo };
    },
  });

  if (!formValues) return;

  try {
    const { nombre, telefono, especialidad, direccion, fechaNacimiento, activo } = formValues;

    await gymApi.post("/personal", {
      nombre,
      telefono,
      especialidad,
      direccion,
      fechaNacimiento,
      activo,
    });

    await Swal.fire({
      icon: "success",
      title: '<i class="fas fa-check-circle"></i> Registro creado',
      text: "El personal fue registrado correctamente.",
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
      title: "Error",
      text: "No se pudo guardar el registro. Verifique los datos.",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
