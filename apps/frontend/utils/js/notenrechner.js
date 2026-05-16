import {
  MAX_GRADE,
  MIN_GRADE,
  calculateDeficitPoints,
  calculateOverallExactAverage,
  calculateOverallRoundedAverage,
  calculateSubjectAverage,
  calculateTotalDeficitPoints,
  createOverallSummary,
  getSubjectSummary,
  isPositiveWeight,
  isValidGradeValue,
  normalizeNumber,
  roundToHalf,
} from './grade-calculations.js';
import { deleteGradeVault, getGradeVault, putGradeVault } from './grade-vault-api.js';
import { decryptGradeVault, encryptGradeVault } from './grade-vault-crypto.js';

const noteInput = document.getElementById('note');
const weightInput = document.getElementById('gewichtung');
const addButton = document.getElementById('add');
const targetInput = document.getElementById('ziel');
const nextWeightInput = document.getElementById('zusaetzlich');
const calculateButton = document.getElementById('berechnen');
const gradeError = document.getElementById('gradeError');
const weightError = document.getElementById('weightError');
const targetError = document.getElementById('targetError');
const nextWeightError = document.getElementById('nextWeightError');
const averageValue = document.getElementById('averageValue');
const requiredGrade = document.getElementById('zielNote');
const addForm = document.getElementById('addForm');
const targetForm = document.getElementById('targetForm');
const tableBody = document.querySelector('#notenTabelle tbody');

const syncPasswordForm = document.getElementById('gradeSyncPasswordForm');
const syncPasswordInput = document.getElementById('gradeSyncPassword');
const syncError = document.getElementById('gradeSyncError');
const syncStatus = document.getElementById('gradeSyncStatus');
const syncReloadButton = document.getElementById('gradeSyncReload');
const syncDisableDeviceButton = document.getElementById('gradeSyncDisableDevice');
const syncDeleteServerButton = document.getElementById('gradeSyncDeleteServer');
const vaultSection = document.getElementById('gradeVaultSection');
const vaultMeta = document.getElementById('gradeVaultMeta');
const vaultSaveButton = document.getElementById('gradeVaultSave');
const overallElement = document.getElementById('gradeVaultOverall');
const subjectForm = document.getElementById('gradeSubjectForm');
const subjectNameInput = document.getElementById('gradeSubjectName');
const subjectShortNameInput = document.getElementById('gradeSubjectShortName');
const subjectList = document.getElementById('gradeSubjectList');
const subjectTitle = document.getElementById('gradeSelectedSubjectTitle');
const subjectMeta = document.getElementById('gradeSelectedSubjectMeta');
const subjectDeleteButton = document.getElementById('gradeSubjectDelete');
const gradeEntryForm = document.getElementById('gradeEntryForm');
const gradeEntryTitle = document.getElementById('gradeEntryTitle');
const gradeEntryValue = document.getElementById('gradeEntryValue');
const gradeEntryWeight = document.getElementById('gradeEntryWeight');
const gradeEntryDate = document.getElementById('gradeEntryDate');
const gradeEntryList = document.getElementById('gradeEntryList');

const t = window.hmI18n ? window.hmI18n.scope('gradeCalculator') : (key, fallback) => fallback;

const messages = {
  invalidNumber: t('messages.invalidNumber', 'Please enter valid numbers.'),
  required: t('messages.required', 'Please fill in this field.'),
  gradeRange: t('messages.gradeRange', 'Grades must be between 1 and 6.'),
  weightPositive: t('messages.weightPositive', 'Weight must be greater than 0.'),
  targetRange: t('messages.targetRange', 'The target average must be between 1 and 6.'),
  nextWeight: t('messages.nextWeight', 'The next grade weight must be greater than 0.'),
  requiredGradeLabel: t('messages.requiredGradeLabel', 'Required grade'),
  unachievableDetail: t('messages.unachievableDetail', 'Target not reachable (max. {max})'),
  deleteAction: t('messages.deleteAction', 'Remove grade'),
  editAction: t('messages.editAction', 'Edit grade'),
  saveAction: t('messages.saveAction', 'Save changes'),
  cancelAction: t('messages.cancelAction', 'Cancel editing'),
};

