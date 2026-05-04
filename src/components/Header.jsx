import { useEffect, useState } from 'react';

const navItems = [
  { href: '/index.html', label: 'Startseite', key: 'common.nav.home' },
  { href: '/kalender.html', label: 'Kalender', key: 'common.nav.calendar' },
  { href: '/upcoming.html', label: 'Anstehend', key: 'common.nav.upcoming' },
  { href: '/todos.html', label: 'ToDos', key: 'common.nav.todos' },
  { href: '/weekly-preview.html', label: 'Wochenvorschau', key: 'common.nav.weeklyPreview' },
  { href: '/stundenplan.html', label: 'Aktuelles Fach', key: 'common.nav.currentSubject' },
  { href: '/notenrechner.html', label: 'Notenrechner', key: 'common.nav.grades' }
];

const locales = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Francais' }
];

function ChevronIcon({ className = '', direction = 'down' }) {
  const transforms = {
    down: '',
    right: 'rotate(-90 6 6)',
    left: 'rotate(90 6 6)'
  };

  return (
    <svg className={className} viewBox="0 0 12 12" focusable="false" aria-hidden="true">
      <path
        d="M2.47 4.47a.75.75 0 0 1 1.06 0L6 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L6.53 9.47a.75.75 0 0 1-1.06 0L2.47 5.53a.75.75 0 0 1 0-1.06z"
        transform={transforms[direction] || ''}
        fill="currentColor"
      />
    </svg>
  );
}

function GearIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M19.43 12.98a7.9 7.9 0 0 0 .05-.98 7.9 7.9 0 0 0-.05-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.28 7.28 0 0 0-1.69-.98l-.38-2.65a.5.5 0 0 0-.5-.42h-4a.5.5 0 0 0-.5.42l-.38 2.65a7.28 7.28 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65a7.9 7.9 0 0 0-.05.98 7.9 7.9 0 0 0 .05.98L2.46 14.63a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.52.39 1.09.72 1.69.98l.38 2.65a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.38-2.65c.6-.26 1.17-.59 1.69-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GlobeIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5Zm6.98 8.5h-3.08a14.8 14.8 0 0 0-1.08-4.03 7.8 7.8 0 0 1 4.16 4.03Zm-6.23-4.76c.64.86 1.36 2.55 1.63 4.76h-4.76c.27-2.21.99-3.9 1.63-4.76a1.9 1.9 0 0 1 1.5 0Zm-3.57.73A14.8 14.8 0 0 0 8.1 11.25H5.02a7.8 7.8 0 0 1 4.16-4.03ZM4.59 12.75H7.9c.08 1.58.37 3.1.85 4.5H5.78a7.73 7.73 0 0 1-1.19-4.5Zm2.27 6h2.88c.41.85.92 1.6 1.51 2.19a7.76 7.76 0 0 1-4.39-2.19Zm3.79-1.5a12.59 12.59 0 0 1-.9-4.5h4.5a12.59 12.59 0 0 1-.9 4.5h-2.7Zm1.35 2.88c-.3-.16-.73-.52-1.14-1.38h2.28c-.41.86-.84 1.22-1.14 1.38Zm1.75.81c.59-.59 1.1-1.34 1.51-2.19h2.88a7.76 7.76 0 0 1-4.39 2.19Zm2.01-3.69a14.13 14.13 0 0 0 .85-4.5h3.31a7.73 7.73 0 0 1-1.19 4.5h-2.97Z"
        fill="currentColor"
      />
    </svg>
  );
}

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/index.html';
  }

  const path = window.location.pathname.toLowerCase();
  if (path === '/' || path.endsWith('/')) {
    return '/index.html';
  }

  return path;
}

