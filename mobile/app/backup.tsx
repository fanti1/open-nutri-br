import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';
import { useData } from '../src/data/DataProvider';
import { useSettings } from '../src/data/hooks';
import { InvalidBackupError } from '../src/data/services/backupService';
import { pickTextFile, shareTextFile } from '../src/features/files/fileService';
import { formatDateTime, toDateOnly } from '../src/lib/format';
import { useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { Button } from '../src/ui/Button';
import { Card } from '../src/ui/Card';
import { confirm, inform } from '../src/ui/dialogs';
import { Screen } from '../src/ui/Screen';
import { Section } from '../src/ui/Section';
import { toast } from '../src/ui/Toast';

export default function BackupScreen() {
  const { colors } = useTheme();
  const { backup, agenda, taskActions, settings } = useData();
  const { data: appSettings } = useSettings();
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  const exportBackup = async () => {
    setBusy('export');
    try {
      const file = await backup.exportData();
      await shareTextFile(`opennutri-backup-${toDateOnly(new Date())}.json`, 'application/json', JSON.stringify(file));
      await settings.set('last_backup_at', file.exported_at);
      toast.success('Backup gerado');
    } catch {
      toast.error('Não foi possível gerar o backup.');
    } finally {
      setBusy(null);
    }
  };

  const importBackup = async () => {
    const ok = await confirm(
      'Restaurar backup',
      'Todos os dados atuais deste aparelho serão substituídos pelos do arquivo. Deseja continuar?',
      'Escolher arquivo',
      true,
    );
    if (!ok) return;

    setBusy('import');
    try {
      const text = await pickTextFile();
      if (!text) return;
      await backup.restore(backup.parse(text));
      await agenda.rescheduleAll();
      await taskActions.rescheduleAll();
      toast.success('Backup restaurado');
    } catch (error) {
      inform('Não foi possível restaurar', error instanceof InvalidBackupError ? error.message : 'O arquivo não pôde ser lido.');
    } finally {
      setBusy(null);
    }
  };

  const lastBackup = appSettings?.last_backup_at;

  return (
    <Screen back title="Backup e restauração" subtitle="Guarde uma cópia dos seus dados onde quiser">
      <Card tone="alt" style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <AppText variant="heading">Como funciona</AppText>
        </View>
        <AppText tone="muted">
          Seus dados ficam só neste aparelho. O backup gera um único arquivo com pacientes, atendimentos, cálculos, arquivos anexados, agenda,
          tarefas e preferências.
        </AppText>
        <AppText tone="muted">
          No celular, escolha “Salvar no Drive” (ou iCloud, e-mail, WhatsApp) no menu de compartilhamento. No computador, o arquivo é baixado e
          você pode enviá-lo ao Google Drive.
        </AppText>
        <AppText tone="muted">O arquivo contém dados de saúde: guarde-o em local protegido.</AppText>
      </Card>

      <Section title="Fazer backup">
        <Card style={{ gap: 12 }}>
          <AppText tone={lastBackup ? 'default' : 'warning'}>
            {lastBackup ? `Último backup: ${formatDateTime(lastBackup)}` : 'Você ainda não fez nenhum backup.'}
          </AppText>
          <Button label="Gerar e salvar backup" icon="cloud-upload-outline" onPress={exportBackup} loading={busy === 'export'} fullWidth />
        </Card>
      </Section>

      <Section title="Restaurar">
        <Card style={{ gap: 12 }}>
          <AppText tone="muted">Use ao trocar de aparelho ou reinstalar o app. Os lembretes são reagendados automaticamente.</AppText>
          <Button label="Restaurar de um arquivo" icon="cloud-download-outline" variant="secondary" onPress={importBackup} loading={busy === 'import'} fullWidth />
        </Card>
      </Section>
    </Screen>
  );
}
