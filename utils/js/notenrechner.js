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

const t = window.hmI18n ? window.hmI18n.scope('gradeCalculator') : (key, fallback) => fallback;

const messages = {
  invalidNumber: t('messages.invalidNumber', 'Please enter valid numbers.'),
  required: t('messages.required', 'Please fill in this field.'),
  gradeRange: t('messages.gradeRange', 'Grades must be between 1 and 6.'),
  weightPositive: t('messages.weightPositive', 'Weight must be greater than 0.'),
  targetRange: t('messages.targetRange', 'The target average must be between 1 and 6.'),
  nextWeight: t('messages.nextWeight', 'The next grade weight must be greater than 0.'),
  requiredGradeLabel: t('messages.requiredGradeLabel', 'Required grade'),
  unachievable: t('messages.unachievable', 'Not achievable'),
  unachievableDetail: t('messages.unachievableDetail', 'Target not reachable (max. {max})'),
  deleteAction: t('messages.deleteAction', 'Remove grade'),
  editAction: t('messages.editAction', 'Edit grade'),
  saveAction: t('messages.saveAction', 'Save changes'),
  cancelAction: t('messages.cancelAction', 'Cancel editing')
};

const noten = [];
let editingIndex = null;

const MIN_GRADE = 1;
const MAX_GRADE = 6;
const STEP_PRECISION = 1e-9;

function toNumber(rawValue) {
  if (!rawValue) {
    return NaN;
  }
  const normalised = rawValue.replace(/\s+/g, '').replace(/,/g, '.');
  const parsed = Number.parseFloat(normalised);
  return Number.isNaN(parsed) ? NaN : parsed;
}

function parseValue(input) {
  const value = input.value.trim();
  return toNumber(value);
}

function isValidGrade(value) {
  return Number.isFinite(value) && value >= MIN_GRADE && value <= MAX_GRADE;
}

function isPositive(value) {
  return Number.isFinite(value) && value > 0;
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
  if (typeof noteInput.focus === 'function') {
    noteInput.focus();
    if (typeof noteInput.select === 'function') {
      noteInput.select();
    }
  }
}

function updateButtonStates() {
  const gradeValue = parseValue(noteInput);
  const weightValue = parseValue(weightInput);
  const targetValue = parseValue(targetInput);
  const nextWeightValue = parseValue(nextWeightInput);

  const enableAdd = isValidGrade(gradeValue) && isPositive(weightValue);
  const enableCalc =
    isValidGrade(targetValue) &&
    isPositive(nextWeightValue) &&
    noten.length > 0;

  addButton.disabled = !enableAdd;
  addButton.setAttribute('aria-disabled', String(!enableAdd));

  calculateButton.disabled = !enableCalc;
  calculateButton.setAttribute('aria-disabled', String(!enableCalc));

}

function validateInputs(showFeedback = false) {
  const gradeRaw = noteInput.value.trim();
  const weightRaw = weightInput.value.trim();
  const gradeValue = toNumber(gradeRaw);
  const weightValue = toNumber(weightRaw);

  let gradeMessage = '';
  let weightMessage = '';

  if (gradeRaw === '') {
    gradeMessage = messages.required;
  } else if (Number.isNaN(gradeValue)) {
    gradeMessage = messages.invalidNumber;
  } else if (!isValidGrade(gradeValue)) {
    gradeMessage = messages.gradeRange;
  }

  if (weightRaw === '') {
    weightMessage = messages.required;
  } else if (Number.isNaN(weightValue)) {
    weightMessage = messages.invalidNumber;
  } else if (!isPositive(weightValue)) {
    weightMessage = messages.weightPositive;
  }

  const showGradeMessage = showFeedback || gradeRaw !== '';
  const showWeightMessage = showFeedback || weightRaw !== '';

  setFieldState(noteInput, gradeError, gradeMessage, showGradeMessage);
  setFieldState(weightInput, weightError, weightMessage, showWeightMessage);

  updateButtonStates();
  return !gradeMessage && !weightMessage;
}

