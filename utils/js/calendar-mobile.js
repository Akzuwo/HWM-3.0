const MOBILE_QUERY = window.matchMedia('(max-width: 767px)');
const MOBILE_DATA_EVENT = 'hm-calendar-events';
const STORAGE_KEY = 'calendarMobileFilters';

const t = window.hmI18n ? window.hmI18n.scope('calendar') : (key, fallback) => fallback;
const viewLabels = {
  day: t('views.day', 'Day'),
  week: t('views.week', 'Week'),
  month: t('views.month', 'Month')
};

const navLabels = {
  today: t('monthNav.today', 'Today'),
  empty: t('status.loading', 'Loading calendar …')
};

const defaultFilters = {
  hausaufgabe: true,
  pruefung: true,
  event: true,
  ferien: true,
  todo: true
};

const state = {
  selectedView: 'day',
  selectedDate: new Date(),
  selectedWeekStart: null,
  selectedMonth: null,
  filters: { ...defaultFilters }
};

let calendarEvents = [];
let calendarEventMap = new Map();
let currentError = '';

const elements = {};

function loadStoredFilters() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { ...defaultFilters };
    }
    const parsed = JSON.parse(saved);
    return { ...defaultFilters, ...(parsed || {}) };
  } catch (error) {
    return { ...defaultFilters };
  }
}

function saveStoredFilters() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.filters));
}

