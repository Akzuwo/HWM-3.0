import { resolveApiBase } from './api-client.js';

// kalender.js
if (typeof window !== 'undefined' && window.__hmKalenderLoaded) {
  console.warn('kalender.js was loaded more than once. Skipping duplicate execution.');
} else {
  if (typeof window !== 'undefined') {
    window.__hmKalenderLoaded = true;
  }

const API_BASE_URL = resolveApiBase();
const IS_DEV = Boolean(import.meta.env?.DEV);
const showOverlay = (...args) => window.showOverlay?.(...args);
const showEntryForm = (...args) => window.showEntryForm?.(...args);
const setupModalFormInteractions = (...args) => window.setupModalFormInteractions?.(...args);
const ENTRY_FORM_MESSAGES = window.ENTRY_FORM_MESSAGES || {
  invalidDate: 'Please enter a valid date.',
  invalidEnd: 'The end time must not be earlier than the start time.',
  invalidEndDate: 'The end date must not be earlier than the start date.',
  missingClass: 'Please sign in and make sure you are assigned to a class.'
};
const CALENDAR_MODAL_MESSAGES = window.CALENDAR_MODAL_MESSAGES || {
  saveSuccess: 'Entry saved successfully.'
};
const LOCAL_TEST_HOSTS = new Set(['localhost', '127.0.0.1']);
const CAN_USE_TEMPORARY_TEST_MODE =
  typeof window !== 'undefined' && LOCAL_TEST_HOSTS.has(window.location.hostname);
const TEMPORARY_TEST_CLASSES = [
  { id: 'test-l23a', slug: 'l23a-test', title: 'Test class L23a' },
  { id: 'test-u24f', slug: 'u24f-test', title: 'Test class U24f' },
  { id: 'test-b24m', slug: 'b24m-test', title: 'Test class B24m' }
];

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
const CALENDAR_PERMISSIONS = window.hmCalendar?.permissions || null;
const FALLBACK_PERMISSION_STATE = CALENDAR_PERMISSIONS
  ? CALENDAR_PERMISSIONS.getState()
  : { role: 'guest', canManageEntries: false, canCreatePersonalTodos: false, classSelectorEnabled: false };

let role = FALLBACK_PERMISSION_STATE.role;
let userCanManageEntries = FALLBACK_PERMISSION_STATE.canManageEntries;
let canCreatePersonalTodos = FALLBACK_PERMISSION_STATE.canCreatePersonalTodos;
let classSelectorEnabled = FALLBACK_PERMISSION_STATE.classSelectorEnabled;
let temporaryTestModeActive = false;
let temporaryTestModeReason = '';
let temporaryTestModeNotified = false;

function applyPermissionSnapshot(nextState) {
  if (!nextState) {
    return;
  }
  role = nextState.role;
  userCanManageEntries = nextState.canManageEntries;
  canCreatePersonalTodos = Boolean(nextState.canCreatePersonalTodos);
  classSelectorEnabled = nextState.classSelectorEnabled;
}

function refreshPermissionState() {
  if (!CALENDAR_PERMISSIONS) {
    return;
  }
  const nextState = CALENDAR_PERMISSIONS.refresh();
  if (nextState) {
    applyPermissionSnapshot(nextState);
  }
}

function applyActionBarPermissions() {
  if (typeof document === 'undefined') {
    return;
  }

  const actionBar = document.querySelector('.calendar-action-bar');
  if (!actionBar) {
    return;
  }

  const createBtn = actionBar.querySelector('[data-action="create"]');
  const exportBtn = actionBar.querySelector('[data-action="export"]');
  const testModeMessage = 'Temporary test mode is active.';
  if (temporaryTestModeActive) {
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.setAttribute('aria-disabled', 'true');
      createBtn.title = testModeMessage;
    }
    if (exportBtn) {
      exportBtn.disabled = true;
      exportBtn.setAttribute('aria-disabled', 'true');
      exportBtn.title = testModeMessage;
    }
    return;
  }

  if (CALENDAR_PERMISSIONS) {
    CALENDAR_PERMISSIONS.updateActionBarPermissions({
      onCreate: () => showEntryForm(),
      canManageEntries: userCanManageEntries,
      canCreatePersonalTodos: false
    });
  } else {
    if (!createBtn) {
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.removeAttribute('aria-disabled');
        exportBtn.removeAttribute('title');
      }
      return;
    }

    if (!userCanManageEntries) {
      createBtn.disabled = true;
      createBtn.setAttribute('aria-disabled', 'true');
      createBtn.removeAttribute('title');
    } else {
      createBtn.disabled = false;
      createBtn.removeAttribute('aria-disabled');
      createBtn.removeAttribute('title');
      if (!createBtn.dataset.hmRoleBound) {
        createBtn.addEventListener('click', () => showEntryForm());
        createBtn.dataset.hmRoleBound = 'true';
      }
    }
  }

  if (createBtn) {
    createBtn.removeAttribute('title');
  }
  if (exportBtn) {
    exportBtn.disabled = false;
    exportBtn.removeAttribute('aria-disabled');
    exportBtn.removeAttribute('title');
  }
}

function hideClassSelector() {
  if (typeof document === 'undefined') {
    return;
  }
  const container = document.querySelector('[data-class-selector]');
  if (!container) {
    return;
  }
  container.hidden = true;
  container.classList.remove('is-visible');
  const select = container.querySelector('[data-class-select]');
  if (select) {
    select.disabled = true;
  }
}

if (CALENDAR_PERMISSIONS) {
  CALENDAR_PERMISSIONS.subscribe((nextState, previousState) => {
    const prevState = previousState
      ? { ...previousState }
      : {
          role,
          canManageEntries: userCanManageEntries,
          canCreatePersonalTodos,
          classSelectorEnabled
        };

    applyPermissionSnapshot(nextState);

    if (!previousState) {
      applyActionBarPermissions();
      return;
    }

    if (prevState.canManageEntries !== nextState.canManageEntries) {
      applyActionBarPermissions();
    }

    if (prevState.classSelectorEnabled !== nextState.classSelectorEnabled) {
      if (nextState.classSelectorEnabled) {
        initialiseClassSelector()
          .then(() => loadCalendar())
          .catch((error) => {
            console.error('Unable to refresh the calendar after enabling class selection:', error);
          });
      } else {
        hideClassSelector();
        loadCalendar().catch((error) => {
          console.error('Unable to refresh the calendar after disabling class selection:', error);
        });
      }
    }
  });
} else {
  console.warn('hmCalendar permission helpers unavailable. Falling back to guest role.');
}

const CLASS_STORAGE = (window.hmClassStorage) ? window.hmClassStorage : {
  getId: () => '',
  getSlug: () => '',
  set: () => {},
  clear: () => {}
};

let currentClassId = typeof CLASS_STORAGE.getId === 'function' ? (CLASS_STORAGE.getId() || '') : '';
let currentClassSlug = typeof CLASS_STORAGE.getSlug === 'function' ? (CLASS_STORAGE.getSlug() || '') : '';

const t = window.hmI18n ? window.hmI18n.scope('calendar') : (key, fallback) => fallback;
const modalT = window.hmI18n ? window.hmI18n.scope('calendar.modal') : (key, fallback) => fallback;

const MOBILE_DATA_EVENT = 'hm-calendar-events';
let lastCalendarEvents = [];

function publishMobileCalendarState({ events = lastCalendarEvents, classId = currentClassId, classSlug = currentClassSlug, error = '' } = {}) {
  if (typeof window === 'undefined') {
    return;
  }
  lastCalendarEvents = events || [];
  const detail = {
    events: lastCalendarEvents,
    classId,
    classSlug,
    error
  };
  window.hmCalendarData = detail;
  window.dispatchEvent(new CustomEvent(MOBILE_DATA_EVENT, { detail }));
}

const classSelectorText = {
  label: t('classSelector.label', 'Class'),
  placeholder: t('classSelector.placeholder', 'Select class'),
  loading: t('classSelector.loading', 'Loading classes …'),
  error: t('classSelector.error', 'Unable to load classes.'),
  changeError: t('classSelector.changeError', 'Could not change class.'),
  required: t('classSelector.required', 'Please select a class to view the calendar.'),
  allClasses: t('classSelector.allClasses', 'Alle Klassen')
};
const testModeText = {
  noticeTitle: t('status.testMode.title', 'Development test mode'),
  noticeBody: t(
    'status.testMode.body',
    'The API is currently unavailable in this test environment. Declared temporary test data is being shown. Saving, deleting, exporting and server sync are disabled until production wiring is in place.'
  ),
  toast: t(
    'status.testMode.toast',
    'Temporary test data is active because the calendar API could not be reached from the local test environment.'
  ),
  actionDisabled: t(
    'status.testMode.actionDisabled',
    'Temporary test mode is active. This action is unavailable while the calendar uses declared test data.'
  ),
  entryLabel: t('status.testMode.entryLabel', 'Test data')
};

