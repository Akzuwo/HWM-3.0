export function createTable(columns, { emptyMessage = 'No data available' } = {}) {
  const container = document.createElement('div');
  container.className = 'admin-table-container';

  const table = document.createElement('table');
  table.className = 'admin-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  let currentColumns = [...columns];

  function renderHeader() {
    headRow.innerHTML = '';
    currentColumns.forEach((column) => {
      const th = document.createElement('th');
      th.textContent = column.label;
      headRow.appendChild(th);
    });
  }

  renderHeader();
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  const emptyState = document.createElement('div');
  emptyState.className = 'admin-table-empty';
  emptyState.textContent = emptyMessage;

  container.appendChild(table);
  container.appendChild(emptyState);

  function renderCell(td, value) {
    if (value instanceof Node) {
      td.appendChild(value);
    } else if (value === null || value === undefined || value === '') {
      td.textContent = '–';
    } else {
      td.textContent = String(value);
    }
  }

  return {
    element: container,
    setColumns(newColumns) {
      currentColumns = [...newColumns];
      renderHeader();
    },
    setEmptyMessage(message) {
      emptyState.textContent = message;
    },
    setRows(rows = []) {
      tbody.innerHTML = '';
      if (!rows.length) {
        emptyState.hidden = false;
        container.classList.add('is-empty');
        return;
      }
      emptyState.hidden = true;
      container.classList.remove('is-empty');
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        currentColumns.forEach((column) => {
          const td = document.createElement('td');
          if (typeof column.render === 'function') {
            renderCell(td, column.render(row));
          } else if (column.key in row) {
            renderCell(td, row[column.key]);
          } else {
            renderCell(td, '');
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    },
    setLoading(isLoading) {
      container.classList.toggle('is-loading', Boolean(isLoading));
    },
  };
}

export function createDialog({ title, confirmLabel = 'Save', cancelLabel = 'Cancel' } = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'admin-dialog-backdrop';
  backdrop.setAttribute('role', 'presentation');

  const dialog = document.createElement('div');
  dialog.className = 'admin-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const header = document.createElement('header');
  header.className = 'admin-dialog__header';
  const titleEl = document.createElement('h2');
  titleEl.className = 'admin-dialog__title';
  titleEl.textContent = title;
  header.appendChild(titleEl);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'admin-dialog__close';
  closeButton.setAttribute('aria-label', 'Close dialog');
  closeButton.innerHTML = '&times;';
  header.appendChild(closeButton);

  const body = document.createElement('div');
  body.className = 'admin-dialog__body';

  const footer = document.createElement('footer');
  footer.className = 'admin-dialog__footer';

  const message = document.createElement('div');
  message.className = 'admin-dialog__message';
  footer.appendChild(message);

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'admin-button admin-button--ghost';
  cancelButton.textContent = cancelLabel;
  footer.appendChild(cancelButton);

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'admin-button';
  confirmButton.textContent = confirmLabel;
  footer.appendChild(confirmButton);

  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);
  backdrop.appendChild(dialog);

  let confirmHandler = null;
  let cancelHandler = null;

  function detachListeners() {
    backdrop.removeEventListener('click', handleBackdropClick);
    document.removeEventListener('keydown', handleKeydown);
  }

  function closeDialog() {
    backdrop.classList.remove('is-visible');
    setTimeout(() => {
      if (backdrop.parentElement) {
        backdrop.parentElement.removeChild(backdrop);
      }
      detachListeners();
    }, 180);
  }

  function handleBackdropClick(event) {
    if (event.target === backdrop) {
      closeDialog();
      if (cancelHandler) {
        cancelHandler();
      }
    }
  }

  cancelButton.addEventListener('click', () => {
    closeDialog();
    if (cancelHandler) {
      cancelHandler();
    }
  });

  closeButton.addEventListener('click', () => {
    closeDialog();
    if (cancelHandler) {
      cancelHandler();
    }
  });

  function handleKeydown(event) {
    if (event.key === 'Escape' && backdrop.parentElement) {
      closeDialog();
      if (cancelHandler) {
        cancelHandler();
      }
    }
  }

  async function handleConfirm() {
    if (!confirmHandler) {
      closeDialog();
      return;
    }
    try {
      confirmButton.disabled = true;
      confirmButton.classList.add('is-busy');
      await confirmHandler();
      closeDialog();
    } catch (error) {
      message.textContent = error instanceof Error ? error.message : String(error);
      message.hidden = false;
    } finally {
      confirmButton.disabled = false;
      confirmButton.classList.remove('is-busy');
    }
  }

  confirmButton.addEventListener('click', handleConfirm);

  return {
    element: backdrop,
    setContent(node) {
      body.innerHTML = '';
      if (node instanceof Node) {
        body.appendChild(node);
      }
    },
    setTitle(newTitle) {
      titleEl.textContent = newTitle;
    },
    setLabels({ confirm, cancel } = {}) {
      if (confirm) {
        confirmButton.textContent = confirm;
      }
      if (cancel) {
        cancelButton.textContent = cancel;
      }
    },
    onConfirm(handler) {
      confirmHandler = handler;
    },
    onCancel(handler) {
      cancelHandler = handler;
    },
    open() {
      message.textContent = '';
      message.hidden = true;
      backdrop.addEventListener('click', handleBackdropClick);
      document.addEventListener('keydown', handleKeydown);
      document.body.appendChild(backdrop);
      requestAnimationFrame(() => backdrop.classList.add('is-visible'));
    },
    close() {
      closeDialog();
    },
    focus() {
      confirmButton.focus();
    },
  };
}

export function createForm(fields, { initialValues = {} } = {}) {
  const form = document.createElement('form');
  form.className = 'admin-form';
  form.noValidate = true;

  const controls = [];

  function normalizeOption(option) {
    if (option && typeof option === 'object') {
      const value = option.value != null ? option.value : '';
      const label = option.label != null ? option.label : String(value);
      return { value: value, label: label };
    }
    const primitive = option != null ? option : '';
    return { value: primitive, label: String(primitive) };
  }

  function populateSelectOptions(select, field, options = []) {
    select.innerHTML = '';
    if (field.allowEmptyOption) {
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = field.emptyOptionLabel != null ? field.emptyOptionLabel : '';
      select.appendChild(empty);
    }
    options.forEach((option) => {
      const { value, label } = normalizeOption(option);
      const opt = document.createElement('option');
      opt.value = value != null ? String(value) : '';
      opt.textContent = label;
      select.appendChild(opt);
    });
  }

  fields.forEach((field) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'admin-form__field';
    wrapper.dataset.field = field.name;

    const labelText = document.createElement('span');
    labelText.className = 'admin-form__label';
    labelText.textContent = field.label;

    let input;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = field.rows || 3;
    } else if (field.type === 'select') {
      input = document.createElement('select');
      populateSelectOptions(input, field, field.options || []);
    } else if (field.type === 'file') {
      input = document.createElement('input');
      input.type = 'file';
      if (field.accept) {
        input.accept = field.accept;
      }
      if (field.multiple) {
        input.multiple = true;
      }
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
    }

    input.name = field.name;
    input.id = `admin-form-${field.name}-${Math.random().toString(36).slice(2)}`;
    if (field.placeholder) {
      input.placeholder = field.placeholder;
    }
    if (field.required) {
      input.required = true;
      wrapper.classList.add('is-required');
    }
    if (field.min !== undefined) {
      input.min = String(field.min);
    }
    if (field.max !== undefined) {
      input.max = String(field.max);
    }
    if (field.step !== undefined) {
      input.step = String(field.step);
    }

    if (field.type === 'checkbox') {
      wrapper.classList.add('admin-form__field--checkbox');
      wrapper.appendChild(input);
      wrapper.appendChild(labelText);
    } else {
      wrapper.appendChild(labelText);
      wrapper.appendChild(input);
    }

    if (field.helpText) {
      const help = document.createElement('small');
      help.className = 'admin-form__help';
      help.textContent = field.helpText;
      wrapper.appendChild(help);
    }

    controls.push({ field, input });
    form.appendChild(wrapper);
  });

  function setInitialValue(control) {
    const { field, input } = control;
    const provided = Object.prototype.hasOwnProperty.call(initialValues, field.name)
      ? initialValues[field.name]
      : field.defaultValue;
    if (field.type === 'checkbox') {
      input.checked = Boolean(provided);
    } else if (field.type === 'select') {
      input.value = provided != null ? String(provided) : '';
    } else if (field.type === 'file') {
      input.value = '';
    } else if (field.type === 'datetime-local') {
      if (provided) {
        const date = new Date(provided);
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60 * 1000)
          .toISOString()
          .slice(0, 16);
        input.value = local;
      } else {
        input.value = '';
      }
    } else if (provided != null) {
      input.value = String(provided);
    } else {
      input.value = '';
    }
  }

  controls.forEach(setInitialValue);

  return {
    element: form,
    focusFirst() {
      const first = controls.find(({ field }) => field.type !== 'checkbox');
      if (first) {
        first.input.focus();
      }
    },
    setValues(values = {}) {
      controls.forEach((control) => {
        if (Object.prototype.hasOwnProperty.call(values, control.field.name)) {
          const next = { ...initialValues, ...values };
          initialValues = next;
          setInitialValue(control);
        }
      });
    },
    getValues() {
      const result = {};
      controls.forEach(({ field, input }) => {
        if (field.type === 'checkbox') {
          result[field.name] = input.checked;
          return;
        }
        if (field.type === 'number') {
          const value = input.value.trim();
          result[field.name] = value === '' ? null : Number(value);
          return;
        }
        if (field.type === 'datetime-local') {
          result[field.name] = input.value ? new Date(input.value).toISOString() : null;
          return;
        }
        if (field.type === 'select') {
          result[field.name] = input.value;
          return;
        }
        if (field.type === 'password') {
          result[field.name] = input.value;
          return;
        }
        if (field.type === 'file') {
          const [file] = input.files || [];
          result[field.name] = file || null;
          return;
        }
        const value = field.trim === false ? input.value : input.value.trim();
        result[field.name] = value;
      });
      return result;
    },
    updateOptions(fieldName, options = [], { preserveValue = true } = {}) {
      const control = controls.find((item) => item.field.name === fieldName);
      if (!control || control.field.type !== 'select') {
        return;
      }
      const currentValue = control.input.value;
      control.field.options = options;
      populateSelectOptions(control.input, control.field, options);
      const candidates = [];
      if (preserveValue) {
        candidates.push(currentValue);
      }
      if (Object.prototype.hasOwnProperty.call(initialValues, fieldName)) {
        candidates.push(initialValues[fieldName]);
      } else if (control.field.defaultValue !== undefined) {
        candidates.push(control.field.defaultValue);
      }
      let applied = false;
      const optionsList = Array.from(control.input.options || []);
      for (const candidate of candidates) {
        if (candidate === undefined || candidate === null) {
          continue;
        }
        const normalized = String(candidate);
        const hasOption = optionsList.some((opt) => opt.value === normalized);
        if (hasOption) {
          control.input.value = normalized;
          applied = true;
          break;
        }
      }
      if (!applied) {
        if (control.field.allowEmptyOption) {
          control.input.value = '';
        } else if (optionsList.length > 0) {
          control.input.value = optionsList[0].value;
        } else {
          control.input.value = '';
        }
      }
    },
  };
}
