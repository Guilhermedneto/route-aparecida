# Viagem Aparecida - App de Compartilhamento de Atividades

Aplicativo web responsivo para compartilhar atividades, fotos e comentários durante uma viagem com amigos.

## Funcionalidades

- Login compartilhado entre todos os participantes
- Identificação por apelido
- CRUD completo de atividades (criar, editar, marcar como realizada, excluir)
- Upload e visualização de fotos
- Sistema de comentários
- Filtros (Todas, Hoje, Amanhã, Pendentes, Concluídas)
- Galeria consolidada de todas as fotos
- Interface mobile-first otimizada para celulares

## Tecnologias Utilizadas

### Backend
- Node.js + Express
- Azure SQL Database (SQL Server)
- JWT para autenticação
- Bcrypt para hash de senhas

### Frontend
- React 18
- Vite (build tool)
- TailwindCSS (estilização)
- React Router (navegação)
- Axios (requisições HTTP)
- date-fns (manipulação de datas)

## Estrutura do Projeto

```
APP - Aparecida/
├── backend/              # API Node.js
│   ├── config/          # Configuração do banco
│   ├── middleware/      # Middleware de autenticação
│   ├── routes/          # Rotas da API
│   ├── server.js        # Servidor principal
│   ├── package.json
│   └── .env
├── frontend/            # Interface React
│   ├── src/
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── context/    # Context API (Auth)
│   │   ├── services/   # Chamadas à API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
└── database/            # Scripts SQL
    └── create_tables.sql
```

## Instalação e Configuração Local

### 1. Criar as tabelas no banco de dados

Execute o script SQL no Azure SQL Database:

```bash
# Conecte-se ao seu banco Azure e execute:
database/create_tables.sql
```

Isso criará as seguintes tabelas:
- `auth` - Credenciais de login
- `user_sessions` - Sessões de usuários
- `activities` - Atividades da viagem
- `photos` - Fotos das atividades
- `comments` - Comentários das atividades

### 2. Configurar Backend

```bash
cd backend
npm install
```

Edite o arquivo `.env` se necessário (a conexão já está configurada):

```env
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui_mude_em_producao

# Azure SQL Database (já configurado)
DB_SERVER=sistemahorariosqlsrv.database.windows.net
DB_DATABASE=sistemahorariodb
DB_USER=adminuser
DB_PASSWORD=SenhaForte!2025
DB_PORT=1433

# Credenciais do app (padrão)
APP_USERNAME=viagem
APP_PASSWORD=aparecida2025
```

Inicie o servidor backend:

```bash
npm start
# ou para desenvolvimento:
npm run dev
```

O backend rodará em `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

O arquivo `.env` já está configurado:

```env
VITE_API_URL=http://localhost:5000/api
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend rodará em `http://localhost:3000`

## Uso da Aplicação

### Login

Use as credenciais padrão:
- **Usuário:** `viagem`
- **Senha:** `aparecida2025`
- **Apelido:** Digite o seu nome/apelido (ex: João, Maria, etc.)

Todos os amigos usam o mesmo usuário e senha, diferenciando-se apenas pelo apelido.

### Criar Atividade

1. Clique no botão `+` na navegação inferior
2. Preencha:
   - Atividade (obrigatório)
   - Local (opcional)
   - Data (obrigatório)
   - Hora (opcional)
3. Clique em "Criar"

### Gerenciar Atividades

- **Marcar como realizada:** Clique no ✓
- **Editar:** Abra a atividade e clique em "Editar"
- **Excluir:** Clique no ícone de lixeira 🗑️

### Adicionar Fotos e Comentários

1. Clique em uma atividade
2. Use o botão "+ Adicionar" na seção de fotos
3. Escreva comentários no campo de texto e clique em "Enviar"

### Filtros

Use os filtros no topo da tela inicial:
- **Todas** - Todas as atividades
- **Hoje** - Apenas atividades de hoje
- **Amanhã** - Apenas atividades de amanhã
- **Pendentes** - Não concluídas
- **Concluídas** - Marcadas como feitas

### Galeria

Clique no ícone 🖼️ para ver todas as fotos da viagem em um só lugar.

## Deploy na Azure

### Backend (Azure App Service)

1. **Criar App Service:**
   ```bash
   az webapp create --name viagem-aparecida-api \
     --resource-group SEU_RESOURCE_GROUP \
     --plan SEU_APP_SERVICE_PLAN \
     --runtime "NODE|18-lts"
   ```

