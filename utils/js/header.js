const HEADER_URL = new URL('../components/header.html', import.meta.url);

function computePathInfo() {
  const rawPath = window.location.pathname;
  const trimmed = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  const segments = trimmed.split('/').filter(Boolean);
  const hasFile = segments.length > 0 && segments[segments.length - 1].includes('.');
  const directories = hasFile ? segments.slice(0, -1) : segments;
  const docLanguage = (document.documentElement.lang || '').toLowerCase();
  const docLanguageBase = docLanguage.includes('-') ? docLanguage.split('-')[0] : docLanguage;

  let languageIndex = -1;
  if (docLanguage) {
    languageIndex = directories.findIndex((segment) => segment.toLowerCase() === docLanguage);
  }
  if (languageIndex === -1 && docLanguageBase) {
    languageIndex = directories.findIndex((segment) => segment.toLowerCase() === docLanguageBase);
  }

  const language = docLanguageBase || docLanguage || 'en';
  const baseSegments = languageIndex >= 0 ? directories.slice(0, languageIndex + 1) : [];
  const routeDepth = directories.length - baseSegments.length;
  const routePrefix = routeDepth > 0 ? '../'.repeat(routeDepth) : '';
  const rootPrefix = directories.length > 0 ? '../'.repeat(directories.length) : '';
  return {
    language,
    routePrefix,
    rootPrefix,
    baseSegments,
    directories,
    hasFile,
    rawPath,
  };
}

function normalizePathname(path) {
  if (!path) return '/';
  if (path.endsWith('/')) {
    return path.toLowerCase();
  }
  return path.toLowerCase();
}

