import datetime

from schedule_importer import calculate_import_hash, load_schedule_from_payload


def test_admin_schedule_import_success(app_client):
    client, storage, _ = app_client

    resp = client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'adminpw'})
    assert resp.status_code == 200

    payload = {
        'class_identifier': 'default',
        'schedule': {
            'Monday': [
                {'start': '08:00', 'end': '08:45', 'fach': 'Mathematik', 'raum': '101'},
                {'start': '09:00', 'end': '09:45', 'fach': 'Deutsch'},
            ],
        },
    }

    expected_schedule = load_schedule_from_payload(payload['schedule'])
    expected_hash = calculate_import_hash(expected_schedule)
    expected_count = sum(len(entries) for entries in expected_schedule.values())

    resp = client.post('/api/admin/schedule-import', json=payload)
    assert resp.status_code == 200, resp.get_json()
    response_data = resp.get_json()
    assert response_data['status'] == 'ok'
    assert response_data['inserted'] == expected_count
    assert response_data['import_hash'] == expected_hash

    entries = storage['stundenplan_entries']
    assert len(entries) == expected_count
    assert all(entry['class_id'] == 1 for entry in entries)
    assert any(entry['raum'] == '-' for entry in entries)

    schedules = storage['class_schedules']
    assert schedules, 'class schedule metadata should be created'
    schedule_record = next(iter(schedules.values()))
    assert schedule_record['class_id'] == 1
    assert schedule_record['import_hash'] == expected_hash
    assert schedule_record['source'] == 'admin_api'
    assert isinstance(schedule_record['imported_at'], datetime.datetime)


def test_admin_schedule_import_validation_error(app_client):
    client, storage, _ = app_client

    resp = client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'adminpw'})
    assert resp.status_code == 200

    storage['stundenplan_entries'].append(
        {
            'id': 1,
            'class_id': 1,
            'tag': 'Monday',
            'start': '08:00',
            'end': '08:45',
            'fach': 'Chemie',
            'raum': '301',
        }
    )

    bad_payload = {
        'class_identifier': 'default',
        'schedule': {
            'Monday': [
                {'end': '08:45', 'fach': 'Mathematik'},
            ]
        },
    }

    resp = client.post('/api/admin/schedule-import', json=bad_payload)
    assert resp.status_code == 400, resp.get_json()
    response_data = resp.get_json()
    assert response_data['status'] == 'error'
    assert "missing 'start'" in response_data['message']

    # Ensure existing entries remain untouched
    entries = storage['stundenplan_entries']
    assert len(entries) == 1
    assert entries[0]['fach'] == 'Chemie'

    # No schedule metadata should be created
    assert not storage['class_schedules']
