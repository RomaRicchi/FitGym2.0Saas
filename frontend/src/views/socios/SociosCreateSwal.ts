import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-socio.css";

interface SocioForm {
  dni: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  activo: boolean;
}

export async function mostrarFormNuevoSocio(): Promise<boolean> {
  const { value: formValues } = await Swal.fire<SocioForm>({
    title:
      '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-user-plus me-2"></i>Nuevo Socio</h2>',
    html: `
      <form class="swal-form-socio">
        <div>
          <label class="swal-label">DNI</label>
          <input id="dni" type="text" placeholder="Ingrese DNI">
        </div>
        <div>
          <label class="swal-label">Nombre</label>
          <input id="nombre" type="text" placeholder="Ingrese nombre">
        </div>
        <div>
          <label class="swal-label">Email</label>
          <input id="email" type="email" placeholder="Ingrese email">
        </div>
        <div>
          <label class="swal-label">Fecha de nacimiento <span style="color: #dc3545;">*</span></label>
          <input id="fechaNacimiento" type="date" class="swal-input">
        </div>
        <div>
          <label class="swal-label">Teléfono</label>
          <input id="telefono" type="text" placeholder="Ingrese teléfono">
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="activo" checked class="swal-checkbox">
          <label for="activo" class="swal-label">Activo</label>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    customClass: {
      popup: "swal2-card-socio",
      confirmButton: "btn btn-orange",
      cancelButton: "btn btn-secondary",
    },
    buttonsStyling: false,

    preConfirm: () => {
      const dni = (document.getElementById("dni") as HTMLInputElement)?.value.trim();
      const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
      const email = (document.getElementById("email") as HTMLInputElement)?.value.trim();
      const telefono = (document.getElementById("telefono") as HTMLInputElement)?.value.trim();
      const fechaNacimiento = (document.getElementById("fechaNacimiento") as HTMLInputElement)?.value;
      const activo = (document.getElementById("activo") as HTMLInputElement)?.checked ?? true;

      if (!dni || !nombre || !email) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> DNI, Nombre y Email son obligatorios');
        return false;
      }

      if (!fechaNacimiento) {
        Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> La fecha de nacimiento es obligatoria');
        return false;
      }

      return { dni, nombre, email, telefono, fechaNacimiento, activo };
    },
  });

  if (!formValues) return false;

  try {
    await gymApi.post("/socios", formValues);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Socio creado',
      text: "El socio fue registrado correctamente.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-card-socio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });

    return true;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo registrar el socio. Verifique los datos.",
      customClass: {
        popup: "swal2-card-socio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
    return false;
  }
}