function NavLinks({ onNavigate }) {
  const currentPath = getCurrentPath();

  return navItems.map((item) => (
    <a
      key={item.href}
      className="nav-link"
      href={item.href}
      data-route={item.href.replace(/^\//, '')}
      data-i18n={item.key}
      onClick={onNavigate}
      aria-current={currentPath === item.href.toLowerCase() ? 'page' : undefined}
    >
      {item.label}
    </a>
  ));
}

function SettingsDropdown({ mobile = false }) {
  return (
    <div className="settings-dropdown" data-settings="">
      <button
        className={`lang-switch settings-trigger${mobile ? ' settings-trigger--mobile' : ''}`}
        type="button"
        data-settings-toggle=""
        aria-haspopup="true"
        aria-expanded="false"
        data-i18n-attr="aria-label:common.settings.ariaLabel"
      >
        <span className="settings-trigger__icon" aria-hidden="true">
          <GearIcon />
        </span>
        {mobile ? (
          <>
            <span className="settings-trigger__label" data-i18n="common.settings.ariaLabel">
              Einstellungen
            </span>
            <ChevronIcon className="settings-trigger__chevron" />
          </>
        ) : null}
      </button>
      <div className="settings-menu" data-settings-menu="">
        <div className="settings-menu__inner" data-settings-menu-inner="">
          <div className="settings-panel settings-panel--main" data-settings-panel="main">
            <button type="button" className="settings-option" data-settings-open-panel="language">
              <span className="settings-option__icon" aria-hidden="true">
                <GlobeIcon />
              </span>
              <span className="settings-option__text" data-i18n="common.settings.language">
                Sprache
              </span>
              <ChevronIcon className="settings-option__chevron" direction="right" />
            </button>
          </div>

          <div className="settings-panel settings-panel--sub" data-settings-panel="language">
            <button type="button" className="settings-option settings-option--back" data-settings-back="">
              <span className="settings-option__icon" aria-hidden="true">
                <ChevronIcon direction="left" />
              </span>
              <span className="settings-option__text" data-i18n="common.settings.language">
                Sprache
              </span>
            </button>
            {locales.map((locale) => (
              <button key={locale.code} type="button" className="settings-option" data-settings-lang={locale.code}>
                <span className="settings-option__icon settings-option__icon--flag" aria-hidden="true">
                  {locale.code === 'de' ? '🇩🇪' : locale.code === 'en' ? '🇬🇧' : locale.code === 'it' ? '🇮🇹' : '🇫🇷'}
                </span>
                <span className="settings-option__text">{locale.label}</span>
                <span className="settings-option__meta">{locale.code.toUpperCase()}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

function UserArea() {
  return (
    <div className="user-area" data-user-area="">
      <button className="btn-login" type="button" data-auth-button="" aria-label="Login">
        <span className="btn-login__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path
              d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-3.33 0-10 1.667-10 5v2h20v-2c0-3.333-6.67-5-10-5Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="btn-login__label">Login</span>
      </button>
      <div className="account-control is-hidden" data-account-control="" aria-hidden="true">
        <button
          className="account-switch"
          type="button"
          data-account-toggle=""
          aria-haspopup="true"
          aria-expanded="false"
          aria-label="Account"
        >
          <span className="account-switch__label" data-account-label="">
            Account
          </span>
          <svg className="account-switch__caret" viewBox="0 0 12 12" focusable="false" aria-hidden="true">
            <path d="M2.47 4.47a.75.75 0 0 1 1.06 0L6 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L6.53 9.47a.75.75 0 0 1-1.06 0L2.47 5.53a.75.75 0 0 1 0-1.06z" />
          </svg>
        </button>
        <ul className="account-menu" data-account-menu="" role="menu">
          <li>
            <a className="account-option" href="/profile.html" data-account-profile="" role="menuitem">
              Profil
            </a>
          </li>
          <li>
            <button className="account-option" type="button" data-account-logout="" role="menuitem">
              Abmelden
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!isNavOpen || typeof window === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsNavOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 1080) {
        setIsNavOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isNavOpen]);

  const closeNav = () => {
    setIsNavOpen(false);
  };

  const toggleNav = () => {
    setIsNavOpen((open) => !open);
  };

  return (
    <header className="hm-navbar" data-nav="" data-i18n-attr="aria-label:common.nav.primary" role="navigation" aria-label="Main navigation">
      <div className="hm-navbar__inner header">
        <div className="header-left logo">
          <a className="logo-link" href="/index.html" data-brand-link="">
            <img data-logo="" alt="" aria-hidden="true" width="32" height="32" src="/media/logo.png" />
            <span className="brand-mark" data-i18n="common.appName">
              Homework Manager
            </span>
          </a>
        </div>

        <div className="header-center">
          <nav className="nav-links" aria-label="Main navigation">
            <NavLinks />
          </nav>
        </div>

        <div className="header-right">
          <div className="nav-right nav-right--desktop">
            <div className="nav-right__actions">
              <SettingsDropdown />
              <UserArea />
            </div>
          </div>
          <div className="nav-mobile">
            <SettingsDropdown />
            <button
              className={`hm-navbar__toggle hamburger-btn${isNavOpen ? ' is-active' : ''}`}
              type="button"
              data-nav-toggle=""
              aria-expanded={isNavOpen ? 'true' : 'false'}
              aria-controls="hm-navbar-drawer"
              data-i18n-attr="aria-label:common.nav.toggle"
              onClick={toggleNav}
            >
              <span className="hm-navbar__toggle-box" aria-hidden="true">
                <span className="hm-navbar__toggle-line"></span>
                <span className="hm-navbar__toggle-line"></span>
                <span className="hm-navbar__toggle-line"></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`hm-navbar__overlay${isNavOpen ? ' is-open' : ''}`}
        data-nav-overlay=""
        aria-hidden={isNavOpen ? 'false' : 'true'}
        onClick={closeNav}
      ></div>

      <aside
        className={`mobile-sidebar${isNavOpen ? ' is-open' : ''}`}
        data-nav-drawer=""
        id="hm-navbar-drawer"
        aria-hidden={isNavOpen ? 'false' : 'true'}
        aria-modal="true"
      >
        <div className="mobile-sidebar__inner">
          <div className="mobile-sidebar__header">
            <div className="mobile-sidebar__title-group">
              <span className="mobile-sidebar__eyebrow">Navigation</span>
              <a className="mobile-sidebar__brand" href="/index.html" onClick={closeNav}>
                <img alt="" aria-hidden="true" width="28" height="28" src="/media/logo.png" />
                <span className="mobile-sidebar__title" data-i18n="common.appName">
                  Homework Manager
                </span>
              </a>
            </div>
            <button className="mobile-sidebar__close" type="button" aria-label="Close menu" onClick={closeNav}>
              <span aria-hidden="true">X</span>
            </button>
          </div>

          <section className="mobile-sidebar__section">
            <span className="mobile-sidebar__section-title" data-i18n="common.nav.primary">
              Navigation
            </span>
            <nav className="nav-links nav-links--mobile" aria-label="Main navigation">
              <NavLinks onNavigate={closeNav} />
            </nav>
          </section>

          <section className="mobile-sidebar__section">
            <span className="mobile-sidebar__section-title">Konto & Einstellungen</span>
            <div className="nav-right nav-right--mobile">
              <div className="nav-right__actions">
                <SettingsDropdown mobile />
                <UserArea />
              </div>
            </div>
          </section>
        </div>
      </aside>
    </header>
  );
}
