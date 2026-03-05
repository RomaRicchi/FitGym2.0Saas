import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5144";

interface PagoPendiente {
  socioNombre: string;
  socioEmail: string;
  planNombre: string;
  monto: number;
  fecha: string;
  ordenId: number;
  estado: string;
}

// Evento personalizado para actualizar el contador
const COUNTER_UPDATED_EVENT = "pagos-pendientes-counter-updated";

// Función para obtener el contador actual
export const getPagosPendientesCount = () => {
  const stored = sessionStorage.getItem("pagosPendientesCount");
  return stored ? parseInt(stored, 10) : 0;
};

// Función para incrementar el contador
const incrementCounter = () => {
  const current = getPagosPendientesCount();
  const newCount = current + 1;
  sessionStorage.setItem("pagosPendientesCount", newCount.toString());
  // Emitir evento para que los componentes escuchen
  window.dispatchEvent(new CustomEvent(COUNTER_UPDATED_EVENT, { detail: { count: newCount } }));
};

// Función para actualizar el contador con el valor real del servidor
export const resetPagosPendientesCounter = async () => {
  try {
    // console.log("[SignalR] Iniciando actualización del contador de pagos pendientes...");

    const token = sessionStorage.getItem("token");
    if (!token) {
      // console.warn("[SignalR] No hay token, no se puede actualizar el contador");
      return;
    }

    const usuarioStr = sessionStorage.getItem("usuario");
    if (!usuarioStr) {
      // console.warn("[SignalR] No hay usuario en localStorage");
      return;
    }

    const usuario = JSON.parse(usuarioStr);
    const rol = usuario?.rol || usuario?.Rol;

    // Solo actualizar para admin y recepcion
    if (!rol || (rol !== "Administrador" && rol !== "Recepcion")) {
      // console.log("[SignalR] Rol no válido para actualizar contador:", rol);
      return;
    }

    const response = await fetch(`${API_URL}/api/ordenes/pendientes-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const { count } = await response.json();
      // console.log("[SignalR] Nuevo contador desde servidor:", count);

      sessionStorage.setItem("pagosPendientesCount", count.toString());

      // Emitir evento para que los componentes escuchen
      const event = new CustomEvent(COUNTER_UPDATED_EVENT, { detail: { count } });
      window.dispatchEvent(event);
      // console.log("[SignalR] Evento disparado con count:", count);
    } else {
      // Silenciar errores 401/403 que son esperados cuando no hay auth
      if (response.status !== 401 && response.status !== 403) {
        console.error("[SignalR] Error en respuesta del servidor:", response.status);
      }
    }
  } catch (error) {
    // Solo loguear errores reales, no errores de red esperados
    const errMsg = error instanceof Error ? error.message : String(error);
    if (!errMsg.includes("Failed to fetch")) {
      console.error("[SignalR] Error actualizando contador de pagos pendientes:", error);
    }
  }
};

export function usePagoNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Obtener el rol del usuario
    const usuarioStr = sessionStorage.getItem("usuario");
    if (!usuarioStr) return;

    const usuario = JSON.parse(usuarioStr);
    const rol = usuario?.rol || usuario?.Rol;

    // Solo admins y recepcionistas reciben notificaciones
    if (!rol || (rol !== "Administrador" && rol !== "Recepcion")) return;

    // Obtener token JWT
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No hay token JWT, no se iniciará conexión SignalR");
      return;
    }

    // Crear conexión con token JWT
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/pagonotification`, {
        skipNegotiation: false,
        withCredentials: false, // Cambiado a false para problemas de CORS
        accessTokenFactory: () => token, // Enviar token JWT automáticamente
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Reintentar con exponencial backoff: 0s, 2s, 10s, 30s, luego 60s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          if (retryContext.previousRetryCount === 3) return 30000;
          return 60000;
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Iniciar conexión
    connection
      .start()
      .then(async () => {
        // console.log("✅ Conectado a SignalR Hub");
        setIsConnected(true);

        // Unirse al grupo de admins
        await connection.invoke("JoinAdminGroup");
        // console.log("👥 Unido al grupo de admins");
      })
      .catch((err) => {
        // Solo loguear error si NO es un error de "server not running"
        const errMsg = err instanceof Error ? err.message : String(err);
        const isConnectionRefused = errMsg.includes("Failed to start") || errMsg.includes("connection was stopped");
        if (!isConnectionRefused) {
          console.error("❌ Error conectando a SignalR:", err);
        } else if (import.meta.env.DEV) {
          // En desarrollo, loguear silenciosamente los errores de conexión esperados
          console.debug("[SignalR] Backend no disponible, conexión en espera...");
        }
        setIsConnected(false);
      });

    // Escuchar evento de nuevo pago pendiente
    connection.on("NuevoPagoPendiente", (pago: PagoPendiente) => {
      // console.log("🔔 Nuevo pago pendiente:", pago);

      // Incrementar el contador
      incrementCounter();

      // Mostrar notificación toast
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 8000, // 8 segundos para dar tiempo a leer
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
          // Hacer el toast cliqueable
          toast.addEventListener("click", () => {
            window.location.href = "/ordenes";
          });
          toast.style.cursor = "pointer";
        },
      });

      Toast.fire({
        icon: "info",
        title: "🔔 Nuevo pago pendiente de aprobación",
        html: `
          <div style="text-align: left;">
            <strong>${pago.socioNombre}</strong> (${pago.socioEmail})<br/>
            Plan: <strong>${pago.planNombre}</strong><br/>
            Monto: <span style="color: var(--tenant-primary-color); font-weight: 600;">$${pago.monto.toFixed(2)}</span><br/>
            <small style="color: #666;">Haz clic para ver detalles</small>
          </div>
        `,
      });

      // Opcional: Reproducir sonido de notificación
      // const audio = new Audio("/sounds/notification.mp3");
      // audio.play().catch(() => {}); // Ignorar errores de autoplay
    });

    // Manejar reconexión
    connection.onreconnecting(() => {
      // console.log("🔄 Reconectando a SignalR...");
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      // console.log("✅ Reconectado a SignalR");
      setIsConnected(true);
      // Volverse a unir al grupo
      connection.invoke("JoinAdminGroup").catch(() => {});
    });

    connection.onclose(() => {
      // console.log("🔌 Desconectado de SignalR");
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .invoke("LeaveAdminGroup")
          .catch(() => {});
        connectionRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return { isConnected };
}

// Hook para escuchar cambios en el contador
export function usePagosPendientesCounter() {
  const [count, setCount] = useState(getPagosPendientesCount());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      // console.log("[SignalR] usePagosPendientesCounter - Evento recibido:", e.detail);
      setCount(e.detail.count);
    };

    // console.log("[SignalR] usePagosPendientesCounter - Registrando listener");
    window.addEventListener(COUNTER_UPDATED_EVENT, handleUpdate);

    return () => {
      // console.log("[SignalR] usePagosPendientesCounter - Removiendo listener");
      window.removeEventListener(COUNTER_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  // Inicializar contador con valor real de la API
  useEffect(() => {
    const initializeCounter = async () => {
      try {
        // console.log("[SignalR] usePagosPendientesCounter - Inicializando contador...");

        const token = sessionStorage.getItem("token");
        if (!token) return;

        const usuarioStr = sessionStorage.getItem("usuario");
        if (!usuarioStr) return;

        const usuario = JSON.parse(usuarioStr);
        const rol = usuario?.rol || usuario?.Rol;

        // Solo inicializar para admin y recepcion
        if (!rol || (rol !== "Administrador" && rol !== "Recepcion")) return;

        const response = await fetch(`${API_URL}/api/ordenes/pendientes-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { count } = await response.json();
          // console.log("[SignalR] usePagosPendientesCounter - Contador inicial:", count);
          sessionStorage.setItem("pagosPendientesCount", count.toString());
          setCount(count);
        }
      } catch (error) {
        // Silenciar errores de red esperados durante desarrollo
        const errMsg = error instanceof Error ? error.message : String(error);
        if (!errMsg.includes("Failed to fetch")) {
          console.error("[SignalR] Error inicializando contador de pagos pendientes:", error);
        }
      }
    };

    initializeCounter();
  }, []);

  // console.log("[SignalR] usePagosPendientesCounter - Render con count:", count);
  return count;
}
