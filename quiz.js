/* ============================================================
   VELMOND SPIRITS — Quiz « Testez Votre Goût »
   Recommendation engine mapping taste preferences to products
   ============================================================ */

(function () {
  'use strict';

  // ── Google Sheet endpoint (replace with your deployed Apps Script URL) ──
  var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwF3XqhEhKrM_Q1gx6mM4A7Rr-6S1vAE_mQqWfppgbIFGzOQLXU8vEvwPODvFDXXUD7aw/exec';

  // ── Product database with flavor profile scores ──
  // Categories: fresh, woody, gourmet, herbal, bitter, fruity, intense, smooth
  const PRODUCTS = [
    { id: 'gin-francais', name: 'Gin Français', brand: 'Le Spiritueux Patriote', price: '34,90 €', img: '/images/gin-francais.png', url: '/produits/gin-francais.html', notes: 'Genièvre, agrumes, lavande', scores: { fresh: 9, woody: 1, gourmet: 1, herbal: 6, bitter: 2, fruity: 5, intense: 3, smooth: 6 } },
    { id: 'whisky-francais', name: 'Whisky Français 3 ans', brand: 'Le Spiritueux Patriote', price: '41,90 €', img: '/images/whisky-francais-3ans.png', url: '/produits/whisky-francais-3ans.html', notes: 'Vanille, chêne, fruits secs', scores: { fresh: 1, woody: 8, gourmet: 4, herbal: 2, bitter: 2, fruity: 4, intense: 5, smooth: 7 } },
    { id: 'pastis-patriote', name: 'Pastis Patriote', brand: 'Le Spiritueux Patriote', price: '23,90 €', img: '/images/pastis-patriote.png', url: '/produits/pastis-patriote.html', notes: 'Anis étoilé, réglisse, fenouil', scores: { fresh: 4, woody: 1, gourmet: 2, herbal: 9, bitter: 3, fruity: 2, intense: 4, smooth: 5 } },
    { id: 'vodka-france', name: 'Vodka de France', brand: 'Le Spiritueux Patriote', price: '28,90 €', img: '/images/vodka-france.png', url: '/produits/vodka-france.html', notes: 'Blé français, pureté cristalline', scores: { fresh: 7, woody: 0, gourmet: 1, herbal: 1, bitter: 1, fruity: 2, intense: 3, smooth: 9 } },

    { id: 'gin-signature', name: 'Gin Signature', brand: '27 Botanica', price: '36,00 €', img: '/images/gin-signature.png', url: '/produits/gin-signature.html', notes: '27 botaniques, genièvre, citron', scores: { fresh: 8, woody: 2, gourmet: 1, herbal: 8, bitter: 3, fruity: 5, intense: 4, smooth: 5 } },
    { id: 'gin-barrel-aged', name: 'Gin Barrel Aged', brand: '27 Botanica', price: '48,00 €', img: '/images/gin-barrel-aged.png', url: '/produits/gin-barrel-aged.html', notes: 'Chêne, vanille, épices douces', scores: { fresh: 3, woody: 8, gourmet: 3, herbal: 5, bitter: 2, fruity: 2, intense: 6, smooth: 6 } },
    { id: 'gin-citrus', name: 'Gin Citrus Edition', brand: '27 Botanica', price: '34,00 €', img: '/images/gin-citrus-edition.png', url: '/produits/gin-citrus-edition.html', notes: 'Agrumes de Méditerranée', scores: { fresh: 10, woody: 0, gourmet: 2, herbal: 4, bitter: 1, fruity: 8, intense: 2, smooth: 7 } },

    { id: 'single-malt-3', name: 'Single Malt 3 ans', brand: 'Lorvain', price: '52,00 €', img: '/images/single-malt-3ans.png', url: '/produits/single-malt-3ans.html', notes: 'Miel, fruits secs, tourbe légère', scores: { fresh: 1, woody: 7, gourmet: 3, herbal: 3, bitter: 3, fruity: 4, intense: 6, smooth: 5 } },
    { id: 'single-malt-5', name: 'Single Malt 5 ans', brand: 'Lorvain', price: '75,00 €', img: '/images/single-malt-5ans.png', url: '/produits/single-malt-5ans.html', notes: 'Chêne français, vanille, épices', scores: { fresh: 1, woody: 9, gourmet: 4, herbal: 3, bitter: 2, fruity: 3, intense: 7, smooth: 6 } },
    { id: 'blend-signature', name: 'Blend Signature', brand: 'Lorvain', price: '45,00 €', img: '/images/blend-signature.png', url: '/produits/blend-signature.html', notes: 'Équilibré, fruité, boisé', scores: { fresh: 3, woody: 6, gourmet: 3, herbal: 2, bitter: 2, fruity: 5, intense: 4, smooth: 7 } },
    { id: 'cask-strength', name: 'Cask Strength', brand: 'Lorvain', price: '95,00 €', img: '/images/cask-strength.png', url: '/produits/cask-strength.html', notes: 'Puissant, complexe, profond', scores: { fresh: 0, woody: 8, gourmet: 2, herbal: 3, bitter: 4, fruity: 2, intense: 10, smooth: 2 } },

    { id: 'liqueur-cafe', name: 'Liqueur Café', brand: "L'Atelier des Liqueurs", price: '28,00 €', img: '/images/liqueur-cafe.png', url: '/produits/liqueur-cafe.html', notes: 'Café torréfié, cacao, vanille', scores: { fresh: 1, woody: 2, gourmet: 10, herbal: 1, bitter: 4, fruity: 1, intense: 4, smooth: 8 } },
    { id: 'liqueur-chocolat', name: 'Liqueur Chocolat', brand: "L'Atelier des Liqueurs", price: '32,00 €', img: '/images/liqueur-chocolat.png', url: '/produits/liqueur-chocolat.html', notes: 'Chocolat noir, noisette', scores: { fresh: 0, woody: 2, gourmet: 10, herbal: 0, bitter: 3, fruity: 1, intense: 3, smooth: 9 } },
    { id: 'liqueur-noisette', name: 'Liqueur Noisette', brand: "L'Atelier des Liqueurs", price: '30,00 €', img: '/images/liqueur-noisette.png', url: '/produits/liqueur-noisette.html', notes: 'Noisette du Piémont, caramel', scores: { fresh: 1, woody: 2, gourmet: 9, herbal: 0, bitter: 1, fruity: 2, intense: 2, smooth: 10 } },
    { id: 'creme-cassis', name: 'Crème de Cassis', brand: "L'Atelier des Liqueurs", price: '26,00 €', img: '/images/creme-de-cassis.png', url: '/produits/creme-de-cassis.html', notes: 'Cassis de Bourgogne, fruits rouges', scores: { fresh: 4, woody: 0, gourmet: 7, herbal: 1, bitter: 1, fruity: 10, intense: 1, smooth: 9 } },

    { id: 'eau-de-vie', name: 'Eau-de-vie de Raisin', brand: 'La Grande Distillerie', price: '38,00 €', img: '/images/eau-de-vie-raisin.png', url: '/produits/eau-de-vie-raisin.html', notes: 'Raisin, fleurs blanches', scores: { fresh: 5, woody: 2, gourmet: 2, herbal: 3, bitter: 2, fruity: 7, intense: 5, smooth: 6 } },
    { id: 'marc-bourgogne', name: 'Marc de Bourgogne', brand: 'La Grande Distillerie', price: '42,00 €', img: '/images/marc-de-bourgogne.png', url: '/produits/marc-de-bourgogne.html', notes: 'Terroir, puissance, caractère', scores: { fresh: 1, woody: 5, gourmet: 1, herbal: 4, bitter: 4, fruity: 3, intense: 8, smooth: 3 } },
    { id: 'fine-france', name: 'Fine de France', brand: 'La Grande Distillerie', price: '55,00 €', img: '/images/fine-de-france.png', url: '/produits/fine-de-france.html', notes: 'Complexe, fruité, long en bouche', scores: { fresh: 2, woody: 6, gourmet: 3, herbal: 3, bitter: 2, fruity: 6, intense: 6, smooth: 7 } },
    { id: 'brandy-prestige', name: 'Brandy Prestige', brand: 'La Grande Distillerie', price: '68,00 €', img: '/images/brandy-prestige.png', url: '/produits/brandy-prestige.html', notes: 'Ambré, vanillé, soyeux', scores: { fresh: 1, woody: 7, gourmet: 5, herbal: 1, bitter: 1, fruity: 3, intense: 5, smooth: 9 } },

    { id: 'absinthe', name: 'Absinthe Traditionnelle', brand: 'Héritage 1905', price: '45,00 €', img: '/images/absinthe-traditionnelle.png', url: '/produits/absinthe-traditionnelle.html', notes: 'Absinthe, anis, fenouil sauvage', scores: { fresh: 3, woody: 1, gourmet: 1, herbal: 10, bitter: 5, fruity: 1, intense: 7, smooth: 3 } },
    { id: 'gentiane', name: 'Gentiane des Montagnes', brand: 'Héritage 1905', price: '28,00 €', img: '/images/gentiane-montagnes.png', url: '/produits/gentiane-montagnes.html', notes: 'Gentiane, amertume noble', scores: { fresh: 4, woody: 2, gourmet: 1, herbal: 7, bitter: 9, fruity: 2, intense: 5, smooth: 4 } },
    { id: 'elixir', name: 'Élixir de Chartreuse', brand: 'Héritage 1905', price: '52,00 €', img: '/images/elixir-chartreuse.png', url: '/produits/elixir-chartreuse.html', notes: '130 plantes, complexité infinie', scores: { fresh: 3, woody: 3, gourmet: 4, herbal: 10, bitter: 5, fruity: 2, intense: 8, smooth: 4 } },
    { id: 'bitter', name: 'Bitter Ancestral', brand: 'Héritage 1905', price: '35,00 €', img: '/images/bitter-ancestral.png', url: '/produits/bitter-ancestral.html', notes: 'Écorces, agrumes, épices', scores: { fresh: 4, woody: 2, gourmet: 1, herbal: 5, bitter: 10, fruity: 4, intense: 6, smooth: 3 } },
  ];

  // ── Quiz questions ──
  const QUESTIONS = [
    {
      title: 'Quel est votre univers ?',
      subtitle: 'Choisissez l\'ambiance qui vous inspire',
      options: [
        { label: 'Fraîcheur & Légèreté', emoji: '🌿', desc: 'Terrasses d\'été, brises marines', weights: { fresh: 4, fruity: 2, smooth: 2 } },
        { label: 'Chaleur & Boisé', emoji: '🪵', desc: 'Feu de cheminée, bibliothèque', weights: { woody: 4, intense: 2, smooth: 2 } },
        { label: 'Gourmandise', emoji: '🍫', desc: 'Desserts, douceurs, réconfort', weights: { gourmet: 4, smooth: 3, fruity: 1 } },
        { label: 'Caractère & Mystère', emoji: '🌑', desc: 'Herbes secrètes, recettes anciennes', weights: { herbal: 4, bitter: 2, intense: 2 } },
      ]
    },
    {
      title: 'Quelle saveur vous fait vibrer ?',
      subtitle: 'Écoutez votre palais',
      options: [
        { label: 'Agrumes & Fleurs', emoji: '🍋', desc: 'Citron, orange, jasmin, lavande', weights: { fresh: 3, fruity: 3, herbal: 1 } },
        { label: 'Vanille & Caramel', emoji: '🍯', desc: 'Douceur, rondeur, onctuosité', weights: { woody: 2, gourmet: 3, smooth: 3 } },
        { label: 'Épices & Fumée', emoji: '🔥', desc: 'Poivre, cannelle, tourbe', weights: { woody: 2, intense: 3, bitter: 1, herbal: 1 } },
        { label: 'Fruits & Baies', emoji: '🍇', desc: 'Cassis, raisin, fruits rouges', weights: { fruity: 4, gourmet: 2, smooth: 1 } },
      ]
    },
    {
      title: 'Quelle intensité préférez-vous ?',
      subtitle: 'De la caresse au frisson',
      options: [
        { label: 'Doux & Délicat', emoji: '🦢', desc: 'Subtil, aérien, tout en finesse', weights: { smooth: 4, fresh: 2, gourmet: 1 } },
        { label: 'Équilibré', emoji: '⚖️', desc: 'Harmonieux, rond, maîtrisé', weights: { smooth: 2, woody: 2, fruity: 2, fresh: 1 } },
        { label: 'Affirmé', emoji: '🏔️', desc: 'Présent, structuré, marqué', weights: { intense: 3, woody: 2, herbal: 1, bitter: 1 } },
        { label: 'Puissant', emoji: '⚡', desc: 'Sans concession, brut, profond', weights: { intense: 5, bitter: 2, herbal: 1 } },
      ]
    },
    {
      title: 'Comment dégustez-vous ?',
      subtitle: 'Votre rituel de dégustation',
      options: [
        { label: 'Pur, à température', emoji: '🥃', desc: 'La pureté du spiritueux', weights: { intense: 2, woody: 2, herbal: 1 } },
        { label: 'Sur glace', emoji: '🧊', desc: 'Rafraîchi, adouci, allongé', weights: { smooth: 2, fresh: 2, woody: 1 } },
        { label: 'En cocktail', emoji: '🍸', desc: 'Créatif, festif, mélangé', weights: { fresh: 3, fruity: 2, smooth: 1 } },
        { label: 'En digestif', emoji: '☕', desc: 'Après dîner, moment de calme', weights: { gourmet: 3, woody: 2, smooth: 1, herbal: 1 } },
      ]
    },
    {
      title: 'Quel moment de la journée ?',
      subtitle: 'Le temps idéal pour votre verre',
      options: [
        { label: 'L\'apéritif', emoji: '🌅', desc: 'En fin de journée, avant le repas', weights: { fresh: 2, herbal: 2, fruity: 1, bitter: 1 } },
        { label: 'Pendant le repas', emoji: '🍽️', desc: 'En accompagnement des saveurs', weights: { smooth: 2, fruity: 2, fresh: 1 } },
        { label: 'Le soir entre amis', emoji: '🌙', desc: 'Convivialité, partage, rires', weights: { smooth: 2, gourmet: 2, fresh: 1 } },
        { label: 'Seul, en contemplation', emoji: '📖', desc: 'Un moment pour soi, méditatif', weights: { intense: 2, woody: 2, herbal: 2 } },
      ]
    }
  ];

  let currentStep = 0;
  let userScores = { fresh: 0, woody: 0, gourmet: 0, herbal: 0, bitter: 0, fruity: 0, intense: 0, smooth: 0 };
  let captureData = {};       // prénom, nom, email, téléphone
  let userAnswers = [];       // label de chaque réponse choisie

  // ── Build the quiz modal HTML ──
  function createQuizHTML() {
    const overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.innerHTML = `
      <div class="quiz-modal">
        <button class="quiz-close" aria-label="Fermer">&times;</button>
        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width: 0%"></div>
        </div>
        <div class="quiz-content">
          <!-- Welcome screen -->
          <div class="quiz-step quiz-welcome active">
            <div class="quiz-welcome-icon">✦</div>
            <h2>Testez Votre Goût</h2>
            <p class="quiz-welcome-sub">5 questions pour découvrir le spiritueux qui vous correspond</p>
            <p class="quiz-welcome-desc">Chaque palais est unique. Laissez-nous vous guider vers la création Velmond faite pour vous.</p>
            <button class="quiz-start-btn">Commencer le test</button>
            <span class="quiz-time">⏱ 1 minute</span>
          </div>
          <!-- Lead capture form -->
          <div class="quiz-step quiz-capture">
            <div class="quiz-welcome-icon">✦</div>
            <h2>Avant de commencer</h2>
            <p class="quiz-welcome-desc">Recevez votre résultat personnalisé et nos meilleures recommandations</p>
            <form class="quiz-capture-form" id="quizCaptureForm">
              <div class="quiz-form-row">
                <div class="quiz-form-group">
                  <input type="text" name="prenom" placeholder="Prénom" required>
                </div>
                <div class="quiz-form-group">
                  <input type="text" name="nom" placeholder="Nom" required>
                </div>
              </div>
              <div class="quiz-form-group">
                <input type="email" name="email" placeholder="Votre e-mail" required>
                <span class="quiz-form-hint">Pour recevoir conseils & astuces</span>
              </div>
              <div class="quiz-form-group">
                <input type="tel" name="telephone" placeholder="Votre téléphone (optionnel)">
                <span class="quiz-form-hint">Pour recevoir les promos exclusives</span>
              </div>
              <button type="submit" class="quiz-start-btn">C'est parti !</button>
            </form>
          </div>
          <!-- Question steps (generated by JS) -->
          <!-- Result screen -->
          <div class="quiz-step quiz-result">
            <div class="quiz-result-badge">Votre recommandation</div>
            <a href="/boutique.html" class="quiz-result-card" id="quiz-result-link" style="text-decoration:none;color:inherit;display:block;">
              <div class="quiz-result-img"></div>
              <div class="quiz-result-info">
                <h3 class="quiz-result-name"></h3>
                <p class="quiz-result-brand"></p>
                <p class="quiz-result-notes"></p>
                <p class="quiz-result-price"></p>
              </div>
            </a>
            <p class="quiz-result-reason"></p>
            <div class="quiz-result-also">
              <p class="quiz-also-title">Vous aimerez aussi :</p>
              <div class="quiz-also-grid"></div>
            </div>
            <div class="quiz-result-actions">
              <a href="/boutique.html" class="quiz-btn-primary">Voir la Boutique</a>
              <button class="quiz-btn-secondary quiz-restart">Refaire le test</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  // ── Generate question step HTML ──
  function buildQuestionSteps() {
    const content = document.querySelector('.quiz-content');
    const resultStep = document.querySelector('.quiz-result');

    QUESTIONS.forEach((q, i) => {
      const step = document.createElement('div');
      step.className = 'quiz-step quiz-question';
      step.dataset.step = i;
      step.innerHTML = `
        <span class="quiz-step-num">Question ${i + 1} / ${QUESTIONS.length}</span>
        <h2>${q.title}</h2>
        <p class="quiz-subtitle">${q.subtitle}</p>
        <div class="quiz-options">
          ${q.options.map((opt, j) => `
            <button class="quiz-option" data-question="${i}" data-option="${j}">
              <span class="quiz-option-emoji">${opt.emoji}</span>
              <span class="quiz-option-label">${opt.label}</span>
              <span class="quiz-option-desc">${opt.desc}</span>
            </button>
          `).join('')}
        </div>
      `;
      content.insertBefore(step, resultStep);
    });
  }

  // ── Navigation ──
  function showStep(index) {
    document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
    const steps = document.querySelectorAll('.quiz-step');
    // 0 = welcome, 1 = capture form, 2..6 = questions, 7 = result
    const target = steps[index + 2]; // +2 because welcome=0, capture=1
    if (target) {
      target.classList.add('active');
      // Update progress bar
      const progress = Math.round((index / QUESTIONS.length) * 100);
      document.querySelector('.quiz-progress-bar').style.width = progress + '%';
    }
  }

  function showResult() {
    document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
    document.querySelector('.quiz-result').classList.add('active');
    document.querySelector('.quiz-progress-bar').style.width = '100%';

    // Calculate best match
    const ranked = PRODUCTS.map(p => {
      let score = 0;
      for (const key of Object.keys(userScores)) {
        score += (userScores[key] || 0) * (p.scores[key] || 0);
      }
      return { ...p, totalScore: score };
    }).sort((a, b) => b.totalScore - a.totalScore);

    const best = ranked[0];
    const alsoLike = ranked.slice(1, 4);

    // Populate result
    document.querySelector('#quiz-result-link').href = best.url;
    document.querySelector('.quiz-result-img').innerHTML = `<img src="${best.img}" alt="${best.name}">`;
    document.querySelector('.quiz-result-name').textContent = best.name;
    document.querySelector('.quiz-result-brand').textContent = best.brand;
    document.querySelector('.quiz-result-notes').innerHTML = `<em>${best.notes}</em>`;
    document.querySelector('.quiz-result-price').textContent = best.price;

    // Build reason text
    const topTraits = Object.entries(userScores).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const traitNames = {
      fresh: 'fraîcheur', woody: 'boisé', gourmet: 'gourmandise',
      herbal: 'herbacé', bitter: 'amertume', fruity: 'fruité',
      intense: 'intensité', smooth: 'douceur'
    };
    const traits = topTraits.map(t => traitNames[t[0]]).join(', ');
    document.querySelector('.quiz-result-reason').innerHTML =
      `Votre profil révèle une attirance pour <strong>${traits}</strong>. ${best.name} de la maison ${best.brand} est le match parfait pour votre palais.`;

    // ── Send everything to Google Sheet ──
    const topTraitsList = topTraits.map(t => traitNames[t[0]]);
    const sheetPayload = {
      prenom: captureData.prenom || '',
      nom: captureData.nom || '',
      email: captureData.email || '',
      telephone: captureData.telephone || '',
      reponses: userAnswers.join(' | '),
      profil: topTraitsList.join(', '),
      produit: best.name,
      marque: best.brand,
      source: 'quiz-velmond'
    };
    if (GOOGLE_SHEET_URL) {
      fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetPayload)
      }).catch(function () { /* silently fail */ });
    }

    // Also like
    const grid = document.querySelector('.quiz-also-grid');
    grid.innerHTML = alsoLike.map(p => `
      <a href="${p.url}" class="quiz-also-card" style="text-decoration:none;color:inherit;">
        <img src="${p.img}" alt="${p.name}">
        <span class="quiz-also-name">${p.name}</span>
        <span class="quiz-also-price">${p.price}</span>
      </a>
    `).join('');
  }

  // ── Event handlers ──
  function initEvents(overlay) {
    // Close
    overlay.querySelector('.quiz-close').addEventListener('click', () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Start → show capture form
    overlay.querySelector('.quiz-welcome .quiz-start-btn').addEventListener('click', () => {
      currentStep = 0;
      userScores = { fresh: 0, woody: 0, gourmet: 0, herbal: 0, bitter: 0, fruity: 0, intense: 0, smooth: 0 };
      document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
      document.querySelector('.quiz-capture').classList.add('active');
    });

    // Capture form submit → store data locally, then start quiz
    const captureForm = overlay.querySelector('#quizCaptureForm');
    if (captureForm) {
      captureForm.addEventListener('submit', function (e) {
        e.preventDefault();
        captureData = {
          prenom: captureForm.prenom.value.trim(),
          nom: captureForm.nom.value.trim(),
          email: captureForm.email.value.trim(),
          telephone: captureForm.telephone.value.trim()
        };
        userAnswers = [];
        // Start quiz questions
        showStep(0);
      });
    }

    // Option click
    overlay.addEventListener('click', (e) => {
      const btn = e.target.closest('.quiz-option');
      if (!btn) return;

      const qi = parseInt(btn.dataset.question);
      const oi = parseInt(btn.dataset.option);
      const chosen = QUESTIONS[qi].options[oi];
      const weights = chosen.weights;

      // Store answer label
      userAnswers[qi] = chosen.label;

      // Apply weights
      for (const [key, val] of Object.entries(weights)) {
        userScores[key] = (userScores[key] || 0) + val;
      }

      // Visual feedback
      btn.classList.add('selected');
      btn.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(o => {
        if (o !== btn) o.classList.add('dimmed');
      });

      // Next step after animation
      setTimeout(() => {
        currentStep++;
        if (currentStep >= QUESTIONS.length) {
          showResult();
        } else {
          showStep(currentStep);
        }
      }, 400);
    });

    // Restart
    overlay.addEventListener('click', (e) => {
      if (e.target.closest('.quiz-restart')) {
        currentStep = 0;
        userScores = { fresh: 0, woody: 0, gourmet: 0, herbal: 0, bitter: 0, fruity: 0, intense: 0, smooth: 0 };
        document.querySelectorAll('.quiz-option').forEach(o => {
          o.classList.remove('selected', 'dimmed');
        });
        document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
        document.querySelector('.quiz-welcome').classList.add('active');
        document.querySelector('.quiz-progress-bar').style.width = '0%';
      }
    });
  }

  // ── Public: open the quiz ──
  window.openVelmondQuiz = function () {
    const overlay = document.getElementById('quiz-overlay');
    if (overlay) {
      // Reset state
      currentStep = 0;
      userScores = { fresh: 0, woody: 0, gourmet: 0, herbal: 0, bitter: 0, fruity: 0, intense: 0, smooth: 0 };
      document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected', 'dimmed'));
      document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
      document.querySelector('.quiz-welcome').classList.add('active');
      document.querySelector('.quiz-progress-bar').style.width = '0%';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  // ── Init on DOM ready ──
  function init() {
    const overlay = createQuizHTML();
    buildQuestionSteps();
    initEvents(overlay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
