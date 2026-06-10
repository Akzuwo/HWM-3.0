import { GlassSkeleton } from '../components/GlassSkeleton';
import { usePageSetup } from '../hooks/usePageSetup';

export function UpcomingPage() {
  usePageSetup({ bodyClass: 'upcoming-page', scripts: ['calendarPermissions', 'classSelector', 'upcoming'] });

  return (
    <>
      <main className="upcoming" id="main">
        <header className="upcoming__header">
          <div className="upcoming__heading">
            <h1 className="upcoming__title" data-i18n="upcoming.title">
              🔔 Upcoming Events
            </h1>
            <p className="upcoming__lead" data-i18n="upcoming.lead">
              Stay on top of upcoming school events and plan ahead with ease.
            </p>
          </div>
          <div className="calendar-class-selector class-select" data-class-selector="" hidden>
            <label htmlFor="upcoming-class-select">Class</label>
            <select id="upcoming-class-select" data-class-select="" defaultValue="">
              <option value="" disabled>
                Select class
              </option>
            </select>
          </div>
        </header>
        <p className="upcoming__status" data-i18n="upcoming.notice">
          Dieses Feature wird aktuell umgebaut.
        </p>
        <section className="upcoming__list" id="upcoming-list" role="list" aria-live="polite" aria-busy="true">
          <GlassSkeleton label="Anstehende Einträge werden geladen" rows={4} />
        </section>
        <div className="upcoming__actions">
          <button type="button" className="upcoming__button" id="back-button" aria-label="Back to the home page" data-i18n-attr="aria-label:upcoming.backLabel">
            <span data-i18n="upcoming.back">◀️ Back to overview</span>
          </button>
        </div>
      </main>
    </>
  );
}

