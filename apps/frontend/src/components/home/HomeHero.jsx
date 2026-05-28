import { Link } from 'react-router-dom';

export function HomeHero() {
  return (
    <section className="hm-hero home-hero home-hero--single">
      <div className="hm-hero__content">
        <div className="home-hero__copy">
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
        </div>
        <div className="home-hero__footer">
          <Link className="home-button home-button--primary home-button--compact home-button--hero" to="/mehr-ueber-hwm">
            <span data-i18n="home.heroCta">Mehr über HWM</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
