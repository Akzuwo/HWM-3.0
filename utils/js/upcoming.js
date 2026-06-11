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

const t = window.hmI18n ? window.hmI18n.scope('upcoming') : (key, fallback) => fallback;
const locale = window.hmI18n ? window.hmI18n.getLocale() : 'en-GB';

const unauthorizedMessage = t(
  'unauthorized',
  'Please sign in and make sure you are assigned to a class to view upcoming events.'
);

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

function createStatusSetter(listEl) {
  return function setStatus(message, variant = 'default') {
    listEl.innerHTML = '';
    const status = document.createElement('p');
    status.className = 'upcoming__status';
    if (variant === 'loading') {
      status.classList.add('upcoming__status--loading');
    }
    status.textContent = message;
    listEl.appendChild(status);
  };
}

async function loadUpcomingEvents(listEl, { showLoading = false } = {}) {
  if (!listEl) {
    return;
  }

  const setStatus = createStatusSetter(listEl);
  if (showLoading) {
    setStatus(t('loading', 'Loading data…'), 'loading');
  }

  listEl.setAttribute('aria-busy', 'true');

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });

  const truncate = (text, length = 220) => {
    if (!text) return '';
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
  };

  try {
    const res = await fetchWithSession(`${API_BASE_URL}/entries`);
    if (await responseRequiresClassContext(res)) {
      setStatus(unauthorizedMessage);
      listEl.setAttribute('aria-busy', 'false');
      return;
    }
    if (!res.ok) {
      throw new Error(`API error (${res.status})`);
    }

    const entries = await res.json();
    const now = new Date();
    const cutoff = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const events = entries
      .filter((entry) => (entry.typ || '').toLowerCase() === 'event')
      .map((entry) => {
        const iso = `${entry.datum}T${entry.startzeit || '00:00:00'}`;
        const dateObj = new Date(iso);
        const hasTime = Boolean(entry.startzeit);
        const relevantTime = hasTime
          ? dateObj
          : new Date(`${entry.datum}T23:59:59`);
        return {
          id: entry.id,
          fach: entry.fach || '',
          description: entry.beschreibung || '',
          dateObj,
          hasTime,
          relevantTime
        };
      })
      .filter((event) => event.relevantTime >= cutoff)
      .sort((a, b) => a.dateObj - b.dateObj)
      .map(({ relevantTime, ...event }) => event);

    listEl.innerHTML = '';

    if (events.length === 0) {
      setStatus(t('empty', 'No upcoming events found.'));
      listEl.setAttribute('aria-busy', 'false');
      return;
    }

    events.forEach((event, index) => {
      const card = document.createElement('article');
      card.className = 'upcoming-card upcoming-card--enter';
      card.setAttribute('role', 'listitem');
      card.style.setProperty('--card-order', String(index));
      card.addEventListener(
        'animationend',
        () => {
          card.classList.remove('upcoming-card--enter');
        },
        { once: true }
      );

      const badges = document.createElement('div');
      badges.className = 'upcoming-card__badges';

      const typeBadge = document.createElement('span');
      typeBadge.className = 'upcoming-card__badge upcoming-card__badge--event';
      typeBadge.textContent = t('eventBadge', 'EVENT');
      typeBadge.setAttribute('aria-hidden', 'true');

      const subjectBadge = document.createElement('span');
      subjectBadge.className = 'upcoming-card__badge upcoming-card__badge--subject';
      const subject = (event.fach || '—').toUpperCase();
      subjectBadge.textContent = subject;
      subjectBadge.setAttribute(
        'aria-label',
        event.fach
          ? t('subjectLabel', 'Subject {subject}').replace('{subject}', event.fach)
          : t('subjectMissing', 'No subject provided')
      );

      badges.append(typeBadge, subjectBadge);

      const datetime = document.createElement('div');
      datetime.className = 'upcoming-card__datetime';

      const dateText = dateFormatter.format(event.dateObj);
      const timeText = event.hasTime ? timeFormatter.format(event.dateObj) : t('allDay', 'All day');

      const dateLine = document.createElement('p');
      dateLine.className = 'upcoming-card__date';
      dateLine.textContent = dateText;

      const timeLine = document.createElement('p');
      timeLine.className = 'upcoming-card__time';
      timeLine.textContent = timeText;

      datetime.append(dateLine, timeLine);

      const desc = document.createElement('p');
      const rawDescription = truncate(event.description?.trim());
      const hasDescription = Boolean(rawDescription);
      const descId = `upcoming-desc-${event.id ?? `idx-${index}`}`;
      desc.id = descId;
      desc.className = 'upcoming-card__description';
      if (!hasDescription) {
        desc.classList.add('upcoming-card__description--empty');
        desc.textContent = t('noDescription', '– No description –');
      } else {
        desc.textContent = rawDescription;
      }

      const subjectLabel = event.fach ? `${event.fach} ` : '';
      const timeLabel = event.hasTime ? ` at ${timeText}` : '';
      card.setAttribute(
        'aria-label',
        t('cardLabel', 'Event {subject}on {date}{time}')
          .replace('{subject}', subjectLabel)
          .replace('{date}', dateText)
          .replace('{time}', timeLabel)
          .trim()
      );
      card.setAttribute('aria-describedby', descId);

      card.append(badges, datetime, desc);
      listEl.appendChild(card);
    });

    listEl.setAttribute('aria-busy', 'false');
  } catch (err) {
    console.error('Error loading data:', err);
    setStatus(t('error', 'Error loading data.'));
    listEl.setAttribute('aria-busy', 'false');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('upcoming-list');
  const backButton = document.getElementById('back-button');

  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (!listEl) {
    return;
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
        required: t('classRequired', 'Please choose a class to use this feature.')
      },
      onError: (message) => {
        if (typeof window.showOverlay === 'function') {
          window.showOverlay(message, 'error');
        } else {
          console.error(message);
        }
      },
      onClassChange: () => loadUpcomingEvents(listEl, { showLoading: true })
    });
    selector.init().catch((error) => {
      console.error('Failed to initialise class selector:', error);
    });
  }

  loadUpcomingEvents(listEl, { showLoading: true });
});
