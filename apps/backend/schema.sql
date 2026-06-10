PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    class_id INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login_at TEXT,
    email_verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    last_class_change TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_class_id ON users(class_id);

CREATE TABLE IF NOT EXISTS email_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON email_verifications(code);

CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_code ON password_resets(code);

CREATE TABLE IF NOT EXISTS class_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL UNIQUE,
    source TEXT,
    import_hash TEXT,
    imported_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON admin_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_entity ON admin_audit_logs(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS news_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    body TEXT,
    link_url TEXT,
    is_published INTEGER NOT NULL DEFAULT 1,
    published_at TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_news_entries_public ON news_entries(is_published, published_at, created_at);

CREATE TABLE IF NOT EXISTS stundenplan_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    lesson_number INTEGER,
    start TEXT NOT NULL,
    "end" TEXT NOT NULL,
    fach TEXT NOT NULL,
    raum TEXT NOT NULL,
    group_name TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stundenplan_class_day ON stundenplan_entries(class_id, tag, start);

CREATE TABLE IF NOT EXISTS eintraege (
    id INTEGER NOT NULL,
    class_id TEXT NOT NULL DEFAULT 'default',
    beschreibung TEXT NOT NULL,
    datum TEXT NOT NULL,
    enddatum TEXT,
    startzeit TEXT,
    endzeit TEXT,
    typ TEXT NOT NULL,
    fach TEXT NOT NULL DEFAULT '',
    owner_user_id INTEGER,
    is_private INTEGER NOT NULL DEFAULT 0,
    is_done INTEGER NOT NULL DEFAULT 0,
    todo_status TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eintraege_id ON eintraege(id);
CREATE INDEX IF NOT EXISTS idx_eintraege_class_date ON eintraege(class_id, datum);
CREATE INDEX IF NOT EXISTS idx_eintraege_owner_private ON eintraege(owner_user_id, is_private);
CREATE INDEX IF NOT EXISTS idx_eintraege_private_date ON eintraege(is_private, datum);

CREATE TABLE IF NOT EXISTS todo_subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    owner_user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    is_done INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_todo_subtasks_owner_todo ON todo_subtasks(owner_user_id, todo_id, sort_order);

CREATE TABLE IF NOT EXISTS calendar_preferences (
    user_id INTEGER PRIMARY KEY,
    muted_subjects TEXT,
    show_completed_todos INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS encrypted_grade_vaults (
    user_id INTEGER PRIMARY KEY,
    vault_json TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weekly_preview_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    class_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    window_start TEXT NOT NULL,
    window_end TEXT NOT NULL,
    include_todos INTEGER NOT NULL DEFAULT 1,
    summary_markdown TEXT NOT NULL,
    source_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_weekly_preview_lookup ON weekly_preview_cache(user_id, class_id, locale, window_start, window_end, include_todos, expires_at);
CREATE INDEX IF NOT EXISTS idx_weekly_preview_user_created ON weekly_preview_cache(user_id, created_at);

CREATE TABLE IF NOT EXISTS timetable_exceptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    class_id INTEGER NOT NULL,
    group_name TEXT,
    date TEXT,
    start_date TEXT,
    end_date TEXT,
    lesson_number INTEGER,
    start_time TEXT,
    end_time TEXT,
    original_subject TEXT,
    new_subject TEXT,
    original_room TEXT,
    new_room TEXT,
    original_start_time TEXT,
    original_end_time TEXT,
    new_start_time TEXT,
    new_end_time TEXT,
    reason TEXT,
    created_by INTEGER,
    visible_to_students INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timetable_exceptions_lookup ON timetable_exceptions(class_id, start_date, end_date, date, type);
CREATE INDEX IF NOT EXISTS idx_timetable_exceptions_date ON timetable_exceptions(date);

CREATE TABLE IF NOT EXISTS school_holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    description TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_school_holidays_range ON school_holidays(start_date, end_date, type);

CREATE TABLE IF NOT EXISTS special_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT 'global',
    class_id INTEGER,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    mode TEXT NOT NULL,
    description TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_special_days_range ON special_days(scope, class_id, start_date, end_date, mode);

CREATE TABLE IF NOT EXISTS special_day_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    special_day_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    room TEXT,
    group_name TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (special_day_id) REFERENCES special_days(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_special_day_lessons_day ON special_day_lessons(special_day_id, class_id, sort_order);

INSERT OR IGNORE INTO classes (id, slug, title, description, is_active, created_at, updated_at)
VALUES (1, 'default', 'Standardklasse', 'Standardklasse fuer lokale Daten', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
