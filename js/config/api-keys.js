// ============================================
// API KEYS - ChambApp
// Configuracion centralizada de API Keys
// ============================================

// ⚠️ IMPORTANTE - SEGURIDAD:
// Estas API keys son visibles en el frontend.
// Para protegerlas, configura restricciones en Google Cloud Console:
// 1. Ve a: https://console.cloud.google.com/apis/credentials
// 2. Selecciona cada API key
// 3. En "Restricciones de aplicacion", selecciona "Sitios web HTTP"
// 4. Agrega tus dominios permitidos:
//    - https://chambapp-7785b.web.app/*
//    - https://chambapp-7785b.firebaseapp.com/*
//    - http://localhost:*
// 5. En "Restricciones de API", limita a solo las APIs necesarias:
//    - Maps JavaScript API
//    - Geocoding API
//    - Places API

// ============================================
// GOOGLE MAPS API KEYS
// ============================================

/**
 * API Key para Google Maps JavaScript API + Geocoding API
 * Usado en: google-maps.js (mapas), geolocation.js (geocodificación)
 * Tiene habilitadas: Maps JavaScript API, Geocoding API, Places API
 */
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE';

// ============================================
// COMPATIBILIDAD CON SCRIPTS NO-MODULE
// ============================================
window.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;

