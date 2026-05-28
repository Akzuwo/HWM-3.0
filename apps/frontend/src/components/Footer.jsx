import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="hm-footer">
      <div className="hm-footer__inner">
        <div className="hm-footer__left hm-footer__meta">
          <span className="hm-footer__eyebrow">Homework Manager</span>
          <div className="hm-footer__legal">
            © <span>{new Date().getFullYear()}</span> <span>Timo Wigger</span>
          </div>
        </div>
        <nav className="hm-footer__right hm-footer__links" aria-label="Footer navigation">
          <a className="hm-footer__link" href="mailto:support@akzuwo.ch" data-i18n="common.footer.contact">
            support@akzuwo.ch
          </a>
          <Link className="hm-footer__link" to="/impressum" data-i18n="common.footer.imprint">
            Impressum
          </Link>
          <Link className="hm-footer__link" to="/datenschutz" data-i18n="common.footer.privacy">
            Datenschutz
          </Link>
          <Link className="hm-footer__link" to="/changelog" data-i18n="common.footer.changelog">
            Changelog
          </Link>
        </nav>
      </div>
    </footer>
  );
}
