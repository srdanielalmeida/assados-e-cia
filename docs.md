# 🍖 PROMPT MASTER — ASSADOS & CIA WEBSITE

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: Pronto para implementação  

---

## 📋 INSTRUÇÕES DE USO

1. **Copie TODO este arquivo**
2. **Cole em uma conversa com Claude (claude.ai ou IDE)**
3. **Peça**: "Crie a estrutura inicial do projeto conforme este prompt"
4. **Claude vai gerar**: Arquivos iniciais, componentes e setup

---

## 🎯 CONTEXTO DO PROJETO

**Nome**: Assados & Cia Website  
**Objetivo**: Sistema completo de pedidos online com integração de delivery  
**Localização**: São Paulo, Jardim Ângela  
**Volume**: 70-150+ pedidos/dia  
**Modelo**: Site próprio (não depende de iFood/Uber)  
**Launch**: ~4-6 semanas

---

## 🎨 IDENTIDADE VISUAL

### Paleta de Cores
```
🟢 Verde Primário: #6B8E5A (da marca)
🟢 Verde Claro: #8FA876
🟢 Verde Escuro: #556B48
⚪ Branco: #FFFFFF
🔴 Vermelho Acentue: #E63946
⚫ Texto Escuro: #2D2D2D
🩶 Background Claro: #F8F8F8
```

### Tipografia
- **Família**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Peso primário**: 400 (regular), 600 (semibold), 700 (bold)
- **Hierarquia**: H1 (32px) → H2 (24px) → Body (16px) → Caption (12px)

### Tom de Voz
- Casual, acolhedor, autêntico
- Foco em qualidade e sabor
- Urgência (mas não agressivo) nos CTAs

---

## 📦 STACK TÉCNICO

### Frontend
```
✅ React 18.x
✅ Vite (bundler rápido)
✅ Tailwind CSS (styling)
✅ Axios (HTTP client)
✅ React Router (navegação)
✅ Zustand (state management - leve)
✅ date-fns (formatação de datas)
```

### Backend
```
✅ Node.js 18+
✅ Express 4.x
✅ PostgreSQL 14+
✅ Prisma ORM (type-safe)
✅ Socket.io (real-time)
✅ Mercado Pago SDK
✅ Axios (HTTP requests)
✅ dotenv (config)
✅ cors, helmet, morgan (middleware)
```

### Infraestrutura
```
✅ Git + GitHub
✅ Vercel (Frontend)
✅ Railway/Render (Backend)
✅ Supabase (PostgreSQL)
✅ Environment: Development, Staging, Production
```

---

## 📁 ESTRUTURA DE PASTAS

```
assados-cia-website/
│
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── NavBar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── menu/
│   │   │   │   ├── CategoryTabs.jsx
│   │   │   │   ├── CardPrato.jsx
│   │   │   │   └── MenuGrid.jsx
│   │   │   ├── cart/
│   │   │   │   ├── CartSummary.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   ├── CartDrawer.jsx
│   │   │   │   └── CartEmpty.jsx
│   │   │   ├── checkout/
│   │   │   │   ├── AddressForm.jsx
│   │   │   │   ├── AddressSearch.jsx
│   │   │   │   ├── FreightCalculator.jsx
│   │   │   │   └── PaymentMethods.jsx
│   │   │   └── order/
│   │   │       ├── OrderConfirmation.jsx
│   │   │       └── OrderStatus.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderConfirmed.jsx
│   │   │   ├── OrderTrack.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── hooks/
│   │   │   ├── useCart.js
│   │   │   ├── useOrder.js
│   │   │   ├── useGeolocation.js
│   │   │   └── useFetch.js
│   │   ├── services/
│   │   │   ├── api.js (axios instance)
│   │   │   ├── menuService.js
│   │   │   ├── orderService.js
│   │   │   ├── paymentService.js
│   │   │   └── deliveryService.js
│   │   ├── store/
│   │   │   ├── cartStore.js (Zustand)
│   │   │   └── uiStore.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   ├── constants.js
│   │   │   └── localStorage.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── tailwind.css
│   │   │   └── variables.css (CSS vars das cores)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   ├── images/
│   │   │   └── pratos/ (fotos dos pratos)
│   │   ├── icons/
│   │   └── logo.svg
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── menu.routes.js
│   │   │   ├── orders.routes.js
│   │   │   ├── payments.routes.js
│   │   │   ├── delivery.routes.js
│   │   │   └── health.routes.js
│   │   ├── controllers/
│   │   │   ├── menuController.js
│   │   │   ├── orderController.js
│   │   │   ├── paymentController.js
│   │   │   └── deliveryController.js
│   │   ├── models/
│   │   │   └── schema.prisma (Prisma models)
│   │   ├── services/
│   │   │   ├── orderService.js
│   │   │   ├── mercadopagoService.js
│   │   │   ├── food99Service.js
│   │   │   ├── emailService.js
│   │   │   └── geocodingService.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   └── rateLimit.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── env.js
│   │   │   └── constants.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   ├── websocket/
│   │   │   └── socket.js (Socket.io setup)
│   │   └── server.js
│   ├── migrations/
│   │   └── (Prisma migrations)
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── README.md
│
├── admin-dashboard/             # Painel do gerente
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderBoard.jsx
│   │   │   ├── OrderCard.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── Stats.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── useAuth.js
│   │   │   └── useOrders.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── socketService.js
│   │   ├── store/
│   │   │   └── adminStore.js
│   │   ├── styles/
│   │   │   └── dashboard.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
│
├── config/                      # Configurações compartilhadas
│   ├── menu.json                # Cardápio (estrutura master)
│   ├── theme.json               # Cores, tipografia
│   ├── env.example              # Variáveis globais
│   └── constants.js
│
├── docs/                        # Documentação
│   ├── ARCHITECTURE.md          # Visão geral arquitetura
│   ├── API_DOCS.md              # Endpoints detalhados
│   ├── DATABASE_SCHEMA.md       # Schema do banco
│   ├── SETUP.md                 # Instruções setup
│   ├── DEPLOYMENT.md            # Deploy para produção
│   ├── INTEGRATION_99FOOD.md    # 99Food API guide
│   ├── INTEGRATION_MERCADOPAGO.md # Mercado Pago guide
│   └── TROUBLESHOOTING.md       # Common issues
│
├── public/
│   └── images/
│       └── pratos/              # Fotos dos pratos
│
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions (CI/CD)
│
├── README.md                    # Projeto overview
└── CHANGELOG.md                 # Histórico de versões
```

