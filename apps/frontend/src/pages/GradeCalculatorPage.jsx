import { useEffect, useMemo, useState } from 'react';
import { usePageSetup } from '../hooks/usePageSetup';
import {
  MAX_GRADE,
  MIN_GRADE,
  calculateDeficitPoints,
  calculateSubjectAverage,
  createOverallSummary,
  isPositiveWeight,
  isValidGradeValue,
  normalizeNumber,
  roundToHalf,
} from '../../utils/js/grade-calculations.js';
import { deleteGradeVault, getGradeVault, putGradeVault } from '../../utils/js/grade-vault-api.js';
import { decryptGradeVault, encryptGradeVault } from '../../utils/js/grade-vault-crypto.js';

const DEVICE_SYNC_KEY = 'hm.gradeVault.syncEnabled';
const LOCAL_GRADES_KEY = 'hm.gradeCalculator.localGrades';
const LOCAL_GRADE_FALLBACK_TITLE = 'Note';

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function notify(message, variant = 'info') {
  if (!message) {
    return;
  }
  if (window.hmToast?.[variant]) {
    window.hmToast[variant](message);
    return;
  }
  if (typeof window !== 'undefined') {
    window.alert(message);
  }
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) {
    return '–';
  }
  return new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return '–';
  }
  return `${new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: value >= 10 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value)} %`;
}

function formatSignedNumber(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return '+0.0';
  }
  const formatted = new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(value));
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}

function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function createEmptyVault() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    subjects: [],
    settings: {
      roundSubjectAveragesToHalf: true,
    },
  };
}

function normalizeGrade(grade) {
  const value = Number(grade?.value);
  const weight = Number(grade?.weight);
  if (!isValidGradeValue(value) || !isPositiveWeight(weight)) {
    return null;
  }
  return {
    id: grade?.id || createId(),
    title: String(grade?.title || LOCAL_GRADE_FALLBACK_TITLE).trim() || LOCAL_GRADE_FALLBACK_TITLE,
    value,
    weight,
    date: grade?.date || '',
    createdAt: grade?.createdAt || new Date().toISOString(),
  };
}

function normalizeSubject(subject) {
  return {
    id: subject?.id || createId(),
    name: String(subject?.name || 'Unbenanntes Fach').trim() || 'Unbenanntes Fach',
    shortName: String(subject?.shortName || '').trim(),
    grades: Array.isArray(subject?.grades) ? subject.grades.map(normalizeGrade).filter(Boolean) : [],
  };
}

function normalizeVault(rawVault) {
  const vault = rawVault && typeof rawVault === 'object' ? rawVault : createEmptyVault();
  return {
    version: 1,
    updatedAt: vault.updatedAt || new Date().toISOString(),
    subjects: Array.isArray(vault.subjects) ? vault.subjects.map(normalizeSubject) : [],
    settings: {
      roundSubjectAveragesToHalf: true,
      ...(vault.settings && typeof vault.settings === 'object' ? vault.settings : {}),
    },
  };
}

function normalizeLocalGrades(rawGrades) {
  return (Array.isArray(rawGrades) ? rawGrades : []).map(normalizeGrade).filter(Boolean);
}

function getDeviceSyncEnabled() {
  try {
    return localStorage.getItem(DEVICE_SYNC_KEY) === 'true';
  } catch {
    return false;
  }
}

function setDeviceSyncEnabled(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(DEVICE_SYNC_KEY, 'true');
    } else {
      localStorage.removeItem(DEVICE_SYNC_KEY);
    }
  } catch {
    /* ignore local storage errors */
  }
}

function readLocalGrades() {
  try {
    return normalizeLocalGrades(JSON.parse(localStorage.getItem(LOCAL_GRADES_KEY) || '[]'));
  } catch {
    return [];
  }
}

function writeLocalGrades(grades) {
  try {
    localStorage.setItem(LOCAL_GRADES_KEY, JSON.stringify(grades));
  } catch {
    /* ignore local storage errors */
  }
}

function calculateAverageFromGrades(grades) {
  return calculateSubjectAverage({ grades });
}

function calculateRequiredGrade(grades, target, nextWeight) {
  if (!grades.length) {
    return { state: 'empty' };
  }
  const parsedTarget = normalizeNumber(target);
  const parsedWeight = normalizeNumber(nextWeight);
  if (!isValidGradeValue(parsedTarget) || !isPositiveWeight(parsedWeight)) {
    return { state: 'invalid' };
  }

  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
  const weightedSum = grades.reduce((sum, grade) => sum + grade.value * grade.weight, 0);
  const required = ((parsedTarget * (totalWeight + parsedWeight)) - weightedSum) / parsedWeight;

  if (!Number.isFinite(required)) {
    return { state: 'invalid' };
  }
  if (required < MIN_GRADE || required > MAX_GRADE) {
    return { state: 'unreachable', value: required };
  }
  return { state: 'ready', value: required };
}

function buildTrendPoints(grades) {
  let weightedSum = 0;
  let totalWeight = 0;
  return grades.map((grade, index) => {
    weightedSum += grade.value * grade.weight;
    totalWeight += grade.weight;
    return {
      step: index + 1,
      average: weightedSum / totalWeight,
      label: grade.title,
    };
  });
}

