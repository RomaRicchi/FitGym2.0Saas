import { useEffect, useState } from "react";
import { crearTurnoPlantilla } from "./TurnoPlantillaCreate";
import { editarTurnoPlantilla } from "./TurnoPlantillaEdit";
import Pagination from "@/components/Pagination";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

interface Turno {
  id: number;
  sala: { id: number; nombre: string; cupo: number };
  personal: { id: number; nombre: string };
  dia_semana: { id: number; nombre: string };
  hora_inicio: string;
  duracion_min: number;
  activo: boolean | number;
  cupo: number; 
  sala_id?: number;
  personal_id?: number;
  dia_semana_id?: number;
}

export default function TurnosPlantillaList() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [filtered, setFiltered] = useState<Turno[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [dias, setDias] = useState<any[]>([]);
  const [filtroDia, setFiltroDia] = useState<string>("");
  const [filtroProfesor, setFiltroProfesor] = useState<string>("");
  const [filtroSala, setFiltroSala] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
  const rol = usuario?.rol || usuario?.Rol;
  const idPersonal = usuario?.personalId || null;

  useEffect(() => {
    const total = filtered.length;
    setTotalPages(Math.ceil(total / itemsPerPage));

    if (currentPage > Math.ceil(total / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [filtered, itemsPerPage, currentPage]);

  const fetchTurnos = async () => {
    try {
      const [resTurnos, resProfesores, resSalas, resDias] = await Promise.all([
        gymApi.get("/turnosplantilla"),
        gymApi.get("/personal"),
        gymApi.get("/salas"),
        gymApi.get("/diassemana"), 
      ]);

      const payloadTurnos = resTurnos.data?.data ?? resTurnos.data;
      const data = payloadTurnos?.items || payloadTurnos?.data || payloadTurnos || [];
      if (!Array.isArray(data)) throw new Error("Formato inesperado de datos");

      // 🔧 Normalizar campos - backend devuelve diaSemana (camelCase)
      const parsed = data
        .map((t: any) => ({
          ...t,
          activo: Boolean(t.activo),
          // Backend returns diaSemana.id, map to dia_semana_id for filtering
          dia_semana_id: t.dia_semana_id ?? t.diaSemanaId ?? t.diaSemana?.id ?? t.dia_semana?.id,
          hora_inicio: t.hora_inicio ?? t.horaInicio,
          duracion_min: t.duracion_min ?? t.duracionMin,
          personal_id: t.personal_id ?? t.personalId ?? t.personal?.id,
          sala_id: t.sala_id ?? t.salaId ?? t.sala?.id,
          dia_semana: t.dia_semana ?? t.diaSemana ?? null,
          cupo: t.sala?.cupo ?? t.sala?.cupoTotal ?? 0,
        }))
        .sort(
          (a: any, b: any) =>
            (a.dia_semana_id || 0) - (b.dia_semana_id || 0) ||
            (a.hora_inicio || "").localeCompare(b.hora_inicio || "")
        );

      setTurnos(parsed);
      setFiltered(parsed);
      const payloadProf = resProfesores.data?.data ?? resProfesores.data;
      const payloadSalas = resSalas.data?.data ?? resSalas.data;
      const payloadDias = resDias.data?.data ?? resDias.data;
      // Filtrar solo personal con rol "Profesor"
      const todosProfesores = payloadProf?.items || payloadProf || [];
      setProfesores(todosProfesores.filter((p: any) => p.rol === "Profesor"));
      setSalas(payloadSalas?.items || payloadSalas || []);
      setDias(payloadDias?.items || payloadDias || []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los turnos",
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
    fetchTurnos();
  }, []);

  // 🔹 Aplicar filtros
  useEffect(() => {
    let temp = [...turnos];

    // Si el rol es profesor, filtrar solo sus turnos
    if (rol === "Profesor" && idPersonal) {
      temp = temp.filter((t) => t.personal_id === idPersonal);
    } else if (filtroProfesor) {
      // Para otros roles, usar el filtro seleccionado
      temp = temp.filter((t) => t.personal_id === Number(filtroProfesor));
    }

    if (filtroDia)
      temp = temp.filter((t) => t.dia_semana_id === Number(filtroDia));

    if (filtroSala)
      temp = temp.filter((t) => t.sala_id === Number(filtroSala));

    setFiltered(temp);
  }, [filtroDia, filtroProfesor, filtroSala, turnos, rol, idPersonal]);

  // Eliminar turno
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar turno?",
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

    if (result.isConfirmed) {
      try {
        await gymApi.delete(`/turnosplantilla/${id}`);
        await Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "Turno eliminado correctamente",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        fetchTurnos();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el turno",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  if (loading) return <p className="text-center mt-4">Cargando turnos...</p>;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleTurnos = filtered.slice(startIndex, endIndex);

  return (
    <div className="mt-4 container">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        PLANILLA DE TURNOS
      </h1>

      {/* FILTROS */}
      <div className="mb-3">
        <div className="row g-3">
          <div className="col-md-4 col-sm-12">
            <select
              className="form-select"
              style={{
                borderColor: "var(--tenant-primary-color)",
                borderWidth: "2px",
                outline: "2px solid var(--tenant-primary-color)",
              }}
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
            >
              <option value="">Todos los días</option>
              {dias.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de profesor: ocultar para rol Profesor */}
          {rol !== "Profesor" && (
            <div className="col-md-4">
              <select
                className="form-select"
                style={{
                  borderColor: "var(--tenant-primary-color)",
                  borderWidth: "2px",
                  outline: "2px solid var(--tenant-primary-color)",
                }}
                value={filtroProfesor}
                onChange={(e) => setFiltroProfesor(e.target.value)}
              >
                <option value="">Todos los profesores</option>
                {profesores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-md-4">
            <select
              className="form-select"
              style={{
                borderColor: "var(--tenant-primary-color)",
                borderWidth: "2px",
                outline: "2px solid var(--tenant-primary-color)",
              }}
              value={filtroSala}
              onChange={(e) => setFiltroSala(e.target.value)}
            >
              <option value="">Todas las salas</option>
              {salas.map((s) => (
                <option key={s.id} value={s.id}>
                  {`${s.nombre} (${s.cupo} cupos)`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="d-flex justify-content-center gap-3 mb-4">
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
            setFiltroDia("");
            setFiltroProfesor("");
            setFiltroSala("");
          }}
        >
          Limpiar
        </button>
        {/* Botón Nuevo Turno: solo para Admin */}
        {rol === "Administrador" && (
          <button
            className="btn btn-success fw-semibold"
            style={{
              height: "38px",
              padding: "0 24px",
              whiteSpace: "nowrap",
            }}
            onClick={() => crearTurnoPlantilla(fetchTurnos)}
          >
            <i className="fas fa-plus"></i> Nuevo Turno
          </button>
        )}
      </div>

      <table className="tabla-gestion table table-striped table-hover text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>Sala</th>
            <th>Profesor</th>
            <th>Día</th>
            <th>Inicio</th>
            <th>Duración</th>
            <th>Cupo</th>
            <th>Activo</th>
            {rol === "Administrador" && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>{visibleTurnos.map((t) => <tr key={t.id}><td>{t.sala?.nombre || "-"}</td><td>{t.personal?.nombre || "-"}</td><td>{t.dia_semana?.nombre || "-"}</td><td>{t.hora_inicio}</td><td>{t.duracion_min} min</td><td>{t.cupo}</td><td>{t.activo ? <i className="fas fa-check-circle" style={{color: "#00e676"}}></i> : <i className="fas fa-times-circle" style={{color: "#ff1744"}}></i>}</td>{rol === "Administrador" && <td><div className="acciones-botones"><button className="btn-accion btn-editar" onClick={() => editarTurnoPlantilla(t.id, fetchTurnos)}><i className="fas fa-edit"></i></button><button className="btn-accion btn-eliminar" onClick={() => handleDelete(t.id)}><i className="fas fa-trash"></i></button></div></td>}</tr>)}</tbody>
      </table>
      <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
    
  );
}


