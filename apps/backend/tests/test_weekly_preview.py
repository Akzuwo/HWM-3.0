import datetime


def _authenticate(client, user_id=1, role='student', entry_class_id='L23a'):
    with client.session_transaction() as sess:
        sess['user_id'] = user_id
        sess['role'] = role
        sess['is_admin'] = role == 'admin'
        sess['entry_class_id'] = entry_class_id


def _add_entry(storage, **kwargs):
    next_id = storage['next_ids']['eintraege']
    storage['next_ids']['eintraege'] = next_id + 1
    row = {
        'id': next_id,
        'class_id': 'L23a',
        'beschreibung': 'Entry',
        'datum': datetime.date.today(),
        'enddatum': datetime.date.today(),
        'startzeit': None,
        'endzeit': None,
        'typ': 'event',
        'fach': '',
        'owner_user_id': None,
        'is_private': 0,
    }
    row.update(kwargs)
    storage['eintraege'].append(row)
    return row


def test_weekly_preview_requires_auth(app_client):
    client, _, _ = app_client

    resp = client.get('/api/weekly-preview')
    assert resp.status_code == 401


def test_weekly_preview_rejects_guest_role(app_client):
    client, _, _ = app_client
    _authenticate(client, role='guest')

    resp = client.get('/api/weekly-preview')
    assert resp.status_code == 403


def test_weekly_preview_returns_cached_when_valid(app_client, monkeypatch):
    client, storage, app_module = app_client
    _authenticate(client)

    due = datetime.date.today() + datetime.timedelta(days=1)
    _add_entry(storage, class_id='L23a', typ='hausaufgabe', beschreibung='Math tasks', datum=due, enddatum=due)

    call_counter = {'count': 0}

    def fake_openai(payload, locale):
        call_counter['count'] += 1
        return '- Focus on math tasks.'

    monkeypatch.setattr(app_module, '_generate_weekly_preview_with_groq', fake_openai)

    first = client.get('/api/weekly-preview?lang=de')
    assert first.status_code == 200
    assert first.get_json()['cached'] is False
    assert call_counter['count'] == 1

    second = client.get('/api/weekly-preview?lang=de')
    assert second.status_code == 200
    payload = second.get_json()
    assert payload['cached'] is True
    assert call_counter['count'] == 1


def test_weekly_preview_force_bypasses_cache(app_client, monkeypatch):
    client, storage, app_module = app_client
    _authenticate(client)

    due = datetime.date.today() + datetime.timedelta(days=2)
    _add_entry(storage, class_id='L23a', typ='pruefung', beschreibung='Physics exam', datum=due, enddatum=due)

    call_counter = {'count': 0}

    def fake_openai(payload, locale):
        call_counter['count'] += 1
        return '- Prepare for physics exam.'

    monkeypatch.setattr(app_module, '_generate_weekly_preview_with_groq', fake_openai)

    first = client.get('/api/weekly-preview?lang=en')
    assert first.status_code == 200
    assert first.get_json()['cached'] is False

    second = client.get('/api/weekly-preview?lang=en&force=1')
    assert second.status_code == 200
    assert second.get_json()['cached'] is False
    assert call_counter['count'] == 2


def test_weekly_preview_includes_private_todos_of_owner_only(app_client, monkeypatch):
    client, storage, app_module = app_client
    _authenticate(client, user_id=1, role='student', entry_class_id='L23a')

    now = datetime.datetime.utcnow()
    storage['users'][2] = {
        'id': 2,
        'email': 'other@example.com',
        'password_hash': storage['users'][1]['password_hash'],
        'role': 'student',
        'class_id': 1,
        'is_active': 1,
        'created_at': now,
        'updated_at': now,
        'email_verified_at': now,
    }
    storage['users_by_email']['other@example.com'] = 2
    storage['next_ids']['users'] = max(storage['next_ids']['users'], 3)

    due = datetime.date.today() + datetime.timedelta(days=1)
    _add_entry(storage, class_id='L23a', typ='event', beschreibung='Class event', datum=due, enddatum=due)
    _add_entry(
        storage,
        class_id='L23a',
        typ='todo',
        beschreibung='My private todo',
        datum=due,
        enddatum=due,
        is_private=1,
        owner_user_id=1,
    )
    _add_entry(
        storage,
        class_id='L23a',
        typ='todo',
        beschreibung='Other private todo',
        datum=due,
        enddatum=due,
        is_private=1,
        owner_user_id=2,
    )

    captured = {'payload': None}

    def fake_openai(payload, locale):
        captured['payload'] = payload
        return '- Weekly summary.'

    monkeypatch.setattr(app_module, '_generate_weekly_preview_with_groq', fake_openai)

    resp = client.get('/api/weekly-preview?lang=de')
    assert resp.status_code == 200

    payload = captured['payload']
    assert payload is not None
    descriptions = [item.get('beschreibung') for item in payload]
    assert 'My private todo' in descriptions
    assert 'Other private todo' not in descriptions


