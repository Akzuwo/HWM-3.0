export function Footer() {
  return (
    <footer className="hm-footer">
      <div className="hm-footer__meta">
        <span className="hm-footer__eyebrow">Homework Manager</span>
        <div className="hm-footer__legal">
          © <span>{new Date().getFullYear()}</span> <span>Timo Wigger</span>
        </div>
      </div>
      <nav className="hm-footer__links" aria-label="Footer navigation">
        <a className="hm-footer__link" href="mailto:support@akzuwo.ch" data-i18n="common.footer.contact">
          support@akzuwo.ch
        </a>
        <a className="hm-footer__link" href="/impressum.html" data-i18n="common.footer.imprint">
          Impressum
        </a>
        <a className="hm-footer__link" href="/datenschutz.html" data-i18n="common.footer.privacy">
          Datenschutz
        </a>
        <a className="hm-footer__link" href="/changelog.html" data-i18n="common.footer.changelog">
          Changelog
        </a>
      </nav>
    </footer>
  );
}
