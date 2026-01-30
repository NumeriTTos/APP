import { auth } from "./firebase.js";
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ======================================================
//  ELEMENTOS DO LOGIN
// ======================================================
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const loginEmailBtn = document.getElementById("loginEmailBtn");
const erro = document.getElementById("erro");

// ======================================================
//  LOGIN COM EMAIL + PASSWORD
// ======================================================
loginEmailBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();

    if (email === "" || pass === "") {
        erro.textContent = "⚠️ Preencha email e password";
        return;
    }

    signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            window.location.href = "menu.html";
        })
        .catch(err => {
            erro.textContent = "Erro: " + err.message;
        });
});

// ======================================================
//  SE JÁ ESTIVER AUTENTICADO → ENTRA DIRETO
// ======================================================
onAuthStateChanged(auth, user => {
    if (user) {
        window.location.href = "menu.html";
    }
});
