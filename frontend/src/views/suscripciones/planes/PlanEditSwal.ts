import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-planes.css";

export async function PlanEditSwal(id: string, onSuccess?: () => void) {
  try {
    const salasRes = await gymApi.get("/salas");
    const salas = salasRes.data.items || salasRes.data || [];

    if (!Array.isArray(salas) || salas.length === 0) {
      await Swal.fire("Aviso", "No hay salas creadas. Crea una sala antes de editar el plan.", "warning");
      return;
    }

    const res = await gymApi.get(`/planes/${id}`);
    const data = res.data;
    const opcionesSalas = salas
      .map(
        (s: any) =>
          `<option value="${s.id}" ${
            s.id === (data.salaId || data.sala_id) ? "selected" : ""
          }>${s.nombre}</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: '<i class="fas fa-edit"></i> Editar Plan',
      html: `
        <form class="swal-form-main" id="form-editar-plan" style="text-align:left;overflow-x:hidden;margin-top:0.5rem;">
          <div style="margin-bottom:0.8rem;">
            <label for="nombre" style="display:block;font-weight:600;color:#222;margin-bottom:0.3rem;">Nombre</label>
            <input id="nombre" type="text" value="${data.nombre || ""}" placeholder="Ingrese nombre"
              style="width:100%;background:#fff;color:#222;border:1px solid #ccc;border-radius:6px;
                     padding:0.7rem 1rem;font-size:1rem;box-sizing:border-box;">
          </div>

          <div style="margin-bottom:0.8rem;">
            <label for="dias_por_semana" style="display:block;font-weight:600;color:#222;margin-bottom:0.3rem;">Días por semana</label>
            <select id="dias_por_semana"
              style="width:100%;background:#fff;color:#222;border:1px solid #ccc;border-radius:6px;
                     padding:0.7rem 1rem;font-size:1rem;box-sizing:border-box;">
              <option value="">Seleccionar días...</option>
              <option value="2" ${data.dias_por_semana === 2 ? "selected" : ""}>2 días por semana</option>
              <option value="3" ${data.dias_por_semana === 3 ? "selected" : ""}>3 días por semana</option>
              <option value="5" ${data.dias_por_semana === 5 ? "selected" : ""}>5 días por semana</option>
              <option value="7" ${data.dias_por_semana === 7 ? "selected" : ""}>7 días por semana</option>
            </select>
          </div>

          <div style="margin-bottom:0.8rem;">
            <label for="precio" style="display:block;font-weight:600;color:#222;margin-bottom:0.3rem;">Precio</label>
            <input id="precio" type="number" value="${data.precio || 0}" min="0" step="0.01" placeholder="Ingrese precio"
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
              ${data.activo ? "checked" : ""}
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
      confirmButtonText: '<i class="fas fa-save"></i> Guardar cambios',
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

        // Forzar ancho completo en todos los inputs
        const htmlContainer = popup?.querySelector(".swal2-html-container") as HTMLElement;
        if (htmlContainer) {
          htmlContainer.style.width = "100%";
          htmlContainer.style.maxWidth = "none";
          htmlContainer.style.display = "block";
          htmlContainer.style.textAlign = "left";
        }

        document.querySelectorAll<HTMLInputElement>("#form-editar-plan input").forEach((input) => {
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

        if (!nombre || !precio) {
          Swal.showValidationMessage('<i class="fas fa-exclamation-triangle"></i> Debe ingresar un nombre y un precio válidos');
          return false;
        }

        if (!sala_id) {
          Swal.showValidationMessage('<i class="fas fa-exclamation-triangle"></i> Debe seleccionar una sala obligatoria');
          return false;
        }

        const diasSemana = parseInt(dias_por_semana);

        // Validar que días por semana sea un valor permitido
        if (![2, 3, 5, 7].includes(diasSemana)) {
          Swal.showValidationMessage('<i class="fas fa-exclamation-triangle"></i> Días por semana debe ser 2, 3, 5 o 7');
          return false;
        }

        return { nombre, dias_por_semana: diasSemana, precio, activo, salaId: parseInt(sala_id) };
      },
    });

    if (formValues) {
      await gymApi.put(`/planes/${id}`, {
        nombre: formValues.nombre,
        diasPorSemana: formValues.dias_por_semana,
        precio: parseFloat(formValues.precio),
        activo: formValues.activo,
      });

      await gymApi.put(`/planes/${id}/salas`, { salaIds: [formValues.salaId] });

      await Swal.fire({
        icon: "success",
        title: '<i class="fas fa-check-circle"></i> Plan actualizado',
        text: "Los cambios fueron guardados y se actualizó la sala permitida.",
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
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cargar o actualizar el plan",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
  }
}