const TYPE_LABELS = {
  hausaufgabe: t('legend.homework', 'Homework'),
  pruefung: t('legend.exam', 'Exam'),
  event: t('legend.event', 'Event'),
  ferien: t('legend.holiday', 'Holidays & Breaks'),
  todo: t('legend.todo', 'ToDo')
};

function getClassDisplayLabel(cls) {
  if (!cls || !cls.slug) {
    return '';
  }
  if (cls.slug === 'default') {
    return classSelectorText.allClasses;
  }
  return cls.title ? `${cls.title} (${cls.slug})` : cls.slug;
}

const TODO_STATUS = {
  open: 'offen',
  inProgress: 'in_bearbeitung',
  done: 'beendet'
};

const actionText = {
  exportLabel: t('actions.export.label', 'Export'),
  exportLoading: t('actions.export.loading', 'Exporting …'),
  exportError: t('actions.export.error', 'Failed to export the calendar.'),
  exportSuccess: t('actions.export.success', 'Calendar exported successfully.'),
  exportFileName: t('actions.export.fileName', 'homework-calendar.ics'),
  exportUnauthorized: t(
    'actions.export.unauthorized',
    'Please sign in and make sure you are assigned to a class to export the calendar.'
  ),
  backTooltip: t('actions.back.tooltip', 'Go back to the dashboard'),
  createTooltip: t('actions.create.tooltip', 'Create a new calendar entry')
};

const unauthorizedMessage = t(
  'status.unauthorized',
  'Please sign in and make sure you are assigned to a class to view the calendar.'
);
const exportUnauthorizedMessage = actionText.exportUnauthorized || unauthorizedMessage;

function isTemporaryTestModeAvailable(error = null) {
  if (!CAN_USE_TEMPORARY_TEST_MODE) {
    return false;
  }
  if (!error) {
    return true;
  }
  if (error instanceof TypeError) {
    return true;
  }
  const message = typeof error?.message === 'string' ? error.message.toLowerCase() : '';
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('load failed')
  );
}

function updateTemporaryTestModeNotice() {
  if (typeof document === 'undefined') {
    return;
  }
  const shell = document.querySelector('.calendar-shell');
  const notice = document.querySelector('[data-calendar-test-mode]');
  if (shell) {
    shell.classList.toggle('calendar-shell--test-mode', temporaryTestModeActive);
  }
  if (!notice) {
    return;
  }
  notice.hidden = true;
  notice.innerHTML = '';
}

function setTemporaryTestMode(active, reason = '') {
  temporaryTestModeActive = Boolean(active) && CAN_USE_TEMPORARY_TEST_MODE;
  temporaryTestModeReason = temporaryTestModeActive ? String(reason || '') : '';
  updateTemporaryTestModeNotice();
  if (!temporaryTestModeActive && !classSelectorEnabled) {
    hideClassSelector();
  }
  applyActionBarPermissions();
}

function activateTemporaryTestMode(error = null, reason = '') {
  if (!isTemporaryTestModeAvailable(error)) {
    return false;
  }
  const wasActive = temporaryTestModeActive;
  setTemporaryTestMode(true, reason);
  temporaryTestModeNotified = temporaryTestModeNotified || wasActive;
  return true;
}

function isClassSelectorAvailable() {
  return classSelectorEnabled || temporaryTestModeActive;
}

function getTemporaryTestClasses() {
  return TEMPORARY_TEST_CLASSES.map((cls) => ({ ...cls }));
}

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }
  if (typeof window.hmNavigate === 'function') {
    window.hmNavigate('/login');
  } else {
    window.location.href = 'login.html';
  }
}

const modalText = {
  noDescription: modalT('noDescription', '<em>No description provided.</em>'),
  subjectLabel: modalT('labels.subject', 'Subject'),
  eventTitleLabel: modalT('labels.eventTitle', 'Event title'),
  deleteConfirm: modalT('confirmDelete', 'Do you really want to delete this entry?'),
  deleteError: modalT('messages.deleteError', 'Unable to delete the entry.'),
  deleteSuccess: modalT('messages.deleteSuccess', 'Entry deleted successfully.'),
  saveError: modalT('messages.saveError', 'Unable to save the entry.'),
  edit: modalT('buttons.edit', 'Bearbeiten'),
  statusSaveError: modalT('messages.statusSaveError', 'Status konnte nicht gespeichert werden.'),
  statusSaveSuccess: modalT('messages.statusSaveSuccess', 'Status wurde gespeichert.')
};

const modalButtons = {
  save: modalT('buttons.save', 'Save'),
  saveLoading: modalT('buttons.saveLoading', 'Saving …'),
  delete: modalT('buttons.delete', 'Delete'),
  deleteLoading: modalT('buttons.deleteLoading', 'Deleting …')
};

function getDeleteConfirmOverlay() {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.getElementById('calendar-delete-confirm-overlay');
}

function syncDeleteConfirmMessage(overlay) {
  if (!overlay) {
    return;
  }
  const messageEl = overlay.querySelector('[data-i18n="calendar.modal.deleteConfirm.message"]');
  if (messageEl && typeof modalText.deleteConfirm === 'string' && modalText.deleteConfirm) {
    messageEl.textContent = modalText.deleteConfirm;
  }
}

function openDeleteConfirmModal(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const overlay = getDeleteConfirmOverlay();
  if (!overlay) {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(modalText.deleteConfirm)) {
        deleteEntry();
      }
    }
    return;
  }

  syncDeleteConfirmMessage(overlay);

  if (window.hmModal && typeof window.hmModal.open === 'function') {
    window.hmModal.open(overlay, {
      initialFocus: '[data-role="cancel"]',
      onRequestClose: closeDeleteConfirmModal
    });
  } else {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('hm-modal-open');
  }
}

function closeDeleteConfirmModal() {
  const overlay = getDeleteConfirmOverlay();
  if (!overlay) {
    return;
  }

  if (window.hmModal && typeof window.hmModal.close === 'function') {
    window.hmModal.close(overlay);
  } else {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('hm-modal-open');
  }
}

function confirmDeleteEntry() {
  closeDeleteConfirmModal();
  deleteEntry();
}

let editFormController = null;
let calendarInstance = null;
let lastCalendarViewType = null;
let lastCalendarDateValue = null;
let resizeHandler = null;
let calendarAnimationIndex = 0;
let lastCalendarEventSignature = '';
let calendarLoadSequence = 0;
let pendingDragChange = null;
let visibleRangeEventMap = new Map();
let calendarPreferences = {
  muted_subjects: [],
  show_completed_todos: false
};

