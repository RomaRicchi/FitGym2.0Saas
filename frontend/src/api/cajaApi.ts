import gymApi from "./gymApi";

// Enums
export enum EstadoCaja {
  Abierta = 1,
  Cerrada = 2,
  EnArqueo = 3,
  Anulada = 4,
}

export enum TipoMovimientoCaja {
  Venta = 1,
  Retiro = 2,
  IngresoExtra = 3,
  Devolucion = 4,
  AperturaDotacion = 5,
  Ajuste = 6,
}

export enum MetodoPagoCaja {
  Efectivo = 1,
  Transferencia = 2,
  MercadoPago = 3,
  Cheque = 4,
  TarjetaDebito = 5,
  TarjetaCredito = 6,
}

// Interfaces TypeScript para los DTOs de caja
export interface MovimientoCaja {
  id: number;
  tipo: TipoMovimientoCaja;
  monto: number;
  metodoPago: MetodoPagoCaja;
  descripcion?: string;
  timestamp: string;
  comentarios?: string;
  referenciaId?: number;
  tipoReferencia?: string;
}

export interface CajaRecepcionista {
  id: number;
  recepcionistaId: number;
  recepcionistaNombre: string;
  apertura: string;
  cierre?: string;
  dotacionInicial: number;
  montoEsperado: number;
  montoReal: number;
  diferencia: number;
  estado: EstadoCaja;
  observaciones?: string;
  movimientos: MovimientoCaja[];
}

export interface CajaActiva {
  id: number;
  apertura: string;
  dotacionInicial: number;
  ventasDelDia: number;
  transaccionesDelDia: number;
}

export interface ResumenCaja {
  ventasEfectivo: number;
  ventasTransferencia: number;
  ventasMercadoPago: number;
  ventasOtros: number;
  totalVentas: number;
  totalRetiros: number;
  totalIngresosExtra: number;
  totalTransacciones: number;
}

export interface AperturarCajaDto {
  dotacionInicial: number;
}

export interface CerrarCajaDto {
  cajaId: number;
  montoReal: number;
  observaciones?: string;
}

export interface RetiroDto {
  monto: number;
  motivo: string;
}

export interface IngresoExtraDto {
  monto: number;
  concepto: string;
  metodoPago: MetodoPagoCaja;
}

export interface CajaFilter {
  desde?: string;
  hasta?: string;
  recepcionistaId?: number;
  estado?: EstadoCaja;
  pageNumber?: number;
  pageSize?: number;
}

export interface CajaPaginatedResponse {
  items: CajaRecepcionista[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ReporteCajas {
  cajas: CajaRecepcionista[];
  totalVentasPeriodo: number;
  totalDiferencias: number;
  promedioTransaccionesPorCaja: number;
  totalSobrantes: number;
  totalFaltantes: number;
}

// API de Caja
export const cajaApi = {
  /**
   * Apertura una nueva caja para el recepcionista actual
   * Solo accesible por recepcionistas y admin
   */
  aperturarCaja: async (data: AperturarCajaDto): Promise<CajaRecepcionista> => {
    const response = await gymApi.post<CajaRecepcionista>("/caja/aperturar", data);
    return response.data;
  },

  /**
   * Cierra una caja existente y realiza el arqueo
   * Solo accesible por recepcionistas y admin
   */
  cerrarCaja: async (data: CerrarCajaDto): Promise<CajaRecepcionista> => {
    const response = await gymApi.post<CajaRecepcionista>("/caja/cerrar", data);
    return response.data;
  },

  /**
   * Obtiene la caja activa del recepcionista actual
   * Solo accesible por recepcionistas y admin
   */
  getCajaActiva: async (): Promise<CajaRecepcionista | null> => {
    const response = await gymApi.get<CajaRecepcionista>("/caja/activa", {
      validateStatus: (status) => status === 200 || status === 404,
    });
    if (response.status === 404) return null;
    return response.data;
  },

  /**
   * Obtiene información simplificada de la caja activa para el dashboard
   * Solo accesible por recepcionistas y admin
   */
  getInfoCajaActiva: async (): Promise<CajaActiva | null> => {
    const response = await gymApi.get<CajaActiva>("/caja/activa/info", {
      validateStatus: (status) => status === 200 || status === 404,
    });
    if (response.status === 404) return null;
    return response.data;
  },

  /**
   * Obtiene los movimientos de una caja específica
   * Solo accesible por admin y recepcionistas
   */
  getMovimientos: async (cajaId: number): Promise<MovimientoCaja[]> => {
    const response = await gymApi.get<MovimientoCaja[]>(`/caja/${cajaId}/movimientos`);
    return response.data;
  },

  /**
   * Obtiene el resumen de una caja específica
   * Solo accesible por admin y recepcionistas
   */
  getResumen: async (cajaId: number): Promise<ResumenCaja> => {
    const response = await gymApi.get<ResumenCaja>(`/caja/${cajaId}/resumen`);
    return response.data;
  },

  /**
   * Obtiene el historial de cajas (solo admin)
   * Solo accesible por administradores
   */
  getHistorial: async (filtros?: CajaFilter): Promise<CajaPaginatedResponse> => {
    const params = new URLSearchParams();

    if (filtros?.desde) params.append("desde", filtros.desde);
    if (filtros?.hasta) params.append("hasta", filtros.hasta);
    if (filtros?.recepcionistaId) params.append("recepcionistaId", filtros.recepcionistaId.toString());
    if (filtros?.estado) params.append("estado", filtros.estado.toString());
    if (filtros?.pageNumber) params.append("pageNumber", filtros.pageNumber.toString());
    if (filtros?.pageSize) params.append("pageSize", filtros.pageSize.toString());

    const response = await gymApi.get<CajaPaginatedResponse>(
      `/caja/historial?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Obtiene el reporte de cajas para un período (solo admin)
   * Solo accesible por administradores
   */
  getReporte: async (desde: string, hasta: string): Promise<ReporteCajas> => {
    const params = new URLSearchParams();
    params.append("desde", desde);
    params.append("hasta", hasta);

    const response = await gymApi.get<ReporteCajas>(
      `/caja/reporte?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Registra un retiro de efectivo de la caja
   * Solo accesible por recepcionistas y admin
   */
  registrarRetiro: async (data: RetiroDto): Promise<MovimientoCaja> => {
    const response = await gymApi.post<MovimientoCaja>("/caja/movimientos/retiro", data);
    return response.data;
  },

  /**
   * Registra un ingreso extra en la caja
   * Solo accesible por recepcionistas y admin
   */
  registrarIngresoExtra: async (data: IngresoExtraDto): Promise<MovimientoCaja> => {
    const response = await gymApi.post<MovimientoCaja>("/caja/movimientos/ingreso-extra", data);
    return response.data;
  },
};

export default cajaApi;
