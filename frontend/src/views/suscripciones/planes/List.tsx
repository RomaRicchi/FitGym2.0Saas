import { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import { PlanCreateSwal } from "@/views/suscripciones/planes/PlanCreateSwal";
import { PlanEditSwal } from "@/views/suscripciones/planes/PlanEditSwal";
import Pagination from "@/components/Pagination";

interface Plan {
  id: number;
  nombre: string;
  diasPorSemana: number;
  precio: number;
  activo: boolean;
  salas?: Array<{
    id: number;
    nombre: string;
    cupo: number;
    activa: boolean;
  }>;
}

export default function PlanesList() {
  const [allPlanes, setAllPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [usuarioRol, setUsuarioRol] = useState<string>("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("usuario");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsuarioRol(user.rol || user.Rol || "");
      } catch {
        // Error silencioso
      }
    }
  }, []);

  const filteredPlanes = useMemo(() => {
    if (!search) return allPlanes;
    const filtroLower = search.toLowerCase();
    return allPlanes.filter(p =>
      p.nombre.toLowerCase().includes(filtroLower)
    );
  }, [allPlanes, search]);

  const totalItems = filteredPlanes.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const visiblePlanes = filteredPlanes.slice(startIndex, startIndex + pageSize);

  const fetchPlanes = async () => {
    setLoading(true);
    try {
      const res = await gymApi.get("/planes");
      setAllPlanes(res.data.items || res.data);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los planes",
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
    fetchPlanes();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar plan?",
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

    if (confirm.isConfirmed) {
      try {
        await gymApi.delete(`/planes/${id}`);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "Plan eliminado correctamente",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        fetchPlanes();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el plan",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
            cancelButton: "btn btn-secondary",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  if (loading) return <p>Cargando planes...</p>;

  return (
    <div className="mt-4">
      <h1
          className="text-center fw-bold mb-4"
          style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
        >
          PLANES
        </h1>

      <div className="mb-3">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-6">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{
                borderColor: "var(--tenant-primary-color)",
                borderWidth: "2px",
                outline: "2px solid var(--tenant-primary-color)",
                outlineColor: "var(--tenant-primary-color)",
                boxShadow: "0 0 0 2px var(--tenant-primary-color)",
                height: "38px",
              }}
            />
          </div>
          <div className="col-12 col-md-6 d-flex gap-2">
            <button
              className="btn fw-semibold flex-grow-1 flex-md-grow-0"
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

            {usuarioRol === "Administrador" && (
              <button
                onClick={() => PlanCreateSwal(fetchPlanes)}
                className="btn btn-success fw-semibold flex-grow-1 flex-md-grow-0"
                style={{
                  height: "38px",
                  padding: "0 24px",
                  whiteSpace: "nowrap"
                }}
              >
                <i class="fas fa-plus"></i> Nuevo
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredPlanes.length === 0 && (
        <div className="text-center text-muted py-4">
          {search ? "No se encontraron resultados." : "No hay planes registrados."}
        </div>
      )}

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Días/semana</th>
            <th>Precio</th>
            <th>Salas</th>
            <th>Activo</th>
            {usuarioRol === "Administrador" && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {visiblePlanes.length > 0 ? (
            visiblePlanes.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.diasPorSemana}</td>
              <td>${p.precio}</td>
              <td>
                {p.salas && p.salas.length > 0 ? (
                  <div className="d-flex flex-wrap gap-1">
                    {p.salas.map((sala) => (
                      <span
                        key={sala.id}
                        className="badge bg-info"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <i className="fas fa-map-marker-alt"></i> {sala.nombre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td>{p.activo ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>}</td>
              {usuarioRol === "Administrador" && (
                <td>
                  <ActionGroup>
                    <ActionButton
                      action="edit"
                      tooltip="Editar plan"
                      variant="warning"
                      onClick={() => PlanEditSwal(p.id.toString(), fetchPlanes)}
                    >
                      <i class="fas fa-edit"></i>
                    </ActionButton>
                    <ActionButton
                      action="delete"
                      tooltip="Eliminar plan"
                      variant="danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </ActionButton>
                  </ActionGroup>
                </td>
              )}
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan={usuarioRol === "Administrador" ? 6 : 5} className="text-center text-muted py-3">
                {search ? "No se encontraron resultados." : "No hay planes registrados."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}


