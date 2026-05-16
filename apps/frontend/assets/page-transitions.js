(() => {
  const EXIT_CLASS = 'pt-exit-right';
  const ENTER_CLASS = 'pt-enter-from-left';
  const STORAGE_KEY = 'hm:page-transition';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isNavigating = false;

  const getPageContent = () => document.getElementById('pageContent');

  const isModifiedClick = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

  const isHashNavigation = (url) => {
    const current = window.location;
    return (
      url.origin === current.origin &&
      url.pathname === current.pathname &&
      url.search === current.search &&
      url.hash &&
      url.hash !== ''
    );
  };

  const shouldIgnoreLink = (link, event) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return true;
    if (link.target && link.target !== '' && link.target !== '_self') return true;
    if (link.hasAttribute('download')) return true;
    if (isModifiedClick(event)) return true;
    const lowerHref = href.toLowerCase();
    if (lowerHref.startsWith('mailto:') || lowerHref.startsWith('tel:') || lowerHref.startsWith('javascript:')) {
      return true;
    }
    return false;
  };

  const handleNavigation = (url) => {
    if (prefersReduced) {
      window.location.href = url.href;
      return;
    }
    const pageContent = getPageContent();
    if (!pageContent) {
      window.location.href = url.href;
      return;
    }

    isNavigating = true;
    pageContent.classList.add(EXIT_CLASS);

    const onTransitionEnd = (event) => {
      if (event.target !== pageContent) return;
      pageContent.removeEventListener('transitionend', onTransitionEnd);
      sessionStorage.setItem(STORAGE_KEY, '1');
      window.location.href = url.href;
    };

    pageContent.addEventListener('transitionend', onTransitionEnd);
    window.setTimeout(() => {
      if (!isNavigating) return;
      pageContent.removeEventListener('transitionend', onTransitionEnd);
      sessionStorage.setItem(STORAGE_KEY, '1');
      window.location.href = url.href;
    }, 500);
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || isNavigating) return;
    const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!target) return;
    if (shouldIgnoreLink(target, event)) return;

    const url = new URL(target.getAttribute('href'), window.location.href);
    if (url.origin !== window.location.origin) return;
    if (isHashNavigation(url)) return;

    event.preventDefault();
    handleNavigation(url);
  });

  const pageContent = getPageContent();
  if (!pageContent) return;

  if (!prefersReduced && sessionStorage.getItem(STORAGE_KEY) === '1') {
    pageContent.classList.add(ENTER_CLASS);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pageContent.classList.remove(ENTER_CLASS);
      });
    });
  }

  sessionStorage.removeItem(STORAGE_KEY);
})();
