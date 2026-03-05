# 📜 Documentación Legal - GymSaaS

Esta carpeta contiene los documentos legales de GymSaaS en formato HTML para visualización en navegador y exportación a PDF.

## 📂 Archivos Disponibles

### 1. **terminos-condiciones-pdf.html**
Términos y Condiciones de Uso completos del servicio SaaS.

**Contenido principal:**
- Planes y límites de uso
- Cambios de plan (subir/bajar)
- Política de datos históricos
- Responsabilidades del cliente
- Pagos y facturación
- Cancelación y suspensión
- **Protección de datos personales y Derechos ARCO** (NUEVO)
- Renovación automática de planes (NUEVO)
- Período de prueba (Trial) de 14 días (NUEVO)
- Fuerza mayor
- Jurisdicción

**Sección destacada:** Sección 5 - Reglas sobre cambio de plan

**Total:** 19 secciones (actualizado Febrero 2026)

---

### 2. **politica-privacidad-pdf.html**
Política de Privacidad - Cumplimiento Ley 25.326 (Argentina)

**Contenido principal:**
- Responsable del tratamiento
- Datos personales recopilados
- Finalidad del tratamiento
- Base legal
- Destinatarios de datos
- Medidas de seguridad
- **Derechos ARCO** (Acceso, Rectificación, Cancelación, Oposición)
- Conservación de datos
- Datos de menores
- Contacto AAIP

**Importante:** Derechos de los titulares de datos personales

---

### 3. **politica-cookies-pdf.html**
Política de Cookies y tecnologías similares

**Contenido principal:**
- ¿Qué son las cookies?
- Tipos de cookies utilizadas
- Lista específica de cookies
- Cómo administrar cookies
- Cookies de MercadoPago
- Google Analytics
- Contacto

**Importante:** Configuración de privacidad en navegadores

---

## 🖨️ Cómo Generar PDFs

### Opción 1: Desde el navegador
1. Abre el archivo HTML en tu navegador (Chrome, Firefox, Edge)
2. Haz clic en el botón "🖨️ Imprimir / Guardar PDF"
3. En la ventana de impresión, selecciona "Guardar como PDF"
4. Ajusta márgenes y escala si es necesario
5. Haz clic en "Guardar"

### Opción 2: Desde el sitio en desarrollo
```
http://localhost:5173/terminos-legales/terminos-condiciones-pdf.html
http://localhost:5173/terminos-legales/politica-privacidad-pdf.html
http://localhost:5173/terminos-legales/politica-cookies-pdf.html
```

---

## 📌 Enlaces Útiles

### Componentes React (Frontend)
- `/frontend/src/views/saas/TerminosCondiciones.tsx`
- `/frontend/src/views/saas/PoliticaPrivacidad.tsx`
- `/frontend/src/views/saas/PoliticaCookies.tsx`

### Panel de Administración
Los usuarios pueden acceder desde:
```
Configuración SaaS > 📜 Términos y Condiciones
Configuración SaaS > 🔒 Política de Privacidad
Configuración SaaS > 🍪 Política de Cookies
```

---

## ⚖️ Marco Legal

Estos documentos cumplen con:

| Normativa | Alcance | Descripción |
|-----------|---------|-------------|
| **Ley 25.326** | Argentina | Protección de Datos Personales |
| **GDPR** | Unión Europea | Reglamento de Protección de Datos |
| **CCPA** | California | Privacidad del Consumidor |
| **Código Civil y Comercial** | Argentina | Contratos y responsabilidad |

---

## 📞 Contacto Legal

Para consultas sobre estos documentos:

- **Email:** privacy@gymsaas.com
- **AAIP:** derechoacceso@jgm.gob.ar
- **Teléfono AAIP:** +54 11 4238-4800

---

## ⚠️ Nota Importante

Estos documentos son una base sólida pero **DEBEN ser revisados por un abogado** antes de su uso en producción.

GymSaaS © 2026 - Todos los derechos reservados