const DEVICE_SYNC_KEY = 'hm.gradeVault.syncEnabled';
const STEP_PRECISION = 1e-9;
const simpleGrades = [];
let editingIndex = null;

function getDeviceSyncEnabled() {
  try {
    return localStorage.getItem(DEVICE_SYNC_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

function setDeviceSyncEnabled(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(DEVICE_SYNC_KEY, 'true');
    } else {
      localStorage.removeItem(DEVICE_SYNC_KEY);
    }
  } catch (error) {
    /* ignore unavailable localStorage */
  }
}

const vaultState = {
  enabledOnDevice: getDeviceSyncEnabled(),
  unlocked: false,
  password: '',
  revision: 0,
  updatedAt: null,
  vault: createEmptyVault(),
  selectedSubjectId: null,
  conflict: false,
  saving: false,
};

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyVault() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    subjects: [],
    settings: {
      roundSubjectAveragesToHalf: true,
    },
  };
}

function notify(message, variant = 'info') {
  if (window.hmToast?.[variant]) {
    window.hmToast[variant](message);
  } else if (typeof showOverlay === 'function') {
    showOverlay(message);
  }
}

function formatNumber(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : '–';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseValue(input) {
  return normalizeNumber(input.value);
}

function setFieldState(input, errorElement, message, shouldShow) {
  if (!input || !errorElement) {
    return;
  }
  if (message && shouldShow) {
    input.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    errorElement.textContent = message;
  } else {
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    errorElement.textContent = '';
  }
}

function resetRequiredGrade() {
  requiredGrade.textContent = `${messages.requiredGradeLabel}: –`;
  requiredGrade.dataset.state = 'idle';
}

function focusNoteField() {
  if (typeof noteInput?.focus === 'function') {
    noteInput.focus();
    noteInput.select?.();
  }
}

function updateButtonStates() {
  const gradeValue = parseValue(noteInput);
  const weightValue = parseValue(weightInput);
  const targetValue = parseValue(targetInput);
  const nextWeightValue = parseValue(nextWeightInput);

  const enableAdd = isValidGradeValue(gradeValue) && isPositiveWeight(weightValue);
  const enableCalc =
    isValidGradeValue(targetValue) &&
    isPositiveWeight(nextWeightValue) &&
    simpleGrades.length > 0;

  addButton.disabled = !enableAdd;
  addButton.setAttribute('aria-disabled', String(!enableAdd));
  calculateButton.disabled = !enableCalc;
  calculateButton.setAttribute('aria-disabled', String(!enableCalc));
}

function validateInputs(showFeedback = false) {
  const gradeRaw = noteInput.value.trim();
  const weightRaw = weightInput.value.trim();
  const gradeValue = normalizeNumber(gradeRaw);
  const weightValue = normalizeNumber(weightRaw);
  let gradeMessage = '';
  let weightMessage = '';

  if (gradeRaw === '') {
    gradeMessage = messages.required;
  } else if (Number.isNaN(gradeValue)) {
    gradeMessage = messages.invalidNumber;
  } else if (!isValidGradeValue(gradeValue)) {
    gradeMessage = messages.gradeRange;
  }

  if (weightRaw === '') {
    weightMessage = messages.required;
  } else if (Number.isNaN(weightValue)) {
    weightMessage = messages.invalidNumber;
  } else if (!isPositiveWeight(weightValue)) {
    weightMessage = messages.weightPositive;
  }

  setFieldState(noteInput, gradeError, gradeMessage, showFeedback || gradeRaw !== '');
  setFieldState(weightInput, weightError, weightMessage, showFeedback || weightRaw !== '');
  updateButtonStates();
  return !gradeMessage && !weightMessage;
}

function validateGoalInputs(showFeedback = false) {
  const targetRaw = targetInput.value.trim();
  const nextWeightRaw = nextWeightInput.value.trim();
  const targetValue = normalizeNumber(targetRaw);
  const nextWeightValue = normalizeNumber(nextWeightRaw);
  let targetMessage = '';
  let nextWeightMessage = '';

  if (targetRaw === '') {
    targetMessage = messages.required;
  } else if (Number.isNaN(targetValue)) {
    targetMessage = messages.invalidNumber;
  } else if (!isValidGradeValue(targetValue)) {
    targetMessage = messages.targetRange;
  }

  if (nextWeightRaw === '') {
    nextWeightMessage = messages.required;
  } else if (Number.isNaN(nextWeightValue)) {
    nextWeightMessage = messages.invalidNumber;
  } else if (!isPositiveWeight(nextWeightValue)) {
    nextWeightMessage = messages.nextWeight;
  }

  setFieldState(targetInput, targetError, targetMessage, showFeedback || targetRaw !== '');
  setFieldState(nextWeightInput, nextWeightError, nextWeightMessage, showFeedback || nextWeightRaw !== '');
  if (showFeedback && (targetMessage || nextWeightMessage)) {
    notify(targetMessage || nextWeightMessage, 'error');
  }
  updateButtonStates();
  return !targetMessage && !nextWeightMessage;
}

function resetInputs() {
  noteInput.value = '';
  weightInput.value = '';
  setFieldState(noteInput, gradeError, '', false);
  setFieldState(weightInput, weightError, '', false);
  updateButtonStates();
}

function addSimpleGrade(event) {
  event?.preventDefault();
  if (!validateInputs(true)) {
    return;
  }
  simpleGrades.push({ note: parseValue(noteInput), gewichtung: parseValue(weightInput) });
  editingIndex = null;
  resetInputs();
  focusNoteField();
  updateSimpleGradeList();
  calculateSimpleAverage();
  validateGoalInputs(false);
}

function calculateSimpleAverage() {
  if (!simpleGrades.length) {
    averageValue.textContent = '–';
    return;
  }
  const totalWeight = simpleGrades.reduce((acc, item) => acc + item.gewichtung, 0);
  const sum = simpleGrades.reduce((acc, item) => acc + item.note * item.gewichtung, 0);
  averageValue.textContent = (sum / totalWeight).toFixed(2);
}

function calculateRequiredGrade(event) {
  event?.preventDefault();
  if (!validateGoalInputs(true) || !simpleGrades.length) {
    return;
  }
  const target = parseValue(targetInput);
  const additionalWeight = parseValue(nextWeightInput);
  const totalWeight = simpleGrades.reduce((acc, item) => acc + item.gewichtung, 0);
  const sum = simpleGrades.reduce((acc, item) => acc + item.note * item.gewichtung, 0);
  const required = ((target * (totalWeight + additionalWeight)) - sum) / additionalWeight;

  if (!Number.isFinite(required)) {
    resetRequiredGrade();
    return;
  }
  if (required < MIN_GRADE - STEP_PRECISION || required > MAX_GRADE + STEP_PRECISION) {
    requiredGrade.textContent = `${messages.requiredGradeLabel}: ${messages.unachievableDetail.replace('{max}', MAX_GRADE.toFixed(1))}`;
    requiredGrade.dataset.state = 'unreachable';
  } else {
    requiredGrade.textContent = `${messages.requiredGradeLabel}: ${required.toFixed(2)}`;
    requiredGrade.dataset.state = 'ready';
  }
}

function cancelEdit() {
  editingIndex = null;
  updateSimpleGradeList();
}

function saveSimpleEdit(index, gradeField, weightField) {
  const gradeValue = normalizeNumber(gradeField.value);
  const weightValue = normalizeNumber(weightField.value);
  if (!isValidGradeValue(gradeValue) || !isPositiveWeight(weightValue)) {
    notify(!isValidGradeValue(gradeValue) ? messages.gradeRange : messages.weightPositive, 'error');
    return;
  }
  simpleGrades[index] = { note: gradeValue, gewichtung: weightValue };
  editingIndex = null;
  updateSimpleGradeList();
  calculateSimpleAverage();
  validateGoalInputs(false);
}

function createEditControls(row, index, entry) {
  row.classList.add('editing');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td><input type="number" step="0.01" min="${MIN_GRADE}" max="${MAX_GRADE}" class="grade-calculator__input" value="${entry.note}"></td>
    <td><input type="number" step="0.01" min="0.01" class="grade-calculator__input" value="${entry.gewichtung}"></td>
    <td class="grade-calculator__edit-actions"></td>
  `;
  const [gradeField, weightField] = row.querySelectorAll('input');
  const actionsCell = row.querySelector('.grade-calculator__edit-actions');
  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'grade-calculator__edit-button';
  saveButton.textContent = '✔';
  saveButton.setAttribute('aria-label', messages.saveAction);
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'grade-calculator__edit-button';
  cancelButton.textContent = '✖';
  cancelButton.setAttribute('aria-label', messages.cancelAction);
  actionsCell.append(saveButton, cancelButton);
  saveButton.addEventListener('click', () => saveSimpleEdit(index, gradeField, weightField));
  cancelButton.addEventListener('click', cancelEdit);
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveSimpleEdit(index, gradeField, weightField);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  });
  gradeField.focus();
}

function updateSimpleGradeList() {
  tableBody.innerHTML = '';
  simpleGrades.forEach((entry, index) => {
    const row = document.createElement('tr');
    if (editingIndex === index) {
      createEditControls(row, index, entry);
    } else {
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.note.toFixed(2)}</td>
        <td>${entry.gewichtung.toFixed(2)}</td>
        <td class="grade-calculator__actions"></td>
      `;
      const actions = row.querySelector('.grade-calculator__actions');
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'grade-calculator__edit-trigger';
      editButton.textContent = '✎';
      editButton.title = messages.editAction;
      editButton.setAttribute('aria-label', messages.editAction);
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'grade-calculator__delete-button';
      deleteButton.textContent = '✕';
      deleteButton.title = messages.deleteAction;
      deleteButton.setAttribute('aria-label', messages.deleteAction);
      actions.append(editButton, deleteButton);
      editButton.addEventListener('click', (event) => {
        event.stopPropagation();
        editingIndex = index;
        updateSimpleGradeList();
      });
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        simpleGrades.splice(index, 1);
        editingIndex = null;
        updateSimpleGradeList();
        calculateSimpleAverage();
        if (!simpleGrades.length) {
          resetRequiredGrade();
        }
        validateGoalInputs(false);
      });
      row.addEventListener('click', (event) => {
        if (!event.target.closest('button')) {
          editingIndex = index;
          updateSimpleGradeList();
        }
      });
    }
    tableBody.appendChild(row);
  });
  updateButtonStates();
}

