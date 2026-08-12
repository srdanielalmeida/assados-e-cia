/* ============================================================
   app.js — Assados & Cia v3
   Renderização do cardápio, status dinâmico, checkout,
   persistência de dados, pills de peso e integração WhatsApp.
   ============================================================ */

'use strict';

// ── Configurações ──────────────────────────────────────────
const CONFIG = {
  whatsappNumber: '5511944538326',
  pixKey: '(11) 94453-8326',
  storageUserKey: 'assados_cia_user_data',
  horarios: {
    // 0=Dom, 1=Seg…6=Sáb
    0: { open: 10, close: 15 },
    1: null,
    2: null,
    3: null,
    4: null,
    5: { open: 17, close: 20 },
    6: { open: 11, close: 20 },
  }
};

// ── Estado da aplicação ────────────────────────────────────
let menuData = null;
let searchTerm = '';
let isStoreOpen = true;

// ── Inicialização ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    updateStatusUI();
    await loadMenu();
    setupSearch();
    setupDeliveryToggle();
    setupPaymentToggle();
    setupPixCopy();
    setupWeightPills();
    setupPhoneMask();
    setupKeyboardAccessibility();

    // Atualiza status a cada minuto
    setInterval(updateStatusUI, 60_000);
  } catch (err) {
    console.error('[app] Erro na inicialização:', err);
  }
});

// ── Status (aberto / fechado) ──────────────────────────────
function updateStatusUI() {
  const now = new Date();
  const day = now.getDay(); // 0-6
  const hour = now.getHours() + now.getMinutes() / 60;
  const h = CONFIG.horarios[day];
  
  isStoreOpen = Boolean(h && hour >= h.open && hour < h.close);

  // Hero status bar
  const heroStatusBar = document.getElementById('hero-status-bar');
  const heroStatusText = document.getElementById('hero-status-text');
  if (heroStatusBar && heroStatusText) {
    if (isStoreOpen) {
      heroStatusBar.className = 'hero-open-bar';
      heroStatusText.textContent = `🟢 Aberto agora • Fecha às ${h.close}:00`;
    } else {
      heroStatusBar.className = 'hero-open-bar closed';
      heroStatusText.textContent = `🔴 Fechado no momento • Veja os horários abaixo`;
    }
  }

  // Alerta no modal de checkout
  const closedAlert = document.getElementById('closed-store-alert');
  if (closedAlert) {
    closedAlert.style.display = isStoreOpen ? 'none' : 'flex';
  }

  // Destaca o horário de hoje na lista da seção de informações
  const dayMap = {
    0: 'h-dom',
    1: 'h-seg',
    2: 'h-seg',
    3: 'h-seg',
    4: 'h-seg',
    5: 'h-sex',
    6: 'h-sab'
  };
  
  // Limpa todos primeiro
  document.querySelectorAll('.info-list-item').forEach(el => el.classList.remove('horario-hoje'));
  
  // Destaca o dia de hoje
  const todayId = dayMap[day];
  if (todayId) {
    document.getElementById(todayId)?.classList.add('horario-hoje');
  }
}

// ── Carrega cardápio ───────────────────────────────────────
async function loadMenu() {
  const res = await fetch('config/menu.json?v=' + Date.now());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  menuData = await res.json();
  renderMenu(menuData.categorias);
  renderCategoryBar(menuData.categorias);
}

// ── Renderiza barra de categorias (strip horizontal) ───────
function renderCategoryBar(cats) {
  const strip = document.getElementById('cat-strip');
  if (!strip) return;
  strip.innerHTML = '';

  const allPill = createCatPill('Todos', null, 'todos', true);
  strip.appendChild(allPill);

  cats.forEach(cat => {
    strip.appendChild(createCatPill(cat.nome, cat.emoji, cat.id, false));
  });

  setupCatPillScroll();
}

