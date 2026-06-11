(function (global) {
  const root = typeof global !== 'undefined' ? global : window;
  const API_BASE =
    typeof root.hmResolveApiBase === 'function'
      ? root.hmResolveApiBase()
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

  const CLASS_STORAGE = root.hmClassStorage || {
    getId: () => '',
    getSlug: () => '',
    set: () => {},
    clear: () => {}
  };

  const DEFAULT_TEXT = {
    label: 'Class',
    placeholder: 'Select class',
    loading: 'Loading classes…',
    error: 'Unable to load classes.',
    changeError: 'Unable to change class.',
    required: 'Please select a class to continue.'
  };

  function callHandler(handler, ...args) {
    if (typeof handler === 'function') {
      try {
        return handler(...args);
      } catch (error) {
        console.error('hmClassSelector handler failed:', error);
      }
    }
    return undefined;
  }

  class ClassSelectorController {
    constructor(config = {}) {
      this.config = config;
      this.text = { ...DEFAULT_TEXT, ...(config.text || {}) };
      this.container = null;
      this.select = null;
      this.label = null;
      this.classes = [];
      this.state = {
        classId: typeof CLASS_STORAGE.getId === 'function' ? CLASS_STORAGE.getId() || '' : '',
        classSlug: typeof CLASS_STORAGE.getSlug === 'function' ? CLASS_STORAGE.getSlug() || '' : '',
        loading: false,
        enabled: false
      };
      this.permissions = config.permissions || (root.hmCalendar && root.hmCalendar.permissions) || null;
      this.unsubscribe = null;
      this.boundOnChange = (event) => this.handleSelectionChange(event);
      this.hideTimer = null;
    }

    resolveElements() {
      if (this.container && this.select) {
        return true;
      }
      const target = this.config.container || '[data-class-selector]';
      const selectSelector = this.config.select || '[data-class-select]';
      const scope = this.config.root || (typeof document !== 'undefined' ? document : null);
      if (!scope) {
        return false;
      }
      this.container = typeof target === 'string' ? scope.querySelector(target) : target;
      if (!this.container) {
        return false;
      }
      this.select = this.container.querySelector(selectSelector);
      this.label = this.container.querySelector('label');
      if (this.container) {
        this.container.classList.add('hm-class-selector');
      }
      if (this.select) {
        this.select.classList.add('hm-class-selector__select');
      }
      if (this.label) {
        this.label.classList.add('hm-class-selector__label');
      }
      return Boolean(this.select);
    }

    computeEnabled() {
      if (typeof this.config.isEnabled === 'function') {
        return Boolean(this.config.isEnabled());
      }
      if (this.config.enable === true) {
        return true;
      }
      const perms = this.permissions;
      if (perms && typeof perms.getState === 'function') {
        try {
          const snapshot = perms.getState();
          return Boolean(snapshot && snapshot.classSelectorEnabled);
        } catch (error) {
          console.warn('hmClassSelector: unable to read permissions state', error);
        }
      }
      return false;
    }

    setEnabled(nextEnabled) {
      this.state.enabled = Boolean(nextEnabled);
      if (!this.container || !this.select) {
        return;
      }
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      if (!this.state.enabled) {
        this.container.classList.remove('is-visible');
        this.container.classList.add('is-leaving');
        this.select.disabled = true;
        const hideDelay = Number(this.config.hideDelayMs) || 220;
        this.hideTimer = setTimeout(() => {
          if (!this.state.enabled && this.container) {
            this.container.hidden = true;
            this.container.classList.remove('is-enabled');
            this.container.classList.remove('is-leaving');
          }
        }, hideDelay);
        return;
      }
      this.container.hidden = false;
      this.container.classList.add('is-enabled');
      this.container.classList.remove('is-leaving');
      this.container.classList.remove('is-visible');
      requestAnimationFrame(() => {
        if (this.state.enabled && this.container) {
          this.container.classList.add('is-visible');
        }
      });
      this.select.disabled = false;
    }

    async fetchSessionContext() {
      try {
        const res = await fetchWithSession(`${API_BASE}/api/session/class`);
        if (!res.ok) {
          return null;
        }
        const data = await res.json();
        const classId = data?.class_id || '';
        const classSlug = data?.class_slug || '';
        this.state.classId = classId;
        this.state.classSlug = classSlug || classId;
        if (classId) {
          callHandler(CLASS_STORAGE.set, classId, this.state.classSlug || classId);
        }
        return { classId: this.state.classId, classSlug: this.state.classSlug };
      } catch (error) {
        console.error('hmClassSelector: failed to load session context', error);
        return null;
      }
    }

    async fetchClasses() {
      const res = await fetchWithSession(`${API_BASE}/api/classes`);
      if (!res.ok) {
        const message = await res.text().catch(() => '');
        throw new Error(message || `Status ${res.status}`);
      }
      const rows = await res.json();
      this.classes = (rows || []).filter((row) => row && row.slug);
      return this.classes;
    }

    resetOptions(placeholderText) {
      if (!this.select) {
        return;
      }
      this.select.innerHTML = '';
      const option = document.createElement('option');
      option.value = '';
      option.disabled = true;
      option.selected = true;
      option.textContent = placeholderText || this.text.placeholder;
      this.select.appendChild(option);
    }

    async populateOptions() {
      if (!this.select) {
        return;
      }
      this.state.loading = true;
      if (this.container) {
        this.container.classList.add('is-loading');
      }
      this.select.disabled = true;
      if (this.label) {
        this.label.textContent = this.text.label;
      }
      this.resetOptions(this.text.loading);
      try {
        await this.fetchSessionContext();
        const classes = await this.fetchClasses();
        classes.forEach((cls) => {
          const option = document.createElement('option');
          option.value = cls.slug;
          option.textContent = cls.title ? `${cls.title} (${cls.slug})` : cls.slug;
          this.select.appendChild(option);
        });
        let initialSlug = this.state.classSlug;
        if (initialSlug && !classes.some((cls) => cls.slug === initialSlug)) {
          initialSlug = '';
        }
        if (!initialSlug && classes.length === 1) {
          initialSlug = classes[0].slug;
        }
        if (initialSlug) {
          this.select.value = initialSlug;
          await this.ensureSessionSelection(initialSlug);
        } else {
          this.select.value = '';
        }
      } catch (error) {
        console.error('hmClassSelector: failed to populate classes', error);
        callHandler(this.config.onError, this.text.error, 'error', error);
        this.resetOptions(this.text.error);
      } finally {
        this.state.loading = false;
        if (this.container) {
          this.container.classList.remove('is-loading');
        }
        this.select.disabled = !this.state.enabled;
        if (this.state.enabled && !this.select.disabled) {
          this.select.disabled = false;
        }
      }
    }

    async ensureSessionSelection(slug) {
      if (!slug) {
        return { classId: this.state.classId, classSlug: this.state.classSlug };
      }
      if (this.state.classSlug === slug && this.state.classId) {
        return { classId: this.state.classId, classSlug: this.state.classSlug };
      }
      try {
        const res = await fetchWithSession(`${API_BASE}/api/session/class`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ class_id: slug })
        });
        if (!res.ok) {
          const message = await res.text().catch(() => '');
          throw new Error(message || `Status ${res.status}`);
        }
        const data = await res.json();
        this.state.classId = data?.class_id || '';
        this.state.classSlug = data?.class_slug || slug;
        if (this.state.classId) {
          callHandler(CLASS_STORAGE.set, this.state.classId, this.state.classSlug || slug);
        } else {
          callHandler(CLASS_STORAGE.clear);
        }
        return { classId: this.state.classId, classSlug: this.state.classSlug };
      } catch (error) {
        console.error('hmClassSelector: failed to update class selection', error);
        throw error;
      }
    }

    async handleSelectionChange(event) {
      const nextSlug = event && event.target ? event.target.value : '';
      if (!nextSlug || nextSlug === this.state.classSlug) {
        return;
      }
      const previousSlug = this.state.classSlug;
      if (this.container) {
        this.container.classList.add('is-updating');
      }
      this.select.disabled = true;
      try {
        const context = await this.ensureSessionSelection(nextSlug);
        await callHandler(this.config.onClassChange, context);
      } catch (error) {
        if (previousSlug) {
          this.select.value = previousSlug;
        } else {
          this.select.value = '';
        }
        callHandler(this.config.onError, this.text.changeError, 'error', error);
      } finally {
        if (this.container) {
          this.container.classList.remove('is-updating');
        }
        this.select.disabled = !this.state.enabled;
      }
    }

    attachListeners() {
      if (this.select) {
        this.select.addEventListener('change', this.boundOnChange);
      }
      if (this.permissions && typeof this.permissions.subscribe === 'function') {
        this.unsubscribe = this.permissions.subscribe((nextState, prevState) => {
          const wasEnabled = Boolean(prevState && prevState.classSelectorEnabled);
          const nextEnabled = Boolean(nextState && nextState.classSelectorEnabled);
          if (nextEnabled === wasEnabled) {
            return;
          }
          if (nextEnabled) {
            this.init({ forceReload: true }).catch((error) => {
              console.error('hmClassSelector: failed to reinitialise after permission change', error);
            });
          } else {
            this.setEnabled(false);
          }
        }, { immediate: false });
      }
    }

    detachListeners() {
      if (this.select) {
        this.select.removeEventListener('change', this.boundOnChange);
      }
      if (typeof this.unsubscribe === 'function') {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    }

    async init(options = {}) {
      if (!this.resolveElements()) {
        return null;
      }
      this.detachListeners();
      if (this.label) {
        this.label.textContent = this.text.label;
      }
      const enabled = this.computeEnabled();
      this.setEnabled(enabled);
      if (!options.skipListeners) {
        this.attachListeners();
      }
      if (!enabled) {
        return null;
      }
      await this.populateOptions();
      if (this.select && !this.select.disabled) {
        this.select.disabled = false;
      }
      return { classId: this.state.classId, classSlug: this.state.classSlug };
    }

    destroy() {
      this.detachListeners();
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      this.container = null;
      this.select = null;
      this.label = null;
      this.classes = [];
    }

    getCurrentClass() {
      return {
        classId: this.state.classId,
        classSlug: this.state.classSlug
      };
    }
  }

  const namespace = root.hmClassSelector || (root.hmClassSelector = {});
  namespace.create = function createClassSelector(config) {
    return new ClassSelectorController(config);
  };
})(typeof window !== 'undefined' ? window : this);
