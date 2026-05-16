import { usePageSetup } from '../hooks/usePageSetup';

export function LoginPage() {
  usePageSetup({ bodyClass: '', scripts: [] });

  return (
    <div className="hm-react-shell login-shell">
      <div className="hm-app-backdrop" aria-hidden="true">
        <div className="hm-app-backdrop__orb hm-app-backdrop__orb--violet"></div>
        <div className="hm-app-backdrop__orb hm-app-backdrop__orb--cyan"></div>
        <div className="hm-app-backdrop__grid"></div>
      </div>
      <div id="pageContent" className="hm-react-main">
        <div className="login-stage">
          <aside className="login-stage__intro hm-react-card">
            <div className="hm-badge">
              <span className="hm-badge__dot" aria-hidden="true"></span>
              <span>Secure access</span>
            </div>
            <h1 className="login-stage__title">Homework Manager</h1>
            <p className="login-stage__lead">
              Sign in to manage your class calendar, upcoming work, weekly summaries and personal account settings.
            </p>
            <ul className="login-stage__features">
              <li>Role-aware access with class-based views</li>
              <li>Consistent workflows across desktop and mobile</li>
              <li>Cleaner overview for homework, exams and events</li>
            </ul>
          </aside>

          <div className="login-container hm-react-card">
            <header className="login-header">
              <img src="/media/logo.png" alt="Logo" className="login-logo" data-i18n-attr="alt:auth.logoAlt" />
              <div className="login-heading">
                <h2 className="login-title" data-auth-title="" data-i18n="auth.title">
                  🔒 Login
                </h2>
                <span
                  className="login-badge"
                  data-auth-register-only=""
                  data-auth-display="inline-flex"
                  aria-hidden="true"
                  hidden
                  data-i18n="auth.newBadge"
                >
                  NEW
                </span>
              </div>
              <p className="login-description" data-auth-description="" hidden data-i18n="auth.registerSubtitle">
                Sign up with your school email address.
              </p>
              <p className="login-status" data-auth-status="" data-i18n="auth.authStatusGuest">
                Not signed in
              </p>
            </header>
            <form className="login-form" data-auth-form="" noValidate>
              <div className="login-banner" data-auth-verification="" hidden>
                <strong data-i18n="auth.verificationRequired">Email verification required</strong>
                <p data-i18n="auth.verificationRequiredBody">
                  Please confirm your email address via the link in your inbox. Delivery can take a few minutes. You can
                  request a new email here.
                </p>
                <button type="button" className="login-link" data-auth-resend="" data-i18n="auth.verificationResendLink">
                  Resend verification email
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="login-email" data-i18n="auth.emailLabel">
                  Email address
                </label>
                <input
                  type="email"
                  id="login-email"
                  className="form-control"
                  placeholder="name@example.com"
                  autoComplete="email"
                  data-auth-email=""
                  required
                  data-i18n-attr="placeholder:auth.emailPlaceholder"
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password" data-i18n="auth.passwordLabel">
                  Password
                </label>
                <div className="password-field">
                  <input
                    type="password"
                    id="login-password"
                    className="form-control"
                    placeholder="Password"
                    autoComplete="current-password"
                    data-auth-password=""
                    data-i18n-attr="placeholder:auth.passwordPlaceholder"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    data-auth-toggle=""
                    aria-label="Show password"
                    data-i18n-attr="aria-label:auth.show"
                  >
                    <span className="eye-icon" aria-hidden="true"></span>
                  </button>
                </div>
                <div className="login-feedback" data-auth-feedback="" role="alert" aria-live="polite" hidden></div>
              </div>
              <div className="form-group" data-auth-register-only="" data-auth-display="flex">
                <label htmlFor="login-password-confirm" data-i18n="auth.registerPasswordConfirmLabel">
                  Confirm password
                </label>
                <input
                  type="password"
                  id="login-password-confirm"
                  className="form-control"
                  placeholder="Password"
                  autoComplete="new-password"
                  data-auth-password-confirm=""
                  data-i18n-attr="placeholder:auth.passwordPlaceholder"
                />
              </div>
              <div className="form-group form-group--optional" data-auth-register-only="" data-auth-display="flex">
                <label htmlFor="login-class" data-i18n="auth.registerClassLabel">
                  Class (optional)
                </label>
                <input
                  type="text"
                  id="login-class"
                  className="form-control"
                  placeholder="e.g. L23a / Teachers: leave this blank"
                  autoComplete="organization"
                  data-auth-class=""
                  data-i18n-attr="placeholder:auth.registerClassPlaceholder"
                />
              </div>
              <div className="login-links">
                <button type="button" className="login-link" data-auth-forgot="" data-auth-login-only="" data-i18n="auth.forgotPassword">
                  Forgot password?
                </button>
                <button type="button" className="login-link" data-auth-switch="register" data-i18n="auth.switchToRegister">
                  New here? Create an account
                </button>
                <button type="button" className="login-link" data-auth-switch="login" hidden data-i18n="auth.switchToLogin">
                  Already registered? Log in
                </button>
              </div>
              <div className="login-actions">
                <button type="submit" className="login-button" data-auth-submit="" data-i18n="auth.submit">
                  Log in
                </button>
                <button type="button" className="guest-button" data-auth-guest="" data-i18n="auth.guestButton">
                  Continue as guest
                </button>
                <p className="guest-info" data-i18n="auth.guestInfo">
                  Continue without an account
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
