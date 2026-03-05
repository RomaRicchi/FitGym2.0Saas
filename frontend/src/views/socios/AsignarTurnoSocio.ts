// ✅ asignarTurnos.ts — versión final conectada a estilos externos
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/asignarTurnos.css"; 

export async function asignarTurnos(suscripcion: any, onClose?: () => void) {
  try {
    // 🧠 1️⃣ Obtener información del plan
    let planData = null;

    if (suscripcion.plan_id || suscripcion.PlanId) {
      const { data } = await gymApi.get(`/planes/${suscripcion.plan_id || suscripcion.PlanId}`);
      planData = data;
    } else if (suscripcion.plan?.id) {
      planData = suscripcion.plan;
    } else if (suscripcion.plan) {
      const { data } = await gymApi.get("/planes");
      const planes = data.items || data;
      planData = planes.find(
        (p: any) => p.nombre?.toLowerCase() === suscripcion.plan.toLowerCase()
      );
    }

    if (!planData) {
      Swal.fire("Error", "No se pudo obtener la información del plan.", "error");
      return;
    }

    // 🧩 2️⃣ Datos base
    const socioNombre =
      suscripcion.socio?.nombre ||
      suscripcion.Socio?.Nombre ||
      suscripcion.socio ||
      "(Socio actual)";
    const planNombre = planData.nombre;
    const diasPorSemana =
      planData.diasPorSemana || planData.dias_por_semana || 1;

    // 📅 3️⃣ Días
    const { data: diasRes } = await gymApi.get("/diasemana");
    const dias = diasRes.items || diasRes;

    // 🔍 4️⃣ Turnos asignados
    const { data: asignadosRes } = await gymApi.get(
      `/suscripcionturno/suscripcion/${suscripcion.id}`
    );
    const turnosAsignados = asignadosRes.map((t: any) => t.turnoPlantillaId);

    // 🧩 5️⃣ HTML
    const gruposHtml = Array.from({ length: diasPorSemana }, (_, i) => `
      <div class="turno-grupo">
        <h6>🗓️ Día ${i + 1}</h6>
        <label><b>Seleccionar día</b></label>
        <select id="dia-${i}" class="turno-input">
          <option value="">-- Seleccioná un día --</option>
          ${dias.map((d: any) => `<option value="${d.id}">${d.nombre}</option>`).join("")}
        </select>

        <label><b>Turno disponible</b></label>
        <select id="turno-${i}" class="turno-input">
          <option value="">Seleccione un día primero</option>
        </select>

        <button id="btn-save-${i}" class="turno-btn">💾 Guardar turno</button>
      </div>
    `).join("");

    // 🪄 6️⃣ Modal principal
    await Swal.fire({
      title: "➕ Asignar Turnos",
      width: 620,
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      customClass: { popup: "swal2-card-style" },
      html: `
        <div class="turnos-modal">
          <p><strong>Socio:</strong> ${socioNombre}</p>
          <p><strong>Plan:</strong> ${planNombre}</p>
          <p><strong>Días por semana:</strong> ${diasPorSemana}</p>
          <hr/>
          ${gruposHtml}
        </div>
      `,
      didOpen: () => {
        for (let i = 0; i < diasPorSemana; i++) {
          const diaSelect = document.getElementById(`dia-${i}`) as HTMLSelectElement;
          const turnoSelect = document.getElementById(`turno-${i}`) as HTMLSelectElement;
          const btnSave = document.getElementById(`btn-save-${i}`) as HTMLButtonElement;

          // 📅 Cargar turnos por día
          diaSelect.addEventListener("change", async () => {
            const diaId = diaSelect.value;
            if (!diaId) return;
            turnoSelect.innerHTML = `<option>Cargando...</option>`;
            try {
              const { data } = await gymApi.get(`/turnosplantilla/dia/${diaId}`);
              const turnos = data.items || data;
              const disponibles = turnos.filter((t: any) => !turnosAsignados.includes(t.id ?? t.Id));

              turnoSelect.innerHTML = disponibles.length
                ? disponibles.map((t: any) => {
                    const id = t.id ?? t.Id;
                    const hora = t.horaInicio ?? t.HoraInicio ?? "--:--";
                    const dur = t.duracionMin ?? t.DuracionMin ?? "?";
                    const sala = t.sala?.nombre ?? t.Sala?.Nombre ?? "Sala";
                    const profe = t.profesor ?? t.personal?.nombre ?? t.Personal?.Nombre ?? "Profesor";
                    const cupoDisp = t.sala?.cupoDisponible ?? t.Sala?.CupoDisponible ?? "?";
                    const cupoTot = t.sala?.cupoTotal ?? t.Sala?.CupoTotal ?? "?";

                    return `<option value="${id}">
                      ${hora} hs - ${profe} (${sala}) | Cupo: ${cupoDisp}/${cupoTot}
                    </option>`;
                  }).join("")
                : `<option>No hay turnos disponibles</option>`;
            } catch (err) {
              turnoSelect.innerHTML = `<option>Error al cargar turnos</option>`;
            }
          });

          // 💾 Guardar turno
          btnSave.addEventListener("click", async () => {
            const turnoId = parseInt(turnoSelect.value || "0", 10);
            if (!turnoId) {
              Swal.fire("⚠️ Atención", "Seleccioná un turno válido", "warning");
              return;
            }

            try {
              await gymApi.post("/suscripcionturno", {
                suscripcionId: suscripcion.id,
                turnoPlantillaId: turnoId,
              });
              btnSave.textContent = "✅ Guardado";
              btnSave.classList.add("guardado");
              btnSave.disabled = true;
            } catch (error: any) {
              const msg = error.response?.data?.message;
              Swal.fire({
                icon: "error",
                title: "Error",
                text: msg || "No se pudo guardar el turno seleccionado.",
                confirmButtonColor: "#ff6600",
              });
            }
          });
        }
      },
    }).then(() => onClose && onClose());
  } catch (err) {
    console.error("Error global en asignarTurnos:", err);
    Swal.fire("Error", "No se pudieron cargar los datos del plan o turnos.", "error");
  }
}
