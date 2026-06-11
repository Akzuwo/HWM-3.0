(() => {
  const activeAnimations = new WeakMap();
  let activeElements = [];
  let swapToken = 0;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getScope = (root) =>
    root instanceof Element || root instanceof DocumentFragment ? root : document;

  const collectTargets = (root) => {
    const scope = getScope(root);
    return Array.from(
      scope.querySelectorAll(
        '[data-i18n], [data-i18n-html], [data-i18n-attr], [data-i18n-placeholder], [data-i18n-title]'
      )
    );
  };

  const stopAnimation = (element) => {
    const animation = activeAnimations.get(element);
    if (animation) {
      animation.cancel();
      activeAnimations.delete(element);
    }
    element.classList.remove('i18n-anim-out', 'i18n-anim-in');
  };

  const lockHeight = (element) => {
    const computed = window.getComputedStyle(element);
    if (computed.display === 'inline' || computed.display === 'contents') {
      return;
    }
    const rect = element.getBoundingClientRect();
    if (!rect.height) {
      return;
    }
    if (!element.dataset.i18nMinHeight) {
      element.dataset.i18nMinHeight = element.style.minHeight || '';
    }
    element.style.minHeight = `${rect.height}px`;
  };

  const unlockHeight = (element) => {
    if (Object.prototype.hasOwnProperty.call(element.dataset, 'i18nMinHeight')) {
      element.style.minHeight = element.dataset.i18nMinHeight;
      delete element.dataset.i18nMinHeight;
    } else {
      element.style.minHeight = '';
    }
  };

  const resetActiveElements = () => {
    activeElements.forEach((element) => {
      stopAnimation(element);
      element.classList.remove('i18n-placeholder-animating');
      unlockHeight(element);
    });
    activeElements = [];
  };

  const animatePhase = (elements, keyframes, options, className) => {
    const animations = elements.map((element) => {
      stopAnimation(element);
      element.classList.add(className);
      const animation = element.animate(keyframes, options);
      activeAnimations.set(element, animation);
      return animation.finished.catch(() => undefined);
    });
    return Promise.all(animations);
  };

  const applyTranslations = (root, applyFn) => {
    if (typeof applyFn === 'function') {
      applyFn();
      return;
    }
    if (window.hmI18n && typeof window.hmI18n.apply === 'function') {
      window.hmI18n.apply(root);
    }
  };

  const animateLanguageSwap = async (root = document, applyFn) => {
    swapToken += 1;
    const token = swapToken;

    resetActiveElements();

    const scope = getScope(root);
    const elements = collectTargets(scope);
    if (!elements.length) {
      applyTranslations(scope, applyFn);
      return Promise.resolve();
    }

    activeElements = elements;
    elements.forEach((element) => {
      lockHeight(element);
      if (element.matches('input, textarea')) {
        element.classList.add('i18n-placeholder-animating');
      }
    });

    const reducedMotion = prefersReducedMotion();
    const duration = reducedMotion ? 120 : 220;
    const easing = reducedMotion ? 'linear' : 'cubic-bezier(0.2, 0.7, 0.2, 1)';
    const baseOptions = { duration, easing, fill: 'forwards' };

    const outFrames = reducedMotion
      ? [{ opacity: 1 }, { opacity: 0.3 }]
      : [
          { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' },
          { opacity: 0, transform: 'translateY(-4px) scale(0.98)', filter: 'blur(4px)' }
        ];

    const inFrames = reducedMotion
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
          { opacity: 0, transform: 'translateY(4px) scale(0.98)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }
        ];

    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    await animatePhase(elements, outFrames, baseOptions, 'i18n-anim-out');

    if (token !== swapToken) {
      return Promise.resolve();
    }

    applyTranslations(scope, applyFn);

    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    await animatePhase(elements, inFrames, baseOptions, 'i18n-anim-in');

    if (token !== swapToken) {
      return Promise.resolve();
    }

    elements.forEach((element) => {
      element.classList.remove('i18n-anim-out', 'i18n-anim-in', 'i18n-placeholder-animating');
      unlockHeight(element);
      activeAnimations.delete(element);
    });

    activeElements = [];
    return Promise.resolve();
  };

  window.hmI18nAnimate = {
    animateLanguageSwap
  };

  if (window.hmI18n) {
    window.hmI18n.animateLanguageSwap = animateLanguageSwap;
  }
})();
