/**
 * armazenamento.js
 * Wrapper sobre window.localStorage para persistir o Int8Array do "arquivo"
 * entre sessoes. A spec do TP4 obriga: nada de vetor de objetos no storage,
 * apenas o vetor de bytes que representa o conteudo real do arquivo.
 *
 * Para serializar bytes em string (localStorage so aceita string), usamos
 * codificacao Base64 - eficiente, padrao e roundtrip exato.
 *
 *   Int8Array  --base64-->  string  --localStorage.setItem
 *   localStorage.getItem  --base64-->  Int8Array
 */

const STORAGE_KEY = "tp4_aeds3_produtos_bytes";

const Armazenamento = {
  /**
   * Persiste o Int8Array no localStorage usando codificacao base64.
   * @param {Int8Array} bytes
   */
  salvar(bytes) {
    const b64 = bytesToBase64(bytes);
    localStorage.setItem(STORAGE_KEY, b64);
  },

  /**
   * Le o Int8Array do localStorage. Retorna null se nada foi salvo.
   * @returns {Int8Array|null}
   */
  carregar() {
    const b64 = localStorage.getItem(STORAGE_KEY);
    if (!b64) return null;
    try {
      return base64ToBytes(b64);
    } catch (e) {
      console.error("Falha ao decodificar storage:", e);
      return null;
    }
  },

  /**
   * Limpa o armazenamento (util para o botao "Resetar arquivo").
   */
  limpar() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

/**
 * Codifica um Int8Array em base64. Usa Uint8Array por baixo para que os
 * valores negativos sejam interpretados como bytes brutos (0..255).
 *
 * @param {Int8Array} bytes
 * @returns {string} base64
 */
function bytesToBase64(bytes) {
  const u8 = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let bin = "";
  // Concatena em pedacos para evitar stack overflow com arrays grandes
  const CHUNK = 0x8000;
  for (let i = 0; i < u8.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

/**
 * Decodifica uma string base64 em Int8Array.
 *
 * @param {string} b64
 * @returns {Int8Array}
 */
function base64ToBytes(b64) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Int8Array(u8.buffer);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Armazenamento, bytesToBase64, base64ToBytes, STORAGE_KEY };
}
