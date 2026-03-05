import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";
import { RutinaPlantillaEjercicioCreateSwal } from "@/views/rutinas/rutina-ejercicios/RutinaPlantillaEjercicioCreateSwal";
import { RutinaPlantillaEjercicioEditSwal } from "@/views/rutinas/rutina-ejercicios/RutinaPlantillaEjercicioEditSwal";

interface EjercicioRutina {
  id: number;
  ejercicio: string;
  imagenUrl?: string;
  videoUrl?: string;
  series: number;
  repeticiones: number;
  descansoSeg: number;
}

export async function RutinaMostrarEjerciciosSwal(rutinaId: number, rutinaNombre: string): Promise<void> {
  try {
    const { data } = await gymApi.get(
      `/rutinasplantillaejercicios?page=1&pageSize=100&q=${encodeURIComponent(rutinaNombre)}`
    );

    const payload = data?.data ?? data;
    const ejercicios = payload?.items || payload?.data || payload || [];
    if (!Array.isArray(ejercicios)) throw new Error("Formato inesperado de actividades");

    const lista = ejercicios
      .map(
        (e: EjercicioRutina) => `
        <div class="ej-card" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <img
            src="${
              e.imagenUrl
                ? `${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5144").replace(/\/api$/, "")}/${e.imagenUrl}`
                : "/placeholder.png"
            }"
            data-fullimg="${
              e.imagenUrl
                ? `${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5144").replace(/\/api$/, "")}/${e.imagenUrl}`
                : "/placeholder.png"
            }"
            class="img-miniatura"
            style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:2px solid var(--tenant-primary-color);cursor:pointer;"
          />
          <div style="flex:1;">
            <div class="ej-nombre">${e.ejercicio}</div>
            <div class="ej-detalle">
              Series: ${e.series} | Reps: ${e.repeticiones} | Descanso: ${e.descansoSeg}s
            </div>
            <div style="margin-top:4px;">
              <a href="${e.videoUrl || '#'}"
                 class="video-link" target="_blank" rel="noopener noreferrer"
                 style="display:${e.videoUrl ? 'inline-flex' : 'none'};align-items:center;gap:4px;padding:2px 8px;
                        background:#FF0000;color:white;text-decoration:none;border-radius:4px;font-size:12px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C.062 8.074 0 10.323 0 12s.062 3.926.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24.062 15.926 24 13.677 24 12c0-1.677-.062-3.926-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Ver video
              </a>
            </div>
          </div>
          <div class="ej-acciones" style="display:flex;gap:8px;">
            <button class="btn-editar" data-id="${e.id}"
              style="background:#ffcc00;border:none;border-radius:6px;padding:4px 8px;cursor:pointer;"><i class="fas fa-edit"></i></button>
            <button class="btn-eliminar" data-id="${e.id}"
              style="background:#ff4d4d;border:none;border-radius:6px;padding:4px 8px;cursor:pointer;"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
      )
      .join("");

    const contenido = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
        <button id="btn-nuevo-ej" 
          style="background:var(--tenant-primary-color);color:white;border:none;border-radius:8px;
                 padding:8px 18px;font-weight:600;cursor:pointer;align-self:center;">
          <i class="fas fa-plus"></i> Nueva actividad
        </button>
        <div id="lista-ejercicios" style="width:100%;margin-top:10px;">
          ${
            lista ||
            "<p class='text-muted text-center mt-3'>Esta rutina no tiene actividades asignadas.</p>"
          }
        </div>
      </div>
    `;

    await Swal.fire({
      title: `<strong>${rutinaNombre}</strong>`,
      html: contenido,
      width: 700,
      customClass: { popup: "swal2-card-style" },
      showCancelButton: true,
      confirmButtonText: "Cerrar",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      scrollbarPadding: false,
      didOpen: () => {
        // <i class="fas fa-plus"></i> Nueva actividad
        document.getElementById("btn-nuevo-ej")?.addEventListener("click", async () => {
          Swal.close();
          await RutinaPlantillaEjercicioCreateSwal(
            () => RutinaMostrarEjerciciosSwal(rutinaId, rutinaNombre),
            { id: rutinaId, nombre: rutinaNombre }
          );
        });

        //  Editar
        document.querySelectorAll(".btn-editar").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (id) {
              Swal.close();
              await RutinaPlantillaEjercicioEditSwal(Number(id), () =>
                RutinaMostrarEjerciciosSwal(rutinaId, rutinaNombre)
              );
            }
          });
        });

        // Eliminar
        document.querySelectorAll(".btn-eliminar").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (!id) return;
            const confirm = await Swal.fire({
              title: "¿Eliminar actividad?",
              text: "Esta acción no se puede deshacer.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Sí, eliminar",
              cancelButtonText: "Cancelar",
              buttonsStyling: false,
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
                cancelButton: "btn btn-secondary",
              },
            });
            if (confirm.isConfirmed) {
              await gymApi.delete(`/rutinasplantillaejercicios/${Number(id)}`);
              await RutinaMostrarEjerciciosSwal(rutinaId, rutinaNombre);
            }
          });
        });

        //  Ampliar imagen y volver al listado
        document.querySelectorAll(".img-miniatura").forEach((img) => {
          img.addEventListener("click", async () => {
            const src = img.getAttribute("data-fullimg");
            const alt =
              img.closest(".ej-card")?.querySelector(".ej-nombre")?.textContent ||
              "Actividad";

            // Cierro el swal actual
            Swal.close();

            // Muestro la imagen grande
            await Swal.fire({
              title: `<strong>${alt}</strong>`,
              imageUrl: src,
              imageAlt: alt,
              width: "auto",
              background: "#1e1e1e",
              showConfirmButton: false,
              showCloseButton: true,
              customClass: { popup: "swal2-card-style" },
            });

            // Al cerrar la imagen, vuelvo a abrir el listado
            await RutinaMostrarEjerciciosSwal(rutinaId, rutinaNombre);
          });
        });
      },
    });
  } catch (_error: unknown) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las actividades",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}
