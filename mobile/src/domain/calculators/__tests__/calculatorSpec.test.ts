import fs from 'fs';
import path from 'path';
import { CATALOG } from '../../catalog';
import { CALCULATOR_REGISTRY } from '../registry';

/**
 * Runs every calculator against the test vectors in shared/calculators-spec/*.json
 * — the same files backend/tests/Unit/Domain/Calculators/CalculatorSpecTest.php
 * reads, so the PHP and TypeScript implementations are proven to agree on
 * every case, including the WHO growth curves (official tables embedded in the app).
 */

const SPEC_DIR = path.resolve(__dirname, '../../../../../shared/calculators-spec');

interface SpecCase {
  inputs: Record<string, unknown>;
  expected: { values: Record<string, number>; classification: string | null };
}

interface Spec {
  slug: string;
  cases: SpecCase[];
}

function loadSpecs(): Spec[] {
  return fs
    .readdirSync(SPEC_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(SPEC_DIR, file), 'utf-8')) as Spec);
}

describe('calculator spec conformance', () => {
  const specs = loadSpecs();
  const localSpecs = specs;

  it('found the shared spec fixtures', () => {
    expect(localSpecs.length).toBeGreaterThanOrEqual(54);
  });

  it.each(localSpecs.flatMap((spec) => spec.cases.map((c, i) => [spec.slug, i, spec, c] as const)))(
    '%s case #%i matches the TypeScript implementation',
    (_slug, _i, spec, testCase) => {
      const calculator = CALCULATOR_REGISTRY[spec.slug];
      expect(calculator).toBeDefined();

      const outcome = calculator.calculate(testCase.inputs);

      for (const [key, expectedValue] of Object.entries(testCase.expected.values)) {
        expect(outcome.values[key]).toBeCloseTo(expectedValue, 1);
      }

      expect(outcome.classification).toBe(testCase.expected.classification);
    },
  );

  it('every registered calculator declares a reference', () => {
    for (const calculator of Object.values(CALCULATOR_REGISTRY)) {
      expect(calculator.reference.method).toBeTruthy();
      expect(calculator.reference.citation).toBeTruthy();
    }
  });

  it('every registered calculator declares its validated life stages', () => {
    for (const calculator of Object.values(CALCULATOR_REGISTRY)) {
      expect(calculator.lifeStages.length).toBeGreaterThan(0);
    }
  });

  it('every local spec has a local implementation', () => {
    for (const spec of localSpecs) {
      expect(CALCULATOR_REGISTRY[spec.slug]).toBeDefined();
    }
  });

  it('every catalog calculator runs on the device (no server needed)', () => {
    for (const entry of CATALOG) {
      expect(CALCULATOR_REGISTRY[entry.slug]).toBeDefined();
    }
  });
});
