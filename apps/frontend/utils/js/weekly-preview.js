import { resolveApiBase } from './api-client.js';

const API_BASE_URL = resolveApiBase();
const IS_DEV = Boolean(import.meta.env?.DEV);

let previewRequestController = null;
let previewRequestSequence = 0;
let lastPreviewSignature = '';
const renderStats = { count: 0, windowStart: Date.now(), warnedAt: 0 };
const requestStats = { count: 0, windowStart: Date.now(), warnedAt: 0 };

function fetchWithSession(url, options = {}) {
  const { headers, ...rest } = options || {};
  const init = {
    ...rest,
    credentials: 'include'
  };
  if (headers) {
    init.headers = headers;
  }
  return fetch(url, init);
}

const t = window.hmI18n ? window.hmI18n.scope('weeklyPreview') : (key, fallback) => fallback;
const locale = window.hmI18n ? window.hmI18n.getLocale() : 'en';

function warnOnRenderBurst() {
  if (!IS_DEV) return;
  const now = Date.now();
  if (now - renderStats.windowStart > 5000) {
    renderStats.count = 0;
    renderStats.windowStart = now;
  }
  renderStats.count += 1;
  if (renderStats.count > 30 && now - renderStats.warnedAt > 5000) {
    renderStats.warnedAt = now;
    console.warn('[HWM weekly-preview] Preview rendered more than 30 times within 5s.');
  }
}

function warnOnRequestBurst() {
  if (!IS_DEV) return;
  const now = Date.now();
  if (now - requestStats.windowStart > 5000) {
    requestStats.count = 0;
    requestStats.windowStart = now;
  }
  requestStats.count += 1;
  if (requestStats.count > 10 && now - requestStats.warnedAt > 5000) {
    requestStats.warnedAt = now;
    console.warn('[HWM weekly-preview] More than 10 weekly-preview requests within 5s.');
  }
}

async function responseRequiresClassContext(response) {
  if (!response) return false;
  if (response.status === 401) return true;
  if (response.status !== 403) return false;
  try {
    const text = await response.clone().text();
    if (!text) return false;
    try {
      const data = JSON.parse(text);
      return Boolean(data && (data.message === 'class_required' || data.error === 'class_required'));
    } catch (error) {
      return text.includes('class_required');
    }
  } catch (error) {
    return false;
  }
}

