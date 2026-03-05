import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

interface GrupoMuscular {
  id: number;
  nombre: string;
}

interface EjercicioResponse {
  id: number;
  nombre: string;
}

export async function EjercicioCreateSwal(onSuccess?: () => Promise<void>): Promise<void> {
  try {
    // 🔹 Cargar categorías
    const response = await gymApi.get("/gruposmusculares");

    // Extraer el array de grupos musculares (manejar diferentes estructuras de respuesta)
    let gruposMusculares: any[] = [];
    if (Array.isArray(response.data)) {
      gruposMusculares = response.data;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      gruposMusculares = response.data.items;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      gruposMusculares = response.data.data;
    }

    // 🧱 Construir formulario
    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-plus"></i> Nueva Actividad',
      width: 650,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      showCancelButton: true,
      confirmButtonText: " Guardar",
      cancelButtonText: "Cancelar",
      html: `
        <form class="swal-form">
          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Nombre</label>
            <input id="nombre" type="text" class="form-control" placeholder="Nombre de la actividad">
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Tips</label>
            <textarea id="tips" class="form-control" placeholder="Consejos o notas opcionales"></textarea>
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Categoría</label>
            <select id="grupoMuscularId" class="form-select">
              <option value="">Seleccione una categoría</option>
              ${gruposMusculares
                .map((g: GrupoMuscular) => `<option value="${g.id}">${g.nombre}</option>`)
                .join("")}
            </select>
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Video (URL de YouTube, opcional)</label>
            <input id="video" type="text" class="form-control" placeholder="https://www.youtube.com/watch?v=...">
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Imagen de la actividad (opcional)</label>
            <input id="imagen" type="file" class="form-control" accept="image/*">
            <small class="text-muted" style="font-size: 11px;">Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)</small>
          </div>
        </form>
      `,
      preConfirm: () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
        const tips = (document.getElementById("tips") as HTMLTextAreaElement)?.value.trim();
        const grupoMuscularId = parseInt((document.getElementById("grupoMuscularId") as HTMLSelectElement)?.value || "0");
        const video = (document.getElementById("video") as HTMLInputElement)?.value.trim();
        const imagen = (document.getElementById("imagen") as HTMLInputElement)?.files?.[0];

        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El nombre de la actividad es obligatorio');
          return false;
        }
        if (isNaN(grupoMuscularId)) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debe seleccionar una categoría');
          return false;
        }

        return { nombre, tips, grupoMuscularId, video, imagen };
      },
    });

    // 🚫 Cancelado
    if (!formValues) return;

    // 📨 1. Crear el ejercicio (JSON)
    const { data: ejercicio } = await gymApi.post("/ejercicios", {
      Nombre: formValues.nombre,
      Tips: formValues.tips || "",
      GrupoMuscularId: formValues.grupoMuscularId,
      VideoUrl: formValues.video || null
    });

    // 📨 2. Si hay imagen, subirla por separado
    if (formValues.imagen) {
      const ejercicioCreado = ejercicio as EjercicioResponse;
      if (ejercicioCreado?.id) {
        const formData = new FormData();
        formData.append("archivo", formValues.imagen);

        await gymApi.post(`/ejercicios/${ejercicioCreado.id}/imagen`, formData);
      }
    }

    Swal.fire({
      icon: "success",
      title: "Actividad creada",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    if (onSuccess) await onSuccess();
  } catch (error: unknown) {
    const err = error as { response?: { data?: string }; message?: string };
    console.error("[ActividadCreateSwal] Error:", err.response?.data || err.message);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data || "No se pudo crear la actividad",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}




