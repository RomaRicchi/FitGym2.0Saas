import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-planes.css";

export async function PlanCreateSwal(onSuccess?: () => void) {
  // Cargar salas disponibles antes de mostrar el modal
  let salas: any[] = [];
  try {
    const { data } = await gymApi.get("/salas");
    salas = data.items || data || [];
  } catch {
    Swal.fire("Error", "No se pudieron cargar las salas disponibles.", "error");
    return;
  }

  if (!Array.isArray(salas) || salas.length === 0) {
    Swal.fire("Aviso", "No hay salas creadas. Creá una sala antes de generar un plan.", "warning");
    return;
  }

  const opcionesSalas = salas
    .map((s: any) => `<option value="${s.id}">${s.nombre}</option>`)
    .join("");

  const { value: formValues } = await Swal.fire({
    title: '<i class="fa-solid fa-plus"></i> Nuevo Plan',
    html: `
      <form class="swal-form-main" id="form-crear-plan" style="text-align:left;overflow-x:hidden;margin-top:0.5rem;">
        <div style="margin-bottom:0.8rem;">
          <label for="nombre" style="display:block;font-weight:600;color:#222;margin-bottom:0.3rem;">Nombre</label>
          <input id="nombre" type="text" placeholder="Ej: Plan mensual"
            style="width:100%;background:#fff;color:#222;border:1px solid #ccc;border-radius:6px;
                   padding:0.7rem 1rem;font-size:1rem;box-sizing:border-box;">
        </div>

        <div style="margin-bottom:0.8rem;">
          <label for="dias_por_semana" style="display:block;font-weight:600;color:#222;margin-bottom:0.3rem;">
            Días por semana <span style="color:#d32f2f;">*</span>
          </label>
          <select id="dias_por_semana"
            style="width:100%;background:#fff;color:#222;border:1px solid #ccc;border-radius:6px;
                   padding:0.7rem 1rem;font-size:1rem;box-sizing:border-box;">
            <option value="">Seleccionar días...</option>
            <option value="2">2 días por semana</option>
            <option value="3">3 días por semana</option>
            <option value="5">5 días por semana</option>
            <option value="7">7 días por semana</option>
          </select>
          <small style="color:#666;font-size:0.85rem;">Opciones: 2, 3, 5 o 7 días</small>
        </div>

        <div style="margin-bottom:0.8rem;">
          <label for="precio" style="display:block;font-weight:600;color:#222;margin-bottom:0.3rem;">Precio</label>
          <input id="precio" type="number" min="0" step="0.01" placeholder="10000"
            style="width:100%;background:#fff;color:#222;border:1px solid #ccc;border-radius:6px;
                   padding:0.7rem 1rem;font-size:1rem;box-sizing:border-box;">
        </div>

        <div style="margin-bottom:0.8rem;">
          <label for="sala_id" style="display:block;font-weight:600;color:#222;margin-bottom:0.3rem;">
            Sala obligatoria <span style="color:#d32f2f;">*</span>
          </label>
          <select id="sala_id"
            style="width:100%;background:#fff;color:#222;border:1px solid #ccc;border-radius:6px;
                   padding:0.7rem 1rem;font-size:1rem;box-sizing:border-box;">
            <option value="">Seleccionar sala...</option>
            ${opcionesSalas}
          </select>
          <small style="color:#666;font-size:0.85rem;">El plan solo podrá usarse en esta sala</small>
        </div>

        <div
          style="
            display:flex;
            align-items:center;
            gap:0.6rem;
            margin-top:0.8rem;
            white-space:nowrap;
            width:fit-content;
          "
        >
          <input
            type="checkbox"
            id="activo"
            checked
            style="transform: scale(1.3); accent-color:var(--tenant-primary-color); cursor:pointer; margin:0;"
          >
          <label
            for="activo"
            style="font-weight:600;color:#222;margin:0;line-height:1;"
          >
            Activo
          </label>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: " Guardar",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    customClass: {
      popup: "swal2-card-main",
      confirmButton: "btn btn-orange",
      cancelButton: "btn btn-secondary",
    },
    buttonsStyling: false,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.overflowX = "hidden";
        popup.style.maxWidth = "520px";
        popup.style.textAlign = "left";
      }

      const htmlContainer = popup?.querySelector(".swal2-html-container") as HTMLElement;
      if (htmlContainer) {
        htmlContainer.style.width = "100%";
        htmlContainer.style.maxWidth = "none";
        htmlContainer.style.display = "block";
        htmlContainer.style.textAlign = "left";
      }

      document.querySelectorAll<HTMLInputElement>("#form-crear-plan input").forEach((input) => {
        input.classList.remove("swal2-input");
        input.style.width = "100%";
        input.style.margin = "0.3rem 0";
        input.style.display = "block";
        input.style.boxSizing = "border-box";
        input.style.maxWidth = "none";
        input.style.fontSize = "1rem";
        input.style.padding = "0.7rem 1rem";
      });
    },

    preConfirm: () => {
      const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
      const dias_por_semana = (document.getElementById("dias_por_semana") as HTMLSelectElement).value;
      const precio = (document.getElementById("precio") as HTMLInputElement).value;
      const sala_id = (document.getElementById("sala_id") as HTMLSelectElement).value;
      const activo = (document.getElementById("activo") as HTMLInputElement).checked;

      if (!nombre) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El nombre es obligatorio');
        return false;
      }

      if (!dias_por_semana) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debe seleccionar los días por semana');
        return false;
      }

      if (!precio || parseFloat(precio) <= 0) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El precio debe ser mayor a 0');
        return false;
      }

      if (!sala_id) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debes elegir una sala obligatoria');
        return false;
      }

      return {
        nombre,
        diasPorSemana: parseInt(dias_por_semana),
        precio: parseFloat(precio),
        activo,
        salaId: parseInt(sala_id),
      };
    },
  });

  if (formValues) {
    try {
      const res = await gymApi.post("/planes", {
        nombre: formValues.nombre,
        diasPorSemana: formValues.diasPorSemana,
        precio: formValues.precio,
        activo: formValues.activo,
      });

      const creado = res.data?.data ?? res.data ?? {};
      const planId = creado.id ?? creado.Id ?? creado.planId ?? creado.PlanId;
      if (!planId) throw new Error("No se pudo obtener el ID del plan creado");

      await gymApi.put(`/planes/${planId}/salas`, { salaIds: [formValues.salaId] });

      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check"></i> Plan creado',
        text: "El nuevo plan se guardó y se asoció a la sala seleccionada.",
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
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el plan",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });
    }
  }
}




