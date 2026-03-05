# DOCUMENTACIÓN TÉCNICA - GymSaaS

Este archivo proporciona guía técnica para desarrolladores que trabajan en el código de GymSaaS. Para documentación de usuario final, ver [MANUAL_USUARIO.md](./MANUAL_USUARIO.md).

## Project Overview

GymSaaS is a gym management system for fixed-shift scheduling, built with ASP.NET Core 9.0 backend and React + Vite frontend. The system manages members, staff, plans, routines, payment receipts, and shifts with role-based authentication and multi-tenant architecture.

**Tech Stack:**
- Backend: .NET 9.0, C#, Entity Framework Core 9.0, PostgreSQL
- Frontend: React 18.3.1, TypeScript, Vite 5.4.8, Bootstrap 5.3.8, Tailwind CSS 3.4.13
- Authentication: JWT Bearer tokens with role-based access control

## Architecture

The project follows **Clean Architecture** with Domain-Driven Design (DDD) principles:

```
src/
├── Gym.Domain/          # Domain entities, base classes, interfaces
├── Gym.Application/     # DTOs, services, application interfaces
├── Gym.Infrastructure/  # EF Core DbContext, repositories, external services
└── Gym.API/            # Controllers, middleware, API configuration
frontend/               # React TypeScript frontend
```

### Layer Responsibilities

**Gym.Domain**: Pure domain layer containing entities (`Usuario`, `Socio`, `Plan`, `Suscripcion`, etc.) and base classes (`BaseEntity`, `TenantEntity`). No dependencies on other layers.

**Gym.Application**: Application services, DTOs, and service interfaces (`IEmailService`, `IJwtService`, `IPasswordHasher`, etc.)

**Gym.Infrastructure**: Implementation details including:
- `Persistence/GymDbContext.cs`: EF Core context with all DbSets
- `Repositories/`: Concrete repository implementations
- `Services/`: Email, JWT, password hashing, file storage
- `DependencyInjection.cs`: All DI registration (JWT, repositories, services)

**Gym.API**: Presentation layer with REST controllers, middleware pipeline, Swagger configuration

### Multi-Tenancy

The system is designed for multi-tenancy (multiple gyms):
- `TenantEntity` base class adds `TenantId` to entities
- `ITenantService` provides current tenant context
- `GymDbContext` applies global query filters for tenant isolation
- Automatic `TenantId` assignment in `SaveChanges()`

---

## White-Label Branding (SaaS)

**Important**: This system offers **responsive web customization**, NOT native mobile applications. The "app personalizada" feature refers to a branded responsive web experience that works seamlessly on mobile devices, not a standalone mobile app.

### What is White-Label in GymSaaS?

White-label branding allows Premium and Enterprise plan subscribers to customize the visual identity of their gym management system. Each tenant (gym) can personalize:

- **Logo**: Custom gym logo displayed throughout the interface
- **Nombre**: Gym name shown in headers, titles, and communications
- **Slug**: Subdomain for custom access (e.g., `mitopo.gymsaas.com`)
- **Colors**: Custom color scheme matching gym branding (future)

### Plan Availability

| Plan      | White-Label Branding |
|-----------|:---------------------:|
| Basic     | ❌ No                 |
| Standard  | ❌ No                 |
| Premium   | ✅ Yes                |
| Enterprise | ✅ Yes               |

### Technical Implementation

#### Tenant Entity

```csharp
public class Tenant : BaseEntity
{
    public string Nombre { get; set; }           // Gym name for branding
    public string? Slug { get; set; }            // Subdomain (e.g., "mitopo")
    public string? LogoUrl { get; set; }         // Custom logo URL
    public PlanSaaSEnum PlanSaas { get; set; }   // Determines feature access
}
```

#### Frontend Branding Display

**Current Implementation**:
- Sidebar and Navbar components can display tenant-specific logo
- Tenant name used in page titles and greetings
- JWT token includes `tenant_id` claim for context

**Example: Displaying Tenant Logo**
```tsx
// In Sidebar.tsx or Navbar.tsx
const { tenant } = useTenant(); // Custom hook to fetch tenant info

<div className="brand-header">
  {tenant?.logoUrl ? (
    <img src={tenant.logoUrl} alt={tenant.nombre} className="tenant-logo" />
  ) : (
    <span className="default-logo">{tenant?.nombre || 'GymSaaS'}</span>
  )}
</div>
```

**Example: Tenant-Specific Styling**
```tsx
// Apply custom colors based on tenant
const root = document.documentElement;
if (tenant.primaryColor) {
  root.style.setProperty('--primary-color', tenant.primaryColor);
}
```

### Responsive Web (Not Mobile App)

**Clarification**:
- ✅ The application is a **Progressive Web App (PWA)** with responsive design
- ✅ Works perfectly on mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Mobile-first design using Bootstrap 5.3.8 and Tailwind CSS
- ✅ Touch-optimized interface for check-ins, bookings, and dashboard
- ❌ NOT a native iOS/Android app (no App Store/Play Store distribution)

