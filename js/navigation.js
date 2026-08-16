/* ============================================
   NAVIGATION — nav shrink, mobile menu, cursor,
   page transitions, scroll progress, back-to-top
   ============================================ */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Nav shrink on scroll ---------- */
  const nav = document.querySelector('.site-nav');
  const scrollProgress = document.querySelector('.scroll-progress');
  const backToTop = document.querySelector('.back-to-top');

  function onScroll() {
    const scrollY = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', scrollY > 40);
    if (backToTop) backToTop.classList.toggle('is-visible', scrollY > 600);

    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Custom cursor (desktop only) ---------- */
  if (!isTouch) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const glow = document.querySelector('.cursor-glow');

    let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;
    let glowX = ringX, glowY = ringY;
    let targetX = ringX, targetY = ringY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dot) {
        dot.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
      }
    }, { passive: true });

    function raf() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      glowX += (targetX - glowX) * 0.09;
      glowY += (targetY - glowY) * 0.09;

      if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      if (glow) glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;

      requestAnimationFrame(raf);
    }
    raf();

    const hoverTargets = 'a, button, .tilt-card, input, textarea, .nav-toggle';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets) && ring) ring.classList.add('is-active');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets) && ring) ring.classList.remove('is-active');
    });
  }

  /* ---------- Active nav link ---------- */
  const currentPage = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------- Cinematic page transitions ---------- */
  const overlay = document.querySelector('.page-transition');

  function isInternalLink(link) {
    if (!link) return false;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (link.target === '_blank') return false;
    if (link.hasAttribute('download')) return false;
    return /\.html($|\?|#)/.test(href) || href === '/' || href === './';
  }

  if (overlay) {
    // Entry animation: reveal current page
    requestAnimationFrame(() => {
      overlay.style.transition = 'none';
      overlay.style.transform = 'scaleY(1)';
      overlay.style.transformOrigin = 'top';
      requestAnimationFrame(() => {
        overlay.style.transition = `transform 0.5s var(--ease-soft)`;
        overlay.style.transformOrigin = 'bottom';
        overlay.style.transform = 'scaleY(0)';
      });
    });

    document.querySelectorAll('a').forEach((link) => {
      if (!isInternalLink(link)) return;
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (reduceMotion) return; // let it navigate normally
        e.preventDefault();
        overlay.style.transformOrigin = 'top';
        overlay.style.transition = 'transform 0.45s var(--ease-soft)';
        overlay.style.transform = 'scaleY(1)';
        setTimeout(() => { window.location.href = href; }, 420);
      });
    });
  }

  /* ---------- Keyboard: ESC closes mobile menu ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) {
      mobileMenu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });
})();
