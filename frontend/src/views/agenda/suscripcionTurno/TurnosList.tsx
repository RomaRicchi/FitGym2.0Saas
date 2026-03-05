import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import Pagination from "@/components/Pagination";
import { ActionButton, ActionGroup } from "@/components/ActionButton";
import gymApi from "@/api/gymApi";
import { AsignarRutinaSwal } from "./AsignarRutinaSwal";

type Socio = { id: number; nombre: string; email?: string };
type Profesor = { id?: number; nombre: string };
type Dia = { id?: number; nombre: string };

type Turno = {
  id: number;
  suscripcion?: { socio?: Socio; socioId?: number };
  socioId?: number;
  socio?: Socio;
  turnoPlantilla?: {
    id: number;
    horaInicio: string;
    duracionMin?: number;
    diaSemana?: Dia;
    sala?: { nombre: string; cupoTotal?: number; cupoDisponible?: number };
    personal?: Profesor;
    personalId?: number;
    personal_id?: number;
  };
  rutina?: { id: number; nombre: string; objetivo?: string; profesorNombre?: string };
};

const diasOrden = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function TurnosList() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [dias, setDias] = useState<Dia[]>([]);
  const [filtroSocio, setFiltroSocio] = useState("");
  const [selectedProfesor, setSelectedProfesor] = useState<string | null>(null);
  const [selectedDia, setSelectedDia] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const usuario = useMemo(() => JSON.parse(sessionStorage.getItem("usuario") || "{}"), []);
  const rol = usuario?.rol || usuario?.Rol;
  const idPersonal: number | null = usuario?.personalId ?? null;

  // Si no hay rol válido, no mostrar nada
  if (!rol) return null;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const requests = [
          gymApi.get("/suscripcionturno/con-checkin"),
          gymApi.get("/diassemana"),
          gymApi.get("/personal"),
        ];

        const responses = await Promise.all(requests);

        const turnosRes = responses[0];
        const diasRes = responses[1];
        const profRes = responses[2];

        setTurnos(turnosRes.data.data || turnosRes.data.items || turnosRes.data);
        setDias((diasRes.data.items || diasRes.data).sort((a: Dia, b: Dia) => diasOrden.indexOf(a.nombre ?? "") - diasOrden.indexOf(b.nombre ?? "")));
        setProfesores((profRes.data.items || profRes.data)
          .filter((p: any) => p.rol === "Profesor" || p.usuario?.rol === "Profesor")
          .map((p: any) => ({ id: p.id, nombre: p.nombre })));
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los turnos o filtros",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [rol]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar turno?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: { popup: "swal2-card-style", confirmButton: "btn btn-danger", cancelButton: "btn btn-secondary" },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;

    try {
      await gymApi.delete(`/SuscripcionTurno/${id}`);
      await Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "Turno eliminado correctamente",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
        timer: 2000,
        showConfirmButton: false,
      });
      setTurnos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el turno",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
      });
    }
  };

  const filtered = useMemo(() => {
    const diaActualIdx = new Date().getDay(); // 0=Domingo
    const numeroDiaActual = diaActualIdx === 0 ? 7 : diaActualIdx; // map to 1-7

    return turnos.filter((t) => {
      const turnoDiaNombre = t.turnoPlantilla?.diaSemana?.nombre;
      const numeroDia = turnoDiaNombre ? diasOrden.indexOf(turnoDiaNombre) + 1 : numeroDiaActual;
      const diaPasadoOk = numeroDia >= numeroDiaActual;

      const socio = t.suscripcion?.socio?.nombre || t.socio?.nombre || "";
      const socioOk = filtroSocio
        ? socio.toLowerCase().includes(filtroSocio.toLowerCase())
        : true;

      const turnoPersonalId =
        t.turnoPlantilla?.personal?.id ??
        t.turnoPlantilla?.personalId ??
        t.turnoPlantilla?.personal_id;
      const profOk =
        rol === "Profesor" && idPersonal
          ? Number(turnoPersonalId) === Number(idPersonal)
          : selectedProfesor
          ? t.turnoPlantilla?.personal?.nombre === selectedProfesor
          : true;

      const diaOk = selectedDia ? turnoDiaNombre === selectedDia : true;

      return diaPasadoOk && socioOk && profOk && diaOk;
    });
  }, [turnos, filtroSocio, selectedProfesor, selectedDia, rol, idPersonal]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTurnos = filtered.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3">Cargando turnos asignados...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "100%", padding: "0 15px 15px 15px" }}>
      <h1 className="titulo-modulo">TURNOS ASIGNADOS</h1>

      <div className="d-flex gap-3 mb-3 flex-wrap align-items-center">
        {rol !== "Profesor" && (
          <div style={{ flex: 1, minWidth: 220 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre de socio..."
              value={filtroSocio}
              onChange={(e) => setFiltroSocio(e.target.value)}
              style={{ height: "38px" }}
            />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 180 }}>
          <Select
            options={dias.map((d) => ({ value: d.nombre, label: d.nombre }))}
            placeholder="Filtrar por día..."
            isClearable
            onChange={(opt) => setSelectedDia(opt ? opt.value : null)}
          />
        </div>

        {rol !== "Profesor" && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <Select
              options={profesores.map((p) => ({ value: p.nombre, label: p.nombre }))}
              placeholder="Filtrar por profesor..."
              isClearable
              onChange={(opt) => setSelectedProfesor(opt ? opt.value : null)}
            />
          </div>
        )}

        <button
          className="btn btn-warning fw-semibold px-3"
          style={{ backgroundColor: "var(--tenant-primary-color)", border: "none", color: "white", height: "38px" }}
          onClick={() => {
            setFiltroSocio("");
            setSelectedProfesor(null);
            setSelectedDia(null);
            setCurrentPage(1);
          }}
        >
          Limpiar filtros
        </button>
      </div>

      <div
        className="table-responsive"
        style={{
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
      >
        <style>{`
          .table-responsive::-webkit-scrollbar {
            height: 10px;
          }
          .table-responsive::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .table-responsive::-webkit-scrollbar-thumb {
            background: #495057;
            border-radius: 10px;
          }
          .table-responsive::-webkit-scrollbar-thumb:hover {
            background: #343a40;
          }
          .table-responsive::-webkit-scrollbar-button {
            display: none;
          }
        `}</style>
        <table className="table table-striped table-hover align-middle text-center shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Socio</th>
              <th>Día</th>
              <th>Hora</th>
              <th>Sala</th>
              <th>Profesor</th>
              <th>Rutina</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleTurnos.length > 0 ? (
              visibleTurnos.map((t) => {
                const turno = t.turnoPlantilla;
                const socio = t.suscripcion?.socio?.nombre || t.socio?.nombre || "—";
                const dia = turno?.diaSemana?.nombre || "—";
                const hora = turno?.horaInicio?.slice(0, 5) || "—";
                const sala = turno?.sala?.nombre || "—";
                const profesor = turno?.personal?.nombre || "—";

                return (
                  <tr key={t.id}>
                    <td>{socio}</td>
                    <td>{dia}</td>
                    <td>{hora}</td>
                    <td>{sala}</td>
                    <td>{profesor}</td>
                    <td>
                      {t.rutina?.nombre ? (
                        t.rutina.nombre
                      ) : (
                        <span className="text-muted">Sin rutina</span>
                      )}
                    </td>
                    <td>
                      <ActionGroup className="justify-content-center">
                        {(rol === "Administrador" || rol === "Profesor") && (
                          <ActionButton
                            action="custom"
                            tooltip="Asignar rutina"
                            variant="primary"
                            onClick={() =>
                              AsignarRutinaSwal(
                                t.id,
                                t.suscripcion?.socio?.nombre || "este socio",
                                async () => {
                                  const res = await gymApi.get("/suscripcionturno/con-checkin");
                                  setTurnos(res.data.data || res.data.items || res.data);
                                }
                              )
                            }
                          >
                            <i className="bi bi-clipboard-check"></i>
                          </ActionButton>
                        )}
                        {rol === "Administrador" && (
                          <ActionButton
                            action="delete"
                            tooltip="Eliminar turno"
                            variant="danger"
                            onClick={() => handleDelete(t.id)}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </ActionButton>
                        )}
                      </ActionGroup>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-muted">
                  No hay turnos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}


