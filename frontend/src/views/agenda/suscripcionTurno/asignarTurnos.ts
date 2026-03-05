import Swal from "sweetalert2";
import gymApi from "@/api/gymApi";
import "@/styles/swal-turnos.css";

function formatearHora(hora: string): string {
  if (!hora) return "--:--";
  return hora.substring(0, 5);
}

export async function asignarTurnos(suscripcion: any, onClose?: () => void) {
  try {
    let planData = null;

    // El backend devuelve plan.id, no plan_id
    if (suscripcion.plan?.id) {
      const { data } = await gymApi.get(`/planes/${suscripcion.plan.id}`);
      planData = data;
    } else if (suscripcion.plan_id) {
      const { data } = await gymApi.get(`/planes/${suscripcion.plan_id}`);
      planData = data;
    } else if (suscripcion.plan) {
      const { data } = await gymApi.get("/planes");
      const planes = data.items || data;
      planData = planes.find(
        (p: any) => p.nombre?.toLowerCase() === suscripcion.plan.toLowerCase()
      );
    }

    if (!planData) {
      Swal.fire("Error", "No se pudo obtener la información del plan.", "error");
      return;
    }

    const socioNombre = suscripcion.socio || "(sin socio)";
    const planNombre = planData.nombre;
    const diasPorSemana =
      planData.diasPorSemana || planData.dias_por_semana || 1;

    const { data: diasRes } = await gymApi.get("/diassemana");
    const dias = diasRes.items || diasRes;

    const { data: asignadosRes } = await gymApi.get(
      `/suscripcionturno/suscripcion/${suscripcion.id}`
    );

    const turnosAsignadosData: any[] = [];
    const turnosAsignadosIds = new Set<number>();

    for (const asignado of asignadosRes) {
      try {
        const { data: turnoDetalle } = await gymApi.get(`/turnosPlantilla/${asignado.turnoPlantillaId}`);
        turnosAsignadosData.push({
          ...turnoDetalle,
          suscripcionTurnoId: asignado.id
        });
        turnosAsignadosIds.add(asignado.turnoPlantillaId);
      } catch (err) {
      }
    }

    const turnosAsignados = Array.from(turnosAsignadosIds);

    const orangeStyle = "border-color: var(--tenant-primary-color); border-width: 2px;";
    const turnosGuardados = new Set<number>();

    const cardStyle = `
      background: #fff;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      border-left: 5px solid var(--tenant-primary-color);
      height: 300px;
      min-height: 300px;
      max-height: 300px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
      width: 100%;
      max-width: 100%;
    `;

    const gruposHtml = Array.from({ length: diasPorSemana }, (_, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <div class="turno-grupo" style="${cardStyle}">
          <h5 style="color:var(--tenant-primary-color);margin-bottom:15px;flex-shrink:0;"><i class="fa-solid fa-calendar-days"></i> Día ${i + 1} de ${diasPorSemana}</h5>
          <label style="flex-shrink:0;"><b>Seleccionar día</b></label>
          <select id="dia-${i}" class="form-select" style="margin-bottom:12px; ${orangeStyle} height:42px;flex-shrink:0;width:100%;">
            <option value="">-- Seleccionar día --</option>
            ${dias.map((d: any) => `<option value="${d.id}">${d.nombre}</option>`).join("")}
          </select>

          <label style="flex-shrink:0;"><b>Turno disponible</b></label>
          <select id="turno-${i}" class="form-select" style="margin-bottom:12px; ${orangeStyle} height:42px;flex-shrink:0;width:100%;">
            <option value="">Seleccione un día primero</option>
          </select>

          <button id="btn-save-${i}" class="btn btn-sm fw-semibold btn-guardar-turno" style="
            width:100%;
            background:linear-gradient(135deg, var(--tenant-primary-color), var(--tenant-primary-color));
            color:white;
            border:none;
            border-radius:8px;
            padding:12px;
            cursor:pointer;
            transition:all 0.3s ease;
            flex-shrink:0;
            margin-top:auto;
            font-size:14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          "><i class="fas fa-save"></i> Guardar turno</button>
        </div>
      </div>
    `).join("");

    //  Mostrar el modal (con carrusel)
    await Swal.fire({
      title: '<i class="fa-solid fa-plus"></i> Asignar Turnos',
      width: window.innerWidth < 768 ? '95vw' : '600px',
      showCancelButton: false,
      showConfirmButton: false,
      showCloseButton: false,
      buttonsStyling: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: { popup: "swal2-card-turnos" },
      html: `
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <div style="text-align:left; font-size:15px;">
          <p><strong>Socio:</strong> ${socioNombre}</p>
          <p><strong>Plan:</strong> ${planNombre}</p>
          <p><strong>Días por semana:</strong> ${diasPorSemana}</p>
          <hr/>

          <div id="warning-message" style="
            display:none;
            background:#fff3cd;
            border:1px solid #ffc107;
            border-radius:8px;
            padding:12px;
            margin-bottom:15px;
            color:#856404;
            font-size:14px;
          ">
            <strong><i class="fa-solid fa-triangle-exclamation"></i> Falta guardar turnos</strong>
            <span id="warning-text"></span>
          </div>

          <!-- CARRUSEL DE DÍAS -->
          <div id="carouselTurnos" class="carousel slide" data-bs-ride="false" data-bs-interval="false">
            <div class="carousel-inner">
              ${gruposHtml}
            </div>

            <!-- Controles del carrusel -->
            ${diasPorSemana > 1 ? `
              <button class="carousel-control-prev" type="button" data-bs-target="#carouselTurnos" data-bs-slide="prev"
                style="background: rgba(0,0,0,0.5); width: 50px; height: 50px; border-radius: 50%; top: 50%; transform: translateY(-50%);">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Anterior</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#carouselTurnos" data-bs-slide="next"
                style="background: rgba(0,0,0,0.5); width: 50px; height: 50px; border-radius: 50%; top: 50%; transform: translateY(-50%);">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Siguiente</span>
              </button>

              <!-- Indicadores -->
              <div class="carousel-indicators" style="bottom: -40px;">
                ${Array.from({ length: diasPorSemana }, (_, i) => `
                  <button type="button" data-bs-target="#carouselTurnos" data-bs-slide-to="${i}"
                    ${i === 0 ? 'class="active" aria-current="true"' : ''}
                    aria-label="Día ${i + 1}"
                    style="background-color: ${i === 0 ? 'var(--tenant-primary-color)' : '#ccc'}; border-radius: 50%; width: 12px; height: 12px;">
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4" style="margin-top: 50px !important;">
            <button id="btn-cerrar" class="btn btn-secondary fw-semibold" style="
              background:var(--tenant-primary-color);
              color:white;
              border:none;
              border-radius:8px;
              padding:10px 20px;
              cursor:pointer;
              transition:all 0.2s ease;
            "><i class="fa-solid fa-circle-check"></i> Cerrar</button>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      `,
      didOpen: () => {
        // 🎠 Esperar a que Bootstrap cargue antes de inicializar el carrusel
        const initCarousel = () => {
          // @ts-ignore - Bootstrap está disponible globalmente
          if (typeof bootstrap === 'undefined') {
            setTimeout(initCarousel, 50);
            return;
          }

          const carouselElement = document.getElementById('carouselTurnos');
          if (carouselElement && diasPorSemana > 1) {
            // @ts-ignore - Bootstrap está disponible globalmente
            new bootstrap.Carousel(carouselElement, {
              ride: false,
              interval: false,
              wrap: true
            });

            // Actualizar indicadores del carrusel al cambiar de slide
            carouselElement.addEventListener('slide.bs.carousel', (event: any) => {
              const indicators = carouselElement.querySelectorAll('.carousel-indicators button');
              indicators.forEach((btn: any, idx: number) => {
                if (idx === event.to) {
                  btn.style.backgroundColor = 'var(--tenant-primary-color)';
                  btn.classList.add('active');
                  btn.setAttribute('aria-current', 'true');
                } else {
                  btn.style.backgroundColor = '#ccc';
                  btn.classList.remove('active');
                  btn.removeAttribute('aria-current');
                }
              });
            });
          }
        };

        // Iniciar la verificación de Bootstrap
        initCarousel();

        // 🎯 Agregar event listeners a TODOS los elementos del carrusel
        // Pequeño retraso para asegurar que el DOM está completamente listo
        setTimeout(() => {
          for (let i = 0; i < diasPorSemana; i++) {
          const diaSelect = document.getElementById(`dia-${i}`) as HTMLSelectElement;
          const turnoSelect = document.getElementById(`turno-${i}`) as HTMLSelectElement;
          const btnSave = document.getElementById(`btn-save-${i}`) as HTMLButtonElement;

          // Verificar que los elementos existen
          if (!diaSelect || !turnoSelect || !btnSave) {
            continue;
          }

          // 📅 Cargar turnos al seleccionar día
          diaSelect.addEventListener("change", async () => {
            const diaId = diaSelect.value;
            if (!diaId) return;
            turnoSelect.innerHTML = `<option>Cargando...</option>`;

            try {
              const { data } = await gymApi.get(`/turnosPlantilla/dia/${diaId}?planId=${planData.id}`);
              const turnos = data.items || data;

              // 🚫 Filtrar turnos ya asignados
              const disponibles = turnos.filter(
                (t: any) => !turnosAsignados.includes(t.id)
              );

              turnoSelect.innerHTML = disponibles.length
                ? disponibles.map((t: any) => {
                    const hora = formatearHora(t.horaInicio || "");
                    const duracion = t.duracionMin || "?";
                    const sala = t.sala?.nombre || "Sala";
                    const profesor = t.profesor || "Sin profesor";
                    return `<option value="${t.id}">
                      ${hora} - ${sala} - ${profesor} (${duracion} min)
                    </option>`;
                  }).join("")
                : `<option>No hay turnos disponibles</option>`;
            } catch (err) {
              turnoSelect.innerHTML = `<option>Error al cargar turnos</option>`;
            }
          });

          // Guardar turno individual
          btnSave.addEventListener("click", async () => {
            const diaId = diaSelect.value;
            const turnoId = turnoSelect.value;

            if (!diaId || !turnoId) {
              // Mostrar error inline sin cerrar el modal
              const warningMsg = document.getElementById("warning-message") as HTMLDivElement;
              const warningTxt = document.getElementById("warning-text") as HTMLSpanElement;
              if (warningMsg && warningTxt) {
                warningMsg.style.background = "#f8d7da";
                warningMsg.style.borderColor = "#dc3545";
                warningMsg.style.color = "#721c24";
                warningTxt.innerHTML = ` Seleccioná día y turno válidos para el grupo ${i + 1}`;
                warningMsg.querySelector("strong")!.textContent = '<i class="fa-solid fa-triangle-exclamation"></i> Atención';
                warningMsg.style.display = "block";
              }
              return;
            }

            try {
              await gymApi.post("/suscripcionturno", {
                suscripcionId: suscripcion.id,
                turnoPlantillaId: parseInt(turnoId),
              });

              // 📊 Marcar como guardado
              turnosGuardados.add(i);

              // 🔥 ACTUALIZAR turnosAsignados para evitar duplicados en el formulario
              turnosAsignados.push(parseInt(turnoId));

              // 🔽 Ocultar mensaje de advertencia si existe
              const warningMsg = document.getElementById("warning-message") as HTMLDivElement;
              if (warningMsg) warningMsg.style.display = "none";

              // ✅ Actualizar contador en el botón cerrar
              const btnCerrar = document.getElementById("btn-cerrar") as HTMLButtonElement;
              if (btnCerrar) {
                const guardados = turnosGuardados.size;
                const total = diasPorSemana;
                btnCerrar.innerHTML = `<i class="fa-solid fa-circle-check"></i> Cerrar (${guardados}/${total} guardados)`;
              }

              btnSave.textContent = '<i class="fa-solid fa-circle-check"></i> Guardado';
              btnSave.style.background = "linear-gradient(135deg, #28a745, #20c997)";
              btnSave.style.boxShadow = "0 4px 8px rgba(40, 167, 69, 0.3)";
              btnSave.style.transform = "scale(1)";
              btnSave.style.fontSize = "14px";
              btnSave.style.fontWeight = "600";
              btnSave.style.display = "flex";
              btnSave.style.alignItems = "center";
              btnSave.style.justifyContent = "center";
              btnSave.disabled = true;
            } catch (error: any) {
              const status = error.response?.status;
              const msg = error.response?.data?.message;

              // Mostrar error inline sin cerrar el modal
              const warningMsg = document.getElementById("warning-message") as HTMLDivElement;
              const warningTxt = document.getElementById("warning-text") as HTMLSpanElement;
              if (warningMsg && warningTxt) {
                warningMsg.style.background = "#f8d7da";
                warningMsg.style.borderColor = "#dc3545";
                warningMsg.style.color = "#721c24";

                if (status === 409) {
                  warningMsg.querySelector("strong")!.textContent = '<i class="fa-solid fa-triangle-exclamation"></i> Turno duplicado';
                  warningTxt.textContent = " Este turno ya fue asignado a esta suscripción.";
                } else if (status === 400) {
                  warningMsg.querySelector("strong")!.textContent = '<i class="fa-solid fa-triangle-exclamation"></i> Datos inválidos';
                  warningTxt.textContent = " " + (msg || "Verificá los datos enviados.");
                } else {
                  warningMsg.querySelector("strong")!.textContent = '<i class="fa-solid fa-circle-xmark"></i> Error';
                  warningTxt.textContent = " " + (msg || "No se pudo guardar el turno seleccionado.");
                }
                warningMsg.style.display = "block";
              }
            }
          });
        }
        }, 100); // 100ms de retraso para asegurar que el DOM esté listo

        // 🔄 Pre-cargar turnos ya asignados
        const precargarTurnosAsignados = async () => {
          for (const turnoAsignado of turnosAsignadosData) {
            // Verificar que el turno tenga la propiedad diaSemanaId (puede venir en diferentes formatos)
            const diaId = turnoAsignado.diaSemanaId || turnoAsignado.diaId || turnoAsignado.DiaSemanaId;

            if (!diaId) {
              continue;
            }

            // Buscar un día del carrusel que esté vacío
            for (let i = 0; i < diasPorSemana; i++) {
              const diaSelect = document.getElementById(`dia-${i}`) as HTMLSelectElement;
              const turnoSelect = document.getElementById(`turno-${i}`) as HTMLSelectElement;
              const btnSave = document.getElementById(`btn-save-${i}`) as HTMLButtonElement;

              if (!diaSelect || !turnoSelect || !btnSave) continue;

              // Si este día ya tiene un turno seleccionado, pasar al siguiente
              if (diaSelect.value) continue;

              // Seleccionar el día correspondiente al turno
              diaSelect.value = diaId;

              // Cargar los turnos para este día
              try {
                const { data } = await gymApi.get(`/turnosPlantilla/dia/${diaId}?planId=${planData.id}`);
                const turnos = data.items || data;

                const disponibles = turnos.filter(
                  (t: any) => !turnosAsignadosIds.has(t.id) || t.id === turnoAsignado.id
                );

                // Llenar el select con los turnos disponibles
                turnoSelect.innerHTML = disponibles.length
                  ? disponibles.map((t: any) => {
                      const hora = formatearHora(t.horaInicio || "");
                      const duracion = t.duracionMin || "?";
                      const sala = t.sala?.nombre || "Sala";
                      const profesor = t.profesor || "Sin profesor";
                      return `<option value="${t.id}">
                        ${hora} - ${sala} - ${profesor} (${duracion} min)
                      </option>`;
                    }).join("")
                  : `<option>No hay turnos disponibles</option>`;

                // Seleccionar el turno asignado
                turnoSelect.value = turnoAsignado.id;

                // Marcar como guardado
                turnosGuardados.add(i);

                // Actualizar el botón
                btnSave.textContent = '<i class="fa-solid fa-circle-check"></i> Guardado';
                btnSave.style.background = "linear-gradient(135deg, #28a745, #20c997)";
                btnSave.style.boxShadow = "0 4px 8px rgba(40, 167, 69, 0.3)";
                btnSave.style.transform = "scale(1)";
                btnSave.style.fontSize = "14px";
                btnSave.style.fontWeight = "600";
                btnSave.style.display = "flex";
                btnSave.style.alignItems = "center";
                btnSave.style.justifyContent = "center";
                btnSave.disabled = true;

                break; // Pasar al siguiente turno asignado
              } catch (err) {
                console.error("Error cargando turnos:", err);
              }
            }
          }

          // Actualizar contador en el botón cerrar
          const btnCerrar = document.getElementById("btn-cerrar") as HTMLButtonElement;
          if (btnCerrar) {
            const guardados = turnosGuardados.size;
            const total = diasPorSemana;
            btnCerrar.innerHTML = `<i class="fa-solid fa-circle-check"></i> Cerrar (${guardados}/${total} guardados)`;
          }
        };

        // Ejecutar la precarga después de una pequeña demora
        setTimeout(precargarTurnosAsignados, 200);

        // Inicializar el botón cerrar con el contador
        const btnCerrarInit = document.getElementById("btn-cerrar") as HTMLButtonElement;
        if (btnCerrarInit) {
          const guardadosInit = turnosGuardados.size;
          const totalInit = diasPorSemana;
          btnCerrarInit.innerHTML = `<i class="fa-solid fa-circle-check"></i> Cerrar (${guardadosInit}/${totalInit} guardados)`;
        }

        // 🔒 Botón cerrar: mostrar confirmación antes de cerrar
        const btnCerrar = document.getElementById("btn-cerrar") as HTMLButtonElement;

        btnCerrar.addEventListener("click", async () => {
          const guardados = turnosGuardados.size;
          const total = diasPorSemana;
          const incompletos = total - guardados;

          let titulo = "¿Cerrar asignación de turnos?";
          let mensaje = "";
          let icono: any = "question";

          if (incompletos > 0) {
            titulo = '<i class="fa-solid fa-triangle-exclamation"></i> ¿Cerrar sin completar todos los turnos?';
            mensaje = `
              <div style="text-align: left; font-size: 15px;">
                <p style="color: #856404;">Has guardado <strong>${guardados} de ${total} turnos</strong>. Faltan <strong>${incompletos}</strong> por asignar.</p>
                <p>¿Deseas cerrar de todas formas? Podrás asignar los turnos restantes más tarde.</p>
              </div>
            `;
            icono = "warning";
          } else {
            mensaje = `
              <div style="text-align: left; font-size: 15px;">
                <p>Se asignaron <strong>${total} turno(s)</strong> para el socio:</p>
                <ul style="list-style: none; padding-left: 0;">
                  <li><i class="fa-solid fa-user"></i> <strong>Socio:</strong> ${socioNombre}</li>
                  <li><i class="fa-solid fa-clipboard-list"></i> <strong>Plan:</strong> ${planNombre}</li>
                  <li><i class="fa-solid fa-calendar-days"></i> <strong>Días por semana:</strong> ${diasPorSemana}</li>
                </ul>
                <p style="margin-top: 15px; color: #666;">¿Confirmás que los datos son correctos?</p>
              </div>
            `;
          }

          const { isConfirmed } = await Swal.fire({
            title: titulo,
            html: mensaje,
            icon: icono,
            showCancelButton: true,
            confirmButtonText: incompletos > 0 ? '<i class="fa-solid fa-circle-check"></i> Sí, cerrar' : '<i class="fa-solid fa-circle-check"></i> Sí, completar',
            cancelButtonText: '<i class="fa-solid fa-circle-xmark"></i> Cancelar',
            confirmButtonColor: "var(--tenant-primary-color)",
            cancelButtonColor: "#6c757d",
            reverseButtons: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });

          if (isConfirmed) {
            Swal.close();
          }
        });
      },
    }).then(() => {
      if (onClose) onClose();
    });
  } catch (err) {
    Swal.fire("Error", "No se pudieron cargar los datos del plan o turnos.", "error");
  }
}



