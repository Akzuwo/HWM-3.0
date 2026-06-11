document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  const t = window.hmI18n ? window.hmI18n.scope('currentSubject') : (key, fallback) => fallback;

  const controller = initCurrentSubjectPage({
    refreshInterval: 15000,
    countdownUpdateInterval: 1000,
    text: {
      baseTitle: t('title', 'Current Subject'),
      countdownLabel: t('countdownLabel', 'Time remaining'),
      progressLabel: t('progressLabel', 'Lesson progress'),
      freeSlot: t('freeSlot', 'Free period'),
      noLesson: t('currentLesson.empty', 'No lesson in progress.'),
      noNextLesson: t('nextLesson.empty', 'No further lessons today.'),
      error: t('error', 'Unable to load data.'),
      unauthorized: t(
        'unauthorized',
        'Please sign in and make sure you are assigned to a class to view the current subject.'
      ),
      featureUnavailable: t('featureUnavailable', 'This feature is not yet available for your class.')
    },
  });

  if (window.hmClassSelector) {
    const permissions = window.hmCalendar ? window.hmCalendar.permissions : null;
    const selector = window.hmClassSelector.create({
      container: '[data-class-selector]',
      select: '[data-class-select]',
      permissions,
      text: {
        label: t('classLabel', 'Class'),
        placeholder: t('classPlaceholder', 'Select class'),
        loading: t('classLoading', 'Loading classes…'),
        error: t('classError', 'Unable to load classes.'),
        changeError: t('classChangeError', 'Unable to change class.'),
        required: t('classRequired', 'Please choose a class to use this feature.')
      },
      onError: (message) => {
        if (typeof window.showOverlay === 'function') {
          window.showOverlay(message, 'error');
        } else {
          console.error(message);
        }
      },
      onClassChange: () => {
        if (controller && typeof controller.refresh === 'function') {
          controller.refresh();
        }
      }
    });
    selector.init().catch((error) => {
      console.error('Failed to initialise class selector:', error);
    });
  }
});
