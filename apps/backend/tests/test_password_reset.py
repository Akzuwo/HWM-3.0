import datetime

from auth import utils as auth_utils


def test_password_reset_request_and_confirm(app_client, monkeypatch):
    client, storage, app_module = app_client

    sent = {}

    def fake_deliver(to_address, subject, body, **kwargs):
        sent['to'] = to_address
        sent['subject'] = subject
        sent['body'] = body

    monkeypatch.setattr(app_module, '_deliver_email', fake_deliver)

    resp = client.post(
        '/api/auth/password-reset',
        json={'action': 'request', 'email': 'admin@example.com'},
    )
    assert resp.status_code == 200
    assert sent['to'] == 'admin@example.com'

    resets = storage['password_resets']
    assert resets, 'expected stored reset entry'
    code = resets[-1]['code']

    resp = client.post(
        '/api/auth/password-reset',
        json={
            'action': 'confirm',
            'email': 'admin@example.com',
            'code': code,
            'password': 'NewSecret123!',
        },
    )
    assert resp.status_code == 200

    updated_hash = storage['users'][1]['password_hash']
    assert auth_utils.verify_password(updated_hash, 'NewSecret123!')

    used_entry = storage['password_resets'][0]
    assert used_entry['used_at'] is not None


def test_password_reset_invalid_code(app_client, monkeypatch):
    client, storage, app_module = app_client
    monkeypatch.setattr(app_module, '_deliver_email', lambda *args, **kwargs: None)

    resp = client.post(
        '/api/auth/password-reset',
        json={'action': 'request', 'email': 'admin@example.com'},
    )
    assert resp.status_code == 200

    resp = client.post(
        '/api/auth/password-reset',
        json={
            'action': 'confirm',
            'email': 'admin@example.com',
            'code': '99999999',
            'password': 'AnotherSecret123!',
        },
    )
    assert resp.status_code == 400
    assert resp.get_json()['message'] == 'invalid_code'

    resets = storage['password_resets']
    assert resets and resets[0]['used_at'] is None


def test_password_reset_expired_code(app_client):
    client, storage, _ = app_client

    now = datetime.datetime.utcnow()
    storage['password_resets'].append(
        {
            'id': storage['next_ids']['password_resets'],
            'user_id': 1,
            'email': 'admin@example.com',
            'code': '12345678',
            'expires_at': now - datetime.timedelta(minutes=1),
            'used_at': None,
            'created_at': now - datetime.timedelta(minutes=2),
        }
    )
    storage['next_ids']['password_resets'] += 1

    resp = client.post(
        '/api/auth/password-reset',
        json={
            'action': 'confirm',
            'email': 'admin@example.com',
            'code': '12345678',
            'password': 'ExpiredSecret123!',
        },
    )
    assert resp.status_code == 410
    assert resp.get_json()['message'] == 'code_expired'
    assert not storage['password_resets']


def test_password_reset_missing_email(app_client):
    client, _, _ = app_client

    resp = client.post('/api/auth/password-reset', json={'action': 'request'})
    assert resp.status_code == 400
    assert resp.get_json()['message'] == 'email_required'


def test_password_reset_requires_explicit_action(app_client, monkeypatch):
    client, _, app_module = app_client
    sent = {'count': 0}

    def fake_deliver(*args, **kwargs):
        sent['count'] += 1

    monkeypatch.setattr(app_module, '_deliver_email', fake_deliver)

    resp = client.post('/api/auth/password-reset', json={'email': 'admin@example.com'})
    assert resp.status_code == 400
    assert resp.get_json()['message'] == 'action_required'
    assert sent['count'] == 0
