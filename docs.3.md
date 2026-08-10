# ✅ CHECKLIST PRÉ-DESENVOLVIMENTO — Assados & Cia

## 🎨 DESIGN & IDENTIDADE VISUAL

- [ ] **Extrair cores do banner**
  - Abrir a imagem em Figma/Photoshop
  - Coletar hex das cores: verde principal, branco, vermelho
  - Documentar em `config/theme.json`

- [ ] **Organizar fotos dos pratos**
  - Criar pasta `/frontend/public/images/pratos/`
  - Renomear arquivos: `carne_001.jpg`, `acompanhamento_001.jpg`, etc
  - Otimizar tamanho (max 500KB por foto)
  - Criar versões thumbnail (200x200px)

- [ ] **Definir cardápio final**
  - Listar todos os pratos com nomes, descrições, preços
  - Criar `config/menu.json` com estrutura:
    ```json
    {
      "categorias": [
        {
          "nome": "Carnes",
          "itens": [
            {
              "id": "carne_001",
              "nome": "Picanha",
              "descricao": "...",
              "preco": 65.90,
              "imagem": "/images/pratos/carne_001.jpg"
            }
          ]
        }
      ]
    }
    ```

---

## 💳 CONTAS & CHAVES DE API

### Mercado Pago (Pagamentos PIX + Cartão)
- [ ] Criar conta em https://www.mercadopago.com.br
- [ ] Ativar modo Sandbox (teste) primeiro
- [ ] Gerar credenciais:
  - [ ] Access Token
  - [ ] Client ID
  - [ ] Client Secret
  - [ ] Public Key
- [ ] Salvar em `.env` do backend (não commitar!)
- [ ] Testar webhook em sandbox

### 99Food (Frete)
- [ ] Contactar 99Food para integração de restaurante
  - Whatsapp/Email: confirmar se integram via API
  - Solicitar documentação API
- [ ] Obter API Key e Auth Token
- [ ] Confirmar cobertura em Jardim Ângela, SP
- [ ] Testar sandbox antes de produção
- [ ] Salvar em `.env`

### Google Places API (Autocomplete de Endereço)
- [ ] Criar projeto em Google Cloud Console
- [ ] Ativar "Places API"
- [ ] Gerar chave de API (restrita para domínio)
- [ ] Salvar em `.env` frontend

### Email Service (Confirmação de Pedidos)
**Opções:**
- [ ] SendGrid (melhor custo-benefício)
- [ ] AWS SES (mais barato em escala)
- [ ] Mailgun (bom para startups)
- [ ] Resend (novo, focado em devs)

**Escolhido**: ________________
- [ ] Criar conta
- [ ] Gerar API Key
- [ ] Criar template de email de confirmação
- [ ] Testar envio

---

## 🏗️ INFRAESTRUTURA

### Banco de Dados (PostgreSQL)
- [ ] **Opção 1: Supabase** (recomendado — PostgreSQL gerenciado)
  - [ ] Criar conta em https://supabase.com
  - [ ] Criar novo projeto
  - [ ] Obter `DATABASE_URL`
  - [ ] Criar tabelas (scripts em `backend/sql/migrations/`)

- [ ] **Opção 2: Railway**
  - [ ] Criar conta em https://railway.app
  - [ ] Provisionar PostgreSQL
  - [ ] Obter connection string

### Hospedagem Frontend (React)
- [ ] Criar conta em **Vercel** (recomendado para Next.js/React)
  - [ ] Conectar repositório GitHub
  - [ ] Configurar variáveis de ambiente
  - [ ] Ativar auto-deploy

### Hospedagem Backend (Node.js)
- [ ] **Opção 1: Railway** (integra bem com Vercel)
  - [ ] Criar conta
  - [ ] Provisionar Node.js dyno
  - [ ] Configurar variáveis
  - [ ] Conectar ao repo

- [ ] **Opção 2: Render**
  - [ ] Criar conta em https://render.com
  - [ ] Criar Web Service
  - [ ] Conectar GitHub

### Domínio
- [ ] Registrar domínio restaurante (ex: `assadosecia.com.br`)
  - Onde: Namecheap, Godaddy, Hostinger, etc
  - [ ] Pointing para Vercel (frontend)
  - [ ] Subdomain para backend (ex: `api.assadosecia.com.br`)

---

## 📁 ESTRUTURA DE PASTAS (Criar Localmente)

```bash
# Na sua máquina
mkdir assados-cia-website
cd assados-cia-website

# Clonar ou iniciar
git init
git remote add origin <seu-repo>

# Criar estrutura
mkdir -p frontend backend admin-dashboard config docs
mkdir -p config/migrations
mkdir -p frontend/public/images/pratos

# Arquivos iniciais
touch backend/.env.example
touch frontend/.env.example
touch admin-dashboard/.env.example
touch config/menu.json
touch config/theme.json
```

---

## 🔐 VARIÁVEIS DE AMBIENTE (.env)

