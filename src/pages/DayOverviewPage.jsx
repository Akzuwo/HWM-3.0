import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';

export function DayOverviewPage() {
  usePageSetup({
    bodyClass: '',
    scripts: ['calendarPermissions', 'classSelector', 'dayOverview']
  });

  return (
    <AppLayout>
      <main className="page-container" id="main">
        <header className="page-header">
          <div className="page-title">
            <h1 data-i18n="dayOverview.title">📅 Daily Overview</h1>
            <p id="pageDate" className="page-date"></p>
          </div>
          <div className="page-controls">
            <div className="calendar-class-selector class-select" data-class-selector="" hidden>
              <label htmlFor="overview-class-select" data-i18n="dayOverview.classLabel">
                Class
              </label>
              <select id="overview-class-select" data-class-select="" defaultValue="">
                <option value="" disabled data-i18n="dayOverview.classPlaceholder">
                  Select class
                </option>
              </select>
            </div>
            <a className="hm-back-link" href="/stundenplan.html" data-i18n="dayOverview.back">
              ◀️ Back
            </a>
            <a className="hm-back-link" href="/timetable-week.html">
              Wochenansicht
            </a>
          </div>
        </header>

        <div id="overview" className="overview-grid" data-i18n="dayOverview.loading">
          Loading data...
        </div>
      </main>
    </AppLayout>
  );
}

