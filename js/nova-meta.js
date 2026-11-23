// =============================================================
// nova-meta.js — criar meta (US01) e editar meta (US08)
// Se a URL tiver ?id=2, a tela entra no modo edição.
// =============================================================

const form = document.getElementById("form-meta");
const campoNome = document.getElementById("nome");
const campoValor = document.getElementById("valor");
const campoPrazo = document.getElementById("prazo");
const campoCategoria = document.getElementById("categoria");

const idEdicao = new URLSearchParams(location.search).get("id");
let metaEditada = null;

// Modo edição: preenche o formulário com os dados da meta
if (idEdicao) {
  metaEditada = buscarMeta(idEdicao);
  if (metaEditada) {
    document.getElementById("titulo").textContent = "Editar meta";
    document.title = "Mealheiro — Editar meta";
    campoNome.value = metaEditada.nome;
    campoValor.value = metaEditada.valorTotal;
    campoPrazo.value = metaEditada.prazo;
    campoCategoria.value = metaEditada.categoria;
    document.getElementById("cancelar").href = "meta.html?id=" + metaEditada.id;
  }
}

// O prazo mínimo no calendário é amanhã
const amanha = new Date(hoje().getTime() + UM_DIA);
campoPrazo.min = amanha.getFullYear() + "-" + String(amanha.getMonth() + 1).padStart(2, "0") + "-" + String(amanha.getDate()).padStart(2, "0");

// Mostra quanto guardar por mês enquanto a pessoa preenche
function atualizarPrevia() {
  const valor = Number(campoValor.value);
  const prazo = campoPrazo.value;
  const previa = document.getElementById("previa");

  if (!(valor > 0) || !prazo || paraData(prazo) <= hoje()) {
    previa.hidden = true;
    return;
  }

  const rascunho = {
    valorTotal: valor,
    prazo: prazo,
    depositos: metaEditada ? metaEditada.depositos : []
  };
  const meses = mesesRestantes(rascunho);
  document.getElementById("previa-valor").textContent = formatarMoeda(valorMensal(rascunho)) + " por mês";
  document.getElementById("previa-meses").textContent = meses === 1 ? "1 mês até o prazo" : meses + " meses até o prazo";
  previa.hidden = false;
}

campoValor.addEventListener("input", atualizarPrevia);
campoPrazo.addEventListener("input", atualizarPrevia);

// Ao corrigir um campo, a mensagem de erro dele some
[["nome", campoNome], ["valor", campoValor], ["prazo", campoPrazo]].forEach(([chave, campo]) => {
  campo.addEventListener("input", () => {
    document.getElementById("erro-" + chave).textContent = "";
    campo.classList.remove("invalido");
  });
});

// Mostra (ou limpa) a mensagem de erro de cada campo
function mostrarErros(erros) {
  [["nome", campoNome], ["valor", campoValor], ["prazo", campoPrazo]].forEach(([chave, campo]) => {
    document.getElementById("erro-" + chave).textContent = erros[chave] || "";
    campo.classList.toggle("invalido", Boolean(erros[chave]));
  });
}

form.addEventListener("submit", evento => {
  evento.preventDefault();

  const nome = campoNome.value;
  const valor = Number(campoValor.value);
  const prazo = campoPrazo.value;

  const erros = validarMeta(nome, valor, prazo);
  mostrarErros(erros);
  if (Object.keys(erros).length > 0) return; // não salva se tiver erro

  const meta = metaEditada || { criadaEm: hojeTexto(), depositos: [] };
  meta.nome = nome.trim();
  meta.valorTotal = valor;
  meta.prazo = prazo;
  meta.categoria = campoCategoria.value;

  const salva = salvarMeta(meta);
  location.href = metaEditada ? "meta.html?id=" + salva.id : "index.html";
});

atualizarPrevia();
