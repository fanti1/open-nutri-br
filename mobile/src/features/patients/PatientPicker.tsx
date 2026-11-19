import { Ionicons } from '@expo/vector-icons';
import { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../../data/DataProvider';
import type { Patient } from '../../data/models';
import { useLiveQuery } from '../../data/useLiveQuery';
import { formatAge } from '../../lib/format';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Avatar } from '../../ui/Avatar';
import { ListItem } from '../../ui/ListItem';
import { Sheet } from '../../ui/Sheet';
import { TextField } from '../../ui/TextField';

/** Linhas desenhadas de uma vez na folha; a busca encontra o resto. */
const MAX_SHOWN = 50;

interface PatientPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (patient: Patient | null) => void;
  allowNone?: boolean;
}

export function PatientPicker({ visible, onClose, onSelect, allowNone = true }: PatientPickerProps) {
  const { patients } = useData();
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search);
  // O seletor é montado junto com a tela (calculadora, formulários): só vai ao banco quando aberto.
  const { data } = useLiveQuery(['patients'], () => patients.list(query), [query], visible);
  const shown = data?.slice(0, MAX_SHOWN);

  const choose = (patient: Patient | null) => {
    onSelect(patient);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Selecionar paciente">
      <View style={{ gap: 8 }}>
        <TextField value={search} onChangeText={setSearch} placeholder="Buscar pelo nome" icon="search" clearable />
        {allowNone && (
          <ListItem title="Sem paciente" subtitle="Cálculo avulso" left={<NoneIcon />} onPress={() => choose(null)} divider />
        )}
        {shown?.map((patient) => (
          <ListItem
            key={patient.id}
            title={patient.name}
            subtitle={formatAge(patient.birth_date)}
            left={<Avatar name={patient.name} size={36} />}
            onPress={() => choose(patient)}
            divider
          />
        ))}
        {!!data && data.length > MAX_SHOWN && (
          <AppText variant="caption" tone="muted" align="center" style={{ padding: 12 }}>
            Mostrando {MAX_SHOWN} de {data.length}. Digite o nome para encontrar os outros.
          </AppText>
        )}
        {data?.length === 0 && (
          <AppText tone="muted" align="center" style={{ padding: 16 }}>
            Nenhum paciente encontrado.
          </AppText>
        )}
      </View>
    </Sheet>
  );
}

function NoneIcon() {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name="person-remove-outline" size={18} color={colors.textMuted} />
    </View>
  );
}
