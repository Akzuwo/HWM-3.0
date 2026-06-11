// kalender.js
if (typeof window !== 'undefined' && window.__hmKalenderLoaded) {
  console.warn('kalender.js was loaded more than once. Skipping duplicate execution.');
} else {
  if (typeof window !== 'undefined') {
    window.__hmKalenderLoaded = true;
  }

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
const CALENDAR_PERMISSIONS = window.hmCalendar?.permissions || null;
const FALLBACK_PERMISSION_STATE = CALENDAR_PERMISSIONS
  ? CALENDAR_PERMISSIONS.getState()
  : { role: 'guest', canManageEntries: false, canCreatePersonalTodos: false, classSelectorEnabled: false };

let role = FALLBACK_PERMISSION_STATE.role;
let userCanManageEntries = FALLBACK_PERMISSION_STATE.canManageEntries;
let canCreatePersonalTodos = FALLBACK_PERMISSION_STATE.canCreatePersonalTodos;
let classSelectorEnabled = FALLBACK_PERMISSION_STATE.classSelectorEnabled;

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
  if (CALENDAR_PERMISSIONS) {
    CALENDAR_PERMISSIONS.updateActionBarPermissions({
      onCreate: () => showEntryForm(),
      canManageEntries: userCanManageEntries,
      canCreatePersonalTodos
    });
    return;
  }

  if (typeof document === 'undefined') {
    return;
  }

  const actionBar = document.querySelector('.calendar-action-bar');
  if (!actionBar) {
    return;
  }

  const createBtn = actionBar.querySelector('[data-action="create"]');
  if (!createBtn) {
    return;
  }

  if (!userCanManageEntries && !canCreatePersonalTodos) {
    createBtn.disabled = true;
    createBtn.setAttribute('aria-disabled', 'true');
  } else {
    createBtn.disabled = false;
    createBtn.removeAttribute('aria-disabled');
    if (!createBtn.dataset.hmRoleBound) {
      createBtn.addEventListener('click', () => showEntryForm());
      createBtn.dataset.hmRoleBound = 'true';
    }
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
  required: t('classSelector.required', 'Please select a class to view the calendar.')
};

const TYPE_LABELS = {
  hausaufgabe: t('legend.homework', 'Homework'),
  pruefung: t('legend.exam', 'Exam'),
  event: t('legend.event', 'Event'),
  ferien: t('legend.holiday', 'Holidays & Breaks'),
  todo: t('legend.todo', 'ToDo')
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

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.href = 'login.html';
}

const modalText = {
  noDescription: modalT('noDescription', '<em>No description provided.</em>'),
  subjectLabel: modalT('labels.subject', 'Subject'),
  eventTitleLabel: modalT('labels.eventTitle', 'Event title'),
  deleteConfirm: modalT('confirmDelete', 'Do you really want to delete this entry?'),
  deleteError: modalT('messages.deleteError', 'Unable to delete the entry.'),
  deleteSuccess: modalT('messages.deleteSuccess', 'Entry deleted successfully.'),
  saveError: modalT('messages.saveError', 'Unable to save the entry.')
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
      setCurrentClassContext(classId, classSlug || classId);
      return { classId: currentClassId, classSlug: currentClassSlug };
    }
    setCurrentClassContext('', '');
    return { classId: '', classSlug: '' };
  } catch (error) {
    console.error('Failed to load class context:', error);
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
  try {
    const res = await fetchWithSession(`${API_BASE_URL}/api/classes`);
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const rows = await res.json();
    return (rows || []).filter((row) => row && row.slug);
  } catch (error) {
    console.error('Failed to load class list:', error);
    throw error;
  }
}