function markActiveLink(header, info) {
  const { baseSegments } = info;
  const navLinks = header.querySelectorAll('.nav-link[data-route]');
  if (!navLinks.length) return;

  const normalizedCurrent = normalizePathname(window.location.pathname);
  let currentPath = normalizedCurrent;
  if (currentPath.endsWith('/')) {
    currentPath = `${currentPath}index.html`;
  }
  if (!currentPath.endsWith('.html')) {
    currentPath = `${currentPath.replace(/\/?$/, '/')}index.html`;
  }
  const basePath = baseSegments.length ? `/${baseSegments.join('/')}` : '';

  navLinks.forEach((link) => {
    const route = link.getAttribute('data-route');
    const expected = normalizePathname(`${basePath}/${route}`.replace(/\/{2,}/g, '/'));
    const alt = route === 'index.html' ? (basePath || '/') : null;
    const matches = currentPath === expected || (alt && normalizedCurrent === normalizePathname(alt));
    if (matches) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

function applyLanguageCode(header, languageCode) {
  header.querySelectorAll('.lang-switch__code').forEach((codeEl) => {
    codeEl.textContent = languageCode.toUpperCase();
  });
}

function populateRoutes(header, info) {
  const { routePrefix, rootPrefix, language } = info;
  header.querySelectorAll('.nav-link[data-route]').forEach((link) => {
    const route = link.getAttribute('data-route');
    const prefix = routePrefix || '';
    link.setAttribute('href', `${prefix}${route}`);
  });
  const logo = header.querySelector('[data-logo]');
  if (logo) {
    logo.src = `${rootPrefix}media/logo.png`;
    logo.alt = '';
    logo.setAttribute('aria-hidden', 'true');
  }
  const brandLink = header.querySelector('[data-brand-link]');
  if (brandLink) {
    const prefix = routePrefix || '';
    const brandText = header.querySelector('.brand');
    const label = brandText ? brandText.textContent.trim() : '';
    brandLink.setAttribute('href', `${prefix}index.html`);
    brandLink.setAttribute('aria-label', label || 'Homework Manager');
  }
  header.querySelectorAll('[data-auth-button]').forEach((loginButton) => {
    loginButton.setAttribute('data-lang', language);
  });
}

function setupMobileNavigation(header) {
  const toggle = header.querySelector('[data-nav-toggle]');
  const drawer = header.querySelector('[data-nav-drawer]');
  const overlay = header.querySelector('[data-nav-overlay]');
  const inner = header.querySelector('.hm-navbar__inner');
  const navMobile = header.querySelector('.nav-mobile');

  if (!toggle || !drawer || !overlay || !inner) {
    return;
  }

  if (typeof window.__hmNavCleanup === 'function') {
    window.__hmNavCleanup();
    window.__hmNavCleanup = null;
  }

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let previousFocus = null;
  let isCondensed = false;

  const updateDrawerAria = () => {
    if (!isCondensed) {
      drawer.setAttribute('aria-hidden', 'false');
      return;
    }
    drawer.setAttribute('aria-hidden', drawer.classList.contains('is-open') ? 'false' : 'true');
  };

  const closeDrawer = ({ restoreFocus = true } = {}) => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (!overlay.hasAttribute('hidden')) {
      overlay.setAttribute('hidden', '');
    }
    drawer.classList.remove('is-open');
    updateDrawerAria();
    toggle.setAttribute('aria-expanded', 'false');
    const focusTarget = previousFocus;
    previousFocus = null;
    if (restoreFocus && focusTarget instanceof HTMLElement && document.contains(focusTarget)) {
      focusTarget.focus();
    }
  };

  const openDrawer = () => {
    if (!isCondensed || drawer.classList.contains('is-open')) {
      return;
    }
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawer.classList.add('is-open');
    updateDrawerAria();
    overlay.classList.add('is-open');
    overlay.removeAttribute('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    const firstFocusable = drawer.querySelector(focusableSelector);
    if (firstFocusable instanceof HTMLElement) {
      try {
        firstFocusable.focus({ preventScroll: true });
      } catch (error) {
        firstFocusable.focus();
      }
    }
  };

  const handleToggleClick = () => {
    if (!isCondensed) {
      return;
    }
    if (drawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  const handleOverlayClick = () => {
    if (drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  };

  const handleDrawerClick = (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('a.nav-link') : null;
    if (target) {
      closeDrawer({ restoreFocus: false });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      event.preventDefault();
      closeDrawer();
    }
  };

  const detectWrap = () => {
    const children = Array.from(inner.children).filter(
      (child) => child instanceof HTMLElement && child.offsetParent !== null
    );
    if (!children.length) {
      return false;
    }

    const tops = new Set(children.map((child) => Math.round(child.getBoundingClientRect().top)));
    if (tops.size > 1) {
      return true;
    }

    const scrollDelta = inner.scrollHeight - inner.clientHeight;
    return scrollDelta > 1;
  };

  const setCondensed = (nextCondensed) => {
    const previous = isCondensed;
    isCondensed = nextCondensed;
    header.classList.toggle('is-condensed', isCondensed);

    if (previous !== isCondensed) {
      closeDrawer({ restoreFocus: false });
      return;
    }

    updateDrawerAria();
    toggle.setAttribute('aria-expanded', drawer.classList.contains('is-open') ? 'true' : 'false');
    if (!isCondensed) {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      if (!overlay.hasAttribute('hidden')) {
        overlay.setAttribute('hidden', '');
      }
    }
  };

  const evaluateLayout = () => {
    header.classList.add('is-measuring');
    header.classList.remove('is-condensed');

    const mobileVisible = navMobile ? window.getComputedStyle(navMobile).display !== 'none' : false;
    const shouldCondense = mobileVisible ? true : detectWrap();

    header.classList.remove('is-measuring');
    setCondensed(shouldCondense);
  };

  toggle.addEventListener('click', handleToggleClick);
  overlay.addEventListener('click', handleOverlayClick);
  drawer.addEventListener('click', handleDrawerClick);
  document.addEventListener('keydown', handleKeyDown);

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    evaluateLayout();
  }) : null;

  if (resizeObserver) {
    resizeObserver.observe(inner);
  }

  window.addEventListener('resize', evaluateLayout);
  window.addEventListener('load', evaluateLayout, { once: true });

  let fontsListener = null;
  if (document && document.fonts && typeof document.fonts.addEventListener === 'function') {
    fontsListener = () => {
      evaluateLayout();
      if (document && document.fonts && typeof document.fonts.removeEventListener === 'function' && fontsListener) {
        document.fonts.removeEventListener('loadingdone', fontsListener);
      }
      fontsListener = null;
    };
    document.fonts.addEventListener('loadingdone', fontsListener);
  } else if (document && document.fonts && typeof document.fonts.ready?.then === 'function') {
    document.fonts.ready.then(() => evaluateLayout());
  }

  overlay.setAttribute('aria-hidden', 'true');
  if (!overlay.hasAttribute('hidden')) {
    overlay.setAttribute('hidden', '');
  }

  evaluateLayout();
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => evaluateLayout());
  }

  window.__hmNavCleanup = () => {
    toggle.removeEventListener('click', handleToggleClick);
    overlay.removeEventListener('click', handleOverlayClick);
    drawer.removeEventListener('click', handleDrawerClick);
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', evaluateLayout);
    window.removeEventListener('load', evaluateLayout);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (fontsListener && document && document.fonts && typeof document.fonts.removeEventListener === 'function') {
      document.fonts.removeEventListener('loadingdone', fontsListener);
      fontsListener = null;
    }
    header.classList.remove('is-condensed', 'is-measuring');
    closeDrawer({ restoreFocus: false });
  };
}

async function loadHeader() {
  try {
    const response = await fetch(HEADER_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load header (${response.status})`);
    }
    const markup = await response.text();
    const template = document.createElement('template');
    template.innerHTML = markup.trim();
    const header = template.content.firstElementChild;
    if (!header) {
      return;
    }
    const info = computePathInfo();
    populateRoutes(header, info);
    applyLanguageCode(header, info.language.slice(0, 2));
    markActiveLink(header, info);

    const body = document.body;
    if (!body) {
      return;
    }
    const existing = body.querySelector('.hm-navbar');
    if (existing) {
      if (typeof window.__hmNavCleanup === 'function') {
        window.__hmNavCleanup();
        window.__hmNavCleanup = null;
      }
      existing.remove();
    }
    body.insertBefore(header, body.firstChild);
    setupMobileNavigation(header);

    window.dispatchEvent(
      new CustomEvent('hm:header-ready', {
        detail: {
          header,
          pathInfo: info,
        },
      })
    );
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', loadHeader);

// Inject a small stylesheet to prevent collapsed/hidden sidebars from widening the page.
// This is a defensive fix: it forces the viewport to not grow beyond 100vw and hides horizontal overflow.
// It is intentionally lightweight and applied once on DOMContentLoaded.
(function injectSidebarWidthFix() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('hm-sidebar-width-fix')) return;

  const css = `
/* Prevent off-canvas / collapsed sidebars from increasing document width */
html, body {
  max-width: 100vw !important;
  overflow-x: hidden !important;
}

/* Defensive rules for common sidebar patterns */
.sidebar,
.primary-nav,
.nav-sidebar,
.offcanvas,
.aside {
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

/* If a sidebar is shifted off-screen with transform, ensure it doesn't affect layout */
.sidebar[aria-hidden="true"],
.primary-nav[aria-hidden="true"],
.offcanvas[aria-hidden="true"],
.sidebar.collapsed,
.primary-nav.collapsed,
.offcanvas.collapsed {
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  transform: translateX(-100%) !important;
  width: auto !important;
  pointer-events: none !important;
  visibility: hidden !important;
}
`;

  const style = document.createElement('style');
  style.id = 'hm-sidebar-width-fix';
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  const head = document.head || document.getElementsByTagName('head')[0];
  if (head) head.appendChild(style);
})();
