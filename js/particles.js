/* ============================================
   PARTICLES — canvas particle network background
   ============================================ */

(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, particles, dpr;
  const mouse = { x: null, y: null, radius: 130 };

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function particleCount() {
    if (reduceMotion) return 0;
    return isMobile() ? 34 : 84;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function Particle() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2 + 0.6;
    this.speedX = (Math.random() - 0.5) * 0.35;
    this.speedY = (Math.random() - 0.5) * 0.35;
    this.baseAlpha = Math.random() * 0.5 + 0.25;
  }

  Particle.prototype.update = function () {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > width) this.speedX *= -1;
    if (this.y < 0 || this.y > height) this.speedY *= -1;

    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x += (dx / dist) * force * 1.6;
        this.y += (dy / dist) * force * 1.6;
      }
    }
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(229, 9, 20, ${this.baseAlpha})`;
    ctx.fill();
  };

  function initParticles() {
    particles = [];
    const count = particleCount();
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function connect() {
    const maxDist = isMobile() ? 90 : 130;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(229, 9, 20, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  let rafId;
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connect();
    rafId = requestAnimationFrame(animate);
  }

  function handleMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function handleLeave() {
    mouse.x = null;
    mouse.y = null;
  }

  let resizeTimer;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initParticles();
    }, 150);
  }

  function start() {
    resize();
    initParticles();
    if (!reduceMotion) {
      cancelAnimationFrame(rafId);
      animate();
    } else {
      // Draw a single static frame
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => p.draw());
    }
  }

  window.addEventListener('mousemove', handleMove, { passive: true });
  window.addEventListener('mouseleave', handleLeave);
  window.addEventListener('resize', handleResize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else if (!reduceMotion) animate();
  });

  start();
})();
