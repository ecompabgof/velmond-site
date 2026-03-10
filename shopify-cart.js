/* ============================================
   VELMOND SPIRITS — Shopify Storefront Cart
   ============================================ */

const VelmondCart = (() => {
  const STORE_DOMAIN = 'sktqnk-iq.myshopify.com';
  const STOREFRONT_TOKEN = 'd938584dc4d7602ca3b1432f24a6d6ff';
  const API_VERSION = '2024-10';
  const API_URL = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

  // ---- Site URL for redirects (auto-detect or fallback) ----
  const SITE_URL = window.location.origin;

  // ---- Product Mapping: site slug → Shopify variant ID ----
  const PRODUCT_MAP = {
    'gin-francais':         'gid://shopify/ProductVariant/55130705396097',
    'gin-barrel-aged':      'gid://shopify/ProductVariant/55129919095169',
    'gin-signature':        'gid://shopify/ProductVariant/55129896583553',
    'whisky-francais-3ans': 'gid://shopify/ProductVariant/55130702020993',
    'vodka-france':         'gid://shopify/ProductVariant/55130709754241',
    'pastis-patriote':      'gid://shopify/ProductVariant/55130712736129',
    'single-malt-3ans':     'gid://shopify/ProductVariant/55129948979585',
    'liqueur-cafe':         'gid://shopify/ProductVariant/55130750452097',
    'liqueur-chocolat':     'gid://shopify/ProductVariant/55130717716865',
    'creme-de-cassis':      'gid://shopify/ProductVariant/55130698383745',
    'liqueur-noisette':     'gid://shopify/ProductVariant/55130759266689',
  };

  let cartId = localStorage.getItem('velmond-cart-id') || null;
  let cart = null;

  // ============================================
  //  TOAST NOTIFICATION SYSTEM
  // ============================================
  function injectToastContainer() {
    if (document.getElementById('velmond-toast-container')) return;
    const container = document.createElement('div');
    container.id = 'velmond-toast-container';
    container.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 99999;
      display: flex; flex-direction: column; gap: 10px;
      pointer-events: none; max-width: 380px; width: calc(100% - 40px);
    `;
    document.body.appendChild(container);
  }

  function showToast(message, type = 'error') {
    injectToastContainer();
    const container = document.getElementById('velmond-toast-container');
    const toast = document.createElement('div');

    const colors = {
      error:   { bg: '#C0392B', icon: '✕' },
      success: { bg: '#2D7D46', icon: '✓' },
      warning: { bg: '#D4A017', icon: '⚠' },
      info:    { bg: '#4B2E20', icon: 'ℹ' },
    };
    const c = colors[type] || colors.info;

    toast.style.cssText = `
      pointer-events: auto;
      display: flex; align-items: center; gap: 12px;
      background: ${c.bg}; color: #F7F3EB;
      padding: 14px 20px; border-radius: 8px;
      font-family: 'Montserrat', sans-serif; font-size: 0.8rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    `;
    toast.innerHTML = `
      <span style="font-size:1.1rem;flex-shrink:0;">${c.icon}</span>
      <span style="flex:1;line-height:1.4;">${message}</span>
    `;
    toast.addEventListener('click', () => dismissToast(toast));
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    });

    // Auto dismiss after 5s
    setTimeout(() => dismissToast(toast), 5000);
  }

  function dismissToast(toast) {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 400);
  }

  // ============================================
  //  GraphQL helper with error handling
  // ============================================
  async function shopifyFetch(query, variables = {}) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query, variables })
      });

      if (!res.ok) {
        throw new Error(`Erreur réseau (${res.status})`);
      }

      const json = await res.json();

      if (json.errors) {
        console.error('Shopify API Error:', json.errors);
        const errorMsg = json.errors.map(e => e.message).join(', ');
        throw new Error(errorMsg);
      }

      return json.data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        showToast('Problème de connexion. Vérifiez votre connexion internet.', 'error');
      }
      throw err;
    }
  }

  // ---- Check for userErrors in mutations ----
  function handleUserErrors(userErrors, context = '') {
    if (!userErrors || userErrors.length === 0) return false;

    const messages = userErrors.map(e => e.message);
    console.error(`Shopify userErrors (${context}):`, messages);

    // Translate common Shopify errors to French
    for (const err of messages) {
      const lower = err.toLowerCase();
      if (lower.includes('inventory') || lower.includes('stock') || lower.includes('available')) {
        showToast('Ce produit n\'est plus en stock actuellement.', 'warning');
      } else if (lower.includes('not found') || lower.includes('does not exist')) {
        showToast('Ce produit n\'est plus disponible.', 'warning');
      } else if (lower.includes('quantity')) {
        showToast('La quantité demandée n\'est pas disponible.', 'warning');
      } else {
        showToast(`Erreur : ${err}`, 'error');
      }
    }
    return true;
  }

  // ============================================
  //  Cart Queries & Mutations
  // ============================================
  const CART_FRAGMENT = `
    fragment CartFields on Cart {
      id
      checkoutUrl
      totalQuantity
      cost {
        totalAmount { amount currencyCode }
        subtotalAmount { amount currencyCode }
      }
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount { amount currencyCode }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                availableForSale
                product {
                  title
                  handle
                  featuredImage { url altText }
                }
              }
            }
          }
        }
      }
    }
  `;

  async function createCart() {
    const data = await shopifyFetch(`
      mutation {
        cartCreate {
          cart { ...CartFields }
          userErrors { field message }
        }
      }
      ${CART_FRAGMENT}
    `);

    if (handleUserErrors(data.cartCreate?.userErrors, 'cartCreate')) {
      throw new Error('Cart creation failed');
    }

    cart = data.cartCreate.cart;
    cartId = cart.id;
    localStorage.setItem('velmond-cart-id', cartId);
    return cart;
  }

  async function fetchCart() {
    if (!cartId) return null;
    try {
      const data = await shopifyFetch(`
        query($id: ID!) {
          cart(id: $id) { ...CartFields }
        }
        ${CART_FRAGMENT}
      `, { id: cartId });

      if (!data.cart) {
        // Cart expired or invalid — silently reset
        localStorage.removeItem('velmond-cart-id');
        cartId = null;
        return null;
      }
      cart = data.cart;
      return cart;
    } catch (err) {
      // Cart fetch failed — reset and continue silently
      localStorage.removeItem('velmond-cart-id');
      cartId = null;
      return null;
    }
  }

  async function addToCart(variantId, quantity = 1) {
    try {
      if (!cartId) await createCart();
      const data = await shopifyFetch(`
        mutation($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart { ...CartFields }
            userErrors { field message }
          }
        }
        ${CART_FRAGMENT}
      `, {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }]
      });

      if (handleUserErrors(data.cartLinesAdd?.userErrors, 'cartLinesAdd')) {
        // Still update cart if partial success
        if (data.cartLinesAdd?.cart) {
          cart = data.cartLinesAdd.cart;
          updateCartUI();
        }
        return cart;
      }

      cart = data.cartLinesAdd.cart;
      updateCartUI();
      openCart();
      showToast('Produit ajouté au panier !', 'success');
      return cart;
    } catch (err) {
      showToast('Impossible d\'ajouter ce produit. Réessayez.', 'error');
      throw err;
    }
  }

  async function updateLineQuantity(lineId, quantity) {
    if (quantity <= 0) {
      return removeLine(lineId);
    }
    try {
      const data = await shopifyFetch(`
        mutation($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
          cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart { ...CartFields }
            userErrors { field message }
          }
        }
        ${CART_FRAGMENT}
      `, {
        cartId,
        lines: [{ id: lineId, quantity }]
      });

      if (handleUserErrors(data.cartLinesUpdate?.userErrors, 'cartLinesUpdate')) {
        if (data.cartLinesUpdate?.cart) {
          cart = data.cartLinesUpdate.cart;
          updateCartUI();
        }
        return cart;
      }

      cart = data.cartLinesUpdate.cart;
      updateCartUI();
      return cart;
    } catch (err) {
      showToast('Impossible de modifier la quantité. Réessayez.', 'error');
      throw err;
    }
  }

  async function removeLine(lineId) {
    try {
      const data = await shopifyFetch(`
        mutation($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart { ...CartFields }
            userErrors { field message }
          }
        }
        ${CART_FRAGMENT}
      `, { cartId, lineIds: [lineId] });

      handleUserErrors(data.cartLinesRemove?.userErrors, 'cartLinesRemove');

      cart = data.cartLinesRemove.cart;
      updateCartUI();
      return cart;
    } catch (err) {
      showToast('Impossible de supprimer cet article. Réessayez.', 'error');
      throw err;
    }
  }

  // ============================================
  //  UI — Cart Drawer
  // ============================================
  function injectCartHTML() {
    // Cart icon in navbar
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.getElementById('cart-nav-btn')) {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="#" id="cart-nav-btn" class="cart-nav-btn" onclick="VelmondCart.toggle(); return false;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span class="cart-count" id="cart-count">0</span>
        </a>
      `;
      navLinks.appendChild(li);
    }

    // Slide-out cart panel
    if (!document.getElementById('cart-drawer')) {
      const drawer = document.createElement('div');
      drawer.id = 'cart-drawer';
      drawer.className = 'cart-drawer';
      drawer.innerHTML = `
        <div class="cart-drawer-overlay" onclick="VelmondCart.close()"></div>
        <div class="cart-drawer-panel">
          <div class="cart-drawer-header">
            <h3>Votre Panier</h3>
            <button class="cart-drawer-close" onclick="VelmondCart.close()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="cart-drawer-body" id="cart-drawer-body">
            <div class="cart-empty">
              <p>Votre panier est vide</p>
              <a href="/boutique.html" class="cart-continue-btn">Découvrir nos spiritueux</a>
            </div>
          </div>
          <div class="cart-drawer-footer" id="cart-drawer-footer" style="display:none;">
            <div class="cart-subtotal">
              <span>Sous-total</span>
              <span id="cart-subtotal-amount">0,00 €</span>
            </div>
            <button class="cart-checkout-btn" id="cart-checkout-btn" onclick="VelmondCart.checkout()">
              Commander
            </button>
            <p class="cart-shipping-note">Livraison calculée à l'étape suivante</p>
          </div>
        </div>
      `;
      document.body.appendChild(drawer);
    }
  }

  function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const bodyEl = document.getElementById('cart-drawer-body');
    const footerEl = document.getElementById('cart-drawer-footer');
    const subtotalEl = document.getElementById('cart-subtotal-amount');

    if (!cart || !cart.lines.edges.length) {
      if (countEl) countEl.textContent = '0';
      if (countEl) countEl.style.display = 'none';
      if (bodyEl) bodyEl.innerHTML = `
        <div class="cart-empty">
          <p>Votre panier est vide</p>
          <a href="/boutique.html" class="cart-continue-btn">Découvrir nos spiritueux</a>
        </div>
      `;
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    const totalQty = cart.totalQuantity;
    if (countEl) {
      countEl.textContent = totalQty;
      countEl.style.display = totalQty > 0 ? 'flex' : 'none';
    }

    if (bodyEl) {
      bodyEl.innerHTML = cart.lines.edges.map(({ node: line }) => {
        const variant = line.merchandise;
        const product = variant.product;
        const imgUrl = product.featuredImage?.url || '';
        const price = parseFloat(variant.price.amount).toFixed(2).replace('.', ',');
        const lineTotal = parseFloat(line.cost.totalAmount.amount).toFixed(2).replace('.', ',');
        const outOfStock = variant.availableForSale === false;

        return `
          <div class="cart-item ${outOfStock ? 'cart-item-unavailable' : ''}">
            ${imgUrl ? `<img src="${imgUrl}" alt="${product.title}" class="cart-item-img">` : '<div class="cart-item-img-placeholder"></div>'}
            <div class="cart-item-info">
              <h4 class="cart-item-title">${product.title}</h4>
              <p class="cart-item-price">${price} €</p>
              ${outOfStock ? '<p class="cart-item-stock-warning">Rupture de stock</p>' : ''}
              <div class="cart-item-qty">
                <button class="cart-qty-btn" onclick="VelmondCart.updateQty('${line.id}', ${line.quantity - 1})">−</button>
                <span>${line.quantity}</span>
                <button class="cart-qty-btn" onclick="VelmondCart.updateQty('${line.id}', ${line.quantity + 1})">+</button>
              </div>
            </div>
            <div class="cart-item-right">
              <span class="cart-item-total">${lineTotal} €</span>
              <button class="cart-item-remove" onclick="VelmondCart.remove('${line.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    if (footerEl) {
      footerEl.style.display = 'block';
      const subtotal = parseFloat(cart.cost.subtotalAmount.amount).toFixed(2).replace('.', ',');
      if (subtotalEl) subtotalEl.textContent = `${subtotal} €`;

      // Disable checkout if any item is out of stock
      const checkoutBtn = document.getElementById('cart-checkout-btn');
      const hasUnavailable = cart.lines.edges.some(({ node }) => node.merchandise.availableForSale === false);
      if (checkoutBtn) {
        if (hasUnavailable) {
          checkoutBtn.disabled = true;
          checkoutBtn.style.opacity = '0.5';
          checkoutBtn.style.cursor = 'not-allowed';
          checkoutBtn.textContent = 'Certains produits sont indisponibles';
        } else {
          checkoutBtn.disabled = false;
          checkoutBtn.style.opacity = '1';
          checkoutBtn.style.cursor = 'pointer';
          checkoutBtn.textContent = 'Commander';
        }
      }
    }
  }

  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer?.classList.contains('open')) closeCart();
    else openCart();
  }

  function checkout() {
    if (!cart?.checkoutUrl) {
      showToast('Votre panier est vide.', 'warning');
      return;
    }

    // Check for unavailable items before checkout
    const hasUnavailable = cart.lines.edges.some(({ node }) => node.merchandise.availableForSale === false);
    if (hasUnavailable) {
      showToast('Veuillez retirer les produits en rupture de stock avant de commander.', 'warning');
      return;
    }

    // Redirect to Shopify checkout
    // Shopify will handle payment, then redirect to our confirmation page
    // (configured in Shopify Admin > Settings > Checkout)
    window.location.href = cart.checkoutUrl;
  }

  // ============================================
  //  Add to cart handlers
  // ============================================
  function handleAddToCart(variantId, button) {
    if (!variantId) {
      showToast('Ce produit n\'est pas encore disponible.', 'info');
      return;
    }
    button.classList.add('loading');
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span> Ajout...';

    addToCart(variantId).then(() => {
      button.innerHTML = '✓ Ajouté';
      button.classList.remove('loading');
      button.classList.add('added');
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('added');
        button.disabled = false;
      }, 2000);
    }).catch(() => {
      button.innerHTML = originalText;
      button.classList.remove('loading');
      button.disabled = false;
    });
  }

  // ---- Get variant ID from slug ----
  function getVariantId(slug) {
    return PRODUCT_MAP[slug] || null;
  }

  // ---- Auto-bind add-to-cart buttons ----
  function bindAddToCartButtons() {
    document.querySelectorAll('[data-variant-id]').forEach(btn => {
      const variantId = btn.getAttribute('data-variant-id');
      if (variantId) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddToCart(variantId, btn);
        });
      }
    });
    // Auto-detect product page slug and bind
    document.querySelectorAll('[data-product-slug]').forEach(btn => {
      const slug = btn.getAttribute('data-product-slug');
      const variantId = getVariantId(slug);
      if (variantId) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddToCart(variantId, btn);
        });
      } else {
        btn.disabled = true;
        btn.textContent = 'Bientôt disponible';
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }
    });
  }

  // ---- Inject add-to-cart on boutique cards ----
  function injectBoutiqueCartButtons() {
    document.querySelectorAll('.product-card[data-href]').forEach(card => {
      const href = card.getAttribute('data-href');
      // Extract slug from href like /produits/gin-francais.html
      const match = href.match(/\/produits\/(.+)\.html/);
      if (!match) return;
      const slug = match[1];
      const variantId = getVariantId(slug);
      if (!variantId) return;

      const footer = card.querySelector('.product-footer');
      if (!footer || footer.querySelector('.product-card-cart-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'product-card-cart-btn';
      btn.textContent = '+ Panier';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.disabled = true;
        btn.textContent = '...';
        addToCart(variantId).then(() => {
          btn.textContent = '✓';
          btn.classList.add('added');
          setTimeout(() => {
            btn.textContent = '+ Panier';
            btn.classList.remove('added');
            btn.disabled = false;
          }, 2000);
        }).catch(() => {
          btn.textContent = '+ Panier';
          btn.disabled = false;
        });
      });
      footer.appendChild(btn);
    });
  }

  // ============================================
  //  Init
  // ============================================
  async function init() {
    injectCartHTML();
    bindAddToCartButtons();
    injectBoutiqueCartButtons();
    if (cartId) {
      await fetchCart();
      updateCartUI();
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    add: addToCart,
    remove: removeLine,
    updateQty: updateLineQuantity,
    open: openCart,
    close: closeCart,
    toggle: toggleCart,
    checkout,
    handleAdd: handleAddToCart,
    getVariant: getVariantId,
    productMap: PRODUCT_MAP,
    getCart: () => cart,
    showToast,
  };
})();
