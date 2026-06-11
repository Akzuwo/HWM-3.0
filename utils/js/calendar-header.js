(function () {
  const MOBILE_BREAKPOINT = 900;

  function getCurrentRoute() {
    const { pathname } = window.location;
    const trimmed = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const parts = trimmed.split('/').filter(Boolean);
    if (!parts.length) {
      return 'index.html';
    }
    const last = parts[parts.length - 1];
    if (!last.includes('.')) {
      return 'index.html';
    }
    return last.toLowerCase();
  }

  function initCalendarHeader() {
    const header = document.querySelector('[data-calendar-header]');
    const nav = header?.querySelector('[data-calendar-menu]');
    const toggle = header?.querySelector('[data-calendar-menu-toggle]');

    if (!header || !nav || !toggle) {
      return;
    }

    const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);

    const setMenuToggleVisibility = (shouldHide) => {
      if (shouldHide) {
        toggle.setAttribute('hidden', '');
        toggle.setAttribute('aria-hidden', 'true');
        return;
      }
      toggle.removeAttribute('hidden');
      toggle.removeAttribute('aria-hidden');
    };

    const closeMenu = ({ restoreFocus = false } = {}) => {
      if (!header.classList.contains('calendar-header--menu-open')) {
        return;
      }
      header.classList.remove('calendar-header--menu-open');
      nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        try {
          toggle.focus({ preventScroll: true });
        } catch (error) {
          toggle.focus();
        }
      }
    };

    const openMenu = () => {
      if (header.classList.contains('calendar-header--menu-open')) {
        return;
      }
      header.classList.add('calendar-header--menu-open');
      nav.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    };

    const syncMenuWithViewport = () => {
      if (mq.matches) {
        nav.removeAttribute('hidden');
        header.classList.remove('calendar-header--menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        setMenuToggleVisibility(true);
        return;
      }
      setMenuToggleVisibility(false);
      if (!header.classList.contains('calendar-header--menu-open')) {
        nav.setAttribute('hidden', '');
      }
    };

    const handleToggle = () => {
      if (mq.matches) {
        return;
      }
      if (header.classList.contains('calendar-header--menu-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (header.classList.contains('calendar-header--menu-open')) {
          event.preventDefault();
          closeMenu({ restoreFocus: true });
        }
      }
    };

    const handleNavClick = (event) => {
      const target = event.target.closest('a');
      if (!target) {
        return;
      }
      if (!mq.matches) {
        closeMenu();
      }
    };

    toggle.addEventListener('click', handleToggle);
    nav.addEventListener('click', handleNavClick);
    document.addEventListener('keydown', handleKeyDown);
    mq.addEventListener('change', syncMenuWithViewport);
    window.addEventListener('resize', syncMenuWithViewport);

    syncMenuWithViewport();

    const currentRoute = getCurrentRoute();
    const links = nav.querySelectorAll('.calendar-header__nav-link');
    links.forEach((link) => {
      const route = (link.getAttribute('data-route') || link.getAttribute('href') || '').toLowerCase();
      const matches = route && currentRoute === route;
      if (matches) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initCalendarHeader);
})();
