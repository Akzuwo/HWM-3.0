// LOGIN & SESSION MANAGEMENT
const authT = window.hmI18n ? window.hmI18n.scope('auth') : (key, fallback) => fallback;

function formatMessage(template, params) {
    if (!template) {
        return '';
    }
    return template.replace(/\{(\w+)\}/g, (match, key) => (params && key in params ? params[key] : match));
}

const LOGIN_TEXT = {
    title: authT('title', '🔒 Login'),
    registerTitle: authT('registerTitle', '🆕 Create account'),
    registerSubtitle: authT('registerSubtitle', 'Sign up with your school email address.'),
    newBadge: authT('newBadge', 'NEW'),
    emailLabel: authT('emailLabel', 'Email address'),
    emailPlaceholder: authT('emailPlaceholder', 'name@example.com'),
    passwordLabel: authT('passwordLabel', 'Password'),
    passwordPlaceholder: authT('passwordPlaceholder', 'Password'),
    show: authT('show', 'Show password'),
    hide: authT('hide', 'Hide password'),
    emailRequired: authT('emailRequired', 'Please enter an email address.'),
    passwordRequired: authT('passwordRequired', 'Please enter a password.'),
    invalidCredentials: authT('invalidCredentials', 'The email or password is incorrect.'),
    inactive: authT('inactive', 'Your account has been deactivated. Please contact an administrator.'),
    emailNotVerified: authT('emailNotVerified', 'Please verify your email address first.'),
    verificationStepTitle: authT('verificationStepTitle', 'You are almost ready!'),
    verificationStepSubtitle: authT('verificationStepSubtitle', 'Confirm your email address to get started.'),
    verificationCodeLabel: authT('verificationCodeLabel', 'Verification code'),
    verificationCodePlaceholder: authT('verificationCodePlaceholder', '8-digit code'),
    verificationCodeHint: authT('verificationCodeHint', '⚠️ Email delivery can take up to 2 minutes.'),
    verificationCodeSubmit: authT('verificationCodeSubmit', 'Confirm code'),
    verificationCodeSubmitLoading: authT('verificationCodeSubmitLoading', 'Checking…'),
    verificationCodeResend: authT('verificationCodeResend', 'Resend code'),
    verificationCodeResendLoading: authT('verificationCodeResendLoading', 'Sending…'),
    verificationCodeInvalid: authT('verificationCodeInvalid', 'The code is invalid or has expired.'),
    verificationCodeSuccess: authT('verificationCodeSuccess', 'Success! Your email address has been confirmed. You can sign in now.'),
    resendSuccess: authT('resendSuccess', 'If an account exists, we have sent the code again. Delivery can take a few minutes.'),
    resendError: authT('resendError', 'We could not send the email. Please try again later.'),
    cooldownWarning: authT('cooldownWarning', 'Please wait a moment before trying again.'),
    forgotPassword: authT('forgotPassword', 'Forgot password?'),
    forgotPasswordMissingEmail: authT('forgotPasswordMissingEmail', 'Please enter your email address first.'),
    passwordResetTitle: authT('passwordResetTitle', '🔁 Reset password'),
    passwordResetSubtitle: authT('passwordResetSubtitle', 'Enter the code from your email and choose a new password.'),
    passwordResetCodeLabel: authT('passwordResetCodeLabel', 'Reset code'),
    passwordResetCodePlaceholder: authT('passwordResetCodePlaceholder', '8-digit code'),
    passwordResetCodeHint: authT('passwordResetCodeHint', 'The code is valid for 10 minutes. Please also check your spam folder.'),
    passwordResetRequest: authT('passwordResetRequest', 'Request reset code'),
    passwordResetRequestLoading: authT('passwordResetRequestLoading', 'Requesting…'),
    passwordResetRequestSuccess: authT('passwordResetRequestSuccess', 'If an account exists, we just sent you a reset code.'),
    passwordResetRequestError: authT('passwordResetRequestError', 'We could not request a reset code. Please try again later.'),
    passwordResetNewPasswordLabel: authT('passwordResetNewPasswordLabel', 'New password'),
    passwordResetNewPasswordPlaceholder: authT('passwordResetNewPasswordPlaceholder', 'New password'),
    passwordResetConfirmLabel: authT('passwordResetConfirmLabel', 'Confirm new password'),
    passwordResetSubmit: authT('passwordResetSubmit', 'Change password'),
    passwordResetSubmitLoading: authT('passwordResetSubmitLoading', 'Updating password…'),
    passwordResetCancel: authT('passwordResetCancel', 'Back to login'),
    passwordResetCodeRequired: authT('passwordResetCodeRequired', 'Please enter the reset code.'),
    passwordResetPasswordRequired: authT('passwordResetPasswordRequired', 'Please enter a new password.'),
    passwordResetPasswordWeak: authT('passwordResetPasswordWeak', 'Your new password must contain at least 8 characters.'),
    passwordResetPasswordMismatch: authT('passwordResetPasswordMismatch', 'The passwords do not match.'),
    passwordResetInvalidCode: authT('passwordResetInvalidCode', 'The code is invalid or has expired.'),
    passwordResetSuccess: authT('passwordResetSuccess', 'Your password has been updated. You can sign in now.'),
    passwordResetError: authT('passwordResetError', 'Reset is currently unavailable. Please try again later.'),
    submit: authT('submit', 'Log in'),
    submitLoading: authT('submitLoading', 'Logging in…'),
    registerSubmit: authT('registerSubmit', 'Register'),
    registerSubmitLoading: authT('registerSubmitLoading', 'Registering…'),
    guestButton: authT('guestButton', 'Continue as guest'),
    guestInfo: authT('guestInfo', 'Continue without an account'),
    loginButton: authT('loginButton', 'Log in'),
    logoutButton: authT('logoutButton', 'Log out'),
    accountButton: authT('accountButton', 'Account'),
    accountProfile: authT('accountProfile', 'Profile'),
    adminNavButton: authT('adminNavButton', 'Admin'),
    authStatusGuest: authT('authStatusGuest', 'Not signed in'),
    authStatusSignedIn: (roleLabel) =>
        formatMessage(authT('authStatusSignedIn', 'Signed in as {role}'), { role: roleLabel }),
    roleLabels: {
        admin: authT('roleLabels.admin', 'Administrator'),
        teacher: authT('roleLabels.teacher', 'Teacher'),
        class_admin: authT('roleLabels.class_admin', 'Class admin'),
        student: authT('roleLabels.student', 'Student'),
        guest: authT('roleLabels.guest', 'Guest')
    },
    genericError: authT('genericError', 'Something went wrong while signing in. Please try again later.'),
    registerPasswordMismatch: authT('registerPasswordMismatch', 'Passwords do not match.'),
    registerWeakPassword: authT('registerWeakPassword', 'Password must be at least 8 characters long.'),
    registerEmailInvalid: authT('registerEmailInvalid', 'Please use your @sluz.ch email address.'),
    registerEmailExists: authT('registerEmailExists', 'An account already exists for this email address.'),
    registerPasswordConfirmLabel: authT('registerPasswordConfirmLabel', 'Confirm password'),
    registerClassLabel: authT('registerClassLabel', 'Class (optional)'),
    registerClassPlaceholder: authT('registerClassPlaceholder', 'e.g. L23a / Teachers: leave this blank'),
    registerClassNotFound: authT('registerClassNotFound', 'We could not find this class.'),
    registerGenericError: authT('registerGenericError', 'Registration is currently unavailable. Please try again later.'),
    registerSuccess: authT('registerSuccess', 'Almost done! Enter the verification code we emailed you.'),
    switchToRegister: authT('switchToRegister', 'New here? Create an account'),
    switchToLogin: authT('switchToLogin', 'Already registered? Log in'),
    close: authT('close', 'Close')
};

const API_BASE = (() => {
    const base = 'https://hwm-api.akzuwo.ch';
    if (typeof window !== 'undefined') {
        window.__HM_RESOLVED_API_BASE__ = base;
        window.hmResolveApiBase = () => base;
    }
    return base;
})();

const AUTH_API = {
    login: `${API_BASE}/api/auth/login`,
    register: `${API_BASE}/api/auth/register`,
    logout: `${API_BASE}/api/auth/logout`,
    resend: `${API_BASE}/api/auth/resend`,
    verify: `${API_BASE}/api/auth/verify`,
    passwordReset: `${API_BASE}/api/auth/password-reset`
};

const AUTH_PATHS = {
    home: 'index.html',
    admin: 'admin/dashboard.html',
    login: 'login.html'
};

const HM_CLASS_STORAGE_KEYS = {
    id: 'hm.currentClassId',
    slug: 'hm.currentClassSlug'
};

function safeSessionStorageGet(key) {
    try {
        if (typeof window === 'undefined' || !window.sessionStorage) {
            return '';
        }
        return window.sessionStorage.getItem(key) || '';
    } catch (error) {
        return '';
    }
}

function safeSessionStorageSet(key, value) {
    try {
        if (typeof window === 'undefined' || !window.sessionStorage) {
            return;
        }
        if (value === null || value === undefined || value === '') {
            window.sessionStorage.removeItem(key);
        } else {
            window.sessionStorage.setItem(key, value);
        }
    } catch (error) {
        /* ignore storage errors */
    }
}

const hmClassStorage = {
    getId() {
        return safeSessionStorageGet(HM_CLASS_STORAGE_KEYS.id);
    },
    getSlug() {
        return safeSessionStorageGet(HM_CLASS_STORAGE_KEYS.slug);
    },
    set(classId, classSlug) {
        if (classId) {
            safeSessionStorageSet(HM_CLASS_STORAGE_KEYS.id, classId);
            safeSessionStorageSet(HM_CLASS_STORAGE_KEYS.slug, classSlug || classId);
        } else {
            this.clear();
        }
    },
    clear() {
        safeSessionStorageSet(HM_CLASS_STORAGE_KEYS.id, '');
        safeSessionStorageSet(HM_CLASS_STORAGE_KEYS.slug, '');
    }
};

if (typeof window !== 'undefined') {
    window.hmClassStorage = hmClassStorage;
}

const VERIFICATION_ACTION_COOLDOWN_MS = 30000;
const actionCooldowns = {
    register: 0,
    resend: 0
};

function getNow() {
    return Date.now();
}

function setActionCooldown(action, duration = VERIFICATION_ACTION_COOLDOWN_MS) {
    actionCooldowns[action] = getNow() + Math.max(duration, 0);
}

function getActionCooldownRemaining(action) {
    const until = actionCooldowns[action] || 0;
    return Math.max(until - getNow(), 0);
}

function isActionOnCooldown(action) {
    return getActionCooldownRemaining(action) > 0;
}

function scheduleCooldownReset(action) {
    const remaining = getActionCooldownRemaining(action);
    if (remaining <= 0) {
        applyActionCooldown(action);
        return;
    }
    window.setTimeout(() => {
        if (isActionOnCooldown(action)) {
            scheduleCooldownReset(action);
        } else {
            applyActionCooldown(action);
        }
    }, remaining + 50);
}

const SESSION_STORAGE_KEY = 'hm.session';

const DEFAULT_SESSION = {
    role: 'guest',
    email: '',
    emailVerified: false,
    isAdmin: false,
    isClassAdmin: false,
    canManageEntries: false,
    canCreatePersonalTodos: false
};

let sessionState = normalizeSession(loadStoredSession());
let lastAuthEmail = sessionState.email || '';
let currentVerificationEmail = '';
let authOverlayInitialized = false;
let authOverlayPreviousFocus = null;
let lastAuthBroadcast = null;

function normalizeRole(value) {
    if (!value) {
        return 'guest';
    }
    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'admin' || normalized === 'teacher' || normalized === 'class_admin' || normalized === 'student') {
        return normalized;
    }
    if (normalized === 'guest') {
        return 'guest';
    }
    return 'student';
}

function normalizeSession(data = {}) {
    const role = normalizeRole(data.role);
    return {
        role,
        email: data.email || '',
        emailVerified: Boolean(data.emailVerified),
        isAdmin: role === 'admin',
        isClassAdmin: role === 'admin' || role === 'class_admin',
        canManageEntries: role === 'admin' || role === 'teacher' || role === 'class_admin',
        canCreatePersonalTodos: role !== 'guest'
    };
}

function loadStoredSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) {
            return { ...DEFAULT_SESSION };
        }
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SESSION, ...parsed };
    } catch (error) {
        return { ...DEFAULT_SESSION };
    }
}

function persistSession() {
    sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
            role: sessionState.role,
            email: sessionState.email,
            emailVerified: sessionState.emailVerified
        })
    );
}

function setAuthenticatedSession(role, email) {
    sessionState = normalizeSession({
        role,
        email,
        emailVerified: true
    });
    lastAuthEmail = email;
    hmClassStorage.clear();
    persistSession();
    updateAuthUI();
}

function clearSessionState() {
    sessionState = { ...DEFAULT_SESSION };
    lastAuthEmail = '';
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    hmClassStorage.clear();
    updateAuthUI();
}

function isAdmin() {
    return sessionState.isAdmin;
}

function isClassAdmin() {
    return sessionState.isClassAdmin;
}

function canManageEntries() {
    return sessionState.canManageEntries;
}

function canCreatePersonalTodos() {
    return sessionState.canCreatePersonalTodos;
}

function isAuthenticated() {
    return sessionState.role !== 'guest';
}

function getAuthSnapshot() {
    return {
        isAuthenticated: isAuthenticated(),
        email: sessionState.email || '',
        role: sessionState.role || 'guest'
    };
}

