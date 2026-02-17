# Checklist de Seguridad - ChambApp

## Acciones Manuales (Google Cloud Console)

### 1. Restringir Google Maps API Key
- [ ] Ir a: https://console.cloud.google.com/apis/credentials
- [ ] Seleccionar key: `AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE`
- [ ] Restricciones de aplicacion > "Sitios web HTTP referrers"
- [ ] Agregar dominios:
  - `https://chambapp-7785b.web.app/*`
  - `https://chambapp-7785b.firebaseapp.com/*`
  - `http://localhost:*`
  - `http://127.0.0.1:*`
- [ ] Restricciones de API > solo estas APIs:
  - Maps JavaScript API
  - Geocoding API
  - Places API

### 2. Restringir Firebase API Key (opcional, defensa en profundidad)
- [ ] Seleccionar key: `AIzaSyD5sAUSVp53lO0fVoHmFdlZwNOuctjREeM`
- [ ] Restricciones HTTP referrers (mismos dominios)
- [ ] Restricciones de API:
  - Identity Toolkit API
  - Firebase Installations API
  - Cloud Firestore API
  - Cloud Storage for Firebase API
  - Firebase Cloud Messaging API

### 3. Eliminar key deprecated
- [ ] Eliminar key `AIzaSyBxUb73baTPSq_nvX5vCjGN_d_ctEC8ySs` de Google Cloud Console (ya no se usa en codigo)

### 4. Deploy rules
```bash
firebase deploy --only firestore:rules,storage
```

### 5. Habilitar Google Sign-In en Firebase
- [ ] Ir a: Firebase Console > Authentication > Sign-in method
- [ ] Click en "Google"
- [ ] Habilitar toggle
- [ ] Nombre público del proyecto: `ChambApp`
- [ ] Email de soporte: (email del proyecto)
- [ ] Guardar

### 6. Configurar Email Templates Brandeados
- [ ] Ir a: Firebase Console > Authentication > Templates

**Template: Verificación de email**
- [ ] Sender name: `ChambApp`
- [ ] Subject: `Verifica tu email - ChambApp`
- [ ] Personalizar mensaje con HTML:

```html
<div style="max-width:520px;margin:0 auto;font-family:'Inter',-apple-system,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#0066FF,#0052CC);padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;">ChambApp</h1>
    <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:8px 0 0;">Tu próxima chamba está aquí</p>
  </div>
  <div style="padding:32px 24px;">
    <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px;">Verifica tu email</h2>
    <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Hola, gracias por registrarte en ChambApp. Para completar tu registro, verifica tu email haciendo clic en el botón:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="%LINK%" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#0052CC);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">
        Verificar Email
      </a>
    </div>
    <p style="color:#94a3b8;font-size:13px;line-height:1.5;">
      Si no creaste una cuenta en ChambApp, puedes ignorar este email.
    </p>
  </div>
  <div style="background:#f1f5f9;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 ChambApp - Conectando talento con oportunidades en Perú</p>
  </div>
</div>
```

**Template: Restablecimiento de contraseña**
- [ ] Subject: `Restablece tu contraseña - ChambApp`
- [ ] Mismo header/footer, cambiar body a:

```html
    <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px;">Restablece tu contraseña</h2>
    <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en ChambApp. Haz clic en el botón para crear una nueva:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="%LINK%" style="display:inline-block;background:linear-gradient(135deg,#0066FF,#0052CC);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">
        Restablecer Contraseña
      </a>
    </div>
    <p style="color:#94a3b8;font-size:13px;line-height:1.5;">
      Si no solicitaste esto, puedes ignorar este email. Tu contraseña no cambiará.<br>
      Este enlace expira en 1 hora.
    </p>
```

## Fixes Implementados (17/02/26)

### XSS Prevention
- `escapeHtml()` aplicado en 6 archivos que usaban innerHTML con datos de usuario
- `textContent` en lugar de `innerHTML` para texto plano (dashboard header)
- Archivos corregidos: historial-calificaciones.js, oferta-card.js, dashboard.js, dashboard/index.js, mis-aplicaciones-trabajador.js, mis-aplicaciones.js

### Firestore Rules
- `ofertas` create: restringido a usuarios tipo 'empleador'
- `aplicaciones` read: solo usuarios autenticados (ownership check NO viable en read porque las queries usan campos variados: aplicanteEmail, empleadorEmail, ofertaId)
- `aplicaciones` update: ownership check por uid + email (aplicanteId/empleadorId/aplicanteEmail/empleadorEmail)
- `usuarios` read: publico (necesario para perfil-publico.html) - TODO separar datos sensibles

### Storage Rules
- `ofertas/`: agregada validacion de tamano (<5MB) y tipo (solo imagenes)

### Limpieza
- Eliminados console.log de archivos de configuracion
- Reemplazado `document.write()` con `createElement` en 3 HTML
- Eliminados 6 reportes Lighthouse que contenian API keys capturadas
- Eliminada API key deprecated (GOOGLE_GEOCODING_API_KEY)
- geolocation.js migrado a usar GOOGLE_MAPS_API_KEY

## Riesgos Aceptados
- **usuarios read: if true** - Necesario para perfil-publico.html. Fix futuro: crear coleccion `perfiles_publicos` con solo datos publicos.
- **aplicaciones read: if auth != null** - Ownership check en read no es viable porque las queries usan campos variados (email, ofertaId) y Firestore rechaza list queries cuando resource.data checks no coinciden con los where() de la query. La proteccion real esta en update (ownership check) y en que el codigo cliente ya filtra por email/id.
- **API keys en codigo cliente** - Normal para Firebase/Google Maps. La seguridad real esta en las restricciones de dominio (Cloud Console) y Firestore/Storage rules.