const SVG_ICONS = {
  todos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48"><path d="M9 20a1 1 0 100-2 1 1 0 000 2zM20 20a1 1 0 100-2 1 1 0 000 2zM1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
  dish: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  aves:            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.501 5.501 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  carnes:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  acompanhamentos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  bebidas:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
};

function getCatSvg(catId) {
  return SVG_ICONS[catId] || null;
}

function createCatPill(nome, emoji, id, active) {
  const btn = document.createElement('button');
  btn.className = `cat-pill${active ? ' active' : ''}`;
  btn.dataset.catId = id;
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-selected', active ? 'true' : 'false');
  const svgIcon = getCatSvg(id);
  const iconHtml = svgIcon
    ? `<span class="cat-pill-emoji">${svgIcon}</span>`
    : emoji ? `<span class="cat-pill-emoji">${emoji}</span>` : '';
  btn.innerHTML = `${iconHtml}${nome}`;
  btn.addEventListener('click', () => filterCategory(id));
  return btn;
}

function setupCatPillScroll() {
  const sections = document.querySelectorAll('[data-cat-section]');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const catId = entry.target.dataset.catSection;
        highlightCatPill(catId);
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

function highlightCatPill(catId) {
  document.querySelectorAll('.cat-pill').forEach(p => {
    const isActive = p.dataset.catId === catId;
    p.classList.toggle('active', isActive);
    p.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  const activePill = document.querySelector(`.cat-pill[data-cat-id="${catId}"]`);
  if (activePill) {
    activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

// ── Filtro de categoria ────────────────────────────────────
function filterCategory(catId) {
  if (catId === 'todos') {
    document.querySelectorAll('.menu-section').forEach(s => s.style.display = '');
    document.getElementById('menu-sections')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    const target = document.querySelector(`[data-cat-section="${catId}"]`);
    if (target) {
      const offset = 64 + 52 + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
  highlightCatPill(catId);
}

// ── Renderiza o cardápio completo ──────────────────────────
function renderMenu(cats) {
  const container = document.getElementById('menu-sections');
  if (!container) return;
  container.innerHTML = '';

  cats.forEach(cat => {
    const section = buildCategorySection(cat);
    container.appendChild(section);
  });
}

function buildCategorySection(cat) {
  const section = document.createElement('section');
  section.className = 'menu-section';
  section.dataset.catSection = cat.id;
  section.setAttribute('aria-label', cat.nome);

  const itens = menuData.itens.filter(i => i.categoria === cat.id);
  const filtrados = searchTerm
    ? itens.filter(i => i.nome.toLowerCase().includes(searchTerm) || (i.descricao || '').toLowerCase().includes(searchTerm))
    : itens;

  if (filtrados.length === 0 && searchTerm) {
    section.style.display = 'none';
    return section;
  }

  section.innerHTML = `<h2 class="menu-section-title">${cat.nome}</h2>`;

  const list = document.createElement('div');
  list.className = 'menu-grid';

  filtrados.forEach(item => {
    list.appendChild(buildPratoItem(item));
  });

  section.appendChild(list);
  return section;
}

function buildPratoItem(item) {
  const li = document.createElement('div');
  li.className = `prato-card${item.disponivel === false ? ' indisponivel' : ''}`;
  li.setAttribute('role', 'listitem');

  const tipoVenda = item.tipo_venda || item.tipo || 'unidade';
  const precoFormatado = formatBRL(item.preco);
  const precoLabel = item.unidadeLabel || (tipoVenda === 'kg' ? 'kg' : 'porção');

  // Intl.NumberFormat pode usar espaço não-separável (char 160)
  const normalized = precoFormatado.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ');
  const [currency, value] = normalized.split(' ');
  
  let whole = value || "0", cents = "";
  if (whole.includes(',')) {
     const parts = whole.split(',');
     whole = parts[0];
     cents = "," + parts[1];
  }
  
  const precoHtml = `
    <span class="preco-currency">${currency}</span>
    <span class="preco-whole">${whole}</span><span class="preco-cents">${cents}</span>
  `;

  const imgHtml = item.imagem
    ? `<img src="${item.imagem}" alt="${item.nome}" class="prato-img" loading="lazy" onerror="this.style.display='none'">`
    : `<div class="prato-img-placeholder">${SVG_ICONS.dish}</div>`;

  li.innerHTML = `
    <div class="prato-info">
      <div class="prato-nome"><span class="prato-nome-text">${item.nome}</span></div>
      <div class="prato-desc">${item.descricao || ''}</div>
      <div class="prato-preco">${precoHtml}</div>
      <div class="prato-unidade">por ${precoLabel}</div>
    </div>
    <div class="prato-img-wrap">
      ${imgHtml}
      <button class="prato-add-btn" aria-label="Adicionar ${item.nome}" data-item-id="${item.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  `;

  li.addEventListener('click', (e) => {
    if (e.target.closest('.prato-add-btn') || item.disponivel === false) return;
    handleAddItem(item);
  });

  const addBtn = li.querySelector('.prato-add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAddItem(item);
    });
  }

  return li;
}

// ── Adiciona item ao carrinho (com modal se kg/porção) ─────
function handleAddItem(item) {
  const tipo = item.tipo_venda || item.tipo || 'unidade';
  if (tipo === 'kg' || tipo === 'porcao') {
    openQtyModal(item);
  } else {
    // Unidade — adiciona direto com qty=1
    CartModule.add(item, 1, 0, '');
    showToast(`${item.nome} adicionado ao pedido!`, 'success');
    updateAllCartUI();
  }
}

// ── Modal de quantidade com pills de peso ──────────────────
let _qtyItem = null;
let _qtyVal = 0.5; // kg ou qtd

function openQtyModal(item) {
  _qtyItem = item;
  const tipo = item.tipo_venda || item.tipo || 'unidade';
  _qtyVal = tipo === 'kg' ? 0.5 : 1;

  document.getElementById('qty-nome').textContent = item.nome;
  document.getElementById('qty-preco').textContent =
    `${formatBRL(item.preco)} por ${tipo === 'kg' ? 'kg' : 'porção'}`;
  document.getElementById('qty-label').textContent =
    tipo === 'kg' ? 'Quantidade em Kg' : 'Porções';
  document.getElementById('qty-obs').value = '';

  // Exibe/Oculta pills para kg
  const pillsWrap = document.getElementById('qty-pills-wrap');
  if (pillsWrap) {
    pillsWrap.style.display = tipo === 'kg' ? 'block' : 'none';
  }

  updateQtyDisplay();

  const overlay = document.getElementById('qty-overlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeQtyModal() {
  const overlay = document.getElementById('qty-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  _qtyItem = null;
}

function updateQtyDisplay() {
  if (!_qtyItem) return;
  const display = document.getElementById('qty-display');
  const subtotalEl = document.getElementById('qty-item-subtotal');
  const tipo = _qtyItem.tipo_venda || _qtyItem.tipo || 'unidade';

  if (display) {
    if (tipo === 'kg') {
      display.textContent = `${_qtyVal.toFixed(2).replace('.', ',')} kg`;
    } else {
      display.textContent = `${_qtyVal} porção${_qtyVal > 1 ? 'ões' : ''}`;
    }
  }

  // Atualiza subtotal calculado
  if (subtotalEl) {
    const subtotal = _qtyVal * _qtyItem.preco;
    subtotalEl.textContent = formatBRL(subtotal);
  }

  // Atualiza pílulas ativas se kg
  if (tipo === 'kg') {
    document.querySelectorAll('.weight-pill').forEach(pill => {
      const w = parseFloat(pill.dataset.weight);
      pill.classList.toggle('active', Math.abs(w - _qtyVal) < 0.01);
    });
  }
}

function setupWeightPills() {
  document.getElementById('weight-pills-grid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.weight-pill');
    if (!btn || !_qtyItem) return;
    _qtyVal = parseFloat(btn.dataset.weight);
    updateQtyDisplay();
  });
}

// Eventos do modal de quantidade
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('qty-dec')?.addEventListener('click', () => {
    if (!_qtyItem) return;
    const tipo = _qtyItem.tipo_venda || _qtyItem.tipo || 'unidade';
    const step = tipo === 'kg' ? 0.25 : 1;
    const min = tipo === 'kg' ? 0.25 : 1;
    if (_qtyVal > min) {
      _qtyVal = Math.round((_qtyVal - step) * 100) / 100;
      updateQtyDisplay();
    }
  });

  document.getElementById('qty-inc')?.addEventListener('click', () => {
    if (!_qtyItem) return;
    const tipo = _qtyItem.tipo_venda || _qtyItem.tipo || 'unidade';
    const step = tipo === 'kg' ? 0.25 : 1;
    _qtyVal = Math.round((_qtyVal + step) * 100) / 100;
    updateQtyDisplay();
  });

  document.getElementById('qty-confirm')?.addEventListener('click', () => {
    if (!_qtyItem) return;
    const obs = document.getElementById('qty-obs')?.value?.trim() || '';
    const tipo = _qtyItem.tipo_venda || _qtyItem.tipo || 'unidade';
    CartModule.add(_qtyItem, _qtyVal, _qtyItem.preco, obs);
    
    let detailStr = '';
    if (tipo === 'kg') {
      detailStr = ` (${String(_qtyVal).replace('.', ',')} kg)`;
    } else if (tipo === 'porcao') {
      detailStr = ` (${_qtyVal} porção${_qtyVal > 1 ? 'ões' : ''})`;
    }

    showToast(`${_qtyItem.nome}${detailStr} adicionado ao pedido!`, 'success');
    updateAllCartUI();
    closeQtyModal();
  });

  document.getElementById('qty-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'qty-overlay') closeQtyModal();
  });
});

// ── Busca ──────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    searchTerm = input.value.toLowerCase().trim();
    if (menuData) renderMenu(menuData.categorias);
  });
}

