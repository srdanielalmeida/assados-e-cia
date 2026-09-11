FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install && cd server && npm install

# Copia todos os arquivos do projeto
COPY . .

# Expõe a porta usada pelo Coolify
EXPOSE 3001
ENV PORT=3001
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Inicia o servidor unificado (frontend + API iFood)
CMD ["node", "server/index.js"]
