import gymApi from "./gymApi";

// Interfaces TypeScript para los DTOs de auditoría
export interface AuditoriaOperacion {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail: string;
  tipoOperacion: string;
  entidad: string;
  entidadId?: number;
  datosAntiguos?: string;
  datosNuevos?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  comentarios?: string;
}

export interface AuditoriaFilter {
  desde?: string;
  hasta?: string;
  entidad?: string;
  usuarioId?: number;
  tipoOperacion?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AuditoriaPaginatedResponse {
  items: AuditoriaOperacion[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ReporteAuditoria {
  totalOperaciones: number;
  operacionesPorTipo: Record<string, number>;
  operacionesPorEntidad: Record<string, number>;
  operacionesPorUsuario: Record<string, number>;
  operacionesRecientes: AuditoriaOperacion[];
  fechaGeneracion: string;
}

export interface CrearAuditoriaOperacion {
  usuarioId: number;
  tipoOperacion: string;
  entidad: string;
  entidadId?: number;
  datosAntiguos?: string;
  datosNuevos?: string;
  comentarios?: string;
}

// API de Auditoría
export const auditoriaApi = {
  /**
   * Obtiene el historial de auditoría con filtros opcionales
   * Solo accesible por administradores
   */
  getHistorial: async (filtros?: AuditoriaFilter): Promise<AuditoriaPaginatedResponse> => {
    const params = new URLSearchParams();

    if (filtros?.desde) params.append("desde", filtros.desde);
    if (filtros?.hasta) params.append("hasta", filtros.hasta);
    if (filtros?.entidad) params.append("entidad", filtros.entidad);
    if (filtros?.usuarioId) params.append("usuarioId", filtros.usuarioId.toString());
    if (filtros?.tipoOperacion) params.append("tipoOperacion", filtros.tipoOperacion);
    if (filtros?.pageNumber) params.append("pageNumber", filtros.pageNumber.toString());
    if (filtros?.pageSize) params.append("pageSize", filtros.pageSize.toString());

    const response = await gymApi.get<AuditoriaPaginatedResponse>(
      `/auditoria/historial?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Obtiene el historial de auditoría para una entidad específica
   * Accesible por administradores y recepcionistas
   */
  getHistorialEntidad: async (entidad: string, entidadId: number): Promise<AuditoriaOperacion[]> => {
    const response = await gymApi.get<AuditoriaOperacion[]>(
      `/auditoria/entidad/${entidad}/${entidadId}`
    );
    return response.data;
  },

  /**
   * Obtiene un registro de auditoría por su ID
   * Solo accesible por administradores
   */
  getById: async (id: number): Promise<AuditoriaOperacion> => {
    const response = await gymApi.get<AuditoriaOperacion>(`/auditoria/${id}`);
    return response.data;
  },

  /**
   * Obtiene un reporte agregado de auditoría para un período
   * Solo accesible por administradores
   */
  getReporte: async (desde?: string, hasta?: string, usuarioId?: number): Promise<ReporteAuditoria> => {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    if (usuarioId) params.append("usuarioId", usuarioId.toString());

    const response = await gymApi.get<ReporteAuditoria>(
      `/auditoria/reportes?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Registra manualmente una operación de auditoría
   * Útil para registrar eventos personalizados
   */
  registrarAuditoria: async (data: CrearAuditoriaOperacion): Promise<AuditoriaOperacion> => {
    const response = await gymApi.post<AuditoriaOperacion>("/auditoria", data);
    return response.data;
  },
};

export default auditoriaApi;
