import { useState, useEffect } from 'react';
import gymApi from '../api/gymApi';

/**
 * Resuelve una URL de imagen, convirtiendo URLs relativas a absolutas
 */
const resolveImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:5144';

  const cleanBase = apiBase.replace(/\/api$/, '');
  return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export interface Tenant {
  id: number;
  nombre: string;
  slug?: string;
  logo?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundImageUrl?: string;
  backgroundType?: 'image' | 'solid';
  backgroundColor?: string;
  loginBackgroundImageUrl?: string;
  loginBackgroundType?: 'image' | 'solid';
  loginBackgroundColor?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  planSaasId: number;
  planSaas?: {
    id: number;
    nombre: string;
    tieneAppPersonalizada: boolean;
  };
}

export const useTenant = () => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      // El interceptor de gymApi ya desenvuelve la respuesta, así que response.data es directamente el Tenant
      const response = await gymApi.get<Tenant>('/tenants/current');
      if (response.data) {
        setTenant(response.data);
        applyTenantBranding(response.data);
      }
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError('No se pudo cargar la información del tenant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, []);

  return { tenant, loading, error, refetch: fetchTenant };
};

/**
 * Aplica los colores personalizados del tenant al DOM
 */
export const applyTenantBranding = (tenant: Tenant) => {
  if (!tenant) return;

  const root = document.documentElement;
  const body = document.body;

  // Aplicar colores según el plan del tenant
  const hasCustomBranding = tenant.planSaas?.tieneAppPersonalizada || false;

  let primary, secondary;

  if (hasCustomBranding) {
    // Planes Premium/Enterprise: usar colores personalizados
    primary = tenant.primaryColor || '#ff6600';
    secondary = tenant.secondaryColor || primary;
    body.classList.add('has-custom-branding');
  } else {
    // Planes sin personalización: naranja oscuro (primario) y naranja claro (secundario)
    primary = '#e65100';   // Naranja oscuro para botones de guardar/confirmar
    secondary = '#ff9100'; // Naranja claro para forms y fondos
    body.classList.remove('has-custom-branding');
  }

  // Aplicar color primario
  root.style.setProperty('--tenant-primary-color', primary);
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--bs-primary', primary);
  root.style.setProperty('--bs-primary-rgb', hexToRgb(primary));

  // Aplicar color secundario
  root.style.setProperty('--tenant-secondary-color', secondary);
  root.style.setProperty('--bs-secondary', secondary);
  root.style.setProperty('--bs-secondary-rgb', hexToRgb(secondary));

  // Aplicar imagen de fondo para las vistas si existe
  const backgroundImageUrl = resolveImageUrl(tenant.backgroundImageUrl);

  // Aplicar fondo según el tipo (imagen o color sólido)
  if (tenant.backgroundType === 'solid' && tenant.backgroundColor) {
    // Color sólido
    body.style.backgroundImage = 'none';
    body.style.backgroundColor = tenant.backgroundColor;
    body.classList.add('has-tenant-background');
    root.style.setProperty('--tenant-background-image', 'none');
  } else if (backgroundImageUrl) {
    // Imagen de fondo
    body.style.backgroundImage = `url(${backgroundImageUrl})`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundRepeat = 'no-repeat';
    body.classList.add('has-tenant-background');

    // También establecer la variable CSS por si se necesita en otros lugares
    root.style.setProperty('--tenant-background-image', `url(${backgroundImageUrl})`);
  } else {
    // Limpiar estilos de background
    body.style.backgroundImage = '';
    body.style.backgroundColor = '#f8f9fa'; // Color por defecto
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.backgroundAttachment = '';
    body.style.backgroundRepeat = '';
    root.style.removeProperty('--tenant-background-image');
    body.classList.remove('has-tenant-background');
  }

  // Aplicar configuración de fondo para login
  if (tenant.loginBackgroundType) {
    root.style.setProperty('--tenant-login-bg-type', tenant.loginBackgroundType);
  }

  if (tenant.loginBackgroundColor && tenant.loginBackgroundType === 'solid') {
    root.style.setProperty('--tenant-login-bg-color', tenant.loginBackgroundColor);
  }

  // Actualizar título de la pestaña del navegador
  // Solo para Premium y Enterprise: mostrar el nombre del gimnasio
  // Para planes básicos: mostrar "GymSaaS" o formato genérico
  if (hasCustomBranding && tenant.nombre) {
    document.title = tenant.nombre;
  } else if (tenant.nombre) {
    document.title = `GymSaaS - ${tenant.nombre}`;
  } else {
    document.title = 'GymSaaS';
  }

  // Aplicar logo a favicon solo para Premium y Enterprise
  if (hasCustomBranding) {
    const logoUrl = resolveImageUrl(tenant.logoUrl || tenant.logo);
    if (logoUrl) {
      updateFavicon(logoUrl, tenant.nombre);
    } else {
      // Restaurar favicon por defecto
      restoreDefaultFavicon();
    }
  } else {
    // Asegurarse de usar el favicon por defecto en planes sin personalización
    restoreDefaultFavicon();
  }
};

/**
 * Convierte un color HEX a formato RGB para Bootstrap
 */
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '13, 110, 253'; // Bootstrap primary default (blue)
};

/**
 * Actualiza el favicon de la página con el logo del tenant
 */
const updateFavicon = (logoUrl: string, tenantName?: string) => {
  try {
    // Eliminar favicons existentes
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach(link => link.remove());

    // Crear nuevo favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/x-icon";
    link.href = logoUrl;

    // Agregar título personalizado al favicon
    link.title = tenantName || "GymSaaS";

    document.head.appendChild(link);
  } catch (error) {
    console.error("Error al actualizar favicon:", error);
  }
};

/**
 * Restaura el favicon por defecto de GymSaaS
 */
const restoreDefaultFavicon = () => {
  try {
    // Eliminar favicons existentes
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach(link => link.remove());

    // Crear favicon por defecto
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/x-icon";
    link.href = "/zinnia.png";

    document.head.appendChild(link);
  } catch (error) {
    console.error("Error al restaurar favicon por defecto:", error);
  }
};

export default useTenant;
