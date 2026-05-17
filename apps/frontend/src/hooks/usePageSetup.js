import { useEffect, useLayoutEffect } from 'react';
import { dispatchLegacyReady, loadLegacyScripts } from '../utils/legacyScripts';

const EMPTY_SCRIPTS = Object.freeze([]);
const renderStats = new Map();

export function usePageSetup({ bodyClass = '', scripts = [] } = {}) {
  const scriptList = Array.isArray(scripts) ? scripts : EMPTY_SCRIPTS;
  const scriptsKey = scriptList.join('|');
  warnOnRenderBurst(bodyClass || 'default');

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
      await loadLegacyScripts(scriptList);
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
  }, [scriptsKey]);
}

function warnOnRenderBurst(key) {
  if (!import.meta.env?.DEV || typeof console === 'undefined') {
    return;
  }
  const now = Date.now();
  const stat = renderStats.get(key) || { count: 0, windowStart: now, warnedAt: 0 };
  if (now - stat.windowStart > 5000) {
    stat.count = 0;
    stat.windowStart = now;
  }
  stat.count += 1;
  if (stat.count > 50 && now - stat.warnedAt > 5000) {
    stat.warnedAt = now;
    console.warn(`[HWM dev] Page "${key}" rendered more than 50 times within 5s. Check for a render loop.`);
  }
  renderStats.set(key, stat);
}
