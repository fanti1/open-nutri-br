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
  actionIcon?: IconName;
}

export function EmptyState({ icon, title, message, actionLabel, onAction, actionIcon = 'add' }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 10 }}>
      <IconTile name={icon} size={76} />
      <AppText variant="heading" align="center" style={{ marginTop: 6 }}>
        {title}
      </AppText>
      {message && (
        <AppText variant="body" tone="muted" align="center" style={{ maxWidth: 360 }}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} icon={actionIcon} style={{ marginTop: 8 }} />}
    </View>
  );
}
