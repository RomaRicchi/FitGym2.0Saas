import { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import { PersonalCreateSwal } from "@/views/personal/PersonalCreateSwal";
import { PersonalEditSwal } from "@/views/personal/PersonalEditSwal";
import { UsuarioCreateSwal } from "@/views/usuarios/UsuarioCreateSwal";
import Pagination from "@/components/Pagination";

interface Personal {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  especialidad: string;
  fechaNacimiento?: string;
  rol: string;
  activo: boolean;
}

export default function PersonalList() {
  const [allPersonal, setAllPersonal] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [emailUsuariosSet, setEmailUsuariosSet] = useState<Set<string>>(new Set());
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

  const filteredPersonal = useMemo(() => {
    if (!search) return allPersonal;
    const filtroLower = search.toLowerCase();
    return allPersonal.filter(p =>
      p.nombre.toLowerCase().includes(filtroLower) ||
      p.email?.toLowerCase().includes(filtroLower) ||
      p.rol?.toLowerCase().includes(filtroLower)
    );
  }, [allPersonal, search]);

  const totalItems = filteredPersonal.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const visiblePersonal = filteredPersonal.slice(startIndex, startIndex + pageSize);

  const fetchPersonal = async () => {
    setLoading(true);
    try {
      const res = await gymApi.get("/personal");
      const data = res.data.items || res.data;
      setAllPersonal(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar el personal.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuariosEmails = async () => {
    try {
      const res = await gymApi.get("/usuarios");
      const usuarios = res.data.items || res.data || [];
      const emails = new Set<string>(
        usuarios.map((u: any) => u.email?.toLowerCase()).filter((e: string | undefined): e is string => Boolean(e))
      );
      setEmailUsuariosSet(emails);
    } catch {
      // Si falla, continuar con el set vacío
    }
  };

  useEffect(() => {
    fetchPersonal();
    fetchUsuariosEmails();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const personalTieneUsuario = (email?: string) =>
    email ? emailUsuariosSet.has(email.toLowerCase()) : false;

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-ejercicio",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      try {
        await gymApi.delete(`/personal/${id}`);
        await Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El registro fue eliminado correctamente",
          customClass: {
            popup: "swal2-card-ejercicio",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        fetchPersonal();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el registro",
          customClass: {
            popup: "swal2-card-ejercicio",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="mt-4">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        PERSONAL
      </h1>

      <div className="mb-3">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-6">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por nombre, email o rol..."
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
                onClick={() => PersonalCreateSwal(fetchPersonal)}
                className="btn btn-success fw-semibold flex-grow-1 flex-md-grow-0"
                style={{
                  height: "38px",
                  padding: "0 24px",
                  whiteSpace: "nowrap"
                }}
              >
                <i className="fas fa-plus"></i> Nuevo
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && allPersonal.length === 0 && (
        <div className="text-center my-4">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {!loading && filteredPersonal.length === 0 && (
        <div className="text-center text-muted py-4">
          {search ? "No se encontraron resultados." : "No hay personal registrado."}
        </div>
      )}

      {/* Vista de tarjetas para móvil */}
      <div className="d-md-none">
        {visiblePersonal.length > 0 ? (
          <div className="row g-3">
            {visiblePersonal.map((p) => (
              <div key={p.id} className="col-12">
                <div className="card shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h5 className="fw-bold mb-1" style={{ color: "var(--tenant-primary-color)" }}>{p.nombre}</h5>
                        <p className="mb-0 small" style={{ color: "#ffffff" }}>{p.rol || "(Sin rol)"}</p>
                      </div>
                      <span style={{ fontSize: "1.5rem" }}>{p.activo ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>}</span>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-12">
                        <small className="d-block" style={{ color: "#cccccc" }}>Email</small>
                        <small style={{ color: "#ffffff" }}>{p.email || "—"}</small>
                      </div>
                      <div className="col-6">
                        <small className="d-block" style={{ color: "#cccccc" }}>Teléfono</small>
                        <small style={{ color: "#ffffff" }}>{p.telefono || "—"}</small>
                      </div>
                      <div className="col-6">
                        <small className="d-block" style={{ color: "#cccccc" }}>Dirección</small>
                        <small style={{ color: "#ffffff" }}>{p.direccion || "—"}</small>
                      </div>
                      {p.especialidad && (
                        <div className="col-12">
                          <small className="d-block" style={{ color: "#cccccc" }}>Especialidad</small>
                          <small style={{ color: "#ffffff" }}>{p.especialidad}</small>
                        </div>
                      )}
                      <div className="col-6">
                        <small className="d-block" style={{ color: "#cccccc" }}>F. Nacimiento</small>
                        <small style={{ color: "#ffffff" }}>
                          {p.fechaNacimiento
                            ? new Date(p.fechaNacimiento).toLocaleDateString('es-AR')
                            : "—"}
                        </small>
                      </div>
                    </div>

                    <ActionGroup>
                      <ActionButton
                        action="custom"
                        tooltip={personalTieneUsuario(p.email) ? "Ya tiene usuario de acceso" : "Crear usuario de acceso"}
                        variant={personalTieneUsuario(p.email) ? "secondary" : "primary"}
                        className="flex-grow-1"
                        disabled={personalTieneUsuario(p.email)}
                        onClick={async () => {
                          const ok = await UsuarioCreateSwal({
                            personalId: p.id,
                            nombre: p.nombre,
                            email: p.email,
                            onSuccess: () => {
                              fetchPersonal();
                              fetchUsuariosEmails();
                            },
                            rol: usuarioRol,
                          });
                          if (ok) {
                            fetchPersonal();
                            fetchUsuariosEmails();
                          }
                        }}
                      >
                        {personalTieneUsuario(p.email) ? <i className="fas fa-check-circle"></i> : <i className="fas fa-user"></i>}
                      </ActionButton>
                      {usuarioRol === "Administrador" && (
                        <>
                          <ActionButton
                            action="edit"
                            variant="warning"
                            className="flex-grow-1"
                            onClick={() => PersonalEditSwal(p.id.toString(),"admin", fetchPersonal)}
                          >
                            <i class="fas fa-edit"></i>
                          </ActionButton>
                          <ActionButton
                            action={p.activo ? "delete" : "custom"}
                            tooltip={p.activo ? "Dar de baja" : "Reactivar"}
                            variant={p.activo ? "danger" : "success"}
                            className="flex-grow-1"
                            onClick={async () => {
                              if (p.activo) {
                                await handleDelete(p.id);
                              } else {
                                // Reactivar personal
                                try {
                                  await gymApi.patch(`/personal/${p.id}/reactivar`);
                                  await Swal.fire({
                                    icon: "success",
                                    title: '<i className="fas fa-check-circle"></i> Personal reactivado',
                                    text: `${p.nombre} fue reactivado correctamente.`,
                                    timer: 2000,
                                    timerProgressBar: true,
                                    showConfirmButton: false,
                                  });
                                  await fetchPersonal();
                                } catch {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "No se pudo reactivar el personal.",
                                  });
                                }
                              }
                            }}
                          >
                            {p.activo ? <i className="fas fa-trash"></i> : <i className="fas fa-rotate-right"></i>}
                          </ActionButton>
                        </>
                      )}
                    </ActionGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Vista de tabla para desktop */}
      <div className="d-none d-md-block table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Especialidad</th>
              <th>F. Nacimiento</th>
              <th>Rol</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visiblePersonal.length > 0 ? (
              visiblePersonal.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.email || "-"}</td>
                <td>{p.telefono || "-"}</td>
                <td>{p.direccion || "-"}</td>
                <td>{p.especialidad || "-"}</td>
                <td>
                  {p.fechaNacimiento
                    ? new Date(p.fechaNacimiento).toLocaleDateString('es-AR')
                    : "—"}
                </td>
                <td>{p.rol || "(Sin rol)"}</td>
                <td>{p.activo ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>}</td>
                <td>
                  <ActionGroup className="justify-content-end">
                    <ActionButton
                      action="custom"
                      tooltip={personalTieneUsuario(p.email) ? "Ya tiene usuario de acceso" : "Crear usuario de acceso"}
                      variant={personalTieneUsuario(p.email) ? "secondary" : "primary"}
                      disabled={personalTieneUsuario(p.email)}
                      onClick={async () => {
                        const ok = await UsuarioCreateSwal({
                          personalId: p.id,
                          nombre: p.nombre,
                          email: p.email,
                          onSuccess: () => {
                            fetchPersonal();
                            fetchUsuariosEmails();
                          },
                          rol: usuarioRol,
                        });
                        if (ok) {
                          fetchPersonal();
                          fetchUsuariosEmails();
                        }
                      }}
                    >
                      {personalTieneUsuario(p.email) ? <i className="fas fa-check-circle"></i> : <i className="fas fa-user"></i>}
                    </ActionButton>
                    {usuarioRol === "Administrador" && (
                      <>
                        <ActionButton
                          action="edit"
                          variant="warning"
                          onClick={() => PersonalEditSwal(p.id.toString(),"admin", fetchPersonal)}
                        >
                          <i class="fas fa-edit"></i>
                        </ActionButton>
                        <ActionButton
                          action={p.activo ? "delete" : "custom"}
                          tooltip={p.activo ? "Dar de baja" : "Reactivar"}
                          variant={p.activo ? "danger" : "success"}
                          onClick={async () => {
                            if (p.activo) {
                              await handleDelete(p.id);
                            } else {
                              // Reactivar personal
                              try {
                                await gymApi.patch(`/personal/${p.id}/reactivar`);
                                await Swal.fire({
                                  icon: "success",
                                  title: '<i className="fas fa-check-circle"></i> Personal reactivado',
                                  text: `${p.nombre} fue reactivado correctamente.`,
                                  timer: 2000,
                                  timerProgressBar: true,
                                  showConfirmButton: false,
                                });
                                await fetchPersonal();
                              } catch {
                                Swal.fire({
                                  icon: "error",
                                  title: "Error",
                                  text: "No se pudo reactivar el personal.",
                                });
                              }
                            }
                          }}
                        >
                          {p.activo ? <i className="fas fa-trash"></i> : <i className="fas fa-rotate-right"></i>}
                        </ActionButton>
                      </>
                    )}
                  </ActionGroup>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-muted py-3">
                  {search ? "No se encontraron resultados." : "No hay personal registrado."}
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


