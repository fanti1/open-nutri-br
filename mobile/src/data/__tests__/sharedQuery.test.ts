import { notifyChange } from '../changes';
import { createSharedQuery } from '../sharedQuery';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createSharedQuery', () => {
  it('loads once on connect and reloads once per change of a watched table', async () => {
    let calls = 0;
    const query = createSharedQuery<number>(['settings']);
    await query.connect(async () => ++calls);
    expect(calls).toBe(1);

    notifyChange('patients');
    await flush();
    expect(calls).toBe(1);

    notifyChange('settings', 'favorites');
    await flush();
    expect(calls).toBe(2);
  });

  it('keeps only the newest result when reloads overlap', async () => {
    const resolvers: ((value: string) => void)[] = [];
    const query = createSharedQuery<string>(['favorites']);
    const first = query.connect(() => new Promise<string>((resolve) => resolvers.push(resolve)));
    notifyChange('favorites');

    resolvers[1]('nova');
    resolvers[0]('antiga');
    await first;
    await flush();

    expect(query.current()).toEqual({ data: 'nova', loading: false, error: null });
  });

  it('keeps the last value and reports the error when a reload fails', async () => {
    let fail = false;
    const query = createSharedQuery<string>(['tasks']);
    await query.connect(async () => {
      if (fail) throw new Error('banco ocupado');
      return 'ok';
    });

    fail = true;
    notifyChange('tasks');
    await flush();
    expect(query.current()).toMatchObject({ data: 'ok', loading: false, error: new Error('banco ocupado') });
  });
});
