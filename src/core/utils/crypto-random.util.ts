/**
 * Cryptographically Secure Random Number Generator Utility
 * 
 * This utility provides cryptographically secure random number generation
 * using Node.js crypto module instead of Math.random().
 * 
 * Security Note:
 * - Math.random() is NOT cryptographically secure and should NEVER be used
 *   for security-sensitive operations (tokens, session IDs, passwords, etc.)
 * - This utility uses crypto.randomBytes() which is cryptographically secure
 * 
 * @module CryptoRandomUtil
 */

import { randomBytes, randomInt } from 'crypto';

/**
 * Generate a cryptographically secure random string
 * 
 * @param length - Length of the random string (default: 16)
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Cryptographically secure random string
 * 
 * @example
 * ```typescript
 * const sessionId = CryptoRandom.randomString(32);
 * const token = CryptoRandom.randomString(64, 'hex');
 * ```
 */
export function randomString(length: number = 16, charset: 'alphanumeric' | 'hex' | 'base64' = 'alphanumeric'): string {
  if (charset === 'hex') {
    return randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length);
  }
  
  if (charset === 'base64') {
    return randomBytes(Math.ceil(length * 3 / 4)).toString('base64').substring(0, length);
  }
  
  // Alphanumeric: a-z, A-Z, 0-9
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      result += chars[byte % chars.length];
    }
  }

  return result;
}

/**
 * Generate a cryptographically secure random integer
 * 
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Cryptographically secure random integer
 * 
 * @example
 * ```typescript
 * const dice = CryptoRandom.randomInt(1, 7); // 1-6
 * const index = CryptoRandom.randomInt(0, array.length);
 * ```
 */
export function secureRandomInt(min: number, max: number): number {
  return randomInt(min, max);
}

/**
 * Generate a cryptographically secure random float between 0 and 1
 * 
 * @returns Cryptographically secure random float [0, 1)
 * 
 * @example
 * ```typescript
 * const probability = CryptoRandom.randomFloat();
 * if (probability < 0.5) {
 *   // 50% chance
 * }
 * ```
 */
export function randomFloat(): number {
  const bytes = randomBytes(4);
  const value = bytes.readUInt32BE(0);
  return value / 0x100000000; // Divide by 2^32
}

/**
 * Generate a cryptographically secure UUID v4
 * 
 * @returns Cryptographically secure UUID v4 string
 * 
 * @example
 * ```typescript
 * const id = CryptoRandom.randomUUID();
 * // e.g., "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function randomUUID(): string {
  const bytes = randomBytes(16);

  // Set version (4) and variant (RFC4122)
  // TypeScript: randomBytes(16) always returns a Buffer of exactly 16 bytes
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

/**
 * Generate a cryptographically secure session ID
 * 
 * @param prefix - Optional prefix for the session ID
 * @returns Cryptographically secure session ID
 * 
 * @example
 * ```typescript
 * const sessionId = CryptoRandom.sessionId('session');
 * // e.g., "session-1699564800000-a1b2c3d4e5f6"
 * ```
 */
export function sessionId(prefix: string = 'session'): string {
  const timestamp = Date.now();
  const random = randomString(12, 'hex');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a cryptographically secure token
 * 
 * @param length - Length of the token (default: 32)
 * @returns Cryptographically secure token
 * 
 * @example
 * ```typescript
 * const apiToken = CryptoRandom.token(64);
 * const resetToken = CryptoRandom.token(32);
 * ```
 */
export function token(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a cryptographically secure request ID
 * 
 * @param prefix - Prefix for the request ID
 * @returns Cryptographically secure request ID
 * 
 * @example
 * ```typescript
 * const requestId = CryptoRandom.requestId('req');
 * // e.g., "req-1699564800000-a1b2c3d4"
 * ```
 */
export function requestId(prefix: string): string {
  const timestamp = Date.now();
  const random = randomString(8, 'hex');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * CryptoRandom namespace - Cryptographically secure random utilities
 * 
 * @example
 * ```typescript
 * import { CryptoRandom } from '@/core/utils/crypto-random.util';
 * 
 * // Generate secure random string
 * const str = CryptoRandom.randomString(16);
 * 
 * // Generate secure random integer
 * const num = CryptoRandom.randomInt(1, 100);
 * 
 * // Generate secure UUID
 * const id = CryptoRandom.randomUUID();
 * 
 * // Generate secure session ID
 * const session = CryptoRandom.sessionId('session');
 * ```
 */
export const CryptoRandom = {
  randomString,
  randomInt: secureRandomInt,
  randomFloat,
  randomUUID,
  sessionId,
  token,
  requestId,
};

/**
 * Default export
 */
export default CryptoRandom;

