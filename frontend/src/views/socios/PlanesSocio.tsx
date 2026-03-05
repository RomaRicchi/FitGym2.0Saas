import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faCalendarDay,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Swal from "sweetalert2";
import gymApi from "../../api/gymApi";
import "@/styles/PlanesSocio.css";

interface Plan {
  id: number;
  nombre: string;
  diasPorSemana: number;
  precio: number;
  activo: boolean;
}

const PlanesSocio: React.FC = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planesConCupo, setPlanesConCupo] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [suscripcionesActivas, setSuscripcionesActivas] = useState(0);
  const [limiteMaximo] = useState(2);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener suscripciones del socio para verificar el límite
        try {
          const { data: suscripcionesRes } = await gymApi.get("/suscripciones/socio");
          const suscripciones = suscripcionesRes?.items || suscripcionesRes || [];

          const esActiva = (s: any) => {
            const estadoRaw = (s.estado ?? s.Estado ?? "").toString().trim().toLowerCase();
            if (["activa", "activo", "active", "activated", "vigente"].includes(estadoRaw)) return true;
            if (typeof s.estado === "boolean") return s.estado;
            if (typeof s.Estado === "boolean") return s.Estado;
            if (typeof s.estadoId === "number") return s.estadoId === 1;
            if (typeof s.activa === "boolean") return s.activa;
            return false;
          };

          const activas = suscripciones.filter(esActiva);
          setSuscripcionesActivas(activas.length);
          setLimiteAlcanzado(activas.length >= limiteMaximo);
        } catch (error) {
          console.error("Error al obtener suscripciones:", error);
          // Si falla, asumimos que no hay límite
          setSuscripcionesActivas(0);
          setLimiteAlcanzado(false);
        }

        // Cargar planes
        const res = await gymApi.get("/planes?activo=true");
        const data = res.data;

        // Solo planes activos
        const activos = data.items.filter((p: Plan) => p.activo);
        setPlanes(activos);

        // Filtrar solo los que tienen cupo suficiente (paralelizar requests)
        const cupoChecks = await Promise.all(
          activos.map(async (p: Plan) => {
            try {
              const { data: cupo } = await gymApi.get(`/planes/${p.id}/cupo`);
              return cupo?.ok ? p : null;
            } catch {
              return null;
            }
          })
        );
        setPlanesConCupo(cupoChecks.filter((p): p is Plan => p !== null));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los planes disponibles.",
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

    fetchData();
  }, []);

  const abrirFormularioOrden = async (plan: Plan) => {
    // Verificar límite de suscripciones activas antes de continuar
    if (limiteAlcanzado || suscripcionesActivas >= limiteMaximo) {
      Swal.fire({
        icon: "warning",
        title: `<div style="display:flex;align-items:center;gap:8px;justify-content:center;"><i class="fa-solid fa-triangle-exclamation"></i> Límite de suscripciones alcanzado</div>`,
        html: `
          <p>Ya tenés <strong>${suscripcionesActivas} de ${limiteMaximo}</strong> suscripciones activas.</p>
          <p style="font-size: 14px; color: #888;">Podrás suscribirte a un nuevo plan cuando una de tus suscripciones actuales venza.</p>
        `,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return;
    }

    // Primer paso: elegir método de pago con botones
    const { value: metodoPago } = await Swal.fire({
      title: "Seleccionar método de pago",
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>Plan:</strong> ${plan.nombre}</p>
          <p><strong>Precio:</strong> $${plan.precio}</p>
          <p><strong>Días:</strong> ${plan.diasPorSemana} días por semana</p>
          <hr style="margin: 15px 0;">
          <p style="margin-bottom: 15px;"><strong>Seleccioná método de pago:</strong></p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="pago-btn" data-metodo="manual" style="flex: 1; min-width: 200px; padding: 15px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; gap:8px;">
              <i class="fa-solid fa-money-bill-wave"></i> Pago Manual
            </button>
            <button class="pago-btn" data-metodo="mercadopago" style="flex: 1; min-width: 200px; padding: 15px 20px; background: linear-gradient(135deg, #009EFF 0%, #00D4FF 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; gap: 8px;">
              <img src="/Mercado-Pago-Logo-Vector.svg-1-1.png" alt="Mercado Pago" style="height: 24px; width: auto;">
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-card-style",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      didOpen: () => {
        // Agregar event listeners a los botones
        const botones = document.querySelectorAll('.pago-btn');
        botones.forEach(boton => {
          boton.addEventListener('click', () => {
            const metodo = (boton as HTMLElement).getAttribute('data-metodo');
            Swal.close();
            if (metodo === "manual") {
              pagarConManual(plan);
            } else if (metodo === "mercadopago") {
              pagarConMercadoPago(plan);
            }
          });
          // Efecto hover
          boton.addEventListener('mouseenter', () => {
            (boton as HTMLElement).style.transform = 'translateY(-2px)';
            (boton as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          });
          boton.addEventListener('mouseleave', () => {
            (boton as HTMLElement).style.transform = 'translateY(0)';
            (boton as HTMLElement).style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
          });
        });
      }
    });
  };

  const pagarConManual = (plan: Plan) => {
    Swal.fire({
      title: `Generar orden de pago`,
      html: `
        <p style="font-size:1rem; margin-bottom:0.5rem;">Plan seleccionado: <b>${plan.nombre}</b></p>
        <p style="font-size:1rem;">Precio: <b>${plan.precio}</b></p>
        <input type="file" id="comprobante" class="swal2-input custom-file-input" accept="image/*,application/pdf">
      `,
      confirmButtonText: "Enviar orden",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      didOpen: () => {
        // 🔧 corrige visual del input
        const fileInput = document.querySelector(".custom-file-input") as HTMLElement;
        if (fileInput) {
          fileInput.style.display = "block";
          fileInput.style.width = "100%";
          fileInput.style.marginTop = "1rem";
          fileInput.style.padding = "0.4rem";
          fileInput.style.background = "white";
          fileInput.style.color = "#333";
          fileInput.style.borderRadius = "6px";
        }
      },
      preConfirm: async () => {
        const fileInput = document.getElementById("comprobante") as HTMLInputElement;
        if (!fileInput.files?.length) {
          Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debe adjuntar un comprobante');
          return;
        }

        const formData = new FormData();
        formData.append("PlanId", plan.id.toString());
        formData.append("FechaInicio", new Date().toISOString());
        formData.append("Notas", "Orden generada por socio desde PlanesSocio");
        formData.append("file", fileInput.files[0]);

        try {
          const res = await gymApi.post("/ordenes/socio", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          return res.data;
        } catch (error: any) {
          const status = error?.response?.status;
          if (status === 401) {
            Swal.showValidationMessage("Tu sesión no es válida para crear órdenes. Iniciá sesión nuevamente.");
          } else if (error?.response?.data?.message) {
            Swal.showValidationMessage(error.response.data.message);
          } else {
            Swal.showValidationMessage("No se pudo crear la orden. Intentá de nuevo.");
          }
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: '<i class="fa-solid fa-circle-check"></i> Orden enviada',
          text: "Tu orden fue registrada y está pendiente de aprobación.",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
      }
    });
  };

  const pagarConMercadoPago = async (plan: Plan) => {
    try {
      const socioId = parseInt(sessionStorage.getItem("socioId") || "0");

      if (!socioId || socioId === 0) {
        Swal.fire({
          icon: "error",
          title: "Error de sesión",
          text: "No se pudo identificar tu usuario. Por favor, iniciá sesión nuevamente.",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return;
      }

      Swal.fire({
        title: "Procesando...",
        text: "Conectando con Mercado Pago",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await gymApi.post("/renovaciones/iniciar", {
        socioId: socioId,
        planId: plan.id,
        metodoPago: 2, // MercadoPago
        renovacionAutomatica: false,
      });

      const { mercadoPagoInitPoint } = response.data;

      Swal.close();

      if (mercadoPagoInitPoint) {
        // Mostrar confirmación antes de redirigir
        await Swal.fire({
          title: "¡Listo para pagar!",
          html: `
            <p>Serás redirigido a Mercado Pago para completar el pago.</p>
            <p><strong>Monto a pagar:</strong> $${plan.precio}</p>
            <p><strong>Plan:</strong> ${plan.nombre}</p>
            <p style="font-size: 12px; color: #888;">Después del pago, volverás automáticamente a tus suscripciones.</p>
          `,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Ir a Pagar",
          cancelButtonText: "Cancelar",
          customClass: {
            popup: "swal2-card-style",
            confirmButton: "btn btn-orange",
            cancelButton: "btn btn-secondary",
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = mercadoPagoInitPoint;
          }
        });
      } else {
        throw new Error("No se pudo generar el enlace de pago");
      }
    } catch (error: any) {
      let mensajeError = "Error al iniciar el pago con Mercado Pago";

      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.response?.status === 401) {
        mensajeError = "Tu sesión no es válida para iniciar el pago. Iniciá sesión nuevamente.";
      } else if (error.message) {
        mensajeError = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error al conectar",
        html: `
          <p>${mensajeError}</p>
          <p style="font-size: 11px; color: #888;">Verificá que el backend esté corriendo y que Mercado Pago esté configurado.</p>
        `,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
        <p className="text-lg animate-pulse">Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className="planes-socio-container">
      <h1 className="planes-socio-title"><i className="fa-solid fa-heart" style={{color: "#ff8800"}}></i> Planes Disponibles</h1>

      {limiteAlcanzado && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            textAlign: "center",
            color: "#856404",
            fontSize: "14px",
          }}
        >
          <strong><i class="fa-solid fa-triangle-exclamation"></i> Límite de suscripciones alcanzado</strong>
          <br />
          Tenés {suscripcionesActivas} de {limiteMaximo} suscripciones activas
        </div>
      )}

      <div className="planes-socio-grid">
        {planesConCupo.map((plan) => (
          limiteAlcanzado ? (
            <OverlayTrigger
              key={plan.id}
              placement="top"
              overlay={<Tooltip>Has alcanzado el límite mensual de suscripciones</Tooltip>}
            >
              <span style={{ display: 'inline-block', width: '100%', height: '100%' }}>
                <button
                  className="plan-card"
                  disabled={true}
                  style={{
                    opacity: "0.6",
                    cursor: "not-allowed",
                  }}
                >
                  <FontAwesomeIcon icon={faDumbbell} className="plan-icon" />
                  <h3 className="plan-title">{plan.nombre}</h3>

                  <div className="plan-info">
                    <p>
                      <FontAwesomeIcon icon={faCalendarDay} />
                      {plan.diasPorSemana} días por semana
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faDollarSign} /> {plan.precio.toFixed(2)}
                    </p>
                  </div>
                </button>
              </span>
            </OverlayTrigger>
          ) : (
            <button
              key={plan.id}
              onClick={() => abrirFormularioOrden(plan)}
              className="plan-card"
              title={`Suscribirse al plan ${plan.nombre}`}
              style={{
                opacity: "1",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faDumbbell} className="plan-icon" />
              <h3 className="plan-title">{plan.nombre}</h3>

              <div className="plan-info">
                <p>
                  <FontAwesomeIcon icon={faCalendarDay} />
                  {plan.diasPorSemana} días por semana
                </p>
                <p>
                  <FontAwesomeIcon icon={faDollarSign} /> {plan.precio.toFixed(2)}
                </p>
              </div>
            </button>
          )
        ))}
      </div>
    </div>
  );

};

export default PlanesSocio;


