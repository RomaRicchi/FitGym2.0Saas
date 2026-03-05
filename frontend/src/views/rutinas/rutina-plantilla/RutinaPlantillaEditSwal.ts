import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

interface GrupoMuscular {
  id: number;
  nombre: string;
}

interface RutinaPlantilla {
  id: number;
  nombre: string;
  objetivo?: string;
  grupoMuscularId: number;
  imagenUrl?: string;
}

export async function RutinaPlantillaEditSwal(id: number, onSuccess?: () => Promise<void>): Promise<void> {
  try {
    // 🔹 Obtener datos actuales
    const { data: rutina } = await gymApi.get<RutinaPlantilla>(`/rutinasplantilla/${id}`);

    // 🔹 Cargar categorías
    const gruposResponse = await gymApi.get("/gruposmusculares");

    // Extraer el array de categorías (manejar diferentes estructuras de respuesta)
    let grupos: any[] = [];
    if (Array.isArray(gruposResponse.data)) {
      grupos = gruposResponse.data;
    } else if (gruposResponse.data?.items && Array.isArray(gruposResponse.data.items)) {
      grupos = gruposResponse.data.items;
    } else if (gruposResponse.data?.data && Array.isArray(gruposResponse.data.data)) {
      grupos = gruposResponse.data.data;
    }

    const gruposOptions = grupos
      .map(
        (g: GrupoMuscular) =>
          `<option value="${g.id}" ${
            g.id === rutina.grupoMuscularId ? "selected" : ""
          }>${g.nombre}</option>`
      )
      .join("");

    // 🧱 Formulario Swal
    const { value: formValues } = await Swal.fire({
      title: "Editar Rutina",
      width: 650,
      showCancelButton: true,
      confirmButtonText: "Guardar cambios",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      html: `
        <form class="swal-form">
          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Nombre</label>
            <input id="nombre" type="text" class="form-control" value="${rutina.nombre || ""}">
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Objetivo</label>
            <textarea id="objetivo" class="form-control" placeholder="Objetivo de la rutina">${rutina.objetivo || ""}</textarea>
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Categoría</label>
            <select id="grupoMuscularId" class="form-select">
              ${gruposOptions}
            </select>
          </div>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">
              ${rutina.imagenUrl ? "Reemplazar imagen" : "Imagen (opcional)"}
            </label>
            <input id="imagen" type="file" class="form-control" accept="image/*">
            ${
              rutina.imagenUrl
                ? `<div style="margin-top:6px">
                     <small style="color:#666;font-size:11px;">Imagen actual:</small>
                     <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                       <img
                        src="${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5144").replace(/\/api$/, '')}/${rutina.imagenUrl}"
                        style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--tenant-primary-color)"
                        onerror="this.src='/placeholder.png'"
                      >
                       <small style="color:var(--tenant-primary-color);font-size:11px;"><i class="fa-solid fa-circle-info"></i> Selecciona un archivo para reemplazar</small>
                     </div>
                   </div>`
                : ""
            }
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

    if (!formValues) return;

    const { nombre, objetivo, grupoMuscularId, imagen } = formValues;

    // 📦 Crear FormData (multipart/form-data)
    const formData = new FormData();
    formData.append("Id", id.toString());
    formData.append("Nombre", nombre);
    formData.append("Objetivo", objetivo);
    formData.append("GrupoMuscularId", grupoMuscularId);
    if (imagen) {
      formData.append("Imagen", imagen);
    } else if (rutina.imagenUrl) {
      formData.append("ImagenUrl", rutina.imagenUrl);
    }

    // 📨 Enviar al backend
    await gymApi.put(`/rutinasplantilla/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Swal.fire({
      icon: "success",
      title: "Rutina actualizada",
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
      text: err.response?.data || "No se pudo actualizar la rutina",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}




