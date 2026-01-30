// ======================================================
//  IMPORTAR FIREBASE
// ======================================================
import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ======================================================
//  ELEMENTOS
// ======================================================
const userNameDiv = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

// ======================================================
//  PROTEÇÃO DE ACESSO
//  Se o utilizador não estiver autenticado → volta ao login
// ======================================================
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Mostrar nome ou email
    userNameDiv.textContent = user.displayName 
        ? user.displayName 
        : user.email;
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