**Mobile Responsive Features**:
- QR scanner for check-ins (html5-qrcode library)
- Touch-friendly buttons and inputs
- Adaptive layouts (collapsible sidebar, mobile navigation)
- Optimized for 375px - 428px mobile screens
- Works offline with PWA caching (future enhancement)

### How Branding Appears to Users

**Premium Plan Example - "Topo Gym"**:
```
[Topo Gym Logo] ← Custom logo
Dashboard | Socios | Turnos
─────────────────────────────────
Welcome to Topo Gym
```

**Basic Plan Example - No Branding**:
```
[GymSaaS Logo] ← Default branding
Dashboard | Socios | Turnos
─────────────────────────────────
Welcome to GymSaaS
```

### API Endpoints for Branding

**GET /api/tenants/current**
Returns current tenant information including branding:
```json
{
  "id": 1,
  "nombre": "Topo Gym",
  "slug": "mitopo",
  "logoUrl": "https://cdn.gymsaas.com/tenants/1/logo.png",
  "primaryColor": "#FF5722",
  "planSaas": 3
}
```

**PUT /api/tenants/{id}/branding** (Admin only)
Update tenant branding:
```json
{
  "nombre": "Topo Gym",
  "logoUrl": "...",
  "primaryColor": "#FF5722"
}
```

### Feature Access Control

**Check if white-label is enabled**:
```csharp
// In IPlanSaaSService
public bool TieneCaracteristica(int tenantId, string caracteristica)
{
    var plan = ObtenerPlanActual(tenantId);
    return plan.Caracteristicas.Contains(caracteristica);
}

// Usage
if (_planSaaSService.TieneCaracteristica(tenantId, "app_personalizada"))
{
    // Show custom branding options
}
```

### Customization Options (Premium/Enterprise)

1. **Logo Upload**
   - Max size: 2MB
   - Formats: PNG, JPG, SVG
   - Recommended: 200x60px, transparent background

2. **Color Scheme** (Future)
   - Primary color
   - Secondary color
   - Accent color
   - CSS custom properties applied globally

3. **Custom Domain** (Enterprise only - Future)
   - CNAME configuration
   - SSL certificate provisioning
   - Example: `sistema.topogym.com.ar`

### Implementation Roadmap

**Phase 1 (Current)**:
- ✅ Tenant entity with logo/name fields
- ✅ JWT includes tenant context
- ✅ Basic responsive design

**Phase 2 (Next)**:
- ⏳ Branding upload endpoint
- ⏳ Tenant context hook in React
- ⏳ Dynamic logo/color rendering

**Phase 3 (Future)**:
- ⏳ Custom color scheme editor
- ⏳ Custom domain support (Enterprise)
- ⏳ PWA manifest generator per tenant

### Benefits for Tenants

**For Gym Owners**:
- Professional appearance with their own branding
- Increased member trust and recognition
- Seamless experience across devices
- No app installation required for members

**For Gym Members**:
- Familiar branding when accessing system
- Works on any device with a browser
- No app store download needed
- Always up-to-date (no app updates)

---

## Sistema SaaS Multi-Tenant

GymSaaS es un sistema **SaaS (Software as a Service)** multi-tenant que permite gestionar múltiples gimnasios (tenants) con planes de suscripción diferentes.

### Planes de Suscripción

El sistema ofrece **4 planes SaaS** con diferentes límites y características:

| Plan | Precio Mensual | Precio Anual | Max Socios | Max Personal | Max Salas | Turnos | Integraciones |
|------|---------------|--------------|-----------|-------------|-----------|--------|---------------|
| **Basic** | $14.995 | $149.950 | 50 | 5 | 2 | Ilimitado | ❌ |
| **Standard** | $29.990 | $299.900 | 200 | 15 | 5 | Ilimitado | ✅ |
| **Premium** | $79.990 | $799.900 | 500 | Ilimitado | Ilimitado | Ilimitado | ✅ |
| **Enterprise** | $199.990 | $1.999.900 | Ilimitado | Ilimitado | Ilimitado | Ilimitado | ✅ |

**Características por plan:**

| Característica | Basic | Standard | Premium | Enterprise |
|----------------|-------|----------|---------|------------|
| Rutinas | ✅ | ✅ | ✅ | ✅ |
| Check-in | ✅ | ✅ | ✅ | ✅ |
| Evolución Física | ❌ | ✅ | ✅ | ✅ |
| Reportes Avanzados | ❌ | ✅ | ✅ | ✅ |
| App Personalizada | ❌ | ❌ | ✅ | ✅ |
| Soporte Prioritario | ❌ | ❌ | ✅ | ✅ |
| API Acceso | ❌ | ❌ | ❌ | ✅ |
| Integraciones | ❌ | ✅ | ✅ | ✅ |

### Validación de Límites por Plan

El servicio `PlanSaaSService` valida automáticamente los límites del plan:

```csharp
public interface IPlanSaaSService
{
    Task<bool> PuedeCrearSocioAsync(int tenantId);
    Task<bool> PuedeCrearPersonalAsync(int tenantId);
    Task<bool> PuedeCrearSalaAsync(int tenantId);
    Task<PlanSaaSDto> ObtenerPlanActualAsync(int tenantId);
    Task<bool> ValidarLimiteAsync(int tenantId, TipoLimite tipo);
}
```

