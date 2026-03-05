import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import useTenant, { Tenant } from "../hooks/useTenant";

interface Usuario {
  id: number;
  alias?: string;
  email: string;
  avatar?: { url?: string } | string;
  avatarId?: number;
  rol?: string;
}

export default function Navbar({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const [avatarValido, setAvatarValido] = useState(true);
  const { tenant } = useTenant();

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5144";

  useEffect(() => {
    const loadUser = () => {
      const stored = sessionStorage.getItem("usuario");
      const parsedUser = stored ? JSON.parse(stored) : null;
      setUsuario(parsedUser);
      setAvatarValido(true);
      setAvatarTimestamp(Date.now());
    };

    loadUser();
    window.addEventListener("authChange", loadUser);
    window.addEventListener("storage", (e) => {
      if (e.key === "usuario") {
        loadUser();
      }
    });
    return () => {
      window.removeEventListener("authChange", loadUser);
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("socioId");
      localStorage.removeItem("personalId");
      setUsuario(null);

      // Redirigir al login del panel
      window.location.href = "/login";
    }
  };

  const avatarUrl = useMemo(() => {
    if (!avatarValido || !usuario) {
      return `${BASE_URL.replace(/\/+$/, "")}/images/user.png`;
    }

    // Si avatar es un string con la URL directa
    if (typeof usuario.avatar === 'string' && usuario.avatar) {
      return `${BASE_URL.replace(/\/+$/, "")}${usuario.avatar}`;
    }

    // Si avatar es un objeto con url
    if (typeof usuario.avatar === 'object' && usuario.avatar?.url) {
      return `${BASE_URL.replace(/\/+$/, "")}${usuario.avatar.url}`;
    }

    // Si tiene avatarId
    if (usuario.avatarId) {
      return `${BASE_URL.replace(/\/+$/, "")}/api/avatars/file/${usuario.avatarId}?v=${avatarTimestamp}`;
    }

    // Imagen por defecto
    return `${BASE_URL.replace(/\/+$/, "")}/images/user.png`;
  }, [avatarValido, usuario, avatarTimestamp, BASE_URL]);

  const handleAvatarError = async () => {
    if (avatarValido) {
      setAvatarValido(false);

      // Actualizar sessionStorage para quitar el avatar inválido
      if (usuario) {
        const updatedUser = { ...usuario, avatar: undefined, avatarId: undefined };
        sessionStorage.setItem("usuario", JSON.stringify(updatedUser));
        setUsuario(updatedUser);
      }
    }
  };

  return (
    <nav className="navbar px-4 shadow-sm" style={{ backgroundColor: tenant?.primaryColor || "var(--tenant-primary-color)" }}>
      <div className="d-flex align-items-center w-100 justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-light me-2"
            onClick={onToggleSidebar}
          >
            <i className="fa fa-bars"></i>
          </button>

          <div className="d-flex align-items-center">
            {tenant?.planSaas?.tieneAppPersonalizada && (tenant?.logoUrl || tenant?.logo) ? (
              <img
                src={tenant.logoUrl || tenant.logo}
                alt={`Logo ${tenant.nombre}`}
                style={{
                  width: 42,
                  height: 42,
                  objectFit: "contain",
                  marginRight: "10px",
                }}
                onError={(e) => {
                  // Fallback al logo por defecto si falla la carga
                  (e.target as HTMLImageElement).src = "/zinnia.png";
                }}
              />
            ) : (
              <img
                src="/zinnia.png"
                alt="Logo SpazioMg"
                style={{
                  width: 42,
                  height: 42,
                  objectFit: "contain",
                  marginRight: "10px",
                }}
              />
            )}
            <h3 className="text-white fw-bold m-0 no-titulo-modulo">
              {tenant?.nombre || "SpazioMg"}
            </h3>
          </div>
        </div>

        <div className="d-flex align-items-center">
          {!usuario ? (
            <Link
              to="/login"
              className="btn btn-outline-light fw-semibold"
              style={{ borderColor: "white" }}
            >
              Iniciar sesión
            </Link>
          ) : (
            <div className="dropdown">
              <button
                className="btn btn-outline-light dropdown-toggle d-flex align-items-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ borderColor: "white" }}
              >
                <img
                  key={avatarUrl}
                  src={avatarUrl}
                  alt="Avatar"
                  onError={handleAvatarError}
                  className="rounded-circle me-2"
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: "cover",
                    border: "2px solid white",
                  }}
                />
                <span>{usuario.alias || usuario.email}</span>
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <Link
                    to={
                      (usuario?.rol)?.toLowerCase() === "socio"
                        ? "/perfil-socio"
                        : "/perfil"
                    }
                    className="dropdown-item d-flex align-items-center gap-2"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <i className="fa fa-user"></i> Perfil
                  </Link>
                </li>

                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger d-flex align-items-center gap-2"
                    onClick={handleLogout}
                  >
                    <i className="fa fa-door-open"></i> Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
