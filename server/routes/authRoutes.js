/**
 * authRoutes.js
 * Rotas de autenticação OAuth 2.0 — Fluxo Distribuído iFood.
 *
 * Endpoints:
 * GET  /auth/ifood           — Gera userCode e URL de autorização
 * POST /auth/ifood/callback  — Recebe o authorizationCode e troca por tokens
 * GET  /auth/status          — Verifica se há um token válido ativo
 * POST /auth/logout          — Limpa tokens locais (desconecta do iFood)
 */

import { Router } from 'express';
import { requestUserCode, exchangeCodeForToken } from '../modules/auth.js';
import { hasValidToken, loadTokens, clearTokens } from '../modules/tokenStore.js';
import { startOrderWorker, stopOrderWorker } from '../modules/orderWorker.js';

const router = Router();

// ── GET /auth/ifood ────────────────────────────────────────────
// Passo 1: Solicita userCode ao iFood e retorna a URL de autorização.
// O gerente deve acessar a URL, autorizar o app e anotar o authorizationCode.
router.get('/ifood', async (req, res) => {
  try {
    const result = await requestUserCode();
    res.json({
      success: true,
      ...result,
      instructions: [
        '1. Acesse a URL abaixo no navegador.',
        '2. Faça login no Portal do Parceiro iFood.',
        '3. Clique em "Autorizar".',
        '4. Copie o código exibido (authorizationCode).',
        '5. Envie o código via POST /auth/ifood/callback.',
      ],
    });
  } catch (err) {
    console.error('[authRoutes] Erro ao gerar userCode:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      hint: 'Verifique se IFOOD_CLIENT_ID está definido no .env',
    });
  }
});

// ── POST /auth/ifood/callback ──────────────────────────────────
// Passo 2: Recebe o authorizationCode colado pelo gerente.
// Body: { "authorizationCode": "ABC123..." }
router.post('/ifood/callback', async (req, res) => {
  const { authorizationCode } = req.body;

  if (!authorizationCode || typeof authorizationCode !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'authorizationCode é obrigatório no body da requisição.',
    });
  }

  try {
    const tokenData = await exchangeCodeForToken(authorizationCode.trim());

    // Inicia o worker de polling agora que temos um token válido
    startOrderWorker();

    res.json({
      success: true,
      message: 'Autenticação concluída! O worker de pedidos foi iniciado.',
      tokenType: tokenData.tokenType,
      expiresIn: tokenData.expiresIn,
    });
  } catch (err) {
    console.error('[authRoutes] Erro ao trocar código por token:', err.response?.data ?? err.message);

    const ifoodError = err.response?.data;
    res.status(400).json({
      success: false,
      error: ifoodError?.details ?? err.message,
      hint: 'Verifique se o authorizationCode é válido e não expirou (geralmente expira em 10 minutos).',
    });
  }
});

// ── GET /auth/status ───────────────────────────────────────────
// Retorna o estado atual da autenticação (usado pelo painel admin).
router.get('/status', (req, res) => {
  const tokens = loadTokens();
  const valid = hasValidToken();

  if (!tokens || !tokens.accessToken) {
    return res.json({
      authenticated: false,
      message: 'Nenhum token encontrado. Acesse GET /auth/ifood para iniciar o fluxo.',
    });
  }

  res.json({
    authenticated: valid,
    merchantId: tokens.merchantId,
    savedAt: tokens.savedAt,
    expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : null,
    message: valid
      ? 'Autenticado e token válido.'
      : 'Token expirado. Acesse GET /auth/ifood para renovar.',
  });
});

// ── POST /auth/logout ──────────────────────────────────────────
// Limpa os tokens locais e para o worker de polling.
router.post('/logout', (req, res) => {
  stopOrderWorker();
  clearTokens();
  res.json({
    success: true,
    message: 'Tokens removidos. Worker de pedidos parado.',
  });
});

export default router;
