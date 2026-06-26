/**
 * visualizacao.js
 * Renderiza o Int8Array do Arquivo como uma grade de "celulas",
 * uma por byte. Cada celula tem:
 *
 *   - Cor de fundo conforme a categoria do byte (cabecalho, lapide,
 *     tamanho, ou um dos campos do Produto)
 *   - O valor decimal do byte (com sinal, ja que Int8Array)
 *   - Um tooltip mostrando o significado completo do byte
 *
 * Cada registro recebe uma borda externa colorida (1 cor por registro,
 * em ciclo), e registros deletados aparecem com hachuras + opacidade
 * reduzida.
 */

const Visualizacao = (() => {
  // Cores de borda por registro (ciclam quando ha muitos)
  const CORES_REGISTRO = [
    "#0ea5e9", // ciano
    "#a855f7", // roxo
    "#f97316", // laranja
    "#10b981", // verde
    "#ef4444", // vermelho
    "#eab308", // amarelo
  ];

  /**
   * Renderiza o estado completo do Arquivo no elemento container.
   *
   * @param {HTMLElement} container
   * @param {Arquivo}     arquivo
   */
  function render(container, arquivo) {
    container.innerHTML = "";
    const bytes = arquivo.getBytes();

    if (bytes.length === 0) {
      container.innerHTML = '<p class="vazio">Arquivo vazio.</p>';
      return;
    }

    // ----- Cabecalho global (4 bytes: ultimoIdUsado) -----
    const tituloCabecalho = document.createElement("div");
    tituloCabecalho.className = "secao-titulo";
    tituloCabecalho.textContent = `Cabeçalho global  ·  últimoIdUsado = ${arquivo.ultimoIdUsado()}`;
    container.appendChild(tituloCabecalho);

    const blocoCabecalho = document.createElement("div");
    blocoCabecalho.className = "registro registro-cabecalho";
    for (let i = 0; i < TAM_CABECALHO; i++) {
      const cell = criarCelula(bytes[i], i, "campo-cabecalho",
        `Cabeçalho · byte ${i + 1}/4 do últimoIdUsado (int) = ${arquivo.ultimoIdUsado()}`);
      blocoCabecalho.appendChild(cell);
    }
    container.appendChild(blocoCabecalho);

    // ----- Registros -----
    let indice = 0;
    for (const reg of arquivo.iterarRegistros()) {
      const cor = CORES_REGISTRO[indice % CORES_REGISTRO.length];
      const tituloReg = document.createElement("div");
      tituloReg.className = "secao-titulo";
      tituloReg.style.color = cor;

      const tag = reg.deletado ? "❌ deletado" : "✅ ativo";
      tituloReg.textContent =
        `Registro #${indice + 1}  ·  id=${reg.id}  ·  ${tag}  ·  ${reg.tamanhoTotal} bytes (1 lápide + 4 tamanho + ${reg.tamanhoDados} dados)`;
      container.appendChild(tituloReg);

      const blocoReg = document.createElement("div");
      blocoReg.className = "registro" + (reg.deletado ? " deletado" : "");
      blocoReg.style.borderColor = cor;

      // 1. Lapide
      const lapideValor = bytes[reg.offsetLapide];
      const lapideCell = criarCelula(
        lapideValor,
        reg.offsetLapide,
        "campo-lapide",
        `Lápide do registro #${indice + 1}: ${reg.deletado ? "1 (deletado)" : "0 (ativo)"}`
      );
      blocoReg.appendChild(lapideCell);

      // 2. Tamanho (4 bytes)
      for (let i = 0; i < TAM_TAMANHO; i++) {
        const cell = criarCelula(
          bytes[reg.offsetTamanho + i],
          reg.offsetTamanho + i,
          "campo-tamanho",
          `Tamanho do registro #${indice + 1} · byte ${i + 1}/4 do int = ${reg.tamanhoDados}`
        );
        blocoReg.appendChild(cell);
      }

      // 3. Dados do produto (campo a campo)
      if (!reg.deletado) {
        const produto = Produto.fromByteArray(bytes, reg.offsetDados);
        const campos = produto.layoutCampos();
        for (const campo of campos) {
          for (let i = 0; i < campo.tamanho; i++) {
            const offsetReal = reg.offsetDados + campo.offset + i;
            const cell = criarCelula(
              bytes[offsetReal],
              offsetReal,
              campo.classeCss,
              `${campo.nome} · byte ${i + 1}/${campo.tamanho} = ${formatarValor(campo.valor)}`
            );
            blocoReg.appendChild(cell);
          }
        }
        // Padding entre fim dos campos e fim do slot (caso houve update menor)
        let tamanhoCalculado = 0;
        for (const c of campos) tamanhoCalculado += c.tamanho;
        const padding = reg.tamanhoDados - tamanhoCalculado;
        for (let i = 0; i < padding; i++) {
          const offsetReal = reg.offsetDados + tamanhoCalculado + i;
          const cell = criarCelula(
            bytes[offsetReal],
            offsetReal,
            "campo-padding",
            `Padding (slot maior que dados após update in-place) · byte ${i + 1}/${padding}`
          );
          blocoReg.appendChild(cell);
        }
      } else {
        // Registro deletado - mostra todos os bytes de dados como "morto"
        for (let i = 0; i < reg.tamanhoDados; i++) {
          const offsetReal = reg.offsetDados + i;
          const cell = criarCelula(
            bytes[offsetReal],
            offsetReal,
            "campo-deletado",
            `Bytes do registro deletado (ainda no arquivo) · byte ${i + 1}/${reg.tamanhoDados}`
          );
          blocoReg.appendChild(cell);
        }
      }

      container.appendChild(blocoReg);
      indice++;
    }
  }

  /**
   * Cria uma celula HTML para um unico byte.
   *
   * @param {number} valor    valor do byte (Int8, -128..127)
   * @param {number} offset   posicao no Int8Array
   * @param {string} classeCss classe do tipo de campo
   * @param {string} tooltip
   * @returns {HTMLDivElement}
   */
  function criarCelula(valor, offset, classeCss, tooltip) {
    const cell = document.createElement("div");
    cell.className = "byte " + classeCss;
    cell.textContent = valor;
    cell.title = `byte ${offset}: ${valor} (0x${(valor & 0xff).toString(16).padStart(2, "0").toUpperCase()}) — ${tooltip}`;
    return cell;
  }

  /**
   * Formata um valor para exibir no tooltip (mascara datas e booleans).
   */
  function formatarValor(v) {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number" && !Number.isInteger(v)) return v.toFixed(2);
    return String(v);
  }

  return { render };
})();
