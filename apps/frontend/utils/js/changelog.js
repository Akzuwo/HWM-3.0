(function () {
  function initChangelogAnimations() {
    var body = document.body;
    if (!body || !body.classList.contains('changelog-page')) {
      return;
    }

    window.requestAnimationFrame(function () {
      body.classList.add('changelog-loaded');
    });

    var prefersReducedMotion = false;
    if (window.matchMedia) {
      try {
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (error) {
        prefersReducedMotion = false;
      }
    }

    var animatedElements = [];
    var header = document.querySelector('.changelog-header');
    if (header) {
      animatedElements.push(header);
    }

    animatedElements = animatedElements.concat(
      Array.prototype.slice.call(document.querySelectorAll('.changelog-entry'))
    );

    if (!animatedElements.length) {
      return;
    }

    if (prefersReducedMotion || typeof window.IntersectionObserver === 'undefined') {
      animatedElements.forEach(function (element) {
        element.classList.add('is-visible');
      });
      return;
    }

    var observer = new window.IntersectionObserver(
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
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px 0px -12% 0px'
      }
    );

    animatedElements.forEach(function (element, index) {
      var delay = index * 90;
      element.dataset.initialDelay = String(delay);
      element.style.setProperty('--section-delay', delay + 'ms');
      observer.observe(element);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChangelogAnimations);
  } else {
    initChangelogAnimations();
  }
})();
