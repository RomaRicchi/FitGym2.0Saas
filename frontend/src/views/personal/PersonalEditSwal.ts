import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-socio.css"; 

/**
 * @param id ID del usuario
 * @param context "perfil" → edición desde el perfil personal (sin editar estado)
 *                 "admin"  → edición completa desde administración
 * @param onSuccess callback opcional tras guardar
 */
export async function PersonalEditSwal(id: number| string, context: "perfil" | "admin" = "admin", onSuccess?: () => void) {
  try {
    const { data: personal } = await gymApi.get(`/personal/${id}`);

    const { value: formValues } = await Swal.fire({
      title: '<i class="fas fa-edit"></i> Editar Datos Personales',
      html: `
        <form class="swal-form-socio">
          <div>
            <label class="swal-label">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              placeholder="Nombre completo"
              value="${personal.nombre || ""}"
            >
          </div>
          <div>
            <label class="swal-label">Teléfono</label>
            <input
              id="telefono"
              type="text"
              placeholder="Teléfono de contacto"
              value="${personal.telefono || ""}"
            >
          </div>
          <div>
            <label class="swal-label">Dirección</label>
            <input
              id="direccion"
              type="text"
              placeholder="Dirección completa"
              value="${personal.direccion || ""}"
            >
          </div>
          <div>
            <label class="swal-label">Especialidad</label>
            <input
              id="especialidad"
              type="text"
              placeholder="Área o especialidad"
              value="${personal.especialidad || ""}"
            >
          </div>
          <div>
            <label class="swal-label">Fecha de nacimiento</label>
            <input
              id="fechaNacimiento"
              type="date"
              class="swal-input"
              value="${personal.fechaNacimiento ? personal.fechaNacimiento.split('T')[0] : ''}"
            >
          </div>

          ${
            context === "admin"
              ? `
              <div class="checkbox-group">
                <input
                  type="checkbox"
                  id="estado"
                  class="swal-checkbox"
                  ${personal.activo ? "checked" : ""}
                >
                <label for="estado" class="swal-label">Activo</label>
              </div>
            `
              : `
              <div>
                <label class="swal-label">Estado</label>
                <input
                  type="text"
                  value="${personal.activo ? "Activo" : "Inactivo"}"
                  disabled
                  style="background:#eee;color:#555;"
                >
              </div>
            `
          }
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save"></i> Guardar cambios',
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      customClass: {
        popup: "swal2-card-socio",         // 🧡 fondo naranja suave
        confirmButton: "btn btn-orange",    // 🟠 botón principal
        cancelButton: "btn btn-secondary",  // ⚪ botón secundario
      },
      buttonsStyling: false,

      preConfirm: () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
        const telefono = (document.getElementById("telefono") as HTMLInputElement)?.value.trim();
        const direccion = (document.getElementById("direccion") as HTMLInputElement)?.value.trim();
        const especialidad = (document.getElementById("especialidad") as HTMLInputElement)?.value.trim();
        const fechaNacimiento = (document.getElementById("fechaNacimiento") as HTMLInputElement)?.value;

        const estadoInput = document.getElementById("estado") as HTMLInputElement;
        const activo = context === "admin" ? (estadoInput?.checked ?? false) : (personal.activo ?? false);

        if (!nombre) {
          Swal.showValidationMessage('<i class="fas fa-exclamation-triangle"></i> El nombre es obligatorio');
          return;
        }

        return { nombre, telefono, direccion, especialidad, fechaNacimiento, activo };
      },
    });

    if (!formValues) return;

    await gymApi.put(`/personal/${id}`, formValues);

    await Swal.fire({
      icon: "success",
      title: '<i class="fas fa-check-circle"></i> Datos actualizados',
      html: "Los cambios fueron guardados correctamente.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-card-socio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });

    onSuccess?.();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: '<i class="fas fa-times-circle"></i> Error',
      text: "No se pudo actualizar la información del personal.",
      customClass: {
        popup: "swal2-card-socio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
