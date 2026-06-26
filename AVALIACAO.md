# Avaliação com usuários — TP4 AEDS3

Este documento descreve a avaliação extensionista da aplicação **"TP4 — CRUD visual de produtos"** com pelo menos **10 alunos** que estejam ou já tenham cursado AEDS III na PUC Minas.

A intenção é avaliar duas dimensões:

- **Utilidade**: o quanto a aplicação ajuda os alunos a compreender como dados estruturados são armazenados em arquivos binários.
- **Usabilidade**: o quanto a aplicação é fácil de usar sem treinamento prévio.

---

## Roteiro de teste

Cada participante deverá realizar as seguintes tarefas **em ordem**, sem que ninguém do grupo explique a interface antes:

1. **Cadastrar** um produto chamado `Notebook Dell`, categoria `Notebooks`, preço `4499.90`, estoque `5`, data de cadastro de hoje, ativo.
2. **Localizar visualmente** no array de bytes o registro do produto cadastrado. Identifique qual cor representa o nome `Notebook Dell` no array.
3. **Cadastrar** mais dois produtos:
   - `Mouse Logitech`, categoria `Periféricos`, preço `79.90`, estoque `30`, ativo.
   - `Monitor LG 27"`, categoria `Monitores`, preço `1299.00`, estoque `8`, ativo.
4. **Buscar** pelo termo `mouse`. Verifique que apenas o registro correto aparece na lista.
5. **Editar** o estoque do `Notebook Dell` para `0`. Observe na visualização: o registro foi atualizado in-place ou marcou lápide e inseriu novo?
6. **Editar** o nome do `Mouse Logitech` para `Mouse Logitech Pro MX Master 3S Wireless` (texto mais longo). Observe na visualização o que acontece: deve aparecer um registro com lápide marcada (hachuras) e um novo registro ao final.
7. **Excluir** o produto `Monitor LG 27"`. Verifique que o registro permanece visível no array, mas com hachuras e opacidade reduzida (lápide marcada).
8. **Recarregar a página** (F5). Confirmar que os dados persistiram: os 3 produtos cadastrados continuam lá, o monitor continua marcado como deletado, e o nome do mouse continua como "Mouse Logitech Pro MX Master 3S Wireless".
9. **Passar o mouse** sobre alguns bytes da visualização e observar os tooltips. Verifique se consegue identificar qual byte é a lápide, qual é o tamanho do registro, e em qual região começam os dados do nome do produto.

Tempo estimado total: **5 a 8 minutos por participante**.

---

## Questionário de avaliação (escala Likert)

Após completar o roteiro, peça ao participante que responda às afirmações abaixo de acordo com a escala:

> 1 = Discordo totalmente · 2 = Discordo · 3 = Neutro · 4 = Concordo · 5 = Concordo totalmente

### Bloco A — Utilidade

| #  | Afirmação                                                                                                            |
|----|----------------------------------------------------------------------------------------------------------------------|
| A1 | A visualização do array de bytes me ajudou a entender melhor como um registro é armazenado em um arquivo binário.    |
| A2 | A representação visual das **lápides** torna mais claro o conceito de exclusão lógica (vs exclusão física).          |
| A3 | A representação visual deixa mais óbvio o que acontece quando um **update** faz o registro crescer (split + lápide). |
| A4 | A separação por cores entre os campos (`id`, `nome`, `preço`, etc.) me ajudou a identificar a estrutura do registro. |
| A5 | Usaria esta aplicação como apoio para estudar AEDS III ou explicar a estrutura de arquivo para um colega.            |

### Bloco B — Usabilidade

| #  | Afirmação                                                                                                            |
|----|----------------------------------------------------------------------------------------------------------------------|
| B1 | As funções principais (cadastrar, editar, excluir, buscar) são fáceis de encontrar e usar.                           |
| B2 | A aplicação é intuitiva — consegui completar as tarefas do roteiro sem precisar de instruções extras.                |
| B3 | As mensagens exibidas após cada operação são claras e informativas.                                                  |
| B4 | Os **tooltips** dos bytes (informação que aparece ao passar o mouse) são claros e ajudam a entender o conteúdo.      |
| B5 | De modo geral, estou satisfeito(a) com a experiência de uso da aplicação.                                            |

### Comentários abertos (opcional)

- Algo confundiu você durante o uso?
- O que mais te ajudou a entender a estrutura do arquivo?
- O que você mudaria/melhoraria na aplicação?

---

## Análise dos resultados

Após coletar as 10 respostas, preencha a tabela abaixo com as médias e adicione um parágrafo de comentário interpretativo.

### Tabela consolidada

| Item | Afirmação resumida                                          | Média (1-5) |
|------|-------------------------------------------------------------|-------------|
| A1   | Ajuda a entender armazenamento em arquivo binário           | _a preencher_ |
| A2   | Visual das lápides clarifica exclusão lógica                | _a preencher_ |
| A3   | Visual do update crescente clarifica split + lápide         | _a preencher_ |
| A4   | Cores por campo ajudam a ver a estrutura                    | _a preencher_ |
| A5   | Usaria como apoio para estudar/explicar AEDS III            | _a preencher_ |
| B1   | Funções principais fáceis de encontrar/usar                 | _a preencher_ |
| B2   | Intuitiva sem instruções extras                             | _a preencher_ |
| B3   | Mensagens claras e informativas                             | _a preencher_ |
| B4   | Tooltips dos bytes claros                                   | _a preencher_ |
| B5   | Satisfação geral                                            | _a preencher_ |

**Média global (todos os 10 itens):** _a preencher_
**Média do bloco Utilidade (A1-A5):** _a preencher_
**Média do bloco Usabilidade (B1-B5):** _a preencher_

### Comentário interpretativo

_(A ser escrito após a coleta. Modelo:)_

> Os 10 alunos que participaram do teste avaliaram a aplicação com uma média global de **X.X de 5**. Em utilidade pedagógica (bloco A), a média foi **X.X**, com destaque para os itens que tratam da exclusão lógica e do comportamento do update por crescimento — estes foram os que receberam as maiores notas, indicando que a representação visual cumpre seu objetivo de tornar concretos conceitos que costumam ser abstratos em sala. Em usabilidade (bloco B), a média foi **X.X**; o item de mensagens claras teve nota menor, sugerindo que o feedback após cada operação pode ser melhorado em iterações futuras.

### Distribuição de respostas (opcional)

Se quiser detalhar, pode incluir um gráfico de barras horizontal para cada item, mostrando quantos alunos responderam 1, 2, 3, 4 e 5.

---

## Lista de avaliadores

Preencher após o teste com os 10 alunos. Por privacidade, basta inicial do nome + período/turma.

| #  | Avaliador (inicial)  | Período | Data        |
|----|----------------------|---------|-------------|
| 1  | _a preencher_        |         |             |
| 2  | _a preencher_        |         |             |
| 3  | _a preencher_        |         |             |
| 4  | _a preencher_        |         |             |
| 5  | _a preencher_        |         |             |
| 6  | _a preencher_        |         |             |
| 7  | _a preencher_        |         |             |
| 8  | _a preencher_        |         |             |
| 9  | _a preencher_        |         |             |
| 10 | _a preencher_        |         |             |
