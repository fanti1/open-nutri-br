import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { CATALOG, CATEGORY_LABELS, MODULES } from '../src/domain/catalog';
import { AUDIT_STATUS_DESCRIPTIONS, type AuditStatus } from '../src/domain/methodAudit';
import { AuditStatusBadge } from '../src/features/calculators/MethodAuditPanel';
import { LifeStageBadges } from '../src/features/common/LifeStageBadge';
import { AppText } from '../src/ui/AppText';
import { Card } from '../src/ui/Card';
import { Screen } from '../src/ui/Screen';
import { Section } from '../src/ui/Section';

const STATUSES: AuditStatus[] = ['conferido', 'conferido_com_ressalvas', 'pendente', 'divergente'];

/**
 * Transparência: o método e a publicação por trás de cada calculadora, a faixa
 * etária validada e a situação da auditoria científica (detalhe em cada calculadora).
 */
export default function ReferencesScreen() {
  const router = useRouter();
  const count = (status: AuditStatus) => CATALOG.filter((entry) => entry.audit.status === status).length;

  return (
    <Screen back title="Referências e auditoria" subtitle="Cada cálculo do app é rastreável até a fonte, e a conferência é pública">
      <Card style={{ gap: 10 }}>
        <AppText variant="caption">
          Cada método foi conferido na fonte primária, em documento oficial ou, quando o texto original não é aberto, em reprodução
          confiável. Abra uma calculadora e toque em “Sobre o método e referência” para ver as fontes, o que foi conferido, as ressalvas e
          um exemplo resolvido. O relatório completo está em docs/METODOS.md, no repositório do projeto.
        </AppText>
        {STATUSES.map((status) => (
          <View key={status} style={{ gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AuditStatusBadge status={status} />
              <AppText variant="bodyStrong">{count(status)}</AppText>
            </View>
            <AppText variant="small" tone="subtle">
              {AUDIT_STATUS_DESCRIPTIONS[status]}
            </AppText>
          </View>
        ))}
      </Card>

      {MODULES.map((module) => {
        const entries = CATALOG.filter((entry) => entry.module === module.key);
        if (!entries.length) return null;

        return (
          <Section key={module.key} title={module.label}>
            <View style={{ gap: 10 }}>
              {entries.map((entry) => (
                <Card key={entry.slug} onPress={() => router.push(`/calculadora/${entry.slug}`)} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <AppText variant="bodyStrong" style={{ flex: 1 }}>
                      {entry.name}
                    </AppText>
                    <AppText variant="small" tone="subtle">
                      {CATEGORY_LABELS[entry.category]}
                    </AppText>
                  </View>
                  <AppText variant="caption" tone="muted">
                    {entry.formula_reference}
                  </AppText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    <AuditStatusBadge status={entry.audit.status} />
                    <LifeStageBadges stages={entry.life_stages} />
                  </View>
                </Card>
              ))}
            </View>
          </Section>
        );
      })}
    </Screen>
  );
}
