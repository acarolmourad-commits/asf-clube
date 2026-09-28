# 📇 Controle de Emissão de Carteirinhas

Implementação do controle central de emissão proposto na issue #2, usando **Google Sheets + Apps Script** (opção 1 — simples e sem custo).

## Componentes

| Componente | Onde |
|---|---|
| Planilha de registro (OFICIAL) | [ASF — Registro de Carteirinhas](https://docs.google.com/spreadsheets/d/1XVAma2w7qc0FJ-PJ385hoiT-3PKO1kmDiRxjPzOoA04/edit) |
| Backend (Apps Script) | [`apps-script/Code.gs`](apps-script/Code.gs) |
| Frontend (carteirinha) | `index.html` (esta página) |

> ⚠️ A planilha "ASF — Controle de Emissão de Carteirinhas" foi **descontinuada em 28/09/2026** (consolidação). Todos os registros vão apenas para a planilha oficial acima, aba **Carteirinhas** (colunas: timestamp · numero · nome · apelido · nivel · praia · cidade · insta · origem). A aba também tem um painel automático com total e contagem por nível (colunas K–L).

## O que o controle garante

- ✅ Número de membro **sequencial e único** (0001, 0002, ...) — substitui o número aleatório anterior
- ✅ **Registro central** de todas as emissões (timestamp, número, nome, nível, origem) na planilha oficial
- ✅ Proteção contra emissões simultâneas duplicadas (lock no Apps Script)
- ✅ Possibilidade de **revogar** uma carteirinha apagando/marcando a linha na planilha
- ✅ Consulta do total emitido via `GET` no endpoint

## Como implantar (passo a passo)

1. Abra a [planilha oficial](https://docs.google.com/spreadsheets/d/1XVAma2w7qc0FJ-PJ385hoiT-3PKO1kmDiRxjPzOoA04/edit) → **Extensões → Apps Script**
2. Copie o conteúdo de [`apps-script/Code.gs`](apps-script/Code.gs) para o editor e salve
3. **Implantar → Nova implantação → App da Web**
   - Executar como: **Eu** (asf.surffeminino@gmail.com)
   - Quem pode acessar: **Qualquer pessoa**
4. Copie a URL gerada (termina em `/exec`)
5. No `index.html`, defina `const API_URL = '<URL-do-/exec>'` no script da carteirinha. O formulário já chama `POST` com `{nome, nivel}` e usa o `numero` retornado para exibir na carteirinha

## Observações

- A numeração só passa a valer para emissões feitas **após** a implantação; carteirinhas antigas (número aleatório local) não ficam retroativamente registradas
- LGPD: a planilha contém dados pessoais (nome). Mantenha o acesso restrito à conta asf.surffeminino@gmail.com
