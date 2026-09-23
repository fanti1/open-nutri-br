import * as Crypto from 'expo-crypto';

/** Bytes aleatórios criptograficamente seguros do sistema (Android/iOS/navegador). */
export function secureRandomBytes(length: number): Uint8Array {
  return Crypto.getRandomBytes(length);
}
