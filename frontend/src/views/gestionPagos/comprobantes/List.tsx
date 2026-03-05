import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import gymApi from "@/api/gymApi";

interface Comprobante {
  id: number;
  fileUrl: string;
  mimeType: string;
  subidoEn: string;
}

export default function OrdenComprobantesList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComprobantes = async () => {
    try {
      const res = await gymApi.get(`/comprobantes/orden/${id}`);
      setComprobantes(res.data.items || res.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: '<i class="fa-solid fa-circle-xmark me-2"></i>Error',
        text: "No se pudieron cargar los comprobantes.",
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
    fetchComprobantes();
  }, [id]);

  // Eliminar comprobante
  const handleDelete = async (comprobanteId: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar comprobante?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    try {
      await gymApi.delete(`/comprobantes/${comprobanteId}`);
      setComprobantes((prev) => prev.filter((c) => c.id !== comprobanteId));
      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check me-2"></i>Eliminado',
        text: "El comprobante fue eliminado correctamente.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: '<i class="fa-solid fa-circle-xmark me-2"></i>Error',
        text: "No se pudo eliminar el comprobante.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-muted">Cargando comprobantes...</p>
      </div>
    );

  return (
    <div className="container mt-4">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.3rem", letterSpacing: "2px" }}
      >
        <i className="fa-solid fa-file-pdf me-2"></i>COMPROBANTES DE LA ORDEN #{id}
      </h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-outline-secondary fw-bold"
          onClick={() => navigate("/ordenes")}
        >
          <i className="fa-solid fa-arrow-left me-2"></i>Volver a Órdenes
        </button>
      </div>

      {comprobantes.length === 0 ? (
        <div className="alert alert-warning text-center">
          No hay comprobantes cargados para esta orden.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Subido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprobantes.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {c.fileUrl?.endsWith(".pdf") ? (
                      <span><i className="fa-solid fa-file-pdf me-1"></i>PDF</span>
                    ) : (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${c.fileUrl}`}
                        alt="Comprobante"
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </td>
                  <td>{c.mimeType}</td>
                  <td>{new Date(c.subidoEn).toLocaleString()}</td>
                  <td>
                    <ActionGroup className="justify-content-center">
                      <a
                        href={`${import.meta.env.VITE_API_URL}/${c.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary fw-bold"
                        title="Ver comprobante"
                      >
                        <i className="fa-solid fa-eye me-1"></i>Ver
                      </a>
                      <ActionButton
                        action="delete"
                        tooltip="Eliminar comprobante"
                        variant="danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </ActionButton>
                    </ActionGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

