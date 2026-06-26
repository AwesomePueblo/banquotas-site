(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Particle canvas ───────────────────────────────────────────────────────
  function initParticles(canvas) {
    if (!canvas || prefersReducedMotion) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var animId;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function spawn() {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 60,
        r: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.35 + 0.08,
        speed: Math.random() * 0.5 + 0.15,
        drift: (Math.random() - 0.5) * 0.25,
        hue: Math.random() < 0.6 ? '45, 168, 216' : '255, 255, 255',
      };
    }

    function init() {
      resize();
      var count = Math.max(40, Math.floor((canvas.width * canvas.height) / 7000));
      particles = [];
      for (var i = 0; i < count; i++) {
        var p = spawn();
        p.y = Math.random() * canvas.height;
        particles.push(p);
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.hue + ', ' + p.opacity + ')';
        ctx.fill();
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y + p.r < 0 || p.x < -10 || p.x > canvas.width + 10) {
          var fresh = spawn();
          particles[i] = fresh;
        }
      }
      animId = requestAnimationFrame(tick);
    }

    init();
    tick();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(animId);
        init();
        tick();
      }, 200);
    });
  }

  // ── Hero word-by-word reveal ───────────────────────────────────────────────
  function initHeroText() {
    var els = document.querySelectorAll('.hero-word-reveal');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      for (var w = 0; w < words.length; w++) {
        var wrapper = document.createElement('span');
        wrapper.className = 'word-wrapper';
        var inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.textContent = words[w];
        if (w < words.length - 1) {
          inner.textContent += ' ';
        }
        if (!prefersReducedMotion) {
          inner.style.animationDelay = (w * 0.09) + 's';
        }
        wrapper.appendChild(inner);
        el.appendChild(wrapper);
      }
    }
  }

  // ── Scroll reveal (single elements) ──────────────────────────────────────
  function initScrollReveal() {
    var els = document.querySelectorAll('.scroll-reveal');
    if (!els.length || !window.IntersectionObserver) {
      for (var i = 0; i < els.length; i++) {
        els[i].classList.add('is-visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    for (var i = 0; i < els.length; i++) {
      observer.observe(els[i]);
    }
  }

  // ── Stagger grid children ─────────────────────────────────────────────────
  function initStagger() {
    var grids = document.querySelectorAll('.stagger-grid');
    if (!grids.length || !window.IntersectionObserver) {
      var allItems = document.querySelectorAll('.stagger-item');
      for (var k = 0; k < allItems.length; k++) {
        allItems[k].classList.add('is-visible');
      }
      return;
    }

    for (var g = 0; g < grids.length; g++) {
      (function (grid) {
        var items = grid.querySelectorAll('.stagger-item');
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var idx = 0;
              for (var n = 0; n < items.length; n++) {
                if (items[n] === entry.target) { idx = n; break; }
              }
              if (!prefersReducedMotion) {
                entry.target.style.transitionDelay = (idx * 0.09) + 's';
              }
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08 });

        for (var i = 0; i < items.length; i++) {
          observer.observe(items[i]);
        }
      })(grids[g]);
    }
  }

  // ── Parallax on hero canvas ───────────────────────────────────────────────
  function initParallax() {
    var hero = document.querySelector('.hero-full');
    if (!hero || prefersReducedMotion) return;
    var canvas = hero.querySelector('.hero-canvas');
    if (!canvas) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          canvas.style.transform = 'translateY(' + (window.scrollY * 0.25) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── Fade out scroll indicator on first scroll ────────────────────────────
  function initScrollIndicatorFade() {
    var indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;
    function hide() {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
      window.removeEventListener('scroll', hide);
    }
    window.addEventListener('scroll', hide, { passive: true, once: true });
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  function init() {
    initParticles(document.querySelector('.hero-canvas'));
    initHeroText();
    initScrollReveal();
    initStagger();
    initParallax();
    initScrollIndicatorFade();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
