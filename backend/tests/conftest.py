import builtins
import datetime
import importlib
import io
import os
import sys
import time
from typing import Dict, List, Optional

import pytest

# Ensure app module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from auth import utils as auth_utils


class FakeCursor:
    def __init__(self, storage: Dict[str, object], dictionary: bool = False) -> None:
        self.storage = storage
        self.dictionary = dictionary
        self._rows: List[object] = []
        self.rowcount = 0
        self.lastrowid: Optional[int] = None

    @staticmethod
    def _schedule_matches_filter(entry: Dict[str, object]) -> bool:
        import_hash = str(entry.get('import_hash') or '').strip()
        source = str(entry.get('source') or '').strip().lower()
        return bool(import_hash) or '.json' in source

    def _prepare_rows(self, rows: List[Dict[str, object]], columns: List[str]) -> None:
        if self.dictionary:
            self._rows = [{col: row.get(col) for col in columns} for row in rows]
        else:
            self._rows = [tuple(row.get(col) for col in columns) for row in rows]

    def execute(self, query: str, params=None) -> None:  # pragma: no cover - shim
        normalized = " ".join(query.split()).lower()
        self._rows = []
        self.rowcount = 0
        self.lastrowid = None

        users: Dict[int, Dict[str, object]] = self.storage.setdefault('users', {})
        classes: Dict[int, Dict[str, object]] = self.storage.setdefault('classes', {})
        schedules: Dict[int, Dict[str, object]] = self.storage.setdefault('class_schedules', {})
        schedule_entries: List[Dict[str, object]] = self.storage.setdefault('stundenplan_entries', [])
        entries: List[Dict[str, object]] = self.storage.setdefault('eintraege', [])
        todo_subtasks: List[Dict[str, object]] = self.storage.setdefault('todo_subtasks', [])
        password_resets: List[Dict[str, object]] = self.storage.setdefault('password_resets', [])
        weekly_preview_cache: List[Dict[str, object]] = self.storage.setdefault('weekly_preview_cache', [])
        encrypted_grade_vaults: Dict[int, Dict[str, object]] = self.storage.setdefault('encrypted_grade_vaults', {})

        if normalized.startswith("select count(*) as total from users"):
            self._prepare_rows([
                {'total': len(users)}
            ], ['total'])
            return

        if normalized.startswith("select id, email, password_hash, is_active, email_verified_at, role from users where role='admin'"):
            admin = next((row for row in users.values() if row.get('role') == 'admin'), None)
            if not admin:
                self._rows = []
                return
            self._prepare_rows([
                {
                    'id': admin['id'],
                    'email': admin['email'],
                    'password_hash': admin['password_hash'],
                    'is_active': admin.get('is_active', 1),
                    'email_verified_at': admin.get('email_verified_at'),
                    'role': admin.get('role'),
                }
            ], ['id', 'email', 'password_hash', 'is_active', 'email_verified_at', 'role'])
            return

        if normalized.startswith("select id, email, password_hash, role, class_id, is_active, email_verified_at") and "where email=%s" in normalized:
            email = params[0] if params else None
            user_id = self.storage.setdefault('users_by_email', {}).get(email)
            if user_id is None:
                self._rows = []
                return
            user = users.get(user_id)
            if not user:
                self._rows = []
                return
            self._prepare_rows([
                {
                    'id': user['id'],
                    'email': user['email'],
                    'password_hash': user['password_hash'],
                    'role': user.get('role', 'student'),
                    'class_id': user.get('class_id'),
                    'is_active': user.get('is_active', 1),
                    'email_verified_at': user.get('email_verified_at'),
                }
            ], ['id', 'email', 'password_hash', 'role', 'class_id', 'is_active', 'email_verified_at'])
            return

        if (
            normalized.startswith("select id, email, role, class_id, is_active, email_verified_at")
            and "where id=%s" in normalized
        ):
            user_id = params[0] if params else None
            user = users.get(user_id)
            if not user:
                self._rows = []
                return
            self._prepare_rows([
                {
                    'id': user['id'],
                    'email': user['email'],
                    'role': user.get('role', 'student'),
                    'class_id': user.get('class_id'),
                    'is_active': user.get('is_active', 1),
                    'email_verified_at': user.get('email_verified_at'),
                }
            ], ['id', 'email', 'role', 'class_id', 'is_active', 'email_verified_at'])
            return

        if (
            normalized.startswith("select u.id, u.email, u.role, u.class_id")
            and "from users u" in normalized
            and "left join classes" in normalized
            and "order by u.id desc" in normalized
        ):
            limit, offset = params
            ordered = sorted(users.values(), key=lambda row: row['id'], reverse=True)
            subset = ordered[offset:offset + limit]
            rows = []
            for row in subset:
                class_info = classes.get(row.get('class_id'), {})
                rows.append(
                    {
                        'id': row['id'],
                        'email': row['email'],
                        'role': row.get('role', 'student'),
                        'class_id': row.get('class_id'),
                        'class_slug': class_info.get('slug'),
                        'is_active': row.get('is_active', 1),
                        'created_at': row['created_at'],
                        'updated_at': row['updated_at'],
                    }
                )
            self._prepare_rows(
                rows,
                ['id', 'email', 'role', 'class_id', 'class_slug', 'is_active', 'created_at', 'updated_at'],
            )
            return

        if (
            normalized.startswith("select u.id, u.email, u.role, u.class_id")
            and "from users u" in normalized
            and "where u.id=%s" in normalized
        ):
            user_id = params[0]
            user = users.get(user_id)
            if not user:
                self._rows = []
                return
            class_info = classes.get(user.get('class_id'), {})
            self._prepare_rows([
                {
                    'id': user['id'],
                    'email': user['email'],
                    'role': user.get('role', 'student'),
                    'class_id': user.get('class_id'),
                    'class_slug': class_info.get('slug'),
                    'is_active': user.get('is_active', 1),
                    'created_at': user['created_at'],
                    'updated_at': user['updated_at'],
                }
            ], ['id', 'email', 'role', 'class_id', 'class_slug', 'is_active', 'created_at', 'updated_at'])
            return

        if normalized.startswith("insert into users"):
            if len(params) == 6:
                email, password_hash, role, class_id, is_active, email_verified_at = params
                created_at = datetime.datetime.utcnow()
                updated_at = created_at
            else:
                email, password_hash, role, class_id, is_active, created_at, updated_at = params
                email_verified_at = None
            if email in self.storage.setdefault('users_by_email', {}):
                raise RuntimeError('duplicate email')
            new_id = self.storage.setdefault('next_ids', {}).setdefault('users', 1)
            self.storage['next_ids']['users'] = new_id + 1
            user_record = {
                'id': new_id,
                'email': email,
                'password_hash': password_hash,
                'role': role,
                'class_id': class_id,
                'is_active': is_active,
                'created_at': created_at,
                'updated_at': updated_at,
                'email_verified_at': email_verified_at,
            }
            users[new_id] = user_record
            self.storage['users_by_email'][email] = new_id
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("update users set last_login_at"):
            user_id = params[1]
            user = users.get(user_id)
            if user:
                user.setdefault('last_login_updates', []).append(params)
                user['updated_at'] = datetime.datetime.utcnow()
                self.rowcount = 1
            return

        if normalized.startswith("update users set email_verified_at"):
            email_verified_at, user_id = params
            user = users.get(user_id)
            if user:
                user['email_verified_at'] = email_verified_at
                user['updated_at'] = datetime.datetime.utcnow()
                self.rowcount = 1
            return

        if normalized.startswith("update users set"):
            set_part = query.split('SET', 1)[1].rsplit('WHERE', 1)[0]
            assignments = [segment.strip() for segment in set_part.split(',')]
            user_id = params[-1]
            user = users.get(user_id)
            if not user:
                self.rowcount = 0
                return
            for assignment, value in zip(assignments, params[:-1]):
                column = assignment.split('=')[0].strip().strip('`')
                if column == 'email':
                    old_email = user['email']
                    if old_email != value:
                        self.storage['users_by_email'].pop(old_email, None)
                        self.storage['users_by_email'][value] = user_id
                    user['email'] = value
                elif column == 'role':
                    user['role'] = value
                elif column == 'class_id':
                    user['class_id'] = value
                elif column == 'is_active':
                    user['is_active'] = value
                elif column == 'password_hash':
                    user['password_hash'] = value
            user['updated_at'] = datetime.datetime.utcnow()
            self.rowcount = 1
            return

        if normalized.startswith("delete from users where id=%s"):
            user_id = params[0]
            user = users.pop(user_id, None)
            if user:
                self.storage['users_by_email'].pop(user['email'], None)
                self.rowcount = 1
            return

        if normalized.startswith("select count(*) as total from classes"):
            self._prepare_rows([
                {'total': len(classes)}
            ], ['total'])
            return

        if normalized.startswith("select id, slug, title, description, is_active, created_at, updated_at from classes order by title asc"):
            limit, offset = params
            ordered = sorted(classes.values(), key=lambda row: row['title'])
            subset = ordered[offset:offset + limit]
            rows = [
                {
                    'id': row['id'],
                    'slug': row['slug'],
                    'title': row['title'],
                    'description': row.get('description'),
                    'is_active': row.get('is_active', 1),
                    'created_at': row['created_at'],
                    'updated_at': row['updated_at'],
                }
                for row in subset
            ]
            self._prepare_rows(rows, ['id', 'slug', 'title', 'description', 'is_active', 'created_at', 'updated_at'])
            return

        if normalized.startswith("select id, slug, title, description, is_active, created_at, updated_at from classes where id=%s"):
            class_id = params[0]
            cls = classes.get(class_id)
            if not cls:
                self._rows = []
                return
            self._prepare_rows([
                {
                    'id': cls['id'],
                    'slug': cls['slug'],
                    'title': cls['title'],
                    'description': cls.get('description'),
                    'is_active': cls.get('is_active', 1),
                    'created_at': cls['created_at'],
                    'updated_at': cls['updated_at'],
                }
            ], ['id', 'slug', 'title', 'description', 'is_active', 'created_at', 'updated_at'])
            return

        if normalized.startswith("select slug from classes where id=%s"):
            class_id = params[0]
            cls = classes.get(class_id)
            if not cls:
                self._rows = []
                return
            self._prepare_rows([
                {'slug': cls['slug']}
            ], ['slug'])
            return

        if normalized.startswith("select id from classes where id=%s"):
            class_id = params[0]
            if class_id in classes:
                self._prepare_rows([{'id': class_id}], ['id'])
            else:
                self._rows = []
            return

        if normalized.startswith("select id from classes where slug=%s"):
            slug = (params[0] or '').strip().lower()
            match = next(
                (
                    row
                    for row in classes.values()
                    if str(row.get('slug') or '').strip().lower() == slug
                ),
                None,
            )
            if match:
                self._prepare_rows([{'id': match['id']}], ['id'])
            else:
                self._rows = []
            return

        if normalized.startswith("insert into classes"):
            slug, title, description, is_active, created_at, updated_at = params
            new_id = self.storage.setdefault('next_ids', {}).setdefault('classes', 1)
            self.storage['next_ids']['classes'] = new_id + 1
            classes[new_id] = {
                'id': new_id,
                'slug': slug,
                'title': title,
                'description': description,
                'is_active': is_active,
                'created_at': created_at,
                'updated_at': updated_at,
            }
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("update classes set"):
            set_part = query.split('SET', 1)[1].rsplit('WHERE', 1)[0]
            assignments = [segment.strip() for segment in set_part.split(',')]
            class_id = params[-1]
            cls = classes.get(class_id)
            if not cls:
                self.rowcount = 0
                return
            for assignment, value in zip(assignments, params[:-1]):
                column = assignment.split('=')[0].strip().strip('`')
                cls[column] = value
            cls['updated_at'] = datetime.datetime.utcnow()
            self.rowcount = 1
            return

        if normalized.startswith("delete from classes where id=%s"):
            class_id = params[0]
            if classes.pop(class_id, None):
                self.rowcount = 1
            return

        if normalized.startswith("select count(*) as total from class_schedules"):
            matching = [entry for entry in schedules.values() if self._schedule_matches_filter(entry)]
            self._prepare_rows([
                {'total': len(matching)}
            ], ['total'])
            return

        if normalized.startswith("select cs.id, cs.class_id, cs.source, cs.import_hash, cs.imported_at") and "from class_schedules" in normalized:
            if params and len(params) == 3:
                _, limit, offset = params
            else:
                limit, offset = params
            ordered = sorted(
                [entry for entry in schedules.values() if self._schedule_matches_filter(entry)],
                key=lambda row: row['id'],
                reverse=True,
            )
            subset = ordered[offset:offset + limit]
            rows = []
            for entry in subset:
                class_info = classes.get(entry['class_id'], {})
                rows.append(
                    {
                        'id': entry['id'],
                        'class_id': entry['class_id'],
                        'source': entry.get('source'),
                        'import_hash': entry.get('import_hash'),
                        'imported_at': entry.get('imported_at'),
                        'created_at': entry['created_at'],
                        'updated_at': entry.get('updated_at', entry['created_at']),
                        'class_slug': class_info.get('slug'),
                        'class_title': class_info.get('title'),
                    }
                )
            self._prepare_rows(
                rows,
                ['id', 'class_id', 'source', 'import_hash', 'imported_at', 'created_at', 'updated_at', 'class_slug', 'class_title'],
            )
            return

        if normalized.startswith("select cs.id, cs.class_id, cs.source, cs.import_hash, cs.imported_at") and "where cs.id=%s" in normalized:
            schedule_id = params[0]
            entry = schedules.get(schedule_id)
            if not entry:
                self._rows = []
                return
            class_info = classes.get(entry['class_id'], {})
            self._prepare_rows(
                [
                    {
                        'id': entry['id'],
                        'class_id': entry['class_id'],
                        'source': entry.get('source'),
                        'import_hash': entry.get('import_hash'),
                        'imported_at': entry.get('imported_at'),
                        'created_at': entry['created_at'],
                        'updated_at': entry.get('updated_at', entry['created_at']),
                        'class_slug': class_info.get('slug'),
                        'class_title': class_info.get('title'),
                    }
                ],
                ['id', 'class_id', 'source', 'import_hash', 'imported_at', 'created_at', 'updated_at', 'class_slug', 'class_title'],
            )
            return

        if normalized.startswith("insert into class_schedules"):
            if len(params) == 6:
                class_id, source, import_hash, imported_at, created_at, updated_at = params
            else:
                class_id, source, import_hash, imported_at, created_at = params
                updated_at = created_at
            new_id = self.storage.setdefault('next_ids', {}).setdefault('class_schedules', 1)
            self.storage['next_ids']['class_schedules'] = new_id + 1
            schedules[new_id] = {
                'id': new_id,
                'class_id': class_id,
                'source': source,
                'import_hash': import_hash,
                'imported_at': imported_at,
                'created_at': created_at,
                'updated_at': updated_at,
            }
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("update class_schedules set"):
            set_part = query.split('SET', 1)[1].rsplit('WHERE', 1)[0]
            assignments = [segment.strip() for segment in set_part.split(',')]
            schedule_id = params[-1]
            entry = schedules.get(schedule_id)
            if not entry:
                self.rowcount = 0
                return
            for assignment, value in zip(assignments, params[:-1]):
                column = assignment.split('=')[0].strip().strip('`')
                entry[column] = value
            entry['updated_at'] = datetime.datetime.utcnow()
            self.rowcount = 1
            return

        if normalized.startswith("delete from class_schedules where id=%s"):
            schedule_id = params[0]
            if schedules.pop(schedule_id, None):
                self.rowcount = 1
            return

        if normalized.startswith("delete from class_schedules where class_id=%s"):
            class_id = params[0]
            removed = 0
            for schedule_id in list(schedules.keys()):
                if schedules[schedule_id].get('class_id') == class_id:
                    schedules.pop(schedule_id, None)
                    removed += 1
            self.rowcount = removed
            return

        if normalized.startswith("insert into admin_audit_logs"):
            actor_id, action, entity_type, entity_id, details = params
            log_id = self.storage.setdefault('next_ids', {}).setdefault('audit_logs', 1)
            self.storage['next_ids']['audit_logs'] = log_id + 1
            self.storage.setdefault('audit_logs', []).append(
                {
                    'id': log_id,
                    'actor_id': actor_id,
                    'action': action,
                    'entity_type': entity_type,
                    'entity_id': entity_id,
                    'details': details,
                }
            )
            self.lastrowid = log_id
            self.rowcount = 1
            return

        if normalized.startswith("insert into email_verifications"):
            if params is None:
                return
            if len(params) == 4:
                user_id, email, code, expires_at = params
                failed_attempts = 0
            else:
                user_id, email, code, expires_at, failed_attempts = params
            entries = self.storage.setdefault('verifications', [])
            verification_id = len(entries) + 1
            entries.append(
                {
                    'id': verification_id,
                    'user_id': user_id,
                    'email': email,
                    'code': code,
                    'expires_at': expires_at,
                    'failed_attempts': failed_attempts,
                }
            )
            self.lastrowid = verification_id
            self.rowcount = 1
            return

        if normalized.startswith("delete from email_verifications where user_id=%s"):
            user_id = params[0]
            entries = self.storage.setdefault('verifications', [])
            remaining = [entry for entry in entries if entry['user_id'] != user_id]
            self.storage['verifications'] = remaining
            self.rowcount = len(entries) - len(remaining)
            return

        if normalized.startswith("delete from email_verifications where id=%s"):
            verification_id = params[0]
            entries = self.storage.setdefault('verifications', [])
            remaining = [entry for entry in entries if entry['id'] != verification_id]
            self.storage['verifications'] = remaining
            self.rowcount = len(entries) - len(remaining)
            return

        if normalized.startswith("update email_verifications set failed_attempts"):
            failed_attempts, verification_id = params
            entries = self.storage.setdefault('verifications', [])
            for entry in entries:
                if entry['id'] == verification_id:
                    entry['failed_attempts'] = failed_attempts
                    break
            self.rowcount = 1
            return

        if normalized.startswith("insert into password_resets"):
            if len(params) == 4:
                user_id, email, code, expires_at = params
                used_at = None
            else:
                user_id, email, code, expires_at, used_at = params
            resets = self.storage.setdefault('password_resets', [])
            next_ids = self.storage.setdefault('next_ids', {})
            reset_id = next_ids.setdefault('password_resets', 1)
            next_ids['password_resets'] = reset_id + 1
            record = {
                'id': reset_id,
                'user_id': user_id,
                'email': email,
                'code': code,
                'expires_at': expires_at,
                'used_at': used_at,
                'created_at': datetime.datetime.utcnow(),
            }
            resets.append(record)
            self.lastrowid = reset_id
            self.rowcount = 1
            return

        if normalized.startswith("delete from password_resets where user_id=%s and id<>%s"):
            user_id, keep_id = params
            resets = self.storage.setdefault('password_resets', [])
            remaining = [entry for entry in resets if not (entry['user_id'] == user_id and entry['id'] != keep_id)]
            removed = len(resets) - len(remaining)
            self.storage['password_resets'] = remaining
            self.rowcount = removed
            return

        if normalized.startswith("delete from password_resets where user_id=%s"):
            user_id = params[0]
            resets = self.storage.setdefault('password_resets', [])
            remaining = [entry for entry in resets if entry['user_id'] != user_id]
            removed = len(resets) - len(remaining)
            self.storage['password_resets'] = remaining
            self.rowcount = removed
            return

        if normalized.startswith("delete from password_resets where id=%s"):
            reset_id = params[0]
            resets = self.storage.setdefault('password_resets', [])
            remaining = [entry for entry in resets if entry['id'] != reset_id]
            removed = len(resets) - len(remaining)
            self.storage['password_resets'] = remaining
            self.rowcount = removed
            return

        if normalized.startswith("update password_resets set used_at"):
            used_at, reset_id = params
            resets = self.storage.setdefault('password_resets', [])
            for entry in resets:
                if entry['id'] == reset_id:
                    entry['used_at'] = used_at
                    break
            self.rowcount = 1
            return

        if normalized.startswith("select id, user_id, email, code, expires_at, used_at from password_resets"):
            resets = self.storage.setdefault('password_resets', [])
            filtered = []
            if "where user_id=%s and code=%s" in normalized:
                user_id, code = params
                filtered = [
                    entry
                    for entry in resets
                    if entry['user_id'] == user_id and str(entry['code']) == str(code)
                ]
            elif "where user_id=%s" in normalized:
                user_id = params[0]
                filtered = [entry for entry in resets if entry['user_id'] == user_id]
            elif "where code=%s" in normalized:
                code = params[0]
                filtered = [entry for entry in resets if str(entry['code']) == str(code)]
            if filtered:
                filtered.sort(key=lambda item: item.get('created_at') or datetime.datetime.min, reverse=True)
                record = filtered[0]
                self._prepare_rows(
                    [
                        {
                            'id': record['id'],
                            'user_id': record['user_id'],
                            'email': record.get('email'),
                            'code': record.get('code'),
                            'expires_at': record.get('expires_at'),
                            'used_at': record.get('used_at'),
                        }
                    ],
                    ['id', 'user_id', 'email', 'code', 'expires_at', 'used_at'],
                )
            else:
                self._rows = []
            return

        if normalized.startswith("select id from users where id=%s"):
            user_id = params[0]
            if user_id in users:
                self._prepare_rows([{'id': user_id}], ['id'])
            else:
                self._rows = []
            return

        if normalized.startswith("select id, user_id, code, expires_at, failed_attempts from email_verifications"):
            user_id = params[0]
            entries = self.storage.setdefault('verifications', [])
            for entry in entries:
                if entry['user_id'] == user_id:
                    result = {
                        'id': entry['id'],
                        'user_id': entry['user_id'],
                        'code': entry['code'],
                        'expires_at': entry['expires_at'],
                        'failed_attempts': entry.get('failed_attempts', 0),
                    }
                    self._prepare_rows(
                        [result],
                        ['id', 'user_id', 'code', 'expires_at', 'failed_attempts'],
                    )
                    return
            self._rows = []
            return

        if normalized.startswith("select 1 from stundenplan_entries where class_id=%s"):
            class_id = params[0]
            if any(entry.get('class_id') == class_id for entry in schedule_entries):
                self._rows = [(1,)]
            else:
                self._rows = []
            return

        if normalized.startswith("select id, class_id, tag, lesson_number, start, `end`, fach, raum, group_name from stundenplan_entries"):
            class_id, day = params
            rows = [
                {
                    'id': entry['id'],
                    'class_id': entry['class_id'],
                    'tag': entry['tag'],
                    'lesson_number': entry.get('lesson_number'),
                    'start': entry['start'],
                    '`end`': entry['end'],
                    'end': entry['end'],
                    'fach': entry['fach'],
                    'raum': entry.get('raum'),
                    'group_name': entry.get('group_name'),
                }
                for entry in schedule_entries
                if entry.get('class_id') == class_id and entry.get('tag') == day
            ]
            rows.sort(key=lambda row: (row.get('start') or '', row.get('end') or ''))
            self._prepare_rows(
                rows,
                ['id', 'class_id', 'tag', 'lesson_number', 'start', '`end`', 'fach', 'raum', 'group_name'],
            )
            return

        if normalized.startswith("select id, class_id, tag, start, `end`, fach, raum from stundenplan_entries where class_id=%s"):
            class_id = params[0]
            day = params[1] if params and len(params) > 1 else None
            rows = [
                {
                    'id': entry['id'],
                    'class_id': entry['class_id'],
                    'tag': entry['tag'],
                    'start': entry['start'],
                    '`end`': entry['end'],
                    'end': entry['end'],
                    'fach': entry['fach'],
                    'raum': entry.get('raum'),
                }
                for entry in schedule_entries
                if entry.get('class_id') == class_id and (day is None or entry.get('tag') == day)
            ]
            rows.sort(key=lambda row: (row.get('tag') or '', row.get('start') or ''))
            self._prepare_rows(
                rows,
                ['id', 'class_id', 'tag', 'start', '`end`', 'fach', 'raum'],
            )
            return

        if normalized.startswith("select id, class_id, tag, start, `end`, fach, raum from stundenplan_entries where id=%s"):
            entry_id = params[0]
            for entry in schedule_entries:
                if entry.get('id') == entry_id:
                    result = {
                        'id': entry['id'],
                        'class_id': entry['class_id'],
                        'tag': entry['tag'],
                        'start': entry['start'],
                        '`end`': entry['end'],
                        'end': entry['end'],
                        'fach': entry['fach'],
                        'raum': entry.get('raum'),
                    }
                    self._prepare_rows(
                        [result],
                        ['id', 'class_id', 'tag', 'start', '`end`', 'fach', 'raum'],
                    )
                    return
            self._rows = []
            return

        if normalized.startswith("select tag, start, `end`, fach, raum from stundenplan_entries"):
            class_id = params[0]
            rows = [
                {
                    'tag': entry['tag'],
                    'start': entry['start'],
                    'end': entry['end'],
                    'fach': entry['fach'],
                    'raum': entry.get('raum'),
                }
                for entry in schedule_entries
                if entry.get('class_id') == class_id
            ]
            rows.sort(key=lambda row: (row.get('tag') or '', row.get('start') or ''))
            self._prepare_rows(rows, ['tag', 'start', 'end', 'fach', 'raum'])
            return

        if normalized.startswith("select start, `end`, fach, raum from stundenplan_entries") and "tag=%s" in normalized:
            class_id, day = params
            rows = [
                {
                    'start': entry['start'],
                    'end': entry['end'],
                    'fach': entry['fach'],
                    'raum': entry.get('raum'),
                }
                for entry in schedule_entries
                if entry.get('class_id') == class_id and entry.get('tag') == day
            ]
            rows.sort(key=lambda row: row.get('start') or '')
            self._prepare_rows(rows, ['start', 'end', 'fach', 'raum'])
            return

        if normalized.startswith("delete from stundenplan_entries where class_id=%s"):
            class_id = params[0]
            before = len(schedule_entries)
            remaining = [entry for entry in schedule_entries if entry.get('class_id') != class_id]
            self.storage['stundenplan_entries'] = remaining
            self.rowcount = before - len(remaining)
            return

        if normalized.startswith("delete from stundenplan_entries where id=%s"):
            entry_id = params[0]
            before = len(schedule_entries)
            self.storage['stundenplan_entries'] = [
                entry for entry in schedule_entries if entry.get('id') != entry_id
            ]
            self.rowcount = before - len(self.storage['stundenplan_entries'])
            return

        if normalized.startswith("insert into stundenplan_entries"):
            class_id, tag, start, end, fach, raum = params
            new_id = self.storage.setdefault('next_ids', {}).setdefault('stundenplan_entries', 1)
            self.storage['next_ids']['stundenplan_entries'] = new_id + 1
            schedule_entries.append(
                {
                    'id': new_id,
                    'class_id': class_id,
                    'tag': tag,
                    'start': start,
                    'end': end,
                    'fach': fach,
                    'raum': raum,
                }
            )
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("update stundenplan_entries set"):
            set_part = query.split('SET', 1)[1].rsplit('WHERE', 1)[0]
            assignments = [segment.strip() for segment in set_part.split(',')]
            entry_id = params[-1]
            entry = next((item for item in schedule_entries if item.get('id') == entry_id), None)
            if not entry:
                self.rowcount = 0
                return
            for assignment, value in zip(assignments, params[:-1]):
                column = assignment.split('=')[0].strip().strip('`')
                if column == 'class_id':
                    entry['class_id'] = value
                elif column == 'tag':
                    entry['tag'] = value
                elif column == 'start':
                    entry['start'] = value
                elif column == 'end':
                    entry['end'] = value
                elif column == '`end`':
                    entry['end'] = value
                elif column == 'fach':
                    entry['fach'] = value
                elif column == 'raum':
                    entry['raum'] = value
            self.rowcount = 1
            return

        if normalized.startswith("update class_schedules set updated_at=%s where class_id=%s"):
            updated_at, class_id = params
            updated = 0
            for schedule in schedules.values():
                if schedule.get('class_id') == class_id:
                    schedule['updated_at'] = updated_at
                    updated += 1
            self.rowcount = updated
            return

        if (
            normalized.startswith(
                "select typ, datum, enddatum, startzeit, endzeit, fach, beschreibung from eintraege"
            )
            and "where class_id=%s" in normalized
            and "datum >= %s" in normalized
            and "datum <= %s" in normalized
        ):
            class_id, start_date, end_date = params
            start_bound = datetime.date.fromisoformat(str(start_date))
            end_bound = datetime.date.fromisoformat(str(end_date))
            filtered = []
            for entry in entries:
                if entry.get('class_id') != class_id:
                    continue
                if int(entry.get('is_private') or 0) != 0:
                    continue
                due = entry.get('datum')
                if isinstance(due, str):
                    due = datetime.date.fromisoformat(due)
                if not isinstance(due, datetime.date):
                    continue
                if due < start_bound or due > end_bound:
                    continue
                filtered.append(
                    {
                        'typ': entry.get('typ'),
                        'datum': due,
                        'enddatum': entry.get('enddatum') or due,
                        'startzeit': entry.get('startzeit'),
                        'endzeit': entry.get('endzeit'),
                        'fach': entry.get('fach'),
                        'beschreibung': entry.get('beschreibung'),
                    }
                )
            filtered.sort(key=lambda row: (row.get('datum') or datetime.date.min, row.get('startzeit') or ''))
            self._prepare_rows(filtered, ['typ', 'datum', 'enddatum', 'startzeit', 'endzeit', 'fach', 'beschreibung'])
            return

        if (
            normalized.startswith(
                "select typ, datum, enddatum, startzeit, endzeit, fach, beschreibung from eintraege"
            )
            and "owner_user_id=%s" in normalized
            and "typ='todo'" in normalized
            and "datum >= %s" in normalized
            and "datum <= %s" in normalized
        ):
            owner_user_id, start_date, end_date = params
            start_bound = datetime.date.fromisoformat(str(start_date))
            end_bound = datetime.date.fromisoformat(str(end_date))
            filtered = []
            for entry in entries:
                if int(entry.get('is_private') or 0) != 1:
                    continue
                if int(entry.get('owner_user_id') or 0) != int(owner_user_id):
                    continue
                if entry.get('typ') != 'todo':
                    continue
                due = entry.get('datum')
                if isinstance(due, str):
                    due = datetime.date.fromisoformat(due)
                if not isinstance(due, datetime.date):
                    continue
                if due < start_bound or due > end_bound:
                    continue
                filtered.append(
                    {
                        'typ': 'todo',
                        'datum': due,
                        'enddatum': entry.get('enddatum') or due,
                        'startzeit': entry.get('startzeit'),
                        'endzeit': entry.get('endzeit'),
                        'fach': entry.get('fach'),
                        'beschreibung': entry.get('beschreibung'),
                    }
                )
            filtered.sort(key=lambda row: (row.get('datum') or datetime.date.min, row.get('startzeit') or ''))
            self._prepare_rows(filtered, ['typ', 'datum', 'enddatum', 'startzeit', 'endzeit', 'fach', 'beschreibung'])
            return

        if (
            normalized.startswith(
                "select id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach from eintraege"
            )
            and "where class_id=%s" in normalized
        ):
            class_id = params[0]
            filtered = [
                {
                    'id': entry['id'],
                    'beschreibung': entry.get('beschreibung'),
                    'datum': entry.get('datum'),
                    'enddatum': entry.get('enddatum'),
                    'startzeit': entry.get('startzeit'),
                    'endzeit': entry.get('endzeit'),
                    'typ': entry.get('typ'),
                    'fach': entry.get('fach'),
                }
                for entry in entries
                if entry.get('class_id') == class_id and int(entry.get('is_private') or 0) == 0
            ]
            filtered.sort(
                key=lambda row: (
                    row.get('datum') or datetime.date.min,
                    row.get('startzeit') or '',
                )
            )
            self._prepare_rows(
                filtered,
                ['id', 'beschreibung', 'datum', 'enddatum', 'startzeit', 'endzeit', 'typ', 'fach'],
            )
            return

        if (
            normalized.startswith(
                "select id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, is_done from eintraege"
            )
            and "owner_user_id=%s" in normalized
            and "typ='todo'" in normalized
        ):
            owner_user_id = params[0]
            filtered = [
                {
                    'id': entry['id'],
                    'beschreibung': entry.get('beschreibung'),
                    'datum': entry.get('datum'),
                    'enddatum': entry.get('enddatum'),
                    'startzeit': entry.get('startzeit'),
                    'endzeit': entry.get('endzeit'),
                    'typ': entry.get('typ'),
                    'fach': entry.get('fach'),
                    'is_done': entry.get('is_done', 0),
                }
                for entry in entries
                if int(entry.get('is_private') or 0) == 1
                and int(entry.get('owner_user_id') or 0) == int(owner_user_id)
                and entry.get('typ') == 'todo'
            ]
            filtered.sort(
                key=lambda row: (
                    row.get('datum') or datetime.date.min,
                    row.get('startzeit') or '',
                )
            )
            self._prepare_rows(
                filtered,
                ['id', 'beschreibung', 'datum', 'enddatum', 'startzeit', 'endzeit', 'typ', 'fach', 'is_done'],
            )
            return

        if (
            normalized.startswith("select id, todo_id, title, is_done, sort_order from todo_subtasks")
            and "owner_user_id=%s" in normalized
            and "todo_id in" in normalized
        ):
            owner_user_id = params[0]
            todo_ids = {int(value) for value in params[1:]}
            rows = [
                {
                    'id': subtask.get('id'),
                    'todo_id': subtask.get('todo_id'),
                    'title': subtask.get('title'),
                    'is_done': subtask.get('is_done'),
                    'sort_order': subtask.get('sort_order'),
                }
                for subtask in todo_subtasks
                if int(subtask.get('owner_user_id') or 0) == int(owner_user_id)
                and int(subtask.get('todo_id') or 0) in todo_ids
            ]
            rows.sort(key=lambda row: (int(row.get('todo_id') or 0), int(row.get('sort_order') or 0), int(row.get('id') or 0)))
            self._prepare_rows(rows, ['id', 'todo_id', 'title', 'is_done', 'sort_order'])
            return

        if normalized.startswith("delete from todo_subtasks where todo_id=%s and owner_user_id=%s"):
            todo_id, owner_user_id = params
            before = len(todo_subtasks)
            self.storage['todo_subtasks'] = [
                subtask
                for subtask in todo_subtasks
                if not (
                    int(subtask.get('todo_id') or 0) == int(todo_id)
                    and int(subtask.get('owner_user_id') or 0) == int(owner_user_id)
                )
            ]
            self.rowcount = before - len(self.storage['todo_subtasks'])
            return

        if normalized.startswith("insert into todo_subtasks (todo_id, owner_user_id, title, is_done, sort_order)"):
            todo_id, owner_user_id, title, is_done, sort_order = params
            next_ids = self.storage.setdefault('next_ids', {})
            new_id = next_ids.setdefault('todo_subtasks', 1)
            next_ids['todo_subtasks'] = new_id + 1
            self.storage.setdefault('todo_subtasks', []).append(
                {
                    'id': new_id,
                    'todo_id': todo_id,
                    'owner_user_id': owner_user_id,
                    'title': title,
                    'is_done': is_done,
                    'sort_order': sort_order,
                }
            )
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if (
            normalized.startswith(
                "select id, typ, beschreibung, datum, enddatum, fach from eintraege"
            )
            and "where class_id=%s" in normalized
            and "datum >= curdate()" in normalized
        ):
            class_id = params[0]
            today = datetime.date.today()
            filtered = []
            for entry in entries:
                if entry.get('class_id') != class_id:
                    continue
                if int(entry.get('is_private') or 0) != 0:
                    continue
                due = entry.get('datum')
                if isinstance(due, datetime.date):
                    if due < today:
                        continue
                elif isinstance(due, str):
                    try:
                        parsed = datetime.date.fromisoformat(due)
                    except ValueError:
                        parsed = today
                    if parsed < today:
                        continue
                    due = parsed
                filtered.append(
                    {
                        'id': entry['id'],
                        'typ': entry.get('typ'),
                        'beschreibung': entry.get('beschreibung'),
                        'datum': due,
                        'enddatum': entry.get('enddatum'),
                        'fach': entry.get('fach'),
                    }
                )
            filtered.sort(key=lambda row: row.get('datum') or today)
            self._prepare_rows(
                filtered,
                ['id', 'typ', 'beschreibung', 'datum', 'enddatum', 'fach'],
            )
            return

        if (
            normalized.startswith(
                "select id, typ, beschreibung, datum, enddatum, fach from eintraege"
            )
            and "owner_user_id=%s" in normalized
            and "typ='todo'" in normalized
            and "datum >= curdate()" in normalized
        ):
            owner_user_id = params[0]
            today = datetime.date.today()
            filtered = []
            for entry in entries:
                if int(entry.get('is_private') or 0) != 1:
                    continue
                if int(entry.get('owner_user_id') or 0) != int(owner_user_id):
                    continue
                if entry.get('typ') != 'todo':
                    continue
                due = entry.get('datum')
                if isinstance(due, datetime.date):
                    if due < today:
                        continue
                elif isinstance(due, str):
                    try:
                        parsed = datetime.date.fromisoformat(due)
                    except ValueError:
                        parsed = today
                    if parsed < today:
                        continue
                    due = parsed
                filtered.append(
                    {
                        'id': entry['id'],
                        'typ': entry.get('typ'),
                        'beschreibung': entry.get('beschreibung'),
                        'datum': due,
                        'enddatum': entry.get('enddatum'),
                        'fach': entry.get('fach'),
                    }
                )
            filtered.sort(key=lambda row: row.get('datum') or today)
            self._prepare_rows(
                filtered,
                ['id', 'typ', 'beschreibung', 'datum', 'enddatum', 'fach'],
            )
            return

        if normalized.startswith("select 1 from eintraege where id=%s and class_id=%s"):
            entry_id, class_id = params
            for entry in entries:
                if (
                    entry['id'] == entry_id
                    and entry['class_id'] == class_id
                    and int(entry.get('is_private') or 0) == 0
                ):
                    if self.dictionary:
                        self._prepare_rows([{'1': 1}], ['1'])
                    else:
                        self._rows = [(1,)]
                    return
            self._rows = []
            return

        if normalized.startswith("select class_id from eintraege where id=%s and coalesce(is_private, 0)=0"):
            entry_id = params[0]
            rows = [{'class_id': entry.get('class_id')} for entry in entries if entry.get('id') == entry_id and int(entry.get('is_private') or 0) == 0]
            self._prepare_rows(rows, ['class_id'])
            return

        if normalized.startswith("update eintraege set beschreibung=%s, datum=%s, enddatum=%s, startzeit=%s, endzeit=%s, typ=%s, fach=%s where id=%s and class_id=%s"):
            desc, date, enddate, start, end, typ, fach, entry_id, class_id = params
            for entry in entries:
                if (
                    entry['id'] == entry_id
                    and entry['class_id'] == class_id
                    and int(entry.get('is_private') or 0) == 0
                ):
                    entry.update(
                        {
                            'beschreibung': desc,
                            'datum': date,
                            'enddatum': enddate,
                            'startzeit': start,
                            'endzeit': end,
                            'typ': typ,
                            'fach': fach,
                        }
                    )
                    self.rowcount = 1
                    break
            return

        if normalized.startswith("delete from eintraege where id=%s and class_id=%s"):
            entry_id, class_id = params
            before = len(entries)
            remaining = [
                entry
                for entry in entries
                if not (
                    entry['id'] == entry_id
                    and entry['class_id'] == class_id
                    and int(entry.get('is_private') or 0) == 0
                )
            ]
            self.storage['eintraege'] = remaining
            self.rowcount = before - len(remaining)
            return

        if normalized.startswith("delete from eintraege where id=%s and coalesce(is_private, 0)=0"):
            entry_id = params[0]
            before = len(entries)
            remaining = [
                entry
                for entry in entries
                if not (
                    entry['id'] == entry_id
                    and int(entry.get('is_private') or 0) == 0
                )
            ]
            self.storage['eintraege'] = remaining
            self.rowcount = before - len(remaining)
            return

        if normalized.startswith("insert into eintraege (class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id, is_private, is_done)"):
            class_id, desc, date, enddate, start, end, typ, fach, owner_user_id, is_private, is_done = params
            next_ids = self.storage.setdefault('next_ids', {})
            new_id = next_ids.setdefault('eintraege', 1)
            next_ids['eintraege'] = new_id + 1
            entry = {
                'id': new_id,
                'class_id': class_id,
                'beschreibung': desc,
                'datum': date,
                'enddatum': enddate,
                'startzeit': start,
                'endzeit': end,
                'typ': typ,
                'fach': fach,
                'owner_user_id': owner_user_id,
                'is_private': is_private,
                'is_done': is_done,
            }
            entries.append(entry)
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("insert into eintraege (class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id, is_private)"):
            class_id, desc, date, enddate, start, end, typ, fach, owner_user_id, is_private = params
            next_ids = self.storage.setdefault('next_ids', {})
            new_id = next_ids.setdefault('eintraege', 1)
            next_ids['eintraege'] = new_id + 1
            entry = {
                'id': new_id,
                'class_id': class_id,
                'beschreibung': desc,
                'datum': date,
                'enddatum': enddate,
                'startzeit': start,
                'endzeit': end,
                'typ': typ,
                'fach': fach,
                'owner_user_id': owner_user_id,
                'is_private': is_private,
                'is_done': 0,
            }
            entries.append(entry)
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("insert into eintraege (id, class_id, beschreibung, datum, enddatum, startzeit, endzeit, typ, fach, owner_user_id, is_private)"):
            entry_id, class_id, desc, date, enddate, start, end, typ, fach, owner_user_id, is_private = params
            entry = {
                'id': entry_id,
                'class_id': class_id,
                'beschreibung': desc,
                'datum': date,
                'enddatum': enddate,
                'startzeit': start,
                'endzeit': end,
                'typ': typ,
                'fach': fach,
                'owner_user_id': owner_user_id,
                'is_private': is_private,
            }
            entries.append(entry)
            next_ids = self.storage.setdefault('next_ids', {})
            current_next = next_ids.setdefault('eintraege', entry_id + 1)
            if current_next <= entry_id:
                next_ids['eintraege'] = entry_id + 1
            self.lastrowid = entry_id
            self.rowcount = 1
            return

        if (
            normalized.startswith("select id, owner_user_id, is_private, typ, is_done from eintraege")
            and "owner_user_id=%s" in normalized
            and "typ='todo'" in normalized
        ):
            entry_id, owner_user_id = params
            record = next(
                (
                    entry
                    for entry in entries
                    if int(entry.get('id') or 0) == int(entry_id)
                    and int(entry.get('owner_user_id') or 0) == int(owner_user_id)
                    and int(entry.get('is_private') or 0) == 1
                    and entry.get('typ') == 'todo'
                ),
                None,
            )
            if record:
                self._prepare_rows(
                    [
                        {
                            'id': record.get('id'),
                            'owner_user_id': record.get('owner_user_id'),
                            'is_private': record.get('is_private'),
                            'typ': record.get('typ'),
                            'is_done': record.get('is_done', 0),
                        }
                    ],
                    ['id', 'owner_user_id', 'is_private', 'typ', 'is_done'],
                )
            else:
                self._rows = []
            return

        if normalized.startswith("update eintraege set beschreibung=%s, datum=%s, enddatum=%s, startzeit=%s, endzeit=%s, fach=%s, is_done=%s"):
            desc, date, enddate, start, end, fach, is_done, entry_id, owner_user_id = params
            for entry in entries:
                if (
                    int(entry.get('id') or 0) == int(entry_id)
                    and int(entry.get('owner_user_id') or 0) == int(owner_user_id)
                    and int(entry.get('is_private') or 0) == 1
                    and entry.get('typ') == 'todo'
                ):
                    entry.update(
                        {
                            'beschreibung': desc,
                            'datum': date,
                            'enddatum': enddate,
                            'startzeit': start,
                            'endzeit': end,
                            'fach': fach,
                            'is_done': is_done,
                        }
                    )
                    self.rowcount = 1
                    break
            return

        if normalized.startswith("update eintraege set beschreibung=%s, datum=%s, enddatum=%s, startzeit=%s, endzeit=%s, fach=%s"):
            desc, date, enddate, start, end, fach, entry_id, owner_user_id = params
            for entry in entries:
                if (
                    int(entry.get('id') or 0) == int(entry_id)
                    and int(entry.get('owner_user_id') or 0) == int(owner_user_id)
                    and int(entry.get('is_private') or 0) == 1
                    and entry.get('typ') == 'todo'
                ):
                    entry.update(
                        {
                            'beschreibung': desc,
                            'datum': date,
                            'enddatum': enddate,
                            'startzeit': start,
                            'endzeit': end,
                            'fach': fach,
                        }
                    )
                    self.rowcount = 1
                    break
            return

        if normalized.startswith("delete from eintraege where id=%s and owner_user_id=%s"):
            entry_id, owner_user_id = params
            before = len(entries)
            remaining = [
                entry
                for entry in entries
                if not (
                    int(entry.get('id') or 0) == int(entry_id)
                    and int(entry.get('owner_user_id') or 0) == int(owner_user_id)
                    and int(entry.get('is_private') or 0) == 1
                    and entry.get('typ') == 'todo'
                )
            ]
            self.storage['eintraege'] = remaining
            self.rowcount = before - len(remaining)
            return

        if (
            normalized.startswith("select id, summary_markdown, source_hash, created_at, expires_at from weekly_preview_cache")
            and "where user_id=%s" in normalized
            and "expires_at > %s" in normalized
        ):
            user_id, class_id, locale, window_start, window_end, include_todos, now_value = params
            filtered = [
                row
                for row in weekly_preview_cache
                if int(row.get('user_id') or 0) == int(user_id)
                and row.get('class_id') == class_id
                and row.get('locale') == locale
                and str(row.get('window_start')) == str(window_start)
                and str(row.get('window_end')) == str(window_end)
                and int(row.get('include_todos') or 0) == int(include_todos)
                and isinstance(row.get('expires_at'), datetime.datetime)
                and row.get('expires_at') > now_value
            ]
            filtered.sort(key=lambda row: row.get('created_at') or datetime.datetime.min, reverse=True)
            top = filtered[:1]
            self._prepare_rows(
                top,
                ['id', 'summary_markdown', 'source_hash', 'created_at', 'expires_at'],
            )
            return

        if normalized.startswith("delete from weekly_preview_cache where user_id=%s"):
            user_id, class_id, locale, window_start, window_end, include_todos = params
            before = len(weekly_preview_cache)
            self.storage['weekly_preview_cache'] = [
                row
                for row in weekly_preview_cache
                if not (
                    int(row.get('user_id') or 0) == int(user_id)
                    and row.get('class_id') == class_id
                    and row.get('locale') == locale
                    and str(row.get('window_start')) == str(window_start)
                    and str(row.get('window_end')) == str(window_end)
                    and int(row.get('include_todos') or 0) == int(include_todos)
                )
            ]
            self.rowcount = before - len(self.storage['weekly_preview_cache'])
            return

        if normalized.startswith("insert into weekly_preview_cache"):
            user_id, class_id, locale, window_start, window_end, include_todos, summary_markdown, source_hash, created_at, expires_at = params
            next_ids = self.storage.setdefault('next_ids', {})
            new_id = next_ids.setdefault('weekly_preview_cache', 1)
            next_ids['weekly_preview_cache'] = new_id + 1
            weekly_preview_cache.append(
                {
                    'id': new_id,
                    'user_id': int(user_id),
                    'class_id': class_id,
                    'locale': locale,
                    'window_start': str(window_start),
                    'window_end': str(window_end),
                    'include_todos': int(include_todos),
                    'summary_markdown': summary_markdown,
                    'source_hash': source_hash,
                    'created_at': created_at,
                    'expires_at': expires_at,
                }
            )
            self.lastrowid = new_id
            self.rowcount = 1
            return

        if normalized.startswith("select vault_json, revision, updated_at from encrypted_grade_vaults where user_id=%s"):
            user_id = int(params[0])
            row = encrypted_grade_vaults.get(user_id)
            if not row:
                self._rows = []
                return
            self._prepare_rows(
                [
                    {
                        'vault_json': row.get('vault_json'),
                        'revision': row.get('revision'),
                        'updated_at': row.get('updated_at'),
                    }
                ],
                ['vault_json', 'revision', 'updated_at'],
            )
            return

        if normalized.startswith("select revision from encrypted_grade_vaults where user_id=%s"):
            user_id = int(params[0])
            row = encrypted_grade_vaults.get(user_id)
            if not row:
                self._rows = []
                return
            self._prepare_rows([{'revision': row.get('revision')}], ['revision'])
            return

        if normalized.startswith("delete from encrypted_grade_vaults where user_id=%s"):
            user_id = int(params[0])
            existed = user_id in encrypted_grade_vaults
            encrypted_grade_vaults.pop(user_id, None)
            self.rowcount = 1 if existed else 0
            return

        if normalized.startswith("update encrypted_grade_vaults set vault_json=%s, revision=%s, updated_at=%s where user_id=%s"):
            vault_json, revision, updated_at, user_id = params
            user_id = int(user_id)
            row = encrypted_grade_vaults.get(user_id)
            if row:
                row['vault_json'] = vault_json
                row['revision'] = revision
                row['updated_at'] = updated_at
                self.rowcount = 1
            return

        if normalized.startswith("insert into encrypted_grade_vaults (user_id, vault_json, revision, created_at, updated_at)"):
            user_id, vault_json, revision, created_at, updated_at = params
            encrypted_grade_vaults[int(user_id)] = {
                'user_id': int(user_id),
                'vault_json': vault_json,
                'revision': revision,
                'created_at': created_at,
                'updated_at': updated_at,
            }
            self.rowcount = 1
            return

        self._rows = []

    def executemany(self, query: str, param_sequence) -> None:  # pragma: no cover - shim
        total = 0
        last_id = None
        for params in param_sequence or []:
            self.execute(query, params)
            total += self.rowcount
            if self.lastrowid is not None:
                last_id = self.lastrowid
        self.rowcount = total
        if last_id is not None:
            self.lastrowid = last_id

    def fetchone(self):  # pragma: no cover - shim
        if not self._rows:
            return None
        return self._rows.pop(0)

    def fetchall(self):  # pragma: no cover - shim
        rows = list(self._rows)
        self._rows = []
        return rows

    def close(self) -> None:  # pragma: no cover - shim
        return None


