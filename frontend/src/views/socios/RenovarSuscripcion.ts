// RenovarSuscripcion.ts - Modal de renovación de suscripciones
import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";

interface Suscripcion {
  id: number;
  plan: { id: number; nombre: string; precio: number };
  fin: string;
  socioId?: number;
}

export async function renovarSuscripcion(suscripcion: Suscripcion) {
  // Obtener socioId desde sessionStorage o la suscripción
  const socioId = suscripcion.socioId || parseInt(sessionStorage.getItem("socioId") || "0");

  if (!socioId || socioId === 0) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo identificar al socio. Por favor, inicia sesión nuevamente.",
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
    return;
  }

  // Obtener planes disponibles
  let planes: any[] = [];
  try {
    const { data } = await gymApi.get("/planes?activo=true");
    planes = data.items || data || [];
  } catch (error) {
  }

  const planActual = suscripcion.plan;

  // Modal principal de renovación
  await Swal.fire({
    title: "Renovar Suscripción",
    html: `
      <div style="text-align: left; padding: 10px;">
        <p><strong>Plan actual:</strong> ${planActual.nombre}</p>
        <p><strong>Precio:</strong> $${planActual.precio}</p>
        <p><strong>Vence:</strong> ${new Date(suscripcion.fin).toLocaleDateString()}</p>
        <hr style="margin: 15px 0;">
        <p style="margin-bottom: 15px;"><strong>Seleccioná método de pago:</strong></p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="pago-btn" data-metodo="manual" style="flex: 1; min-width: 200px; padding: 15px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <i class="fa-solid fa-credit-card"></i> Pago Manual
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
      const botones = document.querySelectorAll('.pago-btn');
      botones.forEach(boton => {
        boton.addEventListener('click', () => {
          const metodo = (boton as HTMLElement).getAttribute('data-metodo');
          Swal.close();
          if (metodo === "manual") {
            renovarConPagoManual(socioId, planActual.id);
          } else if (metodo === "mercadopago") {
            renovarConMercadoPago(socioId, planActual.id, planActual.precio, planActual.nombre);
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
}

async function renovarConPagoManual(socioId: number, planId: number) {
  const { value: file } = await Swal.fire({
    title: "Subir Comprobante",
    html: `
      <p style="margin-bottom: 15px;">Subí el comprobante del pago (transferencia/efectivo)</p>
      <p style="font-size: 12px; color: #888;">Formatos aceptados: PDF, JPG, PNG</p>
    `,
    input: "file",
    inputAttributes: {
      accept: "image/*,application/pdf",
    },
    confirmButtonText: "Enviar Orden",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "swal2-card-style",
      confirmButton: "btn btn-orange",
      cancelButton: "btn btn-secondary",
    },
    buttonsStyling: false,
  });

  if (file) {
    try {
      Swal.fire({
        title: "Enviando...",
        text: "Procesando tu orden de pago",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formData = new FormData();
      formData.append("PlanId", planId.toString());
      formData.append("file", file);

      await gymApi.post("/ordenes/socio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "¡Orden Enviada!",
        text: "Tu orden fue registrada y está pendiente de aprobación. Recibirás un email cuando sea aprobada.",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al enviar el comprobante",
        customClass: {
          popup: "swal2-card-style",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }
  }
}

async function renovarConMercadoPago(
  socioId: number,
  planId: number,
  precio: number,
  nombrePlan: string
) {
  try {
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
      planId: planId,
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
          <p><strong>Monto a pagar:</strong> $${precio}</p>
          <p><strong>Plan:</strong> ${nombrePlan}</p>
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
    } else if (error.message) {
      mensajeError = error.message;
    }

    Swal.fire({
      icon: "error",
      title: "Error al conectar",
      html: `
        <p>${mensajeError}</p>
        <p style="font-size: 11px; color: #888;">Verificá que el backend esté corriendo y que Mercado Pago esté configurado. Abrí la consola (F12) para más detalles.</p>
      `,
      customClass: {
        popup: "swal2-card-style",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
  }
}
