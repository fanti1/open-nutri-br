import type { LifeStage } from '../types';

const ELDERLY_MIN_AGE = 60;
const CHILD_MAX_AGE = 19;

/**
 * Mirrors backend LifeStageResolver::fromAge — buckets a patient's age into
 * crianca/adulto/idoso using the same cutoffs (WHO Growth Reference up to 19;
 * Estatuto do Idoso, Lei 10.741/2003, from 60), so the app can narrow the
 * calculator list to what applies to that specific patient.
 */
export function lifeStageFromAge(ageYears: number): LifeStage {
  if (ageYears <= CHILD_MAX_AGE) return 'crianca';
  if (ageYears >= ELDERLY_MIN_AGE) return 'idoso';

  return 'adulto';
}

export const LIFE_STAGE_LABELS: Record<LifeStage, string> = {
  crianca: 'Criança/Adolescente',
  adulto: 'Adulto',
  idoso: 'Idoso',
};

/** Para controles estreitos (seletor de faixa etária). */
export const LIFE_STAGE_SHORT_LABELS: Record<LifeStage, string> = {
  crianca: 'Criança',
  adulto: 'Adulto',
  idoso: 'Idoso',
};

export const LIFE_STAGE_PLURAL: Record<LifeStage, string> = {
  crianca: 'crianças e adolescentes',
  adulto: 'adultos',
  idoso: 'idosos',
};
