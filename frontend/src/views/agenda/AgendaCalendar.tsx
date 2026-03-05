import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import gymApi from "@/api/gymApi";
import { crearTurnoPlantilla } from "@/views/agenda/turnoPlantilla/TurnoPlantillaCreate";
import { editarTurnoPlantilla } from "@/views/agenda/turnoPlantilla/TurnoPlantillaEdit";
import "@/styles/AgendaCalendar.css";

interface TurnoPlantilla {
  id: number;
  sala: { id: number; nombre: string; cupoTotal?: number; cupoDisponible?: number; color?: string };
  personal: { id: number; nombre: string; id_personal?: number };
  diaSemana: { id: number; nombre: string };
  horaInicio: string;
  duracionMin: number;
  activo?: boolean;
}

interface Sala {
  id: number;
  nombre: string;
  color?: string;
}

interface Profesor {
  id: number;
  nombre: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    sala: string;
    profesor: string;
    duracion: number;
    cupoTotal: number;
    cupoDisponible: number;
  };
}

export default function AgendaCalendar() {
  const [eventos, setEventos] = useState<CalendarEvent[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [filtroSala, setFiltroSala] = useState<string>("todos");
  const [filtroProfesor, setFiltroProfesor] = useState<string>("todos");
  const calendarRef = useRef<any>(null);

  const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
  const rol = usuario?.rol || usuario?.Rol;
  const idPersonal = usuario?.personalId || null;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cargarFiltros = async () => {
    try {
      if (rol === "Profesor") {
        const { data: salasRes } = await gymApi.get("/salas");
        setSalas(salasRes.items || salasRes);
        return;
      }

      const [{ data: salasRes }, { data: profRes }] = await Promise.all([
        gymApi.get("/salas"),
        gymApi.get("/personal"),
      ]);

      setSalas(salasRes.items || salasRes);
      // Filtrar solo profesores (rol "Profesor")
      setProfesores((profRes.items || profRes)
        .filter((p: any) => p.rol === "Profesor" || p.usuario?.rol === "Profesor")
        .map((p: any) => ({ id: p.id, nombre: p.nombre }))
      );
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los filtros.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };


  // Cargar turnos plantilla con cupos dinámicos
  const cargarTurnosPlantilla = async () => {
    try {
      const { data } = await gymApi.get("/turnosplantilla/activos");
      let turnos: TurnoPlantilla[] = data.items || data;

      // Si el usuario es profesor, filtrar solo sus turnos
      if (rol === "Profesor" && idPersonal) {
        turnos = turnos.filter((t) => t.personal?.id === idPersonal);
      }

      // Filtros activos
      let filtrados = turnos;
      if (filtroSala !== "todos") {
        filtrados = filtrados.filter((t) => t.sala?.id === Number(filtroSala));
      }
      if (filtroProfesor !== "todos") {
        filtrados = filtrados.filter((t) => t.personal?.id === Number(filtroProfesor));
      }

      // Mapeo a eventos del calendario
      const eventosMapeados = filtrados.map((t) => {
        const [hora, minuto] = t.horaInicio.split(":").map(Number);
        const duracionHoras = Math.floor(t.duracionMin / 60);
        const duracionMinutos = t.duracionMin % 60;

        const horaFin = hora + duracionHoras + Math.floor((minuto + duracionMinutos) / 60);
        const minutoFin = (minuto + duracionMinutos) % 60;

        // 🎨 Color de la sala desde la API (asignado automáticamente al crear la sala)
        const color = t.sala?.color || "var(--tenant-primary-color)";

        // Información de cupo
        const cupoTotal = t.sala?.cupoTotal ?? 0;
        const cupoDisp = t.sala?.cupoDisponible ?? cupoTotal;

        return {
          id: t.id.toString(),
          title: `${t.sala?.nombre || "Sala"} — ${t.personal?.nombre || "Profesor"}`,
          daysOfWeek: [t.diaSemana?.id || 1],
          startTime: `${hora.toString().padStart(2, "0")}:${minuto
            .toString()
            .padStart(2, "0")}`,
          endTime: `${horaFin.toString().padStart(2, "0")}:${minutoFin
            .toString()
            .padStart(2, "0")}`,
          backgroundColor: color,
          borderColor: color,
          textColor: "#000",
          extendedProps: {
            sala: t.sala?.nombre,
            profesor: t.personal?.nombre,
            duracion: t.duracionMin,
            cupoTotal: cupoTotal,
            cupoDisponible: cupoDisp,
          },
        };
      });

      setEventos(eventosMapeados);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los turnos plantilla.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  useEffect(() => {
    cargarFiltros();
  }, []);

  useEffect(() => {
    cargarTurnosPlantilla();
  }, [filtroSala, filtroProfesor, rol, idPersonal]);

  // 🧩 Crear turno nuevo (solo admin o recepcionista)
  const handleDateClick = async (info: DateClickArg) => {
    if (rol !== "Administrador" && rol !== "Recepcion") return;

    const { isConfirmed } = await Swal.fire({
      title: '<i class="fas fa-plus"></i> Nuevo turno plantilla',
      text: `¿Deseas crear un turno para el ${info.date.toLocaleDateString()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, crear",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (isConfirmed) {
      await crearTurnoPlantilla(() => cargarTurnosPlantilla());
    }
  };

  // 🧩 Mostrar detalle del turno
  const handleEventClick = async (info: EventClickArg) => {
    const { sala, profesor, duracion, cupoTotal, cupoDisponible } =
      info.event.extendedProps;
    const horaInicio = info.event.startStr.slice(11, 16);
    const horaFin = info.event.endStr.slice(11, 16);
    const turnoId = info.event.id;

    const color =
      cupoDisponible <= 0 ? "red" : cupoDisponible <= 3 ? "orange" : "green";

    if (rol === "Administrador") {
      const sanitizedHTML = DOMPurify.sanitize(`
        <div class="text-start">
          <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Sala:</strong> ${sala || "—"}</p>
          <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Profesor:</strong> ${profesor || "—"}</p>
          <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Horario:</strong> ${horaInicio} - ${horaFin}</p>
          <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Duración:</strong> ${duracion} min</p>
          <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Cupos:</strong>
            <span style="color:${color}; font-weight:600;">
              ${cupoDisponible}/${cupoTotal}
            </span>
          </p>
        </div>
      `, { ALLOWED_TAGS: ['div', 'p', 'span', 'strong'], ALLOWED_ATTR: ['style', 'class'] });

      const { isConfirmed } = await Swal.fire({
        title: '<i class="fa-solid fa-clock"></i> Detalle del turno',
        html: sanitizedHTML,
        icon: "info",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: isMobile ? "Eliminar" : '<i class="fas fa-trash"></i> Eliminar',
        denyButtonText: isMobile ? "Editar" : "<i class=\"fas fa-edit\"></i> Editar",
        cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
        reverseButtons: true,
        width: isMobile ? "90vw" : undefined,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-danger",
          denyButton: "btn btn-warning",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });

      if (isConfirmed) {
        const { value: confirmar } = await Swal.fire({
          title: "¿Eliminar turno?",
          text: "Esta acción eliminará el turno plantilla. Los turnos asignados a socios NO se verán afectados.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          width: isMobile ? "90vw" : undefined,
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-danger",
            cancelButton: "btn btn-secondary",
          },
          buttonsStyling: false,
        });

        if (confirmar) {
          try {
            await gymApi.delete(`/turnosplantilla/${turnoId}`);
            await Swal.fire({
              icon: "success",
              title: "Eliminado",
              text: "Turno eliminado correctamente",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
              },
              buttonsStyling: false,
            });
            cargarTurnosPlantilla();
          } catch (error: any) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: error.response?.data?.message || "No se pudo eliminar el turno",
              customClass: {
                popup: "swal2-card-style",
                confirmButton: "btn btn-orange",
              },
              buttonsStyling: false,
            });
          }
        }
      } else if (isConfirmed === false) {
        await editarTurnoPlantilla(Number(turnoId), () => cargarTurnosPlantilla());
      }
    } else {
      const sanitizedHTML = DOMPurify.sanitize(`
        <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Sala:</strong> ${sala || "—"}</p>
        <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Profesor:</strong> ${profesor || "—"}</p>
        <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Horario:</strong> ${horaInicio} - ${horaFin}</p>
        <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Duración:</strong> ${duracion} min</p>
        <p style="font-size: ${isMobile ? '0.9rem' : '1rem'};"><strong>Cupos:</strong>
          <span style="color:${color}; font-weight:600;">
            ${cupoDisponible}/${cupoTotal}
          </span>
        </p>
      `, { ALLOWED_TAGS: ['p', 'span', 'strong'], ALLOWED_ATTR: ['style'] });

      await Swal.fire({
        title: '<i class="fa-solid fa-clock"></i> Detalle del turno',
        html: sanitizedHTML,
        confirmButtonText: "Cerrar",
        width: isMobile ? "90vw" : undefined,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  // 🔄 Redimensionar dinámicamente
  useEffect(() => {
    const resizeCalendar = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        setTimeout(() => calendarApi.updateSize(), 300);
      }
    };

    window.addEventListener("resize", resizeCalendar);
    const container = document.querySelector(".agenda-calendar-container")?.parentElement;
    if (container) {
      const observer = new ResizeObserver(resizeCalendar);
      observer.observe(container);
      return () => {
        window.removeEventListener("resize", resizeCalendar);
        observer.disconnect();
      };
    } else {
      return () => window.removeEventListener("resize", resizeCalendar);
    }
  }, []);

  return (
    <div className="agenda-container" style={{ padding: isMobile ? "10px" : "20px" }}>
      <h1
        className="text-center fw-bold mb-3"
        style={{
          color: "var(--tenant-primary-color)",
          fontSize: isMobile ? "1.5rem" : "2.5rem",
          letterSpacing: isMobile ? "1px" : "2px"
        }}
      >
        CALENDARIO
      </h1>

      {rol !== "Profesor" && (
        <div className={`agenda-filtros mb-4 ${isMobile ? 'd-block' : 'd-flex'} gap-3 justify-content-center`}>
          <div style={isMobile ? { marginBottom: "15px" } : {}}>
            <select
              className="form-select"
              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
              value={filtroSala}
              onChange={(e) => setFiltroSala(e.target.value)}
            >
              <option value="todos">Todas las salas</option>
              {salas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select"
              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
              value={filtroProfesor}
              onChange={(e) => setFiltroProfesor(e.target.value)}
            >
              <option value="todos">Todos los profesores</option>
              {profesores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="agenda-calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
          locale="es"
          allDaySlot={false}
          editable={false}
          selectable={true}
          firstDay={1}
          events={eventos}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height={isMobile ? "auto" : 600}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: isMobile ? "" : "today",
          }}
          buttonText={{
            today: isMobile ? "Hoy" : "Hoy"
          }}
        />
      </div>
    </div>
  );
}


