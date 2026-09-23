import { useState } from 'react';
import { View } from 'react-native';
import { useData } from '../src/data/DataProvider';
import { useSettings } from '../src/data/hooks';
import { backupOverdue, InvalidBackupError } from '../src/data/services/backupService';
import { pickTextFile, shareTextFile } from '../src/features/files/fileService';
import { formatDateTime, toDateOnly } from '../src/lib/format';
import { useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { Button } from '../src/ui/Button';
import { Card } from '../src/ui/Card';
import { confirm, inform } from '../src/ui/dialogs';
import { Screen } from '../src/ui/Screen';
import { IconTile } from '../src/ui/IconTile';
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
  const overdue = backupOverdue(lastBackup ?? null);

  return (
    <Screen back title="Backup" subtitle="Seus dados ficam só no aparelho — o backup é a cópia de segurança">
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconTile name="logo-google" size={44} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="heading">Google Drive</AppText>
            <AppText variant="caption" tone={overdue ? 'warning' : 'muted'}>
              {lastBackup ? `Último backup: ${formatDateTime(lastBackup)}` : 'Nenhum backup feito ainda'}
            </AppText>
          </View>
        </View>

        <Button label="Salvar backup no Google Drive" icon="cloud-upload-outline" onPress={exportBackup} loading={busy === 'export'} fullWidth />
        <Step number={1} text="Toque no botão acima: o app gera um arquivo com todos os seus dados." />
        <Step number={2} text="Na tela de compartilhar, escolha “Salvar no Drive” e confirme a pasta." />

        <View style={{ height: 1, backgroundColor: colors.border }} />

        <Button label="Restaurar do Google Drive" icon="cloud-download-outline" variant="secondary" onPress={importBackup} loading={busy === 'import'} fullWidth />
        <AppText variant="small" tone="subtle">
          No seletor de arquivos, abra o menu (☰) e escolha Google Drive. Use ao trocar de aparelho ou reinstalar o app — os lembretes são
          reagendados automaticamente.
        </AppText>
      </Card>

      <Section title="Como funciona">
        <Card tone="alt" style={{ gap: 8 }}>
          <AppText variant="caption" tone="muted">
            • O app funciona inteiro sem internet. Nada é enviado a servidor nenhum — só o arquivo de backup, e só quando você pede.
          </AppText>
          <AppText variant="caption" tone="muted">
            • O arquivo inclui pacientes, atendimentos, cálculos, anexos, agenda, tarefas e preferências (inclusive o perfil salvo de cada
            calculadora).
          </AppText>
          <AppText variant="caption" tone="muted">
            • Também dá para enviar o mesmo arquivo por e-mail, WhatsApp ou salvar no aparelho — basta escolher outro destino na tela de
            compartilhar.
          </AppText>
          <AppText variant="caption" tone="muted">
            • O arquivo contém dados de saúde (LGPD): guarde-o em local protegido. No computador, ele é baixado e você pode enviá-lo ao Drive.
          </AppText>
        </Card>
      </Section>
    </Screen>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="small" tone="primary">
          {number}
        </AppText>
      </View>
      <AppText variant="caption" tone="muted" style={{ flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}