function mdBold(text = '') {
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

function formatSwissDateFromISO(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
}

function parseTimeLabel(value) {
  if (!value) return '';
  return value.slice(0, 5);
}

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

function splitEventDescription(type, text) {
  if (type !== 'event' || !text) {
    return { eventTitle: '', description: text || '' };
  }
  const sections = text.split('\n\n');
  const [first, ...rest] = sections;
  const eventTitle = (first || '').trim();
  const description = rest.join('\n\n').trim();
  return { eventTitle, description };
}

function addDaysToDate(dateStr, days) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return '';
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const yyyy = date.getUTCFullYear().toString().padStart(4, '0');
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = date.getUTCDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatEntryDate(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getViewDateKey(date) {
  if (!date) {
    return '';
  }
  return formatEntryDate(date);
}

function buildVisibleRangeEventMap(calendar) {
  if (!calendar?.view) {
    return new Map();
  }

  const rangeStart = calendar.view.activeStart instanceof Date ? calendar.view.activeStart : null;
  const rangeEnd = calendar.view.activeEnd instanceof Date ? calendar.view.activeEnd : null;
  if (!rangeStart || !rangeEnd) {
    return new Map();
  }

  const map = new Map();
  const visibleStartKey = getViewDateKey(rangeStart);
  const visibleEndKey = getViewDateKey(new Date(rangeEnd.getTime() - 1));

  calendar.getEvents().forEach((event) => {
    const eventStart = event.start instanceof Date ? new Date(event.start) : null;
    if (!eventStart) {
      return;
    }

    const eventStartKey = getViewDateKey(eventStart);
    let eventEndKey = '';
    if (event.end instanceof Date) {
      const inclusiveEnd = new Date(event.end);
      inclusiveEnd.setMilliseconds(inclusiveEnd.getMilliseconds() - 1);
      eventEndKey = getViewDateKey(inclusiveEnd);
    }

    if (!eventEndKey || eventEndKey < eventStartKey) {
      eventEndKey = eventStartKey;
    }

    const loopStart = eventStartKey < visibleStartKey ? visibleStartKey : eventStartKey;
    const loopEnd = eventEndKey > visibleEndKey ? visibleEndKey : eventEndKey;
    if (!loopStart || !loopEnd || loopStart > loopEnd) {
      return;
    }

    let cursor = loopStart;
    while (cursor && cursor <= loopEnd) {
      const bucket = map.get(cursor);
      if (bucket) {
        bucket.push(event);
      } else {
        map.set(cursor, [event]);
      }
      cursor = addDaysToDate(cursor, 1);
    }
  });

  return map;
}

function applyMonthCellMetrics(calendar) {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl || !calendar?.view) {
    return;
  }

  const isMonthView = calendar.view.type === 'dayGridMonth';
  calendarEl.dataset.calendarView = calendar.view.type || '';
  if (!isMonthView) {
    delete calendarEl.dataset.monthDensity;
    visibleRangeEventMap = new Map();
    document.querySelectorAll('#calendar .fc-daygrid-day[data-density]').forEach((cell) => {
      cell.removeAttribute('data-density');
      cell.style.removeProperty('--day-event-count');
    });
    return;
  }

  visibleRangeEventMap = buildVisibleRangeEventMap(calendar);

  const rowCount = Math.max(document.querySelectorAll('#calendar .fc-daygrid-body tbody tr').length, 1);
  const availableHeight = calendarEl.clientHeight;
  const estimatedCellHeight = rowCount > 0 ? availableHeight / rowCount : availableHeight;
  const density =
    estimatedCellHeight < 104 ? 'tight' : estimatedCellHeight < 128 ? 'compact' : 'comfortable';
  calendarEl.dataset.monthDensity = density;

  document.querySelectorAll('#calendar .fc-daygrid-day[data-date]').forEach((cell) => {
    const dateKey = cell.getAttribute('data-date') || '';
    const count = visibleRangeEventMap.get(dateKey)?.length || 0;
    const cellDensity = count >= 5 ? 'dense' : count >= 3 ? 'busy' : 'calm';
    cell.setAttribute('data-density', cellDensity);
    cell.style.setProperty('--day-event-count', String(count));
  });
}

function normalisePreferencePayload(payload = {}) {
  const muted = Array.isArray(payload.muted_subjects) ? payload.muted_subjects : [];
  return {
    muted_subjects: Array.from(new Set(muted.map((item) => String(item || '').trim()).filter(Boolean))),
    show_completed_todos: Boolean(payload.show_completed_todos)
  };
}

async function loadCalendarPreferences() {
  try {
    const res = await fetchWithSession(`${API_BASE_URL}/api/calendar/preferences`);
    if (!res.ok) {
      return calendarPreferences;
    }
    const payload = await res.json();
    calendarPreferences = normalisePreferencePayload(payload?.data || {});
  } catch (error) {
    console.warn('Unable to load calendar preferences:', error);
  }
  syncFilterSheetState();
  return calendarPreferences;
}

async function saveCalendarPreferences(nextPreferences) {
  calendarPreferences = normalisePreferencePayload(nextPreferences);
  syncFilterSheetState();
  try {
    const res = await fetchWithSession(`${API_BASE_URL}/api/calendar/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(calendarPreferences)
    });
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const payload = await res.json();
    calendarPreferences = normalisePreferencePayload(payload?.data || calendarPreferences);
    syncFilterSheetState();
  } catch (error) {
    console.error('Unable to save calendar preferences:', error);
    if (typeof showOverlay === 'function') {
      showOverlay(t('filters.saveError', 'Filter konnten nicht gespeichert werden.'), 'error');
    }
  }
}

function isSubjectMuted(subject) {
  return Boolean(subject && calendarPreferences.muted_subjects.includes(subject));
}

function shouldDisplayEntry(entry) {
  if (!entry) {
    return false;
  }
  if (entry.typ === 'todo') {
    const status = entry.todo_status || (entry.is_done ? TODO_STATUS.done : TODO_STATUS.open);
    if (status === TODO_STATUS.done && !calendarPreferences.show_completed_todos) {
      return false;
    }
  }
  return !isSubjectMuted(entry.fach || '');
}

function ensureTemporaryTestClassContext(preferredSlug = '') {
  const classes = getTemporaryTestClasses();
  const selected =
    classes.find((cls) => cls.slug === preferredSlug) ||
    classes.find((cls) => cls.slug === currentClassSlug) ||
    classes[0];

  if (!selected) {
    setCurrentClassContext('test-class', 'test-class');
    return { classId: currentClassId, classSlug: currentClassSlug };
  }

  setCurrentClassContext(selected.id, selected.slug);
  return { classId: currentClassId, classSlug: currentClassSlug };
}

function buildTemporaryTestEntries(classSlug = currentClassSlug) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeClassSlug = (classSlug || 'test-class').toUpperCase();

  const plusDays = (amount) => {
    const value = new Date(today);
    value.setDate(value.getDate() + amount);
    return value;
  };

  return [
    {
      id: `temp-homework-${activeClassSlug}-1`,
      is_temporary_test_data: true,
      typ: 'hausaufgabe',
      fach: 'Mathematik',
      datum: formatEntryDate(plusDays(0)),
      enddatum: formatEntryDate(plusDays(0)),
      startzeit: '',
      endzeit: '',
      beschreibung: `Arbeitsblatt 7 fertigstellen und Aufgaben 3-6 kontrollieren. Testklasse: ${activeClassSlug}.`
    },
    {
      id: `temp-exam-${activeClassSlug}-1`,
      is_temporary_test_data: true,
      typ: 'pruefung',
      fach: 'Englisch',
      datum: formatEntryDate(plusDays(1)),
      enddatum: formatEntryDate(plusDays(1)),
      startzeit: '08:15:00',
      endzeit: '09:00:00',
      beschreibung: `Vocabulary Quiz Unit 5 for ${activeClassSlug}`
    },
    {
      id: `temp-event-${activeClassSlug}-1`,
      is_temporary_test_data: true,
      typ: 'event',
      fach: '',
      datum: formatEntryDate(plusDays(2)),
      enddatum: formatEntryDate(plusDays(2)),
      startzeit: '13:30:00',
      endzeit: '15:00:00',
      beschreibung: `Project presentation ${activeClassSlug}\n\nTemporary test event for the development environment.`
    },
    {
      id: `temp-todo-${activeClassSlug}-1`,
      is_temporary_test_data: true,
      typ: 'todo',
      fach: '',
      datum: formatEntryDate(plusDays(3)),
      enddatum: formatEntryDate(plusDays(3)),
      startzeit: '',
      endzeit: '',
      beschreibung: `Update study plan for science class ${activeClassSlug}`
    },
    {
      id: `temp-holiday-${activeClassSlug}-1`,
      is_temporary_test_data: true,
      typ: 'ferien',
      fach: '',
      datum: formatEntryDate(plusDays(5)),
      enddatum: formatEntryDate(plusDays(8)),
      startzeit: '',
      endzeit: '',
      beschreibung: `Sports week for ${activeClassSlug}`
    }
  ];
}

function withTemporaryTestEntries(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  if (!temporaryTestModeActive) {
    return safeEntries;
  }
  return [...safeEntries, ...buildTemporaryTestEntries(currentClassSlug)];
}

function formatDateLabel(dateStr, startStr, endStr, endDateStr) {
  if (!dateStr) return '';
  const locale = document.documentElement.lang || 'en-GB';
  const formatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const baseDate = new Date(`${dateStr}T00:00:00`);
  const formattedStart = formatter.format(baseDate);
  let formattedDate = formattedStart;
  if (endDateStr && endDateStr !== dateStr) {
    const endDate = new Date(`${endDateStr}T00:00:00`);
    const formattedEnd = formatter.format(endDate);
    formattedDate = `${formattedStart} – ${formattedEnd}`;
  }

  const startLabel = parseTimeLabel(startStr);
  const endLabel = parseTimeLabel(endStr);
  if (startLabel && endLabel) {
    return `${formattedDate} · ${startLabel} – ${endLabel}`;
  }
  if (startLabel) {
    return `${formattedDate} · ${startLabel}`;
  }
  return formattedDate;
}

function debounce(fn, wait = 160) {
  let timeout = null;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}

  function setCurrentClassContext(classId, classSlug) {
    currentClassId = classId || '';
    currentClassSlug = classSlug || '';
    if (currentClassId) {
      const slugToStore = currentClassSlug || currentClassId;
      if (typeof CLASS_STORAGE.set === 'function') {
        CLASS_STORAGE.set(currentClassId, slugToStore);
      }
    } else if (typeof CLASS_STORAGE.clear === 'function') {
      CLASS_STORAGE.clear();
    }
    const syncTarget = currentClassSlug || currentClassId || '';
    const picker = typeof window !== 'undefined' ? window.hmEntryClassPicker : null;
    if (picker && typeof picker.syncWithCurrentClass === 'function') {
      try {
        picker.syncWithCurrentClass(syncTarget);
      } catch (error) {
        console.warn('hmEntryClassPicker sync failed:', error);
      }
    }
  }

async function fetchSessionClassContext() {
  if (temporaryTestModeActive) {
    return ensureTemporaryTestClassContext(currentClassSlug);
  }
  try {
    const res = await fetchWithSession(`${API_BASE_URL}/api/session/class`);
    if (res.status === 401) {
      redirectToLogin();
      return null;
    }
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const classId = data?.class_id || '';
    const classSlug = data?.class_slug || '';
    if (classId) {
      setTemporaryTestMode(false);
      setCurrentClassContext(classId, classSlug || classId);
      return { classId: currentClassId, classSlug: currentClassSlug };
    }
    setTemporaryTestMode(false);
    setCurrentClassContext('', '');
    return { classId: '', classSlug: '' };
  } catch (error) {
    console.error('Failed to load class context:', error);
    if (activateTemporaryTestMode(error, 'session class context')) {
      return ensureTemporaryTestClassContext(currentClassSlug);
    }
    return null;
  }
}

async function ensureSessionClassContext() {
  if (currentClassId) {
    return { classId: currentClassId, classSlug: currentClassSlug };
  }
  return fetchSessionClassContext();
}

async function fetchAvailableClasses() {
  if (temporaryTestModeActive) {
    return getTemporaryTestClasses();
  }
  try {
    const res = await fetchWithSession(`${API_BASE_URL}/api/classes`);
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const rows = await res.json();
    setTemporaryTestMode(false);
    return (rows || []).filter((row) => row && row.slug);
  } catch (error) {
    console.error('Failed to load class list:', error);
    if (activateTemporaryTestMode(error, 'available classes')) {
      return getTemporaryTestClasses();
    }
    throw error;
  }
}

async function updateSessionClassSelection(slug, { silent = false } = {}) {
  if (!slug) {
    setCurrentClassContext('', '');
    return { classId: '', classSlug: '' };
  }

  if (temporaryTestModeActive) {
    return ensureTemporaryTestClassContext(slug);
  }

  try {
    const res = await fetchWithSession(`${API_BASE_URL}/api/session/class`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: slug })
    });
    if (!res.ok) {
      const message = await res.text().catch(() => '');
      throw new Error(message || `Status ${res.status}`);
    }
    const data = await res.json();
    const classId = data?.class_id || '';
    const classSlug = data?.class_slug || slug;
    setTemporaryTestMode(false);
    setCurrentClassContext(classId, classSlug || classId);
    return { classId: currentClassId, classSlug: currentClassSlug };
  } catch (error) {
    console.error('Failed to update class selection:', error);
    if (activateTemporaryTestMode(error, 'class selection')) {
      return ensureTemporaryTestClassContext(slug);
    }
    if (!silent) {
      showOverlay(classSelectorText.changeError, 'error');
    }
    throw error;
  }
}

async function initialiseClassSelector() {
  await fetchSessionClassContext();

  const container = document.querySelector('[data-class-selector]');
  const select = container ? container.querySelector('[data-class-select]') : null;
  if (!container || !select) {
    return;
  }

  if (!isClassSelectorAvailable()) {
    container.hidden = true;
    container.classList.remove('is-visible');
    select.disabled = true;
    return;
  }

  if (container.dataset.hmInitialised === 'true') {
    container.hidden = false;
    container.classList.add('is-visible');
    select.disabled = false;
    return;
  }

  const label = container.querySelector('label');
  if (label) {
    label.textContent = classSelectorText.label;
  }

  select.innerHTML = '';
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.disabled = true;
  placeholderOption.textContent = classSelectorText.placeholder;
  select.appendChild(placeholderOption);

  container.hidden = false;
  container.classList.add('is-visible');
  select.disabled = false;

  let classes = [];
  try {
    classes = await fetchAvailableClasses();
  } catch (error) {
    select.disabled = true;
    showOverlay(classSelectorText.error, 'error');
    return;
  }

  classes.forEach((cls) => {
    const option = document.createElement('option');
    option.value = cls.slug;
    option.textContent = getClassDisplayLabel(cls);
    select.appendChild(option);
  });

  let initialSlug = currentClassSlug;
  if (initialSlug && !classes.some((cls) => cls.slug === initialSlug)) {
    initialSlug = '';
  }
  if (!initialSlug && classes.length === 1) {
    initialSlug = classes[0].slug;
  }

  if (initialSlug) {
    select.value = initialSlug;
    if (!currentClassId || currentClassSlug !== initialSlug) {
      try {
        await updateSessionClassSelection(initialSlug, { silent: true });
      } catch (error) {
        select.value = '';
      }
    }
  } else {
    select.value = '';
    placeholderOption.selected = true;
  }

  select.addEventListener('change', async (event) => {
    const nextSlug = event.target.value;
    if (!nextSlug || nextSlug === currentClassSlug) {
      return;
    }

    const previousSlug = currentClassSlug;
    select.disabled = true;
    try {
      await updateSessionClassSelection(nextSlug);
      await loadCalendar();
    } catch (error) {
      if (previousSlug && classes.some((cls) => cls.slug === previousSlug)) {
        select.value = previousSlug;
      } else {
        select.value = '';
      }
    } finally {
      select.disabled = false;
    }
  });

  container.dataset.hmInitialised = 'true';
}

function toggleViewMode(canEdit, forceEdit = false) {
  const viewMode = document.getElementById('fc-view-mode');
  const editForm = document.getElementById('fc-edit-form');
  const editButton = document.querySelector('[data-role="edit-view"]');
  if (!viewMode || !editForm) return;
  if (canEdit && forceEdit) {
    viewMode.classList.add('is-hidden');
    editForm.classList.remove('is-hidden');
  } else {
    viewMode.classList.remove('is-hidden');
    editForm.classList.add('is-hidden');
  }
  if (editButton) {
    editButton.classList.toggle('is-hidden', !canEdit || forceEdit);
    editButton.onclick = () => toggleViewMode(canEdit, true);
  }
}

function setModalDescription(html) {
  const description = document.getElementById('fc-modal-desc');
  if (description) {
    description.innerHTML = html;
  }
}

function openModal(event) {
  const id = event.extendedProps?.sourceId ?? event.id;
  const {
    type,
    typeLabel,
    description,
    fach,
    datum,
    enddatum,
    startzeit,
    endzeit,
    canEdit,
    canUpdateStatus,
    todoStatus
  } = event.extendedProps;

  const overlay = document.getElementById('fc-modal-overlay');
  const editForm = document.getElementById('fc-edit-form');
  const subjectLabel = document.querySelector('[data-view-label="subject"]');
  if (!overlay) {
    console.error('Modal overlay missing.');
    return;
  }

  const { eventTitle: storedTitle, descriptionBody } = event.extendedProps;
  const { eventTitle: computedTitle, description: computedDescription } = splitEventDescription(type, description);
  const eventTitle = storedTitle !== undefined ? storedTitle : computedTitle;
  const detailDescription = descriptionBody !== undefined ? descriptionBody : computedDescription;
  const isEvent = type === 'event';
  const isHoliday = type === 'ferien';
  const isTodo = type === 'todo';
  const modalTitle = isEvent || isHoliday
    ? (eventTitle || detailDescription || typeLabel)
    : `${typeLabel}${fach ? ` · ${fach}` : ''}`;
  const subjectValue = isEvent ? (eventTitle || '—') : (fach || '—');

  const titleElement = document.getElementById('fc-modal-title');
  if (titleElement) {
    titleElement.textContent = modalTitle;
  }
  const typeElement = document.getElementById('fc-modal-type');
  if (typeElement) {
    typeElement.textContent = isHoliday ? (eventTitle || detailDescription || typeLabel) : typeLabel;
  }
  const subjectElement = document.getElementById('fc-modal-subject');
  if (subjectElement) {
    subjectElement.textContent = subjectValue;
  }
  const dateElement = document.getElementById('fc-modal-date');
  if (dateElement) {
    dateElement.textContent = formatDateLabel(datum, startzeit, endzeit, enddatum);
  }

  setModalDescription(detailDescription ? mdBold(detailDescription) : modalText.noDescription);

  if (subjectLabel) {
    subjectLabel.textContent = isEvent ? modalText.eventTitleLabel : modalText.subjectLabel;
  }

  const dateInput = document.getElementById('fc-edit-date');
  const descInput = document.getElementById('fc-edit-desc');
  const subjectSelect = document.getElementById('fc-edit-subject');
  const startInput = document.getElementById('fc-edit-start');
  const endInput = document.getElementById('fc-edit-end');
  const endDateInput = document.getElementById('fc-edit-end-date');
  const typeSelect = document.getElementById('fc-edit-type');
  const eventTitleInput = document.getElementById('fc-edit-event-title');

  document.getElementById('fc-entry-id').value = id;

  if (typeSelect) {
    typeSelect.value = type;
  }
  if (subjectSelect) {
    subjectSelect.value = fach || '';
  }
  if (eventTitleInput) {
    eventTitleInput.value = isEvent ? eventTitle : '';
  }
  if (editForm) {
    editForm.dataset.allowEmptySubject = 'true';
  }
  if (dateInput) {
    dateInput.value = datum || '';
  }
  if (startInput) {
    startInput.value = parseTimeLabel(startzeit);
  }
  if (endInput) {
    endInput.value = parseTimeLabel(endzeit);
    if (startInput && !startInput.value) {
      endInput.value = '';
      endInput.disabled = true;
    }
  }
  if (endDateInput) {
    endDateInput.value = enddatum || '';
  }
  if (descInput) {
    descInput.value = detailDescription;
  }

  editFormController = setupModalFormInteractions(document.getElementById('fc-edit-form'), ENTRY_FORM_MESSAGES);
  if (editFormController) {
    editFormController.setType(type);
    editFormController.evaluate();
  }

  const statusPanel = document.querySelector('[data-todo-status-panel]');
  const statusSelect = document.querySelector('[data-todo-status-select]');
  const statusSave = document.querySelector('[data-todo-status-save]');
  if (statusPanel) {
    statusPanel.classList.toggle('is-hidden', !isTodo || !canUpdateStatus);
  }
  if (statusSelect) {
    statusSelect.value = todoStatus || TODO_STATUS.open;
  }
  if (statusSave) {
    statusSave.onclick = () => saveTodoStatus(id, statusSelect ? statusSelect.value : TODO_STATUS.open);
  }

  const canEditEvent = Boolean(canEdit) && !isTodo;
  toggleViewMode(canEditEvent, false);

  const initialFocusTarget = overlay.querySelector('.hm-modal__close');

  if (window.hmModal) {
    window.hmModal.open(overlay, {
      initialFocus: initialFocusTarget,
      onRequestClose: closeModal
    });
  } else {
    overlay.classList.add('is-open');
    document.body.classList.add('hm-modal-open');
    if (initialFocusTarget && typeof initialFocusTarget.focus === 'function') {
      initialFocusTarget.focus();
    }
  }
}

function closeModal() {
  const overlay = document.getElementById('fc-modal-overlay');
  const editForm = document.getElementById('fc-edit-form');
  const viewMode = document.getElementById('fc-view-mode');
  if (overlay) {
    if (window.hmModal) {
      window.hmModal.close(overlay);
    } else {
      overlay.classList.remove('is-open');
      document.body.classList.remove('hm-modal-open');
    }
  }
  if (editForm) {
    editForm.reset();
    editForm.dataset.allowEmptySubject = 'true';
    editFormController = setupModalFormInteractions(editForm, ENTRY_FORM_MESSAGES);
    editFormController?.setType('event');
    editFormController?.evaluate();
    editForm.classList.add('is-hidden');
  }
  if (viewMode) {
    viewMode.classList.remove('is-hidden');
  }
  document.querySelector('[data-role="edit-view"]')?.classList.add('is-hidden');
  document.querySelector('[data-todo-status-panel]')?.classList.add('is-hidden');
}
window.closeModal = closeModal;

async function saveTodoStatus(id, todoStatus) {
  const status = todoStatus;
  const resolvedStatus = [TODO_STATUS.open, TODO_STATUS.inProgress, TODO_STATUS.done].includes(status)
    ? status
    : TODO_STATUS.open;
  const button = document.querySelector('[data-todo-status-save]');
  if (button) {
    button.disabled = true;
  }
  try {
    const res = await fetchWithSession(`${API_BASE_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo_status: resolvedStatus })
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Status ${res.status}`);
    }
    closeModal();
    await loadCalendar();
    showOverlay(modalText.statusSaveSuccess, 'success');
  } catch (error) {
    console.error('Failed to update todo status:', error);
    showOverlay(`${modalText.statusSaveError}\n${error.message}`, 'error');
  } finally {
    if (button) {
      button.disabled = false;
    }
  }
}

async function saveEdit(evt) {
  if (evt) {
    evt.preventDefault();
  }

  refreshPermissionState();

  const form = document.getElementById('fc-edit-form');
  if (!form) {
    console.error('Edit form missing.');
    return;
  }

  editFormController = setupModalFormInteractions(form, ENTRY_FORM_MESSAGES);
  editFormController?.evaluate();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById('fc-entry-id').value;
  const typeSelect = document.getElementById('fc-edit-type');
  const subjectSelect = document.getElementById('fc-edit-subject');
  const eventTitleInput = document.getElementById('fc-edit-event-title');
  const dateInput = document.getElementById('fc-edit-date');
  const endDateInput = document.getElementById('fc-edit-end-date');
  const startInput = document.getElementById('fc-edit-start');
  const endInput = document.getElementById('fc-edit-end');
  const descInput = document.getElementById('fc-edit-desc');
  const submitButton = form.querySelector('[data-role="submit"]');

  const type = typeSelect ? typeSelect.value : '';
  const isTodo = type === 'todo';
  const isoDate = dateInput ? parseSwissDate(dateInput.value.trim()) : null;
  if (!isoDate) {
    showOverlay(ENTRY_FORM_MESSAGES.invalidDate, 'error');
    dateInput?.focus();
    return;
  }

  let startValue = startInput ? startInput.value : '';
  let endValue = endInput && !endInput.disabled ? endInput.value : '';
  if (endValue && startValue && endValue < startValue) {
    showOverlay(ENTRY_FORM_MESSAGES.invalidEnd, 'error');
    return;
  }

  const rawEndDate = endDateInput ? endDateInput.value.trim() : '';
  const endDateIso = rawEndDate ? parseSwissDate(rawEndDate) : null;
  if (type === 'ferien') {
    if (!endDateIso) {
      showOverlay(ENTRY_FORM_MESSAGES.missingEndDate || ENTRY_FORM_MESSAGES.invalidDate, 'error');
      endDateInput?.focus();
      return;
    }
    startValue = '';
    endValue = '';
  }

  if (isoDate && endDateIso && endDateIso < isoDate) {
    showOverlay(ENTRY_FORM_MESSAGES.invalidEndDate || ENTRY_FORM_MESSAGES.invalidDate, 'error');
    endDateInput?.focus();
    return;
  }

  const subject = type === 'event' ? '' : (subjectSelect ? subjectSelect.value.trim() : '');
  const eventTitle = type === 'event' ? (eventTitleInput ? eventTitleInput.value.trim() : '') : '';
  const description = descInput ? descInput.value.trim() : '';

  const payloadDescription = type === 'event'
    ? eventTitle + (description ? `\n\n${description}` : '')
    : description;

  const resolvedEndDate = endDateIso || isoDate;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = modalButtons.saveLoading;
  }

  try {
    const targetUrl = isTodo ? `${API_BASE_URL}/api/todos/${id}` : `${API_BASE_URL}/update_entry`;
    const payload = isTodo
      ? {
          datum: isoDate,
          beschreibung: payloadDescription,
          startzeit: startValue ? `${startValue}:00` : null,
          endzeit: endValue ? `${endValue}:00` : null,
          enddatum: resolvedEndDate
        }
      : {
          id,
          type,
          date: isoDate,
          description: payloadDescription,
          startzeit: startValue ? `${startValue}:00` : null,
          endzeit: endValue ? `${endValue}:00` : null,
          enddatum: resolvedEndDate,
          fach: subject
        };
    const res = await fetchWithSession(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Role': role
      },
      body: JSON.stringify(payload)
    });
    if (await responseRequiresClassContext(res)) {
      setCurrentClassContext('', '');
      showOverlay(ENTRY_FORM_MESSAGES.missingClass || unauthorizedMessage, 'error');
      return;
    }
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Status ${res.status}`);
    }
    closeModal();
    await loadCalendar();
    showOverlay(CALENDAR_MODAL_MESSAGES.saveSuccess, 'success');
  } catch (e) {
    console.error('Failed to save entry:', e);
    showOverlay(`${modalText.saveError}\n${e.message}`, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = modalButtons.save;
    }
  }
}