function dispatchAuthChange(force = false) {
    const snapshot = getAuthSnapshot();
    if (
        !force
        && lastAuthBroadcast
        && lastAuthBroadcast.isAuthenticated === snapshot.isAuthenticated
        && lastAuthBroadcast.email === snapshot.email
        && lastAuthBroadcast.role === snapshot.role
    ) {
        return;
    }

    lastAuthBroadcast = { ...snapshot };

    if (typeof window === 'undefined') {
        return;
    }

    const bridge = window.hmAuth || {};
    bridge.isAuthenticated = () => isAuthenticated();
    bridge.currentEmail = () => sessionState.email || '';
    bridge.currentRole = () => sessionState.role || 'guest';
    window.hmAuth = bridge;

    if (typeof window.dispatchEvent === 'function') {
        try {
            window.dispatchEvent(new CustomEvent('hm:auth-changed', { detail: snapshot }));
            return;
        } catch (error) {
            /* CustomEvent might not be supported */
        }
    }

    if (typeof document !== 'undefined' && typeof document.createEvent === 'function') {
        const fallbackEvent = document.createEvent('CustomEvent');
        fallbackEvent.initCustomEvent('hm:auth-changed', true, true, snapshot);
        window.dispatchEvent(fallbackEvent);
    }
}

dispatchAuthChange(true);

function getRoleLabel(role = sessionState.role) {
    const labels = LOGIN_TEXT.roleLabels || {};
    return labels[role] || role;
}

function getAuthStatusText() {
    if (!isAuthenticated()) {
        return LOGIN_TEXT.authStatusGuest;
    }
    const roleLabel = getRoleLabel();
    if (typeof LOGIN_TEXT.authStatusSignedIn === 'function') {
        return LOGIN_TEXT.authStatusSignedIn(roleLabel);
    }
    return LOGIN_TEXT.authStatusSignedIn || roleLabel;
}

function updateAuthStatus() {
    const text = getAuthStatusText();
    const authenticated = isAuthenticated();
    document.querySelectorAll('[data-auth-status]').forEach((element) => {
        element.textContent = text;
        element.classList.toggle('is-authenticated', authenticated);
    });
}

function getAdminNavButton() {
    const links = document.querySelector('.nav-links');
    if (!links) {
        return null;
    }
    let button = links.querySelector('[data-admin-link]');
    if (!button) {
        button = document.createElement('a');
        button.className = 'nav-link nav-link--admin';
        button.href = AUTH_PATHS.admin;
        button.setAttribute('data-admin-link', 'true');
        button.textContent = LOGIN_TEXT.adminNavButton || 'Admin';
        button.hidden = true;
        const authButton = links.querySelector('[data-auth-button]');
        if (authButton && authButton.parentElement === links) {
            links.insertBefore(button, authButton);
        } else {
            links.appendChild(button);
        }
    }
    return button;
}

function updateAdminNavButton() {
    const button = getAdminNavButton();
    if (!button) {
        return;
    }
    button.textContent = LOGIN_TEXT.adminNavButton || 'Admin';
    const visible = isAdmin();
    button.hidden = !visible;
    button.classList.toggle('is-hidden', !visible);
    if (visible) {
        button.removeAttribute('tabindex');
        button.setAttribute('aria-hidden', 'false');
    } else {
        button.setAttribute('tabindex', '-1');
        button.setAttribute('aria-hidden', 'true');
    }
}

function updateRoleHint() {
    document.querySelectorAll('[data-auth-role-hint]').forEach((hint) => hint.remove());
}

function closeAccountMenus() {
    document.querySelectorAll('[data-account-control].is-open').forEach((control) => {
        const toggle = control.querySelector('[data-account-toggle]');
        const menu = control.querySelector('[data-account-menu]');
        control.classList.remove('is-open');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
        if (menu) {
            menu.classList.remove('is-open');
        }
    });
}

function syncAccountControls() {
    const authenticated = isAuthenticated();
    const accountLabel = LOGIN_TEXT.accountButton || 'Account';
    const profileLabel = LOGIN_TEXT.accountProfile || 'Profile';
    const logoutLabel = LOGIN_TEXT.logoutButton || 'Log out';

    document.querySelectorAll('[data-account-control]').forEach((control) => {
        const toggle = control.querySelector('[data-account-toggle]');
        const label = control.querySelector('[data-account-label]');
        const menu = control.querySelector('[data-account-menu]');
        const profileLink = control.querySelector('[data-account-profile]');
        const logoutButton = control.querySelector('[data-account-logout]');

        control.classList.toggle('is-hidden', !authenticated);
        control.setAttribute('aria-hidden', authenticated ? 'false' : 'true');

        if (label) {
            label.textContent = accountLabel;
        }
        if (toggle) {
            toggle.setAttribute('aria-label', accountLabel);
        }
        if (profileLink) {
            profileLink.textContent = profileLabel;
        }
        if (logoutButton) {
            logoutButton.textContent = logoutLabel;
        }

        control.classList.remove('is-open');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
        if (menu) {
            menu.classList.remove('is-open');
        }
    });
}

function updateAuthButton() {
    const buttons = document.querySelectorAll('[data-auth-button]');
    const authenticated = isAuthenticated();
    const loginLabel = LOGIN_TEXT.loginButton || 'Log in';

    buttons.forEach((button) => {
        button.textContent = loginLabel;
        button.classList.toggle('is-hidden', authenticated);
        button.setAttribute('aria-hidden', authenticated ? 'true' : 'false');
        if (authenticated) {
            button.setAttribute('tabindex', '-1');
        } else {
            button.removeAttribute('tabindex');
        }
    });

    syncAccountControls();
}

function setupAuthButton() {
    const buttons = document.querySelectorAll('[data-auth-button]');
    if (!buttons.length) {
        return;
    }

    buttons.forEach((button) => {
        if (button.dataset.authBound === 'true') {
            return;
        }

        button.addEventListener('click', () => {
            if (!isAuthenticated()) {
                openAuthOverlay(button);
            }
        });

        button.dataset.authBound = 'true';
    });

    updateAuthButton();
}

function setupAccountControls() {
    const controls = document.querySelectorAll('[data-account-control]');
    if (!controls.length) {
        return;
    }

    controls.forEach((control) => {
        if (control.dataset.accountBound === 'true') {
            return;
        }

        const toggle = control.querySelector('[data-account-toggle]');
        const menu = control.querySelector('[data-account-menu]');
        const profileLink = control.querySelector('[data-account-profile]');
        const logoutButton = control.querySelector('[data-account-logout]');

        const closeMenu = () => {
            control.classList.remove('is-open');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
            if (menu) {
                menu.classList.remove('is-open');
            }
        };

        const openMenu = () => {
            closeAccountMenus();
            control.classList.add('is-open');
            if (menu) {
                menu.classList.add('is-open');
            }
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'true');
            }
        };

        const handleToggle = (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (control.classList.contains('is-hidden')) {
                return;
            }
            if (control.classList.contains('is-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        const handleDocumentClick = (event) => {
            if (!control.contains(event.target)) {
                closeMenu();
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && control.classList.contains('is-open')) {
                event.preventDefault();
                closeMenu();
                toggle?.focus();
            }
        };

        toggle?.addEventListener('click', handleToggle);
        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleKeyDown);

        profileLink?.addEventListener('click', closeMenu);
        logoutButton?.addEventListener('click', (event) => {
            event.preventDefault();
            closeMenu();
            logout();
        });

        control.dataset.accountBound = 'true';
    });
}

function updateFeatureVisibility() {
    const shouldHide = !isAuthenticated();
    const actionBar = document.querySelector('.calendar-action-bar');
    if (actionBar) {
        actionBar.classList.toggle('is-hidden', shouldHide);
    }
    document.querySelectorAll('[data-action="create"]').forEach((element) => {
        const hideCreate = !canManageEntries() && !canCreatePersonalTodos();
        element.classList.toggle('is-hidden', hideCreate);
    });
}

function updateAuthUI() {
    updateAuthButton();
    updateAdminNavButton();
    updateRoleHint();
    updateAuthStatus();
    updateFeatureVisibility();
    dispatchAuthChange();
}

function queryAuthForms() {
    return Array.from(document.querySelectorAll('[data-auth-form]'));
}

function applyActionCooldown(action) {
    if (action === 'register') {
        queryAuthForms().forEach(applyRegisterCooldown);
    } else if (action === 'resend') {
        queryAuthForms().forEach(applyResendCooldown);
    }
}

function getEmailInput(form) {
    return form ? form.querySelector('[data-auth-email]') : null;
}

function getPasswordInput(form) {
    return form ? form.querySelector('[data-auth-password]') : null;
}

function getPasswordConfirmInput(form) {
    return form ? form.querySelector('[data-auth-password-confirm]') : null;
}

function getClassInput(form) {
    return form ? form.querySelector('[data-auth-class]') : null;
}

function getPasswordResetCodeInput(form) {
    return form ? form.querySelector('[data-auth-reset-code]') : null;
}

function getPasswordResetInput(form) {
    return form ? form.querySelector('[data-auth-reset-password]') : null;
}

function getPasswordResetConfirmInput(form) {
    return form ? form.querySelector('[data-auth-reset-password-confirm]') : null;
}

function getAuthMode(form) {
    if (!form) {
        return 'login';
    }
    const mode = form.dataset.authMode;
    if (mode === 'register' || mode === 'verification' || mode === 'password-reset') {
        return mode;
    }
    // Fallback: infer mode from visible DOM sections so stale dataset doesn't mislead
    try {
        const resetStep = form.querySelector('[data-auth-reset-step]');
        if (resetStep && !resetStep.hidden) {
            return 'password-reset';
        }
        const verificationStep = form.querySelector('[data-auth-code-step]');
        if (verificationStep && !verificationStep.hidden) {
            return 'verification';
        }
        const credentials = form.querySelector('[data-auth-credentials]');
        if (credentials && !credentials.hidden) {
            return 'login';
        }
        // As another fallback, check classes toggled by setAuthMode
        if (form.classList.contains('is-password-reset-mode')) {
            return 'password-reset';
        }
        if (form.classList.contains('is-verification-mode')) {
            return 'verification';
        }
        if (form.classList.contains('is-register-mode')) {
            return 'register';
        }
    } catch (e) {
        // ignore and fall through
    }
    return 'login';
}

function applyRegisterCooldown(form) {
    if (!form) {
        return;
    }
    const submit = form.querySelector('[data-auth-submit]');
    if (!submit) {
        return;
    }
    if (submit.dataset.loading === 'true') {
        return;
    }
    const shouldDisable = getAuthMode(form) === 'register' && isActionOnCooldown('register');
    submit.disabled = shouldDisable;
}

function applyResendCooldown(form) {
    if (!form) {
        return;
    }
    const button = form.querySelector('[data-auth-resend]');
    if (!button || button.dataset.locked === 'true') {
        return;
    }
    button.disabled = isActionOnCooldown('resend');
}

function getSubmitLabel(form, isLoading) {
    const mode = getAuthMode(form);
    if (mode === 'register') {
        return isLoading ? LOGIN_TEXT.registerSubmitLoading : LOGIN_TEXT.registerSubmit;
    }
    if (mode === 'verification') {
        return isLoading ? LOGIN_TEXT.verificationCodeSubmitLoading : LOGIN_TEXT.verificationCodeSubmit;
    }
    if (mode === 'password-reset') {
        return isLoading ? LOGIN_TEXT.passwordResetSubmitLoading : LOGIN_TEXT.passwordResetSubmit;
    }
    return isLoading ? LOGIN_TEXT.submitLoading : LOGIN_TEXT.submit;
}

function setLoginFeedback(message = '', variant = 'neutral', form = null) {
    const targets = form ? [form] : queryAuthForms();
    targets.forEach((currentForm) => {
        const feedback = currentForm.querySelector('[data-auth-feedback]');
        if (!feedback) {
            return;
        }
        feedback.textContent = message;
        const isError = variant === 'error' && Boolean(message);
        const isSuccess = variant === 'success' && Boolean(message);
        feedback.classList.toggle('error', isError);
        feedback.classList.toggle('success', isSuccess);
        feedback.hidden = !message;
    });
}

function togglePasswordVisibility(form) {
    const input = getPasswordInput(form);
    const toggle = form ? form.querySelector('[data-auth-toggle]') : null;
    if (!input || !toggle) {
        return;
    }
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    toggle.setAttribute('aria-label', shouldShow ? LOGIN_TEXT.hide : LOGIN_TEXT.show);
    toggle.classList.toggle('visible', shouldShow);
    input.focus();
}

function togglePasswordResetVisibility(form) {
    const input = getPasswordResetInput(form);
    const toggle = form ? form.querySelector('[data-auth-reset-toggle]') : null;
    if (!input || !toggle) {
        return;
    }
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    toggle.setAttribute('aria-label', shouldShow ? LOGIN_TEXT.hide : LOGIN_TEXT.show);
    toggle.classList.toggle('visible', shouldShow);
    input.focus();
}

function focusPasswordField(form) {
    const input = getPasswordInput(form);
    if (input) {
        input.focus();
        if (typeof input.select === 'function') {
            input.select();
        }
    }
}

function focusPasswordResetCode(form) {
    const input = getPasswordResetCodeInput(form);
    if (input) {
        input.focus();
        if (typeof input.select === 'function') {
            input.select();
        }
    }
}

