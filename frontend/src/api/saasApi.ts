import gymApi from "./gymApi";

/**
 * Servicio de API para gestión de cuenta SaaS
 */

// Tipos para los DTOs de SaaS
export interface PlanSaaSDto {
  id: number;
  nombre: string;
  descripcion?: string;
  precioMensual: number;
  precioAnual: number;
  maxSocios: number;
  maxPersonal: number;
  maxSalas: number;
  maxTurnosPorDia: number;
  activo: boolean;
  orden: number;
  caracteristicas: CaracteristicaPlanSaaSDto[];
}

export interface CaracteristicaPlanSaaSDto {
  id: number;
  codigo: string;
  valor: boolean;
}

export interface PlanTenantDto {
  id: number;
  nombre: string;
  descripcion?: string;
  esAnual: boolean;
  planVenceEn?: string;
  diasRestantes: number;
  estaVigente: boolean;
  caracteristicas: CaracteristicaPlanSaaSDto[];
}

export interface TenantUsageStatsDto {
  sociosActivos: number;
  personalActivo: number;
  salasActivas: number;
  turnosActivos: number;
  checkinsMes: number;
  planVenceEn?: string;
  diasRestantes: number;
  porcentajeUsoSocios: number;
  porcentajeUsoPersonal: number;
}

export enum EstadoCuentaSaaS {
  Trial = 1,
  Activo = 2,
  EnGracia = 3,
  Suspendido = 4,
  Cancelado = 5
}

export interface CuentaSaaSDto {
  tenantId: number;
  nombreGimnasio: string;
  slug?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro: string;
  activo: boolean;
  codigoReferido?: string;
  planActual?: PlanTenantDto;
  estadisticasUso?: TenantUsageStatsDto;
  nombreAdmin?: string;
  adminId?: number;
  estadoCuenta?: EstadoCuentaSaaS;
  diasRestantesTrial?: number;
  proximoPago?: string;
  mensajeEstado?: string;
}

