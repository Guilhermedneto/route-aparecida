# ✅ Azure Resources Created Successfully!

## Resources Created

### 1. Resource Group
- **Name**: `viagem-aparecida-rg`
- **Location**: East US / Brazil South

### 2. Backend (App Service)
- **Name**: `viagem-aparecida-api`
- **URL**: https://viagem-aparecida-api.azurewebsites.net
- **Runtime**: Node.js 20 LTS
- **Plan**: B1 (Basic)
- **Region**: Brazil South

### 3. Frontend (Static Web App)
- **Name**: `viagem-aparecida-app`
- **URL**: https://thankful-river-07f9f4f0f.3.azurestaticapps.net
- **Plan**: Free
- **Region**: East US 2

## ⚠️ NEXT STEPS - Configure GitHub Secrets

Para ativar o deploy automático via GitHub Actions, você precisa configurar 2 secrets:

### 1. Backend Deploy Secret

1. Acesse: https://github.com/Guilhermedneto/route-aparecida/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Value: Cole o conteúdo do arquivo **`backend-publish-profile.xml`** (está na raiz do projeto)
   - Abra o arquivo `backend-publish-profile.xml`
   - Copie TODO o conteúdo (inclusive as tags XML)
   - Cole no campo Value
5. Clique em **"Add secret"**

### 2. Frontend Deploy Secret

1. Na mesma página de secrets, clique em **"New repository secret"** novamente
2. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. Value: `476a7741c9ef7fe67debd538a7ad19c1fd3caee3aabc595ecf8cdbb0252870f903-1eeb42e5-bfb7-4f70-ba39-31fcc25ffd1d00f272207f9f4f0f`
4. Clique em **"Add secret"**

## 🚀 Deploy the Application

Depois de configurar os secrets, faça o deploy:

```bash
# Commit as mudanças do .env.production
git add .
git commit -m "Update production environment"
git push origin main
```

Os workflows do GitHub Actions irão executar automaticamente e fazer o deploy!

Você pode acompanhar em: https://github.com/Guilhermedneto/route-aparecida/actions

## 🔍 Verificar Deploy

### Backend
Teste se a API está funcionando:
```bash
curl https://viagem-aparecida-api.azurewebsites.net/health
```

Deve retornar:
```json
{"status":"OK","message":"API funcionando"}
```

### Frontend
Acesse: https://thankful-river-07f9f4f0f.3.azurestaticapps.net

Você deve ver a tela de login!

## 📝 Environment Variables Configured

As seguintes variáveis foram configuradas no backend:
- ✅ PORT=8080
- ✅ JWT_SECRET
- ✅ DB_SERVER
- ✅ DB_DATABASE
- ✅ DB_USER
- ✅ DB_PASSWORD
- ✅ DB_PORT
- ✅ APP_USERNAME
- ✅ APP_PASSWORD

## 🔒 Firewall SQL Server

O firewall já está configurado para aceitar conexões do Azure.

## 📱 Compartilhe com Seus Amigos!

Após o deploy, compartilhe esta URL com seus amigos:

**https://thankful-river-07f9f4f0f.3.azurestaticapps.net**

Credenciais para login:
- **Usuário**: viagem
- **Senha**: aparecida2025
- **Apelido**: Cada pessoa escolhe o seu

## 💰 Custos Estimados

- App Service B1: ~R$ 65/mês
- Static Web App: Grátis
- SQL Database: Custo do seu plano existente

**Total novo**: ~R$ 65/mês

## 🛠 Próximos Passos Opcionais

1. **Domínio Customizado**: Configure um domínio próprio no Static Web App
2. **Application Insights**: Ative monitoramento de logs e performance
3. **SSL Customizado**: Já vem SSL gratuito, mas você pode configurar certificados customizados
4. **Auto-scaling**: Configure escalonamento automático conforme o uso

## 🆘 Suporte

Se algo der errado:
1. Verifique os logs em: https://portal.azure.com
2. Vá em App Service > Log stream (backend)
3. Vá em Static Web App > Functions > Monitor (frontend)
4. Confira os workflows do GitHub Actions

---

Tudo pronto para usar! 🎉
