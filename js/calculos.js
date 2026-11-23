// =============================================================
// calculos.js — as regras de negócio do Mealheiro
// Nenhuma função aqui mexe na tela nem no localStorage:
// elas só recebem dados e devolvem resultados.
// =============================================================

const UM_DIA = 24 * 60 * 60 * 1000; // um dia em milissegundos

// Converte "2026-11-19" em data local (sem problema de fuso horário)
function paraData(texto) {
  const [ano, mes, dia] = texto.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

// Data de hoje à meia-noite
function hoje() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Data de hoje no formato "2026-11-19" (para os campos de data)
function hojeTexto() {
  const d = hoje();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Diferença em dias entre duas datas
function diasEntre(inicio, fim) {
  return Math.round((fim - inicio) / UM_DIA);
}

// Soma de todos os depósitos da meta
function valorGuardado(meta) {
  return meta.depositos.reduce((soma, d) => soma + d.valor, 0);
}

// Percentual atingido (nunca passa de 100)
function percentual(meta) {
  return Math.min(100, (valorGuardado(meta) / meta.valorTotal) * 100);
}

// Meses que faltam até o prazo. Mês começado conta como mês inteiro.
// Se faltar menos de 1 mês (ou o prazo já passou), considera 1 (RN02).
function mesesRestantes(meta, dataBase = hoje()) {
  const prazo = paraData(meta.prazo);
  let meses = (prazo.getFullYear() - dataBase.getFullYear()) * 12 + (prazo.getMonth() - dataBase.getMonth());
  if (prazo.getDate() > dataBase.getDate()) meses++;
  return Math.max(1, meses);
}

// Quanto ainda é preciso guardar por mês (RN02)
function valorMensal(meta, dataBase = hoje()) {
  const falta = Math.max(0, meta.valorTotal - valorGuardado(meta));
  return falta / mesesRestantes(meta, dataBase);
}

// Quanto a pessoa já deveria ter guardado até hoje (RN03)
// valor total × (dias passados ÷ dias totais do prazo)
function valorEsperadoHoje(meta, dataBase = hoje()) {
  const inicio = paraData(meta.criadaEm);
  const prazo = paraData(meta.prazo);
  const diasTotais = Math.max(1, diasEntre(inicio, prazo));
  const diasPassados = Math.min(diasTotais, Math.max(0, diasEntre(inicio, dataBase)));
  return meta.valorTotal * (diasPassados / diasTotais);
}

// Situação da meta: "concluida", "atrasada" ou "no-ritmo"
function statusMeta(meta, dataBase = hoje()) {
  const guardado = valorGuardado(meta);
  if (guardado >= meta.valorTotal) return "concluida";
  if (guardado < valorEsperadoHoje(meta, dataBase) - 0.005) return "atrasada";
  return "no-ritmo";
}

// Quanto falta depositar para voltar ao ritmo
function faltaParaRitmo(meta, dataBase = hoje()) {
  return Math.max(0, valorEsperadoHoje(meta, dataBase) - valorGuardado(meta));
}

// Previsão da data de conclusão pelo ritmo atual (US09)
// Precisa de pelo menos 2 depósitos. Devolve null se não der para prever.
function previsaoConclusao(meta, dataBase = hoje()) {
  if (meta.depositos.length < 2) return null;
  const guardado = valorGuardado(meta);
  if (guardado >= meta.valorTotal) return null;
  const diasCorridos = Math.max(1, diasEntre(paraData(meta.criadaEm), dataBase));
  const porDia = guardado / diasCorridos;
  if (porDia <= 0) return null;
  const diasQueFaltam = Math.ceil((meta.valorTotal - guardado) / porDia);
  return new Date(dataBase.getTime() + diasQueFaltam * UM_DIA);
}

// Validação da meta (RN01). Devolve um objeto { campo: "mensagem" }.
function validarMeta(nome, valorTotal, prazo) {
  const erros = {};
  if (!nome.trim()) erros.nome = "Informe o nome da meta.";
  if (!(valorTotal > 0)) erros.valor = "O valor precisa ser maior que zero.";
  if (!prazo) erros.prazo = "Informe o prazo.";
  else if (paraData(prazo) <= hoje()) erros.prazo = "O prazo precisa ser uma data futura.";
  return erros;
}

// Validação do depósito (RN04)
function validarDeposito(valor, data) {
  if (!(valor > 0)) return "O valor do depósito precisa ser maior que zero.";
  if (!data) return "Informe a data do depósito.";
  if (paraData(data) > hoje()) return "A data do depósito não pode ser no futuro.";
  return "";
}

// ---------- Formatação ----------
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(dataOuTexto) {
  const d = typeof dataOuTexto === "string" ? paraData(dataOuTexto) : dataOuTexto;
  return d.toLocaleDateString("pt-BR");
}

// Permite testar as funções no Node (não afeta o navegador)
if (typeof module !== "undefined") {
  module.exports = { paraData, mesesRestantes, valorMensal, valorEsperadoHoje, statusMeta, faltaParaRitmo, previsaoConclusao, percentual, valorGuardado };
}
