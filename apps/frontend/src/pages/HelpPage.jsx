import { usePageSetup } from '../hooks/usePageSetup';

export function HelpPage() {
  usePageSetup({
    bodyClass: 'help-page',
    scripts: ['home']
  });

  return (
    <>
      <main className="help-main" id="main">
        <section className="help-hero">
          <h1 data-i18n="help.title">User guide</h1>
          <p data-i18n="help.subtitle">Practical tips so every role can get started right away.</p>
          <p data-i18n="help.note">This guide follows the refreshed light theme and scroll animations.</p>
        </section>

        <section className="help-grid">
          <article className="help-section">
            <header className="help-section__header">
              <span className="help-section__icon" aria-hidden="true">
                👩‍🏫
              </span>
              <h2 data-i18n="help.teacher.title">For teachers</h2>
            </header>
            <p data-i18n="help.teacher.summary">Plan entries and keep your class informed.</p>
            <ul>
              <li data-i18n="help.teacher.steps.create">
                Click the desired day in the calendar, choose the type and times, then save the entry.
              </li>
              <li data-i18n="help.teacher.steps.format">
                Use *TEXT* inside the description to highlight important details in bold.
              </li>
              <li data-i18n="help.teacher.steps.attachments">
                Attachments are not supported-share links or references directly in the description.
              </li>
              <li data-i18n="help.teacher.steps.overview">
                Review upcoming work in the day overview once a timetable .json has been submitted.
              </li>
            </ul>
          </article>

          <article className="help-section">
            <header className="help-section__header">
              <span className="help-section__icon" aria-hidden="true">
                🎒
              </span>
              <h2 data-i18n="help.students.title">For students</h2>
            </header>
            <p data-i18n="help.students.summary">Track rooms, deadlines, and assignments on any device.</p>
            <ul>
              <li data-i18n="help.students.steps.dayView">
                The day overview lists homework, exams, and events once your class has submitted its timetable .json.
              </li>
              <li data-i18n="help.students.steps.currentSubject">
                The "Current subject" page shows where your next lesson will take place.
              </li>
              <li data-i18n="help.students.steps.calendar">
                Tap a day in the calendar to read entry details and find events quickly.
              </li>
              <li data-i18n="help.students.steps.questions">
                If anything is unclear, email support@akzuwo.ch for help.
              </li>
            </ul>
          </article>

          <article className="help-section">
            <header className="help-section__header">
              <span className="help-section__icon" aria-hidden="true">
                🛡️
              </span>
              <h2 data-i18n="help.admins.title">For class admins</h2>
            </header>
            <p data-i18n="help.admins.summary">Keep roles, timetables, and entries organised.</p>
            <ul>
              <li data-i18n="help.admins.steps.schedule">
                Make sure someone from your class submits the timetable .json so the day overview and current subject unlock.
              </li>
              <li data-i18n="help.admins.steps.create">
                Create entries yourself by clicking the appropriate day in the calendar.
              </li>
              <li data-i18n="help.admins.steps.privacy">
                Point people to the privacy page for detailed information.
              </li>
              <li data-i18n="help.admins.steps.support">
                Need a hand? Email support@akzuwo.ch-this address is dedicated to support requests only.
              </li>
            </ul>
          </article>
        </section>

        <section className="help-callout">
          <h2 data-i18n="help.callout.title">Good to know</h2>
          <ul>
            <li data-i18n="help.callout.schedule">
              Day overview and current subject become available only after a timetable has been provided in .json format.
            </li>
            <li data-i18n="help.callout.contactForm">Support is handled exclusively via support@akzuwo.ch.</li>
            <li data-i18n="help.callout.privacy">For more about privacy, read the dedicated privacy page.</li>
            <li data-i18n="help.callout.support">Still curious? Reach out to support.</li>
          </ul>
        </section>
      </main>
    </>
  );
}