function setFormLoading(form, isLoading) {
    if (!form) {
        return;
    }
    const submit = form.querySelector('[data-auth-submit]');
    if (submit) {
        if (isLoading) {
            submit.disabled = true;
            submit.dataset.loading = 'true';
            submit.textContent = getSubmitLabel(form, true);
        } else {
            submit.textContent = getSubmitLabel(form, false);
            delete submit.dataset.loading;
            applyRegisterCooldown(form);
            if (submit.disabled && getAuthMode(form) !== 'register') {
                submit.disabled = false;
            }
        }
    }
    const codeButton = form.querySelector('[data-auth-code-submit]');
    if (codeButton) {
        if (isLoading && getAuthMode(form) === 'verification') {
            codeButton.disabled = true;
            codeButton.dataset.loading = 'true';
            codeButton.textContent = LOGIN_TEXT.verificationCodeSubmitLoading;
        } else {
            codeButton.textContent = LOGIN_TEXT.verificationCodeSubmit;
            if (codeButton.dataset.loading === 'true') {
                delete codeButton.dataset.loading;
            }
            if (getAuthMode(form) === 'verification') {
                codeButton.disabled = false;
            }
        }
    }
    const resend = form.querySelector('[data-auth-resend]');
    if (resend) {
        if (isLoading && resend.dataset.locked === 'true') {
            resend.disabled = true;
        } else if (resend.dataset.locked !== 'true') {
            applyResendCooldown(form);
        }
    }
}

function rememberEmail(email) {
    if (!email) {
        return;
    }
    lastAuthEmail = email;
}

function setVerificationEmail(form, email) {
    const normalized = (email || '').trim().toLowerCase();
    if (form) {
        if (normalized) {
            form.dataset.authVerificationEmail = normalized;
        } else {
            delete form.dataset.authVerificationEmail;
        }
    }
    if (normalized) {
        currentVerificationEmail = normalized;
        rememberEmail(normalized);
    }
}

function getVerificationEmail(form) {
    if (form && form.dataset.authVerificationEmail) {
        return form.dataset.authVerificationEmail;
    }
    return currentVerificationEmail || lastAuthEmail || '';
}

function setPasswordResetEmail(form, email) {
    if (!form) {
        return;
    }
    const normalized = (email || '').trim().toLowerCase();
    if (normalized) {
        form.dataset.authResetEmail = normalized;
    } else {
        delete form.dataset.authResetEmail;
    }
}

function getPasswordResetEmail(form) {
    if (form && form.dataset.authResetEmail) {
        return form.dataset.authResetEmail;
    }
    const emailInput = getEmailInput(form);
    if (emailInput && emailInput.value) {
        return emailInput.value.trim().toLowerCase();
    }
    return '';
}

function clearPasswordResetInputs(form) {
    const codeInput = getPasswordResetCodeInput(form);
    if (codeInput) {
        codeInput.value = '';
    }
    const passwordInput = getPasswordResetInput(form);
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.type = 'password';
    }
    const confirmInput = getPasswordResetConfirmInput(form);
    if (confirmInput) {
        confirmInput.value = '';
    }
    const toggle = form ? form.querySelector('[data-auth-reset-toggle]') : null;
    if (toggle) {
        toggle.classList.remove('visible');
        toggle.setAttribute('aria-label', LOGIN_TEXT.show);
    }
}

function clearPasswordResetState(form) {
    if (!form) {
        return;
    }
    clearPasswordResetInputs(form);
    delete form.dataset.authResetEmail;
}

function applyEmailPrefill(form) {
    if (!form || !lastAuthEmail) {
        return;
    }
    const emailInput = getEmailInput(form);
    if (emailInput && !emailInput.value) {
        emailInput.value = lastAuthEmail;
    }
}

function toggleAuthSectionVisibility(element, shouldShow) {
    if (!element) {
        return;
    }

    element.removeAttribute('hidden');

    if (!element.dataset.authOriginalDisplay) {
        if (element.dataset.authDisplay) {
            element.dataset.authOriginalDisplay = element.dataset.authDisplay;
        } else if (typeof window !== 'undefined' && window.getComputedStyle) {
            const computedDisplay = window.getComputedStyle(element).display;
            if (computedDisplay && computedDisplay !== 'none') {
                element.dataset.authOriginalDisplay = computedDisplay;
            }
        }
    }

    element.classList.add('auth-section');

    if (typeof window !== 'undefined' && element.__authHideTimer) {
        window.clearTimeout(element.__authHideTimer);
        element.__authHideTimer = null;
    }

    if (shouldShow) {
        const originalDisplay = element.dataset.authOriginalDisplay || '';
        if (originalDisplay) {
            element.style.display = originalDisplay;
        } else {
            element.style.removeProperty('display');
        }
        element.classList.add('auth-section-active');
        element.classList.remove('auth-section-hidden');
        element.removeAttribute('aria-hidden');
    } else {
        element.classList.remove('auth-section-active');
        element.classList.add('auth-section-hidden');
        element.setAttribute('aria-hidden', 'true');

        if (typeof window !== 'undefined') {
            element.__authHideTimer = window.setTimeout(() => {
                element.style.display = 'none';
                element.__authHideTimer = null;
            }, 320);
        } else {
            element.style.display = 'none';
        }
    }
}

function setAuthMode(form, mode, options = {}) {
    if (!form) {
        return;
    }

    const previousMode = form.dataset.authMode || '';
    const { preserveFeedback = false } = options;
    const normalizedMode = mode === 'register'
        ? 'register'
        : mode === 'verification'
            ? 'verification'
            : mode === 'password-reset'
                ? 'password-reset'
                : 'login';
    form.dataset.authMode = normalizedMode;
    form.classList.toggle('is-register-mode', normalizedMode === 'register');
    form.classList.toggle('is-verification-mode', normalizedMode === 'verification');
    form.classList.toggle('is-password-reset-mode', normalizedMode === 'password-reset');

    const container = form.closest('.login-container');
    if (container) {
        if (
            previousMode &&
            previousMode !== normalizedMode &&
            normalizedMode !== 'verification' &&
            previousMode !== 'verification'
        ) {
            container.classList.add('is-switching');
            if (container.__authSwitchTimer) {
                window.clearTimeout(container.__authSwitchTimer);
            }
            container.__authSwitchTimer = window.setTimeout(() => {
                container.classList.remove('is-switching');
                container.__authSwitchTimer = null;
            }, 360);
        }

        const title = container.querySelector('[data-auth-title]');
        if (title) {
            if (normalizedMode === 'register') {
                title.textContent = LOGIN_TEXT.registerTitle;
            } else if (normalizedMode === 'verification') {
                title.textContent = LOGIN_TEXT.verificationStepTitle;
            } else if (normalizedMode === 'password-reset') {
                title.textContent = LOGIN_TEXT.passwordResetTitle;
            } else {
                title.textContent = LOGIN_TEXT.title;
            }
        }
        const description = container.querySelector('[data-auth-description]');
        if (description) {
            if (normalizedMode === 'register' && LOGIN_TEXT.registerSubtitle) {
                description.textContent = LOGIN_TEXT.registerSubtitle;
                description.hidden = false;
            } else if (normalizedMode === 'verification') {
                description.textContent = LOGIN_TEXT.verificationStepSubtitle;
                description.hidden = false;
            } else if (normalizedMode === 'password-reset') {
                description.textContent = LOGIN_TEXT.passwordResetSubtitle;
                description.hidden = false;
            } else {
                description.hidden = true;
            }
        }
    }

    const registerScope = container || form;
    registerScope.querySelectorAll('[data-auth-register-only]').forEach((element) => {
        toggleAuthSectionVisibility(element, normalizedMode === 'register');
    });
    const loginScope = container || form;
    loginScope.querySelectorAll('[data-auth-login-only]').forEach((element) => {
        toggleAuthSectionVisibility(element, normalizedMode === 'login');
    });

    const switchToRegister = form.querySelector('[data-auth-switch="register"]');
    const switchToLogin = form.querySelector('[data-auth-switch="login"]');
    if (switchToRegister) {
        switchToRegister.hidden = normalizedMode === 'register';
    }
    if (switchToLogin) {
        switchToLogin.hidden = normalizedMode !== 'register';
    }

    const forgotButton = form.querySelector('[data-auth-forgot]');
    if (forgotButton) {
        forgotButton.hidden = normalizedMode !== 'login';
    }

    const submit = form.querySelector('[data-auth-submit]');
    if (submit) {
        submit.hidden = normalizedMode === 'verification' || normalizedMode === 'password-reset';
        submit.textContent = getSubmitLabel(form, false);
    }

    const credentials = form.querySelector('[data-auth-credentials]');
    if (credentials) {
        credentials.hidden = normalizedMode === 'verification' || normalizedMode === 'password-reset';
    }

    const verificationStep = form.querySelector('[data-auth-code-step]');
    if (verificationStep) {
        verificationStep.hidden = normalizedMode !== 'verification';
    }

    const resetStep = form.querySelector('[data-auth-reset-step]');
    if (resetStep) {
        resetStep.hidden = normalizedMode !== 'password-reset';
    }

    const passwordInput = getPasswordInput(form);
    if (passwordInput) {
        passwordInput.setAttribute('autocomplete', normalizedMode === 'register' ? 'new-password' : 'current-password');
    }

    const confirmInput = getPasswordConfirmInput(form);
    if (confirmInput) {
        confirmInput.required = normalizedMode === 'register';
        if (normalizedMode !== 'register') {
            confirmInput.value = '';
        }
    }

    if (normalizedMode === 'password-reset') {
        window.setTimeout(() => focusPasswordResetCode(form), 0);
    } else if (previousMode === 'password-reset') {
        clearPasswordResetState(form);
    }

    if (!preserveFeedback) {
        setLoginFeedback('', 'neutral', form);
    }

    applyRegisterCooldown(form);
    applyResendCooldown(form);
}

function bindAuthForms() {
    queryAuthForms().forEach((form) => {
        if (form.dataset.authBound === 'true') {
            setAuthMode(form, getAuthMode(form), { preserveFeedback: true });
            applyEmailPrefill(form);
            applyRegisterCooldown(form);
            applyResendCooldown(form);
            return;
        }

        setAuthMode(form, form.dataset.authMode || 'login');
        applyRegisterCooldown(form);
        applyResendCooldown(form);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            handleAuthSubmit(form);
        });

        const emailInput = getEmailInput(form);
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                rememberEmail(emailInput.value.trim());
                setLoginFeedback('', 'neutral', form);
            });
            emailInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAuthSubmit(form);
                }
            });
            emailInput.addEventListener('blur', () => {
                if (getAuthMode(form) !== 'register') {
                    return;
                }

                const value = emailInput.value.trim().toLowerCase();
                if (value && !value.endsWith('@sluz.ch')) {
                    setLoginFeedback(LOGIN_TEXT.registerEmailInvalid, 'error', form);
                }
            });
        }

        const passwordInput = getPasswordInput(form);
        if (passwordInput) {
            passwordInput.addEventListener('input', () => setLoginFeedback('', 'neutral', form));
            passwordInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAuthSubmit(form);
                }
            });
        }

        const confirmInput = getPasswordConfirmInput(form);
        if (confirmInput) {
            confirmInput.addEventListener('input', () => setLoginFeedback('', 'neutral', form));
            confirmInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAuthSubmit(form);
                }
            });
        }

        const classInput = getClassInput(form);
        if (classInput) {
            classInput.addEventListener('input', () => setLoginFeedback('', 'neutral', form));
        }

        const toggle = form.querySelector('[data-auth-toggle]');
        if (toggle) {
            toggle.addEventListener('click', () => togglePasswordVisibility(form));
        }

        const resetToggle = form.querySelector('[data-auth-reset-toggle]');
        if (resetToggle) {
            resetToggle.addEventListener('click', () => togglePasswordResetVisibility(form));
        }

        form.querySelectorAll('[data-auth-switch]').forEach((button) => {
            button.addEventListener('click', () => {
                const targetMode = button.dataset.authSwitch === 'register' ? 'register' : 'login';
                setAuthMode(form, targetMode);
                if (targetMode === 'register') {
                    const targetPassword = getPasswordInput(form);
                    if (targetPassword) {
                        targetPassword.focus();
                    }
                } else {
                    focusPasswordField(form);
                }
            });
        });

        const guestButton = form.querySelector('[data-auth-guest]');
        if (guestButton) {
            guestButton.addEventListener('click', () => guestLogin());
        }

        const resendButton = form.querySelector('[data-auth-resend]');
        if (resendButton) {
            resendButton.addEventListener('click', () => resendVerification(form));
        }

        const codeInput = form.querySelector('[data-auth-code-input]');
        if (codeInput) {
            codeInput.addEventListener('input', () => {
                codeInput.value = codeInput.value.replace(/[^0-9]/g, '').slice(0, 8);
                setLoginFeedback('', 'neutral', form);
            });
            codeInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    verifyCode(form);
                }
            });
        }

        const codeButton = form.querySelector('[data-auth-code-submit]');
        if (codeButton) {
            codeButton.addEventListener('click', () => verifyCode(form));
        }

        const forgotButton = form.querySelector('[data-auth-forgot]');
        if (forgotButton) {
            forgotButton.addEventListener('click', () => handlePasswordReset(form));
        }

        const resetSubmit = form.querySelector('[data-auth-reset-submit]');
        if (resetSubmit) {
            resetSubmit.addEventListener('click', () => submitPasswordResetConfirmation(form));
        }

        const resetRequest = form.querySelector('[data-auth-reset-request]');
        if (resetRequest) {
            resetRequest.addEventListener('click', () => handlePasswordReset(form, { trigger: resetRequest }));
        }

        const resetCancel = form.querySelector('[data-auth-reset-cancel]');
        if (resetCancel) {
            resetCancel.addEventListener('click', () => {
                setAuthMode(form, 'login');
                setLoginFeedback('', 'neutral', form);
            });
        }

        const resetCodeInput = getPasswordResetCodeInput(form);
        if (resetCodeInput) {
            resetCodeInput.addEventListener('input', () => {
                resetCodeInput.value = resetCodeInput.value.replace(/[^0-9]/g, '').slice(0, 8);
                setLoginFeedback('', 'neutral', form);
            });
            resetCodeInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submitPasswordResetConfirmation(form);
                }
            });
        }

        const resetPasswordInput = getPasswordResetInput(form);
        if (resetPasswordInput) {
            resetPasswordInput.addEventListener('input', () => setLoginFeedback('', 'neutral', form));
            resetPasswordInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submitPasswordResetConfirmation(form);
                }
            });
        }

        const resetConfirmInput = getPasswordResetConfirmInput(form);
        if (resetConfirmInput) {
            resetConfirmInput.addEventListener('input', () => setLoginFeedback('', 'neutral', form));
            resetConfirmInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submitPasswordResetConfirmation(form);
                }
            });
        }

        form.dataset.authBound = 'true';
        applyEmailPrefill(form);
    });
}

