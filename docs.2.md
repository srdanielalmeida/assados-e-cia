# ✅ CHECKLIST PRÉ-SETUP — Assados & Cia Website

## ANTES DE COLAR O PROMPT NA IDE

### 1️⃣ PREPARAR O REPOSITÓRIO
```bash
# Criar pasta do projeto
mkdir assados-cia-website
cd assados-cia-website

# Inicializar Git (recomendado)
git init
git config user.name "Daniel Almeida"
git config user.email "seu@email.com"

# Criar estrutura base de pastas
mkdir -p frontend backend admin-dashboard config public/images docs
touch README.md .gitignore
```

### 2️⃣ CRIAR .gitignore
Salve este arquivo na raiz (`assados-cia-website/.gitignore`):
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Build outputs
dist/
build/
.next/
.nuxt/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Misc
.cache/
*.tgz
```

### 3️⃣ DEFINIR CORES DA MARCA

Extraia o hex exato do verde do banner. Adicione em `config/theme.json`:

```json
{
  "colors": {
    "primary": "#6B8E5A",
    "primaryLight": "#8FA876",
    "primaryDark": "#556B48",
    "secondary": "#FFFFFF",
    "accent": "#E63946",
    "text": "#2D2D2D",
    "background": "#F8F8F8",
    "border": "#E0E0E0"
  },
  "typography": {
    "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "sizes": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "32px"
    }
  }
}
```

### 4️⃣ PREPARAR ESTRUTURA DO CARDÁPIO

Crie `config/menu.json`:

```json
{
  "restaurante": {
    "nome": "Assados & Cia",
    "telefone": "11 5837-0965",
    "whatsapp": "11 94453-8326",
    "endereco": "Jardim Ângela, São Paulo, SP",
    "horarioFuncionamento": {
      "segunda": "11:00-22:00",
      "terca": "11:00-22:00",
      "quarta": "11:00-22:00",
      "quinta": "11:00-22:00",
      "sexta": "11:00-23:00",
      "sabado": "11:00-23:00",
      "domingo": "11:00-22:00"
    }
  },
  "categorias": [
    {
      "id": "carnes",
      "nome": "Carnes",
      "descricao": "Assados selecionados e grelhados",
      "icone": "🔥"
    },
    {
      "id": "acompanhamentos",
      "nome": "Acompanhamentos",
      "descricao": "Batata frita, mandioca e mais",
      "icone": "🥔"
    },
    {
      "id": "bebidas",
      "nome": "Bebidas",
      "descricao": "Refrigerantes e sucos",
      "icone": "🥤"
    }
  ],
  "itens": [
    {
      "id": "carne_001",
      "nome": "Moqueca de Picanha",
      "categoria": "carnes",
      "descricao": "Picanha suculenta com batata frita",
      "preco": 65.90,
      "imagem": "/images/pratos/picanha.jpg",
      "disponivel": true,
      "preparo_minutos": 15,
      "porcoes": 1
    },
    {
      "id": "acomp_001",
      "nome": "Batata Frita",
      "categoria": "acompanhamentos",
      "descricao": "Porção de batata frita crocante",
      "preco": 12.90,
      "imagem": "/images/pratos/batata.jpg",
      "disponivel": true,
      "preparo_minutos": 5,
      "porcoes": 1
    },
    {
      "id": "bebida_001",
      "nome": "Refrigerante 2L",
      "categoria": "bebidas",
      "descricao": "Refrigerante Coca-Cola 2L",
      "preco": 8.90,
      "imagem": "/images/pratos/refrigerante.jpg",
      "disponivel": true,
      "preparo_minutos": 0,
      "porcoes": 1
    }
  ]
}
```

**Preencha com seus pratos, fotos e preços reais.**

### 5️⃣ ORGANIZAR FOTOS DOS PRATOS

```bash
# Crie a pasta
mkdir -p public/images/pratos

# Coloque as fotos aqui:
# public/images/pratos/picanha.jpg
# public/images/pratos/carne-assada.jpg
# etc...

