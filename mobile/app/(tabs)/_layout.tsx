import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Array<{ name: string; title: string; icon: IconName; iconActive: IconName }> = [
  { name: 'index', title: 'Início', icon: 'home-outline', iconActive: 'home' },
  { name: 'calculadoras', title: 'Calculadoras', icon: 'calculator-outline', iconActive: 'calculator' },
  { name: 'pacientes', title: 'Pacientes', icon: 'people-outline', iconActive: 'people' },
  { name: 'agenda', title: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'mais', title: 'Mais', icon: 'grid-outline', iconActive: 'grid' },
];

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 68 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 8,
        },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? tab.iconActive : tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
