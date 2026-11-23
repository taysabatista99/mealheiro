# Mealheiro

![Logo do Mealheiro](img/mealheiro-logo.png)

**Seu cofrinho de metas.** "Mealheiro" é o nome que se dá ao cofrinho em Portugal; no logo, o porquinho faz o papel do "o".

Sistema web para planejar e acompanhar **metas de economia** (viagem, reserva de emergência, compra de um bem, estudos).
A pessoa cadastra a meta com valor e prazo, registra os depósitos e o sistema mostra **quanto guardar por mês**, o **progresso** e avisa quando ela está **atrasada**.

Projeto de Inovação II — ADS — Faculdade Senac DF.

## Demonstração

[colar o link do GitHub Pages]

## Tecnologias

- HTML5 e CSS3 (layout responsivo com Flexbox e Grid)
- JavaScript (ES6+), sem framework
- localStorage do navegador (no lugar do banco de dados)
- Chart.js via CDN (gráfico de evolução)
- Figma (protótipo)

## Identidade visual

Logo criado pela autora. Cores tiradas do logo: marrom `#8A534C` (textos e botões) e rosado `#FBE9E9` (topo e destaques). Verde, vermelho e dourado ficam reservados para os status "No ritmo", "Atrasada" e "Concluída".

## Como executar

1. Clone o projeto: `git clone [colar o link do repositório]`
2. Abra o arquivo `index.html` no navegador (ou use a extensão **Live Server** do VS Code).
3. No primeiro acesso, o sistema cria 3 metas de exemplo. Para voltar a elas, use o botão **Restaurar dados de exemplo** na tela inicial.

Não é preciso instalar servidor nem banco de dados.

## Funcionalidades

| Funcionalidade | Status |
|---|---|
| Criar meta (nome, valor, prazo e categoria) | Feita |
| Listar metas na tela inicial | Feita |
| Cálculo automático do valor mensal | Feita |
| Registrar depósito | Feita |
| Barra de progresso | Feita |
| Alerta de meta atrasada | Feita |
| Histórico de depósitos | Feita |
| Editar e excluir meta | Feita |
| Excluir depósito lançado errado | Feita |
| Previsão da data de conclusão | Feita |
| Gráfico de evolução (Chart.js) | Feita |
| Login, sincronização e notificações | Não feita (exige back-end) |

## Regras de negócio

- **Valor mensal** = (valor total − valor guardado) ÷ meses restantes. Se faltar menos de 1 mês, considera 1 mês.
- **Atraso**: a meta está atrasada quando o valor guardado é menor que `valor total × (dias passados ÷ dias totais do prazo)`.
- **Previsão**: calculada pelo ritmo médio dos depósitos desde a criação da meta (a partir de 2 depósitos).

## Estrutura

```
mealheiro/
├── index.html        (Minhas metas)
├── nova-meta.html    (criar e editar meta)
├── meta.html         (detalhe da meta, depósitos, previsão e gráfico)
├── css/style.css
├── img/              (logo)
├── js/
│   ├── dados.js      (leitura e gravação no localStorage)
│   ├── calculos.js   (regras de negócio)
│   ├── inicio.js     (tela inicial)
│   ├── nova-meta.js  (formulário da meta)
│   └── detalhe.js    (tela de detalhe)
└── docs/             (modelagem, protótipo e prints)
```

## Limitações

- Não há back-end: os dados ficam só no navegador de quem usa (localStorage). Se limpar os dados do navegador ou trocar de aparelho, as metas não aparecem.
- Não há login nem contas de usuário.
- O gráfico depende de internet para carregar o Chart.js; sem internet, o resto do sistema funciona normalmente.

## Autora

Cicera Taysa — ADS — Projeto de Inovação II
