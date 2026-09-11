/**
 * orderStore.js
 * Cache local de pedidos recebidos do iFood.
 *
 * Estrutura de orders.json:
 * {
 *   "orders": [
 *     {
 *       "id": "uuid-do-pedido",
 *       "status": "PLACED" | "CONFIRMED" | "CONCLUDED" | "CANCELLED",
 *       "placedAt": "ISO timestamp",
 *       "concludedAt": "ISO timestamp | null",
 *       "customer": { "name": "...", "phone": "..." },
 *       "items": [...],
 *       "totals": {
 *         "orderAmount": 0,       // valor bruto do pedido
 *         "deliveryFee": 0,       // taxa de entrega
 *         "ifoodFee": 0,          // taxa iFood (quando disponível)
 *         "netAmount": 0          // valor líquido estimado
 *       },
 *       "ifoodRaw": { ... }       // payload completo do iFood (para debug)
 *     }
 *   ],
 *   "lastUpdated": "ISO timestamp"
 * }
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORDERS_FILE = join(__dirname, '..', 'data', 'orders.json');

/** Lê o cache de pedidos. Retorna objeto com array orders. */
export function loadOrders() {
  try {
    if (!existsSync(ORDERS_FILE)) {
      return { orders: [], lastUpdated: null };
    }
    const raw = readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[orderStore] Erro ao ler orders.json:', err.message);
    return { orders: [], lastUpdated: null };
  }
}

/** Persiste o estado de pedidos no disco. */
function persistOrders(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[orderStore] Erro ao salvar orders.json:', err.message);
  }
}

/**
 * Adiciona ou atualiza um pedido no cache.
 * @param {object} orderPayload - Payload completo do pedido retornado pela API
 */
export function upsertOrder(orderPayload) {
  const store = loadOrders();

  const existingIndex = store.orders.findIndex(o => o.id === orderPayload.id);

  const normalized = {
    id: orderPayload.id,
    shortReference: orderPayload.shortReference ?? null,
    status: orderPayload.orderStatus ?? 'UNKNOWN',
    placedAt: orderPayload.createdAt ?? new Date().toISOString(),
    concludedAt: null,
    customer: {
      name: orderPayload.customer?.name ?? 'Não informado',
      phone: orderPayload.customer?.phone ?? null,
    },
    deliveryType: orderPayload.deliveryMethod?.mode ?? null,
    deliveryAddress: orderPayload.deliveryMethod?.deliveredBy === 'MERCHANT'
      ? orderPayload.delivery?.deliveryAddress ?? null
      : null,
    items: (orderPayload.items ?? []).map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    totals: {
      orderAmount: orderPayload.totalPrice ?? 0,
      deliveryFee: orderPayload.deliveryFee ?? 0,
      benefits: orderPayload.benefits ?? [],
      // taxa iFood só disponível no extrato financeiro, estimada abaixo
      ifoodFeeEstimated: null,
      netAmountEstimated: null,
    },
    payments: orderPayload.payments ?? [],
    ifoodRaw: orderPayload, // payload completo para auditoria
  };

  if (existingIndex >= 0) {
    // Mantém timestamps já registrados
    normalized.placedAt = store.orders[existingIndex].placedAt;
    normalized.concludedAt = store.orders[existingIndex].concludedAt;
    store.orders[existingIndex] = { ...store.orders[existingIndex], ...normalized };
  } else {
    store.orders.unshift(normalized); // mais recentes primeiro
  }

  persistOrders(store);
  return normalized;
}

/**
 * Atualiza o status de um pedido no cache.
 * Para CONCLUDED, registra consolidação financeira básica.
 */
export function updateOrderStatus(orderId, newStatus) {
  const store = loadOrders();
  const order = store.orders.find(o => o.id === orderId);

  if (!order) {
    console.warn(`[orderStore] Pedido ${orderId} não encontrado no cache para atualização de status.`);
    return null;
  }

  order.status = newStatus;

  if (newStatus === 'CONCLUDED') {
    order.concludedAt = new Date().toISOString();
    // Consolidação financeira estimada (taxa iFood ~12% + taxa de entrega quando iFood entrega)
    const IFOOD_FEE_RATE = 0.12;
    order.totals.ifoodFeeEstimated = +(order.totals.orderAmount * IFOOD_FEE_RATE).toFixed(2);
    order.totals.netAmountEstimated = +(
      order.totals.orderAmount - order.totals.ifoodFeeEstimated
    ).toFixed(2);
  }

  persistOrders(store);
  console.log(`[orderStore] Pedido ${orderId} → status: ${newStatus}`);
  return order;
}

/**
 * Retorna pedidos com filtros opcionais.
 * @param {{ status?: string, date?: string, limit?: number }} filters
 */
export function getOrders({ status, date, limit = 100 } = {}) {
  const store = loadOrders();
  let result = store.orders;

  if (status) {
    result = result.filter(o => o.status === status.toUpperCase());
  }

  if (date) {
    // date no formato YYYY-MM-DD
    result = result.filter(o => o.placedAt?.startsWith(date));
  }

  return {
    orders: result.slice(0, limit),
    total: result.length,
    lastUpdated: store.lastUpdated,
  };
}

/** Retorna um pedido pelo ID. */
export function getOrderById(orderId) {
  const store = loadOrders();
  return store.orders.find(o => o.id === orderId) ?? null;
}
