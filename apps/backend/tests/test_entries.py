import datetime

from class_ids import DEFAULT_ENTRY_CLASS_ID


def _authenticate(client):
    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['is_admin'] = True
        sess['role'] = 'admin'
        sess['class_id'] = 1


def test_add_entry_uses_default_class_id(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    payload = {
        'typ': 'event',
        'datum': '2024-05-01',
        'beschreibung': 'Testeintrag',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 200

    entries = storage['eintraege']
    assert entries, 'entry should have been stored'
    assert entries[0]['class_id'] == DEFAULT_ENTRY_CLASS_ID
    assert entries[0]['enddatum'] == '2024-05-01'


def test_add_entry_accepts_custom_class_id(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    payload = {
        'typ': 'event',
        'datum': '2024-05-02',
        'beschreibung': 'Custom class entry',
        'class_id': 'u24F',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 200

    entries = storage['eintraege']
    assert entries[-1]['class_id'] == 'U24f'
    assert entries[-1]['enddatum'] == '2024-05-02'


def test_add_entry_accepts_multiple_class_ids(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    payload = {
        'typ': 'event',
        'datum': '2024-05-06',
        'beschreibung': 'Mehrfacher Eintrag',
        'class_ids': ['L23a', 'u24f', 'L23a'],
    }

    before = len(storage['eintraege'])
    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 200

    result = resp.get_json()
    assert result.get('created') == 2

    new_entries = storage['eintraege'][before:]
    assert {entry['class_id'] for entry in new_entries} == {'L23a', 'U24f'}
    assert len({entry['id'] for entry in new_entries}) == 1
    assert {entry['enddatum'] for entry in new_entries} == {'2024-05-06'}


def test_add_holiday_requires_end_date(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    before_entries = list(storage['eintraege'])

    payload = {
        'typ': 'ferien',
        'datum': '2024-07-01',
        'beschreibung': 'Sommerferien',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 400
    assert storage['eintraege'] == before_entries


def test_add_holiday_rejects_end_before_start(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    before_entries = list(storage['eintraege'])

    payload = {
        'typ': 'ferien',
        'datum': '2024-07-10',
        'enddatum': '2024-07-05',
        'beschreibung': 'Ungültig',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 400
    assert storage['eintraege'] == before_entries


def test_add_holiday_multi_class_entry(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    payload = {
        'typ': 'ferien',
        'datum': '2024-07-15',
        'enddatum': '2024-07-22',
        'beschreibung': 'Sommerferien',
        'class_ids': ['L23a', 'u24f'],
    }

    before = len(storage['eintraege'])
    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 200

    result = resp.get_json()
    assert result.get('created') == 2

    new_entries = storage['eintraege'][before:]
    assert len(new_entries) == 2
    assert {entry['class_id'] for entry in new_entries} == {'L23a', 'U24f'}
    assert {entry['typ'] for entry in new_entries} == {'ferien'}
    assert {entry['beschreibung'] for entry in new_entries} == {'Sommerferien'}
    assert {entry['enddatum'] for entry in new_entries} == {'2024-07-22'}
    assert all(entry.get('fach', '') == '' for entry in new_entries)


def test_add_entry_rejects_invalid_class_id(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    before_entries = list(storage['eintraege'])

    payload = {
        'typ': 'event',
        'datum': '2024-05-03',
        'beschreibung': 'Invalid class',
        'class_id': 'XYZ',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 400
    assert storage['eintraege'] == before_entries


def test_add_entry_rejects_invalid_class_id_list(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    before_entries = list(storage['eintraege'])

    payload = {
        'typ': 'event',
        'datum': '2024-05-07',
        'beschreibung': 'Ungültige Liste',
        'class_ids': ['L23a', 'XYZ'],
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 400
    assert storage['eintraege'] == before_entries


def test_class_admin_cannot_add_entry_for_other_class(app_client):
    client, storage, _ = app_client
    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'class_admin'
        sess['is_admin'] = False
        sess['entry_class_id'] = DEFAULT_ENTRY_CLASS_ID

    payload = {
        'typ': 'event',
        'datum': '2024-05-04',
        'beschreibung': 'Wrong class',
        'class_id': 'U24f',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 403
    assert all(entry['beschreibung'] != 'Wrong class' for entry in storage['eintraege'])


def test_class_admin_cannot_add_entry_for_other_class_in_list(app_client):
    client, storage, _ = app_client
    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'class_admin'
        sess['is_admin'] = False
        sess['entry_class_id'] = DEFAULT_ENTRY_CLASS_ID

    before_entries = list(storage['eintraege'])

    payload = {
        'typ': 'event',
        'datum': '2024-05-08',
        'beschreibung': 'Verbotene Liste',
        'class_ids': [DEFAULT_ENTRY_CLASS_ID, 'U24f'],
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 403
    assert storage['eintraege'] == before_entries


def test_teacher_can_add_entry_for_any_class(app_client):
    client, storage, _ = app_client
    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'teacher'
        sess['is_admin'] = False

    payload = {
        'typ': 'event',
        'datum': '2024-05-05',
        'beschreibung': 'Teacher entry',
        'class_id': 'U24f',
    }

    resp = client.post('/add_entry', json=payload)
    assert resp.status_code == 200
    assert any(entry['beschreibung'] == 'Teacher entry' for entry in storage['eintraege'])


def test_entries_filters_by_session_class_slug(app_client):
    client, storage, _ = app_client
    storage['eintraege'] = [
        {
            'id': 1,
            'class_id': 'L23a',
            'beschreibung': 'Class A homework',
            'datum': datetime.date(2024, 5, 6),
            'enddatum': datetime.date(2024, 5, 6),
            'startzeit': None,
            'endzeit': None,
            'typ': 'homework',
            'fach': 'Math',
        },
        {
            'id': 2,
            'class_id': 'U24f',
            'beschreibung': 'Other class homework',
            'datum': datetime.date(2024, 5, 7),
            'enddatum': datetime.date(2024, 5, 7),
            'startzeit': None,
            'endzeit': None,
            'typ': 'homework',
            'fach': 'Science',
        },
    ]

    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'student'
        sess['class_id'] = 1
        sess['class_slug'] = 'l23a'
        sess.pop('entry_class_id', None)

    resp = client.get('/entries')
    assert resp.status_code == 200

    data = resp.get_json()
    assert [entry['beschreibung'] for entry in data] == ['Class A homework']


def test_update_entry_updates_all_requested_classes(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    storage['eintraege'] = [
        {
            'id': 5,
            'class_id': 'L23a',
            'beschreibung': 'Original',
            'datum': datetime.date(2024, 5, 10),
            'enddatum': datetime.date(2024, 5, 10),
            'startzeit': None,
            'endzeit': None,
            'typ': 'hausaufgabe',
            'fach': 'MATH',
        },
        {
            'id': 5,
            'class_id': 'U24f',
            'beschreibung': 'Original',
            'datum': datetime.date(2024, 5, 10),
            'enddatum': datetime.date(2024, 5, 10),
            'startzeit': None,
            'endzeit': None,
            'typ': 'hausaufgabe',
            'fach': 'MATH',
        },
    ]

    payload = {
        'id': 5,
        'type': 'hausaufgabe',
        'date': '2024-05-11',
        'description': 'Aktualisiert',
        'startzeit': None,
        'endzeit': None,
        'fach': 'DEUT',
        'class_ids': ['L23a', 'U24f'],
    }

    resp = client.put('/update_entry', json=payload)
    assert resp.status_code == 200

    updated_entries = [entry for entry in storage['eintraege'] if entry['id'] == 5]
    assert {entry['beschreibung'] for entry in updated_entries} == {'Aktualisiert'}
    assert {entry['fach'] for entry in updated_entries} == {'DEUT'}
    assert {entry['datum'] for entry in updated_entries} == {'2024-05-11'}
    assert {entry['enddatum'] for entry in updated_entries} == {'2024-05-11'}


def test_update_entry_respects_missing_class_entries(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    storage['eintraege'] = [
        {
            'id': 6,
            'class_id': 'L23a',
            'beschreibung': 'Original',
            'datum': '2024-05-10',
            'enddatum': '2024-05-10',
            'startzeit': None,
            'endzeit': None,
            'typ': 'hausaufgabe',
            'fach': 'MATH',
        }
    ]

    payload = {
        'id': 6,
        'type': 'hausaufgabe',
        'date': '2024-05-12',
        'description': 'Neu',
        'startzeit': None,
        'endzeit': None,
        'fach': 'DEUT',
        'class_ids': ['L23a', 'U24f'],
    }

    resp = client.put('/update_entry', json=payload)
    assert resp.status_code == 404
    assert storage['eintraege'][0]['beschreibung'] == 'Original'


def test_update_holiday_requires_end_date(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    storage['eintraege'] = [
        {
            'id': 7,
            'class_id': 'L23a',
            'beschreibung': 'Sommerferien',
            'datum': '2024-07-01',
            'enddatum': '2024-07-05',
            'startzeit': None,
            'endzeit': None,
            'typ': 'ferien',
            'fach': '',
        }
    ]

    payload = {
        'id': 7,
        'type': 'ferien',
        'date': '2024-07-01',
        'description': 'Sommerferien',
        'class_ids': ['L23a'],
    }

    resp = client.put('/update_entry', json=payload)
    assert resp.status_code == 400
    assert storage['eintraege'][0]['enddatum'] == '2024-07-05'


def test_update_holiday_multi_class_updates_range(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    storage['eintraege'] = [
        {
            'id': 8,
            'class_id': 'L23a',
            'beschreibung': 'Ferien',
            'datum': '2024-07-10',
            'enddatum': '2024-07-12',
            'startzeit': None,
            'endzeit': None,
            'typ': 'ferien',
            'fach': '',
        },
        {
            'id': 8,
            'class_id': 'U24f',
            'beschreibung': 'Ferien',
            'datum': '2024-07-10',
            'enddatum': '2024-07-12',
            'startzeit': None,
            'endzeit': None,
            'typ': 'ferien',
            'fach': '',
        },
    ]

    payload = {
        'id': 8,
        'type': 'ferien',
        'date': '2024-07-15',
        'enddatum': '2024-07-20',
        'description': 'Aktualisierte Ferien',
        'class_ids': ['L23a', 'U24f'],
    }

    resp = client.put('/update_entry', json=payload)
    assert resp.status_code == 200

    updated_entries = [entry for entry in storage['eintraege'] if entry['id'] == 8]
    assert {entry['datum'] for entry in updated_entries} == {'2024-07-15'}
    assert {entry['enddatum'] for entry in updated_entries} == {'2024-07-20'}
    assert {entry['beschreibung'] for entry in updated_entries} == {'Aktualisierte Ferien'}


def test_entries_filters_by_other_class_slug(app_client):
    client, storage, _ = app_client
    storage['eintraege'] = [
        {
            'id': 1,
            'class_id': 'L23a',
            'beschreibung': 'Class A homework',
            'datum': datetime.date(2024, 5, 6),
            'enddatum': datetime.date(2024, 5, 6),
            'startzeit': None,
            'endzeit': None,
            'typ': 'homework',
            'fach': 'Math',
        },
        {
            'id': 2,
            'class_id': 'U24f',
            'beschreibung': 'Other class homework',
            'datum': datetime.date(2024, 5, 7),
            'enddatum': datetime.date(2024, 5, 7),
            'startzeit': None,
            'endzeit': None,
            'typ': 'homework',
            'fach': 'Science',
        },
    ]

    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'student'
        sess['class_id'] = 2
        sess['class_slug'] = 'u24f'
        sess.pop('entry_class_id', None)

    resp = client.get('/entries')
    assert resp.status_code == 200

    data = resp.get_json()
    assert [entry['beschreibung'] for entry in data] == ['Other class homework']


def test_create_personal_todo_for_student(app_client):
    client, storage, _ = app_client
    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'student'
        sess['class_id'] = 1

    resp = client.post(
        '/api/todos',
        json={'datum': '2026-03-10', 'beschreibung': 'Private todo', 'startzeit': '08:00:00'},
    )
    assert resp.status_code == 200
    payload = resp.get_json()
    assert payload.get('status') == 'ok'

    row = storage['eintraege'][-1]
    assert row['typ'] == 'todo'
    assert row['class_id'] == DEFAULT_ENTRY_CLASS_ID
    assert row['owner_user_id'] == 1
    assert int(row['is_private']) == 1


def test_personal_todo_subtasks_are_saved_and_listed(app_client):
    client, storage, _ = app_client
    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'student'
        sess['class_id'] = 1

    create_resp = client.post(
        '/api/todos',
        json={
            'datum': '2026-03-10',
            'beschreibung': 'Liste vorbereiten',
            'subtasks': [
                {'title': 'Material sammeln', 'is_done': True},
                {'title': 'Abgabe kontrollieren', 'is_done': False},
            ],
        },
    )
    assert create_resp.status_code == 200
    todo_id = create_resp.get_json()['id']
    assert [row['title'] for row in storage['todo_subtasks']] == ['Material sammeln', 'Abgabe kontrollieren']

    list_resp = client.get('/api/todos')
    assert list_resp.status_code == 200
    todos = list_resp.get_json()['data']
    todo = next(item for item in todos if item['id'] == todo_id)
    assert todo['beschreibung'] == 'Liste vorbereiten'
    assert [item['title'] for item in todo['subtasks']] == ['Material sammeln', 'Abgabe kontrollieren']
    assert todo['subtasks'][0]['is_done'] is True


def test_personal_todo_update_replaces_subtasks(app_client):
    client, storage, _ = app_client
    storage['eintraege'] = [
        {
            'id': 12,
            'class_id': DEFAULT_ENTRY_CLASS_ID,
            'beschreibung': 'Initial',
            'datum': '2026-03-12',
            'enddatum': '2026-03-12',
            'startzeit': None,
            'endzeit': None,
            'typ': 'todo',
            'fach': '',
            'owner_user_id': 1,
            'is_private': 1,
        }
    ]
    storage['todo_subtasks'] = [
        {'id': 1, 'todo_id': 12, 'owner_user_id': 1, 'title': 'Alt', 'is_done': 0, 'sort_order': 0}
    ]

    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'student'
        sess['class_id'] = 1

    update_resp = client.put(
        '/api/todos/12',
        json={
            'datum': '2026-03-13',
            'enddatum': '2026-03-13',
            'beschreibung': 'Updated',
            'subtasks': [{'title': 'Neu', 'is_done': True}],
        },
    )
    assert update_resp.status_code == 200
    assert [row['title'] for row in storage['todo_subtasks']] == ['Neu']
    assert int(storage['todo_subtasks'][0]['is_done']) == 1


def test_private_todo_visibility_is_owner_only(app_client):
    client, storage, _ = app_client
    storage['users'][2] = {
        'id': 2,
        'email': 'student2@example.com',
        'password_hash': storage['users'][1]['password_hash'],
        'role': 'student',
        'class_id': 1,
        'is_active': 1,
        'created_at': datetime.datetime.utcnow(),
        'updated_at': datetime.datetime.utcnow(),
        'email_verified_at': datetime.datetime.utcnow(),
        'last_login_updates': [],
    }
    storage['users_by_email']['student2@example.com'] = 2

    storage['eintraege'] = [
        {
            'id': 1,
            'class_id': 'L23a',
            'beschreibung': 'Class entry',
            'datum': datetime.date(2026, 3, 8),
            'enddatum': datetime.date(2026, 3, 8),
            'startzeit': None,
            'endzeit': None,
            'typ': 'event',
            'fach': 'MA',
            'owner_user_id': None,
            'is_private': 0,
        },
        {
            'id': 2,
            'class_id': DEFAULT_ENTRY_CLASS_ID,
            'beschreibung': 'Todo A',
            'datum': datetime.date(2026, 3, 9),
            'enddatum': datetime.date(2026, 3, 9),
            'startzeit': None,
            'endzeit': None,
            'typ': 'todo',
            'fach': '',
            'owner_user_id': 1,
            'is_private': 1,
        },
        {
            'id': 3,
            'class_id': DEFAULT_ENTRY_CLASS_ID,
            'beschreibung': 'Todo B',
            'datum': datetime.date(2026, 3, 10),
            'enddatum': datetime.date(2026, 3, 10),
            'startzeit': None,
            'endzeit': None,
            'typ': 'todo',
            'fach': '',
            'owner_user_id': 2,
            'is_private': 1,
        },
    ]

    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'student'
        sess['class_id'] = 1
        sess['class_slug'] = 'l23a'
        sess['entry_class_id'] = 'L23a'

    resp = client.get('/entries')
    assert resp.status_code == 200
    data = resp.get_json()
    descriptions = [item['beschreibung'] for item in data]
    assert 'Class entry' in descriptions
    assert 'Todo A' in descriptions
    assert 'Todo B' not in descriptions


def test_owner_can_update_and_delete_own_todo(app_client):
    client, storage, _ = app_client
    storage['eintraege'] = [
        {
            'id': 12,
            'class_id': DEFAULT_ENTRY_CLASS_ID,
            'beschreibung': 'Initial',
            'datum': '2026-03-12',
            'enddatum': '2026-03-12',
            'startzeit': None,
            'endzeit': None,
            'typ': 'todo',
            'fach': '',
            'owner_user_id': 1,
            'is_private': 1,
        }
    ]

    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'student'
        sess['class_id'] = 1

    update_resp = client.put(
        '/api/todos/12',
        json={'datum': '2026-03-13', 'enddatum': '2026-03-13', 'beschreibung': 'Updated'},
    )
    assert update_resp.status_code == 200
    assert storage['eintraege'][0]['beschreibung'] == 'Updated'
    assert storage['eintraege'][0]['datum'] == '2026-03-13'

    delete_resp = client.delete('/api/todos/12')
    assert delete_resp.status_code == 200
    assert storage['eintraege'] == []


def test_other_user_cannot_update_or_delete_foreign_todo(app_client):
    client, storage, _ = app_client
    storage['eintraege'] = [
        {
            'id': 44,
            'class_id': DEFAULT_ENTRY_CLASS_ID,
            'beschreibung': 'Foreign',
            'datum': '2026-03-12',
            'enddatum': '2026-03-12',
            'startzeit': None,
            'endzeit': None,
            'typ': 'todo',
            'fach': '',
            'owner_user_id': 2,
            'is_private': 1,
        }
    ]

    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'admin'
        sess['class_id'] = 1

    update_resp = client.put(
        '/api/todos/44',
        json={'datum': '2026-03-14', 'enddatum': '2026-03-14', 'beschreibung': 'Should fail'},
    )
    assert update_resp.status_code == 404

    delete_resp = client.delete('/api/todos/44')
    assert delete_resp.status_code == 404
    assert len(storage['eintraege']) == 1


def test_calendar_export_can_hide_todos(app_client):
    client, storage, _ = app_client
    today = datetime.date.today()
    future_a = today + datetime.timedelta(days=1)
    future_b = today + datetime.timedelta(days=2)

    storage['eintraege'] = [
        {
            'id': 71,
            'class_id': 'L23a',
            'beschreibung': 'Class event',
            'datum': future_a,
            'enddatum': future_a,
            'startzeit': None,
            'endzeit': None,
            'typ': 'event',
            'fach': 'MA',
            'owner_user_id': None,
            'is_private': 0,
        },
        {
            'id': 72,
            'class_id': DEFAULT_ENTRY_CLASS_ID,
            'beschreibung': 'My todo',
            'datum': future_b,
            'enddatum': future_b,
            'startzeit': None,
            'endzeit': None,
            'typ': 'todo',
            'fach': '',
            'owner_user_id': 1,
            'is_private': 1,
        },
    ]

    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'student'
        sess['class_id'] = 1
        sess['entry_class_id'] = 'L23a'

    default_resp = client.get('/calendar.ics')
    assert default_resp.status_code == 200
    default_text = default_resp.get_data(as_text=True)
    assert 'todo-72@homework-manager.akzuwo.ch' in default_text

    no_todo_resp = client.get('/calendar.ics?include_todos=0')
    assert no_todo_resp.status_code == 200
    no_todo_text = no_todo_resp.get_data(as_text=True)
    assert 'todo-72@homework-manager.akzuwo.ch' not in no_todo_text


def test_update_entry_without_class_ids_updates_all_linked_classes(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    storage['eintraege'] = [
        {
            'id': 91,
            'class_id': 'L23a',
            'beschreibung': 'Original',
            'datum': '2026-04-01',
            'enddatum': '2026-04-01',
            'startzeit': None,
            'endzeit': None,
            'typ': 'event',
            'fach': 'MA',
            'owner_user_id': None,
            'is_private': 0,
        },
        {
            'id': 91,
            'class_id': 'U24f',
            'beschreibung': 'Original',
            'datum': '2026-04-01',
            'enddatum': '2026-04-01',
            'startzeit': None,
            'endzeit': None,
            'typ': 'event',
            'fach': 'MA',
            'owner_user_id': None,
            'is_private': 0,
        },
    ]

    resp = client.put(
        '/update_entry',
        json={
            'id': 91,
            'type': 'event',
            'date': '2026-04-03',
            'description': 'Coupled update',
            'fach': 'DE',
        },
    )
    assert resp.status_code == 200
    changed = [entry for entry in storage['eintraege'] if entry['id'] == 91]
    assert {entry['beschreibung'] for entry in changed} == {'Coupled update'}
    assert {entry['datum'] for entry in changed} == {'2026-04-03'}


def test_delete_entry_removes_all_linked_classes_for_manager(app_client):
    client, storage, _ = app_client
    with client.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'teacher'

    storage['eintraege'] = [
        {
            'id': 92,
            'class_id': 'L23a',
            'beschreibung': 'Linked A',
            'datum': '2026-04-01',
            'enddatum': '2026-04-01',
            'startzeit': None,
            'endzeit': None,
            'typ': 'event',
            'fach': 'MA',
            'owner_user_id': None,
            'is_private': 0,
        },
        {
            'id': 92,
            'class_id': 'U24f',
            'beschreibung': 'Linked B',
            'datum': '2026-04-01',
            'enddatum': '2026-04-01',
            'startzeit': None,
            'endzeit': None,
            'typ': 'event',
            'fach': 'MA',
            'owner_user_id': None,
            'is_private': 0,
        },
    ]

    resp = client.delete('/delete_entry/92')
    assert resp.status_code == 200
    assert not any(entry['id'] == 92 for entry in storage['eintraege'])