async function deleteEntry() {
  const id = document.getElementById('fc-entry-id').value;

  refreshPermissionState();

  const deleteButton = document.querySelector('#fc-edit-form [data-role="delete"]');
  if (deleteButton) {
    deleteButton.disabled = true;
    deleteButton.textContent = modalButtons.deleteLoading;
  }

  const typeSelect = document.getElementById('fc-edit-type');
  const isTodo = typeSelect ? typeSelect.value === 'todo' : false;
  const deleteUrl = isTodo
    ? new URL(`${API_BASE_URL}/api/todos/${id}`)
    : new URL(`${API_BASE_URL}/delete_entry/${id}`);

  try {
    const res = await fetchWithSession(deleteUrl.toString(), {
      method: 'DELETE',
      headers: { 'X-Role': role }
    });
    if (await responseRequiresClassContext(res)) {
      setCurrentClassContext('', '');
      showOverlay(ENTRY_FORM_MESSAGES.missingClass || unauthorizedMessage, 'error');
      return;
    }
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Status ${res.status}`);
    }
    closeModal();
    await loadCalendar();
    showOverlay(modalText.deleteSuccess, 'success');
  } catch (e) {
    console.error('Failed to delete entry:', e);
    showOverlay(`${modalText.deleteError}\n${e.message}`, 'error');
  } finally {
    if (deleteButton) {
      deleteButton.disabled = false;
      deleteButton.textContent = modalButtons.delete;
    }
  }
}

window.deleteEntry = deleteEntry;
window.saveEdit = saveEdit;
window.openDeleteConfirmModal = openDeleteConfirmModal;
window.closeDeleteConfirmModal = closeDeleteConfirmModal;
window.confirmDeleteEntry = confirmDeleteEntry;

function initActionBar() {
  const actionBar = document.querySelector('.calendar-action-bar');
  if (!actionBar) return;
  const createBtn = actionBar.querySelector('[data-action="create"]');
  const exportBtn = actionBar.querySelector('[data-action="export"]');
  const backBtn = actionBar.querySelector('[data-action="back"]');

  applyActionBarPermissions();

  if (createBtn && createBtn.dataset.hmRoleBound !== 'true' && createBtn.dataset.hmCreateFallbackBound !== 'true') {
    createBtn.addEventListener('click', () => showEntryForm());
    createBtn.dataset.hmCreateFallbackBound = 'true';
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportClick);
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (typeof window.hmNavigate === 'function') {
        window.hmNavigate('/');
      } else {
        window.location.href = 'index.html';
      }
    });
  }
}

async function handleExportClick(event) {
  const button = event.currentTarget;
  if (!(button instanceof HTMLElement)) return;
  if (temporaryTestModeActive) {
    showOverlay(testModeText.actionDisabled, 'warning');
    return;
  }
  const label = button.querySelector('.calendar-cta__label, .calendar-action__label');
  const defaultLabel = label ? label.textContent : actionText.exportLabel;
  button.classList.add('is-loading');
  button.disabled = true;
  if (label) label.textContent = actionText.exportLoading;

  try {
    const context = await ensureSessionClassContext();
    const classId = context?.classId || currentClassId;

    const exportUrl = new URL(`${API_BASE_URL}/calendar.ics`);
    if (classId) {
      exportUrl.searchParams.set('class_id', classId);
    }

    const response = await fetchWithSession(exportUrl.toString());
    if (response.status === 401) {
      showOverlay(exportUnauthorizedMessage, 'error');
      redirectToLogin();
      return;
    }
    if (await responseRequiresClassContext(response)) {
      setCurrentClassContext('', '');
      showOverlay(classSelectorText.required, 'error');
      return;
    }
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = actionText.exportFileName || 'homework-calendar.ics';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    showOverlay(actionText.exportSuccess, 'success');
  } catch (error) {
    console.error('Export failed', error);
    showOverlay(actionText.exportError, 'error');
  } finally {
    button.classList.remove('is-loading');
    button.disabled = false;
    if (label) {
      label.textContent = defaultLabel || actionText.exportLabel;
    }
  }
}

function getISOWeekNumber(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
}

function updateWeekStrip(calendar) {
  const container = document.querySelector('[data-week-strip]');
  const list = document.querySelector('[data-week-strip-list]');
  if (!container || !list) return;

  const viewType = calendar.view.type ? calendar.view.type.toLowerCase() : '';
  const isWeekView = viewType.includes('week');

  if (!isWeekView) {
    container.classList.add('is-hidden');
    list.innerHTML = '';
    return;
  }

  container.classList.remove('is-hidden');
  list.innerHTML = '';

  const locale = document.documentElement.lang || 'en-GB';
  const formatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' });
  const { currentStart, currentEnd } = calendar.view;
  if (!currentStart || !currentEnd) {
    container.classList.add('is-hidden');
    list.innerHTML = '';
    return;
  }

  const startDate = new Date(currentStart.getTime());
  const endDate = new Date(currentEnd.getTime() - 1);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekNumber = String(getISOWeekNumber(startDate));
  const isCurrentWeek = today >= startDate && today <= endDate;

  const item = document.createElement('div');
  item.className = 'calendar-weekstrip__item';
  if (isCurrentWeek) {
    item.classList.add('is-current');
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'calendar-weekstrip__button';
  button.setAttribute('data-week-index', '0');
  button.innerHTML = `
    <span>${t('weekStrip.week', 'W')} ${weekNumber}</span>
    <span class="calendar-weekstrip__week">${formatter.format(startDate)} – ${formatter.format(endDate)}</span>
  `;

  item.appendChild(button);
  list.appendChild(item);
}

function createEventContent(info) {
  const type = info.event.extendedProps.type;
  const typeLabel = info.event.extendedProps.typeLabel || TYPE_LABELS[type] || info.event.title;
  const subjectLabel = info.event.title;
  const startLabel = info.event.extendedProps.startLabel;
  const endLabel = info.event.extendedProps.endLabel;
  const isMonthView = info.view.type === 'dayGridMonth';
  const metaPieces = [];
  if (info.event.extendedProps.isTemporaryTestData) {
    metaPieces.unshift(testModeText.entryLabel);
  }
  if (isMonthView) {
    if (startLabel && endLabel) {
      metaPieces.push(`${startLabel} – ${endLabel}`);
    } else if (startLabel) {
      metaPieces.push(startLabel);
    } else if (type !== 'ferien') {
      metaPieces.push(typeLabel);
    }
  } else {
    if (type !== 'ferien') {
      metaPieces.push(typeLabel);
    }
    if (startLabel && endLabel) {
      metaPieces.push(`${startLabel} – ${endLabel}`);
    } else if (startLabel) {
      metaPieces.push(startLabel);
    }
  }

  const container = document.createElement('div');
  container.className = 'calendar-event';
  container.setAttribute('data-event-type', type);
  container.setAttribute('data-event-view', info.view.type);
  container.title = metaPieces.length ? `${subjectLabel} · ${metaPieces.join(' · ')}` : subjectLabel;

  const title = document.createElement('span');
  title.className = 'calendar-event__title';
  title.textContent = subjectLabel;
  container.appendChild(title);

  if (metaPieces.length) {
    const meta = document.createElement('span');
    meta.className = 'calendar-event__meta';
    const dot = document.createElement('span');
    dot.className = 'calendar-event__dot';
    meta.appendChild(dot);
    const metaText = document.createElement('span');
    metaText.textContent = metaPieces.join(' · ');
    meta.appendChild(metaText);
    container.appendChild(meta);
  }

  return { domNodes: [container] };
}

function createCalendarEventId(entry) {
  const rawId = entry?.id ?? [
    entry?.typ || 'entry',
    entry?.datum || '',
    entry?.enddatum || '',
    entry?.startzeit || '',
    entry?.endzeit || '',
    entry?.fach || '',
    entry?.beschreibung || ''
  ].join('|');
  return `${entry?.typ || 'entry'}:${String(rawId)}`;
}

function dedupeCalendarEvents(events) {
  const seen = new Set();
  const duplicates = new Set();
  const result = [];

  events.forEach((event) => {
    if (seen.has(event.id)) {
      duplicates.add(event.id);
      return;
    }
    seen.add(event.id);
    result.push(event);
  });

  if (IS_DEV && duplicates.size > 0) {
    console.warn('[HWM calendar] Duplicate FullCalendar event IDs ignored:', Array.from(duplicates));
  }

  return result;
}

function getCalendarEventSignature(events) {
  return JSON.stringify(events.map((event) => [
    event.id,
    event.title,
    event.start,
    event.end || '',
    event.allDay,
    event.extendedProps?.type || '',
    event.extendedProps?.todoStatus || ''
  ]));
}

function normaliseEvent(entry) {
  const typeLabel = TYPE_LABELS[entry.typ] || entry.typ;
  const subject = entry.fach || '';
  const { eventTitle, description: descriptionBody } = splitEventDescription(entry.typ, entry.beschreibung || '');
  const todoTitle = (entry.beschreibung || '').split('\n')[0].trim();
  const displaySubject = entry.typ === 'event'
    ? (eventTitle || typeLabel)
    : entry.typ === 'ferien'
      ? ((entry.beschreibung || '').split('\n')[0].trim() || typeLabel)
    : entry.typ === 'todo'
      ? (todoTitle || typeLabel)
      : (subject || typeLabel);
  const startTime = entry.startzeit ? entry.startzeit.trim() : '';
  const endTime = entry.endzeit ? entry.endzeit.trim() : '';
  const endDate = entry.enddatum ? entry.enddatum.trim() : '';
  const startLabel = parseTimeLabel(startTime);
  const endLabel = parseTimeLabel(endTime);
  const hasDateRange = Boolean(endDate && endDate !== entry.datum);

  const isPrivate = Boolean(entry.is_private);
  const isOwned = Boolean(entry.is_owned);
  const isTemporaryTestData = Boolean(entry.is_temporary_test_data);
  const todoStatus = entry.todo_status || (entry.is_done ? TODO_STATUS.done : TODO_STATUS.open);
  const canEdit = !isTemporaryTestData && !isPrivate && Boolean(entry.can_edit);
  const canUpdateStatus = !isTemporaryTestData && isPrivate && isOwned && entry.typ === 'todo';

  const eventConfig = {
    id: createCalendarEventId(entry),
    title: displaySubject,
    start: startLabel ? `${entry.datum}T${startTime}` : entry.datum,
    allDay: !startLabel,
    extendedProps: {
      sourceId: entry.id,
      type: entry.typ,
      typeLabel,
      description: entry.beschreibung || '',
      fach: subject,
      datum: entry.datum,
      enddatum: entry.enddatum,
      startzeit: entry.startzeit,
      endzeit: entry.endzeit,
      eventTitle,
      descriptionBody,
      startLabel,
      endLabel,
      todoStatus,
      isPrivate,
      isOwned,
      canEdit,
      canUpdateStatus,
      isTemporaryTestData
    }
  };

  if (hasDateRange) {
    if (!startLabel) {
      eventConfig.end = addDaysToDate(endDate, 1);
      eventConfig.allDay = true;
    } else {
      const endTimeValue = endTime || startTime || '23:59:59';
      eventConfig.end = `${endDate}T${endTimeValue}`;
    }
  } else if (endLabel) {
    eventConfig.end = `${entry.datum}T${entry.endzeit}`;
  }

  return eventConfig;
}

function determineInitialView() {
  return window.matchMedia('(max-width: 767px)').matches ? 'timeGridWeek' : 'dayGridMonth';
}

function updateMonthLabel(calendar) {
  if (!calendar) {
    return;
  }
  const label = document.querySelector('[data-calendar-month-label]');
  if (label) {
    label.textContent = calendar.view.title;
  }
}

function updateViewButtons(calendar) {
  if (!calendar) {
    return;
  }
  const buttons = document.querySelectorAll('[data-calendar-view]');
  buttons.forEach((button) => {
    const targetView = button.getAttribute('data-calendar-view');
    const isActive = targetView === calendar.view.type;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function handleControlNavClick(event) {
  if (!calendarInstance) {
    return;
  }
  const action = event.currentTarget.getAttribute('data-calendar-nav');
  if (action === 'prev') {
    calendarInstance.prev();
  } else if (action === 'next') {
    calendarInstance.next();
  } else if (action === 'today') {
    calendarInstance.today();
  }
  updateMonthLabel(calendarInstance);
}

function handleControlViewClick(event) {
  if (!calendarInstance) {
    return;
  }
  const view = event.currentTarget.getAttribute('data-calendar-view');
  if (!view) {
    return;
  }
  calendarInstance.changeView(view);
  updateMonthLabel(calendarInstance);
  updateViewButtons(calendarInstance);
}

function setupCalendarControls(calendar) {
  const controls = document.querySelector('[data-calendar-controls]');
  if (!controls) {
    updateMonthLabel(calendar);
    updateViewButtons(calendar);
    return;
  }

  if (controls.dataset.enhanced === 'true') {
    updateMonthLabel(calendar);
    updateViewButtons(calendar);
    return;
  }

  controls.querySelectorAll('[data-calendar-nav]').forEach((button) => {
    button.addEventListener('click', handleControlNavClick);
  });

  controls.querySelectorAll('[data-calendar-view]').forEach((button) => {
    button.addEventListener('click', handleControlViewClick);
  });

  updateMonthLabel(calendar);
  updateViewButtons(calendar);
  controls.dataset.enhanced = 'true';
}

function syncFilterSheetState() {
  const subjectSet = new Set(calendarPreferences.muted_subjects || []);
  document.querySelectorAll('[data-subject-filter] input[type="checkbox"]').forEach((input) => {
    input.checked = !subjectSet.has(input.value);
  });
  const completedToggle = document.querySelector('[data-calendar-completed-todos] input[type="checkbox"]');
  if (completedToggle) {
    completedToggle.checked = Boolean(calendarPreferences.show_completed_todos);
  }
}

function openCalendarFilterSheet() {
  const sheet = document.querySelector('[data-calendar-filter-sheet]');
  if (!sheet) return;
  syncFilterSheetState();
  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
  const firstInput = sheet.querySelector('input');
  firstInput?.focus?.();
}

function closeCalendarFilterSheet() {
  const sheet = document.querySelector('[data-calendar-filter-sheet]');
  if (!sheet) return;
  sheet.classList.remove('is-open');
  sheet.setAttribute('aria-hidden', 'true');
}

function collectFilterPreferences() {
  const muted = [];
  document.querySelectorAll('[data-subject-filter] input[type="checkbox"]').forEach((input) => {
    if (!input.checked) {
      muted.push(input.value);
    }
  });
  const completedToggle = document.querySelector('[data-calendar-completed-todos] input[type="checkbox"]');
  return {
    muted_subjects: muted,
    show_completed_todos: Boolean(completedToggle?.checked)
  };
}

function setupCalendarFilterControls() {
  const trigger = document.querySelector('[data-calendar-filter-toggle]');
  const sheet = document.querySelector('[data-calendar-filter-sheet]');
  const close = document.querySelector('[data-calendar-filter-close]');
  if (!sheet || sheet.dataset.enhanced === 'true') {
    return;
  }
  trigger?.addEventListener('click', openCalendarFilterSheet);
  close?.addEventListener('click', closeCalendarFilterSheet);
  sheet.addEventListener('click', (event) => {
    if (event.target === sheet) {
      closeCalendarFilterSheet();
    }
  });
  sheet.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCalendarFilterSheet();
    }
  });
  sheet.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', async () => {
      await saveCalendarPreferences(collectFilterPreferences());
      await loadCalendar();
    });
  });
  sheet.dataset.enhanced = 'true';
}

function prepareCalendarContainer(calendarEl) {
  calendarEl.removeAttribute('role');
  calendarEl.removeAttribute('aria-live');
  calendarEl.setAttribute('aria-busy', 'false');
  calendarEl.removeAttribute('data-state');
  calendarEl.removeAttribute('data-loading-message');
  calendarEl.innerHTML = '';
}

function createCalendarSkeleton(message) {
  const placeholder = document.createElement('div');
  placeholder.className = 'loading-glass-placeholder loading-glass-placeholder--compact';
  placeholder.setAttribute('role', 'status');
  placeholder.setAttribute('aria-label', message);

  for (let index = 0; index < 5; index += 1) {
    const row = document.createElement('span');
    row.className = 'loading-glass-placeholder__row';
    row.setAttribute('aria-hidden', 'true');
    placeholder.appendChild(row);
  }

  return placeholder;
}

function showCalendarLoading(calendarEl, message) {
  calendarEl.setAttribute('data-state', 'loading');
  calendarEl.setAttribute('aria-busy', 'true');
  calendarEl.setAttribute('data-loading-message', message);
  if (calendarInstance) {
    return;
  }
  calendarEl.setAttribute('role', 'status');
  calendarEl.setAttribute('aria-live', 'polite');
  calendarEl.replaceChildren(createCalendarSkeleton(message));
}

function showCalendarError(calendarEl, message) {
  calendarEl.setAttribute('data-state', 'error');
  calendarEl.setAttribute('aria-busy', 'false');
  calendarEl.removeAttribute('data-loading-message');
  if (calendarInstance) {
    return;
  }
  calendarEl.setAttribute('role', 'alert');
  calendarEl.setAttribute('aria-live', 'polite');
  calendarEl.textContent = message;
}

function getDragConfirmOverlay() {
  return document.getElementById('calendar-drag-confirm-overlay');
}

function closeDragConfirmModal() {
  const overlay = getDragConfirmOverlay();
  if (!overlay) return;
  if (window.hmModal && typeof window.hmModal.close === 'function') {
    window.hmModal.close(overlay);
  } else {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('hm-modal-open');
  }
}

function openDragConfirmModal(info) {
  const overlay = getDragConfirmOverlay();
  pendingDragChange = info;
  const message = document.querySelector('[data-calendar-drag-message]');
  if (message && info?.event) {
    const title = info.event.title || t('dragConfirm.entryFallback', 'dieser Eintrag');
    const date = formatEntryDate(info.event.start);
    message.textContent = t(
      'dragConfirm.messageWithDate',
      'Möchtest du "{title}" auf den {date} verschieben?'
    )
      .replace('{title}', title)
      .replace('{date}', formatSwissDateFromISO(date));
  }
  if (!overlay) {
    if (window.confirm(message?.textContent || t('dragConfirm.message', 'Eintrag verschieben?'))) {
      confirmCalendarDrag();
    } else {
      cancelCalendarDrag();
    }
    return;
  }
  if (window.hmModal && typeof window.hmModal.open === 'function') {
    window.hmModal.open(overlay, {
      initialFocus: '[data-role="confirm"]',
      onRequestClose: cancelCalendarDrag
    });
  } else {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('hm-modal-open');
  }
}

function cancelCalendarDrag() {
  if (pendingDragChange && typeof pendingDragChange.revert === 'function') {
    pendingDragChange.revert();
  }
  pendingDragChange = null;
  closeDragConfirmModal();
}

async function confirmCalendarDrag() {
  const info = pendingDragChange;
  pendingDragChange = null;
  closeDragConfirmModal();
  if (!info?.event) {
    return;
  }
  const event = info.event;
  const props = event.extendedProps || {};
  const nextDate = formatEntryDate(event.start);
  const previousEnd = props.enddatum || props.datum || nextDate;
  const hadRange = previousEnd && props.datum && previousEnd !== props.datum;
  const deltaDays = info.delta && typeof info.delta.days === 'number' ? info.delta.days : 0;
  const nextEndDate = hadRange ? addDaysToDate(previousEnd, deltaDays) : nextDate;
  try {
    const res = await fetchWithSession(`${API_BASE_URL}/update_entry`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Role': role
      },
      body: JSON.stringify({
        id: props.sourceId ?? event.id,
        type: props.type,
        date: nextDate,
        description: props.type === 'event'
          ? (props.eventTitle || event.title || '') + (props.descriptionBody ? `\n\n${props.descriptionBody}` : '')
          : (props.description || ''),
        startzeit: props.startzeit || null,
        endzeit: props.endzeit || null,
        enddatum: nextEndDate,
        fach: props.fach || ''
      })
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Status ${res.status}`);
    }
    await loadCalendar();
    showOverlay(t('dragConfirm.success', 'Eintrag wurde verschoben.'), 'success');
  } catch (error) {
    console.error('Failed to move calendar entry:', error);
    if (typeof info.revert === 'function') {
      info.revert();
    }
    showOverlay(`${t('dragConfirm.error', 'Eintrag konnte nicht verschoben werden.')}\n${error.message}`, 'error');
  }
}

