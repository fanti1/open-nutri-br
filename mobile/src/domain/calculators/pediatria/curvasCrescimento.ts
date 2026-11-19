import {
  ageInDays,
  exactLms,
  interpolatedLms,
  OutOfReferenceRangeError,
  standardizedLength,
  STANDING_FROM_DAYS,
  whoSex,
  zScore,
  zScoreAdjusted,
  type Lms,
  type WhoTableName,
} from '../../growth/growth';
import { makeCalculator } from '../support/makeCalculator';
import { round2 } from '../support/round';
import type { Calculator, Classifier, LifeStage } from '../types';
import {
  headCircumferenceClassifier,
  heightForAgeClassifier,
  schoolAgeBmiClassifier,
  underFiveWeightStatusClassifier,
  weightForAgeClassifier,
} from './classifiers';

/**
 * Curvas de crescimento da OMS com escore-Z e classificação SISVAN — espelho
 * de backend/app/Domain/Calculators/Pediatria, calculadas no aparelho com as
 * tabelas oficiais embarcadas.
 */

export interface PediatricInputs {
  age_months: number;
  sex: 'male' | 'female';
  weight_kg?: number;
  length_cm?: number;
  height_cm?: number;
  head_circumference_cm?: number;
  measurement_position?: 'deitado' | 'em_pe';
}

const CHILD: LifeStage[] = ['crianca'];
const SISVAN = 'classificação: Ministério da Saúde, Norma Técnica do SISVAN, 2011.';
const WHO_2006 = 'WHO Multicentre Growth Reference Study Group, WHO Child Growth Standards, 2006';
const WHO_2007 = 'de Onis M et al., Development of a WHO growth reference for school-aged children and adolescents, Bull World Health Organ, 2007';

export function lengthOf(inputs: PediatricInputs): number {
  return standardizedLength(inputs.length_cm!, inputs.measurement_position!, inputs.age_months);
}

function zResult(y: number, lms: Lms, restricted: boolean): Record<string, number> {
  return {
    z_score: round2(restricted ? zScoreAdjusted(y, lms) : zScore(y, lms)),
    measure: round2(y),
    reference_median: round2(lms.m),
  };
}

/** Indicador-por-idade dos Padrões OMS 2006 (0 a < 60 meses): idade em dias, linha exata. */
function who2006ByAge(table: WhoTableName, restricted: boolean, measure: (i: PediatricInputs) => number) {
  return (inputs: PediatricInputs): Record<string, number> => {
    if (inputs.age_months >= 60) {
      throw new OutOfReferenceRangeError('Os Padrões de Crescimento OMS 2006 cobrem de 0 a 59 meses. Use a referência OMS 2007 (5 a 19 anos).');
    }
    const lms = exactLms(table, whoSex(inputs.sex), ageInDays(inputs.age_months));
    if (!lms) throw new OutOfReferenceRangeError('Idade fora da faixa da curva de referência.');
    return zResult(measure(inputs), lms, restricted);
  };
}

/**
 * Referência OMS 2007 (5 a 19 anos): idade em meses com interpolação entre meses inteiros.
 * `lastRowUntilExclusive`: até essa idade (meses) a última linha da tabela continua
 * valendo — a Norma Técnica do SISVAN (2011, Quadro 13) manda avaliar de 19 anos e 1 mês
 * a 19 anos e 11 meses com os valores de 19 anos completos.
 */
function who2007ByAge(
  table: WhoTableName,
  restricted: boolean,
  maxMonthsExclusive: number,
  measure: (i: PediatricInputs) => number,
  lastRowUntilExclusive?: number,
) {
  return (inputs: PediatricInputs): Record<string, number> => {
    const upperExclusive = lastRowUntilExclusive ?? maxMonthsExclusive;
    if (inputs.age_months < 60 || inputs.age_months >= upperExclusive) {
      throw new OutOfReferenceRangeError(`Esta curva da Referência OMS 2007 cobre de 60 a ${upperExclusive - 1} meses.`);
    }
    const lookupAge = lastRowUntilExclusive !== undefined ? Math.min(inputs.age_months, maxMonthsExclusive - 1) : inputs.age_months;
    const lms = interpolatedLms(table, whoSex(inputs.sex), lookupAge, 1);
    if (!lms) throw new OutOfReferenceRangeError('Idade fora da faixa da curva de referência.');
    return zResult(measure(inputs), lms, restricted);
  };
}