---

## 🗄️ BANCO DE DADOS (Schema Prisma)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model MenuItem {
  id            String   @id @default(cuid())
  nome          String
  categoria     String   // "carnes" | "acompanhamentos" | "bebidas"
  descricao     String?
  preco         Float
  imagemUrl     String
  disponivel    Boolean  @default(true)
  tempoPreparoMin Int    @default(15)
  porcoes       Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  orderItems    OrderItem[]

  @@index([categoria])
}

model Order {
  id            String   @id @default(cuid())
  numeroUnico   String   @unique
  
  // Cliente
  clienteNome   String
  clienteTel    String
  clienteEmail  String

  // Endereço
  endereco      String
  numero        String
  complemento   String?
  bairro        String
  cidade        String   @default("São Paulo")
  cep           String
  latitudine    Float?
  longitude     Float?

  // Itens
  items         OrderItem[]
  subtotal      Float
  frete         Float
  total         Float

  // Pagamento
  formaPagamento String // "pix" | "card"
  statusPagamento String @default("pendente") // "pendente" | "aprovado" | "recusado"
  pixQrCode     String?
  pixCopiaECola String?
  
  // Delivery
  statusEntrega String @default("novo") // "novo" | "pronto" | "despachado" | "entregue"
  food99OrderId String?
  
  // Timestamps
  criadoEm      DateTime @default(now())
  atualizadoEm  DateTime @updatedAt
  estimativaEntrega DateTime?

  @@index([clienteEmail])
  @@index([statusEntrega])
  @@index([criadoEm])
}

