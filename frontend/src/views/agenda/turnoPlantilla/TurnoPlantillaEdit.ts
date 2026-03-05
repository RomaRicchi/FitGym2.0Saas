import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

export async function editarTurnoPlantilla(id: number, onSuccess?: () => void) {
  try {
    const [
      resTurno,
      resSalas,
      resPersonal,
      resDias,
    ] = await Promise.all([
      gymApi.get(`/turnosplantilla/${id}`),
      gymApi.get("/salas"),
      gymApi.get("/personal"),
      gymApi.get("/diassemana"),
    ]);

    // Backend response comes wrapped in ApiResponse
    const turno = resTurno.data?.data ?? resTurno.data;
    const salas = resSalas.data?.items ?? resSalas.data;
    const todosProfesores = resPersonal.data?.items ?? resPersonal.data;
    // Filtrar solo personal con rol "Profesor"
    const personal = todosProfesores.filter((p: any) => p.rol === "Profesor");
    const dias = (resDias.data?.items ?? resDias.data) || [
      { id: 1, nombre: "Lunes" },
      { id: 2, nombre: "Martes" },
      { id: 3, nombre: "Miércoles" },
      { id: 4, nombre: "Jueves" },
      { id: 5, nombre: "Viernes" },
      { id: 6, nombre: "Sábado" },
      { id: 7, nombre: "Domingo" },
    ];

    const orangeStyle = "border-color: var(--tenant-primary-color); border-width: 2px;";

    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-pen-to-square"></i> Editar Turno',
      width: 650,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
      html: `
        <div class="container-fluid text-start">
          <div class="row">
            <div class="col-12">
              <label for="SalaId">Sala</label>
              <select id="SalaId" class="form-select" style="${orangeStyle}">
                ${salas
                  .map(
                    (s: any) =>
                      `<option value="${s.id}" ${
                        s.id === turno.salaId ? "selected" : ""
                      }>${s.nombre}</option>`
                  )
                  .join("")}
              </select>
            </div>
          </div>

          <div class="row mt-2">
            <div class="col-12">
              <label for="PersonalId">Profesor</label>
              <select id="PersonalId" class="form-select" style="${orangeStyle}">
                ${personal
                  .map(
                    (p: any) =>
                      `<option value="${p.id}" ${
                        p.id === turno.personalId ? "selected" : ""
                      }>${p.nombre}</option>`
                  )
                  .join("")}
              </select>
            </div>
          </div>

          <div class="row mt-2">
            <div class="col-md-6">
              <label for="DiaSemanaId">Día</label>
              <select id="DiaSemanaId" class="form-select" style="${orangeStyle}">
                ${dias
                  .map(
                    (d: any) =>
                      `<option value="${d.id}" ${
                        d.id === turno.diaSemanaId ? "selected" : ""
                      }>${d.nombre}</option>`
                  )
                  .join("")}
              </select>
            </div>
            <div class="col-md-6">
              <label for="HoraInicio">Hora Inicio</label>
              <input
                id="HoraInicio"
                type="time"
                class="form-control"
                style="${orangeStyle}"
                value="${turno.horaInicio?.substring(0, 5) || ""}"
              />
            </div>
          </div>

          <div class="row mt-2">
            <div class="col-md-6">
              <label for="DuracionMin">Duración (min)</label>
              <input
                id="DuracionMin"
                type="number"
                min="10"
                class="form-control"
                style="${orangeStyle}"
                value="${turno.duracionMin || 60}"
              />
            </div>
            <div class="col-md-6 d-flex align-items-center" style="padding-left: 0;">
              <input id="Activo" type="checkbox" ${turno.activo ? "checked" : ""} style="width: 18px; height: 18px; transform: scale(1.3); accent-color: var(--tenant-primary-color); cursor: pointer; margin: 0;" />
              <label for="Activo" style="margin-left: 8px; margin-bottom: 0; cursor: pointer; white-space: nowrap;">Activo</label>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: " Guardar cambios",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const data = {
          SalaId: Number(
            (document.getElementById("SalaId") as HTMLSelectElement).value
          ),
          PersonalId: Number(
            (document.getElementById("PersonalId") as HTMLSelectElement).value
          ),
          DiaSemanaId: Number(
            (document.getElementById("DiaSemanaId") as HTMLSelectElement).value
          ),
          HoraInicio:
            (document.getElementById("HoraInicio") as HTMLInputElement).value +
            ":00",
          DuracionMin: Number(
            (document.getElementById("DuracionMin") as HTMLInputElement).value
          ),
          Activo: (document.getElementById("Activo") as HTMLInputElement).checked,
        };

        if (!data.SalaId || !data.PersonalId || !data.DiaSemanaId)
          return Swal.showValidationMessage(
            '<i class="fa-solid fa-triangle-exclamation"></i> Complete todos los campos obligatorios'
          );
        if (!data.HoraInicio)
          return Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debe especificar la hora de inicio');
        if (data.DuracionMin <= 0)
          return Swal.showValidationMessage(
            '<i class="fa-solid fa-triangle-exclamation"></i> La duración debe ser mayor que 0'
          );

        return data;
      },
    });

    if (!formValues) return;

    await gymApi.put(`/turnosplantilla/${id}`, formValues);
    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Actualizado',
      text: "El turno fue modificado correctamente",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    onSuccess?.();
  } catch (err: any) {
    const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "No se pudo editar el turno";
    Swal.fire({
      icon: "error",
      title: '<i class="fa-solid fa-circle-xmark"></i> Error',
      text: msg,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}




