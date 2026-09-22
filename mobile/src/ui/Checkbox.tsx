import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onToggle}
      hitSlop={10}
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: checked ? colors.success : colors.border,
        backgroundColor: checked ? colors.success : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked && <Ionicons name="checkmark" size={18} color="#fff" />}
    </Pressable>
  );
}
