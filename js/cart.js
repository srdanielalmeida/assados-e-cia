/* ============================================================
   cart.js — Assados & Cia v3
   Módulo de carrinho (Lógica e Storage)
   ============================================================ */

'use strict';

const CartModule = (() => {
  const STORAGE_KEY = 'assados_cia_cart';
  let items = [];

  // ── Persistência ───────────────────────────────────────
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      items = saved ? JSON.parse(saved) : [];
    } catch {
      items = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('[cart] Erro ao salvar carrinho:', err);
    }
  }

  // ── Adicionar Item ─────────────────────────────────────
  function add(menuItem, qty, priceOverride, obs) {
    obs = obs || '';
    const price = priceOverride || menuItem.preco;
    const tipo = menuItem.tipo_venda || menuItem.tipo || 'unidade';

    // Procura item existente com mesma ID e mesma observação
    const existing = items.find(i => i.id === menuItem.id && i.obs === obs);
    if (existing) {
      existing.qty = Math.round((existing.qty + qty) * 100) / 100;
    } else {
      items.push(buildCartItem(menuItem, qty, price, obs));
    }

    save();
  }

  function buildCartItem(menuItem, qty, preco, obs) {
    const tipo = menuItem.tipo_venda || menuItem.tipo || 'unidade';
    return {
      id: menuItem.id,
      nome: menuItem.nome,
      categoria: menuItem.categoria,
      preco: preco || menuItem.preco,
      tipo_venda: tipo,
      tipo: tipo,
      imagem: menuItem.imagem || null,
      emoji: menuItem.emoji || null,
      qty: qty,
      obs: obs,
      lineId: Date.now() + Math.random().toString(36).slice(2),
    };
  }

  // ── Incrementar / Decrementar ──────────────────────────
  function increment(key, step = 1) {
    const item = items.find(i => i.lineId === key || i.id === key);
    if (!item) return;
    item.qty = Math.round((item.qty + step) * 100) / 100;
    save();
  }

  function decrement(key, step = 1) {
    const idx = items.findIndex(i => i.lineId === key || i.id === key);
    if (idx === -1) return;
    
    const item = items[idx];
    item.qty = Math.round((item.qty - step) * 100) / 100;
    
    if (item.qty <= 0) {
      items.splice(idx, 1);
    }
    save();
  }

  function removeItem(key) {
    items = items.filter(i => i.lineId !== key && i.id !== key);
    save();
  }

  // ── Totais ─────────────────────────────────────────────
  function getTotal() {
    return items.reduce((acc, i) => acc + (i.preco * i.qty), 0);
  }

  function getCount() {
    return items.reduce((acc, i) => acc + (i.tipo === 'kg' ? 1 : Math.ceil(i.qty)), 0);
  }

  // ── Getters públicos ───────────────────────────────────
  function getItems() { return [...items]; }
  function clear()    { items = []; save(); }

  // Init
  load();

  return { add, increment, decrement, removeItem, getItems, getTotal, getCount, clear };
})();

window.CartModule = CartModule;
