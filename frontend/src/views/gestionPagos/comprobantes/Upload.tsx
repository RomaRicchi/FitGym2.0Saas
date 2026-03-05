import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

export default function ComprobanteUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      Swal.fire({
        icon: "warning",
        title: '<i class="fa-solid fa-triangle-exclamation me-2"></i>Error',
        text: "Debe seleccionar un archivo",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("ordenPagoId", id || "");

    try {
      const { data } = await gymApi.post("/comprobantes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check me-2"></i>Comprobante subido',
        html: `
          <p>El comprobante fue cargado correctamente.</p>
          <a href="${import.meta.env.VITE_API_URL}/${data.fileUrl}" target="_blank" style="color:var(--tenant-primary-color);font-weight:bold;">
            <i class="fa-solid fa-file-pdf me-1"></i>Ver archivo
          </a>
        `,
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      navigate(`/ordenes/${id}/comprobantes`);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: '<i class="fa-solid fa-circle-xmark me-2"></i>Error',
        text: err.response?.data || "No se pudo subir el comprobante",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div
        className="card shadow-lg p-4 text-center"
        style={{
          width: "100%",
          maxWidth: 500,
          borderRadius: "1rem",
          border: "none",
        }}
      >
        <h3 className="fw-bold text-orange mb-3">
          <i className="fa-solid fa-upload me-2"></i>Subir Comprobante
        </h3>
        <p className="text-muted">Orden #{id}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label fw-semibold">Archivo</label>
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold"
            style={{ backgroundColor: "var(--tenant-primary-color)", color: "white" }}
          >
            Subir Archivo
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-2"
            onClick={() => navigate(`/ordenes/${id}/comprobantes`)}
          >
            Volver
          </button>
        </form>
      </div>
    </div>
  );
}

