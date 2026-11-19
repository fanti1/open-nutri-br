import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useData } from '../../../data/DataProvider';
import type { Attachment, Patient } from '../../../data/models';
import { AttachmentTooLargeError } from '../../../data/repositories/attachments';
import { useLiveQuery } from '../../../data/useLiveQuery';
import { formatBytes, formatDate } from '../../../lib/format';
import { useTheme } from '../../../theme/ThemeProvider';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { confirm } from '../../../ui/dialogs';
import { EmptyState } from '../../../ui/EmptyState';
import { IconTile, type IconName } from '../../../ui/IconTile';
import { toast } from '../../../ui/Toast';
import { pickFile, shareBase64File } from '../../files/fileService';

function iconFor(attachment: Attachment): IconName {
  const mime = attachment.mime_type ?? '';
  if (mime.startsWith('image/')) return 'image-outline';
  if (mime === 'application/pdf') return 'document-text-outline';
  return 'document-outline';
}

/** Exames, fotos e documentos do paciente, guardados no banco local (e incluídos no backup). */
export function FilesSection({ patient }: { patient: Patient }) {
  const { colors } = useTheme();
  const { attachments } = useData();
  const [uploading, setUploading] = useState(false);
  const { data = [], loading } = useLiveQuery(['attachments'], () => attachments.listByPatient(patient.id), [patient.id]);

  const attach = async () => {
    setUploading(true);
    try {
      const file = await pickFile();
      if (!file) return;
      await attachments.create({ patient_id: patient.id, name: file.name, mime_type: file.mimeType, size_bytes: file.size, content_base64: file.base64 });
      toast.success('Arquivo anexado');
    } catch (error) {
      toast.error(error instanceof AttachmentTooLargeError ? 'Arquivo maior que 10 MB.' : 'Não foi possível anexar o arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const open = async (attachment: Attachment) => {
    const content = await attachments.content(attachment.id);
    if (content) await shareBase64File(content.name, content.mime_type, content.content_base64);
  };

  const remove = async (attachment: Attachment) => {
    if (await confirm('Excluir arquivo', `Remover “${attachment.name}” da ficha?`, 'Excluir', true)) await attachments.remove(attachment.id);
  };

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        icon="folder-open-outline"
        title="Nenhum arquivo"
        message="Anexe exames, fotos, planos alimentares ou qualquer documento (até 10 MB)."
        actionLabel="Anexar arquivo"
        onAction={attach}
      />
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <Button label="Anexar arquivo" icon="attach" variant="secondary" onPress={attach} loading={uploading} />
      {data.map((attachment) => (
        <Card key={attachment.id} onPress={() => open(attachment)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconTile name={iconFor(attachment)} size={40} color={colors.info} />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {attachment.name}
            </AppText>
            <AppText variant="caption" tone="muted">
              {formatBytes(attachment.size_bytes)} · {formatDate(attachment.created_at)}
            </AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Excluir arquivo: ${attachment.name}`} onPress={() => remove(attachment)} hitSlop={13}>
            <Ionicons name="trash-outline" size={18} color={colors.textSubtle} />
          </Pressable>
        </Card>
      ))}
    </View>
  );
}
