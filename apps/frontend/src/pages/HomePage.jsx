import { AppLayout } from '../components/AppLayout';
import { HomeHero } from '../components/home/HomeHero';
import { NewsPreviewCard } from '../components/home/NewsPreviewCard';
import { usePageSetup } from '../hooks/usePageSetup';

export function HomePage() {
  usePageSetup({ bodyClass: 'home-page', scripts: ['home'] });

  return (
    <AppLayout mainClassName="hm-react-main--landing" shellClassName="hm-react-shell--landing">
      <main className="home-main" id="main">
        <HomeHero />

        <section className="home-preview-grid" aria-label="News-Vorschau">
          <NewsPreviewCard
            titleKey="home.news.items.primary.title"
            summaryKey="home.news.items.primary.summary"
            metaKey="home.news.items.primary.meta"
            disabled
            todoKey="latest-news-route"
          />
          <NewsPreviewCard
            titleKey="home.news.items.secondary.title"
            summaryKey="home.news.items.secondary.summary"
            metaKey="home.news.items.secondary.meta"
            disabled
            todoKey="second-latest-news-route"
          />
        </section>
      </main>
    </AppLayout>
  );
}
