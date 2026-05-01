import { describe, it, expect } from 'vitest';
import { hashPin } from '../src/lib/hash';

// Polyfill crypto for the happy-dom environment if missing
if (!globalThis.crypto) {
  const crypto = require('crypto');
  globalThis.crypto = {
    subtle: {
      digest: async (algo: string, data: Uint8Array) => {
        return crypto.createHash('sha256').update(data).digest();
      }
    }
  } as any;
}

describe('hashPin Utility', () => {
  it('hashes a 4-digit PIN into a 64-character SHA-256 string', async () => {
    const pin1 = '1234';
    const hash1 = await hashPin(pin1);
    
    expect(hash1.length).toBe(64);
    // sha256 of 1234
    expect(hash1).toBe('03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
  });

  it('produces identical hashes for identical inputs', async () => {
    const pin = '9999';
    const hash1 = await hashPin(pin);
    const hash2 = await hashPin(pin);
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different inputs', async () => {
    const hash1 = await hashPin('1111');
    const hash2 = await hashPin('1112');
    expect(hash1).not.toBe(hash2);
  });
});
