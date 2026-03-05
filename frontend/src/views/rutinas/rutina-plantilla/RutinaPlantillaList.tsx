import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import gymApi from "@/api/gymApi";
import { RutinaPlantillaCreateSwal } from "./RutinaPlantillaCreateSwal";
import { RutinaPlantillaEditSwal } from "./RutinaPlantillaEditSwal";
import "@/styles/swal-ejercicio.css"; // usa el mismo estilo naranja moderno

interface RutinaPlantilla {
  id: number;
  nombre: string;
  objetivo?: string;
  grupoMuscularNombre?: string;
  profesorNombre?: string;
  imagenUrl?: string;
  personalId?: number;
}

interface Usuario {
  rol?: string;
  personalId?: number;
}

export default function RutinaPlantillaList() {
  const [rutinas, setRutinas] = useState<RutinaPlantilla[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // 🔹 Obtener usuario logueado
  const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}") as Usuario;
  const rol = usuario?.rol;
  const personalId = usuario?.personalId ?? null;

  // Si no hay rol válido, redirigir al login
  if (!rol) {
    window.location.href = "/login";
    return null;
  }

  // === 🔹 Cargar listado ===
  const cargarDatos = async (p: number = 1, q: string = ""): Promise<void> => {
    setLoading(true);
    try {
      const { data } = await gymApi.get(`/rutinasplantilla?page=${p}&pageSize=${pageSize}&q=${q}`);
      // La respuesta viene: PaginatedResponse<RutinaPlantillaDto> con { data, totalCount, page, pageSize }
      const lista = data?.data || [];
      if (!Array.isArray(lista)) throw new Error("Formato inesperado de rutinas");
      setRutinas(lista);
      setTotalItems(data?.totalCount || lista.length);
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las rutinas",
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

  // === 🗑️ Eliminar ===
  const eliminarRutina = async (id: number, nombre: string): Promise<void> => {
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
      await gymApi.delete(`/rutinasplantilla/${id}`);
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
      const msg = error.response?.data || "No se pudo eliminar la rutina";
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

  // === 🎯 Render ===
  return (
    <div className="container mt-4">
      <h1 className="titulo-modulo">RUTINAS</h1>

      {/* 🔍 Buscador y Botones */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar rutina o categoría..."
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
            onClick={() => RutinaPlantillaCreateSwal(() => cargarDatos(page, search))}
          >
            <i class="fas fa-plus"></i> Nueva
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
                  <th>OBJETIVO</th>
                  <th>CATEGORÍA</th>
                  <th>PROFESOR</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {rutinas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted py-4">
                      No hay rutinas registradas.
                    </td>
                  </tr>
                ) : (
                  rutinas.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {r.imagenUrl ? (
                          <img
                            src={`${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5144").replace(/\/api$/, "")}/${r.imagenUrl}`}
                            alt={r.nombre}
                            className="miniatura-ejercicio"
                            onClick={() =>
                              Swal.fire({
                                imageUrl: `${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5144").replace(/\/api$/, "")}/${r.imagenUrl}`,
                                imageAlt: r.nombre,
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
                      <td className="fw-semibold">{r.nombre}</td>
                      <td className="text-muted small">{r.objetivo || "—"}</td>
                      <td>{r.grupoMuscularNombre || "—"}</td>
                      <td className="text-muted small">{r.profesorNombre || "—"}</td>
                      <td>
                        <div className="acciones-botones">
                          {/* Botón Editar: Solo Admin/Recepción o el profesor dueño de la rutina */}
                          {(rol === "Administrador" || rol === "Recepcion" ||
                            (rol === "Profesor" && r.personalId === personalId)) && (
                            <button
                              className="btn-accion btn-editar"
                              onClick={() => RutinaPlantillaEditSwal(r.id, () => cargarDatos(page, search))}
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                          )}
                          {/* Botón Eliminar: Solo Admin */}
                          {rol === "Administrador" && (
                            <button
                              className="btn-accion btn-eliminar"
                              onClick={() => eliminarRutina(r.id, r.nombre)}
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
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


