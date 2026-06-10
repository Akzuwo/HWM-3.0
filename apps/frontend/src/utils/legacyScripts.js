const scriptLoaders = {
  i18n: () => import('../../utils/js/i18n.js'),
  i18nAnim: () => import('../../utils/js/i18n-anim.js'),
  overlay: () => import('../../utils/js/overlay.js'),
  toast: () => import('../../utils/js/toast.js'),
  modal: () => import('../../utils/js/modal.js'),
  auth: () => import('../../utils/js/auth.js'),
  classSelector: () => import('../../utils/js/class-selector.js'),
  calendarPermissions: () => import('../../utils/js/calendar-permissions.js'),
  home: () => import('../../utils/js/home.js'),
  changelog: () => import('../../utils/js/changelog.js'),
  privacy: () => import('../../utils/js/privacy.js'),
  profile: () => import('../../utils/js/profile.js'),
  gradeCalculator: () => import('../../utils/js/notenrechner.js'),
  upcoming: () => import('../../utils/js/upcoming.js'),
  weeklyPreview: () => import('../../utils/js/weekly-preview.js'),
  currentSubject: () => import('../../utils/js/current-subject.js'),
  stundenplan: () => import('../../utils/js/stundenplan.js'),
  dayOverview: () => import('../../utils/js/tagesuebersicht.js'),
  timetableWeek: () => import('../../utils/js/timetable-week.js'),
  calendarHeader: () => import('../../utils/js/calendar-header.js'),
  calendar: () => import('../../utils/js/kalender.js'),
  calendarMobile: () => import('../../utils/js/calendar-mobile.js'),
  adminDashboard: () => import('../../utils/js/admin-dashboard.js')
};

const commonScripts = ['i18n', 'i18nAnim', 'overlay', 'toast', 'modal', 'auth'];
const loadedScripts = new Set();
let headerReadyDispatched = false;

export async function loadLegacyScripts(names = []) {
  const queue = [...commonScripts, ...names];
  for (const name of queue) {
    if (loadedScripts.has(name)) {
      continue;
    }
    const load = scriptLoaders[name];
    if (load) {
      await load();
      loadedScripts.add(name);
    }
  }
}

export function dispatchLegacyReady() {
  window.hmI18n?.apply?.();
  if (!headerReadyDispatched) {
    headerReadyDispatched = true;
    window.dispatchEvent(
      new CustomEvent('hm:header-ready', {
        detail: { header: document.querySelector('.hm-navbar') }
      })
    );
  }
  document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
  window.hmI18n?.apply?.();
}
