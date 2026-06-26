/**
 * app.js
 * Controlador principal da aplicacao. Conecta os formularios HTML com
 * o Arquivo (CRUD sobre Int8Array), o Armazenamento (localStorage) e
 * a Visualizacao (renderizacao byte-a-byte).
 *
 * Padrao de fluxo:
 *
 *   evento UI -> handler -> arquivo.<operacao>() -> Armazenamento.salvar()
 *                                                 -> rerender lista + bytes
 */

const arquivo = new Arquivo();

// Carrega estado anterior, se houver
(function inicializar() {
  const bytes = Armazenamento.carregar();
  if (bytes && bytes.length >= TAM_CABECALHO) {
    arquivo.carregar(bytes);
  }
})();

// Referencias DOM (cache simples)
const $ = (id) => document.getElementById(id);

const elFormCadastro = $("form-cadastro");
const elInpId        = $("inp-id");
const elInpNome      = $("inp-nome");
const elInpCategoria = $("inp-categoria");
const elInpPreco     = $("inp-preco");
const elInpEstoque   = $("inp-estoque");
const elInpData      = $("inp-data");
const elInpAtivo     = $("inp-ativo");
const elBtnSalvar    = $("btn-salvar");
const elBtnLimpar    = $("btn-limpar");

const elInpBusca     = $("inp-busca");
const elBtnBuscar    = $("btn-buscar");
const elBtnListarTodos = $("btn-listar-todos");

const elListaProdutos = $("lista-produtos");
const elVisualizacao  = $("visualizacao");

const elBtnResetar    = $("btn-resetar");
const elBtnExemplo    = $("btn-exemplo");

// ----- Form: cadastrar / atualizar -----

elFormCadastro.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const id = parseInt(elInpId.value, 10);
  const isEdicao = !isNaN(id) && id > 0;

  const produto = new Produto(
    isEdicao ? id : -1,
    elInpNome.value.trim(),
    elInpCategoria.value.trim(),
    parseFloat(elInpPreco.value),
    parseInt(elInpEstoque.value, 10),
    elInpData.value ? new Date(elInpData.value) : new Date(),
    elInpAtivo.checked
  );

  // Validacao basica
  if (!produto.nome) {
    mensagem("Nome do produto é obrigatório.", "erro");
    return;
  }
  if (isNaN(produto.preco) || produto.preco < 0) {
    mensagem("Preço deve ser um número não-negativo.", "erro");
    return;
  }
  if (isNaN(produto.estoque) || produto.estoque < 0) {
    mensagem("Estoque deve ser um número inteiro não-negativo.", "erro");
    return;
  }

  if (isEdicao) {
    const ok = arquivo.update(produto);
    if (ok) mensagem(`Produto #${id} atualizado.`, "ok");
    else    mensagem(`Produto #${id} não encontrado.`, "erro");
  } else {
    const novoId = arquivo.create(produto);
    mensagem(`Produto cadastrado com id=${novoId}.`, "ok");
  }

  Armazenamento.salvar(arquivo.getBytes());
  resetarForm();
  atualizarTudo();
});

elBtnLimpar.addEventListener("click", () => {
  resetarForm();
});

function resetarForm() {
  elFormCadastro.reset();
  elInpId.value = "";
  elBtnSalvar.textContent = "Cadastrar produto";
  elInpAtivo.checked = true;
}

// ----- Busca -----

elBtnBuscar.addEventListener("click", () => {
  const termo = elInpBusca.value.trim();
  renderLista(arquivo.buscarPorNome(termo));
});

elInpBusca.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    ev.preventDefault();
    elBtnBuscar.click();
  }
});

elBtnListarTodos.addEventListener("click", () => {
  elInpBusca.value = "";
  renderLista(arquivo.listar());
});

// ----- Reset e exemplo -----

