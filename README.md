# 🏋️‍♂️ Sistema de Gestión para Gimnasios por Turnos Fijos

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
- Audiencia: Administradores, Recepcionistas, Profesores, Socios

**⚠️ ¿Primera vez usando el sistema?**
Empieza por leer la [Guía de Configuración Inicial](context/MANUAL_USUARIO.md#-guía-de-configuración-inicial-del-sistema) - ¡Es obligatoria!

### 🔧 Para Desarrolladores (Técnica)
**[Documentación Técnica](context/DOCUMENTACION_TECNICA.md)**
- Arquitectura del sistema (Clean Architecture + DDD)
- Patrones de diseño (Repository, Unit of Work)
- Comandos de desarrollo (backend y frontend)
- Configuración técnica y dependencias
- API endpoints y estructura de base de datos
- Sistema de multi-tenancia y SaaS
- Implementación de RBAC (Roles y Permisos)
- Sistema de White-Label Branding

### 📋 Otros Documentos Técnicos
- **[Descripción del Producto](context/DESCRIPCION_PRODUCTO.md)** - Visión general del sistema
- **[API Endpoints](context/API_ENDPOINTS.md)** - Referencia completa de endpoints
- **[Panel Frontend](context/PANEL_FRONTEND.md)** - Componentes y vistas React
- **[SaaS Implementado](context/SaaS_IMPLEMENTADO.md)** - Sistema de suscripción multi-tenant
- **[Changelog](context/CHANGELOG.md)** - Historial de cambios y versiones
- **[Despliegue](context/DESPLEGUE.md)** - Guía de deployment en producción

---

## 📘 Descripción General

El sistema **Gym** es una aplicación web completa desarrollada con **ASP.NET Core 9.0** (C#) y **React + Vite** para la gestión integral de un gimnasio con turnos fijos.  
Permite administrar **socios, profesores, planes, rutinas, comprobantes y turnos**, con autenticación por roles, subida de archivos, y comunicación API segura.

---
## ⚙️ Camino Feliz Paso a Paso

1️⃣ Registro del socio

Se crea un registro en socio.

Queda activo, pero aún no tiene suscripción.

2️⃣ Elección del plan

Se elige un plan (plan_id).

El sistema genera automáticamente una orden de pago (orden_pago):

estado_id = Pendiente

monto = plan.precio

vence_en = fecha_actual + 30 días

3️⃣ Generación y gestión de orden de pago

La orden queda pendiente hasta su pago.

Los estados válidos:

Pendiente → creada sin pago.

Aprobada → validada manualmente o con comprobante.

Rechazada → comprobante inválido o vencido.

4️⃣ Adjuntar comprobante (opcional)

El socio o el admin sube un archivo (comprobante) vinculado por orden_pago_id.

El backend guarda el archivo en wwwroot/uploads/comprobantes.

5️⃣ Validación y aprobación del pago

El administrador revisa el comprobante o registra un pago en efectivo.

Cambia el estado_id de la orden a Aprobado.

Puede opcionalmente registrar fecha_pago.

6️⃣ Activación automática de la suscripción

El sistema crea una nueva suscripcion:

inicio = fecha actual

fin = inicio + duración del plan

estado = Activa

El socio ya puede acceder a los servicios del gimnasio.

7️⃣ Reserva de turnos

El socio puede reservar según los días permitidos del plan.

Se crean registros en orden_turno con validación de cupos y horario.

8️⃣ Check-in en el gimnasio

Se realiza check-in (checkin).

El sistema valida:

Que la suscripcion esté activa.

Que tenga turno reservado.

Se actualiza el registro de asistencia.

## 🧱 Arquitectura del Proyecto

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
├── db/                     # Scripts SQL de base de datos
│   └── gym_postgres.sql   # Schema completo
│
└── docs/                   # Documentación adicional
```
---
## ⚙️ Tecnologías utilizadas

| Capa | Tecnología |
|------|-------------|
| **Backend** | ASP.NET Core 9.0 (C#) |
| **Frontend** | React 18.3.1 + Vite 5.4.8 |
| **Base de datos** | PostgreSQL |
| **ORM** | Entity Framework Core 9.0 |
| **Autenticación** | JWT Bearer tokens |
| **Estilos** | Bootstrap 5.3.8 + Tailwind CSS 3.4.13 |
| **Documentación API** | Swagger/OpenAPI |
| **Arquitectura** | Clean Architecture + DDD |
| **Multi-tenancy** | SaaS (Software as a Service) |

---

## 🧩 Estructura del Modelo de Datos

El sistema contiene más de 10 entidades relacionadas, cumpliendo con el requisito de “al menos 4 clases/tablas relacionadas con relación 1:N”.

**Principales entidades:**
- `usuario` → maneja autenticación, roles y estado.
- `socio` → datos del cliente del gimnasio.
- `personal` → personal de entrenamiento.
- `plan` → tipo de plan contratado.
- `suscripcion` → vínculo entre socio y plan.
- `rutina_plantilla` → ejercicios predefinidos por profesor.
- `ejercicio` → actividades con carga y repeticiones.
- `comprobante` → archivo de comprobantes de pago.

**Relaciones destacadas:**
- Un **plan** tiene muchos **socios**.  
- Un **socio** puede tener muchas **suscripciones**.  
- Un **personal** diseña muchas **rutinas**.  
- Una **rutina** contiene muchos **ejercicios**.

---

## 🔐 Seguridad y Roles

El sistema implementa autenticación basada en **JWT (JSON Web Token)** y autorización por **roles**. Cada usuario tiene un rol que determina su acceso a las funcionalidades del sistema.

### Roles del Sistema

| Rol           | Email                  | Contraseña |
|---------------|------------------------|------------|
| Administrador | admin@gym.com          | admin123   |
| Profesor      | profe@gym.com           | profe123    |
| Recepcionista | rece@gym.com            | rece123     |
| Socio         | socio@gym.com            | socio123    |

### 📋 Matriz de Permisos por Rol

| Funcionalidad | Admin | Profesor | Recepcionista | Socio |
|---------------|-------|----------|---------------|-------|
| **Dashboard** |
| - Ver dashboard con gráficos | ✅ | ❌ | ❌ | ❌ |
| - Ver mensaje de bienvenida | - | ✅ | ✅ | ✅ |
| **Socios** |
| - Ver lista de socios | ✅ | 📖 | ✅ | 📖 |
| - Crear socio | ✅ | ❌ | ✅ | ❌ |
| - Editar socio | ✅ | ❌ | ✅ | ❌ |
| - Eliminar socio | ✅ | ❌ | ❌ | ❌ |
| - Ver su propio perfil | - | - | - | ✅ |
| **Personal/Profesores** |
| - Ver lista | ✅ | 📖 | 📖 | ❌ |
| - Crear profesor | ✅ | ❌ | ❌ | ❌ |
| - Editar profesor | ✅ | ❌ | ❌ | ❌ |
| - Eliminar profesor | ✅ | ❌ | ❌ | ❌ |
| **Planes** |
| - Ver lista | ✅ | 📖 | 📖 | 📖 |
| - Crear plan | ✅ | ❌ | ❌ | ❌ |
| - Editar plan | ✅ | ❌ | ❌ | ❌ |
| - Eliminar plan | ✅ | ❌ | ❌ | ❌ |
| **Suscripciones** |
| - Ver lista | ✅ | 📖 | ✅ | 📖 |
| - Ver suscripciones del socio | - | - | - | ✅ |
| - Crear suscripción | ✅ | ❌ | ✅ | ❌ |
| - Editar suscripción | ✅ | ❌ | ✅ | ❌ |
| - Eliminar suscripción | ✅ | ❌ | ❌ | ❌ |
| **Turnos Plantilla** |
| - Ver lista | ✅ | 📖 | ✅ | ❌ |
| - Crear turno | ✅ | ❌ | ✅ | ❌ |
| - Editar turno | ✅ | ❌ | ✅ | ❌ |
| - Eliminar turno | ✅ | ❌ | ❌ | ❌ |
| **Turnos Asignados** |
| - Ver sus turnos | - | ✅ | ❌ | ✅ |
| **Rutinas Plantilla** |
| - Ver lista | ✅ | 📖 | ❌ | 📖 |
| - Crear rutina | ✅ | ✅ | ❌ | ❌ |
| - Editar rutina | ✅ | ✅ | ❌ | ❌ |
| - Eliminar rutina | ✅ | ❌ | ❌ | ❌ |
| **Ejercicios** |
| - Ver lista | ✅ | 📖 | ❌ | 📖 |
| - Crear ejercicio | ✅ | ✅ | ❌ | ❌ |
| - Editar ejercicio | ✅ | ✅ | ❌ | ❌ |
| - Eliminar ejercicio | ✅ | ❌ | ❌ | ❌ |
| - Agregar imagen | ✅ | ✅ | ❌ | ❌ |
| **Grupos Musculares** |
| - Ver lista | ✅ | 📖 | ❌ | ❌ |
| - Crear grupo | ✅ | ✅ | ❌ | ❌ |
| - Editar grupo | ✅ | ✅ | ❌ | ❌ |
| - Eliminar grupo | ✅ | ❌ | ❌ | ❌ |
| **Salas** |
| - Ver lista | ✅ | 📖 | ✅ | 📖 |
| - Crear sala | ✅ | ❌ | ✅ | ❌ |
| - Editar sala | ✅ | ❌ | ✅ | ❌ |
| - Eliminar sala | ✅ | ❌ | ❌ | ❌ |
| **Check-ins** |
| - Ver lista | ✅ | 📖 | 📖 | ❌ |
| - Crear check-in | ✅ | ✅ | ✅ | ❌ |
| - Editar check-in | ✅ | ✅ | ✅ | ❌ |
| - Eliminar check-in | ✅ | ❌ | ❌ | ❌ |
| **Órdenes de Pago** |
| - Ver lista | ✅ | ❌ | 📖 | ✅ |
| - Crear orden de pago | ✅ | ❌ | ❌ | ✅ |
| - Ver sus propias órdenes | - | - | - | ✅ |
| **Estados de Órden Pago** |
| - Ver lista | ✅ | ❌ | 📖 | ❌ |
| - Cambiar estado | ✅ | ❌ | ✅ | ❌ |
| **Comprobantes** |
| - Ver lista | ✅ | ❌ | 📖 | ❌ |
| - Subir comprobante | ✅ | ❌ | ✅ | ❌ |
| - Eliminar comprobante | ✅ | ❌ | ❌ | ❌ |
| **Evolución Física** |
| - Ver lista | ✅ | 📖 | ❌ | 📖 |
| - Crear registro | ✅ | ❌ | ❌ | ✅ |
| - Editar registro | ✅ | ✅ | ❌ | ❌ |
| - Eliminar registro | ✅ | ❌ | ❌ | ❌ |
| **Perfil** |
| - Ver su propio perfil | ✅ | ✅ | ✅ | ✅ |
| - Editar su perfil | ✅ | ✅ | ✅ | ✅ |
| - Cambiar contraseña | ✅ | ✅ | ✅ | ✅ |
| - Cambiar avatar | ✅ | ✅ | ✅ | ✅ |
| **Usuarios del Sistema** |
| - Ver lista | ✅ | ❌ | ❌ | ❌ |
| - Crear usuario | ✅ | ❌ | ❌ | ❌ |
| - Editar usuario | ✅ | ❌ | ❌ | ❌ |
| - Eliminar usuario | ✅ | ❌ | ❌ | ❌ |
| **Finanzas** |
| - Ver reportes financieros | ✅ | ❌ | ❌ | ❌ |
| - Ver ingresos | ✅ | ❌ | ❌ | ❌ |
| - Ver egresos | ✅ | ❌ | ❌ | ❌ |

**Leyenda:**
- ✅ = Acceso completo (CRUD)
- 📖 = Solo lectura
- ❌ = Sin acceso

### Implementación Técnica

El modelo `Usuario` incluye:

```csharp
public string email { get; set; }
public string password_hash { get; set; }
public int rol_id { get; set; } // FK a tabla Rol
public bool estado { get; set; } // Activo/Inactivo
```

**Tokens JWT** incluyen claims:
- `sub`: ID del usuario
- `email`: Email del usuario
- `tenant_id`: ID del tenant (multi-tenancia)
- `role`: Nombre del rol
- `alias`: Alias del usuario

**Protección de endpoints** se realiza con atributos:

```csharp
[Authorize(Roles = "Administrador, Profesor")]
[HttpGet]
public async Task<IActionResult> GetAll() { ... }
```

🖼️ Manejo de Archivos

Implementado mediante los servicios:

- IFileStorage.cs

- LocalFileStorage.cs

Permite almacenar comprobantes o archivos relacionados.

Campo avatar_url en usuario (para imagen de perfil).

⚛️ CRUD React + AJAX

El frontend está desarrollado con React + Vite + Tailwind.
Usa peticiones AJAX (axios/fetch) al backend, logrando una interfaz dinámica y moderna.
Uno de los ABM (por ejemplo, Planes o Socios) cumple completamente el requisito de CRUD vía API.

📄 Paginación y Búsqueda

Paginado real: cada endpoint devuelve solo la página solicitada.

var socios = _context.Socios
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToList();

Búsqueda AJAX:
/api/socios/buscar?q=juan devuelve coincidencias dinámicamente (ideal para selects en el frontend).


🧪 Pruebas y Colección Postman

Iniciar el backend con: dotnet run 

Acceder a Swagger:
👉 http://localhost:5144/swagger


| Rol           | Email                  | Contraseña |
| ------------- | --------------------- | ---------- |
| Administrador | admin@gym.com          | admin123   |
| Profesor      | profe@gym.com           | profe123    |
| Recepcionista | rece@gym.com            | rece123     |
| Socio         | socio@gym.com            | socio123    |

## ✅ Cumplimiento de los Requerimientos

| # | Requisito | Implementado en / Descripción |
|---|------------|-------------------------------|
| 1 | 4+ clases/tablas con relación 1:N | `Socio`, `Plan`, `Suscripcion`, `Usuario`, `TurnoPlantilla` — relaciones gestionadas por EF Core |
| 2 | Seguridad con login y roles | JWT + `[Authorize(Roles="...")]` en controladores (`UsuariosController`, `PerfilController`) |
| 3 | Avatar en usuarios | Subida en `/perfil/{id}/avatar` + guardado en `/uploads/avatars` |
| 4 | Archivos adicionales | Subida de comprobantes (`OrdenPagoController`, `/uploads/comprobantes`) |
| 5 | ABM con React + AJAX | (en planes entre otras vistas) |
| 6 | Listados con paginado real | `SociosController`, `SuscripcionesController`, `UsuariosController` con `Skip()` / `Take()` |
| 7 | Selección con búsqueda AJAX | `Select2` / `react-select` en formularios (`Turnos`, `Suscripciones`) |
| 8 | API con JWT | Configurada en `Program.cs`, autenticación en todos los controladores |
| 9 | `.gitignore` | Incluye `/bin`, `/obj`, `/node_modules`, `/wwwroot/uploads` |
| 10 | Diagrama ER o de clases | Incluido en `Api/Context/` |
| 11 | README.md descriptivo | Este archivo 😉 |
| 12 | Usuarios por rol | Admin, Profesor y Socio definidos en tabla de ejemplo |
| 13 | Base de datos | Incluido en `Api/Context/` |
| 14 | Colección Postman | Incluido en `Api/Context/` |


🚀 Instrucciones de Ejecución
🔧 Backend
cd Gym/Api
  dotnet run

⚛️ Frontend
cd Gym/frontend
  npm run dev

o... cd Gym  
  .\start-gym.bat

Abrir en el navegador:
👉 http://localhost:5173

📘 Autor

Romanela Ricchiardi

Laboratorio de programacion II .NET

Tecnicatura Universitaria en Desarrollo de Software — Universidad de La Punta (ULP)

📧 roma.ricchiardi@gmail.com

💼 GitHub: [RomaRicchi](https://github.com/RomaRicchi)

## 🖥️ Vista del Sistema

<img width="1913" height="869" alt="image" src="https://github.com/user-attachments/assets/1e1b197c-4d4a-45c3-9736-2970085feec3" />
<img width="1895" height="880" alt="image" src="https://github.com/user-attachments/assets/923ab56c-114e-4bc4-8d8d-17583b5b3125" />
<img width="1913" height="860" alt="image" src="https://github.com/user-attachments/assets/2df13ed3-80c5-40a0-acd5-44c9ea2eca93" />
<img width="1906" height="868" alt="image" src="https://github.com/user-attachments/assets/41df292e-3eb8-4572-b8a6-f010a04d9f78" />
<img width="1906" height="866" alt="image" src="https://github.com/user-attachments/assets/094135b2-d838-47ad-800f-0842d7511d5b" />


