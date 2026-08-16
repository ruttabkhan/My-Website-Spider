/* ============================================
   MAIN — loader, forms, gallery, hero parallax
   ============================================ */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loading screen ---------- */
  const loader = document.querySelector('.loader');
  if (loader) {
    const fill = loader.querySelector('.loader-bar-fill');
    const percentEl = loader.querySelector('.loader-percent');
    let progress = 0;
    const duration = reduceMotion ? 200 : 1100;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = 100 / steps;

    const interval = setInterval(() => {
      progress = Math.min(progress + increment, 100);
      if (fill) fill.style.width = progress + '%';
      if (percentEl) percentEl.textContent = Math.round(progress) + '%';
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loader.style.transition = 'opacity 0.5s var(--ease-soft), visibility 0.5s';
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
          document.body.style.overflow = '';
          loader.addEventListener('transitionend', () => loader.remove(), { once: true });
        }, 200);
      }
    }, stepTime);

    document.body.style.overflow = 'hidden';
  }

  /* ---------- Hero parallax ---------- */
  const heroVisual = document.querySelector('[data-parallax]');
  if (heroVisual && !reduceMotion && !window.matchMedia('(hover: none)').matches) {
    let px = 0, py = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 30;
      ty = (e.clientY / window.innerHeight - 0.5) * 30;
    }, { passive: true });

    function loop() {
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      heroVisual.style.transform = `translate(${px}px, ${py}px)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---------- Contact form validation ---------- */
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const successMsg = document.querySelector('[data-form-success]');

    function validateField(field) {
      const errorEl = field.parentElement.querySelector('.field-error');
      let message = '';

      if (field.hasAttribute('required') && !field.value.trim()) {
        message = 'This field is required.';
      } else if (field.type === 'email' && field.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(field.value.trim())) message = 'Enter a valid email address.';
      }

      if (errorEl) errorEl.textContent = message;
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    }

    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = form.querySelectorAll('input, textarea');
      let valid = true;
      fields.forEach((field) => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) return;

      form.reset();
      form.querySelectorAll('.form-group').forEach((g) => g.classList.remove('is-filled'));
      if (successMsg) {
        successMsg.classList.add('is-visible');
        setTimeout(() => successMsg.classList.remove('is-visible'), 4200);
      }
    });

    form.querySelectorAll('input, textarea').forEach((field) => {
      const group = field.closest('.form-group');
      const sync = () => group && group.classList.toggle('is-filled', field.value.trim().length > 0);
      field.addEventListener('input', sync);
      sync();
    });
  }

  /* ---------- Gallery filter + lightbox ---------- */
  const galleryGrid = document.querySelector('[data-gallery]');
  if (galleryGrid) {
    const items = [...galleryGrid.querySelectorAll('.gallery-item')];
    const filterBtns = document.querySelectorAll('[data-filter]');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-visual') : null;
    const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
    let currentIndex = 0;
    let visibleItems = items;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        items.forEach((item) => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.style.display = match ? '' : 'none';
        });
        visibleItems = items.filter((item) => item.style.display !== 'none');
      });
    });

    function openLightbox(index) {
      if (!lightbox) return;
      currentIndex = index;
      const item = visibleItems[currentIndex];
      const visual = item.querySelector('.gallery-visual');
      const label = item.dataset.caption || '';
      if (lightboxImg && visual) lightboxImg.style.background = getComputedStyle(visual).background;
      if (lightboxCaption) lightboxCaption.textContent = label;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function step(dir) {
      currentIndex = (currentIndex + dir + visibleItems.length) % visibleItems.length;
      openLightbox(currentIndex);
    }

    items.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(visibleItems.indexOf(item)));
    });

    if (lightbox) {
      lightbox.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
      lightbox.querySelector('[data-lightbox-next]')?.addEventListener('click', () => step(1));
      lightbox.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => step(-1));
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      });
    }
  }
})();