function normalizeVault(rawVault) {
  const vault = rawVault && typeof rawVault === 'object' ? rawVault : createEmptyVault();
  return {
    version: 1,
    updatedAt: vault.updatedAt || new Date().toISOString(),
    subjects: Array.isArray(vault.subjects) ? vault.subjects.map(normalizeSubject) : [],
    settings: {
      roundSubjectAveragesToHalf: true,
      ...(vault.settings && typeof vault.settings === 'object' ? vault.settings : {}),
    },
  };
}

function normalizeSubject(subject) {
  return {
    id: subject?.id || createId(),
    name: String(subject?.name || 'Unbenanntes Fach').trim() || 'Unbenanntes Fach',
    shortName: String(subject?.shortName || '').trim(),
    grades: Array.isArray(subject?.grades) ? subject.grades.map(normalizeGrade).filter(Boolean) : [],
  };
}

function normalizeGrade(grade) {
  const value = Number(grade?.value);
  const weight = Number(grade?.weight);
  if (!isValidGradeValue(value) || !isPositiveWeight(weight)) {
    return null;
  }
  return {
    id: grade?.id || createId(),
    title: String(grade?.title || 'Note').trim() || 'Note',
    value,
    weight,
    date: grade?.date || '',
  };
}

function selectedSubject() {
  return vaultState.vault.subjects.find((subject) => subject.id === vaultState.selectedSubjectId) || null;
}

