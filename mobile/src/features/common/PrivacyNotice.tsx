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
        Pacientes, atendimentos, cálculos, arquivos, agenda e tarefas são salvos só neste dispositivo, em um banco de dados local. Nada é enviado
        para servidores do OpenNutri BR.
      </AppText>
      <AppText tone="muted">
        As calculadoras de curvas da OMS e a tabela de alimentos consultam nosso servidor enviando apenas as medidas do cálculo, sem nome ou
        qualquer dado que identifique o paciente.
      </AppText>
      <AppText tone="muted">
        Você é o controlador dos dados dos seus pacientes (LGPD). Faça backups periódicos (Mais → Backup): se o aparelho for perdido ou o app
        desinstalado sem backup, os dados não podem ser recuperados.
      </AppText>
    </Card>
  );
}
