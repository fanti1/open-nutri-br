import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../src/data/DataProvider';
import { useSettings } from '../src/data/hooks';
import { createLock, isValidPin, LOCK_TIMEOUTS, verifyPin } from '../src/data/services/appLock';
import { biometricsAvailable } from '../src/features/security/biometrics';
import { PinPad } from '../src/features/security/PinPad';
import { secureRandomBytes } from '../src/lib/random';
import { useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { Button } from '../src/ui/Button';
import { Card } from '../src/ui/Card';
import { CheckboxRow } from '../src/ui/Checkbox';
import { Segmented } from '../src/ui/Chips';
import { Screen } from '../src/ui/Screen';
import { Section } from '../src/ui/Section';
import { toast } from '../src/ui/Toast';

type Step = { kind: 'idle' } | { kind: 'new' } | { kind: 'confirm'; first: string } | { kind: 'verify'; then: 'disable' | 'change' };

/** Bloqueio do app com PIN e digital. */
export default function SecurityScreen() {
  const { colors } = useTheme();
  const { settings } = useData();
  const { data: appSettings } = useSettings();
  const lock = appSettings?.app_lock ?? null;

  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    void biometricsAvailable().then(setHasBiometrics);
  }, []);

  const go = (next: Step) => {
    setStep(next);
    setPin('');
    setError(null);
  };

  const submit = async (value = pin) => {
    setError(null);
    if (step.kind === 'new') {
      if (!isValidPin(value)) return setError('Use de 4 a 6 números.');
      return go({ kind: 'confirm', first: value });
    }
    if (step.kind === 'confirm') {
      if (value !== step.first) {
        setPin('');
        return setError('Os PINs não conferem. Digite de novo.');
      }
      setBusy(true);
      const config = await createLock(value, secureRandomBytes, hasBiometrics, lock?.timeout_s ?? 60);
      await settings.set('app_lock', config);
      setBusy(false);
      go({ kind: 'idle' });
      toast.success('Bloqueio ativado');
      return;
    }
    if (step.kind === 'verify' && lock) {
      setBusy(true);
      const ok = await verifyPin(value, lock);
      setBusy(false);
      if (!ok) {
        setPin('');
        return setError('PIN incorreto.');
      }
      if (step.then === 'disable') {
        await settings.set('app_lock', null);
        go({ kind: 'idle' });
        toast.success('Bloqueio desativado');
      } else {
        go({ kind: 'new' });
      }
    }
  };

  const onPinChange = (value: string) => {
    setError(null);
    setPin(value);
    // Confirmação e verificação têm tamanho conhecido: conferem sozinhas ao completar.
    const expected = step.kind === 'confirm' ? step.first.length : step.kind === 'verify' ? lock?.pin_length : undefined;
    if (expected && value.length === expected) void submit(value);
  };

  if (step.kind !== 'idle') {
    const title = step.kind === 'new' ? 'Crie um PIN de 4 a 6 números' : step.kind === 'confirm' ? 'Digite o PIN de novo' : 'Digite o PIN atual';
    const length = step.kind === 'confirm' ? step.first.length : step.kind === 'verify' ? (lock?.pin_length ?? 4) : 6;
    return (
      <Screen back title="Segurança">
        <View style={{ alignItems: 'center', gap: 20, paddingTop: 12 }}>
          <AppText variant="heading" align="center">
            {title}
          </AppText>
          <AppText tone={error ? 'danger' : 'muted'} align="center">
            {error ?? (busy ? 'Aguarde…' : step.kind === 'new' ? 'Não use datas de nascimento nem sequências (1234).' : ' ')}
          </AppText>
          <PinPad value={pin} length={length} onChange={onPinChange} error={!!error} />
          {step.kind === 'new' && <Button label="Continuar" onPress={() => submit()} disabled={pin.length < 4} style={{ minWidth: 200 }} />}
          <Button label="Cancelar" variant="ghost" onPress={() => go({ kind: 'idle' })} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen back title="Segurança" subtitle="Proteja os dados dos pacientes neste aparelho">
      <Card style={{ gap: 12, borderColor: lock ? colors.success : colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name={lock ? 'lock-closed' : 'lock-open-outline'} size={28} color={lock ? colors.success : colors.textMuted} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading">{lock ? 'Bloqueio ativado' : 'Bloqueio desativado'}</AppText>
            <AppText variant="caption" tone="muted">
              {lock
                ? 'O app pede o PIN ao abrir e quando você volta depois de um tempo.'
                : 'Com o bloqueio, ninguém vê as fichas se pegar seu celular desbloqueado.'}
            </AppText>
          </View>
        </View>
        {!lock && <Button label="Ativar bloqueio com PIN" icon="lock-closed-outline" onPress={() => go({ kind: 'new' })} fullWidth />}
      </Card>

      {lock && (
        <>
          <Section title="Pedir o PIN de novo depois de">
            <Segmented
              options={LOCK_TIMEOUTS.map((t) => ({ value: String(t.value), label: t.label }))}
              value={String(lock.timeout_s)}
              onChange={(value) => settings.set('app_lock', { ...lock, timeout_s: Number(value) })}
            />
            <AppText variant="small" tone="subtle">
              Tempo com o app em segundo plano. Ao abrir o app do zero, o PIN é sempre pedido.
            </AppText>
          </Section>

          {hasBiometrics && (
            <CheckboxRow
              checked={lock.biometrics}
              onToggle={() => settings.set('app_lock', { ...lock, biometrics: !lock.biometrics })}
              label="Desbloquear com a digital (ou rosto)"
            />
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Trocar PIN" variant="secondary" onPress={() => go({ kind: 'verify', then: 'change' })} style={{ flex: 1 }} />
            <Button label="Desativar" variant="danger" onPress={() => go({ kind: 'verify', then: 'disable' })} style={{ flex: 1 }} />
          </View>
        </>
      )}

      <Card tone="alt" style={{ gap: 6 }}>
        <AppText variant="caption" tone="muted">
          • O PIN não é guardado: o app guarda só uma impressão digital matemática dele (hash com sal).
        </AppText>
        <AppText variant="caption" tone="muted">
          • Esqueceu o PIN? Reinstale o app e restaure um backup — o PIN não vai no backup.
        </AppText>
        <AppText variant="caption" tone="muted">
          • Para proteger também o arquivo de backup, use a opção de senha na tela de Backup.
        </AppText>
      </Card>
    </Screen>
  );
}
