/**
 * arquivo.js
 * Gerencia um Int8Array que representa o conteudo binario de um "arquivo"
 * de Produtos. Replica a estrutura do CRUD do prof: cabecalho com ultimo
 * ID usado, seguido de registros com lapide + tamanho + dados.
 *
 * Estrutura completa do Int8Array:
 *
 *   [4 bytes ] ultimoIdUsado (int, cabecalho global)
 *   -------- registro 1 --------
 *   [1 byte  ] lapide (0 = ativo, 1 = deletado)
 *   [4 bytes ] tamanho dos dados (int)
 *   [N bytes ] dados (Produto.toByteArray)
 *   -------- registro 2 --------
 *   ...
 *
 * Operacoes implementadas:
 *
 *   create(produto)  -> insere ao final, gera ID novo, retorna o id
 *   read(id)         -> percorre o array, retorna Produto ou null
 *   update(produto)  -> tenta in-place; se nao couber, marca lapide e
 *                       insere o novo registro ao final
 *   delete(id)       -> marca a lapide do registro como 1
 *   listar()         -> lista todos os produtos com lapide=0
 *
 * Toda manipulacao acontece sobre o Int8Array - nao ha vetor de objetos.
 */

const TAM_CABECALHO = 4;     // 4 bytes do ultimo ID usado
const TAM_LAPIDE = 1;        // 1 byte lapide
const TAM_TAMANHO = 4;       // 4 bytes do tamanho dos dados
const TAM_PREFIXO = TAM_LAPIDE + TAM_TAMANHO; // 5 bytes antes dos dados

class Arquivo {
  constructor() {
    // Comeca apenas com o cabecalho zerado (ultimoIdUsado = 0)
    this.bytes = new Int8Array(TAM_CABECALHO);
  }

  /**
   * Substitui o Int8Array interno pelo passado, util para carregar
   * o estado salvo no LocalStorage.
   * @param {Int8Array} bytes
   */
  carregar(bytes) {
    if (!bytes || bytes.length < TAM_CABECALHO) {
      // Arquivo vazio ou corrompido - inicializa
      this.bytes = new Int8Array(TAM_CABECALHO);
    } else {
      this.bytes = new Int8Array(bytes);
    }
  }

  /**
   * @returns {Int8Array} o Int8Array bruto, para persistencia e visualizacao
   */
  getBytes() {
    return this.bytes;
  }

  /**
   * Le o ultimo ID usado a partir do cabecalho.
   */
  ultimoIdUsado() {
    return ByteStream.readInt(this.bytes, 0);
  }

  /**
   * Atualiza o cabecalho com o ultimo ID usado.
   */
  setUltimoIdUsado(novoId) {
    const idBytes = ByteStream.writeInt(novoId);
    this.bytes[0] = idBytes[0];
    this.bytes[1] = idBytes[1];
    this.bytes[2] = idBytes[2];
    this.bytes[3] = idBytes[3];
  }

  // ============================================================
  //  CREATE
  // ============================================================

  /**
   * Insere um Produto novo ao final do arquivo, gerando ID via cabecalho.
   * Retorna o ID atribuido.
   *
   * @param {Produto} produto
   * @returns {number} novo id
   */
  create(produto) {
    const novoId = this.ultimoIdUsado() + 1;
    produto.id = novoId;
    this.setUltimoIdUsado(novoId);

    const dados = produto.toByteArray();
    const registro = this.montarRegistro(dados, false);
    this.bytes = this.concat(this.bytes, registro);

    return novoId;
  }

  /**
   * Monta o registro completo: [lapide][tamanho dos dados][dados].
   *
   * @param {Int8Array} dados
   * @param {boolean}   deletado
   * @returns {Int8Array}
   */
  montarRegistro(dados, deletado) {
    const lapideBytes = ByteStream.writeByte(deletado ? 1 : 0);
    const tamBytes = ByteStream.writeInt(dados.length);
    return this.concat(this.concat(lapideBytes, tamBytes), dados);
  }

  /**
   * Concatena dois Int8Arrays.
   */
  concat(a, b) {
    const r = new Int8Array(a.length + b.length);
    r.set(a, 0);
    r.set(b, a.length);
    return r;
  }

  // ============================================================
  //  READ / SCAN
  // ============================================================

  /**
   * Percorre o arquivo procurando o produto com o id dado.
   * Pula registros com lapide=1.
   *
   * @param {number} id
   * @returns {Produto|null}
   */
  read(id) {
    for (const reg of this.iterarRegistros()) {
      if (reg.deletado) continue;
      const produto = Produto.fromByteArray(this.bytes, reg.offsetDados);
      if (produto.id === id) return produto;
    }
    return null;
  }

