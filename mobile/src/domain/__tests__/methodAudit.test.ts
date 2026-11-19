import { CALCULATOR_REGISTRY } from '../calculators/registry';
import { CATALOG } from '../catalog';
import { parseCalculatorForm } from '../forms/parseForm';
import { schemaToFields } from '../forms/schemaToFields';
import { optionLabel } from '../forms/fieldLabels';
import { AUDIT_STATUS_LABELS, EVIDENCE_LABELS } from '../methodAudit';

/**
 * A auditoria científica embarcada (shared/auditoria → catálogo) é o que o
 * profissional lê no app: precisa existir para todo método, ser válida, e o
 * exemplo resolvido tem de bater com o que o app calcula — direto e pelo formulário.
 */
describe('method audit shipped with the app', () => {
  it.each(CATALOG.map((entry) => [entry.slug, entry] as const))('%s has a complete audit', (_slug, entry) => {
    const { audit } = entry;

    expect(Object.keys(AUDIT_STATUS_LABELS)).toContain(audit.status);
    expect(audit.verified_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(audit.summary.length).toBeGreaterThan(10);
    expect(audit.formula.length).toBeGreaterThan(5);
    for (const source of audit.sources) {
      expect(Object.keys(EVIDENCE_LABELS)).toContain(source.evidence);
      expect(source.citation).toBeTruthy();
      expect(source.checked).toBeTruthy();
      expect(source.url).toMatch(/^https?:\/\//);
    }
    if (audit.status !== 'conferido') {
      expect(audit.notes.length + audit.sources.length).toBeGreaterThan(0);
    }
    expect(entry.version).toMatch(/^v\d+$/);
  });

  it.each(CATALOG.map((entry) => [entry.slug, entry] as const))('%s worked example matches the app', (_slug, entry) => {
    const { inputs, expected } = entry.audit.example;
    const direct = CALCULATOR_REGISTRY[entry.slug].calculate(inputs);

    const typed = Object.fromEntries(Object.entries(inputs).map(([name, value]) => [name, String(value).replace('.', ',')]));
    const parsed = parseCalculatorForm(schemaToFields(entry.input_schema), typed);
    expect(parsed.complete).toBe(true);
    const viaForm = CALCULATOR_REGISTRY[entry.slug].calculate(parsed.inputs);

    for (const outcome of [direct, viaForm]) {
      for (const [key, value] of Object.entries(expected.values)) {
        expect(outcome.values[key]).toBeCloseTo(value, 6);
      }
      expect(outcome.classification).toBe(expected.classification);
    }
    expect(direct.formulaVersion).toBe(entry.version);
  });
});

describe('form option labels', () => {
  it('every option used by a calculator has a Portuguese label (no raw codes on screen)', () => {
    const raw = CATALOG.flatMap((entry) =>
      Object.values(entry.input_schema).flatMap((rules) =>
        (rules as unknown[])
          .filter((rule): rule is string => typeof rule === 'string' && rule.startsWith('in:'))
          .flatMap((rule) => rule.slice(3).split(',')),
      ),
    );
    // Números (MNA-SF) e letras (ASG: A, B, C) já são o próprio rótulo.
    const needsLabel = raw.filter((option) => !/^(\d+|[A-Z])$/.test(option));
    expect(needsLabel.filter((option) => optionLabel(option) === option.replace(/_/g, ' '))).toEqual([]);
  });
});
