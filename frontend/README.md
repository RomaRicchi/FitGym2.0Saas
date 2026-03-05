# GymSaaS Frontend

Frontend application for GymSaaS - a gym management system with fixed-shift scheduling, member management, workout routines, and attendance tracking.

## Tech Stack

- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite 5.4.8** - Build tool and dev server
- **Bootstrap 5.3.8** - CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **SweetAlert2** - Beautiful alerts
- **Recharts** - Data visualization
- **FontAwesome** - Icons
- **FullCalendar** - Calendar component
- **html5-qrcode** - QR code scanner

## Project Structure

```
src/
├── api/
│   └── gymApi.ts              # Axios instance with JWT interceptor
├── components/
│   ├── Layout/                # Admin/staff layout components
│   ├── LayoutSocio/           # Member-specific layout
│   ├── Navbar.tsx             # Main navigation bar with avatar support
│   ├── Sidebar.tsx            # Role-based sidebar navigation
│   └── Pagination.tsx         # Reusable pagination component
├── views/
│   ├── Dashboard.tsx          # Admin dashboard (redirects by role)
│   ├── DashboardRecepcion.tsx # Reception-specific dashboard
│   ├── agenda/
│   │   ├── AgendaCalendar.tsx         # Calendar with shift management
│   │   ├── checkin/
│   │   │   ├── CheckinQR.tsx          # QR scanner + manual check-in
│   │   │   ├── ClasesDelDia.tsx       # Daily classes view
│   │   │   └── EstadisticasCheckin.tsx # Attendance statistics
│   │   └── suscripcionTurno/
│   │       └── TurnosList.tsx         # Member shift assignments
│   ├── rutinas/
│   │   ├── ejercicios/         # Exercise management
│   │   ├── rutina-plantilla/   # Workout routine templates
│   │   └── RutinasSocio.tsx    # Member routine view
│   ├── socios/                 # Member management
│   ├── suscripciones/          # Subscription management
│   └── ... (other modules)
├── styles/
│   ├── Sidebar.css            # Custom sidebar styles
│   └── global.css             # Global styles
└── main.tsx                   # Application entry point
```

## Key Features

### 🔐 Role-Based Access Control

- **Administrador**: Full system access, analytics dashboard, user management
- **Profesor**: View-only calendar (their classes), routine/exercise management
- **Recepcion**: Member check-in, shift scheduling, subscription management
- **Socio**: Personal dashboard, shift booking, routine viewing

### 📷 Check-in System

**QR Scanner Check-in** (`/checkins/qr`):
- Real-time QR code scanning using device camera
- Automatic member lookup and shift validation
- Visual feedback for scan success/failure

**Manual Check-in**:
- Search by DNI, member ID, or email
- View all member's scheduled shifts for today
- One-click check-in registration

**Daily Classes View** (`/checkins/clases-dia`):
- See all classes scheduled for a specific date
- Real-time attendance counts
- Capacity status indicators

**Statistics** (`/checkins/estadisticas`):
- Daily/weekly/monthly attendance trends
- Popular classes and time slots
- Export functionality

### 📅 Calendar Management

**Profesor View**:
- Filtered to show only their assigned classes
- View-only access (cannot create/edit)

**Admin/Recepcion View**:
- Full CRUD on shift templates
- Create recurring shifts
- Filter by room and professor
- Visual capacity indicators (red/yellow/green)

### 💪 Workout Routines

- **Ejercicios**: Exercise library with muscle groups, demo images
- **Rutinas**: Workout routine templates
- **Rutinas (Cards)**: Card-based view for routine management
- **Planilla de Ejercicios**: Bulk exercise assignment (Admin only)

### 👤 Member Management

- Complete member profiles with avatar support
- Subscription lifecycle management
- Shift assignment and booking
- Attendance history

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5144
```

## Authentication Flow

1. User logs in via `/login`
2. JWT token stored in `localStorage`
3. Axios interceptor adds `Authorization: Bearer {token}` to requests
4. Role-based redirects:
   - `Profesor` → `/dashboard/profesor`
   - `Recepcion` → `/dashboard/recepcion`
   - `Socio` → `/dashboardSocio`
   - `Admin` → `/dashboard`

## API Integration

All API calls go through `src/api/gymApi.ts`:

```typescript
import gymApi from '@/api/gymApi';

// GET request
const { data } = await gymApi.get('/socios');

// POST request
const { data } = await gymApi.post('/checkins', {
  socioId: 123,
  turnoPlantillaId: 456
});

// PUT request
await gymApi.put(`/socios/${id}`, socioData);
```

## Key Components

### Navbar

- Responsive navigation with hamburger menu
- User avatar display with fallback
- Role-based navigation links
- Logout functionality

### Sidebar

- Collapsible sections
- Role-based menu items
- FontAwesome icons
- Active route highlighting

### Pagination

Reusable pagination component:
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  pageSize={pageSize}
  onPageChange={setCurrentPage}
/>
```

## Styling

- Bootstrap 5 for base components
- Custom CSS for specific components
- Inline styles for dynamic values
- Responsive design with mobile-first approach

## State Management

- React hooks (useState, useEffect, useMemo)
- Local component state
- localStorage for persistence (user data, tokens)

## Error Handling

- Global error interceptor in axios
- SweetAlert2 for user-friendly error messages
- Fallback UI for loading states

