import { useState } from "react";
import Swal from "sweetalert2";
import saasApi, { CuentaSaaSDto, ActualizarCuentaRequest } from "@/api/saasApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faPenToSquare,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  cuenta: CuentaSaaSDto;
  onUpdated: () => void;
}

/**
 * Componente para ver y editar la información básica de la cuenta SaaS
 */
export default function InformacionCuenta({ cuenta, onUpdated }: Props) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState<ActualizarCuentaRequest>({
    nombreGimnasio: cuenta.nombreGimnasio,
    slug: cuenta.slug || "",
    email: cuenta.email,
    telefono: cuenta.telefono || "",
    direccion: cuenta.direccion || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombreGimnasio.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validación",
        text: "El nombre del gimnasio es obligatorio",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    if (!formData.email.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validación",
        text: "El email es obligatorio",
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
      await saasApi.actualizarCuenta(formData);
      setEditando(false);
      onUpdated();
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "La información de la cuenta se actualizó correctamente",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo actualizar la información",
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

  const handleCancel = () => {
    setFormData({
      nombreGimnasio: cuenta.nombreGimnasio,
      slug: cuenta.slug || "",
      email: cuenta.email,
      telefono: cuenta.telefono || "",
      direccion: cuenta.direccion || "",
    });
    setEditando(false);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-orange text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faClipboardList} className="me-2" />
          Información de la Cuenta
        </h5>
        {!editando && (
          <button
            className="btn btn-light btn-sm"
            onClick={() => setEditando(true)}
          >
            <FontAwesomeIcon icon={faPenToSquare} className="me-1" />
            Editar
          </button>
        )}
      </div>
      <div className="card-body">
        {!editando ? (
          // Vista lectura
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Nombre del Gimnasio</label>
              <p className="form-control-plaintext">{cuenta.nombreGimnasio}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Subdominio (Slug)</label>
              <p className="form-control-plaintext">
                {cuenta.slug ? `${cuenta.slug}.gymsaas.com` : "No configurado"}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Email de Contacto</label>
              <p className="form-control-plaintext">{cuenta.email}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Teléfono</label>
              <p className="form-control-plaintext">{cuenta.telefono || "No especificado"}</p>
            </div>
            <div className="col-md-12 mb-3">
              <label className="fw-semibold text-muted">Dirección</label>
              <p className="form-control-plaintext">{cuenta.direccion || "No especificada"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Fecha de Registro</label>
              <p className="form-control-plaintext">
                {new Date(cuenta.fechaRegistro).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Código de Referido</label>
              <p className="form-control-plaintext">
                {cuenta.codigoReferido || "No tiene"}
              </p>
            </div>
          </div>
        ) : (
          // Formulario edición
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Nombre del Gimnasio <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="nombreGimnasio"
                  value={formData.nombreGimnasio}
                  onChange={handleChange}
                  required
                  disabled={guardando}
                  style={{
                    borderColor: "var(--tenant-primary-color)",
                  }}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Subdominio (Slug)
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  disabled={guardando}
                  placeholder="mi-gimnasio"
                  style={{
                    borderColor: "var(--tenant-primary-color)",
                  }}
                />
                <small className="text-muted">
                  Solo letras minúsculas, números y guiones. Ej: mi-gimnasio
                </small>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={guardando}
                  style={{
                    borderColor: "var(--tenant-primary-color)",
                  }}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="form-control"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={guardando}
                  placeholder="+54 11 1234-5678"
                  style={{
                    borderColor: "var(--tenant-primary-color)",
                  }}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label fw-semibold">
                  Dirección
                </label>
                <textarea
                  className="form-control"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  disabled={guardando}
                  rows={2}
                  placeholder="Calle, número, ciudad..."
                  style={{
                    borderColor: "var(--tenant-primary-color)",
                  }}
                />
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={guardando}
              >
                Cancelar
              </button>
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
                    Guardando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

