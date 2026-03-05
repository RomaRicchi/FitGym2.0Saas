import { CuentaSaaSDto, EstadoCuentaSaaS } from "@/api/saasApi";

interface Props {
  cuenta: CuentaSaaSDto;
}

/**
 * Componente que muestra la información del plan actual y las estadísticas de uso
 */
export default function PlanActual({ cuenta }: Props) {
  const { planActual, estadisticasUso, estadoCuenta, diasRestantesTrial, mensajeEstado, proximoPago } = cuenta;

  if (!planActual || !estadisticasUso) {
    return (
      <div className="alert alert-warning">
        No hay información del plan disponible.
      </div>
    );
  }

  /**
   * Obtiene el badge y color del estado de cuenta SaaS
   */
  const getEstadoCuentaBadge = () => {
    switch (estadoCuenta) {
      case EstadoCuentaSaaS.Trial:
        return {
          text: diasRestantesTrial && diasRestantesTrial <= 3
            ? `<i class="fa-solid fa-hourglass-half"></i> Trial (${diasRestantesTrial} días restantes)`
            : `<i class="fa-solid fa-star"></i> Trial (${diasRestantesTrial} días restantes)`,
          color: diasRestantesTrial && diasRestantesTrial <= 3 ? "warning" : "info"
        };
      case EstadoCuentaSaaS.Activo:
        return { text: "Activo", color: "success", icon: "fa-check-circle" };
      case EstadoCuentaSaaS.EnGracia:
        return { text: '<i class="fa-solid fa-triangle-exclamation"></i> Período de Gracia', color: "warning" };
      case EstadoCuentaSaaS.Suspendido:
        return { text: '<i class="fa-solid fa-ban"></i> Suspendido', color: "danger" };
      case EstadoCuentaSaaS.Cancelado:
        return { text: "Cancelado", color: "secondary", icon: "fa-times-circle" };
      default:
        return { text: planActual.estaVigente ? "Vigente" : "Vencido", color: planActual.estaVigente ? "success" : "danger" };
    }
  };

  const getPorcentajeColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "danger";
    if (porcentaje >= 70) return "warning";
    return "success";
  };

  const getVencimientoColor = (diasRestantes: number) => {
    if (diasRestantes <= 7) return "danger";
    if (diasRestantes <= 30) return "warning";
    return "success";
  };

  return (
    <div>
      {/* Info del Plan */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-orange text-white">
          <h5 className="mb-0"><i class="fa-solid fa-chart-line"></i> Mi Plan: {planActual.nombre}</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Tipo de Facturación</label>
              <p className="form-control-plaintext">
                {planActual.esAnual ? (
                  <span className="badge bg-success">Anual (ahorras 17%)</span>
                ) : (
                  <span className="badge bg-info">Mensual</span>
                )}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Estado de la Cuenta</label>
              <p className="form-control-plaintext">
                <span
                  className={`badge bg-${getEstadoCuentaBadge().color} fs-6`}
                  dangerouslySetInnerHTML={{ __html: getEstadoCuentaBadge().text }}
                />
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">Fecha de Vencimiento</label>
              <p className="form-control-plaintext">
                {planActual.planVenceEn ? (
                  <>
                    {new Date(planActual.planVenceEn).toLocaleDateString("es-AR")}
                    <span className={`badge bg-${getVencimientoColor(planActual.diasRestantes)} ms-2`}>
                      {planActual.diasRestantes} días restantes
                    </span>
                  </>
                ) : (
                  "Sin vencimiento"
                )}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold text-muted">
                {estadoCuenta === EstadoCuentaSaaS.EnGracia ? "Fin del Período de Gracia" :
                 estadoCuenta === EstadoCuentaSaaS.Suspendido ? "Estado desde" :
                 estadoCuenta === EstadoCuentaSaaS.Trial ? "Fin del Trial" :
                 "Próximo Pago"}
              </label>
              <p className="form-control-plaintext">
                {proximoPago ? (() => {
                  const fechaPago = new Date(proximoPago);
                  const hoy = new Date();
                  const diasDiff = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                  let color = "success";
                  if (diasDiff <= 2) color = "danger";
                  else if (diasDiff <= 7) color = "warning";

                  return (
                    <>
                      {fechaPago.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                      <span className={`badge bg-${color} ms-2`}>
                        {diasDiff > 0 ? `${diasDiff} días` : 'Hoy'}
                      </span>
                    </>
                  );
                })() : (
                  <span className="text-muted">N/A</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de Uso */}
      <div className="card shadow-sm">
        <div className="card-header bg-orange text-white">
          <h5 className="mb-0"><i class="fa-solid fa-chart-line"></i> Estadísticas de Uso</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Socios */}
            <div className="col-md-6 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="fw-semibold"><i class="fa-solid fa-users"></i> Socios Activos</label>
                <span className="badge bg-secondary">
                  {estadisticasUso.sociosActivos} / {estadisticasUso.porcentajeUsoSocios > 999 ? '∞' : '-'}
                </span>
              </div>
              <div className="progress" style={{ height: "25px" }}>
                <div
                  className={`progress-bar bg-${getPorcentajeColor(estadisticasUso.porcentajeUsoSocios)}`}
                  role="progressbar"
                  style={{ width: `${Math.min(estadisticasUso.porcentajeUsoSocios, 100)}%` }}
                >
                  {estadisticasUso.porcentajeUsoSocios.toFixed(1)}%
                </div>
              </div>
              {estadisticasUso.porcentajeUsoSocios >= 90 && (
                <small className="text-danger">
                  <i class="fa-solid fa-triangle-exclamation"></i> Estás cerca del límite de tu plan. Considera actualizar.
                </small>
              )}
            </div>

            {/* Personal */}
            <div className="col-md-6 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="fw-semibold"><i class="fa-solid fa-dumbbell"></i> Personal Activo</label>
                <span className="badge bg-secondary">
                  {estadisticasUso.personalActivo} / {estadisticasUso.porcentajeUsoPersonal > 999 ? '∞' : '-'}
                </span>
              </div>
              <div className="progress" style={{ height: "25px" }}>
                <div
                  className={`progress-bar bg-${getPorcentajeColor(estadisticasUso.porcentajeUsoPersonal)}`}
                  role="progressbar"
                  style={{ width: `${Math.min(estadisticasUso.porcentajeUsoPersonal, 100)}%` }}
                >
                  {estadisticasUso.porcentajeUsoPersonal.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Salas */}
            <div className="col-md-6 mb-3">
              <label className="fw-semibold"><i class="fa-solid fa-building"></i> Salas Activas</label>
              <p className="form-control-plaintext">
                {estadisticasUso.salasActivas} salas configuradas
              </p>
            </div>

            {/* Turnos */}
            <div className="col-md-6 mb-3">
              <label className="fw-semibold"><i class="fa-solid fa-calendar-days"></i> Turnos Configurados</label>
              <p className="form-control-plaintext">
                {estadisticasUso.turnosActivos} turnos por día
              </p>
            </div>

            {/* Check-ins del mes */}
            <div className="col-md-6 mb-3">
              <label className="fw-semibold"><i class="fa-solid fa-chart-line"></i> Check-ins este mes</label>
              <p className="form-control-plaintext">
                {estadisticasUso.checkinsMes} registros
              </p>
            </div>

            {/* Estado de vigencia - Solo mostrar si está activo */}
            {estadoCuenta === EstadoCuentaSaaS.Activo && (
              <div className="col-md-6 mb-3">
                <label className="fw-semibold"><i class="fa-solid fa-clock"></i> Próximo Cobro</label>
                <p className="form-control-plaintext">
                  {proximoPago ? (() => {
                    const fechaPago = new Date(proximoPago);
                    const hoy = new Date();
                    const diasDiff = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                    let color = "success";
                    if (diasDiff <= 2) color = "danger";
                    else if (diasDiff <= 7) color = "warning";

                    return (
                      <span className={`badge bg-${color} fs-6`}>
                        {fechaPago.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    );
                  })() : (
                    <span className="text-muted">No programado</span>
                  )}
                </p>
              </div>
            )}

            {/* Días restantes de trial - Solo para trial */}
            {estadoCuenta === EstadoCuentaSaaS.Trial && (
              <div className="col-md-6 mb-3">
                <label className="fw-semibold"><i class="fa-solid fa-clock"></i> Días de Trial Restantes</label>
                <p className="form-control-plaintext">
                  <span className={`badge bg-${diasRestantesTrial && diasRestantesTrial <= 3 ? "warning" : "info"} fs-6`}>
                    {diasRestantesTrial || 0} días
                  </span>
                </p>
              </div>
            )}

            {/* Días restantes de gracia - Solo para en gracia */}
            {estadoCuenta === EstadoCuentaSaaS.EnGracia && proximoPago && (
              <div className="col-md-6 mb-3">
                <label className="fw-semibold"><i class="fa-solid fa-clock"></i> Tiempo Restante</label>
                <p className="form-control-plaintext">
                  {(() => {
                    const fechaPago = new Date(proximoPago);
                    const hoy = new Date();
                    const diasDiff = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <span className="badge bg-danger fs-6">
                        {diasDiff > 0 ? `${diasDiff} días` : 'Último día'}
                      </span>
                    );
                  })()}
                </p>
              </div>
            )}

            {/* Mensaje de suspensión */}
            {estadoCuenta === EstadoCuentaSaaS.Suspendido && (
              <div className="col-md-6 mb-3">
                <label className="fw-semibold"><i class="fa-solid fa-clock"></i> Estado</label>
                <p className="form-control-plaintext text-danger">
                  <strong>Servicio suspendido</strong>
                </p>
              </div>
            )}

            {/* Para planes activos que no son SaaS, mostrar vigencia normal */}
            {!estadoCuenta || estadoCuenta === EstadoCuentaSaaS.Activo && !proximoPago && (
              <div className="col-md-6 mb-3">
                <label className="fw-semibold"><i class="fa-solid fa-clock"></i> Vigencia</label>
                <p className="form-control-plaintext">
                  <span className={`badge bg-${getVencimientoColor(planActual.diasRestantes)} fs-6`}>
                    {planActual.diasRestantes > 999 ? 'Ilimitado' : `${planActual.diasRestantes} días restantes`}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Alertas */}
          {estadoCuenta === EstadoCuentaSaaS.Suspendido && (
            <div className="alert alert-danger mt-3">
              <strong><i class="fa-solid fa-ban"></i> Cuenta Suspendida</strong> Tu cuenta ha sido suspendida por pagos pendientes.
              Por favor actualiza tu método de pago para reactivar el servicio.
            </div>
          )}

          {estadoCuenta === EstadoCuentaSaaS.EnGracia && (
            <div className="alert alert-warning mt-3">
              <strong><i class="fa-solid fa-triangle-exclamation"></i> Período de Gracia</strong> {mensajeEstado || "Tu pago falló. Tienes un período de gracia para actualizar tu método de pago."}
            </div>
          )}

          {estadoCuenta === EstadoCuentaSaaS.Trial && diasRestantesTrial && diasRestantesTrial <= 3 && (
            <div className="alert alert-warning mt-3">
              <strong><i class="fa-solid fa-hourglass-half"></i> ¡Últimos días del Trial!</strong> Tu período de prueba termina en {diasRestantesTrial} días.
              Agrega un método de pago para continuar usando el servicio.
            </div>
          )}

          {estadoCuenta !== EstadoCuentaSaaS.Trial &&
           estadoCuenta !== EstadoCuentaSaaS.EnGracia &&
           estadoCuenta !== EstadoCuentaSaaS.Suspendido &&
           planActual.diasRestantes <= 7 &&
           planActual.diasRestantes > 0 && (
            <div className="alert alert-danger mt-3">
              <strong><i class="fa-solid fa-triangle-exclamation"></i> ¡Atención!</strong> Tu plan vence en menos de {planActual.diasRestantes} días.
              Renueva o cambia tu plan para evitar interrupciones.
            </div>
          )}

          {estadoCuenta !== EstadoCuentaSaaS.Trial &&
           estadoCuenta !== EstadoCuentaSaaS.EnGracia &&
           estadoCuenta !== EstadoCuentaSaaS.Suspendido &&
           planActual.diasRestantes <= 30 &&
           planActual.diasRestantes > 7 && (
            <div className="alert alert-warning mt-3">
              <strong><i class="fa-solid fa-circle-info"></i> Información</strong> Tu plan vence en {planActual.diasRestantes} días.
              Considera renovar pronto para no perder el servicio.
            </div>
          )}
        </div>
      </div>

      {/* Características del plan */}
      <div className="card mt-4 shadow-sm">
        <div className="card-header bg-orange text-white">
          <h5 className="mb-0"><i class="fa-solid fa-sparkles"></i> Características Incluidas</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {planActual.caracteristicas.map((caracteristica) => (
              <div key={caracteristica.id} className="col-md-6 mb-2">
                <span className={caracteristica.valor ? "text-success" : "text-muted"}>
                  {caracteristica.valor ? <i className="fas fa-check-circle"></i> : <i className="fas fa-times-circle" style={{color: "#999"}}></i>}
                </span>
                <span className="ms-2">
                  {formatearCaracteristica(caracteristica.codigo)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Formatea el código de característica a texto legible
 */
function formatearCaracteristica(codigo: string): string {
  const map: Record<string, string> = {
    "tiene_rutinas": "Rutinas personalizadas",
    "tiene_evolucion_fisica": "Seguimiento de evolución física",
    "tiene_checkin": "Sistema de check-in",
    "tiene_reportes_avanzados": "Reportes avanzados",
    "tiene_app_personalizada": "App personalizada",
    "tiene_soporte_prioritario": "Soporte prioritario",
    "tiene_api_acceso": "Acceso a API",
    "tiene_integraciones": "Integraciones con otros servicios",
  };
  return map[codigo] || codigo.replace("tiene_", "").replace(/_/g, " ");
}