def test_weekly_preview_filters_by_active_class_for_class_entries(app_client, monkeypatch):
    client, storage, app_module = app_client
    _authenticate(client, entry_class_id='L23a')

    due = datetime.date.today() + datetime.timedelta(days=1)
    _add_entry(storage, class_id='L23a', typ='hausaufgabe', beschreibung='Class A work', datum=due, enddatum=due)
    _add_entry(storage, class_id='U24f', typ='hausaufgabe', beschreibung='Class B work', datum=due, enddatum=due)

    captured = {'payload': None}

    def fake_openai(payload, locale):
        captured['payload'] = payload
        return '- Summary.'

    monkeypatch.setattr(app_module, '_generate_weekly_preview_with_groq', fake_openai)

    resp = client.get('/api/weekly-preview')
    assert resp.status_code == 200

    payload = captured['payload']
    descriptions = [item.get('beschreibung') for item in payload]
    assert 'Class A work' in descriptions
    assert 'Class B work' not in descriptions


def test_weekly_preview_fallback_when_openai_fails(app_client, monkeypatch):
    client, storage, app_module = app_client
    _authenticate(client)

    due = datetime.date.today() + datetime.timedelta(days=1)
    _add_entry(storage, class_id='L23a', typ='event', beschreibung='Fallback event', datum=due, enddatum=due)

    def fail_openai(payload, locale):
        raise RuntimeError('boom')

    monkeypatch.setattr(app_module, '_generate_weekly_preview_with_groq', fail_openai)

    resp = client.get('/api/weekly-preview?lang=en')
    assert resp.status_code == 200
    body = resp.get_json()
    assert body['generated_by'] == 'fallback'
    assert body['summary']
    assert 'next 7 days' in body['summary'].lower()


def test_weekly_preview_respects_include_todos_0(app_client, monkeypatch):
    client, storage, app_module = app_client
    _authenticate(client)

    due = datetime.date.today() + datetime.timedelta(days=1)
    _add_entry(storage, class_id='L23a', typ='event', beschreibung='Visible class event', datum=due, enddatum=due)
    _add_entry(
        storage,
        class_id='L23a',
        typ='todo',
        beschreibung='Hidden todo',
        datum=due,
        enddatum=due,
        is_private=1,
        owner_user_id=1,
    )

    captured = {'payload': None}

    def fake_openai(payload, locale):
        captured['payload'] = payload
        return '- Summary.'

    monkeypatch.setattr(app_module, '_generate_weekly_preview_with_groq', fake_openai)

    resp = client.get('/api/weekly-preview?include_todos=0&lang=de')
    assert resp.status_code == 200

    payload = captured['payload']
    assert all(item.get('typ') != 'todo' for item in payload)


def test_weekly_preview_cache_key_differs_by_locale(app_client, monkeypatch):
    client, storage, app_module = app_client
    _authenticate(client)

    due = datetime.date.today() + datetime.timedelta(days=1)
    _add_entry(storage, class_id='L23a', typ='event', beschreibung='Locale event', datum=due, enddatum=due)

    def fake_openai(payload, locale):
        return f'- Locale: {locale}'

    monkeypatch.setattr(app_module, '_generate_weekly_preview_with_groq', fake_openai)

    resp_de = client.get('/api/weekly-preview?lang=de')
    resp_en = client.get('/api/weekly-preview?lang=en')

    assert resp_de.status_code == 200
    assert resp_en.status_code == 200

    locales = {row.get('locale') for row in storage['weekly_preview_cache']}
    assert 'de' in locales
    assert 'en' in locales
