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
const firebaseConfig = {
  apiKey: "AQUI",
  authDomain: "AQUI",
  projectId: "AQUI",
  storageBucket: "AQUI",
  messagingSenderId: "AQUI",
  appId: "AQUI"
};

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
