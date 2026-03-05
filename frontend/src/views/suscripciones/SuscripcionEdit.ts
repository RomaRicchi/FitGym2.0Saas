import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-suscripcion.css";

interface SuscripcionForm {
  nuevoPlanId: number | null;
  estado: boolean;
}

export async function mostrarFormEditarSuscripcion(id: number): Promise<boolean> {
  try {
    const [resSuscripcion, resSocios, resPlanes] = await Promise.all([
      gymApi.get(`/suscripciones/${id}`),
      gymApi.get("/socios"),
      gymApi.get("/planes"),
    ]);

    const s = resSuscripcion.data;
    const socios = resSocios.data.items || resSocios.data;
    const planes = resPlanes.data.items || resPlanes.data;

    const socio = socios.find((soc: any) => soc.id === s.socioId);
    const socioNombre = s.socioNombre || socio?.nombre || "(sin socio)";

    const planActual = planes.find((p: any) => p.id === s.planId);
    const planNombre = s.planNombre || (planActual ? planActual.nombre : "(sin plan)");
    const precioActual = planActual?.precio || 0;

    // 📅 Formatear fechas para mostrar
    const formatearFecha = (fecha: string | null | undefined) => {
      if (!fecha) return "—";
      try {
        const d = new Date(fecha);
        return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
      } catch {
        return "—";
      }
    };

    const inicioFormateado = formatearFecha(s.inicio);
    const finFormateado = formatearFecha(s.fin);

    // 📊 Calcular días usados y restantes
    const hoy = new Date();
    const inicio = new Date(s.inicio as string);
    const fin = new Date(s.fin as string);
    const totalDias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    const diasUsados = Math.max(0, Math.ceil((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
    const diasRestantes = Math.max(0, totalDias - diasUsados);

    // <i class="fa-solid fa-money-bill-wave"></i> Filtrar solo planes superiores (más caros)
    const planesSuperiores = planes.filter((p: any) => p.precio > precioActual);

    if (planesSuperiores.length === 0) {
      await Swal.fire({
        icon: "info",
        title: '<i class="fa-solid fa-circle-info"></i> No hay planes superiores disponibles',
        text: "Este socio ya tiene el plan más costoso. No es posible cambiar a un plan superior.",
        customClass: {
          popup: "swal2-card-suscripcion",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
      return false;
    }

    // 🧡 Modal SweetAlert2
    const { value: formValues } = await Swal.fire<SuscripcionForm>({
      title: '<i class="fa-solid fa-pen-to-square"></i> Editar Suscripción',
      width: "650px",
      html: `
        <form id="form-editar-suscripcion" style="text-align:left;overflow-x:hidden;margin-top:0.5rem;">

          <div style="margin-bottom:1rem;">
            <p style="font-weight:600;color:#222;margin:0;">
              Socio: <span style="font-weight:700;color:#000;">${socioNombre}</span>
            </p>
          </div>

          <div style="margin-bottom:1rem;">
            <p style="font-weight:600;color:#222;margin:0;">
              Plan actual: <span style="font-weight:700;color:#000;">${planNombre}</span>
            </p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
            <div>
              <label style="display:block;font-weight:600;color:#666;margin-bottom:0.3rem;font-size:0.85rem;">Fecha de inicio</label>
              <div style="background:#f5f5f5;padding:0.7rem;border-radius:6px;border:1px solid #ddd;color:#333;font-size:0.95rem;">
                ${inicioFormateado}
              </div>
            </div>
            <div>
              <label style="display:block;font-weight:600;color:#666;margin-bottom:0.3rem;font-size:0.85rem;">Fecha de fin (30 días)</label>
              <div style="background:#f5f5f5;padding:0.7rem;border-radius:6px;border:1px solid #ddd;color:#333;font-size:0.95rem;">
                ${finFormateado}
              </div>
            </div>
          </div>

          <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:6px;padding:0.8rem;margin-bottom:1rem;">
            <p style="margin:0;font-size:0.9rem;color:#92400e;">
              <strong><i class="fa-solid fa-circle-info"></i> Estado actual:</strong> Día ${diasUsados} de ${totalDias} (${diasRestantes} días restantes)
            </p>
          </div>

          <div style="margin-bottom:0.8rem;">
            <label for="nuevoPlanId" style="display:block;font-weight:600;color:#222;margin-bottom:0.3rem;">
              Cambiar a plan superior
            </label>
            <select id="nuevoPlanId" style="width:100%;background:#fff;color:#222;border:1px solid #ccc;border-radius:6px;
                     padding:0.7rem 1rem;font-size:1rem;box-sizing:border-box;cursor:pointer;">
              <option value="">— Mantener plan actual —</option>
              ${planesSuperiores.map((p: any) => `
                <option value="${p.id}" data-precio="${p.precio}" data-nombre="${p.nombre}">
                  ${p.nombre} — <i class="fa-solid fa-money-bill-wave"></i> $${p.precio?.toLocaleString("es-AR") || "0"}
                </option>
              `).join("")}
            </select>
            <small style="display:block;margin-top:0.3rem;color:#666;font-size:0.85rem;">
              <i class="fa-solid fa-triangle-exclamation"></i> Solo puedes cambiar a planes superiores (más costosos)
            </small>
          </div>

          <div id="infoProrrateo" style="display:none;background:#ecfdf5;border:1px solid #10b981;border-radius:6px;padding:1rem;margin-bottom:1rem;">
            <p style="margin:0 0 0.5rem 0;font-weight:600;color:#065f46;">
              <i class="fa-solid fa-money-bill-wave"></i> Cálculo del prorrateo
            </p>
            <div id="detalleCalculo" style="font-size:0.9rem;color:#047857;"></div>
          </div>

          <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:1rem;">
            <input type="checkbox" id="estado" ${s.estado ? "checked" : ""}
              style="width:18px;height:18px;accent-color:var(--tenant-primary-color);cursor:pointer;">
            <label for="estado" style="font-weight:600;color:#222;margin:0;white-space:nowrap;">
              Activa
            </label>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: " Guardar cambios",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      customClass: {
        popup: "swal2-card-suscripcion",
        confirmButton: "btn btn-orange",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,

      didOpen: () => {
        const select = document.getElementById("nuevoPlanId") as HTMLSelectElement;
        const infoDiv = document.getElementById("infoProrrateo");
        const detalleDiv = document.getElementById("detalleCalculo");

        select?.addEventListener("change", () => {
          if (select.value && infoDiv && detalleDiv) {
            const option = select.options[select.selectedIndex];
            const nuevoPrecio = parseFloat(option.getAttribute("data-precio") || "0");

            // 📊 Cálculo del prorrateo
            const valorDiarioActual = precioActual / totalDias;
            const valorDiarioNuevo = nuevoPrecio / totalDias;

            const valorUsadoActual = valorDiarioActual * diasUsados;
            const valorRestanteNuevo = valorDiarioNuevo * diasRestantes;

            const nuevoTotal = valorUsadoActual + valorRestanteNuevo;
            const diferencia = nuevoTotal - precioActual;

            infoDiv.style.display = "block";
            detalleDiv.innerHTML = `
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.5rem;">
                <div>• Precio plan actual: <strong>$${precioActual.toLocaleString("es-AR")}</strong></div>
                <div>• Precio plan nuevo: <strong>$${nuevoPrecio.toLocaleString("es-AR")}</strong></div>
                <div>• Días usados: <strong>${diasUsados}</strong> días</div>
                <div>• Días restantes: <strong>${diasRestantes}</strong> días</div>
              </div>
              <hr style="margin:0.5rem 0;border-color:#10b981;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                <div>• Valor ya usado: <strong>$${valorUsadoActual.toFixed(2)}</strong></div>
                <div>• Valor restante nuevo: <strong>$${valorRestanteNuevo.toFixed(2)}</strong></div>
              </div>
              <hr style="margin:0.5rem 0;border-color:#10b981;">
              <div style="font-size:1rem;font-weight:700;">
                <i class="fa-solid fa-money-bill"></i> Diferencia a pagar: <strong style="color:#059669;">$${diferencia.toFixed(2)}</strong>
              </div>
            `;
          } else if (infoDiv) {
            infoDiv.style.display = "none";
          }
        });
      },

      preConfirm: () => {
        const nuevoPlanIdSelect = document.getElementById("nuevoPlanId") as HTMLSelectElement;
        const nuevoPlanId = nuevoPlanIdSelect?.value ? parseInt(nuevoPlanIdSelect.value) : null;
        const estado = (document.getElementById("estado") as HTMLInputElement)?.checked ?? false;

        // Validar que solo seleccione plan superior
        if (nuevoPlanId) {
          const planSeleccionado = planesSuperiores.find((p: any) => p.id === nuevoPlanId);
          if (!planSeleccionado) {
            Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Solo puedes cambiar a un plan superior (más costoso)');
            return;
          }
        }

        return { nuevoPlanId, estado };
      },
    });

    if (!formValues) return false;

    // 🔧 Payload con nombres de propiedades en camelCase (configuración del backend)
    let payload: any = {
      inicio: s.inicio,
      fin: s.fin,
      estado: formValues.estado,
    };

    // Solo incluir ordenPagoId si existe
    if (s.ordenPagoId != null) {
      payload.ordenPagoId = s.ordenPagoId;
    }

    // Si hay cambio de plan, agregarlo al payload ANTES de actualizar
    if (formValues.nuevoPlanId && formValues.nuevoPlanId !== s.planId) {
      payload.planId = formValues.nuevoPlanId;

      // 🔄 Cambiar a plan superior
      const planNuevo = planesSuperiores.find((p: any) => p.id === formValues.nuevoPlanId);
      const nuevoPrecio = planNuevo?.precio || 0;

      // 📊 Cálculo del prorrateo
      const valorDiarioActual = precioActual / totalDias;
      const valorDiarioNuevo = nuevoPrecio / totalDias;

      const valorUsadoActual = valorDiarioActual * diasUsados;
      const valorRestanteNuevo = valorDiarioNuevo * diasRestantes;

      const diferencia = valorUsadoActual + valorRestanteNuevo - precioActual;

      // 🐛 Debug: Imprimir payload antes de enviar
      console.log("🔍 Payload antes de enviar:", payload);
      console.log("🔍 FormValues:", formValues);
      console.log("🔍 Payload JSON:", JSON.stringify(payload, null, 2));

      // 💬 Modal completo con selección de forma de pago y comprobante
      const { value: formValuesPago } = await Swal.fire({
        title: '<i class="fa-solid fa-money-bill-wave"></i> Confirmar cambio de plan',
        html: `
          <div style="text-align:left;">
            <p style="margin-bottom:0.5rem;">Vas a cambiar el plan con el siguiente cálculo:</p>
            <div style="background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;padding:1rem;margin:1rem 0;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.95rem;">
                <div>Plan actual:</div><div><strong>$${precioActual.toLocaleString("es-AR")}</strong></div>
                <div>Plan nuevo:</div><div><strong>$${nuevoPrecio.toLocaleString("es-AR")}</strong></div>
                <div>Días usados:</div><div><strong>${diasUsados} días</strong></div>
                <div>Días restantes:</div><div><strong>${diasRestantes} días</strong></div>
              </div>
              <hr style="margin:0.8rem 0;">
              <div style="font-size:1.1rem;font-weight:700;text-align:center;">
                Total a pagar: <span style="color:#16a34a;">$${diferencia.toFixed(2)}</span>
              </div>
            </div>

            <label style="display:block;font-weight:600;color:#222;margin-top:1rem;margin-bottom:0.3rem;">
              Forma de pago *
            </label>
            <select id="formaPago" style="width:100%;background:#fff;color:#222;border:1px solid #ccc;border-radius:6px;padding:0.7rem 1rem;font-size:1rem;cursor:pointer;">
              <option value="efectivo"><i class="fa-solid fa-money-bill"></i> Efectivo (pago directo)</option>
              <option value="transferencia">🏦 Transferencia bancaria</option>
            </select>

            <div id="comprobanteContainer" style="display:none;margin-top:1rem;">
              <label style="display:block;font-weight:600;color:#d00;margin-bottom:0.3rem;">
                Comprobante (OBLIGATORIO) *
              </label>
              <input id="comprobante" type="file" accept=".pdf,image/*"
                style="width:100%;border:1px solid #ccc;border-radius:6px;padding:0.5rem;font-size:0.9rem;">
              <small style="color:#666;font-size:0.8rem;">Solo PDF o imágenes (.jpg, .png)</small>
            </div>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-circle-check"></i> Confirmar cambio',
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        customClass: {
          popup: "swal2-card-suscripcion",
          confirmButton: "btn btn-orange",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
        didOpen: () => {
          // Mostrar campo de comprobante solo si selecciona transferencia
          const formaPagoSelect = document.getElementById("formaPago") as HTMLSelectElement;
          const comprobanteContainer = document.getElementById("comprobanteContainer");

          formaPagoSelect?.addEventListener("change", () => {
            if (formaPagoSelect.value === "transferencia") {
              comprobanteContainer!.style.display = "block";
            } else {
              comprobanteContainer!.style.display = "none";
            }
          });
        },
        preConfirm: () => {
          const formaPago = (document.getElementById("formaPago") as HTMLSelectElement)?.value;
          const comprobanteFile = (document.getElementById("comprobante") as HTMLInputElement)?.files?.[0];

          // Validar comprobante si es transferencia
          if (formaPago === "transferencia" && !comprobanteFile) {
            Swal.showValidationMessage('<i class="fa-solid fa-triangle-exclamation"></i> Debes subir el comprobante para transferencia bancaria');
            return;
          }

          return { formaPago, comprobanteFile };
        },
      });

      if (!formValuesPago) return false;

      const { formaPago, comprobanteFile } = formValuesPago;

      // <i class="fas fa-save"></i> Guardar cambios de la suscripción
      try {
        await gymApi.put(`/suscripciones/${id}`, payload);
      } catch (error: any) {
        console.error("❌ Error completo:", error);
        console.error("❌ Response data:", error.response?.data);

        // Manejar específicamente el error de caja no abierta
        if (error.response?.data?.error === "CAJA_NO_ABIERTA") {
          await Swal.fire({
            icon: "info",
            title: '<i class="fa-solid fa-cash-register"></i> Caja no abierta',
            html: `
              <div style="text-align:left;">
                <p style="margin-bottom:1rem;">${error.response.data.message}</p>
                <div style="background:#f0f9ff;padding:1rem;border-radius:8px;border-left:4px solid #0ea5e9;">
                  <p style="margin:0;font-weight:600;color:#0369a1;"><i class="fa-solid fa-clipboard-list"></i> Pasos a seguir:</p>
                  <ol style="margin:0.5rem 0 0 0;padding-left:1.5rem;color:#334155;">
                    <li>Ve a la sección <strong>Gestión → Mi Caja</strong></li>
                    <li>Haz clic en <strong>"Abrir Caja"</strong></li>
                    <li>Ingresa la dotación inicial</li>
                    <li>Vuelve a intentar cambiar el plan</li>
                  </ol>
                </div>
              </div>
            `,
            confirmButtonText: "Entendido",
            confirmButtonColor: "#0ea5e9",
            customClass: {
              popup: "swal2-card-suscripcion",
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false,
          });
          return false;
        }

        await Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          html: `
            <p style="margin-bottom:0.5rem;">No se pudo actualizar la suscripción.</p>
            <div style="background:#fef2f2;padding:1rem;border-radius:6px;font-size:0.85rem;text-align:left;">
              <strong>Detalle del error:</strong><br>
              ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}
            </div>
          `,
          customClass: {
            popup: "swal2-card-suscripcion",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return false;
      }

      // 💳 Crear orden de pago con el estado según forma de pago
      const ordenPago = {
        socioId: s.socioId,
        planId: formValues.nuevoPlanId,
        estadoId: formaPago === "efectivo" ? 3 : 1, // 3 = Aprobada, 1 = Pendiente
        monto: diferencia,
        venceEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        esCambioPlan: true,
      };

      try {
        // Crear orden de pago
        const ordenResponse = await gymApi.post("/ordenes/simple", ordenPago);
        const ordenCreadaId = ordenResponse.data.id;

        // Si es transferencia, subir comprobante
        if (formaPago === "transferencia" && comprobanteFile) {
          const formData = new FormData();
          formData.append("file", comprobanteFile);
          formData.append("ordenPagoId", String(ordenCreadaId));

          await gymApi.post("/comprobantes", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        // Mostrar mensaje final según forma de pago
        if (formaPago === "efectivo") {
          await Swal.fire({
            icon: "success",
            title: '<i class="fa-solid fa-circle-check"></i> Plan cambiado correctamente',
            html: `
              <div style="text-align:left;">
                <p>La suscripción se ha actualizado al plan <strong>${planNuevo?.nombre}</strong></p>
                <p style="margin:0.5rem 0;">Pago en efectivo por <strong>$${diferencia.toFixed(2)}</strong></p>
                <p style="font-size:0.9rem;color:#198754;margin:0;"><i class="fa-solid fa-circle-check"></i> Orden de pago aprobada automáticamente</p>
              </div>
            `,
            customClass: {
              popup: "swal2-card-suscripcion",
              confirmButton: "btn btn-orange",
            },
            buttonsStyling: false,
          });
        } else {
          await Swal.fire({
            icon: "success",
            title: '<i class="fa-solid fa-circle-check"></i> Plan cambiado correctamente',
            html: `
              <div style="text-align:left;">
                <p>La suscripción se ha actualizado al plan <strong>${planNuevo?.nombre}</strong></p>
                <p style="margin:0.5rem 0;">Comprobante vinculado a la orden por <strong>$${diferencia.toFixed(2)}</strong></p>
                <p style="font-size:0.9rem;color:#ffc107;margin:0;"><i class="fa-solid fa-hourglass-half"></i> Orden pendiente de aprobación</p>
              </div>
            `,
            customClass: {
              popup: "swal2-card-suscripcion",
              confirmButton: "btn btn-orange",
            },
            buttonsStyling: false,
          });
        }
      } catch (error: any) {
        console.error("❌ Error en proceso:", error);
        await Swal.fire({
          icon: "error",
          title: '<i class="fa-solid fa-circle-xmark"></i> Error al completar el cambio',
          html: `
            <p>No se pudo completar el cambio de plan.</p>
            <p style="font-size:0.9rem;color:#666;">Por favor, inténtalo nuevamente.</p>
          `,
          customClass: {
            popup: "swal2-card-suscripcion",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return false;
      }
    } else {
      // Solo actualizar estado si no cambió de plan
      try {
        await gymApi.put(`/suscripciones/${id}`, payload);
      } catch (error: any) {
        // Manejar específicamente el error de caja no abierta
        if (error.response?.data?.error === "CAJA_NO_ABIERTA") {
          await Swal.fire({
            icon: "info",
            title: '<i class="fa-solid fa-cash-register"></i> Caja no abierta',
            html: `
              <div style="text-align:left;">
                <p style="margin-bottom:1rem;">${error.response.data.message}</p>
                <div style="background:#f0f9ff;padding:1rem;border-radius:8px;border-left:4px solid #0ea5e9;">
                  <p style="margin:0;font-weight:600;color:#0369a1;"><i class="fa-solid fa-clipboard-list"></i> Pasos a seguir:</p>
                  <ol style="margin:0.5rem 0 0 0;padding-left:1.5rem;color:#334155;">
                    <li>Ve a la sección <strong>Gestión → Mi Caja</strong></li>
                    <li>Haz clic en <strong>"Abrir Caja"</strong></li>
                    <li>Ingresa la dotación inicial</li>
                    <li>Vuelve a intentar la operación</li>
                  </ol>
                </div>
              </div>
            `,
            confirmButtonText: "Entendido",
            confirmButtonColor: "#0ea5e9",
            customClass: {
              popup: "swal2-card-suscripcion",
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false,
          });
          return false;
        }

        await Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: error.response?.data?.message || "No se pudo actualizar la suscripción",
          customClass: {
            popup: "swal2-card-suscripcion",
            confirmButton: "btn btn-orange",
          },
          buttonsStyling: false,
        });
        return false;
      }

      await Swal.fire({
        icon: "success",
        title: '<i class="fa-solid fa-circle-check"></i> Suscripción actualizada',
        text: "Los cambios fueron guardados correctamente.",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-card-suscripcion",
          confirmButton: "btn btn-orange",
        },
        buttonsStyling: false,
      });
    }

    return true;
  } catch (err) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar o guardar los datos.",
      customClass: {
        popup: "swal2-card-suscripcion",
        confirmButton: "btn btn-orange",
      },
      buttonsStyling: false,
    });
    return false;
  }
}




