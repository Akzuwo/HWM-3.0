import { Link } from 'react-router-dom';

export function CardActionLink({ href, disabled = false, todoKey = '' }) {
  if (disabled) {
    return (
      <a
        className="home-button home-button--ghost home-button--compact is-disabled"
        href="#"
        aria-disabled="true"
        data-todo={todoKey || undefined}
        onClick={(event) => event.preventDefault()}
      >
        <span data-i18n="common.actions.more">Mehr</span>
      </a>
    );
  }

  return (
    <Link className="home-button home-button--ghost home-button--compact" to={href}>
      <span data-i18n="common.actions.more">Mehr</span>
    </Link>
  );
}
