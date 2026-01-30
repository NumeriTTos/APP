// ------------------------------
// 1. Importar Firebase
// ------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ------------------------------
// 2. Configuração do Firebase
// ------------------------------
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyoIj0xb9Vk-kz0Ln8pwIx7rUcrp_F6aM",
  authDomain: "wapp-1f195.firebaseapp.com",
  projectId: "wapp-1f195",
  storageBucket: "wapp-1f195.firebasestorage.app",
  messagingSenderId: "1042673353512",
  appId: "1:1042673353512:web:0a01dd53b9af3fa70b061d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ------------------------------
// 3. Inicializar Firebase
// ------------------------------
const app = initializeApp(firebaseConfig);

// ------------------------------
// 4. Exportar serviços
// ------------------------------
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


