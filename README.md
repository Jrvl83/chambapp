# ChambApp

Marketplace de trabajos temporales para Perú. Conecta trabajadores con empleadores.

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

**Fase 1:** 65% completada (32/49 tareas)

### Features Implementadas
- Registro/Login con Firebase Auth
- Perfiles trabajadores y empleadores
- Publicar ofertas de trabajo con geolocalización
- Mapa interactivo de ofertas
- Postulaciones con estados
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

Ver carpeta `docs/`:
- [docs/PROYECTO.md](docs/PROYECTO.md) - Estado del proyecto y roadmap
- [docs/UX_UI_GUIA_MAESTRA.md](docs/UX_UI_GUIA_MAESTRA.md) - Guía de diseño
- [docs/REGLAS_DESARROLLO.md](docs/REGLAS_DESARROLLO.md) - Estándares de código

## Licencia

Proyecto privado - Todos los derechos reservados.

---

**Fundador:** Joel (jrvl83)
**Última actualización:** 30 Enero 2026