  /**
   * Lista todos os produtos vivos (lapide=0).
   * @returns {Produto[]}
   */
  listar() {
    const result = [];
    for (const reg of this.iterarRegistros()) {
      if (reg.deletado) continue;
      result.push(Produto.fromByteArray(this.bytes, reg.offsetDados));
    }
    return result;
  }

  /**
   * Generator que percorre os registros do arquivo, retornando os metadados
   * de cada um (posicao da lapide, tamanho, posicao dos dados).
   *
   * Usado pelo read/update/delete/listar e tambem pela visualizacao.
   *
   * @returns {Generator<{offsetLapide:number, offsetTamanho:number, offsetDados:number, tamanhoDados:number, tamanhoTotal:number, deletado:boolean, id:number}>}
   */
  *iterarRegistros() {
    let p = TAM_CABECALHO;
    while (p < this.bytes.length) {
      const offsetLapide = p;
      const lapide = ByteStream.readByte(this.bytes, p);
      p += TAM_LAPIDE;
      const offsetTamanho = p;
      const tamanho = ByteStream.readInt(this.bytes, p);
      p += TAM_TAMANHO;
      const offsetDados = p;

      // Le o id sem desserializar o objeto inteiro
      const id = ByteStream.readInt(this.bytes, p);

      yield {
        offsetLapide,
        offsetTamanho,
        offsetDados,
        tamanhoDados: tamanho,
        tamanhoTotal: TAM_PREFIXO + tamanho,
        deletado: lapide !== 0,
        id,
      };

      p += tamanho;
    }
  }

  // ============================================================
  //  UPDATE
  // ============================================================

  /**
   * Atualiza um produto existente. Estrategia do prof:
   *   - Se o tamanho do novo registro for <= ao do antigo (in-place possivel),
   *     sobrescreve os bytes do registro (mantendo o slot do tamanho).
   *   - Caso contrario, marca lapide do antigo como 1 e insere o novo ao final.
   *
   * O ID e' preservado.
   *
   * @param {Produto} produto
   * @returns {boolean} true se atualizou, false se nao encontrou
   */
  update(produto) {
    for (const reg of this.iterarRegistros()) {
      if (reg.deletado) continue;
      if (reg.id !== produto.id) continue;

      const novosDados = produto.toByteArray();
      if (novosDados.length <= reg.tamanhoDados) {
        // In-place: escreve os novos dados e mantem o tamanho original.
        // Bytes nao usados ficam como "padding" entre o fim dos dados
        // novos e o fim do slot original; serao ignorados ao desserializar
        // (porque a leitura usa offsets baseados nos campos da struct).
        for (let i = 0; i < novosDados.length; i++) {
          this.bytes[reg.offsetDados + i] = novosDados[i];
        }
        // Zera o restante do slot para nao confundir a visualizacao
        for (let i = novosDados.length; i < reg.tamanhoDados; i++) {
          this.bytes[reg.offsetDados + i] = 0;
        }
        return true;
      } else {
        // Nao coube: marca lapide do antigo e insere novo ao final
        this.bytes[reg.offsetLapide] = 1;
        const registro = this.montarRegistro(novosDados, false);
        this.bytes = this.concat(this.bytes, registro);
        return true;
      }
    }
    return false;
  }

  // ============================================================
  //  DELETE
  // ============================================================

  /**
   * Marca o registro do id como deletado (lapide = 1).
   *
   * @param {number} id
   * @returns {boolean} true se deletou, false se nao encontrou
   */
  delete(id) {
    for (const reg of this.iterarRegistros()) {
      if (reg.deletado) continue;
      if (reg.id !== id) continue;
      this.bytes[reg.offsetLapide] = 1;
      return true;
    }
    return false;
  }

  // ============================================================
  //  BUSCA POR NOME (substring case-insensitive sem acentos)
  // ============================================================

  /**
   * Busca produtos cujo nome contenha o termo (case-insensitive,
   * insensivel a acentos). Util pra ter um equivalente simples da
   * busca textual do TP3.
   *
   * @param {string} termo
   * @returns {Produto[]}
   */
  buscarPorNome(termo) {
    const norm = (s) =>
      String(s)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const alvo = norm(termo);
    if (!alvo) return this.listar();
    return this.listar().filter((p) => norm(p.nome).includes(alvo));
  }
}

// Export pra Node (testes)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Arquivo, TAM_CABECALHO, TAM_LAPIDE, TAM_TAMANHO, TAM_PREFIXO };
}
