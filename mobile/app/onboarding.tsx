import { useState } from 'react';
import { View } from 'react-native';
import { useData } from '../src/data/DataProvider';
import { CATALOG } from '../src/domain/catalog';
import { PrivacyNotice } from '../src/features/common/PrivacyNotice';
import { PRIVACY_VERSION } from '../src/lib/constants';
import { AppText } from '../src/ui/AppText';
import { Button } from '../src/ui/Button';
import { Card } from '../src/ui/Card';
import { CheckboxRow } from '../src/ui/Checkbox';
import { IconTile, type IconName } from '../src/ui/IconTile';
import { Screen } from '../src/ui/Screen';
import { TextField } from '../src/ui/TextField';

const HIGHLIGHTS: Array<{ icon: IconName; title: string; text: string }> = [
  {
    icon: 'calculator-outline',
    title: `${CATALOG.length} calculadoras científicas`,
    text: 'Antropometria, metabolismo, hospitalar, UTI, pediatria e exames laboratoriais — cada uma com a referência publicada.',
  },
  { icon: 'people-outline', title: 'Fichas de pacientes', text: 'Atendimentos, medidas, evolução, cálculos e arquivos de exames em um só lugar.' },
  { icon: 'calendar-outline', title: 'Agenda e tarefas', text: 'Organize seus atendimentos e receba lembretes no celular.' },
  { icon: 'lock-closed-outline', title: 'Seus dados ficam com você', text: 'Tudo fica salvo no seu aparelho. Faça backup para o Drive quando quiser.' },
];

export default function OnboardingScreen() {
  const { settings } = useData();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [crn, setCrn] = useState('');
  const [crnState, setCrnState] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    await settings.set('profile', { name: name.trim(), crn_number: crn.trim(), crn_state: crnState.trim().toUpperCase(), specialty: specialty.trim() });
    await settings.set('privacy_accepted_version', PRIVACY_VERSION);
    await settings.set('onboarding_done', true);
  };

  if (step === 0) {
    return (
      <Screen
        title="Bem-vindo(a) ao OpenNutri BR"
        subtitle="Ferramentas clínicas para nutricionistas, abertas a todos"
        footer={<Button label="Começar" onPress={() => setStep(1)} fullWidth style={{ flex: 1 }} />}
      >
        {HIGHLIGHTS.map((item) => (
          <Card key={item.title} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <IconTile name={item.icon} size={46} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="heading">{item.title}</AppText>
              <AppText tone="muted">{item.text}</AppText>
            </View>
          </Card>
        ))}
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen
        title="Seu perfil profissional"
        subtitle="Aparece nas fichas em PDF. Pode completar depois."
        footer={
          <>
            <Button label="Voltar" variant="ghost" onPress={() => setStep(0)} style={{ flex: 1 }} />
            <Button label="Continuar" onPress={() => setStep(2)} style={{ flex: 2 }} />
          </>
        }
      >
        <TextField label="Como quer ser chamado(a)?" value={name} onChangeText={setName} autoCapitalize="words" icon="person-outline" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 2 }}>
            <TextField label="CRN" value={crn} onChangeText={setCrn} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="UF" value={crnState} onChangeText={setCrnState} autoCapitalize="none" placeholder="SP" />
          </View>
        </View>
        <TextField label="Especialidade" value={specialty} onChangeText={setSpecialty} placeholder="Ex.: Nutrição clínica" />
      </Screen>
    );
  }

  return (
    <Screen
      title="Privacidade e LGPD"
      footer={
        <>
          <Button label="Voltar" variant="ghost" onPress={() => setStep(1)} style={{ flex: 1 }} />
          <Button label="Aceitar e entrar" onPress={finish} disabled={!accepted} loading={saving} style={{ flex: 2 }} />
        </>
      }
    >
      <PrivacyNotice />
      <CheckboxRow checked={accepted} onToggle={() => setAccepted((v) => !v)} label="Li e concordo com a política de privacidade." />
    </Screen>
  );
}
