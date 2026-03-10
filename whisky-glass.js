/* ============================================
   VELMOND SPIRITS — Premium Crystal Glass
   Photorealistic image with scroll-linked
   fill animation (clip-path + glow)
   ============================================ */

(function () {
  'use strict';

  var section   = document.getElementById('experience');
  var filledImg = document.getElementById('whiskyGlassFilled');
  var glowEl    = document.getElementById('whiskyGlassGlow');
  var fillLabel = document.getElementById('fillPercent');
  var wrap      = document.getElementById('whiskyGlassWrap');
  if (!section || !filledImg) return;

  /* ─── Steps ─── */
  var steps = section.querySelectorAll('.whisky-step');

  /* ─── State ─── */
  var currentFill = 0;
  var targetFill  = 0;
  var rafId       = null;

  /* ─── Scroll handler ─── */
  function onScroll() {
    var rect = section.getBoundingClientRect();
    var scrollableHeight = rect.height - window.innerHeight;
    if (scrollableHeight <= 0) return;
    targetFill = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── Update steps ─── */
  function updateSteps() {
    for (var i = 0; i < steps.length; i++) {
      var s0 = i / steps.length;
      var s1 = (i + 1) / steps.length;
      var last = i === steps.length - 1;
      var on = (currentFill >= s0 && currentFill < s1) || (last && currentFill >= 0.97);
      if (on) steps[i].classList.add('active');
      else steps[i].classList.remove('active');
    }
  }

  /* ─── Animation loop ─── */
  function animate() {
    rafId = requestAnimationFrame(animate);

    // Check visibility
    var rect = section.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

    // Smooth interpolation
    currentFill += (targetFill - currentFill) * 0.08;

    // Clip-path: reveal filled image from bottom to top
    // inset(top right bottom left)
    // When fill=0: inset(100% 0 0 0) = fully clipped (hidden)
    // When fill=1: inset(0% 0 0 0)   = fully visible
    var topInset = 100 - (currentFill * 100);
    filledImg.style.clipPath = 'inset(' + topInset.toFixed(2) + '% 0 0 0)';

    // Ambient glow behind glass intensifies with fill
    if (glowEl) {
      glowEl.style.opacity = (currentFill * 0.9).toFixed(3);
    }

    // Subtle scale pulse when filling
    if (wrap) {
      var pulse = 1 + Math.sin(Date.now() * 0.001) * 0.003 * currentFill;
      wrap.style.transform = 'scale(' + pulse.toFixed(5) + ')';
    }

    // Fill percentage text
    if (fillLabel) {
      fillLabel.textContent = Math.round(currentFill * 100);
    }

    // Update steps
    updateSteps();
  }

  animate();
})();
