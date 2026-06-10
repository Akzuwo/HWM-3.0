import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/js/api-client';
import { HomeHero } from '../components/home/HomeHero';
import { NewsPreviewCard } from '../components/home/NewsPreviewCard';
import { usePageSetup } from '../hooks/usePageSetup';

const NEWS_PLACEHOLDERS = [
  {
    titleKey: 'home.news.items.primary.title',
    summaryKey: 'home.news.items.primary.summary',
    metaKey: 'home.news.items.primary.meta',
    todoKey: 'latest-news-route',
  },
  {
    titleKey: 'home.news.items.secondary.title',
    summaryKey: 'home.news.items.secondary.summary',
    metaKey: 'home.news.items.secondary.meta',
    todoKey: 'second-latest-news-route',
  },
];

function formatNewsMeta(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const lang = document.documentElement.lang || navigator.language || 'de-CH';
  return date.toLocaleDateString(lang, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeNewsHref(value) {
  const href = String(value || '').trim();
  if (!href) {
    return '';
  }
  if (href.startsWith('/') && !href.startsWith('//')) {
    return href;
  }
  if (/^https?:\/\//i.test(href)) {
    return href;
  }
  return '';
}

export function HomePage() {
  usePageSetup({ bodyClass: 'home-page', scripts: ['home'] });
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        const response = await apiFetch('/api/news?limit=2');
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        const items = Array.isArray(payload?.data) ? payload.data : [];
        if (!cancelled) {
          setNewsItems(items);
        }
      } catch (error) {
        if (import.meta.env?.DEV) {
          console.warn('[HWM] Failed to load news preview:', error);
        }
      }
    }

    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.hmI18n?.apply?.();
  }, [newsItems]);

  return (
    <>
      <main className="home-main" id="main">
        <HomeHero />

        <section className="home-preview-grid" aria-label="News-Vorschau">
          {NEWS_PLACEHOLDERS.map((placeholder, index) => {
            const item = newsItems[index];
            const href = normalizeNewsHref(item?.link_url);
            return (
              <NewsPreviewCard
                key={item?.id || placeholder.todoKey}
                {...placeholder}
                title={item?.title || ''}
                summary={item?.summary || item?.body || ''}
                meta={formatNewsMeta(item?.published_at || item?.created_at)}
                href={href || '#'}
                disabled={!item || !href}
              />
            );
          })}
        </section>
      </main>
    </>
  );
}
