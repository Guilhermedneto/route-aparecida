# Guia de Deploy - Viagem Aparecida

Este guia detalha como fazer o deploy completo da aplicação no Azure.

## Pré-requisitos

- Conta no Azure
- Azure CLI instalado (`az login`)
- Node.js 18+ instalado localmente
- Git configurado

## Opção 1: Deploy Automático via GitHub Actions (Recomendado)

### 1. Deploy do Backend (Azure App Service)

#### Criar o App Service

```bash
# Login no Azure
az login

# Criar Resource Group (se não existir)
az group create --name viagem-aparecida-rg --location "East US"

# Criar App Service Plan
az appservice plan create \
  --name viagem-aparecida-plan \
  --resource-group viagem-aparecida-rg \
  --sku B1 \
  --is-linux

# Criar Web App para o backend
az webapp create \
  --name viagem-aparecida-api \
  --resource-group viagem-aparecida-rg \
  --plan viagem-aparecida-plan \
  --runtime "NODE:18-lts"
```

#### Configurar Variáveis de Ambiente

No Portal do Azure:
1. Acesse o App Service criado
2. Vá em **Configuration** > **Application settings**
3. Adicione as seguintes variáveis:

```
PORT=8080
JWT_SECRET=sua_chave_secreta_muito_forte_aqui_mude_isso
DB_SERVER=sistemahorariosqlsrv.database.windows.net
DB_DATABASE=sistemahorariodb
DB_USER=adminuser
DB_PASSWORD=SenhaForte!2025
DB_PORT=1433
APP_USERNAME=viagem
APP_PASSWORD=aparecida2025
```

4. Clique em **Save**

#### Configurar Deploy do GitHub

```bash
# Obter credenciais de publicação
az webapp deployment list-publishing-profiles \
  --name viagem-aparecida-api \
  --resource-group viagem-aparecida-rg \
  --xml
```

No GitHub:
1. Vá em **Settings** > **Secrets and variables** > **Actions**
2. Adicione um novo secret chamado `AZURE_WEBAPP_PUBLISH_PROFILE`
3. Cole o XML obtido acima

#### Adicionar Firewall Rule para o Backend

```bash
# Permitir serviços do Azure acessarem o banco
az sql server firewall-rule create \
  --resource-group SEU_RESOURCE_GROUP_DO_SQL \
  --server sistemahorariosqlsrv \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 2. Deploy do Frontend (Azure Static Web Apps)

#### Criar Static Web App

```bash
# Criar Static Web App
az staticwebapp create \
  --name viagem-aparecida-app \
  --resource-group viagem-aparecida-rg \
  --location "East US 2" \
  --source https://github.com/Guilhermedneto/route-aparecida \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist" \
  --login-with-github
```

#### Obter o deployment token

```bash
az staticwebapp secrets list \
  --name viagem-aparecida-app \
  --resource-group viagem-aparecida-rg
```

No GitHub:
1. Vá em **Settings** > **Secrets and variables** > **Actions**
2. Adicione um novo secret chamado `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. Cole o token obtido acima

#### Configurar Variáveis de Ambiente do Frontend

Crie o arquivo `frontend/.env.production`:

```env
VITE_API_URL=https://viagem-aparecida-api.azurewebsites.net/api
```

### 3. Configurar CORS no Backend

O backend já está configurado para aceitar todas as origens. Para produção, edite `backend/server.js`:

```javascript
app.use(cors({
  origin: 'https://NOME-DO-SEU-STATIC-WEB-APP.azurestaticapps.net'
}));
```

### 4. Fazer Push e Deploy Automático

```bash
git add .
git commit -m "Configure production environment"
git push origin main
```

Os workflows do GitHub Actions farão o deploy automaticamente!

## Opção 2: Deploy Manual

### Backend Manual

```bash
cd backend
npm install --production

# Criar arquivo zip
zip -r backend.zip . -x "node_modules/*"

# Deploy via Azure CLI
az webapp deployment source config-zip \
  --resource-group viagem-aparecida-rg \
  --name viagem-aparecida-api \
  --src backend.zip
```

### Frontend Manual

```bash
cd frontend

# Criar arquivo .env.production com a URL do backend
echo "VITE_API_URL=https://viagem-aparecida-api.azurewebsites.net/api" > .env.production

# Build
npm install
npm run build

# Deploy
az staticwebapp deploy \
  --name viagem-aparecida-app \
  --resource-group viagem-aparecida-rg \
  --app-location ./dist
```

## Verificação do Deploy

### Backend
Acesse: `https://viagem-aparecida-api.azurewebsites.net/health`

Deve retornar:
```json
{
  "status": "OK",
  "message": "API funcionando"
}
```

### Frontend
Acesse: `https://viagem-aparecida-app.azurestaticapps.net`

Deve aparecer a tela de login.

## Monitoramento

### Logs do Backend

```bash
# Ver logs em tempo real
az webapp log tail \
  --name viagem-aparecida-api \
  --resource-group viagem-aparecida-rg
```

Ou acesse no Portal: **App Service** > **Log stream**

### Logs do Frontend

Acesse no Portal: **Static Web App** > **Functions** > **Logs**

## Problemas Comuns

### Backend não conecta ao banco

1. Verifique as regras de firewall do SQL Server
2. Confirme as variáveis de ambiente no App Service
3. Verifique os logs do backend

### Frontend não carrega dados

1. Verifique se `VITE_API_URL` está correto
2. Verifique CORS no backend
3. Abra o console do navegador (F12) para ver erros

### Erro 500 ao fazer upload de foto

- Limite de payload pode estar baixo
- Edite `server.js`: `app.use(express.json({ limit: '50mb' }))`

## Custos Estimados (Azure)

- **App Service B1**: ~$13/mês
- **Static Web App**: Grátis (até 100GB bandwidth)
- **SQL Database**: Custo do seu plano atual

**Total**: ~$13/mês + custo do SQL existente

## URLs Finais

Após o deploy:
- **API**: `https://viagem-aparecida-api.azurewebsites.net`
- **App**: `https://viagem-aparecida-app.azurestaticapps.net`

Compartilhe a URL do app com seus amigos!

## Próximos Passos

1. Configure domínio customizado (opcional)
2. Configure SSL (já incluído gratuitamente)
3. Configure Application Insights para monitoramento
4. Configure auto-scaling se necessário

---

Desenvolvido com Claude Code
