(function (global) {
  const root = typeof global !== 'undefined' ? global : window;
  const namespace = root.hmCalendar || (root.hmCalendar = {});

  const listeners = new Set();

  const state = {
    role: 'guest',
    canManageEntries: false,
    canCreatePersonalTodos: false,
    classSelectorEnabled: false
  };

  function getStateSnapshot() {
    return {
      role: state.role,
      canManageEntries: state.canManageEntries,
      canCreatePersonalTodos: state.canCreatePersonalTodos,
      classSelectorEnabled: state.classSelectorEnabled
    };
  }

  function resolveSessionRole() {
    try {
      const nextRole = root.hmAuth?.currentRole?.();
      return typeof nextRole === 'string' && nextRole.trim() ? nextRole : 'guest';
    } catch (error) {
      console.warn('Unable to read current auth role:', error);
      return 'guest';
    }
  }

  function computeCanManageEntries(roleValue) {
    return roleValue === 'admin' || roleValue === 'teacher' || roleValue === 'class_admin';
  }

  function computeClassSelectorEnabled(roleValue) {
    return roleValue === 'admin' || roleValue === 'teacher';
  }

  function computeCanCreatePersonalTodos(roleValue) {
    return roleValue !== 'guest';
  }

  function setStateFromRole(roleValue) {
    state.role = roleValue;
    state.canManageEntries = computeCanManageEntries(roleValue);
    state.canCreatePersonalTodos = computeCanCreatePersonalTodos(roleValue);
    state.classSelectorEnabled = computeClassSelectorEnabled(roleValue);
  }

  function notify(previousState) {
    const snapshot = getStateSnapshot();
    listeners.forEach((listener) => {
      if (typeof listener !== 'function') {
        return;
      }
      try {
        listener(snapshot, previousState ? { ...previousState } : null);
      } catch (error) {
        console.error('hmCalendar permissions listener failed:', error);
      }
    });
  }

  function refresh() {
    const previousState = getStateSnapshot();
    const nextRole = resolveSessionRole();
    const nextCanManage = computeCanManageEntries(nextRole);
    const nextCanCreatePersonalTodos = computeCanCreatePersonalTodos(nextRole);
    const nextClassSelectorEnabled = computeClassSelectorEnabled(nextRole);

    const hasChanged =
      previousState.role !== nextRole ||
      previousState.canManageEntries !== nextCanManage ||
      previousState.canCreatePersonalTodos !== nextCanCreatePersonalTodos ||
      previousState.classSelectorEnabled !== nextClassSelectorEnabled;

    if (hasChanged) {
      state.role = nextRole;
      state.canManageEntries = nextCanManage;
      state.canCreatePersonalTodos = nextCanCreatePersonalTodos;
      state.classSelectorEnabled = nextClassSelectorEnabled;
      notify(previousState);
    }

    return getStateSnapshot();
  }

  function subscribe(listener, options = {}) {
    if (typeof listener !== 'function') {
      return () => {};
    }

    listeners.add(listener);

    if (options.immediate !== false) {
      try {
        listener(getStateSnapshot(), null);
      } catch (error) {
        console.error('hmCalendar permissions listener failed:', error);
      }
    }

    return () => {
      listeners.delete(listener);
    };
  }

  function updateActionBarPermissions(options = {}) {
    if (typeof document === 'undefined') {
      return;
    }

    const {
      actionBarSelector = '.calendar-action-bar',
      createButtonSelector = '[data-action="create"]',
      onCreate,
      canManageEntries,
      canCreatePersonalTodos
    } = options;

    const actionBar = document.querySelector(actionBarSelector);
    if (!actionBar) {
      return;
    }

    const createBtn = actionBar.querySelector(createButtonSelector);
    if (!createBtn) {
      return;
    }

    const allowManage =
      typeof canManageEntries === 'boolean' ? canManageEntries : state.canManageEntries;
    const allowPersonalTodos =
      typeof canCreatePersonalTodos === 'boolean' ? canCreatePersonalTodos : state.canCreatePersonalTodos;

    if (!allowManage && !allowPersonalTodos) {
      createBtn.disabled = true;
      createBtn.setAttribute('aria-disabled', 'true');
      return;
    }

    createBtn.disabled = false;
    createBtn.removeAttribute('aria-disabled');

    const handler =
      typeof onCreate === 'function'
        ? onCreate
        : typeof root.showEntryForm === 'function'
          ? root.showEntryForm
          : null;

    if (handler && !createBtn.dataset.hmRoleBound) {
      createBtn.addEventListener('click', handler);
      createBtn.dataset.hmRoleBound = 'true';
    }
  }

  function initialise() {
    const initialRole = resolveSessionRole();
    setStateFromRole(initialRole);
  }

  initialise();

  if (typeof root !== 'undefined' && typeof root.addEventListener === 'function') {
    root.addEventListener('hm:auth-changed', () => {
      refresh();
    });
  }

  namespace.permissions = {
    resolveSessionRole,
    computeCanManageEntries,
    computeCanCreatePersonalTodos,
    computeClassSelectorEnabled,
    getState: getStateSnapshot,
    refresh,
    subscribe,
    updateActionBarPermissions
  };
})(typeof window !== 'undefined' ? window : this);
