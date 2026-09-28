# 📋 Controle de Emissão de Carteirinhas

Implementação do controle central de emissão proposto na issue #2, usando **Google Sheets + Apps Script** (opção 1 — simples e sem custo).

## Componentes

| Componente | Onde |
|---|---|
| Planilha de registro | [ASF — Controle de Emissão de Carteirinhas](https://docs.google.com/spreadsheets/d/1qZ-uMaRvht7SJ1DLHHo8sZGgfOfFxjn9_hqzJBqjet8/edit) |
| Backend (Apps Script) | [`apps-script/Code.gs`](apps-script/Code.gs) |
| Frontend (carteirinha) | `index.html` (esta página) |

## O que o controle garante

- ✅ Número de membro **sequencial e único** (0001, 0002, ...) — substitui o número aleatório anterior
- ✅ **Registro central** de todas as emissões (nome, nível, data UTC, status) na planilha
- ✅ Proteção contra emissões simultâneas duplicadas (lock no Apps Script)
- ✅ Possibilidade de **revogar** uma carteirinha alterando o `Status` para `REVOGADA` na planilha
- ✅ Consulta do total emitido via `GET` no endpoint

## Como implantar (passo a passo)

1. Abra a [planilha](https://docs.google.com/spreadsheets/d/1qZ-uMaRvht7SJ1DLHHo8sZGgfOfFxjn9_hqzJBqjet8/edit) → **Extensões → Apps Script**
2. Copie o conteúdo de [`apps-script/Code.gs`](apps-script/Code.gs) para o editor e salve
3. **Implantar → Nova implantação → App da Web**
   - Executar como: **Eu** (asf.surffeminino@gmail.com)
   - Quem pode acessar: **Qualquer pessoa**
4. Copie a URL gerada (termina em `/exec`)
5. No `index.html`, defina `const API_URL = '<URL-do-/exec>'` no script da carteirinha e faça o formulário chamar `POST` com `{nome, nivel}`, usando o `numero` retornado para exibir na carteirinha

## Observações

- A numeração só passa a valer para emissões feitas **após** a implantação; carteirinhas antigas (número aleatório local) não ficam retroativamente registradas
- LGPD: a planilha contém dados pessoais (nome). Mantenha o acesso restrito à conta asf.surffeminino@gmail.com
