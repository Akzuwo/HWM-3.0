(function () {
  function initHomeAnimations() {
    var body = document.body;
    if (!body) {
      return;
    }

    var isHome = body.classList.contains('home-page');
    var isHelp = body.classList.contains('help-page');

    if (!isHome && !isHelp) {
      return;
    }

    var prefersReducedMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    var markLoaded = function () {
      body.classList.add(isHelp ? 'help-loaded' : 'home-loaded');
    };

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(markLoaded);
    } else {
      markLoaded();
    }

    var animatedSelectors = [];
    if (isHome) {
      animatedSelectors.push('.home-callout', '.home-card');
    }
    if (isHelp) {
      animatedSelectors.push('.help-hero', '.help-section', '.help-callout');
    }

    var selector = animatedSelectors.join(', ');
    var animatedElements = selector
      ? Array.prototype.slice.call(document.querySelectorAll(selector))
      : [];

    if (!animatedElements.length) {
      return;
    }

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      animatedElements.forEach(function (element) {
        element.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var element = entry.target;
          if (entry.isIntersecting) {
            var initialDelay = Number(element.dataset.initialDelay || '0');
            var hasAnimated = element.dataset.hasAnimated === 'true';
            var delay = hasAnimated ? 0 : initialDelay;

            element.style.setProperty('--home-section-delay', delay + 'ms');
            element.classList.add('is-visible');
            element.dataset.hasAnimated = 'true';
          } else if (entry.intersectionRatio === 0 && element.dataset.hasAnimated === 'true') {
            element.classList.remove('is-visible');
            element.style.setProperty('--home-section-delay', '0ms');
          }
        });
      },
      {
        root: null,
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px 0px -10% 0px'
      }
    );

    animatedElements.forEach(function (element, index) {
      var delay = index * 90;
      element.dataset.initialDelay = String(delay);
      element.style.setProperty('--home-section-delay', delay + 'ms');
      observer.observe(element);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeAnimations);
  } else {
    initHomeAnimations();
  }
})();
