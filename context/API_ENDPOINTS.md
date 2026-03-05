# GymSaaS API - Endpoints de Autenticación y Gestión SaaS

> Documentación completa de endpoints de autenticación, gestión de usuarios y multi-tenancia del sistema GymSaaS.

---

## Índice

1. [ENDPOINTS DE AUTENTICACIÓN](#1-endpoints-de-autenticación)
2. [ENDPOINTS DE USUARIOS](#2-endpoints-de-usuarios)
3. [ENDPOINTS SAAS (TENANTS Y SUSCRIPCIÓN)](#3-endpoints-saas-tenants-y-suscripción)
4. [ENDPOINTS DE CHECK-IN UNIFICADO](#4-endpoints-de-check-in-unificado)
5. [ENDPOINTS DE RENOVACIONES](#5-endpoints-de-renovaciones)
6. [INFORMACIÓN ADICIONAL](#6-información-adicional)
7. [EJEMPLOS DE FLUJOS COMPLETOS](#7-ejemplos-de-flujos-completos)
8. [DATOS DE PRUEBA](#8-datos-de-prueba)

---

## 1. ENDPOINTS DE AUTENTICACIÓN

Base URL: `/api/auth`

Todos los endpoints de autenticación son **públicos** (no requieren token JWT).

---

### POST `/api/auth/register`

Registra un nuevo usuario con rol **Socio**. El email debe ser único y válido. La contraseña debe tener al menos 6 caracteres.

**Request Body:**
```json
{
  "email": "string (requerido, formato válido, único)",
  "alias": "string (opcional)",
  "password": "string (requerido, mínimo 6 caracteres)",
  "socioId": "int? (opcional, ID del socio si existe)"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente. Ya puedes iniciar sesión.",
  "data": null,
  "statusCode": 200,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Datos de registro inválidos.",
  "errors": [
    "El email es obligatorio.",
    "La contraseña debe tener al menos 6 caracteres."
  ],
  "statusCode": 400,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Notas adicionales:**
- El usuario se crea automáticamente con `RolId = 4` (Rol "Socio")
- `TenantId = 1` por defecto (debería venir del contexto multi-tenant)
- El email se normaliza a minúsculas y se elimina espacios
- **NO devuelve token JWT** - requiere login posterior
- No valida si el `socioId` existe en la base de datos

---

### POST `/api/auth/login`

Inicia sesión con email y contraseña. Incluye rate limiting de **5 intentos por minuto**.

**Request Body:**
```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "email": "admin@gym.com",
      "alias": "Admin",
      "rol": "Admin",
      "avatar": "http://localhost:5144/uploads/avatars/avatar-1.jpg",
      "tenantId": 1,
      "socioId": null,
      "personalId": 5
    }
  },
  "statusCode": 200,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Response Error (400 Bad Request) - Credenciales inválidas:**
```json
{
  "success": false,
  "message": "Credenciales incorrectas.",
  "statusCode": 400,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Response Error (403 Forbidden) - Usuario desactivado:**
```json
{
  "success": false,
  "message": "El usuario se encuentra desactivado. Contacte al administrador.",
  "statusCode": 403,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Notas adicionales:**
- **Rate limiting**: Máximo 5 intentos por minuto por IP
- Valida: email existe, usuario está activo (`Estado = true`), contraseña correcta (BCrypt)
- Devuelve incluye: Rol, TenantId, SocioId, PersonalId, Avatar (si existe)
- Token JWT válido por **24 horas** (configurable en `appsettings.json`)

---

### POST `/api/auth/forgot-password`

Solicita recuperación de contraseña vía email. Genera un token válido por **1 hora**. Rate limiting de **3 solicitudes cada 5 minutos**.

**Request Body:**
```json
{
  "email": "string (requerido)"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás un correo de recuperación.",
  "statusCode": 200,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Notas adicionales:**
- **Por seguridad**: SIEMPRE devuelve éxito, aún si el email no existe
- Elimina tokens anteriores del mismo usuario antes de crear uno nuevo
- Envía email con link: `{FrontendUrl}/reset-password?token={token}`
- Token expira en **1 hora**
- Requiere configuración SMTP en `appsettings.json`

---

### POST `/api/auth/reset-password`

Restablece la contraseña usando un token válido. La contraseña debe tener al menos 6 caracteres.

**Request Body:**
```json
{
  "token": "string (requerido, GUID de 32 caracteres)",
  "newPassword": "string (requerido, mínimo 6 caracteres)"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña restablecida correctamente. Ya puedes iniciar sesión.",
  "statusCode": 200,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Response Error (400 Bad Request) - Token inválido:**
```json
{
  "success": false,
  "message": "El token es inválido o ha expirado. Solicita una nueva recuperación.",
  "statusCode": 400,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Notas adicionales:**
- Valida que el token exista y no haya expirado (> DateTime.UtcNow)
- El token se elimina después de usarlo (single-use)
- Nueva contraseña hasheada con BCrypt (`IPasswordHasher`)

---

### GET `/api/auth/me`

❌ **NO IMPLEMENTADO** - Este endpoint no existe actualmente.

**Alternativa:** El token JWT contiene toda la información del usuario (ver sección 4.2).

---

### POST `/api/auth/logout`

❌ **NO IMPLEMENTADO** - El sistema usa JWT stateless sin persistencia de sesiones.

**Alternativa:** Eliminar el token del lado del cliente (localStorage, cookie, etc).

---

## 2. ENDPOINTS DE USUARIOS

Base URL: `/api/usuarios`

Todos los endpoints requieren autenticación y rol **Administrador**.

---

### GET `/api/usuarios`

Lista todos los usuarios del sistema con paginación y búsqueda.

**Query Parameters:**
```
?page=1           (default: 1)
&pageSize=10      (default: 10)
&q=search         (opcional, busca en Email y Alias)
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200 OK):**
```json
{
  "totalItems": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3,
  "items": [
    {
      "id": 1,
      "email": "admin@gym.com",
      "alias": "Admin",
      "rol": "Admin",
      "estado": true
    },
    {
      "id": 2,
      "email": "socio@gym.com",
      "alias": "Juan",
      "rol": "Socio",
      "estado": true
    }
  ]
}
```

**Notas adicionales:**
- Requiere rol `Administrador`
- Ordena por `Alias` ascendente
- La búsqueda es case-insensitive con `%search%`

---

### GET `/api/usuarios/{id}`

Obtiene los detalles completos de un usuario por ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200 OK):**
```json
{
  "id": 1,
  "email": "admin@gym.com",
  "alias": "Admin",
  "rol": "Admin",
  "personal": "Juan Admin",
  "avatar": "http://localhost:5144/uploads/avatars/avatar-1.jpg",
  "estado": true
}
```

**Response Error (404 Not Found):**
```json
{
  "message": "Usuario no encontrado."
}
```

---

### POST `/api/usuarios`

Crea un nuevo usuario (solo Administrador).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "nuevo@gym.com",
  "alias": "Nuevo Usuario",
  "passwordHash": "password123",  // Si no empieza con "$2", se hashea automáticamente
  "rolId": 2,
  "personalId": 10,
  "socioId": null,
  "tenantId": 1
}
```

**Response Success (201 Created):**
```json
{
  "id": 15,
  "email": "nuevo@gym.com",
  "alias": "Nuevo Usuario",
  "createdAt": "2025-01-30T12:00:00Z"
}
```

**Notas adicionales:**
- Si `passwordHash` no empieza con `$2` (formato BCrypt), se hashea automáticamente
- Requiere que `rolId` exista en la tabla `roles`

---

### PUT `/api/usuarios/{id}`

Actualiza un usuario existente.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "actualizado@gym.com",
  "alias": "Alias Actualizado",
  "rolId": 3,
  "estado": true
}
```

**Response Success (200 OK):**
```json
{
  "message": "✅ Usuario actualizado correctamente."
}
```

**Response Error (400 Bad Request) - Rol inválido:**
```json
{
  "message": "Rol inválido o no existente."
}
```

---

### DELETE `/api/usuarios/{id}`

**Soft delete**: Marca el usuario como inactivo (`estado = false`). No elimina el registro.

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200 OK):**
```json
{
  "message": "🗑️ Usuario marcado como inactivo."
}
```

---

## 3. ENDPOINTS SAAS (TENANTS Y SUSCRIPCIÓN)

Base URL: `/api/saas`

---

### POST `/api/saas/registro`

Registra un nuevo gimnasio en la plataforma SaaS. Crea: **Tenant** + **Usuario Admin** + **Personal** + **Planes iniciales** + **Token JWT**.

**Request Body:**
```json
{
  "nombreGimnasio": "string (requerido, nombre del gimnasio)",
  "slug": "string? (opcional, si no se proporciona se genera desde el nombre)",
  "emailAdmin": "string (requerido, email válido, único globalmente)",
  "password": "string (requerido, mínimo 6 caracteres)",
  "nombreAdmin": "string (requerido, nombre completo del admin)",
  "telefono": "string? (opcional, teléfono de contacto)",
  "direccion": "string? (opcional, dirección del gimnasio)",
  "planSaasId": "int (requerido, default: 1, valores: 1=Basic, 2=Standard, 3=Premium, 4=Enterprise)",
  "esAnual": "bool (default: false, si es true se cobra anualmente con descuento)"
}
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "message": "Gimnasio registrado correctamente",
  "data": {
    "tenantId": 5,
    "adminId": 25,
    "email": "admin@mi-gym.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "nombreGimnasio": "Mi Gimnasio",
    "planAsignado": "Standard",
    "planVenceEn": "2026-01-30T12:00:00Z",
    "mensaje": "¡Bienvenido Juan! Tu gimnasio 'Mi Gimnasio' ha sido registrado exitosamente."
  },
  "statusCode": 201,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Datos de registro inválidos.",
  "errors": [
    "El email ya está registrado en otro gimnasio.",
    "El subdominio ya está en uso. Prueba con otro nombre."
  ],
  "statusCode": 400
}
```

**Notas adicionales:**
- Usa **transacción de base de datos**: si falla cualquier paso, se hace rollback completo
- **Slug autogenerado**: si no se proporciona, se genera desde `nombreGimnasio` + GUID de 6 caracteres
  - Ejemplo: `"mi-gimnasio-a1b2c3"`
- **Fecha de vencimiento**:
  - Si `esAnual = false`: 1 mes desde hoy
  - Si `esAnual = true`: 1 año desde hoy
- **Planes iniciales** (ejemplo de carga):
  - "Plan Básico - 3 días/semana" - $14.995
  - "Plan Standard - 5 días/semana" - $29.990
  - "Plan Premium - Ilimitado" - $79.990
- **Login automático**: Devuelve token JWT listo para usar
- **Roles**: Busca o crea rol "Admin" para el usuario

---

### GET `/api/saas/planes`

Lista todos los planes SaaS disponibles con características y precios.

**Auth:** ❌ Público (no requiere autenticación)

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Planes obtenidos",
  "data": [
    {
      "id": 1,
      "nombre": "Basic",
      "descripcion": "Para gimnasios pequeños que comienzan",
      "precioMensual": 14995,
      "precioAnual": 299.99,
      "maxSocios": "50",
      "maxPersonal": "5",
      "maxSalas": "2",
      "maxTurnosPorDia": "20",
      "caracteristicas": {
        "rutinas": true,
        "evolucionFisica": false,
        "checkin": true,
        "reportesAvanzados": false,
        "appPersonalizada": false,
        "soportePrioritario": false,
        "apiAcceso": false,
        "integraciones": false
      }
    },
    {
      "id": 2,
      "nombre": "Standard",
      "descripcion": "Para gimnasios en crecimiento",
      "precioMensual": 29990,
      "precioAnual": 799.99,
      "maxSocios": "200",
      "maxPersonal": "15",
      "maxSalas": "5",
      "maxTurnosPorDia": "50",
      "caracteristicas": {
        "rutinas": true,
        "evolucionFisica": true,
        "checkin": true,
        "reportesAvanzados": true,
        "appPersonalizada": false,
        "soportePrioritario": false,
        "apiAcceso": false,
        "integraciones": true
      }
    },
    {
      "id": 3,
      "nombre": "Premium",
      "descripcion": "Para gimnasios grandes",
      "precioMensual": 79990,
      "precioAnual": 1999.99,
      "maxSocios": "Ilimitado",
      "maxPersonal": "Ilimitado",
      "maxSalas": "Ilimitado",
      "maxTurnosPorDia": "Ilimitado",
      "caracteristicas": {
        "rutinas": true,
        "evolucionFisica": true,
        "checkin": true,
        "reportesAvanzados": true,
        "appPersonalizada": true,
        "soportePrioritario": true,
        "apiAcceso": true,
        "integraciones": true
      }
    }
  ],
  "statusCode": 200
}
```

**Notas adicionales:**
- `"maxSocios": "0"` = **Ilimitado**
- Precios en USD (configurable en `PlanSaaSService`)

---

### GET `/api/saas/plan-actual`

Obtiene el plan SaaS actual del tenant autenticado.

**Auth:** ✅ Requiere token JWT + Rol `Administrador`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Plan actual obtenido",
  "data": {
    "id": 2,
    "nombre": "Standard",
    "descripcion": "Para gimnasios en crecimiento",
    "precioMensual": 29990,
    "precioAnual": 299900,
    "limiteSocios": 200,
    "limitePersonal": 15,
    "limiteSalas": 10,
    "limiteTurnos": 50,
    "caracteristicas": {
      "rutinas": true,
      "evolucionFisica": true,
      "checkin": true,
      "reportesAvanzados": true,
      "appPersonalizada": false,
      "soportePrioritario": false,
      "apiAcceso": false,
      "integraciones": true
    }
  },
  "statusCode": 200
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Plan no encontrado",
  "statusCode": 404
}
```

---

### GET `/api/saas/usage`

Obtiene estadísticas de uso del tenant actual (socios, personal, salas, turnos, check-ins).

**Auth:** ✅ Requiere token JWT + Rol `Administrador`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas",
  "data": {
    "sociosActivos": 45,
    "personalActivo": 8,
    "salasActivas": 3,
    "turnosActivos": 35,
    "checkinsMes": 234,
    "planVenceEn": "2026-01-30T00:00:00Z",
    "diasRestantes": 365,
    "porcentajeUsoSocios": 22.5,    // 45 de 200 máx
    "porcentajeUsoPersonal": 53.33  // 8 de 15 máx
  },
  "statusCode": 200
}
```

**Response Error (403 Forbidden) - Suscripción vencida:**
```json
{
  "success": false,
  "message": "La suscripción no está vigente",
  "statusCode": 403
}
```

---

### POST `/api/saas/cambiar-plan`

Cambia el plan SaaS del tenant (upgrade/downgrade).

**Auth:** ✅ Requiere token JWT + Rol `Administrador`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nuevoPlan": "int (requerido, valores: 1=Basic, 2=Standard, 3=Premium, 4=Enterprise)",
  "esAnual": "bool (default: false, si es true se aplica descuento anual)"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Plan cambiado correctamente",
  "statusCode": 200
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Plan inválido",
  "statusCode": 400
}
```

---

### GET `/api/saas/tiene-caracteristica/{caracteristica}`

Verifica si el tenant tiene acceso a una característica específica del plan SaaS.

**Auth:** ✅ Requiere token JWT + Rol `Administrador`

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
```
caracteristica: string (ej: "rutinas", "checkin", "apiAcceso", "reportesAvanzados", etc.)
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Característica: rutinas",
  "data": true,
  "statusCode": 200
}
```

**Características disponibles:**
- `rutinas`
- `evolucionFisica`
- `checkin`
- `reportesAvanzados`
- `appPersonalizada`
- `soportePrioritario`
- `apiAcceso`
- `integraciones`

---

## 4. ENDPOINTS DE CHECK-IN UNIFICADO

Base URL: `/api/checkins`

Sistema completo de control de asistencia con validación de suscripciones, horarios y cupos.

---

### GET `/api/checkins`

Obtiene todos los check-ins registrados.

**Auth:** ✅ Requiere token JWT + Roles `Administrador, Recepcion, Profesor`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Check-ins obtenidos",
  "data": [
    {
      "id": 1,
      "socioId": 5,
      "turnoPlantillaId": 10,
      "profesorId": 3,
      "observaciones": "Buena asistencia",
      "fechaHora": "2026-02-06T10:30:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### GET `/api/checkins/estadisticas`

Obtiene estadísticas de asistencia con filtros por periodo.

**Auth:** ✅ Requiere token JWT + Roles `Administrador, Recepcion, Profesor`

**Query Parameters:**
```
?dias=7           (default: 7, rango: 1-365)
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas correctamente",
  "data": {
    "periodo": {
      "desde": "2026-01-30T00:00:00Z",
      "hasta": "2026-02-06T00:00:00Z",
      "dias": 7
    },
    "totalCheckins": 150,
    "promedioDiario": 21.43,
    "checkinsPorDia": [
      { "dia": 1, "cantidad": 25 },
      { "dia": 2, "cantidad": 20 }
    ],
    "checkinsPorProfesor": [
      { "profesorId": 3, "profesorNombre": "Carlos", "cantidad": 50 }
    ],
    "topSocios": [
      { "socioId": 5, "socioNombre": "Juan Pérez", "cantidad": 6 }
    ]
  },
  "statusCode": 200
}
```

**Notas adicionales:**
- `checkinsPorDia`: Día 1=Lunes, 7=Domingo
- `topSocios`: Retorna los 5 socios con más check-ins en el periodo

---

### GET `/api/checkins/turnos-hoy/{socioId}`

Obtiene los turnos disponibles hoy para un socio (para check-in rápido).

**Auth:** ✅ Requiere token JWT + Roles `Administrador, Recepcion, Profesor`

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Turnos disponibles para hoy",
  "data": [
    {
      "id": 15,
      "turnoPlantillaId": 10,
      "turnoPlantilla": {
        "id": 10,
        "horaInicio": "08:00",
        "duracionMin": 60,
        "diaSemana": { "id": 1, "nombre": "Lunes" },
        "sala": { "id": 1, "nombre": "Sala de Pesas" },
        "personal": { "id": 3, "nombre": "Carlos" }
      },
      "suscripcion": {
        "id": 5,
        "socio": { "id": 10, "nombre": "Juan Pérez", "email": "juan@gmail.com" }
      }
    }
  ],
  "statusCode": 200
}
```

**Notas adicionales:**
- Solo retorna turnos donde el socio **NO** ha hecho check-in hoy
- Valida suscripción activa del socio
- Útil para check-in manual o con QR

---

### GET `/api/checkins/clases-dia`

Obtiene las clases del día con lista de alumnos y estado de check-in.

**Auth:** ✅ Requiere token JWT + Roles `Administrador, Recepcion, Profesor`

**Comportamiento por rol:**
- **Profesor**: Solo ve sus clases asignadas
- **Admin/Recepcion**: Ve todas las clases del día

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Clases del día obtenidas correctamente",
  "data": [
    {
      "turnoPlantillaId": 10,
      "horaInicio": "08:00",
      "duracionMin": 60,
      "sala": {
        "id": 1,
        "nombre": "Sala de Pesas",
        "cupoTotal": 20
      },
      "diaSemana": { "id": 1, "nombre": "Lunes" },
      "personal": { "id": 3, "nombre": "Carlos" },
      "totalInscriptos": 15,
      "totalCheckins": 5,
      "alumnos": [
        {
          "socioId": 10,
          "socioNombre": "Juan Pérez",
          "suscripcionTurnoId": 15,
          "checkinHecho": false,
          "edad": 28,
          "peso": 75.5,
          "altura": 175,
          "avatarUrl": "/images/user.png"
        }
      ]
    }
  ],
  "statusCode": 200
}
```

**Notas adicionales:**
- `edad`: Calculada automáticamente desde fecha de nacimiento
- `peso` y `altura`: Última medición registrada
- `checkinHecho`: `true` si el socio ya hizo check-in hoy
- Usa zona horaria de Argentina

---

### GET `/api/checkins/socio-checkins/{socioId}`

Obtiene el historial de check-ins de un socio.

**Auth:** ✅ Requiere token JWT

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Check-ins del socio 10",
  "data": [
    {
      "id": 1,
      "socioId": 10,
      "turnoPlantillaId": 10,
      "profesorId": 3,
      "observaciones": null,
      "fechaHora": "2026-02-06T10:30:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### GET `/api/checkins/turno/{turnoId}`

Obtiene los check-ins de un turno específico.

**Auth:** ✅ Requiere token JWT + Roles `Administrador, Recepcion, Profesor`

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Check-ins del turno 10",
  "data": [
    {
      "id": 1,
      "socioId": 10,
      "turnoPlantillaId": 10,
      "profesorId": 3,
      "observaciones": "Buena asistencia",
      "fechaHora": "2026-02-06T10:30:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### GET `/api/checkins/socio/{socioId:int}/rutinas`

Obtiene las últimas 5 rutinas asignadas a un socio.

**Auth:** ✅ Requiere token JWT + Roles `Administrador, Recepcion, Profesor`

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Rutinas obtenidas correctamente",
  "data": [
    {
      "rutinaId": 5,
      "rutinaNombre": "Rutina Principiante Nivel 1",
      "rutinaObjetivo": "Desarrollo de fuerza básica",
      "profesorNombre": "Carlos",
      "rutinaPersonalId": 3,
      "turnoAsignado": {
        "dia": "Lunes",
        "hora": "08:00"
      },
      "fechaAsignacion": "2026-01-15T00:00:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### GET `/api/checkins/{id}`

Obtiene un check-in por ID.

**Auth:** ✅ Requiere token JWT

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Check-in encontrado",
  "data": {
    "id": 1,
    "socioId": 10,
    "turnoPlantillaId": 10,
    "profesorId": 3,
    "observaciones": "Buena asistencia",
    "fechaHora": "2026-02-06T10:30:00Z"
  },
  "statusCode": 200
}
```

---

### POST `/api/checkins`

Registra un nuevo check-in con validaciones completas.

**Auth:** ✅ Requiere token JWT

**Request Body:**
```json
{
  "socioId": "int (requerido)",
  "turnoPlantillaId": "int (requerido)",
  "profesorId": "int? (opcional, se usa el del turno si no se envía)",
  "observaciones": "string? (opcional)"
}
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "message": "Check-in registrado correctamente",
  "data": {
    "id": 25,
    "mensaje": "Check-in registrado correctamente"
  },
  "statusCode": 201
}
```

**Response Error (400 Bad Request) - Validaciones:**
```json
{
  "success": false,
  "message": "Este turno es para Martes y hoy es Miércoles",
  "statusCode": 400
}
```

```json
{
  "success": false,
  "message": "Check-in fuera de horario. El turno es a las 08:00. Podes hacer check-in desde 06:00 hasta 09:00.",
  "statusCode": 400
}
```

```json
{
  "success": false,
  "message": "El socio no tiene este turno asignado o su suscripción está inactiva",
  "statusCode": 400
}
```

**Response Error (409 Conflict) - Check-in duplicado:**
```json
{
  "success": false,
  "message": "El check-in ya fue registrado para hoy",
  "statusCode": 409
}
```

**Validaciones realizadas:**
1. ✅ Socio existe
2. ✅ Turno existe y corresponde al día de hoy
3. ✅ Ventana horaria: **2 horas antes** hasta **1 hora después** del inicio del turno
4. ✅ Socio tiene el turno asignado
5. ✅ Suscripción activa (no vencida)
6. ✅ No hay check-in previo hoy para este turno

---

### PATCH `/api/checkins/{id}`

Actualiza las observaciones o profesor de un check-in.

**Auth:** ✅ Requiere token JWT + Roles `Administrador, Recepcion, Profesor`

**Request Body:**
```json
{
  "profesorId": "int? (opcional)",
  "observaciones": "string? (opcional)"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Check-in actualizado correctamente",
  "statusCode": 200
}
```

---

### DELETE `/api/checkins/{id}`

Elimina un check-in (solo administradores).

**Auth:** ✅ Requiere token JWT + Rol `Administrador`

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Check-in eliminado correctamente",
  "statusCode": 200
}
```

---

### GET `/api/checkins/debug-socio/{socioId}`

Endpoint de diagnóstico para verificar datos crudos de un socio.

**Auth:** ✅ Requiere token JWT + Roles `Administrador, Recepcion, Profesor`

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Datos de diagnóstico del socio",
  "data": {
    "socioId": 10,
    "nombre": "Juan Pérez",
    "fechaNacimientoRaw": "1997-05-15T00:00:00.0000000",
    "fechaNacimientoHasValue": true,
    "edadCalculada": 28,
    "avatarUrl": "/images/user.png"
  },
  "statusCode": 200
}
```

**Notas adicionales:**
- Útil para debugging de cálculos de edad y avatares
- Muestra fecha de nacimiento en formato ISO 8601 completo

---

## 5. ENDPOINTS DE RENOVACIONES

Base URL: `/api/renovaciones`

Sistema completo de renovación de suscripciones con integración Mercado Pago.

---

### POST `/api/renovaciones/iniciar`

Inicia una renovación de suscripción (manual o Mercado Pago).

**Auth:** ✅ Requiere token JWT + Rol `Socio`

**Request Body:**
```json
{
  "suscripcionId": "int (requerido)",
  "planId": "int? (opcional, null = mismo plan)",
  "metodoPago": "string (requerido, valores: 'Manual', 'MercadoPago')"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Renovación iniciada correctamente",
  "data": {
    "id": 10,
    "suscripcionId": 5,
    "planId": 2,
    "monto": 29990,
    "estado": "Iniciada",
    "metodoPago": "MercadoPago",
    "preferenciaMp": {
      "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789",
      "preferenceId": "123456789"
    }
  },
  "statusCode": 200
}
```

**Notas adicionales:**
- Si `metodoPago = "MercadoPago"`, devuelve `preferenciaMp` con link de pago
- Si `metodoPago = "Manual"`, se debe cargar comprobante manualmente
- `planId`: Si es `null`, se mantiene el mismo plan de la suscripción actual

---

### POST `/api/renovaciones/{id}/procesar-pago`

Procesa el pago de una renovación (para pagos manuales aprobados por admin).

**Auth:** ✅ Requiere token JWT + Rol `Socio`

**Request Body:**
```json
{
  "paymentId": "string (requerido, ID del pago en Mercado Pago)"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Pago procesado y suscripción renovada correctamente",
  "data": {
    "suscripcionId": 6,
    "nuevoVencimiento": "2026-03-06T00:00:00Z"
  },
  "statusCode": 200
}
```

---

### GET `/api/renovaciones/historial`

Obtiene el historial de renovaciones del socio autenticado.

**Auth:** ✅ Requiere token JWT + Rol `Socio`

**Query Parameters:**
```
?page=1           (default: 1)
&pageSize=10      (default: 10)
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "fechaRenovacion": "2026-02-01T00:00:00Z",
        "planAnterior": "Plan Estándar 5 días",
        "planNuevo": "Plan Estándar 5 días",
        "monto": 29990,
        "metodoPago": "MercadoPago",
        "estado": "Pagada"
      }
    ],
    "totalItems": 15,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  },
  "statusCode": 200
}
```

---

### POST `/api/renovaciones/configurar-automatica`

Configura la renovación automática con tarjeta guardada.

**Auth:** ✅ Requiere token JWT + Rol `Socio`

**Request Body:**
```json
{
  "suscripcionId": "int (requerido)",
  "tokenTarjeta": "string (requerido, token de Mercado Pago)",
  "ultimos4Digitos": "string (requerido, ej: '1234')"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Renovación automática configurada correctamente",
  "data": {
    "id": 5,
    "suscripcionId": 10,
    "tokenTarjeta": "abc123...",
    "ultimos4Digitos": "1234",
    "activa": true
  },
  "statusCode": 200
}
```

**Notas adicionales:**
- El token de tarjeta se obtiene del SDK de Mercado Pago frontend
- Los últimos 4 dígitos son para mostrar al usuario (no es el número completo)

---

### DELETE `/api/renovaciones/{id}`

Cancela una renovación pendiente.

**Auth:** ✅ Requiere token JWT + Rol `Socio`

**Response Success (200 OK):**
```json
{
  "message": "Renovación cancelada exitosamente."
}
```

---

### POST `/api/renovaciones/webhook`

**Webhook público para Mercado Pago** - Procesa notificaciones de pago automáticas.

**Auth:** ❌ Público (no requiere autenticación)

**Request Body:**
```json
{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

**Response Success (200 OK):**
```json
{
  "message": "Pago procesado exitosamente",
  "renovacionId": 10
}
```

**Notas adicionales:**
- Mercado Pago llama a este endpoint cuando un pago es aprobado
- El sistema busca la renovación por `paymentId` y procesa el pago automáticamente
- Configurar URL en [Mercado Pago Developers](https://mercadopago.com/developers)
- URL de producción: `https://tu-dominio.com/api/renovaciones/webhook`

**Estados de renovación:**
| Estado | Descripción |
|--------|-------------|
| **Iniciada** | Renovación creada, esperando pago |
| **Pagada** | Pago exitoso, suscripción creada |
| **Fallida** | Pago rechazado |
| **Cancelada** | Cancelada por el socio |
| **Completada** | Proceso finalizado |

---

## 6. INFORMACIÓN ADICIONAL

### 4.1 Autenticación/Autorización

**¿Cómo se envía el token?**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Formato del token:**
- **Tipo**: JWT (JSON Web Token)
- **Algoritmo**: HS256 (HMAC-SHA256)
- **Codificación**: Base64URL

**Duración de la sesión:**
- **24 horas** (configurable en `appsettings.json` → `Jwt:ExpirationInHours`)

**¿Hay refresh token?**
❌ **NO IMPLEMENTADO** - El sistema no utiliza refresh tokens. Cuando expire el JWT (24 horas), el usuario debe hacer login nuevamente.

---

### 4.2 Estructura del JWT

El token JWT contiene los siguientes **claims**:

```json
{
  "sub": "1",                    // User ID
  "email": "admin@gym.com",      // User email
  "jti": "a1b2c3d4-e5f6-7890",  // JWT ID (GUID único)
  "tenant_id": "1",              // Tenant ID
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Admin",  // Rol
  "alias": "Admin",              // User alias (opcional)
  "exp": 1738286400,             // Expiration timestamp (Unix)
  "iss": "GymSaasAPI",           // Issuer
  "aud": "GymSaasFrontend"       // Audience
}
```

**Claims estándar JWT:**
- `sub` (Subject): User ID
- `email`: User email
- `jti` (JWT ID): Unique token identifier
- `exp` (Expiration): Timestamp cuando expira
- `iss` (Issuer): Quién emitió el token
- `aud` (Audience): Para quién es el token

**Claims personalizados:**
- `tenant_id`: Tenant del usuario
- `alias`: Nombre público del usuario
- `role`: Rol del usuario (Admin, Profesor, Recepcion, Socio)

---

### 4.3 Headers requeridos

**Para endpoints autenticados:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Para endpoints públicos:**
```
Content-Type: application/json
```

**Header opcional (fallback para tenant):**
```
X-Tenant-Id: 1
```
> Nota: Normalmente el `tenant_id` se extrae del JWT, pero el sistema puede usar `X-Tenant-Id` como fallback en algunos casos.

---

### 4.4 Base URL

| Ambiente | URL |
|----------|-----|
| **Desarrollo** | `http://localhost:5144` |
| **Swagger UI** | `http://localhost:5144/swagger` |
| **Producción** | *Configurar en deployment* |

**Frontend URL** (configurable en `appsettings.json`):
```
FrontendUrl: http://localhost:5173
```

---

### 4.5 Manejo de Errores

**Formato estándar de respuesta:**

```json
{
  "success": false,
  "message": "Mensaje descriptivo del error",
  "errors": [
    "Error específico 1",
    "Error específico 2"
  ],
  "statusCode": 400,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

**Códigos de estado HTTP comunes:**

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| **200** | OK | Login exitoso |
| **201** | Created | Gimnasio registrado |
| **400** | Bad Request | Datos inválidos, credenciales incorrectas |
| **403** | Forbidden | Usuario desactivado, suscripción vencida |
| **404** | Not Found | Usuario/plan no encontrado |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Error del servidor |

---

### 4.6 Validaciones de Registro

**Email:**
- ✅ Formato válido (validación con `System.Net.Mail.MailAddress`)
- ✅ Único globalmente (no puede existir en otro tenant)
- ✅ Normalizado a minúsculas y sin espacios

**Password:**
- ✅ Mínimo **6 caracteres**
- ✅ Hasheado con **BCrypt** (work factor automático)
- ❌ NO requiere mayúsculas, números o caracteres especiales

**Nombre del gimnasio:**
- ✅ Requerido
- ✅ Se genera slug automáticamente si no se proporciona
- ✅ Caracteres permitidos: letras, números, guiones

**Slug (subdominio):**
- ✅ Debe ser único globalmente
- ✅ Generado automáticamente: `{nombre}-{6-char-guid}`
- ✅ Convierte acentos (á→a, é→e, í→i, ó→o, ú→u, ñ→n)

**Teléfono:**
- ✅ Opcional
- ✅ Sin validación de formato específico

---

### 4.7 Flujo OAuth

❌ **NO IMPLEMENTADO** - El sistema no tiene OAuth (Google, Facebook, etc.).

Solo utiliza autenticación local con email/password + JWT.

---

### 4.8 Middleware/Autenticación

**Pipeline de middleware (orden de ejecución):**

1. **CORS** (`UseCors`)
   - Permite requests desde `FrontendUrl` configurado
   - Habilita credentials (cookies, headers)

2. **Rate Limiting** (`UseRateLimit`)
   - Login: 5 intentos/minuto
   - Forgot Password: 3 solicitudes/5 minutos

3. **Authentication** (`UseAuthentication`)
   - Valida token JWT con `JwtBearerMiddleware`
   - Extrae claims del token

4. **Tenant Middleware** (`UseTenantMiddleware`)
   - Extrae `tenant_id` del claim JWT
   - Lo almacena en contexto para repositories

5. **SaaS Plan Middleware** (`UsePlanSaaSMiddleware`)
   - Valida suscripción vigente
   - Verifica límites (socios, personal, salas)
   - Valida acceso a características del plan
   - **Super Tenant (ID=1)**: Sin límites

6. **Authorization** (`UseAuthorization`)
   - Valida roles (`[Authorize(Roles="Admin")]`)

7. **Static Files** (`UseStaticFiles`)
   - Sirve avatares, comprobantes, etc.

8. **Controllers** (`MapControllers`)
   - Ejecuta endpoints

**Endpoints que requieren autenticación:**
- Todos EXCEPTO: `/api/auth/*` y `/api/saas/registro`, `/api/saas/planes`

**Endpoints públicos (sin auth):**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/saas/registro`
- `GET /api/saas/planes`

**Roles implementados:**
| Rol | ID | Permisos |
|-----|----|----------|
| **Admin** | 1 | Acceso total (usuarios, configuración, reportes) |
| **Profesor** | 2 | Rutinas, ejercicios, evolución física |
| **Recepcion** | 3 | Check-in, socios, pagos |
| **Socio** | 4 | Ver turnos, rutinas asignadas, evolución propia |

---

## 7. EJEMPLOS DE FLUJOS COMPLETOS

### Flujo de Registro + Login

1. **Usuario completa formulario de registro**
   ```http
   POST /api/auth/register
   Content-Type: application/json

   {
     "email": "nuevo-socio@gym.com",
     "alias": "Juan Perez",
     "password": "password123"
   }
   ```

2. **Respuesta del registro**
   ```json
   {
     "success": true,
     "message": "Usuario registrado correctamente. Ya puedes iniciar sesión."
   }
   ```
   > ❌ NO devuelve token - requiere login explícito

3. **Usuario hace login**
   ```http
   POST /api/auth/login
   Content-Type: application/json

   {
     "email": "nuevo-socio@gym.com",
     "password": "password123"
   }
   ```

4. **Respuesta con token JWT**
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "usuario": {
         "id": 10,
         "email": "nuevo-socio@gym.com",
         "alias": "Juan Perez",
         "rol": "Socio",
         "tenantId": 1,
         "socioId": null,
         "personalId": null
       }
     }
   }
   ```

5. **Frontend guarda token**
   ```javascript
   localStorage.setItem('token', response.data.token);
   localStorage.setItem('user', JSON.stringify(response.data.usuario));
   ```

6. **Siguientes requests incluyen token**
   ```javascript
   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   ```

---

### Flujo de Registro de Gimnasio SaaS (Onboarding)

1. **Usuario completa formulario de registro de gimnasio**
   ```http
   POST /api/saas/registro
   Content-Type: application/json

   {
     "nombreGimnasio": "PowerGym",
     "emailAdmin": "dueño@powergym.com",
     "password": "admin123",
     "nombreAdmin": "Carlos Dueño",
     "telefono": "+54 11 1234-5678",
     "direccion": "Av. Corrientes 1234, CABA",
     "planSaasId": 2,
     "esAnual": false
   }
   ```

2. **Sistema crea (en transacción):**
   - Tenant `PowerGym` con slug `powergym-a1b2c3`
   - Personal `Carlos Dueño`
   - Usuario Admin con email `dueño@powergym.com`
   - 3 planes iniciales de ejemplo
   - Plan vence en 1 mes

3. **Respuesta con token JWT (login automático)**
   ```json
   {
     "success": true,
     "data": {
       "tenantId": 5,
       "adminId": 25,
       "email": "dueño@powergym.com",
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "nombreGimnasio": "PowerGym",
       "planAsignado": "Standard",
       "planVenceEn": "2026-02-28T00:00:00Z",
       "mensaje": "¡Bienvenido Carlos! Tu gimnasio 'PowerGym' ha sido registrado exitosamente."
     }
   }
   ```

4. **Frontend guarda datos y redirige al dashboard**
   ```javascript
   localStorage.setItem('token', response.data.token);
   localStorage.setItem('tenantId', response.data.tenantId);
   localStorage.setItem('gymName', response.data.nombreGimnasio);
   // Redirigir a /dashboard
   ```

---

### Flujo de Recuperación de Contraseña

1. **Usuario solicita recuperación**
   ```http
   POST /api/auth/forgot-password
   Content-Type: application/json

   {
     "email": "usuario@gym.com"
   }
   ```

2. **Sistema:**
   - Genera token GUID (32 caracteres)
   - Guarda en tabla `password_reset_tokens` con expiración 1 hora
   - Envía email con link `{FrontendUrl}/reset-password?token={token}`

3. **Usuario recibe email y click en link**
   ```
   http://localhost:5173/reset-password?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

4. **Frontend muestra formulario para nueva contraseña**
   ```http
   POST /api/auth/reset-password
   Content-Type: application/json

   {
     "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
     "newPassword": "nuevaPassword123"
   }
   ```

5. **Sistema:**
   - Valida token existe y no expiró
   - Actualiza password hash del usuario
   - Elimina token (single-use)
   - Devuelve éxito

6. **Usuario puede hacer login con nueva contraseña**
   ```http
   POST /api/auth/login
   {
     "email": "usuario@gym.com",
     "password": "nuevaPassword123"
   }
   ```

---

## 8. DATOS DE PRUEBA

### Usuarios de prueba (semilla en `DatabaseSeeder`)

| Rol | Email | Password | TenantId | Notas |
|-----|-------|----------|----------|-------|
| **Administrador** | `admin@gym.com` | `admin123` | 1 | Super admin, sin límites |
| **Recepcionista** | `rece@gym.com` | `rece123` | 1 | Puede hacer check-ins |
| **Socio** | `socio@gym.com` | `socio123` | 1 | Usuario miembro |
| **Profesor** | `profe@gym.com` | `profe123` | 1 | Puede crear rutinas |

### Tenants de prueba

| TenantId | Nombre | Slug | Plan | Estado |
|----------|--------|------|------|--------|
| 1 | Tenant Default | `default` | Enterprise | Activo |
| 2+ | *Creados en runtime* | *autogenerado* | *Variable* | Activo |

### Planes SaaS disponibles

| ID | Nombre | Precio Mensual | Precio Anual | Max Socios |
|----|--------|----------------|--------------|------------|
| 1 | **Basic** | $14.995 | $149.950 | 50 |
| 2 | **Standard** | $29.990 | $299.900 | 200 |
| 3 | **Premium** | $79.990 | $799.900 | 500 |
| 4 | **Enterprise** | $199.990 | $1.999.900 | 0 (Ilimitado) |

### Rol IDs

| ID | Nombre |
|----|--------|
| 1 | Admin |
| 2 | Profesor |
| 3 | Recepcion |
| 4 | Socio |

---

## Apéndice A: Enums y Constantes

### PlanSaaSEnum

```csharp
public enum PlanSaaSEnum
{
    Basic = 1,      // Basic
    Standard = 2,   // Standard
    Premium = 3,    // Premium
    Enterprise = 4  // Enterprise
}
```

### Características de Plan

```csharp
// Validaciones en PlanSaaSMiddleware
- TieneRutinas
- TieneEvolucionFisica
- TieneCheckin
- TieneReportesAvanzados
- TieneAppPersonalizada
- TieneSoportePrioritario
- TieneApiAcceso
- TieneIntegraciones
```

---

## Apéndice B: Configuración

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=gym_saas;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Key": "tu-clave-secreta-minimo-32-caracteres-segura",
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
  }
}
```

---

## Apéndice C: Endpoints NO Implementados

| Endpoint | Estado | Nota |
|----------|--------|------|
| `GET /api/auth/me` | ❌ NO IMPLEMENTADO | Usar claims del JWT |
| `POST /api/auth/logout` | ❌ NO IMPLEMENTADO | JWT stateless - eliminar del cliente |
| `POST /api/auth/refresh` | ❌ NO IMPLEMENTADO | No hay refresh tokens |
| `GET /api/tenants` | ❌ NO IMPLEMENTADO | Usar `/api/saas/plan-actual` |
| `GET /api/tenants/{id}` | ❌ NO IMPLEMENTADO | - |
| `PUT /api/tenants/{id}` | ❌ NO IMPLEMENTADO | - |
| `DELETE /api/tenants/{id}` | ❌ NO IMPLEMENTADO | - |
| `GET /api/saas/historial-pagos` | ❌ NO IMPLEMENTADO | - |
| OAuth (Google/Facebook) | ❌ NO IMPLEMENTADO | Solo email/password |

---

## Referencias

- **Backend**: .NET 9.0, ASP.NET Core, EF Core 9.0
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT Bearer (HS256)
- **Password Hashing**: BCrypt.Net
- **Frontend**: React 18.3.1, Vite 5.4.8
- **Documentación API**: Swagger UI en `/swagger`

---

**Documento generado**: 2025-01-30
**Versión de la API**: 1.0.0
**Última actualización**: v1.0
