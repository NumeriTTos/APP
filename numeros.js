// ======================================================
// 1. FIREBASE + PROTEÇÃO DE ACESSO
// ======================================================
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    currentUser = user;
});

// ======================================================
// 2. ELEMENTOS DO DOM
// ======================================================
const numero = document.getElementById("numero");
const valor = document.getElementById("valor");
const aviso = document.getElementById("aviso");
const botao = document.getElementById("botao");
const lista = document.getElementById("lista");
const apagarTudo = document.getElementById("apagarTudo");
const totalGlobalSpan = document.getElementById("totalGlobal");
const pesquisa = document.getElementById("pesquisa");

let acabouDeRegistar = false;

// ======================================================
// 3. POPUP MODERNO
// ======================================================
function mostrarPopupConfirmacao(mensagem) {
    return new Promise(resolve => {
        const popup = document.getElementById("popup-confirmacao");
        const msg = document.getElementById("popup-mensagem");
        const btnSim = document.getElementById("popup-sim");
        const btnNao = document.getElementById("popup-nao");

        msg.textContent = mensagem;
        popup.style.display = "flex";

        btnSim.onclick = () => { popup.style.display = "none"; resolve(true); };
        btnNao.onclick = () => { popup.style.display = "none"; resolve(false); };
    });
}

// ======================================================
// 4. LOCALSTORAGE (A SER SUBSTITUÍDO POR FIRESTORE)
// ======================================================
let fixos = JSON.parse(localStorage.getItem("fixos")) || [];
let totais = JSON.parse(localStorage.getItem("totais")) || {};

function guardarLista() {
    const itens = [];
    document.querySelectorAll("#lista li:not(.fixo)").forEach(li => {
        itens.push({
            numero: li.dataset.numero,
            valor: li.dataset.valor,
            texto: li.querySelector(".extra-input").value || ""
        });
    });
    localStorage.setItem("registos", JSON.stringify(itens));
}

function guardarFixos() {
    localStorage.setItem("fixos", JSON.stringify(fixos));
}

// ======================================================
// 5. TOTAIS
// ======================================================
function totalDoNumero(num) {
    return totais[num] ? parseFloat(totais[num]) : 0;
}

function atualizarTotal(num, valor) {
    if (!totais[num]) totais[num] = 0;
    totais[num] = parseFloat(totais[num]) + parseFloat(valor);
    localStorage.setItem("totais", JSON.stringify(totais));
}

function mostrarTotalDoNumero() {
    const num = numero.value;
    totalGlobalSpan.textContent = totalDoNumero(num).toFixed(2);
}

// ======================================================
// 6. CARREGAR LISTA AO INICIAR (AGORA COM FIRESTORE)
// ======================================================
window.addEventListener("load", async () => {
    // Carregar fixos (por enquanto ainda do localStorage)
    fixos.forEach(item => adicionarItemNaLista(item, true));

    // Carregar números do Firestore
    await carregarNumerosFirestore();
});

// ======================================================
// 7. ADICIONAR ITEM À LISTA
// ======================================================
function adicionarItemNaLista(obj, isFixo = false) {

    const num = obj.numero;
    const val = obj.valor;
    const textoGuardado = obj.texto || "";

    const li = document.createElement("li");
    li.dataset.numero = num;
    li.dataset.valor = val;

    if (isFixo) li.classList.add("fixo");

    // Texto principal
    const info = document.createElement("span");
    info.className = "info";
    info.textContent = `${num} — ${parseFloat(val).toFixed(2)}`;
    li.appendChild(info);

    // Caixa extra
    const extraInput = document.createElement("input");
    extraInput.type = "text";
    extraInput.className = "extra-input";
    extraInput.placeholder = "txt";
    extraInput.value = textoGuardado;
    li.appendChild(extraInput);

    extraInput.addEventListener("input", () => {
        if (isFixo) {
            const item = fixos.find(f => f.numero === num && f.valor === val);
            if (item) item.texto = extraInput.value;
            guardarFixos();
        } else {
            guardarLista();
        }
    });

    // Botão apagar
    const btnApagar = document.createElement("button");
    btnApagar.textContent = "X";
    btnApagar.className = "apagar";

    btnApagar.addEventListener("click", () => {
        mostrarPopupConfirmacao("Tem a certeza que deseja apagar este número?")
            .then(confirmar => {
                if (!confirmar) return;

                li.remove();
                atualizarTotal(num, -parseFloat(val));

                if (isFixo) {
                    fixos = fixos.filter(f => !(f.numero === num && f.valor === val));
                    guardarFixos();
                } else {
                    guardarLista();
                }

                mostrarTotalDoNumero();
            });
    });

    li.appendChild(btnApagar);

    // Botão fixar
    if (!isFixo) {
        const btnFixo = document.createElement("button");
        btnFixo.textContent = "📌";
        btnFixo.className = "btn-fixo";

        btnFixo.addEventListener("click", () => {
            fixos.push({ numero: num, valor: val, texto: extraInput.value });
            guardarFixos();

            li.remove();
            guardarLista();

            adicionarItemNaLista({ numero: num, valor: val, texto: extraInput.value }, true);
            mostrarTotalDoNumero();
        });

        li.appendChild(btnFixo);
    }

    // Botão desfazer fixo
    if (isFixo) {
        const btnDesfazer = document.createElement("button");
        btnDesfazer.textContent = "✓";
        btnDesfazer.className = "desfazer-fixo";

        btnDesfazer.addEventListener("click", () => {
            fixos = fixos.filter(f => !(f.numero === num && f.valor === val));
            guardarFixos();

            li.remove();
            adicionarItemNaLista({ numero: num, valor: val, texto: extraInput.value }, false);
            guardarLista();
            mostrarTotalDoNumero();
        });

        li.appendChild(btnDesfazer);
    }

    lista.appendChild(li);
}

