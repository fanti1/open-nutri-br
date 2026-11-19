import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** Gera o PDF e abre o compartilhamento (celular) ou a janela de impressão/"Salvar como PDF" (navegador). */
export async function exportPdf(html: string): Promise<void> {
  if (Platform.OS === 'web') {
    await printHtmlOnWeb(html);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

/**
 * No navegador o expo-print ignora o HTML e imprime a página atual (a tela do app).
 * Aqui o relatório vai para um quadro oculto, e é ele que se imprime.
 */
function printHtmlOnWeb(html: string): Promise<void> {
  return new Promise((resolve) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      // O diálogo de impressão bloqueia até fechar; depois o quadro pode sair da página.
      setTimeout(() => frame.remove(), 1000);
      resolve();
    };
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}
