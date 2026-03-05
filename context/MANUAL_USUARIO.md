# 📖 Manual de Usuario - GymSaaS

**Este manual está diseñado para todos los usuarios del sistema** (administradores, recepcionistas, profesores y socios). No se requieren conocimientos técnicos para entenderlo.

---

## 🎯 ¿Qué es GymSaaS?

**GymSaaS** es un sistema completo que ayuda a gestionar tu gimnasio de manera fácil y organizada. Con este sistema puedes:

- ✅ Registrar y dar de alta a socios
- ✅ Crear planes de suscripción mensuales
- ✅ Asignar turnos horarios a los socios
- ✅ Diseñar rutinas de ejercicios personalizadas
- ✅ Controlar los pagos y comprobantes
- ✅ Registrar la asistencia con sistema QR
- ✅ Ver reportes de ingresos y egresos

### 👥 ¿Para quién es este manual?

Este manual es para:
- **👨‍💼 Administradores**: Quienes gestionan todo el sistema
- **📞 Recepcionistas**: Quienes atienden el día a día del gimnasio
-   **🏋️ Profesores**: Quienes diseñan rutinas y dirigen clases
-   **💪 Socios**: Las personas que entrenan en el gimnasio

---

## 📅 Versión del Sistema

**Fecha**: 26 de Febrero de 2026
**Versión**: 2.4
**Sistema**: GymSaaS - Sistema de Gestión de Gimnasios (Multi-Tenant SaaS)

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [🏢 GymSaaS como Sistema Multi-Tenant](#-gymsaas-como-sistema-multi-tenant)
3. [Integración con MercadoPago](#integración-con-mercadopago)
4. [🚀 Guía de Configuración Inicial](#-guía-de-configuración-inicial-del-sistema) ⭐ **PRIMERA LECTURA**
5. [Panel Socio](#panel-socio)
6. [Panel Administrador y Staff](#panel-administrador-y-staff)
   - [Dashboards por Rol](#dashboards-por-rol)
   - [Gestión](#gestión)
   - [Rutinas](#rutinas)
   - [Agenda](#agenda)
   - [Check-in y Asistencia](#check-in-y-asistencia)
   - [Instalaciones](#instalaciones)
   - [Pagos](#pagos)
   - [Usuarios](#usuarios)
   - [Finanzas](#finanzas)
7. [Solución de Problemas](#solución-de-problemas)
8. [Glosario](#glosario)

---

## Introducción

**GymSaaS** es un sistema completo de gestión de gimnasios que permite administrar socios, planes, suscripciones, turnos, rutinas, pagos y personal. El sistema está diseñado para gimnasios con turnos fijos y control de capacidad por sala.

### ⚠️ ¿Es tu primera vez usando el sistema?

Si eres **administrador** y acabas de instalar GymSaaS, **DEBES leer primero**:

👉 **[Guía de Configuración Inicial del Sistema](#-guía-de-configuración-inicial-del-sistema)**

Ahí encontrarás el paso a paso del orden correcto para configurar salas, personal, planes, turnos y socios. Si no sigues ese orden, el sistema no funcionará correctamente.

---

### Características Principales

- ✅ **Gestión de socios** con datos personales y evolución física
- ✅ **Planes y suscripciones** mensuales renovables
- ✅ **Turnos fijos** con control de cupo por sala
- ✅ **Rutinas de ejercicios** asignadas por profesores
- ✅ **Control de pagos** con comprobantes y estados
- ✅ **Gestión financiera** con egresos y reportes
- ✅ **Multi-tenant SaaS** (soporta múltiples gimnasios con planes)
- ✅ **Sistema de Check-in** con QR y manual
- ✅ **Integración Mercado Pago** para pagos online
- ✅ **Renovación automática** de suscripciones
- ✅ **Dashboards especializados** por rol

---

## 🏢 GymSaaS como Sistema Multi-Tenant

### ¿Qué significa Multi-Tenant?

GymSaaS es un sistema **SaaS (Software as a Service)** que permite gestionar **múltiples gimnasios** de forma independiente. Cada gimnasio se llama **"Tenant"** y tiene sus propios datos aislados.

### Planes de Suscripción SaaS

GymSaaS ofrece **4 planes de suscripción** con diferentes límites y características:

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

### Super Tenant

El **Tenant ID 1** es el "Super Tenant" - es la cuenta del dueño del sistema GymSaaS con acceso ilimitado a todas las funcionalidades.

### Aislamiento de Datos

- 🔒 Cada gimnasio (tenant) tiene sus datos **completamente aislados**
- 🔒 Los socios de un gimnasio NO pueden ver datos de otro gimnasio
- 🔒 Cada gimnasio tiene su propia cuenta de MercadoPago
- 🔒 Los filtros se aplican automáticamente por tenant

---

## Integración con MercadoPago

### Concepto Importante

**Cada gimnasio tiene SU PROPIA cuenta de MercadoPago.** Los pagos de los socios llegan directamente a la cuenta del dueño del gimnasio, sin intermediarios.

### Configurar MercadoPago (Solo Super Tenant)

**Ubicación**: Configuración → Integraciones → MercadoPago

Esta sección está disponible **solo para Super Tenant** (los desarrolladores/configuradores del sistema).

#### Pasos para configurar:

1. **Crear Aplicación en MercadoPago Developers:**
   - Ir a [developers.mercadopago.com](https://developers.mercadopago.com)
   - Iniciar sesión
   - Ir a "Tus integraciones" → "Crear nueva aplicación"
   - Seleccionar "Web Checkout" o "Checkout Pro"
   - Configurar URLs de redirección:
     - Redirect URI: `https://tudominio.com/api/mercadopago/oauth/callback`
   - Copiar `APP_ID` y `APP_SECRET`

2. **Configurar en el Backend:**
   - Editar `appsettings.json`
   - Agregar credenciales de OAuth

3. **Conectar desde la App:**
   - Iniciar sesión como Super Tenant
   - Ir a **Configuración** → **Integraciones** → **MercadoPago**
   - Hacer clic en **"Conectar con MercadoPago"**
   - Completar el flujo de autorización OAuth

#### Configurar Webhooks:

**URL para configurar en MercadoPago Developers:**
- Pagos de socios: `https://tudominio.com/api/renovaciones/webhook`
- Pagos SaaS: `https://tudominio.com/api/saas/webhook`

**Eventos a seleccionar:**
- ✅ `payment`
- ✅ `refunded`
- ✅ `chargeback`

> **Nota**: Para más información detallada sobre la configuración de MercadoPago, consultar [MERCADOPAGO.md](./MERCADOPAGO.md)

---

### Cambio de Plan SaaS

**Ubicación**: Configuración → Plan SaaS

Los gimnasios pueden cambiar su plan de suscripción en cualquier momento.

#### Pasos para cambiar de plan:

1. Ir a **Configuración** → **Plan SaaS**
2. Ver el plan actual y los planes disponibles
3. Seleccionar el nuevo plan deseado
4. Aparecerá un **modal de pago de MercadoPago**
5. Completar el pago con tarjeta
6. El plan se actualiza automáticamente

#### Modal de Pago

El modal muestra:
- 📋 Plan actual vs Nuevo plan
- 💰 Precio mensual/anual
- ✅ Límites del nuevo plan
- 💳 Botón de pago con logo de MercadoPago (color celeste claro)

#### Validación de Límites

Al cambiar a un plan con **menos límites**:
- ⚠️ Si excedes los límites del nuevo plan, no podrás cambiar
- ⚠️ Debes reducir socios/personal/salas primero
- ✅ Si estás dentro de los límites, el cambio es inmediato

---

| Rol | Permisos |
|-----|----------|
| **Super Tenant** | Acceso total + Integraciones + Gestión de planes SaaS (solo Tenant ID 1) |
| **Administrador** | Acceso total a las secciones de su gimnasio |
| **Recepcionista** | Gestión de socios, suscripciones, pagos, turnos, check-in |
| **Profesor** | Ver sus turnos, crear/editar rutinas, ver asistencia de sus clases |
| **Socio** | Ver su panel, turnos, evolución física y renovar suscripción |

> **Nota**: Los límites de cantidad de socios, personal y salas dependen del **plan SaaS** contratado por cada gimnasio.

### Credenciales por Defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@gym.com | admin123 |
| Recepcionista | rece@gym.com | rece123 |
| Socio | socio@gym.com | socio123 |
| Profesor | profe@gym.com | profe123 |

---

## 🚀 Guía de Configuración Inicial del Sistema

> **⚠️ ATENCIÓN ADMINISTRADORES**
>
> Si es la **primera vez** que vas a usar GymSaaS, esta sección es **OBLIGATORIA**.
>
> El sistema tiene dependencias entre los datos. No puedes crear turnos si no hay salas, ni asignar profesores si no existen en el sistema.
>
> **Sigue estos 7 pasos en orden** para una configuración exitosa.

**⚠️ IMPORTANTE**: Si es la primera vez que vas a usar el sistema, sigue estos pasos en orden. El sistema tiene dependencias: necesitas crear ciertos datos antes que otros para que todo funcione correctamente.

### 📋 Orden de Configuración Paso a Paso

#### PASO 1️⃣: Configurar las Salas del Gimnasio

**Por qué primero**: Los turnos necesitan asignarse a una sala. Sin salas, no puedes crear turnos.

**Ubicación**: Instalaciones → "Salas"

**Qué hacer**:
1. Hacer clic en **"➕ Nueva Sala"**
2. Crear todas las salas de tu gimnasio:
   - **Nombre**: Ej: "Sala de Pesas", "Pilates", "Yoga", "CrossFit", "Spinning"
   - **Cupo máximo**: Cantidad de personas que entran (ej: 20, 15, 25)
   - **Activa**: Dejar marcada

**Ejemplo de configuración mínima**:
- Sala de Pesas: 20 personas
- Sala de Pilates: 10 personas
- Sala CrossFit: 25 personas

✅ **Checkpoint**: Deberías tener al menos 2-3 salas creadas antes de continuar.

---

#### PASO 2️⃣: Dar de Alta al Personal (Profesores)

**Por qué segundo**: Los turnos necesitan un profesor responsable. Sin personal, no puedes asignar谁来 dicta las clases.

**Ubicación**: Instalaciones → "Personal"

**Qué hacer**:
1. Hacer clic en **"➕ Nuevo Personal"**
2. Completar los datos de cada profesor:
   - **Nombre completo**
   - **Email** (para crear su usuario de acceso)
   - **Teléfono** y **Dirección**
   - **Especialidad**: Ej: "Entrenador físico", "Yoga", "Pilates", "CrossFit"
   - **Rol**: Profesor
   - **Crear usuario**: Marcar "Sí" y crear contraseña
   - **Activo**: Dejar marcado

**Ejemplo**:
- Carlos López - Entrenador físico
- Ana Martínez - Yoga y Pilates
- Diego Rodríguez - CrossFit

✅ **Checkpoint**: Deberías tener al menos 2-3 profesores creados con sus usuarios de acceso.

---

#### PASO 3️⃣: Crear los Planes de Suscripción

**Por qué tercero**: Las suscripciones de los socios necesitan un plan. Sin planes, no sabes qué cobrarle a cada socio.

**Ubicación**: Gestión → "Planes"

**Qué hacer**:
1. Hacer clic en **"➕ Nuevo Plan"**
2. Crear los planes que ofrecerás:
   - **Nombre**: Ej: "Musculación 2 días", "Pilates 3 días", "Full Pass"
   - **Descripción**: Detalle del plan
   - **Precio**: Mensual (ej: $15.000, $25.000, $40.000)
   - **Días por semana**: 2, 3, 5 o ilimitado
   - **Salas permitidas**: Seleccionar las salas que creadas en el PASO 1

**Ejemplo de planes**:
- **Plan Básico**: 2 días/semana - $15.000 (Solo Sala de Pesas)
- **Plan Estándar**: 3 días/semana - $25.000 (Pesas + Pilates)
- **Plan Premium**: 5 días/semana - $40.000 (Todas las salas)

✅ **Checkpoint**: Deberías tener al menos 2-3 planes creados.

---

#### PASO 4️⃣: Crear la Plantilla de Turnos

**Por qué cuarto**: Ahora que tienes salas y profesores, puedes crear los horarios de las clases. Los socios se anotarán en estos turnos.

**Ubicación**: Agenda → "Turnos Plantilla"

**Qué hacer**:
1. Hacer clic en **"➕ Nuevo Turno"**
2. Configurar cada turno de la semana:
   - **Día de la semana**: Lunes a Domingo
   - **Hora inicio**: Ej: 08:00, 10:00, 18:00
   - **Hora fin**: Ej: 10:00, 12:00, 20:00
   - **Sala**: Seleccionar de la lista (creadas en PASO 1)
   - **Profesor**: Asignar responsable (creados en PASO 2)
3. Repetir para todos los días y horarios

**Ejemplo de configuración de semana**:

**Lunes**:
- 08:00-10:00 - Sala de Pesas - Prof. Carlos
- 10:00-12:00 - Sala de Pilates - Prof. Ana
- 18:00-20:00 - Sala CrossFit - Prof. Diego

**Martes**:
- 08:00-10:00 - Sala de Pesas - Prof. Carlos
- 18:00-20:00 - Sala de Pilates - Prof. Ana

**Miércoles a Viernes**: Repetir según necesidad

✅ **Checkpoint**: Deberías tener turnos de Lunes a Viernes (o Lunes a Sábado) configurados.

---

#### PASO 5️⃣: Registrar Socios

**Por qué quinto**: Ahora que tienes turnos configurados, puedes registrar socios y asignarlos a esos turnos.

**Ubicación**: Gestión → "Socios"

**Qué hacer**:
1. Hacer clic en **"➕ Nuevo Socio"**
2. Completar el formulario:
   - **Datos personales**: Nombre, email, teléfono, dirección, fecha de nacimiento
   - **Fecha de ingreso**: Fecha actual
   - **Crear usuario de acceso**:
     - **Email**: Será su nombre de usuario
     - **Contraseña temporal**: Se la comunicarás al socio
     - **Rol**: Socio
3. Guardar

**Nota**: En este paso el socio queda registrado pero NO tiene suscripción activa aún. Eso se hace en el siguiente paso.

✅ **Checkpoint**: El socio aparece en la lista como "Activo" pero sin suscripción.

---

#### PASO 6️⃣: Activar Suscripciones (y Asignar Turnos)

**Por qué sexto**: El socio necesita una suscripción activa para poder asistir al gimnasio. Aquí también asignas sus turnos.

**Ubicación**: Gestión → "Suscripciones"

**Qué hacer**:
1. Hacer clic en **"➕ Nueva Suscripción"**
2. Completar:
   - **Socio**: Seleccionar de la lista (creados en PASO 5)
   - **Plan**: Seleccionar el plan (creados en PASO 3)
   - **Fecha de inicio**: Generalmente hoy
   - **Fecha de fin**: Se calcula automáticamente (inicio + 30 días)
3. **Asignar turnos al socio**:
   - Hacer clic en **"➕ Asignar Turnos"**
   - Seleccionar los turnos disponibles (creados en PASO 4)
   - Respetar el cupo máximo de cada sala
   - Respetar los días permitidos del plan (ej: 2 días/semana)
4. Guardar

**¿Qué pasa después?**:
- El socio puede ver sus turnos en su panel
- El socio puede hacer check-in cuando asista
- El sistema controla que no supere el cupo de la sala

✅ **Checkpoint**: El socio ahora tiene suscripción "Activa" y turnos asignados.

---

#### PASO 7️⃣: (Opcional) Configurar Rutinas y Ejercicios

**Por qué opcional**: No es obligatorio para el funcionamiento básico, pero permite que los profesores diseñen rutinas personalizadas.

**Ubicación**: Rutinas → "Ejercicios" y "Rutinas"

**Qué hacer**:
1. **Crear ejercicios**:
   - Ej: "Press de banca", "Sentadilla", "Crunch abdominal"
   - Asignar grupo muscular (pecho, piernas, abdominales)
   - Agregar descripción de ejecución

2. **Crear rutinas plantilla**:
   - Ej: "Rutina Principiante Nivel 1"
   - Agregar ejercicios con series, repeticiones y descanso
   - Asignar a socios desde sus suscripciones

✅ **Checkpoint**: Los profesores pueden crear y asignar rutinas a los socios.

---

### 📊 Resumen del Orden

```
1️⃣ SALAS         → Crear las salas del gimnasio
   ↓
2️⃣ PERSONAL      → Dar de alta a los profesores
   ↓
3️⃣ PLANES        → Crear planes de suscripción
   ↓
4️⃣ TURNOS        → Configurar horarios (necesita salas + profesores)
   ↓
5️⃣ SOCIOS        → Registrar los miembros
   ↓
6️⃣ SUSCRIPCIONES → Activar planes y asignar turnos
   ↓
7️⃣ RUTINAS       → (Opcional) Diseñar rutinas
```

---

### ❌ Errores Comunes (y cómo evitarlos)

| Error | Por qué ocurre | Solución |
|-------|----------------|----------|
| "No hay salas disponibles" | Intentaste crear turnos sin crear salas primero | Ir al **PASO 1** y crear salas |
| "No hay profesores asignados" | Intentaste crear turnos sin dar de alta al personal | Ir al **PASO 2** y crear profesores |
| "No hay planes disponibles" | Intentaste crear suscripciones sin planes | Ir al **PASO 3** y crear planes |
| "No hay turnos disponibles" | El socio no tiene turnos para anotarse | Ir al **PASO 4** y crear turnos plantilla |
| "El cupo está lleno" | La sala ya alcanzó su capacidad máxima | Asignar al socio a otro turno o aumentar cupo de la sala |
| "El socio no tiene suscripción vigente" | El socio no tiene suscripción o venció | Ir al **PASO 6** y activar suscripción |

---

### 💡 Tips para una Configuración Exitosa

1. **Planifica antes de cargar**: Haz un listado en papel de tus salas, profesores y horarios antes de empezar a cargarlos en el sistema.

2. **Carga todo de una vez**: Dedica un bloque de tiempo (2-3 horas) para completar los primeros 4 pasos. Es más rápido hacerlo todo junto.

3. **Usa nombres consistentes**: Si llamas a una sala "Sala de Pesas", usa siempre ese nombre (no "Pesas" o "Sala Pesas").

4. **Verifica los cupos**: Asegúrate de que el cupo de las salas sea realista. Si pones cupo 5 y siempre entran 10 personas, tendrás problemas.

5. **Revisa la agenda**: Después de crear los turnos, mira la vista calendario para verificar que no haya superposiciones de horarios.

6. **Prueba con un socio de prueba**: Crea un socio de prueba, actívale una suscripción y asígnale turnos para verificar que todo funciona correctamente antes de cargar todos tus socios reales.

---

### ✅ Checklist de Configuración Completada

Usa este checklist para verificar que completaste todo:

- [ ] Todas las salas del gimnasio están creadas
- [ ] Todos los profesores tienen su usuario de acceso
- [ ] Los planes de suscripción están configurados con precios correctos
- [ ] Los turnos de toda la semana están creados (Lun-Sáb)
- [ ] Cada turno tiene una sala y un profesor asignado
- [ ] Los socios están registrados con su usuario de acceso
- [ ] Las suscripciones están activas
- [ ] Los socios tienen turnos asignados
- [ ] Probaste el check-in con un socio de prueba
- [ ] Los profesores pueden ver sus turnos y clases

**¡Cuando completes todo esto, tu sistema está listo para usar!** 🎉

---

## Panel Socio

El panel del socio está diseñado para que pueda ver su información personal, sus turnos asignados, evolución física y gestionar sus renovaciones.

### Mi Panel

**Ubicación**: Menú principal → "Mi Panel"

#### Información disponible:
- 📊 **Datos personales**: Nombre, email, teléfono, dirección
- 📅 **Suscripción activa**: Plan actual, fecha de inicio y fin
- 💪 **Turnos asignados**: Días y horarios reservados

#### Acciones disponibles:
- ✏️ **Editar perfil**: Actualizar datos personales
- 🔑 **Cambiar contraseña**: Modificar contraseña de acceso

### Calendario de Turnos

**Ubicación**: Panel Socio → "Calendario"

Muestra todos los turnos del mes con:
- 📅 Días y horarios asignados
- 🏢 Sala asignada
- 👤 Profesor responsable
- 👥 Cupo máximo y ocupación

#### Colores del calendario:
- 🟢 **Verde**: Turno disponible
- 🔴 **Rojo**: Turno completo (sin cupo)
- 🔵 **Azul**: Turno asignado al socio

### Evolución Física

**Ubicación**: Panel Socio → "Evolución Física"

El socio puede registrar y ver su progreso:
- ⚖️ **Peso** (kg)
- 📏 **Altura** (cm)
- 💪 **Medidas** (pecho, cintura, caderas, brazos, piernas)
- 📊 **Gráficos** de progreso

#### Registrar medición:

1. Ir a "Evolución Física"
2. Hacer clic en **"➕ Nueva Medición"**
3. Ingresar:
   - Fecha
   - Peso (kg)
   - Altura (cm)
   - Medidas corporales (opcional)
4. Guardar

### Renovación de Suscripción

**Ubicación**: Panel Socio → "Mis Suscripciones"

El sistema permite renovar mensualmente la suscripción de forma automática o manual.

#### ¿Cuándo aparece el botón de renovación?

El botón **"Renovar Suscripción"** aparece automáticamente **7 días antes** del vencimiento de tu suscripción activa.

#### Indicadores de vencimiento:

- ⚠️ **Vence hoy** (rojo) - Último día para renovar
- 🟡 **Vence mañana** (naranja) - Alerta de 1 día
- 🔵 **Vence en X días** (gris) - Más de 2 días

#### Renovar con Pago Manual

1. Hacer clic en **"Renovar Suscripción"** (botón verde)
2. Seleccionar **"💳 Pago Manual (subir comprobante)"**
3. Subir comprobante:
   - 💳 Transferencia bancaria (captura)
   - 💵 Recibo de pago en efectivo
4. Hacer clic en **"Enviar Orden"**
5. Esperar aprobación administrativa (24-48 horas hábiles)

#### Renovar con Mercado Pago

1. Hacer clic en **"Renovar Suscripción"** (botón verde)
2. Seleccionar **"💎 Mercado Pago (tarjeta online)"**
3. Elegir mantener el mismo plan
4. Serás redirigido al checkout seguro de Mercado Pago
5. Completar datos de tarjeta
6. Pago procesado → Suscripción renovada instantáneamente

**✅ Ventajas de Mercado Pago:**
- Procesamiento instantáneo
- Disponible 24/7
- Suscripción activada inmediatamente
- Sin esperar aprobación

### Configurar Renovación Automática

**Ubicación**: Mis Suscripciones → Configuración

La renovación automática permite que tu suscripción se renueve cada mes sin que tengas que hacerlo manualmente.

#### Pasos para configurar:

1. Ir a "Mis Suscripciones"
2. Hacer clic en **"⚙️ Configurar Renovación Automática"**
3. Marcar **"Habilitar renovación automática"**
4. Ingresar datos de tarjeta:
   - La tarjeta se almacena de forma segura (token, no número)
   - Solo se muestran los últimos 4 dígitos: "**** 1234"
5. Confirmar

#### ¿Cómo funciona?

- 🔄 **2 días antes** del vencimiento, el sistema procesa el pago automáticamente
- 📧 **Recibirás email** de confirmación con nuevo vencimiento
- 🛑 **Puedes desactivarlo** en cualquier momento desde la configuración

### Ver Historial de Renovaciones

**Ubicación**: Mis Suscripciones → "Ver Historial"

Muestra todas tus renovaciones con:

- 📅 **Fecha** de renovación
- 📋 **Plan anterior** → **Plan nuevo** (tracking de cambios)
- 💰 **Monto** abonado
- 💳 **Método de pago**: Manual / Mercado Pago
- ✅ **Estado** de la renovación

#### Estados de renovación:

| Estado | Descripción |
|--------|-------------|
| 🟡 **Iniciada** | Renovación creada, esperando pago |
| 🟢 **Pagada** | Pago exitoso, suscripción creada |
| 🔴 **Fallida** | Pago rechazado |
| ⚫ **Cancelada** | Cancelada por el socio |
| 🔵 **Completada** | Proceso finalizado exitosamente |

---

## Panel Administrador y Staff

El sistema cuenta con dashboards especializados para cada rol del personal.

### Dashboards por Rol

#### Dashboard del Administrador

**Ubicación**: Menú principal → "Dashboard"

Panel general con visión completa del sistema:

**Métricas principales:**
- 📊 Total de socios activos
- 💰 Ingresos del mes
- 📋 Suscripciones por vencer (próximos 7 días)
- 👥 Personal activo
- 📈 Tendencia de ingresos vs egresos

**Accesos rápidos:**
- Gestión de socios
- Órdenes de pago pendientes
- Turnos de hoy
- Reportes financieros

#### Dashboard del Recepcionista

**Ubicación**: Menú principal → "Dashboard" (rol Recepcionista)

Panel optimizado para tareas diarias de recepción:

**Métricas en tiempo real:**
- 👥 **Socios con suscripción vigente**: Cantidad de miembros que pueden asistir hoy
- Acceso rápido a check-in QR
- Vista de socios y suscripciones
- Agenda de turnos
- Gestión de pagos

**Accesos rápidos:**
1. **📷 Escáner QR** - Check-in rápido con cámara
2. **👥 Socios** - Gestión de miembros
3. **📋 Suscripciones** - Ver y administrar suscripciones
4. **📅 Agenda** - Calendario de turnos
5. **💳 Pagos** - Órdenes de pago pendientes

#### Dashboard del Profesor

**Ubicación**: Menú principal → "Dashboard" (rol Profesor)

Panel enfocado en actividades docentes:

**Accesos rápidos:**
1. **📅 Mis Turnos** - Ver solo los turnos asignados al profesor
2. **💪 Rutinas** - Crear y editar rutinas de ejercicios
3. **🏋️ Clases de Hoy** - Ver asistencia de las clases de hoy

**Características:**
- Vista filtrada de turnos (solo los del profesor)
- No puede crear/editar turnos plantilla (solo ver)
- Gestión completa de rutinas y ejercicios
- Acceso a estadísticas de asistencia de sus clases

**Restricciones:**
- No puede acceder a módulo de rutinas (gestión de ejercicios y plantillas)
- No puede gestionar pagos ni finanzas
- No puede crear o editar turnos plantilla

---

## Gestión

Esta sección está disponible principalmente para **Administradores y Recepcionistas**.

### Socios

**Ubicación**: Gestión → "Socios"

#### Registrar nuevo socio:

1. Hacer clic en **"➕ Nuevo Socio"**
2. Completar el formulario:
   - **Datos personales**: Nombre, email, teléfono, dirección
   - **Fecha de nacimiento**
   - **Fecha de ingreso**
3. Crear usuario de acceso:
   - **Email** (será el nombre de usuario)
   - **Contraseña temporal**
   - **Rol**: Socio
4. Guardar

#### Ver y editar socios:

La tabla muestra todos los socios con:
- 👤 Nombre completo
- 📧 Email
- 📱 Teléfono
- ✅ Estado (Activo/Inactivo)

**Acciones**:
- ✏️ **Editar**: Modificar datos del socio
- 📋 **Ver evolución física**: Mediciones registradas
- 🔄 **Activar/Desactivar**: Cambiar estado del socio

### Suscripciones

**Ubicación**: Gestión → "Suscripciones"

Gestiona las suscripciones activas de los socios.

#### Crear suscripción:

1. Seleccionar el socio
2. Elegir el plan
3. Definir fecha de inicio
4. Asignar turnos (opcional)
5. Guardar

#### Estados de suscripción:
- 🟢 **Activa**: Socio puede asistir al gimnasio
- 🔴 **Inactiva**: Socio no puede asistir (deuda, vencimiento, etc.)
- 🟡 **Pendiente**: Esperando pago o activación

### Planes

**Ubicación**: Gestión → "Planes"

Configura los planes mensuales disponibles.

#### Crear plan:

1. Hacer clic en **"➕ Nuevo Plan"**
2. Completar:
   - **Nombre**: Ej: "Musculación 3 días", "Pilates 2 días"
   - **Descripción**: Detalles del plan
   - **Precio**: Mensual (ej: $7.500)
   - **Días por semana**: 2, 3, 5 o ilimitado
3. Guardar

#### Planes de ejemplo:
- **Plan Básico**: 2 días/semana - Precio configurable
- **Plan Estándar**: 3 días/semana - Precio configurable
- **Plan Premium**: 5 días/semana - Precio configurable
- **Plan Full**: 7 días (Ilimitado) - Precio configurable

---

## Rutinas

Disponible para **Administradores y Profesores**.

**Nota**: El rol Recepcionista NO tiene acceso a este módulo.

### Ejercicios

**Ubicación**: Rutinas → "Ejercicios"

Biblioteca de ejercicios que se pueden asignar a las rutinas.

#### Crear ejercicio:

1. Hacer clic en **"➕ Nuevo Ejercicio"**
2. Completar:
   - **Nombre**: Ej: "Press de banca", "Sentadilla"
   - **Grupo muscular**: Pecho, piernas, espalda, hombros, brazos, abdominales
   - **Descripción**: Instrucciones de ejecución
   - **Equipamiento necesario**: Mancuernas, barra, máquina, etc.
   - **Imagen/GIF** (opcional): URL de video o gif demostrativo
3. Guardar

#### Editar ejercicio:
- Modificar cualquier campo
- Actualizar imagen o video
- Cambiar grupo muscular

### Rutinas (Plantillas)

**Ubicación**: Rutinas → "Rutinas"

Son rutinas base que los profesores asignan a los socios.

#### Crear rutina:

1. Hacer clic en **"➕ Nueva Rutina"**
2. Completar:
   - **Nombre**: Ej: "Rutina Principiante Nivel 1"
   - **Descripción**: Objetivo y nivel
   - **Duración estimada**: Ej: 45 minutos
3. Agregar ejercicios:
   - Seleccionar de la biblioteca
   - Definir series, repeticiones y descanso
   - Ordenar secuencia de ejecución
4. Guardar

#### Ejemplo de estructura:
1. **Calentamiento** (5 min)
   - Caminata en cinta: 5 min
2. **Piernas** (20 min)
   - Sentadilla: 4 series x 12 reps
   - Prensa de piernas: 3 series x 15 reps
3. **Pecho** (15 min)
   - Press de banca: 4 series x 10 reps
4. **Abdominales** (5 min)
   - Crunch abdominal: 3 series x 20 reps

### Asignación de Rutinas

Los profesores pueden asignar rutinas personalizadas a los socios desde el panel de gestión.

---

## Agenda

Controla los turnos fijos del gimnasio.

### Turnos Plantilla

**Ubicación**: Agenda → "Turnos Plantilla"

Define la plantilla de turnos semanales.

**Permisos:**
- ✅ **Administrador**: Crear, editar y eliminar turnos
- ✅ **Recepcionista**: Crear, editar y eliminar turnos
- ⚠️ **Profesor**: Solo ver turnos (no puede editar)

#### Crear turno plantilla:

1. Hacer clic en **"➕ Nuevo Turno"**
2. Configurar:
   - **Día de la semana**: Lunes a Domingo
   - **Hora inicio**: Ej: 08:00
   - **Hora fin**: Ej: 10:00
   - **Sala**: Seleccionar de la lista
   - **Profesor**: Asignar responsable (opcional)
3. Guardar

#### Ejemplo de configuración:
```
Lunes 08:00-10:00 - Sala de Pesas - Prof. Carlos
Lunes 10:00-12:00 - Sala de Pilates - Prof. Ana
Lunes 18:00-20:00 - Sala CrossFit - Prof. Diego
```

### Calendario

**Ubicación**: Agenda → "Calendario"

Vista visual de todos los turnos del mes:
- 📅 Vista mensual
- 👥 Conteo de ocupación vs cupo
- 🏢 Sala asignada
- 👤 Profesor responsable

**Vista por rol:**
- **Admin/Recepcionista**: Ven todos los turnos del sistema
- **Profesor**: Ve solo los turnos donde está asignado como responsable

#### Filtrar por:
- Sala específica
- Profesor
- Rango de fechas

---

## Check-in y Asistencia

Sistema completo de control de asistencia con validación de suscripciones y cupos.

**Permisos:**
- ✅ **Administrador**: Acceso completo a check-in
- ✅ **Recepcionista**: Acceso completo a check-in
- ✅ **Profesor**: Ver clases del día y asistencia

### Check-in con QR

**Ubicación**: Check-in → "Escanear QR"

Método rápido para registrar asistencia mediante código QR:

1. **Escanear QR del socio**:
   - Abrir la cámara del dispositivo
   - Escanear el código QR del socio (en su perfil del app)
   - El sistema valida automáticamente:
     - ✅ Suscripción activa
     - ✅ Turno reservado para hoy
     - ✅ Horario permitido (ventana de 2 horas antes hasta 1 hora después)

2. **Validaciones del sistema**:
   - No permite check-in duplicado el mismo día
   - Valida que el turno sea del día actual
   - Verifica que la suscripción esté vigente
   - Verifica cupo disponible en la sala

### Check-in Manual

**Ubicación**: Check-in → "Check-in Manual"

Para registrar asistencia sin QR:

1. Ingresar **DNI**, **ID del socio** o **Email**
2. El sistema busca automáticamente:
   - Turnos disponibles hoy para el socio
   - Estado de suscripción
   - Si ya hizo check-in previo
3. Seleccionar el turno para registrar check-in
4. Opcional: Agregar observaciones del profesor

**Estados de validación:**
- ✅ **Check-in permitido**: Socio con suscripción activa y turno reservado
- ⚠️ **Sin suscripción vigente**: Socio no tiene suscripción activa
- ⏳ **Sin turno hoy**: Socio no tiene turno reservado para hoy
- 🔁 **Ya registrado**: Socio ya hizo check-in hoy

### Clases del Día

**Ubicación**: Check-in → "Clases del Día"

Vista completa de todas las clases programadas para hoy:

**Información por clase:**
- 📅 Hora de inicio y duración
- 🏢 Sala asignada
- 👤 Profesor responsable
- 👥 Cupo total y ocupación
- ✅ Lista de alumnos con estado de check-in

**Filtros disponibles:**
- Por sala
- Por profesor
- Por estado de check-in (realizado/pendiente)

**Datos del alumno:**
- Nombre completo
- Edad (calculada automáticamente)
- Peso y altura (última medición registrada)
- Foto de perfil
- Estado de check-in (✅ realizado / ⏳ pendiente)

**Vista por rol:**
- **Profesor**: Ve solo las clases donde está asignado
- **Admin/Recepcionista**: Ven todas las clases del día

### Estadísticas de Asistencia

**Ubicación**: Check-in → "Estadísticas"

Panel con métricas de asistencia:

**Filtros de periodo:**
- Últimos 7 días (default)
- Últimos 30 días
- Últimos 90 días
- Periodo personalizado (1-365 días)

**Métricas disponibles:**
- 📊 Total de check-ins en el periodo
- 📈 Promedio diario de asistencia
- 📅 Distribución por día de la semana
- 👨‍🏫 Top profesores por cantidad de check-ins
- 🤸 Top 5 socios con mayor asistencia

**Gráficos:**
- Check-ins por día de la semana (barras)
- Check-ins por profesor (ranking)
- Evolución temporal de asistencia

---

## Instalaciones

Solo disponible para **Administradores**.

### Salas

**Ubicación**: Instalaciones → "Salas"

Define las salas o espacios del gimnasio.

#### Crear sala:

1. Hacer clic en **"➕ Nueva Sala"**
2. Completar:
   - **Nombre**: Ej: "Sala de Pesas", "Pilates", "Yoga", "CrossFit"
   - **Cupo máximo**: Cantidad de personas permitidas (ej: 15)
   - **Activa**: Habilitar/Deshabilitar la sala
3. Guardar

#### Ejemplos de salas:
- **Sala de Pesas**: 20 personas
- **Sala de Pilates**: 10 personas
- **Sala de Yoga**: 15 personas
- **Sala CrossFit**: 25 personas

### Personal

**Ubicación**: Instalaciones → "Personal"

Gestiona el staff del gimnasio (profesores, recepcionistas, etc.).

#### Registrar personal:

1. Hacer clic en **"➕ Nuevo Personal"**
2. Completar:
   - **Nombre completo**
   - **Email** (para crear usuario)
   - **Teléfono**
   - **Dirección**
   - **Especialidad**: Ej: "Entrenador físico", "Yoga", "Pilates"
   - **Rol**: Profesor, Recepcionista, Administrador
   - **Activo**: Estado del empleado
3. Guardar

#### Roles disponibles:
- **Administrador**: Acceso total al sistema
- **Recepcionista**: Gestión de socios, pagos, turnos
- **Profesor**: Ver sus turnos, crear rutinas y asignarlas

---

## Pagos

Controla las finanzas y pagos del gimnasio.

### Órdenes de Pago

**Ubicación**: Pagos → "Órdenes"

Gestiona las órdenes de pago de los socios.

#### Estados de orden:
- 🔵 **Pendiente**: Esperando aprobación
- 🟢 **Aprobada**: Pago verificado
- 🔴 **Rechazada**: Pago rechazado

#### Medios de pago:
- 💳 **Transferencia**: Cuando hay comprobante adjunto
- 💵 **Efectivo**: Cuando no hay comprobante

#### Aprobar orden manual:

1. Buscar la orden (filtro por estado "Pendiente")
2. Hacer clic en el botón **📎** para ver el comprobante
3. Verificar:
   - Monto coincida con el plan
   - Fecha del pago
   - Nombre del titular
4. Si está correcto:
   - Hacer clic en **✏️ Editar**
   - Cambiar estado a **"Aprobada"**
   - La suscripción se crea automáticamente

#### Rechazar orden:
1. Editar la orden
2. Cambiar estado a **"Rechazada"**
3. El socio será notificado para que realice el pago nuevamente

### Estados de Orden

**Ubicación**: Pagos → "Estados"

Configura los posibles estados de las órdenes de pago.

- **Pendiente**: Orden creada, esperando pago
- **Aprobada**: Pago verificado
- **Rechazada**: Pago no aceptado
- **Verificado**: (sin uso, sustituido por Aprobada)

### Comprobantes

**Ubicación**: Pagos → "Comprobantes"

Gestiona los archivos de comprobante de pago subidos por los socios.

#### Ver comprobante:
1. Ir a "Órdenes de Pago"
2. Hacer clic en **📎** junto a la orden
3. Se abrirá el comprobante:
   - 📄 PDF: Visualizador integrado
   - 🖼️ Imagen: Vista previa

### Renovaciones

**Ubicación**: Pagos → "Renovaciones"

Gestiona las renovaciones mensuales de suscripciones de los socios. Esta sección permite monitorear y administrar el proceso de renovación automática y manual.

#### Ver renovaciones

La tabla muestra todas las renovaciones con:
- 📅 **Fecha de renovación**
- 👤 **Socio**
- 📋 **Plan anterior** → **Plan nuevo** (tracking de cambios de plan)
- 💰 **Monto** de la renovación
- 💳 **Método de pago**: Manual / Mercado Pago
- ✅ **Estado** de la renovación

#### Estados de renovación:

| Estado | Descripción | Acción requerida |
|--------|-------------|------------------|
| 🟡 **Iniciada** | Renovación creada, esperando pago | Esperar pago del socio |
| 🟢 **Pagada** | Pago exitoso, suscripción creada automáticamente | Revisar suscripción generada |
| 🔴 **Fallida** | Pago rechazado por Mercado Pago | Contactar al socio |
| ⚫ **Cancelada** | Cancelada por el socio | Sin acción |
| 🔵 **Completada** | Proceso finalizado exitosamente | Sin acción |

#### Aprobar renovación manual:

Las renovaciones con pago manual requieren aprobación administrativa:

1. Buscar la renovación (filtro por estado "Iniciada" y método "Manual")
2. Hacer clic en **📎** para ver el comprobante
3. Verificar:
   - Monto coincida con el plan seleccionado
   - Fecha del pago
   - Nombre del titular
4. Si está correcto:
   - El sistema aprobará automáticamente la orden de pago
   - Se creará la nueva suscripción
   - El socio recibirá notificación por email

**⚠️ Importante**: Al aprobar una renovación manual, el sistema:
- Extiende la suscripción existente 1 mes desde el vencimiento
- Mantiene el mismo plan (o el nuevo si el socio cambió)
- Actualiza el estado de la renovación a "Pagada"

#### Rechazar renovación:

Si el comprobante es incorrecto o incompleto:

1. Editar la renovación
2. Cambiar estado a **"Fallida"**
3. Agregar notas explicativas
4. El socio será notificado para que realice el pago nuevamente

#### Renovaciones automáticas (Mercado Pago):

Las renovaciones con Mercado Pago se procesan automáticamente:

- **🔄 Procesamiento automático**: El webhook de Mercado Pago confirma el pago
- **⚡ Activación inmediata**: La suscripción se crea sin intervención manual
- **📧 Notificación automática**: El socio recibe email de confirmación

**Monitoreo**:
- Revisar periódicamente renovaciones con estado "Fallida"
- Verificar que los webhooks se estén procesando correctamente
- Contactar a soporte si hay renovaciones atascadas en "Iniciada"

#### Configurar Mercado Pago:

**Ubicación**: Archivo de configuración del backend (`appsettings.json`)

```json
{
  "MercadoPago": {
    "AccessToken": "APP_USR-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
  }
}
```

**Pasos para obtener el Access Token**:
1. Crear cuenta en [mercadopago.com](https://mercadopago.com)
2. Ir a "Credenciales de producción" o "Credenciales de prueba"
3. Copiar el "Access Token"
4. Pegarlo en `appsettings.json`
5. Reiniciar el backend

**Webhook URL**:
- Producción: `https://tu-dominio.com/api/renovaciones/webhook`
- Prueba: Configurar en [Mercado Pago Developers](https://mercadopago.com/developers)

#### Reportes de renovación:

**Métricas clave**:
- Tasa de renovaciones exitosas vs fallidas
- Distribución: Manual vs Mercado Pago
- Renovaciones automáticas configuradas
- Ingresos recurrentes mensuales

**Acceso**: Dashboard → Métricas de renovación (próximamente)

---

## Usuarios

Solo disponible para **Administradores**.

### Roles

**Ubicación**: Usuarios → "Roles"

Configura los roles del sistema.

#### Roles del sistema:
- **Administrador**: Acceso total
- **Recepcionista**: Gestión diaria, NO accede a rutinas
- **Profesor**: Rutinas, sus turnos y clases, NO accede a pagos/finanzas
- **Socio**: Acceso limitado a su información

### Usuarios

**Ubicación**: Usuarios → "Usuarios"

Gestiona las cuentas de usuario del sistema.

#### Crear usuario:

1. Hacer clic en **"➕ Nuevo Usuario"**
2. Completar:
   - **Email**: Será el nombre de usuario
   - **Alias**: Nombre visible
   - **Contraseña**: Mínimo 6 caracteres
   - **Rol**: Seleccionar de la lista
   - **Activo**: Estado del usuario
3. Guardar

#### Editar usuario:
- Cambiar email o alias
- Modificar rol
- Activar/Desactivar cuenta

#### Desactivar usuario:
- Hacer clic en **🔒 Desactivar**
- El usuario no podrá acceder al sistema
- Se puede reactivar posteriormente

---

## Finanzas

Solo disponible para **Administradores**.

### Dashboard Financiero

**Ubicación**: Pagos → "Finanzas"

Panel financiero con:

#### Tarjetas de resumen:
- 💵 **Ingresos Totales**: Dinero entrante en el periodo
- 💸 **Egresos Totales**: Gastos operativos
- ⚖️ **Balance**: Diferencia (Ingresos - Egresos)

#### Filtros de fecha:
- **Fecha Desde**: Inicio del periodo a analizar
- **Fecha Hasta**: Fin del periodo

#### Gráficos:
1. **📈 Ingresos vs Egresos por Mes**: Barras comparativas
2. **💳 Ingresos por Medio de Pago**: Distribución de Transferencia vs Efectivo

#### Ingresos por Medio de Pago:
- **Transferencia** (💳): Órdenes con comprobante
- **Efectivo** (💵): Órdenes sin comprobante

Muestra:
- Monto total por medio
- Cantidad de operaciones
- Porcentaje de distribución

### Egresos

**Ubicación**: Dashboard Financiero → Tabla de Egresos

Gestiona los gastos operativos del gimnasio.

#### Categorías de egresos:
- Sueldos
- Alquiler
- Servicios (luz, agua, internet)
- Mantenimiento
- Equipamiento
- Publicidad
- Otros

#### Registrar egreso:

1. Hacer clic en **"+ Nuevo Egreso"**
2. Completar:
   - **Concepto**: Descripción breve
   - **Monto**: Valor del gasto
   - **Fecha**: Fecha del gasto
   - **Categoría**: Seleccionar de la lista
   - **Notas**: Detalles adicionales (opcional)
3. Guardar

#### Eliminar egreso:
- Hacer clic en **"Eliminar"** en la fila del egreso
- Confirmar eliminación

---

## Solución de Problemas

### No puedo iniciar sesión

**Posibles causas:**
- Usuario o contraseña incorrectos
- Cuenta desactivada
- El sistema no está funcionando

**Solución:**
- Verificar credenciales
- Contactar al administrador
- Revisar conexión a internet

---

### No aparecen los turnos en el calendario

**Posibles causas:**
- No hay turnos plantilla creados
- Filtros de fecha incorrectos
- Sala desactivada

**Solución:**
- Crear turnos plantilla
- Verificar filtros de fecha
- Activar la sala

---

### No puedo aprobar una orden de pago

**Posibles causas:**
- El comprobante no se puede visualizar
- Formato de archivo no soportado
- Orden ya aprobada/rechazada

**Solución:**
- Verificar que el archivo sea PDF o imagen
- Recargar la página
- Contactar soporte técnico

---

### El gráfico de finanzas no muestra datos

**Posibles causas:**
- No hay órdenes aprobadas en el periodo
- Filtros de fecha demasiado restrictivos
- No hay egresos registrados

**Solución:**
- Ampliar el rango de fechas
- Aprobar algunas órdenes primero
- Registrar egresos

---

### El profesor no ve sus turnos

**Posibles causas:**
- El profesor no está asignado en los turnos plantilla
- El usuario de profesor no está vinculado al personal

**Solución:**
- Asignar el profesor en los turnos plantilla
- Verificar que el usuario tenga `personalId` vinculado

---

### No puedo acceder al módulo de rutinas (recepcionista)

**Causa:**
- Por diseño, el rol Recepcionista no tiene acceso a rutinas

**Solución:**
- Solicitar a un Administrador o Profesor que gestione las rutinas
- Si es necesario, cambiar el rol del usuario a Profesor

---

## Glosario

| Término | Definición |
|---------|-----------|
| **Socio** | Persona inscrita en el gimnasio con suscripción activa |
| **Suscripción** | Periodo de acceso del socio (generalmente 30 días) |
| **Plan** | Tipo de membresía con precio y días de asistencia |
| **Turno** | Horario fijo asignado a un socio en una sala específica |
| **Turno Plantilla** | Plantilla de turnos que se repite semanalmente |
| **Sala** | Espacio físico del gimnasio con capacidad limitada |
| **Cupo** | Cantidad máxima de personas permitidas en una sala |
| **Rutina** | Serie de ejercicios asignada a un socio |
| **Ejercicio** | Movimiento físico específico dentro de una rutina |
| **Orden de Pago** | Registro de un pago esperando aprobación |
| **Comprobante** | Archivo que prueba el pago realizado (transferencia, recibo) |
| **Medio de Pago** | Forma en que se realizó el pago (Efectivo, Transferencia) |
| **Egreso** | Gasto operativo del gimnasio |
| **Tenant** | Instancia independiente del sistema para múltiples gimnasios |
| **Multi-Tenant** | Arquitectura donde múltiples gimnasios comparten el mismo sistema con datos aislados |
| **Plan SaaS** | Plan de suscripción al sistema GymSaaS (Basic, Standard, Premium, Enterprise) |
| **Super Tenant** | Tenant ID 1, cuenta del dueño del sistema con acceso a configuraciones globales |
| **Check-in** | Registro de asistencia de un socio a su turno |
| **Renovación** | Proceso de extender una suscripción por otro periodo |
| **Mercado Pago** | Plataforma de pagos online integrada al sistema |
| **OAuth** | Método de autenticación para conectar la cuenta de MercadoPago de cada gimnasio |
| **Webhook** | Notificación automática que MercadoPago envía al sistema cuando hay un pago |

---

## Atajos de Teclado

| Acción | Windows/Linux | Mac |
|--------|---------------|-----|
| Guardar formulario | Ctrl + S | Cmd + S |
| Buscar | Ctrl + F | Cmd + F |
| Recargar página | F5 o Ctrl + R | Cmd + R |
| Recargar sin caché | Ctrl + F5 | Cmd + Shift + R |

---

## Navegación Rápida

### Para Socios:
- **Mi Panel**: Ver datos personales y suscripción
- **Calendario**: Ver turnos del mes
- **Evolución Física**: Registrar y ver progreso
- **Mis Suscripciones**: Gestionar renovaciones

### Para Administradores:
- **Dashboard**: Vista general del sistema con métricas
- **Socios**: Gestión de miembros
- **Suscripciones**: Gestión de membresías activas
- **Planes**: Configuración de precios y tipos
- **Turnos Plantilla**: Configurar horarios
- **Personal**: Gestión de profesores y recepcionistas
- **Ejercicios/Rutinas**: Biblioteca de ejercicios y rutinas
- **Check-in QR**: Registro rápido de asistencia
- **Clases del Día**: Control de asistencia por clase
- **Estadísticas**: Métricas de asistencia
- **Órdenes**: Aprobación de pagos pendientes
- **Renovaciones**: Gestión de renovaciones mensuales
- **Finanzas**: Control de ingresos y egresos
- **Usuarios**: Gestión de cuentas de usuario
- **Configuración**: Plan SaaS, Integraciones (solo Super Tenant)

### Para Recepcionistas:
- **Dashboard**: Socios con suscripción vigente
- **Escáner QR**: Check-in rápido con cámara
- **Socios**: Gestión de miembros
- **Suscripciones**: Gestión de membresías activas
- **Agenda**: Calendario de turnos
- **Pagos**: Órdenes de pago pendientes
- **Clases del Día**: Ver asistencia de las clases

### Para Profesores:
- **Dashboard**: Accesos rápidos a mis turnos, rutinas y clases
- **Mis Turnos**: Ver solo los turnos asignados
- **Ejercicios**: Biblioteca de ejercicios
- **Rutinas**: Creación y edición de rutinas
- **Clases de Hoy**: Ver asistencia de sus clases
- **Estadísticas**: Métricas de asistencia (solo sus clases)

---

## Tips de Uso

### 💡 Para Administradores

1. **Mantener actualizados los planes**: Revisa precios periódicamente
2. **Revisar pagos pendientes**: Aprobar o rechazar diariamente
3. **Controlar cupos**: No superar la capacidad de las salas
4. **Backup regular**: Respaldar la base de datos semanalmente
5. **Capacitación del personal**: Entrenar al staff en el uso del sistema
6. **Asignar profesores**: Asegurar que cada turno tenga un profesor responsable
7. **Monitorear renovaciones**: Revisar renovaciones fallidas y contactar socios

### 💡 Para Recepcionistas

1. **Verificar identidad antes de hacer cambios**
2. **Confirmar comprobantes** antes de aprobar pagos
3. **Comunicar cambios** a los socios (nuevos turnos, etc.)
4. **Mantener orden** en las listas y filtros
5. **Usar el escáner QR** para check-in rápido
6. **Verificar suscripción vigente** antes de permitir acceso

### 💡 Para Profesores

1. **Crear rutinas variadas** para diferentes niveles
2. **Actualizar ejercicios** con descripciones claras
3. **Asignar rutinas** acordes a los objetivos del socio
4. **Revisar calendario** para planificar clases
5. **Ver "Mis Turnos"** para confirmar horarios asignados
6. **Revisar "Clases de Hoy"** para ver la lista de alumnos
7. **No gestionar pagos**: Esto es tarea de Admin/Recepcionista

### 💡 Para Socios

1. **Llegar puntual** a los turnos asignados
2. **Registrar evolución** mensualmente para ver progreso
3. **Renovar a tiempo** para no perder beneficios (7 días antes)
4. **Comunicarse** con recepción ante cambios
5. **Configurar renovación automática** para olvidarse del trámite mensual
6. **Usar Mercado Pago** para activación inmediata de la suscripción

---

## Seguridad

### Recomendaciones

- 🔒 **Contraseñas seguras**: Usar combinación de letras, números y símbolos
- 🔒 **No compartir credenciales**: Cada usuario debe tener su propio acceso
- 🔒 **Cerrar sesión**: Al terminar de usar el sistema
- 🔒 **Cambiar contraseña periódicamente**: Cada 3-6 meses
- 🔒 **Datos de tarjetas**: Se almacenan como tokens, nunca números completos

### Roles y Permisos

- **Administrador**: No compartir datos de acceso con personal no autorizado
- **Recepcionista**: Solo gestionar socios y pagos, no configurar sistema
- **Profesor**: Solo acceder a rutinas y calendario, no a datos financieros
- **Socio**: Solo acceder a su información personal y renovaciones

---

## Contacto y Soporte

### Soporte Técnico

- **Email**: soporte@gymsaas.com
- **Tel**: +54 11 1234-5678
- **Horario**: Lunes a Viernes, 9:00 - 18:00
- **Tiempo de respuesta**: 24-48 horas hábiles

### Recursos en Línea

- **Documentación técnica**: [docs.gymsaas.com](https://docs.gymsaas.com)
- **Video tutoriales**: [youtube.com/@gymsaas](https://youtube.com/@gymsaas)
- **Base de conocimientos**: [help.gymsaas.com](https://help.gymsaas.com)
- **Comunidad**: [comunidad.gymsaas.com](https://comunidad.gymsaas.com)

### Reportar Bugs

Para reportar errores o sugerencias:
1. Describir el problema en detalle
2. Adjuntar capturas de pantalla si es posible
3. Indicar los pasos para reproducir el error
4. Enviar a: bugs@gymsaas.com

---

## Actualizaciones del Sistema

El sistema se actualiza regularmente con nuevas funcionalidades y mejoras.

### Versión 2.4 (26/02/2026)

Nuevas funcionalidades:
- ✅ **Sistema Multi-Tenant SaaS** con 4 planes de suscripción
- ✅ **Planes SaaS**: Basic, Standard, Premium, Enterprise con límites y características
- ✅ **Integración MercadoPago OAuth** para cada gimnasio (configuración en Integraciones)
- ✅ **Cambio de plan SaaS** con modal de pago MercadoPago
- ✅ **Validación de límites** por plan (socios, personal, salas)
- ✅ **Sección Integraciones** (solo Super Tenant)
- ✅ **Super Tenant** (Tenant ID 1) con acceso a configuraciones del sistema
- ✅ **Turnos ilimitados** para todos los planes
- ✅ **Documentación unificada de MercadoPago**
- ✅ Actualización de manual de usuario

### Versión 2.3 (19/02/2026)

Nuevas funcionalidades:
- ✅ **Guía de configuración inicial** paso a paso
- ✅ **Checkpoints** de verificación en cada paso
- ✅ **Tabla de errores comunes** con soluciones
- ✅ **Tips de uso** por rol
- ✅ **Reorganización de documentación**

### Versión 2.2 (07/02/2026)

Nuevas funcionalidades:
- ✅ **Dashboards especializados por rol** (Admin, Recepcionista, Profesor)
- ✅ **Dashboard del Recepcionista** con estadísticas de socios vigentes
- ✅ **Dashboard del Profesor** con accesos rápidos a sus turnos y clases
- ✅ **Restricciones por rol**: Recepcionista no accede a rutinas, Profesor no accede a pagos
- ✅ **Mejoras en el sistema de Check-in** con validaciones de suscripción y cupo
- ✅ **Vista filtrada por profesor** en turnos y clases del día
- ✅ **Indicadores visuales de cupo** en clases del día
- ✅ Actualización de documentación y manual de usuario

### Versión 2.1 (06/02/2026)

Nuevas funcionalidades:
- ✅ **Sistema de renovación mensual de suscripciones**
- ✅ Integración con Mercado Pago para pagos online
- ✅ Renovación automática con tarjeta guardada
- ✅ Cambio de plan permitido al renovar
- ✅ Historial completo de renovaciones
- ✅ Notificaciones por email de vencimiento y renovación
- ✅ Webhook para procesamiento automático de pagos
- ✅ Botón de renovación visible 7 días antes del vencimiento

### Versión 2.0 (30/01/2026)

Nuevas funcionalidades:
- ✅ Gráfico de medios de pago en finanzas
- ✅ Detección automática de medios de pago (Efectivo/Transferencia)
- ✅ Unificación de estilos en formularios
- ✅ Creación de usuarios desde el panel
- ✅ Mejoras en la interfaz de pagos

### Próximas Versiones

- 📱 App móvil para socios
- 📊 Reportes avanzados de asistencia
- 💳 Integración con otros medios de pago
- 📱 Notificaciones push móviles
- 🎥 Videos de ejercicios integrados
- 📈 Más métricas y analytics en dashboards

---

## 🆘 ¿Necesitas Ayuda?

### Soporte Técnico

- **Email**: soporte@gymsaas.com
- **Tel**: +54 11 1234-5678
- **Horario**: Lunes a Viernes, 9:00 - 18:00
- **Tiempo de respuesta**: 24-48 horas hábiles

### Recursos Adicionales

- **Documentación técnica**: Ver [DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md) para información sobre arquitectura del sistema (para desarrolladores)
- **Video tutoriales**: [youtube.com/@gymsaas](https://youtube.com/@gymsaas)
- **Base de conocimientos**: [help.gymsaas.com](https://help.gymsaas.com)

---

**Fin del Manual**

© 2026 GymSaaS - Sistema de Gestión de Gimnasios
Todos los derechos reservados

**Última actualización**: 26 de Febrero de 2026
