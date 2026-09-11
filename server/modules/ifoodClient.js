/**
 * ifoodClient.js
 * Cliente HTTP centralizado para a iFood Merchant API.
 *
 * Recursos:
 * - Base URL configurada para https://merchant-api.ifood.com.br
 * - Interceptor de request: injeta o Bearer token em todo request
 * - Interceptor de response: renova o token automaticamente em 401
 * - Retry com backoff exponencial para erros 5xx e 429 (rate limit)
 */

import axios from 'axios';
import { loadTokens, isTokenExpiringSoon } from './tokenStore.js';
import { refreshAccessToken } from './auth.js';

const IFOOD_BASE_URL = 'https://merchant-api.ifood.com.br';

// Sinaliza se já está em processo de refresh para evitar loops
let isRefreshing = false;
// Fila de requisições que aguardam o refresh
let refreshSubscribers = [];

function onRefreshComplete(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

/** Cria a instância axios configurada para o iFood */
const ifoodClient = axios.create({
  baseURL: IFOOD_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor de REQUEST ──────────────────────────────────────
// Injeta o Bearer token antes de cada requisição.
// Se o token estiver próximo de expirar, renova proativamente.
ifoodClient.interceptors.request.use(async (config) => {
  if (isTokenExpiringSoon()) {
    console.log('[ifoodClient] Token expirando em breve — renovando proativamente...');
    try {
      await refreshAccessToken();
    } catch (err) {
      console.warn('[ifoodClient] Não foi possível renovar o token proativamente:', err.message);
    }
  }

  const tokens = loadTokens();
  if (tokens?.accessToken) {
    config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

// ── Interceptor de RESPONSE ────────────────────────────────────
// Trata 401 (token expirado inesperadamente) com refresh e retry.
// Trata 429 (rate limit) com backoff de 5 segundos.
ifoodClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── 401: Token expirado — tenta refresh e reprocessa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Já está refreshando: adiciona à fila e aguarda
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(ifoodClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshComplete(newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return ifoodClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        console.error('[ifoodClient] Refresh falhou. Re-autenticação necessária:', refreshError.message);
        return Promise.reject(refreshError);
      }
    }

    // ── 429: Rate limit — aguarda 5 segundos e tenta novamente
    if (error.response?.status === 429 && !originalRequest._rateLimitRetry) {
      originalRequest._rateLimitRetry = true;
      console.warn('[ifoodClient] Rate limit atingido (429). Aguardando 5s...');
      await new Promise(resolve => setTimeout(resolve, 5_000));
      return ifoodClient(originalRequest);
    }

    // ── 5xx: Erro do servidor — retry com backoff exponencial (1 retry)
    if (error.response?.status >= 500 && !originalRequest._serverErrorRetry) {
      originalRequest._serverErrorRetry = true;
      const waitMs = 2_000;
      console.warn(`[ifoodClient] Erro ${error.response.status}. Retry em ${waitMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return ifoodClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default ifoodClient;
