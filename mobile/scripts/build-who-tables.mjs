// Converte as tabelas oficiais da OMS (backend/database/data/who/*.txt, sem
// alteração dos pacotes anthro/anthroplus) em JSON compacto embarcado no app,
// para as curvas de crescimento funcionarem 100% offline.
// Uso: node scripts/build-who-tables.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(here, '../../backend/database/data/who');
const TARGET = join(here, '../src/data/who');

// Tabelas por comprimento/estatura usam décimos de cm como chave; as demais, dias ou meses inteiros.
const SCALE = { wflanthro: 10, wfhanthro: 10 };

mkdirSync(TARGET, { recursive: true });

for (const file of readdirSync(SOURCE).filter((name) => name.endsWith('.txt'))) {
  const table = file.replace('.txt', '');
  const scale = SCALE[table] ?? 1;
  const bySex = {};

  for (const line of readFileSync(join(SOURCE, file), 'utf8').split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const [sex, axis, l, m, s] = line.trim().split('\t');
    const key = Math.round(Number(axis) * scale);
    (bySex[sex] ??= []).push([key, Number(l), Number(m), Number(s)]);
  }

  const sexes = {};
  for (const [sex, rows] of Object.entries(bySex)) {
    rows.sort((a, b) => a[0] - b[0]);
    const start = rows[0][0];
    rows.forEach(([key], index) => {
      if (key !== start + index) throw new Error(`${table} (sexo ${sex}): eixo não contínuo em ${key}`);
    });
    sexes[sex] = { start, rows: rows.map(([, l, m, s]) => [l, m, s]) };
  }

  writeFileSync(join(TARGET, `${table}.json`), JSON.stringify({ scale, sexes }));
  console.log(`${table}: ${Object.values(sexes).map((s) => s.rows.length).join(' + ')} linhas`);
}
