/* ============================================
   VELMOND SPIRITS — Shopify Storefront Cart
   ============================================ */

const VelmondCart = (() => {
  const STORE_DOMAIN = 'sktqnk-iq.myshopify.com';
  const STOREFRONT_TOKEN = 'd938584dc4d7602ca3b1432f24a6d6ff';
  const API_VERSION = '2024-10';
  const API_URL = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

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

  // ---- GraphQL helper ----
  async function shopifyFetch(query, variables = {}) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) console.error('Shopify API Error:', json.errors);
    return json.data;
  }

  // ---- Cart Queries & Mutations ----
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
    cart = data.cartCreate.cart;
    cartId = cart.id;
    localStorage.setItem('velmond-cart-id', cartId);
    return cart;
  }

  async function fetchCart() {
    if (!cartId) return null;
    const data = await shopifyFetch(`
      query($id: ID!) {
        cart(id: $id) { ...CartFields }
      }
      ${CART_FRAGMENT}
    `, { id: cartId });
    if (!data.cart) {
      localStorage.removeItem('velmond-cart-id');
      cartId = null;
      return null;
    }
    cart = data.cart;
    return cart;
  }

  async function addToCart(variantId, quantity = 1) {
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
    cart = data.cartLinesAdd.cart;
    updateCartUI();
    openCart();
    return cart;
  }

  async function updateLineQuantity(lineId, quantity) {
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
    cart = data.cartLinesUpdate.cart;
    updateCartUI();
    return cart;
  }

  async function removeLine(lineId) {
    const data = await shopifyFetch(`
      mutation($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart { ...CartFields }
          userErrors { field message }
        }
      }
      ${CART_FRAGMENT}
    `, { cartId, lineIds: [lineId] });
    cart = data.cartLinesRemove.cart;
    updateCartUI();
    return cart;
  }

  // ---- UI ----
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
        return `
          <div class="cart-item">
            ${imgUrl ? `<img src="${imgUrl}" alt="${product.title}" class="cart-item-img">` : '<div class="cart-item-img-placeholder"></div>'}
            <div class="cart-item-info">
              <h4 class="cart-item-title">${product.title}</h4>
              <p class="cart-item-price">${price} €</p>
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
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  }

  // ---- Add to cart from product page ----
  function handleAddToCart(variantId, button) {
    if (!variantId) return;
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

  // ---- Init ----
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
    getCart: () => cart
  };
})();
