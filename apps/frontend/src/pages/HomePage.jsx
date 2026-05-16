import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';

export function HomePage() {
  usePageSetup({ bodyClass: 'home-page', scripts: ['home'] });

  return (
    <AppLayout>
      <main className="home-main" id="main">
        <section className="hm-hero home-hero home-hero--single">
          <div className="hm-hero__content">
            <h1 className="hm-hero__title" data-i18n="home.heroTitle">
              HWM 3.0
            </h1>
            <p className="hm-hero__lead" data-i18n="home.description.lead">
              Homework Manager 3.0 brings the platform onto a modern frontend stack with React JS and Tailwind CSS.
            </p>
            <p className="hm-hero__body" data-i18n="home.description.body">
              The new version keeps the familiar Homework Manager structure, but upgrades the interface with cleaner
              components, better maintainability and a smoother web app experience across the entire platform.
            </p>
            <div className="hm-hero__actions">
              <a className="home-button home-button--primary" href="/kalender.html">
                <span aria-hidden="true">📅</span>
                <span data-i18n="common.nav.calendar">Kalender</span>
              </a>
              <a className="home-button home-button--ghost" href="/help.html">
                <span aria-hidden="true">🧭</span>
                <span data-i18n="home.guide.cta">Zur Anleitung</span>
              </a>
            </div>
          </div>
        </section>

        <section className="home-grid">
          <article className="home-card home-card--release">
            <header className="home-card__header">
              <span className="home-card__icon" aria-hidden="true">
                🚀
              </span>
              <h2 data-i18n="home.release.title">Update Hinweis 3.0</h2>
            </header>
            <p className="home-card__meta" data-i18n="home.release.date">
              Neue Web-App-Basis mit React JS und Tailwind CSS.
            </p>
            <p data-i18n="home.release.summary">
              Version 3.0 focuses on a cleaner frontend architecture, consistent UI components and a smoother
              foundation for all pages of Homework Manager.
            </p>
            <ul>
              <li data-i18n="home.release.highlights.design">Complete frontend migrated to React.</li>
              <li data-i18n="home.release.highlights.animations">Styling system rebuilt with Tailwind CSS.</li>
              <li data-i18n="home.release.highlights.events">Cleaner component structure across all major pages.</li>
              <li data-i18n="home.release.highlights.upcoming">Improved maintainability for future UI updates.</li>
            </ul>
            <a className="home-button" href="/changelog.html">
              <span aria-hidden="true">📄</span>
              <span data-i18n="home.release.cta">Mehr erfahren</span>
            </a>
          </article>
          <article className="home-card home-card--guide">
            <header className="home-card__header">
              <span className="home-card__icon" aria-hidden="true">
                🧭
              </span>
              <h2 data-i18n="home.guide.title">Anleitung</h2>
            </header>
            <p data-i18n="home.guide.summary">
              Schritt-fuer-Schritt Hilfe fuer Lehrpersonen, Schuelerinnen und Schueler sowie Klassenadmins an einem Ort.
            </p>
            <ul>
              <li data-i18n="home.guide.points.teachers">Unterricht planen, Aufgaben erfassen und Termine organisieren.</li>
              <li data-i18n="home.guide.points.students">Hausaufgaben, Pruefungen und Tagesansichten schnell finden.</li>
              <li data-i18n="home.guide.points.admins">Rollen, Klassen und gemeinsame Kalender uebersichtlich verwalten.</li>
            </ul>
            <a className="home-button" href="/help.html">
              <span aria-hidden="true">📘</span>
              <span data-i18n="home.guide.cta">Zur Anleitung</span>
            </a>
          </article>
        </section>
      </main>
    </AppLayout>
  );
}
