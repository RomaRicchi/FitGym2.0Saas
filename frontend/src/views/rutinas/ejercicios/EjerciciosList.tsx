import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import gymApi from "@/api/gymApi";
import { EjercicioCreateSwal } from "./EjercicioCreateSwal";
import { EjercicioEditSwal } from "./EjercicioEditSwal";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import "@/styles/swal-ejercicio.css";

interface Ejercicio {
  id: number;
  nombre: string;
  tips?: string;
  grupoMuscularNombre?: string;
  mediaUrl?: string;
  videoUrl?: string;
}

export default function EjerciciosList() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  // === Cargar ejercicios ===
  const cargarDatos = async (p: number = 1, q: string = ""): Promise<void> => {
    setLoading(true);
    try {
      const { data } = await gymApi.get(`/ejercicios?page=${p}&pageSize=${pageSize}&q=${q}`);
      // La respuesta viene: PaginatedResponse<EjercicioDto> con { data, totalCount, page, pageSize }
      const lista = data?.data || [];
      if (!Array.isArray(lista)) throw new Error("Formato inesperado de ejercicios");
      setEjercicios(lista);
      setTotalItems(data?.totalCount || lista.length);
    } catch (_error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las actividades",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.length >= 3 || search.length === 0) {
        cargarDatos(page, search);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [page, search]);

  // === Eliminar ===
  const eliminarEjercicio = async (id: number, nombre: string): Promise<void> => {
    const result = await Swal.fire({
      title: `¿Eliminar "${nombre}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await gymApi.delete(`/ejercicios/${id}`);
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      cargarDatos(page, search);
    } catch (err: unknown) {
      const error = err as { response?: { data?: string } };
      const msg = error.response?.data || "No se pudo eliminar la actividad";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="container mt-4">
      <h1 className="titulo-modulo">ACTIVIDADES</h1>

      {/* 🔍 Buscador y Botones */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar actividad o categoría..."
          value={search}
          onChange={handleSearch}
          className="form-control mb-3"
          style={{
            width: "100%",
            maxWidth: "600px",
            borderColor: "var(--tenant-primary-color)",
            borderWidth: "2px",
            outline: "2px solid var(--tenant-primary-color)",
            outlineColor: "var(--tenant-primary-color)",
            boxShadow: "0 0 0 2px var(--tenant-primary-color)",
            height: "38px",
          }}
        />

        <div className="d-flex gap-2">
          <button
            className="fw-semibold"
            style={{
              backgroundColor: "var(--tenant-primary-color)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              transition: "all 0.2s ease",
              height: "38px",
              padding: "0 24px",
              whiteSpace: "nowrap",
            }}
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
          >
            Limpiar
          </button>

          <button
            className="btn btn-success fw-semibold"
            style={{
              height: "38px",
              padding: "0 24px",
              whiteSpace: "nowrap",
            }}
            onClick={() => EjercicioCreateSwal(() => cargarDatos(page, search))}
          >
            <i class="fas fa-plus"></i> Nueva Actividad
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="warning" />
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="tabla-gestion table align-middle text-center">
              <thead>
                <tr>
                  <th>IMAGEN</th>
                  <th>NOMBRE</th>
                  <th>CATEGORÍA</th>
                  <th>TIPS</th>
                  <th>VIDEO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {ejercicios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted py-4">
                      No hay actividades registradas.
                    </td>
                  </tr>
                ) : (
                  ejercicios.map((e) => (
                    <tr key={e.id}>
                      <td>
                        {e.mediaUrl ? (
                          <img
                            src={`${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5144").replace(/\/api$/, "")}/${e.mediaUrl}`}
                            alt={e.nombre}
                            className="miniatura-ejercicio"
                            onClick={() =>
                              Swal.fire({
                                imageUrl: `${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5144").replace(/\/api$/, "")}/${e.mediaUrl}`,
                                imageAlt: e.nombre,
                                background: "#000",
                                showConfirmButton: false,
                                showCloseButton: true,
                                width: "auto",
                                padding: "1rem",
                              })
                            }
                            onError={(ev) => (ev.currentTarget.src = "/placeholder.png")}
                          />
                        ) : (
                          <span className="text-muted">Sin imagen</span>
                        )}
                      </td>
                      <td className="fw-semibold">{e.nombre}</td>
                      <td>{e.grupoMuscularNombre || "—"}</td>
                      <td className="text-muted small">{e.tips || "—"}</td>
                      <td>
                        {e.videoUrl ? (
                          <a
                            href={e.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{
                              backgroundColor: "#FF0000",
                              color: "white",
                              borderRadius: "6px",
                              padding: "4px 12px",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            title="Ver video en YouTube"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C.062 8.074 0 10.323 0 12s.062 3.926.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24.062 15.926 24 13.677 24 12c0-1.677-.062-3.926-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            Ver
                          </a>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <ActionGroup>
                          <ActionButton
                            action="edit"
                            variant="warning"
                            onClick={() => EjercicioEditSwal(e.id, () => cargarDatos(page, search))}
                          >
                            <i className="fas fa-edit"></i>
                          </ActionButton>
                          <ActionButton
                            action="delete"
                            variant="danger"
                            onClick={() => eliminarEjercicio(e.id, e.nombre)}
                          >
                            <i className="fas fa-trash"></i>
                          </ActionButton>
                        </ActionGroup>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalItems / pageSize)}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </div>
  );
}


