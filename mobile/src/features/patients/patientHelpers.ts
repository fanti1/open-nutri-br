import type { Patient } from '../../data/models';
import { lifeStageFromAge } from '../../domain/calculators/support/lifeStage';
import type { LifeStage } from '../../domain/calculators/types';
import { ageParts } from '../../lib/format';

export function patientLifeStage(patient: Pick<Patient, 'birth_date'>): LifeStage {
  return lifeStageFromAge(ageParts(patient.birth_date).years);
}

export function sexLabel(sex: Patient['sex']): string {
  return sex === 'male' ? 'Masculino' : 'Feminino';
}
