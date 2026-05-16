import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';

export function WeeklyPreviewPage() {
  usePageSetup({ bodyClass: 'weekly-preview-page', scripts: ['calendarPermissions', 'classSelector', 'weeklyPreview'] });

  return (
    <AppLayout>
      <main className="weekly-preview" id="main">
        <header className="weekly-preview__header">
          <div className="weekly-preview__heading">
            <h1 className="weekly-preview__title" data-i18n="weeklyPreview.title">
              🧠 Weekly Preview
            </h1>
            <p className="weekly-preview__lead" data-i18n="weeklyPreview.lead">
              AI summary of tasks and events for the next 7 days.
            </p>
          </div>
          <div className="calendar-class-selector class-select" data-class-selector="" hidden>
            <label htmlFor="weekly-preview-class-select" data-i18n="weeklyPreview.classLabel">
              Class
            </label>
            <select id="weekly-preview-class-select" data-class-select="" defaultValue="">
              <option value="" disabled data-i18n="weeklyPreview.classPlaceholder">
                Select class
              </option>
            </select>
          </div>
        </header>
        <section className="weekly-preview__card" aria-live="polite">
          <p className="weekly-preview__status weekly-preview__status--loading" id="weekly-preview-status" data-i18n="weeklyPreview.loading">
            Generating preview...
          </p>
          <p className="weekly-preview__intro" id="weekly-preview-intro" hidden></p>
          <ul className="weekly-preview__list" id="weekly-preview-list" hidden></ul>
          <p className="weekly-preview__meta" id="weekly-preview-meta" hidden></p>
        </section>
        <div className="weekly-preview__actions">
          <button type="button" className="weekly-preview__button weekly-preview__button--primary" id="weekly-preview-refresh">
            <span data-i18n="weeklyPreview.refresh">Regenerate</span>
          </button>
          <button type="button" className="weekly-preview__button weekly-preview__button--secondary" id="weekly-preview-back">
            <span data-i18n="weeklyPreview.back">◀️ Back to overview</span>
          </button>
        </div>
      </main>
    </AppLayout>
  );
}

