# TÉRMINOS Y CONDICIONES - RESUMEN EJECUTIVO

## 📋 Sección 5: Cambios de Plan - Bajar de Nivel

### ⚠️ RESTRICCIÓN PRINCIPAL

**NO se permite bajar de plan si la cantidad actual de socios activos supera el límite del plan inferior.**

---

## 🔄 REGLAS DE CAMBIO DE PLAN

| Acción | Condición | Resultado |
|--------|-----------|-----------|
| **Subir de plan** | Siempre permitido | ✅ Cambio inmediato |
| **Bajar de plan** | Solo si `sociosActivos ≤ nuevoPlan.limite` | ✅ Cambio permitido |
| **Bajar de plan** | Si `sociosActivos > nuevoPlan.limite` | ❌ Cambio bloqueado |

---

## 📋 PROCEDIMIENTO PARA BAJAR DE PLAN

Si el gimnasio tiene **500 socios** y quiere pasar al plan **Básico (100 socios)**:

1. ❌ **NO se permite el cambio directo**
2. ✅ El Cliente debe primero:
   - Ir a "Socios" y dar de baja a 400+ socios (cambiarlos a "inactivo")
   - Quedarse con 100 o menos socios en estado "activo"
   - Volver a "Cambiar Plan" y seleccionar el Básico
3. ✅ Una vez con ≤100 socios activos, se permite el cambio

---

## 💾 POLÍTICA DE DATOS

- Los socios dados de baja **NO se eliminan**
- Se mantienen en la base de datos como **"inactivos"**
- Se preserva todo el historial:
  - ✅ Pagos realizados
  - ✅ Asistencias registradas
  - ✅ Rutinas asignadas
  - ✅ Evolución física
- Pueden reactivarse cuando el Cliente vuelva a subir de plan

---

## ❌ PROHIBICIÓN DE ABUSO

Está expresamente prohibido:
- Contratar plan alto, cargar masivamente datos, y luego bajar
- Eludir las restricciones técnicas mediante prácticas abusivas
- Compartir cuentas entre múltiples gimnasios

**Consecuencias:**
- 🚫 Suspensión del servicio
- 🚫 Cancelación sin reembolso
- 🚫 Bloqueo permanente de capacidad de bajar de plan

---

## 📜 EJEMPLO PRÁCTICO

### Escenario:
- Gimnasio "Muscle Gym" tiene 350 socios activos
- Plan actual: "Premium" (1000 socios)
- Quiere cambiar a: "Básico" (100 socios)

### Resultado:
```
❌ ERROR: No puedes bajar al plan Básico

Tienes 350 socios activos
El plan Básico permite máximo 100 socios

Primero debes dar de baja a 250+ socios.
```

### Qué debe hacer el Cliente:
1. Dar de baja 250+ socios (quedarse con 100 o menos)
2. Esperar a que queden ≤100 socios activos
3. Volver a intentar el cambio de plan
4. Si en el futuro quiere tener más socios, debe subir de plan nuevamente

---

## 🎯 RAZONAMIENTO DEL NEGOCIO

1. **Protege el modelo de revenue**
   - Los planes se pagan por capacidad usada
   - No se puede "engañar" al sistema para pagar menos

2. **Evita abusos**
   - Sin esta regla, todos contratarían Premium un mes, cargarían datos, y bajarían a Básico

3. **Mantiene la integridad del servicio**
   - Un plan para 100 socios no está optimizado para 500
   - La experiencia sería mala para el Cliente

4. **Es justo y predecible**
   - Las reglas están claras desde el principio
   - No hay sorpresas ni cambios arbitrarios

---

## 📞 SOPORTE AL CLIENTE

### Cuando un Cliente pregunta: "¿Por qué no puedo bajar de plan?"

**Respuesta sugerida:**

> "Hola. Gracias por consultar.
>
> Actualmente tienes [X] socios activos y el plan [Y] permite hasta [Z] socios.
>
> Según nuestros **Términos y Condiciones (Sección 5)**, solo podemos permitir bajar de plan cuando la cantidad de socios activos sea igual o inferior al límite del nuevo plan.
>
> Esto protege la integridad del servicio y evita abusos del sistema.
>
> **Opciones:**
> 1. Dar de baja socios hasta el límite permitido (los datos no se borran, solo se archivan)
> 2. Mantener tu plan actual
> 3. Subir de plan en el futuro cuando lo necesites
>
> Si tienes dudas, puedes revisar los Términos completos desde tu panel > Configuración SaaS > Términos y Condiciones."
