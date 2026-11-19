import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import type { CatalogEntry } from '../../domain/catalog';
import { classificationLabel, fieldLabel, formatFieldValue, optionLabel } from '../../domain/forms/fieldLabels';
import {
  AUDIT_STATUS_DESCRIPTIONS,
  AUDIT_STATUS_LABELS,
  AUDIT_STATUS_TONE,
  auditDate,
  EVIDENCE_LABELS,
  type AuditStatus,
} from '../../domain/methodAudit';
import { formatNumber } from '../../lib/format';
import { openExternal } from '../../lib/links';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../ui/AppText';
import { Badge } from '../../ui/Badge';

export function useAuditColor(status: AuditStatus): string {
  const { colors } = useTheme();
  return { success: colors.success, info: colors.info, warning: colors.warning, danger: colors.danger }[AUDIT_STATUS_TONE[status]];
}

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  return <Badge label={AUDIT_STATUS_LABELS[status]} color={useAuditColor(status)} />;
}

function inputText(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'sim' : 'não';
  if (typeof value === 'number') return formatNumber(value, 4);
  return optionLabel(String(value));
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <AppText variant="overline" tone="muted">
        {title}
      </AppText>
      {children}
    </View>
  );
}

/**
 * Auditoria científica do método, para o próprio profissional conferir: fórmula
 * e pontos de corte, cada fonte com o que foi conferido nela e o grau de
 * acesso, ressalvas, mudanças e um exemplo resolvido (o mesmo que os testes verificam).
 */
export function MethodAuditPanel({ entry }: { entry: CatalogEntry }) {
  const { colors } = useTheme();
  const { audit } = entry;

  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <AuditStatusBadge status={audit.status} />
          <AppText variant="small" tone="subtle">
            Conferido em {auditDate(audit.verified_at)} · fórmula {entry.version}
          </AppText>
        </View>
        <AppText variant="small" tone="subtle">
          {AUDIT_STATUS_DESCRIPTIONS[audit.status]}
        </AppText>
        <AppText variant="caption">{audit.summary}</AppText>
      </View>

      <Block title="Fórmula e pontos de corte">
        <AppText variant="caption">{audit.formula}</AppText>
      </Block>

      <Block title="Fontes conferidas">
        {audit.sources.length === 0 && (
          <AppText variant="caption" tone="muted">
            Nenhuma fonte clínica: conta aritmética ou fonte ainda não identificada (veja as ressalvas).
          </AppText>
        )}
        {audit.sources.map((source) => (
          <View key={source.citation} style={{ gap: 2, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
            <AppText variant="caption">{source.citation}</AppText>
            <AppText variant="small" tone="muted">
              {EVIDENCE_LABELS[source.evidence]} · {source.checked}
            </AppText>
            <Pressable accessibilityRole="link" accessibilityLabel={`Abrir a fonte: ${source.citation}`} onPress={() => void openExternal(source.url)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="open-outline" size={14} color={colors.primary} />
              <AppText variant="small" tone="primary">
                Abrir a fonte
              </AppText>
            </Pressable>
          </View>
        ))}
      </Block>

      {audit.notes.length > 0 && (
        <Block title="Ressalvas">
          {audit.notes.map((note) => (
            <AppText key={note} variant="caption">
              • {note}
            </AppText>
          ))}
        </Block>
      )}

      {audit.changes.length > 0 && (
        <Block title="Mudanças">
          {audit.changes.map((change) => (
            <AppText key={change.text} variant="caption">
              • {auditDate(change.date)} ({change.version}): {change.text}
            </AppText>
          ))}
        </Block>
      )}

      <Block title="Exemplo resolvido">
        <AppText variant="caption" tone="muted">
          {Object.entries(audit.example.inputs)
            .map(([name, value]) => `${fieldLabel(name)}: ${inputText(value)}`)
            .join(' · ')}
        </AppText>
        <AppText variant="caption">{audit.example.calculation}</AppText>
        <AppText variant="caption" tone="muted">
          Resultado:{' '}
          {Object.entries(audit.example.expected.values)
            .map(([name, value]) => `${fieldLabel(name)} ${formatFieldValue(name, value)}`)
            .join(' · ')}
          {audit.example.expected.classification ? ` · ${classificationLabel(audit.example.expected.classification)}` : ''}
        </AppText>
      </Block>
    </View>
  );
}
