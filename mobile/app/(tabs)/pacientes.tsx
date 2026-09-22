import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { LifeStageBadge } from '../../src/features/common/LifeStageBadge';
import { patientLifeStage, sexLabel } from '../../src/features/patients/patientHelpers';
import { formatAge } from '../../src/lib/format';
import { AppText } from '../../src/ui/AppText';
import { Avatar } from '../../src/ui/Avatar';
import { Card } from '../../src/ui/Card';
import { EmptyState } from '../../src/ui/EmptyState';
import { Fab } from '../../src/ui/Fab';
import { Screen } from '../../src/ui/Screen';
import { TextField } from '../../src/ui/TextField';

export default function PatientsScreen() {
  const router = useRouter();
  const { patients } = useData();
  const [search, setSearch] = useState('');
  const { data, loading } = useLiveQuery(['patients'], () => patients.list(search), [search]);

  return (
    <Screen
      title="Pacientes"
      subtitle={data ? `${data.length} ${data.length === 1 ? 'ficha' : 'fichas'}` : undefined}
      floating={<Fab label="Novo paciente" icon="person-add" onPress={() => router.push('/paciente/novo')} />}
    >
      <TextField value={search} onChangeText={setSearch} placeholder="Buscar pelo nome" icon="search" />

      {data?.map((patient) => (
        <Card key={patient.id} onPress={() => router.push(`/paciente/${patient.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={patient.name} />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="bodyStrong">{patient.name}</AppText>
            <AppText variant="caption" tone="muted">
              {formatAge(patient.birth_date)} · {sexLabel(patient.sex)}
            </AppText>
          </View>
          <LifeStageBadge stage={patientLifeStage(patient)} />
        </Card>
      ))}

      {!loading && data?.length === 0 && (
        search ? (
          <EmptyState icon="search-outline" title="Nenhum paciente encontrado" message={`Nada com “${search}”.`} />
        ) : (
          <EmptyState
            icon="people-outline"
            title="Nenhum paciente ainda"
            message="Crie a primeira ficha para registrar atendimentos, medidas, cálculos e exames."
            actionLabel="Novo paciente"
            onAction={() => router.push('/paciente/novo')}
          />
        )
      )}
    </Screen>
  );
}
