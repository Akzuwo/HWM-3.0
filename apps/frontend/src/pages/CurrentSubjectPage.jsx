import { Link } from 'react-router-dom';
import { usePageSetup } from '../hooks/usePageSetup';

export function CurrentSubjectPage() {
  usePageSetup({
    bodyClass: '',
    scripts: ['calendarPermissions', 'classSelector', 'currentSubject', 'stundenplan']
  });

  return (
    <>
      <main className="current-subject" data-current-subject="" id="main">
        <header className="current-subject__header">
          <div className="current-subject__header-main">
            <h1 className="current-subject__title">
              <span className="current-subject__title-icon" aria-hidden="true">
                🕒
              </span>
              <span data-i18n="currentSubject.title">Current Subject</span>
              <span className="current-subject__title-subject" data-subject-name="">
                · —
              </span>
            </h1>
          </div>
          <div className="current-subject__header-controls">
            <div className="calendar-class-selector class-select" data-class-selector="" hidden>
              <label htmlFor="current-class-select" data-i18n="currentSubject.classLabel">
                Class
              </label>
              <select id="current-class-select" data-class-select="" defaultValue="">
                <option value="" disabled data-i18n="currentSubject.classPlaceholder">
                  Select class
                </option>
              </select>
            </div>
          </div>
        </header>

        <section className="current-subject__status">
          <div className="current-subject__loader" data-loading-indicator="" hidden>
            <span className="current-subject__loader-spinner" aria-hidden="true"></span>
            <span className="current-subject__loader-text" data-i18n="currentSubject.loading">
              Loading current data ...
            </span>
          </div>
          <div className="current-subject__countdown" aria-live="polite">
            <span className="current-subject__countdown-label" data-countdown-label="" data-i18n="currentSubject.countdownLabel">
              Time remaining
            </span>
            <span className="current-subject__countdown-value" data-countdown-value="">
              --:--
            </span>
          </div>
          <div className="current-subject__progress" data-progress="" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div className="current-subject__progress-bar" data-progress-bar=""></div>
          </div>
        </section>

        <div className="current-subject__grid">
          <section className="current-subject__section" aria-labelledby="current-lesson-heading">
            <h2 id="current-lesson-heading" data-i18n="currentSubject.currentLesson.title">
              Current Lesson
            </h2>
            <p className="current-subject__empty-note" data-current-empty="" hidden>
              <span data-i18n="currentSubject.currentLesson.empty">No lesson in progress.</span>
            </p>
            <dl className="current-subject__info-list" data-current-details="">
              <div className="current-subject__info-row">
                <dt data-i18n="currentSubject.labels.start">Start</dt>
                <dd className="is-mono" data-current-start="">
                  --:--
                </dd>
              </div>
              <div className="current-subject__info-row">
                <dt data-i18n="currentSubject.labels.end">End</dt>
                <dd className="is-mono" data-current-end="">
                  --:--
                </dd>
              </div>
              <div className="current-subject__info-row">
                <dt data-i18n="currentSubject.labels.room">Room</dt>
                <dd data-current-room="">–</dd>
              </div>
            </dl>
          </section>

          <section className="current-subject__section" aria-labelledby="next-lesson-heading">
            <h2 id="next-lesson-heading" data-i18n="currentSubject.nextLesson.title">
              Next Lesson
            </h2>
            <p className="current-subject__empty-note" data-next-empty="" hidden>
              <span data-i18n="currentSubject.nextLesson.empty">No further lessons today.</span>
            </p>
            <dl className="current-subject__info-list" data-next-details="">
              <div className="current-subject__info-row">
                <dt data-i18n="currentSubject.labels.subject">Subject</dt>
                <dd data-next-subject="">–</dd>
              </div>
              <div className="current-subject__info-row">
                <dt data-i18n="currentSubject.labels.start">Start</dt>
                <dd className="is-mono" data-next-start="">
                  --:--
                </dd>
              </div>
              <div className="current-subject__info-row">
                <dt data-i18n="currentSubject.labels.room">Room</dt>
                <dd data-next-room="">–</dd>
              </div>
            </dl>
          </section>
        </div>

        <hr className="current-subject__divider" />

        <div className="current-subject__actions">
          <Link className="current-subject__button current-subject__button--primary" to="/tagesuebersicht">
            <span aria-hidden="true">📅</span>
            <span data-i18n="currentSubject.actions.dayOverview">Daily Overview</span>
          </Link>
          <Link className="current-subject__button current-subject__button--secondary" to="/timetable-week">
            <span aria-hidden="true">▦</span>
            <span>Wochenansicht</span>
          </Link>
          <Link className="current-subject__button current-subject__button--secondary" to="/">
            <span aria-hidden="true">◀️</span>
            <span data-i18n="currentSubject.actions.back">Back</span>
          </Link>
        </div>
      </main>
    </>
  );
}

