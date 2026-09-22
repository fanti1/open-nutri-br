import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from '../src/data/DataProvider';
import { useSettings } from '../src/data/hooks';
import { queryClient } from '../src/state/queryClient';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { ToastHost } from '../src/ui/Toast';

function Splash() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.background }}>
      <AppText variant="display" tone="primary">
        OpenNutri BR
      </AppText>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

/** Aplica o tema escolhido pelo usuário (claro/escuro/sistema) e a barra de status correspondente. */
function ThemedApp({ children }: { children: ReactNode }) {
  const { data: settings } = useSettings();

  return (
    <ThemeProvider preference={settings?.theme ?? 'system'}>
      <ThemedChrome>{children}</ThemedChrome>
    </ThemeProvider>
  );
}

function ThemedChrome({ children }: { children: ReactNode }) {
  const { dark, colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {children}
      <ToastHost />
    </View>
  );
}

/** Leva ao primeiro acesso (perfil + privacidade) até que ele seja concluído. */
function OnboardingGate() {
  const { data: settings } = useSettings();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (!settings) return;
    const inOnboarding = segments[0] === 'onboarding';

    if (!settings.onboarding_done && !inOnboarding) router.replace('/onboarding');
    if (settings.onboarding_done && inOnboarding) router.replace('/');
  }, [settings, segments, router]);

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DataProvider
          fallback={
            <ThemeProvider>
              <Splash />
            </ThemeProvider>
          }
        >
          <ThemedApp>
            <OnboardingGate />
          </ThemedApp>
        </DataProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
