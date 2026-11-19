import { Ionicons } from '@expo/vector-icons';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { elevation } from '../theme/tokens';
import type { IconName } from './IconTile';

interface IconButtonProps {
  icon: IconName;
  /** Obrigatório: é o que o leitor de tela anuncia. */
  label: string;
  onPress: () => void;
  color?: string;
  /**
   * "filled" ganha fundo de superfície (ex.: voltar); "plain" é só o ícone (ex.: favoritar);
   * "onHero" é translúcido, para cabeçalhos coloridos.
   */
  variant?: 'filled' | 'plain' | 'onHero';
  size?: number;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Botão só de ícone com alvo de toque de 44 pt — ações do cabeçalho (voltar, favoritar, menu). */
export function IconButton({ icon, label, onPress, color, variant = 'plain', size = 22, selected, style }: IconButtonProps) {
  const { colors, layout, dark } = useTheme();
  const background = variant === 'filled' ? colors.surface : variant === 'onHero' ? 'rgba(255,255,255,0.2)' : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: layout.minTouch,
          height: layout.minTouch,
          borderRadius: layout.minTouch / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? (variant === 'onHero' ? 'rgba(255,255,255,0.32)' : colors.surfacePressed) : background,
          ...(variant === 'filled' ? elevation(1, dark) : null),
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color ?? (variant === 'onHero' ? colors.onHero : colors.text)} />
    </Pressable>
  );
}
