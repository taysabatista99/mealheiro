// =============================================================
// dados.js — tudo o que lê e grava no localStorage
// O localStorage faz o papel do banco de dados: a chave "metas"
// guarda uma lista (array) de metas em formato JSON.
// =============================================================

const CHAVE_METAS = "metas";

// Metas de exemplo, criadas no primeiro acesso
// (e quando o usuário clica em "Restaurar exemplos").
const METAS_EXEMPLO = [
  {
    id: 1,
    nome: "Viagem a Fortaleza",
    valorTotal: 3000,
    prazo: "2027-09-01",
    categoria: "Viagem",
    criadaEm: "2026-09-01",
    depositos: [
      { id: 1, valor: 150, data: "2026-09-05" },
      { id: 2, valor: 150, data: "2026-10-05" },
      { id: 3, valor: 150, data: "2026-11-05" }
    ]
  },
  {
    id: 2,
    nome: "Reserva de emergência",
    valorTotal: 5000,
    prazo: "2027-06-01",
    categoria: "Reserva de emergência",
    criadaEm: "2026-06-01",
    depositos: [
      { id: 1, valor: 1000, data: "2026-06-10" },
      { id: 2, valor: 500, data: "2026-07-10" },
      { id: 3, valor: 400, data: "2026-08-10" },
      { id: 4, valor: 350, data: "2026-09-10" },
      { id: 5, valor: 350, data: "2026-10-10" }
    ]
  },
  {
    id: 3,
    nome: "Notebook novo",
    valorTotal: 4200,
    prazo: "2026-12-01",
    categoria: "Compra de um bem",
    criadaEm: "2026-03-01",
    depositos: [
      { id: 1, valor: 2000, data: "2026-03-15" },
      { id: 2, valor: 1200, data: "2026-06-15" },
      { id: 3, valor: 1000, data: "2026-09-15" }
    ]
  }
];

// Cria os dados de exemplo só no primeiro acesso
function carregarDados() {
  if (localStorage.getItem(CHAVE_METAS) === null) {
    salvarMetas(METAS_EXEMPLO);
  }
}

// Apaga tudo e volta para os exemplos
function restaurarExemplos() {
  salvarMetas(METAS_EXEMPLO);
}

// Lê a lista de metas do localStorage
function listarMetas() {
  const texto = localStorage.getItem(CHAVE_METAS);
  return texto ? JSON.parse(texto) : [];
}

// Grava a lista inteira de metas no localStorage
function salvarMetas(metas) {
  localStorage.setItem(CHAVE_METAS, JSON.stringify(metas));
}

// Procura uma meta pelo id
function buscarMeta(id) {
  return listarMetas().find(m => m.id === Number(id));
}

// Gera o próximo id de uma lista (maior id + 1)
function proximoId(lista) {
  return lista.length === 0 ? 1 : Math.max(...lista.map(item => item.id)) + 1;
}

// Cria uma meta nova ou atualiza uma existente
function salvarMeta(meta) {
  const metas = listarMetas();
  if (meta.id) {
    const i = metas.findIndex(m => m.id === meta.id);
    metas[i] = meta;
  } else {
    meta.id = proximoId(metas);
    metas.push(meta);
  }
  salvarMetas(metas);
  return meta;
}

// Exclui a meta (e, junto com ela, todos os depósitos — RN05)
function excluirMeta(id) {
  salvarMetas(listarMetas().filter(m => m.id !== Number(id)));
}

// Adiciona um depósito dentro da meta
function adicionarDeposito(metaId, valor, data) {
  const meta = buscarMeta(metaId);
  meta.depositos.push({ id: proximoId(meta.depositos), valor: valor, data: data });
  salvarMeta(meta);
  return meta;
}

// Remove um depósito lançado errado
function excluirDeposito(metaId, depositoId) {
  const meta = buscarMeta(metaId);
  meta.depositos = meta.depositos.filter(d => d.id !== Number(depositoId));
  salvarMeta(meta);
  return meta;
}