function getActiveAuthForm() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay && overlay.classList.contains('is-visible')) {
        const overlayForm = overlay.querySelector('[data-auth-form]');
        if (overlayForm) {
            return overlayForm;
        }
    }
    const standalone = document.querySelector('.login-container [data-auth-form]');
    if (standalone) {
        return standalone;
    }
    return queryAuthForms()[0] || null;
}

function handleAuthOverlayEscape(event) {
    if (event.key === 'Escape') {
        closeAuthOverlay();
    }
}

function createAuthOverlay() {
    let overlay = document.getElementById('auth-overlay');
    if (overlay) {
        bindAuthForms();
        return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.className = 'auth-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div class="auth-overlay__backdrop" data-auth-close></div>
        <div class="login-container" role="dialog" aria-modal="true" aria-labelledby="auth-overlay-title">
            <button type="button" class="auth-overlay__close" data-auth-close aria-label="${LOGIN_TEXT.close}">×</button>
            <header class="login-header">
                <img src="../media/logo.png" alt="Logo" class="login-logo">
                <div class="login-heading">
                    <h2 class="login-title" id="auth-overlay-title" data-auth-title>${LOGIN_TEXT.title}</h2>
                    <span class="login-badge" data-auth-register-only data-auth-display="inline-flex" aria-hidden="true" hidden>${LOGIN_TEXT.newBadge || 'NEW'}</span>
                </div>
                <p class="login-description" data-auth-description hidden>${LOGIN_TEXT.registerSubtitle}</p>
                <p class="login-status" data-auth-status>${getAuthStatusText()}</p>
            </header>
            <form class="login-form" data-auth-form novalidate>
                <div class="login-feedback" data-auth-feedback role="alert" aria-live="polite" hidden></div>
                <div data-auth-credentials>
                    <div class="form-group">
                        <label for="overlay-email">${LOGIN_TEXT.emailLabel}</label>
                        <input type="email" id="overlay-email" class="form-control" placeholder="${LOGIN_TEXT.emailPlaceholder}" autocomplete="email" data-auth-email>
                    </div>
                    <div class="form-group">
                        <label for="overlay-password">${LOGIN_TEXT.passwordLabel}</label>
                        <div class="password-field">
                            <input type="password" id="overlay-password" class="form-control" placeholder="${LOGIN_TEXT.passwordPlaceholder}" autocomplete="current-password" data-auth-password>
                            <button type="button" class="toggle-password" data-auth-toggle aria-label="${LOGIN_TEXT.show}">
                                <span class="eye-icon" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>
                    <div class="form-group" data-auth-register-only data-auth-display="flex">
                        <label for="overlay-password-confirm">${LOGIN_TEXT.registerPasswordConfirmLabel}</label>
                        <input type="password" id="overlay-password-confirm" class="form-control" placeholder="${LOGIN_TEXT.passwordPlaceholder}" autocomplete="new-password" data-auth-password-confirm>
                    </div>
                    <div class="form-group form-group--optional" data-auth-register-only data-auth-display="flex">
                        <label for="overlay-class">${LOGIN_TEXT.registerClassLabel}</label>
                        <input type="text" id="overlay-class" class="form-control" placeholder="${LOGIN_TEXT.registerClassPlaceholder}" autocomplete="organization" data-auth-class>
                    </div>
                    <div class="login-links">
                        <button type="button" class="login-link" data-auth-forgot data-auth-login-only>${LOGIN_TEXT.forgotPassword}</button>
                        <button type="button" class="login-link" data-auth-switch="register">${LOGIN_TEXT.switchToRegister}</button>
                        <button type="button" class="login-link" data-auth-switch="login" hidden>${LOGIN_TEXT.switchToLogin}</button>
                    </div>
                    <div class="login-actions">
                        <button type="submit" class="login-button" data-auth-submit>${LOGIN_TEXT.submit}</button>
                        <button type="button" class="guest-button" data-auth-guest>${LOGIN_TEXT.guestButton}</button>
                        <p class="guest-info">${LOGIN_TEXT.guestInfo}</p>
                    </div>
                </div>
                <div class="verification-step" data-auth-code-step hidden>
                    <div class="form-group">
                        <label for="overlay-code">${LOGIN_TEXT.verificationCodeLabel}</label>
                        <input type="text" id="overlay-code" class="form-control" placeholder="${LOGIN_TEXT.verificationCodePlaceholder}" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" maxlength="8" data-auth-code-input>
                        <p class="login-hint" data-auth-code-hint>${LOGIN_TEXT.verificationCodeHint}</p>
                    </div>
                    <div class="login-actions">
                        <button type="button" class="login-button" data-auth-code-submit>${LOGIN_TEXT.verificationCodeSubmit}</button>
                        <button type="button" class="login-link" data-auth-resend>${LOGIN_TEXT.verificationCodeResend}</button>
                    </div>
                </div>
                <div class="password-reset-step" data-auth-reset-step hidden>
                    <p class="login-hint" data-auth-reset-hint>${LOGIN_TEXT.passwordResetCodeHint}</p>
                    <div class="form-group">
                        <label for="overlay-reset-code">${LOGIN_TEXT.passwordResetCodeLabel}</label>
                        <input type="text" id="overlay-reset-code" class="form-control" placeholder="${LOGIN_TEXT.passwordResetCodePlaceholder}" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" maxlength="8" data-auth-reset-code>
                    </div>
                    <div class="form-group">
                        <label for="overlay-reset-password">${LOGIN_TEXT.passwordResetNewPasswordLabel}</label>
                        <div class="password-field">
                            <input type="password" id="overlay-reset-password" class="form-control" placeholder="${LOGIN_TEXT.passwordResetNewPasswordPlaceholder}" autocomplete="new-password" data-auth-reset-password>
                            <button type="button" class="toggle-password" data-auth-reset-toggle aria-label="${LOGIN_TEXT.show}">
                                <span class="eye-icon" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="overlay-reset-password-confirm">${LOGIN_TEXT.passwordResetConfirmLabel}</label>
                        <input type="password" id="overlay-reset-password-confirm" class="form-control" placeholder="${LOGIN_TEXT.passwordResetNewPasswordPlaceholder}" autocomplete="new-password" data-auth-reset-password-confirm>
                    </div>
                    <div class="login-actions password-reset-actions">
                        <button type="button" class="login-button" data-auth-reset-submit>${LOGIN_TEXT.passwordResetSubmit}</button>
                        <button type="button" class="login-link" data-auth-reset-request>${LOGIN_TEXT.passwordResetRequest}</button>
                        <button type="button" class="login-link" data-auth-reset-cancel>${LOGIN_TEXT.passwordResetCancel}</button>
                    </div>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('[data-auth-close]').forEach((element) => {
        element.addEventListener('click', closeAuthOverlay);
    });

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeAuthOverlay();
        }
    });

    bindAuthForms();

    return overlay;
}

function initAuthOverlay() {
    if (!authOverlayInitialized) {
        createAuthOverlay();
        authOverlayInitialized = true;
    } else {
        bindAuthForms();
    }
    return document.getElementById('auth-overlay');
}

function openAuthOverlay(trigger) {
    const overlay = initAuthOverlay();
    if (!overlay) {
        return;
    }

    authOverlayPreviousFocus = trigger || document.activeElement;

    const form = overlay.querySelector('[data-auth-form]');
    if (form) {
        setVerificationEmail(form, '');
        setAuthMode(form, 'login');
        setLoginFeedback('', 'neutral', form);
        applyEmailPrefill(form);
    }

    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-auth-overlay');
    bindAuthForms();
    updateAuthStatus();

    window.setTimeout(() => focusPasswordField(form), 0);
    document.addEventListener('keydown', handleAuthOverlayEscape);
}

function closeAuthOverlay() {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) {
        return;
    }

    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-auth-overlay');
    document.removeEventListener('keydown', handleAuthOverlayEscape);

    const form = overlay.querySelector('[data-auth-form]');
    if (form) {
        setAuthMode(form, 'login');
        setVerificationEmail(form, '');
        setLoginFeedback('', 'neutral', form);
    }

    if (authOverlayPreviousFocus && typeof authOverlayPreviousFocus.focus === 'function') {
        try {
            authOverlayPreviousFocus.focus();
        } catch (error) {
            /* ignore */
        }
    }

    authOverlayPreviousFocus = null;
}

function handleAuthSubmit(form) {
    const mode = getAuthMode(form);
    if (mode === 'register') {
        register(form);
    } else if (mode === 'verification') {
        verifyCode(form);
    } else if (mode === 'password-reset') {
        submitPasswordResetConfirmation(form);
    } else {
        login(form);
    }
}

async function register(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const emailInput = getEmailInput(targetForm);
    const passwordInput = getPasswordInput(targetForm);
    const confirmInput = getPasswordConfirmInput(targetForm);
    const classInput = getClassInput(targetForm);

    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmation = confirmInput ? confirmInput.value : '';
    const classIdentifier = classInput ? classInput.value.trim() : '';

    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        emailInput?.focus();
        return;
    }

    if (!password) {
        setLoginFeedback(LOGIN_TEXT.passwordRequired, 'error', targetForm);
        if (passwordInput) {
            passwordInput.focus();
        }
        return;
    }

    if (password.length < 8) {
        setLoginFeedback(LOGIN_TEXT.registerWeakPassword, 'error', targetForm);
        if (passwordInput) {
            passwordInput.focus();
        }
        return;
    }

    if (confirmInput && password !== confirmation) {
        setLoginFeedback(LOGIN_TEXT.registerPasswordMismatch, 'error', targetForm);
        confirmInput.focus();
        return;
    }

    if (isActionOnCooldown('register')) {
        setLoginFeedback(LOGIN_TEXT.cooldownWarning, 'error', targetForm);
        return;
    }

    setLoginFeedback('', 'neutral', targetForm);
    setActionCooldown('register');
    applyActionCooldown('register');
    scheduleCooldownReset('register');
    setFormLoading(targetForm, true);

    try {
        const payload = { email, password };
        if (classIdentifier) {
            payload.class = classIdentifier;
        }

        const response = await fetch(AUTH_API.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 400 && data && data.errors) {
                if (data.errors.email === 'invalid_email') {
                    setLoginFeedback(LOGIN_TEXT.registerEmailInvalid, 'error', targetForm);
                    emailInput?.focus();
                    return;
                }
                if (data.errors.password === 'weak_password') {
                    setLoginFeedback(LOGIN_TEXT.registerWeakPassword, 'error', targetForm);
                    if (passwordInput) {
                        passwordInput.focus();
                    }
                    return;
                }
            }

            if (response.status === 404 && data && data.message === 'class_not_found') {
                setLoginFeedback(LOGIN_TEXT.registerClassNotFound, 'error', targetForm);
                classInput?.focus();
                return;
            }

            if (response.status === 409 && data && data.message === 'email_exists') {
                setLoginFeedback(LOGIN_TEXT.registerEmailExists, 'error', targetForm);
                emailInput?.focus();
                return;
            }

            setLoginFeedback(LOGIN_TEXT.registerGenericError, 'error', targetForm);
            return;
        }

        setLoginFeedback(LOGIN_TEXT.registerSuccess, 'success', targetForm);
        rememberEmail(email);
        setVerificationEmail(targetForm, email);

        if (passwordInput) {
            passwordInput.value = '';
        }
        if (confirmInput) {
            confirmInput.value = '';
        }
        if (classInput) {
            classInput.value = '';
        }
        setAuthMode(targetForm, 'verification', { preserveFeedback: true });
        const codeInput = targetForm.querySelector('[data-auth-code-input]');
        if (codeInput) {
            codeInput.value = '';
            codeInput.focus();
        }
        const resendButton = targetForm.querySelector('[data-auth-resend]');
        if (resendButton) {
            resendButton.textContent = LOGIN_TEXT.verificationCodeResend;
            resendButton.disabled = false;
            delete resendButton.dataset.locked;
            applyResendCooldown(targetForm);
        }
    } catch (error) {
        console.error('Registration failed', error);
        setLoginFeedback(LOGIN_TEXT.registerGenericError, 'error', targetForm);
    } finally {
        setFormLoading(targetForm, false);
        applyActionCooldown('register');
    }
}

