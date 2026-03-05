# Base de Datos - GymSaaS

Esta carpeta contiene los scripts SQL para la gestión de la base de datos PostgreSQL.

## 📁 Archivos

### Principal
- **`gym_postgres.sql`** - Schema completo de la base de datos
  - Usa este archivo para crear una base de datos nueva desde cero
  - Incluye todas las tablas, restricciones, índices y datos iniciales
  - Contiene los 4 planes SaaS: Basic, Standard, Premium, Enterprise
  - El Tenant ID 1 es SuperTenant (hardcoded en el código)

### Scripts de Mantenimiento

- **`check_personal.sql`** - Script de diagnóstico
  - Verifica duplicados en la tabla `personal`
  - Lista los últimos 20 registros de personal

## 🚀 Crear una base de datos nueva

```bash
# 1. Crear la base de datos
createdb Fitgym

# 2. Ejecutar el schema
psql -d Fitgym -f db/gym_postgres.sql
```

## 🔄 Actualizar una base de datos existente

Los cambios recientes (nuevos planes SaaS y eliminación de `is_super_tenant`) ya están integrados en `gym_postgres.sql`.  
Si tu instancia quedó atrasada, replica estos ajustes manualmente o recrea la base usando el schema completo.

## ⚠️ Notas importantes

### Planes SaaS
El sistema tiene **4 planes SaaS** (precios en pesos argentinos - ARS) con las siguientes características:

| Plan | Precio Mensual | Precio Anual | Max Socios | Max Personal | Max Salas | Turnos |
|------|----------------|--------------|------------|--------------|-----------|--------|
| **Basic** | $14.995 | $149.950 | 50 | 5 | 2 | ILIMITADO |
| **Standard** | $29.990 | $299.900 | 200 | 15 | 5 | ILIMITADO |
| **Premium** | $79.990 | $799.900 | 500 | ILIMITADO | ILIMITADO | ILIMITADO |
| **Enterprise** | $199.990 | $1.999.900 | ILIMITADO | ILIMITADO | ILIMITADO | ILIMITADO |

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

### SuperTenant
- **Solo el Tenant ID 1 es SuperTenant**
- Determinado por hardcoded en `PlanSaaSService.EsSuperTenant()`
- No requiere campo en base de datos
- Tiene acceso ilimitado a todas las funcionalidades

### Multi-tenancia
- Todas las tablas de datos tienen `tenant_id` (excepto tablas del sistema)
- El filtrado por tenant se aplica automáticamente en `GymDbContext`
- Los tenants están completamente aislados entre sí

### Convenciones
- Nombres de tablas en `snake_case`
- Booleanos como `smallint` (0 = false, 1 = true)
- IDs autoincrementales excepto donde se especifica
- Timestamps en UTC
- Nombre de la base de datos en desarrollo: `Fitgym`

