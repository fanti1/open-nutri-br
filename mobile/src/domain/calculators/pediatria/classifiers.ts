/**
 * Classificações dos escores-Z pediátricos — espelho de
 * backend/app/Domain/Calculators/Pediatria/Classifiers.
 * Reference: Ministério da Saúde, Norma Técnica do SISVAN, 2011 (perímetro
 * cefálico: WHO, Zika virus exposure in utero guideline, 2016).
 */

/** Peso-para-idade (0 a 10 anos). */
export function weightForAgeClassifier(result: Record<string, number>): string {
  const z = result.z_score;
  if (z < -3) return 'muito_baixo_peso_para_idade';
  if (z < -2) return 'baixo_peso_para_idade';
  if (z <= 2) return 'peso_adequado_para_idade';
  return 'peso_elevado_para_idade';
}

/** Comprimento/estatura-para-idade (0 a 19 anos). */
export function heightForAgeClassifier(result: Record<string, number>): string {
  const z = result.z_score;
  if (z < -3) return 'muito_baixa_estatura_para_idade';
  if (z < -2) return 'baixa_estatura_para_idade';
  return 'estatura_adequada_para_idade';
}

/** Peso-para-comprimento/estatura e IMC-para-idade em menores de 5 anos. */
export function underFiveWeightStatusClassifier(result: Record<string, number>): string {
  const z = result.z_score;
  if (z < -3) return 'magreza_acentuada';
  if (z < -2) return 'magreza';
  if (z <= 1) return 'eutrofia';
  if (z <= 2) return 'risco_de_sobrepeso';
  if (z <= 3) return 'sobrepeso';
  return 'obesidade';
}

/** IMC-para-idade de 5 a 19 anos. */
export function schoolAgeBmiClassifier(result: Record<string, number>): string {
  const z = result.z_score;
  if (z < -3) return 'magreza_acentuada';
  if (z < -2) return 'magreza';
  if (z <= 1) return 'eutrofia';
  if (z <= 2) return 'sobrepeso';
  if (z <= 3) return 'obesidade';
  return 'obesidade_grave';
}

/** Perímetro cefálico: microcefalia < −2 DP (grave < −3 DP); macrocefalia > +2 DP. */
export function headCircumferenceClassifier(result: Record<string, number>): string {
  const z = result.z_score;
  if (z < -3) return 'microcefalia_grave';
  if (z < -2) return 'microcefalia';
  if (z <= 2) return 'adequado_para_idade';
  return 'macrocefalia';
}