window.cancelCalendarDrag = cancelCalendarDrag;
window.confirmCalendarDrag = confirmCalendarDrag;

function initialiseCalendar(events) {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  const stableEvents = dedupeCalendarEvents(events);
  const nextSignature = getCalendarEventSignature(stableEvents);

  if (calendarInstance) {
    if (calendarInstance.view && calendarInstance.view.type) {
      lastCalendarViewType = calendarInstance.view.type;
    }
    if (typeof calendarInstance.getDate === 'function') {
      const activeDate = calendarInstance.getDate();
      if (activeDate) {
        lastCalendarDateValue = activeDate.valueOf();
      }
    }

    if (nextSignature !== lastCalendarEventSignature) {
      calendarAnimationIndex = 0;
      if (typeof calendarInstance.batchRendering === 'function') {
        calendarInstance.batchRendering(() => {
          calendarInstance.getEventSources().forEach((source) => source.remove());
          calendarInstance.removeAllEvents();
          calendarInstance.addEventSource(stableEvents);
        });
      } else {
        calendarInstance.getEventSources().forEach((source) => source.remove());
        calendarInstance.removeAllEvents();
        calendarInstance.addEventSource(stableEvents);
      }
      lastCalendarEventSignature = nextSignature;
    }

    calendarEl.removeAttribute('role');
    calendarEl.removeAttribute('aria-live');
    calendarEl.setAttribute('aria-busy', 'false');
    calendarEl.removeAttribute('data-state');
    calendarEl.removeAttribute('data-loading-message');
    updateWeekStrip(calendarInstance);
    updateMonthLabel(calendarInstance);
    updateViewButtons(calendarInstance);
    setupCalendarControls(calendarInstance);
    applyMonthCellMetrics(calendarInstance);
    return;
  }

  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }

  prepareCalendarContainer(calendarEl);
  calendarAnimationIndex = 0;

  const preferredView = lastCalendarViewType || determineInitialView();
  const preferredDate = lastCalendarDateValue ? new Date(lastCalendarDateValue) : null;

  const calendarConfig = {
    initialView: preferredView,
    locale: 'en-gb',
    firstDay: 1,
    height: '100%',
    contentHeight: '100%',
    expandRows: true,
    fixedWeekCount: false,
    showNonCurrentDates: true,
    handleWindowResize: true,
    headerToolbar: false,
    editable: !window.matchMedia('(max-width: 767px)').matches,
    eventStartEditable: !window.matchMedia('(max-width: 767px)').matches,
    eventDurationEditable: false,
    dayMaxEventRows: true,
    moreLinkClick: 'popover',
    moreLinkContent: (args) => `+ ${args.num} weitere`,
    eventOrder: 'start,-duration,allDay,title',
    buttonText: {
      month: t('views.month', 'Month'),
      week: t('views.week', 'Week'),
      day: t('views.day', 'Day')
    },
    events: stableEvents,
    eventContent: createEventContent,
    eventDidMount: (info) => {
      const eventContent = info.el.querySelector('.calendar-event');
      if (!eventContent) return;
      const delayIndex = calendarAnimationIndex % 10;
      const delay = `${delayIndex * 60}ms`;
      calendarAnimationIndex += 1;
      eventContent.style.setProperty('--calendar-event-delay', delay);
      eventContent.classList.add('calendar-event--enter');
      eventContent.addEventListener(
        'animationend',
        () => {
          eventContent.classList.remove('calendar-event--enter');
          eventContent.style.removeProperty('--calendar-event-delay');
        },
        { once: true }
      );
    },
    dateClick: async (info) => {
      if (temporaryTestModeActive) {
        showOverlay(testModeText.actionDisabled, 'warning');
        return;
      }
      await showEntryForm({ date: info.dateStr });
      const form = document.getElementById('entry-form');
      const dateInput = form?.querySelector('[data-field="date"] input');
      if (dateInput) {
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      form?._modalController?.evaluate?.();
    },
    eventClick: (info) => {
      info.jsEvent.preventDefault();
      openModal(info.event);
    },
    eventAllow: (dropInfo, draggedEvent) => {
      return Boolean(draggedEvent?.extendedProps?.canEdit) && draggedEvent.extendedProps.type !== 'todo';
    },
    eventDrop: (info) => {
      if (!info.event.extendedProps?.canEdit || info.event.extendedProps?.type === 'todo') {
        info.revert();
        return;
      }
      openDragConfirmModal(info);
    },
    datesSet: () => {
      updateWeekStrip(calendar);
      updateMonthLabel(calendar);
      updateViewButtons(calendar);
      applyMonthCellMetrics(calendar);
    }
  };

  if (preferredDate) {
    calendarConfig.initialDate = preferredDate;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, calendarConfig);

  calendar.render();
  calendarInstance = calendar;
  lastCalendarEventSignature = nextSignature;
  updateWeekStrip(calendarInstance);
  setupCalendarControls(calendarInstance);
  applyMonthCellMetrics(calendarInstance);

  if (IS_DEV) {
    const renderedCalendars = document.querySelectorAll('#calendar .fc').length;
    if (renderedCalendars > 1) {
      console.warn('[HWM calendar] Multiple FullCalendar DOM instances detected:', renderedCalendars);
    }
  }

  resizeHandler = debounce(() => {
    if (!calendarInstance) return;
    updateWeekStrip(calendarInstance);
    applyMonthCellMetrics(calendarInstance);
  }, 180);

  window.addEventListener('resize', resizeHandler);
}

