import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-ejercicio.css";

/**
 * Editar datos personales del usuario logueado (perfil)
 * Llama a PATCH /api/perfil/{id}/personal
 */
export async function PerfilEditSwal(usuarioId: number, onSuccess?: () => Promise<void>): Promise<void> {
  try {
    const { data: perfil } = await gymApi.get(`/perfil/${usuarioId}`);
    const personal = perfil.personal ?? {};

    const { value: formValues } = await Swal.fire({
      title: '<i class="fas fa-edit"></i> Editar Perfil',
      html: `
        <form class="swal-form-ejercicio">
          <input id="nombre" type="text" placeholder="Nombre completo" value="${personal.nombre || ""}">
          <input id="telefono" type="text" placeholder="Teléfono de contacto" value="${personal.telefono || ""}">
          <input id="direccion" type="text" placeholder="Dirección completa" value="${personal.direccion || ""}">
          <input id="especialidad" type="text" placeholder="Área o especialidad" value="${personal.especialidad || ""}">
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save"></i> Guardar cambios',
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
        const telefono = (document.getElementById("telefono") as HTMLInputElement)?.value.trim();
        const direccion = (document.getElementById("direccion") as HTMLInputElement)?.value.trim();
        const especialidad = (document.getElementById("especialidad") as HTMLInputElement)?.value.trim();

        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El nombre es obligatorio');
          return;
        }

        return { nombre, telefono, direccion, especialidad };
      },
    });

    if (!formValues) return;

    // 🔹 PATCH actualizado con nueva ruta
    await gymApi.patch(`/perfil/${usuarioId}/personal`, formValues);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Perfil actualizado',
      text: "Los cambios fueron guardados correctamente.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });

    await onSuccess?.();
  } catch (_err: unknown) {
    await Swal.fire({
      icon: "error",
      title: '<i class="fa-solid fa-circle-xmark"></i> Error',
      text: "No se pudo actualizar tu perfil.",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
