import type { Patient } from '../data/models';
import { ageParts } from '../lib/format';
import { lifeStageFromAge } from './calculators/support/lifeStage';
import type { LifeStage } from './calculators/types';
import type { CatalogEntry } from './catalog';

export type ProfileSex = 'female' | 'male';

/** Para quem é o cálculo: faixa etária + sexo. Escolhido uma vez por calculadora e guardado. */
export interface CalculatorProfile {
  stage: LifeStage;
  sex: ProfileSex;
}

export type CalculatorProfiles = Record<string, CalculatorProfile>;

export const STAGES: LifeStage[] = ['crianca', 'adulto', 'idoso'];

/** Mesmos cortes de lifeStageFromAge (OMS até 19 anos; Estatuto do Idoso a partir de 60). */
const STAGE_AGE_RANGE: Record<LifeStage, { min: number; max: number | null }> = {
  crianca: { min: 0, max: 19 },
  adulto: { min: 20, max: 59 },
  idoso: { min: 60, max: null },
};

export function stageAgeRangeLabel(stage: LifeStage): string {
  const { min, max } = STAGE_AGE_RANGE[stage];
  return max === null ? `${min} anos ou mais` : `${min} a ${max} anos`;
}

/** A idade digitada bate com a faixa escolhida no perfil? (só avisa; quem decide é o profissional). */
export function ageMatchesStage(ageYears: number, stage: LifeStage): boolean {
  return lifeStageFromAge(Math.floor(ageYears)) === stage;
}

/** Perfil derivado da ficha: quando há paciente, ele manda. */
export function profileFromPatient(patient: Pick<Patient, 'birth_date' | 'sex'>, at = new Date()): CalculatorProfile {
  return { stage: lifeStageFromAge(ageParts(patient.birth_date, at).years), sex: patient.sex };
}

/**
 * Perfil inicial de uma calculadora ainda não configurada: só a faixa etária
 * pode vir pronta, e apenas quando o método vale para uma única faixa (ex.:
 * curvas da OMS → criança). O sexo sempre é escolhido pelo profissional.
 */
export function initialDraft(entry: Pick<CatalogEntry, 'life_stages'>): Partial<CalculatorProfile> {
  return entry.life_stages.length === 1 ? { stage: entry.life_stages[0] } : {};
}

export function isCompleteProfile(draft: Partial<CalculatorProfile>): draft is CalculatorProfile {
  return draft.stage !== undefined && draft.sex !== undefined;
}

/** Campos do formulário que o perfil já responde — não são mostrados de novo. */
export function fieldsAnsweredByProfile(schema: Record<string, unknown>): string[] {
  return 'sex' in schema ? ['sex'] : [];
}

/** Valores que o perfil injeta no formulário. */
export function profileValues(schema: Record<string, unknown>, profile: CalculatorProfile): Record<string, string> {
  return 'sex' in schema ? { sex: profile.sex } : {};
}
