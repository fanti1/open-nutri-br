import { randomBytes as nodeRandomBytes } from 'crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { toBase64 } from '../backupCrypto';
import { createLock, isValidPin, PIN_ITERATIONS, recordAttempt, remainingWait, shouldLockAfter, verifyPin, waitAfterFailures } from '../appLock';

const random = (length: number) => new Uint8Array(nodeRandomBytes(length));

describe('app lock', () => {
  it('accepts only 4 to 6 digit PINs', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('123456')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('1234567')).toBe(false);
  });

  it('stores only a salted hash and verifies the PIN', async () => {
    const lock = await createLock('2580', random, true);
    expect(JSON.stringify(lock)).not.toContain('2580');
    expect(lock.pin_length).toBe(4);
    expect(await verifyPin('2580', lock)).toBe(true);
    expect(await verifyPin('2581', lock)).toBe(false);
    expect(await verifyPin('', lock)).toBe(false);

    const other = await createLock('2580', random, true);
    expect(other.pin_hash).not.toBe(lock.pin_hash); // sal diferente
  });

  it('locks again only after the configured time in background', async () => {
    const lock = await createLock('1234', random, false, 60);
    expect(shouldLockAfter(0, 59_000, lock)).toBe(false);
    expect(shouldLockAfter(0, 60_000, lock)).toBe(true);
    expect(shouldLockAfter(null, 999_999, lock)).toBe(false);
    expect(shouldLockAfter(0, 999_999, null)).toBe(false);
  });

  it('records the iterations used, and still opens locks made before that field existed', async () => {
    const lock = await createLock('2580', random, false);
    expect(lock.iterations).toBe(PIN_ITERATIONS);

    const salt = random(16);
    const legacyHash = toBase64(await pbkdf2Async(sha256, '2580', salt, { c: 100_000, dkLen: 32 }));
    const legacy = { pin_hash: legacyHash, salt: toBase64(salt), pin_length: 4, biometrics: false, timeout_s: 60 };
    expect(await verifyPin('2580', legacy)).toBe(true);
    expect(await verifyPin('2581', legacy)).toBe(false);
  });

  it('makes the keypad wait after repeated wrong PINs, growing up to 15 minutes', () => {
    expect([1, 2, 3, 4, 6, 9].map(waitAfterFailures)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(waitAfterFailures(5)).toBe(30_000);
    expect(waitAfterFailures(10)).toBe(60_000);
    expect(waitAfterFailures(15)).toBe(120_000);
    expect(waitAfterFailures(50)).toBe(15 * 60_000);
  });

  it('counts consecutive failures, blocks on the fifth and resets on success', async () => {
    let lock = await createLock('2580', random, false);
    for (let i = 0; i < 4; i++) lock = recordAttempt(lock, false, 1_000);
    expect(lock.failed_attempts).toBe(4);
    expect(remainingWait(lock, 1_000)).toBe(0);

    lock = recordAttempt(lock, false, 1_000);
    expect(remainingWait(lock, 1_000)).toBe(30);
    expect(remainingWait(lock, 30_999)).toBe(1);
    expect(remainingWait(lock, 31_000)).toBe(0);

    lock = recordAttempt(lock, true, 40_000);
    expect(lock.failed_attempts).toBe(0);
    expect(remainingWait(lock, 40_000)).toBe(0);
  });
});