async function login(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const emailInput = getEmailInput(targetForm);
    const passwordInput = getPasswordInput(targetForm);
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        emailInput?.focus();
        return;
    }

    if (!password) {
        setLoginFeedback(LOGIN_TEXT.passwordRequired, 'error', targetForm);
        focusPasswordField(targetForm);
        return;
    }

    setLoginFeedback('', 'neutral', targetForm);
    setFormLoading(targetForm, true);

    try {
        const response = await fetch(AUTH_API.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (data && data.message === 'email_not_verified') {
                setVerificationEmail(targetForm, email);
                rememberEmail(email);
                setAuthMode(targetForm, 'verification', { preserveFeedback: true });
                setLoginFeedback(LOGIN_TEXT.emailNotVerified, 'error', targetForm);
                const codeInput = targetForm.querySelector('[data-auth-code-input]');
                if (codeInput) {
                    codeInput.value = '';
                    codeInput.focus();
                }
                const resendButton = targetForm.querySelector('[data-auth-resend]');
                if (resendButton) {
                    resendButton.textContent = LOGIN_TEXT.verificationCodeResend;
                    resendButton.disabled = false;
                    delete resendButton.dataset.locked;
                    applyResendCooldown(targetForm);
                }
            } else if (data && data.message === 'invalid_credentials') {
                setLoginFeedback(LOGIN_TEXT.invalidCredentials, 'error', targetForm);
                focusPasswordField(targetForm);
            } else if (data && data.message === 'inactive') {
                setLoginFeedback(LOGIN_TEXT.inactive, 'error', targetForm);
            } else {
                setLoginFeedback(LOGIN_TEXT.genericError, 'error', targetForm);
            }
            return;
        }

        const role = data && data.role ? data.role : 'student';
        setAuthenticatedSession(role, email);
        closeAuthOverlay();

        if (window.location.pathname.toLowerCase().endsWith('login.html')) {
            window.location.href = AUTH_PATHS.home;
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error('Login failed', error);
        setLoginFeedback(LOGIN_TEXT.genericError, 'error', targetForm);
    } finally {
        setFormLoading(targetForm, false);
    }
}

async function verifyCode(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const codeInput = targetForm.querySelector('[data-auth-code-input]');
    const rawCode = codeInput ? codeInput.value.trim() : '';
    const normalizedCode = rawCode.replace(/[^0-9]/g, '').slice(0, 8);
    if (codeInput && rawCode !== normalizedCode) {
        codeInput.value = normalizedCode;
    }

    if (!normalizedCode || normalizedCode.length !== 8) {
        setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
        codeInput?.focus();
        return;
    }

    const storedEmail = getVerificationEmail(targetForm);
    let email = storedEmail;
    if (!email) {
        const emailInput = getEmailInput(targetForm);
        if (emailInput && emailInput.value) {
            email = emailInput.value.trim().toLowerCase();
        }
    }

    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        const emailInput = getEmailInput(targetForm);
        emailInput?.focus();
        setAuthMode(targetForm, 'login', { preserveFeedback: true });
        return;
    }

    setVerificationEmail(targetForm, email);
    setFormLoading(targetForm, true);

    try {
        const response = await fetch(AUTH_API.verify, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: normalizedCode })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (data && (data.message === 'invalid_code' || data.message === 'verification_not_found')) {
                setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
                codeInput?.focus();
                return;
            }
            if (data && data.message === 'code_expired') {
                setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
                codeInput?.focus();
                return;
            }
            if (data && data.message === 'rate_limited') {
                setLoginFeedback(LOGIN_TEXT.cooldownWarning, 'error', targetForm);
                return;
            }
            if (data && data.message === 'already_verified') {
                setLoginFeedback(LOGIN_TEXT.verificationCodeSuccess, 'success', targetForm);
                setAuthMode(targetForm, 'login', { preserveFeedback: true });
                focusPasswordField(targetForm);
                return;
            }
            setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
            codeInput?.focus();
            return;
        }

        setLoginFeedback(LOGIN_TEXT.verificationCodeSuccess, 'success', targetForm);
        setAuthMode(targetForm, 'login', { preserveFeedback: true });
        if (codeInput) {
            codeInput.value = '';
        }
        focusPasswordField(targetForm);
    } catch (error) {
        console.error('Verification failed', error);
        setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
    } finally {
        setFormLoading(targetForm, false);
    }
}

async function resendVerification(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }
    const emailInput = getEmailInput(targetForm);
    const storedEmail = getVerificationEmail(targetForm);
    const email = storedEmail || (emailInput && emailInput.value ? emailInput.value.trim().toLowerCase() : lastAuthEmail);
    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        emailInput?.focus();
        return;
    }
    if (isActionOnCooldown('resend')) {
        setLoginFeedback(LOGIN_TEXT.cooldownWarning, 'error', targetForm);
        applyResendCooldown(targetForm);
        return;
    }
    setActionCooldown('resend');
    applyActionCooldown('resend');
    scheduleCooldownReset('resend');
    const button = targetForm.querySelector('[data-auth-resend]');
    if (button) {
        button.disabled = true;
        button.dataset.locked = 'true';
        button.textContent = LOGIN_TEXT.verificationCodeResendLoading;
    }
    try {
        const response = await fetch(AUTH_API.resend, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (response.ok) {
            setLoginFeedback(LOGIN_TEXT.resendSuccess, 'success', targetForm);
            rememberEmail(email);
            setVerificationEmail(targetForm, email);
        } else {
            setLoginFeedback(LOGIN_TEXT.resendError, 'error', targetForm);
        }
    } catch (error) {
        console.error('Resend failed', error);
        setLoginFeedback(LOGIN_TEXT.resendError, 'error', targetForm);
    } finally {
        if (button) {
            button.dataset.locked = 'false';
            button.textContent = LOGIN_TEXT.verificationCodeResend;
            applyResendCooldown(targetForm);
        }
    }
}

async function submitPasswordResetConfirmation(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const codeInput = getPasswordResetCodeInput(targetForm);
    const passwordInput = getPasswordResetInput(targetForm);
    const confirmInput = getPasswordResetConfirmInput(targetForm);

    const code = codeInput ? codeInput.value.trim() : '';
    if (!code) {
        setLoginFeedback(LOGIN_TEXT.passwordResetCodeRequired, 'error', targetForm);
        codeInput?.focus();
        return;
    }

    const newPassword = passwordInput ? passwordInput.value : '';
    if (!newPassword) {
        setLoginFeedback(LOGIN_TEXT.passwordResetPasswordRequired, 'error', targetForm);
        passwordInput?.focus();
        return;
    }

    if (newPassword.length < 8) {
        setLoginFeedback(LOGIN_TEXT.passwordResetPasswordWeak, 'error', targetForm);
        passwordInput?.focus();
        return;
    }

    const confirmation = confirmInput ? confirmInput.value : '';
    if (newPassword !== confirmation) {
        setLoginFeedback(LOGIN_TEXT.passwordResetPasswordMismatch, 'error', targetForm);
        confirmInput?.focus();
        return;
    }

    const email = getPasswordResetEmail(targetForm);
    if (!email) {
        setLoginFeedback(LOGIN_TEXT.forgotPasswordMissingEmail, 'error', targetForm);
        setAuthMode(targetForm, 'login', { preserveFeedback: true });
        const emailInput = getEmailInput(targetForm);
        emailInput?.focus();
        return;
    }

    const submitButton = targetForm.querySelector('[data-auth-reset-submit]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.loading = 'true';
        submitButton.textContent = LOGIN_TEXT.passwordResetSubmitLoading;
    }

    setLoginFeedback('', 'neutral', targetForm);

    try {
        const response = await fetch(AUTH_API.passwordReset, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'confirm', email, code, password: newPassword })
        });

        if (response.ok) {
            rememberEmail(email);
            setLoginFeedback(LOGIN_TEXT.passwordResetSuccess, 'success', targetForm);
            setAuthMode(targetForm, 'login', { preserveFeedback: true });
            const emailInput = getEmailInput(targetForm);
            if (emailInput && !emailInput.value) {
                emailInput.value = email;
            }
            focusPasswordField(targetForm);
            return;
        }

        if (response.status === 400 || response.status === 404) {
            setLoginFeedback(LOGIN_TEXT.passwordResetInvalidCode, 'error', targetForm);
        } else {
            setLoginFeedback(LOGIN_TEXT.passwordResetError, 'error', targetForm);
        }
    } catch (error) {
        console.error('Password reset confirmation failed', error);
        setLoginFeedback(LOGIN_TEXT.passwordResetError, 'error', targetForm);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            delete submitButton.dataset.loading;
            submitButton.textContent = LOGIN_TEXT.passwordResetSubmit;
        }
    }
}

async function handlePasswordReset(form, options = {}) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const email = getPasswordResetEmail(targetForm);
    const emailInput = getEmailInput(targetForm);
    if (!email) {
        setLoginFeedback(LOGIN_TEXT.forgotPasswordMissingEmail, 'error', targetForm);
        if (emailInput) {
            emailInput.focus();
        }
        setAuthMode(targetForm, 'login', { preserveFeedback: true });
        return;
    }

    const triggerButton = options && options.trigger ? options.trigger : targetForm.querySelector('[data-auth-forgot]');
    if (triggerButton) {
        triggerButton.disabled = true;
        triggerButton.dataset.loading = 'true';
        triggerButton.textContent = LOGIN_TEXT.passwordResetRequestLoading;
    }

    setLoginFeedback('', 'neutral', targetForm);

    try {
        const response = await fetch(AUTH_API.passwordReset, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            rememberEmail(email);
            setPasswordResetEmail(targetForm, email);
            clearPasswordResetInputs(targetForm);
            setLoginFeedback(LOGIN_TEXT.passwordResetRequestSuccess, 'success', targetForm);
            setAuthMode(targetForm, 'password-reset', { preserveFeedback: true });
            focusPasswordResetCode(targetForm);
        } else {
            setLoginFeedback(LOGIN_TEXT.passwordResetRequestError, 'error', targetForm);
        }
    } catch (error) {
        console.error('Password reset request failed', error);
        setLoginFeedback(LOGIN_TEXT.passwordResetRequestError, 'error', targetForm);
    } finally {
        if (triggerButton) {
            triggerButton.disabled = false;
            delete triggerButton.dataset.loading;
            if (triggerButton.hasAttribute('data-auth-reset-request')) {
                triggerButton.textContent = LOGIN_TEXT.passwordResetRequest;
            } else {
                triggerButton.textContent = LOGIN_TEXT.forgotPassword;
            }
        }
    }
}

function guestLogin() {
    clearSessionState();
    closeAuthOverlay();
}