// ── Atualiza toda a UI do carrinho ─────────────────────────
function updateAllCartUI() {
  const items = CartModule.getItems();
  const total = CartModule.getTotal();
  const count = CartModule.getCount();

  const topCartBtn = document.getElementById('nav-cart-btn');
  const badge = document.getElementById('nav-cart-badge');
  const navTotal = document.getElementById('nav-cart-total');
  
  if (topCartBtn) {
    topCartBtn.classList.toggle('has-items', count > 0);
    topCartBtn.classList.remove('cart-highlight-anim');
    void topCartBtn.offsetWidth;
    topCartBtn.classList.add('cart-highlight-anim');
    setTimeout(() => topCartBtn.classList.remove('cart-highlight-anim'), 1200);
  }
  
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
  if (navTotal) navTotal.innerHTML = `R$&nbsp;${formatBRL(total).replace('R$', '')}`;

  const floatBtn = document.getElementById('floating-cart-btn');
  const floatBadge = document.getElementById('floating-cart-badge');
  const floatTotal = document.getElementById('floating-cart-total');
  
  if (floatBtn) {
    floatBtn.classList.toggle('has-items', count > 0);
    floatBtn.classList.remove('cart-highlight-anim');
    void floatBtn.offsetWidth;
    floatBtn.classList.add('cart-highlight-anim');
    setTimeout(() => floatBtn.classList.remove('cart-highlight-anim'), 1200);
  }
  
  if (floatBadge) {
    floatBadge.textContent = count;
    floatBadge.style.display = count > 0 ? 'flex' : 'none';
    if (count > 0) {
      floatBadge.classList.remove('badge-pop-anim');
      void floatBadge.offsetWidth;
      floatBadge.classList.add('badge-pop-anim');
      setTimeout(() => floatBadge.classList.remove('badge-pop-anim'), 600);
    }
  }
  
  if (floatTotal) floatTotal.textContent = formatBRL(total);

  updateDrawerCart(items, total, count);
}

