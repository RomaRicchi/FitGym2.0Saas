import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

interface GrupoMuscular {
  id: number;
  nombre: string;
}

export async function RutinaPlantillaCreateSwal(onSuccess?: () => Promise<void>): Promise<void> {
  try {
    // 🔹 Obtener categorías
    const response = await gymApi.get("/gruposmusculares");

    // Extraer el array de categorías (manejar diferentes estructuras de respuesta)
    let grupos: any[] = [];
    if (Array.isArray(response.data)) {
      grupos = response.data;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      grupos = response.data.items;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      grupos = response.data.data;
    }

    const gruposOptions = grupos
      .map((g: GrupoMuscular) => `<option value="${g.id}">${g.nombre}</option>`)
      .join("");

    // 🧱 Construcción del formulario
    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-dumbbell"></i> Nueva Rutina',
      width: 650,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk"></i> Guardar',
      cancelButtonText: "Cancelar",
      html: `
        <form class="swal-form">
          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Nombre</label>
            <input id="nombre" type="text" class="form-control" placeholder="Nombre de la rutina">
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Objetivo</label>
            <textarea id="objetivo" class="form-control" placeholder="Ej: fuerza, tonificación, resistencia..."></textarea>
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Categoría</label>
            <select id="grupoMuscularId" class="form-select">
              <option value="">Seleccione una categoría</option>
              ${gruposOptions}
            </select>
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Imagen de la rutina (opcional)</label>
            <input id="imagen" type="file" class="form-control" accept="image/*">
            <small class="text-muted" style="font-size: 11px;">Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)</small>
          </div>
        </form>
      `,
      preConfirm: () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
        const objetivo = (document.getElementById("objetivo") as HTMLTextAreaElement)?.value.trim();
        const grupoMuscularId = parseInt((document.getElementById("grupoMuscularId") as HTMLSelectElement)?.value || "0");
        const imagen = (document.getElementById("imagen") as HTMLInputElement)?.files?.[0];

        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El nombre es obligatorio');
          return false;
        }
        if (isNaN(grupoMuscularId)) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debe seleccionar una categoría');
          return false;
        }

        return { nombre, objetivo, grupoMuscularId, imagen };
      },
    });

    // 🚫 Cancelado
    if (!formValues) return;

    // 📦 Crear FormData (multipart/form-data)
    const formData = new FormData();
    formData.append("Nombre", formValues.nombre);
    formData.append("Objetivo", formValues.objetivo);
    formData.append("GrupoMuscularId", formValues.grupoMuscularId);
    if (formValues.imagen) {
      formData.append("Imagen", formValues.imagen);
    }

    // 📨 Enviar al backend
    await gymApi.post("/rutinasplantilla", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Swal.fire({
      icon: "success",
      title: "Rutina creada",
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
    const err = error as { response?: { data?: string } };
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data || "No se pudo crear la rutina. Verificá los datos.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}