function validateGoalInputs(showFeedback = false) {
  const targetRaw = targetInput.value.trim();
  const nextWeightRaw = nextWeightInput.value.trim();
  const targetValue = toNumber(targetRaw);
  const nextWeightValue = toNumber(nextWeightRaw);

  let targetMessage = '';
  let nextWeightMessage = '';

  if (targetRaw === '') {
    targetMessage = messages.required;
  } else if (Number.isNaN(targetValue)) {
    targetMessage = messages.invalidNumber;
  } else if (!isValidGrade(targetValue)) {
    targetMessage = messages.targetRange;
  }

  if (nextWeightRaw === '') {
    nextWeightMessage = messages.required;
  } else if (Number.isNaN(nextWeightValue)) {
    nextWeightMessage = messages.invalidNumber;
  } else if (!isPositive(nextWeightValue)) {
    nextWeightMessage = messages.nextWeight;
  }

  const showTargetMessage = showFeedback || targetRaw !== '';
  const showNextWeightMessage = showFeedback || nextWeightRaw !== '';

  setFieldState(targetInput, targetError, targetMessage, showTargetMessage);
  setFieldState(nextWeightInput, nextWeightError, nextWeightMessage, showNextWeightMessage);

  if (showFeedback && (targetMessage || nextWeightMessage) && typeof showOverlay === 'function') {
    showOverlay(targetMessage || nextWeightMessage);
  }

  updateButtonStates();
  return !targetMessage && !nextWeightMessage;
}

function resetInputs() {
  noteInput.value = '';
  weightInput.value = '';
  noteInput.classList.remove('invalid');
  weightInput.classList.remove('invalid');
  noteInput.removeAttribute('aria-invalid');
  weightInput.removeAttribute('aria-invalid');
  gradeError.textContent = '';
  weightError.textContent = '';
  updateButtonStates();
}

function resetTargetInputs() {
  targetInput.classList.remove('invalid');
  nextWeightInput.classList.remove('invalid');
  targetInput.removeAttribute('aria-invalid');
  nextWeightInput.removeAttribute('aria-invalid');
  targetError.textContent = '';
  nextWeightError.textContent = '';
  updateButtonStates();
}

function noteHinzufuegen(event) {
  if (event) {
    event.preventDefault();
  }
  if (!validateInputs(true)) {
    return;
  }

  const note = parseFloat(noteInput.value);
  const gewichtung = parseFloat(weightInput.value);
  noten.push({ note, gewichtung });
  editingIndex = null;
  resetInputs();
  focusNoteField();
  notenListeUpdate();
  schnittBerechnen();
  validateGoalInputs(false);
}

function schnittBerechnen() {
  if (!noten.length) {
    averageValue.textContent = '–';
    return;
  }

  const totalWeight = noten.reduce((acc, item) => acc + item.gewichtung, 0);
  const sum = noten.reduce((acc, item) => acc + item.note * item.gewichtung, 0);
  const average = sum / totalWeight;
  averageValue.textContent = average.toFixed(2);
}

function zielBerechnen(event) {
  if (event) {
    event.preventDefault();
  }
  if (!validateGoalInputs(true) || !noten.length) {
    return;
  }

  const target = parseFloat(targetInput.value);
  const additionalWeight = parseFloat(nextWeightInput.value);
  const totalWeight = noten.reduce((acc, item) => acc + item.gewichtung, 0);
  const sum = noten.reduce((acc, item) => acc + item.note * item.gewichtung, 0);
  const required = ((target * (totalWeight + additionalWeight)) - sum) / additionalWeight;

  if (!Number.isFinite(required)) {
    resetRequiredGrade();
    return;
  }

  if (required < MIN_GRADE - STEP_PRECISION || required > MAX_GRADE + STEP_PRECISION) {
    const detail = messages.unachievableDetail.replace('{max}', MAX_GRADE.toFixed(1));
    requiredGrade.textContent = `${messages.requiredGradeLabel}: ${detail}`;
    requiredGrade.dataset.state = 'unreachable';
  } else {
    requiredGrade.textContent = `${messages.requiredGradeLabel}: ${required.toFixed(2)}`;
    requiredGrade.dataset.state = 'ready';
  }
}

function cancelEdit() {
  editingIndex = null;
  notenListeUpdate();
}

