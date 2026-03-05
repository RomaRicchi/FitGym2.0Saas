import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

export async function forgotPassword() {
  const { value: email } = await Swal.fire({
    title: "Recuperar contraseña",
    input: "email",
    inputLabel: "Ingresa tu correo registrado",
    inputPlaceholder: "correo@ejemplo.com",
    confirmButtonText: "Enviar enlace",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    preConfirm: (value) => {
      if (!value) Swal.showValidationMessage("El email es obligatorio");
      return value;
    },
  });

  if (email) {
    try {
      await gymApi.post("/auth/forgot-password", { email });
      Swal.fire("Éxito", "Revisa tu correo para continuar.", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo enviar el correo.", "error");
    }
  }
}
