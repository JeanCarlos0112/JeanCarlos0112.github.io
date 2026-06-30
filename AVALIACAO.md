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

### Questionário

| # | Afirmação                                                                                      |
|---|------------------------------------------------------------------------------------------------|
| 1 | A aplicação me ajuda a realizar as tarefas de cadastro de pessoas de forma eficiente.          |
| 2 | As funções principais (incluir, consultar, alterar e excluir) são fáceis de encontrar e usar.  |
| 3 | As mensagens exibidas pelo sistema (de sucesso ou erro) são claras e úteis.                    |
| 4 | A aplicação é intuitiva, mesmo para quem a usa pela primeira vez.                              |
| 5 | De modo geral, estou satisfeito(a) com a experiência de uso da aplicação.                      |

---

## Análise dos resultados

Após coletar as 10 respostas, preencha a tabela abaixo com as médias e adicione um parágrafo de comentário interpretativo.

### Tabela consolidada

| Item | Afirmação resumida             | Média (1-5) |
|------|--------------------------------|-------------|
|  1   | Eficiência da aplicação        |     4,33    |
|  2   | Facilidade de uso das funções  |     4,67    |
|  3   | Clareza das mensagens          |     4,33    |
|  4   | Intuitividade                  |     3,67    |
|  5   | Satisfação geral               |     4,33    |

### Comentário interpretativo

O software é altamente eficaz e bem avaliado, com Satisfação Geral de 4,33. Seu ponto forte é a Facilidade de Uso (4,67) após o aprendizado, apoiada por uma ótima clareza e eficiência.
O único gargalo é a Intuitividade (3,67), o que indica que o sistema é excelente para quem já o conhece, mas exige uma curva de aprendizado inicial. O foco de melhoria deve ser o primeiro contato do usuário com a interface.
