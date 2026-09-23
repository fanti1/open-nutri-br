import { comprimentoIdade0a5Calculator, imcIdade5a19Calculator, pesoComprimento0a5Calculator } from '../../calculators/pediatria/curvasCrescimento';
import { ageInDays, OutOfReferenceRangeError, standardizedLength } from '../growth';

describe('WHO growth engine (offline)', () => {
  it('reproduces the official anthro test case: 987 days, 72.86 cm lying → z = −6.09', () => {
    const outcome = comprimentoIdade0a5Calculator.calculate({
      age_months: 987 / 30.4375,
      sex: 'male',
      length_cm: 72.86,
      measurement_position: 'deitado',
    });

    expect(outcome.values.z_score).toBeCloseTo(-6.09, 2);
    expect(outcome.classification).toBe('muito_baixa_estatura_para_idade');
  });

  it('standardizes age and length exactly like the WHO packages', () => {
    expect(ageInDays(12)).toBe(365);
    expect(standardizedLength(80, 'em_pe', 12)).toBeCloseTo(80.7, 5);
    expect(standardizedLength(95, 'deitado', 36)).toBeCloseTo(94.3, 5);
    expect(standardizedLength(60, 'em_pe', 6)).toBe(60);
  });

  it('explains when a measurement is outside the reference curve', () => {
    const outOfCurve = () =>
      pesoComprimento0a5Calculator.calculate({ age_months: 12, sex: 'male', weight_kg: 3, length_cm: 40, measurement_position: 'deitado' });

    expect(outOfCurve).toThrow(OutOfReferenceRangeError);
    expect(outOfCurve).toThrow('A curva peso-para-comprimento da OMS cobre de 45 a 110 cm.');
    expect(() => imcIdade5a19Calculator.calculate({ age_months: 40, sex: 'female', weight_kg: 15, height_cm: 100 })).toThrow(
      'Esta curva da Referência OMS 2007 cobre de 60 a 228 meses.',
    );
  });
});
