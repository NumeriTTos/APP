// ======================================================
//  IMPORTAR FIREBASE
// ======================================================
import { auth, db } from "./firebase.js";
import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    query,
    where,
    getDocs
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
        // Procurar na coleção "users" pelo campo "email" igual ao email do utilizador autenticado
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const dados = snap.docs[0].data();
            if (dados.nome) {
                nome = dados.nome;
            }
        }

        // Se ainda não tiver nome, usar displayName ou parte do email
        if (!nome) {
            if (user.displayName) {
                nome = user.displayName;
            } else {
                nome = user.email.split("@")[0];
            }
        }

    } catch (err) {
        console.error("Erro ao buscar nome no Firestore:", err);
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
