import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-card.css";

export async function CheckinSwal(
  socioId: number,
  turnoPlantillaId: number,
  socioNombre: string,
  onSuccess?: () => void
) {
  try {
    const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
    const profesorId = usuario?.personalId || null;

    const { value: observaciones } = await Swal.fire({
      title: `<i class="fa-solid fa-user-check"></i> <strong>Check-in de ${socioNombre}</strong>`,
      html: `
        <p class="mb-2">Podés dejar observaciones sobre el desempeño del alumno:</p>
        <textarea id="obsInput" class="swal2-textarea" rows="4"
          placeholder="Ejemplo: Buena técnica en sentadillas, mejorar postura en press militar."></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar asistencia",
      cancelButtonText: "Cancelar",
      background: "#ffa940",
      color: "#222",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange mx-2",
        cancelButton: "btn btn-secondary mx-2",
      },
      buttonsStyling: false,
      focusConfirm: false,
      preConfirm: () => {
        const obs = (document.getElementById("obsInput") as HTMLTextAreaElement)
          ?.value;
        return obs?.trim() || null;
      },
    });

    if (observaciones === undefined) return;

    Swal.fire({
      title: "Guardando asistencia...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      background: "#ffa940",
      showConfirmButton: false,
    });

    await gymApi.post("/checkins", {
      socioId,
      turnoPlantillaId,
      profesorId,
      observaciones,
    });

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Check-in registrado',
      text: observaciones
        ? "Asistencia guardada con observaciones."
        : "Asistencia registrada correctamente.",
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
      text: error.response?.data?.message || "No se pudo registrar el check-in.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
