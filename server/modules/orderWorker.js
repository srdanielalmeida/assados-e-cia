/**
 * orderWorker.js
 * Worker de polling de eventos de pedidos do iFood.
 *
 * Roda a cada 30 segundos e processa:
 * - PLACED: Busca dados completos do pedido e salva no cache
 * - CONFIRMED: Marca pedido como confirmado
 * - CONCLUDED: Consolida financeiramente o pedido
 * - CANCELLATION_REQUESTED / CANCELLED: Registra cancelamento
 *
 * Após processar, confirma o recebimento via POST /events/acknowledgment
 * para remover os eventos da fila do iFood.
 */

import ifoodClient from './ifoodClient.js';
import { upsertOrder, updateOrderStatus } from './orderStore.js';
import { hasValidToken } from './tokenStore.js';

const POLLING_INTERVAL_MS = 30_000;

let pollingTimer = null;
let isPolling = false; // Guard contra execuções simultâneas

/**
 * Busca os dados completos de um pedido pelo ID.
 */
async function fetchOrderDetails(orderId) {
  try {
    const { data } = await ifoodClient.get(`/order/v1.0/orders/${orderId}`);
    return data;
  } catch (err) {
    console.error(`[worker] Erro ao buscar pedido ${orderId}:`, err.response?.data ?? err.message);
    return null;
  }
}

/**
 * Confirma o recebimento dos eventos processados para removê-los da fila.
 * @param {Array<{ id: string, code: string }>} events
 */
async function acknowledgeEvents(events) {
  if (!events.length) return;
  try {
    await ifoodClient.post('/order/v1.0/events/acknowledgment', events);
    console.log(`[worker] ${events.length} evento(s) confirmado(s).`);
  } catch (err) {
    console.error('[worker] Erro no acknowledgment:', err.response?.data ?? err.message);
  }
}

/**
 * Ciclo principal de polling.
 * Chamado a cada POLLING_INTERVAL_MS pelo setInterval.
 */
async function pollEvents() {
  // Aguarda token válido — não faz polling se não há autenticação
  if (!hasValidToken()) {
    console.log('[worker] Aguardando token válido... polling pausado.');
    return;
  }

  // Guard: não inicia novo ciclo se o anterior ainda está rodando
  if (isPolling) {
    console.warn('[worker] Ciclo anterior ainda em execução — pulando este tick.');
    return;
  }

  isPolling = true;

  try {
    // 1. Busca eventos pendentes
    const { data: events } = await ifoodClient.get('/order/v1.0/events:polling');

    if (!events || events.length === 0) {
      // Sem eventos — silencioso para não poluir os logs
      return;
    }

    console.log(`[worker] ${events.length} evento(s) recebido(s).`);

    const toAcknowledge = [];

    for (const event of events) {
      const { id: eventId, code: eventCode, orderId, fullCode } = event;

      console.log(`[worker] Evento: ${fullCode ?? eventCode} | Pedido: ${orderId}`);

      try {
        switch (eventCode) {
          // ── PLACED: Pedido recebido ─────────────────────────────
          case 'PLACED': {
            const orderDetails = await fetchOrderDetails(orderId);
            if (orderDetails) {
              const saved = upsertOrder(orderDetails);
              console.log(
                `[worker] ✅ Pedido #${saved.shortReference ?? orderId} registrado — R$ ${saved.totals.orderAmount.toFixed(2)}`
              );
            }
            break;
          }

          // ── CONFIRMED: Restaurante confirmou o pedido ──────────
          case 'CONFIRMED': {
            updateOrderStatus(orderId, 'CONFIRMED');
            console.log(`[worker] ✅ Pedido ${orderId} confirmado.`);
            break;
          }

          // ── CONCLUDED: Pedido entregue / concluído ─────────────
          case 'CONCLUDED': {
            updateOrderStatus(orderId, 'CONCLUDED');
            console.log(`[worker] 💰 Pedido ${orderId} concluído — consolidação financeira registrada.`);
            break;
          }

          // ── CANCELLATION_REQUESTED: Cliente solicitou cancelamento
          case 'CANCELLATION_REQUESTED': {
            updateOrderStatus(orderId, 'CANCELLATION_REQUESTED');
            console.log(`[worker] ⚠️ Pedido ${orderId} — cancelamento solicitado.`);
            break;
          }

          // ── CANCELLED: Pedido cancelado ────────────────────────
          case 'CANCELLED': {
            // Garante que o pedido exista no cache antes de cancelar
            const details = await fetchOrderDetails(orderId);
            if (details) upsertOrder(details);
            updateOrderStatus(orderId, 'CANCELLED');
            console.log(`[worker] ❌ Pedido ${orderId} cancelado.`);
            break;
          }

          // ── Eventos desconhecidos — processa para não bloquear a fila
          default:
            console.log(`[worker] Evento desconhecido "${eventCode}" para pedido ${orderId} — ignorado com acknowledgment.`);
        }

        // Marca evento como processado para acknowledgment
        toAcknowledge.push({ id: eventId, code: eventCode });

      } catch (eventErr) {
        console.error(`[worker] Erro processando evento ${eventId}:`, eventErr.message);
        // Não adiciona ao acknowledgment para que o iFood reenvie na próxima rodada
      }
    }

    // 2. Confirma recebimento de todos os eventos processados com sucesso
    await acknowledgeEvents(toAcknowledge);

  } catch (err) {
    if (err.response?.status === 401) {
      console.error('[worker] 401 no polling — token inválido. Re-autenticação necessária.');
    } else {
      console.error('[worker] Erro no polling:', err.response?.data ?? err.message);
    }
  } finally {
    isPolling = false;
  }
}

/**
 * Inicia o worker de polling.
 * Idempotente: chamadas repetidas não criam múltiplos timers.
 */
export function startOrderWorker() {
  if (pollingTimer) {
    console.log('[worker] Worker já está rodando.');
    return;
  }

  console.log(`[worker] Iniciado — polling a cada ${POLLING_INTERVAL_MS / 1000}s.`);

  // Executa imediatamente na primeira chamada
  pollEvents();

  pollingTimer = setInterval(pollEvents, POLLING_INTERVAL_MS);
}

/**
 * Para o worker de polling.
 */
export function stopOrderWorker() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
    console.log('[worker] Worker parado.');
  }
}
