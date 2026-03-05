import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import gymApi from "@/api/gymApi";
import { UsuarioEditSwal } from "@/views/usuarios/UsuarioEditSwal";
import { UsuarioCreateSwal } from "@/views/usuarios/UsuarioCreateSwal";
import "@/styles/usuarios-list.css";

interface Usuario {
  id: number;
  email: string;
  alias: string;
  rol: string;
  estado: boolean | number;
}

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);
  const [rolId, setRolId] = useState<number | "">("");
  
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await gymApi.get(
        `/usuarios?page=${page}&pageSize=${pageSize}&q=${search}${rolId ? `&rolId=${rolId}` : ""}`
      );

      const data = res.data;
      const items = data.items || data;
      setTotalItems(data.totalItems || items.length);

      const adaptados = items.map((u: any) => ({
        id: u.id,
        email: u.email,
        alias: u.alias,
        rol: u.rol?.nombre || u.rol || "(Sin rol)",
        estado: u.estado ?? 0,
      }));

      setUsuarios(adaptados);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios",
        customClass: {
          popup: "swal2-card-ejercicio",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [page, search, rolId]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await gymApi.get("/roles?page=1&pageSize=100");
        setRoles(res.data.items || res.data || []);
      } catch {
        // silencioso si falla
      }
    };
    loadRoles();
  }, []);

  // 🔸 Limpiar filtros
  const handleClearFilters = () => {
    setSearch("");
    setRolId("");
    setPage(1);
  };

  // 🔸 Desactivar usuario
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Desactivar usuario?",
      text: "Podrás volver a activarlo más tarde.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (confirm.isConfirmed) {
      try {
        await gymApi.delete(`/usuarios/${id}`);
        await Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "Usuario desactivado correctamente",
          customClass: {
            popup: "swal2-card-ejercicio",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        fetchUsuarios();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el usuario",
          customClass: {
            popup: "swal2-card-ejercicio",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3">Cargando usuarios...</p>
      </div>
    );

  return (
    <div className="mt-4">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        USUARIOS
      </h1>

      <div className="mb-3">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-6">
            <input
              type="text"
              placeholder="Buscar por alias o email..."
              className="form-control usuarios-filtro"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ height: "42px" }}
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select usuarios-filtro-select"
              value={rolId}
              aria-label="Filtrar por rol"
              onChange={(e) => {
                const val = e.target.value;
                setRolId(val === "" ? "" : Number(val));
                setPage(1);
              }}
              style={{
                minHeight: "42px",
                padding: "8px 12px",
                lineHeight: 1.2,
                backgroundColor: "#1f1f1f",
                color: "#ffffff",
                borderColor: "var(--tenant-primary-color)",
                fontWeight: 600,
              }}
            >
              <option value="">Todos los roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id} style={{ color: "#000" }}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <button
              className="btn btn-limpiar-usuarios fw-semibold w-100"
              onClick={handleClearFilters}
              style={{ height: "42px" }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <table className="table table-striped table-hover align-middle">
        <thead className="table-dark text-center">
          <tr>
            <th>Alias</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted py-3">
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.id} className="text-center">
                <td>{u.alias}</td>
                <td>{u.email || "—"}</td>
                <td>{u.rol}</td>
                <td>{u.estado ? <><i className="fas fa-check-circle" style={{color: "#00e676"}}></i> Activo</> : <><i className="fas fa-times-circle" style={{color: "#ff1744"}}></i> Inactivo</>}</td>
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => UsuarioEditSwal(u.id, fetchUsuarios)}
                      title="Editar usuario"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(u.id)}
                      title="Desactivar usuario"
                    >
                      <i class="fa-solid fa-lock"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}