## Performance Optimizations

- Memoized calculations with useMemo
- Pagination to limit data loaded
- Lazy loading where applicable
- Optimized re-renders

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting (recommended)

### Common Patterns

**Fetch with loading state**:
```tsx
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await gymApi.get('/endpoint');
      setData(data);
    } catch (error) {
      Swal.fire('Error', 'Message', 'error');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

**Role-based rendering**:
```tsx
const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
const rol = usuario?.rol || "";

{rol === "Administrador" && (
  <AdminOnlyComponent />
)}
```

---

# Manual de Usuario

## Inicio de Sesión

### Acceder al Sistema

1. Abre el navegador y navega a la URL del sistema (ej: `http://localhost:5173`)
2. Ingresa tu email y contraseña
3. El sistema te redirigirá automáticamente al panel correspondiente a tu rol

### Credenciales por Defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@gym.com | admin123 |
| Recepcionista | rece@gym.com | rece123 |
| Profesor | profe@gym.com | profe123 |
| Socio | socio@gym.com | socio123 |

**⚠️ Importante**: Cambia tu contraseña después del primer inicio de sesión.

---

## Panel de Administrador

El rol **Administrador** tiene acceso completo a todas las funcionalidades del sistema.

### Dashboard Principal

- **Gráfico de Suscripciones**: Evolución mensual de suscripciones activas
- **Salas más reservadas**: Ranking de salas por ocupación
- **Planes más elegidos**: Planes preferidos por los socios

### Gestión de Socios

#### Registrar un Nuevo Socio

1. Ve a **Socios** en el menú lateral
2. Haz clic en **➕ Nuevo**
3. Completa los datos personales
4. Haz clic en **Guardar**

#### Gestión de Suscripciones

Las suscripciones se crean automáticamente al aprobar una orden de pago:
1. Ve a **Órdenes** → Busca la orden pendiente
2. Haz clic en **Aprobar**
3. El sistema genera automáticamente la suscripción

### Gestión de Turnos

#### Crear Turnos Recurrentes

1. Ve a **Agenda** → **Calendario**
2. Haz clic en el día deseado
3. Completa: hora, duración, sala, profesor, cupo
4. Guarda los cambios

### Reportes Financieros

Ve a **Pagos** → **Finanzas** para ver ingresos y tendencias.

---

## Panel de Recepcionista

### Dashboard Principal

- **Accesos Rápidos**: QR scanner, socios, suscripciones, agenda, pagos
- **Estadísticas**: Total de socios con suscripción vigente

### Sistema de Check-in

#### Check-in con Cámara QR

1. Ve a **Agenda** → **Check-in Manual**
2. Haz clic en **📷 Usar Cámara**
3. Apunta la cámara al código QR del socio
4. Selecciona el turno para registrar el check-in

#### Check-in Manual

1. Ingresa DNI, ID o email del socio
2. Haz clic en **🔍 Buscar turnos**
3. Selecciona el turno y haz clic en **✅ Check-in**

---

## Panel de Profesor

### Dashboard Principal

- **Mis Clases de Hoy**: Lista de tus clases del día
- **Accesos Rápidos**: Calendario, rutinas, ejercicios

### Calendario (Solo Mis Clases)

- El calendario muestra **solo tus clases asignadas**
- NO puedes crear o editar turnos (vista solo lectura)

### Gestión de Rutinas

- Crear y editar rutinas de entrenamiento
- Gestionar ejercicios
- Asignar rutinas a socios

---

## Panel de Socio

### Dashboard Personal

- **Mis Suscripciones**: Plan actual, fechas, estado
- **Mis Próximos Turnos**: Próximas clases con día y hora

### Ver Mis Turnos

- Ve a **Calendario** para ver tus turnos asignados

### Ver Mis Rutinas

- Ve a **Rutinas** para ver las rutinas asignadas por tus profesores

---

## Solución de Problemas

### No puedo iniciar sesión

1. Verifica email y contraseña (mayúsculas/minúsculas)
2. Si olvidaste la contraseña, contacta al administrador

### El avatar no se muestra

1. Ve a tu perfil
2. Sube una nueva foto
3. Guarda los cambios
4. Recarga la página (F5)

### El check-in falla

**Causas posibles**:
- Socio sin suscripción activa
- Socio sin turnos para hoy
- Check-in ya registrado en ese turno

---

## Glosario

- **Socio**: Miembro del gimnasio con suscripción
- **Suscripción**: Período de acceso vigente
- **Turno Plantilla**: Clase recurrente (ej: "Lunes 10:00 - Spinning")
- **Turno Asignado**: Reserva específica de un socio
- **Check-in**: Registro de asistencia a una clase
- **Cupo**: Capacidad máxima de una clase
- **Rutina**: Serie de ejercicios organizados

---

## Tips de Productividad

### Para Recepcionistas
- Ten abiertas siempre: Check-in QR y Clases del Día
- Usa atajos: El botón "Escáner QR" en el dashboard es acceso directo

### Para Profesores
- Prepara rutinas con anticipación
- Revisa el calendario semanalmente

### Para Administradores
- Revisa estadísticas semanalmente
- Monitorea pagos pendientes

---

**Versión del Manual**: 1.0
**Fecha de Actualización**: Enero 2025
**Sistema**: GymSaaS v1.0

## License

Proprietary - GymSaaS
