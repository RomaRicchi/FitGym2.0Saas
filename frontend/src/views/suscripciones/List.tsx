import { useEffect, useState, useRef, useMemo } from "react";
import Pagination from "@/components/Pagination";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import { mostrarFormEditarSuscripcion } from "@/views/suscripciones/SuscripcionEdit";
import { asignarTurnos } from "@/views/agenda/suscripcionTurno/asignarTurnos";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-suscripcion.css";
interface Suscripcion {
  id: number;
  socio: string;
  plan: string;
  plan_id?: number;
  inicio: string;
  fin: string;
  estado: boolean;
  creado_en: string;
  orden_pago_id?: number;
  turnosAsignados?: number;
  cupoMaximo?: number;
}

export default function SuscripcionesList() {
  const [allSuscripciones, setAllSuscripciones] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroSocio, setFiltroSocio] = useState("");
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

  const esAdmin = usuarioRol === "Administrador";

  const filteredSuscripciones = useMemo(() => {
    if (!filtroSocio) return allSuscripciones;
    const filtroLower = filtroSocio.toLowerCase();
    return allSuscripciones.filter(s =>
      s.socio.toLowerCase().includes(filtroLower)
    );
  }, [allSuscripciones, filtroSocio]);

  // Paginar resultados filtrados
  const totalItems = filteredSuscripciones.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const visibleSuscripciones = filteredSuscripciones.slice(startIndex, startIndex + pageSize);


  const fetchSuscripciones = async () => {
    setLoading(true);
    try {
      // Cargar TODAS las suscripciones (sin paginación del backend)
      const res = await gymApi.get(`/suscripciones?pageSize=1000`);
      const data = res.data;
      const items = data.items || data;

      // Mantiene la lógica original (turnos + plan)
      const parsed: Suscripcion[] = await Promise.all(
        items.map(async (s: any) => {
          try {
            // Buscar turnos asignados
            const { data: turnos } = await gymApi.get(
              `/suscripcionturno/suscripcion/${s.id}`
            );

            // Buscar el plan para calcular cupo máximo (días por semana)
            let diasPorSemana = 0;
            if (s.planId) {
              const { data: plan } = await gymApi.get(`/planes/${s.planId}`);
              diasPorSemana = Number(
                plan.diasPorSemana ??
                  plan.dias_por_semana ??
                  plan.DiasPorSemana ??
                  0
              );
            }

            return {
              id: s.id,
              socio: s.socio ?? "-",
              plan: s.plan ?? "-",
              plan_id: s.planId,
              inicio: s.inicio,
              fin: s.fin,
              estado: Boolean(s.estado),
              creado_en: s.creadoEn,
              orden_pago_id: s.ordenPagoId,
              turnosAsignados: turnos.length,
              cupoMaximo: diasPorSemana,
            };
          } catch (error) {
            return {
              id: s.id,
              socio: s.socio ?? "-",
              plan: s.plan ?? "-",
              inicio: s.inicio,
              fin: s.fin,
              estado: Boolean(s.estado),
              creado_en: s.creadoEn,
              turnosAsignados: 0,
              cupoMaximo: 0,
            };
          }
        })
      );

      setAllSuscripciones(parsed);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las suscripciones",
        customClass: {
          popup: "swal2-card-suscripcion",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSuscripciones();
  }, []);

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    setPage(1);
  }, [filtroSocio]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar suscripción?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-suscripcion",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await gymApi.delete(`/suscripciones/${id}`);
      await Swal.fire({
        icon: "success",
        title: "Eliminada",
        text: "Suscripción eliminada correctamente",
        customClass: {
          popup: "swal2-card-suscripcion",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      fetchSuscripciones();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la suscripción",
        customClass: {
          popup: "swal2-card-suscripcion",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  return (
    <div className="mt-4">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        SUSCRIPCIONES
      </h1>

      <div className="mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-8">
            <input
              ref={searchInputRef}
              type="text"
              className="form-control"
              placeholder="Buscar por nombre de socio..."
              value={filtroSocio}
              onChange={(e) => setFiltroSocio(e.target.value)}
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
          <div className="col-12 col-md-4 d-flex gap-2">
            <button
              className="btn btn-warning fw-semibold flex-grow-1 flex-md-grow-0"
              style={{
                backgroundColor: "var(--tenant-primary-color)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                transition: "all 0.2s ease",
                height: "38px",
                fontSize: "0.875rem",
                padding: "4px 16px",
                minWidth: "80px",
              }}
              onClick={() => {
                setFiltroSocio("");
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
                  fontSize: "0.875rem",
                  padding: "4px 16px",
                  minWidth: "80px",
                }}
                onClick={() => window.print()}
                title="Imprimir lista de suscripciones"
              >
                <i className="fa-solid fa-file-pdf"></i> PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && allSuscripciones.length === 0 && (
        <div className="text-center my-4">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Vista de tarjetas para móvil */}
      <div className="d-md-none">
        {visibleSuscripciones.length > 0 ? (
          <div className="row g-3">
            {visibleSuscripciones.map((s) => {
              const completado =
                (s.cupoMaximo ?? 0) > 0 &&
                (s.turnosAsignados ?? 0) >= (s.cupoMaximo ?? 0);

              return (
                <div key={s.id} className="col-12">
                  <div className="card shadow-sm" style={{ backgroundColor: "#1e1e1e", borderColor: "var(--tenant-primary-color)", borderWidth: "1px" }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <h5 className="fw-bold mb-1" style={{ color: "var(--tenant-primary-color)" }}>{s.socio}</h5>
                          <p className="mb-0 small" style={{ color: "#ffffff" }}>Plan: {s.plan}</p>
                        </div>
                        <span style={{ fontSize: "1.5rem" }}>
                          {s.estado ? (
                            <i className="fas fa-check-circle" style={{color: "#00e676"}}></i>
                          ) : (
                            <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>
                          )}
                        </span>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <small className="d-block" style={{ color: "#cccccc" }}>Inicio</small>
                          <small style={{ color: "#ffffff" }}>{new Date(s.inicio).toLocaleDateString()}</small>
                        </div>
                        <div className="col-6">
                          <small className="d-block" style={{ color: "#cccccc" }}>Fin</small>
                          <small style={{ color: "#ffffff" }}>{new Date(s.fin).toLocaleDateString()}</small>
                        </div>
                        <div className="col-6">
                          <small className="d-block" style={{ color: "#cccccc" }}>Turnos</small>
                          <small style={{ color: completado ? "#00e676" : "var(--tenant-primary-color)" }}>
                            {s.turnosAsignados ?? 0}/{s.cupoMaximo ?? "?"}
                          </small>
                        </div>
                      </div>

                      <ActionGroup className="flex-wrap">
                        <ActionButton
                          action="edit"
                          tooltip="Editar suscripción"
                          variant="warning"
                          className="btn-turno-fixed"
                          onClick={async () => {
                            const ok = await mostrarFormEditarSuscripcion(s.id);
                            if (ok) fetchSuscripciones();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                        </ActionButton>

                        {usuarioRol === "Administrador" && (
                          <ActionButton
                            action="delete"
                            tooltip="Eliminar suscripción"
                            variant="danger"
                            className="btn-turno-fixed"
                            onClick={() => handleDelete(s.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </ActionButton>
                        )}

                        <ActionButton
                          action="custom"
                          tooltip={completado ? "Todos los turnos ya fueron asignados" : "Asignar turnos al socio"}
                          variant={completado ? "secondary" : "primary"}
                          className="btn-turno-fixed"
                          onClick={async () => {
                            if (!completado) {
                              await asignarTurnos(s, fetchSuscripciones);
                            }
                          }}
                          disabled={completado}
                        >
                          <i className="fas fa-calendar-days"></i>
                        </ActionButton>
                      </ActionGroup>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            No hay suscripciones registradas.
          </div>
        )}
      </div>

      {/* Vista de tabla para desktop */}
      <div className="d-none d-md-block table-responsive">
        <table className="table table-striped table-hover align-middle text-center shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Socio</th>
              <th>Plan</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Turnos</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {visibleSuscripciones.length > 0 ? (
              visibleSuscripciones.map((s) => {
                const completado =
                  (s.cupoMaximo ?? 0) > 0 &&
                  (s.turnosAsignados ?? 0) >= (s.cupoMaximo ?? 0);

                return (
                  <tr key={s.id}>
                    <td>{s.socio}</td>
                    <td>{s.plan}</td>
                    <td>{new Date(s.inicio).toLocaleDateString()}</td>
                    <td>{new Date(s.fin).toLocaleDateString()}</td>
                    <td>
                      {s.estado ? (
                        <i className="fas fa-check-circle" style={{color: "#00e676"}}></i>
                      ) : (
                        <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>
                      )}
                    </td>
                    <td>
                      {(s.turnosAsignados ?? 0)}/{s.cupoMaximo ?? "?"}
                    </td>
                    <td>
                      <ActionGroup className="justify-content-center">
                        <ActionButton
                          action="edit"
                          tooltip="Editar suscripción"
                          variant="warning"
                          onClick={async () => {
                            const ok = await mostrarFormEditarSuscripcion(s.id);
                            if (ok) fetchSuscripciones();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                        </ActionButton>

                        {usuarioRol === "Administrador" && (
                          <ActionButton
                            action="delete"
                            tooltip="Eliminar suscripción"
                            variant="danger"
                            onClick={() => handleDelete(s.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </ActionButton>
                        )}

                        <ActionButton
                          action="assign"
                          tooltip={completado ? "Todos los turnos ya fueron asignados" : "Asignar turnos al socio"}
                          variant={completado ? "secondary" : "primary"}
                          onClick={async () => {
                            if (!completado) {
                              await asignarTurnos(s, fetchSuscripciones);
                            }
                          }}
                          disabled={completado}
                        >
                          <i className="fas fa-calendar-days"></i>
                        </ActionButton>
                      </ActionGroup>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-muted">
                  No hay suscripciones registradas.
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