// ── Drawer carrinho (mobile/desktop) ───────────────────────
function updateDrawerCart(items, total, count) {
  const body = document.getElementById('drawer-body');
  const footer = document.getElementById('drawer-footer');
  const totals = document.getElementById('drawer-totals');
  const checkoutBtn = document.getElementById('drawer-checkout-btn');
  const clearBtn = document.getElementById('drawer-clear-btn');
  if (!body) return;

  if (clearBtn) {
    clearBtn.style.display = items.length > 0 ? 'inline-flex' : 'none';
  }

  if (items.length === 0) {
    body.innerHTML = `
      <div class="drawer-empty">
        <div class="drawer-empty-icon">${SVG_ICONS.cart}</div>
        <p>Seu carrinho está vazio.<br>Adicione deliciosos assados do cardápio.</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  body.innerHTML = '';
  items.forEach(it => body.appendChild(buildDrawerItem(it)));

  if (footer) footer.style.display = '';
  if (totals) {
    totals.innerHTML = `
      <div class="dt-row"><span>Subtotal</span><span>${formatBRL(total)}</span></div>
      <div class="dt-row total"><span>Total</span><span>${formatBRL(total)}</span></div>
    `;
  }
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.onclick = () => { closeDrawer(); openCheckout(); };
  }
}

function buildDrawerItem(it) {
  const div = document.createElement('div');
  div.className = 'cart-item';

  const imgHtml = it.imagem
    ? `<img src="${it.imagem}" alt="${it.nome}" class="ci-img" loading="lazy" />`
    : `<div class="ci-img-placeholder">${SVG_ICONS.dish}</div>`;

  const tipo = it.tipo_venda || it.tipo || 'unidade';
  const detalhe = tipo === 'kg'
    ? `${String(it.qty).replace('.', ',')} kg × ${formatBRL(it.preco)}/kg`
    : tipo === 'porcao'
    ? `${it.qty} porção × ${formatBRL(it.preco)}`
    : `${it.qty} × ${formatBRL(it.preco)}`;

  const subtotal = formatBRL(it.qty * it.preco);
  const itemKey = it.lineId || it.id;

  div.innerHTML = `
    ${imgHtml}
    <div class="ci-info">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <div class="ci-nome">${it.nome}</div>
        <button class="ci-remove-btn" aria-label="Remover ${it.nome} do carrinho" title="Remover item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div style="font-size:12px; color:var(--text-sec); margin-bottom:2px;">${detalhe}</div>
      ${it.obs ? `<div style="font-size:11px; color:var(--orange); font-style:italic;">Obs: ${it.obs}</div>` : ''}
      <div class="ci-preco" style="margin-top:4px;">${subtotal}</div>
      <div class="ci-controls">
        <button class="ci-btn" data-action="dec" aria-label="Diminuir quantidade de ${it.nome}">−</button>
        <span class="ci-qty">${tipo === 'kg' ? String(it.qty).replace('.', ',') + ' kg' : it.qty}</span>
        <button class="ci-btn" data-action="inc" aria-label="Aumentar quantidade de ${it.nome}">+</button>
      </div>
    </div>
  `;

  div.querySelector('.ci-remove-btn')?.addEventListener('click', () => {
    CartModule.removeItem(itemKey);
    showToast(`${it.nome} removido do pedido`, 'info');
    updateAllCartUI();
  });

  div.querySelectorAll('.ci-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = tipo === 'kg' ? 0.25 : 1;
      if (btn.dataset.action === 'inc') {
        CartModule.increment(itemKey, step);
      } else {
        CartModule.decrement(itemKey, step);
      }
      updateAllCartUI();
    });
  });

  return div;
}

// ── Drawer mobile — abrir/fechar ───────────────────────────
function openDrawer() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('nav-cart-btn')?.setAttribute('aria-expanded', 'true');
  document.getElementById('cart-overlay')?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('nav-cart-btn')?.setAttribute('aria-expanded', 'false');
  document.getElementById('cart-overlay')?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nav-cart-btn')?.addEventListener('click', openDrawer);
  document.getElementById('floating-cart-btn')?.addEventListener('click', openDrawer);
  document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
  document.getElementById('cart-overlay')?.addEventListener('click', closeDrawer);

  document.getElementById('drawer-clear-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    if (btn.classList.contains('confirming')) {
      CartModule.clear();
      showToast('Carrinho esvaziado!', 'info');
      updateAllCartUI();
      btn.classList.remove('confirming');
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Esvaziar`;
    } else {
      btn.classList.add('confirming');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `Tem certeza?`;
      setTimeout(() => {
        if (btn.classList.contains('confirming')) {
          btn.classList.remove('confirming');
          btn.innerHTML = originalHtml;
        }
      }, 3000);
    }
  });
});

