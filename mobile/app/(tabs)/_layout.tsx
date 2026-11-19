import { Ionicons } from '@expo/vector-icons';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';
import { elevation, withAlpha } from '../../src/theme/tokens';
import { AppText } from '../../src/ui/AppText';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: 'Início', icon: 'home-outline', iconActive: 'home' },
  { name: 'calculadoras', title: 'Calculadoras', icon: 'calculator-outline', iconActive: 'calculator' },
  { name: 'pacientes', title: 'Pacientes', icon: 'people-outline', iconActive: 'people' },
  { name: 'agenda', title: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'mais', title: 'Mais', icon: 'grid-outline', iconActive: 'grid' },
];

/**
 * Barra de abas flutuante: um cartão arredondado acima da borda da tela, com a aba
 * ativa numa pílula da cor da marca. Fica no fluxo da tela (não por cima do conteúdo).
 */
function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, dark, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: colors.background, paddingHorizontal: 12, paddingTop: 6, paddingBottom: insets.bottom + 10 }}>
      <View
        accessibilityRole="tablist"
        style={[
          {
            flexDirection: 'row',
            width: '100%',
            maxWidth: layout.maxContentWidth,
            alignSelf: 'center',
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: 6,
            borderWidth: dark ? 1 : 0,
            borderColor: colors.border,
          },
          elevation(2, dark),
        ]}
      >
        {state.routes.map((route, index) => {
          const tab = TABS.find((item) => item.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;
          const color = focused ? colors.primary : colors.textSubtle;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              aria-selected={focused}
              accessibilityLabel={tab.title}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 52,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                borderRadius: radius.lg,
                backgroundColor: focused ? withAlpha(colors.primary, dark ? 0.16 : 0.1) : pressed ? colors.surfacePressed : 'transparent',
              })}
            >
              <Ionicons name={focused ? tab.iconActive : tab.icon} size={22} color={color} />
              <AppText
                variant="small"
                color={color}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                style={{ fontSize: 11, letterSpacing: -0.2, fontWeight: focused ? '800' : '600' }}
              >
                {tab.title}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, sceneStyle: { backgroundColor: colors.background } }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
