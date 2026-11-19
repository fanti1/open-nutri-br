import { Platform, Share } from 'react-native';
import { toast } from '../ui/Toast';

/**
 * Compartilha um texto pela folha do sistema. No navegador sem compartilhamento
 * (a maioria dos computadores), copia o texto para a área de transferência e avisa.
 */
export async function shareText(message: string): Promise<void> {
  if (Platform.OS === 'web' && (typeof navigator === 'undefined' || !navigator.share)) {
    try {
      await navigator.clipboard.writeText(message);
      toast.success('Texto copiado. Cole onde quiser enviar.');
    } catch {
      toast.error('Não foi possível copiar o texto neste navegador.');
    }
    return;
  }

  try {
    await Share.share({ message });
  } catch {
    // Compartilhamento cancelado ou indisponível: nada a fazer.
  }
}
