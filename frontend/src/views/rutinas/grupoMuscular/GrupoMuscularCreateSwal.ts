import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

export async function GrupoMuscularCreateSwal(onSuccess?: () => void) {
  try {
    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-plus"></i> Nueva Categoría',
      html: `
        <div class="mb-2 text-start">
          <label class="form-label fw-semibold">Nombre</label>
          <input id="nombre" class="form-control" placeholder="Ej: Cardio, Fuerza, Flexibilidad" />
        </div>
       
      `,
      confirmButtonText: "Guardar",
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

        return { nombre };
      },
    });

    if (formValues) {
      await gymApi.post("/gruposmusculares", formValues);
      Swal.fire('<i class="fa-solid fa-circle-check"></i> Guardado', "Categoría creada correctamente.", "success");
      onSuccess?.();
    }
  } catch (err) {
    Swal.fire("Error", "No se pudo crear la categoría.", "error");
  }
}




