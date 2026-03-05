import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

export async function handleRegistroSocio() {
  try {
    const { value: socioForm } = await Swal.fire({
      title: `<div class="fw-bold" style="font-size:0.7rem;color:var(--tenant-primary-color);display:flex;align-items:center;justify-content:center;gap:8px;">
                <i class="fa-solid fa-person-weight-lift"></i> Registro de Socio
              </div>`,
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;">
          <div style="width:90%;text-align:left;">
            <label style="font-weight:600;color:#fff;">Nombre completo</label>
            <input id="s-nombre" class="swal2-input" type="text" placeholder="Ej: Juan Pérez"
              style="width:100%;background:#fff;border:none;border-radius:8px;color:#333;margin:6px 0;" />
          </div>
          <div style="width:90%;text-align:left;">
            <label style="font-weight:600;color:#fff;">DNI</label>
            <input id="s-dni" class="swal2-input" type="text" placeholder="Ej: 40123456"
              style="width:100%;background:#fff;border:none;border-radius:8px;color:#333;margin:6px 0;" />
          </div>
          <div style="width:90%;text-align:left;">
            <label style="font-weight:600;color:#fff;">Fecha de nacimiento</label>
            <input id="s-fecha" class="swal2-input" type="date"
              style="width:100%;background:#fff;border:none;border-radius:8px;color:#333;margin:6px 0;" />
          </div>
          <div style="width:90%;text-align:left;">
            <label style="font-weight:600;color:#fff;">Correo electrónico</label>
            <input id="s-email" class="swal2-input" type="email" placeholder="correo@ejemplo.com"
              style="width:100%;background:#fff;border:none;border-radius:8px;color:#333;margin:6px 0;" />
          </div>
          <div style="width:90%;text-align:left;">
            <label style="font-weight:600;color:#fff;">Teléfono (opcional)</label>
            <input id="s-telefono" class="swal2-input" type="text" placeholder="Ej: 2664000000"
              style="width:100%;background:#fff;border:none;border-radius:8px;color:#333;margin:6px 0;" />
          </div>
        </div>
      `,
      background: "var(--tenant-primary-color)",
      color: "#fff",
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      focusConfirm: false,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const nombre = (document.getElementById("s-nombre") as HTMLInputElement).value.trim();
        const dni = (document.getElementById("s-dni") as HTMLInputElement).value.trim();
        const email = (document.getElementById("s-email") as HTMLInputElement).value.trim();
        const telefono = (document.getElementById("s-telefono") as HTMLInputElement).value.trim();
        const fechaNacimiento = (document.getElementById("s-fecha") as HTMLInputElement).value;

        if (!nombre || !dni || !email) {
          Swal.showValidationMessage("<!-- EMOJI_REPLACED --> Complete los campos obligatorios: nombre, DNI y email");
          return false;
        }
        if (!fechaNacimiento) {
          Swal.showValidationMessage("<!-- EMOJI_REPLACED --> La fecha de nacimiento es obligatoria");
          return false;
        }
        return { nombre, dni, email, telefono, fechaNacimiento };
      },
    });

    if (!socioForm) return;

    Swal.fire({
      title: "Registrando socio...",
      background: "var(--tenant-primary-color)",
      color: "#fff",
      didOpen: () => Swal.showLoading(),
      showConfirmButton: false,
    });

    const socioRes = await gymApi.post("/socios/registro-publico", {
      nombre: socioForm.nombre,
      dni: socioForm.dni,
      email: socioForm.email,
      telefono: socioForm.telefono || null,
      fechaNacimiento: socioForm.fechaNacimiento,
    });

    const socioId = socioRes.data.id;
    Swal.close();

    const { value: userForm } = await Swal.fire({
      title: `<div class="fw-bold" style="font-size:0.65rem;color:var(--tenant-primary-color);"><!-- EMOJI_REPLACED --> Crear cuenta de acceso</div>`,
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;">
          <div style="width:90%;text-align:left;">
            <label style="font-weight:600;color:#fff;">Alias de usuario</label>
            <input id="u-alias" class="swal2-input" placeholder="Ej: juanp"
              style="width:100%;background:#fff;border:none;border-radius:8px;color:#333;margin:6px 0;" />
          </div>
          <div style="width:90%;text-align:left;">
            <label style="font-weight:600;color:#fff;">Contraseña</label>
            <input id="u-password" type="password" class="swal2-input" placeholder="********"
              style="width:100%;background:#fff;border:none;border-radius:8px;color:#333;margin:6px 0;" />
          </div>
        </div>
      `,
      background: "var(--tenant-primary-color)",
      color: "#fff",
      confirmButtonText: "Crear cuenta",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const alias = (document.getElementById("u-alias") as HTMLInputElement).value.trim();
        const password = (document.getElementById("u-password") as HTMLInputElement).value.trim();
        if (!alias || !password) {
          Swal.showValidationMessage("<!-- EMOJI_REPLACED --> Complete alias y contraseña");
          return false;
        }
        return { alias, password };
      },
    });

    if (!userForm) return;

    Swal.fire({
      title: "Creando usuario...",
      background: "var(--tenant-primary-color)",
      color: "#fff",
      didOpen: () => Swal.showLoading(),
      showConfirmButton: false,
    });

    await gymApi.post("/auth/register", {
      email: socioForm.email,
      alias: userForm.alias,
      password: userForm.password,
      socioId,
    });

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Registro completado',
      text: "¡Tu cuenta fue creada exitosamente! Ya podés iniciar sesión.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      background: "var(--tenant-primary-color)",
      color: "#fff",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data || err?.message || "No se pudo completar el registro";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMsg,
      background: "var(--tenant-primary-color)",
      color: "#fff",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
