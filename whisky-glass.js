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

  /* ─── Liquid area in the image (% from top) ─── */
  var LIQUID_BOTTOM = 72; // where liquid starts (glass interior bottom)
  var LIQUID_TOP    = 28; // where ice/liquid surface reaches

  /* ─── Steps ─── */
  var steps = section.querySelectorAll('.whisky-step');

  /* ─── State ─── */
  var currentFill = 0;
  var targetFill  = 0;

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
    requestAnimationFrame(animate);

    // Check visibility
    var rect = section.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

    // Smooth interpolation (faster than before)
    currentFill += (targetFill - currentFill) * 0.18;

    // Snap to extremes to avoid infinite asymptotic creep
    if (currentFill < 0.005) currentFill = 0;
    if (currentFill > 0.995) currentFill = 1;

    // Clip-path: reveal only the liquid area of the filled image
    // Maps fill 0→1 to clip inset LIQUID_BOTTOM→LIQUID_TOP
    // At fill=0: inset(72%) — hides all liquid, glass base shows through from empty img
    // At fill=1: inset(28%) — full liquid + ice visible
    var topInset = LIQUID_BOTTOM - (currentFill * (LIQUID_BOTTOM - LIQUID_TOP));
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