export interface ActualizarCuentaRequest {
  nombreGimnasio: string;
  slug?: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface CambiarPasswordAdminRequest {
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

export interface CancelarServicioRequest {
  motivo: string;
  comentarios?: string;
  cancelacionInmediata: boolean;
}

export interface CancelarServicioResponse {
  fechaFin: string;
  cancelacionInmediata: boolean;
  mensaje: string;
}

export interface CambiarPlanRequest {
  planSaasId: number;
  esAnual: boolean;
}

export interface CambioPlanResponseDto {
  preapprovalUrl: string;
  mensaje: string;
}

export interface CambioPlanErrorResponseDto {
  mensajeError: string;
  sociosActivos: number;
  limiteNuevoPlan: number;
  sociosADarDeBaja: number;
}

export interface CambioPlanApiResponse {
  success: boolean;
  message: string;
  data?: CambioPlanResponseDto | CambioPlanErrorResponseDto;
  statusCode: number;
  timestamp: string;
}

export interface IniciarPagoSaaSRequest {
  planSaasId: number;
  esAnual: boolean;
}

export interface IniciarPagoSaaSResponse {
  initPoint: string;
  planNombre: string;
  monto: number;
  esAnual: boolean;
}

export enum EstadoPagoSaaS {
  Pendiente = 1,
  Exitoso = 2,
  Fallido = 3
}

export interface HistorialPagoSaaSDto {
  fechaIntento: Date;
  fechaProcesamiento: Date | null;
  monto: number;
  estado: EstadoPagoSaaS;
  estadoStr: string;
  planNombre: string;
  transaccionId: string;
  esRenovacionAutomatica: boolean;
  intentosRealizados: number;
}

/**
 * DTO para el dashboard administrativo SaaS
 */
export interface TenantAdminDto {
  tenantId: number;
  nombreGimnasio: string;
  slug?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro: string;
  activo: boolean;
  planSaas?: PlanSaaSAdminDto;
  planVenceEn?: string;
  diasRestantes: number;
  estadoCuenta: EstadoCuentaSaaS;
  diasRestantesTrial: number;
  estadisticasUso: TenantUsageStatsDto;
  adminNombre?: string;
  adminEmail?: string;
  ultimoPagoExitoso?: string;
  proximoPago?: string;
}

export interface PlanSaaSAdminDto {
  id: number;
  nombre: string;
  esAnual: boolean;
}

/**
 * Obtiene todos los planes SaaS disponibles
 */
export const getPlanesSaaS = async (): Promise<PlanSaaSDto[]> => {
  const response = await gymApi.get<PlanSaaSDto[]>("/saas/plans");
  return response.data;
};

/**
 * Obtiene el plan actual del tenant autenticado
 */
export const getPlanActual = async (): Promise<PlanTenantDto> => {
  const response = await gymApi.get<PlanTenantDto>("/saas/plans/current");
  return response.data;
};

/**
 * Cambia el plan SaaS del tenant actual
 * Retorna la respuesta completa del API que puede incluir preapprovalUrl o error de socios
 */
export const cambiarPlan = async (request: CambiarPlanRequest): Promise<CambioPlanApiResponse> => {
  const response = await gymApi.post<any>("/saas/plans/change", request);

  // Construir respuesta estandarizada
  const data = response.data;
  return {
    success: response.status === 200,
    message: data.message || data.mensajeError || "Plan cambiado correctamente",
    data: data.data || data,
    statusCode: response.status,
    timestamp: new Date().toISOString()
  };
};

/**
 * Obtiene las estadísticas de uso del tenant actual
 */
export const getEstadisticasUso = async (): Promise<TenantUsageStatsDto> => {
  const response = await gymApi.get<TenantUsageStatsDto>("/saas/plans/usage");
  return response.data;
};

/**
 * Obtiene la información completa de la cuenta SaaS
 */
export const getCuentaSaaS = async (): Promise<CuentaSaaSDto> => {
  const response = await gymApi.get<CuentaSaaSDto>("/saas/plans/cuenta");
  return response.data;
};

/**
 * Actualiza la información de la cuenta SaaS
 */
export const actualizarCuenta = async (request: ActualizarCuentaRequest): Promise<CuentaSaaSDto> => {
  const response = await gymApi.put<CuentaSaaSDto>("/saas/plans/cuenta", request);
  return response.data;
};

/**
 * Cambia la contraseña del administrador SaaS
 */
export const cambiarPasswordAdmin = async (request: CambiarPasswordAdminRequest): Promise<void> => {
  await gymApi.post<void>("/saas/plans/cambiar-password", request);
};

/**
 * Cancela el servicio SaaS
 */
export const cancelarServicio = async (request: CancelarServicioRequest): Promise<CancelarServicioResponse> => {
  const response = await gymApi.post<CancelarServicioResponse>("/saas/plans/cancelar-servicio", request);
  return response.data;
};

/**
 * Obtiene el historial de pagos SaaS del tenant autenticado
 */
export const getHistorialPagosSaaS = async (): Promise<HistorialPagoSaaSDto[]> => {
  const response = await gymApi.get<HistorialPagoSaaSDto[]>("/saas/plans/historial-pagos");
  return response.data;
};

/**
 * Obtiene todos los tenants (solo para super tenant)
 */
export const getAllTenantsAdmin = async (): Promise<TenantAdminDto[]> => {
  const response = await gymApi.get<TenantAdminDto[]>("/saas/plans/admin/tenants");
  return response.data;
};

/**
 * Inicia el proceso de pago SaaS con MercadoPago
 * Genera una preferencia de pago y devuelve el init_point para redirigir
 */
export const iniciarPagoSaaS = async (request: IniciarPagoSaaSRequest): Promise<IniciarPagoSaaSResponse> => {
  const response = await gymApi.post<IniciarPagoSaaSResponse>("/saas/pagar/iniciar", request);
  return response.data;
};

// Objeto con todos los métodos
const saasApi = {
  getPlanesSaaS,
  getPlanActual,
  cambiarPlan,
  getEstadisticasUso,
  getCuentaSaaS,
  actualizarCuenta,
  cambiarPasswordAdmin,
  cancelarServicio,
  getHistorialPagosSaaS,
  getAllTenantsAdmin,
  iniciarPagoSaaS,
};

export default saasApi;
