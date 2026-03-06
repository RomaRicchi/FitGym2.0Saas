# 🏋️‍♂️ GymSaaS - Sistema de Gestión para Gimnasios

[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/download/dotnet/9.0)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-Academic-green.svg)](LICENSE)

> **Plataforma SaaS multi-tenant para la gestión integral de gimnasios con turnos fijos, pagos automatizados y control de asistencia.**

## 📚 Documentación del Proyecto

**Toda la documentación está organizada en la carpeta `context/`:**

### 📖 Para Usuarios del Sistema (No Técnica)
**[Manual de Usuario](context/MANUAL_USUARIO.md)**
- ⭐ **Guía de Configuración Inicial** - Paso a paso para primeras instalaciones
- Guía completa de uso del sistema
- Procedimientos de gestión diaria
- Flujos de negocio (renovaciones, check-in, pagos)
- Solución de problemas
- Tips y atajos de teclado

### 🔧 Para Desarrolladores (Técnica)
**[Documentación Técnica](context/DOCUMENTACION_TECNICA.md)**
- Arquitectura del sistema (Clean Architecture + DDD)
- Patrones de diseño (Repository, Unit of Work)
- Comandos de desarrollo (backend y frontend)
- Configuración técnica y dependencias
- API endpoints y estructura de base de datos
- Sistema de multi-tenancia y SaaS
- Implementación de RBAC (Roles y Permisos)

### 📋 Otros Documentos Técnicos
- **[Descripción del Producto](context/DESCRIPCION_PRODUCTO.md)** - Visión general del sistema
- **[API Endpoints](context/API_ENDPOINTS.md)** - Referencia completa de endpoints
- **[Panel Frontend](context/PANEL_FRONTEND.md)** - Componentes y vistas React
- **[SaaS Implementado](context/SaaS_IMPLEMENTADO.md)** - Sistema de suscripción multi-tenant
- **[Changelog](context/CHANGELOG.md)** - Historial de cambios y versiones
- **[Despliegue](context/DESPLEGUE.md)** - Guía de deployment en producción

---

## 📘 Descripción General

