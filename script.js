const numero = document.getElementById("numero");
const valor = document.getElementById("valor");
const aviso = document.getElementById("aviso");
const botao = document.getElementById("botao");
const lista = document.getElementById("lista");
const apagarTudo = document.getElementById("apagarTudo");
const totalGlobalSpan = document.getElementById("totalGlobal");

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

// Carregar lista ao iniciar
window.addEventListener("load", () => {
    fixos.forEach(item => adicionarItemNaLista(item.numero, item.valor, true));

    const dados = JSON.parse(localStorage.getItem("registos")) || [];
    dados.forEach(item => adicionarItemNaLista(item.numero, item.valor, false));
});

// Guardar lista normal no localStorage
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

// Guardar fixos no localStorage
function guardarFixos() {
    localStorage.setItem("fixos", JSON.stringify(fixos));
}

// Criar item na lista
function adicionarItemNaLista(num, val, isFixo = false) {
    const li = document.createElement("li");
    li.dataset.numero = num;
    li.dataset.valor = val;

    if (isFixo) li.classList.add("fixo");

    // TEXTO (span .info)
    const info = document.createElement("span");
    info.className = "info";
    info.textContent = `Nº ${num} — ${val}`;
    li.appendChild(info);

    // Botão apagar
    const btnApagar = document.createElement("button");
    btnApagar.textContent = "Apagar";
    btnApagar.className = "apagar";

    btnApagar.addEventListener("click", () => {
        li.remove();

        // FIXOS CONTAM → subtrair sempre
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

    // Botão tornar fixo (normais)
    if (!isFixo) {
        const btnFixo = document.createElement("button");
        btnFixo.textContent = "Fixo";
        btnFixo.className = "fixo";

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

    // Botão remover fixo (fixos → normais)
    if (isFixo) {
        const btnRemoverFixo = document.createElement("button");
        btnRemoverFixo.textContent = "Normal";
        btnRemoverFixo.className = "remover";

        btnRemoverFixo.addEventListener("click", () => {
            fixos = fixos.filter(f => !(f.numero === num && f.valor === val));
            guardarFixos();

            li.remove();

            adicionarItemNaLista(num, val, false);
            guardarLista();
            mostrarTotalDoNumero();
        });

        li.appendChild(btnRemoverFixo);
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
    let v = valor.value;
    v = v.replace(",", ".");
    v = v.replace(/[^0-9.]/g, "");
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

    // LIMITE POR NÚMERO
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
//  REGISTAR ITEM NORMAL
// -------------------------
botao.addEventListener("click", (e) => {
    e.preventDefault();

    const val = parseFloat(valor.value);
    const num = numero.value;

    atualizarTotal(num, val);
    mostrarTotalDoNumero();

    adicionarItemNaLista(num, valor.value, false);
    guardarLista();

    aviso.textContent = "✔️ Registado com sucesso!";
    aviso.style.color = "green";

    numero.value = "";
    valor.value = "";
    numero.focus();
    botao.disabled = true;
});

// -------------------------
//  APAGAR LISTA COMPLETA (só normais)
// -------------------------
apagarTudo.addEventListener("click", () => {
    document.querySelectorAll("#lista li:not(.fixo)").forEach(li => {
        const num = li.dataset.numero;
        const val = parseFloat(li.dataset.valor);
        atualizarTotal(num, -val);
        li.remove();
    });

    localStorage.removeItem("registos");
    mostrarTotalDoNumero();
});
