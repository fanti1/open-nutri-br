import { View } from 'react-native';
import { initials } from '../lib/format';
import { AppText } from './AppText';

const COLORS = ['#0B7A69', '#E8833A', '#2F6FDB', '#7C3AED', '#D1453B', '#23925A', '#B7791F', '#0E7490'];

function colorFor(name: string): string {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const color = colorFor(name);

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}22`, alignItems: 'center', justifyContent: 'center' }}>
      <AppText variant={size > 50 ? 'title' : 'bodyStrong'} color={color}>
        {initials(name)}
      </AppText>
    </View>
  );
}
