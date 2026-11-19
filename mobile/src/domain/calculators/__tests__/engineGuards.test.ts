import { imcCalculator } from '../ambulatorio/antropometria/imc';
import { anemiaOmsCalculator } from '../bioquimica/hematologia/anemiaOms';
import { martinHopkinsFactor, perfilLipidicoCalculator } from '../bioquimica/perfilLipidico/perfilLipidico';
import { exceeds, reaches } from '../support/cutoff';
import { makeCalculator } from '../support/makeCalculator';
import { round2, round4, roundHalfUp } from '../support/round';
import { IncompleteInputsError, InvalidResultError } from '../types';

describe('round2/round4 (porte do round() do PHP 8.4)', () => {
  it.each([
    [20.275, 20.28], // 81,1 / 2² — Math.round(x * 100) / 100 dá 20,27
    [1.005, 1.01],
    [0.285, 0.29],
    [-62.125, -62.13], // meio para longe do zero, também nos negativos
    [-1.005, -1.01],
    [2.5, 2.5],
    [22.857142857, 22.86],
    [-0.001, 0], // sem "−0" na tela
  ])('round2(%p) = %p', (value, expected) => {
    expect(round2(value)).toBe(expected);
  });

  it('keeps 4 places for body density', () => {
    expect(round4(1.07085)).toBe(1.0709);
    expect(round4(1.070849)).toBe(1.0708);
  });

  it('leaves non-finite values untouched (the output guard rejects them)', () => {
    expect(roundHalfUp(Infinity, 2)).toBe(Infinity);
    expect(roundHalfUp(NaN, 2)).toBeNaN();
  });

  it('classifies a BMI that rounds up to a cutoff the same way the backend does', () => {
    // 99,98 / 2² = 24,995 → 25,00 → sobrepeso (com Math.round seria 24,99 → eutrofia).
    expect(imcCalculator.calculate({ weight_kg: 99.98, height_m: 2 })).toMatchObject({ values: { value: 25 }, classification: 'sobrepeso' });
  });
});

describe('cutoff comparisons', () => {
  it('treats floating-point noise at a cutoff as the cutoff itself', () => {
    const bmi = 76.8 / 1.6 ** 2; // IMC 30 exato, calculado como 29,999999999999993
    expect(bmi).toBeLessThan(30);
    expect(reaches(bmi, 30)).toBe(true);
    expect(exceeds(20 + 1e-12, 20)).toBe(false);
  });

  it('does not move a real cutoff', () => {
    expect(reaches(29.9999, 30)).toBe(false);
    expect(exceeds(20.0001, 20)).toBe(true);
  });
});

describe('calculator output guard', () => {
  const broken = makeCalculator<{ x: number }>({
    slug: 'teste',
    module: 'teste',
    category: 'teste',
    version: 'v1',
    reference: { method: 'teste', citation: 'teste' },
    lifeStages: ['adulto'],
    formula: ({ x }) => ({ value: 1 / x }),
    classifier: () => 'ok',
  });

  it('never returns Infinity/NaN as a result', () => {
    expect(() => broken.calculate({ x: 0 })).toThrow(InvalidResultError);
    expect(broken.calculate({ x: 4 }).values.value).toBe(0.25);
  });

  it('shows the message on screen like any incomplete-input problem', () => {
    expect(new InvalidResultError()).toBeInstanceOf(IncompleteInputsError);
  });

  it('rejects a value that is not a number (e.g. text concatenated by mistake)', () => {
    const concatenating = makeCalculator<{ a: number; b: unknown }>({
      slug: 'teste',
      module: 'teste',
      category: 'teste',
      version: 'v1',
      reference: { method: 'teste', citation: 'teste' },
      lifeStages: ['adulto'],
      formula: ({ a, b }) => ({ total_score: (a as number) + (b as number) }),
    });
    expect(() => concatenating.calculate({ a: 0, b: '2' })).toThrow(InvalidResultError);
  });
});

describe('input combinations a method cannot take', () => {
  it('refuses an HDL-c that is not below the total cholesterol', () => {
    expect(() => perfilLipidicoCalculator.calculate({ total_cholesterol_mg_dl: 60, hdl_mg_dl: 60, triglycerides_mg_dl: 100, fasting: true })).toThrow(
      IncompleteInputsError,
    );
  });

  it('leaves the Martin/Hopkins LDL-c out above 800 mg/dL of triglycerides (SBC 2025)', () => {
    const outcome = perfilLipidicoCalculator.calculate({ total_cholesterol_mg_dl: 300, hdl_mg_dl: 40, triglycerides_mg_dl: 801, fasting: true });
    expect(outcome.values).toEqual({ non_hdl_mg_dl: 260 });
  });

  it('picks the Martin/Hopkins factor by the lower bound of each band', () => {
    expect(martinHopkinsFactor(7, 99)).toBe(3.5);
    expect(martinHopkinsFactor(49.9, 99.9)).toBe(3.5);
    expect(martinHopkinsFactor(50, 100)).toBe(3.9);
    expect(martinHopkinsFactor(399, 219)).toBe(6.5);
    expect(martinHopkinsFactor(400, 220)).toBe(6.7);
    expect(martinHopkinsFactor(13975, 500)).toBe(6.7);
  });

  it('asks for the trimester of a pregnant woman (WHO 2024 cutoffs differ by trimester)', () => {
    expect(() => anemiaOmsCalculator.calculate({ age_years: 30, sex: 'female', pregnant: true, hemoglobin_g_dl: 11 })).toThrow(IncompleteInputsError);
  });
});
