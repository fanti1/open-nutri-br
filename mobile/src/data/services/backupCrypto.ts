import { gcm } from '@noble/ciphers/aes';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

/**
 * Backup protegido por senha: a chave vem da senha (PBKDF2-SHA256) e o
 * conteúdo é cifrado com AES-256-GCM, que também detecta arquivo adulterado
 * ou senha errada. Os parâmetros vão no próprio arquivo, então dá para
 * aumentar as iterações no futuro sem perder backups antigos.
 */
export const ENCRYPTED_BACKUP_FORMAT = 'opennutri-br-backup-cifrado';
export const PBKDF2_ITERATIONS = 200_000;
export const MIN_PASSWORD_LENGTH = 8;

export interface EncryptedBackupFile {
  format: typeof ENCRYPTED_BACKUP_FORMAT;
  version: 1;
  kdf: { name: 'PBKDF2-SHA256'; iterations: number; salt: string };
  cipher: { name: 'AES-256-GCM'; iv: string };
  data: string;
}

export class WrongPasswordError extends Error {
  constructor() {
    super('Senha incorreta — ou o arquivo foi alterado.');
  }
}

export type RandomBytes = (length: number) => Uint8Array;

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const CHUNK = 8192;

/** Junta pedaços em blocos: backups com anexos têm vários MB. */
function joinChunks(parts: string[]): string {
  const chunks: string[] = [];
  for (let i = 0; i < parts.length; i += CHUNK) chunks.push(parts.slice(i, i + CHUNK).join(''));
  return chunks.join('');
}

export function toBase64(bytes: Uint8Array): string {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = (a << 16) | (b << 8) | c;
    parts.push(
      BASE64[(n >> 18) & 63] + BASE64[(n >> 12) & 63] + (i + 1 < bytes.length ? BASE64[(n >> 6) & 63] : '=') + (i + 2 < bytes.length ? BASE64[n & 63] : '='),
    );
  }
  return joinChunks(parts);
}

export function fromBase64(text: string): Uint8Array {
  const clean = text.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let length = 0;
  for (let i = 0; i < clean.length; i += 4) {
    let n = 0;
    for (let k = 0; k < 4; k++) n = (n << 6) | (i + k < clean.length ? BASE64.indexOf(clean[i + k]) : 0);
    bytes[length++] = (n >> 16) & 255;
    if (i + 2 < clean.length) bytes[length++] = (n >> 8) & 255;
    if (i + 3 < clean.length) bytes[length++] = n & 255;
  }
  return bytes.slice(0, length);
}

/** UTF-8 sem depender de TextEncoder/TextDecoder (nem todo motor JS do celular tem). */
export function utf8Encode(text: string): Uint8Array {
  const out: number[] = [];
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    } else if (code < 0x10000) {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    } else {
      out.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 63), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    }
  }
  return new Uint8Array(out);
}

export function utf8Decode(bytes: Uint8Array): string {
  const parts: string[] = [];
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    let code: number;
    if (b < 0x80) {
      code = b;
      i += 1;
    } else if (b < 0xe0) {
      code = ((b & 31) << 6) | (bytes[i + 1] & 63);
      i += 2;
    } else if (b < 0xf0) {
      code = ((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63);
      i += 3;
    } else {
      code = ((b & 7) << 18) | ((bytes[i + 1] & 63) << 12) | ((bytes[i + 2] & 63) << 6) | (bytes[i + 3] & 63);
      i += 4;
    }
    parts.push(String.fromCodePoint(code));
  }
  return joinChunks(parts);
}

function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  return pbkdf2Async(sha256, password.normalize('NFC'), salt, { c: iterations, dkLen: 32, asyncTick: 20 });
}

export async function encryptBackup(json: string, password: string, randomBytes: RandomBytes, iterations = PBKDF2_ITERATIONS): Promise<EncryptedBackupFile> {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(password, salt, iterations);
  const data = gcm(key, iv).encrypt(utf8Encode(json));
  return {
    format: ENCRYPTED_BACKUP_FORMAT,
    version: 1,
    kdf: { name: 'PBKDF2-SHA256', iterations, salt: toBase64(salt) },
    cipher: { name: 'AES-256-GCM', iv: toBase64(iv) },
    data: toBase64(data),
  };
}

export async function decryptBackup(file: EncryptedBackupFile, password: string): Promise<string> {
  const key = await deriveKey(password, fromBase64(file.kdf.salt), file.kdf.iterations);
  try {
    return utf8Decode(gcm(key, fromBase64(file.cipher.iv)).decrypt(fromBase64(file.data)));
  } catch {
    throw new WrongPasswordError();
  }
}

export function isEncryptedBackup(value: unknown): value is EncryptedBackupFile {
  return typeof value === 'object' && value !== null && (value as { format?: string }).format === ENCRYPTED_BACKUP_FORMAT;
}
