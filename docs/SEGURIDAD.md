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
