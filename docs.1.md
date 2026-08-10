
## 🎯 **PROMPT MASTER — Assados & Cia Website**

```markdown
# PROJETO: SITE DE PEDIDOS — ASSADOS & CIA

## CONTEXTO
- **Restaurante**: Assados & Cia (Especialidade: Churrascos assados)
- **Local**: São Paulo, Jardim Ângela
- **Modelo**: Site próprio para pedidos online (sem dependência iFood/Uber)
- **Volume**: 70-150+ pedidos/dia
- **Foco operacional**: Presencial (delivery é complemento)
- **Frete**: Integração 99Food API

## IDENTIDADE VISUAL
- **Cores principais**: Verde da marca (extrair hex do banner enviado)
- **Secundária**: Branco/Creme (contraste)
- **Acentos**: Vermelho do coração (CTAs)
- **Tipografia**: Moderna, legível em mobile, respira elegância casual

## REQUISITOS FUNCIONAIS

### 1. FRONTEND — Cliente (Mobile First + Desktop)
**Páginas:**
- Home: Hero com call-to-action "Fazer Pedido"
- Cardápio: Grid de pratos (foto, nome, descrição, preço)
- Carrinho: Resumo, cálculo de frete em tempo real
- Checkout: Endereço, forma de pagamento (PIX/Cartão)
- Confirmação: Número do pedido + tempo estimado

**Componentes:**
- NavBar simples (logo, ícone carrinho, número WhatsApp)
- Card de prato (foto, nome, preço, botão +)
- Carrinho lateral (mobile) ou modal
- Input de endereço com autocomplete (Google Places)
- Calculadora de frete (99Food API)
- Badge de tempo de preparo

**Responsividade:**
- Mobile: 375px+
- Tablet: 768px+
- Desktop: 1024px+

### 2. BACKEND — Servidor de Lógica
**Endpoints principais:**
- `GET /api/menu` → Retorna cardápio (categorizado)
- `POST /api/orders` → Criar novo pedido
- `GET /api/orders/:id` → Status do pedido
- `POST /api/payments/pix` → Gerar QR code PIX
- `POST /api/payments/card` → Processar cartão (Mercado Pago)
- `GET /api/delivery/estimate` → Calcula frete 99Food
- `POST /api/webhook/order` → Recebe confirmação de pagamento

**Autenticação:**
- Gerente: JWT + senha (acesso ao painel)
- Cliente: Sem login (apenas email para confirmação)

### 3. PAINEL DO GERENTE — Dashboard
**Funcionalidades:**
- Listar pedidos em tempo real (Novo, Pronto, Despachado, Entregue)
- Drag-drop entre status (ou botões)
- Notificação sonora ao chegar novo pedido
- Info: cliente, endereço, itens, total, forma de pagamento
- Histórico diário/semanal
- Relatório simples de vendas

**Acesso:**
- URL: `/admin` (protegida por senha)
- Responsivo para tablet/desktop (usado na cozinha/balcão)

### 4. ESTRUTURA DE DADOS

**Cardápio (JSON ou BD):**
```json
{
  "categoria": "Carnes",
  "itens": [
    {
      "id": "carne_001",
      "nome": "Moqueca de Picanha",
      "descricao": "Picanha suculenta com batata frita",
      "preco": 65.90,
      "imagem": "/images/pratos/picanha.jpg",
      "disponivel": true
    }
  ]
}
```

**Pedido (BD):**
```json
{
  "id": "pedido_001",
  "cliente": {
    "nome": "João",
    "telefone": "11987654321",
    "email": "joao@email.com"
  },
  "endereço": "Rua X, 123, Jardim Ângela, São Paulo",
  "itens": [
    {"id": "carne_001", "qtd": 2, "preco_unitario": 65.90}
  ],
  "subtotal": 131.80,
  "frete": 12.00,
  "total": 143.80,
  "pagamento": {
    "tipo": "pix",
    "qr_code": "...",
    "status": "pendente"
  },
  "status": "novo",
  "criado_em": "2024-01-15T14:30:00Z"
}
```

### 5. INTEGRAÇÕES EXTERNAS

**Mercado Pago (PIX + Cartão):**
- Webhook para confirmar pagamento
- Redirecionamento após aprovação
- Falha: retentar ou voltar ao checkout

**99Food API:**
- Autenticação com chave API
- Endpoint: calcular frete (lat/lng origem + destino)
- Retorna: valor + tempo estimado
- Integração no checkout (antes de confirmar pedido)

**Google Places (Autocomplete):**
- Validar endereço
- Extrair lat/lng para cálculo de frete

## ORGANIZAÇÃO DE PASTAS

```
assados-cia-website/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── CardPrato.jsx
│   │   │   ├── Carrinho.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── Confirmacao.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Cardapio.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── OrderStatus.jsx
│   │   ├── styles/
│   │   │   ├── theme.css (variáveis do verde)
│   │   │   └── tailwind.config.js
│   │   ├── utils/
│   │   │   ├── api.js (chamadas ao backend)
│   │   │   ├── validate.js
│   │   │   └── formatters.js
│   │   └── App.jsx
│   ├── public/
│   │   └── images/ (fotos dos pratos)
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── menu.js
│   │   │   ├── orders.js
│   │   │   └── payments.js
│   │   ├── controllers/
│   │   │   ├── menuController.js
│   │   │   ├── orderController.js
│   │   │   └── paymentController.js
│   │   ├── models/
│   │   │   ├── Order.js
│   │   │   └── MenuItem.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   │   ├── mercadopagoService.js
│   │   │   ├── foodService99.js
│   │   │   └── emailService.js
│   │   ├── config/
│   │   │   └── database.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── admin-dashboard/
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderBoard.jsx
│   │   │   ├── OrderCard.jsx
│   │   │   └── Stats.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   └── utils/
│   │       └── socket.js (WebSocket para atualizações em tempo real)
│   └── package.json
│
├── config/
│   ├── menu.json (cardápio)
│   ├── theme.json (cores, fontes)
│   └── env.example
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API_DOCS.md
    ├── PROMPTS.md (subprompts para criação)
    └── DEPLOYMENT.md
