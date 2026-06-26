/**
 * produto.js
 * Entidade Produto e sua serialização para/de Int8Array, usando
 * a biblioteca ByteStream do Prof. Marcos Kutova.
 *
 * Layout do registro completo no "arquivo":
 *
 *   [1 byte ] lapide        (0 = ativo, 1 = deletado)
 *   [4 bytes] tamanho       (tamanho dos DADOS abaixo, em bytes)
 *   ---------- dados ----------
 *   [4 bytes] id            (int)
 *   [2+N b. ] nome          (writeString: short tamanho + UTF-8)
 *   [2+M b. ] categoria     (writeString: short tamanho + UTF-8)
 *   [8 bytes] preco         (double)
 *   [4 bytes] estoque       (int)
 *   [4 bytes] dataCadastro  (epochDay como int)
 *   [1 byte ] ativo         (boolean)
 *
 * Os comprimentos N e M variam conforme a string em UTF-8.
 */

class Produto {
  /**
   * @param {number} id           - identificador unico (gerado pelo Arquivo)
   * @param {string} nome
   * @param {string} categoria
   * @param {number} preco        - em reais, com centavos
   * @param {number} estoque      - quantidade em estoque
   * @param {Date}   dataCadastro - data de cadastro
   * @param {boolean} ativo       - flag de produto ativo (diferente da lapide)
   */
  constructor(id, nome, categoria, preco, estoque, dataCadastro, ativo) {
    this.id = id ?? -1;
    this.nome = nome ?? "";
    this.categoria = categoria ?? "";
    this.preco = preco ?? 0.0;
    this.estoque = estoque ?? 0;
    this.dataCadastro = dataCadastro ?? new Date();
    this.ativo = ativo ?? true;
  }

  /**
   * Serializa os DADOS (sem lapide e sem o int de tamanho) em um Int8Array.
   * O Arquivo eh quem prepara o registro completo (lapide + tamanho + dados).
   *
   * @returns {Int8Array}
   */
  toByteArray() {
    const partes = [
      ByteStream.writeInt(this.id),
      ByteStream.writeString(this.nome),
      ByteStream.writeString(this.categoria),
      ByteStream.writeDouble(this.preco),
      ByteStream.writeInt(this.estoque),
      ByteStream.writeDate(this.dataCadastro),
      ByteStream.writeBoolean(this.ativo),
    ];
    return concatInt8Arrays(partes);
  }

  /**
   * Desserializa um Int8Array contendo APENAS os dados (sem lapide e tamanho)
   * em um Produto. O Arquivo eh quem aponta o offset/length correto antes de
   * chamar este metodo.
   *
   * @param {Int8Array} bytes
   * @param {number}    [offset=0]
   * @returns {Produto}
   */
  static fromByteArray(bytes, offset = 0) {
    let p = offset;

    const id = ByteStream.readInt(bytes, p);
    p += 4;

    const nome = ByteStream.readString(bytes, p);
    const tamNome = ByteStream.readShort(bytes, p);
    p += 2 + tamNome;

    const categoria = ByteStream.readString(bytes, p);
    const tamCategoria = ByteStream.readShort(bytes, p);
    p += 2 + tamCategoria;

    const preco = ByteStream.readDouble(bytes, p);
    p += 8;

    const estoque = ByteStream.readInt(bytes, p);
    p += 4;

    const dataCadastro = ByteStream.readDate(bytes, p);
    p += 4;

    const ativo = ByteStream.readBoolean(bytes, p);
    p += 1;

    return new Produto(id, nome, categoria, preco, estoque, dataCadastro, ativo);
  }

  /**
   * Retorna o mapa de campos com seus offsets e tamanhos relativos ao
   * INICIO dos dados (apos lapide+tamanho), util para a visualizacao
   * pintar cada faixa de bytes com a cor do campo correspondente.
   *
   * @returns {Array<{nome: string, offset: number, tamanho: number, valor: any, classeCss: string}>}
   */
  layoutCampos() {
    let p = 0;
    const campos = [];

    campos.push({ nome: "id", offset: p, tamanho: 4, valor: this.id, classeCss: "campo-id" });
    p += 4;

    const tamNome = new TextEncoder().encode(String(this.nome)).length;
    campos.push({ nome: "nome.tam", offset: p, tamanho: 2, valor: tamNome, classeCss: "campo-tam" });
    p += 2;
    campos.push({ nome: "nome", offset: p, tamanho: tamNome, valor: this.nome, classeCss: "campo-nome" });
    p += tamNome;

    const tamCat = new TextEncoder().encode(String(this.categoria)).length;
    campos.push({ nome: "categoria.tam", offset: p, tamanho: 2, valor: tamCat, classeCss: "campo-tam" });
    p += 2;
    campos.push({ nome: "categoria", offset: p, tamanho: tamCat, valor: this.categoria, classeCss: "campo-categoria" });
    p += tamCat;

    campos.push({ nome: "preco", offset: p, tamanho: 8, valor: this.preco, classeCss: "campo-preco" });
    p += 8;

    campos.push({ nome: "estoque", offset: p, tamanho: 4, valor: this.estoque, classeCss: "campo-estoque" });
    p += 4;

    campos.push({ nome: "dataCadastro", offset: p, tamanho: 4, valor: this.dataCadastro, classeCss: "campo-data" });
    p += 4;

    campos.push({ nome: "ativo", offset: p, tamanho: 1, valor: this.ativo, classeCss: "campo-ativo" });
    p += 1;

    return campos;
  }
}

/**
 * Concatena varios Int8Array em um unico Int8Array.
 * @param {Int8Array[]} arrays
 * @returns {Int8Array}
 */
function concatInt8Arrays(arrays) {
  let totalLen = 0;
  for (const a of arrays) totalLen += a.length;
  const result = new Int8Array(totalLen);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

// Exporta para Node (testes) e mantem global no browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Produto, concatInt8Arrays };
}
