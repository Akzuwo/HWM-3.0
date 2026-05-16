import { useEffect, useLayoutEffect } from 'react';
import { dispatchLegacyReady, loadLegacyScripts } from '../utils/legacyScripts';

export function usePageSetup({ bodyClass = '', scripts = [] } = {}) {
  useLayoutEffect(() => {
    const previous = document.body.className;
    document.body.className = bodyClass;
    document.body.classList.add('hm-react-shell');
    return () => {
      document.body.className = previous;
    };
  }, [bodyClass]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await loadLegacyScripts(scripts);
      if (cancelled) {
        return;
      }
      dispatchLegacyReady();
    }

    bootstrap().catch((error) => {
      console.error('Failed to bootstrap legacy page logic:', error);
    });

    return () => {
      cancelled = true;
    };
  }, [scripts]);
}