function saveEdit(index, gradeField, weightField) {
  const gradeRaw = gradeField.value.trim();
  const weightRaw = weightField.value.trim();
  const gradeValue = toNumber(gradeRaw);
  const weightValue = toNumber(weightRaw);

  let gradeMessage = '';
  let weightMessage = '';

  if (gradeRaw === '') {
    gradeMessage = messages.required;
  } else if (Number.isNaN(gradeValue)) {
    gradeMessage = messages.invalidNumber;
  } else if (!isValidGrade(gradeValue)) {
    gradeMessage = messages.gradeRange;
  }

  if (weightRaw === '') {
    weightMessage = messages.required;
  } else if (Number.isNaN(weightValue)) {
    weightMessage = messages.invalidNumber;
  } else if (!isPositive(weightValue)) {
    weightMessage = messages.weightPositive;
  }

  if (gradeMessage) {
    gradeField.classList.add('invalid');
    gradeField.setAttribute('aria-invalid', 'true');
  } else {
    gradeField.classList.remove('invalid');
    gradeField.removeAttribute('aria-invalid');
  }

  if (weightMessage) {
    weightField.classList.add('invalid');
    weightField.setAttribute('aria-invalid', 'true');
  } else {
    weightField.classList.remove('invalid');
    weightField.removeAttribute('aria-invalid');
  }

  const combinedMessage = gradeMessage || weightMessage;
  if (combinedMessage) {
    if (typeof showOverlay === 'function') {
      showOverlay(combinedMessage);
    }
    return;
  }

  noten[index] = { note: gradeValue, gewichtung: weightValue };
  editingIndex = null;
  notenListeUpdate();
  schnittBerechnen();
  validateGoalInputs(false);
}

function createEditControls(row, index, entry) {
  row.classList.add('editing');

  const numberCell = document.createElement('td');
  numberCell.textContent = index + 1;

  const gradeCell = document.createElement('td');
  const gradeField = document.createElement('input');
  gradeField.type = 'number';
  gradeField.step = '0.01';
  gradeField.min = String(MIN_GRADE);
  gradeField.max = String(MAX_GRADE);
  gradeField.value = entry.note;
  gradeField.className = 'grade-calculator__input';
  gradeCell.appendChild(gradeField);

  const weightCell = document.createElement('td');
  const weightField = document.createElement('input');
  weightField.type = 'number';
  weightField.step = '0.01';
  weightField.min = '0';
  weightField.value = entry.gewichtung;
  weightField.className = 'grade-calculator__input';
  weightCell.appendChild(weightField);

  const actionsCell = document.createElement('td');
  actionsCell.classList.add('grade-calculator__edit-actions');

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

  actionsCell.appendChild(saveButton);
  actionsCell.appendChild(cancelButton);

  row.appendChild(numberCell);
  row.appendChild(gradeCell);
  row.appendChild(weightCell);
  row.appendChild(actionsCell);

  saveButton.addEventListener('click', () => saveEdit(index, gradeField, weightField));
  cancelButton.addEventListener('click', cancelEdit);

  const handleKey = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit(index, gradeField, weightField);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  };

  gradeField.addEventListener('keydown', handleKey);
  weightField.addEventListener('keydown', handleKey);
  gradeField.focus();
}

function notenListeUpdate() {
  tableBody.innerHTML = '';

  noten.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.dataset.index = index;

    if (editingIndex === index) {
      createEditControls(row, index, entry);
    } else {
      const numberCell = document.createElement('td');
      numberCell.textContent = index + 1;

      const gradeCell = document.createElement('td');
      gradeCell.textContent = entry.note.toFixed(2);

      const weightCell = document.createElement('td');
      weightCell.textContent = entry.gewichtung.toFixed(2);

      const actionsCell = document.createElement('td');
      actionsCell.classList.add('grade-calculator__actions');

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

      editButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        editingIndex = index;
        notenListeUpdate();
      });

      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        noten.splice(index, 1);
        editingIndex = null;
        notenListeUpdate();
        schnittBerechnen();
        if (!noten.length) {
          resetRequiredGrade();
        }
        validateGoalInputs(false);
      });

      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);

      row.appendChild(numberCell);
      row.appendChild(gradeCell);
      row.appendChild(weightCell);
      row.appendChild(actionsCell);

      row.addEventListener('click', (event) => {
        if (event.target.closest('button')) {
          return;
        }
        editingIndex = index;
        notenListeUpdate();
      });
    }

    tableBody.appendChild(row);
  });

  updateButtonStates();
}

addForm.addEventListener('submit', noteHinzufuegen);
targetForm.addEventListener('submit', zielBerechnen);

noteInput.addEventListener('input', () => validateInputs(false));
weightInput.addEventListener('input', () => validateInputs(false));
targetInput.addEventListener('input', () => validateGoalInputs(false));
nextWeightInput.addEventListener('input', () => validateGoalInputs(false));

resetRequiredGrade();
validateInputs(false);
validateGoalInputs(false);
notenListeUpdate();
focusNoteField();
