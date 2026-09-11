/**
 * catalogRoutes.js
 * Endpoints de controle de catálogo para o painel administrativo.
 *
 * PATCH /api/catalog/:productId/status  — Pausa ou ativa um produto no iFood
 * GET   /api/catalog/products           — Lista produtos do catálogo iFood
 */

import { Router } from 'express';
import ifoodClient from '../modules/ifoodClient.js';
import { loadTokens } from '../modules/tokenStore.js';

const router = Router();

// ── Helper: obtém merchantId de forma segura ───────────────────
function getMerchantId() {
  const tokens = loadTokens();
  return tokens?.merchantId ?? process.env.IFOOD_MERCHANT_ID;
}

// ── Middleware: valida PIN de admin ────────────────────────────
function requireAdminPin(req, res, next) {
  const pin = req.headers['x-admin-pin'];
  const expectedPin = process.env.ADMIN_PIN;

  if (!expectedPin) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'ADMIN_PIN não configurado no servidor.' });
    }
    console.warn('[catalogRoutes] ⚠️  ADMIN_PIN não definido — acesso liberado em desenvolvimento.');
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

// ── Middleware: verifica autenticação iFood ────────────────────
function requireIfoodAuth(req, res, next) {
  const tokens = loadTokens();
  if (!tokens?.accessToken) {
    return res.status(401).json({
      error: 'Não autenticado com o iFood.',
      hint: 'Acesse GET /auth/ifood para iniciar o fluxo de autorização.',
    });
  }
  next();
}

// ── PATCH /api/catalog/:productId/status ──────────────────────
// Pausa ou ativa um produto no catálogo iFood.
// Body: { "available": true | false }
//
// A iFood Catalog API aceita duas variações dependendo do tipo de item:
//   - Produto simples:  PATCH /catalog/v1.0/merchants/{merchantId}/products/{productId}/status
//   - Opção de produto: PATCH /catalog/v1.0/merchants/{merchantId}/options/{optionId}/status
// Este endpoint tenta ambos em sequência se o primeiro falhar.
router.patch('/:productId/status', requireAdminPin, requireIfoodAuth, async (req, res) => {
  const { productId } = req.params;
  const { available } = req.body;

  if (typeof available !== 'boolean') {
    return res.status(400).json({
      error: 'O campo "available" é obrigatório e deve ser boolean (true ou false).',
    });
  }

  const merchantId = getMerchantId();
  if (!merchantId) {
    return res.status(500).json({
      error: 'merchantId não encontrado. Defina IFOOD_MERCHANT_ID no .env ou faça login.',
    });
  }

  const statusPayload = { status: available ? 'AVAILABLE' : 'UNAVAILABLE' };

  // Tentativa 1: endpoint de produto
  try {
    const { data } = await ifoodClient.patch(
      `/catalog/v1.0/merchants/${merchantId}/products/${productId}/status`,
      statusPayload
    );

    console.log(
      `[catalogRoutes] Produto ${productId} → ${available ? '🟢 ATIVO' : '⚫ PAUSADO'} (via /products)`
    );

    return res.json({
      success: true,
      productId,
      available,
      source: 'products',
      ifoodResponse: data,
    });

  } catch (productErr) {
    const productStatus = productErr.response?.status;
    console.warn(
      `[catalogRoutes] /products falhou (${productStatus}) para ${productId}. Tentando /options...`
    );

    // Tentativa 2: endpoint de opção (para itens do tipo "option" no catálogo)
    try {
      const { data } = await ifoodClient.patch(
        `/catalog/v1.0/merchants/${merchantId}/options/${productId}/status`,
        statusPayload
      );

      console.log(
        `[catalogRoutes] Opção ${productId} → ${available ? '🟢 ATIVA' : '⚫ PAUSADA'} (via /options)`
      );

      return res.json({
        success: true,
        productId,
        available,
        source: 'options',
        ifoodResponse: data,
      });

    } catch (optionErr) {
      const errorData = optionErr.response?.data ?? optionErr.message;
      console.error(`[catalogRoutes] Ambos os endpoints falharam para ${productId}:`, errorData);

      return res.status(optionErr.response?.status ?? 500).json({
        success: false,
        productId,
        error: 'Não foi possível atualizar o status do produto/opção no iFood.',
        details: errorData,
        hint: 'Verifique se o productId corresponde a um ID do catálogo iFood (não o ID local do menu.json).',
      });
    }
  }
});

// ── GET /api/catalog/products ──────────────────────────────────
// Lista todos os produtos do catálogo iFood do estabelecimento.
// Útil para mapear os IDs do iFood com os itens do menu.json local.
router.get('/products', requireAdminPin, requireIfoodAuth, async (req, res) => {
  const merchantId = getMerchantId();

  if (!merchantId) {
    return res.status(500).json({ error: 'merchantId não encontrado.' });
  }

  try {
    const { data } = await ifoodClient.get(
      `/catalog/v1.0/merchants/${merchantId}/products`
    );

    res.json({
      success: true,
      merchantId,
      products: data,
    });

  } catch (err) {
    const errorData = err.response?.data ?? err.message;
    console.error('[catalogRoutes] Erro ao listar produtos:', errorData);

    res.status(err.response?.status ?? 500).json({
      success: false,
      error: 'Erro ao buscar catálogo no iFood.',
      details: errorData,
    });
  }
});

export default router;