elBtnResetar.addEventListener("click", () => {
  if (!confirm("Apagar todos os produtos e zerar o arquivo? Isso não pode ser desfeito."))
    return;
  Armazenamento.limpar();
  arquivo.carregar(null);
  resetarForm();
  atualizarTudo();
  mensagem("Arquivo resetado.", "ok");
});

elBtnExemplo.addEventListener("click", () => {
  const exemplos = [
    new Produto(-1, "Mouse Gamer",     "Periféricos", 199.90, 42, new Date("2026-05-10"), true),
    new Produto(-1, "Teclado Mecânico", "Periféricos", 459.00, 15, new Date("2026-05-15"), true),
    new Produto(-1, "Monitor 24 4K",   "Monitores",   1799.00, 8, new Date("2026-06-01"), true),
    new Produto(-1, "Notebook i7",     "Notebooks",   5499.00, 3, new Date("2026-06-10"), true),
    new Produto(-1, "Cabo HDMI 2m",    "Cabos",         29.90, 87, new Date("2026-06-12"), true),
  ];
  for (const p of exemplos) arquivo.create(p);
  Armazenamento.salvar(arquivo.getBytes());
  atualizarTudo();
  mensagem(`${exemplos.length} produtos de exemplo adicionados.`, "ok");
});

// ----- Lista de produtos (botoes Editar / Excluir) -----

function renderLista(produtos) {
  elListaProdutos.innerHTML = "";
  if (produtos.length === 0) {
    elListaProdutos.innerHTML = '<p class="vazio">Nenhum produto encontrado.</p>';
    return;
  }
  const tabela = document.createElement("table");
  tabela.className = "tabela-produtos";
  tabela.innerHTML = `
    <thead>
      <tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Data</th><th>Ativo</th><th>Ações</th></tr>
    </thead><tbody></tbody>`;
  const tbody = tabela.querySelector("tbody");

  for (const p of produtos) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${escapeHtml(p.nome)}</td>
      <td>${escapeHtml(p.categoria)}</td>
      <td>R$ ${p.preco.toFixed(2)}</td>
      <td>${p.estoque}</td>
      <td>${p.dataCadastro.toISOString().slice(0, 10)}</td>
      <td>${p.ativo ? "✓" : "—"}</td>
    `;
    const tdAcoes = document.createElement("td");
    tdAcoes.className = "td-acoes";

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.className = "btn-acao btn-editar";
    btnEditar.addEventListener("click", () => carregarParaEdicao(p));

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.className = "btn-acao btn-excluir";
    btnExcluir.addEventListener("click", () => {
      if (!confirm(`Excluir o produto "${p.nome}" (id=${p.id})?`)) return;
      arquivo.delete(p.id);
      Armazenamento.salvar(arquivo.getBytes());
      mensagem(`Produto #${p.id} excluído (lápide marcada).`, "ok");
      atualizarTudo();
    });

    tdAcoes.appendChild(btnEditar);
    tdAcoes.appendChild(btnExcluir);
    tr.appendChild(tdAcoes);

    tbody.appendChild(tr);
  }
  elListaProdutos.appendChild(tabela);
}

function carregarParaEdicao(p) {
  elInpId.value        = p.id;
  elInpNome.value      = p.nome;
  elInpCategoria.value = p.categoria;
  elInpPreco.value     = p.preco;
  elInpEstoque.value   = p.estoque;
  elInpData.value      = p.dataCadastro.toISOString().slice(0, 10);
  elInpAtivo.checked   = p.ativo;
  elBtnSalvar.textContent = `Atualizar produto #${p.id}`;
  elInpNome.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ----- Refresh geral -----

function atualizarTudo() {
  renderLista(arquivo.listar());
  Visualizacao.render(elVisualizacao, arquivo);
}

// ----- Mensagens flash -----

function mensagem(texto, tipo) {
  const div = $("flash");
  div.textContent = texto;
  div.className = "flash flash-" + tipo;
  setTimeout(() => { div.className = "flash"; div.textContent = ""; }, 3500);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Boot inicial
atualizarTudo();
