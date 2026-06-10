import { usePageSetup } from '../hooks/usePageSetup';

export function LoginPage() {
  usePageSetup({ bodyClass: '', scripts: [] });

  return (
    <div className="login-stage relative">
          <aside className="login-stage__intro hm-react-card relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:bg-white/30">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-colors duration-700 pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl group-hover:bg-indigo-400/20 transition-colors duration-700 pointer-events-none"></div>
            
            <div className="hm-badge shadow-sm backdrop-blur-md bg-white/50 border border-white/60 text-blue-800 font-medium px-3 py-1 rounded-full relative z-10">
              <span className="hm-badge__dot bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" aria-hidden="true"></span>
              <span>Secure access</span>
            </div>
            <h1 className="login-stage__title bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-600 relative z-10">Homework Manager</h1>
            <p className="login-stage__lead text-slate-600 relative z-10 leading-relaxed">
              Sign in to manage your class calendar, upcoming work, weekly summaries and personal account settings.
            </p>
            <ul className="login-stage__features">
              <li>Role-aware access with class-based views</li>
              <li>Consistent workflows across desktop and mobile</li>
              <li>Cleaner overview for homework, exams and events</li>
            </ul>
          </aside>

          <div className="login-container hm-react-card relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-900/10 transition-all duration-500 hover:shadow-blue-900/15">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 opacity-80"></div>
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <header className="login-header relative z-10">
              <img src="/media/logo.png" alt="Logo" className="login-logo drop-shadow-lg rounded-2xl ring-4 ring-white/50 transition-transform duration-500 hover:scale-105" data-i18n-attr="alt:auth.logoAlt" />
              <div className="login-heading">
                <h2 className="login-title font-bold text-slate-800 tracking-tight" data-auth-title="" data-i18n="auth.title">
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
              <div className="form-group relative z-10">
                <label htmlFor="login-email" className="font-semibold text-slate-700" data-i18n="auth.emailLabel">
                  Email address
                </label>
                <input
                  type="email"
                  id="login-email"
                  className="form-control transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/60 hover:bg-white/80 shadow-inner rounded-xl"
                  placeholder="name@example.com"
                  autoComplete="email"
                  data-auth-email=""
                  required
                  data-i18n-attr="placeholder:auth.emailPlaceholder"
                />
              </div>
              <div className="form-group relative z-10">
                <label htmlFor="login-password" className="font-semibold text-slate-700" data-i18n="auth.passwordLabel">
                  Password
                </label>
                <div className="password-field relative">
                  <input
                    type="password"
                    id="login-password"
                    className="form-control transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/60 hover:bg-white/80 shadow-inner rounded-xl pr-10"
                    placeholder="Password"
                    autoComplete="current-password"
                    data-auth-password=""
                    data-i18n-attr="placeholder:auth.passwordPlaceholder"
                  />
                  <button
                    type="button"
                    className="toggle-password absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50/50"
                    data-auth-toggle=""
                    aria-label="Show password"
                    data-i18n-attr="aria-label:auth.show"
                  >
                    <span className="eye-icon" aria-hidden="true"></span>
                  </button>
                </div>
                <div className="login-feedback" data-auth-feedback="" role="alert" aria-live="polite" hidden></div>
              </div>
              <div className="form-group relative z-10" data-auth-register-only="" data-auth-display="flex">
                <label htmlFor="login-password-confirm" className="font-semibold text-slate-700" data-i18n="auth.registerPasswordConfirmLabel">
                  Confirm password
                </label>
                <input
                  type="password"
                  id="login-password-confirm"
                  className="form-control transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/60 hover:bg-white/80 shadow-inner rounded-xl"
                  placeholder="Password"
                  autoComplete="new-password"
                  data-auth-password-confirm=""
                  data-i18n-attr="placeholder:auth.passwordPlaceholder"
                />
              </div>
              <div className="form-group form-group--optional relative z-10" data-auth-register-only="" data-auth-display="flex">
                <label htmlFor="login-class" className="font-semibold text-slate-700" data-i18n="auth.registerClassLabel">
                  Class (optional)
                </label>
                <input
                  type="text"
                  id="login-class"
                  className="form-control transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/60 hover:bg-white/80 shadow-inner rounded-xl"
                  placeholder="e.g. L23a / Teachers: leave this blank"
                  autoComplete="organization"
                  data-auth-class=""
                  data-i18n-attr="placeholder:auth.registerClassPlaceholder"
                />
              </div>
              <div className="login-links relative z-10">
                <button type="button" className="login-link transition-colors duration-200 hover:text-blue-700 underline-offset-4 hover:underline" data-auth-forgot="" data-auth-login-only="" data-i18n="auth.forgotPassword">
                  Forgot password?
                </button>
                <button type="button" className="login-link transition-colors duration-200 hover:text-blue-700 underline-offset-4 hover:underline" data-auth-switch="register" data-i18n="auth.switchToRegister">
                  New here? Create an account
                </button>
                <button type="button" className="login-link transition-colors duration-200 hover:text-blue-700 underline-offset-4 hover:underline" data-auth-switch="login" hidden data-i18n="auth.switchToLogin">
                  Already registered? Log in
                </button>
              </div>
              <div className="login-actions relative z-10 mt-6">
                <button type="submit" className="login-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-none rounded-xl" data-auth-submit="" data-i18n="auth.submit">
                  Log in
                </button>
                <button type="button" className="guest-button bg-white/50 hover:bg-white/80 border border-white/60 shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl text-slate-700 font-semibold" data-auth-guest="" data-i18n="auth.guestButton">
                  Continue as guest
                </button>
                <p className="guest-info text-slate-500 mt-2" data-i18n="auth.guestInfo">
                  Continue without an account
                </p>
              </div>
            </form>
          </div>
    </div>
  );
}
