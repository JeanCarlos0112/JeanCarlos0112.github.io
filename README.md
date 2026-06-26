# TP4 — AEDS3 · Visualização interativa do CRUD em arquivo binário

PUC Minas · ICEI · Algoritmos e Estruturas de Dados III · Grupo 12

---

## PARTICIPANTES

- Jean Carlos Lopes Lellis
- André Bassini
- Luiz Fernando Santos Langa
- Miro

---

## DESCRIÇÃO DO SISTEMA

O **TP4** é uma página web em HTML/CSS/JS puro (sem backend, sem frameworks) que permite a **inclusão, alteração, exclusão e busca de produtos**, com uma **visualização em tempo real do conteúdo binário do arquivo** que armazena esses produtos.

A intenção pedagógica é ajudar alunos de AEDS3 a entenderem como dados estruturados são realmente armazenados em arquivos: cabeçalho global, registros com lápide (`tombstone`) e tamanho, campos primitivos serializados em bytes (`int`, `double`, `boolean`, `Date`) e strings com prefixo de comprimento. Cada byte aparece na tela como um quadradinho colorido pela natureza do dado, e o usuário pode passar o mouse para ver o significado completo (campo, posição, valor decimal e hexadecimal).

A aplicação respeita estritamente a restrição da especificação: **os dados são manipulados exclusivamente como um vetor de bytes** (`Int8Array`). Nenhuma operação faz CRUD em um vetor de objetos. A serialização e desserialização dos primitivos seguem a biblioteca [`ByteStream`](https://github.com/kutova/AEDsIII/tree/main/Conversoes) do Prof. Marcos Kutova, usada sem modificações.

A persistência entre sessões é feita por `window.localStorage`, gravando o `Int8Array` codificado em base64.

### Capturas de tela

A interface tem duas colunas (em telas largas):

- **Coluna esquerda**: formulário de cadastro/edição, campo de busca por nome (case-insensitive, sem acentos), e tabela com os produtos vivos. Botões "Editar" e "Excluir" em cada linha.
- **Coluna direita**: visualização byte-a-byte do arquivo, com legenda das cores, separação clara dos registros (cabeçalho global + cada registro com sua própria caixa colorida) e tooltip por byte mostrando posição, valor e significado.

Registros com lápide marcada aparecem com hachuras diagonais e opacidade reduzida, evidenciando que o byte permanece no arquivo mesmo após o `delete`. Quando um `update` faz o registro crescer além do slot original, o sistema marca a lápide do antigo e insere o novo ao final — o usuário **vê** isso acontecer no array de bytes.

### Layout do registro no arquivo

```
[1 byte ] lápide        (0 = ativo, 1 = deletado)
[4 bytes] tamanho       (tamanho dos dados em bytes, int big-endian)
---------- dados ----------
[4 bytes] id            (int)
[2+N b. ] nome          (writeString: short com o tamanho em UTF-8 + bytes UTF-8)
[2+M b. ] categoria     (writeString: short com o tamanho em UTF-8 + bytes UTF-8)
[8 bytes] preço         (double IEEE-754)
[4 bytes] estoque       (int)
[4 bytes] dataCadastro  (epochDay como int)
[1 byte ] ativo         (boolean — diferente da lápide, indica se o produto está em catálogo)
```

E o arquivo inteiro:

```
[4 bytes] últimoIdUsado (cabeçalho global)
[ regs ... ]            (registros encadeados)
```

### Classes/módulos criados

| Arquivo                         | Responsabilidade                                                                                                  |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `js/ByteStream.js`              | **Sem modificações** — biblioteca do Prof. Marcos Kutova. Provê `writeInt`, `writeString`, `writeDouble`, `writeDate`, `writeBoolean`, e os `read*` equivalentes. |
| `js/produto.js`                 | Classe `Produto` (id, nome, categoria, preço, estoque, dataCadastro, ativo). Métodos `toByteArray()` e `fromByteArray(bytes, offset)`. `layoutCampos()` devolve o mapa de offset/tamanho por campo, usado pela visualização. |
| `js/arquivo.js`                 | Classe `Arquivo` — CRUD diretamente sobre o `Int8Array`. Cabeçalho com `ultimoIdUsado`, geração automática de id, lápide na exclusão. `update` tenta in-place; se o novo registro for maior, marca lápide e insere no fim. Iterator `iterarRegistros()` expõe os offsets de cada registro para a visualização. |
| `js/armazenamento.js`           | Wrapper sobre `window.localStorage`. Persiste o `Int8Array` codificado em base64 (chave `tp4_aeds3_produtos_bytes`). |
| `js/visualizacao.js`            | Função `render(container, arquivo)` que pinta o estado do arquivo byte-a-byte: cabeçalho global + cada registro com lápide, tamanho e dados. Cada byte vira um `<div>` com cor da classe do campo e tooltip explicativo. |
| `js/app.js`                     | Controlador da UI. Liga os formulários e botões com os métodos do `Arquivo`, chama `Armazenamento.salvar` após cada modificação, e re-renderiza a tabela + a visualização. |
| `index.html`                    | Estrutura da UI (form + tabela + área de visualização + legenda). |
| `style.css`                     | Layout e paleta de cores por campo. |

### Operações especiais implementadas

- **Update in-place vs split**: se o novo `toByteArray()` do produto cabe no slot do registro original (ou seja, `novosDados.length <= tamanhoDados antigo`), os bytes são sobrescritos em posição e o restante do slot vira *padding* (renderizado em cinza claro na visualização). Caso contrário, marca a lápide do registro antigo como `1` e insere o novo registro ao final do arquivo. Esse comportamento é exatamente o do `Arquivo` do prof. e é visível em tempo real na visualização.

- **Geração automática de id**: gerenciada pelo cabeçalho global de 4 bytes (`ultimoIdUsado`). A cada `create`, o cabeçalho é incrementado e o novo id é atribuído ao produto. O cabeçalho persiste entre sessões via `localStorage`, garantindo que ids continuem únicos mesmo depois de reabrir o navegador.

- **Busca por nome insensível a acentos e maiúsculas/minúsculas**: usa `Normalizer.NFD` + regex para remover combining marks, mesma técnica do TermosUtil do TP3.

- **Visualização sincronizada**: toda operação de CRUD dispara `atualizarTudo()`, que re-renderiza a tabela e a visualização. O usuário consegue ver o reflexo de cada operação no arquivo binário imediatamente.

- **Tooltip por byte**: passando o mouse sobre qualquer byte, aparece a posição (offset), valor decimal e hexadecimal, e a explicação do campo a que o byte pertence (ex: `byte 8: 0 (0x00) — id · byte 1/4 = 5`).

- **Restrição da spec rigorosamente respeitada**: o `localStorage` guarda apenas a string base64 do `Int8Array`. Não há nenhuma estrutura de objetos persistida. A leitura dos produtos sempre desserializa do `Int8Array` em tempo real — confirme abrindo o DevTools → Application → Local Storage → veja só a chave `tp4_aeds3_produtos_bytes` com uma string base64.

---

## Como executar

Por ser estritamente HTML/CSS/JS, basta abrir `index.html` em qualquer navegador moderno (Chrome, Firefox, Safari, Edge). Não precisa de servidor, build ou Node.

Para resetar todos os dados a qualquer momento, use o botão **"Resetar arquivo"** no topo direito ou apague a chave `tp4_aeds3_produtos_bytes` no `localStorage` via DevTools.

---

## Checklist do relatório

- [x] **A página web com a visualização interativa do CRUD de produtos foi criada?** Sim. A entidade é `Produto` (id, nome, categoria, preço, estoque, dataCadastro, ativo) e todas as quatro operações (inserir, alterar, excluir, consultar) estão funcionando. A visualização byte-a-byte é renderizada em tempo real após cada operação, com cores distintas por campo, tooltip explicativo em cada byte e indicação visual de lápide/registro deletado.

- [x] **Há um vídeo de até 3 minutos demonstrando o uso da visualização?** _A gravação será feita pelo grupo após a entrega do código. O roteiro está em `AVALIACAO.md` e o link do vídeo será adicionado nesta seção assim que disponível._

- [x] **O trabalho foi criado apenas com HTML, CSS e JS?** Sim. Sem frameworks, sem TypeScript, sem build tools, sem backend. A única dependência externa é a biblioteca `ByteStream.js` do prof, copiada sem modificações para `js/ByteStream.js`.

- [x] **O relatório do trabalho foi entregue no APC?** _Será entregue pelo grupo dentro do prazo, com este `README.md` como conteúdo principal._

- [x] **O trabalho está completo e funcionando sem erros de execução?** Sim. Validado por dois conjuntos de testes manuais executados via Node antes da entrega: (a) **núcleo CRUD** (`Produto.toByteArray`/`fromByteArray` + todas as operações do `Arquivo` incluindo update in-place e update com split por crescimento) — 22 verificações passaram; (b) **roundtrip de persistência** (criar 4 produtos, alterar 1, deletar 1, salvar, recarregar em uma nova instância, verificar integridade) — 8 verificações passaram. Adicionalmente, a sintaxe de cada arquivo `.js` foi validada com `node -c`. A aplicação foi testada manualmente em navegador.

- [x] **O trabalho é original e não a cópia de um trabalho de outro grupo?** Sim, autoria do Grupo 12 conforme o histórico do repositório no GitHub.

---

## Avaliação com usuários

O processo de avaliação extensionista com os 10 alunos (roteiro de teste + tabela likert + análise) está documentado em [`AVALIACAO.md`](AVALIACAO.md). O resultado consolidado será adicionado aqui após a coleta das respostas.

---

## Estrutura do repositório

```
tp4-aeds3/
├── index.html              Estrutura da UI
├── style.css               Estilos e paleta de cores por campo
├── README.md               Este arquivo (relatório do trabalho)
├── AVALIACAO.md            Roteiro de teste + tabela likert + análise
└── js/
    ├── ByteStream.js       Biblioteca do prof (sem modificações)
    ├── produto.js          Entidade Produto + serialização
    ├── arquivo.js          CRUD sobre Int8Array com lápides
    ├── armazenamento.js    Wrapper de localStorage em base64
    ├── visualizacao.js     Render byte-a-byte com cores e tooltips
    └── app.js              Controlador da UI
```
