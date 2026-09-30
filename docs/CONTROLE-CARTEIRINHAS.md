# ASF Clube — Controle de Emissão de Carteirinhas

## Regra oficial (30/09/2026)
- **1 carteirinha por pessoa**, com **validade de 1 ano**
- Se o nome já tem carteirinha válida (< 1 ano), o sistema retorna o número **existente** — nunca cria duplicata
- **Renovação** (após 1 ano): preserva o número original, atualiza o registro (origem `site-renovacao`)
- Numeração: **maior número existente + 1** (imune a exclusões de linhas)

## Componentes
| Peça | Onde vive |
|---|---|
| Front-end | `index.html` (GitHub Pages) — trava o botão após emissão e reutiliza o número salvo |
| Backend | `apps-script/Code.gs` (Apps Script vinculado à planilha) — fonte da verdade da regra |
| Registro | Planilha oficial [ASF — Registro de Carteirinhas](https://docs.google.com/spreadsheets/d/1XVAma2w7qc0FJ-PJ385hoiT-3PKO1kmDiRxjPzOoA04/edit), aba `Carteirinhas` |
| Deploy do backend | `.github/workflows/deploy-apps-script.yml` (automático a cada mudança em `apps-script/`) |

## Configurar o deploy automático (uma vez só)

### 1. Obter o Script ID
1. Abra a planilha oficial → **Extensões → Apps Script**
2. **Configurações do projeto** (⚙️) → copie o **ID do script**
3. No GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Nome: `APPS_SCRIPT_ID` · Valor: o ID copiado

### 2. Criar a Service Account no Google Cloud
1. Acesse [console.cloud.google.com](https://console.cloud.google.com) com a conta asf.surffeminino@gmail.com
2. Crie um projeto (ou use um existente) → **APIs e serviços → Biblioteca** → ative **Google Apps Script API**
3. **IAM → Contas de serviço → Criar conta de serviço** (nome sugerido: `asf-clasp-deploy`)
4. Crie uma **chave JSON** (Conta → Chaves → Adicionar chave → JSON) e baixe o arquivo
5. No GitHub, crie o secret `CLASP_CREDENTIALS` com **todo o conteúdo do JSON**

### 3. Autorizar o acesso ao script
1. No Apps Script: **Configurações do projeto** → ative **Google Apps Script API**
2. No editor do Apps Script, clique em **Compartilhar** e adicione o e-mail da Service Account como **Editor**

### 4. Primeira implantação como Web App (única etapa manual)
A Action envia o código (push), mas a **versão publicada** do Web App é controlada no editor:
1. Após o primeiro run da Action, abra o Apps Script → **Implantar → Gerenciar implantações**
2. Edite a implantação → **Nova versão** → Implantar
3. Pronto: o endpoint `/exec` passa a rodar o código mais recente

> Dica: para futuras mudanças de código, basta repetir a etapa 4 (nova versão). O código já estará lá via Action.

## Teste de deduplicação (pós-deploy)
Emita 2× seguidas com o mesmo nome pelo site. Esperado:
- 1ª emissão → cria número novo
- 2ª emissão → retorna **o mesmo número**, sem nova linha na planilha

## Histórico de incidentes
- **30/09/2026**: bug de emissão duplicada (backend fazia append sem checar existência). Davi recebeu 6 números (14–19), Milena 2 (20–21), Carol 2 (22–23). Planilha limpa mantendo os números originais (14, 20, 22). Correções: commit `a0366d3` (backend) e `e607c7c` (front).
