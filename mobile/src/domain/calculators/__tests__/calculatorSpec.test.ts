import fs from 'fs';
import path from 'path';
import { CALCULATOR_REGISTRY } from '../registry';

/**
 * Runs every locally-implemented calculator against the test vectors in
 * shared/calculators-spec/*.json — the same files backend/tests/Unit/Domain/
 * Calculators/CalculatorSpecTest.php reads, so the PHP and TypeScript
 * implementations are proven to agree on every case. Specs flagged
 * "server_only" (WHO growth curves, backed by large reference tables) are
 * computed only by the backend and must not have a local implementation.
 */

const SPEC_DIR = path.resolve(__dirname, '../../../../../shared/calculators-spec');

interface SpecCase {
  inputs: Record<string, unknown>;
  expected: { values: Record<string, number>; classification: string | null };
}

interface Spec {
  slug: string;
  server_only?: boolean;
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
  const localSpecs = specs.filter((spec) => !spec.server_only);
  const serverOnlySpecs = specs.filter((spec) => spec.server_only);

  it('found the shared spec fixtures', () => {
    expect(localSpecs.length).toBeGreaterThanOrEqual(28);
    expect(serverOnlySpecs.length).toBeGreaterThanOrEqual(10);
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

  it('server-only calculators have no (possibly divergent) local implementation', () => {
    for (const spec of serverOnlySpecs) {
      expect(CALCULATOR_REGISTRY[spec.slug]).toBeUndefined();
    }
  });
});
