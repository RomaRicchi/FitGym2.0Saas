import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-egreso.css";

interface EgresoForm {
  concepto: string;
  monto: string;
  fecha: string;
  categoria: string;
  notas: string;
}

export async function mostrarFormNuevoEgreso(): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  const { value: formValues } = await Swal.fire<EgresoForm>({
    title: '<i class="fa-solid fa-money-bill-wave"></i> Nuevo Egreso',
    html: `
      <style>
        #monto::-webkit-outer-spin-button,
        #monto::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        #monto {
          -moz-appearance: textfield;
        }
      </style>
      <form class="swal-form-egreso">
        <div>
          <label class="swal-label">Concepto *</label>
          <input id="concepto" type="text" placeholder="Ej: Pago de alquiler">
        </div>
        <div style="position: relative;">
          <label class="swal-label">Monto *</label>
          <div style="position: relative; display: flex; align-items: center;">
            <span style="
              position: absolute;
              left: 12px;
              top: 50%;
              transform: translateY(-50%);
              color: #666;
              font-weight: 600;
              font-size: 1rem;
              z-index: 1;
            ">$</span>
            <input
              id="monto"
              type="text"
              inputmode="decimal"
              placeholder="0,00"
              style="padding-left: 28px !important;"
            />
          </div>
        </div>
        <div>
          <label class="swal-label">Fecha *</label>
          <input id="fecha" type="date" value="${today}">
        </div>
        <div>
          <label class="swal-label">Categoría</label>
          <select id="categoria">
            <option value="">Seleccionar...</option>
            <option value="Sueldos">Sueldos</option>
            <option value="Alquiler">Alquiler</option>
            <option value="Servicios">Servicios</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Equipamiento">Equipamiento</option>
            <option value="Publicidad">Publicidad</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div>
          <label class="swal-label">Notas</label>
          <textarea id="notas" rows="3" placeholder="Información adicional (opcional)"></textarea>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    customClass: {
      popup: "swal2-card-egreso",
      confirmButton: "btn btn-orange",
      cancelButton: "btn btn-secondary",
    },
    buttonsStyling: false,
    didOpen: () => {
      const montoInput = document.getElementById("monto") as HTMLInputElement;

      // Formatear moneda mientras se escribe
      montoInput?.addEventListener("input", (e) => {
        let value = (e.target as HTMLInputElement).value;

        // Eliminar todo excepto números y coma
        value = value.replace(/[^0-9,]/g, "");

        // Separar parte entera y decimal
        const parts = value.split(",");
        const integerPart = parts[0] || "";
        const decimalPart = parts[1] || "";

        // Limitar decimales a 2 dígitos
        const limitedDecimals = decimalPart.slice(0, 2);

        // Formatear parte entera con puntos de miles
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        // Reconstruir valor
        let finalValue = formattedInteger;
        if (limitedDecimals) {
          finalValue += "," + limitedDecimals;
        } else if (value.endsWith(",")) {
          finalValue += ",";
        }

        (e.target as HTMLInputElement).value = finalValue;
      });
    },

    preConfirm: () => {
      const concepto = (document.getElementById("concepto") as HTMLInputElement)?.value.trim();
      const montoStr = (document.getElementById("monto") as HTMLInputElement)?.value.trim();
      const fecha = (document.getElementById("fecha") as HTMLInputElement)?.value.trim();
      const categoria = (document.getElementById("categoria") as HTMLSelectElement)?.value.trim();
      const notas = (document.getElementById("notas") as HTMLTextAreaElement)?.value.trim();

      if (!concepto || !montoStr || !fecha) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Concepto, Monto y Fecha son obligatorios');
        return false;
      }

      if (concepto.length < 3) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El concepto debe tener al menos 3 caracteres');
        return false;
      }

      // Convertir formato argentino (1.234,56) a número
      const montoNum = parseFloat(montoStr.replace(/\./g, '').replace(',', '.'));
      if (isNaN(montoNum) || montoNum <= 0) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El monto debe ser un número positivo');
        return false;
      }

      if (montoNum > 99999999.99) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El monto máximo es 99.999.999,99');
        return false;
      }

      return { concepto, monto: montoStr, fecha, categoria, notas };
    },
  });

  if (!formValues) return false;

  try {
    const payload = {
      ...formValues,
      monto: parseFloat(formValues.monto.replace(/\./g, '').replace(',', '.')),
    };
    await gymApi.post("/finanzas/egresos", payload);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Egreso registrado',
      text: "El egreso fue guardado correctamente.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-card-egreso",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });

    return true;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al crear egreso";
    const innerMsg = err.response?.data?.innerMessage;

    Swal.fire({
      icon: "error",
      title: "Error",
      text: `${errorMsg}${innerMsg ? `\nDetalle: ${innerMsg}` : ""}`,
      customClass: {
        popup: "swal2-card-egreso",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });
    return false;
  }
}
