import gymApi from "./gymApi";

export interface EstadoCuentaSaaS {
  estado: number; // EstadoCuentaSaaS enum
  diasRestantesTrial: number;
  proximoPago: string | null;
  mensaje: string;
  requiereAccion: boolean;
  tipoAccion: string | null;
}

export const pagosSaaSApi = {
  /**
   * Obtiene el estado de cuenta del tenant actual
   */
  getEstadoCuenta: async (): Promise<EstadoCuentaSaaS> => {
    const response = await gymApi.get<EstadoCuentaSaaS>("/pagossaas/estado-cuenta");
    return response.data;
  },

  /**
   * Inicia el período de prueba de 14 días
   */
  iniciarTrial: async (): Promise<void> => {
    await gymApi.post("/pagossaas/iniciar-trial");
  },

  /**
   * Verifica y actualiza el estado de cuenta (llamar al hacer login)
   */
  verificarEstado: async (): Promise<{ activo: boolean }> => {
    const response = await gymApi.post<{ activo: boolean }>("/pagossaas/verificar-estado");
    return response.data;
  },

  /**
   * Genera link de pago para cuando el método falló
   */
  generarLinkPago: async (): Promise<{ link: string | null }> => {
    const response = await gymApi.get<{ link: string | null }>("/pagossaas/link-pago");
    return response.data;
  },
};