**Tipos de límites validados:**
- `MaxSocios`: Cantidad máxima de socios activos
- `MaxPersonal`: Cantidad máxima de personal/profesores
- `MaxSalas`: Cantidad máxima de salas
- `MaxTurnosPorDia`: 0 = Ilimitado (todos los planes)

### Super Tenant

El **Tenant ID 1** es el "Super Tenant":
- Acceso ilimitado a todas las funcionalidades
- Puede acceder a **Configuración → Integraciones**
- Puede gestionar planes SaaS de otros tenants
- No tiene límites de cantidad

### Entities SaaS

**Tenant Entity:**
```csharp
public class Tenant : BaseEntity
{
    public string Nombre { get; set; }
    public string? Slug { get; set; }            // Subdomain
    public string? LogoUrl { get; set; }
    public PlanSaaSEnum PlanSaas { get; set; }   // Basic, Standard, Premium, Enterprise
    public DateTime? TrialFechaFin { get; set; }
}
```

**PlanSaaS Entity:**
```csharp
public class PlanSaaS : BaseEntity
{
    public string Nombre { get; set; }           // Basic, Standard, Premium, Enterprise
    public decimal PrecioMensual { get; set; }
    public decimal PrecioAnual { get; set; }
    public int MaxSocios { get; set; }
    public int? MaxPersonal { get; set; }
    public int? MaxSalas { get; set; }
    public int MaxTurnosPorDia { get; set; }
}
```

**HistorialPagoSaaS Entity:**
```csharp
public class HistorialPagoSaaS : TenantEntity
{
    public int TenantId { get; set; }
    public int PlanSaaSId { get; set; }
    public int MetodoPagoId { get; set; }
    public bool EsAnual { get; set; }
    public decimal Monto { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
}
```

### API Endpoints SaaS

```
GET  /api/saas/plan-actual          → Obtener plan actual del tenant
GET  /api/saas/planes               → Listar planes disponibles
POST /api/saas/pagar/iniciar        → Iniciar pago de cambio de plan
GET  /api/saas/historial            → Historial de pagos SaaS
```

---

## Integración con MercadoPago

GymSaaS integra **MercadoPago** para dos propósitos:
1. **Pagos de socios** (renovaciones mensuales de suscripciones)
2. **Pagos SaaS** (suscripción de gimnasios al sistema)

### Arquitectura de Pagos

**Cada gimnasio (tenant) tiene SU PROPIA cuenta de MercadoPago.**
- Los pagos de socios llegan directamente a la cuenta del dueño del gimnasio
- No hay intermediarios ni retenciones adicionales
- Cada tenant configura sus credenciales OAuth independientemente

### Entidades MercadoPago

**MercadoPagoCredencial Entity:**
```csharp
public class MercadoPagoCredencial : BaseEntity
{
    public int TenantId { get; set; }              // PK, FK
    public string AccessToken { get; set; }        // Cifrado
    public string? RefreshToken { get; set; }      // Cifrado
    public DateTime TokenExpiraEn { get; set; }
    public long MercadoPagoUserId { get; set; }
    public string PublicKey { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaAutorizacion { get; set; }
}
```

**WebhookRetry Entity:**
```csharp
public class WebhookRetry : BaseEntity
{
    public int? TenantId { get; set; }
    public long PaymentId { get; set; }
    public string Tipo { get; set; }              // payment/refunded/chargeback
    public string Payload { get; set; }           // JSON
    public int Intentos { get; set; }
    public DateTime NextRetryAt { get; set; }
    public bool Completado { get; set; }
    public string? ErrorUltimoIntento { get; set; }
}
```

**PaymentAudit Entity:**
```csharp
public class PaymentAudit : TenantEntity
{
    public string Type { get; set; }              // preference/payment/preapproval/webhook
    public long? ReferenceId { get; set; }
    public string Status { get; set; }
    public decimal? Amount { get; set; }
    public string Currency { get; set; }
    public string? Email { get; set; }
    public string Message { get; set; }
    public string Payload { get; set; }           // JSON completo
}
```

### Servicios MercadoPago

**IMercadoPagoOAuthService:**
```csharp
public interface IMercadoPagoOAuthService
{
    Task<string> ObtenerAuthorizationUrlAsync(int tenantId, string redirectUri);
    Task<MercadoPagoTokenResponse> IntercambiarCodigoPorTokenAsync(string code, string redirectUri);
    Task<MercadoPagoTokenResponse> RefrescarTokenAsync(string refreshToken);
    Task<bool> GuardarCredencialesAsync(int tenantId, MercadoPagoTokenResponse token);
    Task<MercadoPagoCredencial?> ObtenerCredencialesAsync(int tenantId);
}
```

**IMercadoPagoService:**
```csharp
public interface IMercadoPagoService
{
    Task<string> CrearPreferenciaPagoAsync(OrdenPago orden, string returnUrl);
    Task<MercadoPagoPayment?> ObtenerPagoAsync(long paymentId);
    Task<bool> ProcesarWebhookAsync(long paymentId);
}
```