async function loadCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;
  showCalendarLoading(calendarEl, t('status.loading', 'Loading calendar …'));

  const requestId = ++calendarLoadSequence;

  await loadCalendarPreferences();
  const context = await ensureSessionClassContext();
  const classId = context?.classId || currentClassId;
  const classSlug = context?.classSlug || currentClassSlug;

  try {
    const entriesUrl = new URL(`${API_BASE_URL}/entries`);
    if (classId) {
      entriesUrl.searchParams.set('class_id', classId);
    }

    const res = await fetchWithSession(entriesUrl.toString());
    if (requestId !== calendarLoadSequence) {
      return;
    }
    if (res.status === 401) {
      publishMobileCalendarState({
        events: [],
        classId: '',
        classSlug: '',
        error: unauthorizedMessage
      });
      redirectToLogin();
      return;
    }
    if (await responseRequiresClassContext(res)) {
      setCurrentClassContext('', '');
      const message = classSelectorEnabled ? classSelectorText.required : unauthorizedMessage;
      publishMobileCalendarState({ events: lastCalendarEvents, classId: '', classSlug: '', error: message });
      showCalendarError(calendarEl, message);
      return;
    }
    if (!res.ok) {
      throw new Error(`API error (${res.status})`);
    }

    setTemporaryTestMode(false);
    const entries = withTemporaryTestEntries(await res.json()).filter(shouldDisplayEntry);
    if (requestId !== calendarLoadSequence) {
      return;
    }
    const events = dedupeCalendarEvents(entries.map(normaliseEvent));
    publishMobileCalendarState({ events, classId, classSlug: currentClassSlug, error: '' });
    initialiseCalendar(events);
  } catch (err) {
    if (requestId !== calendarLoadSequence) {
      return;
    }
    console.error('Failed to load calendar:', err);
    const usingTemporaryTestMode = activateTemporaryTestMode(err, 'calendar entries');
    const fallbackContext = usingTemporaryTestMode
      ? ensureTemporaryTestClassContext(classSlug || currentClassSlug)
      : { classId: currentClassId, classSlug: currentClassSlug };
    const fallbackEvents = dedupeCalendarEvents(withTemporaryTestEntries([]).filter(shouldDisplayEntry).map(normaliseEvent));
    publishMobileCalendarState({
      events: fallbackEvents,
      classId: fallbackContext.classId,
      classSlug: fallbackContext.classSlug,
      error: ''
    });
    initialiseCalendar(fallbackEvents);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initActionBar();
  setupCalendarFilterControls();
  (async () => {
    try {
      await initialiseClassSelector();
      await loadCalendar();
    } catch (error) {
      console.error('Failed to initialise calendar:', error);
    }
  })();
});
}
