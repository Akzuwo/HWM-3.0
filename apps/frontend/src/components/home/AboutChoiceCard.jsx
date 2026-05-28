import { CardActionLink } from './CardActionLink';

export function AboutChoiceCard({ titleKey, summaryKey, href = '#', disabled = false, todoKey = '' }) {
  return (
    <article className="about-card">
      <h2 className="about-card__title" data-i18n={titleKey}>
        Mehr
      </h2>
      <span className="about-card__divider" aria-hidden="true" />
      <p className="about-card__summary" data-i18n={summaryKey}>
        Kurzer Vorschautext.
      </p>
      <div className="about-card__actions">
        <CardActionLink href={href} disabled={disabled} todoKey={todoKey} />
      </div>
    </article>
  );
}
