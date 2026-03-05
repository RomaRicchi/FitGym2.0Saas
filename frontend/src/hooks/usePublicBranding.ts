import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Convierte un color HEX a formato RGB para Bootstrap
 */
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '230, 81, 0'; // Default naranja oscuro
};

interface PublicBranding {
  nombre: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundImageUrl?: string;
  loginBackgroundImageUrl?: string;
  loginBackgroundType: 'image' | 'solid';
  loginBackgroundColor?: string;
}

interface PublicBrandingResponse {
  success: boolean;
  data: PublicBranding;
  message: string;
}

/**
 * Hook para obtener el branding público sin autenticación
 * Útil para la página de login
 */
export const usePublicBranding = () => {
  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5144';
        const response = await axios.get<PublicBrandingResponse>(`${apiBaseUrl}/api/tenants/public/branding`);

        if (response.data.success) {
          const brandingData = response.data.data;
          setBranding(brandingData);
          applyPublicBranding(brandingData);
        }
      } catch (err) {
        console.error('Error fetching public branding:', err);
        // Usar valores por defecto si hay error
        const defaultBranding = {
          nombre: 'SpazioMg',
          primaryColor: '#e65100',
          secondaryColor: '#ff9100',
          loginBackgroundType: 'image' as const,
        };
        setBranding(defaultBranding);
        applyPublicBranding(defaultBranding);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  return { branding, loading };
};

/**
 * Aplica los colores de branding público al DOM
 */
const applyPublicBranding = (branding: PublicBranding) => {
  const root = document.documentElement;

  const primary = branding.primaryColor || '#e65100';
  const secondary = branding.secondaryColor || '#ff9100';

  // Aplicar color primario
  root.style.setProperty('--tenant-primary-color', primary);
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--bs-primary', primary);
  root.style.setProperty('--bs-primary-rgb', hexToRgb(primary));

  // Aplicar color secundario
  root.style.setProperty('--tenant-secondary-color', secondary);
  root.style.setProperty('--bs-secondary', secondary);
  root.style.setProperty('--bs-secondary-rgb', hexToRgb(secondary));
};

export default usePublicBranding;
