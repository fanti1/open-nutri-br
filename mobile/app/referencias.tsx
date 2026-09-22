import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { CATALOG, CATEGORY_LABELS, MODULES } from '../src/domain/catalog';
import { LifeStageBadges } from '../src/features/common/LifeStageBadge';
import { AppText } from '../src/ui/AppText';
import { Card } from '../src/ui/Card';
import { Screen } from '../src/ui/Screen';
import { Section } from '../src/ui/Section';

/** Transparência: o método e a publicação por trás de cada calculadora, com a faixa etária validada. */
export default function ReferencesScreen() {
  const router = useRouter();

  return (
    <Screen back title="Referências científicas" subtitle="Cada cálculo do app é rastreável até a publicação original">
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
                  <LifeStageBadges stages={entry.life_stages} />
                </Card>
              ))}
            </View>
          </Section>
        );
      })}
    </Screen>
  );
}
