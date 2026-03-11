/**
 * Shopify Product Page Price Sync
 * Synchronise dynamiquement les prix des pages produits avec Shopify
 */
(function() {
  // Map: slug de la page produit → handle Shopify
  var handleMap = {
    'vodka-france': 'le-spiritueux-patriote-vodka-de-france',
    'gin-francais': 'le-spiritueux-patriote-gin-francais',
    'whisky-francais-3ans': 'le-spiritueux-patriote-whisky-francais-3-ans',
    'gin-signature': '27-botanica-gin-francais-botanique',
    'gin-barrel-aged': '27-botanica-gin-barrel-aged-ex-bourbon',
    'liqueur-cafe': 'latelier-des-liqueurs-cafe-cacao-epices',
    'pastis-patriote': 'le-spiritueux-patriote-pastis-patriote'
  };

  // Extraire le slug depuis l'URL
  var path = window.location.pathname;
  var match = path.match(/\/produits\/([^/.]+)/);
  if (!match) return;

  var slug = match[1];
  var shopifyHandle = handleMap[slug];

  // Si pas de mapping Shopify → produit en rupture
  if (!shopifyHandle) {
    showRupture();
    return;
  }

  // Fetch des données Shopify
  fetch('https://sktqnk-iq.myshopify.com/products.json?limit=50')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var products = data.products || [];
      var product = null;
      for (var i = 0; i < products.length; i++) {
        if (products[i].handle === shopifyHandle) {
          product = products[i];
          break;
        }
      }

      if (!product) {
        showRupture();
        return;
      }

      var variant = product.variants[0];
      var price = parseFloat(variant.price).toFixed(2).replace('.', ',') + ' €';

      // Mettre à jour le prix sur la page
      var priceEl = document.querySelector('.product-price-tag');
      if (priceEl) priceEl.textContent = price;

      // Vérifier disponibilité
      if (!variant.available) {
        showRupture();
      }
    })
    .catch(function() {
      console.log('Prix Shopify non disponibles');
    });

  function showRupture() {
    // Badge rupture sur l'image
    var heroImg = document.querySelector('.product-hero-img');
    if (heroImg) {
      heroImg.style.position = 'relative';
      var badge = document.createElement('div');
      badge.className = 'product-rupture-badge';
      badge.textContent = 'Rupture de stock';
      heroImg.appendChild(badge);
    }

    // Désactiver le bouton panier
    var cartBtn = document.querySelector('.add-to-cart-btn');
    if (cartBtn) {
      cartBtn.disabled = true;
      cartBtn.textContent = 'Indisponible';
      cartBtn.style.background = '#ccc';
      cartBtn.style.color = '#999';
      cartBtn.style.cursor = 'not-allowed';
      cartBtn.style.border = 'none';
    }

    // Barrer le prix
    var priceEl = document.querySelector('.product-price-tag');
    if (priceEl) {
      priceEl.style.textDecoration = 'line-through';
      priceEl.style.opacity = '0.5';
    }
  }
})();