### `backend/.env.example`
```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/assados_cia
DATABASE_POOL_SIZE=10

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=your_access_token
MERCADO_PAGO_CLIENT_ID=your_client_id
MERCADO_PAGO_PUBLIC_KEY=your_public_key

# 99Food
FOOD99_API_KEY=your_api_key
FOOD99_AUTH_TOKEN=your_auth_token

# Email
EMAIL_SERVICE=sendgrid  # ou aws_ses, mailgun
SENDGRID_API_KEY=your_key
EMAIL_FROM=pedidos@assadosecia.com.br

# JWT & Auth
JWT_SECRET=generate_long_random_string_here
ADMIN_PASSWORD_HASH=bcrypt_hash_of_password

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Opcional: Monitoring
SENTRY_DSN=
```

### `frontend/.env.example`
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_PLACES_KEY=your_key
REACT_APP_RESTAURANT_NAME=Assados & Cia
REACT_APP_RESTAURANT_PHONE=11-5837-0965
```

### `admin-dashboard/.env.example`
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ADMIN_PATH=/admin
```

---

## 📊 PLANEJAMENTO DE BANCO DE DADOS

**Tabelas necessárias:**

```sql
-- Usuários (Admin)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
  id VARCHAR(50) PRIMARY KEY,
  categoria VARCHAR(50),
  nome VARCHAR(100),
  descricao TEXT,
  preco DECIMAL(10, 2),
  imagem_url VARCHAR(255),
  disponivel BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  cliente_nome VARCHAR(100),
  cliente_email VARCHAR(100),
  cliente_telefone VARCHAR(20),
  endereco_rua VARCHAR(255),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(255),
  endereco_cidade VARCHAR(50),
  endereco_cep VARCHAR(10),
  endereco_lat DECIMAL(10, 8),
  endereco_lng DECIMAL(10, 8),
  subtotal DECIMAL(10, 2),
  frete DECIMAL(10, 2),
  total DECIMAL(10, 2),
  status VARCHAR(20), -- novo, confirmado, preparando, pronto, despachado, entregue
  tipo_pagamento VARCHAR(20), -- pix, card
  status_pagamento VARCHAR(20), -- pendente, confirmado, erro
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Itens do Pedido
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id VARCHAR(50) REFERENCES menu_items(id),
  quantidade INT,
  preco_unitario DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pagamentos
CREATE TABLE payments (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  tipo VARCHAR(20), -- pix, card
  pix_qr_code TEXT,
  card_last_4 VARCHAR(4),
  valor DECIMAL(10, 2),
  status VARCHAR(20), -- pendente, confirmado, erro
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 TESTES INICIAIS

- [ ] **Teste local do banco**
  ```bash
  psql -U user -d assados_cia -c "SELECT COUNT(*) FROM menu_items;"
  ```

- [ ] **Teste Mercado Pago Sandbox**
  - Criar pedido de teste
  - Gerar PIX teste
  - Confirmar webhook

- [ ] **Teste 99Food**
  - Chamar endpoint de estimativa de frete
  - Confirmar retorno de valor + tempo

- [ ] **Teste Google Places**
  - Autocomplete funciona no input

---

## 📝 DOCUMENTAÇÃO

- [ ] Criar `docs/API_DOCS.md` com todos os endpoints
- [ ] Criar `docs/ARCHITECTURE.md` explicando fluxos
- [ ] Criar `docs/DEPLOYMENT.md` com passo a passo
- [ ] Criar `CONTRIBUTING.md` se vai ter mais devs

---

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

1. **Preparar dados** (fotos, preços, cores, contas)
2. **Setup inicial** (pastas, git, dependências)
3. **Backend básico** (DB, rutas CRUD)
4. **Frontend básico** (home, cardápio, carrinho)
5. **Integrações** (Mercado Pago, 99Food)
6. **Painel do gerente** (dashboard, WebSocket)
7. **Polish & testes** (UI, bugs, performance)
8. **Deploy** (staging → produção)

---

## 💡 DICAS IMPORTANTES

- **Não commitar `.env`**: Adicionar ao `.gitignore`
- **Versionar schema BD**: Guardar migrations em `backend/sql/migrations/`
- **Testar sandbox primeiro**: Sempre fazer testes em desenvolvimento
- **Backup manual BD produção**: Setup automático após go-live
- **Monitorar erros**: Considerar Sentry, LogRocket ou equivalente
- **Analytics**: Google Analytics no frontend (opcional)
- **Rate limiting**: Proteger endpoints da API
- **CORS configurado**: Apenas domínio do restaurante

---

## 📞 SUPORTE & CONTATOS

- **Mercado Pago**: suporte@mercadopago.com.br
- **99Food**: developer@99food.com.br
- **Google Cloud**: https://support.google.com/cloud
- **Supabase**: https://supabase.com/docs

---

**Próximo passo**: Após completar este checklist, cole o `PROMPT_MASTER.md` na IDE e comece!