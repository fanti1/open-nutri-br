import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';

/** Explicação de como os dados são guardados (LGPD) — usada no primeiro acesso e na tela de privacidade. */
export function PrivacyNotice() {
  const { colors } = useTheme();

  return (
    <Card tone="alt" style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Ionicons name="phone-portrait-outline" size={22} color={colors.primary} />
        <AppText variant="heading">Os dados ficam no seu aparelho</AppText>
      </View>
      <AppText tone="muted">
        Pacientes, atendimentos, cálculos, arquivos, agenda e tarefas são salvos só neste dispositivo, em um banco de dados local. O app
        funciona 100% sem internet e não envia nada para servidor algum — todas as calculadoras, inclusive as curvas da OMS, e a tabela TACO
        estão dentro do app.
      </AppText>
      <AppText tone="muted">
        A única saída de dados é o backup, e só quando você pede: o arquivo vai para onde você escolher (Google Drive, e-mail…).
      </AppText>
      <AppText tone="muted">
        Você é o controlador dos dados dos seus pacientes (LGPD). Faça backups periódicos (Mais → Backup): se o aparelho for perdido ou o app
        desinstalado sem backup, os dados não podem ser recuperados.
      </AppText>
    </Card>
  );
}
