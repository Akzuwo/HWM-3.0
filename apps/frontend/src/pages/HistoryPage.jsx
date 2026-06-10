import { Link } from 'react-router-dom';
import { usePageSetup } from '../hooks/usePageSetup';

export function HistoryPage() {
  usePageSetup({ bodyClass: 'history-page' });

  return (
    <>
      <main className="history-page" id="main">
        <div className="about-shell history-shell">
          <section className="page-header history-header">
            <div className="about-header__copy">
              <h1 data-i18n="history.title">Geschichte von HWM</h1>
              <p data-i18n="history.placeholder">Diese Seite wird noch entwickelt.</p>
            </div>
            <div className="about-card__actions history-header__actions">
              <Link className="home-button home-button--ghost home-button--compact" to="/mehr-ueber-hwm">
                <span data-i18n="history.back">Zur Auswahl</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
