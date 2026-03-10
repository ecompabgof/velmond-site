/* ============================================
   VELMOND SPIRITS — Shared Components
   Navbar + Footer injected on every page
   ============================================ */

function getNavbar(currentPage) {
  return `
  <nav class="navbar scrolled-init" id="navbar">
    <div class="nav-inner">
      <a href="/" class="nav-logo">
        <span class="logo-text">VELMOND</span>
        <span class="logo-sub">— Spirits —</span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="navLinks">
        <li><a href="/" class="${currentPage === 'accueil' ? 'active' : ''}">Accueil</a></li>
        <li><a href="/maisons.html" class="${currentPage === 'maisons' ? 'active' : ''}">Les Maisons</a></li>
        <li><a href="/boutique.html" class="${currentPage === 'boutique' ? 'active' : ''}">Boutique</a></li>
        <li><a href="/contact.html" class="${currentPage === 'contact' ? 'active' : ''}">Contact</a></li>
      </ul>
    </div>
  </nav>`;
}

function getFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3 class="footer-logo">VELMOND</h3>
          <p class="footer-tagline"><em>Spirits</em></p>
          <p class="footer-desc">Maison française de spiritueux d'exception. Le goût, la maîtrise et le temps.</p>
          <div class="footer-social">
            <a href="https://instagram.com/velmondspirits.fr" target="_blank" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>
        <div class="footer-links">
          <h4>Navigation</h4>
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/maisons.html">Les Maisons</a></li>
            <li><a href="/boutique.html">Boutique</a></li>
            <li><a href="/contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Nos Maisons</h4>
          <ul>
            <li><a href="/maisons/la-grande-distillerie.html">La Grande Distillerie</a></li>
            <li><a href="/maisons/27-botanica.html">27 Botanica</a></li>
            <li><a href="/maisons/lorvain.html">Lorvain</a></li>
            <li><a href="/maisons/atelier-des-liqueurs.html">L'Atelier des Liqueurs</a></li>
            <li><a href="/maisons/le-spiritueux-patriote.html">Le Spiritueux Patriote</a></li>
            <li><a href="/maisons/heritage-1905.html">Héritage 1905</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Informations</h4>
          <ul>
            <li><a href="/legal/mentions-legales.html">Mentions légales</a></li>
            <li><a href="/legal/confidentialite.html">Politique de confidentialité</a></li>
            <li><a href="/legal/conditions-generales.html">Conditions générales</a></li>
            <li><a href="/legal/politique-retour.html">Politique de retour</a></li>
            <li><a href="/legal/livraison.html">Livraison</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-divider">
          <span class="ornament-line"></span>
          <span class="ornament-icon">◆</span>
          <span class="ornament-line"></span>
        </div>
        <p>© 2026 Velmond Spirits — Spiritueux artisanaux français</p>
        <p class="footer-warning">L'abus d'alcool est dangereux pour la santé. À consommer avec modération.</p>
      </div>
    </div>
  </footer>`;
}

function getAgeGate() {
  return `
  <div class="age-gate" id="ageGate">
    <div class="age-gate-inner">
      <div class="age-gate-ornament">◆</div>
      <h2>VELMOND</h2>
      <p class="age-gate-sub"><em>Spirits</em></p>
      <div class="age-gate-divider">
        <span class="ornament-line"></span>
        <span class="ornament-icon">❧</span>
        <span class="ornament-line"></span>
      </div>
      <p class="age-gate-question">Avez-vous l'âge légal pour<br>consommer de l'alcool ?</p>
      <div class="age-gate-buttons">
        <button class="age-btn age-yes" onclick="closeAgeGate()">Oui, j'ai plus de 18 ans</button>
        <button class="age-btn age-no" onclick="window.location.href='https://www.google.com'">Non</button>
      </div>
      <p class="age-gate-legal">L'abus d'alcool est dangereux pour la santé. À consommer avec modération.</p>
    </div>
  </div>`;
}

// Page head helper
function getHead(title, description, cssPath) {
  const css = cssPath || '/style.css';
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Velmond Spirits</title>
  <meta name="description" content="${description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Cinzel:wght@400;500;600;700&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${css}">`;
}
