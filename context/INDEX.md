# 📚 Índice de Documentación - GymSaaS

Esta carpeta contiene toda la documentación del proyecto GymSaaS organizada por audiencia y propósito.

---

## 🎯 Documentación Principal (Lee estos primero)

### 1. **[Manual de Usuario](./MANUAL_USUARIO.md)** ⭐ PRIMERA LECTURA
**Para:** Usuarios del sistema (Administradores, Recepcionistas, Profesores, Socios)
**Contenido:**
- Guía completa de uso del sistema
- Procedimientos paso a paso
- Flujos de negocio (renovaciones, check-in, pagos)
- Solución de problemas
- Tips de uso

**No requiere conocimientos técnicos.**

### 2. **[Documentación Técnica](./DOCUMENTACION_TECNICA.md)** 🔧
**Para:** Desarrolladores que trabajan en el código
**Contenido:**
- Arquitectura del sistema (Clean Architecture + DDD)
- Patrones de diseño (Repository, Unit of Work)
- Comandos de desarrollo
- Configuración técnica
- API endpoints
- Estructura de base de datos
- Sistema de multi-tenancia
- Implementación de RBAC
- Sistema de White-Label Branding

---

## 📋 Documentos Técnicos Específicos

### 3. **[API Endpoints](./API_ENDPOINTS.md)**
Referencia completa de todos los endpoints de la API REST con ejemplos de uso.

### 4. **[Panel Frontend](./PANEL_FRONTEND.md)**
Documentación sobre componentes React, estructura de vistas y organización del frontend.

### 5. **[SaaS Implementado](./SaaS_IMPLEMENTADO.md)**
Detalles completos del sistema multi-tenant y planes de suscripción SaaS:
- 4 planes de suscripción (Basic, Standard, Premium, Enterprise)
- Límites y características por plan
- Validación de límites
- API de SaaS

### 6. **[Changelog](./CHANGELOG.md)**
Historial de cambios, versiones y nuevas funcionalidades implementadas.

### 7. **[Despliegue](./DESPLEGUE.md)**
Guía de deployment en producción, configuración de servidores y pasos para poner el sistema en marcha.

### 8. **[MercadoPago](./MERCADOPAGO.md)**
Documentación completa de integración con MercadoPago:
- Configuración para administradores de gimnasios
- Sistema de cobro SaaS
- Arquitectura multi-tenant
- Solución de problemas y monitoreo

---

## 🗺️ Mapa Rápido de Documentación

### ¿Qué necesitas?

| Quiero... | Documento recomendado |
|-----------|----------------------|
| Aprender a usar el sistema | [Manual de Usuario](./MANUAL_USUARIO.md) |
| Entender la arquitectura del código | [Documentación Técnica](./DOCUMENTACION_TECNICA.md) |
| Ver todos los endpoints de la API | [API Endpoints](./API_ENDPOINTS.md) |
| Entender el sistema SaaS | [SaaS Implementado](./SaaS_IMPLEMENTADO.md) |
| Desplegar en producción | [Despliegue](./DESPLEGUE.md) |
| Ver historial de cambios | [Changelog](./CHANGELOG.md) |
| Trabajar en el frontend React | [Panel Frontend](./PANEL_FRONTEND.md) |
| Configurar MercadoPago | [MercadoPago](./MERCADOPAGO.md) |

---

## 📂 Estructura Recomendada de Lectura

### 👨‍💼 Para Nuevos Administradores del Sistema
1. [Manual de Usuario - Panel Administrador](./MANUAL_USUARIO.md#panel-administrador-y-staff)
2. [Manual de Usuario - Gestión](./MANUAL_USUARIO.md#gestión)
3. [Manual de Usuario - Pagos](./MANUAL_USUARIO.md#pagos)
4. [Manual de Usuario - Check-in](./MANUAL_USUARIO.md#check-in-y-asistencia)

### 👨‍💻 Para Nuevos Desarrolladores
1. [Documentación Técnica - Project Overview](./DOCUMENTACION_TECNICA.md#project-overview)
2. [Documentación Técnica - Architecture](./DOCUMENTACION_TECNICA.md#architecture)
3. [API Endpoints](./API_ENDPOINTS.md)
4. [SaaS Implementado](./SaaS_IMPLEMENTADO.md)
5. [Base de Datos - PostgreSQL](./README.md)

### 📞 Para Nuevos Recepcionistas
1. [Manual de Usuario - Dashboard Recepcionista](./MANUAL_USUARIO.md#dashboard-del-recepcionista)
2. [Manual de Usuario - Check-in](./MANUAL_USUARIO.md#check-in-y-asistencia)
3. [Manual de Usuario - Gestión de Socios](./MANUAL_USUARIO.md#socios)
4. [Manual de Usuario - Pagos](./MANUAL_USUARIO.md#pagos)

### 🏋️ Para Nuevos Profesores
1. [Manual de Usuario - Dashboard Profesor](./MANUAL_USUARIO.md#dashboard-del-profesor)
2. [Manual de Usuario - Rutinas](./MANUAL_USUARIO.md#rutinas)
3. [Manual de Usuario - Agenda](./MANUAL_USUARIO.md#agenda)

### 💪 Para Nuevos Socios
1. [Manual de Usuario - Panel Socio](./MANUAL_USUARIO.md#panel-socio)
2. [Manual de Usuario - Renovación de Suscripción](./MANUAL_USUARIO.md#renovación-de-suscripción)

---

## 🔗 Enlaces Externos

- **Repositorio GitHub**: [github.com/RomaRicchi/GymSaaS](https://github.com/RomaRicchi/GymSaaS)
- **Soporte**: soporte@gymsaas.com
- **Video Tutoriales**: [youtube.com/@gymsaas](https://youtube.com/@gymsaas)

---

**Última actualización**: 26 de Febrero de 2026
