import { View } from 'react-native';
import { AppText } from './AppText';

/** Etiqueta colorida pequena (status, faixa etária, classificação). */
export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: `${color}1F`, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <AppText variant="small" color={color} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}