class FakeConnection:
    def __init__(self, storage: Dict[str, object]) -> None:
        self.storage = storage

    def cursor(self, dictionary: bool = False):
        return FakeCursor(self.storage, dictionary=dictionary)

    def commit(self) -> None:
        self.storage['commits'] = self.storage.get('commits', 0) + 1

    def rollback(self) -> None:
        self.storage['rollbacks'] = self.storage.get('rollbacks', 0) + 1

    def close(self) -> None:  # pragma: no cover - shim
        return None


@pytest.fixture
def app_client(monkeypatch):
    monkeypatch.setenv('DB_HOST', 'localhost')
    monkeypatch.setenv('DB_USER', 'tester')
    monkeypatch.setenv('DB_PASSWORD', 'secret')
    monkeypatch.setenv('DB_NAME', 'homework_manager')
    monkeypatch.setenv('DB_PORT', '3306')

    monkeypatch.setenv('CONTACT_SMTP_HOST', 'smtp.example.com')
    monkeypatch.setenv('CONTACT_SMTP_USER', 'noreply@example.com')
    monkeypatch.setenv('CONTACT_SMTP_PASSWORD', 'not-used')
    monkeypatch.setenv('CONTACT_RECIPIENT', 'contact@example.com')
    monkeypatch.setenv('CONTACT_FROM_ADDRESS', 'Homework Manager <noreply@example.com>')

    real_open = builtins.open

    def mock_open(path, *args, **kwargs):
        if path == '/etc/secrets/hwm-session-secret':
            return io.StringIO('secret')
        return real_open(path, *args, **kwargs)

    monkeypatch.setattr(builtins, 'open', mock_open)

    now = datetime.datetime.utcnow()
    storage: Dict[str, object] = {
        'users': {
            1: {
                'id': 1,
                'email': 'admin@example.com',
                'password_hash': auth_utils.hash_password('adminpw'),
                'role': 'admin',
                'class_id': 1,
                'is_active': 1,
                'created_at': now,
                'updated_at': now,
                'email_verified_at': now,
                'last_login_updates': [],
            }
        },
        'users_by_email': {'admin@example.com': 1},
        'classes': {
            1: {
                'id': 1,
                'slug': 'default',
                'title': 'Default Class',
                'description': 'Default class',
                'is_active': 1,
                'created_at': now,
                'updated_at': now,
            }
        },
        'class_schedules': {},
        'stundenplan_entries': [],
        'eintraege': [],
        'audit_logs': [],
        'verifications': [],
        'password_resets': [],
        'weekly_preview_cache': [],
        'encrypted_grade_vaults': {},
        'next_ids': {
            'users': 2,
            'classes': 2,
            'class_schedules': 1,
            'audit_logs': 1,
            'stundenplan_entries': 1,
            'eintraege': 1,
            'password_resets': 1,
            'weekly_preview_cache': 1,
        },
    }

    class DummyPool:
        def get_connection(self):  # pragma: no cover - shim
            raise RuntimeError('DB access disabled in tests')

    monkeypatch.setattr('mysql.connector.pooling.MySQLConnectionPool', lambda *a, **kw: DummyPool())

    app_module = importlib.import_module('app')
    app_module.app.config['TESTING'] = True
    monkeypatch.setattr(app_module, 'CONTACT_RATE_LIMIT', {})
    monkeypatch.setattr(app_module, 'CONTACT_MIN_DURATION_MS', 0)
    monkeypatch.setattr(app_module, 'CONTACT_USER_COOLDOWN', {})
    monkeypatch.setattr(app_module, 'CONTACT_USER_COOLDOWN_SECONDS', 120)
    monkeypatch.setattr(app_module, 'CONTACT_TARGET_ADDRESS', 'dest@example.com')
    monkeypatch.setattr(app_module, 'LOGIN_RATE_LIMIT', {})
    monkeypatch.setattr(app_module, 'VERIFY_RATE_LIMIT', {})
    monkeypatch.setattr(app_module, 'LOGIN_RATE_LIMIT_WINDOW', 1)
    monkeypatch.setattr(app_module, 'LOGIN_RATE_LIMIT_MAX', 100)
    monkeypatch.setattr(app_module, 'VERIFY_RATE_LIMIT_WINDOW', 1)
    monkeypatch.setattr(app_module, 'VERIFY_RATE_LIMIT_MAX', 100)
    monkeypatch.setattr(app_module, 'PASSWORD_RESET_REQUEST_LIMIT', {})
    monkeypatch.setattr(app_module, 'PASSWORD_RESET_VERIFY_LIMIT', {})
    monkeypatch.setattr(app_module, 'PASSWORD_RESET_REQUEST_WINDOW', 1)
    monkeypatch.setattr(app_module, 'PASSWORD_RESET_REQUEST_MAX', 100)
    monkeypatch.setattr(app_module, 'PASSWORD_RESET_VERIFY_WINDOW', 1)
    monkeypatch.setattr(app_module, 'PASSWORD_RESET_VERIFY_MAX', 100)

    def fake_get_connection():
        return FakeConnection(storage)

    monkeypatch.setattr(app_module, 'get_connection', fake_get_connection)

    with app_module.app.test_client() as client:
        yield client, storage, app_module
