import { CardActionLink } from './CardActionLink';

export function NewsPreviewCard({
  title,
  summary,
  meta,
  titleKey,
  summaryKey,
  metaKey,
  href = '#',
  disabled = false,
  todoKey = '',
}) {
  const titleProps = title ? {} : { 'data-i18n': titleKey };
  const summaryProps = summary ? {} : { 'data-i18n': summaryKey };
  const metaProps = meta ? {} : { 'data-i18n': metaKey };

  return (
    <article className="home-card home-card--news">
      <div className="home-card__topline">
        <span className="home-card__eyebrow" data-i18n="home.news.label">
          News
        </span>
        <span className="home-card__status" {...metaProps}>
          {meta || 'Demnaechst'}
        </span>
      </div>
      <h2 className="home-card__title" {...titleProps}>
        {title || 'News-Platzhalter'}
      </h2>
      <p className="home-card__summary" {...summaryProps}>
        {summary || 'Hier erscheint bald eine Vorschau auf einen neuen Beitrag.'}
      </p>
      <div className="home-card__actions">
        <CardActionLink href={href} disabled={disabled} todoKey={todoKey} />
      </div>
    </article>
  );
}
