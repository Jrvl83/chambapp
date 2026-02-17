// ============================================
// FIREBASE INIT - ChambApp
// Modulo ES6 con instancias inicializadas
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Configuracion de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD5sAUSVp53lO0fVoHmFdlZwNOuctjREeM",
    authDomain: "chambapp-7785b.firebaseapp.com",
    projectId: "chambapp-7785b",
    storageBucket: "chambapp-7785b.firebasestorage.app",
    messagingSenderId: "986133070577",
    appId: "1:986133070577:web:91d07708f067ea91ac5f50"
};

// Inicializar Firebase (una sola vez)
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
const storage = getStorage(app);

// ============================================
// EXPORTACIONES ES6 MODULE
// ============================================
export { app, auth, db, storage, firebaseConfig };