/** Peso-para-comprimento (< 731 dias, 45–110 cm) ou peso-para-estatura (≥ 731 dias, 65–120 cm). */
export function weightForLengthLms(inputs: PediatricInputs): Lms {
  const length = lengthOf(inputs);
  const lying = ageInDays(inputs.age_months) < STANDING_FROM_DAYS;
  const [table, min, max]: [WhoTableName, number, number] = lying ? ['wflanthro', 45, 110] : ['wfhanthro', 65, 120];

  if (length < min || length > max) {
    throw new OutOfReferenceRangeError(`A curva peso-para-${lying ? 'comprimento' : 'estatura'} da OMS cobre de ${min} a ${max} cm.`);
  }

  const lms = interpolatedLms(table, whoSex(inputs.sex), length, 10);
  if (!lms) throw new OutOfReferenceRangeError('Medida fora da faixa da curva de referência.');
  return lms;
}

function growthCalculator(
  slug: string,
  method: string,
  citation: string,
  formula: (inputs: PediatricInputs) => Record<string, number>,
  classifier: Classifier<PediatricInputs>,
  category = 'curvas_crescimento',
): Calculator<PediatricInputs> {
  return makeCalculator<PediatricInputs>({
    slug,
    module: 'pediatria',
    category,
    version: 'v1',
    reference: { method, citation },
    lifeStages: CHILD,
    formula,
    classifier,
  });
}

export const pesoIdade0a5Calculator = growthCalculator(
  'oms-peso-idade-0-5',
  'Peso-para-idade (escore-Z, Padrões OMS 2006)',
  `${WHO_2006}; ${SISVAN}`,
  who2006ByAge('weianthro', true, (i) => i.weight_kg!),
  weightForAgeClassifier,
);

export const comprimentoIdade0a5Calculator = growthCalculator(
  'oms-comprimento-idade-0-5',
  'Comprimento/estatura-para-idade (escore-Z, Padrões OMS 2006)',
  `${WHO_2006}; ${SISVAN}`,
  who2006ByAge('lenanthro', false, lengthOf),
  heightForAgeClassifier,
);

export const imcIdade0a5Calculator = growthCalculator(
  'oms-imc-idade-0-5',
  'IMC-para-idade (escore-Z, Padrões OMS 2006)',
  `${WHO_2006}; ${SISVAN}`,
  who2006ByAge('bmianthro', true, (i) => i.weight_kg! / (lengthOf(i) / 100) ** 2),
  underFiveWeightStatusClassifier,
);

export const perimetroCefalico0a5Calculator = growthCalculator(
  'oms-perimetro-cefalico-0-5',
  'Perímetro cefálico-para-idade (escore-Z, Padrões OMS 2006)',
  'WHO Multicentre Growth Reference Study Group, WHO Child Growth Standards: head circumference-for-age, 2007; classificação: WHO, Zika virus exposure in utero guideline, 2016.',
  who2006ByAge('hcanthro', false, (i) => i.head_circumference_cm!),
  headCircumferenceClassifier,
);

export const pesoComprimento0a5Calculator = growthCalculator(
  'oms-peso-comprimento-0-5',
  'Peso-para-comprimento/estatura (escore-Z, Padrões OMS 2006)',
  `${WHO_2006}; ${SISVAN}`,
  (inputs) => {
    if (inputs.age_months >= 60) {
      throw new OutOfReferenceRangeError('Peso-para-comprimento/estatura da OMS se aplica a menores de 60 meses.');
    }
    return zResult(inputs.weight_kg!, weightForLengthLms(inputs), true);
  },
  underFiveWeightStatusClassifier,
);

