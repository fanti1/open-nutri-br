import { randomBytes as nodeRandomBytes } from 'crypto';
import {
  decryptBackup,
  encryptBackup,
  fromBase64,
  isEncryptedBackup,
  toBase64,
  utf8Decode,
  utf8Encode,
  WrongPasswordError,
} from '../backupCrypto';

const random = (length: number) => new Uint8Array(nodeRandomBytes(length));
// Poucas iterações nos testes (a produção usa PBKDF2_ITERATIONS).
const FAST = 1000;

describe('password-protected backup', () => {
  it('round-trips text with accents and emoji', async () => {
    const json = JSON.stringify({ paciente: 'Maria Conceição', nota: 'pão de queijo 🧀', valores: [1, 2, 3] });
    const file = await encryptBackup(json, 'senha forte 123', random, FAST);

    expect(isEncryptedBackup(file)).toBe(true);
    expect(file.data).not.toContain('Maria');
    expect(await decryptBackup(file, 'senha forte 123')).toBe(json);
  });

  it('rejects a wrong password and a tampered file', async () => {
    const file = await encryptBackup('{"a":1}', 'senha-certa', random, FAST);
    await expect(decryptBackup(file, 'senha-errada')).rejects.toBeInstanceOf(WrongPasswordError);

    const bytes = fromBase64(file.data);
    bytes[0] ^= 1;
    await expect(decryptBackup({ ...file, data: toBase64(bytes) }, 'senha-certa')).rejects.toBeInstanceOf(WrongPasswordError);
  });

  it('uses a fresh salt and IV each time', async () => {
    const a = await encryptBackup('x', 'senha1234', random, FAST);
    const b = await encryptBackup('x', 'senha1234', random, FAST);
    expect(a.kdf.salt).not.toBe(b.kdf.salt);
    expect(a.cipher.iv).not.toBe(b.cipher.iv);
  });

  it('encodes base64 and UTF-8 exactly like Node', () => {
    const bytes = random(1000);
    expect(toBase64(bytes)).toBe(Buffer.from(bytes).toString('base64'));
    expect(fromBase64(Buffer.from(bytes).toString('base64'))).toEqual(bytes);
    const text = 'ação, ñ, ü — 😀 𝔘';
    expect(Buffer.from(utf8Encode(text)).toString('utf8')).toBe(text);
    expect(utf8Decode(new Uint8Array(Buffer.from(text, 'utf8')))).toBe(text);
  });
});
