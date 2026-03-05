import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-ejercicio.css";

type UsuarioTarget = {
  personalId?: number;
  socioId?: number;
  nombre?: string;
  email?: string;
  onSuccess?: () => void;
  rol?: string; // Rol del usuario actual
  standalone?: boolean; // Si es true, permite crear usuario sin personal/socio
};

export async function UsuarioCreateSwal({
  personalId,
  socioId,
  nombre,
  email,
  onSuccess,
  rol,
  standalone = false,
}: UsuarioTarget) {
  const targetId = personalId ?? socioId;
  const targetLabel = personalId ? "Personal" : "Socio";

  // Solo mostrar error si no está en modo standalone y no hay targetId
  if (!standalone && !targetId) {
    await Swal.fire({
      icon: "info",
      title: '<i class="fa-solid fa-triangle-exclamation"></i> Creación de Usuario',
      text: "Para crear un usuario de login, primero seleccione un Personal o Socio válido desde su respectiva lista.",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
    return false;
  }

  let roles: { id: number; nombre: string }[] = [];
  try {
    const res = await gymApi.get("/roles");
    roles = res.data.items || res.data;
  } catch {
    // Error silencioso al cargar roles
  }

  // Si es socio, filtramos para obtener solo el rol "Socio" (id 4)
  const rolSocioId = 4; // Según el enum RolType.Socio = 4
  const esSocio = !!socioId;

  // Si es personal, filtramos para EXCLUIR el rol "Socio"
  const rolesDisponibles = esSocio
    ? roles.filter(r => r.id === rolSocioId)
    : roles.filter(r => r.id !== rolSocioId);

  // Verificar si ya existe un usuario con ese email
  let usuarioExistente: any = null;
  // En modo standalone, verificaremos el email después de que el usuario lo ingrese
  // En modo asociado, verificamos si tenemos el email de antemano
  if (!standalone && email) {
    try {
      const res = await gymApi.get(`/usuarios/email/${encodeURIComponent(email)}`);
      usuarioExistente = res.data;
    } catch (err) {
      // Email no existe, continuar con creación normal
      console.log("Email no registrado, se creará nuevo usuario");
    }
  }

  // Si ya existe un usuario con ese email, mostrar mensaje
  if (usuarioExistente) {
    await Swal.fire({
      icon: "info",
      title: '<i class="fa-solid fa-lock"></i> Usuario Existente',
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 12px;">Ya existe un usuario con el email <strong>${email}</strong></p>
          <p style="color: #666; font-size: 0.95rem;">El usuario puede gestionar su contraseña y perfil desde su propia cuenta.</p>
          ${rol === "Administrador" ? '<p style="margin-top: 12px; color: var(--tenant-primary-color); font-size: 0.9rem;">Si necesita dar de baja a este usuario, puede hacerlo desde la lista de usuarios.</p>' : ''}
        </div>
      `,
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
      confirmButtonText: "Entendido",
    });
    return false;
  }

  // Creación de nuevo usuario
  const { value: formValues } = await Swal.fire({
    title: standalone ? "<!-- EMOJI_REPLACED --> Crear Nuevo Usuario" : `<!-- EMOJI_REPLACED --> Crear Usuario para ${nombre || targetLabel}`,
    customClass: {
      popup: "swal2-card-ejercicio",
      confirmButton: "btn btn-orange",
      cancelButton: "btn btn-secondary",
    },
    buttonsStyling: false,
    html: `
      <form class="swal-form-ejercicio">
        ${!standalone ? `
        <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #2196f3;">
          <small style="color: #1976d2; font-weight: 600;"><!-- EMOJI_REPLACED --> Se creará usuario para ${nombre || targetLabel.toLowerCase()}</small>
        </div>
        ` : `
        <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #4caf50;">
          <small style="color: #2e7d32; font-weight: 600;"><!-- EMOJI_REPLACED --> Creación de usuario independiente (Recepcionista, Admin, etc.)</small>
        </div>
        `}

        <div>
          <label class="swal-label">Correo electrónico</label>
          <input id="email" type="email" placeholder="correo@ejemplo.com" value="${email || ''}" ${email ? 'readonly style="background-color: #f5f5f5; cursor: not-allowed;"' : ''}>
          ${email ? `<small style="color: #666; font-size: 0.85rem; margin-top: 4px; display: block;"><!-- EMOJI_REPLACED --> Email importado desde ${targetLabel}</small>` : ''}
        </div>

        <div>
          <label class="swal-label">Alias</label>
          <input id="alias" type="text" placeholder="Nombre de usuario">
        </div>

        <div>
          <label class="swal-label">Contraseña</label>
          <input id="password" type="password" placeholder="Contraseña">
        </div>

        ${!esSocio ? `
        <div>
          <label class="swal-label">Rol</label>
          <select id="rol_id">
            <option value="">Seleccionar rol...</option>
            ${rolesDisponibles.map((r) => `<option value="${r.id}">${r.nombre}</option>`).join("")}
          </select>
        </div>
        ` : `
        <input type="hidden" id="rol_id" value="${rolSocioId}">
        <div>
          <label class="swal-label">Rol</label>
          <div style="background: #fff3cd; padding: 10px; border-radius: 6px; border-left: 4px solid #ffc107;">
            <small style="color: #856404; font-weight: 500;"><!-- EMOJI_REPLACED --> Socio</small>
          </div>
        </div>
        `}

        <div class="checkbox-group">
          <input id="estado" type="checkbox" class="swal-checkbox" checked>
          <label for="estado" class="swal-label">Activo</label>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Guardar',
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    preConfirm: async () => {
      const email = (document.getElementById("email") as HTMLInputElement)?.value.trim();
      const alias = (document.getElementById("alias") as HTMLInputElement)?.value.trim();
      const password = (document.getElementById("password") as HTMLInputElement)?.value.trim();
      const rolIdInput = document.getElementById("rol_id") as HTMLInputElement | HTMLSelectElement;
      const rolId = rolIdInput?.value;
      const estado = (document.getElementById("estado") as HTMLInputElement)?.checked ?? false;

      if (!email || !alias || !password || !rolId) {
        Swal.showValidationMessage("<!-- EMOJI_REPLACED --> Todos los campos son obligatorios");
        return;
      }

      if (password.length < 6) {
        Swal.showValidationMessage("<!-- EMOJI_REPLACED --> La contraseña debe tener al menos 6 caracteres");
        return;
      }

      // Para personal, validar que haya seleccionado un rol diferente al valor por defecto
      if (!esSocio && rolId === "") {
        Swal.showValidationMessage("<!-- EMOJI_REPLACED --> Debe seleccionar un rol");
        return;
      }

      // En modo standalone, verificar si el email ya existe
      if (standalone) {
        try {
          const res = await gymApi.get(`/usuarios/email/${encodeURIComponent(email)}`);
          if (res.data) {
            Swal.showValidationMessage("<!-- EMOJI_REPLACED --> Ya existe un usuario con ese email");
            return;
          }
        } catch (err) {
          // Email no existe, continuar
        }
      }

      return { email, alias, password, rolId, estado };
    },
  });

  if (!formValues) return false;

  try {
    const payload: any = {
      email: formValues.email,
      alias: formValues.alias,
      passwordHash: formValues.password,  // Backend espera passwordHash, no password
      rolId: parseInt(formValues.rolId),
      estado: formValues.estado,
    };

    // Solo incluir personalId o socioId si no estamos en modo standalone
    if (!standalone) {
      payload.personalId = personalId ?? null;
      payload.socioId = socioId ?? null;
    }

    await gymApi.post("/usuarios", payload);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Usuario creado',
      text: "El usuario fue registrado correctamente.",
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });

    onSuccess?.();
    return true;
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: '<i class="fa-solid fa-circle-xmark"></i> Error',
      text: err.response?.data?.message || "No se pudo crear el usuario.",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
    return false;
  }
}