// ── Entrega toggle ─────────────────────────────────────────
function setupDeliveryToggle() {
  const opts = document.querySelectorAll('#delivery-opts input');
  const addrWrap = document.getElementById('delivery-addr-wrap');
  opts.forEach(opt => {
    opt.addEventListener('change', () => {
      if (addrWrap) addrWrap.style.display = opt.value === 'delivery' ? 'block' : 'none';
      document.querySelectorAll('#delivery-opts .pay-opt').forEach(l => {
        l.classList.toggle('selected', l.contains(opt) && opt.checked);
      });
      // Limpa erro do endereço se trocado para retirada
      if (opt.value === 'retirada') {
        clearFieldError('co-addr');
      }
    });
  });
}

// ── Pagamento toggle ───────────────────────────────────────
function setupPaymentToggle() {
  const opts = document.querySelectorAll('#pay-opts input');
  const pixBox = document.getElementById('pix-box');
  const helpText = document.getElementById('pay-help-text');
  const changeWrap = document.getElementById('change-wrap');

  opts.forEach(opt => {
    opt.addEventListener('change', () => {
      document.querySelectorAll('#pay-opts .pay-opt').forEach(l => {
        l.classList.toggle('selected', l.contains(opt) && opt.checked);
      });

      if (opt.value === 'pix') {
        if (pixBox) pixBox.style.display = 'flex';
        if (changeWrap) changeWrap.style.display = 'none';
        if (helpText) helpText.textContent = 'Efetue o PIX pela chave abaixo e anexe o comprovante na conversa do WhatsApp ao confirmar seu pedido.';
      } else if (opt.value === 'cartao') {
        if (pixBox) pixBox.style.display = 'none';
        if (changeWrap) changeWrap.style.display = 'none';
        if (helpText) helpText.textContent = 'O pagamento será realizado no balcão no momento da retirada ou na entrega (cartão de débito/crédito).';
      } else if (opt.value === 'dinheiro') {
        if (pixBox) pixBox.style.display = 'none';
        if (changeWrap) changeWrap.style.display = 'block';
        if (helpText) helpText.textContent = 'O pagamento em dinheiro será realizado no momento da entrega ou retirada no balcão.';
      }
    });
  });
}

