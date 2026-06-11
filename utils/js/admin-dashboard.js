import { createTable, createDialog, createForm } from './admin-shared.js';

const API_BASE = (() => {
  const base = 'https://hwm-api.akzuwo.ch';
  if (typeof window !== 'undefined') {
    window.__HM_RESOLVED_API_BASE__ = base;
    window.hmResolveApiBase = () => base;
  }
  return base;
})();

const SESSION_STORAGE_KEY = 'hm.session';

const TRANSLATIONS = {
  de: {
    title: 'Admin-Dashboard',
    subtitle: 'Verwalte Nutzer, Rollen, Klassen und Stundenpläne.',
    nav: {
      users: 'Nutzer',
      classes: 'Klassen',
      schedules: 'Stundenpläne',
    },
    create: {
      users: 'Neuen Nutzer anlegen',
      classes: 'Neue Klasse anlegen',
      schedules: 'Stundenplan importieren',
    },
    buttons: {
      edit: 'Bearbeiten',
      delete: 'Löschen',
      cancel: 'Abbrechen',
      save: 'Speichern',
      viewLogs: 'API-Logs anzeigen',
      hideLogs: 'API-Logs verbergen',
      downloadLogs: 'API-Logs herunterladen',
      refreshLogs: 'Aktualisieren',
      import: 'Importieren',
    },
    confirmDelete: 'Soll dieser Eintrag wirklich gelöscht werden?',
    table: {
      email: 'E-Mail',
      role: 'Rolle',
      classId: 'Klasse',
      classSlug: 'Klassen-Kurzname',
      status: 'Status',
      updatedAt: 'Aktualisiert',
      createdAt: 'Erstellt',
      classTitle: 'Klassenname',
      source: 'Quelle',
      importHash: 'Import-Hash',
      importedAt: 'Importiert am',
    },
    fields: {
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      passwordNew: 'Neues Passwort',
      role: 'Rolle',
      classId: 'Klassen-ID',
      isActive: 'Aktiv',
      slug: 'Kurzname',
      title: 'Titel',
      description: 'Beschreibung',
      source: 'Quelle',
      importHash: 'Import-Hash',
      importedAt: 'Importiert am',
      classIdentifier: 'Klassen-ID oder -Slug',
      file: 'Datei',
    },
    help: {
      passwordOptional: 'Leer lassen, um das Passwort unverändert zu lassen.',
      classIdentifier: 'Gib die ID oder den Slug der Klasse an.',
    },
    status: {
      active: 'Aktiv',
      inactive: 'Inaktiv',
    },
    roles: {
      admin: 'Administrator',
      teacher: 'Lehrkraft',
      class_admin: 'Klassen-Admin',
      student: 'Schüler',
    },
    messages: {
      created: 'Erfolgreich erstellt.',
      updated: 'Änderungen gespeichert.',
      deleted: 'Eintrag gelöscht.',
      loadFailed: 'Daten konnten nicht geladen werden.',
      unauthorized: 'Bitte erneut anmelden.',
      unknownError: 'Es ist ein unbekannter Fehler aufgetreten.',
      logsDownloaded: 'Protokolle heruntergeladen.',
      logsFailed: 'Protokolle konnten nicht heruntergeladen werden.',
      fileRequired: 'Bitte eine Datei auswählen.',
      classIdentifierRequired: 'Bitte eine Klassen-ID oder einen Slug angeben.',
      scheduleImported: (count, hash) => `${count} Stunden importiert (Hash: ${hash}).`,
    },
    logs: {
      title: 'API-Protokolle',
      linesLabel: 'Zeilen',
      loading: 'Protokolle werden geladen …',
      missing: 'Die Logdatei wurde nicht gefunden.',
      missingHint: 'Sobald Einträge vorhanden sind, erscheinen sie hier.',
      truncated: (lines) => `Es werden die letzten ${lines} Zeilen angezeigt.`,
      source: (value) => `Quelle: ${value}`,
      lastUpdated: (value) => `Aktualisiert: ${value}`,
      empty: 'Keine Logeinträge vorhanden.',
    },
    empty: 'Keine Daten vorhanden.',
    pagination: {
      summary: (page, pages, total) => `Seite ${page} von ${pages} (${total} Einträge)`
    },
  },
  en: {
    title: 'Admin Dashboard',
    subtitle: 'Manage users, roles, classes, and schedules.',
    nav: {
      users: 'Users',
      classes: 'Classes',
      schedules: 'Schedules',
    },
    create: {
      users: 'Create user',
      classes: 'Create class',
      schedules: 'Import schedule',
    },
    buttons: {
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      viewLogs: 'View API logs',
      hideLogs: 'Hide API logs',
      downloadLogs: 'Download API logs',
      refreshLogs: 'Refresh',
      import: 'Import',
    },
    confirmDelete: 'Are you sure you want to delete this item?',
    table: {
      email: 'Email',
      role: 'Role',
      classId: 'Class',
      classSlug: 'Class slug',
      status: 'Status',
      updatedAt: 'Updated',
      createdAt: 'Created',
      classTitle: 'Class name',
      source: 'Source',
      importHash: 'Import hash',
      importedAt: 'Imported at',
    },
    fields: {
      email: 'Email address',
      password: 'Password',
      passwordNew: 'New password',
      role: 'Role',
      classId: 'Class ID',
      isActive: 'Active',
      slug: 'Slug',
      title: 'Title',
      description: 'Description',
      source: 'Source',
      importHash: 'Import hash',
      importedAt: 'Imported at',
      classIdentifier: 'Class ID or slug',
      file: 'File',
    },
    help: {
      passwordOptional: 'Leave blank to keep the current password.',
      classIdentifier: 'Provide the class ID or slug.',
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
    },
    roles: {
      admin: 'Administrator',
      teacher: 'Teacher',
      class_admin: 'Class admin',
      student: 'Student',
    },
    messages: {
      created: 'Created successfully.',
      updated: 'Changes saved.',
      deleted: 'Entry deleted.',
      loadFailed: 'Failed to load data.',
      unauthorized: 'Please sign in again.',
      unknownError: 'An unknown error occurred.',
      logsDownloaded: 'Logs downloaded.',
      logsFailed: 'Unable to download logs.',
      fileRequired: 'Please choose a file.',
      classIdentifierRequired: 'Please provide a class ID or slug.',
      scheduleImported: (count, hash) => `Imported ${count} lessons (hash: ${hash}).`,
    },
    logs: {
      title: 'API logs',
      linesLabel: 'Lines',
      loading: 'Loading logs…',
      missing: 'Log file not found.',
      missingHint: 'The logs will appear here once entries are available.',
      truncated: (lines) => `Showing the latest ${lines} lines.`,
      source: (value) => `Source: ${value}`,
      lastUpdated: (value) => `Last updated: ${value}`,
      empty: 'No log entries yet.',
    },
    empty: 'No data available.',
    pagination: {
      summary: (page, pages, total) => `Page ${page} of ${pages} (${total} items)`
    },
  },
  fr: {
    title: 'Tableau de bord administrateur',
    subtitle: 'Gérez les utilisateurs, les rôles, les classes et les horaires.',
    nav: {
      users: 'Utilisateurs',
      classes: 'Classes',
      schedules: 'Horaires',
    },
    create: {
      users: 'Créer un utilisateur',
      classes: 'Créer une classe',
      schedules: 'Importer un horaire',
    },
    buttons: {
      edit: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      viewLogs: 'Afficher les journaux API',
      hideLogs: 'Masquer les journaux API',
      downloadLogs: 'Télécharger les journaux API',
      refreshLogs: 'Actualiser',
      import: 'Importer',
    },
    confirmDelete: 'Voulez-vous vraiment supprimer cet élément ?',
    table: {
      email: 'E-mail',
      role: 'Rôle',
      classId: 'Classe',
      classSlug: 'Slug de classe',
      status: 'Statut',
      updatedAt: 'Mis à jour',
      createdAt: 'Créé',
      classTitle: 'Nom de la classe',
      source: 'Source',
      importHash: 'Hash d’import',
      importedAt: 'Importé le',
    },
    fields: {
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      passwordNew: 'Nouveau mot de passe',
      role: 'Rôle',
      classId: 'ID de classe',
      isActive: 'Actif',
      slug: 'Identifiant',
      title: 'Titre',
      description: 'Description',
      source: 'Source',
      importHash: 'Hash d’import',
      importedAt: 'Importé le',
      classIdentifier: 'ID ou slug de classe',
      file: 'Fichier',
    },
    help: {
      passwordOptional: 'Laissez vide pour conserver le mot de passe actuel.',
      classIdentifier: 'Indiquez l’ID ou le slug de la classe.',
    },
    status: {
      active: 'Actif',
      inactive: 'Inactif',
    },
    roles: {
      admin: 'Administrateur',
      teacher: 'Enseignant',
      class_admin: 'Admin de classe',
      student: 'Élève',
    },
    messages: {
      created: 'Création effectuée.',
      updated: 'Modifications enregistrées.',
      deleted: 'Élément supprimé.',
      loadFailed: 'Impossible de charger les données.',
      unauthorized: 'Veuillez vous reconnecter.',
      unknownError: 'Une erreur inconnue est survenue.',
      logsDownloaded: 'Journaux téléchargés.',
      logsFailed: 'Impossible de télécharger les journaux.',
      fileRequired: 'Veuillez sélectionner un fichier.',
      classIdentifierRequired: 'Veuillez indiquer un ID ou un slug de classe.',
      scheduleImported: (count, hash) => `${count} cours importés (hash : ${hash}).`,
    },
    logs: {
      title: 'Journaux de l’API',
      linesLabel: 'Lignes',
      loading: 'Chargement des journaux…',
      missing: 'Fichier journal introuvable.',
      missingHint: 'Les journaux apparaîtront ici lorsqu’ils seront disponibles.',
      truncated: (lines) => `Affichage des ${lines} dernières lignes.`,
      source: (value) => `Source : ${value}`,
      lastUpdated: (value) => `Dernière mise à jour : ${value}`,
      empty: 'Aucune entrée de journal pour le moment.',
    },
    empty: 'Aucune donnée disponible.',
    pagination: {
      summary: (page, pages, total) => `Page ${page} sur ${pages} (${total} éléments)`
    },
  },
  it: {
    title: 'Pannello di amministrazione',
    subtitle: 'Gestisci utenti, ruoli, classi e orari.',
    nav: {
      users: 'Utenti',
      classes: 'Classi',
      schedules: 'Orari',
    },
    create: {
      users: 'Crea utente',
      classes: 'Crea classe',
      schedules: 'Importa orario',
    },
    buttons: {
      edit: 'Modifica',
      delete: 'Elimina',
      cancel: 'Annulla',
      save: 'Salva',
      viewLogs: 'Mostra log API',
      hideLogs: 'Nascondi log API',
      downloadLogs: 'Scarica i log API',
      refreshLogs: 'Aggiorna',
      import: 'Importa',
    },
    confirmDelete: 'Eliminare veramente questo elemento?',
    table: {
      email: 'Email',
      role: 'Ruolo',
      classId: 'Classe',
      classSlug: 'Slug classe',
      status: 'Stato',
      updatedAt: 'Aggiornato',
      createdAt: 'Creato',
      classTitle: 'Nome classe',
      source: 'Fonte',
      importHash: 'Hash importazione',
      importedAt: 'Importato il',
    },
    fields: {
      email: 'Indirizzo email',
      password: 'Password',
      passwordNew: 'Nuova password',
      role: 'Ruolo',
      classId: 'ID classe',
      isActive: 'Attivo',
      slug: 'Slug',
      title: 'Titolo',
      description: 'Descrizione',
      source: 'Fonte',
      importHash: 'Hash importazione',
      importedAt: 'Importato il',
      classIdentifier: 'ID o slug della classe',
      file: 'File',
    },
    help: {
      passwordOptional: 'Lascia vuoto per mantenere la password attuale.',
      classIdentifier: 'Indica l’ID o lo slug della classe.',
    },
    status: {
      active: 'Attivo',
      inactive: 'Inattivo',
    },
    roles: {
      admin: 'Amministratore',
      teacher: 'Docente',
      class_admin: 'Admin di classe',
      student: 'Studente',
    },
    messages: {
      created: 'Creato correttamente.',
      updated: 'Modifiche salvate.',
      deleted: 'Elemento eliminato.',
      loadFailed: 'Impossibile caricare i dati.',
      unauthorized: 'Effettua di nuovo l’accesso.',
      unknownError: 'Si è verificato un errore sconosciuto.',
      logsDownloaded: 'Log scaricati.',
      logsFailed: 'Impossibile scaricare i log.',
      fileRequired: 'Seleziona un file.',
      classIdentifierRequired: 'Indica un ID o uno slug di classe.',
      scheduleImported: (count, hash) => `${count} lezioni importate (hash: ${hash}).`,
    },
    logs: {
      title: 'Log API',
      linesLabel: 'Righe',
      loading: 'Caricamento dei log…',
      missing: 'File di log non trovato.',
      missingHint: 'Quando saranno disponibili, i log verranno mostrati qui.',
      truncated: (lines) => `Visualizzate le ultime ${lines} righe.`,
      source: (value) => `Origine: ${value}`,
      lastUpdated: (value) => `Ultimo aggiornamento: ${value}`,
      empty: 'Nessuna voce di log al momento.',
    },
    empty: 'Nessun dato disponibile.',
    pagination: {
      summary: (page, pages, total) => `Pagina ${page} di ${pages} (${total} elementi)`
    },
  },
};