async function logout() {
    try {
        await fetch(AUTH_API.logout, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout failed', error);
    } finally {
        clearSessionState();
        window.location.reload();
    }
}

const CREATE_DISABLED_MESSAGE = (window.hmI18n && window.hmI18n.get('calendar.actions.create.disabled'))
    || 'Please sign in to create personal todos.';

const CALENDAR_MODAL_SCOPE = window.hmI18n ? window.hmI18n.scope('calendar.modal') : (key, fallback) => fallback;

const CALENDAR_MODAL_BUTTONS = {
    add: CALENDAR_MODAL_SCOPE('buttons.add', 'Add entry'),
    addLoading: CALENDAR_MODAL_SCOPE('buttons.addLoading', 'Adding…'),
    save: CALENDAR_MODAL_SCOPE('buttons.save', 'Save'),
    saveLoading: CALENDAR_MODAL_SCOPE('buttons.saveLoading', 'Saving…')
};

const CALENDAR_MODAL_MESSAGES = {
    saveSuccess: CALENDAR_MODAL_SCOPE('messages.saveSuccess', 'Entry saved successfully!'),
    saveRetry: CALENDAR_MODAL_SCOPE(
        'messages.saveRetry',
        'We could not save the entry after several attempts. Please try again later.'
    )
};

function menuButton() {
    const links = document.getElementById('navbarlinks');
    if (links.style.display === 'block') {
        links.style.display = 'none';
    } else {
        links.style.display = 'block';
    }
}

function initLanguageSelector() {
    const languages = [
        { code: 'de', short: 'DE', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'en', short: 'EN', name: 'English', flag: '🇬🇧' },
        { code: 'it', short: 'IT', name: 'Italiano', flag: '🇮🇹' },
        { code: 'fr', short: 'FR', name: 'Français', flag: '🇫🇷' }
    ];

    const langMap = languages.reduce((map, entry) => {
        map[entry.code] = entry;
        return map;
    }, {});
    const LOCALE_STORAGE_KEY = 'hm.locale';

    const dropdowns = Array.from(document.querySelectorAll('[data-language]'));
    if (!dropdowns.length) {
        return;
    }

    const normalizeLanguage = (value) => {
        if (!value) return '';
        const lower = value.toLowerCase();
        if (langMap[lower]) return lower;
        const base = lower.split('-')[0];
        return langMap[base] ? base : '';
    };

    const getStoredLocale = () => {
        try {
            if (!window.localStorage) return '';
            return window.localStorage.getItem(LOCALE_STORAGE_KEY) || '';
        } catch (error) {
            return '';
        }
    };

    const setStoredLocale = (value) => {
        try {
            if (!window.localStorage) return;
            if (!value) {
                window.localStorage.removeItem(LOCALE_STORAGE_KEY);
            } else {
                window.localStorage.setItem(LOCALE_STORAGE_KEY, value);
            }
        } catch (error) {
            /* ignore storage errors */
        }
    };

    const getCurrentLanguage = () => {
        const fromI18n = window.hmI18n?.getLocale?.();
        const candidate = normalizeLanguage(fromI18n || getStoredLocale() || document.documentElement.getAttribute('lang'));
        return candidate || 'de';
    };

    const updateButtonLabel = (button, langCode) => {
        const data = langMap[langCode] || langMap.en;
        const code = button.querySelector('.lang-switch__code');
        if (code) {
            code.textContent = data.short;
        }
    };

    const closeDropdown = (dropdown) => {
        dropdown.classList.remove('is-open');
        const button = dropdown.querySelector('[data-language-toggle]');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
        dropdown.querySelectorAll('[data-lang]').forEach((item) => {
            item.setAttribute('tabindex', '-1');
        });
    };

    const openDropdown = (dropdown) => {
        dropdown.classList.add('is-open');
        const button = dropdown.querySelector('[data-language-toggle]');
        if (button) {
            button.setAttribute('aria-expanded', 'true');
        }
    };

    const closeAll = (except) => {
        dropdowns.forEach((dropdown) => {
            if (dropdown !== except) {
                closeDropdown(dropdown);
            }
        });
    };

    const syncDropdownState = (dropdown, currentLang) => {
        dropdown.querySelectorAll('[data-lang]').forEach((item) => {
            const lang = item.dataset.lang;
            const data = langMap[lang] || langMap.en;
            const code = item.querySelector('.language-option__code');
            if (code) code.textContent = data.short;
            const name = item.querySelector('.language-option__name');
            if (name) name.textContent = data.name;
            const flag = item.querySelector('.language-option__flag');
            if (flag) flag.textContent = data.flag;
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '-1');
            if (lang === currentLang) {
                item.setAttribute('aria-current', 'true');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    };

    dropdowns.forEach((dropdown, index) => {
        const button = dropdown.querySelector('[data-language-toggle]');
        const menu = dropdown.querySelector('[data-language-menu]');
        if (!button || !menu) {
            return;
        }

        const menuId = menu.id || `language-menu-${index + 1}`;
        menu.id = menuId;
        menu.setAttribute('role', 'menu');
        button.setAttribute('aria-controls', menuId);
        button.setAttribute('aria-expanded', 'false');

        const items = Array.from(menu.querySelectorAll('[data-lang]'));

        const syncOptionState = (currentLang) => {
            syncDropdownState(dropdown, currentLang);
        };

        const focusItem = (indexToFocus) => {
            if (!items.length) {
                return;
            }
            const targetIndex = Math.max(0, Math.min(indexToFocus, items.length - 1));
            items.forEach((item, position) => {
                item.setAttribute('tabindex', position === targetIndex ? '0' : '-1');
            });
            const target = items[targetIndex];
            if (target) {
                target.focus();
            }
        };

        const getCurrentIndex = (langCode) => {
            const idx = items.findIndex((item) => item.dataset.lang === langCode);
            return idx === -1 ? 0 : idx;
        };

        const selectLanguage = (lang) => {
            if (!langMap[lang]) {
                return;
            }
            setStoredLocale(lang);
            const applyLocale = () => {
                if (window.hmI18n && typeof window.hmI18n.setLocale === 'function') {
                    window.hmI18n.setLocale(lang);
                }
            };
            const animateSwap =
                window.hmI18nAnimate?.animateLanguageSwap || window.hmI18n?.animateLanguageSwap;
            if (typeof animateSwap === 'function') {
                animateSwap(document, applyLocale);
            } else {
                applyLocale();
            }
            dropdowns.forEach((dropdownEl) => {
                const toggle = dropdownEl.querySelector('[data-language-toggle]');
                if (toggle) {
                    updateButtonLabel(toggle, lang);
                }
                syncDropdownState(dropdownEl, lang);
            });
            closeDropdown(dropdown);
        };

        button.addEventListener('click', (event) => {
            event.preventDefault();
            const isOpen = dropdown.classList.contains('is-open');
            closeAll(dropdown);
            if (!isOpen) {
                openDropdown(dropdown);
                const current = getCurrentLanguage();
                syncOptionState(current);
                focusItem(getCurrentIndex(current));
            } else {
                closeDropdown(dropdown);
            }
        });

        button.addEventListener('keydown', (event) => {
            const current = getCurrentLanguage();
            switch (event.key) {
                case 'ArrowDown':
                case 'Enter':
                case ' ': {
                    event.preventDefault();
                    if (!dropdown.classList.contains('is-open')) {
                        closeAll(dropdown);
                        openDropdown(dropdown);
                        syncOptionState(current);
                    }
                    focusItem(getCurrentIndex(current));
                    break;
                }
                case 'ArrowUp': {
                    event.preventDefault();
                    if (!dropdown.classList.contains('is-open')) {
                        closeAll(dropdown);
                        openDropdown(dropdown);
                        syncOptionState(current);
                    }
                    focusItem(items.length - 1);
                    break;
                }
                case 'Escape': {
                    event.preventDefault();
                    closeDropdown(dropdown);
                    button.focus();
                    break;
                }
                default:
                    break;
            }
        });

        items.forEach((item, itemIndex) => {
            item.addEventListener('click', () => selectLanguage(item.dataset.lang));
            item.addEventListener('keydown', (event) => {
                switch (event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        focusItem((itemIndex + 1) % items.length);
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        focusItem((itemIndex - 1 + items.length) % items.length);
                        break;
                    case 'Home':
                        event.preventDefault();
                        focusItem(0);
                        break;
                    case 'End':
                        event.preventDefault();
                        focusItem(items.length - 1);
                        break;
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        selectLanguage(item.dataset.lang);
                        break;
                    case 'Escape':
                        event.preventDefault();
                        closeDropdown(dropdown);
                        button.focus();
                        break;
                    default:
                        break;
                }
            });
        });

        const initialLang = getCurrentLanguage();
        updateButtonLabel(button, initialLang);
        syncOptionState(initialLang);
    });

    document.addEventListener('click', (event) => {
        if (!dropdowns.some((dropdown) => dropdown.contains(event.target))) {
            dropdowns.forEach(closeDropdown);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openDropdownEl = dropdowns.find((dropdown) => dropdown.classList.contains('is-open'));
            if (openDropdownEl) {
                closeDropdown(openDropdownEl);
                const trigger = openDropdownEl.querySelector('[data-language-toggle]');
                trigger?.focus();
            }
        }
    });
}

function checkLogin() {
    const pathname = window.location.pathname.toLowerCase();
    const isLoginPage = pathname.endsWith('login.html');

    initAuthOverlay();
    bindAuthForms();
    updateAuthUI();
    setupAuthButton();

    if (isLoginPage && isAuthenticated()) {
        window.location.replace(AUTH_PATHS.home);
        return;
    }
}

  

  

function clearContent() {
    document.getElementById('content').innerHTML = "";
}

/** KALENDER-FUNKTION **/
async function openCalendar() {
    try {
        clearContent();

        const res = await fetch(`${API_BASE}/entries`);
        if (!res.ok) {
            throw new Error(`API error (${res.status})`);
        }
        const entries = await res.json();
        const colorMap = { hausaufgabe: '#007bff', pruefung: '#dc3545', event: '#28a745' };
        const sanitizeTime = (type, value) => {
            if (!value) return '';
            const trimmed = String(value).trim();
            if (!trimmed) return '';
            if (type === 'event' && (trimmed === '00:00:00' || trimmed === '00:00')) {
                return '';
            }
            return trimmed;
        };
        const events = entries.map(e => {
            const startTime = sanitizeTime(e.typ, e.startzeit);
            return {
                title: e.beschreibung,
                start: startTime ? `${e.datum}T${startTime}` : e.datum,
                color: colorMap[e.typ] || '#000'
            };
        });

        document.getElementById('content').innerHTML = '<div id="calendar"></div>';

        const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events
        });

        calendar.render();
    } catch (err) {
        console.error('Error loading or rendering the calendar:', err);
    }
}

/** AKTUELLES FACH MIT AUTOMATISCHER AKTUALISIERUNG **/
let fachInterval;

async function loadCurrentSubject() {
  clearContent();
  async function update() {
    const res = await fetch(`${API_BASE}/aktuelles_fach`);
    const data = await res.json();
    document.getElementById('content').innerHTML = `
      <h2>Current Subject: ${data.fach}</h2>
      <h3>Remaining: ${data.verbleibend}</h3>
      <p><strong>Room:</strong> ${data.raum}</p>
    `;
  }
  clearInterval(fachInterval);
  await update();
  fachInterval = setInterval(update, 1000);
}

/** EINMALIGE ABFRAGE (ohne Intervall) **/
async function aktuellesFachLaden() {
  const res = await fetch(`${API_BASE}/aktuelles_fach`);
  const data = await res.json();
  document.getElementById('fachInfo').innerHTML = `
    <p><strong>Subject:</strong> ${data.fach}</p>
    <p><strong>Ends at:</strong> ${data.endet || '-'} </p>
    <p><strong>Remaining:</strong> ${data.verbleibend}</p>
    <p><strong>Room:</strong> ${data.raum}</p>
  `;
}



/** EINTRAG ERFASSEN MIT DROPDOWN UND DB-ANBINDUNG **/
function closeEntryModal() {
    const overlay = document.getElementById('entry-modal-overlay');
    if (overlay) {
        if (window.hmModal) {
            window.hmModal.close(overlay);
        } else {
            overlay.classList.remove('is-open');
            document.body.classList.remove('hm-modal-open');
        }
    }
    const form = document.getElementById('entry-form');
    if (form) {
        form._hmEntryDefaults = null;
        form.reset();
        form.dataset.allowEmptySubject = 'true';
        const controller = setupModalFormInteractions(form);
        controller?.setType(canManageEntries() ? 'event' : 'todo');
        controller?.evaluate();
        if (window.hmEntryClassPicker && typeof window.hmEntryClassPicker.reset === 'function') {
            window.hmEntryClassPicker.reset();
        }
    }
}

const ENTRY_FORM_MESSAGES = {
    invalidDate: 'Please enter a valid date in the format DD.MM.YYYY.',
    invalidEnd: 'The end time must not be earlier than the start time.',
    invalidEndDate: 'The end date must not be earlier than the start date.',
    missingSubject: 'Please choose a subject.',
    missingEventTitle: 'Please enter an event title.',
    missingClass: 'Please select a class.',
    missingClasses: 'Please select at least one class.',
    missingEndDate: 'Please enter an end date.',
    classLoadError: 'Unable to load classes.'
};

if (window.hmI18n) {
    const formMessages = window.hmI18n.get('calendar.formMessages');
    if (formMessages && typeof formMessages === 'object') {
        Object.assign(ENTRY_FORM_MESSAGES, formMessages);
    }
}

const ENTRY_CLASS_FIELD_SELECTORS = {
    container: '[data-entry-class-field]',
    options: '[data-entry-class-options]'
};

function resolveEntryClassElements() {
    if (typeof document === 'undefined') {
        return { container: null, options: null };
    }
    const container = document.querySelector(ENTRY_CLASS_FIELD_SELECTORS.container);
    const options = container
        ? container.querySelector(ENTRY_CLASS_FIELD_SELECTORS.options)
        : document.querySelector(ENTRY_CLASS_FIELD_SELECTORS.options);
    return { container, options };
}

function getStoredEntryClassId() {
    return (typeof hmClassStorage.getId === 'function')
        ? (hmClassStorage.getId() || '')
        : '';
}

const entryClassPicker = (() => {
    let cachedClasses = [];
    let loadPromise = null;
    let baseAllowMultiple = false;
    let multipleOverride = null;
    let currentMultipleAllowed = false;

    function hideField(container, options) {
        if (container) {
            container.hidden = true;
            updateHint(container, false);
        }
        if (options) {
            options.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                checkbox.disabled = true;
                checkbox.checked = false;
            });
        }
        currentMultipleAllowed = false;
    }

    function shouldAllowSelection() {
        return Boolean(sessionState.isAdmin || sessionState.isClassAdmin);
    }

    function setFieldVisibility(container, options, visible) {
        if (!container) {
            return;
        }
        const show = Boolean(visible) && shouldAllowSelection();
        container.hidden = !show;
        if (options) {
            options.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                checkbox.disabled = !show;
            });
        }
        updateHint(container, show && currentMultipleAllowed);
    }

    function updateHint(container, shouldShow) {
        if (!container) {
            return;
        }
        const hintText = (container.dataset && container.dataset.entryClassHint) || '';
        let hintElement = container.querySelector('[data-entry-class-hint-element]');
        if (!hintElement) {
            if (!hintText) {
                return;
            }
            hintElement = document.createElement('p');
            hintElement.className = 'field-hint';
            hintElement.dataset.entryClassHintElement = 'true';
            hintElement.hidden = true;
            container.appendChild(hintElement);
        }
        if (!hintText || !shouldShow) {
            hintElement.textContent = '';
            hintElement.hidden = true;
            return;
        }
        hintElement.textContent = hintText;
        hintElement.hidden = false;
    }

    function getCheckboxes(options) {
        if (!options) {
            return [];
        }
        return Array.from(options.querySelectorAll('input[type="checkbox"][data-entry-class-checkbox]'));
    }

    function setMultiple(options, allowMultiple) {
        if (!options) {
            return;
        }
        const boxes = getCheckboxes(options);
        if (!allowMultiple) {
            let keptOne = false;
            boxes.forEach((box) => {
                if (!keptOne && box.checked) {
                    keptOne = true;
                    return;
                }
                box.checked = false;
            });
        }
    }

    function ensureSingleSelection(options) {
        if (!options) {
            return;
        }
        const boxes = getCheckboxes(options);
        const checked = boxes.filter((box) => box.checked);
        if (checked.length > 1) {
            checked.slice(1).forEach((box) => {
                box.checked = false;
            });
        } else if (checked.length === 0 && boxes.length > 0) {
            boxes[0].checked = true;
        }
    }

    function getSelectedValues(options) {
        if (!options) {
            return [];
        }
        const seen = new Set();
        const values = [];
        getCheckboxes(options).forEach((box) => {
            if (!box.checked) {
                return;
            }
            const value = box.value;
            if (value && !seen.has(value)) {
                seen.add(value);
                values.push(value);
            }
        });
        return values;
    }

    function populateOptions(options, classes, selectedValues) {
        if (!options) {
            return;
        }
        const selectedSet = new Set(selectedValues || []);
        options.innerHTML = '';
        const fragment = document.createDocumentFragment();
        classes.forEach((cls) => {
            if (!cls || !cls.slug) {
                return;
            }
            const label = document.createElement('label');
            label.className = 'entry-class-checkbox';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = cls.slug;
            checkbox.dataset.entryClassCheckbox = 'true';
            checkbox.checked = selectedSet.has(cls.slug);
            checkbox.disabled = false;
            checkbox.addEventListener('change', () => {
                if (!currentMultipleAllowed && checkbox.checked) {
                    getCheckboxes(options).forEach((box) => {
                        if (box !== checkbox) {
                            box.checked = false;
                        }
                    });
                }
            });
            const text = document.createElement('span');
            text.textContent = cls.title ? `${cls.title} (${cls.slug})` : cls.slug;
            label.append(checkbox, text);
            fragment.appendChild(label);
        });
        options.appendChild(fragment);
        if (!classes.length) {
            const empty = document.createElement('p');
            empty.className = 'field-hint';
            empty.textContent = ENTRY_FORM_MESSAGES.classLoadError || 'No classes available.';
            options.appendChild(empty);
        }
    }

    async function ensureClasses() {
        if (cachedClasses.length) {
            return cachedClasses;
        }
        if (!loadPromise) {
            loadPromise = (async () => {
                const res = await fetch(`${API_BASE}/api/classes`, {
                    credentials: 'include'
                });
                if (!res.ok) {
                    const message = await res.text().catch(() => '');
                    throw new Error(message || `Status ${res.status}`);
                }
                const rows = await res.json();
                cachedClasses = (rows || []).filter((row) => row && row.slug);
                return cachedClasses;
            })();
        }
        try {
            return await loadPromise;
        } finally {
            loadPromise = null;
        }
    }

    function resolveBaseAllowMultiple() {
        baseAllowMultiple = Boolean(sessionState.isAdmin);
        return baseAllowMultiple;
    }

    function resolveEffectiveMultiple() {
        if (!resolveBaseAllowMultiple()) {
            return false;
        }
        if (multipleOverride === null) {
            return true;
        }
        return Boolean(multipleOverride);
    }

    function applyMultipleState(options, container, allowMultiple) {
        const final = Boolean(allowMultiple);
        if (options) {
            setMultiple(options, final);
            if (!final) {
                ensureSingleSelection(options);
            }
        }
        updateHint(container, final);
        currentMultipleAllowed = final;
    }

    function syncSelection(options, classId) {
        if (!options || !classId) {
            return;
        }
        const target = getCheckboxes(options).find((box) => box.value === classId);
        if (!target) {
            return;
        }
        if (currentMultipleAllowed) {
            target.checked = true;
        } else {
            getCheckboxes(options).forEach((box) => {
                box.checked = box === target;
            });
        }
    }

    return {
        async prepare() {
            const { container, options } = resolveEntryClassElements();
            if (!container || !options) {
                return [];
            }
            if (!shouldAllowSelection()) {
                hideField(container, options);
                return [];
            }
            const allowMultiple = resolveEffectiveMultiple();
            currentMultipleAllowed = allowMultiple;
            container.hidden = false;
            options.innerHTML = '<p class="field-hint">Loading classes…</p>';
            updateHint(container, allowMultiple);
            try {
                const classes = await ensureClasses();
                const previousSelection = getSelectedValues(options);
                populateOptions(options, classes, previousSelection);
                applyMultipleState(options, container, allowMultiple);
                syncSelection(options, getStoredEntryClassId());
                if (!allowMultiple) {
                    ensureSingleSelection(options);
                }
                return classes;
            } catch (error) {
                console.error('Unable to load entry classes:', error);
                showOverlay(ENTRY_FORM_MESSAGES.classLoadError || ENTRY_FORM_MESSAGES.missingClass, 'error');
                hideField(container, options);
                return [];
            }
        },
        reset() {
            const { container, options } = resolveEntryClassElements();
            if (options) {
                getCheckboxes(options).forEach((box) => {
                    box.checked = false;
                });
            }
            multipleOverride = null;
            if (!shouldAllowSelection()) {
                hideField(container, options);
            } else {
                const allowMultiple = resolveEffectiveMultiple();
                applyMultipleState(options, container, allowMultiple);
            }
        },
        getSelection() {
            if (!shouldAllowSelection()) {
                return [];
            }
            const { options } = resolveEntryClassElements();
            if (!options) {
                return [];
            }
            const selected = getSelectedValues(options);
            if (!currentMultipleAllowed && selected.length > 1) {
                return selected.slice(0, 1);
            }
            return selected;
        },
        syncWithCurrentClass(classId) {
            if (!shouldAllowSelection()) {
                return;
            }
            const { options } = resolveEntryClassElements();
            if (!options || !getCheckboxes(options).length) {
                return;
            }
            syncSelection(options, classId);
            if (!currentMultipleAllowed) {
                ensureSingleSelection(options);
            }
        },
        setMultipleAllowed(allow) {
            const { container, options } = resolveEntryClassElements();
            if (!shouldAllowSelection()) {
                multipleOverride = null;
                hideField(container, options);
                return;
            }
            if (allow === null || typeof allow === 'undefined') {
                multipleOverride = null;
            } else {
                multipleOverride = Boolean(allow);
            }
            const allowMultiple = resolveEffectiveMultiple();
            applyMultipleState(options, container, allowMultiple);
        },
        setVisible(visible) {
            const { container, options } = resolveEntryClassElements();
            setFieldVisibility(container, options, visible);
        },
        isMultipleAllowed() {
            return currentMultipleAllowed;
        },
        clearCache() {
            cachedClasses = [];
        }
    };
})();

