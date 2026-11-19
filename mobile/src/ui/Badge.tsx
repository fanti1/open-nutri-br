import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { withAlpha } from '../theme/tokens';
import { AppText } from './AppText';
import type { IconName } from './IconTile';

/** Etiqueta colorida pequena (status, faixa etária, classificação). */
export function Badge({ label, color, icon }: { label: string; color: string; icon?: IconName }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: withAlpha(color, 0.12),
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 3,
      }}
    >
      {icon && <Ionicons name={icon} size={12} color={color} />}
      <AppText variant="small" color={color} numberOfLines={1} style={{ fontWeight: '600' }}>
        {label}
      </AppText>
    </View>
  );
}