function isMobile() {
  return MOBILE_QUERY.matches;
}

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function toDateKey(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function parseDateKey(value) {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getWeekStart(date) {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatBarDate(date) {
  const formatter = new Intl.DateTimeFormat(navigator.language || 'en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
  return formatter.format(date);
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat(navigator.language || 'en-GB', {
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function formatDayLabel(date) {
  return new Intl.DateTimeFormat(navigator.language || 'en-GB', {
    weekday: 'short'
  }).format(date);
}

function formatTimeRange(event, dateKey) {
  const startLabel = event.extendedProps?.startLabel;
  const endLabel = event.extendedProps?.endLabel;
  const startDateKey = event.extendedProps?.datum;
  if (!startLabel) {
    return t('agenda.allDay', 'All day');
  }
  if (dateKey !== startDateKey) {
    return t('agenda.multiDay', 'Multi-day');
  }
  if (startLabel && endLabel) {
    return `${startLabel} – ${endLabel}`;
  }
  return startLabel;
}

function eventInFilters(event) {
  const type = event.extendedProps?.type || 'event';
  return Boolean(state.filters[type]);
}

function eventOccursOn(event, dateKey) {
  const startKey = event.extendedProps?.datum || toDateKey(new Date(event.start));
  const endKey = event.extendedProps?.enddatum || startKey;
  return dateKey >= startKey && dateKey <= endKey;
}

function getEventsForDate(date) {
  const key = toDateKey(date);
  const matches = calendarEvents.filter((event) => eventOccursOn(event, key) && eventInFilters(event));
  const allDay = [];
  const timed = [];

  matches.forEach((event) => {
    const isAllDay = event.allDay || !event.extendedProps?.startLabel;
    if (isAllDay) {
      allDay.push(event);
    } else {
      timed.push(event);
    }
  });

  timed.sort((a, b) => {
    const aTime = a.extendedProps?.startzeit || '';
    const bTime = b.extendedProps?.startzeit || '';
    return aTime.localeCompare(bTime);
  });

  return { allDay, timed, key };
}

function syncClassSelector() {
  const sourceSelect = document.querySelector('[data-class-select]');
  const mobileSelect = elements.classSelect;
  if (!sourceSelect || !mobileSelect) {
    return;
  }

  const applyOptions = () => {
    mobileSelect.innerHTML = '';
    Array.from(sourceSelect.options).forEach((option) => {
      mobileSelect.appendChild(option.cloneNode(true));
    });
    mobileSelect.value = sourceSelect.value;
    mobileSelect.disabled = sourceSelect.disabled;
  };

  applyOptions();

  if (!sourceSelect.dataset.mobileSync) {
    sourceSelect.addEventListener('change', () => {
      mobileSelect.value = sourceSelect.value;
      mobileSelect.disabled = sourceSelect.disabled;
    });
    sourceSelect.dataset.mobileSync = 'true';
  }

  if (!mobileSelect.dataset.mobileSync) {
    mobileSelect.addEventListener('change', () => {
      sourceSelect.value = mobileSelect.value;
      sourceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    mobileSelect.dataset.mobileSync = 'true';
  }

  const observer = new MutationObserver(applyOptions);
  observer.observe(sourceSelect, { childList: true, subtree: true, attributes: true });
}

function renderAgenda() {
  if (!elements.agenda) {
    return;
  }

  elements.agenda.innerHTML = '';

  if (currentError) {
    const error = document.createElement('div');
    error.className = 'calendar-agenda__empty';
    error.textContent = currentError;
    elements.agenda.appendChild(error);
    return;
  }

  const { allDay, timed, key } = getEventsForDate(state.selectedDate);

  if (!allDay.length && !timed.length) {
    const empty = document.createElement('div');
    empty.className = 'calendar-agenda__empty';
    empty.textContent = t('agenda.empty', 'No entries for this day.');
    elements.agenda.appendChild(empty);
    return;
  }

  if (allDay.length) {
    const title = document.createElement('div');
    title.className = 'calendar-agenda__section-title';
    title.textContent = t('agenda.allDayLabel', 'All-day');
    elements.agenda.appendChild(title);

    const list = document.createElement('div');
    list.className = 'calendar-agenda__list';
    allDay.forEach((event) => {
      list.appendChild(buildAgendaCard(event, key));
    });
    elements.agenda.appendChild(list);
  }

  if (timed.length) {
    const title = document.createElement('div');
    title.className = 'calendar-agenda__section-title';
    title.textContent = t('agenda.timedLabel', 'Scheduled');
    elements.agenda.appendChild(title);

    const list = document.createElement('div');
    list.className = 'calendar-agenda__list';
    timed.forEach((event) => {
      list.appendChild(buildAgendaCard(event, key));
    });
    elements.agenda.appendChild(list);
  }
}

function buildAgendaCard(event, dateKey) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'calendar-agenda-card';
  button.dataset.eventId = event.id;

  const time = document.createElement('div');
  time.className = 'calendar-agenda-card__time';
  time.textContent = formatTimeRange(event, dateKey);

  const title = document.createElement('div');
  title.className = 'calendar-agenda-card__title';
  title.textContent = event.title || event.extendedProps?.typeLabel || '';

  const meta = document.createElement('div');
  meta.className = 'calendar-agenda-card__meta';

  const badge = document.createElement('span');
  const type = event.extendedProps?.type || 'event';
  badge.className = `calendar-agenda-card__badge calendar-agenda-card__badge--${type}`;
  badge.textContent = event.extendedProps?.typeLabel || type;

  meta.appendChild(badge);

  const description = event.extendedProps?.descriptionBody || '';
  if (description) {
    const detail = document.createElement('span');
    const text = description.replace(/\s+/g, ' ').trim();
    detail.textContent = text.length > 80 ? `${text.slice(0, 80)}…` : text;
    meta.appendChild(detail);
  }

  button.appendChild(time);
  button.appendChild(title);
  button.appendChild(meta);

  button.addEventListener('click', () => {
    const eventData = calendarEventMap.get(String(event.id)) || event;
    if (typeof window.openModal === 'function') {
      window.openModal(eventData);
    }
  });

  return button;
}

function renderDayCarousel() {
  if (!elements.carousel) {
    return;
  }

  elements.carousel.innerHTML = '';

  if (state.selectedView !== 'week') {
    elements.carousel.style.display = 'none';
    return;
  }

  elements.carousel.style.display = 'flex';

  const start = state.selectedWeekStart || getWeekStart(state.selectedDate);
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(start, i);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-mobile-carousel__day';
    button.dataset.date = toDateKey(date);

    const label = document.createElement('span');
    label.textContent = formatDayLabel(date);

    const number = document.createElement('strong');
    number.textContent = date.getDate();

    button.appendChild(label);
    button.appendChild(number);

    if (toDateKey(date) === toDateKey(state.selectedDate)) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', () => {
      state.selectedDate = date;
      updateBarDate();
      renderAgenda();
      renderDayCarousel();
    });

    elements.carousel.appendChild(button);
  }
}

function renderMonth() {
  if (!elements.month) {
    return;
  }

  elements.month.innerHTML = '';

  if (state.selectedView !== 'month') {
    elements.month.style.display = 'none';
    return;
  }

  elements.month.style.display = 'grid';

  const monthDate = state.selectedMonth || new Date(state.selectedDate);
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = getWeekStart(startOfMonth);

  const weekdaysRow = document.createElement('div');
  weekdaysRow.className = 'calendar-month-mobile__weekdays';
  for (let i = 0; i < 7; i += 1) {
    const weekday = document.createElement('div');
    weekday.className = 'calendar-month-mobile__weekday';
    weekday.textContent = formatDayLabel(addDays(gridStart, i));
    weekdaysRow.appendChild(weekday);
  }
  elements.month.appendChild(weekdaysRow);

  const grid = document.createElement('div');
  grid.className = 'calendar-month-mobile__grid';

  for (let i = 0; i < 42; i += 1) {
    const date = addDays(gridStart, i);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-month-mobile__day';
    button.dataset.date = toDateKey(date);

    if (date.getMonth() !== monthDate.getMonth()) {
      button.classList.add('is-muted');
    }
    if (toDateKey(date) === toDateKey(state.selectedDate)) {
      button.classList.add('is-active');
    }

    const label = document.createElement('span');
    label.textContent = date.getDate();
    button.appendChild(label);

    const dots = document.createElement('div');
    dots.className = 'calendar-month-mobile__dots';
    const types = getTypesForDate(toDateKey(date));
    types.slice(0, 4).forEach((type) => {
      const dot = document.createElement('span');
      dot.className = `calendar-month-mobile__dot calendar-month-mobile__dot--${type}`;
      dots.appendChild(dot);
    });
    button.appendChild(dots);

    button.addEventListener('click', () => {
      state.selectedDate = date;
      state.selectedView = 'day';
      updateViewButtons();
      updateBarDate();
      updateNavLabel();
      renderAgenda();
      renderDayCarousel();
      renderMonth();
    });

    grid.appendChild(button);
  }

  elements.month.appendChild(grid);
}

function getTypesForDate(dateKey) {
  const types = new Set();
  calendarEvents.forEach((event) => {
    if (!eventInFilters(event)) {
      return;
    }
    if (eventOccursOn(event, dateKey)) {
      const type = event.extendedProps?.type || 'event';
      types.add(type);
    }
  });
  return Array.from(types);
}

function updateBarDate() {
  if (elements.barDate) {
    elements.barDate.textContent = formatBarDate(state.selectedDate);
  }
}

function updateNavLabel() {
  if (!elements.navLabel) {
    return;
  }
  if (state.selectedView === 'month') {
    elements.navLabel.textContent = formatMonthLabel(state.selectedMonth || state.selectedDate);
  } else if (state.selectedView === 'week') {
    const start = state.selectedWeekStart || getWeekStart(state.selectedDate);
    const end = addDays(start, 6);
    const formatter = new Intl.DateTimeFormat(navigator.language || 'en-GB', {
      day: '2-digit',
      month: 'short'
    });
    elements.navLabel.textContent = `${formatter.format(start)} – ${formatter.format(end)}`;
  } else {
    elements.navLabel.textContent = formatMonthLabel(state.selectedDate);
  }
}

function updateViewButtons() {
  if (!elements.viewButtons) {
    return;
  }
  elements.viewButtons.forEach((button) => {
    const view = button.dataset.mobileView;
    const isActive = view === state.selectedView;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function handleNav(action) {
  if (state.selectedView === 'month') {
    const monthDate = state.selectedMonth || new Date(state.selectedDate);
    const next = new Date(monthDate);
    if (action === 'prev') {
      next.setMonth(next.getMonth() - 1);
    } else if (action === 'next') {
      next.setMonth(next.getMonth() + 1);
    } else if (action === 'today') {
      next.setTime(new Date().getTime());
    }
    state.selectedMonth = new Date(next.getFullYear(), next.getMonth(), 1);
    state.selectedDate = new Date(next.getFullYear(), next.getMonth(), 1);
  } else if (state.selectedView === 'week') {
    const start = state.selectedWeekStart || getWeekStart(state.selectedDate);
    if (action === 'prev') {
      state.selectedDate = addDays(start, -7);
    } else if (action === 'next') {
      state.selectedDate = addDays(start, 7);
    } else if (action === 'today') {
      state.selectedDate = new Date();
    }
    state.selectedWeekStart = getWeekStart(state.selectedDate);
  } else {
    if (action === 'prev') {
      state.selectedDate = addDays(state.selectedDate, -1);
    } else if (action === 'next') {
      state.selectedDate = addDays(state.selectedDate, 1);
    } else if (action === 'today') {
      state.selectedDate = new Date();
    }
  }

  updateBarDate();
  updateNavLabel();
  renderAgenda();
  renderDayCarousel();
  renderMonth();
}

function applyFiltersFromSheet() {
  if (!elements.filterToggles) {
    return;
  }

  elements.filterToggles.forEach((toggle) => {
    const type = toggle.dataset.filterType;
    const input = toggle.querySelector('input');
    if (!type || !input) {
      return;
    }
    state.filters[type] = input.checked;
  });
  saveStoredFilters();
  renderAgenda();
  renderMonth();
}

function updateFilterSheet() {
  if (!elements.filterToggles) {
    return;
  }
  elements.filterToggles.forEach((toggle) => {
    const type = toggle.dataset.filterType;
    const input = toggle.querySelector('input');
    if (!type || !input) {
      return;
    }
    input.checked = Boolean(state.filters[type]);
  });
}

function openFilterSheet() {
  if (!elements.filterSheet) {
    return;
  }
  elements.filterSheet.classList.add('is-open');
  const firstInput = elements.filterSheet.querySelector('input');
  if (firstInput && typeof firstInput.focus === 'function') {
    firstInput.focus();
  }
}

function closeFilterSheet() {
  if (!elements.filterSheet) {
    return;
  }
  elements.filterSheet.classList.remove('is-open');
}

function setupFilterSheet() {
  if (!elements.filterSheet) {
    return;
  }

  if (elements.filterToggle) {
    elements.filterToggle.addEventListener('click', openFilterSheet);
  }

  if (elements.filterClose) {
    elements.filterClose.addEventListener('click', closeFilterSheet);
  }

  elements.filterSheet.addEventListener('click', (event) => {
    if (event.target === elements.filterSheet) {
      closeFilterSheet();
    }
  });

  elements.filterSheet.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeFilterSheet();
    }
  });

  elements.filterToggles?.forEach((toggle) => {
    const input = toggle.querySelector('input');
    input?.addEventListener('change', applyFiltersFromSheet);
  });
}

function updateViewState(view) {
  state.selectedView = view;
  if (view === 'week') {
    state.selectedWeekStart = getWeekStart(state.selectedDate);
  }
  if (view === 'month') {
    state.selectedMonth = new Date(state.selectedDate.getFullYear(), state.selectedDate.getMonth(), 1);
  }

  updateViewButtons();
  updateNavLabel();
  renderDayCarousel();
  renderAgenda();
  renderMonth();
}

function hydrateFromCalendarData(data) {
  if (!data) {
    return;
  }
  calendarEvents = data.events || [];
  calendarEventMap = new Map();
  calendarEvents.forEach((event) => {
    if (event && event.id) {
      calendarEventMap.set(String(event.id), event);
    }
  });
  currentError = data.error || '';
}

function bindElements() {
  elements.barDate = document.querySelector('[data-calendar-mobile-date]');
  elements.classSelect = document.querySelector('[data-calendar-mobile-class-select]');
  elements.filterToggle = document.querySelector('[data-calendar-filter-toggle]');
  elements.filterSheet = document.querySelector('[data-calendar-filter-sheet]');
  elements.filterClose = document.querySelector('[data-calendar-filter-close]');
  elements.filterToggles = document.querySelectorAll('[data-filter-type]');
  elements.viewButtons = Array.from(document.querySelectorAll('[data-mobile-view]'));
  elements.navButtons = Array.from(document.querySelectorAll('[data-mobile-nav]'));
  elements.navLabel = document.querySelector('[data-calendar-mobile-label]');
  elements.carousel = document.querySelector('[data-calendar-mobile-carousel]');
  elements.agenda = document.querySelector('[data-calendar-agenda]');
  elements.month = document.querySelector('[data-calendar-month]');
}

function applyLabels() {
  if (elements.viewButtons) {
    elements.viewButtons.forEach((button) => {
      const view = button.dataset.mobileView;
      const text = viewLabels[view];
      const label = button.querySelector('span:last-child');
      if (text && label) {
        label.textContent = text;
      }
    });
  }

  if (elements.navButtons) {
    elements.navButtons.forEach((button) => {
      if (button.dataset.mobileNav === 'today') {
        button.textContent = navLabels.today;
      }
    });
  }
}

function registerListeners() {
  elements.viewButtons?.forEach((button) => {
    button.addEventListener('click', () => {
      updateViewState(button.dataset.mobileView);
    });
  });

  elements.navButtons?.forEach((button) => {
    button.addEventListener('click', () => {
      handleNav(button.dataset.mobileNav);
    });
  });

  MOBILE_QUERY.addEventListener('change', () => {
    if (isMobile()) {
      updateBarDate();
      updateNavLabel();
      renderAgenda();
      renderDayCarousel();
      renderMonth();
    } else {
      closeFilterSheet();
    }
  });

  window.addEventListener(MOBILE_DATA_EVENT, (event) => {
    hydrateFromCalendarData(event.detail);
    if (isMobile()) {
      renderAgenda();
      renderDayCarousel();
      renderMonth();
    }
  });
}

function initState() {
  state.filters = loadStoredFilters();
  const today = new Date();
  state.selectedDate = today;
  state.selectedWeekStart = getWeekStart(today);
  state.selectedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
}

function init() {
  bindElements();
  if (!elements.agenda || !elements.barDate) {
    return;
  }

  initState();
  updateFilterSheet();
  setupFilterSheet();
  syncClassSelector();
  applyLabels();

  elements.filterToggle?.setAttribute('aria-label', t('filters.label', 'Filter calendar entries'));
  updateBarDate();
  updateViewButtons();
  updateNavLabel();

  const initialData = window.hmCalendarData;
  if (initialData) {
    hydrateFromCalendarData(initialData);
  }

  renderAgenda();
  renderDayCarousel();
  renderMonth();
  registerListeners();
}

window.addEventListener('DOMContentLoaded', init);
