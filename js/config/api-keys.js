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
//    - https://jrvl83.github.io/*
//    - http://localhost:*
// 5. En "Restricciones de API", limita a solo las APIs necesarias:
//    - Maps JavaScript API
//    - Geocoding API
//    - Places API

// ============================================
// GOOGLE MAPS API KEYS
// ============================================

/**
 * API Key para Google Maps JavaScript API
 * Usado en: google-maps.js (mapas interactivos)
 */
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE';

/**
 * API Key para Google Geocoding API
 * Usado en: geolocation.js (convertir coordenadas a direcciones)
 */
export const GOOGLE_GEOCODING_API_KEY = 'AIzaSyBxUb73baTPSq_nvX5vCjGN_d_ctEC8ySs';

// ============================================
// COMPATIBILIDAD CON SCRIPTS NO-MODULE
// ============================================
window.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;
window.GOOGLE_GEOCODING_API_KEY = GOOGLE_GEOCODING_API_KEY;

console.log('✅ API Keys cargadas');
