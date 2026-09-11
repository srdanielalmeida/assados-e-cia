/**
 * index.js — Entry point do servidor backend Assados & Cia
 *
 * Inicia o Express, registra as rotas e o worker de pedidos.
 * Porta: definida em .env via PORT (padrão: 3001)
 */

import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';

import { hasValidToken } from './modules/tokenStore.js';
import { startOrderWorker } from './modules/orderWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// ── Configuração ───────────────────────────────────────────────
const PORT = process.env.PORT ?? 3001;
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const app = express();

// ── Middlewares Globais ────────────────────────────────────────
// CORS: permite que o frontend (porta 8000) consuma a API (porta 3001)
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:3000',
    'https://assadosecia.com',
    'https://www.assadosecia.com',
    'http://assadosecia.com',
    'http://www.assadosecia.com',
  ],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Admin-Pin'],
}));

// Parse JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests HTTP
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rotas da API ───────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/catalog', catalogRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Assados & Cia — Backend & Frontend',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    ifood: {
      authenticated: hasValidToken(),
      merchantId: process.env.IFOOD_MERCHANT_ID ?? 'não configurado',
    },
  });
});

// ── Servir Frontend Estático (Rotas explícitas para garantir entrega de CSS, JS, Imagens) ──
app.use('/css', express.static(join(ROOT_DIR, 'css'), { maxAge: '1d' }));
app.use('/js', express.static(join(ROOT_DIR, 'js'), { maxAge: '1d' }));
app.use('/images', express.static(join(ROOT_DIR, 'images'), { maxAge: '7d' }));
app.use('/config', express.static(join(ROOT_DIR, 'config')));
app.use(express.static(ROOT_DIR));

// Rotas diretas para páginas principais
app.get('/', (req, res) => {
  res.sendFile(join(ROOT_DIR, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(join(ROOT_DIR, 'admin.html'));
});

// ── Rota 404 (para requisições não encontradas) ──────────────────
app.use((req, res) => {
  // Se for uma requisição de página web (navegador), serve a index.html
  if (req.accepts('html') && !req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
    return res.sendFile(join(ROOT_DIR, 'index.html'));
  }

  res.status(404).json({
    error: `Rota não encontrada: ${req.method} ${req.path}`,
    availableRoutes: [
      'GET  /health',
      'GET  /',
      'GET  /admin',
      'GET  /auth/ifood',
      'POST /auth/ifood/callback',
      'GET  /auth/status',
      'POST /auth/logout',
      'GET  /api/orders',
      'GET  /api/orders/summary',
      'GET  /api/orders/:orderId',
      'PATCH /api/catalog/:productId/status',
      'GET  /api/catalog/products',
    ],
  });
});

// ── Error Handler Global ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[server] Erro não tratado:', err.message);
  res.status(500).json({
    error: 'Erro interno do servidor.',
    details: NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ── Inicialização (0.0.0.0 obrigatório para Docker / Coolify) ────
const primaryServer = http.createServer(app);
primaryServer.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🔥 ─────────────────────────────────────');
  console.log('   Assados & Cia — Servidor Unificado');
  console.log(`   Ambiente : ${NODE_ENV}`);
  console.log(`   Host     : 0.0.0.0:${PORT}`);
  console.log(`   Site     : http://localhost:${PORT}`);
  console.log(`   Admin    : http://localhost:${PORT}/admin`);
  console.log(`   Health   : http://localhost:${PORT}/health`);
  console.log('─────────────────────────────────────────');

  // Inicia o worker automaticamente se já houver token salvo
  if (hasValidToken()) {
    console.log('✅ Token iFood encontrado — iniciando worker de pedidos...');
    startOrderWorker();
  } else {
    console.log('⚠️  Nenhum token iFood encontrado.');
    console.log('   Acesse GET /auth/ifood para iniciar a autenticação.');
  }

  console.log('');
});

// Suporte automático para porta 3000 caso Coolify aponte para 3000 por padrão
if (String(PORT) !== '3000') {
  const secondaryServer = http.createServer(app);
  secondaryServer.on('error', () => {});
  secondaryServer.listen(3000, '0.0.0.0', () => {
    console.log('⚡ Porta 3000 também ativa para compatibilidade com Coolify/Docker');
  });
}

export default app;
