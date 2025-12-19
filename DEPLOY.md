# Guia de Deploy na Azure - Viagem Aparecida

Este guia detalha o processo completo de deploy do aplicativo na Azure.

## Pré-requisitos

- Conta Azure ativa
- Azure CLI instalado (`az login`)
- Node.js 18+ instalado
- Git instalado

## 1. Preparar o Banco de Dados

### 1.1. Executar Scripts SQL

Você já tem o banco criado. Apenas execute o script de criação das tabelas:

```sql
-- Conecte-se ao banco: sistemahorariodb no servidor sistemahorariosqlsrv.database.windows.net
-- Execute o arquivo: database/create_tables.sql
```

### 1.2. Configurar Firewall

No Portal Azure:
1. Vá em SQL databases > sistemahorariodb
2. Clique em "Set server firewall"
3. Adicione regra:
   - Nome: `AllowAzureServices`
   - Marque: "Allow Azure services and resources to access this server"
4. Salve

## 2. Deploy do Backend

### Opção A: Deploy via Azure Portal (Mais Fácil)

1. **Criar App Service:**
   - Portal Azure > Create a resource
   - Web App
   - Configurações:
     - Resource Group: (use o existente ou crie novo)
     - Name: `viagem-aparecida-api`
     - Publish: Code
     - Runtime stack: Node 18 LTS
     - Operating System: Linux
     - Region: Brazil South (ou East US)
     - Pricing: Free F1 (ou Basic B1)

2. **Configurar Variáveis de Ambiente:**
   - Vá em Configuration > Application settings
   - Adicione cada variável:

   ```
   PORT = 8080
   JWT_SECRET = sua_chave_super_secreta_aqui_2025
   DB_SERVER = sistemahorariosqlsrv.database.windows.net
   DB_DATABASE = sistemahorariodb
   DB_USER = adminuser
   DB_PASSWORD = SenhaForte!2025
   DB_PORT = 1433
   APP_USERNAME = viagem
   APP_PASSWORD = aparecida2025
   ```

   - Salve as configurações

3. **Deploy do Código:**

   **Via VS Code (Recomendado):**
   - Instale a extensão "Azure App Service"
   - Clique com botão direito na pasta `backend`
   - "Deploy to Web App..."
   - Selecione `viagem-aparecida-api`

   **Via ZIP Deploy:**
   ```bash
   cd backend
   npm install --production

   # Windows (PowerShell)
   Compress-Archive -Path * -DestinationPath backend.zip

   # Upload no Portal Azure:
   # App Service > Deployment Center > FTPS credentials
   # Ou use o Advanced Tools (Kudu) > ZIP Push Deploy
   ```

4. **Verificar:**
   - Acesse: `https://viagem-aparecida-api.azurewebsites.net/health`
   - Deve retornar: `{"status":"OK","message":"API funcionando"}`

### Opção B: Deploy via Azure CLI

```bash
# Login
az login

# Criar App Service Plan (se não tiver)
az appservice plan create \
  --name viagem-plan \
  --resource-group SEU_RESOURCE_GROUP \
  --sku F1 \
  --is-linux

# Criar Web App
az webapp create \
  --resource-group SEU_RESOURCE_GROUP \
  --plan viagem-plan \
  --name viagem-aparecida-api \
  --runtime "NODE:18-lts"

# Configurar variáveis
az webapp config appsettings set \
  --resource-group SEU_RESOURCE_GROUP \
  --name viagem-aparecida-api \
  --settings \
    PORT=8080 \
    JWT_SECRET=sua_chave_super_secreta_aqui_2025 \
    DB_SERVER=sistemahorariosqlsrv.database.windows.net \
    DB_DATABASE=sistemahorariodb \
    DB_USER=adminuser \
    DB_PASSWORD=SenhaForte!2025 \
    DB_PORT=1433 \
    APP_USERNAME=viagem \
    APP_PASSWORD=aparecida2025

# Deploy
cd backend
zip -r backend.zip .
az webapp deployment source config-zip \
  --resource-group SEU_RESOURCE_GROUP \
  --name viagem-aparecida-api \
  --src backend.zip
```

## 3. Deploy do Frontend

### 3.1. Atualizar Configuração

Edite `frontend/.env`:

```env
VITE_API_URL=https://viagem-aparecida-api.azurewebsites.net/api
```

### 3.2. Build

