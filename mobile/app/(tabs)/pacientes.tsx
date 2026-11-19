import { useRouter } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../src/data/DataProvider';
import type { Patient } from '../../src/data/models';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { PatientRow } from '../../src/features/patients/PatientRow';
import { useTheme } from '../../src/theme/ThemeProvider';
import { EmptyState } from '../../src/ui/EmptyState';
import { Fab } from '../../src/ui/Fab';
import { Screen } from '../../src/ui/Screen';
import { TextField } from '../../src/ui/TextField';

/** Altura reservada no fim da lista para o botão flutuante não cobrir o último paciente. */
const FAB_SPACE = 76;

export default function PatientsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius } = useTheme();
  const { patients } = useData();
  const [search, setSearch] = useState('');
  // A busca acompanha a digitação sem travar o campo: a lista atualiza logo depois.
  const deferredSearch = useDeferredValue(search);
  const { data, loading } = useLiveQuery(['patients'], () => patients.list(deferredSearch), [deferredSearch]);

  const newPatient = () => router.push('/paciente/novo');
  const openPatient = (id: string) => router.push(`/paciente/${id}`);
  // Sem nenhuma ficha, o estado vazio já traz o botão — o flutuante seria repetição.
  const noPatientsYet = !loading && !search && data?.length === 0;
  const last = (data?.length ?? 0) - 1;

  // Lista virtualizada: com centenas de fichas, só as linhas visíveis são desenhadas.
  // Cada linha leva a sua parte da moldura do cartão (topo arredondado na primeira,
  // base na última), e o conjunto parece um cartão só.
  const renderItem = ({ item, index }: { item: Patient; index: number }) => (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          overflow: 'hidden',
        },
        index === 0 && { borderTopWidth: 1, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
        index === last && { borderBottomWidth: 1, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
      ]}
    >
      <PatientRow patient={item} onPress={openPatient} divider={index > 0} showStage />
    </View>
  );

  return (
    <Screen
      title="Pacientes"
      subtitle={data && !noPatientsYet ? `${data.length} ${data.length === 1 ? 'ficha' : 'fichas'}` : undefined}
      scroll={false}
      hero={{}}
      floating={noPatientsYet ? undefined : <Fab label="Novo paciente" icon="person-add" onPress={newPatient} />}
    >
      <FlatList
        data={data ?? []}
        keyExtractor={(patient) => patient.id}
        renderItem={renderItem}
        extraData={last}
        initialNumToRender={14}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl + FAB_SPACE + insets.bottom }}
        ListHeaderComponent={
          noPatientsYet ? null : (
            <View style={{ marginBottom: spacing.lg }}>
              <TextField value={search} onChangeText={setSearch} placeholder="Buscar pelo nome" icon="search" clearable />
            </View>
          )
        }
        ListEmptyComponent={
          loading ? null : search ? (
            <EmptyState icon="search-outline" title="Nenhum paciente encontrado" message={`Nada com “${search}”. Confira a grafia ou busque só pelo primeiro nome.`} />
          ) : (
            <EmptyState
              icon="people-outline"
              title="Nenhum paciente ainda"
              message="Crie a primeira ficha para registrar atendimentos, medidas, cálculos e exames."
              actionLabel="Novo paciente"
              actionIcon="person-add-outline"
              onAction={newPatient}
            />
          )
        }
      />
    </Screen>
  );
}
