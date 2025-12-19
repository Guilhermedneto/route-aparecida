# Quick Start - Rodar Localmente em 5 Minutos

## 1. Criar Tabelas no Banco de Dados

Conecte-se ao Azure SQL Database e execute:

```bash
# Use Azure Data Studio, SSMS ou Azure Portal Query Editor
# Execute o arquivo: database/create_tables.sql
```

Ou copie e cole direto no Query Editor do Portal Azure:

1. Portal Azure > SQL databases > sistemahorariodb
2. Query editor
3. Login: adminuser / SenhaForte!2025
4. Cole o conteúdo de `database/create_tables.sql`
5. Run

## 2. Instalar Dependências

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 3. Iniciar os Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Servidor backend rodando em: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Aplicação rodando em: http://localhost:3000

## 4. Acessar o App

1. Abra o navegador em: http://localhost:3000
2. Use as credenciais:
   - **Usuário:** viagem
   - **Senha:** aparecida2025
   - **Apelido:** Digite seu nome (ex: João)

## 5. Testar Funcionalidades

1. Criar uma atividade (botão +)
2. Clicar na atividade para ver detalhes
3. Adicionar uma foto
4. Adicionar um comentário
5. Marcar como realizada (✓)
6. Ver a galeria (ícone 🖼️)

## Pronto!

Agora você pode:
- Testar todas as funcionalidades localmente
- Fazer modificações no código
- Preparar para o deploy na Azure (veja DEPLOY.md)

## Próximos Passos

- Ler [README.md](README.md) - Documentação completa
- Ler [DEPLOY.md](DEPLOY.md) - Deploy na Azure
- Personalizar cores, textos, etc.

## Credenciais Padrão

**App:**
- Usuário: viagem
- Senha: aparecida2025

**Banco de Dados Azure:**
- Server: sistemahorariosqlsrv.database.windows.net
- Database: sistemahorariodb
- User: adminuser
- Password: SenhaForte!2025

---

Divirta-se! 🎉
