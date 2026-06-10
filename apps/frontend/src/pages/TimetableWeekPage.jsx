import { Link } from 'react-router-dom';
import { GlassSkeleton } from '../components/GlassSkeleton';
import { usePageSetup } from '../hooks/usePageSetup';

export function TimetableWeekPage() {
  usePageSetup({
    bodyClass: '',
    scripts: ['calendarPermissions', 'classSelector', 'timetableWeek']
  });

  return (
    <>
      <main className="page-container" id="main">
        <header className="page-header">
          <div className="page-title">
            <h1>Wochenstundenplan</h1>
            <p id="weekRange" className="page-date"></p>
          </div>
          <div className="page-controls">
            <div className="calendar-class-selector class-select" data-class-selector="" hidden>
              <label htmlFor="week-class-select">Klasse</label>
              <select id="week-class-select" data-class-select="" defaultValue="">
                <option value="" disabled>
                  Klasse auswählen
                </option>
              </select>
            </div>
            <button className="hm-back-link" type="button" data-week-prev="">
              Vorwoche
            </button>
            <button className="hm-back-link" type="button" data-week-today="">
              Heute
            </button>
            <button className="hm-back-link" type="button" data-week-next="">
              Folgewoche
            </button>
            <Link className="hm-back-link" to="/tagesuebersicht">
              Tagesansicht
            </Link>
          </div>
        </header>

        <div id="weekOverview" className="overview-grid overview-grid--week">
          <GlassSkeleton label="Wochenstundenplan wird geladen" rows={5} />
        </div>
      </main>
    </>
  );
}