// ── PIX copy ───────────────────────────────────────────────
function setupPixCopy() {
  const btn = document.getElementById('pix-copy');
  const keyEl = document.getElementById('pix-key');
  if (!btn || !keyEl) return;
  keyEl.textContent = CONFIG.pixKey;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.pixKey);
      btn.textContent = '✅ Copiado!';
      btn.style.background = 'var(--green-dark)';
      setTimeout(() => {
        btn.textContent = 'Copiar Chave';
        btn.style.background = 'var(--green)';
      }, 2500);
    } catch {
      showToast('Chave PIX: ' + CONFIG.pixKey, 'info');
    }
  });
}

// ── Máscara de Telefone ────────────────────────────────────
function setupPhoneMask() {
  const telInput = document.getElementById('co-tel');
  if (!telInput) return;

  telInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      e.target.value = `(${value}`;
    }
    clearFieldError('co-tel');
  });

  document.getElementById('co-nome')?.addEventListener('input', () => clearFieldError('co-nome'));
  document.getElementById('co-addr')?.addEventListener('input', () => clearFieldError('co-addr'));
}

// ── Persistência de Dados de Contato (localStorage) ────────
function saveUserData(data) {
  try {
    localStorage.setItem(CONFIG.storageUserKey, JSON.stringify(data));
  } catch (err) {
    console.warn('[app] Erro ao salvar dados do usuário:', err);
  }
}

