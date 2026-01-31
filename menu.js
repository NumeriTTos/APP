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
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().nome) {
            nome = snap.data().nome;
        } else if (user.displayName) {
            nome = user.displayName;
        } else {
            nome = user.email.split("@")[0];
        }

    } catch (err) {
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