# Nomeie com padrão: prato-simples.jpg (sem espaços, sem acentos)
```

### 6️⃣ CRIAR README.md INICIAL

```markdown
# Assados & Cia — Website de Pedidos

**Status**: 🚧 Em desenvolvimento

## Sobre
Site próprio para pedidos online do restaurante Assados & Cia (São Paulo, Jardim Ângela).
- ✅ Cardápio online
- ✅ Carrinho de compras
- ✅ Integração 99Food para frete
- ✅ Pagamento PIX + Cartão
- ✅ Painel do gerente em tempo real

## Stack
- **Frontend**: React 18 + Tailwind CSS + Mobile First
- **Backend**: Node.js + Express + PostgreSQL
- **Real-time**: Socket.io
- **Pagamentos**: Mercado Pago API
- **Delivery**: 99Food API

## Estrutura
```
assados-cia-website/
├── frontend/        # Interface React
├── backend/         # API Node.js
├── admin-dashboard/ # Painel gerente
├── config/          # Configurações (menu, tema)
└── docs/            # Documentação
```

## Setup
(Será preenchido após setup inicial)

## Variáveis de Ambiente
Veja `.env.example` em cada pasta.

---
**Criado por**: Daniel Almeida (Nexora Tecnologia)
```

### 7️⃣ PREPARAR .env TEMPLATES

**backend/.env.example**:
```
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/assados

# Mercado Pago
MERCADO_PAGO_PUBLIC_KEY=...
MERCADO_PAGO_ACCESS_TOKEN=...

# 99Food
FOOD99_API_KEY=...

# Google Places
GOOGLE_PLACES_API_KEY=...

# CORS
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3002

# Session
JWT_SECRET=seu_secret_aqui_aleatorio
```

**frontend/.env.example**:
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_PLACES_KEY=...
```

**admin-dashboard/.env.example**:
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ADMIN_PASSWORD_HASH=...
```

### 8️⃣ DEFINIR DOMÍNIO

Você vai comprar o domínio **assadosecia.com.br** ou já tem um?

Anotações:
- [ ] Domínio: ___________________
- [ ] Provider: ___________________ (Godaddy, Namecheap, etc)
- [ ] Registrar em Roadmap

### 9️⃣ DEFINIR HOSPEDAGEM

**Recomendação**:
- **Frontend**: Vercel (grátis, deploy automático do Git)
- **Backend**: Railway ou Render (tier gratuito até 100k requisições/mês)
- **Banco de dados**: Supabase (PostgreSQL gerenciado, grátis)

### 🔟 STRUCTURE NO GITHUB (Recomendado)

```bash
# Criar repositório remoto
# https://github.com/seu-usuario/assados-cia-website

# Adicionar remote
git remote add origin https://github.com/seu-usuario/assados-cia-website.git

# Fazer primeiro commit
git add .
git commit -m "Initial commit: project structure & config"
git push -u origin main
```

---

## ✨ DEPOIS DE SEGUIR ISSO:

**Você terá:**
✅ Repositório local pronto  
✅ Estrutura de pastas definida  
✅ Tema de cores definido  
✅ Cardápio estruturado (JSON)  
✅ Fotos organizadas  
✅ Git pronto (opcional, mas recomendado)  

**Aí sim você cola:**
1. O **PROMPT MASTER** (aquele gigante) na IDE/Claude
2. Ele vai criar os arquivos iniciais
3. Você roda `npm install` em cada pasta
4. Testa em `localhost`

---

## 🎯 ORDEM DE EXECUÇÃO

1. ✅ Este checklist
2. 📝 Preparar fotos dos pratos (renomear + otimizar)
3. 📊 Preencher `config/menu.json` com seus pratos/preços
4. 🎨 Definir cores exatas em `config/theme.json`
5. 🚀 Colar o PROMPT MASTER
6. 💾 Começar a construir

---

**Tempo estimado**: 30-45 minutos