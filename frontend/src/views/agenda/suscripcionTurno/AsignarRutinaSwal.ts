import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

export async function AsignarRutinaSwal(
  turnoId: number,
  socioNombre: string,
  onSuccess?: () => void
) {
  try {
    // 🔹 Obtener todas las rutinas sin paginación
    const { data } = await gymApi.get("/rutinasplantilla/all");
    let rutinas = (data && (data.data || data.items || data)) ?? [];

    // 🔹 Extraer categorías únicas
    const categorias = Array.from(
      new Set(rutinas.map((r: any) => r.grupoMuscularNombre).filter(Boolean))
    ).sort() as string[];

    const orangeStyle = "border-color: var(--tenant-primary-color); border-width: 2px;";

    // 🔹 Mostrar SweetAlert con filtro por categoría + select de rutinas
    const { value: rutinaSeleccionada } = await Swal.fire({
      title: `<i class="fa-solid fa-dumbbell"></i> <strong>Asignar rutina a ${socioNombre}</strong>`,
      html: `
        <label style="display:block; margin-bottom:5px; font-weight:bold;">Categoría:</label>
        <select id="categoriaSelect" class="swal2-input"
          style="width:100%; text-align-last:center; margin-bottom:15px; ${orangeStyle}">
          <option value="">Todas las categorías</option>
          ${categorias
            .map((g: string) => `<option value="${g}">${g}</option>`)
            .join("")}
        </select>

        <label style="display:block; margin-bottom:5px; font-weight:bold;">Rutina:</label>
        <select id="rutinaSelect" size="6" class="swal2-input"
          style="width:100%; height:auto; text-align-last:center; ${orangeStyle}">
          ${rutinas
            .map(
              (r: any) =>
                `<option value="${r.id}">
                  ${r.nombre} ${r.profesorNombre ? `| ${r.profesorNombre}` : ''}
                </option>`
            )
            .join("")}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      background: "#ffa940",
      color: "#222",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange mx-2",
        cancelButton: "btn btn-secondary mx-2",
      },
      focusConfirm: false,
      didOpen: () => {
        const categoriaSelect = document.getElementById(
          "categoriaSelect"
        ) as HTMLSelectElement;
        const rutinaSelect = document.getElementById(
          "rutinaSelect"
        ) as HTMLSelectElement;

        // 🔍 Filtrar rutinas por categoría
        categoriaSelect.addEventListener("change", () => {
          const categoria = categoriaSelect.value;
          const rutinasFiltradas = categoria
            ? rutinas.filter((r: any) => r.grupoMuscularNombre === categoria)
            : rutinas;

          rutinaSelect.innerHTML = rutinasFiltradas
            .map(
              (r: any) =>
                `<option value="${r.id}">
                  ${r.nombre} ${r.profesorNombre ? `| ${r.profesorNombre}` : ''}
                </option>`
            )
            .join("");
        });
      },
      preConfirm: () => {
        const select = document.getElementById(
          "rutinaSelect"
        ) as HTMLSelectElement;
        return select.value || null;
      },
    });

    if (!rutinaSeleccionada) return;

    Swal.fire({
      title: "Guardando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      background: "#ffa940",
      showConfirmButton: false,
    });

    await gymApi.patch(`/suscripcionturno/${turnoId}/rutina`, rutinaSeleccionada);

    await Swal.fire({
      icon: "success",
      title: "Rutina asignada",
      text: "La rutina fue asignada correctamente al turno.",
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
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "No se pudo asignar la rutina.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
