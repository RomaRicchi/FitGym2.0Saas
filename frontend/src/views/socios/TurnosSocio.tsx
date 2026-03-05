import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCalendarAlt,
  faDumbbell,
  faUser,
  faDoorOpen,
  faTimesCircle,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import gymApi from "@/api/gymApi";
import Swal from "sweetalert2";
import "@/styles/TurnosSocio.css";
import { reagendarTurnoModal } from "./reagendarTurno";

interface TurnoSocio {
  id: number;
  suscripcionId: number;
  plan?: {
    id: number;
    nombre: string;
  };
  turnoPlantilla?: {
    id: number;
    horaInicio: string;
    duracionMin: number;
    diaSemana?: { id: number; nombre: string };
    sala?: { nombre: string; cupo?: number; cupoDisponible?: number };
    personal?: { nombre: string };
  };
}

const TurnosSocio: React.FC = () => {
  const [turnos, setTurnos] = useState<TurnoSocio[]>([]);
  const [loading, setLoading] = useState(true);
  const socioId = sessionStorage.getItem("socioId");

  useEffect(() => {
    fetchTurnos();
  }, [socioId]);

  const fetchTurnos = async () => {
    try {
      const { data } = await gymApi.get(`/suscripcionturno/socio/${socioId}`);
      const turnosData = data.items || data;

      // Ordenar por día de la semana (lunes=1 a domingo=7)
      const turnosOrdenados = [...turnosData].sort((a: TurnoSocio, b: TurnoSocio) => {
        const diaA = a.turnoPlantilla?.diaSemana?.id ?? 99;
        const diaB = b.turnoPlantilla?.diaSemana?.id ?? 99;
        return diaA - diaB;
      });

      setTurnos(turnosOrdenados);
    } catch (err) {
      // Error silencioso al cargar turnos
    } finally {
      setLoading(false);
    }
  };

  const handleReagendar = async (t: TurnoSocio) => {
    // Validar nuevamente antes de abrir el modal
    const puedeReagendar = esReagendable(
      t.turnoPlantilla?.diaSemana?.id,
      t.turnoPlantilla?.horaInicio
    );

    if (!puedeReagendar) {
      Swal.fire({
        icon: "warning",
        title: "No podés reagendar este turno",
        text: "Solo podés reagendar turnos con al menos 1 hora de anticipación.",
        confirmButtonColor: "var(--tenant-primary-color)",
      });
      return;
    }

    await reagendarTurnoModal(
      t.suscripcionId,
      t.id,
      t.turnoPlantilla?.id || 0,
      fetchTurnos
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
        <p className="text-lg animate-pulse">Cargando tus turnos...</p>
      </div>
    );
  }

  if (!turnos.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-gray-300">
        <FontAwesomeIcon icon={faDumbbell} size="3x" className="text-[var(--tenant-primary-color)] mb-4" />
        <p className="text-xl">No tenés turnos asignados todavía</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-10">
       <h1
        className="text-center fw-bold mb-4"
      style={{
        color: "var(--tenant-primary-color)",
        fontSize: "2.5rem",
        letterSpacing: "2px",
      }}
    >
        Mis Turnos
      </h1>

      <div className="turnos-grid">
        {turnos.map((t) => {
          const turno = t.turnoPlantilla;
          if (!turno) return null;

          const horaInicio = turno.horaInicio?.slice(0, 5) || "--:--";
          const duracion = turno.duracionMin || 0;
          const horaFin = calcularHoraFin(turno.horaInicio, duracion);
          const dia = turno.diaSemana?.nombre || "Día sin asignar";
          const sala = turno.sala?.nombre || "Sala no definida";
          const profesor = turno.personal?.nombre || "Profesor no asignado";
          const plan = t.plan?.nombre || "Plan sin asignar";
          const puedeReagendar = esReagendable(turno.diaSemana?.id, turno.horaInicio);

          return (
            <div key={t.id} className="turno-card">
              <div className="turno-contenido">
                <div className="turno-header">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <h2>{dia}</h2>
                </div>

                <div className="turno-body">
                  <p className="text-sm font-semibold text-[var(--tenant-primary-color)]">
                    {plan}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    {horaInicio} - {horaFin} hs
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faDoorOpen} className="mr-2" />
                    {sala}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    {profesor}
                  </p>
                  <p className="italic text-sm">Duración: {duracion} min</p>
                </div>
              </div>

              <div className="turno-acciones">
                <button
                  onClick={() => handleReagendar(t)}
                  className="turno-btn reagendar flex items-center justify-center gap-2"
                  disabled={!puedeReagendar}
                  style={!puedeReagendar ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                  title={
                    !puedeReagendar
                      ? "No se puede reagendar con menos de 1 hora de anticipación."
                      : "Reagendar este turno"
                  }
                >
                  <FontAwesomeIcon icon={faSyncAlt} />
                  Reagendar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function calcularHoraFin(horaInicio: string, duracionMin: number): string {
  if (!horaInicio) return "--:--";
  const [h, m] = horaInicio.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m + duracionMin);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Solo permitir reagendar si el turno de ESTA semana aún no ha pasado.
 * Los turnos son semanales, no se puede reagendar para la semana siguiente.
 */
function esReagendable(diaSemanaId?: number, horaInicio?: string): boolean {
  if (!diaSemanaId || !horaInicio) return false;

  const ahora = new Date();
  const [h, m] = horaInicio.split(":").map(Number);

  // dayOfWeek: domingo=0 ... sábado=6; en datos: lunes=1 ... domingo=7 (asumido)
  const hoy = ahora.getDay() === 0 ? 7 : ahora.getDay(); // convertir a 1-7 con domingo=7

  // Si el día del turno ya pasó (es menor que hoy), no se puede reagendar
  if (diaSemanaId < hoy) {
    return false;
  }

  // Si es el mismo día, verificar que falte al menos 1 hora
  if (diaSemanaId === hoy) {
    const turnoHoy = new Date(ahora);
    turnoHoy.setHours(h, m, 0, 0);
    const limite = new Date(turnoHoy.getTime() - 60 * 60 * 1000); // 1 hora antes

    // Solo permitir si estamos ANTES del límite (falta más de 1 hora)
    return ahora.getTime() < limite.getTime();
  }

  // Si es un día futuro de esta semana, se puede reagendar
  return true;
}

export default TurnosSocio;


