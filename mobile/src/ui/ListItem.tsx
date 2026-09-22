import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  divider?: boolean;
  danger?: boolean;
}

export function ListItem({ title, subtitle, left, right, onPress, chevron = !!onPress, divider, danger }: ListItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {left}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong" tone={danger ? 'danger' : 'default'} numberOfLines={1}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </AppText>
        )}
      </View>
      {right}
      {chevron && <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
});
