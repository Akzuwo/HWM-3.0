const API_BASE_URL =
  (typeof window !== 'undefined' && typeof window.hmResolveApiBase === 'function')
    ? window.hmResolveApiBase()
    : 'https://hwm-api.akzuwo.ch';

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
  const items = [];
  rows.forEach((line, index) => {
    const isBullet = line.startsWith('-') || line.startsWith('•');
    const clean = line.replace(/^[-•]+\s*/, '').trim();
    if (!clean) return;
    if (!intro && !isBullet && index === 0) {
      intro = clean;
      return;
    }
    items.push(clean);
  });
  if (!intro && items.length) {
    intro = items.shift();
  }
  return { intro, items };
}

function setStatus(elements, text, loading = false) {
  if (!elements.status) return;
  elements.status.textContent = text;
  elements.status.classList.toggle('weekly-preview__status--loading', Boolean(loading));
  elements.status.hidden = false;
  if (elements.intro) {
    elements.intro.hidden = true;
    elements.intro.textContent = '';
    elements.intro.classList.remove('is-visible');
  }
  if (elements.list) {
    elements.list.hidden = true;
    elements.list.innerHTML = '';
  }
  if (elements.meta) {
    elements.meta.hidden = true;
    elements.meta.textContent = '';
  }
}

function renderSummary(elements, payload) {
  const summary = payload && payload.summary ? payload.summary : '';
  const parsed = splitSummaryLines(summary);
  if (!parsed.intro && !parsed.items.length) {
    setStatus(elements, t('empty', 'No entries in the next 7 days.'));
    return;
  }

  if (elements.status) {
    elements.status.hidden = true;
  }
  if (elements.intro && parsed.intro) {
    elements.intro.hidden = false;
    elements.intro.textContent = parsed.intro;
    requestAnimationFrame(() => {
      elements.intro.classList.add('is-visible');
    });
  }
  if (elements.list) {
    elements.list.hidden = false;
    elements.list.innerHTML = '';
    parsed.items.forEach((line, index) => {
      const item = document.createElement('li');
      item.textContent = line;
       item.style.setProperty('--item-index', String(index));
      elements.list.appendChild(item);
      requestAnimationFrame(() => {
        item.classList.add('is-visible');
      });
    });
  }
  if (elements.meta) {
    const generatedAt = payload.generated_at ? new Date(payload.generated_at) : null;
    const generatedText = generatedAt && !Number.isNaN(generatedAt.valueOf())
      ? generatedAt.toLocaleString(locale)
      : '–';
    const sourceLabel = payload.cached ? t('meta.cached', 'from cache') : t('meta.fresh', 'newly generated');
    elements.meta.hidden = false;
    elements.meta.textContent = t('meta.text', 'Updated: {time} · Source: {source}')
      .replace('{time}', generatedText)
      .replace('{source}', sourceLabel);
  }
}

async function loadWeeklyPreview(elements, { force = false } = {}) {
  const refreshButton = elements.refresh;
  if (refreshButton) {
    refreshButton.disabled = true;
  }
  setStatus(elements, t('loading', 'Generating preview…'), true);

  try {
    const endpoint = new URL(`${API_BASE_URL}/api/weekly-preview`);
    endpoint.searchParams.set('lang', locale);
    if (force) {
      endpoint.searchParams.set('force', '1');
    }
    const res = await fetchWithSession(endpoint.toString());
    if (await responseRequiresClassContext(res)) {
      setStatus(elements, t('unauthorized', 'Please sign in and make sure you are assigned to a class.'), false);
      return;
    }
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const payload = await res.json();
    renderSummary(elements, payload || {});
  } catch (error) {
    console.error('Failed to load weekly preview:', error);
    setStatus(elements, t('error', 'Unable to generate weekly preview right now.'), false);
  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    status: document.getElementById('weekly-preview-status'),
    intro: document.getElementById('weekly-preview-intro'),
    list: document.getElementById('weekly-preview-list'),
    meta: document.getElementById('weekly-preview-meta'),
    refresh: document.getElementById('weekly-preview-refresh'),
    back: document.getElementById('weekly-preview-back')
  };

  if (elements.back) {
    elements.back.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  if (elements.refresh) {
    elements.refresh.addEventListener('click', () => {
      loadWeeklyPreview(elements, { force: true });
    });
  }

  if (window.hmClassSelector) {
    const permissions = window.hmCalendar ? window.hmCalendar.permissions : null;
    const selector = window.hmClassSelector.create({
      container: '[data-class-selector]',
      select: '[data-class-select]',
      permissions,
      text: {
        label: t('classLabel', 'Class'),
        placeholder: t('classPlaceholder', 'Select class'),
        loading: t('classLoading', 'Loading classes…'),
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
      onClassChange: () => loadWeeklyPreview(elements, { force: true })
    });
    selector.init().catch((error) => {
      console.error('Failed to initialise class selector:', error);
    });
  }

  loadWeeklyPreview(elements, { force: false });
});