// ======================================================
// 8. VALIDAÇÕES
// ======================================================
numero.addEventListener("input", () => {
    numero.value = numero.value.replace(/[^0-9]/g, "").slice(0, 3);
    if (numero.value.length === 3) valor.focus();
    mostrarTotalDoNumero();
    validarTudo();
});

valor.addEventListener("input", () => {
    let v = valor.value.replace(",", ".").replace(/[^0-9.]/g, "");
    const partes = v.split(".");
    if (partes.length > 2) v = partes[0] + "." + partes[1];
    valor.value = v;
    validarTudo();
});

valor.addEventListener("blur", () => {
    let num = parseFloat(valor.value);
    if (!isNaN(num)) valor.value = num.toFixed(2);
    validarTudo();
});

function validarTudo() {

    if (acabouDeRegistar) {
        acabouDeRegistar = false;
        return;
    }

    const min = 0.25;
    const max = 50;
    let numValor = parseFloat(valor.value);

    if (numero.value.length !== 3)
        return erro("⚠️ O número deve ter 3 dígitos");

    if (isNaN(numValor))
        return erro("⚠️ Introduza um valor válido");

    if (numValor < min || numValor > max)
        return erro(`⚠️ Valor deve estar entre ${min.toFixed(2)} e ${max.toFixed(2)}`);

    if ((numValor * 100) % 25 !== 0)
        return erro("⚠️ O valor deve ser múltiplo de 0.25");

    const falta = 100 - totalDoNumero(numero.value);
    if (numValor > falta)
        return erro(`⚠️ Este número só pode receber mais ${falta.toFixed(2)}`);

    aviso.textContent = "";
    botao.disabled = false;
}

function erro(msg) {
    aviso.textContent = msg;
    aviso.style.color = "red";
    botao.disabled = true;
}

// ======================================================
// 9. ENTER → CONFIRMAR
// ======================================================
document.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        if (!botao.disabled) botao.click();
    }
});

// ======================================================
// 10. FIRESTORE: GUARDAR + LER
// ======================================================
async function guardarNumeroFirestore(num, valor, texto) {
    if (!currentUser) return;

    await addDoc(
        collection(db, "users", currentUser.uid, "numeros"),
        {
            numero: num,
            valor: valor,
            texto: texto,
            timestamp: Date.now()
        }
    );
}

async function carregarNumerosFirestore() {
    if (!currentUser) return;

    const snap = await getDocs(
        collection(db, "users", currentUser.uid, "numeros")
    );

    snap.forEach(doc => {
        const item = doc.data();
        adicionarItemNaLista({
            numero: item.numero,
            valor: item.valor,
            texto: item.texto || ""
        }, false);
    });
}

// ======================================================
// 11. REGISTAR ITEM
// ======================================================
botao.addEventListener("click", async e => {
    e.preventDefault();

    let val = parseFloat(valor.value);
    if (!isNaN(val)) valor.value = val.toFixed(2);

    const num = numero.value;

    atualizarTotal(num, parseFloat(valor.value));
    mostrarTotalDoNumero();

    adicionarItemNaLista({ numero: num, valor: valor.value, texto: "" }, false);
    guardarLista();

    await guardarNumeroFirestore(num, valor.value, "");

    acabouDeRegistar = true;

    aviso.textContent = "✔️ Registado com sucesso!";
    aviso.style.color = "green";

    numero.value = "";
    valor.value = "";
    numero.focus();
    botao.disabled = true;
});

// ======================================================
// 12. APAGAR LISTA COMPLETA
// ======================================================
apagarTudo.addEventListener("click", () => {
    mostrarPopupConfirmacao("Tem a certeza que deseja apagar TODOS os números?")
        .then(confirmar => {
            if (!confirmar) return;

            document.querySelectorAll("#lista li:not(.fixo)").forEach(li => {
                atualizarTotal(li.dataset.numero, -parseFloat(li.dataset.valor));
                li.remove();
            });

            localStorage.removeItem("registos");
            localStorage.removeItem("totais");
            totais = {};
            mostrarTotalDoNumero();
        });
});

// ======================================================
// 13. PESQUISA
// ======================================================
pesquisa.addEventListener("input", () => {
    const termo = pesquisa.value.toLowerCase();
    document.querySelectorAll("#lista li").forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(termo) ? "flex" : "none";
    });
});
