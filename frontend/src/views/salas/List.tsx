import { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import { SalaCreateSwal } from "@/views/salas/SalaCreateSwal";
import { SalaEditSwal } from "@/views/salas/SalaEditSwal";
import Pagination from "@/components/Pagination";   

interface Sala {
  id: number;
  nombre: string;
  cupo: number;
  activa: boolean | number;
}

export default function SalasList() {
  const [allSalas, setAllSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredSalas = useMemo(() => {
    if (!search) return allSalas;
    const filtroLower = search.toLowerCase();
    return allSalas.filter(s =>
      s.nombre.toLowerCase().includes(filtroLower)
    );
  }, [allSalas, search]);

  const totalItems = filteredSalas.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const visibleSalas = filteredSalas.slice(startIndex, startIndex + pageSize);

  const fetchSalas = async () => {
    try {
      const res = await gymApi.get("/salas");
      const data = res.data.items || res.data;
      const parsed = data.map((s: any) => ({ ...s, activa: Boolean(s.activa) }));
      setAllSalas(parsed);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las salas",
        customClass: {
          popup: "swal2-card-ejercicio",
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
    fetchSalas();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar sala?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (confirm.isConfirmed) {
      try {
        await gymApi.delete(`/salas/${id}`);
        Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "Sala eliminada correctamente",
          customClass: {
            popup: "swal2-card-ejercicio",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        fetchSalas();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la sala",
          customClass: {
            popup: "swal2-card-ejercicio",
            confirmButton: "btn btn-orange",
            cancelButton: "btn btn-secondary",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  if (loading) return <p>Cargando salas...</p>;

  return (
    <div className="mt-4">
      <h1
          className="text-center fw-bold mb-4"
          style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
        >
          SALAS
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

            <button
              onClick={() => SalaCreateSwal(fetchSalas)}
              className="btn btn-success fw-semibold flex-grow-1 flex-md-grow-0"
              style={{
                height: "38px",
                padding: "0 24px",
                whiteSpace: "nowrap"
              }}
            >
              <i class="fas fa-plus"></i> Nueva
            </button>
          </div>
        </div>
      </div>

      {filteredSalas.length === 0 && (
        <div className="text-center text-muted py-4">
          {search ? "No se encontraron resultados." : "No hay salas registradas."}
        </div>
      )}

      {/* Vista de tarjetas para móvil */}
      <div className="d-md-none">
        {visibleSalas.length > 0 ? (
          <div className="row g-3">
            {visibleSalas.map((s) => (
              <div key={s.id} className="col-12">
                <div className="card shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h5 className="fw-bold mb-1" style={{ color: "var(--tenant-primary-color)" }}>{s.nombre}</h5>
                        <p className="mb-0 small" style={{ color: "#ffffff" }}>
                          Cupo máximo: <span style={{ color: "#00e676", fontWeight: "bold" }}>{s.cupo}</span> personas
                        </p>
                      </div>
                      <span style={{ fontSize: "1.5rem" }}>{s.activa ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>}</span>
                    </div>

                    <ActionGroup>
                      <ActionButton
                        action="edit"
                        tooltip="Editar sala"
                        variant="warning"
                        className="flex-grow-1"
                        onClick={() => SalaEditSwal(s.id.toString(), fetchSalas)}
                      >
                        <i class="fas fa-edit"></i>
                      </ActionButton>
                      <ActionButton
                        action="delete"
                        tooltip="Eliminar sala"
                        variant="danger"
                        className="flex-grow-1"
                        onClick={() => handleDelete(s.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </ActionButton>
                    </ActionGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Vista de tabla para desktop */}
      <div className="d-none d-md-block">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Cupo</th>
              <th>Activa</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleSalas.length > 0 ? (
              visibleSalas.map((s) => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>{s.cupo}</td>
                <td>{s.activa ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>}</td>
                <td>
                  <ActionGroup>
                    <ActionButton
                      action="edit"
                      tooltip="Editar sala"
                      variant="warning"
                      onClick={() => SalaEditSwal(s.id.toString(), fetchSalas)}
                    >
                      <i className="fas fa-edit"></i>
                    </ActionButton>
                    <ActionButton
                      action="delete"
                      tooltip="Eliminar sala"
                      variant="danger"
                      onClick={() => handleDelete(s.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </ActionButton>
                  </ActionGroup>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  {search ? "No se encontraron resultados." : "No hay salas registradas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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