**IWebhookRetryProcessorService:**
```csharp
public interface IWebhookRetryProcessorService
{
    Task ProcesarReintentosPendientesAsync();
    Task RegistrarWebhookParaReintentoAsync(long paymentId, string tipo, string payload);
}
```

### Configuración OAuth

**appsettings.json:**
```json
{
  "MercadoPagoOAuth": {
    "AppId": "YOUR_APP_ID",
    "AppSecret": "YOUR_APP_SECRET",
    "RedirectUri": "https://tudominio.com/api/mercadopago/oauth/callback",
    "AuthBaseUrl": "https://auth.mercadopago.com.ar",
    "ApiBaseUrl": "https://api.mercadopago.com"
  }
}
```

### Webhooks

**Dos endpoints de webhook:**

1. **Pagos de socios:** `/api/renovaciones/webhook`
   - Procesa pagos de renovaciones de suscripciones
   - Actualiza `OrdenPago` y crea `Suscripcion`

2. **Pagos SaaS:** `/api/saas/webhook`
   - Procesa pagos de suscripciones al sistema
   - Actualiza `HistorialPagoSaaS` y cambia `Tenant.PlanSaas`

**Configuración en MercadoPago Developers:**
```
URL: https://tudominio.com/api/renovaciones/webhook
Eventos: payment, refunded, chargeback
```

### Renovaciones Automáticas

**ConfiguracionRenovacion Entity:**
```csharp
public class ConfiguracionRenovacion : TenantEntity
{
    public int SocioId { get; set; }
    public string? MercadoPagoCardToken { get; set; }      // Token seguro
    public string? Ultimos4Digitos { get; set; }
    public bool RenovacionAutomaticaHabilitada { get; set; }
    public string? MercadoPagoPreapprovalId { get; set; }
    public string? MercadoPagoPreapprovalStatus { get; set; }
}
```

**RenovacionSuscripcion Entity:**
```csharp
public class RenovacionSuscripcion : TenantEntity
{
    public int SocioId { get; set; }
    public int PlanId { get; set; }
    public int? PlanNuevoId { get; set; }                 // Para cambio de plan
    public MetodoPagoEnum MetodoPago { get; set; }        // Manual=1, MercadoPago=2
    public bool RenovacionAutomatica { get; set; }
    public EstadoRenovacionEnum Estado { get; set; }
    public string? MercadoPagoPreferenceId { get; set; }
    public long? MercadoPagoPaymentId { get; set; }
}
```

### Payment Workflows

**Flujo 1: Renovación Manual (Subir comprobante)**
```
Socio → Crear renovación → Subir comprobante
    ↓
Admin → Aprobar orden → Suscripcion creada
```

**Flujo 2: Renovación con MercadoPago**
```
Socio → Crear renovación → Pagar con tarjeta
    ↓
MercadoPago → Webhook → Suscripcion creada automáticamente
```

**Flujo 3: Renovación Automática**
```
Sistema (background) → 2 días antes del vencimiento
    ↓
Crear preferencia → Cobrar con tarjeta guardada
    ↓
MercadoPago → Webhook → Suscripcion renovada
```

### Key Domain Entities

**Core Entities:**
- `Usuario`: Authentication with roles (Admin, Profesor, Recepcion, Socio)
- `Tenant`: Gym/tenant configuration with SaaS plan
- `Socio`: Gym member data
- `Personal`: Staff/professors
- `Plan`: Subscription plans with pricing
- `Suscripcion`: Active subscriptions linked to socio and plan
- `OrdenPago`: Payment orders with status workflow (Pendiente → Aprobada → Suscripcion activa)
- `TurnoPlantilla`: Shift templates with day, time, room, and professor
- `RutinaPlantilla`: Workout routines designed by professors
- `Checkin`: Attendance records tracking member check-ins to their reserved shifts

**SaaS Entities:**
- `PlanSaaS`: SaaS subscription plans (Basic, Standard, Premium, Enterprise)
- `HistorialPagoSaaS`: Payment history for gym subscriptions
- `SaaSMercadoPagoSubscription`: MercadoPago preapproval subscriptions for SaaS payments

**MercadoPago Entities:**
- `MercadoPagoCredencial`: OAuth credentials per tenant
- `WebhookRetry`: Failed webhooks with retry logic
- `PaymentAudit`: Complete audit trail of all payment events

**Renovación Entities:**
- `RenovacionSuscripcion`: Monthly renewal records
- `ConfiguracionRenovacion`: Auto-renewal configuration with stored card tokens

## Common Commands

### Backend Development

```bash
# Navigate to API project
cd src/Gym.API

# Build solution
dotnet build

# Run API (Development)
dotnet run

# Run with specific environment
dotnet run --environment Development

# Run EF Core migrations (if using migrations)
dotnet ef database update
```

### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Setup

```bash
# Create PostgreSQL database
createdb gym_saas

# Run schema script
psql -d gym_saas -f db/gym_postgres.sql
```

