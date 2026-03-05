import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-ejercicio.css"; 

export async function UsuarioEditSwal(id: number | string, onSuccess?: () => void) {
  try {
    const [resUsuario, resRoles] = await Promise.all([
      gymApi.get(`/usuarios/${id}`),
      gymApi.get("/roles"),
    ]);

    const usuario = resUsuario.data;
    const roles = resRoles.data.items || resRoles.data;

    // Depuración: verificar la estructura del usuario
    console.log("=== DEPURACIÓN USUARIO EDIT ===");
    console.log("Datos completos del usuario:", JSON.stringify(usuario, null, 2));
    console.log("Rol completo:", usuario?.rol);
    console.log("rol?.id:", usuario?.rol?.id);
    console.log("rolId:", usuario?.rolId);
    console.log("rol_id:", usuario?.rol_id);
    console.log("roleId:", usuario?.roleId);
    console.log("Lista de roles:", roles);
    console.log("==============================");

    const { value: formValues } = await Swal.fire({
      title: '<i class="fa-solid fa-pen-to-square"></i> Editar Usuario',
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      html: `
        <form class="swal-form-ejercicio">
          <div>
            <label class="swal-label">Correo electrónico</label>
            <input id="email" type="email" value="${usuario.email || ""}" placeholder="correo@ejemplo.com">
          </div>

          <div>
            <label class="swal-label">Alias</label>
            <input id="alias" type="text" value="${usuario.alias || ""}" placeholder="Nombre de usuario">
          </div>

          <div>
            <label class="swal-label">Rol</label>
            <select id="rol_id">
              <option value="">Seleccionar rol...</option>
              ${roles
                .map(
                  (r: any) => {
                    // Intenta obtener el ID del rol del usuario en muchos formatos posibles
                    const usuarioRolId =
                      usuario?.rol?.id ||
                      usuario?.rolId ||
                      usuario?.rol_id ||
                      usuario?.roleId ||
                      usuario?.rol?.['id'] ||
                      (typeof usuario?.rol === 'string' ? usuario?.rol : null);

                    // Si el rol es un string, intentar parsearlo
                    let parsedRolId = usuarioRolId;
                    if (typeof usuario?.rol === 'string') {
                      try {
                        const parsedRol = JSON.parse(usuario.rol);
                        parsedRolId = parsedRol?.id || parsedRolId;
                      } catch (e) {
                        // No se pudo parsear, usar el valor original
                      }
                    }

                    // Convierte ambos a números para comparación más confiable
                    const usuarioRolNum = parsedRolId ? Number(parsedRolId) : null;
                    const rolNum = r.id ? Number(r.id) : null;
                    const isSelected = usuarioRolNum !== null && rolNum !== null && usuarioRolNum === rolNum;

                    // Comparación alternativa por nombre del rol (por si el ID no coincide)
                    const usuarioRolNombre =
                      usuario?.rol?.nombre ||
                      usuario?.rolName ||
                      usuario?.rol_nombre ||
                      (typeof usuario?.rol === 'object' ? usuario?.rol?.nombre : null);
                    const isSelectedByNombre = usuarioRolNombre && r.nombre === usuarioRolNombre;

                    // Comparación por nombre exacto del rol (case insensitive)
                    const isSelectedByNombreCase = usuarioRolNombre && r.nombre.toLowerCase() === usuarioRolNombre.toLowerCase();

                    const finalSelected = isSelected || isSelectedByNombre || isSelectedByNombreCase;

                    // Depuración adicional mejorada
                    console.log(`Rol ${r.nombre} (ID: ${r.id}, tipo: ${typeof r.id}):`);
                    console.log(`  - usuarioRolId: ${parsedRolId} (tipo: ${typeof parsedRolId})`);
                    console.log(`  - usuarioRolNum: ${usuarioRolNum}, rolNum: ${rolNum}`);
                    console.log(`  - isSelected: ${isSelected}`);
                    console.log(`  - usuarioRolNombre: ${usuarioRolNombre}`);
                    console.log(`  - isSelectedByNombre: ${isSelectedByNombre}`);
                    console.log(`  - finalSelected: ${finalSelected}`);
                    console.log(`  ---`);

                    return `<option value="${r.id}" ${finalSelected ? "selected" : ""}>${r.nombre}</option>`;
                  }
                )
                .join("")}
            </select>
          </div>

          <div class="checkbox-group">
            <input id="estado" type="checkbox" class="swal-checkbox" ${
              usuario.estado ? "checked" : ""
            }>
            <label for="estado" class="swal-label" style="margin-left:4px;">Activo</label>
          </div>

        </form>
      `,
      showCancelButton: true,
      confirmButtonText: " Guardar cambios",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const email = (document.getElementById("email") as HTMLInputElement)?.value.trim();
        const alias = (document.getElementById("alias") as HTMLInputElement)?.value.trim();
        const rolId = (document.getElementById("rol_id") as HTMLSelectElement)?.value;
        const estado = (document.getElementById("estado") as HTMLInputElement)?.checked ?? false;

        if (!email || !alias || !rolId) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Todos los campos son obligatorios');
          return;
        }

        return { email, alias, rolId, estado };
      },
    });

    if (!formValues) return;

    await gymApi.put(`/usuarios/${id}`, formValues);

    await Swal.fire({
      icon: "success",
      title: '<i class="fa-solid fa-circle-check"></i> Usuario actualizado',
      text: "Los datos fueron guardados correctamente.",
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
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: '<i class="fa-solid fa-circle-xmark"></i> Error',
      text: err.response?.data?.message || "No se pudo actualizar el usuario.",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}




