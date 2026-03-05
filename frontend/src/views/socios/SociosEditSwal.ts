import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-socio.css"; // ✅ usa el CSS exclusivo para socios

interface SocioForm {
  dni: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  activo: boolean;
}

export async function mostrarFormEditarSocio(id: number): Promise<boolean> {
  try {
    const { data: socio } = await gymApi.get(`/socios/${id}`);

    const { value: formValues } = await Swal.fire<SocioForm>({
      title:
        '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-pen me-2"></i>Editar Socio</h2>',
      html: `
        <form class="swal-form-socio">
          <div>
            <label class="swal-label">DNI</label>
            <input id="dni" type="text" value="${socio.dni || ""}" placeholder="Ingrese DNI">
          </div>

          <div>
            <label class="swal-label">Nombre</label>
            <input id="nombre" type="text" value="${socio.nombre || ""}" placeholder="Ingrese nombre">
          </div>

          <div>
            <label class="swal-label">Email</label>
            <input id="email" type="email" value="${socio.email || ""}" placeholder="Ingrese email">
          </div>

          <div>
            <label class="swal-label">Fecha de nacimiento <span style="color: #dc3545;">*</span></label>
            <input id="fechaNacimiento" type="date" class="swal-input" value="${socio.fechaNacimiento ? socio.fechaNacimiento.split('T')[0] : ''}">
          </div>

          <div>
            <label class="swal-label">Teléfono</label>
            <input id="telefono" type="text" value="${socio.telefono || ""}" placeholder="Ingrese teléfono">
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="activo" class="swal-checkbox" ${socio.activo ? "checked" : ""}>
            <label for="activo" class="swal-label">Activo</label>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar Cambios",
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

    await gymApi.put(`/socios/${id}`, formValues);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Cambios guardados',
      text: "El socio fue actualizado correctamente.",
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
      text: "No se pudo actualizar el socio.",
      customClass: {
        popup: "swal2-card-socio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
    return false;
  }
}
