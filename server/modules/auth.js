/**
 * auth.js
 * Módulo de autenticação OAuth 2.0 — Fluxo de Aplicativo Distribuído iFood.
 *
 * Fluxo:
 * 1. Gerar userCode → `POST /oauth/userCode`
 * 2. Gerente acessa verificationUrlComplete e autoriza no Portal do Parceiro.
 * 3. Gerente recebe o authorizationCode e cola no painel.
 * 4. Trocar authorizationCode por access_token → `POST /oauth/token`
 * 5. Renovar automaticamente com refresh_token quando necessário.
 */

import axios from 'axios';
import { saveTokens, loadTokens } from './tokenStore.js';

const IFOOD_AUTH_BASE = 'https://merchant-api.ifood.com.br/authentication/v1.0';

/**
 * Passo 1 — Solicita o userCode ao iFood.
 * O gerente deve acessar a URL retornada e autorizar o aplicativo.
 *
 * @returns {{ userCode: string, verificationUrl: string, verificationUrlComplete: string, expiresIn: number }}
 */
export async function requestUserCode() {
  const clientId = process.env.IFOOD_CLIENT_ID;
  if (!clientId) {
    throw new Error('IFOOD_CLIENT_ID não definido no .env');
  }

  const params = new URLSearchParams({ clientId });

  const { data } = await axios.post(
    `${IFOOD_AUTH_BASE}/oauth/userCode`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  console.log('[auth] userCode gerado:', data.userCode);
  console.log('[auth] URL de autorização:', data.verificationUrlComplete);

  return {
    userCode: data.userCode,
    verificationUrl: data.verificationUrl,
    verificationUrlComplete: data.verificationUrlComplete,
    expiresIn: data.expiresIn,
    message: 'Acesse a URL e autorize o aplicativo no Portal do Parceiro iFood. Depois, cole o authorizationCode no painel.',
  };
}

/**
 * Passo 2 — Troca o authorizationCode (fornecido pelo gerente) por tokens OAuth.
 * Salva automaticamente em tokenStore.
 *
 * @param {string} authorizationCode - Código obtido pelo gerente após autorizar
 * @returns {{ accessToken: string, refreshToken: string, expiresIn: number, tokenType: string }}
 */
export async function exchangeCodeForToken(authorizationCode) {
  const { IFOOD_CLIENT_ID, IFOOD_CLIENT_SECRET } = process.env;

  if (!IFOOD_CLIENT_ID || !IFOOD_CLIENT_SECRET) {
    throw new Error('IFOOD_CLIENT_ID ou IFOOD_CLIENT_SECRET não definidos no .env');
  }
  if (!authorizationCode) {
    throw new Error('authorizationCode é obrigatório');
  }

  const params = new URLSearchParams({
    grantType: 'authorization_code',
    clientId: IFOOD_CLIENT_ID,
    clientSecret: IFOOD_CLIENT_SECRET,
    authorizationCode,
  });

  const { data } = await axios.post(
    `${IFOOD_AUTH_BASE}/oauth/token`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  // Salva tokens no disco para persistência entre reinicializações
  saveTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  });

  console.log('[auth] Autenticação bem-sucedida! Token salvo.');
  return data;
}

/**
 * Renova o access_token usando o refresh_token armazenado.
 * Chamado automaticamente pelo ifoodClient interceptor.
 *
 * @returns {string} Novo accessToken
 */
export async function refreshAccessToken() {
  const { IFOOD_CLIENT_ID, IFOOD_CLIENT_SECRET } = process.env;
  const tokens = loadTokens();

  if (!tokens?.refreshToken) {
    throw new Error('[auth] Nenhum refresh_token disponível. É necessário autenticar novamente.');
  }

  const params = new URLSearchParams({
    grantType: 'refresh_token',
    clientId: IFOOD_CLIENT_ID,
    clientSecret: IFOOD_CLIENT_SECRET,
    refreshToken: tokens.refreshToken,
  });

  const { data } = await axios.post(
    `${IFOOD_AUTH_BASE}/oauth/token`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  saveTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? tokens.refreshToken, // alguns flows mantêm o mesmo refresh_token
    expiresIn: data.expiresIn,
  });

  console.log('[auth] Token renovado com sucesso via refresh_token.');
  return data.accessToken;
}
