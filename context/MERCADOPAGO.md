# Sistema MercadoPago - GymSaaS

**Fecha de actualización:** 2026-02-26
**Estado:** ✅ PRODUCCIÓN LISTO

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura Multi-Tenant](#arquitectura-multi-tenant)
3. [Configuración para Administradores](#configuración-para-administradores)
4. [Implementación Técnica SaaS](#implementación-técnica-saas)
5. [Base de Datos](#base-de-datos)
6. [Seguridad](#seguridad)
7. [Solución de Problemas](#solución-de-problemas)
8. [Monitoreo](#monitoreo)

---

## 🎯 Resumen Ejecutivo

### Dos Sistemas de Pago

GymSaaS implementa **dos sistemas de pago con MercadoPago**:

1. **Pagos de Socios (por gimnasio)** - Cada gimnasio recibe pagos directamente en su cuenta
2. **Pagos SaaS (del sistema)** - Los gimnasios pagan su suscripción al sistema

### Concepto Clave: Multi-Tenancia

**Cada gimnasio (tenant) tiene SU PROPIA cuenta de MercadoPago.**

Esto significa que:
- ✅ Los pagos de los socios llegan directamente a la cuenta del dueño del gimnasio
- ✅ No hay intermediarios ni retenciones adicionales
- ✅ Cada gimnasio gestiona sus propias suscripciones automáticas
- ✅ Total independencia financiera entre gimnasios

---

## 🏗️ Arquitectura Multi-Tenant

### Flujo de Pagos de Socios

```
Socio → Frontend (gym.com) → Backend (tenant X)
                                  ↓
                           Crear Preferencia MP
                           (con credenciales del tenant X)
                                  ↓
                           MercadoPago API
                           (cuenta del dueño del gimnasio X)
                                  ↓
                           Pago del socio
                                  ↓
                           Webhook → Backend
                           (actualiza orden_pago tenant X)
```

### Aislamiento de Datos

1. **Credenciales por Tenant:** Cada gimnasio tiene sus propias credenciales OAuth
2. **Filtros de Query:** Todas las consultas filtran automáticamente por `tenant_id`
3. **Webhook con Tenant:** Los webhooks incluyen `tenant_id` para procesar en la cuenta correcta
4. **Auditoría Completa:** Todos los eventos se auditan por tenant
5. **Índices Únicos:** IDs de MercadoPago son únicos por tenant

---

## 👨‍💼 Configuración para Administradores

### Paso 1: Crear Cuenta de MercadoPago

1. Ir a [mercadopago.com.ar](https://www.mercadopago.com.ar)
2. Crear una cuenta como **"Vendedor"**
3. Completar el proceso de verificación de identidad
4. Configurar los métodos de cobro (tarjetas, dinero en cuenta, etc.)

### Paso 2: Conectar con OAuth (RECOMENDADO)

#### Para Desarrolladores: Crear Aplicación

1. Ir a [developers.mercadopago.com](https://developers.mercadopago.com)
2. Iniciar sesión
3. Ir a "Tus integraciones" → "Crear nueva aplicación"
4. Seleccionar "Web Checkout" o "Checkout Pro"
5. Configurar URLs de redirección:
   - Redirect URI: `https://tudominio.com/api/mercadopago/oauth/callback`
6. Copiar `APP_ID` y `APP_SECRET`

#### Configurar Backend (appsettings.json)

```json
{
  "MercadoPagoOAuth": {
    "AppId": "TU_APP_ID",
    "AppSecret": "TU_APP_SECRET",
    "RedirectUri": "https://tudominio.com/api/mercadopago/oauth/callback",
    "AuthBaseUrl": "https://auth.mercadopago.com.ar",
    "ApiBaseUrl": "https://api.mercadopago.com"
  }
}
```

#### Para Administradores: Conectar desde la App

1. Iniciar sesión como Administrador del gimnasio
2. Ir a **Configuración** → **Integraciones** → **MercadoPago**
3. Hacer clic en **"Conectar con MercadoPago"**
4. Completar el flujo de autorización OAuth
5. ¡Listo! Las credenciales se guardan automáticamente

### Paso 3: Configurar Webhooks

Los webhooks notifican al sistema cuando un pago se procesa.

1. **Ir a [developers.mercadopago.com](https://developers.mercadopago.com/developer)**
2. **Seleccionar tu aplicación**
3. **Ir a "Webhooks"**
4. **Agregar URLs de producción:**
   - Pagos de socios: `https://tudominio.com/api/renovaciones/webhook`
   - Pagos SaaS: `https://tudominio.com/api/saas/webhook`
5. **Seleccionar eventos:**
   - ✅ `payment`
   - ✅ `refunded`
   - ✅ `chargeback`
6. **Guardar configuración**

### Renovación Automática de Socios

Para habilitar renovaciones automáticas con tarjetas:

1. El socio debe agregar un método de pago
2. Ir a **Perfil** → **Métodos de Pago**
3. Agregar tarjeta (se tokeniza con MercadoPago)
4. Habilitar **"Renovación automática"**
5. El sistema creará una suscripción en MercadoPago automáticamente

**Campos importantes:**
- `mercado_pago_card_token`: Token seguro de la tarjeta
- `mercado_pago_preapproval_id`: ID de la suscripción en MercadoPago
- `mercado_pago_preapproval_status`: Estado de la suscripción

---

## 🔧 Implementación Técnica SaaS

### Objetivo

Sistema para **cobrar automáticamente a los gimnasios (tenants)** por su suscripción al sistema GymSaaS.

### Archivos Implementados

#### Entidades del Dominio
- **SaaSMercadoPagoSubscription.cs** - Almacena suscripciones de MercadoPago para cada gimnasio
- **MetodoPago.cs** - Campos: MercadoPagoCustomerId, MercadoPagoCardId

#### Servicios
- **ISaaSMercadoPagoService.cs** - Interfaz completa
- **SaaSMercadoPagoService.cs** - Integración con API de preapprovals

#### API Controllers
- **SaasWebhookController.cs** - Endpoint: `/api/saas/webhook`

### Configuración SaaS

#### appsettings.json

```json
{
  "MercadoPago": {
    "SaaS": {
      "AccessToken": "APP_USR-TU_ACCESS_TOKEN_SAAS",
      "WebhookSecret": "TU_WEBHOOK_SECRET_SAAS"
    }
  }
}
```

#### Webhook en MercadoPago Developers

```
URL: https://tudominio.com/api/saas/webhook
Eventos: payment, preapproval
```

### Flujo de Cobro SaaS

#### Flujo 1: Primer Pago (Fin del Trial)

1. Gimnasio completa trial (14 días)
2. Sistema crea preferencia de pago inicial
3. Gimnasio redirigido a MercadoPago checkout
4. Gimnasio completa pago
5. Webhook `/api/saas/webhook` recibe notificación
6. Sistema actualiza estados automáticamente

#### Flujo 2: Renovaciones Automáticas

1. Sistema crea preapproval en MercadoPago
2. Gimnasio autoriza cobros recurrentes
3. MercadoPago cobra automáticamente cada mes
4. Webhook notifica cobros exitosos/fallidos
5. Sistema actualiza historial y estados

### Checklist de Implementación

#### Backend .NET ✅
- [x] Entidad SaaSMercadoPagoSubscription creada
- [x] Campos agregados a MetodoPago
- [x] GymDbContext actualizado
- [x] Interfaz ISaaSMercadoPagoService creada
- [x] Servicio SaaSMercadoPagoService implementado
- [x] Controller SaasWebhookController creado
- [x] Schema de base de datos actualizado
- [x] Índices optimizados agregados

#### Frontend (Pendiente)
- [ ] Página de checkout para seleccionar plan
- [ ] Integración con botones de pricing
- [ ] Página de retorno después del pago

---

## 🗄️ Base de Datos

### Tablas de MercadoPago

#### 1. `mercado_pago_credencial`
**Propósito:** Almacena las credenciales OAuth de MercadoPago para cada gimnasio.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| tenant_id | INT (PK) | ID del gimnasio |
| access_token | TEXT | Token de acceso OAuth |
| refresh_token | TEXT | Token para refrescar el access token |
| token_expira_en | TIMESTAMP | Fecha de expiración del token |
| mercado_pago_user_id | BIGINT | User ID de MercadoPago del dueño |
| public_key | TEXT | Public key para frontend/tokenización |
| activo | BOOLEAN | Estado de las credenciales |
| fecha_autorizacion | TIMESTAMP | Fecha de autorización OAuth |
| ultimo_refresco | TIMESTAMP | Último refresco del token |

**Relación:** Uno-a-uno con tenants

#### 2. `webhook_retry`
**Propósito:** Sistema de reintentos para webhooks fallidos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| tenant_id | INT | ID del gimnasio |
| payment_id | BIGINT | ID del pago en MercadoPago |
| tipo | TEXT | payment/refunded/chargeback |
| payload | JSON | JSON completo del webhook |
| intentos | INT | Cantidad de reintentos realizados |
| next_retry_at | TIMESTAMP | Próximo fecha de reintento |
| completado | BOOLEAN | Estado del proceso |
| error_ultimo_intento | TEXT | Error del último intento |

#### 3. `payment_audit`
**Propósito:** Auditoría completa de todos los eventos de pagos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| tenant_id | INT | ID del gimnasio |
| type | TEXT | preference|payment|preapproval|webhook |
| reference_id | BIGINT | ID de referencia en MercadoPago |
| status | TEXT | Estado del evento |
| amount | DECIMAL | Monto de la transacción |
| currency | TEXT | Moneda |
| email | TEXT | Email del pagador |
| message | TEXT | Mensaje del evento |
| payload | JSON | JSON completo del evento |

#### 4. `orden_pago`
Órdenes de pago de suscripciones de socios. Incluye `tenant_id`, `mercado_pago_preference_id`, `mercado_pago_payment_id`, `es_renovacion`, `es_cambio_plan`.

#### 5. `renovacion_suscripcion`
Renovaciones de suscripciones de socios. Incluye `tenant_id`, `mercado_pago_preference_id`, `mercado_pago_payment_id`, `metodo_pago` (1=Manual, 2=MercadoPago).

#### 6. `configuracion_renovacion`
Configuración de renovación automática por socio. Incluye `mercado_pago_card_token`, `ultimos_4_digitos`, `renovacion_automatica_habilitada`, `mercado_pago_preapproval_id`.

### Índices Optimizados

#### MercadoPago:
- `idx_mercado_pago_credencial_tenant` - Búsqueda por tenant
- `idx_mercado_pago_credencial_activo` - Credenciales activas
- `idx_webhook_retry_payment_id` - Búsqueda por payment_id
- `idx_webhook_retry_tenant` - Filtrado por tenant
- `idx_webhook_retry_completado` - Reintentos pendientes
- `idx_payment_audit_tenant` - Auditoría por tenant
- `idx_payment_audit_reference` - Búsqueda por referencia

#### Pagos y Renovaciones:
- `idx_orden_pago_preference_id` - Preferencias MP
- `idx_orden_pago_payment_id` - Pagos MP
- `uq_renovacion_preference_id` - Único preference_id
- `uq_renovacion_payment_id` - Único payment_id
- `idx_renovacion_socio_fecha` - Renovaciones por socio/fecha

---

## 🔒 Seguridad

### Tokens Cifrados

Los `access_token` y `refresh_token` se almacenan **cifrados** en la base de datos.

### Nunca Exponer

- ❌ Access tokens en el frontend
- ❌ App secrets en código
- ❌ Credenciales en commits

### Siempre Usar

- ✅ Public key para el frontend (tokenización)
- ✅ Access token solo desde el backend
- ✅ Variables de entorno para configuración

---

## 🐛 Solución de Problemas

### Error: "Tenant no tiene credenciales de MercadoPago"

**Causa:** El gimnasio no ha conectado su cuenta de MercadoPago

**Solución:**
- Ir a Configuración → Integraciones → MercadoPago
- Conectar con OAuth

### Error: "Webhook no recibido"

**Causa:** URL de webhook incorrecta o no configurada

**Solución:**
- Verificar URL en MercadoPago Developers
- Verificar que el servidor sea accesible públicamente
- Revisar tabla `webhook_retry` para ver reintentos pendientes

### Error: "Pago no se procesa"

**Causa:** Múltiples razones posibles

**Solución:**
1. Verificar `payment_audit` para ver el error exacto
2. Verificar que las credenciales sean válidas (`mercado_pago_credencial.activo = true`)
3. Verificar que el token no haya expirado (`token_expira_en > NOW()`)
4. Revisar logs del backend

---

## 📊 Monitoreo

### Consultas Útiles

```sql
-- Ver credenciales configuradas
SELECT * FROM mercado_pago_credencial WHERE tenant_id = 1;

-- Ver auditoría de pagos (últimas 24 horas)
SELECT * FROM payment_audit
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND tenant_id = 1
ORDER BY created_at DESC;

-- Ver reintentos fallidos
SELECT * FROM webhook_retry
WHERE completado = false
  AND tenant_id = 1
ORDER BY next_retry_at;

-- Suscripciones con renovación automática
SELECT cr.*, s.nombre
FROM configuracion_renovacion cr
JOIN socio s ON s.id = cr.socio_id
WHERE cr.renovacion_automatica_habilitada = true
  AND cr.tenant_id = 1;
```

### Checklist de Producción

- [ ] Cada gimnasio tiene su propia cuenta de MercadoPago
- [ ] Webhooks configurados correctamente
- [ ] Tokens OAuth válidos y no expirados
- [ ] Credenciales cifradas en base de datos
- [ ] Sistema de reintentos funcionando
- [ ] Auditoría de pagos activa
- [ ] Renovación automática probada
- [ ] Documentación compartida con admins

---

## 📞 Soporte

Si necesitas ayuda:
1. Verificar `payment_audit` para ver errores detallados
2. Revisar logs del backend
3. Consultar documentación de [MercadoPago Developers](https://www.mercadopago.com.ar/developers)

---

**Última actualización:** 2026-02-26
