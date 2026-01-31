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

const btnNumeros = document.getElementById("btn-numeros");
const btnSeries = document.getElementById("btn-series");
const diasContainer = document.getElementById("dias-container");
const diaBtns = document.querySelectorAll(".dia-btn");

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
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const dados = snap.docs[0].data();
            if (dados.nome) nome = dados.nome;
        }

        if (!nome) {
            nome = user.displayName || user.email.split("@")[0];
        }

    } catch (err) {
        console.error("Erro ao buscar nome no Firestore:", err);
        nome = user.displayName || user.email.split("@")[0];
    }

    userNameDiv.textContent = nome;
});

// ======================================================
//  MOSTRAR BOTÕES DE DIAS
// ======================================================
if (btnNumeros) {
    btnNumeros.addEventListener("click", () => {
        diasContainer.style.display = "block";
        localStorage.setItem("tipoRegisto", "numeros");
    });
}

if (btnSeries) {
    btnSeries.addEventListener("click", () => {
        diasContainer.style.display = "block";
        localStorage.setItem("tipoRegisto", "series");
    });
}

// ======================================================
//  SELECIONAR DIA E REDIRECIONAR
// ======================================================
diaBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const dia = btn.dataset.dia;
        const tipo = localStorage.getItem("tipoRegisto");

        localStorage.setItem("diaSelecionado", dia);

        if (tipo === "numeros") {
            window.location.href = "numeros.html";
        } else if (tipo === "series") {
            window.location.href = "series.html";
        }
    });
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
