import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_STORAGE_KEY = 'hm.cookieConsent.v1';

const DEFAULT_CONSENT = Object.freeze({
  necessary: true,
  preferences: false,
  analytics: false
});

const CONSENT_OPTIONS = [
  {
    key: 'necessary',
    title: 'Technisch notwendig',
    text: 'Erforderlich fuer Login, API-Kommunikation, Sicherheit und die Grundfunktionen von Homework Manager.',
    required: true
  },
  {
    key: 'preferences',
    title: 'Komfort',
    text: 'Speichert freiwillige Einstellungen, damit die App sich deine Auswahl merken kann.'
  },
  {
    key: 'analytics',
    title: 'Statistik',
    text: 'Erlaubt optionale Nutzungs- und Performance-Messung, zum Beispiel Cloudflare Analytics, falls aktiviert.'
  }
];

function normalizeConsent(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return {
    necessary: true,
    preferences: Boolean(value.preferences),
    analytics: Boolean(value.analytics)
  };
}

function readStoredConsent() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage?.getItem(CONSENT_STORAGE_KEY);
    return normalizeConsent(JSON.parse(stored || 'null'));
  } catch {
    return null;
  }
}

function publishConsent(consent) {
  const normalized = normalizeConsent(consent) || DEFAULT_CONSENT;

  window.hmCookieConsent = {
    ...normalized,
    has: (key) => Boolean(normalized[key])
  };
  window.dispatchEvent(new CustomEvent('hm-cookie-consent-change', { detail: normalized }));

  return normalized;
}

function persistConsent(consent) {
  const normalized = publishConsent(consent);

  try {
    window.localStorage?.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        ...normalized,
        updatedAt: new Date().toISOString()
      })
    );
  } catch {
    // Consent still applies for the current page view when storage is unavailable.
  }

  return normalized;
}

function CookieIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M20.04 12.62a8.14 8.14 0 1 1-8.66-8.66 1 1 0 0 1 .86 1.54 2.14 2.14 0 0 0 2.95 2.95 1 1 0 0 1 1.49.78 2.14 2.14 0 0 0 2.09 2.09 1 1 0 0 1 .78 1.49c-.02.03-.04.06-.06.09.19-.1.39-.19.55-.28Zm-8.67-6.51a6.14 6.14 0 1 0 6.52 6.52 4.15 4.15 0 0 1-3.13-2.65 4.14 4.14 0 0 1-3.39-3.87ZM8.25 10a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm2.25 6.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm3.75-2.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M19.43 12.98c.03-.32.05-.65.05-.98s-.02-.66-.05-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.28 7.28 0 0 0-1.69-.98l-.38-2.65a.5.5 0 0 0-.5-.42h-4a.5.5 0 0 0-.5.42l-.38 2.65a7.28 7.28 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65a7.9 7.9 0 0 0 0 1.96l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.52.39 1.09.72 1.69.98l.38 2.65a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.38-2.65c.6-.26 1.17-.59 1.69-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hm-open-cookie-settings'));
  }
}

export function CookieConsentBanner() {
  const storedConsent = useMemo(readStoredConsent, []);
  const [isVisible, setIsVisible] = useState(!storedConsent);
  const [showSettings, setShowSettings] = useState(false);
  const [draftConsent, setDraftConsent] = useState(storedConsent || DEFAULT_CONSENT);

  useEffect(() => {
    publishConsent(storedConsent || DEFAULT_CONSENT);
  }, [storedConsent]);

  useEffect(() => {
    const handleOpenSettings = () => {
      const latestConsent = readStoredConsent() || DEFAULT_CONSENT;
      setDraftConsent(latestConsent);
      setShowSettings(true);
      setIsVisible(true);
    };

    window.addEventListener('hm-open-cookie-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('hm-open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const saveConsent = (nextConsent) => {
    const normalized = normalizeConsent(nextConsent) || DEFAULT_CONSENT;
    persistConsent(normalized);
    setDraftConsent(normalized);
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      preferences: true,
      analytics: true
    });
  };

  const acceptNecessary = () => {
    saveConsent(DEFAULT_CONSENT);
  };

  const updateDraft = (key) => {
    setDraftConsent((current) => ({
      ...current,
      [key]: !current[key]
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section className="cookie-consent" aria-label="Cookie-Einstellungen">
      <div className={`cookie-consent__panel${showSettings ? ' is-expanded' : ''}`} role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title">
        <button
          type="button"
          className="cookie-consent__close"
          aria-label="Nur notwendige Cookies speichern und Hinweis schliessen"
          onClick={acceptNecessary}
        >
          <span aria-hidden="true">X</span>
        </button>

        <div className="cookie-consent__summary">
          <div className="cookie-consent__icon">
            <CookieIcon />
          </div>
          <div className="cookie-consent__copy">
            <h2 id="cookie-consent-title">Cookie-Einstellungen</h2>
            <p>
              Wir verwenden technisch notwendige Session-Cookies, damit <strong>Homework Manager</strong> sicher mit der API
              kommunizieren kann. Cloudflare kann Sicherheitscookies setzen; optionale Statistik nutzen wir nur mit deiner
              Einwilligung.
            </p>
            <p className="cookie-consent__note">Keine Marketing-Cookies. Ablehnen ist jederzeit moeglich.</p>
          </div>
        </div>

        {showSettings ? (
          <div className="cookie-consent__settings" aria-label="Cookie-Kategorien">
            {CONSENT_OPTIONS.map((option) => (
              <label key={option.key} className={`cookie-consent__option${option.required ? ' is-required' : ''}`}>
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.text}</small>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(draftConsent[option.key])}
                  disabled={option.required}
                  onChange={() => updateDraft(option.key)}
                />
                <i aria-hidden="true"></i>
              </label>
            ))}
            <p className="cookie-consent__legal">
              Du kannst deine Auswahl jederzeit im Footer aendern. Details findest du in der{' '}
              <Link to="/datenschutz">Datenschutzerklaerung</Link>.
            </p>
          </div>
        ) : null}

        <div className="cookie-consent__actions">
          <button type="button" className="cookie-consent__button cookie-consent__button--primary" onClick={acceptAll}>
            Alle akzeptieren
          </button>
          <button type="button" className="cookie-consent__button cookie-consent__button--secondary" onClick={acceptNecessary}>
            Nur notwendige
          </button>
          {showSettings ? (
            <button type="button" className="cookie-consent__button cookie-consent__button--ghost" onClick={() => saveConsent(draftConsent)}>
              Auswahl speichern
            </button>
          ) : (
            <button type="button" className="cookie-consent__settings-button" onClick={() => setShowSettings(true)}>
              <span>Einstellungen</span>
              <span className="cookie-consent__settings-icon" aria-hidden="true">
                <GearIcon />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
