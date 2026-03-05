import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import { PasswordEditSwal } from "@/views/usuarios/perfil/CambiarContraseña";

interface Usuario {
  id: number;
  alias: string;
  email: string;
  avatarUrl?: string;
}

interface Socio {
  id: number;
  nombre: string;
  dni: string;
  telefono?: string;
  fechaNacimiento?: string;
  activo: boolean;
  planActual?: string;
  usuario?: Usuario;
}

export default function PerfilSocio() {
  const [perfil, setPerfil] = useState<Socio | null>(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5144";

  const storedUser = sessionStorage.getItem("usuario");
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  // Obtener perfil del socio
  const fetchPerfil = async () => {
    try {
      const res = await gymApi.get("/perfil/socio");
      setPerfil(res.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el perfil del socio",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const resolvedUserId = perfil?.usuario?.id ?? userId;

  // Cambiar avatar
  const handleAvatarUpload = async () => {
    if (!resolvedUserId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el usuario en sesión",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    const { value: file } = await Swal.fire({
      title: '<i class="fa-solid fa-camera"></i> Cambiar Avatar',
      input: "file",
      inputAttributes: { accept: "image/*" },
      showCancelButton: true,
      confirmButtonText: "Subir",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      preConfirm: (value) => {
        if (!value) Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debe seleccionar una imagen');
        return value;
      },
    });

    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const uploadRes = await gymApi.post(`/perfil/${resolvedUserId}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check"></i> Avatar actualizado',
        text: "Tu nuevo avatar se aplicará al instante",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });

      // Actualizar sessionStorage
      const stored = sessionStorage.getItem("usuario");
      if (stored) {
        const user = JSON.parse(stored);
        user.avatar = uploadRes.data.url;
        sessionStorage.setItem("usuario", JSON.stringify(user));
      }

      await fetchPerfil();
      setTimeout(() => window.dispatchEvent(new Event("authChange")), 300);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo subir el avatar",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  // Editar datos del socio + usuario
  const handleEditDatos = async () => {
    if (!perfil || !perfil.usuario) return;

    const socio = perfil;
    const usuario = perfil.usuario;

    const { value: formValues } = await Swal.fire({
      title: '<i class="fas fa-edit"></i> Editar datos del socio',
      html: `
        <div class="swal2-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div class="swal2-field" style="display: flex; flex-direction: column; gap: 4px;">
            <label class="form-label fw-bold mb-0" style="font-size: 0.85rem;">Nombre</label>
            <input id="swal-nombre" class="form-control" placeholder="Nombre" value="${socio.nombre || ""}" style="font-size: 0.9rem; padding: 6px 10px;">
          </div>
          <div class="swal2-field" style="display: flex; flex-direction: column; gap: 4px;">
            <label class="form-label fw-bold mb-0" style="font-size: 0.85rem;">DNI</label>
            <input id="swal-dni" class="form-control" placeholder="DNI" value="${socio.dni || ""}" style="font-size: 0.9rem; padding: 6px 10px;">
          </div>
          <div class="swal2-field" style="display: flex; flex-direction: column; gap: 4px;">
            <label class="form-label fw-bold mb-0" style="font-size: 0.85rem;">Teléfono</label>
            <input id="swal-telefono" class="form-control" placeholder="Teléfono" value="${socio.telefono || ""}" style="font-size: 0.9rem; padding: 6px 10px;">
          </div>
          <div class="swal2-field" style="display: flex; flex-direction: column; gap: 4px;">
            <label class="form-label fw-bold mb-0" style="font-size: 0.85rem;">Fecha Nacimiento <span style="color: #dc3545;">*</span></label>
            <input id="swal-fecha" type="date" class="form-control" value="${socio.fechaNacimiento ? socio.fechaNacimiento.split("T")[0] : ""}" style="font-size: 0.9rem; padding: 6px 10px;" required>
          </div>
          <div class="swal2-field full-row" style="grid-column: 1 / -1; border-top: 1px solid #dee2e6; padding-top: 10px; margin-top: 5px;">
            <label class="form-label fw-bold mb-1" style="font-size: 0.9rem; color: var(--tenant-primary-color);">Datos de usuario</label>
          </div>
          <div class="swal2-field" style="display: flex; flex-direction: column; gap: 4px;">
            <label class="form-label fw-bold mb-0" style="font-size: 0.85rem;">Alias</label>
            <input id="swal-alias" class="form-control" placeholder="Alias" value="${usuario.alias || ""}" style="font-size: 0.9rem; padding: 6px 10px;">
          </div>
          <div class="swal2-field" style="display: flex; flex-direction: column; gap: 4px;">
            <label class="form-label fw-bold mb-0" style="font-size: 0.85rem;">Correo electrónico</label>
            <input id="swal-email" type="email" class="form-control" placeholder="Correo electrónico" value="${usuario.email || ""}" style="font-size: 0.9rem; padding: 6px 10px;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const nombre = (document.getElementById("swal-nombre") as HTMLInputElement)?.value;
        const dni = (document.getElementById("swal-dni") as HTMLInputElement)?.value;
        const telefono = (document.getElementById("swal-telefono") as HTMLInputElement)?.value;
        const fechaNacimiento = (document.getElementById("swal-fecha") as HTMLInputElement)?.value;
        const alias = (document.getElementById("swal-alias") as HTMLInputElement)?.value;
        const email = (document.getElementById("swal-email") as HTMLInputElement)?.value;

        if (!nombre || !dni || !alias || !email) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Nombre, DNI, alias y email son obligatorios');
          return false;
        }
        if (!fechaNacimiento) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> La fecha de nacimiento es obligatoria');
          return false;
        }

        return { nombre, dni, telefono, fechaNacimiento, alias, email };
      },
    });

    if (!formValues) return;

    try {
      // Trim todos los valores antes de validar
      const nombre = formValues.nombre?.trim();
      const dni = formValues.dni?.trim();
      const alias = formValues.alias?.trim();
      const email = formValues.email?.trim();

      // Validaciones básicas
      if (!nombre || !dni || !alias || !email || !formValues.fechaNacimiento) {
        Swal.fire({
          icon: "error",
          title: '<i class="fa-solid fa-circle-xmark"></i> Error de validación',
          text: "Todos los campos obligatorios deben tener un valor",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
        return;
      }

      // Actualizar socio - enviar campos obligatorios siempre
      const payload: any = {
        nombre,
        dni,
        alias,
        email,
        fechaNacimiento: formValues.fechaNacimiento,
      };

      // Limpiar teléfono antes de enviar (si tiene valor)
      const telefonoClean = formValues.telefono?.trim()?.replace(/\s+/g, '');
      if (telefonoClean && telefonoClean.length > 0) {
        payload.telefono = telefonoClean;
      }

      console.log('Payload enviado:', payload); // Para debug

      await gymApi.patch(`/perfil/${usuario.id}/socio`, payload);

      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check"></i> Datos actualizados',
        text: "Los cambios se guardaron correctamente.",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      await fetchPerfil();
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      console.error('Response data:', err?.response?.data);
      console.error('Response status:', err?.response?.status);

      let errorMessage = "No se pudieron actualizar los datos";
      let errorDetails = "";

      // Extraer mensajes de error del backend
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join('\n• ');
        } else if (data.message) {
          errorMessage = data.message;
        }
        if (data.error) {
          errorDetails = `\n\nDetalle: ${data.error}`;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: '<i class="fa-solid fa-circle-xmark"></i> Error al actualizar',
        html: `<div style="text-align: left; white-space: pre-wrap;">
          <strong>Errores:</strong><br/>• ${errorMessage}${errorDetails}
        </div>`,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  if (loading) return <p className="text-center mt-5">Cargando perfil...</p>;
  if (!perfil) return <p className="text-center mt-5">No se encontró el perfil.</p>;

  const avatarUrl =
    perfil.usuario?.avatarUrl && perfil.usuario.avatarUrl.trim() !== ""
      ? `${BASE_URL}${perfil.usuario.avatarUrl}?v=${Date.now()}`
      : `${BASE_URL}/images/user.png`;

  return (
    <div className="container mt-4 text-center">
      <div
        className="card perfil-card mx-auto shadow p-4 text-white position-relative"
        style={{
          backgroundColor: "var(--tenant-primary-color)",
          border: "none",
          borderRadius: "1rem",
        }}
      >
        {/* Avatar */}
        <img
          src={avatarUrl}
          alt="Avatar"
          className="rounded-circle mx-auto mb-3 border border-white"
          style={{ width: 120, height: 120, objectFit: "cover" }}
        />

        <h4 className="fw-bold text-capitalize">{perfil.nombre}</h4>
        <p className="text-light">{perfil.usuario?.email}</p>
        <p><strong>DNI:</strong> {perfil.dni}</p>

        {/* Datos personales */}
        <div className="text-start text-dark rounded p-3 mt-3 position-relative bg-light bg-opacity-25">
          <button
            onClick={handleEditDatos}
            className="btn btn-sm btn-outline-dark position-absolute top-0 end-0 m-2"
          >
            <i class="fas fa-edit"></i>
          </button>
          <p><strong>Alias:</strong> {perfil.usuario?.alias || "—"}</p>
          <p><strong>Teléfono:</strong> {perfil.telefono || "—"}</p>
          <p><strong>Fecha de nacimiento:</strong> {perfil.fechaNacimiento ? new Date(perfil.fechaNacimiento).toLocaleDateString() : "—"}</p>
          <p><strong>Plan actual:</strong> {perfil.planActual || "Sin plan activo"}</p>
          <p><strong>Estado:</strong> {perfil.activo ? "Activo" : "Inactivo"}</p>
        </div>

        {/* Botones */}
        <div className="d-grid gap-2 mt-3">
          <button onClick={handleAvatarUpload} className="btn btn-warning text-black fw-semibold">
            <i class="fa-solid fa-camera"></i> Cambiar Avatar
          </button>
          <button
            onClick={() => {
              if (!resolvedUserId) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "No se encontró el usuario en sesión",
                  customClass: {
                    popup: "swal2-card-style",
                    confirmButton: "btn btn-orange",
                  },
                  buttonsStyling: false,
                });
                return;
              }
              PasswordEditSwal(String(resolvedUserId));
            }}
            className="btn btn-warning fw-semibold"
          >
            <i class="fa-solid fa-lock"></i> Cambiar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}