if (typeof window !== 'undefined') {
    window.hmEntryClassPicker = entryClassPicker;
}

function parseSwissDate(value) {
    if (!value) return null;
    const trimmed = value.trim();

    let day;
    let month;
    let year;

    let match = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) {
        day = Number(match[1]);
        month = Number(match[2]);
        year = Number(match[3]);
    } else {
        match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) {
            return null;
        }
        year = Number(match[1]);
        month = Number(match[2]);
        day = Number(match[3]);
    }

    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return `${year.toString().padStart(4, '0')}-${month
        .toString()
        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function setupModalFormInteractions(form, initialMessages = ENTRY_FORM_MESSAGES) {
    if (!form) {
        return null;
    }
    if (!('allowEmptySubject' in form.dataset)) {
        form.dataset.allowEmptySubject = 'true';
    }
    if (form.dataset.enhanced === 'true' && form._modalController) {
        form._modalController.evaluate();
        return form._modalController;
    }

    let messages = { ...initialMessages };
    const typeSelect = form.querySelector('[data-field="type"] select');
    const subjectGroup = form.querySelector('[data-field="subject"]');
    const subjectSelect = subjectGroup ? subjectGroup.querySelector('select') : null;
    const eventTitleGroup = form.querySelector('[data-field="event-title"]');
    const eventTitleInput = eventTitleGroup ? eventTitleGroup.querySelector('input') : null;
    const dateInput = form.querySelector('[data-field="date"] input');
    const endDateGroup = form.querySelector('[data-field="end-date"]');
    const endDateInput = endDateGroup ? endDateGroup.querySelector('input') : null;
    const startGroup = form.querySelector('[data-field="start"]');
    const startInput = startGroup ? startGroup.querySelector('input') : null;
    const endGroup = form.querySelector('[data-field="end"]');
    const endInput = endGroup ? endGroup.querySelector('input') : null;
    const saveButton = form.querySelector('[data-role="submit"]');
    const cancelButton = form.querySelector('[data-role="cancel"]');
    const entryClassPickerController = window.hmEntryClassPicker;
    const resolveDefaultType = () => {
        if (form && form.id === 'entry-form') {
            return canManageEntries() ? 'event' : 'todo';
        }
        return 'event';
    };

    const setInvalidState = (input) => {
        if (!input) return;
        input.classList.toggle('is-invalid', !input.checkValidity());
    };

    const evaluate = () => {
        const isEvent = typeSelect && typeSelect.value === 'event';
        const isHoliday = typeSelect && typeSelect.value === 'ferien';
        const isTodo = typeSelect && typeSelect.value === 'todo';
        const allowEmptySubject = form.dataset.allowEmptySubject === 'true';
        const requireStart = !isHoliday && !isTodo && form.id === 'entry-form';

        if (dateInput) {
            const iso = parseSwissDate(dateInput.value);
            if (!iso) {
                dateInput.setCustomValidity(messages.invalidDate || '');
            } else {
                dateInput.setCustomValidity('');
            }
        }

        if (endDateInput) {
            const startIso = dateInput ? parseSwissDate(dateInput.value) : null;
            const endIso = endDateInput.value ? parseSwissDate(endDateInput.value) : null;
            if (isHoliday) {
                if (!endIso) {
                    endDateInput.setCustomValidity(messages.missingEndDate || '');
                } else if (startIso && endIso && endIso < startIso) {
                    endDateInput.setCustomValidity(messages.invalidEndDate || messages.invalidDate || '');
                } else {
                    endDateInput.setCustomValidity('');
                }
            } else if (endIso && startIso && endIso < startIso) {
                endDateInput.setCustomValidity(messages.invalidEndDate || messages.invalidDate || '');
            } else {
                endDateInput.setCustomValidity('');
            }
        }

        if (subjectSelect) {
            subjectSelect.required = false;
            subjectSelect.setCustomValidity('');
            if (isTodo) {
                subjectSelect.value = '';
            }
        }

        if (eventTitleInput) {
            if (isEvent) {
                const trimmed = eventTitleInput.value.trim();
                if (!trimmed) {
                    eventTitleInput.setCustomValidity(messages.missingEventTitle || '');
                } else {
                    eventTitleInput.setCustomValidity('');
                }
            } else {
                eventTitleInput.setCustomValidity('');
            }
        }

        if (startInput) {
            if (isHoliday || isTodo) {
                startInput.value = '';
                startInput.disabled = true;
                startInput.required = false;
                startInput.setCustomValidity('');
            } else {
                startInput.disabled = false;
                startInput.required = requireStart;
                if (!startInput.value && requireStart) {
                    startInput.setCustomValidity('');
                } else {
                    startInput.setCustomValidity('');
                }
            }
        }

        if (endInput) {
            if (isHoliday || isTodo || !startInput || !startInput.value) {
                endInput.value = '';
                endInput.disabled = true;
                endInput.setCustomValidity('');
            } else {
                endInput.disabled = false;
                if (endInput.value && endInput.value < startInput.value) {
                    endInput.setCustomValidity(messages.invalidEnd || '');
                } else {
                    endInput.setCustomValidity('');
                }
            }
        }

        [dateInput, startInput, endInput, endDateInput, subjectSelect, eventTitleInput].forEach(setInvalidState);

        if (saveButton) {
            saveButton.disabled = !form.checkValidity();
        }
    };

    const toggleTypeFields = () => {
        const isEvent = typeSelect && typeSelect.value === 'event';
        const isHoliday = typeSelect && typeSelect.value === 'ferien';
        const isTodo = typeSelect && typeSelect.value === 'todo';
        const allowMultipleClasses = Boolean(sessionState.isAdmin && (isEvent || isHoliday));

        if (subjectGroup) {
            subjectGroup.classList.toggle('is-hidden', isEvent || isHoliday || isTodo);
        }
        if (subjectSelect && (isEvent || isHoliday || isTodo)) {
            subjectSelect.value = '';
            subjectSelect.setCustomValidity('');
        }

        if (entryClassPickerController && typeof entryClassPickerController.setMultipleAllowed === 'function') {
            entryClassPickerController.setMultipleAllowed(isTodo ? false : allowMultipleClasses);
        }
        if (entryClassPickerController && typeof entryClassPickerController.setVisible === 'function') {
            entryClassPickerController.setVisible(!isTodo);
        }

        if (eventTitleGroup) {
            eventTitleGroup.classList.toggle('is-hidden', !isEvent);
        }
        if (eventTitleInput) {
            eventTitleInput.required = isEvent;
            if (!isEvent) {
                eventTitleInput.value = '';
                eventTitleInput.setCustomValidity('');
            }
        }

        if (startGroup) {
            startGroup.classList.toggle('is-hidden', isHoliday || isTodo);
        }
        if (endGroup) {
            endGroup.classList.toggle('is-hidden', isHoliday || isTodo);
        }
        if (endDateGroup) {
            endDateGroup.classList.toggle('is-hidden', !isHoliday);
            if (!isHoliday && endDateInput) {
                endDateInput.value = '';
                endDateInput.disabled = true;
                endDateInput.required = false;
                endDateInput.setCustomValidity('');
            } else if (isHoliday && endDateInput) {
                endDateInput.disabled = false;
                endDateInput.required = true;
            }
        }

        evaluate();
    };

    if (typeSelect) {
        typeSelect.addEventListener('change', () => {
            if (endDateInput) {
                endDateInput.disabled = typeSelect.value !== 'ferien';
                if (typeSelect.value !== 'ferien') {
                    endDateInput.value = '';
                }
            }
            toggleTypeFields();
        });
    }

    [dateInput, startInput, endInput, endDateInput, subjectSelect, eventTitleInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', evaluate);
        input.addEventListener('blur', () => setInvalidState(input));
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', evaluate);
        }
    });

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            if (form.id === 'entry-form') {
                closeEntryModal();
            } else {
                closeModal();
            }
        });
    }

    form.addEventListener('reset', () => {
        const defaults = form._hmEntryDefaults || null;
        window.setTimeout(() => {
            const getDefault = (key, fallback = '') =>
                defaults && Object.prototype.hasOwnProperty.call(defaults, key) ? defaults[key] : fallback;
            const fallbackType = resolveDefaultType();

            if (typeSelect) {
                typeSelect.value = getDefault('type', fallbackType);
            }

            if (dateInput) {
                const value = getDefault('date', '');
                dateInput.value = value;
                dateInput.setCustomValidity('');
                dateInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (endDateInput) {
                endDateInput.value = getDefault('endDate', '');
                endDateInput.disabled = (typeSelect?.value || fallbackType) !== 'ferien';
                endDateInput.required = (typeSelect?.value || fallbackType) === 'ferien';
                endDateInput.setCustomValidity('');
            }
            if (startInput) {
                startInput.value = getDefault('start', '');
                startInput.disabled = false;
                startInput.setCustomValidity('');
            }
            if (endInput) {
                const endValue = getDefault('end', '');
                endInput.value = endValue;
                endInput.disabled = !endValue;
                endInput.setCustomValidity('');
            }
            if (eventTitleInput) {
                eventTitleInput.value = getDefault('eventTitle', '');
                eventTitleInput.setCustomValidity('');
            }
            if (subjectSelect) {
                subjectSelect.value = getDefault('subject', '');
                subjectSelect.setCustomValidity('');
            }

            toggleTypeFields();
            evaluate();
        }, 0);
    });

    form.dataset.enhanced = 'true';

    const controller = {
        evaluate,
        toggleTypeFields,
        setMessages(nextMessages) {
            messages = { ...messages, ...nextMessages };
            evaluate();
        },
        setType(value) {
            if (typeSelect) {
                typeSelect.value = value;
                toggleTypeFields();
            }
        }
    };

    form._modalController = controller;

    toggleTypeFields();
    evaluate();

    return controller;
}

async function showEntryForm(defaults = null) {
    if (!canManageEntries() && !canCreatePersonalTodos()) {
        showOverlay(CREATE_DISABLED_MESSAGE, 'error');
        return;
    }
    const overlay = document.getElementById('entry-modal-overlay');
    const form = document.getElementById('entry-form');
    if (!overlay || !form) {
        console.error('Entry overlay not found.');
        return;
    }

    form._hmEntryDefaults = defaults ? { ...defaults } : {};
    if (!Object.prototype.hasOwnProperty.call(form._hmEntryDefaults, 'type')) {
        form._hmEntryDefaults.type = canManageEntries() ? 'event' : 'todo';
    }
    form.dataset.allowEmptySubject = 'true';
    const controller = setupModalFormInteractions(form);
    form.reset();
    if (controller) {
        if (!form._hmEntryDefaults || !Object.prototype.hasOwnProperty.call(form._hmEntryDefaults, 'type')) {
            controller.setType(canManageEntries() ? 'event' : 'todo');
        } else {
            controller.toggleTypeFields();
            controller.evaluate();
        }
    }

    const typeField = form.querySelector('#typ');
    const typeFieldGroup = form.querySelector('[data-field="type"]');
    if (typeField) {
        if (canManageEntries()) {
            if (typeFieldGroup) {
                typeFieldGroup.classList.remove('is-hidden');
            }
            Array.from(typeField.options || []).forEach((option) => {
                option.hidden = false;
                option.disabled = false;
            });
            typeField.disabled = false;
        } else {
            if (typeFieldGroup) {
                typeFieldGroup.classList.add('is-hidden');
            }
            Array.from(typeField.options || []).forEach((option) => {
                const keep = option.value === 'todo';
                option.hidden = !keep;
                option.disabled = !keep;
            });
            typeField.value = 'todo';
            typeField.disabled = true;
            controller?.setType('todo');
        }
    }

    if (canManageEntries() && window.hmEntryClassPicker && typeof window.hmEntryClassPicker.prepare === 'function') {
        try {
            await window.hmEntryClassPicker.prepare();
        } catch (error) {
            console.error('Unable to prepare class picker:', error);
        }
    } else if (window.hmEntryClassPicker && typeof window.hmEntryClassPicker.setVisible === 'function') {
        window.hmEntryClassPicker.setVisible(false);
    }
    const saveButton = form.querySelector('#saveButton');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = CALENDAR_MODAL_BUTTONS.add;
    }

    const initialFocus = form.querySelector('[data-hm-modal-initial-focus]') || form.querySelector('select, input, textarea, button');
    if (window.hmModal) {
        window.hmModal.open(overlay, {
            initialFocus,
            onRequestClose: closeEntryModal
        });
    } else {
        overlay.classList.add('is-open');
        document.body.classList.add('hm-modal-open');
        if (initialFocus && typeof initialFocus.focus === 'function') {
            try {
                initialFocus.focus({ preventScroll: true });
            } catch (err) {
                initialFocus.focus();
            }
        }
    }
}

async function refreshCalendarEntries() {
    try {
        if (typeof window !== 'undefined' && typeof window.loadCalendar === 'function') {
            await window.loadCalendar();
            return;
        }
    } catch (error) {
        console.error('Unable to refresh the calendar after saving:', error);
    }

    if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
        window.location.reload();
    }
}

async function saveEntry(event) {
    if (event) {
        event.preventDefault();
    }

    const form = document.getElementById('entry-form');
    if (!form) {
        console.error('Entry form missing.');
        return;
    }

    const controller = setupModalFormInteractions(form);
    controller?.evaluate();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const typeField = document.getElementById('typ');
    const subjectField = document.getElementById('fach');
    const descriptionField = document.getElementById('beschreibung');
    const dateField = document.getElementById('datum');
    const startField = document.getElementById('startzeit');
    const endField = document.getElementById('endzeit');
    const endDateField = document.getElementById('enddatum');
    const eventTitleField = document.getElementById('event-titel');
    const saveButton = document.getElementById('saveButton');

    if (!typeField || !dateField || !startField || !saveButton) {
        console.error('Form fields are missing.');
        return;
    }

    const typ = typeField.value;
    const fach = subjectField ? subjectField.value.trim() : '';
    const beschreibung = descriptionField ? descriptionField.value.trim() : '';
    const datumInput = dateField.value.trim();
    const startzeitInput = startField.value;
    const endzeitInput = endField && !endField.disabled ? endField.value : '';
    const enddatumInput = endDateField ? endDateField.value.trim() : '';
    const eventTitle = eventTitleField ? eventTitleField.value.trim() : '';

    const isoDate = parseSwissDate(datumInput);
    if (!isoDate) {
        showOverlay(ENTRY_FORM_MESSAGES.invalidDate, 'error');
        dateField.focus();
        return;
    }

    const endDateIso = enddatumInput ? parseSwissDate(enddatumInput) : null;
    const isHoliday = typ === 'ferien';
    const isTodo = typ === 'todo';

    if (isHoliday && !endDateIso) {
        showOverlay(ENTRY_FORM_MESSAGES.missingEndDate || ENTRY_FORM_MESSAGES.invalidDate, 'error');
        endDateField?.focus();
        return;
    }

    if (isoDate && endDateIso && endDateIso < isoDate) {
        showOverlay(ENTRY_FORM_MESSAGES.invalidEndDate || ENTRY_FORM_MESSAGES.invalidDate, 'error');
        endDateField?.focus();
        return;
    }

    if (endzeitInput && startzeitInput && endzeitInput < startzeitInput) {
        showOverlay(ENTRY_FORM_MESSAGES.invalidEnd, 'error');
        return;
    }

    const startzeit = (!isHoliday && startzeitInput) ? `${startzeitInput}:00` : null;
    const endzeit = (!isHoliday && endzeitInput) ? `${endzeitInput}:00` : null;
    const isEvent = typ === 'event';

    const payloadBeschreibung = isEvent
        ? eventTitle + (beschreibung ? `\n\n${beschreibung}` : '')
        : beschreibung;
    const payloadSubject = (isEvent || isTodo) ? '' : fach;
    const resolvedEndDate = endDateIso || isoDate;

    const storedClassId = (typeof hmClassStorage.getId === 'function') ? hmClassStorage.getId() : '';
    const entryClassPickerController = window.hmEntryClassPicker;
    let selectedClassIds = [];

    const canChooseClasses = Boolean(sessionState.isAdmin || sessionState.isClassAdmin);
    const adminCanLinkAcrossClasses = Boolean(sessionState.isAdmin && (typ === 'event' || typ === 'ferien'));
    const multipleAllowedForSelection = adminCanLinkAcrossClasses
        && (
            !entryClassPickerController
            || typeof entryClassPickerController.isMultipleAllowed !== 'function'
            || Boolean(entryClassPickerController.isMultipleAllowed())
        );

    if (!isTodo && canChooseClasses && entryClassPickerController && typeof entryClassPickerController.getSelection === 'function') {
        selectedClassIds = entryClassPickerController.getSelection() || [];
        selectedClassIds = Array.from(new Set((selectedClassIds || []).filter(Boolean)));
        if (!multipleAllowedForSelection && selectedClassIds.length > 1) {
            selectedClassIds = selectedClassIds.slice(0, 1);
        }
        if (!selectedClassIds.length && storedClassId) {
            selectedClassIds = [storedClassId];
        }
        if (!selectedClassIds.length) {
            const message = sessionState.isAdmin
                ? (ENTRY_FORM_MESSAGES.missingClasses || ENTRY_FORM_MESSAGES.missingClass)
                : ENTRY_FORM_MESSAGES.missingClass;
            showOverlay(message, 'error');
            return;
        }
    } else if (!isTodo && storedClassId) {
        selectedClassIds = [storedClassId];
    } else if (!isTodo) {
        showOverlay(ENTRY_FORM_MESSAGES.missingClass, 'error');
        return;
    }

    if (!multipleAllowedForSelection && selectedClassIds.length > 1) {
        selectedClassIds = selectedClassIds.slice(0, 1);
    }

    saveButton.disabled = true;
    saveButton.innerText = CALENDAR_MODAL_BUTTONS.saveLoading;

    let success = false;
    let attempt = 0;
    const maxAttempts = 10;
    let aborted = false;

    while (!success && attempt < maxAttempts) {
        try {
            const payload = {
                typ,
                fach: payloadSubject,
                beschreibung: payloadBeschreibung,
                datum: isoDate,
                startzeit,
                endzeit,
                enddatum: resolvedEndDate
            };
            const allowMultipleForPayload = Boolean(adminCanLinkAcrossClasses && multipleAllowedForSelection);
            if (!isTodo) {
                if (allowMultipleForPayload && selectedClassIds.length > 0) {
                    payload.class_ids = selectedClassIds;
                } else if (selectedClassIds.length > 0) {
                    payload.class_id = selectedClassIds[0];
                } else {
                    payload.class_id = storedClassId;
                }
            }

            const response = await fetch(isTodo ? `${API_BASE}/api/todos` : `${API_BASE}/add_entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            if (response.status === 403) {
                showOverlay(isTodo ? CREATE_DISABLED_MESSAGE : ENTRY_FORM_MESSAGES.missingClass, 'error');
                aborted = true;
                break;
            }
            const result = await response.json();

            if (result.status === "ok") {
                success = true;
                showOverlay(CALENDAR_MODAL_MESSAGES.saveSuccess, 'success');
                closeEntryModal();
                await refreshCalendarEntries();
                if (form) {
                    form.reset();
                    controller?.setType(canManageEntries() ? 'event' : 'todo');
                }
            } else {
                console.error("Server error while saving:", result.message);
            }
        } catch (error) {
            console.error("Network error while saving:", error);
        }

        if (!success) {
            attempt++;
            console.warn(`Save attempt ${attempt} failed. Retrying in 2 seconds.`);
            // Warte 2000ms, bevor erneut versucht wird
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!success && !aborted) {
        showOverlay(CALENDAR_MODAL_MESSAGES.saveRetry, 'error');
    } else if (success) {
        // Reset input fields
        if (form) {
            form.reset();
            controller?.setType(canManageEntries() ? 'event' : 'todo');
        }
    }

    // Re-enable button
    saveButton.disabled = false;
    saveButton.innerText = CALENDAR_MODAL_BUTTONS.add;
}



// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
window.addEventListener('DOMContentLoaded', () => {
    setupModalFormInteractions(document.getElementById('entry-form'));
    setupModalFormInteractions(document.getElementById('fc-edit-form'));
});

window.addEventListener('hm:header-ready', () => {
    initLanguageSelector();
    setupAuthButton();
    setupAccountControls();
    updateAuthUI();
});