async function updateSessionClassSelection(slug, { silent = false } = {}) {
  if (!slug) {
    setCurrentClassContext('', '');
    return { classId: '', classSlug: '' };
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
    setCurrentClassContext(classId, classSlug || classId);
    return { classId: currentClassId, classSlug: currentClassSlug };
  } catch (error) {
    console.error('Failed to update class selection:', error);
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

  if (!classSelectorEnabled) {
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
    option.textContent = cls.title ? `${cls.title} (${cls.slug})` : cls.slug;
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

function toggleViewMode(canEdit) {
  const viewMode = document.getElementById('fc-view-mode');
  const editForm = document.getElementById('fc-edit-form');
  if (!viewMode || !editForm) return;
  if (canEdit) {
    viewMode.classList.add('is-hidden');
    editForm.classList.remove('is-hidden');
  } else {
    viewMode.classList.remove('is-hidden');
    editForm.classList.add('is-hidden');
  }
}

function setModalDescription(html) {
  const description = document.getElementById('fc-modal-desc');
  if (description) {
    description.innerHTML = html;
  }
}

function openModal(event) {
  const { id } = event;
  const { type, typeLabel, description, fach, datum, enddatum, startzeit, endzeit, canEdit } = event.extendedProps;

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
  const modalTitle = isEvent ? (eventTitle || typeLabel) : `${typeLabel}${fach ? ` · ${fach}` : ''}`;
  const subjectValue = isEvent ? (eventTitle || '—') : (fach || '—');

  const titleElement = document.getElementById('fc-modal-title');
  if (titleElement) {
    titleElement.textContent = modalTitle;
  }
  const typeElement = document.getElementById('fc-modal-type');
  if (typeElement) {
    typeElement.textContent = typeLabel;
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

  const canEditEvent = Boolean(canEdit);
  toggleViewMode(canEditEvent);

  const initialFocusTarget = canEditEvent
    ? document.querySelector('#fc-edit-form [data-hm-modal-initial-focus]')
    : overlay.querySelector('.hm-modal__close');

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
}
window.closeModal = closeModal;

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
  const exportBtn = actionBar.querySelector('[data-action="export"]');
  const backBtn = actionBar.querySelector('[data-action="back"]');

  applyActionBarPermissions();

  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportClick);
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

async function handleExportClick(event) {
  const button = event.currentTarget;
  if (!(button instanceof HTMLElement)) return;
  const label = button.querySelector('.calendar-action__label');
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
  const metaPieces = [typeLabel];
  if (startLabel && endLabel) {
    metaPieces.push(`${startLabel} – ${endLabel}`);
  } else if (startLabel) {
    metaPieces.push(startLabel);
  }

  const container = document.createElement('div');
  container.className = 'calendar-event';
  container.setAttribute('data-event-type', type);

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

function normaliseEvent(entry) {
  const typeLabel = TYPE_LABELS[entry.typ] || entry.typ;
  const subject = entry.fach || '';
  const { eventTitle, description: descriptionBody } = splitEventDescription(entry.typ, entry.beschreibung || '');
  const todoTitle = (entry.beschreibung || '').split('\n')[0].trim();
  const displaySubject = entry.typ === 'event'
    ? (eventTitle || typeLabel)
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
  const canEdit = isPrivate ? isOwned : userCanManageEntries;

  const eventConfig = {
    id: String(entry.id),
    title: displaySubject,
    start: startLabel ? `${entry.datum}T${startTime}` : entry.datum,
    allDay: !startLabel,
    extendedProps: {
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
      isPrivate,
      isOwned,
      canEdit
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

function prepareCalendarContainer(calendarEl) {
  calendarEl.removeAttribute('role');
  calendarEl.removeAttribute('aria-live');
  calendarEl.setAttribute('aria-busy', 'false');
  calendarEl.removeAttribute('data-state');
  calendarEl.innerHTML = '';
}

function showCalendarLoading(calendarEl, message) {
  calendarEl.setAttribute('data-state', 'loading');
  calendarEl.setAttribute('role', 'status');
  calendarEl.setAttribute('aria-live', 'polite');
  calendarEl.setAttribute('aria-busy', 'true');
  calendarEl.innerHTML = `
    <span class="calendar-loading__spinner" aria-hidden="true"></span>
    <span class="calendar-loading__text">${message}</span>
  `;
}

function showCalendarError(calendarEl, message) {
  calendarEl.setAttribute('data-state', 'error');
  calendarEl.setAttribute('role', 'alert');
  calendarEl.setAttribute('aria-live', 'polite');
  calendarEl.setAttribute('aria-busy', 'false');
  calendarEl.textContent = message;
}

function initialiseCalendar(events) {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

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
    calendarInstance.destroy();
    calendarInstance = null;
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
    height: 'auto',
    contentHeight: 'auto',
    expandRows: true,
    handleWindowResize: true,
    headerToolbar: false,
    buttonText: {
      month: t('views.month', 'Month'),
      week: t('views.week', 'Week'),
      day: t('views.day', 'Day')
    },
    events,
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
    datesSet: () => {
      updateWeekStrip(calendar);
      updateMonthLabel(calendar);
      updateViewButtons(calendar);
    }
  };

  if (preferredDate) {
    calendarConfig.initialDate = preferredDate;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, calendarConfig);

  calendar.render();
  calendarInstance = calendar;
  updateWeekStrip(calendarInstance);
  setupCalendarControls(calendarInstance);

  resizeHandler = debounce(() => {
    if (!calendarInstance) return;
    updateWeekStrip(calendarInstance);
  }, 180);

  window.addEventListener('resize', resizeHandler);
}

async function loadCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;
  showCalendarLoading(calendarEl, t('status.loading', 'Loading calendar …'));

  const context = await ensureSessionClassContext();
  const classId = context?.classId || currentClassId;

  try {
    const entriesUrl = new URL(`${API_BASE_URL}/entries`);
    if (classId) {
      entriesUrl.searchParams.set('class_id', classId);
    }

    const res = await fetchWithSession(entriesUrl.toString());
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
      publishMobileCalendarState({ events: [], classId: '', classSlug: '', error: message });
      showCalendarError(calendarEl, message);
      return;
    }
    if (!res.ok) {
      throw new Error(`API error (${res.status})`);
    }

    const entries = await res.json();
    const events = entries.map(normaliseEvent);
    publishMobileCalendarState({ events, classId, classSlug: currentClassSlug, error: '' });
    initialiseCalendar(events);
  } catch (err) {
    console.error('Failed to load calendar:', err);
    publishMobileCalendarState({
      events: [],
      classId: currentClassId,
      classSlug: currentClassSlug,
      error: t('status.error', 'Unable to load calendar entries!')
    });
    showCalendarError(calendarEl, t('status.error', 'Unable to load calendar entries!'));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initActionBar();
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
