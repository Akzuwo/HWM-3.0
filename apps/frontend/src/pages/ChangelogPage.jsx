import { usePageSetup } from '../hooks/usePageSetup';

export function ChangelogPage() {
  usePageSetup({
    bodyClass: 'changelog-page',
    scripts: ['changelog']
  });

  return (
    <>
      <main className="changelog-main" id="main">
        <header className="changelog-header">
          <h1 data-i18n="changelog.title">Changelog</h1>
          <p data-i18n="changelog.subtitle">
            Explore the Homework Manager release notes featuring the highlights of version 2.0 and earlier updates.
          </p>
        </header>

        <section className="changelog-timeline">
          <article className="changelog-entry">
            <div className="changelog-entry__meta">
              <h2 data-i18n="changelog.release.title">Release 2.0</h2>
              <time dateTime="2025-10-01" data-i18n="changelog.release.date">
                October 2025
              </time>
            </div>
            <p data-i18n="changelog.release.summary">
              Homework Manager 2.0 delivers a fully refreshed experience packed with new capabilities. Here are the headline improvements.
            </p>
            <ul>
              <li data-i18n="changelog.release.items.design">
                Completely redesigned interface with a cohesive light theme and refined typography.
              </li>
              <li data-i18n="changelog.release.items.animations">
                Fluid micro-animations make every page feel smoother.
              </li>
              <li data-i18n="changelog.release.items.events">
                Brand-new "Event" feature to capture club meetings, outings, and special occasions.
              </li>
              <li data-i18n="changelog.release.items.upcoming">Upcoming events page delivers a clearer overview.</li>
              <li data-i18n="changelog.release.items.privacy">Privacy notice is built right into the experience.</li>
              <li data-i18n="changelog.release.items.accounts">New account system with roles, permissions, and email verification.</li>
              <li data-i18n="changelog.release.items.imprint">Legal notice (imprint) now ships with the platform.</li>
              <li data-i18n="changelog.release.items.holidays">Holidays and vacations appear directly inside the calendar.</li>
              <li data-i18n="changelog.release.items.multiClass">Plan events and breaks for multiple classes at once.</li>
              <li data-i18n="changelog.release.items.contact">Need help? Reach the team via support@akzuwo.ch.</li>
              <li data-i18n="changelog.release.items.dayView">Day overview gathers assignments, exams, and events into one focused stream.</li>
            </ul>
          </article>

          <article className="changelog-entry">
            <div className="changelog-entry__meta">
              <h2 data-i18n="changelog.archive.title">Earlier versions</h2>
            </div>
            <div className="changelog-subentry">
              <h3 data-i18n="changelog.archive.release171.title">Release 1.7.1</h3>
              <p data-i18n="changelog.archive.release171.summary">
                Release 1.7.1 keeps the calendar moving forward and polishes established workflows.
              </p>
              <ul>
                <li data-i18n="changelog.archive.release171.items.calendar">
                  Admins can now create calendar entries on the spot and edit them immediately.
                </li>
                <li data-i18n="changelog.archive.release171.items.uiFixes">
                  Resolved several visual glitches across the interface.
                </li>
                <li data-i18n="changelog.archive.release171.items.formatting">
                  Task descriptions now support bold and italic formatting for richer storytelling.
                </li>
              </ul>
            </div>
            <div className="changelog-subentry">
              <h4 data-i18n="changelog.archive.release171.patch01.title">Patch 0x01</h4>
              <ul>
                <li data-i18n="changelog.archive.release171.patch01.items.overlayButton">
                  Fixed the close button alignment on calendar overlays.
                </li>
                <li data-i18n="changelog.archive.release171.patch01.items.uiTweaks">
                  Additional fine-tuning of UI components without changing their behavior.
                </li>
              </ul>
            </div>
            <div className="changelog-subentry">
              <h4 data-i18n="changelog.archive.release171.patch02.title">Patch 0x02</h4>
              <ul>
                <li data-i18n="changelog.archive.release171.patch02.items.scheduleUi">
                  Updated the timetable view with refreshed styling.
                </li>
              </ul>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

