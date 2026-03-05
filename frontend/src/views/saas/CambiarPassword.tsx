import { useState } from "react";
import Swal from "sweetalert2";
import saasApi, { CambiarPasswordAdminRequest } from "@/api/saasApi";

/**
 * Componente para cambiar la contraseña del administrador SaaS
 */
export default function CambiarPassword() {
  const [formData, setFormData] = useState<CambiarPasswordAdminRequest>({
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: "",
  });
  const [mostrarPassword, setMostrarPassword] = useState({
    actual: false,
    nueva: false,
    confirmacion: false,
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMostrarPassword = (campo: "actual" | "nueva" | "confirmacion") => {
    setMostrarPassword(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  const validarFormulario = (): string | null => {
    if (!formData.passwordActual) {
      return "Debes ingresar tu contraseña actual";
    }
    if (!formData.nuevaPassword) {
      return "Debes ingresar una nueva contraseña";
    }
    if (formData.nuevaPassword.length < 6) {
      return "La nueva contraseña debe tener al menos 6 caracteres";
    }
    if (formData.nuevaPassword !== formData.confirmarPassword) {
      return "La confirmación de contraseña no coincide";
    }
    if (formData.passwordActual === formData.nuevaPassword) {
      return "La nueva contraseña debe ser diferente a la actual";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validarFormulario();
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Validación",
        text: error,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    setGuardando(true);
    try {
      await saasApi.cambiarPasswordAdmin(formData);
      setFormData({
        passwordActual: "",
        nuevaPassword: "",
        confirmarPassword: "",
      });
      Swal.fire({
        icon: "success",
        title: "¡Contraseña cambiada!",
        text: "Tu contraseña ha sido actualizada correctamente",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo cambiar la contraseña. Verifica que tu contraseña actual sea correcta.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });
    } finally {
      setGuardando(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    if (!password) return { strength: "", color: "", width: "0%" };
    if (password.length < 6) return { strength: "Muy débil", color: "danger", width: "25%" };
    if (password.length < 8) return { strength: "Débil", color: "warning", width: "50%" };
    if (password.length < 10) return { strength: "Media", color: "info", width: "75%" };
    return { strength: "Fuerte", color: "success", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(formData.nuevaPassword);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-orange text-white">
        <h5 className="mb-0"><i className="fa-solid fa-lock"></i> Cambiar Contraseña</h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info mb-4">
          <strong><i className="fa-solid fa-circle-info"></i> Recomendaciones de seguridad:</strong>
          <ul className="mb-0 mt-2">
            <li>Usa al menos 8 caracteres</li>
            <li>Combina letras mayúsculas, minúsculas, números y símbolos</li>
            <li>No uses palabras comunes o información personal</li>
            <li>No reuses contraseñas de otros sitios</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Contraseña actual */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Contraseña Actual <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type={mostrarPassword.actual ? "text" : "password"}
                className="form-control"
                name="passwordActual"
                value={formData.passwordActual}
                onChange={handleChange}
                disabled={guardando}
                required
                style={{
                  borderColor: "var(--tenant-primary-color)",
                }}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => toggleMostrarPassword("actual")}
                disabled={guardando}
              >
                {mostrarPassword.actual ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Nueva Contraseña <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type={mostrarPassword.nueva ? "text" : "password"}
                className="form-control"
                name="nuevaPassword"
                value={formData.nuevaPassword}
                onChange={handleChange}
                disabled={guardando}
                required
                minLength={6}
                style={{
                  borderColor: "var(--tenant-primary-color)",
                }}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => toggleMostrarPassword("nueva")}
                disabled={guardando}
              >
                {mostrarPassword.nueva ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>

            {/* Indicador de fortaleza */}
            {formData.nuevaPassword && (
              <div className="mt-2">
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Fortaleza:</small>
                  <small className={`text-${passwordStrength.color} fw-semibold`}>
                    {passwordStrength.strength}
                  </small>
                </div>
                <div className="progress" style={{ height: "5px" }}>
                  <div
                    className={`progress-bar bg-${passwordStrength.color}`}
                    role="progressbar"
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Confirmar Nueva Contraseña <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type={mostrarPassword.confirmacion ? "text" : "password"}
                className="form-control"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                disabled={guardando}
                required
                minLength={6}
                style={{
                  borderColor: "var(--tenant-primary-color)",
                }}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => toggleMostrarPassword("confirmacion")}
                disabled={guardando}
              >
                {mostrarPassword.confirmacion ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>

            {/* Validación de coincidencia */}
            {formData.confirmarPassword && (
              <small className={formData.nuevaPassword === formData.confirmarPassword ? "text-success" : "text-danger"}>
                {formData.nuevaPassword === formData.confirmarPassword ? <><i className="fas fa-check"></i> Las contraseñas coinciden</> : <><i className="fas fa-times"></i> Las contraseñas no coinciden</>}
              </small>
            )}
          </div>

          {/* Botón de envío */}
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-orange"
              disabled={guardando}
              style={{
                backgroundColor: "var(--tenant-primary-color)",
                borderColor: "var(--tenant-primary-color)",
              }}
            >
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Cambiando contraseña...
                </>
              ) : (
                <><i className="fa-solid fa-lock"></i> Cambiar Contraseña</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


