(function () {
  function initPrivacyAnimations() {
    var body = document.body;
    if (!body || !body.classList.contains('legal-page')) {
      return;
    }

    window.requestAnimationFrame(function () {
      body.classList.add('legal-loaded');
    });

    var prefersReducedMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    var animatedElements = [];
    var header = document.querySelector('.legal-header');
    if (header) {
      animatedElements.push(header);
    }
    animatedElements = animatedElements.concat(Array.prototype.slice.call(document.querySelectorAll('.legal-section')));

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

            element.style.setProperty('--section-delay', delay + 'ms');
            element.classList.add('is-visible');
            element.dataset.hasAnimated = 'true';
          } else if (entry.intersectionRatio === 0 && element.dataset.hasAnimated === 'true') {
            element.classList.remove('is-visible');
            element.style.setProperty('--section-delay', '0ms');
          }
        });
      },
      {
        root: null,
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
        rootMargin: '0px 0px -10% 0px'
      }
    );

    animatedElements.forEach(function (element, index) {
      element.dataset.initialDelay = String(index * 80);
      element.style.setProperty('--section-delay', index * 80 + 'ms');
      observer.observe(element);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrivacyAnimations);
  } else {
    initPrivacyAnimations();
  }
})();
