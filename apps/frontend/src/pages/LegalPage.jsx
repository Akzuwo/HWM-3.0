import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';

export function LegalPage({ pageKey = 'privacy.main' }) {
  usePageSetup({
    bodyClass: 'legal-page',
    scripts: ['privacy']
  });

  const pageType = pageKey.startsWith('imprint') ? 'imprint' : 'privacy';

  return (
    <AppLayout>
      <main
        className={`legal-main legal-main--${pageType}`}
        id="main"
        data-i18n={pageKey}
        data-i18n-html=""
      ></main>
    </AppLayout>
  );
}

