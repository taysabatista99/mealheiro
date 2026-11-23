// =============================================================
// detalhe.js — tela "Detalhe da meta" (meta.html?id=1)
// Progresso, valor mensal, alerta, depósitos, previsão e gráfico
// =============================================================

carregarDados();

const idMeta = Number(new URLSearchParams(location.search).get("id"));
const NOMES_STATUS = { "no-ritmo": "No ritmo", "atrasada": "Atrasada", "concluida": "Concluída" };
let grafico = null;

// Se a meta não existir (id errado ou excluída), volta para o início
if (!buscarMeta(idMeta)) {
  location.href = "index.html";
}

document.getElementById("data-deposito").value = hojeTexto();
document.getElementById("data-deposito").max = hojeTexto();
document.getElementById("editar").href = "nova-meta.html?id=" + idMeta;

function renderizarTela() {
  const meta = buscarMeta(idMeta);
  if (!meta) return;

  const status = statusMeta(meta);
  const guardado = valorGuardado(meta);
  const pct = percentual(meta);

  // Topo
  document.title = "Mealheiro — " + meta.nome;
  document.getElementById("nome-meta").textContent = meta.nome;
  document.getElementById("resumo-meta").textContent =
    `${formatarMoeda(guardado)} de ${formatarMoeda(meta.valorTotal)} · até ${formatarData(meta.prazo)}`;

  // Progresso e selo (US05)
  document.getElementById("percentual").textContent = Math.floor(pct) + "%";
  const selo = document.getElementById("selo");
  selo.className = "selo " + status;
  selo.textContent = NOMES_STATUS[status];
  const barra = document.getElementById("barra");
  barra.className = status;
  barra.style.width = pct + "%";

  // Valor mensal (US03)
  if (status === "concluida") {
    document.getElementById("rotulo-mensal").textContent = "Meta atingida!";
    document.getElementById("valor-mensal").textContent = "🎉";
  } else {
    document.getElementById("rotulo-mensal").textContent = "Guardar por mês";
    document.getElementById("valor-mensal").textContent = formatarMoeda(valorMensal(meta));
  }

  // Alerta de atraso (US06)
  const aviso = document.getElementById("aviso");
  if (status === "atrasada") {
    aviso.className = "cartao alerta";
    aviso.innerHTML = `Até hoje você deveria ter <strong>${formatarMoeda(valorEsperadoHoje(meta))}</strong>. ` +
      `Deposite <strong>${formatarMoeda(faltaParaRitmo(meta))}</strong> para voltar ao ritmo.`;
  } else if (status === "no-ritmo") {
    aviso.className = "cartao aviso-ok";
    aviso.textContent = "Você está no ritmo certo para chegar à meta no prazo. Continue assim!";
  } else {
    aviso.className = "cartao aviso-ok";
    aviso.textContent = "Parabéns! Você atingiu esta meta.";
  }

  renderizarPrevisao(meta, status);
  renderizarHistorico(meta);
  renderizarGrafico(meta);
}

// Previsão da data de conclusão (US09)
function renderizarPrevisao(meta, status) {
  const bloco = document.getElementById("bloco-previsao");
  const texto = document.getElementById("texto-previsao");
  if (status === "concluida") { bloco.hidden = true; return; }

  bloco.hidden = false;
  const previsao = previsaoConclusao(meta);
  if (!previsao) {
    texto.textContent = "Registre pelo menos 2 depósitos para ver a previsão.";
    return;
  }
  const noPrazo = previsao <= paraData(meta.prazo);
  texto.innerHTML = `No ritmo atual, você atinge a meta em <strong>${formatarData(previsao)}</strong> — ` +
    (noPrazo ? "dentro do prazo. 👏" : "<strong>depois do prazo</strong>. Aumente um pouco os depósitos.");
}

// Histórico, do mais recente para o mais antigo (US07)
function renderizarHistorico(meta) {
  const lista = document.getElementById("historico");
  const depositos = [...meta.depositos].sort((a, b) => paraData(b.data) - paraData(a.data) || b.id - a.id);

  if (depositos.length === 0) {
    lista.innerHTML = '<li class="vazio">Nenhum depósito ainda.</li>';
    return;
  }

  lista.innerHTML = depositos.map(d => `
    <li>
      <span>${formatarData(d.data)}</span>
      <span><strong>${formatarMoeda(d.valor)}</strong>
        <button type="button" data-id="${d.id}" title="Excluir depósito" aria-label="Excluir depósito de ${formatarMoeda(d.valor)}">×</button>
      </span>
    </li>`).join("");
}

// Gráfico: valor acumulado x ritmo esperado (US10)
function renderizarGrafico(meta) {
  const bloco = document.getElementById("bloco-grafico");
  if (typeof Chart === "undefined" || meta.depositos.length === 0) { // sem internet ou sem depósitos
    bloco.hidden = true;
    return;
  }
  bloco.hidden = false;

  const ordenados = [...meta.depositos].sort((a, b) => paraData(a.data) - paraData(b.data));
  const rotulos = [formatarData(meta.criadaEm)];
  const acumulado = [0];
  const esperado = [0];
  let soma = 0;
  ordenados.forEach(d => {
    soma += d.valor;
    rotulos.push(formatarData(d.data));
    acumulado.push(soma);
    esperado.push(Math.round(valorEsperadoHoje(meta, paraData(d.data))));
  });

  if (grafico) grafico.destroy();
  grafico = new Chart(document.getElementById("grafico"), {
    type: "line",
    data: {
      labels: rotulos,
      datasets: [
        { label: "Guardado", data: acumulado, borderColor: "#8A534C", backgroundColor: "#8A534C", tension: .25 },
        { label: "Ritmo esperado", data: esperado, borderColor: "#9CA3AF", borderDash: [6, 4], pointRadius: 0 }
      ]
    },
    options: {
      plugins: { legend: { labels: { font: { family: "Inter" } } } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => "R$ " + v.toLocaleString("pt-BR") } } }
    }
  });
}

// Registrar depósito (US04)
document.getElementById("form-deposito").addEventListener("submit", evento => {
  evento.preventDefault();
  const campoValor = document.getElementById("valor-deposito");
  const valor = Number(campoValor.value);
  const data = document.getElementById("data-deposito").value;

  const erro = validarDeposito(valor, data);
  document.getElementById("erro-deposito").textContent = erro;
  campoValor.classList.toggle("invalido", Boolean(erro));
  if (erro) return;

  adicionarDeposito(idMeta, valor, data);
  campoValor.value = "";
  renderizarTela();
});

// Excluir depósito lançado errado (clique no ×)
document.getElementById("historico").addEventListener("click", evento => {
  const botao = evento.target.closest("button[data-id]");
  if (botao && confirm("Excluir este depósito?")) {
    excluirDeposito(idMeta, botao.dataset.id);
    renderizarTela();
  }
});

// Excluir a meta inteira (US08)
document.getElementById("excluir").addEventListener("click", () => {
  if (confirm("Excluir esta meta e todos os depósitos dela? Não dá para desfazer.")) {
    excluirMeta(idMeta);
    location.href = "index.html";
  }
});

renderizarTela();
