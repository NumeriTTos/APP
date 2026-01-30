// ======================================================
//  ELEMENTOS
// ======================================================
const userNameDiv = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

// ======================================================
//  PROTEÇÃO DE ACESSO
//  Se o utilizador não estiver autenticado → volta ao login
// ======================================================
auth.onAuthStateChanged(user => {
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
logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
});
