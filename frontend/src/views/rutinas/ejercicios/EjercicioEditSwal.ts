
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

export async function EjercicioEditSwal(id: number, onSuccess?: () => void) {
  try {
    //  Obtener datos actuales
    const { data: ejercicio } = await gymApi.get(`/ejercicios/${id}`);

    //  Obtener categorías
    const gruposResponse = await gymApi.get("/gruposmusculares");

    // Extraer el array de grupos musculares (manejar diferentes estructuras de respuesta)
    let grupos: any[] = [];
    if (Array.isArray(gruposResponse.data)) {
      grupos = gruposResponse.data;
    } else if (gruposResponse.data?.items && Array.isArray(gruposResponse.data.items)) {
      grupos = gruposResponse.data.items;
    } else if (gruposResponse.data?.data && Array.isArray(gruposResponse.data.data)) {
      grupos = gruposResponse.data.data;
    }

    const opcionesGrupo = grupos
      .map(
        (g: any) =>
          `<option value="${g.id}" ${
            ejercicio.grupoMuscularId === g.id ? "selected" : ""
          }>${g.nombre}</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-pen-to-square"></i> Editar Actividad',
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
          <div class="swal-input-group">
            <label class="swal-label">Nombre</label>
            <input id="nombre" class="swal-field" type="text" value="${
              ejercicio.nombre || ""
            }">
          </div>

          <div class="swal-input-group">
            <label class="swal-label">Categoría</label>
            <select id="grupo" class="swal-field">
              ${opcionesGrupo}
            </select>
          </div>

          <div class="swal-input-group">
            <label class="swal-label">Tips</label>
            <textarea id="tips" class="swal-field" rows="2">${
              ejercicio.tips || ""
            }</textarea>
          </div>

          <div class="swal-input-group">
            <label class="swal-label">Video (URL de YouTube, opcional)</label>
            <input id="video" class="swal-field" type="text" placeholder="https://www.youtube.com/watch?v=..." value="${
              ejercicio.videoUrl || ""
            }">
          </div>

          <div class="swal-input-group">
            <label class="swal-label">
              ${ejercicio.mediaUrl ? "Reemplazar imagen" : "Imagen (opcional)"}
            </label>
            <input id="imagen" type="file" accept="image/*" class="swal-field">
            ${
              ejercicio.mediaUrl
                ? `<div style="margin-top:6px">
                     <small style="color:#666;font-size:11px;">Imagen actual:</small>
                     <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                       <img
                        src="${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5144").replace(/\/api$/, '')}/${ejercicio.mediaUrl}"
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
        const nombre = (document.getElementById("nombre") as HTMLInputElement)
          .value;
        const grupo = (document.getElementById("grupo") as HTMLSelectElement)
          .value;
        const tips = (document.getElementById("tips") as HTMLTextAreaElement)
          .value;
        const video = (document.getElementById("video") as HTMLInputElement)
          .value;
        const imagen = (document.getElementById("imagen") as HTMLInputElement)
          .files?.[0];

        if (!nombre) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El nombre de la actividad es obligatorio');
          return false;
        }
        if (!grupo) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debe seleccionar una categoría');
          return false;
        }

        return { nombre, grupo, tips, video, imagen };
      },
    });

    if (!formValues) return;

    const { nombre, grupo, tips, video, imagen } = formValues;

    // 🔹 1. Si hay nueva imagen, subirla primero
    let mediaUrl = ejercicio.mediaUrl;
    if (imagen) {
      const formData = new FormData();
      formData.append("archivo", imagen);

      const { data: imagenResponse } = await gymApi.post(
        `/ejercicios/${id}/imagen`,
        formData
      );
      mediaUrl = imagenResponse.url;
    }

    // 🔹 2. Actualizar la actividad con JSON
    await gymApi.put(`/ejercicios/${id}`, {
      Nombre: nombre,
      GrupoMuscularId: parseInt(grupo),
      Tips: tips || "",
      VideoUrl: video || null,
      MediaUrl: mediaUrl
    });

    Swal.fire({
      icon: "success",
      title: "Actividad actualizada",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    if (onSuccess) onSuccess();
  } catch (error: any) {
    console.error("Error al editar actividad:", error);
    const errorMessage = error?.response?.data?.message || error?.message || "No se pudo actualizar la actividad";

    Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}