2. **Configurar variáveis de ambiente no Portal Azure:**
   - Vá em Configuration > Application settings
   - Adicione todas as variáveis do `.env`

3. **Deploy:**
   ```bash
   cd backend
   zip -r backend.zip .
   az webapp deployment source config-zip \
     --resource-group SEU_RESOURCE_GROUP \
     --name viagem-aparecida-api \
     --src backend.zip
   ```

### Frontend (Azure Static Web Apps)

1. **Build do frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Criar Static Web App:**
   ```bash
   az staticwebapp create \
     --name viagem-aparecida-app \
     --resource-group SEU_RESOURCE_GROUP \
     --location "East US 2"
   ```

3. **Deploy:**
   - Use o GitHub Actions (configurado automaticamente)
   - Ou faça deploy manual da pasta `dist/`

4. **Atualizar .env de produção:**
   - No frontend, configure `VITE_API_URL` para apontar para a URL do backend na Azure
   - Exemplo: `VITE_API_URL=https://viagem-aparecida-api.azurewebsites.net/api`

### Configurações Importantes

1. **CORS no Backend:**
   - O backend já está configurado para aceitar requisições de qualquer origem
   - Em produção, você pode restringir para apenas o domínio do frontend

2. **Firewall do Azure SQL:**
   - Adicione o IP do App Service nas regras de firewall do SQL Database
   - Ou habilite "Allow Azure services"

3. **SSL/HTTPS:**
   - Ambos os serviços Azure já vêm com SSL gratuito habilitado

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login no sistema

### Atividades
- `GET /api/activities` - Listar todas
- `GET /api/activities/:id` - Detalhes (com fotos e comentários)
- `POST /api/activities` - Criar nova
- `PUT /api/activities/:id` - Atualizar
- `PATCH /api/activities/:id/toggle-complete` - Marcar/desmarcar como realizada
- `DELETE /api/activities/:id` - Excluir

### Fotos
- `POST /api/photos` - Adicionar foto
- `GET /api/photos/gallery` - Galeria completa
- `DELETE /api/photos/:id` - Excluir foto

### Comentários
- `POST /api/comments` - Adicionar comentário
- `DELETE /api/comments/:id` - Excluir comentário

## Estrutura do Banco de Dados

### Tabela: auth
- `id` - INT (PK, IDENTITY)
- `username` - NVARCHAR(50)
- `password_hash` - NVARCHAR(255)
- `created_at` - DATETIME

### Tabela: user_sessions
- `id` - INT (PK, IDENTITY)
- `nickname` - NVARCHAR(100)
- `last_active` - DATETIME
- `created_at` - DATETIME

### Tabela: activities
- `id` - INT (PK, IDENTITY)
- `title` - NVARCHAR(255)
- `location` - NVARCHAR(255)
- `activity_date` - DATE
- `activity_time` - TIME
- `completed` - BIT
- `completed_by` - NVARCHAR(100)
- `completed_at` - DATETIME
- `created_by` - NVARCHAR(100)
- `created_at` - DATETIME
- `updated_at` - DATETIME

### Tabela: photos
- `id` - INT (PK, IDENTITY)
- `activity_id` - INT (FK)
- `photo_data` - NVARCHAR(MAX) - Base64
- `caption` - NVARCHAR(500)
- `uploaded_by` - NVARCHAR(100)
- `created_at` - DATETIME

### Tabela: comments
- `id` - INT (PK, IDENTITY)
- `activity_id` - INT (FK)
- `comment_text` - NVARCHAR(1000)
- `author` - NVARCHAR(100)
- `created_at` - DATETIME

## Segurança

- Senhas são hashadas com bcrypt (10 rounds)
- Autenticação via JWT (válido por 7 dias)
- Tokens armazenados no localStorage
- Conexão criptografada com Azure SQL (SSL/TLS)
- Validação de inputs no backend

## Limitações Conhecidas

- Fotos são armazenadas em Base64 no banco (limite ~5MB por foto)
- Para produção com muitas fotos, considere usar Azure Blob Storage
- Login compartilhado (todos usam mesma senha)
- Sem recuperação de senha (definida no código)

## Melhorias Futuras

- Upload para Azure Blob Storage
- PWA (Progressive Web App) com modo offline
- Notificações push
- Exportar itinerário em PDF
- Chat em tempo real
- Mapa com localização das atividades

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs do backend
2. Verifique o console do navegador
3. Confirme que o banco de dados está acessível

## Licença

Projeto privado para uso pessoal.

---

Desenvolvido com ❤️ para a viagem em Aparecida!
