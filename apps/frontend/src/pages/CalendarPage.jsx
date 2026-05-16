import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';
import { SUBJECT_OPTIONS } from './shared';

function SubjectOptions() {
  return SUBJECT_OPTIONS.map((subject) => <option key={subject}>{subject}</option>);
}

export function CalendarPage() {
  usePageSetup({
    bodyClass: 'calendar-theme',
    scripts: ['calendarPermissions', 'classSelector', 'calendarHeader', 'calendar', 'calendarMobile']
  });

  return (
    <AppLayout footer={false}>
      <main className="calendar-page" id="main">
        <section className="calendar-intro">
          <div className="calendar-intro__heading">
            <p className="calendar-header__label" data-i18n="calendar.header.badge">
              Calendar hub
            </p>
            <h1 className="calendar-header__title" data-i18n="calendar.heading">
              📅 Calendar
            </h1>
            <p className="calendar-header__subtitle" data-i18n="calendar.header.subtitle">
              Real-time overview for homework, exams and events.
            </p>
          </div>
        </section>

        <div className="calendar-mobile-shell">
          <div className="calendar-mobile-bar" data-calendar-mobile-bar="">
            <div className="calendar-mobile-bar__date-wrap">
              <span className="calendar-mobile-bar__eyebrow">Selected day</span>
              <div className="calendar-mobile-bar__date" data-calendar-mobile-date="">
                Mo, 29. Jan
              </div>
            </div>
            <div className="calendar-mobile-bar__range" data-calendar-mobile-label="">
              January 2026
            </div>
          </div>

          <div className="calendar-mobile-controls" data-calendar-mobile-controls="">
            <div className="calendar-mobile-nav" role="group" aria-label="Calendar navigation">
              <button type="button" className="calendar-mobile-nav__button" data-mobile-nav="prev" aria-label="Previous">
                <span aria-hidden="true">◀</span>
              </button>
              <button type="button" className="calendar-mobile-nav__button calendar-mobile-nav__button--today" data-mobile-nav="today">
                Today
              </button>
              <button type="button" className="calendar-mobile-nav__button" data-mobile-nav="next" aria-label="Next">
                <span aria-hidden="true">▶</span>
              </button>
            </div>
            <div className="calendar-mobile-view-switch" role="group" aria-label="Select calendar view">
              <button type="button" className="calendar-mobile-view-switch__button" data-mobile-view="day">
                <span data-mobile-view-label="">Day</span>
              </button>
              <button type="button" className="calendar-mobile-view-switch__button" data-mobile-view="week">
                <span data-mobile-view-label="">Week</span>
              </button>
              <button type="button" className="calendar-mobile-view-switch__button" data-mobile-view="month">
                <span data-mobile-view-label="">Month</span>
              </button>
            </div>
            <div className="calendar-mobile-carousel" data-calendar-mobile-carousel=""></div>
          </div>
        </div>

        <section className="calendar-shell" aria-live="polite">
          <div className="calendar-weekstrip is-hidden" data-week-strip="">
            <span className="calendar-weekstrip__label" data-i18n="calendar.weekStrip.label">
              Calendar weeks
            </span>
            <div className="calendar-weekstrip__list" data-week-strip-list="" role="listbox"></div>
          </div>

          <div className="calendar-workspace">
            <aside className="calendar-sidebar" aria-label="Calendar controls">
              <div className="calendar-sidebar__header">
                <span className="calendar-sidebar__eyebrow" data-i18n="calendar.header.badge">
                  Calendar hub
                </span>
                <h1 className="calendar-sidebar__title" data-i18n="calendar.heading">
                  📅 Calendar
                </h1>
                <span className="calendar-month-nav__label" data-calendar-month-label="" data-i18n="calendar.monthNav.current">
                  Current month
                </span>
              </div>

              <div className="calendar-controls" data-calendar-controls="">
                <div
                  className="calendar-month-nav"
                  role="toolbar"
                  aria-label="Month navigation"
                  data-i18n-attr="aria-label:calendar.monthNav.label"
                >
                  <button
                    type="button"
                    className="calendar-month-nav__button calendar-month-nav__button--prev"
                    data-calendar-nav="prev"
                    aria-label="Previous month"
                    data-i18n-attr="aria-label:calendar.monthNav.previous"
                  >
                    <span aria-hidden="true">◀</span>
                    <span className="visually-hidden" data-i18n="calendar.monthNav.previous">
                      Previous month
                    </span>
                  </button>
                  <button
                    type="button"
                    className="calendar-month-nav__button calendar-month-nav__button--today"
                    data-calendar-nav="today"
                    aria-label="Go to today"
                    data-i18n-attr="aria-label:calendar.monthNav.today"
                  >
                    <span data-i18n="calendar.monthNav.today">Today</span>
                  </button>
                  <button
                    type="button"
                    className="calendar-month-nav__button calendar-month-nav__button--next"
                    data-calendar-nav="next"
                    aria-label="Next month"
                    data-i18n-attr="aria-label:calendar.monthNav.next"
                  >
                    <span className="visually-hidden" data-i18n="calendar.monthNav.next">
                      Next month
                    </span>
                    <span aria-hidden="true">▶</span>
                  </button>
                </div>

                <div
                  className="calendar-view-switch"
                  role="group"
                  aria-label="Select calendar view"
                  data-i18n-attr="aria-label:calendar.viewSwitch.label"
                >
                  <button type="button" className="calendar-view-switch__button" data-calendar-view="dayGridMonth" aria-pressed="false" data-i18n="calendar.views.month">
                    Month
                  </button>
                  <button type="button" className="calendar-view-switch__button" data-calendar-view="timeGridWeek" aria-pressed="false" data-i18n="calendar.views.week">
                    Week
                  </button>
                  <button type="button" className="calendar-view-switch__button" data-calendar-view="timeGridDay" aria-pressed="false" data-i18n="calendar.views.day">
                    Day
                  </button>
                </div>

                <div className="calendar-class-selector" data-class-selector="" hidden>
                  <label htmlFor="calendar-class-select" data-i18n="calendar.classSelector.label">
                    Class
                  </label>
                  <select id="calendar-class-select" data-class-select="" defaultValue="">
                    <option value="" disabled data-i18n="calendar.classSelector.placeholder">
                      Select class
                    </option>
                  </select>
                </div>

                <button type="button" className="calendar-filter-button" data-calendar-filter-toggle="" data-i18n="calendar.filters.button">
                  Filter
                </button>
              </div>

              <div className="calendar-shell__legend" role="presentation">
                <div className="calendar-legend" role="list">
                  {[
                    ['hausaufgabe', 'calendar.legend.homework', 'Homework'],
                    ['pruefung', 'calendar.legend.exam', 'Exam'],
                    ['event', 'calendar.legend.event', 'Event'],
                    ['ferien', 'calendar.legend.holiday', 'Holidays & Breaks'],
                    ['todo', 'calendar.legend.todo', 'ToDo']
                  ].map(([type, key, label]) => (
                    <span key={type} className="calendar-legend__item" data-type={type} role="listitem">
                      <span className="calendar-legend__dot" aria-hidden="true"></span>
                      <span data-i18n={key}>{label}</span>
                    </span>
                  ))}
                </div>
              </div>

              <footer className="calendar-action-bar" data-i18n-attr="aria-label:calendar.actionBar.label" aria-label="Calendar actions">
                <div className="calendar-action-bar__inner">
                  <button type="button" className="calendar-cta calendar-cta--primary" data-action="create">
                    <span className="calendar-cta__label" data-i18n="calendar.actions.create.label">
                      New entry
                    </span>
                  </button>
                  <button type="button" className="calendar-cta calendar-cta--secondary" data-action="export">
                    <span className="calendar-cta__label" data-i18n="calendar.actions.export.label">
                      Export
                    </span>
                  </button>
                  <button type="button" className="calendar-cta calendar-cta--secondary" data-action="back">
                    <span className="calendar-cta__label" data-i18n="calendar.actions.back.label">
                      Back to overview
                    </span>
                  </button>
                </div>
              </footer>
            </aside>

            <div className="calendar-board">
              <div id="calendar" data-state="loading" role="status" aria-live="polite" aria-busy="true" data-i18n="calendar.status.loading">
                Loading calendar ...
              </div>
              <div className="calendar-agenda-view" data-calendar-agenda=""></div>
              <div className="calendar-month-mobile" data-calendar-month=""></div>
            </div>
          </div>
        </section>
      </main>

      <div id="fc-modal-overlay" className="hm-modal-overlay" onClick={() => window.closeModal?.()}>
        <div className="hm-modal" role="dialog" aria-modal="true" tabIndex="-1" onClick={(event) => event.stopPropagation()}>
          <header className="hm-modal__header">
            <button type="button" className="hm-modal__close" onClick={() => window.closeModal?.()} aria-label="Close">
              <span className="visually-hidden" data-i18n="calendar.modal.buttons.close">
                Close
              </span>
              ✕
            </button>
            <div className="hm-modal__title-wrapper">
              <h2 id="fc-modal-title" className="hm-modal__title" data-i18n="calendar.modal.viewTitle">
                Calendar entry
              </h2>
            </div>
          </header>

          <div id="fc-view-mode" className="hm-modal__section">
            <div className="hm-modal__body">
              <div className="hm-modal__field">
                <label data-i18n="calendar.modal.labels.type">Type</label>
                <span id="fc-modal-type"></span>
              </div>
              <div className="hm-modal__field">
                <label data-view-label="subject" data-i18n="calendar.modal.labels.subject">
                  Subject
                </label>
                <span id="fc-modal-subject"></span>
              </div>
              <div className="hm-modal__field">
                <label data-i18n="calendar.modal.labels.date">Date</label>
                <span id="fc-modal-date"></span>
              </div>
            </div>
            <div id="fc-modal-desc" className="hm-modal__desc" data-i18n-html="calendar.modal.noDescription"></div>
            <div className="hm-modal__todo-status is-hidden" data-todo-status-panel="">
              <label htmlFor="fc-todo-status" data-i18n="calendar.todoStatus.label">
                ToDo status
              </label>
              <select id="fc-todo-status" className="hm-select" data-todo-status-select="">
                <option value="offen" data-i18n="calendar.todoStatus.open">Open</option>
                <option value="in_bearbeitung" data-i18n="calendar.todoStatus.inProgress">In progress</option>
                <option value="beendet" data-i18n="calendar.todoStatus.done">Done</option>
              </select>
              <button type="button" className="hm-btn hm-btn--secondary" data-todo-status-save="" data-i18n="calendar.todoStatus.save">
                Save status
              </button>
            </div>
            <div className="hm-modal__footer">
              <button type="button" className="hm-btn hm-btn--primary is-hidden" data-role="edit-view" data-i18n="calendar.modal.buttons.edit">
                Edit
              </button>
              <button type="button" className="hm-btn hm-btn--secondary" onClick={() => window.closeModal?.()} data-i18n="calendar.modal.buttons.close">
                Close
              </button>
            </div>
          </div>

          <form id="fc-edit-form" className="hm-modal__form is-hidden" onSubmit={(event) => window.saveEdit?.(event)} noValidate>
            <input type="hidden" id="fc-entry-id" />
            <div className="hm-modal__body">
              <div className="hm-modal__field" data-field="type">
                <label htmlFor="fc-edit-type" data-i18n="calendar.modal.labels.type">
                  Type
                </label>
                <select id="fc-edit-type" className="hm-select hm-select--type" name="typ" required data-hm-modal-initial-focus="">
                  <option value="hausaufgabe" data-i18n="calendar.legend.homework">Homework</option>
                  <option value="pruefung" data-i18n="calendar.legend.exam">Exam</option>
                  <option value="event" data-i18n="calendar.legend.event">Event</option>
                  <option value="ferien" data-i18n="calendar.legend.holiday">Holidays &amp; Breaks</option>
                  <option value="todo" data-i18n="calendar.legend.todo">ToDo</option>
                </select>
              </div>
              <div className="hm-modal__field is-hidden" data-field="event-title">
                <label htmlFor="fc-edit-event-title" data-i18n="calendar.modal.labels.eventTitle">
                  Event title
                </label>
                <input type="text" id="fc-edit-event-title" name="event-titel" placeholder="Event name" />
              </div>
              <div className="hm-modal__field" data-field="subject">
                <label htmlFor="fc-edit-subject" data-i18n="calendar.modal.labels.subject">
                  Subject
                </label>
                <select id="fc-edit-subject" className="hm-select hm-select--subject" name="fach">
                  <option value="" data-i18n="calendar.modal.placeholders.subject">- select -</option>
                  <SubjectOptions />
                </select>
              </div>
              <div className="hm-modal__field" data-field="date">
                <label htmlFor="fc-edit-date" data-i18n="calendar.modal.labels.date">
                  Date
                </label>
                <input type="date" id="fc-edit-date" name="datum" required />
              </div>
              <div className="hm-modal__field is-hidden" data-field="end-date">
                <label htmlFor="fc-edit-end-date" data-i18n="calendar.modal.labels.endDate">
                  End date
                </label>
                <input type="date" id="fc-edit-end-date" name="enddatum" />
              </div>
              <div className="hm-modal__field" data-field="start">
                <label htmlFor="fc-edit-start" data-i18n="calendar.modal.labels.start">
                  Start time
                </label>
                <input type="time" id="fc-edit-start" name="startzeit" />
              </div>
              <div className="hm-modal__field" data-field="end">
                <label htmlFor="fc-edit-end" data-i18n="calendar.modal.labels.end">
                  End time
                </label>
                <input type="time" id="fc-edit-end" name="endzeit" />
              </div>
              <div className="hm-modal__field" data-field="description">
                <label htmlFor="fc-edit-desc" data-i18n="calendar.modal.labels.descriptionOptional">
                  Description (optional)
                </label>
                <textarea id="fc-edit-desc" name="beschreibung" rows="4" placeholder="Details"></textarea>
              </div>
            </div>
            <div className="hm-modal__footer">
              <button type="button" className="hm-btn hm-btn--secondary" data-role="cancel" data-i18n="calendar.modal.buttons.cancel">
                Cancel
              </button>
              <button type="submit" className="hm-btn hm-btn--primary" data-role="submit" data-i18n="calendar.modal.buttons.save">
                Save
              </button>
              <button type="button" className="hm-btn hm-btn--danger" data-role="delete" onClick={() => window.openDeleteConfirmModal?.()} data-i18n="calendar.modal.buttons.delete">
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="entry-modal-overlay" className="hm-modal-overlay" onClick={() => window.closeEntryModal?.()}>
        <div className="hm-modal" role="dialog" aria-modal="true" tabIndex="-1" onClick={(event) => event.stopPropagation()}>
          <header className="hm-modal__header">
            <button type="button" className="hm-modal__close" onClick={() => window.closeEntryModal?.()} aria-label="Close">
              ✕
            </button>
            <div className="hm-modal__title-wrapper">
              <h2 className="hm-modal__title" data-i18n="calendar.modal.createTitle">
                Create entry
              </h2>
            </div>
          </header>
          <form id="entry-form" className="hm-modal__form" onSubmit={(event) => window.saveEntry?.(event)} noValidate>
            <div className="hm-modal__body">
              <div className="hm-modal__field" data-field="type">
                <label htmlFor="typ" data-i18n="calendar.modal.labels.type">
                  Type
                </label>
                <select id="typ" className="hm-select hm-select--type" name="typ" required data-hm-modal-initial-focus="">
                  <option value="hausaufgabe" data-i18n="calendar.legend.homework">Homework</option>
                  <option value="pruefung" data-i18n="calendar.legend.exam">Exam</option>
                  <option value="event" data-i18n="calendar.legend.event">Event</option>
                  <option value="ferien" data-i18n="calendar.legend.holiday">Holidays &amp; Breaks</option>
                  <option value="todo" data-i18n="calendar.legend.todo">ToDo</option>
                </select>
              </div>
              <div className="hm-modal__field is-hidden" data-field="event-title">
                <label htmlFor="event-titel" data-i18n="calendar.modal.labels.eventTitle">
                  Event title
                </label>
                <input type="text" id="event-titel" name="event-titel" placeholder="Event name" />
                <p className="field-hint" data-i18n="calendar.modal.hints.eventTitle">
                  Required for events.
                </p>
              </div>
              <div className="hm-modal__field" data-field="subject">
                <label htmlFor="fach" data-i18n="calendar.modal.labels.subject">
                  Subject
                </label>
                <select id="fach" className="hm-select hm-select--subject" name="fach">
                  <option value="" data-i18n="calendar.modal.placeholders.subject">- select -</option>
                  <SubjectOptions />
                </select>
              </div>
              <div className="hm-modal__field" data-field="classes" data-entry-class-field="" data-entry-class-hint="Select one or more classes." hidden>
                <label>Classes</label>
                <div className="entry-class-checkboxes" data-entry-class-options="">
                  <p className="field-hint">Loading classes...</p>
                </div>
              </div>
              <div className="hm-modal__field" data-field="date">
                <label htmlFor="datum" data-i18n="calendar.modal.labels.date">
                  Date
                </label>
                <input type="date" id="datum" name="datum" required />
              </div>
              <div className="hm-modal__field is-hidden" data-field="end-date">
                <label htmlFor="enddatum" data-i18n="calendar.modal.labels.endDate">
                  End date
                </label>
                <input type="date" id="enddatum" name="enddatum" />
              </div>
              <div className="hm-modal__field" data-field="start">
                <label htmlFor="startzeit" data-i18n="calendar.modal.labels.start">
                  Start time
                </label>
                <input type="time" id="startzeit" name="startzeit" />
              </div>
              <div className="hm-modal__field" data-field="end">
                <label htmlFor="endzeit" data-i18n="calendar.modal.labels.end">
                  End time
                </label>
                <input type="time" id="endzeit" name="endzeit" />
              </div>
              <div className="hm-modal__field" data-field="description">
                <label htmlFor="beschreibung" data-i18n="calendar.modal.labels.descriptionOptional">
                  Description (optional)
                </label>
                <textarea id="beschreibung" name="beschreibung" rows="3" placeholder="Summary"></textarea>
              </div>
            </div>
            <div className="hm-modal__footer">
              <button type="button" className="hm-btn hm-btn--secondary" data-role="cancel" onClick={() => window.closeEntryModal?.()} data-i18n="calendar.modal.buttons.cancel">
                Cancel
              </button>
              <button type="submit" id="saveButton" className="hm-btn hm-btn--primary" data-role="submit" data-i18n="calendar.modal.buttons.add">
                Add entry
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="calendar-delete-confirm-overlay" className="hm-modal-overlay" aria-hidden="true" onClick={() => window.closeDeleteConfirmModal?.()}>
        <div className="hm-modal hm-modal--compact" role="dialog" aria-modal="true" aria-labelledby="calendar-delete-confirm-title" onClick={(event) => event.stopPropagation()}>
          <header className="hm-modal__header">
            <button type="button" className="hm-modal__close" onClick={() => window.closeDeleteConfirmModal?.()} aria-label="Close">
              ✕
            </button>
            <div className="hm-modal__title-wrapper">
              <h2 id="calendar-delete-confirm-title" className="hm-modal__title" data-i18n="calendar.modal.deleteConfirm.title">
                Delete entry?
              </h2>
            </div>
          </header>
          <div className="hm-modal__body">
            <p data-i18n="calendar.modal.deleteConfirm.message">
              Are you sure you want to delete this entry? This action cannot be undone.
            </p>
          </div>
          <div className="hm-modal__footer">
            <button type="button" className="hm-btn hm-btn--secondary" data-role="cancel" data-hm-modal-initial-focus="" onClick={() => window.closeDeleteConfirmModal?.()} data-i18n="calendar.modal.buttons.cancel">
              Cancel
            </button>
            <button type="button" className="hm-btn hm-btn--danger" data-role="confirm" onClick={() => window.confirmDeleteEntry?.()} data-i18n="calendar.modal.buttons.delete">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div id="calendar-drag-confirm-overlay" className="hm-modal-overlay" aria-hidden="true" onClick={() => window.cancelCalendarDrag?.()}>
        <div className="hm-modal hm-modal--compact" role="dialog" aria-modal="true" aria-labelledby="calendar-drag-confirm-title" onClick={(event) => event.stopPropagation()}>
          <header className="hm-modal__header">
            <button type="button" className="hm-modal__close" onClick={() => window.cancelCalendarDrag?.()} aria-label="Close" data-i18n-attr="aria-label:calendar.modal.buttons.close">
              ✕
            </button>
            <div className="hm-modal__title-wrapper">
              <h2 id="calendar-drag-confirm-title" className="hm-modal__title" data-i18n="calendar.dragConfirm.title">
                Move entry?
              </h2>
            </div>
          </header>
          <div className="hm-modal__body">
            <p data-calendar-drag-message="" data-i18n="calendar.dragConfirm.message">
              Do you want to move this entry to the selected date?
            </p>
          </div>
          <div className="hm-modal__footer">
            <button type="button" className="hm-btn hm-btn--secondary" data-role="cancel" onClick={() => window.cancelCalendarDrag?.()} data-i18n="calendar.modal.buttons.cancel">
              Cancel
            </button>
            <button type="button" className="hm-btn hm-btn--primary" data-role="confirm" onClick={() => window.confirmCalendarDrag?.()} data-i18n="calendar.dragConfirm.confirm">
              Move
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-filter-sheet" data-calendar-filter-sheet="" aria-hidden="true">
        <div className="calendar-filter-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="calendar-filter-title">
          <header className="calendar-filter-sheet__header">
            <h2 id="calendar-filter-title" className="calendar-filter-sheet__title" data-i18n="calendar.filters.title">
              Calendar filters
            </h2>
            <button type="button" className="calendar-filter-sheet__close" data-calendar-filter-close="" aria-label="Close" data-i18n-attr="aria-label:calendar.modal.buttons.close">
              ✕
            </button>
          </header>
          <div className="calendar-filter-sheet__body">
            <p className="field-hint" data-i18n="calendar.filters.subjectHint">
              Hide subjects that are not relevant for you.
            </p>
            <div className="calendar-subject-filters" data-calendar-subject-filters="">
              {SUBJECT_OPTIONS.map((subject) => (
                <label key={subject} className="calendar-filter-toggle" data-subject-filter={subject}>
                  <input type="checkbox" value={subject} />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
            <label className="calendar-filter-toggle calendar-filter-toggle--wide" data-calendar-completed-todos="">
              <input type="checkbox" />
              <span data-i18n="calendar.filters.showCompletedTodos">Show completed ToDos</span>
            </label>
          </div>
        </div>
      </div>

      <div id="calendar-toast-container" className="calendar-toast-container" aria-live="polite" aria-atomic="true"></div>
    </AppLayout>
  );
}




