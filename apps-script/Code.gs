/*
 * ASF Clube — Controle de Emissão de Carteirinhas
 * Apps Script vinculado à planilha OFICIAL "ASF — Registro de Carteirinhas"
 * https://docs.google.com/spreadsheets/d/1XVAma2w7qc0FJ-PJ385hoiT-3PKO1kmDiRxjPzOoA04/edit
 *
 * REGRA OFICIAL (30/09/2026): 1 carteirinha por pessoa, validade de 1 ano.
 * - Se o nome já possui carteirinha emitida há menos de 1 ano, retorna o número
 *   EXISTENTE (não cria duplicata).
 * - Renovação (após 1 ano) preserva o número original e atualiza o registro.
 * - O número é sequencial único: MAIOR número existente + 1 (independe de
 *   exclusões de linhas na planilha).
 *
 * Como implantar:
 * 1. Abra a planilha oficial → Extensões → Apps Script
 * 2. Cole este código em Code.gs e salve
 * 3. Implantar → Nova implantação → tipo "App da Web"
 *    - Executar como: Eu (asf.surffeminino@gmail.com)
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Copie a URL /exec e configure no index.html (const API_URL)
 *
 * Endpoint:
 *   POST /exec body JSON: { "nome": "...", "nivel": "..." }
 *   Retorna: { "ok": true, "numero": "0014", "existente": false, "validade": "2027-09-30" }
 *
 * Colunas da aba "Carteirinhas":
 *   timestamp · numero · nome · apelido · nivel · praia · cidade · insta · origem
 */

const SHEET_ID = '1XVAma2w7qc0FJ-PJ385hoiT-3PKO1kmDiRxjPzOoA04';
const SHEET_NAME = 'Carteirinhas';
const VALIDADE_DIAS = 365; // 1 carteirinha por pessoa com validade de 1 ano

function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // evita emissões simultâneas (cliques repetidos)
  try {
    const dados = JSON.parse(e.postData.contents || '{}');
    const nome = String(dados.nome || '').trim().slice(0, 40);
    const nivel = String(dados.nivel || '').trim().slice(0, 60);
    if (!nome) {
      return resposta({ ok: false, erro: 'nome obrigatório' });
    }

    const aba = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const ultimaLinha = aba.getLastRow();

    // Lê registros existentes (nome = coluna C, numero = coluna B, timestamp = coluna A)
    let maiorNumero = 0;
    let linhaExistente = 0;
    let numeroExistente = null;
    let tsExistente = null;

    if (ultimaLinha > 1) {
      const vals = aba.getRange(2, 1, ultimaLinha - 1, 9).getValues();
      for (let i = 0; i < vals.length; i++) {
        const ts = vals[i][0];
        const num = parseInt(vals[i][1], 10);
        if (!isNaN(num) && num > maiorNumero) maiorNumero = num;
        if (norm(vals[i][2]) === norm(nome) && !linhaExistente) {
          linhaExistente = i + 2;
          numeroExistente = String(vals[i][1]);
          tsExistente = ts;
        }
      }
    }

    // 1 carteirinha por pessoa: se já existe e está dentro da validade, retorna a existente
    if (linhaExistente) {
      const emissao = new Date(tsExistente);
      const idadeMs = Date.now() - emissao.getTime();
      if (idadeMs < VALIDADE_DIAS * 86400000) {
        const validade = new Date(emissao.getTime() + VALIDADE_DIAS * 86400000);
        return resposta({
          ok: true,
          numero: numeroExistente,
          existente: true,
          validade: validade.toISOString().slice(0, 10)
        });
      }
      // Renovação após 1 ano: preserva o número original, atualiza o registro
      aba.getRange(linhaExistente, 1, 1, 9).setValues([[
        new Date().toISOString(), numeroExistente, nome,
        dados.apelido || '', nivel, dados.praia || '',
        dados.cidade || '', dados.insta || '', 'site-renovacao'
      ]]);
      const validade = new Date(Date.now() + VALIDADE_DIAS * 86400000);
      return resposta({
        ok: true,
        numero: numeroExistente,
        renovada: true,
        validade: validade.toISOString().slice(0, 10)
      });
    }

    // Nova emissão: número = maior existente + 1 (não depende da contagem de linhas)
    const numero = String(maiorNumero + 1).padStart(4, '0');
    aba.appendRow([
      new Date().toISOString(),
      numero,
      nome,
      dados.apelido || '',
      nivel,
      dados.praia || '',
      dados.cidade || '',
      dados.insta || '',
      'site'
    ]);

    const validade = new Date(Date.now() + VALIDADE_DIAS * 86400000);
    return resposta({ ok: true, numero: numero, existente: false, validade: validade.toISOString().slice(0, 10) });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  const aba = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const total = Math.max(aba.getLastRow() - 1, 0);
  return resposta({ ok: true, emitidas: total });
}

function resposta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
