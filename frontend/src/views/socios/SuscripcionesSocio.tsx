import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faDumbbell,
  faCheckCircle,
  faArrowRight,
  faRedo,
  faTimesCircle,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import gymApi from "../../api/gymApi";
import "@/styles/SuscripcionesSocio.css";
import { asignarTurnos } from "@/views/agenda/suscripcionTurno/asignarTurnos";
import { renovarSuscripcion } from "./RenovarSuscripcion";
import { useNavigate } from "react-router-dom";

interface Suscripcion {
  id: number;
  inicio: string;
  fin: string;
  estado: boolean;
  plan: { id: number; nombre: string; precio: number };
  socio: { id: number; nombre: string };
  turnosAsignados?: number;
  cupoMaximo?: number;
}

interface OrdenSocio {
  id: number;
  estadoId: number;
  estadoNombre: string;
  monto: number;
  createdAt: string;
  plan?: { id: number; nombre: string; precio?: number };
}

const SuscripcionesSocio: React.FC = () => {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenSocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [, setCurrentDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuscripciones = async () => {
      try {
        const res = await gymApi.get("/suscripciones/socio");
        const data = res.data;

        const todas = data.items || data || [];
        const activas = todas.filter((s: Suscripcion) => s.estado);
        setSuscripciones(activas);
      } catch (err: any) {
        // Si no hay suscripciones o el backend responde 404, mostramos mensaje amigable
        const status = err?.response?.status;
        if (status === 404) {
          setMensaje("No tenés suscripciones activas. Si enviaste un pago, está pendiente de aprobación.");
        } else {
          setMensaje("No pudimos cargar tus suscripciones. Intentalo de nuevo más tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchOrdenes = async () => {
      try {
        const res = await gymApi.get("/ordenes/socio");
        const items = res.data?.items || [];
        setOrdenes(items);
      } catch {
        // ignorar si no hay órdenes
      }
    };

    fetchSuscripciones();
    fetchOrdenes();

    // Actualizar el contador cada 10 segundos para tiempo real
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 10000); // 10000ms = 10 segundos

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p className="text-lg animate-pulse">Cargando tus suscripciones...</p>
      </div>
    );
  }

  const ordenesRechazadas = ordenes.filter(
    (o) => o.estadoNombre?.toLowerCase().includes("rechaz")
  );
  const ordenesPendientes = ordenes.filter(
    (o) => o.estadoNombre?.toLowerCase().includes("pend")
  );

  if (!suscripciones.length && !ordenesRechazadas.length && !ordenesPendientes.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-300">
        <FontAwesomeIcon
          icon={faDumbbell}
          size="3x"
          className="text-[var(--tenant-primary-color)] mb-4"
        />
        <p className="text-xl">
          {mensaje || "No tenés suscripciones activas. Si enviaste un pago, está pendiente de aprobación."}
        </p>
      </div>
    );
  }

  return (
    <div className="suscripciones-container">
      <div className="suscripciones-header">
        <h1 className="suscripciones-title">
          Mis Suscripciones <FontAwesomeIcon icon={faHeart} />
        </h1>
      </div>

      <div className="suscripciones-grid">
        {suscripciones.map((s) => {
          const inicio = new Date(s.inicio).toLocaleDateString();
          const fin = new Date(s.fin);
          const finFormateado = fin.toLocaleDateString();
          const turnos = s.turnosAsignados ?? 0;
          const cupo = s.cupoMaximo ?? 0;

          const sinCupos = turnos >= cupo;

          // Calcular días para vencer (tiempo real)
          const hoy = new Date();
          const milisegundosRestantes = fin.getTime() - hoy.getTime();
          const diasParaVencer = Math.ceil(milisegundosRestantes / (1000 * 60 * 60 * 24));
          const mostrarRenovacion = s.estado && diasParaVencer <= 7 && diasParaVencer >= 0;

          // Calcular horas, minutos y segundos para más precisión
          const horasRestantes = Math.floor(milisegundosRestantes / (1000 * 60 * 60));
          const minutosRestantes = Math.floor((milisegundosRestantes % (1000 * 60 * 60)) / (1000 * 60));
          const horasExtras = horasRestantes % 24;

          return (
            <div key={s.id} className="suscripcion-card">
              <FontAwesomeIcon icon={faDumbbell} className="icon-top" />
              <h2 className="suscripcion-plan">{s.plan?.nombre}</h2>

              <div className="suscripcion-info">
                <p>
                  <FontAwesomeIcon icon={faCalendarAlt} className="fa-icon" />
                  {inicio} – {finFormateado}
                </p>
                <p>
                  <FontAwesomeIcon icon={faClock} className="fa-icon" />
                  {turnos}/{cupo} clases usadas
                </p>
                {diasParaVencer >= 0 && s.estado && (
                  <p style={{ color: diasParaVencer <= 3 ? 'var(--tenant-primary-color)' : '#888', fontSize: '12px' }}>
                    {diasParaVencer === 0
                      ? horasRestantes > 0
                        ? <><i className="fa-solid fa-triangle-exclamation"></i> Vence en ${horasRestantes}h ${minutosRestantes}min</>
                        : <><i className="fa-solid fa-triangle-exclamation"></i> Venció</>
                      : diasParaVencer === 1
                      ? `Vence mañana`
                      : `Vence en ${diasParaVencer} días`}
                  </p>
                )}
              </div>

              <div
                className={`suscripcion-estado ${
                  s.estado ? "activa" : "inactiva"
                }`}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                {s.estado ? "Activa" : "Inactiva"}
              </div>

              {/* Botón de renovación (aparece 7 días antes) */}
              {mostrarRenovacion && (
                <button
                  className="renovacion-btn"
                  onClick={() => renovarSuscripcion({
                    ...s,
                    socioId: s.socio.id,
                    plan: s.plan
                  })}
                >
                  <FontAwesomeIcon icon={faRedo} /> Renovar Suscripción
                </button>
              )}

              {/* Botón de seleccionar turnos */}
              {sinCupos ? (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Los turnos ya se seleccionaron para esta suscripción</Tooltip>}
                >
                  <span style={{ display: 'inline-block' }}>
                    <button
                      className="suscripcion-btn disabled"
                      disabled={true}
                    >
                      Turnos completados <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                  </span>
                </OverlayTrigger>
              ) : (
                <button
                  className="suscripcion-btn"
                  onClick={() => asignarTurnos(s, () => {
                    // Recargar suscripciones después de asignar turnos
                    window.location.reload();
                  })}
                  title="Seleccionar turnos para esta suscripción"
                >
                  Seleccionar Turnos <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>
          );
        })}

        {/* Órdenes rechazadas */}
        {ordenesRechazadas.map((o) => (
          <div key={`orden-${o.id}`} className="suscripcion-card rechazado">
            <FontAwesomeIcon icon={faTimesCircle} className="icon-top" />
            <h2 className="suscripcion-plan">{o.plan?.nombre || "Plan"}</h2>
            <div className="suscripcion-info">
              <p>
                <FontAwesomeIcon icon={faCalendarAlt} className="fa-icon" />
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
              <p>
                <FontAwesomeIcon icon={faClock} className="fa-icon" />
                Estado: Rechazada
              </p>
              <p>Monto: ${o.monto?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="suscripcion-estado inactiva">
              <FontAwesomeIcon icon={faTimesCircle} />
              Rechazada
            </div>
          </div>
        ))}

        {/* Órdenes pendientes */}
        {ordenesPendientes.map((o) => (
          <div key={`orden-p-${o.id}`} className="suscripcion-card pendiente">
            <FontAwesomeIcon icon={faClock} className="icon-top" />
            <h2 className="suscripcion-plan">{o.plan?.nombre || "Plan"}</h2>
            <div className="suscripcion-info">
              <p>
                <FontAwesomeIcon icon={faCalendarAlt} className="fa-icon" />
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
              <p>
                <FontAwesomeIcon icon={faClock} className="fa-icon" />
                Estado: Pendiente de revisión
              </p>
              <p>Monto: ${o.monto?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="suscripcion-estado inactiva">
              <FontAwesomeIcon icon={faClock} />
              Pendiente
            </div>
            <div className="suscripcion-alert">
              En breve contestaremos su solicitud.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuscripcionesSocio;

