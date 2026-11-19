import { View } from 'react-native';
import { initials } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';
import { withAlpha, type Palette } from '../theme/tokens';
import { AppText } from './AppText';

// Cores do tema (e não fixas): as iniciais mantêm o contraste no claro e no escuro.
const COLOR_KEYS: (keyof Palette)[] = ['primary', 'coral', 'sky', 'sun', 'violet', 'success'];

function colorKeyFor(name: string): keyof Palette {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLOR_KEYS[hash % COLOR_KEYS.length];
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  const color = colors[colorKeyFor(name)];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: withAlpha(color, 0.14), alignItems: 'center', justifyContent: 'center' }}
    >
      <AppText variant={size > 50 ? 'title' : size < 38 ? 'caption' : 'bodyStrong'} color={color} style={{ fontWeight: '700' }} maxFontSizeMultiplier={1}>
        {initials(name)}
      </AppText>
    </View>
  );
}
