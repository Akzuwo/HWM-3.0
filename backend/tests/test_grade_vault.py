import json


def _authenticate(client, user_id=1):
    with client.session_transaction() as sess:
        sess['user_id'] = user_id
        sess['role'] = 'student'
        sess['class_id'] = 1


def _vault(ciphertext='ciphertext-value'):
    return {
        'version': 1,
        'algorithm': 'AES-GCM',
        'kdf': 'PBKDF2',
        'iterations': 250000,
        'salt': 'salt-value',
        'iv': 'iv-value',
        'ciphertext': ciphertext,
    }


def test_grade_vault_requires_login(app_client):
    client, _, _ = app_client

    resp = client.get('/api/grades/vault')

    assert resp.status_code == 401


def test_grade_vault_create_load_update_and_delete(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    empty_resp = client.get('/api/grades/vault')
    assert empty_resp.status_code == 200
    assert empty_resp.get_json()['data']['revision'] == 0
    assert empty_resp.get_json()['data']['vault_json'] is None

    create_resp = client.put('/api/grades/vault', json={'baseRevision': 0, 'vault_json': _vault()})
    assert create_resp.status_code == 200
    assert create_resp.get_json()['data']['revision'] == 1

    stored = storage['encrypted_grade_vaults'][1]
    assert json.loads(stored['vault_json'])['ciphertext'] == 'ciphertext-value'

    load_resp = client.get('/api/grades/vault')
    assert load_resp.status_code == 200
    loaded = load_resp.get_json()['data']
    assert loaded['revision'] == 1
    assert json.loads(loaded['vault_json'])['algorithm'] == 'AES-GCM'

    update_resp = client.put('/api/grades/vault', json={'baseRevision': 1, 'vault_json': _vault('next')})
    assert update_resp.status_code == 200
    assert update_resp.get_json()['data']['revision'] == 2

    delete_resp = client.delete('/api/grades/vault')
    assert delete_resp.status_code == 200
    assert 1 not in storage['encrypted_grade_vaults']


def test_grade_vault_revision_conflict(app_client):
    client, _, _ = app_client
    _authenticate(client)

    first = client.put('/api/grades/vault', json={'baseRevision': 0, 'vault_json': _vault('first')})
    assert first.status_code == 200

    conflict = client.put('/api/grades/vault', json={'baseRevision': 0, 'vault_json': _vault('stale')})

    assert conflict.status_code == 409
    data = conflict.get_json()
    assert data['message'] == 'revision_conflict'
    assert data['currentRevision'] == 1


def test_grade_vault_rejects_invalid_payload(app_client):
    client, storage, _ = app_client
    _authenticate(client)

    resp = client.put('/api/grades/vault', json={'baseRevision': 0, 'vault_json': {'ciphertext': 'plain'}})

    assert resp.status_code == 400
    assert storage['encrypted_grade_vaults'] == {}
