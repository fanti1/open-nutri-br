import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack, usePathname, useRouter, useSegments, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from '../src/data/DataProvider';
import { useSettings } from '../src/data/hooks';
import { AppLockGate } from '../src/features/security/AppLockGate';
import { errorLog, installGlobalErrorHandlers } from '../src/lib/errorLog';
import { openExternal } from '../src/lib/links';
import { deviceInfo, formatDiagnostics, reportIssueUrl } from '../src/lib/report';
import { useReducedMotion } from '../src/lib/useReducedMotion';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { Button } from '../src/ui/Button';
import { ToastHost } from '../src/ui/Toast';

function Splash() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: colors.hero }} accessibilityLabel="Abrindo o OpenNutri BR">
      <Image source={require('../assets/icon.png')} style={{ width: 96, height: 96, borderRadius: 28 }} accessible={false} />
      <AppText variant="display" color={colors.onHero}>
        OpenNutri BR
      </AppText>
      <AppText variant="caption" color={colors.onHero} style={{ opacity: 0.9 }}>
        Ferramentas clínicas para nutricionistas
      </AppText>
      <ActivityIndicator color={colors.onHero} style={{ marginTop: 8 }} />
    </View>
  );
}

/**
 * Erro inesperado (ex.: o banco local não abriu): em vez de fechar o app,
 * explica, registra no aparelho e oferece tentar de novo ou relatar.
 * Os dados continuam no aparelho.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => errorLog.record(error), [error]);
  return (
    <ThemeProvider>
      <ErrorScreen message={error.message} retry={retry} />
    </ThemeProvider>
  );
}

function ErrorScreen({ message, retry }: { message: string; retry: () => Promise<void> }) {
  const { colors, dark } = useTheme();
  // Sem depender do banco nem do roteador (podem ser a causa do erro): o relato sai direto para o GitHub.
  const report = () =>
    void openExternal(
      reportIssueUrl(
        { kind: 'problema', title: message.slice(0, 80), description: 'O app mostrou a tela "Algo deu errado".', steps: '' },
        formatDiagnostics(deviceInfo(dark ? 'escuro' : 'claro'), errorLog.list()),
      ),
    );
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: colors.background }}>
      <AppText variant="title">Algo deu errado</AppText>
      <AppText tone="muted" style={{ textAlign: 'center' }}>
        O app encontrou um erro inesperado. Seus dados continuam guardados neste aparelho.
      </AppText>
      <AppText variant="small" tone="subtle" style={{ textAlign: 'center' }}>
        {message}
      </AppText>
      <Button label="Tentar de novo" icon="refresh" onPress={() => void retry()} />
      <Button label="Relatar este problema" icon="bug-outline" variant="ghost" onPress={report} />
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
  const pathname = usePathname();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();

  useEffect(() => errorLog.setRoute(pathname), [pathname]);

  useEffect(() => {
    if (!settings) return;
    const inOnboarding = segments[0] === 'onboarding';

    if (!settings.onboarding_done && !inOnboarding) router.replace('/onboarding');
    if (settings.onboarding_done && inOnboarding) router.replace('/');
  }, [settings, segments, router]);

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: reducedMotion ? 'none' : 'slide_from_right' }}
    />
  );
}

export default function RootLayout() {
  useEffect(installGlobalErrorHandlers, []);
  // Fontes embarcadas no app (sem internet). Se alguma falhar, o app segue com a fonte do sistema.
  const [fontsLoaded, fontError] = useFonts({ Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black });

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <Splash />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <DataProvider
        fallback={
          <ThemeProvider>
            <Splash />
          </ThemeProvider>
        }
      >
        <ThemedApp>
          <AppLockGate>
            <OnboardingGate />
          </AppLockGate>
        </ThemedApp>
      </DataProvider>
    </SafeAreaProvider>
  );
}
