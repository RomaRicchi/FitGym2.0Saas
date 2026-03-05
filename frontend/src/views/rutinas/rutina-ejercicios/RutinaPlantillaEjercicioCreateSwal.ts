import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

interface Rutina {
  id: number;
  nombre: string;
}

interface Ejercicio {
  id: number;
  nombre: string;
  grupoMuscularNombre?: string;
}

interface RutinaEjercicio {
  rutinaId: number;
  orden: number;
}

/**
 * Formulario para agregar un ejercicio a una rutina específica.
 * Si se pasa rutinaPreseleccionada, la rutina se fija y no se puede cambiar.
 */
export async function RutinaPlantillaEjercicioCreateSwal(onSuccess?: () => Promise<void>, rutinaPreseleccionada?: Rutina): Promise<void> {
  try {
    // 🔹 Cargar rutinas, actividades y actividades de rutinas para calcular órdenes
    const [rutinasRes, ejerciciosRes, rutinasEjerciciosRes] = await Promise.all([
      gymApi.get("/rutinasplantilla?page=1&pageSize=100"),
      gymApi.get("/ejercicios?page=1&pageSize=100"),
      gymApi.get("/rutinasplantillaejercicios?page=1&pageSize=1000"),
    ]);

    // Extraer arrays correctamente (manejar diferentes estructuras de respuesta)
    const extractArray = (response: any, fallbackKey = 'data') => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response.data)) return response.data;
      if (response.data?.items && Array.isArray(response.data.items)) return response.data.items;
      if (response.data?.[fallbackKey] && Array.isArray(response.data[fallbackKey])) return response.data[fallbackKey];
      return [];
    };

    const rutinas = extractArray(rutinasRes);
    const ejercicios = extractArray(ejerciciosRes);
    const rutinasEjercicios = extractArray(rutinasEjerciciosRes, 'data');

    // Función para calcular el siguiente orden disponible para una rutina
    const getSiguienteOrden = (rutinaId: number): number => {
      const ejerciciosDeRutina = rutinasEjercicios.filter((re: RutinaEjercicio) => re.rutinaId === rutinaId);
      if (ejerciciosDeRutina.length === 0) return 1;
      const maxOrden = Math.max(...ejerciciosDeRutina.map((re: RutinaEjercicio) => re.orden || 0));
      return maxOrden + 1;
    };

    // Función para obtener ejercicios ya asignados a una rutina
    const getEjerciciosAsignados = (rutinaId: number): Set<number> => {
      const ejerciciosDeRutina = rutinasEjercicios.filter((re: any) => re.rutinaId === rutinaId);
      return new Set(ejerciciosDeRutina.map((re: any) => re.ejercicioId));
    };

    // Obtener grupos musculares únicos
    const gruposMusculares = [
      "todos",
      ...new Set(ejercicios.map((e: Ejercicio) => e.grupoMuscularNombre).filter(Boolean))
    ];

    const orangeStyle = "border-color: var(--tenant-primary-color); border-width: 2px;";

    // === HTML dinámico ===
    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-plus"></i> Agregar Actividad a Rutina',
      width: 650,
      html: `
        <div class="container-fluid text-start">

          <!-- Rutina -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Rutina</label>
            <select id="rutina" class="form-select" style="${orangeStyle}" ${rutinaPreseleccionada ? "disabled" : ""}>
              <option value="">Seleccionar rutina...</option>
              ${rutinas
                .map(
                  (r: Rutina) =>
                    `<option value="${r.id}" ${rutinaPreseleccionada?.id === r.id ? "selected" : ""}>${r.nombre}</option>`
                )
                .join("")}
            </select>
          </div>

          <!-- Filtro por Categoría -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Filtrar por Categoría</label>
            <select id="grupoMuscular" class="form-select" style="${orangeStyle}">
              <option value="todos">Todas las categorías</option>
              ${gruposMusculares
                .filter((g: unknown) => typeof g === "string" && g !== "todos")
                .map((g: unknown) => `<option value="${g}">${g}</option>`)
                .join("")}
            </select>
          </div>

          <!-- Actividad con Buscador -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Actividad</label>
            <input
              id="ejercicioBuscador"
              type="text"
              class="form-control mb-2"
              style="${orangeStyle}"
              placeholder="Buscar actividad por nombre..."
            >
            <small id="ejercicioCounter" class="text-muted mb-1 d-block"></small>
            <select id="ejercicio" class="form-select" style="${orangeStyle}">
              <option value="">Seleccionar actividad...</option>
              ${ejercicios.map((e: Ejercicio) =>
                `<option value="${e.id}" data-grupo="${e.grupoMuscularNombre || ''}" data-nombre="${e.nombre.toLowerCase()}">${e.nombre}</option>`
              ).join("")}
            </select>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Orden</label>
              <input id="orden" type="number" min="1" class="form-control" style="${orangeStyle}"
                     placeholder="Auto" value="${rutinaPreseleccionada ? getSiguienteOrden(rutinaPreseleccionada.id) : ''}"
                     ${rutinaPreseleccionada ? 'readonly style="background-color: #e9ecef; cursor: not-allowed;"' : ''}>
              ${rutinaPreseleccionada ? '<small class="text-muted">Calculado automáticamente</small>' : '<small class="text-muted">Se calculará al seleccionar rutina</small>'}
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Series</label>
              <input id="series" type="number" min="1" class="form-control" style="${orangeStyle}" placeholder="Ej: 3">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Repeticiones</label>
              <input id="reps" type="number" min="1" class="form-control" style="${orangeStyle}" placeholder="Ej: 12">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Descanso (seg)</label>
              <input id="descanso" type="number" min="0" class="form-control" style="${orangeStyle}" placeholder="Ej: 60">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      didOpen: () => {
        const rutinaSelect = document.getElementById("rutina") as HTMLSelectElement;
        const ordenInput = document.getElementById("orden") as HTMLInputElement;
        const ejercicioBuscador = document.getElementById("ejercicioBuscador") as HTMLInputElement;
        const ejercicioSelect = document.getElementById("ejercicio") as HTMLSelectElement;
        const ejercicioCounter = document.getElementById("ejercicioCounter");

        // Event listener para actualizar el orden automáticamente al cambiar la rutina
        rutinaSelect?.addEventListener("change", () => {
          const rutinaId = Number(rutinaSelect.value);
          if (rutinaId && !rutinaPreseleccionada) {
            const siguienteOrden = getSiguienteOrden(rutinaId);
            ordenInput.value = siguienteOrden.toString();
          } else if (!rutinaId) {
            ordenInput.value = "";
          }
          // Actualizar el filtro de ejercicios al cambiar la rutina
          filtrarEjercicios();
        });

        // Event listener para filtrar actividades por categoría
        const grupoSelect = document.getElementById("grupoMuscular") as HTMLSelectElement;

        // Función para filtrar actividades por categoría Y búsqueda de texto
        const filtrarEjercicios = () => {
          const filtroGrupo = grupoSelect?.value || "todos";
          const busqueda = ejercicioBuscador?.value.toLowerCase().trim() || "";
          const rutinaId = Number(rutinaSelect?.value) || Number(rutinaPreseleccionada?.id) || 0;
          const ejerciciosAsignados = rutinaId ? getEjerciciosAsignados(rutinaId) : new Set<number>();
          const opciones = ejercicioSelect?.querySelectorAll("option") || [];
          let visibles = 0;
          let ocultosPorAsignacion = 0;

          opciones.forEach((opcion) => {
            if (opcion.value === "") {
              (opcion as HTMLOptionElement).style.display = "";
              return;
            }

            const grupo = opcion.getAttribute("data-grupo") || "";
            const nombre = opcion.getAttribute("data-nombre") || "";
            const ejercicioId = Number(opcion.value);

            const coincideGrupo = filtroGrupo === "todos" || grupo === filtroGrupo;
            const coincideNombre = !busqueda || nombre.includes(busqueda);
            const yaAsignado = rutinaId && ejerciciosAsignados.has(ejercicioId);

            if (coincideGrupo && coincideNombre && !yaAsignado) {
              (opcion as HTMLOptionElement).style.display = "";
              visibles++;
            } else {
              (opcion as HTMLOptionElement).style.display = "none";
              if (yaAsignado) ocultosPorAsignacion++;
            }
          });

          // Actualizar contador
          if (ejercicioCounter) {
            const total = ejercicios.length;
            let mensaje = "";

            if (busqueda || filtroGrupo !== "todos") {
              mensaje = `Mostrando ${visibles} de ${total} actividades`;
            } else {
              mensaje = `${total} actividades disponibles`;
            }

            if (ocultosPorAsignacion > 0) {
              mensaje += ` (${ocultosPorAsignacion} ya asignados a esta rutina)`;
            }

            ejercicioCounter.textContent = mensaje;
          }

          // Resetear la selección si el ejercicio seleccionado ya no es visible
          if (ejercicioSelect?.value) {
            const opcionSeleccionada = ejercicioSelect.querySelector(`option[value="${ejercicioSelect.value}"]`);
            if (opcionSeleccionada && (opcionSeleccionada as HTMLOptionElement).style.display === "none") {
              ejercicioSelect.value = "";
            }
          }
        };

        grupoSelect?.addEventListener("change", filtrarEjercicios);

        // Event listener para el buscador de actividades
        ejercicioBuscador?.addEventListener("input", filtrarEjercicios);

        // Inicializar el contador
        filtrarEjercicios();
      },
      preConfirm: async () => {
        const rutinaId = rutinaPreseleccionada
          ? rutinaPreseleccionada.id
          : (document.getElementById("rutina") as HTMLSelectElement).value;
        const ejercicioId = (document.getElementById("ejercicio") as HTMLSelectElement).value;
        let orden = (document.getElementById("orden") as HTMLInputElement).value;
        const series = (document.getElementById("series") as HTMLInputElement).value;
        const repeticiones = (document.getElementById("reps") as HTMLInputElement).value;
        const descansoSeg = (document.getElementById("descanso") as HTMLInputElement).value;

        if (!rutinaId || !ejercicioId) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debes seleccionar una rutina y una actividad');
          return false;
        }

        if (!series || !repeticiones) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debes completar series y repeticiones');
          return false;
        }

        // Si el orden está vacío, calcularlo automáticamente
        if (!orden && rutinaId) {
          orden = getSiguienteOrden(Number(rutinaId)).toString();
        }

        return { rutinaId, ejercicioId, orden, series, repeticiones, descansoSeg };
      },
    });

    if (!formValues) return;

    // === Enviar datos ===
    try {
      await gymApi.post("/rutinasplantillaejercicios", {
        RutinaId: Number(formValues.rutinaId),
        EjercicioId: Number(formValues.ejercicioId),
        Orden: Number(formValues.orden),
        Series: Number(formValues.series),
        Repeticiones: Number(formValues.repeticiones),
        DescansoSeg: Number(formValues.descansoSeg),
      });

      // Esperar un momento antes de mostrar el éxito para que la animación se vea completa
      await new Promise(resolve => setTimeout(resolve, 100));

      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check"></i> Guardado',
        text: "Actividad agregada correctamente",
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
    } catch (error: any) {
      console.error("Error al agregar actividad:", error);

      // Extraer mensaje de error del backend
      let errorMessage = "No se pudo agregar la actividad a la rutina";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Detectar errores específicos para mostrar mensajes más claros
      if (errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.toLowerCase().includes("unique") ||
          errorMessage.toLowerCase().includes("ya existe") ||
          errorMessage.toLowerCase().includes("ejercicio ya") ||
          errorMessage.toLowerCase().includes("actividad ya")) {
        errorMessage = '<i class="fa-solid fa-triangle-exclamation"></i> Esta actividad ya está asignada a la rutina. Selecciona otra actividad.';
      } else if (errorMessage.toLowerCase().includes("orden") && errorMessage.toLowerCase().includes("existe")) {
        errorMessage = '<i class="fa-solid fa-triangle-exclamation"></i> Ya existe una actividad con ese orden en la rutina. Usa otro número.';
      }

      await Swal.fire({
        icon: "error",
        title: '<i class="fa-solid fa-circle-xmark"></i> Error al agregar',
        html: errorMessage,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  } catch (error: any) {
    console.error("Error al cargar datos:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los datos necesarios. Intente nuevamente.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}




