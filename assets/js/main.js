/**
 * IRONCORE RECYCLING — MAIN.JS (ES6)
 * Shared interactive logic for all 8 pages
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. THEME TOGGLE (DARK / LIGHT) — PERSISTED IN LOCALSTORAGE
     ------------------------------------------------------------------------ */
  const rootEl = document.documentElement;
  const savedTheme = localStorage.getItem('ic_theme') || 'light';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    rootEl.setAttribute('data-theme', theme);
    localStorage.setItem('ic_theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
      }
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Light Mode' : 'Dark Mode');
    });
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextTheme = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  });

  /* ------------------------------------------------------------------------
     2. RTL / LTR DIRECTION TOGGLE — PERSISTED IN LOCALSTORAGE
     ------------------------------------------------------------------------ */
  const savedDir = localStorage.getItem('ic_dir') || 'ltr';
  applyDirection(savedDir);

  function applyDirection(dir) {
    rootEl.setAttribute('dir', dir);
    localStorage.setItem('ic_dir', dir);
    const bsLink = document.getElementById('bootstrap-css');
    if (bsLink) {
      bsLink.href = dir === 'rtl'
        ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css'
        : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    }
    document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
      btn.classList.toggle('text-orange', dir === 'rtl');
      btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to Left-to-Right' : 'Switch to Right-to-Left');
      btn.setAttribute('title', dir === 'rtl' ? 'LTR Mode' : 'RTL Mode');
    });
  }

  document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextDir = rootEl.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(nextDir);
    });
  });

  /* ------------------------------------------------------------------------
     3. STICKY HEADER & BACK TO TOP
     ------------------------------------------------------------------------ */
  const navbar = document.querySelector('.ic-navbar');
  const backToTopBtn = document.getElementById('backToTop');

  function handleScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (navbar) {
      if (y > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    if (backToTopBtn) {
      if (y > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }

    // Subtle Hero Parallax
    if (!prefersReducedMotion) {
      const parallaxEl = document.querySelector('.hero-bg-layer');
      if (parallaxEl && y < window.innerHeight * 1.2) {
        parallaxEl.style.transform = `translateY(${y * 0.18}px) scale(1.04)`;
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     4. INTERSECTION OBSERVER — SCROLL REVEALS & COUNTERS
     ------------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  // Animated Number Counters
  const counters = document.querySelectorAll('[data-counter]');
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (prefersReducedMotion) {
      el.innerHTML = `${target.toLocaleString()}<span>${suffix}</span>`;
      return;
    }
    const duration = 1400;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.innerHTML = `${current.toLocaleString()}<span>${suffix}</span>`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.innerHTML = `${target.toLocaleString()}<span>${suffix}</span>`;
      }
    }
    requestAnimationFrame(tick);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    counters.forEach(c => counterObs.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ------------------------------------------------------------------------
     5. HOME 1 — INTERACTIVE DIAGONAL SERVICES SWITCHER
     ------------------------------------------------------------------------ */
  const diagCards = document.querySelectorAll('[data-diag-service]');
  const diagFeatureImg = document.getElementById('diagFeatureImg');
  const diagFeatureTitle = document.getElementById('diagFeatureTitle');
  const diagFeatureDesc = document.getElementById('diagFeatureDesc');
  const diagFeatureTag = document.getElementById('diagFeatureTag');

  if (diagCards.length && diagFeatureImg) {
    diagCards.forEach(card => {
      card.addEventListener('click', () => {
        diagCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        diagFeatureImg.src = card.getAttribute('data-img');
        diagFeatureTitle.textContent = card.getAttribute('data-title');
        diagFeatureDesc.textContent = card.getAttribute('data-desc');
        if (diagFeatureTag) diagFeatureTag.textContent = card.getAttribute('data-tag');
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. HOME 2 — CIRCULAR ORBIT INTERACTIVE MATERIAL SELECTOR
     ------------------------------------------------------------------------ */
  const orbitNodes = document.querySelectorAll('.orbit-node[data-orbit-name]');
  const orbitCenterImg = document.getElementById('orbitCenterImg');
  const orbitTitle = document.getElementById('orbitSelectedTitle');
  const orbitDesc = document.getElementById('orbitSelectedDesc');
  const orbitSpecs = document.getElementById('orbitSelectedSpecs');

  if (orbitNodes.length && orbitCenterImg) {
    orbitNodes.forEach(node => {
      const activate = () => {
        orbitNodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        orbitCenterImg.src = node.getAttribute('data-orbit-img');
        if (orbitTitle) orbitTitle.textContent = node.getAttribute('data-orbit-name');
        if (orbitDesc) orbitDesc.textContent = node.getAttribute('data-orbit-desc');
        if (orbitSpecs) orbitSpecs.textContent = node.getAttribute('data-orbit-specs');
      };
      node.addEventListener('mouseenter', activate);
      node.addEventListener('click', activate);
    });
  }

  /* ------------------------------------------------------------------------
     7. SERVICES PAGE — VERTICAL TAB PORTFOLIO
     ------------------------------------------------------------------------ */
  const serviceTabBtns = document.querySelectorAll('.service-tab-btn[data-srv-title]');
  const srvDisplayImg = document.getElementById('srvDisplayImg');
  const srvDisplayTitle = document.getElementById('srvDisplayTitle');
  const srvDisplayDesc = document.getElementById('srvDisplayDesc');
  const srvDisplayList = document.getElementById('srvDisplayList');

  if (serviceTabBtns.length && srvDisplayImg) {
    serviceTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        serviceTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        srvDisplayImg.style.opacity = '0.35';
        setTimeout(() => {
          srvDisplayImg.src = btn.getAttribute('data-srv-img');
          srvDisplayImg.alt = btn.getAttribute('data-srv-title');
          srvDisplayTitle.textContent = btn.getAttribute('data-srv-title');
          srvDisplayDesc.textContent = btn.getAttribute('data-srv-desc');

          const features = (btn.getAttribute('data-srv-features') || '').split('|').filter(Boolean);
          if (srvDisplayList) {
            srvDisplayList.innerHTML = features.map(f =>
              `<li class="mb-2"><i class="bi bi-check2-circle text-orange me-2"></i>${f.trim()}</li>`
            ).join('');
          }
          srvDisplayImg.style.opacity = '1';
        }, 150);
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. RATE CARD — CATEGORY FILTER
     ------------------------------------------------------------------------ */
  const rateFilterBtns = document.querySelectorAll('[data-rate-filter]');
  const rateRows = document.querySelectorAll('#rateTableBody tr[data-category]');

  if (rateFilterBtns.length && rateRows.length) {
    rateFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        rateFilterBtns.forEach(b => {
          b.classList.remove('btn-orange');
          b.classList.add('btn-outline-theme');
        });
        btn.classList.remove('btn-outline-theme');
        btn.classList.add('btn-orange');

        const filter = btn.getAttribute('data-rate-filter');
        rateRows.forEach(row => {
          const cat = row.getAttribute('data-category');
          row.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. CONTACT PAGE — PICKUP ENQUIRY FORM VALIDATION & WHATSAPP DEMO
     ------------------------------------------------------------------------ */
  const pickupForm = document.getElementById('pickupEnquiryForm');
  const formAlert = document.getElementById('formSubmissionAlert');
  const whatsappBtn = document.getElementById('whatsappDirectBtn');

  if (pickupForm) {
    pickupForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!pickupForm.checkValidity()) {
        e.stopPropagation();
        pickupForm.classList.add('was-validated');
        return;
      }

      const name = document.getElementById('fullName')?.value.trim();
      const material = document.getElementById('materialType')?.value;
      const qty = document.getElementById('approxQty')?.value.trim();
      const location = document.getElementById('pickupLocation')?.value.trim();

      if (formAlert) {
        formAlert.classList.remove('d-none');
        formAlert.innerHTML = `
          <div class="d-flex align-items-start gap-3">
            <i class="bi bi-check-circle-fill text-orange fs-4"></i>
            <div>
              <h6 class="mb-1 fw-bold">Enquiry Prepared (Front-End Demo)</h6>
              <p class="mb-2 small">Thank you, <strong>${escapeHtml(name)}</strong>. Your pickup request for <strong>${escapeHtml(qty)}</strong> of <strong>${escapeHtml(material)}</strong> at <strong>${escapeHtml(location)}</strong> has been validated locally. No backend server is connected; use the WhatsApp dispatch button below to send directly to our yard desk.</p>
            </div>
          </div>`;
      }
      pickupForm.classList.add('was-validated');
    });
  }

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const businessPhone = '15550192834'; // Editable placeholder WhatsApp number
      const name = document.getElementById('fullName')?.value.trim() || 'Client';
      const material = document.getElementById('materialType')?.value || 'Mixed Metal Scrap';
      const qty = document.getElementById('approxQty')?.value.trim() || 'TBD';
      const location = document.getElementById('pickupLocation')?.value.trim() || 'TBD';
      const text = encodeURIComponent(
        `Hello IronCore Yard Desk, I would like a scrap pickup quote.\nName: ${name}\nMaterial: ${material}\nApprox. Qty: ${qty}\nLocation: ${location}`
      );
      window.open(`https://wa.me/${businessPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  /* ------------------------------------------------------------------------
     10. MATERIALS PAGE — INTERACTIVE HONEYCOMB HEXAGON PREVIEW
     ------------------------------------------------------------------------ */
  const hexTiles = document.querySelectorAll('.hex-tile[data-hex-name]');
  const hexCat = document.getElementById('hexPreviewCat');
  const hexTitle = document.getElementById('hexPreviewTitle');
  const hexDesc = document.getElementById('hexPreviewDesc');
  const hexExamples = document.getElementById('hexPreviewExamples');

  if (hexTiles.length && hexTitle) {
    hexTiles.forEach(tile => {
      const activateHex = () => {
        hexTiles.forEach(t => t.classList.remove('active'));
        tile.classList.add('active');
        if (hexCat) hexCat.textContent = tile.getAttribute('data-hex-cat');
        hexTitle.textContent = tile.getAttribute('data-hex-name');
        if (hexDesc) hexDesc.textContent = tile.getAttribute('data-hex-desc');
        if (hexExamples) hexExamples.textContent = tile.getAttribute('data-hex-examples');
      };
      tile.addEventListener('mouseenter', activateHex);
      tile.addEventListener('click', activateHex);
    });
  }

  /* ------------------------------------------------------------------------
     10. TABLET S-CURVE EXACT NODE-CENTER ALIGNMENT
     ------------------------------------------------------------------------ */
  function updateTabletScurve() {
    const svg = document.querySelector('.scurve-svg-tablet');
    const pathEl = document.getElementById('tabletScurvePath');
    const wrapper = document.querySelector('.scurve-wrapper');
    if (!svg || !pathEl || !wrapper) return;
    if (window.innerWidth < 768 || window.innerWidth >= 992) return;

    const nodes = wrapper.querySelectorAll('.scurve-node');
    if (nodes.length < 6) return;

    const wRect = wrapper.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${wRect.width} ${wRect.height}`);

    const pts = Array.from(nodes).map(n => {
      const r = n.getBoundingClientRect();
      return {
        x: r.left - wRect.left + r.width / 2,
        y: r.top - wRect.top + r.height / 2
      };
    });

    const d = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} ` +
              `C ${pts[1].x + 95} ${pts[1].y}, ${pts[3].x + 95} ${pts[3].y}, ${pts[3].x} ${pts[3].y} ` +
              `L ${pts[2].x} ${pts[2].y} ` +
              `C ${pts[2].x - 95} ${pts[2].y}, ${pts[4].x - 95} ${pts[4].y}, ${pts[4].x} ${pts[4].y} ` +
              `L ${pts[5].x} ${pts[5].y}`;
    pathEl.setAttribute('d', d);
  }

  updateTabletScurve();
  window.addEventListener('resize', updateTabletScurve);
  window.addEventListener('load', updateTabletScurve);
});
