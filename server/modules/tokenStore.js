/**
 * tokenStore.js
 * Persistência dos tokens OAuth do iFood em arquivo local.
 *
 * Estrutura de tokens.json:
 * {
 *   "accessToken": "...",
 *   "refreshToken": "...",
 *   "expiresAt": 1234567890000,   // timestamp em ms (Date.now() + expiresIn * 1000)
 *   "merchantId": "..."
 * }
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = join(__dirname, '..', 'data', 'tokens.json');

/** Lê os tokens do disco. Retorna null se o arquivo não existir. */
export function loadTokens() {
  try {
    if (!existsSync(TOKEN_FILE)) return null;
    const raw = readFileSync(TOKEN_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[tokenStore] Erro ao ler tokens.json:', err.message);
    return null;
  }
}

/**
 * Salva os tokens no disco.
 * @param {object} tokenData
 * @param {string} tokenData.accessToken
 * @param {string} tokenData.refreshToken
 * @param {number} tokenData.expiresIn  - em segundos, conforme retornado pela API
 * @param {string} [tokenData.merchantId]
 */
export function saveTokens({ accessToken, refreshToken, expiresIn, merchantId }) {
  const data = {
    accessToken,
    refreshToken,
    // Subtrai 60s de margem para garantir refresh antes de expirar
    expiresAt: Date.now() + (expiresIn - 60) * 1000,
    merchantId: merchantId ?? loadTokens()?.merchantId ?? process.env.IFOOD_MERCHANT_ID,
    savedAt: new Date().toISOString(),
  };
  try {
    writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[tokenStore] Tokens salvos. Expiram em:', new Date(data.expiresAt).toLocaleString('pt-BR'));
  } catch (err) {
    console.error('[tokenStore] Erro ao salvar tokens.json:', err.message);
  }
}

/** Verifica se o access token atual está próximo de expirar (< 5 minutos). */
export function isTokenExpiringSoon() {
  const tokens = loadTokens();
  if (!tokens) return true;
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  return Date.now() >= tokens.expiresAt - FIVE_MINUTES_MS;
}

/** Verifica se há um access token válido salvo. */
export function hasValidToken() {
  const tokens = loadTokens();
  if (!tokens) return false;
  return Date.now() < tokens.expiresAt;
}

/** Limpa os tokens (usado no logout/desconexão). */
export function clearTokens() {
  try {
    if (existsSync(TOKEN_FILE)) {
      writeFileSync(TOKEN_FILE, JSON.stringify({}), 'utf-8');
      console.log('[tokenStore] Tokens removidos.');
    }
  } catch (err) {
    console.error('[tokenStore] Erro ao limpar tokens:', err.message);
  }
}
