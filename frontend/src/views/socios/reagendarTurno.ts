import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/asignarTurnos.css";

/**
 * Modal de reagendado con el mismo look & feel del asignar turnos (sin carrusel, 1 turno).
 * - Precarga el turno actual (día/turno seleccionado).
 * - Muestra resumen del turno actual.
 */
export async function reagendarTurnoModal(
  suscripcionId: number,
  turnoActualId: number,
  turnoPlantillaId: number,
  fetchTurnos: () => void
) {
  try {
    // Datos base
    const { data: suscripcion } = await gymApi.get(`/suscripciones/${suscripcionId}`);
    const planId = suscripcion.planId || suscripcion.PlanId;

    const { data: turnoActual } = await gymApi.get(`/turnosPlantilla/${turnoPlantillaId}`);
    const diaActualId =
      turnoActual?.diaSemanaId || turnoActual?.DiaSemanaId || turnoActual?.diaId || null;
    const horaActual = turnoActual?.horaInicio || turnoActual?.HoraInicio || "--:--";
    const salaActual = turnoActual?.sala?.nombre || turnoActual?.Sala?.Nombre || "Sala";

    // Días
    const { data: diasRes } = await gymApi.get("/diassemana");
    const dias = diasRes.items || diasRes;

    await Swal.fire({
      title: '<i class="fa-solid fa-rotate-right"></i> Reagendar Turno',
      width: window.innerWidth < 768 ? '95vw' : '600px',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: { popup: "swal2-card-turnos" },
      html: `
        <div class="turnos-modal">
          <p style="margin-bottom: 16px;"><strong>Turno actual:</strong> ${horaActual} - ${salaActual}</p>
          <hr style="margin-bottom: 20px;"/>
          <div class="turno-grupo">
            <label style="display:block; margin: 8px 0 10px 0;"><b>Seleccionar día</b></label>
            <select
              id="select-dia"
              class="turno-input"
              style="
                height:52px;
                line-height:1.5;
                padding:12px 14px;
                font-size:16px;
                text-transform:none;
                margin-bottom: 18px;
              "
            >
              <option value="">-- Elegí un día --</option>
              ${dias.map((d: any) => `<option value="${d.id}">${d.nombre}</option>`).join("")}
            </select>

            <label style="display:block; margin: 8px 0 10px 0;"><b>Turno disponible</b></label>
            <select
              id="select-turno"
              class="turno-input"
              style="
                height:52px;
                line-height:1.5;
                padding:12px 14px;
                font-size:16px;
                text-transform:none;
                margin-bottom: 18px;
              "
            >
              <option value="">Seleccione un día primero</option>
            </select>

            <div id="warning-message" style="
              display:none;
              background:#f8d7da;
              border:1px solid #dc3545;
              border-radius:8px;
              padding:12px;
              margin-top:16px;
              margin-bottom:16px;
              color:#721c24;
              font-size:14px;
            ">
              <i class="fa-solid fa-triangle-exclamation"></i> <span id="warning-text"></span>
            </div>

            <div class="d-flex gap-2 mt-4">
              <button id="btn-reagendar" class="turno-btn" style="flex:1; height: 48px; font-size: 16px;"><i class="fa-solid fa-rotate-right"></i> Reagendar</button>
              <button id="btn-cerrar" style="
                flex:1;
                height: 48px !important;
                font-size: 16px !important;
                border:none !important;
                border-radius:8px !important;
                background: #6c757d !important;
                color: white !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: background 0.2s !important;
              ">Cancelar</button>
            </div>
          </div>
        </div>
      `,
      didOpen: () => {
        const diaSelect = document.getElementById("select-dia") as HTMLSelectElement;
        const turnoSelect = document.getElementById("select-turno") as HTMLSelectElement;
        const btnReagendar = document.getElementById("btn-reagendar") as HTMLButtonElement;
        const btnCerrar = document.getElementById("btn-cerrar") as HTMLButtonElement;
        const warningMsg = document.getElementById("warning-message") as HTMLDivElement;
        const warningTxt = document.getElementById("warning-text") as HTMLSpanElement;
        let isSubmitting = false;

        // Preseleccionar día actual
        if (diaActualId) diaSelect.value = String(diaActualId);

        const cargarTurnos = async (diaId: string) => {
          if (!diaId) return;
          turnoSelect.innerHTML = `<option>Cargando...</option>`;
          try {
            const { data } = await gymApi.get(`/turnosplantilla/dia/${diaId}?planId=${planId}`);
            const turnos = data.items || data;

            turnoSelect.innerHTML = turnos.length
              ? turnos
                  .map((t: any) => {
                    const id = t.id ?? t.Id;
                    const hora = t.horaInicio ?? t.HoraInicio ?? "--:--";
                    const profe = t.profesor ?? t.Personal?.Nombre ?? "(sin profesor)";
                    const sala = t.sala?.nombre ?? t.Sala?.Nombre ?? "Sala";
                    const cupoDisp = t.sala?.cupoDisponible ?? t.Sala?.CupoDisponible ?? 0;
                    const cupoTot = t.sala?.cupoTotal ?? t.Sala?.CupoTotal ?? 0;
                    const esActual = id === turnoPlantillaId;
                    return `<option value="${id}" ${esActual ? "selected" : ""}>
                      ${esActual ? "➤ Actual ➤ " : ""}${hora} hs - ${profe} (${sala}) | Cupo: ${cupoDisp}/${cupoTot}
                    </option>`;
                  })
                  .join("")
              : `<option>No hay turnos disponibles ese día</option>`;
          } catch {
            turnoSelect.innerHTML = `<option>Error al cargar turnos</option>`;
          }
        };

        diaSelect.addEventListener("change", () => cargarTurnos(diaSelect.value));

        // Carga inicial
        if (diaActualId) cargarTurnos(String(diaActualId));

        btnReagendar.addEventListener("click", async () => {
          if (isSubmitting) return;
          const nuevoTurnoPlantillaId = parseInt(turnoSelect.value || "0", 10);
          if (!nuevoTurnoPlantillaId) {
            if (warningMsg && warningTxt) {
              warningMsg.style.display = "block";
              warningTxt.textContent = "Seleccioná un turno válido.";
            }
            return;
          }

          isSubmitting = true;
          // limpiar alertas previas
          if (warningMsg && warningTxt) {
            warningMsg.style.display = "none";
            warningTxt.textContent = "";
          }

          try {
            const payload = {
              suscripcionTurnoId: turnoActualId,
              nuevoTurnoPlantillaId,
            };
            const res = await gymApi.post("/suscripcionturno/mis-turnos/reagendar", payload);

            btnReagendar.textContent = '<i class="fa-solid fa-circle-check"></i> Reagendado';
            btnReagendar.classList.add("guardado");
            btnReagendar.disabled = true;

            await Swal.fire({
              icon: "success",
              title: '<i class="fa-solid fa-circle-check"></i> Turno reagendado',
              text: res.data.message || "El turno fue cambiado correctamente.",
              timer: 2200,
              timerProgressBar: true,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
              },
              buttonsStyling: false,
            });

            await fetchTurnos();
            Swal.close();
          } catch (error: any) {
            const msg = error.response?.data?.message;
            const status = error.response?.status;

            // Mostrar error inline para 400/403/404/409 sin cerrar el modal
            if (status === 400 || status === 403 || status === 404 || status === 409) {
              if (warningMsg && warningTxt) {
                warningMsg.style.display = "block";
                const isWarn = status === 409;
                warningMsg.style.background = isWarn ? "#fff3cd" : "#f8d7da";
                warningMsg.style.borderColor = isWarn ? "#ffc107" : "#dc3545";
                warningMsg.style.color = isWarn ? "#856404" : "#721c24";
                warningTxt.textContent =
                  msg ||
                  (status === 404
                    ? "El turno ya no existe o fue movido. Actualizamos tu lista."
                    : status === 409
                    ? "Este turno ya está asignado a tu suscripción."
                    : "No se pudo reagendar el turno.");
              }
              // Si el turno ya no existe (404), refrescar y cerrar para evitar IDs stale
              if (status === 404) {
                fetchTurnos();
                Swal.close();
              }
              return;
            }

            Swal.fire({
              icon: "error",
              title: "Error",
              text: msg || "No se pudo reagendar el turno.",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
              },
              buttonsStyling: false,
            });
          }
          finally {
            isSubmitting = false;
          }
        });

        btnCerrar.addEventListener("click", () => Swal.close());
      },
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los datos.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
