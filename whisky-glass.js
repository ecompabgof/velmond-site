/* ============================================
   VELMOND SPIRITS — Premium Crystal Glass
   Photorealistic image with scroll-linked
   fill animation (clip-path reveal)
   v3 — pixel-analyzed liquid zone
   ============================================ */

(function () {
  'use strict';

  var section   = document.getElementById('experience');
  var filledImg = document.getElementById('whiskyGlassFilled');
  var glowEl    = document.getElementById('whiskyGlassGlow');
  var fillLabel = document.getElementById('fillPercent');
  var wrap      = document.getElementById('whiskyGlassWrap');
  if (!section || !filledImg) return;

  /* ─── Pixel-analyzed liquid zone (% from top of image) ───
     Based on actual per-row pixel diff between glass-empty and glass-filled:
       25% = bottom of liquid zone (amber starts here)
       75% = top where liquid first appears when glass is nearly full
     The reveal goes from bottom to top: inset shrinks from 75% → 25%
     ─────────────────────────────────────────────────────── */
  var CLIP_START = 75;   // fill=0 → inset(75% 0 0 0) — hides all liquid
  var CLIP_END   = 25;   // fill=1 → inset(25% 0 0 0) — shows all liquid + ice

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
  // Force initial state
  currentFill = targetFill;

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

    // Skip if section not near viewport
    var rect = section.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

    // Smooth interpolation
    currentFill += (targetFill - currentFill) * 0.22;

    // Snap to extremes
    if (currentFill < 0.003) currentFill = 0;
    if (currentFill > 0.997) currentFill = 1;

    // Clip-path: reveal filled image from bottom to top
    // fill 0 → inset(75%) = only bottom 25% visible (identical base area)
    // fill 1 → inset(25%) = 75% visible = all liquid + ice + glass top
    var topInset = CLIP_START - (currentFill * (CLIP_START - CLIP_END));
    filledImg.style.clipPath = 'inset(' + topInset.toFixed(1) + '% 0 0 0)';

    // Ambient glow
    if (glowEl) {
      glowEl.style.opacity = (currentFill * 0.9).toFixed(3);
    }

    // Subtle scale pulse
    if (wrap) {
      var pulse = 1 + Math.sin(Date.now() * 0.001) * 0.003 * currentFill;
      wrap.style.transform = 'scale(' + pulse.toFixed(5) + ')';
    }

    // Fill percentage
    if (fillLabel) {
      fillLabel.textContent = Math.round(currentFill * 100);
    }

    updateSteps();
  }

  animate();
})();
