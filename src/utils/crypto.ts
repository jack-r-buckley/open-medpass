import * as Crypto from 'expo-crypto';

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return Crypto.randomUUID();
}

/**
 * Hash a string using SHA-256
 */
export async function hashString(input: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
  return hash;
}

/**
 * Generate a simple key pair (for POC - not production grade)
 * In production, we'd use proper asymmetric crypto
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const publicKey = generateUUID();
  const privateKey = generateUUID();
  return { publicKey, privateKey };
}

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

