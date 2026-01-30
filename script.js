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

    auth.signInWithEmailAndPassword(email, pass)
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
auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = "menu.html";
    }
});
