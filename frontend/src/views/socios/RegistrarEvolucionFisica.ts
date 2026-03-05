import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

/**
 * Formulario SweetAlert2 para registrar nueva evolución física
 */
export async function mostrarFormularioEvolucion(socioId: number) {
  const socioIdNum = Number(socioId ?? sessionStorage.getItem("socioId"));
  if (!socioIdNum) {
    await Swal.fire({
      icon: "error",
      title: "No se encontró tu socioId",
      text: "Vuelve a iniciar sesión para continuar.",
      confirmButtonColor: "var(--tenant-primary-color)",
    });
    return { isConfirmed: false };
  }

  const { value: formValues, isConfirmed } = await Swal.fire({
    title: '<i class="fa-solid fa-dumbbell"></i> Nuevo registro físico',
    html: `
      <div class="swal2-grid">
        <div class="swal2-field">
          <label class="form-label fw-bold">Peso (kg)</label>
          <input id="peso" type="number" step="0.01" class="form-control" placeholder="Ej: 75.5">
        </div>
        <div class="swal2-field">
          <label class="form-label fw-bold">Altura (cm)</label>
          <input id="altura" type="number" step="0.1" class="form-control" placeholder="Ej: 175">
        </div>
        <div class="swal2-field">
          <label class="form-label fw-bold">Pecho (cm)</label>
          <input id="pecho" type="number" step="0.1" class="form-control">
        </div>
        <div class="swal2-field">
          <label class="form-label fw-bold">Cintura (cm)</label>
          <input id="cintura" type="number" step="0.1" class="form-control">
        </div>
        <div class="swal2-field">
          <label class="form-label fw-bold">Cadera (cm)</label>
          <input id="cadera" type="number" step="0.1" class="form-control">
        </div>
        <div class="swal2-field">
          <label class="form-label fw-bold">Brazo (cm)</label>
          <input id="brazo" type="number" step="0.1" class="form-control">
        </div>
        <div class="swal2-field">
          <label class="form-label fw-bold">Pierna (cm)</label>
          <input id="pierna" type="number" step="0.1" class="form-control">
        </div>
        <div class="swal2-field">
          <label class="form-label fw-bold">Gemelo (cm)</label>
          <input id="gemelo" type="number" step="0.1" class="form-control">
        </div>
        <div class="swal2-field full-row">
          <label class="form-label fw-bold">Observación</label>
          <textarea id="observacion" class="form-control" rows="2" placeholder="Opcional..."></textarea>
        </div>
      </div>
    `,
    focusConfirm: false,
    width: "min(520px, 92vw)",
    confirmButtonText: "Guardar",
    confirmButtonColor: "var(--tenant-primary-color)",
    customClass: {
      popup: "swal-evolucion-popup",
      confirmButton: "btn-evolucion-confirm",
    },
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const peso = parseFloat((document.getElementById("peso") as HTMLInputElement).value);
      const altura = parseFloat((document.getElementById("altura") as HTMLInputElement).value);

      if (isNaN(peso) || isNaN(altura)) {
        Swal.showValidationMessage("Debe ingresar peso y altura válidos");
        return null;
      }

      const pecho = parseFloat((document.getElementById("pecho") as HTMLInputElement).value) || null;
      const cintura = parseFloat((document.getElementById("cintura") as HTMLInputElement).value) || null;
      const cadera = parseFloat((document.getElementById("cadera") as HTMLInputElement).value) || null;
      const brazo = parseFloat((document.getElementById("brazo") as HTMLInputElement).value) || null;
      const pierna = parseFloat((document.getElementById("pierna") as HTMLInputElement).value) || null;
      const gemelo = parseFloat((document.getElementById("gemelo") as HTMLInputElement).value) || null;
      const observacion = (document.getElementById("observacion") as HTMLTextAreaElement).value || null;

      return { peso, altura, pecho, cintura, cadera, brazo, pierna, gemelo, observacion };
    },
  });

  if (isConfirmed && formValues) {
    try {
      await gymApi.post("/evolucionfisica", {
        socioId: socioIdNum,
        ...formValues,
      });

      await Swal.fire({
        icon: "success",
        title: "Registro guardado",
        text: "Se agregó la evolución física correctamente",
        confirmButtonColor: "var(--tenant-primary-color)",
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const detalle = error?.response?.data?.message || error?.message || "Error desconocido";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: status === 403 ? "No tenés permisos o tu sesión expiró. Reingresá e intenta de nuevo." : detalle,
        confirmButtonColor: "var(--tenant-primary-color)",
      });
    }
  }

  return { isConfirmed };
}
