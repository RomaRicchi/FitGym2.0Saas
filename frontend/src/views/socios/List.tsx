import { useEffect, useState, useRef, useMemo } from "react";
import Pagination from "@/components/Pagination";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import { mostrarFormNuevoSocio } from "@/views/socios/SociosCreateSwal";
import { mostrarFormEditarSocio } from "@/views/socios/SociosEditSwal";
import { crearOrdenDePago } from "@/views/gestionPagos/formOrdenPago";
import { UsuarioCreateSwal } from "@/views/usuarios/UsuarioCreateSwal";

interface Socio {
  id: number;
  dni: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  creado_en: string;
  fechaNacimiento?: string;
  planActual?: string;
}

export default function SociosList() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [usuariosEmails, setUsuariosEmails] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [usuarioRol, setUsuarioRol] = useState<string>("");

  useEffect(() => {
    // Obtener rol del usuario logueado
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

  const esAdmin = usuarioRol === "Administrador";

  const fetchSocios = async () => {
    setLoading(true);
    try {
      const res = await gymApi.get(`/socios?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(search)}`);
      const data = res.data;
      setSocios(data.items || []);
      setTotalItems(data.totalItems || data.total || 0);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los socios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchSocios();
    }, 400);
    return () => clearTimeout(delay);
  }, [page, search]);

  const emailUsuariosSet = useMemo(() => new Set(usuariosEmails), [usuariosEmails]);

  const fetchUsuariosEmails = async () => {
    try {
      const res = await gymApi.get("/usuarios?page=1&pageSize=1000");
      const items = res.data.items || res.data || [];
      const emails = items
        .map((u: any) => (u.email || u.Email || "").toLowerCase())
        .filter((e: string) => e);
      setUsuariosEmails(emails);
    } catch {
      // silencioso: si falla, se mostrará el botón igualmente
    }
  };

  useEffect(() => {
    fetchUsuariosEmails();
  }, []);

  const socioTieneUsuario = (email?: string) =>
    email ? emailUsuariosSet.has(email.toLowerCase()) : false;


  const handleDelete = async (id: number, nombre: string) => {
    const result = await Swal.fire({
      title: `¿Dar de baja a ${nombre}?`,
      text: "El socio no se eliminará del sistema, solo se marcará como inactivo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await gymApi.patch(`/socios/${id}/bajaLogica?value=false`);
        Swal.fire({
          icon: "success",
          title: "Socio dado de baja",
          text: `${nombre} fue marcado como inactivo.`,
          timer: 1800,
          showConfirmButton: false,
        });
        fetchSocios(); // recarga la lista
      } catch (err) {
        Swal.fire("Error", "No se pudo dar de baja al socio.", "error");
      }
    }
  };


  const handleSuscribirse = async (id: number, nombre: string) => {
    const exito = await crearOrdenDePago({ id, nombre });
    if (exito) {
      fetchSocios(); // Recargar lista después de crear suscripción exitosamente
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="mt-4">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        SOCIOS
      </h1>

      <div className="mb-3">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-6">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={search}
              onChange={handleSearch}
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
          <div className="col-12 col-md-6 d-flex gap-2 flex-wrap">
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

            {esAdmin && (
              <button
                className="btn btn-danger fw-semibold flex-grow-1 flex-md-grow-0"
                style={{
                  height: "38px",
                  padding: "0 24px",
                  whiteSpace: "nowrap",
                }}
                onClick={() => window.print()}
                title="Imprimir lista de socios"
              >
                <i className="fa-solid fa-file-pdf"></i> PDF
              </button>
            )}

            <button
              className="btn btn-success fw-semibold flex-grow-1 flex-md-grow-0"
              style={{
                height: "38px",
                padding: "0 24px",
                whiteSpace: "nowrap",
              }}
              onClick={async () => {
                const creado = await mostrarFormNuevoSocio();
                if (creado) {
                  fetchSocios();
                }
              }}
            >
              <i class="fas fa-plus"></i> Nuevo
            </button>
          </div>
        </div>
      </div>

      {loading && socios.length === 0 && (
        <div className="text-center my-4">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Vista de tarjetas para móvil */}
      <div className="d-md-none">
        {socios.length === 0 ? (
          <div className="text-center text-muted py-4">
            No hay socios registrados.
          </div>
        ) : (
          <div className="row g-3">
            {socios.map((s) => (
              <div key={s.id} className="col-12">
                <div className="card shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: "var(--tenant-primary-color)" }}>{s.nombre}</h5>
                        <p className="mb-0 small" style={{ color: "#ffffff" }}>DNI: {s.dni}</p>
                      </div>
                      <span style={{ fontSize: "1.5rem" }}>{s.activo ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>}</span>
                    </div>
                    <div className="mb-2">
                      <small className="d-block" style={{ color: "#cccccc" }}>Email</small>
                      <small style={{ color: "#ffffff" }}>{s.email || "—"}</small>
                    </div>
                    <div className="mb-2">
                      <small className="d-block" style={{ color: "#cccccc" }}>Teléfono</small>
                      <small style={{ color: "#ffffff" }}>{s.telefono || "—"}</small>
                    </div>
                    <div className="mb-2">
                      <small className="d-block" style={{ color: "#cccccc" }}>F. Nacimiento</small>
                      <small style={{ color: "#ffffff" }}>
                        {s.fechaNacimiento
                          ? new Date(s.fechaNacimiento).toLocaleDateString('es-AR')
                          : "—"}
                      </small>
                    </div>
                    <div className="mb-3">
                      <small className="d-block" style={{ color: "#cccccc" }}>Plan actual</small>
                      <small style={{ color: "#00e676" }}>{s.planActual || "— Sin plan —"}</small>
                    </div>
                    <div className="d-flex gap-2 flex-wrap justify-content-end">
                      <ActionGroup>
                        <ActionButton
                          action="custom"
                          tooltip={socioTieneUsuario(s.email) ? "Ya tiene usuario de acceso" : "Crear usuario de acceso"}
                          variant={socioTieneUsuario(s.email) ? "secondary" : "primary"}
                          disabled={socioTieneUsuario(s.email)}
                          onClick={async () => {
                            const creado = await UsuarioCreateSwal({
                              socioId: s.id,
                              nombre: s.nombre,
                              email: s.email,
                              onSuccess: fetchSocios,
                              rol: usuarioRol,
                            });
                            if (creado) {
                              fetchSocios();
                              fetchUsuariosEmails();
                            }
                          }}
                        >
                          {socioTieneUsuario(s.email) ? <i className="fas fa-check-circle"></i> : <i className="fas fa-user"></i>}
                        </ActionButton>
                        <ActionButton
                          action="edit"
                          variant="warning"
                          onClick={async () => {
                            const actualizado = await mostrarFormEditarSocio(s.id);
                            if (actualizado) fetchSocios();
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </ActionButton>
                        <ActionButton
                          action="subscribe"
                          variant="success"
                          onClick={() => handleSuscribirse(s.id, s.nombre)}
                        >
                          <i className="fas fa-credit-card"></i>
                        </ActionButton>
                        {usuarioRol === "Administrador" && (
                          <ActionButton
                            action="delete"
                            tooltip="Dar de baja"
                            variant="danger"
                            onClick={() => handleDelete(s.id, s.nombre)}
                          >
                            <i className="fas fa-trash"></i>
                          </ActionButton>
                        )}
                      </ActionGroup>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vista de tabla para desktop */}
      <div className="d-none d-md-block table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>F. Nacimiento</th>
              <th>Plan actual</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {socios.map((s) => (
              <tr key={s.id}>
                <td>{s.dni}</td>
                <td>{s.nombre}</td>
                <td>{s.email}</td>
                <td>{s.telefono}</td>
                <td>
                  {s.fechaNacimiento
                    ? new Date(s.fechaNacimiento).toLocaleDateString('es-AR')
                    : "—"}
                </td>
                <td>{s.planActual || "— Sin plan —"}</td>
                <td>{s.activo ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>}</td>
                <td>
                  <ActionGroup className="justify-content-end">
                    <ActionButton
                      action="custom"
                      tooltip={socioTieneUsuario(s.email) ? "Ya tiene usuario de acceso" : "Crear usuario de acceso"}
                      variant={socioTieneUsuario(s.email) ? "secondary" : "primary"}
                      disabled={socioTieneUsuario(s.email)}
                      onClick={async () => {
                        const creado = await UsuarioCreateSwal({
                          socioId: s.id,
                          nombre: s.nombre,
                          email: s.email,
                          onSuccess: fetchSocios,
                          rol: usuarioRol,
                        });
                        if (creado) {
                          fetchSocios();
                          fetchUsuariosEmails();
                        }
                      }}
                    >
                      {socioTieneUsuario(s.email) ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-user" style={{color: "#fff"}}></i>}
                    </ActionButton>
                    <ActionButton
                      action="edit"
                      variant="warning"
                      onClick={async () => {
                        const actualizado = await mostrarFormEditarSocio(s.id);
                        if (actualizado) fetchSocios();
                      }}
                    >
                      <i class="fas fa-edit"></i>
                    </ActionButton>
                    <ActionButton
                      action="subscribe"
                      variant="success"
                      onClick={() => handleSuscribirse(s.id, s.nombre)}
                    >
                      <i className="fas fa-credit-card"></i>
                    </ActionButton>
                    {usuarioRol === "Administrador" && (
                      <ActionButton
                        action="delete"
                        tooltip="Dar de baja"
                        variant="danger"
                        onClick={() => handleDelete(s.id, s.nombre)}
                      >
                        <i className="fas fa-trash"></i>
                      </ActionButton>
                    )}
                  </ActionGroup>
                </td>
              </tr>
            ))}
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

    </div>
  );

}


