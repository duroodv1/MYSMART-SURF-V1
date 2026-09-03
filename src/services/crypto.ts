/**
 * MYSMART SURF - Cryptographic & Security Service
 * Implements PBKDF2 with SHA-256 and Web Crypto API.
 * Never stores plain-text passwords.
 */

// Convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map((value) => {
    const hexCode = value.toString(16);
    return hexCode.padStart(2, '0');
  });
  return hexCodes.join('');
}

// Generate random salt
export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return bufferToHex(array.buffer);
}

// Hash password with salt using PBKDF2
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Convert salt hex back to buffer
  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  const derivedKey = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  return bufferToHex(derivedKey);
}

// Verify password against stored hash
export async function verifyPassword(
  attempt: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  try {
    const attemptHash = await hashPassword(attempt, storedSalt);
    if (attemptHash.length !== storedHash.length) return false;
    let match = 0;
    for (let i = 0; i < attemptHash.length; i++) {
      match |= attemptHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return match === 0;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

export const CryptoService = {
  generateSalt,
  hashPassword,
  verifyPassword,
};
