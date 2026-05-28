import { CardActionLink } from './CardActionLink';

export function NewsPreviewCard({ titleKey, summaryKey, metaKey, href = '#', disabled = false, todoKey = '' }) {
  return (
    <article className="home-card home-card--news">
      <div className="home-card__topline">
        <span className="home-card__eyebrow" data-i18n="home.news.label">
          News
        </span>
        <span className="home-card__status" data-i18n={metaKey}>
          Demnaechst
        </span>
      </div>
      <h2 className="home-card__title" data-i18n={titleKey}>
        News-Platzhalter
      </h2>
      <p className="home-card__summary" data-i18n={summaryKey}>
        Hier erscheint bald eine Vorschau auf einen neuen Beitrag.
      </p>
      <div className="home-card__actions">
        <CardActionLink href={href} disabled={disabled} todoKey={todoKey} />
      </div>
    </article>
  );
}
