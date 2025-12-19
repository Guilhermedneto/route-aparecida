# Use Node.js oficial
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Expor a porta
EXPOSE 5000

# Comando para iniciar
CMD ["npm", "start"]