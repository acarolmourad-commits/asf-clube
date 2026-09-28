/**
 * ASF Clube — Controle de Emissão de Carteirinhas
 * Apps Script vinculado à planilha "ASF — Controle de Emissão de Carteirinhas"
 * https://docs.google.com/spreadsheets/d/1qZ-uMaRvht7SJ1DLHHo8sZGgfOfFxjn9_hqzJBqjet8/edit
 *
 * Como implantar:
 * 1. Abra a planilha → Extensões → Apps Script
 * 2. Cole este código em Code.gs e salve
 * 3. Implantar → Nova implantação → tipo "App da Web"
 *    - Executar como: Eu (asf.surffeminino@gmail.com)
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Copie a URL /exec e configure no index.html (const API_URL)
 *
 * Endpoint:
 *   POST /exec  body JSON: { "nome": "...", "nivel": "..." }
 *   Retorna: { "ok": true, "numero": "0001" }
 *   O número é sequencial e único (linha da planilha - 1, com zero padding).
 */

const SHEET_ID = '1qZ-uMaRvht7SJ1DLHHo8sZGgfOfFxjn9_hqzJBqjet8';
const SHEET_NAME = 'Página1';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // evita duas emissões simultâneas com o mesmo número
  try {
    const dados = JSON.parse(e.postData.contents || '{}');
    const nome = String(dados.nome || '').trim().slice(0, 40);
    const nivel = String(dados.nivel || '').trim().slice(0, 60);
    if (!nome) {
      return resposta({ ok: false, erro: 'nome obrigatório' });
    }

    const aba = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const ultimaLinha = aba.getLastRow(); // linha 1 = cabeçalho
    const numero = String(ultimaLinha).padStart(4, '0'); // 0001, 0002, ...

    aba.appendRow([
      numero,
      nome,
      nivel,
      new Date().toISOString(),
      'ATIVA',
      ''
    ]);

    return resposta({ ok: true, numero: numero });
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
