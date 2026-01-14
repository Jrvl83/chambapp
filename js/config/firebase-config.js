// ============================================
// FIREBASE CONFIG - ChambApp
// Configuracion de Firebase (script normal)
// ============================================

// Configuracion de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD5sAUSVp53lO0fVoHmFdlZwNOuctjREeM",
    authDomain: "chambapp-7785b.firebaseapp.com",
    projectId: "chambapp-7785b",
    storageBucket: "chambapp-7785b.firebasestorage.app",
    messagingSenderId: "986133070577",
    appId: "1:986133070577:web:91d07708f067ea91ac5f50"
};

// Exportar a window para scripts no-module
window.firebaseConfig = firebaseConfig;

console.log('✅ Firebase config cargado');
