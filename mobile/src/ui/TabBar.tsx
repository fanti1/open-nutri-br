import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import type { IconName } from './IconTile';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  icon: IconName;
  /** Contador opcional (ex.: nº de atendimentos). */
  count?: number;
}

/** Abas de largura igual com ícone e sublinhado — todas sempre visíveis, sem rolagem lateral. */
export function TabBar<T extends string>({ tabs, value, onChange }: { tabs: TabItem<T>[]; value: T; onChange: (value: T) => void }) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        const color = active ? colors.primary : colors.textSubtle;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            aria-selected={active}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.value)}
            style={{ flex: 1, alignItems: 'center', gap: 4, paddingTop: 6, paddingBottom: 10 }}
          >
            <View>
              <Ionicons name={tab.icon} size={20} color={color} />
              {!!tab.count && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -12,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    backgroundColor: active ? colors.primary : colors.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText style={{ fontSize: 10, fontWeight: '700' }} color={active ? colors.onPrimary : colors.textMuted}>
                    {tab.count}
                  </AppText>
                </View>
              )}
            </View>
            <AppText style={{ fontSize: 11, fontWeight: active ? '700' : '500' }} color={color} numberOfLines={1}>
              {tab.label}
            </AppText>
            <View
              style={{
                position: 'absolute',
                bottom: -1,
                left: 8,
                right: 8,
                height: 3,
                borderRadius: 2,
                backgroundColor: active ? colors.primary : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
