import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-rutina.css"; // estilo naranja global (ajustá la ruta si no existe)

export async function RutinaPlantillaEjercicioEditSwal(id: number, onSuccess?: () => Promise<void>): Promise<void> {
  try {
    // 🔹 Obtener datos del registro y catálogos
    const [
      itemRes,
      rutinasRes,
      ejerciciosRes,
    ] = await Promise.all([
      gymApi.get(`/rutinasplantillaejercicios/${id}`),
      gymApi.get("/rutinasplantilla?page=1&pageSize=100"),
      gymApi.get("/ejercicios?page=1&pageSize=100"),
    ]);

    // Extraer datos correctamente
    const item = itemRes.data;
    const rutinas = Array.isArray(rutinasRes.data) ? rutinasRes.data : (rutinasRes.data?.items || []);
    const ejercicios = Array.isArray(ejerciciosRes.data) ? ejerciciosRes.data : (ejerciciosRes.data?.items || []);

    const orangeStyle = "border-color: var(--tenant-primary-color); border-width: 2px;";

    // 🧡 Modal unificado
    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-pen-to-square"></i> Editar Ejercicio de Rutina',
      width: 650,
      html: `
        <div class="container-fluid text-start">
          <div class="alert alert-info">
            <small><i class="fa-solid fa-circle-info"></i> Solo puedes editar orden, series, repeticiones y descanso.</small>
          </div>

          <div class="row g-2 mt-2">
            <div class="col-md-6">
              <label for="orden" class="form-label fw-semibold">Orden</label>
              <input id="orden" type="number" min="1" class="form-control" style="${orangeStyle}" value="${item.orden || ""}" />
            </div>
            <div class="col-md-6">
              <label for="series" class="form-label fw-semibold">Series</label>
              <input id="series" type="number" min="1" class="form-control" style="${orangeStyle}" value="${item.series || ""}" />
            </div>
          </div>

          <div class="row g-2 mt-2">
            <div class="col-md-6">
              <label for="reps" class="form-label fw-semibold">Repeticiones</label>
              <input id="reps" type="number" min="1" class="form-control" style="${orangeStyle}" value="${item.repeticiones || ""}" />
            </div>
            <div class="col-md-6">
              <label for="descanso" class="form-label fw-semibold">Descanso (seg)</label>
              <input id="descanso" type="number" min="0" class="form-control" style="${orangeStyle}" value="${item.descansoSeg || ""}" />
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: " Guardar cambios",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      focusConfirm: false,
      preConfirm: () => {
        const orden = (document.getElementById("orden") as HTMLInputElement).value;
        const series = (document.getElementById("series") as HTMLInputElement).value;
        const repeticiones = (document.getElementById("reps") as HTMLInputElement).value;
        const descansoSeg = (document.getElementById("descanso") as HTMLInputElement).value;

        if (!orden || !series || !repeticiones || descansoSeg === "")
          return Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Completá todos los campos.');

        return { orden, series, repeticiones, descansoSeg };
      },
    });

    if (!formValues) return;

    // ✅ Enviar actualización
    await gymApi.put(`/rutinasplantillaejercicios/${id}`, {
      Orden: Number(formValues.orden),
      Series: Number(formValues.series),
      Repeticiones: Number(formValues.repeticiones),
      DescansoSeg: Number(formValues.descansoSeg),
    });

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Guardado',
      text: "Ejercicio actualizado correctamente.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    await onSuccess?.();
  } catch (_err: unknown) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo actualizar el registro.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}




