import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../data/DataProvider';
import { useSettings } from '../../data/hooks';
import { recordAttempt, remainingWait, shouldLockAfter, verifyPin } from '../../data/services/appLock';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { authenticateWithBiometrics } from './biometrics';
import { PinPad } from './PinPad';

/**
 * Cobre o app com a tela de bloqueio quando há PIN configurado: ao abrir e ao
 * voltar do segundo plano depois do tempo escolhido. O conteúdo por baixo
 * continua montado (a navegação não se perde), mas fica oculto para leitores
 * de tela e serviços de acessibilidade enquanto o app está bloqueado.
 */
export function AppLockGate({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings: settingsRepo } = useData();
  const { data: settings } = useSettings();
  const lock = settings?.app_lock ?? null;

  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const backgroundedAt = useRef<number | null>(null);
  const verifying = useRef(false); // ref: dois toques seguidos não disparam duas conferências
  const lockRef = useRef(lock);
  useEffect(() => {
    lockRef.current = lock;
  }, [lock]);

  const unlock = useCallback(() => {
    setLocked(false);
    setPin('');
    setError(false);
  }, []);

  const tryBiometrics = useCallback(async () => {
    if (await authenticateWithBiometrics()) unlock();
  }, [unlock]);

  // undefined = configurações ainda não carregadas (app acabando de abrir).
  const previousLock = useRef<typeof lock | undefined>(undefined);
  useEffect(() => {
    if (!settings) return;
    if (previousLock.current === undefined && lock?.biometrics) {
      void tryBiometrics(); // ao abrir o app, já oferece a digital
    } else if (previousLock.current === null && lock) {
      setLocked(false); // acabou de ativar o PIN: não tranca na hora, só ao reabrir/voltar
    }
    previousLock.current = lock;
  }, [settings, lock, tryBiometrics]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') backgroundedAt.current = Date.now();
      if (state === 'active') {
        if (shouldLockAfter(backgroundedAt.current, Date.now(), lockRef.current)) {
          setLocked(true);
          setPin('');
          if (lockRef.current?.biometrics) void tryBiometrics();
        }
        backgroundedAt.current = null;
      }
    });
    return () => subscription.remove();
  }, [tryBiometrics]);

  // Espera depois de erros seguidos: contagem regressiva de segundo em segundo.
  const blockedUntil = lock?.blocked_until ?? null;
  useEffect(() => {
    if (!blockedUntil || blockedUntil <= Date.now()) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= blockedUntil) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [blockedUntil]);
  const wait = remainingWait(lock, now);

  const onChange = async (value: string) => {
    setError(false);
    if (wait > 0) return;
    setPin(value);
    if (!lock || value.length !== lock.pin_length || verifying.current) return;
    verifying.current = true;
    setChecking(true);
    const ok = await verifyPin(value, lock);
    verifying.current = false;
    setChecking(false);
    const attemptTime = Date.now();
    setNow(attemptTime);
    if (ok) unlock();
    else {
      setError(true);
      setPin('');
    }
    // Erros ficam gravados: fechar e reabrir o app não zera a espera.
    if (!ok || lock.failed_attempts) await settingsRepo.set('app_lock', recordAttempt(lock, ok, attemptTime));
  };

  const showLock = !!settings && !!lock && locked;
  const message =
    wait > 0
      ? `Muitas tentativas erradas. Tente de novo em ${wait} s.`
      : error
        ? 'PIN incorreto. Tente de novo.'
        : checking
          ? 'Conferindo…'
          : 'Digite seu PIN para ver os dados dos pacientes.';

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: 1 }}
        importantForAccessibility={showLock ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={showLock}
        aria-hidden={showLock}
      >
        {children}
      </View>
      {showLock && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, paddingTop: insets.top + 64, alignItems: 'center', gap: 24 }]}
          accessibilityViewIsModal
        >
          <View style={{ alignItems: 'center', gap: 6, paddingHorizontal: 24 }}>
            <AppText variant="title">OpenNutri BR bloqueado</AppText>
            <AppText tone={error || wait > 0 ? 'danger' : 'muted'} align="center" accessibilityLiveRegion="polite">
              {message}
            </AppText>
          </View>
          <PinPad value={pin} length={lock.pin_length} onChange={onChange} onBiometrics={lock.biometrics ? tryBiometrics : undefined} error={error} />
          <AppText variant="small" tone="subtle" align="center" style={{ paddingHorizontal: 32 }}>
            Esqueceu o PIN? Reinstale o app e restaure um backup.
          </AppText>
        </View>
      )}
    </View>
  );
}
