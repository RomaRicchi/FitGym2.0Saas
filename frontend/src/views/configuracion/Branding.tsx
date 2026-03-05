import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import gymApi from '../../api/gymApi';
import useTenant from '../../hooks/useTenant';

const Branding = () => {
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingLoginBg, setUploadingLoginBg] = useState(false);

  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:5144';

  const [formData, setFormData] = useState({
    nombre: '',
    logoUrl: '',
    primaryColor: '',
    secondaryColor: '',
    backgroundImageUrl: '',
    backgroundType: 'image' as 'image' | 'solid',
    backgroundColor: '',
    loginBackgroundImageUrl: '',
    loginBackgroundType: 'image' as 'image' | 'solid',
    loginBackgroundColor: '',
  });

  const [previewColors, setPreviewColors] = useState({
    primary: '',
    secondary: '',
    bg: '',
    loginBg: '',
  });

  // Detectar modo oscuro del sistema
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        nombre: tenant.nombre || '',
        logoUrl: tenant.logoUrl || '',
        primaryColor: tenant.primaryColor || '',
        secondaryColor: tenant.secondaryColor || '',
        backgroundImageUrl: tenant.backgroundImageUrl || '',
        backgroundType: tenant.backgroundType || 'image',
        backgroundColor: tenant.backgroundColor || '',
        loginBackgroundImageUrl: tenant.loginBackgroundImageUrl || '',
        loginBackgroundType: tenant.loginBackgroundType || 'image',
        loginBackgroundColor: tenant.loginBackgroundColor || '',
      });
      setPreviewColors({
        primary: tenant.primaryColor || '#ff6b00',
        secondary: tenant.secondaryColor || tenant.primaryColor || '#ff6b00',
        bg: tenant.backgroundColor || '#f8f9fa',
        loginBg: tenant.loginBackgroundColor || '#1a1a1a',
      });
    }

    // Detectar preferencia de modo oscuro
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(darkModeQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handleChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleChange);
    };
  }, [tenant]);

  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanBase = apiBase.replace(/\/api$/, '');
    return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant?.planSaas?.tieneAppPersonalizada) {
      Swal.fire({
        icon: 'error',
        title: 'Función no disponible',
        text: 'La personalización de branding solo está disponible en los planes Premium y Enterprise. Actualiza tu plan para acceder a esta función.',
        confirmButtonColor: previewColors.primary,
      });
      return;
    }

    setLoading(true);

    try {
      await gymApi.put('/tenants/branding', formData);

      await Swal.fire({
        icon: 'success',
        title: '¡Branding actualizado!',
        text: 'Los cambios se aplicarán correctamente.',
        confirmButtonColor: previewColors.primary,
      });

      // Recargar tenant y refrescar página
      window.location.reload();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar el branding';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: previewColors.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, target: 'logo' | 'background' | 'login-background') => {
    // Verificar si el tenant tiene permiso para personalizar
    if (!tenant?.planSaas?.tieneAppPersonalizada) {
      Swal.fire({
        icon: 'error',
        title: 'Función no disponible',
        text: 'La personalización de branding solo está disponible en los planes Premium y Enterprise. Actualiza tu plan para acceder a esta función.',
        confirmButtonColor: previewColors.primary,
      });
      return;
    }

    const endpoint =
      target === 'logo' ? '/tenants/branding/logo' :
      target === 'background' ? '/tenants/branding/background' :
      '/tenants/branding/login-background';
    const setUploading =
      target === 'logo' ? setUploadingLogo :
      target === 'background' ? setUploadingBg :
      setUploadingLoginBg;

    const form = new FormData();
    form.append('archivo', file);

    setUploading(true);
    try {
      const { data } = await gymApi.post<any>(endpoint, form);
      const relativeUrl = data?.url || '';
      const absoluteUrl = resolveImageUrl(relativeUrl);

      if (target === 'logo') {
        setFormData(prev => ({ ...prev, logoUrl: absoluteUrl }));
      } else if (target === 'background') {
        setFormData(prev => ({ ...prev, backgroundImageUrl: absoluteUrl }));
      } else {
        setFormData(prev => ({ ...prev, loginBackgroundImageUrl: absoluteUrl }));
      }

      Swal.fire({
        icon: 'success',
        title: 'Imagen subida',
        text: 'Se guardó correctamente en el servidor.',
        confirmButtonColor: previewColors.primary,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'No se pudo subir la imagen';
      Swal.fire({
        icon: 'error',
        title: 'Error al subir',
        text: message,
        confirmButtonColor: previewColors.primary,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleColorChange = (color: string, type: 'primary' | 'secondary' | 'bg' | 'loginBg') => {
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setPreviewColors(prev => ({ ...prev, [type]: color }));
    }
  };

  const presetColors = [
    '#ff6b00', // Naranja (default)
    '#0d6efd', // Azul Bootstrap
    '#dc3545', // Rojo
    '#198754', // Verde
    '#6f42c1', // Púrpura
    '#d63384', // Rosa
    '#fd7e14', // Amarillo
    '#212529', // Negro
  ];

  const backgroundColors = [
    '#f8f9fa', // Gris claro (default)
    '#ffffff', // Blanco
    '#343a40', // Gris oscuro
    '#212529', // Negro
    '#ffebee', // Rojo claro
    '#e8f5e9', // Verde claro
    '#e3f2fd', // Azul claro
    '#fff3e0', // Naranja claro
    '#f3e5f5', // Púrpura claro
  ];

  return (
    <div className="container-fluid p-4">
      {/* Título estilo socios */}
      <h1
        className="text-center fw-bold mb-5"
        style={{
          color: 'var(--tenant-primary-color)',
          fontSize: '2.5rem',
          letterSpacing: '2px'
        }}
      >
        PERSONALIZACIÓN DE MARCA
      </h1>

      {tenant?.planSaas && !tenant.planSaas.tieneAppPersonalizada && (
        <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
          <i className="fa fa-exclamation-triangle me-2 fs-4"></i>
          <div style={{ color: '#856404' }}>
            <strong>¡Actualiza tu plan!</strong>
            <p className="mb-0 small">
              La personalización de branding está disponible en los planes <strong>Premium</strong> y <strong>Enterprise</strong>.
              Contacta al soporte para actualizar tu plan.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* CARD 0: Vista Previa en Vivo */}
        <div className="card shadow-sm mb-4" style={{
          backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff',
          borderLeft: `4px solid ${previewColors.primary}`,
        }}>
          <div className="card-header" style={{
            backgroundColor: previewColors.primary,
            borderColor: previewColors.primary
          }}>
            <h5 className="mb-0 text-white">
              <i className="fa fa-eye me-2"></i>
              Vista Previa de Branding
            </h5>
          </div>
          <div className="card-body" style={{
            backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff',
            backgroundImage: formData.backgroundType === 'solid' && formData.backgroundColor
              ? formData.backgroundColor
              : formData.backgroundImageUrl
                ? `url(${resolveImageUrl(formData.backgroundImageUrl)})`
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            <div
              className="p-4 rounded text-white text-center d-flex align-items-center justify-content-center"
              style={{ backgroundColor: previewColors.primary, minHeight: '100px' }}
            >
              {formData.logoUrl && (
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  style={{ width: 60, height: 60, objectFit: 'contain', marginRight: '15px' }}
                />
              )}
              <div>
                <h3 className="m-0">{formData.nombre || 'Nombre del Gimnasio'}</h3>
                <p className="mb-0 small no-titulo-modulo">Así se verá tu sistema</p>
              </div>
            </div>
          </div>
        </div>

        {/* ROW para CARD 1 y CARD 2 en paralelo */}
        <div className="row">
          {/* CARD 1: Nombre y Logo del Gimnasio */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm h-100" style={{
          backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff',
          borderLeft: `4px solid ${previewColors.primary}`,
        }}>
          <div className="card-header" style={{
            backgroundColor: previewColors.primary,
            borderColor: previewColors.primary
          }}>
            <h5 className="mb-0 text-white">
              <i className="fa fa-building me-2"></i>
              Identidad del Gimnasio
            </h5>
          </div>
          <div className="card-body" style={{ backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff' }}>
            {/* Nombre del Gimnasio */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-white">
                <i className="fa fa-tag me-2"></i>
                Nombre del Gimnasio
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: SpazioMg Centro"
                required
              />
              <div className="form-text text-white">
                Este nombre se mostrará en la parte superior de la aplicación y en la pestaña del navegador.
              </div>
            </div>

            {/* Subir Logo */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-white">
                Subir Logo del Gimnasio
              </label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, 'logo');
                }}
                disabled={uploadingLogo || loading || !tenant?.planSaas?.tieneAppPersonalizada}
              />
              {uploadingLogo && (
                <small className="text-white d-block mt-1">Subiendo logo...</small>
              )}
              <div className="form-text text-white">
                Se recomienda tamaño 200x60px con fondo transparente (PNG, JPG).
              </div>
            </div>

            {/* Vista previa del Logo */}
            {formData.logoUrl && (
              <div className="mt-3 p-3 rounded text-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <img
                  src={resolveImageUrl(formData.logoUrl)}
                  alt="Vista previa del logo"
                  style={{ maxHeight: '60px', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <p className="small text-white mb-0 mt-2">Logo actual</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: Colores (Primario y Secundario) */}
      <div className="col-lg-6 mb-4">
        <div className="card shadow-sm h-100" style={{
          backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff',
          borderLeft: `4px solid ${previewColors.primary}`,
        }}>
          <div className="card-header" style={{
            backgroundColor: previewColors.primary,
            borderColor: previewColors.primary
          }}>
            <h5 className="mb-0 text-white">
              <i className="fa fa-palette me-2"></i>
              Colores del Sistema
            </h5>
          </div>
          <div className="card-body" style={{ backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff' }}>
            <div className="row">
              {/* Columna izquierda: Color Primario */}
              <div className="col-md-6 mb-3 mb-md-0">
                <h6 className="fw-bold mb-3 text-white">
                  <i className="fa fa-star me-2"></i>Color Primario
                </h6>
                <div className="form-text mb-3 text-white">
                  Color principal para botones, enlaces y elementos destacados.
                </div>
                <div className="input-group shadow-sm mb-3">
                  <span className="input-group-text" style={{
                    backgroundColor: previewColors.primary,
                    color: 'white',
                    fontWeight: 'bold',
                    border: `1px solid ${previewColors.primary}`
                  }}>#</span>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.primaryColor.replace('#', '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9A-Fa-f]{0,6}$/.test(value)) {
                        const fullColor = value.length === 6 ? `#${value}` : '';
                        setFormData({ ...formData, primaryColor: fullColor });
                        handleColorChange(fullColor, 'primary');
                      }
                    }}
                    placeholder="FF6B00"
                    maxLength={6}
                    style={{ borderRight: `3px solid ${previewColors.primary}` }}
                  />
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={previewColors.primary}
                    onChange={(e) => {
                      setFormData({ ...formData, primaryColor: e.target.value });
                      setPreviewColors({ ...previewColors, primary: e.target.value });
                    }}
                    style={{ width: '60px', cursor: 'pointer' }}
                  />
                </div>

                {/* Colores preestablecidos */}
                <label className="form-label fw-semibold small mb-2 text-white">
                  Colores Preestablecidos:
                </label>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {presetColors.map(color => (
                    <button
                      key={`primary-${color}`}
                      type="button"
                      className="btn btn-sm border rounded-circle shadow-sm"
                      style={{
                        backgroundColor: color,
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        border: '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                        e.currentTarget.style.borderColor = previewColors.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                      onClick={() => {
                        setFormData({ ...formData, primaryColor: color });
                        setPreviewColors({ ...previewColors, primary: color });
                      }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Vista previa del color primario */}
                <div className="p-2 rounded text-white text-center" style={{
                  backgroundColor: previewColors.primary,
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Ejemplo: Botones y enlaces
                </div>
              </div>

              {/* Columna derecha: Color Secundario */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3 text-white">
                  <i className="fa fa-paint-brush me-2"></i>Color Secundario
                </h6>
                <div className="form-text mb-3 text-white">
                  Color para formularios, modales y elementos interactivos.
                </div>
                <div className="input-group shadow-sm mb-3">
                  <span className="input-group-text" style={{
                    backgroundColor: previewColors.secondary,
                    color: 'white',
                    fontWeight: 'bold',
                    border: `1px solid ${previewColors.secondary}`
                  }}>#</span>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.secondaryColor.replace('#', '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9A-Fa-f]{0,6}$/.test(value)) {
                        const fullColor = value.length === 6 ? `#${value}` : '';
                        setFormData({ ...formData, secondaryColor: fullColor });
                        handleColorChange(fullColor, 'secondary');
                      }
                    }}
                    placeholder="4CAF50"
                    maxLength={6}
                    style={{ borderRight: `3px solid ${previewColors.secondary}` }}
                  />
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={previewColors.secondary}
                    onChange={(e) => {
                      setFormData({ ...formData, secondaryColor: e.target.value });
                      setPreviewColors({ ...previewColors, secondary: e.target.value });
                    }}
                    style={{ width: '60px', cursor: 'pointer' }}
                  />
                </div>

                {/* Colores preestablecidos para secundario */}
                <label className="form-label fw-semibold small mb-2 text-white">
                  Colores Preestablecidos:
                </label>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {presetColors.map(color => (
                    <button
                      key={`secondary-${color}`}
                      type="button"
                      className="btn btn-sm border rounded-circle shadow-sm"
                      style={{
                        backgroundColor: color,
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        border: '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                        e.currentTarget.style.borderColor = previewColors.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                      onClick={() => {
                        setFormData({ ...formData, secondaryColor: color });
                        setPreviewColors({ ...previewColors, secondary: color });
                      }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Vista previa del color secundario */}
                <div className="p-2 rounded text-white text-center" style={{
                  backgroundColor: previewColors.secondary,
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Ejemplo: Forms y modales
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* CARD 3: Fondo de las Vistas */}
        <div className="card shadow-sm mb-4" style={{
          backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff',
          borderLeft: `4px solid ${previewColors.primary}`,
        }}>
          <div className="card-header" style={{
            backgroundColor: previewColors.primary,
            borderColor: previewColors.primary
          }}>
            <h5 className="mb-0 text-white">
              <i className="fa fa-desktop me-2"></i>
              Fondo de las Vistas
            </h5>
          </div>
          <div className="card-body" style={{ backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff' }}>
            <div className="mb-3">
              <div className="btn-group" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="bgType"
                  id="bgImage"
                  checked={formData.backgroundType === 'image'}
                  onChange={() => setFormData({ ...formData, backgroundType: 'image' })}
                />
                <label className="btn btn-outline-primary" htmlFor="bgImage">
                  <i className="fa fa-image me-2"></i>
                  Imagen
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="bgType"
                  id="bgSolid"
                  checked={formData.backgroundType === 'solid'}
                  onChange={() => setFormData({ ...formData, backgroundType: 'solid' })}
                />
                <label className="btn btn-outline-primary" htmlFor="bgSolid">
                  <i className="fa fa-palette me-2"></i>
                  Color Sólido
                </label>
              </div>
            </div>

            {formData.backgroundType === 'image' ? (
              <div>
                <label className="form-label fw-semibold text-white">
                  Subir imagen de fondo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, 'background');
                  }}
                  disabled={uploadingBg || loading || !tenant?.planSaas?.tieneAppPersonalizada}
                />
                {uploadingBg && (
                  <small className="text-white d-block mt-1">Subiendo fondo...</small>
                )}
                <div className="form-text text-white">
                  Se recomienda una imagen sutil y de alta resolución.
                </div>

                {formData.backgroundImageUrl && (
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <p className="small text-white mb-2">Imagen de fondo actual:</p>
                    <div
                      className="rounded border"
                      style={{
                        backgroundImage: `url(${resolveImageUrl(formData.backgroundImageUrl)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '100px',
                        width: '100%'
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="form-label fw-semibold text-white">
                  Color de Fondo:
                </label>
                <div className="input-group mb-3" style={{ maxWidth: '300px' }}>
                  <span className="input-group-text">#</span>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.backgroundColor.replace('#', '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9A-Fa-f]{0,6}$/.test(value)) {
                        const fullColor = value.length === 6 ? `#${value}` : '';
                        setFormData({ ...formData, backgroundColor: fullColor });
                        setPreviewColors({ ...previewColors, bg: fullColor || '#f8f9fa' });
                      }
                    }}
                    placeholder="F8F9FA"
                    maxLength={6}
                  />
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={previewColors.bg}
                    onChange={(e) => {
                      setFormData({ ...formData, backgroundColor: e.target.value });
                      setPreviewColors({ ...previewColors, bg: e.target.value });
                    }}
                    style={{ width: '50px' }}
                  />
                </div>

                {/* Colores preestablecidos de fondo */}
                <label className="form-label fw-semibold small text-white">
                  Colores Sugeridos:
                </label>
                <div className="d-flex gap-2 flex-wrap">
                  {backgroundColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className="btn btn-sm border rounded"
                      style={{
                        backgroundColor: color,
                        width: '40px',
                        height: '40px',
                        padding: 0,
                        border: '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.borderColor = previewColors.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                      onClick={() => {
                        setFormData({ ...formData, backgroundColor: color });
                        setPreviewColors({ ...previewColors, bg: color });
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: Fondo de Pantalla de Login */}
        <div className="card shadow-sm mb-4" style={{
          backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff',
          borderLeft: `4px solid ${previewColors.primary}`,
        }}>
          <div className="card-header" style={{
            backgroundColor: previewColors.primary,
            borderColor: previewColors.primary
          }}>
            <h5 className="mb-0 text-white">
              <i className="fa fa-lock me-2"></i>
              Fondo de Pantalla de Login
            </h5>
          </div>
          <div className="card-body" style={{ backgroundColor: prefersDarkMode ? '#2d2d2d' : '#ffffff' }}>
            <div className="mb-3">
              <div className="btn-group" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="loginBgType"
                  id="loginBgImage"
                  checked={formData.loginBackgroundType === 'image'}
                  onChange={() => setFormData({ ...formData, loginBackgroundType: 'image' })}
                />
                <label className="btn btn-outline-primary" htmlFor="loginBgImage">
                  <i className="fa fa-image me-2"></i>
                  Imagen
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="loginBgType"
                  id="loginBgSolid"
                  checked={formData.loginBackgroundType === 'solid'}
                  onChange={() => setFormData({ ...formData, loginBackgroundType: 'solid' })}
                />
                <label className="btn btn-outline-primary" htmlFor="loginBgSolid">
                  <i className="fa fa-palette me-2"></i>
                  Color Sólido
                </label>
              </div>
            </div>

            {formData.loginBackgroundType === 'image' ? (
              <div>
                <label className="form-label fw-semibold small text-white">
                  Subir imagen de login específica
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control mb-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, 'login-background');
                  }}
                  disabled={uploadingLoginBg || loading || !tenant?.planSaas?.tieneAppPersonalizada}
                />
                {uploadingLoginBg && (
                  <small className="text-white d-block mb-2">Subiendo imagen de login...</small>
                )}
                <div className="form-text text-white">
                  Si no se sube ninguna imagen, se usará la imagen de fondo general.
                </div>
                {formData.loginBackgroundImageUrl && (
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <p className="small text-white mb-2">Imagen de login actual:</p>
                    <div
                      className="rounded border"
                      style={{
                        backgroundImage: `url(${resolveImageUrl(formData.loginBackgroundImageUrl)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '120px',
                        width: '100%'
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => setFormData({ ...formData, loginBackgroundImageUrl: '' })}
                    >
                      <i className="fa fa-trash me-1"></i>
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="form-label fw-semibold text-white">Color de Fondo:</label>
                <div className="input-group" style={{ maxWidth: '300px' }}>
                  <span className="input-group-text">#</span>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.loginBackgroundColor.replace('#', '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9A-Fa-f]{0,6}$/.test(value)) {
                        const fullColor = value.length === 6 ? `#${value}` : '';
                        setFormData({ ...formData, loginBackgroundColor: fullColor });
                        setPreviewColors({ ...previewColors, loginBg: fullColor || '#1a1a1a' });
                      }
                    }}
                    placeholder="1A1A1A"
                    maxLength={6}
                  />
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={previewColors.loginBg}
                    onChange={(e) => {
                      setFormData({ ...formData, loginBackgroundColor: e.target.value });
                      setPreviewColors({ ...previewColors, loginBg: e.target.value });
                    }}
                    style={{ width: '50px' }}
                  />
                </div>
                <div className="form-text text-white">
                  Color sólido para el fondo de la página de login (formato HEX).
                </div>
              </div>
            )}

            {/* Vista previa del login */}
            {formData.loginBackgroundType === 'solid' && formData.loginBackgroundColor && (
              <div className="mt-3">
                <p className="small text-white mb-2">Vista previa:</p>
                <div
                  className="p-4 rounded text-white text-center"
                  style={{ backgroundColor: previewColors.loginBg }}
                >
                  <i className="fa fa-dumbbell fa-3x mb-3"></i>
                  <h4>Pantalla de Login</h4>
                  <p className="mb-0">Los campos de inicio de sesión aparecerán aquí</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="submit"
            className="btn shadow-sm"
            style={{
              backgroundColor: previewColors.primary,
              borderColor: previewColors.primary,
              color: 'white',
              fontWeight: 'bold',
              minWidth: '180px'
            }}
            disabled={loading || !tenant?.planSaas?.tieneAppPersonalizada}
            onMouseEnter={(e) => {
              if (!loading && tenant?.planSaas?.tieneAppPersonalizada) {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="fa fa-save me-2"></i>
                Guardar Cambios
              </>
            )}
          </button>

              <button
                type="button"
                className="btn btn-outline-secondary shadow-sm"
                style={{
                  borderColor: 'var(--tenant-secondary-color, #6c757d)',
                  color: 'var(--tenant-secondary-color, #6c757d)',
                  '--bs-btn-hover-bg': 'var(--tenant-secondary-color, #6c757d)',
                  '--bs-btn-hover-border-color': 'var(--tenant-secondary-color, #6c757d)',
                  '--bs-btn-hover-color': '#fff',
                } as React.CSSProperties}
                onClick={() => {
                  if (tenant) {
                    setFormData({
                      nombre: tenant.nombre || '',
                  logoUrl: tenant.logoUrl || '',
                  primaryColor: tenant.primaryColor || '',
                  secondaryColor: tenant.secondaryColor || '',
                  backgroundImageUrl: tenant.backgroundImageUrl || '',
                  backgroundType: tenant.backgroundType || 'image',
                  backgroundColor: tenant.backgroundColor || '',
                  loginBackgroundImageUrl: tenant.loginBackgroundImageUrl || '',
                  loginBackgroundType: tenant.loginBackgroundType || 'image',
                  loginBackgroundColor: tenant.loginBackgroundColor || '',
                });
                setPreviewColors({
                  primary: tenant.primaryColor || '#ff6b00',
                  secondary: tenant.secondaryColor || tenant.primaryColor || '#ff6b00',
                  bg: tenant.backgroundColor || '#f8f9fa',
                  loginBg: tenant.loginBackgroundColor || '#1a1a1a',
                });
              }
            }}
          >
            <i className="fa fa-undo me-2"></i>
            Restablecer
          </button>
        </div>
      </form>
    </div>
  );
};

export default Branding;

