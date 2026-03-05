import { useEffect, useState } from "react";
import gymApi from "@/api/gymApi";

interface Suscripcion {
  id: number;
  fin: string;
  estado: boolean;
  plan: { nombre: string };
}

interface AlertaInfo {
  mensaje: string;
  tipo: "success" | "warning" | "danger" | "info";
  diasRestantes: number;
  mostrar: boolean;
}

/**
 * Barra de alerta global para socios cuando su suscripción está por vencer
 * Se muestra automáticamente cuando falta una semana o menos para el vencimiento
 */
export const BarraAlertaSocio: React.FC = () => {
  const [alerta, setAlerta] = useState<AlertaInfo | null>(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarVencimiento = async () => {
      try {
        // Obtener suscripciones del socio
        const res = await gymApi.get("/suscripciones/socio");
        const data = res.data?.items || res.data || [];

        if (!Array.isArray(data)) {
          setLoading(false);
          return;
        }

        // Buscar la suscripción más próxima a vencer
        const hoy = new Date();
        let suscripcionMasProxima: Suscripcion | null = null;
        let menorDiferencia = Infinity;

        for (const s of data) {
          if (!s.estado) continue;

          const fin = new Date(s.fin);
          const diferencia = fin.getTime() - hoy.getTime();

          // Solo considerar suscripciones que no han vencido aún
          if (diferencia >= 0 && diferencia < menorDiferencia) {
            menorDiferencia = diferencia;
            suscripcionMasProxima = s;
          }
        }

        if (!suscripcionMasProxima) {
          setLoading(false);
          return;
        }

        const diasRestantes = Math.ceil(menorDiferencia / (1000 * 60 * 60 * 24));

        // Solo mostrar alerta si faltan 7 días o menos
        if (diasRestantes <= 7 && diasRestantes >= 0) {
          const alertaInfo = generarAlerta(diasRestantes, suscripcionMasProxima.plan?.nombre || "tu plan");
          setAlerta(alertaInfo);
        } else {
          setAlerta(null);
        }
      } catch (error) {
        // Silenciar errores - si falla, no mostramos alerta
        console.debug("[BarraAlertaSocio] No se pudo verificar vencimiento:", error);
      } finally {
        setLoading(false);
      }
    };

    verificarVencimiento();

    // Verificar cada hora para mantener la alerta actualizada
    const interval = setInterval(verificarVencimiento, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const generarAlerta = (dias: number, planNombre: string): AlertaInfo => {
    if (dias === 0) {
      return {
        mensaje: `⚠️ ¡Tu suscripción a "${planNombre}" vence HOY! Renová ahora para no perder el acceso.`,
        tipo: "danger",
        diasRestantes: 0,
        mostrar: true,
      };
    }

    if (dias === 1) {
      return {
        mensaje: `⚠️ Tu suscripción a "${planNombre}" vence mañana. Renová ahora para evitar interrupciones.`,
        tipo: "danger",
        diasRestantes: 1,
        mostrar: true,
      };
    }

    if (dias <= 3) {
      return {
        mensaje: `⏰ Tu suscripción a "${planNombre}" vence en ${dias} días. Renová ahora.`,
        tipo: "warning",
        diasRestantes: dias,
        mostrar: true,
      };
    }

    return {
      mensaje: `ℹ️ Tu suscripción a "${planNombre}" vence en ${dias} días. Recordá renovar.`,
      tipo: "info",
      diasRestantes: dias,
      mostrar: true,
    };
  };

  // No mostrar si está cargando, no hay alerta, o el usuario la cerró
  if (loading || !alerta?.mostrar || !visible) {
    return null;
  }

  return (
    <div
      className={`alert alert-${alerta.tipo} m-0 rounded-0 d-flex align-items-center justify-content-center`}
      role="alert"
      style={{
        position: "sticky" as const,
        top: 0,
        zIndex: 9998,
        fontSize: "0.9rem",
        fontWeight: 500,
      }}
    >
      <div className="d-flex align-items-center justify-content-center w-100">
        <span>{alerta.mensaje}</span>
        <a
          href="/socio/suscripciones"
          className="btn btn-sm btn-light ms-3 fw-semibold"
          style={{
            textDecoration: "none",
            padding: "6px 16px",
            borderRadius: "6px",
          }}
        >
          Renovar Ahora
        </a>
        <button
          type="button"
          className="btn-close ms-3"
          onClick={() => setVisible(false)}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
};