function markVaultChanged() {
  vaultState.vault.updatedAt = new Date().toISOString();
  vaultState.conflict = false;
  renderVault();
}

function setSyncError(message) {
  syncError.textContent = message || '';
}

function renderSyncState() {
  syncReloadButton.hidden = !vaultState.conflict;
  syncDisableDeviceButton.hidden = !vaultState.enabledOnDevice;
  syncDeleteServerButton.hidden = !vaultState.enabledOnDevice;
  vaultSection.hidden = !vaultState.unlocked;
  syncStatus.textContent = vaultState.unlocked
    ? `Entsperrt · Revision ${vaultState.revision}`
    : vaultState.enabledOnDevice
      ? 'Gesperrt'
      : 'Lokal';
  vaultSaveButton.disabled = vaultState.saving || vaultState.conflict;
  if (vaultState.unlocked) {
    vaultMeta.textContent = vaultState.updatedAt
      ? `Serverstand: Revision ${vaultState.revision}, aktualisiert ${vaultState.updatedAt}`
      : `Revision ${vaultState.revision}`;
  }
}

function renderOverallSummary() {
  const overall = createOverallSummary(vaultState.vault.subjects);
  overallElement.innerHTML = `
    <div class="grade-vault__metric"><span>Fächer mit Noten</span><strong>${overall.subjectsWithGrades}</strong></div>
    <div class="grade-vault__metric"><span>Gesamtschnitt exakt</span><strong>${formatNumber(overall.exactAverage)}</strong></div>
    <div class="grade-vault__metric"><span>Gesamtschnitt gerundet</span><strong>${formatNumber(overall.roundedAverage)}</strong></div>
    <div class="grade-vault__metric"><span>Mangelpunkte</span><strong>${formatNumber(overall.deficitPoints, 1)}</strong></div>
  `;
}

