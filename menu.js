// ======================================================
//  IMPORTAR FIREBASE
// ======================================================
import { auth, db } from "./firebase.js";
import { 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    doc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ======================================================
//  ELEMENTOS
// ======================================================
const userNameDiv = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

// ======================================================
//  PROTEÇÃO DE ACESSO + BUSCAR NOME DO FIRESTORE
// ======================================================
onAuthStateChanged(auth, async user => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    let nome = "";

    try {
        // 1. Buscar documento do utilizador no Firestore
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().nome) {
            nome = snap.data().nome; // nome vindo da coleção users
        } else if (user.displayName) {
            nome = user.displayName; // nome do Firebase Auth
        } else {
            nome = user.email.split("@")[0]; // fallback bonito
        }

    } catch (err) {
        // Se der erro, usa fallback
        nome = user.displayName || user.email.split("@")[0];
    }

    userNameDiv.textContent = nome;
});

// ======================================================
//  LOGOUT
// ======================================================
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });
}
