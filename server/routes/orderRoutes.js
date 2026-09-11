/**
 * orderRoutes.js
 * Endpoints de consulta de pedidos para o painel administrativo.
 *
 * GET  /api/orders            — Lista pedidos (com filtros opcionais)
 * GET  /api/orders/summary    — Resumo financeiro do dia
 * GET  /api/orders/:orderId   — Detalhe completo de um pedido
 */

import { Router } from 'express';
import { getOrders, getOrderById, loadOrders } from '../modules/orderStore.js';

const router = Router();

// ── Middleware: valida PIN de admin ────────────────────────────
// Header esperado: X-Admin-Pin: <valor do ADMIN_PIN no .env>
function requireAdminPin(req, res, next) {
  const pin = req.headers['x-admin-pin'];
  const expectedPin = process.env.ADMIN_PIN;

  if (!expectedPin) {
    // Se ADMIN_PIN não estiver configurado, avisa mas não bloqueia em development
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'ADMIN_PIN não configurado no servidor.' });
    }
    console.warn('[orderRoutes] ⚠️  ADMIN_PIN não definido — acesso liberado em desenvolvimento.');
    return next();
  }

  if (pin !== expectedPin) {
    return res.status(401).json({
      error: 'PIN de administrador inválido.',
      hint: 'Envie o cabeçalho X-Admin-Pin com o PIN correto.',
    });
  }

  next();
}

// ── GET /api/orders ────────────────────────────────────────────
// Query params: ?status=PLACED&date=2025-09-01&limit=50
router.get('/', requireAdminPin, (req, res) => {
  const { status, date, limit } = req.query;

  const result = getOrders({
    status,
    date,
    limit: limit ? parseInt(limit, 10) : 100,
  });

  res.json({
    success: true,
    ...result,
  });
});

// ── GET /api/orders/summary ────────────────────────────────────
// Resumo financeiro: total de pedidos hoje, faturamento bruto/líquido estimado.
router.get('/summary', requireAdminPin, (req, res) => {
  const store = loadOrders();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const todayOrders = store.orders.filter(o =>
    o.placedAt?.startsWith(today)
  );

  const concluded = todayOrders.filter(o => o.status === 'CONCLUDED');
  const placed    = todayOrders.filter(o => o.status === 'PLACED');
  const confirmed = todayOrders.filter(o => o.status === 'CONFIRMED');
  const cancelled = todayOrders.filter(o => o.status === 'CANCELLED');

  const grossRevenue = concluded.reduce((sum, o) => sum + (o.totals.orderAmount ?? 0), 0);
  const netRevenue   = concluded.reduce((sum, o) => sum + (o.totals.netAmountEstimated ?? o.totals.orderAmount ?? 0), 0);
  const avgTicket    = concluded.length > 0 ? grossRevenue / concluded.length : 0;

  res.json({
    success: true,
    date: today,
    summary: {
      total: todayOrders.length,
      byStatus: {
        placed:    placed.length,
        confirmed: confirmed.length,
        concluded: concluded.length,
        cancelled: cancelled.length,
      },
      financials: {
        grossRevenue: +grossRevenue.toFixed(2),
        netRevenueEstimated: +netRevenue.toFixed(2),
        ifoodFeesEstimated: +(grossRevenue - netRevenue).toFixed(2),
        averageTicket: +avgTicket.toFixed(2),
      },
    },
    lastUpdated: store.lastUpdated,
  });
});

// ── GET /api/orders/:orderId ───────────────────────────────────
router.get('/:orderId', requireAdminPin, (req, res) => {
  const { orderId } = req.params;
  const order = getOrderById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: `Pedido "${orderId}" não encontrado no cache local.`,
      hint: 'O pedido pode ainda não ter sido processado pelo worker de polling.',
    });
  }

  res.json({ success: true, order });
});

export default router;