function loadUserData() {
  try {
    const raw = localStorage.getItem(CONFIG.storageUserKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Checkout Modal ─────────────────────────────────────────
function openCheckout() {
  const items = CartModule.getItems();
  if (!items.length) {
    showToast('Adicione pelo menos 1 item ao pedido.', 'info');
    return;
  }

  // Preenche dados salvos no localStorage
  const savedUser = loadUserData();
  if (savedUser) {
    const nameEl = document.getElementById('co-nome');
    const telEl  = document.getElementById('co-tel');
    const addrEl = document.getElementById('co-addr');
    if (nameEl && savedUser.nome) nameEl.value = savedUser.nome;
    if (telEl && savedUser.tel) telEl.value = savedUser.tel;
    if (addrEl && savedUser.addr) addrEl.value = savedUser.addr;
  }

  // Resumo de Itens
  const summary = document.getElementById('order-summary');
  if (summary) {
    const rows = items.map(it => {
      const subtotal = formatBRL(it.qty * it.preco);
      const tipo = it.tipo_venda || it.tipo || 'unidade';
      const det = tipo === 'unidade'
        ? `${it.qty}x`
        : tipo === 'kg'
        ? `${String(it.qty).replace('.', ',')} kg`
        : `${it.qty} porção`;
      return `<div class="os-row"><span class="os-name">${det} ${it.nome}</span><span class="os-price">${subtotal}</span></div>`;
    }).join('');

    summary.innerHTML = rows + `
      <div class="os-row total">
        <span>Total dos Itens</span>
        <span>${formatBRL(CartModule.getTotal())}</span>
      </div>
    `;
  }

  const overlay = document.getElementById('checkout-overlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const overlay = document.getElementById('checkout-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('checkout-close')?.addEventListener('click', closeCheckout);
  document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkout-overlay') closeCheckout();
  });

  document.getElementById('checkout-confirm-btn')?.addEventListener('click', confirmOrder);
});

// ── Validação e Envio do Pedido ────────────────────────────
function clearFieldError(fieldId) {
  const group = document.getElementById(`group-${fieldId}`) || document.getElementById(fieldId)?.closest('.input-group');
  const errEl = document.getElementById(`err-${fieldId}`);
  if (group) group.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
}

function setFieldError(fieldId, message) {
  const group = document.getElementById(`group-${fieldId}`) || document.getElementById(fieldId)?.closest('.input-group');
  const errEl = document.getElementById(`err-${fieldId}`);
  if (group) group.classList.add('has-error');
  if (errEl) errEl.textContent = message;
}

function confirmOrder() {
  const nome  = document.getElementById('co-nome')?.value.trim();
  const tel   = document.getElementById('co-tel')?.value.trim();
  const delivery = document.querySelector('#delivery-opts input:checked')?.value;
  const addr  = document.getElementById('co-addr')?.value.trim();
  const pagto = document.querySelector('#pay-opts input:checked')?.value;
  const troco = document.getElementById('co-troco')?.value.trim();
  const obs   = document.getElementById('drawer-obs')?.value.trim();

  let hasError = false;

  if (!nome) {
    setFieldError('co-nome', 'Por favor, informe seu nome completo.');
    hasError = true;
  }

  const cleanTel = tel ? tel.replace(/\D/g, '') : '';
  if (!cleanTel || cleanTel.length < 10) {
    setFieldError('co-tel', 'Informe um número de WhatsApp válido com DDD.');
    hasError = true;
  }

  if (delivery === 'delivery' && !addr) {
    setFieldError('co-addr', 'Informe o endereço completo para entrega.');
    hasError = true;
  }

  if (hasError) {
    const firstErr = document.querySelector('.input-group.has-error input, .input-group.has-error textarea');
    if (firstErr) firstErr.focus();
    return;
  }

  // Salva dados no localStorage para agilizar compras futuras
  saveUserData({ nome, tel, addr });

  // Constrói payload formatado
  const msg = buildWhatsAppMessage({ nome, tel, delivery, addr, pagto, troco, obs });
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');

  closeCheckout();
  showToast('Redirecionando para o WhatsApp...', 'success');
}

function buildWhatsAppMessage({ nome, tel, delivery, addr, pagto, troco, obs }) {
  const items = CartModule.getItems();
  const total = CartModule.getTotal();

  const linhas = items.map(it => {
    const tipo = it.tipo_venda || it.tipo || 'unidade';
    const det = tipo === 'unidade'
      ? `${it.qty}x`
      : tipo === 'kg'
      ? `${String(it.qty).replace('.', ',')} kg`
      : `${it.qty} porção`;
    let line = `  • ${det} ${it.nome} — ${formatBRL(it.qty * it.preco)}`;
    if (it.obs) line += `\n    _Obs: ${it.obs}_`;
    return line;
  });

  const pagtoStr = { pix: 'PIX (Transferência)', cartao: 'Cartão (na entrega/retirada)', dinheiro: 'Dinheiro' }[pagto] || pagto;
  const entregaStr = delivery === 'delivery' ? `🛵 Delivery\n📍 *Endereço:* ${addr}` : '🚶‍♂️ Retirada no Local';

  let msg = `🍗 *NOVO PEDIDO — ASSADOS & CIA*\n`;
  msg += `----------------------------------\n`;
  msg += `👤 *Cliente:* ${nome}\n`;
  msg += `📞 *Contato:* ${tel}\n`;
  msg += `📦 *Tipo:* ${entregaStr}\n\n`;
  msg += `📋 *ITENS DO PEDIDO:*\n${linhas.join('\n')}\n\n`;
  msg += `----------------------------------\n`;
  msg += `💳 *Forma de Pagamento:* ${pagtoStr}\n`;
  if (pagto === 'dinheiro' && troco) {
    msg += `💵 *Troco:* ${troco}\n`;
  }
  msg += `💰 *TOTAL DOS ITENS:* ${formatBRL(total)}\n`;
  if (delivery === 'delivery') {
    msg += `ℹ️ _Taxa de entrega a confirmar via WhatsApp_\n`;
  }
  if (obs) {
    msg += `\n📝 *Observações Gerais:* ${obs}\n`;
  }
  msg += `----------------------------------\n`;
  if (!isStoreOpen) {
    msg += `⚠️ *Nota:* Pedido enviado fora do horário de funcionamento para agendamento.`;
  }

  return msg;
}

// ── Tecla Escape fecha modais/drawers (Acessibilidade) ─────
function setupKeyboardAccessibility() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQtyModal();
      closeCheckout();
      closeDrawer();
    }
  });
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3500) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  
  // Limpa toast anterior para evitar acúmulo poluindo a tela
  wrap.innerHTML = '';

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconHtml = type === 'success'
    ? `<div class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg></div>`
    : `<div class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>`;

  toast.innerHTML = `
    ${iconHtml}
    <span class="toast-msg">${msg}</span>
  `;

  wrap.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Formatação de moeda ────────────────────────────────────
function formatBRL(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}
