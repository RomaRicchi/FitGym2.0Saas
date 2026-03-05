import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faArrowUpFromBracket,
  faArrowDown,
  faCashRegister,
  faClock,
  faUser,
  faRotateRight,
  faPlus,
  faXmark,
  faCreditCard,
  faMobileScreen,
} from "@fortawesome/free-solid-svg-icons";
import cajaApi, {
  CajaRecepcionista,
  CajaActiva,
  MovimientoCaja,
  ResumenCaja,
  EstadoCaja,
  TipoMovimientoCaja,
  MetodoPagoCaja,
} from "@/api/cajaApi";
import Swal from "sweetalert2";

export default function CajaView() {
  const [cajaActiva, setCajaActiva] = useState<CajaRecepcionista | null>(null);
  const [infoCaja, setInfoCaja] = useState<CajaActiva | null>(null);
  const [resumenCaja, setResumenCaja] = useState<ResumenCaja | null>(null);
  const [loading, setLoading] = useState(true);
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [usuarioRol, setUsuarioRol] = useState<string | null>(null);

  const AJUSTE_TAG = "[AJUSTE_DOTACION]";

  // Cargar caja activa
  const cargarCajaActiva = async () => {
    try {
      setLoading(true);

      // Primero intentar obtener la caja activa
      const caja = await cajaApi.getCajaActiva();

      if (!caja) {
        // No hay caja abierta
        setCajaActiva(null);
        setInfoCaja(null);
        setResumenCaja(null);
        setMovimientos([]);
        setLoading(false);
        return;
      }

      // Si hay caja, cargar la info detallada, resumen y movimientos
      setCajaActiva(caja);

      // Cargar info adicional (si falla, no es crítico)
      try {
        const info = await cajaApi.getInfoCajaActiva();
        setInfoCaja(info);
      } catch {
        // Si falla la info, continuar sin ella
        setInfoCaja(null);
      }

      // Cargar resumen con desglose por métodos de pago
      try {
        const resumen = await cajaApi.getResumen(caja.id);
        setResumenCaja(resumen);
      } catch {
        setResumenCaja(null);
      }

      // Cargar movimientos
      try {
        const movs = await cajaApi.getMovimientos(caja.id);
        setMovimientos(movs);
      } catch {
        setMovimientos([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No hay caja abierta - esto es normal
        setCajaActiva(null);
        setInfoCaja(null);
        setResumenCaja(null);
        setMovimientos([]);
      } else {
        // Otro error - mostrar al usuario
        console.error("Error al cargar caja:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.error || "Error al cargar caja",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCajaActiva();
    // Refrescar cada 30 segundos
    const interval = setInterval(cargarCajaActiva, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const usuarioStr = sessionStorage.getItem("usuario");
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        setUsuarioRol(usuario?.rol || null);
      } catch {
        setUsuarioRol(null);
      }
    }
  }, []);

  // Función para formatear moneda mientras se escribe
  const formatCurrency = (value: string): string => {
    // Si está vacío, retornar vacío
    if (!value) return '';

    // Remover todo excepto dígitos
    const cleaned = value.replace(/\D/g, '');

    if (cleaned === '') return '';

    // Si solo hay un 0, retornar 0
    if (cleaned === '0') return '0';

    // Remover ceros a la izquierda
    const noLeadingZeros = cleaned.replace(/^0+/, '');
    const digits = noLeadingZeros || '0';

    // Formatear con puntos para miles
    const formattedInteger = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return formattedInteger;
  };

  // Función para parsear el valor formateado de vuelta a número
  const parseCurrency = (value: string): number => {
    // Remover puntos (separadores de miles)
    const cleaned = value.replace(/\./g, '');
    return parseFloat(cleaned) || 0;
  };

  // Abrir caja
  const aperturarCaja = async () => {
    const { value: dotacion } = await Swal.fire({
      title: '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-cash-register me-2"></i>Aperturar Caja</h2>',
      html: `
        <input
          id="swal-input-dotacion"
          class="swal2-input"
          type="text"
          inputmode="numeric"
          placeholder="0"
          autocomplete="off"
          style="text-align: center; font-size: 1.2rem;"
        />
        <label style="display: block; text-align: center; margin-top: 10px; font-weight: 600; color: #666;">
          Dotación inicial
        </label>
      `,
      focusConfirm: false,
      didOpen: () => {
        const input = document.getElementById('swal-input-dotacion') as HTMLInputElement;
        if (input) {
          input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const cursorPosition = target.selectionStart;
            const originalLength = target.value.length;

            // Formatear el valor
            target.value = formatCurrency(target.value);

            // Ajustar posición del cursor
            const newLength = target.value.length;
            const newCursorPosition = cursorPosition + (newLength - originalLength);
            target.setSelectionRange(newCursorPosition, newCursorPosition);
          });

          // Focus inicial
          input.focus();
        }
      },
      preConfirm: () => {
        const input = document.getElementById('swal-input-dotacion') as HTMLInputElement;
        const value = input?.value || '';

        if (!value || value.trim() === '') {
          Swal.showValidationMessage('Ingrese un monto válido');
          return false;
        }

        const amount = parseCurrency(value);
        if (amount < 0) {
          Swal.showValidationMessage('El monto no puede ser negativo');
          return false;
        }

        return amount;
      },
      customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
      buttonsStyling: false,
    });

    if (dotacion !== undefined && dotacion !== false) {
      try {
        await cajaApi.aperturarCaja({ dotacionInicial: dotacion as number });
        await Swal.fire({
          icon: "success",
          title: '<i class="fa-solid fa-circle-check"></i> Caja Aperturada',
          text: "La caja se ha abierto correctamente",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: { popup: "swal2-card-style swal-alert-simple" },
        });
        cargarCajaActiva();
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.error || "Error al aperturar caja",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
      }
    }
  };

  // Cerrar caja
  const cerrarCaja = async () => {
    const montoEsperado = cajaActiva?.montoEsperado || 0;

    const { value: montoReal } = await Swal.fire({
      title: '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-xmark me-2"></i>Cerrar Caja</h2>',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid var(--tenant-primary-color);">
            <p style="margin: 5px 0;"><strong>Monto esperado:</strong> <span style="color: var(--tenant-primary-color); font-size: 1.2rem;">$${formatNumber(montoEsperado)}</span></p>
            <p style="margin: 5px 0; font-size: 0.9rem; color: #666;">Ingrese el monto real en caja:</p>
          </div>
          <input
            id="swal-input-monto-real"
            class="swal2-input"
            type="text"
            inputmode="numeric"
            placeholder="0"
            autocomplete="off"
            style="text-align: center; font-size: 1.2rem;"
          />
          <label style="display: block; text-align: center; margin-top: 10px; font-weight: 600; color: #666;">
            Monto real contado
          </label>
        </div>
      `,
      focusConfirm: false,
      didOpen: () => {
        const input = document.getElementById('swal-input-monto-real') as HTMLInputElement;
        if (input) {
          input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const cursorPosition = target.selectionStart;
            const originalLength = target.value.length;

            // Formatear el valor
            target.value = formatCurrency(target.value);

            // Ajustar posición del cursor
            const newLength = target.value.length;
            const newCursorPosition = cursorPosition + (newLength - originalLength);
            target.setSelectionRange(newCursorPosition, newCursorPosition);
          });

          // Focus inicial
          input.focus();
        }
      },
      preConfirm: () => {
        const input = document.getElementById('swal-input-monto-real') as HTMLInputElement;
        const value = input?.value || '';

        if (!value || value.trim() === '') {
          Swal.showValidationMessage('Ingrese un monto válido');
          return false;
        }

        const amount = parseCurrency(value);
        if (amount < 0) {
          Swal.showValidationMessage('El monto no puede ser negativo');
          return false;
        }

        return amount;
      },
      customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
      buttonsStyling: false,
    });

    if (montoReal !== undefined && montoReal !== false) {
      const montoRealNum = montoReal as number;
      const diferencia = montoRealNum - montoEsperado;
      const esPositivo = diferencia > 0;

      // Mostrar diferencia si existe
      if (diferencia !== 0) {
        await Swal.fire({
          icon: esPositivo ? "success" : "warning",
          title: esPositivo ? '<i class="fa-solid fa-money-bill-wave"></i> Sobrante' : '<i class="fa-solid fa-triangle-exclamation"></i> Faltante',
          html: `
            <div style="text-align: left; padding: 10px;">
              <div style="background: ${esPositivo ? "#d4edda" : "#f8d7da"}; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${esPositivo ? "#28a745" : "#dc3545"};">
                <p style="margin: 5px 0;"><strong>Monto esperado:</strong> $${formatNumber(montoEsperado)}</p>
                <p style="margin: 5px 0;"><strong>Monto real:</strong> $${formatNumber(montoRealNum)}</p>
                <hr style="margin: 10px 0;">
                <p style="margin: 10px 0; font-size: 1.3rem; font-weight: bold; color: ${esPositivo ? "#28a745" : "#dc3545"};">
                  ${esPositivo ? "+" : ""}$${formatNumber(Math.abs(diferencia))} ${esPositivo ? "sobrante" : "faltante"}
                </p>
              </div>
              <p style="font-size: 0.9rem; color: #666;">¿Desea continuar con el cierre?</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Sí, cerrar caja",
          cancelButtonText: "Cancelar",
          confirmButtonColor: esPositivo ? "#28a745" : "#dc3545",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange", cancelButton: "btn btn-secondary" },
          buttonsStyling: false,
        }).then((result) => {
          if (!result.isConfirmed) {
            return; // No continuar
          }
        });
      }

      const { value: observaciones } = await Swal.fire({
        title: '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-pen-to-square"></i> Observaciones</h2>',
        input: "textarea",
        inputLabel: "Agregar observaciones sobre el cierre (opcional)",
        inputPlaceholder: "Escriba cualquier observación relevante...",
        showCancelButton: true,
        confirmButtonText: "Cerrar Caja",
        cancelButtonText: "Cancelar",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange", cancelButton: "btn btn-secondary" },
        buttonsStyling: false,
      });

      try {
        await cajaApi.cerrarCaja({
          cajaId: cajaActiva!.id,
          montoReal: montoRealNum,
          observaciones: observaciones || undefined,
        });

        // Mostrar confirmación final con diferencia si hubo
        if (diferencia !== 0) {
          await Swal.fire({
            icon: "success",
            title: '<i class="fa-solid fa-circle-check"></i> Caja Cerrada',
            html: `
              <div style="text-align: left; padding: 10px;">
                <p>La caja se ha cerrado correctamente</p>
                <div style="background: ${esPositivo ? "#d4edda" : "#f8d7da"}; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid ${esPositivo ? "#28a745" : "#dc3545"};">
                  <p style="margin: 0; font-weight: bold; color: ${esPositivo ? "#28a745" : "#dc3545"};">
                    Diferencia: ${esPositivo ? "+" : ""}$${formatNumber(Math.abs(diferencia))}
                  </p>
                </div>
              </div>
            `,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            customClass: { popup: "swal2-card-style swal-alert-simple" },
          });
        } else {
          await Swal.fire({
            icon: "success",
            title: '<i class="fa-solid fa-circle-check"></i> Caja Cerrada',
            text: "La caja se ha cerrado correctamente. Cuadre perfecto.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            customClass: { popup: "swal2-card-style swal-alert-simple" },
          });
        }

        cargarCajaActiva();
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.error || "Error al cerrar caja",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
      }
    }
  };

  // Registrar retiro
  const registrarRetiro = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-arrow-up-from-bracket me-2"></i>Registrar Retiro</h2>',
      html:
        '<input id="swal-input1" class="swal2-input swal-field" type="text" inputmode="numeric" placeholder="0" style="text-align: center; font-size: 1.1rem;">' +
        '<input id="swal-input2" class="swal2-input swal-field" placeholder="Motivo del retiro">',
      focusConfirm: false,
      customClass: { popup: "swal2-card-style has-custom-form", confirmButton: "btn btn-orange", cancelButton: "btn btn-secondary" },
      buttonsStyling: false,
      didOpen: () => {
        const inputMonto = document.getElementById("swal-input1") as HTMLInputElement;
        if (inputMonto) {
          inputMonto.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const cursorPosition = target.selectionStart;
            const originalLength = target.value.length;

            target.value = formatCurrency(target.value);

            const newLength = target.value.length;
            const newCursorPosition = cursorPosition + (newLength - originalLength);
            target.setSelectionRange(newCursorPosition, newCursorPosition);
          });
        }
      },
      preConfirm: () => {
        const montoStr = (document.getElementById("swal-input1") as HTMLInputElement)?.value;
        const motivo = (document.getElementById("swal-input2") as HTMLInputElement)?.value;
        const monto = parseCurrency(montoStr || '');

        if (!montoStr || montoStr.trim() === '' || monto <= 0) {
          Swal.showValidationMessage("Ingrese un monto válido");
        }
        if (!motivo) {
          Swal.showValidationMessage("Ingrese un motivo");
        }
        return { monto, motivo };
      },
    });

    if (formValues) {
      try {
        await cajaApi.registrarRetiro(formValues);
        await Swal.fire({
          icon: "success",
          title: '<i class="fa-solid fa-circle-check"></i> Retiro Registrado',
          text: "El retiro se ha registrado correctamente",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: { popup: "swal2-card-style swal-alert-simple" },
        });
        cargarCajaActiva();
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.error || "Error al registrar retiro",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
      }
    }
  };

  // Registrar ingreso extra
  const registrarIngresoExtra = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 class="fw-bold mb-3" style="font-size:1.6rem"><i class="fa-solid fa-arrow-down me-2"></i>Registrar Ingreso Extra</h2>',
      html:
        '<input id="swal-input1" class="swal2-input swal-field" type="text" inputmode="numeric" placeholder="0" style="text-align: center; font-size: 1.1rem;">' +
        '<input id="swal-input2" class="swal2-input swal-field" placeholder="Concepto">' +
        '<label class="swal-label">Método de Pago</label>' +
        '<select id="swal-input3" class="swal-select">' +
        '<option value="1">Efectivo</option>' +
        '<option value="2">Transferencia (Mercado Pago)</option>' +
        '</select>',
      focusConfirm: false,
      customClass: { popup: "swal2-card-style has-custom-form", confirmButton: "btn btn-orange", cancelButton: "btn btn-secondary" },
      buttonsStyling: false,
      didOpen: () => {
        const inputMonto = document.getElementById("swal-input1") as HTMLInputElement;
        if (inputMonto) {
          inputMonto.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const cursorPosition = target.selectionStart;
            const originalLength = target.value.length;

            target.value = formatCurrency(target.value);

            const newLength = target.value.length;
            const newCursorPosition = cursorPosition + (newLength - originalLength);
            target.setSelectionRange(newCursorPosition, newCursorPosition);
          });
        }
      },
      preConfirm: () => {
        const montoStr = (document.getElementById("swal-input1") as HTMLInputElement)?.value;
        const concepto = (document.getElementById("swal-input2") as HTMLInputElement)?.value;
        const metodo = (document.getElementById("swal-input3") as HTMLInputElement)?.value;
        const monto = parseCurrency(montoStr || '');

        if (!montoStr || montoStr.trim() === '' || monto <= 0) {
          Swal.showValidationMessage("Ingrese un monto válido");
        }
        if (!concepto) {
          Swal.showValidationMessage("Ingrese un concepto");
        }
        return { monto, concepto, metodoPago: parseInt(metodo!) as MetodoPagoCaja };
      },
    });

    if (formValues) {
      try {
        await cajaApi.registrarIngresoExtra(formValues);
        await Swal.fire({
          icon: "success",
          title: '<i class="fa-solid fa-circle-check"></i> Ingreso Extra Registrado',
          text: "El ingreso extra se ha registrado correctamente",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: { popup: "swal2-card-style swal-alert-simple" },
        });
        cargarCajaActiva();
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.error || "Error al registrar ingreso extra",
          customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
          buttonsStyling: false,
        });
      }
    }
  };

  // Ajustar dotación inicial
  const ajustarDotacionInicial = async () => {
    if (usuarioRol !== "Administrador") {
      Swal.fire({
        icon: "info",
        title: "Permiso requerido",
        text: "Solo un administrador puede ajustar la dotación.",
        timer: 1800,
        showConfirmButton: false,
        customClass: { popup: "swal2-card-style swal-alert-simple" },
      });
      return;
    }

    if (!cajaActiva) return;

    const { value: nuevaDotacion } = await Swal.fire({
      title: '<h2 class="fw-bold mb-3" style="font-size:1.5rem"><i class="fa-solid fa-money-bill me-2"></i>Ajustar dotación</h2>',
      html: `
        <div style="text-align:left; margin-bottom:12px;">
          <p style="margin:4px 0; color:#666;">Actual: <strong>$${formatNumber(cajaActiva.dotacionInicial)}</strong></p>
          <p style="margin:4px 0; color:#666;">Ingresa el monto correcto que debería tener la dotación inicial.</p>
          <input
            id="swal-input-dotacion-ajuste"
            class="swal2-input"
            type="text"
            inputmode="numeric"
            placeholder="0"
            autocomplete="off"
            style="text-align: center; font-size: 1.1rem;"
          />
          <label style="display: block; text-align: center; margin-top: 10px; font-weight: 600; color: #666;">
            Monto correcto
          </label>
        </div>
      `,
      focusConfirm: false,
      didOpen: () => {
        const input = document.getElementById('swal-input-dotacion-ajuste') as HTMLInputElement;
        if (input) {
          // Establecer valor inicial formateado
          input.value = formatNumber(cajaActiva.dotacionInicial);

          input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const cursorPosition = target.selectionStart;
            const originalLength = target.value.length;

            target.value = formatCurrency(target.value);

            const newLength = target.value.length;
            const newCursorPosition = cursorPosition + (newLength - originalLength);
            target.setSelectionRange(newCursorPosition, newCursorPosition);
          });

          // Focus inicial
          input.focus();
        }
      },
      preConfirm: () => {
        const input = document.getElementById('swal-input-dotacion-ajuste') as HTMLInputElement;
        const value = input?.value || '';

        if (value.trim() === '') {
          Swal.showValidationMessage('Ingresa un monto');
          return false;
        }

        const amount = parseCurrency(value);
        if (amount < 0) {
          Swal.showValidationMessage('El monto no puede ser negativo');
          return false;
        }

        return amount;
      },
      showCancelButton: true,
      confirmButtonText: "Aplicar ajuste",
      cancelButtonText: "Cancelar",
      customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange", cancelButton: "btn btn-secondary" },
      buttonsStyling: false,
    });

    if (nuevaDotacion === undefined) return;

    const montoNuevo = nuevaDotacion as number;
    const delta = montoNuevo - cajaActiva.dotacionInicial;

    if (Math.abs(delta) < 0.005) {
      Swal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "La dotación ya tiene ese valor.",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "swal2-card-style swal-alert-simple" },
      });
      return;
    }

    try {
      if (delta < 0) {
        // Registrar retiro para bajar la dotación
        await cajaApi.registrarRetiro({
          monto: Math.abs(delta),
          motivo: `${AJUSTE_TAG} Ajuste de dotación: $${formatNumber(cajaActiva.dotacionInicial)} -> $${formatNumber(montoNuevo)}`,
        });
      } else {
        // Registrar ingreso extra (efectivo) para subir la dotación
        await cajaApi.registrarIngresoExtra({
          monto: delta,
          concepto: `${AJUSTE_TAG} Ajuste de dotación: $${formatNumber(cajaActiva.dotacionInicial)} -> $${formatNumber(montoNuevo)}`,
          metodoPago: MetodoPagoCaja.Efectivo,
        });
      }

      await Swal.fire({
        icon: "success",
        title: "Ajuste aplicado",
        text: "Se registró un movimiento para corregir la dotación.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: { popup: "swal2-card-style swal-alert-simple" },
      });

      cargarCajaActiva();
    } catch (err: any) {
      console.error("Error al ajustar dotación:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo ajustar la dotación",
        customClass: { popup: "swal2-card-style", confirmButton: "btn btn-orange" },
        buttonsStyling: false,
      });
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formatear número con separadores de miles (formato argentino)
  const formatNumber = (num: number): string => {
    return num.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Obtener texto del tipo de movimiento
  const getTipoMovimientoTexto = (tipo: TipoMovimientoCaja) => {
    const tipos = {
      [TipoMovimientoCaja.Venta]: "Venta",
      [TipoMovimientoCaja.Retiro]: "Retiro",
      [TipoMovimientoCaja.IngresoExtra]: "Ingreso Extra",
      [TipoMovimientoCaja.Devolucion]: "Devolución",
      [TipoMovimientoCaja.AperturaDotacion]: "Apertura",
      [TipoMovimientoCaja.Ajuste]: "Ajuste",
    };
    return tipos[tipo] || tipo;
  };

  // Obtener color del tipo de movimiento
  const getTipoMovimientoColor = (tipo: TipoMovimientoCaja) => {
    const colores = {
      [TipoMovimientoCaja.Venta]: "success",
      [TipoMovimientoCaja.Retiro]: "danger",
      [TipoMovimientoCaja.IngresoExtra]: "info",
      [TipoMovimientoCaja.Devolucion]: "warning",
      [TipoMovimientoCaja.AperturaDotacion]: "secondary",
      [TipoMovimientoCaja.Ajuste]: "dark",
    };
    return colores[tipo] || "primary";
  };

  // Obtener texto del método de pago
  const getMetodoPagoTexto = (metodo: MetodoPagoCaja) => {
    const metodos = {
      [MetodoPagoCaja.Efectivo]: "Efectivo",
      [MetodoPagoCaja.Transferencia]: "Transferencia (Mercado Pago)",
      [MetodoPagoCaja.MercadoPago]: "Transferencia (Mercado Pago)",
      [MetodoPagoCaja.Cheque]: "Cheque",
      [MetodoPagoCaja.TarjetaDebito]: "Tarjeta Débito",
      [MetodoPagoCaja.TarjetaCredito]: "Tarjeta Crédito",
    };
    return metodos[metodo] || metodo;
  };

  // Obtener icono del método de pago
  const getMetodoPagoIcon = (metodo: MetodoPagoCaja) => {
    const iconos = {
      [MetodoPagoCaja.Efectivo]: faMoneyBill,
      [MetodoPagoCaja.Transferencia]: faMobileScreen,
      [MetodoPagoCaja.MercadoPago]: faMobileScreen,
      [MetodoPagoCaja.Cheque]: faMoneyBill,
      [MetodoPagoCaja.TarjetaDebito]: faCreditCard,
      [MetodoPagoCaja.TarjetaCredito]: faCreditCard,
    };
    return iconos[metodo] || faMoneyBill;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px", backgroundColor: "#1a1a1a" }}>
        <div className="spinner-border" style={{ color: "var(--tenant-primary-color)" }} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (usuarioRol && usuarioRol !== "Administrador" && usuarioRol !== "Recepcion") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="container-fluid p-4"
      style={{
        backgroundColor: "#1a1a1a",
        color: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Título */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1
          className="fw-bold mb-0"
          style={{
            color: "var(--tenant-primary-color)",
            fontSize: "2.5rem",
            letterSpacing: "2px",
          }}
        >
          <FontAwesomeIcon icon={faCashRegister} className="me-3" />
          MI CAJA
        </h1>
        {infoCaja && (
          <span
            className="badge"
            style={{
              backgroundColor: "#198754",
              color: "#fff",
              fontSize: "1rem",
              padding: "10px 15px",
            }}
          >
            <FontAwesomeIcon icon={faClock} className="me-2" />
            Apertura: {formatearFecha(infoCaja.apertura)}
          </span>
        )}
      </div>

      {!cajaActiva ? (
        // No hay caja abierta
        <div
          className="card shadow-sm text-center py-5"
          style={{
            backgroundColor: "#222",
            border: "1px solid var(--tenant-primary-color)",
            borderRadius: "12px",
          }}
        >
          <div className="card-body">
            <FontAwesomeIcon
              icon={faXmark}
              className="mb-3"
              style={{ fontSize: "4rem", color: "#666" }}
            />
            <h3 className="card-title mb-3" style={{ color: "#f5f5f5" }}>
              No hay caja abierta
            </h3>
            <p className="card-text mb-4" style={{ color: "#999" }}>
              Debe aperturar la caja para comenzar a registrar operaciones
            </p>
            <button
              className="btn fw-semibold"
              onClick={aperturarCaja}
              style={{
                backgroundColor: "var(--tenant-primary-color)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                padding: "12px 30px",
                fontSize: "1.1rem",
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Aperturar Caja
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen de caja - Cards */}
          <div className="row g-4 mb-4">
            {/* Ventas del día */}
            <div className="col-md-3">
              <div
                className="card shadow-sm h-100"
                style={{
                  backgroundColor: "#222",
                  border: "1px solid #0ea5e9",
                  borderRadius: "12px",
                }}
              >
                <div className="card-body">
                  <h6 className="card-subtitle mb-2" style={{ color: "#999" }}>
                    Ventas del Día
                  </h6>
                  <h4 className="card-title mb-0" style={{ color: "#0ea5e9" }}>
                    <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                    ${resumenCaja ? formatNumber(resumenCaja.totalVentas) : (infoCaja ? formatNumber(infoCaja.ventasDelDia) : "0,00")}
                  </h4>
                </div>
              </div>
            </div>

            {/* Transacciones */}
            <div className="col-md-3">
              <div
                className="card shadow-sm h-100"
                style={{
                  backgroundColor: "#222",
                  border: "1px solid #198754",
                  borderRadius: "12px",
                }}
              >
                <div className="card-body">
                  <h6 className="card-subtitle mb-2" style={{ color: "#999" }}>
                    Transacciones
                  </h6>
                  <h4 className="card-title mb-0" style={{ color: "#198754" }}>
                    {infoCaja?.transaccionesDelDia || 0}
                  </h4>
                </div>
              </div>
            </div>

            {/* Dotación Inicial */}
            <div className="col-md-3">
              <div
                className="card shadow-sm h-100"
                style={{
                  backgroundColor: "#222",
                  border: "1px solid #6c757d",
                  borderRadius: "12px",
                }}
              >
                <div className="card-body">
                  <h6 className="card-subtitle mb-2" style={{ color: "#999" }}>
                    Dotación Inicial
                  </h6>
                  <h4 className="card-title mb-0" style={{ color: "#6c757d" }}>
                    <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                    ${formatNumber(cajaActiva.dotacionInicial)}
                  </h4>
                </div>
              </div>
            </div>

            {/* Monto Esperado */}
            <div className="col-md-3">
              <div
                className="card shadow-sm h-100"
                style={{
                  backgroundColor: "#222",
                  border: "1px solid var(--tenant-primary-color)",
                  borderRadius: "12px",
                }}
              >
                <div className="card-body">
                  <h6 className="card-subtitle mb-2" style={{ color: "#999" }}>
                    Monto Esperado
                  </h6>
                  <h4 className="card-title mb-0" style={{ color: "var(--tenant-secondary-color)" }}>
                    <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                    ${formatNumber(cajaActiva.montoEsperado)}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Desglose por método de pago */}
          {resumenCaja && (
            <div className="row g-4 mb-4">
              <div className="col-12">
                <h5 className="mb-3" style={{ color: "#f5f5f5" }}>
                  <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                  Ventas por Método de Pago
                </h5>
              </div>

              {/* Efectivo */}
              <div className="col-md-3">
                <div
                  className="card shadow-sm h-100"
                  style={{
                    backgroundColor: "#222",
                    border: "1px solid #198754",
                    borderRadius: "12px",
                  }}
                >
                  <div className="card-body text-center">
                    <FontAwesomeIcon icon={faMoneyBill} className="mb-2" style={{ fontSize: "2rem", color: "#198754" }} />
                    <h6 className="card-subtitle mb-2" style={{ color: "#999" }}>
                      Efectivo
                    </h6>
                    <h5 className="card-title mb-0" style={{ color: "#198754" }}>
                      ${formatNumber(resumenCaja.ventasEfectivo)}
                    </h5>
                  </div>
                </div>
              </div>

              {/* Mercado Pago (transferencias) */}
              <div className="col-md-3">
                <div
                  className="card shadow-sm h-100"
                  style={{
                    backgroundColor: "#222",
                    border: "1px solid #009EFF",
                    borderRadius: "12px",
                  }}
                >
                  <div className="card-body text-center">
                    <FontAwesomeIcon icon={faMobileScreen} className="mb-2" style={{ fontSize: "2rem", color: "#009EFF" }} />
                    <h6 className="card-subtitle mb-2" style={{ color: "#999" }}>
                      Mercado Pago
                    </h6>
                    <h5 className="card-title mb-0" style={{ color: "#009EFF" }}>
                      ${formatNumber((resumenCaja.ventasTransferencia || 0) + (resumenCaja.ventasMercadoPago || 0))}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div
            className="card shadow-sm mb-4"
            style={{
              backgroundColor: "#222",
              border: "1px solid #dc3545",
              borderRadius: "12px",
            }}
          >
            <div
              className="card-header"
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                borderBottom: "2px solid #dc3545",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faCashRegister} className="me-2" />
                Acciones de Caja
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-danger fw-semibold"
                  onClick={registrarRetiro}
                  style={{ borderRadius: "8px" }}
                >
                  <FontAwesomeIcon icon={faArrowUpFromBracket} className="me-2" />
                  Registrar Retiro
                </button>
                <button
                  className="btn btn-info text-white fw-semibold"
                  onClick={registrarIngresoExtra}
                  style={{ borderRadius: "8px" }}
                >
                  <FontAwesomeIcon icon={faArrowDown} className="me-2" />
                  Registrar Ingreso Extra
                </button>
                {usuarioRol === "Administrador" && (
                  <button
                    className="btn btn-secondary fw-semibold"
                    onClick={ajustarDotacionInicial}
                    style={{ borderRadius: "8px" }}
                  >
                    <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                    Ajustar Dotación
                  </button>
                )}
                <button
                  className="btn btn-warning fw-semibold ms-auto"
                  onClick={cerrarCaja}
                  style={{ borderRadius: "8px" }}
                >
                  <FontAwesomeIcon icon={faXmark} className="me-2" />
                  Cerrar Caja
                </button>
              </div>
            </div>
          </div>

          {/* Movimientos */}
          <div
            className="card shadow-sm"
            style={{
              backgroundColor: "#222",
              border: "1px solid #444",
              borderRadius: "12px",
            }}
          >
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: "#333",
                borderBottom: "1px solid #444",
                color: "#f5f5f5",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Movimientos del Turno
              </h5>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={cargarCajaActiva}
                style={{ borderRadius: "6px" }}
              >
                <FontAwesomeIcon icon={faRotateRight} className="me-1" />
                Actualizar
              </button>
            </div>
            <div className="card-body p-0">
              {movimientos.length === 0 ? (
                <div className="text-center py-4" style={{ color: "#999" }}>
                  No hay movimientos registrados
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ color: "#f5f5f5" }}>
                    <thead style={{ backgroundColor: "#333" }}>
                      <tr>
                        <th>Hora</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Método de Pago</th>
                        <th className="text-end">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map((mov) => (
                        <tr key={mov.id} style={{ borderColor: "#444" }}>
                          <td>
                            <small style={{ color: "#999" }}>
                              {new Date(mov.timestamp).toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${getTipoMovimientoColor(mov.tipo)}`}
                              style={{ fontSize: "0.85rem" }}
                            >
                              {getTipoMovimientoTexto(mov.tipo)}
                            </span>
                          </td>
                          <td>{mov.descripcion || "-"}</td>
                          <td>
                            {mov.metodoPago && (
                              <span
                                className="badge bg-secondary"
                                style={{ fontSize: "0.85rem" }}
                              >
                                <FontAwesomeIcon
                                  icon={getMetodoPagoIcon(mov.metodoPago)}
                                  className="me-1"
                                />
                                {getMetodoPagoTexto(mov.metodoPago)}
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <strong
                              style={{
                                color:
                                  mov.tipo === TipoMovimientoCaja.Retiro ? "#dc3545" : "#198754",
                              }}
                            >
                              {mov.tipo === TipoMovimientoCaja.Retiro ? "-" : "+"}
                              <FontAwesomeIcon icon={faMoneyBill} className="ms-1 me-1" />
                              ${formatNumber(mov.monto)}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}



