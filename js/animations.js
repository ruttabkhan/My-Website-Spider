/* ============================================
   ANIMATIONS — IntersectionObserver reveals,
   split text, animated counters, 3D tilt cards
   ============================================ */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Split character reveal ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.style.transitionDelay = reduceMotion ? '0s' : `${i * 0.025}s`;
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
    });
  });

  if (document.querySelectorAll('[data-split]').length) {
    if (reduceMotion) {
      document.querySelectorAll('.split-char').forEach((s) => s.classList.add('is-visible'));
    } else {
      const splitIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.querySelectorAll('.split-char').forEach((s) => s.classList.add('is-visible'));
              splitIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      document.querySelectorAll('[data-split]').forEach((el) => splitIO.observe(el));
    }
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const duration = reduceMotion ? 0 : 1400;
      const start = performance.now();

      if (duration === 0) {
        el.textContent = target + suffix;
        return;
      }

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterIO.observe(el));
  }

  /* ---------- Timeline draw-in (progress line) ---------- */
  const timelineTracks = document.querySelectorAll('[data-timeline-track]');
  if (timelineTracks.length) {
    const trackIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
          } else {
            entry.target.classList.remove('is-drawn');
          }
        });
      },
      { threshold: 0.1 }
    );
    timelineTracks.forEach((el) => trackIO.observe(el));
  }

  /* ---------- 3D tilt cards ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      const strength = 8;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * strength;
        const rotateX = ((y / rect.height) - 0.5) * -strength;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
        card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0) rotateY(0)';
      });
    });
  }

  /* ---------- Skill progress rings ---------- */
  const rings = document.querySelectorAll('[data-progress]');
  if (rings.length) {
    const ringIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const circle = entry.target.querySelector('.ring-fill');
            const value = parseFloat(entry.target.dataset.progress);
            if (circle) {
              const circumference = 2 * Math.PI * parseFloat(circle.getAttribute('r'));
              const offset = circumference - (value / 100) * circumference;
              circle.style.strokeDasharray = `${circumference}`;
              circle.style.strokeDashoffset = reduceMotion ? offset : circumference;
              requestAnimationFrame(() => {
                circle.style.transition = 'stroke-dashoffset 1.2s var(--ease-soft)';
                circle.style.strokeDashoffset = offset;
              });
            }
            ringIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    rings.forEach((el) => ringIO.observe(el));
  }
})();
