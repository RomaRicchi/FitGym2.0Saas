import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/AgendaCalendar.css";

interface TurnoSocio {
  id: number;
  turnoPlantilla: {
    id: number;
    horaInicio: string;
    duracionMin: number;
    sala: { nombre: string };
    personal: { nombre: string };
    diaSemana: { nombre: string; id: number };
  };
}

export default function TurnosSocioCalendar() {
  const [eventos, setEventos] = useState<any[]>([]);
  const calendarRef = useRef<any>(null);

  // Detectar socio logueado de forma robusta
  const socioId =
    sessionStorage.getItem("socioId") ||
    JSON.parse(sessionStorage.getItem("usuario") || "{}")?.socio_id ||
    null;

  // Cargar los turnos del socio (todas las suscripciones activas)
  const cargarTurnosSocio = async () => {
    try {
      if (!socioId) {
        await Swal.fire({
          icon: "info",
          title: "Sin sesión",
          text: "No se detectó ningún socio logueado.",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return;
      }

      // 📦 Obtener todas las suscripciones del socio
      const { data: susRes } = await gymApi.get(`/suscripciones?socioId=${socioId}`);
      const suscripciones = susRes.items || susRes || [];

      // Filtrar solo las activas
      const activas = suscripciones.filter((s: any) => s.estado);

      if (!activas.length) {
        await Swal.fire({
          icon: "info",
          title: "Sin suscripciones",
          text: "No tenés suscripciones activas.",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return;
      }

      // Obtener turnos de todas las suscripciones activas (en paralelo)
      const resultados = await Promise.all(
        activas.map(async (sus: any) => {
          try {
            const res = await gymApi.get(`/suscripcionturno/suscripcion/${sus.id}`);
            // El interceptor desenvuelve la respuesta, así que res es directamente los datos
            const turnos = Array.isArray(res) ? res : (res?.data || []);
            return { suscripcion: sus, turnos };
          } catch (error) {
            console.error(`Error cargando turnos de suscripción ${sus.id}:`, error);
            return { suscripcion: sus, turnos: [] };
          }
        })
      );

      // Mapear todos los turnos de todas las suscripciones
      const eventosMapeados = resultados.flatMap(({ suscripcion, turnos }) => {
        const inicioSus = new Date(suscripcion.inicio);
        const finSus = new Date(suscripcion.fin);
        const planNombre = suscripcion.plan || suscripcion.planNombre || 'Plan';

        return turnos.map((t: TurnoSocio) => {
          const tp = t.turnoPlantilla;
          const [hora, minuto] = tp.horaInicio.split(":").map(Number);
          const duracionHoras = Math.floor(tp.duracionMin / 60);
          const duracionMinutos = tp.duracionMin % 60;

          const horaFin = hora + duracionHoras + Math.floor((minuto + duracionMinutos) / 60);
          const minutoFin = (minuto + duracionMinutos) % 60;

          return {
            id: `${t.id}-${suscripcion.id}`,
            title: `${tp.sala?.nombre || "Sala"} — ${tp.personal?.nombre || "Profesor"} [${planNombre}]`,
            daysOfWeek: [tp.diaSemana?.id || 1],
            startTime: `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`,
            endTime: `${horaFin.toString().padStart(2, "0")}:${minutoFin
              .toString()
              .padStart(2, "0")}`,
            startRecur: inicioSus.toISOString().split("T")[0],
            endRecur: finSus.toISOString().split("T")[0],
            backgroundColor: "var(--tenant-primary-color)",
            borderColor: "var(--tenant-primary-color)",
            textColor: "#fff",
            extendedProps: {
              dia: tp.diaSemana?.nombre,
              sala: tp.sala?.nombre,
              profesor: tp.personal?.nombre,
              duracion: tp.duracionMin,
              plan: planNombre,
              inicioSus: inicioSus.toLocaleDateString(),
              finSus: finSus.toLocaleDateString(),
            },
          };
        });
      });

      if (!eventosMapeados.length) {
        await Swal.fire({
          icon: "info",
          title: "Sin turnos",
          text: "No se encontraron turnos asignados.",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return;
      }

      setEventos(eventosMapeados);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los turnos del socio.",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  useEffect(() => {
    cargarTurnosSocio();
  }, []);

  // Recargar turnos cuando la ventana gana foco (por ejemplo, al volver de otra pestaña/vista)
  useEffect(() => {
    const handleFocus = () => {
      cargarTurnosSocio();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // 🪄 Redimensionar dinámicamente
  useEffect(() => {
    const resizeCalendar = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        setTimeout(() => calendarApi.updateSize(), 300);
      }
    };
    window.addEventListener("resize", resizeCalendar);
    return () => window.removeEventListener("resize", resizeCalendar);
  }, []);

  // 🧩 Mostrar detalle del turno
  const handleEventClick = async (info: any) => {
    const { sala, profesor, dia, duracion, plan } = info.event.extendedProps;
    const horaInicio = info.event.startStr.slice(11, 16);
    const horaFin = info.event.endStr.slice(11, 16);

    await Swal.fire({
      title: '<i class="fa-solid fa-heart" style="color: #ff8800;"></i> Detalle del Turno',
      html: `
        <p><strong>Plan:</strong> ${plan || "—"}</p>
        <p><strong>Día:</strong> ${dia || "—"}</p>
        <p><strong>Sala:</strong> ${sala || "—"}</p>
        <p><strong>Profesor:</strong> ${profesor || "—"}</p>
        <p><strong>Horario:</strong> ${horaInicio} - ${horaFin}</p>
        <p><strong>Duración:</strong> ${duracion} minutos</p>
      `,
      confirmButtonText: "Cerrar",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  };

  return (
    <div className="agenda-container">
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--tenant-primary-color)", fontSize: "2.5rem", letterSpacing: "2px" }}
      >
        <><i className="fa-solid fa-heart" style={{color: "#ff8800"}}></i> MIS TURNOS</>
      </h1>

      <div className="agenda-calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="es"
          firstDay={1}
          allDaySlot={false}
          editable={false}
          selectable={false}
          events={eventos}
          eventClick={handleEventClick}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
        />
      </div>
    </div>
  );
}


