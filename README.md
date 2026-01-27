# ChambApp

Aplicación para conectar trabajadores con empleadores en Perú.

## URLs

| Entorno | URL |
|---------|-----|
| **Producción** | https://chambapp-7785b.web.app |
| Backup | https://jrvl83.github.io/chambapp |

## Stack Tecnológico

- **Frontend:** HTML5, CSS3, JavaScript ES6+ (vanilla)
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Hosting:** Firebase Hosting
- **APIs:** Google Maps, Geocoding, Places, Firebase Cloud Messaging

## Progreso

**Fase 1:** 57% completada (28/49 tareas)

### Features Implementadas
- Registro/Login con Firebase Auth
- Perfiles trabajadores y empleadores
- Publicar ofertas de trabajo
- Geolocalización y mapa interactivo
- Postulaciones con estados (pendiente/aceptado/rechazado/completado)
- Contacto directo vía WhatsApp
- Sistema de calificaciones bidireccional
- Filtros avanzados
- Notificaciones push (FCM)
- PWA instalable

## Desarrollo Local

```bash
# Clonar repo
git clone https://github.com/Jrvl83/chambapp.git
cd chambapp

# Ejecutar servidor local
npx serve
```

## Deploy

```bash
# Producción (Firebase Hosting)
firebase deploy --only hosting

# Cloud Functions
firebase deploy --only functions
```

## Documentación

- `CONTEXTO_CLAUDE_CODE.md` - Estado actual y configuración
- `FASE_1_DETALLADA.md` - Tareas detalladas Fase 1
- `ROADMAP_COMPLETO.md` - Vista general del proyecto

## Licencia

Proyecto privado - Todos los derechos reservados.

---

**Fundador:** Joel (jrvl83)
**Última actualización:** 26 Enero 2026