model OrderItem {
  id            String   @id @default(cuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  menuItemId    String
  menuItem      MenuItem @relation(fields: [menuItemId], references: [id])
  
  quantidade    Int
  precoUnitario Float
  subtotal      Float

  @@unique([orderId, menuItemId])
}

model Payment {
  id            String   @id @default(cuid())
  orderId       String   @unique
  
  tipo          String   // "pix" | "card"
  status        String   @default("pendente") // "pendente" | "aprovado" | "recusado"
  
  // Mercado Pago
  mpPaymentId   String?
  mpPreferenceId String?
  
  // PIX
  pixQrCode     String?
  pixCopiaECola String?
  pixExpiracao  DateTime?
  
  erro          String?
  
  criadoEm      DateTime @default(now())
  atualizadoEm  DateTime @updatedAt
}

model DeliveryTracking {
  id            String   @id @default(cuid())
  orderId       String   @unique
  
  food99OrderId String
  status        String   @default("pendente")
  
  entregadorNome String?
  entregadorTel  String?
  entregadorLat  Float?
  entregadorLng  Float?
  
  criadoEm      DateTime @default(now())
  atualizadoEm  DateTime @updatedAt
}
```

---

## 🔌 INTEGRAÇÕES EXTERNAS

### 1️⃣ Mercado Pago (PIX + Cartão)

**Endpoint Backend**:
```
POST /api/payments/create
POST /api/payments/webhook (webhook Mercado Pago)
```

**Flow**:
1. Frontend envia dados do pedido
2. Backend cria preferência no Mercado Pago
3. Retorna QR code (PIX) ou redirect (Cartão)
4. Cliente paga
5. Webhook confirma e atualiza status no BD
6. Painel gerente recebe notificação

### 2️⃣ 99Food (Delivery + Frete)

**Endpoint Backend**:
```
GET /api/delivery/estimate-freight
POST /api/delivery/create-order
GET /api/delivery/tracking/:id
```

**Flow**:
1. Cliente insere endereço no checkout
2. Frontend chama `/delivery/estimate-freight` com lat/lng
3. Backend retorna valor + tempo estimado
4. Após pagamento confirmado, cria ordem no 99Food
5. Retorna tracking ID
6. Cliente pode acompanhar entrega

### 3️⃣ Google Places API (Autocomplete de Endereço)

**Frontend**:
- Input com autocomplete
- Extrai lat/lng automaticamente
- Valida CEP

---

## 📊 FLUXO DE PEDIDO COMPLETO

```
┌─────────────────────┐
│   Cliente entra     │
│   no site           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Home +             │
│  Cardápio           │
│  (Grid de pratos)   │
└──────────┬──────────┘
           │ Adiciona itens ao carrinho
           ▼
┌─────────────────────┐
│  Clica em           │
│  "Finalizar"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Checkout                            │
│  1. Insere endereço (autocomplete)   │
│  2. Calcula frete (99Food API)       │
│  3. Escolhe pagamento (PIX/Cartão)   │
│  4. Confirma                         │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Backend cria pedido no BD       │
│  + Integra com Mercado Pago      │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Cliente paga       │
│  (PIX ou Cartão)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Webhook Mercado Pago confirma      │
│  Backend atualiza status_pagamento   │
│  → Notificação para painel gerente   │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  PAINEL GERENTE                      │
│  Novo pedido aparece                 │
│  Gerente confirma recebimento        │
│  → Status: NOVO → PRONTO             │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Gerente marca "Pronto"              │
│  Backend cria ordem no 99Food        │
│  → Status: PRONTO → DESPACHADO       │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  99Food busca pedido                 │
│  Motoboy pega e sai                  │
│  Cliente vê rastreamento em tempo    │
│  real (opcional)                     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Entrega realizada                   │
│  99Food notifica                      │
│  Status: ENTREGUE                    │
└──────────────────────────────────────┘
```

---

## 🎯 FUNCIONALIDADES POR FASE

### FASE 1 (MVP - 2 semanas)
- ✅ Home + Cardápio
- ✅ Carrinho simples
- ✅ Checkout básico (endereço + forma de pagamento)
- ✅ Integração Mercado Pago (PIX)
- ✅ Painel gerente simples (Novo → Pronto → Despachado)
- ✅ Deploy em dev

### FASE 2 (Release 1.1 - 1 semana)
- ✅ Integração 99Food
- ✅ Cálculo de frete automático
- ✅ Notificações por email (confirmação pedido)
- ✅ Painel gerente: Drag-drop de status
- ✅ Histórico de pedidos (cliente)

### FASE 3 (Release 1.2 - 1 semana)
- ✅ Integração Cartão (Mercado Pago)
- ✅ WebSocket para real-time (painel)
- ✅ Notificações sonoras (novo pedido)
- ✅ Relatório de vendas simples
- ✅ Mobile app considerations

### FASE 4 (Futuro)
- Bot WhatsApp
- Sistema de promoções/cupons
- Login de cliente + histórico
- Análise de dados avançada
- App nativo iOS/Android

---

## 🚀 VARIÁVEIS DE AMBIENTE

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_PLACES_KEY=YOUR_KEY_HERE
VITE_ENVIRONMENT=development
```

### Backend (.env)
```
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/assados_dev

# Mercado Pago
MERCADO_PAGO_PUBLIC_KEY=TEST_PUBLIC_KEY
MERCADO_PAGO_ACCESS_TOKEN=TEST_ACCESS_TOKEN

# 99Food
FOOD99_API_KEY=TEST_KEY_99FOOD
FOOD99_PARTNER_ID=YOUR_PARTNER_ID

# Google
GOOGLE_PLACES_API_KEY=YOUR_KEY_HERE
GOOGLE_GEOCODING_KEY=YOUR_KEY_HERE

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASSWORD=sua_senha
EMAIL_FROM=pedidos@assadosecia.com.br

# Security
JWT_SECRET=seu_secret_aleatorio_muito_longo_aqui
ADMIN_PASSWORD_HASH=hash_da_senha

# CORS
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3002
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002

# Logging
LOG_LEVEL=debug
```

### Admin Dashboard (.env)
```
VITE_API_URL=http://localhost:3001
VITE_ADMIN_PASSWORD_PLACEHOLDER=admin
VITE_ENVIRONMENT=development
```

---

## 📱 RESPONSIVIDADE

**Mobile First** (375px+):
- NavBar com logo + carrinho + menu hamburger
- Cardápio em grid 1-2 colunas
- Carrinho como drawer lateral
- Botões grandes e clicáveis

**Tablet** (768px+):
- Grid 2-3 colunas
- NavBar expandido
- Sidebar do carrinho

**Desktop** (1024px+):
- Grid 3-4 colunas
- NavBar full
- Carrinho como sidebar permanente (opcional)

---

## 🔐 SEGURANÇA

- ✅ HTTPS obrigatório em produção
- ✅ CORS configurado
- ✅ Rate limiting em endpoints críticos
- ✅ Validação de entrada (ZOD ou JOI)
- ✅ JWT para painel gerente
- ✅ Helmet.js para headers HTTP
- ✅ Senhas hasheadas (bcryptjs)
- ✅ Variáveis sensíveis em .env
- ✅ Sanitização de input (XSS prevention)

---

## 📈 PERFORMANCE

- ✅ Images: Lazy loading + WebP
- ✅ Code splitting: Route-based
- ✅ Caching: Cache-Control headers
- ✅ CDN: Imagens no Cloudinary ou S3
- ✅ Database: Índices em queries frequentes
- ✅ API: Paginação + filtros
- ✅ Frontend: Debounce em inputs de autocomplete
- ✅ Monitoring: Sentry para erros

---

## 🧪 TESTES

### Frontend
- ✅ Unit: Vitest + React Testing Library
- ✅ E2E: Cypress (fluxo completo de pedido)

### Backend
- ✅ Unit: Jest
- ✅ Integration: Supertest
- ✅ Database: Test database isolado

---

## 📝 DOCUMENTAÇÃO REQUERIDA

Após setup inicial, criar:

1. **ARCHITECTURE.md** - Visão geral técnica
2. **API_DOCS.md** - Swagger/OpenAPI
3. **DATABASE_SCHEMA.md** - Schema Prisma comentado
4. **SETUP.md** - Como rodar localmente
5. **DEPLOYMENT.md** - Deploy produção
6. **INTEGRATION_GUIDES/** - Guias de integração
7. **TROUBLESHOOTING.md** - Common issues

---

## ✅ CHECKLIST PRÉ-DESENVOLVIMENTO

- [ ] Repositório Git criado
- [ ] Estrutura de pastas criada localmente
- [ ] config/menu.json preenchido com pratos reais
- [ ] config/theme.json com cores exatas
- [ ] Fotos dos pratos organizadas em public/images/pratos
- [ ] Domínio registrado (opcional para MVP)
- [ ] Contas criadas: Mercado Pago, 99Food, Google Cloud
- [ ] .env templates criados em cada pasta
- [ ] README.md projeto overview preenchido
- [ ] GitHub Actions workflow .github/workflows/deploy.yml (opcional)

---

## 🚀 PRÓXIMOS PASSOS

1. **Crie a estrutura local** (copie o checklist anterior)
2. **Instale dependências**:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   cd ../admin-dashboard && npm install
   ```
3. **Configure .env** em cada pasta
4. **Rode localmente**:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   
   # Terminal 3: Admin (opcional)
   cd admin-dashboard && npm run dev
   ```
5. **Teste fluxo**: http://localhost:3000

---

## 🤝 SUPORTE

Quando erros ocorrerem:
1. Consulte `/docs/TROUBLESHOOTING.md`
2. Verifique `.env` está correto
3. Limpe `node_modules` + `.next` se necessário
4. Cheque logs do backend em `/logs`

---

## 📞 CONTATO + PRÓXIMAS ETAPAS

**Responsável projeto**: Daniel Almeida (Nexora Tecnologia)  
**Stack Tech**: Node.js + React + PostgreSQL  
**Timeline**: MVP em 2 semanas, v1.0 em 4-6 semanas  

---

**FIM DO PROMPT MASTER**

Está pronto para usar! Bora começar? 🚀