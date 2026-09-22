import { lifeStageFromAge } from '../support/lifeStage';

describe('lifeStageFromAge', () => {
  it.each([
    [0, 'crianca'],
    [19, 'crianca'],
    [20, 'adulto'],
    [40, 'adulto'],
    [59, 'adulto'],
    [60, 'idoso'],
    [90, 'idoso'],
  ] as const)('age %i resolves to %s', (age, expected) => {
    expect(lifeStageFromAge(age)).toBe(expected);
  });
});
