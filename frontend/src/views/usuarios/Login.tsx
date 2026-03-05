import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import gymApi from "@/api/gymApi";
import usePublicBranding from "@/hooks/usePublicBranding";

export default function Login() {
  const navigate = useNavigate();
  const { branding } = usePublicBranding();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevenir transformaciones del botón al hacer click
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .login-card button[type="submit"] {
        transform: none !important;
      }
      .login-card button[type="submit"]:active {
        transform: none !important;
      }
      .login-card button[type="submit"]:hover {
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Complete email y contraseña",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    try {
      setLoading(true);

      const res = await gymApi.post("/auth/login", { email, password });

      const token = res.data.token || res.data.Token;
      const usuario = res.data.usuario || res.data.Usuario;

      if (!token) throw new Error("No se recibió el token JWT del servidor.");

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("usuario", JSON.stringify(usuario));

      if (usuario?.socioId) {
        sessionStorage.setItem("socioId", usuario.socioId.toString());
      } else if (usuario?.personalId) {
        sessionStorage.setItem("personalId", usuario.personalId.toString());
      }

      await Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `Hola ${usuario?.alias || usuario?.email}!`,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });

      const rol = usuario?.rol || usuario?.Rol;

      if (!rol) {
        Swal.fire({
          icon: "error",
          title: "Error de sesión",
          text: "No se pudo determinar tu rol. Por favor, contacta al administrador.",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return;
      }

      if (rol === "Socio") {
        navigate("/dashboardSocio");
      } else if (rol === "Administrador" || rol === "Recepcion" || rol === "Profesor") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }

      window.location.reload();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Credenciales incorrectas",
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

  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire<string>({
      title: "Recuperar contraseña",
      input: "email",
      inputPlaceholder: "correo@ejemplo.com",
      confirmButtonText: "Enviar enlace",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      preConfirm: (value) => {
        if (!value) Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> El email es obligatorio');
        return value;
      },
    });

    if (email) {
      try {
        await gymApi.post("/auth/forgot-password", { email });
        Swal.fire({
          icon: "success",
          title: '<i class="fa-solid fa-envelope"></i> Correo enviado',
          text: "Revisa tu bandeja de entrada para continuar con el restablecimiento.",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data || "No se pudo enviar el correo. Verifica el email.",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        ...(branding?.loginBackgroundType === 'solid' && branding?.loginBackgroundColor
          ? { backgroundColor: branding.loginBackgroundColor }
          : {
              backgroundImage: branding?.loginBackgroundImageUrl
                ? `url('${branding.loginBackgroundImageUrl}')`
                : branding?.backgroundImageUrl
                ? `url('${branding.backgroundImageUrl}')`
                : "url('/public/gym.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }),
        padding: isMobile ? "1rem" : "0",
      }}
    >
      <div
        className="card login-card shadow-lg p-4 text-white"
        style={{
          borderRadius: "1rem",
          backgroundColor: branding?.primaryColor || "#ff6b00",
          border: "none",
        }}
      >
        <div className="text-center mb-4">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.nombre}
              style={{ maxHeight: "80px", objectFit: "contain", marginBottom: "0.5rem" }}
            />
          ) : (
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: isMobile ? "60px" : "80px",
                height: isMobile ? "60px" : "80px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <i className="fa fa-dumbbell" style={{ fontSize: isMobile ? "1.8rem" : "2.5rem" }}></i>
            </div>
          )}
          <h3
            className="fw-bold"
            style={{
              fontSize: isMobile ? "1.5rem" : "1.75rem",
            }}
          >
            {branding?.nombre || "SPACIOMG SYSTEM"}
          </h3>
          <p className="mb-0 small" style={{ opacity: 0.9 }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label
              className="form-label fw-semibold text-white"
              style={{
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                minHeight: "44px",
                fontSize: "16px",
              }}
            />
          </div>

          <div className="mb-3 text-start">
            <label
              className="form-label fw-semibold text-white"
              style={{
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                minHeight: "44px",
                fontSize: "16px",
              }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 mt-3 fw-bold btn-login-submit"
            disabled={loading}
            style={{
              backgroundColor: "#ffffff",
              color: branding?.primaryColor || "#ff6b00",
              border: "none",
              height: "50px",
              fontSize: isMobile ? "1rem" : "1.1rem",
              padding: "0",
              transition: "none",
            }}
          >
            {loading ? "Iniciando..." : "Ingresar"}
          </button>

          <div className="text-center mt-3">
            <a
              href="#"
              onClick={handleForgotPassword}
              className="text-decoration-none small text-white-50"
              style={{
                fontSize: isMobile ? "0.85rem" : "0.875rem",
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}