export const imcIdade5a19Calculator = growthCalculator(
  'oms-imc-idade-5-19',
  'IMC-para-idade (escore-Z, Referência OMS 2007)',
  `${WHO_2007}; classificação e extensão até 19 anos e 11 meses: Ministério da Saúde, Norma Técnica do SISVAN, 2011 (Quadro 13).`,
  who2007ByAge('bfawho2007', true, 229, (i) => i.weight_kg! / (i.height_cm! / 100) ** 2, 240),
  schoolAgeBmiClassifier,
);

export const estaturaIdade5a19Calculator = growthCalculator(
  'oms-estatura-idade-5-19',
  'Estatura-para-idade (escore-Z, Referência OMS 2007)',
  `${WHO_2007}; ${SISVAN}`,
  who2007ByAge('hfawho2007', false, 229, (i) => i.height_cm!),
  heightForAgeClassifier,
);

export const pesoIdade5a10Calculator = growthCalculator(
  'oms-peso-idade-5-10',
  'Peso-para-idade (escore-Z, Referência OMS 2007, 5–10 anos)',
  `${WHO_2007}; ${SISVAN}`,
  who2007ByAge('wfawho2007', true, 121, (i) => i.weight_kg!),
  weightForAgeClassifier,
);

/** ≥ 90% sem desnutrição; 75–89,9% 1º grau; 60–74,9% 2º grau; < 60% 3º grau. Gómez et al., 1956. */
export const gomezCalculator = growthCalculator(
  'gomez',
  'Classificação de Gomez (% de adequação peso/idade)',
  'Gómez F et al., Mortality in second and third degree malnutrition, J Trop Pediatr, 1956; mediana de referência: WHO Child Growth Standards, 2006.',
  (inputs) => {
    const lms = inputs.age_months < 60 ? exactLms('weianthro', whoSex(inputs.sex), ageInDays(inputs.age_months)) : null;
    if (!lms) throw new OutOfReferenceRangeError('A classificação de Gomez com mediana OMS 2006 se aplica de 0 a 59 meses.');
    return { percent_of_median: round2((inputs.weight_kg! / lms.m) * 100), reference_median: round2(lms.m) };
  },
  (result) => {
    const percent = result.percent_of_median;
    if (percent >= 90) return 'sem_desnutricao';
    if (percent >= 75) return 'desnutricao_primeiro_grau';
    if (percent >= 60) return 'desnutricao_segundo_grau';
    return 'desnutricao_terceiro_grau';
  },
  'classificacao_nutricional',
);

/** Peso/estatura (corte 90%) × estatura/idade (corte 95%). Waterlow, BMJ, 1972. */
export const waterlowCalculator = growthCalculator(
  'waterlow',
  'Classificação de Waterlow (déficit atual × crônico)',
  'Waterlow JC, Classification and definition of protein-calorie malnutrition, BMJ, 1972; medianas de referência: WHO Child Growth Standards, 2006.',
  (inputs) => {
    if (inputs.age_months >= 60) {
      throw new OutOfReferenceRangeError('A classificação de Waterlow com medianas OMS 2006 se aplica de 0 a 59 meses.');
    }
    const heightForAge = exactLms('lenanthro', whoSex(inputs.sex), ageInDays(inputs.age_months));
    if (!heightForAge) throw new OutOfReferenceRangeError('Idade fora da faixa da curva de referência.');
    const weightForHeight = weightForLengthLms(inputs);
    return {
      weight_for_height_percent: round2((inputs.weight_kg! / weightForHeight.m) * 100),
      height_for_age_percent: round2((lengthOf(inputs) / heightForAge.m) * 100),
    };
  },
  (result) => {
    const wastedNow = result.weight_for_height_percent < 90;
    const stunted = result.height_for_age_percent < 95;
    if (!wastedNow && !stunted) return 'eutrofia';
    if (wastedNow && !stunted) return 'desnutricao_atual';
    if (wastedNow && stunted) return 'desnutricao_cronica';
    return 'desnutricao_pregressa';
  },
  'classificacao_nutricional',
);
