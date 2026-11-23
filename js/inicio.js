// =============================================================
// inicio.js — tela "Minhas metas" (index.html)
// =============================================================

const NOMES_STATUS = { "no-ritmo": "No ritmo", "atrasada": "Atrasada", "concluida": "Concluída" };

// Desenha um cartão para cada meta (US02, US05, US06)
function renderizarMetas() {
  const lista = document.getElementById("lista-metas");
  const metas = listarMetas();

  if (metas.length === 0) {
    lista.innerHTML = '<p class="vazio">Você ainda não tem metas. Que tal criar a primeira?</p>';
    return;
  }

  // Ordena pelo prazo mais próximo
  metas.sort((a, b) => paraData(a.prazo) - paraData(b.prazo));

  lista.innerHTML = metas.map(meta => {
    const status = statusMeta(meta);
    const pct = percentual(meta);
    return `
      <a class="cartao" href="meta.html?id=${meta.id}">
        <div class="linha">
          <div>
            <div class="nome-meta">${escaparHtml(meta.nome)}</div>
            <div class="detalhe">${escaparHtml(meta.categoria)} · até ${formatarData(meta.prazo)}</div>
          </div>
          <span class="selo ${status}">${NOMES_STATUS[status]}</span>
        </div>
        <div class="barra"><span class="${status}" style="width:${pct}%"></span></div>
        <div class="linha pequeno">
          <span>${formatarMoeda(valorGuardado(meta))} de ${formatarMoeda(meta.valorTotal)}</span>
          <strong>${Math.floor(pct)}%</strong>
        </div>
      </a>`;
  }).join("");
}

// Evita que um nome digitado com < > quebre a página
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

document.getElementById("restaurar").addEventListener("click", () => {
  if (confirm("Isso apaga suas metas e volta para os dados de exemplo. Continuar?")) {
    restaurarExemplos();
    renderizarMetas();
  }
});

carregarDados();
renderizarMetas();
