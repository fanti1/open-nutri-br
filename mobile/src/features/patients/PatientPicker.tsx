import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
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

interface PatientPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (patient: Patient | null) => void;
  allowNone?: boolean;
}

export function PatientPicker({ visible, onClose, onSelect, allowNone = true }: PatientPickerProps) {
  const { patients } = useData();
  const [search, setSearch] = useState('');
  const { data } = useLiveQuery(['patients'], () => patients.list(search), [search]);

  const choose = (patient: Patient | null) => {
    onSelect(patient);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Selecionar paciente">
      <View style={{ gap: 8 }}>
        <TextField value={search} onChangeText={setSearch} placeholder="Buscar pelo nome" icon="search" />
        {allowNone && (
          <ListItem title="Sem paciente" subtitle="Cálculo avulso" left={<NoneIcon />} onPress={() => choose(null)} divider />
        )}
        {data?.map((patient) => (
          <ListItem
            key={patient.id}
            title={patient.name}
            subtitle={formatAge(patient.birth_date)}
            left={<Avatar name={patient.name} size={36} />}
            onPress={() => choose(patient)}
            divider
          />
        ))}
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
    <Pressable style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="person-remove-outline" size={18} color={colors.textMuted} />
    </Pressable>
  );
}