**GymSaaS** es una plataforma **multi-tenant SaaS** para la gestión integral de gimnasios con turnos fijos. Desarrollada con **ASP.NET Core 9.0** (C#) y **React + Vite**, permite administrar **socios, profesores, planes, rutinas, turnos y pagos** con autenticación por roles, subida de archivos, comunicación API segura e **integración con MercadoPago** para procesamiento de pagos y suscripciones automáticas.

## ✨ Características Destacadas

### 🏢 Multi-Tenancy SaaS
- Registro completo de gimnasios
- Aislamiento total de datos por tenant
- Escalabilidad para múltiples clientes
- Base de datos dedicada por gimnasio

### 💳 Pagos Automatizados
- Integración con **MercadoPago**
- Checkout Pro para primer pago ($14.995 Plan Basic)
- PreApproval para renovaciones automáticas cada 30 días
- Webhooks para notificaciones en tiempo real
- Historial completo de transacciones
- Cambio de plan con prorrateo

### 👥 Gestión Completa
- Socios con fotos y seguimiento
- Profesores y rutinas personalizadas
- Turnos fijos con control de cupos
- Check-in con validación de suscripción
- Planes y suscripciones flexibles

### 🔐 Seguridad Avanzada
- Autenticación JWT
- Autorización por roles (RBAC)
- Middleware de tenant
- Protección de endpoints por rol

### 📊 Dashboard Administrativo
- Métricas en tiempo real
- Gráficos de ingresos y asistencias
- Panel de control del gimnasio
- Reportes financieros

---

## 🎯 Flujo Principal del Sistema

### 1️⃣ Registro del Socio
```
Nuevo Socio → Datos Personales → Avatar → Registro en BD
Estado: Activo (sin suscripción)
```

### 2️⃣ Selección del Plan
```
Elegir Plan → Generar Orden de Pago
├── Estado: Pendiente
├── Monto: Según plan elegido
└── Vence: fecha_actual + 30 días
```

### 3️⃣ Proceso de Pago
```
Opción A: MercadoPago (Automático)
  Checkout Pro → Pago → Webhook → Aprobado ✅

Opción B: Manual
  Subir Comprobante → Revisión Admin → Aprobación ✅
```

### 4️⃣ Activación de Suscripción
```
Orden Aprobada → Crear Suscripción
├── Inicio: fecha actual
├── Fin: inicio + duración plan
└── Estado: Activa ✅
```

### 5️⃣ Reserva de Turnos
```
Socio Activo → Elegir Turno → Validar Cupos
└── Confirmar Reserva
```

### 6️⃣ Check-in
```
Presentación → Validar Suscripción → Validar Turno
└── Registrar Asistencia ✅
```

---

## ⚙️ Stack Tecnológico

### Backend
```
ASP.NET Core 9.0 (C#)
├── Entity Framework Core 9.0
├── PostgreSQL 16
├── JWT Authentication
├── MercadoPago SDK
└── Swagger/OpenAPI
```

### Frontend
```
React 18.3 + Vite 5.4
├── Tailwind CSS 3.4
├── Bootstrap 5.3
├── Axios (HTTP Client)
├── React Router
└── Context API
```

### Arquitectura
```
Clean Architecture + DDD
├── Domain Layer (Entidades)
├── Application Layer (DTOs, Servicios)
├── Infrastructure Layer (Repositorios, BD)
└── API Layer (Controladores, Middleware)
```

---

## 🧱 Estructura del Proyecto

```bash
GymSaaS/
├── src/
│   ├── Gym.Domain/          # Entidades y interfaces del dominio
│   ├── Gym.Application/     # DTOs y servicios de aplicación
│   ├── Gym.Infrastructure/ # Implementación concreta (BD, repositorios, seguridad)
│   └── Gym.API/            # Controladores, middleware, configuración
│
├── frontend/              # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/           # Cliente axios
│   │   ├── components/    # Componentes reutilizables
│   │   ├── views/         # Páginas de la aplicación
│   │   └── styles/        # Estilos globales
│   └── public/             # Archivos estáticos
│
├── context/               # Documentación del proyecto
│   ├── MANUAL_USUARIO.md
│   ├── DOCUMENTACION_TECNICA.md
│   ├── API_ENDPOINTS.md
│   └── ...
│
└── db/                     # Scripts SQL de base de datos
    └── gym_postgres.sql   # Schema completo
```

---

## 🧩 Estructura del Modelo de Datos

El sistema contiene más de 10 entidades relacionadas, cumpliendo con el requisito de "al menos 4 clases/tablas relacionadas con relación 1:N".

**Principales entidades:**
- `usuario` → maneja autenticación, roles y estado
- `socio` → datos del cliente del gimnasio
- `personal` → personal de entrenamiento
- `plan` → tipo de plan contratado (Basic, Standard, Premium)
- `suscripcion` → vínculo entre socio y plan
- `rutina_plantilla` → ejercicios predefinidos por profesor
- `ejercicio` → actividades con carga y repeticiones
- `comprobante` → archivo de comprobantes de pago
- `gimnasio` → información del gimnasio para SaaS
- `saas_mercadopago_subscription` → suscripciones de MercadoPago
- `historial_pago_saas` → historial de pagos del servicio SaaS

**Relaciones destacadas:**
- Un **plan** tiene muchos **socios**
- Un **socio** puede tener muchas **suscripciones**
- Un **personal** diseña muchas **rutinas**
- Una **rutina** contiene muchos **ejercicios**

---

## 💳 Funcionalidades SaaS y Pagos

### Integración con MercadoPago

El sistema implementa una integración completa con **MercadoPago** para gestionar pagos y suscripciones:

#### ✅ Funcionalidades Implementadas

1. **Registro de Gimnasio**
   - Formulario completo de registro con validación
   - Creación automática de tenant y base de datos
   - Usuario administrador generado automáticamente

2. **Primer Pago con Checkout Pro**
   - Plan Basic: $14.995 ARS
   - Checkout Pro de MercadoPago
   - Redirección automática tras el pago exitoso
   - Webhook para confirmación de pago

3. **Renovación Automática con PreApproval**
   - Suscripción recurrente cada 30 días
   - PreApproval de MercadoPago
   - Ciclo de facturación automático
   - Notificaciones de renovación

4. **Cambio de Plan**
   - Validación de cantidad de socios
   - PreApproval nuevo preservando el ciclo de facturación
   - Prorrateo de períodos
   - Actualización en tiempo real del panel

5. **Panel en Tiempo Real**
   - Estado de suscripción siempre actualizado
   - Historial de pagos completo
   - Información de Métodos de Pago
   - Gestión de ciclos de facturación

### Planes Disponibles

| Plan | Precio | Socios | Descripción |
|------|--------|--------|-------------|
| **Basic** | $14.995 | Hasta 50 | Ideal para gimnasios pequeños |
| **Standard** | $29.990 | Hasta 150 | Para gimnasios en crecimiento |
| **Premium** | $49.990 | Ilimitados | Para grandes cadenas |

---

## 🔐 Seguridad y Roles

El sistema implementa autenticación basada en **JWT (JSON Web Token)** y autorización por **roles**. Cada usuario tiene un rol que determina su acceso a las funcionalidades del sistema.

### Roles del Sistema

| Rol           | Email                  | Contraseña |
|---------------|------------------------|------------|
| Administrador | admin@gym.com          | admin123   |
| Profesor      | profe@gym.com          | profe123   |
| Recepcionista | rece@gym.com           | rece123    |
| Socio         | socio@gym.com          | socio123   |

### Matriz de Permisos

| Funcionalidad | Admin | Profesor | Recepcionista | Socio |
|---------------|-------|----------|---------------|-------|
| **Dashboard** | ✅ | ❌ | ❌ | ❌ |
| **Socios** | ✅ | 📖 | ✅ | 📖 |
| **Planes** | ✅ | 📖 | 📖 | 📖 |
| **Turnos** | ✅ | 📖 | ✅ | ❌ |
| **Rutinas** | ✅ | ✅ | ❌ | 📖 |
| **Check-ins** | ✅ | ✅ | ✅ | ❌ |
| **Pagos** | ✅ | ❌ | 📖 | ✅ |
| **Finanzas** | ✅ | ❌ | ❌ | ❌ |

**Leyenda:**
- ✅ = Acceso completo (CRUD)
- 📖 = Solo lectura
- ❌ = Sin acceso

---

## 🚀 Instrucciones de Ejecución

### 🔧 Backend (API)

```bash
cd src/Gym.API
dotnet restore
dotnet run
```

El API estará disponible en: **http://localhost:5144**
- Swagger UI: **http://localhost:5144/swagger**

### ⚛️ Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

### ⚙️ Configuración Requerida

Antes de iniciar, configura:

1. **Connection String** en `appsettings.json`
2. **MercadoPago Credenciales** (para pagos)
3. **JWT Settings** para autenticación

> 📖 Para configuración detallada, consulta la [Documentación Técnica](context/DOCUMENTACION_TECNICA.md)

---

## ✅ Funcionalidades Implementadas

### Core del Sistema
| # | Funcionalidad | Descripción |
|---|---------------|-------------|
| 1 | Multi-tenancia SaaS | Arquitectura multi-tenant con aislamiento de datos por gimnasio |
| 2 | Seguridad con JWT | Autenticación y autorización por roles con tokens JWT |
| 3 | MercadoPago Checkout Pro | Procesamiento de pagos iniciales de suscripción |
| 4 | MercadoPago PreApproval | Renovación automática cada 30 días |
| 5 | Cambio de Plan | Actualización de plan con validación de socios |
| 6 | Webhooks | Recepción y procesamiento de notificaciones de MercadoPago |
| 7 | ABM Completo | Gestión completa de socios, planes, profesores, rutinas, etc. |
| 8 | Check-in System | Control de asistencia con validación de suscripción |
| 9 | Turnos Fijos | Reserva y gestión de turnos por cupos |
| 10 | Paginación Real | Todos los listados implementan paginación del lado del servidor |
| 11 | Búsqueda AJAX | Búsqueda dinámica en selects y listados |
| 12 | Subida de Archivos | Avatares de usuario y comprobantes de pago |
| 13 | Dashboard Administrativo | Panel con métricas y gráficos en tiempo real |
| 14 | Historial de Pagos | Registro completo de transacciones SaaS |

---

## 👤 Autor y Colaboradores

**Desarrollado por:**

**Romanela Ricchiardi**
- 📧 [roma.ricchiardi@gmail.com](mailto:roma.ricchiardi@gmail.com)
- 💼 [GitHub](https://github.com/RomaRicchi) | [LinkedIn](https://linkedin.com/in/romanela-ricchiardi-885284118/)

**Colaborador:**
**Fermin Fernandez**

---

**Desarrollo por:** **Zinnia Code**

🏢 **Empresa de Desarrollo de Software**

---

**Proyecto Académico**
Laboratorio de Programación II .NET
Tecnicatura Universitaria en Desarrollo de Software
Universidad de La Punta (ULP)

---

## ⚠️ Importante

**Este repositorio es PRIVADO y no se hará público en su totalidad.**

El código fuente, configuraciones, archivos de entorno y documentación técnica detallada son propiedad exclusiva de **Zinnia Code** y los desarrolladores involucrados. Cualquier reproducción, distribución o uso no autorizado está prohibido.

Para consultas sobre el proyecto, contactar a:
- 📧 [romaela.ricchiardi@gmail.com](mailto:roma.ricchiardi@gmail.com)

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico y es propiedad de sus autores.

---

## 🙏 Agradecimientos

- Universidad de La Punta (ULP) por la formación académica
- Comunidad de desarrolladores .NET y React
- MercadoPago por la documentación y soporte técnico

---


## 🖥️ Vista del Sistema

<img width="1913" height="869" alt="image" src="https://github.com/user-attachments/assets/1e1b197c-4d4a-45c3-9736-2970085feec3" />
<img width="1895" height="880" alt="image" src="https://github.com/user-attachments/assets/923ab56c-114e-4bc4-8d8d-17583b5b3125" />
<img width="1913" height="860" alt="image" src="https://github.com/user-attachments/assets/2df13ed3-80c5-40a0-acd5-44c9ea2eca93" />
<img width="1906" height="868" alt="image" src="https://github.com/user-attachments/assets/41df292e-3eb8-4572-b8a6-f010a04d9f78" />
<img width="1906" height="866" alt="image" src="https://github.com/user-attachments/assets/094135b2-d838-47ad-800f-0842d7511d5b" />