const LOG_LINE_DEFAULT = 500;
const LOG_LINE_MIN = 50;
const LOG_LINE_MAX = 5000;
const LOG_LINE_STEP = 50;

function getTranslations() {
  const lang = document.documentElement.lang?.toLowerCase() || 'en';
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

function localeForDate() {
  const lang = document.documentElement.lang?.toLowerCase() || 'en';
  switch (lang) {
    case 'de':
      return 'de-DE';
    case 'fr':
      return 'fr-FR';
    case 'it':
      return 'it-IT';
    default:
      return 'en-US';
  }
}

function formatDate(value, locale) {
  if (!value) {
    return '–';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '–';
  }
  return date.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function sanitizeLogLines(value) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
    return LOG_LINE_DEFAULT;
  }
  const clamped = Math.min(Math.max(Math.round(numeric), LOG_LINE_MIN), LOG_LINE_MAX);
  return clamped;
}

function createLogsSection(translations) {
  const section = document.createElement('section');
  section.className = 'admin-dashboard__logs';

  const header = document.createElement('div');
  header.className = 'admin-dashboard__logs-header';

  const title = document.createElement('h2');
  title.textContent = translations.logs.title;
  title.className = 'admin-dashboard__logs-title';

  const controls = document.createElement('div');
  controls.className = 'admin-dashboard__logs-controls';

  const linesLabel = document.createElement('label');
  linesLabel.className = 'admin-dashboard__logs-lines';
  linesLabel.textContent = translations.logs.linesLabel;

  const linesInput = document.createElement('input');
  linesInput.type = 'number';
  linesInput.className = 'admin-dashboard__logs-lines-input';
  linesInput.min = String(LOG_LINE_MIN);
  linesInput.max = String(LOG_LINE_MAX);
  linesInput.step = String(LOG_LINE_STEP);
  linesInput.value = String(LOG_LINE_DEFAULT);
  linesInput.inputMode = 'numeric';
  linesInput.pattern = '\\d*';
  linesInput.setAttribute('aria-label', translations.logs.linesLabel);

  linesLabel.appendChild(linesInput);

  const refreshButton = createActionButton(translations.buttons.refreshLogs);
  refreshButton.classList.add('admin-dashboard__logs-refresh');

  controls.append(linesLabel, refreshButton);

  header.append(title, controls);

  const meta = document.createElement('div');
  meta.className = 'admin-dashboard__logs-meta';

  const source = document.createElement('span');
  source.className = 'admin-dashboard__logs-source';

  const updated = document.createElement('span');
  updated.className = 'admin-dashboard__logs-updated';

  meta.append(source, updated);

  const status = document.createElement('div');
  status.className = 'admin-dashboard__logs-status';

  const content = document.createElement('div');
  content.className = 'admin-dashboard__logs-content';
  content.setAttribute('role', 'log');
  content.setAttribute('aria-live', 'polite');
  content.setAttribute('tabindex', '0');

  section.append(header, meta, status, content);

  return {
    element: section,
    linesInput,
    refreshButton,
    controls,
    status,
    source,
    updated,
    content,
  };
}

function resolveUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const suffix = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${suffix}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(resolveUrl(url), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload;
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = {};
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText;
    const error = new Error(message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  if (payload && typeof payload.status === 'string' && payload.status !== 'ok') {
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return payload;
}

function loadStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage?.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function isSessionAdmin(session) {
  if (!session) {
    return false;
  }
  if (typeof session.isAdmin === 'boolean') {
    return session.isAdmin;
  }
  const role = String(session.role || '').toLowerCase();
  return role === 'admin';
}

function createMessageArea() {
  const element = document.createElement('div');
  element.className = 'admin-message';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');

  return {
    element,
    show(type, text) {
      element.textContent = text;
      element.dataset.type = type;
      element.hidden = false;
    },
    clear() {
      element.textContent = '';
      element.hidden = true;
      delete element.dataset.type;
    },
  };
}

function createPaginationControls(translations) {
  const container = document.createElement('div');
  container.className = 'admin-pagination';

  const info = document.createElement('div');
  info.className = 'admin-pagination__info';

  const buttons = document.createElement('div');
  buttons.className = 'admin-pagination__buttons';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'admin-button admin-button--ghost';
  prev.textContent = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'admin-button admin-button--ghost';
  next.textContent = '›';

  buttons.append(prev, next);
  container.append(info, buttons);

  return {
    element: container,
    info,
    prev,
    next,
    update({ page, pageSize, total }) {
      const pages = Math.max(1, Math.ceil(total / pageSize));
      info.textContent = translations.pagination.summary(page, pages, total);
      prev.disabled = page <= 1;
      next.disabled = page >= pages;
    },
  };
}

function createActionButton(label, variant = 'ghost') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = variant === 'ghost' ? 'admin-button admin-button--ghost' : 'admin-button';
  button.textContent = label;
  return button;
}

function sanitizeUserPayload(values) {
  const payload = { ...values };
  if (payload.class_id === null || payload.class_id === undefined || payload.class_id === '') {
    delete payload.class_id;
  } else {
    const numericClassId = Number(payload.class_id);
    if (Number.isNaN(numericClassId)) {
      delete payload.class_id;
    } else {
      payload.class_id = numericClassId;
    }
  }
  if (!payload.password) {
    delete payload.password;
  }
  return payload;
}

function sanitizeSchedulePayload(values) {
  const payload = { ...values };
  if (payload.class_id === null) {
    delete payload.class_id;
  }
  return payload;
}

function buildDashboard(root) {
  const t = getTranslations();
  const locale = localeForDate();

  const messageArea = createMessageArea();

  const header = document.createElement('header');
  header.className = 'admin-dashboard__header';
  header.innerHTML = `
    <div>
      <h1>${t.title}</h1>
      <p>${t.subtitle}</p>
    </div>
  `;

  const layout = document.createElement('div');
  layout.className = 'admin-dashboard__layout';

  const sidebar = document.createElement('aside');
  sidebar.className = 'admin-dashboard__sidebar';

  const sidebarTitle = document.createElement('h2');
  sidebarTitle.className = 'admin-dashboard__sidebar-title';
  sidebarTitle.textContent = 'Bereiche';

  const nav = document.createElement('nav');
  nav.className = 'admin-dashboard__nav';
  nav.setAttribute('role', 'tablist');

  sidebar.append(sidebarTitle, nav);

  const content = document.createElement('section');
  content.className = 'admin-dashboard__content';

  const mobileNav = document.createElement('nav');
  mobileNav.className = 'admin-dashboard__mobile-nav';
  mobileNav.setAttribute('role', 'tablist');

  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'admin-dashboard__section-header';

  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'admin-dashboard__section-title';

  const sectionActions = document.createElement('div');
  sectionActions.className = 'admin-dashboard__section-actions';

  sectionHeader.append(sectionTitle, sectionActions);

  const sectionControls = document.createElement('div');
  sectionControls.className = 'admin-dashboard__section-controls';

  const logsSection = createLogsSection(t);
  const logsPanel = logsSection.element;
  const logsLinesInput = logsSection.linesInput;
  const logsRefreshButton = logsSection.refreshButton;
  const logsControls = logsSection.controls;
  const logsStatus = logsSection.status;
  const logsSource = logsSection.source;
  const logsUpdated = logsSection.updated;
  const logsContent = logsSection.content;

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'admin-dashboard__table';

  const pagination = createPaginationControls(t);

  const downloadLogsButton = createActionButton(t.buttons.downloadLogs);
  downloadLogsButton.classList.add('admin-dashboard__logs-download');
  logsControls.append(downloadLogsButton);

  const createButton = createActionButton(t.create.users);
  sectionActions.append(createButton);

  content.append(
    mobileNav,
    sectionHeader,
    sectionControls,
    logsPanel,
    tableWrapper,
    pagination.element,
    messageArea.element,
  );

  layout.append(sidebar, content);
  root.append(header, layout);

  const scheduleImportFields = [
    {
      name: 'class_identifier',
      label: t.fields.classIdentifier,
      placeholder: t.fields.classIdentifier,
      required: true,
      helpText: t.help.classIdentifier,
    },
    {
      name: 'file',
      type: 'file',
      label: t.fields.file,
      required: true,
      accept: 'application/json,.json',
    },
  ];

  const resources = {
    users: {
      key: 'users',
      label: t.nav.users,
      columns: [
        { key: 'email', label: t.table.email },
        { key: 'role', label: t.table.role, render: (row) => t.roles[row.role] || row.role },
        {
          key: 'class_slug',
          label: t.table.classSlug,
          render: (row) => row.class_slug || (row.class_id ? `#${row.class_id}` : '–'),
        },
        { key: 'is_active', label: t.table.status, render: (row) => (row.is_active ? t.status.active : t.status.inactive) },
        { key: 'updated_at', label: t.table.updatedAt, render: (row) => formatDate(row.updated_at, locale) },
      ],
      form: {
        create: [
          { name: 'email', type: 'email', label: t.fields.email, required: true },
          { name: 'password', type: 'password', label: t.fields.password, required: true },
          {
            name: 'role',
            type: 'select',
            label: t.fields.role,
            required: true,
            options: [
              { value: 'student', label: t.roles.student },
              { value: 'teacher', label: t.roles.teacher },
              { value: 'class_admin', label: t.roles.class_admin },
              { value: 'admin', label: t.roles.admin },
            ],
            defaultValue: 'student',
          },
          {
            name: 'class_id',
            type: 'select',
            label: t.fields.classId,
            allowEmptyOption: true,
            options: [],
          },
          { name: 'is_active', type: 'checkbox', label: t.fields.isActive, defaultValue: true },
        ],
        edit: [
          { name: 'email', type: 'email', label: t.fields.email, required: true },
          { name: 'password', type: 'password', label: t.fields.passwordNew, helpText: t.help.passwordOptional },
          {
            name: 'role',
            type: 'select',
            label: t.fields.role,
            required: true,
            options: [
              { value: 'student', label: t.roles.student },
              { value: 'teacher', label: t.roles.teacher },
              { value: 'class_admin', label: t.roles.class_admin },
              { value: 'admin', label: t.roles.admin },
            ],
          },
          {
            name: 'class_id',
            type: 'select',
            label: t.fields.classId,
            allowEmptyOption: true,
            options: [],
          },
          { name: 'is_active', type: 'checkbox', label: t.fields.isActive },
        ],
      },
      sanitize: sanitizeUserPayload,
    },
    classes: {
      key: 'classes',
      label: t.nav.classes,
      columns: [
        { key: 'slug', label: t.fields.slug },
        { key: 'title', label: t.fields.title },
        { key: 'description', label: t.fields.description },
        { key: 'is_active', label: t.table.status, render: (row) => (row.is_active ? t.status.active : t.status.inactive) },
        { key: 'updated_at', label: t.table.updatedAt, render: (row) => formatDate(row.updated_at, locale) },
      ],
      form: {
        create: [
          { name: 'slug', label: t.fields.slug, required: true },
          { name: 'title', label: t.fields.title, required: true },
          { name: 'description', type: 'textarea', label: t.fields.description },
          { name: 'is_active', type: 'checkbox', label: t.fields.isActive, defaultValue: true },
        ],
        edit: [
          { name: 'slug', label: t.fields.slug, required: true },
          { name: 'title', label: t.fields.title, required: true },
          { name: 'description', type: 'textarea', label: t.fields.description },
          { name: 'is_active', type: 'checkbox', label: t.fields.isActive },
        ],
      },
      sanitize: (values) => values,
    },
    schedules: {
      key: 'schedules',
      label: t.nav.schedules,
      columns: [
        { key: 'class_id', label: t.table.classId },
        { key: 'class_title', label: t.table.classTitle },
        { key: 'source', label: t.table.source },
        { key: 'import_hash', label: t.table.importHash },
        { key: 'imported_at', label: t.table.importedAt, render: (row) => formatDate(row.imported_at, locale) },
      ],
      form: {
        create: scheduleImportFields,
        edit: [
          { name: 'class_id', type: 'number', label: t.fields.classId, min: 1 },
          { name: 'source', label: t.fields.source },
          { name: 'import_hash', label: t.fields.importHash },
          { name: 'imported_at', type: 'datetime-local', label: t.fields.importedAt },
        ],
      },
      importForm: scheduleImportFields,
      sanitize: sanitizeSchedulePayload,
    },
  };

  const table = createTable([
    ...resources.users.columns,
    { label: '', render: () => '' },
  ], { emptyMessage: t.empty });
  tableWrapper.appendChild(table.element);

  const sections = [
    { key: 'users', label: t.nav.users, type: 'resource' },
    { key: 'classes', label: t.nav.classes, type: 'resource' },
    { key: 'schedules', label: t.nav.schedules, type: 'resource' },
    { key: 'logs', label: t.logs.title, type: 'logs' },
  ];

  const state = {
    active: 'users',
    page: 1,
    pageSize: 10,
    total: 0,
    data: [],
    authorized: true,
    classes: [],
    classesLoaded: false,
    logs: {
      visible: false,
      loading: false,
      lines: sanitizeLogLines(logsLinesInput.value),
      truncated: false,
      missing: false,
      content: '',
      source: '',
      lastUpdated: null,
      error: '',
    },
  };

  logsLinesInput.value = String(state.logs.lines);

  let classesPromise = null;

  function setAuthorizationState(isAuthorized) {
    const allowed = Boolean(isAuthorized);
    state.authorized = allowed;
    createButton.disabled = !allowed;
    createButton.setAttribute('aria-disabled', String(!allowed));
    downloadLogsButton.disabled = !allowed;
    downloadLogsButton.setAttribute('aria-disabled', String(!allowed));
    logsRefreshButton.disabled = !allowed || state.logs.loading;
    logsLinesInput.disabled = !allowed || state.logs.loading;
    nav.querySelectorAll('button').forEach((button) => {
      button.disabled = !allowed;
      button.setAttribute('aria-disabled', String(!allowed));
    });
    mobileNav.querySelectorAll('button').forEach((button) => {
      button.disabled = !allowed;
      button.setAttribute('aria-disabled', String(!allowed));
    });
    if (!allowed) {
      state.total = 0;
      state.data = [];
      state.classes = [];
      state.classesLoaded = false;
      table.setRows([]);
      pagination.update({ page: state.page, pageSize: state.pageSize, total: state.total });
      pagination.prev.disabled = true;
      pagination.next.disabled = true;
      setLogsVisibility(false);
      resetLogsData(true);
      logsLinesInput.value = String(state.logs.lines);
    }
    updateLogsUI();
  }

  function handleUnauthorized() {
    if (!state.authorized) {
      return;
    }
    setAuthorizationState(false);
    showMessage('error', t.messages.unauthorized);
  }

  function resetLogsData(resetLines = false) {
    if (resetLines) {
      state.logs.lines = LOG_LINE_DEFAULT;
    } else {
      state.logs.lines = sanitizeLogLines(state.logs.lines);
    }
    state.logs.loading = false;
    state.logs.truncated = false;
    state.logs.missing = false;
    state.logs.content = '';
    state.logs.source = '';
    state.logs.lastUpdated = null;
    state.logs.error = '';
  }

  function updateLogsUI() {
    const { logs } = state;
    logsPanel.hidden = !logs.visible;
    logsPanel.classList.toggle('is-loading', logs.loading);
    logsContent.setAttribute('aria-busy', logs.loading ? 'true' : 'false');
    logsLinesInput.value = String(sanitizeLogLines(logs.lines));
    logsRefreshButton.disabled = !state.authorized || logs.loading;
    logsLinesInput.disabled = !state.authorized || logs.loading;

    if (logs.source) {
      logsSource.textContent = t.logs.source(logs.source);
    } else {
      logsSource.textContent = '';
    }
    logsSource.style.display = logsSource.textContent ? '' : 'none';

    if (logs.lastUpdated instanceof Date && !Number.isNaN(logs.lastUpdated.getTime())) {
      const formatted = logs.lastUpdated.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
      logsUpdated.textContent = t.logs.lastUpdated(formatted);
    } else {
      logsUpdated.textContent = '';
    }
    logsUpdated.style.display = logsUpdated.textContent ? '' : 'none';

    logsStatus.textContent = '';
    logsStatus.classList.remove('is-error');

    if (logs.loading) {
      logsStatus.textContent = t.logs.loading;
    } else if (logs.error) {
      logsStatus.textContent = logs.error;
      logsStatus.classList.add('is-error');
    } else if (logs.missing) {
      const messages = [t.logs.missing, t.logs.missingHint].filter(Boolean);
      logsStatus.textContent = messages.join(' ');
    } else {
      const messages = [];
      if (logs.truncated) {
        messages.push(t.logs.truncated(logs.lines));
      }
      if (!logs.content) {
        messages.push(t.logs.empty);
      }
      logsStatus.textContent = messages.join(' ');
    }

    if (logs.missing) {
      logsContent.innerHTML = '';
    } else if (!logs.content) {
      logsContent.innerHTML = '';
    } else {
      renderLogs(logs.content);
    }
  }

  function renderLogs(text) {
    // clear
    logsContent.innerHTML = '';
    // split into lines and render each as a row with optional metadata
    const lines = String(text).split(/\r?\n/).filter((l) => l.length > 0);
    if (lines.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'admin-dashboard__log-empty';
      empty.textContent = t.logs.empty;
      logsContent.appendChild(empty);
      return;
    }

    const list = document.createElement('div');
    list.className = 'admin-dashboard__logs-list';

    const timeRegex = /^(\d{4}-\d{2}-\d{2}T[\d:.+\-Z]+)/; // ISO-ish
    const levelRegex = /\b(INFO|WARN|WARNING|ERROR|DEBUG)\b/;

    lines.forEach((line) => {
      const row = document.createElement('div');
      row.className = 'admin-dashboard__log-line';

      // try to extract timestamp
      let ts = '';
      const tsMatch = line.match(timeRegex);
      if (tsMatch) {
        ts = tsMatch[1];
      }

      // try to extract level
      let level = '';
      const lvlMatch = line.match(levelRegex);
      if (lvlMatch) {
        level = lvlMatch[1];
      }

      const meta = document.createElement('div');
      meta.className = 'admin-dashboard__log-meta';
      if (ts) {
        const tsEl = document.createElement('time');
        tsEl.className = 'admin-dashboard__log-timestamp';
        tsEl.dateTime = ts;
        try {
          tsEl.textContent = new Date(ts).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
        } catch (e) {
          tsEl.textContent = ts;
        }
        meta.appendChild(tsEl);
      }
      if (level) {
        const lvlEl = document.createElement('span');
        lvlEl.className = `admin-dashboard__log-level admin-dashboard__log-level--${level.toLowerCase()}`;
        lvlEl.textContent = level;
        meta.appendChild(lvlEl);
      }

      const message = document.createElement('div');
      message.className = 'admin-dashboard__log-message';
      // highlight common parts like HTTP method / path
      const methodPathMatch = line.match(/\b(POST|GET|PUT|DELETE|PATCH)\b\s+(\/[^\s]*)/i);
      if (methodPathMatch) {
        const method = methodPathMatch[1].toUpperCase();
        const path = methodPathMatch[2];
        const mp = document.createElement('div');
        mp.className = 'admin-dashboard__log-request';
        const mEl = document.createElement('span');
        mEl.className = 'admin-dashboard__log-request-method';
        mEl.textContent = method;
        const pEl = document.createElement('span');
        pEl.className = 'admin-dashboard__log-request-path';
        pEl.textContent = path;
        mp.appendChild(mEl);
        mp.appendChild(pEl);
        message.appendChild(mp);

        // rest of message
        const rest = line.replace(timeRegex, '').replace(methodPathMatch[0], '').trim();
        const restEl = document.createElement('div');
        restEl.className = 'admin-dashboard__log-rest';
        restEl.textContent = rest;
        message.appendChild(restEl);
      } else {
        message.textContent = line;
      }

      row.appendChild(meta);
      row.appendChild(message);
      list.appendChild(row);
    });

    logsContent.appendChild(list);
  }

  function setLogsVisibility(visible) {
    const nextVisible = Boolean(visible);
    if (state.logs.visible === nextVisible) {
      updateLogsUI();
      return;
    }
    state.logs.visible = nextVisible;
    updateLogsUI();
    if (nextVisible) {
      loadLogs(true);
    }
  }

  async function loadLogs(force = false) {
    if (!state.authorized) {
      return;
    }
    if (!state.logs.visible && !force) {
      return;
    }
    const lines = sanitizeLogLines(state.logs.lines);
    state.logs.lines = lines;
    state.logs.loading = true;
    state.logs.error = '';
    updateLogsUI();
    try {
      const response = await fetchJson(`/api/admin/logs?lines=${lines}`);
      const logsText = typeof response.logs === 'string' ? response.logs : '';
      state.logs.truncated = Boolean(response.truncated);
      state.logs.missing = Boolean(response.missing);
      state.logs.source = response.source || '';
      state.logs.content = state.logs.missing ? '' : logsText;
      state.logs.lastUpdated = new Date();
      showMessage();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
        return;
      }
      const message = error.message || t.messages.logsFailed;
      state.logs.error = message;
      showMessage('error', message);
    } finally {
      state.logs.loading = false;
      updateLogsUI();
    }
  }

  function buildClassLabel(klass = {}) {
    const slug = typeof klass.slug === 'string' ? klass.slug.trim() : '';
    const title = typeof klass.title === 'string' ? klass.title.trim() : '';
    if (slug && title) {
      return `${slug} – ${title}`;
    }
    if (slug) {
      return slug;
    }
    if (title) {
      return title;
    }
    if (klass.id != null) {
      return `#${klass.id}`;
    }
    return '';
  }

  function getClassOptions() {
    return state.classes.map((klass) => ({
      value: klass.id,
      label: buildClassLabel(klass),
    }));
  }

  async function loadClasses() {
    if (!state.authorized) {
      return;
    }
    let response;
    try {
      response = await fetchJson('/api/classes');
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
      }
      throw error;
    }
    if (!Array.isArray(response)) {
      state.classes = [];
      state.classesLoaded = true;
      return;
    }
    const normalized = response
      .map((item) => ({
        id: item.id,
        slug: item.slug || '',
        title: item.title || '',
      }))
      .sort((a, b) => buildClassLabel(a).localeCompare(buildClassLabel(b), undefined, { sensitivity: 'base' }));
    state.classes = normalized;
    state.classesLoaded = true;
  }

  function ensureClassesLoaded() {
    if (!state.authorized) {
      return Promise.resolve();
    }
    if (state.classesLoaded) {
      return Promise.resolve();
    }
    if (!classesPromise) {
      classesPromise = loadClasses()
        .catch((error) => {
          throw error;
        })
        .finally(() => {
          classesPromise = null;
        });
    }
    return classesPromise;
  }

  function prepareResourceForm(form, resource, initialData = {}) {
    if (!form || !resource || resource.key !== 'users') {
      return;
    }
    const selectedRaw = initialData.class_id;
    const hasSelected = selectedRaw !== null && selectedRaw !== undefined && selectedRaw !== '';
    const selectedValue = hasSelected ? String(selectedRaw) : '';
    const fallbackClass = {
      id: selectedRaw,
      slug: initialData.class_slug || '',
      title: initialData.class_title || '',
    };

    function applyOptions() {
      let options = getClassOptions();
      if (hasSelected) {
        const exists = options.some((option) => String(option.value) === selectedValue);
        if (!exists) {
          options = [...options, { value: selectedRaw, label: buildClassLabel(fallbackClass) }];
        }
      }
      form.updateOptions('class_id', options);
      if (hasSelected) {
        form.setValues({ class_id: selectedRaw });
      }
    }

    form.updateOptions('class_id', getClassOptions());
    if (hasSelected) {
      form.setValues({ class_id: selectedRaw });
    }

    ensureClassesLoaded().then(() => {
      applyOptions();
    }).catch(() => {});
  }

  const initialAuthorized = isSessionAdmin(loadStoredSession());
  setAuthorizationState(initialAuthorized);
  if (!initialAuthorized) {
    showMessage('error', t.messages.unauthorized);
  }

  if (initialAuthorized) {
    ensureClassesLoaded().catch(() => {});
  }

  function buildActionCell(resourceKey, row) {
    const actions = document.createElement('div');
    actions.className = 'admin-table__actions';
    const editButton = createActionButton(t.buttons.edit, 'ghost');
    editButton.addEventListener('click', () => openEditDialog(resourceKey, row));
    const deleteButton = createActionButton(t.buttons.delete, 'ghost');
    deleteButton.addEventListener('click', () => handleDelete(resourceKey, row));
    actions.append(editButton, deleteButton);
    return actions;
  }

  function configureTableColumns(resourceKey) {
    const resource = resources[resourceKey];
    table.setEmptyMessage(t.empty);
    const columns = [
      ...resource.columns,
      { label: '', render: (row) => buildActionCell(resourceKey, row) },
    ];
    table.setColumns(columns);
    table.setRows([]);
  }

  function updateNav() {
    nav.innerHTML = '';
    mobileNav.innerHTML = '';
    sections.forEach((section) => {
      const button = createActionButton(section.label, 'ghost');
      button.classList.toggle('is-active', section.key === state.active);
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', section.key === state.active ? 'true' : 'false');
      button.disabled = !state.authorized;
      button.setAttribute('aria-disabled', String(!state.authorized));
      button.addEventListener('click', () => {
        if (state.active === section.key) {
          return;
        }
        if (!state.authorized) {
          showMessage('error', t.messages.unauthorized);
          return;
        }
        state.active = section.key;
        state.page = 1;
        updateNav();
        onResourceChanged();
      });
      nav.appendChild(button);

      const mobileButton = createActionButton(section.label, 'ghost');
      mobileButton.classList.toggle('is-active', section.key === state.active);
      mobileButton.setAttribute('role', 'tab');
      mobileButton.setAttribute('aria-selected', section.key === state.active ? 'true' : 'false');
      mobileButton.disabled = !state.authorized;
      mobileButton.setAttribute('aria-disabled', String(!state.authorized));
      mobileButton.addEventListener('click', () => {
        if (state.active === section.key) {
          return;
        }
        if (!state.authorized) {
          showMessage('error', t.messages.unauthorized);
          return;
        }
        state.active = section.key;
        state.page = 1;
        updateNav();
        onResourceChanged();
      });
      mobileNav.appendChild(mobileButton);
    });
  }

  function showMessage(type, text) {
    if (!text) {
      messageArea.clear();
      return;
    }
    messageArea.show(type, text);
    setTimeout(() => messageArea.clear(), 4000);
  }

  async function loadData() {
    const resource = resources[state.active];
    table.setLoading(true);
    showMessage();
    if (!state.authorized) {
      table.setRows([]);
      table.setLoading(false);
      return;
    }
    try {
      const response = await fetchJson(`/api/admin/${resource.key}?page=${state.page}&page_size=${state.pageSize}`);
      const rows = response.data || [];
      state.total = response.pagination?.total ?? rows.length;
      state.data = rows;
      table.setRows(rows);
      pagination.update({ page: state.page, pageSize: state.pageSize, total: state.total });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
      } else {
        showMessage('error', error.message || t.messages.loadFailed);
      }
      table.setRows([]);
    } finally {
      table.setLoading(false);
    }
  }

  function onResourceChanged() {
    const section = sections.find((item) => item.key === state.active);
    sectionTitle.textContent = section?.label || '';
    sectionHeader.hidden = section?.type === 'logs';
    sectionControls.hidden = true;
    sectionActions.innerHTML = '';
    logsPanel.hidden = true;
    tableWrapper.hidden = true;
    pagination.element.hidden = true;

    if (!section) {
      return;
    }

    if (section.type === 'logs') {
      setLogsVisibility(true);
      sectionActions.innerHTML = '';
      if (state.authorized) {
        loadLogs(true);
      }
      return;
    }

    setLogsVisibility(false);
    const resource = resources[section.key];
    createButton.textContent = t.create[section.key];
    sectionActions.append(createButton);
    sectionControls.hidden = false;
    tableWrapper.hidden = false;
    pagination.element.hidden = false;
    configureTableColumns(resource.key);
    if (resource.key === 'users') {
      ensureClassesLoaded().catch(() => {});
    }
    if (!state.authorized) {
      table.setRows([]);
      return;
    }
    if (resource.key === 'schedules') {
      loadSchedulesView().catch((err) => {
        showMessage('error', err?.message || t.messages.loadFailed);
        table.setRows([]);
      });
    } else {
      loadData();
    }
  }

  async function loadSchedulesView() {
    // Load classes and schedules, then present a per-class view indicating presence
    await ensureClassesLoaded();
    // fetch schedules (fetch a large page to include most schedules)
    let schedulesResp;
    try {
      schedulesResp = await fetchJson('/api/admin/schedules?page_size=1000');
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
        return;
      }
      throw error;
    }

    const scheduleRows = Array.isArray(schedulesResp.data) ? schedulesResp.data : [];
    const scheduleMap = new Map();
    scheduleRows.forEach((s) => {
      if (s && s.class_id) {
        scheduleMap.set(Number(s.class_id), s);
      }
    });

    const classRows = state.classes.map((klass) => ({
      id: klass.id,
      class_slug: klass.slug,
      class_title: klass.title,
      has_schedule: scheduleMap.has(klass.id),
      schedule: scheduleMap.get(klass.id) || null,
    }));

    // configure columns for class-centric schedule view
    const cols = [
      { key: 'class_slug', label: t.table.classSlug, render: (row) => buildClassLabel({ id: row.id, slug: row.class_slug, title: row.class_title }) },
      { key: 'has_schedule', label: t.table.status, render: (row) => {
        const badge = document.createElement('span');
        badge.textContent = row.has_schedule ? t.status.active : t.status.inactive;
        badge.className = row.has_schedule ? 'admin-badge admin-badge--ok' : 'admin-badge admin-badge--muted';
        return badge;
      }},
      { key: 'source', label: t.table.source, render: (row) => (row.schedule ? (row.schedule.source || '–') : '–') },
      { key: 'imported_at', label: t.table.importedAt, render: (row) => (row.schedule ? formatDate(row.schedule.imported_at, locale) : '–') },
      { label: '', render: (row) => {
        const actions = document.createElement('div');
        actions.className = 'admin-table__actions';

        const viewBtn = createActionButton('View', 'ghost');
        viewBtn.addEventListener('click', () => openScheduleEntriesDialog(row.id));
        actions.appendChild(viewBtn);

        if (row.has_schedule && row.schedule) {
          const editBtn = createActionButton(t.buttons.edit, 'ghost');
          editBtn.addEventListener('click', () => openScheduleEditDialog(row.schedule));
          actions.appendChild(editBtn);

          const delBtn = createActionButton(t.buttons.delete, 'ghost');
          delBtn.addEventListener('click', async () => {
            if (!confirm('Delete schedule for this class?')) return;
            try {
              await fetchJson(`/api/admin/classes/${row.id}/schedule`, { method: 'DELETE' });
              showMessage('success', 'Schedule deleted.');
              // refresh view
              loadSchedulesView().catch(() => {});
            } catch (error) {
              showMessage('error', error.message || 'Failed to delete schedule');
            }
          });
          actions.appendChild(delBtn);
        } else {
          const addBtn = createActionButton(t.buttons.import, 'ghost');
          addBtn.addEventListener('click', () => openScheduleCreateDialog(row.id));
          actions.appendChild(addBtn);
        }

        return actions;
      }},
    ];

    table.setColumns(cols);
    table.setRows(classRows);
  }

  function openScheduleEntriesDialog(classId) {
    const dialog = createDialog({ title: `Schedule entries — class #${classId}`, confirmLabel: t.buttons.cancel, cancelLabel: t.buttons.cancel });
    const container = document.createElement('div');
    container.textContent = 'Loading entries…';
    dialog.setContent(container);
    dialog.open();
    (async () => {
      try {
        const resp = await fetchJson(`/api/admin/schedule-entries?class_id=${classId}`);
        const rows = Array.isArray(resp.data) ? resp.data : [];
        container.innerHTML = '';
        if (!rows.length) {
          container.textContent = 'No entries.';
          return;
        }
        const list = document.createElement('ul');
        rows.forEach((r) => {
          const li = document.createElement('li');
          li.textContent = `${r.tag} ${r.start}–${r.end} ${r.fach || ''} ${r.raum || ''}`;
          list.appendChild(li);
        });
        container.appendChild(list);
      } catch (error) {
        container.textContent = error.message || 'Failed to load entries.';
      }
    })();
  }

  function openScheduleCreateDialog(classId) {
    const fields = [
      { name: 'class_id', type: 'select', label: t.fields.classIdentifier, options: [{ value: classId, label: `#${classId}` }], required: true },
      { name: 'source', label: t.fields.source },
      { name: 'import_hash', label: t.table.importHash },
      { name: 'imported_at', type: 'datetime-local', label: t.table.importedAt },
    ];
    const dialog = createDialog({ title: t.create.schedules, confirmLabel: t.buttons.import, cancelLabel: t.buttons.cancel });
    const form = createForm(fields, { initialValues: { class_id: classId } });
    dialog.setContent(form.element);
    dialog.onConfirm(async () => {
      const values = form.getValues();
      try {
        await fetchJson('/api/admin/schedules', { method: 'POST', body: JSON.stringify(values) });
        showMessage('success', 'Schedule added.');
        loadSchedulesView().catch(() => {});
      } catch (error) {
        throw error;
      }
    });
    dialog.open();
  }

  function openScheduleEditDialog(schedule) {
    const fields = [
      { name: 'class_id', type: 'select', label: t.fields.classIdentifier, options: [{ value: schedule.class_id, label: buildClassLabel({ id: schedule.class_id, slug: schedule.class_slug, title: schedule.class_title }) }], required: true },
      { name: 'source', label: t.fields.source },
      { name: 'import_hash', label: t.table.importHash },
      { name: 'imported_at', type: 'datetime-local', label: t.table.importedAt },
    ];
    const dialog = createDialog({ title: t.buttons.edit + ' ' + buildClassLabel({ slug: schedule.class_slug, title: schedule.class_title }), confirmLabel: t.buttons.save, cancelLabel: t.buttons.cancel });
    const form = createForm(fields, { initialValues: { class_id: schedule.class_id, source: schedule.source || '', import_hash: schedule.import_hash || '', imported_at: schedule.imported_at || null } });
    dialog.setContent(form.element);
    dialog.onConfirm(async () => {
      const values = form.getValues();
      try {
        await fetchJson(`/api/admin/schedules/${schedule.id}`, { method: 'PUT', body: JSON.stringify(values) });
        showMessage('success', 'Schedule updated.');
        loadSchedulesView().catch(() => {});
      } catch (error) {
        throw error;
      }
    });
    dialog.open();
  }

  function openFormDialog(resourceKey, mode, initialData = {}) {
    const resource = resources[resourceKey];
    const fields = resource.form[mode];
    const dialog = createDialog({
      title: mode === 'create' ? resource.label : `${resource.label} – ${t.buttons.edit}`,
      confirmLabel: t.buttons.save,
      cancelLabel: t.buttons.cancel,
    });
    const form = createForm(fields, { initialValues: initialData });
    dialog.setContent(form.element);
    dialog.open();
    form.focusFirst();
    return { dialog, form, resource };
  }

  function openScheduleImportDialog() {
    const resource = resources.schedules;
    const dialog = createDialog({
      title: t.create.schedules,
      confirmLabel: t.buttons.import,
      cancelLabel: t.buttons.cancel,
    });
    const form = createForm(resource.importForm);
    dialog.setContent(form.element);
    dialog.open();
    form.focusFirst();
    dialog.onConfirm(async () => {
      const values = form.getValues();
      const classIdentifier = (values.class_identifier || '').trim();
      const file = values.file || null;
      if (!classIdentifier) {
        throw new Error(t.messages.classIdentifierRequired);
      }
      if (!file) {
        throw new Error(t.messages.fileRequired);
      }
      const formData = new FormData();
      formData.append('class_identifier', classIdentifier);
      formData.append('file', file, file.name || 'schedule.json');
      formData.append('source', 'admin_dashboard');
      let response;
      try {
        response = await fetch(resolveUrl('/api/admin/schedule-import'), {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
      }
      let payload = {};
      try {
        payload = await response.json();
      } catch (error) {
        payload = {};
      }
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        throw new Error(t.messages.unauthorized);
      }
      if (!response.ok) {
        const message = payload.message || response.statusText || t.messages.unknownError;
        throw new Error(message);
      }
      if (payload && typeof payload.status === 'string' && payload.status !== 'ok') {
        const message = payload.message || t.messages.unknownError;
        throw new Error(message);
      }
      const inserted = payload.inserted ?? 0;
      const hash = payload.import_hash ?? '–';
      await loadData();
      if (state.authorized) {
        showMessage('success', t.messages.scheduleImported(inserted, hash));
      }
    });
  }

  function refreshAfter(action, resourceKey) {
    switch (action) {
      case 'create':
        showMessage('success', t.messages.created);
        break;
      case 'update':
        showMessage('success', t.messages.updated);
        break;
      case 'delete':
        showMessage('success', t.messages.deleted);
        break;
      default:
        break;
    }
    loadData();
    if (resourceKey === 'classes') {
      state.classesLoaded = false;
      ensureClassesLoaded().catch(() => {});
    }
  }

  logsRefreshButton.addEventListener('click', () => {
    if (!state.authorized) {
      showMessage('error', t.messages.unauthorized);
      return;
    }
    loadLogs(true);
  });

  logsLinesInput.addEventListener('change', () => {
    const lines = sanitizeLogLines(logsLinesInput.value);
    state.logs.lines = lines;
    logsLinesInput.value = String(lines);
    if (state.logs.visible) {
      loadLogs(true);
    } else {
      updateLogsUI();
    }
  });

  createButton.addEventListener('click', () => {
    if (!state.authorized) {
      showMessage('error', t.messages.unauthorized);
      return;
    }
    if (state.active === 'schedules') {
      openScheduleImportDialog();
      return;
    }
    const { dialog, form, resource } = openFormDialog(state.active, 'create');
    prepareResourceForm(form, resource, {});
    dialog.onConfirm(async () => {
      const values = resource.sanitize(form.getValues());
      try {
        await fetchJson(`/api/admin/${resource.key}`, {
          method: 'POST',
          body: JSON.stringify(values),
        });
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          handleUnauthorized();
          throw new Error(t.messages.unauthorized);
        }
        throw error;
      }
      refreshAfter('create', resource.key);
    });
  });

  downloadLogsButton.addEventListener('click', async () => {
    if (!state.authorized) {
      showMessage('error', t.messages.unauthorized);
      return;
    }
    downloadLogsButton.disabled = true;
    try {
      const lines = sanitizeLogLines(state.logs.lines);
      state.logs.lines = lines;
      logsLinesInput.value = String(lines);
      const response = await fetchJson(`/api/admin/logs?lines=${lines}`);
      const logs = response.logs || '';
      const source = response.source || '';
      const truncated = Boolean(response.truncated);
      const missing = Boolean(response.missing);
      const fileName = source.split(/[/\\]/).filter(Boolean).pop()
        || `api-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
      const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      state.logs.truncated = truncated;
      state.logs.missing = missing;
      state.logs.source = source;
      state.logs.content = missing ? '' : logs;
      state.logs.lastUpdated = new Date();
      state.logs.error = '';
      updateLogsUI();
      showMessage('success', t.messages.logsDownloaded);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
      } else {
        const message = error.message || t.messages.logsFailed;
        state.logs.error = message;
        updateLogsUI();
        showMessage('error', message);
      }
    } finally {
      downloadLogsButton.disabled = !state.authorized;
    }
  });

  async function openEditDialog(resourceKey, row) {
    const { dialog, form, resource } = openFormDialog(resourceKey, 'edit', row);
    prepareResourceForm(form, resource, row);
    dialog.onConfirm(async () => {
      const values = resource.sanitize(form.getValues());
      try {
        await fetchJson(`/api/admin/${resource.key}/${row.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          handleUnauthorized();
          throw new Error(t.messages.unauthorized);
        }
        throw error;
      }
      refreshAfter('update', resource.key);
    });
  }

  async function handleDelete(resourceKey, row) {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }
    try {
      await fetchJson(`/api/admin/${resourceKey}/${row.id}`, { method: 'DELETE' });
      refreshAfter('delete', resourceKey);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
      } else {
        showMessage('error', error.message || t.messages.unknownError);
      }
    }
  }

  pagination.prev.addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      loadData();
    }
  });

  pagination.next.addEventListener('click', () => {
    const pages = Math.max(1, Math.ceil(state.total / state.pageSize));
    if (state.page < pages) {
      state.page += 1;
      loadData();
    }
  });

  updateNav();
  onResourceChanged();
}

function initDashboard() {
  const root = document.getElementById('admin-dashboard-root');
  if (!root) {
    return;
  }
  buildDashboard(root);
}

initDashboard();