function renderSubjectList() {
  subjectList.innerHTML = '';
  if (!vaultState.vault.subjects.length) {
    const empty = document.createElement('p');
    empty.className = 'grade-vault__empty';
    empty.textContent = 'Noch keine Fächer erstellt.';
    subjectList.appendChild(empty);
    return;
  }
  vaultState.vault.subjects.forEach((subject) => {
    const summary = getSubjectSummary(subject);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `grade-vault__subject${subject.id === vaultState.selectedSubjectId ? ' is-active' : ''}`;
    button.innerHTML = `
      <span><strong>${escapeHtml(subject.shortName || subject.name)}</strong>${subject.shortName ? `<small>${escapeHtml(subject.name)}</small>` : ''}</span>
      <span class="grade-vault__subject-stats">${summary.gradeCount} Noten · ${formatNumber(summary.exactAverage)} / ${formatNumber(summary.roundedAverage, 1)} · MP ${formatNumber(summary.deficitPoints, 1)}</span>
    `;
    button.addEventListener('click', () => {
      vaultState.selectedSubjectId = subject.id;
      renderVault();
    });
    subjectList.appendChild(button);
  });
}

function renderSelectedSubject() {
  const subject = selectedSubject();
  gradeEntryList.innerHTML = '';
  gradeEntryForm.hidden = !subject;
  subjectDeleteButton.hidden = !subject;
  if (!subject) {
    subjectTitle.textContent = 'Kein Fach ausgewählt';
    subjectMeta.textContent = 'Erstelle oder wähle ein Fach.';
    return;
  }

  const average = calculateSubjectAverage(subject);
  const rounded = average === null ? null : roundToHalf(average);
  subjectTitle.textContent = subject.shortName ? `${subject.name} (${subject.shortName})` : subject.name;
  subjectMeta.textContent = `${subject.grades.length} Noten · Schnitt ${formatNumber(average)} · gerundet ${formatNumber(rounded, 1)} · Mangelpunkte ${formatNumber(calculateDeficitPoints(rounded), 1)}`;

  subject.grades.forEach((grade) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(grade.title)}</td>
      <td>${formatNumber(grade.value)}</td>
      <td>${formatNumber(grade.weight)}</td>
      <td>${escapeHtml(grade.date || '–')}</td>
      <td class="grade-calculator__actions"></td>
    `;
    const actions = row.querySelector('.grade-calculator__actions');
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'grade-calculator__edit-trigger';
    editButton.textContent = '✎';
    editButton.setAttribute('aria-label', 'Note bearbeiten');
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'grade-calculator__delete-button';
    deleteButton.textContent = '✕';
    deleteButton.setAttribute('aria-label', 'Note löschen');
    actions.append(editButton, deleteButton);
    editButton.addEventListener('click', () => {
      gradeEntryTitle.value = grade.title;
      gradeEntryValue.value = grade.value;
      gradeEntryWeight.value = grade.weight;
      gradeEntryDate.value = grade.date || '';
      gradeEntryForm.dataset.editingGradeId = grade.id;
      gradeEntryTitle.focus();
    });
    deleteButton.addEventListener('click', () => {
      subject.grades = subject.grades.filter((item) => item.id !== grade.id);
      markVaultChanged();
    });
    gradeEntryList.appendChild(row);
  });
}

function renderVault() {
  renderSyncState();
  if (!vaultState.unlocked) {
    return;
  }
  renderOverallSummary();
  renderSubjectList();
  renderSelectedSubject();
}

async function saveVault() {
  if (!vaultState.unlocked || vaultState.saving || vaultState.conflict) {
    return;
  }
  vaultState.saving = true;
  renderSyncState();
  try {
    const encrypted = await encryptGradeVault(vaultState.vault, vaultState.password);
    const response = await putGradeVault(encrypted, vaultState.revision);
    vaultState.revision = response.data.revision;
    vaultState.updatedAt = response.data.updated_at;
    notify('Noten-Tresor gespeichert.', 'success');
  } catch (error) {
    if (error.status === 409) {
      vaultState.conflict = true;
      syncReloadButton.hidden = false;
      setSyncError('Die Noten wurden auf einem anderen Gerät geändert. Bitte lade den aktuellen Serverstand neu.');
      notify('Revision-Konflikt: Serverstand neu laden.', 'error');
      return;
    }
    notify('Der Noten-Tresor konnte nicht gespeichert werden.', 'error');
  } finally {
    vaultState.saving = false;
    renderSyncState();
  }
}

async function unlockOrEnableSync(event) {
  event?.preventDefault();
  const password = syncPasswordInput.value;
  if (!password || password.length < 8) {
    setSyncError('Bitte ein Sync-Passwort mit mindestens 8 Zeichen eingeben.');
    return;
  }
  setSyncError('');
  try {
    const response = await getGradeVault();
    const data = response.data || {};
    vaultState.enabledOnDevice = true;
    vaultState.password = password;
    setDeviceSyncEnabled(true);

    if (data.vault_json) {
      const encrypted = typeof data.vault_json === 'string' ? JSON.parse(data.vault_json) : data.vault_json;
      vaultState.vault = normalizeVault(await decryptGradeVault(encrypted, password));
      vaultState.revision = Number(data.revision) || 0;
      vaultState.updatedAt = data.updated_at || null;
      vaultState.unlocked = true;
      vaultState.conflict = false;
      vaultState.selectedSubjectId = vaultState.vault.subjects[0]?.id || null;
      notify('Noten-Tresor entsperrt.', 'success');
    } else {
      vaultState.vault = createEmptyVault();
      vaultState.revision = 0;
      vaultState.updatedAt = null;
      vaultState.unlocked = true;
      vaultState.conflict = false;
      await saveVault();
      notify('Verschlüsselter Noten-Sync aktiviert.', 'success');
    }
    syncPasswordInput.value = '';
  } catch (error) {
    if (error.message === 'wrong_sync_password') {
      setSyncError('Das Sync-Passwort ist falsch oder der Tresor kann nicht entschlüsselt werden.');
    } else if (error.status === 401) {
      setSyncError('Bitte zuerst bei HWM anmelden.');
    } else {
      setSyncError('Der Noten-Sync ist momentan nicht erreichbar.');
    }
    vaultState.unlocked = false;
  } finally {
    renderVault();
  }
}

function disableSyncOnDevice() {
  vaultState.enabledOnDevice = false;
  vaultState.unlocked = false;
  vaultState.password = '';
  vaultState.vault = createEmptyVault();
  vaultState.revision = 0;
  vaultState.updatedAt = null;
  vaultState.selectedSubjectId = null;
  setDeviceSyncEnabled(false);
  notify('Sync auf diesem Gerät deaktiviert.', 'info');
  renderVault();
}

async function deleteServerVault() {
  if (!window.confirm('Server-Tresor wirklich löschen? Lokale einfache Noten bleiben unberührt.')) {
    return;
  }
  try {
    await deleteGradeVault();
    disableSyncOnDevice();
    notify('Server-Tresor gelöscht.', 'success');
  } catch (error) {
    notify('Der Server-Tresor konnte nicht gelöscht werden.', 'error');
  }
}

async function reloadServerVault() {
  const password = vaultState.password || syncPasswordInput.value;
  if (!password) {
    setSyncError('Bitte Sync-Passwort eingeben, um den Serverstand zu laden.');
    return;
  }
  try {
    const response = await getGradeVault();
    const data = response.data || {};
    if (!data.vault_json) {
      setSyncError('Auf dem Server ist kein Noten-Tresor vorhanden.');
      return;
    }
    const encrypted = typeof data.vault_json === 'string' ? JSON.parse(data.vault_json) : data.vault_json;
    vaultState.vault = normalizeVault(await decryptGradeVault(encrypted, password));
    vaultState.password = password;
    vaultState.revision = Number(data.revision) || 0;
    vaultState.updatedAt = data.updated_at || null;
    vaultState.unlocked = true;
    vaultState.conflict = false;
    vaultState.selectedSubjectId = vaultState.vault.subjects[0]?.id || null;
    setSyncError('');
    notify('Serverstand geladen.', 'success');
  } catch (error) {
    setSyncError(error.message === 'wrong_sync_password' ? 'Das Sync-Passwort ist falsch.' : 'Serverstand konnte nicht geladen werden.');
  } finally {
    renderVault();
  }
}

function addSubject(event) {
  event.preventDefault();
  const name = subjectNameInput.value.trim();
  if (!name) {
    notify('Bitte einen Fachnamen eingeben.', 'error');
    return;
  }
  const subject = {
    id: createId(),
    name,
    shortName: subjectShortNameInput.value.trim(),
    grades: [],
  };
  vaultState.vault.subjects.push(subject);
  vaultState.selectedSubjectId = subject.id;
  subjectNameInput.value = '';
  subjectShortNameInput.value = '';
  markVaultChanged();
}

function deleteSelectedSubject() {
  const subject = selectedSubject();
  if (!subject || !window.confirm(`Fach "${subject.name}" löschen?`)) {
    return;
  }
  vaultState.vault.subjects = vaultState.vault.subjects.filter((item) => item.id !== subject.id);
  vaultState.selectedSubjectId = vaultState.vault.subjects[0]?.id || null;
  markVaultChanged();
}

function saveGradeEntry(event) {
  event.preventDefault();
  const subject = selectedSubject();
  if (!subject) {
    return;
  }
  const value = normalizeNumber(gradeEntryValue.value);
  const weight = normalizeNumber(gradeEntryWeight.value || '1');
  if (!isValidGradeValue(value)) {
    notify('Die Note muss zwischen 1 und 6 liegen.', 'error');
    return;
  }
  if (!isPositiveWeight(weight)) {
    notify('Die Gewichtung muss grösser als 0 sein.', 'error');
    return;
  }
  const editingId = gradeEntryForm.dataset.editingGradeId;
  const grade = {
    id: editingId || createId(),
    title: gradeEntryTitle.value.trim() || 'Note',
    value,
    weight,
    date: gradeEntryDate.value || '',
  };
  if (editingId) {
    subject.grades = subject.grades.map((item) => (item.id === editingId ? grade : item));
  } else {
    subject.grades.push(grade);
  }
  gradeEntryForm.reset();
  delete gradeEntryForm.dataset.editingGradeId;
  markVaultChanged();
}

addForm.addEventListener('submit', addSimpleGrade);
targetForm.addEventListener('submit', calculateRequiredGrade);
noteInput.addEventListener('input', () => validateInputs(false));
weightInput.addEventListener('input', () => validateInputs(false));
targetInput.addEventListener('input', () => validateGoalInputs(false));
nextWeightInput.addEventListener('input', () => validateGoalInputs(false));
syncPasswordForm.addEventListener('submit', unlockOrEnableSync);
syncReloadButton.addEventListener('click', reloadServerVault);
syncDisableDeviceButton.addEventListener('click', disableSyncOnDevice);
syncDeleteServerButton.addEventListener('click', deleteServerVault);
vaultSaveButton.addEventListener('click', saveVault);
subjectForm.addEventListener('submit', addSubject);
subjectDeleteButton.addEventListener('click', deleteSelectedSubject);
gradeEntryForm.addEventListener('submit', saveGradeEntry);

resetRequiredGrade();
validateInputs(false);
validateGoalInputs(false);
updateSimpleGradeList();
renderVault();
focusNoteField();

window.hmGradeCalculations = {
  calculateSubjectAverage,
  calculateOverallExactAverage,
  calculateOverallRoundedAverage,
  calculateTotalDeficitPoints,
  roundToHalf,
};
