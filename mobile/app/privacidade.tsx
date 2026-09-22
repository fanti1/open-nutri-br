import { useSettings } from '../src/data/hooks';
import { PrivacyNotice } from '../src/features/common/PrivacyNotice';
import { AppText } from '../src/ui/AppText';
import { Card } from '../src/ui/Card';
import { Screen } from '../src/ui/Screen';
import { Section } from '../src/ui/Section';

export default function PrivacyScreen() {
  const { data: settings } = useSettings();

  return (
    <Screen back title="Privacidade e LGPD">
      <PrivacyNotice />

      <Section title="Seus direitos e responsabilidades">
        <Card style={{ gap: 8 }}>
          <AppText>
            Dados de saúde são dados pessoais sensíveis (LGPD, art. 11). Ao registrar um paciente, obtenha o consentimento dele para o tratamento dos
            dados com finalidade de atendimento nutricional.
          </AppText>
          <AppText>
            Para atender a um pedido de acesso ou portabilidade, exporte a ficha do paciente em PDF. Para eliminação, exclua a ficha: todos os
            atendimentos, cálculos e arquivos dela são apagados do aparelho.
          </AppText>
          <AppText>Backups antigos que você guardou fora do app continuam com os dados — apague-os também quando necessário.</AppText>
        </Card>
      </Section>

      {settings?.privacy_accepted_version && (
        <AppText variant="small" tone="subtle" align="center">
          Termos de privacidade aceitos (versão {settings.privacy_accepted_version}).
        </AppText>
      )}
    </Screen>
  );
}
