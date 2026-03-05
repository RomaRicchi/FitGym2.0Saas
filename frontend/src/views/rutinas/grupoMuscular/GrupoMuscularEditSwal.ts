import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

export async function GrupoMuscularEditSwal(id: string, onSuccess?: () => void) {
  try {
    const { data: grupo } = await gymApi.get(`/gruposmusculares/${id}`);

    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-pen-to-square"></i> Editar Categoría',
      html: `
        <div class="mb-2 text-start">
          <label class="form-label fw-semibold">Nombre</label>
          <input id="nombre" class="form-control" value="${grupo.nombre || ""}" />
        </div>
       
        
      `,
      confirmButtonText: "Guardar cambios",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--tenant-primary-color)",
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
    
        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El nombre de la categoría es obligatorio.');
          return false;
        }

        return { id: grupo.id, nombre };
      },
    });

    if (formValues) {
      await gymApi.put(`/gruposmusculares/${id}`, formValues);
      Swal.fire('<i class="fa-solid fa-circle-check"></i> Actualizado', "Categoría editada correctamente.", "success");
      onSuccess?.();
    }
  } catch (err) {
    Swal.fire("Error", "No se pudo editar la categoría.", "error");
  }
}




