/* Profile page logic: load /api/me, allow password updates, and account deletion */
(function () {
  'use strict'

  const API_BASE = (() => {
    if (typeof window !== 'undefined' && typeof window.hmResolveApiBase === 'function') {
      return window.hmResolveApiBase()
    }
    const fallback = 'https://hwm-api.akzuwo.ch'
    if (typeof window !== 'undefined' && typeof window.hmResolveApiBase !== 'function') {
      window.hmResolveApiBase = () => fallback
    }
    return fallback
  })()

  const i18nScope = window.hmI18n ? window.hmI18n.scope('profile') : null
  const locale = (window.hmI18n && typeof window.hmI18n.getLocale === 'function'
    ? window.hmI18n.getLocale()
    : document.documentElement.lang || 'en')

  const t = (key, fallback) => (i18nScope ? i18nScope(key, fallback) : fallback)

  function resolveApiUrl(path) {
    if (!path) return API_BASE
    if (/^https?:\/\//i.test(path)) return path
    if (path.startsWith('/')) return `${API_BASE}${path}`
    return `${API_BASE}/${path}`
  }

  async function apiFetch(path, method = 'GET', body = null) {
    const opts = { method, credentials: 'include', headers: {} }
    if (body !== null) {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
    const res = await fetch(resolveApiUrl(path), opts)
    const rawText = await res.text().catch(() => '')
    let parsed = null
    try {
      parsed = rawText ? JSON.parse(rawText) : null
    } catch (err) {
      parsed = null
    }

    if (!res.ok || !parsed) {
      const message = (parsed && parsed.message) || 'Request failed'
      const err = new Error(message)
      err.info = parsed || { raw: rawText, status: res.status }
      throw err
    }
    return parsed
  }

  const el = (id) => document.getElementById(id)

  const elements = {
    id: () => el('profile-id'),
    email: () => el('profile-email'),
    classLabel: () => el('profile-class'),
    classId: () => el('profile-class-id'),
    age: () => el('profile-age'),
    created: () => el('profile-created'),
    lastChange: () => el('profile-last-change'),
    passwordForm: () => document.getElementById('password-form'),
    deleteButton: () => el('delete-account-btn'),
    passwordButton: () => el('change-password-btn'),
    passwordEmailStatus: () => el('password-email-status'),
    currentPassword: () => el('current-password'),
    newPassword: () => el('new-password'),
    confirmPassword: () => el('confirm-password'),
  }

  function safeText(value) {
    return value === undefined || value === null || value === ''
      ? t('unknownValue', '–')
      : String(value)
  }

  function setText(node, value) {
    if (!node) return
    node.textContent = safeText(value)
  }

  function formatDate(value) {
    if (!value) return t('unknownValue', '–')
    try {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return t('unknownValue', '–')
      return new Intl.DateTimeFormat(locale || undefined, { dateStyle: 'medium' }).format(date)
    } catch (err) {
      return t('unknownValue', '–')
    }
  }

  function formatDays(count) {
    if (count === undefined || count === null || Number.isNaN(count)) {
      return t('unknownValue', '–')
    }
    const days = Math.max(0, Math.round(count))
    if (days === 1) return t('ageDay', '1 day')
    return t('ageDays', '{count} days').replace('{count}', days)
  }

  function formatClass(data) {
    if (!data) return t('unknownValue', '–')
    return data.class_slug || data.class_title || (data.class_id != null ? `#${data.class_id}` : t('unknownValue', '–'))
  }

  async function loadProfile() {
    try {
      const resp = await apiFetch('/api/me')
      if (resp.status !== 'ok') throw new Error(resp.message || 'failed')
      const data = resp.data || {}

      setText(elements.id(), data.id)
      setText(elements.email(), data.email)
      setText(elements.classLabel(), formatClass(data))
      setText(elements.classId(), data.class_id)
      setText(elements.age(), formatDays(data.account_age_days))
      setText(elements.created(), formatDate(data.created_at))
      setText(elements.lastChange(), formatDate(data.last_class_change))
    } catch (err) {
      const info = err && err.info ? err.info : {}
      const status = info.status
      const code = info.message
      if (status === 503 || code === 'database_unavailable') {
        window.showToast && window.showToast(t('loadUnavailable', 'Profile service is temporarily unavailable.'))
        return
      }
      console.error('Failed to load profile', err)
      window.showToast && window.showToast(t('loadError', 'Could not load your profile.'))
    }
  }

  function withButtonState(button, callback) {
    if (!button) return callback()
    const originalContent = button.innerHTML
    button.disabled = true
    return Promise.resolve()
      .then(callback)
      .finally(() => {
        button.disabled = false
        button.innerHTML = originalContent
      })
  }

  async function changePassword(event) {
    if (event) event.preventDefault()
    const current = elements.currentPassword() && elements.currentPassword().value.trim()
    const next = elements.newPassword() && elements.newPassword().value.trim()
    const confirm = elements.confirmPassword() && elements.confirmPassword().value.trim()
    const button = elements.passwordButton()
    const status = elements.passwordEmailStatus()
    if (status) status.textContent = ''

    if (!current || !next || !confirm) {
      window.showToast && window.showToast(t('passwordMissing', 'Please fill in all password fields.'))
      return
    }
    if (next !== confirm) {
      window.showToast && window.showToast(t('passwordMismatch', 'The new passwords do not match.'))
      return
    }
    if (next.length < 8) {
      window.showToast && window.showToast(t('passwordChangeWeak', 'The password is too weak.'))
      return
    }

    await withButtonState(button, async () => {
      try {
        const resp = await apiFetch('/api/me/password', 'POST', { current_password: current, new_password: next })
        const emailSent = resp && resp.email_sent !== false
        window.showToast && window.showToast(t('passwordChangeSuccess', 'Password updated successfully.'))
        if (status) {
          status.textContent = emailSent
            ? t('passwordEmailSuccess', 'We sent you a confirmation email.')
            : t('passwordEmailFailure', 'Password updated, but the confirmation email could not be sent.')
        }
        const form = elements.passwordForm()
        form && form.reset()
      } catch (err) {
        console.error('Failed to change password', err)
        const code = err.info && err.info.message
        let message = t('passwordChangeError', 'Could not change the password.')
        if (code === 'invalid_current_password') {
          message = t('passwordChangeInvalidCurrent', 'Current password is incorrect.')
        } else if (code === 'weak_password') {
          message = t('passwordChangeWeak', 'The password is too weak.')
        } else if (code === 'password_unchanged') {
          message = t('passwordChangeUnchanged', 'Please choose a different password.')
        } else if (code === 'password_required' || code === 'current_password_required') {
          message = t('passwordMissing', 'Please fill in all password fields.')
        }
        window.showToast && window.showToast(message)
      }
    })
  }

  async function deleteAccount() {
    const confirmation = t('deleteConfirm', 'Do you really want to permanently delete your account?')
    if (!confirm(confirmation)) return
    const button = elements.deleteButton()

    await withButtonState(button, async () => {
      try {
        await apiFetch('/api/me', 'DELETE')
        window.showToast && window.showToast(t('deleteSuccess', 'Account deleted.'))
        setTimeout(() => { window.location.href = '/' }, 800)
      } catch (err) {
        console.error('Failed to delete account', err)
        window.showToast && window.showToast(t('deleteError', 'Could not delete the account.'))
      }
    })
  }

  document.addEventListener('DOMContentLoaded', function () {
    const passwordForm = elements.passwordForm()
    const deleteBtn = elements.deleteButton()

    passwordForm && passwordForm.addEventListener('submit', changePassword)
    deleteBtn && deleteBtn.addEventListener('click', deleteAccount)

    loadProfile()
  })

})()
