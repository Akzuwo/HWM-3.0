(function (global) {
  const FOOTER_CLASS = 'hm-footer';
  const SUPPORT_EMAIL = 'support@akzuwo.ch';
  const SUPPORTED_LOCALES = ['de', 'en', 'it', 'fr'];

  const FALLBACK_TEXT = {
    'common.footer.navigation': 'Rechtliche Links',
    'common.footer.contact': SUPPORT_EMAIL,
    'common.footer.imprint': 'Impressum',
    'common.footer.privacy': 'Datenschutz',
    'common.footer.changelog': 'Changelog',
  };

  function translate(key) {
    if (global.hmI18n && typeof global.hmI18n.get === 'function') {
      const value = global.hmI18n.get(key);
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    return FALLBACK_TEXT[key] || key;
  }

  function currentLocale() {
    if (global.hmI18n && typeof global.hmI18n.getLocale === 'function') {
      const detected = global.hmI18n.getLocale();
      if (detected && SUPPORTED_LOCALES.includes(detected)) {
        return detected;
      }
    }
    const parts = window.location.pathname.split('/').filter(Boolean);
    const candidate = (parts[0] || '').toLowerCase();
    return SUPPORTED_LOCALES.includes(candidate) ? candidate : 'de';
  }

  function removeLegacyFooters() {
    document.querySelectorAll('.site-footer, .current-subject__footer').forEach((node) => node.remove());
  }

  function buildFooter() {
    const footer = document.createElement('footer');
    footer.className = FOOTER_CLASS;

    const year = new Date().getFullYear();
    const legal = document.createElement('div');
    legal.className = 'hm-footer__legal';
    legal.innerHTML = `© <span>${year}</span> <span>Timo Wigger</span>`;
    footer.appendChild(legal);

    const links = document.createElement('nav');
    links.className = 'hm-footer__links';
    links.setAttribute('aria-label', translate('common.footer.navigation'));

    const addDivider = () => {
      const divider = document.createElement('span');
      divider.className = 'hm-footer__divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.textContent = '·';
      links.appendChild(divider);
    };

    const locale = currentLocale();
    const base = `/${locale}/`;
    const imprint = `impressum.html`;
    const privacy = `datenschutz.html`;
    const changelog = `changelog.html`;

    const createAnchor = (href, label) => {
      const anchor = document.createElement('a');
      anchor.className = 'hm-footer__link';
      anchor.href = href;
      anchor.textContent = label;
      anchor.rel = 'noopener';
      links.appendChild(anchor);
    };

    createAnchor(`mailto:${SUPPORT_EMAIL}`, translate('common.footer.contact'));
    addDivider();
    createAnchor(imprint, translate('common.footer.imprint'));
    addDivider();
    createAnchor(privacy, translate('common.footer.privacy'));
    addDivider();
    createAnchor(changelog, translate('common.footer.changelog'));

    footer.appendChild(links);
    return footer;
  }

  function ensureFooter() {
    if (!document.querySelector(`.${FOOTER_CLASS}`)) {
      document.body.appendChild(buildFooter());
    }
  }

  function shouldAnimatePageTransition() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initPageTransitions() {
    if (!shouldAnimatePageTransition()) {
      return;
    }

    if (document.querySelector('.hm-page-transition')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'hm-page-transition is-active';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    const finishEnter = () => {
      requestAnimationFrame(() => {
        overlay.classList.remove('is-active');
        document.body.classList.remove('is-transitioning');
      });
    };

    const startExit = () => {
      document.body.classList.add('is-transitioning');
      overlay.classList.add('is-active');
    };

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        finishEnter();
      }
    });

    finishEnter();

    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }

      if (anchor.hasAttribute('download') || anchor.getAttribute('rel') === 'external') {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) {
        return;
      }

      if (href.startsWith('mailto:')) {
        return;
      }

      let url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch (error) {
        return;
      }

      if (!['http:', 'https:'].includes(url.protocol)) {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      const isSameLocation = url.pathname === window.location.pathname && url.search === window.location.search;
      if (isSameLocation && !url.hash) {
        return;
      }

      event.preventDefault();
      startExit();

      window.setTimeout(() => {
        window.location.href = url.href;
      }, 220);
    });

    window.addEventListener('beforeunload', () => {
      startExit();
    });
  }

  function init() {
    removeLegacyFooters();
    ensureFooter();
    initPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