The API will be available at `http://localhost:5144` (Swagger: `http://localhost:5144/swagger`)

The frontend dev server runs at `http://localhost:5173`

## Configuration

### Backend Configuration (`appsettings.json`)

Required settings (create `appsettings.Local.json` for local overrides, not tracked by git):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=gym_saas;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Key": "your-secret-key-minimum-16-chars",
    "Issuer": "GymSaasAPI",
    "Audience": "GymSaasFrontend",
    "ExpirationInHours": 24
  },
  "FrontendUrl": "http://localhost:5173",
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "your-email@gmail.com",
    "Pass": "your-app-password"
  },
  "MercadoPagoOAuth": {
    "AppId": "YOUR_MERCADOPAGO_APP_ID",
    "AppSecret": "YOUR_MERCADOPAGO_APP_SECRET",
    "RedirectUri": "https://tudominio.com/api/mercadopago/oauth/callback",
    "AuthBaseUrl": "https://auth.mercadopago.com.ar",
    "ApiBaseUrl": "https://api.mercadopago.com"
  },
  "MercadoPago": {
    "SaaS": {
      "AccessToken": "APP_USR-YOUR_SAAS_ACCESS_TOKEN",
      "WebhookSecret": "YOUR_WEBHOOK_SECRET"
    }
  }
}
```

**Configuration Sections:**

- **Jwt**: JWT token configuration for authentication
- **Smtp**: Email settings for notifications
- **MercadoPagoOAuth**: OAuth configuration for tenant-specific MercadoPago integration
- **MercadoPago:SaaS**: Credentials for SaaS payment processing (system-level payments)

### Frontend Configuration

Create `frontend/.env.local`:

```
VITE_API_BASE_URL=http://localhost:5144
```

## Key Architectural Patterns

### Repository Pattern

Repositories are registered in `DependencyInjection.cs`:
- Interfaces defined in `Gym.Domain/Interfaces/`
- Implementations in `Gym.Infrastructure/Repositories/`
- Scoped lifetime per request

Example: `IUsuarioRepository` → `UsuarioRepository`

### Authentication Flow

1. Login via `/api/usuarios/login` returns JWT token
2. Frontend stores token in `localStorage`
3. Axios interceptor (`gymApi.ts`) adds `Authorization: Bearer {token}` to requests
4. Backend validates JWT via `JwtBearerMiddleware`
5. Role-based authorization via `[Authorize(Roles="Admin")]`

### File Storage

File uploads use `IFileStorageService` (implemented as `LocalFileStorageService`):
- Avatars: `wwwroot/uploads/avatars/`
- Payment receipts: `wwwroot/uploads/comprobantes/`
- Files served via `app.UseStaticFiles()` middleware

### Payment Workflow (Camino Feliz)

**Workflow 1: Suscripción Inicial (Pago Manual)**
1. **Socio registration** → `socio` record created (active, no subscription)
2. **Plan selection** → `orden_pago` generated with `estado = Pendiente`
3. **Payment proof upload** → `comprobante` file linked to `orden_pago`
4. **Admin approval** → `orden_pago.estado` → `Aprobada`
5. **Auto-activation** → `suscripcion` created with `inicio`, `fin`, `estado = Activa`
6. **Shift booking** → `suscripcion_turno` records created with capacity validation
7. **Check-in** → `checkin` record validates active subscription and reserved shift

**Workflow 2: Renovación con MercadoPago**
1. **Socio clicks "Renovar"** → `renovacion_suscripcion` created with `estado = Iniciada`
2. **Select payment method** → Choose MercadoPago (tarjeta)
3. **Create preference** → `MercadoPagoService.CrearPreferenciaPagoAsync()`
4. **Redirect to checkout** → Socio completes payment on MercadoPago
5. **Webhook received** → `/api/renovaciones/webhook` called by MercadoPago
6. **Payment verified** → `orden_pago.estado` → `Aprobada`, `renovacion_suscripcion.estado` → `Pagada`
7. **Subscription extended** → Existing `suscripcion` extended by 30 days

**Workflow 3: Renovación Automática**
1. **Background job** → Runs 2 days before subscription expires
2. **Check auto-renewal** → `configuracion_renovacion.renovacion_automatica_habilitada = true`
3. **Create preapproval** → Use stored `mercado_pago_card_token`
4. **Charge card** → MercadoPago processes payment
5. **Webhook received** → Payment confirmed
6. **Subscription renewed** → Extended automatically, `renovacion_suscripcion` created with `estado = Completada`

### Check-in System

The system includes a comprehensive check-in module (`/checkins`):

**Manual Check-in (`/checkins/qr`)**:
- QR code scanner using camera (html5-qrcode library)
- Manual search by DNI, ID, or email
- Validates:
  - Socio has an active subscription
  - Socio has a reserved shift for today
  - Check-in hasn't already been registered for this shift
- Displays available shifts for the day with:
  - Time, room, and professor information
  - Capacity status (visual indicators: green/orange/red)

**Classes of the Day (`/checkins/clases-dia`)**:
- View all scheduled classes for a specific date
- Shows attendance counts and remaining capacity
- Filterable by date, room, and professor

**Statistics (`/checkins/estadisticas`)**:
- Daily, weekly, and monthly check-in metrics
- Most popular classes and time slots
- Attendance trends and patterns

**API Endpoints**:
- `POST /api/checkins` - Register check-in
- `GET /api/checkins/turnos-hoy/{socioId}` - Get member's shifts for today
- `GET /api/checkins/clases-dia` - Get classes for a specific date
- `GET /api/checkins/estadisticas` - Get attendance statistics

## Frontend Structure

- `src/api/gymApi.ts`: Centralized axios instance with JWT interceptors
- `src/components/Layout/`: Admin layout
- `src/components/LayoutSocio/`: Member-specific layout
- `src/views/`: Page components organized by feature (Dashboard, Socios, Personal, Suscripciones, etc.)
- Role-based routing redirects based on user's rol

### Role-Based Features

**Profesor Role**:
- Dedicated dashboard (`/dashboard/profesor`)
- Filtered calendar view showing only their assigned classes
- Cannot create/edit shift templates (view-only)
- Can manage workout routines and exercises
- Access to member attendance for their classes

**Recepcion Role**:
- Dedicated dashboard (`/dashboard/recepcion`)
- Quick access to check-in features (QR scanner, manual check-in)
- Can create/edit shift templates and manage schedules
- Cannot access workout routines management section
- Full access to member and subscription management

**Administrador Role**:
- Full system access
- Analytics dashboard with charts
- Can manage all entities including roles and users
- Access to financial reports and payment management

**Socio Role**:
- Personal dashboard showing their subscriptions and assigned shifts
- View their workout routines and progress
- Book shifts through available slots
- Check attendance history

---

## Role-Based Access Control (RBAC)

The system implements comprehensive role-based permissions across all modules. Below are the detailed permission matrices for each role.

### 📋 Permission Matrix

| Módulo                  | Ver | Crear | Editar | Eliminar | Admin | Recepción | Profesor | Socio |
|-------------------------|:---:|:-----:|:------:|:--------:|:-----:|:---------:|:--------:|:-----:|
| **Dashboard**           | ✅  |       |        |          | ✅    | ✅        | ✅       | ✅    |
| **Socios**              | ✅  | ✅    | ✅     | ✅       | ✅    | ✅        | ❌       | ❌    |
| **Personal**            | ✅  | ✅    | ✅     | ✅       | ✅    | ❌        | ❌       | ❌    |
| **Planes**              | ✅  | ✅    | ✅     | ✅       | ✅    | 👁️       | ❌       | ❌    |
| **Suscripciones**       | ✅  | ✅    | ✅     | ✅       | ✅    | ✅        | ❌       | 👁️   |
| **Turnos Plantilla**    | ✅  | ✅    | ✅     | ✅       | ✅    | ❌        | 👁️      | ❌    |
| **Asignar Turnos**      | ✅  | ✅    | ❌     | ✅       | ✅    | ✅        | ❌       | ❌    |
| **Asignar Rutinas**     | ✅  |       |        |          | ✅    | ❌        | ✅       | ❌    |
| **Agenda/Calendario**   | ✅  |       |        |          | ✅    | ✅        | ✅ (su)  | 👁️   |
| **Rutinas/Ejercicios**  | ✅  | ✅    | ✅     | ✅       | ✅    | ❌        | ✅* | 👁️   |
| **Pagos/Órdenes**       | ✅  | ✅    | ✅     | ✅       | ✅    | ✅        | ❌       | 👁️   |
| **Check-in**            | ✅  | ✅    |        |          | ✅    | ✅        | ❌       | ❌    |
| **Reportes/Finanzas**   | ✅  |       |        |          | ✅    | ❌        | ❌       | ❌    |

**Legend**: ✅ = Full access | 👁️ = Read-only | ❌ = No access | (su) = Solo sus turnos (their own shifts) | ✅* = Full CRUD access (crear, editar, eliminar) for Profesor

---

### 👨‍💼 Administrador

**Dashboard Principal** (`/dashboard`)
- Full analytics dashboard with charts and metrics
- Access to all system modules
- User management and role assignments

**Gestión de Socios**
- ✅ Ver listado de socios
- ✅ Crear nuevos socios
- ✅ Editar datos de socios
- ✅ Dar de baja (eliminar) socios
- ✅ Ver historial completo

**Gestión de Personal**
- ✅ Ver todo el personal
- ✅ Crear registros de personal
- ✅ Editar personal
- ✅ Eliminar personal
- ✅ Crear usuarios de acceso para personal

**Gestión de Planes**
- ✅ Ver todos los planes
- ✅ Crear nuevos planes
- ✅ Editar planes (precios, días por semana, salas asignadas)
- ✅ Eliminar planes

**Gestión de Suscripciones**
- ✅ Ver todas las suscripciones
- ✅ Crear suscripciones (activar planes)
- ✅ Editar suscripciones
- ✅ Eliminar suscripciones
- ✅ Asignar turnos a socios

**Gestión de Turnos Plantilla**
- ✅ Ver plantilla de turnos completa
- ✅ Crear nuevos turnos plantilla
- ✅ Editar turnos existentes
- ✅ Eliminar turnos
- ✅ Filtrar por día, profesor, sala

**Gestión de Turnos Asignados**
- ✅ Ver todos los turnos asignados
- ✅ Asignar turnos a suscripciones
- ✅ Eliminar turnos asignados
- ✅ Asignar rutinas a turnos

**Gestión de Rutinas**
- ✅ Ver todas las rutinas plantilla
- ✅ Crear rutinas
- ✅ Editar rutinas
- ✅ Eliminar rutinas
- ✅ Gestión de ejercicios
- ✅ Gestión de grupos musculares

**Gestión de Pagos**
- ✅ Ver órdenes de pago
- ✅ Aprobar/rechazar comprobantes
- ✅ Ver comprobantes
- ✅ Acceso a dashboard financiero
- ✅ Reportes de ingresos

**Control de Check-in**
- ✅ Escáner QR de check-in
- ✅ Check-in manual por DNI/email
- ✅ Ver clases del día
- ✅ Ver estadísticas de asistencia

**Configuración**

**Integraciones** (Solo Super Tenant - Tenant ID 1):
- ✅ Configurar MercadoPago OAuth
- ✅ Ver credenciales OAuth conectadas
- ✅ Gestionar webhooks
- ✅ Ver auditoría de pagos

**Plan SaaS**:
- ✅ Ver plan actual del gimnasio
- ✅ Ver límites del plan (socios, personal, salas)
- ✅ Cambiar de plan SaaS
- ✅ Ver historial de pagos SaaS
- ✅ Modal de pago con MercadoPago para cambios de plan

**Validaciones de Límites**:
- Al crear socio: Verifica `MaxSocios` del plan
- Al crear personal: Verifica `MaxPersonal` del plan
- Al crear sala: Verifica `MaxSalas` del plan
- Al cambiar plan: Verifica que no se excedan límites del nuevo plan

- ✅ Gestión de usuarios del sistema

---

### 📞 Recepcionista

**Dashboard Propio** (`/dashboard/recepcion`)
- Specialized dashboard for reception tasks
- Quick access to check-in features

**Gestión de Socios**
- ✅ Ver listado de socios
- ✅ Crear nuevos socios
- ✅ Editar datos de socios
- ❌ NO puede dar de baja (eliminar) socios
- ✅ Ver historial de socios

**Gestión de Personal**
- ✅ Ver listado de personal (read-only)
- ❌ NO puede crear personal
- ❌ NO puede editar personal
- ❌ NO puede eliminar personal
- ❌ NO puede crear usuarios de acceso

**Gestión de Planes**
- ✅ Ver listado de planes (read-only)
- ❌ NO tiene columna de acciones
- ❌ NO puede crear planes
- ❌ NO puede editar planes
- ❌ NO puede eliminar planes

**Gestión de Suscripciones**
- ✅ Ver suscripciones
- ✅ Crear suscripciones (activar planes)
- ✅ Editar suscripciones
- ❌ NO puede eliminar suscripciones
- ✅ Asignar turnos a socios

**Gestión de Turnos Plantilla**
- ✅ Ver plantilla de turnos (solo visualización)
- ❌ NO puede crear turnos plantilla
- ❌ NO puede editar turnos
- ❌ NO puede eliminar turnos
- ✅ Puede filtrar por día, sala, profesor
- ❌ NO tiene botón "➕ Nuevo Turno"
- ❌ NO tiene columna de acciones

**Gestión de Turnos Asignados**
- ✅ Ver turnos asignados
- ✅ Asignar turnos a suscripciones
- ❌ NO puede eliminar turnos asignados
- ❌ NO puede asignar rutinas (solo Admin y Profesor)

**Gestión de Rutinas**
- ❌ NO puede ver rutinas plantilla
- ❌ NO puede crear/editar/eliminar rutinas
- ❌ NO puede gestionar ejercicios

**Gestión de Pagos**
- ✅ Ver órdenes de pago
- ✅ Aprobar/rechazar comprobantes
- ✅ Ver comprobantes
- ✅ Ver ingresos (AdminIngresos)
- ❌ NO tiene acceso a dashboard financiero completo

**Control de Check-in**
- ✅ Escáner QR de check-in (principal)
- ✅ Check-in manual por DNI/email
- ✅ Ver clases del día con capacidad
- ❌ NO puede ver estadísticas de asistencia

**Configuración**
- ❌ NO tiene acceso a configuraciones

---

### 🏋️ Profesor

**Dashboard Propio** (`/dashboard/profesor`)
- Specialized dashboard showing only assigned classes
- View of today's schedule and upcoming classes

**Gestión de Socios**
- ❌ NO puede ver listado de socios
- ❌ NO puede crear/editar/eliminar socios

**Gestión de Personal**
- ❌ NO puede ver personal
- ❌ NO puede gestionar personal

**Gestión de Planes**
- ❌ NO puede ver planes
- ❌ NO puede gestionar planes

**Gestión de Suscripciones**
- ❌ NO puede ver suscripciones
- ❌ NO puede gestionar suscripciones

**Gestión de Turnos Plantilla**
- ✅ Ver SOLO sus turnos asignados (filtrado por su ID)
- ✅ Ver filtrado por defecto (solo sus propias clases)
- ❌ NO puede crear turnos plantilla
- ❌ NO puede editar turnos
- ❌ NO puede eliminar turnos
- ❌ NO tiene botón "➕ Nuevo Turno"
- ❌ NO tiene columna de acciones

**Gestión de Turnos Asignados**
- ✅ Ver turnos de sus clases asignadas
- ❌ NO puede asignar turnos
- ❌ NO puede eliminar turnos asignados
- ✅ Puede asignar rutinas a turnos

**Gestión de Rutinas y Ejercicios**
- ✅ Ver rutinas plantilla
- ✅ Crear rutinas
- ✅ Editar rutinas
- ✅ Eliminar rutinas
- ✅ Ver ejercicios
- ✅ Crear ejercicios
- ✅ Editar ejercicios
- ✅ Eliminar ejercicios
- ✅ Gestión de grupos musculares (ver, crear, editar, eliminar)

**Gestión de Pagos**
- ❌ NO puede ver órdenes de pago
- ❌ NO puede gestionar pagos

**Control de Check-in**
- ❌ NO tiene acceso a check-in
- ❌ NO puede ver estadísticas

**Agenda/Calendario**
- ✅ Ver calendario (SOLO sus clases asignadas)
- ✅ Ver participantes de sus clases

---

### 🧑‍🦱 Socio

**Dashboard Propio** (`/socio/dashboardSocio`)
- Personal dashboard with subscriptions and assigned shifts
- View of active plans and validity dates

**Gestión de Planes**
- ✅ Ver planes disponibles (SOLO lectura)
- ❌ NO puede crear/editar/eliminar planes

**Gestión de Suscripciones**
- ✅ Ver sus propias suscripciones
- ✅ Ver historial de renovaciones
- ❌ NO puede crear suscripciones (el admin las crea)
- ❌ NO puede editar/eliminar

**Gestión de Turnos Asignados**
- ✅ Ver sus turnos asignados (vista calendario)
- ✅ Ver detalles de sus turnos (hora, sala, profesor)
- ✅ Reagendar turnos (con límites)
- ❌ NO puede asignar turnos nuevos
- ❌ NO puede eliminar turnos

**Gestión de Rutinas**
- ✅ Ver sus rutinas asignadas
- ✅ Ver ejercicios de sus rutinas
- ✅ Ver evolución física
- ❌ NO puede crear/editar rutinas

**Control de Asistencia**
- ✅ Ver su propio historial de asistencia
- ❌ NO puede hacer check-in (lo hace recepción)

**Perfil**
- ✅ Ver y editar su perfil
- ✅ Cambiar su contraseña
- ✅ Ver su foto

**Pagos**
- ✅ Ver sus propias órdenes de pago
- ✅ Subir comprobantes de pago
- ❌ NO puede aprobar pagos

---

## Database Naming Convention

- EF Core uses `SnakeCaseNamingConvention` for PostgreSQL
- Tables in snake_case: `usuario`, `orden_pago`, `turno_plantilla`
- Boolean values stored as `smallint` (0/1) via `BoolToZeroOneConverter<short>`
- Decimal precision configured for money/measurements (e.g., `HasPrecision(10, 2)`)

## Important Implementation Notes

### Dependency Injection

All services registered in `Gym.Infrastructure/DependencyInjection.cs`. When adding new repositories:
1. Create interface in `Gym.Domain/Interfaces/`
2. Implement in `Gym.Infrastructure/Repositories/`
3. Register in `DependencyInjection.cs` with `services.AddScoped<IInterface, Implementation>()`

### Controller Authorization

Controllers use `[Authorize]` and `[Authorize(Roles="...")]` attributes:
- Available roles: `"Admin"`, `"Profesor"`, `"Recepcion"`, `"Socio"`
- JWT role claim: `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`

### CORS Configuration

Frontend origin configured in `appsettings.json` → `FrontendUrl`, applied via `AllowFrontend` policy in `Program.cs`.

### Entity Relationships

Key relationships configured in `GymDbContext.OnModelCreating`:
- `Usuario` → `Socio` (1:1 via `SocioId`)
- `Usuario` → `Personal` (1:1 via `PersonalId`)
- `Socio` → `Suscripcion` (1:N)
- `OrdenPago` → `Comprobante` (1:1)
- `TurnoPlantilla` → `SuscripcionTurno` (1:N)
- `RutinaPlantilla` → `RutinaPlantillaEjercicio` (1:N)

## Default Credentials

| Rol           | Email                  | Contraseña |
|---------------|------------------------|------------|
| Administrador | admin@gym.com          | admin123   |
| Recepcionista | rece@gym.com           | rece123    |
| Socio         | socio@gym.com          | socio123   |
| Profesor      | profe@gym.com          | profe123   |

## Testing

Access Swagger UI at `http://localhost:5144/swagger` for API testing and documentation.