function createSyncStateLabel(syncState) {
  if (syncState.isSaving) {
    return 'Wird synchronisiert...';
  }
  if (syncState.error) {
    return 'Fehler beim Synchronisieren';
  }
  if (syncState.conflict) {
    return 'Konflikt erkannt';
  }
  if (syncState.unlocked && syncState.hasUnsavedChanges) {
    return 'Nicht gespeichert';
  }
  if (syncState.unlocked) {
    return 'Gespeichert';
  }
  if (syncState.enabledOnDevice) {
    return 'Cloudsync gesperrt';
  }
  return 'Nur lokal';
}

function Modal({ open, title, subtitle, onClose, actions, children, wide = false }) {
  if (!open) {
    return null;
  }

  return (
    <div className="grade-modal" role="presentation" onClick={onClose}>
      <div
        className={`grade-modal__dialog${wide ? ' grade-modal__dialog--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grade-modal__header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="grade-modal__close" aria-label="Schliessen" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="grade-modal__body">{children}</div>
        {actions ? <div className="grade-modal__footer">{actions}</div> : null}
      </div>
    </div>
  );
}

function TrendChart({ grades }) {
  const points = buildTrendPoints(grades);

  if (!points.length) {
    return (
      <div className="grade-chart__empty">
        <strong>Noch keine Trenddaten</strong>
        <span>Trage zuerst mindestens eine Note ein.</span>
      </div>
    );
  }

  const visiblePoints = points.slice(-6);

  return (
    <div className="grade-chart">
      <div className="grade-chart__header">
        <span>Notenverlauf</span>
        <small>Letzte 6 Monate</small>
      </div>
      <div className="grade-chart__bars" aria-hidden="true">
        {visiblePoints.map((point, index) => {
          const height = Math.max(18, ((point.average - MIN_GRADE) / (MAX_GRADE - MIN_GRADE)) * 82);
          return (
            <span
              key={`${point.step}-${point.label}`}
              className={index === visiblePoints.length - 1 ? 'is-current' : ''}
              style={{ '--bar-height': `${height}%` }}
            ></span>
          );
        })}
      </div>
      <div className="grade-chart__legend">
        <span>Mai</span>
        <span>Okt</span>
      </div>
    </div>
  );
}

function GradeList({ grades, onEdit, onDelete }) {
  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);

  if (!grades.length) {
    return (
      <div className="grade-calculator__empty-state">
        <h3>Noch keine Noten erfasst</h3>
        <p>Füge deine erste Note hinzu, um deinen Schnitt zu berechnen.</p>
      </div>
    );
  }

  return (
    <div className="grade-calculator__grade-list max-h-[600px] overflow-y-auto scroll-smooth pr-2 custom-scrollbar">
      {grades.slice().reverse().map((grade) => (
        <article 
          key={grade.id} 
          className="grade-calculator__grade-item p-3 sm:p-4 mb-2 rounded-2xl bg-white/40 border border-white/60 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-white/80 hover:border-blue-300/60"
        >
          <div className="grade-calculator__grade-badge transition-transform duration-300 hover:scale-110">{formatNumber(grade.value, 1)}</div>
          <div className="grade-calculator__grade-copy">
            <h3 className="transition-colors duration-300 hover:text-blue-700">{grade.title}</h3>
            <p>
              Gewichtung: {formatPercent(totalWeight > 0 ? (grade.weight / totalWeight) * 100 : NaN)}
              {grade.date ? ` · ${grade.date}` : ''}
            </p>
          </div>
          <div className="grade-calculator__row-actions">
            <button type="button" className="grade-calculator__inline-button transition-transform duration-200 hover:scale-105" onClick={() => onEdit(grade)}>
              Bearbeiten
            </button>
            <button
              type="button"
              className="grade-calculator__inline-button grade-calculator__inline-button--danger transition-transform duration-200 hover:scale-105"
              onClick={() => onDelete(grade.id)}
            >
              Löschen
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function SummaryMetric({ label, value, accent = false, interactive = false, onClick }) {
  const Tag = interactive ? 'button' : 'div';
  return (
    <Tag
      type={interactive ? 'button' : undefined}
      className={`grade-summary__metric${accent ? ' grade-summary__metric--accent' : ''}${interactive ? ' grade-summary__metric--interactive' : ''}`}
      onClick={interactive ? onClick : undefined}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </Tag>
  );
}

export function GradeCalculatorPage() {
  usePageSetup({ bodyClass: 'grade-calculator-page', scripts: [] });

  const [localGrades, setLocalGrades] = useState(() => readLocalGrades());
  const [gradeForm, setGradeForm] = useState({ title: '', value: '', weight: '1' });
  const [targetForm, setTargetForm] = useState({ target: '', nextWeight: '1' });
  const [targetRequested, setTargetRequested] = useState(false);
  const [trendOpen, setTrendOpen] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [deficitOpen, setDeficitOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [syncPassword, setSyncPassword] = useState('');
  const [subjectDraft, setSubjectDraft] = useState({ name: '', shortName: '' });
  const [syncState, setSyncState] = useState({
    enabledOnDevice: getDeviceSyncEnabled(),
    unlocked: false,
    password: '',
    revision: 0,
    updatedAt: null,
    vault: createEmptyVault(),
    selectedSubjectId: null,
    conflict: false,
    isSaving: false,
    hasUnsavedChanges: false,
    error: '',
  });

  useEffect(() => {
    writeLocalGrades(localGrades);
  }, [localGrades]);

  const cloudMode = syncState.unlocked;

  useEffect(() => {
    if (!cloudMode) {
      return;
    }
    if (!syncState.selectedSubjectId && syncState.vault.subjects[0]?.id) {
      setSyncState((current) => ({ ...current, selectedSubjectId: current.vault.subjects[0]?.id || null }));
    }
  }, [cloudMode, syncState.selectedSubjectId, syncState.vault.subjects]);

  const selectedSubject = useMemo(
    () => syncState.vault.subjects.find((subject) => subject.id === syncState.selectedSubjectId) || null,
    [syncState.selectedSubjectId, syncState.vault.subjects]
  );
  const activeGrades = cloudMode ? selectedSubject?.grades || [] : localGrades;
  const activeAverage = useMemo(() => calculateAverageFromGrades(activeGrades), [activeGrades]);
  const targetOutcome = useMemo(
    () => (targetRequested ? calculateRequiredGrade(activeGrades, targetForm.target, targetForm.nextWeight) : null),
    [activeGrades, targetForm.nextWeight, targetForm.target, targetRequested]
  );
  const overallSummary = useMemo(() => createOverallSummary(syncState.vault.subjects), [syncState.vault.subjects]);
  const syncStatusLabel = createSyncStateLabel(syncState);

  function updateVault(mutator) {
    setSyncState((current) => {
      const nextVault = cloneValue(current.vault);
      mutator(nextVault);
      return {
        ...current,
        vault: normalizeVault(nextVault),
        updatedAt: new Date().toISOString(),
        conflict: false,
        hasUnsavedChanges: true,
        error: '',
      };
    });
  }

  function clearGradeForm() {
    setGradeForm({ title: '', value: '', weight: '1' });
  }

  function handleAddGrade(event) {
    event.preventDefault();
    const value = normalizeNumber(gradeForm.value);
    const weight = normalizeNumber(gradeForm.weight || '1');
    if (!isValidGradeValue(value)) {
      notify('Die Note muss zwischen 1 und 6 liegen.', 'error');
      return;
    }
    if (!isPositiveWeight(weight)) {
      notify('Die Gewichtung muss grösser als 0 sein.', 'error');
      return;
    }

    const grade = normalizeGrade({
      id: createId(),
      title: gradeForm.title.trim() || LOCAL_GRADE_FALLBACK_TITLE,
      value,
      weight,
      createdAt: new Date().toISOString(),
    });

    if (cloudMode) {
      if (!selectedSubject) {
        notify('Wähle zuerst ein Fach aus oder lege eines an.', 'error');
        return;
      }
      updateVault((vault) => {
        const subject = vault.subjects.find((item) => item.id === syncState.selectedSubjectId);
        if (subject) {
          subject.grades.push(grade);
        }
      });
    } else {
      setLocalGrades((current) => [...current, grade]);
    }

    clearGradeForm();
  }

  function handleDeleteGrade(gradeId) {
    if (cloudMode) {
      updateVault((vault) => {
        const subject = vault.subjects.find((item) => item.id === syncState.selectedSubjectId);
        if (subject) {
          subject.grades = subject.grades.filter((grade) => grade.id !== gradeId);
        }
      });
      return;
    }
    setLocalGrades((current) => current.filter((grade) => grade.id !== gradeId));
  }

  function handleSaveEdit() {
    const value = normalizeNumber(editDraft?.value);
    const weight = normalizeNumber(editDraft?.weight);
    if (!editDraft || !isValidGradeValue(value) || !isPositiveWeight(weight)) {
      notify('Bitte gib eine gültige Note und Gewichtung ein.', 'error');
      return;
    }

    const nextGrade = normalizeGrade({
      ...editDraft,
      value,
      weight,
      title: editDraft.title?.trim() || LOCAL_GRADE_FALLBACK_TITLE,
    });

    if (cloudMode) {
      updateVault((vault) => {
        const subject = vault.subjects.find((item) => item.id === syncState.selectedSubjectId);
        if (!subject) {
          return;
        }
        subject.grades = subject.grades.map((grade) => (grade.id === nextGrade.id ? nextGrade : grade));
      });
    } else {
      setLocalGrades((current) => current.map((grade) => (grade.id === nextGrade.id ? nextGrade : grade)));
    }

    setEditDraft(null);
  }

  async function handleSaveVault() {
    if (!syncState.unlocked || syncState.isSaving || syncState.conflict) {
      return;
    }

    setSyncState((current) => ({ ...current, isSaving: true, error: '' }));
    try {
      const encrypted = await encryptGradeVault(syncState.vault, syncState.password);
      const response = await putGradeVault(encrypted, syncState.revision);
      setSyncState((current) => ({
        ...current,
        revision: response.data.revision,
        updatedAt: response.data.updated_at,
        hasUnsavedChanges: false,
        isSaving: false,
        error: '',
      }));
      notify('Noten in der Cloud gespeichert.', 'success');
    } catch (error) {
      if (error.status === 409) {
        setSyncState((current) => ({
          ...current,
          conflict: true,
          isSaving: false,
          error: 'Der Serverstand wurde auf einem anderen Gerät geändert.',
        }));
        setConflictOpen(true);
        notify('Konflikt erkannt. Bitte entscheide, wie der Serverstand behandelt werden soll.', 'error');
        return;
      }
      setSyncState((current) => ({
        ...current,
        isSaving: false,
        error: 'Der Cloudsync konnte nicht gespeichert werden.',
      }));
      notify('Der Cloudsync konnte nicht gespeichert werden.', 'error');
    }
  }

  async function handleUnlockSync(event) {
    event.preventDefault();
    if (!syncPassword || syncPassword.length < 8) {
      setSyncState((current) => ({
        ...current,
        error: 'Bitte gib ein Sync-Passwort mit mindestens 8 Zeichen ein.',
      }));
      return;
    }

    try {
      const response = await getGradeVault();
      const data = response.data || {};
      setDeviceSyncEnabled(true);

      if (data.vault_json) {
        const encrypted = typeof data.vault_json === 'string' ? JSON.parse(data.vault_json) : data.vault_json;
        const vault = normalizeVault(await decryptGradeVault(encrypted, syncPassword));
        setSyncState((current) => ({
          ...current,
          enabledOnDevice: true,
          unlocked: true,
          password: syncPassword,
          revision: Number(data.revision) || 0,
          updatedAt: data.updated_at || null,
          vault,
          selectedSubjectId: vault.subjects[0]?.id || null,
          conflict: false,
          hasUnsavedChanges: false,
          error: '',
        }));
        notify('Cloudsync entsperrt.', 'success');
      } else {
        const vault = createEmptyVault();
        setSyncState((current) => ({
          ...current,
          enabledOnDevice: true,
          unlocked: true,
          password: syncPassword,
          revision: 0,
          updatedAt: null,
          vault,
          selectedSubjectId: null,
          conflict: false,
          hasUnsavedChanges: true,
          error: '',
        }));
        notify('Cloudsync aktiviert. Lege jetzt deine Fächer an.', 'success');
      }
      setSyncPassword('');
    } catch (error) {
      setSyncState((current) => ({
        ...current,
        unlocked: false,
        error:
          error.message === 'wrong_sync_password'
            ? 'Das Sync-Passwort ist falsch oder der Tresor konnte nicht entschlüsselt werden.'
            : error.status === 401
              ? 'Bitte melde dich zuerst in HWM an.'
              : 'Der Cloudsync ist momentan nicht erreichbar.',
      }));
    }
  }

  async function performReloadFromCloud() {
    const password = syncState.password || syncPassword;
    if (!password) {
      setSyncState((current) => ({
        ...current,
        error: 'Bitte gib dein Sync-Passwort ein, um den Serverstand zu laden.',
      }));
      setSyncModalOpen(true);
      return;
    }

    try {
      const response = await getGradeVault();
      const data = response.data || {};
      if (!data.vault_json) {
        setSyncState((current) => ({ ...current, error: 'Auf dem Server ist kein verschlüsselter Notenstand vorhanden.' }));
        return;
      }
      const encrypted = typeof data.vault_json === 'string' ? JSON.parse(data.vault_json) : data.vault_json;
      const vault = normalizeVault(await decryptGradeVault(encrypted, password));
      setSyncState((current) => ({
        ...current,
        enabledOnDevice: true,
        unlocked: true,
        password,
        revision: Number(data.revision) || 0,
        updatedAt: data.updated_at || null,
        vault,
        selectedSubjectId: vault.subjects.find((subject) => subject.id === current.selectedSubjectId)?.id || vault.subjects[0]?.id || null,
        conflict: false,
        hasUnsavedChanges: false,
        error: '',
      }));
      notify('Serverstand neu geladen.', 'success');
    } catch (error) {
      setSyncState((current) => ({
        ...current,
        error: error.message === 'wrong_sync_password' ? 'Das Sync-Passwort ist falsch.' : 'Der Serverstand konnte nicht geladen werden.',
      }));
    }
  }

  function handleReloadRequest() {
    if (syncState.hasUnsavedChanges || syncState.conflict) {
      setConflictOpen(true);
      return;
    }
    performReloadFromCloud();
  }

  function handleDisableSyncOnDevice() {
    setDeviceSyncEnabled(false);
    setSyncState({
      enabledOnDevice: false,
      unlocked: false,
      password: '',
      revision: 0,
      updatedAt: null,
      vault: createEmptyVault(),
      selectedSubjectId: null,
      conflict: false,
      isSaving: false,
      hasUnsavedChanges: false,
      error: '',
    });
    setSyncModalOpen(false);
    notify('Cloudsync auf diesem Gerät deaktiviert.', 'info');
  }

  async function handleDeleteServerVault() {
    try {
      await deleteGradeVault();
      handleDisableSyncOnDevice();
      notify('Der Server-Tresor wurde gelöscht.', 'success');
    } catch {
      setSyncState((current) => ({ ...current, error: 'Der Server-Tresor konnte nicht gelöscht werden.' }));
    }
  }

  function handleAddSubject(event) {
    event.preventDefault();
    const name = subjectDraft.name.trim();
    if (!name) {
      notify('Bitte gib einen Fachnamen ein.', 'error');
      return;
    }
    const subject = normalizeSubject({
      id: createId(),
      name,
      shortName: subjectDraft.shortName.trim(),
      grades: [],
    });
    updateVault((vault) => {
      vault.subjects.push(subject);
    });
    setSyncState((current) => ({ ...current, selectedSubjectId: subject.id }));
    setSubjectDraft({ name: '', shortName: '' });
  }

  function handleDeleteSubject(subjectId) {
    updateVault((vault) => {
      vault.subjects = vault.subjects.filter((subject) => subject.id !== subjectId);
    });
    setSyncState((current) => {
      const remaining = current.vault.subjects.filter((subject) => subject.id !== subjectId);
      return {
        ...current,
        selectedSubjectId: remaining[0]?.id || null,
      };
    });
  }

  const recentChanges = [...activeGrades].slice(-4).reverse();
  const selectedSubjectAverage = selectedSubject ? calculateSubjectAverage(selectedSubject) : null;
  const trendPoints = buildTrendPoints(activeGrades);
  const currentTrend = trendPoints.length >= 2
    ? trendPoints[trendPoints.length - 1].average - trendPoints[trendPoints.length - 2].average
    : 0;
  const bestGrade = activeGrades.length ? Math.max(...activeGrades.map((grade) => grade.value)) : null;
  const goalAverage = isValidGradeValue(normalizeNumber(targetForm.target)) ? normalizeNumber(targetForm.target) : 5;
  const isOnCourse = Number.isFinite(activeAverage) ? activeAverage >= goalAverage : false;

  return (
    <>
      <main className="grade-calculator grade-calculator--page" id="main">
        <section className="grade-calculator__shell">
          <header className="grade-calculator__hero">
            <div className="grade-calculator__hero-copy">
              <h1 className="grade-calculator__title">
                Notenrechner
              </h1>
              <p className="grade-calculator__lead">
                Verwalte deine schulischen Leistungen mit akademischer Präzision. Berechne deinen Durchschnitt, plane Zielnoten und behalte deine akademische Entwicklung im Blick.
              </p>
            </div>

            <div className="grade-calculator__hero-actions">
              <div className={`grade-sync-badge${cloudMode ? ' is-active' : ''}`}>
                <span className="grade-sync-badge__dot" aria-hidden="true"></span>
                <span>{cloudMode ? 'Cloudsync aktiv' : 'Lokaler Modus'}</span>
              </div>
              {cloudMode ? (
                <div className="grade-calculator__hero-button-row">
                  <>
                    <button type="button" className="grade-calculator__button grade-calculator__button--secondary" onClick={handleReloadRequest}>
                      Neu laden
                    </button>
                    <button type="button" className="grade-calculator__button grade-calculator__button--primary" onClick={handleSaveVault}>
                      In Cloud speichern
                    </button>
                  </>
                </div>
              ) : null}
              {cloudMode ? <div className={`grade-sync-state${syncState.error ? ' is-error' : ''}`}>{syncStatusLabel}</div> : null}
            </div>
          </header>

          <div className="grade-calculator__content">
            <div className="grade-calculator__main-column">
              {cloudMode ? (
                <section className="grade-panel grade-panel--compact transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/60 border border-white/20 hover:border-blue-200/50">
                  <div className="grade-panel__header">
                    <div>
                      <h2>Fach auswählen</h2>
                      <p>Alle Inhalte reagieren auf das aktuell gewählte Fach.</p>
                    </div>
                  </div>
                  <div className="grade-calculator__subject-row">
                    <select
                      className="grade-calculator__select transition-shadow duration-200 hover:shadow-sm focus:shadow-md"
                      value={syncState.selectedSubjectId || ''}
                      onChange={(event) => setSyncState((current) => ({ ...current, selectedSubjectId: event.target.value || null }))}
                    >
                      {syncState.vault.subjects.length ? null : <option value="">Kein Fach vorhanden</option>}
                      {syncState.vault.subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.shortName ? `${subject.name} (${subject.shortName})` : subject.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="grade-calculator__button grade-calculator__button--secondary transition-transform duration-200 hover:scale-105" onClick={() => setSyncModalOpen(true)}>
                      Fächer verwalten
                    </button>
                  </div>
                </section>
              ) : null}

              <section className="grade-panel grade-panel--compact transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/60 border border-white/20 hover:border-blue-200/50">
                <div className="grade-panel__header">
                  <div>
                    <h2>Neue Note hinzufügen</h2>
                    <p>{cloudMode ? 'Die Note wird dem aktuell ausgewählten Fach zugeordnet.' : 'Einträge werden nur lokal in deinem Browser gespeichert.'}</p>
                  </div>
                </div>
                <form className="grade-calculator__grade-form group" onSubmit={handleAddGrade}>
                  <label className="grade-calculator__field">
                    <span>Bezeichnung</span>
                    <input
                      className="grade-calculator__input"
                      type="text"
                      placeholder="z.B. Mathe Klausur 1"
                      value={gradeForm.title}
                      onChange={(event) => setGradeForm((current) => ({ ...current, title: event.target.value }))}
                    />
                  </label>
                  <label className="grade-calculator__field">
                    <span>Note (1-6)</span>
                    <input
                      className="grade-calculator__input"
                      type="number"
                      min="1"
                      max="6"
                      step="0.01"
                      placeholder="Wert"
                      value={gradeForm.value}
                      onChange={(event) => setGradeForm((current) => ({ ...current, value: event.target.value }))}
                    />
                  </label>
                  <label className="grade-calculator__field">
                    <span>Gewicht</span>
                    <input
                      className="grade-calculator__input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="1"
                      value={gradeForm.weight}
                      onChange={(event) => setGradeForm((current) => ({ ...current, weight: event.target.value }))}
                    />
                  </label>
                  <button type="submit" className="grade-calculator__button grade-calculator__button--primary grade-calculator__add-button" aria-label="Note hinzufügen">
                    +
                  </button>
                </form>
              </section>

              <section className="grade-panel grade-panel--list">
                <div className="grade-panel__header">
                  <div>
                    <h2>Erfasste Noten</h2>
                    <p>{cloudMode && selectedSubject ? `Aktuelles Fach: ${selectedSubject.name}` : 'Letzte 12 Monate'}</p>
                  </div>
                  <button type="button" className="grade-calculator__trend-pill" onClick={() => setTrendOpen(true)}>
                    <span aria-hidden="true">↗</span> Trend: {formatSignedNumber(currentTrend)}
                  </button>
                </div>
                <TrendChart grades={activeGrades} />
                <GradeList grades={activeGrades} onEdit={setEditDraft} onDelete={handleDeleteGrade} />
              </section>
            </div>

            <aside className="grade-summary" aria-label="Ergebnisbereich">
              <section className="grade-summary__current-card">
                <span className="grade-summary__kicker">{cloudMode ? 'Fachschnitt aktuell' : 'Aktueller Schnitt'}</span>
                <div className="grade-summary__average">
                  <strong>{formatNumber(activeAverage)}</strong>
                  <span aria-hidden="true">⌃</span>
                </div>
                <p>
                  {isOnCourse
                    ? `Du bist auf Kurs für dein Semesterziel von ${formatNumber(goalAverage, 1)}.`
                    : `Plane deine nächste Prüfung für dein Semesterziel von ${formatNumber(goalAverage, 1)}.`}
                </p>
                <div className="grade-summary__current-stats">
                  <div>
                    <span>Beste Note</span>
                    <strong>{formatNumber(bestGrade, 1)}</strong>
                  </div>
                  <div>
                    <span>Anzahl Noten</span>
                    <strong>{activeGrades.length}</strong>
                  </div>
                </div>
              </section>

              <section className="grade-summary__card grade-summary__target-card">
                <div className="grade-summary__header">
                  <h2>Wunschschnitt</h2>
                </div>
                <form
                  className="grade-summary__target-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setTargetRequested(true);
                  }}
                >
                  <label className="grade-calculator__field">
                    <span>Ziel-Durchschnitt</span>
                    <input
                      className="grade-calculator__input"
                      type="number"
                      min="1"
                      max="6"
                      step="0.01"
                      placeholder="z.B. 5.0"
                      value={targetForm.target}
                      onChange={(event) => setTargetForm((current) => ({ ...current, target: event.target.value }))}
                    />
                  </label>
                  <label className="grade-calculator__field grade-calculator__field--subtle">
                    <span>Gewicht nächste Prüfung</span>
                    <input
                      className="grade-calculator__input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="1"
                      value={targetForm.nextWeight}
                      onChange={(event) => setTargetForm((current) => ({ ...current, nextWeight: event.target.value }))}
                    />
                  </label>
                  <div className={`grade-summary__result${targetOutcome?.state === 'unreachable' ? ' is-warning' : ''}`}>
                    {!targetRequested || targetOutcome?.state === 'empty' ? (
                      <>
                        <span>5.3</span>
                        <p>benötigt in der nächsten Prüfung.</p>
                      </>
                    ) : null}
                    {targetOutcome?.state === 'invalid' ? <p>Bitte gib einen gültigen Zielschnitt und eine gültige Gewichtung ein.</p> : null}
                    {targetOutcome?.state === 'ready' ? (
                      <>
                        <span>{formatNumber(targetOutcome.value, 1)}</span>
                        <p>benötigt in der nächsten Prüfung.</p>
                      </>
                    ) : null}
                    {targetOutcome?.state === 'unreachable' ? <p>Dieser Zielschnitt ist mit der angegebenen Gewichtung nicht erreichbar.</p> : null}
                  </div>
                  <button type="submit" className="grade-calculator__button grade-calculator__button--primary">
                    Berechnung aktualisieren
                  </button>
                </form>
              </section>

              <section className="grade-summary__study-card" aria-label="Organisation">
                <div className="grade-summary__study-screen" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <strong>"Organisation ist das halbe Studium."</strong>
              </section>

              <section className="grade-summary__cloud-card">
                <div className="grade-summary__cloud-header">
                  <span className="grade-summary__cloud-icon" aria-hidden="true">☁</span>
                  <div>
                    <h2>Cloud-Modus</h2>
                    <p>{syncStatusLabel}</p>
                  </div>
                </div>
                <button type="button" className={`grade-summary__toggle${cloudMode ? ' is-on' : ''}`} onClick={() => setSyncModalOpen(true)}>
                  <span>Auto-Sync</span>
                  <i aria-hidden="true"></i>
                </button>
                {cloudMode ? (
                  <div className="grade-summary__cloud-metrics">
                    <SummaryMetric label="Gesamtschnitt" value={formatNumber(overallSummary.exactAverage)} />
                    <SummaryMetric
                      label="Mangelpunkte"
                      value={formatNumber(overallSummary.deficitPoints, 1)}
                      interactive
                      onClick={() => setDeficitOpen(true)}
                    />
                  </div>
                ) : null}
                <button type="button" className="grade-calculator__button grade-calculator__button--primary" onClick={() => setSyncModalOpen(true)}>
                  Konto verbinden
                </button>
                <button type="button" className="grade-calculator__button grade-calculator__button--secondary" onClick={cloudMode ? handleSaveVault : () => setSyncModalOpen(true)}>
                  Backup jetzt erstellen
                </button>
              </section>
            </aside>
          </div>
        </section>

        <Modal
          open={Boolean(editDraft)}
          title="Note bearbeiten"
          subtitle="Passe Name, Wert oder Gewichtung an, ohne die Hauptseite zu verlängern."
          onClose={() => setEditDraft(null)}
          actions={
            <>
              <button type="button" className="grade-calculator__button grade-calculator__button--secondary" onClick={() => setEditDraft(null)}>
                Abbrechen
              </button>
              <button type="button" className="grade-calculator__button grade-calculator__button--primary" onClick={handleSaveEdit}>
                Speichern
              </button>
            </>
          }
        >
          <div className="grade-modal__form">
            <input
              className="grade-calculator__input"
              type="text"
              placeholder="Name der Note"
              value={editDraft?.title || ''}
              onChange={(event) => setEditDraft((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              className="grade-calculator__input"
              type="number"
              min="1"
              max="6"
              step="0.01"
              placeholder="Note"
              value={editDraft?.value || ''}
              onChange={(event) => setEditDraft((current) => ({ ...current, value: event.target.value }))}
            />
            <input
              className="grade-calculator__input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Gewichtung"
              value={editDraft?.weight || ''}
              onChange={(event) => setEditDraft((current) => ({ ...current, weight: event.target.value }))}
            />
          </div>
        </Modal>

        <Modal
          open={trendOpen}
          wide
          title="Trend-Grafik"
          subtitle="Der Verlauf basiert nur auf den aktuell sichtbaren Noten in diesem Modus."
          onClose={() => setTrendOpen(false)}
          actions={
            <button type="button" className="grade-calculator__button grade-calculator__button--secondary" onClick={() => setTrendOpen(false)}>
              Schliessen
            </button>
          }
        >
          <div className="grade-trend-modal">
            <TrendChart grades={activeGrades} />
            <div className="grade-trend-modal__sidebar">
              <div className="grade-trend-modal__stat">
                <span>Aktueller Schnitt</span>
                <strong>{formatNumber(activeAverage)}</strong>
              </div>
              <div className="grade-trend-modal__history">
                <h3>Letzte Änderungen</h3>
                {recentChanges.length ? (
                  <ul>
                    {recentChanges.map((grade) => (
                      <li key={grade.id}>
                        <strong>{grade.title}</strong>
                        <span>
                          {formatNumber(grade.value)} bei Gewichtung {formatNumber(grade.weight, 1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Noch keine lokalen Änderungen vorhanden.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          open={syncModalOpen}
          wide
          title="Cloudsync-Einstellungen"
          subtitle="Deine Noten bleiben verschlüsselt. HWM kann den Inhalt des Tresors nicht lesen."
          onClose={() => setSyncModalOpen(false)}
          actions={
            <>
              <button type="button" className="grade-calculator__button grade-calculator__button--secondary" onClick={() => setSyncModalOpen(false)}>
                Schliessen
              </button>
              {cloudMode ? (
                <button type="button" className="grade-calculator__button grade-calculator__button--primary" onClick={handleSaveVault}>
                  In Cloud speichern
                </button>
              ) : null}
            </>
          }
        >
          <div className="flex flex-col gap-6 w-full max-w-full">
            <section className="bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                  <h3 className="text-lg font-semibold text-slate-800 m-0">Verbindung</h3>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full shadow-sm ${syncState.error ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                  {syncStatusLabel}
                </span>
              </div>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleUnlockSync}>
                <input
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white shadow-inner"
                  type="password"
                  minLength="8"
                  placeholder="Sync-Passwort"
                  autoComplete="new-password"
                  value={syncPassword}
                  onChange={(event) => setSyncPassword(event.target.value)}
                />
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-2">
                  {cloudMode ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                      Neu entsperren
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Cloudsync aktivieren
                    </>
                  )}
                </button>
              </form>
              <div className="mt-4 flex items-start gap-2.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <p className="text-sm text-slate-600 m-0">
                  Mit diesem Passwort werden deine Noten verschlüsselt. <strong className="text-slate-700 font-medium">Wenn du es vergisst, kann der Tresor nicht wiederhergestellt werden.</strong>
                </p>
              </div>
              {syncState.error ? (
                <div className="mt-3 flex items-start gap-2.5 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  <p className="text-sm m-0 font-medium">{syncState.error}</p>
                </div>
              ) : null}
              {cloudMode ? (
                <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-wrap gap-2.5">
                  <button type="button" className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 transition-all shadow-sm hover:shadow text-sm flex items-center gap-2" onClick={handleReloadRequest}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                    Neu laden
                  </button>
                  <button type="button" className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 transition-all shadow-sm hover:shadow text-sm flex items-center gap-2" onClick={handleDisableSyncOnDevice}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                    Gerät trennen
                  </button>
                  <button type="button" className="px-4 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 hover:border-red-600 font-medium rounded-lg transition-all shadow-sm text-sm ml-auto flex items-center gap-2" onClick={handleDeleteServerVault}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    Server-Tresor löschen
                  </button>
                </div>
              ) : null}
            </section>

            {cloudMode ? (
              <section className="bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    <h3 className="text-lg font-semibold text-slate-800 m-0">Fächer verwalten</h3>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-indigo-200">{syncState.vault.subjects.length} Fächer</span>
                </div>
                <form className="flex flex-col sm:flex-row gap-3 mb-5" onSubmit={handleAddSubject}>
                  <input
                    className="flex-[2] px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white shadow-inner"
                    type="text"
                    placeholder="Fachname (z.B. Mathematik)"
                    value={subjectDraft.name}
                    onChange={(event) => setSubjectDraft((current) => ({ ...current, name: event.target.value }))}
                  />
                  <input
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white shadow-inner"
                    type="text"
                    placeholder="Kürzel (opt.)"
                    value={subjectDraft.shortName}
                    onChange={(event) => setSubjectDraft((current) => ({ ...current, shortName: event.target.value }))}
                  />
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Hinzufügen
                  </button>
                </form>
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {syncState.vault.subjects.length ? (
                    syncState.vault.subjects.map((subject) => {
                      const average = calculateSubjectAverage(subject);
                      const isActive = subject.id === syncState.selectedSubjectId;
                      return (
                        <div key={subject.id} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${isActive ? 'bg-indigo-50/80 border-indigo-300 shadow-sm ring-1 ring-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}>
                          <button
                            type="button"
                            className="flex flex-col items-start text-left flex-1 group"
                            onClick={() => setSyncState((current) => ({ ...current, selectedSubjectId: subject.id }))}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <strong className={`font-semibold text-base transition-colors ${isActive ? 'text-indigo-900' : 'text-slate-700 group-hover:text-indigo-600'}`}>{subject.name}</strong>
                              {subject.shortName ? <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>{subject.shortName}</span> : null}
                              {isActive ? <span className="ml-auto flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span> : null}
                            </div>
                            <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                              <span className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                {subject.grades.length} Noten
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                                Schnitt: <span className={`font-semibold ${average >= 4 ? 'text-emerald-600' : average ? 'text-red-600' : 'text-slate-500'}`}>{formatNumber(average)}</span>
                              </span>
                            </div>
                          </button>
                          <button
                            type="button"
                            className="ml-3 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 shrink-0"
                            onClick={() => handleDeleteSubject(subject.id)}
                            title="Fach löschen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                      </div>
                      <p className="text-slate-700 font-semibold mb-1">Noch keine Fächer vorhanden</p>
                      <p className="text-sm text-slate-500 max-w-xs">Lege dein erstes Fach an, damit der Cloudsync-Modus genutzt werden kann.</p>
                    </div>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </Modal>

        <Modal
          open={conflictOpen}
          title="Konfliktlösung"
          subtitle="Beim Neu-Laden könnten lokale Änderungen überschrieben werden."
          onClose={() => setConflictOpen(false)}
          actions={
            <>
              <button type="button" className="grade-calculator__button grade-calculator__button--secondary" onClick={() => setConflictOpen(false)}>
                Abbrechen
              </button>
              <button
                type="button"
                className="grade-calculator__button grade-calculator__button--primary"
                onClick={() => {
                  setConflictOpen(false);
                  performReloadFromCloud();
                }}
              >
                Serverstand laden
              </button>
            </>
          }
        >
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 text-amber-600 p-2 rounded-full shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-amber-900 m-0">Nicht gespeicherte Änderungen</p>
                <p className="text-amber-800 text-sm leading-relaxed m-0">
                  Wenn du jetzt neu lädst, wird der aktuelle verschlüsselte Stand vom Server übernommen. <strong className="font-bold text-amber-900">Nicht gespeicherte lokale Änderungen im Cloudsync-Modus gehen dabei unwiderruflich verloren.</strong>
                </p>
                <p className="text-amber-700/80 text-xs m-0 pt-1">
                  Tipp: Erstelle vorab lokal ein Backup deiner Noten oder versuche, sie in der Cloud zu speichern, falls du deine Änderungen behalten möchtest.
                </p>
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          open={deficitOpen}
          title="Mangelpunkte im Detail"
          subtitle="Jede halbe Note unter 4.0 zählt als 0.5 Mangelpunkte."
          onClose={() => setDeficitOpen(false)}
          actions={
            <button type="button" className="grade-calculator__button grade-calculator__button--secondary" onClick={() => setDeficitOpen(false)}>
              Schliessen
            </button>
          }
        >
          <div className="w-full">
            {syncState.vault.subjects.length ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {syncState.vault.subjects.map((subject) => {
                  const average = calculateSubjectAverage(subject);
                  const rounded = average === null ? null : roundToHalf(average);
                  const deficit = rounded === null ? 0 : calculateDeficitPoints(rounded);
                  const hasDeficit = deficit > 0;
                  return (
                    <div key={subject.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${hasDeficit ? 'bg-red-50/50 border-red-200' : 'bg-slate-50/50 border-slate-200'}`}>
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className={`w-2 h-2 rounded-full ${hasDeficit ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <strong className={`font-medium ${hasDeficit ? 'text-red-900' : 'text-slate-800'}`}>{subject.name}</strong>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm ml-5 sm:ml-0">
                        <div className="flex flex-col px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Schnitt</span>
                          <span className="font-semibold text-slate-700">{formatNumber(average)}</span>
                        </div>
                        <div className="flex flex-col px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Gerundet</span>
                          <span className="font-semibold text-slate-700">{formatNumber(rounded, 1)}</span>
                        </div>
                        <div className={`flex flex-col px-3 py-1 rounded-lg border shadow-sm ${hasDeficit ? 'bg-red-100 border-red-200' : 'bg-white border-slate-100'}`}>
                          <span className={`text-[10px] uppercase tracking-wider font-bold ${hasDeficit ? 'text-red-500' : 'text-slate-400'}`}>Mangelpunkte</span>
                          <span className={`font-bold ${hasDeficit ? 'text-red-700' : 'text-slate-700'}`}>{formatNumber(deficit, 1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">Aktuell sind keine Fächer vorhanden.</p>
              </div>
            )}
          </div>
        </Modal>
      </main>
    </>
  );
}
