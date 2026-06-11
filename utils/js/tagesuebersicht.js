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

const t = window.hmI18n ? window.hmI18n.scope('dayOverview') : (key, fallback) => fallback;
const locale = window.hmI18n ? window.hmI18n.getLocale() : 'en-GB';

const unauthorizedMessage = t(
  'unauthorized',
  'Please sign in and make sure you are assigned to a class to view the daily overview.'
);
const featureUnavailableMessage = t('featureUnavailable', 'This feature is not yet available for your class.');

async function responseRequiresClassContext(response) {
  if (!response) return false;
  if (response.status === 401) {
    return true;
  }
  if (response.status !== 403) {
    return false;
  }
  try {
    const text = await response.clone().text();
    if (!text) {
      return false;
    }
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

function setPageDate() {
  const dateTarget = document.getElementById('pageDate');
  if (dateTarget) {
    const today = new Date();
    dateTarget.textContent = new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(today);
  }
}

function normalizeDay(value) {
  return value ? value.toLocaleLowerCase(locale) : '';
}

function renderOverview(container, data) {
  container.innerHTML = '';

  const todayKey = normalizeDay(new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date()));

  for (const [tag, entries] of Object.entries(data)) {
    const card = document.createElement('section');
    card.className = 'day-card';
    if (normalizeDay(tag) === todayKey) {
      card.classList.add('current-day');
    }

    const heading = document.createElement('h2');
    heading.textContent = tag;
    card.appendChild(heading);

    const table = document.createElement('table');
    table.className = 'schedule-table';
    table.innerHTML = `<thead><tr><th>${t('table.time', 'Time')}</th><th>${t('table.subject', 'Subject')}</th><th>${t('table.room', 'Room')}</th></tr></thead>`;
    const tbody = document.createElement('tbody');

    if (!entries.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = t('table.empty', 'No entries');
      cell.classList.add('no-entry');
      row.appendChild(cell);
      tbody.appendChild(row);
    } else {
      for (const entry of entries) {
        const row = document.createElement('tr');
        const time = document.createElement('td');
        time.textContent = `${entry.start} – ${entry.end}`;
        const subject = document.createElement('td');
        subject.textContent = entry.fach;
        const room = document.createElement('td');
        room.textContent = entry.raum;
        row.append(time, subject, room);
        tbody.appendChild(row);
      }
    }

    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  }
}

async function loadOverview(container, { showLoading = false } = {}) {
  if (!container) {
    return;
  }
  if (showLoading) {
    container.textContent = t('loading', 'Loading data…');
  }

  try {
    const res = await fetchWithSession(`${API_BASE_URL}/tagesuebersicht`);
    if (await responseRequiresClassContext(res)) {
      container.textContent = unauthorizedMessage;
      return;
    }
    if (res.status === 404) {
      let payload = null;
      try {
        payload = await res.clone().json();
      } catch (error) {
        payload = null;
      }
      if (payload && payload.error === 'schedule_unavailable') {
        container.textContent = featureUnavailableMessage;
        return;
      }
    }
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    renderOverview(container, data);
  } catch (err) {
    console.error('Error loading daily overview:', err);
    container.textContent = t('error', 'Error loading data.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('overview');
  setPageDate();

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
        required: t('classRequired', 'Please choose a class to use this feature.')
      },
      onError: (message) => {
        if (typeof window.showOverlay === 'function') {
          window.showOverlay(message, 'error');
        } else {
          console.error(message);
        }
      },
      onClassChange: () => loadOverview(container, { showLoading: true })
    });
    selector.init().catch((error) => {
      console.error('Failed to initialise class selector:', error);
    });
  }

  loadOverview(container, { showLoading: true });
});
