/* ============================================
   VELMOND SPIRITS — JavaScript Interactions
   ============================================ */

// ---------- AGE GATE + PORTAIL B2B/B2C ----------
function showGateStep2() {
  const step1 = document.getElementById('gateStep1');
  const step2 = document.getElementById('gateStep2');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';
  sessionStorage.setItem('velmond-age-verified', 'true');
}

function closeAgeGate() {
  const gate = document.getElementById('ageGate');
  if (gate) {
    gate.classList.add('hidden');
    document.body.style.overflow = '';
  }
  sessionStorage.setItem('velmond-age-verified', 'true');
  sessionStorage.setItem('velmond-path', 'btc');
}

document.addEventListener('DOMContentLoaded', () => {
  const gate = document.getElementById('ageGate');
  if (!gate) return;
  if (sessionStorage.getItem('velmond-age-verified') === 'true') {
    gate.classList.add('hidden');
  } else {
    document.body.style.overflow = 'hidden';
  }
});

// ---------- NAVBAR SCROLL ----------
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---------- MOBILE NAV TOGGLE ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// ---------- SCROLL REVEAL ----------
const revealElements = () => {
  const elements = document.querySelectorAll(
    '.section-badge, .section-title, .section-intro, ' +
    '.manifeste-divider, .manifeste-text, .value-card, ' +
    '.maison-card, .sf-item, .product-card, ' +
    '.big-quote, .newsletter-inner, .footer-grid'
  );

  elements.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add staggered delay for grid items
        const parent = entry.target.parentElement;
        if (parent) {
          const siblings = parent.querySelectorAll('.reveal');
          siblings.forEach((sib, i) => {
            if (sib === entry.target) {
              entry.target.style.transitionDelay = `${i * 0.1}s`;
            }
          });
        }
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
};

document.addEventListener('DOMContentLoaded', revealElements);

// ---------- SMOOTH SCROLL ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const pos = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
  });
});

// ---------- PARALLAX SUBTLE ON HERO ----------
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-content');
  if (hero && window.scrollY < window.innerHeight) {
    const rate = window.scrollY * 0.3;
    hero.style.transform = `translateY(${rate}px)`;
    hero.style.opacity = 1 - (window.scrollY / window.innerHeight) * 0.8;
  }
});

// ---------- ACTIVE NAV LINK ON SCROLL ----------
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});