```

## VARIÁVEIS DE AMBIENTE

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_PLACES_KEY=...
```

**Backend (.env):**
```
DATABASE_URL=postgresql://...
MERCADO_PAGO_KEY=...
MERCADO_PAGO_TOKEN=...
FOOD99_API_KEY=...
PORT=3001
```

**Admin (.env):**
```
REACT_APP_API_URL=http://localhost:3001
ADMIN_PASSWORD_HASH=...
```

## FLUXO DE PEDIDO

1. **Cliente entra no site** → Home
2. **Navega cardápio** → Adiciona itens ao carrinho
3. **Clica "Finalizar Pedido"** → Checkout
4. **Insere endereço** → Sistema calcula frete 99Food
5. **Escolhe pagamento** (PIX ou Cartão)
6. **Confirma** → Sistema cria pedido no BD
7. **Pagamento confirmado** → Notificação no painel gerente
8. **Gerente marca como "Pronto"** → Cliente vê tempo de entrega
9. **Marca como "Despachado"** → 99Food recebe chamada
10. **Entregador busca** → Status "Em Trânsito"
11. **Entrega** → Status "Entregue"

## STACK RECOMENDADO

- **Frontend**: React 18 + Tailwind CSS + Axios
- **Backend**: Node.js + Express + PostgreSQL
- **Real-time**: Socket.io (atualizações painel)
- **Pagamentos**: SDK Mercado Pago
- **Maps**: Google Maps API
- **Hospedagem**: Vercel (frontend) + Railway/Render (backend)
- **BD**: Supabase (PostgreSQL gerenciado)


