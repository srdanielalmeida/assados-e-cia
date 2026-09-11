FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install && cd server && npm install

# Copia todos os arquivos do projeto
COPY . .

# Expõe as portas usadas pelo Coolify/Traefik
EXPOSE 3000
EXPOSE 3001
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Inicia o servidor unificado (frontend + API iFood)
CMD ["node", "server/index.js"]
