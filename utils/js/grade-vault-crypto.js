const ITERATIONS = 250000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value || ''));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function ensureCrypto() {
  if (!window.crypto?.subtle) {
    throw new Error('crypto_unavailable');
  }
  return window.crypto;
}

async function deriveKey(password, salt) {
  const crypto = ensureCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    TEXT_ENCODER.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptGradeVault(vault, password) {
  if (!password) {
    throw new Error('missing_sync_password');
  }
  const crypto = ensureCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);
  const plaintext = TEXT_ENCODER.encode(JSON.stringify(vault));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    version: 1,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2',
    iterations: ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
}

export async function decryptGradeVault(encryptedVault, password) {
  if (!password) {
    throw new Error('missing_sync_password');
  }
  if (
    !encryptedVault ||
    encryptedVault.version !== 1 ||
    encryptedVault.algorithm !== 'AES-GCM' ||
    encryptedVault.kdf !== 'PBKDF2'
  ) {
    throw new Error('invalid_encrypted_vault');
  }
  const salt = base64ToBytes(encryptedVault.salt);
  const iv = base64ToBytes(encryptedVault.iv);
  const ciphertext = base64ToBytes(encryptedVault.ciphertext);
  const key = await deriveKey(password, salt);
  try {
    const decrypted = await ensureCrypto().subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(TEXT_DECODER.decode(decrypted));
  } catch (error) {
    throw new Error('wrong_sync_password');
  }
}
