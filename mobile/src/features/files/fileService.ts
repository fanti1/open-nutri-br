import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface PickedFile {
  name: string;
  mimeType: string | null;
  size: number;
  base64: string;
}

function stripDataUrl(value: string): string {
  const comma = value.indexOf(',');
  return value.startsWith('data:') && comma >= 0 ? value.slice(comma + 1) : value;
}

/** Seleciona um arquivo do aparelho/computador (exame, foto, PDF) e devolve o conteúdo em base64. */
export async function pickFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, base64: true, multiple: false });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const base64 = Platform.OS === 'web' ? stripDataUrl(asset.base64 ?? asset.uri) : await new File(asset.uri).base64();

  return {
    name: asset.name,
    mimeType: asset.mimeType ?? null,
    size: asset.size ?? Math.floor((base64.length * 3) / 4),
    base64,
  };
}

/** Lê um arquivo de texto escolhido pelo usuário (ex.: backup .json). */
export async function pickTextFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, type: ['application/json', '*/*'], base64: false });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  if (Platform.OS === 'web') return asset.file ? asset.file.text() : fetch(asset.uri).then((r) => r.text());
  return new File(asset.uri).text();
}

function downloadOnWeb(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Abre o menu "Compartilhar" do celular (salvar no Google Drive, iCloud,
 * WhatsApp, e-mail...) — no navegador, baixa o arquivo.
 */
export async function shareBase64File(name: string, mimeType: string | null, base64: string): Promise<void> {
  if (Platform.OS === 'web') {
    downloadOnWeb(new Blob([base64ToBytes(base64) as BlobPart], { type: mimeType ?? 'application/octet-stream' }), name);
    return;
  }

  const file = new File(Paths.cache, name);
  file.write(base64, { encoding: 'base64' });
  await Sharing.shareAsync(file.uri, { mimeType: mimeType ?? undefined, dialogTitle: name });
}

export async function shareTextFile(name: string, mimeType: string, text: string): Promise<void> {
  if (Platform.OS === 'web') {
    downloadOnWeb(new Blob([text], { type: mimeType }), name);
    return;
  }

  const file = new File(Paths.cache, name);
  file.write(text);
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: name });
}
