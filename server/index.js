/**
 * index.js — Entry point do servidor backend Assados & Cia
 *
 * Inicia o Express, registra as rotas e o worker de pedidos.
 * Porta: definida em .env via PORT (padrão: 3001)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';

import { hasValidToken } from './modules/tokenStore.js';
import { startOrderWorker } from './modules/orderWorker.js';

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
    // Adicione aqui o domínio de produção quando fizer deploy
  ],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Admin-Pin'],
}));

// Parse JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests HTTP
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rotas ──────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/catalog', catalogRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Assados & Cia — Backend iFood',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    ifood: {
      authenticated: hasValidToken(),
      merchantId: process.env.IFOOD_MERCHANT_ID ?? 'não configurado',
    },
  });
});

// ── Rota 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: `Rota não encontrada: ${req.method} ${req.path}`,
    availableRoutes: [
      'GET  /health',
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

// ── Inicialização ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🔥 ─────────────────────────────────────');
  console.log('   Assados & Cia — Backend iFood');
  console.log(`   Ambiente : ${NODE_ENV}`);
  console.log(`   Porta    : http://localhost:${PORT}`);
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

export default app;
