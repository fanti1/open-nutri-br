import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useData } from '../src/data/DataProvider';
import { useSettings } from '../src/data/hooks';
import type { Profile } from '../src/data/models';
import { Button } from '../src/ui/Button';
import { Screen } from '../src/ui/Screen';
import { TextField } from '../src/ui/TextField';
import { toast } from '../src/ui/Toast';

export default function ProfileScreen() {
  const { data: settings } = useSettings();
  return <Screen back title="Perfil profissional" subtitle="Aparece na saudação e nas fichas em PDF">{settings && <ProfileForm initial={settings.profile} />}</Screen>;
}

function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const { settings } = useData();
  const [profile, setProfile] = useState(initial);
  const set = (key: keyof Profile) => (value: string) => setProfile((current) => ({ ...current, [key]: value }));

  return (
    <View style={{ gap: 16 }}>
      <TextField label="Nome" value={profile.name} onChangeText={set('name')} autoCapitalize="words" icon="person-outline" />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 2 }}>
          <TextField label="CRN" value={profile.crn_number} onChangeText={set('crn_number')} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="UF" value={profile.crn_state} onChangeText={set('crn_state')} placeholder="SP" />
        </View>
      </View>
      <TextField label="Especialidade" value={profile.specialty} onChangeText={set('specialty')} />
      <Button
        label="Salvar"
        fullWidth
        onPress={async () => {
          await settings.set('profile', { ...profile, crn_state: profile.crn_state.trim().toUpperCase() });
          toast.success('Perfil atualizado');
          router.back();
        }}
      />
    </View>
  );
}
