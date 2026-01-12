// ============================================
// FIREBASE CONFIG - ChambApp
// Configuracion e inicializacion de Firebase
// ============================================

// Import Firebase SDK modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Configuracion de Firebase para ChambApp
const firebaseConfig = {
  apiKey: "AIzaSyD5sAUSVp53lO0fVoHmFdlZwNOuctjREeM",
  authDomain: "chambapp-7785b.firebaseapp.com",
  projectId: "chambapp-7785b",
  storageBucket: "chambapp-7785b.firebasestorage.app",
  messagingSenderId: "986133070577",
  appId: "1:986133070577:web:91d07708f067ea91ac5f50"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportar instancias para usar en otros modulos
export { auth, db, storage };

// Tambien disponible en window para scripts no-module (legacy)
window.firebaseConfig = firebaseConfig;
