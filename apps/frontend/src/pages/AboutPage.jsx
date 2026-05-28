import { AppLayout } from '../components/AppLayout';
import { AboutChoiceCard } from '../components/home/AboutChoiceCard';
import { usePageSetup } from '../hooks/usePageSetup';

export function AboutPage() {
  usePageSetup({ bodyClass: 'about-page' });

  return (
    <AppLayout mainClassName="hm-react-main--landing" shellClassName="hm-react-shell--landing">
      <main className="about-page" id="main">
        <div className="about-shell">
          <section className="page-header about-header">
            <div className="about-header__copy">
              <h1 className="about-page-title" data-i18n="about.title">
                Mehr ueber HWM
              </h1>
            </div>
          </section>

          <section className="about-card-grid" data-i18n-attr="aria-label:about.title" aria-label="Mehr ueber HWM">
            <AboutChoiceCard
              titleKey="about.cards.guide.title"
              summaryKey="about.cards.guide.summary"
              href="/help"
            />
            <AboutChoiceCard
              titleKey="about.cards.history.title"
              summaryKey="about.cards.history.summary"
              href="/geschichte"
            />
            <AboutChoiceCard
              titleKey="about.cards.changelog.title"
              summaryKey="about.cards.changelog.summary"
              href="/changelog"
            />
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
