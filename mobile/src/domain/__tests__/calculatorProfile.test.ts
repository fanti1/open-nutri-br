import {
  ageMatchesStage,
  fieldsAnsweredByProfile,
  initialDraft,
  isCompleteProfile,
  profileFromPatient,
  profileValues,
  stageAgeRangeLabel,
} from '../calculatorProfile';

describe('calculator profile', () => {
  it('pre-selects the life stage only when the method has a single one — sex is always chosen', () => {
    expect(initialDraft({ life_stages: ['crianca'] })).toEqual({ stage: 'crianca' });
    expect(initialDraft({ life_stages: ['adulto', 'idoso'] })).toEqual({});
    expect(isCompleteProfile({ stage: 'crianca' })).toBe(false);
    expect(isCompleteProfile({ stage: 'crianca', sex: 'male' })).toBe(true);
  });

  it('answers the sex field of methods that ask for it, and nothing else', () => {
    const profile = { stage: 'adulto' as const, sex: 'female' as const };

    expect(profileValues({ weight_kg: [], sex: [] }, profile)).toEqual({ sex: 'female' });
    expect(fieldsAnsweredByProfile({ weight_kg: [], sex: [] })).toEqual(['sex']);
    expect(profileValues({ weight_kg: [], height_m: [] }, profile)).toEqual({});
    expect(fieldsAnsweredByProfile({ weight_kg: [] })).toEqual([]);
  });

  it('derives the profile from the patient record', () => {
    const at = new Date('2026-09-23T12:00:00');
    expect(profileFromPatient({ birth_date: '1950-01-01', sex: 'male' }, at)).toEqual({ stage: 'idoso', sex: 'male' });
    expect(profileFromPatient({ birth_date: '2018-05-01', sex: 'female' }, at)).toEqual({ stage: 'crianca', sex: 'female' });
  });

  it('checks a typed age against the chosen life stage', () => {
    expect(ageMatchesStage(45, 'adulto')).toBe(true);
    expect(ageMatchesStage(65, 'adulto')).toBe(false);
    expect(ageMatchesStage(19.5, 'crianca')).toBe(true);
    expect(stageAgeRangeLabel('adulto')).toBe('20 a 59 anos');
    expect(stageAgeRangeLabel('idoso')).toBe('60 anos ou mais');
  });
});