function splitSummaryLines(summaryText = '') {
  const rows = String(summaryText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (!rows.length) return { intro: '', items: [] };
  let intro = '';
  const seen = new Set();
  const items = [];
  rows.forEach((line, index) => {
    const isBullet = line.startsWith('-') || line.startsWith('*') || line.startsWith('•');
    const clean = line.replace(/^[-*•]+\s*/, '').trim();
    if (!clean) return;
    if (!intro && !isBullet && index === 0) {
      intro = clean;
      return;
    }
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push(clean);
  });
  if (!intro && items.length) {
    intro = items.shift();
  }
  if (IS_DEV && items.length > 50) {
    console.warn('[HWM weekly-preview] Unexpectedly large preview item count:', items.length);
  }
  return { intro, items: items.slice(0, 50) };
}

function setStatus(elements, text, loading = false, { clearContent = true } = {}) {
  if (!elements.status) return;
  elements.status.textContent = text;
  elements.status.classList.toggle('weekly-preview__status--loading', Boolean(loading));
  elements.status.hidden = false;
  if (!clearContent) {
    elements.card?.setAttribute('aria-busy', loading ? 'true' : 'false');
    return;
  }
  lastPreviewSignature = '';
  if (elements.intro) {
    elements.intro.hidden = true;
    elements.intro.textContent = '';
    elements.intro.classList.remove('is-visible');
  }
  if (elements.list) {
    elements.list.hidden = true;
    elements.list.replaceChildren();
  }
  if (elements.meta) {
    elements.meta.hidden = true;
    elements.meta.textContent = '';
  }
  elements.card?.setAttribute('aria-busy', loading ? 'true' : 'false');
}

function renderSummary(elements, payload) {
  warnOnRenderBurst();
  const summary = payload && payload.summary ? payload.summary : '';
  const parsed = splitSummaryLines(summary);
  const generatedAt = payload.generated_at ? new Date(payload.generated_at) : null;
  const generatedText = generatedAt && !Number.isNaN(generatedAt.valueOf())
    ? generatedAt.toLocaleString(locale)
    : '-';
  const sourceLabel = payload.cached ? t('meta.cached', 'from cache') : t('meta.fresh', 'newly generated');
  const signature = JSON.stringify([parsed.intro, parsed.items, generatedText, sourceLabel]);

  if (signature === lastPreviewSignature) {
    elements.card?.setAttribute('aria-busy', 'false');
    if (elements.status) elements.status.hidden = true;
    return;
  }
  lastPreviewSignature = signature;

  if (!parsed.intro && !parsed.items.length) {
    setStatus(elements, t('empty', 'No entries in the next 7 days.'));
    return;
  }

  if (elements.status) {
    elements.status.hidden = true;
  }
  if (elements.intro) {
    elements.intro.hidden = !parsed.intro;
    elements.intro.textContent = parsed.intro;
    elements.intro.classList.toggle('is-visible', Boolean(parsed.intro));
  }
  if (elements.list) {
    const fragment = document.createDocumentFragment();
    parsed.items.forEach((line, index) => {
      const item = document.createElement('li');
      item.textContent = line;
      item.dataset.previewId = line.toLowerCase();
      item.style.setProperty('--item-index', String(index));
      item.classList.add('is-visible');
      fragment.appendChild(item);
    });
    elements.list.hidden = parsed.items.length === 0;
    elements.list.replaceChildren(fragment);
  }
  if (elements.meta) {
    elements.meta.hidden = false;
    elements.meta.textContent = t('meta.text', 'Updated: {time} · Source: {source}')
      .replace('{time}', generatedText)
      .replace('{source}', sourceLabel);
  }
  elements.card?.setAttribute('aria-busy', 'false');
}

async function loadWeeklyPreview(elements, { force = false } = {}) {
  const refreshButton = elements.refresh;
  const hasContent = Boolean(elements.intro?.textContent || elements.list?.children.length);
  if (refreshButton) {
    refreshButton.disabled = true;
  }
  setStatus(elements, t('loading', 'Generating preview...'), true, { clearContent: !hasContent });

  if (previewRequestController) {
    previewRequestController.abort();
  }
  previewRequestController = new AbortController();
  const requestId = ++previewRequestSequence;

  try {
    const endpoint = new URL(`${API_BASE_URL}/api/weekly-preview`);
    endpoint.searchParams.set('lang', locale);
    if (force) {
      endpoint.searchParams.set('force', '1');
    }
    warnOnRequestBurst();
    const res = await fetchWithSession(endpoint.toString(), {
      signal: previewRequestController.signal
    });
    if (requestId !== previewRequestSequence) return;
    if (await responseRequiresClassContext(res)) {
      setStatus(elements, t('unauthorized', 'Please sign in and make sure you are assigned to a class.'), false);
      return;
    }
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const payload = await res.json();
    if (requestId !== previewRequestSequence) return;
    renderSummary(elements, payload || {});
  } catch (error) {
    if (error?.name === 'AbortError') {
      return;
    }
    console.error('Failed to load weekly preview:', error);
    setStatus(elements, t('error', 'Unable to generate weekly preview right now.'), false, { clearContent: !hasContent });
  } finally {
    if (requestId === previewRequestSequence && refreshButton) {
      refreshButton.disabled = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    card: document.querySelector('.weekly-preview__card'),
    status: document.getElementById('weekly-preview-status'),
    intro: document.getElementById('weekly-preview-intro'),
    list: document.getElementById('weekly-preview-list'),
    meta: document.getElementById('weekly-preview-meta'),
    refresh: document.getElementById('weekly-preview-refresh'),
    back: document.getElementById('weekly-preview-back')
  };

  if (!elements.card || elements.card.dataset.weeklyPreviewEnhanced === 'true') {
    return;
  }
  elements.card.dataset.weeklyPreviewEnhanced = 'true';

  if (elements.back && elements.back.dataset.weeklyPreviewBound !== 'true') {
    elements.back.addEventListener('click', () => {
      if (typeof window.hmNavigate === 'function') {
        window.hmNavigate('/');
      } else {
        window.location.href = 'index.html';
      }
    });
    elements.back.dataset.weeklyPreviewBound = 'true';
  }
  if (elements.refresh && elements.refresh.dataset.weeklyPreviewBound !== 'true') {
    elements.refresh.addEventListener('click', () => {
      loadWeeklyPreview(elements, { force: true });
    });
    elements.refresh.dataset.weeklyPreviewBound = 'true';
  }

  let loadedFromClassSelector = false;
  if (window.hmClassSelector) {
    const permissions = window.hmCalendar ? window.hmCalendar.permissions : null;
    const selector = window.hmClassSelector.create({
      container: '[data-class-selector]',
      select: '[data-class-select]',
      permissions,
      text: {
        label: t('classLabel', 'Class'),
        placeholder: t('classPlaceholder', 'Select class'),
        loading: t('classLoading', 'Loading classes...'),
        error: t('classError', 'Unable to load classes.'),
        changeError: t('classChangeError', 'Unable to change class.'),
        required: t('classRequired', 'Please choose a class.')
      },
      onError: (message) => {
        if (typeof window.showOverlay === 'function') {
          window.showOverlay(message, 'error');
        } else {
          console.error(message);
        }
      },
      onClassChange: () => {
        loadedFromClassSelector = true;
        return loadWeeklyPreview(elements, { force: true });
      }
    });
    await selector.init().catch((error) => {
      console.error('Failed to initialise class selector:', error);
    });
  }

  if (!loadedFromClassSelector) {
    loadWeeklyPreview(elements, { force: false });
  }
});
