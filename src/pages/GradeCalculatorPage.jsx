import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';

export function GradeCalculatorPage() {
  usePageSetup({
    bodyClass: '',
    scripts: ['gradeCalculator']
  });

  return (
    <AppLayout>
      <main className="grade-calculator" id="main" data-grade-calculator="">
        <header className="grade-calculator__header">
          <h1 className="grade-calculator__title">
            <span className="grade-calculator__title-icon" aria-hidden="true">
              📊
            </span>
            <span data-i18n="gradeCalculator.title">Grade Calculator</span>
          </h1>
        </header>

        <section className="grade-calculator__section" aria-labelledby="add-grade-heading">
          <h2 id="add-grade-heading" className="grade-calculator__section-title" data-i18n="gradeCalculator.add.title">
            Add grade
          </h2>
          <form className="grade-calculator__form grade-calculator__form--inline" id="addForm" noValidate>
            <div className="grade-calculator__field">
              <label className="grade-calculator__label" htmlFor="note" data-i18n="gradeCalculator.add.gradeLabel">
                Grade
              </label>
              <input
                id="note"
                className="grade-calculator__input"
                type="number"
                step="0.01"
                min="1"
                max="6"
                placeholder="e.g. 5.5"
                data-i18n-attr="placeholder:gradeCalculator.add.gradePlaceholder"
                aria-describedby="gradeError"
                inputMode="decimal"
              />
              <p className="grade-calculator__error" id="gradeError" role="status" aria-live="polite"></p>
            </div>
            <div className="grade-calculator__field">
              <label className="grade-calculator__label" htmlFor="gewichtung" data-i18n="gradeCalculator.add.weightLabel">
                Weight
              </label>
              <input
                id="gewichtung"
                className="grade-calculator__input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 1"
                data-i18n-attr="placeholder:gradeCalculator.add.weightPlaceholder"
                aria-describedby="weightError"
                inputMode="decimal"
              />
              <p className="grade-calculator__error" id="weightError" role="status" aria-live="polite"></p>
            </div>
            <div className="grade-calculator__action">
              <button type="submit" id="add" className="grade-calculator__button grade-calculator__button--primary" disabled aria-disabled="true">
                <span data-i18n="gradeCalculator.add.addButton">Add</span>
                <span aria-hidden="true">＋</span>
              </button>
            </div>
          </form>

          <div className="grade-calculator__table-wrapper">
            <table id="notenTabelle" className="grade-calculator__table">
              <thead>
                <tr>
                  <th scope="col" data-i18n="gradeCalculator.table.number">
                    No.
                  </th>
                  <th scope="col" data-i18n="gradeCalculator.table.grade">
                    Grade
                  </th>
                  <th scope="col" data-i18n="gradeCalculator.table.weight">
                    Weight
                  </th>
                  <th scope="col" className="visually-hidden" data-i18n="gradeCalculator.table.actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <div className="grade-calculator__summary" aria-live="polite">
            <div className="grade-calculator__summary-row" id="schnitt">
              <span className="grade-calculator__summary-label" data-i18n="gradeCalculator.summary.average">
                Average
              </span>
              <span className="grade-calculator__summary-value" id="averageValue">
                –
              </span>
            </div>
          </div>
        </section>

        <section className="grade-calculator__section" aria-labelledby="target-heading">
          <h2 id="target-heading" className="grade-calculator__section-title" data-i18n="gradeCalculator.target.title">
            Target average
          </h2>
          <form className="grade-calculator__form grade-calculator__form--inline" id="targetForm" noValidate>
            <div className="grade-calculator__field">
              <label className="grade-calculator__label" htmlFor="ziel" data-i18n="gradeCalculator.target.targetLabel">
                Target average
              </label>
              <input
                id="ziel"
                className="grade-calculator__input"
                type="number"
                step="0.01"
                min="1"
                max="6"
                placeholder="e.g. 5"
                data-i18n-attr="placeholder:gradeCalculator.target.targetPlaceholder"
                aria-describedby="targetError"
                inputMode="decimal"
              />
              <p className="grade-calculator__error" id="targetError" role="status" aria-live="polite"></p>
            </div>
            <div className="grade-calculator__field">
              <label className="grade-calculator__label" htmlFor="zusaetzlich" data-i18n="gradeCalculator.target.nextWeightLabel">
                Weight of next grade
              </label>
              <input
                id="zusaetzlich"
                className="grade-calculator__input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 1"
                data-i18n-attr="placeholder:gradeCalculator.target.nextWeightPlaceholder"
                aria-describedby="nextWeightError"
                inputMode="decimal"
              />
              <p className="grade-calculator__error" id="nextWeightError" role="status" aria-live="polite"></p>
            </div>
            <div className="grade-calculator__action">
              <button type="submit" id="berechnen" className="grade-calculator__button grade-calculator__button--primary" disabled aria-disabled="true">
                <span data-i18n="gradeCalculator.target.calculateButton">Calculate</span>
                <span aria-hidden="true">=</span>
              </button>
            </div>
          </form>

          <div className="grade-calculator__footer" aria-live="polite">
            <div className="grade-calculator__required" id="zielNote" data-state="idle" data-i18n="gradeCalculator.target.required">
              Required grade: –
            </div>
          </div>
        </section>

        <section className="grade-calculator__section grade-sync" aria-labelledby="grade-sync-heading">
          <div className="grade-sync__header">
            <div>
              <h2 id="grade-sync-heading" className="grade-calculator__section-title">
                Noten-Sync
              </h2>
              <p className="grade-sync__lead">
                Deine Noten werden als verschlüsselter Noten-Tresor gespeichert. HWM kann den Inhalt nicht lesen. Du brauchst dein Sync-Passwort, um den Tresor auf einem neuen Gerät zu öffnen. Wenn du dieses Passwort vergisst, können deine synchronisierten Noten nicht wiederhergestellt werden.
              </p>
            </div>
            <span className="grade-sync__status" id="gradeSyncStatus">Lokal</span>
          </div>

          <div className="grade-sync__notice">
            Die erweiterte Notenverwaltung mit mehreren Fächern ist nur mit aktiviertem verschlüsseltem Sync verfügbar. So werden deine Daten nicht nur lokal auf einem Gerät gespeichert und gehen nicht versehentlich verloren.
          </div>

          <div className="grade-sync__controls" id="gradeSyncControls">
            <form className="grade-sync__form" id="gradeSyncPasswordForm" noValidate>
              <div className="grade-calculator__field">
                <label className="grade-calculator__label" htmlFor="gradeSyncPassword">
                  Sync-Passwort
                </label>
                <input
                  id="gradeSyncPassword"
                  className="grade-calculator__input"
                  type="password"
                  minLength="8"
                  autoComplete="new-password"
                  placeholder="Separates Sync-Passwort"
                />
                <p className="grade-calculator__error" id="gradeSyncError" role="status" aria-live="polite"></p>
              </div>
              <div className="grade-sync__actions">
                <button type="submit" id="gradeSyncEnable" className="grade-calculator__button grade-calculator__button--primary">
                  Sync aktivieren / entsperren
                </button>
                <button type="button" id="gradeSyncReload" className="grade-calculator__button grade-calculator__button--secondary" hidden>
                  Serverstand neu laden
                </button>
                <button type="button" id="gradeSyncDisableDevice" className="grade-calculator__button grade-calculator__button--secondary" hidden>
                  Auf diesem Gerät deaktivieren
                </button>
                <button type="button" id="gradeSyncDeleteServer" className="grade-calculator__button grade-calculator__button--danger" hidden>
                  Server-Tresor löschen
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="grade-calculator__section grade-vault" id="gradeVaultSection" aria-labelledby="grade-vault-heading" hidden>
          <div className="grade-vault__toolbar">
            <div>
              <h2 id="grade-vault-heading" className="grade-calculator__section-title">
                Erweiterte Notenverwaltung
              </h2>
              <p className="grade-vault__meta" id="gradeVaultMeta">Tresor entsperrt</p>
            </div>
            <button type="button" id="gradeVaultSave" className="grade-calculator__button grade-calculator__button--primary">
              Speichern
            </button>
          </div>

          <div className="grade-vault__summary" id="gradeVaultOverall"></div>

          <div className="grade-vault__layout">
            <aside className="grade-vault__subjects" aria-label="Fächer">
              <form className="grade-vault__subject-form" id="gradeSubjectForm" noValidate>
                <input id="gradeSubjectName" className="grade-calculator__input" type="text" placeholder="Fachname" />
                <input id="gradeSubjectShortName" className="grade-calculator__input" type="text" placeholder="Kürzel" />
                <button type="submit" className="grade-calculator__button grade-calculator__button--primary">Fach hinzufügen</button>
              </form>
              <div className="grade-vault__subject-list" id="gradeSubjectList"></div>
            </aside>

            <div className="grade-vault__detail">
              <div className="grade-vault__detail-header">
                <div>
                  <h3 className="grade-vault__subject-title" id="gradeSelectedSubjectTitle">Kein Fach ausgewählt</h3>
                  <p className="grade-vault__meta" id="gradeSelectedSubjectMeta">Erstelle oder wähle ein Fach.</p>
                </div>
                <button type="button" id="gradeSubjectDelete" className="grade-calculator__button grade-calculator__button--danger" hidden>
                  Fach löschen
                </button>
              </div>

              <form className="grade-vault__grade-form" id="gradeEntryForm" noValidate hidden>
                <input id="gradeEntryTitle" className="grade-calculator__input" type="text" placeholder="Beschreibung" />
                <input id="gradeEntryValue" className="grade-calculator__input" type="number" min="1" max="6" step="0.01" placeholder="Note" />
                <input id="gradeEntryWeight" className="grade-calculator__input" type="number" min="0.01" step="0.01" placeholder="Gewichtung" />
                <input id="gradeEntryDate" className="grade-calculator__input" type="date" />
                <button type="submit" className="grade-calculator__button grade-calculator__button--primary">Note speichern</button>
              </form>

              <div className="grade-calculator__table-wrapper">
                <table className="grade-calculator__table">
                  <thead>
                    <tr>
                      <th>Beschreibung</th>
                      <th>Note</th>
                      <th>Gewichtung</th>
                      <th>Datum</th>
                      <th className="visually-hidden">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody id="gradeEntryList"></tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <div className="grade-calculator__back">
          <a className="grade-calculator__button grade-calculator__button--secondary" href="/index.html">
            <span aria-hidden="true">◀️</span>
            <span data-i18n="gradeCalculator.back">Back</span>
          </a>
        </div>
      </main>
    </AppLayout>
  );
}