```bash
cd frontend
npm install
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados.

### 3.3. Deploy - Opção A: Azure Static Web Apps (Recomendado)

**Via Portal Azure:**

1. Create a resource > Static Web App
2. Configurações:
   - Name: `viagem-aparecida-app`
   - Region: East US 2
   - Source: Other (manual)
3. Criar

4. Deploy manual:
   ```bash
   # Instalar CLI do Static Web Apps
   npm install -g @azure/static-web-apps-cli

   cd frontend

   # Deploy
   swa deploy ./dist \
     --app-name viagem-aparecida-app \
     --resource-group SEU_RESOURCE_GROUP
   ```

**Via GitHub Actions (Melhor para CI/CD):**

1. Faça push do código para GitHub
2. No Portal Azure, ao criar Static Web App, escolha "GitHub"
3. Conecte ao repositório
4. Configure:
   - App location: `/frontend`
   - Output location: `dist`
5. Ele criará um workflow automático

### 3.4. Deploy - Opção B: Azure Blob Storage + CDN

```bash
# Criar Storage Account
az storage account create \
  --name viagemapps \
  --resource-group SEU_RESOURCE_GROUP \
  --location brazilsouth \
  --sku Standard_LRS

# Habilitar static website
az storage blob service-properties update \
  --account-name viagemapps \
  --static-website \
  --index-document index.html \
  --404-document index.html

# Upload dos arquivos
az storage blob upload-batch \
  --account-name viagemapps \
  --source ./frontend/dist \
  --destination '$web'

# URL do site será:
# https://viagemapps.z15.web.core.windows.net/
```

## 4. Configurações Finais

### 4.1. Habilitar CORS no Backend

Já está configurado no código, mas verifique se permite requisições do domínio do frontend.

### 4.2. HTTPS

Ambos os serviços já vêm com certificado SSL gratuito.

### 4.3. Custom Domain (Opcional)

Se você tem um domínio:

**Backend:**
- App Service > Custom domains > Add custom domain

**Frontend:**
- Static Web App > Custom domains > Add

## 5. Testar em Produção

1. Acesse a URL do frontend
2. Faça login:
   - Usuário: `viagem`
   - Senha: `aparecida2025`
   - Apelido: Seu nome
3. Teste criar atividade, adicionar foto, comentário

## 6. Monitoramento

### Application Insights (Recomendado)

```bash
# Criar Application Insights
az monitor app-insights component create \
  --app viagem-insights \
  --location brazilsouth \
  --resource-group SEU_RESOURCE_GROUP

# Conectar ao App Service
az webapp config appsettings set \
  --resource-group SEU_RESOURCE_GROUP \
  --name viagem-aparecida-api \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=<KEY>
```

### Logs

Ver logs do backend:
```bash
az webapp log tail \
  --resource-group SEU_RESOURCE_GROUP \
  --name viagem-aparecida-api
```

Ou no Portal:
- App Service > Log stream

## 7. Custos Estimados (Tier Grátis)

- **Azure SQL Database:** ~R$ 25/mês (Basic)
- **App Service:** Grátis (F1 tier)
- **Static Web App:** Grátis (até 100GB bandwidth)
- **Total:** ~R$ 25/mês

Para reduzir custos:
- Use o tier grátis quando possível
- Desligue recursos quando não estiver usando
- Delete após a viagem

## 8. Comandos Úteis

```bash
# Ver status do backend
az webapp show --name viagem-aparecida-api --resource-group SEU_RESOURCE_GROUP

# Restart do backend
az webapp restart --name viagem-aparecida-api --resource-group SEU_RESOURCE_GROUP

# Ver logs
az webapp log download --name viagem-aparecida-api --resource-group SEU_RESOURCE_GROUP

# Deletar tudo (após a viagem)
az group delete --name SEU_RESOURCE_GROUP
```

## 9. Troubleshooting

### Backend não conecta ao banco

- Verifique firewall do SQL Server
- Confirme variáveis de ambiente
- Veja logs: `az webapp log tail`

### Frontend não carrega

- Verifique `VITE_API_URL` no build
- Teste endpoint direto no navegador
- Verifique console do navegador (F12)

### CORS Error

- Verifique se backend permite origin do frontend
- Adicione domínio nas configurações CORS do App Service

### Fotos não carregam

- Limite de 5MB por foto
- Aumente `maxRequestLength` no backend se necessário

## 10. Backup

Fazer backup do banco antes da viagem:

```bash
az sql db export \
  --resource-group SEU_RESOURCE_GROUP \
  --server sistemahorariosqlsrv \
  --name sistemahorariodb \
  --admin-user adminuser \
  --admin-password SenhaForte!2025 \
  --storage-key-type StorageAccessKey \
  --storage-key <STORAGE_KEY> \
  --storage-uri https://SEU_STORAGE.blob.core.windows.net/backups/backup.bacpac
```

---

**Pronto! Seu app está no ar!** 🚀

URL exemplo:
- Frontend: `https://viagem-aparecida-app.azurestaticapps.net`
- Backend: `https://viagem-aparecida-api.azurewebsites.net`

Compartilhe a URL do frontend com seus amigos e aproveitem a viagem!
