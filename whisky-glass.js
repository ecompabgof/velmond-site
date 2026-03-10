/* ============================================
   VELMOND SPIRITS — Three.js Whisky Glass
   Scroll-linked fill animation
   ============================================ */

(function () {
  'use strict';

  const section = document.getElementById('experience');
  const canvas = document.getElementById('whiskyCanvas');
  const fillLabel = document.getElementById('fillPercent');
  if (!section || !canvas) return;

  // ---- Scene ----
  const scene = new THREE.Scene();

  // ---- Camera ----
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 2.5, 7);
  camera.lookAt(0, 1.5, 0);

  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.localClippingEnabled = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Lighting ----
  scene.add(new THREE.AmbientLight(0xFFF5E6, 0.5));

  const keyLight = new THREE.DirectionalLight(0xFFF0D6, 1.0);
  keyLight.position.set(4, 6, 3);
  scene.add(keyLight);

  const fillLightScene = new THREE.DirectionalLight(0xD4E5FF, 0.3);
  fillLightScene.position.set(-4, 3, 2);
  scene.add(fillLightScene);

  const rimLight = new THREE.DirectionalLight(0xC8A46D, 0.6);
  rimLight.position.set(0, 4, -4);
  scene.add(rimLight);

  const glowLight = new THREE.PointLight(0xC8862A, 0.3, 8);
  glowLight.position.set(0, 0.5, 1.5);
  scene.add(glowLight);

  const specLight = new THREE.PointLight(0xFFFFFF, 0.3, 10);
  specLight.position.set(2, 4, 5);
  scene.add(specLight);

  // ---- Glass Group ----
  const glassGroup = new THREE.Group();
  scene.add(glassGroup);

  // ---- Glass Geometry (LatheGeometry) ----
  // Profile: rocks/tumbler glass cross-section
  const glassPoints = [
    new THREE.Vector2(0, 0),        // center bottom
    new THREE.Vector2(1.35, 0),     // outer base edge
    new THREE.Vector2(1.35, 0.2),   // outer base side
    new THREE.Vector2(1.4, 0.4),    // start of taper
    new THREE.Vector2(1.6, 3.2),    // outer wall top
    new THREE.Vector2(1.6, 3.38),   // rim outer top
    new THREE.Vector2(1.5, 3.38),   // rim inner top
    new THREE.Vector2(1.5, 3.2),    // inner wall top
    new THREE.Vector2(1.3, 0.55),   // inner wall bottom
    new THREE.Vector2(0, 0.55),     // center inner bottom (thick base)
  ];

  const glassGeo = new THREE.LatheGeometry(glassPoints, 64);
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.14,
    shininess: 300,
    specular: 0xFFFFFF,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  glassGroup.add(new THREE.Mesh(glassGeo, glassMat));

  // Rim highlight ring
  const rimGeo = new THREE.TorusGeometry(1.55, 0.035, 8, 64);
  const rimMat = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.4,
    shininess: 400,
    specular: 0xFFFFFF,
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.y = 3.29;
  rimMesh.rotation.x = Math.PI / 2;
  glassGroup.add(rimMesh);

  // ---- Liquid ----
  const LIQ_BOTTOM = 0.56;
  const LIQ_TOP = 3.15;
  const LIQ_RAD_BOT = 1.28;
  const LIQ_RAD_TOP = 1.48;
  const LIQ_RANGE = LIQ_TOP - LIQ_BOTTOM;

  const liquidPoints = [
    new THREE.Vector2(0, LIQ_BOTTOM),
    new THREE.Vector2(LIQ_RAD_BOT, LIQ_BOTTOM),
    new THREE.Vector2(LIQ_RAD_TOP, LIQ_TOP),
    new THREE.Vector2(0, LIQ_TOP),
  ];

  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), LIQ_BOTTOM);

  const liquidGeo = new THREE.LatheGeometry(liquidPoints, 64);
  const liquidMat = new THREE.MeshPhongMaterial({
    color: 0xB87A2A,
    transparent: true,
    opacity: 0.82,
    shininess: 120,
    specular: 0x886633,
    side: THREE.DoubleSide,
    clippingPlanes: [clipPlane],
  });
  glassGroup.add(new THREE.Mesh(liquidGeo, liquidMat));

  // Liquid surface disc
  const surfaceGeo = new THREE.CircleGeometry(LIQ_RAD_TOP, 64);
  const surfaceMat = new THREE.MeshPhongMaterial({
    color: 0xD4963A,
    transparent: true,
    opacity: 0.45,
    shininess: 200,
    specular: 0xFFCC88,
    side: THREE.DoubleSide,
  });
  const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
  surfaceMesh.rotation.x = -Math.PI / 2;
  surfaceMesh.position.y = LIQ_BOTTOM;
  surfaceMesh.visible = false;
  glassGroup.add(surfaceMesh);

  // ---- Table surface ----
  const tableGeo = new THREE.CylinderGeometry(4, 4, 0.08, 64);
  const tableMat = new THREE.MeshPhongMaterial({
    color: 0x1E160E,
    shininess: 60,
    specular: 0x443322,
  });
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.position.y = -0.04;
  scene.add(tableMesh);

  // ---- Golden Particles (vapor/spirit) ----
  const P_COUNT = 40;
  const pPos = new Float32Array(P_COUNT * 3);
  const pVel = [];

  for (let i = 0; i < P_COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 1.0;
    pPos[i * 3]     = Math.cos(a) * r;
    pPos[i * 3 + 1] = LIQ_BOTTOM + Math.random() * 2.5;
    pPos[i * 3 + 2] = Math.sin(a) * r;
    pVel.push({
      x: (Math.random() - 0.5) * 0.003,
      y: 0.006 + Math.random() * 0.012,
      z: (Math.random() - 0.5) * 0.003,
    });
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xC8A46D,
    size: 0.06,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(pGeo, pMat);
  particles.visible = false;
  glassGroup.add(particles);

  // ---- State ----
  let currentFill = 0;
  let targetFill = 0;
  let time = 0;

  function radiusAtY(y) {
    const t = (y - LIQ_BOTTOM) / LIQ_RANGE;
    return LIQ_RAD_BOT + t * (LIQ_RAD_TOP - LIQ_RAD_BOT);
  }

  // ---- Scroll ----
  function onScroll() {
    const rect = section.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return;
    targetFill = Math.max(0, Math.min(1, -rect.top / scrollable));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Step Text ----
  const steps = section.querySelectorAll('.whisky-step');

  function updateSteps() {
    steps.forEach(function (step, i) {
      var start = i / steps.length;
      var end = (i + 1) / steps.length;
      var isLast = i === steps.length - 1;
      var active = (currentFill >= start && currentFill < end) || (isLast && currentFill >= 0.97);
      if (active) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  // ---- Render Loop ----
  function animate() {
    requestAnimationFrame(animate);

    // Skip rendering when section is not visible
    var rect = section.getBoundingClientRect();
    if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;

    time += 0.016;

    // Smooth fill
    currentFill += (targetFill - currentFill) * 0.12;
    var fillY = LIQ_BOTTOM + currentFill * LIQ_RANGE;

    // Clipping plane
    clipPlane.constant = fillY;

    // Surface disc
    if (currentFill > 0.01) {
      surfaceMesh.visible = true;
      surfaceMesh.position.y = fillY;
      var r = radiusAtY(fillY);
      var s = r / LIQ_RAD_TOP;
      surfaceMesh.scale.set(s, s, 1);
    } else {
      surfaceMesh.visible = false;
    }

    // Fill label
    if (fillLabel) {
      fillLabel.textContent = Math.round(currentFill * 100);
    }

    // Gentle rotation
    glassGroup.rotation.y = Math.sin(time * 0.4) * 0.2;

    // Camera subtle movement
    camera.position.x = Math.sin(time * 0.25) * 0.3;
    camera.lookAt(0, 1.5, 0);

    // Particles
    if (currentFill > 0.03) {
      particles.visible = true;
      var arr = particles.geometry.attributes.position.array;
      for (var i = 0; i < P_COUNT; i++) {
        arr[i * 3]     += pVel[i].x;
        arr[i * 3 + 1] += pVel[i].y;
        arr[i * 3 + 2] += pVel[i].z;
        var py = arr[i * 3 + 1];
        var px = arr[i * 3];
        var pz = arr[i * 3 + 2];
        var dist = Math.sqrt(px * px + pz * pz);
        if (py > 4.5 || dist > 2.0) {
          var angle = Math.random() * Math.PI * 2;
          var rad = Math.random() * radiusAtY(fillY) * 0.6;
          arr[i * 3]     = Math.cos(angle) * rad;
          arr[i * 3 + 1] = fillY + Math.random() * 0.2;
          arr[i * 3 + 2] = Math.sin(angle) * rad;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
    } else {
      particles.visible = false;
    }

    // Warm glow intensity
    glowLight.intensity = 0.3 + currentFill * 0.5;

    updateSteps();
    renderer.render(scene, camera);
  }

  animate();
})();
