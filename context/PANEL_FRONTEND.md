# GymSaaS Frontend - Documentación Completa del Panel React

> **Ubicación**: `~/projects/GymSaaS/frontend`
> **Fecha Documentación**: Enero 2025

---

## ÍNDICE

1. [Información del Proyecto](#1-información-del-proyecto)
2. [Autenticación Actual](#2-autenticación-actual)
3. [Integración con la API](#3-integración-con-la-api)
4. [Páginas y Rutas](#4-páginas-y-rutas)
5. [Gestión de Suscripción SaaS](#5-gestión-de-suscripción-saas)
6. [Configuración de Ejecución](#6-configuración-de-ejecución)
7. [Integración Necesaria con Next.js](#7-integración-necesaria-con-nextjs)
8. [Dependencias](#8-dependencias)

---

## 1. INFORMACIÓN DEL PROYECTO

### 1.1 Stack Técnico

#### Framework y Build Tool
- **Framework**: **Vite** 5.4.8
- **React**: 18.3.1
- **TypeScript**: 5.6.2
- **Node.js**: Requiere Node.js 18+

#### Router y State Management
- **Router**: React Router DOM 7.9.4
- **State**: React Hooks (`useState`, `useEffect`)
- ❌ No usa Redux/Zustand/Context API global

#### UI y Estilos
- **UI Framework**: Bootstrap 5.3.8 + React Bootstrap 2.10.10
- **CSS Framework**: Tailwind CSS 3.4.13
- **Iconos**:
  - FontAwesome 7.1.0
  - Lucide React 0.463.0
- **Notificaciones**: SweetAlert2 11.26.3
- **Calendario**: FullCalendar 6.1.19
- **Tablas**: DataTables.net 2.3.4
- **Gráficos**: Chart.js 4.5.1 + React Chart.js 2 5.3.1 + Recharts 3.3.0

#### Cliente HTTP
- **Axios**: 1.12.2
- **Interceptors**: Request (token), Response (unwrap 401)

#### Formularios y Validación
- **jQuery**: 3.7.1 (para Select2)
- **Select2**: 4.1.0-rc.0 (dropdowns mejorados)

### 1.2 Estructura del Proyecto

```
GymSaaS/frontend/
├── public/                      # Archivos estáticos
│   ├── pesas.jpg                # Imagen de fondo del layout
│   └── ...
├── src/
│   ├── api/                      # Cliente API
│   │   ├── gymApi.ts             # Cliente Axios con interceptors
│   │   └── getSocioActual.ts     # Servicio socio actual
│   ├── components/               # Componentes reutilizables
│   │   ├── Layout.tsx             # Layout administrativo
│   │   ├── LayoutSocio.tsx        # Layout de miembros
│   │   ├── Navbar.tsx             # Barra de navegación
│   │   ├── Sidebar.tsx            # Sidebar menú
│   │   ├── ProtectedRoute.tsx     # Rutas protegidas
│   │   ├── FileUpload.tsx         # Subida de archivos
│   │   └── Pagination.tsx        # Paginación
│   ├── hooks/                    # Custom hooks
│   │   └── useFetch.ts            # Hook para fetch
│   ├── styles/                   # Estilos globales
│   │   ├── Layout.css
│   │   └── main.css
│   ├── types/                    # Tipos TypeScript
│   │   └── select2.d.ts
│   └── views/                    # Páginas/componentes
│       ├── Dashboard.tsx          # Dashboard admin
│       ├── DashboardSocio.tsx     # Dashboard socio
│       ├── usuarios/              # Gestión de usuarios
│       │   ├── Login.tsx          # Página de login
│       │   ├── perfil/            # Perfil de usuario
│       │   └── rol/               # Gestión de roles
│       ├── socios/                 # Gestión de miembros
│       │   ├── List.tsx           # Listado de socios
│       │   ├──_planes/            # Planes del socio
│       │   ├── suscripciones/     # Suscripciones del socio
│       │   ├── turnos/            # Turnos del socio
│       │   └── ...
│       ├── personal/               # Gestión de personal
│       ├── suscripciones/          # Gestión de suscripciones
│       │   ├── List.tsx           # Listado de suscripciones
│       │   └── planes/            # Planes SaaS
│       ├── agenda/                 # Gestión de agenda
│       ├── rutinas/                # Rutinas de entrenamiento
│       ├── gestionPagos/           # Gestión de pagos
│       ├── salas/                  # Gestión de salas
│       ├── finanzas/               # Dashboard financiero
│       └── ...
├── .env.example                   # Plantilla de variables de entorno
├── index.html                     # HTML entry point
├── package.json                   # Dependencias y scripts
├── tsconfig.json                  # Configuración TypeScript
├── vite.config.ts                # Configuración Vite
└── tailwind.config.ts             # Configuración Tailwind
```

---

## 2. AUTENTICACIÓN ACTUAL

### 2.1 Manejo del Login

**Archivo**: `src/views/usuarios/Login.tsx`

El panel React **NO tiene una API de autenticación propia**. El login se hace directamente contra la API .NET:

```typescript
// Al hacer login, guarda en localStorage:
localStorage.setItem("token", response.data.token);
localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
localStorage.setItem("socioId", response.data.usuario.socioId || "");
localStorage.setItem("personalId", response.data.usuario.personalId || "");
```

**Redirección por rol**:
- `Socio` → `/socio/dashboardSocio`
- `Administrador` → `/dashboard`
- `Recepción` → `/panel-recepcion`
- `Profesor` → `/panel-profesor`

### 2.2 Verificación de Autenticación

**Archivo**: `src/components/Layout.tsx`

```typescript
const [isLoggedIn, setIsLoggedIn] = useState(
  !!localStorage.getItem("token")
);

useEffect(() => {
  const checkAuth = () => {
    const newToken = localStorage.getItem("token");
    setIsLoggedIn(!!newToken);
  };

  checkAuth();
  window.addEventListener("storage", checkAuth);
  window.addEventListener("authChange", checkAuth);

  return () => {
    window.removeEventListener("storage", checkAuth);
    window.removeEventListener("authChange", checkAuth);
  };
}, []);
```

**Si no hay token**: El layout muestra una pantalla de login o redirige a `/login`.

### 2.3 Token en Requests

**Archivo**: `src/api/gymApi.ts`

**Interceptor de Request**:
```typescript
gymApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Interceptor de Response** (manejo de 401):
```typescript
gymApi.interceptors.response.use(
  (response) => {
    // Desenvuelve ApiResponse automáticamente
    const data = response.data;
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      response.data = data.data;
    }
    return response;
  },
  (error) => {
    const rutasPublicas = [
      "/auth/login",
      "/auth/register",
      "/socios/registro-publico",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    const esPublica = rutasPublicas.some((r) => url.includes(r));

    if (!esPublica && error.response?.status === 401) {
      console.warn("[GymAPI] ⚠️ Token expirado. Redirigiendo al login...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
```

### 2.4 Cierre de Sesión

```typescript
// Logout en el panel React
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("socioId");
  localStorage.removeItem("personalId");
  window.location.href = "/login";
};
```

---

## 3. INTEGRACIÓN CON LA API

### 3.1 Cliente API Configurado

**Archivo**: `src/api/gymApi.ts`

```typescript
import axios from "axios";

// Configura la URL base (de .env o localhost)
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5144";

const gymApi = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  //  IMPORTANTE: el backend no usa cookies, por eso se deja en false
  withCredentials: false,
});

// Interceptor de request: agrega el token JWT automáticamente
gymApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: desenvuelve ApiResponse y captura 401
gymApi.interceptors.response.use(
  (response) => {
    // Desenvolver ApiResponse automáticamente
    const data = response.data;
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      response.data = data.data;
    }
    return response;
  },
  (error) => {
    // Auto-logout en 401 (excepto rutas públicas)
    const rutasPublicas = [
      "/auth/login", "/auth/register", "/socios/registro-publico",
      "/auth/forgot-password", "/auth/reset-password"
    ];

    const url = error.config?.url || "";
    const esPublica = rutasPublicas.some((r) => url.includes(r));

    if (!esPublica && error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default gymApi;
```

### 3.2 Variables de Entorno

**Archivo**: `.env.example` (si existe)

```bash
# API Backend URL
VITE_API_BASE_URL=http://localhost:5144
```

**URL actual de desarrollo**: `http://localhost:5144`

### 3.3 Ejemplo de Uso

```typescript
import gymApi from "@/api/gymApi";

// GET request (auto-unwrap ApiResponse)
const socios = await gymApi.get("/socios");
// socios = [{ id: 1, nombre: "Juan", ... }]

// POST request
const nuevoSocio = await gymApi.post("/socios", {
  nombre: "María García",
  email: "maria@test.com",
  fecha_nacimiento: "1990-01-01",
  ...
});

// PUT request
await gymApi.put(`/socios/${id}`, {
  nombre: "María García Actualizado",
  ...
});

// DELETE request
await gymApi.delete(`/socios/${id}`);
```

---

## 4. PÁGINAS Y RUTAS

### 4.1 Sistema de Rutas Principal

**Archivo**: `src/App.tsx`

```typescript
// Rutas del panel ADMINISTRATIVO
<Routes path="/dashboard" element={<Layout />}>
  <Route index element={<Dashboard />} />
  <Route path="socios" element={<SociosList />} />
  <Route path="personal" element={<PersonalList />} />
  <Route path="suscripciones" element={<SuscripcionesList />} />
  <Route path="suscripciones/planes" element={<PlanesList />} />
  <Route path="salas" element={<SalasList />} />
  <Route path="agenda/*" element={<AgendaCalendar />} />
  <Route path="turnos" element={<TurnosPlantillaList />} />
  <Route path="ordenes" element={<OrdenesList />} />
  <Route path="comprobantes" element={<ComprobantesList />} />
  <Route path="estados" element={<EstadosList />} />
  <Route path="roles" element={<RolesList />} />
  <Route path="usuarios" element={<UsuariosList />} />
  <Route path="finanzas" element={<DashboardFinanciero />} />
  <Route path="rutinas/*" element={/* rutas de rutinas */} />
</Routes>

// Rutas del panel SOCIO
<Routes path="/socio" element={<LayoutSocio />}>
  <Route path="dashboardSocio" element={<DashboardSocio />} />
  <Route path="planesSocio" element={<PlanesSocio />} />
  <Route path="suscripcionesSocio" element={<SuscripcionesSocio />} />
  <Route path="turnosSocio" element={<TurnosSocio />} />
  <Route path="rutinasSocio" element={<RutinasSocio />} />
  <Route path="renovaciones/historial" element={<RenovacionesHistorial />} />
</Routes>

// Rutas PÚBLICAS
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/reset-password" element={<ResetPassword />} />
</Routes>
```

### 4.2 Protección de Rutas

**Componente**: `RedirectByRole` en `App.tsx`

```typescript
function RedirectByRole() {
  const storedUser = localStorage.getItem("usuario");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const rol = user?.rol;

  // Si no hay usuario logueado, mandarlo al login
  if (!rol) return <Navigate to="/login" replace />;

  // Redirigir según el rol base
  if (rol === "Socio") return <Navigate to="/socio/dashboardSocio" replace />;
  else return <Navigate to="/dashboard" replace />;
}
```

**Layout Componente** (`Layout.tsx`):

```typescript
const [isLoggedIn, setIsLoggedIn] = useState(
  !!localStorage.getItem("token")
);

// Si no está logueado, muestra el formulario de login
// Si está logueado, muestra el panel completo
```

---

## 5. GESTIÓN DE SUSCRIPCIÓN SAAS

### 5.1 Módulos de Suscripción Existentes

#### Para ADMINISTRADOR

**1. Gestión de Planes** (`/suscripciones/planes/List.tsx`)
- ✅ Listar todos los planes disponibles
- ✅ Crear nuevos planes (Básico, Estándar, Premium)
- ✅ Editar planes existentes
- ✅ Eliminar planes
- ✅ Configurar: días por semana, precio, estado

**Endpoint API**: `/api/saas/planes`, `/api/planes`

**2. Gestión de Suscripciones** (`/suscripciones/List.tsx`)
- ✅ Ver todas las suscripciones activas
- ✅ Crear nueva suscripción
- ✅ Editar suscripción (plan, fechas)
- ✅ Ver historial de pagos
- ✅ Activar/Desactivar suscripciones

**Endpoint API**: `/api/suscripciones`

**3. Gestión de Pagos** (`/gestionPagos/`)
- ✅ Ver órdenes de pago pendientes
- ✅ Aprobar/rechazar pagos
- ✅ Ver comprobantes subidos
- ✅ Ver estadísticas financieras

**Endpoints API**:
- `/api/ordenes-pago`
- `/api/comprobantes`

#### PARA SOCIOS (Miembros)

**1. Ver Planes** (`/socio/planesSocio.tsx`)
- ✅ Ver planes activos disponibles
- ✅ Ver precios y características
- ⚠️ REQUIERE VERIFICACIÓN: ¿Permite seleccionar plan para suscribirse?

**Endpoints API**: `/api/saas/plan-actual`, `/api/planes`

**2. Mis Suscripciones** (`/socio/suscripcionesSocio.tsx`)
- ✅ Ver suscripciones activas
- ✅ Ver estado de suscripción
- ✅ Ver fechas de vencimiento
- ✅ Ver renovaciones pendientes

**Endpoint API**: `/api/socios/{id}/suscripciones`

**3. Historial de Renovaciones** (`/socio/renovaciones/historial`)
- ✅ Ver historial completo de pagos
- ✅ Ver facturas pasadas
- ✅ Descargar comprobantes

**Endpoint API**: `/api/suscripciones/renovaciones`

### 5.2 Endpoints SaaS Utilizados

| Endpoint | Uso en Panel |
|----------|--------------|
| `GET /api/saas/planes` | Listar planes disponibles (socio) |
| `GET /api/saas/plan-actual` | Ver plan actual del tenant |
| `GET /api/saas/usage` | Ver estadísticas de uso (admin) |
| `POST /api/saas/cambiar-plan` | Cambiar plan SaaS |
| `GET /api/saas/tiene-caracteristica/{caracteristica}` | Verificar feature access |

---

## 6. CONFIGURACIÓN DE EJECUCIÓN

### 6.1 Scripts de package.json

```json
{
  "scripts": {
    "dev": "vite",                    // Servidor de desarrollo
    "build": "tsc -b && vite build",  // Compilar para producción
    "preview": "vite preview"          # Previsualizar build de producción
  }
}
```

### 6.2 Puerto de Desarrollo

**DEV SERVER**: `localhost:5173` (por defecto de Vite)

### 6.3 Cómo Levantar el Proyecto

```bash
# 1. Instalar dependencias (primera vez)
cd ~/projects/GymSaaS/frontend
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# Abrir: http://localhost:5173
```

### 6.4 Build para Producción

```bash
# Compilar para producción
npm run build

# Previsualizar build produccion
npm run preview
```

**Output**: `dist/` (archivos estáticos para deploy)

---

## 7. INTEGRACIÓN NECESARIA CON NEXT.JS

### 7.1 Flujo de Login Completo

**Paso 1**: Usuario se registra en SpazioMg (Next.js)
```
POST /api/saas/registro
→ Respuesta: { token, usuario: { id, email, tenantId, rol } }
```

**Paso 2**: Necesitamos pasar estos datos al panel React

**Opción RECOMENDADA**: **localStorage compartido (mismo dominio)**

### 7.2 Método de Integración: localStorage Compartido

#### Por qué es la mejor opción:
- ✅ **Mismo origen**: Ambos en `localhost` (Next.js en 3000, React en 5173)
- ✅ **Simple**: Solo copiar token a localStorage del panel
- ✅ **Seguro**: Token solo se comparte si es el mismo tenant
- ✅ **Sin complicaciones**: No hay que pasarlo por URL (query params)

#### Implementación:

**En Next.js (after login)**:
```typescript
// 1. Guardar token en localStorage
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.usuario));
localStorage.setItem('tenantId', response.data.usuario.tenantId.toString());

// 2. Redirigir al panel React
window.location.href = 'http://localhost:5173';
```

**En Panel React** (en `Layout.tsx` o al inicio):
```typescript
// 3. Al cargar el panel, verificar si ya está autenticado
useEffect(() => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    // ✅ Ya está logueado, continuar al dashboard
    // No hacer nada, el layout ya maneja esto
  } else {
    // ❌ No hay token, redirigir a Next.js para login
    window.location.href = 'http://localhost:3000/login';
  }
}, []);
```

**Validación de Tenant (opcional pero RECOMENDADO)**:

```typescript
// Verificar que el token es válido para este tenant
useEffect(() => {
  const validarTenant = async () => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');

    if (!token) {
      window.location.href = 'http://localhost:3000/login';
      return;
    }

    try {
      // Verificar token con la API
      const response = await fetch('http://localhost:5144/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Token inválido, redirigir a login
        localStorage.clear();
        window.location.href = 'http://localhost:3000/login';
      }
    } catch (error) {
      console.error('Error validando token:', error);
    }
  };

  validarTenant();
}, []);
```

### 7.3 Método Alternativo: Query Params (NO RECOMENDADO)

**En Next.js**:
```typescript
const loginUrl = `http://localhost:5173?token=${encodeURIComponent(response.data.token)}&user=${encodeURIComponent(JSON.stringify(response.data.usuario))}`;
window.location.href = loginUrl;
```

**En Panel React**:
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const userStr = params.get('user');

  if (token && userStr) {
    // Guardar en localStorage y limpiar URL
    localStorage.setItem('token', token);
    const user = JSON.parse(userStr);
    localStorage.setItem('usuario', JSON.stringify(user));

    // Limpiar URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}, []);
```

**Problemas**:
- ❌ Token visible en la barra de direcciones
- ❌ Token queda en historial del navegador
- ❌ Más complejo de implementar

### 7.4 Método Alternativa: Backend Bridge (RECOMENDADO para producción)

**Idea**: Crear un endpoint puente en la API que valide el token de Next.js y genere un token temporal para el panel.

**Endpoint sugerido**: `POST /api/auth/sso-panel`

```csharp
[HttpPost("sso-panel")]
public async Task<IActionResult> SSO_PANEL([FromBody] SsoPanelRequest request)
{
    // 1. Validar token JWT de Next.js
    var tokenHandler = new JwtTokenHandler(_config);
    var claims = tokenHandler.ValidateJwtToken(request.NextJsToken);

    // 2. Verificar tenant
    var tenantId = claims.FindFirst("tenant_id")?.Value;

    // 3. Generar token temporal específico para el panel
    var panelToken = _jwtService.GeneratePanelToken(tenantId, claims);

    return Ok(new { token = panelToken });
}
```

---

## 8. DEPENDENCIAS

### 8.1 Dependencias Core

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.9.4",
  "typescript": "^5.6.2",
  "vite": "^5.4.8"
}
```

### 8.2 Cliente HTTP y APIs

```json
{
  "axios": "^1.12.2"
}
```

### 8.3 UI Frameworks

```json
{
  "bootstrap": "^5.3.8",
  "react-bootstrap": "^2.10.10"
}
```

### 8.4 Estilos

```json
{
  "tailwindcss": "^3.4.13"
}
```

### 8.5 Iconos

```json
{
  "@fortawesome/react-fontawesome": "^3.1.0",
  "@fortawesome/free-solid-svg-icons": "^7.1.0",
  "lucide-react": "^0.463.0"
}
```

### 8.6 Formularios y Validación

```json
{
  "jquery": "^3.7.1",
  "select2": "^4.1.0-rc.0"
}
```

### 8.7 Notificaciones

```json
{
  "sweetalert2": "^11.26.3",
  "sweetalert2-react-content": "^5.1.0"
}
```

### 8.8 Calendarios

```json
{
  "@fullcalendar/react": "^6.1.19",
  "@fullcalendar/daygrid": "^6.1.19",
  "@fullcalendar/timegrid": "^6.1.19"
}
```

### 8.9 Gráficos

```json
{
  "chart.js": "^4.5.1",
  "react-chartjs-2": "^5.3.1",
  "recharts": "^3.3.0"
}
```

### 8.10 Tablas de Datos

```json
{
  "datatables.net": "^2.3.4",
  "datatables.net-dt": "^2.3.4",
  "datatables.net-responsive": "^3.0.7",
  "datatables.net-responsive-dt": "^3.0.7"
}
```

---

## 9. DIFERENCIAS DE ARQUITECTURA

### 9.1 Next.js vs Panel React

| Aspecto | Next.js (SpazioMg) | Panel React (GymSaaS) |
|---------|------------------------|----------------------|
| **Framework** | Next.js 15 (SSR) | Vite + React SPA |
| **Router** | App Router | React Router v6 |
| **Auth** | AuthService + localStorage | localStorage directo |
| **API Base URL** | `http://localhost:5144` | `http://localhost:5144`` |
| **State** | React Hook Form + Zod | React Hooks |
| **UI** | Tailwind CSS + shadcn/ui | Bootstrap + Tailwind |
| **Development Port** | 3000 | 5173 |
| **Production** | `npm run build` | `npm run build` |

### 9.2 Compatibilidad

✅ **100% COMPATIBLE** con la API .NET:
- Ambos usan JWT Bearer tokens
- Ambos usan el mismo formato de respuesta `ApiResponse`
- Ambos manejan errores 401 de la misma forma
- Mismo formato de usuario (`{ id, email, tenantId, rol }`)

---

## 10. PLAN DE INTEGRACIÓN RECOMENDADO

### 10.1 Opción Simple: localStorage (Mismo Dominio)

**Escenario**: Next.js y React en el mismo dominio/subdominio

1. **Configurar dominios**:
   - Next.js: `spaciomg.com` (o `localhost:3000`)
   - React Panel: `app.spaciomg.com` (o `localhost:5173`)
   - O usar subdominios: `app.spaciomg.com` (Next.js) y `panel.spaciomg.com` (React)

2. **Habilitar CORS compartido**:

En `src/Gym.API/Program.cs`, agregar origen del panel:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontends", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",     // Next.js dev
                "http://localhost:5173",     // React dev
                "https://spaciomg.com", // Next.js prod
                "https://panel.spaciomg.com" // React prod
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
```

3. **Compartir localStorage**:

En Next.js después del login:
```typescript
// Guardar credenciales
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(usuario));
localStorage.setItem('tenantId', tenantId.toString());

// Redirigir al panel
window.location.href = 'http://localhost:5173';
```

En React Panel, en `Layout.tsx`:
```typescript
useEffect(() => {
  // Verificar si ya hay token (vino desde Next.js)
  const token = localStorage.getItem('token');

  if (!token) {
    // No hay token, redirigir a Next.js para login
    window.location.href = 'http://localhost:3000/login';
  }
}, []);
```

### 10.2 Opción Robusta: API Bridge

**Para producción**, usar un endpoint dedicado:

**En Next.js** (después de login):
```typescript
// Opción A: Query params (simple)
window.location.href = `http://localhost:5173/login?token=${token}&user=${encodeURIComponent(JSON.stringify(usuario))}`;

// Opción B: Endpoint puente (RECOMENDADO)
const response = await fetch('/api/auth/sso-panel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nextJsToken: token })
});
const { panelToken } = await response.json();
localStorage.setItem('token', panelToken);
window.location.href = 'http://localhost:5173';
```

**Crear endpoint en API .NET**:
```csharp
[HttpPost("sso-panel")]
[AllowAnonymous]
public async Task<IActionResult> SSO_Panel([FromBody] SsoPanelRequest request)
{
    var nextJsToken = request.NextJsToken;

    // Validar token de Next.js
    var user = _jwtService.ValidateToken(nextJsToken);

    // Generar token temporal para el panel (con tenantId correcto)
    var panelToken = _jwtService.GenerateToken(user);

    return Ok(new { token = panelToken });
}
```

---

## 11. CONSIDERACIONES DE SEGURIDAD

### 11.1 Validación de Tenant

⚠️ **IMPORTANTE**: Cuando compartas el token entre Next.js y React, debes validar que el `tenantId` del usuario coincida con el tenant al que intenta acceder.

**Ejemplo de validación** en React Panel:
```typescript
const validarTenant = async () => {
  const tenantId = localStorage.getItem('tenantId');
  const token = localStorage.getItem('token');

  // Verificar que el usuario tiene acceso a este tenant
  const response = await gymApi.get(`/tenants/${tenantId}/validar-acceso`);

  if (!response.data.tieneAcceso) {
    localStorage.clear();
    window.location.href = 'http://localhost:3000/login';
  }
};
```

### 11.2 Token Refresh

❌ **NO IMPLEMENTADO** actualmente en el panel React.

**Recomendación**: Implementar antes de producción:
- Token expiration: 24 horas
- Sin refresh token (actual)
- Usuario debe hacer login nuevamente si expira

---

## 12. CHECKLIST DE INTEGRACIÓN

Para integrar el panel React con Next.js:

- [ ] **Backend**: Configurar CORS para permitir `localhost:5173`
- [ ] **Frontend Next.js**: Redirigir a panel React después del login
- [ ] **Frontend React**: Agregar validación de token al cargar
- [ ] **Ambos**: Compartir `localStorage.setItem('token')` y `usuario`
- [ ] **Test**: Probar flujo completo: Registro → Login → Dashboard
- [ ] **Logout**: Implementar logout que limpie localStorage de ambos lados

---

## 13. EJEMPLO DE FLUJO COMPLETO

```typescript
// ===== EN NEXT.JS =====

// 1. Usuario hace registro en SpazioMg
const response = await authService.registerGym(formData);
// Respuesta: { token, usuario: { id, email, tenantId, rol }, ... }

// 2. Guardar en localStorage
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.usuario));
localStorage.setItem('tenantId', response.data.usuario.tenantId.toString());

// 3. Redirigir al panel React
window.location.href = 'http://localhost:5173';


// ===== EN PANEL REACT =====

// 4. Al cargar el panel, verificar autenticación
useEffect(() => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    // No autenticado, redirigir a Next.js
    window.location.href = 'http://localhost:3000/login';
    return;
  }

  // ✅ Autenticado, cargar datos del usuario
  const user = JSON.parse(userStr);
  setState({ usuario: user, isLoggedIn: true });
}, []);


// 5. En requests al API, el interceptor ya agrega el token
gymApi.get('/socios').then(data => {
  // data = [{ id, nombre, email, ... }] (auto-desenvuelto)
  setSocios(data);
});
```

---

## 14. PROBLEMAS CONOCIDOS Y SOLUCIONES

### 14.1 Token Expira Muy Rápido

**Problema**: El token JWT expira en 24 horas, el usuario debe loguearse constantemente.

**Solución**: Implementar refresh token o aumentar duración del token en la API:
```csharp
// En appsettings.json de la API
"Jwt": {
  "ExpirationInHours": 168  // 7 días en lugar de 24
}
```

### 14.2 Múltiples Pestañas Abiertas

**Problema**: Usuario tiene Next.js y React abiertos en pestañas separadas, el localStorage se comparte pero puede haber confusión.

**Solución**: Usar `BroadcastChannel` para sincronizar sesiones:
```typescript
// En Next.js
const channel = new BroadcastChannel('auth-sync');
channel.postMessage({ type: 'LOGIN', token, user });
channel.postMessage({ type: 'LOGOUT' });

// En React
channel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
    localStorage.clear();
    window.location.reload();
  }
};
```

### 14.3 Conflicto de Rutas

**Problema**: Next.js tiene `/dashboard` y React también tiene `/dashboard`.

**Solución**: Usar rutas diferentes:
- Next.js: `/spaciomg` (registro, login)
- React: `/dashboard` (panel principal)

---

## 15. RESUMEN EJECUTIVO

### Flujo Recomendado:

1. **Usuario se registra** en Next.js (`/register`)
2. **Next.js guarda** token/usuario/tenantId en localStorage
3. **Next.js redirige** a `http://localhost:5173` (panel React)
4. **Panel React verifica** token al cargar
5. **Panel React usa** el token en todas las requests (interceptor)
6. **Usuario usa** el panel con todas las funcionalidades

### Archivos Clave del Panel:

| Archivo | Propósito |
|---------|------------|
| `src/api/gymApi.ts` | Cliente API con interceptors |
| `src/components/Layout.tsx` | Layout admin con verificación de auth |
| `src/views/usuarios/Login.tsx` | Página de login |
| `src/App.tsx` | Definición de rutas y redirección por rol |

### Comandos Esenciales:

```bash
# Levantar panel React
cd ~/projects/GymSaaS/frontend
npm install
npm run dev

# Acceder al panel
# http://localhost:5173
```

---

**Documentación generada**: Enero 2025
**Versión del panel**: 0.0.0
**Estado**: ✅ Funcional (en producción)
