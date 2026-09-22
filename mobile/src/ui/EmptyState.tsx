import { View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconTile, type IconName } from './IconTile';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16, gap: 10 }}>
      <IconTile name={icon} size={56} />
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {message && (
        <AppText variant="body" tone="muted" align="center">
          {message}
        </AppText>
      )}
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} icon="add" style={{ marginTop: 6 }} />}
    </View>
  );
}
