const numero = document.getElementById("numero");
const valor = document.getElementById("valor");
const aviso = document.getElementById("aviso");
const botao = document.getElementById("botao");
const lista = document.getElementById("lista");
const apagarTudo = document.getElementById("apagarTudo");
const totalGlobalSpan = document.getElementById("totalGlobal");
const pesquisa = document.getElementById("pesquisa");

// Flag para impedir que validarTudo apague a mensagem após Enter
let acabouDeRegistar = false;

// -------------------------
//  FIXOS (LOCALSTORAGE)
// -------------------------
let fixos = JSON.parse(localStorage.getItem("fixos")) || [];

// -------------------------
//  TOTAIS POR NÚMERO
// -------------------------
let totais = JSON.parse(localStorage.getItem("totais")) || {};

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
    const total = totalDoNumero(num);
    totalGlobalSpan.textContent = total.toFixed(2);
}

// Impedir colagens
numero.addEventListener("paste", e => e.preventDefault());
valor.addEventListener("paste", e => e.preventDefault());

// -------------------------
//  CARREGAR LISTA AO INICIAR
// -------------------------
window.addEventListener("load", () => {
    fixos.forEach(item => adicionarItemNaLista(item.numero, item.valor, true));

    const dados = JSON.parse(localStorage.getItem("registos")) || [];
    dados.forEach(item => adicionarItemNaLista(item.numero, item.valor, false));
});

// -------------------------
//  GUARDAR LISTAS
// -------------------------
function guardarLista() {
    const itens = [];
    document.querySelectorAll("#lista li:not(.fixo)").forEach(li => {
        itens.push({
            numero: li.dataset.numero,
            valor: li.dataset.valor
        });
    });
    localStorage.setItem("registos", JSON.stringify(itens));
}

function guardarFixos() {
    localStorage.setItem("fixos", JSON.stringify(fixos));
}

// -------------------------
//  ADICIONAR ITEM À LISTA
// -------------------------
function adicionarItemNaLista(num, val, isFixo = false) {
    const li = document.createElement("li");
    li.dataset.numero = num;
    li.dataset.valor = val;

    if (isFixo) li.classList.add("fixo");

    // TEXTO
    const info = document.createElement("span");
    info.className = "info";
    info.textContent = `${num} — ${parseFloat(val).toFixed(2)}`;
    li.appendChild(info);

    // CAIXA DE TEXTO
    const extraInput = document.createElement("input");
    extraInput.type = "text";
    extraInput.className = "extra-input";
    extraInput.placeholder = "txt";
    li.appendChild(extraInput);

    // Botão apagar (X)
    const btnApagar = document.createElement("button");
    btnApagar.textContent = "X";
    btnApagar.className = "apagar";

    btnApagar.addEventListener("click", () => {

        // CONFIRMAÇÃO
        const confirmar = confirm("Tem a certeza que deseja apagar este número?");
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

    li.appendChild(btnApagar);

    // Botão tornar fixo (📌)
    if (!isFixo) {
        const btnFixo = document.createElement("button");
        btnFixo.textContent = "📌";
        btnFixo.className = "btn-fixo";

        btnFixo.addEventListener("click", () => {
            fixos.push({ numero: num, valor: val });
            guardarFixos();

            li.remove();
            guardarLista();

            adicionarItemNaLista(num, val, true);
            mostrarTotalDoNumero();
        });

        li.appendChild(btnFixo);
    }

    // Botão verde ✓ para desfazer fixo
    if (isFixo) {
        const btnDesfazer = document.createElement("button");
        btnDesfazer.textContent = "✓";
        btnDesfazer.className = "desfazer-fixo";

        btnDesfazer.addEventListener("click", () => {
            fixos = fixos.filter(f => !(f.numero === num && f.valor === val));
            guardarFixos();

            li.remove();
            adicionarItemNaLista(num, val, false);
            guardarLista();
            mostrarTotalDoNumero();
        });

        li.appendChild(btnDesfazer);
    }

    lista.appendChild(li);
}

// -------------------------
//  VALIDAÇÕES
// -------------------------
numero.addEventListener("input", () => {
    numero.value = numero.value.replace(/[^0-9]/g, "");
    if (numero.value.length >= 3) {
        numero.value = numero.value.slice(0, 3);
        valor.focus();
    }
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

    if (numero.value.length !== 3) {
        aviso.textContent = "⚠️ O número deve ter 3 dígitos";
        aviso.style.color = "red";
        botao.disabled = true;
        return;
    }

    if (isNaN(numValor)) {
        aviso.textContent = "⚠️ Introduza um valor válido";
        aviso.style.color = "red";
        botao.disabled = true;
        return;
    }

    if (numValor < min || numValor > max) {
        aviso.textContent = `⚠️ Valor deve estar entre ${min.toFixed(2)} e ${max.toFixed(2)}`;
        aviso.style.color = "red";
        botao.disabled = true;
        return;
    }

    if ((numValor * 100) % 25 !== 0) {
        aviso.textContent = "⚠️ O valor deve ser múltiplo de 0.25";
        aviso.style.color = "red";
        botao.disabled = true;
        return;
    }

    const num = numero.value;
    const totalAtual = totalDoNumero(num);
    const falta = 100 - totalAtual;

    if (numValor > falta) {
        aviso.textContent = `⚠️ Este número só pode receber mais ${falta.toFixed(2)}`;
        aviso.style.color = "red";
        botao.disabled = true;
        return;
    }

    aviso.textContent = "";
    botao.disabled = false;
}

// -------------------------
//  ENTER → SÓ CONFIRMA SE BOTÃO ESTIVER ATIVO
// -------------------------
document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();

        if (!botao.disabled) {
            botao.click();
        }
    }
});

// -------------------------
//  REGISTAR ITEM NORMAL
// -------------------------
botao.addEventListener("click", (e) => {
    e.preventDefault();

    let val = parseFloat(valor.value);
    if (!isNaN(val)) {
        val = val.toFixed(2);
        valor.value = val;
    }

    const num = numero.value;

    atualizarTotal(num, val);
    mostrarTotalDoNumero();

    adicionarItemNaLista(num, val, false);
    guardarLista();

    acabouDeRegistar = true;

    aviso.textContent = "✔️ Registado com sucesso!";
    aviso.style.color = "green";

    numero.value = "";
    valor.value = "";
    numero.focus();
    botao.disabled = true;
});

// -------------------------
//  APAGAR LISTA COMPLETA (COM CONFIRMAÇÃO)
// -------------------------
apagarTudo.addEventListener("click", () => {

    const confirmar = confirm("Tem a certeza que deseja apagar TODOS os números?");
    if (!confirmar) return;

    document.querySelectorAll("#lista li:not(.fixo)").forEach(li => {
        const num = li.dataset.numero;
        const val = parseFloat(li.dataset.valor);
        atualizarTotal(num, -val);
        li.remove();
    });

    localStorage.removeItem("registos");
    mostrarTotalDoNumero();
});

// -------------------------
//  PESQUISA NA LISTA
// -------------------------
pesquisa.addEventListener("input", () => {
    const termo = pesquisa.value.toLowerCase();

    document.querySelectorAll("#lista li").forEach(li => {
        const texto = li.innerText.toLowerCase();
        li.style.display = texto.includes(termo) ? "flex" : "none";
    });
});
